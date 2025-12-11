package ai

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/account"
	"github.com/gilabs/crm-healthcare/api/internal/domain/activity"
	"github.com/gilabs/crm-healthcare/api/internal/domain/ai"
	"github.com/gilabs/crm-healthcare/api/internal/domain/ai_settings"
	"github.com/gilabs/crm-healthcare/api/internal/domain/contact"
	"github.com/gilabs/crm-healthcare/api/internal/domain/lead"
	"github.com/gilabs/crm-healthcare/api/internal/domain/permission"
	"github.com/gilabs/crm-healthcare/api/internal/domain/pipeline"
	"github.com/gilabs/crm-healthcare/api/internal/domain/task"
	"github.com/gilabs/crm-healthcare/api/internal/domain/visit_report"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"github.com/gilabs/crm-healthcare/api/pkg/cerebras"
)

var (
	ErrAPINotConfigured = errors.New("Cerebras API key is not configured")
	ErrAPIKeyEmpty      = errors.New("Cerebras API key is empty")
)

// Service represents AI service
type Service struct {
	cerebrasClient   *cerebras.Client
	visitReportRepo  interfaces.VisitReportRepository
	accountRepo      interfaces.AccountRepository
	contactRepo      interfaces.ContactRepository
	dealRepo         interfaces.DealRepository
	leadRepo         interfaces.LeadRepository
	activityRepo     interfaces.ActivityRepository
	taskRepo         interfaces.TaskRepository
	pipelineRepo     interfaces.PipelineRepository
	settingsRepo     interfaces.AISettingsRepository
	permissionRepo   interfaces.PermissionRepository
	apiKey           string
}

// NewService creates a new AI service
func NewService(
	cerebrasClient *cerebras.Client,
	visitReportRepo interfaces.VisitReportRepository,
	accountRepo interfaces.AccountRepository,
	contactRepo interfaces.ContactRepository,
	dealRepo interfaces.DealRepository,
	leadRepo interfaces.LeadRepository,
	activityRepo interfaces.ActivityRepository,
	taskRepo interfaces.TaskRepository,
	pipelineRepo interfaces.PipelineRepository,
	settingsRepo interfaces.AISettingsRepository,
	permissionRepo interfaces.PermissionRepository,
	apiKey string,
) *Service {
	return &Service{
		cerebrasClient:   cerebrasClient,
		visitReportRepo: visitReportRepo,
		accountRepo:     accountRepo,
		contactRepo:     contactRepo,
		dealRepo:        dealRepo,
		leadRepo:        leadRepo,
		activityRepo:    activityRepo,
		taskRepo:        taskRepo,
		pipelineRepo:    pipelineRepo,
		settingsRepo:    settingsRepo,
		permissionRepo:  permissionRepo,
		apiKey:          apiKey,
	}
}

// validateAPIKey checks if API key is configured
func (s *Service) validateAPIKey() error {
	if s.apiKey == "" {
		return ErrAPIKeyEmpty
	}
	return nil
}

// AnalyzeVisitReport analyzes visit report and returns AI insights
func (s *Service) AnalyzeVisitReport(visitReportID string) (*ai.VisitReportInsight, int, error) {
	// Get visit report
	visitReport, err := s.visitReportRepo.FindByID(visitReportID)
	if err != nil {
		return nil, 0, fmt.Errorf("visit report not found: %w", err)
	}

	// Get account (if AccountID is provided)
	var accountEntity *account.Account
	if visitReport.AccountID != nil && *visitReport.AccountID != "" {
		acc, err := s.accountRepo.FindByID(*visitReport.AccountID)
		if err != nil {
			return nil, 0, fmt.Errorf("account not found: %w", err)
		}
		accountEntity = acc
	}

	// Get contact if exists
	var contactName string
	if visitReport.ContactID != nil {
		contact, err := s.contactRepo.FindByID(*visitReport.ContactID)
		if err == nil {
			contactName = contact.Name
		}
	}

	// Get recent activities for context (if AccountID is provided)
	var activities []activity.Activity
	if visitReport.AccountID != nil && *visitReport.AccountID != "" {
		activities, _ = s.activityRepo.FindByAccountID(*visitReport.AccountID)
	}
	// Limit to 5 most recent
	if len(activities) > 5 {
		activities = activities[:5]
	}

	// Validate API key
	if err := s.validateAPIKey(); err != nil {
		return nil, 0, fmt.Errorf("AI service not configured: %w", err)
	}

	// Build context for AI
	context := BuildVisitReportContext(visitReport, accountEntity, contactName, activities)

	// Build prompt
	prompt := BuildVisitReportPrompt(context)

	// Call Cerebras API
	response, err := s.cerebrasClient.Generate(&cerebras.GenerateRequest{
		Prompt:      prompt,
		MaxTokens:   800,
		Temperature: 0.7,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("failed to generate insight: %w", err)
	}

	// Parse AI response
	insight, err := s.parseVisitReportInsight(response.Text)
	if err != nil {
		// If parsing fails, return raw response as summary
		insight = &ai.VisitReportInsight{
			Summary:     response.Text,
			ActionItems: []string{},
			Sentiment:   "neutral",
			KeyPoints:   []string{},
			Recommendations: []string{},
		}
	}

	return insight, response.Tokens, nil
}

// checkDataPrivacy checks if data type is allowed based on settings AND user permissions
// First checks data privacy settings (global), then checks user's role-based permissions
func (s *Service) checkDataPrivacy(dataType string, userID string) (bool, error) {
	settings, err := s.settingsRepo.GetSettings()
	if err != nil {
		return true, nil // Default to allow if settings not found
	}

	if !settings.Enabled {
		return false, fmt.Errorf("AI service is disabled")
	}

	// Parse data privacy settings
	var dataPrivacy ai_settings.DataPrivacySettings
	if settings.DataPrivacy != nil {
		if err := json.Unmarshal(settings.DataPrivacy, &dataPrivacy); err != nil {
			return true, nil // Default to allow if parsing fails
		}
	} else {
		// Default: allow all
		dataPrivacy = ai_settings.DataPrivacySettings{
			AllowVisitReports: true,
			AllowAccounts:     true,
			AllowContacts:     true,
			AllowDeals:        true,
			AllowLeads:        true,
			AllowActivities:   true,
			AllowTasks:        true,
			AllowProducts:     true,
		}
	}

	// Check data privacy setting first (global setting)
	var privacyAllowed bool
	switch dataType {
	case "visit_report":
		privacyAllowed = dataPrivacy.AllowVisitReports
	case "account":
		privacyAllowed = dataPrivacy.AllowAccounts
	case "contact":
		privacyAllowed = dataPrivacy.AllowContacts
	case "deal":
		privacyAllowed = dataPrivacy.AllowDeals
	case "lead":
		privacyAllowed = dataPrivacy.AllowLeads
	case "activity":
		privacyAllowed = dataPrivacy.AllowActivities
	case "task":
		privacyAllowed = dataPrivacy.AllowTasks
	case "product":
		privacyAllowed = dataPrivacy.AllowProducts
	default:
		privacyAllowed = true // Default to allow for unknown types
	}

	// If data privacy setting disallows, return false immediately
	if !privacyAllowed {
		return false, nil
	}

	// Now check user's role-based permissions
	// Get user permissions
	userPerms, err := s.permissionRepo.GetUserPermissions(userID)
	if err != nil {
		// If we can't get permissions, default to deny for security
		return false, fmt.Errorf("failed to get user permissions: %w", err)
	}

	// Check if user has permission to view the specific data type
	// Map data types to permission codes
	var requiredPermissionCode string
	switch dataType {
	case "visit_report":
		// Visit Reports might not have specific permission, check if user is admin or has Sales CRM access
		// For now, if user is admin, allow. Otherwise, check for VIEW_SALES_CRM or VIEW_VISIT_REPORTS
		if s.isUserAdmin(userID) {
			return true, nil
		}
		// Check for Sales CRM view permission (visit reports are under Sales CRM)
		if s.hasUserPermission(userPerms, "VIEW_SALES_CRM") {
			return true, nil
		}
		// Fallback: deny if no permission
		return false, nil
	case "account":
		requiredPermissionCode = "VIEW_ACCOUNTS"
	case "contact":
		requiredPermissionCode = "VIEW_CONTACTS"
	case "deal":
		requiredPermissionCode = "VIEW_PIPELINE" // Deals are part of pipeline
	case "lead":
		requiredPermissionCode = "VIEW_LEADS"
	case "activity":
		// Activities might not have specific permission, check if user is admin or has Sales CRM access
		if s.isUserAdmin(userID) {
			return true, nil
		}
		// Check for Sales CRM view permission (activities are related to Sales CRM)
		if s.hasUserPermission(userPerms, "VIEW_SALES_CRM") {
			return true, nil
		}
		// Fallback: deny if no permission
		return false, nil
	case "task":
		requiredPermissionCode = "VIEW_TASKS"
	case "product":
		requiredPermissionCode = "VIEW_PRODUCTS"
	default:
		// For unknown types, if privacy allows, check if user is admin
		return s.isUserAdmin(userID), nil
	}

	// Check if user has the required permission
	hasPermission := s.hasUserPermission(userPerms, requiredPermissionCode)
	return hasPermission, nil
}

// isUserAdmin checks if user is admin by checking if they have all permissions
// Admin users have all permissions, so we check if they have a permission that only admin has
func (s *Service) isUserAdmin(userID string) bool {
	userPerms, err := s.permissionRepo.GetUserPermissions(userID)
	if err != nil {
		return false
	}
	
	// Check if user has VIEW_AI_SETTINGS permission (admin only)
	return s.hasUserPermission(userPerms, "VIEW_AI_SETTINGS")
}

// hasUserPermission checks if user has a specific permission code
func (s *Service) hasUserPermission(userPerms *permission.GetUserPermissionsResponse, permissionCode string) bool {
	// Helper function to search permissions recursively
	var searchPermission func(menus []permission.MenuWithActionsResponse, code string) bool
	searchPermission = func(menus []permission.MenuWithActionsResponse, code string) bool {
		for _, menu := range menus {
			for _, action := range menu.Actions {
				if action.Code == code && action.Access {
					return true
				}
			}
			// Recursively search children
			if len(menu.Children) > 0 {
				if searchPermission(menu.Children, code) {
					return true
				}
			}
		}
		return false
	}
	
	return searchPermission(userPerms.Menus, permissionCode)
}

// Chat handles chat conversation with AI
// userID is required to check user permissions for data access
func (s *Service) Chat(message string, contextID string, contextType string, conversationHistory []ai.ChatMessage, model string, userID string) (*ai.ChatResponse, error) {
	// Get AI settings
	settings, err := s.settingsRepo.GetSettings()
	if err != nil {
		return nil, fmt.Errorf("failed to get AI settings: %w", err)
	}

	if !settings.Enabled {
		return nil, fmt.Errorf("AI service is disabled")
	}

	// Use model from request or settings
	selectedModel := model
	if selectedModel == "" {
		selectedModel = settings.Model
	}

	// Get API key from settings or fallback to env
	apiKey := settings.APIKey
	if apiKey == "" {
		apiKey = s.apiKey // Fallback to env
	}

	if apiKey == "" {
		return nil, fmt.Errorf("AI service not configured: API key is empty")
	}

	// Handle specific query about data privacy settings
	messageLower := strings.ToLower(message)
	if strings.Contains(messageLower, "data privacy") || strings.Contains(messageLower, "privacy") || 
	   strings.Contains(messageLower, "data privasi") || strings.Contains(messageLower, "privasi") ||
	   strings.Contains(messageLower, "akses data") || strings.Contains(messageLower, "data yang bisa") {
		// Get data privacy settings
		var dataPrivacy ai_settings.DataPrivacySettings
		
		if settings.DataPrivacy != nil {
			if err := json.Unmarshal(settings.DataPrivacy, &dataPrivacy); err == nil {
				privacyInfo := fmt.Sprintf("**PENGATURAN DATA PRIVACY:**\n\n")
				privacyInfo += fmt.Sprintf("Akses ke data berikut diizinkan:\n\n")
				if dataPrivacy.AllowAccounts {
					privacyInfo += "✓ **Accounts** (Akun/Fasilitas Kesehatan)\n"
				} else {
					privacyInfo += "✗ **Accounts** (Akun/Fasilitas Kesehatan) - TIDAK diizinkan\n"
				}
				if dataPrivacy.AllowContacts {
					privacyInfo += "✓ **Contacts** (Kontak/Dokter/Apoteker)\n"
				} else {
					privacyInfo += "✗ **Contacts** (Kontak/Dokter/Apoteker) - TIDAK diizinkan\n"
				}
				if dataPrivacy.AllowDeals {
					privacyInfo += "✓ **Deals/Pipeline** (Kesempatan Penjualan)\n"
				} else {
					privacyInfo += "✗ **Deals/Pipeline** (Kesempatan Penjualan) - TIDAK diizinkan\n"
				}
				if dataPrivacy.AllowVisitReports {
					privacyInfo += "✓ **Visit Reports** (Laporan Kunjungan)\n"
				} else {
					privacyInfo += "✗ **Visit Reports** (Laporan Kunjungan) - TIDAK diizinkan\n"
				}
				if dataPrivacy.AllowActivities {
					privacyInfo += "✓ **Activities** (Aktivitas)\n"
				} else {
					privacyInfo += "✗ **Activities** (Aktivitas) - TIDAK diizinkan\n"
				}
				if dataPrivacy.AllowTasks {
					privacyInfo += "✓ **Tasks** (Tugas)\n"
				} else {
					privacyInfo += "✗ **Tasks** (Tugas) - TIDAK diizinkan\n"
				}
				if dataPrivacy.AllowProducts {
					privacyInfo += "✓ **Products** (Produk)\n"
				} else {
					privacyInfo += "✗ **Products** (Produk) - TIDAK diizinkan\n"
				}
				
				// Return direct response about data privacy settings
				return &ai.ChatResponse{
					Message: privacyInfo + "\n\nIni adalah pengaturan data privacy yang saat ini aktif di sistem. Anda dapat mengubah pengaturan ini melalui halaman AI Settings.",
					Tokens:  0, // No tokens consumed for this internal response
				}, nil
			}
		}
		
		// Use default settings (all allowed) if DataPrivacy is nil
		privacyInfo := fmt.Sprintf("**PENGATURAN DATA PRIVACY:**\n\n")
		privacyInfo += fmt.Sprintf("Pengaturan data privacy belum dikonfigurasi. Secara default, semua jenis data dapat diakses:\n\n")
		privacyInfo += "✓ **Accounts** (Akun/Fasilitas Kesehatan)\n"
		privacyInfo += "✓ **Contacts** (Kontak/Dokter/Apoteker)\n"
		privacyInfo += "✓ **Deals/Pipeline** (Kesempatan Penjualan)\n"
		privacyInfo += "✓ **Visit Reports** (Laporan Kunjungan)\n"
		privacyInfo += "✓ **Activities** (Aktivitas)\n"
		privacyInfo += "✓ **Tasks** (Tugas)\n"
		privacyInfo += "✓ **Products** (Produk)\n"
		
		return &ai.ChatResponse{
			Message: privacyInfo + "\n\nAnda dapat mengatur data privacy melalui halaman AI Settings untuk membatasi akses ke jenis data tertentu.",
			Tokens:  0,
		}, nil
	}

	// Load context data if provided
	var contextData string
	var dataAccessInfo string
	
	if contextID != "" && contextType != "" {
		// Load specific context data
		switch contextType {
		case "visit_report":
			visitReport, err := s.visitReportRepo.FindByID(contextID)
			if err == nil {
				visitReportJSON, _ := json.Marshal(visitReport)
				contextData = string(visitReportJSON)
			} else {
				dataAccessInfo = "⚠️ Tidak dapat mengakses data visit report dengan ID tersebut. Data mungkin tidak ditemukan atau tidak memiliki akses."
			}
		case "deal":
			deal, err := s.dealRepo.FindByID(contextID)
			if err == nil {
				dealJSON, _ := json.Marshal(deal)
				contextData = string(dealJSON)
			} else {
				dataAccessInfo = "⚠️ Tidak dapat mengakses data deal dengan ID tersebut. Data mungkin tidak ditemukan atau tidak memiliki akses."
			}
		case "contact":
			contact, err := s.contactRepo.FindByID(contextID)
			if err == nil {
				contactJSON, _ := json.Marshal(contact)
				contextData = string(contactJSON)
			} else {
				dataAccessInfo = "⚠️ Tidak dapat mengakses data contact dengan ID tersebut. Data mungkin tidak ditemukan atau tidak memiliki akses."
			}
		case "account":
			account, err := s.accountRepo.FindByID(contextID)
			if err == nil {
				accountJSON, _ := json.Marshal(account)
				contextData = string(accountJSON)
			} else {
				dataAccessInfo = "⚠️ Tidak dapat mengakses data account dengan ID tersebut. Data mungkin tidak ditemukan atau tidak memiliki akses."
			}
		case "lead":
			lead, err := s.leadRepo.FindByID(contextID)
			if err == nil {
				leadJSON, _ := json.Marshal(lead)
				contextData = string(leadJSON)
			} else {
				dataAccessInfo = "⚠️ Tidak dapat mengakses data lead dengan ID tersebut. Data mungkin tidak ditemukan atau tidak memiliki akses."
			}
		}
	} else {
		// Try to extract data from user message - ALWAYS try to get data
		messageLower := strings.ToLower(message)
		
		// Check for analytics/statistics queries (HIGHEST PRIORITY - needs all deals data)
		// These queries require comprehensive deals data for calculations
		isAnalyticsQuery := strings.Contains(messageLower, "conversion rate") || 
		                   strings.Contains(messageLower, "conversion") ||
		                   strings.Contains(messageLower, "rate konversi") ||
		                   strings.Contains(messageLower, "statistik") ||
		                   strings.Contains(messageLower, "statistics") ||
		                   strings.Contains(messageLower, "analisis") ||
		                   strings.Contains(messageLower, "analysis") ||
		                   strings.Contains(messageLower, "rata-rata") ||
		                   strings.Contains(messageLower, "average") ||
		                   strings.Contains(messageLower, "trend") ||
		                   strings.Contains(messageLower, "perbandingan") ||
		                   strings.Contains(messageLower, "comparison") ||
		                   strings.Contains(messageLower, "breakdown") ||
		                   (strings.Contains(messageLower, "berapa") && (strings.Contains(messageLower, "lead") || strings.Contains(messageLower, "closed won") || strings.Contains(messageLower, "closed lost")))
		
		if isAnalyticsQuery {
			// Check data privacy and user permissions
			allowed, _ := s.checkDataPrivacy("deal", userID)
			if !allowed {
				dataAccessInfo = "⚠️ Akses ke data deals/pipeline tidak diizinkan berdasarkan pengaturan privasi data atau permission yang Anda miliki."
			} else {
				// For analytics queries, fetch ALL deals (or at least a large sample) without stage filter
				// This allows AI to calculate conversion rates, averages, etc.
				req := &pipeline.ListDealsRequest{
					Page:    1,
					PerPage: 100, // Fetch more deals for analytics
				}
				
				deals, _, err := s.dealRepo.List(req)
				if err == nil && len(deals) > 0 {
					// For analytics, limit to 50 deals max to prevent token overflow
					maxDeals := 50
					if len(deals) > maxDeals {
						deals = deals[:maxDeals]
					}
					
					// Transform deals to user-friendly format with names
					dealsFormatted := s.formatDealsForAI(deals)
					dealsJSON, _ := json.Marshal(dealsFormatted)
					
					// Build concise instruction for analytics
					instruction := fmt.Sprintf("REAL DEALS DATA (%d deals for analytics):\n%s\n\nCalculate statistics using ONLY this data. Present results clearly with actual numbers.", len(deals), string(dealsJSON))
					contextData = instruction
					contextType = "deal"
				} else {
					dataAccessInfo = "⚠️ Tidak dapat mengakses data pipeline/deals dari database untuk perhitungan statistik. Data mungkin tidak tersedia."
				}
			}
		}
		
		// Check priority: pipeline/deals first (more specific), then accounts
		// Check if user is asking for pipeline/deals/sales funnel (HIGHEST PRIORITY)
		if contextData == "" && (strings.Contains(messageLower, "pipeline") || strings.Contains(messageLower, "sales funnel") || 
		   strings.Contains(messageLower, "funnel") || strings.Contains(messageLower, "deal") ||
		   strings.Contains(messageLower, "opportunity") || strings.Contains(messageLower, "kesempatan")) {
			// Check data privacy and user permissions
			allowed, _ := s.checkDataPrivacy("deal", userID)
			if !allowed {
				dataAccessInfo = "⚠️ Akses ke data deals/pipeline tidak diizinkan berdasarkan pengaturan privasi data atau permission yang Anda miliki."
			} else {
				// Build request with optional stage filter
				req := &pipeline.ListDealsRequest{
					Page:    1,
					PerPage: 20,
				}
				
				// Extract stage filter from message if mentioned
				var stageID string
				if strings.Contains(messageLower, "lead") {
					if stage, err := s.pipelineRepo.FindStageByCode("lead"); err == nil {
						stageID = stage.ID
					}
				} else if strings.Contains(messageLower, "qualification") {
					if stage, err := s.pipelineRepo.FindStageByCode("qualification"); err == nil {
						stageID = stage.ID
					}
				} else if strings.Contains(messageLower, "proposal") {
					if stage, err := s.pipelineRepo.FindStageByCode("proposal"); err == nil {
						stageID = stage.ID
					}
				} else if strings.Contains(messageLower, "negotiation") {
					if stage, err := s.pipelineRepo.FindStageByCode("negotiation"); err == nil {
						stageID = stage.ID
					}
				} else if strings.Contains(messageLower, "closed won") || strings.Contains(messageLower, "won") {
					if stage, err := s.pipelineRepo.FindStageByCode("closed_won"); err == nil {
						stageID = stage.ID
					}
				} else if strings.Contains(messageLower, "closed lost") || strings.Contains(messageLower, "lost") {
					if stage, err := s.pipelineRepo.FindStageByCode("closed_lost"); err == nil {
						stageID = stage.ID
					}
				}
				
				if stageID != "" {
					req.StageID = stageID
				}
				
				deals, _, err := s.dealRepo.List(req)
				if err == nil && len(deals) > 0 {
					// Limit number of deals to prevent token overflow (max 15 deals for large responses)
					maxDeals := 15
					if len(deals) > maxDeals {
						deals = deals[:maxDeals]
					}
					
					// Transform deals to user-friendly format with names
					dealsFormatted := s.formatDealsForAI(deals)
					dealsJSON, _ := json.Marshal(dealsFormatted)
					
					// Build concise instruction
					instruction := fmt.Sprintf("REAL PIPELINE/DEALS DATA (showing %d deals):\n%s\n\nPresent in Markdown table. Use [Title](deal://id) for clickable links. Show only names, not IDs.", len(deals), string(dealsJSON))
					contextData = instruction
					contextType = "deal"
					fmt.Printf("Context data set with %d deals (context size: %d chars)\n", len(deals), len(contextData))
				} else {
					if err != nil {
						fmt.Printf("Error fetching deals: %v\n", err)
					}
					dataAccessInfo = "⚠️ Tidak dapat mengakses data pipeline/deals dari database. Data mungkin tidak tersedia."
				}
				fmt.Printf("========================\n")
			}
		}
		
		// Check if user is asking for leads/lead management (HIGH PRIORITY - check before general data)
		// This should be checked early to avoid being caught by "general data" logic
		if contextData == "" && (strings.Contains(messageLower, "lead") || strings.Contains(messageLower, "lead management") || 
		   strings.Contains(messageLower, "prospek") || strings.Contains(messageLower, "calon pelanggan") ||
		   (strings.Contains(messageLower, "tampilkan") && strings.Contains(messageLower, "lead")) ||
		   (strings.Contains(messageLower, "data") && strings.Contains(messageLower, "lead"))) {
			// Check data privacy and user permissions
			allowed, _ := s.checkDataPrivacy("lead", userID)
			if !allowed {
				dataAccessInfo = "⚠️ Akses ke data leads tidak diizinkan berdasarkan pengaturan privasi data atau permission yang Anda miliki."
			} else {
				// Build request with optional status filter
				req := &lead.ListLeadsRequest{
					Page:    1,
					PerPage: 20, // No limit - AI will handle overflow automatically
				}
				
				// Extract status filter from message if mentioned
				if strings.Contains(messageLower, "new") {
					req.Status = "new"
				} else if strings.Contains(messageLower, "contacted") {
					req.Status = "contacted"
				} else if strings.Contains(messageLower, "qualified") {
					req.Status = "qualified"
				} else if strings.Contains(messageLower, "unqualified") {
					req.Status = "unqualified"
				} else if strings.Contains(messageLower, "nurturing") {
					req.Status = "nurturing"
				} else if strings.Contains(messageLower, "disqualified") {
					req.Status = "disqualified"
				} else if strings.Contains(messageLower, "converted") {
					req.Status = "converted"
				} else if strings.Contains(messageLower, "lost") {
					req.Status = "lost"
				}
				
				leads, total, err := s.leadRepo.List(req)
				fmt.Printf("=== DATA FETCH DEBUG ===\n")
				fmt.Printf("Fetching leads - Error: %v, Count: %d, Total: %d, Status: %s\n", err, len(leads), total, req.Status)
				if err == nil && len(leads) > 0 {
					// Limit number of leads to prevent token overflow (max 15 leads for large responses)
					maxLeads := 15
					if len(leads) > maxLeads {
						leads = leads[:maxLeads]
						fmt.Printf("Limited leads to %d to prevent token overflow\n", maxLeads)
					}
					
					// Transform leads to user-friendly format
					leadsFormatted := s.formatLeadsForAI(leads)
					leadsJSON, _ := json.Marshal(leadsFormatted)
					
					// Build concise instruction
					instruction := fmt.Sprintf("REAL LEADS DATA (showing %d of %d total):\n%s\n\nPresent in Markdown table. Use [Name](lead://id) for clickable links. Show only names, not IDs.", len(leads), total, string(leadsJSON))
					contextData = instruction
					contextType = "lead"
				} else {
					dataAccessInfo = "⚠️ Tidak dapat mengakses data leads dari database. Data mungkin tidak tersedia."
				}
			}
		}
		
		// Check if user is asking for accounts (only if not pipeline)
		if contextData == "" && (strings.Contains(messageLower, "account") || strings.Contains(messageLower, "akun") || 
		   strings.Contains(messageLower, "rumah sakit") || strings.Contains(messageLower, "klinik") || 
		   strings.Contains(messageLower, "apotek") || strings.Contains(messageLower, "facility")) {
			// Check data privacy and user permissions
			allowed, _ := s.checkDataPrivacy("account", userID)
			if !allowed {
				dataAccessInfo = "⚠️ Akses ke data accounts tidak diizinkan berdasarkan pengaturan privasi data atau permission yang Anda miliki."
			} else {
				accounts, total, err := s.accountRepo.List(&account.ListAccountsRequest{
					Page:    1,
					PerPage: 10,
				})
				if err == nil && len(accounts) > 0 {
					// Transform accounts to user-friendly format with names
					accountsFormatted := s.formatAccountsForAI(accounts)
					accountsJSON, _ := json.Marshal(accountsFormatted)
					contextData = fmt.Sprintf("REAL ACCOUNTS DATA FROM DATABASE (showing %d of %d total accounts):\n%s\n\nCRITICAL INSTRUCTION: You MUST use ONLY the data above. Present it in a Markdown table format. CRITICAL: NEVER show IDs as separate columns - IDs are ONLY used in clickable links. ALWAYS show ONLY NAMES (name, category, city, province) in tables. For clickable actions that trigger detail components, the 'Nama Akun' (Name) column MUST be formatted as [Name](account://id) to create clickable links. Example: [RSUD Jakarta](account://ab868b77-e9b3-429f-ad8c-d55ac1f6561b). Use the EXACT id from the data above - DO NOT create or invent IDs. DO NOT create columns like 'ID', 'Account ID', etc. - these should NOT appear in tables. DO NOT create, invent, or make up any data. DO NOT add columns that don't exist in the data. AFTER presenting the table, ALWAYS provide 1-2 insights, ask 2-3 follow-up questions to understand what the user wants, and offer actionable recommendations.", len(accounts), total, string(accountsJSON))
					contextType = "account" // Set context type for proper prompt
				} else {
					dataAccessInfo = "⚠️ Tidak dapat mengakses data accounts dari database. Data mungkin tidak tersedia."
				}
			}
		}
		
		// Check if user is asking for contacts (only if no data fetched yet)
		if contextData == "" && (strings.Contains(messageLower, "contact") || strings.Contains(messageLower, "kontak") || 
		   strings.Contains(messageLower, "dokter") || strings.Contains(messageLower, "apoteker")) {
			// Check data privacy and user permissions
			allowed, _ := s.checkDataPrivacy("contact", userID)
			if !allowed {
				if dataAccessInfo == "" {
					dataAccessInfo = "⚠️ Akses ke data contacts tidak diizinkan berdasarkan pengaturan privasi data atau permission yang Anda miliki."
				}
			} else {
				contacts, _, err := s.contactRepo.List(&contact.ListContactsRequest{
					Page:    1,
					PerPage: 10,
				})
				if err == nil && len(contacts) > 0 {
					contactsJSON, _ := json.Marshal(contacts)
					if contextData != "" {
						contextData += "\n\n"
					}
					contextData += fmt.Sprintf("REAL CONTACTS DATA FROM DATABASE (showing %d contacts):\n%s\n\nCRITICAL INSTRUCTION: You MUST use ONLY the data above. Present it in a Markdown table format. CRITICAL: NEVER show IDs as separate columns - IDs are ONLY used in clickable links. ALWAYS show ONLY NAMES (name, email, phone, job_title) in tables. For clickable actions that trigger detail components, the Contact Name column MUST be formatted as [Name](contact://id) to allow clicking and opening contact detail. DO NOT create columns like 'ID', 'Contact ID', etc. - these should NOT appear in tables. DO NOT create, invent, or make up any data. AFTER presenting the table, ALWAYS provide 1-2 insights, ask 2-3 follow-up questions to understand what the user wants, and offer actionable recommendations.", len(contacts), string(contactsJSON))
					if contextType == "" {
						contextType = "contact"
					}
				} else {
					if dataAccessInfo == "" {
						dataAccessInfo = "⚠️ Tidak dapat mengakses data contacts dari database. Data mungkin tidak tersedia."
					}
				}
			}
		}
		
		
		// Check if user is asking for visit reports (only if no data fetched yet)
		if contextData == "" && (strings.Contains(messageLower, "visit") || strings.Contains(messageLower, "kunjungan") || 
		   strings.Contains(messageLower, "laporan kunjungan")) {
			// Check data privacy and user permissions
			allowed, _ := s.checkDataPrivacy("visit_report", userID)
			if !allowed {
				if dataAccessInfo == "" {
					dataAccessInfo = "⚠️ Akses ke data visit reports tidak diizinkan berdasarkan pengaturan privasi data atau permission yang Anda miliki."
				}
			} else {
				// Build request with optional status filter
				req := &visit_report.ListVisitReportsRequest{
					Page:    1,
					PerPage: 10,
				}
				
				// Extract status filter from message if mentioned
				if strings.Contains(messageLower, "approved") {
					req.Status = "approved"
				} else if strings.Contains(messageLower, "submitted") {
					req.Status = "submitted"
				} else if strings.Contains(messageLower, "draft") {
					req.Status = "draft"
				} else if strings.Contains(messageLower, "rejected") {
					req.Status = "rejected"
				}
				
				visitReports, _, err := s.visitReportRepo.List(req)
				if err == nil && len(visitReports) > 0 {
					// Transform visit reports to user-friendly format with names
					visitReportsFormatted := s.formatVisitReportsForAI(visitReports)
					visitReportsJSON, _ := json.Marshal(visitReportsFormatted)
					if contextData != "" {
						contextData += "\n\n"
					}
					contextData += fmt.Sprintf("REAL VISIT REPORTS DATA FROM DATABASE (showing %d visit reports):\n%s\n\nCRITICAL INSTRUCTION: You MUST use ONLY the data above. Present it in a Markdown table format. CRITICAL: NEVER show IDs as separate columns - IDs are ONLY used in clickable links. ALWAYS show ONLY NAMES (account_name, contact_name, purpose, status) in tables. For clickable actions that trigger detail components, use format [Name](type://ID) where type is 'visit', 'account', or 'contact'. DO NOT create columns like 'ID', 'Visit Report ID', 'Account ID', etc. - these should NOT appear in tables. DO NOT create, invent, or make up any data. DO NOT add columns that don't exist in the data. AFTER presenting the table, ALWAYS provide 1-2 insights, ask 2-3 follow-up questions to understand what the user wants, and offer actionable recommendations.", len(visitReports), string(visitReportsJSON))
					if contextType == "" {
						contextType = "visit_report"
					}
				} else {
					if dataAccessInfo == "" {
						dataAccessInfo = "⚠️ Tidak dapat mengakses data visit reports dari database. Data mungkin tidak tersedia."
					}
				}
			}
		}
		
		// Check if user is asking for tasks (only if no data fetched yet)
		if contextData == "" && (strings.Contains(messageLower, "task") || strings.Contains(messageLower, "tugas")) {
			// Check data privacy and user permissions
			allowed, _ := s.checkDataPrivacy("task", userID)
			if !allowed {
				if dataAccessInfo == "" {
					dataAccessInfo = "⚠️ Akses ke data tasks tidak diizinkan berdasarkan pengaturan privasi data atau permission yang Anda miliki."
				}
			} else {
				// Build request with optional status filter
				req := &task.ListTasksRequest{
					Page:    1,
					PerPage: 20,
				}
				
				// Extract status filter from message if mentioned
				if strings.Contains(messageLower, "pending") {
					req.Status = "pending"
				} else if strings.Contains(messageLower, "in_progress") || strings.Contains(messageLower, "in-progress") {
					req.Status = "in_progress"
				} else if strings.Contains(messageLower, "completed") || strings.Contains(messageLower, "done") {
					req.Status = "completed"
				} else if strings.Contains(messageLower, "cancelled") {
					req.Status = "cancelled"
				}
				
				tasks, _, err := s.taskRepo.List(req)
				if err == nil && len(tasks) > 0 {
					tasksJSON, _ := json.Marshal(tasks)
					if contextData != "" {
						contextData += "\n\n"
					}
					contextData += fmt.Sprintf("REAL TASKS DATA FROM DATABASE (showing %d tasks):\n%s\n\nCRITICAL INSTRUCTION: You MUST use ONLY the data above. Present it in a Markdown table format. CRITICAL: NEVER show IDs as separate columns - IDs are ONLY used in clickable links. ALWAYS show ONLY NAMES (title, account_name, contact_name, status, priority) in tables. For clickable actions that trigger detail components, use format [Name](type://ID) where type is 'task', 'account', or 'contact'. DO NOT create columns like 'ID', 'Task ID', 'Account ID', etc. - these should NOT appear in tables. DO NOT create, invent, or make up any data. AFTER presenting the table, ALWAYS provide 1-2 insights, ask 2-3 follow-up questions to understand what the user wants, and offer actionable recommendations.", len(tasks), string(tasksJSON))
					if contextType == "" {
						contextType = "task"
					}
				} else {
					if dataAccessInfo == "" {
						dataAccessInfo = "⚠️ Tidak dapat mengakses data tasks dari database. Data mungkin tidak tersedia."
					}
				}
			}
		}
		
		// Check if user is asking for forecast data (only if no data fetched yet)
		if contextData == "" && (strings.Contains(messageLower, "forecast") || strings.Contains(messageLower, "grafik forecast") || 
		   strings.Contains(messageLower, "prediksi") || strings.Contains(messageLower, "ramalan")) {
			now := time.Now()
			
			// Check for specific forecast queries
			isNextMonthQuery := strings.Contains(messageLower, "bulan depan") || strings.Contains(messageLower, "next month") || 
			                    strings.Contains(messageLower, "month depan") || strings.Contains(messageLower, "bulan berikutnya")
			isThreeMonthsQuery := strings.Contains(messageLower, "3 bulan") || strings.Contains(messageLower, "tiga bulan") ||
			                      strings.Contains(messageLower, "three months") || strings.Contains(messageLower, "3 months")
			isQuarterQuery := strings.Contains(messageLower, "kuartal") || strings.Contains(messageLower, "quarter") ||
			                  strings.Contains(messageLower, "triwulan")
			isYearQuery := strings.Contains(messageLower, "tahun") && (strings.Contains(messageLower, "ini") || 
			              strings.Contains(messageLower, "depan") || strings.Contains(messageLower, "year"))
			
			var forecastStart, forecastEnd time.Time
			var periodType string
			
			if isNextMonthQuery {
				// Next month forecast
				nextMonth := now.AddDate(0, 1, 0)
				forecastStart = time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, now.Location())
				forecastEnd = forecastStart.AddDate(0, 1, 0).Add(-time.Second)
				periodType = "month"
			} else if isThreeMonthsQuery {
				// 3 months ahead forecast
				forecastStart = now
				forecastEnd = now.AddDate(0, 3, 0)
				periodType = "quarter"
			} else if isQuarterQuery {
				// Quarter forecast - check if next quarter or current
				if strings.Contains(messageLower, "depan") || strings.Contains(messageLower, "berikutnya") || strings.Contains(messageLower, "next") {
					// Next quarter
					quarter := (now.Month() - 1) / 3
					nextQuarter := quarter + 1
					if nextQuarter >= 4 {
						nextQuarter = 0
						forecastStart = time.Date(now.Year()+1, 1, 1, 0, 0, 0, 0, now.Location())
					} else {
						forecastStart = time.Date(now.Year(), nextQuarter*3+1, 1, 0, 0, 0, 0, now.Location())
					}
					forecastEnd = forecastStart.AddDate(0, 3, 0).Add(-time.Second)
				} else {
					// Current quarter
					quarter := (now.Month() - 1) / 3
					forecastStart = time.Date(now.Year(), quarter*3+1, 1, 0, 0, 0, 0, now.Location())
					forecastEnd = forecastStart.AddDate(0, 3, 0).Add(-time.Second)
				}
				periodType = "quarter"
			} else if isYearQuery {
				// Year forecast
				if strings.Contains(messageLower, "depan") || strings.Contains(messageLower, "berikutnya") || strings.Contains(messageLower, "next") {
					// Next year
					forecastStart = time.Date(now.Year()+1, 1, 1, 0, 0, 0, 0, now.Location())
				} else {
					// Current year
					forecastStart = time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
				}
				forecastEnd = forecastStart.AddDate(1, 0, 0).Add(-time.Second)
				periodType = "year"
			} else {
				// Default: current month forecast
				forecastStart = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
				forecastEnd = forecastStart.AddDate(0, 1, 0).Add(-time.Second)
				periodType = "month"
			}
			
			forecast, err := s.dealRepo.GetForecast(periodType, forecastStart, forecastEnd)
			
			if err == nil && forecast != nil {
				forecastJSON, _ := json.Marshal(forecast)
				if contextData != "" {
					contextData += "\n\n"
				}
				periodDesc := "Current Month"
				if isNextMonthQuery {
					periodDesc = "Next Month"
				} else if isThreeMonthsQuery {
					periodDesc = "Next 3 Months"
				} else if isQuarterQuery {
					if strings.Contains(messageLower, "depan") || strings.Contains(messageLower, "berikutnya") || strings.Contains(messageLower, "next") {
						periodDesc = "Next Quarter"
					} else {
						periodDesc = "Current Quarter"
					}
				} else if isYearQuery {
					if strings.Contains(messageLower, "depan") || strings.Contains(messageLower, "berikutnya") || strings.Contains(messageLower, "next") {
						periodDesc = "Next Year"
					} else {
						periodDesc = "Current Year"
					}
				}
				contextData += fmt.Sprintf("REAL FORECAST DATA FROM DATABASE (%s):\n%s\n\nCRITICAL: You MUST use ONLY this forecast data. DO NOT create, invent, or make up any forecast data. If forecast data is empty or incomplete, inform the user that forecast data is not available.", periodDesc, string(forecastJSON))
			} else {
				if dataAccessInfo == "" {
					dataAccessInfo = "⚠️ Tidak dapat mengakses data forecast dari database. Data mungkin tidak tersedia."
				}
			}
		}
		
		// If no specific data type detected but user is asking for general data, default to accounts
		// BUT: Skip if message contains specific data type keywords (lead, deal, account, etc.)
		hasSpecificDataType := strings.Contains(messageLower, "lead") || 
		                       strings.Contains(messageLower, "deal") || 
		                       strings.Contains(messageLower, "pipeline") ||
		                       strings.Contains(messageLower, "account") ||
		                       strings.Contains(messageLower, "contact") ||
		                       strings.Contains(messageLower, "visit") ||
		                       strings.Contains(messageLower, "task") ||
		                       strings.Contains(messageLower, "product")
		
		if contextData == "" && !hasSpecificDataType && (strings.Contains(messageLower, "data") || strings.Contains(messageLower, "paparkan") || 
		   strings.Contains(messageLower, "tampilkan") || strings.Contains(messageLower, "lihat") ||
		   strings.Contains(messageLower, "sistem") || strings.Contains(messageLower, "database")) {
			// Check data privacy and user permissions
			allowed, _ := s.checkDataPrivacy("account", userID)
			if !allowed {
				dataAccessInfo = "⚠️ Akses ke data accounts tidak diizinkan berdasarkan pengaturan privasi data atau permission yang Anda miliki."
			} else {
				accounts, total, err := s.accountRepo.List(&account.ListAccountsRequest{
					Page:    1,
					PerPage: 10,
				})
				if err == nil && len(accounts) > 0 {
					// Transform accounts to user-friendly format with names
					accountsFormatted := s.formatAccountsForAI(accounts)
					accountsJSON, _ := json.Marshal(accountsFormatted)
					contextData = fmt.Sprintf("REAL ACCOUNTS DATA FROM DATABASE (showing %d of %d total accounts):\n%s\n\nCRITICAL INSTRUCTION: You MUST use ONLY the data above. Present it in a Markdown table format. CRITICAL: NEVER show IDs as separate columns - IDs are ONLY used in clickable links. ALWAYS show ONLY NAMES (name, category, city, province) in tables. For clickable actions that trigger detail components, the 'Nama Akun' (Name) column MUST be formatted as [Name](account://id) to create clickable links. Example: [RSUD Jakarta](account://ab868b77-e9b3-429f-ad8c-d55ac1f6561b). Use the EXACT id from the data above - DO NOT create or invent IDs. DO NOT create columns like 'ID', 'Account ID', etc. - these should NOT appear in tables. DO NOT create, invent, or make up any data. DO NOT add columns that don't exist in the data. AFTER presenting the table, ALWAYS provide 1-2 insights, ask 2-3 follow-up questions to understand what the user wants, and offer actionable recommendations.", len(accounts), total, string(accountsJSON))
					contextType = "account"
				} else {
					if dataAccessInfo == "" {
						dataAccessInfo = "⚠️ Tidak dapat mengakses data dari database. Data mungkin tidak tersedia."
					}
				}
			}
		}
	}

	// Get current time in configured timezone
	timezone := settings.Timezone
	if timezone == "" {
		timezone = "Asia/Jakarta" // Default to Jakarta timezone
	}
	
	loc, err := time.LoadLocation(timezone)
	if err != nil {
		// If timezone is invalid, use UTC
		loc = time.UTC
		fmt.Printf("Warning: Invalid timezone '%s', using UTC instead\n", timezone)
	}
	
	currentTime := time.Now().In(loc)
	
	// Build system prompt based on context
	systemPrompt := BuildSystemPrompt(contextID, contextType, contextData, dataAccessInfo, selectedModel, settings.Provider, currentTime, timezone)

	// Build messages with conversation history
	messages := []cerebras.ChatMessage{
		{
			Role:    "system",
			Content: systemPrompt,
		},
	}

	// Add conversation history (limit to last 10 messages to avoid token limit)
	// Note: No dynamic reduction based on context size - AI will handle overflow automatically
	historyLimit := 10
	startIdx := 0
	if len(conversationHistory) > historyLimit {
		startIdx = len(conversationHistory) - historyLimit
	}
	
	for i := startIdx; i < len(conversationHistory); i++ {
		msg := conversationHistory[i]
		// Skip system messages from history (only include user and assistant)
		if msg.Role == "user" || msg.Role == "assistant" {
			messages = append(messages, cerebras.ChatMessage{
				Role:    msg.Role,
				Content: msg.Content,
			})
		}
	}

	// Add current user message
	messages = append(messages, cerebras.ChatMessage{
		Role:    "user",
		Content: message,
	})

	// Normalize model name to lowercase for consistent matching
	originalModel := selectedModel
	selectedModel = strings.ToLower(selectedModel)

	// Available models from the UI dropdown (case-insensitive matching)
	// Models available: Llama-3.1-8B, Qwen-3-32B, GPT-OSS-120B, ZAI GLM 4.6, Llama-3.3-70B, Qwen3-235B (Instruct)
	availableModels := map[string]string{
		// Llama models
		"llama-3.1-8b":   "llama-3.1-8b",
		"llama-3.1-70b":  "llama-3.1-70b",
		"llama-3.3-70b":  "llama-3.3-70b",
		"llama-3-8b":     "llama-3.1-8b",   // Normalize to available model
		"llama-3-70b":    "llama-3.3-70b",  // Normalize to available model
		"llama3-8b":      "llama-3.1-8b",
		"llama3.1-8b":    "llama-3.1-8b",
		"llama3.3-70b":   "llama-3.3-70b",
		
		// Qwen models
		"qwen-3-32b":     "qwen-3-32b",
		"qwen3-235b":     "qwen3-235b",
		
		// GPT-OSS model
		"gpt-oss-120b":   "gpt-oss-120b",
		"gpt-oss":        "gpt-oss-120b",
		
		// ZAI GLM model
		"zai-glm-4.6":    "zai-glm-4.6",
		"zai-glm":        "zai-glm-4.6",
		"zai glm 4.6":    "zai-glm-4.6",
		"zai_glm_4.6":    "zai-glm-4.6",
	}

	// Check if model is in the available models map
	if normalizedModel, exists := availableModels[selectedModel]; exists {
		selectedModel = normalizedModel
	} else {
		// Model not found in available models
		// Check if it's a GPT model (not GPT-OSS)
		if strings.HasPrefix(selectedModel, "gpt-") && selectedModel != "gpt-oss-120b" {
			return nil, fmt.Errorf("model '%s' tidak didukung. Model yang tersedia: llama-3.1-8b, llama-3.3-70b, qwen-3-32b, qwen3-235b, gpt-oss-120b, zai-glm-4.6. Silakan pilih model yang valid.", originalModel)
		}
		// For other unknown models, let the API handle it (might be valid but not in our map)
	}

	// Calculate optimal MaxTokens based on context size
	// If context data is large, reduce max tokens to avoid hitting total context limit
	maxTokens := 4000 // Increased default for longer responses
	if len(contextData) > 50000 { // Large context (>50KB)
		maxTokens = 3000
	} else if len(contextData) > 100000 { // Very large context (>100KB)
		maxTokens = 2000
	}

	// Call Cerebras API with error handling and panic recovery
	var response *cerebras.ChatResponse
	var apiErr error
	
	// Add panic recovery for API calls
	func() {
		defer func() {
			if r := recover(); r != nil {
				apiErr = fmt.Errorf("internal error: panic recovered: %v", r)
			}
		}()
		
		response, apiErr = s.cerebrasClient.Chat(&cerebras.ChatRequest{
			Model:      selectedModel, // Pass the selected model
			Messages:   messages,
			MaxTokens:  maxTokens,
			Temperature: 0.7,
		})
	}()
	
	if apiErr != nil {
		fmt.Printf("=== CEREBRAS API ERROR ===\n")
		fmt.Printf("Error: %v\n", apiErr)
		fmt.Printf("Error type: %T\n", apiErr)
		fmt.Printf("User message: %s\n", message)
		fmt.Printf("Selected model: %s\n", selectedModel)
		fmt.Printf("==========================\n")
		
		// Check if error is model not found
		errorStr := apiErr.Error()
		if strings.Contains(errorStr, "model_not_found") || 
		   strings.Contains(errorStr, "does not exist") || 
		   strings.Contains(errorStr, "not found") {
			return nil, fmt.Errorf("model '%s' tidak ditemukan atau tidak tersedia. Model yang tersedia: llama-3.1-8b, llama-3.1-70b. Silakan pilih model yang valid.", selectedModel)
		}
		
		// Check if error is about GPT models
		if strings.Contains(errorStr, "gpt-") {
			return nil, fmt.Errorf("model '%s' tidak didukung. Cerebras API hanya mendukung model Cerebras (contoh: llama-3.1-8b, llama-3.1-70b). Silakan pilih model Cerebras yang valid.", selectedModel)
		}
		
		return nil, fmt.Errorf("gagal menghasilkan respons: %w", apiErr)
	}
	
	// Validate response
	if response == nil {
		return nil, fmt.Errorf("empty response from AI service")
	}
	
	// Check if Message is nil (defensive check)
	if response.Message.Content == "" {
		return nil, fmt.Errorf("empty message content from AI service")
	}

	// Add data access info to response if needed
	finalMessage := response.Message.Content
	if dataAccessInfo != "" && !strings.Contains(finalMessage, dataAccessInfo) {
		finalMessage = dataAccessInfo + "\n\n" + finalMessage
	}

	return &ai.ChatResponse{
		Message: finalMessage,
		Tokens:  response.Tokens,
	}, nil
}

// Helper function for min
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// DealFormatted represents a user-friendly deal format for AI
type DealFormatted struct {
	ID              string  `json:"id"`
	Title           string  `json:"title"`
	AccountID       string  `json:"account_id"`       // ID for creating links
	AccountName     string  `json:"account_name"`     // Name instead of ID
	ContactID       string  `json:"contact_id,omitempty"` // ID for creating links (optional)
	ContactName     string  `json:"contact_name"`     // Name instead of ID
	StageName       string  `json:"stage_name"`       // Name instead of ID
	Value           int64   `json:"value"`
	ValueFormatted  string  `json:"value_formatted"`  // Human-readable format
	Status          string  `json:"status"`
	Probability     int     `json:"probability"`
	ExpectedCloseDate *string `json:"expected_close_date,omitempty"`
	CreatedAt       string  `json:"created_at"`
}

// AccountFormatted represents a user-friendly account format for AI
type AccountFormatted struct {
	ID         string `json:"id"`          // ID for creating links
	Name       string `json:"name"`        // Account name
	CategoryID string `json:"category_id"` // Category ID
	Category   string `json:"category"`    // Category name
	Address    string `json:"address"`
	City       string `json:"city"`
	Province   string `json:"province"`
	Phone      string `json:"phone"`
	Email      string `json:"email"`
	Status     string `json:"status"`
	CreatedAt  string `json:"created_at"`
}

// formatDealsForAI transforms deals to user-friendly format with names
func (s *Service) formatDealsForAI(deals []pipeline.Deal) []DealFormatted {
	formatted := make([]DealFormatted, 0, len(deals))
	
	for _, deal := range deals {
		accountName := ""
		if deal.Account != nil {
			accountName = deal.Account.Name
		}
		if accountName == "" {
			accountName = "N/A"
		}
		
		contactName := ""
		if deal.Contact != nil {
			contactName = deal.Contact.Name
		}
		if contactName == "" {
			contactName = "N/A"
		}
		
		stageName := ""
		if deal.Stage != nil {
			stageName = deal.Stage.Name
		}
		if stageName == "" {
			stageName = "N/A"
		}
		
		// Format value to Rupiah
		valueFormatted := formatCurrencyRupiah(deal.Value)
		
		expectedCloseDate := ""
		if deal.ExpectedCloseDate != nil {
			expectedCloseDate = deal.ExpectedCloseDate.Format("2006-01-02")
		}
		
		// Get account and contact IDs
		accountID := deal.AccountID
		contactID := deal.ContactID
		
		formatted = append(formatted, DealFormatted{
			ID:              deal.ID,
			Title:           deal.Title,
			AccountID:       accountID,
			AccountName:     accountName,
			ContactID:       contactID,
			ContactName:     contactName,
			StageName:       stageName,
			Value:           deal.Value,
			ValueFormatted:  valueFormatted,
			Status:          deal.Status,
			Probability:     deal.Probability,
			ExpectedCloseDate: &expectedCloseDate,
			CreatedAt:       deal.CreatedAt.Format("2006-01-02"),
		})
	}
	
	return formatted
}

// VisitReportFormatted represents a user-friendly visit report format for AI
type VisitReportFormatted struct {
	ID          string `json:"id"`
	AccountName string `json:"account_name"` // Name instead of ID
	ContactName string `json:"contact_name"` // Name instead of ID
	VisitDate   string `json:"visit_date"`
	Purpose     string `json:"purpose"`
	Status      string `json:"status"`
	CreatedAt   string `json:"created_at"`
}

// formatVisitReportsForAI transforms visit reports to user-friendly format with names
func (s *Service) formatVisitReportsForAI(visitReports []visit_report.VisitReport) []VisitReportFormatted {
	formatted := make([]VisitReportFormatted, 0, len(visitReports))
	
	for _, vr := range visitReports {
		// Fetch account name
		accountName := "N/A"
		if vr.AccountID != nil && *vr.AccountID != "" {
			if account, err := s.accountRepo.FindByID(*vr.AccountID); err == nil && account != nil {
				accountName = account.Name
			}
		}
		
		// Fetch contact name if available
		contactName := "N/A"
		if vr.ContactID != nil {
			if contact, err := s.contactRepo.FindByID(*vr.ContactID); err == nil && contact != nil {
				contactName = contact.Name
			}
		}
		
		formatted = append(formatted, VisitReportFormatted{
			ID:          vr.ID,
			AccountName: accountName,
			ContactName: contactName,
			VisitDate:   vr.VisitDate.Format("2006-01-02"),
			Purpose:     vr.Purpose,
			Status:      vr.Status,
			CreatedAt:   vr.CreatedAt.Format("2006-01-02"),
		})
	}
	
	return formatted
}

// formatCurrencyRupiah formats integer (sen) to formatted currency string
func formatCurrencyRupiah(amount int64) string {
	// Convert to Rupiah (divide by 100 if stored in sen)
	rupiah := float64(amount) / 100.0
	// Format with thousand separator
	formatted := formatNumberRupiah(rupiah)
	return "Rp " + formatted
}

// formatNumberRupiah formats number with thousand separator
func formatNumberRupiah(n float64) string {
	// Convert to int64 to remove decimal places
	amount := int64(n)
	
	// Handle zero case
	if amount == 0 {
		return "0"
	}
	
	// Handle negative numbers
	negative := false
	if amount < 0 {
		negative = true
		amount = -amount
	}
	
	// Convert to string
	str := fmt.Sprintf("%d", amount)
	length := len(str)
	
	// Add thousand separators (dot for Indonesian format)
	// Split into chunks of 3 digits from right
	var parts []string
	for i := length; i > 0; i -= 3 {
		start := i - 3
		if start < 0 {
			start = 0
		}
		parts = append([]string{str[start:i]}, parts...)
	}
	
	result := strings.Join(parts, ".")
	if negative {
		result = "-" + result
	}
	
	return result
}

// TaskFormatted represents a user-friendly task format for AI
type TaskFormatted struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	AccountName string `json:"account_name"` // Name instead of ID
	ContactName string `json:"contact_name"` // Name instead of ID
	Status      string `json:"status"`
	Priority    string `json:"priority"`
	DueDate     string `json:"due_date,omitempty"`
	CreatedAt   string `json:"created_at"`
}

// formatTasksForAI transforms tasks to user-friendly format with names
func (s *Service) formatTasksForAI(tasks []task.Task) []TaskFormatted {
	formatted := make([]TaskFormatted, 0, len(tasks))
	
	for _, t := range tasks {
		// Fetch account name
		accountName := "N/A"
		if t.AccountID != nil {
			if account, err := s.accountRepo.FindByID(*t.AccountID); err == nil && account != nil {
				accountName = account.Name
			}
		}
		
		// Fetch contact name if available
		contactName := "N/A"
		if t.ContactID != nil {
			if contact, err := s.contactRepo.FindByID(*t.ContactID); err == nil && contact != nil {
				contactName = contact.Name
			}
		}
		
		dueDate := ""
		if t.DueDate != nil {
			dueDate = t.DueDate.Format("2006-01-02")
		}
		
		formatted = append(formatted, TaskFormatted{
			ID:          t.ID,
			Title:       t.Title,
			AccountName: accountName,
			ContactName: contactName,
			Status:      t.Status,
			Priority:    t.Priority,
			DueDate:     dueDate,
			CreatedAt:   t.CreatedAt.Format("2006-01-02"),
		})
	}
	
	return formatted
}

// formatAccountsForAI transforms accounts to user-friendly format with names
func (s *Service) formatAccountsForAI(accounts []account.Account) []AccountFormatted {
	formatted := make([]AccountFormatted, 0, len(accounts))
	
	for _, acc := range accounts {
		categoryName := ""
		if acc.Category != nil {
			categoryName = acc.Category.Name
		}
		if categoryName == "" {
			categoryName = "N/A"
		}
		
		formatted = append(formatted, AccountFormatted{
			ID:         acc.ID,
			Name:       acc.Name,
			CategoryID: acc.CategoryID,
			Category:   categoryName,
			Address:    acc.Address,
			City:       acc.City,
			Province:   acc.Province,
			Phone:      acc.Phone,
			Email:      acc.Email,
			Status:     acc.Status,
			CreatedAt:  acc.CreatedAt.Format("2006-01-02"),
		})
	}
	
	return formatted
}

// LeadFormatted represents a user-friendly lead format for AI
type LeadFormatted struct {
	ID                string `json:"id"`
	FirstName         string `json:"first_name"`
	LastName          string `json:"last_name"`
	FullName          string `json:"full_name"`
	CompanyName       string `json:"company_name"`
	Email             string `json:"email"`
	Phone             string `json:"phone"`
	JobTitle          string `json:"job_title"`
	LeadSource        string `json:"lead_source"`
	LeadStatus        string `json:"lead_status"`
	LeadScore         int    `json:"lead_score"`
	AccountID         string `json:"account_id"`
	AccountName       string `json:"account_name"` // Name instead of ID
	ContactID         string `json:"contact_id"`
	ContactName       string `json:"contact_name"` // Name instead of ID
	AssignedTo        string `json:"assigned_to"`
	AssignedUserName  string `json:"assigned_user_name"` // Name instead of ID
	City              string `json:"city"`
	Province          string `json:"province"`
	CreatedAt         string `json:"created_at"`
}

// formatLeadsForAI transforms leads to user-friendly format with names
func (s *Service) formatLeadsForAI(leads []lead.Lead) []LeadFormatted {
	formatted := make([]LeadFormatted, 0, len(leads))
	
	for _, l := range leads {
		// Build full name
		fullName := strings.TrimSpace(l.FirstName + " " + l.LastName)
		if fullName == "" {
			fullName = "N/A"
		}
		
		// Get account name
		accountName := "N/A"
		accountID := ""
		if l.AccountID != nil && *l.AccountID != "" {
			accountID = *l.AccountID
			if l.Account != nil {
				accountName = l.Account.Name
			} else {
				// Try to fetch if not preloaded
				if account, err := s.accountRepo.FindByID(*l.AccountID); err == nil && account != nil {
					accountName = account.Name
				}
			}
		}
		
		// Get contact name
		contactName := "N/A"
		contactID := ""
		if l.ContactID != nil && *l.ContactID != "" {
			contactID = *l.ContactID
			if l.Contact != nil {
				contactName = l.Contact.Name
			} else {
				// Try to fetch if not preloaded
				if contact, err := s.contactRepo.FindByID(*l.ContactID); err == nil && contact != nil {
					contactName = contact.Name
				}
			}
		}
		
		// Get assigned user name
		assignedUserName := "N/A"
		assignedTo := ""
		if l.AssignedTo != nil && *l.AssignedTo != "" {
			assignedTo = *l.AssignedTo
			if l.AssignedUser != nil {
				assignedUserName = l.AssignedUser.Name
			}
		}
		
		formatted = append(formatted, LeadFormatted{
			ID:               l.ID,
			FirstName:        l.FirstName,
			LastName:         l.LastName,
			FullName:         fullName,
			CompanyName:      l.CompanyName,
			Email:            l.Email,
			Phone:            l.Phone,
			JobTitle:         l.JobTitle,
			LeadSource:       l.LeadSource,
			LeadStatus:       l.LeadStatus,
			LeadScore:        l.LeadScore,
			AccountID:        accountID,
			AccountName:      accountName,
			ContactID:        contactID,
			ContactName:      contactName,
			AssignedTo:       assignedTo,
			AssignedUserName: assignedUserName,
			City:             l.City,
			Province:         l.Province,
			CreatedAt:        l.CreatedAt.Format("2006-01-02"),
		})
	}
	
	return formatted
}

// parseVisitReportInsight parses AI response into VisitReportInsight
func (s *Service) parseVisitReportInsight(text string) (*ai.VisitReportInsight, error) {
	// Clean up the text: remove comment markers and extra whitespace
	cleaned := strings.TrimSpace(text)
	
	// Remove common comment markers that might appear before/after JSON
	cleaned = strings.TrimPrefix(cleaned, "*/")
	cleaned = strings.TrimPrefix(cleaned, "/*")
	cleaned = strings.TrimPrefix(cleaned, "//")
	cleaned = strings.TrimSpace(cleaned)
	
	// Remove trailing comments (like "// Output format in JSON format.")
	// Find the last closing brace and remove everything after it that's not part of JSON
	jsonStart := strings.Index(cleaned, "{")
	jsonEnd := strings.LastIndex(cleaned, "}")

	if jsonStart == -1 || jsonEnd == -1 {
		return nil, fmt.Errorf("no JSON found in response")
	}

	// Extract JSON portion
	jsonStr := cleaned[jsonStart : jsonEnd+1]
	
	// Note: We don't remove comment markers from inside the JSON string
	// because they might be valid parts of JSON string values (e.g., URLs).
	// Comment markers should only appear outside the JSON boundaries, which
	// we've already handled by extracting the JSON portion.
	jsonStr = strings.TrimSpace(jsonStr)

	// Try to parse as JSON
	var rawInsight map[string]interface{}
	if err := json.Unmarshal([]byte(jsonStr), &rawInsight); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %w", err)
	}

	// Build the insight struct, handling different data types
	insight := &ai.VisitReportInsight{
		Summary:     "",
		ActionItems: []string{},
		Sentiment:   "neutral",
		KeyPoints:   []string{},
		Recommendations: []string{},
	}

	// Extract summary
	if summary, ok := rawInsight["summary"].(string); ok {
		insight.Summary = summary
	}

	// Extract sentiment
	if sentiment, ok := rawInsight["sentiment"].(string); ok {
		insight.Sentiment = sentiment
	}

	// Extract key_points (array of strings)
	if keyPoints, ok := rawInsight["key_points"].([]interface{}); ok {
		for _, point := range keyPoints {
			if str, ok := point.(string); ok {
				insight.KeyPoints = append(insight.KeyPoints, str)
			}
		}
	}

	// Extract action_items (can be array of strings or array of objects)
	if actionItems, ok := rawInsight["action_items"].([]interface{}); ok {
		for _, item := range actionItems {
			if str, ok := item.(string); ok {
				// Simple string
				insight.ActionItems = append(insight.ActionItems, str)
			} else if obj, ok := item.(map[string]interface{}); ok {
				// Object with description and urgency - convert to string
				if desc, ok := obj["description"].(string); ok {
					insight.ActionItems = append(insight.ActionItems, desc)
				}
			}
		}
	}

	// Extract recommendations (array of strings)
	if recommendations, ok := rawInsight["recommendations"].([]interface{}); ok {
		for _, rec := range recommendations {
			if str, ok := rec.(string); ok {
				insight.Recommendations = append(insight.Recommendations, str)
			}
		}
	}

	return insight, nil
}


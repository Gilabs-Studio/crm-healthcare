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
	
	// Log model selection
	fmt.Printf("=== MODEL SELECTION DEBUG ===\n")
	fmt.Printf("Model from request: %s\n", model)
	fmt.Printf("Model from settings: %s\n", settings.Model)
	fmt.Printf("Selected model (final): %s\n", selectedModel)
	fmt.Printf("Provider: %s\n", settings.Provider)
	fmt.Printf("=============================\n")

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
		
		// Log for debugging
		fmt.Printf("=== DATA PRIVACY QUERY DEBUG ===\n")
		fmt.Printf("Settings.DataPrivacy is nil: %v\n", settings.DataPrivacy == nil)
		if settings.DataPrivacy != nil {
			fmt.Printf("Settings.DataPrivacy length: %d\n", len(settings.DataPrivacy))
			fmt.Printf("Settings.DataPrivacy content: %s\n", string(settings.DataPrivacy))
		}
		
		if settings.DataPrivacy != nil {
			if err := json.Unmarshal(settings.DataPrivacy, &dataPrivacy); err == nil {
				fmt.Printf("Successfully parsed data privacy settings\n")
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
				
				fmt.Printf("Returning privacy info response\n")
				fmt.Printf("===============================\n")
				
				// Return direct response about data privacy settings
				return &ai.ChatResponse{
					Message: privacyInfo + "\n\nIni adalah pengaturan data privacy yang saat ini aktif di sistem. Anda dapat mengubah pengaturan ini melalui halaman AI Settings.",
					Tokens:  0, // No tokens consumed for this internal response
				}, nil
			} else {
				fmt.Printf("Error parsing data privacy: %v\n", err)
			}
		}
		
		// If settings not found or parsing failed, check if we should use defaults
		fmt.Printf("DataPrivacy is nil or parsing failed, using default message\n")
		fmt.Printf("===============================\n")
		
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
				fmt.Printf("=== ANALYTICS DATA FETCH DEBUG ===\n")
				fmt.Printf("Fetching ALL deals for analytics - Error: %v, Count: %d\n", err, len(deals))
				if err == nil && len(deals) > 0 {
					// Transform deals to user-friendly format with names
					dealsFormatted := s.formatDealsForAI(deals)
					dealsJSON, _ := json.Marshal(dealsFormatted)
					contextData = fmt.Sprintf("REAL PIPELINE/DEALS DATA FROM DATABASE (showing %d deals for analytics/statistics calculation):\n%s\n\nCRITICAL INSTRUCTION FOR ANALYTICS: You have ALL deals data above. You MUST calculate statistics, conversion rates, averages, or any requested metrics using ONLY this real data. For conversion rate calculations (e.g., Lead to Closed Won):\n1. Count deals with stage_name 'Lead' (or stage_code 'lead')\n2. Count deals with stage_name 'Closed Won' (or stage_code 'closed_won')\n3. Calculate: (Closed Won / Total Leads) * 100\n4. Present the calculation clearly with the actual numbers from the data\n5. DO NOT create, invent, or make up any numbers - use ONLY the data provided\n6. Present data in Markdown table format when showing multiple deals\n7. ALWAYS show NAMES (account_name, contact_name, stage_name) instead of IDs\n8. For IDs, use format [Name](type://ID) to create clickable links\n9. If the data doesn't contain the specific stages needed for calculation, inform the user honestly", len(deals), string(dealsJSON))
					contextType = "deal"
					fmt.Printf("Context data set with %d deals for analytics\n", len(deals))
				} else {
					if err != nil {
						fmt.Printf("Error fetching deals for analytics: %v\n", err)
					}
					dataAccessInfo = "⚠️ Tidak dapat mengakses data pipeline/deals dari database untuk perhitungan statistik. Data mungkin tidak tersedia."
				}
				fmt.Printf("====================================\n")
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
				fmt.Printf("=== DATA FETCH DEBUG ===\n")
				fmt.Printf("Fetching deals/pipeline - Error: %v, Count: %d, StageID: %s\n", err, len(deals), stageID)
				if err == nil && len(deals) > 0 {
					// Transform deals to user-friendly format with names
					dealsFormatted := s.formatDealsForAI(deals)
					dealsJSON, _ := json.Marshal(dealsFormatted)
					contextData = fmt.Sprintf("REAL PIPELINE/DEALS DATA FROM DATABASE (showing %d deals):\n%s\n\nCRITICAL INSTRUCTION: You MUST use ONLY the data above. Present it in a Markdown table format. ALWAYS show NAMES (account_name, contact_name, stage_name) instead of IDs. For IDs, use format [Name](type://ID) to create clickable links where type is 'deal', 'account', or 'contact'. IMPORTANT: Use the EXACT account_id and contact_id from the data above - DO NOT create or invent IDs. If contact_id is empty or null, do not create a contact link. DO NOT create, invent, or make up any data. DO NOT add columns that don't exist in the data.", len(deals), string(dealsJSON))
					contextType = "deal"
					fmt.Printf("Context data set with %d deals\n", len(deals))
				} else {
					if err != nil {
						fmt.Printf("Error fetching deals: %v\n", err)
					}
					dataAccessInfo = "⚠️ Tidak dapat mengakses data pipeline/deals dari database. Data mungkin tidak tersedia."
				}
				fmt.Printf("========================\n")
			}
		}
		
		// Check if user is asking for leads/lead management (only if not pipeline/deals)
		if contextData == "" && (strings.Contains(messageLower, "lead") || strings.Contains(messageLower, "lead management") || 
		   strings.Contains(messageLower, "prospek") || strings.Contains(messageLower, "calon pelanggan")) {
			// Check data privacy and user permissions
			allowed, _ := s.checkDataPrivacy("lead", userID)
			if !allowed {
				dataAccessInfo = "⚠️ Akses ke data leads tidak diizinkan berdasarkan pengaturan privasi data atau permission yang Anda miliki."
			} else {
				// Build request with optional status filter
				req := &lead.ListLeadsRequest{
					Page:    1,
					PerPage: 20,
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
					// Transform leads to user-friendly format
					leadsFormatted := s.formatLeadsForAI(leads)
					leadsJSON, _ := json.Marshal(leadsFormatted)
					contextData = fmt.Sprintf("REAL LEADS DATA FROM DATABASE (showing %d of %d total leads):\n%s\n\nCRITICAL INSTRUCTION: You MUST use ONLY the data above. Present it in a Markdown table format. ALWAYS show NAMES (account_name, contact_name, assigned_user_name) instead of IDs. For IDs, use format [Name](type://ID) to create clickable links where type is 'lead', 'account', or 'contact'. IMPORTANT: Use the EXACT account_id and contact_id from the data above - DO NOT create or invent IDs. If contact_id is empty or null, do not create a contact link. DO NOT create, invent, or make up any data. DO NOT add columns that don't exist in the data.", len(leads), total, string(leadsJSON))
					contextType = "lead"
					fmt.Printf("Context data set with %d leads\n", len(leads))
				} else {
					if err != nil {
						fmt.Printf("Error fetching leads: %v\n", err)
					}
					dataAccessInfo = "⚠️ Tidak dapat mengakses data leads dari database. Data mungkin tidak tersedia."
				}
				fmt.Printf("========================\n")
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
				fmt.Printf("=== DATA FETCH DEBUG ===\n")
				fmt.Printf("Fetching accounts - Error: %v, Count: %d, Total: %d\n", err, len(accounts), total)
				if err == nil && len(accounts) > 0 {
					// Transform accounts to user-friendly format with names
					accountsFormatted := s.formatAccountsForAI(accounts)
					accountsJSON, _ := json.Marshal(accountsFormatted)
					contextData = fmt.Sprintf("REAL ACCOUNTS DATA FROM DATABASE (showing %d of %d total accounts):\n%s\n\nCRITICAL INSTRUCTION: You MUST use ONLY the data above. Present it in a Markdown table format. For the 'Nama Akun' (Name) column, you MUST format it as [Name](account://id) to create clickable links. Example: [RSUD Jakarta](account://ab868b77-e9b3-429f-ad8c-d55ac1f6561b). Use the EXACT id from the data above - DO NOT create or invent IDs. DO NOT create, invent, or make up any data. DO NOT add columns that don't exist in the data.", len(accounts), total, string(accountsJSON))
					contextType = "account" // Set context type for proper prompt
					fmt.Printf("Context data set with %d accounts\n", len(accounts))
				} else {
					if err != nil {
						fmt.Printf("Error fetching accounts: %v\n", err)
					}
					dataAccessInfo = "⚠️ Tidak dapat mengakses data accounts dari database. Data mungkin tidak tersedia."
				}
				fmt.Printf("========================\n")
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
					contextData += fmt.Sprintf("REAL CONTACTS DATA FROM DATABASE (showing %d contacts):\n%s\n\nIMPORTANT: You MUST use ONLY this data. DO NOT create example data.", len(contacts), string(contactsJSON))
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
					contextData += fmt.Sprintf("REAL VISIT REPORTS DATA FROM DATABASE (showing %d visit reports):\n%s\n\nCRITICAL INSTRUCTION: You MUST use ONLY the data above. Present it in a Markdown table format. ALWAYS show NAMES (account_name, contact_name) instead of IDs. For IDs, use format [Name](visit://ID) to create clickable links. DO NOT create, invent, or make up any data. DO NOT add columns that don't exist in the data.", len(visitReports), string(visitReportsJSON))
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
				fmt.Printf("=== DATA FETCH DEBUG ===\n")
				fmt.Printf("Fetching tasks - Error: %v, Count: %d, Status: %s\n", err, len(tasks), req.Status)
				if err == nil && len(tasks) > 0 {
					tasksJSON, _ := json.Marshal(tasks)
					if contextData != "" {
						contextData += "\n\n"
					}
					contextData += fmt.Sprintf("REAL TASKS DATA FROM DATABASE (showing %d tasks):\n%s\n\nIMPORTANT: You MUST use ONLY this data. DO NOT create example data.", len(tasks), string(tasksJSON))
					if contextType == "" {
						contextType = "task"
					}
					fmt.Printf("Context data set with %d tasks\n", len(tasks))
				} else {
					if err != nil {
						fmt.Printf("Error fetching tasks: %v\n", err)
					}
					if dataAccessInfo == "" {
						dataAccessInfo = "⚠️ Tidak dapat mengakses data tasks dari database. Data mungkin tidak tersedia."
					}
				}
				fmt.Printf("========================\n")
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
		if contextData == "" && (strings.Contains(messageLower, "data") || strings.Contains(messageLower, "paparkan") || 
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
				fmt.Printf("=== DATA FETCH DEBUG (GENERAL REQUEST) ===\n")
				fmt.Printf("User asked for general data, fetching accounts - Error: %v, Count: %d, Total: %d\n", err, len(accounts), total)
				if err == nil && len(accounts) > 0 {
					// Transform accounts to user-friendly format with names
					accountsFormatted := s.formatAccountsForAI(accounts)
					accountsJSON, _ := json.Marshal(accountsFormatted)
					contextData = fmt.Sprintf("REAL ACCOUNTS DATA FROM DATABASE (showing %d of %d total accounts):\n%s\n\nCRITICAL INSTRUCTION: You MUST use ONLY the data above. Present it in a Markdown table format. For the 'Nama Akun' (Name) column, you MUST format it as [Name](account://id) to create clickable links. Example: [RSUD Jakarta](account://ab868b77-e9b3-429f-ad8c-d55ac1f6561b). Use the EXACT id from the data above - DO NOT create or invent IDs. DO NOT create, invent, or make up any data. DO NOT add columns that don't exist in the data.", len(accounts), total, string(accountsJSON))
					contextType = "account"
					fmt.Printf("Context data set with %d accounts\n", len(accounts))
				} else {
					if err != nil {
						fmt.Printf("Error fetching accounts: %v\n", err)
					}
					if dataAccessInfo == "" {
						dataAccessInfo = "⚠️ Tidak dapat mengakses data dari database. Data mungkin tidak tersedia."
					}
				}
				fmt.Printf("========================\n")
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

	// Logging untuk debugging
	fmt.Printf("=== AI CHAT DEBUG ===\n")
	fmt.Printf("User message: %s\n", message)
	fmt.Printf("Selected model: %s\n", selectedModel)
	fmt.Printf("Provider: %s\n", settings.Provider)
	fmt.Printf("Context ID: %s\n", contextID)
	fmt.Printf("Context Type: %s\n", contextType)
	fmt.Printf("Context Data Length: %d\n", len(contextData))
	if len(contextData) > 0 {
		fmt.Printf("Context Data Preview (first 500 chars): %s\n", contextData[:min(500, len(contextData))])
	}
	fmt.Printf("Data Access Info: %s\n", dataAccessInfo)
	fmt.Printf("System Prompt Length: %d\n", len(systemPrompt))
	fmt.Printf("Conversation History Length: %d messages\n", len(conversationHistory))
	if len(conversationHistory) > 0 {
		fmt.Printf("Conversation History Preview:\n")
		for i, msg := range conversationHistory {
			if i >= 3 { // Show only first 3 messages
				fmt.Printf("  ... and %d more messages\n", len(conversationHistory)-3)
				break
			}
			fmt.Printf("  [%s]: %s (first 100 chars)\n", msg.Role, msg.Content[:min(100, len(msg.Content))])
		}
	}
	fmt.Printf("========================\n")

	// Build messages with conversation history
	messages := []cerebras.ChatMessage{
		{
			Role:    "system",
			Content: systemPrompt,
		},
	}

	// Add conversation history (limit to last 10 messages to avoid token limit)
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

	// Call Cerebras API with error handling and panic recovery
	var response *cerebras.ChatResponse
	var apiErr error
	
	// Add panic recovery for API calls
	func() {
		defer func() {
			if r := recover(); r != nil {
				fmt.Printf("=== PANIC RECOVERED IN AI CHAT ===\n")
				fmt.Printf("Panic: %v\n", r)
				fmt.Printf("User message: %s\n", message)
				fmt.Printf("========================\n")
				apiErr = fmt.Errorf("internal error: panic recovered: %v", r)
			}
		}()
		
		response, apiErr = s.cerebrasClient.Chat(&cerebras.ChatRequest{
			Messages:   messages,
			MaxTokens:  1000, // Increased for better responses with data
			Temperature: 0.7,
		})
	}()
	
	if apiErr != nil {
		fmt.Printf("=== CEREBRAS API ERROR ===\n")
		fmt.Printf("Error: %v\n", apiErr)
		fmt.Printf("Error type: %T\n", apiErr)
		fmt.Printf("User message: %s\n", message)
		fmt.Printf("==========================\n")
		return nil, fmt.Errorf("failed to generate response: %w", apiErr)
	}
	
	// Validate response
	if response == nil {
		fmt.Printf("=== NULL RESPONSE ERROR ===\n")
		fmt.Printf("Response is nil from Cerebras API\n")
		fmt.Printf("===========================\n")
		return nil, fmt.Errorf("empty response from AI service")
	}
	
	// Check if Message is nil (defensive check)
	if response.Message.Content == "" {
		fmt.Printf("=== EMPTY CONTENT ERROR ===\n")
		fmt.Printf("Response message content is empty\n")
		fmt.Printf("Response: %+v\n", response)
		fmt.Printf("===========================\n")
		return nil, fmt.Errorf("empty message content from AI service")
	}

	// Add data access info to response if needed
	finalMessage := response.Message.Content
	if dataAccessInfo != "" && !strings.Contains(finalMessage, dataAccessInfo) {
		finalMessage = dataAccessInfo + "\n\n" + finalMessage
	}

	// Update usage tracking
	usageLimit := int64(0)
	if settings.UsageLimit != nil {
		usageLimit = *settings.UsageLimit
	}
	
	if usageLimit > 0 {
		// Check if reset date has passed
		if settings.UsageResetAt != nil && settings.UsageResetAt.Before(time.Now()) {
			settings.CurrentUsage = 0
			// Set reset date to the first day of the next month
			now := time.Now()
			nextMonth := time.Date(now.Year(), now.Month()+1, 1, 0, 0, 0, 0, now.Location())
			settings.UsageResetAt = &nextMonth
		}

		// Increment usage
		previousUsage := settings.CurrentUsage
		settings.CurrentUsage += int64(response.Tokens)
		
		// Update settings in database
		err = s.settingsRepo.UpdateSettings(settings)
		if err != nil {
			fmt.Printf("Warning: Failed to update AI usage: %v\n", err)
		} else {
			fmt.Printf("=== USAGE UPDATE DEBUG ===\n")
			fmt.Printf("Tokens used: %d\n", response.Tokens)
			fmt.Printf("Previous usage: %d\n", previousUsage)
			fmt.Printf("New usage: %d\n", settings.CurrentUsage)
			fmt.Printf("Usage limit: %d\n", usageLimit)
			if usageLimit > 0 {
				fmt.Printf("Usage percentage: %.2f%%\n", float64(settings.CurrentUsage)/float64(usageLimit)*100)
			}
			fmt.Printf("==========================\n")
		}
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


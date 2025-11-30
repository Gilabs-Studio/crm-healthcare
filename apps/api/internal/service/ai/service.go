package ai

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/account"
	"github.com/gilabs/crm-healthcare/api/internal/domain/ai"
	"github.com/gilabs/crm-healthcare/api/internal/domain/ai_settings"
	"github.com/gilabs/crm-healthcare/api/internal/domain/contact"
	"github.com/gilabs/crm-healthcare/api/internal/domain/pipeline"
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
	cerebrasClient  *cerebras.Client
	visitReportRepo interfaces.VisitReportRepository
	accountRepo     interfaces.AccountRepository
	contactRepo     interfaces.ContactRepository
	dealRepo        interfaces.DealRepository
	activityRepo    interfaces.ActivityRepository
	settingsRepo    interfaces.AISettingsRepository
	apiKey          string
}

// NewService creates a new AI service
func NewService(
	cerebrasClient *cerebras.Client,
	visitReportRepo interfaces.VisitReportRepository,
	accountRepo interfaces.AccountRepository,
	contactRepo interfaces.ContactRepository,
	dealRepo interfaces.DealRepository,
	activityRepo interfaces.ActivityRepository,
	settingsRepo interfaces.AISettingsRepository,
	apiKey string,
) *Service {
	return &Service{
		cerebrasClient:  cerebrasClient,
		visitReportRepo: visitReportRepo,
		accountRepo:     accountRepo,
		contactRepo:     contactRepo,
		dealRepo:        dealRepo,
		activityRepo:    activityRepo,
		settingsRepo:    settingsRepo,
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

	// Get account
	account, err := s.accountRepo.FindByID(visitReport.AccountID)
	if err != nil {
		return nil, 0, fmt.Errorf("account not found: %w", err)
	}

	// Get contact if exists
	var contactName string
	if visitReport.ContactID != nil {
		contact, err := s.contactRepo.FindByID(*visitReport.ContactID)
		if err == nil {
			contactName = contact.Name
		}
	}

	// Get recent activities for context
	activities, _ := s.activityRepo.FindByAccountID(visitReport.AccountID)
	// Limit to 5 most recent
	if len(activities) > 5 {
		activities = activities[:5]
	}

	// Validate API key
	if err := s.validateAPIKey(); err != nil {
		return nil, 0, fmt.Errorf("AI service not configured: %w", err)
	}

	// Build context for AI
	context := BuildVisitReportContext(visitReport, account, contactName, activities)

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

// checkDataPrivacy checks if data type is allowed based on settings
func (s *Service) checkDataPrivacy(dataType string) (bool, error) {
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
		return true, nil
	}

	// Check based on data type
	switch dataType {
	case "visit_report":
		return dataPrivacy.AllowVisitReports, nil
	case "account":
		return dataPrivacy.AllowAccounts, nil
	case "contact":
		return dataPrivacy.AllowContacts, nil
	case "deal":
		return dataPrivacy.AllowDeals, nil
	case "activity":
		return dataPrivacy.AllowActivities, nil
	case "task":
		return dataPrivacy.AllowTasks, nil
	case "product":
		return dataPrivacy.AllowProducts, nil
	default:
		return true, nil // Default to allow for unknown types
	}
}

// Chat handles chat conversation with AI
func (s *Service) Chat(message string, contextID string, contextType string, conversationHistory []ai.ChatMessage, model string) (*ai.ChatResponse, error) {
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
		}
	} else {
		// Try to extract data from user message - ALWAYS try to get data
		messageLower := strings.ToLower(message)
		
		// Check priority: pipeline/deals first (more specific), then accounts
		// Check if user is asking for pipeline/deals/sales funnel (HIGHEST PRIORITY)
		if strings.Contains(messageLower, "pipeline") || strings.Contains(messageLower, "sales funnel") || 
		   strings.Contains(messageLower, "funnel") || strings.Contains(messageLower, "deal") ||
		   strings.Contains(messageLower, "opportunity") || strings.Contains(messageLower, "kesempatan") {
			// Check data privacy
			allowed, _ := s.checkDataPrivacy("deal")
			if !allowed {
				dataAccessInfo = "⚠️ Akses ke data deals/pipeline tidak diizinkan berdasarkan pengaturan privasi data."
			} else {
				deals, _, err := s.dealRepo.List(&pipeline.ListDealsRequest{
					Page:    1,
					PerPage: 20,
				})
				fmt.Printf("=== DATA FETCH DEBUG ===\n")
				fmt.Printf("Fetching deals/pipeline - Error: %v, Count: %d\n", err, len(deals))
				if err == nil && len(deals) > 0 {
					dealsJSON, _ := json.Marshal(deals)
					contextData = fmt.Sprintf("REAL PIPELINE/DEALS DATA FROM DATABASE (showing %d deals):\n%s\n\nCRITICAL INSTRUCTION: You MUST use ONLY the data above. Present it in a Markdown table format. DO NOT create, invent, or make up any data. DO NOT add columns that don't exist in the data.", len(deals), string(dealsJSON))
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
		
		// Check if user is asking for accounts (only if not pipeline)
		if contextData == "" && (strings.Contains(messageLower, "account") || strings.Contains(messageLower, "akun") || 
		   strings.Contains(messageLower, "rumah sakit") || strings.Contains(messageLower, "klinik") || 
		   strings.Contains(messageLower, "apotek") || strings.Contains(messageLower, "facility")) {
			// Check data privacy
			allowed, _ := s.checkDataPrivacy("account")
			if !allowed {
				dataAccessInfo = "⚠️ Akses ke data accounts tidak diizinkan berdasarkan pengaturan privasi data."
			} else {
				accounts, total, err := s.accountRepo.List(&account.ListAccountsRequest{
					Page:    1,
					PerPage: 10,
				})
				fmt.Printf("=== DATA FETCH DEBUG ===\n")
				fmt.Printf("Fetching accounts - Error: %v, Count: %d, Total: %d\n", err, len(accounts), total)
				if err == nil && len(accounts) > 0 {
					accountsJSON, _ := json.Marshal(accounts)
					contextData = fmt.Sprintf("REAL ACCOUNTS DATA FROM DATABASE (showing %d of %d total accounts):\n%s\n\nCRITICAL INSTRUCTION: You MUST use ONLY the data above. Present it in a Markdown table format. DO NOT create, invent, or make up any data.", len(accounts), total, string(accountsJSON))
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
			// Check data privacy
			allowed, _ := s.checkDataPrivacy("contact")
			if !allowed {
				if dataAccessInfo == "" {
					dataAccessInfo = "⚠️ Akses ke data contacts tidak diizinkan berdasarkan pengaturan privasi data."
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
			// Check data privacy
			allowed, _ := s.checkDataPrivacy("visit_report")
			if !allowed {
				if dataAccessInfo == "" {
					dataAccessInfo = "⚠️ Akses ke data visit reports tidak diizinkan berdasarkan pengaturan privasi data."
				}
			} else {
				visitReports, _, err := s.visitReportRepo.List(&visit_report.ListVisitReportsRequest{
					Page:    1,
					PerPage: 10,
				})
				if err == nil && len(visitReports) > 0 {
					visitReportsJSON, _ := json.Marshal(visitReports)
					if contextData != "" {
						contextData += "\n\n"
					}
					contextData += fmt.Sprintf("REAL VISIT REPORTS DATA FROM DATABASE (showing %d visit reports):\n%s\n\nIMPORTANT: You MUST use ONLY this data. DO NOT create example data.", len(visitReports), string(visitReportsJSON))
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
		
		// Check if user is asking for forecast data (only if no data fetched yet)
		if contextData == "" && (strings.Contains(messageLower, "forecast") || strings.Contains(messageLower, "grafik forecast") || 
		   strings.Contains(messageLower, "prediksi") || strings.Contains(messageLower, "ramalan")) {
			// Try to get forecast data for current month, quarter, and year
			now := time.Now()
			
			// Get monthly forecast
			monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
			monthEnd := monthStart.AddDate(0, 1, 0).Add(-time.Second)
			monthForecast, err := s.dealRepo.GetForecast("month", monthStart, monthEnd)
			
			if err == nil && monthForecast != nil {
				forecastJSON, _ := json.Marshal(monthForecast)
				if contextData != "" {
					contextData += "\n\n"
				}
				contextData += fmt.Sprintf("REAL FORECAST DATA FROM DATABASE (Current Month):\n%s\n\nCRITICAL: You MUST use ONLY this forecast data. DO NOT create, invent, or make up any forecast data. If forecast data is empty or incomplete, inform the user that forecast data is not available.", string(forecastJSON))
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
			// Check data privacy
			allowed, _ := s.checkDataPrivacy("account")
			if !allowed {
				dataAccessInfo = "⚠️ Akses ke data accounts tidak diizinkan berdasarkan pengaturan privasi data."
			} else {
				accounts, total, err := s.accountRepo.List(&account.ListAccountsRequest{
					Page:    1,
					PerPage: 10,
				})
				fmt.Printf("=== DATA FETCH DEBUG (GENERAL REQUEST) ===\n")
				fmt.Printf("User asked for general data, fetching accounts - Error: %v, Count: %d, Total: %d\n", err, len(accounts), total)
				if err == nil && len(accounts) > 0 {
					accountsJSON, _ := json.Marshal(accounts)
					contextData = fmt.Sprintf("REAL ACCOUNTS DATA FROM DATABASE (showing %d of %d total accounts):\n%s\n\nCRITICAL INSTRUCTION: You MUST use ONLY the data above. Present it in a Markdown table format. DO NOT create, invent, or make up any data. DO NOT add columns that don't exist in the data.", len(accounts), total, string(accountsJSON))
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

	// Build system prompt based on context
	systemPrompt := BuildSystemPrompt(contextID, contextType, contextData, dataAccessInfo, selectedModel, settings.Provider)

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

	// Call Cerebras API
	response, err := s.cerebrasClient.Chat(&cerebras.ChatRequest{
		Messages:   messages,
		MaxTokens:  1000, // Increased for better responses with data
		Temperature: 0.7,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to generate response: %w", err)
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

// parseVisitReportInsight parses AI response into VisitReportInsight
func (s *Service) parseVisitReportInsight(text string) (*ai.VisitReportInsight, error) {
	// Try to extract JSON from response
	jsonStart := strings.Index(text, "{")
	jsonEnd := strings.LastIndex(text, "}")

	if jsonStart == -1 || jsonEnd == -1 {
		return nil, fmt.Errorf("no JSON found in response")
	}

	jsonStr := text[jsonStart : jsonEnd+1]

	var insight ai.VisitReportInsight
	if err := json.Unmarshal([]byte(jsonStr), &insight); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %w", err)
	}

	return &insight, nil
}


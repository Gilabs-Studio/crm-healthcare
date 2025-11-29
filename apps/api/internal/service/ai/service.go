package ai

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/gilabs/crm-healthcare/api/internal/domain/account"
	"github.com/gilabs/crm-healthcare/api/internal/domain/ai"
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
	apiKey string,
) *Service {
	return &Service{
		cerebrasClient:  cerebrasClient,
		visitReportRepo: visitReportRepo,
		accountRepo:     accountRepo,
		contactRepo:     contactRepo,
		dealRepo:        dealRepo,
		activityRepo:    activityRepo,
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

// Chat handles chat conversation with AI
func (s *Service) Chat(message string, contextID string, contextType string) (*ai.ChatResponse, error) {
	// Validate API key
	if err := s.validateAPIKey(); err != nil {
		return nil, fmt.Errorf("AI service not configured: %w", err)
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
		
		// If user asks for any data, try to fetch accounts first (most common)
		// Check if user is asking for accounts or general data
		if strings.Contains(messageLower, "account") || strings.Contains(messageLower, "akun") || 
		   strings.Contains(messageLower, "rumah sakit") || strings.Contains(messageLower, "klinik") || 
		   strings.Contains(messageLower, "apotek") || strings.Contains(messageLower, "facility") ||
		   strings.Contains(messageLower, "data") || strings.Contains(messageLower, "tampilkan") ||
		   strings.Contains(messageLower, "show") || strings.Contains(messageLower, "list") ||
		   strings.Contains(messageLower, "lihat") || strings.Contains(messageLower, "contoh") {
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
		
		// Check if user is asking for contacts
		if strings.Contains(messageLower, "contact") || strings.Contains(messageLower, "kontak") || 
		   strings.Contains(messageLower, "dokter") || strings.Contains(messageLower, "apoteker") {
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
		
		// Check if user is asking for deals
		if strings.Contains(messageLower, "deal") || strings.Contains(messageLower, "opportunity") || 
		   strings.Contains(messageLower, "penjualan") || strings.Contains(messageLower, "nilai") {
			deals, _, err := s.dealRepo.List(&pipeline.ListDealsRequest{
				Page:    1,
				PerPage: 10,
			})
			if err == nil && len(deals) > 0 {
				dealsJSON, _ := json.Marshal(deals)
				if contextData != "" {
					contextData += "\n\n"
				}
				contextData += fmt.Sprintf("REAL DEALS DATA FROM DATABASE (showing %d deals):\n%s\n\nIMPORTANT: You MUST use ONLY this data. DO NOT create example data.", len(deals), string(dealsJSON))
				if contextType == "" {
					contextType = "deal"
				}
			} else {
				if dataAccessInfo == "" {
					dataAccessInfo = "⚠️ Tidak dapat mengakses data deals dari database. Data mungkin tidak tersedia."
				}
			}
		}
		
		// Check if user is asking for visit reports
		if strings.Contains(messageLower, "visit") || strings.Contains(messageLower, "kunjungan") || 
		   strings.Contains(messageLower, "laporan kunjungan") {
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

	// Build system prompt based on context
	systemPrompt := BuildSystemPrompt(contextID, contextType, contextData, dataAccessInfo)

	// Logging untuk debugging
	fmt.Printf("=== AI CHAT DEBUG ===\n")
	fmt.Printf("User message: %s\n", message)
	fmt.Printf("Context ID: %s\n", contextID)
	fmt.Printf("Context Type: %s\n", contextType)
	fmt.Printf("Context Data Length: %d\n", len(contextData))
	if len(contextData) > 0 {
		fmt.Printf("Context Data Preview (first 500 chars): %s\n", contextData[:min(500, len(contextData))])
	}
	fmt.Printf("Data Access Info: %s\n", dataAccessInfo)
	fmt.Printf("System Prompt Length: %d\n", len(systemPrompt))
	fmt.Printf("========================\n")

	// Build messages
	messages := []cerebras.ChatMessage{
		{
			Role:    "system",
			Content: systemPrompt,
		},
		{
			Role:    "user",
			Content: message,
		},
	}

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


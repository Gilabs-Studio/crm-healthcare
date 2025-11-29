package ai

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/gilabs/crm-healthcare/api/internal/domain/ai"
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
	if contextID != "" && contextType != "" {
		switch contextType {
		case "visit_report":
			visitReport, err := s.visitReportRepo.FindByID(contextID)
			if err == nil {
				visitReportJSON, _ := json.Marshal(visitReport)
				contextData = string(visitReportJSON)
			}
		case "deal":
			deal, err := s.dealRepo.FindByID(contextID)
			if err == nil {
				dealJSON, _ := json.Marshal(deal)
				contextData = string(dealJSON)
			}
		case "contact":
			contact, err := s.contactRepo.FindByID(contextID)
			if err == nil {
				contactJSON, _ := json.Marshal(contact)
				contextData = string(contactJSON)
			}
		case "account":
			account, err := s.accountRepo.FindByID(contextID)
			if err == nil {
				accountJSON, _ := json.Marshal(account)
				contextData = string(accountJSON)
			}
		}
	}

	// Build system prompt based on context
	systemPrompt := BuildSystemPrompt(contextID, contextType, contextData)

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
		MaxTokens:  500,
		Temperature: 0.7,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to generate response: %w", err)
	}

	return &ai.ChatResponse{
		Message: response.Message.Content,
		Tokens:  response.Tokens,
	}, nil
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


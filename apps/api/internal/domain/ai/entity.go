package ai

// InsightType represents type of AI insight
type InsightType string

const (
	InsightTypeVisitReport InsightType = "visit_report"
	InsightTypeDeal        InsightType = "deal"
	InsightTypeContact     InsightType = "contact"
	InsightTypeAccount     InsightType = "account"
	InsightTypePipeline    InsightType = "pipeline"
)

// VisitReportInsight represents AI insight for visit report
type VisitReportInsight struct {
	Summary     string   `json:"summary"`
	ActionItems []string `json:"action_items"`
	Sentiment   string   `json:"sentiment"` // positive, neutral, negative
	KeyPoints   []string `json:"key_points"`
	Recommendations []string `json:"recommendations"`
}

// DealInsight represents AI insight for deal
type DealInsight struct {
	WinProbability    float64  `json:"win_probability"`
	NextSteps        []string `json:"next_steps"`
	RiskFactors      []string `json:"risk_factors"`
	Recommendations  []string `json:"recommendations"`
	ConfidenceLevel  string   `json:"confidence_level"` // high, medium, low
}

// ContactInsight represents AI insight for contact
type ContactInsight struct {
	CommunicationStyle string   `json:"communication_style"`
	Preferences        []string `json:"preferences"`
	BestContactTime    string   `json:"best_contact_time"`
	Recommendations    []string `json:"recommendations"`
}

// AccountInsight represents AI insight for account
type AccountInsight struct {
	HealthScore      int      `json:"health_score"` // 0-100
	RiskIndicators   []string `json:"risk_indicators"`
	Opportunities    []string `json:"opportunities"`
	Recommendations  []string `json:"recommendations"`
}

// PipelineInsight represents AI insight for pipeline
type PipelineInsight struct {
	Forecast         float64  `json:"forecast"`
	ConfidenceLevel  string   `json:"confidence_level"`
	Trends           []string `json:"trends"`
	Recommendations  []string `json:"recommendations"`
}

// AnalyzeVisitReportRequest represents request to analyze visit report
type AnalyzeVisitReportRequest struct {
	VisitReportID string `json:"visit_report_id" binding:"required,uuid"`
}

// AnalyzeDealRequest represents request to analyze deal
type AnalyzeDealRequest struct {
	DealID string `json:"deal_id" binding:"required,uuid"`
}

// AnalyzeContactRequest represents request to analyze contact
type AnalyzeContactRequest struct {
	ContactID string `json:"contact_id" binding:"required,uuid"`
}

// AnalyzeAccountRequest represents request to analyze account
type AnalyzeAccountRequest struct {
	AccountID string `json:"account_id" binding:"required,uuid"`
}

// AnalyzePipelineRequest represents request to analyze pipeline
type AnalyzePipelineRequest struct {
	// Optional filters
	StartDate string `json:"start_date,omitempty"`
	EndDate   string `json:"end_date,omitempty"`
}

// ChatMessage represents a single chat message in conversation history
type ChatMessage struct {
	Role    string `json:"role"` // "user" or "assistant"
	Content string `json:"content"`
}

// ChatRequest represents chat request
type ChatRequest struct {
	Message         string        `json:"message" binding:"required,min=1"`
	Context         string        `json:"context,omitempty"` // Optional context (visit_report_id, deal_id, etc.)
	ContextType     string        `json:"context_type,omitempty"` // visit_report, deal, contact, account
	ConversationHistory []ChatMessage `json:"conversation_history,omitempty"` // Previous messages in the conversation
	Model           string        `json:"model,omitempty"` // Optional model override
}

// ChatResponse represents chat response
type ChatResponse struct {
	Message string `json:"message"`
	Tokens  int    `json:"tokens,omitempty"`
}

// InsightResponse represents generic insight response
type InsightResponse struct {
	Type    InsightType   `json:"type"`
	Data    interface{}   `json:"data"`
	Tokens  int           `json:"tokens,omitempty"`
}


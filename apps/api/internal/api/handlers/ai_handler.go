package handlers

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/ai"
	aiservice "github.com/gilabs/crm-healthcare/api/internal/service/ai"
	"github.com/gilabs/crm-healthcare/api/pkg/errors"
	"github.com/gilabs/crm-healthcare/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type AIHandler struct {
	aiService *aiservice.Service
}

func NewAIHandler(aiService *aiservice.Service) *AIHandler {
	return &AIHandler{
		aiService: aiService,
	}
}

// AnalyzeVisitReport handles visit report analysis request
func (h *AIHandler) AnalyzeVisitReport(c *gin.Context) {
	var req ai.AnalyzeVisitReportRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	insight, tokens, err := h.aiService.AnalyzeVisitReport(req.VisitReportID)
	if err != nil {
		// Check for specific errors
		if err.Error() == "AI service not configured: Cerebras API key is empty" {
			errors.ErrorResponse(c, "AI_SERVICE_NOT_CONFIGURED", map[string]interface{}{
				"error": "Cerebras API key is not configured. Please set CEREBRAS_API_KEY environment variable",
			}, nil)
			return
		}
		errors.ErrorResponse(c, "AI_ANALYSIS_FAILED", map[string]interface{}{
			"error": err.Error(),
		}, nil)
		return
	}

	response.SuccessResponse(c, &ai.InsightResponse{
		Type:   ai.InsightTypeVisitReport,
		Data:   insight,
		Tokens: tokens,
	}, nil)
}

// Chat handles chat request
func (h *AIHandler) Chat(c *gin.Context) {
	var req ai.ChatRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	// Use conversation history if provided, otherwise use empty slice
	history := req.ConversationHistory
	if history == nil {
		history = []ai.ChatMessage{}
	}

	chatResponse, err := h.aiService.Chat(req.Message, req.Context, req.ContextType, history)
	if err != nil {
		// Check for specific errors
		if err.Error() == "AI service not configured: Cerebras API key is empty" {
			errors.ErrorResponse(c, "AI_SERVICE_NOT_CONFIGURED", map[string]interface{}{
				"error": "Cerebras API key is not configured. Please set CEREBRAS_API_KEY environment variable",
			}, nil)
			return
		}
		errors.ErrorResponse(c, "AI_CHAT_FAILED", map[string]interface{}{
			"error": err.Error(),
		}, nil)
		return
	}

	response.SuccessResponse(c, chatResponse, nil)
}


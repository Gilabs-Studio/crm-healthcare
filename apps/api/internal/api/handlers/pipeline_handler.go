package handlers

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/pipeline"
	pipelineservice "github.com/gilabs/crm-healthcare/api/internal/service/pipeline"
	"github.com/gilabs/crm-healthcare/api/pkg/errors"
	"github.com/gilabs/crm-healthcare/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type PipelineHandler struct {
	pipelineService *pipelineservice.Service
}

func NewPipelineHandler(pipelineService *pipelineservice.Service) *PipelineHandler {
	return &PipelineHandler{
		pipelineService: pipelineService,
	}
}

// ListStages handles list pipeline stages request
func (h *PipelineHandler) ListStages(c *gin.Context) {
	var req pipeline.ListPipelineStagesRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	stages, err := h.pipelineService.ListStages(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{
		Filters: map[string]interface{}{},
	}

	if req.IsActive != nil {
		meta.Filters["is_active"] = *req.IsActive
	}

	response.SuccessResponse(c, stages, meta)
}

// GetStageByID handles get pipeline stage by ID request
func (h *PipelineHandler) GetStageByID(c *gin.Context) {
	id := c.Param("id")

	stage, err := h.pipelineService.GetStageByID(id)
	if err != nil {
		if err == pipelineservice.ErrPipelineStageNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "pipeline_stage",
				"resource_id": id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, stage, nil)
}

// GetSummary handles get pipeline summary request
func (h *PipelineHandler) GetSummary(c *gin.Context) {
	summary, err := h.pipelineService.GetSummary()
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, summary, nil)
}

// GetForecast handles get forecast request
func (h *PipelineHandler) GetForecast(c *gin.Context) {
	periodType := c.DefaultQuery("period", "month")
	if periodType != "month" && periodType != "quarter" && periodType != "year" {
		periodType = "month"
	}

	forecast, err := h.pipelineService.GetForecast(periodType)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{
		Filters: map[string]interface{}{
			"period": periodType,
		},
	}

	response.SuccessResponse(c, forecast, meta)
}


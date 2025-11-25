package handlers

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/pipeline"
	pipelineservice "github.com/gilabs/crm-healthcare/api/internal/service/pipeline"
	"github.com/gilabs/crm-healthcare/api/pkg/errors"
	"github.com/gilabs/crm-healthcare/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type DealHandler struct {
	dealService *pipelineservice.Service
}

func NewDealHandler(dealService *pipelineservice.Service) *DealHandler {
	return &DealHandler{
		dealService: dealService,
	}
}

// List handles list deals request
func (h *DealHandler) List(c *gin.Context) {
	var req pipeline.ListDealsRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	deals, pagination, err := h.dealService.ListDeals(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{
		Pagination: &response.PaginationMeta{
			Page:       pagination.Page,
			PerPage:    pagination.PerPage,
			Total:      pagination.Total,
			TotalPages: pagination.TotalPages,
			HasNext:    pagination.Page < pagination.TotalPages,
			HasPrev:    pagination.Page > 1,
		},
		Filters: map[string]interface{}{},
	}

	if req.Search != "" {
		meta.Filters["search"] = req.Search
	}
	if req.StageID != "" {
		meta.Filters["stage_id"] = req.StageID
	}
	if req.AccountID != "" {
		meta.Filters["account_id"] = req.AccountID
	}
	if req.AssignedTo != "" {
		meta.Filters["assigned_to"] = req.AssignedTo
	}
	if req.Status != "" {
		meta.Filters["status"] = req.Status
	}
	if req.Source != "" {
		meta.Filters["source"] = req.Source
	}

	response.SuccessResponse(c, deals, meta)
}

// GetByID handles get deal by ID request
func (h *DealHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	deal, err := h.dealService.GetDealByID(id)
	if err != nil {
		if err == pipelineservice.ErrDealNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "deal",
				"resource_id": id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, deal, nil)
}

// Create handles create deal request
func (h *DealHandler) Create(c *gin.Context) {
	var req pipeline.CreateDealRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	// Get user ID from context
	userID := ""
	if userIDVal, exists := c.Get("user_id"); exists {
		if id, ok := userIDVal.(string); ok {
			userID = id
		}
	}

	createdDeal, err := h.dealService.CreateDeal(&req, userID)
	if err != nil {
		if err == pipelineservice.ErrDealNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource": "deal",
			}, nil)
			return
		}
		if err == pipelineservice.ErrAccountNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "account",
				"resource_id": req.AccountID,
			}, nil)
			return
		}
		if err == pipelineservice.ErrInvalidStage {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "pipeline_stage",
				"resource_id": req.StageID,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	if userID != "" {
		meta.CreatedBy = userID
	}

	response.SuccessResponseCreated(c, createdDeal, meta)
}

// Update handles update deal request
func (h *DealHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req pipeline.UpdateDealRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	updatedDeal, err := h.dealService.UpdateDeal(id, &req)
	if err != nil {
		if err == pipelineservice.ErrDealNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "deal",
				"resource_id": id,
			}, nil)
			return
		}
		if err == pipelineservice.ErrAccountNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "account",
				"resource_id": req.AccountID,
			}, nil)
			return
		}
		if err == pipelineservice.ErrInvalidStage {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "pipeline_stage",
				"resource_id": req.StageID,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	if userID, exists := c.Get("user_id"); exists {
		if id, ok := userID.(string); ok {
			meta.UpdatedBy = id
		}
	}

	response.SuccessResponse(c, updatedDeal, meta)
}

// Move handles move deal request
func (h *DealHandler) Move(c *gin.Context) {
	id := c.Param("id")
	var req pipeline.MoveDealRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	movedDeal, err := h.dealService.MoveDeal(id, &req)
	if err != nil {
		if err == pipelineservice.ErrDealNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "deal",
				"resource_id": id,
			}, nil)
			return
		}
		if err == pipelineservice.ErrInvalidStage {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "pipeline_stage",
				"resource_id": req.StageID,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	if userID, exists := c.Get("user_id"); exists {
		if id, ok := userID.(string); ok {
			meta.UpdatedBy = id
		}
	}

	response.SuccessResponse(c, movedDeal, meta)
}

// Delete handles delete deal request
func (h *DealHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	err := h.dealService.DeleteDeal(id)
	if err != nil {
		if err == pipelineservice.ErrDealNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "deal",
				"resource_id": id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}


package handlers

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/procedure"
	procedureservice "github.com/gilabs/crm-healthcare/api/internal/service/procedure"
	"github.com/gilabs/crm-healthcare/api/pkg/errors"
	"github.com/gilabs/crm-healthcare/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type ProcedureHandler struct {
	procedureService *procedureservice.Service
}

func NewProcedureHandler(procedureService *procedureservice.Service) *ProcedureHandler {
	return &ProcedureHandler{
		procedureService: procedureService,
	}
}

// List handles list procedures request
func (h *ProcedureHandler) List(c *gin.Context) {
	var req procedure.ListProceduresRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	procedures, pagination, err := h.procedureService.List(&req)
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
	if req.Status != "" {
		meta.Filters["status"] = req.Status
	}

	response.SuccessResponse(c, procedures, meta)
}

// GetByID handles get procedure by ID request
func (h *ProcedureHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	procedure, err := h.procedureService.GetByID(id)
	if err != nil {
		if err == procedureservice.ErrProcedureNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource": "procedure",
				"id":       id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, procedure, nil)
}

// Search handles search procedures request
func (h *ProcedureHandler) Search(c *gin.Context) {
	var req procedure.SearchProceduresRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	procedures, err := h.procedureService.Search(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, procedures, nil)
}

// Create handles create procedure request
func (h *ProcedureHandler) Create(c *gin.Context) {
	var req procedure.CreateProcedureRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	createdProcedure, err := h.procedureService.Create(&req)
	if err != nil {
		if err == procedureservice.ErrProcedureAlreadyExists {
			errors.ErrorResponse(c, "RESOURCE_ALREADY_EXISTS", map[string]interface{}{
				"resource": "procedure",
				"field":    "code",
				"value":    req.Code,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	if userID, exists := c.Get("user_id"); exists {
		if id, ok := userID.(string); ok {
			meta.CreatedBy = id
		}
	}

	response.SuccessResponseCreated(c, createdProcedure, meta)
}

// Update handles update procedure request
func (h *ProcedureHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req procedure.UpdateProcedureRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	updatedProcedure, err := h.procedureService.Update(id, &req)
	if err != nil {
		if err == procedureservice.ErrProcedureNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource": "procedure",
				"id":       id,
			}, nil)
			return
		}
		if err == procedureservice.ErrProcedureAlreadyExists {
			errors.ErrorResponse(c, "RESOURCE_ALREADY_EXISTS", map[string]interface{}{
				"resource": "procedure",
				"field":    "code",
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

	response.SuccessResponse(c, updatedProcedure, meta)
}

// Delete handles delete procedure request
func (h *ProcedureHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	err := h.procedureService.Delete(id)
	if err != nil {
		if err == procedureservice.ErrProcedureNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource": "procedure",
				"id":       id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}


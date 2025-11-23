package handlers

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/diagnosis"
	diagnosisservice "github.com/gilabs/crm-healthcare/api/internal/service/diagnosis"
	"github.com/gilabs/crm-healthcare/api/pkg/errors"
	"github.com/gilabs/crm-healthcare/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type DiagnosisHandler struct {
	diagnosisService *diagnosisservice.Service
}

func NewDiagnosisHandler(diagnosisService *diagnosisservice.Service) *DiagnosisHandler {
	return &DiagnosisHandler{
		diagnosisService: diagnosisService,
	}
}

// List handles list diagnoses request
func (h *DiagnosisHandler) List(c *gin.Context) {
	var req diagnosis.ListDiagnosesRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	diagnoses, pagination, err := h.diagnosisService.List(&req)
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

	response.SuccessResponse(c, diagnoses, meta)
}

// GetByID handles get diagnosis by ID request
func (h *DiagnosisHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	diagnosis, err := h.diagnosisService.GetByID(id)
	if err != nil {
		if err == diagnosisservice.ErrDiagnosisNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource": "diagnosis",
				"id":       id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, diagnosis, nil)
}

// Search handles search diagnoses request
func (h *DiagnosisHandler) Search(c *gin.Context) {
	var req diagnosis.SearchDiagnosesRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	diagnoses, err := h.diagnosisService.Search(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, diagnoses, nil)
}

// Create handles create diagnosis request
func (h *DiagnosisHandler) Create(c *gin.Context) {
	var req diagnosis.CreateDiagnosisRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	createdDiagnosis, err := h.diagnosisService.Create(&req)
	if err != nil {
		if err == diagnosisservice.ErrDiagnosisAlreadyExists {
			errors.ErrorResponse(c, "RESOURCE_ALREADY_EXISTS", map[string]interface{}{
				"resource": "diagnosis",
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

	response.SuccessResponseCreated(c, createdDiagnosis, meta)
}

// Update handles update diagnosis request
func (h *DiagnosisHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req diagnosis.UpdateDiagnosisRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	updatedDiagnosis, err := h.diagnosisService.Update(id, &req)
	if err != nil {
		if err == diagnosisservice.ErrDiagnosisNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource": "diagnosis",
				"id":       id,
			}, nil)
			return
		}
		if err == diagnosisservice.ErrDiagnosisAlreadyExists {
			errors.ErrorResponse(c, "RESOURCE_ALREADY_EXISTS", map[string]interface{}{
				"resource": "diagnosis",
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

	response.SuccessResponse(c, updatedDiagnosis, meta)
}

// Delete handles delete diagnosis request
func (h *DiagnosisHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	err := h.diagnosisService.Delete(id)
	if err != nil {
		if err == diagnosisservice.ErrDiagnosisNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource": "diagnosis",
				"id":       id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}


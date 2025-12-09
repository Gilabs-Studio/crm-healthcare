package handlers

import (
	"strings"

	"github.com/gilabs/crm-healthcare/api/internal/domain/visit_report"
	fileservice "github.com/gilabs/crm-healthcare/api/internal/service/file"
	visitreportservice "github.com/gilabs/crm-healthcare/api/internal/service/visit_report"
	"github.com/gilabs/crm-healthcare/api/pkg/errors"
	"github.com/gilabs/crm-healthcare/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type VisitReportHandler struct {
	visitReportService *visitreportservice.Service
	fileService        *fileservice.Service
}

func NewVisitReportHandler(visitReportService *visitreportservice.Service, fileService *fileservice.Service) *VisitReportHandler {
	return &VisitReportHandler{
		visitReportService: visitReportService,
		fileService:        fileService,
	}
}

// List handles list visit reports request
func (h *VisitReportHandler) List(c *gin.Context) {
	var req visit_report.ListVisitReportsRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	visitReports, pagination, err := h.visitReportService.List(&req)
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
	if req.AccountID != "" {
		meta.Filters["account_id"] = req.AccountID
	}
	if req.SalesRepID != "" {
		meta.Filters["sales_rep_id"] = req.SalesRepID
	}

	response.SuccessResponse(c, visitReports, meta)
}

// GetByID handles get visit report by ID request
func (h *VisitReportHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	visitReport, err := h.visitReportService.GetByID(id)
	if err != nil {
		if err == visitreportservice.ErrVisitReportNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "visit_report",
				"resource_id": id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, visitReport, nil)
}

// Create handles create visit report request
func (h *VisitReportHandler) Create(c *gin.Context) {
	var req visit_report.CreateVisitReportRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		errors.UnauthorizedResponse(c, "")
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		errors.UnauthorizedResponse(c, "")
		return
	}

	// Set SalesRepID from authenticated user
	req.SalesRepID = userIDStr

	createdVisitReport, err := h.visitReportService.Create(&req)
	if err != nil {
		if err == visitreportservice.ErrAccountNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource": "account",
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

	response.SuccessResponseCreated(c, createdVisitReport, meta)
}

// Update handles update visit report request
func (h *VisitReportHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req visit_report.UpdateVisitReportRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	updatedVisitReport, err := h.visitReportService.Update(id, &req)
	if err != nil {
		if err == visitreportservice.ErrVisitReportNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "visit_report",
				"resource_id": id,
			}, nil)
			return
		}
		if err == visitreportservice.ErrInvalidStatus {
			errors.ErrorResponse(c, "INVALID_STATUS", map[string]interface{}{
				"message": "Cannot update visit report with current status",
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

	response.SuccessResponse(c, updatedVisitReport, meta)
}

// Delete handles delete visit report request
func (h *VisitReportHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	err := h.visitReportService.Delete(id)
	if err != nil {
		if err == visitreportservice.ErrVisitReportNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "visit_report",
				"resource_id": id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// Get user ID for meta
	meta := &response.Meta{}
	if userIDVal, exists := c.Get("user_id"); exists {
		if id, ok := userIDVal.(string); ok {
			meta.DeletedBy = id
		}
	}

	response.SuccessResponseDeleted(c, "visit_report", id, meta)
}

// CheckIn handles check-in request
func (h *VisitReportHandler) CheckIn(c *gin.Context) {
	id := c.Param("id")
	var req visit_report.CheckInRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		errors.UnauthorizedResponse(c, "")
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		errors.UnauthorizedResponse(c, "")
		return
	}

	visitReport, err := h.visitReportService.CheckIn(id, &req, userIDStr)
	if err != nil {
		if err == visitreportservice.ErrVisitReportNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "visit_report",
				"resource_id": id,
			}, nil)
			return
		}
		errors.ErrorResponse(c, "INVALID_OPERATION", map[string]interface{}{
			"message": err.Error(),
		}, nil)
		return
	}

	response.SuccessResponse(c, visitReport, nil)
}

// CheckOut handles check-out request
func (h *VisitReportHandler) CheckOut(c *gin.Context) {
	id := c.Param("id")
	var req visit_report.CheckOutRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		errors.UnauthorizedResponse(c, "")
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		errors.UnauthorizedResponse(c, "")
		return
	}

	visitReport, err := h.visitReportService.CheckOut(id, &req, userIDStr)
	if err != nil {
		if err == visitreportservice.ErrVisitReportNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "visit_report",
				"resource_id": id,
			}, nil)
			return
		}
		errors.ErrorResponse(c, "INVALID_OPERATION", map[string]interface{}{
			"message": err.Error(),
		}, nil)
		return
	}

	response.SuccessResponse(c, visitReport, nil)
}

// Approve handles approve visit report request
func (h *VisitReportHandler) Approve(c *gin.Context) {
	id := c.Param("id")

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		errors.UnauthorizedResponse(c, "")
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		errors.UnauthorizedResponse(c, "")
		return
	}

	visitReport, err := h.visitReportService.Approve(id, userIDStr)
	if err != nil {
		if err == visitreportservice.ErrVisitReportNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "visit_report",
				"resource_id": id,
			}, nil)
			return
		}
		if err == visitreportservice.ErrInvalidStatus {
			errors.ErrorResponse(c, "INVALID_STATUS", map[string]interface{}{
				"message": "Cannot approve visit report with current status",
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, visitReport, nil)
}

// Reject handles reject visit report request
func (h *VisitReportHandler) Reject(c *gin.Context) {
	id := c.Param("id")
	var req visit_report.RejectRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		errors.UnauthorizedResponse(c, "")
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		errors.UnauthorizedResponse(c, "")
		return
	}

	visitReport, err := h.visitReportService.Reject(id, &req, userIDStr)
	if err != nil {
		if err == visitreportservice.ErrVisitReportNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "visit_report",
				"resource_id": id,
			}, nil)
			return
		}
		if err == visitreportservice.ErrInvalidStatus {
			errors.ErrorResponse(c, "INVALID_STATUS", map[string]interface{}{
				"message": "Cannot reject visit report with current status",
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, visitReport, nil)
}

// UploadPhoto handles photo upload request
// Supports both multipart/form-data (file upload) and JSON (photo_url)
func (h *VisitReportHandler) UploadPhoto(c *gin.Context) {
	id := c.Param("id")
	var photoURL string

	// Check if request is multipart (file upload)
	contentType := c.GetHeader("Content-Type")
	if strings.HasPrefix(contentType, "multipart/form-data") {
		// Handle multipart file upload
		file, err := c.FormFile("photo")
		if err != nil {
			// Try alternative field names
			file, err = c.FormFile("file")
			if err != nil {
				file, err = c.FormFile("image")
				if err != nil {
					errors.ErrorResponse(c, "INVALID_REQUEST", map[string]interface{}{
						"message": "No file provided. Use 'photo', 'file', or 'image' field name",
					}, nil)
					return
				}
			}
		}

		// Upload and compress image
		uploadedURL, err := h.fileService.UploadImage(file)
		if err != nil {
			errors.ErrorResponse(c, "UPLOAD_FAILED", map[string]interface{}{
				"message": err.Error(),
			}, nil)
			return
		}

		photoURL = uploadedURL
	} else {
		// Handle JSON request with photo_url
		var req visit_report.UploadPhotoRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			if validationErrors, ok := err.(validator.ValidationErrors); ok {
				errors.HandleValidationError(c, validationErrors)
				return
			}
			errors.InvalidRequestBodyResponse(c)
			return
		}
		photoURL = req.PhotoURL
	}

	// Create request for service
	req := visit_report.UploadPhotoRequest{
		PhotoURL: photoURL,
	}

	visitReport, err := h.visitReportService.UploadPhoto(id, &req)
	if err != nil {
		if err == visitreportservice.ErrVisitReportNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "visit_report",
				"resource_id": id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, visitReport, nil)
}


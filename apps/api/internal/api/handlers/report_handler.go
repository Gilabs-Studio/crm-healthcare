package handlers

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/report"
	reportservice "github.com/gilabs/crm-healthcare/api/internal/service/report"
	"github.com/gilabs/crm-healthcare/api/pkg/errors"
	"github.com/gilabs/crm-healthcare/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

type ReportHandler struct {
	reportService *reportservice.Service
}

func NewReportHandler(reportService *reportservice.Service) *ReportHandler {
	return &ReportHandler{
		reportService: reportService,
	}
}

// GetVisitReportReport handles visit report report request
func (h *ReportHandler) GetVisitReportReport(c *gin.Context) {
	var req report.ReportRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	reportData, err := h.reportService.GetVisitReportReport(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, reportData, nil)
}

// GetPipelineReport handles pipeline report request
func (h *ReportHandler) GetPipelineReport(c *gin.Context) {
	var req report.ReportRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	reportData, err := h.reportService.GetPipelineReport(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, reportData, nil)
}

// GetSalesPerformanceReport handles sales performance report request
func (h *ReportHandler) GetSalesPerformanceReport(c *gin.Context) {
	var req report.ReportRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	reportData, err := h.reportService.GetSalesPerformanceReport(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, reportData, nil)
}

// GetAccountActivityReport handles account activity report request
func (h *ReportHandler) GetAccountActivityReport(c *gin.Context) {
	var req report.ReportRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	reportData, err := h.reportService.GetAccountActivityReport(&req)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource":    "account",
				"resource_id": req.AccountID,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, reportData, nil)
}


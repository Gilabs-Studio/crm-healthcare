package handlers

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/dashboard"
	dashboardservice "github.com/gilabs/crm-healthcare/api/internal/service/dashboard"
	"github.com/gilabs/crm-healthcare/api/pkg/errors"
	"github.com/gilabs/crm-healthcare/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type DashboardHandler struct {
	dashboardService *dashboardservice.Service
}

func NewDashboardHandler(dashboardService *dashboardservice.Service) *DashboardHandler {
	return &DashboardHandler{
		dashboardService: dashboardService,
	}
}

// GetOverview handles dashboard overview request
func (h *DashboardHandler) GetOverview(c *gin.Context) {
	var req dashboard.DashboardRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	overview, err := h.dashboardService.GetOverview(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, overview, nil)
}

// GetVisitStatistics handles visit statistics request
func (h *DashboardHandler) GetVisitStatistics(c *gin.Context) {
	var req dashboard.DashboardRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	stats, err := h.dashboardService.GetVisitStatistics(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, stats, nil)
}

// GetPipelineSummary handles pipeline summary request
func (h *DashboardHandler) GetPipelineSummary(c *gin.Context) {
	var req dashboard.DashboardRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	summary, err := h.dashboardService.GetPipelineSummary(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, summary, nil)
}

// GetTopAccounts handles top accounts request
func (h *DashboardHandler) GetTopAccounts(c *gin.Context) {
	var req dashboard.DashboardRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	topAccounts, err := h.dashboardService.GetTopAccounts(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, topAccounts, nil)
}

// GetTopSalesRep handles top sales rep request
func (h *DashboardHandler) GetTopSalesRep(c *gin.Context) {
	var req dashboard.DashboardRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	topSalesRep, err := h.dashboardService.GetTopSalesRep(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, topSalesRep, nil)
}

// GetRecentActivities handles recent activities request
func (h *DashboardHandler) GetRecentActivities(c *gin.Context) {
	var req dashboard.DashboardRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	activities, err := h.dashboardService.GetRecentActivities(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, activities, nil)
}

// GetActivityTrends handles activity trends request
func (h *DashboardHandler) GetActivityTrends(c *gin.Context) {
	var req dashboard.DashboardRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	trends, err := h.dashboardService.GetActivityTrends(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, trends, nil)
}


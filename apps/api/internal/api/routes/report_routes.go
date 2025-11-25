package routes

import (
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupReportRoutes(router *gin.RouterGroup, reportHandler *handlers.ReportHandler, jwtManager *jwt.JWTManager) {
	reports := router.Group("/reports")
	reports.Use(middleware.AuthMiddleware(jwtManager))
	{
		reports.GET("/visit-reports", reportHandler.GetVisitReportReport)
		reports.GET("/pipeline", reportHandler.GetPipelineReport)
		reports.GET("/sales-performance", reportHandler.GetSalesPerformanceReport)
		reports.GET("/account-activity", reportHandler.GetAccountActivityReport)
	}
}


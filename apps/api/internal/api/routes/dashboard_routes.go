package routes

import (
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupDashboardRoutes(router *gin.RouterGroup, dashboardHandler *handlers.DashboardHandler, jwtManager *jwt.JWTManager) {
	dashboard := router.Group("/dashboard")
	dashboard.Use(middleware.AuthMiddleware(jwtManager))
	{
		dashboard.GET("/overview", dashboardHandler.GetOverview)
		dashboard.GET("/visits", dashboardHandler.GetVisitStatistics)
		dashboard.GET("/activity-trends", dashboardHandler.GetActivityTrends)
		dashboard.GET("/pipeline", dashboardHandler.GetPipelineSummary)
		dashboard.GET("/top-accounts", dashboardHandler.GetTopAccounts)
		dashboard.GET("/top-sales-rep", dashboardHandler.GetTopSalesRep)
		dashboard.GET("/recent-activities", dashboardHandler.GetRecentActivities)
	}
}


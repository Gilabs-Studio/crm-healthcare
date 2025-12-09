package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
)

// SetupLeadRoutes sets up lead routes
func SetupLeadRoutes(router *gin.RouterGroup, leadHandler *handlers.LeadHandler, jwtManager *jwt.JWTManager) {
	leads := router.Group("/leads")
	leads.Use(middleware.AuthMiddleware(jwtManager))
	{
		leads.GET("", leadHandler.List)
		leads.GET("/form-data", leadHandler.GetFormData)
		leads.GET("/analytics", leadHandler.GetAnalytics)
		leads.GET("/:id", leadHandler.GetByID)
		leads.POST("", leadHandler.Create)
		leads.PUT("/:id", leadHandler.Update)
		leads.DELETE("/:id", leadHandler.Delete)
		leads.POST("/:id/convert", leadHandler.Convert)
		leads.POST("/:id/create-account", leadHandler.CreateAccountFromLead)
		// Lead related resources
		leads.GET("/:id/visit-reports", leadHandler.GetVisitReportsByLead)
		leads.GET("/:id/activities", leadHandler.GetActivitiesByLead)
	}
}







package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
)

func SetupMasterDataRoutes(router *gin.RouterGroup, diagnosisHandler *handlers.DiagnosisHandler, procedureHandler *handlers.ProcedureHandler, categoryHandler *handlers.CategoryHandler, jwtManager *jwt.JWTManager) {
	masterData := router.Group("/master-data")
	masterData.Use(middleware.AuthMiddleware(jwtManager))
	{
		// Diagnosis routes
		diagnosis := masterData.Group("/diagnosis")
		{
			diagnosis.GET("", diagnosisHandler.List)
			diagnosis.GET("/search", diagnosisHandler.Search)
			diagnosis.GET("/:id", diagnosisHandler.GetByID)
			diagnosis.POST("", diagnosisHandler.Create)
			diagnosis.PUT("/:id", diagnosisHandler.Update)
			diagnosis.DELETE("/:id", diagnosisHandler.Delete)
		}

		// Procedure routes
		procedures := masterData.Group("/procedures")
		{
			procedures.GET("", procedureHandler.List)
			procedures.GET("/search", procedureHandler.Search)
			procedures.GET("/:id", procedureHandler.GetByID)
			procedures.POST("", procedureHandler.Create)
			procedures.PUT("/:id", procedureHandler.Update)
			procedures.DELETE("/:id", procedureHandler.Delete)
		}

		// Category routes
		categories := masterData.Group("/categories")
		{
			categories.GET("", categoryHandler.List)
			categories.GET("/:id", categoryHandler.GetByID)
			categories.POST("", categoryHandler.Create)
			categories.PUT("/:id", categoryHandler.Update)
			categories.DELETE("/:id", categoryHandler.Delete)
		}
	}
}


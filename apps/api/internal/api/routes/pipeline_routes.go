package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
)

// SetupPipelineRoutes sets up pipeline routes
func SetupPipelineRoutes(router *gin.RouterGroup, pipelineHandler *handlers.PipelineHandler, dealHandler *handlers.DealHandler, jwtManager *jwt.JWTManager) {
	pipelines := router.Group("/pipelines")
	pipelines.Use(middleware.AuthMiddleware(jwtManager))
	{
	// Pipeline stages
	pipelines.GET("", pipelineHandler.ListStages)
	pipelines.GET("/:id", pipelineHandler.GetStageByID)
	pipelines.POST("", pipelineHandler.CreateStage)
	pipelines.PUT("/:id", pipelineHandler.UpdateStage)
	pipelines.DELETE("/:id", pipelineHandler.DeleteStage)
	pipelines.PUT("/order", pipelineHandler.UpdateStagesOrder)
	
	// Pipeline summary and forecast
	pipelines.GET("/summary", pipelineHandler.GetSummary)
	pipelines.GET("/forecast", pipelineHandler.GetForecast)
	}

	// Deals routes
	deals := router.Group("/deals")
	deals.Use(middleware.AuthMiddleware(jwtManager))
	{
		deals.GET("", dealHandler.List)
		deals.GET("/:id", dealHandler.GetByID)
		deals.POST("", dealHandler.Create)
		deals.PUT("/:id", dealHandler.Update)
		deals.DELETE("/:id", dealHandler.Delete)
		deals.POST("/:id/move", dealHandler.Move)
	}
}


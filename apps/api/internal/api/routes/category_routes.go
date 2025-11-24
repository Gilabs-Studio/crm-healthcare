package routes

import (
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupCategoryRoutes(router *gin.RouterGroup, categoryHandler *handlers.CategoryHandler, jwtManager *jwt.JWTManager) {
	categories := router.Group("/categories")
	categories.Use(middleware.AuthMiddleware(jwtManager))
	{
		categories.GET("", categoryHandler.List)
		categories.GET("/:id", categoryHandler.GetByID)
		categories.POST("", categoryHandler.Create)
		categories.PUT("/:id", categoryHandler.Update)
		categories.DELETE("/:id", categoryHandler.Delete)
	}
}


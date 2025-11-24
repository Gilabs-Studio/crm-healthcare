package routes

import (
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupAccountRoutes(router *gin.RouterGroup, accountHandler *handlers.AccountHandler, jwtManager *jwt.JWTManager) {
	accounts := router.Group("/accounts")
	accounts.Use(middleware.AuthMiddleware(jwtManager))
	{
		accounts.GET("", accountHandler.List)
		accounts.GET("/:id", accountHandler.GetByID)
		accounts.POST("", accountHandler.Create)
		accounts.PUT("/:id", accountHandler.Update)
		accounts.DELETE("/:id", accountHandler.Delete)
	}
}


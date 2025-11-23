package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
)

func SetupUserRoutes(router *gin.RouterGroup, userHandler *handlers.UserHandler, jwtManager *jwt.JWTManager) {
	users := router.Group("/users")
	users.Use(middleware.AuthMiddleware(jwtManager))
	{
		users.GET("", userHandler.ListUsers)
		users.GET("/roles", userHandler.ListRoles)
		users.GET("/permissions", userHandler.ListPermissions)
		users.GET("/:id", userHandler.GetUser)
		users.POST("", userHandler.CreateUser)
		users.PUT("/:id", userHandler.UpdateUser)
		users.DELETE("/:id", userHandler.DeleteUser)
		users.PUT("/:id/permissions", userHandler.UpdateUserPermissions)
	}
}


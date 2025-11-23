package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
)

func SetupPermissionRoutes(router *gin.RouterGroup, permissionHandler *handlers.PermissionHandler, jwtManager *jwt.JWTManager) {
	permissions := router.Group("/permissions")
	permissions.Use(middleware.AuthMiddleware(jwtManager))
	{
		permissions.GET("", permissionHandler.List)
		permissions.GET("/:id", permissionHandler.GetByID)
	}

	// User permissions route
	users := router.Group("/users")
	users.Use(middleware.AuthMiddleware(jwtManager))
	{
		users.GET("/:id/permissions", permissionHandler.GetUserPermissions)
	}
}


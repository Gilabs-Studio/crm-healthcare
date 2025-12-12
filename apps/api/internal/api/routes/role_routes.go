package routes

import (
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupRoleRoutes(router *gin.RouterGroup, roleHandler *handlers.RoleHandler, jwtManager *jwt.JWTManager) {
	roles := router.Group("/roles")
	roles.Use(middleware.AuthMiddleware(jwtManager))
	{
		roles.GET("", roleHandler.List)
		roles.GET("/:id", roleHandler.GetByID)
		roles.POST("", roleHandler.Create)
		roles.PUT("/:id", roleHandler.Update)
		roles.DELETE("/:id", roleHandler.Delete)
		roles.PUT("/:id/permissions", roleHandler.AssignPermissions)
		roles.GET("/:id/mobile-permissions", roleHandler.GetMobilePermissions)
		roles.PUT("/:id/mobile-permissions", roleHandler.UpdateMobilePermissions)
	}
}


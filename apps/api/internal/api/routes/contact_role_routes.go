package routes

import (
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupContactRoleRoutes(router *gin.RouterGroup, contactRoleHandler *handlers.ContactRoleHandler, jwtManager *jwt.JWTManager) {
	contactRoles := router.Group("/contact-roles")
	contactRoles.Use(middleware.AuthMiddleware(jwtManager))
	{
		contactRoles.GET("", contactRoleHandler.List)
		contactRoles.GET("/:id", contactRoleHandler.GetByID)
		contactRoles.POST("", contactRoleHandler.Create)
		contactRoles.PUT("/:id", contactRoleHandler.Update)
		contactRoles.DELETE("/:id", contactRoleHandler.Delete)
	}
}


package routes

import (
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupSettingsRoutes(router *gin.RouterGroup, settingsHandler *handlers.SettingsHandler, jwtManager *jwt.JWTManager) {
	settings := router.Group("/settings")
	settings.Use(middleware.AuthMiddleware(jwtManager))
	{
		settings.GET("", settingsHandler.GetSettings)
		settings.PUT("", settingsHandler.UpdateSettings)
	}
}



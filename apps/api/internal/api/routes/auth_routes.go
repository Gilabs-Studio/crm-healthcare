package routes

import (
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupAuthRoutes(router *gin.RouterGroup, authHandler *handlers.AuthHandler, jwtManager *jwt.JWTManager) {
	auth := router.Group("/auth")
	{
		// Login endpoint with rate limiting (5 requests per 15 minutes)
		auth.POST("/login", middleware.RateLimitMiddleware("login"), authHandler.Login)
		// Refresh token endpoint with rate limiting (10 requests per hour)
		auth.POST("/refresh", middleware.RateLimitMiddleware("refresh"), authHandler.RefreshToken)
		// Logout endpoint (authenticated, no rate limit needed)
		auth.POST("/logout", middleware.AuthMiddleware(jwtManager), authHandler.Logout)
	}
}


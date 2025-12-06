package middleware

import (
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// CORSMiddleware sets up CORS configuration
func CORSMiddleware() gin.HandlerFunc {
	config := cors.DefaultConfig()
	
	// Get allowed origins from environment variable or use defaults
	allowedOrigins := []string{
		"http://localhost:3000",
		"http://localhost:3001",
	}
	
	// Add production origins from environment
	if envOrigins := os.Getenv("CORS_ALLOWED_ORIGINS"); envOrigins != "" {
		origins := strings.Split(envOrigins, ",")
		allowedOrigins = append(allowedOrigins, origins...)
	}
	
	config.AllowOrigins = allowedOrigins
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{
		"Origin",
		"Content-Type",
		"Content-Length",
		"Accept-Encoding",
		"X-CSRF-Token",
		"Authorization",
		"Accept",
		"X-Requested-With",
		"X-Request-ID",
	}
	config.AllowCredentials = true
	config.ExposeHeaders = []string{"X-Request-ID"}

	return cors.New(config)
}


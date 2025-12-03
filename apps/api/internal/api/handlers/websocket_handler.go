package handlers

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gilabs/crm-healthcare/api/internal/hub"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
)

type WebSocketHandler struct {
	hub       *hub.NotificationHub
	jwtManager *jwt.JWTManager
}

func NewWebSocketHandler(hub *hub.NotificationHub, jwtManager *jwt.JWTManager) *WebSocketHandler {
	return &WebSocketHandler{
		hub:        hub,
		jwtManager: jwtManager,
	}
}

// HandleWebSocket handles WebSocket connections for notifications
func (h *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	// Get token from query parameter or header
	tokenString := c.Query("token")
	if tokenString == "" {
		// Try to get from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString = parts[1]
			}
		}
	}

	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "token required"})
		return
	}

	// Validate token
	claims, err := h.jwtManager.ValidateToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return
	}

	// Upgrade connection to WebSocket
	upgrader := hub.GetUpgrader()
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	// Register client with hub
	h.hub.ServeWS(conn, claims.UserID)
}


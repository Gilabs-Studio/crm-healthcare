package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
)

// SetupTaskRoutes sets up task and reminder routes
func SetupTaskRoutes(router *gin.RouterGroup, taskHandler *handlers.TaskHandler, jwtManager *jwt.JWTManager) {
	tasks := router.Group("/tasks")
	tasks.Use(middleware.AuthMiddleware(jwtManager))
	{
		// Task CRUD
		tasks.GET("", taskHandler.List)
		tasks.GET("/:id", taskHandler.GetByID)
		tasks.POST("", taskHandler.Create)
		tasks.PUT("/:id", taskHandler.Update)
		tasks.DELETE("/:id", taskHandler.Delete)
		
		// Task actions
		tasks.POST("/:id/assign", taskHandler.Assign)
		tasks.POST("/:id/complete", taskHandler.Complete)
		
		// Reminder CRUD
		tasks.GET("/reminders", taskHandler.ListReminders)
		tasks.GET("/reminders/:id", taskHandler.GetReminderByID)
		tasks.POST("/reminders", taskHandler.CreateReminder)
		tasks.PUT("/reminders/:id", taskHandler.UpdateReminder)
		tasks.DELETE("/reminders/:id", taskHandler.DeleteReminder)
	}
}


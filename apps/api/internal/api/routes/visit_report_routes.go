package routes

import (
	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
	"github.com/gin-gonic/gin"
)

func SetupVisitReportRoutes(router *gin.RouterGroup, visitReportHandler *handlers.VisitReportHandler, jwtManager *jwt.JWTManager) {
	visitReports := router.Group("/visit-reports")
	visitReports.Use(middleware.AuthMiddleware(jwtManager))
	{
		visitReports.GET("", visitReportHandler.List)
		visitReports.GET("/:id", visitReportHandler.GetByID)
		visitReports.POST("", visitReportHandler.Create)
		visitReports.PUT("/:id", visitReportHandler.Update)
		visitReports.DELETE("/:id", visitReportHandler.Delete)
		visitReports.POST("/:id/check-in", visitReportHandler.CheckIn)
		visitReports.POST("/:id/check-out", visitReportHandler.CheckOut)
		visitReports.POST("/:id/approve", visitReportHandler.Approve)
		visitReports.POST("/:id/reject", visitReportHandler.Reject)
		visitReports.POST("/:id/photos", visitReportHandler.UploadPhoto)
	}
}


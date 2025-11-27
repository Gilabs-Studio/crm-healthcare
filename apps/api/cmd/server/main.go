package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/api/handlers"
	"github.com/gilabs/crm-healthcare/api/internal/api/middleware"
	"github.com/gilabs/crm-healthcare/api/internal/api/routes"
	"github.com/gilabs/crm-healthcare/api/internal/config"
	"github.com/gilabs/crm-healthcare/api/internal/database"
	accountrepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/account"
	activityrepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/activity"
	"github.com/gilabs/crm-healthcare/api/internal/repository/postgres/auth"
	categoryrepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/category"
	contactrepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/contact"
	contactrolerepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/contact_role"
	dealrepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/deal"
	permissionrepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/permission"
	pipelinerepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/pipeline"
	productrepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/product"
	productcategoryrepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/product_category"
	reminderrepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/reminder"
	rolerepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/role"
	settingsrepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/settings"
	taskrepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/task"
	userrepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/user"
	visitreportrepo "github.com/gilabs/crm-healthcare/api/internal/repository/postgres/visit_report"
	accountservice "github.com/gilabs/crm-healthcare/api/internal/service/account"
	activityservice "github.com/gilabs/crm-healthcare/api/internal/service/activity"
	authservice "github.com/gilabs/crm-healthcare/api/internal/service/auth"
	categoryservice "github.com/gilabs/crm-healthcare/api/internal/service/category"
	contactservice "github.com/gilabs/crm-healthcare/api/internal/service/contact"
	contactroleservice "github.com/gilabs/crm-healthcare/api/internal/service/contact_role"
	dashboardservice "github.com/gilabs/crm-healthcare/api/internal/service/dashboard"
	permissionservice "github.com/gilabs/crm-healthcare/api/internal/service/permission"
	pipelineservice "github.com/gilabs/crm-healthcare/api/internal/service/pipeline"
	productservice "github.com/gilabs/crm-healthcare/api/internal/service/product"
	reportservice "github.com/gilabs/crm-healthcare/api/internal/service/report"
	roleservice "github.com/gilabs/crm-healthcare/api/internal/service/role"
	settingsservice "github.com/gilabs/crm-healthcare/api/internal/service/settings"
	taskservice "github.com/gilabs/crm-healthcare/api/internal/service/task"
	userservice "github.com/gilabs/crm-healthcare/api/internal/service/user"
	visitreportservice "github.com/gilabs/crm-healthcare/api/internal/service/visit_report"
	"github.com/gilabs/crm-healthcare/api/pkg/jwt"
	"github.com/gilabs/crm-healthcare/api/pkg/logger"
	"github.com/gilabs/crm-healthcare/api/pkg/response"
	"github.com/gilabs/crm-healthcare/api/seeders"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize logger
	logger.Init()

	// Load configuration
	if err := config.Load(); err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Connect to database
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Close()

	// Run migrations
	if err := database.AutoMigrate(); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Seed data
	if err := seeders.SeedAll(); err != nil {
		log.Fatal("Failed to seed data:", err)
	}

	// Setup JWT Manager
	jwtManager := jwt.NewJWTManager(
		config.AppConfig.JWT.SecretKey,
		time.Duration(config.AppConfig.JWT.AccessTokenTTL)*time.Hour,
		time.Duration(config.AppConfig.JWT.RefreshTokenTTL)*24*time.Hour,
	)

	// Setup repositories
	authRepo := auth.NewRepository(database.DB)
	userRepo := userrepo.NewRepository(database.DB)
	roleRepo := rolerepo.NewRepository(database.DB)
	permissionRepo := permissionrepo.NewRepository(database.DB)
	categoryRepo := categoryrepo.NewRepository(database.DB)
	contactRoleRepo := contactrolerepo.NewRepository(database.DB)
	accountRepo := accountrepo.NewRepository(database.DB)
	contactRepo := contactrepo.NewRepository(database.DB)
	pipelineRepo := pipelinerepo.NewRepository(database.DB)
	dealRepo := dealrepo.NewRepository(database.DB)
	visitReportRepo := visitreportrepo.NewRepository(database.DB)
	activityRepo := activityrepo.NewRepository(database.DB)
	settingsRepo := settingsrepo.NewRepository(database.DB)
	productCategoryRepo := productcategoryrepo.NewRepository(database.DB)
	productRepo := productrepo.NewRepository(database.DB)
	taskRepo := taskrepo.NewRepository(database.DB)
	reminderRepo := reminderrepo.NewRepository(database.DB)

	// Setup services
	authService := authservice.NewService(authRepo, jwtManager)
	userService := userservice.NewService(userRepo, roleRepo)
	roleService := roleservice.NewService(roleRepo)
	permissionService := permissionservice.NewService(permissionRepo, userRepo)
	categoryService := categoryservice.NewService(categoryRepo)
	contactRoleService := contactroleservice.NewService(contactRoleRepo)
	accountService := accountservice.NewService(accountRepo, categoryRepo)
	contactService := contactservice.NewService(contactRepo, accountRepo, contactRoleRepo)
	pipelineService := pipelineservice.NewService(pipelineRepo, dealRepo, accountRepo)
	activityService := activityservice.NewService(activityRepo, accountRepo, contactRepo, userRepo)
	visitReportService := visitreportservice.NewService(visitReportRepo, accountRepo, contactRepo, userRepo, activityRepo)
	dashboardService := dashboardservice.NewService(visitReportRepo, accountRepo, activityRepo, userRepo, dealRepo, taskRepo, settingsRepo)
	reportService := reportservice.NewService(visitReportRepo, accountRepo, activityRepo, userRepo)
	settingsService := settingsservice.NewService(settingsRepo)
	productService := productservice.NewService(productRepo, productCategoryRepo)
	taskService := taskservice.NewService(taskRepo, reminderRepo, userRepo, accountRepo, contactRepo, dealRepo)

	// Setup handlers
	authHandler := handlers.NewAuthHandler(authService)
	userHandler := handlers.NewUserHandler(userService)
	roleHandler := handlers.NewRoleHandler(roleService)
	permissionHandler := handlers.NewPermissionHandler(permissionService)
	categoryHandler := handlers.NewCategoryHandler(categoryService)
	contactRoleHandler := handlers.NewContactRoleHandler(contactRoleService)
	accountHandler := handlers.NewAccountHandler(accountService)
	contactHandler := handlers.NewContactHandler(contactService)
	pipelineHandler := handlers.NewPipelineHandler(pipelineService)
	dealHandler := handlers.NewDealHandler(pipelineService)
	activityHandler := handlers.NewActivityHandler(activityService)
	visitReportHandler := handlers.NewVisitReportHandler(visitReportService)
	dashboardHandler := handlers.NewDashboardHandler(dashboardService)
	reportHandler := handlers.NewReportHandler(reportService)
	settingsHandler := handlers.NewSettingsHandler(settingsService)
	productHandler := handlers.NewProductHandler(productService)
	taskHandler := handlers.NewTaskHandler(taskService)

	// Setup router
	router := setupRouter(
		jwtManager,
		authHandler,
		userHandler,
		roleHandler,
		permissionHandler,
		categoryHandler,
		contactRoleHandler,
		accountHandler,
		contactHandler,
		pipelineHandler,
		dealHandler,
		activityHandler,
		visitReportHandler,
		dashboardHandler,
		reportHandler,
		settingsHandler,
		productHandler,
		taskHandler,
	)

	// Run server
	port := config.AppConfig.Server.Port
	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func setupRouter(
	jwtManager *jwt.JWTManager,
	authHandler *handlers.AuthHandler,
	userHandler *handlers.UserHandler,
	roleHandler *handlers.RoleHandler,
	permissionHandler *handlers.PermissionHandler,
	categoryHandler *handlers.CategoryHandler,
	contactRoleHandler *handlers.ContactRoleHandler,
	accountHandler *handlers.AccountHandler,
	contactHandler *handlers.ContactHandler,
	pipelineHandler *handlers.PipelineHandler,
	dealHandler *handlers.DealHandler,
	activityHandler *handlers.ActivityHandler,
	visitReportHandler *handlers.VisitReportHandler,
	dashboardHandler *handlers.DashboardHandler,
	reportHandler *handlers.ReportHandler,
	settingsHandler *handlers.SettingsHandler,
	productHandler *handlers.ProductHandler,
	taskHandler *handlers.TaskHandler,
) *gin.Engine {
	// Set Gin mode
	if config.AppConfig.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Global middleware
	router.Use(middleware.LoggerMiddleware())
	router.Use(middleware.CORSMiddleware())
	router.Use(middleware.RequestIDMiddleware())

	// Health check endpoints
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "API is running",
		})
	})

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		v1.GET("/", func(c *gin.Context) {
			response.SuccessResponse(c, gin.H{
				"message": "API v1",
				"version": "1.0.0",
			}, nil)
		})

		// Auth routes
		routes.SetupAuthRoutes(v1, authHandler, jwtManager)
		
		// User routes
		routes.SetupUserRoutes(v1, userHandler, permissionHandler, jwtManager)
		
		// Role routes
		routes.SetupRoleRoutes(v1, roleHandler, jwtManager)
		
		// Permission routes
		routes.SetupPermissionRoutes(v1, permissionHandler, jwtManager)
		
		// Category routes
		routes.SetupCategoryRoutes(v1, categoryHandler, jwtManager)
		
		// Contact Role routes
		routes.SetupContactRoleRoutes(v1, contactRoleHandler, jwtManager)
		
		// Account routes
		routes.SetupAccountRoutes(v1, accountHandler, jwtManager)
		
		// Contact routes
		routes.SetupContactRoutes(v1, contactHandler, jwtManager)
		
		// Visit Report routes
		routes.SetupVisitReportRoutes(v1, visitReportHandler, jwtManager)
		
		// Activity routes
		routes.SetupActivityRoutes(v1, activityHandler, jwtManager)

		// Pipeline & Deals routes
		routes.SetupPipelineRoutes(v1, pipelineHandler, dealHandler, jwtManager)
		
		// Dashboard routes
		routes.SetupDashboardRoutes(v1, dashboardHandler, jwtManager)
		
		// Report routes
		routes.SetupReportRoutes(v1, reportHandler, jwtManager)
		
		// Settings routes
		routes.SetupSettingsRoutes(v1, settingsHandler, jwtManager)
		
		// Master Data routes
		routes.SetupMasterDataRoutes(v1, jwtManager)

		// Product routes
		routes.SetupProductRoutes(v1, productHandler, jwtManager)

		// Task & Reminder routes
		routes.SetupTaskRoutes(v1, taskHandler, jwtManager)
	}

	return router
}

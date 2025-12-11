package seeders

import (
	"log"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/permission"
	"github.com/gilabs/crm-healthcare/api/internal/domain/role"
)

// SeedPermissions seeds initial permissions based on the provided structure
func SeedPermissions() error {
	// Check if permissions already exist
	var count int64
	database.DB.Model(&permission.Permission{}).Count(&count)
	if count > 0 {
		log.Println("Permissions already seeded, skipping...")
		return nil
	}

	// Get menus
	var dashboardMenu permission.Menu
	var userPageMenu permission.Menu
	var salesCRMMenu, accountsMenu, leadsMenu, pipelineMenu, tasksMenu, productsMenu permission.Menu
	var visitReportsMenu permission.Menu
	var reportsMenu permission.Menu
	var aiMenu, aiChatbotMenu, aiSettingsMenu permission.Menu

	// Base path harus sama dengan yang digunakan di menu_seeder (locale-agnostic).
	basePath := ""

	database.DB.Where("url = ?", basePath+"/dashboard").First(&dashboardMenu)
	database.DB.Where("url = ?", basePath+"/master-data/users").First(&userPageMenu)
	database.DB.Where("url = ?", basePath+"/sales-crm").First(&salesCRMMenu)
	database.DB.Where("url = ?", basePath+"/accounts").First(&accountsMenu)
	database.DB.Where("url = ?", basePath+"/visit-reports").First(&visitReportsMenu)
	database.DB.Where("url = ?", basePath+"/ai-assistant").First(&aiMenu)
	database.DB.Where("url = ?", basePath+"/ai-chatbot").First(&aiChatbotMenu)
	database.DB.Where("url = ?", basePath+"/ai-settings").First(&aiSettingsMenu)

	// Get or create Leads menu
	if err := database.DB.Where("url = ?", basePath+"/leads").First(&leadsMenu).Error; err != nil {
		// Leads menu doesn't exist, create it (salesCRMMenu already loaded above)
		leadsMenu = permission.Menu{
			Name:     "Lead Management",
			Icon:     "user-plus",
			URL:      basePath + "/leads",
			ParentID: &salesCRMMenu.ID,
			Order:    2,
			Status:   "active",
		}
		if err := database.DB.Create(&leadsMenu).Error; err != nil {
			log.Printf("Warning: Failed to create Leads menu: %v", err)
		} else {
			log.Printf("Created Leads menu in permission seeder")
		}
	}

	// Get or create Pipeline menu
	if err := database.DB.Where("url = ?", basePath+"/pipeline").First(&pipelineMenu).Error; err != nil {
		// Pipeline menu doesn't exist, create it (salesCRMMenu already loaded above)
		pipelineMenu = permission.Menu{
			Name:     "Pipeline",
			Icon:     "trending-up",
			URL:      basePath + "/pipeline",
			ParentID: &salesCRMMenu.ID,
			Order:    3,
			Status:   "active",
		}
		if err := database.DB.Create(&pipelineMenu).Error; err != nil {
			log.Printf("Warning: Failed to create Pipeline menu: %v", err)
		} else {
			log.Printf("Created Pipeline menu in permission seeder")
		}
	}
	database.DB.Where("url = ?", basePath+"/tasks").First(&tasksMenu)
	database.DB.Where("url = ?", basePath+"/products").First(&productsMenu)
	database.DB.Where("url = ?", basePath+"/reports").First(&reportsMenu)

	// Define actions for each menu
	actions := []struct {
		menuID string
		code   string
		name   string
		action string
		menu   *permission.Menu
	}{
		// Dashboard actions
		{dashboardMenu.ID, "VIEW_DASHBOARD", "View Dashboard", "VIEW", &dashboardMenu},

		// Users page actions (CREATE includes roles & permissions setup)
		{userPageMenu.ID, "VIEW_USERS", "View Users", "VIEW", &userPageMenu},
		{userPageMenu.ID, "CREATE_USERS", "Create Users", "CREATE", &userPageMenu}, // Includes roles & permissions
		{userPageMenu.ID, "EDIT_USERS", "Edit Users", "EDIT", &userPageMenu},
		{userPageMenu.ID, "DELETE_USERS", "Delete Users", "DELETE", &userPageMenu},
		{userPageMenu.ID, "ROLES", "Manage Roles", "ROLES", &userPageMenu},
		{userPageMenu.ID, "PERMISSIONS", "Manage Permissions", "PERMISSIONS", &userPageMenu},

		// Sales CRM actions
		{salesCRMMenu.ID, "VIEW_SALES_CRM", "View Sales CRM", "VIEW", &salesCRMMenu},

		// Accounts actions
		{accountsMenu.ID, "VIEW_ACCOUNTS", "View Accounts", "VIEW", &accountsMenu},
		{accountsMenu.ID, "CREATE_ACCOUNTS", "Create Accounts", "CREATE", &accountsMenu},
		{accountsMenu.ID, "EDIT_ACCOUNTS", "Edit Accounts", "EDIT", &accountsMenu},
		{accountsMenu.ID, "DELETE_ACCOUNTS", "Delete Accounts", "DELETE", &accountsMenu},
		{accountsMenu.ID, "DETAIL_ACCOUNTS", "Detail Accounts", "DETAIL", &accountsMenu},
		{accountsMenu.ID, "CATEGORY", "Manage Categories", "CATEGORY", &accountsMenu},
		{accountsMenu.ID, "ROLE", "Manage Contact Roles", "ROLE", &accountsMenu},

		// Leads actions
		{leadsMenu.ID, "VIEW_LEADS", "View Leads", "VIEW", &leadsMenu},
		{leadsMenu.ID, "CREATE_LEADS", "Create Leads", "CREATE", &leadsMenu},
		{leadsMenu.ID, "EDIT_LEADS", "Edit Leads", "EDIT", &leadsMenu},
		{leadsMenu.ID, "DELETE_LEADS", "Delete Leads", "DELETE", &leadsMenu},
		{leadsMenu.ID, "CONVERT_LEADS", "Convert Leads", "CONVERT", &leadsMenu},
		{leadsMenu.ID, "CREATE_ACCOUNT_FROM_LEAD", "Create Account From Lead", "CREATE_ACCOUNT", &leadsMenu},
		{leadsMenu.ID, "VIEW_ANALYTICS", "View Lead Analytics", "ANALYTICS", &leadsMenu},

		// Pipeline actions
		{pipelineMenu.ID, "VIEW_PIPELINE", "View Pipeline", "VIEW", &pipelineMenu},
		{pipelineMenu.ID, "CREATE_DEALS", "Create Deals", "CREATE", &pipelineMenu},
		{pipelineMenu.ID, "EDIT_DEALS", "Edit Deals", "EDIT", &pipelineMenu},
		{pipelineMenu.ID, "DELETE_DEALS", "Delete Deals", "DELETE", &pipelineMenu},
		{pipelineMenu.ID, "DETAIL_DEALS", "Detail Deals", "DETAIL", &pipelineMenu},
		{pipelineMenu.ID, "MOVE_DEALS", "Move Deals", "MOVE", &pipelineMenu},
		{pipelineMenu.ID, "VIEW_SUMMARY", "View Summary", "SUMMARY", &pipelineMenu},
		{pipelineMenu.ID, "VIEW_FORECAST", "View Forecast", "FORECAST", &pipelineMenu},
		{pipelineMenu.ID, "STAGES", "Manage Pipeline Stages", "STAGES", &pipelineMenu},

		// Task & Reminder actions
		{tasksMenu.ID, "VIEW_TASKS", "View Tasks", "VIEW", &tasksMenu},
		{tasksMenu.ID, "CREATE_TASKS", "Create Tasks", "CREATE", &tasksMenu},
		{tasksMenu.ID, "EDIT_TASKS", "Edit Tasks", "EDIT", &tasksMenu},
		{tasksMenu.ID, "DELETE_TASKS", "Delete Tasks", "DELETE", &tasksMenu},
		{tasksMenu.ID, "ASSIGN_TASKS", "Assign Tasks", "ASSIGN", &tasksMenu},

		// Visit Reports actions
		{visitReportsMenu.ID, "VIEW_VISIT_REPORTS", "View Visit Reports", "VIEW", &visitReportsMenu},
		{visitReportsMenu.ID, "CREATE_VISIT_REPORTS", "Create Visit Reports", "CREATE", &visitReportsMenu},
		{visitReportsMenu.ID, "EDIT_VISIT_REPORTS", "Edit Visit Reports", "EDIT", &visitReportsMenu},
		{visitReportsMenu.ID, "DELETE_VISIT_REPORTS", "Delete Visit Reports", "DELETE", &visitReportsMenu},
		{visitReportsMenu.ID, "APPROVE_VISIT_REPORTS", "Approve Visit Reports", "APPROVE", &visitReportsMenu},
		{visitReportsMenu.ID, "REJECT_VISIT_REPORTS", "Reject Visit Reports", "REJECT", &visitReportsMenu},
		{visitReportsMenu.ID, "ACTIVITY", "Manage Activity Types", "ACTIVITY", &visitReportsMenu},

		// Products actions
		{productsMenu.ID, "VIEW_PRODUCTS", "View Products", "VIEW", &productsMenu},
		{productsMenu.ID, "CREATE_PRODUCTS", "Create Products", "CREATE", &productsMenu},
		{productsMenu.ID, "EDIT_PRODUCTS", "Edit Products", "EDIT", &productsMenu},
		{productsMenu.ID, "DELETE_PRODUCTS", "Delete Products", "DELETE", &productsMenu},

		// Product Categories actions (represented as tabs under Products menu, not a separate sidebar menu)
		{productsMenu.ID, "VIEW_PRODUCT_CATEGORIES", "View Product Categories", "VIEW", &productsMenu},
		{productsMenu.ID, "CREATE_PRODUCT_CATEGORIES", "Create Product Categories", "CREATE", &productsMenu},
		{productsMenu.ID, "EDIT_PRODUCT_CATEGORIES", "Edit Product Categories", "EDIT", &productsMenu},
		{productsMenu.ID, "DELETE_PRODUCT_CATEGORIES", "Delete Product Categories", "DELETE", &productsMenu},

		// Reports actions
		{reportsMenu.ID, "VIEW_REPORTS", "View Reports", "VIEW", &reportsMenu},
		{reportsMenu.ID, "GENERATE_REPORTS", "Generate Reports", "CREATE", &reportsMenu},
		{reportsMenu.ID, "EXPORT_REPORTS", "Export Reports", "EXPORT", &reportsMenu},

		// AI Chatbot actions
		{aiChatbotMenu.ID, "VIEW_AI_CHATBOT", "View AI Chatbot", "VIEW", &aiChatbotMenu},

		// AI Settings actions (admin only - universal settings)
		{aiSettingsMenu.ID, "VIEW_AI_SETTINGS", "View AI Settings", "VIEW", &aiSettingsMenu},
		{aiSettingsMenu.ID, "EDIT_AI_SETTINGS", "Edit AI Settings", "EDIT", &aiSettingsMenu},
	}

	// Create permissions
	var permissionIDs []string
	for _, act := range actions {
		perm := permission.Permission{
			Name:   act.name,
			Code:   act.code,
			MenuID: &act.menuID,
			Action: act.action,
		}
		if err := database.DB.Create(&perm).Error; err != nil {
			return err
		}
		permissionIDs = append(permissionIDs, perm.ID)
		log.Printf("Created permission: %s (%s)", perm.Name, perm.Code)
	}

	// Assign all permissions to admin role
	var adminRole role.Role
	if err := database.DB.Where("code = ?", "admin").First(&adminRole).Error; err != nil {
		return err
	}

	// Assign all permissions to admin
	for _, permID := range permissionIDs {
		if err := database.DB.Exec(
			"INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
			adminRole.ID, permID,
		).Error; err != nil {
			return err
		}
	}

	log.Printf("Assigned %d permissions to admin role", len(permissionIDs))

	// Always sync all permissions to admin role (even if permissions already exist)
	if err := SyncAdminPermissions(); err != nil {
		log.Printf("Warning: Failed to sync admin permissions: %v", err)
	}

	// Assign VIEW permissions only to viewer role (read-only access)
	var viewerRole role.Role
	if err := database.DB.Where("code = ?", "viewer").First(&viewerRole).Error; err == nil {
		// Get all VIEW permissions only
		var viewPermissions []permission.Permission
		if err := database.DB.Where("action = ?", "VIEW").Find(&viewPermissions).Error; err == nil {
			viewerPermissionCount := 0
			for _, perm := range viewPermissions {
				if err := database.DB.Exec(
					"INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
					viewerRole.ID, perm.ID,
				).Error; err != nil {
					log.Printf("Warning: Failed to assign permission %s to viewer: %v", perm.Code, err)
				} else {
					viewerPermissionCount++
				}
			}
			log.Printf("Assigned %d VIEW permissions to viewer role", viewerPermissionCount)
		}
	} else {
		log.Printf("Warning: Viewer role not found, skipping viewer permission assignment: %v", err)
	}

	// Assign permissions to sales role
	// Full access to Visit Reports and Task management (for mobile app)
	var salesRole role.Role
	if err := database.DB.Where("code = ?", "sales").First(&salesRole).Error; err == nil {
		// Get all Visit Reports permissions
		var visitReportPermissions []permission.Permission
		if err := database.DB.Where("code IN (?)", []string{
			"VIEW_VISIT_REPORTS",
			"CREATE_VISIT_REPORTS",
			"EDIT_VISIT_REPORTS",
			"DELETE_VISIT_REPORTS",
			"APPROVE_VISIT_REPORTS",
			"REJECT_VISIT_REPORTS",
			"ACTIVITY",
		}).Find(&visitReportPermissions).Error; err == nil {
			salesPermissionCount := 0
			for _, perm := range visitReportPermissions {
				if err := database.DB.Exec(
					"INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
					salesRole.ID, perm.ID,
				).Error; err != nil {
					log.Printf("Warning: Failed to assign permission %s to sales: %v", perm.Code, err)
				} else {
					salesPermissionCount++
				}
			}
			log.Printf("Assigned %d Visit Reports permissions to sales role", salesPermissionCount)
		}

		// Get Task permissions (VIEW, CREATE, EDIT for mobile app)
		var taskPermissions []permission.Permission
		if err := database.DB.Where("code IN (?)", []string{
			"VIEW_TASKS",
			"CREATE_TASKS",
			"EDIT_TASKS",
		}).Find(&taskPermissions).Error; err == nil {
			taskPermissionCount := 0
			for _, perm := range taskPermissions {
				if err := database.DB.Exec(
					"INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
					salesRole.ID, perm.ID,
				).Error; err != nil {
					log.Printf("Warning: Failed to assign permission %s to sales: %v", perm.Code, err)
				} else {
					taskPermissionCount++
				}
			}
			log.Printf("Assigned %d Task permissions to sales role", taskPermissionCount)
		}

		// Also assign VIEW_DASHBOARD for mobile dashboard access
		var dashboardPermission permission.Permission
		if err := database.DB.Where("code = ?", "VIEW_DASHBOARD").First(&dashboardPermission).Error; err == nil {
			if err := database.DB.Exec(
				"INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
				salesRole.ID, dashboardPermission.ID,
			).Error; err != nil {
				log.Printf("Warning: Failed to assign VIEW_DASHBOARD to sales: %v", err)
			} else {
				log.Printf("Assigned VIEW_DASHBOARD permission to sales role")
			}
		}
	} else {
		log.Printf("Warning: Sales role not found, skipping sales permission assignment: %v", err)
	}

	log.Println("Permissions seeded successfully")
	return nil
}

// SyncAdminPermissions syncs all existing permissions to admin role
// This ensures admin always has access to all permissions, including newly added ones
func SyncAdminPermissions() error {
	var adminRole role.Role
	if err := database.DB.Where("code = ?", "admin").First(&adminRole).Error; err != nil {
		return err
	}

	// Get all permissions from database
	var allPermissions []permission.Permission
	if err := database.DB.Find(&allPermissions).Error; err != nil {
		return err
	}

	// Assign all permissions to admin (skip if already exists)
	assignedCount := 0
	for _, perm := range allPermissions {
		if err := database.DB.Exec(
			"INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
			adminRole.ID, perm.ID,
		).Error; err != nil {
			log.Printf("Warning: Failed to assign permission %s to admin: %v", perm.Code, err)
		} else {
			assignedCount++
		}
	}

	log.Printf("Synced %d permissions to admin role (total: %d)", assignedCount, len(allPermissions))
	return nil
}

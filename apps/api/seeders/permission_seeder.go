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
	var dataMasterMenu, companyMgmtMenu, companyMenu, divisionMenu, jobPositionMenu, employeeMenu permission.Menu
	var healthcareMenu permission.Menu
	var salesCRMMenu, accountsMenu permission.Menu

	database.DB.Where("url = ?", "/dashboard").First(&dashboardMenu)
	database.DB.Where("url = ?", "/master-data/users").First(&userPageMenu)
	database.DB.Where("url = ?", "/data-master").First(&dataMasterMenu)
	database.DB.Where("url = ?", "/data-master/company").First(&companyMgmtMenu)
	database.DB.Where("url = ?", "/data-master/company/company").First(&companyMenu)
	database.DB.Where("url = ?", "/data-master/company/division").First(&divisionMenu)
	database.DB.Where("url = ?", "/data-master/company/job-position").First(&jobPositionMenu)
	database.DB.Where("url = ?", "/data-master/company/employee").First(&employeeMenu)
	database.DB.Where("url = ?", "/master-data").First(&healthcareMenu)
	database.DB.Where("url = ?", "/sales-crm").First(&salesCRMMenu)
	database.DB.Where("url = ?", "/accounts").First(&accountsMenu)

	// Define actions for each menu
	actions := []struct {
		menuID   string
		code     string
		name     string
		action   string
		menu     *permission.Menu
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

		// Company Management actions
		{companyMgmtMenu.ID, "VIEW_COMPANY_MANAGEMENT", "View Company Management", "VIEW", &companyMgmtMenu},

		// Company actions
		{companyMenu.ID, "VIEW_COMPANY", "View Company", "VIEW", &companyMenu},
		{companyMenu.ID, "CREATE_COMPANY", "Create Company", "CREATE", &companyMenu},
		{companyMenu.ID, "EDIT_COMPANY", "Edit Company", "EDIT", &companyMenu},
		{companyMenu.ID, "DELETE_COMPANY", "Delete Company", "DELETE", &companyMenu},
		{companyMenu.ID, "DETAIL_COMPANY", "Detail Company", "DETAIL", &companyMenu},
		{companyMenu.ID, "IMPORT_COMPANY", "Import Company", "IMPORT", &companyMenu},
		{companyMenu.ID, "EXPORT_COMPANY", "Export Company", "EXPORT", &companyMenu},
		{companyMenu.ID, "APPROVE_COMPANY", "Approve Company", "APPROVE", &companyMenu},

		// Division actions
		{divisionMenu.ID, "VIEW_DIVISION", "View Division", "VIEW", &divisionMenu},
		{divisionMenu.ID, "CREATE_DIVISION", "Create Division", "CREATE", &divisionMenu},
		{divisionMenu.ID, "EDIT_DIVISION", "Edit Division", "EDIT", &divisionMenu},
		{divisionMenu.ID, "DELETE_DIVISION", "Delete Division", "DELETE", &divisionMenu},
		{divisionMenu.ID, "DETAIL_DIVISION", "Detail Division", "DETAIL", &divisionMenu},
		{divisionMenu.ID, "IMPORT_DIVISION", "Import Division", "IMPORT", &divisionMenu},
		{divisionMenu.ID, "EXPORT_DIVISION", "Export Division", "EXPORT", &divisionMenu},

		// Job Position actions
		{jobPositionMenu.ID, "VIEW_JOB_POSITION", "View Job Position", "VIEW", &jobPositionMenu},
		{jobPositionMenu.ID, "CREATE_JOB_POSITION", "Create Job Position", "CREATE", &jobPositionMenu},
		{jobPositionMenu.ID, "EDIT_JOB_POSITION", "Edit Job Position", "EDIT", &jobPositionMenu},
		{jobPositionMenu.ID, "DELETE_JOB_POSITION", "Delete Job Position", "DELETE", &jobPositionMenu},
		{jobPositionMenu.ID, "DETAIL_JOB_POSITION", "Detail Job Position", "DETAIL", &jobPositionMenu},
		{jobPositionMenu.ID, "IMPORT_JOB_POSITION", "Import Job Position", "IMPORT", &jobPositionMenu},
		{jobPositionMenu.ID, "EXPORT_JOB_POSITION", "Export Job Position", "EXPORT", &jobPositionMenu},

		// Employee actions
		{employeeMenu.ID, "VIEW_EMPLOYEE", "View Employee", "VIEW", &employeeMenu},
		{employeeMenu.ID, "CREATE_EMPLOYEE", "Create Employee", "CREATE", &employeeMenu},
		{employeeMenu.ID, "EDIT_EMPLOYEE", "Edit Employee", "EDIT", &employeeMenu},
		{employeeMenu.ID, "DELETE_EMPLOYEE", "Delete Employee", "DELETE", &employeeMenu},
		{employeeMenu.ID, "DETAIL_EMPLOYEE", "Detail Employee", "DETAIL", &employeeMenu},
		{employeeMenu.ID, "IMPORT_EMPLOYEE", "Import Employee", "IMPORT", &employeeMenu},
		{employeeMenu.ID, "EXPORT_EMPLOYEE", "Export Employee", "EXPORT", &employeeMenu},

		// Healthcare Master Data actions
		{healthcareMenu.ID, "VIEW_HEALTHCARE_MASTER", "View Healthcare Master Data", "VIEW", &healthcareMenu},

		// Sales CRM actions
		{salesCRMMenu.ID, "VIEW_SALES_CRM", "View Sales CRM", "VIEW", &salesCRMMenu},

		// Accounts actions
		{accountsMenu.ID, "VIEW_ACCOUNTS", "View Accounts", "VIEW", &accountsMenu},
		{accountsMenu.ID, "CREATE_ACCOUNTS", "Create Accounts", "CREATE", &accountsMenu},
		{accountsMenu.ID, "EDIT_ACCOUNTS", "Edit Accounts", "EDIT", &accountsMenu},
		{accountsMenu.ID, "DELETE_ACCOUNTS", "Delete Accounts", "DELETE", &accountsMenu},
		{accountsMenu.ID, "DETAIL_ACCOUNTS", "Detail Accounts", "DETAIL", &accountsMenu},
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


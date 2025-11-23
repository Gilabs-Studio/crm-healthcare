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
	var userPageMenu permission.Menu
	var dataMasterMenu, companyMgmtMenu, companyMenu, divisionMenu, jobPositionMenu, employeeMenu permission.Menu
	var healthcareMenu, diagnosisMenu, procedureMenu permission.Menu

	database.DB.Where("url = ?", "/users").First(&userPageMenu)
	database.DB.Where("url = ?", "/data-master").First(&dataMasterMenu)
	database.DB.Where("url = ?", "/data-master/company").First(&companyMgmtMenu)
	database.DB.Where("url = ?", "/data-master/company/company").First(&companyMenu)
	database.DB.Where("url = ?", "/data-master/company/division").First(&divisionMenu)
	database.DB.Where("url = ?", "/data-master/company/job-position").First(&jobPositionMenu)
	database.DB.Where("url = ?", "/data-master/company/employee").First(&employeeMenu)
	database.DB.Where("url = ?", "/master-data").First(&healthcareMenu)
	database.DB.Where("url = ?", "/master-data/diagnosis").First(&diagnosisMenu)
	database.DB.Where("url = ?", "/master-data/procedures").First(&procedureMenu)

	// Define actions for each menu
	actions := []struct {
		menuID   string
		code     string
		name     string
		action   string
		menu     *permission.Menu
	}{
		// Users page actions (CREATE includes roles & permissions setup)
		{userPageMenu.ID, "VIEW_USERS", "View Users", "VIEW", &userPageMenu},
		{userPageMenu.ID, "CREATE_USERS", "Create Users", "CREATE", &userPageMenu}, // Includes roles & permissions
		{userPageMenu.ID, "EDIT_USERS", "Edit Users", "EDIT", &userPageMenu},
		{userPageMenu.ID, "DELETE_USERS", "Delete Users", "DELETE", &userPageMenu},

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

		// Diagnosis actions
		{diagnosisMenu.ID, "VIEW_DIAGNOSIS", "View Diagnosis", "VIEW", &diagnosisMenu},
		{diagnosisMenu.ID, "CREATE_DIAGNOSIS", "Create Diagnosis", "CREATE", &diagnosisMenu},
		{diagnosisMenu.ID, "EDIT_DIAGNOSIS", "Edit Diagnosis", "EDIT", &diagnosisMenu},
		{diagnosisMenu.ID, "DELETE_DIAGNOSIS", "Delete Diagnosis", "DELETE", &diagnosisMenu},
		{diagnosisMenu.ID, "SEARCH_DIAGNOSIS", "Search Diagnosis", "VIEW", &diagnosisMenu},

		// Procedure actions
		{procedureMenu.ID, "VIEW_PROCEDURE", "View Procedure", "VIEW", &procedureMenu},
		{procedureMenu.ID, "CREATE_PROCEDURE", "Create Procedure", "CREATE", &procedureMenu},
		{procedureMenu.ID, "EDIT_PROCEDURE", "Edit Procedure", "EDIT", &procedureMenu},
		{procedureMenu.ID, "DELETE_PROCEDURE", "Delete Procedure", "DELETE", &procedureMenu},
		{procedureMenu.ID, "SEARCH_PROCEDURE", "Search Procedure", "VIEW", &procedureMenu},
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
	log.Println("Permissions seeded successfully")
	return nil
}


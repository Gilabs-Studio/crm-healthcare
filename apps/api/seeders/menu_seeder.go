package seeders

import (
	"log"

	"github.com/gilabs/crm-healthcare/api/internal/database"
	"github.com/gilabs/crm-healthcare/api/internal/domain/permission"
)

// SeedMenus seeds initial menus based on the provided structure
func SeedMenus() error {
	// Check if menus already exist
	var count int64
	database.DB.Model(&permission.Menu{}).Count(&count)
	if count > 0 {
		log.Println("Menus already seeded, skipping...")
		return nil
	}

	// Create root menu: Data Master
	dataMasterMenu := permission.Menu{
		Name:   "Data Master",
		Icon:   "database",
		URL:    "/data-master",
		Order:  1,
		Status: "active",
	}
	if err := database.DB.Create(&dataMasterMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", dataMasterMenu.Name)

	// Create Users menu directly under Data Master
	userPageMenu := permission.Menu{
		Name:     "Users",
		Icon:     "users",
		URL:      "/users",
		ParentID: &dataMasterMenu.ID,
		Order:    1,
		Status:   "active",
	}
	if err := database.DB.Create(&userPageMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", userPageMenu.Name)

	// Create Company Management submenu
	companyMgmtMenu := permission.Menu{
		Name:     "Company Management",
		Icon:     "building",
		URL:      "/data-master/company",
		ParentID: &dataMasterMenu.ID,
		Order:    2,
		Status:   "active",
	}
	if err := database.DB.Create(&companyMgmtMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", companyMgmtMenu.Name)

	// Create Company submenu
	companyMenu := permission.Menu{
		Name:     "Company",
		Icon:     "building",
		URL:      "/data-master/company/company",
		ParentID: &companyMgmtMenu.ID,
		Order:    1,
		Status:   "active",
	}
	if err := database.DB.Create(&companyMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", companyMenu.Name)

	// Create Division submenu
	divisionMenu := permission.Menu{
		Name:     "Division",
		Icon:     "grid",
		URL:      "/data-master/company/division",
		ParentID: &companyMgmtMenu.ID,
		Order:    2,
		Status:   "active",
	}
	if err := database.DB.Create(&divisionMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", divisionMenu.Name)

	// Create Job Position submenu
	jobPositionMenu := permission.Menu{
		Name:     "Job Position",
		Icon:     "briefcase",
		URL:      "/data-master/company/job-position",
		ParentID: &companyMgmtMenu.ID,
		Order:    3,
		Status:   "active",
	}
	if err := database.DB.Create(&jobPositionMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", jobPositionMenu.Name)

	// Create Employee submenu
	employeeMenu := permission.Menu{
		Name:     "Employee",
		Icon:     "user",
		URL:      "/data-master/company/employee",
		ParentID: &companyMgmtMenu.ID,
		Order:    4,
		Status:   "active",
	}
	if err := database.DB.Create(&employeeMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", employeeMenu.Name)

	// Create Master Data - Healthcare submenu (under Data Master)
	healthcareMenu := permission.Menu{
		Name:     "Healthcare",
		Icon:     "heart",
		URL:      "/master-data",
		ParentID: &dataMasterMenu.ID,
		Order:    3,
		Status:   "active",
	}
	if err := database.DB.Create(&healthcareMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", healthcareMenu.Name)

	// Create Diagnosis submenu
	diagnosisMenu := permission.Menu{
		Name:     "Diagnosis",
		Icon:     "stethoscope",
		URL:      "/master-data/diagnosis",
		ParentID: &healthcareMenu.ID,
		Order:    1,
		Status:   "active",
	}
	if err := database.DB.Create(&diagnosisMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", diagnosisMenu.Name)

	// Create Procedures submenu
	procedureMenu := permission.Menu{
		Name:     "Procedures",
		Icon:     "activity",
		URL:      "/master-data/procedures",
		ParentID: &healthcareMenu.ID,
		Order:    2,
		Status:   "active",
	}
	if err := database.DB.Create(&procedureMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", procedureMenu.Name)

	log.Println("Menus seeded successfully")
	return nil
}

// UpdateMenuStructure updates existing menu structure to fix Users menu location
func UpdateMenuStructure() error {
	log.Println("Updating menu structure...")

	// Find Data Master menu
	var dataMasterMenu permission.Menu
	if err := database.DB.Where("url = ?", "/data-master").First(&dataMasterMenu).Error; err != nil {
		log.Printf("Data Master menu not found, skipping update: %v", err)
		return nil
	}

	// Find Users menu (might be under Users Management)
	var userPageMenu permission.Menu
	if err := database.DB.Where("url = ?", "/users").First(&userPageMenu).Error; err != nil {
		log.Printf("Users menu not found, skipping update: %v", err)
		return nil
	}

	// Check if Users menu needs to be moved
	if userPageMenu.ParentID == nil || *userPageMenu.ParentID != dataMasterMenu.ID {
		// Find Users Management menu if exists
		var usersManagementMenu permission.Menu
		if err := database.DB.Where("url = ?", "/system/users").First(&usersManagementMenu).Error; err == nil {
			// Users menu is under Users Management, need to move it
			log.Printf("Moving Users menu from Users Management to Data Master")
			
			// Update Users menu parent to Data Master
			userPageMenu.ParentID = &dataMasterMenu.ID
			userPageMenu.Order = 1
			if err := database.DB.Save(&userPageMenu).Error; err != nil {
				return err
			}
			log.Printf("Updated Users menu parent to Data Master")

			// Delete Users Management menu and its permissions
			// First, delete permissions associated with Users Management
			// Also delete from role_permissions junction table
			if err := database.DB.Exec(
				"DELETE FROM role_permissions WHERE permission_id IN (SELECT id FROM permissions WHERE menu_id = ?)",
				usersManagementMenu.ID,
			).Error; err != nil {
				log.Printf("Warning: Failed to delete Users Management role permissions: %v", err)
			}
			if err := database.DB.Where("menu_id = ?", usersManagementMenu.ID).Delete(&permission.Permission{}).Error; err != nil {
				log.Printf("Warning: Failed to delete Users Management permissions: %v", err)
			}
			
			// Delete Users Management menu
			if err := database.DB.Delete(&usersManagementMenu).Error; err != nil {
				log.Printf("Warning: Failed to delete Users Management menu: %v", err)
			} else {
				log.Printf("Deleted Users Management menu")
			}
		}
	}

	// Find and delete System menu if it exists and has no children
	var systemMenu permission.Menu
	if err := database.DB.Where("url = ?", "/system").First(&systemMenu).Error; err == nil {
		// Check if System menu has any children
		var childCount int64
		database.DB.Model(&permission.Menu{}).Where("parent_id = ?", systemMenu.ID).Count(&childCount)
		
		if childCount == 0 {
			// Delete System menu if it has no children
			if err := database.DB.Delete(&systemMenu).Error; err != nil {
				log.Printf("Warning: Failed to delete System menu: %v", err)
			} else {
				log.Printf("Deleted System menu")
			}
		}
	}

	// Update order of other menus under Data Master
	var companyMgmtMenu permission.Menu
	if err := database.DB.Where("url = ?", "/data-master/company").First(&companyMgmtMenu).Error; err == nil {
		if companyMgmtMenu.ParentID != nil && *companyMgmtMenu.ParentID == dataMasterMenu.ID {
			companyMgmtMenu.Order = 2
			database.DB.Save(&companyMgmtMenu)
		}
	}

	var healthcareMenu permission.Menu
	if err := database.DB.Where("url = ?", "/master-data").First(&healthcareMenu).Error; err == nil {
		if healthcareMenu.ParentID != nil && *healthcareMenu.ParentID == dataMasterMenu.ID {
			healthcareMenu.Order = 3
			database.DB.Save(&healthcareMenu)
		}
	}

	log.Println("Menu structure updated successfully")
	return nil
}


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

	// Create Dashboard menu (root level)
	dashboardMenu := permission.Menu{
		Name:   "Dashboard",
		Icon:   "layout-dashboard",
		URL:    "/dashboard",
		Order:  1,
		Status: "active",
	}
	if err := database.DB.Create(&dashboardMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", dashboardMenu.Name)

	// Create root menu: Data Master
	dataMasterMenu := permission.Menu{
		Name:   "Data Master",
		Icon:   "database",
		URL:    "/data-master",
		Order:  2,
		Status: "active",
	}
	if err := database.DB.Create(&dataMasterMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", dataMasterMenu.Name)

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

	// Create Users menu under Master Data
	userPageMenu := permission.Menu{
		Name:     "Users",
		Icon:     "users",
		URL:      "/master-data/users",
		ParentID: &healthcareMenu.ID,
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

	// Find Healthcare/Master Data menu
	var healthcareMenu permission.Menu
	if err := database.DB.Where("url = ?", "/master-data").First(&healthcareMenu).Error; err != nil {
		log.Printf("Master Data menu not found, skipping update: %v", err)
		return nil
	}

	// Find Users menu with old URL (/users)
	var userPageMenu permission.Menu
	if err := database.DB.Where("url = ?", "/users").First(&userPageMenu).Error; err == nil {
		// Users menu exists with old URL, need to migrate
		log.Printf("Migrating Users menu from /users to /master-data/users")
		
		// Update Users menu URL and parent to Master Data
		userPageMenu.URL = "/master-data/users"
		userPageMenu.ParentID = &healthcareMenu.ID
		userPageMenu.Order = 1
		if err := database.DB.Save(&userPageMenu).Error; err != nil {
			return err
		}
		log.Printf("Updated Users menu URL to /master-data/users and parent to Master Data")
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

	// Update Healthcare menu order
	if healthcareMenu.ParentID != nil && *healthcareMenu.ParentID == dataMasterMenu.ID {
		healthcareMenu.Order = 3
		database.DB.Save(&healthcareMenu)
	}

	log.Println("Menu structure updated successfully")
	return nil
}


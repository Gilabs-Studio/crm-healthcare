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

	// Create Users menu under Data Master
	userPageMenu := permission.Menu{
		Name:     "Users",
		Icon:     "users",
		URL:      "/master-data/users",
		ParentID: &dataMasterMenu.ID,
		Order:    1,
		Status:   "active",
	}
	if err := database.DB.Create(&userPageMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", userPageMenu.Name)

	// Create Sales CRM root menu
	salesCRMMenu := permission.Menu{
		Name:   "Sales CRM",
		Icon:   "briefcase",
		URL:    "/sales-crm",
		Order:  3,
		Status: "active",
	}
	if err := database.DB.Create(&salesCRMMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", salesCRMMenu.Name)

	// Create Accounts menu under Sales CRM
	accountsMenu := permission.Menu{
		Name:     "Accounts",
		Icon:     "building-2",
		URL:      "/accounts",
		ParentID: &salesCRMMenu.ID,
		Order:    1,
		Status:   "active",
	}
	if err := database.DB.Create(&accountsMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", accountsMenu.Name)

	// Create Visit Reports menu under Sales CRM
	visitReportsMenu := permission.Menu{
		Name:     "Visit Reports",
		Icon:     "map-pin",
		URL:      "/visit-reports",
		ParentID: &salesCRMMenu.ID,
		Order:    2,
		Status:   "active",
	}
	if err := database.DB.Create(&visitReportsMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", visitReportsMenu.Name)

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

	// Find Users menu with old URL (/users) or old parent (Healthcare)
	var userPageMenu permission.Menu
	if err := database.DB.Where("url = ?", "/master-data/users").First(&userPageMenu).Error; err == nil {
		// Users menu exists, update parent to Data Master directly
		log.Printf("Updating Users menu parent to Data Master")
		userPageMenu.ParentID = &dataMasterMenu.ID
		userPageMenu.Order = 1
		if err := database.DB.Save(&userPageMenu).Error; err != nil {
			return err
		}
		log.Printf("Updated Users menu parent to Data Master")
	} else if err := database.DB.Where("url = ?", "/users").First(&userPageMenu).Error; err == nil {
		// Users menu exists with old URL, need to migrate
		log.Printf("Migrating Users menu from /users to /master-data/users")
		
		// Update Users menu URL and parent to Data Master
		userPageMenu.URL = "/master-data/users"
		userPageMenu.ParentID = &dataMasterMenu.ID
		userPageMenu.Order = 1
		if err := database.DB.Save(&userPageMenu).Error; err != nil {
			return err
		}
		log.Printf("Updated Users menu URL to /master-data/users and parent to Data Master")
	}

	// Find and delete Healthcare menu if it exists
	var healthcareMenu permission.Menu
	if err := database.DB.Where("url = ?", "/master-data").First(&healthcareMenu).Error; err == nil {
		// Check if Healthcare menu has any children
		var childCount int64
		database.DB.Model(&permission.Menu{}).Where("parent_id = ?", healthcareMenu.ID).Count(&childCount)
		
		if childCount == 0 {
			// Delete Healthcare menu if it has no children
			if err := database.DB.Delete(&healthcareMenu).Error; err != nil {
				log.Printf("Warning: Failed to delete Healthcare menu: %v", err)
			} else {
				log.Printf("Deleted Healthcare menu")
			}
		}
	}

	// Find and delete Company Management menu and its children if they exist
	var companyMgmtMenu permission.Menu
	if err := database.DB.Where("url = ?", "/data-master/company").First(&companyMgmtMenu).Error; err == nil {
		// Find and delete all children of Company Management
		var children []permission.Menu
		database.DB.Where("parent_id = ?", companyMgmtMenu.ID).Find(&children)
		for _, child := range children {
			if err := database.DB.Delete(&child).Error; err != nil {
				log.Printf("Warning: Failed to delete menu %s: %v", child.Name, err)
			} else {
				log.Printf("Deleted menu: %s", child.Name)
			}
		}
		
		// Delete Company Management menu
		if err := database.DB.Delete(&companyMgmtMenu).Error; err != nil {
			log.Printf("Warning: Failed to delete Company Management menu: %v", err)
		} else {
			log.Printf("Deleted Company Management menu")
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

	log.Println("Menu structure updated successfully")
	return nil
}


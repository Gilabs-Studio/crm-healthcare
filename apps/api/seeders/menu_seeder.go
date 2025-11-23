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

	// Create System menu first (for Users Management)
	systemMenu := permission.Menu{
		Name:   "System",
		Icon:   "settings",
		URL:    "/system",
		Order:  1,
		Status: "active",
	}
	if err := database.DB.Create(&systemMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", systemMenu.Name)

	// Create Users Management submenu (under System)
	usersMenu := permission.Menu{
		Name:     "Users Management",
		Icon:     "users",
		URL:      "/system/users",
		ParentID: &systemMenu.ID,
		Order:    1,
		Status:   "active",
	}
	if err := database.DB.Create(&usersMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", usersMenu.Name)

	// Create Users submenu (the actual page with actions)
	userPageMenu := permission.Menu{
		Name:     "Users",
		Icon:     "users",
		URL:      "/users",
		ParentID: &usersMenu.ID,
		Order:    1,
		Status:   "active",
	}
	if err := database.DB.Create(&userPageMenu).Error; err != nil {
		return err
	}
	log.Printf("Created menu: %s", userPageMenu.Name)

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

	// Create Company Management submenu
	companyMgmtMenu := permission.Menu{
		Name:     "Company Management",
		Icon:     "building",
		URL:      "/data-master/company",
		ParentID: &dataMasterMenu.ID,
		Order:    1,
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


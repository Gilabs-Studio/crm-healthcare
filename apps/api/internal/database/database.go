package database

import (
	"fmt"
	"log"

	"github.com/gilabs/crm-healthcare/api/internal/config"
	"github.com/gilabs/crm-healthcare/api/internal/domain/auth"
	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Connect initializes database connection
func Connect() error {
	dsn := config.GetDSN()

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connected successfully")
	return nil
}

// AutoMigrate runs database migrations
func AutoMigrate() error {
	err := DB.AutoMigrate(
		&auth.User{},           // Users table (already exists from auth)
		&user.Role{},           // Roles table
		&user.Permission{},     // Permissions table
		&user.UserRole{},       // User-Role many-to-many
		&user.RolePermission{}, // Role-Permission many-to-many
	)
	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("Database migrations completed")
	return nil
}

// Close closes database connection
func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}


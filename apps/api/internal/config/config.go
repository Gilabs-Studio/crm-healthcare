package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Cerebras CerebrasConfig
	Storage  StorageConfig
}

type ServerConfig struct {
	Port string
	Env  string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type JWTConfig struct {
	SecretKey      string
	AccessTokenTTL int // in hours
	RefreshTokenTTL int // in days
}

type CerebrasConfig struct {
	BaseURL string
	APIKey  string
	Model   string // Default model name
}

type StorageConfig struct {
	Type      string // Storage type: "local" or "r2"
	UploadDir string // Directory for uploaded files (local storage only)
	BaseURL   string // Base URL for serving files (e.g., /uploads or https://cdn.example.com)
	// R2 Configuration
	R2Endpoint       string // R2 endpoint URL (e.g., https://<account-id>.r2.cloudflarestorage.com)
	R2AccessKeyID    string // R2 Access Key ID
	R2SecretAccessKey string // R2 Secret Access Key
	R2Bucket         string // R2 Bucket name
	R2PublicURL      string // Public URL for R2 bucket (e.g., https://<bucket>.<domain>.com or custom domain)
}

var AppConfig *Config

func Load() error {
	// Load .env file if exists (for local development only)
	// Skip .env loading in production to use Docker environment variables
	if os.Getenv("ENV") != "production" {
		_ = godotenv.Load()
	}

	AppConfig = &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
			Env:  getEnv("ENV", "development"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			DBName:   getEnv("DB_NAME", "crm_healthcare"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		JWT: JWTConfig{
			SecretKey:      getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
			AccessTokenTTL: getEnvAsInt("JWT_ACCESS_TTL", 24), // 24 hours
			RefreshTokenTTL: getEnvAsInt("JWT_REFRESH_TTL", 7), // 7 days
		},
		Cerebras: CerebrasConfig{
			BaseURL: getEnv("CEREBRAS_BASE_URL", "https://api.cerebras.ai"),
			APIKey:  getEnv("CEREBRAS_API_KEY", ""),
			Model:   getEnv("CEREBRAS_MODEL", "llama-3.1-8b"), // Default model
		},
		Storage: StorageConfig{
			Type:            getEnv("STORAGE_TYPE", "local"), // "local" or "r2"
			UploadDir:       getEnv("STORAGE_UPLOAD_DIR", "./uploads"),
			BaseURL:         getEnv("STORAGE_BASE_URL", "/uploads"),
			R2Endpoint:      getEnv("R2_ENDPOINT", ""),
			R2AccessKeyID:   getEnv("R2_ACCESS_KEY_ID", ""),
			R2SecretAccessKey: getEnv("R2_SECRET_ACCESS_KEY", ""),
			R2Bucket:        getEnv("R2_BUCKET", ""),
			R2PublicURL:     getEnv("R2_PUBLIC_URL", ""),
		},
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	var value int
	_, err := fmt.Sscanf(valueStr, "%d", &value)
	if err != nil {
		return defaultValue
	}
	return value
}

func GetDSN() string {
	db := AppConfig.Database
	// Ensure sslmode is set, default to disable if empty
	sslmode := db.SSLMode
	if sslmode == "" {
		sslmode = "disable"
	}
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		db.Host, db.Port, db.User, db.Password, db.DBName, sslmode,
	)
}


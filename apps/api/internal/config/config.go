package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Server    ServerConfig
	Database  DatabaseConfig
	JWT       JWTConfig
	Cerebras  CerebrasConfig
	Storage   StorageConfig
	RateLimit RateLimitConfig
	HSTS      HSTSConfig
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

// RateLimitRule defines rate limit configuration for a specific endpoint type
type RateLimitRule struct {
	Requests int // Number of requests allowed
	Window   int // Time window in seconds
}

// RateLimitConfig defines rate limit configuration for different endpoint types
type RateLimitConfig struct {
	Login   RateLimitRule // Login endpoint: 5 requests per 15 minutes (Level 1 - IP)
	Refresh RateLimitRule // Refresh token endpoint: 10 requests per hour
	Upload  RateLimitRule // File upload endpoint: 20 requests per hour
	General RateLimitRule // General API endpoints: 100 requests per minute
	Public  RateLimitRule // Public endpoints: 200 requests per minute
	// Multi-level rate limiting for login
	LoginByEmail RateLimitRule // Level 2: 10 attempts per 15 minutes per email
	LoginGlobal  RateLimitRule // Level 3: 100 attempts per minute globally
}

// HSTSConfig defines HTTP Strict Transport Security configuration
type HSTSConfig struct {
	MaxAge            int  // Max age in seconds (default: 31536000 = 1 year)
	IncludeSubDomains bool // Include subdomains in HSTS policy
	Preload           bool // Enable HSTS preload
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
		RateLimit: RateLimitConfig{
			Login: RateLimitRule{
				Requests: getEnvAsInt("RATE_LIMIT_LOGIN_REQUESTS", 5),      // 5 requests per 15 minutes (Level 1 - IP)
				Window:   getEnvAsInt("RATE_LIMIT_LOGIN_WINDOW", 900),      // 15 minutes (900 seconds)
			},
			Refresh: RateLimitRule{
				Requests: getEnvAsInt("RATE_LIMIT_REFRESH_REQUESTS", 10),   // 10 requests
				Window:   getEnvAsInt("RATE_LIMIT_REFRESH_WINDOW", 3600),  // 1 hour (3600 seconds)
			},
			Upload: RateLimitRule{
				Requests: getEnvAsInt("RATE_LIMIT_UPLOAD_REQUESTS", 20),    // 20 requests
				Window:   getEnvAsInt("RATE_LIMIT_UPLOAD_WINDOW", 3600),   // 1 hour (3600 seconds)
			},
			General: RateLimitRule{
				Requests: getEnvAsInt("RATE_LIMIT_GENERAL_REQUESTS", 100),  // 100 requests
				Window:   getEnvAsInt("RATE_LIMIT_GENERAL_WINDOW", 60),    // 1 minute (60 seconds)
			},
			Public: RateLimitRule{
				Requests: getEnvAsInt("RATE_LIMIT_PUBLIC_REQUESTS", 200),   // 200 requests
				Window:   getEnvAsInt("RATE_LIMIT_PUBLIC_WINDOW", 60),     // 1 minute (60 seconds)
			},
			// Level 2: Rate limit by email/username (prevents brute force even if IP changes)
			LoginByEmail: RateLimitRule{
				Requests: getEnvAsInt("RATE_LIMIT_LOGIN_BY_EMAIL_REQUESTS", 10), // 10 requests per 15 minutes per email
				Window:   getEnvAsInt("RATE_LIMIT_LOGIN_BY_EMAIL_WINDOW", 900),  // 15 minutes (900 seconds)
			},
			// Level 3: Global rate limit (prevents DOS on entire system)
			LoginGlobal: RateLimitRule{
				Requests: getEnvAsInt("RATE_LIMIT_LOGIN_GLOBAL_REQUESTS", 100), // 100 requests per minute globally
				Window:   getEnvAsInt("RATE_LIMIT_LOGIN_GLOBAL_WINDOW", 60),   // 1 minute (60 seconds)
			},
		},
		HSTS: HSTSConfig{
			MaxAge:            getEnvAsInt("HSTS_MAX_AGE", 31536000),        // 1 year in seconds
			IncludeSubDomains: getEnv("HSTS_INCLUDE_SUBDOMAINS", "true") == "true",
			Preload:           getEnv("HSTS_PRELOAD", "true") == "true",
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


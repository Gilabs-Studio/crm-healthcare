package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"sync"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/config"
	"github.com/gilabs/crm-healthcare/api/pkg/errors"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// rateLimiter stores rate limiters per IP address
type rateLimiter struct {
	limiter        *rate.Limiter
	lastSeen       time.Time
	firstLimitTime *time.Time // Time when rate limit was first exceeded (nil if not limited)
	window         int        // Window in seconds for calculating reset time
}

// rateLimiters is a map of IP addresses to their rate limiters
type rateLimiters struct {
	mu       sync.RWMutex
	limiters map[string]*rateLimiter
	cleanup  *time.Ticker
}

var (
	// Global rate limiters for different endpoint types
	loginLimiters      *rateLimiters // Level 1: IP-based
	loginByEmailLimiters *rateLimiters // Level 2: Email-based
	loginGlobalLimiters  *rateLimiters // Level 3: Global limit
	refreshLimiters    *rateLimiters
	uploadLimiters     *rateLimiters
	generalLimiters    *rateLimiters
	publicLimiters     *rateLimiters
)

func init() {
	// Initialize rate limiters
	loginLimiters = newRateLimiters()        // Level 1: IP-based
	loginByEmailLimiters = newRateLimiters() // Level 2: Email-based
	loginGlobalLimiters = newRateLimiters()  // Level 3: Global (single key "global")
	refreshLimiters = newRateLimiters()
	uploadLimiters = newRateLimiters()
	generalLimiters = newRateLimiters()
	publicLimiters = newRateLimiters()
}

// newRateLimiters creates a new rate limiters instance
func newRateLimiters() *rateLimiters {
	rl := &rateLimiters{
		limiters: make(map[string]*rateLimiter),
		cleanup:  time.NewTicker(5 * time.Minute), // Cleanup every 5 minutes
	}

	// Start cleanup goroutine
	go func() {
		for range rl.cleanup.C {
			rl.cleanupLimiters()
		}
	}()

	return rl
}

// getLimiter returns a rate limiter for the given key (IP, email, etc.)
// It also returns the rateLimiter struct to access firstLimitTime
func (rl *rateLimiters) getLimiter(key string, requests int, window int) (*rate.Limiter, *rateLimiter) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	limiter, exists := rl.limiters[key]
	if !exists {
		// Create new limiter: rate.Every(window) creates a limiter that allows
		// requests at a rate of 1 request per window/requests seconds
		// So for 5 requests per 15 minutes: rate.Every(180 seconds) with burst of 5
		interval := time.Duration(window) * time.Second / time.Duration(requests)
		limiter = &rateLimiter{
			limiter:        rate.NewLimiter(rate.Every(interval), requests),
			lastSeen:       time.Now(),
			firstLimitTime: nil,
			window:         window,
		}
		rl.limiters[key] = limiter
	} else {
		limiter.lastSeen = time.Now()
		// Update window if changed (shouldn't happen, but just in case)
		limiter.window = window
	}

	return limiter.limiter, limiter
}

// getResetTime calculates the reset time for a rate limiter
// If firstLimitTime is set, use it. Otherwise, calculate from now.
func (rl *rateLimiters) getResetTime(limiter *rateLimiter, window int) int64 {
	rl.mu.RLock()
	defer rl.mu.RUnlock()

	if limiter.firstLimitTime != nil {
		// Use the time when limit was first exceeded
		resetTime := limiter.firstLimitTime.Add(time.Duration(window) * time.Second)
		return resetTime.Unix()
	}
	// Fallback: calculate from now (shouldn't happen if logic is correct)
	return time.Now().Add(time.Duration(window) * time.Second).Unix()
}

// setFirstLimitTime records when rate limit was first exceeded
func (rl *rateLimiters) setFirstLimitTime(limiter *rateLimiter) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	if limiter.firstLimitTime == nil {
		now := time.Now()
		limiter.firstLimitTime = &now
	}
}

// clearFirstLimitTime clears the first limit time when limit resets
func (rl *rateLimiters) clearFirstLimitTime(limiter *rateLimiter) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	limiter.firstLimitTime = nil
}

// cleanupLimiters removes limiters that haven't been used in the last hour
func (rl *rateLimiters) cleanupLimiters() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	for ip, limiter := range rl.limiters {
		if now.Sub(limiter.lastSeen) > 1*time.Hour {
			delete(rl.limiters, ip)
		}
	}
}

// isLocalhost checks if the IP is localhost/127.0.0.1/::1
func isLocalhost(ip string) bool {
	return ip == "127.0.0.1" || ip == "::1" || ip == "localhost" || ip == ""
}

// RateLimitMiddleware creates a rate limiting middleware based on endpoint type
func RateLimitMiddleware(limitType string) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		
		// Skip rate limiting for localhost in development (to avoid issues during testing)
		// In production, this should be removed or controlled via environment variable
		if isLocalhost(ip) && (config.AppConfig.Server.Env == "development" || config.AppConfig.Server.Env == "dev") {
			c.Next()
			return
		}
		
		var limiter *rate.Limiter
		var limiterStruct *rateLimiter
		var rule config.RateLimitRule

		// For login endpoint, implement multi-level rate limiting
		if limitType == "login" {
			// Level 3: Global rate limit (check first to prevent DOS)
			globalRule := config.AppConfig.RateLimit.LoginGlobal
			globalLimiter, globalLimiterStruct := loginGlobalLimiters.getLimiter("global", globalRule.Requests, globalRule.Window)
			if !globalLimiter.Allow() {
				// Record first limit time if not already set
				loginGlobalLimiters.setFirstLimitTime(globalLimiterStruct)
				// Get reset time based on first limit time (stable, won't change on refresh)
				resetTime := loginGlobalLimiters.getResetTime(globalLimiterStruct, globalRule.Window)
				c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", globalRule.Requests))
				c.Header("X-RateLimit-Remaining", "0")
				c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", resetTime))
				errors.ErrorResponse(c, "RATE_LIMIT_EXCEEDED", nil, nil)
				c.Abort()
				return
			} else {
				// Clear first limit time if limit is no longer exceeded
				loginGlobalLimiters.clearFirstLimitTime(globalLimiterStruct)
			}

			// Level 2: Rate limit by email/username (extract from request body)
			// Read request body to get email without consuming it
			var loginReq struct {
				Email string `json:"email"`
			}
			
			// Read body and restore it so handler can read it too
			if c.Request.Body != nil {
				bodyBytes, err := io.ReadAll(c.Request.Body)
				if err == nil && len(bodyBytes) > 0 {
					// Restore body for handler
					c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
					
					// Try to parse JSON to get email
					if json.Unmarshal(bodyBytes, &loginReq) == nil && loginReq.Email != "" {
						emailRule := config.AppConfig.RateLimit.LoginByEmail
						emailLimiter, emailLimiterStruct := loginByEmailLimiters.getLimiter(loginReq.Email, emailRule.Requests, emailRule.Window)
						if !emailLimiter.Allow() {
							// Record first limit time if not already set
							loginByEmailLimiters.setFirstLimitTime(emailLimiterStruct)
							// Get reset time based on first limit time (stable, won't change on refresh)
							resetTime := loginByEmailLimiters.getResetTime(emailLimiterStruct, emailRule.Window)
							c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", emailRule.Requests))
							c.Header("X-RateLimit-Remaining", "0")
							c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", resetTime))
							errors.ErrorResponse(c, "RATE_LIMIT_EXCEEDED", nil, nil)
							c.Abort()
							return
						} else {
							// Clear first limit time if limit is no longer exceeded
							loginByEmailLimiters.clearFirstLimitTime(emailLimiterStruct)
						}
					}
				}
			}

			// Level 1: IP-based rate limit
			rule = config.AppConfig.RateLimit.Login
			limiter, limiterStruct = loginLimiters.getLimiter(ip, rule.Requests, rule.Window)
		} else {
			// Get appropriate rate limit rule based on type for non-login endpoints
			var limiterStruct *rateLimiter
			switch limitType {
			case "refresh":
				rule = config.AppConfig.RateLimit.Refresh
				limiter, limiterStruct = refreshLimiters.getLimiter(ip, rule.Requests, rule.Window)
			case "upload":
				// For upload, we might want to use user ID instead of IP
				// For now, use IP as fallback
				rule = config.AppConfig.RateLimit.Upload
				limiter, limiterStruct = uploadLimiters.getLimiter(ip, rule.Requests, rule.Window)
			case "general":
				rule = config.AppConfig.RateLimit.General
				limiter, limiterStruct = generalLimiters.getLimiter(ip, rule.Requests, rule.Window)
			case "public":
				rule = config.AppConfig.RateLimit.Public
				limiter, limiterStruct = publicLimiters.getLimiter(ip, rule.Requests, rule.Window)
			default:
				// Default to general rate limit
				rule = config.AppConfig.RateLimit.General
				limiter, limiterStruct = generalLimiters.getLimiter(ip, rule.Requests, rule.Window)
			}

			// Check if request is allowed
			if !limiter.Allow() {
				// Record first limit time if not already set
				switch limitType {
				case "refresh":
					refreshLimiters.setFirstLimitTime(limiterStruct)
					resetTime := refreshLimiters.getResetTime(limiterStruct, rule.Window)
					c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", rule.Requests))
					c.Header("X-RateLimit-Remaining", "0")
					c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", resetTime))
				case "upload":
					uploadLimiters.setFirstLimitTime(limiterStruct)
					resetTime := uploadLimiters.getResetTime(limiterStruct, rule.Window)
					c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", rule.Requests))
					c.Header("X-RateLimit-Remaining", "0")
					c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", resetTime))
				case "general":
					generalLimiters.setFirstLimitTime(limiterStruct)
					resetTime := generalLimiters.getResetTime(limiterStruct, rule.Window)
					c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", rule.Requests))
					c.Header("X-RateLimit-Remaining", "0")
					c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", resetTime))
				case "public":
					publicLimiters.setFirstLimitTime(limiterStruct)
					resetTime := publicLimiters.getResetTime(limiterStruct, rule.Window)
					c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", rule.Requests))
					c.Header("X-RateLimit-Remaining", "0")
					c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", resetTime))
				}

				// Return 429 Too Many Requests with proper error format
				errors.ErrorResponse(c, "RATE_LIMIT_EXCEEDED", nil, nil)
				c.Abort()
				return
			} else {
				// Clear first limit time if limit is no longer exceeded
				switch limitType {
				case "refresh":
					refreshLimiters.clearFirstLimitTime(limiterStruct)
				case "upload":
					uploadLimiters.clearFirstLimitTime(limiterStruct)
				case "general":
					generalLimiters.clearFirstLimitTime(limiterStruct)
				case "public":
					publicLimiters.clearFirstLimitTime(limiterStruct)
				}
			}
		}

		// Check if request is allowed (for Level 1 login)
		if limitType == "login" {
			if !limiter.Allow() {
				// Record first limit time if not already set
				loginLimiters.setFirstLimitTime(limiterStruct)
				// Get reset time based on first limit time (stable, won't change on refresh)
				resetTime := loginLimiters.getResetTime(limiterStruct, rule.Window)
				c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", rule.Requests))
				c.Header("X-RateLimit-Remaining", "0")
				c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", resetTime))
				errors.ErrorResponse(c, "RATE_LIMIT_EXCEEDED", nil, nil)
				c.Abort()
				return
			} else {
				// Clear first limit time if limit is no longer exceeded
				loginLimiters.clearFirstLimitTime(limiterStruct)
			}
		}

		// Calculate remaining requests
		// Note: rate.Limiter doesn't expose remaining directly, so we estimate
		// based on the burst capacity
		remaining := rule.Requests - 1 // Approximate, as limiter doesn't expose exact remaining

		// Set rate limit headers
		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", rule.Requests))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
		c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", time.Now().Add(time.Duration(rule.Window)*time.Second).Unix()))

		c.Next()
	}
}


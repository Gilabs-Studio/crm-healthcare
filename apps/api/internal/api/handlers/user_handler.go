package handlers

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
	userservice "github.com/gilabs/crm-healthcare/api/internal/service/user"
	"github.com/gilabs/crm-healthcare/api/pkg/errors"
	"github.com/gilabs/crm-healthcare/api/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type UserHandler struct {
	userService    *userservice.Service
	profileService *userservice.ProfileService
}

func NewUserHandler(userService *userservice.Service, profileService *userservice.ProfileService) *UserHandler {
	return &UserHandler{
		userService:    userService,
		profileService: profileService,
	}
}

// List handles list users request
func (h *UserHandler) List(c *gin.Context) {
	var req user.ListUsersRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidQueryParamResponse(c)
		return
	}

	users, pagination, err := h.userService.List(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{
		Pagination: &response.PaginationMeta{
			Page:       pagination.Page,
			PerPage:    pagination.PerPage,
			Total:      pagination.Total,
			TotalPages: pagination.TotalPages,
			HasNext:    pagination.Page < pagination.TotalPages,
			HasPrev:    pagination.Page > 1,
		},
		Filters: map[string]interface{}{},
	}

	if req.Search != "" {
		meta.Filters["search"] = req.Search
	}
	if req.Status != "" {
		meta.Filters["status"] = req.Status
	}
	if req.RoleID != "" {
		meta.Filters["role_id"] = req.RoleID
	}

	response.SuccessResponse(c, users, meta)
}

// GetByID handles get user by ID request
func (h *UserHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	user, err := h.userService.GetByID(id)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.ErrorResponse(c, "USER_NOT_FOUND", map[string]interface{}{
				"user_id": id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, user, nil)
}

// Create handles create user request
func (h *UserHandler) Create(c *gin.Context) {
	var req user.CreateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	createdUser, err := h.userService.Create(&req)
	if err != nil {
		if err == userservice.ErrUserAlreadyExists {
			errors.ErrorResponse(c, "RESOURCE_ALREADY_EXISTS", map[string]interface{}{
				"resource": "user",
				"field":    "email",
				"value":    req.Email,
			}, nil)
			return
		}
		if err == userservice.ErrRoleNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource": "role",
				"role_id":  req.RoleID,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	if userID, exists := c.Get("user_id"); exists {
		if id, ok := userID.(string); ok {
			meta.CreatedBy = id
		}
	}

	response.SuccessResponseCreated(c, createdUser, meta)
}

// Update handles update user request
func (h *UserHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req user.UpdateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	updatedUser, err := h.userService.Update(id, &req)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.ErrorResponse(c, "USER_NOT_FOUND", map[string]interface{}{
				"user_id": id,
			}, nil)
			return
		}
		if err == userservice.ErrUserAlreadyExists {
			errors.ErrorResponse(c, "RESOURCE_ALREADY_EXISTS", map[string]interface{}{
				"resource": "user",
				"field":    "email",
			}, nil)
			return
		}
		if err == userservice.ErrRoleNotFound {
			errors.ErrorResponse(c, "NOT_FOUND", map[string]interface{}{
				"resource": "role",
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	if userID, exists := c.Get("user_id"); exists {
		if id, ok := userID.(string); ok {
			meta.UpdatedBy = id
		}
	}

	response.SuccessResponse(c, updatedUser, meta)
}

// Delete handles delete user request
func (h *UserHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	err := h.userService.Delete(id)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.ErrorResponse(c, "USER_NOT_FOUND", map[string]interface{}{
				"user_id": id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// Get user ID for meta
	meta := &response.Meta{}
	if userIDVal, exists := c.Get("user_id"); exists {
		if id, ok := userIDVal.(string); ok {
			meta.DeletedBy = id
		}
	}

	response.SuccessResponseDeleted(c, "user", id, meta)
}

// GetProfile handles get user profile request
func (h *UserHandler) GetProfile(c *gin.Context) {
	id := c.Param("id")

	profile, err := h.profileService.GetProfile(id)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.ErrorResponse(c, "USER_NOT_FOUND", map[string]interface{}{
				"user_id": id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, profile, nil)
}

// UpdateProfile handles update user profile request
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	id := c.Param("id")
	var req user.UpdateProfileRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	updatedUser, err := h.profileService.UpdateProfile(id, &req)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.ErrorResponse(c, "USER_NOT_FOUND", map[string]interface{}{
				"user_id": id,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	meta := &response.Meta{}
	if userID, exists := c.Get("user_id"); exists {
		if uid, ok := userID.(string); ok {
			meta.UpdatedBy = uid
		}
	}

	response.SuccessResponse(c, updatedUser, meta)
}

// ChangePassword handles change password request
func (h *UserHandler) ChangePassword(c *gin.Context) {
	id := c.Param("id")
	var req user.ChangePasswordRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	err := h.profileService.ChangePassword(id, &req)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.ErrorResponse(c, "USER_NOT_FOUND", map[string]interface{}{
				"user_id": id,
			}, nil)
			return
		}
		if err.Error() == "current password is incorrect" {
			errors.ErrorResponse(c, "INVALID_CREDENTIALS", map[string]interface{}{
				"field": "current_password",
			}, nil)
			return
		}
		if err.Error() == "passwords do not match" {
			errors.ErrorResponse(c, "VALIDATION_ERROR", nil, []response.FieldError{
				{
					Field:   "confirm_password",
					Code:    "INVALID_FORMAT",
					Message: "Passwords do not match",
				},
			})
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}

// GetMyProfile handles get current user profile request (mobile endpoint)
// Uses user ID from JWT token, no need for :id in path
func (h *UserHandler) GetMyProfile(c *gin.Context) {
	// Get user ID from JWT token (set by AuthMiddleware)
	userID, exists := c.Get("user_id")
	if !exists {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "User ID not found in token",
		}, nil)
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "Invalid user ID format",
		}, nil)
		return
	}

	profile, err := h.profileService.GetProfile(userIDStr)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.ErrorResponse(c, "USER_NOT_FOUND", map[string]interface{}{
				"resource":    "user",
				"resource_id": userIDStr,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// Create meta (empty but present for consistency)
	meta := &response.Meta{}

	response.SuccessResponse(c, profile, meta)
}

// UpdateMyProfile handles update current user profile request (mobile endpoint)
// Uses user ID from JWT token, no need for :id in path
func (h *UserHandler) UpdateMyProfile(c *gin.Context) {
	// Get user ID from JWT token (set by AuthMiddleware)
	userID, exists := c.Get("user_id")
	if !exists {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "User ID not found in token",
		}, nil)
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "Invalid user ID format",
		}, nil)
		return
	}

	var req user.UpdateProfileRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	updatedUser, err := h.profileService.UpdateProfile(userIDStr, &req)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.ErrorResponse(c, "USER_NOT_FOUND", map[string]interface{}{
				"resource":    "user",
				"resource_id": userIDStr,
			}, nil)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// Create meta with updated_by
	meta := &response.Meta{}
	if uid, exists := c.Get("user_id"); exists {
		if id, ok := uid.(string); ok {
			meta.UpdatedBy = id
		}
	}

	response.SuccessResponse(c, updatedUser, meta)
}

// ChangeMyPassword handles change current user password request (mobile endpoint)
// Uses user ID from JWT token, no need for :id in path
func (h *UserHandler) ChangeMyPassword(c *gin.Context) {
	// Get user ID from JWT token (set by AuthMiddleware)
	userID, exists := c.Get("user_id")
	if !exists {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "User ID not found in token",
		}, nil)
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		errors.ErrorResponse(c, "UNAUTHORIZED", map[string]interface{}{
			"reason": "Invalid user ID format",
		}, nil)
		return
	}

	var req user.ChangePasswordRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	err := h.profileService.ChangePassword(userIDStr, &req)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.ErrorResponse(c, "USER_NOT_FOUND", map[string]interface{}{
				"resource":    "user",
				"resource_id": userIDStr,
			}, nil)
			return
		}
		if err.Error() == "current password is incorrect" {
			errors.ErrorResponse(c, "INVALID_CREDENTIALS", map[string]interface{}{
				"field": "current_password",
				"reason": "Current password is incorrect",
			}, nil)
			return
		}
		if err.Error() == "passwords do not match" {
			errors.ErrorResponse(c, "VALIDATION_ERROR", nil, []response.FieldError{
				{
					Field:   "confirm_password",
					Code:    "INVALID_FORMAT",
					Message: "Passwords do not match",
				},
			})
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// Change password returns 204 No Content (no body) as per standard
	response.SuccessResponseNoContent(c)
}
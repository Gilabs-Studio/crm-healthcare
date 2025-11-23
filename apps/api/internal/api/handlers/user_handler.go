package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
	userservice "github.com/gilabs/crm-healthcare/api/internal/service/user"
	"github.com/gilabs/crm-healthcare/api/pkg/errors"
	"github.com/gilabs/crm-healthcare/api/pkg/response"
)

type UserHandler struct {
	userService *userservice.Service
}

func NewUserHandler(userService *userservice.Service) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// ListUsers handles list users request
// @Summary List users
// @Description Get a list of users with pagination and filters
// @Tags users
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param per_page query int false "Items per page" default(20)
// @Param search query string false "Search term"
// @Param role query string false "Filter by role"
// @Param status query string false "Filter by status"
// @Param sort_by query string false "Sort field" default(created_at)
// @Param sort_order query string false "Sort order" default(desc)
// @Success 200 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Router /api/v1/users [get]
func (h *UserHandler) ListUsers(c *gin.Context) {
	var req user.ListUsersRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	// Set defaults
	if req.Page < 1 {
		req.Page = 1
	}
	if req.PerPage < 1 {
		req.PerPage = 20
	}

	result, err := h.userService.List(&req)
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	// Create pagination meta
	paginationMeta := response.NewPaginationMeta(req.Page, req.PerPage, result.Total)

	// Create filters meta
	filters := make(map[string]interface{})
	if req.Search != "" {
		filters["search"] = req.Search
	}
	if req.Role != "" {
		filters["role"] = req.Role
	}
	if req.Status != "" {
		filters["status"] = req.Status
	}

	meta := &response.Meta{
		Pagination: paginationMeta,
		Filters:    filters,
	}

	response.SuccessResponse(c, result.Users, meta)
}

// GetUser handles get user by ID request
// @Summary Get user by ID
// @Description Get user details by ID
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Router /api/v1/users/:id [get]
func (h *UserHandler) GetUser(c *gin.Context) {
	id := c.Param("id")

	userResponse, err := h.userService.GetByID(id)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.NotFoundResponse(c, "user", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, userResponse, nil)
}

// CreateUser handles create user request
// @Summary Create user
// @Description Create a new user
// @Tags users
// @Accept json
// @Produce json
// @Param request body user.CreateUserRequest true "User data"
// @Success 201 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 409 {object} response.APIResponse
// @Router /api/v1/users [post]
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req user.CreateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	userResponse, err := h.userService.Create(&req)
	if err != nil {
		if err == userservice.ErrUserAlreadyExists {
			errors.ErrorResponse(c, "RESOURCE_ALREADY_EXISTS", map[string]interface{}{
				"resource": "user",
				"field":    "email",
				"value":    req.Email,
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

	response.SuccessResponseCreated(c, userResponse, meta)
}

// UpdateUser handles update user request
// @Summary Update user
// @Description Update user information
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param request body user.UpdateUserRequest true "User data"
// @Success 200 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Router /api/v1/users/:id [put]
func (h *UserHandler) UpdateUser(c *gin.Context) {
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

	userResponse, err := h.userService.Update(id, &req)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.NotFoundResponse(c, "user", id)
			return
		}
		if err == userservice.ErrUserAlreadyExists {
			errors.ErrorResponse(c, "RESOURCE_ALREADY_EXISTS", map[string]interface{}{
				"resource": "user",
				"field":    "email",
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

	response.SuccessResponse(c, userResponse, meta)
}

// DeleteUser handles delete user request
// @Summary Delete user
// @Description Soft delete a user
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 204
// @Failure 404 {object} response.APIResponse
// @Router /api/v1/users/:id [delete]
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")

	err := h.userService.Delete(id)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.NotFoundResponse(c, "user", id)
			return
		}
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponseNoContent(c)
}

// UpdateUserPermissions handles update user permissions request
// @Summary Update user permissions
// @Description Update user roles and permissions
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param request body user.UpdateUserPermissionsRequest true "Permissions data"
// @Success 200 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Router /api/v1/users/:id/permissions [put]
func (h *UserHandler) UpdateUserPermissions(c *gin.Context) {
	id := c.Param("id")
	var req user.UpdateUserPermissionsRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			errors.HandleValidationError(c, validationErrors)
			return
		}
		errors.InvalidRequestBodyResponse(c)
		return
	}

	userResponse, err := h.userService.UpdatePermissions(id, &req)
	if err != nil {
		if err == userservice.ErrUserNotFound {
			errors.NotFoundResponse(c, "user", id)
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

	response.SuccessResponse(c, userResponse, meta)
}

// ListRoles handles list roles request
// @Summary List roles
// @Description Get a list of all roles
// @Tags users
// @Accept json
// @Produce json
// @Success 200 {object} response.APIResponse
// @Router /api/v1/users/roles [get]
func (h *UserHandler) ListRoles(c *gin.Context) {
	roles, err := h.userService.ListRoles()
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, roles, nil)
}

// ListPermissions handles list permissions request
// @Summary List permissions
// @Description Get a list of all permissions
// @Tags users
// @Accept json
// @Produce json
// @Success 200 {object} response.APIResponse
// @Router /api/v1/users/permissions [get]
func (h *UserHandler) ListPermissions(c *gin.Context) {
	permissions, err := h.userService.ListPermissions()
	if err != nil {
		errors.InternalServerErrorResponse(c, "")
		return
	}

	response.SuccessResponse(c, permissions, nil)
}


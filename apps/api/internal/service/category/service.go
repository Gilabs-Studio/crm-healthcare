package category

import (
	"errors"

	"github.com/gilabs/crm-healthcare/api/internal/domain/category"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

var (
	ErrCategoryNotFound = errors.New("category not found")
)

type Service struct {
	categoryRepo interfaces.CategoryRepository
}

func NewService(categoryRepo interfaces.CategoryRepository) *Service {
	return &Service{
		categoryRepo: categoryRepo,
	}
}

// List returns a list of categories with pagination
func (s *Service) List(req *category.ListCategoriesRequest) ([]category.CategoryResponse, *PaginationResult, error) {
	categories, total, err := s.categoryRepo.List(req)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]category.CategoryResponse, len(categories))
	for i, c := range categories {
		responses[i] = *c.ToCategoryResponse()
	}

	page := req.Page
	if page < 1 {
		page = 1
	}
	perPage := req.PerPage
	if perPage < 1 {
		perPage = 20
	}
	if perPage > 100 {
		perPage = 100
	}

	pagination := &PaginationResult{
		Page:       page,
		PerPage:    perPage,
		Total:      int(total),
		TotalPages: int((total + int64(perPage) - 1) / int64(perPage)),
	}

	return responses, pagination, nil
}

// GetByID returns a category by ID
func (s *Service) GetByID(id string) (*category.CategoryResponse, error) {
	c, err := s.categoryRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCategoryNotFound
		}
		return nil, err
	}
	return c.ToCategoryResponse(), nil
}

// Create creates a new category
func (s *Service) Create(req *category.CreateCategoryRequest) (*category.CategoryResponse, error) {
	// Set default status
	status := req.Status
	if status == "" {
		status = "active"
	}

	// Create category
	c := &category.Category{
		Type:        category.CategoryType(req.Type),
		Name:        req.Name,
		Description: req.Description,
		Status:      status,
	}

	if err := s.categoryRepo.Create(c); err != nil {
		return nil, err
	}

	return c.ToCategoryResponse(), nil
}

// Update updates a category
func (s *Service) Update(id string, req *category.UpdateCategoryRequest) (*category.CategoryResponse, error) {
	// Find category
	c, err := s.categoryRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCategoryNotFound
		}
		return nil, err
	}

	// Update fields
	if req.Name != nil {
		c.Name = *req.Name
	}
	if req.Description != nil {
		c.Description = req.Description
	}
	if req.Status != nil {
		c.Status = *req.Status
	}

	if err := s.categoryRepo.Update(c); err != nil {
		return nil, err
	}

	return c.ToCategoryResponse(), nil
}

// Delete deletes a category
func (s *Service) Delete(id string) error {
	// Check if category exists
	_, err := s.categoryRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrCategoryNotFound
		}
		return err
	}

	return s.categoryRepo.Delete(id)
}

// PaginationResult represents pagination result
type PaginationResult struct {
	Page       int `json:"page"`
	PerPage    int `json:"per_page"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}


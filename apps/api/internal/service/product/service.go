package product

import (
	"errors"

	"github.com/gilabs/crm-healthcare/api/internal/domain/product"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

var (
	ErrProductNotFound         = errors.New("product not found")
	ErrProductCategoryNotFound = errors.New("product category not found")
)

type Service struct {
	productRepo         interfaces.ProductRepository
	productCategoryRepo interfaces.ProductCategoryRepository
}

func NewService(
	productRepo interfaces.ProductRepository,
	productCategoryRepo interfaces.ProductCategoryRepository,
) *Service {
	return &Service{
		productRepo:         productRepo,
		productCategoryRepo: productCategoryRepo,
	}
}

// PaginationResult represents pagination information.
type PaginationResult struct {
	Page       int
	PerPage    int
	Total      int
	TotalPages int
}

// ListProducts returns a list of products with pagination.
func (s *Service) ListProducts(req *product.ListProductsRequest) ([]product.ProductResponse, *PaginationResult, error) {
	products, total, err := s.productRepo.List(req)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]product.ProductResponse, len(products))
	for i, p := range products {
		responses[i] = *p.ToProductResponse()
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

	totalPages := int((total + int64(perPage) - 1) / int64(perPage))

	pagination := &PaginationResult{
		Page:       page,
		PerPage:    perPage,
		Total:      int(total),
		TotalPages: totalPages,
	}

	return responses, pagination, nil
}

// GetProductByID returns a product by ID.
func (s *Service) GetProductByID(id string) (*product.ProductResponse, error) {
	p, err := s.productRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}

	return p.ToProductResponse(), nil
}

// CreateProduct creates a new product.
func (s *Service) CreateProduct(req *product.CreateProductRequest) (*product.ProductResponse, error) {
	// Validate category exists.
	_, err := s.productCategoryRepo.FindByID(req.CategoryID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProductCategoryNotFound
		}
		return nil, err
	}

	taxable := true
	if req.Taxable != nil {
		taxable = *req.Taxable
	}

	p := &product.Product{
		Name:        req.Name,
		SKU:         req.SKU,
		Barcode:     req.Barcode,
		Price:       req.Price,
		Cost:        req.Cost,
		Stock:       req.Stock,
		CategoryID:  req.CategoryID,
		Status:      req.Status,
		Taxable:     taxable,
		Description: req.Description,
	}

	if p.Status == "" {
		p.Status = "active"
	}

	if err := s.productRepo.Create(p); err != nil {
		return nil, err
	}

	// Reload to get relations.
	p, err = s.productRepo.FindByID(p.ID)
	if err != nil {
		return nil, err
	}

	return p.ToProductResponse(), nil
}

// UpdateProduct updates an existing product.
func (s *Service) UpdateProduct(id string, req *product.UpdateProductRequest) (*product.ProductResponse, error) {
	p, err := s.productRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}

	if req.Name != "" {
		p.Name = req.Name
	}
	if req.SKU != "" {
		p.SKU = req.SKU
	}
	if req.Barcode != "" {
		p.Barcode = req.Barcode
	}
	if req.Price != nil {
		p.Price = *req.Price
	}
	if req.Cost != nil {
		p.Cost = *req.Cost
	}
	if req.Stock != nil {
		p.Stock = *req.Stock
	}
	if req.CategoryID != "" {
		// Validate category exists.
		_, err := s.productCategoryRepo.FindByID(req.CategoryID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrProductCategoryNotFound
			}
			return nil, err
		}
		p.CategoryID = req.CategoryID
	}
	if req.Status != "" {
		p.Status = req.Status
	}
	if req.Taxable != nil {
		p.Taxable = *req.Taxable
	}
	if req.Description != "" {
		p.Description = req.Description
	}

	if err := s.productRepo.Update(p); err != nil {
		return nil, err
	}

	// Reload to get relations.
	p, err = s.productRepo.FindByID(p.ID)
	if err != nil {
		return nil, err
	}

	return p.ToProductResponse(), nil
}

// DeleteProduct deletes a product.
func (s *Service) DeleteProduct(id string) error {
	_, err := s.productRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrProductNotFound
		}
		return err
	}

	return s.productRepo.Delete(id)
}

// ListProductCategories returns a list of product categories.
func (s *Service) ListProductCategories(req *product.ListProductCategoriesRequest) ([]product.ProductCategoryResponse, error) {
	categories, err := s.productCategoryRepo.List(req)
	if err != nil {
		return nil, err
	}

	responses := make([]product.ProductCategoryResponse, len(categories))
	for i, c := range categories {
		responses[i] = *c.ToProductCategoryResponse()
	}

	return responses, nil
}

// GetProductCategoryByID returns a product category by ID.
func (s *Service) GetProductCategoryByID(id string) (*product.ProductCategoryResponse, error) {
	c, err := s.productCategoryRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProductCategoryNotFound
		}
		return nil, err
	}

	return c.ToProductCategoryResponse(), nil
}

// CreateProductCategory creates a new product category.
func (s *Service) CreateProductCategory(req *product.CreateProductCategoryRequest) (*product.ProductCategoryResponse, error) {
	status := req.Status
	if status == "" {
		status = "active"
	}

	c := &product.ProductCategory{
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		Status:      status,
	}

	if err := s.productCategoryRepo.Create(c); err != nil {
		return nil, err
	}

	// Reload to ensure we return latest state.
	c, err := s.productCategoryRepo.FindByID(c.ID)
	if err != nil {
		return nil, err
	}

	return c.ToProductCategoryResponse(), nil
}

// UpdateProductCategory updates an existing product category.
func (s *Service) UpdateProductCategory(id string, req *product.UpdateProductCategoryRequest) (*product.ProductCategoryResponse, error) {
	c, err := s.productCategoryRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProductCategoryNotFound
		}
		return nil, err
	}

	if req.Name != "" {
		c.Name = req.Name
	}
	if req.Slug != "" {
		c.Slug = req.Slug
	}
	if req.Description != "" {
		c.Description = req.Description
	}
	if req.Status != "" {
		c.Status = req.Status
	}

	if err := s.productCategoryRepo.Update(c); err != nil {
		return nil, err
	}

	c, err = s.productCategoryRepo.FindByID(c.ID)
	if err != nil {
		return nil, err
	}

	return c.ToProductCategoryResponse(), nil
}

// DeleteProductCategory deletes a product category.
func (s *Service) DeleteProductCategory(id string) error {
	_, err := s.productCategoryRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrProductCategoryNotFound
		}
		return err
	}

	return s.productCategoryRepo.Delete(id)
}



package account

import (
	"errors"

	"github.com/gilabs/crm-healthcare/api/internal/domain/account"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

var (
	ErrAccountNotFound = errors.New("account not found")
)

type Service struct {
	accountRepo interfaces.AccountRepository
}

func NewService(accountRepo interfaces.AccountRepository) *Service {
	return &Service{
		accountRepo: accountRepo,
	}
}

// PaginationResult represents pagination information
type PaginationResult struct {
	Page       int
	PerPage    int
	Total      int
	TotalPages int
}

// List returns a list of accounts with pagination
func (s *Service) List(req *account.ListAccountsRequest) ([]account.AccountResponse, *PaginationResult, error) {
	accounts, total, err := s.accountRepo.List(req)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]account.AccountResponse, len(accounts))
	for i, a := range accounts {
		responses[i] = *a.ToAccountResponse()
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

// GetByID returns an account by ID
func (s *Service) GetByID(id string) (*account.AccountResponse, error) {
	a, err := s.accountRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrAccountNotFound
		}
		return nil, err
	}
	return a.ToAccountResponse(), nil
}

// Create creates a new account
func (s *Service) Create(req *account.CreateAccountRequest) (*account.AccountResponse, error) {
	a := &account.Account{
		Name:       req.Name,
		Category:   req.Category,
		Address:    req.Address,
		City:       req.City,
		Province:   req.Province,
		Phone:      req.Phone,
		Email:      req.Email,
		AssignedTo: req.AssignedTo,
	}

	if req.Status != "" {
		a.Status = req.Status
	} else {
		a.Status = "active"
	}

	if err := s.accountRepo.Create(a); err != nil {
		return nil, err
	}

	return a.ToAccountResponse(), nil
}

// Update updates an account
func (s *Service) Update(id string, req *account.UpdateAccountRequest) (*account.AccountResponse, error) {
	a, err := s.accountRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrAccountNotFound
		}
		return nil, err
	}

	// Update fields if provided
	if req.Name != "" {
		a.Name = req.Name
	}
	if req.Category != "" {
		a.Category = req.Category
	}
	if req.Address != "" {
		a.Address = req.Address
	}
	if req.City != "" {
		a.City = req.City
	}
	if req.Province != "" {
		a.Province = req.Province
	}
	if req.Phone != "" {
		a.Phone = req.Phone
	}
	if req.Email != "" {
		a.Email = req.Email
	}
	if req.Status != "" {
		a.Status = req.Status
	}
	if req.AssignedTo != "" {
		a.AssignedTo = req.AssignedTo
	}

	if err := s.accountRepo.Update(a); err != nil {
		return nil, err
	}

	return a.ToAccountResponse(), nil
}

// Delete deletes an account
func (s *Service) Delete(id string) error {
	_, err := s.accountRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrAccountNotFound
		}
		return err
	}

	return s.accountRepo.Delete(id)
}


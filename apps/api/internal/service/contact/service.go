package contact

import (
	"errors"

	"github.com/gilabs/crm-healthcare/api/internal/domain/contact"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

var (
	ErrContactNotFound    = errors.New("contact not found")
	ErrAccountNotFound    = errors.New("account not found")
	ErrContactRoleNotFound = errors.New("contact role not found")
)

type Service struct {
	contactRepo     interfaces.ContactRepository
	accountRepo     interfaces.AccountRepository
	contactRoleRepo interfaces.ContactRoleRepository
}

func NewService(contactRepo interfaces.ContactRepository, accountRepo interfaces.AccountRepository, contactRoleRepo interfaces.ContactRoleRepository) *Service {
	return &Service{
		contactRepo:     contactRepo,
		accountRepo:     accountRepo,
		contactRoleRepo: contactRoleRepo,
	}
}

// PaginationResult represents pagination information
type PaginationResult struct {
	Page       int
	PerPage    int
	Total      int
	TotalPages int
}

// List returns a list of contacts with pagination
func (s *Service) List(req *contact.ListContactsRequest) ([]contact.ContactResponse, *PaginationResult, error) {
	contacts, total, err := s.contactRepo.List(req)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]contact.ContactResponse, len(contacts))
	for i, c := range contacts {
		responses[i] = *c.ToContactResponse()
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

// GetByID returns a contact by ID
func (s *Service) GetByID(id string) (*contact.ContactResponse, error) {
	c, err := s.contactRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrContactNotFound
		}
		return nil, err
	}
	return c.ToContactResponse(), nil
}

// Create creates a new contact
func (s *Service) Create(req *contact.CreateContactRequest) (*contact.ContactResponse, error) {
	// Verify account exists
	_, err := s.accountRepo.FindByID(req.AccountID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrAccountNotFound
		}
		return nil, err
	}

	// Validate contact role exists
	_, err = s.contactRoleRepo.FindByID(req.RoleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrContactRoleNotFound
		}
		return nil, err
	}

	c := &contact.Contact{
		AccountID: req.AccountID,
		Name:      req.Name,
		RoleID:    req.RoleID,
		Phone:     req.Phone,
		Email:     req.Email,
		Position:  req.Position,
		Notes:     req.Notes,
	}

	if err := s.contactRepo.Create(c); err != nil {
		return nil, err
	}

	// Reload with role
	createdContact, err := s.contactRepo.FindByID(c.ID)
	if err != nil {
		return nil, err
	}

	return createdContact.ToContactResponse(), nil
}

// Update updates a contact
func (s *Service) Update(id string, req *contact.UpdateContactRequest) (*contact.ContactResponse, error) {
	c, err := s.contactRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrContactNotFound
		}
		return nil, err
	}

	// If account_id is being updated, verify it exists
	if req.AccountID != "" && req.AccountID != c.AccountID {
		_, err := s.accountRepo.FindByID(req.AccountID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrAccountNotFound
			}
			return nil, err
		}
		c.AccountID = req.AccountID
	}

	// Update fields if provided
	if req.Name != "" {
		c.Name = req.Name
	}
	if req.RoleID != "" {
		// Validate contact role exists
		_, err := s.contactRoleRepo.FindByID(req.RoleID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrContactRoleNotFound
			}
			return nil, err
		}
		c.RoleID = req.RoleID
	}
	if req.Phone != "" {
		c.Phone = req.Phone
	}
	if req.Email != "" {
		c.Email = req.Email
	}
	if req.Position != "" {
		c.Position = req.Position
	}
	if req.Notes != "" {
		c.Notes = req.Notes
	}

	if err := s.contactRepo.Update(c); err != nil {
		return nil, err
	}

	// Reload with role
	updatedContact, err := s.contactRepo.FindByID(c.ID)
	if err != nil {
		return nil, err
	}

	return updatedContact.ToContactResponse(), nil
}

// Delete deletes a contact
func (s *Service) Delete(id string) error {
	_, err := s.contactRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrContactNotFound
		}
		return err
	}

	return s.contactRepo.Delete(id)
}


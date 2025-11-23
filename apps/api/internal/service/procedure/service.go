package procedure

import (
	"errors"

	"github.com/gilabs/crm-healthcare/api/internal/domain/procedure"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

var (
	ErrProcedureNotFound      = errors.New("procedure not found")
	ErrProcedureAlreadyExists = errors.New("procedure already exists")
)

type Service struct {
	procedureRepo interfaces.ProcedureRepository
}

func NewService(procedureRepo interfaces.ProcedureRepository) *Service {
	return &Service{
		procedureRepo: procedureRepo,
	}
}

// List returns a list of procedures with pagination
func (s *Service) List(req *procedure.ListProceduresRequest) ([]procedure.ProcedureResponse, *PaginationResult, error) {
	procedures, total, err := s.procedureRepo.List(req)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]procedure.ProcedureResponse, len(procedures))
	for i, p := range procedures {
		responses[i] = *p.ToProcedureResponse()
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

// GetByID returns a procedure by ID
func (s *Service) GetByID(id string) (*procedure.ProcedureResponse, error) {
	p, err := s.procedureRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProcedureNotFound
		}
		return nil, err
	}
	return p.ToProcedureResponse(), nil
}

// Search returns a list of procedures matching the search query
func (s *Service) Search(req *procedure.SearchProceduresRequest) ([]procedure.ProcedureResponse, error) {
	procedures, err := s.procedureRepo.Search(req)
	if err != nil {
		return nil, err
	}

	responses := make([]procedure.ProcedureResponse, len(procedures))
	for i, p := range procedures {
		responses[i] = *p.ToProcedureResponse()
	}

	return responses, nil
}

// Create creates a new procedure
func (s *Service) Create(req *procedure.CreateProcedureRequest) (*procedure.ProcedureResponse, error) {
	// Check if code already exists
	_, err := s.procedureRepo.FindByCode(req.Code)
	if err == nil {
		return nil, ErrProcedureAlreadyExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Set default status
	status := req.Status
	if status == "" {
		status = "active"
	}

	// Create procedure
	p := &procedure.Procedure{
		Code:        req.Code,
		Name:        req.Name,
		NameEn:      req.NameEn,
		CategoryID:  req.CategoryID,
		Description: req.Description,
		Price:       req.Price,
		Status:      status,
	}

	if err := s.procedureRepo.Create(p); err != nil {
		return nil, err
	}

	// Reload
	createdProcedure, err := s.procedureRepo.FindByID(p.ID)
	if err != nil {
		return nil, err
	}

	return createdProcedure.ToProcedureResponse(), nil
}

// Update updates a procedure
func (s *Service) Update(id string, req *procedure.UpdateProcedureRequest) (*procedure.ProcedureResponse, error) {
	p, err := s.procedureRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProcedureNotFound
		}
		return nil, err
	}

	// Check if code is being updated and if it already exists
	if req.Code != nil && *req.Code != p.Code {
		existing, err := s.procedureRepo.FindByCode(*req.Code)
		if err == nil && existing.ID != id {
			return nil, ErrProcedureAlreadyExists
		}
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		p.Code = *req.Code
	}

	if req.Name != nil {
		p.Name = *req.Name
	}
	if req.NameEn != nil {
		p.NameEn = req.NameEn
	}
	if req.CategoryID != nil {
		p.CategoryID = req.CategoryID
	}
	if req.Description != nil {
		p.Description = req.Description
	}
	if req.Price != nil {
		p.Price = req.Price
	}
	if req.Status != nil {
		p.Status = *req.Status
	}

	if err := s.procedureRepo.Update(p); err != nil {
		return nil, err
	}

	// Reload
	updatedProcedure, err := s.procedureRepo.FindByID(p.ID)
	if err != nil {
		return nil, err
	}

	return updatedProcedure.ToProcedureResponse(), nil
}

// Delete deletes a procedure
func (s *Service) Delete(id string) error {
	_, err := s.procedureRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrProcedureNotFound
		}
		return err
	}

	return s.procedureRepo.Delete(id)
}

// PaginationResult represents pagination information
type PaginationResult struct {
	Page       int
	PerPage    int
	Total      int
	TotalPages int
}


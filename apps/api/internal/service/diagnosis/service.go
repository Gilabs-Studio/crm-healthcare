package diagnosis

import (
	"errors"

	"github.com/gilabs/crm-healthcare/api/internal/domain/diagnosis"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

var (
	ErrDiagnosisNotFound      = errors.New("diagnosis not found")
	ErrDiagnosisAlreadyExists = errors.New("diagnosis already exists")
)

type Service struct {
	diagnosisRepo interfaces.DiagnosisRepository
}

func NewService(diagnosisRepo interfaces.DiagnosisRepository) *Service {
	return &Service{
		diagnosisRepo: diagnosisRepo,
	}
}

// List returns a list of diagnoses with pagination
func (s *Service) List(req *diagnosis.ListDiagnosesRequest) ([]diagnosis.DiagnosisResponse, *PaginationResult, error) {
	diagnoses, total, err := s.diagnosisRepo.List(req)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]diagnosis.DiagnosisResponse, len(diagnoses))
	for i, d := range diagnoses {
		responses[i] = *d.ToDiagnosisResponse()
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

// GetByID returns a diagnosis by ID
func (s *Service) GetByID(id string) (*diagnosis.DiagnosisResponse, error) {
	d, err := s.diagnosisRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrDiagnosisNotFound
		}
		return nil, err
	}
	return d.ToDiagnosisResponse(), nil
}

// Search returns a list of diagnoses matching the search query
func (s *Service) Search(req *diagnosis.SearchDiagnosesRequest) ([]diagnosis.DiagnosisResponse, error) {
	diagnoses, err := s.diagnosisRepo.Search(req)
	if err != nil {
		return nil, err
	}

	responses := make([]diagnosis.DiagnosisResponse, len(diagnoses))
	for i, d := range diagnoses {
		responses[i] = *d.ToDiagnosisResponse()
	}

	return responses, nil
}

// Create creates a new diagnosis
func (s *Service) Create(req *diagnosis.CreateDiagnosisRequest) (*diagnosis.DiagnosisResponse, error) {
	// Check if code already exists
	_, err := s.diagnosisRepo.FindByCode(req.Code)
	if err == nil {
		return nil, ErrDiagnosisAlreadyExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Set default status
	status := req.Status
	if status == "" {
		status = "active"
	}

	// Create diagnosis
	d := &diagnosis.Diagnosis{
		Code:        req.Code,
		Name:        req.Name,
		NameEn:      req.NameEn,
		CategoryID:  req.CategoryID,
		Description: req.Description,
		Status:      status,
	}

	if err := s.diagnosisRepo.Create(d); err != nil {
		return nil, err
	}

	// Reload
	createdDiagnosis, err := s.diagnosisRepo.FindByID(d.ID)
	if err != nil {
		return nil, err
	}

	return createdDiagnosis.ToDiagnosisResponse(), nil
}

// Update updates a diagnosis
func (s *Service) Update(id string, req *diagnosis.UpdateDiagnosisRequest) (*diagnosis.DiagnosisResponse, error) {
	d, err := s.diagnosisRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrDiagnosisNotFound
		}
		return nil, err
	}

	// Check if code is being updated and if it already exists
	if req.Code != nil && *req.Code != d.Code {
		existing, err := s.diagnosisRepo.FindByCode(*req.Code)
		if err == nil && existing.ID != id {
			return nil, ErrDiagnosisAlreadyExists
		}
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		d.Code = *req.Code
	}

	if req.Name != nil {
		d.Name = *req.Name
	}
	if req.NameEn != nil {
		d.NameEn = req.NameEn
	}
	if req.CategoryID != nil {
		d.CategoryID = req.CategoryID
	}
	if req.Description != nil {
		d.Description = req.Description
	}
	if req.Status != nil {
		d.Status = *req.Status
	}

	if err := s.diagnosisRepo.Update(d); err != nil {
		return nil, err
	}

	// Reload
	updatedDiagnosis, err := s.diagnosisRepo.FindByID(d.ID)
	if err != nil {
		return nil, err
	}

	return updatedDiagnosis.ToDiagnosisResponse(), nil
}

// Delete deletes a diagnosis
func (s *Service) Delete(id string) error {
	_, err := s.diagnosisRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrDiagnosisNotFound
		}
		return err
	}

	return s.diagnosisRepo.Delete(id)
}

// PaginationResult represents pagination information
type PaginationResult struct {
	Page       int
	PerPage    int
	Total      int
	TotalPages int
}


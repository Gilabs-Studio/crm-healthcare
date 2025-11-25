package pipeline

import (
	"errors"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/pipeline"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

var (
	ErrPipelineStageNotFound = errors.New("pipeline stage not found")
	ErrDealNotFound          = errors.New("deal not found")
	ErrAccountNotFound       = errors.New("account not found")
	ErrInvalidStage          = errors.New("invalid pipeline stage")
)

type Service struct {
	pipelineRepo interfaces.PipelineRepository
	dealRepo     interfaces.DealRepository
	accountRepo  interfaces.AccountRepository
}

func NewService(pipelineRepo interfaces.PipelineRepository, dealRepo interfaces.DealRepository, accountRepo interfaces.AccountRepository) *Service {
	return &Service{
		pipelineRepo: pipelineRepo,
		dealRepo:     dealRepo,
		accountRepo:  accountRepo,
	}
}

// ListStages returns a list of pipeline stages
func (s *Service) ListStages(req *pipeline.ListPipelineStagesRequest) ([]pipeline.PipelineStageResponse, error) {
	stages, err := s.pipelineRepo.ListStages(req)
	if err != nil {
		return nil, err
	}

	responses := make([]pipeline.PipelineStageResponse, len(stages))
	for i, stage := range stages {
		responses[i] = *stage.ToPipelineStageResponse()
	}

	return responses, nil
}

// GetStageByID returns a pipeline stage by ID
func (s *Service) GetStageByID(id string) (*pipeline.PipelineStageResponse, error) {
	stage, err := s.pipelineRepo.FindStageByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPipelineStageNotFound
		}
		return nil, err
	}

	return stage.ToPipelineStageResponse(), nil
}

// ListDeals returns a list of deals with pagination
func (s *Service) ListDeals(req *pipeline.ListDealsRequest) ([]pipeline.DealResponse, *PaginationResult, error) {
	deals, total, err := s.dealRepo.List(req)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]pipeline.DealResponse, len(deals))
	for i, deal := range deals {
		responses[i] = *deal.ToDealResponse()
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

// GetDealByID returns a deal by ID
func (s *Service) GetDealByID(id string) (*pipeline.DealResponse, error) {
	deal, err := s.dealRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrDealNotFound
		}
		return nil, err
	}

	return deal.ToDealResponse(), nil
}

// CreateDeal creates a new deal
func (s *Service) CreateDeal(req *pipeline.CreateDealRequest, createdBy string) (*pipeline.DealResponse, error) {
	// Validate account exists
	_, err := s.accountRepo.FindByID(req.AccountID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrAccountNotFound
		}
		return nil, err
	}

	// Validate stage exists
	stage, err := s.pipelineRepo.FindStageByID(req.StageID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidStage
		}
		return nil, err
	}

	// Set default status based on stage
	status := "open"
	if stage.IsWon {
		status = "won"
	} else if stage.IsLost {
		status = "lost"
	}

	deal := &pipeline.Deal{
		Title:            req.Title,
		Description:      req.Description,
		AccountID:        req.AccountID,
		ContactID:        req.ContactID,
		StageID:          req.StageID,
		Value:            req.Value,
		Probability:      req.Probability,
		ExpectedCloseDate: req.ExpectedCloseDate,
		AssignedTo:       req.AssignedTo,
		Status:           status,
		Source:           req.Source,
		Notes:            req.Notes,
		CreatedBy:        createdBy,
	}

	if err := s.dealRepo.Create(deal); err != nil {
		return nil, err
	}

	// Reload to get relations
	deal, err = s.dealRepo.FindByID(deal.ID)
	if err != nil {
		return nil, err
	}

	return deal.ToDealResponse(), nil
}

// UpdateDeal updates a deal
func (s *Service) UpdateDeal(id string, req *pipeline.UpdateDealRequest) (*pipeline.DealResponse, error) {
	deal, err := s.dealRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrDealNotFound
		}
		return nil, err
	}

	// Update fields if provided
	if req.Title != "" {
		deal.Title = req.Title
	}
	if req.Description != "" {
		deal.Description = req.Description
	}
	if req.AccountID != "" {
		// Validate account exists
		_, err := s.accountRepo.FindByID(req.AccountID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrAccountNotFound
			}
			return nil, err
		}
		deal.AccountID = req.AccountID
	}
	if req.ContactID != "" {
		deal.ContactID = req.ContactID
	}
	if req.StageID != "" {
		// Validate stage exists
		stage, err := s.pipelineRepo.FindStageByID(req.StageID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrInvalidStage
			}
			return nil, err
		}
		deal.StageID = req.StageID
		// Update status based on stage
		if stage.IsWon {
			deal.Status = "won"
			now := time.Now()
			deal.ActualCloseDate = &now
		} else if stage.IsLost {
			deal.Status = "lost"
			now := time.Now()
			deal.ActualCloseDate = &now
		} else {
			deal.Status = "open"
		}
	}
	if req.Value > 0 {
		deal.Value = req.Value
	}
	if req.Probability >= 0 {
		deal.Probability = req.Probability
	}
	if req.ExpectedCloseDate != nil {
		deal.ExpectedCloseDate = req.ExpectedCloseDate
	}
	if req.AssignedTo != "" {
		deal.AssignedTo = req.AssignedTo
	}
	if req.Status != "" {
		deal.Status = req.Status
	}
	if req.Source != "" {
		deal.Source = req.Source
	}
	if req.Notes != "" {
		deal.Notes = req.Notes
	}

	if err := s.dealRepo.Update(deal); err != nil {
		return nil, err
	}

	// Reload to get relations
	deal, err = s.dealRepo.FindByID(deal.ID)
	if err != nil {
		return nil, err
	}

	return deal.ToDealResponse(), nil
}

// MoveDeal moves a deal to a different stage
func (s *Service) MoveDeal(id string, req *pipeline.MoveDealRequest) (*pipeline.DealResponse, error) {
	deal, err := s.dealRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrDealNotFound
		}
		return nil, err
	}

	// Validate new stage exists
	stage, err := s.pipelineRepo.FindStageByID(req.StageID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidStage
		}
		return nil, err
	}

	deal.StageID = req.StageID
	// Update status based on stage
	if stage.IsWon {
		deal.Status = "won"
		now := time.Now()
		deal.ActualCloseDate = &now
	} else if stage.IsLost {
		deal.Status = "lost"
		now := time.Now()
		deal.ActualCloseDate = &now
	} else {
		deal.Status = "open"
	}

	if err := s.dealRepo.Update(deal); err != nil {
		return nil, err
	}

	// Reload to get relations
	deal, err = s.dealRepo.FindByID(deal.ID)
	if err != nil {
		return nil, err
	}

	return deal.ToDealResponse(), nil
}

// DeleteDeal deletes a deal
func (s *Service) DeleteDeal(id string) error {
	deal, err := s.dealRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrDealNotFound
		}
		return err
	}

	return s.dealRepo.Delete(deal.ID)
}

// GetSummary returns pipeline summary
func (s *Service) GetSummary() (*pipeline.PipelineSummaryResponse, error) {
	return s.dealRepo.GetSummary()
}

// GetForecast returns forecast data
func (s *Service) GetForecast(periodType string) (*pipeline.ForecastResponse, error) {
	now := time.Now()
	var start, end time.Time

	switch periodType {
	case "month":
		start = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		end = start.AddDate(0, 1, 0).Add(-time.Second)
	case "quarter":
		quarter := (now.Month() - 1) / 3
		start = time.Date(now.Year(), quarter*3+1, 1, 0, 0, 0, 0, now.Location())
		end = start.AddDate(0, 3, 0).Add(-time.Second)
	case "year":
		start = time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
		end = start.AddDate(1, 0, 0).Add(-time.Second)
	default:
		// Default to current month
		start = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		end = start.AddDate(0, 1, 0).Add(-time.Second)
		periodType = "month"
	}

	return s.dealRepo.GetForecast(periodType, start, end)
}

// PaginationResult represents pagination information
type PaginationResult struct {
	Page       int
	PerPage    int
	Total      int
	TotalPages int
}


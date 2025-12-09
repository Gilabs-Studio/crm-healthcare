package lead

import (
	"errors"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/account"
	"github.com/gilabs/crm-healthcare/api/internal/domain/activity"
	"github.com/gilabs/crm-healthcare/api/internal/domain/contact"
	"github.com/gilabs/crm-healthcare/api/internal/domain/lead"
	"github.com/gilabs/crm-healthcare/api/internal/domain/pipeline"
	"github.com/gilabs/crm-healthcare/api/internal/domain/user"
	"github.com/gilabs/crm-healthcare/api/internal/domain/visit_report"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

var (
	ErrLeadNotFound           = errors.New("lead not found")
	ErrLeadAlreadyConverted   = errors.New("lead already converted")
	ErrLeadCannotConvert      = errors.New("lead cannot convert")
	ErrInvalidLeadStatus      = errors.New("invalid lead status")
	ErrInvalidLeadSource      = errors.New("invalid lead source")
	ErrStageNotFound          = errors.New("stage not found")
	ErrAccountCreationFailed  = errors.New("account creation failed")
	ErrContactCreationFailed  = errors.New("contact creation failed")
	ErrOpportunityCreationFailed = errors.New("opportunity creation failed")
)

type Service struct {
	leadRepo        interfaces.LeadRepository
	dealRepo        interfaces.DealRepository
	pipelineRepo    interfaces.PipelineRepository
	accountRepo     interfaces.AccountRepository
	contactRepo     interfaces.ContactRepository
	categoryRepo    interfaces.CategoryRepository
	contactRoleRepo interfaces.ContactRoleRepository
	userRepo        interfaces.UserRepository
	activityRepo    interfaces.ActivityRepository    // For auto-migrate activities
	visitReportRepo interfaces.VisitReportRepository // For auto-migrate visit reports
}

func NewService(
	leadRepo interfaces.LeadRepository,
	dealRepo interfaces.DealRepository,
	pipelineRepo interfaces.PipelineRepository,
	accountRepo interfaces.AccountRepository,
	contactRepo interfaces.ContactRepository,
	categoryRepo interfaces.CategoryRepository,
	contactRoleRepo interfaces.ContactRoleRepository,
	userRepo interfaces.UserRepository,
	activityRepo interfaces.ActivityRepository,
	visitReportRepo interfaces.VisitReportRepository,
) *Service {
	return &Service{
		leadRepo:        leadRepo,
		dealRepo:        dealRepo,
		pipelineRepo:    pipelineRepo,
		accountRepo:     accountRepo,
		contactRepo:     contactRepo,
		categoryRepo:    categoryRepo,
		contactRoleRepo: contactRoleRepo,
		userRepo:        userRepo,
		activityRepo:    activityRepo,
		visitReportRepo: visitReportRepo,
	}
}

// PaginationResult represents pagination information
type PaginationResult struct {
	Page       int
	PerPage    int
	Total      int
	TotalPages int
}

// List returns a list of leads with pagination
func (s *Service) List(req *lead.ListLeadsRequest) ([]lead.LeadResponse, *PaginationResult, error) {
	leads, total, err := s.leadRepo.List(req)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]lead.LeadResponse, len(leads))
	for i, l := range leads {
		responses[i] = *l.ToLeadResponse()
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

// GetByID returns a lead by ID
func (s *Service) GetByID(id string) (*lead.LeadResponse, error) {
	l, err := s.leadRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrLeadNotFound
		}
		return nil, err
	}
	return l.ToLeadResponse(), nil
}

// Create creates a new lead
func (s *Service) Create(req *lead.CreateLeadRequest, createdBy string) (*lead.LeadResponse, error) {
	leadStatus := req.LeadStatus
	if leadStatus == "" {
		leadStatus = "new"
	}

	// Helper function to convert empty string to nil pointer
	stringPtr := func(s string) *string {
		if s == "" {
			return nil
		}
		return &s
	}

	l := &lead.Lead{
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		CompanyName: req.CompanyName,
		Email:       req.Email,
		Phone:       req.Phone,
		JobTitle:    req.JobTitle,
		Industry:    req.Industry,
		LeadSource:  req.LeadSource,
		LeadStatus:  leadStatus,
		LeadScore:   req.LeadScore,
		AssignedTo:  stringPtr(req.AssignedTo),
		Notes:       req.Notes,
		Address:     req.Address,
		City:        req.City,
		Province:    req.Province,
		PostalCode:  req.PostalCode,
		Country:     req.Country,
		Website:     req.Website,
		CreatedBy:   createdBy,
	}

	if err := s.leadRepo.Create(l); err != nil {
		return nil, err
	}

	// Reload to get relations
	l, err := s.leadRepo.FindByID(l.ID)
	if err != nil {
		return nil, err
	}

	return l.ToLeadResponse(), nil
}

// Update updates a lead
func (s *Service) Update(id string, req *lead.UpdateLeadRequest) (*lead.LeadResponse, error) {
	l, err := s.leadRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrLeadNotFound
		}
		return nil, err
	}

	// Check if lead is already converted
	if l.LeadStatus == "converted" {
		return nil, ErrLeadAlreadyConverted
	}

	// Update fields if provided
	if req.FirstName != "" {
		l.FirstName = req.FirstName
	}
	if req.LastName != "" {
		l.LastName = req.LastName
	}
	if req.CompanyName != "" {
		l.CompanyName = req.CompanyName
	}
	if req.Email != "" {
		l.Email = req.Email
	}
	if req.Phone != "" {
		l.Phone = req.Phone
	}
	if req.JobTitle != "" {
		l.JobTitle = req.JobTitle
	}
	if req.Industry != "" {
		l.Industry = req.Industry
	}
	if req.LeadSource != "" {
		l.LeadSource = req.LeadSource
	}
	if req.LeadStatus != "" {
		l.LeadStatus = req.LeadStatus
	}
	if req.LeadScore != nil {
		l.LeadScore = *req.LeadScore
	}
	// Helper function to convert empty string to nil pointer
	stringPtr := func(s string) *string {
		if s == "" {
			return nil
		}
		return &s
	}

	if req.AssignedTo != "" {
		l.AssignedTo = stringPtr(req.AssignedTo)
	} else if req.AssignedTo == "" && l.AssignedTo != nil {
		// Allow clearing AssignedTo by sending empty string
		l.AssignedTo = nil
	}
	if req.Notes != "" {
		l.Notes = req.Notes
	}
	if req.Address != "" {
		l.Address = req.Address
	}
	if req.City != "" {
		l.City = req.City
	}
	if req.Province != "" {
		l.Province = req.Province
	}
	if req.PostalCode != "" {
		l.PostalCode = req.PostalCode
	}
	if req.Country != "" {
		l.Country = req.Country
	}
	if req.Website != "" {
		l.Website = req.Website
	}

	if err := s.leadRepo.Update(l); err != nil {
		return nil, err
	}

	// Reload to get relations
	l, err = s.leadRepo.FindByID(l.ID)
	if err != nil {
		return nil, err
	}

	return l.ToLeadResponse(), nil
}

// Delete deletes a lead
func (s *Service) Delete(id string) error {
	l, err := s.leadRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrLeadNotFound
		}
		return err
	}

	// Check if lead is already converted - cannot delete converted leads
	if l.LeadStatus == "converted" {
		return ErrLeadAlreadyConverted
	}

	return s.leadRepo.Delete(l.ID)
}

// Convert converts a qualified lead to opportunity/deal
func (s *Service) Convert(id string, req *lead.ConvertLeadRequest, convertedBy string) (*lead.ConvertLeadResponse, error) {
	// Get lead
	l, err := s.leadRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrLeadNotFound
		}
		return nil, err
	}

	// Validate lead status must be "qualified"
	if l.LeadStatus != "qualified" {
		return nil, ErrLeadCannotConvert
	}

	// Check if already converted
	if l.LeadStatus == "converted" || (l.OpportunityID != nil && *l.OpportunityID != "") {
		return nil, ErrLeadAlreadyConverted
	}

	// Validate stage exists
	stage, err := s.pipelineRepo.FindStageByID(req.StageID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrStageNotFound
		}
		return nil, err
	}

	var accountID string
	var contactID string
	var createdAccount interface{}
	var createdContact interface{}

	// Create account if requested
	if req.CreateAccount && l.CompanyName != "" {
		// Find default category (you may need to adjust this logic)
		categories, err := s.categoryRepo.List()
		if err != nil || len(categories) == 0 {
			return nil, ErrAccountCreationFailed
		}

		account := &account.Account{
			Name:       l.CompanyName,
			CategoryID: categories[0].ID,
			Email:      l.Email,
			Phone:      l.Phone,
			Address:    l.Address,
			City:       l.City,
			Province:   l.Province,
			Status:     "active",
		}
		if l.AssignedTo != nil && *l.AssignedTo != "" {
			account.AssignedTo = l.AssignedTo
		}

		if err := s.accountRepo.Create(account); err != nil {
			return nil, ErrAccountCreationFailed
		}

		accountID = account.ID
		createdAccount = account.ToAccountResponse()
	} else if req.AccountID != "" {
		// Use existing account
		_, err := s.accountRepo.FindByID(req.AccountID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrAccountCreationFailed
			}
			return nil, err
		}
		accountID = req.AccountID
	}

	// Create contact if requested
	if req.CreateContact {
		if accountID == "" {
			return nil, ErrContactCreationFailed // Contact requires account
		}

		// Find default contact role (you may need to adjust this logic)
		contactRoles, err := s.contactRoleRepo.List()
		if err != nil || len(contactRoles) == 0 {
			return nil, ErrContactCreationFailed
		}

		contactName := l.FirstName
		if l.LastName != "" {
			contactName += " " + l.LastName
		}

		contact := &contact.Contact{
			AccountID: accountID,
			Name:      contactName,
			RoleID:    contactRoles[0].ID,
			Email:     l.Email,
			Phone:     l.Phone,
			Position:  l.JobTitle,
		}

		if err := s.contactRepo.Create(contact); err != nil {
			return nil, ErrContactCreationFailed
		}

		contactID = contact.ID
		createdContact = contact.ToContactResponse()
	} else if req.ContactID != "" {
		// Use existing contact
		_, err := s.contactRepo.FindByID(req.ContactID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrContactCreationFailed
			}
			return nil, err
		}
		contactID = req.ContactID
	}

	// Create deal/opportunity
	dealValue := int64(0)
	if req.Value != nil {
		dealValue = *req.Value
	}

	probability := 0
	if req.Probability != nil {
		probability = *req.Probability
	}

	// Set default status based on stage
	dealStatus := "open"
	if stage.IsWon {
		dealStatus = "won"
	} else if stage.IsLost {
		dealStatus = "lost"
	}

	assignedToStr := ""
	if l.AssignedTo != nil {
		assignedToStr = *l.AssignedTo
	}

	deal := &pipeline.Deal{
		Title:             req.OpportunityTitle,
		Description:       req.OpportunityDescription,
		AccountID:         accountID,
		ContactID:         contactID,
		StageID:           req.StageID,
		Value:             dealValue,
		Probability:       probability,
		ExpectedCloseDate: req.ExpectedCloseDate,
		AssignedTo:        assignedToStr,
		LeadID:            &l.ID, // Set LeadID to track source lead
		Status:            dealStatus,
		Source:            l.LeadSource,
		Notes:             l.Notes,
		CreatedBy:         convertedBy,
	}

	if err := s.dealRepo.Create(deal); err != nil {
		return nil, ErrOpportunityCreationFailed
	}

	// Reload deal to get relations
	deal, err = s.dealRepo.FindByID(deal.ID)
	if err != nil {
		return nil, ErrOpportunityCreationFailed
	}

	// Update lead status to converted
	now := time.Now()
	l.LeadStatus = "converted"
	dealID := deal.ID
	l.OpportunityID = &dealID
	accountIDPtr := accountID
	l.AccountID = &accountIDPtr
	contactIDPtr := contactID
	l.ContactID = &contactIDPtr
	l.ConvertedAt = &now
	convertedByPtr := convertedBy
	l.ConvertedBy = &convertedByPtr

	if err := s.leadRepo.Update(l); err != nil {
		return nil, err
	}

	// Auto-migrate Activities: Update all activities linked to this lead
	if s.activityRepo != nil {
		activities, _, err := s.activityRepo.List(&activity.ListActivitiesRequest{
			LeadID:  l.ID,
			PerPage: 1000, // Get all activities for this lead
		})
		if err == nil {
			for _, act := range activities {
				// Update activity to link to new deal and account
				dealIDStr := deal.ID
				act.DealID = &dealIDStr
				if accountID != "" {
					act.AccountID = &accountID
				}
				// Keep lead_id for traceability (already set)
				_ = s.activityRepo.Update(&act) // Ignore error for now
			}
		}
	}

	// Auto-migrate Visit Reports: Update all visit reports linked to this lead
	if s.visitReportRepo != nil {
		visitReports, _, err := s.visitReportRepo.List(&visit_report.ListVisitReportsRequest{
			LeadID:  l.ID,
			PerPage: 1000, // Get all visit reports for this lead
		})
		if err == nil {
			for _, vr := range visitReports {
				// Update visit report to link to new deal and account
				dealIDStr := deal.ID
				vr.DealID = &dealIDStr
				if accountID != "" {
					accountIDStr := accountID
					vr.AccountID = &accountIDStr
				}
				// Keep lead_id for traceability (already set)
				_ = s.visitReportRepo.Update(&vr) // Ignore error for now
			}
		}
	}

	// Reload lead to get relations
	l, err = s.leadRepo.FindByID(l.ID)
	if err != nil {
		return nil, err
	}

	response := &lead.ConvertLeadResponse{
		Lead:        l.ToLeadResponse(),
		Opportunity: deal.ToDealResponse(),
	}

	if createdAccount != nil {
		response.Account = createdAccount
	}
	if createdContact != nil {
		response.Contact = createdContact
	}

	return response, nil
}

// GetAnalytics returns lead analytics
func (s *Service) GetAnalytics(req *lead.LeadAnalyticsRequest) (*lead.LeadAnalyticsResponse, error) {
	return s.leadRepo.GetAnalytics(req)
}

// CreateAccountFromLead creates an account from a lead (pre-convert)
func (s *Service) CreateAccountFromLead(leadID string, req *lead.CreateAccountFromLeadRequest, createdBy string) (*lead.CreateAccountFromLeadResponse, error) {
	// Get lead
	l, err := s.leadRepo.FindByID(leadID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrLeadNotFound
		}
		return nil, err
	}

	// Check if lead already has an account
	if l.AccountID != nil && *l.AccountID != "" {
		return nil, errors.New("lead already has an account")
	}

	// Check if company name exists
	if l.CompanyName == "" {
		return nil, errors.New("company name is required to create account")
	}

	// Get category
	var categoryID string
	if req.CategoryID != "" {
		// Verify category exists
		_, err := s.categoryRepo.FindByID(req.CategoryID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("category not found")
			}
			return nil, err
		}
		categoryID = req.CategoryID
	} else {
		// Use first available category
		categories, err := s.categoryRepo.List()
		if err != nil || len(categories) == 0 {
			return nil, ErrAccountCreationFailed
		}
		categoryID = categories[0].ID
	}

	// Create account
	account := &account.Account{
		Name:       l.CompanyName,
		CategoryID: categoryID,
		Email:      l.Email,
		Phone:      l.Phone,
		Address:    l.Address,
		City:       l.City,
		Province:   l.Province,
		Status:     "active",
	}
	if l.AssignedTo != nil && *l.AssignedTo != "" {
		account.AssignedTo = l.AssignedTo
	}

	if err := s.accountRepo.Create(account); err != nil {
		return nil, ErrAccountCreationFailed
	}

	// Update lead with account ID
	accountIDPtr := account.ID
	l.AccountID = &accountIDPtr
	if err := s.leadRepo.Update(l); err != nil {
		return nil, err
	}

	// Create contact if requested
	var createdContact interface{}
	if req.CreateContact {
		// Find default contact role
		contactRoles, err := s.contactRoleRepo.List()
		if err != nil || len(contactRoles) == 0 {
			// Contact creation is optional, continue without it
		} else {
			contactName := l.FirstName
			if l.LastName != "" {
				contactName += " " + l.LastName
			}

			contact := &contact.Contact{
				AccountID: account.ID,
				Name:      contactName,
				RoleID:    contactRoles[0].ID,
				Email:     l.Email,
				Phone:     l.Phone,
				Position:  l.JobTitle,
			}

			if err := s.contactRepo.Create(contact); err == nil {
				contactIDPtr := contact.ID
				l.ContactID = &contactIDPtr
				_ = s.leadRepo.Update(l) // Ignore error
				createdContact = contact.ToContactResponse()
			}
		}
	}

	// Reload lead to get relations
	l, err = s.leadRepo.FindByID(l.ID)
	if err != nil {
		return nil, err
	}

	return &lead.CreateAccountFromLeadResponse{
		Lead:    l.ToLeadResponse(),
		Account: account.ToAccountResponse(),
		Contact: createdContact,
	}, nil
}

// GetFormData returns form data for creating a lead
func (s *Service) GetFormData() (*lead.LeadFormDataResponse, error) {
	// Lead sources
	leadSources := []lead.LeadSourceOption{
		{Value: "website", Label: "Website"},
		{Value: "referral", Label: "Referral"},
		{Value: "cold_call", Label: "Cold Call"},
		{Value: "event", Label: "Event"},
		{Value: "social_media", Label: "Social Media"},
		{Value: "email_campaign", Label: "Email Campaign"},
		{Value: "partner", Label: "Partner"},
		{Value: "other", Label: "Other"},
	}

	// Lead statuses (with intermediate statuses)
	leadStatuses := []lead.LeadStatusOption{
		{Value: "new", Label: "New"},
		{Value: "contacted", Label: "Contacted"},
		{Value: "qualified", Label: "Qualified"},
		{Value: "unqualified", Label: "Unqualified"},
		{Value: "nurturing", Label: "Nurturing"},
		{Value: "disqualified", Label: "Disqualified"},
		{Value: "converted", Label: "Converted"},
		{Value: "lost", Label: "Lost"},
	}

	// Get active users for assigned_to
	userReq := &user.ListUsersRequest{
		Page:    1,
		PerPage: 100,
		Status:  "active",
	}
	users, _, err := s.userRepo.List(userReq)
	if err != nil {
		return nil, err
	}

	userOptions := make([]lead.UserOption, len(users))
	for i, u := range users {
		userOptions[i] = lead.UserOption{
			ID:    u.ID,
			Name:  u.Name,
			Email: u.Email,
		}
	}

	// Industries (common industries in Indonesia)
	industries := []string{
		"Healthcare",
		"Pharmaceutical",
		"Hospital",
		"Clinic",
		"Medical Device",
		"Biotechnology",
		"Research & Development",
		"Medical Equipment",
		"Health Insurance",
		"Telemedicine",
		"Other",
	}

	// Provinces in Indonesia
	provinces := []string{
		"DKI Jakarta",
		"Jawa Barat",
		"Jawa Tengah",
		"Jawa Timur",
		"Yogyakarta",
		"Banten",
		"Bali",
		"Sumatera Utara",
		"Sumatera Barat",
		"Sumatera Selatan",
		"Lampung",
		"Riau",
		"Kepulauan Riau",
		"Jambi",
		"Aceh",
		"Kalimantan Barat",
		"Kalimantan Tengah",
		"Kalimantan Selatan",
		"Kalimantan Timur",
		"Kalimantan Utara",
		"Sulawesi Utara",
		"Sulawesi Tengah",
		"Sulawesi Selatan",
		"Sulawesi Tenggara",
		"Gorontalo",
		"Maluku",
		"Maluku Utara",
		"Papua",
		"Papua Barat",
		"Papua Selatan",
		"Papua Tengah",
		"Papua Pegunungan",
	}

	// Default values
	defaults := lead.LeadFormDefaults{
		Country:    "Indonesia",
		LeadStatus: "new",
		LeadScore:  0,
	}

	return &lead.LeadFormDataResponse{
		LeadSources: leadSources,
		LeadStatuses: leadStatuses,
		Users:        userOptions,
		Industries:   industries,
		Provinces:    provinces,
		Defaults:     defaults,
	}, nil
}


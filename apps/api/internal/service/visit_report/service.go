package visit_report

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/activity"
	"github.com/gilabs/crm-healthcare/api/internal/domain/visit_report"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

var (
	ErrVisitReportNotFound = errors.New("visit report not found")
	ErrAccountNotFound     = errors.New("account not found")
	ErrInvalidStatus       = errors.New("invalid status transition")
)

type Service struct {
	visitReportRepo interfaces.VisitReportRepository
	accountRepo     interfaces.AccountRepository
	contactRepo     interfaces.ContactRepository
	userRepo        interfaces.UserRepository
	activityRepo    interfaces.ActivityRepository
}

func NewService(visitReportRepo interfaces.VisitReportRepository, accountRepo interfaces.AccountRepository, contactRepo interfaces.ContactRepository, userRepo interfaces.UserRepository, activityRepo interfaces.ActivityRepository) *Service {
	return &Service{
		visitReportRepo: visitReportRepo,
		accountRepo:     accountRepo,
		contactRepo:     contactRepo,
		userRepo:        userRepo,
		activityRepo:    activityRepo,
	}
}

// PaginationResult represents pagination information
type PaginationResult struct {
	Page       int
	PerPage    int
	Total      int
	TotalPages int
}

// loadRelations loads Account, Contact, and SalesRep relations into response
func (s *Service) loadRelations(response *visit_report.VisitReportResponse, vr *visit_report.VisitReport) {
	// Load Account (if AccountID is provided)
	if vr.AccountID != nil && *vr.AccountID != "" {
		if account, err := s.accountRepo.FindByID(*vr.AccountID); err == nil {
			response.Account = map[string]interface{}{
				"id":   account.ID,
				"name": account.Name,
			}
		}
	}
	// Load Contact
	if vr.ContactID != nil && *vr.ContactID != "" {
		if contact, err := s.contactRepo.FindByID(*vr.ContactID); err == nil {
			response.Contact = map[string]interface{}{
				"id":   contact.ID,
				"name": contact.Name,
			}
		}
	}
	// Load SalesRep (User)
	if user, err := s.userRepo.FindByID(vr.SalesRepID); err == nil {
		response.SalesRep = map[string]interface{}{
			"id":   user.ID,
			"name": user.Name,
		}
	}
}

// List returns a list of visit reports with pagination
func (s *Service) List(req *visit_report.ListVisitReportsRequest) ([]visit_report.VisitReportResponse, *PaginationResult, error) {
	visitReports, total, err := s.visitReportRepo.List(req)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]visit_report.VisitReportResponse, len(visitReports))
	for i, vr := range visitReports {
		response := *vr.ToVisitReportResponse()
		// Parse photos JSON
		if vr.Photos != nil {
			var photos []string
			if err := json.Unmarshal(vr.Photos, &photos); err == nil {
				response.Photos = photos
			}
		}
		// Parse check-in location JSON
		if vr.CheckInLocation != nil {
			var location visit_report.Location
			if err := json.Unmarshal(vr.CheckInLocation, &location); err == nil {
				response.CheckInLocation = &location
			}
		}
		// Parse check-out location JSON
		if vr.CheckOutLocation != nil {
			var location visit_report.Location
			if err := json.Unmarshal(vr.CheckOutLocation, &location); err == nil {
				response.CheckOutLocation = &location
			}
		}
		// Load relations
		s.loadRelations(&response, &vr)
		responses[i] = response
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

// GetByID returns a visit report by ID
func (s *Service) GetByID(id string) (*visit_report.VisitReportResponse, error) {
	vr, err := s.visitReportRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrVisitReportNotFound
		}
		return nil, err
	}

	response := *vr.ToVisitReportResponse()
	// Parse photos JSON
	if vr.Photos != nil {
		var photos []string
		if err := json.Unmarshal(vr.Photos, &photos); err == nil {
			response.Photos = photos
		}
	}
	// Parse check-in location JSON
	if vr.CheckInLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(vr.CheckInLocation, &location); err == nil {
			response.CheckInLocation = &location
		}
	}
	// Parse check-out location JSON
	if vr.CheckOutLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(vr.CheckOutLocation, &location); err == nil {
			response.CheckOutLocation = &location
		}
	}
	// Load relations
	s.loadRelations(&response, vr)

	return &response, nil
}

// Create creates a new visit report
func (s *Service) Create(req *visit_report.CreateVisitReportRequest) (*visit_report.VisitReportResponse, error) {
	// Validate SalesRepID
	if req.SalesRepID == "" {
		return nil, errors.New("sales_rep_id is required")
	}

	// Business rule validation: Either LeadID or AccountID is required
	hasLeadID := req.LeadID != nil && *req.LeadID != ""
	hasAccountID := req.AccountID != nil && *req.AccountID != ""
	hasDealID := req.DealID != nil && *req.DealID != ""

	if !hasLeadID && !hasAccountID {
		return nil, errors.New("either lead_id or account_id is required")
	}

	// If DealID is provided, AccountID must be provided (post-conversion phase)
	if hasDealID && !hasAccountID {
		return nil, errors.New("account_id is required when deal_id is provided")
	}

	// Verify account exists if provided
	var err error
	if hasAccountID {
		_, err = s.accountRepo.FindByID(*req.AccountID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrAccountNotFound
			}
			return nil, err
		}
	}

	// Parse visit date (support both "YYYY-MM-DD" and "YYYY-MM-DD HH:mm" formats)
	var visitDate time.Time
	if len(req.VisitDate) > 10 {
		// Format with time: "YYYY-MM-DD HH:mm"
		visitDate, err = time.Parse("2006-01-02 15:04", req.VisitDate)
		if err != nil {
			// Try alternative format "2006-01-02T15:04:05"
			visitDate, err = time.Parse("2006-01-02T15:04:05", req.VisitDate)
		}
		if err != nil {
			// Try ISO format
			visitDate, err = time.Parse(time.RFC3339, req.VisitDate)
		}
	} else {
		// Format without time: "YYYY-MM-DD"
		visitDate, err = time.Parse("2006-01-02", req.VisitDate)
	}
	if err != nil {
		return nil, errors.New("invalid visit_date format, expected YYYY-MM-DD or YYYY-MM-DD HH:mm")
	}
	// Normalize to date only (remove time component)
	visitDate = time.Date(visitDate.Year(), visitDate.Month(), visitDate.Day(), 0, 0, 0, 0, visitDate.Location())

	// Marshal photos to JSON
	var photosJSON datatypes.JSON
	if len(req.Photos) > 0 {
		photosBytes, err := json.Marshal(req.Photos)
		if err != nil {
			return nil, err
		}
		photosJSON = photosBytes
	}

	// Marshal check-in location to JSON
	var checkInLocationJSON datatypes.JSON
	if req.CheckInLocation != nil {
		locationBytes, err := json.Marshal(req.CheckInLocation)
		if err != nil {
			return nil, err
		}
		checkInLocationJSON = locationBytes
	}

	// Marshal check-out location to JSON
	var checkOutLocationJSON datatypes.JSON
	if req.CheckOutLocation != nil {
		locationBytes, err := json.Marshal(req.CheckOutLocation)
		if err != nil {
			return nil, err
		}
		checkOutLocationJSON = locationBytes
	}

	// Validate deal exists if provided
	if req.DealID != nil && *req.DealID != "" {
		// Note: We'll need to inject dealRepo if we want to validate
		// For now, we'll just set it and let database foreign key handle validation
	}

	vr := &visit_report.VisitReport{
		AccountID:        req.AccountID,
		ContactID:        req.ContactID,
		DealID:           req.DealID,
		LeadID:           req.LeadID,
		SalesRepID:       req.SalesRepID,
		VisitDate:        visitDate,
		Purpose:          req.Purpose,
		Notes:            req.Notes,
		CheckInLocation:  checkInLocationJSON,
		CheckOutLocation: checkOutLocationJSON,
		Photos:           photosJSON,
		Status:           "draft",
	}

	if err := s.visitReportRepo.Create(vr); err != nil {
		return nil, err
	}

	// Create activity
	s.createActivity(vr, "visit", "Visit report created")

	// Reload
	createdVR, err := s.visitReportRepo.FindByID(vr.ID)
	if err != nil {
		return nil, err
	}

	response := *createdVR.ToVisitReportResponse()
	if createdVR.Photos != nil {
		var photos []string
		if err := json.Unmarshal(createdVR.Photos, &photos); err == nil {
			response.Photos = photos
		}
	}
	// Parse check-in location JSON
	if createdVR.CheckInLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(createdVR.CheckInLocation, &location); err == nil {
			response.CheckInLocation = &location
		}
	}
	// Parse check-out location JSON
	if createdVR.CheckOutLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(createdVR.CheckOutLocation, &location); err == nil {
			response.CheckOutLocation = &location
		}
	}
	// Load relations
	s.loadRelations(&response, createdVR)

	return &response, nil
}

// Update updates a visit report
func (s *Service) Update(id string, req *visit_report.UpdateVisitReportRequest) (*visit_report.VisitReportResponse, error) {
	vr, err := s.visitReportRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrVisitReportNotFound
		}
		return nil, err
	}

	// Only allow update if status is draft or submitted
	if vr.Status != "draft" && vr.Status != "submitted" {
		return nil, ErrInvalidStatus
	}

	// Business rule validation for update
	hasLeadID := req.LeadID != nil && *req.LeadID != ""
	hasAccountID := req.AccountID != nil && *req.AccountID != ""
	hasDealID := req.DealID != nil && *req.DealID != ""

	// Determine current state
	currentHasLeadID := vr.LeadID != nil && *vr.LeadID != ""
	currentHasAccountID := vr.AccountID != nil && *vr.AccountID != ""

	// After update, must have either LeadID or AccountID
	finalHasLeadID := hasLeadID || (!hasLeadID && currentHasLeadID)
	finalHasAccountID := hasAccountID || (!hasAccountID && currentHasAccountID)

	if !finalHasLeadID && !finalHasAccountID {
		return nil, errors.New("either lead_id or account_id is required")
	}

	// If DealID is provided, AccountID must be provided
	if hasDealID && !finalHasAccountID {
		return nil, errors.New("account_id is required when deal_id is provided")
	}

	// Update fields if provided
	if req.AccountID != nil {
		// Verify account exists
		_, err := s.accountRepo.FindByID(*req.AccountID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrAccountNotFound
			}
			return nil, err
		}
		vr.AccountID = req.AccountID
	}

	if req.ContactID != nil {
		vr.ContactID = req.ContactID
	}

	if req.DealID != nil {
		vr.DealID = req.DealID
	}

	if req.LeadID != nil {
		vr.LeadID = req.LeadID
	}

	if req.VisitDate != "" {
		var visitDate time.Time
		var err error
		if len(req.VisitDate) > 10 {
			// Format with time: "YYYY-MM-DD HH:mm"
			visitDate, err = time.Parse("2006-01-02 15:04", req.VisitDate)
			if err != nil {
				// Try alternative format "2006-01-02T15:04:05"
				visitDate, err = time.Parse("2006-01-02T15:04:05", req.VisitDate)
			}
			if err != nil {
				// Try ISO format
				visitDate, err = time.Parse(time.RFC3339, req.VisitDate)
			}
		} else {
			// Format without time: "YYYY-MM-DD"
			visitDate, err = time.Parse("2006-01-02", req.VisitDate)
		}
		if err != nil {
			return nil, errors.New("invalid visit_date format, expected YYYY-MM-DD or YYYY-MM-DD HH:mm")
		}
		// Normalize to date only (remove time component)
		visitDate = time.Date(visitDate.Year(), visitDate.Month(), visitDate.Day(), 0, 0, 0, 0, visitDate.Location())
		vr.VisitDate = visitDate
	}

	if req.Purpose != "" {
		vr.Purpose = req.Purpose
	}

	if req.Notes != "" {
		vr.Notes = req.Notes
	}

	if req.CheckInLocation != nil {
		locationBytes, err := json.Marshal(req.CheckInLocation)
		if err != nil {
			return nil, err
		}
		vr.CheckInLocation = locationBytes
	}

	if req.CheckOutLocation != nil {
		locationBytes, err := json.Marshal(req.CheckOutLocation)
		if err != nil {
			return nil, err
		}
		vr.CheckOutLocation = locationBytes
	}

	if req.Photos != nil {
		photosBytes, err := json.Marshal(req.Photos)
		if err != nil {
			return nil, err
		}
		vr.Photos = photosBytes
	}

	// Update status if provided (only allow draft -> submitted transition)
	if req.Status != "" {
		if req.Status == "submitted" && vr.Status == "draft" {
			vr.Status = "submitted"
		} else if req.Status == "draft" && vr.Status == "submitted" {
			// Allow reverting from submitted to draft
			vr.Status = "draft"
		} else if req.Status != vr.Status {
			return nil, errors.New("invalid status transition")
		}
	}

	if err := s.visitReportRepo.Update(vr); err != nil {
		return nil, err
	}

	// Reload
	updatedVR, err := s.visitReportRepo.FindByID(vr.ID)
	if err != nil {
		return nil, err
	}

	response := *updatedVR.ToVisitReportResponse()
	if updatedVR.Photos != nil {
		var photos []string
		if err := json.Unmarshal(updatedVR.Photos, &photos); err == nil {
			response.Photos = photos
		}
	}
	// Parse check-in location JSON
	if updatedVR.CheckInLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(updatedVR.CheckInLocation, &location); err == nil {
			response.CheckInLocation = &location
		}
	}
	// Parse check-out location JSON
	if updatedVR.CheckOutLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(updatedVR.CheckOutLocation, &location); err == nil {
			response.CheckOutLocation = &location
		}
	}
	// Load relations
	s.loadRelations(&response, updatedVR)

	return &response, nil
}

// Delete deletes a visit report
func (s *Service) Delete(id string) error {
	_, err := s.visitReportRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrVisitReportNotFound
		}
		return err
	}

	return s.visitReportRepo.Delete(id)
}

// CheckIn performs check-in for a visit report
func (s *Service) CheckIn(id string, req *visit_report.CheckInRequest, userID string) (*visit_report.VisitReportResponse, error) {
	vr, err := s.visitReportRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrVisitReportNotFound
		}
		return nil, err
	}

	if vr.CheckInTime != nil {
		return nil, errors.New("already checked in")
	}

	now := time.Now()
	vr.CheckInTime = &now
	
	// Marshal check-in location to JSON
	if req.Location != nil {
		locationBytes, err := json.Marshal(req.Location)
		if err != nil {
			return nil, err
		}
		vr.CheckInLocation = locationBytes
	}

	// Update status to submitted if it was draft
	if vr.Status == "draft" {
		vr.Status = "submitted"
	}

	if err := s.visitReportRepo.Update(vr); err != nil {
		return nil, err
	}

	// Create activity
	s.createActivity(vr, "visit", "Checked in to visit")

	// Reload
	updatedVR, err := s.visitReportRepo.FindByID(vr.ID)
	if err != nil {
		return nil, err
	}

	response := *updatedVR.ToVisitReportResponse()
	if updatedVR.Photos != nil {
		var photos []string
		if err := json.Unmarshal(updatedVR.Photos, &photos); err == nil {
			response.Photos = photos
		}
	}
	// Parse check-in location JSON
	if updatedVR.CheckInLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(updatedVR.CheckInLocation, &location); err == nil {
			response.CheckInLocation = &location
		}
	}
	// Parse check-out location JSON
	if updatedVR.CheckOutLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(updatedVR.CheckOutLocation, &location); err == nil {
			response.CheckOutLocation = &location
		}
	}

	return &response, nil
}

// CheckOut performs check-out for a visit report
func (s *Service) CheckOut(id string, req *visit_report.CheckOutRequest, userID string) (*visit_report.VisitReportResponse, error) {
	vr, err := s.visitReportRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrVisitReportNotFound
		}
		return nil, err
	}

	if vr.CheckInTime == nil {
		return nil, errors.New("must check in first")
	}

	if vr.CheckOutTime != nil {
		return nil, errors.New("already checked out")
	}

	now := time.Now()
	vr.CheckOutTime = &now
	
	// Marshal check-out location to JSON
	if req.Location != nil {
		locationBytes, err := json.Marshal(req.Location)
		if err != nil {
			return nil, err
		}
		vr.CheckOutLocation = locationBytes
	}

	// Update status to submitted if it was draft
	if vr.Status == "draft" {
		vr.Status = "submitted"
	}

	if err := s.visitReportRepo.Update(vr); err != nil {
		return nil, err
	}

	// Create activity
	s.createActivity(vr, "visit", "Checked out from visit")

	// Reload
	updatedVR, err := s.visitReportRepo.FindByID(vr.ID)
	if err != nil {
		return nil, err
	}

	response := *updatedVR.ToVisitReportResponse()
	if updatedVR.Photos != nil {
		var photos []string
		if err := json.Unmarshal(updatedVR.Photos, &photos); err == nil {
			response.Photos = photos
		}
	}
	// Parse check-in location JSON
	if updatedVR.CheckInLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(updatedVR.CheckInLocation, &location); err == nil {
			response.CheckInLocation = &location
		}
	}
	// Parse check-out location JSON
	if updatedVR.CheckOutLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(updatedVR.CheckOutLocation, &location); err == nil {
			response.CheckOutLocation = &location
		}
	}
	// Load relations
	s.loadRelations(&response, updatedVR)

	return &response, nil
}

// Approve approves a visit report
func (s *Service) Approve(id string, userID string) (*visit_report.VisitReportResponse, error) {
	vr, err := s.visitReportRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrVisitReportNotFound
		}
		return nil, err
	}

	if vr.Status != "submitted" {
		return nil, ErrInvalidStatus
	}

	now := time.Now()
	vr.Status = "approved"
	vr.ApprovedBy = &userID
	vr.ApprovedAt = &now

	if err := s.visitReportRepo.Update(vr); err != nil {
		return nil, err
	}

	// Create activity
	s.createActivity(vr, "visit", "Visit report approved")

	// Reload
	updatedVR, err := s.visitReportRepo.FindByID(vr.ID)
	if err != nil {
		return nil, err
	}

	response := *updatedVR.ToVisitReportResponse()
	if updatedVR.Photos != nil {
		var photos []string
		if err := json.Unmarshal(updatedVR.Photos, &photos); err == nil {
			response.Photos = photos
		}
	}
	// Parse check-in location JSON
	if updatedVR.CheckInLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(updatedVR.CheckInLocation, &location); err == nil {
			response.CheckInLocation = &location
		}
	}
	// Parse check-out location JSON
	if updatedVR.CheckOutLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(updatedVR.CheckOutLocation, &location); err == nil {
			response.CheckOutLocation = &location
		}
	}
	// Load relations
	s.loadRelations(&response, updatedVR)

	return &response, nil
}

// Reject rejects a visit report
func (s *Service) Reject(id string, req *visit_report.RejectRequest, userID string) (*visit_report.VisitReportResponse, error) {
	vr, err := s.visitReportRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrVisitReportNotFound
		}
		return nil, err
	}

	if vr.Status != "submitted" {
		return nil, ErrInvalidStatus
	}

	vr.Status = "rejected"
	vr.RejectionReason = &req.Reason

	if err := s.visitReportRepo.Update(vr); err != nil {
		return nil, err
	}

	// Create activity
	s.createActivity(vr, "visit", "Visit report rejected: "+req.Reason)

	// Reload
	updatedVR, err := s.visitReportRepo.FindByID(vr.ID)
	if err != nil {
		return nil, err
	}

	response := *updatedVR.ToVisitReportResponse()
	if updatedVR.Photos != nil {
		var photos []string
		if err := json.Unmarshal(updatedVR.Photos, &photos); err == nil {
			response.Photos = photos
		}
	}
	// Parse check-in location JSON
	if updatedVR.CheckInLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(updatedVR.CheckInLocation, &location); err == nil {
			response.CheckInLocation = &location
		}
	}
	// Parse check-out location JSON
	if updatedVR.CheckOutLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(updatedVR.CheckOutLocation, &location); err == nil {
			response.CheckOutLocation = &location
		}
	}
	// Load relations
	s.loadRelations(&response, updatedVR)

	return &response, nil
}

// UploadPhoto adds a photo to a visit report
func (s *Service) UploadPhoto(id string, req *visit_report.UploadPhotoRequest) (*visit_report.VisitReportResponse, error) {
	vr, err := s.visitReportRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrVisitReportNotFound
		}
		return nil, err
	}

	// Get existing photos
	var photos []string
	if vr.Photos != nil {
		if err := json.Unmarshal(vr.Photos, &photos); err != nil {
			photos = []string{}
		}
	}

	// Add new photo
	photos = append(photos, req.PhotoURL)

	// Marshal back to JSON
	photosBytes, err := json.Marshal(photos)
	if err != nil {
		return nil, err
	}
	vr.Photos = photosBytes

	if err := s.visitReportRepo.Update(vr); err != nil {
		return nil, err
	}

	// Reload
	updatedVR, err := s.visitReportRepo.FindByID(vr.ID)
	if err != nil {
		return nil, err
	}

	response := *updatedVR.ToVisitReportResponse()
	if updatedVR.Photos != nil {
		var photos []string
		if err := json.Unmarshal(updatedVR.Photos, &photos); err == nil {
			response.Photos = photos
		}
	}
	// Parse check-in location JSON
	if updatedVR.CheckInLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(updatedVR.CheckInLocation, &location); err == nil {
			response.CheckInLocation = &location
		}
	}
	// Parse check-out location JSON
	if updatedVR.CheckOutLocation != nil {
		var location visit_report.Location
		if err := json.Unmarshal(updatedVR.CheckOutLocation, &location); err == nil {
			response.CheckOutLocation = &location
		}
	}
	// Load relations
	s.loadRelations(&response, updatedVR)

	return &response, nil
}

// GetMyVisitReports returns visit reports for the logged-in user (sales rep)
func (s *Service) GetMyVisitReports(userID string, req *visit_report.ListVisitReportsRequest) ([]visit_report.VisitReportResponse, *PaginationResult, error) {
	// Override SalesRepID filter to only show visit reports for the user
	req.SalesRepID = userID
	
	return s.List(req)
}

// createActivity creates an activity record for a visit report
func (s *Service) createActivity(vr *visit_report.VisitReport, activityType, description string) {
	if s.activityRepo == nil {
		return // Skip if activity repo not available
	}

	activity := &activity.Activity{
		Type:        activityType,
		AccountID:   vr.AccountID, // Already *string, can be nil
		ContactID:   vr.ContactID,
		DealID:      vr.DealID,
		LeadID:      vr.LeadID,
		UserID:      vr.SalesRepID,
		Description: description,
		Timestamp:   time.Now(),
	}

	// Add metadata with visit report ID
	metadata := map[string]interface{}{
		"visit_report_id": vr.ID,
		"visit_date":      vr.VisitDate.Format("2006-01-02"),
	}
	if metadataBytes, err := json.Marshal(metadata); err == nil {
		activity.Metadata = datatypes.JSON(metadataBytes)
	}

	_ = s.activityRepo.Create(activity) // Ignore error for now
}


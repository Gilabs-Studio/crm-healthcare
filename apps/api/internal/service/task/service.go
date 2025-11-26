package task

import (
	"errors"
	"time"

	"github.com/gilabs/crm-healthcare/api/internal/domain/reminder"
	"github.com/gilabs/crm-healthcare/api/internal/domain/task"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

var (
	ErrTaskNotFound     = errors.New("task not found")
	ErrUserNotFound     = errors.New("user not found")
	ErrAccountNotFound  = errors.New("account not found")
	ErrContactNotFound  = errors.New("contact not found")
	ErrDealNotFound     = errors.New("deal not found")
	ErrReminderNotFound = errors.New("reminder not found")
	ErrTaskAlreadyCompleted = errors.New("task already completed")
)

type Service struct {
	taskRepo     interfaces.TaskRepository
	reminderRepo interfaces.ReminderRepository
	userRepo     interfaces.UserRepository
	accountRepo  interfaces.AccountRepository
	contactRepo  interfaces.ContactRepository
	dealRepo     interfaces.DealRepository
}

func NewService(
	taskRepo interfaces.TaskRepository,
	reminderRepo interfaces.ReminderRepository,
	userRepo interfaces.UserRepository,
	accountRepo interfaces.AccountRepository,
	contactRepo interfaces.ContactRepository,
	dealRepo interfaces.DealRepository,
) *Service {
	return &Service{
		taskRepo:     taskRepo,
		reminderRepo: reminderRepo,
		userRepo:     userRepo,
		accountRepo:  accountRepo,
		contactRepo:  contactRepo,
		dealRepo:     dealRepo,
	}
}

// ListTasks returns a list of tasks with pagination
func (s *Service) ListTasks(req *task.ListTasksRequest) ([]task.TaskResponse, *PaginationResult, error) {
	tasks, total, err := s.taskRepo.List(req)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]task.TaskResponse, len(tasks))
	for i, t := range tasks {
		responses[i] = *t.ToTaskResponse()
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

// GetTaskByID returns a task by ID
func (s *Service) GetTaskByID(id string) (*task.TaskResponse, error) {
	t, err := s.taskRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTaskNotFound
		}
		return nil, err
	}

	return t.ToTaskResponse(), nil
}

// CreateTask creates a new task
func (s *Service) CreateTask(req *task.CreateTaskRequest, createdBy string) (*task.TaskResponse, error) {
	// Validate assigned user if provided
	if req.AssignedTo != "" {
		_, err := s.userRepo.FindByID(req.AssignedTo)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrUserNotFound
			}
			return nil, err
		}
	}

	// Validate account if provided
	if req.AccountID != "" {
		_, err := s.accountRepo.FindByID(req.AccountID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrAccountNotFound
			}
			return nil, err
		}
	}

	// Validate contact if provided
	if req.ContactID != "" {
		_, err := s.contactRepo.FindByID(req.ContactID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrContactNotFound
			}
			return nil, err
		}
	}

	// Validate deal if provided
	if req.DealID != "" {
		_, err := s.dealRepo.FindByID(req.DealID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrDealNotFound
			}
			return nil, err
		}
	}

	// Set defaults
	taskType := req.Type
	if taskType == "" {
		taskType = "general"
	}

	priority := req.Priority
	if priority == "" {
		priority = "medium"
	}

	t := &task.Task{
		Title:       req.Title,
		Description: req.Description,
		Type:        taskType,
		Status:      "pending",
		Priority:    priority,
		DueDate:     req.DueDate,
		AssignedTo:  req.AssignedTo,
		AccountID:   req.AccountID,
		ContactID:   req.ContactID,
		DealID:      req.DealID,
		CreatedBy:   createdBy,
	}

	if err := s.taskRepo.Create(t); err != nil {
		return nil, err
	}

	// Reload to get relations
	t, err := s.taskRepo.FindByID(t.ID)
	if err != nil {
		return nil, err
	}

	return t.ToTaskResponse(), nil
}

// UpdateTask updates a task
func (s *Service) UpdateTask(id string, req *task.UpdateTaskRequest) (*task.TaskResponse, error) {
	t, err := s.taskRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTaskNotFound
		}
		return nil, err
	}

	// Update fields if provided
	if req.Title != "" {
		t.Title = req.Title
	}
	if req.Description != "" {
		t.Description = req.Description
	}
	if req.Type != "" {
		t.Type = req.Type
	}
	if req.Status != "" {
		t.Status = req.Status
		// Set completed_at if status is completed
		if req.Status == "completed" && t.CompletedAt == nil {
			now := time.Now()
			t.CompletedAt = &now
		} else if req.Status != "completed" {
			t.CompletedAt = nil
		}
	}
	if req.Priority != "" {
		t.Priority = req.Priority
	}
	if req.DueDate != nil {
		t.DueDate = req.DueDate
	}
	if req.AssignedTo != "" {
		// Validate user exists
		_, err := s.userRepo.FindByID(req.AssignedTo)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrUserNotFound
			}
			return nil, err
		}
		t.AssignedTo = req.AssignedTo
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
		t.AccountID = req.AccountID
	}
	if req.ContactID != "" {
		// Validate contact exists
		_, err := s.contactRepo.FindByID(req.ContactID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrContactNotFound
			}
			return nil, err
		}
		t.ContactID = req.ContactID
	}
	if req.DealID != "" {
		// Validate deal exists
		_, err := s.dealRepo.FindByID(req.DealID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrDealNotFound
			}
			return nil, err
		}
		t.DealID = req.DealID
	}

	if err := s.taskRepo.Update(t); err != nil {
		return nil, err
	}

	// Reload to get relations
	t, err = s.taskRepo.FindByID(t.ID)
	if err != nil {
		return nil, err
	}

	return t.ToTaskResponse(), nil
}

// DeleteTask deletes a task
func (s *Service) DeleteTask(id string) error {
	_, err := s.taskRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrTaskNotFound
		}
		return err
	}

	return s.taskRepo.Delete(id)
}

// AssignTask assigns a task to a user
func (s *Service) AssignTask(id string, req *task.AssignTaskRequest) (*task.TaskResponse, error) {
	t, err := s.taskRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTaskNotFound
		}
		return nil, err
	}

	// Validate user exists
	_, err = s.userRepo.FindByID(req.AssignedTo)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	t.AssignedTo = req.AssignedTo

	if err := s.taskRepo.Update(t); err != nil {
		return nil, err
	}

	// Reload to get relations
	t, err = s.taskRepo.FindByID(t.ID)
	if err != nil {
		return nil, err
	}

	return t.ToTaskResponse(), nil
}

// CompleteTask marks a task as completed
func (s *Service) CompleteTask(id string) (*task.TaskResponse, error) {
	t, err := s.taskRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTaskNotFound
		}
		return nil, err
	}

	if t.Status == "completed" {
		return nil, ErrTaskAlreadyCompleted
	}

	t.Status = "completed"
	now := time.Now()
	t.CompletedAt = &now

	if err := s.taskRepo.Update(t); err != nil {
		return nil, err
	}

	// Reload to get relations
	t, err = s.taskRepo.FindByID(t.ID)
	if err != nil {
		return nil, err
	}

	return t.ToTaskResponse(), nil
}

// ListReminders returns a list of reminders with pagination
func (s *Service) ListReminders(req *reminder.ListRemindersRequest) ([]reminder.ReminderResponse, *PaginationResult, error) {
	reminders, total, err := s.reminderRepo.List(req)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]reminder.ReminderResponse, len(reminders))
	for i, rem := range reminders {
		responses[i] = *rem.ToReminderResponse()
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

// GetReminderByID returns a reminder by ID
func (s *Service) GetReminderByID(id string) (*reminder.ReminderResponse, error) {
	rem, err := s.reminderRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReminderNotFound
		}
		return nil, err
	}

	return rem.ToReminderResponse(), nil
}

// CreateReminder creates a new reminder
func (s *Service) CreateReminder(req *reminder.CreateReminderRequest, createdBy string) (*reminder.ReminderResponse, error) {
	// Validate task exists
	_, err := s.taskRepo.FindByID(req.TaskID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTaskNotFound
		}
		return nil, err
	}

	reminderType := req.ReminderType
	if reminderType == "" {
		reminderType = "in_app"
	}

	rem := &reminder.Reminder{
		TaskID:      req.TaskID,
		RemindAt:    req.RemindAt,
		ReminderType: reminderType,
		Message:     req.Message,
		CreatedBy:   createdBy,
	}

	if err := s.reminderRepo.Create(rem); err != nil {
		return nil, err
	}

	// Reload to get relations
	rem, err = s.reminderRepo.FindByID(rem.ID)
	if err != nil {
		return nil, err
	}

	return rem.ToReminderResponse(), nil
}

// UpdateReminder updates a reminder
func (s *Service) UpdateReminder(id string, req *reminder.UpdateReminderRequest) (*reminder.ReminderResponse, error) {
	rem, err := s.reminderRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReminderNotFound
		}
		return nil, err
	}

	if req.RemindAt != nil {
		rem.RemindAt = *req.RemindAt
	}
	if req.ReminderType != "" {
		rem.ReminderType = req.ReminderType
	}
	if req.Message != "" {
		rem.Message = req.Message
	}

	if err := s.reminderRepo.Update(rem); err != nil {
		return nil, err
	}

	// Reload to get relations
	rem, err = s.reminderRepo.FindByID(rem.ID)
	if err != nil {
		return nil, err
	}

	return rem.ToReminderResponse(), nil
}

// DeleteReminder deletes a reminder
func (s *Service) DeleteReminder(id string) error {
	_, err := s.reminderRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrReminderNotFound
		}
		return err
	}

	return s.reminderRepo.Delete(id)
}

// PaginationResult represents pagination information
type PaginationResult struct {
	Page       int
	PerPage    int
	Total      int
	TotalPages int
}




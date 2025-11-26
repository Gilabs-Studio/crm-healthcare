package task

import (
	"strings"

	"github.com/gilabs/crm-healthcare/api/internal/domain/task"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new task repository
func NewRepository(db *gorm.DB) interfaces.TaskRepository {
	return &repository{db: db}
}

func (r *repository) FindByID(id string) (*task.Task, error) {
	var t task.Task
	err := r.db.
		Preload("AssignedUser").
		Preload("Account").
		Preload("Contact").
		Preload("Deal").
		Where("id = ?", id).
		First(&t).Error
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *repository) List(req *task.ListTasksRequest) ([]task.Task, int64, error) {
	var tasks []task.Task
	var total int64

	query := r.db.Model(&task.Task{})

	// Apply filters
	if req.Search != "" {
		search := "%" + strings.ToLower(req.Search) + "%"
		query = query.Where(
			"LOWER(title) LIKE ? OR LOWER(description) LIKE ?",
			search, search,
		)
	}

	if req.Status != "" {
		query = query.Where("status = ?", req.Status)
	}

	if req.Priority != "" {
		query = query.Where("priority = ?", req.Priority)
	}

	if req.Type != "" {
		query = query.Where("type = ?", req.Type)
	}

	if req.AssignedTo != "" {
		query = query.Where("assigned_to = ?", req.AssignedTo)
	}

	if req.AccountID != "" {
		query = query.Where("account_id = ?", req.AccountID)
	}

	if req.ContactID != "" {
		query = query.Where("contact_id = ?", req.ContactID)
	}

	if req.DealID != "" {
		query = query.Where("deal_id = ?", req.DealID)
	}

	if req.DueDateFrom != nil {
		query = query.Where("due_date >= ?", *req.DueDateFrom)
	}

	if req.DueDateTo != nil {
		query = query.Where("due_date <= ?", *req.DueDateTo)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
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

	offset := (page - 1) * perPage

	// Fetch data with preload
	err := query.
		Preload("AssignedUser").
		Preload("Account").
		Preload("Contact").
		Preload("Deal").
		Order("created_at DESC").
		Offset(offset).
		Limit(perPage).
		Find(&tasks).Error
	if err != nil {
		return nil, 0, err
	}

	return tasks, total, nil
}

func (r *repository) Create(t *task.Task) error {
	return r.db.Create(t).Error
}

func (r *repository) Update(t *task.Task) error {
	// Clear relations to avoid updating them
	t.AssignedUser = nil
	t.Account = nil
	t.Contact = nil
	t.Deal = nil

	return r.db.Model(t).Omit("AssignedUser", "Account", "Contact", "Deal").Updates(t).Error
}

func (r *repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&task.Task{}).Error
}


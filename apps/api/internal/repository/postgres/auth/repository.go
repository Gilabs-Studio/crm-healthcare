package auth

import (
	"github.com/gilabs/crm-healthcare/api/internal/domain/auth"
	"github.com/gilabs/crm-healthcare/api/internal/repository/interfaces"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new auth repository
func NewRepository(db *gorm.DB) interfaces.AuthRepository {
	return &repository{db: db}
}

func (r *repository) FindByEmail(email string) (*auth.User, error) {
	var user auth.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *repository) FindByID(id string) (*auth.User, error) {
	var user auth.User
	err := r.db.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *repository) Create(user *auth.User) error {
	return r.db.Create(user).Error
}

func (r *repository) Update(user *auth.User) error {
	return r.db.Save(user).Error
}


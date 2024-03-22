package repository

import (
	"user-microservice/pkg/model"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (repo *UserRepository) Create(user *model.User) error {
	return repo.db.Create(user).Error
}

func (repo *UserRepository) GetByID(id uint) (*model.User, error) {
	var user model.User
	result := repo.db.First(&user, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

func (repo *UserRepository) GetByEmail(email string) (*model.User, error) {
	var user model.User
	result := repo.db.Where("email = ?", email).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

func (repo *UserRepository) Update(user UserRepository) error {
	return repo.db.Save(user).Error
}

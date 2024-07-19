package repository

import (
	"errors"
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

func (repo *UserRepository) EmailExists(email string) (bool, error) {
	var count int64
	result := repo.db.Model(&model.User{}).Where("email = ?", email).Count(&count)
	if result.Error != nil {
		return false, result.Error
	}

	return count > 0, nil
}

func (repo *UserRepository) UsernameExists(username string) (bool, error) {
	var count int64
	result := repo.db.Model(&model.User{}).Where("username = ?", username).Count(&count)
	if result.Error != nil {
		return false, result.Error
	}

	return count > 0, nil
}

func (repo *UserRepository) GetByEmail(email string) (*model.User, error) {
	var user model.User
	result := repo.db.Where("email = ?", email).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

func (repo *UserRepository) GetByUsername(username string) (*model.User, error) {
	var user model.User
	result := repo.db.Where("username = ?", username).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

func (repo *UserRepository) Update(user *model.User) (*model.User, error) {
	return user, repo.db.Save(user).Error
}

func (repo *UserRepository) ListAllUsers() ([]*model.User, error) {
	var users []*model.User
	result := repo.db.Find(&users)
	if result.Error != nil {
		return nil, result.Error
	}
	return users, nil
}

func (repo *UserRepository) SearchUsersByUsername(pattern string) ([]*model.User, error) {
	var users []*model.User

	result := repo.db.Where("username LIKE ?", "%"+pattern+"%").Find(&users)

	if result.Error != nil {
		return nil, result.Error
	}

	return users, nil
}

func (repo *UserRepository) DeleteUserByID(userID uint) error {
	result := repo.db.Delete(&model.User{}, userID)
	if result.RowsAffected == 0 {
		return errors.New("no user found with given ID")
	}
	return result.Error
}

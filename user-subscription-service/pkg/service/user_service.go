package service

import (
	"errors"
	"user-microservice/pkg/model"
	"user-microservice/pkg/repository"
)

type UserService struct {
	userRepository *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{
		userRepository: repo,
	}
}

func (s *UserService) CreateUser(user *model.User, password string) error {
	err := user.SetPassword(password)

	if err != nil {
		return err
	}

	return s.userRepository.Create(user)
}

func (s *UserService) AuthUser(email, password string) (*model.User, error) {
	user, err := s.userRepository.GetByEmail(email)
	if err != nil {
		return nil, err
	}

	if !user.ComparePassword(password) {
		return nil, errors.New("invalid credentials")
	}
	return user, nil
}

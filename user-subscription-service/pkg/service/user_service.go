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

func (s *UserService) CreateUser(user *model.User, password string) (*model.User, error) {
	err := user.SetPassword(password)

	if err != nil {
		return nil, err
	}

	emailExists, err := s.userRepository.EmailExists(user.Email)
	if err != nil {
		return nil, err
	}

	if emailExists {
		return nil, errors.New("email in use")
	}

	usernameExists, err := s.userRepository.UsernameExists(user.Name)

	if err != nil {
		return nil, err
	}

	if usernameExists {
		return nil, errors.New("username in use")
	}

	return user, s.userRepository.Create(user)
}

func (s *UserService) AuthUser(username, password string) (*model.User, error) {
	user, err := s.userRepository.GetByUsername(username)
	if err != nil {
		return nil, err
	}

	if !user.ComparePassword(password) {
		return nil, errors.New("invalid credentials")
	}
	return user, nil
}

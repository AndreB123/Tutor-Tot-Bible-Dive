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

	usernameExists, err := s.userRepository.UsernameExists(user.Username)

	if err != nil {
		return nil, err
	}

	if usernameExists {
		return nil, errors.New("username in use")
	}

	return user, s.userRepository.Create(user)
}

func (s *UserService) GetUserByID(userID uint) (*model.User, error) {
	user, err := s.userRepository.GetByID(userID)
	if err != nil {
		return nil, err
	}
	return user, nil
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

func (s *UserService) UpdateUser(userID uint, username, email string) (*model.User, error) {
	updatedUser := model.User{
		Username: username,
		Email:    email,
	}

	user, err := s.userRepository.Update(&updatedUser)
	if err != nil {
		return nil, err
	}

	return user, nil
}

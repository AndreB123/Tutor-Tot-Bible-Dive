package service

import (
	"errors"
	"fmt"
	"strings"
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

func (s *UserService) UpdatePassword(userID uint, password string) error {
	user, err := s.GetUserByID(userID)
	if err != nil {
		fmt.Printf("Error getting user by id: %v", err)
		return err
	}
	err = user.SetPassword(password)
	if err != nil {
		fmt.Printf("Error setting new password: %v", err)
		return err
	}
	return nil
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

func (s *UserService) ListAllUsers() ([]*model.User, error) {
	users, err := s.userRepository.ListAllUsers()
	if err != nil {
		return nil, err
	}

	return users, nil
}

func (s *UserService) SearchUsersByUsername(pattern string) ([]*model.User, error) {
	trimmedPattern := strings.TrimSpace(pattern)

	if len(trimmedPattern) > 100 {
		trimmedPattern = trimmedPattern[:100]
	}

	sanitizedPattern := strings.ReplaceAll(trimmedPattern, "%", "\\%")
	sanitizedPattern = strings.ReplaceAll(sanitizedPattern, "_", "\\_")

	users, err := s.userRepository.SearchUsersByUsername(sanitizedPattern)
	if err != nil {
		return nil, err
	}
	return users, nil
}

func (s *UserService) DeleteUser(userID uint, password string) error {
	if userID == 0 {
		return errors.New("invalid user ID")
	}

	ok, err := s.VerifyUserPassword(userID, password)
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("invalid password")
	}

	err = s.userRepository.DeleteUserByID(userID)
	if err != nil {
		return err
	}
	return nil
}

func (s *UserService) VerifyUserPassword(userID uint, password string) (bool, error) {
	if userID == 0 {
		return false, errors.New("invalid user ID")
	}

	user, err := s.GetUserByID(userID)
	if err != nil {
		return false, err
	}

	return user.ComparePassword(password), nil
}

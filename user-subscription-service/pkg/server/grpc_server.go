package server

import (
	"log"
	"user-microservice/pkg/proto"
	"user-microservice/pkg/service"
)

type UserServer struct {
	userService *service.UserService
	authService *service.AuthService
	proto.UnimplementedUserServiceServer
}

func NewUserServer(userServer *service.UserService, authService *service.AuthService) *UserServer {
	return &UserServer{
		userService: userServer,
		authService: authService,
	}
}

func (s *UserServer) GetUserInfo(req *proto.GetUserInfoRequest) (*proto.GetUserInfoResponse, error) {
	userID := uint(req.GetId())

	user, err := s.userService.GetUserByID(userID)
	if err != nil {
		log.Printf("Failed to find user with id: %v, %v", userID, err)
	}

	resp := &proto.GetUserInfoResponse{
		User: &proto.User{
			Id:       uint32(user.ID),
			Username: user.Username,
			Email:    user.Email,
		},
	}
	return resp, nil
}

func (s *UserServer) UpdateUserInfo(req *proto.UpdateUserInfoRequest) (*proto.UpdateUserInfoResponse, error) {
	userID := uint(req.GetId())
	username := req.GetUsername()
	email := req.GetEmail()

	user, err := s.userService.UpdateUser(userID, username, email)
	if err != nil {
		log.Printf("Failed to update user: %v", err)
	}

	resp := &proto.UpdateUserInfoResponse{
		User: &proto.User{
			Id:       uint32(user.ID),
			Username: user.Username,
			Email:    user.Email,
		},
	}
	return resp, nil
}

//func (s *UserServer) ListUsers(req *proto.ListUsersRequest) (*proto.ListUsersResponse, error) {
//	return
//}

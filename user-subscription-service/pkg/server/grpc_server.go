package server

import (
	"context"
	"log"
	"user-microservice/pkg/proto"
	"user-microservice/pkg/service"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
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

func (s *UserServer) GetUserInfo(ctx context.Context, req *proto.GetUserInfoRequest) (*proto.GetUserInfoResponse, error) {
	userID := uint(req.GetId())
	log.Println("getting user")
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

func (s *UserServer) UpdateUserInfo(ctx context.Context, req *proto.UpdateUserInfoRequest) (*proto.UpdateUserInfoResponse, error) {
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

func (s *UserServer) ListUsers(ctx context.Context, req *proto.ListUsersRequest) (*proto.ListUsersResponse, error) {
	usersList, err := s.userService.ListAllUsers()
	if err != nil {
		log.Printf("Unable to print all users: %v", err)
	}

	var users []*proto.User
	for _, user := range usersList {
		protoUser := &proto.User{
			Id:       uint32(user.ID),
			Username: user.Username,
			Email:    user.Email,
		}
		users = append(users, protoUser)
	}
	resp := &proto.ListUsersResponse{
		Users: users,
	}

	return resp, nil
}

func (s *UserServer) DeleteUser(ctx context.Context, req *proto.DeleteUserRequest) (*proto.DeleteUserResponse, error) {
	userID := uint(req.GetId())
	err := s.userService.DeleteUser(userID)
	if err != nil {
		log.Printf("Failed to delete user: %v", err)
		return &proto.DeleteUserResponse{
			Success: false,
		}, status.Error(codes.Internal, "failed to delete user")
	}
	return &proto.DeleteUserResponse{
		Success: true,
	}, nil
}

func (s *UserServer) SearchUsersByUsername(ctx context.Context, req *proto.SearchForUserRequest) (*proto.SearchForUsersResponse, error) {
	username := req.GetUsername()
	usersList, err := s.userService.SearchUsersByUsername(username)
	if err != nil {
		log.Printf("unable to return users: %v", err)
	}
	var users []*proto.User
	for _, user := range usersList {
		protoUser := &proto.User{
			Id:       uint32(user.ID),
			Username: user.Username,
			Email:    user.Email,
		}
		users = append(users, protoUser)
	}
	resp := &proto.SearchForUsersResponse{
		Users: users,
	}
	return resp, nil
}

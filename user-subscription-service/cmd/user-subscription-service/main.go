package main

import (
	"log"
	"net"
	"user-microservice/pkg/api"
	"user-microservice/pkg/config"
	"user-microservice/pkg/interceptors"
	"user-microservice/pkg/model"
	"user-microservice/pkg/proto"
	"user-microservice/pkg/repository"
	"user-microservice/pkg/server"
	"user-microservice/pkg/service"

	"google.golang.org/grpc"
)

func main() {
	//Load Config
	cfg := config.LoadConfig()

	//Setup db connection
	db, err := repository.NewDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to db: %v", err)
	}
	lis, err := net.Listen("tcp", ":8080")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer(grpc.UnaryInterceptor(interceptors.NewUnaryInterceptor(cfg.AccessSecret)), grpc.StreamInterceptor(interceptors.NewStreamInterceptor(cfg.AccessSecret)))

	//init repos, services and handlers
	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	authService := service.NewAuthService(cfg)
	handler := api.NewHandler(userService, authService)

	router := api.SetupRouter(handler)
	userServer := server.NewUserServer(userService, authService)

	proto.RegisterUserServiceServer(grpcServer, userServer)

	//migrate db
	if err := db.AutoMigrate(&model.User{}); err != nil {
		log.Fatalf("failed to auto-migrate: %v", err)
	}

	router.Run()

	log.Println("gRPC server is listening on ", lis.Addr())
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}

}

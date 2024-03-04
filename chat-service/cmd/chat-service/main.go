package main

import (
	"chat-service/pkg/config"
	"chat-service/pkg/interceptors"
	"chat-service/pkg/model"
	"chat-service/pkg/proto"
	"chat-service/pkg/repository"
	"chat-service/pkg/server"
	"chat-service/pkg/service"
	"log"
	"net"

	"google.golang.org/grpc"
)

func main() {
	cfg := config.LoadConfig()

	db, err := repository.NewDB(cfg)
	if err != nil {
		log.Fatalf("Failed to init db: %v", err)
	}
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer(grpc.UnaryInterceptor(interceptors.NewUnaryInterceptor(cfg.AccessSecret)), grpc.StreamInterceptor(interceptors.NewStreamInterceptor(cfg.AccessSecret)))

	chatRepo := repository.NewChatRepository(db)
	msgRepo := repository.NewMessageRepository(db)

	if err := db.AutoMigrate(&model.Chat{}, &model.Message{}); err != nil {
		log.Fatalf("failed to auto-migrate: %v", err)
	}

	chatService := service.NewChatService(chatRepo, msgRepo)
	msgService := service.NewMessageService(msgRepo, chatRepo)
	openAIService := service.NewOpenAIService(cfg)

	chatServer := server.NewChatServer(chatService, msgService, openAIService)

	proto.RegisterChatServiceServer(grpcServer, chatServer)

	log.Println("gRPC server is listening on ", lis.Addr())
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}

}

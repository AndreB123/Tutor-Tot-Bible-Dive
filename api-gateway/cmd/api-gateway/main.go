package main

import (
	"api-gateway/internal/config"
	"api-gateway/internal/router"
	"api-gateway/pkg/proto"
	"log"
	"net/http"
	"os"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	log.Println("Starting API Gateway on port 443")

	cfg := config.LoadConfig()

	log.Printf("Chat Service URL: %s", cfg.ChatServiceURL)
	chatGrpcConn, err := grpc.Dial(cfg.ChatServiceURL, grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock()) //TODO change to secure connection for prod
	if err != nil {
		log.Fatalf("Was not able to connect to Chat Service: %v", err)
		return
	}
	log.Println("Connected to Chat Service")
	defer chatGrpcConn.Close()

	log.Printf("User Service URL: %s", cfg.UserServiceURL)
	UsergrpcConn, err := grpc.Dial(cfg.UserServiceURL, grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock()) //TODO change to secure connection for prod
	if err != nil {
		log.Fatalf("Was not able to connect User Service: %v", err)
		return
	}
	log.Println("Connected to User Service")
	defer UsergrpcConn.Close()

	log.Printf("Lesson Service URL: %s", cfg.LessonServiceURL)
	LessongrpcConn, err := grpc.Dial(cfg.LessonServiceURL, grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock()) //TODO change to secure connection for prod
	if err != nil {
		log.Fatalf("Was not able to connect Lesson Service: %v", err)
		return
	}
	log.Println("Connected to Lesson Service")
	defer LessongrpcConn.Close()

	chatClient := proto.NewChatServiceClient(chatGrpcConn)
	userClient := proto.NewUserServiceClient(UsergrpcConn)
	lessonClient := proto.NewLessonServiceClient(LessongrpcConn)

	router := router.LoadRouter(cfg, chatClient, userClient, lessonClient)
	log.Println("HTTP router loaded")

	keyPath := "/run/secrets/ssl_key"
	certPath := "/run/secrets/ssl_cert"

	if _, err := os.Stat(certPath); os.IsNotExist(err) {
		log.Fatalf("SSL certificate not found at %s", certPath)
	}
	if _, err := os.Stat(keyPath); os.IsNotExist(err) {
		log.Fatalf("SSL key not found at %s", keyPath)
	}

	log.Println("Starting HTTPS server")
	err = http.ListenAndServeTLS(":443", certPath, keyPath, router)
	if err != nil {
		log.Fatalf("Failed to start HTTPS server: %v", err)
	}

}

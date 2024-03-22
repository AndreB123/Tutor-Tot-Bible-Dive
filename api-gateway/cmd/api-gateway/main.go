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
	grpcConn, err := grpc.Dial(cfg.ChatServiceURL, grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock())
	if err != nil {
		log.Fatalf("Was not able to connect: %v", err)
		return
	}
	log.Println("Connected to Chat Service")
	defer grpcConn.Close()

	chatClient := proto.NewChatServiceClient(grpcConn)

	router := router.LoadRouter(cfg, chatClient)
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

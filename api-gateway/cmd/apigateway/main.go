package main

import (
	"api-gateway/internal/config"
	"api-gateway/internal/router"
	"api-gateway/pkg/proto"
	"log"
	"net/http"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	cfg := config.LoadConfig()
	grpcConn, err := grpc.Dial(cfg.ChatServiceURL, grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock())
	if err != nil {
		log.Fatalf("Was not able to connect: %v", err)
		return
	}
	defer grpcConn.Close()

	chatClient := proto.NewChatServiceClient(grpcConn)

	router := router.LoadRouter(cfg, chatClient)

	//TODO update this to reflect the TLS creds we get from the config.
	//Also update other Microservies to com over securegrpc.Creds(credentials.NewServerTLSFromFile(certFile, keyFile))
	keyPath := "placeholder/key.pem"
	certPath := "placeholder/cert.pem"

	log.Fatal(http.ListenAndServeTLS(":443", certPath, keyPath, router))

}

package handler

import (
	"api-gateway/internal/middleware"
	pb "api-gateway/pkg/proto"
	"context"
	"log"

	"github.com/gorilla/websocket"
	"google.golang.org/protobuf/proto"
)

type LessonHandler struct {
	LessonClient pb.LessonServiceClient
}

func (h *LessonHandler) ProcessMessage(conn *websocket.Conn, msg middleware.WSMessage) {
	// Deserialize the protobuf data into the appropriate request type
	var lessonReq pb.GenerateLessonsRequest
	if err := proto.Unmarshal(msg.Data, &lessonReq); err != nil {
		log.Printf("Failed to unmarshal GenerateLessonsRequest: %v", err)
		return
	}

	// Call the service method
	ctx := context.Background() // JWT metadata can be added here if needed
	resp, err := h.LessonClient.GenerateLessons(ctx, &lessonReq)
	if err != nil {
		log.Printf("Failed to generate lessons: %v", err)
		return
	}

	// Serialize and send the response back via WebSocket
	respData, err := proto.Marshal(resp)
	if err != nil {
		log.Printf("Failed to marshal GenerateLessonsResponse: %v", err)
		return
	}

	middleware.SendWebSocketMessage(conn, respData)
}

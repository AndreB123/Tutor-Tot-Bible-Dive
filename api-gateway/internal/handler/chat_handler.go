package handler

import (
	"api-gateway/internal/config"
	"api-gateway/internal/middleware"
	"api-gateway/pkg/proto"
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

type ChatHandler struct {
	Config     *config.Config
	ChatClient proto.ChatServiceClient
}

func NewChatHandler(cfg *config.Config, chatClient proto.ChatServiceClient) *ChatHandler {
	return &ChatHandler{
		Config:     cfg,
		ChatClient: chatClient,
	}
}

func (h *ChatHandler) ProcessMessage(conn *websocket.Conn, jwt string, data []byte) {

	var msg middleware.WSMessage

	if err := json.Unmarshal(data, &msg.Type); err != nil {
		log.Printf("Error determining message type: %v", err)
		return
	}

	switch msg.Type {
	case "get_chat_summaries":
		h.GetChatSummaries(conn, msg.JWT)

	case "get_recent_messages":
		var getRecentMessages proto.GetRecentMessagesRequest
		if err := json.Unmarshal(msg.Data, &getRecentMessages); err != nil {
			log.Printf("Failed to unmarshal GetRecentMessagesRequst: %v", err)
		}
		h.GetRecentMessages(conn, getRecentMessages.ChatId, getRecentMessages.LastMessageId, getRecentMessages.Limit, msg.JWT)
	case "start_message_stream":
		var createMsgReq proto.CreateMessageRequest
		if err := json.Unmarshal(msg.Data, &createMsgReq); err != nil {
			log.Printf("Failed to unmarshal CreateMessageRequest: %v", err)
			return
		}
		go h.StreamMessages(conn, createMsgReq.ChatId, createMsgReq.Body, createMsgReq.Sender, msg.JWT)
	}

}

func (h *ChatHandler) StreamMessages(conn *websocket.Conn, chatID uint32, body string, sender string, jwt string) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	stream, err := h.ChatClient.StreamMessages(ctxWithMetadata)
	if err != nil {
		log.Printf("Could not start Stream: %v", err)
		return
	}

	req := &proto.CreateMessageRequest{
		ChatId: chatID,
		Body:   body,
		Sender: sender,
	}

	if err := stream.Send(req); err != nil {
		log.Printf("Failed to send a message: %v", err)
		return
	}

	for {
		in, err := stream.Recv()
		if err != nil {
			log.Printf("Error receiving stream: %v", err)
			break
		}

		wsMsg, err := json.Marshal(in)
		if err != nil {
			log.Printf("Error marshaling message to JSON: %v", err)
			continue
		}

		if err := conn.WriteMessage(websocket.TextMessage, wsMsg); err != nil {
			log.Printf("Error sending message over WS connection: %v", err)
			break
		}
	}
}

func (h *ChatHandler) GetChatSummaries(conn *websocket.Conn, jwt string) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.ChatClient.GetChatSummariesUID(ctxWithMetadata, &proto.GetChatSummariesUIDRequest{})
	if err != nil {
		log.Fatalf("Failed to create message")
		return
	}

	summaries, err := json.Marshal(resp)
	if err != nil {
		log.Printf("Error marshaling chat sums to JSON: %v", err)
		return
	}

	if err := conn.WriteMessage(websocket.TextMessage, summaries); err != nil {
		log.Printf("Error sending chat summaries over WS connection: %v", err)
	}
}

func (h *ChatHandler) GetRecentMessages(conn *websocket.Conn, chatID uint32, lastMsgID uint32, limit int32, jwt string) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.ChatClient.GetRecentMessages(ctxWithMetadata, &proto.GetRecentMessagesRequest{ChatId: chatID, LastMessageId: lastMsgID, Limit: limit})
	if err != nil {
		log.Printf("Error getting recent messages: %v", err)
		return
	}

	msgs, err := json.Marshal(resp)
	if err != nil {
		log.Printf("Error marshaling recent messages to JSON: %v", err)
		return
	}

	if err := conn.WriteMessage(websocket.TextMessage, msgs); err != nil {
		log.Printf("Errpr sending recent messages to client: %v", err)
	}
}

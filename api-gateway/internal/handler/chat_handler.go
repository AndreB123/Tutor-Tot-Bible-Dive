package handler

import (
	"api-gateway/internal/config"
	"api-gateway/internal/middleware"
	"api-gateway/pkg/proto"
	"context"
	"encoding/json"
	"io"
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

func (h *ChatHandler) ProcessMessage(conn *websocket.Conn, msg middleware.WSMessage) {
	log.Printf("Raw data: %s", string(msg.Data))

	switch msg.Action {
	case "get_chat_summaries":
		var getChatSummaries proto.GetChatSummariesUIDRequest
		if err := json.Unmarshal(msg.Data, &getChatSummaries); err != nil {
			log.Printf("Failed to unmarshal data from getchatsums: %v", err)
		}
		go h.GetChatSummaries(conn, msg.JWT, getChatSummaries.Id)
	case "get_recent_messages":
		var getRecentMessages proto.GetRecentMessagesRequest
		if err := json.Unmarshal(msg.Data, &getRecentMessages); err != nil {
			log.Printf("Failed to unmarshal GetRecentMessagesRequest: %v", err)
		}
		go h.GetRecentMessages(conn, getRecentMessages.ChatId, getRecentMessages.LastMessageId, getRecentMessages.Limit, msg.JWT)
	case "start_message_stream":
		var createMsgReq proto.CreateMessageRequest
		if err := json.Unmarshal(msg.Data, &createMsgReq); err != nil {
			log.Printf("Failed to unmarshal CreateMessageRequest: %v", err)
			return
		}
		go h.StreamMessages(conn, createMsgReq.ChatId, createMsgReq.Body, createMsgReq.Sender, msg.JWT)
	case "delete_chat_by_chat_id":
		var deleteChatByIDReq proto.DeleteChatByIDRequest
		if err := json.Unmarshal(msg.Data, &deleteChatByIDReq); err != nil {
			log.Printf("Failed to unmarshal DeleteChatByIDRequest: %v", err)
			return
		}
		go h.DeleteChatByID(conn, msg.JWT, deleteChatByIDReq.UserId, deleteChatByIDReq.ChatId)
	case "delete_all_chats_by_user_id":
		var deleteAllChatsByUIDReq proto.DeleteAllChatsByUIDRequest
		if err := json.Unmarshal(msg.Data, &deleteAllChatsByUIDReq); err != nil {
			log.Printf("Failed to unmarshal DeleteAllChatByIIDRequest: %v", err)
			return
		}
		go h.DeleteAllChatsByUID(conn, msg.JWT, deleteAllChatsByUIDReq.UserId)
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
		if err == io.EOF {
			middleware.SendWebSocketMessage(conn, "message_complete", "{}")
			log.Println("Stream completed successfully")
			break
		}
		if err != nil {
			log.Printf("Error receiving stream: %v", err)
			break
		}

		log.Printf("Received message fragment: %v", in)

		middleware.SendWebSocketMessage(conn, "message_fragment", in)
	}
}

func (h *ChatHandler) GetChatSummaries(conn *websocket.Conn, jwt string, id uint32) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.ChatClient.GetChatSummariesUID(ctxWithMetadata, &proto.GetChatSummariesUIDRequest{Id: id})
	if err != nil {
		log.Printf("Failed to create message: %v", err)
		return
	}

	log.Printf("chat sums: %v", resp)
	middleware.SendWebSocketMessage(conn, "get_chat_summaries_resp", resp)
}

func (h *ChatHandler) GetRecentMessages(conn *websocket.Conn, chatID uint32, lastMsgID uint32, limit uint32, jwt string) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.ChatClient.GetRecentMessages(ctxWithMetadata, &proto.GetRecentMessagesRequest{ChatId: chatID, LastMessageId: lastMsgID, Limit: limit})
	if err != nil {
		log.Printf("Error getting recent messages: %v", err)
		return
	}

	log.Printf("Get recent msgs: %v", resp)
	middleware.SendWebSocketMessage(conn, "get_recent_messages_resp", resp)
}

func (h *ChatHandler) DeleteChatByID(conn *websocket.Conn, jwt string, userID, chatID uint32) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.ChatClient.DeleteChatByID(ctxWithMetadata, &proto.DeleteChatByIDRequest{ChatId: chatID, UserId: userID})
	if err != nil {
		log.Printf("Error deleting chats by chatid: %v", err)
		return
	}
	middleware.SendWebSocketMessage(conn, "delete_chat_by_chat_id_resp", resp)
}

func (h *ChatHandler) DeleteAllChatsByUID(conn *websocket.Conn, jwt string, userID uint32) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.ChatClient.DeleteAllChatsByUID(ctxWithMetadata, &proto.DeleteAllChatsByUIDRequest{UserId: userID})
	if err != nil {
		log.Printf("Error deleting chats by UID: %v", err)
		return
	}
	middleware.SendWebSocketMessage(conn, "delete_all_chats_by_user_id_resp", resp)
}

package handler

import (
	"api-gateway/internal/config"
	"api-gateway/internal/middleware"
	"api-gateway/pkg/proto"
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var dataType = "application/json"

type WSMessage struct {
	Type string          `json:"type"`
	JWT  string          `json:"jwt"`
	Data json.RawMessage `json:"data"`
}

type Handler struct {
	Config     *config.Config
	ChatClient proto.ChatServiceClient
}

func NewHandler(cfg *config.Config, chatClient proto.ChatServiceClient) *Handler {
	return &Handler{
		Config:     cfg,
		ChatClient: chatClient,
	}
}

func HandleWebSocketConnection(conn *websocket.Conn, h *Handler) {
	defer conn.Close()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Failed to read message: %v", err)
			break
		}

		var wsMsg WSMessage
		if err := json.Unmarshal(msg, &wsMsg); err != nil {
			log.Printf("Failed to unmarshal message: %v", err)
			continue
		}

		switch wsMsg.Type {
		case "get_chat_summaries":
			h.GetChatSummaries(conn, wsMsg.JWT)

		case "get_recent_messages":
			var getRecentMessages proto.GetRecentMessagesRequest
			if err := json.Unmarshal(wsMsg.Data, &getRecentMessages); err != nil {
				log.Printf("Failed to unmarshal GetRecentMessagesREqust: %v", err)
			}
			h.GetRecentMessages(conn, getRecentMessages.ChatId, getRecentMessages.LastMessageId, getRecentMessages.Limit, wsMsg.JWT)
		case "start_message_stream":
			var createMsgReq proto.CreateMessageRequest
			if err := json.Unmarshal(wsMsg.Data, &createMsgReq); err != nil {
				log.Printf("Failed to unmarshal CreateMessageRequest: %v", err)
				continue
			}
			go h.StreamMessages(conn, createMsgReq.ChatId, createMsgReq.Body, createMsgReq.Sender, wsMsg.JWT)
		}
	}
}

func (h *Handler) StreamMessages(conn *websocket.Conn, chatID uint32, body string, sender string, jwt string) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	stream, err := h.ChatClient.StreamMessages(ctxWithMetadata)
	if err != nil {
		log.Printf("Could not start Strean: %v", err)
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

func (h *Handler) GetChatSummaries(conn *websocket.Conn, jwt string) {
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
		log.Printf("Error marchaling chat sums to JSON: %v", err)
		return
	}

	if err := conn.WriteMessage(websocket.TextMessage, summaries); err != nil {
		log.Printf("Error sending chat summaries over WS connection: %v", err)
	}
}

func (h *Handler) GetRecentMessages(conn *websocket.Conn, chatID uint32, lastMsgID uint32, limit int32, jwt string) {
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

func (h *Handler) Login(ctx *gin.Context) {
	var loginCreds struct {
		Name     string `json:"username"`
		Password string `json:"password"`
	}

	if err := ctx.ShouldBindJSON(&loginCreds); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	credsJSON, err := json.Marshal(loginCreds)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal json in login"})
		return
	}

	resp, err := http.Post(h.Config.UserServiceURL+"/login", dataType, bytes.NewBuffer(credsJSON))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send request to user service"})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response from user service"})
		return
	}

	ctx.Data(resp.StatusCode, dataType, body)
}

func (h *Handler) CreateUser(ctx *gin.Context) {
	var accountInfo struct {
		Email    string `json:"email"`
		UserName string `json:"username"`
		Password string `json:"password"`
	}

	if err := ctx.ShouldBindJSON(&accountInfo); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	actInfoJSON, err := json.Marshal(accountInfo)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal json in create user"})
		return
	}

	resp, err := http.Post(h.Config.UserServiceURL+"/create_user", dataType, bytes.NewBuffer(actInfoJSON))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failled to post to user service"})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Server failed to read response"})
		return
	}

	ctx.Data(resp.StatusCode, dataType, body)
}

func (h *Handler) RefreshToken(ctx *gin.Context) {
	var tokenRequest struct {
		RefreshToken string `json:"refresh_token"`
	}

	if err := ctx.ShouldBindJSON(&tokenRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tokenJSON, err := json.Marshal(tokenRequest)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal json on refresh token"})
		return
	}

	resp, err := http.Post(h.Config.UserServiceURL+"/refresh_token", dataType, bytes.NewBuffer(tokenJSON))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reach user service"})
		return
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read responce from user service"})
		return
	}

	ctx.Data(resp.StatusCode, dataType, body)
}

//helper funcitons

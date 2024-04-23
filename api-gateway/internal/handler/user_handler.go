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

type UserHandler struct {
	Config     *config.Config
	UserClient proto.UserServiceClient
}

func NewUserHandler(cfg *config.Config, userClient proto.UserServiceClient) *UserHandler {
	return &UserHandler{
		Config:     cfg,
		UserClient: userClient,
	}
}

func (h *UserHandler) ProcessMessage(conn *websocket.Conn, jwt string, data []byte) {
	var msg middleware.WSMessage

	if err := json.Unmarshal(data, &msg.Type); err != nil {
		log.Printf("Error determining message type: %v", err)
		return
	}

	switch msg.Type {
	case "get_user_info":
		h.GetUserInfo(conn, jwt)
	case "update_user_info":
		var updateInfo proto.UpdateUserInfoRequest
		if err := json.Unmarshal(msg.Data, &updateInfo); err != nil {
			log.Printf("Failed to unmarshal UpdateUserInfoRequest: %v", err)
		}
		h.UpdateUserInfo(conn, jwt, updateInfo.Username, updateInfo.Email)
	case "search_for_user":
		var search proto.SearchForUserRequest
		if err := json.Unmarshal(msg.Data, &search); err != nil {
			log.Printf("Failed to unmarshal SearchForUserRequest: %v", err)
		}
		h.SearchForUser(conn, jwt, search.Username)
	}
}

func (h *UserHandler) GetUserInfo(conn *websocket.Conn, jwt string) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.UserClient.GetUserInfo(ctxWithMetadata, &proto.GetUserInfoRequest{})
	if err != nil {
		log.Fatalf("failed to create message")
		return
	}

	userInfo, err := json.Marshal(resp)
	if err != nil {
		log.Printf("failed ot marshal the userinfo to JSON: %v", err)
		return
	}

	if err := conn.WriteMessage(websocket.TextMessage, userInfo); err != nil {
		log.Printf("Error sending userinfo over WS connnection: %v", err)
	}
}

func (h *UserHandler) UpdateUserInfo(conn *websocket.Conn, jwt, username, email string) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.UserClient.UpdateUserInfo(ctxWithMetadata, &proto.UpdateUserInfoRequest{Username: username, Email: email})
	if err != nil {
		log.Print("Failed to create UpdateUserMessage")
		return
	}

	userInfo, err := json.Marshal(resp)
	if err != nil {
		log.Printf("failed ot marshal the userinfo to JSON: %v", err)
		return
	}
	if err := conn.WriteMessage(websocket.TextMessage, userInfo); err != nil {
		log.Printf("Error sending userinfo over WS connnection: %v", err)
	}
}

func (h *UserHandler) SearchForUser(conn *websocket.Conn, jwt, username string) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.UserClient.SearchForUser(ctxWithMetadata, &proto.SearchForUserRequest{Username: username})
	if err != nil {
		log.Print("Failed to create UpdateUserMessage")
		return
	}

	userName, err := json.Marshal(resp)
	if err != nil {
		log.Printf("failed ot marshal the username to JSON: %v", err)
		return
	}
	if err := conn.WriteMessage(websocket.TextMessage, userName); err != nil {
		log.Printf("Error sending UserName over WS connnection: %v", err)
	}
}

func (h *UserHandler) Login(ctx *gin.Context) {
	var loginCreds struct {
		Username string `json:"username"`
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

	resp, err := http.Post(h.Config.UserHTTPServiceURL+"/login", dataType, bytes.NewBuffer(credsJSON))
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

func (h *UserHandler) CreateUser(ctx *gin.Context) {
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

	resp, err := http.Post(h.Config.UserHTTPServiceURL+"/create_user", dataType, bytes.NewBuffer(actInfoJSON))
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

func (h *UserHandler) RefreshToken(ctx *gin.Context) {
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

	resp, err := http.Post(h.Config.UserHTTPServiceURL+"/refresh_token", dataType, bytes.NewBuffer(tokenJSON))
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

package handler

import (
	"api-gateway/internal/config"
	"api-gateway/internal/middleware"
	"api-gateway/pkg/proto"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
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

func (h *UserHandler) ProcessMessage(conn *websocket.Conn, msg middleware.WSMessage) {
	log.Printf("Raw data: %s", string(msg.Data))
	switch msg.Action {
	case "get_user_info":
		var getUserInfo proto.GetUserInfoRequest
		if err := json.Unmarshal(msg.Data, &getUserInfo); err != nil {
			log.Printf("Failed to unmarshal GetUserInfoRequest: %v", err)
		}
		h.GetUserInfo(conn, msg.JWT, getUserInfo.Id)
	case "update_user_info":
		var updateInfo proto.UpdateUserInfoRequest
		if err := json.Unmarshal(msg.Data, &updateInfo); err != nil {
			log.Printf("Failed to unmarshal UpdateUserInfoRequest: %v", err)
		}
		h.UpdateUserInfo(conn, msg.JWT, updateInfo.Username, updateInfo.Email)
	case "search_for_user":
		var search proto.SearchForUserRequest
		if err := json.Unmarshal(msg.Data, &search); err != nil {
			log.Printf("Failed to unmarshal SearchForUserRequest: %v", err)
		}
		h.SearchForUser(conn, msg.JWT, search.Username)
	case "verify_user_pass":
		var verify proto.VerifyUserPasswordRequest
		if err := json.Unmarshal(msg.Data, &verify); err != nil {
			log.Printf("Failed to unmarshal VerifyUserPasswordRequest: %v", err)
		}
		h.VerifyUserPassword(conn, msg.JWT, verify.Password, uint(verify.Id))
	case "update_user_pass":
		var updatePassword proto.UpdateUserPasswordRequest
		if err := json.Unmarshal(msg.Data, &updatePassword); err != nil {
			log.Printf("Failed to unmarshal UpdateUserPasswordRequest: %v", err)
		}
		h.UpdateUserPassword(conn, msg.JWT, updatePassword.Password, uint(updatePassword.Id))
	case "delete_user":
		var DeleteUser proto.DeleteUserRequest
		if err := json.Unmarshal(msg.Data, &DeleteUser); err != nil {
			log.Printf("Failed to unmarshal DeleteUserRequest: %v", err)
		}
		h.UpdateUserPassword(conn, msg.JWT, DeleteUser.Password, uint(DeleteUser.Id))
	default:
		log.Print("Invalid action type")
	}

}

func (h *UserHandler) GetUserInfo(conn *websocket.Conn, jwt string, userId uint32) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.UserClient.GetUserInfo(ctxWithMetadata, &proto.GetUserInfoRequest{Id: userId})
	if err != nil {
		log.Printf("failed to create message: %v", err)
		return
	}

	log.Printf("user info: %v", resp)
	middleware.SendWebSocketMessage(conn, "get_user_info_resp", resp)

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
		log.Printf("failed to marshal the userinfo to JSON: %v", err)
		return
	}
	if err := conn.WriteMessage(websocket.TextMessage, userInfo); err != nil {
		log.Printf("Error sending userinfo over WS connnection: %v", err)
	}
}

func (h *UserHandler) VerifyUserPassword(conn *websocket.Conn, jwt, password string, userID uint) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.UserClient.VerifyUserPassword(ctxWithMetadata, &proto.VerifyUserPasswordRequest{Id: uint32(userID), Password: password})
	if err != nil {
		log.Print("Failed to create verify password message")
		return
	}
	middleware.SendWebSocketMessage(conn, "verify_user_pass_resp", resp)
}

func (h *UserHandler) UpdateUserPassword(conn *websocket.Conn, jwt, password string, userID uint) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.UserClient.UpdateUserPassword(ctxWithMetadata, &proto.UpdateUserPasswordRequest{Id: uint32(userID), Password: password})

	if err != nil {
		log.Print("Failed to create update password message")
		return
	}
	middleware.SendWebSocketMessage(conn, "update_user_pass_resp", resp)
}

func (h *UserHandler) DeleteUser(conn *websocket.Conn, jwt, password string, userID uint) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.UserClient.DeleteUser(ctxWithMetadata, &proto.DeleteUserRequest{Id: uint32(userID), Password: password})
	if err != nil {
		log.Print("Failed to create delete message")
		return
	}
	middleware.SendWebSocketMessage(conn, "delete_user_resp", resp)

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
		log.Printf("failed to marshal the username to JSON: %v", err)
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
		RefreshToken string `json:"refreshToken"`
	}

	// Log the incoming request
	fmt.Println("Received request to refresh token")

	// Log the raw request body
	bodyBytes, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		fmt.Printf("Failed to read request body: %v\n", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
		return
	}
	fmt.Printf("Raw request body: %s\n", string(bodyBytes))

	// Restore the body for further processing
	ctx.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	if err := ctx.ShouldBindJSON(&tokenRequest); err != nil {
		fmt.Printf("Failed to bind JSON: %v\n", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log the received refresh token
	fmt.Printf("Received refresh token: %s\n", tokenRequest.RefreshToken)

	tokenJSON, err := json.Marshal(tokenRequest)
	if err != nil {
		fmt.Printf("Failed to marshal JSON: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal JSON on refresh token"})
		return
	}

	// Log the marshaled JSON
	fmt.Printf("Marshaled JSON: %s\n", string(tokenJSON))

	resp, err := http.Post(h.Config.UserHTTPServiceURL+"/refresh_token", dataType, bytes.NewBuffer(tokenJSON))
	if err != nil {
		fmt.Printf("Failed to reach user service: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reach user service"})
		return
	}

	defer resp.Body.Close()

	// Log the response status
	fmt.Printf("User service response status: %d\n", resp.StatusCode)

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Failed to read response body: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response from user service"})
		return
	}

	// Log the response body
	fmt.Printf("User service response body: %s\n", string(body))

	ctx.Data(resp.StatusCode, dataType, body)
}

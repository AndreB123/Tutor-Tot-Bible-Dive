package api

import (
	"net/http"
	"user-microservice/pkg/model"
	"user-microservice/pkg/service"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	userService *service.UserService
	authService *service.AuthService
}

func NewHandler(userService *service.UserService, authService *service.AuthService) *Handler {
	return &Handler{
		userService: userService,
		authService: authService,
	}
}

func (h *Handler) CreateUser(c *gin.Context) {
	var newUser model.User
	var userCreds struct {
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.ShouldBindJSON(&userCreds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.userService.CreateUser(&newUser, userCreds.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successsfully"})
}

func (h *Handler) Login(c *gin.Context) {
	var loginCreds struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&loginCreds); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.userService.AuthUser(loginCreds.Email, loginCreds.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication failed"})
		return
	}

	accessToken, err := h.authService.GenerateToken(user.ID(), true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	refreshToken, err := h.authService.GenerateToken(user.ID(), false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

func (h *Handler) RefreshToken(c *gin.Context) {
	var tokenRequest struct {
		RefreshToken string `json:"refresh_token"`
	}

	if err := c.ShouldBindJSON(&tokenRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := h.authService.VerifyToken(tokenRequest.RefreshToken, false)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	newAccessToken, err := h.authService.GenerateToken(userID, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate new access token"})
		return
	}

	newRefreshToken, err := h.authService.GenerateToken(userID, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate new refresh token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  newAccessToken,
		"refresh_token": newRefreshToken,
	})
}

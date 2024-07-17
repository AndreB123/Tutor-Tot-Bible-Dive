package router

import (
	"api-gateway/internal/config"
	"api-gateway/internal/handler"
	"api-gateway/internal/middleware"
	"api-gateway/internal/services"
	"api-gateway/internal/websocket"
	"api-gateway/pkg/proto"

	"github.com/gin-gonic/gin"
)

func LoadRouter(cfg *config.Config, chatClient proto.ChatServiceClient, userClient proto.UserServiceClient, lessonClient proto.LessonServiceClient) *gin.Engine {
	router := gin.Default()

	serviceFactory := services.NewDefaultServiceFactory(chatClient, userClient, lessonClient)

	wsManager := websocket.NewWebSocketManager(cfg, serviceFactory)

	userHandler := handler.NewUserHandler(cfg, userClient)

	router.GET("/wss", func(ctx *gin.Context) {
		wsManager.HandleConnections(ctx.Writer, ctx.Request)
	})

	router.Use(middleware.JWTAuthMiddleware(cfg))
	router.POST("/api-v1/login", userHandler.Login)
	router.POST("/api-v1/create_user", userHandler.CreateUser)
	router.POST("/api-v1/refresh_token", userHandler.RefreshToken)

	return router
}

package router

import (
	"api-gateway/internal/config"
	"api-gateway/internal/handler"
	"api-gateway/internal/middleware"
	"api-gateway/pkg/proto"
	"fmt"
	"net/http"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func LoadRouter(cfg *config.Config, chatClient proto.ChatServiceClient) *gin.Engine {
	router := gin.Default()

	h := handler.NewHandler(cfg, chatClient)

	router.GET("/wss", func(ctx *gin.Context) {

		tokenString := ctx.Query("token")

		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return []byte(cfg.AccessSecret), nil
		})

		if err != nil || !token.Valid {
			ctx.String(http.StatusUnauthorized, "Invalid Token")
			return
		}

		conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
		if err != nil {
			ctx.String(http.StatusInternalServerError, "WebSocket upgrade failed")
			return
		}
		go handler.HandleWebSocketConnection(conn, h)
	})

	router.Use(middleware.JWTAuthMiddleware(cfg))

	router.POST("/api-v1/login", h.Login)
	router.POST("/api-v1/create_user", h.CreateUser)
	router.POST("/api-v1/refresh_token", h.RefreshToken)

	return router
}

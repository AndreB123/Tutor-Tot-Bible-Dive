package handler

import (
	"api-gateway/internal/middleware"

	"github.com/gorilla/websocket"
)

type MessageHandler interface {
	ProcessMessage(conn *websocket.Conn, msg middleware.WSMessage)
}

package middleware

import (
	"log"

	"github.com/gorilla/websocket"
)

// SendWebSocketMessage sends a binary-encoded message (protobuf data) over the WebSocket connection
func SendWebSocketMessage(conn *websocket.Conn, data []byte) {
	if err := conn.WriteMessage(websocket.BinaryMessage, data); err != nil {
		log.Printf("Error sending WebSocket message: %v", err)
	}
}

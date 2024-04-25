package middleware

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

func SendWebSocketMessage(conn *websocket.Conn, action string, data interface{}) {
	msgData, err := json.Marshal(data)
	if err != nil {
		log.Printf("Error marshaling message to JSON: %v", err)
		return
	}

	wsMsg := WSMessage{
		Action: action,
		Data:   json.RawMessage(msgData),
	}

	msg, err := json.Marshal(wsMsg)
	if err != nil {
		log.Printf("Error marshaling WebSocket message to JSON: %v", err)
		return
	}

	if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
		log.Printf("Error sending WebSocket message: %v", err)
	}
}

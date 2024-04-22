package websocket

import (
	"api-gateway/internal/config"
	"api-gateway/internal/middleware"
	"api-gateway/internal/services"
	"encoding/json"
	"log"
	"net/http"

	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/websocket"
)

type WebSocketManager struct {
	upgrader       websocket.Upgrader
	serviceFactory services.ServiceFactory
	config         *config.Config
}

func NewWebSocketManager(cfg *config.Config, serviceFactory services.ServiceFactory) *WebSocketManager {
	return &WebSocketManager{
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
		},
		serviceFactory: serviceFactory,
	}
}

func (manager *WebSocketManager) HandleConnections(w http.ResponseWriter, r *http.Request) {
	tokenString := r.URL.Query().Get("token")
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.NewValidationError("Unexpected signing method", jwt.ValidationErrorSignatureInvalid)
		}
		return []byte(manager.config.AccessSecret), nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	conn, err := manager.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Upgrade Failed: %v", err)
		return
	}
	defer conn.Close()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Panicln("Read Failed:", err)
			break
		}

		go manager.handleMessage(conn, msg)

	}
}

func (manager *WebSocketManager) handleMessage(conn *websocket.Conn, msg []byte) {
	var wsMsg middleware.WSMessage
	if err := json.Unmarshal(msg, &wsMsg); err != nil {
		log.Println("Unmarshal failed:", err)
		return
	}

	handler := manager.serviceFactory.GetHandler(wsMsg.Type)
	if handler != nil {
		handler.ProcessMessage(conn, wsMsg.JWT, wsMsg.Data)
	} else {
		log.Println("Handler not found for message type:", wsMsg.Type)
	}
}

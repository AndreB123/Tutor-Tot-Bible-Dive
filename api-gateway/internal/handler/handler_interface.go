package handler

import "github.com/gorilla/websocket"

type MessageHandler interface {
	ProcessMessage(conn *websocket.Conn, jwt string, data []byte)
}

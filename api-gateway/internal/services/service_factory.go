package services

import (
	"api-gateway/internal/handler"
	"api-gateway/pkg/proto"
)

type ServiceFactory interface {
	GetHandler(messageType string) handler.MessageHandler
}

type DefaultServiceFactory struct {
	chatHandler *handler.ChatHandler
	userHandler *handler.UserHandler
}

func NewDefaultServiceFactory(chatClient proto.ChatServiceClient, userClient proto.UserServiceClient) *DefaultServiceFactory {
	return &DefaultServiceFactory{
		chatHandler: &handler.ChatHandler{ChatClient: chatClient},
		userHandler: &handler.UserHandler{UserClient: userClient},
	}
}

func (f *DefaultServiceFactory) GetHandler(messageType string) handler.MessageHandler {
	switch messageType {
	case "chat":
		return f.chatHandler
	case "user":
		return f.userHandler
	default:
		return nil
	}
}

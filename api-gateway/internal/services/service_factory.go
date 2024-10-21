package services

import (
	"api-gateway/internal/handler"
	"api-gateway/pkg/proto"
)

type ServiceFactory interface {
	GetHandler(messageType string) handler.MessageHandler
}

type DefaultServiceFactory struct {
	chatHandler   *handler.ChatHandler
	userHandler   *handler.UserHandler
	lessonHandler *handler.LessonHandler
}

func NewDefaultServiceFactory(chatClient proto.ChatServiceClient, userClient proto.UserServiceClient, lessonClient proto.LessonServiceClient) *DefaultServiceFactory {
	return &DefaultServiceFactory{
		chatHandler:   &handler.ChatHandler{ChatClient: chatClient},
		userHandler:   &handler.UserHandler{UserClient: userClient},
		lessonHandler: &handler.LessonHandler{LessonClient: lessonClient},
	}
}

func (f *DefaultServiceFactory) GetHandler(service string) handler.MessageHandler {
	switch service {
	case "chat":
		return f.chatHandler
	case "user":
		return f.userHandler
	case "lesson":
		return f.lessonHandler
	default:
		return nil
	}
}

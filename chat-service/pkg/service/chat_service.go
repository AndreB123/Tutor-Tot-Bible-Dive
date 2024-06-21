package service

import (
	contextkeys "chat-service/pkg/context-keys"
	"chat-service/pkg/model"
	"chat-service/pkg/repository"
	"context"
	"errors"
	"strings"
)

type ChatService struct {
	chatRepository *repository.ChatRepository
}

func NewChatService(chatRepo *repository.ChatRepository) *ChatService {
	return &ChatService{
		chatRepository: chatRepo,
	}
}

func (s *ChatService) UpdateChatName(chatID uint, name string) (*model.Chat, error) {
	chat, err := s.chatRepository.FindChatByID(chatID)
	if err != nil {
		return nil, err
	}

	chat.Name = strings.TrimSpace(name)

	if err := s.chatRepository.UpdateChat(chat); err != nil {
		return nil, err
	}
	return chat, nil
}

func (s *ChatService) GetAllChatSummeryByUID(userID uint) ([]model.ChatSummery, error) {
	return s.chatRepository.GetAllChatSummeryByUserID(userID)
}

func (s *ChatService) DeleteChatByID(ctx context.Context, chatID, userID uint) error {
	ctxUID, ok := ctx.Value(contextkeys.Userkey).(uint)
	if !ok || ctxUID != userID {
		return errors.New("unauthorized: user ID invalid")
	}
	return s.chatRepository.DeleteChatByID(chatID, userID)
}

func (s *ChatService) DeleteAllChatsByUID(ctx context.Context, userID uint) error {
	ctxUID, ok := ctx.Value(contextkeys.Userkey).(uint)
	if !ok || ctxUID != userID {
		return errors.New("unauthorized: user ID invalid")
	}
	return s.chatRepository.DeleteAllChatsByUID(userID)
}

// helper funcs
func deriveChatNameFromMessage(body string) string {
	words := strings.Fields(body)
	if len(words) > 5 {
		words = words[:5]
	}
	return strings.Join(words, " ")
}

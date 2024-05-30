package service

import (
	"chat-service/pkg/model"
	"chat-service/pkg/repository"
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

// helper funcs
func deriveChatNameFromMessage(body string) string {
	words := strings.Fields(body)
	if len(words) > 5 {
		words = words[:5]
	}
	return strings.Join(words, " ")
}

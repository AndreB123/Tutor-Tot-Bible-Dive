package service

import (
	"chat-service/pkg/model"
	"chat-service/pkg/repository"
)

type MessageService struct {
	messageRepo *repository.MessageRepository
	chatRepo    *repository.ChatRepository
}

func NewMessageService(msgRepo *repository.MessageRepository, chatRepo *repository.ChatRepository) *MessageService {
	return &MessageService{
		messageRepo: msgRepo,
		chatRepo:    chatRepo,
	}
}

func (s *MessageService) CreateMessage(chatID uint, sender, body string, userID uint) (*model.Message, error) {
	message := &model.Message{
		Sender: sender,
		Body:   body,
		ChatID: chatID,
		UserID: userID,
	}
	err := s.messageRepo.CreateNewMessage(message)
	if err != nil {
		return nil, err
	}
	return message, nil
}

func (s *MessageService) CreateInitialMessage(userID uint, sender, body string) (*model.Chat, *model.Message, error) {
	chatName := deriveChatNameFromMessage(body)
	chat := &model.Chat{
		UserID: userID,
		Name:   chatName,
	}
	if err := s.chatRepo.CreateNewChat(chat); err != nil {
		return nil, nil, err
	}

	messsage := &model.Message{
		Sender: sender,
		Body:   body,
		UserID: userID,
		ChatID: chat.ID,
	}
	if err := s.messageRepo.CreateNewMessage(messsage); err != nil {
		return nil, nil, err
	}
	return chat, messsage, nil
}

func (s *MessageService) UpdateMessageContent(messageID uint, content string) error {
	return s.messageRepo.UpdateMessageContent(messageID, content)
}

func (s *MessageService) FindMessagesByChatIDPaginated(chatID uint, lastMsgID uint, limit int) ([]model.Message, error) {
	return s.messageRepo.FindMessagesByChatIDPaginated(chatID, lastMsgID, limit)
}

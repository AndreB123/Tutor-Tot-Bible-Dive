package server

import (
	contextkeys "chat-service/pkg/context-keys"
	"chat-service/pkg/proto"
	"chat-service/pkg/service"
	"context"
	"fmt"
	"log"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type ChatServer struct {
	chatService    *service.ChatService
	messageService *service.MessageService
	openAIService  *service.OpenAIService
	proto.UnimplementedChatServiceServer
}

func NewChatServer(chatService *service.ChatService, messageService *service.MessageService, openAIService *service.OpenAIService) *ChatServer {
	return &ChatServer{
		chatService:    chatService,
		messageService: messageService,
		openAIService:  openAIService,
	}
}

func (s *ChatServer) CreateMessage(ctx context.Context, req *proto.CreateMessageRequest) (*proto.CreateMessageResponse, error) {
	chatID := uint(req.GetChatId())
	sender := req.GetSender()
	body := req.GetBody()
	userID := ctx.Value(contextkeys.Userkey).(uint)

	messsage, err := s.messageService.CreateMessage(chatID, sender, body, userID)
	if err != nil {
		log.Printf("Failed to create message: %v", err)
		return nil, err
	}

	resp := &proto.CreateMessageResponse{
		Message: &proto.Message{
			Id:        uint32(messsage.ID),
			ChatId:    uint32(messsage.ChatID),
			Sender:    messsage.Sender,
			Body:      messsage.Body,
			CreatedAt: timestamppb.New(messsage.CreatedAt),
		},
	}

	return resp, nil
}

func (s *ChatServer) CreateChat(ctx context.Context, req *proto.CreateChatRequest) (*proto.CreateChatResponse, error) {
	userID := ctx.Value(contextkeys.Userkey).(uint)
	sender := req.GetSender()
	body := req.GetBody()

	chat, message, err := s.messageService.CreateInitialMessage(userID, sender, body)
	if err != nil {
		log.Printf("Failed to create message and chat: %v", err)
		return nil, err
	}

	resp := &proto.CreateChatResponse{
		Chat: &proto.Chat{
			Id:   uint32(chat.ID),
			Name: chat.Name,
		},
		Message: &proto.Message{
			Id:        uint32(message.ID),
			ChatId:    uint32(message.ChatID),
			Sender:    message.Sender,
			Body:      message.Body,
			CreatedAt: timestamppb.New(message.CreatedAt),
		},
	}

	return resp, nil
}

func (s *ChatServer) GetRecentMessages(ctx context.Context, req *proto.GetRecentMessagesRequest) (*proto.GetRecentMessagesResponse, error) {
	fmt.Printf("get recent messages called with: %v\n", req)
	chatID := uint(req.GetChatId())
	lastMessageID := uint(req.GetLastMessageId())
	limit := uint(req.GetLimit())
	if limit == 0 {
		limit = 5
	}
	messages, err := s.messageService.FindMessagesByChatIDPaginated(chatID, lastMessageID, limit)
	if err != nil {
		log.Printf("Failed to find messages: %v\n", err)
		return nil, err
	}

	var msgs []*proto.Message
	for _, msg := range messages {
		protoMsg := &proto.Message{
			Id:        uint32(msg.ID),
			ChatId:    uint32(msg.ChatID),
			Sender:    msg.Sender,
			Body:      msg.Body,
			CreatedAt: timestamppb.New(msg.CreatedAt),
		}
		msgs = append(msgs, protoMsg)
	}

	resp := &proto.GetRecentMessagesResponse{
		Messages: msgs,
	}
	fmt.Printf("returning recent messages response: %v\n", resp)
	return resp, nil
}

func (s *ChatServer) StreamMessages(stream proto.ChatService_StreamMessagesServer) error {
	req, err := stream.Recv()
	if err != nil {
		log.Printf("Error receiving message from client: %v", err)
		return err
	}
	userID := stream.Context().Value(contextkeys.Userkey).(uint)
	sender := req.GetSender()
	body := req.GetBody()
	var chatID uint
	if req.GetChatId() == 0 {

		chat, _, createErr := s.messageService.CreateInitialMessage(userID, sender, body)
		if createErr != nil {
			log.Printf("Failed to create initial message and chat: %v", createErr)
			return createErr
		}
		chatID = chat.ID
	} else {
		chatID = uint(req.GetChatId())
		_, err := s.messageService.CreateMessage(chatID, sender, body, userID)
		if err != nil {
			log.Printf("Failed to store user message: %v", err)
		}
	}

	return s.handleOpenAIResponse(chatID, "Bible Dive", body, userID, stream)
}

func (s *ChatServer) GetChatSummariesUID(ctx context.Context, req *proto.GetChatSummariesUIDRequest) (*proto.GetChatSummariesUIDResponse, error) {
	userID := ctx.Value(contextkeys.Userkey).(uint)
	chats, err := s.chatService.GetAllChatSummeryByUID(userID)
	if err != nil {
		log.Printf("Failed to get all chats")
		return nil, err
	}

	var protoChatSummeries []*proto.ChatSummary
	for _, summary := range chats {
		protoChatSummeries = append(protoChatSummeries, &proto.ChatSummary{
			Id:   uint32(summary.ID),
			Name: summary.Name,
		})
	}

	resp := &proto.GetChatSummariesUIDResponse{
		Chats: protoChatSummeries,
	}

	return resp, nil
}

func (s *ChatServer) DeleteChatByID(ctx context.Context, req *proto.DeleteChatByIDRequest) (*proto.DeleteChatByIDResponse, error) {
	userID := uint(req.GetUserId())
	chatID := uint(req.GetChatId())
	err := s.chatService.DeleteChatByID(ctx, chatID, userID)
	if err != nil {
		log.Printf("Failed to delete chat: %v", err)
		return &proto.DeleteChatByIDResponse{
			Success: false,
		}, status.Error(codes.Internal, "failed to delete chat")
	}
	return &proto.DeleteChatByIDResponse{
		Success: true,
	}, nil
}

func (s *ChatServer) DeleteAllChatsByUID(ctx context.Context, req *proto.DeleteAllChatsByUIDRequest) (*proto.DeleteAllChatsByUIDResponse, error) {
	userID := uint(req.GetUserId())

	err := s.chatService.DeleteAllChatsByUID(ctx, userID)
	if err != nil {
		log.Printf("Failed to delete chat: %v", err)
		return &proto.DeleteAllChatsByUIDResponse{
			Success: false,
		}, status.Error(codes.Internal, "failed to delete chat")
	}
	return &proto.DeleteAllChatsByUIDResponse{
		Success: true,
	}, nil
}

// helper functions
func (s *ChatServer) handleOpenAIResponse(chatID uint, sender string, prompt string, userID uint, stream proto.ChatService_StreamMessagesServer) error {
	return s.openAIService.SendMessageToOpenAI(context.Background(), chatID, prompt, userID, func(response string, messageID uint) error {
		resp := &proto.CreateMessageResponse{
			Message: &proto.Message{
				Id:     uint32(messageID),
				ChatId: uint32(chatID),
				Sender: sender,
				Body:   response,
			},
		}
		if sendErr := stream.Send(resp); sendErr != nil {
			log.Printf("Error sending message to client: %v", sendErr)
			return sendErr
		}
		return nil
	})
}

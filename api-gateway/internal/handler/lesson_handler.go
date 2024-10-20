package handler

import (
	"api-gateway/internal/config"
	"api-gateway/internal/middleware"
	"api-gateway/pkg/proto"
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

type LessonHandler struct {
	Config         *config.Config
	LessonClient   proto.LessonServiceClient
	actionHandlers map[string]func(conn *websocket.Conn, jwt string, data []byte)
}

func NewLessonHandler(cfg *config.Config, lessonClient proto.LessonServiceClient) *LessonHandler {
	h := &LessonHandler{
		Config:       cfg,
		LessonClient: lessonClient,
	}

	h.actionHandlers = map[string]func(conn *websocket.Conn, jwt string, data []byte){
		"generate_topic_plan":              h.handleGenerateTopicPlan,
		"generate_lessons":                 h.handleGenerateLessons,
		"generate_test":                    h.handleGenerateTest,
		"grade_test":                       h.handleGradeTest,
		"get_all_topic_plans_by_uid":       h.handleGetAllTopicPlansByUID,
		"get_all_lesson_plans_by_topic_id": h.handleGetAllLessonsByTopicID,
		"get_all_tests_by_lesson_id":       h.handleGetAllTestsByLessonID,
		"get_lesson_by_lessonID":           h.handleGetLessonByID,
		"get_all_questions_by_test_id":     h.handleGetAllQuestionsByTestID,
		"generate_topic_plan_overview":     h.handleGenerateQuickResponse,
		"get_topic_plan_by_id":             h.handleGetTopicPlanByID,
	}

	return h
}

func (h *LessonHandler) ProcessMessage(conn *websocket.Conn, msg middleware.WSMessage) {
	log.Printf("Raw data: %s", string(msg.Data))

	handlerFunc, ok := h.actionHandlers[msg.Action]
	if !ok {
		log.Printf("Unknown action: %s", msg.Action)
		return
	}
	handlerFunc(conn, msg.JWT, msg.Data)
}

// Generic handler function to reduce repetition
func (h *LessonHandler) handleAction(conn *websocket.Conn, jwt string, data []byte, req interface{}, serviceFunc func(ctx context.Context, req interface{}) (interface{}, error), respAction string) {
	if err := json.Unmarshal(data, req); err != nil {
		log.Printf("Failed to unmarshal %T: %v", req, err)
		return
	}

	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
		defer cancel()

		ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

		resp, err := serviceFunc(ctxWithMetadata, req)
		if err != nil {
			log.Printf("Error in service method: %v", err)
			return
		}

		middleware.SendWebSocketMessage(conn, respAction, resp)
	}()
}

// Individual handler functions

func (h *LessonHandler) handleGenerateTopicPlan(conn *websocket.Conn, jwt string, data []byte) {
	var req proto.GenerateTopicPlanRequest
	h.handleAction(conn, jwt, data, &req, func(ctx context.Context, req interface{}) (interface{}, error) {
		return h.LessonClient.GenerateTopicPlan(ctx, req.(*proto.GenerateTopicPlanRequest))
	}, "generate_topic_plan_resp")
}

func (h *LessonHandler) handleGenerateLessons(conn *websocket.Conn, jwt string, data []byte) {
	var req proto.GenerateLessonsRequest
	h.handleAction(conn, jwt, data, &req, func(ctx context.Context, req interface{}) (interface{}, error) {
		return h.LessonClient.GenerateLessons(ctx, req.(*proto.GenerateLessonsRequest))
	}, "generate_lessons_resp")
}

func (h *LessonHandler) handleGenerateTest(conn *websocket.Conn, jwt string, data []byte) {
	var req proto.GenerateTestRequest
	h.handleAction(conn, jwt, data, &req, func(ctx context.Context, req interface{}) (interface{}, error) {
		return h.LessonClient.GenerateTests(ctx, req.(*proto.GenerateTestRequest))
	}, "generate_test_resp")
}

func (h *LessonHandler) handleGradeTest(conn *websocket.Conn, jwt string, data []byte) {
	var req proto.GradeTestRequest
	h.handleAction(conn, jwt, data, &req, func(ctx context.Context, req interface{}) (interface{}, error) {
		return h.LessonClient.GradeTest(ctx, req.(*proto.GradeTestRequest))
	}, "grade_test_resp")
}

func (h *LessonHandler) handleGetAllTopicPlansByUID(conn *websocket.Conn, jwt string, data []byte) {
	var req proto.GetAllTopicPlansByUIDRequest
	h.handleAction(conn, jwt, data, &req, func(ctx context.Context, req interface{}) (interface{}, error) {
		return h.LessonClient.GetAllTopicPlansByUID(ctx, req.(*proto.GetAllTopicPlansByUIDRequest))
	}, "get_all_topic_plans_by_uid_resp")
}

func (h *LessonHandler) handleGetAllLessonsByTopicID(conn *websocket.Conn, jwt string, data []byte) {
	var req proto.GetAllLessonPlansByTopicIDRequest
	h.handleAction(conn, jwt, data, &req, func(ctx context.Context, req interface{}) (interface{}, error) {
		return h.LessonClient.GetAllLessonPlansByTopicID(ctx, req.(*proto.GetAllLessonPlansByTopicIDRequest))
	}, "get_all_lesson_plans_by_topic_id_resp")
}

func (h *LessonHandler) handleGetAllTestsByLessonID(conn *websocket.Conn, jwt string, data []byte) {
	var req proto.GetAllTestsByLessonIDRequest
	h.handleAction(conn, jwt, data, &req, func(ctx context.Context, req interface{}) (interface{}, error) {
		return h.LessonClient.GetAllTestsByLessonID(ctx, req.(*proto.GetAllTestsByLessonIDRequest))
	}, "get_all_tests_by_lesson_id_resp")
}

func (h *LessonHandler) handleGetLessonByID(conn *websocket.Conn, jwt string, data []byte) {
	var req proto.GetLessonByIDRequest
	h.handleAction(conn, jwt, data, &req, func(ctx context.Context, req interface{}) (interface{}, error) {
		return h.LessonClient.GetLessonByID(ctx, req.(*proto.GetLessonByIDRequest))
	}, "get_lesson_by_id_resp")
}

func (h *LessonHandler) handleGetAllQuestionsByTestID(conn *websocket.Conn, jwt string, data []byte) {
	var req proto.GetAllQuestionsByTestIDRequest
	h.handleAction(conn, jwt, data, &req, func(ctx context.Context, req interface{}) (interface{}, error) {
		return h.LessonClient.GetAllQuestionsByTestID(ctx, req.(*proto.GetAllQuestionsByTestIDRequest))
	}, "get_all_questions_by_test_id_resp")
}

func (h *LessonHandler) handleGenerateQuickResponse(conn *websocket.Conn, jwt string, data []byte) {
	var req proto.GenerateQuickResponseRequest
	h.handleAction(conn, jwt, data, &req, func(ctx context.Context, req interface{}) (interface{}, error) {
		return h.LessonClient.GenerateQuickResponse(ctx, req.(*proto.GenerateQuickResponseRequest))
	}, "generate_topic_plan_overview_resp")
}

func (h *LessonHandler) handleGetTopicPlanByID(conn *websocket.Conn, jwt string, data []byte) {
	var req proto.GetTopicPlanByIDRequest
	h.handleAction(conn, jwt, data, &req, func(ctx context.Context, req interface{}) (interface{}, error) {
		return h.LessonClient.GetTopicPlanByID(ctx, req.(*proto.GetTopicPlanByIDRequest))
	}, "get_topic_plan_by_id_resp")
}

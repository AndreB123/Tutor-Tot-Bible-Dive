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
	Config       *config.Config
	LessonClient proto.LessonServiceClient
}

func NewLessonHandler(cfg *config.Config, lessonClient proto.LessonServiceClient) *LessonHandler {
	return &LessonHandler{
		Config:       cfg,
		LessonClient: lessonClient,
	}
}

func (h *LessonHandler) ProcessMessage(conn *websocket.Conn, msg middleware.WSMessage) {
	log.Printf("Raw data: %s", string(msg.Data))

	switch msg.Action {
	case "generate_topic_plan":
		var generateTopicPlanReq proto.GenerateTopicPlanRequest
		if err := json.Unmarshal(msg.Data, &generateTopicPlanReq); err != nil {
			log.Printf("Failed to unmarshal GenerateTopicPlanRequest: %v", err)
			return
		}
		go h.GenerateTopicPlan(conn, msg.JWT, generateTopicPlanReq.UserId, generateTopicPlanReq.Prompt, generateTopicPlanReq.NumberOfLessons)
	case "generate_lessons":
		var generateLessonsReq proto.GenerateLessonsRequest
		if err := json.Unmarshal(msg.Data, &generateLessonsReq); err != nil {
			log.Printf("Failed to unmarshal GenerateLessonsRequest: %v", err)
			return
		}
		go h.GenerateLessons(conn, msg.JWT, generateLessonsReq.TopicPlanId)
	case "generate_test":
		var generateTestReq proto.GenerateTestRequest
		if err := json.Unmarshal(msg.Data, &generateTestReq); err != nil {
			log.Printf("Failed to unmarshal GenerateTestRequest: %v", err)
			return
		}
		go h.GenerateTest(conn, msg.JWT, generateTestReq.LessonId)
	case "grade_test":
		var gradeTestReq proto.GradeTestRequest
		if err := json.Unmarshal(msg.Data, &gradeTestReq); err != nil {
			log.Printf("Failed to unmarshal GradeTestRequest: %v", err)
			return
		}
		go h.GradeTest(conn, msg.JWT, gradeTestReq)
	case "get_all_topic_plans_by_uid":
		var getAllTopicPlansByUIDReq proto.GetAllTopicPlansByUIDRequest
		if err := json.Unmarshal(msg.Data, &getAllTopicPlansByUIDReq); err != nil {
			log.Printf("Failed to unmarshal GetAllTopicPlansByUIDRequest: %v", err)
			return
		}
		go h.GetAllTopicPlansByUID(conn, msg.JWT, getAllTopicPlansByUIDReq.UserId)
	case "get_all_lesson_plans_by_topic_id":
		var getAllLessonsByTopicIDReq proto.GetAllLessonPlansByTopicIDRequest
		if err := json.Unmarshal(msg.Data, &getAllLessonsByTopicIDReq); err != nil {
			log.Printf("Failed to unmarshal GetAllLessonPlansByTopicIDRequest: %v", err)
			return
		}
		go h.GetAllLessonsByTopicID(conn, msg.JWT, getAllLessonsByTopicIDReq.TopicPlanId)
	case "get_all_tests_by_lesson_id":
		var getAllTestsByLessonIDReq proto.GetAllTestsByLessonIDRequest
		if err := json.Unmarshal(msg.Data, &getAllTestsByLessonIDReq); err != nil {
			log.Printf("Failed to unmarshal GetAllTestsByLessonIDRequest: %v", err)
			return
		}
		go h.GetAllTestsByLessonID(conn, msg.JWT, getAllTestsByLessonIDReq.LessonId)
	case "get_all_questions_by_test_id":
		var getAllQuestionsByTestIDReq proto.GetAllQuestionsByTestIDRequest
		if err := json.Unmarshal(msg.Data, &getAllQuestionsByTestIDReq); err != nil {
			log.Printf("Failed to unmarshal GetAllQuestionsByTestIDRequest: %v", err)
			return
		}
		go h.GetAllQuestionsByTestID(conn, msg.JWT, getAllQuestionsByTestIDReq.TestId)
	case "generate_topic_plan_overview":
		var generateQuickResponseReq proto.GenerateQuickResponseRequest
		if err := json.Unmarshal(msg.Data, &generateQuickResponseReq); err != nil {
			log.Printf("Failed to unmarshal GenerateQuickResponseRequest: %v", err)
			return
		}
		go h.GenerateQuickResponse(conn, msg.JWT, generateQuickResponseReq.Prompt)
	}
}

func (h *LessonHandler) GenerateTopicPlan(conn *websocket.Conn, jwt string, userID uint32, prompt string, numberOfLessons uint32) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)
	req := &proto.GenerateTopicPlanRequest{
		UserId:          userID,
		Prompt:          prompt,
		NumberOfLessons: numberOfLessons,
	}

	resp, err := h.LessonClient.GenerateTopicPlan(ctxWithMetadata, req)
	if err != nil {
		log.Printf("Error generating topic plan: %v", err)
		return
	}

	middleware.SendWebSocketMessage(conn, "generate_topic_plan_resp", resp)
}

func (h *LessonHandler) GenerateLessons(conn *websocket.Conn, jwt string, topicPlanID uint32) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)
	req := &proto.GenerateLessonsRequest{
		TopicPlanId: topicPlanID,
	}

	resp, err := h.LessonClient.GenerateLessons(ctxWithMetadata, req)
	if err != nil {
		log.Printf("Error generating lessons: %v", err)
		return
	}

	middleware.SendWebSocketMessage(conn, "generate_lessons_resp", resp)
}

func (h *LessonHandler) GenerateTest(conn *websocket.Conn, jwt string, lessonID uint32) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)
	req := &proto.GenerateTestRequest{
		LessonId: lessonID,
	}

	resp, err := h.LessonClient.GenerateTests(ctxWithMetadata, req)
	if err != nil {
		log.Printf("Error generating test: %v", err)
		return
	}

	middleware.SendWebSocketMessage(conn, "generate_test_resp", resp)
}

func (h *LessonHandler) GradeTest(conn *websocket.Conn, jwt string, req proto.GradeTestRequest) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.LessonClient.GradeTest(ctxWithMetadata, &req)
	if err != nil {
		log.Printf("Error grading test: %v", err)
		return
	}

	middleware.SendWebSocketMessage(conn, "grade_test_resp", resp)
}

func (h *LessonHandler) GetAllTopicPlansByUID(conn *websocket.Conn, jwt string, userID uint32) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.LessonClient.GetAllTopicPlansByUID(ctxWithMetadata, &proto.GetAllTopicPlansByUIDRequest{UserId: userID})
	if err != nil {
		log.Printf("Error getting all topic plans by user ID: %v", err)
		return
	}

	middleware.SendWebSocketMessage(conn, "get_all_topic_plans_by_uid_resp", resp)
}

func (h *LessonHandler) GetAllLessonsByTopicID(conn *websocket.Conn, jwt string, topicPlanID uint32) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.LessonClient.GetAllLessonPlansByTopicID(ctxWithMetadata, &proto.GetAllLessonPlansByTopicIDRequest{TopicPlanId: topicPlanID})
	if err != nil {
		log.Printf("Error getting all lessons by topic ID: %v", err)
		return
	}

	middleware.SendWebSocketMessage(conn, "get_all_lesson_plans_by_topic_id_resp", resp)
}

func (h *LessonHandler) GetAllTestsByLessonID(conn *websocket.Conn, jwt string, lessonID uint32) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.LessonClient.GetAllTestsByLessonID(ctxWithMetadata, &proto.GetAllTestsByLessonIDRequest{LessonId: lessonID})
	if err != nil {
		log.Printf("Error getting all tests by lesson ID: %v", err)
		return
	}

	middleware.SendWebSocketMessage(conn, "get_all_tests_by_lesson_id_resp", resp)
}

func (h *LessonHandler) GetAllQuestionsByTestID(conn *websocket.Conn, jwt string, testID uint32) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)

	resp, err := h.LessonClient.GetAllQuestionsByTestID(ctxWithMetadata, &proto.GetAllQuestionsByTestIDRequest{TestId: testID})
	if err != nil {
		log.Printf("Error getting all questions by test ID: %v", err)
		return
	}

	middleware.SendWebSocketMessage(conn, "get_all_questions_by_test_id_resp", resp)
}

func (h *LessonHandler) GenerateQuickResponse(conn *websocket.Conn, jwt string, prompt string) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	ctxWithMetadata := middleware.WithJWTMetadata(ctx, jwt)
	req := &proto.GenerateQuickResponseRequest{
		Prompt: prompt,
	}
	resp, err := h.LessonClient.GenerateQuickResponse(ctxWithMetadata, req)
	if err != nil {
		log.Printf("Error generating quick response: %v", err)
		return
	}

	middleware.SendWebSocketMessage(conn, "generate_topic_plan_overview_resp", resp)
}

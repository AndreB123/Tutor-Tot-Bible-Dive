package server

import (
	"context"
	"fmt"
	"lesson-service/pkg/model"
	"lesson-service/pkg/proto"
	"lesson-service/pkg/service"
	"strings"
)

type LessonServer struct {
	topicService  *service.TopicPlanService
	lessonService *service.LessonService
	testService   *service.TestService
	openAIService *service.OpenAIService
	proto.UnimplementedLessonServiceServer
}

func NewLessonServer(
	topicService *service.TopicPlanService,
	lessonService *service.LessonService,
	testService *service.TestService,
	openAIService *service.OpenAIService,
) *LessonServer {
	return &LessonServer{
		topicService:  topicService,
		lessonService: lessonService,
		testService:   testService,
		openAIService: openAIService,
	}
}

func (s *LessonServer) GenerateQuickResponse(ctx context.Context, req *proto.GenerateQuickResponseRequest) (*proto.GenerateQuickResponseResponse, error) {
	fmt.Println("GenerateQuickResponse called with prompt:", req.Prompt)

	response, err := s.openAIService.GenerateQuickResponse(req.Prompt)
	fmt.Println("Response from GenerateQuickResponse:", response)
	if err != nil {
		fmt.Println("Error from GenerateQuickResponse:", err)
		return nil, err
	}

	fmt.Println("Returning response from GenerateQuickResponse")
	return &proto.GenerateQuickResponseResponse{Response: response}, nil
}

func (s *LessonServer) GenerateTopicPlan(ctx context.Context, req *proto.GenerateTopicPlanRequest) (*proto.GenerateTopicPlanResponse, error) {
	topicPlan, err := s.openAIService.GenerateTopicPlan(req.Prompt, uint(req.UserId), int(req.NumberOfLessons))
	if err != nil {
		return nil, err
	}

	protoTopicPlan := &proto.TopicPlan{
		Id:        uint32(topicPlan.ID),
		Title:     topicPlan.Title,
		UserId:    uint32(topicPlan.UserID),
		Objective: topicPlan.Objective,
		Standard:  topicPlan.Standard,
		Completed: topicPlan.Completed,
	}

	for _, lesson := range topicPlan.Lessons {
		protoLesson := &proto.Lesson{
			Id:          uint32(lesson.ID),
			Title:       lesson.Title,
			TopicPlanId: uint32(lesson.TopicPlanID),
			Objective:   lesson.Objective,
			Information: lesson.Information,
			Completed:   lesson.Completed,
		}
		protoTopicPlan.Lesson = append(protoTopicPlan.Lesson, protoLesson)
	}

	return &proto.GenerateTopicPlanResponse{TopicPlan: protoTopicPlan}, nil
}

func (s *LessonServer) GenerateLessons(ctx context.Context, req *proto.GenerateLessonsRequest) (*proto.GenerateLessonsResponse, error) {
	topicPlanID := uint(req.TopicPlanId)
	lessons, err := s.lessonService.GetAllLessonsByTopicPlanID(topicPlanID)
	if err != nil {
		return nil, err
	}

	var detailedLessons []*proto.Lesson
	for _, lesson := range lessons {
		detailedLesson, err := s.openAIService.GenerateDetailedLesson(lesson)
		if err != nil {
			return nil, err
		}
		protoLesson := &proto.Lesson{
			Id:          uint32(detailedLesson.ID),
			Title:       detailedLesson.Title,
			TopicPlanId: uint32(detailedLesson.TopicPlanID),
			Objective:   detailedLesson.Objective,
			Information: detailedLesson.Information,
			Completed:   detailedLesson.Completed,
		}
		detailedLessons = append(detailedLessons, protoLesson)
	}
	return &proto.GenerateLessonsResponse{Lessons: detailedLessons}, nil
}

func (s *LessonServer) GenerateTest(ctx context.Context, req *proto.GenerateTestRequest) (*proto.GenerateTestResponse, error) {
	lesson, err := s.lessonService.GetLessonByID(uint(req.LessonId))
	if err != nil {
		return nil, err
	}

	test, err := s.openAIService.GenerateTest(lesson, int(req.NumMultipleChoice), int(req.NumFillInTheBlank), int(req.NumShortAnswer), int(req.NumMatchOptions))
	if err != nil {
		return nil, err
	}

	mapQuestionType := func(qType model.QuestionType) *proto.QuestionType {
		switch qType {
		case model.MultipleChoice:
			return &proto.QuestionType{MultipleChoice: "multiple_choice"}
		case model.FillInTheBlank:
			return &proto.QuestionType{FillInTheBlank: "fill_in_the_blank"}
		case model.ShortAnswer:
			return &proto.QuestionType{ShortAnswer: "short_answer"}
		case model.MatchOptions:
			return &proto.QuestionType{MatchOptions: "match_options"}
		default:
			return &proto.QuestionType{MultipleChoice: "multiple_choice"}
		}
	}

	flattenMatches := func(matches [][]string) []string {
		var flat []string
		for _, pair := range matches {
			flat = append(flat, strings.Join(pair, "-"))
		}
		return flat
	}

	protoTest := &proto.Test{
		Id:            uint32(test.ID),
		Title:         test.Title,
		QuestionCount: uint32(test.QuestionCount),
		LessonId:      uint32(test.LessonID),
		Passed:        test.Passed,
	}

	for _, question := range test.Questions {
		protoTest.Questions = append(protoTest.Questions, &proto.Question{
			QuestionText: question.QuestionText,
			Type:         mapQuestionType(question.Type),
			Option:       question.Options,
			Answer:       question.Answer,
			AnswerIndex:  uint32(question.AnswerIndex),
			Matches:      flattenMatches(question.Matches),
		})
	}

	return &proto.GenerateTestResponse{Test: protoTest}, nil
}

func (s *LessonServer) GetAllTopicPlansByUID(ctx context.Context, req *proto.GetAllTopicPlansByUIDRequest) (*proto.GetAllTopicPlansByUIDResponse, error) {
	topicPlans, err := s.topicService.GetAllTopicPlansByUserID(uint(req.UserId))
	if err != nil {
		return nil, err
	}

	var protoTopicPlans []*proto.TopicPlan
	for _, topicPlan := range topicPlans {
		protoTopicPlan := &proto.TopicPlan{
			Id:        uint32(topicPlan.ID),
			Title:     topicPlan.Title,
			UserId:    uint32(topicPlan.UserID),
			Objective: topicPlan.Objective,
			Standard:  topicPlan.Standard,
			Completed: topicPlan.Completed,
		}
		for _, lesson := range topicPlan.Lessons {
			protoLesson := &proto.Lesson{
				Id:          uint32(lesson.ID),
				Title:       lesson.Title,
				TopicPlanId: uint32(lesson.TopicPlanID),
				Objective:   lesson.Objective,
				Information: lesson.Information,
				Completed:   lesson.Completed,
			}
			protoTopicPlan.Lesson = append(protoTopicPlan.Lesson, protoLesson)
		}
		protoTopicPlans = append(protoTopicPlans, protoTopicPlan)
	}

	return &proto.GetAllTopicPlansByUIDResponse{TopicPlans: protoTopicPlans}, nil
}

func (s *LessonServer) GetAllLessonPlansByTopicID(ctx context.Context, req *proto.GetAllLessonPlansByTopicIDRequest) (*proto.GetAllLessonPlansByTopicIDResponse, error) {
	lessons, err := s.lessonService.GetAllLessonsByTopicPlanID(uint(req.TopicPlanId))
	if err != nil {
		return nil, err
	}

	var protoLessons []*proto.Lesson
	for _, lesson := range lessons {
		protoLesson := &proto.Lesson{
			Id:          uint32(lesson.ID),
			Title:       lesson.Title,
			TopicPlanId: uint32(lesson.TopicPlanID),
			Objective:   lesson.Objective,
			Information: lesson.Information,
			Completed:   lesson.Completed,
		}
		protoLessons = append(protoLessons, protoLesson)
	}

	return &proto.GetAllLessonPlansByTopicIDResponse{Lessons: protoLessons}, nil
}

func (s *LessonServer) GetAllTestsByLessonID(ctx context.Context, req *proto.GetAllTestsByLessonIDRequest) (*proto.GetAllTestsByLessonIDResponse, error) {
	tests, err := s.testService.GetAllTestsByLessonID(uint(req.LessonId))
	if err != nil {
		return nil, err
	}

	var protoTests []*proto.Test
	for _, test := range tests {
		protoTest := &proto.Test{
			Id:            uint32(test.ID),
			Title:         test.Title,
			QuestionCount: uint32(test.QuestionCount),
			LessonId:      uint32(test.LessonID),
			Passed:        test.Passed,
		}
		for _, question := range test.Questions {
			protoTest.Questions = append(protoTest.Questions, &proto.Question{
				QuestionText: question.QuestionText,
				Type:         &proto.QuestionType{MultipleChoice: string(question.Type)},
				Option:       question.Options,
				Answer:       question.Answer,
				AnswerIndex:  uint32(question.AnswerIndex),
				Matches:      s.testService.FlattenMatches(question.Matches),
			})
		}
		protoTests = append(protoTests, protoTest)
	}

	return &proto.GetAllTestsByLessonIDResponse{Tests: protoTests}, nil
}

func (s *LessonServer) GetAllQuestionsByTestID(ctx context.Context, req *proto.GetAllQuestionsByTestIDRequest) (*proto.GetAllQuestionsByTestIDResponse, error) {
	test, err := s.testService.GetAllTestQuestionsByID(uint(req.TestId))
	if err != nil {
		return nil, err
	}

	var protoQuestions []*proto.Question
	for _, question := range test.Questions {
		protoQuestion := &proto.Question{
			QuestionText: question.QuestionText,
			Type:         &proto.QuestionType{MultipleChoice: string(question.Type)},
			Option:       question.Options,
			Answer:       question.Answer,
			AnswerIndex:  uint32(question.AnswerIndex),
			Matches:      s.testService.FlattenMatches(question.Matches),
		}
		protoQuestions = append(protoQuestions, protoQuestion)
	}

	return &proto.GetAllQuestionsByTestIDResponse{Questions: protoQuestions}, nil
}

func (s *LessonServer) GradeTest(ctx context.Context, req *proto.GradeTestRequest) (*proto.GradeTestResponse, error) {
	userAnswer := &model.UserAnswers{
		TestID:  uint(req.TestId),
		Answers: req.Answers,
	}

	score, feedback, passed, err := s.testService.GradeTest(*userAnswer)
	if err != nil {
		return nil, err
	}

	protoFeedback := make(map[int32]string)
	for k, v := range feedback {
		protoFeedback[int32(k)] = v
	}

	if passed {
		err = s.lessonService.LessonCompleted(uint(req.LessonId), passed)
		if err != nil {
			return nil, err
		}
		done, err := s.topicService.IsTopicPlanComplete(uint(req.TopicPlanId))
		if err != nil {
			return nil, err
		}
		if done {
			err = s.topicService.UpdateTopicPlanCompleted(uint(req.TopicPlanId), true)
			if err != nil {
				return nil, err
			}
		}
	}

	return &proto.GradeTestResponse{Score: int32(score), Feedback: protoFeedback, Passed: passed}, nil
}

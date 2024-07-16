package service

import (
	"context"
	"encoding/json"
	"fmt"
	"lesson-service/pkg/config"
	"lesson-service/pkg/model"
	"lesson-service/pkg/repository"
	"strings"

	openai "github.com/sashabaranov/go-openai"
)

type OpenAIService struct {
	Config              *config.Config
	client              *openai.Client
	topicPlanRepository *repository.TopicPlanRepository
	lessonRepository    *repository.LessonRepository
	testRepository      *repository.TestRepository
}

func NewOpenAIService(cfg *config.Config, lsnRepository *repository.LessonRepository, tpcRepository *repository.TopicPlanRepository, tstRepository *repository.TestRepository) *OpenAIService {
	apiKey := strings.TrimSpace(cfg.OpenAIKey)
	if apiKey == "" {
		fmt.Println("Error: API key is empty")
		return nil
	}

	client := openai.NewClient(apiKey)
	return &OpenAIService{
		client:              client,
		lessonRepository:    lsnRepository,
		topicPlanRepository: tpcRepository,
		testRepository:      tstRepository,
	}
}

// GenerateQuickResponse generates a quick response to a user's question
func (s *OpenAIService) GenerateQuickResponse(prompt string) (string, error) {
	prompt = fmt.Sprintf("Provide a brief overview for the following topic: %s", prompt)

	resp, err := s.client.CreateCompletion(context.TODO(), openai.CompletionRequest{
		Prompt:      prompt,
		MaxTokens:   150,
		Temperature: 0.7,
	})
	if err != nil {
		return "", err
	}

	return strings.TrimSpace(resp.Choices[0].Text), nil
}

// GenerateTopicPlan generates a topic plan with a specified number of lessons
func (s *OpenAIService) GenerateTopicPlan(prompt string, userID uint, numberOfLessons int) (*model.TopicPlan, error) {
	prompt = fmt.Sprintf("Create a topic plan for the following subject with %d lessons: %s", numberOfLessons, prompt)

	functionDefinition := openai.FunctionDefinition{
		Name: "generate_topic_plan",
		Parameters: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"title": map[string]interface{}{
					"type": "string",
				},
				"objective": map[string]interface{}{
					"type": "string",
				},
				"lessons": map[string]interface{}{
					"type": "array",
					"items": map[string]interface{}{
						"type": "object",
						"properties": map[string]interface{}{
							"title": map[string]interface{}{
								"type": "string",
							},
							"objective": map[string]interface{}{
								"type": "string",
							},
						},
						"required": []string{"title", "objective"},
					},
				},
			},
			"required": []string{"title", "objective", "lessons"},
		},
	}

	requestBody := openai.ChatCompletionRequest{
		Model:       "gpt-4",
		Messages:    []openai.ChatCompletionMessage{{Role: "user", Content: prompt}},
		MaxTokens:   1000,
		Temperature: 0.7,
		Functions:   []openai.FunctionDefinition{functionDefinition},
		FunctionCall: openai.FunctionCall{
			Name: "generate_topic_plan",
		},
	}

	resp, err := s.client.CreateChatCompletion(context.TODO(), requestBody)
	if err != nil {
		return nil, err
	}

	var topicPlanData struct {
		Title     string `json:"title"`
		Objective string `json:"objective"`
		Lessons   []struct {
			Title     string `json:"title"`
			Objective string `json:"objective"`
		} `json:"lessons"`
	}

	err = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &topicPlanData)
	if err != nil {
		return nil, err
	}

	topicPlan := &model.TopicPlan{
		Title:     topicPlanData.Title,
		UserID:    userID,
		Objective: topicPlanData.Objective,
		Standard:  "Standard based on prompt",
	}

	for _, lessonData := range topicPlanData.Lessons {
		lesson := model.Lesson{
			Title:     lessonData.Title,
			Objective: lessonData.Objective,
		}
		topicPlan.Lessons = append(topicPlan.Lessons, lesson)
	}

	err = s.topicPlanRepository.CreateNewTopicPlan(topicPlan)
	if err != nil {
		return nil, err
	}

	return topicPlan, nil
}

// GenerateDetailedLesson generates a detailed lesson based on a basic lesson objective
func (s *OpenAIService) GenerateDetailedLesson(lesson *model.Lesson) (*model.Lesson, error) {
	prompt := fmt.Sprintf("Create a detailed lesson plan for this lesson: '%s' and this objective: %s", lesson.Title, lesson.Objective)

	functionDefinition := openai.FunctionDefinition{
		Name: "generate_detailed_lesson",
		Parameters: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"title": map[string]interface{}{
					"type": "string",
				},
				"objective": map[string]interface{}{
					"type": "string",
				},
				"content": map[string]interface{}{
					"type": "string",
				},
			},
			"required": []string{"title", "objective", "content"},
		},
	}

	requestBody := openai.ChatCompletionRequest{
		Model:       "gpt-4",
		Messages:    []openai.ChatCompletionMessage{{Role: "user", Content: prompt}},
		MaxTokens:   1000,
		Temperature: 0.7,
		Functions:   []openai.FunctionDefinition{functionDefinition},
		FunctionCall: openai.FunctionCall{
			Name: "generate_detailed_lesson",
		},
	}

	resp, err := s.client.CreateChatCompletion(context.TODO(), requestBody)
	if err != nil {
		return nil, err
	}

	var lessonData struct {
		Title     string `json:"title"`
		Objective string `json:"objective"`
		Content   string `json:"content"`
	}

	err = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &lessonData)
	if err != nil {
		return nil, err
	}

	lesson.Title = lessonData.Title
	lesson.Objective = lessonData.Objective
	lesson.Information = lessonData.Content

	err = s.lessonRepository.CreateNewLesson(lesson)
	if err != nil {
		return nil, err
	}

	return lesson, nil
}

// Dynamically generates test based on the number of questions specified for each type.
// Eventually will need to handle short answer grading for tests.
func (s *OpenAIService) GenerateTest(lesson *model.Lesson, numMultipleChoice, numFillInTheBlank, numShortAnswer, numMatchOptions int) (*model.Test, error) {
	prompt := fmt.Sprintf(
		"Create a test with the following number of questions based on the lesson content: %d multiple-choice, %d fill-in-the-blank, %d short answer, and %d match options. Here is the lesson content: %s",
		numMultipleChoice, numFillInTheBlank, numShortAnswer, numMatchOptions, lesson.Information,
	)

	functionDefinition := openai.FunctionDefinition{
		Name: "generate_test",
		Parameters: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"title": map[string]interface{}{
					"type": "string",
				},
				"question_count": map[string]interface{}{
					"type": "integer",
				},
				"questions": map[string]interface{}{
					"type": "array",
					"items": map[string]interface{}{
						"type": "object",
						"properties": map[string]interface{}{
							"question_text": map[string]interface{}{
								"type": "string",
							},
							"type": map[string]interface{}{
								"type": "string",
							},
							"options": map[string]interface{}{
								"type": "array",
								"items": map[string]interface{}{
									"type": "string",
								},
							},
							"answer": map[string]interface{}{
								"type": "string",
							},
							"answer_index": map[string]interface{}{
								"type": "integer",
							},
							"matches": map[string]interface{}{
								"type": "array",
								"items": map[string]interface{}{
									"type": "array",
									"items": map[string]interface{}{
										"type": "string",
									},
								},
							},
						},
						"required": []string{"question_text", "type"},
					},
				},
			},
			"required": []string{"title", "question_count", "questions"},
		},
	}

	requestBody := openai.ChatCompletionRequest{
		Model:       "gpt-4",
		Messages:    []openai.ChatCompletionMessage{{Role: "user", Content: prompt}},
		MaxTokens:   1000,
		Temperature: 0.7,
		Functions:   []openai.FunctionDefinition{functionDefinition},
		FunctionCall: openai.FunctionCall{
			Name: "generate_test",
		},
	}

	resp, err := s.client.CreateChatCompletion(context.TODO(), requestBody)
	if err != nil {
		return nil, err
	}

	var testData struct {
		Title         string `json:"title"`
		QuestionCount uint   `json:"question_count"`
		Questions     []struct {
			QuestionText string     `json:"question_text"`
			Type         string     `json:"type"`
			Options      []string   `json:"options,omitempty"`
			Answer       string     `json:"answer,omitempty"`
			AnswerIndex  int        `json:"answer_index,omitempty"`
			Matches      [][]string `json:"matches,omitempty"`
		} `json:"questions"`
	}

	err = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &testData)
	if err != nil {
		return nil, err
	}

	questions := make([]model.Question, len(testData.Questions))

	for i, q := range testData.Questions {
		questions[i] = model.Question{
			QuestionText: q.QuestionText,
			Type:         model.QuestionType(q.Type),
			Options:      q.Options,
			Answer:       q.Answer,
			AnswerIndex:  q.AnswerIndex,
			Matches:      q.Matches,
		}
	}

	test := &model.Test{
		Title:         testData.Title,
		QuestionCount: testData.QuestionCount,
		Questions:     questions,
		LessonID:      lesson.ID,
	}

	err = s.testRepository.CreateNewTest(test)
	if err != nil {
		return nil, err
	}

	return test, nil
}

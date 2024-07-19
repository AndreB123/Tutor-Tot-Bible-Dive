package main

import (
	"lesson-service/pkg/config"
	"lesson-service/pkg/interceptors"
	"lesson-service/pkg/model"
	"lesson-service/pkg/proto"
	"lesson-service/pkg/repository"
	"lesson-service/pkg/server"
	"lesson-service/pkg/service"
	"log"
	"net"

	"google.golang.org/grpc"
)

func main() {
	cfg := config.LoadConfig()

	db, err := repository.NewDB(cfg)
	if err != nil {
		log.Fatalf("Failed to init db: %v", err)
	}
	lis, err := net.Listen("tcp", ":8085")
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer(grpc.UnaryInterceptor(
		interceptors.NewUnaryInterceptor(cfg.AccessSecret)),
		grpc.StreamInterceptor(interceptors.NewStreamInterceptor(cfg.AccessSecret)),
	)

	topicPlanRepo := repository.NewTopicPlanRepository(db)
	lessonRepo := repository.NewLessonRepository(db)
	testRepo := repository.NewTestRepository(db)

	err = db.AutoMigrate(&model.TopicPlan{}, &model.Lesson{}, &model.Test{}, &model.Question{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate: %v", err)
	}

	openAIService := service.NewOpenAIService(cfg, lessonRepo, topicPlanRepo, testRepo)
	lessonService := service.NewLessonService(lessonRepo)
	topicPlanService := service.NewTopicPlanService(topicPlanRepo, lessonService)
	testService := service.NewTestService(testRepo, openAIService)

	lessonServer := server.NewLessonServer(topicPlanService, lessonService, testService, openAIService)

	proto.RegisterLessonServiceServer(grpcServer, lessonServer)

	log.Println("gRPC server is listening on ", lis.Addr())
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}

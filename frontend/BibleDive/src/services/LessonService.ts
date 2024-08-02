import { Lesson } from "../models/LessonModels";
import { IWebSocketService } from "./WebSocketService";

class LessonService {
    constructor(
        private webSocketService: IWebSocketService,
        private onLessonsGenerated: (lessons: Lesson[]) => void,
        private onLessonsFetched: (lessons: Lesson[]) => void
    ) {
        this.registerMessageHandlers();
    }

    async generateLessons(topicPlanID: number, jwt: string): Promise<any> {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "lesson",
            Action: "generate_lessons",
            JWT: jwt,
            Data: {
                topic_plan_id: topicPlanID
            }
        });
        console.log("Sending generate_lessons message:", message);
        this.webSocketService.sendMessage(message);
    
        return new Promise((resolve, reject) => {
            const handleMessage = (response: any) => {
                if (response.action === "generate_lessons_resp" && response.data) {
                    const lessons = response.data.lessons;
                    this.onLessonsGenerated(lessons);
                    resolve(lessons);
                } else {
                    reject(new Error("Failed to generate lessons"));
                }
            };
            this.webSocketService.registerMessageHandler("generate_lessons_resp", handleMessage);
        });
    }

    async getLessonByID(topicPlanID: number, lessonID: number, jwt: string): Promise<Lesson | null> {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "lesson",
            Action: "get_lesson_by_id",
            JWT: jwt,
            Data: {
                topic_plan_id: topicPlanID,
                lesson_id: lessonID
            }
        });
        console.log("Sending get_lesson_by_id message:", message);
        this.webSocketService.sendMessage(message);
    
        return new Promise((resolve, reject) => {
            const handleMessage = (response: any) => {
                if (response.action === "get_lesson_by_id_resp" && response.data) {
                    const lesson = response.data.lesson;
                    resolve(lesson);
                } else {
                    reject(new Error("Failed to get lesson by ID"));
                }
            };
            this.webSocketService.registerMessageHandler("get_lesson_by_id_resp", handleMessage);
        });
    }

    async getAllLessonsByTopicID(topicPlanID: number, jwt: string) {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "lesson",
            Action: "get_all_lessons_by_topic_id",
            JWT: jwt,
            Data: {
                topic_plan_id: topicPlanID
            }
        });
        console.log("Sending get_all_lessons_by_topic_id message:", message);
        this.webSocketService.sendMessage(message);
    }

    private registerMessageHandlers() {
        this.webSocketService.registerMessageHandler("generate_lessons_resp", this.handleLessonsGenerated);
        this.webSocketService.registerMessageHandler("get_all_lessons_by_topic_id_resp", this.handleLessonsFetched);
    }

    private handleLessonsGenerated = (message: any) => {
        console.log("Handling lessons generated:", message);
        const lessons = message.data.lessons;
        this.onLessonsGenerated(lessons);
    }

    private handleLessonsFetched = (message: any) => {
        console.log("Handling lessons fetched:", message);
        const lessons = message.data.lessons;
        this.onLessonsFetched(lessons);
    }
}

export default LessonService;

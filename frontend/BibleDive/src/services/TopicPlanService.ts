import { TopicPlan } from "../models/TopicPlanModels";
import { IWebSocketService } from "./WebSocketService";

class TopicPlanService {
    constructor(
        private webSocketService: IWebSocketService,
        private onTopicPlanGenerated: (topicPlan: any) => void,
        private onTopicPlansFetched: (topicPlans: any) => void,
        private onTopicPlanOverviewGenerated: (overview: any) => void,
        private onTopicPlanFetched: (topicPlan: any) => void,
    ) {
        this.registerMessageHandlers();
    }

    async generateTopicPlan(userID: string, prompt: string, numberOfLessons: number, jwt: string): Promise<any> {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "lesson",
            Action: "generate_topic_plan",
            JWT: jwt,
            Data: {
                user_id: userID,
                prompt: prompt,
                number_of_lessons: numberOfLessons
            }
        });
        console.log("Sending generate_topic_plan message:", message);
        this.webSocketService.sendMessage(message);
    
        // Implement a promise to wait for the response
        return new Promise((resolve, reject) => {
            const handleMessage = (response: any) => {
                if (response.action === "generate_topic_plan_resp" && response.data) {
                    const topicPlan = response.data.topic_plan;
    
                    // Ensure lessons are included and properly formatted
                    const formattedTopicPlan: TopicPlan = {
                        id: topicPlan.id,
                        title: topicPlan.title,
                        objective: topicPlan.objective,
                        standard: topicPlan.standard,
                        lessons: topicPlan.lesson.map((lesson: any) => ({
                            id: lesson.id,
                            title: lesson.title,
                            objective: lesson.objective,
                            completed: false,  // or set appropriately based on your logic
                        })),
                        completed: false,  // or set appropriately based on your logic
                    };
    
                    this.onTopicPlanGenerated(formattedTopicPlan);
                    resolve(formattedTopicPlan);
                } else {
                    reject(new Error("Failed to generate topic plan"));
                }
            };
            this.webSocketService.registerMessageHandler("generate_topic_plan_resp", handleMessage);
        });
    }
    

    async getAllTopicPlansByUID(userID: string, jwt: string) {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "lesson",
            Action: "get_all_topic_plans_by_uid",
            JWT: jwt,
            Data: {
                user_id: userID
            }
        });
        console.log("Sending get_all_topic_plans_by_uid message:", message);
        this.webSocketService.sendMessage(message);
    }

    async generateTopicPlanOverview(userID: string, prompt: string, jwt: string) {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "lesson",
            Action: "generate_topic_plan_overview",
            JWT: jwt,
            Data: {
                user_id: userID,
                prompt: prompt
            }
        });
        console.log("Sending generate_topic_plan_overview message:", message);
        this.webSocketService.sendMessage(message);
    }

    async getTopicPlanByID(topicPlanID: string, jwt: string): Promise<any> {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "lesson",
            Action: "get_topic_plan_by_id",
            JWT: jwt,
            Data: {
                topic_plan_id: topicPlanID
            }
        });
        console.log("Sending get_topic_plan_by_id message:", message);
        this.webSocketService.sendMessage(message);
    
        // Implement a promise to wait for the response
        return new Promise((resolve, reject) => {
            const handleMessage = (response: any) => {
                if (response.action === "get_topic_plan_by_id_resp" && response.data) {
                    const topicPlan = response.data.topic_plan;
                    this.onTopicPlanFetched(topicPlan);
                    resolve(topicPlan);
                } else {
                    reject(new Error("Failed to fetch topic plan by ID"));
                }
            };
            this.webSocketService.registerMessageHandler("get_topic_plan_by_id_resp", handleMessage);
        });
    }

    private registerMessageHandlers() {
        this.webSocketService.registerMessageHandler("generate_topic_plan_resp", this.handleTopicPlanGenerated);
        this.webSocketService.registerMessageHandler("get_all_topic_plans_by_uid_resp", this.handleTopicPlansFetched);
        this.webSocketService.registerMessageHandler("generate_topic_plan_overview_resp", this.handleTopicPlanOverviewGenerated);
        this.webSocketService.registerMessageHandler("get_topic_plan_by_id_resp", this.handleTopicPlanFetched);
    }

    private handleTopicPlanGenerated = (message: any) => {
        console.log("Handling topic plan generated:", message);
        const topicPlan = message.data.topic_plan;
        this.onTopicPlanGenerated(topicPlan);
    }

    private handleTopicPlansFetched = (message: any) => {
        console.log("Handling topic plans fetched:", message);
        const topicPlans = message.data.topic_plans;
        this.onTopicPlansFetched(topicPlans);
    }

    private handleTopicPlanOverviewGenerated = (message: any) => {
        console.log("Handling topic plan overview generated:", message);
        const overview = message.data.response;
        this.onTopicPlanOverviewGenerated(overview);
    }

    private handleTopicPlanFetched = (message: any) => {
        console.log("Handling topic plan fetched:", message);
        const topicPlan = message.data.topic_plan;
        this.onTopicPlanFetched(topicPlan);
    }
}

export default TopicPlanService;

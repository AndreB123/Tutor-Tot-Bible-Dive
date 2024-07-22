import { IWebSocketService } from "./WebSocketService";

class TopicPlanService {
    constructor(
        private webSocketService: IWebSocketService,
        private onTopicPlanGenerated: (topicPlan: any) => void,
        private onTopicPlansFetched: (topicPlans: any) => void,
        private onTopicPlanOverviewGenerated: (overview: any) => void,
    ) {
        this.registerMessageHandlers();
    }

    async generateTopicPlan(topicPlanID: number, numberOfLessons: number, jwt: string) {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "lesson",
            Action: "generate_topic_plan",
            JWT: jwt,
            Data: {
                topic_plan_id: topicPlanID,
                number_of_lessons: numberOfLessons
            }
        });
        console.log("Sending generate_topic_plan message:", message);
        this.webSocketService.sendMessage(message);
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

    private registerMessageHandlers() {
        this.webSocketService.registerMessageHandler("generate_topic_plan_resp", this.handleTopicPlanGenerated);
        this.webSocketService.registerMessageHandler("get_all_topic_plans_by_uid_resp", this.handleTopicPlansFetched);
        this.webSocketService.registerMessageHandler("generate_topic_plan_overview_resp", this.handleTopicPlanOverviewGenerated);
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
}

export default TopicPlanService;

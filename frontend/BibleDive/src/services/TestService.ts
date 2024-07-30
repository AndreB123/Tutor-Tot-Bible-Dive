import { Test } from "../models/TestModels";
import { IWebSocketService } from "./WebSocketService";

class TestService {
    constructor(
        private webSocketService: IWebSocketService,
        private onTestGenerated: (test: Test) => void
    ) {
        this.registerMessageHandlers();
    }

    async generateTest(lessonID: number, numMultipleChoice: number, numFillInTheBlank: number, numShortAnswer: number, numMatchOptions: number, jwt: string): Promise<any> {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "test",
            Action: "generate_test",
            JWT: jwt,
            Data: {
                lesson_id: lessonID,
                num_multiple_choice: numMultipleChoice,
                num_fill_in_the_blank: numFillInTheBlank,
                num_short_answer: numShortAnswer,
                num_match_options: numMatchOptions
            }
        });
        console.log("Sending generate_test message:", message);
        this.webSocketService.sendMessage(message);

        return new Promise((resolve, reject) => {
            const handleMessage = (response: any) => {
                if (response.action === "generate_test_resp" && response.data) {
                    const test = response.data.test;
                    this.onTestGenerated(test);
                    resolve(test);
                } else {
                    reject(new Error("Failed to generate test"));
                }
            };
            this.webSocketService.registerMessageHandler("generate_test_resp", handleMessage);
        });
    }

    private registerMessageHandlers() {
        this.webSocketService.registerMessageHandler("generate_test_resp", this.handleTestGenerated);
    }

    private handleTestGenerated = (message: any) => {
        console.log("Handling test generated:", message);
        const test = message.data.test;
        this.onTestGenerated(test);
    }
}

export default TestService;

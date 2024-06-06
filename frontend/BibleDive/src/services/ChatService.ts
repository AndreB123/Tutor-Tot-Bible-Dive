import { IWebSocketService } from "./WebSocketService";

class ChatService {
    constructor(
        private webSocketService: IWebSocketService, 
        private onMessageFragment: (message: any) => void,
        private onMessageComplete: (message: any) => void,
        private onGetChatSummaries: (message: any) => void,
    ) {
        this.registerMessageHandlers();
    }

    async sendChatMessage(chatID: number, userID: string, body: string, jwt: string) {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "chat",
            Action: "start_message_stream",
            JWT: jwt,
            Data: {
                chat_id: chatID,
                sender: userID,
                body: body
            }
        });
        console.log("Sending chat message:", message);
        this.webSocketService.sendMessage(message);
    }

    async getChatSummaries(id: string, jwt: string) {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "chat",
            Action: "get_chat_summaries",
            JWT: jwt,
            Data: {
                id: id
            }
        });
        console.log("Requesting chat summaries:", message);
        this.webSocketService.sendMessage(message);
    }

    private registerMessageHandlers() {
        this.webSocketService.registerMessageHandler("message_fragment", this.handleMessageFragment);
        this.webSocketService.registerMessageHandler("message_complete", this.handleMessageComplete);
        this.webSocketService.registerMessageHandler("get_chat_summaries_respo", this.handleGetChatSummaries);
    }


    private handleMessageFragment = (message: any) => {
        console.log("Handling message fragment:", message);
        const msgContents = message.data.message;
        this.onMessageFragment(msgContents);
    }

    private handleMessageComplete = (message: any) => {
        console.log("Message stream complete");
        if (message?.data?.message) {
            this.onMessageComplete(message.data.message);
        } else {
            console.log("Received message_complete");
        }
    }

    private handleGetChatSummaries = (message: any) => {
        console.log("chat sums handled:", message);
        const msgContents = message.data.chats;
        this.onGetChatSummaries(msgContents);
    }
    
}

export default ChatService;
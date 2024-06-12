import { IWebSocketService } from "./WebSocketService";

class ChatService {
    constructor(
        private webSocketService: IWebSocketService, 
        private onMessageFragment: (message: any) => void,
        private onMessageComplete: (message: any) => void,
        private onGetChatSummaries: (message: any) => void,
        private onGetRecentMessages: (message: any) => void,
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
        console.log("Requesting chat summaries: ", message);
        this.webSocketService.sendMessage(message);
    }

    async getRecentChatMessages(chatId: number, lastMessageId: number, jwt: string, ) {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "chat",
            Action: "get_recent_messages",
            JWT: jwt,
            Data: {
                chat_id: chatId,
                last_message_id: lastMessageId,
                limit: 15,
            }
        });
        console.log("Requesting recent messages: ", message);
        this.webSocketService.sendMessage(message);
    }

    private registerMessageHandlers() {
        this.webSocketService.registerMessageHandler("message_fragment", this.handleMessageFragment);
        this.webSocketService.registerMessageHandler("message_complete", this.handleMessageComplete);
        this.webSocketService.registerMessageHandler("get_chat_summaries_resp", this.handleGetChatSummaries);
        this.webSocketService.registerMessageHandler("get_recent_messages_resp", this.handleGetRecentMessages);
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
        console.log("Chat sums handled:", message);
        const msgContents = message.data.chats;
        this.onGetChatSummaries(msgContents);
    }

    private handleGetRecentMessages = (message: any) => {
        console.log("Handling get recent messages response: ", message);
        this.onGetRecentMessages(message);
    }
    
}

export default ChatService;
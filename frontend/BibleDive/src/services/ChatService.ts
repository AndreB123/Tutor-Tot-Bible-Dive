import { IWebSocketService } from "./WebSocketService";

class ChatService {
    constructor(
        private webSocketService: IWebSocketService,
        private onGetChatSummaries: (message: any) => void,
        private onGetRecentMessages: (message: any) => void
    ) {
        this.registerMessageHandlers();
    }

    async getChatSummaries(userID: string, jwt: string) {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "chat",
            Action: "get_chat_summaries",
            JWT: jwt,
            Data: {
                id: userID
            }
        });
        console.log("Requesting chat summaries: ", message);
        this.webSocketService.sendMessage(message);
    }

    async getRecentMessages(chatId: number, lastMessageId: number, jwt: string) {
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
        this.webSocketService.registerMessageHandler("get_chat_summaries_resp", this.handleGetChatSummaries);
        this.webSocketService.registerMessageHandler("get_recent_messages_resp", this.handleGetRecentMessages);
    }

    private handleGetChatSummaries = (message: any) => {
        console.log("Chat summaries handled:", message);
        const msgContents = message.data.chats;
        this.onGetChatSummaries(msgContents);
    }

    private handleGetRecentMessages = (message: any) => {
        console.log("Handling get recent messages response: ", message);
        const msgContents = message.data.messages;
        this.onGetRecentMessages(msgContents);
    }
}

export default ChatService;

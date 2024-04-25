import { IWebSocketService } from "./WebSocketService";

class ChatService {
    constructor(private webSocketService: IWebSocketService) {
        this.registerMessageHandlers();
    }

    async sendChatMessage(chatID: string, userID: string, body: string, jwt: string) {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "chat",
            Action: "start_message_stream",
            JWT: jwt,
            Data: {
                chatID: chatID,
                sender: userID,
                body: body
            }
        });

        this.webSocketService.sendMessage(message);
    }

    private registerMessageHandlers() {
        this.webSocketService.registerMessageHandler("get_user_info_resp", this.handleSendMessage);
    }

    private handleSendMessage = (message: any) => {
        const msg = message.data
    }

    getChatSummaries(jwt: string) {
        const message = JSON.stringify({
            Type: "chat",
            Action: "get_chat_summaries",
            JWT: jwt,
            Data: {}
        });
        this.webSocketService.sendMessage(message);
    }
}

export default ChatService;
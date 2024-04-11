import { IWebSocketService } from "./WebSocketService";

class ChatService {
    constructor(private webSocketService: IWebSocketService) {}

    sendMessage(chatID: string, userID: string, body: string) {
        const message = JSON.stringify({
            action: "sendMessage",
            chatID: chatID,
            sender: userID,
            body: body
        });

        this.webSocketService.sendMessage(message);
    }

    getChatSummaries() {
        const message = {
            action: 'GetChatSummariesUID',
        };
        this.webSocketService.sendMessage(JSON.stringify(message));
    }
}

export default ChatService;
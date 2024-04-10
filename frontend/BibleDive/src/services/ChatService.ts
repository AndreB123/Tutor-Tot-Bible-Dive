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
}
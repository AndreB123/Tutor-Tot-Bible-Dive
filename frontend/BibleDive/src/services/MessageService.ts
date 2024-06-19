import { IWebSocketService } from "./WebSocketService";

class MessageService {
    constructor(
        private webSocketService: IWebSocketService, 
        private onMessageFragment: (message: any) => void,
        private onMessageComplete: () => void,
    ) {
        this.registerMessageHandlers();
    }

    async sendMessage(chatID: number, userID: string, body: string, jwt: string) {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "chat",
            Action: "start_message_stream",
            JWT: jwt,
            Data: {
                chat_id: chatID,
                sender: userID.toString(),
                body: body
            }
        });
        console.log("Sending chat message:", message);
        this.webSocketService.sendMessage(message);
    }

    private registerMessageHandlers() {
        this.webSocketService.registerMessageHandler("message_fragment", this.handleMessageFragment);
        this.webSocketService.registerMessageHandler("message_complete", this.handleMessageComplete);
    }

    private handleMessageFragment = (message: any) => {
        console.log("Handling message fragment:", message);
        const msgContents = message.data.message;
        this.onMessageFragment(msgContents);
    }

    private handleMessageComplete = (message: any) => {
        console.log("Message stream complete");
        this.onMessageComplete();
    }
}

export default MessageService;

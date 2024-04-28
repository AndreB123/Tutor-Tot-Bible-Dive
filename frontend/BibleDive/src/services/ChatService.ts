import { IWebSocketService } from "./WebSocketService";

class ChatService {
    constructor(private webSocketService: IWebSocketService, 
        private onMessageFragment: (message: any) => void,
        private onMessageComplete: (message: any) => void) {

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
                sender: userID.toString(),
                body: body
            }
        });

        this.webSocketService.sendMessage(message);
    }

    private registerMessageHandlers() {
        this.webSocketService.registerMessageHandler("message_fragment", this.handleMessageFragment);
        this.webSocketService.registerMessageHandler("message_complete", this.handleMessageComplete);
    }

    private handleMessageFragment = (message: any) => {
        const msgContents = message.data;
        this.onMessageFragment(msgContents);
    }

    private handleMessageComplete = (message: any) => {
        console.log("Message stream complete for chat ID:", message.chatID);
        this.onMessageComplete(message)
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
import  { IWebSocketService } from "./WebSocketService";

class UserService {
    constructor(private webSocketService: IWebSocketService) {}

    getUserDetails(userId: string) {
        const message = JSON.stringify({
            action: "getUserDetails",
            userId: userId
        });

        this.webSocketService.sendMessage(message);
    }
}

export default UserService;
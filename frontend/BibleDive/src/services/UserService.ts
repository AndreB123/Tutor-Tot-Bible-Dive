import  { IWebSocketService } from "./WebSocketService";

class UserService {
    constructor(private webSocketService: IWebSocketService) {}

    getUserDetails(userID: string) {
        const message = JSON.stringify({
            action: "getUserDetails",
            userId: userID
        });

        this.webSocketService.sendMessage(message);
    }
}

export default UserService;
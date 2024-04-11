import  { IWebSocketService } from "./WebSocketService";

class UserService {
    constructor(private webSocketService: IWebSocketService) {
        this.registerMessageHandlers();
    }

    getUserDetails(userID: string) {
        const message = JSON.stringify({
            action: "getUserDetails",
            userId: userID
        });

        this.webSocketService.sendMessage(message);
    }

    private registerMessageHandlers() {
        this.webSocketService.registerMessageHandler("userDetailsResponse", this.handleUserDetailsResponse);
    }

    private handleUserDetailsResponse = (message: any) => {
        const userDetails = message.userDetails;
        console.log("Received user details:", userDetails);
        //TODO update usercontext
    }
}

export default UserService;
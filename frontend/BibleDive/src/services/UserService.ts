import  { IWebSocketService } from "./WebSocketService";

class UserService {
    constructor(private webSocketService: IWebSocketService, private onUpdateUser: (user: any) => void) {
        this.registerMessageHandlers();
    }

    async getUserDetails(id: string, jwt: string) {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "user",
            Action: "get_user_info",
            JWT: jwt,
            Data: {
                id: id
            }
        });
        console.log("message called ")
        this.webSocketService.sendMessage(message);
    }

    private registerMessageHandlers() {
        this.webSocketService.registerMessageHandler("get_user_info_resp", this.handleUserDetailsResponse);
    }

    private handleUserDetailsResponse = (message: any) => {
        const userDetails = message.data;
        console.log("Received user details:", userDetails);
    
        if (userDetails) {
            this.onUpdateUser(userDetails);
        } else {
            console.error("User details were not found in the message:", message);
        }
    }
    
}

export default UserService;
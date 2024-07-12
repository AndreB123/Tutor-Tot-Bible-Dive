import  { IWebSocketService } from "./WebSocketService";

class UserService {
    constructor(
        private webSocketService: IWebSocketService, 
        private onUpdateUser: (user: any) => void,
        private onUpdatePassword: (password: any) => void,
        private onVerifyPassword: (password: any) => void,
        private onDeleteUser: (password: any) => void,
    ) {
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
        console.log("Get User Details message called")
        this.webSocketService.sendMessage(message);
    }

    async updatePassword(id: number, password: string, jwt: string) {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "user",
            Action: "update_user_pass",
            JWT: jwt,
            Data: {
                id: id,
                password: password
            }
        });
        console.log("Update Password message called")
        this.webSocketService.sendMessage(message);
    }

    async verifyPassword(id: number, password: string, jwt: string) {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "user",
            Action: "verify_user_pass",
            JWT: jwt,
            Data: {
                id: id,
                password: password
            }
        });
        console.log("Verify Password message called")
        this.webSocketService.sendMessage(message);
    }

    async deleteUser(id: number, password: string, jwt: string) {
        await this.webSocketService.onConnected;
        const message = JSON.stringify({
            Type: "user",
            Action: "delete_user",
            JWT: jwt,
            Data: {
                id: id,
                password: password
            }
        });
        console.log("Delete User message called")
        this.webSocketService.sendMessage(message);
    }

    private registerMessageHandlers() {
        this.webSocketService.registerMessageHandler("get_user_info_resp", this.handleUserDetailsResponse);
        this.webSocketService.registerMessageHandler("update_user_pass_resp", this.handleUpdatePasswordResponse);
        this.webSocketService.registerMessageHandler("verify_user_pass_resp", this.handleVerifyPasswordResponse);
        this.webSocketService.registerMessageHandler("delete_user_resp", this.handleDeleteUserResponse);
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

    private handleUpdatePasswordResponse = (message: any) => {
        console.log("handling Update Password response: ", message);
        const msgContents = message.data.success;
        this.onUpdatePassword(msgContents);
    }

    private handleVerifyPasswordResponse = (message: any) => {
        console.log("handling Verify Password response: ", message);
        const msgContents = message.data.isAuthorized;
        this.onVerifyPassword(msgContents);
    }
    
    private handleDeleteUserResponse = (message: any) => {
        console.log("handling Delete User response: ", message);
        const msgContents = message.data.success;
        this.onDeleteUser(msgContents);
    }
}

export default UserService;
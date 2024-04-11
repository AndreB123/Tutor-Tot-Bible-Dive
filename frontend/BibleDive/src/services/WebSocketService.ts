export interface IWebSocketService {
    sendMessage(message: string): void;
    connect(url: string): void;
    disconnect(): void;
    registerMessageHandler(action: string, handler: (message: any) => void): void;
}

class WebSocketService implements IWebSocketService {
    websocket: WebSocket | null = null;
    messageHandlers: Record<string, (meesage: any) => void> = {};

    connect(url: string) {
        this.websocket = new WebSocket(url);

        this.websocket.onopen = () => {
            console.log("WebSocket Connection Established");           
        };

        this.websocket.onmessage = (e) => {
            const message = JSON.parse(e.data);
            const handler = this.messageHandlers[message.action];
            if (handler) {
                handler(message);
            }
        };

        this.websocket.onerror = (e) => {
            console.error("WebSocket error: ", e);
        };

        this.websocket.onclose = (e) => {
            console.log("WebSocket connection closed: ", e.reason);
            this.websocket = null;
        };
    }

    registerMessageHandler(action: string, handler: (message: any) => void) {
        this.messageHandlers[action] = handler;
    }

    sendMessage(message: string) {
        if (this.websocket) {
            this.websocket.send(message);
        }
    }

    disconnect() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
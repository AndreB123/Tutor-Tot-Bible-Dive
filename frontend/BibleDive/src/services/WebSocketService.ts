export interface IWebSocketService {
    sendMessage(message: string): void;
    connect(url: string): void;
    disconnect(): void;
}

class WebSocketService implements IWebSocketService {
    websocket: WebSocket | null = null;

    connect(url: string) {
        this.websocket = new WebSocket(url);

        this.websocket.onopen = () => {
            console.log("WebSocket Connection Established");           
        };

        this.websocket.onmessage = (e) => {
            console.log(e.data);
        };

        this.websocket.onerror = (e) => {
            console.error("WebSocket error: ", e);
        };

        this.websocket.onclose = (e) => {
            console.log("WebSocket connection closed: ", e.reason);
            this.websocket = null;
        };
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
export interface IWebSocketService {
    sendMessage(message: string): void;
    connect(url: string): void;
    disconnect(): void;
    registerMessageHandler(action: string, handler: (message: any) => void): void;
    onConnected: Promise<void>;  
}

class WebSocketService implements IWebSocketService {
    websocket: WebSocket | null = null;
    messageHandlers: Record<string, (meesage: any) => void> = {};
    onConnected: Promise<void>;
    private resolveConnection: () => void;
    private messageQueue: string[] = [];


    constructor() {
        this.onConnected = new Promise(resolve => {
            this.resolveConnection = resolve;
        });
    }

    connect(url: string) {
        if (this.websocket) {
            this.disconnect(); 
        }
        this.websocket = new WebSocket(url);
    
        this.websocket.onopen = () => {
            console.log("WebSocket Connection Established");
            this.resolveConnection();
            this.onConnected.then(() => {
                this.flushMessageQueue(); 
            });
        };

        this.websocket.onmessage = (e) => {
            console.log("Received message from server:", e.data);
            const message = JSON.parse(e.data);
            const handler = this.messageHandlers[message.action];
            if (handler) {
                handler(message);
            }
        };

        this.websocket.onerror = (e) => {
            console.error("WebSocket error: ", e);
            this.websocket = null; 
        };

        this.websocket.onclose = (e) => {
            console.log("WebSocket connection closed: ", e.reason);
            this.websocket = null;
        };
    }

    registerMessageHandler(action: string, handler: (message: any) => void) {
        this.messageHandlers[action] = handler;
    }

    sendMessage(message: string, isQueued: boolean = false) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(message);
        } else {
            if (!isQueued) {
                console.log("Queuing message as WebSocket is not yet connected.");
                this.messageQueue.push(message);
            } else {
                console.log("Skipping re-queue of message, as connection is not ready yet.");
            }
        }
    }

    disconnect() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    }

    private flushMessageQueue() {
        setTimeout(() => {
        console.log("Flushing message queue with " + this.messageQueue.length + " messages.");
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message) {
                this.sendMessage(message, true);
            }
        }
        }, 2);
         
        
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
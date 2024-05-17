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
    private shouldReconnect: boolean = true;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5; 


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
        this.shouldReconnect = true;
    
        this.websocket.onopen = () => {
            console.log("WebSocket Connection Established");
            this.reconnectAttempts = 0;
            this.resolveConnection();   
            this.flushMessageQueue(); 
            
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
            if (e.reason.includes('401')) {
                this.shouldReconnect = false;
                return
            }

            if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                setTimeout(() => {
                    this.connect(url);
                }, 1000); // Reconnect after 1 second
            }
        };
    }

    registerMessageHandler(action: string, handler: (message: any) => void) {
        this.messageHandlers[action] = handler;
    }

    sendMessage(message: string, isQueued: boolean = false) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            console.log("Sending message:", message);
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
            this.shouldReconnect = false;
            this.websocket.close();
            this.websocket = null;
        }
    }

    private flushMessageQueue() {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            console.log("Flushing message queue with " + this.messageQueue.length + " messages.");
            while (this.messageQueue.length > 0) {
                const message = this.messageQueue.shift();
                if (message) {
                    this.sendMessage(message, true);
                }
            }
        } else {
            console.log("Cannot flush message queue, WebSocket is not open.");
        }
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
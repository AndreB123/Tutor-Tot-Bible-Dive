class WebSocketService {
    websocket: WebSocket | null = null;

    contect(url: string) {
        this.websocket = new WebSocket(url);

        this.websocket.onopen = () => {
            console.log("WebSocket Connection Established");
            //            
        }
    }
}
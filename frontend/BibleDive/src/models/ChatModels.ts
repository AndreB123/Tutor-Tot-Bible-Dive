export interface Message {
    id: number | null;
    chat_id: number;
    sender: string;
    body: string;
    created_at: Date;
}

export interface Chat {
    id: number;
    name: string;
    messages: Message[];
}


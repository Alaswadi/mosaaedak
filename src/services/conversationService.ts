import { api } from './api';

export interface Conversation {
    phoneNumber: string;
    lastMessage: string;
    lastMessageAt: string;
    direction: 'INBOUND' | 'OUTBOUND';
}

export interface Message {
    id: string;
    direction: 'INBOUND' | 'OUTBOUND';
    content: string;
    createdAt: string;
    fromPhone?: string;
    toPhone?: string;
}

export const conversationService = {
    getConversations: async (): Promise<Conversation[]> => {
        const response = await api.get<{ conversations: Conversation[] }>('/conversations');
        return response.conversations;
    },

    getMessages: async (phoneNumber: string): Promise<Message[]> => {
        const response = await api.get<{ messages: Message[] }>(`/conversations/${phoneNumber}/messages`);
        return response.messages;
    }
};

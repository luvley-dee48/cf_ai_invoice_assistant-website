import { authenticatedFetch } from './auth';

// Types
export interface ChatMessage {
  id: string;
  from: 'user' | 'ai';
  text: string;
  timestamp: string;
  attachments?: Array<{
    type: 'image' | 'document';
    name: string;
    url: string;
    size: number;
  }>;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatContext {
  goal?: string;
  cv?: string;
  contacts?: string[];
  events?: string[];
}

// Chat API functions
export const createConversation = async (title: string): Promise<Conversation> => {
  return authenticatedFetch('/chat/conversation', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
};

export const getConversations = async (): Promise<Conversation[]> => {
  return authenticatedFetch('/chat/conversation', {
    method: 'GET',
  });
};

export const sendMessage = async (
  conversationId: string,
  message: string,
  attachments?: File[]
): Promise<ChatMessage> => {
  const formData = new FormData();
  formData.append('message', message);
  formData.append('conversationId', conversationId);
  
  if (attachments) {
    attachments.forEach((file, index) => {
      formData.append(`attachment_${index}`, file);
    });
  }

  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/chat/message`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  return response.json();
};

export const getChatMemory = async (): Promise<ChatContext> => {
  return authenticatedFetch('/chat/memory', {
    method: 'GET',
  });
};

export const updateChatContext = async (context: Partial<ChatContext>): Promise<ChatContext> => {
  return authenticatedFetch('/chat/context', {
    method: 'PUT',
    body: JSON.stringify(context),
  });
};

// React Query hooks
export const useSendMessage = () => {
  return {
    mutateAsync: sendMessage,
  };
};

export const useChatMemory = () => {
  return {
    getMemory: getChatMemory,
    updateContext: updateChatContext,
  };
};

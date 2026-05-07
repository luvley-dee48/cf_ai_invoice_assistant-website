import { authenticatedFetch } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  from: 'user' | 'ai';
  text: string;
  timestamp: string;
  attachments?: Array<{
    type: 'image' | 'document';
    name: string;
    url?: string;
    size?: number;
  }>;
}

export interface Conversation {
  id: string;
  title?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  lastMessage?: string;
}

export interface ChatContext {
  goal?: string;
  cv?: string;
  contacts?: string[];
  events?: string[];
  [key: string]: unknown;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string | null;
  conversationId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Memory {
  id: string;
  title: string;
  conversationId: string;
  content: ChatMessage[];
  tags: string[];
  createdAt: string;
}

// ── Conversation ──────────────────────────────────────────────────────────────

export const createConversation = async (conversationId?: string): Promise<Conversation> => {
  return authenticatedFetch('/chat/conversation', {
    method: 'POST',
    body: JSON.stringify({ conversationId }),
  });
};

export const getConversations = async (): Promise<Conversation[]> => {
  return authenticatedFetch('/chat/conversation', { method: 'GET' });
};

// ── Messaging ─────────────────────────────────────────────────────────────────

/**
 * Send a message and return the AI reply as a ChatMessage.
 * Sends JSON (not FormData) — the backend expects application/json.
 * Files are base64-encoded inline so they travel in the same request body.
 */
export const sendMessage = async (
  conversationId: string,
  message: string,
  attachments?: File[]
): Promise<ChatMessage> => {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
    throw new Error('No authentication token found');
  }

  // Convert files to base64 for JSON transport
  let attachmentPayload: Array<{ name: string; type: string; data: string }> = [];
  if (attachments && attachments.length > 0) {
    attachmentPayload = await Promise.all(
      attachments.map(
        file =>
          new Promise<{ name: string; type: string; data: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                name: file.name,
                type: file.type,
                data: (reader.result as string).split(',')[1],
              });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );
  }

  const response = await fetch(`${API_BASE_URL}/chat/message`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ conversationId, message, attachments: attachmentPayload }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    // Parse backend error for a useful message
    let errorMsg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errBody = await response.json();
      if (errBody?.message) errorMsg = errBody.message;
      else if (errBody?.error) errorMsg = errBody.error;
    } catch {
      // ignore parse error
    }
    throw new Error(errorMsg);
  }

  // Backend returns { response: string, conversation: Conversation }
  const data: { response: string; conversation: Conversation } = await response.json();

  return {
    id: crypto.randomUUID(),
    from: 'ai',
    text: data.response,
    timestamp: new Date().toISOString(),
  };
};

// ── Memory ────────────────────────────────────────────────────────────────────

export const getChatMemory = async (): Promise<Memory[]> => {
  return authenticatedFetch('/chat/memory', { method: 'GET' });
};

export const saveToMemory = async (conversationId: string, title?: string): Promise<Memory> => {
  return authenticatedFetch('/chat/memory', {
    method: 'POST',
    body: JSON.stringify({ conversationId, title }),
  });
};

export const updateChatContext = async (
  conversationId: string,
  context: Partial<ChatContext>
): Promise<Conversation> => {
  return authenticatedFetch('/chat/context', {
    method: 'PUT',
    body: JSON.stringify({ conversationId, context }),
  });
};

// ── Tasks ─────────────────────────────────────────────────────────────────────

export const createTask = async (taskData: {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  conversationId?: string;
}): Promise<Task> => {
  return authenticatedFetch('/chat/task', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
};

export const getTasks = async (): Promise<Task[]> => {
  return authenticatedFetch('/chat/task', { method: 'GET' });
};

// ── React Query hooks ─────────────────────────────────────────────────────────

export const useSendMessage = () => ({ mutateAsync: sendMessage });

export const useChatMemory = () => ({
  getMemory: getChatMemory,
  save: saveToMemory,
  updateContext: updateChatContext,
});

export const useTasks = () => ({
  create: createTask,
  getAll: getTasks,
});
import { jwtDecode } from 'jwt-decode';

// API Configuration
const API_BASE_URL = 'http://localhost:8787';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'team';
  usage: {
    chats: number;
    memoryEntries: number;
    workspaces: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Conversation {
  id: string;
  messages: Array<{
    id: string;
    from: 'user' | 'ai';
    text: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
  context: {
    goal: string;
    customContext: string[];
  };
}

export interface Memory {
  id: string;
  title: string;
  content: any[];
  createdAt: string;
  tags: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  createdAt: string;
  executionCount: number;
}

// API Client Class
class ApiClient {
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  // Token Management
  setToken(token: string) {
    this.token = token;
    try {
      const decoded: any = jwtDecode(token);
      this.tokenExpiry = decoded.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Invalid token:', error);
      this.clearToken();
    }
  }

  getToken(): string | null {
    if (!this.token || !this.tokenExpiry) return null;
    
    // Check if token is expired
    if (Date.now() > this.tokenExpiry) {
      this.clearToken();
      return null;
    }
    
    return this.token;
  }

  clearToken() {
    this.token = null;
    this.tokenExpiry = null;
    localStorage.removeItem('auth_token');
  }

  // Store token in localStorage
  persistToken(token: string) {
    this.setToken(token);
    localStorage.setItem('auth_token', token);
  }

  // Load token from localStorage
  loadPersistedToken() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.setToken(token);
    }
  }

  // HTTP Request Helper
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if token exists
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
      
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Authentication Endpoints
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token on successful login
    this.persistToken(response.token);
    
    return response;
  }

  // User Management Endpoints
  async getUserProfile(): Promise<User> {
    return this.request<User>('/user/profile');
  }

  async updateUserPlan(plan: string): Promise<User> {
    return this.request<User>('/user/plan', {
      method: 'PUT',
      body: JSON.stringify({ plan }),
    });
  }

  async updateUsage(usage: Partial<User['usage']>): Promise<User['usage']> {
    return this.request<User['usage']>('/user/usage', {
      method: 'PUT',
      body: JSON.stringify({ usage }),
    });
  }

  // Chat Endpoints
  async createConversation(conversationId?: string): Promise<Conversation> {
    return this.request<Conversation>('/chat/conversation', {
      method: 'POST',
      body: JSON.stringify(conversationId ? { conversationId } : {}),
    });
  }

  async sendMessage(conversationId: string, message: string): Promise<{
    response: string;
    conversation: Conversation;
  }> {
    return this.request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ conversationId, message }),
    });
  }

  async getMemories(): Promise<Memory[]> {
    return this.request<Memory[]>('/chat/memory');
  }

  async saveToMemory(conversationId: string, title: string): Promise<Memory> {
    return this.request<Memory>('/chat/memory', {
      method: 'POST',
      body: JSON.stringify({ conversationId, title }),
    });
  }

  async updateConversationContext(
    conversationId: string,
    context: Partial<Conversation['context']>
  ): Promise<Conversation> {
    return this.request<Conversation>('/chat/context', {
      method: 'PUT',
      body: JSON.stringify({ conversationId, context }),
    });
  }

  async getConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>('/chat/conversation');
  }

  // Workflow Endpoints
  async createWorkflow(workflowData: {
    name: string;
    description: string;
    type?: string;
    steps?: any[];
  }): Promise<Workflow> {
    return this.request<Workflow>('/workflow/workflow', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });
  }

  async getWorkflows(): Promise<Workflow[]> {
    return this.request<Workflow[]>('/workflow/workflow');
  }

  async executeWorkflow(workflowId: string, inputData: any): Promise<any> {
    return this.request('/workflow/execute', {
      method: 'POST',
      body: JSON.stringify({ workflowId, inputData }),
    });
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    return this.request('/health');
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Initialize with persisted token on load
apiClient.loadPersistedToken();

export default apiClient;

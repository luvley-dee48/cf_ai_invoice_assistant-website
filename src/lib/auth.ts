import { useMutation, useQuery } from '@tanstack/react-query';

// API base URL - adjust this to match your backend deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Types
export interface User {
  id: string;
  email: string;
  plan: 'free' | 'pro';
  createdAt: string;
  usage: {
    messages: number;
    documents: number;
    workflows: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Storage helpers
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const getStoredToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  console.log('getStoredToken - Retrieved:', token ? token.substring(0, 20) + '...' : 'null');
  return token;
};

export const getStoredUser = (): User | null => {
  const user = localStorage.getItem(USER_KEY);
  const parsedUser = user ? JSON.parse(user) : null;
  console.log('getStoredUser - Retrieved:', parsedUser);
  return parsedUser;
};

export const setAuthData = (token: string, user: User): void => {
  console.log('setAuthData - Storing token and user:', { token: token.substring(0, 20) + '...', user });
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// API functions
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
};

export const getUserProfile = async (token: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};

// React Query hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuthData(data.token, data.user);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setAuthData(data.token, data.user);
    },
  });
};

export const useUserProfile = () => {
  const token = getStoredToken();
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => getUserProfile(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Auth API helper for making authenticated requests
export const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getStoredToken();
  
  if (!token) {
    console.error('No authentication token found');
    clearAuthData();
    window.location.href = '/login';
    throw new Error('No authentication token found');
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    console.error(`Request failed: ${response.status} ${response.statusText}`);
    if (response.status === 401) {
      // Token expired, clear auth data
      clearAuthData();
      window.location.href = '/login';
    }
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

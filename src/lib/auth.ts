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

// Base64url decode helper for JWT parsing
const base64urlDecode = (str: string): string => {
  try {
    if (!str || typeof str !== 'string') {
      throw new Error('Invalid input: token part is not a string');
    }

    // Correct padding: (4 - len % 4) % 4 gives 0, 1, 2, or 3 '=' chars needed
    const padded = str + '='.repeat((4 - str.length % 4) % 4);

    // Replace base64url characters with standard base64 characters
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');

    return atob(base64);
  } catch (error) {
    console.error('Base64url decode error:', error);
    throw new Error(`Failed to decode token: ${error.message}`);
  }
};

// Check if JWT token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    // Validate token format
    if (!token || typeof token !== 'string') {
      console.log('Token validation: Invalid token format');
      return true;
    }

    // Check for basic JWT structure before splitting
    if (!token.includes('.') || token.split('.').length !== 3) {
      console.log('Token validation: Invalid JWT structure');
      return true;
    }

    const parts = token.split('.');

    // Check if payload part is empty or contains invalid characters
    if (!parts[1] || parts[1].length === 0) {
      console.log('Token validation: Empty payload');
      return true;
    }

    // Validate payload contains only valid base64url characters
    const payloadPart = parts[1];
    const validBase64UrlRegex = /^[A-Za-z0-9_-]*$/;
    if (!validBase64UrlRegex.test(payloadPart)) {
      console.log('Token validation: Payload contains invalid characters');
      return true;
    }

    const payload = JSON.parse(base64urlDecode(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if expiration exists
    if (!payload.exp) {
      console.log('Token validation: No expiration claim found');
      return true; // Treat as expired if no exp claim
    }

    const isExpired = payload.exp < currentTime;
    console.log('Token validation:', {
      exp: payload.exp,
      currentTime,
      isExpired,
      timeUntilExpiry: payload.exp - currentTime,
    });

    return isExpired;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

export const getStoredToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  console.log('getStoredToken - Retrieved:', token ? token.substring(0, 20) + '...' : 'null');

  if (token) {
    try {
      // Basic structure validation
      if (!token.includes('.') || token.split('.').length !== 3) {
        console.log('getStoredToken - Invalid token structure, clearing corrupted token');
        clearAuthData();
        return null;
      }

      const parts = token.split('.');

      // Check payload part for valid base64url characters
      const payloadPart = parts[1];
      if (!payloadPart || payloadPart.length === 0) {
        console.log('getStoredToken - Empty payload, clearing corrupted token');
        clearAuthData();
        return null;
      }

      const validBase64UrlRegex = /^[A-Za-z0-9_-]*$/;
      if (!validBase64UrlRegex.test(payloadPart)) {
        console.log('getStoredToken - Invalid characters in payload, clearing corrupted token');
        clearAuthData();
        return null;
      }
    } catch (error) {
      console.log('getStoredToken - Error validating token, clearing corrupted token:', error);
      clearAuthData();
      return null;
    }
  }

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

// Force clear all auth data - useful for troubleshooting corrupted tokens
export const forceClearAuthData = (): void => {
  console.log('Force clearing all auth data...');
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Auth data cleared');
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
      Authorization: `Bearer ${token}`,
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

  // Check if token is expired before making the request
  if (isTokenExpired(token)) {
    console.error('Token expired, clearing auth data');
    clearAuthData();
    window.location.href = '/login';
    throw new Error('Token expired');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    console.error(`Request failed: ${response.status} ${response.statusText}`);
    if (response.status === 401) {
      clearAuthData();
      window.location.href = '/login';
    }
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
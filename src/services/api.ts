import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';
import { 
  ApiResponse, 
  ApiError, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  User,
  Hunt,
  CreateHuntRequest,
  UpdateHuntRequest,
  UserStats,
  PaginatedResponse
} from '../types/api';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-railway-app.railway.app/api';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  LAST_SYNC: 'last_sync',
};

class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadStoredToken();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.clearAuth();
          // You might want to redirect to login here
        }
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private async loadStoredToken() {
    try {
      // Use AsyncStorage for all platforms for now
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        this.authToken = token;
        console.log('Token loaded successfully');
      } else {
        console.log('No stored auth token found');
      }
    } catch (error) {
      console.log('No stored auth token found');
    }
  }

  private async storeToken(token: string) {
    try {
      // Always use AsyncStorage for now to avoid platform issues
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      this.authToken = token;
      console.log('Token stored successfully');
    } catch (error) {
      console.error('Failed to store auth token:', error);
    }
  }

  private async clearAuth() {
    try {
      // Use AsyncStorage for all platforms
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      this.authToken = null;
      console.log('Auth cleared successfully');
    } catch (error) {
      console.error('Failed to clear auth:', error);
    }
  }

  private handleApiError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any;
      return {
        error: data.error || 'Server Error',
        message: data.message || error.message,
        details: data.details,
        status: error.response.status,
      };
    } else if (error.request) {
      // Network error
      return {
        error: 'Network Error',
        message: 'Unable to connect to server. Please check your internet connection.',
        status: 0,
      };
    } else {
      // Other error
      return {
        error: 'Unknown Error',
        message: error.message,
      };
    }
  }

  // Authentication Methods
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('ApiService: Sending registration request...', data.email);
      const response = await this.client.post<AuthResponse>('/auth/register', data);
      console.log('ApiService: Registration response received', response.data);
      await this.storeToken(response.data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      console.error('ApiService: Registration error', error);
      throw error;
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.client.post<AuthResponse>('/auth/login', data);
      await this.storeToken(response.data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.clearAuth();
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.client.get<{ user: User }>('/auth/me');
      return response.data.user;
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await this.client.post<{ token: string }>('/auth/refresh');
      await this.storeToken(response.data.token);
      return response.data.token;
    } catch (error) {
      throw error;
    }
  }

  // Hunt Methods
  async getHunts(page = 1, limit = 50): Promise<PaginatedResponse<Hunt>> {
    try {
      const response = await this.client.get<PaginatedResponse<Hunt>>('/hunts', {
        params: { page, limit, sortBy: 'huntDate', sortOrder: 'desc' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getHunt(id: string): Promise<Hunt> {
    try {
      const response = await this.client.get<{ hunt: Hunt }>(`/hunts/${id}`);
      return response.data.hunt;
    } catch (error) {
      throw error;
    }
  }

  async createHunt(data: CreateHuntRequest): Promise<Hunt> {
    try {
      const response = await this.client.post<{ hunt: Hunt }>('/hunts', data);
      return response.data.hunt;
    } catch (error) {
      throw error;
    }
  }

  async updateHunt(id: string, data: Partial<CreateHuntRequest>): Promise<Hunt> {
    try {
      const response = await this.client.put<{ hunt: Hunt }>(`/hunts/${id}`, data);
      return response.data.hunt;
    } catch (error) {
      throw error;
    }
  }

  async deleteHunt(id: string): Promise<void> {
    try {
      await this.client.delete(`/hunts/${id}`);
    } catch (error) {
      throw error;
    }
  }

  // User Methods
  async getUserStats(timeframe: 'all' | 'week' | 'month' = 'all'): Promise<UserStats> {
    try {
      const response = await this.client.get<UserStats>('/users/stats', {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await this.client.put<{ user: User }>('/users/profile', data);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error) {
      throw error;
    }
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

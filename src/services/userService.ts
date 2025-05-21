
import { ApiService } from '@/lib/axios';
import { ApiResponse } from '@/types/api';

// User related interfaces
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  token?: string;
  refreshToken?: string; // Added refreshToken
  tokenExpiry?: number; // Added token expiry timestamp
  role?: string;
  status?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

// Mock user data for testing
const mockUsers: User[] = [
  {
    id: '1',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    role: 'Admin',
    status: 'Active'
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    phone: '987-654-3210',
    role: 'User',
    status: 'Active'
  },
  {
    id: '3',
    fullName: 'Ahmed Khan',
    email: 'ahmed@example.com',
    role: 'User',
    status: 'Active'
  }
];

// User API service
class UserService extends ApiService {
  private static instance: UserService;
  private isAuthenticated: boolean = false;
  private currentUser: User | null = null;
  private tokenRefreshTimeout: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    // In a real environment this would be your actual API endpoint
    // For demo purposes we'll use a mock API
    super('/api/users');
    this.initializeFromLocalStorage();
    this.setupTokenRefresh();
  }

  // Singleton pattern
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private initializeFromLocalStorage(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.isAuthenticated = true;
      this.currentUser = this.getUserDataLocally();
    }
  }

  private setupTokenRefresh(): void {
    // Clear any existing timeout
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }

    // Check if token needs refresh
    const tokenExpiry = Number(localStorage.getItem('tokenExpiry'));
    if (tokenExpiry) {
      const timeUntilRefresh = Math.max(0, tokenExpiry - Date.now() - 60000); // Refresh 1 minute before expiry
      
      if (timeUntilRefresh < 0) {
        // Token already expired, refresh immediately if possible
        this.refreshToken();
      } else {
        // Schedule token refresh
        this.tokenRefreshTimeout = setTimeout(() => {
          this.refreshToken();
        }, timeUntilRefresh);
      }
    }
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return false;
    }

    try {
      // In a real app, this would call the actual API
      // For demo purposes, we're just simulating a refresh
      
      // Simulate token refresh success
      const newToken = 'mock-jwt-token-' + Date.now();
      const newRefreshToken = 'mock-refresh-token-' + Date.now();
      const expiryTime = Date.now() + 3600000; // 1 hour from now
      
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      
      // Reset the refresh timer
      this.setupTokenRefresh();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, user needs to log in again
      this.logout();
      return false;
    }
  }

  setUserDataLocally(user: User): void {
    if (user.token) localStorage.setItem('authToken', user.token);
    if (user.refreshToken) localStorage.setItem('refreshToken', user.refreshToken);
    if (user.tokenExpiry) localStorage.setItem('tokenExpiry', user.tokenExpiry.toString());
    if (user.fullName) localStorage.setItem('userName', user.fullName);
    if (user.email) localStorage.setItem('userEmail', user.email);
    if (user.id) localStorage.setItem('userId', user.id);
    if (user.phone) localStorage.setItem('userPhone', user.phone || '');
    localStorage.setItem('isAdmin', (user.role ?? "") === "Admin" ? 'true' : 'false');
  }

  getUserDataLocally(): User {
    const user: User = {
      token: localStorage.getItem('authToken') || '',
      refreshToken: localStorage.getItem('refreshToken') || '',
      fullName: localStorage.getItem('userName') || '',
      email: localStorage.getItem('userEmail') || '',
      id: localStorage.getItem('userId') || '',
      phone: localStorage.getItem('userPhone') || '',
      role: localStorage.getItem('isAdmin') === 'true' ? 'Admin' : 'User'
    };

    return user;
  }

  // Mock implementation for demonstration
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    try {
      // In a real app, this would call the actual API
      // For demo purposes, we're using mock data
      const mockUser = mockUsers.find(u => u.email === credentials.email);
      
      if (mockUser) {
        // Simulate successful login
        const user: User = {
          ...mockUser,
          token: 'mock-jwt-token-' + Date.now(), // Simulate a JWT token
          refreshToken: 'mock-refresh-token-' + Date.now(), // Simulate a refresh token
          tokenExpiry: Date.now() + 3600000, // 1 hour from now
        };
        
        this.setUserDataLocally(user);
        this.isAuthenticated = true;
        this.currentUser = user;
        
        // Set up token refresh
        this.setupTokenRefresh();
        
        return {
          isSuccess: true,
          errors: [],
          validationErrors: {},
          successes: ['Login successful'],
          value: user
        };
      } else {
        // Simulate failed login
        return {
          isSuccess: false,
          errors: ['Invalid email or password'],
          validationErrors: {},
          successes: [],
          value: null
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        isSuccess: false,
        errors: ['An error occurred during login'],
        validationErrors: {},
        successes: [],
        value: null
      };
    }
  }

  // Register user
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    try {
      // In a real app, this would call the actual API
      // For demo purposes, we're creating a mock user
      
      // Check if email already exists
      if (mockUsers.some(u => u.email === data.email)) {
        return {
          isSuccess: false,
          errors: ['Email already in use'],
          validationErrors: {},
          successes: [],
          value: null
        };
      }
      
      // Create a new mock user
      const newUser: User = {
        id: (mockUsers.length + 1).toString(),
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: 'User',
        status: 'Active',
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        tokenExpiry: Date.now() + 3600000, // 1 hour from now
      };
      
      // Add to mock users (in a real app this would be saved in the database)
      mockUsers.push(newUser);
      
      this.setUserDataLocally(newUser);
      this.isAuthenticated = true;
      this.currentUser = newUser;
      
      // Set up token refresh
      this.setupTokenRefresh();
      
      return {
        isSuccess: true,
        errors: [],
        validationErrors: {},
        successes: ['Registration successful'],
        value: newUser
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        isSuccess: false,
        errors: ['An error occurred during registration'],
        validationErrors: {},
        successes: [],
        value: null
      };
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('isAdmin');
    
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
      this.tokenRefreshTimeout = null;
    }
    
    this.isAuthenticated = false;
    this.currentUser = null;
  }

  // Check authentication status
  checkAuth(): boolean {
    const token = localStorage.getItem('authToken');
    const tokenExpiry = Number(localStorage.getItem('tokenExpiry'));
    
    // Check if token exists and is not expired
    if (token && tokenExpiry && tokenExpiry > Date.now()) {
      this.isAuthenticated = true;
      return true;
    } else if (token && tokenExpiry && tokenExpiry <= Date.now()) {
      // Token is expired, try to refresh
      this.refreshToken().then(success => {
        this.isAuthenticated = success;
      });
      return this.isAuthenticated;
    }
    
    this.isAuthenticated = false;
    return false;
  }

  // Check if user is admin
  isAdmin(): boolean {
    const isAdmin = localStorage.getItem('isAdmin');
    return isAdmin === 'true';
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    if (!this.checkAuth()) {
      return null;
    } else {
      return this.getUserDataLocally();
    }
  }
}

export const userService = UserService.getInstance();
export { mockUsers };

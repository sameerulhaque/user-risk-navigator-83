
import { ApiService } from '@/lib/axios';
import { ApiResponse } from '@/types/api';

// User related interfaces
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  token?: string;
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

  private constructor() {
    // In a real environment this would be your actual API endpoint
    // For demo purposes we'll use a mock API
    super('/api/users');
    this.initializeFromLocalStorage();
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

  setUserDataLocally(user: User): void {
    if (user.token) localStorage.setItem('authToken', user.token);
    if (user.fullName) localStorage.setItem('userName', user.fullName);
    if (user.email) localStorage.setItem('userEmail', user.email);
    if (user.id) localStorage.setItem('userId', user.id);
    if (user.phone) localStorage.setItem('userPhone', user.phone || '');
    localStorage.setItem('isAdmin', (user.role ?? "") === "Admin" ? 'true' : 'false');
  }

  getUserDataLocally(): User {
    const user: User = {
      token: localStorage.getItem('authToken') || '',
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
          token: 'mock-jwt-token-' + Date.now() // Simulate a JWT token
        };
        
        this.setUserDataLocally(user);
        this.isAuthenticated = true;
        this.currentUser = user;
        
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
        token: 'mock-jwt-token-' + Date.now()
      };
      
      // Add to mock users (in a real app this would be saved in the database)
      mockUsers.push(newUser);
      
      this.setUserDataLocally(newUser);
      this.isAuthenticated = true;
      this.currentUser = newUser;
      
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
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('isAdmin');
    this.isAuthenticated = false;
    this.currentUser = null;
  }

  // Check authentication status
  checkAuth(): boolean {
    const token = localStorage.getItem('authToken');
    this.isAuthenticated = !!token;
    return this.isAuthenticated;
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

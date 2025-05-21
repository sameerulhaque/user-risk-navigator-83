
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Base API service with common axios functionality
export class ApiService {
  protected api: AxiosInstance;
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.api = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Add auth interceptor
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor with token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Handle token refresh logic here
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            const refreshed = await this.refreshAuthToken();
            if (refreshed) {
              // If token refresh was successful, retry the original request
              const token = localStorage.getItem('authToken');
              if (token) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
              }
              return axios(originalRequest);
            } else {
              // If refresh failed, redirect to login
              this.handleAuthFailure();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // Helper method to refresh auth token
  private async refreshAuthToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    
    try {
      // In a real app, call the refresh endpoint
      // For our mock app, simulate a token refresh
      const newToken = 'mock-jwt-token-' + Date.now();
      const newRefreshToken = 'mock-refresh-token-' + Date.now();
      const expiryTime = Date.now() + 3600000; // 1 hour
      
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
  
  // Helper method to handle authentication failures
  private handleAuthFailure(): void {
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    
    // Log out
    console.error('Authentication token expired or invalid');
    window.location.href = '/login';
  }

  // Generic request method
  protected async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.request<T>(config);
  }

  // GET method
  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  // POST method
  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  // PUT method
  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  // DELETE method
  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }
}

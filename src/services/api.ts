
import axios from 'axios';
import { ApiResponse, PaginatedResponse, getDefaultHeaders, getPaginationHeaders } from '@/types/api';
import { 
  RiskConfiguration, 
  UserProfile, 
  RiskScore, 
  UserSubmission 
} from '@/types/risk';
import { mockRiskConfiguration, mockDropdownData, mockUsers, mockRiskScore } from './mockData';

// Create axios instance with base configurations
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Simulated network delay
  timeout: 1000,
});

// Add response interceptor to simulate API responses
api.interceptors.response.use(
  (response) => {
    // Process successful responses
    return response;
  },
  (error) => {
    // Return a mock error response for better testing
    console.error('API Error:', error);
    return Promise.reject({
      isSuccess: false,
      errors: ['An error occurred while processing your request.'],
      validationErrors: {},
      successes: [],
      value: null,
    });
  }
);

// Mock successful response wrapper
const successResponse = <T>(data: T): ApiResponse<T> => ({
  isSuccess: true,
  errors: [],
  validationErrors: {},
  successes: [],
  value: data,
});

// Mock paginated response wrapper
const paginatedSuccessResponse = <T>(
  data: T[],
  page: number,
  pageSize: number,
  totalCount: number
): ApiResponse<PaginatedResponse<T>> => ({
  isSuccess: true,
  errors: [],
  validationErrors: {},
  successes: [],
  value: {
    pageSize,
    pageNumber: page,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    data,
  },
});

// API functions for Risk Configuration
export const getRiskConfiguration = async (tenantId: string = 'tenant1'): Promise<ApiResponse<RiskConfiguration>> => {
  try {
    // In a real application, this would be an actual API call
    // const response = await api.get('/risk-configuration', { headers: getDefaultHeaders(tenantId) });
    // return response.data;
    
    // Mock response
    return successResponse(mockRiskConfiguration);
  } catch (error) {
    console.error('Failed to fetch risk configuration:', error);
    return {
      isSuccess: false,
      errors: ['Failed to fetch risk configuration.'],
      validationErrors: {},
      successes: [],
      value: null,
    };
  }
};

export const saveRiskConfiguration = async (configuration: RiskConfiguration, tenantId: string = 'tenant1'): Promise<ApiResponse<RiskConfiguration>> => {
  try {
    // In a real application, this would be an actual API call
    // const response = await api.post('/risk-configuration', configuration, { headers: getDefaultHeaders(tenantId) });
    // return response.data;
    
    // Mock response
    return successResponse({ ...configuration, id: 1 });
  } catch (error) {
    console.error('Failed to save risk configuration:', error);
    return {
      isSuccess: false,
      errors: ['Failed to save risk configuration.'],
      validationErrors: {},
      successes: [],
      value: null,
    };
  }
};

// API function for dropdown values
export const getFieldOptions = async (apiEndpoint: string, tenantId: string = 'tenant1'): Promise<ApiResponse<{ id: number; label: string }[]>> => {
  try {
    // In a real application, this would be an actual API call
    // const response = await api.get(apiEndpoint, { headers: getDefaultHeaders(tenantId) });
    // return response.data;
    
    // Mock response
    const mockData = mockDropdownData[apiEndpoint as keyof typeof mockDropdownData] || [];
    return successResponse(mockData);
  } catch (error) {
    console.error(`Failed to fetch options for ${apiEndpoint}:`, error);
    return {
      isSuccess: false,
      errors: [`Failed to fetch options for ${apiEndpoint}.`],
      validationErrors: {},
      successes: [],
      value: null,
    };
  }
};

// API functions for User Profiles
export const getUserProfiles = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: { status?: 'Pending' | 'Approved' | 'Rejected'; scoreRange?: string },
  tenantId: string = 'tenant1'
): Promise<ApiResponse<PaginatedResponse<UserProfile>>> => {
  try {
    // In a real application, this would be an actual API call
    // const response = await api.get('/users', { 
    //   headers: getPaginationHeaders(page, pageSize, searchQuery, tenantId) 
    // });
    // return response.data;
    
    // Mock response with filtering
    let filteredUsers = [...mockUsers] as UserProfile[];
    
    if (searchQuery?.status) {
      filteredUsers = filteredUsers.filter(user => user.status === searchQuery.status);
    }
    
    if (searchQuery?.scoreRange) {
      switch (searchQuery.scoreRange) {
        case 'low':
          filteredUsers = filteredUsers.filter(user => (user.riskScore || 0) < 50);
          break;
        case 'medium':
          filteredUsers = filteredUsers.filter(user => (user.riskScore || 0) >= 50 && (user.riskScore || 0) < 70);
          break;
        case 'high':
          filteredUsers = filteredUsers.filter(user => (user.riskScore || 0) >= 70);
          break;
      }
    }
    
    // Calculate pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedUsers = filteredUsers.slice(start, end);
    
    return paginatedSuccessResponse<UserProfile>(paginatedUsers, page, pageSize, filteredUsers.length);
  } catch (error) {
    console.error('Failed to fetch user profiles:', error);
    return {
      isSuccess: false,
      errors: ['Failed to fetch user profiles.'],
      validationErrors: {},
      successes: [],
      value: null,
    };
  }
};

export const getUserRiskScore = async (userId: number, tenantId: string = 'tenant1'): Promise<ApiResponse<RiskScore>> => {
  try {
    // In a real application, this would be an actual API call
    // const response = await api.get(`/users/${userId}/risk-score`, { headers: getDefaultHeaders(tenantId) });
    // return response.data;
    
    // Mock response with the correct status type
    return successResponse({
      ...mockRiskScore,
      userId,
      // Ensure status is one of the allowed values
      status: mockRiskScore.status as 'Pending' | 'Approved' | 'Rejected'
    });
  } catch (error) {
    console.error(`Failed to fetch risk score for user ${userId}:`, error);
    return {
      isSuccess: false,
      errors: [`Failed to fetch risk score for user ${userId}.`],
      validationErrors: {},
      successes: [],
      value: null,
    };
  }
};

export const submitUserData = async (submission: UserSubmission, tenantId: string = 'tenant1'): Promise<ApiResponse<RiskScore>> => {
  try {
    // In a real application, this would be an actual API call
    // const response = await api.post('/users/submit', submission, { headers: getDefaultHeaders(tenantId) });
    // return response.data;
    
    // Mock response with the correct status type
    return successResponse({
      ...mockRiskScore,
      userId: submission.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Ensure status is one of the allowed values
      status: mockRiskScore.status as 'Pending' | 'Approved' | 'Rejected'
    });
  } catch (error) {
    console.error('Failed to submit user data:', error);
    return {
      isSuccess: false,
      errors: ['Failed to submit user data.'],
      validationErrors: {},
      successes: [],
      value: null,
    };
  }
};

export const updateUserStatus = async (
  userId: number, 
  status: 'Pending' | 'Approved' | 'Rejected',
  tenantId: string = 'tenant1'
): Promise<ApiResponse<UserProfile>> => {
  try {
    // In a real application, this would be an actual API call
    // const response = await api.patch(
    //   `/users/${userId}/status`, 
    //   { status }, 
    //   { headers: getDefaultHeaders(tenantId) }
    // );
    // return response.data;
    
    // Mock response
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return {
        isSuccess: false,
        errors: [`User ${userId} not found.`],
        validationErrors: {},
        successes: [],
        value: null,
      };
    }
    
    return successResponse({
      ...user,
      status,
    });
  } catch (error) {
    console.error(`Failed to update status for user ${userId}:`, error);
    return {
      isSuccess: false,
      errors: [`Failed to update status for user ${userId}.`],
      validationErrors: {},
      successes: [],
      value: null,
    };
  }
};

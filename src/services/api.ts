import axios from 'axios';
import { ApiResponse, PaginatedResponse, getDefaultHeaders, getPaginationHeaders } from '@/types/api';
import { 
  RiskConfiguration,
  RiskSection,
  RiskField,
  RiskFieldValueMapping,
  RiskCompanySection,
  RiskCompanyField,
  RiskCompanyFieldCondition,
  RiskUserAssessment,
  RiskUserAssessmentSectionScore,
  UserProfile, 
  RiskScore, 
  UserSubmission,
  RiskConfiguration_Legacy,
  Section,
  Field,
  FieldValue,
  Company
} from '@/types/risk';
import { mockRiskConfiguration, mockDropdownData, mockUsers, mockRiskScore, mockCompanies, mockSections, mockFields, mockCompanySections } from './mockData';

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

// Get default sections for companies to use in configuration
export const getDefaultSections = async (tenantId: string = 'tenant1'): Promise<ApiResponse<RiskSection[]>> => {
  try {
    // Return mock sections from mockData
    return successResponse(mockSections);
  } catch (error) {
    console.error('Failed to fetch default sections:', error);
    return {
      isSuccess: false,
      errors: ['Failed to fetch default sections.'],
      validationErrors: {},
      successes: [],
      value: null,
    };
  }
};

// Get default fields for a specific section
export const getDefaultFields = async (sectionId: number, tenantId: string = 'tenant1'): Promise<ApiResponse<RiskField[]>> => {
  try {
    // Filter fields by section ID
    const fields = mockFields.filter(field => field.sectionId === sectionId);
    return successResponse(fields);
  } catch (error) {
    console.error(`Failed to fetch default fields for section ${sectionId}:`, error);
    return {
      isSuccess: false,
      errors: [`Failed to fetch default fields for section ${sectionId}.`],
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

// Get available companies for dropdown
export const getCompanies = async (tenantId: string = 'tenant1'): Promise<ApiResponse<Company[]>> => {
  try {
    return successResponse(mockCompanies);
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    return {
      isSuccess: false,
      errors: ['Failed to fetch companies.'],
      validationErrors: {},
      successes: [],
      value: null,
    };
  }
};

// API functions for Risk Configuration
export const getRiskConfiguration = async (companyId?: number | string, tenantId: string = 'tenant1'): Promise<ApiResponse<RiskConfiguration>> => {
  try {
    // Convert companyId to number if it's a string
    const companyIdNumber = typeof companyId === 'string' ? parseInt(companyId, 10) : (companyId || 1);

    // Find company from mock data
    const company = mockCompanies.find(c => c.id === companyIdNumber) || mockCompanies[0];
    
    // Get mock configuration
    const mockConfig: RiskConfiguration = {
      id: company.configId || 1,
      name: `${company.name} Risk Assessment`,
      version: "1.0.0",
      companyId: company.id,
      companySections: []
    };
    
    // Add company sections
    const configSections = mockCompanySections.filter(cs => cs.companyId === company.id);
    
    // Connect related data
    mockConfig.companySections = configSections.map(section => {
      // Connect section reference
      const sectionData = mockSections.find(s => s.id === section.sectionId);
      
      // Connect fields
      const fields = section.fields?.map(field => {
        // Connect field reference
        const fieldData = mockFields.find(f => f.id === field.fieldId);
        
        return {
          ...field,
          field: fieldData
        };
      });
      
      return {
        ...section,
        section: sectionData,
        fields: fields
      };
    });
    
    // Return the populated configuration object
    return successResponse(mockConfig);
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

// Convert the new configuration model to the legacy format for compatibility
const convertToLegacyFormat = (config: RiskConfiguration): RiskConfiguration_Legacy => {
  const legacyConfig: RiskConfiguration_Legacy = {
    id: config.id,
    name: config.name,
    version: config.version,
    sections: []
  };

  if (config.companySections) {
    legacyConfig.sections = config.companySections.map(companySection => {
      const section: Section = {
        id: companySection.section.id,
        name: companySection.section.sectionName,
        weightage: companySection.weightage,
        fields: []
      };

      if (companySection.fields) {
        section.fields = companySection.fields.map(companyField => {
          const field: Field = {
            id: companyField.field.id,
            name: companyField.field.label || '',
            type: (companyField.field.fieldType as 'text' | 'number' | 'select' | 'date' | 'checkbox') || 'text',
            valueApi: companyField.field.endpointURL,
            required: companyField.field.isRequired,
            fieldValues: []
          };

          // Add field values from conditions
          if (companyField.conditions) {
            field.fieldValues = companyField.conditions.map(condition => {
              return {
                id: condition.id,
                value: condition.fieldValueMapping?.text || '',
                condition: condition.operator || '=',
                conditionType: getConditionType(condition.operator),
                weightage: condition.riskScore,
                condition2: condition.valueTo
              };
            });
          }

          // If no conditions but field has value mappings, use those
          if (field.fieldValues.length === 0 && companyField.field.valueMappings) {
            field.fieldValues = companyField.field.valueMappings.map(mapping => {
              return {
                id: mapping.id,
                value: mapping.text,
                condition: '=',
                conditionType: 'equals',
                weightage: 0
              };
            });
          }

          return field;
        });
      }

      return section;
    });
  }

  return legacyConfig;
};

// Helper function to get condition type from operator
const getConditionType = (operator?: string): string => {
  switch (operator) {
    case '>': return 'greaterThan';
    case '<': return 'lessThan';
    case '=': return 'equals';
    case 'between': return 'between';
    case 'contains': return 'contains';
    case 'isEmpty': return 'isEmpty';
    case 'isNotEmpty': return 'isNotEmpty';
    default: return 'equals';
  }
};

// Export a compatibility function that uses the new model but returns data in the legacy format
export const getRiskConfigurationLegacy = async (companyId?: number | string, tenantId: string = 'tenant1'): Promise<ApiResponse<RiskConfiguration_Legacy>> => {
  try {
    // Convert companyId to number if needed
    const companyIdNumber = typeof companyId === 'string' ? parseInt(companyId, 10) : companyId;
    
    const response = await getRiskConfiguration(companyIdNumber, tenantId);
    if (response.isSuccess && response.value) {
      const legacyFormat = convertToLegacyFormat(response.value);
      return successResponse(legacyFormat);
    }
    return {
      isSuccess: false,
      errors: ['Failed to fetch risk configuration.'],
      validationErrors: {},
      successes: [],
      value: null,
    };
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

// API functions for User Profiles
export const getUserProfiles = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: { status?: 'Pending' | 'Approved' | 'Rejected'; scoreRange?: string },
  tenantId: string = 'tenant1'
): Promise<ApiResponse<PaginatedResponse<UserProfile>>> => {
  try {
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

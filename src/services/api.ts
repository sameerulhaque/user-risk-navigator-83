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
  Company,
  VersionHistory
} from '@/types/risk';
import { 
  mockCompanies, 
  mockSections, 
  mockFields, 
  mockCompanySections, 
  mockUsers, 
  mockRiskScore, 
  mockVersionHistory,
  mockDropdownData 
} from './mockData';

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
    // Try to fetch from real API first
    const response = await api.get<ApiResponse<RiskSection[]>>('/risk/sections', {
      headers: getDefaultHeaders(tenantId)
    });
    return response.data;
  } catch (error) {
    console.log('Falling back to mock sections:', error);
    // Return mock sections from mockData as fallback
    return successResponse(mockSections);
  }
};

// Get default fields for a specific section
export const getDefaultFields = async (sectionId: number, tenantId: string = 'tenant1'): Promise<ApiResponse<RiskField[]>> => {
  try {
    // Try to fetch from real API first
    const response = await api.get<ApiResponse<RiskField[]>>(`/risk/sections/${sectionId}/fields`, {
      headers: getDefaultHeaders(tenantId)
    });
    return response.data;
  } catch (error) {
    console.log('Falling back to mock fields:', error);
    // Filter fields by section ID as fallback
    const fields = mockFields.filter(field => field.sectionId === sectionId);
    return successResponse(fields);
  }
};

// API function for dropdown values
export const getFieldOptions = async (apiEndpoint: string, tenantId: string = 'tenant1'): Promise<ApiResponse<{ id: number; label: string }[]>> => {
  try {
    // Try to fetch from real API first
    const response = await api.get<ApiResponse<{ id: number; label: string }[]>>(apiEndpoint, {
      headers: getDefaultHeaders(tenantId)
    });
    return response.data;
  } catch (error) {
    console.log(`Falling back to mock options for ${apiEndpoint}:`, error);
    // Mock response
    const mockData = mockDropdownData[apiEndpoint as keyof typeof mockDropdownData] || [];
    return successResponse(mockData);
  }
};

// Get available companies for dropdown
export const getCompanies = async (tenantId: string = 'tenant1'): Promise<ApiResponse<Company[]>> => {
  try {
    // Try to fetch from real API first
    const response = await api.get<ApiResponse<Company[]>>('/risk/companies', {
      headers: getDefaultHeaders(tenantId)
    });
    return response.data;
  } catch (error) {
    console.log('Falling back to mock companies:', error);
    return successResponse(mockCompanies);
  }
};

// API functions for Risk Configuration
export const getRiskConfiguration = async (companyId?: number | string, tenantId: string = 'tenant1'): Promise<ApiResponse<RiskConfiguration>> => {
  try {
    // Convert companyId to number if it's a string
    const companyIdNumber = typeof companyId === 'string' ? parseInt(companyId, 10) : (companyId || 1);
    
    // Try to fetch from real API first
    const response = await api.get<ApiResponse<RiskConfiguration>>(`/risk/configuration/company/${companyIdNumber}`, {
      headers: getDefaultHeaders(tenantId)
    });
    return response.data;
  } catch (error) {
    console.log('Falling back to mock configuration:', error);
    
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
    
    // If no configuration exists yet for this company, create default one with all sections and fields active
    if (configSections.length === 0) {
      // Create default configuration with all sections and fields active
      mockConfig.companySections = mockSections.map(section => {
        const companySection: RiskCompanySection = {
          id: section.id * 100 + company.id, // Generate unique ID
          companyId: company.id,
          sectionId: section.id,
          isActive: true,
          weightage: Math.floor(100 / mockSections.length), // Distribute weight evenly
          section: section,
          fields: []
        };
        
        // Add all fields for this section
        const sectionFields = mockFields.filter(f => f.sectionId === section.id);
        companySection.fields = sectionFields.map(field => {
          const companyField: RiskCompanyField = {
            id: field.id * 100 + company.id, // Generate unique ID
            companySectionId: companySection.id,
            fieldId: field.id,
            isActive: true,
            maxScore: 100,
            field: field,
            conditions: []
          };
          
          // Add value mappings as conditions if they exist
          if (field.valueMappings && field.valueMappings.length > 0) {
            companyField.conditions = field.valueMappings.map(mapping => {
              return {
                id: mapping.id * 100 + company.id, // Generate unique ID
                companyFieldId: companyField.id,
                fieldValueMappingId: mapping.id,
                operator: '=',
                riskScore: 0, // Default score
                fieldValueMapping: mapping
              };
            });
          }
          
          return companyField;
        });
        
        return companySection;
      });
    } else {
      // Connect related data for existing configuration
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
    }
    
    // Return the populated configuration object
    return successResponse(mockConfig);
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
    // Try to save to real API first
    const response = await api.post<ApiResponse<RiskConfiguration>>('/risk/configuration', configuration, {
      headers: getDefaultHeaders(tenantId)
    });
    return response.data;
  } catch (error) {
    console.log('Falling back to mock save:', error);
    // Mock response with version increment
    const updatedConfiguration = {
      ...configuration,
      version: incrementVersion(configuration.version)
    };
    return successResponse(updatedConfiguration);
  }
};

// Helper function to increment version
const incrementVersion = (version: string): string => {
  const parts = version.split('.');
  if (parts.length === 3) {
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }
  return version;
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
    // Try to submit to real API first
    const response = await api.post<ApiResponse<RiskScore>>('/risk/submissions', submission, {
      headers: getDefaultHeaders(tenantId)
    });
    return response.data;
  } catch (error) {
    console.log('Falling back to mock submission:', error);
    // Mock response
    return successResponse({
      ...mockRiskScore,
      userId: submission.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Pending'
    });
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

// Get version history for configurations and submissions
export const getVersionHistory = async (
  entityType?: 'configuration' | 'submission',
  entityId?: number,
  tenantId: string = 'tenant1'
): Promise<ApiResponse<VersionHistory[]>> => {
  try {
    // Build query parameters
    let url = '/risk/version-history';
    const params: Record<string, string> = {};
    
    if (entityType) {
      params.entityType = entityType;
    }
    
    if (entityId) {
      params.entityId = entityId.toString();
    }
    
    // Try to fetch from real API first
    const response = await api.get<ApiResponse<VersionHistory[]>>(url, {
      headers: getDefaultHeaders(tenantId),
      params
    });
    return response.data;
  } catch (error) {
    console.log('Falling back to mock version history:', error);
    
    // Filter mock data if needed
    let filteredHistory = [...mockVersionHistory];
    
    if (entityType) {
      filteredHistory = filteredHistory.filter(h => h.entityType === entityType);
    }
    
    if (entityId) {
      filteredHistory = filteredHistory.filter(h => h.entityId === entityId);
    }
    
    return successResponse(filteredHistory);
  }
};

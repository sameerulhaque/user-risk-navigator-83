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
  FieldValue
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

// Get default sections for companies to use in configuration
export const getDefaultSections = async (tenantId: string = 'tenant1'): Promise<ApiResponse<RiskSection[]>> => {
  try {
    // Mock response with default sections
    const defaultSections: RiskSection[] = [
      { id: 1, sectionName: 'Personal Information' },
      { id: 2, sectionName: 'Financial History' },
      { id: 3, sectionName: 'Employment Details' },
      { id: 4, sectionName: 'Credit History' },
    ];
    
    return successResponse(defaultSections);
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
    // Mock response with default fields based on section
    const defaultFields: Record<number, RiskField[]> = {
      1: [ // Personal Information
        { 
          id: 101, 
          sectionId: 1,
          label: 'Full Name',
          fieldType: 'text',
          isRequired: true,
          placeholder: 'Enter your full name',
          orderIndex: 1
        },
        { 
          id: 102, 
          sectionId: 1,
          label: 'Age',
          fieldType: 'number',
          isRequired: true,
          placeholder: 'Enter your age',
          orderIndex: 2
        },
        { 
          id: 103, 
          sectionId: 1,
          label: 'Marital Status',
          fieldType: 'select',
          endpointURL: '/dropdown/marital-status',
          isRequired: true,
          orderIndex: 3
        }
      ],
      2: [ // Financial History
        { 
          id: 201, 
          sectionId: 2,
          label: 'Annual Income',
          fieldType: 'number',
          isRequired: true,
          placeholder: 'Enter your annual income',
          orderIndex: 1
        },
        { 
          id: 202, 
          sectionId: 2,
          label: 'Has Existing Loans',
          fieldType: 'checkbox',
          isRequired: true,
          orderIndex: 2
        }
      ],
      3: [ // Employment Details
        { 
          id: 301, 
          sectionId: 3,
          label: 'Employment Status',
          fieldType: 'select',
          endpointURL: '/dropdown/employment-status',
          isRequired: true,
          orderIndex: 1
        },
        { 
          id: 302, 
          sectionId: 3,
          label: 'Years at Current Job',
          fieldType: 'number',
          isRequired: true,
          placeholder: 'Enter years at current job',
          orderIndex: 2
        }
      ],
      4: [ // Credit History
        { 
          id: 401, 
          sectionId: 4,
          label: 'Credit Score',
          fieldType: 'number',
          isRequired: true,
          placeholder: 'Enter your credit score',
          orderIndex: 1
        },
        { 
          id: 402, 
          sectionId: 4,
          label: 'Previous Defaults',
          fieldType: 'select',
          endpointURL: '/dropdown/default-history',
          isRequired: true,
          orderIndex: 2
        }
      ]
    };
    
    return successResponse(defaultFields[sectionId] || []);
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

// API functions for Risk Configuration
export const getRiskConfiguration = async (companyId?: number, tenantId: string = 'tenant1'): Promise<ApiResponse<RiskConfiguration>> => {
  try {
    // Mock response for the updated model structure
    const mockConfig: RiskConfiguration = {
      id: 1,
      name: "Standard Risk Assessment",
      version: "1.0.0",
      companyId: companyId || 1, // Use provided company ID or default to 1
    };
    
    // Also create mock company sections for the configuration
    const mockCompanySections: RiskCompanySection[] = [
      {
        id: 1,
        companyId: mockConfig.id,
        sectionId: 1,
        isActive: true,
        weightage: 30,
        fields: [
          {
            id: 1,
            companySectionId: 1,
            fieldId: 101,
            isActive: true,
            maxScore: 0,
            conditions: []
          },
          {
            id: 2,
            companySectionId: 1,
            fieldId: 102,
            isActive: true,
            maxScore: 30,
            conditions: [
              {
                id: 1,
                companyFieldId: 2,
                fieldValueMappingId: 1,
                operator: "between",
                value: "18",
                valueTo: "25",
                riskScore: 30
              },
              {
                id: 2,
                companyFieldId: 2,
                fieldValueMappingId: 2,
                operator: "between",
                value: "26",
                valueTo: "40",
                riskScore: 20
              },
              {
                id: 3,
                companyFieldId: 2,
                fieldValueMappingId: 3,
                operator: ">",
                value: "40",
                riskScore: 10
              }
            ]
          }
        ]
      },
      {
        id: 2,
        companyId: mockConfig.id,
        sectionId: 2,
        isActive: true,
        weightage: 40,
        fields: [
          {
            id: 3,
            companySectionId: 2,
            fieldId: 201,
            isActive: true,
            maxScore: 40,
            conditions: [
              {
                id: 4,
                companyFieldId: 3,
                fieldValueMappingId: 4,
                operator: "<",
                value: "30000",
                riskScore: 40
              },
              {
                id: 5,
                companyFieldId: 3,
                fieldValueMappingId: 5,
                operator: "between",
                value: "30000",
                valueTo: "70000",
                riskScore: 20
              },
              {
                id: 6,
                companyFieldId: 3,
                fieldValueMappingId: 6,
                operator: ">",
                value: "70000",
                riskScore: 10
              }
            ]
          }
        ]
      },
      {
        id: 3,
        companyId: mockConfig.id,
        sectionId: 3,
        isActive: true,
        weightage: 30,
        fields: [
          {
            id: 4,
            companySectionId: 3,
            fieldId: 301,
            isActive: true,
            maxScore: 30,
            conditions: [
              {
                id: 7,
                companyFieldId: 4,
                fieldValueMappingId: 7,
                riskScore: 10
              },
              {
                id: 8,
                companyFieldId: 4,
                fieldValueMappingId: 8,
                riskScore: 20
              },
              {
                id: 9,
                companyFieldId: 4,
                fieldValueMappingId: 9,
                riskScore: 30
              }
            ]
          }
        ]
      }
    ];
    
    // Also create mock sections
    const mockSections: RiskSection[] = [
      { id: 1, sectionName: "Personal Information" },
      { id: 2, sectionName: "Financial History" },
      { id: 3, sectionName: "Employment Details" }
    ];
    
    // Also create mock fields
    const mockFields: RiskField[] = [
      { 
        id: 101, 
        sectionId: 1,
        label: "Full Name",
        fieldType: "text",
        isRequired: true,
        placeholder: "Enter your full name",
        orderIndex: 1
      },
      { 
        id: 102, 
        sectionId: 1,
        label: "Age",
        fieldType: "number",
        isRequired: true,
        placeholder: "Enter your age",
        orderIndex: 2
      },
      { 
        id: 201, 
        sectionId: 2,
        label: "Annual Income",
        fieldType: "number",
        isRequired: true,
        placeholder: "Enter your annual income",
        orderIndex: 1
      },
      { 
        id: 301, 
        sectionId: 3,
        label: "Employment Status",
        fieldType: "select",
        endpointURL: "/dropdown/employment-status",
        isRequired: true,
        orderIndex: 1,
        valueMappings: [
          { id: 7, text: "Employed", value: 1, fieldId: 301 },
          { id: 8, text: "Self-Employed", value: 2, fieldId: 301 },
          { id: 9, text: "Unemployed", value: 3, fieldId: 301 }
        ]
      }
    ];

    // Fix for error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'
    // This is likely related to the tenantId parameter being passed to a function expecting a companyId (number)
    const companyIdNumber = typeof companyId === 'string' ? parseInt(companyId, 10) : (companyId || 1);
    
    // Return just the configuration object for now
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

// Helper function to convert operator to condition type
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
export const getRiskConfigurationLegacy = async (tenantId: string = 'tenant1'): Promise<ApiResponse<RiskConfiguration_Legacy>> => {
  try {
    const response = await getRiskConfiguration(tenantId);
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

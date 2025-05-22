
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
          section: { id: 1, sectionName: 'Personal Information' },
          label: 'Full Name',
          fieldType: 'text',
          isRequired: true,
          placeholder: 'Enter your full name',
          orderIndex: 1
        },
        { 
          id: 102, 
          section: { id: 1, sectionName: 'Personal Information' },
          label: 'Age',
          fieldType: 'number',
          isRequired: true,
          placeholder: 'Enter your age',
          orderIndex: 2
        },
        { 
          id: 103, 
          section: { id: 1, sectionName: 'Personal Information' },
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
          section: { id: 2, sectionName: 'Financial History' },
          label: 'Annual Income',
          fieldType: 'number',
          isRequired: true,
          placeholder: 'Enter your annual income',
          orderIndex: 1
        },
        { 
          id: 202, 
          section: { id: 2, sectionName: 'Financial History' },
          label: 'Has Existing Loans',
          fieldType: 'checkbox',
          isRequired: true,
          orderIndex: 2
        }
      ],
      3: [ // Employment Details
        { 
          id: 301, 
          section: { id: 3, sectionName: 'Employment Details' },
          label: 'Employment Status',
          fieldType: 'select',
          endpointURL: '/dropdown/employment-status',
          isRequired: true,
          orderIndex: 1
        },
        { 
          id: 302, 
          section: { id: 3, sectionName: 'Employment Details' },
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
          section: { id: 4, sectionName: 'Credit History' },
          label: 'Credit Score',
          fieldType: 'number',
          isRequired: true,
          placeholder: 'Enter your credit score',
          orderIndex: 1
        },
        { 
          id: 402, 
          section: { id: 4, sectionName: 'Credit History' },
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
    // Mock response for the new model structure
    const mockConfig: RiskConfiguration = {
      id: 1,
      name: "Standard Risk Assessment",
      version: "1.0.0",
      companyId: companyId || 1, // Use provided company ID or default to 1
      companySections: [
        {
          id: 1,
          company: { id: 1, name: "Standard Risk Assessment", version: "1.0.0" },
          section: { id: 1, sectionName: "Personal Information" },
          isActive: true,
          weightage: 30,
          fields: [
            {
              id: 1,
              companySection: { id: 1 } as RiskCompanySection,
              field: {
                id: 101,
                section: { id: 1, sectionName: "Personal Information" },
                label: "Full Name",
                fieldType: "text",
                isRequired: true,
                placeholder: "Enter your full name",
                orderIndex: 1
              },
              isActive: true,
              maxScore: 0,
              conditions: []
            },
            {
              id: 2,
              companySection: { id: 1 } as RiskCompanySection,
              field: {
                id: 102,
                section: { id: 1, sectionName: "Personal Information" },
                label: "Age",
                fieldType: "number",
                isRequired: true,
                placeholder: "Enter your age",
                orderIndex: 2
              },
              isActive: true,
              maxScore: 30,
              conditions: [
                {
                  id: 1,
                  companyField: { id: 2 } as RiskCompanyField,
                  fieldValueMapping: { id: 1, text: "18-25", value: 1 } as RiskFieldValueMapping,
                  operator: "between",
                  value: "18",
                  valueTo: "25",
                  riskScore: 30
                },
                {
                  id: 2,
                  companyField: { id: 2 } as RiskCompanyField,
                  fieldValueMapping: { id: 2, text: "26-40", value: 2 } as RiskFieldValueMapping,
                  operator: "between",
                  value: "26",
                  valueTo: "40",
                  riskScore: 20
                },
                {
                  id: 3,
                  companyField: { id: 2 } as RiskCompanyField,
                  fieldValueMapping: { id: 3, text: "41+", value: 3 } as RiskFieldValueMapping,
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
          company: { id: 1, name: "Standard Risk Assessment", version: "1.0.0" },
          section: { id: 2, sectionName: "Financial History" },
          isActive: true,
          weightage: 40,
          fields: [
            {
              id: 3,
              companySection: { id: 2 } as RiskCompanySection,
              field: {
                id: 201,
                section: { id: 2, sectionName: "Financial History" },
                label: "Annual Income",
                fieldType: "number",
                isRequired: true,
                placeholder: "Enter your annual income",
                orderIndex: 1
              },
              isActive: true,
              maxScore: 40,
              conditions: [
                {
                  id: 4,
                  companyField: { id: 3 } as RiskCompanyField,
                  fieldValueMapping: { id: 4, text: "Low Income", value: 1 } as RiskFieldValueMapping,
                  operator: "<",
                  value: "30000",
                  riskScore: 40
                },
                {
                  id: 5,
                  companyField: { id: 3 } as RiskCompanyField,
                  fieldValueMapping: { id: 5, text: "Medium Income", value: 2 } as RiskFieldValueMapping,
                  operator: "between",
                  value: "30000",
                  valueTo: "70000",
                  riskScore: 20
                },
                {
                  id: 6,
                  companyField: { id: 3 } as RiskCompanyField,
                  fieldValueMapping: { id: 6, text: "High Income", value: 3 } as RiskFieldValueMapping,
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
          company: { id: 1, name: "Standard Risk Assessment", version: "1.0.0" },
          section: { id: 3, sectionName: "Employment Details" },
          isActive: true,
          weightage: 30,
          fields: [
            {
              id: 4,
              companySection: { id: 3 } as RiskCompanySection,
              field: {
                id: 301,
                section: { id: 3, sectionName: "Employment Details" },
                label: "Employment Status",
                fieldType: "select",
                endpointURL: "/dropdown/employment-status",
                isRequired: true,
                orderIndex: 1,
                valueMappings: [
                  { id: 7, text: "Employed", value: 1, field: { id: 301 } as RiskField },
                  { id: 8, text: "Self-Employed", value: 2, field: { id: 301 } as RiskField },
                  { id: 9, text: "Unemployed", value: 3, field: { id: 301 } as RiskField }
                ]
              },
              isActive: true,
              maxScore: 30,
              conditions: [
                {
                  id: 7,
                  companyField: { id: 4 } as RiskCompanyField,
                  fieldValueMapping: { id: 7, text: "Employed", value: 1 } as RiskFieldValueMapping,
                  riskScore: 10
                },
                {
                  id: 8,
                  companyField: { id: 4 } as RiskCompanyField,
                  fieldValueMapping: { id: 8, text: "Self-Employed", value: 2 } as RiskFieldValueMapping,
                  riskScore: 20
                },
                {
                  id: 9,
                  companyField: { id: 4 } as RiskCompanyField,
                  fieldValueMapping: { id: 9, text: "Unemployed", value: 3 } as RiskFieldValueMapping,
                  riskScore: 30
                }
              ]
            }
          ]
        }
      ]
    };
    
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

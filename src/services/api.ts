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
    if (!response.data?.isSuccess) {
      throw new Error('API returned unsuccessful response');
    }
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
    if (!response.data?.isSuccess) {
      throw new Error('API returned unsuccessful response');
    }
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
    if (!response.data?.isSuccess) {
      throw new Error('API returned unsuccessful response');
    }
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
    
    // Check if response is successful and has a value
    if (!response.data?.isSuccess || !response.data.value) {
      throw new Error('API returned unsuccessful response or no data');
    }
    
    return response.data;
  } catch (error) {
    console.log('Falling back to mock companies:', error);
    console.log('Using mock company data:', mockCompanies);
    
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
    
    // Validate the response structure more thoroughly
    if (!response.data) {
      console.error('API returned empty response');
      throw new Error('Empty API response');
    }
    
    if (!response.data.isSuccess) {
      console.error('API returned unsuccessful response:', response.data);
      throw new Error('API returned unsuccessful response');
    }
    
    if (!response.data.value) {
      console.error('API response missing value property:', response.data);
      throw new Error('API response missing value property');
    }
    
    return response.data;
  } catch (error) {
    console.log('Falling back to mock configuration:', error);
    
    // Convert companyId to number if it's a string
    const companyIdNumber = typeof companyId === 'string' ? parseInt(companyId, 10) : (companyId || 1);

    // Find company from mock data
    const company = mockCompanies.find(c => c.id === companyIdNumber) || mockCompanies[0];
    
    console.log(`Creating configuration for company: ${company.name} (ID: ${company.id})`);
    
    // Get mock configuration
    const mockConfig: RiskConfiguration = {
      id: company.configId || 1,
      name: `${company.name} Risk Assessment`,
      version: "1.0.0",
      companyId: company.id,
      companySections: []
    };
    
    // Create default configuration with all sections and fields active
    console.log(`Creating default configuration with all sections for company ${company.id}`);
    
    mockConfig.companySections = mockSections.map(section => {
      const companySection: RiskCompanySection = {
        id: section.id * 100 + company.id,
        companyId: company.id,
        sectionId: section.id,
        isActive: true,
        weightage: Math.floor(100 / mockSections.length),
        section: section,
        fields: []
      };
      
      // Add all fields for this section with proper field data
      const sectionFields = mockFields.filter(f => f.sectionId === section.id);
      companySection.fields = sectionFields.map(field => {
        const companyField: RiskCompanyField = {
          id: field.id * 100 + company.id,
          companySectionId: companySection.id,
          fieldId: field.id,
          isActive: true,
          maxScore: 100,
          field: field, // Make sure field data is included
          conditions: []
        };
        
        // Add value mappings as conditions if they exist
        if (field.valueMappings && field.valueMappings.length > 0) {
          companyField.conditions = field.valueMappings.map(mapping => {
            return {
              id: mapping.id * 100 + company.id,
              companyFieldId: companyField.id,
              fieldValueMappingId: mapping.id,
              operator: '=',
              riskScore: 0,
              fieldValueMapping: mapping
            };
          });
        }
        
        return companyField;
      });
      
      return companySection;
    });
    
    console.log(`Created configuration with ${mockConfig.companySections.length} sections`);
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
    // Try to fetch from real API first
    const response = await api.get<ApiResponse<PaginatedResponse<UserProfile>>>('/risk/profiles', {
      headers: getPaginationHeaders(page, pageSize, searchQuery),
    });
    
    if (!response.data?.isSuccess) {
      throw new Error('API returned unsuccessful response');
    }
    
    return response.data;
  } catch (error) {
    console.log('Falling back to mock user profiles:', error);
    
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
    
    if (!response.data?.isSuccess) {
      throw new Error('API returned unsuccessful response');
    }
    
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
    
    console.log('Using mock version history data:', filteredHistory);
    return successResponse(filteredHistory);
  }
};

// Mock sanction list data
const mockSanctionList = [
  { id: 1, name: "John Smith", type: "Individual", country: "US", dateAdded: "2023-01-15", status: "Active" },
  { id: 2, name: "ABC Corp", type: "Entity", country: "RU", dateAdded: "2023-02-20", status: "Active" },
  { id: 3, name: "Jane Doe", type: "Individual", country: "IR", dateAdded: "2023-03-10", status: "Inactive" }
];

// New API functions for Excel/CSV import
export const importSectionsFromFile = async (file: File, tenantId: string = 'tenant1'): Promise<ApiResponse<RiskSection[]>> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<RiskSection[]>>('/risk/sections/import', formData, {
      headers: {
        ...getDefaultHeaders(tenantId),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.log('Falling back to mock sections import:', error);
    // Mock success response
    return successResponse([
      { id: 100, sectionName: "Imported Section 1", weightage: 25, isActive: true },
      { id: 101, sectionName: "Imported Section 2", weightage: 30, isActive: true }
    ]);
  }
};

export const importFieldsFromFile = async (file: File, sectionId: number, tenantId: string = 'tenant1'): Promise<ApiResponse<RiskField[]>> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sectionId', sectionId.toString());
    
    const response = await api.post<ApiResponse<RiskField[]>>(`/risk/sections/${sectionId}/fields/import`, formData, {
      headers: {
        ...getDefaultHeaders(tenantId),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.log('Falling back to mock fields import:', error);
    // Mock success response
    return successResponse([
      { 
        id: 200, 
        sectionId, 
        label: "Imported Field 1", 
        fieldType: "text", 
        isRequired: true, 
        placeholder: "",
        endpointURL: "", 
        orderIndex: 1,
        valueMappings: [] 
      },
      { 
        id: 201, 
        sectionId, 
        label: "Imported Field 2", 
        fieldType: "select", 
        isRequired: false, 
        placeholder: "",
        endpointURL: "", 
        orderIndex: 2,
        valueMappings: [] 
      }
    ]);
  }
};

// Enhanced version history with detailed changes
export const getVersionHistoryDetails = async (versionId: number, tenantId: string = 'tenant1'): Promise<ApiResponse<any>> => {
  try {
    const response = await api.get<ApiResponse<any>>(`/risk/version-history/${versionId}/details`, {
      headers: getDefaultHeaders(tenantId)
    });
    return response.data;
  } catch (error) {
    console.log('Falling back to mock version details:', error);
    // Mock detailed changes
    return successResponse({
      id: versionId,
      changes: {
        sections: {
          added: [{ id: 1, name: "New Risk Section" }],
          modified: [{ id: 2, name: "Updated Compliance Section", changes: ["weightage: 20 -> 25"] }],
          removed: []
        },
        fields: {
          added: [{ id: 10, sectionId: 1, name: "Credit Score" }],
          modified: [{ id: 11, sectionId: 2, name: "Income Level", changes: ["required: false -> true"] }],
          removed: []
        }
      }
    });
  }
};

// Sanction list management API functions
export const getSanctionList = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: { name?: string; type?: string; country?: string },
  tenantId: string = 'tenant1'
): Promise<ApiResponse<PaginatedResponse<any>>> => {
  try {
    const response = await api.get<ApiResponse<PaginatedResponse<any>>>('/risk/sanctions', {
      headers: getPaginationHeaders(page, pageSize, searchQuery),
    });
    return response.data;
  } catch (error) {
    console.log('Falling back to mock sanction list:', error);
    
    let filteredSanctions = [...mockSanctionList];
    
    if (searchQuery?.name) {
      filteredSanctions = filteredSanctions.filter(s => 
        s.name.toLowerCase().includes(searchQuery.name!.toLowerCase())
      );
    }
    
    if (searchQuery?.type) {
      filteredSanctions = filteredSanctions.filter(s => s.type === searchQuery.type);
    }
    
    if (searchQuery?.country) {
      filteredSanctions = filteredSanctions.filter(s => s.country === searchQuery.country);
    }
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedSanctions = filteredSanctions.slice(start, end);
    
    return paginatedSuccessResponse(paginatedSanctions, page, pageSize, filteredSanctions.length);
  }
};

export const addSanctionEntry = async (entry: any, tenantId: string = 'tenant1'): Promise<ApiResponse<any>> => {
  try {
    const response = await api.post<ApiResponse<any>>('/risk/sanctions', entry, {
      headers: getDefaultHeaders(tenantId)
    });
    return response.data;
  } catch (error) {
    console.log('Falling back to mock sanction add:', error);
    return successResponse({
      ...entry,
      id: Date.now(),
      dateAdded: new Date().toISOString().split('T')[0]
    });
  }
};

export const updateSanctionEntry = async (id: number, entry: any, tenantId: string = 'tenant1'): Promise<ApiResponse<any>> => {
  try {
    const response = await api.put<ApiResponse<any>>(`/risk/sanctions/${id}`, entry, {
      headers: getDefaultHeaders(tenantId)
    });
    return response.data;
  } catch (error) {
    console.log('Falling back to mock sanction update:', error);
    return successResponse({ ...entry, id });
  }
};

export const deleteSanctionEntry = async (id: number, tenantId: string = 'tenant1'): Promise<ApiResponse<boolean>> => {
  try {
    const response = await api.delete<ApiResponse<boolean>>(`/risk/sanctions/${id}`, {
      headers: getDefaultHeaders(tenantId)
    });
    return response.data;
  } catch (error) {
    console.log('Falling back to mock sanction delete:', error);
    return successResponse(true);
  }
};

export const importSanctionListFromFile = async (file: File, tenantId: string = 'tenant1'): Promise<ApiResponse<any[]>> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<any[]>>('/risk/sanctions/import', formData, {
      headers: {
        ...getDefaultHeaders(tenantId),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.log('Falling back to mock sanction import:', error);
    return successResponse([
      { id: 100, name: "Imported Person 1", type: "Individual", country: "CN", dateAdded: new Date().toISOString().split('T')[0], status: "Active" },
      { id: 101, name: "Imported Company 1", type: "Entity", country: "KP", dateAdded: new Date().toISOString().split('T')[0], status: "Active" }
    ]);
  }
};

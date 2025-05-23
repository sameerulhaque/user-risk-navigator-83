
// Add the following to the existing mockData.ts file

import { VersionHistory } from '@/types/risk';
import { RiskScore, Company, UserProfile, RiskSection, RiskField, RiskCompanySection, RiskFieldValueMapping } from '@/types/risk';

// Basic mock companies
export const mockCompanies: Company[] = [
  {
    id: 1,
    name: "Company A",
    configId: 1
  },
  {
    id: 2,
    name: "Company B",
    configId: 2
  },
  {
    id: 3,
    name: "Company C",
    configId: 3
  }
];

// Mock sections data
export const mockSections: RiskSection[] = [
  {
    id: 1,
    sectionName: "General Information"
  },
  {
    id: 2,
    sectionName: "Financial Assessment"
  },
  {
    id: 3,
    sectionName: "Security Analysis"
  },
  {
    id: 4,
    sectionName: "Compliance"
  }
];

// Mock fields with value mappings
export const mockFields: RiskField[] = [
  {
    id: 1,
    sectionId: 1,
    label: "Business Type",
    fieldType: "select",
    isRequired: true,
    orderIndex: 1,
    valueMappings: [
      { id: 1, fieldId: 1, text: "Small Business", value: 1 },
      { id: 2, fieldId: 1, text: "Corporation", value: 2 },
      { id: 3, fieldId: 1, text: "Non-Profit", value: 3 }
    ]
  },
  {
    id: 2,
    sectionId: 1,
    label: "Years in Operation",
    fieldType: "number",
    isRequired: true,
    orderIndex: 2
  },
  {
    id: 3,
    sectionId: 2,
    label: "Annual Revenue",
    fieldType: "number",
    isRequired: true,
    orderIndex: 1
  },
  {
    id: 4,
    sectionId: 2,
    label: "Credit Score",
    fieldType: "number",
    isRequired: true,
    orderIndex: 2
  },
  {
    id: 5,
    sectionId: 3,
    label: "Security Protocols",
    fieldType: "select",
    isRequired: true,
    orderIndex: 1,
    valueMappings: [
      { id: 4, fieldId: 5, text: "Basic", value: 1 },
      { id: 5, fieldId: 5, text: "Advanced", value: 2 },
      { id: 6, fieldId: 5, text: "Enterprise", value: 3 }
    ]
  },
  {
    id: 6,
    sectionId: 3,
    label: "Breach History",
    fieldType: "select",
    isRequired: true,
    orderIndex: 2,
    valueMappings: [
      { id: 7, fieldId: 6, text: "None", value: 1 },
      { id: 8, fieldId: 6, text: "Minor", value: 2 },
      { id: 9, fieldId: 6, text: "Major", value: 3 }
    ]
  },
  {
    id: 7,
    sectionId: 4,
    label: "Industry Certifications",
    fieldType: "select",
    isRequired: true,
    orderIndex: 1,
    valueMappings: [
      { id: 10, fieldId: 7, text: "None", value: 1 },
      { id: 11, fieldId: 7, text: "Basic", value: 2 },
      { id: 12, fieldId: 7, text: "Advanced", value: 3 }
    ]
  },
  {
    id: 8,
    sectionId: 4,
    label: "Legal Issues",
    fieldType: "select",
    isRequired: true,
    orderIndex: 2,
    valueMappings: [
      { id: 13, fieldId: 8, text: "None", value: 1 },
      { id: 14, fieldId: 8, text: "Minor", value: 2 },
      { id: 15, fieldId: 8, text: "Major", value: 3 }
    ]
  }
];

// Mock company sections (configuration)
export const mockCompanySections: RiskCompanySection[] = [
  {
    id: 1,
    companyId: 1,
    sectionId: 1,
    isActive: true,
    weightage: 25
  },
  {
    id: 2,
    companyId: 1,
    sectionId: 2,
    isActive: true,
    weightage: 25
  },
  {
    id: 3,
    companyId: 1,
    sectionId: 3,
    isActive: true,
    weightage: 25
  },
  {
    id: 4,
    companyId: 1,
    sectionId: 4,
    isActive: true,
    weightage: 25
  }
];

// Mock dropdown data for API endpoints
export const mockDropdownData: Record<string, {id: number; label: string}[]> = {
  '/api/countries': [
    {id: 1, label: 'United States'},
    {id: 2, label: 'Canada'},
    {id: 3, label: 'United Kingdom'},
    {id: 4, label: 'Australia'}
  ],
  '/api/industries': [
    {id: 1, label: 'Technology'},
    {id: 2, label: 'Finance'},
    {id: 3, label: 'Healthcare'},
    {id: 4, label: 'Education'}
  ],
  '/api/company-types': [
    {id: 1, label: 'Small Business'},
    {id: 2, label: 'Corporation'},
    {id: 3, label: 'Non-Profit'},
    {id: 4, label: 'Government'}
  ]
};

// Mock user data
export const mockUsers: UserProfile[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    riskScore: 85,
    status: "Pending",
    submissionDate: "2023-04-15T10:30:00Z"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    riskScore: 42,
    status: "Approved",
    submissionDate: "2023-04-10T14:15:00Z"
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    riskScore: 78,
    status: "Rejected",
    submissionDate: "2023-04-08T09:45:00Z"
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    riskScore: 65,
    status: "Pending",
    submissionDate: "2023-04-12T16:20:00Z"
  },
  {
    id: 5,
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    riskScore: 35,
    status: "Approved",
    submissionDate: "2023-04-05T11:10:00Z"
  }
];

// Mock risk configuration for testing
export const mockRiskConfiguration = {
  id: 1,
  name: "Standard Risk Assessment",
  version: "1.0.0",
  companyId: 1
};

// Mock risk score data
export const mockRiskScore: RiskScore = {
  userId: 1,
  totalScore: 72,
  sectionScores: [
    {
      sectionId: 1,
      sectionName: "General Information",
      score: 18,
      maxPossible: 25
    },
    {
      sectionId: 2,
      sectionName: "Financial Assessment",
      score: 20,
      maxPossible: 25
    },
    {
      sectionId: 3,
      sectionName: "Security Analysis",
      score: 15,
      maxPossible: 25
    },
    {
      sectionId: 4,
      sectionName: "Compliance",
      score: 19,
      maxPossible: 25
    }
  ],
  status: "Pending",
  createdAt: "2023-05-01T10:00:00Z",
  updatedAt: "2023-05-01T10:00:00Z"
};

// Mock version history data
export const mockVersionHistory: VersionHistory[] = [
  {
    id: 1,
    entityType: 'configuration',
    entityId: 1,
    version: '1.0.0',
    timestamp: '2023-05-20T10:30:00Z',
    changes: 'Initial configuration created',
    userId: 1,
    userName: 'Admin User'
  },
  {
    id: 2,
    entityType: 'configuration',
    entityId: 1,
    version: '1.0.1',
    timestamp: '2023-05-21T14:15:00Z',
    changes: 'Updated section weightages',
    userId: 1,
    userName: 'Admin User'
  },
  {
    id: 3,
    entityType: 'configuration',
    entityId: 1,
    version: '1.0.2',
    timestamp: '2023-05-22T09:45:00Z',
    changes: 'Modified field condition scores',
    userId: 2,
    userName: 'Configuration Manager'
  },
  {
    id: 4,
    entityType: 'configuration',
    entityId: 2,
    version: '1.0.0',
    timestamp: '2023-05-23T11:20:00Z',
    changes: 'Created configuration for Company B',
    userId: 1,
    userName: 'Admin User'
  },
  {
    id: 5,
    entityType: 'submission',
    entityId: 1,
    version: '1.0.0',
    timestamp: '2023-05-25T15:30:00Z',
    changes: 'Initial submission',
    userId: 3,
    userName: 'John Smith'
  },
  {
    id: 6,
    entityType: 'submission',
    entityId: 1,
    version: '1.0.1',
    timestamp: '2023-05-26T10:15:00Z',
    changes: 'Updated status to Approved',
    userId: 1,
    userName: 'Admin User'
  },
  {
    id: 7,
    entityType: 'submission',
    entityId: 2,
    version: '1.0.0',
    timestamp: '2023-05-27T14:45:00Z',
    changes: 'Initial submission',
    userId: 4,
    userName: 'Jane Doe'
  },
  {
    id: 8,
    entityType: 'submission',
    entityId: 2,
    version: '1.0.1',
    timestamp: '2023-05-28T09:30:00Z',
    changes: 'Updated status to Rejected',
    userId: 2,
    userName: 'Configuration Manager'
  },
  {
    id: 9,
    entityType: 'configuration',
    entityId: 1,
    version: '1.1.0',
    timestamp: '2023-06-01T11:00:00Z',
    changes: 'Major update to risk scoring algorithm',
    userId: 1,
    userName: 'Admin User'
  },
  {
    id: 10,
    entityType: 'configuration',
    entityId: 3,
    version: '1.0.0',
    timestamp: '2023-06-05T16:20:00Z',
    changes: 'Created configuration for Company C',
    userId: 2,
    userName: 'Configuration Manager'
  }
];

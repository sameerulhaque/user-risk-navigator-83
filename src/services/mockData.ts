import { 
  RiskConfiguration, 
  RiskScore, 
  UserProfile,
  RiskConfiguration_Legacy,
  Section,
  RiskSection,
  RiskField,
  RiskFieldValueMapping,
  RiskCompanySection,
  RiskCompanyField,
  RiskCompanyFieldCondition,
  Company
} from '@/types/risk';

// Mock companies
export const mockCompanies: Company[] = [
  { id: 1, name: "ABC Corporation", configId: 1 },
  { id: 2, name: "XYZ Industries", configId: 2 },
  { id: 3, name: "Global Enterprises", configId: 3 },
  { id: 4, name: "Tech Solutions", configId: 4 },
  { id: 5, name: "Finance Partners", configId: 5 }
];

// Mock sections
export const mockSections: RiskSection[] = [
  { id: 1, sectionName: "Personal Information" },
  { id: 2, sectionName: "Financial History" },
  { id: 3, sectionName: "Employment Details" },
  { id: 4, sectionName: "Credit History" }
];

// Mock fields
export const mockFields: RiskField[] = [
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
    id: 103, 
    sectionId: 1,
    label: "Marital Status",
    fieldType: "select",
    endpointURL: "/dropdown/marital-status",
    isRequired: true,
    orderIndex: 3
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
    id: 202, 
    sectionId: 2,
    label: "Has Existing Loans",
    fieldType: "checkbox",
    isRequired: true,
    orderIndex: 2
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
  },
  { 
    id: 302, 
    sectionId: 3,
    label: "Years at Current Job",
    fieldType: "number",
    isRequired: true,
    placeholder: "Enter years at current job",
    orderIndex: 2
  }
];

// Mock value mappings
export const mockValueMappings: RiskFieldValueMapping[] = [
  { id: 1, text: "18-25", value: 1, fieldId: 102 },
  { id: 2, text: "26-40", value: 2, fieldId: 102 },
  { id: 3, text: "41+", value: 3, fieldId: 102 },
  { id: 4, text: "Low Income", value: 1, fieldId: 201 },
  { id: 5, text: "Medium Income", value: 2, fieldId: 201 },
  { id: 6, text: "High Income", value: 3, fieldId: 201 }
];

// Mock configuration
export const mockRiskConfiguration_New: RiskConfiguration = {
  id: 1,
  name: "Standard Risk Assessment",
  version: "1.0.0",
  companyId: 1
};

// Mock company sections with better organization and more data
export const mockCompanySections: RiskCompanySection[] = [
  {
    id: 1,
    companyId: 1,
    sectionId: 1,
    isActive: true,
    weightage: 30,
    section: { id: 1, sectionName: "Personal Information" },
    fields: [
      {
        id: 1,
        companySectionId: 1,
        fieldId: 101,
        isActive: true,
        maxScore: 0,
        field: { 
          id: 101, 
          sectionId: 1,
          label: "Full Name",
          fieldType: "text",
          isRequired: true,
          placeholder: "Enter your full name",
          orderIndex: 1
        },
        conditions: []
      },
      {
        id: 2,
        companySectionId: 1,
        fieldId: 102,
        isActive: true,
        maxScore: 30,
        field: { 
          id: 102, 
          sectionId: 1,
          label: "Age",
          fieldType: "number",
          isRequired: true,
          placeholder: "Enter your age",
          orderIndex: 2
        },
        conditions: [
          {
            id: 1,
            companyFieldId: 2,
            fieldValueMappingId: 1,
            operator: "between",
            value: "18",
            valueTo: "25",
            riskScore: 30,
            fieldValueMapping: { id: 1, text: "18-25", value: 1, fieldId: 102 }
          },
          {
            id: 2,
            companyFieldId: 2,
            fieldValueMappingId: 2,
            operator: "between",
            value: "26",
            valueTo: "40",
            riskScore: 20,
            fieldValueMapping: { id: 2, text: "26-40", value: 2, fieldId: 102 }
          },
          {
            id: 3,
            companyFieldId: 2,
            fieldValueMappingId: 3,
            operator: ">",
            value: "40",
            riskScore: 10,
            fieldValueMapping: { id: 3, text: "41+", value: 3, fieldId: 102 }
          }
        ]
      },
      {
        id: 3,
        companySectionId: 1,
        fieldId: 103,
        isActive: true,
        maxScore: 20,
        field: { 
          id: 103, 
          sectionId: 1,
          label: "Marital Status",
          fieldType: "select",
          endpointURL: "/dropdown/marital-status",
          isRequired: true,
          orderIndex: 3
        },
        conditions: []
      }
    ]
  },
  {
    id: 2,
    companyId: 1,
    sectionId: 2,
    isActive: true,
    weightage: 40,
    section: { id: 2, sectionName: "Financial History" },
    fields: [
      {
        id: 4,
        companySectionId: 2,
        fieldId: 201,
        isActive: true,
        maxScore: 40,
        field: { 
          id: 201, 
          sectionId: 2,
          label: "Annual Income",
          fieldType: "number",
          isRequired: true,
          placeholder: "Enter your annual income",
          orderIndex: 1
        },
        conditions: [
          {
            id: 4,
            companyFieldId: 4,
            fieldValueMappingId: 4,
            operator: "<",
            value: "30000",
            riskScore: 40,
            fieldValueMapping: { id: 4, text: "Low Income", value: 1, fieldId: 201 }
          },
          {
            id: 5,
            companyFieldId: 4,
            fieldValueMappingId: 5,
            operator: "between",
            value: "30000",
            valueTo: "70000",
            riskScore: 20,
            fieldValueMapping: { id: 5, text: "Medium Income", value: 2, fieldId: 201 }
          },
          {
            id: 6,
            companyFieldId: 4,
            fieldValueMappingId: 6,
            operator: ">",
            value: "70000",
            riskScore: 10,
            fieldValueMapping: { id: 6, text: "High Income", value: 3, fieldId: 201 }
          }
        ]
      },
      {
        id: 5,
        companySectionId: 2,
        fieldId: 202,
        isActive: true,
        maxScore: 30,
        field: { 
          id: 202, 
          sectionId: 2,
          label: "Has Existing Loans",
          fieldType: "checkbox",
          isRequired: true,
          orderIndex: 2
        },
        conditions: []
      }
    ]
  },
  {
    id: 3,
    companyId: 1,
    sectionId: 3,
    isActive: true,
    weightage: 30,
    section: { id: 3, sectionName: "Employment Details" },
    fields: [
      {
        id: 6,
        companySectionId: 3,
        fieldId: 301,
        isActive: true,
        maxScore: 30,
        field: { 
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
        },
        conditions: [
          {
            id: 7,
            companyFieldId: 6,
            fieldValueMappingId: 7,
            operator: "=",
            value: "1",
            riskScore: 10,
            fieldValueMapping: { id: 7, text: "Employed", value: 1, fieldId: 301 }
          },
          {
            id: 8,
            companyFieldId: 6,
            fieldValueMappingId: 8,
            operator: "=",
            value: "2",
            riskScore: 20,
            fieldValueMapping: { id: 8, text: "Self-Employed", value: 2, fieldId: 301 }
          },
          {
            id: 9,
            companyFieldId: 6,
            fieldValueMappingId: 9,
            operator: "=",
            value: "3",
            riskScore: 30,
            fieldValueMapping: { id: 9, text: "Unemployed", value: 3, fieldId: 301 }
          }
        ]
      },
      {
        id: 7,
        companySectionId: 3,
        fieldId: 302,
        isActive: true,
        maxScore: 20,
        field: { 
          id: 302, 
          sectionId: 3,
          label: "Years at Current Job",
          fieldType: "number",
          isRequired: true,
          placeholder: "Enter years at current job",
          orderIndex: 2
        },
        conditions: []
      }
    ]
  },
  // Company 2 sections
  {
    id: 4,
    companyId: 2,
    sectionId: 1,
    isActive: true,
    weightage: 25,
    section: { id: 1, sectionName: "Personal Information" },
    fields: [
      {
        id: 8,
        companySectionId: 4,
        fieldId: 101,
        isActive: true,
        maxScore: 0,
        field: { 
          id: 101, 
          sectionId: 1,
          label: "Full Name",
          fieldType: "text",
          isRequired: true,
          placeholder: "Enter your full name",
          orderIndex: 1
        },
        conditions: []
      },
      {
        id: 9,
        companySectionId: 4,
        fieldId: 102,
        isActive: true,
        maxScore: 25,
        field: { 
          id: 102, 
          sectionId: 1,
          label: "Age",
          fieldType: "number",
          isRequired: true,
          placeholder: "Enter your age",
          orderIndex: 2
        },
        conditions: [
          {
            id: 10,
            companyFieldId: 9,
            fieldValueMappingId: 1,
            operator: "<",
            value: "21",
            riskScore: 25,
            fieldValueMapping: { id: 1, text: "Young Adult", value: 1, fieldId: 102 }
          },
          {
            id: 11,
            companyFieldId: 9,
            fieldValueMappingId: 2,
            operator: "between",
            value: "21",
            valueTo: "65",
            riskScore: 15,
            fieldValueMapping: { id: 2, text: "Adult", value: 2, fieldId: 102 }
          },
          {
            id: 12,
            companyFieldId: 9,
            fieldValueMappingId: 3,
            operator: ">",
            value: "65",
            riskScore: 20,
            fieldValueMapping: { id: 3, text: "Senior", value: 3, fieldId: 102 }
          }
        ]
      }
    ]
  },
  {
    id: 5,
    companyId: 2,
    sectionId: 2,
    isActive: true,
    weightage: 35,
    section: { id: 2, sectionName: "Financial History" },
    fields: [
      {
        id: 10,
        companySectionId: 5,
        fieldId: 201,
        isActive: true,
        maxScore: 35,
        field: { 
          id: 201, 
          sectionId: 2,
          label: "Annual Income",
          fieldType: "number",
          isRequired: true,
          placeholder: "Enter your annual income",
          orderIndex: 1
        },
        conditions: [
          {
            id: 13,
            companyFieldId: 10,
            fieldValueMappingId: 4,
            operator: "<",
            value: "25000",
            riskScore: 35,
            fieldValueMapping: { id: 4, text: "Low Income", value: 1, fieldId: 201 }
          },
          {
            id: 14,
            companyFieldId: 10,
            fieldValueMappingId: 5,
            operator: "between",
            value: "25000",
            valueTo: "75000",
            riskScore: 25,
            fieldValueMapping: { id: 5, text: "Medium Income", value: 2, fieldId: 201 }
          },
          {
            id: 15,
            companyFieldId: 10,
            fieldValueMappingId: 6,
            operator: ">",
            value: "75000",
            riskScore: 15,
            fieldValueMapping: { id: 6, text: "High Income", value: 3, fieldId: 201 }
          }
        ]
      }
    ]
  },
  {
    id: 6,
    companyId: 2,
    sectionId: 3,
    isActive: true,
    weightage: 40,
    section: { id: 3, sectionName: "Employment Details" },
    fields: [
      {
        id: 11,
        companySectionId: 6,
        fieldId: 301,
        isActive: true,
        maxScore: 40,
        field: { 
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
        },
        conditions: [
          {
            id: 16,
            companyFieldId: 11,
            fieldValueMappingId: 7,
            operator: "=",
            value: "1",
            riskScore: 15,
            fieldValueMapping: { id: 7, text: "Employed", value: 1, fieldId: 301 }
          },
          {
            id: 17,
            companyFieldId: 11,
            fieldValueMappingId: 8,
            operator: "=",
            value: "2",
            riskScore: 25,
            fieldValueMapping: { id: 8, text: "Self-Employed", value: 2, fieldId: 301 }
          },
          {
            id: 18,
            companyFieldId: 11,
            fieldValueMappingId: 9,
            operator: "=",
            value: "3",
            riskScore: 40,
            fieldValueMapping: { id: 9, text: "Unemployed", value: 3, fieldId: 301 }
          }
        ]
      }
    ]
  }
];

// Mock risk configuration
export const mockRiskConfiguration: RiskConfiguration_Legacy = {
  id: 1,
  name: "Standard Risk Assessment",
  version: "1.0.0",
  sections: [
    {
      id: 1,
      name: "Personal Information",
      weightage: 30,
      fields: [
        {
          id: 1,
          name: "Age",
          type: "number",
          required: true,
          fieldValues: [
            { id: 1, value: "18-25", condition: "between", conditionType: "between", weightage: 30, condition2: "25" },
            { id: 2, value: "26-40", condition: "between", conditionType: "between", weightage: 20, condition2: "40" },
            { id: 3, value: "41+", condition: ">", conditionType: "greaterThan", weightage: 10 }
          ]
        },
        {
          id: 2,
          name: "Marital Status",
          type: "select",
          valueApi: "/dropdown/marital-status",
          required: true,
          fieldValues: [
            { id: 4, value: "Single", condition: "=", conditionType: "equals", weightage: 25 },
            { id: 5, value: "Married", condition: "=", conditionType: "equals", weightage: 10 },
            { id: 6, value: "Divorced", condition: "=", conditionType: "equals", weightage: 20 }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Financial History",
      weightage: 40,
      fields: [
        {
          id: 3,
          name: "Annual Income",
          type: "number",
          required: true,
          fieldValues: [
            { id: 7, value: "Low Income", condition: "<", conditionType: "lessThan", weightage: 40, condition2: "30000" },
            { id: 8, value: "Medium Income", condition: "between", conditionType: "between", weightage: 20, condition2: "70000" },
            { id: 9, value: "High Income", condition: ">", conditionType: "greaterThan", weightage: 10 }
          ]
        },
        {
          id: 4,
          name: "Existing Loans",
          type: "checkbox",
          required: true,
          fieldValues: [
            { id: 10, value: "Yes", condition: "=", conditionType: "equals", weightage: 30 },
            { id: 11, value: "No", condition: "=", conditionType: "equals", weightage: 10 }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Employment Details",
      weightage: 30,
      fields: [
        {
          id: 5,
          name: "Employment Status",
          type: "select",
          valueApi: "/dropdown/employment-status",
          required: true,
          fieldValues: [
            { id: 12, value: "Employed", condition: "=", conditionType: "equals", weightage: 10 },
            { id: 13, value: "Self-Employed", condition: "=", conditionType: "equals", weightage: 20 },
            { id: 14, value: "Unemployed", condition: "=", conditionType: "equals", weightage: 30 }
          ]
        },
        {
          id: 6,
          name: "Years at Current Job",
          type: "number",
          required: false,
          fieldValues: [
            { id: 15, value: "Less than 1 year", condition: "<", conditionType: "lessThan", weightage: 30, condition2: "1" },
            { id: 16, value: "1-5 years", condition: "between", conditionType: "between", weightage: 20, condition2: "5" },
            { id: 17, value: "More than 5 years", condition: ">", conditionType: "greaterThan", weightage: 10 }
          ]
        }
      ]
    }
  ]
};

// Mock dropdown data for all fields
export const mockDropdownData: Record<string, { id: number; label: string }[]> = {
  "/api/customer-types": [
    { id: 1, label: "Individual" },
    { id: 2, label: "Business" },
    { id: 3, label: "Non-profit Organization" }
  ],
  "/api/occupation-types": [
    { id: 1, label: "Professional" },
    { id: 2, label: "Self-employed" },
    { id: 3, label: "Unemployed" },
    { id: 4, label: "Student" },
    { id: 5, label: "Retired" }
  ],
  "/api/fund-sources": [
    { id: 1, label: "Salary" },
    { id: 2, label: "Business Income" },
    { id: 3, label: "Investment" },
    { id: 4, label: "Inheritance" },
    { id: 5, label: "Loan" }
  ],
  "/api/kyc-levels": [
    { id: 1, label: "Basic" },
    { id: 2, label: "Enhanced" },
    { id: 3, label: "Advanced" }
  ],
  "/api/transaction-history": [
    { id: 1, label: "No history" },
    { id: 2, label: "Less than 1 year" },
    { id: 3, label: "1-3 years" },
    { id: 4, label: "More than 3 years" }
  ],
  "/api/residence-types": [
    { id: 1, label: "Owner" },
    { id: 2, label: "Renter" },
    { id: 3, label: "Living with family" }
  ],
  "/api/transaction-frequency": [
    { id: 1, label: "One-time" },
    { id: 2, label: "Weekly" },
    { id: 3, label: "Monthly" },
    { id: 4, label: "Quarterly" }
  ],
  "/api/transaction-purposes": [
    { id: 1, label: "Family support" },
    { id: 2, label: "Business" },
    { id: 3, label: "Education" },
    { id: 4, label: "Investment" },
    { id: 5, label: "Other" }
  ],
  "/api/payment-methods": [
    { id: 1, label: "Bank transfer" },
    { id: 2, label: "Credit card" },
    { id: 3, label: "Debit card" },
    { id: 4, label: "Cash" },
    { id: 5, label: "Digital wallet" }
  ],
  "/api/verification-levels": [
    { id: 1, label: "Not verified" },
    { id: 2, label: "Basic verification" },
    { id: 3, label: "Enhanced verification" },
    { id: 4, label: "Full verification" }
  ],
  "/api/relationships": [
    { id: 1, label: "Family" },
    { id: 2, label: "Friend" },
    { id: 3, label: "Business" },
    { id: 4, label: "No relation" }
  ],
  "/api/country-risks": [
    { id: 1, label: "Low risk" },
    { id: 2, label: "Medium risk" },
    { id: 3, label: "High risk" }
  ],
  "/api/transaction-patterns": [
    { id: 1, label: "Regular" },
    { id: 2, label: "Irregular" },
    { id: 3, label: "Suspicious" }
  ],
  "/api/account-types": [
    { id: 1, label: "Personal" },
    { id: 2, label: "Business" },
    { id: 3, label: "Joint" }
  ],
  "/api/entity-types": [
    { id: 1, label: "Individual" },
    { id: 2, label: "Small business" },
    { id: 3, label: "Large corporation" },
    { id: 4, label: "Non-profit" }
  ],
  "/api/countries": [
    { id: 1, label: "United States" },
    { id: 2, label: "Canada" },
    { id: 3, label: "United Kingdom" },
    { id: 4, label: "Germany" },
    { id: 5, label: "France" },
    { id: 10, label: "Other" }
  ],
  "/api/business-types": [
    { id: 1, label: "Retail" },
    { id: 2, label: "Services" },
    { id: 3, label: "Manufacturing" },
    { id: 4, label: "Technology" },
    { id: 5, label: "Other" }
  ],
  "/api/job-types": [
    { id: 1, label: "Executive" },
    { id: 2, label: "Professional" },
    { id: 3, label: "Technical" },
    { id: 4, label: "Administrative" },
    { id: 5, label: "Manual labor" }
  ],
  "/api/ip-risks": [
    { id: 1, label: "Low risk" },
    { id: 2, label: "Medium risk" },
    { id: 3, label: "High risk" }
  ],
  "/api/location-matches": [
    { id: 1, label: "Same location" },
    { id: 2, label: "Different cities" },
    { id: 3, label: "Different countries" }
  ]
};

// Mock user profiles
export const mockUsers = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    riskScore: 35,
    status: "Approved",
    submissionDate: "2023-05-10T08:30:00Z"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    riskScore: 62,
    status: "Pending",
    submissionDate: "2023-05-12T10:15:00Z"
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.brown@example.com",
    riskScore: 78,
    status: "Rejected",
    submissionDate: "2023-05-15T14:45:00Z"
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    riskScore: 41,
    status: "Approved",
    submissionDate: "2023-05-18T09:20:00Z"
  },
  {
    id: 5,
    name: "James Davis",
    email: "james.davis@example.com",
    riskScore: 55,
    status: "Pending",
    submissionDate: "2023-05-20T16:10:00Z"
  },
  {
    id: 6,
    name: "Patricia Miller",
    email: "patricia.miller@example.com",
    riskScore: 29,
    status: "Approved",
    submissionDate: "2023-05-22T11:05:00Z"
  },
  {
    id: 7,
    name: "Robert Wilson",
    email: "robert.wilson@example.com",
    riskScore: 71,
    status: "Rejected",
    submissionDate: "2023-05-25T13:30:00Z"
  },
  {
    id: 8,
    name: "Linda Moore",
    email: "linda.moore@example.com",
    riskScore: 48,
    status: "Pending",
    submissionDate: "2023-05-28T10:45:00Z"
  },
  {
    id: 9,
    name: "David Taylor",
    email: "david.taylor@example.com",
    riskScore: 83,
    status: "Rejected",
    submissionDate: "2023-06-01T15:20:00Z"
  },
  {
    id: 10,
    name: "Elizabeth Anderson",
    email: "elizabeth.anderson@example.com",
    riskScore: 37,
    status: "Approved",
    submissionDate: "2023-06-03T09:15:00Z"
  },
  {
    id: 11,
    name: "William Thomas",
    email: "william.thomas@example.com",
    riskScore: 65,
    status: "Pending",
    submissionDate: "2023-06-05T14:00:00Z"
  },
  {
    id: 12,
    name: "Jennifer Jackson",
    email: "jennifer.jackson@example.com",
    riskScore: 52,
    status: "Pending",
    submissionDate: "2023-06-08T11:30:00Z"
  }
];

// Mock risk score
export const mockRiskScore = {
  userId: 1,
  totalScore: 65,
  sectionScores: [
    {
      sectionId: 1,
      sectionName: "Customer Profile",
      score: 15,
      maxPossible: 25
    },
    {
      sectionId: 2,
      sectionName: "Transaction Behavior",
      score: 18,
      maxPossible: 20
    },
    {
      sectionId: 3,
      sectionName: "Beneficiary Risk",
      score: 12,
      maxPossible: 15
    },
    {
      sectionId: 4,
      sectionName: "Geographic Risk",
      score: 7,
      maxPossible: 10
    },
    {
      sectionId: 5,
      sectionName: "Source of Funds",
      score: 6,
      maxPossible: 10
    },
    {
      sectionId: 6,
      sectionName: "Sanctions Checks",
      score: 4,
      maxPossible: 10
    },
    {
      sectionId: 7,
      sectionName: "Device Risk",
      score: 3,
      maxPossible: 5
    },
    {
      sectionId: 8,
      sectionName: "Additional Checks",
      score: 0,
      maxPossible: 5
    }
  ],
  status: "Pending",
  createdAt: "2023-06-10T09:30:00Z",
  updatedAt: "2023-06-10T09:30:00Z"
};

import { 
  RiskConfiguration, 
  RiskScore, 
  UserProfile,
  RiskConfiguration_Legacy,
  Section
} from '@/types/risk';

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

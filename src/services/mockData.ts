
import { RiskConfiguration } from "@/types/risk";

// Mock risk configuration with all the requested sections and fields
export const mockRiskConfiguration: RiskConfiguration = {
  id: 1,
  name: "Standard Risk Assessment",
  version: "1.0",
  sections: [
    {
      id: 1,
      name: "Customer Profile Risk",
      weightage: 25,
      fields: [
        {
          id: 101,
          name: "Customer Type",
          type: "select",
          valueApi: "/api/customer-types",
          required: true,
          conditions: []
        },
        {
          id: 102,
          name: "Occupation Type",
          type: "select",
          valueApi: "/api/occupation-types",
          required: true,
          conditions: []
        },
        {
          id: 103,
          name: "Source of Funds",
          type: "select",
          valueApi: "/api/fund-sources",
          required: true,
          conditions: []
        },
        {
          id: 104,
          name: "KYC Verification Level",
          type: "select",
          valueApi: "/api/kyc-levels",
          required: true,
          conditions: []
        },
        {
          id: 105,
          name: "Customer's Transaction History",
          type: "select",
          valueApi: "/api/transaction-history",
          required: false,
          conditions: []
        }
      ]
    },
    {
      id: 2,
      name: "Transaction Behavior Risk",
      weightage: 20,
      fields: [
        {
          id: 201,
          name: "Customer's Residence Type",
          type: "select",
          valueApi: "/api/residence-types",
          required: true,
          conditions: []
        },
        {
          id: 202,
          name: "Transaction Frequency",
          type: "select",
          valueApi: "/api/transaction-frequency",
          required: true,
          conditions: []
        },
        {
          id: 203,
          name: "Transaction Volume",
          type: "number",
          required: true,
          conditions: []
        },
        {
          id: 204,
          name: "First-Time Transaction with Beneficiary",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 205,
          name: "Multiple Transactions to Different Beneficiaries",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 206,
          name: "Round Amount Transactions",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 207,
          name: "High-Cash Transactions",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 208,
          name: "Abnormal Transaction Timing",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 209,
          name: "Transaction Purpose",
          type: "select",
          valueApi: "/api/transaction-purposes",
          required: true,
          conditions: []
        },
        {
          id: 210,
          name: "Linked Transactions",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 211,
          name: "Payment Method Type",
          type: "select",
          valueApi: "/api/payment-methods",
          required: true,
          conditions: []
        }
      ]
    },
    {
      id: 3,
      name: "Beneficiary/Payee Risk",
      weightage: 15,
      fields: [
        {
          id: 301,
          name: "Beneficiary Identity Verification",
          type: "select",
          valueApi: "/api/verification-levels",
          required: true,
          conditions: []
        },
        {
          id: 302,
          name: "Relationship with Sender",
          type: "select",
          valueApi: "/api/relationships",
          required: true,
          conditions: []
        },
        {
          id: 303,
          name: "Multiple Senders to Beneficiary",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 304,
          name: "Beneficiary's Country Risk",
          type: "select",
          valueApi: "/api/country-risks",
          required: true,
          conditions: []
        },
        {
          id: 305,
          name: "Beneficiary Transaction Patterns",
          type: "select",
          valueApi: "/api/transaction-patterns",
          required: false,
          conditions: []
        },
        {
          id: 306,
          name: "Beneficiary Account Type",
          type: "select",
          valueApi: "/api/account-types",
          required: true,
          conditions: []
        },
        {
          id: 307,
          name: "Beneficiary is Business or Individual",
          type: "select",
          valueApi: "/api/entity-types",
          required: true,
          conditions: []
        }
      ]
    },
    {
      id: 4,
      name: "Demographics & Geographic Risk",
      weightage: 10,
      fields: [
        {
          id: 401,
          name: "Age of Customer",
          type: "number",
          required: true,
          conditions: []
        },
        {
          id: 402,
          name: "Sender's Country of Residence",
          type: "select",
          valueApi: "/api/countries",
          required: true,
          conditions: []
        },
        {
          id: 403,
          name: "Destination Country Risk",
          type: "select",
          valueApi: "/api/country-risks",
          required: true,
          conditions: []
        },
        {
          id: 404,
          name: "Dual Citizenship or Past Residency",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 405,
          name: "Transactions from High-Risk Cities",
          type: "checkbox",
          required: false,
          conditions: []
        }
      ]
    },
    {
      id: 5,
      name: "Occupation & Source of Funds",
      weightage: 10,
      fields: [
        {
          id: 501,
          name: "Type of Business (for Entities)",
          type: "select",
          valueApi: "/api/business-types",
          required: false,
          conditions: []
        },
        {
          id: 502,
          name: "Job Type (for Individuals)",
          type: "select",
          valueApi: "/api/job-types",
          required: false,
          conditions: []
        },
        {
          id: 503,
          name: "Self-Employed Without Clear Income Documentation",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 504,
          name: "Frequent Large Deposits Not Matching Stated Income",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 505,
          name: "Unverified Source of Wealth",
          type: "checkbox",
          required: false,
          conditions: []
        }
      ]
    },
    {
      id: 6,
      name: "Sanctions & Watchlist Checks",
      weightage: 10,
      fields: [
        {
          id: 601,
          name: "Sanctioned Customer",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 602,
          name: "Sanctioned Beneficiary",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 603,
          name: "Politically Exposed Person (PEP)",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 604,
          name: "Linked to a Suspicious Network",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 605,
          name: "Previously Flagged for Suspicious Activity Reports (SARs)",
          type: "checkbox",
          required: false,
          conditions: []
        }
      ]
    },
    {
      id: 7,
      name: "Device & Behavioral Risk",
      weightage: 5,
      fields: [
        {
          id: 701,
          name: "IP Address Risk",
          type: "select",
          valueApi: "/api/ip-risks",
          required: false,
          conditions: []
        },
        {
          id: 702,
          name: "Multiple Accounts on Same Device",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 703,
          name: "Use of VPN/Proxy",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 704,
          name: "Unusual Login Behavior",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 705,
          name: "Use of Disposable Phone Numbers",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 706,
          name: "Behavioral Anomalies",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 707,
          name: "Login Location vs. Transaction Location",
          type: "select",
          valueApi: "/api/location-matches",
          required: false,
          conditions: []
        }
      ]
    },
    {
      id: 8,
      name: "Additional Custom Risk Checks",
      weightage: 5,
      fields: [
        {
          id: 801,
          name: "High Number of Small Transactions",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 802,
          name: "Cryptocurrency Transactions",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 803,
          name: "Frequent Cancellations and Refunds",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 804,
          name: "Large Transactions Immediately After Account Creation",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 805,
          name: "Use of Multiple Linked Accounts",
          type: "checkbox",
          required: false,
          conditions: []
        },
        {
          id: 806,
          name: "Third-Party Transactions (Initiator ≠ Receiver)",
          type: "checkbox",
          required: false,
          conditions: []
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

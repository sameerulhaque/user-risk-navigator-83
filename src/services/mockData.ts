
import { RiskConfiguration, UserProfile, RiskScore } from "@/types/risk";

// Mock risk configuration data
export const mockRiskConfiguration: RiskConfiguration = {
  id: 1,
  name: "Standard Risk Assessment",
  version: "1.0",
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
          conditions: [
            {
              id: 1,
              operator: "<",
              value: 25,
              weightage: 70,
            },
            {
              id: 2,
              operator: "between",
              value: 25,
              secondaryValue: 60,
              weightage: 30,
              logicalOperator: "AND",
            },
            {
              id: 3,
              operator: ">",
              value: 60,
              weightage: 50,
            },
          ],
        },
        {
          id: 2,
          name: "Residency Status",
          type: "select",
          valueApi: "/api/residency-types",
          required: true,
          conditions: [
            {
              id: 1,
              operator: "=",
              value: 1, // Citizen
              weightage: 10,
            },
            {
              id: 2,
              operator: "=",
              value: 2, // Permanent Resident
              weightage: 30,
            },
            {
              id: 3,
              operator: "=",
              value: 3, // Temporary Visa
              weightage: 80,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Financial Information",
      weightage: 40,
      fields: [
        {
          id: 3,
          name: "Annual Income",
          type: "number",
          required: true,
          conditions: [
            {
              id: 1,
              operator: "<",
              value: 30000,
              weightage: 70,
            },
            {
              id: 2,
              operator: "between",
              value: 30000,
              secondaryValue: 100000,
              weightage: 30,
            },
            {
              id: 3,
              operator: ">",
              value: 100000,
              weightage: 10,
            },
          ],
        },
        {
          id: 4,
          name: "Employment Type",
          type: "select",
          valueApi: "/api/employment-types",
          required: true,
          conditions: [
            {
              id: 1,
              operator: "=",
              value: 1, // Full-time
              weightage: 20,
            },
            {
              id: 2,
              operator: "=",
              value: 2, // Part-time
              weightage: 40,
            },
            {
              id: 3,
              operator: "=",
              value: 3, // Self-employed
              weightage: 60,
            },
            {
              id: 4,
              operator: "=",
              value: 4, // Unemployed
              weightage: 90,
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Lifestyle & Behavior",
      weightage: 30,
      fields: [
        {
          id: 5,
          name: "Credit Score",
          type: "number",
          required: true,
          conditions: [
            {
              id: 1,
              operator: "<",
              value: 600,
              weightage: 80,
            },
            {
              id: 2,
              operator: "between",
              value: 600,
              secondaryValue: 750,
              weightage: 40,
            },
            {
              id: 3,
              operator: ">",
              value: 750,
              weightage: 10,
            },
          ],
        },
        {
          id: 6,
          name: "Previous Defaults",
          type: "select",
          valueApi: "/api/default-types",
          required: true,
          conditions: [
            {
              id: 1,
              operator: "=",
              value: 1, // None
              weightage: 0,
            },
            {
              id: 2,
              operator: "=",
              value: 2, // One
              weightage: 50,
            },
            {
              id: 3,
              operator: "=",
              value: 3, // Multiple
              weightage: 100,
            },
          ],
        },
      ],
    },
  ],
};

// Mock dropdown data
export const mockDropdownData = {
  "/api/residency-types": [
    { id: 1, label: "Citizen" },
    { id: 2, label: "Permanent Resident" },
    { id: 3, label: "Temporary Visa" },
  ],
  "/api/employment-types": [
    { id: 1, label: "Full-time" },
    { id: 2, label: "Part-time" },
    { id: 3, label: "Self-employed" },
    { id: 4, label: "Unemployed" },
  ],
  "/api/default-types": [
    { id: 1, label: "None" },
    { id: 2, label: "One" },
    { id: 3, label: "Multiple" },
  ],
};

// Mock user profiles
export const mockUsers: UserProfile[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  riskScore: Math.floor(Math.random() * 100),
  status: ["Pending", "Approved", "Rejected"][Math.floor(Math.random() * 3)] as "Pending" | "Approved" | "Rejected",
  submissionDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
}));

// Mock risk scores for a specific user
export const mockRiskScore: RiskScore = {
  userId: 1,
  totalScore: 65,
  sectionScores: [
    {
      sectionId: 1,
      sectionName: "Personal Information",
      score: 20,
      maxPossible: 30,
    },
    {
      sectionId: 2,
      sectionName: "Financial Information",
      score: 28,
      maxPossible: 40,
    },
    {
      sectionId: 3,
      sectionName: "Lifestyle & Behavior",
      score: 17,
      maxPossible: 30,
    },
  ],
  status: "Pending",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

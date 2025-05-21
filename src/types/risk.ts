
// Condition types
export type ConditionOperator = '>' | '<' | '=' | 'between' | 'contains' | 'isEmpty' | 'isNotEmpty';

export interface Condition {
  id: number;
  operator: ConditionOperator;
  value: any;
  secondaryValue?: any; // For "between" operator
  weightage: number;
  logicalOperator?: 'AND' | 'OR';
}

// Field definition
export interface Field {
  id: number;
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  valueApi?: string;
  conditions: Condition[];
  required?: boolean;
  defaultValue?: any;
}

// Section definition
export interface Section {
  id: number;
  name: string;
  weightage: number;
  fields: Field[];
}

// Risk configuration
export interface RiskConfiguration {
  id: number;
  name: string;
  version: string;
  sections: Section[];
}

// User risk score
export interface RiskScore {
  userId: number;
  totalScore: number;
  sectionScores: {
    sectionId: number;
    sectionName: string;
    score: number;
    maxPossible: number;
  }[];
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

// User submission
export interface UserSubmission {
  userId: number;
  configId: number;
  sections: {
    sectionId: number;
    fields: {
      fieldId: number;
      value: any;
    }[];
  }[];
}

// User profile with risk data
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  riskScore?: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  submissionDate?: string;
}

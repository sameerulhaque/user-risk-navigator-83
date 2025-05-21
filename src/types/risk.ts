
// Condition types
export type ConditionOperator = '>' | '<' | '=' | 'between' | 'contains' | 'isEmpty' | 'isNotEmpty';

export interface FieldValue {
  id: number;
  value: string;
  condition: string;  // Changed from ConditionOperator to string to allow free-form input
  conditionType: string;
  weightage: number;
  condition2?: string;  // Optional second condition for "between" type
}

// Field definition
export interface Field {
  id: number;
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  valueApi?: string;
  fieldValues: FieldValue[];
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

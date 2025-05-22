
// Base model classes
export class RiskSection {
  id!: number;
  sectionName!: string;
}

export class RiskField {
  id!: number;
  sectionId!: number;
  endpointURL?: string;
  label?: string;
  fieldType?: string;
  isRequired?: boolean;
  placeholder?: string;
  orderIndex?: number;
  valueMappings?: RiskFieldValueMapping[];
}

export class RiskFieldValueMapping {
  id!: number;
  text!: string;
  value!: number;
  fieldId!: number;
}

export class RiskConfiguration {
  id!: number;
  name!: string;
  version!: string;
  companyId!: number;
  companySections?: RiskCompanySection[];
}

export class RiskCompanySection {
  id!: number;
  companyId!: number;
  sectionId!: number;
  isActive!: boolean;
  weightage!: number;
  fields?: RiskCompanyField[];
  section?: RiskSection; // Relationship to RiskSection
}

export class RiskCompanyField {
  id!: number;
  companySectionId!: number;
  fieldId!: number;
  isActive!: boolean;
  maxScore?: number;
  conditions?: RiskCompanyFieldCondition[];
  field?: RiskField; // Relationship to RiskField
}

export class RiskCompanyFieldCondition {
  id!: number;
  companyFieldId!: number;
  fieldValueMappingId!: number;
  operator?: string;
  value?: string;
  valueTo?: string;
  riskScore!: number;
  fieldValueMapping?: RiskFieldValueMapping; // Relationship to RiskFieldValueMapping
}

export class RiskUserAssessment {
  id!: number;
  userId!: number;
  companyId!: number;
  totalScore!: number;
  status!: string;
  sectionScores?: RiskUserAssessmentSectionScore[];
}

export class RiskUserAssessmentSectionScore {
  id!: number;
  assessmentId!: number;
  companySectionId!: number;
  score!: number;
  maxPossible!: number;
}

// Legacy compatibility types 
// These will help maintain compatibility with existing components
export type ConditionOperator = '>' | '<' | '=' | 'between' | 'contains' | 'isEmpty' | 'isNotEmpty';

export interface FieldValue {
  id: number;
  value: string;
  condition: string;  
  conditionType: string;
  weightage: number;
  condition2?: string;  
}

export interface Field {
  id: number;
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  valueApi?: string;
  fieldValues: FieldValue[];
  required?: boolean;
  defaultValue?: any;
}

export interface Section {
  id: number;
  name: string;
  weightage: number;
  fields: Field[];
}

export interface RiskConfiguration_Legacy {
  id: number;
  name: string;
  version: string;
  sections: Section[];
}

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

export interface UserSubmission {
  userId: number;
  configId: number;
  companyId: number; // Added company ID
  sections: {
    sectionId: number;
    fields: {
      fieldId: number;
      value: any;
    }[];
  }[];
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  riskScore?: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  submissionDate?: string;
}

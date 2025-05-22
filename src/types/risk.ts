
// Base model classes
export class RiskSection {
  id!: number;
  sectionName!: string;
}

export class RiskConfiguration {
  id!: number;
  name!: string;
  version!: string;
  companySections?: RiskCompanySection[];
}

export class RiskField {
  id!: number;
  section!: RiskSection;
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
  field!: RiskField;
}

export class RiskCompanyFieldCondition {
  id!: number;
  companyField!: RiskCompanyField;
  fieldValueMapping!: RiskFieldValueMapping;
  operator?: string;
  value?: string;
  valueTo?: string;
  riskScore!: number;
}

export class RiskCompanyField {
  id!: number;
  companySection!: RiskCompanySection;
  field!: RiskField;
  isActive!: boolean;
  maxScore?: number;
  conditions?: RiskCompanyFieldCondition[];
}

export class RiskCompanySection {
  id!: number;
  company!: RiskConfiguration;
  section!: RiskSection;
  isActive!: boolean;
  weightage!: number;
  fields?: RiskCompanyField[];
}

export class RiskUserAssessment {
  id!: number;
  userId!: number;
  company!: RiskConfiguration;
  totalScore!: number;
  status!: string;
  sectionScores?: RiskUserAssessmentSectionScore[];
}

export class RiskUserAssessmentSectionScore {
  id!: number;
  assessment!: RiskUserAssessment;
  companySection!: RiskCompanySection;
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

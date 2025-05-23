
// Basic types for risk assessment
export type RiskStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Company {
  id: number;
  name: string;
  configId?: number;
}

// Risk field definition
export interface RiskField {
  id: number;
  sectionId: number;
  label?: string;
  fieldType: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  isRequired: boolean;
  placeholder?: string;
  endpointURL?: string;
  orderIndex: number;
  valueMappings?: RiskFieldValueMapping[];
}

// Risk section definition
export interface RiskSection {
  id: number;
  sectionName: string;
}

// Field value mapping
export interface RiskFieldValueMapping {
  id: number;
  text: string;
  value: number;
  fieldId: number;
}

// Company-specific field configuration
export interface RiskCompanyField {
  id: number;
  companySectionId: number;
  fieldId: number;
  isActive: boolean;
  maxScore: number;
  conditions?: RiskCompanyFieldCondition[];
  field?: RiskField;
}

// Field condition for risk scoring
export interface RiskCompanyFieldCondition {
  id: number;
  companyFieldId: number;
  fieldValueMappingId?: number;
  operator?: string;
  value?: string;
  valueTo?: string;
  riskScore: number;
  fieldValueMapping?: RiskFieldValueMapping;
}

// Company-specific section configuration
export interface RiskCompanySection {
  id: number;
  companyId: number;
  sectionId: number;
  isActive: boolean;
  weightage: number;
  fields?: RiskCompanyField[];
  section?: RiskSection;
}

// Risk configuration
export interface RiskConfiguration {
  id: number;
  name: string;
  version: string;
  companyId: number;
  companySections?: RiskCompanySection[];
}

// User assessment fieldValue
export interface RiskUserAssessmentFieldValue {
  fieldId: number;
  value: any;
}

// User assessment section
export interface RiskUserAssessmentSection {
  sectionId: number;
  fields: RiskUserAssessmentFieldValue[];
}

// User assessment section score
export interface RiskUserAssessmentSectionScore {
  sectionId: number;
  companySectionId: number;
  sectionName: string;
  score: number;
  maxPossible: number;
}

// User assessment
export interface RiskUserAssessment {
  userId: number;
  configId: number;
  sections: RiskUserAssessmentSection[];
  // Added properties to fix errors in riskCalculator.ts
  sectionScores?: RiskUserAssessmentSectionScore[];
  totalScore?: number;
  status?: RiskStatus;
}

// User profile
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  riskScore?: number;
  status: RiskStatus;
  submissionDate: string;
}

// Risk score
export interface RiskScore {
  userId: number;
  totalScore: number;
  sectionScores: {
    sectionId: number;
    sectionName: string;
    score: number;
    maxPossible: number;
  }[];
  status: RiskStatus;
  createdAt: string;
  updatedAt: string;
}

// User submission data
export interface UserSubmission {
  userId: number;
  configId: number;
  companyId: number;
  sections: {
    sectionId: number;
    fields: {
      fieldId: number;
      value: any;
    }[];
  }[];
}

// Legacy types for backward compatibility

// Legacy field value type
export interface FieldValue {
  id: number;
  value: string;
  condition: string;
  conditionType: string;
  weightage: number;
  condition2?: string;
}

// Legacy field type
export interface Field {
  id: number;
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  valueApi?: string;
  required?: boolean;
  fieldValues: FieldValue[];
}

// Legacy section type
export interface Section {
  id: number;
  name: string;
  weightage: number;
  fields: Field[];
}

// Legacy risk configuration type
export interface RiskConfiguration_Legacy {
  id: number;
  name: string;
  version: string;
  sections: Section[];
}

// Version history interface
export interface VersionHistory {
  id: number;
  entityType: 'configuration' | 'submission';
  entityId: number;
  version: string;
  timestamp: string;
  changes: string;
  userId: number;
  userName: string;
}


import { 
  RiskConfiguration,
  RiskCompanySection,
  RiskCompanyField, 
  RiskCompanyFieldCondition,
  RiskUserAssessment,
  RiskUserAssessmentSectionScore,
  RiskScore,
  UserSubmission 
} from "@/types/risk";

// Evaluate a single condition against a field value
export function evaluateCondition(condition: RiskCompanyFieldCondition, value: any): boolean {
  switch (condition.operator) {
    case '>':
      return Number(value) > Number(condition.value);
    case '<':
      return Number(value) < Number(condition.value);
    case '=':
      return String(value) === String(condition.value);
    case 'between':
      return Number(value) >= Number(condition.value) && 
             Number(value) <= Number(condition.valueTo);
    case 'contains':
      return String(value).includes(String(condition.value));
    case 'isEmpty':
      return value === undefined || value === null || value === '';
    case 'isNotEmpty':
      return value !== undefined && value !== null && value !== '';
    default:
      // For select fields without explicit operator, check if the value matches the field value mapping
      if (condition.fieldValueMapping) {
        return Number(value) === condition.fieldValueMapping.value;
      }
      return false;
  }
}

// Calculate the score for a single field based on its value and conditions
export function calculateFieldScore(field: RiskCompanyField, fieldValue: any): number {
  // If field has no conditions, return 0
  if (!field.conditions || field.conditions.length === 0) {
    return 0;
  }
  
  // Find the matching condition
  const matchingCondition = field.conditions.find(condition => 
    evaluateCondition(condition, fieldValue)
  );

  // Return the risk score if a match is found
  return matchingCondition ? matchingCondition.riskScore : 0;
}

// Calculate risk score for a complete user submission
export function calculateRiskScore(
  configuration: RiskConfiguration,
  submission: UserSubmission
): RiskScore {
  // Only process active sections
  const activeSections = configuration.companySections?.filter(section => section.isActive) || [];
  
  const sectionScores = activeSections.map(section => {
    const submittedSection = submission.sections.find(s => s.sectionId === section.id);
    
    // Calculate field scores for this section
    let sectionScore = 0;
    let maxPossible = section.weightage;
    
    if (submittedSection && section.fields) {
      // Only process active fields
      const activeFields = section.fields.filter(field => field.isActive);
      
      for (const field of activeFields) {
        const submittedField = submittedSection.fields.find(f => f.fieldId === field.field.id);
        if (submittedField) {
          const fieldScore = calculateFieldScore(field, submittedField.value);
          sectionScore += fieldScore;
        }
      }
    }
    
    // Scale the section score based on its weightage
    const scaledScore = (sectionScore / 100) * maxPossible;

    return {
      sectionId: section.id,
      sectionName: section.section.sectionName,
      score: Math.min(scaledScore, maxPossible), // Ensure we don't exceed max
      maxPossible
    };
  });

  // Calculate total score
  const totalScore = sectionScores.reduce((sum, section) => sum + section.score, 0);
  const maxPossibleTotal = sectionScores.reduce((sum, section) => sum + section.maxPossible, 0);
  const normalizedScore = Math.round((totalScore / maxPossibleTotal) * 100);

  return {
    userId: submission.userId,
    totalScore: normalizedScore,
    sectionScores,
    status: 'Pending', // Initial status is always pending
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Convert RiskUserAssessment to the legacy RiskScore format
export function convertToLegacyRiskScore(assessment: RiskUserAssessment): RiskScore {
  const sectionScores = assessment.sectionScores?.map(sectionScore => {
    // Handle the case when companySection navigation property is not loaded
    const sectionId = sectionScore.companySection?.id || sectionScore.companySectionId;
    const sectionName = sectionScore.companySection?.section?.sectionName || 'Unknown Section';
    
    return {
      sectionId,
      sectionName,
      score: sectionScore.score,
      maxPossible: sectionScore.maxPossible
    };
  }) || [];

  return {
    userId: assessment.userId,
    totalScore: assessment.totalScore,
    sectionScores,
    status: assessment.status as 'Pending' | 'Approved' | 'Rejected',
    createdAt: new Date().toISOString(), // Use actual dates if available in the assessment
    updatedAt: new Date().toISOString()
  };
}

// Get risk level based on score
export function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 50) return 'low';
  if (score < 70) return 'medium';
  return 'high';
}

// Get color for risk level
export function getRiskColor(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'low': return 'text-green-500';
    case 'medium': return 'text-amber-500';
    case 'high': return 'text-red-500';
    default: return 'text-gray-500';
  }
}

// Get background color for risk level
export function getRiskBgColor(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'low': return 'bg-green-100';
    case 'medium': return 'bg-amber-100';
    case 'high': return 'bg-red-100';
    default: return 'bg-gray-100';
  }
}

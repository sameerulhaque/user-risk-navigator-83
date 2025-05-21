
import { FieldValue, Field, RiskConfiguration, RiskScore, UserSubmission } from "@/types/risk";

// Evaluate a single condition against a field value
export function evaluateCondition(fieldValue: FieldValue, value: any): boolean {
  switch (fieldValue.condition) {
    case '>':
      return Number(value) > Number(fieldValue.value);
    case '<':
      return Number(value) < Number(fieldValue.value);
    case '=':
      return value === fieldValue.value;
    case 'between':
      // Note: For 'between' condition, value should be a range array or similar structure
      // This is a simplified implementation
      return Number(value) >= Number(fieldValue.value.split('-')[0]) && 
             Number(value) <= Number(fieldValue.value.split('-')[1]);
    case 'contains':
      return String(value).includes(String(fieldValue.value));
    case 'isEmpty':
      return value === undefined || value === null || value === '';
    case 'isNotEmpty':
      return value !== undefined && value !== null && value !== '';
    default:
      return false;
  }
}

// Calculate the score for a single field based on its value and field values
export function calculateFieldScore(field: Field, fieldValue: any): number {
  // Find the matching field value
  const matchingFieldValue = field.fieldValues.find(fv => 
    evaluateCondition(fv, fieldValue)
  );

  // Return the weightage if a match is found
  return matchingFieldValue ? matchingFieldValue.weightage : 0;
}

// Calculate risk score for a complete user submission
export function calculateRiskScore(
  configuration: RiskConfiguration,
  submission: UserSubmission
): RiskScore {
  const sectionScores = configuration.sections.map(section => {
    const submittedSection = submission.sections.find(s => s.sectionId === section.id);
    
    // Calculate field scores for this section
    let sectionScore = 0;
    if (submittedSection) {
      for (const field of section.fields) {
        const submittedField = submittedSection.fields.find(f => f.fieldId === field.id);
        if (submittedField) {
          const fieldScore = calculateFieldScore(field, submittedField.value);
          sectionScore += fieldScore;
        }
      }
    }
    
    // Scale the section score based on its weightage
    const maxPossible = section.weightage;
    const scaledScore = (sectionScore / 100) * maxPossible;

    return {
      sectionId: section.id,
      sectionName: section.name,
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

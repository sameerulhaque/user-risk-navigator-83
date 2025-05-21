
import { Condition, Field, RiskConfiguration, RiskScore, UserSubmission } from "@/types/risk";

// Evaluate a single condition against a field value
export function evaluateCondition(condition: Condition, value: any): boolean {
  switch (condition.operator) {
    case '>':
      return Number(value) > Number(condition.value);
    case '<':
      return Number(value) < Number(condition.value);
    case '=':
      return value === condition.value;
    case 'between':
      return Number(value) >= Number(condition.value) && 
             Number(value) <= Number(condition.secondaryValue);
    case 'contains':
      return String(value).includes(String(condition.value));
    case 'isEmpty':
      return value === undefined || value === null || value === '';
    case 'isNotEmpty':
      return value !== undefined && value !== null && value !== '';
    default:
      return false;
  }
}

// Calculate the score for a single field based on its value and conditions
export function calculateFieldScore(field: Field, fieldValue: any): number {
  // Find the matching condition
  const matchingCondition = field.conditions.find(condition => 
    evaluateCondition(condition, fieldValue)
  );

  // Return the weightage if a condition matches
  return matchingCondition ? matchingCondition.weightage : 0;
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
    case 'low': return 'text-risk-low';
    case 'medium': return 'text-risk-medium';
    case 'high': return 'text-risk-high';
    default: return 'text-gray-500';
  }
}

// Get background color for risk level
export function getRiskBgColor(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'low': return 'bg-risk-low';
    case 'medium': return 'bg-risk-medium';
    case 'high': return 'bg-risk-high';
    default: return 'bg-gray-500';
  }
}

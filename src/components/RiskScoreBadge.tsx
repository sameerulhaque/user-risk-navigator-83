
import { getRiskLevel, getRiskColor } from "@/utils/riskCalculator";

interface RiskScoreBadgeProps {
  score: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const RiskScoreBadge = ({ score, showText = true, size = 'md' }: RiskScoreBadgeProps) => {
  const riskLevel = getRiskLevel(score);
  const riskColor = getRiskColor(riskLevel);
  
  // Determine size classes
  const sizeClasses = {
    sm: 'text-xs h-6 w-6',
    md: 'text-sm h-8 w-8',
    lg: 'text-base h-10 w-10',
  };
  
  return (
    <div className="flex items-center gap-2">
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold ${riskColor} border`}
      >
        {score}
      </div>
      
      {showText && (
        <span className={`font-medium ${riskColor}`}>
          {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
        </span>
      )}
    </div>
  );
};

export default RiskScoreBadge;


import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
  actionDisabled?: boolean;
  icon?: ReactNode;
}

const PageHeader = ({ 
  title, 
  description, 
  actionLabel, 
  onAction, 
  actionIcon, 
  actionDisabled = false,
  icon 
}: PageHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-center gap-3">
        {icon && <div className="text-primary">{icon}</div>}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-2">{description}</p>}
        </div>
      </div>
      
      {actionLabel && onAction && (
        <Button 
          onClick={onAction} 
          className="ml-4" 
          disabled={actionDisabled}
        >
          {actionLabel}
          {actionIcon && <span className="ml-2">{actionIcon}</span>}
        </Button>
      )}
    </div>
  );
};

export default PageHeader;

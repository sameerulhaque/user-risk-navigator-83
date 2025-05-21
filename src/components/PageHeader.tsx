
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const PageHeader = ({ title, description, actionLabel, onAction }: PageHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-2">{description}</p>}
      </div>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} className="ml-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default PageHeader;

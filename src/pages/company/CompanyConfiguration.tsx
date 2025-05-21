
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getRiskConfiguration, saveRiskConfiguration } from "@/services/api";
import { RiskConfiguration, Section, Field, Condition } from "@/types/risk";

const CompanyConfiguration = () => {
  const [configuration, setConfiguration] = useState<RiskConfiguration | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<string>("0");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfiguration = async () => {
      setLoading(true);
      try {
        const response = await getRiskConfiguration();
        if (response.isSuccess && response.value) {
          setConfiguration(response.value);
        } else {
          toast({
            title: "Error",
            description: "Failed to load configuration data",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "An error occurred while fetching configuration",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfiguration();
  }, [toast]);

  const handleSaveConfiguration = async () => {
    if (!configuration) return;
    
    setIsSaving(true);
    try {
      const response = await saveRiskConfiguration(configuration);
      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Risk configuration saved successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save configuration",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while saving configuration",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSectionWeightage = (sectionId: number, weightage: number) => {
    if (!configuration) return;
    
    const updatedSections = configuration.sections.map(section => {
      if (section.id === sectionId) {
        return { ...section, weightage };
      }
      return section;
    });

    setConfiguration({
      ...configuration,
      sections: updatedSections,
    });
  };

  const updateConditionWeightage = (
    sectionId: number, 
    fieldId: number, 
    conditionId: number, 
    weightage: number
  ) => {
    if (!configuration) return;
    
    const updatedSections = configuration.sections.map(section => {
      if (section.id === sectionId) {
        const updatedFields = section.fields.map(field => {
          if (field.id === fieldId) {
            const updatedConditions = field.conditions.map(condition => {
              if (condition.id === conditionId) {
                return { ...condition, weightage };
              }
              return condition;
            });
            
            return { ...field, conditions: updatedConditions };
          }
          return field;
        });
        
        return { ...section, fields: updatedFields };
      }
      return section;
    });

    setConfiguration({
      ...configuration,
      sections: updatedSections,
    });
  };

  // Render condition based on its type
  const renderCondition = (
    condition: Condition, 
    field: Field, 
    section: Section
  ) => {
    const getOperatorLabel = (op: string) => {
      switch (op) {
        case '>': return 'Greater than';
        case '<': return 'Less than';
        case '=': return 'Equals';
        case 'between': return 'Between';
        case 'contains': return 'Contains';
        case 'isEmpty': return 'Is Empty';
        case 'isNotEmpty': return 'Is Not Empty';
        default: return op;
      }
    };

    return (
      <div key={condition.id} className="border rounded-md p-4 mb-4">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Operator</Label>
              <div className="font-medium mt-1">{getOperatorLabel(condition.operator)}</div>
            </div>
            
            <div>
              <Label>Value</Label>
              <div className="font-medium mt-1">
                {condition.operator === 'between' 
                  ? `${condition.value} to ${condition.secondaryValue}`
                  : condition.value}
              </div>
            </div>
          </div>
          
          <div>
            <Label 
              htmlFor={`weightage-${section.id}-${field.id}-${condition.id}`}
              className="mb-1 block"
            >
              Risk Weightage: {condition.weightage}%
            </Label>
            <Slider
              id={`weightage-${section.id}-${field.id}-${condition.id}`}
              value={[condition.weightage]}
              min={0}
              max={100}
              step={1}
              className="my-2"
              onValueChange={([value]) => updateConditionWeightage(section.id, field.id, condition.id, value)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render field configuration
  const renderField = (field: Field, section: Section) => {
    return (
      <div key={field.id} className="border rounded-md p-4 mb-6">
        <h4 className="font-medium text-lg mb-2">{field.name}</h4>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <div className="bg-primary/10 px-2 py-1 rounded">
            {field.type.toUpperCase()}
          </div>
          {field.required && (
            <div className="bg-red-100 text-red-700 px-2 py-1 rounded">
              Required
            </div>
          )}
          {field.valueApi && (
            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Dynamic Options
            </div>
          )}
        </div>

        <div className="mb-4">
          <h5 className="font-medium mb-2">Risk Conditions</h5>
          {field.conditions.map(condition => 
            renderCondition(condition, field, section)
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!configuration) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-medium mb-2">No Configuration Found</h3>
        <p className="text-muted-foreground">Please create a new risk configuration.</p>
        <Button className="mt-4">Create New Configuration</Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Risk Configuration"
        description="Configure risk scoring parameters and rules"
        actionLabel="Save Changes"
        onAction={handleSaveConfiguration}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuration Details</CardTitle>
          <CardDescription>
            Version {configuration.version} • Last updated {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="config-name">Configuration Name</Label>
              <Input
                id="config-name"
                value={configuration.name}
                onChange={(e) => setConfiguration({ ...configuration, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="config-version">Version</Label>
              <Input
                id="config-version"
                value={configuration.version}
                onChange={(e) => setConfiguration({ ...configuration, version: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeSection}
        onValueChange={setActiveSection}
        className="space-y-4"
      >
        <TabsList className="w-full overflow-x-auto flex-nowrap">
          {configuration.sections.map((section, index) => (
            <TabsTrigger key={section.id} value={index.toString()}>
              {section.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {configuration.sections.map((section, index) => (
          <TabsContent key={section.id} value={index.toString()}>
            <Card>
              <CardHeader>
                <CardTitle>{section.name}</CardTitle>
                <CardDescription>
                  Section Weightage: {section.weightage}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-8">
                  <Label htmlFor={`section-weightage-${section.id}`} className="mb-1 block">
                    Section Weightage
                  </Label>
                  <Slider
                    id={`section-weightage-${section.id}`}
                    value={[section.weightage]}
                    min={0}
                    max={100}
                    step={1}
                    className="my-2"
                    onValueChange={([value]) => updateSectionWeightage(section.id, value)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <h3 className="text-lg font-medium mb-4">Fields</h3>
                <div className="space-y-4">
                  {section.fields.map(field => renderField(field, section))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSaveConfiguration}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
};

export default CompanyConfiguration;

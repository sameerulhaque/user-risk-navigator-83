
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getRiskConfiguration, saveRiskConfiguration, getFieldOptions } from "@/services/api";
import { RiskConfiguration, Section, Field, FieldValue, ConditionOperator } from "@/types/risk";

const CompanyConfiguration = () => {
  const [configuration, setConfiguration] = useState<RiskConfiguration | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<string>("0");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [fieldOptionsMap, setFieldOptionsMap] = useState<Record<string, any[]>>({});
  const [loadingFieldOptions, setLoadingFieldOptions] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfiguration = async () => {
      setLoading(true);
      try {
        const response = await getRiskConfiguration();
        if (response.isSuccess && response.value) {
          setConfiguration(response.value);
          
          // Fetch field options for all fields with valueApi
          const fieldsWithApi = response.value.sections.flatMap(section => 
            section.fields.filter(field => field.valueApi)
          );
          
          fieldsWithApi.forEach(field => {
            if (field.valueApi) {
              fetchFieldOptions(field.valueApi);
            }
          });
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

  const fetchFieldOptions = async (apiEndpoint: string) => {
    setLoadingFieldOptions(prev => ({ ...prev, [apiEndpoint]: true }));
    try {
      const response = await getFieldOptions(apiEndpoint);
      if (response.isSuccess && response.value) {
        setFieldOptionsMap(prev => ({ ...prev, [apiEndpoint]: response.value }));
      } else {
        toast({
          title: "Error",
          description: `Failed to load options for ${apiEndpoint}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(`Error fetching options for ${apiEndpoint}:`, error);
    } finally {
      setLoadingFieldOptions(prev => ({ ...prev, [apiEndpoint]: false }));
    }
  };

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

  const updateFieldValueWeightage = (
    sectionId: number, 
    fieldId: number, 
    valueId: number, 
    weightage: number
  ) => {
    if (!configuration) return;
    
    const updatedSections = configuration.sections.map(section => {
      if (section.id === sectionId) {
        const updatedFields = section.fields.map(field => {
          if (field.id === fieldId) {
            const updatedFieldValues = field.fieldValues.map(fieldValue => {
              if (fieldValue.id === valueId) {
                return { ...fieldValue, weightage };
              }
              return fieldValue;
            });
            
            return { ...field, fieldValues: updatedFieldValues };
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

  const updateFieldValueCondition = (
    sectionId: number, 
    fieldId: number, 
    valueId: number, 
    condition: ConditionOperator
  ) => {
    if (!configuration) return;
    
    const updatedSections = configuration.sections.map(section => {
      if (section.id === sectionId) {
        const updatedFields = section.fields.map(field => {
          if (field.id === fieldId) {
            const updatedFieldValues = field.fieldValues.map(fieldValue => {
              if (fieldValue.id === valueId) {
                return { ...fieldValue, condition };
              }
              return fieldValue;
            });
            
            return { ...field, fieldValues: updatedFieldValues };
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

  // Render field value configuration
  const renderFieldValue = (fieldValue: FieldValue, field: Field, section: Section) => {
    return (
      <div key={fieldValue.id} className="border border-blue-100 rounded-md p-4 mb-4 bg-white hover:shadow-md transition-shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-blue-600">Field Value</Label>
            <div className="font-medium mt-1 bg-blue-50 p-2 rounded">{fieldValue.value}</div>
          </div>
          
          <div>
            <Label htmlFor={`condition-${section.id}-${field.id}-${fieldValue.id}`}>Condition</Label>
            <Select
              value={fieldValue.condition}
              onValueChange={(value) => updateFieldValueCondition(
                section.id, 
                field.id, 
                fieldValue.id, 
                value as ConditionOperator
              )}
            >
              <SelectTrigger 
                id={`condition-${section.id}-${field.id}-${fieldValue.id}`}
                className="mt-1 border-blue-200"
              >
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="=">Equals</SelectItem>
                  <SelectItem value=">">Greater Than</SelectItem>
                  <SelectItem value="<">Less Than</SelectItem>
                  <SelectItem value="between">Between</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="isEmpty">Is Empty</SelectItem>
                  <SelectItem value="isNotEmpty">Is Not Empty</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
          
        <div>
          <Label 
            htmlFor={`weightage-${section.id}-${field.id}-${fieldValue.id}`}
            className="mb-1 block text-blue-700"
          >
            Risk Weightage: {fieldValue.weightage}%
          </Label>
          <Slider
            id={`weightage-${section.id}-${field.id}-${fieldValue.id}`}
            value={[fieldValue.weightage]}
            min={0}
            max={100}
            step={1}
            className="my-2"
            onValueChange={([value]) => updateFieldValueWeightage(
              section.id, 
              field.id, 
              fieldValue.id, 
              value
            )}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    );
  };

  // Render field configuration
  const renderField = (field: Field, section: Section) => {
    const hasFieldOptions = field.valueApi && fieldOptionsMap[field.valueApi]?.length > 0;
    const isLoading = field.valueApi && loadingFieldOptions[field.valueApi];

    return (
      <AccordionItem key={field.id} value={`field-${field.id}`} className="border border-blue-100 rounded-md overflow-hidden mb-4">
        <AccordionTrigger className="px-4 py-3 bg-gradient-to-r from-blue-50 to-white hover:bg-blue-100">
          <span className="font-medium text-blue-700">{field.name}</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 py-3">
          <div className="mb-4">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <LoadingSpinner size="md" />
              </div>
            ) : hasFieldOptions ? (
              <div>
                <h5 className="font-medium text-blue-600 mb-4">Field Values Configuration</h5>
                {fieldOptionsMap[field.valueApi!].map((option) => {
                  // Find existing field value or create a new one
                  let fieldValue = field.fieldValues.find(fv => fv.id === option.id);
                  
                  if (!fieldValue) {
                    fieldValue = {
                      id: option.id,
                      value: option.label,
                      condition: '=' as ConditionOperator,
                      conditionType: 'Equals',
                      weightage: 0
                    };
                    
                    // Add this new field value to the configuration
                    if (configuration) {
                      const updatedSections = [...configuration.sections];
                      const sectionIndex = updatedSections.findIndex(s => s.id === section.id);
                      if (sectionIndex !== -1) {
                        const fieldIndex = updatedSections[sectionIndex].fields.findIndex(f => f.id === field.id);
                        if (fieldIndex !== -1) {
                          updatedSections[sectionIndex].fields[fieldIndex].fieldValues.push(fieldValue);
                          setConfiguration({
                            ...configuration,
                            sections: updatedSections
                          });
                        }
                      }
                    }
                  }
                  
                  return renderFieldValue(fieldValue, field, section);
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 p-4 border border-dashed rounded-md">
                {field.valueApi ? (
                  <p>No field values available from API endpoint</p>
                ) : (
                  <p>This field does not have an API endpoint configured</p>
                )}
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!configuration) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-medium mb-2 text-blue-700">No Configuration Found</h3>
        <p className="text-muted-foreground">Please create a new risk configuration.</p>
        <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Create New Configuration</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Risk Configuration"
        description="Configure risk scoring parameters and rules"
        actionLabel="Save Changes"
        onAction={handleSaveConfiguration}
      />

      <Card className="mb-6 shadow-md border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
          <CardTitle className="text-blue-700">Configuration Details</CardTitle>
          <CardDescription className="text-blue-600">
            Version {configuration.version} • Last updated {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="config-name" className="text-blue-700">Configuration Name</Label>
              <Input
                id="config-name"
                value={configuration.name}
                onChange={(e) => setConfiguration({ ...configuration, name: e.target.value })}
                className="mt-1 border-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <Label htmlFor="config-version" className="text-blue-700">Version</Label>
              <Input
                id="config-version"
                value={configuration.version}
                onChange={(e) => setConfiguration({ ...configuration, version: e.target.value })}
                className="mt-1 border-blue-200 focus:border-blue-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg shadow-md mb-6 p-1">
        <Tabs
          value={activeSection}
          onValueChange={setActiveSection}
          className="space-y-4"
        >
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-full overflow-x-auto flex-nowrap bg-blue-50 p-1">
              {configuration.sections.map((section, index) => (
                <TabsTrigger 
                  key={section.id} 
                  value={index.toString()} 
                  className="whitespace-nowrap py-2 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  {section.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {configuration.sections.map((section, index) => (
            <TabsContent key={section.id} value={index.toString()} className="animate-fade-in">
              <Card className="border-blue-100 shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                  <CardTitle className="text-blue-700">{section.name}</CardTitle>
                  <CardDescription className="text-blue-600">
                    Section Weightage: {section.weightage}%
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
                    <Label htmlFor={`section-weightage-${section.id}`} className="mb-1 block text-blue-700">
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

                  <h3 className="text-lg font-medium mb-4 text-blue-700 border-b border-blue-100 pb-2">Fields</h3>
                  <Accordion type="multiple" className="space-y-2">
                    {section.fields.map(field => renderField(field, section))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="flex justify-end mt-6 mb-8">
        <Button
          onClick={handleSaveConfiguration}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" /> Saving...
            </div>
          ) : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
};

export default CompanyConfiguration;

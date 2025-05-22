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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getRiskConfiguration, saveRiskConfiguration, getFieldOptions } from "@/services/api";
import { RiskConfiguration, RiskCompanySection, RiskCompanyField, RiskFieldValueMapping, RiskCompanyFieldCondition } from "@/types/risk";
import axios from "axios";

// Helper function to check if condition type requires inputs
const isCustomConditionType = (type: string): boolean => {
  return !["isEmpty", "isNotEmpty"].includes(type);
};

// Helper function to check if condition type needs two inputs
const needsTwoConditionInputs = (type: string): boolean => {
  return type === "between";
};

const CompanyConfiguration = () => {
  const [configuration, setConfiguration] = useState<RiskConfiguration | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<string>("0");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [fieldOptionsMap, setFieldOptionsMap] = useState<Record<string, any[]>>({});
  const [loadingFieldOptions, setLoadingFieldOptions] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  // Calculate the total weight of all sections
  const calculateTotalWeight = (): number => {
    if (!configuration || !configuration.companySections) return 0;
    return configuration.companySections.reduce((total, section) => total + section.weightage, 0);
  };

  // Check if weights are valid (sum to 100%)
  const isValidWeightage = (): boolean => {
    return calculateTotalWeight() === 100;
  };

  useEffect(() => {
    const fetchConfiguration = async () => {
      setLoading(true);
      try {
        const response = await getRiskConfiguration();
        if (response.isSuccess && response.value) {
          setConfiguration(response.value);
          
          // Only fetch field options for fields with valueApi that don't already have valueMappings
          if (response.value.companySections) {
            const fieldsNeedingOptions = response.value.companySections.flatMap(section => 
              section.fields?.filter(field => 
                field.field.endpointURL && (!field.field.valueMappings || field.field.valueMappings.length === 0)
              ) || []
            );
            
            fieldsNeedingOptions.forEach(field => {
              if (field.field.endpointURL) {
                fetchFieldOptions(field.field.endpointURL);
              }
            });
          }
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
    
    // Validate total weight before saving
    if (!isValidWeightage()) {
      toast({
        title: "Validation Error",
        description: "Total section weightage must equal 100%",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      // First try to use the API service
      const response = await saveRiskConfiguration(configuration);
      
      // Also make a direct axios call
      try {
        await axios.post('/api/risk-configuration', configuration, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'x-tenant-id': 'tenant1'
          }
        });
      } catch (axiosError) {
        console.error('Axios direct call error:', axiosError);
        // We don't throw here since we already got a response from the API service
      }

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
    if (!configuration || !configuration.companySections) return;
    
    const updatedSections = configuration.companySections.map(section => {
      if (section.id === sectionId) {
        return { ...section, weightage };
      }
      return section;
    });

    setConfiguration({
      ...configuration,
      companySections: updatedSections,
    });
  };

  const updateFieldValueWeightage = (
    sectionId: number, 
    fieldId: number, 
    valueId: number, 
    weightage: number
  ) => {
    if (!configuration || !configuration.companySections) return;
    
    const updatedSections = configuration.companySections.map(section => {
      if (section.id === sectionId) {
        const updatedFields = section.fields?.map(field => {
          if (field.id === fieldId) {
            const updatedConditions = field.conditions?.map(condition => {
              if (condition.id === valueId) {
                return { ...condition, riskScore: weightage };
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
      companySections: updatedSections,
    });
  };

  const updateFieldValueCondition = (
    sectionId: number, 
    fieldId: number, 
    valueId: number, 
    conditionValue: string
  ) => {
    if (!configuration || !configuration.companySections) return;
    
    const updatedSections = configuration.companySections.map(section => {
      if (section.id === sectionId) {
        const updatedFields = section.fields?.map(field => {
          if (field.id === fieldId) {
            const updatedConditions = field.conditions?.map(condition => {
              if (condition.id === valueId) {
                return { ...condition, value: conditionValue };
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
      companySections: updatedSections,
    });
  };

  const updateFieldValueConditionType = (
    sectionId: number, 
    fieldId: number, 
    valueId: number, 
    conditionType: string
  ) => {
    if (!configuration || !configuration.companySections) return;
    
    const updatedSections = configuration.companySections.map(section => {
      if (section.id === sectionId) {
        const updatedFields = section.fields?.map(field => {
          if (field.id === fieldId) {
            const updatedConditions = field.conditions?.map(condition => {
              if (condition.id === valueId) {
                // Convert conditionType to operator
                let operator;
                switch (conditionType) {
                  case 'greaterThan': operator = '>'; break;
                  case 'lessThan': operator = '<'; break;
                  case 'equals': operator = '='; break;
                  default: operator = conditionType; break;
                }
                return { ...condition, operator };
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
      companySections: updatedSections,
    });
  };

  const updateFieldValueCondition2 = (
    sectionId: number, 
    fieldId: number, 
    conditionId: number,  
    condition2Value: string
  ) => {
    if (!configuration || !configuration.companySections) return;
    
    const updatedSections = configuration.companySections.map(section => {
      if (section.id === sectionId) {
        const updatedFields = section.fields?.map(field => {
          if (field.id === fieldId) {
            const updatedConditions = field.conditions?.map(condition => {
              if (condition.id === conditionId) {  
                return { ...condition, valueTo: condition2Value };
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
      companySections: updatedSections,
    });
  };

  // Render field value configuration (condition)
  const renderFieldValue = (condition: RiskCompanyFieldCondition, field: RiskCompanyField, section: RiskCompanySection) => {
    // Determine condition type from operator for display
    let conditionType = "equals";
    if (condition.operator === ">") conditionType = "greaterThan";
    else if (condition.operator === "<") conditionType = "lessThan";
    else if (condition.operator === "between") conditionType = "between";
    else if (condition.operator === "contains") conditionType = "contains";
    else if (condition.operator === "isEmpty") conditionType = "isEmpty";
    else if (condition.operator === "isNotEmpty") conditionType = "isNotEmpty";
    
    const isCustomCondition = isCustomConditionType(conditionType);
    const isBetweenCondition = needsTwoConditionInputs(conditionType);
    const fieldValue = condition.fieldValueMapping?.text || "Custom condition";

    return (
      <div key={condition.id} className="border border-gray-200 rounded-md p-4 mb-4 bg-white hover:shadow-md transition-shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-gray-700 font-medium">Field Value</Label>
            <div className="font-medium mt-1 bg-blue-50 p-2 rounded text-gray-800">{fieldValue}</div>
          </div>
          
          <div>
            <Label htmlFor={`condition-type-${section.id}-${field.id}-${condition.id}`} className="text-gray-700 font-medium">Condition Type</Label>
            <Select
              value={conditionType}
              onValueChange={(value) => updateFieldValueConditionType(
                section.id, 
                field.id, 
                condition.id, 
                value
              )}
            >
              <SelectTrigger 
                id={`condition-type-${section.id}-${field.id}-${condition.id}`}
                className="mt-1 border-gray-200 bg-white"
              >
                <SelectValue placeholder="Select condition type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="greaterThan">Greater Than</SelectItem>
                  <SelectItem value="lessThan">Less Than</SelectItem>
                  <SelectItem value="between">Between</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="isEmpty">Is Empty</SelectItem>
                  <SelectItem value="isNotEmpty">Is Not Empty</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isCustomCondition && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor={`condition-${section.id}-${field.id}-${condition.id}`} className="text-gray-700 font-medium">Condition Value 1</Label>
              <Input
                id={`condition-${section.id}-${field.id}-${condition.id}`}
                value={condition.value || ""}
                onChange={(e) => updateFieldValueCondition(
                  section.id, 
                  field.id, 
                  condition.id, 
                  e.target.value
                )}
                className="mt-1 border-gray-200 bg-white"
              />
            </div>
            
            {isBetweenCondition && (
              <div>
                <Label htmlFor={`condition2-${section.id}-${field.id}-${condition.id}`} className="text-gray-700 font-medium">Condition Value 2</Label>
                <Input
                  id={`condition2-${section.id}-${field.id}-${condition.id}`}
                  value={condition.valueTo || ""}
                  onChange={(e) => updateFieldValueCondition2(
                    section.id, 
                    field.id, 
                    condition.id,
                    e.target.value
                  )}
                  className="mt-1 border-gray-200 bg-white"
                  placeholder="Enter second value"
                />
              </div>
            )}
          </div>
        )}
          
        <div>
          <Label 
            htmlFor={`weightage-${section.id}-${field.id}-${condition.id}`}
            className="mb-1 block text-gray-700 font-medium"
          >
            Risk Weightage: {condition.riskScore}%
          </Label>
          <Slider
            id={`weightage-${section.id}-${field.id}-${condition.id}`}
            value={[condition.riskScore]}
            min={0}
            max={100}
            step={1}
            className="my-2"
            onValueChange={([value]) => updateFieldValueWeightage(
              section.id, 
              field.id, 
              condition.id, 
              value
            )}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    );
  };

  // Render field configuration
  const renderField = (field: RiskCompanyField, section: RiskCompanySection) => {
    // Check if the field already has value mappings from the API response
    const hasExistingConditions = field.conditions && field.conditions.length > 0;
    const hasValueMappings = field.field.valueMappings && field.field.valueMappings.length > 0;
    
    // Only fetch options if needed
    const hasFieldOptions = field.field.endpointURL && fieldOptionsMap[field.field.endpointURL]?.length > 0;
    const isLoading = field.field.endpointURL && loadingFieldOptions[field.field.endpointURL];

    return (
      <AccordionItem key={field.id} value={`field-${field.id}`} className="border border-gray-200 rounded-md overflow-hidden mb-4 shadow-sm">
        <AccordionTrigger className="px-4 py-3 bg-gradient-to-r from-blue-50 to-white hover:bg-blue-100">
          <span className="font-medium text-gray-700">{field.field.label}</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 py-3">
          <div className="mb-4">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <LoadingSpinner size="md" color="blue" />
              </div>
            ) : hasExistingConditions ? (
              // Use existing conditions from the API response
              <div>
                <h5 className="font-medium text-gray-700 mb-4">Field Conditions Configuration</h5>
                {field.conditions?.map((condition) => renderFieldValue(condition, field, section))}
              </div>
            ) : hasValueMappings ? (
              // Use value mappings to create conditions if none exist
              <div>
                <h5 className="font-medium text-gray-700 mb-4">Field Values Configuration</h5>
                {field.field.valueMappings?.map((mapping) => {
                  // Create a new condition based on the value mapping
                  const newCondition: RiskCompanyFieldCondition = {
                    id: mapping.id,
                    companyField: field,
                    fieldValueMapping: mapping,
                    operator: "=",
                    riskScore: 0
                  };
                  
                  // Add this new condition to the field
                  if (configuration && configuration.companySections) {
                    const updatedSections = [...configuration.companySections];
                    const sectionIndex = updatedSections.findIndex(s => s.id === section.id);
                    if (sectionIndex !== -1) {
                      const fieldIndex = updatedSections[sectionIndex].fields?.findIndex(f => f.id === field.id) ?? -1;
                      if (fieldIndex !== -1 && updatedSections[sectionIndex].fields) {
                        // Ensure conditions array exists
                        if (!updatedSections[sectionIndex].fields![fieldIndex].conditions) {
                          updatedSections[sectionIndex].fields![fieldIndex].conditions = [];
                        }
                        // Add the new condition if it doesn't exist already
                        if (!updatedSections[sectionIndex].fields![fieldIndex].conditions?.find(c => c.id === newCondition.id)) {
                          updatedSections[sectionIndex].fields![fieldIndex].conditions?.push(newCondition);
                        }
                        
                        setConfiguration({
                          ...configuration,
                          companySections: updatedSections
                        });
                      }
                    }
                  }
                  
                  return renderFieldValue(newCondition, field, section);
                })}
              </div>
            ) : hasFieldOptions ? (
              // Use options from the secondary API call if no conditions or value mappings
              <div>
                <h5 className="font-medium text-gray-700 mb-4">Field Values Configuration</h5>
                {fieldOptionsMap[field.field.endpointURL!].map((option) => {
                  // Create a new condition from API options
                  const newCondition: RiskCompanyFieldCondition = {
                    id: option.id,
                    companyField: field,
                    fieldValueMapping: {
                      id: option.id,
                      text: option.label || String(option.id),
                      value: option.id,
                      field: field.field
                    },
                    operator: "=",
                    riskScore: 0
                  };
                  
                  // Add this new condition to the field
                  if (configuration && configuration.companySections) {
                    const updatedSections = [...configuration.companySections];
                    const sectionIndex = updatedSections.findIndex(s => s.id === section.id);
                    if (sectionIndex !== -1) {
                      const fieldIndex = updatedSections[sectionIndex].fields?.findIndex(f => f.id === field.id) ?? -1;
                      if (fieldIndex !== -1 && updatedSections[sectionIndex].fields) {
                        // Ensure conditions array exists
                        if (!updatedSections[sectionIndex].fields![fieldIndex].conditions) {
                          updatedSections[sectionIndex].fields![fieldIndex].conditions = [];
                        }
                        // Add the new condition if it doesn't exist already
                        if (!updatedSections[sectionIndex].fields![fieldIndex].conditions?.find(c => c.id === newCondition.id)) {
                          updatedSections[sectionIndex].fields![fieldIndex].conditions?.push(newCondition);
                        }
                        
                        setConfiguration({
                          ...configuration,
                          companySections: updatedSections
                        });
                      }
                    }
                  }
                  
                  return renderFieldValue(newCondition, field, section);
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 p-4 border border-dashed rounded-md">
                {field.field.endpointURL ? (
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
        <LoadingSpinner size="lg" color="blue" />
      </div>
    );
  }

  if (!configuration) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-medium mb-2 text-gray-700">No Configuration Found</h3>
        <p className="text-gray-500">Please create a new risk configuration.</p>
        <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Create New Configuration</Button>
      </div>
    );
  }

  const totalWeight = calculateTotalWeight();
  const weightDifference = 100 - totalWeight;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Risk Configuration"
        description="Configure risk scoring parameters and rules"
        actionLabel="Save Changes"
        onAction={handleSaveConfiguration}
      />

      {/* Weight validation alert */}
      {!isValidWeightage() && (
        <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-800">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="font-medium">
            {totalWeight > 100 
              ? `Total section weightage exceeds 100% by ${totalWeight - 100}%. Please adjust to exactly 100%.`
              : `Total section weightage is ${totalWeight}%. ${weightDifference}% more needed to reach 100%.`
            }
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-6 shadow-md border-gray-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
          <CardTitle className="text-gray-800">Configuration Details</CardTitle>
          <CardDescription className="text-gray-600">
            Version {configuration.version} • Last updated {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="config-name" className="text-gray-700">Configuration Name</Label>
              <Input
                id="config-name"
                value={configuration.name}
                onChange={(e) => setConfiguration({ ...configuration, name: e.target.value })}
                className="mt-1 border-gray-200 focus:border-blue-400 bg-white"
              />
            </div>
            <div>
              <Label htmlFor="company-id" className="text-gray-700">Company ID</Label>
              <Input
                id="company-id"
                type="number"
                value={configuration.companyId || ''}
                onChange={(e) => setConfiguration({ 
                  ...configuration, 
                  companyId: e.target.value ? parseInt(e.target.value) : 0 
                })}
                className="mt-1 border-gray-200 focus:border-blue-400 bg-white"
                placeholder="Enter company ID"
              />
            </div>
            <div>
              <Label htmlFor="config-version" className="text-gray-700">Version</Label>
              <Input
                id="config-version"
                value={configuration.version}
                onChange={(e) => setConfiguration({ ...configuration, version: e.target.value })}
                className="mt-1 border-gray-200 focus:border-blue-400 bg-white"
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
            <TabsList className="inline-flex w-full overflow-x-auto flex-nowrap bg-blue-50 p-1 rounded-t-lg border border-blue-100">
              {configuration.companySections?.map((section, index) => (
                <TabsTrigger 
                  key={section.id} 
                  value={index.toString()} 
                  className="whitespace-nowrap py-2 px-4 font-medium text-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  {section.section.sectionName} ({section.weightage}%)
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {configuration.companySections?.map((section, index) => (
            <TabsContent key={section.id} value={index.toString()} className="animate-fade-in">
              <Card className="border-gray-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-gray-800">{section.section.sectionName}</CardTitle>
                      <CardDescription className="text-gray-600">
                        Section Weightage: {section.weightage}%
                      </CardDescription>
                    </div>
                    {/* Show a badge with the weight contribution */}
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isValidWeightage() ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isValidWeightage() 
                        ? `${section.weightage}% of 100%` 
                        : `${section.weightage}% of ${totalWeight}%`}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <Label htmlFor={`section-weightage-${section.id}`} className="mb-1 block text-gray-700 font-medium">
                      Section Weightage: {section.weightage}%
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
                    <div className="flex justify-between items-center">
                      <div className="flex justify-between w-full text-xs text-gray-500">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mb-4 text-gray-700 border-b border-gray-200 pb-2">Fields</h3>
                  <Accordion type="multiple" className="space-y-2">
                    {section.fields?.map(field => renderField(field, section))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 mb-8">
        <div className={`text-sm font-medium rounded-md px-4 py-2 ${
          isValidWeightage() 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          Total Weightage: {totalWeight}% {isValidWeightage() ? '✓' : `(${weightDifference > 0 ? '+' : ''}${weightDifference}%)`}
        </div>
        
        <Button
          onClick={handleSaveConfiguration}
          disabled={isSaving || !isValidWeightage()}
          className={`${isValidWeightage() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} text-white shadow-md transition-all`}
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" color="white" /> Saving...
            </div>
          ) : isValidWeightage() ? "Save Configuration" : "Adjust Weights to 100%"}
        </Button>
      </div>
    </div>
  );
};

export default CompanyConfiguration;

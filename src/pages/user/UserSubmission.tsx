
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getRiskConfiguration, getFieldOptions, submitUserData } from "@/services/api";
import { RiskConfiguration, Field, UserSubmission } from "@/types/risk";
import { calculateRiskScore } from "@/utils/riskCalculator";

interface FormData {
  [key: number]: {
    [key: number]: any;
  };
}

interface DropdownOption {
  id: number;
  label: string;
}

const UserSubmission = () => {
  const [configuration, setConfiguration] = useState<RiskConfiguration | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [fieldOptions, setFieldOptions] = useState<Record<string, DropdownOption[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("0");
  const [loadingOptions, setLoadingOptions] = useState<Record<string, boolean>>({});
  
  const userId = 1; // Mock user ID, would come from auth context in a real app
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfiguration = async () => {
      setLoading(true);
      try {
        const response = await getRiskConfiguration();
        if (response.isSuccess && response.value) {
          setConfiguration(response.value);
          
          // Initialize form data structure
          const initialFormData: FormData = {};
          response.value.sections.forEach(section => {
            initialFormData[section.id] = {};
            section.fields.forEach(field => {
              initialFormData[section.id][field.id] = field.defaultValue || "";
            });
          });
          setFormData(initialFormData);
          
          // Load options for all dropdown fields
          await loadAllDropdownOptions(response.value);
        } else {
          toast({
            title: "Error",
            description: "Failed to load form configuration",
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

  const loadAllDropdownOptions = async (config: RiskConfiguration) => {
    const optionsPromises: Promise<void>[] = [];
    
    config.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.type === 'select' && field.valueApi) {
          optionsPromises.push(loadFieldOptions(field));
        }
      });
    });
    
    await Promise.all(optionsPromises);
  };

  const loadFieldOptions = async (field: Field) => {
    if (!field.valueApi) return;
    
    const cacheKey = field.valueApi;
    setLoadingOptions(prev => ({ ...prev, [cacheKey]: true }));
    
    try {
      const response = await getFieldOptions(field.valueApi);
      if (response.isSuccess && response.value) {
        setFieldOptions(prev => ({
          ...prev,
          [cacheKey]: response.value || []
        }));
      }
    } catch (error) {
      console.error(`Error loading options for ${field.name}:`, error);
    } finally {
      setLoadingOptions(prev => ({ ...prev, [cacheKey]: false }));
    }
  };

  const handleInputChange = (sectionId: number, fieldId: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [fieldId]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!configuration) return;
    
    // Validate required fields
    let isValid = true;
    let firstInvalidSection = 0;
    
    configuration.sections.forEach((section, sectionIndex) => {
      section.fields.forEach(field => {
        if (field.required) {
          const value = formData[section.id]?.[field.id];
          if (value === undefined || value === null || value === "") {
            isValid = false;
            if (firstInvalidSection === 0) {
              firstInvalidSection = sectionIndex;
            }
          }
        }
      });
    });
    
    if (!isValid) {
      setActiveSection(firstInvalidSection.toString());
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Prepare submission data
    const submission: UserSubmission = {
      userId,
      configId: configuration.id,
      sections: Object.entries(formData).map(([sectionId, fields]) => ({
        sectionId: Number(sectionId),
        fields: Object.entries(fields).map(([fieldId, value]) => ({
          fieldId: Number(fieldId),
          value
        }))
      }))
    };
    
    setSubmitting(true);
    try {
      // Calculate risk score for preview (in a real app, this would be done on the server)
      const calculatedScore = calculateRiskScore(configuration, submission);
      console.log("Calculated Risk Score:", calculatedScore);
      
      // Submit data to API
      const response = await submitUserData(submission);
      if (response.isSuccess) {
        toast({
          title: "Success",
          description: "Your information has been submitted successfully"
        });
        
        // Navigate to the dashboard to see results
        navigate("/user/dashboard");
      } else {
        toast({
          title: "Error",
          description: "Failed to submit your information",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred during submission",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Render a field based on its type
  const renderField = (field: Field, sectionId: number) => {
    const value = formData[sectionId]?.[field.id] || "";
    
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={`field-${sectionId}-${field.id}`}
            value={value}
            onChange={(e) => handleInputChange(sectionId, field.id, e.target.value)}
            className="mt-1"
            disabled={submitting}
          />
        );
        
      case 'number':
        return (
          <Input
            id={`field-${sectionId}-${field.id}`}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(sectionId, field.id, Number(e.target.value))}
            className="mt-1"
            disabled={submitting}
          />
        );
        
      case 'select':
        const options = field.valueApi ? fieldOptions[field.valueApi] || [] : [];
        const isLoading = field.valueApi ? loadingOptions[field.valueApi] : false;
        
        return (
          <Select
            value={value.toString()}
            onValueChange={(val) => handleInputChange(sectionId, field.id, Number(val))}
            disabled={submitting || isLoading}
          >
            <SelectTrigger id={`field-${sectionId}-${field.id}`} className="mt-1">
              <SelectValue placeholder={isLoading ? "Loading options..." : "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.id} value={option.id.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center mt-2">
            <input
              id={`field-${sectionId}-${field.id}`}
              type="checkbox"
              checked={value}
              onChange={(e) => handleInputChange(sectionId, field.id, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
              disabled={submitting}
            />
            <label htmlFor={`field-${sectionId}-${field.id}`} className="ml-2 text-sm">
              Yes
            </label>
          </div>
        );
        
      default:
        return <div>Unsupported field type</div>;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!configuration) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-medium mb-2">No Form Configuration Found</h3>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Risk Assessment Form"
        description="Please complete all sections to receive your risk assessment"
      />

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
                  Please provide accurate information for this section
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {section.fields.map(field => (
                    <div key={field.id}>
                      <Label 
                        htmlFor={`field-${section.id}-${field.id}`} 
                        className="mb-1 block"
                      >
                        {field.name} {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      {renderField(field, section.id)}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const prevSection = Math.max(0, parseInt(activeSection) - 1);
                      setActiveSection(prevSection.toString());
                    }}
                    disabled={parseInt(activeSection) === 0 || submitting}
                  >
                    Previous
                  </Button>
                  
                  {parseInt(activeSection) === configuration.sections.length - 1 ? (
                    <Button 
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        const nextSection = Math.min(
                          configuration.sections.length - 1,
                          parseInt(activeSection) + 1
                        );
                        setActiveSection(nextSection.toString());
                      }}
                      disabled={submitting}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default UserSubmission;

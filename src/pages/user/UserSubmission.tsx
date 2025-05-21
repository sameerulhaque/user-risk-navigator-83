
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import SectionFieldsList from "@/components/SectionFieldsList";
import { getRiskConfiguration, getFieldOptions, submitUserData } from "@/services/api";
import { RiskConfiguration, Field, UserSubmission as UserSubmissionType } from "@/types/risk";
import { calculateRiskScore } from "@/utils/riskCalculator";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  
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

  // Calculate completion percentage whenever formData changes
  useEffect(() => {
    if (!configuration) return;

    let totalRequiredFields = 0;
    let completedRequiredFields = 0;

    configuration.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.required) {
          totalRequiredFields++;
          const value = formData[section.id]?.[field.id];
          if (value !== undefined && value !== null && value !== "") {
            completedRequiredFields++;
          }
        }
      });
    });

    const percentage = totalRequiredFields > 0
      ? Math.floor((completedRequiredFields / totalRequiredFields) * 100)
      : 0;
      
    setCompletionPercentage(percentage);
  }, [formData, configuration]);

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
    const submission: UserSubmissionType = {
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
    <div className="animate-fade-in">
      <PageHeader
        title="Risk Assessment Form"
        description="Please complete all sections to receive your risk assessment"
      />

      <Card className="mb-6 card-elevated">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={completionPercentage} className="h-2" />
            </div>
            <div className="text-sm font-medium text-blue-700">
              {completionPercentage}% Complete
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeSection}
        onValueChange={setActiveSection}
        className="space-y-4"
      >
        <div className="overflow-x-auto pb-2">
          <TabsList className="h-auto p-1 inline-flex flex-nowrap min-w-full">
            {configuration?.sections.map((section, index) => (
              <TabsTrigger 
                key={section.id} 
                value={index.toString()}
                className="py-2 px-4 whitespace-nowrap transition-all hover:bg-blue-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                {section.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {configuration?.sections.map((section, index) => (
          <TabsContent key={section.id} value={index.toString()} className="animate-fade-in">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-blue-800">{section.name}</CardTitle>
                <CardDescription>
                  Please provide accurate information for this section
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SectionFieldsList
                  sectionId={section.id}
                  fields={section.fields}
                  formData={formData[section.id] || {}}
                  loadingOptions={loadingOptions}
                  fieldOptions={fieldOptions}
                  submitting={submitting}
                  handleInputChange={handleInputChange}
                />

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const prevSection = Math.max(0, parseInt(activeSection) - 1);
                      setActiveSection(prevSection.toString());
                    }}
                    disabled={parseInt(activeSection) === 0 || submitting}
                    className="border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                  </Button>
                  
                  {parseInt(activeSection) === configuration.sections.length - 1 ? (
                    <Button 
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700 transition-colors"
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
                      className="bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Next <ChevronRight className="ml-1 h-4 w-4" />
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

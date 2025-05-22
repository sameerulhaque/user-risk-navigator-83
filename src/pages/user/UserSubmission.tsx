
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import SectionFieldsList from "@/components/SectionFieldsList";
import { 
  getRiskConfiguration, 
  getFieldOptions, 
  submitUserData,
  getCompanies 
} from "@/services/api";
import { 
  RiskConfiguration,
  RiskCompanySection,
  RiskCompanyField,
  UserSubmission as UserSubmissionType,
  RiskSection,
  RiskField,
  Company
} from "@/types/risk";
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
  const [companySections, setCompanySections] = useState<RiskCompanySection[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [fieldOptions, setFieldOptions] = useState<Record<string, DropdownOption[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("0");
  const [loadingOptions, setLoadingOptions] = useState<Record<string, boolean>>({});
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [companyId, setCompanyId] = useState<string>("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(true);
  
  const userId = 1; // Mock user ID, would come from auth context in a real app
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch available companies for dropdown
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const response = await getCompanies();
        if (response.isSuccess && response.value) {
          setCompanies(response.value);
          // Auto-select the first company if available
          if (response.value.length > 0) {
            setCompanyId(response.value[0].id.toString());
          }
        }
      } catch (error) {
        console.error('Failed to fetch companies:', error);
        toast({
          title: "Error",
          description: "Failed to fetch available companies",
          variant: "destructive"
        });
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [toast]);

  useEffect(() => {
    // Load configuration based on company ID when it's entered
    const fetchConfiguration = async (cId: number) => {
      if (!cId) return;
      
      setLoading(true);
      try {
        const response = await getRiskConfiguration(cId);
        if (response.isSuccess && response.value) {
          setConfiguration(response.value);
          
          // Initialize form data structure for active company sections
          const initialFormData: FormData = {};
          const activeSections = response.value.companySections?.filter(s => s.isActive) || [];
          
          activeSections.forEach(section => {
            initialFormData[section.id] = {};
            
            // Only include active fields
            const activeFields = section.fields?.filter(f => f.isActive) || [];
            activeFields.forEach(field => {
              // Use a sensible default value based on field type
              let defaultValue;
              if (field.field) {
                switch (field.field.fieldType) {
                  case 'number': defaultValue = ""; break;
                  case 'checkbox': defaultValue = false; break;
                  case 'date': defaultValue = ""; break;
                  case 'select': defaultValue = ""; break;
                  default: defaultValue = ""; break;
                }
                
                initialFormData[section.id][field.field.id] = defaultValue;
              }
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

    // Fetch configuration when company ID is selected
    if (companyId) {
      fetchConfiguration(parseInt(companyId));
    } else {
      // Clear configuration if company ID is cleared
      setConfiguration(null);
      setFormData({});
      setLoading(false);
    }
  }, [companyId, toast]);

  // Calculate completion percentage whenever formData changes
  useEffect(() => {
    if (!configuration) return;

    let totalRequiredFields = 0;
    let completedRequiredFields = 0;

    // Only count active sections and fields
    const activeSections = configuration.companySections?.filter(s => s.isActive) || [];
    
    activeSections.forEach(section => {
      const activeFields = section.fields?.filter(f => f.isActive) || [];
      
      activeFields.forEach(field => {
        if (field.field?.isRequired) {
          totalRequiredFields++;
          const value = formData[section.id]?.[field.field.id];
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
    
    // Only load options for active sections and fields
    const activeSections = config.companySections?.filter(s => s.isActive) || [];
    
    activeSections.forEach(section => {
      const activeFields = section.fields?.filter(f => f.isActive) || [];
      
      activeFields.forEach(companyField => {
        const field = companyField.field;
        
        // If field already has value mappings, we don't need to fetch from API
        if (field.valueMappings && field.valueMappings.length > 0) {
          // Use existing value mappings
          const mappedOptions = field.valueMappings.map(mapping => ({
            id: mapping.value,
            label: mapping.text
          }));
          
          setFieldOptions(prev => ({
            ...prev,
            [field.endpointURL || `field-${field.id}`]: mappedOptions
          }));
        } 
        // Otherwise fetch from endpoint if available
        else if (field.fieldType === 'select' && field.endpointURL) {
          optionsPromises.push(loadFieldOptions(field));
        }
      });
    });
    
    await Promise.all(optionsPromises);
  };

  const loadFieldOptions = async (field: { id: number, endpointURL?: string }) => {
    if (!field.endpointURL) return;
    
    const cacheKey = field.endpointURL;
    setLoadingOptions(prev => ({ ...prev, [cacheKey]: true }));
    
    try {
      const response = await getFieldOptions(field.endpointURL);
      if (response.isSuccess && response.value) {
        setFieldOptions(prev => ({
          ...prev,
          [cacheKey]: response.value || []
        }));
      }
    } catch (error) {
      console.error(`Error loading options for field ${field.id}:`, error);
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
    
    const activeSections = configuration.companySections?.filter(s => s.isActive) || [];
    
    activeSections.forEach((section, sectionIndex) => {
      const activeFields = section.fields?.filter(f => f.isActive) || [];
      
      activeFields.forEach(field => {
        if (field.field.isRequired) {
          const value = formData[section.id]?.[field.field.id];
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
      companyId: configuration.companyId, // Include company ID in submission
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

  // Get active sections from configuration
  const getActiveSections = (): RiskCompanySection[] => {
    if (!configuration || !configuration.companySections) return [];
    return configuration.companySections.filter(section => section.isActive);
  };

  // Get active fields from a section
  const getActiveFields = (section: RiskCompanySection): RiskCompanyField[] => {
    if (!section.fields) return [];
    return section.fields.filter(field => field.isActive);
  };

  if (loading && companyId) {
    return <LoadingSpinner />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Risk Assessment Form"
        description="Please select a company and complete all sections to receive your risk assessment"
      />

      {/* Company ID Dropdown */}
      <Card className="mb-6 card-elevated">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="company-select">Select Company</Label>
              {loadingCompanies ? (
                <div className="flex items-center mt-2">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Loading companies...</span>
                </div>
              ) : (
                <Select
                  value={companyId}
                  onValueChange={(value) => setCompanyId(value)}
                  disabled={submitting}
                >
                  <SelectTrigger id="company-select" className="mt-1">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {configuration && (
              <div className="md:col-span-2">
                <div className="flex items-center gap-4 h-full">
                  <div className="flex-1">
                    <Progress value={completionPercentage} className="h-2" />
                  </div>
                  <div className="text-sm font-medium text-blue-700">
                    {completionPercentage}% Complete
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!configuration && !loading && (
        <div className="text-center py-8">
          <h3 className="text-xl font-medium mb-2">Please Select a Company</h3>
          <p className="text-muted-foreground">Select a company to load the risk assessment form.</p>
        </div>
      )}

      {configuration && (
        <Tabs
          value={activeSection}
          onValueChange={setActiveSection}
          className="space-y-4"
        >
          <div className="overflow-x-auto pb-2">
            <TabsList className="h-auto p-1 inline-flex flex-nowrap min-w-full">
              {getActiveSections().map((section, index) => (
                <TabsTrigger 
                  key={section.id} 
                  value={index.toString()}
                  className="py-2 px-4 whitespace-nowrap transition-all hover:bg-blue-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  {section.section?.sectionName}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {getActiveSections().map((section, index) => (
            <TabsContent key={section.id} value={index.toString()} className="animate-fade-in">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-blue-800">{section.section?.sectionName}</CardTitle>
                  <CardDescription>
                    Please provide accurate information for this section
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SectionFieldsList
                    sectionId={section.id}
                    fields={getActiveFields(section)}
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
                    
                    {parseInt(activeSection) === getActiveSections().length - 1 ? (
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
                            getActiveSections().length - 1,
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
      )}
    </div>
  );
};

export default UserSubmission;

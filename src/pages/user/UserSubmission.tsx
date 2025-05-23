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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, RefreshCw, Info } from "lucide-react";
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
  const [errorFetchingCompanies, setErrorFetchingCompanies] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  
  const userId = 1; // Mock user ID, would come from auth context in a real app
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch available companies for dropdown
  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    setErrorFetchingCompanies(false);
    
    try {
      console.log("Fetching companies...");
      const response = await getCompanies();
      console.log("Company response:", response);
      
      if (response.isSuccess && response.value && response.value.length > 0) {
        setCompanies(response.value);
        // Auto-select the first company if available
        setCompanyId(response.value[0].id.toString());
        console.log("Auto-selected company ID:", response.value[0].id.toString());
      } else {
        console.error("No companies returned or unsuccessful response:", response);
        setErrorFetchingCompanies(true);
        toast({
          title: "Warning",
          description: "No companies available. Using mock data.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      setErrorFetchingCompanies(true);
      toast({
        title: "Error",
        description: "Failed to fetch companies. Using mock data if available.",
        variant: "destructive"
      });
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Initial company fetch
  useEffect(() => {
    fetchCompanies();
  }, [toast]);

  useEffect(() => {
    // Load configuration based on company ID when it's entered
    const fetchConfiguration = async (cId: number) => {
      if (!cId) return;
      
      setLoading(true);
      try {
        console.log(`Fetching configuration for company ID: ${cId}`);
        const response = await getRiskConfiguration(cId);
        console.log("Configuration response:", response);
        
        if (response.isSuccess && response.value) {
          setConfiguration(response.value);
          
          // Check if configuration has active sections
          const activeSections = response.value.companySections?.filter(s => s.isActive) || [];
          
          if (activeSections.length === 0) {
            console.log("No active sections found in configuration");
            toast({
              title: "Information",
              description: "This company doesn't have any active form sections configured yet",
              variant: "default"
            });
          } else {
            console.log(`Found ${activeSections.length} active sections`);
            
            // Initialize form data structure for active company sections
            const initialFormData: FormData = {};
            
            activeSections.forEach(section => {
              initialFormData[section.id] = {};
              
              // Only include active fields
              const activeFields = section.fields?.filter(f => f.isActive) || [];
              
              if (activeFields.length === 0) {
                console.log(`No active fields found for section ${section.section?.sectionName}`);
              } else {
                console.log(`Found ${activeFields.length} active fields for section ${section.section?.sectionName}`);
                
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
              }
            });
            
            setFormData(initialFormData);
            
            // Load options for all dropdown fields
            await loadAllDropdownOptions(response.value);
          }
        } else {
          console.error("Failed to load configuration or empty response:", response);
          toast({
            title: "Error",
            description: "Failed to load form configuration",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching configuration:", error);
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
      console.log("Submitting user data:", submission);
      // First try the API call
      const response = await submitUserData(submission);
      console.log("Submission response:", response);
      
      if (response.isSuccess) {
        setSubmissionSuccess(true);
        
        toast({
          title: "Success",
          description: "Your information has been submitted successfully"
        });
        
        // Wait a moment to show the success state
        setTimeout(() => {
          // Navigate to the dashboard to see results
          navigate("/user/dashboard");
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: "Failed to submit your information",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting user data:", error);
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
      <Card className="mb-6 card-elevated shadow-md border-gray-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="company-select">Select Company</Label>
              <div className="flex items-center gap-2">
                {loadingCompanies ? (
                  <div className="flex items-center mt-2">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Loading companies...</span>
                  </div>
                ) : (
                  <>
                    <Select
                      value={companyId}
                      onValueChange={(value) => setCompanyId(value)}
                      disabled={submitting}
                    >
                      <SelectTrigger id="company-select" className="mt-1 flex-1">
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {companies && companies.length > 0 ? (
                            companies.map((company) => (
                              <SelectItem key={company.id} value={company.id.toString()}>
                                {company.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-options" disabled>
                              No companies available
                            </SelectItem>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={fetchCompanies}
                      disabled={loadingCompanies || submitting}
                      title="Refresh companies"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              
              {errorFetchingCompanies && (
                <Alert className="mt-2 bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800 text-sm">
                    Problem loading companies
                  </AlertTitle>
                  <AlertDescription className="text-amber-700 text-xs">
                    There was an issue fetching companies. Using mock data if available.
                  </AlertDescription>
                </Alert>
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

      {submissionSuccess && (
        <Alert className="mb-6 animate-fade-in bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">Submission Successful!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your risk assessment has been submitted successfully. Redirecting to dashboard...
          </AlertDescription>
        </Alert>
      )}

      {!configuration && !loading && (
        <div className="text-center py-8">
          <h3 className="text-xl font-medium mb-2">Please Select a Company</h3>
          <p className="text-muted-foreground">Select a company to load the risk assessment form.</p>
        </div>
      )}

      {configuration && getActiveSections().length === 0 && (
        <Alert className="mb-6 animate-fade-in bg-blue-50 border-blue-200">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800">No Form Configuration Available</AlertTitle>
          <AlertDescription className="text-blue-700">
            This company hasn't configured any active form sections yet. Please contact the company administrator to set up the risk assessment form.
          </AlertDescription>
        </Alert>
      )}

      {configuration && getActiveSections().length > 0 && (
        <Tabs
          value={activeSection}
          onValueChange={setActiveSection}
          className="space-y-4"
        >
          <div className="overflow-x-auto pb-2">
            <TabsList className="h-auto p-1 inline-flex flex-nowrap min-w-full bg-blue-50 rounded-t-md">
              {getActiveSections().map((section, index) => (
                <TabsTrigger 
                  key={section.id} 
                  value={index.toString()}
                  className="py-2 px-4 whitespace-nowrap transition-all hover:bg-blue-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  {section.section?.sectionName}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {getActiveSections().map((section, index) => {
            const activeFields = getActiveFields(section);
            
            return (
              <TabsContent key={section.id} value={index.toString()} className="animate-fade-in">
                <Card className="card-elevated shadow-md border-gray-200">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                    <CardTitle className="text-blue-800">{section.section?.sectionName}</CardTitle>
                    <CardDescription>
                      Please provide accurate information for this section
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activeFields.length === 0 ? (
                      <Alert className="mb-6 animate-fade-in bg-blue-50 border-blue-200">
                        <Info className="h-5 w-5 text-blue-600" />
                        <AlertTitle className="text-blue-800">No Active Fields</AlertTitle>
                        <AlertDescription className="text-blue-700">
                          This section doesn't have any active fields configured yet.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <SectionFieldsList
                        sectionId={section.id}
                        fields={activeFields}
                        formData={formData[section.id] || {}}
                        loadingOptions={loadingOptions}
                        fieldOptions={fieldOptions}
                        submitting={submitting}
                        handleInputChange={handleInputChange}
                      />
                    )}

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
                          disabled={submitting || submissionSuccess || activeFields.length === 0}
                          className="bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          {submitting ? (
                            <div className="flex items-center gap-2">
                              <LoadingSpinner size="sm" color="white" /> Submitting...
                            </div>
                          ) : "Submit Application"}
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
            );
          })}
        </Tabs>
      )}
    </div>
  );
};

export default UserSubmission;

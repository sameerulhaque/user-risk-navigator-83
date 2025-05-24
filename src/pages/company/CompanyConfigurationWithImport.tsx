
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Download, Save, Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExcelImportModal from "@/components/ExcelImportModal";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  getRiskConfiguration, 
  saveRiskConfiguration, 
  getDefaultSections, 
  getDefaultFields,
  importSectionsFromFile,
  importFieldsFromFile
} from "@/services/api";
import { RiskConfiguration, RiskCompanySection, RiskCompanyField } from "@/types/risk";

const CompanyConfigurationWithImport = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [configuration, setConfiguration] = useState<RiskConfiguration | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false);
  const [showAddFieldDialog, setShowAddFieldDialog] = useState(false);
  const [selectedSectionForField, setSelectedSectionForField] = useState<number | null>(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [newFieldData, setNewFieldData] = useState({
    label: "",
    fieldType: "text",
    isRequired: false,
    placeholder: ""
  });

  const { data: configData, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['riskConfiguration', companyId],
    queryFn: () => getRiskConfiguration(companyId),
  });

  const { data: sectionsData } = useQuery({
    queryKey: ['defaultSections'],
    queryFn: () => getDefaultSections(),
  });

  const saveMutation = useMutation({
    mutationFn: saveRiskConfiguration,
    onSuccess: () => {
      toast({ title: "Success", description: "Configuration saved successfully" });
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ['riskConfiguration'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save configuration", variant: "destructive" });
    }
  });

  useEffect(() => {
    if (configData?.isSuccess && configData.value) {
      setConfiguration(configData.value);
    }
  }, [configData]);

  const handleSectionWeightageChange = (sectionId: number, weightage: number) => {
    if (!configuration) return;
    
    const updatedSections = configuration.companySections?.map(section => 
      section.sectionId === sectionId ? { ...section, weightage } : section
    );
    
    setConfiguration({ ...configuration, companySections: updatedSections });
    setIsDirty(true);
  };

  const handleSectionToggle = (sectionId: number, isActive: boolean) => {
    if (!configuration) return;
    
    const updatedSections = configuration.companySections?.map(section => 
      section.sectionId === sectionId ? { ...section, isActive } : section
    );
    
    setConfiguration({ ...configuration, companySections: updatedSections });
    setIsDirty(true);
  };

  const handleFieldToggle = (sectionId: number, fieldId: number, isActive: boolean) => {
    if (!configuration) return;
    
    const updatedSections = configuration.companySections?.map(section => {
      if (section.sectionId === sectionId) {
        const updatedFields = section.fields?.map(field => 
          field.fieldId === fieldId ? { ...field, isActive } : field
        );
        return { ...section, fields: updatedFields };
      }
      return section;
    });
    
    setConfiguration({ ...configuration, companySections: updatedSections });
    setIsDirty(true);
  };

  const handleImportSections = async (file: File) => {
    try {
      const response = await importSectionsFromFile(file);
      if (response.isSuccess) {
        toast({ 
          title: "Success", 
          description: `Imported ${response.value?.length || 0} sections successfully` 
        });
        queryClient.invalidateQueries({ queryKey: ['defaultSections'] });
        queryClient.invalidateQueries({ queryKey: ['riskConfiguration'] });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to import sections", variant: "destructive" });
    }
  };

  const handleImportFields = async (file: File, additionalData?: { sectionId: number }) => {
    if (!additionalData?.sectionId) {
      toast({ title: "Error", description: "Please select a section", variant: "destructive" });
      return;
    }

    try {
      const response = await importFieldsFromFile(file, additionalData.sectionId);
      if (response.isSuccess) {
        toast({ 
          title: "Success", 
          description: `Imported ${response.value?.length || 0} fields successfully` 
        });
        queryClient.invalidateQueries({ queryKey: ['defaultFields'] });
        queryClient.invalidateQueries({ queryKey: ['riskConfiguration'] });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to import fields", variant: "destructive" });
    }
  };

  const handleAddSection = () => {
    if (!configuration || !newSectionName.trim()) {
      toast({ title: "Error", description: "Please enter a section name", variant: "destructive" });
      return;
    }

    const newSection: RiskCompanySection = {
      id: Date.now(),
      sectionId: Date.now(),
      companyId: parseInt(companyId || "1"),
      weightage: 0,
      isActive: true,
      section: {
        id: Date.now(),
        sectionName: newSectionName.trim(),
        orderIndex: (configuration.companySections?.length || 0) + 1
      },
      fields: []
    };

    setConfiguration({
      ...configuration,
      companySections: [...(configuration.companySections || []), newSection]
    });
    
    setIsDirty(true);
    setShowAddSectionDialog(false);
    setNewSectionName("");
    
    toast({ title: "Success", description: "Section added successfully" });
  };

  const handleAddField = () => {
    if (!configuration || !selectedSectionForField || !newFieldData.label.trim()) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const newField: RiskCompanyField = {
      id: Date.now(),
      fieldId: Date.now(),
      companyId: parseInt(companyId || "1"),
      isActive: true,
      maxScore: 100,
      field: {
        id: Date.now(),
        sectionId: selectedSectionForField,
        label: newFieldData.label.trim(),
        fieldType: newFieldData.fieldType as "text" | "select" | "number" | "date",
        isRequired: newFieldData.isRequired,
        placeholder: newFieldData.placeholder || undefined,
        orderIndex: 1,
        valueMappings: []
      }
    };

    const updatedSections = configuration.companySections?.map(section => {
      if (section.sectionId === selectedSectionForField) {
        return {
          ...section,
          fields: [...(section.fields || []), newField]
        };
      }
      return section;
    });

    setConfiguration({
      ...configuration,
      companySections: updatedSections
    });
    
    setIsDirty(true);
    setShowAddFieldDialog(false);
    setSelectedSectionForField(null);
    setNewFieldData({
      label: "",
      fieldType: "text",
      isRequired: false,
      placeholder: ""
    });
    
    toast({ title: "Success", description: "Field added successfully" });
  };

  const handleSave = () => {
    if (configuration) {
      saveMutation.mutate(configuration);
    }
  };

  if (isLoadingConfig) {
    return <LoadingSpinner />;
  }

  if (!configuration) {
    return <div>Configuration not found</div>;
  }

  const availableSections = sectionsData?.value || [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Risk Configuration"
        description="Configure risk assessment parameters for the company"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline">{configuration.version}</Badge>
          <span className="text-sm text-gray-600">{configuration.name}</span>
        </div>
        <div className="flex gap-2">
          <ExcelImportModal
            title="Import Sections"
            description="Import risk sections from Excel or CSV file"
            onImport={handleImportSections}
            acceptedFileTypes=".xlsx,.xls,.csv"
          >
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import Sections
            </Button>
          </ExcelImportModal>

          <ExcelImportModal
            title="Import Fields"
            description="Import risk fields for a specific section from Excel or CSV file"
            onImport={handleImportFields}
            acceptedFileTypes=".xlsx,.xls,.csv"
            showSectionSelector={true}
            sections={availableSections.map(s => ({ id: s.id, name: s.sectionName }))}
          >
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import Fields
            </Button>
          </ExcelImportModal>

          <Dialog open={showAddSectionDialog} onOpenChange={setShowAddSectionDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Section</DialogTitle>
                <DialogDescription>
                  Create a new risk assessment section
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="section-name">Section Name</Label>
                  <Input
                    id="section-name"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="Enter section name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddSectionDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSection}>
                  Add Section
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddFieldDialog} onOpenChange={setShowAddFieldDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Field</DialogTitle>
                <DialogDescription>
                  Create a new field for a section
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="field-section">Select Section</Label>
                  <select
                    id="field-section"
                    className="w-full p-2 border rounded"
                    value={selectedSectionForField || ""}
                    onChange={(e) => setSelectedSectionForField(Number(e.target.value))}
                  >
                    <option value="">Choose a section</option>
                    {configuration.companySections?.map(section => (
                      <option key={section.id} value={section.sectionId}>
                        {section.section?.sectionName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="field-label">Field Label</Label>
                  <Input
                    id="field-label"
                    value={newFieldData.label}
                    onChange={(e) => setNewFieldData({...newFieldData, label: e.target.value})}
                    placeholder="Enter field label"
                  />
                </div>
                <div>
                  <Label htmlFor="field-type">Field Type</Label>
                  <select
                    id="field-type"
                    className="w-full p-2 border rounded"
                    value={newFieldData.fieldType}
                    onChange={(e) => setNewFieldData({...newFieldData, fieldType: e.target.value})}
                  >
                    <option value="text">Text</option>
                    <option value="select">Select</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="field-required"
                    checked={newFieldData.isRequired}
                    onCheckedChange={(checked) => setNewFieldData({...newFieldData, isRequired: checked})}
                  />
                  <Label htmlFor="field-required">Required field</Label>
                </div>
                <div>
                  <Label htmlFor="field-placeholder">Placeholder (optional)</Label>
                  <Input
                    id="field-placeholder"
                    value={newFieldData.placeholder}
                    onChange={(e) => setNewFieldData({...newFieldData, placeholder: e.target.value})}
                    placeholder="Enter placeholder text"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddFieldDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddField}>
                  Add Field
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={handleSave} 
            disabled={!isDirty || saveMutation.isPending}
            className="ml-4"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sections" className="w-full">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
        </TabsList>

        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <CardTitle>Risk Sections Configuration</CardTitle>
              <CardDescription>
                Configure which sections are active and their weightages for risk calculation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {configuration.companySections?.map((section) => (
                <div key={section.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={section.isActive}
                      onCheckedChange={(checked) => handleSectionToggle(section.sectionId, checked)}
                    />
                    <div>
                      <h4 className="font-medium">{section.section?.sectionName}</h4>
                      <p className="text-sm text-gray-600">
                        {section.fields?.length || 0} fields configured
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Label htmlFor={`weightage-${section.id}`} className="text-sm">Weightage</Label>
                      <Input
                        id={`weightage-${section.id}`}
                        type="number"
                        min="0"
                        max="100"
                        value={section.weightage}
                        onChange={(e) => handleSectionWeightageChange(section.sectionId, Number(e.target.value))}
                        className="w-20 text-center"
                        disabled={!section.isActive}
                      />
                    </div>
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fields">
          <div className="space-y-6">
            {configuration.companySections?.filter(section => section.isActive).map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.section?.sectionName}</CardTitle>
                  <CardDescription>
                    Configure fields for this section
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {section.fields?.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={field.isActive}
                          onCheckedChange={(checked) => handleFieldToggle(section.sectionId, field.fieldId, checked)}
                        />
                        <div>
                          <h5 className="font-medium">{field.field?.label}</h5>
                          <p className="text-sm text-gray-600">
                            Type: {field.field?.fieldType} | Required: {field.field?.isRequired ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Max Score: {field.maxScore}
                      </div>
                    </div>
                  ))}
                  {(!section.fields || section.fields.length === 0) && (
                    <p className="text-center text-gray-500 py-4">No fields configured for this section</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyConfigurationWithImport;

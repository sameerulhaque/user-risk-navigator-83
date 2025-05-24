
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExcelImportModalProps {
  title: string;
  description: string;
  onImport: (file: File, additionalData?: any) => Promise<void>;
  acceptedFileTypes?: string;
  showSectionSelector?: boolean;
  sections?: Array<{ id: number; name: string }>;
  children: React.ReactNode;
}

const ExcelImportModal = ({
  title,
  description,
  onImport,
  acceptedFileTypes = ".xlsx,.xls,.csv",
  showSectionSelector = false,
  sections = [],
  children
}: ExcelImportModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to import",
        variant: "destructive"
      });
      return;
    }

    if (showSectionSelector && !selectedSection) {
      toast({
        title: "Error",
        description: "Please select a section",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const additionalData = showSectionSelector ? { sectionId: parseInt(selectedSection) } : undefined;
      await onImport(selectedFile, additionalData);
      
      toast({
        title: "Success",
        description: "File imported successfully"
      });
      
      setIsOpen(false);
      setSelectedFile(null);
      setSelectedSection("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const csvContent = showSectionSelector
      ? "Field Name,Field Type,Required,Options\nSample Field,text,true,\nSample Dropdown,select,false,\"Option1,Option2,Option3\""
      : "Section Name,Weightage,Active\nSample Section,25,true\nAnother Section,30,true";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription>
              <Button variant="link" onClick={downloadTemplate} className="p-0 h-auto font-normal">
                Download template file
              </Button>
              {" "}to see the expected format.
            </AlertDescription>
          </Alert>

          {showSectionSelector && (
            <div>
              <Label htmlFor="section-select">Select Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="file-upload">Upload File</Label>
            <Input
              id="file-upload"
              type="file"
              accept={acceptedFileTypes}
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>

          {selectedFile && (
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!selectedFile || isUploading}>
              {isUploading ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelImportModal;

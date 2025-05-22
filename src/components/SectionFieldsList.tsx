import { useState } from "react";
import { RiskField, RiskCompanyField } from "@/types/risk";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SectionFieldsListProps {
  sectionId: number;
  fields: RiskCompanyField[];
  formData: Record<number, any>;
  loadingOptions: Record<string, boolean>;
  fieldOptions: Record<string, { id: number; label: string }[]>;
  submitting: boolean;
  handleInputChange: (sectionId: number, fieldId: number, value: any) => void;
}

const SectionFieldsList = ({
  sectionId,
  fields,
  formData,
  loadingOptions,
  fieldOptions,
  submitting,
  handleInputChange,
}: SectionFieldsListProps) => {
  const [expandedField, setExpandedField] = useState<string | null>(null);

  // Group fields by category if they have more than 10 fields
  const shouldGroupFields = fields.length > 10;
  
  // Create groups of fields (5 per group)
  const fieldGroups = shouldGroupFields
    ? fields.reduce((acc, field, index) => {
        const groupIndex = Math.floor(index / 5);
        if (!acc[groupIndex]) acc[groupIndex] = [];
        acc[groupIndex].push(field);
        return acc;
      }, [] as RiskCompanyField[][])
    : [fields];

  // Render a field based on its type
  const renderField = (companyField: RiskCompanyField) => {
    const field = companyField.field;
    const fieldId = field.id;
    const value = formData[fieldId] || "";
    
    switch (field.fieldType) {
      case 'text':
        return (
          <Input
            id={`field-${sectionId}-${fieldId}`}
            value={value}
            onChange={(e) => handleInputChange(sectionId, fieldId, e.target.value)}
            className="mt-1"
            placeholder={field.placeholder}
            disabled={submitting}
          />
        );
        
      case 'number':
        return (
          <Input
            id={`field-${sectionId}-${fieldId}`}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(sectionId, fieldId, Number(e.target.value))}
            className="mt-1"
            placeholder={field.placeholder}
            disabled={submitting}
          />
        );
        
      case 'select':
        let options: { id: number; label: string }[] = [];
        
        // First check if we have predefined value mappings
        if (field.valueMappings && field.valueMappings.length > 0) {
          options = field.valueMappings.map(mapping => ({
            id: mapping.value,
            label: mapping.text
          }));
        } 
        // Otherwise fetch from endpoint
        else if (field.endpointURL) {
          options = fieldOptions[field.endpointURL] || [];
        }
        
        const isLoading = field.endpointURL ? loadingOptions[field.endpointURL] : false;
        
        return (
          <Select
            value={value ? value.toString() : undefined}
            onValueChange={(val) => handleInputChange(sectionId, fieldId, Number(val))}
            disabled={submitting || isLoading}
          >
            <SelectTrigger id={`field-${sectionId}-${fieldId}`} className="mt-1">
              <SelectValue placeholder={isLoading ? "Loading options..." : field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => {
                // Make sure option.id exists and is never an empty string when converted
                const optionId = option.id;
                const optionValue = optionId !== undefined && optionId !== null
                  ? optionId.toString() 
                  : `undefined_option_${Math.random().toString(36).substring(2, 9)}`;
                  
                return (
                  <SelectItem 
                    key={optionId || Math.random().toString(36).substring(2, 9)} 
                    value={optionValue === "" ? "empty_value" : optionValue}
                  >
                    {option.label || "Unnamed option"}
                  </SelectItem>
                );
              })}
              {options.length === 0 && !isLoading && (
                <SelectItem value="no_options_available">No options available</SelectItem>
              )}
            </SelectContent>
          </Select>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center mt-2">
            <input
              id={`field-${sectionId}-${fieldId}`}
              type="checkbox"
              checked={value}
              onChange={(e) => handleInputChange(sectionId, fieldId, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
              disabled={submitting}
            />
            <label htmlFor={`field-${sectionId}-${fieldId}`} className="ml-2 text-sm">
              Yes
            </label>
          </div>
        );
        
      case 'date':
        return (
          <Input
            id={`field-${sectionId}-${fieldId}`}
            type="date"
            value={value}
            onChange={(e) => handleInputChange(sectionId, fieldId, e.target.value)}
            className="mt-1"
            disabled={submitting}
          />
        );
        
      default:
        return <div>Unsupported field type: {field.fieldType}</div>;
    }
  };

  if (shouldGroupFields) {
    return (
      <Accordion
        type="single"
        collapsible
        value={expandedField}
        onValueChange={setExpandedField}
        className="w-full"
      >
        {fieldGroups.map((group, groupIndex) => (
          <AccordionItem 
            key={`group-${groupIndex}`} 
            value={`group-${groupIndex}`}
            className="animate-fade-in border border-blue-100 mb-3 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-2 hover:bg-blue-50">
              <span className="text-blue-700 font-medium">
                Fields {groupIndex * 5 + 1} - {Math.min((groupIndex + 1) * 5, fields.length)}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.map(companyField => (
                  <div key={companyField.field.id} className="animate-fade-in">
                    <Label 
                      htmlFor={`field-${sectionId}-${companyField.field.id}`} 
                      className="mb-1 block"
                    >
                      {companyField.field.label} {companyField.field.isRequired && <span className="text-red-500">*</span>}
                    </Label>
                    {renderField(companyField)}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {fields.map(companyField => (
        <div key={companyField.field.id} className="animate-fade-in">
          <Label 
            htmlFor={`field-${sectionId}-${companyField.field.id}`} 
            className="mb-1 block"
          >
            {companyField.field.label} {companyField.field.isRequired && <span className="text-red-500">*</span>}
          </Label>
          {renderField(companyField)}
        </div>
      ))}
    </div>
  );
};

export default SectionFieldsList;

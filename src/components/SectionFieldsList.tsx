
import { useState } from "react";
import { Field } from "@/types/risk";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SectionFieldsListProps {
  sectionId: number;
  fields: Field[];
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
      }, [] as Field[][])
    : [fields];

  // Render a field based on its type
  const renderField = (field: Field) => {
    const value = formData[field.id] || "";
    
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
            value={value ? value.toString() : undefined}
            onValueChange={(val) => handleInputChange(sectionId, field.id, Number(val))}
            disabled={submitting || isLoading}
          >
            <SelectTrigger id={`field-${sectionId}-${field.id}`} className="mt-1">
              <SelectValue placeholder={isLoading ? "Loading options..." : "Select an option"} />
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
                {group.map(field => (
                  <div key={field.id} className="animate-fade-in">
                    <Label 
                      htmlFor={`field-${sectionId}-${field.id}`} 
                      className="mb-1 block"
                    >
                      {field.name} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    {renderField(field)}
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
      {fields.map(field => (
        <div key={field.id} className="animate-fade-in">
          <Label 
            htmlFor={`field-${sectionId}-${field.id}`} 
            className="mb-1 block"
          >
            {field.name} {field.required && <span className="text-red-500">*</span>}
          </Label>
          {renderField(field)}
        </div>
      ))}
    </div>
  );
};

export default SectionFieldsList;

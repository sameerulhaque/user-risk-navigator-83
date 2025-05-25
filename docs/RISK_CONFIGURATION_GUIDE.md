
# Risk Configuration System - Detailed Guide

## Overview

The Risk Configuration system is the heart of the platform, providing two distinct interfaces for managing risk assessment configurations. This guide covers both interfaces and their specific use cases.

## Configuration Interfaces Comparison

| Feature | Standard Configuration | Configuration with Import |
|---------|----------------------|---------------------------|
| **Route** | `/company/configuration` | `/company/configuration-import` |
| **Primary Use** | Manual configuration | Bulk import + configuration |
| **File Import** | ❌ | ✅ Excel/CSV |
| **Section Management** | Manual creation | Import + manual |
| **Field Management** | Manual creation | Import + manual |
| **Template Download** | ❌ | ✅ |
| **Bulk Operations** | ❌ | ✅ |

## Standard Risk Configuration

### Interface Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Risk Configuration                                   [Save] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Select Company: [Dropdown]                              │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ⚠️ Total section weightage is 85%. 15% more needed to      │
│    reach 100%.                                             │
├─────────────────────────────────────────────────────────────┤
│ Configuration Details                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Name: [Risk Assessment v2.1]  Version: [2.1]           │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [Financial Risk (25%)] [Operational (30%)] [Compliance]    │
├─────────────────────────────────────────────────────────────┤
│ Financial Risk Section                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [●] Active    Section Weightage: 25%    [25% of 85%]   │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│ │ 0%              50%              100%                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Fields                                     2 of 5 active    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ▼ [●] Annual Revenue (select)                           │ │
│ │   ┌───────────────────────────────────────────────────┐ │ │
│ │   │ Field Conditions Configuration    [+ Add Value]   │ │ │
│ │   │                                                   │ │ │
│ │   │ ┌─────────────────────────────────────────────┐   │ │ │
│ │   │ │ Field Value: "Less than $1M"         [×]   │   │ │ │
│ │   │ │ Condition Type: [Greater Than ▼]           │   │ │ │
│ │   │ │ Risk Weightage: 75% ═══════════════════════ │   │ │ │
│ │   │ │ 0%           50%           100%             │   │ │ │
│ │   │ └─────────────────────────────────────────────┘   │ │ │
│ │   └───────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Step-by-Step Configuration Process

#### 1. Company Selection
```typescript
// Company selection triggers configuration load
const handleCompanyChange = (companyId: string) => {
  setSelectedCompanyId(companyId);
  // Triggers useQuery to fetch configuration
};
```

#### 2. Section Weight Management
- **Requirement**: Total weights must equal 100%
- **Validation**: Real-time weight validation with alerts
- **Interface**: Slider controls with percentage display

```typescript
const updateSectionWeightage = (sectionId: number, weightage: number) => {
  // Update section weight
  // Trigger validation
  // Show/hide alerts based on total
};

const isValidWeightage = (): boolean => {
  return calculateTotalWeight() === 100;
};
```

#### 3. Field Configuration
Each field can have multiple conditions with individual scoring:

```typescript
interface FieldConditionUI {
  fieldValue: string;        // Display name
  conditionType: string;     // equals, greaterThan, lessThan, between, etc.
  conditionValue1?: string;  // Primary condition value
  conditionValue2?: string;  // Secondary value (for "between")
  riskWeightage: number;     // 0-100% risk score
}
```

#### 4. Condition Types
- **Equals**: Exact match comparison
- **Greater Than**: Numeric comparison >
- **Less Than**: Numeric comparison <
- **Between**: Range comparison (requires two values)
- **Contains**: String contains check
- **Is Empty**: Null/undefined/empty check
- **Is Not Empty**: Not null/undefined/empty check

## Risk Configuration with Import

### Enhanced Interface Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Risk Configuration                                          │
│              [Import Sections] [Import Fields] [+ Section]  │
│                                              [+ Field] [Save] │
├─────────────────────────────────────────────────────────────┤
│ Version: v2.1    Risk Assessment v2.1                      │
├─────────────────────────────────────────────────────────────┤
│ [Sections] [Fields]                                         │
├─────────────────────────────────────────────────────────────┤
│ Risk Sections Configuration                                 │
│ Configure which sections are active and their weightages   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [●] Financial Assessment      Weightage: [25] % [●●●○○] │ │
│ │     3 fields configured                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [●] Operational Risk          Weightage: [35] % [●●●●○] │ │
│ │     5 fields configured                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Import Functionality

#### 1. Section Import Process
```typescript
const handleImportSections = async (file: File) => {
  try {
    // 1. Validate file format (.xlsx, .xls, .csv)
    // 2. Parse file content
    // 3. Validate section data structure
    // 4. Create sections in database
    // 5. Refresh configuration
    
    const response = await importSectionsFromFile(file);
    if (response.isSuccess) {
      toast({ title: "Success", description: `Imported ${response.value?.length} sections` });
      queryClient.invalidateQueries(['riskConfiguration']);
    }
  } catch (error) {
    toast({ title: "Error", description: "Failed to import sections" });
  }
};
```

#### 2. Field Import Process
```typescript
const handleImportFields = async (file: File, additionalData: { sectionId: number }) => {
  if (!additionalData?.sectionId) {
    toast({ title: "Error", description: "Please select a section" });
    return;
  }

  try {
    // 1. Validate file and section selection
    // 2. Parse field definitions
    // 3. Create fields for specified section
    // 4. Set up default conditions if applicable
    
    const response = await importFieldsFromFile(file, additionalData.sectionId);
    if (response.isSuccess) {
      toast({ title: "Success", description: `Imported ${response.value?.length} fields` });
    }
  } catch (error) {
    toast({ title: "Error", description: "Failed to import fields" });
  }
};
```

### Import Templates

#### Section Import Template Structure
```csv
Section Name,Weightage,Active
Financial Risk Assessment,25,true
Operational Risk Evaluation,30,true
Compliance and Regulatory,20,true
Strategic Risk Analysis,15,true
Market Risk Assessment,10,true
```

**Template Fields**:
- **Section Name**: Display name for the section
- **Weightage**: Default weight percentage (0-100)
- **Active**: Whether section is active by default (true/false)

#### Field Import Template Structure
```csv
Field Name,Field Type,Required,Options
Annual Revenue,select,true,"<$1M,$1M-$10M,$10M-$100M,>$100M"
Employee Count,number,true,
Industry Type,select,true,"Technology,Healthcare,Finance,Manufacturing,Other"
Years in Business,number,false,
Compliance Certification,checkbox,false,
Last Audit Date,date,true,
```

**Template Fields**:
- **Field Name**: Display label for the field
- **Field Type**: text, number, select, date, checkbox
- **Required**: true/false for validation
- **Options**: Comma-separated values for select fields (quoted)

### Excel Import Modal Component

#### Modal Interface
```typescript
interface ExcelImportModalProps {
  title: string;                    // Modal title
  description: string;              // Modal description
  onImport: (file: File, additionalData?: any) => Promise<void>;
  acceptedFileTypes?: string;       // ".xlsx,.xls,.csv"
  showSectionSelector?: boolean;    // For field imports
  sections?: Array<{ id: number; name: string }>;
  children: React.ReactNode;        // Trigger button
}
```

#### Modal Features
1. **Template Download**: Generates appropriate CSV template
2. **File Validation**: Checks file type and size
3. **Section Selection**: For field imports, shows section dropdown
4. **Progress Feedback**: Loading states and success/error messages
5. **Error Handling**: Detailed error messages for failed imports

## Field Types and Behaviors

### Text Fields
```typescript
interface TextFieldConfig {
  type: 'text';
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
}
```

### Number Fields
```typescript
interface NumberFieldConfig {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}
```

### Select Fields
```typescript
interface SelectFieldConfig {
  type: 'select';
  options: Array<{
    id: number;
    label: string;
    value: any;
  }>;
  placeholder?: string;
  multiple?: boolean;
}
```

### Date Fields
```typescript
interface DateFieldConfig {
  type: 'date';
  minDate?: string;
  maxDate?: string;
  format?: string;
}
```

### Checkbox Fields
```typescript
interface CheckboxFieldConfig {
  type: 'checkbox';
  label: string;
  defaultChecked?: boolean;
}
```

## Scoring Configuration

### Risk Score Calculation
Each field condition contributes to the overall risk score:

```
Section Score = Σ(Field Condition Scores)
Weighted Section Score = (Section Score / 100) × Section Weight
Total Risk Score = Σ(Weighted Section Scores)
Normalized Score = (Total Risk Score / 100) × 100
```

### Condition Scoring Examples

#### Numeric Range Scoring
```typescript
// Annual Revenue field
conditions: [
  { value: "< 1000000", operator: "<", riskScore: 80 },      // High risk
  { value: "1000000", valueTo: "10000000", operator: "between", riskScore: 50 }, // Medium risk
  { value: "10000000", operator: ">", riskScore: 20 }        // Low risk
]
```

#### Categorical Scoring
```typescript
// Industry Type field
conditions: [
  { fieldValueMapping: { text: "Cryptocurrency", value: 1 }, riskScore: 90 },
  { fieldValueMapping: { text: "Gaming", value: 2 }, riskScore: 70 },
  { fieldValueMapping: { text: "Healthcare", value: 3 }, riskScore: 30 },
  { fieldValueMapping: { text: "Education", value: 4 }, riskScore: 10 }
]
```

## Advanced Configuration Features

### Dynamic Field Options
Fields can load options from external APIs:

```typescript
interface RiskField {
  endpointURL?: string; // API endpoint for dynamic options
  valueMappings?: RiskFieldValueMapping[]; // Static options
}

// Runtime option loading
const fetchFieldOptions = async (apiEndpoint: string) => {
  const response = await getFieldOptions(apiEndpoint);
  setFieldOptionsMap(prev => ({ ...prev, [apiEndpoint]: response.value }));
};
```

### Conditional Field Display
Fields can be shown/hidden based on other field values:

```typescript
interface FieldCondition {
  dependsOn: number;     // Field ID this depends on
  showWhen: any;         // Value that triggers display
  hideWhen?: any;        // Value that hides field
}
```

### Version Management
Configurations support versioning for audit trails:

```typescript
interface RiskConfiguration {
  version: string;       // Semantic versioning (e.g., "2.1.0")
  createdAt: string;     // Creation timestamp
  updatedAt: string;     // Last modification
  createdBy: number;     // User ID who created
  modifiedBy: number;    // User ID who last modified
}
```

## Best Practices

### Configuration Design
1. **Start Simple**: Begin with basic sections and fields
2. **Iterate**: Add complexity gradually based on user feedback
3. **Test Thoroughly**: Validate all condition combinations
4. **Document Changes**: Maintain clear version notes

### Weight Distribution
1. **Balance**: Distribute weights logically across sections
2. **Validate**: Always ensure total equals 100%
3. **Review**: Regularly review weight effectiveness
4. **Adjust**: Modify based on risk assessment results

### Field Design
1. **Clear Labels**: Use descriptive, unambiguous field names
2. **Logical Grouping**: Group related fields in sections
3. **Appropriate Types**: Choose correct field types for data
4. **Validation**: Implement proper field validation

### Import Strategy
1. **Template First**: Always download and review templates
2. **Test Small**: Start with small batches for testing
3. **Backup**: Maintain backups before bulk imports
4. **Validate**: Review imported data before finalizing

## Troubleshooting

### Common Issues

#### Weight Validation Errors
```
Error: Total section weightage exceeds 100%
Solution: Adjust section weights to total exactly 100%
```

#### Import Failures
```
Error: Failed to import sections
Common Causes:
- Incorrect file format
- Missing required columns
- Invalid data types
- Duplicate names
```

#### Field Configuration Issues
```
Error: Field conditions not saving
Common Causes:
- Missing required fields
- Invalid condition operators
- Circular dependencies
- Database connection issues
```

### Debug Tools
1. **Browser Console**: Check for JavaScript errors
2. **Network Tab**: Monitor API request/responses
3. **React DevTools**: Inspect component state
4. **Query DevTools**: Monitor TanStack Query cache

## API Integration Details

### Configuration Endpoints
```typescript
// Fetch configuration
GET /api/risk-configuration/{companyId}
Response: ApiResponse<RiskConfiguration>

// Save configuration
POST /api/risk-configuration
Body: RiskConfiguration
Response: ApiResponse<RiskConfiguration>

// Import sections
POST /api/import/sections
Body: FormData (file)
Response: ApiResponse<RiskSection[]>

// Import fields
POST /api/import/fields
Body: FormData (file + sectionId)
Response: ApiResponse<RiskField[]>
```

### Error Handling
```typescript
interface ApiResponse<T> {
  isSuccess: boolean;
  errors: string[];
  validationErrors: Record<string, string[]>;
  successes: string[];
  value: T | null;
}
```

This comprehensive guide covers all aspects of the Risk Configuration system, providing detailed information for both administrators and developers working with the platform.

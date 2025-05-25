
# Risk Assessment Platform - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Core Features](#core-features)
5. [Risk Configuration System](#risk-configuration-system)
6. [User Management](#user-management)
7. [API Integration](#api-integration)
8. [Component Library](#component-library)
9. [Development Guide](#development-guide)
10. [Deployment](#deployment)

## Project Overview

The Risk Assessment Platform is a comprehensive web application designed for organizations to manage and evaluate risk assessments. The platform provides tools for configuring risk parameters, managing user submissions, and analyzing risk scores across different business entities.

### Key Capabilities
- **Multi-tenant Architecture**: Support for multiple companies with isolated configurations
- **Dynamic Risk Configuration**: Flexible field and section management
- **Excel/CSV Import**: Bulk import of sections and fields
- **Real-time Scoring**: Automated risk calculation based on configurable rules
- **User Management**: Role-based access control and user administration
- **Sanction List Management**: Compliance and regulatory list management

## Architecture

### Frontend Architecture
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/UI components
│   ├── ExcelImportModal.tsx
│   ├── SectionFieldsList.tsx
│   └── ...
├── pages/               # Route-based page components
│   ├── auth/           # Authentication pages
│   ├── company/        # Company-specific pages
│   ├── user/           # User-specific pages
│   └── ...
├── services/           # API integration layer
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
└── contexts/           # React context providers
```

### Data Flow
1. **Authentication**: User login/session management
2. **Company Selection**: Multi-tenant routing
3. **Configuration Management**: Dynamic form generation
4. **Risk Assessment**: User submission and scoring
5. **Results Analysis**: Dashboard and reporting

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Modern component library
- **React Router**: Client-side routing
- **TanStack Query**: Server state management
- **Axios**: HTTP client for API requests

### UI Components
- **Radix UI**: Headless UI primitives
- **Lucide React**: Icon library
- **React Hook Form**: Form state management
- **Recharts**: Data visualization

## Core Features

### 1. Authentication System
- User registration and login
- Role-based access control
- Session management
- Protected routes

### 2. Company Management
- Multi-tenant support
- Company-specific configurations
- User assignment to companies
- Company dashboard

### 3. Risk Assessment Workflow
- Dynamic form generation
- Section and field management
- Conditional logic
- Progress tracking
- Submission validation

### 4. Scoring Engine
- Configurable scoring rules
- Weighted calculations
- Real-time score updates
- Risk level classification

## Risk Configuration System

### Overview
The Risk Configuration system is the core of the platform, allowing administrators to create and manage dynamic risk assessment forms for their organizations.

### Two Configuration Interfaces

#### 1. Standard Risk Configuration (`CompanyConfiguration.tsx`)
**Location**: `/company/configuration`

**Features**:
- Company selection dropdown
- Section weightage management with sliders
- Field-level configuration
- Condition-based scoring rules
- Weight validation (must total 100%)
- Real-time preview

**Key Components**:
```typescript
// Section weightage configuration
const updateSectionWeightage = (sectionId: number, weightage: number) => {
  // Updates section weights with validation
};

// Field condition management
const renderFieldValue = (condition: RiskCompanyFieldCondition) => {
  // Renders individual field conditions with scoring
};

// Weight validation
const isValidWeightage = (): boolean => {
  return calculateTotalWeight() === 100;
};
```

**Workflow**:
1. Select company from dropdown
2. Configure section weights (must total 100%)
3. Set up field conditions and scoring
4. Save configuration

#### 2. Risk Configuration with Import (`CompanyConfigurationWithImport.tsx`)
**Location**: `/company/configuration-import`

**Enhanced Features**:
- All standard configuration features
- Excel/CSV import for sections
- Excel/CSV import for fields
- Bulk section creation
- Bulk field creation
- Template download

**Import Capabilities**:
```typescript
// Section import
const handleImportSections = async (file: File) => {
  const response = await importSectionsFromFile(file);
  // Processes Excel/CSV file to create sections
};

// Field import with section selection
const handleImportFields = async (file: File, additionalData: { sectionId: number }) => {
  const response = await importFieldsFromFile(file, additionalData.sectionId);
  // Processes Excel/CSV file to create fields for specific section
};
```

### Data Structure

#### Risk Configuration Schema
```typescript
interface RiskConfiguration {
  id: number;
  name: string;
  version: string;
  companyId: number;
  companySections?: RiskCompanySection[];
}

interface RiskCompanySection {
  id: number;
  companyId: number;
  sectionId: number;
  isActive: boolean;
  weightage: number; // Must total 100% across all active sections
  fields?: RiskCompanyField[];
  section?: RiskSection;
}

interface RiskCompanyField {
  id: number;
  companySectionId: number;
  fieldId: number;
  isActive: boolean;
  maxScore: number;
  conditions?: RiskCompanyFieldCondition[];
  field?: RiskField;
}
```

#### Field Types and Configurations
```typescript
type FieldType = 'text' | 'number' | 'select' | 'date' | 'checkbox';

interface RiskField {
  id: number;
  sectionId: number;
  label?: string;
  fieldType: FieldType;
  isRequired: boolean;
  placeholder?: string;
  endpointURL?: string; // For dynamic options
  orderIndex: number;
  valueMappings?: RiskFieldValueMapping[];
}
```

#### Scoring Conditions
```typescript
interface RiskCompanyFieldCondition {
  id: number;
  companyFieldId: number;
  fieldValueMappingId?: number;
  operator?: string; // '>', '<', '=', 'between', 'contains', etc.
  value?: string;
  valueTo?: string; // For range conditions
  riskScore: number; // 0-100
  fieldValueMapping?: RiskFieldValueMapping;
}
```

### Excel Import System

#### Import Modal Component
```typescript
interface ExcelImportModalProps {
  title: string;
  description: string;
  onImport: (file: File, additionalData?: any) => Promise<void>;
  acceptedFileTypes?: string;
  showSectionSelector?: boolean;
  sections?: Array<{ id: number; name: string }>;
  children: React.ReactNode;
}
```

#### Supported File Formats
- **.xlsx** - Excel 2007+
- **.xls** - Legacy Excel
- **.csv** - Comma-separated values

#### Template Formats

**Section Import Template**:
```csv
Section Name,Weightage,Active
Financial Risk,25,true
Operational Risk,30,true
Compliance Risk,45,true
```

**Field Import Template**:
```csv
Field Name,Field Type,Required,Options
Annual Revenue,select,true,"<1M,1M-10M,10M+"
Employee Count,number,true,
Compliance Status,checkbox,false,
```

### Risk Calculation Engine

#### Scoring Algorithm
```typescript
export function calculateRiskScore(
  configuration: RiskConfiguration,
  submission: UserSubmission
): RiskScore {
  // 1. Process only active sections
  const activeSections = configuration.companySections?.filter(section => section.isActive);
  
  // 2. Calculate section scores
  const sectionScores = activeSections.map(section => {
    let sectionScore = 0;
    const maxPossible = section.weightage;
    
    // Process active fields in section
    const activeFields = section.fields?.filter(field => field.isActive);
    
    for (const field of activeFields) {
      const fieldScore = calculateFieldScore(field, submittedValue);
      sectionScore += fieldScore;
    }
    
    // Scale score based on section weightage
    const scaledScore = (sectionScore / 100) * maxPossible;
    
    return {
      sectionId: section.id,
      sectionName: section.section.sectionName,
      score: Math.min(scaledScore, maxPossible),
      maxPossible
    };
  });
  
  // 3. Calculate total normalized score
  const totalScore = sectionScores.reduce((sum, section) => sum + section.score, 0);
  const maxPossibleTotal = sectionScores.reduce((sum, section) => sum + section.maxPossible, 0);
  const normalizedScore = Math.round((totalScore / maxPossibleTotal) * 100);
  
  return { userId, totalScore: normalizedScore, sectionScores, status: 'Pending' };
}
```

#### Condition Evaluation
```typescript
export function evaluateCondition(condition: RiskCompanyFieldCondition, value: any): boolean {
  switch (condition.operator) {
    case '>': return Number(value) > Number(condition.value);
    case '<': return Number(value) < Number(condition.value);
    case '=': return String(value) === String(condition.value);
    case 'between': 
      return Number(value) >= Number(condition.value) && 
             Number(value) <= Number(condition.valueTo);
    case 'contains': return String(value).includes(String(condition.value));
    case 'isEmpty': return value === undefined || value === null || value === '';
    case 'isNotEmpty': return value !== undefined && value !== null && value !== '';
    default: return false;
  }
}
```

### User Interface Components

#### Section Fields List Component
**Purpose**: Renders form fields dynamically based on configuration
**Location**: `src/components/SectionFieldsList.tsx`

**Key Features**:
- Dynamic field rendering based on type
- Accordion grouping for large field sets
- Loading states for async options
- Validation and error handling

```typescript
const renderField = (companyField: RiskCompanyField) => {
  const field = companyField.field;
  
  switch (field.fieldType) {
    case 'text': return <Input />;
    case 'number': return <Input type="number" />;
    case 'select': return <Select />;
    case 'checkbox': return <Checkbox />;
    case 'date': return <Input type="date" />;
  }
};
```

#### Progress Indicators
- **Section Weightage**: Visual sliders with percentage display
- **Completion Status**: Progress bars for form completion
- **Validation Alerts**: Real-time feedback on configuration issues

## User Management

### User Roles
- **Admin**: Full system access, configuration management
- **Company Admin**: Company-specific administration
- **User**: Risk assessment submission and viewing

### User Workflow
1. **Registration/Login**: Authentication through dedicated pages
2. **Dashboard Access**: Role-based dashboard routing
3. **Assessment Submission**: Dynamic form completion
4. **Results Viewing**: Score analysis and history

## API Integration

### Service Layer Architecture
```typescript
// Core API service
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'X-Tenant-ID': 'tenant1',
    'Content-Type': 'application/json'
  }
});

// Risk configuration services
export const getRiskConfiguration = (companyId: string): Promise<ApiResponse<RiskConfiguration>>;
export const saveRiskConfiguration = (config: RiskConfiguration): Promise<ApiResponse<RiskConfiguration>>;
export const importSectionsFromFile = (file: File): Promise<ApiResponse<RiskSection[]>>;
export const importFieldsFromFile = (file: File, sectionId: number): Promise<ApiResponse<RiskField[]>>;
```

### API Endpoints
- **GET** `/api/risk-configuration/{companyId}` - Fetch configuration
- **POST** `/api/risk-configuration` - Save configuration
- **POST** `/api/import/sections` - Import sections from file
- **POST** `/api/import/fields` - Import fields from file
- **GET** `/api/companies` - List companies
- **GET** `/api/users` - List users
- **POST** `/api/submissions` - Submit assessment

## Component Library

### UI Components (Shadcn/UI)
- **Forms**: Input, Select, Checkbox, Radio, Textarea
- **Layout**: Card, Tabs, Accordion, Dialog
- **Feedback**: Alert, Toast, Progress, Badge
- **Navigation**: Button, Breadcrumb, Pagination

### Custom Components
- **ExcelImportModal**: File upload with template download
- **SectionFieldsList**: Dynamic form field rendering
- **LoadingSpinner**: Consistent loading states
- **PageHeader**: Standardized page headers
- **RiskScoreBadge**: Risk level visualization

## Development Guide

### Setup Instructions
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check
```

### Code Organization
- **Components**: Reusable, focused components
- **Pages**: Route-based page components
- **Services**: API integration layer
- **Types**: Centralized type definitions
- **Utils**: Pure utility functions

### Best Practices
1. **Type Safety**: Use TypeScript strictly
2. **Component Design**: Keep components small and focused
3. **State Management**: Use React Query for server state
4. **Error Handling**: Implement proper error boundaries
5. **Performance**: Optimize with React.memo and useMemo

### Testing Strategy
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API integration testing
- **E2E Tests**: Complete user workflow testing

## Deployment

### Build Process
```bash
npm run build
```

### Environment Configuration
- **Development**: Local development with mock data
- **Staging**: Pre-production testing environment
- **Production**: Live application deployment

### Performance Optimization
- **Code Splitting**: Route-based lazy loading
- **Asset Optimization**: Image and bundle optimization
- **Caching**: Proper HTTP caching strategies

## Security Considerations

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control
- Protected route implementation

### Data Security
- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure API communication

## Monitoring & Analytics

### Error Tracking
- Runtime error monitoring
- Build-time error reporting
- Performance monitoring

### User Analytics
- User interaction tracking
- Feature usage analytics
- Performance metrics

## Future Enhancements

### Planned Features
- **Advanced Reporting**: Enhanced analytics and reporting
- **Workflow Management**: Approval workflows for assessments
- **Integration APIs**: Third-party system integration
- **Mobile Responsiveness**: Enhanced mobile experience
- **Real-time Collaboration**: Multi-user editing capabilities

### Technical Improvements
- **Performance Optimization**: Further bundle size reduction
- **Accessibility**: Enhanced WCAG compliance
- **Internationalization**: Multi-language support
- **Progressive Web App**: Offline capabilities

---

*This documentation is maintained as part of the development process and should be updated with any significant changes to the system architecture or functionality.*

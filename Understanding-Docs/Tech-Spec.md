# DevOn Interview Portal - Technical Code Specification

## Project Overview
A fullstack web application for candidate interview process management with video recording/upload capabilities, resume handling, and comprehensive form validation. Built with modern React ecosystem and PocketBase backend.

## Technology Stack

### Frontend Technologies
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: TailwindCSS 3.x
- **UI Components**: Shadcn UI + Radix UI primitives
- **Form Management**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast library)
- **Icons**: Lucide React
- **Video Processing**: MediaRecorder API + FFmpeg

### Backend Technologies
- **Database**: PocketBase (SQLite-based)
- **API Layer**: Next.js API Routes (App Router)
- **File Storage**: PocketBase built-in file management
- **Video Processing**: Server-side FFmpeg conversion
- **Authentication**: PocketBase admin SDK

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint (Next.js config)
- **Build Tool**: Next.js built-in Webpack
- **Development Server**: Next.js dev server
- **Containerization**: Docker (PocketBase)

## Project Structure

```
DevOn-Interview-Portal/
├── src/
│   ├── app/
│   │   ├── globals.css                    # Global TailwindCSS styles
│   │   ├── layout.tsx                     # Root layout with metadata
│   │   ├── page.tsx                       # Main page with InterviewPortal
│   │   └── api/                           # Next.js API routes
│   │       ├── convert-video/
│   │       │   └── route.ts              # WebM to MP4 conversion endpoint
│   │       ├── final-submit/
│   │       │   └── route.ts              # Final submission endpoint
│   │       ├── questions/
│   │       │   └── route.ts              # Questions fetching (legacy)
│   │       ├── submit-info/
│   │       │   └── route.ts              # Basic info submission
│   │       └── upload-video/
│   │           └── route.ts              # Video file upload endpoint
│   ├── components/
│   │   ├── interview/
│   │   │   ├── basic-info-step.tsx       # Step 1: Personal info & resume
│   │   │   ├── final-submission-step.tsx # Step 3: Review & submit
│   │   │   ├── header.tsx               # Application header
│   │   │   ├── interview-portal.tsx     # Main orchestrator component
│   │   │   └── video-questions-step.tsx # Step 2: Video upload/record
│   │   └── ui/                          # Shadcn UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── loading-spinner.tsx      # Custom spinner component
│   │       ├── progress.tsx
│   │       ├── sonner.tsx
│   │       ├── tabs.tsx
│   │       └── tooltip.tsx
│   ├── lib/
│   │   ├── pocketbase.ts               # PocketBase client configuration
│   │   ├── utils.ts                    # Utility functions
│   │   └── validations.ts              # Zod validation schemas
│   └── types/
│       └── index.ts                    # TypeScript type definitions
├── pb_data/                            # PocketBase data directory
├── public/                             # Static assets
├── Understanding-Docs/                 # Documentation
├── components.json                     # Shadcn UI configuration
├── docker-compose.yaml                # PocketBase Docker setup
├── eslint.config.mjs                  # ESLint configuration
├── next.config.ts                     # Next.js configuration
├── package.json                       # Dependencies and scripts
├── pb_schema.json                     # PocketBase schema export
├── postcss.config.mjs                 # PostCSS configuration
├── tailwind.config.ts                 # TailwindCSS configuration
└── tsconfig.json                      # TypeScript configuration
```

## Core Components Architecture

### 1. InterviewPortal (Main Orchestrator)
**File**: `src/components/interview/interview-portal.tsx`

**Responsibilities**:
- State management for entire interview flow
- Step navigation (1→2→3)
- Progress bar display
- Modal management (video instructions)
- Question loading and management

**Key State**:
```typescript
interface InterviewState {
  currentStep: number;
  candidate: Candidate | null;
  questions: Question[];
  completedQuestions: Set<string>;
}
```

**Key Features**:
- Progress bar with custom #327eb4 color
- Video instructions modal with blur backdrop
- Step transition management
- Responsive design with proper mobile spacing

### 2. BasicInfoStep (Step 1)
**File**: `src/components/interview/basic-info-step.tsx`

**Responsibilities**:
- Personal information collection (name, email, mobile)
- Resume file upload with validation
- Form validation using React Hook Form + Zod
- Email collision detection and override modal
- Field highlighting for missing required data

**Key Features**:
- Real-time form validation
- Drag & drop resume upload
- File type validation (PDF, DOCX, max 5MB)
- Email exists modal with blur backdrop
- Disabled button with field highlighting on click
- Resume preview with file size display

**Validation Schema**:
```typescript
candidateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  mobile: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number")
})
```

### 3. VideoQuestionsStep (Step 2)
**File**: `src/components/interview/video-questions-step.tsx`

**Responsibilities**:
- Single hardcoded question display
- Video upload via file picker or drag & drop
- Video recording using MediaRecorder API
- WebM to MP4 conversion via server API
- Video file validation and size checking
- PocketBase video upload integration

**Key Features**:
- Simplified single-question architecture
- Dual upload modes: upload file or record video
- Camera preview during recording
- Server-side video conversion (WebM→MP4)
- File size validation (max 30MB)
- Disabled submit button with upload area highlighting

**Hardcoded Question**:
```typescript
const hardcodedQuestion = {
  id: 'video-question',
  text: 'Please record or upload a video introducing yourself and explaining why you are interested in this position.',
  order: 1,
  created: new Date().toISOString(),
  updated: new Date().toISOString()
};
```

### 4. FinalSubmissionStep (Step 3)
**File**: `src/components/interview/final-submission-step.tsx`

**Responsibilities**:
- Application review and summary
- Video status verification
- Authorization checkbox
- Final submission to PocketBase
- Cancel & restart functionality

**Key Features**:
- Complete application summary display
- Video upload status indicator
- Required authorization checkbox
- Cancel & Start Again modal with confirmation
- Submit button disabled until all requirements met

## API Routes Architecture

### 1. Submit Info Endpoint
**File**: `src/app/api/submit-info/route.ts`

**Purpose**: Handle basic information and resume submission
**Method**: POST
**Functionality**:
- Email collision detection
- Resume file upload to PocketBase
- Candidate record creation/update
- File validation and size checking

### 2. Upload Video Endpoint
**File**: `src/app/api/upload-video/route.ts`

**Purpose**: Handle video file uploads
**Method**: POST
**Functionality**:
- Video file upload to PocketBase
- Candidate record update with video field
- File validation (MP4, MOV, WebM)
- Size limit enforcement (30MB)

### 3. Convert Video Endpoint
**File**: `src/app/api/convert-video/route.ts`

**Purpose**: Server-side video format conversion
**Method**: POST
**Functionality**:
- WebM to MP4 conversion using system FFmpeg
- Temporary file management
- Optimized conversion parameters
- Error handling and cleanup

### 4. Final Submit Endpoint
**File**: `src/app/api/final-submit/route.ts`

**Purpose**: Finalize application submission
**Method**: POST
**Functionality**:
- Set submittedAt timestamp
- Final validation checks
- Application completion confirmation

## Database Schema (PocketBase)

### Collections

#### candidates
```javascript
{
  "id": "text (auto-generated)",
  "name": "text (required)",
  "email": "email (required, unique)",
  "mobile": "text (required)",
  "resume": "file (PDF/DOCX, max 5MB)",
  "video": "file (MP4/MOV/WebM, max 30MB)",
  "submittedAt": "datetime (nullable)",
  "created": "datetime (auto)",
  "updated": "datetime (auto)"
}
```

#### questions (Legacy - Not Used)
```javascript
{
  "id": "text (auto-generated)",
  "text": "text (required)",
  "order": "number (required)",
  "created": "datetime (auto)",
  "updated": "datetime (auto)"
}
```

## State Management Architecture

### Global State (InterviewPortal)
- Uses React useState for step management
- Maintains candidate data across steps
- Manages question completion tracking
- Controls modal visibility states

### Local Component State
- Form state managed by React Hook Form
- File upload state in individual components
- UI state (loading, processing, errors) locally managed
- Modal state managed per component

### Data Flow
```
User Input → Component State → API Call → PocketBase → Response → UI Update
```

## File Upload Architecture

### Frontend Processing
1. File selection/drop handling
2. Client-side validation (type, size)
3. Preview generation for resumes
4. FormData preparation for API calls

### Backend Processing
1. Multipart form data parsing
2. File validation and security checks
3. PocketBase file upload API integration
4. Error handling and response formatting

### Video Processing Pipeline
1. **Recording**: MediaRecorder API → WebM blob
2. **Conversion**: WebM → Server API → FFmpeg → MP4
3. **Upload**: MP4 file → PocketBase storage
4. **Cleanup**: Temporary file removal

## Security Considerations

### Input Validation
- Zod schemas for all form inputs
- File type validation using MIME types
- File size limits enforced client and server-side
- Email format validation

### File Security
- Restricted file types (PDF, DOCX for resumes; MP4, MOV, WebM for videos)
- File size limits (5MB resumes, 30MB videos)
- Server-side file validation
- Temporary file cleanup after processing

### API Security
- PocketBase admin SDK for secure database operations
- Environment variable configuration for sensitive data
- Error message sanitization
- Request validation on all endpoints

## Performance Optimizations

### Frontend
- Component lazy loading where applicable
- Image and video optimization
- Efficient re-renders using React best practices
- Minimal bundle size with tree shaking

### Backend
- Optimized FFmpeg conversion parameters
- Temporary file cleanup to prevent storage bloat
- Efficient PocketBase queries
- File upload streaming for large files

## Error Handling Strategy

### User Experience
- Toast notifications for all user actions
- Field-level validation feedback
- Graceful degradation for failed operations
- Clear error messages with actionable guidance

### Technical Implementation
- Try-catch blocks for all async operations
- Proper HTTP status codes in API responses
- Logging for debugging and monitoring
- Fallback UI states for error conditions

## Build and Deployment Configuration

### Next.js Configuration
- App Router architecture
- TypeScript strict mode
- ESLint integration
- Optimized production builds

### Environment Variables
```
NEXT_PUBLIC_PB_URL=http://127.0.0.1:8090  # PocketBase URL
```

### Docker Configuration
- PocketBase containerization
- Volume mounting for persistent data
- Network configuration for development

This technical specification provides a comprehensive overview of the codebase architecture, enabling engineers to understand, maintain, and extend the DevOn Interview Portal system.
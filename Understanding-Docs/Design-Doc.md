# DevOn Interview Portal - Design Language Documentation

## Design Philosophy

### Core Principles
- **Clean & Tactile**: Minimal, modern interface with purposeful spacing
- **Professional**: Corporate-ready design suitable for recruitment processes
- **Accessible**: Clear typography, proper contrast, keyboard navigation
- **Responsive**: Mobile-first approach with consistent experience across devices
- **Branded**: DevOn identity integration throughout the interface

### Design Goals
- **Reduce Cognitive Load**: Simple, step-by-step progression
- **Build Trust**: Professional appearance to encourage candidate participation
- **Ensure Clarity**: Clear visual hierarchy and obvious next actions
- **Provide Feedback**: Immediate response to user interactions

## Brand Identity & Color System

### Primary Brand Colors
```css
/* DevOn Orange - Primary Brand Color */
--devon-orange: #ee3923
/* Usage: Primary CTAs, DevOn logo text, active states */

/* DevOn Blue - Secondary Brand Color */  
--devon-blue: #327eb4
/* Usage: Progress indicators, secondary buttons, accents */
```

### Extended Color Palette
```css
/* Semantic Colors */
--success-green: #16a34a      /* Success states, completed items */
--warning-orange: #ea580c     /* Warning messages, attention items */
--error-red: #dc2626          /* Errors, destructive actions */
--info-blue: #2563eb          /* Information, neutral messages */

/* Neutral Colors */
--text-primary: #111827       /* Primary text, headers */
--text-secondary: #6b7280     /* Secondary text, descriptions */
--text-muted: #9ca3af         /* Muted text, placeholders */

/* Background Colors */
--bg-primary: #ffffff         /* Main backgrounds */
--bg-secondary: #f9fafb       /* Secondary backgrounds */
--bg-muted: #f3f4f6          /* Muted backgrounds, disabled states */

/* Border Colors */
--border-primary: #d1d5db     /* Default borders */
--border-muted: #e5e7eb       /* Subtle borders */
--border-focus: #327eb4       /* Focus states */
```

## Typography System

### Font Family
```css
/* Primary Font */
font-family: "Aptos", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Typography Scale
```css
/* Headers */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }      /* 24px */
.text-xl  { font-size: 1.25rem; line-height: 1.75rem; }  /* 20px */
.text-lg  { font-size: 1.125rem; line-height: 1.75rem; } /* 18px */

/* Body Text */
.text-base { font-size: 1rem; line-height: 1.5rem; }     /* 16px */
.text-sm   { font-size: 0.875rem; line-height: 1.25rem; } /* 14px */
.text-xs   { font-size: 0.75rem; line-height: 1rem; }    /* 12px */

/* Font Weights */
.font-bold   { font-weight: 700; } /* Headers, emphasis */
.font-semibold { font-weight: 600; } /* Sub-headers */
.font-medium { font-weight: 500; } /* Labels, important text */
.font-normal { font-weight: 400; } /* Body text */
```

### Typography Usage Guidelines
- **Headers (H1-H3)**: Use `font-bold` with appropriate text size
- **Labels**: Use `font-medium` for form labels and important text
- **Body Text**: Use `font-normal` for paragraphs and descriptions
- **Captions**: Use `text-sm` with `text-gray-600` for secondary information

## Component Design System

### 1. Cards & Containers

#### Primary Card
```css
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem; /* 8px */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem; /* 24px */
}
```

#### Card Header
```css
.card-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.card-description {
  font-size: 0.875rem;
  color: #6b7280;
}
```

### 2. Buttons & Interactive Elements

#### Primary Button (DevOn Orange)
```css
.btn-primary {
  background-color: var(--devon-orange);
  border: 1px solid var(--devon-orange);
  color: white;
  font-weight: 500;
  border-radius: 0.375rem; /* 6px */
  padding: 0.625rem 1.25rem; /* 10px 20px */
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #d73527;
  border-color: #d73527;
  box-shadow: 0 2px 4px rgba(238, 57, 35, 0.2);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### Secondary Button (DevOn Blue)
```css
.btn-secondary {
  background-color: var(--devon-blue);
  border: 1px solid var(--devon-blue);
  color: white;
  font-weight: 500;
  border-radius: 0.375rem;
  padding: 0.625rem 1.25rem;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}
```

#### Outline Button
```css
.btn-outline {
  background-color: white;
  border: 1px solid #d1d5db;
  color: #374151;
  font-weight: 500;
  border-radius: 0.375rem;
  padding: 0.625rem 1.25rem;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}
```

#### Destructive Button (Red)
```css
.btn-destructive {
  background-color: #dc2626;
  border: 1px solid #dc2626;
  color: white;
  font-weight: 500;
  border-radius: 0.375rem;
  padding: 0.625rem 1.25rem;
}

.btn-destructive:hover {
  background-color: #b91c1c;
  border-color: #b91c1c;
}
```

### 3. Form Elements

#### Input Fields
```css
.input {
  width: 100%;
  padding: 0.625rem 0.75rem; /* 10px 12px */
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--devon-blue);
  box-shadow: 0 0 0 3px rgba(50, 126, 180, 0.1);
}

.input.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}
```

#### Labels
```css
.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}

.label.required::after {
  content: " *";
  color: #dc2626;
}
```

#### Error Messages
```css
.error-message {
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
```

### 4. Progress & Status Indicators

#### Progress Bar
```css
.progress-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.progress-circle {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.progress-circle.active {
  background-color: var(--devon-blue);
  color: white;
}

.progress-circle.inactive {
  background-color: #e5e7eb;
  color: #6b7280;
}

.progress-line {
  flex: 1;
  height: 2px;
  transition: all 0.3s ease;
}

.progress-line.active {
  background-color: var(--devon-blue);
}

.progress-line.inactive {
  background-color: #e5e7eb;
}
```

#### Status Indicators
```css
.status-success {
  color: #16a34a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.status-warning {
  color: #ea580c;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.status-error {
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}
```

### 5. File Upload Areas

#### Upload Zone
```css
.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.upload-zone:hover {
  border-color: #9ca3af;
  background-color: #f3f4f6;
}

.upload-zone.dragover {
  border-color: var(--devon-blue);
  background-color: #eff6ff;
}

.upload-zone.error {
  border-color: #dc2626;
  background-color: #fef2f2;
}

.upload-zone.highlight {
  border-color: #dc2626;
  background-color: #fef2f2;
  animation: pulse 1s infinite;
}
```

### 6. Modal & Overlay Design

#### Modal Backdrop
```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}
```

#### Modal Container
```css
.modal-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  border: 2px solid #e5e7eb;
  max-width: 28rem;
  width: 100%;
}

.modal-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-content {
  padding: 1.5rem;
}
```

## Layout & Spacing System

### Spacing Scale (TailwindCSS)
```css
/* Base spacing unit: 0.25rem (4px) */
.space-1  { margin/padding: 0.25rem; }  /* 4px */
.space-2  { margin/padding: 0.5rem; }   /* 8px */
.space-3  { margin/padding: 0.75rem; }  /* 12px */
.space-4  { margin/padding: 1rem; }     /* 16px */
.space-6  { margin/padding: 1.5rem; }   /* 24px */
.space-8  { margin/padding: 2rem; }     /* 32px */
.space-12 { margin/padding: 3rem; }     /* 48px */
.space-16 { margin/padding: 4rem; }     /* 64px */
.space-20 { margin/padding: 5rem; }     /* 80px */
```

### Common Spacing Patterns
- **Card Padding**: `1.5rem` (24px)
- **Section Spacing**: `space-y-6` (24px vertical)
- **Form Field Spacing**: `space-y-2` (8px vertical)
- **Button Padding**: `0.625rem 1.25rem` (10px 20px)
- **Modal Padding**: `1.5rem` (24px)
- **Page Bottom Padding**: `pb-32` (128px) for mobile scroll clearance

## Responsive Design Patterns

### Breakpoint System
```css
/* Mobile First Approach */
/* Default: Mobile (< 640px) */

@media (min-width: 640px) {
  /* sm: Small tablets */
}

@media (min-width: 768px) {
  /* md: Large tablets */
}

@media (min-width: 1024px) {
  /* lg: Desktop */
}

@media (min-width: 1280px) {
  /* xl: Large desktop */
}
```

### Mobile Optimization
- **Touch Targets**: Minimum 44px for buttons and interactive elements
- **Bottom Padding**: Increased padding (`pb-32` to `pb-40`) to clear mobile UI
- **Font Scaling**: Larger base font sizes on mobile for readability
- **Spacing**: More generous spacing on mobile for finger navigation

## Animation & Interaction Design

### Transition Standards
```css
/* Standard transition for interactive elements */
transition: all 0.2s ease;

/* Longer transitions for layout changes */
transition: all 0.3s ease;

/* Color-only transitions for hover states */
transition: background-color 0.2s ease, border-color 0.2s ease;
```

### Animation Effects
```css
/* Pulse animation for attention-getting */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Fade in animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Scale animation for modals */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

### Interactive States
- **Hover**: Subtle color darkening or lightening
- **Focus**: Blue outline with matching color theme
- **Active**: Slightly pressed appearance with shadow
- **Disabled**: 50% opacity with no-pointer cursor
- **Loading**: Spinner with appropriate sizing and colors

## Accessibility Design Guidelines

### Color Accessibility
- **Contrast Ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Color Independence**: Never rely solely on color to convey information
- **Focus Indicators**: Clear, visible focus states for keyboard navigation

### Typography Accessibility
- **Font Size**: Minimum 14px for body text, 16px preferred
- **Line Height**: 1.5x font size for optimal readability
- **Font Weight**: Sufficient contrast between text weights

### Interactive Accessibility
- **Focus Management**: Logical tab order through forms
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and semantic HTML

## Component Library Integration

### Shadcn UI Base Components
The design system extends Shadcn UI components with DevOn branding:

```typescript
// Custom theme configuration
const theme = {
  colors: {
    primary: "#327eb4",     // DevOn Blue
    secondary: "#ee3923",   // DevOn Orange
    destructive: "#dc2626", // Error Red
    muted: "#f3f4f6",      // Muted Gray
  },
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
  }
}
```

### Custom Component Extensions
- **LoadingSpinner**: Custom dual-color spinner with DevOn branding
- **Header**: Branded header with DevOn logo styling
- **ProgressBar**: Custom progress implementation with brand colors

## Design Token System

### CSS Custom Properties
```css
:root {
  /* Brand Colors */
  --devon-orange: #ee3923;
  --devon-blue: #327eb4;
  
  /* Semantic Colors */
  --success: #16a34a;
  --warning: #ea580c;
  --error: #dc2626;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

## Implementation Guidelines

### Component Development
1. **Start with Shadcn base components**
2. **Apply DevOn color scheme via CSS custom properties**
3. **Maintain consistent spacing using TailwindCSS classes**
4. **Follow accessibility guidelines for all interactions**
5. **Test on mobile devices for responsive behavior**

### Design Consistency Checklist
- [ ] Uses DevOn brand colors (#ee3923, #327eb4)
- [ ] Follows spacing system (multiples of 4px)
- [ ] Includes proper hover and focus states
- [ ] Maintains 4.5:1 color contrast ratios
- [ ] Works on mobile devices (touch-friendly)
- [ ] Includes loading and error states
- [ ] Uses Aptos font family
- [ ] Follows component naming conventions

This design language document serves as the single source of truth for maintaining visual consistency across the DevOn Interview Portal and any future extensions or related applications.
# PCI Engine - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Application Structure](#application-structure)
4. [Data Models](#data-models)
5. [Core Formulas & Calculations](#core-formulas--calculations)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [AI Integration](#ai-integration)
9. [Styling System](#styling-system)
10. [Performance Considerations](#performance-considerations)

---

## Architecture Overview

### Application Type
**Single-Page Application (SPA)** built with React and TypeScript, designed for enterprise-grade project cost modeling and audit intelligence.

### Architecture Pattern
- **Component-Based Architecture**: Modular, reusable components
- **Unidirectional Data Flow**: Props down, callbacks up
- **Collocated State**: State managed close to where it's used
- **Mock AI Services**: Frontend simulation of AI capabilities (ready for backend integration)

### High-Level Flow
```
User Input → State Update → Formula Calculation → UI Re-render → AI Analysis
```

---

## Technology Stack

### Core Technologies
- **React 18+**: UI framework with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS v4.0**: Utility-first styling
- **Vite**: Build tool and dev server

### Key Libraries
```json
{
  "lucide-react": "Icon library",
  "recharts": "Chart rendering for reports",
  "react": "UI framework",
  "react-dom": "DOM rendering"
}
```

### UI Components
- Custom component library in `/components/ui/`
- Shadcn-inspired patterns
- Accessible, responsive design

---

## Application Structure

### Directory Layout
```
/
├── App.tsx                          # Root application component
├── components/
│   ├── AIAssistant.tsx             # Floating AI chat interface
│   ├── AITaskCreator.tsx           # Natural language task creator
│   ├── AIInsightsCard.tsx          # Real-time AI insights dashboard
│   ├── AuditLayerScreen.tsx        # Audit history and tracking
│   ├── DashboardScreen.tsx         # Main dashboard with KPIs and tasks
│   ├── FormulaPanel.tsx            # Collapsible formula inspector
│   ├── KPICard.tsx                 # KPI metric display component
│   ├── Navigation.tsx              # Top navigation bar
│   ├── ReportsScreen.tsx           # Reporting and analytics
│   ├── SettingsModal.tsx           # Application settings
│   ├── SummarySection.tsx          # Project summary calculations
│   ├── TaskTable.tsx               # Interactive task modeling table
│   └── ui/                         # Reusable UI primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── table.tsx
│       └── ... (30+ components)
├── styles/
│   └── globals.css                 # Global styles and Tailwind config
└── AI_FEATURES.md                  # AI features documentation
```

### Screen Navigation Flow
```
Navigation Component
    ├── Dashboard (default)
    ├── Audit Layer
    ├── Reporting
    └── Settings (modal)
```

---

## Data Models

### Task Interface
```typescript
interface Task {
  id: string;                    // Unique identifier
  taskName: string;              // Task description
  
  // PCI Formula Factors
  ISR: number;                   // Initial Scope Rating (baseline)
  CF: number;                    // Complexity Factor
  UXI: number;                   // User Experience Impact
  RCF: number;                   // Risk Complexity Factor
  AEP: number;                   // Architecture & Engineering Points
  L: number;                     // Learning Curve (subtracted)
  MLW: number;                   // Multi-Layer Work
  CGW: number;                   // Cross-Group Work
  RF: number;                    // Rework Factor
  S: number;                     // Specialty Factor
  GLRI: number;                  // Governance & Legal Risk Index
  
  // AI & Calculated Fields
  aiVerifiedUnits: number;       // AI-verified estimate
  hasAnomaly?: boolean;          // Anomaly detection flag (optional)
}
```

### Settings Interface
```typescript
interface Settings {
  hourlyRate: number;            // Cost per hour (default: 66)
  unitToHourRatio: number;       // PCI units to hours (default: 1.5)
  currency: string;              // Currency code (default: 'USD')
  industryPreset: string;        // Industry type (default: 'general')
}
```

### Screen Type
```typescript
type Screen = 'dashboard' | 'audit' | 'reporting' | 'settings';
```

---

## Core Formulas & Calculations

### 1. PCI (Project Complexity Index) Formula
```typescript
PCI = (ISR × CF × UXI) + (RCF × AEP - L) + (MLW × CGW × RF) + (S × GLRI)

// Always non-negative
PCI = Math.max(0, PCI)
```

**Components Breakdown:**
- **Scope Complexity**: `ISR × CF × UXI`
  - Initial scope × technical complexity × UX impact
- **Risk & Architecture**: `RCF × AEP - L`
  - Risk × engineering complexity - learning curve
- **Coordination**: `MLW × CGW × RF`
  - Multi-layer work × cross-team collaboration × rework likelihood
- **Specialization & Governance**: `S × GLRI`
  - Specialty needs × compliance requirements

### 2. AAS (Accuracy Audit Score) Formula
```typescript
AAS = (aiVerifiedUnits / PCI) × 100

// Returns percentage (0-100+)
// Returns 0 if PCI is 0 to avoid division by zero
```

**Interpretation:**
- `AAS ≥ 95%`: Excellent accuracy
- `85% ≤ AAS < 95%`: Good accuracy
- `AAS < 85%`: ⚠️ Review needed (triggers warning)
- `AAS > 100%`: Over-estimation

### 3. Verified Units Calculation
```typescript
verifiedUnits = (AAS / 100) × PCI
```

This represents the "true" estimated units after AI verification adjustment.

### 4. Verified Cost Calculation
```typescript
verifiedCost = verifiedUnits × settings.hourlyRate
```

### 5. Total Project Metrics
```typescript
// Total PCI Units
totalPCIUnits = Σ(PCI for each task)

// Total AI Verified Units  
totalAIVerifiedUnits = Σ(aiVerifiedUnits for each task)

// Total Verified Units
totalVerifiedUnits = Σ(verifiedUnits for each task)

// Overall AAS
overallAAS = (totalAIVerifiedUnits / totalPCIUnits) × 100

// Total Verified Cost
totalVerifiedCost = totalVerifiedUnits × hourlyRate
```

---

## Component Architecture

### App.tsx (Root Component)
**Responsibilities:**
- Application state management
- Screen navigation
- Settings management
- Layout structure

**State:**
```typescript
const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
const [showSettings, setShowSettings] = useState(false);
const [settings, setSettings] = useState<Settings>({...});
```

**Props Flow:**
```
App
├── Navigation (currentScreen, onNavigate, onSettingsClick)
├── DashboardScreen (settings) [conditional]
├── AuditLayerScreen [conditional]
├── ReportsScreen [conditional]
└── SettingsModal (settings, onSave, onClose) [conditional]
```

---

### DashboardScreen.tsx
**Responsibilities:**
- Task management (CRUD operations)
- Real-time metric calculations
- AI component orchestration
- Formula panel toggle

**State:**
```typescript
const [formulaPanelOpen, setFormulaPanelOpen] = useState(true);
const [showAITaskCreator, setShowAITaskCreator] = useState(false);
const [tasks, setTasks] = useState<Task[]>([...]);
```

**Key Functions:**
```typescript
// Add new blank task
addTask(): void

// Create task from AI analysis
handleAICreateTask(taskData: Omit<Task, 'id'>): void

// Calculate PCI for a task
calculatePCI(task: Task): number

// Calculate AAS for a task
calculateAAS(task: Task): number

// Calculate verified units
calculateVerifiedUnits(task: Task): number
```

**Child Components:**
- `KPICard` (4 instances for metrics)
- `TaskTable` (interactive data grid)
- `AIInsightsCard` (real-time intelligence)
- `SummarySection` (project totals)
- `FormulaPanel` (formula reference)
- `AIAssistant` (floating chat)
- `AITaskCreator` (modal)

---

### TaskTable.tsx
**Responsibilities:**
- Editable task data grid
- Real-time PCI/AAS calculations per row
- AI auto-fill functionality
- Tooltip explanations for factors
- Visual indicators (locked fields, low AAS warnings)

**Props:**
```typescript
interface TaskTableProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  settings: Settings;
  onAIAutoFill?: (taskId: string) => void;
}
```

**State:**
```typescript
const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
const [aiGeneratingFor, setAiGeneratingFor] = useState<string | null>(null);
```

**Key Features:**
- **Editable Inputs**: All PCI factors are editable number inputs
- **Locked Outputs**: PCI Units, AAS %, Verified Units, Verified Cost (calculated, read-only)
- **AI Auto-Fill**: Sparkles button per row for instant factor estimation
- **Tooltips**: Hover over column headers for factor explanations
- **Visual Warnings**: Red background for AAS < 85%

**Table Structure:**
```
| Task Name | ✨ | ISR | CF | UXI | RCF | AEP | L | MLW | CGW | RF | S | GLRI | 🔒 PCI | AI Units | 🔒 AAS % | 🔒 Verified Units | 🔒 Cost |
```

---

### AIAssistant.tsx (Floating Chat)
**Responsibilities:**
- Conversational AI interface
- Task portfolio analysis
- Anomaly detection
- Cost optimization recommendations
- Industry benchmarking

**State:**
```typescript
const [isOpen, setIsOpen] = useState(false);
const [messages, setMessages] = useState<Message[]>([...]);
const [input, setInput] = useState('');
const [isTyping, setIsTyping] = useState(false);
```

**Message Interface:**
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

**AI Response Logic:**
- Keyword matching on user queries
- Pattern: `lowerMessage.includes('keyword')` → specific response
- Supports: analyze, cost, anomaly, optimize, suggest, benchmark queries
- Mock delays (1-2 seconds) simulate real AI processing

**Quick Actions:**
1. Analyze Tasks
2. Find Anomalies
3. Optimize Costs

---

### AITaskCreator.tsx (Modal)
**Responsibilities:**
- Natural language task input
- Keyword-based PCI factor estimation
- AI-verified units calculation
- Example prompts

**Props:**
```typescript
interface AITaskCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Omit<Task, 'id'>) => void;
}
```

**AI Analysis Function:**
```typescript
analyzeTaskDescription(desc: string): Omit<Task, 'id'>
```

**Keyword Patterns:**
| Keywords | Adjustments |
|----------|-------------|
| complex, advanced, sophisticated | ISR +2, CF +0.3, AEP +3 |
| integration, api, third-party | RCF +0.3, AEP +2, RF +0.2, CGW +0.3 |
| payment, checkout, transaction | RCF +0.5, S +0.5, GLRI +0.8, AEP +3 |
| security, authentication, auth | RCF +0.4, S +0.4, GLRI +0.6, AEP +2 |
| ui, interface, dashboard, screen | UXI +0.4, ISR +1 |
| responsive, mobile | UXI +0.3, CF +0.2 |
| analytics, reporting, data, chart | AEP +2, CF +0.2, MLW +0.2 |
| real-time, realtime, live, websocket | AEP +3, CF +0.4, S +0.3, RCF +0.3 |
| database, migration, schema | AEP +2, RCF +0.2, CGW +0.2 |
| test, testing | L +0.5, RF -0.1 |
| team, collaboration, cross-functional | CGW +0.4, MLW +0.3 |
| compliance, gdpr, hipaa, legal | GLRI +0.9, RCF +0.3, S +0.2 |
| ai, machine learning, ml | S +0.7, CF +0.5, AEP +4, RCF +0.4 |

**Example Prompts:**
1. "Build a user authentication system with OAuth integration"
2. "Create a responsive dashboard with real-time analytics charts"
3. "Implement payment processing with Stripe integration"
4. "Develop a GDPR-compliant data export feature"
5. "Build an AI-powered chatbot with natural language processing"

---

### AIInsightsCard.tsx
**Responsibilities:**
- Real-time project health monitoring
- Pattern detection across task portfolio
- Visual insights with color-coded alerts
- Success/Warning/Info categorization

**Insight Types:**

**Success (Green):**
- All tasks have AAS ≥ 85%
- Overall AAS ≥ 90%

**Warning (Orange):**
- Tasks with AAS < 85%
- High risk factors (RCF > 1.5 or GLRI > 1.7)

**Info (Blue):**
- High-cost tasks (PCI > 1.5× average)
- Multiple specialized tasks (S > 1.5)

**Analysis Logic:**
```typescript
// Low AAS detection
const lowAasTasks = tasks.filter(task => calculateAAS(task) < 85);

// High complexity detection  
const avgPCI = tasks.reduce((sum, task) => sum + calculatePCI(task), 0) / tasks.length;
const highCostTasks = tasks.filter(task => calculatePCI(task) > avgPCI * 1.5);

// Risk analysis
const highRiskTasks = tasks.filter(task => task.RCF > 1.5 || task.GLRI > 1.7);

// Specialization analysis
const specializedTasks = tasks.filter(task => task.S > 1.5);
```

---

### KPICard.tsx
**Props:**
```typescript
interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  accent: 'mint' | 'blue' | 'navy';
}
```

**Accent Colors:**
- `mint`: `#4AFFA8` (green/aqua)
- `blue`: `#2BBBEF` (cyan blue)
- `navy`: `#010029` (deep navy)

**Card Structure:**
```
┌─────────────────────┐
│ [Icon]   Title      │
│                     │
│   Large Value       │
└─────────────────────┘
```

---

### FormulaPanel.tsx (Collapsible Side Panel)
**Responsibilities:**
- PCI formula reference
- Factor definitions
- Calculation examples
- Best practices

**Props:**
```typescript
interface FormulaPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}
```

**Layout:**
- Fixed right side panel (384px width when open)
- Toggle button with chevron icon
- Accordion sections for each formula component
- Color-coded factor explanations

---

### Navigation.tsx
**Props:**
```typescript
interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onSettingsClick: () => void;
}
```

**Navigation Items:**
1. Dashboard (LayoutDashboard icon)
2. Audit Layer (Shield icon)
3. Reporting (BarChart3 icon)
4. Settings (Settings icon, triggers modal)

**Visual States:**
- Active: Gradient background `from-[#2BBBEF] to-[#4AFFA8]`
- Inactive: Transparent with hover effect

---

## State Management

### State Location Strategy

**Global State (App.tsx):**
- `currentScreen`: Navigation state
- `showSettings`: Settings modal visibility
- `settings`: Application-wide settings

**Screen-Level State (DashboardScreen.tsx):**
- `tasks`: Task array (main data)
- `formulaPanelOpen`: UI state
- `showAITaskCreator`: Modal visibility

**Component-Level State:**
- `AIAssistant`: messages, input, isTyping, isOpen
- `TaskTable`: hoveredColumn, tooltipPosition, aiGeneratingFor
- `AITaskCreator`: description, isGenerating

### State Update Patterns

**Immutable Updates:**
```typescript
// Adding a task
setTasks([...tasks, newTask]);

// Updating a task
const updatedTasks = tasks.map(task => 
  task.id === id ? { ...task, [field]: value } : task
);
setTasks(updatedTasks);

// Removing a task (if implemented)
setTasks(tasks.filter(task => task.id !== id));
```

**Callback Props Pattern:**
```typescript
// Parent defines handler
const handleTasksChange = (newTasks: Task[]) => setTasks(newTasks);

// Child receives and calls
<TaskTable tasks={tasks} onTasksChange={handleTasksChange} />

// Child uses
props.onTasksChange(updatedTasks);
```

---

## AI Integration

### Architecture Pattern: Mock AI with Real Structure

**Current Implementation:**
- Frontend-only mock AI for demonstration
- Structured to easily swap for real AI backend
- Realistic delays and confidence scoring

**AI Service Abstraction Points:**

```typescript
// 1. Task Factor Analysis
analyzeTaskDescription(description: string): Omit<Task, 'id'>

// 2. Conversational AI
generateAIResponse(userMessage: string): string

// 3. Auto-fill
handleAIAutoFill(taskId: string): void

// 4. Insights Generation
generateInsights(tasks: Task[]): Insight[]
```

### AI Processing Flow

```
User Input
    ↓
Keyword Extraction
    ↓
Pattern Matching
    ↓
Factor Calculation (Base + Adjustments)
    ↓
Confidence Scoring (90-100% of PCI)
    ↓
Return Structured Data
```

### Backend Integration Readiness

**To connect real AI (e.g., OpenAI, Claude):**

1. **Create API Service:**
```typescript
// /services/ai.ts
export async function analyzeTask(description: string): Promise<TaskFactors> {
  const response = await fetch('/api/ai/analyze-task', {
    method: 'POST',
    body: JSON.stringify({ description }),
  });
  return response.json();
}
```

2. **Replace Mock Logic:**
```typescript
// Before (mock)
const task = analyzeTaskDescription(description);

// After (real AI)
const task = await analyzeTask(description);
```

3. **Add Loading States:**
```typescript
const [isLoading, setIsLoading] = useState(false);
```

4. **Error Handling:**
```typescript
try {
  const task = await analyzeTask(description);
} catch (error) {
  // Handle error
}
```

### AI Confidence Scoring

**Current Formula:**
```typescript
const pci = calculatePCI(task);
const confidence = 0.9 + Math.random() * 0.1; // 90-100%
const aiVerifiedUnits = pci * confidence;
```

**Future with Real AI:**
- Model-based confidence from AI API
- Historical accuracy tracking
- Bayesian updating based on user corrections

---

## Styling System

### Tailwind CSS v4.0 Configuration

**Global Styles Location:** `/styles/globals.css`

**Brand Color System:**
```css
--color-navy: #010029;      /* Deep navy - primary brand */
--color-blue: #2BBBEF;      /* Cyan blue - accents */
--color-mint: #4AFFA8;      /* Mint/aqua - highlights */
```

**Typography:**
- **Font Family**: System fonts (Inter/SF Pro fallback)
- **Heading Styles**: Defined in globals.css for h1-h6
- **No Font Size Classes**: Typography controlled by CSS, not Tailwind classes
  - Exception: Use Tailwind only when explicitly needed

**Component Styling Patterns:**

**Gradient Backgrounds:**
```tsx
className="bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]"
```

**Card Styles:**
```tsx
className="rounded-xl bg-white shadow-sm border border-gray-200"
```

**Input Styles:**
```tsx
className="rounded border border-gray-200 px-2 py-1 focus:border-[#2BBBEF] focus:outline-none"
```

**Button Styles:**
```tsx
// Primary
className="rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-4 py-2 text-white hover:opacity-90"

// Secondary
className="rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50"
```

### Responsive Design

**Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Responsive Patterns Used:**
```tsx
// KPI Grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"

// Conditional margin for formula panel
className={`transition-all duration-300 ${formulaPanelOpen ? 'mr-96' : 'mr-0'}`}

// Mobile-friendly table
className="overflow-x-auto"
```

### Design System Principles

1. **Soft Rounded Corners**: `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px)
2. **Subtle Shadows**: `shadow-sm`, `shadow-lg`
3. **Clean White Canvas**: `bg-gray-50` for app background, `bg-white` for cards
4. **Enterprise Polish**: Consistent spacing, aligned elements, smooth transitions
5. **Linear/Notion Aesthetic**: Minimal, functional, modern

---

## Performance Considerations

### Calculation Optimization

**Issue:** PCI/AAS calculated multiple times per render

**Current Approach:**
- Calculate on-demand in components
- Calculations are simple (no heavy operations)

**Optimization Opportunity (if needed):**
```typescript
// Use useMemo for expensive calculations
const calculatedTasks = useMemo(() => 
  tasks.map(task => ({
    ...task,
    pci: calculatePCI(task),
    aas: calculateAAS(task),
    verifiedUnits: calculateVerifiedUnits(task),
    verifiedCost: calculateVerifiedCost(task),
  })),
  [tasks, settings.hourlyRate]
);
```

### Re-render Optimization

**Current:** Entire task array re-renders on any task change

**Potential Optimization:**
```typescript
// Memoize TaskTable rows
const TaskRow = React.memo(({ task, onUpdate }) => { ... });
```

### Debouncing User Input

**Not currently implemented, but recommended for:**
- Task name input
- Number input fields
- AI chat input

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedUpdate = useDebouncedCallback(
  (id, field, value) => updateTask(id, field, value),
  300
);
```

### Bundle Size

**Current:** All components loaded upfront

**Code Splitting Opportunity:**
```typescript
// Lazy load screens
const AuditLayerScreen = lazy(() => import('./components/AuditLayerScreen'));
const ReportsScreen = lazy(() => import('./components/ReportsScreen'));
```

---

## API Integration Points (Future)

### Backend Requirements

**For Full Production:**

1. **Task Persistence API**
```typescript
GET    /api/tasks              // List all tasks
POST   /api/tasks              // Create task
PUT    /api/tasks/:id          // Update task
DELETE /api/tasks/:id          // Delete task
```

2. **AI Analysis API**
```typescript
POST   /api/ai/analyze-task   // Natural language → task factors
POST   /api/ai/chat           // Conversational AI
POST   /api/ai/insights       // Generate insights
```

3. **Settings API**
```typescript
GET    /api/settings          // Get user settings
PUT    /api/settings          // Update settings
```

4. **Audit Trail API**
```typescript
GET    /api/audit-trail       // Get change history
POST   /api/audit-trail       // Log change
```

5. **Reports API**
```typescript
GET    /api/reports/summary   // Project summary
GET    /api/reports/export    // Export data
```

### Authentication & Authorization

**Recommended:**
- Supabase Auth for user management
- Row-Level Security (RLS) for multi-tenant data isolation
- JWT tokens for API authentication

### Database Schema (Supabase)

```sql
-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  task_name TEXT NOT NULL,
  isr NUMERIC(5,2),
  cf NUMERIC(5,2),
  uxi NUMERIC(5,2),
  rcf NUMERIC(5,2),
  aep NUMERIC(5,2),
  l NUMERIC(5,2),
  mlw NUMERIC(5,2),
  cgw NUMERIC(5,2),
  rf NUMERIC(5,2),
  s NUMERIC(5,2),
  glri NUMERIC(5,2),
  ai_verified_units NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings table
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  hourly_rate NUMERIC(10,2) DEFAULT 66,
  unit_to_hour_ratio NUMERIC(5,2) DEFAULT 1.5,
  currency VARCHAR(3) DEFAULT 'USD',
  industry_preset VARCHAR(50) DEFAULT 'general',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit trail table
CREATE TABLE audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  task_id UUID REFERENCES tasks(id),
  action VARCHAR(50),
  old_value JSONB,
  new_value JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## Development Workflow

### Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### File Watching & Hot Reload
Vite provides instant HMR (Hot Module Replacement) during development.

### Type Checking
```bash
# Run TypeScript compiler check
npx tsc --noEmit
```

---

## Testing Strategy (Recommended)

### Unit Tests
```typescript
// Example: Testing PCI calculation
describe('calculatePCI', () => {
  it('calculates PCI correctly', () => {
    const task: Task = { ISR: 5, CF: 1.2, UXI: 1.5, ... };
    expect(calculatePCI(task)).toBe(expectedValue);
  });
  
  it('returns 0 for negative PCI', () => {
    const task: Task = { ISR: 0, L: 100, ... };
    expect(calculatePCI(task)).toBe(0);
  });
});
```

### Integration Tests
- Test task CRUD operations
- Test AI auto-fill flow
- Test formula panel interactions

### E2E Tests (Playwright/Cypress)
- User creates task via AI Task Creator
- User edits task factors
- User views insights
- User navigates between screens

---

## Security Considerations

### Current (Frontend-Only)
- No authentication
- No data persistence
- No API keys exposed

### Production Requirements
1. **Authentication**: Implement user login (Supabase Auth)
2. **Authorization**: Protect API routes
3. **Input Validation**: Sanitize all user inputs
4. **Rate Limiting**: Prevent AI API abuse
5. **CORS**: Configure proper CORS headers
6. **HTTPS**: Enforce SSL/TLS
7. **Environment Variables**: Store API keys in `.env`

### PII & Data Privacy
- No PII collection currently
- For production: GDPR/CCPA compliance required
- Implement data export/deletion features
- Add privacy policy and terms of service

---

## Accessibility

### Current Implementation
- Semantic HTML elements
- ARIA labels on icon buttons
- Keyboard navigation support (inputs, buttons)
- Focus states on interactive elements

### Improvements Needed
- Screen reader announcements for dynamic content
- ARIA live regions for AI responses
- Skip navigation links
- Keyboard shortcuts for power users
- Color contrast verification (WCAG AA)

---

## Browser Compatibility

**Supported Browsers:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Features Used:**
- CSS Grid
- Flexbox
- CSS Custom Properties
- ES6+ JavaScript
- React Hooks

---

## Deployment

### Build Output
```bash
npm run build
# Creates /dist folder with optimized static assets
```

### Hosting Options
1. **Vercel** (Recommended for React apps)
2. **Netlify**
3. **AWS S3 + CloudFront**
4. **GitHub Pages**
5. **Supabase Hosting** (if using Supabase backend)

### Environment Variables
```env
# Future backend integration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_AI_API_KEY=your-ai-api-key
```

---

## Troubleshooting

### Common Issues

**1. Calculations seem wrong**
- Verify formula implementation matches specification
- Check for division by zero in AAS calculation
- Ensure `Math.max(0, pci)` prevents negatives

**2. AI auto-fill not working**
- Check task name contains recognizable keywords
- Verify `aiGeneratingFor` state resets after delay
- Check console for errors

**3. Table overflow on mobile**
- Ensure `overflow-x-auto` is present on table wrapper
- Consider responsive table patterns for small screens

**4. Styles not applying**
- Check Tailwind class names for typos
- Verify color values (hex codes) are correct
- Check `/styles/globals.css` for conflicts

---

## Future Enhancements

### Phase 1: Backend Integration
- [ ] Supabase connection
- [ ] User authentication
- [ ] Task persistence
- [ ] Real-time collaboration

### Phase 2: Advanced AI
- [ ] OpenAI/Claude integration
- [ ] Historical learning
- [ ] Predictive analytics
- [ ] Custom ML models

### Phase 3: Enterprise Features
- [ ] Multi-project support
- [ ] Team collaboration
- [ ] Role-based access control
- [ ] Advanced reporting
- [ ] Export to Excel/PDF
- [ ] API webhooks

### Phase 4: Mobile App
- [ ] React Native version
- [ ] Offline support
- [ ] Push notifications
- [ ] Mobile-optimized UI

---

## Contributing Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React hooks best practices
- Use functional components (no class components)
- Prettier for formatting
- ESLint for linting

### Component Guidelines
- Keep components small and focused
- Extract reusable logic into hooks
- Use meaningful prop names
- Document complex logic with comments
- Include TypeScript interfaces for all props

### Git Workflow
```bash
# Feature branch
git checkout -b feature/ai-enhancements

# Commit with meaningful messages
git commit -m "feat: add AI anomaly detection to insights card"

# Push and create PR
git push origin feature/ai-enhancements
```

---

## Support & Resources

### Documentation
- [AI Features Guide](./AI_FEATURES.md)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Contact
- **Development Team**: Plataforma Technologies
- **Product**: PCI Engine - AI-Powered Audit Intelligence

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Maintainer:** FRContent / Plataforma Technologies

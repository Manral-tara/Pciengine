# PCI Engine - Data Models Reference

Complete TypeScript-style data model definitions for all entities in the system.

---

## 📊 Core Entities

### Task
```typescript
interface Task {
  id: string;                    // UUID
  taskName: string;              // Required
  description?: string;
  
  // Basic Fields
  estimatedHours?: number;
  roleType?: string;             // "Full Stack Developer", "UI/UX Designer", etc.
  costRate?: number;             // Hourly rate in currency units
  complexityScore?: number;      // 1-10 scale
  riskLevel?: string;            // "Low", "Medium", "High"
  
  // PCI Formula Fields (all default to 1)
  ISR: number;                   // Implementation Scope Rating (1-10)
  CF: number;                    // Complexity Factor (1-5)
  UXI: number;                   // User Experience Impact (1-10)
  RCF: number;                   // Resource Consumption Factor (1-5)
  AEP: number;                   // Architectural Effort Points (1-20)
  L: number;                     // Learning Curve (1-5)
  MLW: number;                   // Maintenance Workload (1-5)
  CGW: number;                   // Code Generation Weight (1-5)
  RF: number;                    // Risk Factor (1-5)
  S: number;                     // Skill Level (1-5)
  GLRI: number;                  // Global Resource Index (1-5)
  
  // Calculated/AI Fields
  aiVerifiedUnits?: number;      // AI-suggested verified units
  verifiedCost?: number;         // OVERRIDE: Manual cost input (reverse-calculates units)
  
  // Metadata
  userId: string;
  projectId?: string;
  parentTaskId?: string;         // For hierarchical Epic → Task → Subtask
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

**PCI Calculation Formula:**
```typescript
const pci = (ISR * CF * UXI) + (RCF * AEP - L) + (MLW * CGW * RF) + (S * GLRI);
```

**Verified Cost Override Logic:**
```typescript
// Normal flow: PCI → Verified Units → Cost
const normalCost = verifiedUnits * costRate;

// Override flow: Cost → Verified Units
if (verifiedCost) {
  const calculatedUnits = verifiedCost / costRate;
  // System adjusts PCI Units to match
}
```

---

### Task Element (Subtask)
```typescript
interface TaskElement {
  id: string;                    // UUID
  title: string;                 // Required
  description: string;
  category: 'Development' | 'Design' | 'Testing' | 'Deployment' | 'Documentation';
  
  // Optional fields
  estimatedHours?: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'blocked';
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high';
  
  // Metadata
  taskId: string;                // Parent task ID
  createdAt?: string;
  updatedAt?: string;
}
```

---

### Project
```typescript
interface Project {
  id: string;                    // UUID
  name: string;                  // Required
  description?: string;
  color: string;                 // Hex color code (e.g., "#2BBBEF")
  
  // Archive status
  isArchived: boolean;           // Default: false
  archivedAt?: string | null;    // ISO timestamp when archived
  
  // Calculated totals
  taskCount?: number;            // Number of tasks in project
  totalPCI?: number;             // Sum of all task PCI values
  totalCost?: number;            // Total project cost
  
  // Metadata
  userId: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### Scope Version
```typescript
interface ScopeVersion {
  id: string;                    // UUID
  versionName: string;           // "Version 1.0", "Initial Scope", etc.
  description: string;           // What changed in this version
  
  // Snapshot data
  tasks: Task[];                 // Complete snapshot of tasks at this version
  
  // Metadata
  projectId: string;             // Parent project
  createdAt: string;
  createdBy: string;             // User email or ID
}
```

---

### Comment
```typescript
interface Comment {
  id: string;                    // UUID
  text: string;                  // Required
  type: 'note' | 'review' | 'question' | 'alert';
  
  // Metadata
  taskId: string;                // Associated task
  author: string;                // User email or ID
  createdAt: string;
}
```

---

### Proposal
```typescript
interface Proposal {
  id: string;                    // UUID
  projectName: string;
  content: string;               // Markdown content
  
  // Financial data
  totalCost: number;
  timeline: string;              // "3-4 months", etc.
  
  // Associated data
  tasks?: Task[];                // Tasks included in proposal
  
  // Metadata
  userId: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### Verification
```typescript
interface Verification {
  taskId: string;
  userId: string;
  status: 'unverified' | 'verified' | 'flagged';
  badge?: 'bronze' | 'silver' | 'gold' | 'platinum';
  confidence?: number;           // 0-100
  notes?: string;
  
  // Metadata
  verifiedAt: string;
  verifiedBy: string;            // User email or ID
}
```

---

### Settings
```typescript
interface Settings {
  hourlyRate: number;            // Default: 66
  unitToHourRatio: number;       // Default: 1.5
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | string;
  industryPreset: 'general' | 'enterprise' | 'startup' | 'healthcare' | 'fintech';
  
  // Metadata
  userId: string;
  updatedAt: string;
}
```

---

### User Preferences
```typescript
interface UserPreferences {
  theme: 'light' | 'dark';       // Default: 'light'
  language: 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ja';  // Default: 'en'
  autoSave: boolean;             // Default: true
  notifications: boolean;        // Default: true
  compactView: boolean;          // Default: false
  
  // Metadata
  userId?: string;
  updatedAt?: string;
}
```

---

### Audit Log
```typescript
interface AuditLog {
  id: string;                    // UUID
  userId: string;
  action: 'create' | 'update' | 'delete' | 'review' | 'approve' | 'reject' | 'flag' | 'verify';
  entityType: 'task' | 'project' | 'settings' | 'comment' | 'version' | 'proposal' | 'task_elements';
  entityId: string;
  
  // Change tracking
  changes: {
    before?: any;                // Previous state (for updates)
    after?: any;                 // New state (for updates/creates)
    [key: string]: any;          // Additional change metadata
  };
  
  metadata?: {
    [key: string]: any;          // Additional contextual data
  };
  
  timestamp: string;             // ISO 8601
}
```

---

## 🗂️ Key-Value Store Structure

All data is stored in Supabase KV store with the following key patterns:

### Tasks
- **Pattern:** `task:{userId}:{taskId}`
- **Value:** `Task` object

### Task Elements
- **Pattern:** `task_elements:{userId}:{taskId}`
- **Value:** `TaskElement[]` array

### Projects
- **Pattern:** `project_{userId}_{projectId}`
- **Value:** `Project` object

### Project Tasks
- **Pattern:** `project_tasks_{userId}_{projectId}`
- **Value:** `Task[]` array

### Project Versions
- **Pattern:** `project_versions:{userId}:{projectId}`
- **Value:** `ScopeVersion[]` array

### Comments
- **Pattern:** `comments:{userId}:task:{taskId}`
- **Value:** `Comment[]` array

### Proposals
- **Pattern:** `proposal:{userId}:{proposalId}`
- **Value:** `Proposal` object

### Verification
- **Pattern:** `verification:{userId}:{taskId}`
- **Value:** `Verification` object

### Settings
- **Pattern:** `settings:{userId}`
- **Value:** `Settings` object

### Preferences
- **Pattern:** `preferences:{userId}`
- **Value:** `UserPreferences` object

### Audit Logs
- **Pattern:** `audit:{userId}:{auditId}`
- **Value:** `AuditLog` object

---

## 🔄 Hierarchical Task Structure

**Epic → Task → Subtask Architecture:**

```typescript
// Epic (Parent Task)
const epic: Task = {
  id: "epic-uuid",
  taskName: "User Management Module",
  parentTaskId: null,  // Top level
  // ... other fields
};

// Task (Child of Epic)
const task: Task = {
  id: "task-uuid",
  taskName: "Authentication System",
  parentTaskId: "epic-uuid",  // References epic
  // ... other fields
};

// Subtask (Child of Task) - Using TaskElement
const subtask: TaskElement = {
  id: "element-uuid",
  title: "OAuth Integration",
  taskId: "task-uuid",  // References parent task
  category: "Development",
  // ... other fields
};
```

---

## 💾 Data Migration Notes

If migrating from localStorage or another system:

1. **Generate UUIDs** for all entities using `crypto.randomUUID()`
2. **Add timestamps** in ISO 8601 format: `new Date().toISOString()`
3. **Ensure userId** is set for all entities
4. **Set default PCI values** to `1` if not present
5. **Convert dates** to ISO strings
6. **Validate required fields** before import

---

## 🔍 Querying Patterns

### Get all tasks for user
```typescript
const tasks = await kv.getByPrefix(`task:${userId}:`);
```

### Get all projects for user
```typescript
const projects = await kv.getByPrefix(`project_${userId}_`);
```

### Get all audit logs for user
```typescript
const logs = await kv.getByPrefix(`audit:${userId}:`);
```

### Get specific entity
```typescript
const task = await kv.get(`task:${userId}:${taskId}`);
```

---

## 📊 Calculated Metrics

### Task PCI Score
```typescript
function calculatePCI(task: Task): number {
  return (
    (task.ISR * task.CF * task.UXI) +
    (task.RCF * task.AEP - task.L) +
    (task.MLW * task.CGW * task.RF) +
    (task.S * task.GLRI)
  );
}
```

### AI Accuracy Score (AAS)
```typescript
function calculateAAS(task: Task): number {
  const pci = calculatePCI(task);
  if (pci === 0) return 0;
  return (task.aiVerifiedUnits / pci) * 100;
}
```

### Task Cost
```typescript
function calculateTaskCost(task: Task, settings: Settings): number {
  // If verified cost is provided, use it directly
  if (task.verifiedCost) {
    return task.verifiedCost;
  }
  
  // Otherwise calculate from PCI
  const pci = calculatePCI(task);
  const verifiedUnits = task.aiVerifiedUnits || (pci * 0.95);
  return verifiedUnits * settings.hourlyRate;
}
```

### Project Totals
```typescript
function calculateProjectTotals(tasks: Task[], settings: Settings) {
  const totalPCI = tasks.reduce((sum, task) => sum + calculatePCI(task), 0);
  const totalCost = tasks.reduce((sum, task) => sum + calculateTaskCost(task, settings), 0);
  const taskCount = tasks.length;
  
  return { totalPCI, totalCost, taskCount };
}
```

---

## 🎯 Best Practices

1. **Always validate** required fields before saving
2. **Use transactions** when updating related entities (project + tasks)
3. **Create audit logs** for all mutations
4. **Sanitize user input** to prevent injection attacks
5. **Set default values** for PCI factors (all = 1)
6. **Handle null/undefined** gracefully in calculations
7. **Use ISO 8601** for all timestamps
8. **Scope all queries** by userId for data isolation
9. **Validate verifiedCost** is positive if provided
10. **Maintain referential integrity** between tasks and elements

---

## 📝 Example: Complete Task Creation

```typescript
// Frontend creates task
const newTask: Partial<Task> = {
  taskName: "User Authentication",
  description: "Implement OAuth and JWT",
  estimatedHours: 40,
  roleType: "Full Stack Developer",
  costRate: 150,
  complexityScore: 7,
  riskLevel: "Medium",
  ISR: 8,
  CF: 7,
  UXI: 9,
  RCF: 6,
  AEP: 8,
  L: 4,
  MLW: 5,
  CGW: 6,
  RF: 5,
  S: 8,
  GLRI: 7,
  aiVerifiedUnits: 45.2,
  // Optional: verifiedCost: 12000
};

// Backend adds metadata
const task: Task = {
  ...newTask,
  id: crypto.randomUUID(),
  userId: user.id,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ISR: newTask.ISR || 1,  // Ensure defaults
  CF: newTask.CF || 1,
  // ... etc
};

// Save to KV store
await kv.set(`task:${user.id}:${task.id}`, task);

// Create audit log
await createAuditLog(user.id, 'create', 'task', task.id, {
  after: task
});
```

---

**Last Updated:** January 2024  
**Version:** 2.0

# PCI Engine - Backend Implementation Guide

Step-by-step guide for your development team to implement and extend the backend API.

---

## 🚀 Quick Start

### Prerequisites
- Supabase project set up
- Environment variables configured:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### File Structure
```
/supabase/functions/server/
├── index.tsx                 # Main server file (existing routes)
├── new-routes.tsx           # New feature routes (2.0 features)
├── kv_store.tsx            # Key-value store utilities (protected)
└── ai-project-helper.tsx   # AI helper functions
```

---

## 📋 Backend Architecture Overview

### Request Flow
```
Client Request
    ↓
Authorization Header Check
    ↓
verifyAuth() Middleware
    ↓
Route Handler
    ↓
KV Store Operations
    ↓
Audit Log Creation (if mutation)
    ↓
JSON Response
```

### Authentication Flow
```typescript
// All protected routes use this pattern:
const authHeader = c.req.header('Authorization');
const { user, error } = await verifyAuth(authHeader);

if (!user) {
  return c.json({ error: error || 'Unauthorized' }, 401);
}

// Continue with authenticated logic...
```

---

## 🔨 Implementing New Features

### Step 1: Add Route Handler

**Location:** `/supabase/functions/server/new-routes.tsx`

```typescript
// Example: Add a new "favorites" feature
app.get('/make-server-0dcd2201/favorites', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const favorites = await kv.get(`favorites:${user.id}`) || [];
    return c.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return c.json({ error: 'Failed to fetch favorites' }, 500);
  }
});
```

### Step 2: Add POST/PUT/DELETE Methods

```typescript
// POST - Create
app.post('/make-server-0dcd2201/favorites', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const { taskId } = await c.req.json();
    
    if (!taskId) {
      return c.json({ error: 'taskId is required' }, 400);
    }
    
    const favorites = await kv.get(`favorites:${user.id}`) || [];
    
    // Prevent duplicates
    if (!favorites.includes(taskId)) {
      favorites.push(taskId);
      await kv.set(`favorites:${user.id}`, favorites);
      
      // Create audit log
      await createAuditLog(user.id, 'create', 'favorite', taskId, {
        action: 'added_to_favorites'
      });
    }
    
    return c.json({ success: true, favorites });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return c.json({ error: 'Failed to add favorite' }, 500);
  }
});

// DELETE - Remove
app.delete('/make-server-0dcd2201/favorites/:taskId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const taskId = c.req.param('taskId');
    const favorites = await kv.get(`favorites:${user.id}`) || [];
    
    const updatedFavorites = favorites.filter(id => id !== taskId);
    await kv.set(`favorites:${user.id}`, updatedFavorites);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return c.json({ error: 'Failed to remove favorite' }, 500);
  }
});
```

### Step 3: Register Route

Routes in `new-routes.tsx` are automatically registered via:
```typescript
// In index.tsx (already done)
registerNewRoutes(app, verifyAuth, kv, createAuditLog);
```

---

## 🔐 Authentication Patterns

### Standard Route Protection
```typescript
const authHeader = c.req.header('Authorization');
const { user, error } = await verifyAuth(authHeader);

if (!user) {
  return c.json({ error: error || 'Unauthorized' }, 401);
}
```

### Optional Authentication
```typescript
const authHeader = c.req.header('Authorization');
const { user } = await verifyAuth(authHeader);

// Continue regardless - user might be null
if (user) {
  // Personalized response
} else {
  // Public response
}
```

### Admin-Only Routes (Future)
```typescript
const authHeader = c.req.header('Authorization');
const { user, error } = await verifyAuth(authHeader);

if (!user) {
  return c.json({ error: 'Unauthorized' }, 401);
}

// Check admin role (implement user roles first)
const userProfile = await kv.get(`user_profile:${user.id}`);
if (userProfile?.role !== 'admin') {
  return c.json({ error: 'Forbidden - Admin access required' }, 403);
}
```

---

## 💾 KV Store Patterns

### Key Naming Convention
Always scope by userId first:
```typescript
// ✅ Good
`task:${userId}:${taskId}`
`project_${userId}_${projectId}`
`settings:${userId}`

// ❌ Bad
`task:${taskId}`  // Not scoped to user!
```

### Single Value
```typescript
// Get
const settings = await kv.get(`settings:${userId}`);

// Set
await kv.set(`settings:${userId}`, settingsObject);

// Delete
await kv.del(`settings:${userId}`);
```

### Array Values
```typescript
// Get array (returns empty array if not exists)
const comments = await kv.get(`comments:${userId}:task:${taskId}`) || [];

// Add to array
comments.push(newComment);
await kv.set(`comments:${userId}:task:${taskId}`, comments);

// Remove from array
const filtered = comments.filter(c => c.id !== commentId);
await kv.set(`comments:${userId}:task:${taskId}`, filtered);

// Update item in array
const index = comments.findIndex(c => c.id === commentId);
if (index !== -1) {
  comments[index] = { ...comments[index], ...updates };
  await kv.set(`comments:${userId}:task:${taskId}`, comments);
}
```

### Prefix Queries
```typescript
// Get all tasks for user
const taskEntries = await kv.getByPrefix(`task:${userId}:`);
const tasks = taskEntries
  .map(entry => entry.value)
  .filter(task => task != null);

// Get all projects for user
const projectEntries = await kv.getByPrefix(`project_${userId}_`);
const projects = projectEntries
  .map(entry => entry.value)
  .filter(project => project != null);
```

### Batch Operations
```typescript
// Multiple sets
const operations = tasks.map(task => 
  kv.set(`task:${userId}:${task.id}`, task)
);
await Promise.all(operations);

// Multiple gets
const taskIds = ['id1', 'id2', 'id3'];
const keys = taskIds.map(id => `task:${userId}:${id}`);
const tasks = await kv.mget(keys);
```

---

## 📝 Audit Logging

### When to Create Audit Logs
- ✅ Create/Update/Delete operations
- ✅ Status changes (verification, approval)
- ✅ Bulk operations (sync, batch updates)
- ❌ Read operations (GET requests)
- ❌ Frequent auto-save operations (optional)

### Audit Log Format
```typescript
await createAuditLog(
  userId,           // Who made the change
  action,           // 'create', 'update', 'delete', 'verify', etc.
  entityType,       // 'task', 'project', 'settings', etc.
  entityId,         // ID of the affected entity
  changes,          // What changed
  metadata          // Optional additional context
);
```

### Examples
```typescript
// Create
await createAuditLog(user.id, 'create', 'task', task.id, {
  after: task
});

// Update
await createAuditLog(user.id, 'update', 'task', taskId, {
  before: existingTask,
  after: updatedTask
});

// Delete
await createAuditLog(user.id, 'delete', 'project', projectId, {
  before: deletedProject
});

// Custom action
await createAuditLog(user.id, 'verify', 'task', taskId, {
  status: 'verified',
  badge: 'gold',
  confidence: 95
});
```

---

## 🎯 Data Validation

### Required Field Validation
```typescript
const { taskName, description } = await c.req.json();

if (!taskName) {
  return c.json({ error: 'taskName is required' }, 400);
}

if (!taskName.trim()) {
  return c.json({ error: 'taskName cannot be empty' }, 400);
}
```

### Type Validation
```typescript
const { estimatedHours } = await c.req.json();

if (estimatedHours !== undefined) {
  const hours = parseFloat(estimatedHours);
  if (isNaN(hours) || hours < 0) {
    return c.json({ error: 'estimatedHours must be a positive number' }, 400);
  }
}
```

### Array Validation
```typescript
const { tasks } = await c.req.json();

if (!Array.isArray(tasks)) {
  return c.json({ error: 'tasks must be an array' }, 400);
}

// Validate each task
const invalidTasks = tasks.filter(task => 
  !task.id || !task.taskName
);

if (invalidTasks.length > 0) {
  return c.json({ 
    error: 'All tasks must have id and taskName',
    invalidCount: invalidTasks.length 
  }, 400);
}
```

### Enum Validation
```typescript
const { badge } = await c.req.json();

const validBadges = ['bronze', 'silver', 'gold', 'platinum'];
if (badge && !validBadges.includes(badge)) {
  return c.json({ 
    error: `Invalid badge. Must be one of: ${validBadges.join(', ')}` 
  }, 400);
}
```

---

## ⚠️ Error Handling

### Standard Error Pattern
```typescript
try {
  // Operation that might fail
  const result = await kv.get(`data:${userId}`);
  
  if (!result) {
    return c.json({ error: 'Data not found' }, 404);
  }
  
  return c.json({ result });
} catch (error) {
  console.error('Descriptive error message:', error);
  return c.json({ error: 'Failed to fetch data' }, 500);
}
```

### Logging Best Practices
```typescript
// ✅ Good - Contextual error messages
console.error('Error fetching project tasks:', error);
console.error('Error updating user preferences:', error);

// ❌ Bad - Generic messages
console.error('Error:', error);
console.log(error);
```

### Graceful Degradation
```typescript
// If optional data fails, don't crash - return defaults
try {
  const preferences = await kv.get(`preferences:${userId}`);
  return preferences || { theme: 'light', language: 'en' };
} catch (error) {
  console.error('Error fetching preferences, using defaults:', error);
  return { theme: 'light', language: 'en' };
}
```

---

## 🔄 Calculated Fields

### PCI Calculation
```typescript
function calculatePCI(task: any): number {
  return (
    (task.ISR || 1) * (task.CF || 1) * (task.UXI || 1) +
    (task.RCF || 1) * (task.AEP || 1) - (task.L || 1) +
    (task.MLW || 1) * (task.CGW || 1) * (task.RF || 1) +
    (task.S || 1) * (task.GLRI || 1)
  );
}
```

### Cost Calculations
```typescript
// With verified cost override
function calculateTaskCost(task: any, hourlyRate: number): number {
  // If manual cost is provided, use it
  if (task.verifiedCost && task.verifiedCost > 0) {
    return task.verifiedCost;
  }
  
  // Otherwise calculate from PCI
  const pci = calculatePCI(task);
  const verifiedUnits = task.aiVerifiedUnits || (pci * 0.95);
  return verifiedUnits * hourlyRate;
}

// Reverse calculation for verified cost input
function calculateVerifiedUnits(verifiedCost: number, costRate: number): number {
  if (costRate === 0) return 0;
  return verifiedCost / costRate;
}
```

### Project Totals
```typescript
async function updateProjectTotals(userId: string, projectId: string, tasks: any[]) {
  const totalPCI = tasks.reduce((sum, task) => {
    const pci = calculatePCI(task);
    return sum + Math.max(0, pci);
  }, 0);
  
  const totalCost = tasks.reduce((sum, task) => {
    return sum + calculateTaskCost(task, 66); // Use settings.hourlyRate
  }, 0);
  
  const project = await kv.get(`project_${userId}_${projectId}`);
  
  const updatedProject = {
    ...project,
    taskCount: tasks.length,
    totalPCI: Math.round(totalPCI * 100) / 100, // Round to 2 decimals
    totalCost: Math.round(totalCost),
    updatedAt: new Date().toISOString(),
  };
  
  await kv.set(`project_${userId}_${projectId}`, updatedProject);
  
  return updatedProject;
}
```

---

## 🧪 Testing Your Routes

### Manual Testing with cURL

```bash
# Set variables
export API_URL="https://your-project.supabase.co/functions/v1/make-server-0dcd2201"
export TOKEN="your-auth-token"

# Test GET
curl -X GET "$API_URL/tasks" \
  -H "Authorization: Bearer $TOKEN"

# Test POST
curl -X POST "$API_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskName": "Test Task",
    "estimatedHours": 10,
    "ISR": 5
  }'

# Test PUT
curl -X PUT "$API_URL/tasks/task-uuid-123" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskName": "Updated Task Name"
  }'

# Test DELETE
curl -X DELETE "$API_URL/tasks/task-uuid-123" \
  -H "Authorization: Bearer $TOKEN"
```

### Testing from Frontend

```typescript
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Get auth token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Make API call
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-0dcd2201/tasks`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }
);

const data = await response.json();
console.log(data);
```

---

## 📊 Performance Optimization

### Batch Operations
```typescript
// ❌ Bad - Multiple sequential operations
for (const task of tasks) {
  await kv.set(`task:${userId}:${task.id}`, task);
}

// ✅ Good - Parallel operations
const operations = tasks.map(task =>
  kv.set(`task:${userId}:${task.id}`, task)
);
await Promise.all(operations);
```

### Caching Patterns
```typescript
// Cache frequently accessed data
let cachedSettings: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 1 minute

async function getSettings(userId: string) {
  const now = Date.now();
  
  if (cachedSettings && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedSettings;
  }
  
  cachedSettings = await kv.get(`settings:${userId}`);
  cacheTimestamp = now;
  
  return cachedSettings;
}
```

### Pagination (Future Enhancement)
```typescript
// For large datasets, implement pagination
app.get('/make-server-0dcd2201/audit-logs', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  
  const allLogs = await kv.getByPrefix(`audit:${user.id}:`);
  const sortedLogs = allLogs
    .map(l => l.value)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const paginatedLogs = sortedLogs.slice(offset, offset + limit);
  
  return c.json({
    logs: paginatedLogs,
    total: sortedLogs.length,
    limit,
    offset,
    hasMore: offset + limit < sortedLogs.length
  });
});
```

---

## 🔧 Common Patterns

### Default Values
```typescript
const task = {
  ...taskData,
  id: taskData.id || crypto.randomUUID(),
  ISR: taskData.ISR || 1,
  CF: taskData.CF || 1,
  UXI: taskData.UXI || 1,
  RCF: taskData.RCF || 1,
  AEP: taskData.AEP || 1,
  L: taskData.L || 1,
  MLW: taskData.MLW || 1,
  CGW: taskData.CGW || 1,
  RF: taskData.RF || 1,
  S: taskData.S || 1,
  GLRI: taskData.GLRI || 1,
  createdAt: taskData.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

### Existence Checks
```typescript
const project = await kv.get(`project_${user.id}_${projectId}`);

if (!project) {
  return c.json({ error: 'Project not found' }, 404);
}
```

### Soft Delete (Archive Pattern)
```typescript
// Instead of deleting, mark as archived
const project = await kv.get(`project_${user.id}_${projectId}`);

const archivedProject = {
  ...project,
  isArchived: true,
  archivedAt: new Date().toISOString(),
};

await kv.set(`project_${user.id}_${projectId}`, archivedProject);
```

---

## 📚 Additional Resources

- **API Documentation:** `/API_DOCUMENTATION.md`
- **Data Models:** `/DATA_MODELS.md`
- **Supabase Docs:** https://supabase.com/docs
- **Hono Docs:** https://hono.dev/

---

## 🎯 Next Steps for Your Team

1. ✅ **Review** API Documentation and Data Models
2. ✅ **Test** existing endpoints with cURL or Postman
3. ✅ **Integrate** frontend with new backend routes
4. ⏭️ **Implement** any custom business logic needed
5. ⏭️ **Add** rate limiting and advanced security
6. ⏭️ **Set up** monitoring and error tracking
7. ⏭️ **Deploy** to production Supabase environment

---

**Last Updated:** January 2024  
**Version:** 2.0  
**Maintained by:** FRContent / Plataforma Technologies

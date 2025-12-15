# PCI Engine - Quick API Reference Card

Quick reference for developers. See `/API_DOCUMENTATION.md` for complete details.

---

## 🔑 Authentication

**All requests require:**
```
Authorization: Bearer {token}
```

Get token: `supabase.auth.getSession()` → `session.access_token`

---

## 📝 Tasks

```
GET    /tasks                          # Get all tasks
POST   /tasks                          # Create task
PUT    /tasks/:id                      # Update task
DELETE /tasks/:id                      # Delete task
POST   /tasks/sync                     # Batch sync tasks
```

---

## 🧩 Task Elements (Subtasks)

```
GET    /tasks/:taskId/elements                    # Get all elements
POST   /tasks/:taskId/elements                    # Save elements
PUT    /tasks/:taskId/elements/:elementId         # Update element
DELETE /tasks/:taskId/elements/:elementId         # Delete element
```

---

## 📁 Projects

```
GET    /projects                       # Get all projects
POST   /projects                       # Create project
PUT    /projects/:id                   # Update project (archive/unarchive)
DELETE /projects/:id                   # Delete project
GET    /projects/:id/tasks             # Get project tasks
POST   /projects/:id/tasks             # Save project tasks
```

---

## 📊 Scope Versions

```
GET    /projects/:projectId/versions              # Get all versions
POST   /projects/:projectId/versions              # Create snapshot
GET    /projects/:projectId/versions/:versionId   # Get specific version
```

---

## 💬 Comments

```
GET    /tasks/:taskId/comments                    # Get comments
POST   /tasks/:taskId/comments                    # Add comment
DELETE /tasks/:taskId/comments/:commentId         # Delete comment
```

---

## 📄 Proposals

```
GET    /proposals                      # Get all proposals
POST   /proposals                      # Create proposal
GET    /proposals/:id                  # Get specific proposal
DELETE /proposals/:id                  # Delete proposal
```

---

## ⚙️ Settings & Preferences

```
GET    /settings                       # Get user settings
PUT    /settings                       # Update settings

GET    /user/preferences               # Get user preferences
PUT    /user/preferences               # Update preferences
```

---

## ✓ Verification

```
GET    /tasks/:taskId/verification     # Get verification status
POST   /tasks/:taskId/verification     # Save verification
```

---

## 📜 Audit Logs

```
GET    /audit-logs                             # Get all audit logs
GET    /audit-logs/:entityType/:entityId      # Get entity logs
```

---

## 🤖 AI Services

```
POST   /ai/analyze-task                # Analyze task description
POST   /ai/chat                        # AI conversational assistant
POST   /ai/verify-task                 # Deep task verification
POST   /ai/generate-task-elements      # Generate subtasks
POST   /ai/enhance-task-elements       # Enhance existing elements
POST   /ai/generate-project            # Generate full project
```

---

## 📦 Request/Response Examples

### Create Task
```json
POST /tasks

{
  "taskName": "User Authentication",
  "estimatedHours": 40,
  "costRate": 150,
  "ISR": 8,
  "CF": 7,
  "UXI": 9,
  "verifiedCost": 12000  // Optional override
}

→ { "task": {...}, "message": "Task created successfully" }
```

### Update Preferences
```json
PUT /user/preferences

{
  "theme": "dark",
  "language": "es",
  "autoSave": true
}

→ { "success": true, "preferences": {...} }
```

### Create Version Snapshot
```json
POST /projects/:projectId/versions

{
  "versionName": "Version 2.0 - Expanded Scope",
  "description": "Added payment processing",
  "tasks": [ /* current tasks */ ]
}

→ { "success": true, "version": {...} }
```

### Add Comment
```json
POST /tasks/:taskId/comments

{
  "text": "This needs security review",
  "type": "alert"
}

→ { "success": true, "comment": {...} }
```

---

## 🎨 Data Structures

### Task (Key Fields)
```typescript
{
  id: string,
  taskName: string,
  ISR, CF, UXI, RCF, AEP, L, MLW, CGW, RF, S, GLRI: number,
  aiVerifiedUnits?: number,
  verifiedCost?: number,  // NEW: Manual cost override
  userId: string,
  createdAt: string,
  updatedAt: string
}
```

### Task Element
```typescript
{
  id: string,
  title: string,
  description: string,
  category: 'Development' | 'Design' | 'Testing' | 'Deployment',
  estimatedHours?: number,
  status?: 'pending' | 'in-progress' | 'completed'
}
```

### Project
```typescript
{
  id: string,
  name: string,
  color: string,
  isArchived: boolean,      // NEW
  archivedAt?: string,      // NEW
  taskCount: number,
  totalPCI: number,
  totalCost: number
}
```

### Preferences
```typescript
{
  theme: 'light' | 'dark',
  language: 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ja',
  autoSave: boolean,
  notifications: boolean,
  compactView: boolean
}
```

---

## 🔐 Security Notes

- ✅ All routes require Bearer token (except `/auth/signup`)
- ✅ Data automatically scoped to `userId`
- ✅ No cross-user data access
- ✅ Input validation on all POST/PUT
- ✅ Audit logging on all mutations

---

## ⚠️ Error Responses

```json
// 400 Bad Request
{ "error": "taskName is required" }

// 401 Unauthorized
{ "error": "Unauthorized - Please sign in" }

// 404 Not Found
{ "error": "Task not found" }

// 500 Server Error
{ "error": "Failed to fetch tasks" }
```

---

## 🧮 PCI Formula

```typescript
PCI = (ISR * CF * UXI) + (RCF * AEP - L) + (MLW * CGW * RF) + (S * GLRI)
```

**Defaults:** All factors = 1 if not provided

---

## 💰 Verified Cost Override

```typescript
// Normal flow
cost = verifiedUnits * hourlyRate

// Override flow (NEW)
if (verifiedCost) {
  verifiedUnits = verifiedCost / hourlyRate
}
```

**Use case:** Pre-negotiated fixed pricing or manual cost control

---

## 🚀 Quick Start (Frontend)

```typescript
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Get token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Make request
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-0dcd2201/tasks`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }
);

const { tasks } = await response.json();
```

---

## 📚 Full Documentation

- **Complete API:** `/API_DOCUMENTATION.md`
- **Data Models:** `/DATA_MODELS.md`
- **Implementation Guide:** `/IMPLEMENTATION_GUIDE.md`
- **Summary:** `/BACKEND_UPGRADE_SUMMARY.md`

---

**Base URL:** `https://{projectId}.supabase.co/functions/v1/make-server-0dcd2201`

**Version:** 2.0  
**Updated:** January 2024

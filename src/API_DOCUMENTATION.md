# PCI Engine - Backend API Documentation

**Version:** 2.0  
**Base URL:** `https://{projectId}.supabase.co/functions/v1/make-server-0dcd2201`  
**Authentication:** Bearer token in `Authorization` header

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Tasks](#tasks)
3. [Task Elements (Subtasks)](#task-elements-subtasks)
4. [Projects](#projects)
5. [Scope Versioning](#scope-versioning)
6. [Comments & Notes](#comments--notes)
7. [Proposals](#proposals)
8. [User Preferences](#user-preferences)
9. [Verification Tracking](#verification-tracking)
10. [Audit Logs](#audit-logs)
11. [Settings](#settings)
12. [AI Services](#ai-services)

---

## 🔐 Authentication

### Sign Up
**POST** `/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": { "name": "John Doe" }
  },
  "message": "User created successfully. You can now sign in."
}
```

### Sign In
Use Supabase client's `signInWithPassword()` method on frontend.

---

## 📝 Tasks

### Get All Tasks
**GET** `/tasks`  
🔒 Requires authentication

Returns all tasks for the authenticated user.

**Response:**
```json
{
  "tasks": [
    {
      "id": "task-uuid",
      "taskName": "User Authentication",
      "description": "Implement login and registration",
      "estimatedHours": 40,
      "roleType": "Full Stack Developer",
      "costRate": 150,
      "complexityScore": 7,
      "riskLevel": "Medium",
      "ISR": 8,
      "CF": 7,
      "UXI": 9,
      "RCF": 6,
      "AEP": 8,
      "L": 4,
      "MLW": 5,
      "CGW": 6,
      "RF": 5,
      "S": 8,
      "GLRI": 7,
      "aiVerifiedUnits": 45.2,
      "verifiedCost": 12000,
      "userId": "user-uuid",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T14:20:00Z"
    }
  ],
  "count": 1
}
```

### Create Task
**POST** `/tasks`  
🔒 Requires authentication

**Request Body:**
```json
{
  "taskName": "Payment Gateway Integration",
  "description": "Integrate Stripe payment processing",
  "estimatedHours": 32,
  "roleType": "Backend Developer",
  "costRate": 120,
  "complexityScore": 8,
  "riskLevel": "High",
  "ISR": 9,
  "CF": 8,
  "UXI": 7,
  "RCF": 9,
  "AEP": 10,
  "L": 5,
  "MLW": 6,
  "CGW": 7,
  "RF": 8,
  "S": 9,
  "GLRI": 8,
  "verifiedCost": 15000
}
```

**Response:**
```json
{
  "task": { /* complete task object */ },
  "message": "Task created successfully"
}
```

### Update Task
**PUT** `/tasks/:id`  
🔒 Requires authentication

**Request Body:**
```json
{
  "taskName": "Updated task name",
  "estimatedHours": 48,
  "verifiedCost": 18000
}
```

**Response:**
```json
{
  "task": { /* updated task object */ },
  "message": "Task updated successfully"
}
```

### Delete Task
**DELETE** `/tasks/:id`  
🔒 Requires authentication

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

### Sync Tasks (Batch Update)
**POST** `/tasks/sync`  
🔒 Requires authentication

**Request Body:**
```json
{
  "tasks": [
    { /* task 1 */ },
    { /* task 2 */ }
  ]
}
```

**Response:**
```json
{
  "message": "Tasks synced successfully",
  "count": 2
}
```

---

## 🧩 Task Elements (Subtasks)

### Get Task Elements
**GET** `/tasks/:taskId/elements`  
🔒 Requires authentication

**Response:**
```json
{
  "elements": [
    {
      "id": "element-uuid",
      "title": "Database Schema Design",
      "description": "Design normalized schema with relationships",
      "category": "Development",
      "estimatedHours": 8,
      "status": "pending",
      "assignedTo": null
    }
  ]
}
```

### Save Task Elements
**POST** `/tasks/:taskId/elements`  
🔒 Requires authentication

**Request Body:**
```json
{
  "elements": [
    {
      "id": "element-uuid",
      "title": "Authentication Flow",
      "description": "Implement OAuth flow",
      "category": "Development",
      "estimatedHours": 12
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "elements": [ /* saved elements */ ]
}
```

### Update Single Element
**PUT** `/tasks/:taskId/elements/:elementId`  
🔒 Requires authentication

**Request Body:**
```json
{
  "title": "Updated title",
  "status": "completed",
  "estimatedHours": 10
}
```

**Response:**
```json
{
  "success": true,
  "element": { /* updated element */ }
}
```

### Delete Element
**DELETE** `/tasks/:taskId/elements/:elementId`  
🔒 Requires authentication

**Response:**
```json
{
  "success": true
}
```

---

## 📁 Projects

### Get All Projects
**GET** `/projects`  
🔒 Requires authentication

**Response:**
```json
{
  "projects": [
    {
      "id": "project-uuid",
      "name": "E-commerce Platform",
      "description": "Build full-stack e-commerce app",
      "color": "#2BBBEF",
      "isArchived": false,
      "archivedAt": null,
      "taskCount": 25,
      "totalPCI": 450.5,
      "totalCost": 75000,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create Project
**POST** `/projects`  
🔒 Requires authentication

**Request Body:**
```json
{
  "name": "Mobile Banking App",
  "description": "iOS and Android banking application",
  "color": "#4AFFA8"
}
```

**Response:**
```json
{
  "project": { /* project object */ }
}
```

### Update Project
**PUT** `/projects/:id`  
🔒 Requires authentication

Supports archiving/unarchiving via `isArchived` field.

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "isArchived": true,
  "archivedAt": "2024-01-20T15:00:00Z"
}
```

**Response:**
```json
{
  "project": { /* updated project */ }
}
```

### Delete Project
**DELETE** `/projects/:id`  
🔒 Requires authentication

Permanently deletes project and associated tasks.

**Response:**
```json
{
  "success": true
}
```

### Get Project Tasks
**GET** `/projects/:id/tasks`  
🔒 Requires authentication

**Response:**
```json
{
  "tasks": [ /* array of tasks */ ]
}
```

### Save Project Tasks
**POST** `/projects/:id/tasks`  
🔒 Requires authentication

**Request Body:**
```json
{
  "tasks": [ /* array of tasks */ ]
}
```

**Response:**
```json
{
  "success": true,
  "project": { /* updated project with new totals */ }
}
```

---

## 📊 Scope Versioning

### Get All Versions
**GET** `/projects/:projectId/versions`  
🔒 Requires authentication

**Response:**
```json
{
  "versions": [
    {
      "id": "version-uuid",
      "versionName": "Version 1.0 - Initial Scope",
      "description": "Original project scope before client changes",
      "tasks": [ /* snapshot of tasks at this version */ ],
      "createdAt": "2024-01-10T09:00:00Z",
      "createdBy": "user@example.com"
    }
  ]
}
```

### Create Version Snapshot
**POST** `/projects/:projectId/versions`  
🔒 Requires authentication

**Request Body:**
```json
{
  "versionName": "Version 2.0 - Expanded Scope",
  "description": "Added payment processing and admin dashboard",
  "tasks": [ /* current task snapshot */ ]
}
```

**Response:**
```json
{
  "success": true,
  "version": { /* created version */ }
}
```

### Get Specific Version
**GET** `/projects/:projectId/versions/:versionId`  
🔒 Requires authentication

**Response:**
```json
{
  "version": {
    "id": "version-uuid",
    "versionName": "Version 1.0",
    "tasks": [ /* task snapshot */ ],
    "createdAt": "2024-01-10T09:00:00Z"
  }
}
```

---

## 💬 Comments & Notes

### Get Task Comments
**GET** `/tasks/:taskId/comments`  
🔒 Requires authentication

**Response:**
```json
{
  "comments": [
    {
      "id": "comment-uuid",
      "text": "This task needs additional security review",
      "type": "alert",
      "author": "user@example.com",
      "createdAt": "2024-01-15T14:30:00Z"
    }
  ]
}
```

### Add Comment
**POST** `/tasks/:taskId/comments`  
🔒 Requires authentication

**Request Body:**
```json
{
  "text": "Reduced complexity after team discussion",
  "type": "note"
}
```

**Types:** `note`, `review`, `question`, `alert`

**Response:**
```json
{
  "success": true,
  "comment": { /* created comment */ }
}
```

### Delete Comment
**DELETE** `/tasks/:taskId/comments/:commentId`  
🔒 Requires authentication

**Response:**
```json
{
  "success": true
}
```

---

## 📄 Proposals

### Get All Proposals
**GET** `/proposals`  
🔒 Requires authentication

**Response:**
```json
{
  "proposals": [
    {
      "id": "proposal-uuid",
      "projectName": "E-commerce Platform",
      "content": "## Executive Summary\n...",
      "totalCost": 125000,
      "timeline": "3-4 months",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Create/Save Proposal
**POST** `/proposals`  
🔒 Requires authentication

**Request Body:**
```json
{
  "projectName": "Mobile Banking App",
  "content": "## Executive Summary\nThis proposal outlines...",
  "totalCost": 200000,
  "timeline": "6 months",
  "tasks": [ /* associated tasks */ ]
}
```

**Response:**
```json
{
  "success": true,
  "proposal": { /* saved proposal */ }
}
```

### Get Specific Proposal
**GET** `/proposals/:id`  
🔒 Requires authentication

**Response:**
```json
{
  "proposal": { /* proposal object */ }
}
```

### Delete Proposal
**DELETE** `/proposals/:id`  
🔒 Requires authentication

**Response:**
```json
{
  "success": true
}
```

---

## ⚙️ User Preferences

### Get Preferences
**GET** `/user/preferences`  
🔒 Requires authentication

**Response:**
```json
{
  "preferences": {
    "theme": "dark",
    "language": "en",
    "autoSave": true,
    "notifications": true,
    "compactView": false,
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### Update Preferences
**PUT** `/user/preferences`  
🔒 Requires authentication

**Request Body:**
```json
{
  "theme": "light",
  "language": "es",
  "autoSave": true
}
```

**Response:**
```json
{
  "success": true,
  "preferences": { /* updated preferences */ }
}
```

**Supported Languages:** `en`, `es`, `fr`, `de`, `pt`, `zh`, `ja`

---

## ✓ Verification Tracking

### Get Task Verification
**GET** `/tasks/:taskId/verification`  
🔒 Requires authentication

**Response:**
```json
{
  "verification": {
    "taskId": "task-uuid",
    "status": "verified",
    "badge": "gold",
    "confidence": 95,
    "verifiedAt": "2024-01-15T14:00:00Z",
    "verifiedBy": "user@example.com"
  }
}
```

### Save Verification
**POST** `/tasks/:taskId/verification`  
🔒 Requires authentication

**Request Body:**
```json
{
  "status": "verified",
  "badge": "platinum",
  "confidence": 98,
  "notes": "All PCI factors validated and cross-checked"
}
```

**Badge Levels:** `bronze`, `silver`, `gold`, `platinum`

**Response:**
```json
{
  "success": true,
  "verification": { /* verification object */ }
}
```

---

## 📜 Audit Logs

### Get All Audit Logs
**GET** `/audit-logs`  
🔒 Requires authentication

Returns all audit logs for the user, sorted by most recent.

**Response:**
```json
{
  "logs": [
    {
      "id": "audit-uuid",
      "userId": "user-uuid",
      "action": "update",
      "entityType": "task",
      "entityId": "task-uuid",
      "changes": {
        "before": { /* previous state */ },
        "after": { /* new state */ }
      },
      "metadata": {},
      "timestamp": "2024-01-15T14:30:00Z"
    }
  ]
}
```

### Get Entity-Specific Logs
**GET** `/audit-logs/:entityType/:entityId`  
🔒 Requires authentication

**Example:** `/audit-logs/task/task-uuid-123`

**Response:**
```json
{
  "logs": [ /* filtered audit logs for this entity */ ]
}
```

**Entity Types:** `task`, `project`, `settings`, `comment`, `version`, `proposal`

---

## 🎛️ Settings

### Get User Settings
**GET** `/settings`  
🔒 Requires authentication

**Response:**
```json
{
  "settings": {
    "hourlyRate": 150,
    "unitToHourRatio": 1.5,
    "currency": "USD",
    "industryPreset": "enterprise",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### Update Settings
**PUT** `/settings`  
🔒 Requires authentication

**Request Body:**
```json
{
  "hourlyRate": 175,
  "currency": "EUR",
  "industryPreset": "healthcare"
}
```

**Response:**
```json
{
  "settings": { /* updated settings */ },
  "message": "Settings updated successfully"
}
```

---

## 🤖 AI Services

### Analyze Task
**POST** `/ai/analyze-task`

Analyzes task description and suggests PCI factors.

**Request Body:**
```json
{
  "description": "Build a real-time chat system with end-to-end encryption"
}
```

**Response:**
```json
{
  "task": {
    "taskName": "Build a real-time chat system",
    "ISR": 8,
    "CF": 7.5,
    "UXI": 9,
    "RCF": 8.5,
    "AEP": 15,
    "L": 4,
    "MLW": 6,
    "CGW": 7,
    "RF": 8,
    "S": 8.5,
    "GLRI": 7,
    "aiVerifiedUnits": 85.3
  },
  "message": "Task analyzed successfully",
  "confidence": 0.85
}
```

### AI Chat
**POST** `/ai/chat`

Conversational AI for project insights.

**Request Body:**
```json
{
  "message": "What's my average accuracy score?",
  "tasks": [ /* current tasks */ ]
}
```

**Response:**
```json
{
  "response": "Your average AI Accuracy Score is 92.3%. Great job!",
  "timestamp": "2024-01-15T14:45:00Z"
}
```

### Verify Task
**POST** `/ai/verify-task`

Deep analysis and verification of task pricing.

**Request Body:**
```json
{
  "task": { /* complete task object */ }
}
```

**Response:**
```json
{
  "verification": {
    "overview": "This task represents a high complexity security implementation...",
    "reasoning": [
      {
        "category": "Scope & Complexity",
        "factors": ["ISR (9): High initial scope complexity"],
        "impact": "Combined scope complexity contributes 65.2 units"
      }
    ],
    "confidence": 95,
    "recommendations": ["✅ Task pricing appears well-calibrated"]
  }
}
```

### Generate Task Elements
**POST** `/ai/generate-task-elements`

Auto-generates subtask breakdown.

**Request Body:**
```json
{
  "task": {
    "taskName": "User Authentication System",
    "ISR": 8,
    "CF": 7,
    /* other PCI factors */
  }
}
```

**Response:**
```json
{
  "elements": [
    {
      "id": "element-uuid",
      "title": "Authentication Flow Design",
      "description": "Design secure auth flows with OAuth and JWT",
      "category": "Development"
    }
  ],
  "count": 4
}
```

### Enhance Task Elements
**POST** `/ai/enhance-task-elements`

Adds detail to existing task elements.

**Request Body:**
```json
{
  "task": {
    "taskElements": [ /* existing elements */ ],
    "CF": 2.5,
    "RCF": 1.8
  }
}
```

**Response:**
```json
{
  "elements": [ /* enhanced elements with more detail */ ],
  "count": 6
}
```

### Generate Project
**POST** `/ai/generate-project`

Creates complete project with tasks from description.

**Request Body:**
```json
{
  "description": "Build a SaaS platform for project management with Kanban boards, time tracking, and team collaboration features"
}
```

**Response:**
```json
{
  "project": {
    "name": "Project Management SaaS",
    "description": "Build a SaaS platform for project management...",
    "color": "#95E1D3",
    "tasks": [ /* array of generated tasks */ ],
    "estimatedCost": 185000,
    "estimatedDuration": "4+ months"
  }
}
```

---

## 🔑 Key Features

### Verified Cost Override
When creating or updating tasks via CSV import or API, you can provide a `verifiedCost` field:

```json
{
  "taskName": "Payment Integration",
  "verifiedCost": 15000,
  "estimatedHours": 100,
  "costRate": 150
}
```

The system will **reverse-calculate** PCI Units based on:
- `Verified Units = verifiedCost / costRate`
- Maintains audit trail while giving manual cost control

### Auto-Save
Enable in user preferences:
```json
{
  "autoSave": true
}
```

### Multi-Language Support
Set language preference (affects frontend localization):
```json
{
  "language": "es"
}
```

### Theme Support
```json
{
  "theme": "dark"
}
```

---

## ⚠️ Error Responses

All endpoints return standard error format:

```json
{
  "error": "Descriptive error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (missing/invalid auth token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## 🚀 Rate Limiting

Currently no rate limiting implemented. Consider adding in production.

---

## 📝 Notes for Developers

1. **Authentication:** All routes except `/auth/signup` require Bearer token
2. **Data Isolation:** All data is automatically scoped to authenticated user
3. **Audit Trail:** Most mutations automatically create audit log entries
4. **Timestamps:** All entities have `createdAt` and `updatedAt` ISO timestamps
5. **UUIDs:** Use `crypto.randomUUID()` for generating IDs
6. **Verified Cost:** Optional field for manual cost override in tasks
7. **PCI Calculation:** `(ISR * CF * UXI) + (RCF * AEP - L) + (MLW * CGW * RF) + (S * GLRI)`

---

## 📞 Support

For questions or issues with the backend API, contact the FRContent / Plataforma Technologies development team.

**Last Updated:** January 2024  
**API Version:** 2.0

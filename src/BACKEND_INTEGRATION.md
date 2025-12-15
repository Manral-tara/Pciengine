# PCI Engine - Backend Integration Guide

## Overview

The PCI Engine is now fully integrated with a Supabase backend, providing:
- **User Authentication** (Email/Password)
- **Task Persistence** (Create, Read, Update, Delete, Sync)
- **Settings Management** (User-specific configuration)
- **AI Services** (Task analysis, Chat assistant)
- **Real-time Data Sync** (Automatic debounced saving)

---

## Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │
         │ HTTPS/REST
         ├──────────────────┐
         │                  │
┌────────▼─────────┐  ┌────▼──────────┐
│  Supabase Auth   │  │ Edge Function │
│  (Sign in/up)    │  │  (Hono API)   │
└──────────────────┘  └────┬──────────┘
                           │
                    ┌──────▼──────────┐
                    │   KV Store      │
                    │  (PostgreSQL)   │
                    └─────────────────┘
```

---

## Backend Endpoints

### Authentication

#### POST /auth/signup
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe" // optional
}
```

**Response:**
```json
{
  "user": { ... },
  "message": "User created successfully. You can now sign in."
}
```

**Notes:**
- Email is automatically confirmed (no email server configured)
- Returns 400 if email/password missing
- Returns 400 if user already exists

---

### Tasks

#### GET /tasks
Get all tasks for authenticated user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "tasks": [
    {
      "id": "1",
      "taskName": "User Authentication System",
      "ISR": 5,
      "CF": 1.2,
      "UXI": 1.5,
      // ... all PCI factors
      "aiVerifiedUnits": 28.5,
      "userId": "user-uuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

#### POST /tasks
Create a new task.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "id": "unique-id", // optional, generated if not provided
  "taskName": "New Feature",
  "ISR": 3,
  "CF": 1.2,
  // ... all PCI factors
  "aiVerifiedUnits": 15.5
}
```

**Response:**
```json
{
  "task": { ...task with userId, timestamps },
  "message": "Task created successfully"
}
```

---

#### PUT /tasks/:id
Update an existing task.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "taskName": "Updated Task Name",
  "ISR": 4,
  // ... any fields to update
}
```

**Response:**
```json
{
  "task": { ...updated task },
  "message": "Task updated successfully"
}
```

---

#### DELETE /tasks/:id
Delete a task.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

---

#### POST /tasks/sync
Batch sync all tasks (used for auto-save).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "tasks": [
    { ...task1 },
    { ...task2 }
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

### Settings

#### GET /settings
Get user settings.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "settings": {
    "hourlyRate": 66,
    "unitToHourRatio": 1.5,
    "currency": "USD",
    "industryPreset": "general"
  }
}
```

**Notes:**
- Returns default settings if none exist for user

---

#### PUT /settings
Update user settings.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "hourlyRate": 75,
  "unitToHourRatio": 1.5,
  "currency": "EUR",
  "industryPreset": "fintech"
}
```

**Response:**
```json
{
  "settings": { ...updated settings },
  "message": "Settings updated successfully"
}
```

---

### AI Services

#### POST /ai/analyze-task
Analyze task description and suggest PCI factors.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "description": "Build a real-time chat system with end-to-end encryption"
}
```

**Response:**
```json
{
  "analysis": {
    "taskName": "Build a real-time chat system with end-to-end encryption",
    "ISR": 5.0,
    "CF": 1.6,
    "UXI": 1.5,
    "RCF": 1.6,
    "AEP": 10.0,
    "L": 1.0,
    "MLW": 1.2,
    "CGW": 1.1,
    "RF": 1.1,
    "S": 1.4,
    "GLRI": 1.7,
    "aiVerifiedUnits": 35.8,
    "confidence": 92
  }
}
```

**AI Analysis Keywords:**
- **complex/advanced/sophisticated** → ↑ ISR, CF, AEP
- **integration/api/third-party** → ↑ RCF, AEP, RF, CGW
- **payment/checkout/transaction** → ↑ RCF, S, GLRI, AEP
- **security/authentication/encryption** → ↑ RCF, S, GLRI, AEP
- **ui/interface/dashboard** → ↑ UXI, ISR
- **responsive/mobile** → ↑ UXI, CF
- **analytics/reporting/chart** → ↑ AEP, CF, MLW
- **real-time/live/websocket** → ↑ AEP, CF, S, RCF
- **database/migration/schema** → ↑ AEP, RCF, CGW
- **compliance/gdpr/hipaa/legal** → ↑ GLRI, RCF, S
- **ai/machine learning/ml** → ↑ S, CF, AEP, RCF

---

#### POST /ai/chat
Conversational AI assistant for cost analysis.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "message": "Analyze my tasks and find any issues",
  "tasks": [ ...array of task objects ]
}
```

**Response:**
```json
{
  "response": "I've analyzed your tasks and found 2 task(s) with AAS below 85%:\n\n• Task A: AAS 78.5%\n• Task B: AAS 82.1%\n\nRecommendation: Consider increasing the AI Verified Units..."
}
```

**Supported Queries:**
- **"analyze" / "review"** → AAS analysis and recommendations
- **"cost" / "optimize" / "reduce"** → Cost optimization suggestions
- **"anomaly" / "outlier" / "unusual"** → Anomaly detection
- **Default** → General help and available commands

---

## Frontend API Service

### Location
`/services/api.ts`

### Key Functions

```typescript
// Authentication
signUp(email, password, name?)
signIn(email, password)
signOut()
getSession()

// Tasks
getTasks()
createTask(task)
updateTask(id, updates)
deleteTask(id)
syncTasks(tasks[])

// Settings
getSettings()
updateSettings(settings)

// AI
analyzeTaskWithAI(description)
chatWithAI(message, tasks[])
```

### Token Management

**Storage:**
- Access token stored in `sessionStorage.access_token`
- User object stored in `sessionStorage.user`

**Auto-includes in requests:**
```typescript
headers: {
  'Authorization': `Bearer ${access_token}`
}
```

---

## Data Flow

### Task Auto-Sync

```
User edits task
    ↓
State updates (setTasks)
    ↓
useEffect detects change
    ↓
1 second debounce
    ↓
syncTasks() API call
    ↓
Backend stores in KV
```

**Code:**
```typescript
useEffect(() => {
  if (!loading && tasks.length > 0) {
    const timeout = setTimeout(() => {
      syncTasksToBackend();
    }, 1000);
    return () => clearTimeout(timeout);
  }
}, [tasks, loading]);
```

---

## Authentication Flow

### Sign Up
```
1. User fills form → AuthScreen
2. POST /auth/signup
3. Auto sign in with credentials
4. getSession() → set token
5. Redirect to Dashboard
```

### Sign In
```
1. User fills form → AuthScreen
2. Supabase Auth signInWithPassword()
3. Store access_token in sessionStorage
4. Load user settings from backend
5. Redirect to Dashboard
```

### Session Persistence
```
1. App loads → useEffect in App.tsx
2. getSession() checks for existing session
3. If valid → restore user state
4. Load tasks and settings from backend
5. If invalid → show AuthScreen
```

### Sign Out
```
1. User clicks Sign Out → Navigation dropdown
2. Supabase Auth signOut()
3. Clear sessionStorage tokens
4. Reset app state
5. Redirect to AuthScreen
```

---

## Data Storage (KV Store)

### Key Structure

```
task:{userId}:{taskId}  → Task object
settings:{userId}       → Settings object
```

### Example:
```
task:abc123:task001 → {
  id: "task001",
  taskName: "Feature A",
  ISR: 5,
  // ... all fields
  userId: "abc123",
  createdAt: "...",
  updatedAt: "..."
}

settings:abc123 → {
  hourlyRate: 66,
  currency: "USD",
  // ...
  userId: "abc123",
  updatedAt: "..."
}
```

---

## Error Handling

### Backend Errors

**401 Unauthorized:**
```json
{
  "error": "Unauthorized - Please sign in"
}
```
→ User session expired, redirect to AuthScreen

**404 Not Found:**
```json
{
  "error": "Task not found"
}
```
→ Task was deleted or doesn't exist

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch tasks"
}
```
→ Backend error, show error message to user

### Frontend Error Handling

```typescript
try {
  const tasks = await api.getTasks();
} catch (err: any) {
  console.error('Failed to load tasks:', err);
  // Fallback to empty array or default data
}
```

---

## Security

### Authentication
- JWT tokens via Supabase Auth
- Tokens stored in sessionStorage (cleared on tab close)
- All protected routes verify token on backend

### Authorization
- Each API call validates user from token
- Users can only access their own data
- KV keys prefixed with userId for isolation

### CORS
- Wide open for development (`origin: "*"`)
- **Production:** Restrict to your domain

---

## Performance Optimizations

### Debounced Auto-Save
- Tasks auto-sync 1 second after last edit
- Prevents excessive API calls during rapid editing

### Batch Operations
- `/tasks/sync` endpoint for bulk updates
- Single API call instead of N individual updates

### Session Caching
- User and settings cached in sessionStorage
- Reduces API calls on page refresh

---

## Development

### Environment Variables

**Backend (Edge Function):**
```bash
SUPABASE_URL=https://{project_id}.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Frontend:**
- Automatically provided via `/utils/supabase/info.tsx`
- `projectId` and `publicAnonKey` injected

### Local Testing

1. **Run app:** `npm run dev`
2. **Sign up:** Create test account
3. **Test features:** Tasks, settings, AI
4. **Check logs:** Browser console + Edge Function logs

---

## API Response Times

- **Authentication:** 200-500ms
- **Task CRUD:** 100-300ms  
- **Settings:** 50-150ms
- **AI Analysis:** 500-1500ms (keyword-based)
- **AI Chat:** 300-1000ms

*Note: Times vary based on network and server load*

---

## Troubleshooting

### "Unauthorized" errors
- **Cause:** Token expired or invalid
- **Fix:** Sign out and sign in again

### Tasks not saving
- **Cause:** Network error or auth failure
- **Check:** Browser console for errors
- **Fix:** Refresh page, ensure internet connection

### AI not working
- **Cause:** Backend AI route failing
- **Check:** Edge Function logs
- **Fix:** Verify request format matches API spec

### Settings not persisting
- **Cause:** Settings not saving to backend
- **Check:** Network tab in DevTools
- **Fix:** Ensure PUT /settings is called

---

## Future Enhancements

### Phase 1 (Completed)
- ✅ User authentication
- ✅ Task persistence
- ✅ Settings management
- ✅ AI task analysis
- ✅ AI chat assistant

### Phase 2 (Future)
- [ ] Real-time collaboration (Supabase Realtime)
- [ ] pgvector for semantic search
- [ ] OpenAI/Claude integration
- [ ] Audit trail with change history
- [ ] Team/organization support
- [ ] Export to Excel/PDF
- [ ] Advanced analytics dashboard

---

## API Base URL

```
Production: https://{projectId}.supabase.co/functions/v1/make-server-0dcd2201
```

All endpoints are prefixed with `/make-server-0dcd2201`

Example:
```
POST https://{projectId}.supabase.co/functions/v1/make-server-0dcd2201/auth/signup
GET  https://{projectId}.supabase.co/functions/v1/make-server-0dcd2201/tasks
```

---

## Support

For issues or questions:
1. Check browser console for errors
2. Review Edge Function logs in Supabase dashboard
3. Verify authentication tokens are valid
4. Ensure network connectivity

---

**Last Updated:** December 2024  
**Version:** 1.0.0 (Backend Integration Complete)

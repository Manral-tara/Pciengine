import { Hono } from "npm:hono";

// Helper function to verify auth (will be passed in)
export function registerNewRoutes(app: Hono, verifyAuth: any, kv: any, createAuditLog: any) {

// ============================================
// TASK ELEMENTS (SUBTASKS) ROUTES
// ============================================

// Get task elements for a specific task
app.get('/make-server-0dcd2201/tasks/:taskId/elements', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const taskId = c.req.param('taskId');
    const elements = await kv.get(`task_elements:${user.id}:${taskId}`) || [];
    
    return c.json({ elements });
  } catch (error) {
    console.error('Error fetching task elements:', error);
    return c.json({ error: 'Failed to fetch task elements' }, 500);
  }
});

// Save task elements for a specific task
app.post('/make-server-0dcd2201/tasks/:taskId/elements', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const taskId = c.req.param('taskId');
    const { elements } = await c.req.json();
    
    await kv.set(`task_elements:${user.id}:${taskId}`, elements);
    
    // Create audit log
    await createAuditLog(user.id, 'update', 'task_elements', taskId, {
      action: 'saved_elements',
      elementCount: elements.length
    });
    
    return c.json({ success: true, elements });
  } catch (error) {
    console.error('Error saving task elements:', error);
    return c.json({ error: 'Failed to save task elements' }, 500);
  }
});

// Update a single task element
app.put('/make-server-0dcd2201/tasks/:taskId/elements/:elementId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const taskId = c.req.param('taskId');
    const elementId = c.req.param('elementId');
    const updates = await c.req.json();
    
    const elements = await kv.get(`task_elements:${user.id}:${taskId}`) || [];
    const elementIndex = elements.findIndex((el: any) => el.id === elementId);
    
    if (elementIndex === -1) {
      return c.json({ error: 'Element not found' }, 404);
    }
    
    elements[elementIndex] = { ...elements[elementIndex], ...updates };
    await kv.set(`task_elements:${user.id}:${taskId}`, elements);
    
    return c.json({ success: true, element: elements[elementIndex] });
  } catch (error) {
    console.error('Error updating task element:', error);
    return c.json({ error: 'Failed to update task element' }, 500);
  }
});

// Delete a task element
app.delete('/make-server-0dcd2201/tasks/:taskId/elements/:elementId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const taskId = c.req.param('taskId');
    const elementId = c.req.param('elementId');
    
    const elements = await kv.get(`task_elements:${user.id}:${taskId}`) || [];
    const filteredElements = elements.filter((el: any) => el.id !== elementId);
    
    await kv.set(`task_elements:${user.id}:${taskId}`, filteredElements);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting task element:', error);
    return c.json({ error: 'Failed to delete task element' }, 500);
  }
});

// ============================================
// SCOPE VERSIONING ROUTES
// ============================================

// Get all versions for a project
app.get('/make-server-0dcd2201/projects/:projectId/versions', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const projectId = c.req.param('projectId');
    const versions = await kv.get(`project_versions:${user.id}:${projectId}`) || [];
    
    return c.json({ versions });
  } catch (error) {
    console.error('Error fetching project versions:', error);
    return c.json({ error: 'Failed to fetch versions' }, 500);
  }
});

// Create a new version snapshot
app.post('/make-server-0dcd2201/projects/:projectId/versions', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const projectId = c.req.param('projectId');
    const { versionName, description, tasks } = await c.req.json();
    
    const versions = await kv.get(`project_versions:${user.id}:${projectId}`) || [];
    
    const newVersion = {
      id: crypto.randomUUID(),
      versionName: versionName || `Version ${versions.length + 1}`,
      description: description || '',
      tasks: tasks || [],
      createdAt: new Date().toISOString(),
      createdBy: user.email || user.id,
    };
    
    versions.push(newVersion);
    await kv.set(`project_versions:${user.id}:${projectId}`, versions);
    
    // Create audit log
    await createAuditLog(user.id, 'create', 'version', newVersion.id, {
      projectId,
      versionName: newVersion.versionName,
      taskCount: tasks?.length || 0
    });
    
    return c.json({ success: true, version: newVersion });
  } catch (error) {
    console.error('Error creating version:', error);
    return c.json({ error: 'Failed to create version' }, 500);
  }
});

// Get a specific version
app.get('/make-server-0dcd2201/projects/:projectId/versions/:versionId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const projectId = c.req.param('projectId');
    const versionId = c.req.param('versionId');
    
    const versions = await kv.get(`project_versions:${user.id}:${projectId}`) || [];
    const version = versions.find((v: any) => v.id === versionId);
    
    if (!version) {
      return c.json({ error: 'Version not found' }, 404);
    }
    
    return c.json({ version });
  } catch (error) {
    console.error('Error fetching version:', error);
    return c.json({ error: 'Failed to fetch version' }, 500);
  }
});

// ============================================
// COMMENTS/NOTES ROUTES
// ============================================

// Get comments for a task
app.get('/make-server-0dcd2201/tasks/:taskId/comments', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const taskId = c.req.param('taskId');
    const comments = await kv.get(`comments:${user.id}:task:${taskId}`) || [];
    
    return c.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return c.json({ error: 'Failed to fetch comments' }, 500);
  }
});

// Add a comment to a task
app.post('/make-server-0dcd2201/tasks/:taskId/comments', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const taskId = c.req.param('taskId');
    const { text, type } = await c.req.json();
    
    if (!text) {
      return c.json({ error: 'Comment text is required' }, 400);
    }
    
    const comments = await kv.get(`comments:${user.id}:task:${taskId}`) || [];
    
    const newComment = {
      id: crypto.randomUUID(),
      text,
      type: type || 'note', // 'note', 'review', 'question', 'alert'
      author: user.email || user.id,
      createdAt: new Date().toISOString(),
    };
    
    comments.push(newComment);
    await kv.set(`comments:${user.id}:task:${taskId}`, comments);
    
    // Create audit log
    await createAuditLog(user.id, 'create', 'comment', newComment.id, {
      taskId,
      commentType: type || 'note'
    });
    
    return c.json({ success: true, comment: newComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    return c.json({ error: 'Failed to add comment' }, 500);
  }
});

// Delete a comment
app.delete('/make-server-0dcd2201/tasks/:taskId/comments/:commentId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const taskId = c.req.param('taskId');
    const commentId = c.req.param('commentId');
    
    const comments = await kv.get(`comments:${user.id}:task:${taskId}`) || [];
    const filteredComments = comments.filter((c: any) => c.id !== commentId);
    
    await kv.set(`comments:${user.id}:task:${taskId}`, filteredComments);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return c.json({ error: 'Failed to delete comment' }, 500);
  }
});

// ============================================
// PROPOSALS ROUTES
// ============================================

// Get all proposals for user
app.get('/make-server-0dcd2201/proposals', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const proposals = await kv.getByPrefix(`proposal:${user.id}:`);
    const validProposals = proposals.map(p => p.value).filter(p => p != null);
    
    return c.json({ proposals: validProposals });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return c.json({ error: 'Failed to fetch proposals' }, 500);
  }
});

// Create/save a proposal
app.post('/make-server-0dcd2201/proposals', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const proposalData = await c.req.json();
    const proposalId = proposalData.id || crypto.randomUUID();
    
    const proposal = {
      ...proposalData,
      id: proposalId,
      userId: user.id,
      createdAt: proposalData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`proposal:${user.id}:${proposalId}`, proposal);
    
    // Create audit log
    await createAuditLog(user.id, 'create', 'proposal', proposalId, {
      projectName: proposal.projectName
    });
    
    return c.json({ success: true, proposal });
  } catch (error) {
    console.error('Error saving proposal:', error);
    return c.json({ error: 'Failed to save proposal' }, 500);
  }
});

// Get a specific proposal
app.get('/make-server-0dcd2201/proposals/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const proposalId = c.req.param('id');
    const proposal = await kv.get(`proposal:${user.id}:${proposalId}`);
    
    if (!proposal) {
      return c.json({ error: 'Proposal not found' }, 404);
    }
    
    return c.json({ proposal });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return c.json({ error: 'Failed to fetch proposal' }, 500);
  }
});

// Delete a proposal
app.delete('/make-server-0dcd2201/proposals/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const proposalId = c.req.param('id');
    await kv.del(`proposal:${user.id}:${proposalId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return c.json({ error: 'Failed to delete proposal' }, 500);
  }
});

// ============================================
// USER PREFERENCES ROUTES
// ============================================

// Get user preferences
app.get('/make-server-0dcd2201/user/preferences', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const preferences = await kv.get(`preferences:${user.id}`);
    
    // Return default preferences if none exist
    if (!preferences) {
      const defaultPreferences = {
        theme: 'light',
        language: 'en',
        autoSave: true,
        notifications: true,
        compactView: false,
      };
      return c.json({ preferences: defaultPreferences });
    }
    
    return c.json({ preferences });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return c.json({ error: 'Failed to fetch preferences' }, 500);
  }
});

// Update user preferences
app.put('/make-server-0dcd2201/user/preferences', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const updates = await c.req.json();
    
    const existingPreferences = await kv.get(`preferences:${user.id}`) || {};
    const preferences = {
      ...existingPreferences,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`preferences:${user.id}`, preferences);
    
    return c.json({ success: true, preferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return c.json({ error: 'Failed to update preferences' }, 500);
  }
});

// ============================================
// VERIFICATION TRACKING ROUTES
// ============================================

// Get verification status for a task
app.get('/make-server-0dcd2201/tasks/:taskId/verification', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const taskId = c.req.param('taskId');
    const verification = await kv.get(`verification:${user.id}:${taskId}`);
    
    return c.json({ verification: verification || null });
  } catch (error) {
    console.error('Error fetching verification:', error);
    return c.json({ error: 'Failed to fetch verification' }, 500);
  }
});

// Save verification status for a task
app.post('/make-server-0dcd2201/tasks/:taskId/verification', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const taskId = c.req.param('taskId');
    const verificationData = await c.req.json();
    
    const verification = {
      ...verificationData,
      taskId,
      userId: user.id,
      verifiedAt: new Date().toISOString(),
      verifiedBy: user.email || user.id,
    };
    
    await kv.set(`verification:${user.id}:${taskId}`, verification);
    
    // Create audit log
    await createAuditLog(user.id, 'verify', 'task', taskId, {
      status: verificationData.status,
      badge: verificationData.badge
    });
    
    return c.json({ success: true, verification });
  } catch (error) {
    console.error('Error saving verification:', error);
    return c.json({ error: 'Failed to save verification' }, 500);
  }
});

// ============================================
// AUDIT LOG ROUTES
// ============================================

// Get audit logs for user
app.get('/make-server-0dcd2201/audit-logs', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const logs = await kv.getByPrefix(`audit:${user.id}:`);
    const validLogs = logs
      .map(l => l.value)
      .filter(log => log != null)
      .sort((a: any, b: any) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    
    return c.json({ logs: validLogs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return c.json({ error: 'Failed to fetch audit logs' }, 500);
  }
});

// Get audit logs for a specific entity
app.get('/make-server-0dcd2201/audit-logs/:entityType/:entityId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const entityType = c.req.param('entityType');
    const entityId = c.req.param('entityId');
    
    const allLogs = await kv.getByPrefix(`audit:${user.id}:`);
    const entityLogs = allLogs
      .map(l => l.value)
      .filter((log: any) => 
        log != null && 
        log.entityType === entityType && 
        log.entityId === entityId
      )
      .sort((a: any, b: any) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    
    return c.json({ logs: entityLogs });
  } catch (error) {
    console.error('Error fetching entity audit logs:', error);
    return c.json({ error: 'Failed to fetch audit logs' }, 500);
  }
});

}

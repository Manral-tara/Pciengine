import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '../utils/supabase/client';
import type { Task } from '../components/TaskTable';
import type { Settings } from '../App';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0dcd2201`;

// Get auth token from sessionStorage
function getAuthToken(): string | null {
  return sessionStorage.getItem('access_token');
}

// Set auth token in sessionStorage
export function setAuthToken(token: string) {
  sessionStorage.setItem('access_token', token);
}

// Clear auth token
export function clearAuthToken() {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('user');
}

// Get stored user
export function getStoredUser() {
  const userStr = sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Set stored user
export function setStoredUser(user: any) {
  sessionStorage.setItem('user', JSON.stringify(user));
}

// Helper function for API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      console.error(`API request failed [${endpoint}]:`, errorMessage);
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error(`API request error [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================
// AUTHENTICATION API
// ============================================

export async function signUp(email: string, password: string, name?: string) {
  const data = await apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  if (!data.session) throw new Error('No session returned');

  setAuthToken(data.session.access_token);
  setStoredUser(data.user);
  
  return { user: data.user, session: data.session };
}

export async function signOut() {
  const supabase = createClient();

  await supabase.auth.signOut();
  clearAuthToken();
}

export async function getSession() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getSession();
  
  if (error) throw new Error(error.message);
  
  if (data.session) {
    setAuthToken(data.session.access_token);
    setStoredUser(data.session.user);
    return { user: data.session.user, session: data.session };
  }
  
  return { user: null, session: null };
}

// ============================================
// TASKS API
// ============================================

export async function getTasks(): Promise<Task[]> {
  const data = await apiRequest('/tasks');
  return data.tasks || [];
}

export async function createTask(task: Task): Promise<Task> {
  const data = await apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
  return data.task;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const data = await apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.task;
}

export async function deleteTask(id: string): Promise<void> {
  await apiRequest(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

export async function syncTasks(tasks: Task[]): Promise<void> {
  await apiRequest('/tasks/sync', {
    method: 'POST',
    body: JSON.stringify({ tasks }),
  });
}

// ============================================
// SETTINGS API
// ============================================

export async function getSettings(): Promise<Settings> {
  const data = await apiRequest('/settings');
  return data.settings;
}

export async function updateSettings(settings: Settings): Promise<Settings> {
  const data = await apiRequest('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
  return data.settings;
}

// ============================================
// AI API
// ============================================

export async function analyzeTaskWithAI(description: string): Promise<Omit<Task, 'id'>> {
  const data = await apiRequest('/ai/analyze-task', {
    method: 'POST',
    body: JSON.stringify({ description }),
  });
  return data.task;
}

export async function chatWithAI(message: string, tasks: Task[]): Promise<string> {
  const data = await apiRequest('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, tasks }),
  });
  return data.response;
}

export async function verifyTaskWithAI(task: Task): Promise<any> {
  const data = await apiRequest('/ai/verify-task', {
    method: 'POST',
    body: JSON.stringify({ task }),
  });
  return data.verification;
}

export async function generateProjectWithAI(description: string): Promise<any> {
  const data = await apiRequest('/ai/generate-project', {
    method: 'POST',
    body: JSON.stringify({ description }),
  });
  return data.project;
}

// Margin lock operations
export async function saveMarginData(projectId: string, marginData: any): Promise<void> {
  await apiRequest('/projects/margin', {
    method: 'POST',
    body: JSON.stringify({ projectId, marginData }),
  });
}

export async function getMarginData(projectId: string): Promise<any> {
  const data = await apiRequest(`/projects/margin/${projectId}`);
  return data.marginData;
}

// Task elements generation
export async function generateTaskElements(task: any): Promise<{ elements: any[] }> {
  const data = await apiRequest('/ai/generate-task-elements', {
    method: 'POST',
    body: JSON.stringify({ task }),
  });
  return data;
}

// Task elements enhancement (AI improve existing)
export async function enhanceTaskElements(task: any): Promise<{ elements: any[] }> {
  const data = await apiRequest('/ai/enhance-task-elements', {
    method: 'POST',
    body: JSON.stringify({ task }),
  });
  return data;
}

// ============================================
// AUDIT API
// ============================================

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: any;
  metadata?: any;
  timestamp: string;
}

export interface Flag {
  id: string;
  taskId: string;
  userId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolution?: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  createdAt: string;
}

// Get all audit logs
export async function getAuditLogs(): Promise<AuditLog[]> {
  const data = await apiRequest('/audit/logs');
  return data.logs || [];
}

// Get audit logs for specific entity
export async function getEntityAuditLogs(entityType: string, entityId: string): Promise<AuditLog[]> {
  const data = await apiRequest(`/audit/logs/${entityType}/${entityId}`);
  return data.logs || [];
}

// Flag task for review
export async function flagTask(taskId: string, reason: string, severity: 'low' | 'medium' | 'high'): Promise<Flag> {
  const data = await apiRequest('/audit/flag', {
    method: 'POST',
    body: JSON.stringify({ taskId, reason, severity }),
  });
  return data.flag;
}

// Get all flags
export async function getFlags(status?: 'open' | 'resolved' | 'dismissed'): Promise<Flag[]> {
  const endpoint = status ? `/audit/flags?status=${status}` : '/audit/flags';
  const data = await apiRequest(endpoint);
  return data.flags || [];
}

// Update flag
export async function updateFlag(flagId: string, status: string, resolution?: string): Promise<Flag> {
  const data = await apiRequest(`/audit/flags/${flagId}`, {
    method: 'PUT',
    body: JSON.stringify({ status, resolution }),
  });
  return data.flag;
}

// Add comment to task
export async function addComment(taskId: string, comment: string): Promise<Comment> {
  const data = await apiRequest('/audit/comments', {
    method: 'POST',
    body: JSON.stringify({ taskId, comment }),
  });
  return data.comment;
}

// Get comments for task
export async function getComments(taskId: string): Promise<Comment[]> {
  const data = await apiRequest(`/audit/comments/${taskId}`);
  return data.comments || [];
}

// Approve task
export async function approveTask(taskId: string, notes?: string): Promise<Task> {
  const data = await apiRequest('/audit/approve', {
    method: 'POST',
    body: JSON.stringify({ taskId, notes }),
  });
  return data.task;
}

// Reject task
export async function rejectTask(taskId: string, reason: string): Promise<Task> {
  const data = await apiRequest('/audit/reject', {
    method: 'POST',
    body: JSON.stringify({ taskId, reason }),
  });
  return data.task;
}

// ============================================
// REPORTING API
// ============================================

export interface ReportData {
  summary: {
    totalTasks: number;
    totalPCI: number;
    totalVerified: number;
    averageAAS: number;
    approvedTasks: number;
    rejectedTasks: number;
    pendingTasks: number;
    lowAASCount: number;
  };
  taskBreakdown: Array<{
    id: string;
    taskName: string;
    pci: number;
    aiVerifiedUnits: number;
    aas: number;
    verifiedUnits: number;
    auditStatus: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  categoryDistribution: {
    scopeComplexity: number;
    riskEngineering: number;
    multiLayer: number;
    specialtyGovernance: number;
  };
  auditMetrics?: {
    totalLogs: number;
    totalFlags: number;
    openFlags: number;
    resolvedFlags: number;
    recentActivity: any[];
  };
  generatedAt: string;
}

export interface TrendData {
  trends: Array<{
    period: string;
    tasks: number;
    pci: number;
    verified: number;
    aas: number;
    auditActivity: number;
  }>;
  period: string;
}

export interface KPIData {
  kpis: {
    totalTasks: number;
    totalPCI: number;
    totalVerified: number;
    averageAAS: number;
    approvedTasks: number;
    pendingTasks: number;
    rejectedTasks: number;
    totalAnomalies: number;
    totalLowAAS: number;
    approvalRate: number;
    auditActivity: number;
    openFlags: number;
    totalComments: number;
  };
}

// Generate comprehensive report
export async function generateReport(filters: {
  startDate?: string;
  endDate?: string;
  status?: string;
  includeAudit?: boolean;
}): Promise<ReportData> {
  const data = await apiRequest('/reports/generate', {
    method: 'POST',
    body: JSON.stringify(filters),
  });
  return data;
}

// Get trend data
export async function getTrends(period: 'week' | 'month' | 'quarter'): Promise<TrendData> {
  const data = await apiRequest('/reports/trends', {
    method: 'POST',
    body: JSON.stringify({ period }),
  });
  return data;
}

// Get KPI data
export async function getKPIs(): Promise<KPIData> {
  const data = await apiRequest('/reports/kpis');
  return data;
}

// Export report
export async function exportReport(format: string, filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<{ format: string; data: string; filename: string }> {
  const data = await apiRequest('/reports/export', {
    method: 'POST',
    body: JSON.stringify({ format, ...filters }),
  });
  return data;
}

// ============================================
// PROPOSAL BUILDER API
// ============================================

export interface ProposalGenerationRequest {
  clientName: string;
  projectTitle: string;
  projectType: string;
  industryContext: string;
  keyObjectives: string;
  timeline: string;
  budget: string;
  tasks: Task[];
  totalPCI: number;
  totalCost: number;
  totalHours: number;
  companyName: string;
}

export interface ProposalContent {
  executiveSummary: string;
  projectDescription: string;
  scope: string;
  methodology: string;
  timeline: string;
  deliverables: string;
  investment: string;
  termsConditions: string;
}

// Generate proposal with AI
export async function generateProposal(request: ProposalGenerationRequest): Promise<ProposalContent> {
  const data = await apiRequest('/proposals/generate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return data;
}

// Save proposal
export async function saveProposal(proposalData: any): Promise<any> {
  const data = await apiRequest('/proposals/save', {
    method: 'POST',
    body: JSON.stringify(proposalData),
  });
  return data;
}

// Get all proposals
export async function getProposals(): Promise<any[]> {
  const data = await apiRequest('/proposals');
  return data.proposals || [];
}

// Get task recommendations
export async function getTaskRecommendations(request: {
  projectTitle: string;
  projectType: string;
  industryContext: string;
  keyObjectives: string;
  existingTasks: Task[];
  timeline: string;
}): Promise<any[]> {
  const data = await apiRequest('/proposals/task-recommendations', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return data.recommendations || [];
}

// Get budget recommendations
export async function getBudgetRecommendations(request: {
  projectTitle: string;
  projectType: string;
  currentCost: number;
  proposedBudget: number;
  tasks: Task[];
}): Promise<any> {
  const data = await apiRequest('/proposals/budget-recommendations', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return data;
}

// ============================================
// PROJECT AUDIT API
// ============================================

// Organize pasted tasks with AI
export async function organizePastedTasks(pastedData: string): Promise<any[]> {
  const data = await apiRequest('/audit-project/organize-tasks', {
    method: 'POST',
    body: JSON.stringify({ pastedData }),
  });
  return data.tasks || [];
}

// ============================================
// CLIENT PORTAL API
// ============================================

export interface ClientPortal {
  id: string;
  clientName: string;
  clientEmail: string;
  clientLogo?: string;
  brandColor?: string;
  password: string;
  accessLink: string;
  expiresAt?: string;
  createdAt: string;
  lastAccessedAt?: string;
  accessCount: number;
  isActive: boolean;
  allowedSections: {
    tasks: boolean;
    proposal: boolean;
    budget: boolean;
    reports: boolean;
  };
}

// Get all client portals
export async function getClientPortals(): Promise<ClientPortal[]> {
  const data = await apiRequest('/client-portals');
  return data.portals || [];
}

// Create new client portal
export async function createClientPortal(portal: ClientPortal): Promise<ClientPortal> {
  const data = await apiRequest('/client-portals', {
    method: 'POST',
    body: JSON.stringify(portal),
  });
  return data.portal;
}

// Update client portal
export async function updateClientPortal(portalId: string, updates: Partial<ClientPortal>): Promise<ClientPortal> {
  const data = await apiRequest(`/client-portals/${portalId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.portal;
}

// Delete client portal
export async function deleteClientPortal(portalId: string): Promise<void> {
  await apiRequest(`/client-portals/${portalId}`, {
    method: 'DELETE',
  });
}

// Authenticate to client portal (no auth token required)
export async function authenticateClientPortal(portalId: string, password: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/client-portals/${portalId}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    throw new Error('Invalid password or portal not found');
  }

  return response.json();
}

// Track portal access
export async function trackPortalAccess(portalId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/client-portals/${portalId}/track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
}

// Approve client portal (e-signature)
export async function approveClientPortal(portalId: string, approvalData: { fullName: string; title: string; timestamp: string; signature: string }): Promise<void> {
  await fetch(`${API_BASE_URL}/client-portals/${portalId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(approvalData),
  });
}

// ============================================
// AUDIT ITEMS
// ============================================

// Get all audit items
export async function getAuditItems(): Promise<any[]> {
  try {
    const data = await apiRequest('/audit/items');
    return data.items || [];
  } catch (error) {
    console.error('Failed to get audit items:', error);
    return [];
  }
}

// Create audit item
export async function createAuditItem(item: any): Promise<any> {
  const data = await apiRequest('/audit/items', {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return data.item;
}

// Update audit item
export async function updateAuditItem(itemId: string, updates: any): Promise<any> {
  const data = await apiRequest(`/audit/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.item;
}

// ============================================
// PROJECTS API
// ============================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  totalPCI: number;
  totalCost: number;
  color?: string;
  isArchived?: boolean;
  archivedAt?: string;
}

export async function getProjects(): Promise<Project[]> {
  const data = await apiRequest('/projects');
  return data.projects || [];
}

export async function getProject(id: string): Promise<Project> {
  const data = await apiRequest(`/projects/${id}`);
  return data.project;
}

export async function createProject(project: Project): Promise<Project> {
  const data = await apiRequest('/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  });
  return data.project;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const data = await apiRequest(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.project;
}

export async function deleteProject(id: string): Promise<void> {
  await apiRequest(`/projects/${id}`, {
    method: 'DELETE',
  });
}

// Get tasks for a specific project
export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const data = await apiRequest(`/projects/${projectId}/tasks`);
  return data.tasks || [];
}

// Save tasks to a specific project
export async function saveProjectTasks(projectId: string, tasks: Task[]): Promise<void> {
  await apiRequest(`/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ tasks }),
  });
}
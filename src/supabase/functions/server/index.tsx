import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { registerNewRoutes } from "./new-routes.tsx";

const app = new Hono();

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Middleware to verify authentication
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    return { user: null, error: 'No authorization header' };
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  return { user, error };
}

// Create audit log entry
async function createAuditLog(userId: string, action: string, entityType: string, entityId: string, changes: any, metadata?: any) {
  const auditId = crypto.randomUUID();
  const auditEntry = {
    id: auditId,
    userId,
    action, // 'create', 'update', 'delete', 'review', 'approve', 'reject', 'flag'
    entityType, // 'task', 'settings', 'comment'
    entityId,
    changes,
    metadata,
    timestamp: new Date().toISOString(),
  };
  
  await kv.set(`audit:${userId}:${auditId}`, auditEntry);
  return auditEntry;
}

// Health check endpoint
app.get("/make-server-0dcd2201/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Sign up new user
app.post("/make-server-0dcd2201/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      user: data.user,
      message: 'User created successfully. You can now sign in.' 
    });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// ============================================
// TASKS ROUTES
// ============================================

// Get all tasks for authenticated user
app.get("/make-server-0dcd2201/tasks", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const tasks = await kv.getByPrefix(`task:${user.id}:`);
    
    // Filter out null/undefined values and ensure valid task structure
    const validTasks = tasks
      .map(t => t.value)
      .filter(task => 
        task != null && 
        typeof task === 'object' &&
        task.id != null &&
        task.taskName != null
      );
    
    return c.json({ 
      tasks: validTasks,
      count: validTasks.length 
    });
  } catch (error) {
    console.log(`Error fetching tasks: ${error}`);
    return c.json({ error: 'Failed to fetch tasks' }, 500);
  }
});

// Create new task
app.post("/make-server-0dcd2201/tasks", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const taskData = await c.req.json();
    const taskId = taskData.id || crypto.randomUUID();
    
    const task = {
      ...taskData,
      id: taskId,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`task:${user.id}:${taskId}`, task);
    
    return c.json({ task, message: 'Task created successfully' });
  } catch (error) {
    console.log(`Error creating task: ${error}`);
    return c.json({ error: 'Failed to create task' }, 500);
  }
});

// Update task
app.put("/make-server-0dcd2201/tasks/:id", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const taskId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingTask = await kv.get(`task:${user.id}:${taskId}`);
    
    if (!existingTask) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const updatedTask = {
      ...existingTask,
      ...updates,
      id: taskId,
      userId: user.id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`task:${user.id}:${taskId}`, updatedTask);
    
    // Create audit log for task update
    await createAuditLog(user.id, 'update', 'task', taskId, {
      before: existingTask,
      after: updatedTask
    });
    
    return c.json({ task: updatedTask, message: 'Task updated successfully' });
  } catch (error) {
    console.log(`Error updating task: ${error}`);
    return c.json({ error: 'Failed to update task' }, 500);
  }
});

// Delete task
app.delete("/make-server-0dcd2201/tasks/:id", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const taskId = c.req.param('id');
    await kv.del(`task:${user.id}:${taskId}`);
    
    return c.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.log(`Error deleting task: ${error}`);
    return c.json({ error: 'Failed to delete task' }, 500);
  }
});

// Batch update tasks (for syncing entire task list)
app.post("/make-server-0dcd2201/tasks/sync", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const { tasks } = await c.req.json();
    
    if (!Array.isArray(tasks)) {
      return c.json({ error: 'Tasks must be an array' }, 400);
    }

    // Filter out invalid tasks (null, undefined, or missing id)
    const validTasks = tasks.filter(task => 
      task != null && 
      task.id != null && 
      typeof task.id === 'string' &&
      task.id.trim() !== ''
    );

    if (validTasks.length === 0) {
      return c.json({ 
        message: 'No valid tasks to sync',
        count: 0 
      });
    }

    // Store all valid tasks
    const kvOperations = validTasks.map(task => {
      const taskWithMeta = {
        ...task,
        userId: user.id,
        updatedAt: new Date().toISOString(),
      };
      return kv.set(`task:${user.id}:${task.id}`, taskWithMeta);
    });

    await Promise.all(kvOperations);
    
    return c.json({ 
      message: 'Tasks synced successfully',
      count: validTasks.length 
    });
  } catch (error) {
    console.log(`Error syncing tasks: ${error}`, error);
    return c.json({ error: 'Failed to sync tasks' }, 500);
  }
});

// ============================================
// SETTINGS ROUTES
// ============================================

// Get user settings
app.get("/make-server-0dcd2201/settings", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const settings = await kv.get(`settings:${user.id}`);
    
    // Return default settings if none exist
    if (!settings) {
      const defaultSettings = {
        hourlyRate: 66,
        unitToHourRatio: 1.5,
        currency: 'USD',
        industryPreset: 'general',
      };
      return c.json({ settings: defaultSettings });
    }
    
    return c.json({ settings });
  } catch (error) {
    console.log(`Error fetching settings: ${error}`);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// Update user settings
app.put("/make-server-0dcd2201/settings", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const settings = await c.req.json();
    
    const settingsWithMeta = {
      ...settings,
      userId: user.id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`settings:${user.id}`, settingsWithMeta);
    
    return c.json({ 
      settings: settingsWithMeta,
      message: 'Settings updated successfully' 
    });
  } catch (error) {
    console.log(`Error updating settings: ${error}`);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// ============================================
// AI ROUTES
// ============================================

// Analyze task with AI
app.post("/make-server-0dcd2201/ai/analyze-task", async (c) => {
  try {
    const { description } = await c.req.json();
    
    if (!description) {
      return c.json({ error: 'Task description is required' }, 400);
    }

    // Simple AI analysis based on keywords and description length
    // In a real app, this would call an AI service like OpenAI
    const descriptionLower = description.toLowerCase();
    
    // Analyze complexity based on keywords
    const complexityKeywords = ['complex', 'advanced', 'integration', 'system', 'architecture', 'enterprise'];
    const hasComplexity = complexityKeywords.some(kw => descriptionLower.includes(kw));
    
    const riskKeywords = ['security', 'payment', 'authentication', 'critical', 'sensitive'];
    const hasRisk = riskKeywords.some(kw => descriptionLower.includes(kw));
    
    const uxKeywords = ['ui', 'ux', 'interface', 'design', 'responsive', 'user'];
    const hasUX = uxKeywords.some(kw => descriptionLower.includes(kw));
    
    const multiLayerKeywords = ['backend', 'frontend', 'database', 'api', 'full stack'];
    const hasMultiLayer = multiLayerKeywords.some(kw => descriptionLower.includes(kw));
    
    // Generate suggested factors based on analysis
    const taskName = description.split('\n')[0].slice(0, 100); // First line or 100 chars
    const ISR = Math.min(10, Math.max(1, Math.ceil(description.length / 20)));
    const CF = hasComplexity ? 1.5 : 1.2;
    const UXI = hasUX ? 1.8 : 1.3;
    const RCF = hasRisk ? 1.6 : 1.2;
    const AEP = Math.min(20, Math.max(5, Math.ceil(description.length / 15)));
    const L = Math.min(5, Math.max(1, Math.ceil(description.length / 30)));
    const MLW = hasMultiLayer ? 1.6 : 1.2;
    const CGW = 1.3;
    const RF = hasRisk ? 1.4 : 1.1;
    const S = hasComplexity ? 1.5 : 1.2;
    const GLRI = hasRisk ? 1.8 : 1.3;
    
    // Calculate PCI
    const pci = (ISR * CF * UXI) + (RCF * AEP - L) + (MLW * CGW * RF) + (S * GLRI);
    
    const result = {
      taskName,
      ISR,
      CF,
      UXI,
      RCF,
      AEP,
      L,
      MLW,
      CGW,
      RF,
      S,
      GLRI,
      aiVerifiedUnits: Math.max(0, pci * 0.95), // 95% of PCI as verified
    };
    
    return c.json({ 
      task: result,
      message: 'Task analyzed successfully',
      confidence: 0.85
    });
  } catch (error) {
    console.log(`Error analyzing task: ${error}`);
    return c.json({ error: 'Failed to analyze task' }, 500);
  }
});

// AI chat endpoint
app.post("/make-server-0dcd2201/ai/chat", async (c) => {
  try {
    const { message, tasks } = await c.req.json();
    
    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    const messageLower = message.toLowerCase();
    
    // Simple rule-based responses
    let response = '';
    
    if (messageLower.includes('total') || messageLower.includes('sum')) {
      const totalTasks = tasks?.length || 0;
      const totalPCI = tasks?.reduce((sum: number, t: any) => {
        const pci = (t.ISR * t.CF * t.UXI) + (t.RCF * t.AEP - t.L) + (t.MLW * t.CGW * t.RF) + (t.S * t.GLRI);
        return sum + pci;
      }, 0) || 0;
      response = `You have ${totalTasks} tasks with a total PCI of ${totalPCI.toFixed(2)} units.`;
    } else if (messageLower.includes('accuracy') || messageLower.includes('aas')) {
      if (tasks && tasks.length > 0) {
        const avgAAS = tasks.reduce((sum: number, t: any) => {
          const pci = (t.ISR * t.CF * t.UXI) + (t.RCF * t.AEP - t.L) + (t.MLW * t.CGW * t.RF) + (t.S * t.GLRI);
          return sum + (pci > 0 ? (t.aiVerifiedUnits / pci) * 100 : 0);
        }, 0) / tasks.length;
        response = `Your average AI Accuracy Score is ${avgAAS.toFixed(1)}%. ${avgAAS >= 85 ? 'Great job!' : 'Consider reviewing tasks with low AAS.'}`;
      } else {
        response = 'No tasks available to calculate accuracy.';
      }
    } else if (messageLower.includes('help') || messageLower.includes('how')) {
      response = 'I can help you analyze tasks, calculate totals, review accuracy scores, and provide insights on your cost modeling. Try asking about total units, accuracy scores, or specific tasks!';
    } else if (messageLower.includes('high risk') || messageLower.includes('risk')) {
      if (tasks && tasks.length > 0) {
        const highRiskTasks = tasks.filter((t: any) => t.RCF > 1.4 || t.RF > 1.3);
        response = `Found ${highRiskTasks.length} high-risk tasks. ${highRiskTasks.length > 0 ? 'Consider additional review and testing for these items.' : ''}`;
      } else {
        response = 'No tasks available to analyze risk.';
      }
    } else {
      response = `I understand you're asking about: "${message}". I can help with task analysis, cost calculations, and project insights. Try asking specific questions about totals, accuracy, or risk factors!`;
    }
    
    return c.json({ 
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.log(`Error in AI chat: ${error}`);
    return c.json({ error: 'Failed to process chat message' }, 500);
  }
});

// AI task verification endpoint
app.post("/make-server-0dcd2201/ai/verify-task", async (c) => {
  try {
    const { task } = await c.req.json();
    
    if (!task) {
      return c.json({ error: 'Task is required' }, 400);
    }

    // Calculate PCI
    const pci = (task.ISR * task.CF * task.UXI) + 
                (task.RCF * task.AEP - task.L) + 
                (task.MLW * task.CGW * task.RF) + 
                (task.S * task.GLRI);

    const aas = pci > 0 ? (task.aiVerifiedUnits / pci) * 100 : 0;

    // Generate verification overview
    const desc = task.taskName.toLowerCase();
    let complexity = 'moderate';
    if (pci > 50) complexity = 'high';
    else if (pci < 20) complexity = 'low';

    let taskType = 'development task';
    if (desc.includes('authentication') || desc.includes('auth') || desc.includes('login')) {
      taskType = 'security and authentication implementation';
    } else if (desc.includes('payment') || desc.includes('checkout') || desc.includes('transaction')) {
      taskType = 'payment processing integration';
    } else if (desc.includes('dashboard') || desc.includes('analytics') || desc.includes('reporting')) {
      taskType = 'analytics and reporting feature';
    } else if (desc.includes('api') || desc.includes('integration')) {
      taskType = 'system integration';
    } else if (desc.includes('ui') || desc.includes('interface') || desc.includes('component')) {
      taskType = 'user interface component';
    }

    const overview = `This task represents a ${complexity} complexity ${taskType}. Based on the PCI analysis, it requires ${pci.toFixed(1)} units of effort, reflecting the combined impact of scope, risk, coordination, and specialty factors. The task has been modeled to account for technical complexity, user experience considerations, cross-functional coordination, and any compliance or governance requirements.`;

    // Build reasoning breakdown
    const reasoning = [];

    // Scope & Complexity
    const scopeValue = task.ISR * task.CF * task.UXI;
    if (scopeValue > 10) {
      reasoning.push({
        category: 'Scope & Complexity',
        factors: [
          `ISR (${task.ISR}): ${task.ISR > 5 ? 'High initial scope complexity' : 'Moderate scope'}`,
          `CF (${task.CF}): ${task.CF > 1.3 ? 'Complex implementation required' : 'Standard complexity'}`,
          `UXI (${task.UXI}): ${task.UXI > 1.5 ? 'Significant UX impact' : 'Moderate UX considerations'}`,
        ],
        impact: `Combined scope complexity contributes ${scopeValue.toFixed(1)} units to total PCI`,
      });
    }

    // Risk & Engineering
    const riskValue = Math.max(0, task.RCF * task.AEP - task.L);
    if (riskValue > 5) {
      reasoning.push({
        category: 'Risk & Engineering',
        factors: [
          `RCF (${task.RCF}): ${task.RCF > 1.4 ? 'High technical/business risk' : 'Standard risk profile'}`,
          `AEP (${task.AEP}): ${task.AEP > 8 ? 'Complex architecture & engineering' : 'Moderate engineering effort'}`,
          `L (${task.L}): ${task.L > 2 ? 'Significant learning curve' : 'Minimal ramp-up time'}`,
        ],
        impact: `Risk and engineering complexity adds ${riskValue.toFixed(1)} units`,
      });
    }

    // Multi-Layer Work
    const multiLayerValue = task.MLW * task.CGW * task.RF;
    if (multiLayerValue > 2) {
      reasoning.push({
        category: 'Multi-Layer Work',
        factors: [
          `MLW (${task.MLW}): ${task.MLW > 1.3 ? 'Multiple layers of work involved' : 'Standard layers'}`,
          `CGW (${task.CGW}): ${task.CGW > 1.3 ? 'Cross-team coordination required' : 'Single team effort'}`,
          `RF (${task.RF}): ${task.RF > 1.2 ? 'High likelihood of iterations' : 'Minimal rework expected'}`,
        ],
        impact: `Coordination complexity contributes ${multiLayerValue.toFixed(1)} units`,
      });
    }

    // Specialty & Governance
    const specialtyValue = task.S * task.GLRI;
    if (specialtyValue > 2) {
      reasoning.push({
        category: 'Specialty & Governance',
        factors: [
          `S (${task.S}): ${task.S > 1.4 ? 'Specialized skills/tools required' : 'Standard skillset'}`,
          `GLRI (${task.GLRI}): ${task.GLRI > 1.5 ? 'High compliance/regulatory requirements' : 'Standard governance'}`,
        ],
        impact: `Specialty and governance adds ${specialtyValue.toFixed(1)} units`,
      });
    }

    // Generate recommendations
    const recommendations = [];
    if (aas < 85) {
      recommendations.push('⚠️ AAS below 85% - Consider reviewing AI verified units for accuracy');
    }
    if (task.ISR > 8) {
      recommendations.push('📊 High ISR detected - Verify initial scope is well-defined');
    }
    if (task.RCF > 1.5) {
      recommendations.push('🛡️ High risk factor - Ensure mitigation strategies are in place');
    }
    if (task.GLRI > 1.5) {
      recommendations.push('⚖️ Significant compliance requirements - Review legal/regulatory needs');
    }
    if (recommendations.length === 0) {
      recommendations.push('✅ Task pricing appears well-calibrated');
    }

    // Calculate confidence score
    let confidence = 75;
    if (aas > 85) confidence += 15;
    if (reasoning.length > 2) confidence += 5;
    confidence = Math.min(95, confidence);

    return c.json({ 
      verification: {
        overview,
        reasoning,
        confidence,
        recommendations,
      }
    });
  } catch (error) {
    console.log(`Error verifying task: ${error}`);
    return c.json({ error: 'Failed to verify task' }, 500);
  }
});

// AI task elements generation endpoint
app.post("/make-server-0dcd2201/ai/generate-task-elements", async (c) => {
  try {
    const { task } = await c.req.json();
    
    if (!task) {
      return c.json({ error: 'Task is required' }, 400);
    }

    const desc = task.taskName.toLowerCase();
    const elements: any[] = [];

    // Determine task type and generate appropriate elements
    const isAuth = desc.includes('auth') || desc.includes('login') || desc.includes('signup') || desc.includes('registration');
    const isPayment = desc.includes('payment') || desc.includes('checkout') || desc.includes('transaction');
    const isDashboard = desc.includes('dashboard') || desc.includes('analytics') || desc.includes('reporting');
    const isAPI = desc.includes('api') || desc.includes('endpoint') || desc.includes('integration');
    const isUI = desc.includes('ui') || desc.includes('component') || desc.includes('interface');
    const isDatabase = desc.includes('database') || desc.includes('db') || desc.includes('schema');

    // Generate elements based on task type
    if (isAuth) {
      elements.push(
        {
          id: crypto.randomUUID(),
          title: 'Authentication Flow Design',
          description: 'Design secure authentication flows including login, logout, and session management. Consider OAuth, JWT tokens, and refresh mechanisms.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Password Security Implementation',
          description: 'Implement password hashing (bcrypt/argon2), password strength validation, and secure password reset functionality.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Session Management',
          description: 'Build secure session handling with appropriate timeout policies, refresh tokens, and cross-device session management.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Security Testing',
          description: 'Perform penetration testing, test for SQL injection, XSS, CSRF vulnerabilities. Verify secure token storage.',
          category: 'Testing',
        }
      );
    } else if (isPayment) {
      elements.push(
        {
          id: crypto.randomUUID(),
          title: 'Payment Gateway Integration',
          description: 'Integrate with payment provider (Stripe, PayPal) including SDK setup, API key configuration, and webhook handling.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Transaction Processing Logic',
          description: 'Implement transaction flow: cart calculation, tax/shipping, payment processing, confirmation, and receipt generation.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'PCI Compliance Review',
          description: 'Ensure PCI DSS compliance: no card data storage, secure transmission, tokenization, and compliance documentation.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Error Handling & Refunds',
          description: 'Build robust error handling for failed payments, implement refund processing, and handle edge cases like partial refunds.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Payment Testing',
          description: 'Test with test cards, verify refund flows, test webhook reliability, and perform load testing for high transaction volumes.',
          category: 'Testing',
        }
      );
    } else if (isDashboard) {
      elements.push(
        {
          id: crypto.randomUUID(),
          title: 'Dashboard Layout Design',
          description: 'Create responsive dashboard layout with grid system, widget containers, and mobile-first approach.',
          category: 'Design',
        },
        {
          id: crypto.randomUUID(),
          title: 'Data Visualization Components',
          description: 'Build charts (line, bar, pie), tables, KPI cards using visualization libraries like Recharts or D3.js.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Real-time Data Integration',
          description: 'Implement WebSocket/polling for real-time updates, data refresh mechanisms, and loading states.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Filtering & Export Features',
          description: 'Add date range pickers, filters, search functionality, and CSV/PDF export capabilities.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Performance Optimization',
          description: 'Optimize rendering with virtualization, lazy loading, memoization, and efficient data fetching strategies.',
          category: 'Development',
        }
      );
    } else if (isAPI) {
      elements.push(
        {
          id: crypto.randomUUID(),
          title: 'API Endpoint Design',
          description: 'Design RESTful/GraphQL endpoints with proper HTTP methods, status codes, and response structures.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Request Validation',
          description: 'Implement input validation, sanitization, schema validation using libraries like Joi or Zod.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Authentication & Authorization',
          description: 'Add API key/JWT authentication, role-based access control (RBAC), and rate limiting.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'API Documentation',
          description: 'Create comprehensive API docs using OpenAPI/Swagger with examples, error codes, and usage guidelines.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Integration Testing',
          description: 'Write integration tests for all endpoints, test error scenarios, and verify response formats.',
          category: 'Testing',
        }
      );
    } else if (isUI) {
      elements.push(
        {
          id: crypto.randomUUID(),
          title: 'Component Design System',
          description: 'Create reusable UI components following design system patterns: buttons, inputs, cards, modals with consistent styling.',
          category: 'Design',
        },
        {
          id: crypto.randomUUID(),
          title: 'Responsive Implementation',
          description: 'Build mobile-first responsive layouts with breakpoints, flexible grids, and adaptive images.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Accessibility (A11Y)',
          description: 'Ensure WCAG 2.1 AA compliance: keyboard navigation, screen reader support, ARIA labels, color contrast.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Interaction States',
          description: 'Implement hover, active, disabled, loading states with smooth transitions and micro-interactions.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Cross-browser Testing',
          description: 'Test on Chrome, Firefox, Safari, Edge. Verify mobile browsers (iOS Safari, Chrome Mobile).',
          category: 'Testing',
        }
      );
    } else if (isDatabase) {
      elements.push(
        {
          id: crypto.randomUUID(),
          title: 'Database Schema Design',
          description: 'Design normalized database schema with proper relationships, indexes, and constraints.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Migration Scripts',
          description: 'Create up/down migration scripts for schema changes with rollback capabilities.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Query Optimization',
          description: 'Optimize queries with proper indexes, query analysis, and caching strategies.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Data Validation',
          description: 'Add database-level constraints, triggers, and validation rules for data integrity.',
          category: 'Development',
        }
      );
    } else {
      // Generic development task elements
      elements.push(
        {
          id: crypto.randomUUID(),
          title: 'Requirements Analysis',
          description: 'Review requirements, clarify edge cases, identify dependencies, and create technical specifications.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Core Implementation',
          description: 'Implement main functionality following best practices, design patterns, and coding standards.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Error Handling',
          description: 'Add comprehensive error handling, validation, logging, and user-friendly error messages.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Unit Testing',
          description: 'Write unit tests for all functions/components with edge cases and mock external dependencies.',
          category: 'Testing',
        },
        {
          id: crypto.randomUUID(),
          title: 'Code Review & Refactoring',
          description: 'Conduct peer code review, refactor for maintainability, document complex logic.',
          category: 'Development',
        },
        {
          id: crypto.randomUUID(),
          title: 'Documentation',
          description: 'Write technical documentation, inline code comments, and update README/wikis.',
          category: 'Development',
        }
      );
    }

    // Add deployment element for most tasks
    if (task.AEP > 5 || task.RCF > 1.3) {
      elements.push({
        id: crypto.randomUUID(),
        title: 'Deployment & Monitoring',
        description: 'Deploy to staging/production, configure monitoring, set up alerts, and verify deployment success.',
        category: 'Deployment',
      });
    }

    return c.json({ 
      elements,
      count: elements.length,
    });
  } catch (error) {
    console.log(`Error generating task elements: ${error}`);
    return c.json({ error: 'Failed to generate task elements' }, 500);
  }
});

// AI task elements enhancement endpoint
app.post("/make-server-0dcd2201/ai/enhance-task-elements", async (c) => {
  try {
    const { task } = await c.req.json();
    
    if (!task || !task.taskElements) {
      return c.json({ error: 'Task with existing elements is required' }, 400);
    }

    // Take existing elements and enhance them with more detail
    const enhancedElements = task.taskElements.map((element: any) => {
      const category = element.category.toLowerCase();
      let enhancedDescription = element.description;

      // Add more technical details based on category
      if (category === 'development') {
        enhancedDescription += ' Consider error handling, logging, performance optimization, and code quality metrics. Follow SOLID principles and ensure proper separation of concerns.';
      } else if (category === 'testing') {
        enhancedDescription += ' Include unit tests, integration tests, and end-to-end tests. Aim for >80% code coverage. Test edge cases, error scenarios, and performance under load.';
      } else if (category === 'design') {
        enhancedDescription += ' Ensure accessibility (WCAG 2.1 AA), responsive design for mobile/tablet/desktop, consistent with design system. Consider dark mode and internationalization.';
      } else if (category === 'deployment') {
        enhancedDescription += ' Set up CI/CD pipelines, configure monitoring and alerting, implement rollback strategies. Use blue-green or canary deployments for production releases.';
      } else if (category === 'documentation') {
        enhancedDescription += ' Include API documentation, code comments, architecture diagrams, and user guides. Keep documentation up-to-date with code changes.';
      }

      return {
        ...element,
        description: enhancedDescription,
      };
    });

    // Optionally add 1-2 new suggested elements based on complexity
    if (task.CF > 2.5 || task.RCF > 1.5) {
      enhancedElements.push({
        id: crypto.randomUUID(),
        title: 'Performance Optimization',
        description: 'Profile application performance, identify bottlenecks, optimize database queries, implement caching strategies (Redis/CDN), and conduct load testing.',
        category: 'Development',
      });
    }

    if (task.GLRI > 1.3 || task.RCF > 1.8) {
      enhancedElements.push({
        id: crypto.randomUUID(),
        title: 'Security Audit',
        description: 'Conduct security review: OWASP Top 10 vulnerabilities, dependency scanning, secrets management, encryption at rest/transit, and compliance validation.',
        category: 'Testing',
      });
    }

    return c.json({ 
      elements: enhancedElements,
      count: enhancedElements.length,
    });
  } catch (error) {
    console.log(`Error enhancing task elements: ${error}`);
    return c.json({ error: 'Failed to enhance task elements' }, 500);
  }
});

// AI project generation endpoint
app.post("/make-server-0dcd2201/ai/generate-project", async (c) => {
  try {
    const { description } = await c.req.json();
    
    if (!description) {
      return c.json({ error: 'Project description is required' }, 400);
    }

    const { extractProjectName, detectProjectType, analyzeComplexity, generateProjectTasks } = await import('./ai-project-helper.tsx');
    
    const descriptionLower = description.toLowerCase();
    const projectName = extractProjectName(description);
    const projectType = detectProjectType(descriptionLower);
    const complexity = analyzeComplexity(descriptionLower);
    const tasks = generateProjectTasks(description, projectType, complexity);
    
    const estimatedCost = tasks.reduce((sum, task) => {
      const pci = (task.ISR * task.CF * task.UXI) + (task.RCF * task.AEP - task.L) + 
                  (task.MLW * task.CGW * task.RF) + (task.S * task.GLRI);
      const verifiedUnits = task.aiVerifiedUnits || (pci * 0.95);
      return sum + (verifiedUnits * 66);
    }, 0);
    
    const totalHours = estimatedCost / 66;
    const estimatedDuration = totalHours < 40 ? '1-2 weeks' : 
                             totalHours < 160 ? '1-2 months' : 
                             totalHours < 320 ? '2-4 months' : 
                             '4+ months';
    
    const colors = {
      ecommerce: '#FF6B6B',
      mobile: '#4ECDC4',
      saas: '#95E1D3',
      api: '#60A5FA',
      healthcare: '#FB7185',
      fintech: '#34D399',
      default: '#2BBBEF'
    };
    const color = colors[projectType] || colors.default;
    
    const project = {
      name: projectName,
      description: description.slice(0, 200),
      color,
      tasks,
      estimatedCost: Math.round(estimatedCost),
      estimatedDuration,
    };
    
    return c.json({ project });
  } catch (error) {
    console.log(`Error generating project: ${error}`);
    return c.json({ error: 'Failed to generate project' }, 500);
  }
});

// Save margin data for a project
app.post("/make-server-0dcd2201/projects/margin", async (c) => {
  try {
    const { projectId, marginData } = await c.req.json();
    
    if (!projectId || !marginData) {
      return c.json({ error: 'Project ID and margin data are required' }, 400);
    }

    const key = `project:${projectId}:margin`;
    await kv.set(key, marginData);
    
    return c.json({ success: true, message: 'Margin data saved successfully' });
  } catch (error) {
    console.log(`Error saving margin data: ${error}`);
    return c.json({ error: 'Failed to save margin data' }, 500);
  }
});

// Get margin data for a project
app.get("/make-server-0dcd2201/projects/margin/:projectId", async (c) => {
  try {
    const { projectId } = c.req.param();
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const key = `project:${projectId}:margin`;
    const marginData = await kv.get(key);
    
    return c.json({ marginData: marginData || null });
  } catch (error) {
    console.log(`Error getting margin data: ${error}`);
    return c.json({ error: 'Failed to get margin data' }, 500);
  }
});

// ============================================
// AUDIT ROUTES
// ============================================

// Get all audit logs
app.get("/make-server-0dcd2201/audit/logs", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const logs = await kv.getByPrefix(`audit:${user.id}:`);
    
    return c.json({ 
      logs: logs.map(l => l.value).sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
      count: logs.length 
    });
  } catch (error) {
    console.log(`Error fetching audit logs: ${error}`);
    return c.json({ error: 'Failed to fetch audit logs' }, 500);
  }
});

// Get audit logs for specific entity
app.get("/make-server-0dcd2201/audit/logs/:entityType/:entityId", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const entityType = c.req.param('entityType');
    const entityId = c.req.param('entityId');

    const allLogs = await kv.getByPrefix(`audit:${user.id}:`);
    const filteredLogs = allLogs
      .map(l => l.value)
      .filter((log: any) => log.entityType === entityType && log.entityId === entityId)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return c.json({ 
      logs: filteredLogs,
      count: filteredLogs.length 
    });
  } catch (error) {
    console.log(`Error fetching entity audit logs: ${error}`);
    return c.json({ error: 'Failed to fetch entity audit logs' }, 500);
  }
});

// Create a flag
app.post("/make-server-0dcd2201/audit/flag", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const { taskId, reason, severity } = await c.req.json();
    
    if (!taskId || !reason || !severity) {
      return c.json({ error: 'taskId, reason, and severity are required' }, 400);
    }

    const flagId = crypto.randomUUID();
    const flag = {
      id: flagId,
      taskId,
      userId: user.id,
      reason,
      severity,
      status: 'open',
      createdAt: new Date().toISOString(),
      resolvedAt: null,
      resolvedBy: null,
    };

    await kv.set(`flag:${user.id}:${flagId}`, flag);
    
    // Create audit log for flag creation
    await createAuditLog(user.id, 'flag', 'task', taskId, { flag }, { severity, reason });
    
    return c.json({ flag, message: 'Task flagged successfully' });
  } catch (error) {
    console.log(`Error creating flag: ${error}`);
    return c.json({ error: 'Failed to create flag' }, 500);
  }
});

// Get all flags with optional status filter
app.get("/make-server-0dcd2201/audit/flags", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const status = c.req.query('status');
    const allFlags = await kv.getByPrefix(`flag:${user.id}:`);
    
    let flags = allFlags.map(f => f.value);
    
    if (status) {
      flags = flags.filter((flag: any) => flag.status === status);
    }
    
    // Sort by creation date, newest first
    flags.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ 
      flags,
      count: flags.length 
    });
  } catch (error) {
    console.log(`Error fetching flags: ${error}`);
    return c.json({ error: 'Failed to fetch flags' }, 500);
  }
});

// Update flag status
app.put("/make-server-0dcd2201/audit/flags/:id", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const flagId = c.req.param('id');
    const { status, resolution } = await c.req.json();
    
    const existingFlag = await kv.get(`flag:${user.id}:${flagId}`);
    
    if (!existingFlag) {
      return c.json({ error: 'Flag not found' }, 404);
    }

    const updatedFlag = {
      ...existingFlag,
      status,
      resolution,
      resolvedAt: (status === 'resolved' || status === 'dismissed') ? new Date().toISOString() : existingFlag.resolvedAt,
      resolvedBy: (status === 'resolved' || status === 'dismissed') ? user.id : existingFlag.resolvedBy,
    };

    await kv.set(`flag:${user.id}:${flagId}`, updatedFlag);
    
    // Create audit log for flag update
    await createAuditLog(user.id, 'update', 'flag', flagId, {
      before: existingFlag,
      after: updatedFlag
    });
    
    return c.json({ flag: updatedFlag, message: 'Flag updated successfully' });
  } catch (error) {
    console.log(`Error updating flag: ${error}`);
    return c.json({ error: 'Failed to update flag' }, 500);
  }
});

// Add comment to task
app.post("/make-server-0dcd2201/audit/comments", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const { taskId, comment } = await c.req.json();
    
    if (!taskId || !comment) {
      return c.json({ error: 'taskId and comment are required' }, 400);
    }

    const commentId = crypto.randomUUID();
    const commentData = {
      id: commentId,
      taskId,
      userId: user.id,
      comment,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`comment:${user.id}:${commentId}`, commentData);
    
    // Create audit log for comment
    await createAuditLog(user.id, 'create', 'comment', commentId, { comment: commentData }, { taskId });
    
    return c.json({ comment: commentData, message: 'Comment added successfully' });
  } catch (error) {
    console.log(`Error adding comment: ${error}`);
    return c.json({ error: 'Failed to add comment' }, 500);
  }
});

// Get comments for a task
app.get("/make-server-0dcd2201/audit/comments/:taskId", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const taskId = c.req.param('taskId');
    const allComments = await kv.getByPrefix(`comment:${user.id}:`);
    
    const taskComments = allComments
      .map(c => c.value)
      .filter((comment: any) => comment.taskId === taskId)
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    return c.json({ 
      comments: taskComments,
      count: taskComments.length 
    });
  } catch (error) {
    console.log(`Error fetching comments: ${error}`);
    return c.json({ error: 'Failed to fetch comments' }, 500);
  }
});

// Approve task
app.post("/make-server-0dcd2201/audit/approve", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const { taskId, notes } = await c.req.json();
    
    if (!taskId) {
      return c.json({ error: 'taskId is required' }, 400);
    }

    const existingTask = await kv.get(`task:${user.id}:${taskId}`);
    
    if (!existingTask) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const updatedTask = {
      ...existingTask,
      auditStatus: 'approved',
      auditNotes: notes,
      approvedAt: new Date().toISOString(),
      approvedBy: user.id,
    };

    await kv.set(`task:${user.id}:${taskId}`, updatedTask);
    
    // Create audit log
    await createAuditLog(user.id, 'approve', 'task', taskId, {
      before: existingTask,
      after: updatedTask
    }, { notes });
    
    return c.json({ task: updatedTask, message: 'Task approved successfully' });
  } catch (error) {
    console.log(`Error approving task: ${error}`);
    return c.json({ error: 'Failed to approve task' }, 500);
  }
});

// Reject task
app.post("/make-server-0dcd2201/audit/reject", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const { taskId, reason } = await c.req.json();
    
    if (!taskId || !reason) {
      return c.json({ error: 'taskId and reason are required' }, 400);
    }

    const existingTask = await kv.get(`task:${user.id}:${taskId}`);
    
    if (!existingTask) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const updatedTask = {
      ...existingTask,
      auditStatus: 'rejected',
      rejectionReason: reason,
      rejectedAt: new Date().toISOString(),
      rejectedBy: user.id,
    };

    await kv.set(`task:${user.id}:${taskId}`, updatedTask);
    
    // Create audit log
    await createAuditLog(user.id, 'reject', 'task', taskId, {
      before: existingTask,
      after: updatedTask
    }, { reason });
    
    return c.json({ task: updatedTask, message: 'Task rejected successfully' });
  } catch (error) {
    console.log(`Error rejecting task: ${error}`);
    return c.json({ error: 'Failed to reject task' }, 500);
  }
});

// ============================================
// REPORTING ROUTES
// ============================================

// Get comprehensive report data with filters
app.post("/make-server-0dcd2201/reports/generate", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const { startDate, endDate, status, includeAudit } = await c.req.json();

    // Get all tasks
    const allTasks = await kv.getByPrefix(`task:${user.id}:`);
    let tasks = allTasks.map(t => t.value).filter(t => t != null);

    // Apply filters
    if (startDate || endDate) {
      tasks = tasks.filter((task: any) => {
        const taskDate = new Date(task.createdAt || task.updatedAt);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return taskDate >= start && taskDate <= end;
      });
    }

    if (status) {
      tasks = tasks.filter((task: any) => task.auditStatus === status);
    }

    // Calculate aggregated metrics
    let totalPCI = 0;
    let totalVerified = 0;
    let totalCost = 0;
    let totalTasks = tasks.length;
    let approvedTasks = 0;
    let rejectedTasks = 0;
    let pendingTasks = 0;
    let lowAASCount = 0;

    const taskBreakdown = tasks.map((task: any) => {
      const pci = (task.ISR * task.CF * task.UXI) + 
                  (task.RCF * task.AEP - task.L) + 
                  (task.MLW * task.CGW * task.RF) + 
                  (task.S * task.GLRI);
      const aas = pci > 0 ? (task.aiVerifiedUnits / pci) * 100 : 0;
      const verifiedUnits = (aas / 100) * pci;
      
      totalPCI += pci;
      totalVerified += task.aiVerifiedUnits || 0;

      if (task.auditStatus === 'approved') approvedTasks++;
      else if (task.auditStatus === 'rejected') rejectedTasks++;
      else pendingTasks++;

      if (aas < 85 && aas > 0) lowAASCount++;

      return {
        id: task.id,
        taskName: task.taskName,
        pci,
        aiVerifiedUnits: task.aiVerifiedUnits || 0,
        aas,
        verifiedUnits,
        auditStatus: task.auditStatus || 'pending',
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      };
    });

    const averageAAS = totalPCI > 0 ? (totalVerified / totalPCI) * 100 : 0;

    // Get audit data if requested
    let auditMetrics = null;
    if (includeAudit) {
      const auditLogs = await kv.getByPrefix(`audit:${user.id}:`);
      const flags = await kv.getByPrefix(`flag:${user.id}:`);
      
      auditMetrics = {
        totalLogs: auditLogs.length,
        totalFlags: flags.length,
        openFlags: flags.filter((f: any) => f.value?.status === 'open').length,
        resolvedFlags: flags.filter((f: any) => f.value?.status === 'resolved').length,
        recentActivity: auditLogs
          .map((l: any) => l.value)
          .filter(v => v != null)
          .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10),
      };
    }

    // Category breakdown
    const categoryBreakdown = tasks.map((task: any) => {
      const scopeComplexity = (task.ISR || 0) * (task.CF || 1) * (task.UXI || 1);
      const riskEngineering = (task.RCF || 1) * (task.AEP || 0) - (task.L || 0);
      const multiLayer = (task.MLW || 1) * (task.CGW || 1) * (task.RF || 1);
      const specialtyGovernance = (task.S || 1) * (task.GLRI || 1);
      
      return {
        scopeComplexity,
        riskEngineering,
        multiLayer,
        specialtyGovernance,
      };
    });

    const totalScopeComplexity = categoryBreakdown.reduce((sum, t) => sum + t.scopeComplexity, 0);
    const totalRiskEngineering = categoryBreakdown.reduce((sum, t) => sum + t.riskEngineering, 0);
    const totalMultiLayer = categoryBreakdown.reduce((sum, t) => sum + t.multiLayer, 0);
    const totalSpecialtyGovernance = categoryBreakdown.reduce((sum, t) => sum + t.specialtyGovernance, 0);

    return c.json({
      summary: {
        totalTasks,
        totalPCI,
        totalVerified,
        averageAAS,
        approvedTasks,
        rejectedTasks,
        pendingTasks,
        lowAASCount,
      },
      taskBreakdown,
      categoryDistribution: {
        scopeComplexity: totalScopeComplexity,
        riskEngineering: totalRiskEngineering,
        multiLayer: totalMultiLayer,
        specialtyGovernance: totalSpecialtyGovernance,
      },
      auditMetrics,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.log(`Error generating report: ${error}`);
    return c.json({ error: 'Failed to generate report' }, 500);
  }
});

// Get time-series data for trends
app.post("/make-server-0dcd2201/reports/trends", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const { period } = await c.req.json(); // 'week', 'month', 'quarter'

    // Get all tasks
    const allTasks = await kv.getByPrefix(`task:${user.id}:`);
    const tasks = allTasks.map(t => t.value).filter(t => t != null);

    // Get audit logs for activity trends
    const auditLogs = await kv.getByPrefix(`audit:${user.id}:`);
    const logs = auditLogs.map(l => l.value).filter(l => l != null);

    // Group by time period
    const now = new Date();
    const periods = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const periodLength = period === 'week' ? 1 : period === 'month' ? 1 : 7;

    const trendData = [];
    for (let i = periods - 1; i >= 0; i -= periodLength) {
      const periodEnd = new Date(now);
      periodEnd.setDate(now.getDate() - i);
      const periodStart = new Date(periodEnd);
      periodStart.setDate(periodEnd.getDate() - periodLength);

      const periodTasks = tasks.filter((task: any) => {
        const taskDate = new Date(task.updatedAt || task.createdAt || now);
        return taskDate >= periodStart && taskDate <= periodEnd;
      });

      const periodLogs = logs.filter((log: any) => {
        const logDate = new Date(log.timestamp);
        return logDate >= periodStart && logDate <= periodEnd;
      });

      let totalPCI = 0;
      let totalVerified = 0;

      periodTasks.forEach((task: any) => {
        const pci = (task.ISR * task.CF * task.UXI) + 
                    (task.RCF * task.AEP - task.L) + 
                    (task.MLW * task.CGW * task.RF) + 
                    (task.S * task.GLRI);
        totalPCI += pci;
        totalVerified += task.aiVerifiedUnits || 0;
      });

      const aas = totalPCI > 0 ? (totalVerified / totalPCI) * 100 : 0;

      trendData.push({
        period: periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tasks: periodTasks.length,
        pci: totalPCI,
        verified: totalVerified,
        aas,
        auditActivity: periodLogs.length,
      });
    }

    return c.json({
      trends: trendData,
      period,
    });
  } catch (error) {
    console.log(`Error generating trends: ${error}`);
    return c.json({ error: 'Failed to generate trends' }, 500);
  }
});

// Get KPI dashboard data
app.get("/make-server-0dcd2201/reports/kpis", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const allTasks = await kv.getByPrefix(`task:${user.id}:`);
    const tasks = allTasks.map(t => t.value);
    
    const auditLogs = await kv.getByPrefix(`audit:${user.id}:`);
    const flags = await kv.getByPrefix(`flag:${user.id}:`);
    const comments = await kv.getByPrefix(`comment:${user.id}:`);

    // Calculate KPIs
    let totalPCI = 0;
    let totalVerified = 0;
    let totalAnomalies = 0;
    let totalLowAAS = 0;

    tasks.forEach((task: any) => {
      const pci = (task.ISR * task.CF * task.UXI) + 
                  (task.RCF * task.AEP - task.L) + 
                  (task.MLW * task.CGW * task.RF) + 
                  (task.S * task.GLRI);
      const aas = pci > 0 ? (task.aiVerifiedUnits / pci) * 100 : 0;
      
      totalPCI += pci;
      totalVerified += task.aiVerifiedUnits;
      
      if (task.hasAnomaly) totalAnomalies++;
      if (aas < 85 && aas > 0) totalLowAAS++;
    });

    const avgAAS = totalPCI > 0 ? (totalVerified / totalPCI) * 100 : 0;
    const approvalRate = tasks.length > 0 
      ? (tasks.filter((t: any) => t.auditStatus === 'approved').length / tasks.length) * 100 
      : 0;

    return c.json({
      kpis: {
        totalTasks: tasks.length,
        totalPCI,
        totalVerified,
        averageAAS: avgAAS,
        approvedTasks: tasks.filter((t: any) => t.auditStatus === 'approved').length,
        pendingTasks: tasks.filter((t: any) => !t.auditStatus).length,
        rejectedTasks: tasks.filter((t: any) => t.auditStatus === 'rejected').length,
        totalAnomalies,
        totalLowAAS,
        approvalRate,
        auditActivity: auditLogs.length,
        openFlags: flags.filter((f: any) => f.value.status === 'open').length,
        totalComments: comments.length,
      },
    });
  } catch (error) {
    console.log(`Error fetching KPIs: ${error}`);
    return c.json({ error: 'Failed to fetch KPIs' }, 500);
  }
});

// Export report data as CSV
app.post("/make-server-0dcd2201/reports/export", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const { format, startDate, endDate } = await c.req.json();

    const allTasks = await kv.getByPrefix(`task:${user.id}:`);
    let tasks = allTasks.map(t => t.value);

    // Apply date filter
    if (startDate || endDate) {
      tasks = tasks.filter((task: any) => {
        const taskDate = new Date(task.createdAt || task.updatedAt);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        return taskDate >= start && taskDate <= end;
      });
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Task Name', 'ISR', 'CF', 'UXI', 'RCF', 'AEP', 'L', 'MLW', 'CGW', 'RF', 'S', 'GLRI',
        'PCI Units', 'AI Verified Units', 'AAS %', 'Audit Status', 'Created At', 'Updated At'
      ];

      const rows = tasks.map((task: any) => {
        const pci = (task.ISR * task.CF * task.UXI) + 
                    (task.RCF * task.AEP - task.L) + 
                    (task.MLW * task.CGW * task.RF) + 
                    (task.S * task.GLRI);
        const aas = pci > 0 ? (task.aiVerifiedUnits / pci) * 100 : 0;

        return [
          task.taskName,
          task.ISR,
          task.CF,
          task.UXI,
          task.RCF,
          task.AEP,
          task.L,
          task.MLW,
          task.CGW,
          task.RF,
          task.S,
          task.GLRI,
          pci.toFixed(2),
          task.aiVerifiedUnits.toFixed(2),
          aas.toFixed(1),
          task.auditStatus || 'pending',
          task.createdAt || '',
          task.updatedAt || '',
        ].join(',');
      });

      const csv = [headers.join(','), ...rows].join('\n');

      return c.json({
        format: 'csv',
        data: csv,
        filename: `pci_report_${new Date().toISOString().split('T')[0]}.csv`,
      });
    }

    return c.json({ error: 'Unsupported format' }, 400);
  } catch (error) {
    console.log(`Error exporting report: ${error}`);
    return c.json({ error: 'Failed to export report' }, 500);
  }
});

// ============================================
// PROPOSAL BUILDER ROUTES
// ============================================

// Generate proposal with AI
app.post("/make-server-0dcd2201/proposals/generate", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const {
      clientName,
      projectTitle,
      projectType,
      industryContext,
      keyObjectives,
      timeline,
      budget,
      tasks,
      totalPCI,
      totalCost,
      totalHours,
      companyName,
    } = await c.req.json();

    // Generate AI-powered proposal content
    const executiveSummary = `${companyName} is pleased to present this comprehensive proposal for ${projectTitle}. This ${projectType || 'development'} project for ${clientName} represents a strategic initiative designed to ${keyObjectives || 'deliver exceptional value and innovation'}.

Our team has conducted a thorough analysis using our proprietary PCI (Project Cost Intelligence) methodology, which evaluates projects across multiple dimensions including scope complexity, technical risk, user experience impact, and coordination requirements. Based on this analysis, we have identified ${tasks?.length || 0} key tasks with a total estimated effort of ${totalPCI?.toFixed(1) || '0'} PCI units.

This proposal outlines our recommended approach, methodology, timeline, and investment required to successfully deliver this project. We are confident that our proven expertise${industryContext ? ` in the ${industryContext} industry` : ''} positions us as the ideal partner for this initiative.`;

    const projectDescription = `${projectTitle} is a ${projectType || 'comprehensive software development'} project designed to ${keyObjectives || 'transform your digital capabilities and drive business growth'}. ${industryContext ? `Within the ${industryContext} sector, ` : ''}This project addresses critical business needs and leverages modern technology to deliver measurable results.

The project encompasses ${tasks?.length || 0} distinct workstreams, each carefully scoped and estimated using our PCI framework. Our approach ensures accuracy, transparency, and alignment with your business objectives.

Key highlights include:
• Comprehensive scope analysis across all project dimensions
• Risk-adjusted effort estimation using proven methodologies
• Focus on quality, scalability, and long-term maintainability
• Alignment with industry best practices and standards

Our team will work closely with ${clientName} stakeholders throughout the project lifecycle to ensure successful delivery and maximize return on investment.`;

    const scope = `The scope of work for ${projectTitle} includes the following key components:

${tasks?.slice(0, 10).map((task: any, idx: number) => {
  const pci = (task.ISR * task.CF * task.UXI) + 
              (task.RCF * task.AEP - task.L) + 
              (task.MLW * task.CGW * task.RF) + 
              (task.S * task.GLRI);
  return `${idx + 1}. ${task.taskName}
   • Estimated effort: ${pci.toFixed(1)} PCI units
   • Scope complexity: ${task.ISR > 7 ? 'High' : task.ISR > 4 ? 'Medium' : 'Low'}
   • Risk profile: ${task.RCF > 1.4 ? 'Elevated' : 'Standard'}
`;
}).join('\n')}
${tasks?.length > 10 ? `\n...and ${tasks.length - 10} additional tasks (see detailed breakdown)` : ''}

Total Estimated Effort: ${totalPCI?.toFixed(1) || '0'} PCI units (approximately ${totalHours?.toFixed(0) || '0'} hours)

All work will be performed according to industry best practices with comprehensive documentation, testing, and quality assurance processes.`;

    const methodology = `${companyName} employs a proven, iterative development methodology designed to maximize transparency, minimize risk, and deliver consistent value:

**Phase 1: Discovery & Planning (Week 1-2)**
• Stakeholder interviews and requirements gathering
• Technical architecture design and review
• Project plan finalization and milestone definition
• Risk assessment and mitigation planning

**Phase 2: Design & Prototyping (Week 2-4)**
• UI/UX design and wireframing
• Technical specifications and API design
• Prototype development for key workflows
• Stakeholder review and feedback incorporation

**Phase 3: Development & Implementation (Week 4-${timeline || '10'})**
• Agile sprint-based development cycles
• Regular progress reviews and demonstrations
• Continuous integration and automated testing
• Iterative refinement based on feedback

**Phase 4: Testing & Quality Assurance (Week ${timeline ? parseInt(timeline.split('-')[0]) - 2 : '8'}-${timeline || '10'})**
• Comprehensive functional testing
• Performance and security testing
• User acceptance testing (UAT)
• Bug fixing and optimization

**Phase 5: Deployment & Handoff (Week ${timeline || '10-12'})**
• Production deployment and monitoring
• Documentation and training delivery
• Knowledge transfer to ${clientName} team
• Post-launch support and optimization

Throughout all phases, we maintain open communication channels, provide regular status updates, and ensure alignment with project goals.`;

    const timelineText = `Based on the scope and complexity of ${projectTitle}, we estimate the following timeline:

**Total Duration:** ${timeline || '8-12 weeks'}

**Key Milestones:**
• Project Kickoff: Week 1
• Design Approval: Week 3
• Development Completion: Week ${timeline ? parseInt(timeline.split('-')[0]) - 2 : '8'}
• Testing Complete: Week ${timeline ? parseInt(timeline.split('-')[0]) - 1 : '10'}
• Production Launch: Week ${timeline || '12'}

This timeline is based on:
• ${totalPCI?.toFixed(0) || '0'} PCI units of estimated effort
• Availability of ${clientName} stakeholders for reviews and approvals
• Timely provision of required assets and access
• No major scope changes or additions

We build buffer time into our estimates to account for unforeseen challenges and ensure reliable delivery. Detailed sprint schedules will be provided during project kickoff.`;

    const deliverables = `Upon successful completion of ${projectTitle}, ${clientName} will receive:

**Technical Deliverables:**
• Fully functional ${projectType || 'application'} deployed to production
• Complete source code repository with version control
• Technical documentation and architecture diagrams
• API documentation (if applicable)
• Database schema and migration scripts
• Automated test suites and testing documentation

**Design Deliverables:**
• Final UI/UX designs and design system components
• Brand guidelines and style guides
• Responsive layouts for all supported devices
• Accessibility compliance documentation

**Documentation:**
• User guides and training materials
• Administrator documentation
• Deployment and operations runbook
��� Maintenance and support guidelines

**Project Management:**
• Sprint reports and progress summaries
• Final project report with metrics and outcomes
• Lessons learned and recommendations
• Post-launch optimization roadmap

All deliverables will be reviewed and approved by ${clientName} stakeholders before final handoff.`;

    const investment = `Based on our comprehensive PCI analysis, the investment required for ${projectTitle} is structured as follows:

**Effort Summary:**
• Total Estimated Effort: ${totalPCI?.toFixed(1) || '0'} PCI units
• Approximate Hours: ${totalHours?.toFixed(0) || '0'} hours
• Team Composition: Mixed skillset of senior and mid-level engineers
• Timeline: ${timeline || '8-12 weeks'}

**Investment Breakdown:**${budget ? `\n• Budget Range: ${budget}` : ''}
• Development: $${((totalCost || 0) * 0.65).toFixed(0)} (65% of effort)
• Design & UX: $${((totalCost || 0) * 0.15).toFixed(0)} (15% of effort)
• Testing & QA: $${((totalCost || 0) * 0.12).toFixed(0)} (12% of effort)
• Project Management: $${((totalCost || 0) * 0.08).toFixed(0)} (8% of effort)

**Total Project Investment: $${totalCost?.toFixed(0) || '0'}**

**Payment Terms:**
• 30% upon contract signing and project kickoff
• 40% upon completion of development phase
• 30% upon final delivery and acceptance

This investment includes:
✓ All development and design work
✓ Project management and coordination
✓ Quality assurance and testing
✓ Documentation and training
✓ 30 days of post-launch support

Additional services (extended support, maintenance, enhancements) are available under separate agreement.`;

    const termsConditions = `**1. Scope of Work**
This proposal covers the work described in the Scope section. Any additional features or changes will be subject to a change request process and may impact timeline and budget.

**2. Project Timeline**
The estimated timeline of ${timeline || '8-12 weeks'} assumes timely availability of ${clientName} resources, prompt feedback on deliverables, and no major scope changes.

**3. Payment Terms**
Payments will be made according to the schedule outlined in the Investment section. Late payments may result in work stoppage and timeline delays.

**4. Intellectual Property**
Upon final payment, all custom-developed code and deliverables become the property of ${clientName}. ${companyName} retains rights to any pre-existing frameworks, libraries, or tools used in development.

**5. Confidentiality**
Both parties agree to maintain confidentiality of proprietary information shared during the project. A separate NDA can be executed if required.

**6. Warranties & Limitations**
${companyName} warrants that all work will be performed in a professional manner consistent with industry standards. Software is provided "as-is" after the 30-day support period.

**7. Support & Maintenance**
This proposal includes 30 days of post-launch support. Extended support and maintenance services are available under separate agreement.

**8. Acceptance Criteria**
Deliverables will be considered accepted when ${clientName} provides written approval or after 5 business days without feedback.

**9. Termination**
Either party may terminate this agreement with 30 days written notice. ${clientName} will be responsible for payment for work completed through the termination date.

**10. Governing Law**
This agreement shall be governed by the laws of the jurisdiction in which ${companyName} operates.

By proceeding with this proposal, both parties agree to these terms and conditions.`;

    return c.json({
      executiveSummary,
      projectDescription,
      scope,
      methodology,
      timeline: timelineText,
      deliverables,
      investment,
      termsConditions,
    });
  } catch (error) {
    console.log(`Error generating proposal: ${error}`);
    return c.json({ error: 'Failed to generate proposal' }, 500);
  }
});

// Save proposal
app.post("/make-server-0dcd2201/proposals/save", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const proposalData = await c.req.json();
    const proposalId = crypto.randomUUID();

    const proposal = {
      id: proposalId,
      userId: user.id,
      ...proposalData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`proposal:${user.id}:${proposalId}`, proposal);

    // Create audit log
    await createAuditLog(user.id, 'create', 'proposal', proposalId, { proposal });

    return c.json({ 
      proposal,
      message: 'Proposal saved successfully' 
    });
  } catch (error) {
    console.log(`Error saving proposal: ${error}`);
    return c.json({ error: 'Failed to save proposal' }, 500);
  }
});

// Get all proposals
app.get("/make-server-0dcd2201/proposals", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const proposals = await kv.getByPrefix(`proposal:${user.id}:`);
    
    const validProposals = proposals
      .map(p => p.value)
      .filter(p => p != null)
      .sort((a: any, b: any) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

    return c.json({ 
      proposals: validProposals,
      count: validProposals.length 
    });
  } catch (error) {
    console.log(`Error fetching proposals: ${error}`);
    return c.json({ error: 'Failed to fetch proposals' }, 500);
  }
});

// Get AI task recommendations
app.post("/make-server-0dcd2201/proposals/task-recommendations", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const { projectTitle, projectType, industryContext, keyObjectives, existingTasks, timeline } = await c.req.json();

    // Generate AI-powered task recommendations based on industry standards
    const recommendations = [];

    // Common tasks across all project types
    const commonTasks = [
      {
        taskName: 'Quality Assurance & Testing',
        description: 'Comprehensive testing strategy including unit, integration, and end-to-end tests to ensure reliability and catch issues early.',
        estimatedPCI: 35.5,
        priority: 'high',
        rationale: `Critical for ${projectType || 'any project'} to ensure quality and prevent production issues. Industry standard recommends 20-30% of development effort.`
      },
      {
        taskName: 'Security & Compliance Review',
        description: 'Security audit, vulnerability scanning, and compliance checks (GDPR, HIPAA, SOC2 as applicable).',
        estimatedPCI: 28.0,
        priority: 'high',
        rationale: `Essential for ${industryContext || 'modern'} applications to protect user data and meet regulatory requirements.`
      },
      {
        taskName: 'Documentation & Knowledge Transfer',
        description: 'Technical documentation, API docs, user guides, and team training materials.',
        estimatedPCI: 22.5,
        priority: 'medium',
        rationale: 'Ensures long-term maintainability and smooth handoff. Often overlooked but critical for project success.'
      },
      {
        taskName: 'Performance Optimization',
        description: 'Load testing, performance profiling, caching strategy, and optimization of critical paths.',
        estimatedPCI: 31.0,
        priority: 'medium',
        rationale: `Important for user experience in ${projectType || 'production applications'}. Prevents scalability issues.`
      },
      {
        taskName: 'DevOps & CI/CD Pipeline',
        description: 'Automated deployment pipeline, monitoring setup, logging, and infrastructure as code.',
        estimatedPCI: 38.5,
        priority: 'high',
        rationale: 'Modern development standard. Reduces deployment risk and enables rapid iteration.'
      }
    ];

    // Industry-specific recommendations
    if (industryContext?.toLowerCase().includes('healthcare') || industryContext?.toLowerCase().includes('health')) {
      recommendations.push({
        taskName: 'HIPAA Compliance Implementation',
        description: 'Implement HIPAA-compliant data handling, encryption at rest and in transit, audit logging, and access controls.',
        estimatedPCI: 45.0,
        priority: 'high',
        rationale: 'Required for healthcare applications handling PHI. Non-compliance carries severe penalties.'
      });
    }

    if (industryContext?.toLowerCase().includes('fintech') || industryContext?.toLowerCase().includes('finance') || industryContext?.toLowerCase().includes('banking')) {
      recommendations.push({
        taskName: 'Financial Data Security & PCI DSS',
        description: 'PCI DSS compliance, secure payment processing, fraud detection, and financial data encryption.',
        estimatedPCI: 52.0,
        priority: 'high',
        rationale: 'Mandatory for applications handling payment card data. Critical for user trust and regulatory compliance.'
      });
    }

    if (industryContext?.toLowerCase().includes('ecommerce') || industryContext?.toLowerCase().includes('e-commerce') || industryContext?.toLowerCase().includes('retail')) {
      recommendations.push({
        taskName: 'E-commerce Analytics & Tracking',
        description: 'Implement analytics for user behavior, conversion tracking, cart abandonment analysis, and A/B testing framework.',
        estimatedPCI: 26.5,
        priority: 'medium',
        rationale: 'Essential for optimizing conversion rates and understanding user behavior in e-commerce platforms.'
      });
    }

    // Project type specific recommendations
    if (projectType?.toLowerCase().includes('mobile')) {
      recommendations.push({
        taskName: 'Mobile App Store Optimization',
        description: 'App store submission, screenshots, descriptions, ASO strategy, and compliance with store guidelines.',
        estimatedPCI: 18.5,
        priority: 'medium',
        rationale: 'Required for mobile app launch. Proper ASO increases discoverability and downloads.'
      });
    }

    if (projectType?.toLowerCase().includes('api')) {
      recommendations.push({
        taskName: 'API Rate Limiting & Monitoring',
        description: 'Implement rate limiting, API versioning strategy, monitoring dashboard, and usage analytics.',
        estimatedPCI: 24.0,
        priority: 'high',
        rationale: 'Critical for API stability and preventing abuse. Standard practice for production APIs.'
      });
    }

    // Check for missing common tasks
    const existingTaskNames = existingTasks.map((t: any) => t.taskName.toLowerCase());
    
    const missingCommonTasks = commonTasks.filter(rec => 
      !existingTaskNames.some(name => 
        name.includes(rec.taskName.toLowerCase().split(' ')[0]) ||
        rec.taskName.toLowerCase().includes(name)
      )
    );

    // Add missing common tasks first
    recommendations.push(...missingCommonTasks);

    // Add accessibility if not present
    if (!existingTaskNames.some(name => name.includes('accessibility') || name.includes('a11y'))) {
      recommendations.push({
        taskName: 'Accessibility (A11Y) Implementation',
        description: 'WCAG 2.1 AA compliance, screen reader support, keyboard navigation, and accessibility testing.',
        estimatedPCI: 29.0,
        priority: 'medium',
        rationale: 'Legal requirement in many jurisdictions (ADA, Section 508). Expands user base and improves UX for everyone.'
      });
    }

    // Add monitoring if not present
    if (!existingTaskNames.some(name => name.includes('monitoring') || name.includes('observability'))) {
      recommendations.push({
        taskName: 'Monitoring & Observability',
        description: 'Error tracking, application monitoring, uptime monitoring, and alerting system setup.',
        estimatedPCI: 21.5,
        priority: 'high',
        rationale: 'Essential for production applications. Enables proactive issue resolution and reduces downtime.'
      });
    }

    // Sort by priority and return top recommendations
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sortedRecommendations = recommendations.sort((a, b) => 
      priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
    );

    return c.json({
      recommendations: sortedRecommendations.slice(0, 8) // Return top 8 recommendations
    });
  } catch (error) {
    console.log(`Error getting task recommendations: ${error}`);
    return c.json({ error: 'Failed to get task recommendations' }, 500);
  }
});

// Get AI budget recommendations
app.post("/make-server-0dcd2201/proposals/budget-recommendations", async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.header('Authorization'));
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }

    const { projectTitle, projectType, currentCost, proposedBudget, tasks } = await c.req.json();

    const overage = currentCost - proposedBudget;
    const overagePercent = ((overage / proposedBudget) * 100).toFixed(1);

    // Calculate recommended budget with 15% contingency
    const recommendedBudget = Math.ceil(currentCost * 1.15);

    const breakdown = `• Development: $${(recommendedBudget * 0.65).toFixed(0)} (65%)
• Design & UX: $${(recommendedBudget * 0.15).toFixed(0)} (15%)
• Testing & QA: $${(recommendedBudget * 0.12).toFixed(0)} (12%)
• Project Management: $${(recommendedBudget * 0.08).toFixed(0)} (8%)

This includes a 15% contingency buffer for unforeseen complexities and scope adjustments.`;

    const justification = `Based on our PCI analysis of ${tasks.length} tasks for ${projectTitle}, the estimated cost of $${currentCost.toFixed(0)} exceeds the proposed budget of $${proposedBudget.toFixed(0)} by $${overage.toFixed(0)} (${overagePercent}%). 

This variance is typical for ${projectType || 'complex software projects'} and reflects the comprehensive scope required for successful delivery. Our recommendation accounts for all critical deliverables, quality assurance, and industry best practices.`;

    const alternatives = [
      `Phase 1 approach: Deliver MVP within budget ($${proposedBudget.toFixed(0)}) with core features, then Phase 2 for remaining functionality`,
      `Value engineering: Identify 20-30% scope reduction through feature prioritization to fit budget`,
      `Extended timeline: Spread development over ${Math.ceil((currentCost / proposedBudget) * 12)} months instead of proposed timeline to reduce monthly burn rate`,
      `Hybrid approach: Use lower-cost resources for non-critical tasks while maintaining quality on core features`
    ];

    return c.json({
      recommendedBudget: `$${recommendedBudget.toLocaleString()} (with 15% contingency)`,
      breakdown,
      justification,
      alternatives
    });
  } catch (error) {
    console.log(`Error getting budget recommendations: ${error}`);
    return c.json({ error: 'Failed to get budget recommendations' }, 500);
  }
});

// ============================================
// PROJECT AUDIT ROUTES
// ============================================

// Organize pasted tasks with AI
app.post("/make-server-0dcd2201/audit-project/organize-tasks", async (c) => {
  try {
    const { pastedData } = await c.req.json();
    
    if (!pastedData) {
      return c.json({ error: 'No data provided' }, 400);
    }

    // Parse the pasted data and extract tasks
    // This is a simple parser - in production, you'd use a more sophisticated AI service
    const lines = pastedData.split('\n').filter((line: string) => line.trim());
    const tasks = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Remove common prefixes like bullets, numbers, etc.
      let taskLine = trimmed.replace(/^[-*•]\s*/, '').replace(/^\d+[\.)]\s*/, '');

      // Try to extract hours and cost using regex
      const hoursMatch = taskLine.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)/i);
      const costMatch = taskLine.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);

      let estimatedHours = 0;
      let estimatedCost = 0;
      let taskName = taskLine;

      if (hoursMatch) {
        estimatedHours = parseFloat(hoursMatch[1]);
        taskName = taskName.replace(hoursMatch[0], '').trim();
      }

      if (costMatch) {
        estimatedCost = parseFloat(costMatch[1].replace(/,/g, ''));
        taskName = taskName.replace(costMatch[0], '').trim();
      }

      // Clean up task name - remove parentheses with metadata
      taskName = taskName.replace(/\([^)]*\)/g, '').trim();
      taskName = taskName.replace(/,\s*$/, '').trim();

      // Skip empty lines
      if (!taskName) continue;

      // If no hours specified, estimate based on task complexity
      if (estimatedHours === 0) {
        const taskLower = taskName.toLowerCase();
        if (taskLower.includes('design') || taskLower.includes('ui') || taskLower.includes('ux')) {
          estimatedHours = 8;
        } else if (taskLower.includes('integration') || taskLower.includes('api')) {
          estimatedHours = 12;
        } else if (taskLower.includes('testing') || taskLower.includes('qa')) {
          estimatedHours = 6;
        } else if (taskLower.includes('deploy') || taskLower.includes('setup')) {
          estimatedHours = 4;
        } else {
          estimatedHours = 8; // Default
        }
      }

      // If no cost specified, estimate based on hours
      if (estimatedCost === 0 && estimatedHours > 0) {
        estimatedCost = estimatedHours * 100; // $100/hour default rate
      }

      tasks.push({
        taskName,
        estimatedHours,
        estimatedCost,
        notes: ''
      });
    }

    return c.json({ 
      tasks,
      message: `Successfully organized ${tasks.length} tasks from pasted data`
    });
  } catch (error) {
    console.log(`Error organizing pasted tasks: ${error}`);
    return c.json({ error: 'Failed to organize tasks' }, 500);
  }
});

// ============================================
// CLIENT PORTAL ROUTES
// ============================================

// Get all client portals (requires auth)
app.get('/make-server-0dcd2201/client-portals', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const portals = await kv.getByPrefix('client_portal_');
    return c.json({ portals: portals || [] });
  } catch (error) {
    console.error('Error fetching client portals:', error);
    return c.json({ error: 'Failed to fetch portals' }, 500);
  }
});

// Create new client portal (requires auth)
app.post('/make-server-0dcd2201/client-portals', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const portal = await c.req.json();
    await kv.set(`client_portal_${portal.id}`, portal);
    
    // Create audit log
    await createAuditLog(
      user.id,
      'create',
      'client_portal',
      portal.id,
      { portal },
      { clientName: portal.clientName }
    );
    
    return c.json({ portal });
  } catch (error) {
    console.error('Error creating client portal:', error);
    return c.json({ error: 'Failed to create portal' }, 500);
  }
});

// Update client portal (requires auth)
app.put('/make-server-0dcd2201/client-portals/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const portalId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingPortal = await kv.get(`client_portal_${portalId}`);
    if (!existingPortal) {
      return c.json({ error: 'Portal not found' }, 404);
    }
    
    const updatedPortal = { ...existingPortal, ...updates };
    await kv.set(`client_portal_${portalId}`, updatedPortal);
    
    // Create audit log
    await createAuditLog(
      user.id,
      'update',
      'client_portal',
      portalId,
      { updates },
      { clientName: updatedPortal.clientName }
    );
    
    return c.json({ portal: updatedPortal });
  } catch (error) {
    console.error('Error updating client portal:', error);
    return c.json({ error: 'Failed to update portal' }, 500);
  }
});

// Delete client portal (requires auth)
app.delete('/make-server-0dcd2201/client-portals/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const portalId = c.req.param('id');
    await kv.del(`client_portal_${portalId}`);
    
    // Create audit log
    await createAuditLog(
      user.id,
      'delete',
      'client_portal',
      portalId,
      {},
      {}
    );
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting client portal:', error);
    return c.json({ error: 'Failed to delete portal' }, 500);
  }
});

// Authenticate to client portal (no auth required - uses password)
app.post('/make-server-0dcd2201/client-portals/:id/auth', async (c) => {
  try {
    const portalId = c.req.param('id');
    const { password } = await c.req.json();
    
    const portal = await kv.get(`client_portal_${portalId}`);
    if (!portal) {
      return c.json({ error: 'Portal not found' }, 404);
    }
    
    // Check if portal is active
    if (!portal.isActive) {
      return c.json({ error: 'Portal is not active' }, 403);
    }
    
    // Check if portal has expired
    if (portal.expiresAt && new Date(portal.expiresAt) < new Date()) {
      return c.json({ error: 'Portal has expired' }, 403);
    }
    
    // Verify password
    if (portal.password !== password) {
      return c.json({ error: 'Invalid password' }, 401);
    }
    
    // Get tasks and settings
    const tasks = await kv.get('tasks') || [];
    const settings = await kv.get('settings') || {};
    
    // Return portal data (without password)
    const { password: _, ...portalData } = portal;
    return c.json({
      ...portalData,
      projectName: settings.projectName || 'Project',
      companyName: settings.companyName || 'Company',
      tasks,
      settings,
    });
  } catch (error) {
    console.error('Error authenticating to portal:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

// Track portal access (no auth required)
app.post('/make-server-0dcd2201/client-portals/:id/track', async (c) => {
  try {
    const portalId = c.req.param('id');
    
    const portal = await kv.get(`client_portal_${portalId}`);
    if (!portal) {
      return c.json({ error: 'Portal not found' }, 404);
    }
    
    // Update access count and last accessed time
    const updatedPortal = {
      ...portal,
      accessCount: (portal.accessCount || 0) + 1,
      lastAccessedAt: new Date().toISOString(),
    };
    
    await kv.set(`client_portal_${portalId}`, updatedPortal);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error tracking portal access:', error);
    return c.json({ error: 'Failed to track access' }, 500);
  }
});

// Approve portal with e-signature (no auth required)
app.post('/make-server-0dcd2201/client-portals/:id/approve', async (c) => {
  try {
    const portalId = c.req.param('id');
    const approvalData = await c.req.json();
    
    const portal = await kv.get(`client_portal_${portalId}`);
    if (!portal) {
      return c.json({ error: 'Portal not found' }, 404);
    }
    
    // Update portal with approval data
    const updatedPortal = {
      ...portal,
      isApproved: true,
      approvedAt: approvalData.timestamp,
      approvedBy: approvalData.fullName,
      signature: approvalData.signature,
      approvalTitle: approvalData.title,
    };
    
    await kv.set(`client_portal_${portalId}`, updatedPortal);
    
    // Store approval separately for audit trail
    const approvalId = crypto.randomUUID();
    await kv.set(`portal_approval_${approvalId}`, {
      id: approvalId,
      portalId,
      ...approvalData,
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error approving portal:', error);
    return c.json({ error: 'Failed to approve portal' }, 500);
  }
});

// ============================================
// PROJECT ROUTES
// ============================================

// Get all projects (requires auth)
app.get('/make-server-0dcd2201/projects', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const projects = await kv.getByPrefix(`project_${user.id}_`);
    return c.json({ projects: projects || [] });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return c.json({ error: 'Failed to load projects' }, 500);
  }
});

// Get specific project (requires auth)
app.get('/make-server-0dcd2201/projects/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const projectId = c.req.param('id');
    const project = await kv.get(`project_${user.id}_${projectId}`);
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    return c.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return c.json({ error: 'Failed to load project' }, 500);
  }
});

// Create new project (requires auth)
app.post('/make-server-0dcd2201/projects', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const projectData = await c.req.json();
    
    // Store project
    await kv.set(`project_${user.id}_${projectData.id}`, projectData);
    
    // Create audit log
    await createAuditLog(user.id, 'create', 'project', projectData.id, projectData);
    
    return c.json({ project: projectData });
  } catch (error) {
    console.error('Error creating project:', error);
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

// Update project (requires auth)
app.put('/make-server-0dcd2201/projects/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const projectId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingProject = await kv.get(`project_${user.id}_${projectId}`);
    if (!existingProject) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    const updatedProject = {
      ...existingProject,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`project_${user.id}_${projectId}`, updatedProject);
    
    // Create audit log
    await createAuditLog(user.id, 'update', 'project', projectId, updates);
    
    return c.json({ project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    return c.json({ error: 'Failed to update project' }, 500);
  }
});

// Delete project (requires auth)
app.delete('/make-server-0dcd2201/projects/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const projectId = c.req.param('id');
    
    const existingProject = await kv.get(`project_${user.id}_${projectId}`);
    if (!existingProject) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    // Delete project
    await kv.del(`project_${user.id}_${projectId}`);
    
    // Delete associated tasks
    await kv.del(`project_tasks_${user.id}_${projectId}`);
    
    // Create audit log
    await createAuditLog(user.id, 'delete', 'project', projectId, {});
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return c.json({ error: 'Failed to delete project' }, 500);
  }
});

// Get tasks for a specific project (requires auth)
app.get('/make-server-0dcd2201/projects/:id/tasks', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const projectId = c.req.param('id');
    
    // Check if project exists
    const project = await kv.get(`project_${user.id}_${projectId}`);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    const tasks = await kv.get(`project_tasks_${user.id}_${projectId}`);
    return c.json({ tasks: tasks || [] });
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    return c.json({ error: 'Failed to load tasks' }, 500);
  }
});

// Save tasks to a specific project (requires auth)
app.post('/make-server-0dcd2201/projects/:id/tasks', async (c) => {
  const authHeader = c.req.header('Authorization');
  const { user, error } = await verifyAuth(authHeader);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }
  
  try {
    const projectId = c.req.param('id');
    const { tasks } = await c.req.json();
    
    // Check if project exists
    const project = await kv.get(`project_${user.id}_${projectId}`);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    // Save tasks
    await kv.set(`project_tasks_${user.id}_${projectId}`, tasks);
    
    // Update project metadata
    const totalPCI = tasks.reduce((sum: number, task: any) => {
      const pci = (task.ISR * task.CF * task.UXI) + (task.RCF * task.AEP - task.L) + 
                  (task.MLW * task.CGW * task.RF) + (task.S * task.GLRI);
      return sum + Math.max(0, pci);
    }, 0);
    
    const totalCost = tasks.reduce((sum: number, task: any) => {
      const pci = (task.ISR * task.CF * task.UXI) + (task.RCF * task.AEP - task.L) + 
                  (task.MLW * task.CGW * task.RF) + (task.S * task.GLRI);
      const verifiedUnits = (task.aiVerifiedUnits / Math.max(0.01, pci)) * pci;
      return sum + (verifiedUnits * 66); // Default hourly rate
    }, 0);
    
    const updatedProject = {
      ...project,
      taskCount: tasks.length,
      totalPCI,
      totalCost,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`project_${user.id}_${projectId}`, updatedProject);
    
    // Create audit log
    await createAuditLog(user.id, 'update', 'project', projectId, { 
      action: 'saved_tasks', 
      taskCount: tasks.length 
    });
    
    return c.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error('Error saving project tasks:', error);
    return c.json({ error: 'Failed to save tasks' }, 500);
  }
});

// Register all new routes from new-routes.tsx
registerNewRoutes(app, verifyAuth, kv, createAuditLog);

Deno.serve(app.fetch);
import { useState } from 'react';
import { BarChart3, Calculator, TrendingUp, AlertCircle, CheckCircle, Clock, DollarSign, FileText, Download, Play, Pause, CheckSquare, Calendar, Target, Upload, Sparkles, Plus, Trash2, ChevronDown, ChevronRight, X, Clipboard, Layers, List, ArrowRight, History, GitBranch, Eye, Code, Copy, CheckCheck, Building2, Cpu, Users } from 'lucide-react';
import type { Settings } from '../App';
import jsPDF from 'jspdf';
import * as api from '../services/api';

interface ProjectAuditProps {
  settings: Settings;
}

type RoleType = 'developer' | 'designer' | 'pm' | 'qa' | 'architect' | 'other';
type ComplexityLevel = 'low' | 'medium' | 'high' | 'critical';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface Subtask {
  id: string;
  name: string;
  estimatedHours: number;
  roleType: RoleType;
  costRate: number;
  complexityScore: ComplexityLevel;
  riskLevel: RiskLevel;
  actualHours: number;
  actualCost: number;
  status: 'not-started' | 'in-progress' | 'completed';
  isExpanded: boolean;
}

interface Task {
  id: string;
  name: string;
  estimatedHours: number;
  roleType: RoleType;
  costRate: number;
  complexityScore: ComplexityLevel;
  riskLevel: RiskLevel;
  actualHours: number;
  actualCost: number;
  status: 'not-started' | 'in-progress' | 'completed';
  subtasks: Subtask[];
  isExpanded: boolean;
}

interface Epic {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  isExpanded: boolean;
}

interface ProjectBaseline {
  projectName: string;
  totalBudget: number;
  startDate: string;
  endDate: string;
  epics: Epic[];
}

interface VersionLog {
  id: string;
  versionNumber: number;
  timestamp: string;
  user: string;
  changeSummary: string;
  snapshot: ProjectBaseline;
}

const ROLE_TYPES: { value: RoleType; label: string; defaultRate: number }[] = [
  { value: 'developer', label: 'Developer', defaultRate: 100 },
  { value: 'designer', label: 'Designer', defaultRate: 90 },
  { value: 'pm', label: 'Project Manager', defaultRate: 110 },
  { value: 'qa', label: 'QA Engineer', defaultRate: 80 },
  { value: 'architect', label: 'Architect', defaultRate: 130 },
  { value: 'other', label: 'Other', defaultRate: 75 },
];

const COMPLEXITY_LEVELS: { value: ComplexityLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' },
];

const RISK_LEVELS: { value: RiskLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700' },
  { value: 'medium', label: 'Medium', color: 'bg-purple-100 text-purple-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' },
];

export function ProjectAudit({ settings }: ProjectAuditProps) {
  const [baseline, setBaseline] = useState<ProjectBaseline>({
    projectName: '',
    totalBudget: 0,
    startDate: '',
    endDate: '',
    epics: [],
  });

  const [showSetup, setShowSetup] = useState(true);

  // Multi-Dimensional Estimation Panel State
  const [estimationPanel, setEstimationPanel] = useState({
    estimatedHours: 0,
    estimatedCost: 0,
    complexityScore: 50, // 0-100 slider
    riskLevel: 'medium' as RiskLevel,
    bufferPercentage: 15, // Optional buffer
  });

  const [showEstimationPanel, setShowEstimationPanel] = useState(true);

  // Version Control State
  const [versionHistory, setVersionHistory] = useState<VersionLog[]>([]);
  const [showVersionLog, setShowVersionLog] = useState(false);
  const [selectedVersion1, setSelectedVersion1] = useState<string | null>(null);
  const [selectedVersion2, setSelectedVersion2] = useState<string | null>(null);
  const [showDiffView, setShowDiffView] = useState(false);
  const [currentUser] = useState('Current User'); // In real app, get from auth

  // AI Scope Change Reason Generator State
  const [showAIReasonGenerator, setShowAIReasonGenerator] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiReasons, setAiReasons] = useState<string[]>([]);
  const [selectedVersionForAI, setSelectedVersionForAI] = useState<string | null>(null);

  // Justification Builder State
  const [showJustificationBuilder, setShowJustificationBuilder] = useState(false);
  const [justificationsGenerating, setJustificationsGenerating] = useState(false);
  const [businessJustification, setBusinessJustification] = useState('');
  const [technicalJustification, setTechnicalJustification] = useState('');
  const [clientImpactSummary, setClientImpactSummary] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [selectedVersionForJustification, setSelectedVersionForJustification] = useState<string | null>(null);

  // Create Version Snapshot
  const createVersionSnapshot = (changeSummary: string) => {
    const newVersion: VersionLog = {
      id: Date.now().toString(),
      versionNumber: versionHistory.length + 1,
      timestamp: new Date().toISOString(),
      user: currentUser,
      changeSummary,
      snapshot: JSON.parse(JSON.stringify(baseline)), // Deep clone
    };
    setVersionHistory([newVersion, ...versionHistory]);
  };

  // Restore Version
  const restoreVersion = (versionId: string) => {
    const version = versionHistory.find(v => v.id === versionId);
    if (version && confirm(`Restore to Version ${version.versionNumber}?`)) {
      setBaseline(JSON.parse(JSON.stringify(version.snapshot)));
      createVersionSnapshot(`Restored to v${version.versionNumber}`);
    }
  };

  // Generate AI Reasons for Scope Changes
  const generateAIReasons = async (versionId: string) => {
    setAiGenerating(true);
    setAiReasons([]);
    
    try {
      const version = versionHistory.find(v => v.id === versionId);
      if (!version) return;

      const versionIndex = versionHistory.findIndex(v => v.id === versionId);
      const previousVersion = versionHistory[versionIndex + 1];

      // Prepare input data for AI
      const changes = {
        currentVersion: version.versionNumber,
        timestamp: new Date(version.timestamp).toLocaleString(),
        changeSummary: version.changeSummary,
        previousSnapshot: previousVersion?.snapshot || null,
        currentSnapshot: version.snapshot,
      };

      // Analyze changes
      const inputData = analyzeVersionChanges(changes.previousSnapshot, changes.currentSnapshot);

      // Simulate AI generation (in real app, call actual AI API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate reasons based on detected changes
      const reasons: string[] = [];

      if (inputData.budgetChange !== 0) {
        if (inputData.budgetChange > 0) {
          reasons.push(`Budget increased by ${Math.abs(inputData.budgetChange).toFixed(1)}% to accommodate additional scope and resource requirements identified during planning.`);
        } else {
          reasons.push(`Budget reduced by ${Math.abs(inputData.budgetChange).toFixed(1)}% due to scope optimization and resource reallocation strategies.`);
        }
      }

      if (inputData.epicsAdded > 0) {
        reasons.push(`${inputData.epicsAdded} new epic(s) added to address emerging requirements and stakeholder feedback, expanding project scope to deliver additional value.`);
      }

      if (inputData.epicsRemoved > 0) {
        reasons.push(`${inputData.epicsRemoved} epic(s) removed following priority reassessment and alignment with core business objectives.`);
      }

      if (inputData.tasksAdded > 0) {
        reasons.push(`${inputData.tasksAdded} new task(s) introduced to break down complex deliverables and improve project tracking granularity.`);
      }

      if (inputData.tasksRemoved > 0) {
        reasons.push(`${inputData.tasksRemoved} task(s) consolidated or removed to streamline workflow and eliminate redundant activities.`);
      }

      if (inputData.epicModifications > 0) {
        reasons.push(`${inputData.epicModifications} epic(s) modified to refine scope definition and align with updated technical specifications.`);
      }

      if (inputData.estimatedHoursChange !== 0) {
        const direction = inputData.estimatedHoursChange > 0 ? 'increased' : 'decreased';
        reasons.push(`Total estimated hours ${direction} by ${Math.abs(inputData.estimatedHoursChange)} hours based on refined effort estimation and team capacity analysis.`);
      }

      // Add general insights
      if (reasons.length === 0) {
        reasons.push('Minor scope adjustments made to maintain project alignment with strategic goals.');
      }

      reasons.push('Change reflects iterative planning approach and continuous stakeholder engagement.');
      reasons.push(`Version ${version.versionNumber} represents natural project evolution in response to new information and market insights.`);

      setAiReasons(reasons);
    } catch (error) {
      console.error('AI generation error:', error);
      setAiReasons(['Error generating AI reasons. Please try again.']);
    } finally {
      setAiGenerating(false);
    }
  };

  // Analyze changes between versions
  const analyzeVersionChanges = (prev: ProjectBaseline | null, current: ProjectBaseline) => {
    if (!prev) {
      return {
        budgetChange: 0,
        epicsAdded: current.epics.length,
        epicsRemoved: 0,
        tasksAdded: current.epics.reduce((sum, e) => sum + e.tasks.length, 0),
        tasksRemoved: 0,
        epicModifications: 0,
        estimatedHoursChange: 0,
      };
    }

    const budgetChange = ((current.totalBudget - prev.totalBudget) / prev.totalBudget) * 100;
    const epicsAdded = current.epics.filter(e => !prev.epics.find(pe => pe.id === e.id)).length;
    const epicsRemoved = prev.epics.filter(e => !current.epics.find(ce => ce.id === e.id)).length;
    
    const prevTasks = prev.epics.reduce((sum, e) => sum + e.tasks.length, 0);
    const currentTasks = current.epics.reduce((sum, e) => sum + e.tasks.length, 0);
    const tasksAdded = Math.max(0, currentTasks - prevTasks);
    const tasksRemoved = Math.max(0, prevTasks - currentTasks);

    const epicModifications = current.epics.filter(ce => {
      const pe = prev.epics.find(e => e.id === ce.id);
      return pe && (pe.name !== ce.name || pe.tasks.length !== ce.tasks.length);
    }).length;

    const prevHours = prev.epics.reduce((sum, e) => 
      sum + e.tasks.reduce((s, t) => s + t.estimatedHours + t.subtasks.reduce((ss, st) => ss + st.estimatedHours, 0), 0), 0
    );
    const currentHours = current.epics.reduce((sum, e) => 
      sum + e.tasks.reduce((s, t) => s + t.estimatedHours + t.subtasks.reduce((ss, st) => ss + st.estimatedHours, 0), 0), 0
    );
    const estimatedHoursChange = currentHours - prevHours;

    return {
      budgetChange,
      epicsAdded,
      epicsRemoved,
      tasksAdded,
      tasksRemoved,
      epicModifications,
      estimatedHoursChange,
    };
  };

  // Export AI Reasons
  const exportAIReasons = () => {
    if (!selectedVersionForAI || aiReasons.length === 0) return;

    const version = versionHistory.find(v => v.id === selectedVersionForAI);
    if (!version) return;

    const content = `
AI-Generated Scope Change Analysis
===================================

Project: ${baseline.projectName}
Version: v${version.versionNumber}
Timestamp: ${new Date(version.timestamp).toLocaleString()}
User: ${version.user}
Change Summary: ${version.changeSummary}

Scope Change Reasons:
${aiReasons.map((reason, i) => `${i + 1}. ${reason}`).join('\n')}

---
Generated by PCI Engine - AI Audit Intelligence
${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scope-change-reasons-v${version.versionNumber}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate Justifications
  const generateJustifications = async (versionId: string) => {
    setJustificationsGenerating(true);
    setBusinessJustification('');
    setTechnicalJustification('');
    setClientImpactSummary('');

    try {
      const version = versionHistory.find(v => v.id === versionId);
      if (!version) return;

      const versionIndex = versionHistory.findIndex(v => v.id === versionId);
      const previousVersion = versionHistory[versionIndex + 1];
      const inputData = analyzeVersionChanges(previousVersion?.snapshot || null, version.snapshot);

      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Generate Business Justification
      const businessJust = `
**Executive Summary**

The scope changes implemented in Version ${version.versionNumber} represent a strategic alignment with evolving business requirements and market conditions. This revision demonstrates our commitment to delivering maximum value while maintaining fiscal responsibility.

**Financial Impact**
${inputData.budgetChange !== 0 ? `
The ${inputData.budgetChange > 0 ? 'budget increase' : 'budget optimization'} of ${Math.abs(inputData.budgetChange).toFixed(1)}% reflects ${inputData.budgetChange > 0 ? 'expanded deliverables and resource requirements necessary to meet stakeholder expectations' : 'strategic resource reallocation and efficiency improvements that maintain project quality while reducing costs'}.
` : 'Budget remains aligned with original projections, demonstrating effective scope management.'}

**Strategic Value**
${inputData.epicsAdded > 0 ? `
The addition of ${inputData.epicsAdded} new epic(s) addresses critical market opportunities and stakeholder feedback. These enhancements position our deliverable to better compete in the marketplace and deliver measurable ROI through:
• Enhanced feature set addressing user pain points
• Competitive differentiation in key areas
• Long-term scalability and market adaptability
` : ''}
${inputData.tasksAdded > 0 ? `
Breaking down complex deliverables into ${inputData.tasksAdded} additional task(s) improves project visibility, reduces risk, and enables better resource allocation across the project lifecycle.
` : ''}

**Risk Mitigation**
This scope revision reduces delivery risk by providing clearer definition of deliverables, improved estimation accuracy, and better alignment with available resources and timeline constraints.

**ROI Justification**
The changes implemented are expected to deliver ${inputData.budgetChange > 0 ? 'a 2-3x return on the additional investment through improved user adoption, reduced support costs, and enhanced market positioning' : 'equivalent or superior value at optimized cost, improving overall project ROI and resource efficiency'}.
      `.trim();

      // Generate Technical Justification
      const technicalJust = `
**Technical Architecture Overview**

Version ${version.versionNumber} incorporates critical technical refinements that enhance system architecture, improve maintainability, and ensure long-term scalability.

**System Design Improvements**
${inputData.epicsAdded > 0 || inputData.tasksAdded > 0 ? `
The expanded scope includes ${inputData.epicsAdded} new epic(s) and ${inputData.tasksAdded} additional task(s) that address:
• Architectural patterns and best practices implementation
• Performance optimization and scalability enhancements
• Security hardening and compliance requirements
• Integration capabilities with third-party systems
• Data integrity and backup/recovery mechanisms
` : 'Refinements to existing architecture improve code quality and system performance.'}

**Technology Stack Considerations**
${inputData.estimatedHoursChange > 0 ? `
The additional ${Math.abs(inputData.estimatedHoursChange).toFixed(0)} hours allocated enable:
• Comprehensive unit and integration testing
• Code review and quality assurance processes
• Documentation and technical debt reduction
• Performance profiling and optimization
• Security vulnerability assessment and remediation
` : 'Optimized development hours focus on core functionality and critical path items.'}

**Development Methodology**
The scope changes support agile development practices with:
• Improved sprint planning and task breakdown
• Enhanced testability and continuous integration
• Better separation of concerns and modular design
• Reduced technical debt and improved code maintainability

**Infrastructure & DevOps**
${inputData.budgetChange > 0 ? 
'Infrastructure requirements have been reassessed to support the expanded feature set, including scalability planning, monitoring capabilities, and deployment automation.' : 
'Infrastructure remains optimized for current requirements with room for future growth.'}

**Quality Assurance**
Enhanced scope definition enables more thorough testing protocols, including automated testing, load testing, and user acceptance testing, ensuring a robust and reliable deliverable.

**Technical Risk Assessment**
The revised scope reduces technical risk through:
• Clearer technical specifications and acceptance criteria
• Better resource allocation for complex technical challenges
• Improved dependency management and third-party integration planning
• Enhanced error handling and system resilience
      `.trim();

      // Generate Client Impact Summary
      const clientImpact = `
**Client Impact Overview**

Version ${version.versionNumber} delivers tangible benefits and measurable improvements to the client experience, user satisfaction, and business outcomes.

**User Experience Enhancements**
${inputData.epicsAdded > 0 ? `
The ${inputData.epicsAdded} new epic(s) introduce user-facing improvements that directly address client feedback and market research findings:
• Streamlined workflows reducing user task completion time by 30-40%
• Enhanced interface design improving usability and accessibility
• New capabilities expanding use case coverage and user value
• Performance improvements reducing load times and system response
` : 'User experience refinements focus on polish and optimization of core workflows.'}

**Business Process Impact**
Clients will experience:
• ${inputData.tasksAdded > 0 ? `Expanded functionality supporting ${inputData.tasksAdded} new business processes` : 'Optimized core business processes'}
• Reduced manual effort through automation and intelligent workflows
• Improved data visibility and reporting capabilities
• Enhanced collaboration and communication features
• Better mobile and remote work support

**Timeline & Delivery Expectations**
${inputData.estimatedHoursChange > 0 ? `
The scope expansion requires an additional ${Math.abs(inputData.estimatedHoursChange).toFixed(0)} development hours, which translates to ${Math.ceil(inputData.estimatedHoursChange / 40)} additional week(s) of development time. This investment ensures quality delivery and comprehensive testing before client rollout.
` : 'Timeline remains aligned with original projections, with delivery on schedule.'}

**Training & Onboarding**
${inputData.epicsAdded > 0 ? 
'Expanded functionality will be supported by comprehensive training materials, video tutorials, and onboarding documentation to ensure smooth client adoption.' : 
'Existing training materials remain relevant with minor updates to reflect refinements.'}

**Support & Maintenance**
Post-delivery support includes:
• Dedicated onboarding assistance for the first 30 days
• Comprehensive documentation and knowledge base
• Regular maintenance updates and security patches
• Responsive technical support with SLA guarantees

**Measurable Outcomes**
Clients can expect:
• ${inputData.budgetChange > 0 ? '25-35% improvement in operational efficiency' : '15-20% improvement in operational efficiency'}
• Reduced error rates through improved validation and error handling
• Enhanced data accuracy and reporting reliability
• Improved user satisfaction scores and adoption rates
• Measurable ROI within 6-12 months of deployment

**Change Management**
We recommend a phased rollout approach with:
• Pilot program with select user groups
• Iterative feedback collection and refinement
• Gradual feature enablement to minimize disruption
• Comprehensive communication plan for stakeholders
      `.trim();

      setBusinessJustification(businessJust);
      setTechnicalJustification(technicalJust);
      setClientImpactSummary(clientImpact);
    } catch (error) {
      console.error('Justification generation error:', error);
      setBusinessJustification('Error generating justification. Please try again.');
      setTechnicalJustification('Error generating justification. Please try again.');
      setClientImpactSummary('Error generating justification. Please try again.');
    } finally {
      setJustificationsGenerating(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  // Export all justifications
  const exportJustifications = () => {
    if (!selectedVersionForJustification) return;

    const version = versionHistory.find(v => v.id === selectedVersionForJustification);
    if (!version) return;

    const content = `
SCOPE CHANGE JUSTIFICATION DOCUMENT
====================================

Project: ${baseline.projectName}
Version: v${version.versionNumber}
Date: ${new Date(version.timestamp).toLocaleString()}
Author: ${version.user}
Change Summary: ${version.changeSummary}

════════════════════════════════════════════════════════════════

BUSINESS JUSTIFICATION
════════════════════════════════════════════════════════════════

${businessJustification}

════════════════════════════════════════════════════════════════

TECHNICAL JUSTIFICATION
════════════════════════════════════════════════════════════════

${technicalJustification}

════════════════════════════════════════════════════════════════

CLIENT IMPACT SUMMARY
════════════════════════════════════════════════════════════════

${clientImpactSummary}

════════════════════════════════════════════════════════════════

Document generated by PCI Engine - AI Audit Intelligence
Generated: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scope-justification-v${version.versionNumber}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Add Epic
  const addEpic = () => {
    setBaseline({
      ...baseline,
      epics: [
        ...baseline.epics,
        {
          id: Date.now().toString(),
          name: 'New Epic',
          description: '',
          tasks: [],
          isExpanded: true,
        },
      ],
    });
  };

  // Update Epic
  const updateEpic = (epicId: string, updates: Partial<Epic>) => {
    setBaseline({
      ...baseline,
      epics: baseline.epics.map(e => (e.id === epicId ? { ...e, ...updates } : e)),
    });
  };

  // Delete Epic
  const deleteEpic = (epicId: string) => {
    setBaseline({
      ...baseline,
      epics: baseline.epics.filter(e => e.id !== epicId),
    });
  };

  // Add Task to Epic
  const addTask = (epicId: string) => {
    setBaseline({
      ...baseline,
      epics: baseline.epics.map(epic =>
        epic.id === epicId
          ? {
              ...epic,
              tasks: [
                ...epic.tasks,
                {
                  id: Date.now().toString(),
                  name: 'New Task',
                  estimatedHours: 8,
                  roleType: 'developer',
                  costRate: 100,
                  complexityScore: 'medium',
                  riskLevel: 'medium',
                  actualHours: 0,
                  actualCost: 0,
                  status: 'not-started',
                  subtasks: [],
                  isExpanded: false,
                },
              ],
            }
          : epic
      ),
    });
  };

  // Update Task
  const updateTask = (epicId: string, taskId: string, updates: Partial<Task>) => {
    setBaseline({
      ...baseline,
      epics: baseline.epics.map(epic =>
        epic.id === epicId
          ? {
              ...epic,
              tasks: epic.tasks.map(task =>
                task.id === taskId ? { ...task, ...updates } : task
              ),
            }
          : epic
      ),
    });
  };

  // Delete Task
  const deleteTask = (epicId: string, taskId: string) => {
    setBaseline({
      ...baseline,
      epics: baseline.epics.map(epic =>
        epic.id === epicId
          ? { ...epic, tasks: epic.tasks.filter(t => t.id !== taskId) }
          : epic
      ),
    });
  };

  // Add Subtask to Task
  const addSubtask = (epicId: string, taskId: string) => {
    setBaseline({
      ...baseline,
      epics: baseline.epics.map(epic =>
        epic.id === epicId
          ? {
              ...epic,
              tasks: epic.tasks.map(task =>
                task.id === taskId
                  ? {
                      ...task,
                      subtasks: [
                        ...task.subtasks,
                        {
                          id: Date.now().toString(),
                          name: 'New Subtask',
                          estimatedHours: 4,
                          roleType: 'developer',
                          costRate: 100,
                          complexityScore: 'low',
                          riskLevel: 'low',
                          actualHours: 0,
                          actualCost: 0,
                          status: 'not-started',
                          isExpanded: false,
                        },
                      ],
                    }
                  : task
              ),
            }
          : epic
      ),
    });
  };

  // Update Subtask
  const updateSubtask = (epicId: string, taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
    setBaseline({
      ...baseline,
      epics: baseline.epics.map(epic =>
        epic.id === epicId
          ? {
              ...epic,
              tasks: epic.tasks.map(task =>
                task.id === taskId
                  ? {
                      ...task,
                      subtasks: task.subtasks.map(subtask =>
                        subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
                      ),
                    }
                  : task
              ),
            }
          : epic
      ),
    });
  };

  // Delete Subtask
  const deleteSubtask = (epicId: string, taskId: string, subtaskId: string) => {
    setBaseline({
      ...baseline,
      epics: baseline.epics.map(epic =>
        epic.id === epicId
          ? {
              ...epic,
              tasks: epic.tasks.map(task =>
                task.id === taskId
                  ? { ...task, subtasks: task.subtasks.filter(s => s.id !== subtaskId) }
                  : task
              ),
            }
          : epic
      ),
    });
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalEstimatedHours = 0;
    let totalEstimatedCost = 0;
    let totalActualHours = 0;
    let totalActualCost = 0;
    let totalTasks = 0;
    let completedTasks = 0;

    baseline.epics.forEach(epic => {
      epic.tasks.forEach(task => {
        totalTasks++;
        if (task.status === 'completed') completedTasks++;
        
        totalEstimatedHours += task.estimatedHours;
        totalEstimatedCost += task.estimatedHours * task.costRate;
        totalActualHours += task.actualHours;
        totalActualCost += task.actualCost;

        task.subtasks.forEach(subtask => {
          totalTasks++;
          if (subtask.status === 'completed') completedTasks++;
          
          totalEstimatedHours += subtask.estimatedHours;
          totalEstimatedCost += subtask.estimatedHours * subtask.costRate;
          totalActualHours += subtask.actualHours;
          totalActualCost += subtask.actualCost;
        });
      });
    });

    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalEstimatedHours,
      totalEstimatedCost,
      totalActualHours,
      totalActualCost,
      totalTasks,
      completedTasks,
      completionPercentage,
      isOverBudget: totalEstimatedCost > baseline.totalBudget,
    };
  };

  const totals = calculateTotals();

  // Export PDF
  const handleDownloadReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Header
    doc.setFillColor('#010029');
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Project Audit Report', margin, 25);
    yPosition = 50;
    doc.setTextColor(0, 0, 0);

    // Project Info
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(baseline.projectName || 'Untitled Project', margin, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 15;
    doc.setTextColor(0, 0, 0);

    // Summary
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(43, 187, 239);
    doc.text('Executive Summary', margin, yPosition);
    yPosition += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const summaryLines = [
      `Total Estimated Hours: ${totals.totalEstimatedHours.toFixed(1)}`,
      `Total Estimated Cost: $${totals.totalEstimatedCost.toFixed(2)}`,
      `Project Budget: $${baseline.totalBudget.toFixed(2)}`,
      `Completion: ${totals.completionPercentage.toFixed(1)}%`,
      `Epics: ${baseline.epics.length}`,
      `Total Tasks: ${totals.totalTasks}`,
    ];

    summaryLines.forEach(line => {
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });

    const filename = `${(baseline.projectName || 'Project').replace(/[^a-z0-9]/gi, '_')}_Audit_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#010029]" style={{ fontSize: '28px', fontWeight: 700 }}>
            Project Audit Tracker
          </h2>
          <p className="text-gray-600" style={{ fontSize: '14px' }}>
            Hierarchical project planning with Epic → Task → Subtask structure
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!showSetup && (
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] px-4 py-2 text-white transition-opacity hover:opacity-90"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          )}
        </div>
      </div>

      {showSetup ? (
        /* Setup View */
        <div className="flex gap-6">
          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Project Details */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2BBBEF]/10">
                  <Target className="h-5 w-5 text-[#2BBBEF]" />
                </div>
                <div>
                  <h3 className="text-[#010029]" style={{ fontSize: '18px', fontWeight: 600 }}>
                    Project Information
                  </h3>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={baseline.projectName}
                    onChange={(e) => setBaseline({ ...baseline, projectName: e.target.value })}
                    placeholder="My Project"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-[#2BBBEF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>
                    Total Budget *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={baseline.totalBudget || ''}
                      onChange={(e) => setBaseline({ ...baseline, totalBudget: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pl-8 focus:border-[#2BBBEF] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>
                    <Calendar className="h-4 w-4 text-[#2BBBEF]" />
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={baseline.startDate}
                      onChange={(e) => setBaseline({ ...baseline, startDate: e.target.value })}
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-[#2BBBEF] focus:outline-none"
                      style={{ fontSize: '14px', colorScheme: 'light' }}
                    />
                    <Calendar className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-gray-700" style={{ fontSize: '14px', fontWeight: 500 }}>
                    <Calendar className="h-4 w-4 text-[#2BBBEF]" />
                    End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={baseline.endDate}
                      onChange={(e) => setBaseline({ ...baseline, endDate: e.target.value })}
                      className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-[#2BBBEF] focus:outline-none"
                      style={{ fontSize: '14px', colorScheme: 'light' }}
                    />
                    <Calendar className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-Dimensional Estimation Panel */}
            <div className="rounded-xl border-2 border-[#4AFFA8] bg-gradient-to-br from-green-50 to-cyan-50 p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4AFFA8] to-[#2BBBEF]">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[#010029]" style={{ fontSize: '18px', fontWeight: 600 }}>
                      Multi-Dimensional Estimation
                    </h3>
                    <p className="text-gray-600" style={{ fontSize: '13px' }}>
                      Quick project estimation with complexity and risk factors
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEstimationPanel(!showEstimationPanel)}
                  className="rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-gray-50"
                >
                  {showEstimationPanel ? (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>

              {showEstimationPanel && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Estimated Hours */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                        <Clock className="h-4 w-4 text-[#2BBBEF]" />
                        Estimated Hours
                      </label>
                      <input
                        type="number"
                        value={estimationPanel.estimatedHours || ''}
                        onChange={(e) => setEstimationPanel({ ...estimationPanel, estimatedHours: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 focus:border-[#2BBBEF] focus:outline-none"
                        style={{ fontSize: '15px' }}
                      />
                    </div>

                    {/* Estimated Cost */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                        <DollarSign className="h-4 w-4 text-[#2BBBEF]" />
                        Estimated Cost
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" style={{ fontSize: '15px' }}>$</span>
                        <input
                          type="number"
                          value={estimationPanel.estimatedCost || ''}
                          onChange={(e) => setEstimationPanel({ ...estimationPanel, estimatedCost: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 pl-9 focus:border-[#2BBBEF] focus:outline-none"
                          style={{ fontSize: '15px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Complexity Score Slider */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                        <BarChart3 className="h-4 w-4 text-[#2BBBEF]" />
                        Complexity Score
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-[#010029]" style={{ fontSize: '14px', fontWeight: 700 }}>
                          {estimationPanel.complexityScore}
                        </span>
                        <span className="text-gray-600" style={{ fontSize: '12px' }}>/ 100</span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={estimationPanel.complexityScore}
                        onChange={(e) => setEstimationPanel({ ...estimationPanel, complexityScore: parseInt(e.target.value) })}
                        className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #4AFFA8 0%, #2BBBEF ${estimationPanel.complexityScore}%, #e5e7eb ${estimationPanel.complexityScore}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>Low</span>
                        <span>Medium</span>
                        <span>High</span>
                        <span>Critical</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Risk Level Dropdown */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                        <AlertCircle className="h-4 w-4 text-[#2BBBEF]" />
                        Risk Level
                      </label>
                      <select
                        value={estimationPanel.riskLevel}
                        onChange={(e) => setEstimationPanel({ ...estimationPanel, riskLevel: e.target.value as RiskLevel })}
                        className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 focus:border-[#2BBBEF] focus:outline-none"
                        style={{ fontSize: '14px' }}
                      >
                        {RISK_LEVELS.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Buffer Percentage */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                        <Calculator className="h-4 w-4 text-[#2BBBEF]" />
                        Buffer Percentage (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={estimationPanel.bufferPercentage || ''}
                          onChange={(e) => setEstimationPanel({ ...estimationPanel, bufferPercentage: parseFloat(e.target.value) || 0 })}
                          placeholder="15"
                          min="0"
                          max="100"
                          className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 pr-10 focus:border-[#2BBBEF] focus:outline-none"
                          style={{ fontSize: '14px' }}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" style={{ fontSize: '14px' }}>%</span>
                      </div>
                    </div>
                  </div>

                  {/* Real-Time Calculation */}
                  <div className="rounded-lg border-2 border-[#2BBBEF] bg-white p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-[#2BBBEF]" />
                      <h4 className="text-[#010029]" style={{ fontSize: '16px', fontWeight: 700 }}>
                        Calculated Totals
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-600" style={{ fontSize: '14px' }}>Base Cost</span>
                        <span className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                          ${estimationPanel.estimatedCost.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-600" style={{ fontSize: '14px' }}>
                          Complexity Multiplier ({estimationPanel.complexityScore}%)
                        </span>
                        <span className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                          +${((estimationPanel.estimatedCost * estimationPanel.complexityScore) / 100).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-600" style={{ fontSize: '14px' }}>
                          Buffer ({estimationPanel.bufferPercentage}%)
                        </span>
                        <span className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                          +${(((estimationPanel.estimatedCost + (estimationPanel.estimatedCost * estimationPanel.complexityScore) / 100) * estimationPanel.bufferPercentage) / 100).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] p-4">
                        <span className="text-white" style={{ fontSize: '16px', fontWeight: 700 }}>
                          TOTAL ESTIMATED COST
                        </span>
                        <span className="text-white" style={{ fontSize: '24px', fontWeight: 700 }}>
                          ${(() => {
                            const base = estimationPanel.estimatedCost;
                            const withComplexity = base + (base * estimationPanel.complexityScore) / 100;
                            const withBuffer = withComplexity + (withComplexity * estimationPanel.bufferPercentage) / 100;
                            return withBuffer.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          })()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                        <AlertCircle className={`h-4 w-4 ${(() => {
                          if (estimationPanel.riskLevel === 'critical') return 'text-red-600';
                          if (estimationPanel.riskLevel === 'high') return 'text-orange-600';
                          if (estimationPanel.riskLevel === 'medium') return 'text-purple-600';
                          return 'text-blue-600';
                        })()}`} />
                        <p className="text-gray-700" style={{ fontSize: '12px' }}>
                          <strong>Risk Level: {estimationPanel.riskLevel.charAt(0).toUpperCase() + estimationPanel.riskLevel.slice(1)}</strong>
                          {' '}• Consider additional contingency for {estimationPanel.riskLevel} risk projects
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hierarchical Task List */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
                    <Layers className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[#010029]" style={{ fontSize: '18px', fontWeight: 600 }}>
                      Epics, Tasks & Subtasks
                    </h3>
                    <p className="text-gray-500" style={{ fontSize: '13px' }}>
                      Build your project hierarchy with detailed estimates
                    </p>
                  </div>
                </div>
                <button
                  onClick={addEpic}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] px-4 py-2 text-white transition-opacity hover:opacity-90"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  <Plus className="h-4 w-4" />
                  Add Epic
                </button>
              </div>

              {baseline.epics.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                  <Layers className="mx-auto mb-3 h-16 w-16 text-gray-300" />
                  <p className="mb-2 text-gray-900" style={{ fontSize: '16px', fontWeight: 600 }}>
                    No epics yet
                  </p>
                  <p className="mb-4 text-gray-500" style={{ fontSize: '14px' }}>
                    Start by creating your first epic to organize tasks
                  </p>
                  <button
                    onClick={addEpic}
                    className="rounded-lg border-2 border-[#2BBBEF] px-6 py-2.5 text-[#2BBBEF] transition-all hover:bg-[#2BBBEF] hover:text-white"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    Create First Epic
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {baseline.epics.map((epic, epicIndex) => (
                    <div key={epic.id} className="rounded-lg border-2 border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                      {/* Epic Header */}
                      <div className="border-b border-gray-200 bg-white/80 p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateEpic(epic.id, { isExpanded: !epic.isExpanded })}
                            className="rounded p-1 transition-colors hover:bg-gray-100"
                          >
                            {epic.isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-gray-600" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-600" />
                            )}
                          </button>
                          <Layers className="h-5 w-5 text-purple-600" />
                          <input
                            type="text"
                            value={epic.name}
                            onChange={(e) => updateEpic(epic.id, { name: e.target.value })}
                            className="flex-1 rounded border border-gray-200 bg-white px-3 py-1.5 font-semibold text-[#010029] focus:border-[#2BBBEF] focus:outline-none"
                            style={{ fontSize: '15px' }}
                            placeholder="Epic name"
                          />
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700" style={{ fontSize: '12px', fontWeight: 600 }}>
                            {epic.tasks.length} tasks
                          </span>
                          <button
                            onClick={() => addTask(epic.id)}
                            className="rounded-lg border border-[#2BBBEF] bg-white px-3 py-1.5 text-[#2BBBEF] transition-all hover:bg-[#2BBBEF] hover:text-white"
                            style={{ fontSize: '13px', fontWeight: 600 }}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteEpic(epic.id)}
                            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-red-600 transition-colors hover:bg-red-50"
                            style={{ fontSize: '13px' }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Epic Content */}
                      {epic.isExpanded && (
                        <div className="p-4">
                          {epic.tasks.length === 0 ? (
                            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
                              <List className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                              <p className="mb-3 text-gray-600" style={{ fontSize: '13px' }}>
                                No tasks in this epic yet
                              </p>
                              <button
                                onClick={() => addTask(epic.id)}
                                className="rounded-lg border border-[#2BBBEF] px-4 py-2 text-[#2BBBEF] transition-all hover:bg-[#2BBBEF] hover:text-white"
                                style={{ fontSize: '13px', fontWeight: 600 }}
                              >
                                Add First Task
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {epic.tasks.map(task => (
                                <div key={task.id} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                                  {/* Task Header */}
                                  <div className="border-b border-gray-100 bg-gray-50 p-3">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => updateTask(epic.id, task.id, { isExpanded: !task.isExpanded })}
                                        className="rounded p-1 transition-colors hover:bg-gray-200"
                                      >
                                        {task.isExpanded ? (
                                          <ChevronDown className="h-4 w-4 text-gray-600" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4 text-gray-600" />
                                        )}
                                      </button>
                                      <ArrowRight className="h-4 w-4 text-blue-600" />
                                      <input
                                        type="text"
                                        value={task.name}
                                        onChange={(e) => updateTask(epic.id, task.id, { name: e.target.value })}
                                        className="flex-1 rounded border border-gray-200 bg-white px-2 py-1 text-sm font-medium text-[#010029] focus:border-[#2BBBEF] focus:outline-none"
                                        placeholder="Task name"
                                      />
                                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700" style={{ fontSize: '11px', fontWeight: 600 }}>
                                        {task.subtasks.length} subtasks
                                      </span>
                                      <button
                                        onClick={() => addSubtask(epic.id, task.id)}
                                        className="rounded border border-gray-300 p-1 text-gray-600 transition-colors hover:bg-gray-100"
                                      >
                                        <Plus className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => deleteTask(epic.id, task.id)}
                                        className="rounded border border-red-300 p-1 text-red-600 transition-colors hover:bg-red-50"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Task Details */}
                                  {task.isExpanded && (
                                    <div className="p-3">
                                      <div className="mb-3 grid grid-cols-5 gap-2">
                                        <div>
                                          <label className="mb-1 block text-gray-600" style={{ fontSize: '11px', fontWeight: 500 }}>
                                            Est. Hours
                                          </label>
                                          <input
                                            type="number"
                                            value={task.estimatedHours || ''}
                                            onChange={(e) => updateTask(epic.id, task.id, { estimatedHours: parseFloat(e.target.value) || 0 })}
                                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-[#2BBBEF] focus:outline-none"
                                            placeholder="0"
                                          />
                                        </div>
                                        <div>
                                          <label className="mb-1 block text-gray-600" style={{ fontSize: '11px', fontWeight: 500 }}>
                                            Role Type
                                          </label>
                                          <select
                                            value={task.roleType}
                                            onChange={(e) => {
                                              const roleType = e.target.value as RoleType;
                                              const defaultRate = ROLE_TYPES.find(r => r.value === roleType)?.defaultRate || 100;
                                              updateTask(epic.id, task.id, { roleType, costRate: defaultRate });
                                            }}
                                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-[#2BBBEF] focus:outline-none"
                                          >
                                            {ROLE_TYPES.map(role => (
                                              <option key={role.value} value={role.value}>
                                                {role.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                        <div>
                                          <label className="mb-1 block text-gray-600" style={{ fontSize: '11px', fontWeight: 500 }}>
                                            Cost Rate
                                          </label>
                                          <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                                            <input
                                              type="number"
                                              value={task.costRate || ''}
                                              onChange={(e) => updateTask(epic.id, task.id, { costRate: parseFloat(e.target.value) || 0 })}
                                              className="w-full rounded border border-gray-200 py-1 pl-5 pr-2 text-sm focus:border-[#2BBBEF] focus:outline-none"
                                              placeholder="0"
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <label className="mb-1 block text-gray-600" style={{ fontSize: '11px', fontWeight: 500 }}>
                                            Complexity
                                          </label>
                                          <select
                                            value={task.complexityScore}
                                            onChange={(e) => updateTask(epic.id, task.id, { complexityScore: e.target.value as ComplexityLevel })}
                                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-[#2BBBEF] focus:outline-none"
                                          >
                                            {COMPLEXITY_LEVELS.map(level => (
                                              <option key={level.value} value={level.value}>
                                                {level.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                        <div>
                                          <label className="mb-1 block text-gray-600" style={{ fontSize: '11px', fontWeight: 500 }}>
                                            Risk Level
                                          </label>
                                          <select
                                            value={task.riskLevel}
                                            onChange={(e) => updateTask(epic.id, task.id, { riskLevel: e.target.value as RiskLevel })}
                                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-[#2BBBEF] focus:outline-none"
                                          >
                                            {RISK_LEVELS.map(level => (
                                              <option key={level.value} value={level.value}>
                                                {level.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>

                                      {/* Subtasks */}
                                      {task.subtasks.length > 0 && (
                                        <div className="space-y-2 border-t border-gray-100 pt-3">
                                          <p className="text-gray-600" style={{ fontSize: '12px', fontWeight: 600 }}>
                                            Subtasks:
                                          </p>
                                          {task.subtasks.map(subtask => (
                                            <div key={subtask.id} className="rounded border border-gray-200 bg-gray-50 p-2">
                                              <div className="mb-2 flex items-center gap-2">
                                                <input
                                                  type="text"
                                                  value={subtask.name}
                                                  onChange={(e) => updateSubtask(epic.id, task.id, subtask.id, { name: e.target.value })}
                                                  className="flex-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:border-[#2BBBEF] focus:outline-none"
                                                  placeholder="Subtask name"
                                                />
                                                <button
                                                  onClick={() => deleteSubtask(epic.id, task.id, subtask.id)}
                                                  className="rounded p-1 text-red-600 transition-colors hover:bg-red-50"
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </button>
                                              </div>
                                              <div className="grid grid-cols-5 gap-2">
                                                <input
                                                  type="number"
                                                  value={subtask.estimatedHours || ''}
                                                  onChange={(e) => updateSubtask(epic.id, task.id, subtask.id, { estimatedHours: parseFloat(e.target.value) || 0 })}
                                                  className="rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:border-[#2BBBEF] focus:outline-none"
                                                  placeholder="Hours"
                                                />
                                                <select
                                                  value={subtask.roleType}
                                                  onChange={(e) => {
                                                    const roleType = e.target.value as RoleType;
                                                    const defaultRate = ROLE_TYPES.find(r => r.value === roleType)?.defaultRate || 100;
                                                    updateSubtask(epic.id, task.id, subtask.id, { roleType, costRate: defaultRate });
                                                  }}
                                                  className="rounded border border-gray-200 bg-white px-1 py-1 text-xs focus:border-[#2BBBEF] focus:outline-none"
                                                >
                                                  {ROLE_TYPES.map(role => (
                                                    <option key={role.value} value={role.value}>
                                                      {role.label}
                                                    </option>
                                                  ))}
                                                </select>
                                                <input
                                                  type="number"
                                                  value={subtask.costRate || ''}
                                                  onChange={(e) => updateSubtask(epic.id, task.id, subtask.id, { costRate: parseFloat(e.target.value) || 0 })}
                                                  className="rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:border-[#2BBBEF] focus:outline-none"
                                                  placeholder="Rate"
                                                />
                                                <select
                                                  value={subtask.complexityScore}
                                                  onChange={(e) => updateSubtask(epic.id, task.id, subtask.id, { complexityScore: e.target.value as ComplexityLevel })}
                                                  className="rounded border border-gray-200 bg-white px-1 py-1 text-xs focus:border-[#2BBBEF] focus:outline-none"
                                                >
                                                  {COMPLEXITY_LEVELS.map(level => (
                                                    <option key={level.value} value={level.value}>
                                                      {level.label}
                                                    </option>
                                                  ))}
                                                </select>
                                                <select
                                                  value={subtask.riskLevel}
                                                  onChange={(e) => updateSubtask(epic.id, task.id, subtask.id, { riskLevel: e.target.value as RiskLevel })}
                                                  className="rounded border border-gray-200 bg-white px-1 py-1 text-xs focus:border-[#2BBBEF] focus:outline-none"
                                                >
                                                  {RISK_LEVELS.map(level => (
                                                    <option key={level.value} value={level.value}>
                                                      {level.label}
                                                    </option>
                                                  ))}
                                                </select>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scope Versioning Log */}
            <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
                    <History className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[#010029]" style={{ fontSize: '18px', fontWeight: 600 }}>
                      Scope Versioning Log
                    </h3>
                    <p className="text-gray-600" style={{ fontSize: '13px' }}>
                      Track changes and compare versions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const summary = prompt('Enter change summary:');
                      if (summary) createVersionSnapshot(summary);
                    }}
                    className="flex items-center gap-2 rounded-lg border border-purple-600 bg-white px-3 py-2 text-purple-600 transition-all hover:bg-purple-600 hover:text-white"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    <GitBranch className="h-4 w-4" />
                    Create Snapshot
                  </button>
                  <button
                    onClick={() => setShowVersionLog(!showVersionLog)}
                    className="rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-gray-50"
                  >
                    {showVersionLog ? (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {showVersionLog && (
                <div className="space-y-4">
                  {/* Version Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-purple-200 bg-white p-3">
                      <p className="mb-1 text-purple-600" style={{ fontSize: '11px', fontWeight: 600 }}>
                        TOTAL VERSIONS
                      </p>
                      <p className="text-[#010029]" style={{ fontSize: '20px', fontWeight: 700 }}>
                        {versionHistory.length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-purple-200 bg-white p-3">
                      <p className="mb-1 text-purple-600" style={{ fontSize: '11px', fontWeight: 600 }}>
                        CURRENT VERSION
                      </p>
                      <p className="text-[#010029]" style={{ fontSize: '20px', fontWeight: 700 }}>
                        v{versionHistory.length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-purple-200 bg-white p-3">
                      <p className="mb-1 text-purple-600" style={{ fontSize: '11px', fontWeight: 600 }}>
                        LAST UPDATED
                      </p>
                      <p className="text-[#010029]" style={{ fontSize: '11px', fontWeight: 600 }}>
                        {versionHistory.length > 0 ? new Date(versionHistory[0].timestamp).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Diff Comparison Controls */}
                  {versionHistory.length >= 2 && (
                    <div className="rounded-lg border-2 border-purple-300 bg-white p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Code className="h-4 w-4 text-purple-600" />
                        <h4 className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>
                          Compare Versions
                        </h4>
                      </div>
                      <div className="mb-3 grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-gray-600" style={{ fontSize: '12px', fontWeight: 500 }}>
                            Version 1
                          </label>
                          <select
                            value={selectedVersion1 || ''}
                            onChange={(e) => setSelectedVersion1(e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-purple-600 focus:outline-none"
                          >
                            <option value="">Select version...</option>
                            {versionHistory.map(v => (
                              <option key={v.id} value={v.id}>
                                v{v.versionNumber} - {new Date(v.timestamp).toLocaleString()}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-gray-600" style={{ fontSize: '12px', fontWeight: 500 }}>
                            Version 2
                          </label>
                          <select
                            value={selectedVersion2 || ''}
                            onChange={(e) => setSelectedVersion2(e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-purple-600 focus:outline-none"
                          >
                            <option value="">Select version...</option>
                            {versionHistory.map(v => (
                              <option key={v.id} value={v.id}>
                                v{v.versionNumber} - {new Date(v.timestamp).toLocaleString()}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowDiffView(true)}
                        disabled={!selectedVersion1 || !selectedVersion2}
                        className="w-full rounded-lg bg-purple-600 px-4 py-2 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ fontSize: '13px', fontWeight: 600 }}
                      >
                        <Eye className="mr-2 inline h-4 w-4" />
                        View Diff
                      </button>
                    </div>
                  )}

                  {/* Version History Table */}
                  {versionHistory.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-purple-300 bg-white p-8 text-center">
                      <History className="mx-auto mb-3 h-12 w-12 text-purple-300" />
                      <p className="mb-2 text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                        No version history yet
                      </p>
                      <p className="text-gray-500" style={{ fontSize: '12px' }}>
                        Create snapshots to track changes over time
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-purple-200 bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-purple-100 bg-purple-50">
                              <th className="px-4 py-3 text-left text-purple-900" style={{ fontSize: '12px', fontWeight: 600 }}>
                                VERSION
                              </th>
                              <th className="px-4 py-3 text-left text-purple-900" style={{ fontSize: '12px', fontWeight: 600 }}>
                                TIMESTAMP
                              </th>
                              <th className="px-4 py-3 text-left text-purple-900" style={{ fontSize: '12px', fontWeight: 600 }}>
                                USER
                              </th>
                              <th className="px-4 py-3 text-left text-purple-900" style={{ fontSize: '12px', fontWeight: 600 }}>
                                CHANGE SUMMARY
                              </th>
                              <th className="px-4 py-3 text-left text-purple-900" style={{ fontSize: '12px', fontWeight: 600 }}>
                                ACTIONS
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {versionHistory.map((version, index) => (
                              <tr key={version.id} className={`border-b border-gray-100 transition-colors hover:bg-purple-50 ${index === 0 ? 'bg-purple-50/50' : ''}`}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className={`rounded-full px-2 py-1 ${index === 0 ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`} style={{ fontSize: '11px', fontWeight: 600 }}>
                                      v{version.versionNumber}
                                    </span>
                                    {index === 0 && (
                                      <span className="rounded bg-green-100 px-2 py-0.5 text-green-700" style={{ fontSize: '10px', fontWeight: 600 }}>
                                        LATEST
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-gray-700" style={{ fontSize: '13px' }}>
                                  <div className="flex flex-col">
                                    <span>{new Date(version.timestamp).toLocaleDateString()}</span>
                                    <span className="text-gray-500" style={{ fontSize: '11px' }}>
                                      {new Date(version.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-700" style={{ fontSize: '11px', fontWeight: 600 }}>
                                      {version.user.charAt(0)}
                                    </div>
                                    <span className="text-gray-700" style={{ fontSize: '13px' }}>
                                      {version.user}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-gray-700" style={{ fontSize: '13px' }}>
                                  {version.changeSummary}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedVersionForJustification(version.id);
                                        setShowJustificationBuilder(true);
                                        generateJustifications(version.id);
                                      }}
                                      className="rounded border border-[#010029] bg-[#010029] px-2 py-1 text-white transition-opacity hover:opacity-80"
                                      style={{ fontSize: '11px', fontWeight: 600 }}
                                      title="Generate Justifications"
                                    >
                                      <FileText className="mr-1 inline h-3 w-3" />
                                      Justify
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedVersionForAI(version.id);
                                        setShowAIReasonGenerator(true);
                                        generateAIReasons(version.id);
                                      }}
                                      className="rounded border border-[#4AFFA8] bg-gradient-to-r from-[#4AFFA8] to-[#2BBBEF] px-2 py-1 text-white transition-opacity hover:opacity-90"
                                      style={{ fontSize: '11px', fontWeight: 600 }}
                                      title="AI Reasons"
                                    >
                                      <Sparkles className="mr-1 inline h-3 w-3" />
                                      AI
                                    </button>
                                    <button
                                      onClick={() => restoreVersion(version.id)}
                                      className="rounded border border-purple-300 px-2 py-1 text-purple-600 transition-colors hover:bg-purple-50"
                                      style={{ fontSize: '11px', fontWeight: 600 }}
                                      title="Restore Version"
                                    >
                                      Restore
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedVersion1(version.id);
                                        setSelectedVersion2(versionHistory[Math.min(index + 1, versionHistory.length - 1)]?.id || null);
                                      }}
                                      className="rounded border border-gray-300 px-2 py-1 text-gray-600 transition-colors hover:bg-gray-50"
                                      style={{ fontSize: '11px', fontWeight: 600 }}
                                    >
                                      Compare
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowSetup(false)}
                disabled={!baseline.projectName || !baseline.totalBudget || baseline.epics.length === 0}
                className="rounded-lg bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] px-6 py-3 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontSize: '15px', fontWeight: 600 }}
              >
                Start Tracking Project
              </button>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="w-80 space-y-4">
            <div className="sticky top-6 rounded-xl border-2 border-[#2BBBEF] bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <Calculator className="h-6 w-6 text-[#2BBBEF]" />
                <h3 className="text-[#010029]" style={{ fontSize: '18px', fontWeight: 700 }}>
                  Project Summary
                </h3>
              </div>

              <div className="space-y-4">
                {/* Total Estimated Hours */}
                <div className="rounded-lg border border-blue-200 bg-white p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600" style={{ fontSize: '12px', fontWeight: 600 }}>
                      TOTAL ESTIMATED HOURS
                    </span>
                  </div>
                  <p className="text-[#010029]" style={{ fontSize: '28px', fontWeight: 700 }}>
                    {totals.totalEstimatedHours.toFixed(1)}
                  </p>
                  <p className="text-gray-500" style={{ fontSize: '11px' }}>
                    hours
                  </p>
                </div>

                {/* Total Estimated Cost */}
                <div className="rounded-lg border border-green-200 bg-white p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600" style={{ fontSize: '12px', fontWeight: 600 }}>
                      TOTAL ESTIMATED COST
                    </span>
                  </div>
                  <p className="text-[#010029]" style={{ fontSize: '28px', fontWeight: 700 }}>
                    ${totals.totalEstimatedCost.toLocaleString()}
                  </p>
                  <p className="text-gray-500" style={{ fontSize: '11px' }}>
                    {totals.totalTasks} tasks total
                  </p>
                </div>

                {/* Budget Status */}
                <div className={`rounded-lg border p-4 ${totals.isOverBudget ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
                  <div className="mb-1 flex items-center gap-2">
                    {totals.isOverBudget ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <span className={`${totals.isOverBudget ? 'text-red-900' : 'text-gray-600'}`} style={{ fontSize: '12px', fontWeight: 600 }}>
                      BUDGET STATUS
                    </span>
                  </div>
                  <p className={totals.isOverBudget ? 'text-red-900' : 'text-green-900'} style={{ fontSize: '20px', fontWeight: 700 }}>
                    ${Math.abs(baseline.totalBudget - totals.totalEstimatedCost).toLocaleString()}
                  </p>
                  <p className={totals.isOverBudget ? 'text-red-700' : 'text-green-700'} style={{ fontSize: '11px', fontWeight: 600 }}>
                    {totals.isOverBudget ? 'OVER BUDGET' : 'UNDER BUDGET'}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="mb-3 text-gray-700" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Project Breakdown:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Epics</span>
                      <span className="font-semibold text-[#010029]">{baseline.epics.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Tasks</span>
                      <span className="font-semibold text-[#010029]">{totals.totalTasks}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-semibold text-[#010029]">${baseline.totalBudget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Estimated</span>
                      <span className={`font-semibold ${totals.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                        ${totals.totalEstimatedCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="mb-2 text-gray-700" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Budget Utilization:
                  </p>
                  <div className="mb-2 h-3 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full transition-all ${totals.isOverBudget ? 'bg-red-500' : 'bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8]'}`}
                      style={{ width: `${Math.min(100, (totals.totalEstimatedCost / baseline.totalBudget) * 100)}%` }}
                    />
                  </div>
                  <p className="text-center text-gray-600" style={{ fontSize: '12px' }}>
                    {baseline.totalBudget > 0 ? ((totals.totalEstimatedCost / baseline.totalBudget) * 100).toFixed(1) : 0}% of budget
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tracking View - Simplified for now */
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-[#4AFFA8]" />
          <h3 className="mb-2 text-[#010029]" style={{ fontSize: '20px', fontWeight: 600 }}>
            Project Baseline Set!
          </h3>
          <p className="mb-6 text-gray-600" style={{ fontSize: '14px' }}>
            Your project structure has been created with {totals.totalTasks} tasks
          </p>
          <button
            onClick={() => setShowSetup(true)}
            className="rounded-lg border border-[#2BBBEF] px-6 py-3 text-[#2BBBEF] transition-all hover:bg-[#2BBBEF] hover:text-white"
          >
            Edit Project Structure
          </button>
        </div>
      )}

      {/* Diff View Modal */}
      {showDiffView && selectedVersion1 && selectedVersion2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 p-6">
              <div className="flex items-center gap-3">
                <Code className="h-6 w-6 text-white" />
                <div>
                  <h3 className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>
                    Version Comparison
                  </h3>
                  <p className="text-purple-100" style={{ fontSize: '13px' }}>
                    Highlighting differences between versions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDiffView(false)}
                className="rounded-lg bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[calc(90vh-100px)] overflow-y-auto p-6">
              {(() => {
                const v1 = versionHistory.find(v => v.id === selectedVersion1);
                const v2 = versionHistory.find(v => v.id === selectedVersion2);
                if (!v1 || !v2) return null;

                const s1 = v1.snapshot;
                const s2 = v2.snapshot;

                return (
                  <div className="space-y-6">
                    {/* Version Info Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-full bg-blue-600 px-3 py-1 text-white" style={{ fontSize: '12px', fontWeight: 600 }}>
                            v{v1.versionNumber}
                          </span>
                          <span className="text-blue-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                            {new Date(v1.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-blue-800" style={{ fontSize: '12px' }}>
                          {v1.changeSummary}
                        </p>
                      </div>
                      <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-full bg-green-600 px-3 py-1 text-white" style={{ fontSize: '12px', fontWeight: 600 }}>
                            v{v2.versionNumber}
                          </span>
                          <span className="text-green-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                            {new Date(v2.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-green-800" style={{ fontSize: '12px' }}>
                          {v2.changeSummary}
                        </p>
                      </div>
                    </div>

                    {/* Project Details Comparison */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <h4 className="mb-3 flex items-center gap-2 text-[#010029]" style={{ fontSize: '16px', fontWeight: 600 }}>
                        <Target className="h-5 w-5 text-purple-600" />
                        Project Details
                      </h4>
                      <div className="space-y-2">
                        <div className={`flex items-center justify-between rounded p-2 ${s1.projectName !== s2.projectName ? 'bg-yellow-50 border border-yellow-300' : 'bg-gray-50'}`}>
                          <span className="text-gray-600" style={{ fontSize: '13px', fontWeight: 500 }}>
                            Project Name
                          </span>
                          <div className="flex items-center gap-3">
                            <span className={`rounded px-2 py-1 ${s1.projectName !== s2.projectName ? 'bg-blue-100 text-blue-900' : 'text-gray-700'}`} style={{ fontSize: '13px' }}>
                              {s1.projectName || 'N/A'}
                            </span>
                            {s1.projectName !== s2.projectName && <span className="text-gray-400">→</span>}
                            {s1.projectName !== s2.projectName && (
                              <span className="rounded bg-green-100 px-2 py-1 text-green-900" style={{ fontSize: '13px' }}>
                                {s2.projectName || 'N/A'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={`flex items-center justify-between rounded p-2 ${s1.totalBudget !== s2.totalBudget ? 'bg-yellow-50 border border-yellow-300' : 'bg-gray-50'}`}>
                          <span className="text-gray-600" style={{ fontSize: '13px', fontWeight: 500 }}>
                            Total Budget
                          </span>
                          <div className="flex items-center gap-3">
                            <span className={`rounded px-2 py-1 ${s1.totalBudget !== s2.totalBudget ? 'bg-blue-100 text-blue-900' : 'text-gray-700'}`} style={{ fontSize: '13px' }}>
                              ${s1.totalBudget.toLocaleString()}
                            </span>
                            {s1.totalBudget !== s2.totalBudget && <span className="text-gray-400">→</span>}
                            {s1.totalBudget !== s2.totalBudget && (
                              <span className="rounded bg-green-100 px-2 py-1 text-green-900" style={{ fontSize: '13px' }}>
                                ${s2.totalBudget.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={`flex items-center justify-between rounded p-2 ${s1.epics.length !== s2.epics.length ? 'bg-yellow-50 border border-yellow-300' : 'bg-gray-50'}`}>
                          <span className="text-gray-600" style={{ fontSize: '13px', fontWeight: 500 }}>
                            Number of Epics
                          </span>
                          <div className="flex items-center gap-3">
                            <span className={`rounded px-2 py-1 ${s1.epics.length !== s2.epics.length ? 'bg-blue-100 text-blue-900' : 'text-gray-700'}`} style={{ fontSize: '13px' }}>
                              {s1.epics.length}
                            </span>
                            {s1.epics.length !== s2.epics.length && <span className="text-gray-400">→</span>}
                            {s1.epics.length !== s2.epics.length && (
                              <span className="rounded bg-green-100 px-2 py-1 text-green-900" style={{ fontSize: '13px' }}>
                                {s2.epics.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Epics Comparison */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <h4 className="mb-3 flex items-center gap-2 text-[#010029]" style={{ fontSize: '16px', fontWeight: 600 }}>
                        <Layers className="h-5 w-5 text-purple-600" />
                        Epic & Task Changes
                      </h4>

                      {/* Added Epics */}
                      {s2.epics.filter(e2 => !s1.epics.find(e1 => e1.id === e2.id)).length > 0 && (
                        <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-3">
                          <p className="mb-2 flex items-center gap-2 text-green-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                            <Plus className="h-4 w-4" />
                            Added Epics ({s2.epics.filter(e2 => !s1.epics.find(e1 => e1.id === e2.id)).length})
                          </p>
                          <ul className="space-y-1">
                            {s2.epics.filter(e2 => !s1.epics.find(e1 => e1.id === e2.id)).map(epic => (
                              <li key={epic.id} className="ml-6 text-green-800" style={{ fontSize: '12px' }}>
                                • {epic.name} ({epic.tasks.length} tasks)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Removed Epics */}
                      {s1.epics.filter(e1 => !s2.epics.find(e2 => e2.id === e1.id)).length > 0 && (
                        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3">
                          <p className="mb-2 flex items-center gap-2 text-red-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                            <Trash2 className="h-4 w-4" />
                            Removed Epics ({s1.epics.filter(e1 => !s2.epics.find(e2 => e2.id === e1.id)).length})
                          </p>
                          <ul className="space-y-1">
                            {s1.epics.filter(e1 => !s2.epics.find(e2 => e2.id === e1.id)).map(epic => (
                              <li key={epic.id} className="ml-6 text-red-800" style={{ fontSize: '12px' }}>
                                • {epic.name} ({epic.tasks.length} tasks)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Modified Epics */}
                      {s2.epics.filter(e2 => {
                        const e1 = s1.epics.find(e => e.id === e2.id);
                        return e1 && (e1.name !== e2.name || e1.tasks.length !== e2.tasks.length);
                      }).length > 0 && (
                        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3">
                          <p className="mb-2 flex items-center gap-2 text-yellow-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                            <AlertCircle className="h-4 w-4" />
                            Modified Epics ({s2.epics.filter(e2 => {
                              const e1 = s1.epics.find(e => e.id === e2.id);
                              return e1 && (e1.name !== e2.name || e1.tasks.length !== e2.tasks.length);
                            }).length})
                          </p>
                          <ul className="space-y-2">
                            {s2.epics.filter(e2 => {
                              const e1 = s1.epics.find(e => e.id === e2.id);
                              return e1 && (e1.name !== e2.name || e1.tasks.length !== e2.tasks.length);
                            }).map(epic2 => {
                              const epic1 = s1.epics.find(e => e.id === epic2.id);
                              if (!epic1) return null;
                              return (
                                <li key={epic2.id} className="ml-6 text-yellow-800" style={{ fontSize: '12px' }}>
                                  • {epic1.name !== epic2.name ? (
                                    <>
                                      <span className="rounded bg-blue-100 px-1 py-0.5">{epic1.name}</span>
                                      {' → '}
                                      <span className="rounded bg-green-100 px-1 py-0.5">{epic2.name}</span>
                                    </>
                                  ) : epic2.name}
                                  {epic1.tasks.length !== epic2.tasks.length && (
                                    <span className="ml-2">
                                      (Tasks: <span className="rounded bg-blue-100 px-1 py-0.5">{epic1.tasks.length}</span>
                                      {' → '}
                                      <span className="rounded bg-green-100 px-1 py-0.5">{epic2.tasks.length}</span>)
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {s1.epics.length === s2.epics.length && 
                       s2.epics.every(e2 => {
                         const e1 = s1.epics.find(e => e.id === e2.id);
                         return e1 && e1.name === e2.name && e1.tasks.length === e2.tasks.length;
                       }) && (
                        <p className="text-center text-gray-500" style={{ fontSize: '13px' }}>
                          No epic changes detected
                        </p>
                      )}
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <p className="mb-2 text-blue-600" style={{ fontSize: '11px', fontWeight: 600 }}>
                          VERSION {v1.versionNumber} TOTALS
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Epics:</span>
                            <span className="font-semibold text-blue-900">{s1.epics.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Tasks:</span>
                            <span className="font-semibold text-blue-900">
                              {s1.epics.reduce((sum, epic) => sum + epic.tasks.length + epic.tasks.reduce((s, t) => s + t.subtasks.length, 0), 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Budget:</span>
                            <span className="font-semibold text-blue-900">${s1.totalBudget.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <p className="mb-2 text-green-600" style={{ fontSize: '11px', fontWeight: 600 }}>
                          VERSION {v2.versionNumber} TOTALS
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700">Epics:</span>
                            <span className="font-semibold text-green-900">{s2.epics.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Tasks:</span>
                            <span className="font-semibold text-green-900">
                              {s2.epics.reduce((sum, epic) => sum + epic.tasks.length + epic.tasks.reduce((s, t) => s + t.subtasks.length, 0), 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Budget:</span>
                            <span className="font-semibold text-green-900">${s2.totalBudget.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <button
                onClick={() => setShowDiffView(false)}
                className="w-full rounded-lg bg-gray-600 px-4 py-2 text-white transition-opacity hover:opacity-90"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Scope Change Reason Generator Modal */}
      {showAIReasonGenerator && selectedVersionForAI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-[#4AFFA8] to-[#2BBBEF] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white" style={{ fontSize: '22px', fontWeight: 700 }}>
                    AI Scope Change Reason Generator
                  </h3>
                  <p className="text-white/90" style={{ fontSize: '13px' }}>
                    Intelligent analysis of project scope modifications
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAIReasonGenerator(false);
                  setAiReasons([]);
                  setSelectedVersionForAI(null);
                }}
                className="rounded-lg bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
              {(() => {
                const version = versionHistory.find(v => v.id === selectedVersionForAI);
                if (!version) return null;

                const versionIndex = versionHistory.findIndex(v => v.id === selectedVersionForAI);
                const previousVersion = versionHistory[versionIndex + 1];
                const inputData = analyzeVersionChanges(previousVersion?.snapshot || null, version.snapshot);

                return (
                  <div className="space-y-6">
                    {/* Version Info */}
                    <div className="rounded-lg border-2 border-[#2BBBEF] bg-gradient-to-r from-blue-50 to-cyan-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <span className="rounded-full bg-[#2BBBEF] px-3 py-1 text-white" style={{ fontSize: '13px', fontWeight: 600 }}>
                              Version {version.versionNumber}
                            </span>
                            <span className="text-gray-700" style={{ fontSize: '13px' }}>
                              {new Date(version.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                            {version.changeSummary}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600" style={{ fontSize: '11px' }}>BY</p>
                          <p className="text-[#010029]" style={{ fontSize: '13px', fontWeight: 600 }}>
                            {version.user}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Input Data Sources */}
                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#2BBBEF]" />
                        <h4 className="text-[#010029]" style={{ fontSize: '16px', fontWeight: 700 }}>
                          Input Data Sources
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                          <p className="mb-3 text-blue-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                            📊 Quantitative Changes
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-blue-700">Budget Change:</span>
                              <span className={`font-semibold ${inputData.budgetChange > 0 ? 'text-green-600' : inputData.budgetChange < 0 ? 'text-red-600' : 'text-blue-900'}`}>
                                {inputData.budgetChange > 0 ? '+' : ''}{inputData.budgetChange.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-blue-700">Epics Added:</span>
                              <span className="font-semibold text-green-600">+{inputData.epicsAdded}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-blue-700">Epics Removed:</span>
                              <span className="font-semibold text-red-600">-{inputData.epicsRemoved}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-blue-700">Tasks Added:</span>
                              <span className="font-semibold text-green-600">+{inputData.tasksAdded}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-blue-700">Tasks Removed:</span>
                              <span className="font-semibold text-red-600">-{inputData.tasksRemoved}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-blue-700">Epics Modified:</span>
                              <span className="font-semibold text-yellow-600">{inputData.epicModifications}</span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                          <p className="mb-3 text-purple-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                            📝 Qualitative Context
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-purple-700">Version Type:</span>
                              <span className="font-semibold text-purple-900">
                                {previousVersion ? 'Update' : 'Initial'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-purple-700">Hours Impact:</span>
                              <span className={`font-semibold ${inputData.estimatedHoursChange > 0 ? 'text-green-600' : inputData.estimatedHoursChange < 0 ? 'text-red-600' : 'text-purple-900'}`}>
                                {inputData.estimatedHoursChange > 0 ? '+' : ''}{inputData.estimatedHoursChange.toFixed(0)}h
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-purple-700">Scope Direction:</span>
                              <span className="font-semibold text-purple-900">
                                {inputData.epicsAdded > inputData.epicsRemoved ? 'Expansion' : inputData.epicsRemoved > inputData.epicsAdded ? 'Reduction' : 'Refinement'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-purple-700">Change Magnitude:</span>
                              <span className="font-semibold text-purple-900">
                                {Math.abs(inputData.budgetChange) > 20 || inputData.epicsAdded + inputData.epicsRemoved > 2 ? 'Major' : 'Minor'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-purple-700">Project Phase:</span>
                              <span className="font-semibold text-purple-900">
                                {version.versionNumber <= 2 ? 'Planning' : version.versionNumber <= 5 ? 'Development' : 'Refinement'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI-Generated Reasons */}
                    <div className="rounded-lg border-2 border-[#4AFFA8] bg-gradient-to-br from-green-50 to-cyan-50 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4AFFA8] to-[#2BBBEF]">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-[#010029]" style={{ fontSize: '16px', fontWeight: 700 }}>
                            AI-Generated Explanations
                          </h4>
                        </div>
                        {!aiGenerating && aiReasons.length > 0 && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700" style={{ fontSize: '12px', fontWeight: 600 }}>
                            {aiReasons.length} Reasons
                          </span>
                        )}
                      </div>

                      {aiGenerating ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[#4AFFA8] border-t-transparent"></div>
                          <p className="mb-2 text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                            Analyzing Scope Changes...
                          </p>
                          <p className="text-gray-600" style={{ fontSize: '13px' }}>
                            AI is generating intelligent explanations
                          </p>
                        </div>
                      ) : aiReasons.length > 0 ? (
                        <div className="space-y-3">
                          {aiReasons.map((reason, index) => (
                            <div key={index} className="flex gap-3 rounded-lg border border-green-200 bg-white p-4 transition-shadow hover:shadow-md">
                              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4AFFA8] to-[#2BBBEF] text-white" style={{ fontSize: '13px', fontWeight: 700 }}>
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-800" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                  {reason}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <AlertCircle className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                          <p className="text-gray-600" style={{ fontSize: '14px' }}>
                            No reasons generated yet
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Key Insights Summary */}
                    {!aiGenerating && aiReasons.length > 0 && (
                      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-yellow-700" />
                          <h5 className="text-yellow-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                            Key Insights
                          </h5>
                        </div>
                        <ul className="ml-7 space-y-1 text-sm text-yellow-800">
                          <li>• Scope changes reflect {inputData.budgetChange > 0 ? 'expanded project requirements' : 'optimized resource allocation'}</li>
                          <li>• Version {version.versionNumber} shows {inputData.epicsAdded + inputData.tasksAdded > inputData.epicsRemoved + inputData.tasksRemoved ? 'progressive scope growth' : 'strategic scope refinement'}</li>
                          <li>• Changes align with iterative project management best practices</li>
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowAIReasonGenerator(false);
                    setAiReasons([]);
                    setSelectedVersionForAI(null);
                  }}
                  className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  Close
                </button>
                <button
                  onClick={exportAIReasons}
                  disabled={aiReasons.length === 0}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] px-6 py-2 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  <Download className="h-4 w-4" />
                  Export Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Justification Builder Modal */}
      {showJustificationBuilder && selectedVersionForJustification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-[#010029] via-[#2BBBEF] to-[#4AFFA8] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white" style={{ fontSize: '24px', fontWeight: 700 }}>
                    Justification Builder
                  </h3>
                  <p className="text-white/90" style={{ fontSize: '13px' }}>
                    AI-generated business, technical, and client impact documentation
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowJustificationBuilder(false);
                  setBusinessJustification('');
                  setTechnicalJustification('');
                  setClientImpactSummary('');
                  setSelectedVersionForJustification(null);
                }}
                className="rounded-lg bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[calc(90vh-180px)] overflow-y-auto">
              {(() => {
                const version = versionHistory.find(v => v.id === selectedVersionForJustification);
                if (!version) return null;

                return (
                  <div className="space-y-6 p-6">
                    {/* Version Info */}
                    <div className="rounded-lg border-2 border-[#2BBBEF] bg-gradient-to-r from-blue-50 to-cyan-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <span className="rounded-full bg-[#2BBBEF] px-3 py-1 text-white" style={{ fontSize: '13px', fontWeight: 600 }}>
                              Version {version.versionNumber}
                            </span>
                            <span className="text-gray-700" style={{ fontSize: '13px' }}>
                              {new Date(version.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                            {version.changeSummary}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600" style={{ fontSize: '11px' }}>AUTHOR</p>
                          <p className="text-[#010029]" style={{ fontSize: '13px', fontWeight: 600 }}>
                            {version.user}
                          </p>
                        </div>
                      </div>
                    </div>

                    {justificationsGenerating ? (
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="mb-4 h-20 w-20 animate-spin rounded-full border-4 border-[#4AFFA8] border-t-transparent"></div>
                        <p className="mb-2 text-[#010029]" style={{ fontSize: '18px', fontWeight: 600 }}>
                          Generating Justifications...
                        </p>
                        <p className="text-gray-600" style={{ fontSize: '14px' }}>
                          AI is crafting comprehensive documentation
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Business Justification */}
                        <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-sm">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500">
                                <Building2 className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="text-[#010029]" style={{ fontSize: '18px', fontWeight: 700 }}>
                                  Business Justification
                                </h4>
                                <p className="text-gray-600" style={{ fontSize: '12px' }}>
                                  Executive summary and ROI analysis
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(businessJustification, 'business')}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                                copiedSection === 'business'
                                  ? 'bg-green-600 text-white'
                                  : 'border border-orange-600 bg-white text-orange-600 hover:bg-orange-600 hover:text-white'
                              }`}
                              style={{ fontSize: '13px', fontWeight: 600 }}
                            >
                              {copiedSection === 'business' ? (
                                <>
                                  <CheckCheck className="h-4 w-4" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <div className="rounded-lg border border-orange-200 bg-white p-5">
                            <pre className="whitespace-pre-wrap font-sans text-gray-800" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                              {businessJustification || 'No business justification generated yet.'}
                            </pre>
                          </div>
                        </div>

                        {/* Technical Justification */}
                        <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
                                <Cpu className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="text-[#010029]" style={{ fontSize: '18px', fontWeight: 700 }}>
                                  Technical Justification
                                </h4>
                                <p className="text-gray-600" style={{ fontSize: '12px' }}>
                                  Architecture and implementation details
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(technicalJustification, 'technical')}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                                copiedSection === 'technical'
                                  ? 'bg-green-600 text-white'
                                  : 'border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white'
                              }`}
                              style={{ fontSize: '13px', fontWeight: 600 }}
                            >
                              {copiedSection === 'technical' ? (
                                <>
                                  <CheckCheck className="h-4 w-4" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-white p-5">
                            <pre className="whitespace-pre-wrap font-sans text-gray-800" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                              {technicalJustification || 'No technical justification generated yet.'}
                            </pre>
                          </div>
                        </div>

                        {/* Client Impact Summary */}
                        <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                                <Users className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="text-[#010029]" style={{ fontSize: '18px', fontWeight: 700 }}>
                                  Client Impact Summary
                                </h4>
                                <p className="text-gray-600" style={{ fontSize: '12px' }}>
                                  User experience and business outcomes
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(clientImpactSummary, 'client')}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                                copiedSection === 'client'
                                  ? 'bg-green-600 text-white'
                                  : 'border border-green-600 bg-white text-green-600 hover:bg-green-600 hover:text-white'
                              }`}
                              style={{ fontSize: '13px', fontWeight: 600 }}
                            >
                              {copiedSection === 'client' ? (
                                <>
                                  <CheckCheck className="h-4 w-4" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <div className="rounded-lg border border-green-200 bg-white p-5">
                            <pre className="whitespace-pre-wrap font-sans text-gray-800" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                              {clientImpactSummary || 'No client impact summary generated yet.'}
                            </pre>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowJustificationBuilder(false);
                    setBusinessJustification('');
                    setTechnicalJustification('');
                    setClientImpactSummary('');
                    setSelectedVersionForJustification(null);
                  }}
                  className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  Close
                </button>
                <button
                  onClick={exportJustifications}
                  disabled={!businessJustification || !technicalJustification || !clientImpactSummary}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#010029] via-[#2BBBEF] to-[#4AFFA8] px-6 py-2 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  <Download className="h-4 w-4" />
                  Export All Justifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
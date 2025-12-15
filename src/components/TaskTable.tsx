import { useState, useRef, useEffect } from 'react';
import { Lock, HelpCircle, Sparkles, Trash2, CheckCircle, ChevronDown, ChevronRight, ListTodo, Edit, Target, Building2, Users, AlertTriangle, TrendingUp, Square, CheckSquare } from 'lucide-react';
import { AITaskVerificationModal } from './AITaskVerificationModal';
import { TaskElementsRow } from './TaskElementsRow';
import { BulkOperations } from './BulkOperations';
import type { Settings } from '../App';

export interface TaskElement {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface Task {
  id: string;
  taskName: string;
  referenceNumber?: string; // e.g., "TASK-001"
  ISR: number;
  CF: number;
  UXI: number;
  RCF: number;
  AEP: number;
  L: number;
  MLW: number;
  CGW: number;
  RF: number;
  S: number;
  GLRI: number;
  aiVerifiedUnits: number;
  hasAnomaly?: boolean;
  // Audit fields
  auditStatus?: 'approved' | 'rejected' | 'pending';
  approvedAt?: string;
  approvedBy?: string;
  approvalNotes?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  // Task elements
  taskElements?: TaskElement[];
  elementsExpanded?: boolean;
  // Budget tracking fields
  actualHours?: number;
  startDate?: string;
  completionDate?: string;
  progressPercentage?: number; // 0-100
  status?: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
}

interface TaskTableProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  settings: Settings;
  onAIAutoFill?: (taskId: string) => void;
}

const tooltips: Record<string, string> = {
  ISR: 'ISR: Initial Scope Rating — baseline complexity score for the task',
  CF: 'CF: Complexity Factor — evaluates how technically complex the task is relative to industry norms',
  UXI: 'UXI: User Experience Impact — measures impact on end-user experience',
  RCF: 'RCF: Risk Complexity Factor — accounts for technical and business risk',
  AEP: 'AEP: Architecture & Engineering Points — engineering design complexity',
  L: 'L: Learning Curve — time needed for knowledge transfer and ramp-up',
  MLW: 'MLW: Multi-Layer Work — cross-functional coordination required',
  CGW: 'CGW: Cross-Group Work — collaboration across teams or departments',
  RF: 'RF: Rework Factor — likelihood of changes or iterations',
  S: 'S: Specialty Factor — need for specialized skills or tools',
  GLRI: 'GLRI: Governance & Legal Risk Index — compliance and regulatory complexity',
};

export function TaskTable({ tasks, onTasksChange, settings, onAIAutoFill }: TaskTableProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [aiGeneratingFor, setAiGeneratingFor] = useState<string | null>(null);
  const [verificationTask, setVerificationTask] = useState<Task | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [editingMetric, setEditingMetric] = useState<{ taskId: string; metric: 'pci' | 'verified' | 'cost' } | null>(null);
  const [metricInputValue, setMetricInputValue] = useState('');
  
  // Refs for smooth scrolling to expanded tasks
  const taskRowRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Smooth scroll to expanded task with better positioning
  useEffect(() => {
    if (selectedTaskId && taskRowRefs.current[selectedTaskId]) {
      // Small delay to let the DOM update with expanded content
      setTimeout(() => {
        const element = taskRowRefs.current[selectedTaskId];
        if (element) {
          // Get the element's position
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.pageYOffset;
          
          // Scroll to position with some offset from top (80px for header/nav)
          const offset = 80;
          const scrollPosition = absoluteElementTop - offset;
          
          window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [selectedTaskId]);

  const calculatePCI = (task: Task | null): number => {
    if (!task) return 0;
    const pci = (task.ISR * task.CF * task.UXI) + 
                (task.RCF * task.AEP - task.L) + 
                (task.MLW * task.CGW * task.RF) + 
                (task.S * task.GLRI);
    return Math.max(0, pci);
  };

  const calculateAAS = (task: Task | null): number => {
    if (!task) return 0;
    const pci = calculatePCI(task);
    if (pci === 0) return 0;
    return (task.aiVerifiedUnits / pci) * 100;
  };

  const calculateVerifiedUnits = (task: Task | null): number => {
    if (!task) return 0;
    const pci = calculatePCI(task);
    const aas = calculateAAS(task);
    return (aas / 100) * pci;
  };

  const calculateVerifiedCost = (task: Task | null): number => {
    if (!task) return 0;
    return calculateVerifiedUnits(task) * settings.hourlyRate;
  };

  const updateTask = (id: string, field: keyof Task, value: string | number) => {
    const updatedTasks = tasks
      .filter(task => task != null) // Filter out null tasks
      .map(task => 
        task.id === id ? { ...task, [field]: value } : task
      );
    onTasksChange(updatedTasks);
  };

  const deleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const updatedTasks = tasks.filter(task => task != null && task.id !== id);
      onTasksChange(updatedTasks);
      if (selectedTaskId === id) {
        setSelectedTaskId(null);
      }
    }
  };

  const handleAIAutoFill = async (taskId: string) => {
    const task = tasks.filter(t => t != null).find(t => t.id === taskId);
    if (!task) return;

    setAiGeneratingFor(taskId);

    try {
      // Call the AI analysis API endpoint
      const { analyzeTaskWithAI } = await import('../services/api');
      const analyzedTask = await analyzeTaskWithAI(task.taskName);

      // Update the task with AI-generated values
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? {
          ...t,
          ISR: analyzedTask.ISR,
          CF: analyzedTask.CF,
          UXI: analyzedTask.UXI,
          RCF: analyzedTask.RCF,
          AEP: analyzedTask.AEP,
          L: analyzedTask.L,
          MLW: analyzedTask.MLW,
          CGW: analyzedTask.CGW,
          RF: analyzedTask.RF,
          S: analyzedTask.S,
          GLRI: analyzedTask.GLRI,
          aiVerifiedUnits: analyzedTask.aiVerifiedUnits,
        } : t
      );
      
      onTasksChange(updatedTasks);
    } catch (error) {
      console.error('Failed to analyze task with AI:', error);
      alert('Failed to analyze task. Please try again.');
    } finally {
      setAiGeneratingFor(null);
    }
  };

  const handleVerification = (task: Task) => {
    setVerificationTask(task);
  };

  const handleTaskElementsUpdate = (taskId: string, elements: TaskElement[], expanded: boolean) => {
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, taskElements: elements, elementsExpanded: expanded } : t
    );
    onTasksChange(updatedTasks);
  };

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;

  // Toggle task selection
  const toggleTaskSelection = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelection = new Set(selectedTaskIds);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedTaskIds(newSelection);
  };

  // Toggle all tasks selection
  const toggleAllTasks = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedTaskIds.size === tasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(tasks.map(t => t.id)));
    }
  };

  // Reverse calculation: Adjust PCI factors based on target metric
  const handleMetricEdit = (taskId: string, metric: 'pci' | 'verified' | 'cost', targetValue: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentPCI = calculatePCI(task);
    const currentAAS = calculateAAS(task);
    
    let newPCI = currentPCI;
    let newAiVerifiedUnits = task.aiVerifiedUnits;
    
    // Calculate target PCI based on which metric was edited
    if (metric === 'pci') {
      newPCI = targetValue;
      // Maintain the same AAS ratio, so adjust aiVerifiedUnits proportionally
      if (currentPCI > 0) {
        newAiVerifiedUnits = task.aiVerifiedUnits * (newPCI / currentPCI);
      }
    } else if (metric === 'verified') {
      // User wants specific verified units
      // Verified Units = (AAS / 100) * PCI, so: PCI = Verified Units / (AAS / 100)
      newPCI = currentAAS > 0 ? targetValue / (currentAAS / 100) : targetValue;
      // Calculate new aiVerifiedUnits to achieve target verified units
      newAiVerifiedUnits = newPCI; // aiVerifiedUnits should equal new PCI to maintain AAS
    } else if (metric === 'cost') {
      // Target Verified Units = Cost / Hourly Rate
      const targetVerifiedUnits = targetValue / settings.hourlyRate;
      newPCI = currentAAS > 0 ? targetVerifiedUnits / (currentAAS / 100) : targetVerifiedUnits;
      // Calculate new aiVerifiedUnits
      newAiVerifiedUnits = newPCI;
    }

    if (newPCI <= 0 || !isFinite(newPCI)) return;

    // Calculate scaling factor
    const scalingFactor = newPCI / currentPCI;
    
    // Proportionally adjust all PCI factors
    // We scale the factors that contribute most to the PCI calculation
    const updatedTask = {
      ...task,
      ISR: Math.max(0.1, Math.round(task.ISR * Math.cbrt(scalingFactor) * 10) / 10), // Cube root for gentler scaling
      CF: Math.max(1.0, Math.round(task.CF * Math.sqrt(scalingFactor) * 10) / 10), // Square root for moderate scaling
      UXI: Math.max(1.0, Math.round(task.UXI * Math.sqrt(scalingFactor) * 10) / 10),
      AEP: Math.max(1, Math.round(task.AEP * Math.cbrt(scalingFactor) * 10) / 10),
      aiVerifiedUnits: Math.round(newAiVerifiedUnits * 100) / 100, // Round to 2 decimals
    };

    const updatedTasks = tasks.map(t => t.id === taskId ? updatedTask : t);
    onTasksChange(updatedTasks);
  };

  const startEditingMetric = (taskId: string, metric: 'pci' | 'verified' | 'cost', currentValue: number) => {
    setEditingMetric({ taskId, metric });
    setMetricInputValue(currentValue.toFixed(2));
  };

  const saveMetricEdit = () => {
    if (!editingMetric) return;
    
    const value = parseFloat(metricInputValue);
    if (isNaN(value) || value < 0) {
      setEditingMetric(null);
      return;
    }

    handleMetricEdit(editingMetric.taskId, editingMetric.metric, value);
    setEditingMetric(null);
    setMetricInputValue('');
  };

  const cancelMetricEdit = () => {
    setEditingMetric(null);
    setMetricInputValue('');
  };

  return (
    <div className="space-y-4">
      {/* Bulk Operations Bar */}
      <BulkOperations
        tasks={tasks}
        selectedTaskIds={selectedTaskIds}
        onTasksChange={onTasksChange}
        onSelectionChange={setSelectedTaskIds}
        settings={settings}
      />

      {/* Compact Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-white/10 dark:bg-[#161A3A]">
        <div className="overflow-x-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white dark:border-white/10 dark:from-[#0C0F2C] dark:to-[#161A3A]">
            <div className="grid grid-cols-[40px_40px_120px_1fr_110px_90px_130px_100px] gap-3 px-4 py-3">
              {/* Checkbox Column */}
              <div className="flex items-center justify-center">
                <button
                  onClick={toggleAllTasks}
                  className="flex items-center justify-center rounded-md p-1 text-gray-400 transition-all hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-[#0C0F2C]"
                >
                  {selectedTaskIds.size === tasks.length && tasks.length > 0 ? (
                    <CheckSquare className="h-4 w-4 text-[#2BBBEF]" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                
              </div>
              <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Ref
              </div>
              <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Task Name
              </div>
              <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                PCI Units
              </div>
              <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                AAS %
              </div>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Lock className="h-3 w-3 text-[#4AFFA8]" />
                Verified Cost
              </div>
              <div className="text-center text-gray-500 dark:text-gray-400" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Actions
              </div>
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {tasks.filter(task => task != null).map((task, index) => {
              const pci = calculatePCI(task);
              const aas = calculateAAS(task);
              const verifiedCost = calculateVerifiedCost(task);
              const hasLowAAS = aas < 85 && aas > 0;
              const isSelected = selectedTaskId === task.id;

              return (
                <div 
                  key={task.id}
                  ref={(el) => { taskRowRefs.current[task.id] = el; }}
                >
                  {/* Main Row */}
                  <div 
                    className={`grid grid-cols-[40px_40px_120px_1fr_110px_90px_130px_100px] gap-3 px-4 py-3 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-gradient-to-r from-[#2BBBEF]/5 to-[#4AFFA8]/5 dark:from-[#2BBBEF]/10 dark:to-[#4AFFA8]/10' 
                        : 'hover:bg-gray-50/50 dark:hover:bg-[#0C0F2C]/50'
                    }`}
                    onClick={() => setSelectedTaskId(isSelected ? null : task.id)}
                  >
                    {/* Checkbox */}
                    <div className="flex items-center justify-center">
                      <button
                        onClick={(e) => toggleTaskSelection(task.id, e)}
                        className="flex items-center justify-center rounded-md p-1 text-gray-400 transition-all hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-[#0C0F2C]"
                      >
                        {selectedTaskIds.has(task.id) ? (
                          <CheckSquare className="h-4 w-4 text-[#2BBBEF]" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Expand Icon */}
                    <div className="flex items-center justify-center">
                      <button className="flex items-center justify-center rounded-md p-1 text-gray-400 transition-all hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-[#0C0F2C]">
                        {isSelected ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Reference Number */}
                    <div className="flex items-center">
                      <span className="text-gray-400 dark:text-gray-500" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                        {task.referenceNumber || `TASK-${String(index + 1).padStart(3, '0')}`}
                      </span>
                    </div>

                    {/* Task Name */}
                    <div className="flex items-center">
                      <span className="text-gray-800 dark:text-white" style={{ fontSize: '13px' }}>
                        {task.taskName || 'Untitled Task'}
                      </span>
                    </div>

                    {/* PCI Units */}
                    <div className="flex items-center">
                      <div className="rounded-md bg-gradient-to-br from-[#2BBBEF]/10 to-[#4AFFA8]/10 px-3 py-1.5 dark:from-[#2BBBEF]/20 dark:to-[#4AFFA8]/20">
                        <span className="text-[#010029] dark:text-white" style={{ fontSize: '12px', fontWeight: 600 }}>
                          {pci.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* AAS % */}
                    <div className="flex items-center">
                      <div className={`rounded-md px-2 py-1.5 ${
                        hasLowAAS 
                          ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' 
                          : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>
                          {aas.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Verified Cost */}
                    <div className="flex items-center">
                      <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 500 }}>
                        ${verifiedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-1">
                      <button
                        className="flex items-center justify-center rounded-md p-1.5 text-[#2BBBEF] transition-all hover:bg-[#2BBBEF]/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerification(task);
                        }}
                        title="AI Verification"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="flex items-center justify-center rounded-md p-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        title="Delete task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Detail Panel */}
                  {isSelected && selectedTask && (
                    <div className="border-t border-gray-100 bg-gradient-to-br from-gray-50/50 to-white px-4 py-6 dark:border-white/10 dark:from-[#0C0F2C] dark:to-[#161A3A]">
                      <div className="mx-auto max-w-6xl space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white">
                              <Edit className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                                Edit Task Details
                              </h3>
                              <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
                                Configure PCI factors and parameters for accurate estimation
                              </p>
                            </div>
                          </div>
                          <button
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-4 py-2 text-white transition-all hover:shadow-lg disabled:opacity-50"
                            onClick={() => handleAIAutoFill(task.id)}
                            disabled={aiGeneratingFor === task.id}
                          >
                            {aiGeneratingFor === task.id ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                <span style={{ fontSize: '13px' }}>Analyzing...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                <span style={{ fontSize: '13px' }}>AI Auto-Fill</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Task Name Input */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161A3A]">
                          <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600 }}>
                            Task Name
                          </label>
                          <input
                            type="text"
                            value={selectedTask.taskName}
                            onChange={(e) => updateTask(selectedTask.id, 'taskName', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                            placeholder="Enter task name..."
                            style={{ fontSize: '14px' }}
                          />
                        </div>

                        {/* Factor Groups */}
                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Core Complexity Factors */}
                          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161A3A]">
                            <div className="mb-4 flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h4 className="text-gray-900 dark:text-white" style={{ fontSize: '13px', fontWeight: 600 }}>
                                  Core Complexity
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>
                                  Baseline scope and complexity
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {/* ISR */}
                              <div>
                                <div className="mb-1 flex items-center justify-between">
                                  <label className="text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                                    ISR (Initial Scope Rating)
                                  </label>
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-[#0C0F2C] dark:text-gray-300" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                                    {selectedTask.ISR}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={selectedTask.ISR}
                                  onChange={(e) => updateTask(selectedTask.id, 'ISR', parseFloat(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                                  step="0.1"
                                  style={{ fontSize: '13px' }}
                                />
                                <p className="mt-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                                  Baseline complexity score (1-10)
                                </p>
                              </div>
                              {/* CF */}
                              <div>
                                <div className="mb-1 flex items-center justify-between">
                                  <label className="text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                                    CF (Complexity Factor)
                                  </label>
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-[#0C0F2C] dark:text-gray-300" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                                    {selectedTask.CF}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={selectedTask.CF}
                                  onChange={(e) => updateTask(selectedTask.id, 'CF', parseFloat(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                                  step="0.1"
                                  style={{ fontSize: '13px' }}
                                />
                                <p className="mt-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                                  Technical complexity multiplier (1.0-2.0)
                                </p>
                              </div>
                              {/* UXI */}
                              <div>
                                <div className="mb-1 flex items-center justify-between">
                                  <label className="text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                                    UXI (User Experience Impact)
                                  </label>
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-[#0C0F2C] dark:text-gray-300" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                                    {selectedTask.UXI}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={selectedTask.UXI}
                                  onChange={(e) => updateTask(selectedTask.id, 'UXI', parseFloat(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                                  step="0.1"
                                  style={{ fontSize: '13px' }}
                                />
                                <p className="mt-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                                  Impact on user experience (1.0-2.0)
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Architecture & Engineering */}
                          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161A3A]">
                            <div className="mb-4 flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <h4 className="text-gray-900 dark:text-white" style={{ fontSize: '13px', fontWeight: 600 }}>
                                  Architecture & Engineering
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>
                                  Design and technical depth
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {/* RCF */}
                              <div>
                                <div className="mb-1 flex items-center justify-between">
                                  <label className="text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                                    RCF (Risk Complexity Factor)
                                  </label>
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-[#0C0F2C] dark:text-gray-300" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                                    {selectedTask.RCF}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={selectedTask.RCF}
                                  onChange={(e) => updateTask(selectedTask.id, 'RCF', parseFloat(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                                  step="0.1"
                                  style={{ fontSize: '13px' }}
                                />
                                <p className="mt-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                                  Technical and business risk (1.0-2.0)
                                </p>
                              </div>
                              {/* AEP */}
                              <div>
                                <div className="mb-1 flex items-center justify-between">
                                  <label className="text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                                    AEP (Architecture & Eng. Points)
                                  </label>
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-[#0C0F2C] dark:text-gray-300" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                                    {selectedTask.AEP}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={selectedTask.AEP}
                                  onChange={(e) => updateTask(selectedTask.id, 'AEP', parseFloat(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                                  step="0.1"
                                  style={{ fontSize: '13px' }}
                                />
                                <p className="mt-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                                  Engineering design complexity (1-20)
                                </p>
                              </div>
                              {/* L */}
                              <div>
                                <div className="mb-1 flex items-center justify-between">
                                  <label className="text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                                    L (Learning Curve)
                                  </label>
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-[#0C0F2C] dark:text-gray-300" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                                    {selectedTask.L}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={selectedTask.L}
                                  onChange={(e) => updateTask(selectedTask.id, 'L', parseFloat(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                                  step="0.1"
                                  style={{ fontSize: '13px' }}
                                />
                                <p className="mt-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                                  Knowledge transfer time (0-5)
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Collaboration Complexity */}
                          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161A3A]">
                            <div className="mb-4 flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <h4 className="text-gray-900 dark:text-white" style={{ fontSize: '13px', fontWeight: 600 }}>
                                  Collaboration Complexity
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>
                                  Cross-functional coordination
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {/* MLW */}
                              <div>
                                <div className="mb-1 flex items-center justify-between">
                                  <label className="text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                                    MLW (Multi-Layer Work)
                                  </label>
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-[#0C0F2C] dark:text-gray-300" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                                    {selectedTask.MLW}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={selectedTask.MLW}
                                  onChange={(e) => updateTask(selectedTask.id, 'MLW', parseFloat(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                                  step="0.1"
                                  style={{ fontSize: '13px' }}
                                />
                                <p className="mt-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                                  Cross-functional coordination (1.0-2.0)
                                </p>
                              </div>
                              {/* CGW */}
                              <div>
                                <div className="mb-1 flex items-center justify-between">
                                  <label className="text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                                    CGW (Cross-Group Work)
                                  </label>
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-[#0C0F2C] dark:text-gray-300" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                                    {selectedTask.CGW}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={selectedTask.CGW}
                                  onChange={(e) => updateTask(selectedTask.id, 'CGW', parseFloat(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                                  step="0.1"
                                  style={{ fontSize: '13px' }}
                                />
                                <p className="mt-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                                  Team/department collaboration (1.0-2.0)
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Risk & Specialization */}
                          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161A3A]">
                            <div className="mb-4 flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div>
                                <h4 className="text-gray-900 dark:text-white" style={{ fontSize: '13px', fontWeight: 600 }}>
                                  Risk & Specialization
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>
                                  Rework and specialized needs
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {/* RF */}
                              <div>
                                <div className="mb-1 flex items-center justify-between">
                                  <label className="text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                                    RF (Rework Factor)
                                  </label>
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-[#0C0F2C] dark:text-gray-300" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                                    {selectedTask.RF}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={selectedTask.RF}
                                  onChange={(e) => updateTask(selectedTask.id, 'RF', parseFloat(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                                  step="0.1"
                                  style={{ fontSize: '13px' }}
                                />
                                <p className="mt-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                                  Likelihood of iterations (1.0-2.0)
                                </p>
                              </div>
                              {/* S */}
                              <div>
                                <div className="mb-1 flex items-center justify-between">
                                  <label className="text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                                    S (Specialty Factor)
                                  </label>
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-[#0C0F2C] dark:text-gray-300" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                                    {selectedTask.S}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={selectedTask.S}
                                  onChange={(e) => updateTask(selectedTask.id, 'S', parseFloat(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                                  step="0.1"
                                  style={{ fontSize: '13px' }}
                                />
                                <p className="mt-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                                  Need for specialized skills (1.0-2.0)
                                </p>
                              </div>
                              {/* GLRI */}
                              <div>
                                <div className="mb-1 flex items-center justify-between">
                                  <label className="text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                                    GLRI (Governance & Legal Risk)
                                  </label>
                                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-[#0C0F2C] dark:text-gray-300" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                                    {selectedTask.GLRI}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={selectedTask.GLRI}
                                  onChange={(e) => updateTask(selectedTask.id, 'GLRI', parseFloat(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                                  step="0.1"
                                  style={{ fontSize: '13px' }}
                                />
                                <p className="mt-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                                  Compliance complexity (1.0-2.0)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Summary Banner */}
                        <div className="rounded-lg border border-[#2BBBEF]/20 bg-gradient-to-br from-[#2BBBEF]/5 to-[#4AFFA8]/5 p-5 dark:border-[#2BBBEF]/30 dark:from-[#2BBBEF]/10 dark:to-[#4AFFA8]/10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-[#2BBBEF]" />
                              <h4 className="text-gray-900 dark:text-white" style={{ fontSize: '13px', fontWeight: 600 }}>
                                Calculated Metrics
                              </h4>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>
                              💡 Click any metric to set a target budget
                            </p>
                          </div>
                          <div className="grid grid-cols-4 gap-4">
                            {/* PCI Units - Editable */}
                            <div 
                              className="group cursor-pointer rounded-lg border border-transparent p-3 transition-all hover:border-[#2BBBEF] hover:bg-white/50 dark:hover:bg-[#161A3A]/50"
                              onClick={() => startEditingMetric(selectedTask.id, 'pci', calculatePCI(selectedTask))}
                            >
                              <div className="mb-1 flex items-center justify-between">
                                <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>PCI Units</p>
                                <Edit className="h-3 w-3 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                              </div>
                              {editingMetric?.taskId === selectedTask.id && editingMetric?.metric === 'pci' ? (
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    value={metricInputValue}
                                    onChange={(e) => setMetricInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveMetricEdit();
                                      if (e.key === 'Escape') cancelMetricEdit();
                                    }}
                                    onBlur={saveMetricEdit}
                                    autoFocus
                                    className="w-full rounded border border-[#2BBBEF] bg-white px-2 py-1 text-gray-900 dark:bg-[#0C0F2C] dark:text-white"
                                    style={{ fontSize: '14px' }}
                                    step="0.1"
                                  />
                                </div>
                              ) : (
                                <p className="text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                                  {calculatePCI(selectedTask).toFixed(2)}
                                </p>
                              )}
                            </div>

                            {/* AAS Score - Read Only */}
                            <div className="rounded-lg p-3">
                              <p className="mb-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>AAS Score</p>
                              <p className={`${hasLowAAS ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`} style={{ fontSize: '18px', fontWeight: 600 }}>
                                {calculateAAS(selectedTask).toFixed(1)}%
                              </p>
                            </div>

                            {/* Verified Units - Editable */}
                            <div 
                              className="group cursor-pointer rounded-lg border border-transparent p-3 transition-all hover:border-[#2BBBEF] hover:bg-white/50 dark:hover:bg-[#161A3A]/50"
                              onClick={() => startEditingMetric(selectedTask.id, 'verified', calculateVerifiedUnits(selectedTask))}
                            >
                              <div className="mb-1 flex items-center justify-between">
                                <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>Verified Units</p>
                                <Edit className="h-3 w-3 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                              </div>
                              {editingMetric?.taskId === selectedTask.id && editingMetric?.metric === 'verified' ? (
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    value={metricInputValue}
                                    onChange={(e) => setMetricInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveMetricEdit();
                                      if (e.key === 'Escape') cancelMetricEdit();
                                    }}
                                    onBlur={saveMetricEdit}
                                    autoFocus
                                    className="w-full rounded border border-[#2BBBEF] bg-white px-2 py-1 text-gray-900 dark:bg-[#0C0F2C] dark:text-white"
                                    style={{ fontSize: '14px' }}
                                    step="0.1"
                                  />
                                </div>
                              ) : (
                                <p className="text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                                  {calculateVerifiedUnits(selectedTask).toFixed(2)}
                                </p>
                              )}
                            </div>

                            {/* Verified Cost - Editable */}
                            <div 
                              className="group cursor-pointer rounded-lg border border-transparent p-3 transition-all hover:border-[#2BBBEF] hover:bg-white/50 dark:hover:bg-[#161A3A]/50"
                              onClick={() => startEditingMetric(selectedTask.id, 'cost', calculateVerifiedCost(selectedTask))}
                            >
                              <div className="mb-1 flex items-center justify-between">
                                <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>Verified Cost</p>
                                <Edit className="h-3 w-3 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                              </div>
                              {editingMetric?.taskId === selectedTask.id && editingMetric?.metric === 'cost' ? (
                                <div className="flex gap-2">
                                  <div className="flex w-full items-center">
                                    <span className="text-gray-500" style={{ fontSize: '14px' }}>$</span>
                                    <input
                                      type="number"
                                      value={metricInputValue}
                                      onChange={(e) => setMetricInputValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveMetricEdit();
                                        if (e.key === 'Escape') cancelMetricEdit();
                                      }}
                                      onBlur={saveMetricEdit}
                                      autoFocus
                                      className="w-full rounded border border-[#2BBBEF] bg-white px-2 py-1 text-gray-900 dark:bg-[#0C0F2C] dark:text-white"
                                      style={{ fontSize: '14px' }}
                                      step="0.01"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                                  ${calculateVerifiedCost(selectedTask).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/10">
                            <p className="text-blue-700 dark:text-blue-300" style={{ fontSize: '11px', lineHeight: '1.5' }}>
                              <strong>💡 Reverse Calculation:</strong> Click on PCI Units, Verified Units, or Verified Cost to enter a target budget. The system will automatically adjust PCI factors (ISR, CF, UXI, AEP) proportionally to match your budget while maintaining the task's complexity profile.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Task Elements Row */}
                  {isSelected && (
                    <TaskElementsRow
                      task={task}
                      onTaskUpdate={handleTaskElementsUpdate}
                      columnCount={7}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {verificationTask && (
        <AITaskVerificationModal
          isOpen={true}
          task={verificationTask}
          onClose={() => setVerificationTask(null)}
        />
      )}
    </div>
  );
}
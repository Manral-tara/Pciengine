import { useState, useEffect } from 'react';
import { Calculator, Shield, RefreshCw, DollarSign, Download, FileText, Plus, Save, Check, Sparkles, AlertTriangle, ClipboardCheck, Users, TrendingDown, X, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { TaskTable, type Task } from './TaskTable';
import { KPICard } from './KPICard';
import { FormulaPanel } from './FormulaPanel';
import { MarginLock, type MarginData } from './MarginLock';
import { ProjectSavings } from './ProjectSavings';
import { SummarySection } from './SummarySection';
import { AIAssistant } from './AIAssistant';
import { AITaskCreator } from './AITaskCreator';
import { ManualTaskBuilder } from './ManualTaskBuilder';
import { CSVImportExport } from './CSVImportExport';
import { AIInsightsCard } from './AIInsightsCard';
import { ExportReportModal } from './ExportReportModal';
import { ProposalBuilder } from './ProposalBuilder';
import { AuditLayer } from './AuditLayer';
import { BudgetTracker } from './BudgetTracker';
import { ClientPortalManager } from './ClientPortalManager';
import * as api from '../services/api';
import type { Settings } from '../App';

interface DashboardScreenProps {
  settings: Settings;
  currentProjectId: string | null;
}

export function DashboardScreen({ settings, currentProjectId }: DashboardScreenProps) {
  const [view, setView] = useState<'dashboard' | 'proposal' | 'audit' | 'budget' | 'client-portal'>('dashboard');
  const [formulaPanelOpen, setFormulaPanelOpen] = useState(true);
  const [showAITaskCreator, setShowAITaskCreator] = useState(false);
  const [showManualTaskBuilder, setShowManualTaskBuilder] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMarginLock, setShowMarginLock] = useState(false);
  const [showSavings, setShowSavings] = useState(false);
  const [marginData, setMarginData] = useState<MarginData | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Load tasks from backend when component mounts or project changes
  useEffect(() => {
    loadTasks();
  }, [currentProjectId]);

  // Track unsaved changes
  useEffect(() => {
    if (!loading && tasks.length > 0) {
      setHasUnsavedChanges(true);
      setSaveStatus('idle');
    }
  }, [tasks, loading]);

  // Auto-save after 3 seconds of inactivity
  useEffect(() => {
    if (hasUnsavedChanges && !syncing) {
      const timer = setTimeout(() => {
        syncTasksToBackend();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [tasks, hasUnsavedChanges, syncing]);

  // Keyboard shortcut for saving (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && !syncing) {
          syncTasksToBackend();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, syncing, tasks, currentProjectId]);

  async function loadTasks() {
    try {
      setLoading(true);
      let loadedTasks: Task[] = [];
      
      // Load tasks based on whether a project is selected
      if (currentProjectId) {
        // Load tasks for specific project
        loadedTasks = await api.getProjectTasks(currentProjectId);
      } else {
        // Load general tasks (unsaved project)
        loadedTasks = await api.getTasks();
      }
      
      if (loadedTasks.length > 0) {
        // Ensure all tasks have reference numbers
        const tasksWithRefs = loadedTasks.map((task, index) => ({
          ...task,
          referenceNumber: task.referenceNumber || `TASK-${String(index + 1).padStart(3, '0')}`,
        }));
        setTasks(tasksWithRefs);
        setHasUnsavedChanges(false); // Tasks loaded from backend are already saved
        setSaveStatus('success');
      } else {
        // Start with empty array if no tasks exist
        setTasks([]);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      // Start with empty array on error
      setTasks([]);
      setHasUnsavedChanges(false);
    } finally {
      setLoading(false);
    }
  }

  async function syncTasksToBackend() {
    try {
      setSyncing(true);
      setSaveStatus('saving');
      
      // Filter out null/undefined tasks before syncing
      const validTasks = tasks.filter(task => task != null && task.id != null);
      
      // Save to specific project or general tasks
      if (currentProjectId) {
        // Save tasks to specific project
        await api.saveProjectTasks(currentProjectId, validTasks);
      } else {
        // Save to general tasks (unsaved project)
        await api.syncTasks(validTasks);
      }
      
      setHasUnsavedChanges(false);
      setSaveStatus('success');
      
      // Auto-hide success after 2 seconds
      setTimeout(() => {
        if (saveStatus === 'success') {
          setSaveStatus('idle');
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to sync tasks:', error);
      setSaveStatus('error');
    } finally {
      setSyncing(false);
    }
  }

  const addTask = async () => {
    const newTask: Task = {
      id: Date.now().toString(),
      taskName: 'New Task',
      ISR: 1,
      CF: 1,
      UXI: 1,
      RCF: 1,
      AEP: 1,
      L: 0,
      MLW: 1,
      CGW: 1,
      RF: 1,
      S: 1,
      GLRI: 1,
      aiVerifiedUnits: 0,
    };
    const updatedTasks = [...tasks, newTask].filter(t => t != null && t.id != null);
    setTasks(updatedTasks);
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  };

  const handleAICreateTask = async (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      referenceNumber: `TASK-${String(tasks.length + 1).padStart(3, '0')}`,
    };
    const updatedTasks = [...tasks, newTask].filter(t => t != null && t.id != null);
    setTasks(updatedTasks);
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  };

  const handleAICreateMultipleTasks = async (tasksData: Omit<Task, 'id'>[]) => {
    const newTasks: Task[] = tasksData.map((taskData, index) => ({
      ...taskData,
      id: (Date.now() + index).toString(),
      referenceNumber: `TASK-${String(tasks.length + index + 1).padStart(3, '0')}`,
    }));
    const updatedTasks = [...tasks, ...newTasks].filter(t => t != null && t.id != null);
    setTasks(updatedTasks);
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  };

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

  // Filter out null/undefined tasks before calculations
  const validTasks = tasks.filter(task => task != null);
  
  const totalPCIUnits = validTasks.reduce((sum, task) => sum + calculatePCI(task), 0);
  const totalAIVerifiedUnits = validTasks.reduce((sum, task) => sum + task.aiVerifiedUnits, 0);
  const totalVerifiedUnits = validTasks.reduce((sum, task) => sum + calculateVerifiedUnits(task), 0);
  const totalVerifiedCost = totalVerifiedUnits * settings.hourlyRate;
  const overallAAS = totalPCIUnits > 0 ? (totalAIVerifiedUnits / totalPCIUnits) * 100 : 0;

  const hasLowAAS = validTasks.some(task => {
    const aas = calculateAAS(task);
    return aas < 85 && aas > 0;
  });

  // Load margin data when project changes
  useEffect(() => {
    if (currentProjectId) {
      loadMarginData();
    }
  }, [currentProjectId]);

  const loadMarginData = async () => {
    if (!currentProjectId) return;
    
    try {
      const data = await api.getMarginData(currentProjectId);
      setMarginData(data);
    } catch (error) {
      console.error('Failed to load margin data:', error);
    }
  };

  const handleMarginSave = async (data: MarginData) => {
    try {
      if (currentProjectId) {
        await api.saveMarginData(currentProjectId, data);
        setMarginData(data);
      } else {
        alert('Please select or create a project first to use Margin Lock');
      }
    } catch (error) {
      console.error('Failed to save margin data:', error);
      alert('Failed to save margin settings. Please try again.');
    }
  };

  return (
    <>
      <div className={`transition-all duration-300 ${formulaPanelOpen ? 'mr-96' : 'mr-0'}`}>
        {/* View Toggle */}
        <div className="mx-auto max-w-[1600px] px-6 pt-6">
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm w-fit">
            <button
              onClick={() => setView('dashboard')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 transition-all ${
                view === 'dashboard'
                  ? 'bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              <Calculator className="h-4 w-4" />
              Task Modeling
            </button>
            <button
              onClick={() => setView('proposal')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 transition-all ${
                view === 'proposal'
                  ? 'bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              <FileText className="h-4 w-4" />
              Proposal Builder
            </button>
            <button
              onClick={() => setView('audit')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 transition-all ${
                view === 'audit'
                  ? 'bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              <ClipboardCheck className="h-4 w-4" />
              Project Audit
            </button>
            <button
              onClick={() => setView('budget')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 transition-all ${
                view === 'budget'
                  ? 'bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              <DollarSign className="h-4 w-4" />
              Budget Tracker
            </button>
            <button
              onClick={() => setView('client-portal')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 transition-all ${
                view === 'client-portal'
                  ? 'bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              <Users className="h-4 w-4" />
              Client Portal
            </button>
          </div>
        </div>

        {view === 'dashboard' ? (
          <>
            {/* Alert Banner */}
            {hasLowAAS && (
              <div className="mx-auto max-w-[1600px] px-6">
                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <div>AAS &lt; 0.85 — Review Variance</div>
                    <div className="text-red-600" style={{ fontSize: '13px' }}>
                      One or more tasks have an Accuracy Audit Score below 85%. Please review and adjust verified units.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* KPI Cards */}
            <div className="mx-auto max-w-[1600px] px-6 py-6">
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                  title="Total PCI Modeled Units"
                  value={totalPCIUnits.toFixed(2)}
                  icon={Calculator}
                  accent="mint"
                />
                <KPICard
                  title="AI-Verified Units"
                  value={totalAIVerifiedUnits.toFixed(2)}
                  icon={Shield}
                  accent="blue"
                />
                <KPICard
                  title="Accuracy Audit Score (AAS%)"
                  value={`${overallAAS.toFixed(1)}%`}
                  icon={RefreshCw}
                  accent="navy"
                />
                <KPICard
                  title={`Verified Cost (${settings.currency})`}
                  value={`$${totalVerifiedCost.toFixed(2)}`}
                  icon={DollarSign}
                  accent="mint"
                />
              </div>

              {/* Project Savings Button */}
              {tasks.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowSavings(true)}
                    className="w-full rounded-xl border-2 border-dashed border-[#2BBBEF]/30 bg-gradient-to-r from-[#2BBBEF]/5 to-[#4AFFA8]/5 p-4 transition-all hover:border-[#2BBBEF]/50 hover:from-[#2BBBEF]/10 hover:to-[#4AFFA8]/10 dark:border-[#2BBBEF]/20 dark:from-[#2BBBEF]/10 dark:to-[#4AFFA8]/10 dark:hover:border-[#2BBBEF]/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
                          <TrendingDown className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                            View Project Savings & Efficiency
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '13px' }}>
                            See cost optimization analysis and ROI from AI-powered estimation
                          </p>
                        </div>
                      </div>
                      <div className="rounded-full bg-white px-4 py-2 text-[#2BBBEF] shadow-sm dark:bg-[#161A3A] dark:text-[#4AFFA8]" style={{ fontSize: '14px', fontWeight: 600 }}>
                        Open Report →
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Task Modeling Header */}
              <div className="mb-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-3">
                      <h2 className="text-[#010029] dark:text-white">Task Modeling Table</h2>
                      {hasUnsavedChanges && saveStatus !== 'success' && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700 border border-amber-300" style={{ fontSize: '12px' }}>
                          Unsaved Changes
                        </span>
                      )}
                      {saveStatus === 'success' && !hasUnsavedChanges && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-green-700 border border-green-300" style={{ fontSize: '12px' }}>
                          ✓ All changes saved
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '14px' }}>
                      Enter task variables to calculate PCI units and verification metrics
                    </p>
                  </div>
                  
                  {/* Action Buttons - Redesigned */}
                  <div className="flex items-center gap-2">
                    {/* Save Button */}
                    <button
                      onClick={syncTasksToBackend}
                      disabled={syncing || (!hasUnsavedChanges && saveStatus === 'success')}
                      className={`group relative flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all ${
                        syncing
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                          : saveStatus === 'success' && !hasUnsavedChanges
                          ? 'bg-green-500 text-white'
                          : saveStatus === 'error'
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : hasUnsavedChanges
                          ? 'bg-white border-2 border-[#2BBBEF] text-[#2BBBEF] hover:bg-[#2BBBEF] hover:text-white dark:bg-[#0C0F2C] dark:border-[#2BBBEF] dark:hover:bg-[#2BBBEF]'
                          : 'bg-gray-100 text-gray-400 cursor-default dark:bg-gray-700 dark:text-gray-500'
                      }`}
                      style={{ fontSize: '14px', fontWeight: 600 }}
                    >
                      {syncing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : saveStatus === 'success' && !hasUnsavedChanges ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {syncing ? 'Saving...' : saveStatus === 'success' && !hasUnsavedChanges ? 'Saved' : 'Save'}
                      
                      {/* Keyboard Shortcut Hint */}
                      {!syncing && hasUnsavedChanges && (
                        <span className="ml-1 rounded bg-black/10 px-1.5 py-0.5 text-xs font-mono dark:bg-white/10">
                          ⌘S
                        </span>
                      )}
                    </button>
                    
                    {/* Create Task Dropdown - Combines AI Creator, Manual Builder, CSV Import */}
                    <div className="relative">
                      <button
                        onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                        className="flex items-center gap-2 rounded-lg border-2 border-[#4AFFA8] bg-gradient-to-br from-[#4AFFA8] to-[#2BBBEF] px-4 py-2.5 text-white transition-all hover:shadow-lg dark:hover:shadow-[#4AFFA8]/20"
                        style={{ fontSize: '14px', fontWeight: 600 }}
                      >
                        <Plus className="h-4 w-4" />
                        Create Task
                        <ChevronDown className={`h-4 w-4 transition-transform ${showCreateDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {showCreateDropdown && (
                        <>
                          {/* Backdrop to close dropdown */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowCreateDropdown(false)}
                          />
                          
                          {/* Menu */}
                          <div className="absolute right-0 top-full z-20 mt-2 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0C0F2C]">
                            {/* AI Creator Option */}
                            <button
                              onClick={() => {
                                setShowAITaskCreator(true);
                                setShowCreateDropdown(false);
                              }}
                              className="flex w-full items-start gap-3 border-b border-gray-100 p-4 text-left transition-all hover:bg-gradient-to-r hover:from-[#4AFFA8]/10 hover:to-[#2BBBEF]/10 dark:border-white/5 dark:hover:from-[#4AFFA8]/20 dark:hover:to-[#2BBBEF]/20"
                            >
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#4AFFA8] to-[#2BBBEF]">
                                <Sparkles className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                                  AI Task Creator
                                </div>
                                <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
                                  Describe your task in plain English and let AI generate it
                                </div>
                              </div>
                            </button>
                            
                            {/* Manual Task Builder Option */}
                            <button
                              onClick={() => {
                                setShowManualTaskBuilder(true);
                                setShowCreateDropdown(false);
                              }}
                              className="flex w-full items-start gap-3 border-b border-gray-100 p-4 text-left transition-all hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 dark:border-white/5 dark:hover:from-purple-500/20 dark:hover:to-pink-500/20"
                            >
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                                <Plus className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                                  Manual Task Builder
                                </div>
                                <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
                                  Create tasks manually with full control over all fields
                                </div>
                              </div>
                            </button>
                            
                            {/* CSV Import Option */}
                            <button
                              onClick={() => {
                                setShowCSVImport(true);
                                setShowCreateDropdown(false);
                              }}
                              className="flex w-full items-start gap-3 p-4 text-left transition-all hover:bg-gradient-to-r hover:from-green-500/10 hover:to-blue-500/10 dark:hover:from-green-500/20 dark:hover:to-blue-500/20"
                            >
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-blue-600">
                                <FileSpreadsheet className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                                  CSV Bulk Import
                                </div>
                                <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
                                  Import multiple tasks from CSV/Excel with auto-calculation
                                </div>
                              </div>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Margin Lock */}
                    <button
                      onClick={() => setShowMarginLock(true)}
                      disabled={!currentProjectId}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all ${
                        currentProjectId
                          ? 'border-2 border-purple-500 bg-white text-purple-600 hover:bg-purple-500 hover:text-white dark:bg-[#0C0F2C] dark:text-purple-400 dark:hover:bg-purple-500 dark:hover:text-white'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                      }`}
                      title={!currentProjectId ? 'Select a project first to use Margin Lock' : 'Manage profit margins and vendor rates'}
                      style={{ fontSize: '14px', fontWeight: 600 }}
                    >
                      <Shield className="h-4 w-4" />
                      Margin Lock
                    </button>
                    
                    {/* Export Report */}
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-4 py-2.5 text-white shadow-sm transition-all hover:shadow-md"
                      style={{ fontSize: '14px', fontWeight: 600 }}
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Task Table */}
              <TaskTable tasks={tasks} onTasksChange={setTasks} settings={settings} />
            </div>

            {/* AI Insights */}
            <AIInsightsCard tasks={tasks} settings={settings} />

            {/* Summary Section */}
            <div className="pb-8 pt-6">
              <SummarySection tasks={tasks} settings={settings} />
            </div>
          </>
        ) : view === 'proposal' ? (
          <div className="mx-auto max-w-[1600px] px-6 pb-8">
            <ProposalBuilder tasks={tasks} settings={settings} />
          </div>
        ) : view === 'audit' ? (
          <div className="mx-auto max-w-[1600px] px-6 pb-8">
            <AuditLayer settings={settings} tasks={tasks} onTasksChange={setTasks} />
          </div>
        ) : view === 'budget' ? (
          <div className="mx-auto max-w-[1600px] px-6 pb-8">
            <BudgetTracker tasks={tasks} onTasksChange={setTasks} settings={settings} />
          </div>
        ) : (
          <div className="mx-auto max-w-[1600px] px-6 pb-8">
            <ClientPortalManager projectName={settings.projectName || 'Your Project'} />
          </div>
        )}
      </div>

      {/* Formula Panel */}
      <FormulaPanel isOpen={formulaPanelOpen} onToggle={() => setFormulaPanelOpen(!formulaPanelOpen)} />

      {/* AI Assistant */}
      <AIAssistant tasks={tasks} settings={settings} />

      {/* AI Task Creator Modal */}
      <AITaskCreator
        isOpen={showAITaskCreator}
        onClose={() => setShowAITaskCreator(false)}
        onCreateTask={handleAICreateTask}
        onCreateMultipleTasks={handleAICreateMultipleTasks}
      />

      {/* Manual Task Builder Modal */}
      <ManualTaskBuilder
        isOpen={showManualTaskBuilder}
        onClose={() => setShowManualTaskBuilder(false)}
        onCreateTask={handleAICreateTask}
      />

      {/* CSV Import/Export Modal */}
      <CSVImportExport
        isOpen={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        onImport={handleAICreateMultipleTasks}
      />

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        tasks={tasks}
        settings={settings}
      />

      {/* Margin Lock Modal */}
      <MarginLock
        isOpen={showMarginLock}
        onClose={() => setShowMarginLock(false)}
        project={currentProjectId ? { id: currentProjectId, name: 'Current Project' } as any : null}
        tasks={tasks}
        onSave={handleMarginSave}
        existingMarginData={marginData}
      />

      {/* Project Savings Modal */}
      {showSavings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowSavings(false)}>
          <div className="max-h-[90vh] w-full max-w-[1400px] overflow-y-auto rounded-2xl bg-white dark:bg-[#0C0F2C] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-white/10 dark:bg-[#0C0F2C]">
              <h2 className="text-gray-900 dark:text-white" style={{ fontSize: '24px', fontWeight: 700 }}>
                Project Savings & Efficiency Report
              </h2>
              <button
                onClick={() => setShowSavings(false)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#161A3A] dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <ProjectSavings 
                tasks={tasks} 
                settings={settings}
                projectName={settings.projectName || "Current Project"}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
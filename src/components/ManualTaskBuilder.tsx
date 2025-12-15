import { useState } from 'react';
import { Edit3, X, Plus, Trash2, ChevronDown, ChevronRight, FileText, Calendar, DollarSign, Layers, AlertCircle, CheckCircle, Save } from 'lucide-react';
import type { Task } from './TaskTable';

interface ManualTaskBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Omit<Task, 'id'>) => void;
  initialData?: Partial<Task>;
}

interface SubTask {
  id: string;
  name: string;
  description: string;
  estimatedHours?: number;
}

export function ManualTaskBuilder({ isOpen, onClose, onCreateTask, initialData }: ManualTaskBuilderProps) {
  const [phase, setPhase] = useState(initialData?.taskName?.split(' - ')[0] || '');
  const [mainTask, setMainTask] = useState(initialData?.taskName || '');
  const [description, setDescription] = useState('');
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [showSubTasks, setShowSubTasks] = useState(false);
  
  // PCI Factors
  const [ISR, setISR] = useState(initialData?.ISR || 1);
  const [CF, setCF] = useState(initialData?.CF || 1);
  const [UXI, setUXI] = useState(initialData?.UXI || 1);
  const [RCF, setRCF] = useState(initialData?.RCF || 1);
  const [AEP, setAEP] = useState(initialData?.AEP || 1);
  const [L, setL] = useState(initialData?.L || 1);
  const [MLW, setMLW] = useState(initialData?.MLW || 1);
  const [CGW, setCGW] = useState(initialData?.CGW || 1);
  const [RF, setRF] = useState(initialData?.RF || 1);
  const [S, setS] = useState(initialData?.S || 1);
  const [GLRI, setGLRI] = useState(initialData?.GLRI || 1);
  
  // Timeline
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [completionDate, setCompletionDate] = useState(initialData?.completionDate || '');
  
  // Budget
  const [actualHours, setActualHours] = useState(initialData?.actualHours || 0);
  const [status, setStatus] = useState<'not-started' | 'in-progress' | 'completed' | 'on-hold'>(initialData?.status || 'not-started');

  const calculatePCI = () => {
    return (ISR * CF * UXI) + (RCF * AEP) + (L + MLW + CGW + RF + S) + GLRI;
  };

  const addSubTask = () => {
    setSubTasks([...subTasks, {
      id: `subtask-${Date.now()}`,
      name: '',
      description: '',
      estimatedHours: 0,
    }]);
    setShowSubTasks(true);
  };

  const updateSubTask = (id: string, field: keyof SubTask, value: any) => {
    setSubTasks(subTasks.map(st => 
      st.id === id ? { ...st, [field]: value } : st
    ));
  };

  const removeSubTask = (id: string) => {
    setSubTasks(subTasks.filter(st => st.id !== id));
  };

  const handleSave = () => {
    if (!mainTask.trim()) {
      alert('Please enter a task name');
      return;
    }

    const taskName = phase ? `${phase} - ${mainTask}` : mainTask;
    
    const newTask: Omit<Task, 'id'> = {
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
      aiVerifiedUnits: calculatePCI(),
      startDate,
      completionDate,
      actualHours,
      status,
      // Store subtasks and description in taskElements
      taskElements: [
        ...(description ? [{
          id: `desc-${Date.now()}`,
          title: 'Description',
          description: description,
          category: 'description',
        }] : []),
        ...subTasks.map(st => ({
          id: st.id,
          title: st.name,
          description: st.description,
          category: 'subtask',
        })),
      ],
    };

    onCreateTask(newTask);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setPhase('');
    setMainTask('');
    setDescription('');
    setSubTasks([]);
    setISR(1);
    setCF(1);
    setUXI(1);
    setRCF(1);
    setAEP(1);
    setL(1);
    setMLW(1);
    setCGW(1);
    setRF(1);
    setS(1);
    setGLRI(1);
    setStartDate('');
    setCompletionDate('');
    setActualHours(0);
    setStatus('not-started');
  };

  if (!isOpen) return null;

  const pciValue = calculatePCI();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Slide-up Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-center transition-transform duration-500 ease-out animate-slide-up">
        <div 
          className="w-full max-w-6xl rounded-t-3xl border-t border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0C0F2C]"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Decorative Top Bar */}
          <div className="flex justify-center border-b border-gray-100 py-3 dark:border-white/5">
            <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
                    <Edit3 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ fontSize: '28px', fontWeight: 700 }}>
                    Manual Task Builder
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '15px', maxWidth: '600px' }}>
                    Create tasks manually with full control over phases, descriptions, sub-tasks, and all PCI factors
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#161A3A] dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Hierarchical Task Structure */}
              <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 dark:border-purple-900/30 dark:from-purple-950/20 dark:to-pink-950/20">
                <div className="mb-5 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                    Task Structure
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Phase (Optional) */}
                  <div>
                    <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 500 }}>
                      Phase (Optional)
                    </label>
                    <input
                      type="text"
                      value={phase}
                      onChange={(e) => setPhase(e.target.value)}
                      placeholder="e.g., Phase 1: Discovery, Phase 2: Development"
                      className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                      style={{ fontSize: '14px' }}
                    />
                    <p className="mt-1.5 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
                      Group related tasks into phases for better organization
                    </p>
                  </div>

                  {/* Main Task Name */}
                  <div>
                    <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 500 }}>
                      Main Task Name *
                    </label>
                    <input
                      type="text"
                      value={mainTask}
                      onChange={(e) => setMainTask(e.target.value)}
                      placeholder="e.g., User Authentication System"
                      className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                      style={{ fontSize: '14px' }}
                    />
                  </div>

                  {/* Task Description */}
                  <div>
                    <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 500 }}>
                      Task Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detailed description of what needs to be done, acceptance criteria, technical requirements..."
                      rows={4}
                      className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                      style={{ fontSize: '14px' }}
                    />
                  </div>

                  {/* Sub-Tasks */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 500 }}>
                        Sub-Tasks
                      </label>
                      <button
                        onClick={addSubTask}
                        className="flex items-center gap-1.5 rounded-lg bg-purple-100 px-3 py-1.5 text-purple-700 transition-colors hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
                        style={{ fontSize: '13px', fontWeight: 500 }}
                      >
                        <Plus className="h-4 w-4" />
                        Add Sub-Task
                      </button>
                    </div>

                    {subTasks.length > 0 && (
                      <div className="space-y-3">
                        {subTasks.map((subTask, index) => (
                          <div key={subTask.id} className="rounded-lg border-2 border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161A3A]">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400" style={{ fontSize: '13px', fontWeight: 600 }}>
                                Sub-Task {index + 1}
                              </span>
                              <button
                                onClick={() => removeSubTask(subTask.id)}
                                className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={subTask.name}
                                onChange={(e) => updateSubTask(subTask.id, 'name', e.target.value)}
                                placeholder="Sub-task name"
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                                style={{ fontSize: '13px' }}
                              />
                              <textarea
                                value={subTask.description}
                                onChange={(e) => updateSubTask(subTask.id, 'description', e.target.value)}
                                placeholder="Sub-task description"
                                rows={2}
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                                style={{ fontSize: '13px' }}
                              />
                              <input
                                type="number"
                                value={subTask.estimatedHours || ''}
                                onChange={(e) => updateSubTask(subTask.id, 'estimatedHours', parseFloat(e.target.value) || 0)}
                                placeholder="Estimated hours"
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                                style={{ fontSize: '13px' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Timeline */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#161A3A]">
                <div className="mb-5 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#2BBBEF]" />
                  <h3 className="text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                    Timeline & Status
                  </h3>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 500 }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2.5 text-gray-800 focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 500 }}>
                      Target Completion
                    </label>
                    <input
                      type="date"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                      min={startDate || undefined}
                      className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2.5 text-gray-800 focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 500 }}>
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2.5 text-gray-800 focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                      style={{ fontSize: '14px' }}
                    >
                      <option value="not-started">Not Started</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on-hold">On Hold</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PCI Factors */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#161A3A]">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#4AFFA8]" />
                    <h3 className="text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                      PCI Factors
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#2BBBEF]/10 to-[#4AFFA8]/10 px-4 py-2">
                    <span className="text-gray-600 dark:text-gray-400" style={{ fontSize: '13px', fontWeight: 500 }}>
                      Total PCI:
                    </span>
                    <span className="text-[#2BBBEF] dark:text-[#4AFFA8]" style={{ fontSize: '18px', fontWeight: 700 }}>
                      {pciValue.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {[
                    { label: 'ISR', value: ISR, setter: setISR, tooltip: 'Initial Scope Rating' },
                    { label: 'CF', value: CF, setter: setCF, tooltip: 'Complexity Factor' },
                    { label: 'UXI', value: UXI, setter: setUXI, tooltip: 'User Experience Impact' },
                    { label: 'RCF', value: RCF, setter: setRCF, tooltip: 'Risk Complexity Factor' },
                    { label: 'AEP', value: AEP, setter: setAEP, tooltip: 'Architecture & Engineering Points' },
                    { label: 'L', value: L, setter: setL, tooltip: 'Learning Curve' },
                    { label: 'MLW', value: MLW, setter: setMLW, tooltip: 'Multi-Layer Work' },
                    { label: 'CGW', value: CGW, setter: setCGW, tooltip: 'Cross-Group Work' },
                    { label: 'RF', value: RF, setter: setRF, tooltip: 'Rework Factor' },
                    { label: 'S', value: S, setter: setS, tooltip: 'Specialty Factor' },
                    { label: 'GLRI', value: GLRI, setter: setGLRI, tooltip: 'Governance & Legal Risk Index' },
                  ].map((factor) => (
                    <div key={factor.label}>
                      <label className="mb-2 flex items-center gap-1 text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 500 }}>
                        {factor.label}
                        <span className="text-gray-400" title={factor.tooltip}>ⓘ</span>
                      </label>
                      <input
                        type="number"
                        value={factor.value}
                        onChange={(e) => factor.setter(parseFloat(e.target.value) || 1)}
                        min="0.1"
                        step="0.1"
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2.5 text-gray-800 focus:border-[#4AFFA8] focus:outline-none focus:ring-2 focus:ring-[#4AFFA8]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                        style={{ fontSize: '14px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-white/10">
                <button
                  onClick={onClose}
                  className="rounded-xl border-2 border-gray-200 px-6 py-3 text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-[#161A3A]"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 px-8 py-3 text-white shadow-lg transition-all hover:shadow-xl"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  <Save className="h-5 w-5" />
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </>
  );
}

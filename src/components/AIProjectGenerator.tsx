import { useState } from 'react';
import { Sparkles, X, Loader, CheckCircle, Edit2, Trash2, Plus, Wand2, RefreshCw } from 'lucide-react';
import * as api from '../services/api';
import type { Task } from './TaskTable';
import type { Project } from './ProjectManager';

interface AIProjectGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectGenerated: (project: Project, tasks: Task[]) => void;
}

interface GeneratedProject {
  name: string;
  description: string;
  color: string;
  tasks: Omit<Task, 'id'>[];
  estimatedCost: number;
  estimatedDuration: string;
}

const PROJECT_EXAMPLES = [
  {
    title: 'E-commerce Platform',
    description: 'Build a full e-commerce platform with product catalog, shopping cart, payment integration, and admin dashboard',
    icon: '🛍️',
  },
  {
    title: 'Mobile Banking App',
    description: 'Create a secure mobile banking app with account management, transfers, bill payments, and financial insights',
    icon: '💳',
  },
  {
    title: 'SaaS Dashboard',
    description: 'Develop a SaaS analytics dashboard with data visualization, user management, and API integrations',
    icon: '📊',
  },
  {
    title: 'Healthcare Portal',
    description: 'Build a patient portal with appointment scheduling, medical records, telemedicine, and prescription management',
    icon: '🏥',
  },
];

export function AIProjectGenerator({ isOpen, onClose, onProjectGenerated }: AIProjectGeneratorProps) {
  const [step, setStep] = useState<'input' | 'generating' | 'preview'>('input');
  const [projectInput, setProjectInput] = useState('');
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleGenerate = async () => {
    if (!projectInput.trim()) {
      alert('Please enter a project description');
      return;
    }

    try {
      setStep('generating');
      const result = await api.generateProjectWithAI(projectInput);
      setGeneratedProject(result);
      setStep('preview');
    } catch (error) {
      console.error('Failed to generate project:', error);
      alert('Failed to generate project. Please try again.');
      setStep('input');
    }
  };

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const result = await api.generateProjectWithAI(projectInput);
      setGeneratedProject(result);
    } catch (error) {
      console.error('Failed to regenerate project:', error);
      alert('Failed to regenerate project. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!generatedProject) return;

    try {
      // Create the project
      const project: Project = {
        id: `project-${Date.now()}`,
        name: generatedProject.name,
        description: generatedProject.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taskCount: generatedProject.tasks.length,
        totalPCI: 0,
        totalCost: generatedProject.estimatedCost,
        color: generatedProject.color,
      };

      // Create tasks with IDs
      const tasks: Task[] = generatedProject.tasks.map((task, index) => ({
        ...task,
        id: `${Date.now()}-${index}`,
        referenceNumber: `TASK-${String(index + 1).padStart(3, '0')}`,
      }));

      // Call the callback
      onProjectGenerated(project, tasks);
      
      // Reset and close
      setProjectInput('');
      setGeneratedProject(null);
      setStep('input');
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleTaskUpdate = (index: number, field: string, value: any) => {
    if (!generatedProject) return;
    
    const updatedTasks = [...generatedProject.tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    
    setGeneratedProject({ ...generatedProject, tasks: updatedTasks });
  };

  const handleDeleteTask = (index: number) => {
    if (!generatedProject) return;
    
    const updatedTasks = generatedProject.tasks.filter((_, i) => i !== index);
    setGeneratedProject({ ...generatedProject, tasks: updatedTasks });
  };

  const handleAddTask = () => {
    if (!generatedProject) return;
    
    const newTask: Omit<Task, 'id'> = {
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
    
    setGeneratedProject({
      ...generatedProject,
      tasks: [...generatedProject.tasks, newTask],
    });
  };

  const handleExampleClick = (example: typeof PROJECT_EXAMPLES[0]) => {
    setProjectInput(example.description);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0C0F2C]"
          onClick={(e) => e.stopPropagation()}
        >
          {step === 'input' && (
            <div className="p-8">
              {/* Header */}
              <div className="mb-8 flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-[#2BBBEF]/20 to-[#4AFFA8]/20 blur-xl" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] shadow-lg">
                      <Wand2 className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="mb-2 bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] bg-clip-text text-transparent" style={{ fontSize: '28px', fontWeight: 700 }}>
                      AI Project Generator
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '15px', maxWidth: '500px' }}>
                      Describe your project and let AI generate the complete structure with tasks, estimates, and PCI calculations
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

              {/* Input Section */}
              <div className="mb-6">
                <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Project Description *
                </label>
                <textarea
                  value={projectInput}
                  onChange={(e) => setProjectInput(e.target.value)}
                  placeholder="E.g., Build a comprehensive e-commerce platform with user authentication, product management, shopping cart, payment processing using Stripe, order tracking, admin dashboard, and email notifications. Include responsive design, search functionality, and product reviews."
                  rows={6}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white dark:placeholder-gray-500"
                  style={{ fontSize: '14px' }}
                  autoFocus
                />
                <p className="mt-2 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
                  💡 Be specific! Include features, technologies, integrations, and requirements for better results.
                </p>
              </div>

              {/* Example Cards */}
              <div className="mb-8">
                <label className="mb-3 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Or try an example:
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  {PROJECT_EXAMPLES.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="group flex items-start gap-3 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 text-left transition-all hover:border-[#2BBBEF] hover:from-[#2BBBEF]/5 hover:to-[#4AFFA8]/5 dark:border-white/10 dark:from-[#161A3A] dark:to-[#0C0F2C] dark:hover:border-[#2BBBEF]"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2BBBEF]/10 to-[#4AFFA8]/10 text-2xl">
                        {example.icon}
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                          {example.title}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }}>
                          {example.description}
                        </p>
                      </div>
                      <Sparkles className="h-4 w-4 text-[#2BBBEF] opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-white/10">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-300 dark:hover:bg-[#0C0F2C]"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!projectInput.trim()}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-8 py-3 text-white transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-50"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  <Wand2 className="h-4 w-4" />
                  Generate Project
                </button>
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div className="flex min-h-[500px] flex-col items-center justify-center p-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-[#2BBBEF]/20 to-[#4AFFA8]/20 blur-2xl" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
                  <Loader className="h-12 w-12 animate-spin text-white" />
                </div>
              </div>
              <h3 className="mb-2 text-gray-900 dark:text-white" style={{ fontSize: '24px', fontWeight: 700 }}>
                Generating Your Project...
              </h3>
              <p className="mb-6 text-center text-gray-600 dark:text-gray-400" style={{ fontSize: '15px', maxWidth: '500px' }}>
                AI is analyzing your requirements and creating a comprehensive project structure with tasks and estimates
              </p>
              <div className="flex flex-col gap-2">
                {['Analyzing project scope...', 'Breaking down into tasks...', 'Calculating PCI factors...', 'Generating estimates...'].map((text, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-500 dark:text-gray-400" style={{ fontSize: '13px' }}>
                    <div className="h-2 w-2 rounded-full bg-[#2BBBEF] animate-pulse" style={{ animationDelay: `${index * 200}ms` }} />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'preview' && generatedProject && (
            <div className="p-8">
              {/* Header */}
              <div className="mb-6 flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div 
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: generatedProject.color }}
                  >
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '24px', fontWeight: 700 }}>
                      {generatedProject.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>
                      {generatedProject.description}
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

              {/* Project Stats */}
              <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 dark:border-white/10 dark:from-[#161A3A] dark:to-[#0C0F2C]">
                  <p className="mb-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>Tasks</p>
                  <p className="text-gray-900 dark:text-white" style={{ fontSize: '24px', fontWeight: 700 }}>
                    {generatedProject.tasks.length}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 dark:border-white/10 dark:from-[#161A3A] dark:to-[#0C0F2C]">
                  <p className="mb-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>Estimated Cost</p>
                  <p className="text-gray-900 dark:text-white" style={{ fontSize: '24px', fontWeight: 700 }}>
                    ${generatedProject.estimatedCost.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 dark:border-white/10 dark:from-[#161A3A] dark:to-[#0C0F2C]">
                  <p className="mb-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>Duration</p>
                  <p className="text-gray-900 dark:text-white" style={{ fontSize: '24px', fontWeight: 700 }}>
                    {generatedProject.estimatedDuration}
                  </p>
                </div>
              </div>

              {/* Tasks List */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                    Generated Tasks ({generatedProject.tasks.length})
                  </h3>
                  <button
                    onClick={handleAddTask}
                    className="flex items-center gap-1 rounded-lg border border-[#2BBBEF] bg-white px-3 py-1.5 text-[#2BBBEF] transition-all hover:bg-[#2BBBEF] hover:text-white dark:bg-[#0C0F2C]"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Task
                  </button>
                </div>
                <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-[#161A3A]">
                  {generatedProject.tasks.map((task, index) => (
                    <div 
                      key={index}
                      className="group rounded-lg border border-gray-200 bg-white p-3 transition-all hover:shadow-md dark:border-white/10 dark:bg-[#0C0F2C]"
                    >
                      {editingTask === index ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={task.taskName}
                            onChange={(e) => handleTaskUpdate(index, 'taskName', e.target.value)}
                            className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-gray-900 dark:border-white/10 dark:bg-[#161A3A] dark:text-white"
                            style={{ fontSize: '13px' }}
                          />
                          <button
                            onClick={() => setEditingTask(null)}
                            className="rounded bg-[#2BBBEF] px-3 py-1 text-white" style={{ fontSize: '12px' }}
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-gray-900 dark:text-white" style={{ fontSize: '13px', fontWeight: 500 }}>
                              {task.taskName}
                            </p>
                            <div className="mt-1 flex items-center gap-3 text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>
                              <span>ISR: {task.ISR}</span>
                              <span>CF: {task.CF}</span>
                              <span>UXI: {task.UXI}</span>
                              <span>Verified: {task.aiVerifiedUnits}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => setEditingTask(index)}
                              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#161A3A]"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(index)}
                              className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-6 dark:border-white/10">
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-300 dark:hover:bg-[#0C0F2C]"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('input')}
                    className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-300 dark:hover:bg-[#0C0F2C]"
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-8 py-2.5 text-white transition-all hover:opacity-90 hover:shadow-lg"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve & Create Project
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

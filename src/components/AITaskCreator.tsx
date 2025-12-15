import { useState } from 'react';
import { Sparkles, X, Wand2, List, FileText, Zap, Brain, TrendingUp, CheckCircle2, Lightbulb, Calendar } from 'lucide-react';
import * as api from '../services/api';
import type { Task } from './TaskTable';

interface AITaskCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Omit<Task, 'id'>) => void;
  onCreateMultipleTasks?: (tasks: Omit<Task, 'id'>[]) => void;
}

export function AITaskCreator({ isOpen, onClose, onCreateTask, onCreateMultipleTasks }: AITaskCreatorProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [description, setDescription] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  
  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewTask, setPreviewTask] = useState<Omit<Task, 'id'> | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setIsGenerating(true);
    setError('');
    
    try {
      // Call backend AI analysis API
      const task = await api.analyzeTaskWithAI(description);
      
      // Add timeline dates if provided
      const taskWithDates = {
        ...task,
        ...(startDate && { startDate }),
        ...(completionDate && { completionDate }),
      };
      
      onCreateTask(taskWithDates);
      setDescription('');
      setStartDate('');
      setCompletionDate('');
      onClose();
    } catch (err: any) {
      console.error('AI analysis error:', err);
      setError(err.message || 'Failed to analyze task. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (!bulkInput.trim()) return;

    // Split by new lines and filter out empty lines
    const lines = bulkInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      setError('Please enter at least one task description.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setProgress({ current: 0, total: lines.length });

    const createdTasks: Omit<Task, 'id'>[] = [];
    const errors: string[] = [];

    try {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        setProgress({ current: i + 1, total: lines.length });

        try {
          const task = await api.analyzeTaskWithAI(line);
          createdTasks.push(task);
        } catch (err: any) {
          console.error(`Error analyzing task "${line}":`, err);
          errors.push(`Failed to analyze: "${line.substring(0, 50)}${line.length > 50 ? '...' : ''}"`);
        }
      }

      // Call the callback with all created tasks
      if (createdTasks.length > 0) {
        if (onCreateMultipleTasks) {
          onCreateMultipleTasks(createdTasks);
        } else {
          // Fallback: create tasks one by one
          createdTasks.forEach(task => onCreateTask(task));
        }
      }

      if (errors.length > 0) {
        setError(`Successfully created ${createdTasks.length} task(s). ${errors.length} failed:\n${errors.join('\n')}`);
      } else {
        setBulkInput('');
        onClose();
      }
    } catch (err: any) {
      console.error('Bulk generation error:', err);
      setError(err.message || 'Failed to generate tasks. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      if (mode === 'single') {
        handleGenerate();
      } else {
        handleBulkGenerate();
      }
    }
  };

  const examplePrompts = [
    {
      title: 'Authentication System',
      desc: 'Build a user authentication system with OAuth, 2FA, and role-based access control',
      icon: '🔐'
    },
    {
      title: 'Analytics Dashboard',
      desc: 'Create a responsive dashboard with real-time analytics, interactive charts, and data export',
      icon: '📊'
    },
    {
      title: 'Payment Integration',
      desc: 'Implement secure payment processing with Stripe, refunds, and subscription management',
      icon: '💳'
    },
    {
      title: 'AI Chatbot',
      desc: 'Build an AI-powered chatbot with natural language processing and context awareness',
      icon: '🤖'
    },
  ];

  const bulkExample = `User Authentication System
Payment Gateway Integration
Real-time Notifications System
Data Export Feature
Admin Dashboard`;

  if (!isOpen) return null;

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
          className="w-full max-w-5xl rounded-t-3xl border-t border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0C0F2C]"
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
                {/* Animated Icon */}
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-[#2BBBEF]/20 to-[#4AFFA8]/20 blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="mb-2 bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] bg-clip-text text-transparent" style={{ fontSize: '28px', fontWeight: 700 }}>
                    AI Task Creator
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '15px', maxWidth: '500px' }}>
                    Describe your task in natural language and let our AI calculate all PCI factors, estimate complexity, and generate accurate cost projections
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

            {/* Mode Toggle */}
            <div className="mb-6 inline-flex gap-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 p-1.5 dark:from-[#161A3A] dark:to-[#0C0F2C]">
              <button
                onClick={() => setMode('single')}
                className={`flex items-center gap-2 rounded-lg px-6 py-3 transition-all ${
                  mode === 'single'
                    ? 'bg-white text-[#2BBBEF] shadow-md dark:bg-[#0C0F2C] dark:shadow-[0_0_20px_rgba(43,187,239,0.15)]'
                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                <FileText className="h-4 w-4" />
                Single Task
              </button>
              <button
                onClick={() => setMode('bulk')}
                className={`flex items-center gap-2 rounded-lg px-6 py-3 transition-all ${
                  mode === 'bulk'
                    ? 'bg-white text-[#2BBBEF] shadow-md dark:bg-[#0C0F2C] dark:shadow-[0_0_20px_rgba(43,187,239,0.15)]'
                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                <List className="h-4 w-4" />
                Bulk Import
              </button>
            </div>

            {mode === 'single' ? (
              <div className="space-y-6">
                {/* Single Task Input */}
                <div>
                  <label className="mb-3 block text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 600 }}>
                    📝 Describe Your Task
                  </label>
                  <div className="relative">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Example: Build a real-time chat system with end-to-end encryption, file sharing, group messaging capabilities, and message search functionality..."
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 p-4 text-gray-800 transition-all focus:border-[#2BBBEF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2BBBEF]/10 dark:border-white/10 dark:bg-[#161A3A] dark:text-white dark:focus:bg-[#0C0F2C]"
                      rows={5}
                      disabled={isGenerating}
                      style={{ fontSize: '15px', lineHeight: '1.6' }}
                    />
                    {description && (
                      <div className="absolute bottom-4 right-4">
                        <div className="rounded-lg bg-white px-3 py-1.5 shadow-md dark:bg-[#0C0F2C]">
                          <span className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
                            {description.length} characters
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-gray-500 dark:text-gray-400" style={{ fontSize: '13px' }}>
                    <Zap className="h-3.5 w-3.5" />
                    <span>Press <kbd className="rounded bg-gray-200 px-1.5 py-0.5 dark:bg-[#161A3A]">⌘ + Enter</kbd> to generate instantly</span>
                  </div>
                </div>

                {/* Project Timeline Section */}
                <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 dark:border-white/10 dark:from-[#161A3A] dark:to-[#0C0F2C]">
                  <div className="mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#2BBBEF]" />
                    <h4 className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                      Project Timeline
                    </h4>
                    <span className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>(Optional)</span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                        style={{ fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Target Completion Date
                      </label>
                      <input
                        type="date"
                        value={completionDate}
                        onChange={(e) => setCompletionDate(e.target.value)}
                        min={startDate || undefined}
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                        style={{ fontSize: '14px' }}
                      />
                    </div>
                  </div>
                  {startDate && completionDate && new Date(completionDate) > new Date(startDate) && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
                      <Calendar className="h-4 w-4 text-[#2BBBEF]" />
                      <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '12px' }}>
                        Duration: {Math.ceil((new Date(completionDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  )}
                </div>

                {/* Example Prompts */}
                {!description && (
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 600 }}>
                      <Lightbulb className="h-4 w-4 text-[#4AFFA8]" />
                      Quick Start Examples
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {examplePrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => setDescription(prompt.desc)}
                          className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-4 text-left transition-all hover:border-[#2BBBEF] hover:shadow-lg dark:border-white/10 dark:from-[#161A3A] dark:to-[#0C0F2C] dark:hover:border-[#2BBBEF]"
                        >
                          <div className="absolute right-4 top-4 opacity-20 transition-opacity group-hover:opacity-100" style={{ fontSize: '28px' }}>
                            {prompt.icon}
                          </div>
                          <div className="relative">
                            <h4 className="mb-2 text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                              {prompt.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                              {prompt.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Features Banner */}
                <div className="rounded-xl border border-[#2BBBEF]/20 bg-gradient-to-br from-[#2BBBEF]/5 to-[#4AFFA8]/5 p-5 dark:border-[#2BBBEF]/30 dark:from-[#2BBBEF]/10 dark:to-[#4AFFA8]/10">
                  <div className="mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-[#2BBBEF]" />
                    <h4 className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                      What AI Analyzes
                    </h4>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#4AFFA8]" />
                      <div>
                        <div className="text-gray-800 dark:text-gray-200" style={{ fontSize: '13px', fontWeight: 500 }}>Complexity Factors</div>
                        <div className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }}>Technical depth & scope</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#4AFFA8]" />
                      <div>
                        <div className="text-gray-800 dark:text-gray-200" style={{ fontSize: '13px', fontWeight: 500 }}>Risk Assessment</div>
                        <div className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }}>Business & technical risks</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#4AFFA8]" />
                      <div>
                        <div className="text-gray-800 dark:text-gray-200" style={{ fontSize: '13px', fontWeight: 500 }}>Team Impact</div>
                        <div className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }}>Coordination needs</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={onClose}
                    disabled={isGenerating}
                    className="rounded-xl border-2 border-gray-200 px-6 py-3 text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-[#161A3A]"
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={!description.trim() || isGenerating}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-8 py-3 text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:shadow-none"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Analyzing with AI...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-5 w-5" />
                        <span>Generate Task</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Bulk Import Input */}
                <div>
                  <label className="mb-3 block text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 600 }}>
                    📋 Paste Multiple Tasks (One Per Line)
                  </label>
                  <div className="relative">
                    <textarea
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Paste your task list here, one task per line:\n\n${bulkExample}`}
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 p-4 font-mono text-gray-800 transition-all focus:border-[#2BBBEF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2BBBEF]/10 dark:border-white/10 dark:bg-[#161A3A] dark:text-white dark:focus:bg-[#0C0F2C]"
                      rows={10}
                      disabled={isGenerating}
                      style={{ fontSize: '13px', lineHeight: '1.8' }}
                    />
                    {bulkInput && (
                      <div className="absolute bottom-4 right-4">
                        <div className="rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-3 py-1.5 text-white shadow-lg">
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>
                            {bulkInput.split('\n').filter(l => l.trim()).length} tasks detected
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-gray-500 dark:text-gray-400" style={{ fontSize: '13px' }}>
                    <Zap className="h-3.5 w-3.5" />
                    <span>Press <kbd className="rounded bg-gray-200 px-1.5 py-0.5 dark:bg-[#161A3A]">⌘ + Enter</kbd> to generate all tasks</span>
                  </div>
                </div>

                {/* Progress Indicator */}
                {isGenerating && progress.total > 0 && (
                  <div className="overflow-hidden rounded-xl border border-[#2BBBEF]/20 bg-gradient-to-br from-[#2BBBEF]/5 to-[#4AFFA8]/5 p-5 dark:border-[#2BBBEF]/30">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-[#2BBBEF]" />
                        <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                          Generating tasks...
                        </span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 500 }}>
                        {progress.current} / {progress.total}
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-[#0C0F2C]">
                      <div 
                        className="h-full bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] transition-all duration-500"
                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                      />
                    </div>
                    <div className="mt-3 text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }}>
                      {Math.round((progress.current / progress.total) * 100)}% complete
                    </div>
                  </div>
                )}

                {/* Example */}
                {!bulkInput && !isGenerating && (
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 600 }}>
                      <Lightbulb className="h-4 w-4 text-[#4AFFA8]" />
                      Example Format
                    </div>
                    <button
                      onClick={() => setBulkInput(bulkExample)}
                      className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-4 text-left font-mono transition-all hover:border-[#2BBBEF] hover:bg-white dark:border-white/10 dark:bg-[#161A3A] dark:hover:border-[#2BBBEF] dark:hover:bg-[#0C0F2C]"
                      style={{ fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: '1.8' }}
                    >
                      {bulkExample}
                    </button>
                  </div>
                )}

                {/* Bulk Features */}
                <div className="rounded-xl border border-[#2BBBEF]/20 bg-gradient-to-br from-[#2BBBEF]/5 to-[#4AFFA8]/5 p-5 dark:border-[#2BBBEF]/30 dark:from-[#2BBBEF]/10 dark:to-[#4AFFA8]/10">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#2BBBEF]" />
                    <h4 className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                      Bulk Import Features
                    </h4>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#4AFFA8]" />
                      <div>
                        <div className="text-gray-800 dark:text-gray-200" style={{ fontSize: '13px', fontWeight: 500 }}>Import from Anywhere</div>
                        <div className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }}>Copy from Excel, Jira, or any tool</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#4AFFA8]" />
                      <div>
                        <div className="text-gray-800 dark:text-gray-200" style={{ fontSize: '13px', fontWeight: 500 }}>Auto-Analysis</div>
                        <div className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }}>AI processes each task individually</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={onClose}
                    disabled={isGenerating}
                    className="rounded-xl border-2 border-gray-200 px-6 py-3 text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-[#161A3A]"
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkGenerate}
                    disabled={!bulkInput.trim() || isGenerating}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-8 py-3 text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:shadow-none"
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    {isGenerating ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Generating {progress.current}/{progress.total}...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-5 w-5" />
                        <span>Generate {bulkInput.split('\n').filter(l => l.trim()).length} Tasks</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 overflow-hidden rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50/50 p-4 dark:border-red-900/30 dark:from-red-900/20 dark:to-orange-900/10">
                <div className="mb-2 flex items-center gap-2 text-red-800 dark:text-red-400">
                  <div className="rounded-lg bg-red-100 p-1 dark:bg-red-900/30">
                    <X className="h-4 w-4" />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Error</span>
                </div>
                <p className="text-red-700 dark:text-red-300" style={{ fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {error}
                </p>
              </div>
            )}
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
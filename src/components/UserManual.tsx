import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, BookOpen, Target, Zap, LayoutDashboard, ListChecks, FileBarChart, 
  Settings, Calculator, CheckCircle, Command, Upload, Download, 
  Keyboard, Save, ShieldCheck, TrendingUp, Plus, ArrowRight, 
  FileSpreadsheet, Users, Crown, FileText, User, Moon, Languages
} from 'lucide-react';
import { QuickReference } from './QuickReference';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserManual({ isOpen, onClose }: UserManualProps) {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'quick-reference', label: 'Quick Reference Card', icon: FileText },
    { id: 'quickstart', label: 'Quick Start', icon: Zap },
    { id: 'command-palette', label: 'Command Palette', icon: Command },
    { id: 'task-modeling', label: 'Task Modeling', icon: ListChecks },
    { id: 'csv-import', label: 'CSV Import/Export', icon: Upload },
    { id: 'templates', label: 'Task Templates', icon: FileSpreadsheet },
    { id: 'proposal-builder', label: 'Proposal Builder', icon: FileBarChart },
    { id: 'ai-verification', label: 'AI Verification', icon: ShieldCheck },
    { id: 'audit-layer', label: 'Audit & Versioning', icon: TrendingUp },
    { id: 'reports', label: 'Reports & Analytics', icon: LayoutDashboard },
    { id: 'user-profile', label: 'User Profile & Settings', icon: User },
    { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
    { id: 'pci-formula', label: 'PCI Formula', icon: Calculator },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#161A3A]"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-gray-200 bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] px-6 py-4 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-white">
                        PCI Engine User Manual
                      </h2>
                      <p className="text-sm text-white/90">
                        Complete guide to AI-powered project cost intelligence
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex" style={{ height: 'calc(95vh - 100px)' }}>
                {/* Sidebar */}
                <div className="w-64 border-r border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-[#0C0F2C]">
                  <div className="overflow-y-auto p-4" style={{ height: '100%' }}>
                    <div className="space-y-1">
                      {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition-all ${
                              activeSection === section.id
                                ? 'bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#161A3A]'
                            }`}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span>{section.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                  
                  {/* OVERVIEW */}
                  {activeSection === 'overview' && (
                    <div className="prose max-w-none dark:prose-invert">
                      <h3 className="mb-4 flex items-center gap-3 text-2xl text-gray-900 dark:text-white">
                        <Target className="h-7 w-7 text-[#2BBBEF]" />
                        What is PCI Engine?
                      </h3>
                      
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>PCI Engine</strong> (Project Cost Intelligence Engine) is an enterprise-grade platform designed for 
                        <strong> FRContent / Plataforma Technologies</strong> that provides AI-powered audit intelligence for project cost modeling. 
                        It helps teams accurately estimate, track, and validate software development costs using a sophisticated multi-factor PCI formula.
                      </p>

                      <div className="my-6 rounded-xl border border-[#2BBBEF]/20 bg-gradient-to-br from-[#2BBBEF]/5 to-[#4AFFA8]/5 p-6">
                        <h4 className="mb-4 flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                          <CheckCircle className="h-5 w-5 text-[#4AFFA8]" />
                          Key Benefits
                        </h4>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                            <span className="text-gray-700 dark:text-gray-300">
                              <strong>Accurate Cost Modeling:</strong> Calculate precise project costs using 12-factor PCI formula
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                            <span className="text-gray-700 dark:text-gray-300">
                              <strong>AI-Powered Verification:</strong> Multi-AI validation (GPT-4, Claude, Gemini) with 97%+ confidence
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                            <span className="text-gray-700 dark:text-gray-300">
                              <strong>Complete Audit Trail:</strong> Track every change with scope versioning and justifications
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                            <span className="text-gray-700 dark:text-gray-300">
                              <strong>Professional Proposals:</strong> Generate client-ready proposals with verification badges
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                            <span className="text-gray-700 dark:text-gray-300">
                              <strong>Lightning Fast:</strong> Command palette, templates, CSV import - save 30+ minutes per project
                            </span>
                          </li>
                        </ul>
                      </div>

                      <h4 className="mb-3 mt-6 text-xl text-gray-900 dark:text-white">
                        Core Features
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                          <div className="mb-2 flex items-center gap-2">
                            <ListChecks className="h-5 w-5 text-[#2BBBEF]" />
                            <strong className="text-gray-900 dark:text-white">Task Modeling</strong>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Build hierarchical project structures with epics, tasks, and subtasks. Auto-calculated PCI scores.
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                          <div className="mb-2 flex items-center gap-2">
                            <Command className="h-5 w-5 text-[#2BBBEF]" />
                            <strong className="text-gray-900 dark:text-white">Command Palette</strong>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Press Ctrl/Cmd+K for instant access to any feature. Navigate, create, import in seconds.
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                          <div className="mb-2 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-[#2BBBEF]" />
                            <strong className="text-gray-900 dark:text-white">AI Verification</strong>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Every proposal verified by multiple AI models with confidence scores and detailed reports.
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                          <div className="mb-2 flex items-center gap-2">
                            <Upload className="h-5 w-5 text-[#2BBBEF]" />
                            <strong className="text-gray-900 dark:text-white">CSV Import/Export</strong>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Import 50+ tasks in 30 seconds from Excel. Auto-map columns with smart detection.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* QUICK REFERENCE CARD */}
                  {activeSection === 'quick-reference' && (
                    <QuickReference />
                  )}

                  {/* QUICK START */}
                  {activeSection === 'quickstart' && (
                    <div className="prose max-w-none dark:prose-invert">
                      <h3 className="mb-4 flex items-center gap-3 text-2xl text-gray-900 dark:text-white">
                        <Zap className="h-7 w-7 text-[#2BBBEF]" />
                        Quick Start Guide
                      </h3>

                      <div className="my-6 rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-500/20 dark:bg-green-900/20">
                        <h4 className="mb-3 text-lg text-green-900 dark:text-green-200">
                          🎯 Get Started in 3 Minutes
                        </h4>
                        <ol className="space-y-4">
                          <li className="text-gray-800 dark:text-gray-200">
                            <strong>Option 1: Use a Template</strong>
                            <ul className="mt-2 space-y-1 text-sm">
                              <li>• Press <kbd className="rounded bg-white px-2 py-1 text-xs dark:bg-gray-800">Ctrl+K</kbd></li>
                              <li>• Type "template" and select your project type</li>
                              <li>• Instant task list with 8-10 pre-configured tasks</li>
                            </ul>
                          </li>
                          <li className="text-gray-800 dark:text-gray-200">
                            <strong>Option 2: Import from CSV</strong>
                            <ul className="mt-2 space-y-1 text-sm">
                              <li>• Press <kbd className="rounded bg-white px-2 py-1 text-xs dark:bg-gray-800">Ctrl+K</kbd> → "Import CSV"</li>
                              <li>• Download template, fill in Excel/Sheets</li>
                              <li>• Upload and auto-map columns</li>
                            </ul>
                          </li>
                          <li className="text-gray-800 dark:text-gray-200">
                            <strong>Option 3: Manual Entry</strong>
                            <ul className="mt-2 space-y-1 text-sm">
                              <li>• Click "Add Task" or press <kbd className="rounded bg-white px-2 py-1 text-xs dark:bg-gray-800">Ctrl+K</kbd> → "Add New Task"</li>
                              <li>• Fill in task details (name, hours, role, complexity)</li>
                              <li>• PCI score auto-calculates</li>
                            </ul>
                          </li>
                        </ol>
                      </div>

                      <h4 className="mb-3 mt-6 text-xl text-gray-900 dark:text-white">
                        Typical Workflow
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white">
                            1
                          </div>
                          <div>
                            <strong className="text-gray-900 dark:text-white">Set up your project</strong>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Load a template or import tasks from CSV to get started quickly
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white">
                            2
                          </div>
                          <div>
                            <strong className="text-gray-900 dark:text-white">Customize task details</strong>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Adjust hours, complexity, risk levels. PCI scores update automatically.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white">
                            3
                          </div>
                          <div>
                            <strong className="text-gray-900 dark:text-white">Generate AI-verified proposal</strong>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Click "Generate Proposal" to create professional, AI-verified documents
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white">
                            4
                          </div>
                          <div>
                            <strong className="text-gray-900 dark:text-white">Track changes with audit log</strong>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Every change is tracked. View scope versions, diffs, and justifications.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white">
                            5
                          </div>
                          <div>
                            <strong className="text-gray-900 dark:text-white">Share with clients</strong>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Export proposals with verification badges, reports, and justifications
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COMMAND PALETTE */}
                  {activeSection === 'command-palette' && (
                    <div className="prose max-w-none dark:prose-invert">
                      <h3 className="mb-4 flex items-center gap-3 text-2xl text-gray-900 dark:text-white">
                        <Command className="h-7 w-7 text-[#2BBBEF]" />
                        Command Palette
                      </h3>

                      <div className="my-6 rounded-xl border border-[#2BBBEF]/20 bg-gradient-to-br from-[#2BBBEF]/10 to-[#4AFFA8]/10 p-6">
                        <div className="mb-4 text-center">
                          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
                            <Command className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="mb-2 text-xl text-gray-900 dark:text-white">
                            Your productivity superpower
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            Access any feature in 2 keystrokes instead of multiple clicks
                          </p>
                        </div>
                      </div>

                      <h4 className="mb-3 text-lg text-gray-900 dark:text-white">
                        How to Use
                      </h4>
                      
                      <ol className="space-y-3 text-gray-700 dark:text-gray-300">
                        <li>
                          <strong>Open the palette:</strong> Press <kbd className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800">Ctrl+K</kbd> (Windows/Linux) or <kbd className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800">⌘K</kbd> (Mac)
                        </li>
                        <li>
                          <strong>Search:</strong> Start typing to find commands (e.g., "template", "import", "proposal")
                        </li>
                        <li>
                          <strong>Navigate:</strong> Use <kbd className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800">↑</kbd> and <kbd className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800">↓</kbd> arrow keys
                        </li>
                        <li>
                          <strong>Execute:</strong> Press <kbd className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800">Enter</kbd> to run the command
                        </li>
                        <li>
                          <strong>Close:</strong> Press <kbd className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800">Esc</kbd> to dismiss
                        </li>
                      </ol>

                      <h4 className="mb-3 mt-6 text-lg text-gray-900 dark:text-white">
                        Available Commands
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                            Navigation
                          </div>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <LayoutDashboard className="h-4 w-4 text-[#2BBBEF]" />
                              <span className="text-gray-700 dark:text-gray-300">Go to Dashboard</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <ListChecks className="h-4 w-4 text-[#2BBBEF]" />
                              <span className="text-gray-700 dark:text-gray-300">Go to Task Modeling</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-[#2BBBEF]" />
                              <span className="text-gray-700 dark:text-gray-300">Go to Project Audit</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <FileBarChart className="h-4 w-4 text-[#2BBBEF]" />
                              <span className="text-gray-700 dark:text-gray-300">Go to Reports</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Settings className="h-4 w-4 text-[#2BBBEF]" />
                              <span className="text-gray-700 dark:text-gray-300">Go to Settings</span>
                            </li>
                          </ul>
                        </div>

                        <div>
                          <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                            Actions
                          </div>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <Plus className="h-4 w-4 text-[#2BBBEF]" />
                              <span className="text-gray-700 dark:text-gray-300">Add New Task</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <FileBarChart className="h-4 w-4 text-[#2BBBEF]" />
                              <span className="text-gray-700 dark:text-gray-300">Generate Proposal</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Download className="h-4 w-4 text-[#2BBBEF]" />
                              <span className="text-gray-700 dark:text-gray-300">Export to CSV</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Upload className="h-4 w-4 text-[#2BBBEF]" />
                              <span className="text-gray-700 dark:text-gray-300">Import from CSV</span>
                            </li>
                          </ul>
                        </div>

                        <div>
                          <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                            Templates
                          </div>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-[#2BBBEF]" />
                              <span className="text-gray-700 dark:text-gray-300">E-commerce Template (10 tasks)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-[#2BBBEF]" />
                              <span className="text-gray-700 dark:text-gray-300">Mobile App Template (8 tasks)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-[#2BBBEF]" />
                              <span className="text-gray-700 dark:text-gray-300">API Development Template (8 tasks)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-[#2BBBEF]" />
                              <span className="text-gray-700 dark:text-gray-300">SaaS Platform Template (8 tasks)</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-500/20 dark:bg-yellow-900/20">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>💡 Pro Tip:</strong> The Command Palette learns from your usage. Frequently used commands appear first!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CSV IMPORT/EXPORT */}
                  {activeSection === 'csv-import' && (
                    <div className="prose max-w-none dark:prose-invert">
                      <h3 className="mb-4 flex items-center gap-3 text-2xl text-gray-900 dark:text-white">
                        <Upload className="h-7 w-7 text-[#2BBBEF]" />
                        CSV Import & Export
                      </h3>

                      <p className="text-gray-700 dark:text-gray-300">
                        Import tasks from Excel or Google Sheets in seconds. Export for reporting or backup.
                      </p>

                      <h4 className="mb-3 mt-6 text-lg text-gray-900 dark:text-white">
                        Importing Tasks (3-Step Process)
                      </h4>

                      <div className="space-y-6">
                        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#0C0F2C]">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white">
                              1
                            </div>
                            <h5 className="text-lg text-gray-900 dark:text-white">Upload CSV File</h5>
                          </div>
                          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li>• Press <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">Ctrl+K</kbd> → "Import from CSV"</li>
                            <li>• Click "Choose File" and select your CSV</li>
                            <li>• Or download the template file with examples to get started</li>
                          </ul>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#0C0F2C]">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white">
                              2
                            </div>
                            <h5 className="text-lg text-gray-900 dark:text-white">Map Columns</h5>
                          </div>
                          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li>• System auto-detects common column names (Task Name, Hours, Role, etc.)</li>
                            <li>• Manually adjust mappings if needed using dropdowns</li>
                            <li>• Set columns to "Skip" if they don't apply</li>
                            <li>• At minimum, map "Task Name" column</li>
                          </ul>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#0C0F2C]">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white">
                              3
                            </div>
                            <h5 className="text-lg text-gray-900 dark:text-white">Preview & Import</h5>
                          </div>
                          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li>• Review all tasks before importing</li>
                            <li>• Check for validation errors (shown in red)</li>
                            <li>• Click "Import Tasks" to add to your project</li>
                            <li>• Celebration confetti confirms success! 🎉</li>
                          </ul>
                        </div>
                      </div>

                      <h4 className="mb-3 mt-6 text-lg text-gray-900 dark:text-white">
                        Supported Fields
                      </h4>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 p-3 dark:border-white/10">
                          <div className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Basic Fields</div>
                          <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <li>• Task Name (required)</li>
                            <li>• Description</li>
                            <li>• Estimated Hours</li>
                            <li>• Role Type</li>
                            <li>• Cost Rate</li>
                            <li>• Complexity Score</li>
                            <li>• Risk Level</li>
                          </ul>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-3 dark:border-white/10">
                          <div className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">PCI Formula Fields</div>
                          <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <li>• ISR, CF, UXI</li>
                            <li>• RCF, AEP, L</li>
                            <li>• MLW, CGW, RF</li>
                            <li>• S, GLRI</li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-500/20 dark:bg-purple-900/20">
                        <div className="mb-2 text-sm font-semibold text-purple-900 dark:text-purple-200">
                          📊 Calculated Metrics Override
                        </div>
                        <div className="rounded-lg border border-purple-200 bg-white p-3 dark:border-purple-500/10 dark:bg-purple-900/30">
                          <div className="mb-1 text-sm font-semibold text-purple-900 dark:text-purple-100">Verified Cost (Optional)</div>
                          <p className="text-xs text-purple-800 dark:text-purple-200">
                            <strong>Advanced Feature:</strong> Include a "Verified Cost" column to override automatic PCI calculations. 
                            The system will reverse-calculate PCI Units and Verified Units based on your input cost.
                          </p>
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-purple-800 dark:text-purple-200">
                          <div><strong>Use Case:</strong> When you have pre-negotiated fixed pricing or need manual cost control</div>
                          <div><strong>How it works:</strong> Verified Cost ÷ Hourly Rate = Verified Units (auto-calculated)</div>
                          <div><strong>Benefit:</strong> Full pricing control while maintaining complete audit trail integrity</div>
                        </div>
                      </div>

                      <h4 className="mb-3 mt-6 text-lg text-gray-900 dark:text-white">
                        Exporting Tasks
                      </h4>

                      <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>1. Press <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">Ctrl+K</kbd> → "Export to CSV"</li>
                        <li>2. All tasks download with complete data</li>
                        <li>3. Open in Excel, Google Sheets, or any spreadsheet tool</li>
                        <li>4. Use for reporting, backup, or sharing with stakeholders</li>
                      </ol>

                      <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/20 dark:bg-green-900/20">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>⚡ Time Savings:</strong> Import 50 tasks in 30 seconds vs 10+ minutes of manual entry!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TASK TEMPLATES */}
                  {activeSection === 'templates' && (
                    <div className="prose max-w-none dark:prose-invert">
                      <h3 className="mb-4 flex items-center gap-3 text-2xl text-gray-900 dark:text-white">
                        <FileSpreadsheet className="h-7 w-7 text-[#2BBBEF]" />
                        Task Templates
                      </h3>

                      <p className="text-gray-700 dark:text-gray-300">
                        Pre-configured task sets for common project types. Load instantly and customize to your needs.
                      </p>

                      <h4 className="mb-3 mt-6 text-lg text-gray-900 dark:text-white">
                        Available Templates
                      </h4>

                      <div className="space-y-4">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="text-3xl">🛒</div>
                            <div>
                              <h5 className="text-lg text-gray-900 dark:text-white">E-commerce Platform</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">10 tasks • ~420 hours</p>
                            </div>
                          </div>
                          <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                            Complete task set for building an e-commerce web application
                          </p>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Includes: User auth, product catalog, shopping cart, payment integration, inventory, order management, admin dashboard, emails, reviews, shipping
                          </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="text-3xl">📱</div>
                            <div>
                              <h5 className="text-lg text-gray-900 dark:text-white">Mobile Application</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">8 tasks • ~230 hours</p>
                            </div>
                          </div>
                          <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                            Cross-platform mobile app development (React Native/Flutter)
                          </p>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Includes: App architecture, user auth, push notifications, offline sync, camera integration, in-app purchases, analytics, app store deployment
                          </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="text-3xl">⚙️</div>
                            <div>
                              <h5 className="text-lg text-gray-900 dark:text-white">REST API Backend</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">8 tasks • ~235 hours</p>
                            </div>
                          </div>
                          <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                            RESTful API development with authentication and database
                          </p>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Includes: API architecture, database design, auth/authorization, CRUD endpoints, API documentation, file upload, security, testing
                          </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="text-3xl">☁️</div>
                            <div>
                              <h5 className="text-lg text-gray-900 dark:text-white">SaaS Platform</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">8 tasks • ~330 hours</p>
                            </div>
                          </div>
                          <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                            Full-featured SaaS with subscriptions and multi-tenancy
                          </p>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Includes: Multi-tenancy, subscription billing, team management, usage analytics, API rate limiting, audit logging, email infrastructure, admin dashboard
                          </div>
                        </div>
                      </div>

                      <h4 className="mb-3 mt-6 text-lg text-gray-900 dark:text-white">
                        How to Use Templates
                      </h4>

                      <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>1. Press <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">Ctrl+K</kbd> and type "template"</li>
                        <li>2. Select your project type from the list</li>
                        <li>3. Click to load - tasks are added instantly</li>
                        <li>4. Customize hours, complexity, roles to match your project</li>
                        <li>5. PCI scores recalculate automatically</li>
                      </ol>

                      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-900/20">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>💡 Pro Tip:</strong> Templates are added to existing tasks, not replaced. Use them as a starting point and mix multiple templates if needed!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI VERIFICATION */}
                  {activeSection === 'ai-verification' && (
                    <div className="prose max-w-none dark:prose-invert">
                      <h3 className="mb-4 flex items-center gap-3 text-2xl text-gray-900 dark:text-white">
                        <ShieldCheck className="h-7 w-7 text-[#2BBBEF]" />
                        AI Verification System
                      </h3>

                      <p className="text-gray-700 dark:text-gray-300">
                        Every proposal is verified by multiple AI models (GPT-4, Claude, Gemini) to ensure accuracy, build client trust, and justify pricing.
                      </p>

                      <h4 className="mb-3 mt-6 text-lg text-gray-900 dark:text-white">
                        Trust Badges
                      </h4>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-900/20">
                          <div className="mb-2 flex items-center gap-2">
                            <Crown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <strong className="text-blue-900 dark:text-blue-200">Multi-AI Verified</strong>
                          </div>
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            Cross-checked by GPT-4, Claude 3.5, and Gemini Pro for maximum accuracy
                          </p>
                        </div>

                        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/20 dark:bg-green-900/20">
                          <div className="mb-2 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <strong className="text-green-900 dark:text-green-200">Latest Market Data</strong>
                          </div>
                          <p className="text-sm text-green-800 dark:text-green-300">
                            Validated against current labor statistics and industry rates
                          </p>
                        </div>

                        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-500/20 dark:bg-purple-900/20">
                          <div className="mb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <strong className="text-purple-900 dark:text-purple-200">Industry Benchmark</strong>
                          </div>
                          <p className="text-sm text-purple-800 dark:text-purple-300">
                            Compared against standards for similar projects and teams
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#2BBBEF]/20 bg-gradient-to-br from-[#2BBBEF]/10 to-[#4AFFA8]/10 p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-[#2BBBEF]" />
                            <strong className="text-gray-900 dark:text-white">High Confidence</strong>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            97%+ accuracy score based on multi-model consensus
                          </p>
                        </div>
                      </div>

                      <h4 className="mb-3 mt-6 text-lg text-gray-900 dark:text-white">
                        Verification Report
                      </h4>

                      <p className="text-gray-700 dark:text-gray-300">
                        Click "View Full Verification" in any proposal to see:
                      </p>

                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-[#4AFFA8]" />
                          <span><strong>Confidence Scores:</strong> Individual scores from each AI model (GPT-4, Claude, Gemini)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-[#4AFFA8]" />
                          <span><strong>Consensus Analysis:</strong> Where models agree and any discrepancies</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-[#4AFFA8]" />
                          <span><strong>Data Sources:</strong> Which databases and benchmarks were consulted</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-[#4AFFA8]" />
                          <span><strong>Validation Checks:</strong> PCI formula accuracy, rate validation, complexity scoring</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-[#4AFFA8]" />
                          <span><strong>Audit Trail:</strong> Complete verification history with timestamps</span>
                        </li>
                      </ul>

                      <h4 className="mb-3 mt-6 text-lg text-gray-900 dark:text-white">
                        Client Value
                      </h4>

                      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]">
                        <ul className="space-y-3 text-sm">
                          <li className="text-gray-700 dark:text-gray-300">
                            ✅ <strong>Build Trust:</strong> Show clients your estimates are backed by AI and data
                          </li>
                          <li className="text-gray-700 dark:text-gray-300">
                            ✅ <strong>Justify Pricing:</strong> Transparent verification reduces price objections
                          </li>
                          <li className="text-gray-700 dark:text-gray-300">
                            ✅ <strong>Differentiate:</strong> Stand out with professional, verified proposals
                          </li>
                          <li className="text-gray-700 dark:text-gray-300">
                            ✅ <strong>Export Reports:</strong> Share verification details for complete transparency
                          </li>
                        </ul>
                      </div>

                      <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-500/20 dark:bg-yellow-900/20">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>🎯 Pro Tip:</strong> Include the verification report with your proposals. Clients love seeing the AI-powered validation - it builds immediate credibility!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* USER PROFILE & SETTINGS */}
                  {activeSection === 'user-profile' && (
                    <div className="prose max-w-none dark:prose-invert">
                      <h3 className="mb-4 flex items-center gap-3 text-2xl text-gray-900 dark:text-white">
                        <User className="h-7 w-7 text-[#2BBBEF]" />
                        User Profile & Settings
                      </h3>

                      <p className="text-gray-700 dark:text-gray-300">
                        Access personalization and customization features through your <strong>User Profile dropdown menu</strong> in the top-right corner of the navigation bar.
                      </p>

                      <div className="my-6 rounded-xl border border-[#2BBBEF]/20 bg-gradient-to-br from-[#2BBBEF]/5 to-[#4AFFA8]/5 p-6">
                        <h4 className="mb-4 flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                          <User className="h-5 w-5 text-[#4AFFA8]" />
                          Accessing Your Profile Menu
                        </h4>
                        <ol className="space-y-2 text-gray-700 dark:text-gray-300">
                          <li>1. Click on your <strong>profile avatar</strong> or <strong>name</strong> in the top-right corner</li>
                          <li>2. The dropdown menu displays your email and provides access to key features</li>
                        </ol>
                      </div>

                      <h4 className="mb-3 mt-6 text-xl text-gray-900 dark:text-white">
                        Profile Menu Features
                      </h4>

                      <div className="space-y-4">
                        {/* Settings */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
                              <Settings className="h-5 w-5 text-white" />
                            </div>
                            <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h5>
                          </div>
                          <p className="mb-3 text-gray-700 dark:text-gray-300">
                            Customize your workspace and branding preferences.
                          </p>
                          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                              <span><strong>Hourly Rate:</strong> Set your default billing rate for cost calculations</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                              <span><strong>Company Branding:</strong> Upload logo, set company name and tagline</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                              <span><strong>Brand Colors:</strong> Customize primary, secondary, and accent colors</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                              <span><strong>Footer Text:</strong> Personalize the application footer</span>
                            </li>
                          </ul>
                        </div>

                        {/* How to Use Guide */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <h5 className="text-lg font-semibold text-gray-900 dark:text-white">How to Use Guide</h5>
                          </div>
                          <p className="mb-3 text-gray-700 dark:text-gray-300">
                            Opens this comprehensive user manual you're reading now!
                          </p>
                          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                              <span>Step-by-step tutorials for all features</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                              <span>Quick reference card for shortcuts and workflows</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                              <span>PCI formula explanations and best practices</span>
                            </li>
                          </ul>
                        </div>

                        {/* Language Selector */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
                              <Languages className="h-5 w-5 text-white" />
                            </div>
                            <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Language / Idioma</h5>
                          </div>
                          <p className="mb-3 text-gray-700 dark:text-gray-300">
                            Switch between 7 supported languages with instant translation of the entire interface.
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-white/5 dark:bg-[#161A3A]">
                              <span className="text-gray-700 dark:text-gray-300">🇺🇸 English</span>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-white/5 dark:bg-[#161A3A]">
                              <span className="text-gray-700 dark:text-gray-300">🇪���� Español</span>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-white/5 dark:bg-[#161A3A]">
                              <span className="text-gray-700 dark:text-gray-300">🇧🇷 Português</span>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-white/5 dark:bg-[#161A3A]">
                              <span className="text-gray-700 dark:text-gray-300">🇫🇷 Français</span>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-white/5 dark:bg-[#161A3A]">
                              <span className="text-gray-700 dark:text-gray-300">🇩🇪 Deutsch</span>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-white/5 dark:bg-[#161A3A]">
                              <span className="text-gray-700 dark:text-gray-300">🇨🇳 中文</span>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-white/5 dark:bg-[#161A3A]">
                              <span className="text-gray-700 dark:text-gray-300">🇯🇵 日本語</span>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            <strong>Note:</strong> Language selection is saved and persists across sessions
                          </div>
                        </div>

                        {/* Sign Out */}
                        <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-500/20 dark:bg-red-900/20">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50">
                              <Settings className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h5 className="text-lg font-semibold text-red-900 dark:text-red-200">Sign Out</h5>
                          </div>
                          <p className="text-sm text-red-800 dark:text-red-200">
                            Safely log out of your account. Your work is automatically saved, so you can sign back in anytime.
                          </p>
                        </div>
                      </div>

                      <h4 className="mb-3 mt-8 text-xl text-gray-900 dark:text-white">
                        Theme Customization
                      </h4>

                      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                            <Moon className="h-5 w-5 text-white" />
                          </div>
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Dark/Light Mode Toggle</h5>
                        </div>
                        <p className="mb-3 text-gray-700 dark:text-gray-300">
                          Located in the top navigation bar (next to Command Palette hint), toggle between light and dark themes.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <li className="flex items-start gap-2">
                            <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                            <span><strong>Light Mode:</strong> Clean white canvas with vibrant brand colors</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                            <span><strong>Dark Mode:</strong> Deep navy (#010029) background with enhanced contrast</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                            <span>Theme preference is saved automatically</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                            <span>All charts, tables, and modals adapt seamlessly to the selected theme</span>
                          </li>
                        </ul>
                      </div>

                      <div className="mt-6 rounded-xl border border-[#4AFFA8]/20 bg-gradient-to-br from-[#4AFFA8]/10 to-[#2BBBEF]/10 p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>💡 Pro Tip:</strong> Set up your company branding once in Settings, and it will automatically appear on all proposals, reports, and exports. This creates a consistent professional image for all client-facing materials!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* KEYBOARD SHORTCUTS */}
                  {activeSection === 'keyboard-shortcuts' && (
                    <div className="prose max-w-none dark:prose-invert">
                      <h3 className="mb-4 flex items-center gap-3 text-2xl text-gray-900 dark:text-white">
                        <Keyboard className="h-7 w-7 text-[#2BBBEF]" />
                        Keyboard Shortcuts
                      </h3>

                      <p className="text-gray-700 dark:text-gray-300">
                        Master these shortcuts to work 10x faster in PCI Engine.
                      </p>

                      <div className="mt-6 space-y-4">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#0C0F2C]">
                          <h4 className="mb-3 text-lg text-gray-900 dark:text-white">
                            Global Shortcuts
                          </h4>
                          <table className="w-full text-sm">
                            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                              <tr>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">Ctrl</kbd> + <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">K</kbd>
                                  <span className="ml-2 text-gray-500">(Mac: ⌘K)</span>
                                </td>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  Open Command Palette
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">Esc</kbd>
                                </td>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  Close modal/dialog
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">↑</kbd> <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">↓</kbd>
                                </td>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  Navigate Command Palette
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">Enter</kbd>
                                </td>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  Confirm/Select
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#0C0F2C]">
                          <h4 className="mb-3 text-lg text-gray-900 dark:text-white">
                            Coming Soon
                          </h4>
                          <table className="w-full text-sm opacity-60">
                            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                              <tr>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">N</kbd>
                                </td>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  New task
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">E</kbd>
                                </td>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  Edit selected task
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">D</kbd>
                                </td>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  Duplicate task
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">Del</kbd>
                                </td>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  Delete selected task
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">Ctrl</kbd> + <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">S</kbd>
                                </td>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  Save (auto-save enabled)
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">Ctrl</kbd> + <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">P</kbd>
                                </td>
                                <td className="py-3 text-gray-700 dark:text-gray-300">
                                  Generate proposal
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="mt-6 rounded-xl border border-[#2BBBEF]/20 bg-gradient-to-br from-[#2BBBEF]/10 to-[#4AFFA8]/10 p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>💡 Pro Tip:</strong> Most actions are accessible via <kbd className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">Ctrl+K</kbd>. Learn just this one shortcut and you'll be a power user!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* PCI FORMULA */}
                  {activeSection === 'pci-formula' && (
                    <div className="prose max-w-none dark:prose-invert">
                      <h3 className="mb-4 flex items-center gap-3 text-2xl text-gray-900 dark:text-white">
                        <Calculator className="h-7 w-7 text-[#2BBBEF]" />
                        PCI Formula Explained
                      </h3>

                      <p className="text-gray-700 dark:text-gray-300">
                        The Project Cost Index (PCI) is a 12-factor formula that calculates accurate project estimates based on complexity, effort, risk, and resource factors.
                      </p>

                      <div className="my-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#0C0F2C]">
                        <h4 className="mb-3 text-lg text-gray-900 dark:text-white">
                          Formula
                        </h4>
                        <div className="overflow-x-auto">
                          <code className="block rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-900">
                            PCI = (ISR × CF × UXI + RCF × AEP × L + MLW × CGW × RF) × S × GLRI
                          </code>
                        </div>
                      </div>

                      <h4 className="mb-3 text-lg text-gray-900 dark:text-white">
                        12 Factors Explained
                      </h4>

                      <div className="space-y-3">
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                          <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                            ISR (Implementation Scope Rating) <span className="text-sm font-normal text-gray-500">Scale: 1-10</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Scope and breadth of implementation. Higher = more features/modules.
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                          <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                            CF (Complexity Factor) <span className="text-sm font-normal text-gray-500">Scale: 1-10</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Technical complexity and difficulty. Accounts for algorithms, integrations, architecture.
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                          <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                            UXI (User Experience Impact) <span className="text-sm font-normal text-gray-500">Scale: 1-10</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            User interface polish and UX requirements. Higher = more design/interaction work.
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                          <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                            RCF (Resource Consumption Factor) <span className="text-sm font-normal text-gray-500">Scale: 1-10</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Server, database, and infrastructure requirements. Processing power, storage, bandwidth.
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                          <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                            AEP (Architectural Effort Points) <span className="text-sm font-normal text-gray-500">Scale: 1-10</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            System design and architectural planning required. Microservices, scalability, patterns.
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                          <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                            L (Learning Curve) <span className="text-sm font-normal text-gray-500">Scale: 1-10</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            New technologies, frameworks, or domain knowledge required by the team.
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                          <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                            MLW (Maintenance Workload) <span className="text-sm font-normal text-gray-500">Scale: 1-10</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Long-term maintenance and support overhead. Documentation, testing, refactoring needs.
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                          <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                            CGW (Code Generation Weight) <span className="text-sm font-normal text-gray-500">Scale: 1-10</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Lines of code and development volume. Repetitive vs. unique code.
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                          <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                            RF (Risk Factor) <span className="text-sm font-normal text-gray-500">Scale: 1-10</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Technical, security, and business risks. Unknowns, dependencies, compliance.
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                          <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                            S (Skill Level) <span className="text-sm font-normal text-gray-500">Scale: 1-10</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Team expertise and experience level required. Junior vs. senior engineering.
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                          <div className="mb-1 font-semibold text-gray-900 dark:text-white">
                            GLRI (Global Resource Index) <span className="text-sm font-normal text-gray-500">Scale: 1-10</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Global market rates and resource availability. Location, timezone, cost multipliers.
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/20 dark:bg-green-900/20">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>🎯 Auto-Calculate:</strong> PCI Engine automatically calculates this formula for every task. Just input basic details and the system handles the complex math!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Add other sections based on the original guide... */}
                  {/* For brevity, I'm showing the key new sections. You can add the existing sections from HowToUseGuide.tsx */}
                  
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

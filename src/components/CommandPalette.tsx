import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  FileText, 
  BarChart3, 
  Settings, 
  Plus, 
  Download, 
  Upload,
  Zap,
  CheckSquare,
  ShieldCheck,
  FileSpreadsheet,
  Command,
  Keyboard
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  onAction: (action: string) => void;
}

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
  category: 'navigation' | 'actions' | 'templates';
  keywords: string[];
}

export function CommandPalette({ isOpen, onClose, onNavigate, onAction }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      subtitle: 'View KPIs and metrics',
      icon: BarChart3,
      action: () => { onNavigate('dashboard'); onClose(); },
      category: 'navigation',
      keywords: ['dashboard', 'home', 'kpi', 'metrics', 'overview']
    },
    {
      id: 'nav-tasks',
      title: 'Go to Task Modeling',
      subtitle: 'Manage project tasks',
      icon: CheckSquare,
      action: () => { onNavigate('tasks'); onClose(); },
      category: 'navigation',
      keywords: ['tasks', 'modeling', 'pci', 'table']
    },
    {
      id: 'nav-audit',
      title: 'Go to Project Audit',
      subtitle: 'Review audit logs',
      icon: ShieldCheck,
      action: () => { onNavigate('audit'); onClose(); },
      category: 'navigation',
      keywords: ['audit', 'review', 'logs', 'history']
    },
    {
      id: 'nav-reports',
      title: 'Go to Reports',
      subtitle: 'View analytics and reports',
      icon: FileSpreadsheet,
      action: () => { onNavigate('reports'); onClose(); },
      category: 'navigation',
      keywords: ['reports', 'analytics', 'charts', 'export']
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings',
      subtitle: 'Configure application',
      icon: Settings,
      action: () => { onNavigate('settings'); onClose(); },
      category: 'navigation',
      keywords: ['settings', 'config', 'preferences', 'options']
    },

    // Actions
    {
      id: 'action-new-task',
      title: 'Add New Task',
      subtitle: 'Create a new project task',
      icon: Plus,
      action: () => { onAction('new-task'); onClose(); },
      category: 'actions',
      keywords: ['new', 'add', 'create', 'task']
    },
    {
      id: 'action-generate-proposal',
      title: 'Generate Proposal',
      subtitle: 'AI-powered proposal builder',
      icon: FileText,
      action: () => { onAction('generate-proposal'); onClose(); },
      category: 'actions',
      keywords: ['proposal', 'generate', 'ai', 'builder']
    },
    {
      id: 'action-export-csv',
      title: 'Export to CSV',
      subtitle: 'Download tasks as CSV',
      icon: Download,
      action: () => { onAction('export-csv'); onClose(); },
      category: 'actions',
      keywords: ['export', 'csv', 'download', 'save']
    },
    {
      id: 'action-import-csv',
      title: 'Import from CSV',
      subtitle: 'Upload tasks from spreadsheet',
      icon: Upload,
      action: () => { onAction('import-csv'); onClose(); },
      category: 'actions',
      keywords: ['import', 'csv', 'upload', 'spreadsheet', 'excel']
    },

    // Templates
    {
      id: 'template-ecommerce',
      title: 'E-commerce Template',
      subtitle: 'Load pre-configured e-commerce tasks',
      icon: Zap,
      action: () => { onAction('template-ecommerce'); onClose(); },
      category: 'templates',
      keywords: ['template', 'ecommerce', 'shopping', 'cart']
    },
    {
      id: 'template-mobile',
      title: 'Mobile App Template',
      subtitle: 'Load mobile app development tasks',
      icon: Zap,
      action: () => { onAction('template-mobile'); onClose(); },
      category: 'templates',
      keywords: ['template', 'mobile', 'app', 'ios', 'android']
    },
    {
      id: 'template-api',
      title: 'API Development Template',
      subtitle: 'Load API project tasks',
      icon: Zap,
      action: () => { onAction('template-api'); onClose(); },
      category: 'templates',
      keywords: ['template', 'api', 'backend', 'rest', 'graphql']
    },
    {
      id: 'template-saas',
      title: 'SaaS Platform Template',
      subtitle: 'Load SaaS application tasks',
      icon: Zap,
      action: () => { onAction('template-saas'); onClose(); },
      category: 'templates',
      keywords: ['template', 'saas', 'platform', 'subscription']
    },
  ], [onNavigate, onAction, onClose]);

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;
    
    const searchLower = search.toLowerCase();
    return commands.filter(cmd => 
      cmd.title.toLowerCase().includes(searchLower) ||
      cmd.subtitle?.toLowerCase().includes(searchLower) ||
      cmd.keywords.some(k => k.includes(searchLower))
    );
  }, [search, commands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedIndex(0);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'navigation': return 'Navigation';
      case 'actions': return 'Actions';
      case 'templates': return 'Templates';
      default: return category;
    }
  };

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Command Palette */}
          <div className="fixed inset-0 z-[201] flex items-start justify-center pt-[15vh]">
            <motion.div
              className="w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#161A3A]"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-white/10">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="flex-1 bg-transparent text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                />
                <div className="flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </div>
              </div>

              {/* Commands List */}
              <div className="max-h-96 overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No commands found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedCommands).map(([category, cmds]) => (
                      <div key={category}>
                        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          {getCategoryLabel(category)}
                        </div>
                        <div className="space-y-1">
                          {cmds.map((cmd, idx) => {
                            const globalIndex = filteredCommands.indexOf(cmd);
                            const Icon = cmd.icon;
                            
                            return (
                              <button
                                key={cmd.id}
                                onClick={() => cmd.action()}
                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                                  selectedIndex === globalIndex
                                    ? 'bg-gradient-to-r from-[#2BBBEF]/10 to-[#4AFFA8]/10 dark:from-[#2BBBEF]/20 dark:to-[#4AFFA8]/20'
                                    : 'hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                              >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                  selectedIndex === globalIndex
                                    ? 'bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white'
                                    : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400'
                                }`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {cmd.title}
                                  </div>
                                  {cmd.subtitle && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {cmd.subtitle}
                                    </div>
                                  )}
                                </div>
                                {selectedIndex === globalIndex && (
                                  <div className="text-xs text-gray-400">
                                    Enter ↵
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="rounded border border-gray-300 px-1.5 py-0.5 dark:border-white/10">↑</kbd>
                    <kbd className="rounded border border-gray-300 px-1.5 py-0.5 dark:border-white/10">↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="rounded border border-gray-300 px-1.5 py-0.5 dark:border-white/10">↵</kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="rounded border border-gray-300 px-1.5 py-0.5 dark:border-white/10">Esc</kbd>
                    <span>Close</span>
                  </div>
                </div>
                <div>
                  {filteredCommands.length} {filteredCommands.length === 1 ? 'command' : 'commands'}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
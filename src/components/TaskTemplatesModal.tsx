import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, CheckCircle2, Plus } from 'lucide-react';
import { TASK_TEMPLATES, type TaskTemplate } from '../data/taskTemplates';

interface TaskTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TaskTemplate) => void;
}

export function TaskTemplatesModal({ isOpen, onClose, onSelectTemplate }: TaskTemplatesModalProps) {
  const handleSelectTemplate = (template: TaskTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

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
              className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#161A3A]"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-gray-200 bg-gradient-to-r from-[#2BBBEF]/10 to-[#4AFFA8]/10 px-6 py-4 dark:border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Task Templates
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Load pre-configured task sets to get started quickly
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#0C0F2C] dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[70vh] overflow-y-auto p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {TASK_TEMPLATES.map((template) => (
                    <motion.div
                      key={template.id}
                      className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-[#2BBBEF] hover:shadow-lg dark:border-white/10 dark:bg-[#161A3A] dark:hover:border-[#2BBBEF]"
                      whileHover={{ y: -4 }}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      {/* Icon & Title */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{template.icon}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {template.category}
                            </p>
                          </div>
                        </div>
                        <motion.div
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-all group-hover:bg-gradient-to-br group-hover:from-[#2BBBEF] group-hover:to-[#4AFFA8] group-hover:text-white dark:bg-white/5"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Plus className="h-5 w-5" />
                        </motion.div>
                      </div>

                      {/* Description */}
                      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        {template.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 border-t border-gray-200 pt-4 dark:border-white/10">
                        <div className="flex items-center gap-1 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-[#4AFFA8]" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {template.tasks.length}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">tasks</span>
                        </div>
                        <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {Math.round(
                            template.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
                          )}{' '}
                          hours
                        </div>
                      </div>

                      {/* Task Preview */}
                      <div className="mt-4 space-y-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Sample Tasks:
                        </div>
                        {template.tasks.slice(0, 3).map((task, idx) => (
                          <div
                            key={idx}
                            className="truncate text-sm text-gray-600 dark:text-gray-400"
                          >
                            • {task.taskName}
                          </div>
                        ))}
                        {template.tasks.length > 3 && (
                          <div className="text-sm text-gray-500 dark:text-gray-500">
                            + {template.tasks.length - 3} more...
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-white/10 dark:bg-[#0C0F2C]">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Templates will be added to your existing tasks
                  </p>
                  <button
                    onClick={onClose}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-[#161A3A]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

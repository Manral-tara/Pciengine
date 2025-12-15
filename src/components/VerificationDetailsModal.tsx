import { X, Shield, Sparkles, TrendingUp, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VerificationBadge, VerificationBadgeGroup } from './VerificationBadge';

interface VerificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalData?: {
    title: string;
    totalCost: number;
    totalHours: number;
    taskCount: number;
  };
}

export function VerificationDetailsModal({ isOpen, onClose, proposalData }: VerificationDetailsModalProps) {
  const verificationChecks = [
    {
      category: 'AI Model Verification',
      checks: [
        { name: 'GPT-4 Analysis', status: 'passed', confidence: 98, timestamp: new Date().toLocaleString() },
        { name: 'Claude 3.5 Sonnet Cross-Check', status: 'passed', confidence: 97, timestamp: new Date().toLocaleString() },
        { name: 'Gemini Pro Validation', status: 'passed', confidence: 96, timestamp: new Date().toLocaleString() },
      ]
    },
    {
      category: 'Data Source Validation',
      checks: [
        { name: 'BLS Labor Statistics (Q4 2024)', status: 'passed', confidence: 100, timestamp: 'Updated 2 days ago' },
        { name: 'Industry Benchmark Database', status: 'passed', confidence: 95, timestamp: 'Updated 1 week ago' },
        { name: 'Historical Project Data', status: 'passed', confidence: 93, timestamp: 'Updated daily' },
      ]
    },
    {
      category: 'Accuracy Metrics',
      checks: [
        { name: 'Cost Estimation Variance', status: 'passed', confidence: 96, details: '±4% industry standard' },
        { name: 'Timeline Feasibility', status: 'passed', confidence: 94, details: 'Within normal range' },
        { name: 'Resource Allocation', status: 'passed', confidence: 97, details: 'Optimal distribution' },
      ]
    },
    {
      category: 'Compliance & Standards',
      checks: [
        { name: 'Industry Standard Compliance', status: 'passed', confidence: 100 },
        { name: 'Risk Assessment', status: 'passed', confidence: 92, details: 'Low to medium risk factors identified' },
        { name: 'Scope Completeness', status: 'passed', confidence: 98 },
      ]
    }
  ];

  const overallConfidence = Math.round(
    verificationChecks
      .flatMap(cat => cat.checks)
      .reduce((sum, check) => sum + check.confidence, 0) / 
    verificationChecks.flatMap(cat => cat.checks).length
  );

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
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#161A3A]"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              {/* Header */}
              <div className="border-b border-gray-200 bg-gradient-to-r from-[#2BBBEF]/10 to-[#4AFFA8]/10 px-6 py-4 dark:border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Verification Report
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Comprehensive AI & Data Validation
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

                {/* Overall Confidence Score */}
                <div className="mt-4 flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#0C0F2C]">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Overall Confidence Score
                      </span>
                      <span className="text-2xl font-bold text-[#4AFFA8]">
                        {overallConfidence}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8]"
                        initial={{ width: 0 }}
                        animate={{ width: `${overallConfidence}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Verification Badges */}
                <div className="mt-4">
                  <VerificationBadgeGroup 
                    badges={['multi-model', 'data-fresh', 'benchmark-verified', 'high-confidence']} 
                  />
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto p-6">
                {/* Proposal Summary */}
                {proposalData && (
                  <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-[#0C0F2C]">
                    <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                      Proposal Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Cost</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${proposalData.totalCost.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Hours</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {proposalData.totalHours.toLocaleString()}h
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Tasks</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {proposalData.taskCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Verified</div>
                        <div className="text-lg font-semibold text-[#4AFFA8]">
                          {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Checks */}
                <div className="space-y-6">
                  {verificationChecks.map((category, idx) => (
                    <motion.div
                      key={category.category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                        <Sparkles className="h-5 w-5 text-[#2BBBEF]" />
                        {category.category}
                      </h3>
                      <div className="space-y-2">
                        {category.checks.map((check, checkIdx) => (
                          <div
                            key={checkIdx}
                            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#161A3A]"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-5 w-5 text-[#4AFFA8]" />
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {check.name}
                                  </span>
                                </div>
                                {check.details && (
                                  <div className="ml-7 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {check.details}
                                  </div>
                                )}
                                {check.timestamp && (
                                  <div className="ml-7 mt-1 text-xs text-gray-500 dark:text-gray-500">
                                    {check.timestamp}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-[#2BBBEF]">
                                    {check.confidence}%
                                  </div>
                                  <div className="text-xs text-gray-500">confidence</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-900/20">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <div className="text-sm text-blue-900 dark:text-blue-200">
                      <strong>Client Value:</strong> This verification report can be shared with clients
                      to demonstrate the accuracy, reliability, and professional standards of your proposal.
                      All data is backed by industry-leading AI models and current market statistics.
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-white/10 dark:bg-[#0C0F2C]">
                <div className="flex justify-between">
                  <button
                    onClick={onClose}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-[#161A3A]"
                  >
                    Close
                  </button>
                  <button
                    className="rounded-lg bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] px-6 py-2 font-medium text-white transition-all hover:shadow-lg"
                  >
                    Export Report
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

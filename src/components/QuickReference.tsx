import { motion } from 'motion/react';
import { 
  Command, Upload, FileSpreadsheet, Zap, ShieldCheck, Save, 
  Clock, TrendingUp, Keyboard, CheckCircle, ArrowRight, Download 
} from 'lucide-react';

export function QuickReference() {
  return (
    <div className="prose max-w-none dark:prose-invert">
      {/* Header */}
      <div className="mb-6 rounded-xl border border-[#2BBBEF]/20 bg-gradient-to-br from-[#2BBBEF]/10 to-[#4AFFA8]/10 p-6">
        <h3 className="mb-2 flex items-center gap-3 text-2xl text-gray-900 dark:text-white">
          <Keyboard className="h-7 w-7 text-[#2BBBEF]" />
          Quick Reference Card
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Version 2.0 | FRContent / Plataforma Technologies
        </p>
      </div>

      {/* Quick Start Options */}
      <div className="mb-8">
        <h4 className="mb-4 text-xl text-gray-900 dark:text-white">⚡ Quick Start (3 Options)</h4>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white">
                1
              </div>
              <strong className="text-gray-900 dark:text-white">Load Template</strong>
            </div>
            <code className="mb-2 block rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
              Ctrl+K → "template" → Select type
            </code>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Result:</strong> 8-10 pre-configured tasks in seconds
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white">
                2
              </div>
              <strong className="text-gray-900 dark:text-white">Import CSV</strong>
            </div>
            <code className="mb-2 block rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
              Ctrl+K → "Import CSV" → Upload
            </code>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Result:</strong> 50+ tasks imported in 30 seconds
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white">
                3
              </div>
              <strong className="text-gray-900 dark:text-white">Manual Entry</strong>
            </div>
            <code className="mb-2 block rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
              Dashboard → Add Task → Fill
            </code>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Result:</strong> Auto-saves as you type
            </p>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mb-8">
        <h4 className="mb-4 text-xl text-gray-900 dark:text-white">🎹 Essential Keyboard Shortcuts</h4>
        
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#0C0F2C]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Shortcut</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              <tr className="bg-white dark:bg-[#161A3A]">
                <td className="px-4 py-3">
                  <kbd className="rounded bg-gray-100 px-2 py-1 text-sm font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
                    Ctrl/⌘ + K
                  </kbd>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  <strong>Open Command Palette (LEARN THIS ONE!)</strong>
                </td>
              </tr>
              <tr className="bg-white dark:bg-[#161A3A]">
                <td className="px-4 py-3">
                  <kbd className="rounded bg-gray-100 px-2 py-1 text-sm font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
                    Esc
                  </kbd>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Close modal/dialog</td>
              </tr>
              <tr className="bg-white dark:bg-[#161A3A]">
                <td className="px-4 py-3">
                  <kbd className="rounded bg-gray-100 px-2 py-1 text-sm font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
                    ↑ ↓
                  </kbd>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Navigate lists</td>
              </tr>
              <tr className="bg-white dark:bg-[#161A3A]">
                <td className="px-4 py-3">
                  <kbd className="rounded bg-gray-100 px-2 py-1 text-sm font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
                    Enter
                  </kbd>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Confirm/Select</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 5 Features */}
      <div className="mb-8">
        <h4 className="mb-4 text-xl text-gray-900 dark:text-white">🚀 Top 5 Productivity Features</h4>
        
        <div className="space-y-4">
          <motion.div 
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <Command className="h-6 w-6 text-[#2BBBEF]" />
              <h5 className="text-lg text-gray-900 dark:text-white">1. Command Palette (Ctrl+K)</h5>
            </div>
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Your all-in-one command center</strong> - Access any feature in 2 keystrokes with smart search and keyboard navigation.
            </p>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Try it:</strong> Press Ctrl+K and type "proposal" or "import"
            </div>
          </motion.div>

          <motion.div 
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <Upload className="h-6 w-6 text-[#2BBBEF]" />
              <h5 className="text-lg text-gray-900 dark:text-white">2. CSV Import (3-Step Wizard)</h5>
            </div>
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Import 50 tasks in 30 seconds</strong> - Upload → Map Columns → Preview & Import
            </p>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Auto-detects columns • Download template • Validation with errors • Celebration confetti! 🎉
            </div>
          </motion.div>

          <motion.div 
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <FileSpreadsheet className="h-6 w-6 text-[#2BBBEF]" />
              <h5 className="text-lg text-gray-900 dark:text-white">3. Task Templates</h5>
            </div>
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Pre-built task sets</strong> - E-commerce (10 tasks), Mobile App (8 tasks), REST API (8 tasks), SaaS (8 tasks)
            </p>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Usage:</strong> Ctrl+K → "template" → Select → Customize
            </div>
          </motion.div>

          <motion.div 
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-[#2BBBEF]" />
              <h5 className="text-lg text-gray-900 dark:text-white">4. AI Verification Badges</h5>
            </div>
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Build client trust</strong> - Multi-AI Verified (GPT-4, Claude, Gemini), Latest Market Data, Industry Benchmark, High Confidence (97%+)
            </p>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Client benefit:</strong> Click "View Full Verification" for detailed report
            </div>
          </motion.div>

          <motion.div 
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#0C0F2C]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <Save className="h-6 w-6 text-[#2BBBEF]" />
              <h5 className="text-lg text-gray-900 dark:text-white">5. Auto-Save</h5>
            </div>
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Never click "Save" again</strong> - Saves 2 seconds after you stop typing with subtle indicators
            </p>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Works across all forms • Zero friction • Modern UX
            </div>
          </motion.div>
        </div>
      </div>

      {/* Time Savings */}
      <div className="mb-8">
        <h4 className="mb-4 text-xl text-gray-900 dark:text-white">📈 Time Savings</h4>
        
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#0C0F2C]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Task</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Manual Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">With PCI Engine</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              <tr className="bg-white dark:bg-[#161A3A]">
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Set up new project</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">25 min</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">2 min (template)</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#4AFFA8]">23 min</td>
              </tr>
              <tr className="bg-white dark:bg-[#161A3A]">
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Import 50 tasks</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">15 min</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">30 sec (CSV)</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#4AFFA8]">14.5 min</td>
              </tr>
              <tr className="bg-white dark:bg-[#161A3A]">
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Navigate to feature</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">10 sec</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">2 sec (Ctrl+K)</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#4AFFA8]">8 sec each</td>
              </tr>
              <tr className="bg-white dark:bg-[#161A3A]">
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Generate proposal</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">30 min</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">3 min (AI-powered)</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#4AFFA8]">27 min</td>
              </tr>
              <tr className="bg-gradient-to-r from-[#2BBBEF]/10 to-[#4AFFA8]/10">
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Total per project</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">70+ min</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">~6 min</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#4AFFA8]">~64 min 🚀</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="mb-8">
        <h4 className="mb-4 text-xl text-gray-900 dark:text-white">💡 Pro Tips</h4>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/20 dark:bg-green-900/20">
            <h5 className="mb-2 font-semibold text-green-900 dark:text-green-200">Get Started Fast</h5>
            <ul className="space-y-1 text-sm text-green-800 dark:text-green-300">
              <li>• New to PCI? Press Ctrl+K → "template" → Pick e-commerce</li>
              <li>• Have existing data? Ctrl+K → "Import CSV"</li>
            </ul>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-900/20">
            <h5 className="mb-2 font-semibold text-blue-900 dark:text-blue-200">Impress Clients</h5>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <li>• Include AI Verification Report in proposals</li>
              <li>• Show Audit Trail for transparency</li>
              <li>• Use Justification Builder for scope changes</li>
            </ul>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-500/20 dark:bg-purple-900/20">
            <h5 className="mb-2 font-semibold text-purple-900 dark:text-purple-200">Save Time</h5>
            <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-300">
              <li>• Command Palette is your best friend</li>
              <li>• Templates save 20+ minutes per project</li>
              <li>• CSV import is 20x faster than manual entry</li>
            </ul>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/20 dark:bg-orange-900/20">
            <h5 className="mb-2 font-semibold text-orange-900 dark:text-orange-200">Build Trust</h5>
            <ul className="space-y-1 text-sm text-orange-800 dark:text-orange-300">
              <li>• Multi-AI verification builds credibility</li>
              <li>• Detailed audit logs show professionalism</li>
              <li>• Scope versioning tracks changes transparently</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Master Tip */}
      <div className="rounded-xl border-2 border-[#2BBBEF] bg-gradient-to-br from-[#2BBBEF]/10 to-[#4AFFA8]/10 p-6 text-center">
        <h4 className="mb-2 text-xl text-gray-900 dark:text-white">
          🏆 Master just one shortcut:
        </h4>
        <div className="mb-2">
          <kbd className="rounded-lg bg-white px-6 py-3 text-2xl font-bold text-gray-900 shadow-md dark:bg-gray-800 dark:text-white">
            Ctrl + K
          </kbd>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Everything else is discoverable from there!
        </p>
      </div>
    </div>
  );
}

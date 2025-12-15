import { useState } from 'react';
import { X, BookOpen, Target, Zap, LayoutDashboard, ListChecks, FileBarChart, Settings, Calculator, TrendingUp, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface HowToUseGuideProps {
  onClose: () => void;
}

export function HowToUseGuide({ onClose }: HowToUseGuideProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'dashboard' | 'audit' | 'reports' | 'settings' | 'formula'>('overview');

  const sections = [
    { id: 'overview' as const, label: 'Overview', icon: BookOpen },
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'audit' as const, label: 'Audit Layer', icon: ListChecks },
    { id: 'reports' as const, label: 'Reports', icon: FileBarChart },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
    { id: 'formula' as const, label: 'PCI Formula', icon: Calculator },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/20 p-2">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-white">How to Use PCI Engine</h2>
                <p className="text-white/90" style={{ fontSize: '13px' }}>
                  AI-Powered Project Cost Intelligence & Audit Platform
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

        <div className="flex" style={{ height: 'calc(90vh - 80px)' }}>
          {/* Sidebar Navigation */}
          <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-[#010029]">What is PCI Engine?</h3>
                  <p className="mb-4 text-gray-700">
                    <strong>PCI Engine</strong> (Project Cost Intelligence Engine) is an enterprise-grade platform designed for 
                    <strong> FRContent / Plataforma Technologies</strong> to provide AI-powered audit intelligence for project cost modeling. 
                    It helps teams accurately estimate, track, and validate software development costs using a sophisticated multi-factor PCI formula.
                  </p>
                </div>

                <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Target className="h-6 w-6 text-[#2BBBEF]" />
                    <h3 className="text-[#010029]">Core Purpose & Goals</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                      <div>
                        <strong className="text-[#010029]">Accurate Cost Modeling:</strong>
                        <p className="text-gray-700" style={{ fontSize: '14px' }}>
                          Calculate precise project costs using 12-factor PCI formula that accounts for complexity, risk, UX, engineering effort, and more.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                      <div>
                        <strong className="text-[#010029]">AI Verification:</strong>
                        <p className="text-gray-700" style={{ fontSize: '14px' }}>
                          Get AI-powered verification of your estimates with Accuracy Assurance Score (AAS) that validates your calculations.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                      <div>
                        <strong className="text-[#010029]">Enterprise Audit Trail:</strong>
                        <p className="text-gray-700" style={{ fontSize: '14px' }}>
                          Maintain complete audit trails, review workflows, flagging system, and approval processes for compliance and transparency.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                      <div>
                        <strong className="text-[#010029]">Comprehensive Reporting:</strong>
                        <p className="text-gray-700" style={{ fontSize: '14px' }}>
                          Generate detailed reports with KPI tracking, trend analysis, and data export capabilities for stakeholder communication.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 text-[#010029]">Key Features</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-[#2BBBEF]" />
                        <strong className="text-[#010029]">AI-Powered Analysis</strong>
                      </div>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        Natural language task creation, intelligent factor suggestions, anomaly detection, and cost optimization recommendations.
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-[#2BBBEF]" />
                        <strong className="text-[#010029]">Real-Time Calculations</strong>
                      </div>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        Auto-calculated PCI units, cost estimates, and AAS scores that update instantly as you modify task factors.
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-[#2BBBEF]" />
                        <strong className="text-[#010029]">Multi-Level Review</strong>
                      </div>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        Flag tasks, add comments, approve/reject estimates, and maintain complete audit logs for compliance.
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <FileBarChart className="h-5 w-5 text-[#2BBBEF]" />
                        <strong className="text-[#010029]">Advanced Analytics</strong>
                      </div>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        Interactive charts, trend analysis, KPI dashboards, and CSV export for comprehensive project insights.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border-l-4 border-[#2BBBEF] bg-blue-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-[#2BBBEF]" />
                    <strong className="text-[#010029]">Quick Start Guide</strong>
                  </div>
                  <ol className="ml-6 list-decimal space-y-2 text-gray-700" style={{ fontSize: '14px' }}>
                    <li>Create tasks on the Dashboard by entering task names or using AI natural language input</li>
                    <li>Adjust PCI factors (ISR, CF, UXI, etc.) or let AI suggest optimal values</li>
                    <li>Review auto-calculated PCI Units and AAS scores</li>
                    <li>Use the Audit Layer to review, flag, comment, and approve/reject tasks</li>
                    <li>Generate comprehensive reports with filters and export data as needed</li>
                    <li>Configure global settings including hourly rates and unit-to-hour conversion ratios</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <LayoutDashboard className="h-6 w-6 text-[#2BBBEF]" />
                    <h3 className="text-[#010029]">Dashboard - Main Workspace</h3>
                  </div>
                  <p className="text-gray-700">
                    The Dashboard is your primary workspace for creating, editing, and managing project tasks with real-time cost calculations.
                  </p>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">KPI Metrics Overview</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-gray-200 p-3">
                      <div className="text-gray-600" style={{ fontSize: '13px' }}>Total Tasks</div>
                      <p className="mt-1 text-gray-700" style={{ fontSize: '12px' }}>Number of tasks in your project</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <div className="text-gray-600" style={{ fontSize: '13px' }}>Total PCI Units</div>
                      <p className="mt-1 text-gray-700" style={{ fontSize: '12px' }}>Sum of all calculated PCI units</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <div className="text-gray-600" style={{ fontSize: '13px' }}>Total Cost</div>
                      <p className="mt-1 text-gray-700" style={{ fontSize: '12px' }}>PCI units × unit-to-hour ratio × hourly rate</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <div className="text-gray-600" style={{ fontSize: '13px' }}>Avg AAS</div>
                      <p className="mt-1 text-gray-700" style={{ fontSize: '12px' }}>Average Accuracy Assurance Score (&gt;85% is good)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">Adding Tasks</h4>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <strong className="text-[#010029]">Method 1: Quick Add</strong>
                      <p className="mt-2 text-gray-700" style={{ fontSize: '14px' }}>
                        Click "Add Task" and enter a task name. Default PCI factors are automatically assigned (ISR: 3, CF: 1.2, etc.). 
                        You can manually adjust each factor in the task table.
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <strong className="text-[#010029]">Method 2: AI Natural Language</strong>
                      <p className="mt-2 text-gray-700" style={{ fontSize: '14px' }}>
                        Use the AI chat interface to describe your task in plain English. For example: 
                        "User authentication system with OAuth2, JWT, and 2FA". AI will analyze the description and suggest optimal factor values.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">Task Table Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                      <div>
                        <strong>Inline Editing:</strong> Click any factor cell to edit. Press Enter or Tab to save, Escape to cancel.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                      <div>
                        <strong>Formula Inspector:</strong> Click the eye icon to see detailed PCI calculation breakdown for any task.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                      <div>
                        <strong>AI Suggestions:</strong> Click the sparkle icon to get AI recommendations for factor optimization.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                      <div>
                        <strong>AAS Indicators:</strong> Green (&gt;85%) means high confidence, Red (&lt;85%) suggests review needed.
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                  <strong className="text-green-800">Pro Tip:</strong>
                  <p className="mt-1 text-green-700" style={{ fontSize: '14px' }}>
                    All changes auto-save to the backend. Use the AI chat for quick analysis like "analyze my tasks" or "find anomalies" 
                    to get instant insights about your cost estimates.
                  </p>
                </div>
              </div>
            )}

            {/* Audit Section */}
            {activeSection === 'audit' && (
              <div className="space-y-6">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <ListChecks className="h-6 w-6 text-[#2BBBEF]" />
                    <h3 className="text-[#010029]">Audit Layer - Review & Compliance</h3>
                  </div>
                  <p className="text-gray-700">
                    The Audit Layer provides enterprise-grade review workflows, flagging system, commenting, and approval processes 
                    with complete audit trail maintenance for compliance and transparency.
                  </p>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">Three Main Tabs</h4>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <strong className="text-[#010029]">1. Review Tasks</strong>
                      <p className="mt-2 text-gray-700" style={{ fontSize: '14px' }}>
                        View all tasks with their current status (Pending, Approved, Rejected). Each task shows PCI units, AAS score, 
                        and estimated cost. You can approve or reject tasks directly from this view.
                      </p>
                      <div className="mt-2 rounded bg-gray-50 p-2" style={{ fontSize: '13px' }}>
                        <strong>Actions:</strong> Approve (green checkmark), Reject (red X), or view details for deeper analysis.
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <strong className="text-[#010029]">2. Flags</strong>
                      <p className="mt-2 text-gray-700" style={{ fontSize: '14px' }}>
                        Create flags to mark tasks for review. Flags can be categorized (Low AAS, High Cost, Unclear Scope, Review Needed) 
                        and have severity levels (Low, Medium, High, Critical). Add notes to provide context.
                      </p>
                      <div className="mt-2 rounded bg-gray-50 p-2" style={{ fontSize: '13px' }}>
                        <strong>Workflow:</strong> Create flag → Add notes → Resolve when addressed → View flag history.
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <strong className="text-[#010029]">3. Audit Logs</strong>
                      <p className="mt-2 text-gray-700" style={{ fontSize: '14px' }}>
                        Comprehensive log of all actions: task updates, approvals, rejections, flags created/resolved, and comments. 
                        Each entry includes timestamp, user, action type, and details for complete traceability.
                      </p>
                      <div className="mt-2 rounded bg-gray-50 p-2" style={{ fontSize: '13px' }}>
                        <strong>Use Cases:</strong> Compliance audits, change tracking, accountability, dispute resolution.
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">Approval Workflow</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">1</div>
                      <div>Task created with <strong>Pending</strong> status</div>
                    </div>
                    <div className="ml-4 border-l-2 border-gray-200 pl-4 py-1"></div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">2</div>
                      <div>Reviewer analyzes factors, AAS score, and cost estimate</div>
                    </div>
                    <div className="ml-4 border-l-2 border-gray-200 pl-4 py-1"></div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">3</div>
                      <div>Add comments or flags if clarification needed</div>
                    </div>
                    <div className="ml-4 border-l-2 border-gray-200 pl-4 py-1"></div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">✓</div>
                      <div><strong>Approve</strong> or <strong className="text-red-600">Reject</strong> with reason</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4">
                  <strong className="text-orange-800">Best Practice:</strong>
                  <p className="mt-1 text-orange-700" style={{ fontSize: '14px' }}>
                    Always add comments when rejecting tasks to explain why. This creates accountability and helps team members 
                    understand what needs to be adjusted for approval.
                  </p>
                </div>
              </div>
            )}

            {/* Reports Section */}
            {activeSection === 'reports' && (
              <div className="space-y-6">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <FileBarChart className="h-6 w-6 text-[#2BBBEF]" />
                    <h3 className="text-[#010029]">Reports - Analytics & Insights</h3>
                  </div>
                  <p className="text-gray-700">
                    Generate comprehensive reports with advanced filtering, KPI tracking, trend analysis, and data export capabilities.
                  </p>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">Available Filters</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">Date Range</strong>
                      <p className="mt-1 text-gray-600" style={{ fontSize: '13px' }}>Filter by start/end dates to analyze specific time periods</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">Status</strong>
                      <p className="mt-1 text-gray-600" style={{ fontSize: '13px' }}>Filter by approval status: All, Approved, Rejected, Pending</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">Trend Period</strong>
                      <p className="mt-1 text-gray-600" style={{ fontSize: '13px' }}>View trends over 7, 30, or 90 days</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">Include Audit</strong>
                      <p className="mt-1 text-gray-600" style={{ fontSize: '13px' }}>Toggle audit metrics in report data</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">Key Performance Indicators (KPIs)</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                      <div><strong>Total Tasks:</strong> Count of all tasks in filtered range</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                      <div><strong>Total PCI Units:</strong> Sum of all calculated units</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                      <div><strong>Average AAS:</strong> Overall accuracy score across all tasks</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                      <div><strong>Approval Rate:</strong> Percentage of approved vs total tasks</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                      <div><strong>Low AAS Count:</strong> Tasks with AAS below 85% threshold</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-[#2BBBEF]" />
                      <div><strong>Open Flags:</strong> Unresolved flags requiring attention</div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">Interactive Visualizations</h4>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">AAS Trend Analysis (Area Chart)</strong>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>Shows accuracy score trends over time to identify improvement or degradation patterns</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">Task Volume & Audit Activity (Line Chart)</strong>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>Tracks task creation and audit events to correlate activity levels</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">PCI Distribution (Pie Chart)</strong>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>Breaks down work by category: Scope, Risk, Multi-Layer, Specialty</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">Approval Status (Bar Chart)</strong>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>Visual comparison of approved, rejected, and pending tasks</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">Data Export</h4>
                  <p className="text-gray-700" style={{ fontSize: '14px' }}>
                    Export your data in <strong>CSV format</strong> for use in Excel, Google Sheets, or other tools. 
                    The export includes all task details, PCI factors, calculated units, AAS scores, and audit status.
                  </p>
                </div>

                <div className="rounded-lg border-l-4 border-purple-500 bg-purple-50 p-4">
                  <strong className="text-purple-800">Insight:</strong>
                  <p className="mt-1 text-purple-700" style={{ fontSize: '14px' }}>
                    Use trend analysis to identify patterns in your estimation accuracy. If AAS scores are declining over time, 
                    it may indicate scope creep or need for factor recalibration.
                  </p>
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div className="space-y-6">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Settings className="h-6 w-6 text-[#2BBBEF]" />
                    <h3 className="text-[#010029]">Settings - Configuration</h3>
                  </div>
                  <p className="text-gray-700">
                    Configure global settings including hourly rates, unit-to-hour conversion ratios, currency, and industry presets.
                  </p>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">General Settings Tab</h4>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <strong className="text-[#010029]">Static Hourly Rate</strong>
                      <p className="mt-2 text-gray-700" style={{ fontSize: '14px' }}>
                        Set your base hourly rate for development work. This is multiplied by hours (derived from PCI units) to calculate total cost.
                      </p>
                      <div className="mt-2 rounded bg-blue-50 p-2 text-blue-700" style={{ fontSize: '13px' }}>
                        Industry average: $50-150/hour depending on expertise and location
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <strong className="text-[#010029]">Unit-to-Hour Ratio</strong>
                      <p className="mt-2 text-gray-700" style={{ fontSize: '14px' }}>
                        Conversion factor that translates PCI units into actual hours. Higher values (1.8-2.5) are for complex projects 
                        requiring more time per unit of work. Lower values (1.2-1.5) are for standard, well-defined projects.
                      </p>
                      <div className="mt-2 rounded bg-blue-50 p-2 text-blue-700" style={{ fontSize: '13px' }}>
                        Recommended: 1.5 for standard projects, 1.8-2.0 for complex projects
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">Industry Presets</h4>
                  <p className="mb-3 text-gray-700" style={{ fontSize: '14px' }}>
                    One-click configuration based on industry standards. Each preset automatically adjusts both hourly rate and unit-to-hour ratio:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded border border-gray-200 p-2">
                      <span className="text-[#010029]">General Software</span>
                      <span className="text-gray-600" style={{ fontSize: '13px' }}>1.5x ratio, $66/hr</span>
                    </div>
                    <div className="flex items-center justify-between rounded border border-gray-200 p-2">
                      <span className="text-[#010029]">FinTech</span>
                      <span className="text-gray-600" style={{ fontSize: '13px' }}>1.8x ratio, $95/hr</span>
                    </div>
                    <div className="flex items-center justify-between rounded border border-gray-200 p-2">
                      <span className="text-[#010029]">Healthcare</span>
                      <span className="text-gray-600" style={{ fontSize: '13px' }}>1.7x ratio, $88/hr</span>
                    </div>
                    <div className="flex items-center justify-between rounded border border-gray-200 p-2">
                      <span className="text-[#010029]">AI/ML</span>
                      <span className="text-gray-600" style={{ fontSize: '13px' }}>2.0x ratio, $110/hr</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">Unit-to-Hour Converter Tab</h4>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-gray-200 p-4">
                      <strong className="text-[#010029]">Interactive Calculator</strong>
                      <p className="mt-2 text-gray-700" style={{ fontSize: '14px' }}>
                        Bidirectional converter lets you enter either Units or Hours and see instant conversion. 
                        Live cost calculation shows estimated project cost based on current settings.
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <strong className="text-[#010029]">Real-World Examples</strong>
                      <p className="mt-2 text-gray-700" style={{ fontSize: '14px' }}>
                        See how different project types (Simple CRUD, Auth System, Payment Integration, AI Model) 
                        translate to hours and costs with your current ratio.
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                      <strong className="text-[#010029]">Comparison Table</strong>
                      <p className="mt-2 text-gray-700" style={{ fontSize: '14px' }}>
                        Side-by-side comparison of how different ratios (1.2x, 1.5x, 1.8x, 2.0x) affect the same unit values. 
                        Helps you understand the impact of ratio selection.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
                  <strong className="text-yellow-800">Important:</strong>
                  <p className="mt-1 text-yellow-700" style={{ fontSize: '14px' }}>
                    Settings are saved per user and applied globally to all your tasks. Changes affect cost calculations immediately, 
                    so choose your ratio carefully based on project complexity.
                  </p>
                </div>
              </div>
            )}

            {/* Formula Section */}
            {activeSection === 'formula' && (
              <div className="space-y-6">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-[#2BBBEF]" />
                    <h3 className="text-[#010029]">PCI Formula - How It Works</h3>
                  </div>
                  <p className="text-gray-700">
                    The PCI (Project Cost Intelligence) formula uses 12 factors across 4 categories to calculate accurate project effort estimates.
                  </p>
                </div>

                <div className="rounded-xl border-2 border-[#2BBBEF] bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                  <h4 className="mb-4 text-center text-[#010029]">Complete PCI Formula</h4>
                  <div className="rounded-lg bg-white p-4 text-center" style={{ fontSize: '16px' }}>
                    <strong>PCI Units =</strong><br />
                    (ISR × CF × UXI) +<br />
                    (RCF × AEP - L) +<br />
                    (MLW × CGW × RF) +<br />
                    (S × GLRI)
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">Category 1: Scope & Complexity</h4>
                  <div className="space-y-2">
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">ISR (Initial Scope Rating)</strong>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        1-10 scale. Measures initial project scope size. Higher for larger, more comprehensive features.
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">CF (Complexity Factor)</strong>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        Multiplier (typically 1.0-2.0). Accounts for technical complexity, algorithms, and intricate logic.
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">UXI (User Experience Index)</strong>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        Multiplier for UI/UX complexity. Higher for responsive design, animations, accessibility requirements.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">Category 2: Risk & Engineering</h4>
                  <div className="space-y-2">
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">RCF (Risk Complexity Factor)</strong>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        Multiplier for technical risk. Higher for security-critical, regulatory, or high-stakes systems.
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">AEP (Advanced Engineering Points)</strong>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        Points for sophisticated engineering: distributed systems, real-time processing, ML models.
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">L (Learning Curve)</strong>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        Deduction for team familiarity. Lower L means team is already expert in required technologies.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">Category 3: Multi-Layer Work</h4>
                  <div className="space-y-2">
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">MLW (Multi-Layer Work)</strong>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        Multiplier for full-stack complexity. Higher when work spans frontend, backend, database, infrastructure.
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">CGW (Cross-Group Work)</strong>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        Multiplier for coordination overhead. Increases with number of teams, dependencies, integrations.
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">RF (Rework Factor)</strong>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        Multiplier for expected iterations. Higher for exploratory work, evolving requirements, prototypes.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">Category 4: Specialty & Governance</h4>
                  <div className="space-y-2">
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">S (Specialty Factor)</strong>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        Multiplier for specialized skills: AI/ML, blockchain, embedded systems, scientific computing.
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <strong className="text-[#010029]">GLRI (Governance, Legal, Regulatory Index)</strong>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        Multiplier for compliance overhead: GDPR, HIPAA, SOC2, PCI-DSS, financial regulations.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-[#010029]">Example Calculation</h4>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-3 text-[#010029]">
                      Task: "Payment Gateway Integration with Stripe"
                    </div>
                    <div className="space-y-1 text-gray-700" style={{ fontSize: '13px' }}>
                      <div>ISR = 5 (medium scope)</div>
                      <div>CF = 1.4 (moderate complexity)</div>
                      <div>UXI = 1.3 (payment UI forms)</div>
                      <div>RCF = 1.5 (financial data risk)</div>
                      <div>AEP = 6 (webhook handling, transaction logic)</div>
                      <div>L = 1 (team knows Stripe)</div>
                      <div>MLW = 1.3 (frontend + backend)</div>
                      <div>CGW = 1.2 (coordinate with payment team)</div>
                      <div>RF = 1.2 (some iteration expected)</div>
                      <div>S = 1.1 (payment processing specialty)</div>
                      <div>GLRI = 1.3 (PCI-DSS compliance)</div>
                    </div>
                    <div className="my-3 border-t border-gray-300 pt-3">
                      <strong className="text-[#010029]">Calculation:</strong>
                      <div className="mt-2 text-gray-700" style={{ fontSize: '13px' }}>
                        (5 × 1.4 × 1.3) + (1.5 × 6 - 1) + (1.3 × 1.2 × 1.2) + (1.1 × 1.3)<br />
                        = 9.1 + 8 + 1.872 + 1.43<br />
                        = <strong className="text-[#2BBBEF]">20.4 PCI Units</strong>
                      </div>
                    </div>
                    <div className="rounded bg-blue-50 p-2 text-blue-700" style={{ fontSize: '13px' }}>
                      With 1.5x ratio and $66/hr rate: 20.4 × 1.5 = 30.6 hours × $66 = <strong>$2,020</strong>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border-l-4 border-[#2BBBEF] bg-blue-50 p-4">
                  <strong className="text-blue-800">Key Insight:</strong>
                  <p className="mt-1 text-blue-700" style={{ fontSize: '14px' }}>
                    The PCI formula is multiplicative in nature, meaning factors compound. A task with high values across multiple 
                    categories will have significantly higher units than one with high values in just one area. This reflects real-world 
                    complexity where multiple challenges combine to create exponential effort increases.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
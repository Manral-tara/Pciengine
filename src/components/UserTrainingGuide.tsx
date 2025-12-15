import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Play, CheckCircle, Sparkles, BarChart3, FileText, TrendingUp, Layers, GitBranch, Cpu, Users, Building2, Download, Copy, Eye, Target, Zap, AlertCircle, Clock, DollarSign, Calculator } from 'lucide-react';

export function UserTrainingGuide() {
  const [expandedSection, setExpandedSection] = useState<string | null>('task-modeling');
  const [expandedSubSection, setExpandedSubSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleSubSection = (section: string) => {
    setExpandedSubSection(expandedSubSection === section ? null : section);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border-2 border-[#2BBBEF] bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-[#010029]" style={{ fontSize: '24px', fontWeight: 700 }}>
              PCI Engine User Training Guide
            </h2>
            <p className="text-gray-700" style={{ fontSize: '14px' }}>
              Master all features across Task Modeling, Proposal Builder, and Project Audit
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-white p-3 text-center">
            <div className="mb-1 text-[#2BBBEF]" style={{ fontSize: '24px', fontWeight: 700 }}>3</div>
            <div className="text-gray-600" style={{ fontSize: '12px' }}>Main Modules</div>
          </div>
          <div className="rounded-lg bg-white p-3 text-center">
            <div className="mb-1 text-[#4AFFA8]" style={{ fontSize: '24px', fontWeight: 700 }}>25+</div>
            <div className="text-gray-600" style={{ fontSize: '12px' }}>Features</div>
          </div>
          <div className="rounded-lg bg-white p-3 text-center">
            <div className="mb-1 text-[#010029]" style={{ fontSize: '24px', fontWeight: 700 }}>∞</div>
            <div className="text-gray-600" style={{ fontSize: '12px' }}>Possibilities</div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-[#010029]" style={{ fontSize: '16px', fontWeight: 600 }}>
          Quick Navigation
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => toggleSection('task-modeling')}
            className="rounded-lg border border-[#2BBBEF] bg-blue-50 px-3 py-2 text-[#2BBBEF] transition-colors hover:bg-blue-100"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            Task Modeling
          </button>
          <button
            onClick={() => toggleSection('proposal-builder')}
            className="rounded-lg border border-[#4AFFA8] bg-green-50 px-3 py-2 text-green-700 transition-colors hover:bg-green-100"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            Proposal Builder
          </button>
          <button
            onClick={() => toggleSection('project-audit')}
            className="rounded-lg border border-[#010029] bg-gray-50 px-3 py-2 text-[#010029] transition-colors hover:bg-gray-100"
            style={{ fontSize: '13px', fontWeight: 600 }}
          >
            Project Audit
          </button>
        </div>
      </div>

      {/* SECTION 1: TASK MODELING */}
      <div className="rounded-xl border-2 border-blue-200 bg-white shadow-sm">
        <button
          onClick={() => toggleSection('task-modeling')}
          className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-blue-50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-[#010029]" style={{ fontSize: '20px', fontWeight: 700 }}>
                1. Task Modeling
              </h3>
              <p className="text-gray-600" style={{ fontSize: '13px' }}>
                Interactive cost modeling with PCI formulas and real-time calculations
              </p>
            </div>
          </div>
          {expandedSection === 'task-modeling' ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {expandedSection === 'task-modeling' && (
          <div className="border-t border-gray-200 p-6 space-y-6">
            {/* Overview */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <h4 className="text-[#010029]" style={{ fontSize: '16px', fontWeight: 600 }}>
                  What is Task Modeling?
                </h4>
              </div>
              <p className="text-gray-700" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Task Modeling is the core feature for project cost estimation. It allows you to break down projects into tasks, 
                apply complexity factors, and get real-time cost calculations using the PCI (Project Cost Index) formula.
              </p>
            </div>

            {/* Feature 1: Task Table */}
            <div>
              <button
                onClick={() => toggleSubSection('task-table')}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                    Interactive Task Table
                  </span>
                </div>
                {expandedSubSection === 'task-table' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {expandedSubSection === 'task-table' && (
                <div className="mt-3 ml-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-gray-700" style={{ fontSize: '14px' }}>
                    <strong>Purpose:</strong> Create and manage project tasks with detailed cost breakdown.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>How to Use:</p>
                    <ol className="ml-4 space-y-2 text-gray-700" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      <li className="flex gap-2">
                        <span className="text-blue-600">1.</span>
                        <span>Click <strong>"+ Add Task"</strong> to create a new task row</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-600">2.</span>
                        <span>Enter task name in the <strong>Task Element</strong> column</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-600">3.</span>
                        <span>Input <strong>Units</strong> (scope of work) and <strong>Complexity</strong> (1-10 scale)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-600">4.</span>
                        <span>Watch real-time calculations for <strong>Hours</strong> and <strong>Cost</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-600">5.</span>
                        <span>Delete tasks with the trash icon on hover</span>
                      </li>
                    </ol>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="mb-1 text-blue-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                      💡 Pro Tip:
                    </p>
                    <p className="text-blue-800" style={{ fontSize: '13px' }}>
                      Use complexity scores strategically: 1-3 for simple tasks, 4-7 for moderate complexity, 8-10 for high complexity work.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 2: PCI Formula */}
            <div>
              <button
                onClick={() => toggleSubSection('pci-formula')}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <span className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                    PCI Formula Panel
                  </span>
                </div>
                {expandedSubSection === 'pci-formula' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {expandedSubSection === 'pci-formula' && (
                <div className="mt-3 ml-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-gray-700" style={{ fontSize: '14px' }}>
                    <strong>Purpose:</strong> Understand how costs are calculated with the PCI formula breakdown.
                  </p>
                  
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="mb-2 text-blue-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                      PCI Formula:
                    </p>
                    <code className="text-blue-800" style={{ fontSize: '13px' }}>
                      PCI = (Units × Complexity × Unit-to-Hour Ratio) × Hourly Rate
                    </code>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>How to Use:</p>
                    <ul className="ml-4 space-y-2 text-gray-700" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      <li className="flex gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Click <strong>"Show Formula"</strong> button to toggle the panel</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-600">•</span>
                        <span>View detailed breakdown of each calculation component</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-600">•</span>
                        <span>See example calculations to understand the formula</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-600">•</span>
                        <span>Adjust global settings to see formula changes in real-time</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 3: Summary Section */}
            <div>
              <button
                onClick={() => toggleSubSection('summary')}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                    Project Summary & KPIs
                  </span>
                </div>
                {expandedSubSection === 'summary' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {expandedSubSection === 'summary' && (
                <div className="mt-3 ml-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-gray-700" style={{ fontSize: '14px' }}>
                    <strong>Purpose:</strong> Monitor project totals and key performance indicators.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>Key Metrics:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-gray-200 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600" style={{ fontSize: '12px' }}>Total Cost</span>
                        </div>
                        <p className="text-gray-700" style={{ fontSize: '13px' }}>Sum of all task costs</p>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600" style={{ fontSize: '12px' }}>Total Hours</span>
                        </div>
                        <p className="text-gray-700" style={{ fontSize: '13px' }}>Estimated time investment</p>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600" style={{ fontSize: '12px' }}>Avg Complexity</span>
                        </div>
                        <p className="text-gray-700" style={{ fontSize: '13px' }}>Overall project difficulty</p>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <Layers className="h-4 w-4 text-orange-600" />
                          <span className="text-gray-600" style={{ fontSize: '12px' }}>Task Count</span>
                        </div>
                        <p className="text-gray-700" style={{ fontSize: '13px' }}>Number of tasks</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 4: AI Task Creator */}
            <div>
              <button
                onClick={() => toggleSubSection('ai-task')}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gradient-to-r from-green-50 to-cyan-50 p-4 transition-colors hover:from-green-100 hover:to-cyan-100"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#2BBBEF]" />
                  <span className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                    AI Task Creator
                  </span>
                  <span className="rounded-full bg-gradient-to-r from-[#4AFFA8] to-[#2BBBEF] px-2 py-1 text-white" style={{ fontSize: '11px', fontWeight: 600 }}>
                    AI POWERED
                  </span>
                </div>
                {expandedSubSection === 'ai-task' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {expandedSubSection === 'ai-task' && (
                <div className="mt-3 ml-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-gray-700" style={{ fontSize: '14px' }}>
                    <strong>Purpose:</strong> Generate tasks automatically using AI based on project description.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>How to Use:</p>
                    <ol className="ml-4 space-y-2 text-gray-700" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      <li className="flex gap-2">
                        <span className="text-[#2BBBEF]">1.</span>
                        <span>Click the <strong>AI sparkle button</strong> in the top right</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#2BBBEF]">2.</span>
                        <span>Describe your project (e.g., "E-commerce website with payment integration")</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#2BBBEF]">3.</span>
                        <span>AI generates relevant tasks with estimated units and complexity</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#2BBBEF]">4.</span>
                        <span>Review and edit generated tasks as needed</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#2BBBEF]">5.</span>
                        <span>Click <strong>"Add All Tasks"</strong> to import them</span>
                      </li>
                    </ol>
                  </div>

                  <div className="rounded-lg bg-gradient-to-r from-green-50 to-cyan-50 p-3">
                    <p className="mb-1 text-[#010029]" style={{ fontSize: '13px', fontWeight: 600 }}>
                      🚀 Power User Tip:
                    </p>
                    <p className="text-gray-700" style={{ fontSize: '13px' }}>
                      Be specific in your description for better results. Include tech stack, features, and any special requirements.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: PROPOSAL BUILDER */}
      <div className="rounded-xl border-2 border-green-200 bg-white shadow-sm">
        <button
          onClick={() => toggleSection('proposal-builder')}
          className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-green-50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-[#010029]" style={{ fontSize: '20px', fontWeight: 700 }}>
                2. Proposal Builder
              </h3>
              <p className="text-gray-600" style={{ fontSize: '13px' }}>
                AI-powered proposal generation with templates, cost breakdowns, and export
              </p>
            </div>
          </div>
          {expandedSection === 'proposal-builder' ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {expandedSection === 'proposal-builder' && (
          <div className="border-t border-gray-200 p-6 space-y-6">
            {/* Overview */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                <h4 className="text-[#010029]" style={{ fontSize: '16px', fontWeight: 600 }}>
                  What is Proposal Builder?
                </h4>
              </div>
              <p className="text-gray-700" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Transform your cost estimates into professional client proposals with AI assistance. Generate executive summaries, 
                detailed breakdowns, timelines, and export ready-to-send documents.
              </p>
            </div>

            {/* Feature 1: AI Generation */}
            <div>
              <button
                onClick={() => toggleSubSection('ai-proposal')}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gradient-to-r from-green-50 to-cyan-50 p-4 transition-colors hover:from-green-100 hover:to-cyan-100"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  <span className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                    AI Proposal Generation
                  </span>
                  <span className="rounded-full bg-gradient-to-r from-[#4AFFA8] to-[#2BBBEF] px-2 py-1 text-white" style={{ fontSize: '11px', fontWeight: 600 }}>
                    AI POWERED
                  </span>
                </div>
                {expandedSubSection === 'ai-proposal' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {expandedSubSection === 'ai-proposal' && (
                <div className="mt-3 ml-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-gray-700" style={{ fontSize: '14px' }}>
                    <strong>Purpose:</strong> Automatically generate professional proposal content based on your project data.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>How to Use:</p>
                    <ol className="ml-4 space-y-2 text-gray-700" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      <li className="flex gap-2">
                        <span className="text-green-600">1.</span>
                        <span>Navigate to <strong>Dashboard → Proposal Builder</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">2.</span>
                        <span>Fill in client details, project name, and description</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">3.</span>
                        <span>Click <strong>"Generate with AI"</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">4.</span>
                        <span>AI creates executive summary, scope, deliverables, and timeline</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">5.</span>
                        <span>Review and edit any section as needed</span>
                      </li>
                    </ol>
                  </div>

                  <div className="rounded-lg bg-green-50 p-3">
                    <p className="mb-1 text-green-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                      ✨ What AI Generates:
                    </p>
                    <ul className="ml-4 space-y-1 text-green-800" style={{ fontSize: '13px' }}>
                      <li>• Executive Summary tailored to your project</li>
                      <li>• Detailed scope of work breakdown</li>
                      <li>• Key deliverables and milestones</li>
                      <li>• Realistic timeline estimates</li>
                      <li>• Professional tone and formatting</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 2: Cost Breakdown */}
            <div>
              <button
                onClick={() => toggleSubSection('cost-breakdown')}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                    Detailed Cost Breakdown
                  </span>
                </div>
                {expandedSubSection === 'cost-breakdown' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {expandedSubSection === 'cost-breakdown' && (
                <div className="mt-3 ml-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-gray-700" style={{ fontSize: '14px' }}>
                    <strong>Purpose:</strong> Present transparent cost breakdown to clients with phase-based pricing.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>Features:</p>
                    <ul className="ml-4 space-y-2 text-gray-700" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        <span><strong>Phase-based breakdown:</strong> Organize costs by project phases</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        <span><strong>Task-level detail:</strong> Show individual task costs and hours</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        <span><strong>Visual charts:</strong> Pie charts for cost distribution</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        <span><strong>Total summary:</strong> Grand totals with clear formatting</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 3: Export Options */}
            <div>
              <button
                onClick={() => toggleSubSection('export')}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  <span className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                    Export & Share
                  </span>
                </div>
                {expandedSubSection === 'export' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {expandedSubSection === 'export' && (
                <div className="mt-3 ml-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-gray-700" style={{ fontSize: '14px' }}>
                    <strong>Purpose:</strong> Export proposals in multiple formats for client delivery.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>Export Formats:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <p className="mb-1 text-blue-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                          📄 PDF Export
                        </p>
                        <p className="text-blue-800" style={{ fontSize: '12px' }}>
                          Professional PDF with branding and formatting
                        </p>
                      </div>
                      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                        <p className="mb-1 text-green-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                          📊 Excel Export
                        </p>
                        <p className="text-green-800" style={{ fontSize: '12px' }}>
                          Editable spreadsheet with cost calculations
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-yellow-50 p-3">
                    <p className="mb-1 text-yellow-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                      💼 Professional Tip:
                    </p>
                    <p className="text-yellow-800" style={{ fontSize: '13px' }}>
                      Review the proposal in preview mode before exporting to ensure all sections are complete and professional.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: PROJECT AUDIT */}
      <div className="rounded-xl border-2 border-purple-200 bg-white shadow-sm">
        <button
          onClick={() => toggleSection('project-audit')}
          className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-purple-50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-[#010029]" style={{ fontSize: '20px', fontWeight: 700 }}>
                3. Project Audit
              </h3>
              <p className="text-gray-600" style={{ fontSize: '13px' }}>
                Comprehensive audit tools with versioning, AI analysis, and justification generation
              </p>
            </div>
          </div>
          {expandedSection === 'project-audit' ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {expandedSection === 'project-audit' && (
          <div className="border-t border-gray-200 p-6 space-y-6">
            {/* Overview */}
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-purple-600" />
                <h4 className="text-[#010029]" style={{ fontSize: '16px', fontWeight: 600 }}>
                  What is Project Audit?
                </h4>
              </div>
              <p className="text-gray-700" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Track project changes, create baselines, analyze scope evolution, and generate AI-powered justifications. 
                Perfect for maintaining audit trails and explaining scope changes to stakeholders.
              </p>
            </div>

            {/* Feature 1: Baseline Setup */}
            <div>
              <button
                onClick={() => toggleSubSection('baseline')}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                    Hierarchical Baseline Setup
                  </span>
                </div>
                {expandedSubSection === 'baseline' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {expandedSubSection === 'baseline' && (
                <div className="mt-3 ml-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-gray-700" style={{ fontSize: '14px' }}>
                    <strong>Purpose:</strong> Create structured project baseline with Epic → Task → Subtask hierarchy.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>Structure:</p>
                    <div className="ml-4 space-y-2">
                      <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                        <p className="mb-1 text-purple-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                          📦 Epics (High-level features)
                        </p>
                        <p className="text-purple-800" style={{ fontSize: '12px' }}>
                          Major project components like "User Authentication" or "Payment System"
                        </p>
                      </div>
                      <div className="ml-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <p className="mb-1 text-blue-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                          ✓ Tasks (Mid-level work items)
                        </p>
                        <p className="text-blue-800" style={{ fontSize: '12px' }}>
                          Specific deliverables like "Implement OAuth2" with hours, role, rate, complexity, risk
                        </p>
                      </div>
                      <div className="ml-8 rounded-lg border border-green-200 bg-green-50 p-3">
                        <p className="mb-1 text-green-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                          → Subtasks (Granular activities)
                        </p>
                        <p className="text-green-800" style={{ fontSize: '12px' }}>
                          Detailed steps like "Setup Google OAuth provider" with same tracking fields
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>How to Use:</p>
                    <ol className="ml-4 space-y-2 text-gray-700" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      <li className="flex gap-2">
                        <span className="text-purple-600">1.</span>
                        <span>Click <strong>"+ Add Epic"</strong> to create high-level feature</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple-600">2.</span>
                        <span>Add tasks under each epic with estimated hours, role type, and cost rate</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple-600">3.</span>
                        <span>Set <strong>Complexity Score</strong> (0-100) and <strong>Risk Level</strong> (Low/Medium/High/Critical)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple-600">4.</span>
                        <span>Add subtasks for granular tracking</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple-600">5.</span>
                        <span>View real-time calculations in the Multi-Dimensional Estimation Panel</span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 2: Version Control */}
            <div>
              <button
                onClick={() => toggleSubSection('versioning')}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-purple-600" />
                  <span className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                    Scope Versioning Log
                  </span>
                </div>
                {expandedSubSection === 'versioning' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {expandedSubSection === 'versioning' && (
                <div className="mt-3 ml-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-gray-700" style={{ fontSize: '14px' }}>
                    <strong>Purpose:</strong> Track all project changes with timestamps, snapshots, and comparison tools.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>Features:</p>
                    <ul className="ml-4 space-y-2 text-gray-700" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      <li className="flex gap-2">
                        <span className="text-purple-600">•</span>
                        <span><strong>Auto-snapshot creation:</strong> Creates version on every save</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple-600">•</span>
                        <span><strong>Version table:</strong> View all versions with timestamp, user, and summary</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple-600">•</span>
                        <span><strong>Diff view modal:</strong> Color-coded additions (green), removals (red), modifications (yellow)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple-600">•</span>
                        <span><strong>Version restoration:</strong> Rollback to any previous version</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-purple-600">•</span>
                        <span><strong>Deep cloning:</strong> Full project state captured in each version</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg bg-purple-50 p-3">
                    <p className="mb-1 text-purple-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                      🔍 Using Diff View:
                    </p>
                    <ol className="ml-4 space-y-1 text-purple-800" style={{ fontSize: '13px' }}>
                      <li>1. Click <strong>"Compare"</strong> on any version</li>
                      <li>2. View side-by-side comparison with previous version</li>
                      <li>3. Green highlights = additions, Red = removals, Yellow = modifications</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 3: AI Scope Change Reasons */}
            <div>
              <button
                onClick={() => toggleSubSection('ai-reasons')}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gradient-to-r from-green-50 to-cyan-50 p-4 transition-colors hover:from-green-100 hover:to-cyan-100"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#2BBBEF]" />
                  <span className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                    AI Scope Change Reason Generator
                  </span>
                  <span className="rounded-full bg-gradient-to-r from-[#4AFFA8] to-[#2BBBEF] px-2 py-1 text-white" style={{ fontSize: '11px', fontWeight: 600 }}>
                    AI POWERED
                  </span>
                </div>
                {expandedSubSection === 'ai-reasons' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {expandedSubSection === 'ai-reasons' && (
                <div className="mt-3 ml-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-gray-700" style={{ fontSize: '14px' }}>
                    <strong>Purpose:</strong> Generate intelligent explanations for why scope changes occurred between versions.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>How to Use:</p>
                    <ol className="ml-4 space-y-2 text-gray-700" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      <li className="flex gap-2">
                        <span className="text-[#2BBBEF]">1.</span>
                        <span>In version log table, click <strong>"AI"</strong> button on any version</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#2BBBEF]">2.</span>
                        <span>AI analyzes changes (budget, epics, tasks, hours)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#2BBBEF]">3.</span>
                        <span>View input data sources showing quantitative and qualitative changes</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#2BBBEF]">4.</span>
                        <span>Review AI-generated explanations (numbered list)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#2BBBEF]">5.</span>
                        <span>Click <strong>"Export Summary"</strong> to download text file</span>
                      </li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>AI Analyzes:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-2">
                        <p className="text-blue-900" style={{ fontSize: '12px', fontWeight: 600 }}>📊 Quantitative</p>
                        <p className="text-blue-800" style={{ fontSize: '11px' }}>Budget %, Epics +/-, Tasks +/-, Hours delta</p>
                      </div>
                      <div className="rounded-lg border border-purple-200 bg-purple-50 p-2">
                        <p className="text-purple-900" style={{ fontSize: '12px', fontWeight: 600 }}>📝 Qualitative</p>
                        <p className="text-purple-800" style={{ fontSize: '11px' }}>Scope direction, Change magnitude, Project phase</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gradient-to-r from-green-50 to-cyan-50 p-3">
                    <p className="mb-1 text-[#010029]" style={{ fontSize: '13px', fontWeight: 600 }}>
                      💡 Example Output:
                    </p>
                    <p className="text-gray-700" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                      "Budget increased by 15.3% to accommodate additional scope and resource requirements 
                      identified during planning. 2 new epics address emerging stakeholder feedback..."
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 4: Justification Builder */}
            <div>
              <button
                onClick={() => toggleSubSection('justification')}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 transition-colors hover:from-orange-100 hover:to-yellow-100"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <span className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                    Justification Builder
                  </span>
                  <span className="rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 px-2 py-1 text-white" style={{ fontSize: '11px', fontWeight: 600 }}>
                    AI POWERED
                  </span>
                </div>
                {expandedSubSection === 'justification' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {expandedSubSection === 'justification' && (
                <div className="mt-3 ml-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-gray-700" style={{ fontSize: '14px' }}>
                    <strong>Purpose:</strong> Generate comprehensive business, technical, and client impact documentation for scope changes.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>Three Justification Types:</p>
                    
                    <div className="space-y-2">
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-orange-600" />
                          <p className="text-orange-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                            🏢 Business Justification
                          </p>
                        </div>
                        <p className="text-orange-800" style={{ fontSize: '12px' }}>
                          Executive summary, financial impact, strategic value, risk mitigation, ROI calculations
                        </p>
                      </div>

                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-blue-600" />
                          <p className="text-blue-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                            💻 Technical Justification
                          </p>
                        </div>
                        <p className="text-blue-800" style={{ fontSize: '12px' }}>
                          Architecture overview, system improvements, tech stack, development methodology, QA protocols
                        </p>
                      </div>

                      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <p className="text-green-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                            👥 Client Impact Summary
                          </p>
                        </div>
                        <p className="text-green-800" style={{ fontSize: '12px' }}>
                          UX enhancements, business process impact, timeline expectations, training, measurable outcomes
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>How to Use:</p>
                    <ol className="ml-4 space-y-2 text-gray-700" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      <li className="flex gap-2">
                        <span className="text-orange-600">1.</span>
                        <span>Click <strong>"Justify"</strong> button on any version</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-orange-600">2.</span>
                        <span>Wait for AI to generate all three justification types (2.5 seconds)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-orange-600">3.</span>
                        <span>Review each section (color-coded cards)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-orange-600">4.</span>
                        <span>Click <strong>"Copy"</strong> button on individual sections to copy to clipboard</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-orange-600">5.</span>
                        <span>Or click <strong>"Export All Justifications"</strong> to download complete document</span>
                      </li>
                    </ol>
                  </div>

                  <div className="rounded-lg bg-yellow-50 p-3">
                    <p className="mb-1 text-yellow-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                      📋 Copy-to-Clipboard Features:
                    </p>
                    <ul className="ml-4 space-y-1 text-yellow-800" style={{ fontSize: '12px' }}>
                      <li>• Individual copy buttons for each section</li>
                      <li>• Visual confirmation when copied (green checkmark)</li>
                      <li>• Perfect for pasting into emails, presentations, or reports</li>
                    </ul>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="mb-1 text-blue-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                      💼 Use Cases:
                    </p>
                    <ul className="ml-4 space-y-1 text-blue-800" style={{ fontSize: '12px' }}>
                      <li>• <strong>Stakeholder presentations:</strong> Copy business justification for slides</li>
                      <li>• <strong>Client emails:</strong> Copy client impact for project updates</li>
                      <li>• <strong>Technical reviews:</strong> Copy technical justification for engineering docs</li>
                      <li>• <strong>Budget approvals:</strong> Export all for comprehensive request package</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 5: Multi-Dimensional Estimation */}
            <div>
              <button
                onClick={() => toggleSubSection('estimation')}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-purple-600" />
                  <span className="text-[#010029]" style={{ fontSize: '15px', fontWeight: 600 }}>
                    Multi-Dimensional Estimation Panel
                  </span>
                </div>
                {expandedSubSection === 'estimation' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              
              {expandedSubSection === 'estimation' && (
                <div className="mt-3 ml-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-gray-700" style={{ fontSize: '14px' }}>
                    <strong>Purpose:</strong> Real-time project estimation with complexity, risk, and buffer calculations.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>Metrics Tracked:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-gray-200 p-2">
                        <p className="mb-1 text-gray-700" style={{ fontSize: '12px', fontWeight: 600 }}>Estimated Hours</p>
                        <p className="text-gray-600" style={{ fontSize: '11px' }}>Sum of all task hours</p>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-2">
                        <p className="mb-1 text-gray-700" style={{ fontSize: '12px', fontWeight: 600 }}>Estimated Cost</p>
                        <p className="text-gray-600" style={{ fontSize: '11px' }}>Hours × Role rates</p>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-2">
                        <p className="mb-1 text-gray-700" style={{ fontSize: '12px', fontWeight: 600 }}>Complexity Score</p>
                        <p className="text-gray-600" style={{ fontSize: '11px' }}>0-100 slider</p>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-2">
                        <p className="mb-1 text-gray-700" style={{ fontSize: '12px', fontWeight: 600 }}>Risk Level</p>
                        <p className="text-gray-600" style={{ fontSize: '11px' }}>Low/Medium/High/Critical</p>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-2">
                        <p className="mb-1 text-gray-700" style={{ fontSize: '12px', fontWeight: 600 }}>Buffer %</p>
                        <p className="text-gray-600" style={{ fontSize: '11px' }}>Optional safety margin</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-purple-50 p-3">
                    <p className="mb-1 text-purple-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                      🎯 Smart Features:
                    </p>
                    <ul className="ml-4 space-y-1 text-purple-800" style={{ fontSize: '12px' }}>
                      <li>• Auto-aggregates from all epics, tasks, and subtasks</li>
                      <li>• Real-time updates as you modify baseline</li>
                      <li>• Visual indicators for complexity and risk levels</li>
                      <li>• Buffer calculations for contingency planning</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Tips Section */}
      <div className="rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-[#010029]" style={{ fontSize: '18px', fontWeight: 700 }}>
            Quick Tips for Success
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-yellow-200 bg-white p-4">
            <p className="mb-2 text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>
              ⚡ Keyboard Shortcuts
            </p>
            <ul className="space-y-1 text-gray-700" style={{ fontSize: '13px' }}>
              <li>• Ctrl/Cmd + S to save</li>
              <li>• Tab to navigate between fields</li>
              <li>• Enter to confirm modal actions</li>
            </ul>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-white p-4">
            <p className="mb-2 text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>
              🎨 Best Practices
            </p>
            <ul className="space-y-1 text-gray-700" style={{ fontSize: '13px' }}>
              <li>• Create versions before major changes</li>
              <li>• Use AI features to save time</li>
              <li>• Export regularly for backups</li>
            </ul>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-white p-4">
            <p className="mb-2 text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>
              🚀 Workflow Tips
            </p>
            <ul className="space-y-1 text-gray-700" style={{ fontSize: '13px' }}>
              <li>• Start with Task Modeling</li>
              <li>• Generate proposal for clients</li>
              <li>• Use audit for change tracking</li>
            </ul>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-white p-4">
            <p className="mb-2 text-[#010029]" style={{ fontSize: '14px', fontWeight: 600 }}>
              💡 Pro User Moves
            </p>
            <ul className="space-y-1 text-gray-700" style={{ fontSize: '13px' }}>
              <li>• Leverage AI for everything</li>
              <li>• Compare versions frequently</li>
              <li>• Export justifications early</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-[#2BBBEF]" />
          <h4 className="text-[#010029]" style={{ fontSize: '16px', fontWeight: 600 }}>
            Need Help?
          </h4>
        </div>
        <p className="mb-3 text-gray-700" style={{ fontSize: '14px' }}>
          If you encounter any issues or have questions about specific features, our support team is here to help.
        </p>
        <div className="flex gap-3">
          <button className="rounded-lg border border-[#2BBBEF] bg-[#2BBBEF] px-4 py-2 text-white transition-opacity hover:opacity-90" style={{ fontSize: '13px', fontWeight: 600 }}>
            Contact Support
          </button>
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50" style={{ fontSize: '13px', fontWeight: 600 }}>
            View Documentation
          </button>
        </div>
      </div>
    </div>
  );
}

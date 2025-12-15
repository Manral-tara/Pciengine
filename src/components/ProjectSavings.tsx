import React, { useMemo } from 'react';
import { TrendingDown, DollarSign, Zap, Target, Award, Download, TrendingUp, CheckCircle } from 'lucide-react';
import { Task, Settings } from './TaskTable';

interface ProjectSavingsProps {
  tasks: Task[];
  settings: Settings;
  projectName?: string;
}

interface SavingsBreakdown {
  aiVerificationSavings: number;
  vendorRateSavings: number;
  budgetEfficiency: number;
  totalSavings: number;
  efficiencyPercentage: number;
  originalEstimate: number;
  optimizedEstimate: number;
  actualSpent: number;
}

export function ProjectSavings({ tasks, settings, projectName = "Current Project" }: ProjectSavingsProps) {
  const savings = useMemo((): SavingsBreakdown => {
    const validTasks = tasks.filter(t => t != null);
    
    // Calculate original PCI cost (unverified)
    const originalEstimate = validTasks.reduce((sum, task) => {
      const pci = (task.ISR * task.CF * task.UXI) + 
                  (task.RCF * task.AEP - task.L) + 
                  (task.MLW * task.CGW * task.RF) + 
                  (task.S * task.GLRI);
      const cost = pci * (task.hourlyRate || settings.defaultHourlyRate || 66);
      return sum + cost;
    }, 0);

    // Calculate AI-verified optimized cost
    const optimizedEstimate = validTasks.reduce((sum, task) => {
      const verifiedUnits = task.aiVerifiedUnits || 0;
      const cost = verifiedUnits * (task.hourlyRate || settings.defaultHourlyRate || 66);
      return sum + cost;
    }, 0);

    // AI Verification Savings (original PCI vs AI-verified)
    const aiVerificationSavings = originalEstimate - optimizedEstimate;

    // Calculate internal cost (current rates)
    const internalCost = validTasks.reduce((sum, task) => {
      const verifiedUnits = task.aiVerifiedUnits || 0;
      const rate = task.hourlyRate || settings.defaultHourlyRate || 66;
      return sum + (verifiedUnits * rate);
    }, 0);

    // Calculate what it would cost with vendor rates (30% higher typical markup)
    const vendorCost = validTasks.reduce((sum, task) => {
      const verifiedUnits = task.aiVerifiedUnits || 0;
      const baseRate = task.hourlyRate || settings.defaultHourlyRate || 66;
      const vendorRate = task.vendorRate || baseRate * 1.3; // 30% markup if no vendor rate set
      return sum + (verifiedUnits * vendorRate);
    }, 0);

    // Vendor Rate Savings
    const vendorRateSavings = vendorCost - internalCost;

    // Calculate actual spent vs planned
    const plannedCost = optimizedEstimate;
    const actualSpent = validTasks.reduce((sum, task) => {
      const actualHours = task.actualHours || 0;
      const rate = task.hourlyRate || settings.defaultHourlyRate || 66;
      return sum + (actualHours * rate);
    }, 0);

    // Budget Efficiency (under budget = positive savings)
    const budgetEfficiency = plannedCost - actualSpent;

    // Total Savings
    const totalSavings = aiVerificationSavings + vendorRateSavings + budgetEfficiency;

    // Efficiency Percentage
    const efficiencyPercentage = originalEstimate > 0 
      ? (totalSavings / originalEstimate) * 100 
      : 0;

    return {
      aiVerificationSavings,
      vendorRateSavings,
      budgetEfficiency,
      totalSavings,
      efficiencyPercentage,
      originalEstimate,
      optimizedEstimate,
      actualSpent,
    };
  }, [tasks, settings]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportSavingsReport = () => {
    const report = `
PROJECT SAVINGS & EFFICIENCY REPORT
Generated: ${new Date().toLocaleDateString()}
Project: ${projectName}

═══════════════════════════════════════════════════════════

SAVINGS BREAKDOWN:
─────────────────────────────────────────────────────────

1. AI Verification Savings:        ${formatCurrency(savings.aiVerificationSavings)}
   • Original PCI Estimate:         ${formatCurrency(savings.originalEstimate)}
   • AI-Optimized Estimate:         ${formatCurrency(savings.optimizedEstimate)}
   • Savings from AI optimization

2. Vendor Rate Savings:             ${formatCurrency(savings.vendorRateSavings)}
   • In-house development cost advantage
   • Compared to external vendor rates
   • Typical 30% markup avoided

3. Budget Efficiency:               ${formatCurrency(savings.budgetEfficiency)}
   • Planned Budget:                ${formatCurrency(savings.optimizedEstimate)}
   • Actual Spent:                  ${formatCurrency(savings.actualSpent)}
   • ${savings.budgetEfficiency >= 0 ? 'Under budget' : 'Over budget'}

─────────────────────────────────────────────────────────

TOTAL PROJECT SAVINGS:              ${formatCurrency(savings.totalSavings)}
EFFICIENCY GAIN:                    ${savings.efficiencyPercentage.toFixed(1)}%

═══════════════════════════════════════════════════════════

VALUE DELIVERED:
• Cost optimization through AI-powered estimation
• Efficient resource allocation and planning
• In-house development cost advantages
• Proactive budget management

This represents real cost savings and efficiency gains
compared to traditional estimation and external development.

─────────────────────────────────────────────────────────
PCI Engine - AI-Powered Audit Intelligence
FRContent / Plataforma Technologies
    `.trim();

    // Create and download the report
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Project_Savings_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 dark:text-white" style={{ fontSize: '24px', fontWeight: 600 }}>
            Project Savings & Efficiency
          </h2>
          <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '14px' }}>
            Cost optimization and efficiency gains for {projectName}
          </p>
        </div>
        <button
          onClick={exportSavingsReport}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-300 dark:hover:bg-[#1A1F3F]"
          style={{ fontSize: '14px', fontWeight: 500 }}
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Total Savings Hero Card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] p-8">
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2">
            <Award className="h-6 w-6 text-white" />
            <span className="text-white" style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Project Savings
            </span>
          </div>
          <div className="mb-4 text-white" style={{ fontSize: '48px', fontWeight: 700 }}>
            {formatCurrency(savings.totalSavings)}
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
              <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                {savings.efficiencyPercentage.toFixed(1)}% Efficiency Gain
              </span>
            </div>
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
        </div>
        {/* Decorative Background */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
          <div className="absolute right-8 top-8 h-32 w-32 rounded-full bg-white blur-2xl"></div>
          <div className="absolute bottom-8 right-16 h-24 w-24 rounded-full bg-white blur-xl"></div>
        </div>
      </div>

      {/* Savings Breakdown Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* AI Verification Savings */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-[#0C0F2C]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#2BBBEF]/20 to-[#4AFFA8]/20">
              <Zap className="h-6 w-6 text-[#2BBBEF]" />
            </div>
            {savings.aiVerificationSavings > 0 && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingDown className="h-4 w-4" />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Optimized</span>
              </div>
            )}
          </div>
          <h3 className="mb-2 text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
            AI Verification Savings
          </h3>
          <div className="mb-3 text-[#2BBBEF]" style={{ fontSize: '32px', fontWeight: 700 }}>
            {formatCurrency(savings.aiVerificationSavings)}
          </div>
          <div className="space-y-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
            <div className="flex justify-between">
              <span>Original Estimate:</span>
              <span className="font-medium">{formatCurrency(savings.originalEstimate)}</span>
            </div>
            <div className="flex justify-between">
              <span>AI-Optimized:</span>
              <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(savings.optimizedEstimate)}</span>
            </div>
          </div>
          <p className="mt-3 text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>
            Savings from AI-powered estimation optimization
          </p>
        </div>

        {/* Vendor Rate Savings */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-[#0C0F2C]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#4AFFA8]/20 to-[#2BBBEF]/20">
              <Target className="h-6 w-6 text-[#4AFFA8]" />
            </div>
            {savings.vendorRateSavings > 0 && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>In-house</span>
              </div>
            )}
          </div>
          <h3 className="mb-2 text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
            Vendor Rate Savings
          </h3>
          <div className="mb-3 text-[#4AFFA8]" style={{ fontSize: '32px', fontWeight: 700 }}>
            {formatCurrency(savings.vendorRateSavings)}
          </div>
          <div className="space-y-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
            <div className="flex justify-between">
              <span>In-house Cost:</span>
              <span className="font-medium">{formatCurrency(savings.optimizedEstimate)}</span>
            </div>
            <div className="flex justify-between">
              <span>Vendor Cost:</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {formatCurrency(savings.optimizedEstimate + savings.vendorRateSavings)}
              </span>
            </div>
          </div>
          <p className="mt-3 text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>
            Cost advantage vs. external vendor rates
          </p>
        </div>

        {/* Budget Efficiency */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-[#0C0F2C]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            {savings.budgetEfficiency >= 0 ? (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingDown className="h-4 w-4" />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Under Budget</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <TrendingUp className="h-4 w-4" />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Over Budget</span>
              </div>
            )}
          </div>
          <h3 className="mb-2 text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
            Budget Efficiency
          </h3>
          <div className={`mb-3 ${savings.budgetEfficiency >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} style={{ fontSize: '32px', fontWeight: 700 }}>
            {formatCurrency(Math.abs(savings.budgetEfficiency))}
          </div>
          <div className="space-y-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
            <div className="flex justify-between">
              <span>Planned Budget:</span>
              <span className="font-medium">{formatCurrency(savings.optimizedEstimate)}</span>
            </div>
            <div className="flex justify-between">
              <span>Actual Spent:</span>
              <span className="font-medium">{formatCurrency(savings.actualSpent)}</span>
            </div>
          </div>
          <p className="mt-3 text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>
            {savings.budgetEfficiency >= 0 ? 'Project delivered under budget' : 'Additional investment required'}
          </p>
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-white/10 dark:bg-[#0C0F2C]">
        <h3 className="mb-4 text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
          Savings Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                <th className="pb-3 text-left text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Category
                </th>
                <th className="pb-3 text-right text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Amount
                </th>
                <th className="pb-3 text-right text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  % of Total
                </th>
                <th className="pb-3 text-left text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Impact
                </th>
              </tr>
            </thead>
            <tbody>
              {/* AI Verification */}
              <tr className="border-b border-gray-100 dark:border-white/5">
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#2BBBEF]" />
                    <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 500 }}>
                      AI Verification Optimization
                    </span>
                  </div>
                </td>
                <td className="py-4 text-right text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                  {formatCurrency(savings.aiVerificationSavings)}
                </td>
                <td className="py-4 text-right text-gray-500 dark:text-gray-400" style={{ fontSize: '14px' }}>
                  {savings.totalSavings > 0 ? ((savings.aiVerificationSavings / savings.totalSavings) * 100).toFixed(1) : 0}%
                </td>
                <td className="py-4">
                  <span className="rounded-full bg-[#2BBBEF]/10 px-2 py-1 text-[#2BBBEF]" style={{ fontSize: '11px', fontWeight: 600 }}>
                    High
                  </span>
                </td>
              </tr>

              {/* Vendor Rates */}
              <tr className="border-b border-gray-100 dark:border-white/5">
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-[#4AFFA8]" />
                    <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 500 }}>
                      In-house Development Advantage
                    </span>
                  </div>
                </td>
                <td className="py-4 text-right text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                  {formatCurrency(savings.vendorRateSavings)}
                </td>
                <td className="py-4 text-right text-gray-500 dark:text-gray-400" style={{ fontSize: '14px' }}>
                  {savings.totalSavings > 0 ? ((savings.vendorRateSavings / savings.totalSavings) * 100).toFixed(1) : 0}%
                </td>
                <td className="py-4">
                  <span className="rounded-full bg-[#4AFFA8]/10 px-2 py-1 text-[#4AFFA8]" style={{ fontSize: '11px', fontWeight: 600 }}>
                    High
                  </span>
                </td>
              </tr>

              {/* Budget Performance */}
              <tr className="border-b border-gray-100 dark:border-white/5">
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 500 }}>
                      Budget Performance
                    </span>
                  </div>
                </td>
                <td className="py-4 text-right text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                  {formatCurrency(Math.abs(savings.budgetEfficiency))}
                </td>
                <td className="py-4 text-right text-gray-500 dark:text-gray-400" style={{ fontSize: '14px' }}>
                  {savings.totalSavings > 0 ? ((Math.abs(savings.budgetEfficiency) / savings.totalSavings) * 100).toFixed(1) : 0}%
                </td>
                <td className="py-4">
                  <span className={`rounded-full px-2 py-1 ${savings.budgetEfficiency >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`} style={{ fontSize: '11px', fontWeight: 600 }}>
                    {savings.budgetEfficiency >= 0 ? 'Positive' : 'Negative'}
                  </span>
                </td>
              </tr>

              {/* Total */}
              <tr>
                <td className="pt-4 text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 700 }}>
                  Total Savings
                </td>
                <td className="pt-4 text-right text-[#2BBBEF]" style={{ fontSize: '18px', fontWeight: 700 }}>
                  {formatCurrency(savings.totalSavings)}
                </td>
                <td className="pt-4 text-right text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                  100%
                </td>
                <td className="pt-4">
                  <span className="rounded-full bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] px-3 py-1 text-white" style={{ fontSize: '11px', fontWeight: 600 }}>
                    Excellent
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 dark:border-white/10 dark:from-[#0C0F2C] dark:to-[#161A3A]">
        <h3 className="mb-4 text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
          Value Delivered
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2BBBEF]/10">
              <Zap className="h-5 w-5 text-[#2BBBEF]" />
            </div>
            <div>
              <h4 className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                AI-Powered Optimization
              </h4>
              <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
                Intelligent estimation reduces over-scoping and improves accuracy by {savings.aiVerificationSavings > 0 ? ((savings.aiVerificationSavings / savings.originalEstimate) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4AFFA8]/10">
              <Target className="h-5 w-5 text-[#4AFFA8]" />
            </div>
            <div>
              <h4 className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                Cost-Effective Development
              </h4>
              <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
                In-house development saves {savings.vendorRateSavings > 0 ? formatCurrency(savings.vendorRateSavings) : '$0'} compared to external vendors
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                Efficient Execution
              </h4>
              <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
                {savings.budgetEfficiency >= 0 
                  ? `Project delivered ${formatCurrency(savings.budgetEfficiency)} under budget` 
                  : `Active project monitoring for cost control`}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2BBBEF]/10 to-[#4AFFA8]/10">
              <Award className="h-5 w-5 text-[#2BBBEF]" />
            </div>
            <div>
              <h4 className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                Overall Efficiency Gain
              </h4>
              <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
                {savings.efficiencyPercentage.toFixed(1)}% total efficiency improvement over traditional estimation methods
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

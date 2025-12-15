import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import type { Task } from './TaskTable';
import type { Settings } from '../App';

interface AIInsightsCardProps {
  tasks: Task[];
  settings: Settings;
}

export function AIInsightsCard({ tasks, settings }: AIInsightsCardProps) {
  const calculatePCI = (task: Task | null): number => {
    if (!task) return 0;
    const pci = (task.ISR * task.CF * task.UXI) + 
                (task.RCF * task.AEP - task.L) + 
                (task.MLW * task.CGW * task.RF) + 
                (task.S * task.GLRI);
    return Math.max(0, pci);
  };

  const calculateAAS = (task: Task | null): number => {
    if (!task) return 0;
    const pci = calculatePCI(task);
    if (pci === 0) return 0;
    return (task.aiVerifiedUnits / pci) * 100;
  };

  // Filter out null/undefined tasks before calculations
  const validTasks = tasks.filter(task => task != null);

  // AI-powered insights
  const insights: Array<{ type: 'success' | 'warning' | 'info'; message: string; icon: any }> = [];

  // Analyze AAS scores
  const lowAasTasks = validTasks.filter(task => {
    const aas = calculateAAS(task);
    return aas < 85 && aas > 0;
  });

  if (lowAasTasks.length === 0 && validTasks.length > 0) {
    insights.push({
      type: 'success',
      message: `All ${validTasks.length} tasks have healthy AAS scores above 85%. Your estimates are well-calibrated.`,
      icon: CheckCircle,
    });
  } else if (lowAasTasks.length > 0) {
    insights.push({
      type: 'warning',
      message: `${lowAasTasks.length} task(s) have AAS below 85%. Consider reviewing verified units or complexity factors.`,
      icon: AlertTriangle,
    });
  }

  // Analyze cost efficiency
  const avgPCI = validTasks.reduce((sum, task) => sum + calculatePCI(task), 0) / validTasks.length;
  const highCostTasks = validTasks.filter(task => calculatePCI(task) > avgPCI * 1.5);
  
  if (highCostTasks.length > 0) {
    insights.push({
      type: 'info',
      message: `${highCostTasks.length} task(s) are 50% above average complexity. Review if RF, CF, or S factors can be optimized.`,
      icon: TrendingUp,
    });
  }

  // Analyze risk factors
  const highRiskTasks = validTasks.filter(task => task.RCF > 1.5 || task.GLRI > 1.7);
  
  if (highRiskTasks.length > 0) {
    insights.push({
      type: 'warning',
      message: `${highRiskTasks.length} task(s) have elevated risk factors (RCF/GLRI). Ensure proper risk mitigation planning.`,
      icon: AlertTriangle,
    });
  }

  // Analyze specialization needs
  const specializedTasks = validTasks.filter(task => task.S > 1.5);
  
  if (specializedTasks.length > 2) {
    insights.push({
      type: 'info',
      message: `${specializedTasks.length} tasks require specialized skills. Consider resource allocation and expert availability.`,
      icon: Brain,
    });
  }

  // Overall project health
  const avgAAS = validTasks.reduce((sum, task) => {
    const aas = calculateAAS(task);
    return sum + (isNaN(aas) ? 0 : aas);
  }, 0) / validTasks.length;

  if (avgAAS >= 90) {
    insights.push({
      type: 'success',
      message: `Excellent project health with ${avgAAS.toFixed(1)}% average AAS. Estimates show high confidence and accuracy.`,
      icon: CheckCircle,
    });
  }

  const colors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      iconColor: 'text-green-600',
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      iconColor: 'text-orange-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-600',
    },
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[1600px] px-6 pb-6">
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-[#010029] to-[#2BBBEF] p-6 text-white shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3>AI-Powered Insights</h3>
            <p className="text-white/80" style={{ fontSize: '14px' }}>
              Real-time intelligence and recommendations for your project
            </p>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            const color = colors[insight.type];
            
            return (
              <div
                key={index}
                className={`flex items-start gap-3 rounded-lg border ${color.border} ${color.bg} p-4`}
              >
                <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${color.iconColor}`} />
                <p className={`${color.text}`} style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  {insight.message}
                </p>
              </div>
            );
          })}
        </div>

        {/* AI Status */}
        <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-4">
          <div className="flex items-center gap-2 text-white/70" style={{ fontSize: '13px' }}>
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#4AFFA8]"></div>
            AI analysis active • Updates in real-time
          </div>
          <div className="text-white/70" style={{ fontSize: '13px' }}>
            {validTasks.length} tasks analyzed
          </div>
        </div>
      </div>
    </div>
  );
}
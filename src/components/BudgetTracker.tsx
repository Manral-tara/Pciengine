import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Clock, CheckCircle2, PlayCircle, PauseCircle, Calendar, Edit2, Save, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { Task } from './TaskTable';
import type { Settings } from '../App';

interface BudgetTrackerProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  settings: Settings;
}

export function BudgetTracker({ tasks, onTasksChange, settings }: BudgetTrackerProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [tempActualHours, setTempActualHours] = useState<number>(0);
  const [tempProgress, setTempProgress] = useState<number>(0);
  const [tempStatus, setTempStatus] = useState<Task['status']>('not-started');

  // Calculate total planned hours and cost
  const calculatePlannedHours = (task: Task): number => {
    const pci = (task.ISR * task.CF * task.UXI) + 
                (task.RCF * task.AEP - task.L) + 
                (task.MLW * task.CGW * task.RF) + 
                (task.S * task.GLRI);
    const aas = task.aiVerifiedUnits / Math.max(pci, 1) * 100;
    const verifiedUnits = (aas / 100) * Math.max(pci, 0);
    return verifiedUnits; // Treating verified units as hours
  };

  const calculatePlannedCost = (task: Task): number => {
    return calculatePlannedHours(task) * settings.hourlyRate;
  };

  const calculateActualCost = (task: Task): number => {
    return (task.actualHours || 0) * settings.hourlyRate;
  };

  const calculateVariance = (task: Task): number => {
    return calculateActualCost(task) - calculatePlannedCost(task);
  };

  const calculateVariancePercentage = (task: Task): number => {
    const planned = calculatePlannedCost(task);
    if (planned === 0) return 0;
    return (calculateVariance(task) / planned) * 100;
  };

  // Project totals
  const totalPlannedHours = tasks.reduce((sum, task) => sum + calculatePlannedHours(task), 0);
  const totalPlannedCost = tasks.reduce((sum, task) => sum + calculatePlannedCost(task), 0);
  const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
  const totalActualCost = tasks.reduce((sum, task) => sum + calculateActualCost(task), 0);
  const totalVariance = totalActualCost - totalPlannedCost;
  const totalVariancePercentage = totalPlannedCost > 0 ? (totalVariance / totalPlannedCost) * 100 : 0;

  // Calculate average progress
  const tasksWithProgress = tasks.filter(t => t.progressPercentage !== undefined && t.progressPercentage > 0);
  const averageProgress = tasksWithProgress.length > 0
    ? tasksWithProgress.reduce((sum, task) => sum + (task.progressPercentage || 0), 0) / tasksWithProgress.length
    : 0;

  // Burn rate data (simulated - in real app, would track over time)
  const generateBurnRateData = () => {
    const data = [];
    const completedTasks = tasks.filter(t => t.status === 'completed' || (t.progressPercentage || 0) === 100);
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress' && (t.progressPercentage || 0) > 0);
    
    // Simulate weekly burn rate
    let cumulativePlanned = 0;
    let cumulativeActual = 0;
    
    for (let week = 0; week <= 8; week++) {
      const percentComplete = week / 8;
      cumulativePlanned = totalPlannedCost * percentComplete;
      
      // Simulate actual spending based on completed and in-progress tasks
      if (week <= 4) {
        cumulativeActual = totalActualCost * (percentComplete * 0.8); // Slower start
      } else {
        cumulativeActual = totalActualCost * percentComplete;
      }
      
      data.push({
        week: `Week ${week}`,
        planned: Math.round(cumulativePlanned),
        actual: Math.round(cumulativeActual > totalActualCost ? totalActualCost : cumulativeActual),
      });
    }
    
    return data;
  };

  const burnRateData = generateBurnRateData();

  // Budget health status
  const getBudgetHealthStatus = (): { status: 'on-track' | 'warning' | 'critical'; color: string; label: string } => {
    if (totalVariancePercentage <= 5) {
      return { status: 'on-track', color: 'green', label: 'On Track' };
    } else if (totalVariancePercentage <= 15) {
      return { status: 'warning', color: 'orange', label: 'Warning' };
    } else {
      return { status: 'critical', color: 'red', label: 'Critical' };
    }
  };

  const budgetHealth = getBudgetHealthStatus();

  // Forecast completion cost
  const forecastFinalCost = (): number => {
    if (averageProgress === 0) return totalPlannedCost;
    const burnRate = totalActualCost / (averageProgress / 100);
    return burnRate;
  };

  const forecast = forecastFinalCost();
  const forecastVariance = forecast - totalPlannedCost;
  const forecastVariancePercentage = totalPlannedCost > 0 ? (forecastVariance / totalPlannedCost) * 100 : 0;

  // Edit handlers
  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTempActualHours(task.actualHours || 0);
    setTempProgress(task.progressPercentage || 0);
    setTempStatus(task.status || 'not-started');
  };

  const handleSaveTask = (taskId: string) => {
    const updatedTasks = tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            actualHours: tempActualHours,
            progressPercentage: tempProgress,
            status: tempStatus,
          }
        : t
    );
    onTasksChange(updatedTasks);
    setEditingTaskId(null);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  const getStatusIcon = (status?: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'in-progress':
        return <PlayCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'on-hold':
        return <PauseCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status?: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30';
      case 'on-hold':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-900/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-gray-900 dark:text-white" style={{ fontSize: '24px', fontWeight: 700 }}>
            Budget Tracking
          </h2>
          <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>
            Monitor actual vs planned spending, track burn rate, and forecast project completion costs
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Planned Budget */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#161A3A]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
              {totalPlannedHours.toFixed(1)} hrs
            </span>
          </div>
          <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 500 }}>
            Planned Budget
          </div>
          <div className="text-gray-900 dark:text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
            ${totalPlannedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Actual Spent */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#161A3A]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
              {totalActualHours.toFixed(1)} hrs
            </span>
          </div>
          <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 500 }}>
            Actual Spent
          </div>
          <div className="text-gray-900 dark:text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
            ${totalActualCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Variance */}
        <div className={`rounded-xl border p-5 ${
          totalVariance <= 0
            ? 'border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10'
            : budgetHealth.status === 'warning'
            ? 'border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-900/10'
            : 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10'
        }`}>
          <div className="mb-3 flex items-center justify-between">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              totalVariance <= 0
                ? 'bg-green-100 dark:bg-green-900/30'
                : budgetHealth.status === 'warning'
                ? 'bg-orange-100 dark:bg-orange-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {totalVariance <= 0 ? (
                <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
              totalVariance <= 0
                ? 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                : budgetHealth.status === 'warning'
                ? 'bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
                : 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300'
            }`}>
              {totalVariance <= 0 ? 'Under' : 'Over'} {Math.abs(totalVariancePercentage).toFixed(1)}%
            </span>
          </div>
          <div className={`${
            totalVariance <= 0
              ? 'text-green-700 dark:text-green-400'
              : budgetHealth.status === 'warning'
              ? 'text-orange-700 dark:text-orange-400'
              : 'text-red-700 dark:text-red-400'
          }`} style={{ fontSize: '12px', fontWeight: 500 }}>
            Budget Variance
          </div>
          <div className={`${
            totalVariance <= 0
              ? 'text-green-900 dark:text-green-300'
              : budgetHealth.status === 'warning'
              ? 'text-orange-900 dark:text-orange-300'
              : 'text-red-900 dark:text-red-300'
          }`} style={{ fontSize: '28px', fontWeight: 700 }}>
            {totalVariance <= 0 ? '-' : '+'}${Math.abs(totalVariance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Forecast */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#161A3A]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
              forecastVariance <= 0
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {forecastVariance <= 0 ? '' : '+'}{forecastVariancePercentage.toFixed(1)}%
            </span>
          </div>
          <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 500 }}>
            Forecast at Completion
          </div>
          <div className="text-gray-900 dark:text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
            ${forecast.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Budget Health Alert */}
      {budgetHealth.status !== 'on-track' && (
        <div className={`rounded-xl border p-4 ${
          budgetHealth.status === 'warning'
            ? 'border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-900/10'
            : 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
              budgetHealth.status === 'warning'
                ? 'bg-orange-200 dark:bg-orange-900/50'
                : 'bg-red-200 dark:bg-red-900/50'
            }`}>
              <AlertCircle className={`h-4 w-4 ${
                budgetHealth.status === 'warning'
                  ? 'text-orange-700 dark:text-orange-400'
                  : 'text-red-700 dark:text-red-400'
              }`} />
            </div>
            <div>
              <div className={`mb-1 ${
                budgetHealth.status === 'warning'
                  ? 'text-orange-900 dark:text-orange-300'
                  : 'text-red-900 dark:text-red-300'
              }`} style={{ fontSize: '14px', fontWeight: 600 }}>
                Budget {budgetHealth.label}
              </div>
              <div className={`${
                budgetHealth.status === 'warning'
                  ? 'text-orange-700 dark:text-orange-400'
                  : 'text-red-700 dark:text-red-400'
              }`} style={{ fontSize: '13px' }}>
                {budgetHealth.status === 'warning'
                  ? `Project is trending ${totalVariancePercentage.toFixed(1)}% over budget. Consider reviewing task estimates and actual time logging.`
                  : `Project is significantly over budget (${totalVariancePercentage.toFixed(1)}%). Immediate action required to bring costs under control.`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Burn Rate Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#161A3A]">
        <div className="mb-6">
          <h3 className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
            Budget Burn Rate
          </h3>
          <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '13px' }}>
            Cumulative spending over time vs planned budget
          </p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={burnRateData}>
            <defs>
              <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2BBBEF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2BBBEF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4AFFA8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4AFFA8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              dataKey="week" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />
            <Legend wrapperStyle={{ fontSize: '13px' }} />
            <Area
              type="monotone"
              dataKey="planned"
              stroke="#2BBBEF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#plannedGradient)"
              name="Planned"
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#4AFFA8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#actualGradient)"
              name="Actual"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Task-Level Budget Breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-white/10 dark:bg-[#161A3A]">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 dark:border-white/10 dark:from-[#0C0F2C] dark:to-[#161A3A]">
          <h3 className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
            Task Budget Breakdown
          </h3>
          <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '13px' }}>
            Log actual hours and track progress for each task
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-[#0C0F2C]">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600 dark:text-gray-400" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Task
                </th>
                <th className="px-6 py-3 text-left text-gray-600 dark:text-gray-400" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Status
                </th>
                <th className="px-6 py-3 text-right text-gray-600 dark:text-gray-400" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Progress
                </th>
                <th className="px-6 py-3 text-right text-gray-600 dark:text-gray-400" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Planned Hrs
                </th>
                <th className="px-6 py-3 text-right text-gray-600 dark:text-gray-400" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Actual Hrs
                </th>
                <th className="px-6 py-3 text-right text-gray-600 dark:text-gray-400" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Planned Cost
                </th>
                <th className="px-6 py-3 text-right text-gray-600 dark:text-gray-400" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Actual Cost
                </th>
                <th className="px-6 py-3 text-right text-gray-600 dark:text-gray-400" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Variance
                </th>
                <th className="px-6 py-3 text-center text-gray-600 dark:text-gray-400" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {tasks.map((task, index) => {
                const plannedHours = calculatePlannedHours(task);
                const plannedCost = calculatePlannedCost(task);
                const actualCost = calculateActualCost(task);
                const variance = calculateVariance(task);
                const variancePercentage = calculateVariancePercentage(task);
                const isEditing = editingTaskId === task.id;

                return (
                  <tr key={task.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-[#0C0F2C]/50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-400 dark:text-gray-500" style={{ fontSize: '10px', fontFamily: 'monospace' }}>
                          {task.referenceNumber || `TASK-${String(index + 1).padStart(3, '0')}`}
                        </span>
                        <span className="text-gray-900 dark:text-white" style={{ fontSize: '13px', fontWeight: 500 }}>
                          {task.taskName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <select
                          value={tempStatus}
                          onChange={(e) => setTempStatus(e.target.value as Task['status'])}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-gray-800 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                          style={{ fontSize: '12px' }}
                        >
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="on-hold">On Hold</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${getStatusBadgeColor(task.status)}`}>
                          {getStatusIcon(task.status)}
                          <span style={{ fontSize: '11px', fontWeight: 500 }}>
                            {task.status ? task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not Started'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            value={tempProgress}
                            onChange={(e) => setTempProgress(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                            className="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1 text-right text-gray-800 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                            style={{ fontSize: '12px' }}
                            min="0"
                            max="100"
                          />
                          <span className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>%</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-[#0C0F2C]">
                            <div
                              className="h-full bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] transition-all"
                              style={{ width: `${task.progressPercentage || 0}%` }}
                            />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                            {(task.progressPercentage || 0).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '13px' }}>
                        {plannedHours.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempActualHours}
                          onChange={(e) => setTempActualHours(parseFloat(e.target.value) || 0)}
                          className="w-24 rounded-lg border border-gray-200 bg-white px-2 py-1 text-right text-gray-800 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                          style={{ fontSize: '13px' }}
                          step="0.5"
                        />
                      ) : (
                        <span className="text-gray-900 dark:text-white" style={{ fontSize: '13px', fontWeight: 500 }}>
                          {(task.actualHours || 0).toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '13px' }}>
                        ${plannedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-gray-900 dark:text-white" style={{ fontSize: '13px', fontWeight: 500 }}>
                        ${actualCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`${
                          variance <= 0
                            ? 'text-green-600 dark:text-green-400'
                            : Math.abs(variancePercentage) <= 10
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-red-600 dark:text-red-400'
                        }`} style={{ fontSize: '13px', fontWeight: 600 }}>
                          {variance <= 0 ? '-' : '+'}${Math.abs(variance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {variance !== 0 && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            variance <= 0
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : Math.abs(variancePercentage) <= 10
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {variancePercentage.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveTask(task.id)}
                              className="flex items-center justify-center rounded-md p-1.5 text-green-600 transition-all hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                              title="Save"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center justify-center rounded-md p-1.5 text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEditTask(task)}
                            className="flex items-center justify-center rounded-md p-1.5 text-[#2BBBEF] transition-all hover:bg-[#2BBBEF]/10"
                            title="Edit actual hours and progress"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-gray-300 bg-gray-50 dark:border-white/20 dark:bg-[#0C0F2C]">
              <tr>
                <td colSpan={3} className="px-6 py-4">
                  <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                    Project Totals
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                    {totalPlannedHours.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                    {totalActualHours.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                    ${totalPlannedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                    ${totalActualCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`${
                    totalVariance <= 0
                      ? 'text-green-600 dark:text-green-400'
                      : budgetHealth.status === 'warning'
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-red-600 dark:text-red-400'
                  }`} style={{ fontSize: '14px', fontWeight: 700 }}>
                    {totalVariance <= 0 ? '-' : '+'}${Math.abs(totalVariance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

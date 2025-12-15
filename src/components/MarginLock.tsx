import { useState, useEffect } from 'react';
import { X, Lock, Unlock, TrendingUp, DollarSign, AlertTriangle, Check, Edit2, Shield } from 'lucide-react';
import type { Task } from './TaskTable';
import type { Project } from './ProjectManager';

interface MarginLockProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  tasks: Task[];
  onSave: (marginData: MarginData) => void;
  existingMarginData?: MarginData;
}

export interface MarginData {
  projectId: string;
  isLocked: boolean;
  internalRate: number;
  vendorRate: number;
  salesRate: number;
  lockedMarginPercent: number;
  lockedMarginAmount: number;
  minMarginPercent: number;
  taskVendorRates: Record<string, number>; // taskId -> vendor rate
  notes: string;
}

export function MarginLock({ isOpen, onClose, project, tasks, onSave, existingMarginData }: MarginLockProps) {
  const [marginData, setMarginData] = useState<MarginData>({
    projectId: project?.id || '',
    isLocked: false,
    internalRate: 66,
    vendorRate: 0,
    salesRate: 99,
    lockedMarginPercent: 35,
    lockedMarginAmount: 0,
    minMarginPercent: 20,
    taskVendorRates: {},
    notes: '',
  });

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [tempVendorRate, setTempVendorRate] = useState<string>('');

  useEffect(() => {
    if (existingMarginData) {
      setMarginData(existingMarginData);
    }
  }, [existingMarginData]);

  // Calculate project totals
  const calculations = calculateProjectMargins(tasks, marginData);

  const handleSave = () => {
    onSave(marginData);
    onClose();
  };

  const handleTaskVendorRate = (taskId: string, rate: number) => {
    setMarginData({
      ...marginData,
      taskVendorRates: {
        ...marginData.taskVendorRates,
        [taskId]: rate,
      },
    });
  };

  const handleLockMargin = () => {
    setMarginData({
      ...marginData,
      isLocked: !marginData.isLocked,
      lockedMarginAmount: calculations.totalMargin,
      lockedMarginPercent: calculations.marginPercent,
    });
  };

  const getMarginHealth = (percent: number): { color: string; label: string; icon: any } => {
    if (percent >= 40) return { color: 'text-green-600', label: 'Excellent', icon: Check };
    if (percent >= 30) return { color: 'text-blue-600', label: 'Good', icon: TrendingUp };
    if (percent >= 20) return { color: 'text-yellow-600', label: 'Fair', icon: AlertTriangle };
    return { color: 'text-red-600', label: 'At Risk', icon: AlertTriangle };
  };

  const marginHealth = getMarginHealth(calculations.marginPercent);
  const isMarginAtRisk = calculations.marginPercent < marginData.minMarginPercent;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0C0F2C]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-[#2BBBEF]/5 to-[#4AFFA8]/5 p-6 dark:border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 blur-xl" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 shadow-lg">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="mb-2 text-gray-900 dark:text-white" style={{ fontSize: '26px', fontWeight: 700 }}>
                    Margin Lock & Profit Protection
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>
                    {project?.name || 'Current Project'} • Compare rates, lock margins, and protect profitability
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#161A3A] dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {/* Margin Overview Cards */}
            <div className="mb-6 grid grid-cols-4 gap-4">
              {/* Internal Cost */}
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-4 dark:border-white/10 dark:from-blue-500/10 dark:to-[#0C0F2C]">
                <p className="mb-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>Internal Cost</p>
                <p className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
                  ${calculations.totalInternalCost.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '11px' }}>
                  {calculations.totalHours.toFixed(1)} hrs @ ${marginData.internalRate}/hr
                </p>
              </div>

              {/* Vendor Cost */}
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-4 dark:border-white/10 dark:from-purple-500/10 dark:to-[#0C0F2C]">
                <p className="mb-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>Vendor Cost</p>
                <p className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
                  ${calculations.totalVendorCost.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '11px' }}>
                  Average ${calculations.avgVendorRate.toFixed(0)}/hr
                </p>
              </div>

              {/* Sales Price */}
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-4 dark:border-white/10 dark:from-green-500/10 dark:to-[#0C0F2C]">
                <p className="mb-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>Sales Price</p>
                <p className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
                  ${calculations.totalSalesPrice.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '11px' }}>
                  {calculations.totalHours.toFixed(1)} hrs @ ${marginData.salesRate}/hr
                </p>
              </div>

              {/* Margin */}
              <div className={`rounded-xl border-2 ${isMarginAtRisk ? 'border-red-500 bg-gradient-to-br from-red-50 to-white dark:from-red-500/10 dark:to-[#0C0F2C]' : 'border-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-500/10 dark:to-[#0C0F2C]'} p-4`}>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>Profit Margin</p>
                  {marginData.isLocked && <Lock className="h-3.5 w-3.5 text-green-600" />}
                </div>
                <p className={`mb-1 ${marginHealth.color}`} style={{ fontSize: '28px', fontWeight: 700 }}>
                  ${calculations.totalMargin.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <p className={`${marginHealth.color}`} style={{ fontSize: '11px', fontWeight: 600 }}>
                    {calculations.marginPercent.toFixed(1)}% • {marginHealth.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Rate Settings */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-[#161A3A]">
              <h3 className="mb-4 text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                Rate Configuration
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600 }}>
                    Internal Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    value={marginData.internalRate}
                    onChange={(e) => setMarginData({ ...marginData, internalRate: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600 }}>
                    Default Vendor Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    value={marginData.vendorRate}
                    onChange={(e) => setMarginData({ ...marginData, vendorRate: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600 }}>
                    Sales Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    value={marginData.salesRate}
                    onChange={(e) => setMarginData({ ...marginData, salesRate: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                    style={{ fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>

            {/* Margin Protection Settings */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-[#161A3A]">
              <h3 className="mb-4 text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                Margin Protection
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600 }}>
                    Minimum Margin Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={marginData.minMarginPercent}
                    onChange={(e) => setMarginData({ ...marginData, minMarginPercent: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                    style={{ fontSize: '14px' }}
                  />
                  <p className="mt-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>
                    Alert when margin falls below this percentage
                  </p>
                </div>
                <div>
                  <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600 }}>
                    Lock Margin
                  </label>
                  <button
                    onClick={handleLockMargin}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 transition-all ${
                      marginData.isLocked
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-gray-300'
                    }`}
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    {marginData.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    {marginData.isLocked ? 'Margin Locked' : 'Lock Current Margin'}
                  </button>
                  {marginData.isLocked && (
                    <p className="mt-1 text-green-600 dark:text-green-400" style={{ fontSize: '11px' }}>
                      Locked at {marginData.lockedMarginPercent.toFixed(1)}% (${marginData.lockedMarginAmount.toLocaleString()})
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Task-Level Vendor Rates */}
            <div className="mb-6">
              <h3 className="mb-4 text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                Task-Level Vendor Rates
              </h3>
              <div className="rounded-xl border border-gray-200 dark:border-white/10">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-[#161A3A]">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600 }}>
                          Task
                        </th>
                        <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600 }}>
                          Hours
                        </th>
                        <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600 }}>
                          Internal Cost
                        </th>
                        <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600 }}>
                          Vendor Rate
                        </th>
                        <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600 }}>
                          Vendor Cost
                        </th>
                        <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600 }}>
                          Sales Price
                        </th>
                        <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600 }}>
                          Margin
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white dark:divide-white/5 dark:bg-[#0C0F2C]">
                      {tasks.map((task) => {
                        const hours = task.aiVerifiedUnits / marginData.internalRate;
                        const internalCost = hours * marginData.internalRate;
                        const vendorRate = marginData.taskVendorRates[task.id] || marginData.vendorRate;
                        const vendorCost = hours * vendorRate;
                        const salesPrice = hours * marginData.salesRate;
                        const margin = salesPrice - vendorCost;
                        const marginPercent = salesPrice > 0 ? (margin / salesPrice) * 100 : 0;

                        return (
                          <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-[#161A3A]">
                            <td className="px-4 py-3 text-gray-900 dark:text-white" style={{ fontSize: '13px' }}>
                              {task.taskName}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400" style={{ fontSize: '13px' }}>
                              {hours.toFixed(1)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400" style={{ fontSize: '13px' }}>
                              ${internalCost.toFixed(0)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {editingTaskId === task.id ? (
                                <input
                                  type="number"
                                  value={tempVendorRate}
                                  onChange={(e) => setTempVendorRate(e.target.value)}
                                  onBlur={() => {
                                    handleTaskVendorRate(task.id, Number(tempVendorRate));
                                    setEditingTaskId(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleTaskVendorRate(task.id, Number(tempVendorRate));
                                      setEditingTaskId(null);
                                    }
                                  }}
                                  autoFocus
                                  className="w-20 rounded border border-blue-500 bg-white px-2 py-1 text-right text-gray-900 dark:bg-[#161A3A] dark:text-white"
                                  style={{ fontSize: '13px' }}
                                />
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingTaskId(task.id);
                                    setTempVendorRate(String(vendorRate));
                                  }}
                                  className="group flex w-full items-center justify-end gap-1 text-gray-600 hover:text-blue-600 dark:text-gray-400"
                                  style={{ fontSize: '13px' }}
                                >
                                  ${vendorRate}
                                  <Edit2 className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400" style={{ fontSize: '13px' }}>
                              ${vendorCost.toFixed(0)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-900 dark:text-white" style={{ fontSize: '13px', fontWeight: 600 }}>
                              ${salesPrice.toFixed(0)}
                            </td>
                            <td className="px-4 py-3 text-right" style={{ fontSize: '13px' }}>
                              <div className="flex flex-col items-end">
                                <span className={marginPercent >= 30 ? 'text-green-600' : marginPercent >= 20 ? 'text-yellow-600' : 'text-red-600'} style={{ fontWeight: 600 }}>
                                  ${margin.toFixed(0)}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>
                                  {marginPercent.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600 }}>
                Notes
              </label>
              <textarea
                value={marginData.notes}
                onChange={(e) => setMarginData({ ...marginData, notes: e.target.value })}
                placeholder="Add notes about margin assumptions, vendor agreements, or pricing strategies..."
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 bg-gray-50 p-6 dark:border-white/10 dark:bg-[#161A3A]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isMarginAtRisk && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-600 dark:bg-red-500/10">
                    <AlertTriangle className="h-4 w-4" />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      Margin below {marginData.minMarginPercent}% threshold
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-gray-300 dark:hover:bg-[#161A3A]"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 px-8 py-2.5 text-white transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  <Shield className="h-4 w-4" />
                  Save Margin Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to calculate all margins
function calculateProjectMargins(tasks: Task[], marginData: MarginData) {
  let totalHours = 0;
  let totalInternalCost = 0;
  let totalVendorCost = 0;
  let totalSalesPrice = 0;

  tasks.forEach((task) => {
    const hours = task.aiVerifiedUnits / marginData.internalRate;
    const vendorRate = marginData.taskVendorRates[task.id] || marginData.vendorRate;
    
    totalHours += hours;
    totalInternalCost += hours * marginData.internalRate;
    totalVendorCost += hours * vendorRate;
    totalSalesPrice += hours * marginData.salesRate;
  });

  const totalMargin = totalSalesPrice - totalVendorCost;
  const marginPercent = totalSalesPrice > 0 ? (totalMargin / totalSalesPrice) * 100 : 0;
  const avgVendorRate = totalHours > 0 ? totalVendorCost / totalHours : marginData.vendorRate;

  return {
    totalHours,
    totalInternalCost: Math.round(totalInternalCost),
    totalVendorCost: Math.round(totalVendorCost),
    totalSalesPrice: Math.round(totalSalesPrice),
    totalMargin: Math.round(totalMargin),
    marginPercent,
    avgVendorRate,
  };
}

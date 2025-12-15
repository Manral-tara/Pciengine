import { TrendingUp, DollarSign, Clock, Percent, BarChart3, ListOrdered } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Task } from './TaskTable';
import type { Settings } from '../App';

interface SummarySectionProps {
  tasks: Task[];
  settings: Settings;
}

export function SummarySection({ tasks, settings }: SummarySectionProps) {
  const [viewMode, setViewMode] = useState<'numbers' | 'charts'>('numbers');

  const calculatePCI = (task: Task | null): number => {
    if (!task) return 0;
    const pci = (task.ISR * task.CF * task.UXI) + 
                (task.RCF * task.AEP - task.L) + 
                (task.MLW * task.CGW * task.RF) + 
                (task.S * task.GLRI);
    return Math.max(0, pci);
  };

  const calculateVerifiedUnits = (task: Task | null): number => {
    if (!task) return 0;
    const pci = calculatePCI(task);
    if (pci === 0) return 0;
    const aas = (task.aiVerifiedUnits / pci) * 100;
    return (aas / 100) * pci;
  };

  // Filter out null/undefined tasks before calculations
  const validTasks = tasks.filter(task => task != null);

  const totalPCIUnits = validTasks.reduce((sum, task) => sum + calculatePCI(task), 0);
  const totalVerifiedUnits = validTasks.reduce((sum, task) => sum + calculateVerifiedUnits(task), 0);
  const totalHours = totalVerifiedUnits * settings.unitToHourRatio;
  const totalVerifiedCost = totalVerifiedUnits * settings.hourlyRate;
  const effectiveBlendedRate = totalHours > 0 ? totalVerifiedCost / totalHours : 0;

  // Prepare chart data
  const metricsChartData = [
    { name: 'PCI Units', value: totalPCIUnits },
    { name: 'Verified Units', value: totalVerifiedUnits },
    { name: 'Total Hours', value: totalHours },
  ];

  const taskBreakdownData = validTasks.slice(0, 10).map(task => ({
    name: task.taskName.length > 20 ? task.taskName.substring(0, 20) + '...' : task.taskName,
    'PCI Units': calculatePCI(task),
    'Verified Units': calculateVerifiedUnits(task),
    'AAS %': calculatePCI(task) > 0 ? ((task.aiVerifiedUnits / calculatePCI(task)) * 100) : 0,
  }));

  const categoryData = validTasks.reduce((acc, task) => {
    const scopeComplexity = task.ISR * task.CF * task.UXI;
    const riskEngineering = Math.max(0, task.RCF * task.AEP - task.L);
    const multiLayer = task.MLW * task.CGW * task.RF;
    const specialtyGovernance = task.S * task.GLRI;

    return {
      scopeComplexity: acc.scopeComplexity + scopeComplexity,
      riskEngineering: acc.riskEngineering + riskEngineering,
      multiLayer: acc.multiLayer + multiLayer,
      specialtyGovernance: acc.specialtyGovernance + specialtyGovernance,
    };
  }, { scopeComplexity: 0, riskEngineering: 0, multiLayer: 0, specialtyGovernance: 0 });

  const categoryChartData = [
    { name: 'Scope & Complexity', value: categoryData.scopeComplexity },
    { name: 'Risk & Engineering', value: categoryData.riskEngineering },
    { name: 'Multi-Layer Work', value: categoryData.multiLayer },
    { name: 'Specialty & Governance', value: categoryData.specialtyGovernance },
  ];

  const COLORS = ['#2BBBEF', '#4AFFA8', '#010029', '#60A5FA'];

  return (
    <div className="mx-auto max-w-[1600px] px-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-gray-700">Project Summary</h3>
        
        {/* Toggle Button */}
        <div className="flex gap-2 rounded-lg bg-white p-1 shadow-sm">
          <button
            onClick={() => setViewMode('numbers')}
            className={`flex items-center gap-2 rounded px-4 py-2 transition-all ${
              viewMode === 'numbers'
                ? 'bg-[#2BBBEF] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ListOrdered className="h-4 w-4" />
            Numbers
          </button>
          <button
            onClick={() => setViewMode('charts')}
            className={`flex items-center gap-2 rounded px-4 py-2 transition-all ${
              viewMode === 'charts'
                ? 'bg-[#2BBBEF] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Charts
          </button>
        </div>
      </div>
      
      {viewMode === 'numbers' ? (
        // Numbers View
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-gray-500">
              <TrendingUp className="h-4 w-4" />
              Total PCI Units
            </div>
            <div className="text-[#010029]" style={{ fontSize: '24px' }}>{totalPCIUnits.toFixed(2)}</div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-gray-500">
              <TrendingUp className="h-4 w-4" />
              Total Verified Units
            </div>
            <div className="text-[#010029]" style={{ fontSize: '24px' }}>{totalVerifiedUnits.toFixed(2)}</div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-gray-500">
              <Clock className="h-4 w-4" />
              Total Hours
            </div>
            <div className="text-[#010029]" style={{ fontSize: '24px' }}>{totalHours.toFixed(1)} hrs</div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-gray-500">
              <Percent className="h-4 w-4" />
              Effective Blended Rate
            </div>
            <div className="text-[#010029]" style={{ fontSize: '24px' }}>${effectiveBlendedRate.toFixed(2)}/hr</div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] p-6 text-white shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Verified Cost
            </div>
            <div style={{ fontSize: '24px' }}>${totalVerifiedCost.toFixed(2)}</div>
          </div>
        </div>
      ) : (
        // Charts View
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Task Breakdown Chart */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h4 className="mb-4 text-gray-700">Task PCI & Verification</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="PCI Units" fill="#2BBBEF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Verified Units" fill="#4AFFA8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution Pie Chart */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h4 className="mb-4 text-gray-700">Category Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Metrics Bar Chart */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h4 className="mb-4 text-gray-700">Project Metrics Overview</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricsChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={120} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" fill="#2BBBEF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Summary Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h4 className="mb-6 text-gray-700">Cost Summary</h4>
            <div className="space-y-4">
              <div className="rounded-lg bg-gradient-to-r from-[#2BBBEF]/10 to-[#4AFFA8]/10 p-4">
                <div className="mb-1 flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  Total Verified Cost
                </div>
                <div className="text-[#010029]" style={{ fontSize: '32px', fontWeight: 600 }}>
                  ${totalVerifiedCost.toFixed(2)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-1 text-gray-600" style={{ fontSize: '12px' }}>Total Hours</div>
                  <div className="text-[#010029]" style={{ fontSize: '20px' }}>{totalHours.toFixed(1)} hrs</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-1 text-gray-600" style={{ fontSize: '12px' }}>Blended Rate</div>
                  <div className="text-[#010029]" style={{ fontSize: '20px' }}>${effectiveBlendedRate.toFixed(2)}/hr</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-1 text-gray-600" style={{ fontSize: '12px' }}>Total Tasks</div>
                  <div className="text-[#010029]" style={{ fontSize: '20px' }}>{validTasks.length}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-1 text-gray-600" style={{ fontSize: '12px' }}>Avg PCI/Task</div>
                  <div className="text-[#010029]" style={{ fontSize: '20px' }}>
                    {validTasks.length > 0 ? (totalPCIUnits / validTasks.length).toFixed(1) : '0'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
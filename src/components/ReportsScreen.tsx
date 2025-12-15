import { useState, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Filter, TrendingUp, BarChart3, Calendar, AlertCircle, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import * as api from '../services/api';
import type { Settings } from '../App';
import { ProjectSavings } from './ProjectSavings';

interface ReportsScreenProps {
  settings: Settings;
}

export function ReportsScreen({ settings }: ReportsScreenProps) {
  const [reportData, setReportData] = useState<api.ReportData | null>(null);
  const [trendData, setTrendData] = useState<api.TrendData | null>(null);
  const [kpiData, setKPIData] = useState<api.KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'savings'>('overview');

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [trendPeriod, setTrendPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [includeAudit, setIncludeAudit] = useState(true);

  // Task data for savings calculation
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      // Load all report data in parallel
      const [report, trends, kpis] = await Promise.all([
        api.generateReport({
          startDate,
          endDate,
          status: statusFilter || undefined,
          includeAudit,
        }),
        api.getTrends(trendPeriod),
        api.getKPIs(),
      ]);

      setReportData(report);
      setTrendData(trends);
      setKPIData(kpis);
    } catch (error: any) {
      console.error('Failed to load report data:', error);
      setError(error?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyFilters() {
    await loadData();
  }

  async function handleExport(format: string) {
    try {
      const result = await api.exportReport(format, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (format === 'csv') {
        // Download CSV
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      alert(`Report exported as ${format}!`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report');
    }
  }

  const COLORS = ['#2BBBEF', '#4AFFA8', '#010029', '#60A5FA'];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2BBBEF] border-t-transparent"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  // Show error state if data failed to load
  if (!reportData || !trendData || !kpiData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div>
            <h2 className="text-[#010029] mb-2">Failed to Load Report Data</h2>
            <p className="text-gray-600 mb-2">
              {error || 'Unable to generate reports. This may be because:'}
            </p>
            {!error && (
              <ul className="text-gray-500 mb-4 text-left list-disc list-inside" style={{ fontSize: '14px' }}>
                <li>No tasks have been saved yet</li>
                <li>You need to sign in to view reports</li>
                <li>There was a connection error</li>
              </ul>
            )}
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => loadData()}
                className="rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-4 py-2 text-white transition-opacity hover:opacity-90"
              >
                Retry
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categoryData = reportData ? [
    { name: 'Scope & Complexity', value: reportData.categoryDistribution.scopeComplexity },
    { name: 'Risk & Engineering', value: reportData.categoryDistribution.riskEngineering },
    { name: 'Multi-Layer Work', value: reportData.categoryDistribution.multiLayer },
    { name: 'Specialty & Governance', value: reportData.categoryDistribution.specialtyGovernance },
  ] : [];

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-[#2BBBEF]" />
          <h1 className="text-[#010029]">Reports & Analytics</h1>
        </div>
        <p className="text-gray-500">
          Comprehensive KPI tracking, trend analysis, and data export capabilities
        </p>
      </div>

      {/* Filters & Export Section */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-[#2BBBEF]" />
          <h3 className="text-[#010029]">Filters & Export</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          {/* Date Filters */}
          <div>
            <label className="mb-1 block text-gray-600" style={{ fontSize: '13px' }}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-[#2BBBEF] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-gray-600" style={{ fontSize: '13px' }}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-[#2BBBEF] focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="mb-1 block text-gray-600" style={{ fontSize: '13px' }}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-[#2BBBEF] focus:outline-none"
            >
              <option value="">All</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Trend Period */}
          <div>
            <label className="mb-1 block text-gray-600" style={{ fontSize: '13px' }}>Trend Period</label>
            <select
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(e.target.value as 'week' | 'month' | 'quarter')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-[#2BBBEF] focus:outline-none"
            >
              <option value="week">7 Days</option>
              <option value="month">30 Days</option>
              <option value="quarter">90 Days</option>
            </select>
          </div>

          {/* Include Audit */}
          <div className="flex items-end">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeAudit}
                onChange={(e) => setIncludeAudit(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#2BBBEF] focus:ring-[#2BBBEF]"
              />
              <span className="text-gray-600" style={{ fontSize: '13px' }}>Include Audit</span>
            </label>
          </div>

          {/* Apply Button */}
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              className="w-full rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-4 py-2 text-white transition-opacity hover:opacity-90"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="mt-4 flex gap-3 border-t border-gray-200 pt-4">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 transition-colors hover:bg-gray-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => alert('PDF export coming soon!')}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 transition-colors hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      {kpiData && (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-1 text-gray-500" style={{ fontSize: '13px' }}>Total Tasks</div>
            <div className="text-[#010029]">{kpiData.kpis.totalTasks}</div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-1 text-gray-500" style={{ fontSize: '13px' }}>Total PCI Units</div>
            <div className="text-[#010029]">{kpiData.kpis.totalPCI.toFixed(2)}</div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-1 text-gray-500" style={{ fontSize: '13px' }}>Avg AAS</div>
            <div className={kpiData.kpis.averageAAS >= 85 ? 'text-green-600' : 'text-red-600'}>
              {kpiData.kpis.averageAAS.toFixed(1)}%
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-1 text-gray-500" style={{ fontSize: '13px' }}>Approval Rate</div>
            <div className="text-[#010029]">{kpiData.kpis.approvalRate.toFixed(1)}%</div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-1 text-gray-500" style={{ fontSize: '13px' }}>Low AAS Count</div>
            <div className={kpiData.kpis.totalLowAAS > 0 ? 'text-red-600' : 'text-green-600'}>
              {kpiData.kpis.totalLowAAS}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-1 text-gray-500" style={{ fontSize: '13px' }}>Open Flags</div>
            <div className={kpiData.kpis.openFlags > 0 ? 'text-orange-600' : 'text-green-600'}>
              {kpiData.kpis.openFlags}
            </div>
          </div>
        </div>
      )}

      {/* Audit Metrics (if included) */}
      {reportData?.auditMetrics && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] p-6 text-white">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <h2>Audit Activity Summary</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <div className="mb-1 opacity-90" style={{ fontSize: '13px' }}>Total Logs</div>
              <div style={{ fontSize: '28px' }}>{reportData.auditMetrics.totalLogs}</div>
            </div>
            <div>
              <div className="mb-1 opacity-90" style={{ fontSize: '13px' }}>Total Flags</div>
              <div style={{ fontSize: '28px' }}>{reportData.auditMetrics.totalFlags}</div>
            </div>
            <div>
              <div className="mb-1 opacity-90" style={{ fontSize: '13px' }}>Open Flags</div>
              <div style={{ fontSize: '28px' }}>{reportData.auditMetrics.openFlags}</div>
            </div>
            <div>
              <div className="mb-1 opacity-90" style={{ fontSize: '13px' }}>Resolved Flags</div>
              <div style={{ fontSize: '28px' }}>{reportData.auditMetrics.resolvedFlags}</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="space-y-6">
        {/* Trend Analysis */}
        {trendData && trendData.trends.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#2BBBEF]" />
                <h2 className="text-[#010029]">AAS Trend Analysis</h2>
              </div>
              <span className="text-gray-500" style={{ fontSize: '13px' }}>
                Last {trendPeriod === 'week' ? '7 days' : trendPeriod === 'month' ? '30 days' : '90 days'}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData.trends}>
                <defs>
                  <linearGradient id="colorAAS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2BBBEF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2BBBEF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="period" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="aas"
                  stroke="#2BBBEF"
                  fillOpacity={1}
                  fill="url(#colorAAS)"
                  name="AAS %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* PCI vs Verified + Audit Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Task Volume Trend */}
          {trendData && trendData.trends.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-[#010029]">Task Volume & Audit Activity</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="period" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="tasks"
                    stroke="#2BBBEF"
                    strokeWidth={3}
                    name="Tasks"
                    dot={{ fill: '#2BBBEF', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="auditActivity"
                    stroke="#4AFFA8"
                    strokeWidth={3}
                    name="Audit Activity"
                    dot={{ fill: '#4AFFA8', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Distribution */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-[#010029]">PCI Distribution by Category</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        {reportData && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-[#010029]">Approval Status Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { status: 'Approved', count: reportData.summary.approvedTasks },
                  { status: 'Rejected', count: reportData.summary.rejectedTasks },
                  { status: 'Pending', count: reportData.summary.pendingTasks },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="status" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#2BBBEF" name="Tasks" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Detailed Task Breakdown Table */}
        {reportData && reportData.taskBreakdown.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-[#010029]">Detailed Task Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-gray-600" style={{ fontSize: '13px' }}>Task Name</th>
                    <th className="px-4 py-3 text-left text-gray-600" style={{ fontSize: '13px' }}>PCI Units</th>
                    <th className="px-4 py-3 text-left text-gray-600" style={{ fontSize: '13px' }}>AI Verified</th>
                    <th className="px-4 py-3 text-left text-gray-600" style={{ fontSize: '13px' }}>AAS %</th>
                    <th className="px-4 py-3 text-left text-gray-600" style={{ fontSize: '13px' }}>Verified Cost</th>
                    <th className="px-4 py-3 text-left text-gray-600" style={{ fontSize: '13px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.taskBreakdown.map((task) => {
                    const hasLowAAS = task.aas < 85 && task.aas > 0;
                    const verifiedCost = task.verifiedUnits * settings.hourlyRate;

                    return (
                      <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">{task.taskName}</td>
                        <td className="px-4 py-3">{task.pci.toFixed(2)}</td>
                        <td className="px-4 py-3">{task.aiVerifiedUnits.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={hasLowAAS ? 'text-red-600' : 'text-green-600'}>
                            {task.aas.toFixed(1)}%
                            {hasLowAAS && <AlertCircle className="ml-1 inline h-3 w-3" />}
                          </span>
                        </td>
                        <td className="px-4 py-3">${verifiedCost.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          {task.auditStatus === 'approved' && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-green-700" style={{ fontSize: '12px' }}>
                              Approved
                            </span>
                          )}
                          {task.auditStatus === 'rejected' && (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-red-700" style={{ fontSize: '12px' }}>
                              Rejected
                            </span>
                          )}
                          {task.auditStatus === 'pending' && (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700" style={{ fontSize: '12px' }}>
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Report Metadata */}
      {reportData && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-gray-500" style={{ fontSize: '13px' }}>
          Report generated on {new Date(reportData.generatedAt).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )}
    </div>
  );
}
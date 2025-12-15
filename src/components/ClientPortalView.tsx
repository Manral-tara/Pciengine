import { useState, useEffect } from 'react';
import { Lock, Eye, FileText, DollarSign, BarChart3, CheckCircle, Download, X, Shield } from 'lucide-react';
import type { Task } from './TaskTable';
import type { Settings } from '../App';
import * as api from '../services/api';

interface ClientPortalViewProps {
  portalId: string;
}

interface ClientPortalData {
  id: string;
  clientName: string;
  clientEmail: string;
  clientLogo?: string;
  brandColor?: string;
  projectName: string;
  companyName: string;
  allowedSections: {
    tasks: boolean;
    proposal: boolean;
    budget: boolean;
    reports: boolean;
  };
  tasks: Task[];
  settings: Settings;
  proposalData?: any;
  isApproved?: boolean;
  approvedAt?: string;
  approvedBy?: string;
  signature?: string;
}

export function ClientPortalView({ portalId }: ClientPortalViewProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [portalData, setPortalData] = useState<ClientPortalData | null>(null);
  const [activeView, setActiveView] = useState<'tasks' | 'proposal' | 'budget' | 'reports'>('proposal');
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const data = await api.authenticateClientPortal(portalId, password);
      if (data) {
        setPortalData(data);
        setIsAuthenticated(true);
        // Track access
        await api.trackPortalAccess(portalId);
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (err) {
      setError('Invalid password or portal not found.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <ClientPortalLogin 
      password={password}
      setPassword={setPassword}
      error={error}
      loading={loading}
      onLogin={handleLogin}
    />;
  }

  if (!portalData) {
    return <div>Loading...</div>;
  }

  const brandColor = portalData.brandColor || '#2BBBEF';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#010029]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-[#161A3A]">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {portalData.clientLogo ? (
                <img src={portalData.clientLogo} alt={portalData.clientName} className="h-12 w-auto" />
              ) : (
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-white"
                  style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`, fontSize: '18px', fontWeight: 700 }}
                >
                  {portalData.clientName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-gray-900 dark:text-white" style={{ fontSize: '20px', fontWeight: 700 }}>
                  {portalData.projectName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '13px' }}>
                  Prepared for {portalData.clientName} • {portalData.companyName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400" style={{ fontSize: '12px', fontWeight: 600 }}>
                  <Shield className="h-4 w-4" />
                  SECURE ACCESS
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-[#161A3A]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-1">
            {portalData.allowedSections.proposal && (
              <button
                onClick={() => setActiveView('proposal')}
                className={`flex items-center gap-2 border-b-2 px-4 py-4 transition-all ${
                  activeView === 'proposal'
                    ? 'border-current text-[#2BBBEF]'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                <FileText className="h-4 w-4" />
                Proposal
              </button>
            )}
            {portalData.allowedSections.tasks && (
              <button
                onClick={() => setActiveView('tasks')}
                className={`flex items-center gap-2 border-b-2 px-4 py-4 transition-all ${
                  activeView === 'tasks'
                    ? 'border-current text-[#2BBBEF]'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                <Eye className="h-4 w-4" />
                Task Details
              </button>
            )}
            {portalData.allowedSections.budget && (
              <button
                onClick={() => setActiveView('budget')}
                className={`flex items-center gap-2 border-b-2 px-4 py-4 transition-all ${
                  activeView === 'budget'
                    ? 'border-current text-[#2BBBEF]'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                <DollarSign className="h-4 w-4" />
                Budget
              </button>
            )}
            {portalData.allowedSections.reports && (
              <button
                onClick={() => setActiveView('reports')}
                className={`flex items-center gap-2 border-b-2 px-4 py-4 transition-all ${
                  activeView === 'reports'
                    ? 'border-current text-[#2BBBEF]'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                <BarChart3 className="h-4 w-4" />
                Reports
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {activeView === 'proposal' && (
          <ClientProposalView 
            portalData={portalData}
            onRequestSignature={() => setShowSignatureModal(true)}
          />
        )}
        {activeView === 'tasks' && <ClientTasksView tasks={portalData.tasks} settings={portalData.settings} />}
        {activeView === 'budget' && <ClientBudgetView tasks={portalData.tasks} settings={portalData.settings} />}
        {activeView === 'reports' && <ClientReportsView tasks={portalData.tasks} settings={portalData.settings} />}
      </div>

      {/* E-Signature Modal */}
      {showSignatureModal && (
        <ESignatureModal
          portalId={portalId}
          clientName={portalData.clientName}
          onClose={() => setShowSignatureModal(false)}
          onSuccess={(signature) => {
            setPortalData({
              ...portalData,
              isApproved: true,
              approvedAt: new Date().toISOString(),
              approvedBy: portalData.clientName,
              signature,
            });
            setShowSignatureModal(false);
          }}
        />
      )}
    </div>
  );
}

// Login Screen
interface ClientPortalLoginProps {
  password: string;
  setPassword: (pwd: string) => void;
  error: string;
  loading: boolean;
  onLogin: () => void;
}

function ClientPortalLogin({ password, setPassword, error, loading, onLogin }: ClientPortalLoginProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#010029] via-[#010029] to-[#0a1854] p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
            Client Portal
          </h1>
          <p className="text-gray-400" style={{ fontSize: '14px' }}>
            Enter your access password to view project details
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-white/10 bg-[#161A3A] p-8 shadow-2xl">
          <div className="mb-6">
            <label className="mb-2 block text-gray-300" style={{ fontSize: '13px', fontWeight: 600 }}>
              Access Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onLogin()}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-white/10 bg-[#0C0F2C] px-4 py-3 text-white placeholder-gray-500 focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20"
              style={{ fontSize: '14px' }}
            />
            {error && (
              <p className="mt-2 text-red-400" style={{ fontSize: '12px' }}>
                {error}
              </p>
            )}
          </div>

          <button
            onClick={onLogin}
            disabled={loading || !password}
            className="w-full rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] py-3 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            {loading ? 'Authenticating...' : 'Access Portal'}
          </button>

          <div className="mt-6 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 text-blue-400" />
              <div className="text-blue-300" style={{ fontSize: '12px' }}>
                This portal is password-protected and secure. Your access is logged for security purposes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Proposal View
interface ClientProposalViewProps {
  portalData: ClientPortalData;
  onRequestSignature: () => void;
}

function ClientProposalView({ portalData, onRequestSignature }: ClientProposalViewProps) {
  const totalCost = portalData.tasks.reduce((sum, task) => {
    const pci = (task.ISR * task.CF * task.UXI) + (task.RCF * task.AEP - task.L) + (task.MLW * task.CGW * task.RF) + (task.S * task.GLRI);
    const aas = task.aiVerifiedUnits / Math.max(pci, 1) * 100;
    const verifiedUnits = (aas / 100) * Math.max(pci, 0);
    return sum + (verifiedUnits * portalData.settings.hourlyRate);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Approval Status */}
      {portalData.isApproved ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900/30 dark:bg-green-900/10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-green-900 dark:text-green-300" style={{ fontSize: '16px', fontWeight: 600 }}>
                Proposal Approved
              </h3>
              <p className="text-green-700 dark:text-green-400" style={{ fontSize: '13px' }}>
                Approved by {portalData.approvedBy} on {new Date(portalData.approvedAt!).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#161A3A]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                Proposal Approval Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '13px' }}>
                Review the proposal below and sign to approve
              </p>
            </div>
            <button
              onClick={onRequestSignature}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-6 py-3 text-white transition-opacity hover:opacity-90 shadow-md"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              <CheckCircle className="h-4 w-4" />
              Approve & Sign
            </button>
          </div>
        </div>
      )}

      {/* Project Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-white/10 dark:bg-[#161A3A]">
        <h2 className="mb-6 text-gray-900 dark:text-white" style={{ fontSize: '24px', fontWeight: 700 }}>
          Project Proposal
        </h2>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div>
            <div className="mb-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 600 }}>
              TOTAL COST
            </div>
            <div className="text-gray-900 dark:text-white" style={{ fontSize: '32px', fontWeight: 700 }}>
              ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="mb-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 600 }}>
              TOTAL TASKS
            </div>
            <div className="text-gray-900 dark:text-white" style={{ fontSize: '32px', fontWeight: 700 }}>
              {portalData.tasks.length}
            </div>
          </div>
          <div>
            <div className="mb-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 600 }}>
              HOURLY RATE
            </div>
            <div className="text-gray-900 dark:text-white" style={{ fontSize: '32px', fontWeight: 700 }}>
              ${portalData.settings.hourlyRate}
            </div>
          </div>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h3>Project Overview</h3>
          <p>
            This proposal outlines the scope of work for {portalData.projectName}. Our team has carefully analyzed the requirements and developed a comprehensive task breakdown with accurate cost estimates using our proprietary PCI (Project Cost Intelligence) methodology.
          </p>

          <h3>Scope of Work</h3>
          <p>
            The project consists of {portalData.tasks.length} primary tasks, each validated through AI-powered verification to ensure accuracy and completeness. All estimates include complexity factors, risk assessments, and collaborative overhead.
          </p>

          <h3>Timeline & Deliverables</h3>
          <p>
            Based on our analysis, the estimated project duration and deliverables are outlined in the task breakdown. Each task includes detailed specifications and acceptance criteria to ensure alignment with your expectations.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
          <p className="text-blue-900 dark:text-blue-300" style={{ fontSize: '13px' }}>
            <strong>Note:</strong> This proposal is valid for 30 days from the date of issue. Payment terms and project milestones will be finalized upon approval.
          </p>
        </div>
      </div>
    </div>
  );
}

// Tasks View (Read-only)
function ClientTasksView({ tasks, settings }: { tasks: Task[]; settings: Settings }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-white/10 dark:bg-[#161A3A]">
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 dark:border-white/10 dark:from-[#0C0F2C] dark:to-[#161A3A]">
        <h3 className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
          Task Breakdown
        </h3>
        <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '13px' }}>
          Detailed view of all project tasks and estimates
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-[#0C0F2C]">
            <tr>
              <th className="px-6 py-3 text-left text-gray-600 dark:text-gray-400" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                Task
              </th>
              <th className="px-6 py-3 text-right text-gray-600 dark:text-gray-400" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                Estimated Hours
              </th>
              <th className="px-6 py-3 text-right text-gray-600 dark:text-gray-400" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                Cost
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {tasks.map((task, index) => {
              const pci = (task.ISR * task.CF * task.UXI) + (task.RCF * task.AEP - task.L) + (task.MLW * task.CGW * task.RF) + (task.S * task.GLRI);
              const aas = task.aiVerifiedUnits / Math.max(pci, 1) * 100;
              const verifiedUnits = (aas / 100) * Math.max(pci, 0);
              const cost = verifiedUnits * settings.hourlyRate;

              return (
                <tr key={task.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-[#0C0F2C]/50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400 dark:text-gray-500" style={{ fontSize: '10px', fontFamily: 'monospace' }}>
                        {task.referenceNumber || `TASK-${String(index + 1).padStart(3, '0')}`}
                      </span>
                      <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 500 }}>
                        {task.taskName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {verifiedUnits.toFixed(1)} hrs
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                      ${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Budget View (Read-only)
function ClientBudgetView({ tasks, settings }: { tasks: Task[]; settings: Settings }) {
  const totalPlannedCost = tasks.reduce((sum, task) => {
    const pci = (task.ISR * task.CF * task.UXI) + (task.RCF * task.AEP - task.L) + (task.MLW * task.CGW * task.RF) + (task.S * task.GLRI);
    const aas = task.aiVerifiedUnits / Math.max(pci, 1) * 100;
    const verifiedUnits = (aas / 100) * Math.max(pci, 0);
    return sum + (verifiedUnits * settings.hourlyRate);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#161A3A]">
          <div className="mb-2 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 600 }}>
            TOTAL BUDGET
          </div>
          <div className="text-gray-900 dark:text-white" style={{ fontSize: '32px', fontWeight: 700 }}>
            ${totalPlannedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#161A3A]">
          <div className="mb-2 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 600 }}>
            PAYMENT TERMS
          </div>
          <div className="text-gray-900 dark:text-white" style={{ fontSize: '20px', fontWeight: 600 }}>
            Net 30 Days
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#161A3A]">
          <div className="mb-2 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 600 }}>
            DEPOSIT REQUIRED
          </div>
          <div className="text-gray-900 dark:text-white" style={{ fontSize: '20px', fontWeight: 600 }}>
            50% Upfront
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#161A3A]">
        <h3 className="mb-4 text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
          Payment Schedule
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-white/10">
            <div>
              <div className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                Initial Deposit (50%)
              </div>
              <div className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }}>
                Due upon contract signing
              </div>
            </div>
            <div className="text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 700 }}>
              ${(totalPlannedCost * 0.5).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-white/10">
            <div>
              <div className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                Final Payment (50%)
              </div>
              <div className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }}>
                Due upon project completion
              </div>
            </div>
            <div className="text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 700 }}>
              ${(totalPlannedCost * 0.5).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reports View (Read-only)
function ClientReportsView({ tasks, settings }: { tasks: Task[]; settings: Settings }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-white/10 dark:bg-[#161A3A]">
      <BarChart3 className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
      <h3 className="mt-4 text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
        Reports Coming Soon
      </h3>
      <p className="mt-2 text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>
        Detailed project reports and analytics will be available here
      </p>
    </div>
  );
}

// E-Signature Modal
interface ESignatureModalProps {
  portalId: string;
  clientName: string;
  onClose: () => void;
  onSuccess: (signature: string) => void;
}

function ESignatureModal({ portalId, clientName, onClose, onSuccess }: ESignatureModalProps) {
  const [fullName, setFullName] = useState(clientName);
  const [title, setTitle] = useState('');
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSign = async () => {
    if (!fullName.trim() || !title.trim() || !agreementChecked) {
      alert('Please fill in all required fields and agree to the terms');
      return;
    }

    setLoading(true);
    try {
      const signature = `${fullName} - ${title}`;
      await api.approveClientPortal(portalId, {
        fullName,
        title,
        timestamp: new Date().toISOString(),
        signature,
      });
      onSuccess(signature);
    } catch (error) {
      console.error('Failed to sign proposal:', error);
      alert('Failed to sign proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#161A3A]">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] p-6 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>
                Proposal Approval
              </h3>
              <p className="mt-1 text-white/90" style={{ fontSize: '14px' }}>
                Sign electronically to approve this proposal
              </p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 600 }}>
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
              style={{ fontSize: '14px' }}
            />
          </div>

          <div>
            <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 600 }}>
              Title / Position *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., CEO, Project Manager"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white dark:placeholder-gray-500"
              style={{ fontSize: '14px' }}
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-[#0C0F2C]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreementChecked}
                onChange={(e) => setAgreementChecked(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#2BBBEF] focus:ring-[#2BBBEF]"
              />
              <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '13px' }}>
                I have reviewed and approve this proposal. I understand that this electronic signature is legally binding and equivalent to a handwritten signature.
              </span>
            </label>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
            <p className="text-blue-900 dark:text-blue-300" style={{ fontSize: '12px' }}>
              <strong>Signature Preview:</strong><br />
              {fullName && title ? `${fullName} - ${title}` : 'Your signature will appear here'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6 dark:border-white/10 dark:bg-[#0C0F2C]">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-300 dark:hover:bg-[#0C0F2C]"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSign}
            disabled={loading || !fullName.trim() || !title.trim() || !agreementChecked}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-6 py-2.5 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
              <CheckCircle className="h-4 w-4" />
              {loading ? 'Signing...' : 'Sign & Approve'}
            </button>
        </div>
      </div>
    </div>
  );
}

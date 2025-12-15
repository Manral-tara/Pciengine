import { useState, useEffect } from 'react';
import { Link2, Lock, Eye, EyeOff, Copy, Check, Settings, Trash2, Users, Calendar, Download, X, Sparkles } from 'lucide-react';
import * as api from '../services/api';

interface ClientPortal {
  id: string;
  clientName: string;
  clientEmail: string;
  clientLogo?: string;
  brandColor?: string;
  password: string;
  accessLink: string;
  expiresAt?: string;
  createdAt: string;
  lastAccessedAt?: string;
  accessCount: number;
  isActive: boolean;
  allowedSections: {
    tasks: boolean;
    proposal: boolean;
    budget: boolean;
    reports: boolean;
  };
}

interface ClientPortalManagerProps {
  projectName: string;
}

export function ClientPortalManager({ projectName }: ClientPortalManagerProps) {
  const [portals, setPortals] = useState<ClientPortal[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortals();
  }, []);

  const loadPortals = async () => {
    try {
      setLoading(true);
      const data = await api.getClientPortals();
      setPortals(data || []);
    } catch (error) {
      console.error('Failed to load client portals:', error);
      setPortals([]);
    } finally {
      setLoading(false);
    }
  };

  const deletePortal = async (portalId: string) => {
    if (!confirm('Are you sure you want to delete this client portal? The access link will no longer work.')) {
      return;
    }
    try {
      await api.deleteClientPortal(portalId);
      setPortals(portals.filter(p => p.id !== portalId));
    } catch (error) {
      console.error('Failed to delete portal:', error);
      alert('Failed to delete portal. Please try again.');
    }
  };

  const togglePortalStatus = async (portalId: string, isActive: boolean) => {
    try {
      await api.updateClientPortal(portalId, { isActive });
      setPortals(portals.map(p => p.id === portalId ? { ...p, isActive } : p));
    } catch (error) {
      console.error('Failed to update portal status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-gray-900 dark:text-white" style={{ fontSize: '24px', fontWeight: 700 }}>
            Client Portal Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>
            Create secure, branded portals for clients to view proposals and approve projects
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-5 py-2.5 text-white transition-opacity hover:opacity-90 shadow-md"
          style={{ fontSize: '14px', fontWeight: 600 }}
        >
          <Users className="h-4 w-4" />
          Create New Portal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#161A3A]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 500 }}>
            Active Portals
          </div>
          <div className="text-gray-900 dark:text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
            {portals.filter(p => p.isActive).length}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#161A3A]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 500 }}>
            Total Views
          </div>
          <div className="text-gray-900 dark:text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
            {portals.reduce((sum, p) => sum + p.accessCount, 0)}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#161A3A]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Link2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 500 }}>
            Total Portals
          </div>
          <div className="text-gray-900 dark:text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
            {portals.length}
          </div>
        </div>
      </div>

      {/* Portals List */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-white/10 dark:bg-[#161A3A]">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 dark:border-white/10 dark:from-[#0C0F2C] dark:to-[#161A3A]">
          <h3 className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
            Client Portals
          </h3>
          <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '13px' }}>
            Manage access links and monitor client engagement
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#2BBBEF]"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading portals...</p>
          </div>
        ) : portals.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-400" style={{ fontSize: '14px', fontWeight: 500 }}>
              No client portals yet
            </p>
            <p className="mt-1 text-gray-500 dark:text-gray-500" style={{ fontSize: '13px' }}>
              Create your first portal to share project details with clients
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {portals.map(portal => (
              <PortalCard
                key={portal.id}
                portal={portal}
                onDelete={deletePortal}
                onToggleStatus={togglePortalStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreatePortalModal
          projectName={projectName}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadPortals();
          }}
        />
      )}
    </div>
  );
}

interface PortalCardProps {
  portal: ClientPortal;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

function PortalCard({ portal, onDelete, onToggleStatus }: PortalCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = portal.expiresAt ? new Date(portal.expiresAt) < new Date() : false;

  return (
    <div className="p-6 transition-colors hover:bg-gray-50/50 dark:hover:bg-[#0C0F2C]/50">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Client Logo */}
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] text-white" style={{ fontSize: '18px', fontWeight: 700 }}>
            {portal.clientLogo ? (
              <img src={portal.clientLogo} alt={portal.clientName} className="h-full w-full rounded-lg object-cover" />
            ) : (
              portal.clientName.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h4 className="text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                {portal.clientName}
              </h4>
              {portal.isActive && !isExpired ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800 dark:bg-green-900/30 dark:text-green-300" style={{ fontSize: '11px', fontWeight: 600 }}>
                  ACTIVE
                </span>
              ) : isExpired ? (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800 dark:bg-red-900/30 dark:text-red-300" style={{ fontSize: '11px', fontWeight: 600 }}>
                  EXPIRED
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" style={{ fontSize: '11px', fontWeight: 600 }}>
                  INACTIVE
                </span>
              )}
            </div>

            <div className="mb-3 text-gray-600 dark:text-gray-400" style={{ fontSize: '13px' }}>
              {portal.clientEmail}
            </div>

            {/* Access Link */}
            <div className="mb-2 flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono dark:border-white/10 dark:bg-[#0C0F2C]" style={{ fontSize: '12px' }}>
                {portal.accessLink}
              </div>
              <button
                onClick={() => copyToClipboard(portal.accessLink)}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-300 dark:hover:bg-[#0C0F2C]"
                style={{ fontSize: '12px' }}
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Password */}
            <div className="mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
                Password:
              </span>
              <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-gray-900 dark:bg-[#0C0F2C] dark:text-white" style={{ fontSize: '12px' }}>
                {showPassword ? portal.password : '••••••••'}
              </code>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400" style={{ fontSize: '12px' }}>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created {formatDate(portal.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {portal.accessCount} views
              </div>
              {portal.lastAccessedAt && (
                <div className="flex items-center gap-1">
                  Last viewed {formatDate(portal.lastAccessedAt)}
                </div>
              )}
            </div>

            {/* Allowed Sections */}
            <div className="mt-3 flex items-center gap-2">
              {portal.allowedSections.tasks && (
                <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" style={{ fontSize: '11px' }}>
                  Tasks
                </span>
              )}
              {portal.allowedSections.proposal && (
                <span className="rounded-full bg-purple-50 px-2 py-1 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" style={{ fontSize: '11px' }}>
                  Proposal
                </span>
              )}
              {portal.allowedSections.budget && (
                <span className="rounded-full bg-green-50 px-2 py-1 text-green-700 dark:bg-green-900/20 dark:text-green-400" style={{ fontSize: '11px' }}>
                  Budget
                </span>
              )}
              {portal.allowedSections.reports && (
                <span className="rounded-full bg-orange-50 px-2 py-1 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" style={{ fontSize: '11px' }}>
                  Reports
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleStatus(portal.id, !portal.isActive)}
            className={`rounded-lg px-3 py-1.5 transition-colors ${
              portal.isActive
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900/30 dark:text-gray-300'
                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
            }`}
            style={{ fontSize: '12px', fontWeight: 500 }}
          >
            {portal.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => onDelete(portal.id)}
            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface CreatePortalModalProps {
  projectName: string;
  onClose: () => void;
  onSuccess: () => void;
}

function CreatePortalModal({ projectName, onClose, onSuccess }: CreatePortalModalProps) {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [password, setPassword] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | null>(30);
  const [brandColor, setBrandColor] = useState('#2BBBEF');
  const [allowedSections, setAllowedSections] = useState({
    tasks: true,
    proposal: true,
    budget: true,
    reports: true,
  });
  const [loading, setLoading] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
  };

  const handleCreate = async () => {
    if (!clientName.trim() || !clientEmail.trim() || !password.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const portalId = `portal-${Date.now()}`;
      const accessLink = `${window.location.origin}/client-portal/${portalId}`;
      
      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const portal: ClientPortal = {
        id: portalId,
        clientName,
        clientEmail,
        brandColor,
        password,
        accessLink,
        expiresAt,
        createdAt: new Date().toISOString(),
        accessCount: 0,
        isActive: true,
        allowedSections,
      };

      await api.createClientPortal(portal);
      onSuccess();
    } catch (error) {
      console.error('Failed to create portal:', error);
      alert('Failed to create portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Slide-up Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-center transition-transform duration-500 ease-out animate-slide-up">
        <div 
          className="w-full max-w-4xl rounded-t-3xl border-t border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0C0F2C]"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Decorative Top Bar */}
          <div className="flex justify-center border-b border-gray-100 py-3 dark:border-white/5">
            <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div className="flex items-start gap-4">
                {/* Animated Icon */}
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-[#2BBBEF]/20 to-[#4AFFA8]/20 blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="mb-2 bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] bg-clip-text text-transparent" style={{ fontSize: '28px', fontWeight: 700 }}>
                    Create Client Portal
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '15px', maxWidth: '500px' }}>
                    Generate a secure, branded portal for {projectName} with password protection and customizable access controls
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

            {/* Content */}
            <div className="space-y-6">
              {/* Client Details Section */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 dark:border-white/10 dark:from-[#161A3A] dark:to-[#0C0F2C]">
                <h3 className="mb-4 flex items-center gap-2 text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                  <Users className="h-5 w-5 text-[#2BBBEF]" />
                  Client Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Acme Corporation"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white dark:placeholder-gray-500"
                      style={{ fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                      Client Email *
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="john@acme.com"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white dark:placeholder-gray-500"
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 dark:border-white/10 dark:from-[#161A3A] dark:to-[#0C0F2C]">
                <h3 className="mb-4 flex items-center gap-2 text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                  <Lock className="h-5 w-5 text-[#2BBBEF]" />
                  Security Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                      Access Password *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Generate or enter custom password"
                        className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 font-mono text-gray-900 placeholder-gray-400 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white dark:placeholder-gray-500"
                        style={{ fontSize: '14px' }}
                      />
                      <button
                        onClick={generatePassword}
                        className="rounded-lg border border-[#2BBBEF] bg-white px-4 py-3 text-[#2BBBEF] transition-all hover:bg-[#2BBBEF] hover:text-white dark:bg-[#0C0F2C] dark:hover:bg-[#2BBBEF]"
                        style={{ fontSize: '14px', fontWeight: 500 }}
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                      Access Expiration
                    </label>
                    <select
                      value={expiresInDays || ''}
                      onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                      style={{ fontSize: '14px' }}
                    >
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                      <option value="">Never expires</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Branding Section */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 dark:border-white/10 dark:from-[#161A3A] dark:to-[#0C0F2C]">
                <h3 className="mb-4 flex items-center gap-2 text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                  <Sparkles className="h-5 w-5 text-[#2BBBEF]" />
                  Branding
                </h3>
                <div>
                  <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Brand Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="h-12 w-24 cursor-pointer rounded-lg border border-gray-200 transition-all hover:scale-105 dark:border-white/10"
                    />
                    <input
                      type="text"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 font-mono text-gray-900 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Access Control Section */}
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 dark:border-white/10 dark:from-[#161A3A] dark:to-[#0C0F2C]">
                <h3 className="mb-4 flex items-center gap-2 text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                  <Settings className="h-5 w-5 text-[#2BBBEF]" />
                  Allowed Sections
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(allowedSections).map(([key, value]) => (
                    <label 
                      key={key} 
                      className="flex items-center gap-3 cursor-pointer rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-[#2BBBEF] hover:shadow-sm dark:border-white/10 dark:bg-[#0C0F2C] dark:hover:border-[#2BBBEF]"
                    >
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setAllowedSections({ ...allowedSections, [key]: e.target.checked })}
                        className="h-5 w-5 rounded border-gray-300 text-[#2BBBEF] focus:ring-[#2BBBEF] dark:border-white/10"
                      />
                      <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 500 }}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-white/10">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-300 dark:hover:bg-[#0C0F2C]"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-8 py-3 text-white transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-50"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating Portal...
                  </span>
                ) : (
                  'Create Portal'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
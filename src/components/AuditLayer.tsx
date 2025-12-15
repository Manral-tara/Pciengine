import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Flag, Clock, AlertTriangle, MessageSquare, FileText, Plus, Search, Filter, Download, User, Calendar, TrendingUp, DollarSign, Sparkles, Eye, Edit, Trash2, X, Upload, FolderPlus, Layers } from 'lucide-react';
import * as api from '../services/api';
import type { Task } from './TaskTable';
import type { Settings } from '../App';

interface AuditLayerProps {
  settings: Settings;
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

interface AuditItem {
  id: string;
  type: 'task' | 'project' | 'report';
  name: string;
  description?: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  estimatedCost?: number;
  pciUnits?: number;
  auditNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  flags?: AuditFlag[];
  comments?: AuditComment[];
}

interface AuditFlag {
  id: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: string;
  status: 'open' | 'resolved';
  resolution?: string;
}

interface AuditComment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export function AuditLayer({ settings, tasks, onTasksChange }: AuditLayerProps) {
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<AuditItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  useEffect(() => {
    loadAuditItems();
  }, [tasks]);

  const loadAuditItems = async () => {
    try {
      setLoading(true);
      
      // Convert tasks to audit items
      const taskAuditItems: AuditItem[] = tasks.map(task => ({
        id: task.id,
        type: 'task' as const,
        name: task.taskName,
        submittedBy: 'Current User',
        submittedAt: new Date().toISOString(),
        status: task.auditStatus === 'approved' ? 'approved' : 
                task.auditStatus === 'rejected' ? 'rejected' : 
                'pending',
        estimatedCost: calculateTaskCost(task),
        pciUnits: calculatePCI(task),
        approvedBy: task.approvedBy,
        approvedAt: task.approvedAt,
        rejectedBy: task.rejectedBy,
        rejectedAt: task.rejectedAt,
        rejectionReason: task.rejectionReason,
        auditNotes: task.approvalNotes,
        flags: [],
        comments: [],
      }));

      // Load additional audit items from backend
      try {
        const backendItems = await api.getAuditItems();
        setAuditItems([...taskAuditItems, ...backendItems]);
      } catch (error) {
        console.error('Failed to load audit items from backend:', error);
        setAuditItems(taskAuditItems);
      }
    } catch (error) {
      console.error('Failed to load audit items:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePCI = (task: Task): number => {
    return (task.ISR * task.CF * task.UXI) + 
           (task.RCF * task.AEP) + 
           (task.L + task.MLW + task.CGW + task.RF + task.S) + 
           task.GLRI;
  };

  const calculateTaskCost = (task: Task): number => {
    const pci = calculatePCI(task);
    const hours = pci * (settings.unitsToHoursRatio || 1);
    return hours * (settings.hourlyRate || 100);
  };

  const handleApprove = async (item: AuditItem) => {
    const notes = prompt('Add approval notes (optional):');
    
    try {
      const updatedItem: AuditItem = {
        ...item,
        status: 'approved',
        approvedBy: 'Current User',
        approvedAt: new Date().toISOString(),
        auditNotes: notes || undefined,
      };

      // Update backend
      if (item.type === 'task') {
        await api.approveTask(item.id, notes || undefined);
        // Update local tasks
        const updatedTasks = tasks.map(t => 
          t.id === item.id 
            ? { ...t, auditStatus: 'approved' as const, approvedBy: 'Current User', approvedAt: new Date().toISOString(), approvalNotes: notes || undefined }
            : t
        );
        onTasksChange(updatedTasks);
      } else {
        await api.updateAuditItem(item.id, updatedItem);
      }

      setAuditItems(items => items.map(i => i.id === item.id ? updatedItem : i));
      setSelectedItem(updatedItem);
      alert('✅ Item approved successfully!');
    } catch (error) {
      console.error('Failed to approve item:', error);
      alert('Failed to approve item. Please try again.');
    }
  };

  const handleReject = async (item: AuditItem) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const updatedItem: AuditItem = {
        ...item,
        status: 'rejected',
        rejectedBy: 'Current User',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
      };

      // Update backend
      if (item.type === 'task') {
        await api.rejectTask(item.id, reason);
        // Update local tasks
        const updatedTasks = tasks.map(t => 
          t.id === item.id 
            ? { ...t, auditStatus: 'rejected' as const, rejectedBy: 'Current User', rejectedAt: new Date().toISOString(), rejectionReason: reason }
            : t
        );
        onTasksChange(updatedTasks);
      } else {
        await api.updateAuditItem(item.id, updatedItem);
      }

      setAuditItems(items => items.map(i => i.id === item.id ? updatedItem : i));
      setSelectedItem(updatedItem);
      alert('❌ Item rejected.');
    } catch (error) {
      console.error('Failed to reject item:', error);
      alert('Failed to reject item. Please try again.');
    }
  };

  const handleFlag = async (item: AuditItem) => {
    const reason = prompt('Enter flag reason:');
    if (!reason) return;
    
    const severity = prompt('Enter severity (low/medium/high):', 'medium') as 'low' | 'medium' | 'high';

    const newFlag: AuditFlag = {
      id: `flag-${Date.now()}`,
      reason,
      severity,
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    const updatedItem: AuditItem = {
      ...item,
      status: 'flagged',
      flags: [...(item.flags || []), newFlag],
    };

    try {
      if (item.type === 'task') {
        await api.flagTask(item.id, reason, severity);
      } else {
        await api.updateAuditItem(item.id, updatedItem);
      }

      setAuditItems(items => items.map(i => i.id === item.id ? updatedItem : i));
      setSelectedItem(updatedItem);
      alert('🚩 Item flagged successfully!');
    } catch (error) {
      console.error('Failed to flag item:', error);
      alert('Failed to flag item. Please try again.');
    }
  };

  const filteredItems = auditItems.filter(item => {
    // Filter by tab
    if (activeTab !== 'all' && item.status !== activeTab) return false;
    
    // Filter by search
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  const stats = {
    pending: auditItems.filter(i => i.status === 'pending').length,
    approved: auditItems.filter(i => i.status === 'approved').length,
    rejected: auditItems.filter(i => i.status === 'rejected').length,
    flagged: auditItems.filter(i => i.status === 'flagged').length,
    total: auditItems.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-gray-900 dark:text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
            Audit Layer
          </h2>
          <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>
            Review, approve, and track all project tasks, reports, and deliverables
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-5 py-2.5 text-white shadow-md transition-opacity hover:opacity-90"
          style={{ fontSize: '14px', fontWeight: 600 }}
        >
          <Plus className="h-4 w-4" />
          Add to Audit
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#161A3A]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 500 }}>
            Pending Review
          </div>
          <div className="text-gray-900 dark:text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
            {stats.pending}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#161A3A]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 500 }}>
            Approved
          </div>
          <div className="text-gray-900 dark:text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
            {stats.approved}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#161A3A]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 500 }}>
            Rejected
          </div>
          <div className="text-gray-900 dark:text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
            {stats.rejected}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#161A3A]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Flag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 500 }}>
            Flagged
          </div>
          <div className="text-gray-900 dark:text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
            {stats.flagged}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#161A3A]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 500 }}>
            Total Items
          </div>
          <div className="text-gray-900 dark:text-white" style={{ fontSize: '28px', fontWeight: 700 }}>
            {stats.total}
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit items..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#161A3A] dark:text-white dark:placeholder-gray-500"
            style={{ fontSize: '14px' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-white/10">
        {[
          { id: 'pending' as const, label: 'Pending', count: stats.pending },
          { id: 'approved' as const, label: 'Approved', count: stats.approved },
          { id: 'rejected' as const, label: 'Rejected', count: stats.rejected },
          { id: 'all' as const, label: 'All Items', count: stats.total },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors ${
              activeTab === tab.id
                ? 'border-[#2BBBEF] text-[#2BBBEF] dark:border-[#4AFFA8] dark:text-[#4AFFA8]'
                : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            {tab.label}
            <span className={`rounded-full px-2 py-0.5 ${
              activeTab === tab.id
                ? 'bg-[#2BBBEF]/10 text-[#2BBBEF] dark:bg-[#4AFFA8]/10 dark:text-[#4AFFA8]'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`} style={{ fontSize: '12px', fontWeight: 600 }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Audit Items List */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-white/10 dark:bg-[#161A3A]">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#2BBBEF]"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading audit items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-400" style={{ fontSize: '14px', fontWeight: 500 }}>
              {activeTab === 'all' ? 'No audit items yet' : `No ${activeTab} items`}
            </p>
            <p className="mt-1 text-gray-500 dark:text-gray-500" style={{ fontSize: '13px' }}>
              {activeTab === 'pending' ? 'Create tasks or add items to audit' : 'Items will appear here as they are processed'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {filteredItems.map(item => (
              <AuditItemRow
                key={item.id}
                item={item}
                onApprove={handleApprove}
                onReject={handleReject}
                onFlag={handleFlag}
                onSelect={() => {
                  setSelectedItem(item);
                  setShowDetailPanel(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add to Audit Modal */}
      {showAddModal && (
        <AddToAuditModal
          onClose={() => setShowAddModal(false)}
          onAdd={(newItem) => {
            setAuditItems([...auditItems, newItem]);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Detail Panel */}
      {showDetailPanel && selectedItem && (
        <AuditDetailPanel
          item={selectedItem}
          onClose={() => setShowDetailPanel(false)}
          onApprove={handleApprove}
          onReject={handleReject}
          onFlag={handleFlag}
        />
      )}
    </div>
  );
}

interface AuditItemRowProps {
  item: AuditItem;
  onApprove: (item: AuditItem) => void;
  onReject: (item: AuditItem) => void;
  onFlag: (item: AuditItem) => void;
  onSelect: () => void;
}

function AuditItemRow({ item, onApprove, onReject, onFlag, onSelect }: AuditItemRowProps) {
  const statusConfig = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', label: 'Pending' },
    approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: 'Approved' },
    rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', label: 'Rejected' },
    flagged: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300', label: 'Flagged' },
  };

  const typeIcon = {
    task: <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
    project: <FolderPlus className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
    report: <Download className="h-5 w-5 text-green-600 dark:text-green-400" />,
  };

  const config = statusConfig[item.status];

  return (
    <div className="p-5 transition-colors hover:bg-gray-50/50 dark:hover:bg-[#0C0F2C]/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Type Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            {typeIcon[item.type]}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h4 
                onClick={onSelect}
                className="cursor-pointer text-gray-900 hover:text-[#2BBBEF] dark:text-white dark:hover:text-[#4AFFA8]" 
                style={{ fontSize: '16px', fontWeight: 600 }}
              >
                {item.name}
              </h4>
              <span className={`rounded-full px-2 py-0.5 ${config.bg} ${config.text}`} style={{ fontSize: '11px', fontWeight: 600 }}>
                {config.label}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 dark:bg-gray-800 dark:text-gray-400" style={{ fontSize: '11px', fontWeight: 600 }}>
                {item.type.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400" style={{ fontSize: '13px' }}>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {item.submittedBy}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(item.submittedAt).toLocaleDateString()}
              </div>
              {item.estimatedCost && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ${item.estimatedCost.toFixed(2)}
                </div>
              )}
              {item.pciUnits && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {item.pciUnits.toFixed(1)} PCI
                </div>
              )}
              {item.flags && item.flags.length > 0 && (
                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  <Flag className="h-4 w-4" />
                  {item.flags.length} flag{item.flags.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSelect}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          {item.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(item)}
                className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                title="Approve"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => onReject(item)}
                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                title="Reject"
              >
                <XCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => onFlag(item)}
                className="rounded-lg p-2 text-orange-600 transition-colors hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                title="Flag for Review"
              >
                <Flag className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Rejection Reason */}
      {item.status === 'rejected' && item.rejectionReason && (
        <div className="mt-3 rounded-lg border-l-4 border-red-500 bg-red-50 p-3 dark:bg-red-900/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-red-800 dark:text-red-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                Rejection Reason
              </p>
              <p className="mt-1 text-red-700 dark:text-red-400" style={{ fontSize: '12px' }}>
                {item.rejectionReason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approval Notes */}
      {item.status === 'approved' && item.auditNotes && (
        <div className="mt-3 rounded-lg border-l-4 border-green-500 bg-green-50 p-3 dark:bg-green-900/20">
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-green-800 dark:text-green-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                Approval Notes
              </p>
              <p className="mt-1 text-green-700 dark:text-green-400" style={{ fontSize: '12px' }}>
                {item.auditNotes}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface AddToAuditModalProps {
  onClose: () => void;
  onAdd: (item: AuditItem) => void;
}

function AddToAuditModal({ onClose, onAdd }: AddToAuditModalProps) {
  const [itemType, setItemType] = useState<'task' | 'project' | 'report'>('task');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');

  const handleSubmit = async () => {
    if (!itemName.trim()) {
      alert('Please enter an item name');
      return;
    }

    const newItem: AuditItem = {
      id: `audit-${Date.now()}`,
      type: itemType,
      name: itemName,
      description,
      submittedBy: 'Current User',
      submittedAt: new Date().toISOString(),
      status: 'pending',
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      flags: [],
      comments: [],
    };

    try {
      // Save to backend
      await api.createAuditItem(newItem);
      onAdd(newItem);
    } catch (error) {
      console.error('Failed to create audit item:', error);
      // Still add locally even if backend fails
      onAdd(newItem);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-center transition-transform duration-500 ease-out animate-slide-up">
        <div 
          className="w-full max-w-2xl rounded-t-3xl border-t border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0C0F2C]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative Top Bar */}
          <div className="flex justify-center border-b border-gray-100 py-3 dark:border-white/5">
            <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-[#2BBBEF]/20 to-[#4AFFA8]/20 blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] shadow-lg">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="mb-2 bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] bg-clip-text text-transparent" style={{ fontSize: '28px', fontWeight: 700 }}>
                    Add to Audit Layer
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '15px' }}>
                    Submit a task, project, or report for audit review and approval
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
            <div className="space-y-5">
              {/* Item Type */}
              <div>
                <label className="mb-3 block text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Item Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'task' as const, label: 'Task', icon: FileText },
                    { value: 'project' as const, label: 'Project', icon: FolderPlus },
                    { value: 'report' as const, label: 'Report', icon: Download },
                  ].map(type => (
                    <button
                      key={type.value}
                      onClick={() => setItemType(type.value)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        itemType === type.value
                          ? 'border-[#2BBBEF] bg-[#2BBBEF]/5 dark:border-[#4AFFA8] dark:bg-[#4AFFA8]/5'
                          : 'border-gray-200 hover:border-gray-300 dark:border-white/10 dark:hover:border-white/20'
                      }`}
                    >
                      <type.icon className={`h-6 w-6 ${
                        itemType === type.value ? 'text-[#2BBBEF] dark:text-[#4AFFA8]' : 'text-gray-400'
                      }`} />
                      <span className={`${
                        itemType === type.value ? 'text-[#2BBBEF] dark:text-[#4AFFA8]' : 'text-gray-600 dark:text-gray-400'
                      }`} style={{ fontSize: '14px', fontWeight: 500 }}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Item Name */}
              <div>
                <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 600 }}>
                  {itemType === 'task' ? 'Task' : itemType === 'project' ? 'Project' : 'Report'} Name *
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder={`Enter ${itemType} name...`}
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white dark:placeholder-gray-500"
                  style={{ fontSize: '14px' }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any additional details..."
                  rows={3}
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white dark:placeholder-gray-500"
                  style={{ fontSize: '14px' }}
                />
              </div>

              {/* Estimated Cost */}
              <div>
                <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Estimated Cost (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 pl-8 text-gray-900 placeholder-gray-400 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white dark:placeholder-gray-500"
                    style={{ fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border-2 border-gray-200 px-6 py-3 text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-[#161A3A]"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-8 py-3 text-white shadow-lg transition-all hover:shadow-xl"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                <Upload className="h-5 w-5" />
                Submit for Review
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </>
  );
}

interface AuditDetailPanelProps {
  item: AuditItem;
  onClose: () => void;
  onApprove: (item: AuditItem) => void;
  onReject: (item: AuditItem) => void;
  onFlag: (item: AuditItem) => void;
}

function AuditDetailPanel({ item, onClose, onApprove, onReject, onFlag }: AuditDetailPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Slide Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl dark:bg-[#0C0F2C] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="mb-2 text-gray-900 dark:text-white" style={{ fontSize: '24px', fontWeight: 700 }}>
                {item.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400" style={{ fontSize: '12px', fontWeight: 600 }}>
                  {item.type.toUpperCase()}
                </span>
                <span className={`rounded-full px-3 py-1 ${
                  item.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                  item.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                  item.status === 'flagged' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`} style={{ fontSize: '12px', fontWeight: 600 }}>
                  {item.status.toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#161A3A] dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-[#161A3A]">
              <h4 className="mb-4 text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                Details
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>Submitted By</span>
                  <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 500 }}>{item.submittedBy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>Submitted At</span>
                  <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 500 }}>
                    {new Date(item.submittedAt).toLocaleString()}
                  </span>
                </div>
                {item.estimatedCost && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>Estimated Cost</span>
                    <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 500 }}>
                      ${item.estimatedCost.toFixed(2)}
                    </span>
                  </div>
                )}
                {item.pciUnits && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>PCI Units</span>
                    <span className="text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 500 }}>
                      {item.pciUnits.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {item.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onApprove(item);
                    onClose();
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-white transition-all hover:bg-green-700"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  <CheckCircle className="h-5 w-5" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    onReject(item);
                    onClose();
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-white transition-all hover:bg-red-700"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  <XCircle className="h-5 w-5" />
                  Reject
                </button>
                <button
                  onClick={() => {
                    onFlag(item);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-white transition-all hover:bg-orange-700"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  <Flag className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

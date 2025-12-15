import { useState } from 'react';
import { CheckSquare, Square, X, Edit, Trash2, Download, CheckCircle, XCircle, FileJson, FileSpreadsheet } from 'lucide-react';
import type { Task } from './TaskTable';
import type { Settings } from '../App';

interface BulkOperationsProps {
  tasks: Task[];
  selectedTaskIds: Set<string>;
  onTasksChange: (tasks: Task[]) => void;
  onSelectionChange: (selectedIds: Set<string>) => void;
  settings: Settings;
}

export function BulkOperations({ tasks, selectedTaskIds, onTasksChange, onSelectionChange, settings }: BulkOperationsProps) {
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const selectedCount = selectedTaskIds.size;
  const selectedTasks = tasks.filter(t => selectedTaskIds.has(t.id));

  // Select/Deselect All
  const toggleSelectAll = () => {
    if (selectedTaskIds.size === tasks.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(tasks.map(t => t.id)));
    }
  };

  // Bulk Delete
  const handleBulkDelete = () => {
    const remaining = tasks.filter(t => !selectedTaskIds.has(t.id));
    onTasksChange(remaining);
    onSelectionChange(new Set());
    setShowBulkDeleteConfirm(false);
  };

  // Bulk Approve
  const handleBulkApprove = () => {
    const updated = tasks.map(t => 
      selectedTaskIds.has(t.id)
        ? { ...t, auditStatus: 'approved' as const, approvedAt: new Date().toISOString() }
        : t
    );
    onTasksChange(updated);
  };

  // Bulk Reject
  const handleBulkReject = () => {
    const updated = tasks.map(t => 
      selectedTaskIds.has(t.id)
        ? { ...t, auditStatus: 'rejected' as const, rejectedAt: new Date().toISOString() }
        : t
    );
    onTasksChange(updated);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Reference', 'Task Name', 'ISR', 'CF', 'UXI', 'RCF', 'AEP', 'L', 'MLW', 'CGW', 'RF', 'S', 'GLRI', 'AI Verified Units', 'PCI Units', 'AAS %', 'Verified Cost'];
    
    const rows = selectedTasks.map((task, index) => {
      const pci = (task.ISR * task.CF * task.UXI) + (task.RCF * task.AEP - task.L) + (task.MLW * task.CGW * task.RF) + (task.S * task.GLRI);
      const aas = pci > 0 ? (task.aiVerifiedUnits / pci) * 100 : 0;
      const verifiedUnits = (aas / 100) * pci;
      const cost = verifiedUnits * settings.hourlyRate;
      
      return [
        task.referenceNumber || `TASK-${String(index + 1).padStart(3, '0')}`,
        task.taskName,
        task.ISR,
        task.CF,
        task.UXI,
        task.RCF,
        task.AEP,
        task.L,
        task.MLW,
        task.CGW,
        task.RF,
        task.S,
        task.GLRI,
        task.aiVerifiedUnits,
        pci.toFixed(2),
        aas.toFixed(2),
        cost.toFixed(2),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Export to JSON
  const exportToJSON = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      projectName: settings.projectName || 'Project',
      companyName: settings.companyName || 'Company',
      tasks: selectedTasks.map((task, index) => {
        const pci = (task.ISR * task.CF * task.UXI) + (task.RCF * task.AEP - task.L) + (task.MLW * task.CGW * task.RF) + (task.S * task.GLRI);
        const aas = pci > 0 ? (task.aiVerifiedUnits / pci) * 100 : 0;
        const verifiedUnits = (aas / 100) * pci;
        const cost = verifiedUnits * settings.hourlyRate;
        
        return {
          reference: task.referenceNumber || `TASK-${String(index + 1).padStart(3, '0')}`,
          name: task.taskName,
          factors: {
            ISR: task.ISR,
            CF: task.CF,
            UXI: task.UXI,
            RCF: task.RCF,
            AEP: task.AEP,
            L: task.L,
            MLW: task.MLW,
            CGW: task.CGW,
            RF: task.RF,
            S: task.S,
            GLRI: task.GLRI,
          },
          metrics: {
            aiVerifiedUnits: task.aiVerifiedUnits,
            pciUnits: parseFloat(pci.toFixed(2)),
            aasPercentage: parseFloat(aas.toFixed(2)),
            verifiedUnits: parseFloat(verifiedUnits.toFixed(2)),
            verifiedCost: parseFloat(cost.toFixed(2)),
          },
          audit: {
            status: task.auditStatus,
            approvedAt: task.approvedAt,
            approvedBy: task.approvedBy,
            rejectedAt: task.rejectedAt,
            rejectedBy: task.rejectedBy,
          },
          budget: {
            actualHours: task.actualHours,
            progressPercentage: task.progressPercentage,
            status: task.status,
          },
        };
      }),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  if (selectedCount === 0) return null;

  return (
    <>
      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-2xl dark:border-white/10 dark:bg-[#161A3A]">
          <div className="flex items-center gap-6">
            {/* Selection Info */}
            <div className="flex items-center gap-3 border-r border-gray-200 pr-6 dark:border-white/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8]">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                  {selectedCount} {selectedCount === 1 ? 'task' : 'tasks'} selected
                </div>
                <button
                  onClick={toggleSelectAll}
                  className="text-[#2BBBEF] hover:underline"
                  style={{ fontSize: '12px' }}
                >
                  {selectedCount === tasks.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Bulk Edit */}
              <button
                onClick={() => setShowBulkEditModal(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-gray-300 dark:hover:bg-[#161A3A]"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>

              {/* Bulk Approve */}
              <button
                onClick={handleBulkApprove}
                className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-green-700 transition-all hover:bg-green-100 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </button>

              {/* Bulk Reject */}
              <button
                onClick={handleBulkReject}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-700 transition-all hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>

              {/* Export */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700 transition-all hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>

                {showExportMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#161A3A]">
                    <button
                      onClick={exportToCSV}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-[#0C0F2C]"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <div>
                        <div className="text-gray-900 dark:text-white" style={{ fontSize: '13px', fontWeight: 500 }}>
                          Export as CSV
                        </div>
                        <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>
                          Excel compatible
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={exportToJSON}
                      className="flex w-full items-center gap-3 border-t border-gray-200 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:border-white/10 dark:hover:bg-[#0C0F2C]"
                    >
                      <FileJson className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="text-gray-900 dark:text-white" style={{ fontSize: '13px', fontWeight: 500 }}>
                          Export as JSON
                        </div>
                        <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>
                          Developer friendly
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Delete */}
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-700 transition-all hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>

              {/* Clear Selection */}
              <button
                onClick={() => onSelectionChange(new Set())}
                className="ml-2 flex items-center justify-center rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#0C0F2C] dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <BulkEditModal
          tasks={selectedTasks}
          onClose={() => setShowBulkEditModal(false)}
          onSave={(updates) => {
            const updated = tasks.map(t => 
              selectedTaskIds.has(t.id) ? { ...t, ...updates } : t
            );
            onTasksChange(updated);
            setShowBulkEditModal(false);
          }}
        />
      )}

      {/* Bulk Delete Confirmation */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#161A3A]">
            <div className="border-b border-gray-200 bg-red-50 p-6 dark:border-white/10 dark:bg-red-900/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-red-900 dark:text-red-300" style={{ fontSize: '18px', fontWeight: 700 }}>
                    Delete {selectedCount} {selectedCount === 1 ? 'task' : 'tasks'}?
                  </h3>
                  <p className="text-red-700 dark:text-red-400" style={{ fontSize: '13px' }}>
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300" style={{ fontSize: '14px' }}>
                You are about to permanently delete {selectedCount} {selectedCount === 1 ? 'task' : 'tasks'}. All data associated with {selectedCount === 1 ? 'this task' : 'these tasks'} will be lost.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6 dark:border-white/10 dark:bg-[#0C0F2C]">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-300 dark:hover:bg-[#0C0F2C]"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-white transition-colors hover:bg-red-700"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                Delete {selectedCount} {selectedCount === 1 ? 'task' : 'tasks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Bulk Edit Modal Component
interface BulkEditModalProps {
  tasks: Task[];
  onClose: () => void;
  onSave: (updates: Partial<Task>) => void;
}

function BulkEditModal({ tasks, onClose, onSave }: BulkEditModalProps) {
  const [updates, setUpdates] = useState<Partial<Task>>({});
  const [editFields, setEditFields] = useState<Set<string>>(new Set());

  const toggleField = (field: string) => {
    const newFields = new Set(editFields);
    if (newFields.has(field)) {
      newFields.delete(field);
      const newUpdates = { ...updates };
      delete newUpdates[field as keyof Task];
      setUpdates(newUpdates);
    } else {
      newFields.add(field);
    }
    setEditFields(newFields);
  };

  const handleSave = () => {
    if (editFields.size === 0) {
      alert('Please select at least one field to update');
      return;
    }
    onSave(updates);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#161A3A]">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] p-6 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>
                Bulk Edit Tasks
              </h3>
              <p className="mt-1 text-white/90" style={{ fontSize: '14px' }}>
                Editing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Status */}
            <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editFields.has('status')}
                  onChange={() => toggleField('status')}
                  className="h-4 w-4 rounded border-gray-300 text-[#2BBBEF] focus:ring-[#2BBBEF]"
                />
                <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Update Status
                </span>
              </label>
              {editFields.has('status') && (
                <select
                  value={updates.status || ''}
                  onChange={(e) => setUpdates({ ...updates, status: e.target.value as Task['status'] })}
                  className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                  style={{ fontSize: '14px' }}
                >
                  <option value="">Select status...</option>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              )}
            </div>

            {/* Audit Status */}
            <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editFields.has('auditStatus')}
                  onChange={() => toggleField('auditStatus')}
                  className="h-4 w-4 rounded border-gray-300 text-[#2BBBEF] focus:ring-[#2BBBEF]"
                />
                <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Update Audit Status
                </span>
              </label>
              {editFields.has('auditStatus') && (
                <select
                  value={updates.auditStatus || ''}
                  onChange={(e) => setUpdates({ ...updates, auditStatus: e.target.value as Task['auditStatus'] })}
                  className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                  style={{ fontSize: '14px' }}
                >
                  <option value="">Select audit status...</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              )}
            </div>

            {/* Progress Percentage */}
            <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editFields.has('progressPercentage')}
                  onChange={() => toggleField('progressPercentage')}
                  className="h-4 w-4 rounded border-gray-300 text-[#2BBBEF] focus:ring-[#2BBBEF]"
                />
                <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Update Progress Percentage
                </span>
              </label>
              {editFields.has('progressPercentage') && (
                <div className="mt-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={updates.progressPercentage || 0}
                    onChange={(e) => setUpdates({ ...updates, progressPercentage: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="mt-2 text-center text-gray-700 dark:text-gray-300" style={{ fontSize: '16px', fontWeight: 600 }}>
                    {updates.progressPercentage || 0}%
                  </div>
                </div>
              )}
            </div>

            {/* Actual Hours */}
            <div className="rounded-lg border border-gray-200 p-4 dark:border-white/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editFields.has('actualHours')}
                  onChange={() => toggleField('actualHours')}
                  className="h-4 w-4 rounded border-gray-300 text-[#2BBBEF] focus:ring-[#2BBBEF]"
                />
                <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Set Actual Hours
                </span>
              </label>
              {editFields.has('actualHours') && (
                <input
                  type="number"
                  value={updates.actualHours || ''}
                  onChange={(e) => setUpdates({ ...updates, actualHours: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter hours..."
                  className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white dark:placeholder-gray-500"
                  style={{ fontSize: '14px' }}
                  step="0.5"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 p-6 dark:border-white/10 dark:bg-[#0C0F2C]">
          <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '13px' }}>
            {editFields.size} {editFields.size === 1 ? 'field' : 'fields'} selected for update
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-300 dark:hover:bg-[#0C0F2C]"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-6 py-2.5 text-white transition-opacity hover:opacity-90"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

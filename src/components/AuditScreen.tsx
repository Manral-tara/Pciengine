import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Flag, Clock, AlertTriangle, MessageSquare, FileText } from 'lucide-react';
import * as api from '../services/api';
import type { Task } from './TaskTable';
import type { Settings } from '../App';

interface AuditScreenProps {
  settings: Settings;
}

export function AuditScreen({ settings }: AuditScreenProps) {
  const [activeTab, setActiveTab] = useState<'review' | 'flags' | 'logs'>('review');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [flags, setFlags] = useState<api.Flag[]>([]);
  const [auditLogs, setAuditLogs] = useState<api.AuditLog[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<api.Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use branding colors
  const primaryColor = settings.primaryColor || '#2BBBEF';
  const secondaryColor = settings.secondaryColor || '#4AFFA8';
  const accentColor = settings.accentColor || '#010029';

  // Load tasks from backend on mount
  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const loadedTasks = await api.getTasks();
      // Filter out any null or undefined tasks
      setTasks(loadedTasks.filter(task => task != null));
      setError(null);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      setTasks([]);
      setError(error?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const loadedTasks = await api.getTasks();
      // Filter out any null or undefined tasks
      setTasks(loadedTasks.filter(task => task != null));

      if (activeTab === 'flags') {
        const loadedFlags = await api.getFlags();
        setFlags(loadedFlags);
      } else if (activeTab === 'logs') {
        const logs = await api.getAuditLogs();
        setAuditLogs(logs);
      }
    } catch (error: any) {
      console.error('Failed to load audit data:', error);
      setError(error?.message || 'Failed to load audit data');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(task: Task) {
    try {
      const notes = prompt('Add approval notes (optional):');
      await api.approveTask(task.id, notes || undefined);
      await loadData();
      alert('Task approved successfully!');
    } catch (error) {
      console.error('Failed to approve task:', error);
      alert('Failed to approve task');
    }
  }

  async function handleReject(task: Task) {
    try {
      const reason = prompt('Enter rejection reason:');
      if (!reason) return;
      await api.rejectTask(task.id, reason);
      await loadData();
      alert('Task rejected successfully!');
    } catch (error) {
      console.error('Failed to reject task:', error);
      alert('Failed to reject task');
    }
  }

  async function handleFlag(task: Task) {
    try {
      const reason = prompt('Enter flag reason:');
      if (!reason) return;
      const severity = prompt('Enter severity (low/medium/high):', 'medium') as 'low' | 'medium' | 'high';
      await api.flagTask(task.id, reason, severity);
      await loadData();
      alert('Task flagged successfully!');
    } catch (error) {
      console.error('Failed to flag task:', error);
      alert('Failed to flag task');
    }
  }

  async function handleResolveFlag(flag: api.Flag) {
    try {
      const resolution = prompt('Enter resolution notes:');
      if (!resolution) return;
      await api.updateFlag(flag.id, 'resolved', resolution);
      await loadData();
      alert('Flag resolved successfully!');
    } catch (error) {
      console.error('Failed to resolve flag:', error);
      alert('Failed to resolve flag');
    }
  }

  async function loadComments(taskId: string) {
    try {
      const taskComments = await api.getComments(taskId);
      setComments(taskComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  }

  async function handleAddComment(taskId: string) {
    if (!newComment.trim()) return;
    
    try {
      await api.addComment(taskId, newComment);
      setNewComment('');
      await loadComments(taskId);
      alert('Comment added successfully!');
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    }
  }

  const calculatePCI = (task: Task): number => {
    const pci = (task.ISR * task.CF * task.UXI) + 
                (task.RCF * task.AEP - task.L) + 
                (task.MLW * task.CGW * task.RF) + 
                (task.S * task.GLRI);
    return Math.max(0, pci);
  };

  const calculateAAS = (task: Task): number => {
    const pci = calculatePCI(task);
    if (pci === 0) return 0;
    return (task.aiVerifiedUnits / pci) * 100;
  };

  const getStatusBadge = (task: any) => {
    if (!task.auditStatus) {
      return <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-600" style={{ fontSize: '12px' }}>Pending Review</span>;
    }
    
    if (task.auditStatus === 'approved') {
      return <span className="rounded-full bg-green-100 px-2 py-1 text-green-700" style={{ fontSize: '12px' }}>✓ Approved</span>;
    }
    
    if (task.auditStatus === 'rejected') {
      return <span className="rounded-full bg-red-100 px-2 py-1 text-red-700" style={{ fontSize: '12px' }}>✗ Rejected</span>;
    }
    
    return <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-600" style={{ fontSize: '12px' }}>Pending</span>;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-[#010029]">Audit Layer</h1>
        <p className="text-gray-500">Review, approve, and track changes to your cost models</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Clock className="h-5 w-5 text-[#2BBBEF]" />
            </div>
            <div>
              <div className="text-gray-500" style={{ fontSize: '13px' }}>Pending Review</div>
              <div className="text-[#010029]">{tasks.filter(t => !t.auditStatus).length}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-gray-500" style={{ fontSize: '13px' }}>Approved</div>
              <div className="text-[#010029]">{tasks.filter(t => t.auditStatus === 'approved').length}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2">
              <Flag className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-gray-500" style={{ fontSize: '13px' }}>Open Flags</div>
              <div className="text-[#010029]">{flags.filter(f => f.status === 'open').length}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-gray-500" style={{ fontSize: '13px' }}>Total Logs</div>
              <div className="text-[#010029]">{auditLogs.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('review')}
          className={`px-4 py-2 transition-colors ${
            activeTab === 'review'
              ? 'border-b-2 text-[#2BBBEF]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          style={activeTab === 'review' ? { borderColor: primaryColor, color: primaryColor } : {}}
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Review Tasks
          </div>
        </button>
        <button
          onClick={() => setActiveTab('flags')}
          className={`px-4 py-2 transition-colors ${
            activeTab === 'flags'
              ? 'border-b-2 text-[#2BBBEF]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          style={activeTab === 'flags' ? { borderColor: primaryColor, color: primaryColor } : {}}
        >
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Flags
          </div>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-b-2 text-[#2BBBEF]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          style={activeTab === 'logs' ? { borderColor: primaryColor, color: primaryColor } : {}}
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit Logs
          </div>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <>
          {/* Review Tasks Tab */}
          {activeTab === 'review' && (
            <div className="space-y-4">
              {tasks.map((task) => {
                const pci = calculatePCI(task);
                const aas = calculateAAS(task);
                const hasLowAAS = aas < 85 && aas > 0;

                return (
                  <div key={task.id} className="rounded-xl border border-gray-200 bg-white p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="text-[#010029]">{task.taskName}</h3>
                          {getStatusBadge(task)}
                          {hasLowAAS && (
                            <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-red-600" style={{ fontSize: '12px' }}>
                              <AlertTriangle className="h-3 w-3" />
                              Low AAS
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-gray-600" style={{ fontSize: '14px' }}>
                          <div>PCI Units: <span className="text-[#010029]">{pci.toFixed(2)}</span></div>
                          <div>AI Verified: <span className="text-[#010029]">{task.aiVerifiedUnits.toFixed(2)}</span></div>
                          <div>
                            AAS: <span className={hasLowAAS ? 'text-red-600' : 'text-green-600'}>{aas.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!task.auditStatus && (
                          <>
                            <button
                              onClick={() => handleApprove(task)}
                              className="flex items-center gap-2 rounded-lg border border-green-600 bg-green-50 px-4 py-2 text-green-600 transition-colors hover:bg-green-600 hover:text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(task)}
                              className="flex items-center gap-2 rounded-lg border border-red-600 bg-red-50 px-4 py-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleFlag(task)}
                          className="flex items-center gap-2 rounded-lg border border-orange-600 bg-orange-50 px-4 py-2 text-orange-600 transition-colors hover:bg-orange-600 hover:text-white"
                        >
                          <Flag className="h-4 w-4" />
                          Flag
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            loadComments(task.id);
                          }}
                          className="flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-50 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Comments
                        </button>
                      </div>
                    </div>

                    {/* Approval/Rejection Info */}
                    {task.auditStatus === 'approved' && task.approvedAt && (
                      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                        <div className="text-green-700" style={{ fontSize: '13px' }}>
                          ✓ Approved on {formatDate(task.approvedAt)}
                          {task.approvalNotes && <div className="mt-1 text-green-600">Notes: {task.approvalNotes}</div>}
                        </div>
                      </div>
                    )}

                    {task.auditStatus === 'rejected' && task.rejectedAt && (
                      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                        <div className="text-red-700" style={{ fontSize: '13px' }}>
                          ✗ Rejected on {formatDate(task.rejectedAt)}
                          {task.rejectionReason && <div className="mt-1 text-red-600">Reason: {task.rejectionReason}</div>}
                        </div>
                      </div>
                    )}

                    {/* Comments Section */}
                    {selectedTask?.id === task.id && (
                      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h4 className="mb-3 text-[#010029]">Comments</h4>
                        <div className="mb-3 space-y-2">
                          {comments.length === 0 ? (
                            <p className="text-gray-500" style={{ fontSize: '14px' }}>No comments yet</p>
                          ) : (
                            comments.map((comment) => (
                              <div key={comment.id} className="rounded-lg border border-gray-200 bg-white p-3">
                                <div className="mb-1 text-gray-500" style={{ fontSize: '12px' }}>
                                  {formatDate(comment.createdAt)}
                                </div>
                                <div className="text-[#010029]" style={{ fontSize: '14px' }}>{comment.comment}</div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-2"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(task.id)}
                          />
                          <button
                            onClick={() => handleAddComment(task.id)}
                            className="rounded-lg px-4 py-2 text-white transition-opacity hover:opacity-90"
                            style={{ backgroundImage: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }}
                          >
                            Add Comment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Flags Tab */}
          {activeTab === 'flags' && (
            <div className="space-y-4">
              {flags.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                  <Flag className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                  <p className="text-gray-500">No flags found</p>
                </div>
              ) : (
                flags.map((flag) => {
                  const task = tasks.find(t => t.id === flag.taskId);
                  return (
                    <div key={flag.id} className={`rounded-xl border p-6 ${getSeverityColor(flag.severity)}`}>
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-[#010029]">{task?.taskName || 'Unknown Task'}</h3>
                            <span className="rounded-full bg-white px-2 py-1" style={{ fontSize: '12px' }}>
                              {flag.severity.toUpperCase()}
                            </span>
                            <span className="rounded-full bg-white px-2 py-1" style={{ fontSize: '12px' }}>
                              {flag.status}
                            </span>
                          </div>
                          <p className="text-gray-700" style={{ fontSize: '14px' }}>{flag.reason}</p>
                          <p className="mt-2 text-gray-500" style={{ fontSize: '12px' }}>
                            Flagged on {formatDate(flag.createdAt)}
                          </p>
                        </div>
                        {flag.status === 'open' && (
                          <button
                            onClick={() => handleResolveFlag(flag)}
                            className="rounded-lg border border-green-600 bg-white px-4 py-2 text-green-600 transition-colors hover:bg-green-600 hover:text-white"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                      {flag.resolution && (
                        <div className="mt-3 rounded-lg bg-white p-3">
                          <div className="mb-1 text-gray-600" style={{ fontSize: '12px' }}>Resolution:</div>
                          <div className="text-gray-700" style={{ fontSize: '14px' }}>{flag.resolution}</div>
                          <div className="mt-1 text-gray-500" style={{ fontSize: '12px' }}>
                            Resolved on {flag.resolvedAt && formatDate(flag.resolvedAt)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'logs' && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-gray-600" style={{ fontSize: '13px' }}>Timestamp</th>
                    <th className="px-6 py-3 text-left text-gray-600" style={{ fontSize: '13px' }}>Action</th>
                    <th className="px-6 py-3 text-left text-gray-600" style={{ fontSize: '13px' }}>Entity</th>
                    <th className="px-6 py-3 text-left text-gray-600" style={{ fontSize: '13px' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No audit logs yet
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-600" style={{ fontSize: '13px' }}>
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-600" style={{ fontSize: '12px' }}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700" style={{ fontSize: '13px' }}>
                          {log.entityType}
                        </td>
                        <td className="px-6 py-4 text-gray-600" style={{ fontSize: '13px' }}>
                          {JSON.stringify(log.changes).substring(0, 100)}...
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="text-red-700" style={{ fontSize: '13px' }}>
            Error: {error}
          </div>
        </div>
      )}
    </div>
  );
}
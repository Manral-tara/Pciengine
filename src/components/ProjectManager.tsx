import { useState, useEffect } from 'react';
import { Folder, Plus, Check, Edit2, Trash2, X, Search, FileText, BarChart3, TrendingUp, Shield, FolderOpen, ChevronDown, Clock, Archive, MoreVertical, AlertTriangle } from 'lucide-react';
import * as api from '../services/api';

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  totalPCI: number;
  totalCost: number;
  color?: string;
  isArchived?: boolean;
  archivedAt?: string;
}

interface ProjectManagerProps {
  currentProjectId: string | null;
  onProjectSelect: (projectId: string | null) => void;
  onProjectCreate: (project: Project) => void;
  compact?: boolean;
  onAIGenerateClick?: () => void;
}

export function ProjectManager({ currentProjectId, onProjectSelect, onProjectCreate, compact = false, onAIGenerateClick }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProjectList, setShowProjectList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const loadedProjects = await api.getProjects();
      setProjects(loadedProjects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const currentProject = projects.find(p => p.id === currentProjectId);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (compact) {
    // Compact dropdown selector for navigation
    return (
      <div className="relative">
        <button
          onClick={() => setShowProjectList(!showProjectList)}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 transition-all hover:border-[#2BBBEF] hover:bg-gray-50 dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-300 dark:hover:border-[#2BBBEF] dark:hover:bg-[#0C0F2C]"
          style={{ fontSize: '14px' }}
        >
          <FolderOpen className="h-4 w-4 text-[#2BBBEF]" />
          <span>{currentProject?.name || 'Select Project'}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showProjectList ? 'rotate-180' : ''}`} />
        </button>

        {showProjectList && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowProjectList(false)}
            />
            <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#161A3A]">
              {/* Search */}
              <div className="border-b border-gray-100 p-3 dark:border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-gray-800 placeholder-gray-400 focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white dark:placeholder-gray-500"
                    style={{ fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Project List */}
              <div className="max-h-96 overflow-y-auto p-2">
                {/* New Project Button */}
                <button
                  onClick={() => {
                    setShowProjectList(false);
                    setShowCreateModal(true);
                  }}
                  className="mb-2 flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-[#2BBBEF] bg-[#2BBBEF]/5 p-3 text-[#2BBBEF] transition-all hover:bg-[#2BBBEF]/10 dark:bg-[#2BBBEF]/10 dark:hover:bg-[#2BBBEF]/20"
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  <Plus className="h-4 w-4" />
                  Create New Project
                </button>

                {/* AI Generate Project Button */}
                {onAIGenerateClick && (
                  <button
                    onClick={() => {
                      setShowProjectList(false);
                      onAIGenerateClick();
                    }}
                    className="mb-3 flex w-full items-center gap-2 rounded-lg bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] p-3 text-white transition-all hover:opacity-90 shadow-md"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI Generate Project
                  </button>
                )}

                {/* Unsaved Project Option */}
                <button
                  onClick={() => {
                    onProjectSelect(null);
                    setShowProjectList(false);
                  }}
                  className={`mb-1 flex w-full items-start gap-3 rounded-lg p-3 text-left transition-all ${
                    currentProjectId === null
                      ? 'bg-gradient-to-r from-[#2BBBEF]/10 to-[#4AFFA8]/10 dark:from-[#2BBBEF]/20 dark:to-[#4AFFA8]/20'
                      : 'hover:bg-gray-50 dark:hover:bg-[#0C0F2C]'
                  }`}
                >
                  <FileText className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Unsaved Project
                      </span>
                      {currentProjectId === null && (
                        <Check className="h-3.5 w-3.5 text-[#2BBBEF]" />
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>
                      Current working session
                    </p>
                  </div>
                </button>

                {/* Saved Projects */}
                {filteredProjects.length === 0 && searchQuery ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '13px' }}>
                      No projects found
                    </p>
                  </div>
                ) : (
                  filteredProjects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => {
                        onProjectSelect(project.id);
                        setShowProjectList(false);
                      }}
                      className={`mb-1 flex w-full items-start gap-3 rounded-lg p-3 text-left transition-all ${
                        currentProjectId === project.id
                          ? 'bg-gradient-to-r from-[#2BBBEF]/10 to-[#4AFFA8]/10 dark:from-[#2BBBEF]/20 dark:to-[#4AFFA8]/20'
                          : 'hover:bg-gray-50 dark:hover:bg-[#0C0F2C]'
                      }`}
                    >
                      <div 
                        className="mt-0.5 flex h-4 w-4 items-center justify-center rounded"
                        style={{ backgroundColor: project.color || '#2BBBEF' }}
                      >
                        <Folder className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 500 }}>
                            {project.name}
                          </span>
                          {currentProjectId === project.id && (
                            <Check className="h-3.5 w-3.5 text-[#2BBBEF]" />
                          )}
                        </div>
                        {project.description && (
                          <p className="mb-1 text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>
                            {project.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-gray-400" style={{ fontSize: '10px' }}>
                          <span>{project.taskCount} tasks</span>
                          <span>${project.totalCost.toLocaleString()}</span>
                          <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <CreateProjectModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={(project) => {
              setProjects([...projects, project]);
              onProjectCreate(project);
              setShowCreateModal(false);
            }}
          />
        )}
      </div>
    );
  }

  // Full project management view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-gray-900 dark:text-white" style={{ fontSize: '24px', fontWeight: 700 }}>
            Project Manager
          </h2>
          <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>
            Organize and manage your project portfolio
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-5 py-2.5 text-white transition-opacity hover:opacity-90 shadow-md"
          style={{ fontSize: '14px', fontWeight: 600 }}
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#2BBBEF]"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-white/10 dark:bg-[#161A3A]">
          <Folder className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mb-2 text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
            No projects yet
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>
            Create your first project to start organizing your tasks
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-5 py-2.5 text-white transition-opacity hover:opacity-90"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            <Plus className="h-4 w-4" />
            Create New Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              isActive={currentProjectId === project.id}
              onSelect={() => onProjectSelect(project.id)}
              onUpdate={(updated) => {
                setProjects(projects.map(p => p.id === updated.id ? updated : p));
              }}
              onDelete={() => {
                setProjects(projects.filter(p => p.id !== project.id));
                if (currentProjectId === project.id) {
                  onProjectSelect(null);
                }
              }}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(project) => {
            setProjects([...projects, project]);
            onProjectCreate(project);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  isActive: boolean;
  onSelect: () => void;
  onUpdate: (project: Project) => void;
  onDelete: () => void;
}

function ProjectCard({ project, isActive, onSelect, onUpdate, onDelete }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await api.deleteProject(project.id);
      onDelete();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handleArchive = async () => {
    try {
      const updated = {
        ...project,
        isArchived: !project.isArchived,
        archivedAt: project.isArchived ? undefined : new Date().toISOString(),
      };
      await api.updateProject(project.id, updated);
      onUpdate(updated);
      setShowArchiveConfirm(false);
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to archive project:', error);
      alert('Failed to archive project. Please try again.');
    }
  };

  return (
    <>
      <div
        className={`group relative cursor-pointer rounded-xl border p-6 transition-all hover:shadow-lg ${
          isActive
            ? 'border-[#2BBBEF] bg-gradient-to-br from-[#2BBBEF]/5 to-[#4AFFA8]/5 shadow-md dark:from-[#2BBBEF]/10 dark:to-[#4AFFA8]/10'
            : 'border-gray-200 bg-white hover:border-[#2BBBEF] dark:border-white/10 dark:bg-[#161A3A]'
        } ${project.isArchived ? 'opacity-60' : ''}`}
      >
        {/* Action Menu Button */}
        <div className="absolute right-4 top-4 flex items-center gap-2">
          {project.isArchived && (
            <span className="flex items-center gap-1 rounded-full bg-gray-500 px-2 py-0.5 text-white" style={{ fontSize: '10px', fontWeight: 600 }}>
              <Archive className="h-3 w-3" />
              ARCHIVED
            </span>
          )}
          {isActive && !project.isArchived && (
            <span className="rounded-full bg-[#2BBBEF] px-2 py-0.5 text-white" style={{ fontSize: '10px', fontWeight: 600 }}>
              ACTIVE
            </span>
          )}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="rounded-lg p-1.5 text-gray-400 opacity-0 transition-all hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-[#0C0F2C] dark:hover:text-gray-300"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#161A3A]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowArchiveConfirm(true);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 p-3 text-left transition-all hover:bg-gray-50 dark:hover:bg-[#0C0F2C]"
                  >
                    <Archive className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 500 }}>
                      {project.isArchived ? 'Unarchive Project' : 'Archive Project'}
                    </span>
                  </button>
                  <div className="border-t border-gray-100 dark:border-white/10" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 p-3 text-left transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-red-600 dark:text-red-400" style={{ fontSize: '13px', fontWeight: 500 }}>
                      Delete Project
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Project Content - Click to Select */}
        <div onClick={onSelect}>
          {/* Project Icon */}
          <div 
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: project.color || '#2BBBEF' }}
          >
            <Folder className="h-6 w-6 text-white" />
          </div>

          {/* Project Info */}
          <h3 className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
            {project.name}
          </h3>
          {project.description && (
            <p className="mb-4 text-gray-600 dark:text-gray-400" style={{ fontSize: '13px' }}>
              {project.description}
            </p>
          )}

          {/* Stats */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>Tasks</p>
              <p className="text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                {project.taskCount}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>Total Cost</p>
              <p className="text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                ${project.totalCost.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 border-t border-gray-100 pt-4 text-gray-500 dark:border-white/10 dark:text-gray-400" style={{ fontSize: '11px' }}>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated {new Date(project.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0C0F2C]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                    Delete Project?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>
                    Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be undone.
                  </p>
                  {project.taskCount > 0 && (
                    <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 dark:bg-red-900/20 dark:border-red-900/50">
                      <p className="text-red-800 dark:text-red-300" style={{ fontSize: '12px' }}>
                        ⚠️ This project contains {project.taskCount} task{project.taskCount > 1 ? 's' : ''}. All tasks will be permanently deleted.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-300 dark:hover:bg-[#0C0F2C]"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white transition-all hover:bg-red-700"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowArchiveConfirm(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0C0F2C]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Archive className="h-6 w-6 text-[#2BBBEF]" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-gray-900 dark:text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
                    {project.isArchived ? 'Unarchive' : 'Archive'} Project?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '14px' }}>
                    {project.isArchived 
                      ? `Restore ${project.name} to your active projects?`
                      : `Archive ${project.name}? You can unarchive it later if needed.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowArchiveConfirm(false)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-300 dark:hover:bg-[#0C0F2C]"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchive}
                  className="rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-4 py-2 text-white transition-all hover:opacity-90"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  {project.isArchived ? 'Unarchive' : 'Archive'} Project
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

function CreateProjectModal({ onClose, onSuccess }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2BBBEF');
  const [loading, setLoading] = useState(false);

  const colors = [
    '#2BBBEF', '#4AFFA8', '#FF6B6B', '#FFD93D', '#A78BFA', '#FB7185', '#34D399', '#60A5FA'
  ];

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('Please enter a project name');
      return;
    }

    try {
      setLoading(true);
      const project: Project = {
        id: `project-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taskCount: 0,
        totalPCI: 0,
        totalCost: 0,
        color,
      };

      await api.createProject(project);
      onSuccess(project);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
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
          className="w-full max-w-2xl rounded-t-3xl border-t border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0C0F2C]"
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
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-[#2BBBEF]/20 to-[#4AFFA8]/20 blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] shadow-lg">
                    <Folder className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="mb-2 bg-gradient-to-r from-[#2BBBEF] to-[#4AFFA8] bg-clip-text text-transparent" style={{ fontSize: '28px', fontWeight: 700 }}>
                    Create New Project
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400" style={{ fontSize: '15px', maxWidth: '500px' }}>
                    Organize your tasks into a named project for better management and tracking
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

            {/* Form */}
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E-commerce Platform Redesign"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white dark:placeholder-gray-500"
                  style={{ fontSize: '14px' }}
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the project scope and objectives..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white dark:placeholder-gray-500"
                  style={{ fontSize: '14px' }}
                />
              </div>

              <div>
                <label className="mb-2 block text-gray-700 dark:text-gray-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Project Color
                </label>
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`h-10 w-10 rounded-lg transition-all hover:scale-110 ${
                        color === c ? 'ring-2 ring-offset-2 ring-[#2BBBEF] dark:ring-offset-[#0C0F2C]' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
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
                disabled={loading || !name.trim()}
                className="rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-8 py-3 text-white transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-50"
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </span>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
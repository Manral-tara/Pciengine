import { useState } from 'react';
import { ChevronDown, ChevronRight, ListTodo, Sparkles, Loader2, Plus, Edit2, Trash2, Save, X, Wand2 } from 'lucide-react';
import type { Task, TaskElement } from './TaskTable';
import * as api from '../services/api';

interface TaskElementsRowProps {
  task: Task;
  onTaskUpdate: (taskId: string, elements: TaskElement[], expanded: boolean) => void;
  columnCount: number;
}

export function TaskElementsRow({ task, onTaskUpdate, columnCount }: TaskElementsRowProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Development');
  
  const isExpanded = task.elementsExpanded || false;
  const hasElements = task.taskElements && task.taskElements.length > 0;
  
  const categories = ['Development', 'Design', 'Testing', 'Deployment', 'Documentation', 'Other'];

  const toggleExpand = () => {
    if (!hasElements && !isGenerating) {
      // Generate elements if they don't exist
      generateElements();
    } else {
      // Just toggle the expansion
      onTaskUpdate(task.id, task.taskElements || [], !isExpanded);
    }
  };

  const generateElements = async () => {
    setIsGenerating(true);
    try {
      const response = await api.generateTaskElements(task);
      if (response.elements) {
        onTaskUpdate(task.id, response.elements, true);
      }
    } catch (error) {
      console.error('Failed to generate task elements:', error);
      alert('Failed to generate task elements. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateElements = async () => {
    await generateElements();
  };

  const enhanceElements = async () => {
    setIsEnhancing(true);
    try {
      const response = await api.enhanceTaskElements(task);
      if (response.elements) {
        onTaskUpdate(task.id, response.elements, true);
      }
    } catch (error) {
      console.error('Failed to enhance task elements:', error);
      alert('Failed to enhance task elements. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const startEdit = (element: TaskElement) => {
    setEditingElementId(element.id);
    setEditTitle(element.title);
    setEditDescription(element.description);
    setEditCategory(element.category);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingElementId(null);
    setEditTitle('');
    setEditDescription('');
    setEditCategory('');
  };

  const saveEdit = () => {
    if (!editingElementId || !editTitle.trim() || !editDescription.trim()) return;
    const updatedElements = task.taskElements?.map((element) => {
      if (element.id === editingElementId) {
        return {
          ...element,
          title: editTitle,
          description: editDescription,
          category: editCategory,
        };
      }
      return element;
    });
    onTaskUpdate(task.id, updatedElements || [], true);
    cancelEdit();
  };

  const deleteElement = (elementId: string) => {
    if (!confirm('Are you sure you want to delete this subtask?')) return;
    const updatedElements = task.taskElements?.filter((element) => element.id !== elementId);
    onTaskUpdate(task.id, updatedElements || [], true);
  };

  const addElement = () => {
    if (!newTitle.trim() || !newDescription.trim()) return;
    const newElement: TaskElement = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDescription,
      category: newCategory,
    };
    const updatedElements = task.taskElements ? [...task.taskElements, newElement] : [newElement];
    onTaskUpdate(task.id, updatedElements, true);
    setShowAddForm(false);
    setNewTitle('');
    setNewDescription('');
    setNewCategory('Development');
  };

  return (
    <>
      {/* Toggle Row */}
      <div className="border-t border-gray-100 bg-gradient-to-r from-blue-50/30 via-transparent to-transparent dark:border-white/5 dark:from-blue-900/10">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleExpand}
              disabled={isGenerating}
              className="group flex items-center gap-2 text-gray-600 transition-all hover:text-[#2BBBEF] disabled:opacity-50 dark:text-gray-400 dark:hover:text-[#2BBBEF]"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#2BBBEF]" />
              ) : isExpanded ? (
                <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              ) : (
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
              <ListTodo className="h-4 w-4" />
              <span style={{ fontSize: '13px', fontWeight: 500 }}>
                {isGenerating ? 'Generating subtasks...' : hasElements ? 'Subtasks' : 'Generate Subtasks'}
              </span>
              {hasElements && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2BBBEF] text-white" style={{ fontSize: '10px' }}>
                  {task.taskElements?.length}
                </span>
              )}
            </button>
            {hasElements && isExpanded && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setEditingElementId(null);
                  }}
                  className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-gray-600 transition-all hover:border-[#4AFFA8] hover:bg-[#4AFFA8] hover:text-white dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-300 dark:hover:border-[#4AFFA8]"
                  style={{ fontSize: '12px', fontWeight: 500 }}
                >
                  <Plus className="h-3 w-3" />
                  Add Manual
                </button>
                <button
                  onClick={enhanceElements}
                  disabled={isEnhancing}
                  className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-gray-600 transition-all hover:border-[#2BBBEF] hover:bg-[#2BBBEF] hover:text-white disabled:opacity-50 dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-300 dark:hover:border-[#2BBBEF]"
                  style={{ fontSize: '12px', fontWeight: 500 }}
                >
                  {isEnhancing ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3 w-3" />
                      AI Enhance
                    </>
                  )}
                </button>
                <button
                  onClick={regenerateElements}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-gray-600 transition-all hover:border-[#2BBBEF] hover:bg-[#2BBBEF] hover:text-white disabled:opacity-50 dark:border-white/10 dark:bg-[#161A3A] dark:text-gray-300 dark:hover:border-[#2BBBEF]"
                  style={{ fontSize: '12px', fontWeight: 500 }}
                >
                  <Sparkles className="h-3 w-3" />
                  Regenerate All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Elements Content Row */}
      {isExpanded && hasElements && (
        <div className="border-t border-gray-100 bg-gradient-to-b from-blue-50/20 to-transparent px-6 py-5 dark:border-white/5 dark:from-blue-900/10">
          {/* Add Form */}
          {showAddForm && (
            <div className="mb-4 rounded-lg border-2 border-dashed border-[#4AFFA8]/30 bg-white p-4 dark:border-[#4AFFA8]/20 dark:bg-[#161A3A]">
              <h5 className="mb-3 text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                Add New Subtask
              </h5>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Build authentication API"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                    style={{ fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                    Description
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe what needs to be done..."
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                    style={{ fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                    style={{ fontSize: '13px' }}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewTitle('');
                      setNewDescription('');
                      setNewCategory('Development');
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-600 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-gray-300 dark:hover:bg-[#161A3A]"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={addElement}
                    disabled={!newTitle.trim() || !newDescription.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#4AFFA8] to-[#2BBBEF] px-4 py-2 text-white transition-all hover:shadow-lg disabled:opacity-50"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Subtask
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {editingElementId && (
            <div className="mb-4 rounded-lg border-2 border-dashed border-[#2BBBEF]/30 bg-white p-4 dark:border-[#2BBBEF]/20 dark:bg-[#161A3A]">
              <h5 className="mb-3 text-gray-900 dark:text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                Edit Subtask
              </h5>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                    style={{ fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                    style={{ fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-gray-700 dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 500 }}>
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all focus:border-[#2BBBEF] focus:outline-none focus:ring-2 focus:ring-[#2BBBEF]/20 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-white"
                    style={{ fontSize: '13px' }}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-600 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#0C0F2C] dark:text-gray-300 dark:hover:bg-[#161A3A]"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={!editTitle.trim() || !editDescription.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#2BBBEF] to-[#4AFFA8] px-4 py-2 text-white transition-all hover:shadow-lg disabled:opacity-50"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Subtasks Grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {task.taskElements?.map((element) => (
              <div
                key={element.id}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-[#2BBBEF]/50 hover:shadow-md dark:border-white/10 dark:bg-[#161A3A]"
              >
                {/* Category Badge */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span
                    className="flex-shrink-0 rounded-md px-2 py-1 text-white"
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.3px',
                      backgroundColor:
                        element.category === 'Development'
                          ? '#2BBBEF'
                          : element.category === 'Design'
                          ? '#4AFFA8'
                          : element.category === 'Testing'
                          ? '#FF6B6B'
                          : element.category === 'Deployment'
                          ? '#FFA500'
                          : element.category === 'Documentation'
                          ? '#9B59B6'
                          : '#999',
                    }}
                  >
                    {element.category}
                  </span>
                  {/* Action Buttons - Hidden until hover */}
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => startEdit(element)}
                      className="rounded p-1 text-gray-400 transition-colors hover:bg-blue-50 hover:text-[#2BBBEF] dark:hover:bg-blue-900/30"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteElement(element.id)}
                      className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h4 className="mb-2 text-[#010029] dark:text-white" style={{ fontSize: '13px', fontWeight: 600, lineHeight: '1.4' }}>
                  {element.title}
                </h4>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed dark:text-gray-400" style={{ fontSize: '12px' }}>
                  {element.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

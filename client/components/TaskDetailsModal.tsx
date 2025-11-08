'use client';

import { useState, useEffect } from 'react';
import type { Task } from '@/types';
import { taskService } from '@/lib/taskService';
import { categoryService } from '@/lib/categoryService';
import { X, Clock, Calendar, CheckCircle2, Trash2, Edit2, Save } from 'lucide-react';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onComplete: () => void;
  onDelete: () => void;
}

const TaskDetailsModal = ({ task, onClose, onComplete, onDelete }: TaskDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [editedTask, setEditedTask] = useState({
    name: task.name || task.title || '',
    description: task.description || '',
    category: task.category || '',
    estimatedTime: task.estimatedTime?.toString() || '',
    startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
    startTime: task.startTime || '',
    isReminder: task.isReminder || false,
    reminderDeadline: task.reminderDeadline ? new Date(task.reminderDeadline).toISOString().slice(0, 16) : '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await categoryService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const taskName = task.name || task.title || 'Untitled Task';

  const getPriorityColor = (category?: string) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    
    // Default colors for predefined categories
    const categoryColors: { [key: string]: string } = {
      'laila': 'bg-pink-100 text-pink-800',
      'work': 'bg-blue-100 text-blue-800',
      'life': 'bg-green-100 text-green-800',
      'study': 'bg-purple-100 text-purple-800',
      'personal': 'bg-yellow-100 text-yellow-800',
      'shopping': 'bg-emerald-100 text-emerald-800',
      'health': 'bg-red-100 text-red-800',
      'education': 'bg-indigo-100 text-indigo-800',
    };
    
    return categoryColors[category.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      onDelete();
      onClose();
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSave = async () => {
    try {
      await taskService.updateTask(task._id, {
        name: editedTask.name,
        description: editedTask.description,
        category: editedTask.category || undefined,
        estimatedTime: editedTask.estimatedTime ? Number.parseInt(editedTask.estimatedTime) : undefined,
        startDate: editedTask.startDate || undefined,
        startTime: editedTask.startTime || undefined,
        isReminder: editedTask.isReminder,
        reminderDeadline: editedTask.isReminder && editedTask.reminderDeadline ? editedTask.reminderDeadline : undefined,
      });
      setIsEditing(false);
      onClose();
      // Trigger parent refresh
      window.location.reload();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          {isEditing ? (
            <input
              type="text"
              value={editedTask.name}
              onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
              className="text-2xl font-bold text-gray-900 flex-1 border-b-2 border-blue-500 focus:outline-none"
            />
          ) : (
            <h2 className={`text-2xl font-bold text-gray-900 flex-1 ${task.isCompleted ? 'line-through' : ''}`}>
              {taskName}
            </h2>
          )}
          <div className="flex gap-2 ml-4">
            <button
              type="button"
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              className="text-blue-500 hover:text-blue-600"
            >
              {isEditing ? <Save size={24} /> : <Edit2 size={24} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <textarea
              value={editedTask.description}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        ) : (
          task.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
            {isEditing ? (
              <select
                value={editedTask.category}
                onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            ) : (
              task.category && (
                <span className={`inline-block text-sm px-3 py-1 rounded-full ${getPriorityColor(task.category)}`}>
                  {task.category}
                </span>
              )
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Estimated Time (minutes)</h3>
            {isEditing ? (
              <input
                type="number"
                value={editedTask.estimatedTime}
                onChange={(e) => setEditedTask({ ...editedTask, estimatedTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            ) : (
              task.estimatedTime && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={18} />
                  <span>{task.estimatedTime} minutes</span>
                </div>
              )
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Start Date</h3>
            {isEditing ? (
              <input
                type="date"
                value={editedTask.startDate}
                onChange={(e) => setEditedTask({ ...editedTask, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              task.startDate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={18} />
                  <span>
                    {new Date(task.startDate).toLocaleDateString()}
                    {task.startTime && ` at ${task.startTime}`}
                  </span>
                </div>
              )
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Start Time</h3>
            {isEditing ? (
              <input
                type="time"
                value={editedTask.startTime}
                onChange={(e) => setEditedTask({ ...editedTask, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              task.startTime && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={18} />
                  <span>{task.startTime}</span>
                </div>
              )
            )}
          </div>

          {!isEditing && task.dueDate && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Due Date</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {!isEditing && task.frequency && task.frequency !== 'once' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Frequency</h3>
              <span className="text-gray-600 capitalize">{task.frequency}</span>
            </div>
          )}

          {/* Reminder fields in edit mode */}
          {isEditing && (
            <div className="col-span-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="isReminder-edit"
                  checked={editedTask.isReminder}
                  onChange={(e) => setEditedTask({ ...editedTask, isReminder: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isReminder-edit" className="text-sm font-medium text-gray-900">
                  Set as Reminder
                </label>
              </div>
              
              {editedTask.isReminder && (
                <div>
                  <label htmlFor="reminderDeadline-edit" className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Deadline
                  </label>
                  <input
                    id="reminderDeadline-edit"
                    type="datetime-local"
                    value={editedTask.reminderDeadline}
                    onChange={(e) => setEditedTask({ ...editedTask, reminderDeadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-2 text-xs text-gray-600">
                    ℹ️ Notifications at 60, 30, 10, and 5 minutes before deadline.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reminder info in view mode */}
          {!isEditing && task.isReminder && task.reminderDeadline && (
            <div className="col-span-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                🔔 Reminder Deadline
              </h3>
              <p className="text-gray-900 font-medium">
                {new Date(task.reminderDeadline).toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-gray-600">
                You'll receive notifications at 60, 30, 10, and 5 minutes before this deadline.
              </p>
            </div>
          )}

          {!isEditing && task.isCompleted && task.completedAt && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Completed At</h3>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 size={18} />
                <span>{new Date(task.completedAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleComplete}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle2 size={18} />
            {task.isCompleted ? 'Completed' : 'Mark Complete'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 size={18} />
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;

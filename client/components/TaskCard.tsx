'use client';

import { useState } from 'react';
import type { Task, Column } from '@/types';
import { taskService } from '@/lib/taskService';
import { Clock, CheckCircle2, Trash2, Plus, List } from 'lucide-react';
import CreateSubtaskModal from './CreateSubtaskModal';
import CreateBulkSubtasksModal from './CreateBulkSubtasksModal';
import TaskDetailsModal from './TaskDetailsModal';

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  onUpdate: () => void;
  columns: Column[];
  subtasks?: Task[];
}

const TaskCard = ({ task, isDragging, onUpdate, columns, subtasks = [] }: TaskCardProps) => {
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [showSubtaskMenu, setShowSubtaskMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const taskName = task.name || task.title || 'Untitled Task';
  const hasSubtasks = subtasks.length > 0;

  const handleComplete = async () => {
    try {
      await taskService.markTaskComplete(task._id);
      onUpdate();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskService.deleteTask(task._id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSubtaskComplete = async (subtaskId: string) => {
    try {
      await taskService.markTaskComplete(subtaskId);
      onUpdate();
    } catch (error) {
      console.error('Error completing subtask:', error);
    }
  };

  const handleSubtaskDelete = async (subtaskId: string) => {
    if (!confirm('Are you sure you want to delete this subtask?')) return;
    
    try {
      await taskService.deleteTask(subtaskId);
      onUpdate();
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

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

  return (
    <>
      <div
        className={`bg-white rounded-lg p-4 mb-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
          isDragging ? 'opacity-50' : ''
        } ${task.isCompleted ? 'opacity-60' : ''}`}
        onClick={() => setIsDetailsModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsDetailsModalOpen(true);
          }
        }}
        role="button"
        tabIndex={0}
      >
        {/* Main Task */}
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-medium text-gray-900 ${task.isCompleted ? 'line-through' : ''} flex-1`}>
            {taskName}
          </h3>
          <div className="flex gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleComplete();
              }}
              className="text-gray-400 hover:text-green-500 transition-colors"
            >
              <CheckCircle2 size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
        )}

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {hasSubtasks && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors text-xs flex items-center gap-1"
                aria-label={isExpanded ? 'Hide subtasks' : 'Show subtasks'}
              >
                {isExpanded ? '▼' : '▶'} {subtasks.length}
              </button>
            )}
            
            {task.category && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.category)}`}
              >
                {task.category}
              </span>
            )}

            {task.estimatedTime && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={14} />
                {task.estimatedTime}m
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSubtaskMenu(!showSubtaskMenu);
              }}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
            >
              <Plus size={14} />
              Subtask
            </button>

            {showSubtaskMenu && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-40">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubtaskModalOpen(true);
                    setShowSubtaskMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Plus size={14} />
                  Add One
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkModalOpen(true);
                    setShowSubtaskMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <List size={14} />
                  Add Bulk
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subtasks List */}
        {hasSubtasks && isExpanded && (
          <div className="mt-3 space-y-2 border-l-2 border-gray-200 pl-4">
            {subtasks.map((subtask) => {
              const subtaskName = subtask.name || subtask.title || 'Untitled Subtask';
              return (
                <div
                  key={subtask._id}
                  className={`bg-gray-50 rounded p-2 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                    subtask.isCompleted ? 'opacity-60' : ''
                  }`}
                  onClick={() => {
                    setSelectedTask(subtask);
                    setIsDetailsModalOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium text-gray-800 ${subtask.isCompleted ? 'line-through' : ''}`}>
                        {subtaskName}
                      </h4>
                      {subtask.description && (
                        <p className="text-xs text-gray-600 mt-1">{subtask.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {subtask.category && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(subtask.category)}`}>
                            {subtask.category}
                          </span>
                        )}
                        {subtask.estimatedTime && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock size={12} />
                            {subtask.estimatedTime}m
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubtaskComplete(subtask._id);
                        }}
                        className="text-gray-400 hover:text-green-500 transition-colors"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubtaskDelete(subtask._id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isSubtaskModalOpen && (
        <CreateSubtaskModal
          onClose={() => setIsSubtaskModalOpen(false)}
          onSubtaskCreated={() => {
            setIsSubtaskModalOpen(false);
            setIsExpanded(true); // Auto-expand when new subtask is created
            onUpdate();
          }}
          parentTaskId={task._id}
          columns={columns}
          defaultColumnId={typeof task.columnId === 'string' ? task.columnId : task.columnId._id}
        />
      )}

      {isBulkModalOpen && (
        <CreateBulkSubtasksModal
          onClose={() => setIsBulkModalOpen(false)}
          onSubtasksCreated={() => {
            setIsBulkModalOpen(false);
            setIsExpanded(true); // Auto-expand when bulk subtasks are created
            onUpdate();
          }}
          parentTaskId={task._id}
          columns={columns}
          defaultColumnId={typeof task.columnId === 'string' ? task.columnId : task.columnId._id}
        />
      )}

      {isDetailsModalOpen && (
        <TaskDetailsModal
          task={selectedTask || task}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedTask(null);
          }}
          onComplete={() => {
            if (selectedTask) {
              handleSubtaskComplete(selectedTask._id);
            } else {
              handleComplete();
            }
            setIsDetailsModalOpen(false);
            setSelectedTask(null);
          }}
          onDelete={() => {
            if (selectedTask) {
              handleSubtaskDelete(selectedTask._id);
            } else {
              handleDelete();
            }
            setIsDetailsModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
    </>
  );
};

export default TaskCard;

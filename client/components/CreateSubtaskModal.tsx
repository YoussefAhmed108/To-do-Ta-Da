'use client';

import { useState } from 'react';
import type { Column } from '@/types';
import { taskService } from '@/lib/taskService';
import { X } from 'lucide-react';

interface CreateSubtaskModalProps {
  onClose: () => void;
  onSubtaskCreated: () => void;
  parentTaskId: string;
  columns: Column[];
  defaultColumnId?: string;
}

const CreateSubtaskModal = ({
  onClose,
  onSubtaskCreated,
  parentTaskId,
  columns,
  defaultColumnId,
}: CreateSubtaskModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    columnId: defaultColumnId || columns[0]?._id || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await taskService.createTask({
        name: formData.name,
        description: formData.description,
        columnId: formData.columnId,
        parentTaskId: parentTaskId,
        position: 0,
      });
      onSubtaskCreated();
    } catch (error) {
      console.error('Error creating subtask:', error);
      alert('Failed to create subtask. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Create Subtask</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name*
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Column*
            </label>
            <select
              required
              value={formData.columnId}
              onChange={(e) => setFormData({ ...formData, columnId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {columns.map((column) => (
                <option key={column._id} value={column._id}>
                  {column.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create Subtask
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubtaskModal;

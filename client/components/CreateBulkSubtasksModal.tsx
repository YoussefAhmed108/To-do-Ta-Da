'use client';

import { useState } from 'react';
import type { Column } from '@/types';
import api from '@/lib/api';
import { X } from 'lucide-react';

interface CreateBulkSubtasksModalProps {
  onClose: () => void;
  onSubtasksCreated: () => void;
  parentTaskId: string;
  columns: Column[];
  defaultColumnId?: string;
}

const CreateBulkSubtasksModal = ({
  onClose,
  onSubtasksCreated,
  parentTaskId,
  columns,
  defaultColumnId,
}: CreateBulkSubtasksModalProps) => {
  const [formData, setFormData] = useState({
    prefix: '',
    start: 1,
    end: 10,
    columnId: defaultColumnId || columns[0]?._id || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.start > formData.end) {
      alert('Start number must be less than or equal to end number');
      return;
    }

    try {
      await api.post('/tasks/bulk-subtasks', {
        parentTaskId,
        prefix: formData.prefix,
        start: formData.start,
        end: formData.end,
        columnId: formData.columnId,
      });
      onSubtasksCreated();
    } catch (error) {
      console.error('Error creating bulk subtasks:', error);
      alert('Failed to create bulk subtasks. Please try again.');
    }
  };

  const previewCount = formData.end - formData.start + 1;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md shadow-xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Create Bulk Subtasks</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prefix*
            </label>
            <input
              type="text"
              required
              value={formData.prefix}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., Video, Task, Chapter"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Number*
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: Number.parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Number*
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: Number.parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
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

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Preview:</strong> Will create {previewCount} subtasks
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {formData.prefix} {formData.start}, {formData.prefix} {formData.start + 1}, ... {formData.prefix} {formData.end}
            </p>
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
              Create {previewCount} Subtasks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBulkSubtasksModal;

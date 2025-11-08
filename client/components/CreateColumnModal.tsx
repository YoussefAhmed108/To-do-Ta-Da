'use client';

import { useState } from 'react';
import { columnService } from '@/lib/columnService';
import { X } from 'lucide-react';

interface CreateColumnModalProps {
  onClose: () => void;
  onColumnCreated: () => void;
}

const CreateColumnModal = ({ onClose, onColumnCreated }: CreateColumnModalProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await columnService.createColumn(name, color);
      onColumnCreated();
    } catch (error) {
      console.error('Error creating column:', error);
    }
  };

  const colorOptions = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280', // Gray
  ];

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md shadow-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Create New Column</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Column Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="To Do"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === colorOption ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: colorOption }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Create Column
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateColumnModal;

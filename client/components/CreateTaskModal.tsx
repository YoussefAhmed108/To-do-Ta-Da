'use client';

import { useState, useEffect } from 'react';
import type { Column, DayOfWeek } from '@/types';
import { TaskFrequency } from '@/types';
import { taskService } from '@/lib/taskService';
import { categoryService } from '@/lib/categoryService';
import { X, Plus } from 'lucide-react';

interface CreateTaskModalProps {
  onClose: () => void;
  onTaskCreated: () => void;
  defaultColumnId?: string;
  columns: Column[];
}

const CreateTaskModal = ({
  onClose,
  onTaskCreated,
  defaultColumnId,
  columns,
}: CreateTaskModalProps) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    columnId: defaultColumnId || columns[0]?._id || '',
    category: '',
    estimatedTime: '',
    startDate: '',
    startTime: '',
    frequency: TaskFrequency.ONCE,
    customDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    } as DayOfWeek,
    isReminder: false,
    reminderDeadline: '',
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

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      const updatedCategories = await categoryService.addCategory(newCategory.trim());
      setCategories(updatedCategories);
      setFormData({ ...formData, category: newCategory.trim() });
      setNewCategory('');
      setShowAddCategory(false);
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category. It may already exist.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await taskService.createTask({
        name: formData.name,
        description: formData.description,
        columnId: formData.columnId,
        category: formData.category || undefined,
        estimatedTime: formData.estimatedTime ? Number.parseInt(formData.estimatedTime) : undefined,
        startDate: formData.startDate || undefined,
        startTime: formData.startTime || undefined,
        frequency: formData.frequency,
        customDays: formData.frequency === TaskFrequency.CUSTOM ? formData.customDays : undefined,
        position: 0,
        isReminder: formData.isReminder,
        reminderDeadline: formData.isReminder && formData.reminderDeadline ? formData.reminderDeadline : undefined,
        isCompleted: false,
        completions: [],
        timeEntries: [],
      });

      onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const toggleCustomDay = (day: keyof DayOfWeek) => {
    setFormData({
      ...formData,
      customDays: {
        ...formData.customDays,
        [day]: !formData.customDays[day],
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Column
                </label>
                <select
                  value={formData.columnId}
                  onChange={(e) => setFormData({ ...formData, columnId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {columns.map((column) => (
                    <option key={column._id} value={column._id}>
                      {column.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {!showAddCategory ? (
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(true)}
                      className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-1 transition-colors"
                      title="Add new category"
                    >
                      <Plus size={18} />
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCategory();
                          } else if (e.key === 'Escape') {
                            setShowAddCategory(false);
                            setNewCategory('');
                          }
                        }}
                        placeholder="New category"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddCategory(false);
                          setNewCategory('');
                        }}
                        className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time (minutes)
                </label>
                <input
                  id="estimatedTime"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="30"
                  min="1"
                />
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date (Optional)
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time (Optional)
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Task description"
                  rows={6}
                  required
                />
              </div>

              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as TaskFrequency })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value={TaskFrequency.ONCE}>Once</option>
                  <option value={TaskFrequency.DAILY}>Daily</option>
                  <option value={TaskFrequency.WEEKDAYS}>Weekdays (Mon-Fri)</option>
                  <option value={TaskFrequency.WEEKENDS}>Weekends (Sat-Sun)</option>
                  <option value={TaskFrequency.CUSTOM}>Custom Days</option>
                </select>
              </div>

              {formData.frequency === TaskFrequency.CUSTOM && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as Array<keyof DayOfWeek>).map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleCustomDay(day)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          formData.customDays[day]
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reminder Section */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="isReminder"
                checked={formData.isReminder}
                onChange={(e) => setFormData({ ...formData, isReminder: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isReminder" className="text-sm font-medium text-gray-900">
                Set as Reminder
              </label>
            </div>
            
            {formData.isReminder && (
              <div>
                <label htmlFor="reminderDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  id="reminderDeadline"
                  type="datetime-local"
                  value={formData.reminderDeadline}
                  onChange={(e) => setFormData({ ...formData, reminderDeadline: e.target.value })}
                  required={formData.isReminder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
                <p className="mt-2 text-xs text-gray-600">
                  ℹ️ You'll receive notifications at 60, 30, 10, and 5 minutes before the deadline via Google Chat or email.
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;

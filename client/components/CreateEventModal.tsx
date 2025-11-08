'use client';

import { useState } from 'react';
import { eventService } from '@/lib/eventService';
import type { DayOfWeek } from '@/types';
import { TaskFrequency } from '@/types';
import { X } from 'lucide-react';

interface CreateEventModalProps {
  onClose: () => void;
  onEventCreated: () => void;
  defaultDate?: Date;
}

const CreateEventModal = ({
  onClose,
  onEventCreated,
  defaultDate,
}: CreateEventModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: defaultDate
      ? defaultDate.toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    duration: '60', // in minutes
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
    color: '#10b981',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await eventService.createEvent({
        name: formData.name,
        description: formData.description,
        startTime: new Date(formData.startTime),
        duration: Number.parseInt(formData.duration),
        frequency: formData.frequency,
        customDays: formData.frequency === TaskFrequency.CUSTOM ? formData.customDays : undefined,
        color: formData.color,
      });

      onEventCreated();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
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
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Create New Event</h2>
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
            <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
              Event Name
            </label>
            <input
              id="eventName"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="eventDescription"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              id="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              min="1"
              required
            />
          </div>

          <div className="mb-4">
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
            <div className="mb-4">
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

          <div className="mb-6">
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
              Event Color
            </label>
            <div className="flex gap-2">
              {['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: colorOption })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === colorOption ? 'border-gray-900' : 'border-gray-300'
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
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;

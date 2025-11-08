'use client';

import { useState, useEffect } from 'react';
import type { Event, Task, DayOfWeek, Column } from '@/types';
import { TaskFrequency } from '@/types';
import { eventService } from '@/lib/eventService';
import { taskService } from '@/lib/taskService';
import { columnService } from '@/lib/columnService';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Clock } from 'lucide-react';
import CreateEventModal from './CreateEventModal';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface TimeInputModalProps {
  onClose: () => void;
  onConfirm: (time: string) => void;
}

const TimeInputModal = ({ onClose, onConfirm }: TimeInputModalProps) => {
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(time);
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={24} className="text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Set Start Time</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="time-input" className="block text-sm font-medium text-gray-700 mb-2">
              Start Time (Optional)
            </label>
            <input
              id="time-input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
            <p className="text-xs text-gray-500 mt-2">
              Leave empty for no specific time
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DraggableTaskProps {
  task: Task;
}

const DraggableTask = ({ task }: DraggableTaskProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { taskId: task._id, task },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const taskName = task.name || task.title || 'Untitled Task';

  const getPriorityColor = (category?: string) => {
    switch (category) {
      case 'work':
        return 'border-blue-400 bg-blue-50';
      case 'personal':
        return 'border-purple-400 bg-purple-50';
      case 'shopping':
        return 'border-green-400 bg-green-50';
      case 'health':
        return 'border-red-400 bg-red-50';
      case 'education':
        return 'border-yellow-400 bg-yellow-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      className={`border-l-4 rounded-r px-3 py-2 cursor-move hover:shadow-md transition-shadow ${getPriorityColor(task.category)} ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="text-sm font-medium text-gray-900 mb-1">{taskName}</div>
      {task.description && (
        <div className="text-xs text-gray-600 line-clamp-2 mb-1">{task.description}</div>
      )}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {task.category && (
          <span className="capitalize">{task.category}</span>
        )}
        {task.estimatedTime && (
          <span>• {task.estimatedTime}m</span>
        )}
      </div>
    </div>
  );
};

interface DroppableDayProps {
  day: Date;
  events: Event[];
  tasks: Task[];
  columns: Column[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onDrop: (taskId: string, date: Date) => void;
  onAddEvent: (date: Date) => void;
  onDayClick: (date: Date) => void;
}

const DroppableDay = ({ day, events, tasks, columns, isCurrentMonth, isToday, onDrop, onAddEvent, onDayClick }: DroppableDayProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { taskId: string }) => {
      onDrop(item.taskId, day);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const getTaskColor = (task: Task) => {
    const columnId = typeof task.columnId === 'object' ? task.columnId._id : task.columnId;
    const column = columns.find(c => c._id === columnId);
    return column?.color || '#6b7280';
  };

  // Helper function to get task display name (with parent name for subtasks)
  const getTaskDisplayName = (task: Task) => {
    const taskName = task.name || task.title || 'Untitled Task';
    if (task.parentTaskId) {
      const parentName = typeof task.parentTaskId === 'object' 
        ? (task.parentTaskId.name || task.parentTaskId.title || 'Parent Task')
        : 'Parent Task';
      return `${parentName}/${taskName}`;
    }
    return taskName;
  };

  // Sort tasks by time
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.startTime && !b.startTime) return 0;
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div
      ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
      className={`h-full min-h-[80px] md:min-h-[100px] max-h-[140px] p-1.5 md:p-2 border border-gray-200 cursor-pointer overflow-hidden ${
        !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
      } ${isToday ? 'bg-blue-50 border-blue-300' : ''} ${
        isOver ? 'bg-green-50 border-green-300' : ''
      } hover:bg-gray-50 transition-colors`}
      onClick={() => onDayClick(day)}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-xs md:text-sm font-medium ${
            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
          } ${isToday ? 'text-blue-600 font-bold' : ''}`}
        >
          {format(day, 'd')}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddEvent(day);
          }}
          className="opacity-0 hover:opacity-100 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity hidden md:block"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="space-y-0.5 md:space-y-1 overflow-y-auto h-[calc(100%-24px)] md:h-[calc(100%-28px)]">
        {events.map((event) => (
          <div
            key={event._id}
            className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded truncate text-gray-900 font-medium"
            style={{ 
              backgroundColor: event.color ? `${event.color}20` : '#3b82f620',
              borderLeft: `3px solid ${event.color || '#3b82f6'}`
            }}
          >
            {event.name || event.title}
          </div>
        ))}
        {sortedTasks.map((task) => {
          const taskDisplayName = getTaskDisplayName(task);
          const taskColor = getTaskColor(task);
          return (
            <div
              key={task._id}
              className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded truncate cursor-pointer hover:shadow-sm transition-shadow text-gray-900"
              style={{ 
                backgroundColor: `${taskColor}20`,
                borderLeft: `3px solid ${taskColor}`
              }}
              title={`${task.startTime ? task.startTime + ' - ' : ''}${taskDisplayName}`}
            >
              {task.startTime && <span className="font-semibold text-[9px] md:text-xs">{task.startTime} </span>}
              {taskDisplayName}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CalendarViewContent = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [selectedDayView, setSelectedDayView] = useState<Date | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [pendingTaskDrop, setPendingTaskDrop] = useState<{ taskId: string; date: Date } | null>(null);

  useEffect(() => {
    const loadDataEffect = async () => {
      try {
        const [eventsData, tasksData, columnsData] = await Promise.all([
          eventService.getEvents(),
          taskService.getTasks(),
          columnService.getColumns(),
        ]);
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setColumns(Array.isArray(columnsData) ? columnsData : []);
      } catch (error) {
        console.error('Error loading data:', error);
        setEvents([]);
        setTasks([]);
        setColumns([]);
      }
    };
    loadDataEffect();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, tasksData, columnsData] = await Promise.all([
        eventService.getEvents(),
        taskService.getTasks(),
        columnService.getColumns(),
      ]);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setColumns(Array.isArray(columnsData) ? columnsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setEvents([]);
      setTasks([]);
      setColumns([]);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const shouldShowOnDay = (startDate: Date, day: Date, frequency?: TaskFrequency | string, customDays?: string[] | DayOfWeek, endDate?: Date) => {
    const dayOfWeek = format(day, 'EEEE').toLowerCase(); // monday, tuesday, etc.
    
    // Normalize the start date to start of day for comparison
    const startDay = new Date(startDate);
    startDay.setHours(0, 0, 0, 0);
    
    const compareDay = new Date(day);
    compareDay.setHours(0, 0, 0, 0);
    
    // Check if the day is before the start date
    if (compareDay < startDay) return false;
    
    // Check if the day is after the end date (if specified)
    if (endDate) {
      const endDay = new Date(endDate);
      endDay.setHours(0, 0, 0, 0);
      if (compareDay > endDay) return false;
    }

    // Handle frequency - normalize to string for comparison
    const freq = frequency?.toString().toLowerCase();
    
    if (!freq || freq === 'once') {
      return isSameDay(startDay, compareDay);
    }

    if (freq === 'daily') {
      return true;
    }

    if (freq === 'weekdays') {
      return !['saturday', 'sunday'].includes(dayOfWeek);
    }

    if (freq === 'weekends') {
      return ['saturday', 'sunday'].includes(dayOfWeek);
    }

    if (freq === 'custom' && customDays) {
      // Handle both array and object formats
      if (Array.isArray(customDays)) {
        return customDays.map(d => d.toLowerCase()).includes(dayOfWeek);
      } else {
        return customDays[dayOfWeek as keyof DayOfWeek] === true;
      }
    }

    return false;
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStartDate = new Date(event.startTime);
      return shouldShowOnDay(eventStartDate, day, event.frequency, event.customDays, event.endDate);
    });
  };

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => {
      if (!task.startDate || task.isCompleted) return false;
      const taskStartDate = new Date(task.startDate);
      const taskEndDate = task.dueDate ? new Date(task.dueDate) : undefined;
      return shouldShowOnDay(taskStartDate, day, task.frequency, task.customDays, taskEndDate);
    });
  };

  const getUnscheduledTasks = () => {
    return tasks.filter((task) => !task.isCompleted && !task.startDate);
  };

  const getDisplayTasks = () => {
    if (showAllTasks) {
      return tasks.filter((task) => !task.isCompleted);
    }
    return getUnscheduledTasks();
  };

  const handleTaskDrop = async (taskId: string, date: Date) => {
    // Open modal for time input
    setPendingTaskDrop({ taskId, date });
    setShowTimeModal(true);
  };

  const handleTimeConfirm = async (time: string) => {
    if (!pendingTaskDrop) return;

    try {
      await taskService.updateTask(pendingTaskDrop.taskId, {
        startDate: pendingTaskDrop.date.toISOString(),
        startTime: time || undefined,
      });
      loadData();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to schedule task. Please try again.');
    } finally {
      setShowTimeModal(false);
      setPendingTaskDrop(null);
    }
  };

  const handleTimeCancel = () => {
    setShowTimeModal(false);
    setPendingTaskDrop(null);
  };

  const handleAddEvent = (date?: Date) => {
    setSelectedDate(date || null);
    setIsModalOpen(true);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDayView(date);
  };

  const handleEventCreated = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    loadData();
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar View</h1>
          <p className="text-gray-600 mt-1">Drag tasks to schedule them</p>
        </div>
        <button
          type="button"
          onClick={() => handleAddEvent()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Event
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 overflow-hidden">
        {/* Calendar */}
        <div className="flex-1 bg-white rounded-lg p-3 md:p-6 shadow-sm flex flex-col overflow-hidden min-h-[500px] md:min-h-0">
          <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-base md:text-xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentDate(new Date())}
                className="px-2 md:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs md:text-sm font-medium transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-7 gap-1 md:gap-2 h-full min-h-[450px] md:min-h-[400px]">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs md:text-sm font-medium text-gray-600 py-1 md:py-2"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((day) => {
                const dayEvents = getEventsForDay(day);
                const dayTasks = getTasksForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <DroppableDay
                    key={day.toISOString()}
                    day={day}
                    events={dayEvents}
                    tasks={dayTasks}
                    columns={columns}
                    isCurrentMonth={isCurrentMonth}
                    isToday={isToday}
                    onDrop={handleTaskDrop}
                    onAddEvent={handleAddEvent}
                    onDayClick={handleDayClick}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Unscheduled Tasks Sidebar */}
        <div className="w-full lg:w-80 bg-white rounded-lg p-3 md:p-6 shadow-sm overflow-y-auto max-h-[300px] lg:max-h-full">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-sm md:text-base font-semibold text-gray-900">
              {showAllTasks ? 'All Tasks' : 'Unscheduled Tasks'}
            </h3>
            <button
              type="button"
              onClick={() => setShowAllTasks(!showAllTasks)}
              className="text-xs md:text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              {showAllTasks ? 'Unscheduled' : 'All'}
            </button>
          </div>

          {getDisplayTasks().length === 0 ? (
            <p className="text-gray-500 text-center py-6 md:py-8 text-sm">
              {showAllTasks ? 'No tasks' : 'No unscheduled tasks'}
            </p>
          ) : (
            <div className="space-y-2">
              {getDisplayTasks().map((task) => (
                <DraggableTask key={task._id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <CreateEventModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDate(null);
          }}
          onEventCreated={handleEventCreated}
          defaultDate={selectedDate || undefined}
        />
      )}

      {selectedDayView && (
        <div 
          className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDayView(null)}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gray-50 px-4 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4 flex-1 overflow-hidden">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDayView(subDays(selectedDayView, 1));
                  }}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                  title="Previous day"
                >
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                    {format(selectedDayView, 'EEEE, MMMM d, yyyy')}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    {getEventsForDay(selectedDayView).length + getTasksForDay(selectedDayView).length} items scheduled
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDayView(addDays(selectedDayView, 1));
                  }}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                  title="Next day"
                >
                  <ChevronRight size={20} className="text-gray-700" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayView(null)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
              >
                <X size={24} />
              </button>
            </div>

            {/* Time Grid */}
            <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="relative px-6 pt-3" style={{ height: '1452px' }}>
                {/* Hour grid lines - background */}
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                  <div 
                    key={hour} 
                    className="absolute left-0 right-0 border-b border-gray-200 flex" 
                    style={{ 
                      top: `${hour * 60 + 12}px`,
                      height: '60px'
                    }}
                  >
                    <div className="w-20 shrink-0 text-sm text-gray-500 pr-4 text-right" style={{ marginTop: '-10px' }}>
                      {format(new Date().setHours(hour, 0), 'h:mm a')}
                    </div>
                  </div>
                ))}

                {/* Events - positioned by time */}
                {getEventsForDay(selectedDayView).map(event => {
                  const eventTime = new Date(event.startTime);
                  const eventHour = eventTime.getHours();
                  const eventMinute = eventTime.getMinutes();
                  const topPosition = (eventHour * 60 + eventMinute + 12);
                  const duration = event.duration || 60;
                  const height = Math.max(duration, 20);

                  return (
                    <div
                      key={event._id}
                      className="absolute px-3 rounded-lg text-sm font-medium text-gray-900 cursor-pointer flex items-center group"
                      style={{
                        top: `${topPosition}px`,
                        left: 'calc(80px + 1rem)',
                        right: '1rem',
                        height: `${height}px`,
                        backgroundColor: event.color ? `${event.color}40` : '#3b82f640',
                        borderLeft: `4px solid ${event.color || '#3b82f6'}`,
                        zIndex: 10
                      }}
                    >
                      <div className="font-semibold truncate text-xs w-full">{event.name || event.title}</div>
                      
                      {/* Hover Tooltip */}
                      <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg z-50 min-w-[250px] max-w-[400px]">
                        <div className="font-semibold text-sm mb-1">{event.name || event.title}</div>
                        {event.description && (
                          <div className="text-xs text-gray-300">{event.description}</div>
                        )}
                        {event.duration && (
                          <div className="text-xs text-gray-400 mt-1">Duration: {event.duration} min</div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Tasks - positioned by time */}
                {getTasksForDay(selectedDayView).map(task => {
                  if (!task.startTime) return null;
                  
                  const [hourStr, minuteStr] = task.startTime.split(':');
                  const taskHour = Number.parseInt(hourStr);
                  const taskMinute = Number.parseInt(minuteStr || '0');
                  const topPosition = (taskHour * 60 + taskMinute + 12);
                  const duration = task.estimatedTime || 30;
                  const height = Math.max(duration, 20);

                  const taskName = task.name || task.title || 'Untitled Task';
                  const getPriorityColor = (category?: string) => {
                    switch (category) {
                      case 'work': return '#3b82f6';
                      case 'personal': return '#a855f7';
                      case 'shopping': return '#22c55e';
                      case 'health': return '#ef4444';
                      case 'education': return '#eab308';
                      default: return '#6b7280';
                    }
                  };

                  return (
                    <div
                      key={task._id}
                      className="absolute px-3 rounded-lg text-sm text-gray-900 cursor-pointer flex items-center group"
                      style={{
                        top: `${topPosition}px`,
                        left: 'calc(80px + 1rem)',
                        right: '1rem',
                        height: `${height}px`,
                        backgroundColor: `${getPriorityColor(task.category)}40`,
                        borderLeft: `4px solid ${getPriorityColor(task.category)}`,
                        zIndex: 10
                      }}
                    >
                      <div className="font-semibold truncate text-xs w-full">
                        <span className="text-gray-600">{task.startTime} </span>
                        {taskName}
                      </div>
                      
                      {/* Hover Tooltip */}
                      <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg z-50 min-w-[250px] max-w-[400px]">
                        <div className="font-semibold text-sm mb-1">{taskName}</div>
                        {task.description && (
                          <div className="text-xs text-gray-300">{task.description}</div>
                        )}
                        {task.estimatedTime && (
                          <div className="text-xs text-gray-400 mt-1">Duration: {task.estimatedTime} min</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {showTimeModal && (
        <TimeInputModal
          onClose={handleTimeCancel}
          onConfirm={handleTimeConfirm}
        />
      )}
    </div>
  );
};

const CalendarView = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <CalendarViewContent />
    </DndProvider>
  );
};

export default CalendarView;

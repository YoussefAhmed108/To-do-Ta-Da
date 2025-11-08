'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import type { Task, Column } from '@/types';
import { taskService } from '@/lib/taskService';
import { columnService } from '@/lib/columnService';
import { Plus, Trash2, PlusCircle } from 'lucide-react';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import CreateColumnModal from './CreateColumnModal';

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [columnsData, tasksData] = await Promise.all([
        columnService.getColumns(),
        taskService.getTasks(),
      ]);
      console.log('Fetched tasks:', tasksData);
      console.log('Fetched columns:', columnsData);
      setColumns(Array.isArray(columnsData) ? columnsData.sort((a, b) => a.position - b.position) : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setColumns([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    try {
      await taskService.moveTask(draggableId, destination.droppableId, destination.index);
      await loadData();
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const handleAddTask = (columnId: string) => {
    setSelectedColumn(columnId);
    setIsModalOpen(true);
  };

  const handleTaskCreated = () => {
    setIsModalOpen(false);
    setSelectedColumn(null);
    loadData();
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm('Are you sure you want to delete this column?')) return;
    
    try {
      await columnService.deleteColumn(columnId);
      await loadData();
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  const getTasksForColumn = (columnId: string) => {
    return tasks
      .filter((task) => {
        // Handle both populated and unpopulated columnId
        const taskColumnId = typeof task.columnId === 'string' 
          ? task.columnId 
          : task.columnId?._id;
        // Only show parent tasks (tasks without parentTaskId)
        return taskColumnId === columnId && !task.parentTaskId;
      })
      .sort((a, b) => a.position - b.position);
  };

  const getSubtasksForTask = (parentTaskId: string) => {
    console.log('Fetching subtasks for parentTaskId:', parentTaskId);
    
    return tasks
      .filter((task) => task.parentTaskId?._id === parentTaskId)
      .sort((a, b) => a.position - b.position);
    };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Organize your tasks visually</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsColumnModalOpen(true)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm md:text-base"
          >
            <PlusCircle size={20} />
            <span className="hidden sm:inline">Add Column</span>
            <span className="sm:hidden">Column</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm md:text-base"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Task</span>
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 h-[calc(100vh-250px)]">
          {columns.map((column) => (
            <div
              key={column._id}
              className="shrink-0 w-72 sm:w-80 bg-gray-50 rounded-lg p-3 md:p-4 flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: column.color }}
                  />
                  <h2 className="font-semibold text-gray-900 text-sm md:text-base truncate">{column.name}</h2>
                  <span className="text-gray-500 text-xs md:text-sm shrink-0">
                    ({getTasksForColumn(column._id).length})
                  </span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAddTask(column._id)}
                    className="text-gray-500 hover:text-blue-500 transition-colors p-1"
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteColumn(column._id)}
                    className="text-gray-500 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <Droppable droppableId={column._id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] max-h-[calc(100vh-400px)] overflow-y-auto ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    } rounded-lg transition-colors space-y-3 pr-2`}
                  >
                    {getTasksForColumn(column._id).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard
                              task={task}
                              isDragging={snapshot.isDragging}
                              onUpdate={loadData}
                              columns={columns}
                              subtasks={getSubtasksForTask(task._id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {isModalOpen && (
        <CreateTaskModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedColumn(null);
          }}
          onTaskCreated={handleTaskCreated}
          defaultColumnId={selectedColumn || undefined}
          columns={columns}
        />
      )}

      {isColumnModalOpen && (
        <CreateColumnModal
          onClose={() => setIsColumnModalOpen(false)}
          onColumnCreated={() => {
            setIsColumnModalOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard;

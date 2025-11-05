import * as React from 'react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import Button from 'frontend/components/button';
import Input from 'frontend/components/input';
import { TaskService } from 'frontend/services';
import { Task, CreateTaskRequest, UpdateTaskRequest } from 'frontend/types';
import { ButtonKind, ButtonType } from 'frontend/types/button';
import { getAccessTokenFromStorage } from 'frontend/utils/storage-util';

const Dashboard: React.FC = () => {
  const getAccessToken = getAccessTokenFromStorage;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
  });

  const taskService = new TaskService();

  const loadTasks = async (page: number = 1) => {
    try {
      setLoading(true);
      const accessToken = getAccessToken();
      if (!accessToken) {
        toast.error('No access token found');
        return;
      }

      const response = await taskService.getTasks(accessToken, page, 10);
      setTasks(response.data.items);
      setTotalPages(response.data.total_pages);
      setTotalCount(response.data.total_count);
      setCurrentPage(page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const accessToken = getAccessToken();
      if (!accessToken) {
        toast.error('No access token found');
        return;
      }

      await taskService.createTask(accessToken, formData);
      toast.success('Task created successfully');
      setFormData({ title: '', description: '' });
      setShowCreateForm(false);
      await loadTasks(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      setLoading(true);
      const accessToken = getAccessToken();
      if (!accessToken) {
        toast.error('No access token found');
        return;
      }

      const updateData: UpdateTaskRequest = {
        title: formData.title,
        description: formData.description,
      };

      await taskService.updateTask(accessToken, editingTask.id, updateData);
      toast.success('Task updated successfully');
      setFormData({ title: '', description: '' });
      setEditingTask(null);
      await loadTasks(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      setLoading(true);
      const accessToken = getAccessToken();
      if (!accessToken) {
        toast.error('No access token found');
        return;
      }

      await taskService.deleteTask(accessToken, taskId);
      toast.success('Task deleted successfully');
      await loadTasks(currentPage);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
    });
    setShowCreateForm(false);
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingTask(null);
    setFormData({ title: '', description: '' });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadTasks(page);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
        {!showCreateForm && !editingTask && (
          <Button
            onClick={() => setShowCreateForm(true)}
            disabled={loading}
            kind={ButtonKind.PRIMARY}
          >
            Create New Task
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingTask) && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask}>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Title
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter task title"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter task description"
                required
                disabled={loading}
                className="w-full rounded-lg border border-stroke bg-white p-4 outline-none focus:border-primary"
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button
                type={ButtonType.SUBMIT}
                isLoading={loading}
                kind={ButtonKind.PRIMARY}
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </Button>
              <Button
                type={ButtonType.BUTTON}
                onClick={cancelForm}
                disabled={loading}
                kind={ButtonKind.TERTIARY}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Tasks ({totalCount})
          </h2>
        </div>

        {loading && tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No tasks found. Create your first task to get started!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 transition hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {task.title}
                    </h3>
                    <p className="mt-1 text-gray-600">{task.description}</p>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => startEditing(task)}
                      disabled={loading}
                      className="rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={loading}
                      className="rounded bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 p-4">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

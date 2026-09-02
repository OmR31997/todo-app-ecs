'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { Task, User, CreateTaskPayload, UpdateTaskPayload, CreateUserPayload } from '@/types/todo';
import { Header } from '@/components/Header';
import { StatsOverview } from '@/components/StatsOverview';
import { UserSelector } from '@/components/UserSelector';
import { TaskCard } from '@/components/TaskCard';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { EditTaskModal } from '@/components/EditTaskModal';
import { CreateUserModal } from '@/components/CreateUserModal';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  AlertCircle,
  Inbox,
  Sparkles,
  CheckCircle2,
  Clock,
  ListTodo,
} from 'lucide-react';

export default function TodoDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Modals
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState<boolean>(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const health = await api.checkHealth();
      setIsConnected(health);

      if (!health) {
        setError('Cannot reach NestJS backend API at http://127.0.0.1:3000. Please ensure the backend server is running.');
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Fetch users and tasks
      let fetchedUsers = await api.getUsers();

      // Auto-seed default user if database is empty
      if (fetchedUsers.length === 0) {
        try {
          const defaultUser = await api.createUser({
            name: 'Demo Admin',
            email: 'admin@taskflow.dev',
          });
          fetchedUsers = [defaultUser];
        } catch {
          // Ignore auto-seed failure if any
        }
      }

      setUsers(fetchedUsers);

      const fetchedTasks = await api.getTasks();
      setTasks(fetchedTasks);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to todo-api backend');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers for User CRUD
  const handleCreateUser = async (payload: CreateUserPayload) => {
    const newUser = await api.createUser(payload);
    setUsers((prev) => [...prev, newUser]);
    setSelectedUserId(newUser.id);
  };

  const handleDeleteUser = async (userId: string) => {
    await api.deleteUser(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (selectedUserId === userId) {
      setSelectedUserId(null);
    }
    // Refresh tasks as deleted user's tasks will be removed
    const updatedTasks = await api.getTasks();
    setTasks(updatedTasks);
  };

  // Handlers for Task CRUD
  const handleCreateTask = async (payload: CreateTaskPayload) => {
    const newTask = await api.createTask(payload);
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleComplete = async (task: Task) => {
    const updated = await api.updateTask(task.id, {
      completed: !task.completed,
    });
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
  };

  const handleUpdateTask = async (taskId: string, payload: UpdateTaskPayload) => {
    const updated = await api.updateTask(taskId, payload);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  };

  const handleDeleteTask = async (taskId: string) => {
    await api.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Filter & Sort Logic
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // User filter
        if (selectedUserId && task.userId !== selectedUserId) {
          return false;
        }

        // Status filter
        if (statusFilter === 'pending' && task.completed) return false;
        if (statusFilter === 'completed' && !task.completed) return false;

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [tasks, selectedUserId, statusFilter, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header
        isConnected={isConnected}
        onOpenCreateTask={() => setIsCreateTaskOpen(true)}
        onOpenCreateUser={() => setIsCreateUserOpen(true)}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error / API Offline Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <p className="text-xs sm:text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Dashboard Metrics */}
        <StatsOverview tasks={tasks} />

        {/* Control Bar: User Selector + Filter Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Active User Context
            </h2>
            {users.length > 0 && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </span>
            )}
          </div>

          <UserSelector
            users={users}
            selectedUserId={selectedUserId}
            onSelectUser={setSelectedUserId}
            onDeleteUser={handleDeleteUser}
          />
        </div>

        {/* Search, Filter & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or description..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none transition"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>All</span>
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'pending'
                  ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending</span>
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'completed'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Sort Alphabetically</option>
            </select>
          </div>
        </div>

        {/* Task Grid & States */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Loading tasks from Nest backend...
            </p>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                users={users}
                onToggleComplete={handleToggleComplete}
                onEdit={(t) => setEditingTask(t)}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 px-4 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Inbox className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                No tasks found
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {searchQuery
                  ? `No tasks matching "${searchQuery}". Try clearing your search filter.`
                  : statusFilter !== 'all'
                  ? `No ${statusFilter} tasks available.`
                  : 'Your task list is empty. Click the button below to create your first task!'}
              </p>
            </div>
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        users={users}
        defaultUserId={selectedUserId}
        onSubmit={handleCreateTask}
        onOpenCreateUser={() => {
          setIsCreateTaskOpen(false);
          setIsCreateUserOpen(true);
        }}
      />

      <EditTaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
      />

      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Task, User } from '@/types/todo';
import { Check, Edit3, Trash2, User as UserIcon, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  users: User[];
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({
  task,
  users,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const assignedUser = task.user || users.find((u) => u.id === task.userId);

  const handleToggle = async () => {
    try {
      setIsToggling(true);
      await onToggleComplete(task);
    } finally {
      setIsToggling(false);
    }
  };

  const formattedDate = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div
      className={`group relative p-5 rounded-2xl border transition-all duration-200 ${
        task.completed
          ? 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 opacity-80'
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox Toggle Button */}
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 text-transparent'
          }`}
          title={task.completed ? 'Mark as pending' : 'Mark as completed'}
        >
          <Check className={`w-3.5 h-3.5 stroke-[3] ${task.completed ? 'block' : 'hidden'}`} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`font-semibold text-base tracking-tight break-words ${
                task.completed
                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                  : 'text-zinc-900 dark:text-white'
              }`}
            >
              {task.title}
            </h4>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
                title="Edit task"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete task "${task.title}"?`)) {
                    onDelete(task.id);
                  }
                }}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p
              className={`mt-1.5 text-sm whitespace-pre-wrap leading-relaxed ${
                task.completed
                  ? 'text-zinc-400 dark:text-zinc-600'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Footer Metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            {/* User Badge */}
            {assignedUser && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                <UserIcon className="w-3 h-3 text-indigo-500" />
                <span>{assignedUser.name}</span>
              </span>
            )}

            {/* Created Timestamp */}
            {formattedDate && (
              <span className="inline-flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
                <Calendar className="w-3 h-3" />
                <span>{formattedDate}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

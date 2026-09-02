'use client';

import React from 'react';
import { User } from '@/types/todo';
import { User as UserIcon, Users, Trash2 } from 'lucide-react';

interface UserSelectorProps {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (userId: string | null) => void;
  onDeleteUser: (userId: string) => void;
}

export function UserSelector({
  users,
  selectedUserId,
  onSelectUser,
  onDeleteUser,
}: UserSelectorProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {/* All Users Pill */}
      <button
        onClick={() => onSelectUser(null)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
          selectedUserId === null
            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-sm'
            : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
        }`}
      >
        <Users className="w-3.5 h-3.5" />
        <span>All Users</span>
      </button>

      {/* Individual User Pills */}
      {users.map((user) => {
        const isSelected = selectedUserId === user.id;
        const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

        return (
          <div
            key={user.id}
            className={`group relative flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              isSelected
                ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <button
              onClick={() => onSelectUser(user.id)}
              className="flex items-center gap-2"
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {initial}
              </span>
              <span>{user.name}</span>
            </button>

            {/* Delete User Icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete user "${user.name}"? Tasks associated with this user may be affected.`)) {
                  onDeleteUser(user.id);
                }
              }}
              className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                isSelected
                  ? 'hover:bg-indigo-700 text-white/80 hover:text-white'
                  : 'hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-500'
              }`}
              title="Delete User"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        );
      })}

      {users.length === 0 && (
        <span className="text-xs text-zinc-400 dark:text-zinc-500 italic pl-1">
          No users registered yet. Add a user to get started!
        </span>
      )}
    </div>
  );
}

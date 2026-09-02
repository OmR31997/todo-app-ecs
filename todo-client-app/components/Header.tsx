'use client';

import React from 'react';
import { CheckSquare, PlusCircle, UserPlus, Server, RefreshCw } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  onOpenCreateTask: () => void;
  onOpenCreateUser: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Header({
  isConnected,
  onOpenCreateTask,
  onOpenCreateUser,
  onRefresh,
  isRefreshing,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">
                  TaskFlow Studio
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Nest API
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                High-performance NestJS & PostgreSQL Task Engine
              </p>
            </div>
          </div>

          {/* Actions & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Backend Health Badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              }`}
              title={isConnected ? 'Connected to Nest API (http://127.0.0.1:3000)' : 'Nest API Offline'}
            >
              <Server className="w-3.5 h-3.5" />
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isConnected ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
              </span>
              <span className="hidden md:inline">
                {isConnected ? 'API Connected' : 'API Disconnected'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Refresh Tasks & Users"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {/* Create User Button */}
            <button
              onClick={onOpenCreateUser}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add User</span>
            </button>

            {/* Create Task Button */}
            <button
              onClick={onOpenCreateTask}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

import { Task, User, CreateTaskPayload, UpdateTaskPayload, CreateUserPayload } from '@/types/todo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message;
      }
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  // Users API
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/users`, { cache: 'no-store' });
    return handleResponse<User[]>(res);
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<User>(res);
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(res);
  },

  // Tasks API
  async getTasks(userId?: string): Promise<Task[]> {
    const url = userId
      ? `${API_BASE_URL}/tasks?userId=${encodeURIComponent(userId)}`
      : `${API_BASE_URL}/tasks`;
    const res = await fetch(url, { cache: 'no-store' });
    return handleResponse<Task[]>(res);
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Task>(res);
  },

  async updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Task>(res);
  },

  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(res);
  },

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        cache: 'no-store',
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};

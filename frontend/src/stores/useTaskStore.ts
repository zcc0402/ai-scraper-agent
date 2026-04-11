import { create } from 'zustand'
import type { Task } from '@/types'
import { taskApi } from '@/services/api'

interface TaskState {
  tasks: Task[]
  currentTask: Task | null
  loading: boolean
  error: string | null

  fetchTasks: (status?: string) => Promise<void>
  createTask: (userInput: string, format?: 'json' | 'csv' | 'excel') => Promise<string>
  pollTaskStatus: (taskId: string) => Promise<void>
  cancelTask: (taskId: string) => Promise<void>
  setCurrentTask: (task: Task | null) => void
  clearError: () => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,

  fetchTasks: async (status?: string) => {
    try {
      set({ loading: true, error: null })
      const tasks = await taskApi.listTasks(status)
      set({ tasks, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  createTask: async (userInput: string, format: 'json' | 'csv' | 'excel' = 'json') => {
    try {
      set({ loading: true, error: null })
      const result = await taskApi.createTask({
        user_input: userInput,
        output_format: format,
      })
      set({ loading: false })
      return result.task_id
    } catch (error: any) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  pollTaskStatus: async (taskId: string) => {
    try {
      const task = await taskApi.getTaskStatus(taskId)
      
      const { currentTask, tasks } = get()
      const updatedTasks = tasks.map((t) => (t.task_id === taskId ? task : t))
      
      set({
        currentTask: task,
        tasks: updatedTasks,
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  cancelTask: async (taskId: string) => {
    try {
      await taskApi.cancelTask(taskId)
      get().fetchTasks()
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },

  setCurrentTask: (task: Task | null) => {
    set({ currentTask: task })
  },

  clearError: () => {
    set({ error: null })
  },
}))

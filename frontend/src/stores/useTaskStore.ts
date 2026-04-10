// 任务状态管理 (Zustand)

import { create } from 'zustand'
import type { Task } from '@/types'
import { taskApi } from '@/services/api'

interface TaskState {
  // 状态
  tasks: Task[]
  currentTask: Task | null
  loading: boolean
  error: string | null

  // 操作
  fetchTasks: (status?: string) => Promise<void>
  createTask: (userInput: string, format?: 'json' | 'csv' | 'excel') => Promise<string>
  pollTaskStatus: (taskId: string) => Promise<void>
  cancelTask: (taskId: string) => Promise<void>
  setCurrentTask: (task: Task | null) => void
  clearError: () => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // 初始状态
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,

  // 获取任务列表
  fetchTasks: async (status?: string) => {
    try {
      set({ loading: true, error: null })
      const tasks = await taskApi.listTasks(status)
      set({ tasks, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  // 创建任务
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

  // 轮询任务状态
  pollTaskStatus: async (taskId: string) => {
    try {
      const task = await taskApi.getTaskStatus(taskId)
      
      // 更新当前任务
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

  // 取消任务
  cancelTask: async (taskId: string) => {
    try {
      await taskApi.cancelTask(taskId)
      // 刷新任务列表
      get().fetchTasks()
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },

  // 设置当前任务
  setCurrentTask: (task: Task | null) => {
    set({ currentTask: task })
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  },
}))

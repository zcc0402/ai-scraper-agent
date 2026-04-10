// API 服务层

import axios, { AxiosInstance } from 'axios'
import type { Task, CreateTaskRequest, ApiResponse } from '@/types'

// 创建 Axios 实例
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const message = error.response?.data?.detail || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

// 任务相关 API
export const taskApi = {
  // 创建任务
  createTask: async (request: CreateTaskRequest): Promise<{ task_id: string; status: string; message: string }> => {
    const response = await api.post('/v1/scrape', request)
    return response as any
  },

  // 查询任务状态
  getTaskStatus: async (taskId: string): Promise<Task> => {
    const response = await api.get(`/v1/tasks/${taskId}`)
    return response as any
  },

  // 查询任务列表
  listTasks: async (status?: string, limit: number = 20): Promise<Task[]> => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    params.append('limit', limit.toString())
    
    const response = await api.get(`/v1/tasks?${params.toString()}`)
    return response as any
  },

  // 取消任务
  cancelTask: async (taskId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/v1/tasks/${taskId}`)
    return response as any
  },
}

export default api

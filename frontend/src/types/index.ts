// API 类型定义

export interface Task {
  task_id: string
  user_input: string
  status: TaskStatus
  progress?: string
  result?: TaskResult
  error?: string
  created_at: string
  completed_at?: string
}

export type TaskStatus =
  | 'pending'
  | 'planning'
  | 'navigating'
  | 'extracting'
  | 'validating'
  | 'exporting'
  | 'completed'
  | 'failed'
  | 'retrying'
  | 'cancelled'

export interface TaskResult {
  data: Record<string, any>[]
  output_file: string
  statistics: {
    total_records: number
    fields: string[]
  }
}

export interface CreateTaskRequest {
  user_input: string
  output_format?: 'json' | 'csv' | 'excel'
  timeout?: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

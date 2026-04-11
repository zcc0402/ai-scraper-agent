import { createFileRoute } from '@tanstack/react-router'
import { TaskListPage } from '@/pages/TaskListPage'

export const Route = createFileRoute('/tasks/')({
  component: TaskListPage,
})

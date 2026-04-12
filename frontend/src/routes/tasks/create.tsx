import { createFileRoute } from '@tanstack/react-router'
import { CreateTaskPage } from '@/pages/CreateTaskPage'

export const Route = createFileRoute('/tasks/create')({
  component: CreateTaskPage,
})

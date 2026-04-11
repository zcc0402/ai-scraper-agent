import { createFileRoute } from '@tanstack/react-router'
import { CreateTaskForm } from '@/pages/CreateTaskForm'

export const Route = createFileRoute('/tasks/create')({
  component: CreateTaskForm,
})

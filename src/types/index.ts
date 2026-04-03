export interface Task {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  isPriorityToday: boolean
  columnId: string
  order: number
  createdAt: string
}

export interface Column {
  id: string
  title: string
  order: number
  createdAt: string
  tasks: Task[]
}

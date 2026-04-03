'use client'

import { useState, useMemo } from 'react'
import { useAllTasks, useCreateTask, useUpdateTask, useDeleteTask, useColumns } from '@/hooks/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { Task } from '@/types'
import {
  Plus,
  Calendar,
  Star,
  Trash2,
  ArrowUpDown,
  Loader2,
  ClipboardList,
  Flame,
  FileText,
} from 'lucide-react'

export function TaskManager() {
  const { data: tasks, isLoading: tasksLoading } = useAllTasks()
  const { data: columns } = useColumns()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isPriority, setIsPriority] = useState(false)
  const [sortBy, setSortBy] = useState<'created' | 'dueDate'>('created')

  const defaultColumnId = columns?.[0]?.id || ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !defaultColumnId) return

    createTask.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      isPriorityToday: isPriority,
      columnId: defaultColumnId,
    })

    setTitle('')
    setDescription('')
    setDueDate('')
    setIsPriority(false)
  }

  const allTasks = useMemo(() => {
    if (!tasks) return []
    const sorted = [...tasks]
    if (sortBy === 'dueDate') {
      sorted.sort((a, b) => {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return sorted
  }, [tasks, sortBy])

  const priorityTasks = useMemo(() => {
    return allTasks.filter((t) => t.isPriorityToday)
  }, [allTasks])

  if (tasksLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-sm text-slate-500">Carregando tarefas...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Column 1: Form */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center ring-1 ring-blue-500/20">
              <Plus className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Nova Tarefa</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="taskTitle" className="text-slate-300 text-sm font-medium">
                Nome da tarefa *
              </Label>
              <Input
                id="taskTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o nome..."
                required
                className="bg-white/[0.04] border-white/[0.1] text-white placeholder:text-slate-600 rounded-xl h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDesc" className="text-slate-300 text-sm font-medium">
                Descrição
              </Label>
              <textarea
                id="taskDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição opcional..."
                rows={3}
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder:text-slate-600 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDue" className="text-slate-300 text-sm font-medium">
                Data máxima de entrega
              </Label>
              <Input
                id="taskDue"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-white/[0.04] border-white/[0.1] text-white [color-scheme:dark] rounded-xl h-11"
              />
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/15">
              <Checkbox
                id="taskPriority"
                checked={isPriority}
                onCheckedChange={(checked) => setIsPriority(checked === true)}
                className="border-amber-500/40 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 cursor-pointer"
              />
              <Label htmlFor="taskPriority" className="text-amber-300 text-sm font-medium cursor-pointer flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Prioridade para hoje
              </Label>
            </div>

            <Button
              type="submit"
              disabled={createTask.isPending || !title.trim()}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold border-0 shadow-lg shadow-blue-600/20 cursor-pointer rounded-xl text-[15px]"
            >
              {createTask.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Criar Tarefa
            </Button>
          </form>
        </div>

        {/* Column 2: Task Queue */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] flex flex-col overflow-hidden">
          <div className="p-5 border-b border-white/[0.07] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 flex items-center justify-center ring-1 ring-indigo-500/20">
                <ClipboardList className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Fila de Tarefas</h2>
                <p className="text-xs text-slate-500 font-medium">{allTasks.length} tarefas</p>
              </div>
            </div>
            <button
              onClick={() => setSortBy(sortBy === 'created' ? 'dueDate' : 'created')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/[0.06] cursor-pointer font-medium"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortBy === 'created' ? 'Por criação' : 'Por data'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {allTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-600">
                <FileText className="w-10 h-10 mb-2" />
                <p className="text-sm font-medium">Nenhuma tarefa criada</p>
              </div>
            ) : (
              allTasks.map((task) => (
                <TaskQueueItem
                  key={task.id}
                  task={task}
                  onTogglePriority={() => updateTask.mutate({ id: task.id, isPriorityToday: !task.isPriorityToday })}
                  onDelete={() => deleteTask.mutate(task.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Priority */}
        <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.02] flex flex-col overflow-hidden">
          <div className="p-5 border-b border-amber-500/15 bg-gradient-to-b from-amber-500/[0.08] to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/25 to-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/25">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-amber-100" style={{ fontFamily: 'var(--font-heading)' }}>Prioridade do Dia</h2>
                <p className="text-xs text-amber-400/60 font-medium">{priorityTasks.length} tarefas</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {priorityTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-amber-500/30">
                <Flame className="w-10 h-10 mb-2" />
                <p className="text-sm font-medium">Nenhuma prioridade definida</p>
              </div>
            ) : (
              priorityTasks.map((task) => (
                <TaskQueueItem
                  key={task.id}
                  task={task}
                  isPriorityView
                  onTogglePriority={() => updateTask.mutate({ id: task.id, isPriorityToday: false })}
                  onDelete={() => deleteTask.mutate(task.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskQueueItem({
  task,
  isPriorityView,
  onTogglePriority,
  onDelete,
}: {
  task: Task
  isPriorityView?: boolean
  onTogglePriority: () => void
  onDelete: () => void
}) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null
  const isOverdue = dueDate && dueDate < new Date()

  return (
    <div className={`
      group p-3.5 rounded-xl border
      ${isPriorityView
        ? 'bg-amber-500/[0.04] border-amber-500/10 hover:border-amber-500/25'
        : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.14]'
      }
    `}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-100 truncate">{task.title}</p>
          {task.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {dueDate && (
              <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                isOverdue ? 'bg-red-500/15 text-red-400' : 'bg-white/[0.06] text-slate-400'
              }`}>
                <Calendar className="w-3 h-3" />
                {dueDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
            )}
            {task.isPriorityToday && !isPriorityView && (
              <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                <Star className="w-3 h-3 fill-current" />
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 shrink-0">
          <button
            onClick={onTogglePriority}
            className={`p-1.5 rounded-lg cursor-pointer ${
              task.isPriorityToday
                ? 'text-amber-400 hover:bg-amber-500/10'
                : 'text-slate-600 hover:text-amber-400 hover:bg-amber-500/10'
            }`}
            title={task.isPriorityToday ? 'Remover prioridade' : 'Marcar como prioridade'}
          >
            <Star className={`w-4 h-4 ${task.isPriorityToday ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

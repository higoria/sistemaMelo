'use client'

import { useState } from 'react'
import type { Task as TaskType } from '@/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Calendar, Star, Pencil, Check, X } from 'lucide-react'
import { useDeleteTask, useUpdateTask } from '@/hooks/api'
import { Input } from '@/components/ui/input'

interface TaskCardProps {
  task: TaskType
}

export function TaskCard({ task }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const deleteTask = useDeleteTask()
  const updateTask = useUpdateTask()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      updateTask.mutate({ id: task.id, title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  const handleTogglePriority = () => {
    updateTask.mutate({ id: task.id, isPriorityToday: !task.isPriorityToday })
  }

  const dueDate = task.dueDate ? new Date(task.dueDate) : null
  const isOverdue = dueDate && dueDate < new Date()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative p-3.5 rounded-xl border
        ${isDragging
          ? 'opacity-50 scale-[1.02] shadow-xl shadow-blue-500/10 border-blue-500/30 bg-blue-500/5'
          : 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.05]'
        }
      `}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-0.5 rounded text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0"
          aria-label="Arrastar tarefa"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                  if (e.key === 'Escape') { setIsEditing(false); setEditTitle(task.title) }
                }}
                autoFocus
                className="h-7 text-sm bg-white/[0.04] border-white/[0.12] text-white rounded-lg"
              />
              <button onClick={handleSave} className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => { setIsEditing(false); setEditTitle(task.title) }} className="p-1 text-slate-500 hover:text-slate-300 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <p className="text-sm font-medium text-slate-100 leading-snug truncate">
              {task.title}
            </p>
          )}

          {task.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-2 mt-2">
            {dueDate && (
              <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                isOverdue
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-white/[0.06] text-slate-400'
              }`}>
                <Calendar className="w-3 h-3" />
                {dueDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
            )}
            {task.isPriorityToday && (
              <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                <Star className="w-3 h-3 fill-current" />
                Prioridade
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
          <button
            onClick={handleTogglePriority}
            className={`p-1.5 rounded-lg cursor-pointer ${
              task.isPriorityToday
                ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                : 'text-slate-600 hover:text-amber-400 hover:bg-amber-500/10'
            }`}
            title="Prioridade do dia"
          >
            <Star className={`w-3.5 h-3.5 ${task.isPriorityToday ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/[0.06] cursor-pointer"
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteTask.mutate(task.id)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
            title="Excluir"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

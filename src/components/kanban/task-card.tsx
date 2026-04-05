'use client'

import { useState, useRef } from 'react'
import type { Task as TaskType } from '@/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Calendar, Star, Pencil, Check, X, ImagePlus } from 'lucide-react'
import { useDeleteTask, useUpdateTask } from '@/hooks/api'
import { Input } from '@/components/ui/input'

interface TaskCardProps {
  task: TaskType
}

export function TaskCard({ task }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  )
  const [editLogo, setEditLogo] = useState<string | null>(task.logoUrl)
  const logoInputRef = useRef<HTMLInputElement>(null)

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
    if (!editTitle.trim()) return
    updateTask.mutate({
      id: task.id,
      title: editTitle.trim(),
      dueDate: editDueDate || null,
      logoUrl: editLogo,
    } as any)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(task.title)
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '')
    setEditLogo(task.logoUrl)
    setIsEditing(false)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setEditLogo(reader.result as string)
    reader.readAsDataURL(file)
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
            /* ── Edit mode ── */
            <div className="space-y-2.5">
              {/* Logo edit */}
              <div className="flex items-center gap-3">
                {editLogo ? (
                  <img
                    src={editLogo}
                    alt="logo"
                    className="w-10 h-10 rounded-xl object-cover border border-white/[0.15] shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center shrink-0">
                    <ImagePlus className="w-4 h-4 text-slate-600" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.2] cursor-pointer"
                >
                  {editLogo ? 'Trocar logo' : 'Adicionar logo'}
                </button>
                {editLogo && (
                  <button
                    type="button"
                    onClick={() => setEditLogo(null)}
                    className="text-xs text-red-400/70 hover:text-red-400 cursor-pointer"
                  >
                    Remover
                  </button>
                )}
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </div>

              {/* Title edit */}
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                  if (e.key === 'Escape') handleCancel()
                }}
                placeholder="Nome do cliente..."
                autoFocus
                className="h-8 text-sm bg-white/[0.04] border-white/[0.12] text-white rounded-lg"
              />

              {/* Due date edit */}
              <div>
                <label className="text-[11px] text-slate-500 font-medium mb-1 block">Encerramento do contrato</label>
                <Input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="h-8 text-sm bg-white/[0.04] border-white/[0.12] text-white [color-scheme:dark] rounded-lg"
                />
              </div>

              {/* Save / Cancel */}
              <div className="flex gap-2 pt-0.5">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Salvar
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            /* ── View mode ── */
            <>
              {/* Logo + title */}
              <div className="flex items-center gap-3 min-w-0">
                {task.logoUrl && (
                  <img
                    src={task.logoUrl}
                    alt={`${task.title} logo`}
                    className="w-10 h-10 rounded-xl object-cover border border-white/[0.1] shrink-0"
                  />
                )}
                <p className="text-base font-semibold text-white leading-snug">
                  {task.title}
                </p>
              </div>

              {task.description && (
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{task.description}</p>
              )}

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {dueDate && (
                  <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    isOverdue
                      ? 'bg-red-500/15 text-red-400'
                      : 'bg-white/[0.06] text-slate-400'
                  }`}>
                    <Calendar className="w-3 h-3" />
                    Enc. {dueDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </span>
                )}
                {task.isPriorityToday && (
                  <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                    <Star className="w-3 h-3 fill-current" />
                    Prioridade
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action buttons — only in view mode */}
        {!isEditing && (
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
        )}
      </div>
    </div>
  )
}

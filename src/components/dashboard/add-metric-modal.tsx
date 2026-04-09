'use client'

import React, { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { addDashboardMetric } from '@/app/actions/metrics'

interface AddMetricModalProps {
  onSuccess: () => void
}

export function AddMetricModal({ onSuccess }: AddMetricModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Guardamos como string para focar apenas em números e criar a máscara facilmente
  const [formData, setFormData] = useState<Record<string, string>>({
    leadsTrafego: '',
    leadsIndicacao: '',
    reunioesAgendadas: '',
    reunioesRealizadas: '',
    vendasQtd: '',
    faturamento: '',
    investimentoTrafego: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extrai apenas os números do que o usuário digitou (remove ".", ",", etc)
    const raw = e.target.value.replace(/\D/g, '')
    setFormData(prev => ({ ...prev, [e.target.name]: raw }))
  }

  // Helper para mostrar com formatador de milhar pt-BR
  const formatDisplay = (val: string) => {
    if (!val) return ''
    return Number(val).toLocaleString('pt-BR')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await addDashboardMetric({
        leadsTrafego: Number(formData.leadsTrafego || 0),
        leadsIndicacao: Number(formData.leadsIndicacao || 0),
        reunioesAgendadas: Number(formData.reunioesAgendadas || 0),
        reunioesRealizadas: Number(formData.reunioesRealizadas || 0),
        vendasQtd: Number(formData.vendasQtd || 0),
        faturamento: Number(formData.faturamento || 0),
        investimentoTrafego: Number(formData.investimentoTrafego || 0)
      })
      setIsOpen(false)
      onSuccess()
      setFormData({
        leadsTrafego: '', leadsIndicacao: '', reunioesAgendadas: '', 
        reunioesRealizadas: '', vendasQtd: '', faturamento: '', investimentoTrafego: ''
      })
    } catch (error) {
      console.error(error)
      alert("Erro ao salvar dados. Verifique a conexão com o banco.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Lançar Resultados
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#07080c]/80 backdrop-blur-sm">
      <div className="bg-[#0f111a] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold text-white tracking-tight">Lançar Novos Resultados</h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Leads por Tráfego</label>
              <input type="text" name="leadsTrafego" value={formatDisplay(formData.leadsTrafego)} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Leads por Indicação</label>
              <input type="text" name="leadsIndicacao" value={formatDisplay(formData.leadsIndicacao)} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Reuniões Agendadas</label>
              <input type="text" name="reunioesAgendadas" value={formatDisplay(formData.reunioesAgendadas)} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Reuniões Realizadas</label>
              <input type="text" name="reunioesRealizadas" value={formatDisplay(formData.reunioesRealizadas)} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Quantidade de Vendas</label>
              <input type="text" name="vendasQtd" value={formatDisplay(formData.vendasQtd)} onChange={handleChange} className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Faturamento ($)</label>
              <input type="text" name="faturamento" value={formatDisplay(formData.faturamento)} onChange={handleChange} className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0" />
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Investimento em Tráfego R$</label>
              <input type="text" name="investimentoTrafego" value={formatDisplay(formData.investimentoTrafego)} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-white text-black font-semibold rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar no Histórico'}
          </button>
        </form>

      </div>
    </div>
  )
}

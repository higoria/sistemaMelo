import React from 'react'

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: React.ReactNode
}

export function KpiCard({ title, value, subtitle, icon }: KpiCardProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5 hover:bg-white/[0.04] transition-colors flex flex-col justify-between h-full relative overflow-hidden group min-h-[140px]">
      {/* Decorative gradient blur */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/[0.02] blur-xl rounded-full group-hover:bg-white/[0.05] transition-colors" />
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <h3 className="text-slate-400 text-sm font-medium pr-4">{title}</h3>
        {icon && <div className="text-slate-500 shrink-0 bg-white/[0.03] p-1.5 rounded-lg border border-white/[0.05]">{icon}</div>}
      </div>
      
      <div className="relative z-10 mt-auto">
        <div className="text-3xl font-semibold text-white tracking-tight">{value}</div>
        {subtitle && <div className="text-xs text-slate-500 mt-2 font-medium">{subtitle}</div>}
      </div>
    </div>
  )
}

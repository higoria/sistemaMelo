import React from 'react'

interface GoalBarProps {
  title: string
  currentValue: number
  goalValue: number
  formatValue?: (val: number) => string
  colorClass?: string
}

export function GoalBar({ title, currentValue, goalValue, formatValue, colorClass = 'from-blue-600 to-indigo-600' }: GoalBarProps) {
  const percentage = goalValue > 0 ? (currentValue / goalValue) * 100 : 0
  const widthPercentage = Math.min(percentage, 100)
  const formattedCurrent = formatValue ? formatValue(currentValue) : currentValue
  const formattedGoal = formatValue ? formatValue(goalValue) : goalValue

  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
      {/* Decorative gradient blur */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-[0.05] blur-3xl rounded-full group-hover:opacity-[0.1] transition-opacity`} />
      
      <div className="flex justify-between items-end mb-4 relative z-10">
        <div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight">{formattedCurrent}</span>
            <span className="text-sm font-medium text-slate-500">/ Meta: {formattedGoal}</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${colorClass}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="h-4 w-full bg-slate-900 border border-white/5 rounded-full overflow-hidden relative z-10 shadow-inner">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-out relative`}
          style={{ width: `${widthPercentage}%` }}
        >
          {/* Inner glow/shine */}
          <div className="absolute top-0 border-t border-white/30 w-full h-full rounded-full" />
        </div>
      </div>
    </div>
  )
}

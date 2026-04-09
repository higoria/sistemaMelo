'use client'

import React, { useState, useEffect } from 'react'
import { GoalBar } from './goal-bar'
import { TriGoalBar } from './tri-goal-bar'
import { KpiCard } from './kpi-card'
import { TrendingUp, Users, Calendar, CheckCircle, DollarSign, Target, Activity, MousePointerClick, Loader2 } from 'lucide-react'
import { AddMetricModal } from './add-metric-modal'
import { EditMetricModal } from './edit-metric-modal'
import { getDashboardData } from '@/app/actions/metrics'

export function DashboardView() {
  const [isLoading, setIsLoading] = useState(true)

  // Real Data State
  const [data, setData] = useState({
    leadsTrafego: 0,
    leadsIndicacao: 0,
    reunioesAgendadas: 0,
    reunioesRealizadas: 0,
    vendasQtd: 0,
    faturamento: 0,
    investimentoTrafego: 0,
  })

  // Goals State
  const [goals, setGoals] = useState({
    faturamento: 50000,
    leads: 1000,
    reunioesAgendadas: 200,
    reunioesRealizadas: 150
  })

  const carregarDados = async () => {
    setIsLoading(true)
    try {
      const response = await getDashboardData()
      setData(response.metrics)
      setGoals(response.goals as any)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const totalLeads = data.leadsTrafego + data.leadsIndicacao

  // Fórmulas
  const taxaAgendamento = totalLeads > 0 ? (data.reunioesAgendadas / totalLeads) * 100 : 0
  const taxaComparecimento = data.reunioesAgendadas > 0 ? (data.reunioesRealizadas / data.reunioesAgendadas) * 100 : 0
  const taxaVenda = data.reunioesRealizadas > 0 ? (data.vendasQtd / data.reunioesRealizadas) * 100 : 0
  const taxaLeadFechamento = totalLeads > 0 ? (data.vendasQtd / totalLeads) * 100 : 0
  const noShow = data.reunioesAgendadas - data.reunioesRealizadas
  const cac = data.vendasQtd > 0 ? data.investimentoTrafego / data.vendasQtd : 0

  // ── Metas de Vendas ──────────────────────────────────────────
  // As 3 metas fixas (em ordem crescente)
  const GOAL_1 = 50000;  // Verde
  const GOAL_2 = 65000;  // Prata
  const GOAL_3 = 80000;  // Dourado

  // Meta ativa = próxima meta não batida ainda
  let salesActiveGoal = GOAL_1;
  if (data.faturamento >= GOAL_2) salesActiveGoal = GOAL_3;
  else if (data.faturamento >= GOAL_1) salesActiveGoal = GOAL_2;

  // Quanto falta para a próxima meta (card direito)
  const leftToNextGoal = Math.max(0, salesActiveGoal - data.faturamento);

  // Porcentagem sempre relativa a 50K (GOAL_1)
  // 50K = 100%, 65K = 130%, 80K = 160%
  const BASE_GOAL = GOAL_1;
  const salesPercentageText = (data.faturamento / BASE_GOAL) * 100;

  // Barra: ocupa no máximo 160% de espaço visual, então escalamos para caber em 100% visual
  // Dividimos o espaço da barra em 3 segmentos iguais: 0-100% é verde, 100-130% é prata, 130-160% é dourado
  // Cada segmento ocupa 1/3 da largura visual do container
  // Verde:   de 0% a 33.33% do container = 0 a 50K
  // Prata:   de 33.33% a 66.66% do container = 50K a 65K
  // Dourado: de 66.66% a 100% do container = 65K a 80K
  const seg1End = GOAL_1 / GOAL_3;          // 62.5% do valor máximo
  const seg2End = GOAL_2 / GOAL_3;          // 81.25% do valor máximo
  // Mas queremos que visualmente 50K = 33.3%, 65K = 66.6%, 80K = 100%
  // Então mapeamos o valor para a escala visual:
  const mapToVisual = (val: number) => {
    if (val <= GOAL_1) return (val / GOAL_1) * 33.33;
    if (val <= GOAL_2) return 33.33 + ((val - GOAL_1) / (GOAL_2 - GOAL_1)) * 33.33;
    return 66.66 + ((val - GOAL_2) / (GOAL_3 - GOAL_2)) * 33.34;
  };
  const salesBarVisualWidth = Math.min(mapToVisual(data.faturamento), 100);

  // Formatters
  const formatMoney = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formatNum = (val: number) => val.toLocaleString('pt-BR')

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Dashboard
            </h1>
            <p className="text-slate-400">Acompanhamento e estatísticas de tráfego, vendas e agendamentos.</p>
          </div>
          <div className="flex items-center gap-3">
            <EditMetricModal onSuccess={carregarDados} initialData={data} />
            <AddMetricModal onSuccess={carregarDados} />
          </div>
        </div>

        {/* Goals Progress Bars */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            Metas de Vendas & KPIs de Escala
          </h2>
          
          {/* Main Goal - Full Line */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              {/* Sales Goal Custom Content */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5 hover:bg-white/[0.04] transition-colors relative overflow-hidden group h-full flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-400 opacity-[0.05] blur-3xl rounded-full group-hover:opacity-[0.1] transition-opacity" />
                
                <div className="flex justify-between items-end mb-6 relative z-10">
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium mb-1">META DE VENDAS (Faturamento Agregado)</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-white tracking-tight">{formatMoney(data.faturamento)}</span>
                      <span className="text-sm font-medium text-slate-500">/ Meta atual: {formatMoney(salesActiveGoal)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-yellow-500">
                      {salesPercentageText.toFixed(0)}%
                    </span>
                    <p className="text-[10px] text-slate-600 mt-0.5">base 50K</p>
                  </div>
                </div>

                {/* Segmented Progress Bar
                    Verde  = 0→50K  → ocupa 62.5% da barra  (50K / 80K)
                    Prata  = 50K→65K → ocupa 18.75% da barra (15K / 80K)
                    Dourado = 65K→80K → ocupa 18.75% da barra (15K / 80K)
                    Assim: 50K visual == 100% da meta base */}
                <div className="relative z-10 w-full pb-6">
                  <div className="h-4 w-full rounded-full shadow-inner flex overflow-hidden border border-white/5">

                    {/* VERDE — 0 a 50K — 62.5% da barra */}
                    <div className="h-full bg-slate-900 relative flex-shrink-0" style={{ width: '62.5%' }}>
                      <div
                        className="h-full bg-gradient-to-r from-emerald-700 to-emerald-400 transition-all duration-1000 ease-out absolute left-0 top-0"
                        style={{ width: `${Math.min((data.faturamento / GOAL_1) * 100, 100)}%` }}
                      />
                    </div>

                    {/* Divisor 50K */}
                    <div className="w-px h-full bg-white/25 flex-shrink-0" />

                    {/* PRATA — 50K a 65K — 18.75% da barra */}
                    <div className="h-full bg-slate-900 relative flex-shrink-0" style={{ width: '18.75%' }}>
                      <div
                        className="h-full bg-gradient-to-r from-slate-500 to-slate-300 transition-all duration-1000 ease-out absolute left-0 top-0"
                        style={{ width: `${Math.min(Math.max((data.faturamento - GOAL_1) / (GOAL_2 - GOAL_1) * 100, 0), 100)}%` }}
                      />
                    </div>

                    {/* Divisor 65K */}
                    <div className="w-px h-full bg-white/25 flex-shrink-0" />

                    {/* DOURADO — 65K a 80K — 18.75% da barra */}
                    <div className="h-full bg-slate-900 relative flex-1">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-300 transition-all duration-1000 ease-out absolute left-0 top-0"
                        style={{ width: `${Math.min(Math.max((data.faturamento - GOAL_2) / (GOAL_3 - GOAL_2) * 100, 0), 100)}%` }}
                      />
                    </div>

                  </div>

                  {/* Labels alinhados às divisões reais da barra */}
                  <div className="relative mt-1.5 text-[10px] w-full">
                    <span className="absolute left-0 text-emerald-500/70 font-medium">0</span>
                    <span className="absolute text-emerald-500/70 font-medium" style={{ left: 'calc(62.5% - 10px)' }}>50K</span>
                    <span className="absolute text-slate-400/70 font-medium" style={{ left: 'calc(81.25% - 10px)' }}>65K</span>
                    <span className="absolute right-0 text-yellow-600/70 font-medium">80K ✦</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Card: Falta para a próxima meta */}
            <div className="lg:col-span-1 bg-white/[0.02] border border-white/[0.05] rounded-xl p-5 flex flex-col justify-center items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500 to-yellow-400 opacity-[0.05] blur-3xl rounded-full group-hover:opacity-[0.1] transition-opacity" />
              <h3 className="text-slate-400 text-sm font-medium mb-2">
                {leftToNextGoal === 0
                  ? '🏆 Meta de 80K Atingida!'
                  : `Falta para a Meta (${salesActiveGoal >= 1000 ? `${salesActiveGoal / 1000}K` : salesActiveGoal})`
                }
              </h3>
              <span className="text-3xl font-bold text-white tracking-tight">
                {leftToNextGoal === 0
                  ? formatMoney(data.faturamento)
                  : formatMoney(leftToNextGoal)
                }
              </span>
              {leftToNextGoal === 0 && (
                <span className="text-sm text-yellow-400 mt-2 font-medium">✨ Todas as metas concluídas! ✨</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TriGoalBar
              title="Total de Vendas"
              currentValue={data.vendasQtd}
              goal1={19}
              goal2={25}
              goal3={31}
              formatValue={formatNum}
            />
            <TriGoalBar
              title="Leads (Tráfego + Indicação)"
              currentValue={totalLeads}
              goal1={225}
              goal2={295}
              goal3={368}
              formatValue={formatNum}
            />
            <TriGoalBar
              title="Reuniões Agendadas"
              currentValue={data.reunioesAgendadas}
              goal1={90}
              goal2={118}
              goal3={147}
              formatValue={formatNum}
            />
            <TriGoalBar
              title="Reuniões Realizadas"
              currentValue={data.reunioesRealizadas}
              goal1={63}
              goal2={83}
              goal3={103}
              formatValue={formatNum}
            />
          </div>
        </section>

        {/* Metrics Box (Squares) */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Métricas de Conversão
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Taxa de Agendamento" 
              value={`${taxaAgendamento.toFixed(2)}%`} 
              subtitle="Agendamentos / Total de Leads"
              icon={<Calendar className="w-5 h-5" />}
            />
            <KpiCard 
              title="Taxa de Comparecimento" 
              value={`${taxaComparecimento.toFixed(2)}%`} 
              subtitle="Realizadas / Agendadas"
              icon={<Users className="w-5 h-5" />}
            />
            <KpiCard 
              title="Taxa de Venda (Fechamento)" 
              value={`${taxaVenda.toFixed(2)}%`} 
              subtitle="Vendas / Reunião Realizada"
              icon={<CheckCircle className="w-5 h-5" />}
            />
            <KpiCard 
              title="Lead p/ Fechamento Global" 
              value={`${taxaLeadFechamento.toFixed(2)}%`} 
              subtitle="Vendas / Total de Leads"
              icon={<TrendingUp className="w-5 h-5" />}
            />

            <KpiCard 
              title="CAC Médio" 
              value={formatMoney(cac)} 
              subtitle="Investimento / Qtd Vendas"
              icon={<DollarSign className="w-5 h-5" />}
            />
            <KpiCard 
              title="No-Show (Faltas)" 
              value={noShow.toString()} 
              subtitle="Agendadas - Realizadas"
              icon={<Activity className="w-5 h-5" />}
            />
            <KpiCard 
              title="Investimento em Tráfego" 
              value={formatMoney(data.investimentoTrafego)} 
              icon={<MousePointerClick className="w-5 h-5" />}
            />
          </div>
        </section>

      </div>
    </div>
  )
}

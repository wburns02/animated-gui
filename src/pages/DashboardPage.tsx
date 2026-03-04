import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import { api } from '../api'
import type { Stats, Task, Worker, EventLog } from '../api'
import { usePolling } from '../hooks/usePolling'

const statCards = [
  { key: 'total_tasks' as const, label: 'Total Tasks', icon: '◈', color: '#8338ec' },
  { key: 'running' as const, label: 'Running', icon: '▶', color: '#3b82f6' },
  { key: 'pending' as const, label: 'Pending', icon: '◇', color: '#eab308' },
  { key: 'completed' as const, label: 'Completed', icon: '✓', color: '#10b981' },
  { key: 'failed' as const, label: 'Failed', icon: '✕', color: '#ef4444' },
  { key: 'active_workers' as const, label: 'Workers', icon: '⚡', color: '#00d4ff' },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: stats } = usePolling<Stats>(useCallback(() => api.stats(), []), 3000)
  const { data: tasks } = usePolling<Task[]>(useCallback(() => api.tasks.list(), []), 3000)
  const { data: workers } = usePolling<Worker[]>(useCallback(() => api.workers.active(), []), 3000)
  const { data: events } = usePolling<EventLog[]>(useCallback(() => api.events.list(15), []), 5000)

  const recentTasks = tasks?.slice(0, 8) || []
  const recentEvents = events?.slice(0, 10) || []

  return (
    <PageTransition>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 2rem', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" style={{ gap: '16px' }}>
          {statCards.map(({ key, label, icon, color }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard glowColor={color} padding="16px">
                <div className="text-2xl" style={{ color, marginBottom: '4px' }}>{icon}</div>
                <div className="text-2xl font-bold text-white">
                  {stats ? stats[key] : '—'}
                </div>
                <div className="text-xs text-gray-400" style={{ marginTop: '4px' }}>{label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Cost */}
        {stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <GlassCard glowColor="#ff006e" className="inline-block" padding="16px">
              <span className="text-gray-400 text-sm" style={{ marginRight: '12px' }}>Total Cost</span>
              <span className="text-xl font-bold text-neon-pink">${stats.total_cost.toFixed(4)}</span>
            </GlassCard>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3" style={{ gap: '24px' }}>
          {/* Active Workers */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard glowColor="#00d4ff" padding="20px">
              <h2 className="text-lg font-semibold text-neon-blue flex items-center" style={{ marginBottom: '16px', gap: '8px' }}>
                <span className="text-xl">⚡</span> Active Workers
              </h2>
              {workers && workers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {workers.map(w => (
                    <div key={w.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.05]" style={{ padding: '12px' }}>
                      <div>
                        <div className="text-sm font-medium text-white">Worker #{w.id}</div>
                        <div className="text-xs text-gray-500">Task #{w.task_id} · {w.model}</div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={w.status} />
                        <div className="text-xs text-gray-500" style={{ marginTop: '4px' }}>${w.total_cost_usd.toFixed(4)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm" style={{ padding: '32px 0' }}>No active workers</div>
              )}
            </GlassCard>
          </motion.div>

          {/* Recent Tasks */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard glowColor="#8338ec" padding="20px">
              <h2 className="text-lg font-semibold text-neon-purple flex items-center justify-between" style={{ marginBottom: '16px' }}>
                <span className="flex items-center" style={{ gap: '8px' }}><span className="text-xl">◈</span> Tasks</span>
                <button onClick={() => navigate('/tasks')} className="text-xs text-gray-400 hover:text-white transition-colors">View all →</button>
              </h2>
              {recentTasks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentTasks.map(t => (
                    <motion.div
                      key={t.id}
                      className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-neon-purple/30 transition-colors cursor-pointer"
                      style={{ padding: '10px' }}
                      onClick={() => navigate(`/tasks/${t.id}`)}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex-1" style={{ minWidth: 0 }}>
                        <div className="text-sm font-medium text-white truncate">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.model} · P{t.priority}</div>
                      </div>
                      <StatusBadge status={t.status} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm" style={{ padding: '32px 0' }}>No tasks yet</div>
              )}
            </GlassCard>
          </motion.div>

          {/* Event Log */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard glowColor="#00f5a0" padding="20px">
              <h2 className="text-lg font-semibold text-neon-green flex items-center justify-between" style={{ marginBottom: '16px' }}>
                <span className="flex items-center" style={{ gap: '8px' }}><span className="text-xl">◎</span> Events</span>
                <button onClick={() => navigate('/events')} className="text-xs text-gray-400 hover:text-white transition-colors">View all →</button>
              </h2>
              {recentEvents.length > 0 ? (
                <div className="overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', paddingRight: '4px' }}>
                  {recentEvents.map(e => (
                    <div key={e.id} className="rounded-lg bg-white/[0.02] border border-white/[0.05]" style={{ padding: '10px' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-neon-green/80">{e.event_type}</span>
                        <span className="text-xs text-gray-600">{new Date(e.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm" style={{ padding: '32px 0' }}>No events yet</div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}

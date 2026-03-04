import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import { api } from '../api'
import type { Stats, Task, Worker, EventLog, Session } from '../api'
import { usePolling } from '../hooks/usePolling'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: stats } = usePolling<Stats>(useCallback(() => api.stats(), []), 3000)
  const { data: sessions } = usePolling<Session[]>(useCallback(() => api.sessions.list(), []), 3000)
  const { data: tasks } = usePolling<Task[]>(useCallback(() => api.tasks.list(), []), 5000)
  const { data: workers } = usePolling<Worker[]>(useCallback(() => api.workers.active(), []), 5000)
  const { data: events } = usePolling<EventLog[]>(useCallback(() => api.events.list(15), []), 5000)

  const running = sessions?.filter(s => s.status === 'running') || []
  const recentTasks = tasks?.slice(0, 6) || []
  const recentEvents = events?.slice(0, 8) || []

  return (
    <PageTransition>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 2rem', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Live Sessions — Hero Section */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <div className="flex items-center" style={{ gap: '12px' }}>
              <h2 className="text-xl font-bold text-white">Live Claude Sessions</h2>
              {running.length > 0 && (
                <motion.span
                  className="rounded-full bg-neon-green/15 text-neon-green text-xs font-bold"
                  style={{ padding: '4px 10px' }}
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {running.length} active
                </motion.span>
              )}
            </div>
            <button onClick={() => navigate('/sessions')} className="text-xs text-gray-400 hover:text-white transition-colors">View all →</button>
          </div>

          {sessions && sessions.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: '12px' }}>
              {sessions.map((s, i) => (
                <motion.div
                  key={s.pid}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate('/sessions')}
                  className="cursor-pointer"
                >
                  <GlassCard glowColor={s.status === 'running' ? '#00f5a0' : '#6b7280'} padding="14px">
                    <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                      <div className="flex items-center" style={{ gap: '8px' }}>
                        <motion.div
                          className="rounded-full"
                          style={{ width: '8px', height: '8px', backgroundColor: s.status === 'running' ? '#00f5a0' : '#6b7280' }}
                          animate={s.status === 'running' ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                        <span className="text-sm font-bold text-white truncate" style={{ maxWidth: '160px' }}>
                          {s.session_title || s.tty || `PID ${s.pid}`}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">{s.tty}</span>
                    </div>
                    <div className="grid grid-cols-3 text-xs" style={{ gap: '8px' }}>
                      <div>
                        <span className="text-gray-500">CPU</span>
                        <div className="text-white font-mono">{s.cpu_percent.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Mem</span>
                        <div className="text-white font-mono">{s.mem_mb} MB</div>
                      </div>
                      <div>
                        <span className="text-gray-500">PID</span>
                        <div className="text-white font-mono">{s.pid}</div>
                      </div>
                    </div>
                    {s.session_slug && (
                      <div className="text-xs font-mono text-neon-purple truncate" style={{ marginTop: '6px' }}>{s.session_slug}</div>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          ) : sessions ? (
            <GlassCard glowColor="#6b7280" padding="32px">
              <div className="text-center text-gray-500 text-sm">No Claude sessions detected. Start a Claude session in your terminal to see it here.</div>
            </GlassCard>
          ) : (
            <GlassCard glowColor="#6b7280" padding="32px">
              <div className="text-center text-gray-500 text-sm">Loading sessions...</div>
            </GlassCard>
          )}
        </div>

        {/* Conductor Stats — Secondary */}
        {stats && (stats.total_tasks > 0 || (workers && workers.length > 0)) && (
          <div>
            <h2 className="text-lg font-semibold text-gray-400" style={{ marginBottom: '12px' }}>Conductor Orchestration</h2>
            <div className="grid grid-cols-3 md:grid-cols-6" style={{ gap: '12px' }}>
              {[
                { val: stats.total_tasks, label: 'Tasks', icon: '◈', color: '#8338ec' },
                { val: stats.running, label: 'Running', icon: '▶', color: '#3b82f6' },
                { val: stats.pending, label: 'Pending', icon: '◇', color: '#eab308' },
                { val: stats.completed, label: 'Done', icon: '✓', color: '#10b981' },
                { val: stats.failed, label: 'Failed', icon: '✕', color: '#ef4444' },
                { val: stats.active_workers, label: 'Workers', icon: '⚡', color: '#00d4ff' },
              ].map(({ val, label, icon, color }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.03 }}>
                  <GlassCard glowColor={color} padding="12px">
                    <div className="text-lg" style={{ color }}>{icon}</div>
                    <div className="text-xl font-bold text-white">{val}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
            {stats.total_cost > 0 && (
              <div style={{ marginTop: '12px' }}>
                <GlassCard glowColor="#ff006e" className="inline-block" padding="12px 16px">
                  <span className="text-gray-400 text-sm" style={{ marginRight: '8px' }}>Total Cost</span>
                  <span className="text-lg font-bold text-neon-pink">${stats.total_cost.toFixed(4)}</span>
                </GlassCard>
              </div>
            )}
          </div>
        )}

        {/* Bottom Grid: Workers, Tasks, Events */}
        <div className="grid lg:grid-cols-3" style={{ gap: '20px' }}>
          {/* Active Workers */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard glowColor="#00d4ff" padding="20px">
              <h2 className="text-lg font-semibold text-neon-blue flex items-center" style={{ marginBottom: '16px', gap: '8px' }}>
                <span className="text-xl">⚡</span> Active Workers
              </h2>
              {workers && workers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {workers.map(w => (
                    <div key={w.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.05]" style={{ padding: '10px' }}>
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
                <div className="text-center text-gray-500 text-sm" style={{ padding: '24px 0' }}>No active workers</div>
              )}
            </GlassCard>
          </motion.div>

          {/* Recent Tasks */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
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
                <div className="text-center text-gray-500 text-sm" style={{ padding: '24px 0' }}>No tasks yet</div>
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
                <div className="text-center text-gray-500 text-sm" style={{ padding: '24px 0' }}>No events yet</div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}

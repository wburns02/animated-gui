import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import { api } from '../api'
import type { Worker } from '../api'
import { usePolling } from '../hooks/usePolling'

export default function WorkersPage() {
  const navigate = useNavigate()
  const { data: workers } = usePolling<Worker[]>(useCallback(() => api.workers.list(), []), 3000)

  const active = workers?.filter(w => w.status === 'running') || []
  const inactive = workers?.filter(w => w.status !== 'running') || []

  return (
    <PageTransition>
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '2rem 2rem', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h1 className="text-2xl font-bold text-white">Workers</h1>

        {active.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-neon-blue uppercase tracking-wider" style={{ marginBottom: '12px' }}>Active ({active.length})</h2>
            <div className="grid md:grid-cols-2" style={{ gap: '16px' }}>
              {active.map((w, i) => (
                <motion.div key={w.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <WorkerCard worker={w} onClick={() => navigate(`/tasks/${w.task_id}`)} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider" style={{ marginBottom: '12px' }}>History ({inactive.length})</h2>
          <div className="grid md:grid-cols-2" style={{ gap: '16px' }}>
            {inactive.map((w, i) => (
              <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <WorkerCard worker={w} onClick={() => navigate(`/tasks/${w.task_id}`)} />
              </motion.div>
            ))}
          </div>
          {!workers && <div className="text-center text-gray-500" style={{ padding: '64px 0' }}>Loading workers...</div>}
          {workers && workers.length === 0 && <div className="text-center text-gray-500" style={{ padding: '64px 0' }}>No workers yet.</div>}
        </div>
      </div>
    </PageTransition>
  )
}

function WorkerCard({ worker: w, onClick }: { worker: Worker; onClick: () => void }) {
  const glowColor = w.status === 'running' ? '#3b82f6' : w.status === 'completed' ? '#10b981' : w.status === 'failed' ? '#ef4444' : '#6b7280'

  return (
    <GlassCard glowColor={glowColor} className="cursor-pointer" padding="16px">
      <div onClick={onClick}>
        <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <span className="text-sm font-bold text-white">Worker #{w.id}</span>
            <span className="text-xs text-gray-500 font-mono">PID {w.pid}</span>
          </div>
          <StatusBadge status={w.status} />
        </div>
        <div className="grid grid-cols-2 text-xs" style={{ gap: '12px' }}>
          <div>
            <span className="text-gray-500">Task</span>
            <div className="text-white font-mono">#{w.task_id}</div>
          </div>
          <div>
            <span className="text-gray-500">Model</span>
            <div className="text-white">{w.model}</div>
          </div>
          <div>
            <span className="text-gray-500">Output Lines</span>
            <div className="text-white">{w.output_lines}</div>
          </div>
          <div>
            <span className="text-gray-500">Cost</span>
            <div className="text-neon-blue font-mono">${w.total_cost_usd.toFixed(4)}</div>
          </div>
        </div>
        <div className="text-xs text-gray-600" style={{ marginTop: '12px' }}>
          Started: {new Date(w.started_at).toLocaleString()}
          {w.last_output_at && ` · Last output: ${new Date(w.last_output_at).toLocaleTimeString()}`}
        </div>
      </div>
    </GlassCard>
  )
}

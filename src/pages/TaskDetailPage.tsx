import { useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import AnimatedButton from '../components/AnimatedButton'
import { api } from '../api'
import type { Task } from '../api'
import { usePolling } from '../hooks/usePolling'

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const taskId = Number(id)

  const { data: task, refresh } = usePolling<Task>(
    useCallback(() => api.tasks.get(taskId), [taskId]),
    2000,
  )

  if (!task) {
    return (
      <PageTransition>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 2rem' }}>
          <div className="text-center text-gray-500" style={{ padding: '64px 0' }}>Loading task...</div>
        </div>
      </PageTransition>
    )
  }

  const deps = (() => {
    try { return JSON.parse(task.depends_on) as number[] }
    catch { return [] }
  })()

  return (
    <PageTransition>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 2rem', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="flex items-center" style={{ gap: '16px' }}>
          <AnimatedButton variant="ghost" onClick={() => navigate('/tasks')}>← Back</AnimatedButton>
          <div className="flex-1">
            <div className="flex items-center" style={{ gap: '12px' }}>
              <span className="text-sm text-gray-600 font-mono">#{task.id}</span>
              <h1 className="text-xl font-bold text-white">{task.name}</h1>
              <StatusBadge status={task.status} />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4" style={{ gap: '16px' }}>
          {[
            { label: 'Model', value: task.model, color: '#8338ec' },
            { label: 'Priority', value: `P${task.priority}`, color: '#eab308' },
            { label: 'Budget', value: `$${task.budget_usd}`, color: '#00d4ff' },
            { label: 'Worker', value: task.worker_id ? `#${task.worker_id}` : 'None', color: '#00f5a0' },
          ].map(({ label, value, color }) => (
            <GlassCard key={label} glowColor={color} className="text-center" padding="16px">
              <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
              <div className="text-lg font-bold text-white" style={{ marginTop: '4px' }}>{value}</div>
            </GlassCard>
          ))}
        </div>

        {deps.length > 0 && (
          <GlassCard glowColor="#ff6b35" padding="16px">
            <div className="text-xs text-gray-500 uppercase tracking-wider" style={{ marginBottom: '8px' }}>Dependencies</div>
            <div className="flex" style={{ gap: '8px' }}>
              {deps.map(d => (
                <motion.button
                  key={d}
                  onClick={() => navigate(`/tasks/${d}`)}
                  className="rounded-full bg-orange-500/10 text-orange-400 text-xs font-mono border border-orange-500/20 hover:border-orange-500/50 transition-colors"
                  style={{ padding: '4px 12px' }}
                  whileHover={{ scale: 1.05 }}
                >
                  Task #{d}
                </motion.button>
              ))}
            </div>
          </GlassCard>
        )}

        {task.promise_tag && (
          <GlassCard glowColor="#00f5a0" padding="16px">
            <div className="text-xs text-gray-500 uppercase tracking-wider" style={{ marginBottom: '4px' }}>Promise Tag</div>
            <div className="text-sm font-mono text-neon-green">{task.promise_tag}</div>
          </GlassCard>
        )}

        <GlassCard glowColor="#8338ec" padding="20px">
          <div className="text-xs text-gray-500 uppercase tracking-wider" style={{ marginBottom: '12px' }}>Prompt</div>
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{task.prompt}</p>
        </GlassCard>

        {task.output && (
          <GlassCard glowColor="#00d4ff" padding="20px">
            <div className="text-xs text-gray-500 uppercase tracking-wider" style={{ marginBottom: '12px' }}>Output</div>
            <pre className="text-xs text-gray-400 bg-black/30 rounded-lg font-mono whitespace-pre-wrap overflow-y-auto" style={{ padding: '16px', maxHeight: '384px' }}>
              {task.output}
            </pre>
          </GlassCard>
        )}

        {task.error && (
          <GlassCard glowColor="#ef4444" padding="20px">
            <div className="text-xs text-red-400 uppercase tracking-wider" style={{ marginBottom: '12px' }}>Error</div>
            <pre className="text-xs text-red-300/80 bg-red-500/5 rounded-lg font-mono whitespace-pre-wrap" style={{ padding: '16px' }}>
              {task.error}
            </pre>
          </GlassCard>
        )}

        <div className="flex items-center text-xs text-gray-600" style={{ gap: '16px' }}>
          <span>Created: {new Date(task.created_at).toLocaleString()}</span>
          {task.started_at && <span>Started: {new Date(task.started_at).toLocaleString()}</span>}
          {task.completed_at && <span>Completed: {new Date(task.completed_at).toLocaleString()}</span>}
        </div>

        <div className="flex" style={{ gap: '12px' }}>
          {task.status === 'failed' && (
            <AnimatedButton variant="secondary" onClick={async () => { await api.tasks.update(task.id, { status: 'pending' }); refresh() }}>
              Retry Task
            </AnimatedButton>
          )}
          {task.status === 'pending' && (
            <AnimatedButton variant="ghost" onClick={async () => { await api.tasks.delete(task.id); navigate('/tasks') }}>
              Delete Task
            </AnimatedButton>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

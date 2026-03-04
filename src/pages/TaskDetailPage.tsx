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
          <div className="text-center py-16 text-gray-500">Loading task...</div>
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
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 2rem' }} className="space-y-6">
        <div className="flex items-center gap-4">
          <AnimatedButton variant="ghost" onClick={() => navigate('/tasks')}>← Back</AnimatedButton>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-mono">#{task.id}</span>
              <h1 className="text-xl font-bold text-white">{task.name}</h1>
              <StatusBadge status={task.status} />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Model', value: task.model, color: '#8338ec' },
            { label: 'Priority', value: `P${task.priority}`, color: '#eab308' },
            { label: 'Budget', value: `$${task.budget_usd}`, color: '#00d4ff' },
            { label: 'Worker', value: task.worker_id ? `#${task.worker_id}` : 'None', color: '#00f5a0' },
          ].map(({ label, value, color }) => (
            <GlassCard key={label} glowColor={color} className="p-4 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
              <div className="text-lg font-bold text-white mt-1">{value}</div>
            </GlassCard>
          ))}
        </div>

        {deps.length > 0 && (
          <GlassCard glowColor="#ff6b35" className="p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Dependencies</div>
            <div className="flex gap-2">
              {deps.map(d => (
                <motion.button
                  key={d}
                  onClick={() => navigate(`/tasks/${d}`)}
                  className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-mono border border-orange-500/20 hover:border-orange-500/50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Task #{d}
                </motion.button>
              ))}
            </div>
          </GlassCard>
        )}

        {task.promise_tag && (
          <GlassCard glowColor="#00f5a0" className="p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Promise Tag</div>
            <div className="text-sm font-mono text-neon-green">{task.promise_tag}</div>
          </GlassCard>
        )}

        <GlassCard glowColor="#8338ec" className="p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Prompt</div>
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{task.prompt}</p>
        </GlassCard>

        {task.output && (
          <GlassCard glowColor="#00d4ff" className="p-5">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Output</div>
            <pre className="text-xs text-gray-400 bg-black/30 rounded-lg p-4 max-h-96 overflow-y-auto font-mono whitespace-pre-wrap">
              {task.output}
            </pre>
          </GlassCard>
        )}

        {task.error && (
          <GlassCard glowColor="#ef4444" className="p-5">
            <div className="text-xs text-red-400 uppercase tracking-wider mb-3">Error</div>
            <pre className="text-xs text-red-300/80 bg-red-500/5 rounded-lg p-4 font-mono whitespace-pre-wrap">
              {task.error}
            </pre>
          </GlassCard>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>Created: {new Date(task.created_at).toLocaleString()}</span>
          {task.started_at && <span>Started: {new Date(task.started_at).toLocaleString()}</span>}
          {task.completed_at && <span>Completed: {new Date(task.completed_at).toLocaleString()}</span>}
        </div>

        <div className="flex gap-3">
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

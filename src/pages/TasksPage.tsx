import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import AnimatedButton from '../components/AnimatedButton'
import { api } from '../api'
import type { Task } from '../api'
import { usePolling } from '../hooks/usePolling'

const statusFilters = ['all', 'pending', 'running', 'completed', 'failed', 'blocked'] as const

export default function TasksPage() {
  const { data: tasks, refresh } = usePolling<Task[]>(useCallback(() => api.tasks.list(), []), 3000)
  const [filter, setFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const filtered = tasks?.filter(t => filter === 'all' || t.status === filter) || []

  return (
    <PageTransition>
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '2rem 2rem', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <AnimatedButton onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : '+ New Task'}
          </AnimatedButton>
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <CreateTaskForm onCreated={() => { setShowCreate(false); refresh() }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Pills */}
        <div className="flex flex-wrap" style={{ gap: '8px' }}>
          {statusFilters.map(s => (
            <motion.button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full text-xs font-medium transition-all ${
                filter === s
                  ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/40'
                  : 'bg-white/[0.03] text-gray-400 border border-white/[0.05] hover:text-white'
              }`}
              style={{ padding: '6px 12px' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {s} {tasks && s !== 'all' ? `(${tasks.filter(t => t.status === s).length})` : tasks ? `(${tasks.length})` : ''}
            </motion.button>
          ))}
        </div>

        {/* Task List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence>
            {filtered.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.03 }}
              >
                <GlassCard
                  glowColor={task.status === 'running' ? '#3b82f6' : task.status === 'failed' ? '#ef4444' : '#8338ec'}
                  padding="16px"
                >
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                  >
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <div className="flex items-center" style={{ gap: '12px' }}>
                        <span className="text-xs text-gray-600 font-mono">#{task.id}</span>
                        <h3 className="text-sm font-semibold text-white truncate">{task.name}</h3>
                      </div>
                      <div className="flex items-center text-xs text-gray-500" style={{ gap: '12px', marginTop: '6px' }}>
                        <span>{task.model}</span>
                        <span>P{task.priority}</span>
                        {task.budget_usd && <span>${task.budget_usd} budget</span>}
                        {task.promise_tag && <span className="text-neon-green/60">🏷 {task.promise_tag}</span>}
                      </div>
                    </div>
                    <div className="flex items-center" style={{ gap: '12px' }}>
                      <StatusBadge status={task.status} />
                      <motion.span
                        className="text-gray-500 text-xs"
                        animate={{ rotate: expandedId === task.id ? 180 : 0 }}
                      >▼</motion.span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === task.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/[0.05]" style={{ marginTop: '16px', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wider">Prompt</label>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed overflow-y-auto" style={{ marginTop: '4px', maxHeight: '160px' }}>
                              {task.prompt}
                            </p>
                          </div>
                          {task.output && (
                            <div>
                              <label className="text-xs text-gray-500 uppercase tracking-wider">Output</label>
                              <pre className="text-xs text-gray-400 bg-black/30 rounded-lg font-mono whitespace-pre-wrap overflow-y-auto" style={{ marginTop: '4px', padding: '12px', maxHeight: '160px' }}>
                                {task.output.slice(-2000)}
                              </pre>
                            </div>
                          )}
                          {task.error && (
                            <div>
                              <label className="text-xs text-red-400 uppercase tracking-wider">Error</label>
                              <pre className="text-xs text-red-300/80 bg-red-500/5 rounded-lg font-mono whitespace-pre-wrap" style={{ marginTop: '4px', padding: '12px' }}>
                                {task.error}
                              </pre>
                            </div>
                          )}
                          <div className="flex items-center text-xs text-gray-600" style={{ gap: '12px' }}>
                            <span>Created: {new Date(task.created_at).toLocaleString()}</span>
                            {task.started_at && <span>Started: {new Date(task.started_at).toLocaleString()}</span>}
                            {task.completed_at && <span>Done: {new Date(task.completed_at).toLocaleString()}</span>}
                          </div>
                          <div className="flex" style={{ gap: '8px', paddingTop: '8px' }}>
                            {task.status === 'pending' && (
                              <AnimatedButton variant="ghost" onClick={async () => { await api.tasks.delete(task.id); refresh() }}>
                                Delete
                              </AnimatedButton>
                            )}
                            {task.status === 'failed' && (
                              <AnimatedButton variant="secondary" onClick={async () => { await api.tasks.update(task.id, { status: 'pending' }); refresh() }}>
                                Retry
                              </AnimatedButton>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && !tasks && (
            <div className="text-center text-gray-500" style={{ padding: '64px 0' }}>Loading tasks...</div>
          )}
          {filtered.length === 0 && tasks && (
            <div className="text-center text-gray-500" style={{ padding: '64px 0' }}>
              {filter === 'all' ? 'No tasks yet. Create one to get started.' : `No ${filter} tasks.`}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

function CreateTaskForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('sonnet')
  const [priority, setPriority] = useState(5)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !prompt.trim()) return
    setSubmitting(true)
    try {
      await api.tasks.create({ name: name.trim(), prompt: prompt.trim(), model, priority })
      onCreated()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <GlassCard glowColor="#8338ec" padding="20px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider">Task Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple/50"
            style={{ marginTop: '4px', padding: '8px 12px' }}
            placeholder="e.g., Build auth system"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider">Prompt</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple/50 resize-none"
            style={{ marginTop: '4px', padding: '8px 12px' }}
            placeholder="Describe what the AI should build..."
          />
        </div>
        <div className="flex" style={{ gap: '16px' }}>
          <div className="flex-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Model</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-neon-purple/50"
              style={{ marginTop: '4px', padding: '8px 12px' }}
            >
              <option value="sonnet" className="bg-dark-800">Sonnet</option>
              <option value="opus" className="bg-dark-800">Opus</option>
              <option value="haiku" className="bg-dark-800">Haiku</option>
            </select>
          </div>
          <div style={{ width: '96px' }}>
            <label className="text-xs text-gray-400 uppercase tracking-wider">Priority</label>
            <input
              type="number"
              value={priority}
              onChange={e => setPriority(Number(e.target.value))}
              min={1}
              max={10}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-neon-purple/50"
              style={{ marginTop: '4px', padding: '8px 12px' }}
            />
          </div>
        </div>
        <motion.button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl font-semibold text-sm bg-gradient-to-r from-[#8338ec] to-[#00d4ff] text-white shadow-lg shadow-[#8338ec]/20 cursor-pointer disabled:opacity-50"
          style={{ padding: '12px 24px' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {submitting ? 'Creating...' : 'Create Task'}
        </motion.button>
      </form>
    </GlassCard>
  )
}

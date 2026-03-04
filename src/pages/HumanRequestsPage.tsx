import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import GlassCard from '../components/GlassCard'
import AnimatedButton from '../components/AnimatedButton'
import { api } from '../api'
import type { HumanRequest } from '../api'
import { usePolling } from '../hooks/usePolling'

export default function HumanRequestsPage() {
  const { data: requests, refresh } = usePolling<HumanRequest[]>(
    useCallback(() => api.humanRequests.list(), []),
    3000,
  )

  const pending = requests?.filter(r => r.status === 'pending') || []
  const answered = requests?.filter(r => r.status === 'answered') || []

  return (
    <PageTransition>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 2rem' }} className="space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Human Requests</h1>
          {pending.length > 0 && (
            <motion.span
              className="px-2.5 py-1 rounded-full bg-neon-pink/15 text-neon-pink text-xs font-bold"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {pending.length} awaiting response
            </motion.span>
          )}
        </div>

        {pending.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-neon-pink uppercase tracking-wider">Pending</h2>
            {pending.map((req, i) => (
              <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <RequestCard request={req} onAnswered={refresh} />
              </motion.div>
            ))}
          </div>
        )}

        {answered.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Answered</h2>
            {answered.map((req, i) => (
              <motion.div key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <RequestCard request={req} />
              </motion.div>
            ))}
          </div>
        )}

        {!requests && <div className="text-center py-16 text-gray-500">Loading...</div>}
        {requests && requests.length === 0 && (
          <div className="text-center py-16 text-gray-500">No human requests. Workers will ask for help here when they need it.</div>
        )}
      </div>
    </PageTransition>
  )
}

function RequestCard({ request: req, onAnswered }: { request: HumanRequest; onAnswered?: () => void }) {
  const [response, setResponse] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isPending = req.status === 'pending'

  const handleSubmit = async () => {
    if (!response.trim()) return
    setSubmitting(true)
    try {
      await api.humanRequests.answer(req.id, response.trim())
      setShowForm(false)
      setResponse('')
      onAnswered?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <GlassCard glowColor={isPending ? '#ff006e' : '#6b7280'} className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs text-gray-500 font-mono">Task #{req.task_id} · Request #{req.id}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${isPending ? 'bg-neon-pink/15 text-neon-pink' : 'bg-gray-500/15 text-gray-400'}`}>
          {req.status}
        </span>
      </div>

      <div className="mb-3">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Question</div>
        <p className="text-sm text-white leading-relaxed">{req.question}</p>
      </div>

      {req.context && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Context</div>
          <pre className="text-xs text-gray-400 bg-black/20 rounded-lg p-3 max-h-32 overflow-y-auto font-mono whitespace-pre-wrap">{req.context}</pre>
        </div>
      )}

      {req.response && (
        <div className="mb-3">
          <div className="text-xs text-neon-green/70 uppercase tracking-wider mb-1">Response</div>
          <p className="text-sm text-gray-300 leading-relaxed">{req.response}</p>
        </div>
      )}

      {isPending && (
        <>
          {!showForm ? (
            <AnimatedButton onClick={() => setShowForm(true)}>
              Answer
            </AnimatedButton>
          ) : (
            <AnimatePresence>
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-3">
                <textarea
                  value={response}
                  onChange={e => setResponse(e.target.value)}
                  rows={3}
                  autoFocus
                  placeholder="Type your response..."
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-pink/50 resize-none"
                />
                <div className="flex gap-2">
                  <AnimatedButton onClick={handleSubmit}>
                    {submitting ? 'Sending...' : 'Send Response'}
                  </AnimatedButton>
                  <AnimatedButton variant="ghost" onClick={() => setShowForm(false)}>Cancel</AnimatedButton>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </>
      )}

      <div className="mt-3 text-xs text-gray-600">
        {new Date(req.created_at).toLocaleString()}
        {req.answered_at && ` · Answered: ${new Date(req.answered_at).toLocaleString()}`}
      </div>
    </GlassCard>
  )
}

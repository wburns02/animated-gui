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
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 2rem', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="flex items-center" style={{ gap: '12px' }}>
          <h1 className="text-2xl font-bold text-white">Human Requests</h1>
          {pending.length > 0 && (
            <motion.span
              className="rounded-full bg-neon-pink/15 text-neon-pink text-xs font-bold"
              style={{ padding: '4px 10px' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {pending.length} awaiting response
            </motion.span>
          )}
        </div>

        {pending.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 className="text-sm font-medium text-neon-pink uppercase tracking-wider">Pending</h2>
            {pending.map((req, i) => (
              <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <RequestCard request={req} onAnswered={refresh} />
              </motion.div>
            ))}
          </div>
        )}

        {answered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Answered</h2>
            {answered.map((req, i) => (
              <motion.div key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <RequestCard request={req} />
              </motion.div>
            ))}
          </div>
        )}

        {!requests && <div className="text-center text-gray-500" style={{ padding: '64px 0' }}>Loading...</div>}
        {requests && requests.length === 0 && (
          <div className="text-center text-gray-500" style={{ padding: '64px 0' }}>No human requests. Workers will ask for help here when they need it.</div>
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
    <GlassCard glowColor={isPending ? '#ff006e' : '#6b7280'} padding="20px">
      <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
        <div>
          <span className="text-xs text-gray-500 font-mono">Task #{req.task_id} · Request #{req.id}</span>
        </div>
        <span className={`text-xs rounded-full ${isPending ? 'bg-neon-pink/15 text-neon-pink' : 'bg-gray-500/15 text-gray-400'}`} style={{ padding: '2px 8px' }}>
          {req.status}
        </span>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div className="text-xs text-gray-500 uppercase tracking-wider" style={{ marginBottom: '4px' }}>Question</div>
        <p className="text-sm text-white leading-relaxed">{req.question}</p>
      </div>

      {req.context && (
        <div style={{ marginBottom: '12px' }}>
          <div className="text-xs text-gray-500 uppercase tracking-wider" style={{ marginBottom: '4px' }}>Context</div>
          <pre className="text-xs text-gray-400 bg-black/20 rounded-lg font-mono whitespace-pre-wrap overflow-y-auto" style={{ padding: '12px', maxHeight: '128px' }}>{req.context}</pre>
        </div>
      )}

      {req.response && (
        <div style={{ marginBottom: '12px' }}>
          <div className="text-xs text-neon-green/70 uppercase tracking-wider" style={{ marginBottom: '4px' }}>Response</div>
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
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea
                  value={response}
                  onChange={e => setResponse(e.target.value)}
                  rows={3}
                  autoFocus
                  placeholder="Type your response..."
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-pink/50 resize-none"
                  style={{ padding: '8px 12px' }}
                />
                <div className="flex" style={{ gap: '8px' }}>
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

      <div className="text-xs text-gray-600" style={{ marginTop: '12px' }}>
        {new Date(req.created_at).toLocaleString()}
        {req.answered_at && ` · Answered: ${new Date(req.answered_at).toLocaleString()}`}
      </div>
    </GlassCard>
  )
}

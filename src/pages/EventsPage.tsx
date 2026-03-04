import { useCallback } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import GlassCard from '../components/GlassCard'
import { api } from '../api'
import type { EventLog } from '../api'
import { usePolling } from '../hooks/usePolling'

const eventColors: Record<string, string> = {
  task_created: '#8338ec',
  task_started: '#3b82f6',
  task_completed: '#10b981',
  task_failed: '#ef4444',
  worker_spawned: '#00d4ff',
  worker_completed: '#10b981',
  worker_failed: '#ef4444',
  worker_killed: '#6b7280',
  decision_made: '#eab308',
  human_request: '#ff006e',
  promise_detected: '#00f5a0',
  cleared_all: '#ff6b35',
}

export default function EventsPage() {
  const { data: events } = usePolling<EventLog[]>(useCallback(() => api.events.list(100), []), 5000)

  return (
    <PageTransition>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 2rem' }} className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Event Log</h1>

        <div className="space-y-2">
          {events?.map((evt, i) => {
            const color = eventColors[evt.event_type] || '#6b7280'
            let details: Record<string, unknown> = {}
            try { details = JSON.parse(evt.details) } catch { /* noop */ }

            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <GlassCard glowColor={color} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-sm font-mono font-medium" style={{ color }}>{evt.event_type}</span>
                      {Object.keys(details).length > 0 && (
                        <span className="text-xs text-gray-500 truncate max-w-md">
                          {Object.entries(details).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(' ')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap ml-4">
                      {new Date(evt.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}

          {!events && <div className="text-center py-16 text-gray-500">Loading events...</div>}
          {events && events.length === 0 && <div className="text-center py-16 text-gray-500">No events yet.</div>}
        </div>
      </div>
    </PageTransition>
  )
}

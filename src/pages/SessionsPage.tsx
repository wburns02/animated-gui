import { useCallback } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import GlassCard from '../components/GlassCard'
import { api } from '../api'
import type { Session } from '../api'
import { usePolling } from '../hooks/usePolling'

export default function SessionsPage() {
  const { data: sessions } = usePolling<Session[]>(useCallback(() => api.sessions.list(), []), 3000)

  const running = sessions?.filter(s => s.status === 'running') || []

  return (
    <PageTransition>
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '2rem 2rem', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="flex items-center" style={{ gap: '12px' }}>
          <h1 className="text-2xl font-bold text-white">Live Sessions</h1>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sessions?.map((session, i) => (
            <motion.div
              key={session.pid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <SessionCard session={session} />
            </motion.div>
          ))}

          {!sessions && (
            <div className="text-center text-gray-500" style={{ padding: '64px 0' }}>Loading sessions...</div>
          )}
          {sessions && sessions.length === 0 && (
            <div className="text-center text-gray-500" style={{ padding: '64px 0' }}>
              No Claude sessions detected. Start a Claude session in your terminal to see it here.
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

function SessionCard({ session: s }: { session: Session }) {
  const isRunning = s.status === 'running'
  const glowColor = isRunning ? '#00f5a0' : '#6b7280'

  return (
    <GlassCard glowColor={glowColor} padding="20px">
      <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
        <div className="flex items-center" style={{ gap: '12px' }}>
          <motion.div
            className="rounded-full"
            style={{ width: '10px', height: '10px', backgroundColor: glowColor }}
            animate={isRunning ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <span className="text-sm font-bold text-white">
            {s.session_title || s.tty || `PID ${s.pid}`}
          </span>
          <span className="text-xs text-gray-500 font-mono">{s.tty}</span>
        </div>
        <span
          className={`text-xs rounded-full ${isRunning ? 'bg-neon-green/15 text-neon-green' : 'bg-gray-500/15 text-gray-400'}`}
          style={{ padding: '2px 8px' }}
        >
          {s.status}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 text-xs" style={{ gap: '16px' }}>
        <div>
          <span className="text-gray-500">PID</span>
          <div className="text-white font-mono">{s.pid}</div>
        </div>
        <div>
          <span className="text-gray-500">CPU</span>
          <div className="text-white font-mono">{s.cpu_percent.toFixed(1)}%</div>
        </div>
        <div>
          <span className="text-gray-500">Memory</span>
          <div className="text-white font-mono">{s.mem_mb} MB</div>
        </div>
        <div>
          <span className="text-gray-500">Started</span>
          <div className="text-white">{s.start_time}</div>
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        <span className="text-xs text-gray-500">Working Directory</span>
        <div className="text-sm font-mono text-neon-blue truncate">{s.cwd}</div>
      </div>

      {s.session_slug && (
        <div style={{ marginTop: '8px' }}>
          <span className="text-xs text-gray-500">Session</span>
          <div className="text-sm font-mono text-neon-purple">{s.session_slug}</div>
        </div>
      )}

      {s.command && (
        <div style={{ marginTop: '8px' }}>
          <span className="text-xs text-gray-500">Command</span>
          <div className="text-xs font-mono text-gray-400 truncate">{s.command}</div>
        </div>
      )}
    </GlassCard>
  )
}

import { motion } from 'framer-motion'

const statusConfig: Record<string, { bg: string; text: string; glow: string; pulse?: boolean }> = {
  pending: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', glow: '#eab308' },
  running: { bg: 'bg-blue-500/15', text: 'text-blue-400', glow: '#3b82f6', pulse: true },
  completed: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', glow: '#10b981' },
  failed: { bg: 'bg-red-500/15', text: 'text-red-400', glow: '#ef4444' },
  blocked: { bg: 'bg-orange-500/15', text: 'text-orange-400', glow: '#f97316' },
  killed: { bg: 'bg-gray-500/15', text: 'text-gray-400', glow: '#6b7280' },
}

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending

  return (
    <motion.span
      className={`inline-flex items-center rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
      style={{ gap: '6px', padding: '4px 10px' }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {config.pulse && (
        <span className="relative flex" style={{ height: '8px', width: '8px' }}>
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: config.glow }} />
          <span className="relative inline-flex rounded-full" style={{ height: '8px', width: '8px', backgroundColor: config.glow }} />
        </span>
      )}
      {status}
    </motion.span>
  )
}

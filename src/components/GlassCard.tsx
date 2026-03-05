import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
  padding?: string
}

export default function GlassCard({
  children,
  className = '',
  glowColor = '#8338ec',
  padding,
}: GlassCardProps) {
  const [hovering, setHovering] = useState(false)

  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${className}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-2xl" />

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          boxShadow: hovering
            ? `0 0 30px ${glowColor}33, 0 0 60px ${glowColor}15, inset 0 0 30px ${glowColor}08`
            : `0 0 0px transparent`,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Shimmer line */}
      {hovering && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${glowColor}88, transparent)`,
          }}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      )}

      <div className="relative z-10" style={padding ? { padding } : undefined}>{children}</div>
    </div>
  )
}

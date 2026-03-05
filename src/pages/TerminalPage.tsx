import { useState } from 'react'
import PageTransition from '../components/PageTransition'
import GlassCard from '../components/GlassCard'
import Terminal from '../components/Terminal'

export default function TerminalPage() {
  const [terminals, setTerminals] = useState<number[]>([1])

  return (
    <PageTransition>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 80px)' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Terminal</h1>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <button
              onClick={() => setTerminals(prev => [...prev, Math.max(...prev) + 1])}
              className="text-xs font-medium rounded-full bg-neon-green/10 text-neon-green hover:bg-neon-green/20 border border-neon-green/30 transition-all"
              style={{ padding: '4px 12px' }}
            >
              + New Terminal
            </button>
            <span className="text-xs text-gray-500">{terminals.length} open</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: terminals.length > 1 ? '1fr 1fr' : '1fr', gap: '12px', minHeight: 0 }}>
          {terminals.map((id) => (
            <GlassCard key={id} glowColor="#00f5a0" padding="0">
              <div className="flex items-center justify-between" style={{ padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs text-gray-400 font-mono">bash #{id}</span>
                <button
                  onClick={() => {
                    if (terminals.length > 1) {
                      setTerminals(prev => prev.filter(t => t !== id))
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  style={{ padding: '0 4px' }}
                >
                  x
                </button>
              </div>
              <div style={{ height: 'calc(100% - 32px)' }}>
                <Terminal />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}

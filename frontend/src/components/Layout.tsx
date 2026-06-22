import type { ReactNode } from 'react'
import './Layout.css'

export type LegendItem = { color: string; label: string }

export default function Layout({
  title,
  subtitle,
  legend,
  rightPanel,
  headerRight,
  children,
}: {
  title: string
  subtitle?: string
  legend?: LegendItem[]
  rightPanel?: ReactNode
  headerRight?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="shell">
      <header className="shell_header">
        <div>
          <div className="shell_title">{title}</div>
          {subtitle && <div className="shell_subtitle">{subtitle}</div>}
        </div>

              {headerRight && <div className="shell_headerRight">{headerRight}</div>}
      </header>

      <div className="shell_content">
        <div className="shell_main">{children}</div>
        {rightPanel && <aside className="shell_aside">{rightPanel}</aside>}
      </div>

      <footer className="shell_footer">
        <span>Frontend React/TypeScript • Rendering ricorsivo dell'albero • API generate con Kubb</span>
      </footer>
    </div>
  )
}

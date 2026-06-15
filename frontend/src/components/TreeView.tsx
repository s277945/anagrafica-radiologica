import { useEffect, useState } from 'react'
import { fetchTree } from '../api/client'
import './TreeView.css'

interface Apparecchiatura {
  id: number
  nome: string
  tipologia: string
  numeroDiSerie: string
  dataInstallazione: string
}

interface ContenitoreNode {
  id: number
  nome: string
  sottoContenitori: ContenitoreNode[]
  apparecchiature: Apparecchiatura[]
}

interface OrganizzazioneTree {
  id: number
  nome: string
  contenitori: ContenitoreNode[]
  apparecchiature: Apparecchiatura[]
}

interface Props {
  orgId: string
  refreshKey: number
}

export default function TreeView({ orgId, refreshKey }: Props) {
  const [tree, setTree] = useState<OrganizzazioneTree | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!orgId) return
    setLoading(true)
    setError(null)
    fetchTree(orgId)
      .then(setTree)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [orgId, refreshKey])

  if (loading) return <p className="tree-status">Caricamento...</p>
  if (error) return <p className="tree-error">❌ {error}</p>
  if (!tree) return <p className="tree-status">Inserisci un ID e clicca Carica</p>

  return (
    <div className="tree-container">
      <div className="tree-node tree-org">
        <span className="tree-icon">🏢</span>
        <span className="tree-label">{tree.nome}</span>
        <span className="tree-badge">Organizzazione</span>
      </div>
      <div className="tree-children">
        {tree.contenitori.map(c => <ContenitoreView key={c.id} node={c} depth={1} />)}
        {tree.apparecchiature.map(a => <ApparecchiaturaView key={a.id} app={a} depth={1} />)}
      </div>
    </div>
  )
}

function ContenitoreView({ node, depth }: { node: ContenitoreNode; depth: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.sottoContenitori.length > 0 || node.apparecchiature.length > 0

  return (
    <div className="tree-branch" style={{ marginLeft: `${depth * 20}px` }}>
      <div className="tree-node tree-contenitore" onClick={() => setExpanded(!expanded)}>
        <span className="tree-toggle">{hasChildren ? (expanded ? '▼' : '▶') : '─'}</span>
        <span className="tree-icon">📁</span>
        <span className="tree-label">{node.nome}</span>
        <span className="tree-badge">Contenitore</span>
      </div>
      {expanded && (
        <div className="tree-children">
          {node.sottoContenitori.map(sc => <ContenitoreView key={sc.id} node={sc} depth={depth + 1} />)}
          {node.apparecchiature.map(a => <ApparecchiaturaView key={a.id} app={a} depth={depth + 1} />)}
        </div>
      )}
    </div>
  )
}

function ApparecchiaturaView({ app, depth }: { app: Apparecchiatura; depth: number }) {
  const icons: Record<string, string> = {
    TAC: '🔬', RISONANZA: '🧲', RX: '☢️', MAMMOGRAFO: '🩺', ECOGRAFO: '📡'
  }
  return (
    <div className="tree-node tree-apparecchiatura" style={{ marginLeft: `${depth * 20}px` }}>
      <span className="tree-icon">{icons[app.tipologia] || '⚙️'}</span>
      <span className="tree-label">{app.nome}</span>
      <span className="tree-meta">{app.tipologia} • S/N: {app.numeroDiSerie} • {app.dataInstallazione}</span>
    </div>
  )
}

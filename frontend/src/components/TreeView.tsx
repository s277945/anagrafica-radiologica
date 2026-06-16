import { useEffect, useState } from 'react'
import { fetchTree } from '../api/client'
import './TreeView.css'

// DTO types: when Kubb generated types are present, prefer them.
// (Fallback: structural typing works with local minimal interfaces)
export interface ApparecchiaturaDto {
  id: number
  nome: string
  tipologia: string
  numeroDiSerie: string
  dataInstallazione: string
}

export interface ContenitoreNodeDto {
  id: number
  nome: string
  sottoContenitori: ContenitoreNodeDto[]
  apparecchiature: ApparecchiaturaDto[]
}

export interface OrganizzazioneTreeDto {
  id: number
  nome: string
  contenitori: ContenitoreNodeDto[]
  apparecchiature: ApparecchiaturaDto[]
}

interface Props {
  orgId: string
  refreshKey: number
}

export default function TreeView({ orgId, refreshKey }: Props) {
  const [tree, setTree] = useState<OrganizzazioneTreeDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!orgId) return
    setLoading(true)
    setError(null)
    fetchTree(Number(orgId))
      .then((dto) => setTree(dto as OrganizzazioneTreeDto))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [orgId, refreshKey])

  if (loading) return <p className="tree-status">Caricamento...</p>
  if (error) return <p className="tree-error">Errore: {error}</p>
  if (!tree) return <p className="tree-status">Inserisci un ID e clicca “Carica”.</p>

  return (
    <div className="tree-container">
      <div className="tree-node tree-org">
        <span className="tree-icon">Organizzazione</span>
        <span className="tree-label">{tree.nome}</span>
        <span className="tree-badge">ID {tree.id}</span>
      </div>

      <div className="tree-children">
        {tree.contenitori.map((c) => (
          <ContenitoreView key={c.id} node={c} depth={1} />
        ))}
        {tree.apparecchiature.map((a) => (
          <ApparecchiaturaView key={a.id} app={a} depth={1} />
        ))}
      </div>
    </div>
  )
}

function ContenitoreView({ node, depth }: { node: ContenitoreNodeDto; depth: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.sottoContenitori.length > 0 || node.apparecchiature.length > 0

  return (
    <div className="tree-branch" style={{ marginLeft: `${depth * 16}px` }}>
      <button
        type="button"
        className="tree-node tree-contenitore"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="tree-toggle">{hasChildren ? (expanded ? '▼' : '▶') : '•'}</span>
        <span className="tree-label">{node.nome}</span>
        <span className="tree-badge">Contenitore • ID {node.id}</span>
      </button>

      {expanded && (
        <div className="tree-children">
          {node.sottoContenitori.map((sc) => (
            <ContenitoreView key={sc.id} node={sc} depth={depth + 1} />
          ))}
          {node.apparecchiature.map((a) => (
            <ApparecchiaturaView key={a.id} app={a} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function ApparecchiaturaView({ app, depth }: { app: ApparecchiaturaDto; depth: number }) {
  return (
    <div className="tree-node tree-apparecchiatura" style={{ marginLeft: `${depth * 16}px` }}>
      <span className="tree-label">{app.nome}</span>
      <span className="tree-meta">
        {app.tipologia} • S/N: {app.numeroDiSerie} • Installata: {app.dataInstallazione}
      </span>
    </div>
  )
}

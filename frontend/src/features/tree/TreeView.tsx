import {useEffect, useMemo, useState} from 'react'
import {fetchTree} from '../../api/client'
import {EmptyState, ErrorState, LoadingState, Pill} from '../../components/ui'
import '../../components/TreeView.css'

import type {
    OrganizzazioneTreeDto,
    ContenitoreNodeDto,
    ApparecchiaturaDto,
    TreeStats,
    TreeCounts
} from '../../types/tree'
import {normalizeTree} from "../../utils/ids.ts";


interface Props {
    orgId: string
    refreshKey: number
}


function computeTreeStats(tree: OrganizzazioneTreeDto): TreeStats {
    let containers = 0
    let equipments = tree.apparecchiature.length
    let depth = 1

    const walk = (c: ContenitoreNodeDto, d: number) => {
        containers += 1
        equipments += c.apparecchiature.length
        depth = Math.max(depth, d)
        c.sottoContenitori.forEach((sc) => walk(sc, d + 1))
    }

    tree.contenitori.forEach((c) => walk(c, 2))
    return {containers, equipments, depth}
}

function computeTreeCounts(tree: OrganizzazioneTreeDto): TreeCounts {
    let containers = 0
    let equipments = tree.apparecchiature.length
    const walk = (c: ContenitoreNodeDto) => {
        containers += 1
        equipments += c.apparecchiature.length
        c.sottoContenitori.forEach(walk)
    }
    tree.contenitori.forEach(walk)
    return {orgs: 1, containers, equipments}
}

export default function TreeView({orgId, refreshKey}: Props) {
    const [tree, setTree] = useState<OrganizzazioneTreeDto | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const [showOrg, setShowOrg] = useState(true)
    const [showContainer, setShowContainer] = useState(true)
    const [showEquipment, setShowEquipment] = useState(true)
    const [legendHover, setLegendHover] = useState<null | 'org' | 'container' | 'equipment'>(null)

    useEffect(() => {
        const normalizedOrgId = String(orgId ?? '').trim()

        if (!normalizedOrgId) {
            setTree(null)
            return
        }

        setLoading(true)
        setError(null)

        fetchTree(normalizedOrgId)
            .then((dto: any) => setTree(normalizeTree(dto)))
            .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
            .finally(() => setLoading(false))
    }, [orgId, refreshKey])

    const stats = useMemo(() => (tree ? computeTreeStats(tree) : null), [tree])
    const counts = useMemo(() => (tree ? computeTreeCounts(tree) : null), [tree])

    if (loading) return <LoadingState label="Caricamento albero…"/>
    if (error) return <ErrorState title="Errore durante il caricamento" description={error}/>

    if (!tree) {
        return (
            <EmptyState
                title="Nessun albero da mostrare"
                description="Inserisci un ID organizzazione e premi “Carica”."
            />
        )
    }

    const hasAny =
        tree.contenitori.length > 0 || tree.apparecchiature.length > 0

    if (!hasAny) {
        return (
            <EmptyState
                title="Organizzazione senza elementi"
                description="Non risultano contenitori o apparecchiature associate."
            />
        )
    }

    const getNodeDimClass = (kind: 'org' | 'container' | 'equipment') => {
        const enabledByToggle =
            kind === 'org'
                ? showOrg
                : kind === 'container'
                    ? showContainer
                    : showEquipment

        const dimmedByToggle = !enabledByToggle
        const dimmedByHover = legendHover !== null && legendHover !== kind

        return dimmedByToggle || dimmedByHover ? 'treeItem--dimmed' : ''
    }

    return (
        <div className="tree">
            <div className="tree_toolbar">
                <div className="tree_summary">
                    <Pill tone="info">Org • ID {tree.id}</Pill>
                    {stats && (
                        <>
                            <Pill>{stats.containers} contenitori</Pill>
                            <Pill>{stats.equipments} apparecchiature</Pill>
                            <Pill>{stats.depth} livelli</Pill>
                        </>
                    )}
                </div>

                <div className="tree_actions">
                    <button className="btn btn--ghost" type="button" onClick={() => setCollapsed(true)}>
                        Collassa tutto
                    </button>
                    <button className="btn btn--ghost" type="button" onClick={() => setCollapsed(false)}>
                        Espandi tutto
                    </button>
                </div>
            </div>


            <div className="tree_legend" role="group" aria-label="Filtri legenda">
                <button
                    type="button"
                    className={`legendItem ${showOrg ? 'is-on' : 'is-off'} ${legendHover === 'org' ? 'is-hover' : ''}`}
                    onClick={() => setShowOrg((v) => !v)}
                    onMouseEnter={() => setLegendHover('org')}
                    onMouseLeave={() => setLegendHover(null)}
                    aria-pressed={showOrg}
                >
                    <span className="legendItem_swatch legendItem_swatch--org" aria-hidden="true"/>
                    <span className="legendItem_label">Organizzazione</span>
                </button>

                <button
                    type="button"
                    className={`legendItem ${showContainer ? 'is-on' : 'is-off'} ${legendHover === 'container' ? 'is-hover' : ''}`}
                    onClick={() => setShowContainer((v) => !v)}
                    onMouseEnter={() => setLegendHover('container')}
                    onMouseLeave={() => setLegendHover(null)}
                    aria-pressed={showContainer}
                >
                    <span className="legendItem_swatch legendItem_swatch--container" aria-hidden="true"/>
                    <span className="legendItem_label">Contenitore</span>
                    <span className="legendItem_count">{counts?.containers ?? 0}</span>
                </button>

                <button
                    type="button"
                    className={`legendItem ${showEquipment ? 'is-on' : 'is-off'} ${legendHover === 'equipment' ? 'is-hover' : ''}`}
                    onClick={() => setShowEquipment((v) => !v)}
                    onMouseEnter={() => setLegendHover('equipment')}
                    onMouseLeave={() => setLegendHover(null)}
                    aria-pressed={showEquipment}
                >
                    <span className="legendItem_swatch legendItem_swatch--equipment" aria-hidden="true"/>
                    <span className="legendItem_label">Apparecchiatura</span>
                    <span className="legendItem_count">{counts?.equipments ?? 0}</span>
                </button>
            </div>

            <div className="tree_root">
                <NodeRow
                    kind="org"
                    title={tree.nome}
                    subtitle="Organizzazione"
                    right={<span className="id">ID {tree.id}</span>}
                    className={getNodeDimClass('org')}
                />

                <div className="tree_children">
                    {tree.contenitori.map((c) => (
                        <ContenitoreView key={c.id} node={c} depth={1} collapsed={collapsed}
                                         getNodeDimClass={getNodeDimClass}/>
                    ))}
                    {tree.apparecchiature.map((a) => (
                        <ApparecchiaturaCard key={a.id} app={a} depth={1} dimClass={getNodeDimClass('equipment')}/>
                    ))}
                </div>
            </div>
        </div>
    )
}

function NodeRow({
                     kind,
                     title,
                     subtitle,
                     right,
                     onClick,
                     collapsible,
                     expanded,
                     hasChildren,
                     className,
                 }: {
    kind: 'org' | 'container'
    title: string
    className?: string
    subtitle?: string
    right?: React.ReactNode
    onClick?: () => void
    collapsible?: boolean
    expanded?: boolean
    hasChildren?: boolean
}) {
    return (
        <button
            type="button"
            className={`node node--${kind} ${onClick ? 'node--clickable' : ''} ${className ?? ''}`}
            onClick={onClick}
            aria-expanded={collapsible ? expanded : undefined}
        >
      <span className="node_icon" aria-hidden="true">
        {kind === 'org' ? '🏥' : '🗂️'}
      </span>

            <span className="node_main">
        <span className="node_title">{title}</span>
                {subtitle && <span className="node_subtitle">{subtitle}</span>}
      </span>

            {collapsible && (
                <span className="node_chev" aria-hidden="true">
          {hasChildren ? (expanded ? '▾' : '▸') : '•'}
        </span>
            )}

            {right && <span className="node_right">{right}</span>}
        </button>
    )
}

function ContenitoreView({
     node,
     depth,
     collapsed,
     getNodeDimClass,
 }: {
    node: ContenitoreNodeDto
    depth: number
    collapsed: boolean
    getNodeDimClass: (kind: 'org' | 'container' | 'equipment') => string
}) {
    const [expanded, setExpanded] = useState(true)
    const hasChildren = node.sottoContenitori.length > 0 || node.apparecchiature.length > 0

    useEffect(() => {
        setExpanded(!collapsed)
    }, [collapsed])

    return (
        <div className="branch" style={{['--depth' as never]: depth}}>
            <NodeRow
                kind="container"
                title={node.nome}
                subtitle="Contenitore"
                collapsible
                expanded={expanded}
                hasChildren={hasChildren}
                onClick={() => setExpanded((v) => !v)}
                right={<span className="id">ID {node.id}</span>}
                className={getNodeDimClass('container')}
            />

            {expanded && (
                <div className="branch_children">
                    {node.sottoContenitori.map((sc) => (
                        <ContenitoreView key={sc.id} node={sc} depth={depth + 1} collapsed={collapsed}
                                         getNodeDimClass={getNodeDimClass}/>
                    ))}
                    {node.apparecchiature.map((a) => (
                        <ApparecchiaturaCard key={a.id} app={a} depth={depth + 1}
                                             dimClass={getNodeDimClass('equipment')}/>
                    ))}
                </div>
            )}
        </div>
    )
}

function formatDateISO(d: string) {
    // backend may send ISO date, keep it human friendly without depending on locales.
    // Accepts 'YYYY-MM-DD' or full ISO 'YYYY-MM-DDTHH:mm...'
    if (!d) return '-'
    return d.includes('T') ? d.split('T')[0] : d
}

function tipologiaBadge(t: string): { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' } {
    const key = (t || '').toUpperCase()
    if (key.includes('TAC')) return {label: 'TAC', tone: 'info'}
    if (key.includes('RISON')) return {label: 'Risonanza', tone: 'success'}
    if (key === 'RX' || key.includes('RADIO')) return {label: 'RX', tone: 'warning'}
    return {label: t || 'N/D', tone: 'neutral'}
}

function ApparecchiaturaCard({
                                 app,
                                 depth,
                                 dimClass,
                             }: {
    app: ApparecchiaturaDto
    depth: number
    dimClass?: string
}) {
    const badge = tipologiaBadge(app.tipologia)

    return (
        <div className={`eq ${dimClass ?? ''}`} style={{['--depth' as never]: depth}}>
            <div className="eq_head">
                <div className="eq_title">{app.nome}</div>
                <div className="eq_badges">
                    <Pill tone={badge.tone}>{badge.label}</Pill>
                    <span className="id">ID {app.id}</span>
                </div>
            </div>

            <div className="eq_grid">
                <div className="eq_field">
                    <div className="eq_k">Numero di serie</div>
                    <div className="eq_v">{app.numeroDiSerie || '-'}</div>
                </div>
                <div className="eq_field">
                    <div className="eq_k">Installazione</div>
                    <div className="eq_v">{formatDateISO(app.dataInstallazione)}</div>
                </div>
            </div>
        </div>
    )
}

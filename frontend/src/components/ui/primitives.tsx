import type {ReactNode} from 'react'

export function Pill({children, tone = 'neutral'}: {
    children: ReactNode;
    tone?: 'neutral' | 'info' | 'success' | 'warning'
}) {
    return <span className={`pill pill--${tone}`}>{children}</span>
}

export function EmptyState({
   title,
   description,
   action,
}: {
    title: string
    description?: string
    action?: ReactNode
}) {
    return (
        <div className="state state--empty">
            <div className="state_title">{title}</div>
            {description && <div className="state_desc">{description}</div>}
            {action && <div className="state_action">{action}</div>}
        </div>
    )
}

export function ErrorState({title, description}: { title: string; description?: string }) {
    return (
        <div className="state state--error" role="alert">
            <div className="state_title">{title}</div>
            {description && <div className="state_desc">{description}</div>}
        </div>
    )
}

export function LoadingState({label = 'Caricamento…'}: { label?: string }) {
    return (
        <div className="state state--loading" aria-busy="true" aria-live="polite">
            <div className="spinner" aria-hidden="true"/>
            <div>{label}</div>
        </div>
    )
}

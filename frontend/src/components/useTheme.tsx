import {useEffect, useMemo, useState} from 'react'
import {Pill} from './ui'

export type ThemeMode = 'dark' | 'light'
const STORAGE_KEY = 'ar.theme'

export function ThemeToggle({
    theme,
    onToggle,
}: {
    theme: ThemeMode
    onToggle: () => void
}) {
    return (
        <button className="btn btn--ghost" type="button" onClick={onToggle} aria-label="Cambia tema">
            <Pill tone="neutral">{theme === 'dark' ? 'Tema: scuro' : 'Tema: chiaro'}</Pill>
        </button>
    )
}

function getInitialTheme(): ThemeMode {
    // Prefer persisted choice; fallback to system preference.
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved === 'light' || saved === 'dark') return saved
    } catch {
        // ignore
    }

    const prefersLight =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: light)').matches

    return prefersLight ? 'light' : 'dark'
}

export function useTheme() {
    const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme())

    useEffect(() => {
        const root = document.documentElement
        root.dataset.theme = theme
        try {
            localStorage.setItem(STORAGE_KEY, theme)
        } catch {
            // ignore
        }
    }, [theme])

    const api = useMemo(
        () => ({
            theme,
            setTheme,
            toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
        }),
        [theme],
    )

    return api
}

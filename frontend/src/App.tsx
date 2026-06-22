import { useMemo, useState } from 'react'
import TreeView from './components/TreeView'
import CreateApparecchiatura from './components/CreateApparecchiatura'
import Layout, { type LegendItem } from './components/Layout'
import {ThemeToggle, useTheme} from './components/useTheme'
import './App.css'

export default function App() {
  const { theme, toggle } = useTheme()
  const [orgId, setOrgId] = useState<string>('OR0000000001')
  const [refreshKey, setRefreshKey] = useState(0)

  const normalizedOrgId = useMemo(() => {
    const v = orgId.trim().toUpperCase()
    // Compatibilità: se l'utente inserisce solo cifre, normalizza a OR + padding a 10 cifre (OR0000000001)
    if (/^\d+$/.test(v)) return `OR${v.padStart(10, '0')}`
    // Se manca il prefisso OR ma contiene cifre, prova a normalizzare mantenendo il padding quando possibile
    const m = v.match(/^OR(\d+)$/)
    if (m) return `OR${m[1].padStart(10, '0')}`
    return v
  }, [orgId])


  const legend: LegendItem[] = useMemo(
    () => [
      { color: 'var(--c-org)', label: 'Organizzazione' },
      { color: 'var(--c-container)', label: 'Contenitore' },
      { color: 'var(--c-eq)', label: 'Apparecchiatura' },
    ],
    [],
  )

  return (
    <Layout
      title="Anagrafica Radiologica"
      subtitle="Albero gerarchico: organizzazioni → contenitori → apparecchiature"
      legend={legend}
      headerRight={<ThemeToggle theme={theme} onToggle={toggle} />}
      rightPanel={
        <div className="panel">
          <div className="panel_header">
            <div>
              <div className="panel_title">Controlli</div>
              <div className="panel_hint">Seleziona l'organizzazione e aggiorna l'albero.</div>
            </div>
          </div>

          <div className="panel_body">
            <div className="field">
              <label className="field_label" htmlFor="orgId">
                ID Organizzazione
              </label>
              <div className="field_row">
                <input
                  id="orgId"
                  className="input"
                  autoComplete="off"
                  inputMode="text"
                  type="text"
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value.toUpperCase())}
                  placeholder="Es. OR0000000001"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setRefreshKey((k) => k + 1)
                  }}
                />
                <button className="btn btn--primary" onClick={() => setRefreshKey((k) => k + 1)}>
                  Carica
                </button>
              </div>
              <div className="field_help">
                Tip: usa <span className="kbd">Invio</span> dentro il campo per ricaricare rapidamente.
              </div>
            </div>

            <div className="divider" />

            <CreateApparecchiatura
              defaultOrganizzazioneId={normalizedOrgId}
              onCreated={() => setRefreshKey((k) => k + 1)}
            />
          </div>
        </div>
      }
    >
      <TreeView orgId={normalizedOrgId} refreshKey={refreshKey} />
    </Layout>
  )
}

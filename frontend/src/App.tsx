import { useMemo, useState } from 'react'
import TreeView from './components/TreeView'
import CreateApparecchiatura from './components/CreateApparecchiatura'
import Layout, { type LegendItem } from './components/Layout'
import './App.css'

export default function App() {
  const [orgId, setOrgId] = useState<string>('1')
  const [refreshKey, setRefreshKey] = useState(0)

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
      rightPanel={
        <div className="panel">
          <div className="panel__header">
            <div>
              <div className="panel__title">Controlli</div>
              <div className="panel__hint">Seleziona l'organizzazione e aggiorna l'albero.</div>
            </div>
          </div>

          <div className="panel__body">
            <div className="field">
              <label className="field__label" htmlFor="orgId">
                ID Organizzazione
              </label>
              <div className="field__row">
                <input
                  id="orgId"
                  className="input"
                  inputMode="numeric"
                  type="number"
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  min={1}
                  placeholder="Es. 1"
                />
                <button className="btn btn--primary" onClick={() => setRefreshKey((k) => k + 1)}>
                  Carica
                </button>
              </div>
              <div className="field__help">
                Tip: usa <span className="kbd">Invio</span> dentro il campo per ricaricare rapidamente.
              </div>
            </div>

            <div className="divider" />

            <CreateApparecchiatura
              defaultOrganizzazioneId={orgId}
              onCreated={() => setRefreshKey((k) => k + 1)}
            />
          </div>
        </div>
      }
    >
      <TreeView orgId={orgId} refreshKey={refreshKey} />
    </Layout>
  )
}

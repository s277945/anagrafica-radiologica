import { useState } from 'react'
import TreeView from './components/TreeView'
import CreateApparecchiatura from './components/CreateApparecchiatura'

function App() {
  const [orgId, setOrgId] = useState<string>('1')
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🏥 Anagrafica Radiologica</h1>
        <p>Gestione apparecchiature radiologiche</p>
      </header>

      <main className="app-main">
        <section className="section">
          <h2>Visualizza Albero Organizzazione</h2>
          <div className="input-group">
            <label htmlFor="orgId">ID Organizzazione:</label>
            <input
              id="orgId"
              type="number"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              min="1"
            />
            <button onClick={() => setRefreshKey(k => k + 1)}>Carica</button>
          </div>
          <TreeView orgId={orgId} refreshKey={refreshKey} />
        </section>

        <section className="section">
          <h2>Crea Apparecchiatura</h2>
          <CreateApparecchiatura onCreated={() => setRefreshKey(k => k + 1)} />
        </section>
      </main>
    </div>
  )
}

export default App

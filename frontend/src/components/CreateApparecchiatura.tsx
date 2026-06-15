import { useState } from 'react'
import { createApparecchiatura } from '../api/client'

interface Props {
  onCreated: () => void
}

export default function CreateApparecchiatura({ onCreated }: Props) {
  const [form, setForm] = useState({
    nome: '',
    tipologia: 'TAC',
    numeroDiSerie: '',
    dataInstallazione: '',
    organizzazioneId: '',
    contenitoreId: ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await createApparecchiatura({
        nome: form.nome,
        tipologia: form.tipologia,
        numeroDiSerie: form.numeroDiSerie,
        dataInstallazione: form.dataInstallazione,
        organizzazioneId: parseInt(form.organizzazioneId),
        contenitoreId: form.contenitoreId ? parseInt(form.contenitoreId) : null
      })
      setMessage({ type: 'success', text: 'Apparecchiatura creata con successo!' })
      setForm({ nome: '', tipologia: 'TAC', numeroDiSerie: '', dataInstallazione: '', organizzazioneId: '', contenitoreId: '' })
      onCreated()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Errore sconosciuto'
      setMessage({ type: 'error', text: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="create-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <input placeholder="Nome" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
      <select value={form.tipologia} onChange={e => setForm({...form, tipologia: e.target.value})} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}>
        <option value="TAC">TAC</option>
        <option value="RISONANZA">Risonanza</option>
        <option value="RX">RX</option>
        <option value="MAMMOGRAFO">Mammografo</option>
        <option value="ECOGRAFO">Ecografo</option>
      </select>
      <input placeholder="Numero di Serie" value={form.numeroDiSerie} onChange={e => setForm({...form, numeroDiSerie: e.target.value})} required style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
      <input type="date" value={form.dataInstallazione} onChange={e => setForm({...form, dataInstallazione: e.target.value})} required style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
      <input type="number" placeholder="ID Organizzazione" value={form.organizzazioneId} onChange={e => setForm({...form, organizzazioneId: e.target.value})} required min="1" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
      <input type="number" placeholder="ID Contenitore (opzionale)" value={form.contenitoreId} onChange={e => setForm({...form, contenitoreId: e.target.value})} min="1" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
      <button type="submit" disabled={loading}>{loading ? 'Creazione...' : 'Crea Apparecchiatura'}</button>
      {message && <p style={{ color: message.type === 'success' ? '#2e7d32' : '#d32f2f', background: message.type === 'success' ? '#e8f5e9' : '#ffeaea', padding: '0.5rem', borderRadius: '6px' }}>{message.text}</p>}
    </form>
  )
}

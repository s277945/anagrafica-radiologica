import { normalizeId, type IdPrefix } from '../../utils/ids'
import { useEffect, useState } from 'react'
import { createApparecchiatura } from '../../api/client'
import { type ApparecchiaturaRequestTipologiaEnum, type ApparecchiaturaRequest } from '../../api/generated/types'
import { Pill } from '../../components/ui'
import '../../components/CreateApparecchiatura.css'

interface Props {
  onCreated: () => void
  defaultOrganizzazioneId?: string
}

type Message = { type: 'success' | 'error'; text: string } | null

const TIPI: Array<{ value: ApparecchiaturaRequestTipologiaEnum; label: string }> = [
  { value: 'TAC' as ApparecchiaturaRequestTipologiaEnum, label: 'TAC' },
  { value: 'RMN' as ApparecchiaturaRequestTipologiaEnum, label: 'Risonanza' },
  { value: 'ECOGRAFO' as ApparecchiaturaRequestTipologiaEnum, label: 'Ecografo' },
]


export function isValidPrefixedId(value: unknown, prefix: import('../../utils/ids').IdPrefix): boolean {
  return normalizeId(value, prefix) !== null
}

export default function CreateApparecchiatura({ onCreated, defaultOrganizzazioneId }: Props) {

  const [form, setForm] = useState<ApparecchiaturaRequest>({
    nome: '',
    tipologia: 'TAC' as ApparecchiaturaRequestTipologiaEnum,
    numeroDiSerie: '',
    dataInstallazione: '',
    organizzazioneId: defaultOrganizzazioneId ?? '',
    contenitoreId: null,
  })

  useEffect(() => {
    setForm((f: any) => ({ ...f, organizzazioneId: defaultOrganizzazioneId ?? '' }))
  }, [defaultOrganizzazioneId])

  const [message, setMessage] = useState<Message>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit =
    form.nome.trim().length > 0 &&
    form.numeroDiSerie.trim().length > 0 &&
    !!form.dataInstallazione &&
    isValidPrefixedId(form.organizzazioneId, "OR")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const orgId = normalizeId(form.organizzazioneId, "OR")
      if (!orgId) throw new Error('ID organizzazione non valido. Usa 10 cifre o OR+10 cifre.')

      const containerId = normalizeId(form.contenitoreId, "CO")

      await createApparecchiatura({
        nome: form.nome.trim(),
        tipologia: form.tipologia,
        numeroDiSerie: form.numeroDiSerie.trim(),
        dataInstallazione: form.dataInstallazione,
        organizzazioneId: orgId,
        contenitoreId: containerId,
      })

      setMessage({ type: 'success', text: 'Apparecchiatura creata con successo.' })
      setForm((f: any) => ({
        ...f,
        nome: '',
        tipologia: 'TAC' as ApparecchiaturaRequestTipologiaEnum,
        numeroDiSerie: '',
        dataInstallazione: '',
        contenitoreId: null,
      }))
      onCreated()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Errore sconosciuto'
      setMessage({ type: 'error', text: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create">
      <div className="create_head">
        <div>
          <div className="create_title">Crea apparecchiatura</div>
          <div className="create_hint">Compila i campi e salva. L'albero verrà aggiornato.</div>
        </div>
        <Pill tone="neutral">POST /apparecchiature</Pill>
      </div>

      <form onSubmit={handleSubmit} className="create_form">
        <div className="grid grid--2">
          <div className="field">
            <label className="field_label">Nome</label>
            <input
              className="input"
              placeholder="Es. TAC Siemens Somatom"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label className="field_label">Tipologia</label>
            <select
              className="input"
              value={form.tipologia}
              onChange={(e) => setForm({ ...form, tipologia: e.target.value as ApparecchiaturaRequestTipologiaEnum })}
            >
              {TIPI.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field_label">Numero di serie</label>
            <input
              className="input"
              placeholder="Es. SN-2026-001"
              value={form.numeroDiSerie}
              onChange={(e) => setForm({ ...form, numeroDiSerie: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label className="field_label">Data installazione</label>
            <input
              className="input"
              type="date"
              value={form.dataInstallazione}
              onChange={(e) => setForm({ ...form, dataInstallazione: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label className="field_label">ID organizzazione</label>
            <input
              className="input"
              type="text"
              value={form.organizzazioneId ?? ''}
              onChange={(e) => setForm({ ...form, organizzazioneId: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label className="field_label">ID contenitore (opzionale)</label>
            <input
              className="input"
              type="text"
              value={form.contenitoreId ?? ''}
              onChange={(e) =>
                setForm({ ...form, contenitoreId: e.target.value === '' ? null : e.target.value })
              }
              placeholder="Es. 10"
            />
            <div className="field_help">Se omesso, l'apparecchiatura verrà associata direttamente all'organizzazione.</div>
          </div>
        </div>

        <div className="create_actions">
          <button className="btn btn--primary" type="submit" disabled={loading || !canSubmit}>
            {loading ? 'Creazione…' : 'Crea'}
          </button>
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => {
              setMessage(null)
              setForm((f: any) => ({
                ...f,
                nome: '',
                tipologia: 'TAC' as ApparecchiaturaRequestTipologiaEnum,
                numeroDiSerie: '',
                dataInstallazione: '',
                contenitoreId: null,
              }))
            }}
          >
            Reset
          </button>
        </div>

        {message && (
          <div className={`toast toast--${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  )
}

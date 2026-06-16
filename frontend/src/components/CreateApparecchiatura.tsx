import { useEffect, useMemo, useState } from 'react'
import { createApparecchiatura } from '../api/client'
import {
  ApparecchiaturaRequestTipologiaEnum,
  type ApparecchiaturaRequest,
  apparecchiaturaRequestTipologiaEnum
} from '../api/generated/types'
import { Pill } from './ui'
import './CreateApparecchiatura.css'

interface Props {
  onCreated: () => void
  defaultOrganizzazioneId?: string | number
}

type Message = { type: 'success' | 'error'; text: string } | null


const TIPI: Array<{ value: ApparecchiaturaRequestTipologiaEnum; label: string }> = [
  { value: apparecchiaturaRequestTipologiaEnum.TAC, label: 'TAC' },
  { value: apparecchiaturaRequestTipologiaEnum.RISONANZA, label: 'Risonanza' },
  { value: apparecchiaturaRequestTipologiaEnum.RX, label: 'RX' },
  { value: apparecchiaturaRequestTipologiaEnum.MAMMOGRAFO, label: 'Mammografo' },
  { value: apparecchiaturaRequestTipologiaEnum.ECOGRAFO, label: 'Ecografo' },
]

function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'number' ? v : Number(String(v))
  return Number.isFinite(n) && n > 0 ? n : null
}

export default function CreateApparecchiatura({ onCreated, defaultOrganizzazioneId }: Props) {
  const defaultOrgId = useMemo(() => toNumberOrNull(defaultOrganizzazioneId) ?? 0, [defaultOrganizzazioneId])

  const [form, setForm] = useState<ApparecchiaturaRequest>({
    nome: '',
    tipologia: apparecchiaturaRequestTipologiaEnum.TAC,
    numeroDiSerie: '',
    dataInstallazione: '',
    organizzazioneId: defaultOrgId,
    contenitoreId: null,
  })

  useEffect(() => {
    setForm((f) => ({ ...f, organizzazioneId: defaultOrgId }))
  }, [defaultOrgId])

  const [message, setMessage] = useState<Message>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit =
    form.nome.trim().length > 0 &&
    form.numeroDiSerie.trim().length > 0 &&
    !!form.dataInstallazione &&
    (typeof form.organizzazioneId === 'number' ? form.organizzazioneId > 0 : Number(form.organizzazioneId) > 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const orgId = toNumberOrNull(form.organizzazioneId)
      if (!orgId) throw new Error('ID organizzazione non valido.')

      const containerId = toNumberOrNull(form.contenitoreId)

      await createApparecchiatura({
        nome: form.nome.trim(),
        tipologia: form.tipologia,
        numeroDiSerie: form.numeroDiSerie.trim(),
        dataInstallazione: form.dataInstallazione,
        organizzazioneId: orgId,
        contenitoreId: containerId,
      })

      setMessage({ type: 'success', text: 'Apparecchiatura creata con successo.' })
      setForm((f) => ({
        ...f,
        nome: '',
        tipologia: apparecchiaturaRequestTipologiaEnum.TAC,
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
      <div className="create__head">
        <div>
          <div className="create__title">Crea apparecchiatura</div>
          <div className="create__hint">Compila i campi e salva. L'albero verrà aggiornato.</div>
        </div>
        <Pill tone="neutral">POST /apparecchiature</Pill>
      </div>

      <form onSubmit={handleSubmit} className="create__form">
        <div className="grid grid--2">
          <div className="field">
            <label className="field__label">Nome</label>
            <input
              className="input"
              placeholder="Es. TAC Siemens Somatom"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label className="field__label">Tipologia</label>
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
            <label className="field__label">Numero di serie</label>
            <input
              className="input"
              placeholder="Es. SN-2026-001"
              value={form.numeroDiSerie}
              onChange={(e) => setForm({ ...form, numeroDiSerie: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label className="field__label">Data installazione</label>
            <input
              className="input"
              type="date"
              value={form.dataInstallazione}
              onChange={(e) => setForm({ ...form, dataInstallazione: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label className="field__label">ID organizzazione</label>
            <input
              className="input"
              type="number"
              min={1}
              value={form.organizzazioneId ?? 0}
              onChange={(e) => setForm({ ...form, organizzazioneId: Number(e.target.value) })}
              required
            />
          </div>

          <div className="field">
            <label className="field__label">ID contenitore (opzionale)</label>
            <input
              className="input"
              type="number"
              min={1}
              value={form.contenitoreId ?? ''}
              onChange={(e) =>
                setForm({ ...form, contenitoreId: e.target.value === '' ? null : Number(e.target.value) })
              }
              placeholder="Es. 10"
            />
            <div className="field__help">Se omesso, l'apparecchiatura verrà associata direttamente all'organizzazione.</div>
          </div>
        </div>

        <div className="create__actions">
          <button className="btn btn--primary" type="submit" disabled={loading || !canSubmit}>
            {loading ? 'Creazione…' : 'Crea'}
          </button>
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => {
              setMessage(null)
              setForm((f) => ({
                ...f,
                nome: '',
                tipologia: apparecchiaturaRequestTipologiaEnum.TAC,
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

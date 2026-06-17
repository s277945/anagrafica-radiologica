import { useEffect, useState } from 'react'
import { createApparecchiatura } from '../api/client'
import { type ApparecchiaturaRequestTipologiaEnum, type ApparecchiaturaRequest } from '../api/generated/types'
import { Pill } from './ui'
import './CreateApparecchiatura.css'

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


type IdPrefix = 'OR' | 'CO'

/**
 * Normalizza un identificativo accettando input "libero" numerico (solo cifre)
 * oppure già prefissato (es. OR0000000001 / CO0000000001).
 *
 * Ritorna: "<PREFIX><10 cifre>" oppure null se non valido.
 */
export function normalizeId(value: unknown, prefix: IdPrefix): string | null {
  if (value === null || value === undefined) return null
  const raw = String(value).trim().toUpperCase()
  if (!raw) return null

  const digitsOnly = raw.replace(/\s+/g, '')
  const prefixedRe = new RegExp(`^${prefix}[0-9]{10}$`)
  if (prefixedRe.test(digitsOnly)) return digitsOnly

  const onlyDigitsRe = /^[0-9]{1,10}$/
  if (onlyDigitsRe.test(digitsOnly)) {
    const padded = digitsOnly.padStart(10, '0')
    return `${prefix}${padded}`
  }

  return null
}

export function isValidPrefixedId(value: unknown, prefix: IdPrefix): boolean {
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
    setForm((f) => ({ ...f, organizzazioneId: defaultOrganizzazioneId ?? '' }))
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
      setForm((f) => ({
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
              type="text"
              value={form.organizzazioneId ?? ''}
              onChange={(e) => setForm({ ...form, organizzazioneId: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label className="field__label">ID contenitore (opzionale)</label>
            <input
              className="input"
              type="text"
              value={form.contenitoreId ?? ''}
              onChange={(e) =>
                setForm({ ...form, contenitoreId: e.target.value === '' ? null : e.target.value })
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

import { normalizeId } from '../../utils/ids'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createApparecchiatura } from '../../api/client'
import { queryKeys } from '../../api/queryKeys'
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
  const queryClient = useQueryClient()

  const [form, setForm] = useState<ApparecchiaturaRequest>({
    nome: '',
    tipologia: 'TAC' as ApparecchiaturaRequestTipologiaEnum,
    numeroDiSerie: '',
    dataInstallazione: '',
    organizzazioneId: defaultOrganizzazioneId ?? '',
    contenitoreId: null,
  })

  useEffect(() => {
    // Keep organizzazioneId in sync when user changes the loaded organization in the UI.
    setForm((f: any) => ({ ...f, organizzazioneId: defaultOrganizzazioneId ?? '' }))
  }, [defaultOrganizzazioneId])

  const [message, setMessage] = useState<Message>(null)

  const mutation = useMutation({
    mutationFn: async (payload: ApparecchiaturaRequest) => createApparecchiatura(payload),
    onSuccess: async (_data, variables) => {
      setMessage({ type: 'success', text: 'Apparecchiatura creata con successo.' })

      // Clear non-context fields, keep org prefilled.
      setForm((f: any) => ({
        ...f,
        nome: '',
        tipologia: 'TAC' as ApparecchiaturaRequestTipologiaEnum,
        numeroDiSerie: '',
        dataInstallazione: '',
        contenitoreId: null,
      }))

      // Invalidate tree for the target organization so the TreeView updates automatically.
      const orgId = String(variables.organizzazioneId ?? '').trim()
      if (orgId) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.organizzazioneTree(orgId) })
      }

      onCreated()
    },
    onError: (err: unknown) => {
      const errorMsg = err instanceof Error ? err.message : 'Errore sconosciuto'
      setMessage({ type: 'error', text: errorMsg })
    },
  })

  const canSubmit =
    form.nome.trim().length > 0 &&
    form.numeroDiSerie.trim().length > 0 &&
    !!form.dataInstallazione &&
    isValidPrefixedId(form.organizzazioneId, 'OR') &&
    !mutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    const orgId = normalizeId(form.organizzazioneId, 'OR')
    if (!orgId) {
      setMessage({ type: 'error', text: 'ID organizzazione non valido. Usa 10 cifre o OR+10 cifre.' })
      return
    }

    const containerId = normalizeId(form.contenitoreId, 'CO')

    // Server payload should always be normalized (IDs).
    mutation.mutate({
      nome: form.nome.trim(),
      tipologia: form.tipologia,
      numeroDiSerie: form.numeroDiSerie.trim(),
      dataInstallazione: form.dataInstallazione,
      organizzazioneId: orgId,
      contenitoreId: containerId,
    })
  }

  return (
    <div className="create">
      <div className="create_head">
        <div>
          <div className="create_title">Crea apparecchiatura</div>
          <div className="create_hint">Compila i campi e salva. L&apos;albero verrà aggiornato automaticamente.</div>
        </div>
        <Pill tone="muted">POST /apparecchiature</Pill>
      </div>

      <form className="create_form" onSubmit={handleSubmit}>
        
        <div className="create_grid"><label className="field">
          <span className="field_label">Nome</span>
          <input
            className="input"
            value={form.nome}
            onChange={(e) => setForm((f: any) => ({ ...f, nome: e.target.value }))}
            placeholder="es. TAC Sala 2"
          />
        </label>

        <label className="field">
          <span className="field_label">Tipologia</span>
          <select
            className="select"
            value={form.tipologia as any}
            onChange={(e) => setForm((f: any) => ({ ...f, tipologia: e.target.value as any }))}
          >
            {TIPI.map((t) => (
              <option key={t.value} value={t.value as any}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field_label">Numero di serie</span>
          <input
            className="input"
            value={form.numeroDiSerie}
            onChange={(e) => setForm((f: any) => ({ ...f, numeroDiSerie: e.target.value }))}
            placeholder="es. SN-12345"
          />
        </label>

        <label className="field">
          <span className="field_label">Data installazione</span>
          <input
            className="input"
            type="date"
            value={form.dataInstallazione}
            onChange={(e) => setForm((f: any) => ({ ...f, dataInstallazione: e.target.value }))}
          />
        </label>

        <label className="field">
          <span className="field_label">ID organizzazione</span>
          <input
            className="input"
            value={String(form.organizzazioneId ?? '')}
            onChange={(e) => setForm((f: any) => ({ ...f, organizzazioneId: e.target.value }))}
            placeholder="OR0000000000 oppure 0000000000"
          />
        </label>

        <label className="field">
          <span className="field_label">ID contenitore (opzionale)</span>
          <input
            className="input"
            value={String(form.contenitoreId ?? '')}
            onChange={(e) => setForm((f: any) => ({ ...f, contenitoreId: e.target.value || null }))}
            placeholder="CO0000000000 oppure 0000000000"
          />
        </label>
        </div>

        <div className="create_actions">
          <button className="btn" type="submit" disabled={!canSubmit}>
            {mutation.isPending ? 'Salvataggio…' : 'Crea'}
          </button>
        </div>

        {message && (
          <div className={`create_message create_message--${message.type}`} role="status">
            {message.text}
          </div>
        )}
      </form>
    </div>
  )
}

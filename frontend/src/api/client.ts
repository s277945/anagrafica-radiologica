const BASE_URL = '/anagrafica/api'

function getAuthHeader(): string {
  return 'Basic ' + btoa('admin:admin')
}

export async function fetchTree(orgId: string) {
  const res = await fetch(`${BASE_URL}/organizzazioni/${orgId}/tree`, {
    headers: { 'Authorization': getAuthHeader() }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.message || `Errore ${res.status}`)
  }
  return res.json()
}

export interface CreateApparecchiaturaPayload {
  nome: string
  tipologia: string
  numeroDiSerie: string
  dataInstallazione: string
  organizzazioneId: number
  contenitoreId?: number | null
}

export async function createApparecchiatura(payload: CreateApparecchiaturaPayload) {
  const res = await fetch(`${BASE_URL}/apparecchiature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader()
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.message || `Errore ${res.status}`)
  }
  return res.json()
}

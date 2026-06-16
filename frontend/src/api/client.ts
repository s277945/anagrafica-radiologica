/**
 * Client API facade - usa il codice generato da Kubb.
 *
 * Importante: NON passare oggetti { pathParams/body/headers }.
 * Le funzioni Kubb generate espongono firme "flat" (es. (orgId: number), (payload: DTO)).
 * Gli header globali vengono gestiti centralmente dal fetcher custom (src/api/fetcher.ts).
 */
import {
  createApparecchiatura as createApparecchiaturaGenerated,
  getOrganizzazioneTree as getOrganizzazioneTreeGenerated,
  type ApparecchiaturaRequest,
} from './generated'

/** Carica l'albero dell'organizzazione per orgId. */
export async function fetchTree(orgId: number) {
  return getOrganizzazioneTreeGenerated(orgId)
}

/** Crea una nuova apparecchiatura. */
export async function createApparecchiatura(payload: ApparecchiaturaRequest) {
  return createApparecchiaturaGenerated(payload)
}

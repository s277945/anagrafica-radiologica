import type { ContenitoreNodeDto, OrganizzazioneTreeDto } from '../types/tree'

function normalizeApparecchiatura(input: unknown) {
  const a = (input ?? {}) as any
  return {
    id: String(a.id ?? ''),
    nome: String(a.nome ?? ''),
    tipologia: String(a.tipologia ?? ''),
    numeroDiSerie: String(a.numeroDiSerie ?? ''),
    dataInstallazione: String(a.dataInstallazione ?? ''),
  }
}

function normalizeContenitore(input: unknown): ContenitoreNodeDto {
  const c = (input ?? {}) as any
  return {
    id: String(c.id ?? ''),
    nome: String(c.nome ?? ''),
    sottoContenitori: Array.isArray(c.sottoContenitori) ? c.sottoContenitori.map(normalizeContenitore) : [],
    apparecchiature: Array.isArray(c.apparecchiature) ? c.apparecchiature.map(normalizeApparecchiatura) : [],
  }
}

/**
 * Normalizza la risposta "getOrganizzazioneTree" in un DTO sempre consistente:
 * - stringhe sempre definite
 * - array sempre presenti
 */
export function normalizeTree(input: unknown): OrganizzazioneTreeDto {
  const o = (input ?? {}) as any
  return {
    id: String(o.id ?? ''),
    nome: String(o.nome ?? ''),
    contenitori: Array.isArray(o.contenitori) ? o.contenitori.map(normalizeContenitore) : [],
    apparecchiature: Array.isArray(o.apparecchiature) ? o.apparecchiature.map(normalizeApparecchiatura) : [],
  }
}

export type IdPrefix = 'OR' | 'CO'

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

  // solo cifre -> prefisso + padding a 10 cifre
  if (/^\d+$/.test(raw)) return `${prefix}${raw.padStart(10, '0')}`

  // già prefissato
  const m = raw.match(new RegExp(`^${prefix}(\\d+)$`))
  if (m) return `${prefix}${m[1].padStart(10, '0')}`

  return null
}

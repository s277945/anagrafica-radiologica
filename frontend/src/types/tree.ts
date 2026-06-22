/**
 * Tipi frontend per l'albero organizzazione/contenitori/apparecchiature.
 *
 * Nota: i tipi generati da Kubb esistono già (src/api/generated/types),
 * ma in UI spesso conviene usare DTO "tolleranti" e normalizzati perché:
 * - l'API può restituire campi null/undefined
 * - vogliamo gestire graceful fallback senza rompere il rendering
 */
export interface ApparecchiaturaDto {
  id: string
  nome: string
  tipologia: string
  numeroDiSerie: string
  dataInstallazione: string
}

export interface ContenitoreNodeDto {
  id: string
  nome: string
  sottoContenitori: ContenitoreNodeDto[]
  apparecchiature: ApparecchiaturaDto[]
}

export interface OrganizzazioneTreeDto {
  id: string
  nome: string
  contenitori: ContenitoreNodeDto[]
  apparecchiature: ApparecchiaturaDto[]
}

export type TreeStats = { containers: number; equipments: number; depth: number }
export type TreeCounts = { orgs: number; containers: number; equipments: number }

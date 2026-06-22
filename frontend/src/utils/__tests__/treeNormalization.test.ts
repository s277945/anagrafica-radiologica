import { describe, expect, it } from 'vitest'
import { normalizeTree } from '../ids'

describe('normalizeTree', () => {
  it('normalizes nested ids for org, container and equipment', () => {
    const input = {
      id: '1234567890',
      nome: 'Org',
      contenitori: [
        {
          id: '1',
          nome: 'C1',
          sottoContenitori: [],
          apparecchiature: [{ id: '2', nome: 'Eq', tipologia: 'TAC', numeroDiSerie: 'SN', dataInstallazione: '2020-01-01' }],
        },
      ],
      apparecchiature: [],
    }

    const out = normalizeTree(input as any)
    expect(out.id).toBe('OR1234567890')
    expect(out.contenitori[0].id).toBe('CO0000000001')
    expect(out.contenitori[0].apparecchiature[0].id).toBe('AP0000000002')
  })
})

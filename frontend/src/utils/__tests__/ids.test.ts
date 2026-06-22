import { describe, expect, it } from 'vitest'
import { normalizeId } from '../ids'

describe('normalizeId', () => {
  it('accepts 10 digits and prefixes it', () => {
    expect(normalizeId('0123456789', 'OR')).toBe('OR0123456789')
  })

  it('accepts already prefixed id (case-insensitive)', () => {
    expect(normalizeId('or0123456789', 'OR')).toBe('OR0123456789')
  })

  it('trims whitespace', () => {
    expect(normalizeId('  0123456789  ', 'CO')).toBe('CO0123456789')
  })

  it('returns null for invalid id', () => {
    expect(normalizeId('ABC', 'OR')).toBeNull()
    expect(normalizeId('', 'OR')).toBeNull()
  })
})

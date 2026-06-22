import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TreeView from '../tree/TreeView'

// Mock API layer used by the feature
vi.mock('../../api/client', () => ({
  fetchTree: vi.fn(),
}))

import { fetchTree } from '../../api/client'

function renderWithQuery(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('TreeView', () => {
  it('renders loading state', () => {
    ;(fetchTree as any).mockReturnValue(new Promise(() => {}))
    renderWithQuery(<TreeView orgId="0123456789" refreshKey={0} />)
    expect(screen.getByText(/Caricamento albero/i)).toBeInTheDocument()
  })

  it('renders error state', async () => {
    ;(fetchTree as any).mockRejectedValueOnce(new Error('Boom'))
    renderWithQuery(<TreeView orgId="0123456789" refreshKey={0} />)
    expect(await screen.findByText(/Errore durante il caricamento/i)).toBeInTheDocument()
    expect(await screen.findByText(/Boom/)).toBeInTheDocument()
  })


  it('uses icons in legend and avoids dot indicators for org/container nodes', async () => {
    ;(fetchTree as any).mockResolvedValueOnce({
      id: '0123456789',
      nome: 'Org',
      contenitori: [{ id: '1', nome: 'C1', sottoContenitori: [], apparecchiature: [] }],
      apparecchiature: [
        { id: '2', nome: 'Eq', tipologia: 'TAC', numeroDiSerie: 'SN', dataInstallazione: '2020-01-01' },
      ],
    })

    const { container } = renderWithQuery(<TreeView orgId="0123456789" refreshKey={0} />)

    await screen.findByText('Org')

    // Legend: icons are rendered (emoji)
    expect(screen.getByText('🏥')).toBeInTheDocument()
    expect(screen.getByText('🗂️')).toBeInTheDocument()
    expect(screen.getByText('⚙️')).toBeInTheDocument()

    // Org/Container nodes should not have dot indicator elements anymore.
    // Equipment dot removed too (uses icon).
    expect(container.querySelectorAll('.node_dot').length).toBe(0)
  })

  it('renders tree data (org + container + equipment)', async () => {
    ;(fetchTree as any).mockResolvedValueOnce({
      id: '0123456789',
      nome: 'Org',
      contenitori: [
        { id: '1', nome: 'C1', sottoContenitori: [], apparecchiature: [] },
      ],
      apparecchiature: [
        { id: '2', nome: 'Eq', tipologia: 'TAC', numeroDiSerie: 'SN', dataInstallazione: '2020-01-01' },
      ],
    })

    renderWithQuery(<TreeView orgId="0123456789" refreshKey={0} />)

    expect(await screen.findByText('Org')).toBeInTheDocument()
    expect(screen.getByText('C1')).toBeInTheDocument()
    expect(screen.getByText('Eq')).toBeInTheDocument()
  })
})

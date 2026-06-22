import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../../App'

vi.mock('../../api/client', () => ({
  fetchTree: vi.fn(),
  createApparecchiatura: vi.fn(),
}))

import { fetchTree } from '../../api/client'

function renderApp() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <App />
    </QueryClientProvider>,
  )
}

describe('App / TreeView fetch behavior', () => {
  beforeEach(() => {
    ;(fetchTree as any).mockReset()
  })

  it('does not fetch while typing organization id; fetch happens only after explicit load', async () => {
    const user = userEvent.setup()

    ;(fetchTree as any).mockResolvedValue({
      id: 'OR0000000001',
      nome: 'Org',
      contenitori: [],
      apparecchiature: [],
    })

    renderApp()

    const input = screen.getByLabelText('ID Organizzazione', { exact: true })

    // Initial render triggers one fetch for default committed org
    expect(fetchTree).toHaveBeenCalledTimes(1)

    // typing should NOT trigger additional fetches
    await user.clear(input)
    await user.type(input, 'OR0000000002')
    expect(fetchTree).toHaveBeenCalledTimes(1)

    // explicit load triggers fetch
    await user.click(screen.getByRole('button', { name: /Carica/i }))
    expect(fetchTree).toHaveBeenCalledTimes(2)
    expect(fetchTree).toHaveBeenLastCalledWith('OR0000000002')
  })
})

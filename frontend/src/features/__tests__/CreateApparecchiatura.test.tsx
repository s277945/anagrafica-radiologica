import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CreateApparecchiatura from '../apparecchiatura/CreateApparecchiatura'

vi.mock('../../api/client', () => ({
  createApparecchiatura: vi.fn(),
}))

import { createApparecchiatura } from '../../api/client'

function renderWithQuery(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('CreateApparecchiatura', () => {
  it('submits the form and calls mutation with normalized ids', async () => {
    ;(createApparecchiatura as any).mockResolvedValueOnce({})

    const onCreated = vi.fn()
    renderWithQuery(<CreateApparecchiatura onCreated={onCreated} defaultOrganizzazioneId="0123456789" />)

    await userEvent.type(screen.getByLabelText(/Nome/i), 'TAC Sala 2')
    await userEvent.type(screen.getByLabelText(/Numero di serie/i), 'SN-123')
    await userEvent.type(screen.getByLabelText(/Data installazione/i), '2020-01-01')
    await userEvent.clear(screen.getByLabelText(/ID contenitore/i))
    await userEvent.type(screen.getByLabelText(/ID contenitore/i), '1')

    await userEvent.click(screen.getByRole('button', { name: /Crea/i }))

    // Wait for success message
    expect(await screen.findByText(/Apparecchiatura creata/i)).toBeInTheDocument()

    expect(createApparecchiatura).toHaveBeenCalledWith(
      expect.objectContaining({
        organizzazioneId: 'OR0123456789',
        contenitoreId: 'CO0000000001',
      }),
    )
    expect(onCreated).toHaveBeenCalled()
  })
})

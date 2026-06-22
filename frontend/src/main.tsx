import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.scss'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Single QueryClient instance for the whole app.
 * - Centralizes caching, request de-duplication and background refetches.
 * - Makes server-state explicit and testable (via React Query DevTools if added later).
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep previous data while refetching (less UI flicker on refresh/invalidation).
      staleTime: 10_000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)

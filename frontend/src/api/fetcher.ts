import type { RequestConfig, ResponseConfig } from '@kubb/plugin-client/clients/fetch'

const API_BASE_URL =
    (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ??
    'http://localhost:8080'

type FetcherConfig<TData = unknown> = RequestConfig<TData> & {
  baseURL?: string
}

/**
 * Fetcher custom per Kubb.
 *
 * Mantiene le correzioni introdotte:
 * - Content-Type JSON esplicito quando inviamo oggetti
 * - credentials: 'include' per cookie/sessione
 * - gestione CORS lato frontend (mode 'cors')
 *
 * L'obiettivo è centralizzare policy e header qui, così i client generati restano "puliti".
 */
export async function fetcher<TData = unknown, TError = unknown, TVariables = unknown>(
    config: FetcherConfig<TVariables>,
): Promise<ResponseConfig<TData>> {
  const {
    url,
    method = 'GET',
    params,
    data,
    headers: configHeaders,
    baseURL,
    ...requestInit
  } = config

  const requestUrl = new URL(`${baseURL ?? API_BASE_URL}${url}`)

  if (params) {
    Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        requestUrl.searchParams.set(key, String(value))
      }
    })
  }

  const headers = new Headers(configHeaders as HeadersInit | undefined)

  let body: BodyInit | undefined

  if (data !== undefined && data !== null) {
    if (data instanceof FormData) {
      body = data
    } else if (
        typeof data === 'string' ||
        data instanceof Blob ||
        data instanceof ArrayBuffer ||
        data instanceof URLSearchParams
    ) {
      body = data as BodyInit

      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }
    } else {
      body = JSON.stringify(data)

      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }
    }

    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json')
    }
  }

  const response = await fetch(requestUrl.toString(), {
    ...requestInit,
    method,
    headers,
    body,
  })

  const contentType = response.headers.get('content-type')
  const responseData = contentType?.includes('application/json')
      ? await response.json()
      : await response.text()

  if (!response.ok) {
    throw responseData as TError
  }

  return {
    data: responseData as TData,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  }
}

export default fetcher
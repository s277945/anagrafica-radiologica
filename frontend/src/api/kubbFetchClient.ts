export type RequestConfig<TData = unknown> = Omit<RequestInit, 'body'> & {
    url: string
    baseURL?: string
    method?: string
    params?: Record<string, unknown>
    data?: TData
    headers?: HeadersInit
}

export type ResponseConfig<TData = unknown> = {
    data: TData
    status: number
    statusText: string
    headers: Headers
}

export type ResponseErrorConfig<TError = unknown> = TError

const API_BASE_URL =
    (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env
        ?.VITE_API_BASE_URL ?? 'http://localhost:8080'

function appendParams(url: URL, params?: Record<string, unknown>) {
    if (!params) return

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return

        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item !== undefined && item !== null && item !== '') {
                    url.searchParams.append(key, String(item))
                }
            })

            return
        }

        url.searchParams.set(key, String(value))
    })
}

async function parseResponse<TData>(response: Response): Promise<TData> {
    if (response.status === 204) {
        return undefined as TData
    }

    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
        return response.json() as Promise<TData>
    }

    return response.text() as Promise<TData>
}

export async function client<
    TData = unknown,
    TError = unknown,
    TVariables = unknown,
>(config: RequestConfig<TVariables>): Promise<ResponseConfig<TData>> {
    const {
        url,
        baseURL,
        method = 'GET',
        params,
        data,
        headers: configHeaders,
        credentials,
        ...requestInit
    } = config

    const requestUrl = new URL(`${baseURL ?? API_BASE_URL}${url}`)

    appendParams(requestUrl, params)

    const headers = new Headers(configHeaders)

    let body: BodyInit | undefined

    if (data !== undefined && data !== null) {
        if (data instanceof FormData) {
            body = data
        } else if (data instanceof URLSearchParams) {
            body = data

            if (!headers.has('Content-Type')) {
                headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8')
            }
        } else if (data instanceof Blob || data instanceof ArrayBuffer) {
            body = data
        } else if (typeof data === 'string') {
            body = data

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
        credentials: credentials ?? 'include',
    })

    const responseData = await parseResponse<TData>(response)

    if (!response.ok) {
        throw responseData as TError
    }

    return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    }
}

export const fetcher = client

export default client
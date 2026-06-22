import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginClient } from '@kubb/plugin-client'

export default defineConfig({
  root: __dirname,
  input: {
    // Spec OpenAPI mantenuta nel backend (copiata nel frontend via script o referenziata via path relativo)
    path: '../src/main/resources/openapi/api.yaml',
  },
  output: {
    path: './src/api/generated',
    clean: true,
  },
  plugins: [
    pluginOas(),
    pluginTs(),
    pluginClient({
      // @ts-ignore
      fetcher: { path: './src/api/fetcher.ts', exportName: 'fetcher' },
      client: 'fetch',
      baseURL: '/anagrafica', // backend context-path; gli endpoint in spec partono da /api/...
    }),
  ],
})

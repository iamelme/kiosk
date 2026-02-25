import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './assets/styles.css?assets'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Router from './app/router'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  </StrictMode>
)

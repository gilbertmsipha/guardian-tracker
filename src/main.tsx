// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, persister } from './lib/queryClient'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PersistQueryClientProvider 
      client={queryClient} 
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        dehydrateOptions: {
          shouldDehydrateMutation: (mutation) => {
            // Persist PAUSED mutations (e.g. offline ones)
            return mutation.state.isPaused;
          },
          shouldDehydrateQuery: (query) => {
            // Persist SUCCESSFUL queries
            return query.state.status === 'success';
          },
        },
      }}
      onSuccess={() => {
        // Resume mutations after hydration is complete
        queryClient.resumePausedMutations()
      }}
    >
      <App />
    </PersistQueryClientProvider>
  </React.StrictMode>,
)

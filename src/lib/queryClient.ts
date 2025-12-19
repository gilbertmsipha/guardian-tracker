// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// 1. Create the client with aggressive caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // Keep unused data in memory for 24 hours
      staleTime: 1000 * 60 * 5,    // Data is considered "fresh" for 5 minutes (adjust as needed)
    },
  },
});

// 2. Create the persister (tells it WHERE to save data)
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});

// 3. Activate persistence
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
});
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Import API functions for offline mutation resumption
import { createBucket, updateBucket, deleteBucket } from '@/api/buckets';
import { addTransaction, updateTransaction, deleteTransaction, transferFunds } from '@/api/transactions';
import { createSubscription, updateSubscription, deleteSubscription } from '@/api/subscriptions';
import type { Database } from '@/supabase/database-types';

// Types for updates
type BucketUpdate = Database['public']['Tables']['buckets']['Update'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];
type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

// 1. Create the client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5,    // 5 minutes
      // Retry queries if network fails
      retry: (failureCount, error) => {
        // Don't retry on 404s
        if ((error as any).status === 404) return false;
        return failureCount < 3;
      },
    },
    mutations: {
       // Retry mutations if network is offline
       retry: 3, 
    }
  },
});

// 2. Register Default Mutation Functions
// This allows the app to resume paused mutations after a reload because
// it knows which function to run for each key.
queryClient.setMutationDefaults(['createBucket'], {
  mutationFn: createBucket,
});
queryClient.setMutationDefaults(['updateBucket'], {
  mutationFn: ({ id, updates }: { id: string; updates: BucketUpdate }) => updateBucket(id, updates),
});
queryClient.setMutationDefaults(['deleteBucket'], {
  mutationFn: deleteBucket,
});

queryClient.setMutationDefaults(['addTransaction'], {
  mutationFn: addTransaction,
});
queryClient.setMutationDefaults(['updateTransaction'], {
  mutationFn: ({ id, updates }: { id: string; updates: TransactionUpdate }) => updateTransaction(id, updates),
});
queryClient.setMutationDefaults(['deleteTransaction'], {
  mutationFn: deleteTransaction,
});
queryClient.setMutationDefaults(['transferFunds'], {
  mutationFn: transferFunds,
});

queryClient.setMutationDefaults(['createSubscription'], {
  mutationFn: createSubscription,
});
queryClient.setMutationDefaults(['updateSubscription'], {
  mutationFn: ({ id, updates }: { id: string; updates: SubscriptionUpdate }) => updateSubscription(id, updates),
});
queryClient.setMutationDefaults(['deleteSubscription'], {
  mutationFn: deleteSubscription,
});


// 3. Create the persister
export const persister = createSyncStoragePersister({
  storage: window.localStorage,
});
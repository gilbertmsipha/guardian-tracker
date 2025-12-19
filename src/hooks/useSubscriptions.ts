// src/hooks/useSubscriptions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubscriptions, createSubscription, updateSubscription, deleteSubscription } from '../api/subscriptions';
import type { Database } from '@/supabase/database-types';

type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

// Hook to READ data
export function useSubscriptions() {
  return useQuery({
    queryKey: ['subs'], // Unique key for caching
    queryFn: getSubscriptions,
  });
}

// Hook to CREATE data
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createSubscription'],
    mutationFn: createSubscription,
    onSuccess: () => {
      // Refresh the list immediately after creating
      queryClient.invalidateQueries({ queryKey: ['subs'] });
    },
  });
}

// Hook to UPDATE data
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['updateSubscription'],
    mutationFn: ({ id, updates }: { id: string; updates: SubscriptionUpdate }) =>
      updateSubscription(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subs'] });
    },
  });
}

// Hook to DELETE data
export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['deleteSubscription'],
    mutationFn: deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subs'] });
    },
  });
}

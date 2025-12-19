// src/hooks/useSubscriptions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubscriptions, createSubscription, updateSubscription, deleteSubscription } from '../api/subscriptions';
import type { Database } from '@/supabase/database-types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
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
    onMutate: async (newSub: SubscriptionInsert) => {
      await queryClient.cancelQueries({ queryKey: ['subs'] });
      const previousSubs = queryClient.getQueryData<Subscription[]>(['subs']);

      if (previousSubs) {
        queryClient.setQueryData<Subscription[]>(['subs'], (old) => {
          const optimisticSub: any = {
             id: `temp-${Date.now()}`,
             created_at: new Date().toISOString(),
             ...newSub
          };
          return [...(old || []), optimisticSub];
        });
      }
      return { previousSubs };
    },
    onError: (_err, _newSub, context) => {
      if (context?.previousSubs) {
        queryClient.setQueryData(['subs'], context.previousSubs);
      }
    },
    onSettled: () => {
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
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['subs'] });
      const previousSubs = queryClient.getQueryData<Subscription[]>(['subs']);

      if (previousSubs) {
        queryClient.setQueryData<Subscription[]>(['subs'], (old) => 
          old?.map(sub => sub.id === id ? { ...sub, ...updates } : sub) || []
        );
      }
      return { previousSubs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousSubs) {
        queryClient.setQueryData(['subs'], context.previousSubs);
      }
    },
    onSettled: () => {
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['subs'] });
      const previousSubs = queryClient.getQueryData<Subscription[]>(['subs']);

      if (previousSubs) {
        queryClient.setQueryData<Subscription[]>(['subs'], (old) => 
          old?.filter(sub => sub.id !== id) || []
        );
      }
      return { previousSubs };
    },
    onError: (_err, _id, context) => {
      if (context?.previousSubs) {
        queryClient.setQueryData(['subs'], context.previousSubs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['subs'] });
    },
  });
}
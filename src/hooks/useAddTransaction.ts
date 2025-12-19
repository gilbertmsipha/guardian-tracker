// src/hooks/useAddTransaction.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTransaction } from '../api/transactions';
import type { Database } from '@/supabase/database-types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['addTransaction'],
    mutationFn: addTransaction,
    onMutate: async (newTransaction) => {
      // 1. Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      // 2. Snapshot the previous value
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions']);

      // 3. Optimistically update to the new value
      if (previousTransactions) {
        queryClient.setQueryData<Transaction[]>(['transactions'], (old) => {
           const optimisticTx: Transaction = {
             id: `temp-${Date.now()}`, // Temporary ID
             created_at: new Date().toISOString(),
             date: new Date().toISOString(),
             is_transfer: false,
             ...newTransaction,
           };
           return [optimisticTx, ...(old || [])];
        });
      }

      // Return a context object with the snapshotted value
      return { previousTransactions };
    },
    onError: (_err, _newTransaction, context) => {
      // 4. If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
    },
    onSettled: () => {
      // 5. Always refetch after error or success:
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
    },
  });
}

// src/hooks/useAddTransaction.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTransaction } from '../api/transactions';

export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['addTransaction'],
    mutationFn: addTransaction,
    onSuccess: () => {
      // 1. Invalidate the cache
      // This tells React Query: "The 'transactions' list is old now. Fetch it again."
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
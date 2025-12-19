// src/hooks/useTransfer.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transferFunds } from '../api/transactions';

export function useTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['transferFunds'],
    mutationFn: transferFunds,
    onSuccess: () => {
      // Refresh transactions AND buckets
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
    },
  });
}
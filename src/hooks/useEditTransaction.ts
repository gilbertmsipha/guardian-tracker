// src/hooks/useEditTransaction.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTransaction, deleteTransaction } from '@/api/transactions';
import type { Database } from '@/supabase/database-types';

type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export function useEditTransaction() {
  const queryClient = useQueryClient();

  const editMutation = useMutation({
    mutationKey: ['updateTransaction'],
    mutationFn: ({ id, updates }: { id: string; updates: TransactionUpdate }) => 
      updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['buckets'] }); // Refresh balances!
    },
  });

  const deleteMutation = useMutation({
    mutationKey: ['deleteTransaction'],
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
    },
  });

  return { editMutation, deleteMutation };
}

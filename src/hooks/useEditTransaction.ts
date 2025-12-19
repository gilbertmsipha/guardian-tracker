// src/hooks/useEditTransaction.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTransaction, deleteTransaction } from '@/api/transactions';
import type { Database } from '@/supabase/database-types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export function useEditTransaction() {
  const queryClient = useQueryClient();

  const editMutation = useMutation({
    mutationKey: ['updateTransaction'],
    mutationFn: ({ id, updates }: { id: string; updates: TransactionUpdate }) => 
      updateTransaction(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions']);

      if (previousTransactions) {
        queryClient.setQueryData<Transaction[]>(['transactions'], (old) => 
          old?.map(tx => tx.id === id ? { ...tx, ...updates } : tx) || []
        );
      }
      return { previousTransactions };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['buckets'] }); 
    },
  });

  const deleteMutation = useMutation({
    mutationKey: ['deleteTransaction'],
    mutationFn: deleteTransaction,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions']);

      if (previousTransactions) {
        queryClient.setQueryData<Transaction[]>(['transactions'], (old) => 
          old?.filter(tx => tx.id !== id) || []
        );
      }
      return { previousTransactions };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
    },
  });

  return { editMutation, deleteMutation };
}
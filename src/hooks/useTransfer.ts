// src/hooks/useTransfer.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transferFunds } from '../api/transactions';
import type { Database } from '@/supabase/database-types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

export function useTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['transferFunds'],
    mutationFn: transferFunds,
    onMutate: async (vars) => {
      // Snapshot Transactions & Buckets
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      // We don't necessarily optimistically update buckets because that logic is derived from transactions in the UI mostly?
      // Actually, checking App.tsx: getBalance() derives from transactions.
      // So updating transactions cache is enough to update balances!
      
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions']);
      
      if (previousTransactions) {
        queryClient.setQueryData<Transaction[]>(['transactions'], (old) => {
          const now = new Date().toISOString();
          // We create two fake transactions
          const tx1: any = {
            id: `temp-transfer-1-${Date.now()}`,
            created_at: now,
            date: now,
            user_id: vars.user_id,
            bucket_id: vars.from_bucket_id,
            amount: -vars.amount,
            note: `Transfer to ${vars.note}`,
            is_transfer: true
          };
           const tx2: any = {
            id: `temp-transfer-2-${Date.now()}`,
            created_at: now,
            date: now,
            user_id: vars.user_id,
            bucket_id: vars.to_bucket_id,
            amount: vars.amount,
            note: `Transfer from ${vars.note}`,
            is_transfer: true
          };
          
          return [tx1, tx2, ...(old || [])];
        });
      }
      
      return { previousTransactions };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
    },
  });
}

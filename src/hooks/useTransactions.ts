// src/hooks/useTransactions.ts
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '../api/transactions';

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'], // The unique ID for this data
    queryFn: getTransactions,   // The function to run
  });
}
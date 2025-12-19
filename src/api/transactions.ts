// src/api/transactions.ts
import { supabase } from '../lib/supabase';
import type { Database } from '@/supabase/database-types';

type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export const getTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const addTransaction = async (newTransaction: {
  user_id: string; // We need to know WHO is spending
  bucket_id: string;
  amount: number;
  note: string;
  date?: string;
}) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([newTransaction])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateTransaction = async (id: string, updates: TransactionUpdate) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteTransaction = async (id: string) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
};

export const transferFunds = async ({
  user_id,
  from_bucket_id,
  to_bucket_id,
  amount,
  note
}: {
  user_id: string;
  from_bucket_id: string;
  to_bucket_id: string;
  amount: number;
  note: string;
}) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        user_id,
        bucket_id: from_bucket_id,
        amount: -amount, 
        note: `Transfer to ${note}`,
        is_transfer: true // <--- IMPORTANT: Mark as transfer
      },
      {
        user_id,
        bucket_id: to_bucket_id,
        amount: amount, 
        note: `Transfer from ${note}`,
        is_transfer: true // <--- IMPORTANT
      }
    ])
    .select();

  if (error) throw new Error(error.message);
  return data;
};

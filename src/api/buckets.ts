// src/api/buckets.ts
import { supabase } from '@/lib/supabase';
import type { Database } from '@/supabase/database-types';

type BucketUpdate = Database['public']['Tables']['buckets']['Update'];

// 1. Fetch all your envelopes/goals
export const getBuckets = async () => {
  const { data, error } = await supabase
    .from('buckets')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

// 2. Create a new envelope/goal
export const createBucket = async (bucket: {
  user_id: string;
  name: string;
  type: 'envelope' | 'goal' | 'income';
  target_amount: number;
  color: string;
}) => {
  const { data, error } = await supabase
    .from('buckets')
    .insert([bucket])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// 3. Update an existing bucket
export const updateBucket = async (id: string, updates: BucketUpdate) => {
  const { data, error } = await supabase
    .from('buckets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// 4. Delete a bucket
export const deleteBucket = async (id: string) => {
  const { error } = await supabase
    .from('buckets')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
};

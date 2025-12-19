import { supabase } from '@/lib/supabase';
import type { Database } from '@/supabase/database-types';

type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

export const getSubscriptions = async () => {
  const { data, error } = await supabase.from('subscriptions').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export const createSubscription = async (sub: SubscriptionInsert) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([sub])
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const updateSubscription = async (id: string, updates: SubscriptionUpdate) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteSubscription = async (id: string) => {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
};

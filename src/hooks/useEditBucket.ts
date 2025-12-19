// src/hooks/useEditBucket.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBucket, deleteBucket as deleteBucketApi } from '@/api/buckets';
import type { Bucket } from './useBuckets';
import type { Database } from '@/supabase/database-types';

type BucketUpdate = Database['public']['Tables']['buckets']['Update'];
type ContextType = { previousBuckets?: Bucket[] };

export function useEditBucket() {
  const queryClient = useQueryClient();

  const updateBucketMutation = useMutation({
    mutationKey: ['updateBucket'],
    mutationFn: ({ id, updates }: { id: string; updates: BucketUpdate }) =>
      updateBucket(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const deleteBucket = useMutation<{ id: string }, Error, string, ContextType>({
    mutationKey: ['deleteBucket'],
    mutationFn: async (id: string) => {
      await deleteBucketApi(id);
      return { id };
    },
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['buckets'] });
      
      // Snapshot the previous value
      const previousBuckets = queryClient.getQueryData<Bucket[]>(['buckets']);
      
      // Optimistically update the cache
      if (previousBuckets) {
        queryClient.setQueryData<Bucket[]>(['buckets'], 
          previousBuckets.filter(bucket => bucket.id !== id)
        );
      }
      
      return { previousBuckets };
    },
    onError: (error, _id, context) => {
      console.error('Error deleting bucket:', error);
      
      // Rollback on error
      if (context?.previousBuckets) {
        queryClient.setQueryData<Bucket[]>(['buckets'], context.previousBuckets);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  return { deleteBucket, updateBucketMutation };
}

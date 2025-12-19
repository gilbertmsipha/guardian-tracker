// src/hooks/useBuckets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBuckets, createBucket } from '../api/buckets';

export interface Bucket {
  id: string;
  name: string;
  type: 'income' | 'envelope' | 'goal' | 'income_source';
  target_amount: number | null;
  current_balance?: number;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
  color: string | null;
}

// Hook to READ data
export function useBuckets() {
  const { data, ...queryInfo } = useQuery<Bucket[]>({
    queryKey: ['buckets'],
    queryFn: async () => {
      const data = await getBuckets();
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Get unique bucket types from the data
  const bucketTypes = Array.from(new Set(data?.map(bucket => bucket.type) || []));

  return {
    ...queryInfo,
    data,
    bucketTypes,
    getBucketsByType: (type: string) => data?.filter(bucket => bucket.type === type) || []
  };
}

// Hook to CREATE data
export function useCreateBucket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBucket,
    onSuccess: () => {
      // Refresh the list immediately after creating
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
    },
  });
}

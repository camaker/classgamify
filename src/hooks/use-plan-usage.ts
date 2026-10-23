import { getPlanUsage } from '@/api/plan-usage';
import { useQuery } from '@tanstack/react-query';

export const PLAN_USAGE_QUERY_KEY = ['planUsage'] as const;

export function usePlanUsage(enabled = true) {
  return useQuery({
    queryKey: PLAN_USAGE_QUERY_KEY,
    queryFn: () => getPlanUsage(),
    enabled,
    refetchOnWindowFocus: true,
  });
}

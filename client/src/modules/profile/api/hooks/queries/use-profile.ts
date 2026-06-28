import { queryOptions, useQuery } from '@tanstack/react-query';
import type { UseQueryOptions as CustomUseQueryOptions } from '@/lib/react-query/types';
import { profileService } from '../../profile.service';
import { profileQueryKeys } from '../../profile.query-keys';

export const useProfileQueryOptions = () => {
  return queryOptions({
    queryKey: profileQueryKeys.me(),
    queryFn: () => profileService.fetchProfile(),
  });
};

export type UseProfileQueryOptions = CustomUseQueryOptions<typeof useProfileQueryOptions>;

export const useProfile = (options?: UseProfileQueryOptions) => {
  return useQuery({
    ...useProfileQueryOptions(),
    ...options,
  });
};

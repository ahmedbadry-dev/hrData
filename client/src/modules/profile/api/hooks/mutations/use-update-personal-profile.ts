import { mutationOptions, useMutation } from '@tanstack/react-query';
import type { UseMutationOptions as CustomUseMutationOptions } from '@/lib/react-query/types';
import { profileService, type UpdatePersonalProfileRequest } from '../../profile.service';

export const useUpdatePersonalProfileMutationOptions = () => {
  return mutationOptions({
    mutationFn: (payload: UpdatePersonalProfileRequest) => profileService.updatePersonal(payload),
  });
};

export type UseUpdatePersonalProfileOptions = CustomUseMutationOptions<
  typeof useUpdatePersonalProfileMutationOptions
>;

export const useUpdatePersonalProfile = (options?: UseUpdatePersonalProfileOptions) => {
  return useMutation({
    ...useUpdatePersonalProfileMutationOptions(),
    ...options,
  });
};

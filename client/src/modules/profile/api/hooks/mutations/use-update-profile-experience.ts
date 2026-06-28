import { mutationOptions, useMutation } from '@tanstack/react-query';
import type { UseMutationOptions as CustomUseMutationOptions } from '@/lib/react-query/types';
import { profileService, type UpdateExperienceRequest } from '../../profile.service';

export const useUpdateProfileExperienceMutationOptions = () => {
  return mutationOptions({
    mutationFn: (payload: UpdateExperienceRequest) => profileService.updateExperience(payload),
  });
};

export type UseUpdateProfileExperienceOptions = CustomUseMutationOptions<
  typeof useUpdateProfileExperienceMutationOptions
>;

export const useUpdateProfileExperience = (options?: UseUpdateProfileExperienceOptions) => {
  return useMutation({
    ...useUpdateProfileExperienceMutationOptions(),
    ...options,
  });
};

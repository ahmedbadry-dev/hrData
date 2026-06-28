import { mutationOptions, useMutation } from '@tanstack/react-query';
import type { UseMutationOptions as CustomUseMutationOptions } from '@/lib/react-query/types';
import { profileService, type UpdateEducationSkillsRequest } from '../../profile.service';

export const useUpdateProfileEducationSkillsMutationOptions = () => {
  return mutationOptions({
    mutationFn: (payload: UpdateEducationSkillsRequest) =>
      profileService.updateEducationSkills(payload),
  });
};

export type UseUpdateProfileEducationSkillsOptions = CustomUseMutationOptions<
  typeof useUpdateProfileEducationSkillsMutationOptions
>;

export const useUpdateProfileEducationSkills = (
  options?: UseUpdateProfileEducationSkillsOptions
) => {
  return useMutation({
    ...useUpdateProfileEducationSkillsMutationOptions(),
    ...options,
  });
};

import { useMutation, useQueryClient, mutationOptions } from '@tanstack/react-query';
import { scheduleApplication } from '../../applications.service';
import { applicationsQueryKeys } from '../../applications.query-keys';

export const useScheduleApplicationMutationOptions = () => {
  return mutationOptions({
    mutationFn: scheduleApplication,
  });
};

export const useScheduleApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...useScheduleApplicationMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationsQueryKeys.all });
    },
  });
};

import { useMutation, useQueryClient, mutationOptions } from '@tanstack/react-query';
import { scheduleApplication } from '../../applications.service';
import { useApplicationsListQueryOptions } from '../queries/use-applications-list';

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
      queryClient.invalidateQueries({ queryKey: useApplicationsListQueryOptions().queryKey });
    },
  });
};

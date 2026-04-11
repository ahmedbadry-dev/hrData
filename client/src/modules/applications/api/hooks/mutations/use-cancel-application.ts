import { useMutation, useQueryClient, mutationOptions } from '@tanstack/react-query';
import { cancelApplication } from '../../applications.service';
import { useApplicationsListQueryOptions } from '../queries/use-applications-list';

export const useCancelApplicationMutationOptions = () => {
  return mutationOptions({
    mutationFn: cancelApplication,
  });
};

export const UseCancelApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...useCancelApplicationMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: useApplicationsListQueryOptions().queryKey });
    },
  });
};

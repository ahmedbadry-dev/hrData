import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNotification, deleteNotification } from '../../notifications.service';
import { ADMIN_NOTIFICATIONS_QUERY_KEY } from '../queries/use-notifications-list';

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_NOTIFICATIONS_QUERY_KEY });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_NOTIFICATIONS_QUERY_KEY });
    },
  });
};

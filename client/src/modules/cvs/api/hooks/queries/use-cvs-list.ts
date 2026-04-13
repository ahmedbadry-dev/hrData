import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
  mutationOptions,
} from '@tanstack/react-query';
import { cvsService } from '../../cvs.service';

export const CVS_QUERY_KEY = ['cvs'] as const;

export const useCvsListQueryOptions = () => {
  return queryOptions({
    queryKey: CVS_QUERY_KEY,
    queryFn: () => cvsService.fetchCvs(),
  });
};

export const useCvsList = () => {
  return useQuery(useCvsListQueryOptions());
};

export const useUploadCvMutationOptions = () => {
  return mutationOptions({
    mutationFn: ({ file, isDefault }: { file: File; isDefault?: boolean }) =>
      cvsService.uploadCv(file, isDefault),
  });
};

export const useUploadCv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...useUploadCvMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CVS_QUERY_KEY });
    },
  });
};

export const useDeleteCvMutationOptions = () => {
  return mutationOptions({
    mutationFn: (id: string) => cvsService.deleteCv(id),
  });
};

export const useDeleteCv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...useDeleteCvMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CVS_QUERY_KEY });
    },
  });
};

export const useSetDefaultCvMutationOptions = () => {
  return mutationOptions({
    mutationFn: (id: string) => cvsService.setDefaultCv(id),
  });
};

export const useSetDefaultCv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...useSetDefaultCvMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CVS_QUERY_KEY });
    },
  });
};

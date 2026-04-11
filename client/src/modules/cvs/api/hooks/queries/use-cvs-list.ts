import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cvsService } from '../../cvs.service';

export const useCvsList = () => {
  return useQuery({
    queryKey: ['cvs'],
    queryFn: () => cvsService.fetchCvs(),
  });
};

export const useUploadCv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, isDefault }: { file: File; isDefault?: boolean }) =>
      cvsService.uploadCv(file, isDefault),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] });
    },
  });
};

export const useDeleteCv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cvsService.deleteCv(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] });
    },
  });
};

export const useSetDefaultCv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cvsService.setDefaultCv(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] });
    },
  });
};

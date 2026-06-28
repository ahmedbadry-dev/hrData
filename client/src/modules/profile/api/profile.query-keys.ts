export const profileQueryKeys = {
  all: ['profile'] as const,
  me: () => ['profile', 'me'] as const,
};

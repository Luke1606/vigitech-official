import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';
import { authRepository } from '../domain/repositories/auth/Auth.repository';

export const useUser = () => {
	const sessionContext = useSessionContext();
	const queryClient = useQueryClient();

	const isAuthenticated: boolean = sessionContext.loading? false : sessionContext.doesSessionExist;

	const {
		data: user,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['currentUser'],
		queryFn: authRepository.fetchCurrentUser,
		enabled: isAuthenticated,
		staleTime: 5 * 60 * 1000, // 5 minutos
		retry: 1,
	});

	const refetchUserMutation = useMutation({
		mutationFn: authRepository.fetchCurrentUser,
		onSuccess: (data) => {
		queryClient.setQueryData(['currentUser'], data);
		},
	});

	return {
		user,
		isLoading: isLoading || sessionContext.loading,
		error,
		isAuthenticated,
		refetch: refetchUserMutation.mutateAsync,
	};
};
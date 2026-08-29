import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  apiClient,
  getToken,
  removeToken,
  setToken,
} from "@/lib/api-client";

export interface Association {
  id: number;
  name: string;
  acronym?: string;
  users?: User[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  associations: Association[];
}

interface LoginResponse {
  access_token: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const token = getToken();

  const {
    data: user,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch,
  } = useQuery<User>({
    queryKey: ["auth-user"],
    queryFn: async () => {
      try {
        return await apiClient<User>("/api/auth/profile");
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          removeToken();
          queryClient.setQueryData(["auth-user"], null);
        }
        throw err;
      }
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: SignInDto) =>
      apiClient<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    onSuccess: async (data) => {
      setToken(data.access_token);
      await queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });

  const logout = async () => {
    removeToken();
    queryClient.setQueryData(["auth-user"], null);
    await queryClient.invalidateQueries({ queryKey: ["auth-user"] });
  };

  const isAuthenticated = !!user && !isProfileError;
  const isLoading = isProfileLoading && !isProfileError && !!token;

  return {
    user: user ?? null,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
    refetchUser: refetch,
  };
}

export interface SignInDto {
  email: string;
  password?: string;
}

import { useQuery } from "@tanstack/react-query";

interface User {
  id?: number;
  isAdmin?: boolean;
  points?: number;
  rating?: string;
  profileImageUrl?: string;
  firstName?: string;
  lastName?: string;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

import { useAppSelector } from "@/store";

export const useAuth = () => {
  const { token, isAuthenticated, user } = useAppSelector(
    (state) => state.auth
  );
  return {
    token,
    isAuthenticated,
    user,
  };
};

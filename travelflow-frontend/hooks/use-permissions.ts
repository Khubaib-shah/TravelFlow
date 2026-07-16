import { useAuthStore } from "@/store/auth.store";

export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.permissions?.includes("admin")) return true;
    return user.permissions?.includes(permission) ?? false;
  };

  return {
    hasPermission,
    permissions: user?.permissions || [],
    isAdmin: user?.role === "admin" || user?.permissions?.includes("admin"),
  };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/data-source";
import { queryKeys } from "@/lib/query-keys";

export function useExpenses(filters?: any) {
  return useQuery({
    queryKey: queryKeys.finance.expenses.list(filters || {}),
    queryFn: () => API.getExpenses(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => API.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => API.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => API.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useReceipts(filters?: any) {
  return useQuery({
    queryKey: queryKeys.finance.receipts.list(filters || {}),
    queryFn: () => API.getReceipts(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });
}

export function useCreateReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => API.createReceipt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

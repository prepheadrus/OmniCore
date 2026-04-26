import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PriceRuleFormData } from '@omnicore/core-domain';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export function useGetPriceRules() {
  return useQuery({
    queryKey: ['price-rules'],
    queryFn: async (): Promise<PriceRuleFormData[]> => {
      const response = await fetch(`${API_URL}/pricing/rules`);
      if (!response.ok) {
        throw new Error('Kural listesi alınamadı.');
      }
      return response.json();
    },
  });
}

export function useCreatePriceRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PriceRuleFormData) => {
      const response = await fetch(`${API_URL}/pricing/rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Kural oluşturulamadı.');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-rules'] });
    },
  });
}

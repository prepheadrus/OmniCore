import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PriceRuleFormData } from '@omnicore/core-domain';
import { useChannel } from '../../contexts/ChannelContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export function useGetPriceRules() {
  const { selectedChannelId } = useChannel();

  return useQuery({
    queryKey: ['price-rules', selectedChannelId],
    queryFn: async (): Promise<PriceRuleFormData[]> => {
      const response = await fetch(`${API_URL}/pricing/rules`, {
        headers: {
          'x-channel-id': selectedChannelId,
        },
      });
      if (!response.ok) {
        throw new Error('Kural listesi alınamadı.');
      }
      return response.json();
    },
    enabled: !!selectedChannelId,
  });
}

export function useCreatePriceRule() {
  const queryClient = useQueryClient();
  const { selectedChannelId } = useChannel();

  return useMutation({
    mutationFn: async (data: PriceRuleFormData) => {
      const response = await fetch(`${API_URL}/pricing/rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-channel-id': selectedChannelId,
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

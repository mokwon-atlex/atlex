import { useQuery } from '@tanstack/react-query';
import { fetchAiTokens } from '@/lib/api/ai';

export function useAiTokens() {
  return useQuery({
    queryKey: ['aiTokens'],
    queryFn: fetchAiTokens,
    // 필요 시 자동 갱신 등 옵션 설정 가능
  });
}

import { api } from '@/lib/api';

export interface ReacaoContagem {
  emoji: string;
  total: number;
}

export interface ReacoesDesafio {
  desafioId: string;
  minhaReacao: string | null;
  contagens: ReacaoContagem[];
}

export const EMOJIS_REACAO = ['⚽', '🔥', '💪', '👏', '😮'] as const;

export const reacaoFeedService = {
  get: async (desafioId: string): Promise<ReacoesDesafio> => {
    const { data } = await api.get<ReacoesDesafio>(`/feed/${desafioId}/reacoes`);
    return data;
  },

  reagir: async (desafioId: string, emoji: string): Promise<ReacoesDesafio> => {
    const { data } = await api.post<ReacoesDesafio>(`/feed/${desafioId}/reacoes`, { emoji });
    return data;
  },
};

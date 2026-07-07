import { api } from '@/lib/api';
import type { PagedResult, RankingItem, ReputationRankingItem, ScorerRankingItem } from '@/types';

export type RankingPeriodo = 'geral' | 'mensal' | 'semanal';

export interface EstatisticasPublicas {
  empresas: number;
  times: number;
  jogos: number;
  gols: number;
}

export const rankingService = {
  getEstatisticas: async () => {
    const { data } = await api.get<EstatisticasPublicas>('/ranking/estatisticas');
    return data;
  },
  getAll: async (page = 1, pageSize = 20, periodo: RankingPeriodo = 'geral') => {
    const { data } = await api.get<PagedResult<RankingItem>>('/ranking', {
      params: { page, pageSize, periodo: periodo === 'geral' ? undefined : periodo },
    });
    return data;
  },
  getScorers: async (page = 1, pageSize = 20, periodo: RankingPeriodo = 'geral') => {
    const { data } = await api.get<PagedResult<ScorerRankingItem>>('/ranking/artilheiros', {
      params: { page, pageSize, periodo: periodo === 'geral' ? undefined : periodo },
    });
    return data;
  },
  getReputation: async (page = 1, pageSize = 20, periodo: RankingPeriodo = 'geral') => {
    const { data } = await api.get<PagedResult<ReputationRankingItem>>('/ranking/reputacao', {
      params: { page, pageSize, periodo: periodo === 'geral' ? undefined : periodo },
    });
    return data;
  },
};

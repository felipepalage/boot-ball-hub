import { api } from '@/lib/api';
import type { FeedJogo, PagedResult } from '@/types';

export const feedService = {
  getJogos: async (page = 1, pageSize = 10) => {
    const { data } = await api.get<PagedResult<FeedJogo>>('/feed/jogos', {
      params: { page, pageSize },
    });
    return data;
  },
};

import { api } from '@/lib/api';
import type { PagedResult } from '@/types';

export interface JogadorAmistoso {
  id: string;
  nome: string;
  ativo: boolean;
  pagouMensalidade: boolean;
  dataCriacao: string;
}

export interface TimeAmistoso {
  id: string;
  nome: string;
  ordem: number;
  dataSorteio: string;
  jogadores: string[];
}

export interface GolAmistoso {
  id: string;
  timeNumero: number;
  autorNome: string;
  assistenteNome?: string | null;
  dataCriacao: string;
}

export interface PartidaAmistoso {
  id: string;
  time1Nome: string;
  time2Nome: string;
  time1Gols: number;
  time2Gols: number;
  dataInicio: string;
  dataFim?: string | null;
  duracaoSegundos: number;
  finalizada: boolean;
  gols: GolAmistoso[];
}

export interface ArtilheiroAmistoso {
  nome: string;
  total: number;
}

export interface ResumoDia {
  data: string;
  totalPartidas: number;
  totalGols: number;
  artilheiroDia?: ArtilheiroAmistoso | null;
  garcomDia?: ArtilheiroAmistoso | null;
}

export const amistosoService = {
  // Elenco
  getJogadores: async () => {
    const { data } = await api.get<JogadorAmistoso[]>('/amistoso/jogadores');
    return data;
  },
  addJogador: async (nome: string) => {
    const { data } = await api.post<JogadorAmistoso>('/amistoso/jogadores', { nome });
    return data;
  },
  removerJogador: async (id: string) => {
    await api.delete(`/amistoso/jogadores/${id}`);
  },
  atualizarPagamento: async (id: string, pagou: boolean) => {
    const { data } = await api.put<JogadorAmistoso>(`/amistoso/jogadores/${id}/pagamento`, { pagou });
    return data;
  },
  zerarPagamentos: async () => {
    await api.post('/amistoso/pagamentos/zerar');
  },

  // Sorteio / Times
  sortear: async (jogadorIds: string[], numeroTimes: number) => {
    const { data } = await api.post<TimeAmistoso[]>('/amistoso/sortear', { jogadorIds, numeroTimes });
    return data;
  },
  getTimes: async () => {
    const { data } = await api.get<TimeAmistoso[]>('/amistoso/times');
    return data;
  },

  // Partidas
  iniciarPartida: async (time1Nome?: string, time2Nome?: string) => {
    const { data } = await api.post<PartidaAmistoso>('/amistoso/partidas', { time1Nome, time2Nome });
    return data;
  },
  registrarGol: async (
    partidaId: string,
    payload: { timeNumero: number; autorNome: string; assistenteNome?: string | null },
  ) => {
    const { data } = await api.post<PartidaAmistoso>(`/amistoso/partidas/${partidaId}/gols`, payload);
    return data;
  },
  finalizarPartida: async (partidaId: string, duracaoSegundos: number) => {
    const { data } = await api.post<PartidaAmistoso>(`/amistoso/partidas/${partidaId}/finalizar`, {
      duracaoSegundos,
    });
    return data;
  },
  getPartida: async (id: string) => {
    const { data } = await api.get<PartidaAmistoso>(`/amistoso/partidas/${id}`);
    return data;
  },
  getPartidas: async (page = 1, pageSize = 20) => {
    const { data } = await api.get<PagedResult<PartidaAmistoso>>('/amistoso/partidas', {
      params: { page, pageSize },
    });
    return data;
  },

  // Ranking / resumo
  getArtilheiros: async () => {
    const { data } = await api.get<ArtilheiroAmistoso[]>('/amistoso/ranking/artilheiros');
    return data;
  },
  getGarcons: async () => {
    const { data } = await api.get<ArtilheiroAmistoso[]>('/amistoso/ranking/garcons');
    return data;
  },
  getResumoDia: async (data?: string) => {
    const res = await api.get<ResumoDia>('/amistoso/resumo-dia', {
      params: data ? { data } : undefined,
    });
    return res.data;
  },
};

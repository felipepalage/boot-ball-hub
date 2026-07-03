import { api } from '@/lib/api';

export interface PresencaItem {
  id: string;
  jogadorId: string;
  nomeJogador: string;
  posicao: string;
  numeroCamisa: number;
  confirmado: boolean;
}

export interface PresencaDesafio {
  desafioId: string;
  confirmados: PresencaItem[];
  pendentes: PresencaItem[];
}

export const presencaService = {
  get: async (desafioId: string): Promise<PresencaDesafio> => {
    const { data } = await api.get<PresencaDesafio>(`/desafios/${desafioId}/presenca`);
    return data;
  },

  confirmar: async (desafioId: string, jogadorId: string, confirmado: boolean): Promise<PresencaItem> => {
    const { data } = await api.post<PresencaItem>(`/desafios/${desafioId}/presenca`, {
      jogadorId,
      confirmado,
    });
    return data;
  },
};

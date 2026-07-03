import { api } from '@/lib/api';

export interface Rivalidade {
  adversarioId: string;
  nomeAdversario: string;
  totalJogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
}

export const rivalidadeService = {
  list: async (timeId: string): Promise<Rivalidade[]> => {
    const { data } = await api.get<Rivalidade[]>(`/times/${timeId}/rivals`);
    return data;
  },
};

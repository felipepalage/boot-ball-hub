import { api } from '@/lib/api';

export interface Rivalidade {
  timeId: string;
  nomeTime: string;
  totalJogos: number;
  vitorias: number;
  derrotas: number;
  empates: number;
  bairroBase?: string | null;
}

interface RivaisResponse {
  timeId: string;
  rivais: Rivalidade[];
}

export const rivalidadeService = {
  list: async (timeId: string): Promise<Rivalidade[]> => {
    const { data } = await api.get<RivaisResponse>(`/times/${timeId}/rivals`);
    return data.rivais;
  },
};

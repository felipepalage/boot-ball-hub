import { api } from '@/lib/api';

export interface Conquista {
  tipo: string;
  titulo: string;
  descricao: string;
  emoji: string;
  conquistado: boolean;
  dataConquista?: string | null;
}

interface ConquistasTimeResponse {
  timeId: string;
  conquistas: Conquista[];
}

export const conquistaService = {
  list: async (timeId: string): Promise<Conquista[]> => {
    const { data } = await api.get<ConquistasTimeResponse>(`/times/${timeId}/conquistas`);
    return data.conquistas;
  },
};

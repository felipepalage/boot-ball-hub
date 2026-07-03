import { api } from '@/lib/api';

export interface Conquista {
  codigo: string;
  titulo: string;
  descricao: string;
  conquistado: boolean;
}

export const conquistaService = {
  list: async (timeId: string): Promise<Conquista[]> => {
    const { data } = await api.get<Conquista[]>(`/times/${timeId}/conquistas`);
    return data;
  },
};

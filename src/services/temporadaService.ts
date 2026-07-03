import { api } from '@/lib/api';

export interface Temporada {
  id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
  ativa: boolean;
  dataCriacao: string;
}

export interface CreateTemporadaRequest {
  nome: string;
  dataInicio: string;
  dataFim: string;
}

export const temporadaService = {
  list: async (): Promise<Temporada[]> => {
    const { data } = await api.get<Temporada[]>('/temporadas');
    return data;
  },

  create: async (req: CreateTemporadaRequest): Promise<Temporada> => {
    const { data } = await api.post<Temporada>('/temporadas', req);
    return data;
  },

  ativar: async (id: string): Promise<void> => {
    await api.post(`/temporadas/${id}/ativar`);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/temporadas/${id}`);
  },
};

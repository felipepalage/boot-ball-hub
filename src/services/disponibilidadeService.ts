import { api } from '@/lib/api';

export interface DisponibilidadeItem {
  id: string;
  timeId: string;
  nomeTime: string;
  diaSemana: number;
  diaSemanaLabel: string;
  horario: string;
  nomeLocal: string | null;
  bairro: string;
  cidade: string;
  enderecoCompleto: string | null;
  ativo: boolean;
}

export interface BrowseDisponibilidadeItem extends DisponibilidadeItem {
  proximaData: string;
  disponivel: boolean;
}

export interface CreateDisponibilidadeRequest {
  timeId: string;
  diaSemana: number;
  horario: string;
  nomeLocal?: string;
  bairro: string;
  cidade: string;
  enderecoCompleto?: string;
}

export interface DisponibilidadeRequest {
  diaSemana: number;
  horario: string;
  nomeLocal?: string;
  bairro: string;
  cidade: string;
  enderecoCompleto?: string;
}

export const disponibilidadeService = {
  browse: async (params: {
    cidade?: string;
    bairro?: string;
    diaSemana?: number;
    meuTimeId?: string;
  }): Promise<BrowseDisponibilidadeItem[]> => {
    const { data } = await api.get<BrowseDisponibilidadeItem[]>('/disponibilidades', { params });
    return data;
  },

  getByTime: async (timeId: string): Promise<DisponibilidadeItem[]> => {
    const { data } = await api.get<DisponibilidadeItem[]>(`/disponibilidades/meu-time/${timeId}`);
    return data;
  },

  create: async (req: CreateDisponibilidadeRequest): Promise<DisponibilidadeItem> => {
    const { data } = await api.post<DisponibilidadeItem>('/disponibilidades', req);
    return data;
  },

  update: async (
    id: string,
    timeId: string,
    req: DisponibilidadeRequest,
  ): Promise<DisponibilidadeItem> => {
    const { data } = await api.put<DisponibilidadeItem>(
      `/disponibilidades/${id}?timeId=${timeId}`,
      req,
    );
    return data;
  },

  delete: async (id: string, timeId: string): Promise<void> => {
    await api.delete(`/disponibilidades/${id}?timeId=${timeId}`);
  },

  desafiar: async (id: string, meuTimeId: string, dataJogo: string): Promise<void> => {
    await api.post(`/disponibilidades/${id}/desafiar`, { meuTimeId, dataJogo });
  },
};

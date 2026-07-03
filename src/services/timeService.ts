import { api } from '@/lib/api';
import type { PagedResult, Time, TimeDetails } from '@/types';

interface CreateTimePayload {
  empresaId: string;
  nome: string;
  bairroBase: string;
  nivel: number;
  escudoShape?: number;
  corPrimaria?: string;
  corSecundaria?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
}

export const timeService = {
  create: async (payload: CreateTimePayload) => {
    const { data } = await api.post<Time>('/times', payload);
    return data;
  },
  update: async (id: string, payload: Omit<CreateTimePayload, 'empresaId'>) => {
    const { data } = await api.put<Time>(`/times/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`/times/${id}`);
  },
  getAll: async (page = 1, pageSize = 20) => {
    const { data } = await api.get<PagedResult<Time>>('/times', {
      params: { page, pageSize },
    });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<TimeDetails>(`/times/${id}`);
    return data;
  },
  updateFoto: async (id: string, fotoUrl: string) => {
    const { data } = await api.put<Time>(`/times/${id}/foto`, { fotoUrl });
    return data;
  },
  uploadFoto: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.put<Time>(`/times/${id}/foto/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};


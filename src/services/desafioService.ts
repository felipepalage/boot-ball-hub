import { api } from '@/lib/api';
import type {
  AcceptDesafioPayload,
  CancelDesafioPayload,
  CreateDesafioPayload,
  Desafio,
  PagedResult,
  RegistrarArtilheirosPayload,
  ResultadoPayload,
  SuggestedChallenge,
} from '@/types';

interface GetAbertosParams {
  bairro?: string;
  data?: string;
  page?: number;
  pageSize?: number;
}

export const desafioService = {
  getAbertos: async (params: GetAbertosParams = {}) => {
    const { data } = await api.get<PagedResult<Desafio>>('/desafios/abertos', {
      params: {
        bairro: params.bairro || undefined,
        data: params.data || undefined,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
      },
    });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<Desafio>(`/desafios/${id}`);
    return data;
  },
  getByTime: async (timeId: string, page = 1, pageSize = 20) => {
    const { data } = await api.get<PagedResult<Desafio>>(`/desafios/time/${timeId}`, {
      params: { page, pageSize },
    });
    return data;
  },
  getSugeridos: async (timeId: string, dataJogo: string, page = 1, pageSize = 10) => {
    const { data } = await api.get<PagedResult<SuggestedChallenge>>('/desafios/sugeridos', {
      params: { timeId, dataJogo, page, pageSize },
    });
    return data;
  },
  create: async (payload: CreateDesafioPayload) => {
    const { data } = await api.post<Desafio>('/desafios', payload);
    return data;
  },
  aceitar: async (id: string, payload: AcceptDesafioPayload) => {
    const { data } = await api.post<Desafio>(`/desafios/${id}/aceitar`, payload);
    return data;
  },
  cancelar: async (id: string, payload: CancelDesafioPayload = {}) => {
    const { data } = await api.post<Desafio>(`/desafios/${id}/cancelar`, payload);
    return data;
  },
  registrarResultado: async (id: string, payload: ResultadoPayload) => {
    const { data } = await api.post<Desafio>(`/desafios/${id}/resultado`, payload);
    return data;
  },
  confirmarResultado: async (id: string, payload: ResultadoPayload) => {
    const { data } = await api.post<Desafio>(`/desafios/${id}/resultado/confirmar`, payload);
    return data;
  },
  registrarArtilheiros: async (id: string, payload: RegistrarArtilheirosPayload) => {
    const { data } = await api.post<Desafio>(`/desafios/${id}/artilheiros`, payload);
    return data;
  },
};

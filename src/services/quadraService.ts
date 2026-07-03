import { api } from '@/lib/api';
import type { PagedResult } from '@/types';

export interface Avaliacao {
  id: string;
  nomeEmpresa: string;
  nota: number;
  comentario?: string;
  dataCriacao: string;
}

export interface Quadra {
  id: string;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado?: string;
  cep?: string;
  capacidade?: number;
  tipoGrama: number; // 0=Sintético 1=Natural 2=Cimento 3=Borracha
  iluminacao: boolean;
  vestiario: boolean;
  fotoUrl?: string;
  notaMedia: number;
  totalAvaliacoes: number;
  avaliacoes: Avaliacao[];
  dataCriacao: string;
}

export interface CreateQuadraPayload {
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado?: string;
  cep?: string;
  capacidade?: number;
  tipoGrama: number;
  iluminacao: boolean;
  vestiario: boolean;
}

export const TIPO_GRAMA = ['Sintético', 'Natural', 'Cimento', 'Borracha'];

export const quadraService = {
  getAll: async (bairro?: string, page = 1, pageSize = 20) => {
    const { data } = await api.get<PagedResult<Quadra>>('/quadras', { params: { bairro, page, pageSize } });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<Quadra>(`/quadras/${id}`);
    return data;
  },
  create: async (payload: CreateQuadraPayload) => {
    const { data } = await api.post<Quadra>('/quadras', payload);
    return data;
  },
  avaliar: async (id: string, nota: number, comentario?: string) => {
    const { data } = await api.post<Quadra>(`/quadras/${id}/avaliacoes`, { nota, comentario });
    return data;
  },
};

import { api } from '@/lib/api';

export interface PostMural {
  id: string;
  empresaId: string;
  titulo: string;
  conteudo: string;
  nomeAutor: string;
  dataPublicacao: string;
}

export interface CreatePostMuralRequest {
  titulo: string;
  conteudo: string;
}

export const muralService = {
  list: async (empresaId: string): Promise<PostMural[]> => {
    const { data } = await api.get<PostMural[]>(`/empresas/${empresaId}/mural`);
    return data;
  },

  create: async (empresaId: string, req: CreatePostMuralRequest): Promise<PostMural> => {
    const { data } = await api.post<PostMural>(`/empresas/${empresaId}/mural`, req);
    return data;
  },

  delete: async (empresaId: string, id: string): Promise<void> => {
    await api.delete(`/empresas/${empresaId}/mural/${id}`);
  },
};

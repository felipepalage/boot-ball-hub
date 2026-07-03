import { api } from '@/lib/api';

export interface ComentarioFeed {
  id: string;
  desafioId: string;
  empresaId: string;
  nomeEmpresa: string;
  conteudo: string;
  dataComentario: string;
}

export const comentarioService = {
  list: async (desafioId: string): Promise<ComentarioFeed[]> => {
    const { data } = await api.get<ComentarioFeed[]>(`/feed/${desafioId}/comentarios`);
    return data;
  },

  create: async (desafioId: string, conteudo: string): Promise<ComentarioFeed> => {
    const { data } = await api.post<ComentarioFeed>(`/feed/${desafioId}/comentarios`, {
      conteudo,
    });
    return data;
  },

  delete: async (desafioId: string, id: string): Promise<void> => {
    await api.delete(`/feed/${desafioId}/comentarios/${id}`);
  },
};

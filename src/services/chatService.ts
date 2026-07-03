import { api } from '@/lib/api';

export interface MensagemDesafio {
  id: string;
  desafioId: string;
  empresaId: string;
  nomeEmpresa: string;
  conteudo: string;
  dataEnvio: string;
}

export const chatService = {
  getMensagens: async (desafioId: string): Promise<MensagemDesafio[]> => {
    const { data } = await api.get<MensagemDesafio[]>(`/desafios/${desafioId}/mensagens`);
    return data;
  },

  enviarMensagem: async (desafioId: string, conteudo: string): Promise<MensagemDesafio> => {
    const { data } = await api.post<MensagemDesafio>(`/desafios/${desafioId}/mensagens`, {
      conteudo,
    });
    return data;
  },
};

import { api } from '@/lib/api';

export interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  url?: string;
  lida: boolean;
  dataCriacao: string;
}

export interface NotificacoesResumo {
  naoLidas: number;
  itens: Notificacao[];
}

export const notificacaoService = {
  get: async () => {
    const { data } = await api.get<NotificacoesResumo>('/notificacoes');
    return data;
  },
  marcarLida: async (id: string) => {
    await api.patch(`/notificacoes/${id}/lida`);
  },
  marcarTodasLidas: async () => {
    await api.patch('/notificacoes/lida-todas');
  },
};

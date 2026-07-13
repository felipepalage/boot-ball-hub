import { api } from '@/lib/api';

export interface RachaoConfirmacao {
  id: string;
  nome: string;
  empresa?: string | null;
}

export interface RachaoEvento {
  id: string;
  token: string;
  horarioEvento: string;
  numeroTimes: number;
  sorteioFeito: boolean;
  confirmados: RachaoConfirmacao[];
}

export interface TimeSorteado {
  nome: string;
  jogadores: string[];
}

export interface RachaoPublico {
  token: string;
  empresaNome: string;
  horarioEvento: string;
  numeroTimes: number;
  sorteioFeito: boolean;
  confirmados: RachaoConfirmacao[];
  times: TimeSorteado[];
}

export const rachaoService = {
  criar: async (horarioEvento: string, jogadoresPorTime: number = 6) => {
    const { data } = await api.post<RachaoEvento>('/rachao/eventos', { horarioEvento, jogadoresPorTime });
    return data;
  },
  getAtivo: async (): Promise<RachaoEvento | null> => {
    const { data } = await api.get<RachaoEvento | ''>('/rachao/eventos/ativo');
    return data || null;
  },
  getPublico: async (token: string) => {
    const { data } = await api.get<RachaoPublico>(`/rachao/publico/${token}`);
    return data;
  },
  confirmar: async (token: string, nome: string, empresa: string) => {
    const { data } = await api.post<RachaoPublico>(`/rachao/publico/${token}/confirmar`, { nome, empresa });
    return data;
  },
};
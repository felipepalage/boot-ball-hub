import { api } from '@/lib/api';
import type { Jogador } from '@/types';

export interface CreateJogadorPayload {
  timeId: string;
  nome: string;
  posicao: string;
  numeroCamisa: number;
}

export const jogadorService = {
  getByTime: async (timeId: string): Promise<Jogador[]> => {
    const { data } = await api.get<Jogador[]>(`/jogadores/time/${timeId}`);
    return data;
  },

  create: async (payload: CreateJogadorPayload): Promise<Jogador> => {
    const { data } = await api.post<Jogador>('/jogadores', payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/jogadores/${id}`);
  },

  getPerfil: async (id: string) => {
    const { data } = await api.get<JogadorPerfil>(`/jogadores/${id}/perfil`);
    return data;
  },
};

export interface JogadorPerfil {
  id: string;
  nome: string;
  posicao: string;
  numeroCamisa: number;
  timeId: string;
  timeNome: string;
  nomeEmpresa: string;
  escudoShape: number;
  corPrimaria: string;
  corSecundaria: string;
  totalGols: number;
  jogosComGol: number;
  totalJogosTime: number;
}

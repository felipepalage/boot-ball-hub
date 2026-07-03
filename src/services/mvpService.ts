import { api } from '@/lib/api';

export interface MvpCandidato {
  jogadorId: string;
  nome: string;
  posicao: string;
  numeroCamisa: number;
  nomeTime: string;
  totalVotos: number;
}

export interface VotacaoMvp {
  desafioId: string;
  jogadorVotadoIdPelaMinhaEmpresa: string | null;
  candidatos: MvpCandidato[];
}

export const mvpService = {
  get: async (desafioId: string): Promise<VotacaoMvp> => {
    const { data } = await api.get<VotacaoMvp>(`/desafios/${desafioId}/mvp`);
    return data;
  },

  votar: async (desafioId: string, jogadorVotadoId: string): Promise<VotacaoMvp> => {
    const { data } = await api.post<VotacaoMvp>(`/desafios/${desafioId}/mvp`, { jogadorVotadoId });
    return data;
  },
};

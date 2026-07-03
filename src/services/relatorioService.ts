import { api } from '@/lib/api';

export interface RelatorioJogo {
  dataJogo: string;
  horaJogo: string;
  local: string;
  adversario: string;
  resultado: string;
  golsPro: number | null;
  golsContra: number | null;
  status: string;
}

export interface RelatorioTime {
  timeId: string;
  nomeTime: string;
  totalJogos: number;
  vitorias: number;
  derrotas: number;
  empates: number;
  golsPro: number;
  golsContra: number;
  jogos: RelatorioJogo[];
}

export const relatorioService = {
  get: async (timeId: string): Promise<RelatorioTime> => {
    const { data } = await api.get<RelatorioTime>(`/relatorios/${timeId}`);
    return data;
  },
};

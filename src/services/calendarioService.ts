import { api } from '@/lib/api';

export interface CalendarioItem {
  desafioId: string;
  dataJogo: string;
  horaJogo: string;
  local: string;
  bairro: string;
  statusLabel: string;
  nomeAdversario: string;
  souCriador: boolean;
}

export interface CalendarioMes {
  ano: number;
  mes: number;
  jogos: CalendarioItem[];
}

export const calendarioService = {
  getMes: async (timeId: string, ano: number, mes: number): Promise<CalendarioMes> => {
    const { data } = await api.get<CalendarioMes>('/calendario', {
      params: { timeId, ano, mes },
    });
    return data;
  },
};

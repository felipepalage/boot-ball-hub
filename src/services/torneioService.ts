import { api } from '@/lib/api';
import type { PagedResult } from '@/types';

export interface TorneioInscricao {
  timeId: string;
  nomeTime: string;
  nomeEmpresa: string;
  escudoShape: number;
  corPrimaria: string;
  corSecundaria: string;
  grupoLetra?: string;
  dataInscricao: string;
}

export interface PartidaTorneio {
  id: string;
  fase: string;
  status: number; // 0=Agendada 1=Realizada 2=Walkover
  timeMandanteId: string;
  timeMandante: string;
  timeMandanteEscudoShape: number;
  timeMandanteCorPrimaria: string;
  timeMandanteCorSecundaria: string;
  timeVisitanteId?: string;
  timeVisitante?: string;
  timeVisitanteEscudoShape: number;
  timeVisitanteCorPrimaria: string;
  timeVisitanteCorSecundaria: string;
  placarMandante?: number;
  placarVisitante?: number;
  dataJogo?: string;
  horaJogo?: string;
  local?: string;
}

export interface Torneio {
  id: string;
  nome: string;
  descricao?: string;
  formato: number; // 0=MataMata 1=Grupos
  status: number; // 0=Inscricoes 1=EmAndamento 2=Finalizado 3=Cancelado
  dataInicio: string;
  dataFim?: string;
  empresaOrganizadoraId: string;
  empresaOrganizadora: string;
  totalInscritos: number;
  inscricoes: TorneioInscricao[];
  partidas: PartidaTorneio[];
  dataCriacao: string;
}

export const TORNEIO_STATUS = ['Inscrições', 'Em Andamento', 'Finalizado', 'Cancelado'];
export const TORNEIO_FORMATO = ['Mata-Mata', 'Grupos'];
export const PARTIDA_STATUS = ['Agendada', 'Realizada', 'W.O.'];

export const torneioService = {
  getAll: async (page = 1, pageSize = 20) => {
    const { data } = await api.get<PagedResult<Torneio>>('/torneios', { params: { page, pageSize } });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<Torneio>(`/torneios/${id}`);
    return data;
  },
  create: async (payload: { nome: string; descricao?: string; formato: number; dataInicio: string; dataFim?: string }) => {
    const { data } = await api.post<Torneio>('/torneios', payload);
    return data;
  },
  inscrever: async (id: string, timeId: string) => {
    const { data } = await api.post<Torneio>(`/torneios/${id}/inscricao`, { timeId });
    return data;
  },
  iniciar: async (id: string) => {
    const { data } = await api.post<Torneio>(`/torneios/${id}/iniciar`);
    return data;
  },
  agendarPartida: async (torneioId: string, payload: { timeMandanteId: string; timeVisitanteId?: string; fase: string; dataJogo?: string; horaJogo?: string; local?: string }) => {
    const { data } = await api.post<PartidaTorneio>(`/torneios/${torneioId}/partidas`, payload);
    return data;
  },
  registrarResultado: async (torneioId: string, partidaId: string, placarMandante: number, placarVisitante: number) => {
    const { data } = await api.patch<PartidaTorneio>(`/torneios/${torneioId}/partidas/${partidaId}/resultado`, { placarMandante, placarVisitante });
    return data;
  },
};

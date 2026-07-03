import { api } from '@/lib/api';

export interface NarracaoRequest {
  titulo: string;
  placar: string;
  artilheiros: string[];
  contexto?: string | null;
}

export const iaService = {
  gerarNarracao: async (payload: NarracaoRequest): Promise<string> => {
    const { data } = await api.post<{ texto: string }>('/ia/narracao', payload);
    return data.texto;
  },
};

import { api } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import type { AuthResponse } from '@/types';

export interface ConviteInfo {
  empresaNome: string;
}

export const conviteService = {
  /** Gera um link de convite pra empresa do usuário logado. */
  criar: async () => {
    const { data } = await api.post<{ token: string; expiraEm: string }>('/convites');
    return data;
  },
  /** Dados públicos do convite (nome da empresa) — usado na tela de aceitar. */
  getInfo: async (token: string) => {
    const { data } = await api.get<ConviteInfo>(`/convites/${token}`);
    return data;
  },
  /** Cria o usuário membro e já loga. */
  aceitar: async (token: string, payload: { nome: string; email: string; senha: string }) => {
    const { data } = await api.post<AuthResponse>(`/convites/${token}/aceitar`, payload);
    authStorage.setToken(data.token);
    authStorage.setUser(data.usuario);
    return data;
  },
};

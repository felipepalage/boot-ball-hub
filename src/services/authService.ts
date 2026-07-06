import { authStorage } from '@/lib/auth';
import { api } from '@/lib/api';
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types';

const persistAuth = (response: AuthResponse) => {
  authStorage.setToken(response.token);
  authStorage.setUser(response.usuario);
};

export const authService = {
  login: async (payload: LoginPayload) => {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email: payload.email,
      senha: payload.senha,
    });
    persistAuth(data);
    return data;
  },
  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    persistAuth(data);
    return data;
  },
  consultarCnpj: async (cnpj: string) => {
    const { data } = await api.get<{
      cnpj: string;
      razaoSocial?: string | null;
      nomeFantasia?: string | null;
      cidade?: string | null;
      bairro?: string | null;
      uf?: string | null;
    }>(`/auth/cnpj/${cnpj}`);
    return data;
  },
  logout: () => {
    authStorage.clear();
    window.location.assign('/login');
  },
  isAuthenticated: () => Boolean(authStorage.getToken()),
  getCurrentUser: () => authStorage.getUser(),
  getUser: () => authStorage.getUser(),
  getActiveTeamId: () => authStorage.getActiveTeamId(),
};
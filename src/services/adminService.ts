import { api } from '@/lib/api';

export interface AdminStats {
  totalEmpresas: number;
  totalDesafios: number;
  totalUsuarios: number;
  desafiosUltimaSemana: number;
  desafiosUltimoMes: number;
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get<AdminStats>('/admin/stats');
    return data;
  },
};

import { api } from '@/lib/api';
import type { Empresa, EmpresaDetails, PagedResult } from '@/types';

export const empresaService = {
  getAll: async (page = 1, pageSize = 100) => {
    const { data } = await api.get<PagedResult<Empresa>>('/empresas', {
      params: { page, pageSize },
    });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<EmpresaDetails>(`/empresas/${id}`);
    return data;
  },
  uploadLogo: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.put<Empresa>(`/empresas/${id}/logo/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};


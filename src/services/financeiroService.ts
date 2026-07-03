import { api } from '@/lib/api';

export interface FinanceiroItem {
  id: string;
  timeId: string;
  descricao: string;
  valor: number;
  tipo: 'Despesa' | 'Receita';
  categoria: string | null;
  dataVencimento: string;
  pago: boolean;
  dataCriacao: string;
}

export interface CreateFinanceiroRequest {
  descricao: string;
  valor: number;
  tipo: 'Despesa' | 'Receita';
  categoria?: string;
  dataVencimento: string;
}

export const financeiroService = {
  list: async (timeId: string): Promise<FinanceiroItem[]> => {
    const { data } = await api.get<FinanceiroItem[]>(`/financeiro/${timeId}`);
    return data;
  },

  create: async (timeId: string, req: CreateFinanceiroRequest): Promise<FinanceiroItem> => {
    const { data } = await api.post<FinanceiroItem>(`/financeiro/${timeId}`, req);
    return data;
  },

  pagar: async (id: string): Promise<void> => {
    await api.put(`/financeiro/${id}/pagar`);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/financeiro/${id}`);
  },
};

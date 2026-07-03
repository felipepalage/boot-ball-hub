import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Plus, Trash2, CheckCircle } from 'lucide-react';
import { financeiroService, type CreateFinanceiroRequest } from '@/services/financeiroService';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

const emptyForm = (): CreateFinanceiroRequest => ({
  descricao: '',
  valor: 0,
  tipo: 'Despesa',
  categoria: '',
  dataVencimento: '',
});

export default function FinanceiroPage() {
  const activeTeamId = authService.getActiveTeamId?.() ?? '';
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateFinanceiroRequest>(emptyForm());

  const { data: itens = [], isLoading } = useQuery({
    queryKey: ['financeiro', activeTeamId],
    queryFn: () => financeiroService.list(activeTeamId),
    enabled: !!activeTeamId,
  });

  const createMutation = useMutation({
    mutationFn: (req: CreateFinanceiroRequest) => financeiroService.create(activeTeamId, req),
    onSuccess: () => {
      toast.success('Item adicionado!');
      queryClient.invalidateQueries({ queryKey: ['financeiro', activeTeamId] });
      setShowForm(false);
      setForm(emptyForm());
    },
    onError: () => toast.error('Erro ao adicionar item.'),
  });

  const pagarMutation = useMutation({
    mutationFn: financeiroService.pagar,
    onSuccess: () => {
      toast.success('Marcado como pago!');
      queryClient.invalidateQueries({ queryKey: ['financeiro', activeTeamId] });
    },
    onError: () => toast.error('Erro ao atualizar.'),
  });

  const deleteMutation = useMutation({
    mutationFn: financeiroService.delete,
    onSuccess: () => {
      toast.success('Removido.');
      queryClient.invalidateQueries({ queryKey: ['financeiro', activeTeamId] });
    },
    onError: () => toast.error('Erro ao remover.'),
  });

  const totalReceita = itens.filter((i) => i.tipo === 'Receita').reduce((s, i) => s + i.valor, 0);
  const totalDespesa = itens.filter((i) => i.tipo === 'Despesa').reduce((s, i) => s + i.valor, 0);
  const saldo = totalReceita - totalDespesa;

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const f = <K extends keyof CreateFinanceiroRequest>(field: K, val: CreateFinanceiroRequest[K]) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  return (
    <div className="min-h-dvh bg-background pb-32 pt-6">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center gap-3">
          <DollarSign size={22} className="text-primary" />
          <h1 className="text-2xl font-black tracking-tight">Financeiro</h1>
        </div>

        {!activeTeamId && (
          <p className="text-center text-muted-foreground">Selecione um time para ver o financeiro.</p>
        )}

        {activeTeamId && (
          <>
            <div className="mb-6 grid grid-cols-3 gap-3">
              {[
                { label: 'Receitas', val: totalReceita, cls: 'text-emerald-400' },
                { label: 'Despesas', val: totalDespesa, cls: 'text-rose-400' },
                { label: 'Saldo', val: saldo, cls: saldo >= 0 ? 'text-emerald-400' : 'text-rose-400' },
              ].map(({ label, val, cls }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-card p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                  <p className={`mt-1 text-lg font-black ${cls}`}>{fmt(val)}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowForm((v) => !v)}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 py-3 text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <Plus size={16} />
              Adicionar item
            </button>

            {showForm && (
              <div className="mb-6 rounded-3xl border border-white/10 bg-card p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs text-muted-foreground">Descrição *</label>
                    <input
                      value={form.descricao}
                      onChange={(e) => f('descricao', e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Valor *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.valor}
                      onChange={(e) => f('valor', Number(e.target.value))}
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Tipo</label>
                    <select
                      value={form.tipo}
                      onChange={(e) => f('tipo', e.target.value as 'Despesa' | 'Receita')}
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    >
                      <option>Despesa</option>
                      <option>Receita</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Categoria</label>
                    <input
                      value={form.categoria}
                      onChange={(e) => f('categoria', e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Vencimento *</label>
                    <input
                      type="date"
                      value={form.dataVencimento}
                      onChange={(e) => f('dataVencimento', e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <button
                  onClick={() => createMutation.mutate(form)}
                  disabled={createMutation.isPending || !form.descricao || !form.dataVencimento}
                  className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            )}

            {isLoading && <p className="text-center text-muted-foreground">Carregando...</p>}

            <div className="space-y-3">
              {itens.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-3xl border p-4 ${
                    item.pago ? 'border-white/5 opacity-60' : 'border-white/10 bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                            item.tipo === 'Receita' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {item.tipo}
                        </span>
                        {item.categoria && (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">
                            {item.categoria}
                          </span>
                        )}
                        {item.pago && (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">
                            Pago
                          </span>
                        )}
                      </div>
                      <p className="mt-1 font-bold text-foreground">{item.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        {fmt(item.valor)} • Vence {item.dataVencimento}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!item.pago && (
                        <button
                          onClick={() => pagarMutation.mutate(item.id)}
                          disabled={pagarMutation.isPending}
                          className="rounded-xl border border-emerald-500/30 p-2 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                        >
                          <CheckCircle size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                        className="rounded-xl border border-rose-500/30 p-2 text-rose-400 hover:bg-rose-500/10 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Plus, Trash2, Play } from 'lucide-react';
import { temporadaService, type CreateTemporadaRequest } from '@/services/temporadaService';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

export default function TemporadasPage() {
  const queryClient = useQueryClient();
  const user = authService.getUser();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateTemporadaRequest>({ nome: '', dataInicio: '', dataFim: '' });

  const { data: temporadas = [], isLoading } = useQuery({
    queryKey: ['temporadas'],
    queryFn: temporadaService.list,
  });

  const createMutation = useMutation({
    mutationFn: temporadaService.create,
    onSuccess: () => {
      toast.success('Temporada criada!');
      queryClient.invalidateQueries({ queryKey: ['temporadas'] });
      setShowForm(false);
      setForm({ nome: '', dataInicio: '', dataFim: '' });
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao criar temporada.'),
  });

  const ativarMutation = useMutation({
    mutationFn: temporadaService.ativar,
    onSuccess: () => {
      toast.success('Temporada ativada!');
      queryClient.invalidateQueries({ queryKey: ['temporadas'] });
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao ativar.'),
  });

  const deleteMutation = useMutation({
    mutationFn: temporadaService.delete,
    onSuccess: () => {
      toast.success('Temporada removida.');
      queryClient.invalidateQueries({ queryKey: ['temporadas'] });
    },
    onError: () => toast.error('Erro ao remover.'),
  });

  return (
    <div className="min-h-screen bg-background pb-32 pt-6">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center gap-3">
          <Trophy size={22} className="text-primary" />
          <h1 className="text-2xl font-black tracking-tight">Temporadas</h1>
        </div>

        {user?.isAdmin && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 py-3 text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <Plus size={16} />
            Nova temporada
          </button>
        )}

        {showForm && (
          <div className="mb-6 rounded-3xl border border-white/10 bg-card p-5">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Nome *</label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Início *</label>
                  <input
                    type="date"
                    value={form.dataInicio}
                    onChange={(e) => setForm((f) => ({ ...f, dataInicio: e.target.value }))}
                    className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Fim *</label>
                  <input
                    type="date"
                    value={form.dataFim}
                    onChange={(e) => setForm((f) => ({ ...f, dataFim: e.target.value }))}
                    className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.nome || !form.dataInicio || !form.dataFim}
              className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50"
            >
              {createMutation.isPending ? 'Salvando...' : 'Criar temporada'}
            </button>
          </div>
        )}

        {isLoading && <p className="text-center text-muted-foreground">Carregando...</p>}

        <div className="space-y-3">
          {temporadas.map((t) => (
            <div
              key={t.id}
              className={`rounded-3xl border p-5 ${
                t.ativa ? 'border-primary/30 bg-primary/5' : 'border-white/10 bg-card'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black text-foreground">{t.nome}</p>
                    {t.ativa && (
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                        Ativa
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t.dataInicio} → {t.dataFim}
                  </p>
                </div>
                {user?.isAdmin && (
                  <div className="flex gap-2">
                    {!t.ativa && (
                      <button
                        onClick={() => ativarMutation.mutate(t.id)}
                        disabled={ativarMutation.isPending}
                        className="rounded-xl border border-primary/30 p-2 text-primary hover:bg-primary/10 disabled:opacity-50"
                        title="Ativar"
                      >
                        <Play size={15} />
                      </button>
                    )}
                    {!t.ativa && (
                      <button
                        onClick={() => deleteMutation.mutate(t.id)}
                        disabled={deleteMutation.isPending}
                        className="rounded-xl border border-rose-500/30 p-2 text-rose-400 hover:bg-rose-500/10 disabled:opacity-50"
                        title="Remover"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

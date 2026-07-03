import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, Trash2, Swords, CalendarDays } from 'lucide-react';
import { disponibilidadeService, type CreateDisponibilidadeRequest } from '@/services/disponibilidadeService';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const emptyForm = (): CreateDisponibilidadeRequest => ({
  timeId: '',
  diaSemana: 1,
  horario: '20:00',
  nomeLocal: '',
  bairro: '',
  cidade: '',
  enderecoCompleto: '',
});

export default function DisponibilidadePage() {
  const user = authService.getUser();
  const activeTeamId = authService.getActiveTeamId?.() ?? '';
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<'browse' | 'meu'>('browse');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateDisponibilidadeRequest>({ ...emptyForm(), timeId: activeTeamId });
  const [filterCidade, setFilterCidade] = useState('');
  const [filterDia, setFilterDia] = useState<number | ''>('');

  const { data: allSlots = [], isLoading: loadingAll } = useQuery({
    queryKey: ['disponibilidades', filterCidade, filterDia],
    queryFn: () =>
      disponibilidadeService.browse({
        cidade: filterCidade || undefined,
        diaSemana: filterDia !== '' ? filterDia : undefined,
        meuTimeId: activeTeamId || undefined,
      }),
    enabled: tab === 'browse',
  });

  const { data: meuSlots = [], isLoading: loadingMeu } = useQuery({
    queryKey: ['disponibilidades-meu', activeTeamId],
    queryFn: () => disponibilidadeService.getByTime(activeTeamId),
    enabled: tab === 'meu' && !!activeTeamId,
  });

  const createMutation = useMutation({
    mutationFn: disponibilidadeService.create,
    onSuccess: () => {
      toast.success('Slot criado!');
      queryClient.invalidateQueries({ queryKey: ['disponibilidades-meu'] });
      setShowForm(false);
      setForm({ ...emptyForm(), timeId: activeTeamId });
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao criar slot.'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => disponibilidadeService.delete(id, activeTeamId),
    onSuccess: () => {
      toast.success('Slot removido.');
      queryClient.invalidateQueries({ queryKey: ['disponibilidades-meu'] });
    },
    onError: () => toast.error('Erro ao remover slot.'),
  });

  const desafiarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: string }) =>
      disponibilidadeService.desafiar(id, activeTeamId, data),
    onSuccess: () => toast.success('Desafio enviado!'),
    onError: (e: Error) => toast.error(e.message || 'Erro ao desafiar.'),
  });

  const f = (field: keyof CreateDisponibilidadeRequest, val: string | number) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  return (
    <div className="min-h-screen bg-background pb-32 pt-6">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center gap-3">
          <MapPin size={22} className="text-primary" />
          <h1 className="text-2xl font-black tracking-tight">Quadras &amp; Horários</h1>
        </div>

        <div className="mb-6 flex rounded-2xl border border-white/10 bg-secondary/40 p-1">
          {(['browse', 'meu'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-xl py-2 text-sm font-bold uppercase tracking-[0.18em] transition ${
                tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              {t === 'browse' ? 'Explorar' : 'Meu Time'}
            </button>
          ))}
        </div>

        {tab === 'browse' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Filtrar cidade..."
                value={filterCidade}
                onChange={(e) => setFilterCidade(e.target.value)}
                className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />
              <select
                value={filterDia}
                onChange={(e) => setFilterDia(e.target.value === '' ? '' : Number(e.target.value))}
                className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="">Todos os dias</option>
                {DIAS.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </div>

            {loadingAll ? (
              <p className="text-center text-muted-foreground">Carregando...</p>
            ) : allSlots.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhum slot disponível.</p>
            ) : (
              allSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`rounded-3xl border p-5 ${
                    slot.disponivel
                      ? 'border-white/10 bg-card'
                      : 'border-white/5 bg-card/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                        {slot.diaSemanaLabel} • {slot.horario}
                      </p>
                      <p className="mt-1 text-lg font-black text-foreground">{slot.nomeTime}</p>
                      <p className="text-sm text-muted-foreground">
                        {slot.nomeLocal ? `${slot.nomeLocal} — ` : ''}{slot.bairro}, {slot.cidade}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                          slot.disponivel
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-rose-500/15 text-rose-300'
                        }`}
                      >
                        {slot.disponivel ? 'Livre' : 'Ocupado'}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        <CalendarDays size={11} className="mr-1 inline" />
                        {slot.proximaData}
                      </p>
                    </div>
                  </div>

                  {slot.disponivel && activeTeamId && (
                    <button
                      onClick={() => desafiarMutation.mutate({ id: slot.id, data: slot.proximaData })}
                      disabled={desafiarMutation.isPending}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      <Swords size={14} />
                      Desafiar para {slot.proximaData}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'meu' && (
          <div className="space-y-4">
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 py-3 text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <Plus size={16} />
              Adicionar slot
            </button>

            {showForm && (
              <div className="rounded-3xl border border-white/10 bg-card p-5">
                <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em]">Novo horário disponível</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Dia da semana</label>
                    <select
                      value={form.diaSemana}
                      onChange={(e) => f('diaSemana', Number(e.target.value))}
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    >
                      {DIAS.map((d, i) => (
                        <option key={i} value={i}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Horário</label>
                    <input
                      type="time"
                      value={form.horario}
                      onChange={(e) => f('horario', e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Bairro *</label>
                    <input
                      value={form.bairro}
                      onChange={(e) => f('bairro', e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Cidade *</label>
                    <input
                      value={form.cidade}
                      onChange={(e) => f('cidade', e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-xs text-muted-foreground">Nome do local (opcional)</label>
                  <input
                    value={form.nomeLocal ?? ''}
                    onChange={(e) => f('nomeLocal', e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-xs text-muted-foreground">Endereço completo (opcional)</label>
                  <input
                    value={form.enderecoCompleto ?? ''}
                    onChange={(e) => f('enderecoCompleto', e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={() => createMutation.mutate(form)}
                  disabled={createMutation.isPending || !form.bairro || !form.cidade || !form.timeId}
                  className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Salvando...' : 'Salvar slot'}
                </button>
              </div>
            )}

            {loadingMeu ? (
              <p className="text-center text-muted-foreground">Carregando...</p>
            ) : meuSlots.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhum slot cadastrado.</p>
            ) : (
              meuSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between rounded-3xl border border-white/10 bg-card p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      {slot.diaSemanaLabel} • {slot.horario}
                    </p>
                    <p className="mt-1 font-bold text-foreground">
                      {slot.nomeLocal || slot.bairro}, {slot.cidade}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate({ id: slot.id })}
                    disabled={deleteMutation.isPending}
                    className="rounded-xl border border-rose-500/30 p-2 text-rose-400 hover:bg-rose-500/10 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

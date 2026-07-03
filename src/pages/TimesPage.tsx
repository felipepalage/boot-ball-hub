import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { SkeletonCard } from '@/components/SkeletonCard';
import { TeamCard } from '@/components/TeamCard';
import { CrestBuilder } from '@/components/CrestBuilder';
import { getApiErrorMessage } from '@/lib/api-error';
import { slugify } from '@/lib/slugify';
import { authService } from '@/services/authService';
import { timeService } from '@/services/timeService';

const NIVEIS = [
  { val: 1, label: 'Iniciante' },
  { val: 2, label: 'Intermediário' },
  { val: 3, label: 'Avançado' },
  { val: 4, label: 'Profissional' },
];

const TimesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = authService.getCurrentUser();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    bairroBase: '',
    nivel: 2,
    escudoShape: 1,
    corPrimaria: '#DC2626',
    corSecundaria: '#111827',
    cep: '',
    cidade: '',
    estado: '',
  });

  const { data: times, isLoading } = useQuery({
    queryKey: ['times', page],
    queryFn: () => timeService.getAll(page, 20),
  });

  async function buscarCep(cep: string) {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) { toast.error('CEP não encontrado.'); return; }
      setForm((f) => ({
        ...f,
        bairroBase: f.bairroBase || data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      }));
    } catch {
      toast.error('Erro ao buscar CEP.');
    } finally {
      setCepLoading(false);
    }
  }

  const criarMutation = useMutation({
    mutationFn: () =>
      timeService.create({
        empresaId: currentUser!.empresaId,
        nome: form.nome,
        bairroBase: form.bairroBase,
        nivel: form.nivel,
        escudoShape: form.escudoShape,
        corPrimaria: form.corPrimaria,
        corSecundaria: form.corSecundaria,
        cep: form.cep || undefined,
        cidade: form.cidade || undefined,
        estado: form.estado || undefined,
      }),
    onSuccess: () => {
      toast.success('Time criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['times'] });
      queryClient.invalidateQueries({ queryKey: ['minha-empresa'] });
      setShowForm(false);
      setForm({ nome: '', bairroBase: '', nivel: 2, escudoShape: 1, corPrimaria: '#DC2626', corSecundaria: '#111827', cep: '', cidade: '', estado: '' });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Não foi possível criar o time.'));
    },
  });


  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Clubes corporativos</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Times da plataforma</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{times?.totalCount ?? 0} times cadastrados</p>
          {currentUser && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:-translate-y-0.5"
            >
              {showForm ? <X size={15} /> : <Plus size={15} />}
              {showForm ? 'Cancelar' : 'Criar time'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="mb-6 rounded-3xl border border-white/10 bg-card p-5 space-y-4">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Novo time</p>

          {/* Escudo builder */}
          <CrestBuilder
            nome={form.nome}
            shape={form.escudoShape}
            corPrimaria={form.corPrimaria}
            corSecundaria={form.corSecundaria}
            onChange={(field, value) => setForm((f) => ({ ...f, [field]: value }))}
          />

          {/* Basic info */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Nome do time *</label>
              <input
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex.: Red Warriors"
                className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Bairro base *</label>
              <input
                value={form.bairroBase}
                onChange={(e) => setForm((f) => ({ ...f, bairroBase: e.target.value }))}
                placeholder="Ex.: Vila Olímpia"
                className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Nível</label>
              <select
                value={form.nivel}
                onChange={(e) => setForm((f) => ({ ...f, nivel: Number(e.target.value) }))}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                {NIVEIS.map((n) => (
                  <option key={n.val} value={n.val}>{n.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* CEP + location */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">CEP</label>
              <input
                value={form.cep}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setForm((f) => ({ ...f, cep: v }));
                  if (v.length === 8) buscarCep(v);
                }}
                placeholder="Ex.: 01310100"
                maxLength={8}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              {cepLoading && <p className="mt-1 text-xs text-muted-foreground">Buscando CEP...</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Cidade</label>
              <input
                value={form.cidade}
                onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
                placeholder="Preenchido pelo CEP"
                className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Estado</label>
              <input
                value={form.estado}
                onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
                placeholder="Ex.: SP"
                maxLength={2}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            onClick={() => criarMutation.mutate()}
            disabled={criarMutation.isPending || !form.nome.trim() || !form.bairroBase.trim()}
            className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50"
          >
            {criarMutation.isPending ? 'Criando...' : 'Criar time'}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {isLoading && Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)}
        {times?.items.map((time) => (
          <TeamCard
            key={time.id}
            time={time}
            onAbrirPerfil={() => navigate(`/times/${time.id}/${slugify(time.nome)}`)}
          />
        ))}
        {!isLoading && (times?.items.length ?? 0) === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-8 text-center text-muted-foreground">
            Nenhum time cadastrado ate o momento.
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-card/60 px-4 py-3 text-sm text-muted-foreground">
        <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1} className="rounded-xl border border-white/10 px-3 py-2 font-semibold text-foreground disabled:opacity-40">Anterior</button>
        <span>Pagina {times?.page ?? page} de {Math.max(times?.totalPages ?? 1, 1)}</span>
        <button onClick={() => setPage((prev) => prev + 1)} disabled={Boolean(times) && page >= (times?.totalPages ?? 1)} className="rounded-xl border border-white/10 px-3 py-2 font-semibold text-foreground disabled:opacity-40">Proxima</button>
      </div>
    </div>
  );
};

export default TimesPage;

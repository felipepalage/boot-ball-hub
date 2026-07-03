import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Building2, CalendarDays, MapPin, Share2,
  Plus, Trash2, Shield, Trophy, Zap, Star, TrendingUp,
  Users, Pencil, X, AlertTriangle,
} from 'lucide-react';
import { SkeletonCard } from '@/components/SkeletonCard';
import { TeamCrest } from '@/components/TeamCrest';
import { CrestBuilder } from '@/components/CrestBuilder';
import { ConquistasTime } from '@/components/ConquistasTime';
import { RivaisTime } from '@/components/RivaisTime';
import { desafioService } from '@/services/desafioService';
import { timeService } from '@/services/timeService';
import { jogadorService } from '@/services/jogadorService';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/lib/api-error';
import { formatDate, formatTime, getStatusLabel } from '@/lib/formatters';
import { slugify } from '@/lib/slugify';
import { DesafioStatus, type Desafio } from '@/types';
import { toast } from 'sonner';

// ─── helpers ─────────────────────────────────────────────────────────────────

function calcStreak(desafios: Desafio[], timeId: string) {
  const finalizados = desafios
    .filter((d) => d.status === DesafioStatus.Finalizado && d.placarCriador != null)
    .sort((a, b) => new Date(b.dataJogo).getTime() - new Date(a.dataJogo).getTime());
  if (!finalizados.length) return { tipo: null, quantidade: 0 };
  const res = (d: Desafio) => {
    const isCriador = d.timeCriadorId === timeId;
    const pro = isCriador ? d.placarCriador! : d.placarDesafiante!;
    const contra = isCriador ? d.placarDesafiante! : d.placarCriador!;
    return pro > contra ? 'V' : pro < contra ? 'D' : 'E';
  };
  const first = res(finalizados[0]);
  let count = 1;
  for (let i = 1; i < finalizados.length; i++) { if (res(finalizados[i]) !== first) break; count++; }
  return { tipo: first, quantidade: count };
}

interface Badge { icon: React.ReactNode; label: string; earned: boolean }
function calcBadges(desafios: Desafio[], timeId: string): Badge[] {
  const fin = desafios.filter((d) => d.status === DesafioStatus.Finalizado && d.placarCriador != null);
  const pro = (d: Desafio) => d.timeCriadorId === timeId ? d.placarCriador! : d.placarDesafiante!;
  const contra = (d: Desafio) => d.timeCriadorId === timeId ? d.placarDesafiante! : d.placarCriador!;
  const vits = fin.filter((d) => pro(d) > contra(d)).length;
  const streak = calcStreak(desafios, timeId);
  return [
    { icon: <Trophy size={14} />, label: 'Campeão', earned: vits >= 10 },
    { icon: <Zap size={14} />, label: 'Em Chamas', earned: streak.tipo === 'V' && streak.quantidade >= 3 },
    { icon: <Shield size={14} />, label: 'Invicto', earned: fin.length >= 5 && fin.slice(0, 5).every((d) => contra(d) <= pro(d)) },
    { icon: <Star size={14} />, label: 'Artilheiro', earned: fin.reduce((s, d) => s + pro(d), 0) >= 20 },
    { icon: <TrendingUp size={14} />, label: 'Veterano', earned: fin.length >= 20 },
  ];
}

// ─── Player form schema ───────────────────────────────────────────────────────

const jogadorSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  posicao: z.string().min(2, 'Posição obrigatória'),
  numeroCamisa: z.coerce.number().int().min(1).max(99),
});
type JogadorForm = z.infer<typeof jogadorSchema>;

const NIVEIS = ['', 'Iniciante', 'Intermediário', 'Avançado', 'Profissional'];
const inputCls = 'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary';

// ─── Page ─────────────────────────────────────────────────────────────────────

const TimeProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { timeId = '' } = useParams();
  const currentUser = authService.getCurrentUser();

  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: '', bairroBase: '', nivel: 2,
    escudoShape: 1, corPrimaria: '#DC2626', corSecundaria: '#111827',
    cep: '', cidade: '', estado: '',
  });
  const [cepLoading, setCepLoading] = useState(false);

  const { data: time, isLoading: isLoadingTime } = useQuery({
    queryKey: ['time-profile', timeId],
    queryFn: () => timeService.getById(timeId),
    enabled: Boolean(timeId),
  });

  const { data: desafiosData, isLoading: isLoadingDesafios } = useQuery({
    queryKey: ['time-profile-desafios', timeId],
    queryFn: () => desafioService.getByTime(timeId, 1, 50),
    enabled: Boolean(timeId),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<JogadorForm>({
    resolver: zodResolver(jogadorSchema),
  });

  const addMutation = useMutation({
    mutationFn: (data: JogadorForm) => jogadorService.create({ ...data, timeId }),
    onSuccess: () => { toast.success('Jogador adicionado.'); reset(); setShowAddPlayer(false); queryClient.invalidateQueries({ queryKey: ['time-profile', timeId] }); },
    onError: () => toast.error('Erro ao adicionar jogador.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jogadorService.delete(id),
    onSuccess: () => { toast.success('Jogador removido.'); queryClient.invalidateQueries({ queryKey: ['time-profile', timeId] }); },
    onError: () => toast.error('Erro ao remover jogador.'),
  });

  const updateMutation = useMutation({
    mutationFn: () => timeService.update(timeId, {
      nome: editForm.nome, bairroBase: editForm.bairroBase, nivel: editForm.nivel,
      escudoShape: editForm.escudoShape, corPrimaria: editForm.corPrimaria, corSecundaria: editForm.corSecundaria,
      cep: editForm.cep || undefined, cidade: editForm.cidade || undefined, estado: editForm.estado || undefined,
    }),
    onSuccess: (updated) => {
      toast.success('Time atualizado.');
      queryClient.invalidateQueries({ queryKey: ['time-profile', timeId] });
      queryClient.invalidateQueries({ queryKey: ['times'] });
      setShowEdit(false);
      if (updated.nome !== time?.nome) navigate(`/times/${timeId}/${slugify(updated.nome)}`, { replace: true });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Erro ao atualizar o time.')),
  });

  const deleteTimeMutation = useMutation({
    mutationFn: () => timeService.delete(timeId),
    onSuccess: () => { toast.success('Time apagado.'); queryClient.invalidateQueries({ queryKey: ['times'] }); navigate('/times'); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Erro ao apagar o time.')),
  });

  async function buscarCep(cep: string) {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) setEditForm((f) => ({ ...f, bairroBase: f.bairroBase || data.bairro || '', cidade: data.localidade || '', estado: data.uf || '' }));
    } finally { setCepLoading(false); }
  }

  function openEdit() {
    if (!time) return;
    setEditForm({
      nome: time.nome, bairroBase: time.bairroBase, nivel: time.nivel,
      escudoShape: time.escudoShape || 1, corPrimaria: time.corPrimaria || '#DC2626',
      corSecundaria: time.corSecundaria || '#111827',
      cep: time.cep || '', cidade: time.cidade || '', estado: time.estado || '',
    });
    setShowEdit(true);
  }

  const isOwner = Boolean(currentUser && time && currentUser.empresaId === time.empresaId);
  const allDesafios = desafiosData?.items ?? [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const proximosJogos = allDesafios
    .filter((d) => new Date(d.dataJogo) >= today && d.status !== DesafioStatus.Cancelado && d.status !== DesafioStatus.Finalizado)
    .sort((a, b) => new Date(a.dataJogo).getTime() - new Date(b.dataJogo).getTime())
    .slice(0, 5);
  const retrospecto = allDesafios
    .filter((d) => d.status === DesafioStatus.Finalizado && d.placarCriador != null)
    .sort((a, b) => new Date(b.dataJogo).getTime() - new Date(a.dataJogo).getTime())
    .slice(0, 8);
  const streak = time ? calcStreak(allDesafios, timeId) : null;
  const badges = time ? calcBadges(allDesafios, timeId) : [];
  const jogadores = time?.jogadores ?? [];

  const streakLabel = streak?.tipo === 'V' ? `${streak.quantidade} vitória${streak.quantidade > 1 ? 's' : ''} seguida${streak.quantidade > 1 ? 's' : ''}`
    : streak?.tipo === 'D' ? `${streak.quantidade} derrota${streak.quantidade > 1 ? 's' : ''} seguida${streak.quantidade > 1 ? 's' : ''}`
    : streak?.tipo === 'E' ? `${streak.quantidade} empate${streak.quantidade > 1 ? 's' : ''} seguido${streak.quantidade > 1 ? 's' : ''}`
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
        <ArrowLeft size={18} /> Voltar
      </button>

      {/* ── Hero ── */}
      {isLoadingTime ? <SkeletonCard /> : time && (
        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(127,29,29,0.18),rgba(8,8,8,0.96))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">

            {/* Crest large */}
            <div className="flex flex-col items-center gap-2">
              <TeamCrest nome={time.nome} shape={time.escudoShape || 1} corPrimaria={time.corPrimaria || '#DC2626'} corSecundaria={time.corSecundaria || '#111827'} size={100} />
              {isOwner && (
                <button onClick={openEdit} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10">
                  <Pencil size={11} /> Editar escudo
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.32em] text-white/60">Página do time</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-white">{time.nome}</h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/70">
                <span className="flex items-center gap-2"><Building2 size={14} />{time.empresaNome}</span>
                <span className="flex items-center gap-2"><MapPin size={14} />{time.bairroBase}{time.cidade ? `, ${time.cidade}` : ''}{time.estado ? `/${time.estado}` : ''}</span>
                <span className="flex items-center gap-2"><Users size={14} />{jogadores.length} jogador{jogadores.length !== 1 ? 'es' : ''}</span>
                {time.nivel > 0 && <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs">{NIVEIS[time.nivel] ?? `Nível ${time.nivel}`}</span>}
              </div>
              {streakLabel && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                  <Zap size={12} /> {streakLabel}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copiado.'); }} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                <Share2 size={16} /> Compartilhar
              </button>
              <button onClick={() => navigate(`/empresas/${time.empresaId}/${slugify(time.empresaNome)}`)} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Ver empresa
              </button>
              {isOwner && (
                <button onClick={openEdit} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  <Pencil size={16} /> Editar time
                </button>
              )}
              {isOwner && (
                <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20">
                  <Trash2 size={16} /> Apagar time
                </button>
              )}
            </div>
          </div>

          {/* Badges */}
          {badges.some((b) => b.earned) && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-5">
              {badges.filter((b) => b.earned).map((b) => (
                <div key={b.label} className="flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-400">
                  {b.icon} {b.label}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Gamificação: conquistas + confrontos diretos ── */}
      {time && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <ConquistasTime timeId={time.id} />
          <RivaisTime timeId={time.id} />
        </div>
      )}

      {/* ── Edit panel ── */}
      {showEdit && time && (
        <section className="mt-6 rounded-[2rem] border border-white/10 bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Editar time</p>
            <button onClick={() => setShowEdit(false)} className="rounded-xl p-2 text-muted-foreground hover:bg-secondary"><X size={16} /></button>
          </div>
          <CrestBuilder nome={editForm.nome} shape={editForm.escudoShape} corPrimaria={editForm.corPrimaria} corSecundaria={editForm.corSecundaria}
            onChange={(field, value) => setEditForm((f) => ({ ...f, [field]: value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Nome do time *</label>
              <input value={editForm.nome} onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))} className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Bairro base *</label>
              <input value={editForm.bairroBase} onChange={(e) => setEditForm((f) => ({ ...f, bairroBase: e.target.value }))} className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">CEP</label>
              <input value={editForm.cep} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 8); setEditForm((f) => ({ ...f, cep: v })); if (v.length === 8) buscarCep(v); }} placeholder="Ex.: 01310100" className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              {cepLoading && <p className="mt-1 text-xs text-muted-foreground">Buscando...</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Cidade</label>
              <input value={editForm.cidade} onChange={(e) => setEditForm((f) => ({ ...f, cidade: e.target.value }))} placeholder="Preenchido pelo CEP" className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Estado</label>
              <input value={editForm.estado} onChange={(e) => setEditForm((f) => ({ ...f, estado: e.target.value }))} maxLength={2} placeholder="SP" className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Nível</label>
              <select value={editForm.nivel} onChange={(e) => setEditForm((f) => ({ ...f, nivel: Number(e.target.value) }))} className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                {NIVEIS.slice(1).map((n, i) => <option key={i + 1} value={i + 1}>{n}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || !editForm.nome.trim() || !editForm.bairroBase.trim()}
            className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50">
            {updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </section>
      )}

      {/* ── Delete confirm ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-[2rem] border border-red-500/30 bg-card p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={22} className="text-red-400 shrink-0" />
              <h2 className="text-lg font-black text-foreground">Apagar time</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Tem certeza? Todos os dados do time — jogadores, histórico de partidas e conquistas — serão removidos permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary">Cancelar</button>
              <button onClick={() => { setShowDeleteConfirm(false); deleteTimeMutation.mutate(); }} disabled={deleteTimeMutation.isPending}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
                {deleteTimeMutation.isPending ? 'Apagando...' : 'Sim, apagar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">

        {/* ── Elenco ── */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Elenco</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Jogadores</h2>
            </div>
            {isOwner && (
              <button onClick={() => setShowAddPlayer((v) => !v)} className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-foreground transition hover:-translate-y-0.5">
                <Plus size={14} /> Adicionar
              </button>
            )}
          </div>

          {showAddPlayer && isOwner && (
            <form onSubmit={handleSubmit((data) => addMutation.mutate(data))} className="mb-4 space-y-3 rounded-3xl border border-white/10 bg-card/80 p-5" noValidate>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Novo jogador</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <input {...register('nome')} placeholder="Nome" className={inputCls} />
                  {errors.nome && <p className="mt-1 text-xs text-red-400">{errors.nome.message}</p>}
                </div>
                <div>
                  <input {...register('posicao')} placeholder="Posição (ex: Goleiro)" className={inputCls} />
                  {errors.posicao && <p className="mt-1 text-xs text-red-400">{errors.posicao.message}</p>}
                </div>
              </div>
              <input {...register('numeroCamisa')} type="number" placeholder="Nº da camisa" className={`${inputCls} w-32`} />
              {errors.numeroCamisa && <p className="mt-1 text-xs text-red-400">Número inválido</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={isSubmitting || addMutation.isPending} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-foreground disabled:opacity-50">
                  {addMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" onClick={() => { setShowAddPlayer(false); reset(); }} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/60">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {isLoadingTime && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            {!isLoadingTime && jogadores.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-8 text-center text-muted-foreground">
                {isOwner ? 'Nenhum jogador cadastrado. Adicione o primeiro.' : 'Nenhum jogador cadastrado.'}
              </div>
            )}
            {jogadores.map((j) => (
              <div key={j.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-card/80 px-4 py-3">
                <Link to={`/jogadores/${j.id}/perfil`} className="flex items-center gap-3 flex-1 hover:opacity-80 transition">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-black text-primary">{j.numeroCamisa}</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{j.nome}</p>
                    <p className="text-xs text-muted-foreground">{j.posicao}</p>
                  </div>
                </Link>
                {isOwner && (
                  <button onClick={() => deleteMutation.mutate(j.id)} disabled={deleteMutation.isPending} className="rounded-xl p-2 text-muted-foreground transition hover:bg-red-500/15 hover:text-red-400 disabled:opacity-40">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Próximos jogos ── */}
        <section>
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Agenda</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Próximos jogos</h2>
          </div>
          <div className="space-y-4">
            {isLoadingDesafios && Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
            {proximosJogos.map((d) => (
              <div key={d.id} className="rounded-3xl border border-white/10 bg-card/80 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{d.empresaCriadora} x {d.empresaDesafiante ?? '—'}</p>
                <h3 className="mt-2 text-xl font-black tracking-tight text-foreground">{d.timeCriador} x {d.timeDesafiante ?? '—'}</h3>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><CalendarDays size={14} />{formatDate(d.dataJogo)} • {formatTime(d.horaJogo)}</span>
                  <span className="flex items-center gap-2"><MapPin size={14} />{d.local}</span>
                </div>
                <span className="mt-2 inline-block rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{getStatusLabel(d.status)}</span>
              </div>
            ))}
            {!isLoadingDesafios && proximosJogos.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-8 text-center text-muted-foreground">Nenhum jogo futuro agendado.</div>
            )}
          </div>
        </section>

        {/* ── Retrospecto ── */}
        <section className="lg:col-span-2">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Histórico</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Retrospecto recente</h2>
          </div>
          <div className="space-y-4">
            {isLoadingDesafios && Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
            {retrospecto.map((d) => {
              const isCriador = d.timeCriadorId === timeId;
              const golsPro = isCriador ? d.placarCriador! : d.placarDesafiante!;
              const golsContra = isCriador ? d.placarDesafiante! : d.placarCriador!;
              const resultado = golsPro > golsContra ? 'V' : golsPro < golsContra ? 'D' : 'E';
              const cor = resultado === 'V' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : resultado === 'D' ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-white/50 border-white/10 bg-white/5';
              return (
                <div key={d.id} className="rounded-3xl border border-white/10 bg-card/80 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{formatDate(d.dataJogo)} • {d.local}</p>
                      <h3 className="mt-2 text-lg font-black tracking-tight text-foreground">{d.timeCriador} {d.placarCriador} x {d.placarDesafiante} {d.timeDesafiante}</h3>
                      {d.gols.length > 0 && (
                        <p className="mt-2 text-sm text-muted-foreground">Gols: {d.gols.map((g) => g.quantidadeGols > 1 ? `${g.nomeAutor} (${g.quantidadeGols})` : g.nomeAutor).join(', ')}</p>
                      )}
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-black ${cor}`}>{resultado}</span>
                  </div>
                </div>
              );
            })}
            {!isLoadingDesafios && retrospecto.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-8 text-center text-muted-foreground">Sem partidas finalizadas ainda.</div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default TimeProfilePage;

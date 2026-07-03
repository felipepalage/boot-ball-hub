import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, X, Users, Calendar, ChevronRight } from 'lucide-react';
import { torneioService, TORNEIO_STATUS, TORNEIO_FORMATO, type Torneio } from '@/services/torneioService';
import { timeService } from '@/services/timeService';
import { authService } from '@/services/authService';
import { TeamCrest } from '@/components/TeamCrest';
import { SkeletonCard } from '@/components/SkeletonCard';
import { toast } from 'sonner';

const inputCls = 'w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary';

const STATUS_COLOR: Record<number, string> = {
  0: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  1: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  2: 'text-white/50 border-white/10 bg-white/5',
  3: 'text-red-400 border-red-500/30 bg-red-500/10',
};

const TorneioCard = ({ t, onClick }: { t: Torneio; onClick: () => void }) => (
  <div onClick={onClick} className="cursor-pointer rounded-[2rem] border border-white/10 bg-card p-5 transition hover:-translate-y-1 hover:border-primary/30">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{t.empresaOrganizadora} • {TORNEIO_FORMATO[t.formato]}</p>
        <h3 className="mt-1 text-xl font-black text-foreground">{t.nome}</h3>
        {t.descricao && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.descricao}</p>}
      </div>
      <span className={`ml-2 shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${STATUS_COLOR[t.status]}`}>
        {TORNEIO_STATUS[t.status]}
      </span>
    </div>
    <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
      <span className="flex items-center gap-1"><Users size={14} />{t.totalInscritos} time{t.totalInscritos !== 1 ? 's' : ''}</span>
      <span className="flex items-center gap-1"><Calendar size={14} />{new Date(t.dataInicio).toLocaleDateString('pt-BR')}</span>
    </div>
    {t.inscricoes.length > 0 && (
      <div className="mt-4 flex flex-wrap gap-2">
        {t.inscricoes.slice(0, 8).map((i) => (
          <TeamCrest key={i.timeId} nome={i.nomeTime} shape={i.escudoShape} corPrimaria={i.corPrimaria} corSecundaria={i.corSecundaria} size={28} />
        ))}
        {t.inscricoes.length > 8 && <span className="text-xs text-muted-foreground self-center">+{t.inscricoes.length - 8}</span>}
      </div>
    )}
  </div>
);

const TorneiosPage = () => {
  const queryClient = useQueryClient();
  const currentUser = authService.getCurrentUser();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ nome: '', descricao: '', formato: 0, dataInicio: '', dataFim: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['torneios'],
    queryFn: () => torneioService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: () => torneioService.create({
      nome: form.nome, descricao: form.descricao || undefined, formato: form.formato,
      dataInicio: form.dataInicio, dataFim: form.dataFim || undefined,
    }),
    onSuccess: (t) => {
      toast.success('Torneio criado.');
      setShowCreate(false);
      queryClient.invalidateQueries({ queryKey: ['torneios'] });
      navigate(`/torneios/${t.id}`);
    },
    onError: () => toast.error('Erro ao criar torneio.'),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6">
      <div className="mb-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(127,29,29,0.22),rgba(8,8,8,0.95))] p-6">
        <p className="text-xs uppercase tracking-[0.34em] text-red-200/80">Competições</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Torneios</h1>
        <p className="mt-2 text-base text-white/60">Crie e participe de torneios corporativos.</p>
        {currentUser && (
          <button onClick={() => setShowCreate(true)} className="mt-4 flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-white">
            <Plus size={16} /> Criar torneio
          </button>
        )}
      </div>

      {showCreate && (
        <div className="mb-6 rounded-[2rem] border border-white/10 bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-[0.2em]">Novo torneio</p>
            <button onClick={() => setShowCreate(false)} className="rounded-xl p-2 text-muted-foreground hover:bg-secondary"><X size={16} /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">Nome *</label>
              <input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Copa Corporativa 2026" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">Descrição</label>
              <textarea value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} rows={2} className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Formato</label>
              <select value={form.formato} onChange={(e) => setForm((f) => ({ ...f, formato: Number(e.target.value) }))} className={inputCls}>
                {TORNEIO_FORMATO.map((f, i) => <option key={i} value={i}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Data início *</label>
              <input type="date" value={form.dataInicio} onChange={(e) => setForm((f) => ({ ...f, dataInicio: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Data fim</label>
              <input type="date" value={form.dataFim} onChange={(e) => setForm((f) => ({ ...f, dataFim: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.nome || !form.dataInicio}
            className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white disabled:opacity-50">
            {createMutation.isPending ? 'Criando...' : 'Criar torneio'}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        {!isLoading && (data?.items.length ?? 0) === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-10 text-center text-muted-foreground">
            Nenhum torneio criado ainda.
          </div>
        )}
        {data?.items.map((t) => (
          <TorneioCard key={t.id} t={t} onClick={() => navigate(`/torneios/${t.id}`)} />
        ))}
      </div>
    </div>
  );
};

export default TorneiosPage;

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Star, Users, Plus, X, Search, Sun, CheckCircle, Loader2 } from 'lucide-react';
import { quadraService, TIPO_GRAMA, type CreateQuadraPayload } from '@/services/quadraService';
import { authService } from '@/services/authService';
import { SkeletonCard } from '@/components/SkeletonCard';
import { toast } from 'sonner';

const inputCls = 'w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary';

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)}>
        <Star size={20} className={s <= value ? 'fill-amber-400 text-amber-400' : 'text-white/20'} />
      </button>
    ))}
  </div>
);

const formatCep = (cep: string) =>
  cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2');

interface QuadraItem {
  id: string; nome: string; endereco: string; bairro: string; cidade: string;
  estado?: string; cep?: string; tipoGrama: number; iluminacao: boolean;
  vestiario: boolean; capacidade?: number; notaMedia: number; totalAvaliacoes: number;
}

const QuadraCard = ({ quadra, onClick }: { quadra: QuadraItem; onClick: () => void }) => (
  <div onClick={onClick} className="cursor-pointer rounded-[2rem] border border-white/10 bg-card p-5 transition hover:-translate-y-1 hover:border-primary/30">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          {quadra.bairro} • {quadra.cidade}
          {quadra.cep && <span className="ml-1 text-white/40">· CEP {formatCep(quadra.cep)}</span>}
        </p>
        <h3 className="mt-1 text-xl font-black text-foreground">{quadra.nome}</h3>
        {quadra.endereco && <p className="mt-1 text-sm text-muted-foreground">{quadra.endereco}</p>}
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-foreground">{quadra.notaMedia > 0 ? quadra.notaMedia.toFixed(1) : '—'}</span>
        </div>
        <span className="text-xs text-muted-foreground">{quadra.totalAvaliacoes} avaliações</span>
      </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-muted-foreground">
        {TIPO_GRAMA[quadra.tipoGrama] ?? 'Outro'}
      </span>
      {quadra.iluminacao && (
        <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
          <Sun size={11} /> Iluminada
        </span>
      )}
      {quadra.vestiario && (
        <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <CheckCircle size={11} /> Vestiário
        </span>
      )}
      {quadra.capacidade && (
        <span className="flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground">
          <Users size={11} /> {quadra.capacidade} jogadores
        </span>
      )}
    </div>
  </div>
);

const defaultForm: CreateQuadraPayload = {
  nome: '', endereco: '', bairro: '', cidade: '', estado: '', cep: '',
  capacidade: undefined, tipoGrama: 0, iluminacao: false, vestiario: false,
};

const QuadrasPage = () => {
  const queryClient = useQueryClient();
  const currentUser = authService.getCurrentUser();
  const [bairro, setBairro] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAvaliarId, setShowAvaliarId] = useState<string | null>(null);
  const [avNota, setAvNota] = useState(5);
  const [avComentario, setAvComentario] = useState('');
  const [form, setForm] = useState<CreateQuadraPayload>(defaultForm);
  const [cepLoading, setCepLoading] = useState(false);

  const buscarCep = async (rawCep: string) => {
    const clean = rawCep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const json = await res.json();
      if (json.erro) { toast.error('CEP não encontrado.'); return; }
      setForm((f) => ({
        ...f,
        cep: clean,
        endereco: json.logradouro ?? f.endereco,
        bairro: json.bairro ?? f.bairro,
        cidade: json.localidade ?? f.cidade,
        estado: json.uf ?? f.estado,
      }));
    } catch {
      toast.error('Erro ao consultar CEP.');
    } finally {
      setCepLoading(false);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['quadras', bairro],
    queryFn: () => quadraService.getAll(bairro || undefined),
  });

  const createMutation = useMutation({
    mutationFn: () => quadraService.create(form),
    onSuccess: () => {
      toast.success('Quadra cadastrada.');
      setShowCreate(false);
      setForm(defaultForm);
      queryClient.invalidateQueries({ queryKey: ['quadras'] });
    },
    onError: () => toast.error('Erro ao cadastrar quadra.'),
  });

  const avaliarMutation = useMutation({
    mutationFn: (id: string) => quadraService.avaliar(id, avNota, avComentario || undefined),
    onSuccess: () => {
      toast.success('Avaliação enviada.');
      setShowAvaliarId(null);
      setAvNota(5);
      setAvComentario('');
      queryClient.invalidateQueries({ queryKey: ['quadras'] });
    },
    onError: () => toast.error('Erro ao avaliar.'),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6">
      <div className="mb-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(127,29,29,0.22),rgba(8,8,8,0.95))] p-6">
        <p className="text-xs uppercase tracking-[0.34em] text-red-200/80">Infraestrutura</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Quadras</h1>
        <p className="mt-2 text-base text-white/60">Encontre e avalie as melhores quadras da cidade.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <Search size={16} className="text-white/40" />
            <input
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Filtrar por bairro ou cidade..."
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
          </div>
          {currentUser && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
            >
              <Plus size={16} /> Cadastrar
            </button>
          )}
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-6 rounded-[2rem] border border-white/10 bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-[0.2em]">Nova quadra</p>
            <button onClick={() => setShowCreate(false)} className="rounded-xl p-2 text-muted-foreground hover:bg-secondary">
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">Nome *</label>
              <input
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Arena Vila Olímpia"
                className={inputCls}
              />
            </div>

            {/* CEP with ViaCEP */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">CEP</label>
              <div className="flex gap-2">
                <input
                  value={form.cep ?? ''}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                    setForm((f) => ({ ...f, cep: v }));
                  }}
                  placeholder="Ex: 04538133"
                  maxLength={9}
                  className={`${inputCls} flex-1`}
                  onBlur={(e) => buscarCep(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => buscarCep(form.cep ?? '')}
                  disabled={cepLoading}
                  className="flex items-center gap-1.5 rounded-2xl border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary/80 disabled:opacity-50"
                >
                  {cepLoading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                  {cepLoading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Busque pelo CEP para preencher o endereço automaticamente.</p>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">Endereço</label>
              <input
                value={form.endereco}
                onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))}
                placeholder="Rua, número"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Bairro *</label>
              <input
                value={form.bairro}
                onChange={(e) => setForm((f) => ({ ...f, bairro: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Cidade *</label>
              <input
                value={form.cidade}
                onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Estado</label>
              <input
                value={form.estado ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
                maxLength={2}
                placeholder="SP"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Capacidade</label>
              <input
                type="number"
                min={1}
                value={form.capacidade ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, capacidade: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="Nº de jogadores"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Tipo de grama</label>
              <select
                value={form.tipoGrama}
                onChange={(e) => setForm((f) => ({ ...f, tipoGrama: Number(e.target.value) }))}
                className={inputCls}
              >
                {TIPO_GRAMA.map((t, i) => <option key={i} value={i}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-4 sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.iluminacao}
                  onChange={(e) => setForm((f) => ({ ...f, iluminacao: e.target.checked }))}
                  className="accent-primary"
                />
                Iluminada
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.vestiario}
                  onChange={(e) => setForm((f) => ({ ...f, vestiario: e.target.checked }))}
                  className="accent-primary"
                />
                Vestiário
              </label>
            </div>
          </div>
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !form.nome || !form.bairro || !form.cidade}
            className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white disabled:opacity-50"
          >
            {createMutation.isPending ? 'Salvando...' : 'Cadastrar quadra'}
          </button>
        </div>
      )}

      {/* Avaliação modal */}
      {showAvaliarId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-[2rem] border border-white/10 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-foreground">Avaliar quadra</p>
              <button onClick={() => setShowAvaliarId(null)} className="rounded-xl p-2 text-muted-foreground hover:bg-secondary">
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="mb-2 block text-sm text-muted-foreground">Nota</label>
              <StarRating value={avNota} onChange={setAvNota} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Comentário (opcional)</label>
              <textarea
                value={avComentario}
                onChange={(e) => setAvComentario(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                placeholder="Conte como foi a experiência..."
              />
            </div>
            <button
              onClick={() => avaliarMutation.mutate(showAvaliarId)}
              disabled={avaliarMutation.isPending}
              className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {avaliarMutation.isPending ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        {!isLoading && (data?.items.length ?? 0) === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-10 text-center text-muted-foreground">
            Nenhuma quadra cadastrada ainda.
          </div>
        )}
        {data?.items.map((q) => (
          <div key={q.id}>
            <QuadraCard quadra={q} onClick={() => {}} />
            {currentUser && (
              <div className="mt-1 flex justify-end px-2">
                <button
                  onClick={() => setShowAvaliarId(q.id)}
                  className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  Avaliar esta quadra
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuadrasPage;

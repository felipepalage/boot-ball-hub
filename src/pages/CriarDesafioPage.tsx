import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { authStorage } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/api-error';
import { authService } from '@/services/authService';
import { desafioService } from '@/services/desafioService';
import { empresaService } from '@/services/empresaService';
import { timeService } from '@/services/timeService';

const inputCls = 'w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary';
const labelCls = 'mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground';

const CriarDesafioPage = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [cepLoading, setCepLoading] = useState(false);
  const [form, setForm] = useState({
    timeCriadorId: authStorage.getActiveTeamId() ?? '',
    timeConvidadoId: '',
    dataJogo: '',
    horaJogo: '',
    cep: '',
    bairro: '',
    cidade: '',
    estado: '',
    local: '',
  });

  const { data: minhaEmpresa } = useQuery({
    queryKey: ['minha-empresa', currentUser?.empresaId],
    queryFn: () => empresaService.getById(currentUser!.empresaId),
    enabled: Boolean(currentUser?.empresaId),
  });

  const { data: todosTimes } = useQuery({
    queryKey: ['times-selecao-convite'],
    queryFn: () => timeService.getAll(1, 200),
  });

  const meusTimes = useMemo(() => minhaEmpresa?.times ?? [], [minhaEmpresa?.times]);
  const timesConvidados = useMemo(
    () => (todosTimes?.items ?? []).filter((time) => time.empresaId !== currentUser?.empresaId),
    [todosTimes?.items, currentUser?.empresaId],
  );

  useEffect(() => {
    if (!meusTimes.length || form.timeCriadorId) return;
    const defaultTeamId = authStorage.getActiveTeamId() ?? meusTimes[0].id;
    setForm((prev) => ({ ...prev, timeCriadorId: defaultTeamId }));
    authStorage.setActiveTeamId(defaultTeamId);
  }, [meusTimes, form.timeCriadorId]);

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
        bairro: f.bairro || data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      }));
    } catch {
      toast.error('Erro ao buscar CEP.');
    } finally {
      setCepLoading(false);
    }
  }

  const bairroCompleto = [form.bairro, form.cidade, form.estado].filter(Boolean).join(', ');

  const mutation = useMutation({
    mutationFn: () =>
      desafioService.create({
        timeCriadorId: form.timeCriadorId,
        timeConvidadoId: form.timeConvidadoId,
        dataJogo: form.dataJogo,
        horaJogo: `${form.horaJogo}:00`,
        bairro: bairroCompleto || form.bairro,
        local: form.local,
        nivel: 3,
      }),
    onSuccess: () => {
      toast.success('Convite enviado com sucesso.');
      navigate('/');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Nao foi possivel criar o convite.'));
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <div className="rounded-[2rem] border border-white/10 bg-card/75 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Novo amistoso</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">Enviar convite direto</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Escolha um time da sua empresa, defina o adversario e envie um convite fechado. Assim que a equipe convidada aceitar, o jogo sai do estado pendente e segue so entre voces.
        </p>

        {meusTimes.length === 0 && minhaEmpresa && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-bold text-amber-300">Nenhum time cadastrado</p>
              <p className="mt-1 text-sm text-amber-200/70">
                Sua empresa ainda não tem times. Vá em{' '}
                <a href="/times" className="underline hover:text-amber-200">Times</a>{' '}
                e crie um time antes de enviar um convite.
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}
          className="mt-8 grid gap-5 md:grid-cols-2"
        >
          {/* Times */}
          <div>
            <label className={labelCls}>Seu time</label>
            <select
              value={form.timeCriadorId}
              onChange={(e) => { setForm((p) => ({ ...p, timeCriadorId: e.target.value })); authStorage.setActiveTeamId(e.target.value); }}
              required
              className={inputCls}
            >
              <option value="">Selecione um time</option>
              {meusTimes.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Time convidado</label>
            <select
              value={form.timeConvidadoId}
              onChange={(e) => setForm((p) => ({ ...p, timeConvidadoId: e.target.value }))}
              required
              className={inputCls}
            >
              <option value="">Selecione o adversario</option>
              {timesConvidados.map((t) => <option key={t.id} value={t.id}>{t.nome} • {t.empresaNome}</option>)}
            </select>
          </div>

          {/* Data + Hora 24h */}
          <div>
            <label className={labelCls}>Data</label>
            <input
              type="date"
              value={form.dataJogo}
              onChange={(e) => setForm((p) => ({ ...p, dataJogo: e.target.value }))}
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Hora (formato 24h)</label>
            <input
              type="text"
              value={form.horaJogo}
              onChange={(e) => {
                // allow only digits and colon, max HH:mm
                let v = e.target.value.replace(/[^\d:]/g, '');
                if (v.length === 2 && !v.includes(':') && form.horaJogo.length === 1) v += ':';
                if (v.length > 5) v = v.slice(0, 5);
                setForm((p) => ({ ...p, horaJogo: v }));
              }}
              placeholder="Ex.: 20:00"
              pattern="^([01]\d|2[0-3]):[0-5]\d$"
              required
              maxLength={5}
              className={inputCls}
            />
          </div>

          {/* Localização via CEP */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={15} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Localização do jogo</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-background/40 p-4 grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">CEP</label>
                <input
                  value={form.cep}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                    setForm((p) => ({ ...p, cep: v }));
                    if (v.length === 8) buscarCep(v);
                  }}
                  placeholder="Ex.: 01310100"
                  maxLength={8}
                  className={inputCls}
                />
                {cepLoading && <p className="mt-1 text-xs text-muted-foreground">Buscando...</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Cidade</label>
                <input
                  value={form.cidade}
                  onChange={(e) => setForm((p) => ({ ...p, cidade: e.target.value }))}
                  placeholder="Preenchido pelo CEP"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Bairro</label>
                <input
                  value={form.bairro}
                  onChange={(e) => setForm((p) => ({ ...p, bairro: e.target.value }))}
                  placeholder="Ex.: Pinheiros"
                  required
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>Local exato</label>
            <input
              value={form.local}
              onChange={(e) => setForm((p) => ({ ...p, local: e.target.value }))}
              placeholder="Nome do campo, arena ou quadra"
              required
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending || meusTimes.length === 0}
            className="md:col-span-2 mt-2 rounded-2xl bg-primary px-4 py-4 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? 'Enviando convite...' : 'Enviar convite'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CriarDesafioPage;

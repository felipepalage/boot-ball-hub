import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Clock3, Users, CheckCircle2 } from 'lucide-react';
import logo from '@/assets/logo.png';
import { rachaoService } from '@/services/rachaoService';
import { getApiErrorMessage } from '@/lib/api-error';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const fmtHorario = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const PublicoRachaoPage = () => {
  const { token = '' } = useParams();
  const queryClient = useQueryClient();
  const [nome, setNome] = useState('');
  useDocumentTitle('Confirmar presença');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['rachao-publico', token],
    queryFn: () => rachaoService.getPublico(token),
    enabled: !!token,
    retry: false,
    refetchInterval: 20000,
  });

  const confirmar = useMutation({
    mutationFn: () => rachaoService.confirmar(token, nome.trim()),
    onSuccess: (p) => {
      queryClient.setQueryData(['rachao-publico', token], p);
      setNome('');
      toast.success('Presença confirmada! ⚽');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Não foi possível confirmar.')),
  });

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.18),transparent_30%),linear-gradient(180deg,#09090b_0%,#111827_60%,#050505_100%)] px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo} alt="Boleiroffice" className="h-16 w-auto" />
          {data && <p className="mt-3 text-xs uppercase tracking-[0.3em] text-red-200/80">{data.empresaNome}</p>}
          <h1 className="mt-1 text-3xl font-black text-white">Rachão do dia</h1>
          {data && (
            <p className="mt-2 flex items-center gap-2 text-sm text-white/60">
              <Clock3 size={14} /> {fmtHorario(data.horarioEvento)}
            </p>
          )}
        </div>

        {isLoading && <p className="text-center text-white/50">Carregando…</p>}
        {isError && (
          <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-white/50">
            Link inválido ou expirado.
          </div>
        )}

        {data && !data.sorteioFeito && (
          <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">Confirme sua presença</p>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (nome.trim().length >= 2) confirmar.mutate();
              }}
            >
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={confirmar.isPending || nome.trim().length < 2}
                className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Vou!
              </button>
            </form>

            <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-widest text-white/40">
              <Users size={13} /> Confirmados ({data.confirmados.length})
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.confirmados.length === 0 && <p className="text-sm text-white/40">Seja o primeiro a confirmar!</p>}
              {data.confirmados.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white">
                  <CheckCircle2 size={13} className="text-emerald-400" /> {c}
                </span>
              ))}
            </div>
            <p className="mt-5 text-center text-xs text-white/35">Os times são sorteados automaticamente ~2h antes do jogo.</p>
          </div>
        )}

        {data && data.sorteioFeito && (
          <div className="space-y-4">
            <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">Times sorteados!</p>
            {data.times.map((t) => (
              <div key={t.nome} className="rounded-[2rem] border border-white/10 bg-black/30 p-5">
                <h2 className="mb-3 text-lg font-black text-white">{t.nome}</h2>
                <ul className="space-y-1.5">
                  {t.jogadores.map((j, i) => (
                    <li key={i} className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80">{j}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicoRachaoPage;

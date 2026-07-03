import { useEffect, useMemo, useState } from 'react';
import type { Desafio } from '@/types';
import { DesafioStatus } from '@/types';
import { CalendarDays, Clock3, Swords, Trophy } from 'lucide-react';
import { formatDate, formatTime, getStatusClasses, getStatusLabel } from '@/lib/formatters';
import { PresencaPanel } from '@/components/PresencaPanel';
import { MvpVotingModal } from '@/components/MvpVotingModal';
import { ChatDesafio } from '@/components/ChatDesafio';

interface MyChallengeCardProps {
  desafio: Desafio;
  currentTeamId: string;
  loading?: boolean;
  onRegistrarResultado: (desafioId: string, placarCriador: number, placarDesafiante: number) => void;
  onConfirmarResultado: (desafioId: string, placarCriador: number, placarDesafiante: number) => void;
  onRegistrarArtilheiros: (desafioId: string, payload: { golsCriador: Array<{ nomeAutor: string; quantidadeGols: number }>; golsDesafiante: Array<{ nomeAutor: string; quantidadeGols: number }> }) => void;
  onCancelarDesafio: (desafioId: string) => void;
}

const parseScorers = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [nomeAutor, quantidade] = line.split(':');
      return {
        nomeAutor: (nomeAutor ?? '').trim(),
        quantidadeGols: Number((quantidade ?? '1').trim()),
      };
    })
    .filter((item) => item.nomeAutor && Number.isFinite(item.quantidadeGols) && item.quantidadeGols > 0);

const toTextareaValue = (items: Desafio['gols'], timeId?: string | null) =>
  items
    .filter((item) => item.timeId === timeId)
    .map((item) => `${item.nomeAutor}:${item.quantidadeGols}`)
    .join('\n');

export const MyChallengeCard = ({
  desafio,
  currentTeamId,
  loading = false,
  onRegistrarResultado,
  onConfirmarResultado,
  onRegistrarArtilheiros,
  onCancelarDesafio,
}: MyChallengeCardProps) => {
  const [placarCriador, setPlacarCriador] = useState('');
  const [placarDesafiante, setPlacarDesafiante] = useState('');
  const [golsCriador, setGolsCriador] = useState('');
  const [golsDesafiante, setGolsDesafiante] = useState('');
  const [showMvp, setShowMvp] = useState(false);

  useEffect(() => {
    const nextCriador = desafio.placarCriadorProposto ?? desafio.placarCriador ?? '';
    const nextDesafiante = desafio.placarDesafianteProposto ?? desafio.placarDesafiante ?? '';

    setPlacarCriador(nextCriador === '' ? '' : String(nextCriador));
    setPlacarDesafiante(nextDesafiante === '' ? '' : String(nextDesafiante));
    setGolsCriador(toTextareaValue(desafio.gols, desafio.timeCriadorId));
    setGolsDesafiante(toTextareaValue(desafio.gols, desafio.timeDesafianteId));
  }, [desafio]);

  const canConfirm =
    desafio.status === DesafioStatus.ResultadoPendente &&
    desafio.resultadoPropostoPorTimeId !== currentTeamId;

  const canPropose =
    desafio.status === DesafioStatus.Aceito ||
    desafio.status === DesafioStatus.ResultadoPendente;

  const canRegisterScorers = desafio.status === DesafioStatus.Finalizado;
  const canCancel = desafio.status === DesafioStatus.Aberto || desafio.status === DesafioStatus.Aceito;

  const placarPendente = useMemo(() => ({
    criador: desafio.placarCriadorProposto ?? 0,
    desafiante: desafio.placarDesafianteProposto ?? 0,
  }), [desafio]);

  const handleRegistrar = () => {
    const criador = Number(placarCriador);
    const desafiante = Number(placarDesafiante);

    if (Number.isNaN(criador) || Number.isNaN(desafiante)) {
      return;
    }

    onRegistrarResultado(desafio.id, criador, desafiante);
  };

  const handleScorers = () => {
    onRegistrarArtilheiros(desafio.id, {
      golsCriador: parseScorers(golsCriador),
      golsDesafiante: parseScorers(golsDesafiante),
    });
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-card via-card to-card/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            <Swords size={12} />
            <span>{desafio.bairro}</span>
          </div>
          <h3 className="mt-3 text-xl font-black tracking-tight text-foreground">
            {desafio.timeCriador} x {desafio.timeDesafiante ?? 'Convite em definicao'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{desafio.local}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${getStatusClasses(desafio.status)}`}>
          {getStatusLabel(desafio.status)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} />
          <span>{formatDate(desafio.dataJogo)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 size={14} />
          <span>{formatTime(desafio.horaJogo)}</span>
        </div>
      </div>

      {desafio.status === DesafioStatus.Aberto && (
        <div className="mt-5 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-sm text-sky-100">
          Convite enviado e aguardando a confirmacao da equipe convidada.
        </div>
      )}

      {desafio.status === DesafioStatus.Cancelado && (
        <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
          Esse desafio foi cancelado e saiu da agenda competitiva.
        </div>
      )}

      {desafio.status === DesafioStatus.Finalizado && (
        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">Resultado confirmado</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-foreground">
            {desafio.placarCriador} x {desafio.placarDesafiante}
          </p>
          <button
            onClick={() => setShowMvp(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs font-bold text-yellow-300 transition hover:bg-yellow-500/20"
          >
            <Trophy size={12} />
            Votar no MVP
          </button>
        </div>
      )}
      {showMvp && (
        <MvpVotingModal
          desafioId={desafio.id}
          timeCriador={desafio.timeCriador}
          timeDesafiante={desafio.timeDesafiante ?? ''}
          onClose={() => setShowMvp(false)}
        />
      )}

      {desafio.status === DesafioStatus.ResultadoPendente && (
        <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-300">Resultado pendente de confirmacao</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-foreground">
            {placarPendente.criador} x {placarPendente.desafiante}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Proposto por {desafio.resultadoPropostoPorTime ?? 'uma das equipes'}.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Criador: {desafio.resultadoConfirmadoPeloCriador ? 'confirmou' : 'aguardando'} • Desafiante: {desafio.resultadoConfirmadoPeloDesafiante ? 'confirmou' : 'aguardando'}
          </p>
        </div>
      )}

      {canPropose && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-secondary/60 p-4">
          <p className="text-sm font-semibold text-foreground">Registrar ou ajustar placar</p>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={placarCriador}
              onChange={(event) => setPlacarCriador(event.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-center text-lg font-black text-foreground outline-none transition focus:border-primary"
            />
            <span className="text-lg font-black text-muted-foreground">x</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={placarDesafiante}
              onChange={(event) => setPlacarDesafiante(event.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-center text-lg font-black text-foreground outline-none transition focus:border-primary"
            />
          </div>
          <button
            onClick={handleRegistrar}
            disabled={loading || placarCriador === '' || placarDesafiante === ''}
            className="mt-4 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Salvando...' : desafio.status === DesafioStatus.ResultadoPendente ? 'Atualizar proposta' : 'Enviar resultado'}
          </button>
        </div>
      )}

      {canConfirm && (
        <button
          onClick={() => onConfirmarResultado(desafio.id, placarPendente.criador, placarPendente.desafiante)}
          disabled={loading}
          className="mt-4 w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/12 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-emerald-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Confirmando...' : 'Concordar com o placar'}
        </button>
      )}

      {canRegisterScorers && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-secondary/50 p-4">
          <p className="text-sm font-semibold text-foreground">Artilheiros da partida</p>
          <p className="mt-1 text-xs text-muted-foreground">Use uma linha por atleta no formato `Nome:quantidade`.</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">{desafio.timeCriador}</label>
              <textarea value={golsCriador} onChange={(event) => setGolsCriador(event.target.value)} rows={4} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">{desafio.timeDesafiante}</label>
              <textarea value={golsDesafiante} onChange={(event) => setGolsDesafiante(event.target.value)} rows={4} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary" />
            </div>
          </div>
          <button onClick={handleScorers} disabled={loading} className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-foreground transition hover:bg-secondary disabled:opacity-50">
            {loading ? 'Salvando artilheiros...' : 'Salvar artilheiros'}
          </button>
        </div>
      )}

      {(desafio.status === DesafioStatus.Aceito || desafio.status === DesafioStatus.ResultadoPendente) && (
        <PresencaPanel desafioId={desafio.id} meuTimeId={currentTeamId} />
      )}

      {canCancel && (
        <button
          onClick={() => onCancelarDesafio(desafio.id)}
          disabled={loading}
          className="mt-4 w-full rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-rose-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Processando...' : 'Cancelar desafio'}
        </button>
      )}

      <ChatDesafio desafioId={desafio.id} />
    </div>
  );
};

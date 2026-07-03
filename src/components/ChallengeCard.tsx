import type { Desafio } from '@/types';
import { Calendar, Clock3, MapPin } from 'lucide-react';
import { formatDate, formatTime, getStatusClasses, getStatusLabel } from '@/lib/formatters';

interface ChallengeCardProps {
  desafio: Desafio;
  onAceitar?: (id: string) => void;
  loading?: boolean;
  disabled?: boolean;
  actionLabel?: string;
}

export const ChallengeCard = ({
  desafio,
  onAceitar,
  loading = false,
  disabled = false,
  actionLabel = 'Aceitar desafio',
}: ChallengeCardProps) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-card/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{desafio.empresaCriadora}</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-foreground">{desafio.timeCriador}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${getStatusClasses(desafio.status)}`}>
          {getStatusLabel(desafio.status)}
        </span>
      </div>

      <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <MapPin size={14} />
          <span>{desafio.bairro}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>{formatDate(desafio.dataJogo)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 size={14} />
          <span>{formatTime(desafio.horaJogo)}</span>
        </div>
      </div>

      <div className="mt-4">
        <p className="font-semibold text-foreground">{desafio.local}</p>
      </div>

      {onAceitar && (
        <button
          onClick={() => onAceitar(desafio.id)}
          disabled={loading || disabled}
          className="mt-5 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition-transform duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Processando...' : actionLabel}
        </button>
      )}
    </div>
  );
};

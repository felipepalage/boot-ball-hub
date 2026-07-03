import type { Time } from '@/types';
import { Building2, MapPin } from 'lucide-react';
import { TeamCrest } from '@/components/TeamCrest';

interface TeamCardProps {
  time: Time;
  onAbrirPerfil?: () => void;
}

export const TeamCard = ({ time, onAbrirPerfil }: TeamCardProps) => (
  <div className="rounded-[2rem] border border-white/10 bg-card/80 p-5 shadow-[0_16px_42px_rgba(0,0,0,0.18)]">
    <div className="flex items-center gap-4">
      <TeamCrest
        nome={time.nome}
        shape={time.escudoShape || 1}
        corPrimaria={time.corPrimaria || '#DC2626'}
        corSecundaria={time.corSecundaria || '#111827'}
        size={64}
      />
      <div className="flex-1">
        <h3 className="text-xl font-black tracking-tight text-foreground">{time.nome}</h3>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Building2 size={13} />{time.empresaNome}</span>
          <span className="flex items-center gap-1"><MapPin size={13} />{time.bairroBase}</span>
        </div>
      </div>
    </div>

    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <span>Base em {time.bairroBase}{time.cidade ? `, ${time.cidade}${time.estado ? `/${time.estado}` : ''}` : ''}</span>
      {onAbrirPerfil && (
        <button onClick={onAbrirPerfil} className="rounded-2xl border border-white/10 px-4 py-2 font-semibold text-foreground transition hover:bg-secondary">
          Ver pagina do time
        </button>
      )}
    </div>
  </div>
);

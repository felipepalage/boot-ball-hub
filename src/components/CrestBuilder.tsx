import { TeamCrest } from './TeamCrest';

interface CrestBuilderProps {
  nome: string;
  shape: number;
  corPrimaria: string;
  corSecundaria: string;
  onChange: (field: 'escudoShape' | 'corPrimaria' | 'corSecundaria', value: string | number) => void;
}

const SHAPES = [1, 2, 3, 4, 5, 6];

const PALETA_PRIMARIA = [
  '#DC2626', '#EA580C', '#D97706', '#16A34A',
  '#0284C7', '#7C3AED', '#DB2777', '#0F172A',
];
const PALETA_SECUNDARIA = [
  '#111827', '#1E293B', '#FFFFFF', '#F5F5F5',
  '#FEF9C3', '#DCFCE7', '#DBEAFE', '#EDE9FE',
];

export function CrestBuilder({ nome, shape, corPrimaria, corSecundaria, onChange }: CrestBuilderProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-background/60 p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Escudo do time</p>
      <div className="flex flex-wrap gap-6">
        {/* preview */}
        <div className="flex flex-col items-center gap-2">
          <TeamCrest nome={nome || 'TM'} shape={shape} corPrimaria={corPrimaria} corSecundaria={corSecundaria} size={80} />
          <span className="text-xs text-muted-foreground">Preview</span>
        </div>

        <div className="flex flex-1 flex-col gap-4 min-w-[200px]">
          {/* shape selector */}
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Formato do escudo</p>
            <div className="flex flex-wrap gap-2">
              {SHAPES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange('escudoShape', s)}
                  className={`rounded-xl p-1 transition ${shape === s ? 'ring-2 ring-primary' : 'opacity-60 hover:opacity-100'}`}
                >
                  <TeamCrest nome={nome || 'TM'} shape={s} corPrimaria={corPrimaria} corSecundaria={corSecundaria} size={32} />
                </button>
              ))}
            </div>
          </div>

          {/* primary color */}
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Cor primária</p>
            <div className="flex flex-wrap gap-2">
              {PALETA_PRIMARIA.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange('corPrimaria', c)}
                  style={{ background: c }}
                  className={`h-7 w-7 rounded-full border-2 transition ${corPrimaria === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                />
              ))}
              <input
                type="color"
                value={corPrimaria}
                onChange={(e) => onChange('corPrimaria', e.target.value)}
                className="h-7 w-7 cursor-pointer rounded-full border-2 border-transparent bg-transparent"
                title="Cor personalizada"
              />
            </div>
          </div>

          {/* secondary color */}
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Cor secundária</p>
            <div className="flex flex-wrap gap-2">
              {PALETA_SECUNDARIA.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange('corSecundaria', c)}
                  style={{ background: c, border: c === '#FFFFFF' || c === '#F5F5F5' ? '1px solid #444' : 'none' }}
                  className={`h-7 w-7 rounded-full border-2 transition ${corSecundaria === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                />
              ))}
              <input
                type="color"
                value={corSecundaria}
                onChange={(e) => onChange('corSecundaria', e.target.value)}
                className="h-7 w-7 cursor-pointer rounded-full border-2 border-transparent bg-transparent"
                title="Cor personalizada"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

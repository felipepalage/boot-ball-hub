interface TeamCrestProps {
  nome: string;
  shape?: number;
  corPrimaria?: string;
  corSecundaria?: string;
  size?: number;
  className?: string;
}

function getInitials(nome: string): string {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// 6 shield shapes as SVG path clip polygons (viewBox 0 0 100 110)
const SHAPES: Record<number, string> = {
  1: 'M50,5 L90,20 L90,65 Q90,95 50,108 Q10,95 10,65 L10,20 Z',
  2: 'M50,5 L88,18 L95,60 Q90,95 50,108 Q10,95 5,60 L12,18 Z',
  3: 'M10,5 L90,5 L90,65 Q90,95 50,108 Q10,95 10,65 Z',
  4: 'M50,5 L85,25 L85,70 Q75,95 50,108 Q25,95 15,70 L15,25 Z',
  5: 'M50,5 L90,30 L80,80 Q65,100 50,108 Q35,100 20,80 L10,30 Z',
  6: 'M15,5 L85,5 L95,55 Q85,95 50,108 Q15,95 5,55 Z',
};

export function TeamCrest({ nome, shape = 1, corPrimaria = '#DC2626', corSecundaria = '#111827', size = 48, className = '' }: TeamCrestProps) {
  const path = SHAPES[shape] ?? SHAPES[1];
  const initials = getInitials(nome);
  const fontSize = size * 0.28;
  const clipId = `crest-clip-${shape}-${corPrimaria.replace('#', '')}-${size}`;

  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 100 110"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={nome}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={path} />
        </clipPath>
      </defs>
      {/* background fill */}
      <path d={path} fill={corSecundaria} />
      {/* primary color top band */}
      <rect x="0" y="0" width="100" height="38" fill={corPrimaria} clipPath={`url(#${clipId})`} />
      {/* border */}
      <path d={path} fill="none" stroke={corPrimaria} strokeWidth="3" />
      {/* initials */}
      <text
        x="50"
        y="72"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="system-ui, sans-serif"
        fontWeight="900"
        fontSize={fontSize}
        fill="#ffffff"
        style={{ userSelect: 'none' }}
      >
        {initials}
      </text>
    </svg>
  );
}

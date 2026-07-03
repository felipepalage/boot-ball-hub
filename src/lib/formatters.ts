import { DesafioStatus } from '@/types';

const statusLabels: Record<number, string> = {
  [DesafioStatus.Aberto]: 'Aberto',
  [DesafioStatus.Aceito]: 'Aceito',
  [DesafioStatus.ResultadoPendente]: 'Resultado pendente',
  [DesafioStatus.Cancelado]: 'Cancelado',
  [DesafioStatus.Finalizado]: 'Finalizado',
};

const levelLabels: Record<number, string> = {
  1: 'Nível 1',
  2: 'Nível 2',
  3: 'Nível 3',
  4: 'Nível 4',
  5: 'Nível 5',
};

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));

export const formatTime = (value: string) => value.slice(0, 5);

export const formatDateTime = (date: string, time: string) => `${formatDate(date)} às ${formatTime(time)}`;

export const getStatusLabel = (status: number) => statusLabels[status] ?? 'Desconhecido';

export const getStatusClasses = (status: number) => {
  switch (status) {
    case DesafioStatus.Aberto:
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    case DesafioStatus.Aceito:
      return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    case DesafioStatus.ResultadoPendente:
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case DesafioStatus.Finalizado:
      return 'bg-zinc-100 text-zinc-900 border-zinc-200';
    default:
      return 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30';
  }
};

export const getLevelLabel = (level: number) => levelLabels[level] ?? `Nível ${level}`;

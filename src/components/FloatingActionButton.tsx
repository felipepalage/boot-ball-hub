import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FloatingActionButton = () => (
  <Link
    to="/desafios/novo"
    className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_18px_32px_rgba(196,30,58,0.35)] transition hover:-translate-y-1"
    aria-label="Criar desafio"
  >
    <Plus size={28} strokeWidth={3} />
  </Link>
);

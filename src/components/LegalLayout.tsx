import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface LegalLayoutProps {
  titulo: string;
  atualizadoEm: string;
  children: React.ReactNode;
}

export const LegalLayout = ({ titulo, atualizadoEm, children }: LegalLayoutProps) => {
  useDocumentTitle(titulo);
  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.12),transparent_30%),linear-gradient(180deg,#09090b_0%,#111827_60%,#050505_100%)] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <div className="flex items-center gap-3">
          <img src={logo} alt="Boleiroffice" className="h-12 w-auto" />
          <div>
            <h1 className="text-2xl font-black text-white">{titulo}</h1>
            <p className="text-xs text-white/40">Atualizado em {atualizadoEm}</p>
          </div>
        </div>
        <div className="mt-8 space-y-4 text-sm leading-7 text-white/70 [&_a]:text-primary [&_h2]:mt-7 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-white [&_strong]:text-white/90 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </div>
  );
};

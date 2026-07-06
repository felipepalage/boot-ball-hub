import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const NotFound = () => (
  <div className="flex min-h-dvh flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.18),transparent_35%),linear-gradient(180deg,#09090b_0%,#111827_60%,#050505_100%)] px-4 text-center">
    <img src={logo} alt="Boleiroffice" className="h-20 w-auto opacity-90" />
    <p className="mt-8 text-7xl font-black tracking-tight text-white">404</p>
    <h1 className="mt-2 text-xl font-bold text-white">Página não encontrada</h1>
    <p className="mt-2 max-w-sm text-sm text-white/50">
      A página que você tentou acessar não existe ou foi movida.
    </p>
    <Link
      to="/"
      className="mt-8 rounded-2xl bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5"
    >
      Voltar ao início
    </Link>
  </div>
);

export default NotFound;

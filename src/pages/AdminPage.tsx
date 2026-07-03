import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Users, Swords, TrendingUp } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { authService } from '@/services/authService';
import { Navigate } from 'react-router-dom';

export default function AdminPage() {
  const user = authService.getUser();

  if (!user?.isAdmin) return <Navigate to="/" replace />;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStats,
  });

  const cards = data
    ? [
        { label: 'Empresas', val: data.totalEmpresas, icon: Users, color: 'text-sky-400' },
        { label: 'Desafios', val: data.totalDesafios, icon: Swords, color: 'text-primary' },
        { label: 'Usuários', val: data.totalUsuarios, icon: Users, color: 'text-violet-400' },
        { label: 'Desafios / semana', val: data.desafiosUltimaSemana, icon: TrendingUp, color: 'text-emerald-400' },
        { label: 'Desafios / mês', val: data.desafiosUltimoMes, icon: TrendingUp, color: 'text-amber-400' },
      ]
    : [];

  return (
    <div className="min-h-dvh bg-background pb-32 pt-6">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center gap-3">
          <ShieldCheck size={22} className="text-primary" />
          <h1 className="text-2xl font-black tracking-tight">Painel Admin</h1>
        </div>

        {isLoading && <p className="text-center text-muted-foreground">Carregando...</p>}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cards.map(({ label, val, icon: Icon, color }) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-card p-5">
              <Icon size={20} className={color} />
              <p className="mt-3 text-3xl font-black tabular-nums text-foreground">{val}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

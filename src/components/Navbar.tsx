import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Trophy, Users, CalendarDays, Target, Volleyball, BarChart3, Swords } from 'lucide-react';

const navItems = [
  { to: '/app', icon: Home, label: 'Convites' },
  { to: '/adversarios', icon: Swords, label: 'Rivais' },
  { to: '/times', icon: Users, label: 'Times' },
  { to: '/amistoso', icon: Volleyball, label: 'Amistoso' },
  { to: '/agenda', icon: CalendarDays, label: 'Agenda' },
  { to: '/feed', icon: Newspaper, label: 'Feed' },
  { to: '/estatisticas', icon: BarChart3, label: 'Stats' },
  { to: '/artilharia', icon: Target, label: 'Artilharia' },
  { to: '/ranking', icon: Trophy, label: 'Ranking' },
];

export const Navbar = () => {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/85 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-1 overflow-x-auto px-2 sm:justify-around">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex min-w-[60px] shrink-0 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};


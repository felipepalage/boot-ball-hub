import { useState } from 'react';
import { Bell, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';

const TIPO_ICON: Record<string, string> = {
  DesafioCriado: '⚔️',
  DesafioAceito: '✅',
  ResultadoPendente: '⏳',
  DesafioFinalizado: '🏆',
};

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, clear } = useNotifications();
  const navigate = useNavigate();

  const handleOpen = () => {
    setOpen(true);
    markAllRead();
  };

  return (
    <div className="relative">
      <button
        onClick={() => (open ? setOpen(false) : handleOpen())}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-card/80 text-muted-foreground transition hover:text-foreground"
        aria-label="Notificações"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h3 className="text-sm font-bold text-foreground">Notificações</h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clear}
                    className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
                  >
                    Limpar
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhuma notificação.</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex cursor-pointer items-start gap-3 border-b border-white/5 px-4 py-3 last:border-0 hover:bg-secondary/30"
                    onClick={() => {
                      if (n.url) navigate(n.url);
                      setOpen(false);
                    }}
                  >
                    <span className="mt-0.5 text-base">{TIPO_ICON[n.tipo] ?? '🔔'}</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground">{n.titulo}</p>
                      <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{n.mensagem}</p>
                    </div>
                    {n.url && <ExternalLink size={12} className="mt-1 shrink-0 text-muted-foreground" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

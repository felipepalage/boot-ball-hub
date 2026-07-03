import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { authService } from '@/services/authService';
import { notificacaoService } from '@/services/notificacaoService';

export interface AppNotification {
  tipo: string;
  titulo: string;
  mensagem: string;
  url?: string;
  dataHora?: string;
  id: string;
  lida?: boolean;
}

const HUB_URL = (import.meta.env.VITE_API_URL?.trim() || '') + '/hubs/notifications';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  // Load persisted notifications from API on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user?.empresaId) return;

    notificacaoService.get().then((data) => {
      const mapped = data.itens.map((n) => ({
        id: n.id,
        tipo: n.tipo,
        titulo: n.titulo,
        mensagem: n.mensagem,
        url: n.url,
        dataHora: n.dataCriacao,
        lida: n.lida,
      }));
      setNotifications(mapped);
      setUnreadCount(data.naoLidas);
    }).catch(() => {});
  }, []);

  // Real-time via SignalR
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user?.empresaId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveNotification', (notification: Omit<AppNotification, 'id'>) => {
      const withId = { ...notification, id: crypto.randomUUID(), lida: false };
      setNotifications((prev) => [withId, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
    });

    const start = async () => {
      try {
        await connection.start();
        await connection.invoke('JoinGroup', user.empresaId);
      } catch {
        // Silent fail — app works without real-time
      }
    };

    start();
    connectionRef.current = connection;
    return () => { connection.stop(); };
  }, []);

  const markAllRead = () => {
    setUnreadCount(0);
    notificacaoService.marcarTodasLidas().catch(() => {});
  };

  const clear = () => { setNotifications([]); setUnreadCount(0); };

  return { notifications, unreadCount, markAllRead, clear };
};

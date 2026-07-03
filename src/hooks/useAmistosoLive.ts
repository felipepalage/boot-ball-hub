import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { authService } from '@/services/authService';

const HUB_URL = (import.meta.env.VITE_API_URL?.trim() || '') + '/hubs/notifications';

export interface AmistosoEvento {
  partidaId: string;
  time1Gols: number;
  time2Gols: number;
  finalizada: boolean;
}

/**
 * Escuta atualizações de partida amistosa em tempo real (placar ao vivo) via SignalR.
 * Reusa o mesmo hub/grupo por empresa das notificações.
 */
export const useAmistosoLive = (onEvento: (e: AmistosoEvento) => void) => {
  const cbRef = useRef(onEvento);
  cbRef.current = onEvento;

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user?.empresaId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => localStorage.getItem('token') ?? '' })
      .withAutomaticReconnect()
      .build();

    connection.on('AmistosoAtualizado', (e: AmistosoEvento) => cbRef.current(e));

    let stopped = false;
    (async () => {
      try {
        await connection.start();
        if (!stopped) await connection.invoke('JoinGroup', user.empresaId);
      } catch {
        // Sem tempo real, o app continua funcionando normalmente.
      }
    })();

    return () => {
      stopped = true;
      connection.stop();
    };
  }, []);
};

// Registra o service worker (fundação pro PWA / notificações).
export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // App funciona sem SW; falha é silenciosa.
    });
  });
};

// Pede permissão de notificação (uma vez). Em iOS só funciona no PWA instalado.
export const requestNotificationPermission = async () => {
  if (!('Notification' in window) || Notification.permission !== 'default') return;
  try {
    await Notification.requestPermission();
  } catch {
    // ok
  }
};

// Exibe uma notificação do SO (preferindo o service worker quando disponível).
export const showOsNotification = async (titulo: string, mensagem: string, url?: string) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const options: NotificationOptions = {
    body: mensagem,
    icon: '/logo.png',
    badge: '/logo.png',
    data: { url: url || '/' },
  };
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg) {
      await reg.showNotification(titulo, options);
      return;
    }
  } catch {
    // cai no fallback
  }
  try {
    new Notification(titulo, options);
  } catch {
    // ok
  }
};

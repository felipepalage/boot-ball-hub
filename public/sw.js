// Service worker do Boleiroffice.
// Não intercepta fetch (sem cache de assets) para evitar versões presas.
// Trata push (web-push futuro) e clique na notificação.

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_e) {
    data = { titulo: 'Boleiroffice', mensagem: event.data ? event.data.text() : '' };
  }
  const title = data.titulo || 'Boleiroffice';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.mensagem || '',
      icon: '/logo.png',
      badge: '/logo.png',
      data: { url: data.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});

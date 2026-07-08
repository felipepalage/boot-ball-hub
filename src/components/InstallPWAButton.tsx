import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Botão "Instalar app" — só aparece quando o navegador permite instalar o PWA. */
export const InstallPWAButton = ({ className }: { className?: string }) => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setDeferred(null));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferred) return null;

  const instalar = async () => {
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  return (
    <button
      type="button"
      onClick={instalar}
      className={
        className ??
        'inline-flex items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/10'
      }
    >
      <Download size={18} /> Instalar app
    </button>
  );
};

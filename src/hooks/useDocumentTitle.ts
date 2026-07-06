import { useEffect } from 'react';

/** Define o título da aba (e reverte ao desmontar). Útil em páginas de perfil compartilháveis. */
export const useDocumentTitle = (title?: string | null) => {
  useEffect(() => {
    if (!title) return;
    const anterior = document.title;
    document.title = `${title} · Boleiroffice`;
    return () => {
      document.title = anterior;
    };
  }, [title]);
};

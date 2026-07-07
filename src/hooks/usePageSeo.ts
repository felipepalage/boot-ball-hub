import { useEffect } from 'react';

const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  let criado = false;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
    criado = true;
  }
  const anterior = el.getAttribute('content');
  el.setAttribute('content', content);
  return () => {
    if (criado) el?.remove();
    else if (anterior !== null) el?.setAttribute('content', anterior);
  };
};

/**
 * Define título + meta description + Open Graph da página atual (e reverte ao sair).
 * Ajuda o Google (que renderiza JS). Preview de link no WhatsApp/LinkedIn usa o OG
 * estático do index.html — para preview por página seria necessário SSR/prerender.
 */
export const usePageSeo = ({ title, description }: { title?: string | null; description?: string | null }) => {
  useEffect(() => {
    if (!title && !description) return;
    const reverts: Array<() => void> = [];

    const tituloAnterior = document.title;
    if (title) {
      const t = `${title} · Boleiroffice`;
      document.title = t;
      reverts.push(setMeta('meta[property="og:title"]', 'property', 'og:title', t));
      reverts.push(() => { document.title = tituloAnterior; });
    }
    if (description) {
      reverts.push(setMeta('meta[name="description"]', 'name', 'description', description));
      reverts.push(setMeta('meta[property="og:description"]', 'property', 'og:description', description));
    }
    reverts.push(setMeta('meta[property="og:url"]', 'property', 'og:url', window.location.href));

    return () => reverts.forEach((fn) => fn());
  }, [title, description]);
};

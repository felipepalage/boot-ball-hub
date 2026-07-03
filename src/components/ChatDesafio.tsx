import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send } from 'lucide-react';
import { chatService } from '@/services/chatService';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

interface ChatDesafioProps {
  desafioId: string;
}

export const ChatDesafio = ({ desafioId }: ChatDesafioProps) => {
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: mensagens = [] } = useQuery({
    queryKey: ['chat', desafioId],
    queryFn: () => chatService.getMensagens(desafioId),
    refetchInterval: open ? 10_000 : false,
  });

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [open, mensagens]);

  const mutation = useMutation({
    mutationFn: (conteudo: string) => chatService.enviarMensagem(desafioId, conteudo),
    onSuccess: (nova) => {
      queryClient.setQueryData(['chat', desafioId], (prev: typeof mensagens) => [...prev, nova]);
      setTexto('');
    },
    onError: () => toast.error('Erro ao enviar mensagem.'),
  });

  const handleSend = () => {
    const t = texto.trim();
    if (!t) return;
    if (!authService.isAuthenticated()) return toast.error('Faça login para enviar.');
    mutation.mutate(t);
  };

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
      >
        <MessageCircle size={14} />
        Chat do desafio ({mensagens.length})
      </button>

      {open && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-black/30">
          <div className="flex max-h-48 flex-col gap-2 overflow-y-auto p-4">
            {mensagens.length === 0 && (
              <p className="text-center text-xs text-muted-foreground">Sem mensagens ainda.</p>
            )}
            {mensagens.map((m) => (
              <div key={m.id} className="rounded-xl bg-white/5 px-3 py-2">
                <span className="text-[11px] font-bold text-primary">{m.nomeEmpresa}</span>
                <p className="mt-0.5 text-sm text-foreground">{m.conteudo}</p>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 p-3">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escreva uma mensagem..."
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            <button
              onClick={handleSend}
              disabled={mutation.isPending || !texto.trim()}
              className="rounded-xl bg-primary p-2 text-primary-foreground disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

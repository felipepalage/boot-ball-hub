import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Trash2 } from 'lucide-react';
import { comentarioService } from '@/services/comentarioService';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

interface ComentariosFeedProps {
  desafioId: string;
}

export const ComentariosFeed = ({ desafioId }: ComentariosFeedProps) => {
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState('');
  const queryClient = useQueryClient();
  const user = authService.getUser();

  const { data: comentarios = [] } = useQuery({
    queryKey: ['comentarios', desafioId],
    queryFn: () => comentarioService.list(desafioId),
  });

  const addMutation = useMutation({
    mutationFn: (conteudo: string) => comentarioService.create(desafioId, conteudo),
    onSuccess: (novo) => {
      queryClient.setQueryData(['comentarios', desafioId], (prev: typeof comentarios) => [
        ...prev,
        novo,
      ]);
      setTexto('');
    },
    onError: () => toast.error('Erro ao comentar.'),
  });

  const delMutation = useMutation({
    mutationFn: (id: string) => comentarioService.delete(desafioId, id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(['comentarios', desafioId], (prev: typeof comentarios) =>
        prev.filter((c) => c.id !== id),
      );
    },
    onError: () => toast.error('Erro ao excluir comentário.'),
  });

  return (
    <div className="border-t border-white/10 px-6 py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
      >
        <MessageSquare size={14} />
        Comentários ({comentarios.length})
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {comentarios.map((c) => (
            <div key={c.id} className="flex items-start gap-2 rounded-xl bg-white/5 px-3 py-2">
              <div className="flex-1">
                <span className="text-[11px] font-bold text-primary">{c.nomeEmpresa}</span>
                <p className="mt-0.5 text-sm text-foreground">{c.conteudo}</p>
              </div>
              {user?.empresaId === c.empresaId && (
                <button
                  onClick={() => delMutation.mutate(c.id)}
                  className="mt-0.5 text-muted-foreground hover:text-rose-400"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}

          {authService.isAuthenticated() && (
            <div className="flex items-center gap-2 pt-1">
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && texto.trim() && addMutation.mutate(texto.trim())}
                placeholder="Adicionar comentário..."
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={() => texto.trim() && addMutation.mutate(texto.trim())}
                disabled={addMutation.isPending || !texto.trim()}
                className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

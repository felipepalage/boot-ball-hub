import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { muralService, type CreatePostMuralRequest } from '@/services/muralService';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

export default function MuralPage() {
  const user = authService.getUser();
  const empresaId = user?.empresaId ?? '';
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreatePostMuralRequest>({ titulo: '', conteudo: '' });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['mural', empresaId],
    queryFn: () => muralService.list(empresaId),
    enabled: !!empresaId,
  });

  const createMutation = useMutation({
    mutationFn: (req: CreatePostMuralRequest) => muralService.create(empresaId, req),
    onSuccess: () => {
      toast.success('Post publicado!');
      queryClient.invalidateQueries({ queryKey: ['mural', empresaId] });
      setShowForm(false);
      setForm({ titulo: '', conteudo: '' });
    },
    onError: () => toast.error('Erro ao publicar.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => muralService.delete(empresaId, id),
    onSuccess: () => {
      toast.success('Post removido.');
      queryClient.invalidateQueries({ queryKey: ['mural', empresaId] });
    },
    onError: () => toast.error('Erro ao remover.'),
  });

  return (
    <div className="min-h-dvh bg-background pb-32 pt-6">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center gap-3">
          <Megaphone size={22} className="text-primary" />
          <h1 className="text-2xl font-black tracking-tight">Mural da Empresa</h1>
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 py-3 text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          <Plus size={16} />
          Novo aviso
        </button>

        {showForm && (
          <div className="mb-6 rounded-3xl border border-white/10 bg-card p-5">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Título *</label>
                <input
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Conteúdo *</label>
                <textarea
                  rows={4}
                  value={form.conteudo}
                  onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))}
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.titulo || !form.conteudo}
              className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50"
            >
              {createMutation.isPending ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        )}

        {isLoading && <p className="text-center text-muted-foreground">Carregando...</p>}
        {posts.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground">Nenhum aviso no mural.</p>
        )}

        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="rounded-3xl border border-white/10 bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-bold text-foreground">{post.titulo}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.conteudo}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Por {post.nomeAutor} • {new Date(post.dataPublicacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {post.empresaId === empresaId && (
                  <button
                    onClick={() => deleteMutation.mutate(post.id)}
                    disabled={deleteMutation.isPending}
                    className="rounded-xl border border-rose-500/30 p-2 text-rose-400 hover:bg-rose-500/10 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

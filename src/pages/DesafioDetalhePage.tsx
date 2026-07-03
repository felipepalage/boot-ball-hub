import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, MessageCircle, MapPin, Calendar, Clock } from 'lucide-react';
import { desafioService } from '@/services/desafioService';
import { chatService } from '@/services/chatService';
import { authService } from '@/services/authService';
import { TeamCrest } from '@/components/TeamCrest';
import { DesafioStatus } from '@/types';
import { toast } from 'sonner';

const STATUS_LABEL: Record<number, string> = {
  [DesafioStatus.Aberto]: 'Aguardando aceite',
  [DesafioStatus.Aceito]: 'Confirmado',
  [DesafioStatus.ResultadoPendente]: 'Resultado pendente',
  [DesafioStatus.Finalizado]: 'Finalizado',
  [DesafioStatus.Cancelado]: 'Cancelado',
};

const STATUS_COLOR: Record<number, string> = {
  [DesafioStatus.Aberto]: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  [DesafioStatus.Aceito]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  [DesafioStatus.ResultadoPendente]: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  [DesafioStatus.Finalizado]: 'bg-white/5 text-white/50 border-white/10',
  [DesafioStatus.Cancelado]: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const DesafioDetalhePage = () => {
  const { id } = useParams<{ id: string }>();
  const currentUser = authService.getCurrentUser();
  const queryClient = useQueryClient();
  const [mensagem, setMensagem] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: desafio, isLoading: loadingDesafio } = useQuery({
    queryKey: ['desafio', id],
    queryFn: () => desafioService.getById(id!),
    enabled: !!id,
  });

  const { data: mensagens = [], isLoading: loadingMensagens } = useQuery({
    queryKey: ['chat', id],
    queryFn: () => chatService.getMensagens(id!),
    enabled: !!id && !!currentUser,
    refetchInterval: 8000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const sendMutation = useMutation({
    mutationFn: () => chatService.enviarMensagem(id!, mensagem.trim()),
    onSuccess: () => {
      setMensagem('');
      queryClient.invalidateQueries({ queryKey: ['chat', id] });
    },
    onError: () => toast.error('Erro ao enviar mensagem.'),
  });

  const handleSend = () => {
    if (!mensagem.trim()) return;
    sendMutation.mutate();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loadingDesafio) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-6 animate-pulse space-y-4">
        <div className="h-8 w-32 rounded-xl bg-secondary" />
        <div className="h-48 rounded-[2rem] bg-secondary" />
      </div>
    );
  }

  if (!desafio) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-12 text-center text-muted-foreground">
        Desafio não encontrado.
      </div>
    );
  }

  const isFinalized = desafio.status === DesafioStatus.Finalizado;
  const hasScore = desafio.placarCriador != null && desafio.placarDesafiante != null;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <Link to="/" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
        <ChevronLeft size={16} /> Voltar
      </Link>

      {/* Match card */}
      <div className="mb-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(127,29,29,0.18),rgba(8,8,8,0.95))] p-6">
        <div className="mb-4 flex justify-center">
          <span className={`rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] ${STATUS_COLOR[desafio.status]}`}>
            {STATUS_LABEL[desafio.status]}
          </span>
        </div>

        {/* Teams + Score */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 flex-col items-center gap-2">
            <TeamCrest
              nome={desafio.timeCriador}
              shape={desafio.escudoShapeCriador ?? 1}
              corPrimaria={desafio.corPrimariaCriador ?? '#DC2626'}
              corSecundaria={desafio.corSecundariaCriador ?? '#111827'}
              size={64}
            />
            <p className="text-center text-sm font-black text-foreground">{desafio.timeCriador}</p>
            <p className="text-xs text-muted-foreground text-center">{desafio.empresaCriador}</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            {isFinalized && hasScore ? (
              <p className="text-4xl font-black tabular-nums text-foreground">
                {desafio.placarCriador} <span className="text-white/30">×</span> {desafio.placarDesafiante}
              </p>
            ) : (
              <p className="text-2xl font-black text-white/20">VS</p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(desafio.dataJogo + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </p>
          </div>

          <div className="flex flex-1 flex-col items-center gap-2">
            {desafio.timeDesafiante ? (
              <>
                <TeamCrest
                  nome={desafio.timeDesafiante}
                  shape={desafio.escudoShapeDesafiante ?? 1}
                  corPrimaria={desafio.corPrimariaDesafiante ?? '#DC2626'}
                  corSecundaria={desafio.corSecundariaDesafiante ?? '#111827'}
                  size={64}
                />
                <p className="text-center text-sm font-black text-foreground">{desafio.timeDesafiante}</p>
                <p className="text-xs text-muted-foreground text-center">{desafio.empresaDesafiante}</p>
              </>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-white/10 text-white/20 text-xs text-center">
                Aguardando
              </div>
            )}
          </div>
        </div>

        {/* Match info */}
        <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {desafio.local}{desafio.bairro ? ` · ${desafio.bairro}` : ''}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {desafio.horaJogo}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(desafio.dataJogo + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Scorers */}
        {isFinalized && desafio.gols && desafio.gols.length > 0 && (
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Artilheiros</p>
            <div className="flex flex-wrap gap-2">
              {desafio.gols.map((g) => (
                <span key={g.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-foreground">
                  ⚽ {g.nomeAutor} ({g.quantidadeGols}) — {g.time}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat */}
      {currentUser ? (
        <div className="rounded-[2rem] border border-white/10 bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
            <MessageCircle size={16} className="text-primary" />
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-foreground">Chat do desafio</p>
          </div>

          {/* Messages */}
          <div className="max-h-72 overflow-y-auto p-4 space-y-3">
            {loadingMensagens && (
              <p className="text-center text-xs text-muted-foreground">Carregando...</p>
            )}
            {!loadingMensagens && mensagens.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-4">
                Nenhuma mensagem ainda. Seja o primeiro a falar!
              </p>
            )}
            {mensagens.map((msg) => {
              const isMine = msg.empresaId === currentUser.empresaId;
              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <p className={`mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${isMine ? 'text-primary' : 'text-muted-foreground'}`}>
                    {isMine ? 'Você' : msg.nomeEmpresa}
                  </p>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-white/8 text-foreground rounded-bl-sm border border-white/10'}`}>
                    {msg.conteudo}
                  </div>
                  <p className="mt-0.5 text-[10px] text-white/30">
                    {new Date(msg.dataEnvio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-3 flex gap-2">
            <input
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enviar mensagem..."
              maxLength={1000}
              className="flex-1 rounded-2xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary placeholder:text-muted-foreground"
            />
            <button
              onClick={handleSend}
              disabled={!mensagem.trim() || sendMutation.isPending}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
          Faça login para acessar o chat do desafio.
        </div>
      )}
    </div>
  );
};

export default DesafioDetalhePage;

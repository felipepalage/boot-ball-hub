import { LogOut } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChallengeCard } from '@/components/ChallengeCard';
import { MyChallengeCard } from '@/components/MyChallengeCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { authStorage } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/api-error';
import { authService } from '@/services/authService';
import { desafioService } from '@/services/desafioService';
import { empresaService } from '@/services/empresaService';
import { DesafioStatus } from '@/types';
import { toast } from 'sonner';

const HomePage = () => {
  const currentUser = authService.getCurrentUser();
  const queryClient = useQueryClient();
  const [selectedTeamId, setSelectedTeamId] = useState(authStorage.getActiveTeamId() ?? '');

  const { data: minhaEmpresa } = useQuery({
    queryKey: ['minha-empresa', currentUser?.empresaId],
    queryFn: () => empresaService.getById(currentUser!.empresaId),
    enabled: Boolean(currentUser?.empresaId),
  });

  const meusTimes = useMemo(() => minhaEmpresa?.times ?? [], [minhaEmpresa?.times]);

  useEffect(() => {
    if (!meusTimes.length) {
      return;
    }

    const selectionExists = selectedTeamId && meusTimes.some((time) => time.id === selectedTeamId);
    if (!selectionExists) {
      const fallbackTeamId = meusTimes[0].id;
      setSelectedTeamId(fallbackTeamId);
      authStorage.setActiveTeamId(fallbackTeamId);
    }
  }, [meusTimes, selectedTeamId]);

  const { data: meusDesafios, isLoading: isLoadingMeusDesafios } = useQuery({
    queryKey: ['desafios-time', selectedTeamId],
    queryFn: () => desafioService.getByTime(selectedTeamId, 1, 30),
    enabled: Boolean(selectedTeamId),
    refetchInterval: 15000,
  });

  const aceitarMutation = useMutation({
    mutationFn: (desafioId: string) => {
      if (!selectedTeamId) {
        throw new Error('Selecione um time da sua empresa para aceitar o convite.');
      }

      return desafioService.aceitar(desafioId, { timeDesafianteId: selectedTeamId });
    },
    onSuccess: () => {
      toast.success('Convite aceito com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['desafios-time'] });
      queryClient.invalidateQueries({ queryKey: ['feed-jogos'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Nao foi possivel aceitar o convite.'));
    },
  });

  const resultadoMutation = useMutation({
    mutationFn: ({ desafioId, placarCriador, placarDesafiante }: { desafioId: string; placarCriador: number; placarDesafiante: number }) =>
      desafioService.registrarResultado(desafioId, { placarCriador, placarDesafiante }),
    onSuccess: () => {
      toast.success('Resultado enviado. Agora a outra equipe precisa confirmar.');
      queryClient.invalidateQueries({ queryKey: ['desafios-time'] });
      queryClient.invalidateQueries({ queryKey: ['feed-jogos'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Nao foi possivel registrar o resultado.'));
    },
  });

  const confirmarMutation = useMutation({
    mutationFn: ({ desafioId, placarCriador, placarDesafiante }: { desafioId: string; placarCriador: number; placarDesafiante: number }) =>
      desafioService.confirmarResultado(desafioId, { placarCriador, placarDesafiante }),
    onSuccess: () => {
      toast.success('Resultado confirmado e salvo no ranking.');
      queryClient.invalidateQueries({ queryKey: ['desafios-time'] });
      queryClient.invalidateQueries({ queryKey: ['feed-jogos'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Nao foi possivel confirmar o resultado.'));
    },
  });

  const artilheirosMutation = useMutation({
    mutationFn: ({ desafioId, payload }: { desafioId: string; payload: { golsCriador: Array<{ nomeAutor: string; quantidadeGols: number }>; golsDesafiante: Array<{ nomeAutor: string; quantidadeGols: number }> } }) =>
      desafioService.registrarArtilheiros(desafioId, payload),
    onSuccess: () => {
      toast.success('Artilheiros salvos com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['desafios-time'] });
      queryClient.invalidateQueries({ queryKey: ['feed-jogos'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Nao foi possivel salvar os artilheiros.'));
    },
  });

  const cancelarMutation = useMutation({
    mutationFn: (desafioId: string) => desafioService.cancelar(desafioId, {}),
    onSuccess: () => {
      toast.success('Desafio cancelado com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['desafios-time'] });
      queryClient.invalidateQueries({ queryKey: ['feed-jogos'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['ranking-artilheiros'] });
      queryClient.invalidateQueries({ queryKey: ['ranking-reputacao'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Nao foi possivel cancelar o desafio.'));
    },
  });

  const itens = meusDesafios?.items ?? [];
  const convitesRecebidos = itens.filter((desafio) => desafio.status === DesafioStatus.Aberto && desafio.timeDesafianteId === selectedTeamId);
  const convitesEnviados = itens.filter((desafio) => desafio.status === DesafioStatus.Aberto && desafio.timeCriadorId === selectedTeamId);
  const agendaDoTime = itens.filter((desafio) => desafio.status !== DesafioStatus.Aberto);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_22%),linear-gradient(135deg,rgba(196,30,58,0.18),rgba(8,8,8,0.96))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-white/60">Boleiroffice</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-white md:text-4xl">
              Central de amistosos corporativos com convite direto, placar validado em dupla e operacao mais limpa entre empresas.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/72">
              Cada jogo nasce com adversario definido. Quando um convite e aceito, mais nenhum outro time entra na conversa e o fluxo segue apenas entre as duas empresas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/78">
              <p className="font-semibold text-white">{currentUser?.nome}</p>
              <p>{currentUser?.empresaNome}</p>
            </div>
            <button onClick={() => authService.logout()} className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/12">
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-white/10 bg-card/70 p-5">
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Time da empresa</label>
        <select value={selectedTeamId} onChange={(event) => { setSelectedTeamId(event.target.value); authStorage.setActiveTeamId(event.target.value); }} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary">
          {meusTimes.length === 0 && <option value="">Cadastre um time para comecar</option>}
          {meusTimes.map((time) => (
            <option key={time.id} value={time.id}>{time.nome}</option>
          ))}
        </select>
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Caixa de entrada</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Convites recebidos</h2>
            </div>
            <span className="text-sm text-muted-foreground">{convitesRecebidos.length} pendentes</span>
          </div>

          <div className="space-y-4">
            {isLoadingMeusDesafios && Array.from({ length: 2 }).map((_, index) => <SkeletonCard key={index} />)}
            {convitesRecebidos.map((desafio) => (
              <ChallengeCard key={desafio.id} desafio={desafio} onAceitar={(id) => aceitarMutation.mutate(id)} loading={aceitarMutation.isPending} disabled={!selectedTeamId} actionLabel="Aceitar convite" />
            ))}
            {!isLoadingMeusDesafios && convitesRecebidos.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-8 text-center text-muted-foreground">
                Nenhum convite pendente para este time.
              </div>
            )}
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Saida</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Convites enviados</h2>
              </div>
              <span className="text-sm text-muted-foreground">{convitesEnviados.length} aguardando resposta</span>
            </div>

            <div className="space-y-4">
              {convitesEnviados.map((desafio) => (
                <MyChallengeCard
                  key={desafio.id}
                  desafio={desafio}
                  currentTeamId={selectedTeamId}
                  loading={cancelarMutation.isPending}
                  onRegistrarResultado={() => undefined}
                  onConfirmarResultado={() => undefined}
                  onRegistrarArtilheiros={() => undefined}
                  onCancelarDesafio={(desafioId) => cancelarMutation.mutate(desafioId)}
                />
              ))}
              {!isLoadingMeusDesafios && convitesEnviados.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-8 text-center text-muted-foreground">
                  Nenhum convite aberto enviado por este time.
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Operacao</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Jogos do seu time</h2>
            </div>
            <span className="text-sm text-muted-foreground">Aceite, placar, artilheiros e confirmacao em dupla</span>
          </div>

          <div className="space-y-4">
            {isLoadingMeusDesafios && Array.from({ length: 2 }).map((_, index) => <SkeletonCard key={index} />)}
            {agendaDoTime.map((desafio) => (
              <MyChallengeCard
                key={desafio.id}
                desafio={desafio}
                currentTeamId={selectedTeamId}
                loading={resultadoMutation.isPending || confirmarMutation.isPending || artilheirosMutation.isPending || cancelarMutation.isPending}
                onRegistrarResultado={(desafioId, placarCriador, placarDesafiante) => resultadoMutation.mutate({ desafioId, placarCriador, placarDesafiante })}
                onConfirmarResultado={(desafioId, placarCriador, placarDesafiante) => confirmarMutation.mutate({ desafioId, placarCriador, placarDesafiante })}
                onRegistrarArtilheiros={(desafioId, payload) => artilheirosMutation.mutate({ desafioId, payload })}
                onCancelarDesafio={(desafioId) => cancelarMutation.mutate(desafioId)}
              />
            ))}
            {!isLoadingMeusDesafios && agendaDoTime.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-8 text-center text-muted-foreground">
                Esse time ainda nao tem jogos aceitos ou finalizados.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;

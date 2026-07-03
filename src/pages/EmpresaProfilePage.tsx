import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Share2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SkeletonCard } from '@/components/SkeletonCard';
import { authService } from '@/services/authService';
import { desafioService } from '@/services/desafioService';
import { empresaService } from '@/services/empresaService';
import { getApiErrorMessage } from '@/lib/api-error';
import { formatDate } from '@/lib/formatters';
import { slugify } from '@/lib/slugify';

const getInitials = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const EmpresaProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { empresaId = '' } = useParams();
  const currentUser = authService.getCurrentUser();

  const { data: empresa, isLoading: isLoadingEmpresa } = useQuery({
    queryKey: ['empresa-profile', empresaId],
    queryFn: () => empresaService.getById(empresaId),
    enabled: Boolean(empresaId),
  });

  const { data: historico, isLoading: isLoadingHistorico } = useQuery({
    queryKey: ['empresa-profile-historico', empresaId, empresa?.times.map((time) => time.id).join('|')],
    queryFn: async () => {
      const times = empresa?.times ?? [];
      const resultados = await Promise.all(times.map((time) => desafioService.getByTime(time.id, 1, 6)));
      return resultados
        .flatMap((pagina) => pagina.items)
        .filter((desafio, index, array) => array.findIndex((item) => item.id === desafio.id) === index)
        .sort((a, b) => new Date(b.dataJogo).getTime() - new Date(a.dataJogo).getTime());
    },
    enabled: Boolean(empresa?.times.length),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => empresaService.uploadLogo(empresaId, file),
    onSuccess: () => {
      toast.success('Logo da empresa atualizada com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['empresa-profile', empresaId] });
      queryClient.invalidateQueries({ queryKey: ['times'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['feed-jogos'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Nao foi possivel atualizar a logo da empresa.'));
    },
  });

  const destaqueHistorico = useMemo(() => historico?.slice(0, 8) ?? [], [historico]);
  const canEdit = empresaId === currentUser?.empresaId;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      {(isLoadingEmpresa || !empresa) ? (
        <SkeletonCard />
      ) : (
        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(127,29,29,0.18),rgba(8,8,8,0.96))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24 rounded-[2rem] border border-white/10 bg-white/5">
                <AvatarImage src={empresa.logoUrl || undefined} alt={empresa.nome} className="object-cover" />
                <AvatarFallback className="rounded-[2rem] bg-primary/20 text-2xl font-black text-primary">{getInitials(empresa.nome)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-white/60">Perfil da empresa</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight text-white">{empresa.nome}</h1>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/72">
                  <span className="flex items-center gap-2"><Building2 size={14} />CNPJ {empresa.cnpj}</span>
                  <span className="flex items-center gap-2"><MapPin size={14} />{empresa.bairro}, {empresa.cidade}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link da empresa copiado.');
                }}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <Share2 size={16} /> Compartilhar
              </button>
              {canEdit && (
                <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  <Upload size={16} />
                  <span>{uploadMutation.isPending ? 'Enviando...' : 'Atualizar logo'}</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        uploadMutation.mutate(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Estrutura</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Times da empresa</h2>
          </div>
          <div className="space-y-4">
            {(empresa?.times ?? []).map((time) => (
              <button
                key={time.id}
                onClick={() => navigate(`/times/${time.id}/${slugify(time.nome)}`)}
                className="w-full rounded-3xl border border-white/10 bg-card/80 p-5 text-left transition hover:border-primary/30"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Time corporativo</p>
                <h3 className="mt-2 text-xl font-black tracking-tight text-foreground">{time.nome}</h3>
              </button>
            ))}
            {!isLoadingEmpresa && (empresa?.times.length ?? 0) === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-8 text-center text-muted-foreground">
                Nenhum time encontrado para esta empresa.
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Historico</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Jogos e resultados</h2>
          </div>
          <div className="space-y-4">
            {isLoadingHistorico && Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)}
            {destaqueHistorico.map((desafio) => (
              <div key={desafio.id} className="rounded-3xl border border-white/10 bg-card/80 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{formatDate(desafio.dataJogo)} • {desafio.local}</p>
                <h3 className="mt-2 text-lg font-black tracking-tight text-foreground">{desafio.timeCriador} x {desafio.timeDesafiante}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {(desafio.placarCriador ?? '-') + ' x ' + (desafio.placarDesafiante ?? '-')} • {desafio.empresaCriadora} x {desafio.empresaDesafiante}
                </p>
              </div>
            ))}
            {!isLoadingHistorico && destaqueHistorico.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-card/50 p-8 text-center text-muted-foreground">
                A empresa ainda nao tem jogos publicados no historico.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmpresaProfilePage;

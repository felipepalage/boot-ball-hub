export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  bairro: string;
  cidade: string;
  logoUrl?: string | null;
  dataCriacao: string;
}

export interface TimeLookup {
  id: string;
  nome: string;
  fotoUrl?: string | null;
}

export interface EmpresaDetails extends Empresa {
  times: TimeLookup[];
}

export interface Time {
  id: string;
  nome: string;
  empresaId: string;
  empresaNome: string;
  empresaLogoUrl?: string | null;
  nivel: number;
  bairroBase: string;
  fotoUrl?: string | null;
  escudoShape: number;
  corPrimaria: string;
  corSecundaria: string;
  cep?: string | null;
  cidade?: string | null;
  estado?: string | null;
  dataCriacao: string;
  totalJogadores: number;
}

export interface TimeDetails extends Time {
  jogadores: Jogador[];
}

export interface Jogador {
  id: string;
  nome: string;
  posicao: string;
  numeroCamisa: number;
  timeId: string;
  timeNome: string;
}

export interface GolPartida {
  id: string;
  timeId: string;
  time: string;
  nomeAutor: string;
  quantidadeGols: number;
}

export enum DesafioStatus {
  Aberto = 1,
  Aceito = 2,
  ResultadoPendente = 3,
  Cancelado = 4,
  Finalizado = 5,
}

export interface Desafio {
  id: string;
  timeCriadorId: string;
  timeCriador: string;
  empresaCriadora: string;
  timeDesafianteId?: string | null;
  timeDesafiante?: string | null;
  empresaDesafiante?: string | null;
  dataJogo: string;
  horaJogo: string;
  local: string;
  bairro: string;
  nivel: number;
  status: DesafioStatus;
  placarCriador?: number | null;
  placarDesafiante?: number | null;
  placarCriadorProposto?: number | null;
  placarDesafianteProposto?: number | null;
  resultadoPropostoPorTimeId?: string | null;
  resultadoPropostoPorTime?: string | null;
  resultadoConfirmadoPeloCriador: boolean;
  resultadoConfirmadoPeloDesafiante: boolean;
  dataPropostaResultado?: string | null;
  dataAceite?: string | null;
  dataCancelamento?: string | null;
  dataResultadoConfirmadoEm?: string | null;
  gols: GolPartida[];
  dataCriacao: string;
}

export interface SuggestedChallenge {
  timeId: string;
  nomeTime: string;
  empresa: string;
  bairroBase: string;
  nivel: number;
  disponivelNaData: boolean;
  scoreCompatibilidade: number;
  motivo: string;
}

export interface FeedJogo {
  id: string;
  dataJogo: string;
  horaJogo: string;
  local: string;
  bairro: string;
  timeCriador: string;
  empresaCriadora: string;
  timeCriadorFotoUrl?: string | null;
  empresaCriadoraLogoUrl?: string | null;
  timeCriadorEscudoShape: number;
  timeCriadorCorPrimaria: string;
  timeCriadorCorSecundaria: string;
  timeDesafiante: string;
  empresaDesafiante: string;
  timeDesafianteFotoUrl?: string | null;
  empresaDesafianteLogoUrl?: string | null;
  timeDesafianteEscudoShape: number;
  timeDesafianteCorPrimaria: string;
  timeDesafianteCorSecundaria: string;
  manchete: string;
  resumo: string;
  chamadaEditorial: string;
  artilheirosResumo?: string | null;
  jogoDaRodada: boolean;
  destaqueDoDia: boolean;
  placarCriador?: number | null;
  placarDesafiante?: number | null;
  status: DesafioStatus;
}

export interface RankingItem {
  posicao: number;
  timeId: string;
  time: string;
  empresa: string;
  timeFotoUrl?: string | null;
  empresaLogoUrl?: string | null;
  escudoShape: number;
  corPrimaria: string;
  corSecundaria: string;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldo: number;
  pontos: number;
}

export interface ScorerRankingItem {
  posicao: number;
  timeId: string;
  time: string;
  empresa: string;
  timeFotoUrl?: string | null;
  empresaLogoUrl?: string | null;
  escudoShape: number;
  corPrimaria: string;
  corSecundaria: string;
  nomeAutor: string;
  gols: number;
  jogosComGol: number;
}

export interface ReputationRankingItem {
  posicao: number;
  timeId: string;
  time: string;
  empresa: string;
  timeFotoUrl?: string | null;
  empresaLogoUrl?: string | null;
  escudoShape: number;
  corPrimaria: string;
  corSecundaria: string;
  jogosConfirmados: number;
  comparecimentos: number;
  cancelamentosTardios: number;
  confirmacoesRapidas: number;
  indiceConfiabilidade: number;
}

export interface AuthenticatedUser {
  id: string;
  nome: string;
  email: string;
  empresaId: string;
  empresaNome: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  usuario: AuthenticatedUser;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
  empresaNome: string;
  empresaCnpj: string;
  empresaBairro: string;
  empresaCidade: string;
  empresaLogoUrl?: string;
}

export interface CreateDesafioPayload {
  timeCriadorId: string;
  timeConvidadoId: string;
  dataJogo: string;
  horaJogo: string;
  local: string;
  bairro: string;
  nivel: number;
}

export interface AcceptDesafioPayload {
  timeDesafianteId: string;
}

export interface CancelDesafioPayload {
  motivo?: string;
}

export interface ResultadoPayload {
  placarCriador: number;
  placarDesafiante: number;
}

export interface RegistrarArtilheirosPayload {
  golsCriador: Array<{ nomeAutor: string; quantidadeGols: number }>;
  golsDesafiante: Array<{ nomeAutor: string; quantidadeGols: number }>;
}

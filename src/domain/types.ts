export type Position = 'GOL' | 'ZAG' | 'LAT' | 'VOL' | 'MEI' | 'ATA';

export const POSITION_ORDER: Position[] = ['GOL', 'ZAG', 'LAT', 'VOL', 'MEI', 'ATA'];

export interface Attributes {
  /** Finalização */
  finalizacao: number;
  /** Passe / visão de jogo */
  passe: number;
  /** Desarme / marcação */
  desarme: number;
  /** Velocidade */
  velocidade: number;
  /** Físico / resistência */
  fisico: number;
  /** Defesa (só relevante para goleiros) */
  goleiro: number;
}

export interface Player {
  id: string;
  nome: string;
  idade: number;
  posicao: Position;
  atributos: Attributes;
  /** 1-99, força geral derivada dos atributos ponderados pela posição */
  overall: number;
  /** -5 a +5, oscila conforme resultados */
  forma: number;
  /** 0-100, cai jogando e sobe descansando */
  energia: number;
  /** Salário mensal em reais */
  salario: number;
  /** Valor de mercado em reais */
  valor: number;
  clubeId: string;
  /** Estatísticas da temporada corrente */
  gols: number;
  assistencias: number;
  jogos: number;
}

export interface Club {
  id: string;
  nome: string;
  sigla: string;
  cor: string;
  /** 1-100, influencia geração de elenco e finanças */
  reputacao: number;
  caixa: number;
}

export interface MatchEvent {
  minuto: number;
  tipo: 'gol';
  clubeId: string;
  jogadorId: string;
  jogadorNome: string;
}

export interface Match {
  id: string;
  rodada: number;
  mandanteId: string;
  visitanteId: string;
  golsMandante: number | null;
  golsVisitante: number | null;
  eventos: MatchEvent[];
  disputada: boolean;
}

export interface TableRow {
  clubeId: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldo: number;
}

export interface SeasonHistory {
  ano: number;
  campeaoId: string;
  posicaoUsuario: number;
}

export interface GameState {
  /** Versão do formato salvo, para migração futura */
  versao: number;
  ano: number;
  rodadaAtual: number;
  clubeUsuarioId: string;
  clubes: Club[];
  jogadores: Player[];
  partidas: Match[];
  historico: SeasonHistory[];
}

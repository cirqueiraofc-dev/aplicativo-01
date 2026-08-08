import { APELIDOS, CLUB_SEEDS, PRIMEIROS_NOMES, SOBRENOMES } from '@/data/names';
import type { Attributes, Club, GameState, Player, Position } from '@/domain/types';
import { criarRng, escolher, inteiro, normal, type Rng } from './random';
import { gerarTabelaDeJogos } from './fixtures';

/** Quantos jogadores de cada posição um elenco tem. */
const COMPOSICAO_ELENCO: Record<Position, number> = {
  GOL: 3,
  ZAG: 4,
  LAT: 4,
  VOL: 3,
  MEI: 4,
  ATA: 4,
};

/** Peso de cada atributo no cálculo de overall, por posição. */
const PESOS_OVERALL: Record<Position, Partial<Record<keyof Attributes, number>>> = {
  GOL: { goleiro: 0.72, fisico: 0.16, passe: 0.12 },
  ZAG: { desarme: 0.48, fisico: 0.28, passe: 0.14, velocidade: 0.1 },
  LAT: { desarme: 0.3, velocidade: 0.3, passe: 0.22, fisico: 0.18 },
  VOL: { desarme: 0.38, passe: 0.3, fisico: 0.22, finalizacao: 0.1 },
  MEI: { passe: 0.44, finalizacao: 0.24, velocidade: 0.18, desarme: 0.14 },
  ATA: { finalizacao: 0.5, velocidade: 0.28, fisico: 0.14, passe: 0.08 },
};

function calcularOverall(posicao: Position, atributos: Attributes): number {
  const pesos = PESOS_OVERALL[posicao];
  let total = 0;
  for (const [chave, peso] of Object.entries(pesos) as [keyof Attributes, number][]) {
    total += atributos[chave] * peso;
  }
  return Math.round(total);
}

function gerarNome(rng: Rng): string {
  // Um quinto do elenco usa apelido, como no futebol brasileiro.
  if (rng() < 0.2) return escolher(rng, APELIDOS);
  return `${escolher(rng, PRIMEIROS_NOMES)} ${escolher(rng, SOBRENOMES)}`;
}

/**
 * A média de atributos acompanha a reputação do clube, então times grandes
 * nascem com elencos melhores — e ainda assim cada jogador varia.
 */
function gerarAtributos(rng: Rng, posicao: Position, base: number): Attributes {
  const desvio = 7;
  const secundario = () => normal(rng, base - 12, desvio, 20, 92);
  const primario = () => normal(rng, base, desvio, 30, 96);

  if (posicao === 'GOL') {
    return {
      goleiro: primario(),
      fisico: normal(rng, base - 6, desvio, 25, 92),
      passe: secundario(),
      desarme: secundario(),
      velocidade: secundario(),
      finalizacao: normal(rng, 20, 6, 10, 40),
    };
  }

  const atributos: Attributes = {
    finalizacao: secundario(),
    passe: secundario(),
    desarme: secundario(),
    velocidade: normal(rng, base - 4, desvio, 25, 95),
    fisico: normal(rng, base - 4, desvio, 25, 95),
    goleiro: normal(rng, 15, 5, 8, 30),
  };

  // Reforça os atributos que definem a posição.
  const chavesPrimarias = Object.keys(PESOS_OVERALL[posicao]) as (keyof Attributes)[];
  for (const chave of chavesPrimarias.slice(0, 2)) {
    atributos[chave] = primario();
  }
  return atributos;
}

function gerarJogador(rng: Rng, clubeId: string, posicao: Position, base: number): Player {
  const idade = inteiro(rng, 17, 36);
  const atributos = gerarAtributos(rng, posicao, base);
  const overall = calcularOverall(posicao, atributos);

  // Jogador jovem e bom vale mais; veterano desvaloriza.
  const fatorIdade = idade <= 23 ? 1.6 : idade <= 29 ? 1.2 : idade <= 32 ? 0.7 : 0.35;
  const valor = Math.round(((overall / 10) ** 3.1) * 12000 * fatorIdade);
  const salario = Math.round((valor / 130) / 1000) * 1000 + 4000;

  return {
    id: `${clubeId}-${posicao}-${Math.floor(rng() * 1e9).toString(36)}`,
    nome: gerarNome(rng),
    idade,
    posicao,
    atributos,
    overall,
    forma: 0,
    energia: 100,
    salario,
    valor,
    clubeId,
    gols: 0,
    assistencias: 0,
    jogos: 0,
  };
}

function gerarElenco(rng: Rng, clube: Club): Player[] {
  // Reputação 40-88 vira base de atributos ~52-78.
  const base = 46 + clube.reputacao * 0.36;
  const jogadores: Player[] = [];
  for (const [posicao, quantidade] of Object.entries(COMPOSICAO_ELENCO) as [Position, number][]) {
    for (let i = 0; i < quantidade; i += 1) {
      jogadores.push(gerarJogador(rng, clube.id, posicao, base));
    }
  }
  return jogadores;
}

export function criarNovoJogo(clubeUsuarioIndice: number, semente = Date.now()): GameState {
  const rng = criarRng(semente);
  const ano = new Date().getFullYear();

  const clubes: Club[] = CLUB_SEEDS.map((seed, indice) => ({
    id: `c${indice}`,
    nome: seed.nome,
    sigla: seed.sigla,
    cor: seed.cor,
    reputacao: seed.reputacao,
    caixa: Math.round(seed.reputacao * 180000 + inteiro(rng, -800000, 1200000)),
  }));

  const jogadores = clubes.flatMap((clube) => gerarElenco(rng, clube));
  const partidas = gerarTabelaDeJogos(clubes.map((c) => c.id), rng);

  return {
    versao: 1,
    ano,
    rodadaAtual: 1,
    clubeUsuarioId: clubes[clubeUsuarioIndice].id,
    clubes,
    jogadores,
    partidas,
    historico: [],
  };
}

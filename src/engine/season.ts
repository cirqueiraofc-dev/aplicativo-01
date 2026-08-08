import type { GameState, Match, Player, TableRow } from '@/domain/types';
import { criarRng, inteiro, type Rng } from './random';
import { selecionarTitulares, simularPartida } from './match';
import { TOTAL_RODADAS } from './fixtures';

/** Classificação a partir das partidas já disputadas. */
export function calcularTabela(estado: GameState): TableRow[] {
  const linhas = new Map<string, TableRow>();
  for (const clube of estado.clubes) {
    linhas.set(clube.id, {
      clubeId: clube.id,
      pontos: 0,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsPro: 0,
      golsContra: 0,
      saldo: 0,
    });
  }

  for (const partida of estado.partidas) {
    if (!partida.disputada || partida.golsMandante === null || partida.golsVisitante === null) {
      continue;
    }
    const mandante = linhas.get(partida.mandanteId);
    const visitante = linhas.get(partida.visitanteId);
    if (!mandante || !visitante) continue;

    mandante.jogos += 1;
    visitante.jogos += 1;
    mandante.golsPro += partida.golsMandante;
    mandante.golsContra += partida.golsVisitante;
    visitante.golsPro += partida.golsVisitante;
    visitante.golsContra += partida.golsMandante;

    if (partida.golsMandante > partida.golsVisitante) {
      mandante.pontos += 3;
      mandante.vitorias += 1;
      visitante.derrotas += 1;
    } else if (partida.golsMandante < partida.golsVisitante) {
      visitante.pontos += 3;
      visitante.vitorias += 1;
      mandante.derrotas += 1;
    } else {
      mandante.pontos += 1;
      visitante.pontos += 1;
      mandante.empates += 1;
      visitante.empates += 1;
    }
  }

  for (const linha of linhas.values()) {
    linha.saldo = linha.golsPro - linha.golsContra;
  }

  return [...linhas.values()].sort(
    (a, b) =>
      b.pontos - a.pontos ||
      b.vitorias - a.vitorias ||
      b.saldo - a.saldo ||
      b.golsPro - a.golsPro,
  );
}

function ajustarForma(jogador: Player, delta: number): number {
  return Math.max(-5, Math.min(5, jogador.forma + delta));
}

/**
 * Simula todas as partidas da rodada atual e devolve um novo estado.
 * Não muta o estado recebido — a UI depende de identidade nova para renderizar.
 */
export function simularRodada(estado: GameState): GameState {
  const totalRodadas = TOTAL_RODADAS(estado.clubes.length);
  if (estado.rodadaAtual > totalRodadas) return estado;

  const rng = criarRng(estado.ano * 100000 + estado.rodadaAtual * 7919);
  const porId = new Map(estado.jogadores.map((j) => [j.id, { ...j }]));
  const elencoPorClube = new Map<string, Player[]>();
  for (const jogador of porId.values()) {
    const lista = elencoPorClube.get(jogador.clubeId) ?? [];
    lista.push(jogador);
    elencoPorClube.set(jogador.clubeId, lista);
  }

  const caixaPorClube = new Map(estado.clubes.map((c) => [c.id, c.caixa]));
  const partidas: Match[] = estado.partidas.map((partida) => {
    if (partida.rodada !== estado.rodadaAtual || partida.disputada) return partida;

    const elencoM = elencoPorClube.get(partida.mandanteId) ?? [];
    const elencoV = elencoPorClube.get(partida.visitanteId) ?? [];
    const titularesM = selecionarTitulares(elencoM);
    const titularesV = selecionarTitulares(elencoV);

    const resultado = simularPartida(
      rng,
      partida.mandanteId,
      partida.visitanteId,
      titularesM,
      titularesV,
    );

    aplicarEfeitos(rng, titularesM, elencoM, resultado.golsMandante, resultado.golsVisitante);
    aplicarEfeitos(rng, titularesV, elencoV, resultado.golsVisitante, resultado.golsMandante);

    for (const evento of resultado.eventos) {
      const autor = porId.get(evento.jogadorId);
      if (autor) autor.gols += 1;
    }

    // Bilheteria do mandante, proporcional ao tamanho do clube.
    const clubeMandante = estado.clubes.find((c) => c.id === partida.mandanteId);
    if (clubeMandante) {
      const bilheteria = Math.round(clubeMandante.reputacao * inteiro(rng, 5000, 11000));
      caixaPorClube.set(partida.mandanteId, (caixaPorClube.get(partida.mandanteId) ?? 0) + bilheteria);
    }

    return {
      ...partida,
      golsMandante: resultado.golsMandante,
      golsVisitante: resultado.golsVisitante,
      eventos: resultado.eventos,
      disputada: true,
    };
  });

  // Folha salarial: a rodada equivale a cerca de um quarto de mês.
  for (const clube of estado.clubes) {
    const folha = (elencoPorClube.get(clube.id) ?? []).reduce((acc, j) => acc + j.salario, 0);
    caixaPorClube.set(clube.id, (caixaPorClube.get(clube.id) ?? 0) - Math.round(folha / 4));
  }

  return {
    ...estado,
    rodadaAtual: estado.rodadaAtual + 1,
    clubes: estado.clubes.map((c) => ({ ...c, caixa: caixaPorClube.get(c.id) ?? c.caixa })),
    jogadores: [...porId.values()],
    partidas,
  };
}

/** Desgasta titulares, recupera reservas e move a forma conforme o resultado. */
function aplicarEfeitos(
  rng: Rng,
  titulares: readonly Player[],
  elenco: readonly Player[],
  golsPro: number,
  golsContra: number,
): void {
  const deltaForma = golsPro > golsContra ? 1 : golsPro < golsContra ? -1 : 0;
  const idsTitulares = new Set(titulares.map((j) => j.id));

  for (const jogador of titulares) {
    jogador.jogos += 1;
    jogador.energia = Math.max(0, jogador.energia - inteiro(rng, 14, 26));
    jogador.forma = ajustarForma(jogador, deltaForma);
  }
  for (const jogador of elenco) {
    if (idsTitulares.has(jogador.id)) continue;
    jogador.energia = Math.min(100, jogador.energia + inteiro(rng, 10, 20));
    // Quem não joga tende a voltar à média.
    jogador.forma = ajustarForma(jogador, jogador.forma > 0 ? -0.5 : 0.5);
  }
}

export function temporadaTerminou(estado: GameState): boolean {
  return estado.rodadaAtual > TOTAL_RODADAS(estado.clubes.length);
}

export function artilheiros(estado: GameState, limite = 10): Player[] {
  return [...estado.jogadores]
    .filter((j) => j.gols > 0)
    .sort((a, b) => b.gols - a.gols || a.jogos - b.jogos)
    .slice(0, limite);
}

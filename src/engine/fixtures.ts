import type { Match } from '@/domain/types';
import type { Rng } from './random';

/** Embaralha uma cópia da lista (Fisher-Yates). */
function embaralhar<T>(lista: readonly T[], rng: Rng): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Pontos corridos em turno e returno pelo método do círculo:
 * o primeiro time fica fixo e os demais giram a cada rodada, o que garante
 * que todo mundo enfrente todo mundo exatamente uma vez por turno.
 */
export function gerarTabelaDeJogos(clubeIds: readonly string[], rng: Rng): Match[] {
  const times = embaralhar(clubeIds, rng);
  const n = times.length;
  if (n < 2 || n % 2 !== 0) {
    throw new Error(`A liga precisa de um número par de clubes (recebido: ${n}).`);
  }

  const rodadasPorTurno = n - 1;
  const jogosPorRodada = n / 2;
  const partidas: Match[] = [];

  const giro = [...times];
  for (let rodada = 0; rodada < rodadasPorTurno; rodada += 1) {
    for (let i = 0; i < jogosPorRodada; i += 1) {
      const a = giro[i];
      const b = giro[n - 1 - i];
      // Inverte o mando em jogos alternados para ninguém acumular mandos seguidos.
      const inverter = (rodada + i) % 2 === 0;
      const mandante = inverter ? a : b;
      const visitante = inverter ? b : a;

      partidas.push({
        id: `t1-r${rodada + 1}-${i}`,
        rodada: rodada + 1,
        mandanteId: mandante,
        visitanteId: visitante,
        golsMandante: null,
        golsVisitante: null,
        eventos: [],
        disputada: false,
      });

      // Returno: mesmo confronto com o mando trocado.
      partidas.push({
        id: `t2-r${rodada + 1}-${i}`,
        rodada: rodada + 1 + rodadasPorTurno,
        mandanteId: visitante,
        visitanteId: mandante,
        golsMandante: null,
        golsVisitante: null,
        eventos: [],
        disputada: false,
      });
    }

    // Gira todos menos o primeiro.
    const ultimo = giro.pop();
    if (ultimo) giro.splice(1, 0, ultimo);
  }

  return partidas.sort((a, b) => a.rodada - b.rodada);
}

export const TOTAL_RODADAS = (numeroDeClubes: number) => (numeroDeClubes - 1) * 2;

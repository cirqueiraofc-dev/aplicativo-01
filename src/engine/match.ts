import type { MatchEvent, Player, Position } from '@/domain/types';
import { inteiro, poisson, type Rng } from './random';

/** Escalação padrão 4-2-2-2, o desenho mais comum no futebol brasileiro. */
const FORMACAO: Record<Position, number> = {
  GOL: 1,
  ZAG: 2,
  LAT: 2,
  VOL: 2,
  MEI: 2,
  ATA: 2,
};

/** Média de gols por time por partida — calibra a escala do modelo. */
const GOLS_BASE = 1.16;
/** Vantagem de jogar em casa, aplicada ao xG do mandante. */
const FATOR_MANDO = 1.18;

/** Quanto cada posição contribui para o ataque e para a defesa do time. */
const PESO_ATAQUE: Record<Position, number> = {
  GOL: 0, ZAG: 0.05, LAT: 0.2, VOL: 0.3, MEI: 0.85, ATA: 1,
};
const PESO_DEFESA: Record<Position, number> = {
  GOL: 1, ZAG: 1, LAT: 0.65, VOL: 0.6, MEI: 0.15, ATA: 0.05,
};

/**
 * Chance relativa de cada posição marcar, ponderada depois pela finalização.
 * A escala é bem inclinada para o ataque: no futebol real os artilheiros
 * concentram os gols em vez de espalhá-los pelo time todo.
 */
const PESO_ARTILHARIA: Record<Position, number> = {
  GOL: 0.003, ZAG: 0.07, LAT: 0.09, VOL: 0.16, MEI: 0.45, ATA: 1,
};

/**
 * Rendimento efetivo do jogador na partida: overall corrigido por forma
 * (-5 a +5) e por energia, que pesa até 25% quando o atleta está esgotado.
 */
export function rendimento(jogador: Player): number {
  const ajusteForma = 1 + jogador.forma * 0.015;
  const ajusteEnergia = 0.75 + (jogador.energia / 100) * 0.25;
  return jogador.overall * ajusteForma * ajusteEnergia;
}

/** Melhores jogadores disponíveis por posição, seguindo a formação. */
export function selecionarTitulares(elenco: readonly Player[]): Player[] {
  const titulares: Player[] = [];
  for (const [posicao, vagas] of Object.entries(FORMACAO) as [Position, number][]) {
    const candidatos = elenco
      .filter((j) => j.posicao === posicao)
      .sort((a, b) => rendimento(b) - rendimento(a))
      .slice(0, vagas);
    titulares.push(...candidatos);
  }

  // Se faltou gente numa posição, completa com os melhores que sobraram.
  if (titulares.length < 11) {
    const escolhidos = new Set(titulares.map((j) => j.id));
    const reservas = elenco
      .filter((j) => !escolhidos.has(j.id))
      .sort((a, b) => rendimento(b) - rendimento(a));
    titulares.push(...reservas.slice(0, 11 - titulares.length));
  }
  return titulares;
}

function forcaPonderada(titulares: readonly Player[], pesos: Record<Position, number>): number {
  let soma = 0;
  let pesoTotal = 0;
  for (const jogador of titulares) {
    const peso = pesos[jogador.posicao];
    soma += rendimento(jogador) * peso;
    pesoTotal += peso;
  }
  return pesoTotal > 0 ? soma / pesoTotal : 50;
}

export interface ForcaTime {
  ataque: number;
  defesa: number;
}

export function calcularForca(titulares: readonly Player[]): ForcaTime {
  return {
    ataque: forcaPonderada(titulares, PESO_ATAQUE),
    defesa: forcaPonderada(titulares, PESO_DEFESA),
  };
}

function golsEsperados(ataque: number, defesa: number, bonus: number): number {
  // Expoente > 1 faz diferenças de força pesarem mais no placar.
  const razao = (ataque / Math.max(defesa, 1)) ** 1.45;
  return Math.min(4.5, Math.max(0.15, GOLS_BASE * razao * bonus));
}

function sortearArtilheiro(rng: Rng, titulares: readonly Player[]): Player {
  // Expoente na finalização faz o centroavante artilheiro se destacar do resto.
  const pesos = titulares.map(
    (j) => PESO_ARTILHARIA[j.posicao] * (0.2 + (j.atributos.finalizacao / 100) ** 2),
  );
  const total = pesos.reduce((acc, p) => acc + p, 0);
  let alvo = rng() * total;
  for (let i = 0; i < titulares.length; i += 1) {
    alvo -= pesos[i];
    if (alvo <= 0) return titulares[i];
  }
  return titulares[titulares.length - 1];
}

export interface ResultadoPartida {
  golsMandante: number;
  golsVisitante: number;
  eventos: MatchEvent[];
}

export function simularPartida(
  rng: Rng,
  mandanteId: string,
  visitanteId: string,
  titularesMandante: readonly Player[],
  titularesVisitante: readonly Player[],
): ResultadoPartida {
  const forcaM = calcularForca(titularesMandante);
  const forcaV = calcularForca(titularesVisitante);

  const golsMandante = poisson(rng, golsEsperados(forcaM.ataque, forcaV.defesa, FATOR_MANDO));
  const golsVisitante = poisson(rng, golsEsperados(forcaV.ataque, forcaM.defesa, 1));

  const eventos: MatchEvent[] = [];
  const registrar = (quantidade: number, clubeId: string, titulares: readonly Player[]) => {
    for (let i = 0; i < quantidade; i += 1) {
      const autor = sortearArtilheiro(rng, titulares);
      eventos.push({
        minuto: inteiro(rng, 1, 90),
        tipo: 'gol',
        clubeId,
        jogadorId: autor.id,
        jogadorNome: autor.nome,
      });
    }
  };

  registrar(golsMandante, mandanteId, titularesMandante);
  registrar(golsVisitante, visitanteId, titularesVisitante);
  eventos.sort((a, b) => a.minuto - b.minuto);

  return { golsMandante, golsVisitante, eventos };
}

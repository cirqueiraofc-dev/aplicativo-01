/** Gerador determinístico (mulberry32) — mesma semente, mesmo mundo. */
export function criarRng(semente: number): () => number {
  let a = semente >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

/** Inteiro em [min, max], inclusivo nas duas pontas. */
export function inteiro(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function escolher<T>(rng: Rng, lista: readonly T[]): T {
  return lista[Math.floor(rng() * lista.length)];
}

/**
 * Amostra de uma normal (Box-Muller) truncada ao intervalo informado.
 * Usado para distribuir atributos de forma realista em torno de uma média.
 */
export function normal(rng: Rng, media: number, desvio: number, min: number, max: number): number {
  const u1 = Math.max(rng(), 1e-9);
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.round(Math.min(max, Math.max(min, media + z * desvio)));
}

/**
 * Amostra de uma Poisson pelo método de Knuth.
 * lambda aqui é sempre baixo (gols por partida), então o laço é curto.
 */
export function poisson(rng: Rng, lambda: number): number {
  const limite = Math.exp(-Math.max(0, lambda));
  let k = 0;
  let p = 1;
  do {
    k += 1;
    p *= rng();
  } while (p > limite && k < 30);
  return k - 1;
}

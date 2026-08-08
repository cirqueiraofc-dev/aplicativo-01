export const cores = {
  fundo: '#0B1F17',
  superficie: '#122E22',
  superficieAlta: '#1A3E2E',
  borda: '#22513C',
  texto: '#EAF5EF',
  textoFraco: '#8FB3A2',
  destaque: '#3DDC84',
  alerta: '#E8703A',
  perigo: '#D9534F',
  ouro: '#F2C744',
};

export const espaco = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const raio = {
  sm: 6,
  md: 10,
  lg: 14,
};

export function formatarDinheiro(valor: number): string {
  const absoluto = Math.abs(valor);
  const sinal = valor < 0 ? '-' : '';
  if (absoluto >= 1_000_000) return `${sinal}R$ ${(absoluto / 1_000_000).toFixed(1)}M`;
  if (absoluto >= 1_000) return `${sinal}R$ ${(absoluto / 1_000).toFixed(0)}mil`;
  return `${sinal}R$ ${absoluto}`;
}

/** Verde para bom, amarelo para mediano, vermelho para ruim. */
export function corDoOverall(overall: number): string {
  if (overall >= 80) return cores.destaque;
  if (overall >= 70) return '#9BD96B';
  if (overall >= 60) return cores.ouro;
  return cores.alerta;
}

/**
 * Todos os clubes e jogadores são fictícios.
 * Nomes de clubes reais e de atletas reais são marcas de terceiros e não são
 * usados aqui — os nomes abaixo são invenções com sabor regional brasileiro.
 */

export interface ClubSeed {
  nome: string;
  sigla: string;
  cor: string;
  reputacao: number;
}

export const CLUB_SEEDS: ClubSeed[] = [
  { nome: 'Serra Azul FC', sigla: 'SAZ', cor: '#1E5FA8', reputacao: 88 },
  { nome: 'Litoral EC', sigla: 'LIT', cor: '#0E8F6F', reputacao: 85 },
  { nome: 'Piratininga FC', sigla: 'PIR', cor: '#C0392B', reputacao: 83 },
  { nome: 'Guanabara AC', sigla: 'GUA', cor: '#1C1C1C', reputacao: 81 },
  { nome: 'Cerrado SC', sigla: 'CER', cor: '#D68910', reputacao: 78 },
  { nome: 'Pantanal FC', sigla: 'PAN', cor: '#117A65', reputacao: 74 },
  { nome: 'Bandeirantes AC', sigla: 'BAN', cor: '#7D3C98', reputacao: 72 },
  { nome: 'Araucária FC', sigla: 'ARA', cor: '#196F3D', reputacao: 70 },
  { nome: 'Tijuca AC', sigla: 'TIJ', cor: '#B03A2E', reputacao: 68 },
  { nome: 'Atlântico FC', sigla: 'ATL', cor: '#2874A6', reputacao: 66 },
  { nome: 'Vale do Aço EC', sigla: 'VAL', cor: '#5D6D7E', reputacao: 63 },
  { nome: 'Recôncavo EC', sigla: 'REC', cor: '#CA6F1E', reputacao: 61 },
  { nome: 'Amazônia EC', sigla: 'AMZ', cor: '#0B5345', reputacao: 58 },
  { nome: 'Pampa SC', sigla: 'PAM', cor: '#154360', reputacao: 56 },
  { nome: 'Caiçara EC', sigla: 'CAI', cor: '#1ABC9C', reputacao: 53 },
  { nome: 'Chapada SC', sigla: 'CHA', cor: '#884EA0', reputacao: 51 },
  { nome: 'Sertão FC', sigla: 'SER', cor: '#A04000', reputacao: 48 },
  { nome: 'Marajó FC', sigla: 'MAR', cor: '#148F77', reputacao: 46 },
  { nome: 'Ipê FC', sigla: 'IPE', cor: '#D4AC0D', reputacao: 43 },
  { nome: 'Jacarandá SC', sigla: 'JAC', cor: '#6C3483', reputacao: 40 },
];

export const PRIMEIROS_NOMES = [
  'Adriano', 'Aílton', 'Alisson', 'Anderson', 'Bruno', 'Caio', 'Cleber', 'Danilo',
  'Dener', 'Diego', 'Edmar', 'Éverton', 'Fabrício', 'Felipe', 'Gabriel', 'Geraldo',
  'Gilmar', 'Guilherme', 'Heitor', 'Hugo', 'Igor', 'Ivan', 'Jadson', 'Joelson',
  'Kléber', 'Leandro', 'Lucas', 'Luan', 'Maicon', 'Marcelo', 'Mateus', 'Murilo',
  'Nilton', 'Otávio', 'Paulo', 'Rafael', 'Reinaldo', 'Renan', 'Ricardo', 'Robson',
  'Rodrigo', 'Samuel', 'Sandro', 'Thiago', 'Ubiratan', 'Valdir', 'Vinícius', 'Wesley',
  'Wilson', 'Yuri',
];

export const SOBRENOMES = [
  'Andrade', 'Bastos', 'Bezerra', 'Braga', 'Caldeira', 'Camargo', 'Cardoso', 'Cavalcanti',
  'Coelho', 'Dantas', 'Esteves', 'Farias', 'Fontes', 'Guedes', 'Ladeira', 'Macedo',
  'Marinho', 'Medeiros', 'Mesquita', 'Modesto', 'Nogueira', 'Paiva', 'Peixoto', 'Queiroz',
  'Rabelo', 'Rezende', 'Sampaio', 'Seixas', 'Tavares', 'Valente', 'Veloso', 'Xavier',
];

/** Apelidos no estilo do futebol brasileiro, usados em parte do elenco. */
export const APELIDOS = [
  'Bilu', 'Cacá', 'Dedé', 'Didi', 'Formiga', 'Gaúcho', 'Índio', 'Juninho',
  'Léo', 'Mineiro', 'Nenê', 'Pipoca', 'Serginho', 'Tatu', 'Tico', 'Zeca',
];

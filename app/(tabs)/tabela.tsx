import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useGame } from '@/state/GameContext';
import type { TableRow } from '@/domain/types';
import { cores, espaco, raio } from '@/ui/theme';

/** Faixas de classificação no formato de pontos corridos brasileiro. */
function corDaFaixa(posicao: number, total: number): string | null {
  if (posicao <= 4) return cores.destaque;
  if (posicao <= 6) return '#2E86C1';
  if (posicao > total - 4) return cores.perigo;
  return null;
}

export default function Tabela() {
  const { tabela, clubePorId, estado } = useGame();
  if (!estado) return null;

  return (
    <FlatList
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      data={tabela}
      keyExtractor={(item) => item.clubeId}
      ListHeaderComponent={
        <View style={estilos.cabecalho}>
          <Text style={[estilos.hPos]}>#</Text>
          <Text style={estilos.hClube}>Clube</Text>
          <Text style={estilos.hNum}>P</Text>
          <Text style={estilos.hNum}>J</Text>
          <Text style={estilos.hNum}>V</Text>
          <Text style={estilos.hNum}>E</Text>
          <Text style={estilos.hNum}>D</Text>
          <Text style={estilos.hNum}>SG</Text>
        </View>
      }
      ListFooterComponent={
        <View style={estilos.rodape}>
          <Legenda cor={cores.destaque} texto="Libertadores" />
          <Legenda cor="#2E86C1" texto="Pré-Libertadores" />
          <Legenda cor={cores.perigo} texto="Rebaixamento" />
        </View>
      }
      renderItem={({ item, index }) => (
        <LinhaTabela
          linha={item}
          posicao={index + 1}
          total={tabela.length}
          sigla={clubePorId(item.clubeId)?.sigla ?? '—'}
          nome={clubePorId(item.clubeId)?.nome ?? '—'}
          cor={clubePorId(item.clubeId)?.cor ?? cores.borda}
          ehUsuario={item.clubeId === estado.clubeUsuarioId}
        />
      )}
    />
  );
}

function LinhaTabela({
  linha,
  posicao,
  total,
  sigla,
  nome,
  cor,
  ehUsuario,
}: {
  linha: TableRow;
  posicao: number;
  total: number;
  sigla: string;
  nome: string;
  cor: string;
  ehUsuario: boolean;
}) {
  const faixa = corDaFaixa(posicao, total);

  return (
    <View style={[estilos.linha, ehUsuario && estilos.linhaUsuario]}>
      <View style={estilos.posicaoBloco}>
        <View style={[estilos.faixa, { backgroundColor: faixa ?? 'transparent' }]} />
        <Text style={estilos.pos}>{posicao}</Text>
      </View>

      <View style={estilos.clubeBloco}>
        <View style={[estilos.bolinha, { backgroundColor: cor }]} />
        <Text style={[estilos.clubeNome, ehUsuario && estilos.textoDestaque]} numberOfLines={1}>
          {sigla}
          <Text style={estilos.clubeNomeLongo}> {nome}</Text>
        </Text>
      </View>

      <Text style={[estilos.num, estilos.numForte, ehUsuario && estilos.textoDestaque]}>
        {linha.pontos}
      </Text>
      <Text style={estilos.num}>{linha.jogos}</Text>
      <Text style={estilos.num}>{linha.vitorias}</Text>
      <Text style={estilos.num}>{linha.empates}</Text>
      <Text style={estilos.num}>{linha.derrotas}</Text>
      <Text style={estilos.num}>{linha.saldo > 0 ? `+${linha.saldo}` : linha.saldo}</Text>
    </View>
  );
}

function Legenda({ cor, texto }: { cor: string; texto: string }) {
  return (
    <View style={estilos.legendaItem}>
      <View style={[estilos.legendaCor, { backgroundColor: cor }]} />
      <Text style={estilos.legendaTexto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, paddingBottom: espaco.xl },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espaco.sm,
    paddingHorizontal: espaco.sm,
  },
  hPos: { width: 28, color: cores.textoFraco, fontSize: 11 },
  hClube: { flex: 1, color: cores.textoFraco, fontSize: 11 },
  hNum: { width: 26, textAlign: 'center', color: cores.textoFraco, fontSize: 11 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espaco.sm,
    paddingHorizontal: espaco.sm,
    borderRadius: raio.sm,
  },
  linhaUsuario: { backgroundColor: cores.superficieAlta },
  posicaoBloco: { width: 28, flexDirection: 'row', alignItems: 'center', gap: 5 },
  faixa: { width: 3, height: 18, borderRadius: 2 },
  pos: { color: cores.textoFraco, fontSize: 13 },
  clubeBloco: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  bolinha: { width: 8, height: 8, borderRadius: 4 },
  clubeNome: { flex: 1, color: cores.texto, fontSize: 13, fontWeight: '700' },
  clubeNomeLongo: { color: cores.textoFraco, fontWeight: '400', fontSize: 12 },
  textoDestaque: { color: cores.destaque },
  num: { width: 26, textAlign: 'center', color: cores.textoFraco, fontSize: 13 },
  numForte: { color: cores.texto, fontWeight: '800' },
  rodape: { marginTop: espaco.lg, gap: espaco.xs },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  legendaCor: { width: 10, height: 10, borderRadius: 2 },
  legendaTexto: { color: cores.textoFraco, fontSize: 12 },
});

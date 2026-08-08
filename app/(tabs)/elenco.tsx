import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useGame } from '@/state/GameContext';
import { POSITION_ORDER, type Player } from '@/domain/types';
import { selecionarTitulares } from '@/engine/match';
import { cores, corDoOverall, espaco, formatarDinheiro, raio } from '@/ui/theme';

export default function Elenco() {
  const { elencoUsuario } = useGame();
  const titulares = new Set(selecionarTitulares(elencoUsuario).map((j) => j.id));

  // Agrupa por posição na ordem tática (do gol para o ataque).
  const ordenado = [...elencoUsuario].sort(
    (a, b) =>
      POSITION_ORDER.indexOf(a.posicao) - POSITION_ORDER.indexOf(b.posicao) ||
      b.overall - a.overall,
  );

  const folha = elencoUsuario.reduce((acc, j) => acc + j.salario, 0);

  return (
    <FlatList
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      data={ordenado}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={estilos.resumo}>
          <Text style={estilos.resumoTexto}>
            {elencoUsuario.length} atletas · folha {formatarDinheiro(folha)}/mês
          </Text>
          <Text style={estilos.legenda}>Titulares marcados com ●</Text>
        </View>
      }
      renderItem={({ item }) => <LinhaJogador jogador={item} titular={titulares.has(item.id)} />}
    />
  );
}

function LinhaJogador({ jogador, titular }: { jogador: Player; titular: boolean }) {
  const formaTexto =
    jogador.forma > 1 ? '↑' : jogador.forma < -1 ? '↓' : '–';
  const formaCor =
    jogador.forma > 1 ? cores.destaque : jogador.forma < -1 ? cores.perigo : cores.textoFraco;

  return (
    <View style={estilos.linha}>
      <Text style={[estilos.ponto, { opacity: titular ? 1 : 0 }]}>●</Text>
      <View style={estilos.posicaoTag}>
        <Text style={estilos.posicaoTexto}>{jogador.posicao}</Text>
      </View>

      <View style={estilos.identidade}>
        <Text style={estilos.nome} numberOfLines={1}>
          {jogador.nome}
        </Text>
        <Text style={estilos.detalhe}>
          {jogador.idade} anos · {formatarDinheiro(jogador.valor)}
          {jogador.jogos > 0 ? ` · ${jogador.gols}g em ${jogador.jogos}j` : ''}
        </Text>
      </View>

      <View style={estilos.metricas}>
        <Text style={[estilos.forma, { color: formaCor }]}>{formaTexto}</Text>
        <BarraEnergia valor={jogador.energia} />
        <Text style={[estilos.overall, { color: corDoOverall(jogador.overall) }]}>
          {jogador.overall}
        </Text>
      </View>
    </View>
  );
}

function BarraEnergia({ valor }: { valor: number }) {
  const cor = valor >= 70 ? cores.destaque : valor >= 40 ? cores.ouro : cores.perigo;
  return (
    <View style={estilos.barraFundo}>
      <View style={[estilos.barraPreenchida, { width: `${valor}%`, backgroundColor: cor }]} />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, gap: espaco.xs, paddingBottom: espaco.xl },
  resumo: { marginBottom: espaco.sm, gap: 2 },
  resumoTexto: { color: cores.texto, fontSize: 15, fontWeight: '600' },
  legenda: { color: cores.textoFraco, fontSize: 12 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    backgroundColor: cores.superficie,
    borderRadius: raio.sm,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingVertical: espaco.sm,
    paddingHorizontal: espaco.md,
  },
  ponto: { color: cores.destaque, fontSize: 10 },
  posicaoTag: {
    width: 38,
    backgroundColor: cores.superficieAlta,
    borderRadius: raio.sm,
    paddingVertical: 3,
    alignItems: 'center',
  },
  posicaoTexto: { color: cores.textoFraco, fontSize: 11, fontWeight: '700' },
  identidade: { flex: 1, gap: 1 },
  nome: { color: cores.texto, fontSize: 15, fontWeight: '600' },
  detalhe: { color: cores.textoFraco, fontSize: 11 },
  metricas: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  forma: { fontSize: 14, width: 12, textAlign: 'center' },
  barraFundo: {
    width: 34,
    height: 5,
    borderRadius: 3,
    backgroundColor: cores.superficieAlta,
    overflow: 'hidden',
  },
  barraPreenchida: { height: '100%', borderRadius: 3 },
  overall: { fontSize: 17, fontWeight: '800', width: 28, textAlign: 'right' },
});

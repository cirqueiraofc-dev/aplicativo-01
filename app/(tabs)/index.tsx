import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '@/state/GameContext';
import { artilheiros } from '@/engine/season';
import { cores, espaco, formatarDinheiro, raio } from '@/ui/theme';

export default function Painel() {
  const {
    estado,
    clubeUsuario,
    tabela,
    totalRodadas,
    terminou,
    clubePorId,
    proximaPartida,
    avancarRodada,
    reiniciar,
  } = useGame();
  const [simulando, setSimulando] = useState(false);

  if (!estado || !clubeUsuario) return null;

  const posicao = tabela.findIndex((l) => l.clubeId === clubeUsuario.id) + 1;
  const minhaLinha = tabela.find((l) => l.clubeId === clubeUsuario.id);
  const goleadores = artilheiros(estado, 5);

  const ultimosResultados = estado.partidas
    .filter(
      (p) =>
        p.disputada &&
        (p.mandanteId === clubeUsuario.id || p.visitanteId === clubeUsuario.id),
    )
    .slice(-5)
    .reverse();

  function jogarRodada() {
    setSimulando(true);
    // Devolve o frame para o botão renderizar o estado "simulando" antes do cálculo.
    requestAnimationFrame(() => {
      avancarRodada();
      setSimulando(false);
    });
  }

  function confirmarReinicio() {
    Alert.alert('Recomeçar carreira', 'Isso apaga a temporada atual. Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => void reiniciar() },
    ]);
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.cabecalho}>
        <View style={[estilos.escudo, { backgroundColor: clubeUsuario.cor }]}>
          <Text style={estilos.escudoTexto}>{clubeUsuario.sigla}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={estilos.nomeClube}>{clubeUsuario.nome}</Text>
          <Text style={estilos.subtexto}>
            Temporada {estado.ano} · Rodada {Math.min(estado.rodadaAtual, totalRodadas)}/{totalRodadas}
          </Text>
        </View>
      </View>

      <View style={estilos.linhaCartoes}>
        <Indicador rotulo="Posição" valor={posicao > 0 ? `${posicao}º` : '—'} />
        <Indicador rotulo="Pontos" valor={`${minhaLinha?.pontos ?? 0}`} />
        <Indicador rotulo="Caixa" valor={formatarDinheiro(clubeUsuario.caixa)} />
      </View>

      {terminou ? (
        <View style={estilos.bloco}>
          <Text style={estilos.tituloBloco}>Temporada encerrada</Text>
          <Text style={estilos.textoBloco}>
            Campeão: {clubePorId(tabela[0].clubeId)?.nome ?? '—'}
          </Text>
          <Text style={estilos.textoBloco}>
            {clubeUsuario.nome} terminou em {posicao}º lugar com {minhaLinha?.pontos ?? 0} pontos.
          </Text>
        </View>
      ) : (
        <View style={estilos.bloco}>
          <Text style={estilos.tituloBloco}>Próximo jogo</Text>
          {proximaPartida ? (
            <Text style={estilos.confronto}>
              {clubePorId(proximaPartida.mandanteId)?.sigla} × {clubePorId(proximaPartida.visitanteId)?.sigla}
              <Text style={estilos.subtexto}>
                {'  '}
                {proximaPartida.mandanteId === clubeUsuario.id ? '(casa)' : '(fora)'}
              </Text>
            </Text>
          ) : (
            <Text style={estilos.textoBloco}>Sem jogos pendentes.</Text>
          )}

          <Pressable
            style={({ pressed }) => [
              estilos.botao,
              pressed && estilos.botaoPressionado,
              simulando && estilos.botaoDesativado,
            ]}
            disabled={simulando}
            onPress={jogarRodada}
          >
            <Text style={estilos.botaoTexto}>
              {simulando ? 'Simulando…' : 'Simular rodada'}
            </Text>
          </Pressable>
        </View>
      )}

      {ultimosResultados.length > 0 && (
        <View style={estilos.bloco}>
          <Text style={estilos.tituloBloco}>Últimos resultados</Text>
          {ultimosResultados.map((partida) => {
            const casa = partida.mandanteId === clubeUsuario.id;
            const meus = casa ? partida.golsMandante! : partida.golsVisitante!;
            const deles = casa ? partida.golsVisitante! : partida.golsMandante!;
            const adversario = clubePorId(casa ? partida.visitanteId : partida.mandanteId);
            const sigla = meus > deles ? 'V' : meus < deles ? 'D' : 'E';
            const cor = meus > deles ? cores.destaque : meus < deles ? cores.perigo : cores.ouro;

            return (
              <View key={partida.id} style={estilos.linhaResultado}>
                <View style={[estilos.marcador, { borderColor: cor }]}>
                  <Text style={[estilos.marcadorTexto, { color: cor }]}>{sigla}</Text>
                </View>
                <Text style={estilos.textoResultado}>
                  {casa ? 'Casa' : 'Fora'} · {adversario?.sigla}
                </Text>
                <Text style={estilos.placar}>
                  {meus} × {deles}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {goleadores.length > 0 && (
        <View style={estilos.bloco}>
          <Text style={estilos.tituloBloco}>Artilharia do campeonato</Text>
          {goleadores.map((jogador, indice) => (
            <View key={jogador.id} style={estilos.linhaResultado}>
              <Text style={estilos.indice}>{indice + 1}</Text>
              <Text style={estilos.textoResultado} numberOfLines={1}>
                {jogador.nome}
                <Text style={estilos.subtexto}> · {clubePorId(jogador.clubeId)?.sigla}</Text>
              </Text>
              <Text style={estilos.placar}>{jogador.gols}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable onPress={confirmarReinicio} style={estilos.linkPerigo}>
        <Text style={estilos.linkPerigoTexto}>Recomeçar carreira</Text>
      </Pressable>
    </ScrollView>
  );
}

function Indicador({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.indicador}>
      <Text style={estilos.indicadorRotulo}>{rotulo}</Text>
      <Text style={estilos.indicadorValor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, gap: espaco.md, paddingBottom: espaco.xl },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  escudo: {
    width: 52,
    height: 52,
    borderRadius: raio.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  escudoTexto: { color: '#fff', fontWeight: '800', fontSize: 15 },
  nomeClube: { color: cores.texto, fontSize: 20, fontWeight: '700' },
  subtexto: { color: cores.textoFraco, fontSize: 13 },
  linhaCartoes: { flexDirection: 'row', gap: espaco.sm },
  indicador: {
    flex: 1,
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.md,
    gap: 2,
  },
  indicadorRotulo: { color: cores.textoFraco, fontSize: 12 },
  indicadorValor: { color: cores.texto, fontSize: 17, fontWeight: '700' },
  bloco: {
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
    gap: espaco.sm,
  },
  tituloBloco: { color: cores.textoFraco, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  textoBloco: { color: cores.texto, fontSize: 15 },
  confronto: { color: cores.texto, fontSize: 22, fontWeight: '700' },
  botao: {
    backgroundColor: cores.destaque,
    borderRadius: raio.md,
    paddingVertical: espaco.md,
    alignItems: 'center',
    marginTop: espaco.sm,
  },
  botaoPressionado: { opacity: 0.85 },
  botaoDesativado: { opacity: 0.5 },
  botaoTexto: { color: '#06231A', fontSize: 16, fontWeight: '800' },
  linhaResultado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    paddingVertical: espaco.xs,
  },
  marcador: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcadorTexto: { fontSize: 12, fontWeight: '800' },
  textoResultado: { flex: 1, color: cores.texto, fontSize: 15 },
  placar: { color: cores.texto, fontSize: 15, fontWeight: '700' },
  indice: { width: 26, textAlign: 'center', color: cores.textoFraco, fontSize: 13 },
  linkPerigo: { alignItems: 'center', paddingVertical: espaco.md },
  linkPerigoTexto: { color: cores.perigo, fontSize: 14 },
});

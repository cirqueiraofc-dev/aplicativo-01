import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '@/state/GameContext';
import { cores, espaco, raio } from '@/ui/theme';

export default function Calendario() {
  const { estado, totalRodadas, clubePorId, partidasDaRodada } = useGame();
  const rodadaInicial = estado ? Math.min(estado.rodadaAtual, totalRodadas) : 1;
  const [rodada, setRodada] = useState(rodadaInicial);

  if (!estado) return null;

  const partidas = partidasDaRodada(rodada);

  return (
    <View style={estilos.tela}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={estilos.seletor}
      >
        {Array.from({ length: totalRodadas }, (_, i) => i + 1).map((numero) => {
          const ativa = numero === rodada;
          const jogada = numero < estado.rodadaAtual;
          return (
            <Pressable
              key={numero}
              onPress={() => setRodada(numero)}
              style={[estilos.chip, ativa && estilos.chipAtivo]}
            >
              <Text style={[estilos.chipTexto, ativa && estilos.chipTextoAtivo]}>{numero}</Text>
              {jogada && !ativa && <View style={estilos.chipMarca} />}
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={estilos.lista}>
        {partidas.map((partida) => {
          const mandante = clubePorId(partida.mandanteId);
          const visitante = clubePorId(partida.visitanteId);
          const envolveUsuario =
            partida.mandanteId === estado.clubeUsuarioId ||
            partida.visitanteId === estado.clubeUsuarioId;

          return (
            <View
              key={partida.id}
              style={[estilos.jogo, envolveUsuario && estilos.jogoDestacado]}
            >
              <View style={estilos.lado}>
                <Text style={[estilos.time, estilos.timeCasa]} numberOfLines={1}>
                  {mandante?.nome}
                </Text>
                <View style={[estilos.bolinha, { backgroundColor: mandante?.cor }]} />
              </View>

              <View style={estilos.placarCaixa}>
                <Text style={estilos.placar}>
                  {partida.disputada
                    ? `${partida.golsMandante} × ${partida.golsVisitante}`
                    : '×'}
                </Text>
              </View>

              <View style={estilos.lado}>
                <View style={[estilos.bolinha, { backgroundColor: visitante?.cor }]} />
                <Text style={estilos.time} numberOfLines={1}>
                  {visitante?.nome}
                </Text>
              </View>
            </View>
          );
        })}

        {partidas.some((p) => p.disputada && p.eventos.length > 0) && (
          <View style={estilos.bloco}>
            <Text style={estilos.tituloBloco}>Gols da rodada</Text>
            {partidas
              .flatMap((p) => p.eventos)
              .sort((a, b) => a.minuto - b.minuto)
              .map((evento, indice) => (
                <Text key={`${evento.jogadorId}-${indice}`} style={estilos.evento}>
                  <Text style={estilos.minuto}>{evento.minuto}'</Text> {evento.jogadorNome}
                  <Text style={estilos.eventoClube}> ({clubePorId(evento.clubeId)?.sigla})</Text>
                </Text>
              ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  seletor: { paddingHorizontal: espaco.md, paddingVertical: espaco.md, gap: espaco.xs },
  chip: {
    minWidth: 38,
    paddingVertical: espaco.sm,
    paddingHorizontal: espaco.sm,
    borderRadius: raio.sm,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    alignItems: 'center',
  },
  chipAtivo: { backgroundColor: cores.destaque, borderColor: cores.destaque },
  chipTexto: { color: cores.textoFraco, fontSize: 13, fontWeight: '600' },
  chipTextoAtivo: { color: '#06231A', fontWeight: '800' },
  chipMarca: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: cores.destaque,
  },
  lista: { padding: espaco.md, gap: espaco.xs, paddingBottom: espaco.xl },
  jogo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderRadius: raio.sm,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingVertical: espaco.md,
    paddingHorizontal: espaco.md,
  },
  jogoDestacado: { borderColor: cores.destaque },
  lado: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  timeCasa: { textAlign: 'right' },
  time: { flex: 1, color: cores.texto, fontSize: 13 },
  bolinha: { width: 8, height: 8, borderRadius: 4 },
  placarCaixa: { minWidth: 62, alignItems: 'center' },
  placar: { color: cores.texto, fontSize: 15, fontWeight: '800' },
  bloco: {
    marginTop: espaco.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
    gap: espaco.xs,
  },
  tituloBloco: {
    color: cores.textoFraco,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: espaco.xs,
  },
  evento: { color: cores.texto, fontSize: 14 },
  minuto: { color: cores.destaque, fontWeight: '700' },
  eventoClube: { color: cores.textoFraco },
});

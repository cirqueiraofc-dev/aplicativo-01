import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CLUB_SEEDS } from '@/data/names';
import { useGame } from '@/state/GameContext';
import { cores, espaco, raio } from '@/ui/theme';

function estrelas(reputacao: number): string {
  const total = Math.max(1, Math.round(reputacao / 20));
  return '★'.repeat(total) + '☆'.repeat(5 - total);
}

export default function NovoJogo() {
  const { iniciarJogo } = useGame();
  const router = useRouter();
  const [criando, setCriando] = useState(false);

  async function escolher(indice: number) {
    if (criando) return;
    setCriando(true);
    await iniciarJogo(indice);
    router.replace('/(tabs)');
  }

  if (criando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator color={cores.destaque} size="large" />
        <Text style={estilos.carregandoTexto}>Montando o campeonato…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.subtitulo}>
        Quanto menor a reputação, mais difícil a temporada. Todos os clubes e atletas são fictícios.
      </Text>

      {CLUB_SEEDS.map((clube, indice) => (
        <Pressable
          key={clube.sigla}
          style={({ pressed }) => [estilos.cartao, pressed && estilos.cartaoPressionado]}
          onPress={() => escolher(indice)}
        >
          <View style={[estilos.escudo, { backgroundColor: clube.cor }]}>
            <Text style={estilos.escudoTexto}>{clube.sigla}</Text>
          </View>
          <View style={estilos.info}>
            <Text style={estilos.nome}>{clube.nome}</Text>
            <Text style={estilos.reputacao}>{estrelas(clube.reputacao)}</Text>
          </View>
          <Text style={estilos.seta}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, gap: espaco.sm, paddingBottom: espaco.xl },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.md,
    backgroundColor: cores.fundo,
  },
  carregandoTexto: { color: cores.textoFraco, fontSize: 15 },
  subtitulo: {
    color: cores.textoFraco,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: espaco.sm,
  },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.md,
  },
  cartaoPressionado: { backgroundColor: cores.superficieAlta },
  escudo: {
    width: 44,
    height: 44,
    borderRadius: raio.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  escudoTexto: { color: '#fff', fontWeight: '800', fontSize: 13 },
  info: { flex: 1, gap: 2 },
  nome: { color: cores.texto, fontSize: 16, fontWeight: '600' },
  reputacao: { color: cores.ouro, fontSize: 13, letterSpacing: 1 },
  seta: { color: cores.textoFraco, fontSize: 24 },
});

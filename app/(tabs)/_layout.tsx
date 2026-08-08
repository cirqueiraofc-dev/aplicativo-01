import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useGame } from '@/state/GameContext';
import { cores } from '@/ui/theme';

function Icone({ simbolo, focado }: { simbolo: string; focado: boolean }) {
  return <Text style={{ fontSize: 18, opacity: focado ? 1 : 0.5 }}>{simbolo}</Text>;
}

export default function TabsLayout() {
  const { carregando, estado } = useGame();

  if (carregando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator color={cores.destaque} size="large" />
      </View>
    );
  }

  // Sem save, o jogador precisa escolher um clube antes de ver as abas.
  if (!estado) return <Redirect href="/novo-jogo" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: cores.superficie },
        headerTintColor: cores.texto,
        tabBarStyle: { backgroundColor: cores.superficie, borderTopColor: cores.borda },
        tabBarActiveTintColor: cores.destaque,
        tabBarInactiveTintColor: cores.textoFraco,
        sceneStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Clube',
          tabBarIcon: ({ focused }) => <Icone simbolo="🏟️" focado={focused} />,
        }}
      />
      <Tabs.Screen
        name="elenco"
        options={{
          title: 'Elenco',
          tabBarIcon: ({ focused }) => <Icone simbolo="👥" focado={focused} />,
        }}
      />
      <Tabs.Screen
        name="tabela"
        options={{
          title: 'Tabela',
          tabBarIcon: ({ focused }) => <Icone simbolo="📊" focado={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          title: 'Rodadas',
          tabBarIcon: ({ focused }) => <Icone simbolo="📅" focado={focused} />,
        }}
      />
    </Tabs>
  );
}

const estilos = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
  },
});

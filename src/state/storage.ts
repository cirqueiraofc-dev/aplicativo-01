import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState } from '@/domain/types';

const CHAVE_SAVE = 'craque-manager:save:v1';

export async function salvarJogo(estado: GameState): Promise<void> {
  await AsyncStorage.setItem(CHAVE_SAVE, JSON.stringify(estado));
}

export async function carregarJogo(): Promise<GameState | null> {
  const bruto = await AsyncStorage.getItem(CHAVE_SAVE);
  if (!bruto) return null;
  try {
    const estado = JSON.parse(bruto) as GameState;
    // Um save de formato antigo é descartado em vez de quebrar a tela.
    if (estado.versao !== 1) return null;
    return estado;
  } catch {
    return null;
  }
}

export async function apagarJogo(): Promise<void> {
  await AsyncStorage.removeItem(CHAVE_SAVE);
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Club, GameState, Match, Player, TableRow } from '@/domain/types';
import { criarNovoJogo } from '@/engine/generator';
import { calcularTabela, simularRodada, temporadaTerminou } from '@/engine/season';
import { TOTAL_RODADAS } from '@/engine/fixtures';
import { apagarJogo, carregarJogo, salvarJogo } from './storage';

interface GameContextValue {
  carregando: boolean;
  estado: GameState | null;
  clubeUsuario: Club | null;
  elencoUsuario: Player[];
  tabela: TableRow[];
  totalRodadas: number;
  terminou: boolean;
  clubePorId: (id: string) => Club | undefined;
  partidasDaRodada: (rodada: number) => Match[];
  proximaPartida: Match | null;
  iniciarJogo: (clubeIndice: number) => Promise<void>;
  avancarRodada: () => void;
  reiniciar: () => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<GameState | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    carregarJogo()
      .then((salvo) => {
        if (ativo) setEstado(salvo);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  // Persiste a cada mudança; o save é pequeno e a escrita é assíncrona.
  useEffect(() => {
    if (estado) void salvarJogo(estado);
  }, [estado]);

  const iniciarJogo = useCallback(async (clubeIndice: number) => {
    setEstado(criarNovoJogo(clubeIndice));
  }, []);

  const avancarRodada = useCallback(() => {
    setEstado((atual) => (atual ? simularRodada(atual) : atual));
  }, []);

  const reiniciar = useCallback(async () => {
    await apagarJogo();
    setEstado(null);
  }, []);

  const valor = useMemo<GameContextValue>(() => {
    const clubeUsuario = estado?.clubes.find((c) => c.id === estado.clubeUsuarioId) ?? null;
    const elencoUsuario = estado
      ? estado.jogadores
          .filter((j) => j.clubeId === estado.clubeUsuarioId)
          .sort((a, b) => b.overall - a.overall)
      : [];
    const tabela = estado ? calcularTabela(estado) : [];
    const proximaPartida = estado
      ? estado.partidas.find(
          (p) =>
            !p.disputada &&
            (p.mandanteId === estado.clubeUsuarioId || p.visitanteId === estado.clubeUsuarioId),
        ) ?? null
      : null;

    return {
      carregando,
      estado,
      clubeUsuario,
      elencoUsuario,
      tabela,
      totalRodadas: estado ? TOTAL_RODADAS(estado.clubes.length) : 0,
      terminou: estado ? temporadaTerminou(estado) : false,
      clubePorId: (id) => estado?.clubes.find((c) => c.id === id),
      partidasDaRodada: (rodada) => estado?.partidas.filter((p) => p.rodada === rodada) ?? [],
      proximaPartida,
      iniciarJogo,
      avancarRodada,
      reiniciar,
    };
  }, [estado, carregando, iniciarJogo, avancarRodada, reiniciar]);

  return <GameContext.Provider value={valor}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const contexto = useContext(GameContext);
  if (!contexto) throw new Error('useGame precisa estar dentro de <GameProvider>.');
  return contexto;
}

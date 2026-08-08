# Craque Manager

Jogo de gerenciamento de futebol single player, com campeonato de pontos corridos simulado — sem partidas jogáveis, só resultado e gestão. Feito em Expo (React Native + TypeScript), configurado para publicar na App Store e no Google Play sem precisar de Mac.

> Todos os clubes e atletas do jogo são **fictícios**. Nomes de clubes e jogadores reais são marca registrada de terceiros e exigiriam licenciamento pago.

## Como está montado

```
app/                     Rotas (expo-router)
  _layout.tsx            Provider do jogo + navegação raiz
  novo-jogo.tsx          Escolha de clube
  (tabs)/
    index.tsx            Painel: próximo jogo, simular rodada, artilharia
    elenco.tsx           Elenco com overall, forma e energia
    tabela.tsx           Classificação com faixas de Libertadores/rebaixamento
    calendario.tsx       Todas as 38 rodadas com placares e gols

src/
  domain/types.ts        Modelo de dados (Player, Club, Match, GameState…)
  data/names.ts          Clubes fictícios e listas de nomes
  engine/
    random.ts            RNG determinístico, normal e Poisson
    generator.ts         Geração de clubes, elencos e atributos
    fixtures.ts          Turno e returno pelo método do círculo
    match.ts             Simulação de partida (xG + Poisson) e escalação
    season.ts            Rodada, classificação, energia, forma e finanças
  state/
    GameContext.tsx      Estado global do jogo
    storage.ts           Save/load em AsyncStorage
  ui/theme.ts            Cores, espaçamentos e formatação
```

## Como a simulação funciona

1. Cada clube tem uma **reputação** (40–88) que define a média de atributos do elenco gerado.
2. Antes da partida, o time escala o melhor XI possível em 4-2-2-2, usando `overall` corrigido por **forma** (−5 a +5) e **energia** (0–100).
3. Força de ataque e de defesa saem da média ponderada por posição desses titulares.
4. Os gols esperados vêm da razão ataque/defesa elevada a 1,45, com 18% de bônus para o mandante.
5. O placar é sorteado de uma **Poisson** sobre esses gols esperados, e cada gol recebe um autor sorteado pela finalização e posição.
6. Depois da rodada: titulares perdem energia, reservas recuperam, a forma sobe ou desce pelo resultado, e o caixa recebe bilheteria e paga a folha.

### Calibração

O motor foi ajustado contra números reais do Brasileirão, medidos em 5 temporadas completas:

| Métrica | Resultado | Alvo real |
|---|---|---|
| Gols por jogo | 2,57 | ~2,5 |
| Pontos do campeão | 74 | 70–80 |
| Pontos do lanterna | 28 | 15–30 |
| Gols do artilheiro | 17 | 15–25 |
| Correlação força × pontos | 0,71 | 0,6–0,85 |

A correlação em 0,71 é proposital: o favorito costuma ganhar, mas cabe zebra.

## Rodando

```bash
npm install
npm start
```

Leia o QR code com o **Expo Go** no celular. `npm run typecheck` roda o TypeScript.

## Publicando sem Mac

1. Conta no **Apple Developer Program** (US$ 99/ano) para iOS.
2. Login no EAS: `npx eas login`
3. Credenciais geradas na nuvem: `npx eas credentials`
4. Build: `npm run build:ios:production` (compila nos servidores da Expo)
5. Preencha `appleId`, `ascAppId` e `appleTeamId` em `eas.json`
6. Envio: `npm run submit:ios`
7. Metadados e screenshots pelo navegador em [appstoreconnect.apple.com](https://appstoreconnect.apple.com)

## Scripts

| Script | O que faz |
|---|---|
| `npm start` | Metro bundler / Expo Go |
| `npm run typecheck` | Checagem de tipos |
| `npm run build:ios:preview` | Build interno de teste |
| `npm run build:ios:production` | Build para a App Store |
| `npm run submit:ios` | Envia à App Store Connect |

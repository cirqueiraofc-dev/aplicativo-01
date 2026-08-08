# aplicativo-01

App Expo (React Native + TypeScript) configurado para build e publicação na App Store via **EAS Build**, sem necessidade de Mac.

## Rodando localmente

```bash
npm install
npm start
```

Escaneie o QR code com o app **Expo Go** (iOS/Android) para testar no celular.

## Publicando na App Store sem Mac

### 1. Crie sua conta Apple Developer
Necessário para publicar: https://developer.apple.com/programs/ (US$ 99/ano).

### 2. Login no Expo/EAS
```bash
npx eas login
```
(crie uma conta gratuita em https://expo.dev se ainda não tiver)

### 3. Vincule o projeto ao EAS
```bash
npx eas init
```
Isso gera um `projectId` — copie o valor para `app.json` em `expo.extra.eas.projectId` (hoje está com o placeholder `SUBSTITUA_APOS_RODAR_EAS_INIT`).

### 4. Configure as credenciais iOS
```bash
npx eas credentials
```
O EAS gera e gerencia os certificados/provisioning profiles automaticamente na nuvem — não precisa de Xcode nem Mac.

Antes de compilar, ajuste em `app.json`:
- `expo.ios.bundleIdentifier` (hoje: `com.cirqueiraofc.aplicativo01`) — troque para o identifier real do seu app.
- `expo.android.package` — mesma coisa para Android.

### 5. Compile o `.ipa` na nuvem
```bash
npm run build:ios:production
```
O build roda 100% nos servidores da Expo/EAS. Acompanhe pelo link que aparece no terminal ou em https://expo.dev.

### 6. Envie para a App Store Connect
Antes, preencha em `eas.json` → `submit.production.ios`:
- `appleId`: seu e-mail da Apple Developer
- `ascAppId`: ID do app no App Store Connect (crie o app lá primeiro, em "Meus Apps")
- `appleTeamId`: seu Team ID (em https://developer.apple.com/account, seção Membership)

Depois:
```bash
npm run submit:ios
```

### 7. Finalize no App Store Connect
Preencha metadados, screenshots, descrição e envie para revisão — tudo pelo navegador, em https://appstoreconnect.apple.com.

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm start` | Inicia o Metro bundler / Expo Go |
| `npm run build:ios:preview` | Build interno de teste (TestFlight-like, não simulador) |
| `npm run build:ios:production` | Build final para envio à App Store |
| `npm run submit:ios` | Envia o build mais recente para App Store Connect |

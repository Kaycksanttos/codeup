# Publicar o CodeUp na Play Store e na App Store

O CodeUp já é um site instalável (PWA) hospedado na Render. As lojas aceitam um "app-casca" que abre esse site dentro de um aplicativo. Este guia é o caminho mais curto.

## Antes de tudo (vale para as duas lojas)

- [ ] **Endereço definitivo do site.** O endereço `onrender.com` serve para testar, mas o app de loja fica amarrado ao endereço. Compre um domínio (ex.: `codeup.com.br`), ligue na Render (Settings → Custom Domains) e troque `BASE_URL` para ele. Depois disso, não mude mais.
- [ ] **E-mail funcionando** (variáveis `RESEND_API_KEY` ou `SMTP_*`) para a recuperação de senha. Os avaliadores testam isso.
- [ ] **Política de Privacidade e Termos** — já existem em `/privacidade` e `/termos`. Confira o e-mail de contato (`CONTACT_EMAIL`).
- [ ] **Excluir conta dentro do app** — já existe (Perfil → Excluir minha conta). A Apple e o Google exigem.
- [ ] **Conta de demonstração** para os avaliadores (crie uma conta normal e informe e-mail e senha nas "Notas para a revisão").
- [ ] **Ícone 1024×1024** (sem transparência), **capturas de tela** do celular e um **texto de descrição**. Os ícones 192/512 e o maskable estão em `public/icons/`.

## O que o app já faz sozinho dentro das lojas

- Fica **conectado** (sessão de 1 ano, renovada a cada uso).
- **Esconde os anúncios do AdSense** e o botão **"Entrar com Google"** quando é aberto dentro do app de loja (o Google não permite AdSense de site dentro de app e bloqueia o login dele em WebView). Para o app ser reconhecido, o user agent precisa conter `CodeUpApp` (Capacitor: `appendUserAgent`) — ou ser um TWA do Android (reconhecido pelo `android-app://`).
- Se quiser anúncios dentro do app: use **AdMob** (SDK nativo), não AdSense.

## Android — Google Play (o mais fácil)

**Custo:** US$ 25, uma vez. **Conta pessoal nova:** o Google exige um *teste fechado* com **12 testadores** inscritos por **14 dias seguidos** antes de liberar a publicação (a regra vale para contas pessoais criadas depois de 13/11/2023).

1. Crie a conta em <https://play.google.com/console> e verifique a identidade.
2. Gere o app com o **PWABuilder** (<https://www.pwabuilder.com>): informe o endereço do site → "Package for stores" → Android. Ele cria um pacote **TWA** (`.aab`) e uma chave de assinatura. **Guarde a chave e a senha** — sem elas você não consegue atualizar o app.
3. Copie a **impressão digital SHA-256** do certificado (o PWABuilder mostra; no Play Console fica em Integridade do app → Assinatura).
4. Na Render → Environment, crie:
   - `ANDROID_PACKAGE` = o nome do pacote (ex.: `br.com.codeup.app`)
   - `ANDROID_SHA256` = a impressão digital (várias, separadas por vírgula, se houver)

   O site passa a publicar `/.well-known/assetlinks.json`, que faz o app abrir em **tela cheia**, sem a barra de endereço. Abra `https://SEU-SITE/.well-known/assetlinks.json` para conferir.
5. Play Console → Criar app → envie o `.aab` na faixa de **Teste fechado**, convide os 12 testadores (e-mails Google), espere os 14 dias e peça **acesso à produção**.
6. Preencha: ficha da loja, classificação de conteúdo, **Segurança dos dados** (coleta nome, e-mail e progresso de estudo; dá para excluir a conta) e **política de privacidade** (`https://SEU-SITE/privacidade`).

## iPhone — App Store

**Custo:** US$ 99 por ano (pessoa física: aprovação em horas ou dias; empresa: precisa de número D-U-N-S, leva alguns dias). **Exige um Mac com Xcode** (ou um serviço de build na nuvem, como Codemagic ou GitHub Actions com macOS).

1. Crie o **Apple Developer Program** em <https://developer.apple.com/programs/>.
2. Crie o projeto com o **Capacitor** (<https://capacitorjs.com>):

   ```bash
   mkdir codeup-app && cd codeup-app
   npm init -y && npm i @capacitor/core @capacitor/cli @capacitor/ios
   mkdir www && echo '<!doctype html><title>CodeUp</title>' > www/index.html
   npx cap init CodeUp br.com.codeup.app --web-dir=www
   ```

   No `capacitor.config.json` coloque o endereço do site e o marcador do app (assim o CodeUp sabe que está dentro do app e esconde AdSense e login do Google):

   ```json
   { "appId": "br.com.codeup.app", "appName": "CodeUp", "webDir": "www",
     "server": { "url": "https://SEU-SITE" },
     "ios": { "appendUserAgent": "CodeUpApp" } }
   ```

   Depois: `npx cap add ios`, `npx cap open ios`, ajuste ícone e splash e publique pelo Xcode (Product → Archive → Distribute → App Store Connect).
3. No **App Store Connect**: crie o app, envie capturas de tela do iPhone, descrição, URL de suporte, URL da política de privacidade e responda o questionário **App Privacy**.
4. Em "Notas para a revisão" informe a conta de demonstração.

### O maior risco: rejeição pela regra 4.2 (funcionalidade mínima)

A Apple recusa app que seja só "um site dentro de um app" (diretriz 4.2: o app precisa ter recursos e interface que vão além de um site reempacotado). Para passar, o app precisa parecer e se comportar como app:

- Telas pensadas para o celular — o CodeUp já é mobile-first, com navegação por abas, personagem animado, sons e progresso.
- **Algo que o Safari não oferece.** O mais útil para o CodeUp são **notificações push** (lembrete de estudo e de ofensiva) e/ou **uso offline** das lições já abertas. Recomendo incluir pelo menos um deles antes de enviar.
- Sem becos sem saída: sem internet, mostrar uma tela de "tentar de novo" em vez de um erro do navegador.
- Tudo funcionando na hora da revisão: site no ar, conta de demonstração, links de suporte e de privacidade.
- **Login com Google:** a diretriz 4.8 pede "Entrar com a Apple" quando há login de terceiros. Dentro do app o botão do Google já fica escondido (só e-mail e senha), o que evita o problema.
- Se um dia houver itens digitais pagos, eles precisam usar a compra dentro do app (In-App Purchase).

## Atualizações

- **Lições, correções e novos cursos:** é só publicar o site (push no GitHub → a Render atualiza). As duas lojas passam a mostrar a versão nova **sem reenviar o app**, porque o app abre o site.
- Só reenvie o app às lojas para mudar ícone, nome, permissões ou recursos nativos.

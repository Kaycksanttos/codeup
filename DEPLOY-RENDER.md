# Colocar o CodeUp no ar (Render) — passo a passo

Hoje o CodeUp só roda no seu computador. Estes passos colocam ele num endereço de internet (como `https://codeup.onrender.com`), 24 horas por dia, com banco de dados de verdade.

**Custo (tabela de preços do Render, conferida em 21/10/2026):** site ≈ US$ 7/mês + banco ≈ US$ 6/mês, cobrados por segundo de uso. Confira os valores atuais em render.com/pricing antes de começar. Os planos grátis do Render têm limitações (o site "dorme" quando ninguém usa e o banco grátis é temporário), por isso o `render.yaml` usa os pagos.

**Tempo:** uns 30 minutos na primeira vez. Depois, cada atualização é um comando.

---

## Parte 1 — Colocar o código no GitHub

O Render pega o código de um repositório do GitHub.

1. **Instale o Git** (se ainda não tem): https://git-scm.com/download/win — instale deixando as opções padrão. Feche e abra o VS Code depois.
2. **Crie uma conta** em https://github.com (grátis).
3. No GitHub: **New repository** → nome `codeup` → marque **Private** (privado) → **não** marque "Add a README" → **Create repository**.
4. No VS Code, abra a pasta do projeto (a que tem o `package.json`) e abra o terminal (**Terminal → New Terminal**). Digite, uma linha por vez:

```
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
git init
git add .
git status
```

5. **Confira o `git status`:** na lista **não pode** aparecer `data.json`, `.env`, `backups`, `node_modules` nem `teste-dados` (o arquivo `.gitignore` já impede). Se aparecer algum, pare e me avise — esses arquivos têm dados de alunos e senhas.
6. Continue (troque `SEU-USUARIO` pelo seu usuário do GitHub):

```
git commit -m "CodeUp"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/codeup.git
git push -u origin main
```

O Git abre uma janela do navegador para você entrar no GitHub. Depois do `push`, atualize a página do repositório: os arquivos devem aparecer lá.

---

## Parte 2 — Criar o site e o banco no Render

1. Crie a conta em https://render.com (dá para entrar com o GitHub).
2. **New → Blueprint** → autorize o Render a ver seu GitHub → escolha o repositório `codeup`.
3. O Render lê o `render.yaml` e mostra o que vai criar: **codeup** (site) e **codeup-db** (banco PostgreSQL). Depois pede os valores das variáveis:

| Variável | O que colocar |
|---|---|
| `BASE_URL` | por enquanto `https://codeup.onrender.com` (você corrige na Parte 3) |
| `COMPANY_NAME` | `CodeUp` (ou o nome da sua empresa) |
| `CONTACT_EMAIL` | o e-mail de suporte que aparece em Termos, Privacidade e Perfil (é público) |
| as demais (anúncios, Google, e-mail) | **deixe em branco por enquanto**; veja a Parte 4 |

4. Clique em **Deploy Blueprint** (em algumas telas aparece como **Apply**). O Render monta o site (leva de 5 a 10 minutos na primeira vez).
5. Abra o serviço **codeup → Logs**. Quando terminar, devem aparecer estas linhas:
   - `Dados em: PostgreSQL`
   - `Correção de Python no servidor: ATIVA`
   - `Correção de SQL no servidor: ATIVA`

   Se aparecer `DESATIVADA` na de Python, me mande o log.

---

## Parte 3 — Acertar o endereço e abrir o painel

1. No topo da página do serviço **codeup** o Render mostra o endereço real (por exemplo `https://codeup-x1y2.onrender.com`; se `codeup` já existir, ele acrescenta letras). Clique para abrir: deve aparecer a tela **"Você é feminino ou masculino?"**.
2. Vá em **Environment**, edite `BASE_URL` e coloque **esse endereço real** (com `https://`, sem barra no fim). Salve: o Render reinicia sozinho. Ele é usado nos links dos e-mails (confirmar e-mail, nova senha), nos links públicos dos certificados e para ligar a proteção HTTPS (HSTS).
3. Painel do dono: abra `SEU-ENDERECO/admin`. A senha é a variável `ADMIN_KEY`: em **Environment → ADMIN_KEY → Reveal**. O Render já gerou uma chave longa; você pode trocar por uma sua (16+ caracteres).

### Teste rápido (faça logo depois)
- [ ] Criar uma conta pelo celular (gênero → personagem → cadastro).
- [ ] Fazer uma lição de SQL e uma de Python e tocar em **Concluído**.
- [ ] Sair, entrar de novo: a conta e o XP continuam.
- [ ] Entrar no `/admin` e ver a conta nova.
- [ ] No Render, **Manual Deploy → Deploy latest commit** (reinicia o site) e conferir que a conta continua lá.

---

## Parte 4 — O que ainda falta para lançar de verdade

Pode ser feito um de cada vez; o app já funciona sem eles.

- **E-mail (obrigatório para valer):** sem ele, contas novas entram **sem confirmar o e-mail** e "Esqueci minha senha" não funciona. Crie a conta em resend.com, verifique o seu domínio, gere uma chave e coloque em **Environment**: `RESEND_API_KEY` e `MAIL_FROM` (`CodeUp <no-reply@seu-dominio.com.br>`). Detalhes no README, seção de e-mail.
- **Domínio próprio:** no serviço **Settings → Custom Domains → Add**. O Render mostra os registros DNS para colar no site onde você comprou o domínio; o HTTPS é automático. Depois **troque o `BASE_URL`** para o domínio novo.
- **Login com Google:** no Google Cloud, em *Origens JavaScript autorizadas*, adicione o endereço do site e coloque o `GOOGLE_CLIENT_ID` no Environment (README, seção Google).
- **Anúncios (AdSense):** o Google só aprova sites públicos com domínio, Termos e Privacidade. Você configura **pelo painel do dono**, sem mexer no Render: abra `/admin` → **Ajustes** → **Anúncios (Google AdSense)**, cole o código do AdSense (ou o ID do editor `ca-pub-…`) e ligue. O cartão tem o passo a passo e o `ads.txt` e a meta tag de verificação saem sozinhos. Quando o Google aprovar, cole também o ID do bloco de anúncios. As variáveis `ADSENSE_CLIENT`/`ADSENSE_SLOT` do Render ficam opcionais.
- **Painel em endereço separado (recomendado):** `ADMIN_HOST=admin.seu-dominio.com.br`, README seção 5b.

---

## Atualizar o site depois

Mudou algo no código? No terminal do VS Code:

```
git add .
git commit -m "o que mudou"
git push
```

O Render detecta e publica sozinho. As contas e o progresso ficam no banco e não se perdem.

---

## Cuidados importantes

- **Mantenha UMA só cópia do site rodando** (não aumente o número de instâncias). O CodeUp guarda os dados em memória e grava no banco a cada segundo; duas cópias se atrapalhariam.
- **Nunca** coloque `.env`, `data.json` ou chaves no GitHub. As chaves ficam só em **Environment** no Render.
- **Backup:** em Render → `codeup-db`, veja a aba de backup/recuperação do seu plano. Além disso, baixe de vez em quando o CSV de alunos no painel do dono.
- **Memória:** o plano de 512 MB aguenta o começo (o app usa ~120 MB parado; cada correção de Python com pandas, ~65 MB, no máximo 2 ao mesmo tempo). Se a aba **Metrics** mostrar a memória perto do limite, suba o plano do site.
- O `data.json` do seu computador **não sobe sozinho** — e é melhor assim, porque são contas de teste.

---

## Se algo der errado

| Sintoma | O que fazer |
|---|---|
| O Blueprint reclama de um campo ou nome de plano | Crie na mão: **New → PostgreSQL** (plano mais barato) e **New → Web Service → Docker** (mesmo repositório, mesma região); no site, crie a variável `DATABASE_URL` com a **Internal Database URL** do banco, mais as variáveis da tabela da Parte 2. |
| O log mostra `does not support SSL` ou `ECONNREFUSED` | Crie a variável `PGSSL` = `disable` e salve. Se for `ECONNREFUSED`, confira se site e banco estão na mesma região. |
| Site abre mas dá erro ao entrar com Google | Falta o endereço do site em *Origens JavaScript autorizadas* no Google Cloud, ou o `GOOGLE_CLIENT_ID` está errado. |
| `/admin` dá "Not found" | `ADMIN_KEY` não foi definida, ou `ADMIN_HOST` está definido e você abriu por outro endereço. |
| Atividades de Python falham ("O corretor não respondeu") | Veja se o log diz `Correção de Python no servidor: ATIVA`. Se o Render avisar "Out of memory", crie `PY_MAX_PARALLEL` = `1` ou suba o plano. |
| A primeira visita demora ou dá 502 | O deploy ainda está terminando; espere o status ficar **Live**. |

Qualquer mensagem de erro do log, copie e me mande que eu resolvo.

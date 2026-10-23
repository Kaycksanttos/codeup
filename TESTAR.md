# Como testar o CodeUp inteiro, do começo

O **modo teste** sobe uma cópia do app com dados novos, sem mexer no seu `data.json` nem no banco de verdade.
Nada do que você fizer ali aparece para os alunos, e nenhum e-mail real é enviado.

## Ligar

No terminal do VS Code, dentro da pasta do projeto:

```
npm run teste          # começa totalmente vazio
npm run teste:demo     # já vem com 12 alunos de exemplo (bom para ver o painel cheio)
```

O terminal mostra os endereços:

- **App dos alunos:** http://localhost:3100
- **Painel do dono:** http://localhost:3100/admin — chave: `admin-teste`

Para o app normal, continue usando `npm start` (porta 3000). Os dois podem ficar ligados ao mesmo tempo.

> Dica: abra o app numa **janela anônima** (Ctrl+Shift+N). Assim o navegador não guarda nada de testes anteriores e você entra como visitante novo.
> A faixa laranja no topo ("MODO TESTE") tem o botão **Começar do zero**: apaga todas as contas de teste e deixa o aparelho como novo.

## Roteiro (marque conforme for testando)

**1. Visitante novo**
- [ ] A primeira tela mostra o logo **CodeUp** e pergunta **"Você é feminino ou masculino?"** (passo 1 de 3).
- [ ] Escolher uma opção e tocar em **Continuar** leva ao passo 2: **"Quem vai te guiar na jornada?"** — Tay ou Cut. A escolha é livre: o gênero **não** decide o personagem.
- [ ] Ao escolher o personagem aparece a frase de apresentação dele ("Bora aprender juntas/juntos?" muda conforme o gênero). **Voltar** refaz o passo 1.
- [ ] Passo 3: **"Que nome você quer dar à Tay/ao Cut?"** — já vem o nome do personagem preenchido, dá para tocar numa sugestão (Luna, Nina, Mel…) ou digitar o seu. A fala do personagem mostra o nome ao vivo ("Oi! Eu sou Luna."). Com 1 letra, 15 letras ou símbolos como `<` o botão **Continuar** fica desligado e aparece o aviso.
- [ ] Ao continuar, o cadastro abre mostrando as escolhas ("Feminino · guia: Luna", por exemplo).

**2. Cadastro e e-mail**
- [ ] Criar conta (nome, e-mail, senha, aceitar os Termos). O gênero e o personagem escolhidos antes já ficam salvos na conta.
- [ ] Aparece o aviso "Confirme seu e-mail". Toque em **Reenviar e-mail**: no modo teste o link abre na hora e o e-mail fica confirmado.
- [ ] Sair e entrar de novo com o mesmo e-mail e senha.
- [ ] "Esqueci minha senha": no modo teste o link de nova senha abre na hora; criar a senha e conferir que já entra logado.

**3. Primeira trilha**
- [ ] Escolher Python (ou SQL). Passar pelo tour (ou **PULAR**).
- [ ] No mapa, só a lição 1 está aberta; as outras têm cadeado.
- [ ] Lição 1: ler a teoria (o exemplo aparece organizado, com a legenda "Como ler" no SQL), ir para a prática, digitar o código.
- [ ] Enquanto você digita, **nada** aparece (nem resultado, nem erro, nem dica de correção) e o botão **Concluído** fica preso ao rodapé da tela, sempre no mesmo lugar (teste também com o teclado do celular aberto).
- [ ] Ao tocar em **Concluído** (ou Ctrl+Enter): o resultado do código aparece na caixa "Saída/Resultado"; se errou, aparece abaixo o aviso com onde corrigir; se acertou, vêm XP e a próxima lição abre.
- [ ] Os botões **Dica**, **Ver dados** e **Solução** funcionam (no SQL a solução aparece organizada em linhas).
- [ ] Depois da lição 5 aparece o **checkpoint** (obrigatório antes da lição 6).

**4. Perfil**
- [ ] Em **Eu sou** dá para mudar Feminino/Masculino; em **Personagem**, trocar Tay/Cut; e escolher a aparência (Floresta, Rosa, Azul escuro, Claro). Textos como "Pronto/Pronta para a prova" acompanham o gênero.
- [ ] Em **Nome do personagem** dá para trocar o nome do guia; se você ainda não tinha dado nome e troca de Tay para Cut, o nome padrão acompanha.
- [ ] Trocar para a outra trilha (Python ↔ SQL) e voltar: o progresso de cada uma é separado.

**4b. Ranking, títulos e molduras**
- [ ] A barra de baixo tem 5 abas; **Ranking** (coroa) mostra **Esta semana** e **Geral**. Só aparece quem tem XP no período. Cada linha: posição, rostinho do personagem com a moldura, **primeiro nome + inicial** ("Lara O."), título e XP. Sua linha tem a marca "você".
- [ ] Em "Esta semana" aparece "Recomeça em X dias e Y h" (a semana vira na segunda-feira, meia-noite de Brasília). Em "Geral" não zera.
- [ ] Se você está depois do 20º lugar, aparece o cartão **"Você está em Nº lugar"** com o seu XP.
- [ ] Nunca aparece e-mail, sobrenome inteiro nem o nome que você deu ao personagem (esse é só seu).
- [ ] **Perfil → Ranking → Ficar de fora** (ou **Sair do ranking** na aba): você some da lista para todos; na aba aparece "Você está fora do ranking" com o botão **Aparecer no ranking**.
- [ ] **Perfil → Títulos e molduras:** 8 títulos (Iniciante 0 XP, Aprendiz 100, Praticante 300, Destaque 700, Craque 1.200, Expert 2.000, Mestre 3.200, Lenda 4.500). Os já conquistados têm **Usar** / **Em uso**; os outros mostram cadeado e quanto falta. Escolher uma moldura troca o aro do personagem no app e no ranking.
- [ ] Ao concluir uma lição que cruza o limite (ex.: de 95 para 110 XP) aparece o cartão **"Nova conquista! Você virou Aprendiz e ganhou a moldura Bronze."** com o link **Ver**. (Dica: no painel do dono, ajuste o XP da pessoa para 95 e faça uma lição.)

**5. Provas e certificado (sem fazer as 90 lições à mão)**
- [ ] Abra o painel do dono (`/admin`), entre com a chave `admin-teste`, aba **Usuários**, toque na pessoa e em **Liberar todos os cursos**.
- [ ] No app da pessoa os cadeados somem sozinhos (até 1 minuto, ou ao voltar para a aba) e aparece o aviso "Seus cursos foram liberados!".
- [ ] Fazer a prova do Básico (10 questões, 70% para passar). Errar de propósito uma vez para ver o "recomeçar o nível".
- [ ] Passar nas 3 provas de uma trilha e emitir o **certificado**; abrir o link público do certificado.

**6. Painel do dono**
- [ ] Visão geral: quadro "Quem é quem" com quantas pessoas são feminino/masculino e quantas escolheram Tay/Cut. Na ficha da pessoa e no CSV aparecem **Gênero** e **Personagem**.
- [ ] Visão geral, Usuários (busca, filtros, detalhe da pessoa), Aprendizado, Certificados, Ajustes (cadastros abertos/fechados, comunicado, modo livre), Sistema, Auditoria.
- [ ] Publicar um comunicado: ele aparece no app da pessoa sem recarregar.
- [ ] **Ajustes → Anúncios (Google AdSense):** cole um código de exemplo (ex.: `<ins class="adsbygoogle" data-ad-client="ca-pub-1234567890123456" data-ad-slot="9876543210"></ins>`), confira que os dois campos se preenchem, ligue e salve. Abra `/ads.txt` (deve mostrar a linha `google.com, pub-1234567890123456, DIRECT…`) e o app do aluno (aparece o aviso de cookies com um botão só, “Entendi”, e o quadro “Publicidade”; não há escolha de tipo de anúncio). Desligue e confirme que tudo some. (No modo teste os quadros cinzas de prévia continuam aparecendo enquanto você não salvar nada.)
- [ ] Suspender uma conta: a pessoa é desconectada e não consegue entrar; reativar.

**7. Do zero outra vez**
- [ ] Clique em **Começar do zero** (faixa laranja) e repita o roteiro com outro personagem.

## Contas de exemplo (só com `npm run teste:demo`)

Senha de todas: `teste1234`

Elas foram criadas **sem** gênero, sem personagem e sem nome de personagem, como as contas antigas: na primeira entrada o app faz as três perguntas uma vez só (é um bom teste de "conta antiga"). Quem já escolheu gênero e personagem mas ainda não deu nome ao guia vê só o passo do nome.

Para ver o ranking cheio, entre com a **julia@exemplo.com** (muito XP, moldura Esmeralda) e com outras; o ranking "Geral" mostra todas as contas de exemplo com e-mail confirmado.

| E-mail | O que tem |
|---|---|
| marina@exemplo.com | Python, 34 lições feitas |
| joao@exemplo.com | SQL, 20 lições |
| ana@exemplo.com | Python com curso liberado pelo dono |
| julia@exemplo.com | SQL completo, com certificado |
| bruno@exemplo.com | acabou de se cadastrar, sem trilha e sem e-mail confirmado |

## Por que é seguro

- Os dados do teste ficam só na pasta `teste-dados/` (apagada toda vez que você liga o modo teste).
- Se houver `DATABASE_URL` (banco de verdade) no seu ambiente, o modo teste **ignora** e usa só o arquivo.
- Em produção (`NODE_ENV=production`) o modo teste nunca liga, mesmo que alguém copie a configuração.

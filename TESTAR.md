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
- [ ] Em toda lição, a teoria mostra o **"o que é" dentro do balão do personagem** e 3 cartões: **Para que serve**, **Como você vai usar aqui** e **O que vai aparecer na tela** (textos escritos como se a pessoa tivesse 10 anos e visse aquilo pela primeira vez). A tela de prática fica limpa (só o desafio, o editor e os botões).
- [ ] Depois da lição 10 (e da 20) aparece o **checkpoint**: tela de abertura com as regras, **2 corações** (chances), sem Dica/Solução/Teoria. Errar 1 vez: sobra 1 coração (**código que dá erro**, como `SELEC` em vez de `SELECT` ou uma tabela que não existe, **também gasta** o coração; só não gasta se o ambiente de código nem carregar por falta de internet). Errar a 2ª: aparece a tela **"Não foi dessa vez"** com o personagem desanimado (**Cut azul** ou **Tay rosa**, conforme o guia escolhido) e **voltam 5 lições** (6 a 10, ou 16 a 20) e aparece a lista delas. A lição 11 (ou 21) só abre depois de passar.

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
- [ ] Ao concluir uma lição que cruza o limite (ex.: de 95 para 110 XP) aparece o cartão verde **"Desbloqueado!"** com o **título novo** (Aprendiz), a **moldura** (Bronze) e os **itens de personalização** que ele libera (cor Laranja, adesivo Foguete, fundo Floresta e estampa Bolinhas), mais o link **Personalizar meu personagem**. (Dica: no painel do dono, ajuste o XP da pessoa para 95 e faça uma lição.)
- [ ] O mesmo cartão **"Desbloqueado!"** lista o que a conquista abriu: depois de uma lição, a **próxima lição**; depois da lição 10 ou 20, o **checkpoint**; depois do checkpoint, a **lição 11 ou 21**; depois da lição 30, a **prova final**; depois da prova final, o **próximo nível** (e, no Avançado, o **certificado**). Se a pessoa repetir uma atividade que já tinha feito, o cartão não aparece.

**4c. Personalizar o personagem**
- [ ] No **Perfil → Personalizar personagem** aparece uma prévia do personagem inteiro (com o fundo e o adesivo escolhidos) e três grupos: **Cor da roupa**, **Adesivo** e **Fundo**.
- [ ] Tocar numa opção livre muda na hora a prévia, o rostinho do topo do Perfil, o ranking e as telas do app (a página não pula para o topo). **Original / Nenhum / Padrão** voltam ao começo.
- [ ] Itens ainda não conquistados aparecem apagados com cadeado; ao tocar, o aviso diz qual título libera ("Libera com o título Craque (1.200 XP)."). Livres desde o começo: Verde, Roxo e a cor do outro personagem, 3 adesivos (estrela, raio, coração) e 2 fundos (pôr do sol, oceano).
- [ ] O texto abaixo da prévia conta quantos itens já estão liberados ("16 de 37"). Com o título Lenda mostra que tudo foi liberado.
- [ ] Para testar sem ganhar XP à mão: painel do dono (`/admin`) → Usuários → pessoa → **XP** → defina 350 (libera até Vermelho), 4600 (libera tudo). Se o dono baixar o XP depois, o que deixou de ser liberado volta ao padrão.
- [ ] No Ranking, a linha de cada aluno mostra o rostinho na cor escolhida, com o fundo e o adesivo no canto.

**4d. Personagem animado e estilo da roupa**
- [ ] O personagem de corpo inteiro (tela de resultado da lição/prova, escolha de trilha, tela de entrada e a prévia do Perfil) **se mexe sozinho**: respira, balança de leve, inclina a cabeça e **pisca**. A Tay mexe o cabelo; o Cut balança o joinha.
- [ ] **Tocar no personagem** faz ele mudar de expressão. Ao **passar** numa lição/prova ele **comemora** (pulinhos); ao **errar** a prova ele fica de cabeça baixa e balança a cabeça dizendo "não".
- [ ] No **Perfil → Personalizar personagem** há o grupo **Estilo da roupa** (Liso, Listrado, Bolinhas, Xadrez, Degradê, Estrelas, Camuflado, Tie-dye, Galáxia, Dourado, Holográfico). A prévia muda na hora, e a estampa vale para o moletom e a calça (logos, corações, coroas e partes brancas dos tênis ficam como são). A cor escolhida em **Cor da roupa** colore as estampas simples; Tie-dye, Galáxia, Dourado e Holográfico têm cores próprias.
- [ ] Livres desde o começo: **Liso** e **Listrado**. Os outros pedem título (Bolinhas: Aprendiz · Xadrez e Degradê: Praticante · Estrelas e Camuflado: Destaque · Tie-dye: Craque · Galáxia: Expert · Dourado: Mestre · Holográfico: Lenda). Bloqueados aparecem com cadeado.
- [ ] **Conquistas**: ao subir de nível (a cada 100 XP) a tela de resultado mostra o personagem agachar, dar um **pulo grande de braços para cima**, com um **brilho passando pelo corpo**, faíscas e um anel dourado, e o balão diz "Subiu de nível!". Ao ganhar um **título novo** o balão diz "Agora você é Craque!" (ou o título que for) e as faíscas, o anel e o brilho do fundo ficam **na cor do título**. Ao ser **aprovado numa prova** ou **concluir a trilha** acontece o mesmo (a trilha concluída com a animação mais forte). Para ver sem esperar: painel do dono → defina o XP da pessoa um pouco abaixo de um título (ex.: 95 ou 1.190) e faça uma lição.
- [ ] No **Perfil → Personalizar personagem**, trocar qualquer item faz o personagem da prévia dar um **pulinho com um brilho** e algumas faíscas.
- [ ] **Expressões**: no **Perfil**, logo abaixo da prévia, a linha **Expressões** tem um botão com a carinha de cada pose (Tay: Pulo, Paz, Apaixonada, Rindo, Piscadinha, Palmas, Agachadinha, Descansando, Pensativa, Brava · Cut: Pulo, Paz, Estiloso, Joinha, Tímido, Uau!, Dab, Agachado, Pensativo, Bravo). Tocar num botão faz o personagem da prévia **trocar para aquela pose**, se mexer e soltar os desenhinhos (corações, estrelas, raiva…). **Tocar no personagem** sorteia uma expressão; **cinco toques seguidos** deixam ele **bravo** (treme) e depois **rindo**.
- [ ] **Cor**: escolha outra **Cor da roupa** (ex.: Verde) e toque nas expressões: a pose usa a mesma cor (a língua do Cut continua vermelha). As estampas de **Estilo da roupa** valem no corpo animado, mas **não** nas poses (só a cor).
- [ ] **Situações**: ao concluir uma **lição**, o personagem faz uma sequência de poses (Tay: rindo → palmas → piscadinha; Cut: joinha → dab → agachado); no **checkpoint** e nas **conquistas** (depois do pulo grande) também; na **escolha de trilha** ele aparece **pensando com "?"**; na **prova** faz piscadinha/estiloso; ao **errar a prova** ("Calma, vamos de novo!") fica pensativo; na **tela de entrada** faz a pose de paz com o balão **"Oi!"** e repete de tempos em tempos; no **mapa**, ao lado da lição atual, aparece o personagem **de frente** (nunca de costas), respirando e fazendo uma expressão de vez em quando, sem retângulo ou sombra quadrada atrás.
- [ ] **Acerto**: numa lição, errar primeiro mostra o aviso laranja balançando, com a **carinha pensativa** do personagem aparecendo em cima, e toca um som curto de "ops". Acertar mostra uma tela verde **"Acertou!"** com o XP (+10, +15…), raios girando, faíscas e o personagem comemorando; ela some sozinha em ~2 s ou ao tocar, e aí vem o resultado da lição. Acertar **de primeira** (sem errar antes) mostra **"De primeira!"** em dourado; acertar de primeira várias lições seguidas mostra **"Combo ×3!"** (o som sobe de tom). Lição já feita antes mostra "Já feita · sem XP novo".
- [ ] **Sequência de dias (frequência)**: na **primeira lição do dia**, depois do resultado, aparece uma tela laranja com a **chama** acesa, o número de dias rolando (ex.: 4 → 5), "5 dias seguidos!" e a semana com os dias treinados marcados. No primeiro dia aparece "Sequência iniciada!". Nos **marcos** (3, 7, 14, 30, 50, 100, 200 e 365 dias) o título vira "Marco: 7 dias seguidos!", a cor fica dourada e cai confete. Uma segunda lição no mesmo dia **não** mostra a tela de novo. Para ver sem esperar: crie uma conta nova e conclua a 1ª lição (aparece a sequência de 1 dia).
- [ ] **Prova**: ao ser **aprovado**, aparece o **troféu dourado** caindo e brilhando, "Aprovado!", a nota, confete e o personagem pulando; o botão **Continuar** surge após ~2 s e leva ao resultado completo. Na última prova da trilha o título é "Trilha concluída!". Ao **não passar** não há tela cheia: o resultado mostra o personagem pensativo e toca um som triste.
- [ ] **Sons**: no **Perfil → Sons**, **Ligados/Desligados** (ao ligar toca um "ding"). Com o som ligado, ouça: acerto (dois sininhos), de primeira (arpejo), erro ("uh-oh"), lição concluída (fanfarra curta), checkpoint, nível novo (escala subindo), sequência (sopro de chama + sinos), marco (chama + fanfarra), prova aprovada (fanfarra longa) e reprovada (trombone triste). Tocar no personagem faz um "pop". Desligado = silêncio total, e a escolha continua depois de fechar o app. Em aba escondida não toca nada. (O navegador só libera o som depois do primeiro toque na página.)
- [ ] Em **Ajustes do sistema → Acessibilidade → Reduzir movimento** (ou no navegador), o personagem fica parado (sem poses), mas mantém a estampa.
- [ ] Em um aparelho/navegador sem WebGL o personagem aparece como imagem normal (com a flutuação antiga) e o resto do app funciona igual.

**5. Provas e certificado (sem fazer as 90 lições à mão)**
- [ ] Abra o painel do dono (`/admin`), entre com a chave `admin-teste`, aba **Usuários**, toque na pessoa e em **Liberar todos os cursos**.
- [ ] No app da pessoa os cadeados somem sozinhos (até 1 minuto, ou ao voltar para a aba) e aparece o aviso "Seus cursos foram liberados!".
- [ ] Fazer a **prova final** do Básico (uma tarefa só, 3 chances, sem dica). Errar de propósito 3 vezes: aparece "Não foi dessa vez" e **voltam 10 lições** (21 a 30). Depois refazer as 10 lições e passar: aparece o troféu e o nível Intermediário abre.
- [ ] Passar nas 3 provas finais de uma trilha e emitir o **certificado**; abrir o link público do certificado.

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

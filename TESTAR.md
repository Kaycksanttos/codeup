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

**3. Primeiro curso**
- [ ] Escolher Python (ou SQL). Passar pelo tour (ou **PULAR**).
- [ ] No mapa, só a lição 1 está aberta; as outras têm cadeado.
- [ ] Lição 1: ler a teoria (o exemplo aparece organizado, com a legenda "Como ler" no SQL), ir para a prática, digitar o código.
- [ ] **Tutorial da primeira lição:** na primeira vez que você abre a lição 1 de um curso (teoria, executar, ler o código), o guia abre um tutorial passo a passo que destaca cada parte da tela (progresso, desafio, onde escrever, ajudas, resultado, **Concluído**). **Pular** ou **Esc** fecham; o botão **?** no topo reabre quando quiser; quem já concluiu lições daquele curso não vê sozinho. Para ver de novo como visitante novo: **Começar do zero** (ou janela anônima).
- [ ] **Cartão da tabela (SQL):** em toda atividade de SQL (teoria, prática, ler e explicar o código) aparece o cartão **Tabela desta atividade** com o **nome da tabela** (ex.: `produtos`) e as colunas dela; o nome fica em destaque e o aviso "Também existe no banco" lista as outras tabelas. Nas provas aparecem todas as tabelas do banco.
- [ ] Enquanto você digita, **nada** aparece (nem resultado, nem erro, nem dica de correção) e o botão **Concluído** fica preso ao rodapé da tela, sempre no mesmo lugar (teste também com o teclado do celular aberto).
- [ ] Ao tocar em **Concluído** (ou Ctrl+Enter): o resultado do código aparece na caixa "Saída/Resultado"; se errou, aparece abaixo o aviso com onde corrigir; se acertou, vem a tela **"Atividade concluída!"** com a parte do XP daquela atividade e o botão da **próxima atividade** (a próxima lição ainda **não** abre).
- [ ] **A ordem das atividades é sorteada:** a lição 1 pode abrir primeiro em **executar** ou em **ler o código**; outras lições começam por outra atividade. Feche e abra de novo, entre em outro aparelho: a ordem daquela lição **não muda**. Duas contas diferentes podem cair em ordens diferentes na mesma lição.
- [ ] **Ler o código:** aparece um código pronto e uma pergunta (escolher a alternativa ou digitar a resposta; no SQL, as tabelas do exemplo; no Excel, uma planilha). Errar mostra uma dica e dá para tentar de novo, sem perder vida. Acertar mostra o porquê e a parte do XP e dos diamantes.
- [ ] **Explicar o código (só Python e SQL, níveis Intermediário e Avançado; no Básico e no Excel não existe):** aparece um código (no SQL, com as tabelas) e uma caixa para escrever com as suas palavras o que ele faz ou o que ele traz. Teste: (1) escrever só "não sei" → pede para escrever um pouco mais, sem contar tentativa; (2) copiar o código → avisa que isso é o próprio código; (3) escrever algo vago → mostra "Você já cobriu 0 de 2 ideias" e **o que ainda falta explicar** (só a pista); (4) errar 3 vezes → aparece **um exemplo de boa explicação**; (5) escrever uma explicação certa com as suas palavras → "Boa explicação!", +XP e a explicação de exemplo. Errar nunca gasta vida nem pontos.
- [ ] A lição só conta como **concluída** (e a próxima só abre) quando **todas** as atividades dela estão feitas: 2 no Básico e no Excel, 3 no Intermediário e no Avançado de Python e SQL. O XP se divide (por exemplo 15 XP = 5 + 5 + 5) e os diamantes também (+2, +2, +1 com 3 atividades). Repetir uma atividade já feita não dá XP de novo.
- [ ] **Anel no mapa:** cada círculo de lição tem um anel dividido em **2 arcos** (Básico e Excel) ou **3 arcos** (Intermediário e Avançado de Python e SQL): nada feito = cinza; cada atividade feita acende um arco em verde; todas = anel inteiro verde com brilho. Lição bloqueada tem o anel apagado. Confira nos visuais Azul, Rosa, Azul escuro e Claro.
- [ ] Tocar numa lição que já tem uma atividade pronta abre direto a **próxima da fila**. A tela de "Atividade concluída!" tem os botões **Voltar ao mapa** e **Rever explicação**, e qualquer atividade tem o link "Precisa relembrar? Veja a explicação da lição".
- [ ] A barra de ajudas da prática tem **Dica**, **Dados**, **Solução**, **Teoria** e **Limpar**, todos com ícone e nome, em uma linha só e do mesmo tamanho; funcionam (no SQL a solução aparece organizada em linhas). Nas provas só aparecem **Dados** e **Limpar**.
- [ ] **Acabamento**: ao abrir o app aparece a marca **CodeUp** com uma barrinha (não uma tela vazia); sem internet aparece "Não foi possível carregar" com **Tentar de novo**; com a sessão expirada o app abre o **login**. Na tela **Início** o progresso fica dentro do cartão **Continuar**, a faixa do nível é fina e o mapa já aparece na primeira tela; a aba **Desafios** tem o mesmo título e as regras das provas em duas linhas com ícone. As logos **oficiais do Python e do SQL** (a nova do SQL, azul) aparecem inteiras, sem quadradinho, em Início, lição, escolha de trilha e Trilhas.
- [ ] **Cursos** (segunda aba): no topo o seu avatar com anel, **Nível**, barra de XP, sequência e diamantes; depois o título **Cursos**, o balão da personagem, a **busca** (“Buscar curso…”) e as **categorias** (Todos, Programação, Dados, Produtividade) que filtram a lista. Cada curso é um cartão com a **ilha** com a logo, o nome, o **XP** (coroa, ex.: 0/2.130 XP), a descrição, as etiquetas (nível, categoria, nº de lições), a **barra de progresso** e o botão redondo com seta; o curso em que você está tem a etiqueta **Atual**. Embaixo, **Em breve**: Power BI e DAX, Análise de Dados e Storytelling. Confira também nos outros visuais (Rosa, Azul escuro, Claro) e no celular pequeno (nada cortado).
- [ ] **Mapa com cenário** (visual **Azul**, o padrão): a tela **Início** mostra o cartão do curso (logo, nome, **Nível 1 · Básico**, barra e **n/30**), os 3 níveis em uma linha e o mapa logo abaixo. Ao longo do caminho de lições aparece uma **floresta à noite**: pinheiros, pedras, moitas, capim, flores, cogumelos que brilham, um **lago**, uma **coruja dormindo** (com "z z Z" subindo), a **placa com a logo do curso** (Python, SQL ou Excel) e um **lampião** que pisca; vaga-lumes passam devagar. Tudo rola junto com o mapa. A lição do momento mostra o **personagem em pé num pedestal que brilha**, com o **cartão** ("Lição 1 · título · INICIAR") do lado livre; checkpoint e prova final têm o mesmo cartão. Os botões das lições têm só o **número** (o título aparece no cartão da lição atual). Confira: nada de peça em cima do cartão ou do botão, o cartão não corta em tela pequena (360 px), no computador o cenário fica na coluna do meio, e nos visuais **Rosa** (cores rosa/roxo), **Neo** e **Azul escuro** o mapa continua com os títulos ao lado e o balão **COMEÇAR**.
- [ ] **Entrada com e-mail e senha:** pare o servidor de teste, crie `ADMIN_EMAIL=teste@exemplo.com` e `ADMIN_PASSWORD=senha-de-teste-123` (no `.env` ou ao ligar) e abra `/admin`: a tela pede **E-mail** e **Senha**. Senha errada, e-mail errado ou e-mail vazio mostram sempre "E-mail ou senha incorretos."; o certo (com maiúsculas diferentes no e-mail) entra. Na aba **Sistema**, o item **Acesso do admin** diz "Entrada fixa com e-mail e senha". Tire as duas variáveis e ligue de novo: volta a pedir só a chave `admin-teste`.
- [ ] **Autenticador no painel** (`/admin`, chave `admin-teste`): aba **Sistema** → item **Autenticador** → **Ligar o autenticador**. Aparece um **QR Code** e a chave em texto. Escaneie com o Google Authenticator (ou outro app), digite o código de 6 dígitos e toque em **Ligar** (escolha **Chave + código** ou **Só o código**). Toque em **Sair**: a entrada agora pede o código (e a chave, no modo recomendado). Confira: **código errado** dá erro sem dizer se foi a chave ou o código; **o mesmo código não entra duas vezes** ("já foi usado"); **5 códigos errados seguidos** travam por 15 minutos; com o autenticador ligado, a chave sozinha não abre os scripts (`x-admin-key` dá 404); em **Sistema → Desligar** pede um código novo do app. Teste também a recuperação: pare o servidor, ligue com `ADMIN_2FA_OFF=1` e veja que entra só com a chave.
- [ ] **Sem câmera / abrindo o painel no próprio celular:** na mesma janela "Ligar o autenticador" há 3 botões. **Abrir no app autenticador** abre o aplicativo com a conta pronta; **Copiar chave** mostra "Chave copiada" (no app: **+** → *Inserir chave de configuração* → colar); **Enviar pelo WhatsApp** abre o WhatsApp com a chave escrita na mensagem (com a variável `ADMIN_WHATSAPP` definida, já na conversa com o seu número; sem ela, você escolhe o contato). Confira que a tela cabe em 360 px e que depois de ligar você **apaga a mensagem** do WhatsApp.
- [ ] Em toda lição, a teoria mostra o **"o que é" dentro do balão do personagem** e 3 cartões: **Para que serve**, **Como você vai usar aqui** e **O que vai aparecer na tela** (textos escritos como se a pessoa tivesse 10 anos e visse aquilo pela primeira vez). A tela de prática fica limpa (só o desafio, o editor e os botões).
- [ ] Depois da lição 10 (e da 20) aparece o **checkpoint**: tela de abertura com as regras, **2 corações** (chances), sem Dica/Solução/Teoria. Errar 1 vez: sobra 1 coração (**código que dá erro**, como `SELEC` em vez de `SELECT` ou uma tabela que não existe, **também gasta** o coração; só não gasta se o ambiente de código nem carregar por falta de internet). Errar a 2ª: aparece a tela **"Não foi dessa vez"** com o personagem **chorando** (**Cut azul** ou **Tay rosa**, conforme o guia escolhido) e **voltam 5 lições** (6 a 10, ou 16 a 20) e aparece a lista delas. A lição 11 (ou 21) só abre depois de passar.

**4. Perfil**
- [ ] No topo do Perfil fica o **cartão com seu nome** (lápis para editar), e-mail, o **título** (ex.: Praticante), o **nível** e o **XP total**; a moldura escolhida tinge o cartão. Logo abaixo, as **3 abas: Resumo, Personagem e Ajustes**.
- [ ] **Resumo:** o cartão de progresso mostra **Próximo título (faltam X XP)** e **Nível N → N+1**; depois vêm 6 números (dias de treino, lições feitas, provas aprovadas, XP total, XP na semana), as **Conquistas** ("3 de 8") e **Títulos e molduras**.
- [ ] **Personagem:** em **Eu sou** dá para mudar Feminino/Masculino; em **Personagem**, trocar Tay/Cut; e em **Nome do personagem**, o nome do guia. Abaixo vem **Personalizar personagem** (veja 4c).
- [ ] **Ajustes:** **Ranking** (Aparecer / Ficar de fora), **Sons** (Ligados / Desligados) e **Aparência** (Azul, Rosa, Azul escuro, Claro); depois **Minha conta** (Estudar outro curso, Alterar senha, Rever o tour, Baixar meus dados, Sair) e a **Zona de perigo** (Excluir minha conta). Textos como "Pronto/Pronta para a prova" acompanham o gênero.
- [ ] Em **Nome do personagem** dá para trocar o nome do guia; se você ainda não tinha dado nome e troca de Tay para Cut, o nome padrão acompanha.
- [ ] Trocar para outro curso (Python ↔ SQL ↔ Excel) e voltar: o progresso de cada uma é separado.

**4b. Ranking, títulos e molduras**
- [ ] A barra de baixo tem 5 abas; **Ranking** (coroa) mostra **Esta semana** e **Geral**. Só aparece quem tem XP no período. No topo fica o cartão **Sua posição** ("Você está em 4º lugar", seu XP e a barra "Faltam N XP para o 3º lugar"; no 1º lugar aparece "Você lidera"). Os **3 primeiros ficam num pódio** (1º no meio, com coroa e degrau dourado; 2º prata; 3º bronze). Do 4º em diante vem a lista: posição, rostinho com a moldura, **primeiro nome + inicial** ("Lara O."), título, uma barrinha de XP em relação ao 1º lugar e o XP. Sua linha fica destacada, com a marca "você". Com só 1 ou 2 pessoas o pódio mostra só elas; sem ninguém, aparece o aviso "Ninguém pontuou ainda".
- [ ] Acima do cartão há duas etiquetas: "Recomeça em X dias e Y h" (só em "Esta semana") e "N alunos".
- [ ] Em "Esta semana" aparece "Recomeça em X dias e Y h" (a semana vira na segunda-feira, meia-noite de Brasília). Em "Geral" não zera.
- [ ] Se você está depois do 20º lugar, o cartão **"Você está em Nº lugar"** continua no topo e a sua linha aparece no fim da lista, separada por "· · ·".
- [ ] Nunca aparece e-mail, sobrenome inteiro nem o nome que você deu ao personagem (esse é só seu).
- [ ] **Perfil → Ajustes → Ranking → Ficar de fora** (ou **Ocultar meu nome do ranking**, no cartão **Sua privacidade** no fim da aba Ranking): você some da lista para todos; no cartão **Sua posição** aparece "Fora do ranking" com o botão **Aparecer no ranking**. Sem e-mail confirmado o cartão pede para confirmar o e-mail.
- [ ] **Perfil → Resumo → Títulos e molduras:** 8 títulos em quadradinhos (Iniciante 0 XP, Aprendiz 100, Praticante 300, Destaque 700, Craque 1.200, Expert 2.000, Mestre 3.200, Lenda 4.500). Os já conquistados são tocáveis e o que está **em uso** fica com contorno e um ✓; os outros mostram cadeado e o XP necessário. Tocar numa moldura conquistada troca o aro do personagem no app e no ranking.
- [ ] Ao concluir uma lição que cruza o limite (ex.: de 95 para 110 XP) aparece o cartão verde **"Desbloqueado!"** com o **título novo** (Aprendiz), a **moldura** (Bronze) e os **itens de personalização** que ele libera (cor Laranja, adesivo Foguete, fundo Floresta e estampa Bolinhas), mais o link **Personalizar meu personagem**. (Dica: no painel do dono, ajuste o XP da pessoa para 95 e faça uma lição.)
- [ ] O mesmo cartão **"Desbloqueado!"** lista o que a conquista abriu: depois de uma lição, a **próxima lição**; depois da lição 10 ou 20, o **checkpoint**; depois do checkpoint, a **lição 11 ou 21**; depois da lição 30, a **prova final**; depois da prova final, o **próximo nível**. Se a pessoa repetir uma atividade que já tinha feito, o cartão não aparece.

**4c. Personalizar o personagem**
- [ ] No **Perfil → Personagem → Personalizar personagem** aparece uma prévia do personagem inteiro (com o fundo e o adesivo escolhidos) e uma fileira de abas: **Expressões, Cor, Estilo, Adesivo e Fundo** (uma de cada vez, para a tela não ficar enorme).
- [ ] Tocar numa opção livre muda na hora a prévia, o rostinho do topo do Perfil, o ranking e as telas do app (a página não pula para o topo). **Original / Nenhum / Padrão** voltam ao começo.
- [ ] Itens ainda não conquistados aparecem apagados com cadeado; ao tocar, o aviso diz qual título libera ("Libera com o título Craque (1.200 XP)."). Livres desde o começo: Verde, Roxo e a cor do outro personagem, 3 adesivos (estrela, raio, coração) e 2 fundos (pôr do sol, oceano).
- [ ] O texto abaixo da prévia conta quantos itens já estão liberados ("16 de 37"). Com o título Lenda mostra que tudo foi liberado.
- [ ] Para testar sem ganhar XP à mão: painel do dono (`/admin`) → Usuários → pessoa → **XP** → defina 350 (libera até Vermelho), 4600 (libera tudo). Se o dono baixar o XP depois, o que deixou de ser liberado volta ao padrão.
- [ ] No Ranking, a linha de cada aluno mostra o rostinho na cor escolhida, com o fundo e o adesivo no canto.

**4c-2. Fantasias e diamantes** (com a **Tay** ou o **Cut**; dica: no painel do dono ajuste o XP da pessoa; os dias de estudo só sobem estudando em dias diferentes — para pular essa espera, pare o servidor, edite `"days"` (e `"streak"`) da pessoa no `data.json` de teste e ligue de novo)
- [ ] No topo do app aparece o contador de **diamantes** 💎 ao lado da sequência e do XP. Em celular pequeno (320–360 px) os contadores descem para uma segunda linha em vez de estourar a tela.
- [ ] Fazer uma lição pela primeira vez soma **+5 💎** (aparece "+5 💎" na tela de resultado); repetir a mesma lição **não** soma de novo; checkpoint dá +5 e prova final +20.
- [ ] **Perfil → Personagem → Personalizar → Fantasias** mostra a grade das fantasias (20 da Tay, 19 do Cut): as que você tem, as da loja com o preço e as bloqueadas como **silhueta** com cadeado. Tocar abre a ficha com o que falta ("Falta o título Praticante", "Faltam 3 dias de estudo", "Faltam 40 diamantes").
- [ ] **Comprar** uma fantasia da loja (precisa do título e dos diamantes): o saldo desce, ela já sai vestida e aparece no topo do Perfil, no mapa, no ranking e na tela de resultado. Comprar a mesma de novo não cobra.
- [ ] **Conquista:** com o título Aprendiz e o 3º dia de estudo, a **Gatinha** aparece no cartão **"Desbloqueado!"** ("Nova fantasia: Gatinha") com o link **Ver o guarda-roupa**; ela **não** se veste sozinha. Só XP alto, sem os dias, **não** libera.
- [ ] No 3º, 7º, 14º, 30º, 60º e 100º dia seguidos aparece o bônus de diamantes da sequência, uma vez só por marco.
- [ ] **Sem fantasia** volta ao personagem animado normal. Trocar de personagem guarda as fantasias do outro (o Cut tem as dele: Tubarão, Panda, Ursinho, Craque, Basquete, Chef, Ninja, Policial, Fotógrafo, Samurai, Super-herói, Diabinho na loja; Gatinho, Dino, Doutor, Astronauta, Mago, Rei e Anjinho por conquista); voltar ao primeiro traz tudo de volta.

**4c-3. Aparência da entrada**
- [ ] Escolha **Rosa** em Perfil → Ajustes → Aparência (ou entre como Tay), saia e abra o site de novo: a tela **Entre na sua conta**, o **cadastro** (feminino/masculino, personagem, nome) e o **Esqueci minha senha** aparecem sempre no visual **Azul** (floresta à noite), nunca no cenário rosa. Escolher a **Tay** no cadastro também não troca o cenário.
- [ ] Depois de entrar com uma conta da Tay (que tem o Rosa salvo), **dentro do app** o visual Rosa volta. Quem escolheu **Claro** ou **Azul escuro** vê o seu também na entrada.

**4d. Personagem animado e estilo da roupa**
- [ ] **Tela de entrada** (login e cadastro): só a marca **CodeUp** e a frase, **sem personagem**.
- [ ] O personagem de corpo inteiro (tela de resultado da lição/prova, escolha de curso e a prévia do Perfil) **se mexe sozinho**: respira, balança de leve, inclina a cabeça e **pisca**. A Tay mexe o cabelo; o Cut balança o joinha.
- [ ] **Tocar no personagem** faz ele mudar de expressão. Ao **passar** numa lição/prova ele **comemora** (pulinhos); ao **errar** a prova ele fica de cabeça baixa e balança a cabeça dizendo "não".
- [ ] No **Perfil → Personagem → Personalizar personagem** há a aba **Estilo** (estilo da roupa) (Liso, Listrado, Bolinhas, Xadrez, Degradê, Estrelas, Camuflado, Tie-dye, Galáxia, Dourado, Holográfico). A prévia muda na hora, e a estampa vale para o moletom e a calça (logos, corações, coroas e partes brancas dos tênis ficam como são). A cor escolhida em **Cor da roupa** colore as estampas simples; Tie-dye, Galáxia, Dourado e Holográfico têm cores próprias.
- [ ] Livres desde o começo: **Liso** e **Listrado**. Os outros pedem título (Bolinhas: Aprendiz · Xadrez e Degradê: Praticante · Estrelas e Camuflado: Destaque · Tie-dye: Craque · Galáxia: Expert · Dourado: Mestre · Holográfico: Lenda). Bloqueados aparecem com cadeado.
- [ ] **Conquistas**: ao subir de nível (a cada 100 XP) a tela de resultado mostra o personagem agachar, dar um **pulo grande de braços para cima**, com um **brilho passando pelo corpo**, faíscas e um anel dourado, e o balão diz "Subiu de nível!". Ao ganhar um **título novo** o balão diz "Agora você é Craque!" (ou o título que for) e as faíscas, o anel e o brilho do fundo ficam **na cor do título**. Ao ser **aprovado numa prova** ou **concluir o curso** acontece o mesmo (o curso concluído com a animação mais forte). Para ver sem esperar: painel do dono → defina o XP da pessoa um pouco abaixo de um título (ex.: 95 ou 1.190) e faça uma lição.
- [ ] No **Perfil → Personagem → Personalizar personagem**, trocar qualquer item faz o personagem da prévia dar um **pulinho com um brilho** e algumas faíscas.
- [ ] **Expressões**: no **Perfil → Personagem**, logo abaixo da prévia, a aba **Expressões** (a primeira) tem um botão com a carinha de cada pose: **18** para a **Tay** (Estudando, Piscadinha, Pulo, Apaixonada, Pensativa, Ideia!, Codando, Vitória!, Coração, Rindo, Estilosa, Brava, Ops!, Dormindo, Oi/Tchau!, Olha ali, Explicando, Joinha) e **23** para o **Cut** (Oi/Tchau!, Piscadinha, Dançando, Pensativo, Ideia!, Apontando, Estiloso, Ops!, Joinha, Codando, Curtindo, De boa, Vitória!, Coração, Bravo, Dormindo, Marrento, No celular, Entediado, Deitado, Dab!, Correndo, Chorando). As imagens vêm das duas folhas novas, com a borda limpa (sem halo) e os desenhinhos no lugar (lâmpada da Ideia!, notas musicais do Curtindo, "zzz" do Dormindo, "?" do Pensativo, "!" do Ops!, faísca do Estiloso, veia do Bravo, corações). Tocar num botão faz o personagem da prévia **trocar para aquela pose**, se mexer e soltar os desenhinhos. **Tocar no personagem** sorteia uma expressão; **cinco toques seguidos** deixam ele **bravo** (treme) e depois **sorrindo**.
- [ ] **Poses só do Cut nas telas**: **Dab!** na comemoração de uma lição/checkpoint/prova; **Correndo** na tela de sequência de dias; **No celular** no personagem do mapa; **Marrento** em alguns acertos; **Chorando** na tela "Calma, vamos relembrar!" quando reprova numa prova (a Tay mostra a imagem triste dela).
- [ ] **Cor**: escolha outra **Cor da roupa** (ex.: Verde) e toque nas expressões: a pose usa a mesma cor (a língua do Cut continua vermelha). As estampas de **Estilo da roupa** valem no corpo animado, mas **não** nas poses (só a cor).
- [ ] **Situações**: ao concluir uma **lição**, o personagem faz uma sequência de poses (pulo/vitória → joinha, piscadinha, coração…); no **checkpoint** e nas **conquistas** (depois do susto "ops!" e do pulo grande) também; na **escolha de curso** ele aparece **pensando com "?"**; na **teoria** da lição aparece **explicando** ao lado do balão; na **prática** aparece **codando** no canto do cabeçalho; ao tocar em **Dica** aparece a carinha da **ideia** (lâmpada); ao **errar** o cartão vermelho mostra **"ops!"** (código com erro) ou **pensativo** (resposta que só não está certa); no cartão **Desbloqueado!** aparece o personagem **apontando**; na **tela de entrada** ele acena (tchau) com o balão **"Oi!"** e repete de tempos em tempos; no **mapa**, ao lado da lição atual, aparece o personagem **de frente** (nunca de costas), respirando e fazendo uma expressão de vez em quando, sem retângulo ou sombra quadrada atrás.
- [ ] **Personagem dormindo** (aluno que sumiu por dias): no **modo teste**, entre numa conta e toque em **Simular ausência** na faixa laranja. Aparece uma tela de **noite estrelada** com a lua e o personagem **dormindo abraçado ao travesseiro** com os "zzz", o texto "Faz 5 dias que você não aparece…" e o botão **Acordar**. Ao tocar, ele **acorda assustado e acena "Oi!"**, o fundo fica quente e o botão vira **Bora estudar!** (ou fecha sozinho em ~5 s). Depois de acordar, a tela **não volta** ao recarregar. Com **Reduzir movimento** ligado aparece a imagem parada, sem animação. (Em produção a tela aparece depois de `AWAY_DAYS` dias sem entrar, padrão 3.)
- [ ] **Acerto**: numa lição, errar primeiro mostra o aviso laranja balançando, com a **carinha pensativa** do personagem aparecendo em cima, e toca um som curto de "ops". Acertar mostra uma tela verde **"Acertou!"** com o XP (+10, +15…), raios girando, faíscas e o personagem comemorando; ela some sozinha em ~2 s ou ao tocar, e aí vem o resultado da lição. Acertar **de primeira** (sem errar antes) mostra **"De primeira!"** em dourado; acertar de primeira várias lições seguidas mostra **"Combo ×3!"** (o som sobe de tom). Lição já feita antes mostra "Já feita · sem XP novo".
- [ ] **Sequência de dias (frequência)**: na **primeira lição do dia**, depois do resultado, aparece uma tela laranja com a **chama** acesa, o número de dias rolando (ex.: 4 → 5), "5 dias seguidos!" e a semana com os dias treinados marcados. No primeiro dia aparece "Sequência iniciada!". Nos **marcos** (3, 7, 14, 30, 50, 100, 200 e 365 dias) o título vira "Marco: 7 dias seguidos!", a cor fica dourada e cai confete. Uma segunda lição no mesmo dia **não** mostra a tela de novo. Para ver sem esperar: crie uma conta nova e conclua a 1ª lição (aparece a sequência de 1 dia).
- [ ] **Prova**: ao ser **aprovado**, aparece o **troféu dourado** caindo e brilhando, "Aprovado!", a nota, confete e o personagem pulando; o botão **Continuar** surge após ~2 s e leva ao resultado completo. Na última prova do curso o título é "Curso concluído!". Ao **não passar** não há tela cheia: o resultado mostra o personagem pensativo e toca um som triste.
- [ ] **Sons**: no **Perfil → Ajustes → Sons**, **Ligados/Desligados** (ao ligar toca um "ding"). Com o som ligado, ouça: acerto (dois sininhos), de primeira (arpejo), erro ("uh-oh"), lição concluída (fanfarra curta), checkpoint, nível novo (escala subindo), sequência (sopro de chama + sinos), marco (chama + fanfarra), prova aprovada (fanfarra longa) e reprovada (trombone triste). Tocar no personagem faz um "pop". Desligado = silêncio total, e a escolha continua depois de fechar o app. Em aba escondida não toca nada. (O navegador só libera o som depois do primeiro toque na página.)
- [ ] Em **Ajustes do sistema → Acessibilidade → Reduzir movimento** (ou no navegador), o personagem fica parado (sem poses), mas mantém a estampa.
- [ ] Em um aparelho/navegador sem WebGL o personagem aparece como imagem normal (com a flutuação antiga) e o resto do app funciona igual.

**5. Provas (sem fazer as 90 lições à mão)**
- [ ] Abra o painel do dono (`/admin`), entre com a chave `admin-teste`, aba **Usuários**, toque na pessoa e em **Liberar todos os cursos**.
- [ ] No app da pessoa os cadeados somem sozinhos (até 1 minuto, ou ao voltar para a aba) e aparece o aviso "Seus cursos foram liberados!".
- [ ] Fazer a **prova final** do Básico (uma tarefa só, 3 chances, sem dica). Errar de propósito 3 vezes: aparece "Não foi dessa vez" e **voltam 10 lições** (21 a 30). Depois refazer as 10 lições e passar: aparece o troféu e o nível Intermediário abre.

**5b. Curso de Excel**
- [ ] Na aba **Cursos**, abra **Excel**: a lição 1 tem teoria (explicação + planilha de exemplo) e prática.
- [ ] Na prática: toque numa célula verde, digite `=B2*C2` na barra de fórmulas (ou use os botões `= ( ) ; : $`) e confirme ✓. Em fórmulas, toque numa célula para **inserir a referência**; toque de novo logo em seguida para fazer um **intervalo** (ex.: `B2:B6`).
- [ ] Use **Preencher ↓** para copiar a fórmula para as linhas de baixo e conclua: acertou = tela de resultado com sua planilha; errou = diagnóstico célula a célula (vazia, erro de sintaxe, valor diferente, número digitado em vez de fórmula).
- [ ] Digitar o número pronto (ex.: `25` em vez de `=B2*C2`) **não** deve passar.

**5c. Curso de Power BI e DAX**
- [ ] Na aba **Cursos**, abra **Power BI e DAX**: as lições 1 a 10 são quizzes (escolher, ligar, ordenar, marcar vários, digitar número e **montar um visual** escolhendo eixo e valores). Errar mostra a explicação só nas perguntas erradas; acertar tudo conclui a atividade.
- [ ] Na lição 7 (primeiro visual) escolha o tipo, o eixo e a medida e veja o gráfico aparecer **antes** de tocar em Concluído.
- [ ] Lição 11 (DAX): escreva `Total Vendas = SUM(Vendas[Valor])` e conclua. Teste: `Total Vendas = 747` (número digitado) **não** passa; `Total Vendas = SUM(Vendas[Qtd])` mostra uma tabela com o que veio e o que era esperado; um erro de parêntese mostra a linha do erro.
- [ ] Lição 15: aceita `* 0.05` e também `* 0,05`. Lição 17: sem o terceiro argumento do DIVIDE o produto sem venda online some da tabela de comparação.
- [ ] Lições 21 a 26 (colunas calculadas): uma coluna errada mostra as linhas em que o valor não bate.
- [ ] Checkpoint depois da 10 (quiz), depois da 20 (5 medidas) e prova final (6 colunas): 2 e 3 chances; as provas não têm Dica, Solução nem Teoria.
- [ ] O Intermediário e o Avançado do Power BI ainda não existem.

**5d. Curso de Análise de Dados e Storytelling**
- [ ] Na aba **Cursos**, abra **Análise de Dados e Storytelling** (ícone e cores próprios): as 30 lições do Básico são quizzes com tabelas e gráficos; errar mostra a explicação só nas perguntas erradas.
- [ ] Lição 6 (limpeza): a tabela mostra as células vazias em itálico (“vazio”); digitar `445` na soma passa e `525` (com a cópia repetida) não.
- [ ] Lição 9: a média aceita `6,14` e `6.14`; lição 13: as perguntas de queda pedem o número **sem sinal** (`45`, `11,4`, `50`).
- [ ] Lição 21 (gráficos que enganam): o gráfico de colunas começa em 90 de propósito; a pergunta 3 pede quantas vezes a coluna parece maior (`1,6`).
- [ ] Lição 23 (títulos), 25 (insight), 26, 27 e 29: há uma pergunta **escrita**; um texto sem sentido não passa e mostra o que falta; um texto muito curto pede mais palavras.
- [ ] Lição 28: monte um cartão, uma tabela e uma segmentação escolhendo os campos; o visual aparece antes de tocar em Concluído.
- [ ] Checkpoints (depois da 10 e da 20) e prova final (12 perguntas, 3 delas escritas): 2 e 3 chances; sem Dica, Solução nem Teoria; passando a prova final o curso fica concluído.

**5e. Continuar conectado**
- [ ] Entre com e-mail e senha, feche o app/aba por completo e abra de novo (também depois de algumas horas/dias): você continua dentro, sem pedir senha.
- [ ] No iPhone (Safari ou ícone na tela inicial): depois de uns 8 dias sem abrir o app, continua conectado.
- [ ] Toque em **Sair**: o app volta para a tela de login e, ao fechar e abrir de novo, **não** entra sozinho.
- [ ] Entrar em outro aparelho não derruba o primeiro (até 10 aparelhos por pessoa); trocar a senha derruba os outros aparelhos.

**6. Painel do dono**
- [ ] **Ajustes → Cursos do aplicativo:** desative o **Excel** (o painel pede confirmação). No app do aluno o Excel some da aba Cursos, da escolha do primeiro curso e dos Desafios, e as lições dele ficam bloqueadas. Reative e volte tudo ao normal. Tente desativar o último curso ativo: o painel recusa.
- [ ] Visão geral: quadro "Quem é quem" com quantas pessoas são feminino/masculino e quantas escolheram Tay/Cut. Na ficha da pessoa e no CSV aparecem **Gênero** e **Personagem**.
- [ ] Visão geral, Usuários (busca, filtros, detalhe da pessoa), Aprendizado, Ajustes (cursos ativos, cadastros abertos/fechados, comunicado, modo livre), Sistema, Auditoria.
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
| julia@exemplo.com | SQL completo |
| bruno@exemplo.com | acabou de se cadastrar, sem curso escolhido e sem e-mail confirmado |

## Por que é seguro

- Os dados do teste ficam só na pasta `teste-dados/` (apagada toda vez que você liga o modo teste).
- Se houver `DATABASE_URL` (banco de verdade) no seu ambiente, o modo teste **ignora** e usa só o arquivo.
- Em produção (`NODE_ENV=production`) o modo teste nunca liga, mesmo que alguém copie a configuração.

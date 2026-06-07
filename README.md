# CriticalPoint

CriticalPoint e um serious game digital desenvolvido para apoiar o estudo de Calculo Multivariavel. O jogo mistura acao em arena, narrativa curta, tutorial interativo, perguntas matematicas e progressao por waves para reforcar conceitos trabalhados na disciplina de Resolucao de Problemas Multivariaveis.

## Objetivo educacional

O objetivo do jogo e ajudar o estudante a revisar e praticar conceitos essenciais de funcoes de varias variaveis em um ambiente mais ludico e interativo. A proposta busca transformar exercicios de calculo em desafios de sobrevivencia, nos quais avancar depende de compreender os conceitos matematicos apresentados.

Ao jogar, o estudante deve praticar:

- Avaliacao de funcoes de duas variaveis.
- Calculo de derivadas parciais.
- Interpretacao do vetor gradiente.
- Identificacao de pontos criticos.
- Uso da matriz Hessiana para classificar maximos, minimos e pontos de sela.
- Raciocinio progressivo em problemas de Calculo Multivariavel.

## Publico-alvo

O jogo foi pensado para estudantes de graduacao que estejam cursando ou revisando conteudos de Calculo Multivariavel, especialmente em disciplinas que trabalham funcoes de varias variaveis, derivadas parciais, gradiente e otimizacao.

## Narrativa

O jogador controla Zion, um estudante que esta com dificuldade para entender os conteudos de Calculo Multivariavel. Depois de uma aula sobre gradiente, derivadas parciais e pontos criticos, Zion volta para casa tentando estudar. Ao acessar o computador, ele entra em uma simulacao digital inspirada em uma matriz, onde cada wave representa uma barreira de conhecimento.

Para escapar da simulacao e concluir o desafio, Zion precisa enfrentar inimigos, responder questoes e superar o boss final.

## Como o jogo funciona

CriticalPoint e um jogo em canvas, executado diretamente no navegador. A experiencia e dividida em:

- Cenas narrativas iniciais.
- Tutorial com arquivos de estudo.
- Waves de combate.
- Questoes matematicas entre os desafios.
- Loja de upgrades.
- Troca de armas a cada 5 waves.
- Penalidade quando o jogador erra uma questao.
- Tela de game over.
- Tela de vitoria ao concluir a wave final.

O jogo possui 100 waves. A dificuldade aumenta conforme o jogador avanca, com mais inimigos, inimigos mais resistentes e maior variedade de ameacas.

## Conteudos matematicos abordados

| Conteudo | Como aparece no jogo |
| --- | --- |
| Funcoes de varias variaveis | O tutorial apresenta funcoes do tipo `f(x,y)` e as primeiras perguntas cobram substituicao de valores em pontos especificos. |
| Derivadas parciais | Questoes pedem calculo de `df/dx` e `df/dy`, reforcando a ideia de variar uma coordenada enquanto a outra permanece constante. |
| Gradiente | O jogo trabalha o vetor `grad f`, com perguntas sobre componentes do gradiente e inimigos que usam movimento inspirado em direcao de gradiente. |
| Pontos criticos | Waves avancadas pedem identificacao de pontos onde as derivadas parciais se anulam. |
| Hessiana | O tutorial e as questoes usam a segunda derivada para classificar pontos como minimo, maximo ou sela. |
| Otimizacao | O boss final usa uma questao de ponto critico como fechamento do percurso matematico. |

## Mecanicas principais

- **Combate em arena:** o jogador se movimenta, mira e atira em inimigos.
- **Sistema de waves:** cada wave aumenta a pressao e prepara o jogador para novas questoes.
- **Questoes com feedback:** ao responder, o jogo informa se o jogador acertou ou errou. Em caso de erro, a alternativa marcada aparece destacada e a resposta correta e exibida.
- **Penalidade por erro:** errar uma questao invoca inimigos especiais e um boss de castigo.
- **Loja:** o jogador usa pontos para comprar melhorias de shield, dano, velocidade e cooldown.
- **Limites de balanceamento:** vida e shield sao limitados a 100 cada, totalizando no maximo 200 de resistencia. O poder de fogo e a velocidade tambem possuem limite.
- **Armas alternativas:** a cada 5 waves o jogador pode trocar de arma, escolhendo entre tiro padrao, tiro triplo, explosiva, precisao e pulso.
- **Boss final:** a conclusao da wave 100 representa o encerramento da simulacao.

## Tipos de inimigos

O jogo conta com diferentes inimigos para variar a estrategia:

- Inimigo normal: fraco, aparece em grande quantidade.
- Laranja: mais resistente.
- Gradiente: usa movimento inspirado em direcao de gradiente.
- Atirador: mantem distancia e dispara contra o jogador.
- Rapido: persegue o jogador com maior velocidade.
- Explosivo: detona proximo ao jogador.
- Sniper: ataca de longe.
- Regenerador: recupera vida ao longo do tempo.
- Nodo de protecao: protege aliados proximos.
- Carrier: libera inimigos menores ao ser destruido.
- Boss de castigo: surge quando o jogador erra uma questao.
- Boss final: desafio principal da ultima wave.

## Controles

- `W`, `A`, `S`, `D` ou setas: mover Zion.
- Mouse: mirar.
- Clique do mouse: atirar ou selecionar opcoes.
- `1`, `2`, `3`, `4`: escolher alternativas nas questoes.
- `Enter`: confirmar ou avancar em telas especificas.
- `Espaco`: avancar em alguns momentos narrativos.

## Como executar

Como o projeto usa HTML, CSS e JavaScript puro, basta abrir o arquivo `index.html` em um navegador moderno.

Tambem e possivel executar com um servidor local simples, por exemplo:

```bash
python3 -m http.server 8000
```

Depois, acesse:

```text
http://localhost:8000
```

## Estrutura do projeto

```text
CriticalPoint/
├── index.html
├── style.css
├── src/
│   ├── main.js
│   ├── player.js
│   ├── enemy.js
│   ├── bullet.js
│   ├── matrix.js
│   ├── particles.js
│   ├── hud.js
│   └── music.js
├── assets/
└── README.md
```

## Arquivos principais

- `index.html`: estrutura base da pagina e carregamento dos scripts.
- `style.css`: estilos gerais da pagina e do canvas.
- `src/main.js`: controle dos estados do jogo, narrativa, tutorial, waves, questoes, loja e loop principal.
- `src/player.js`: criacao, movimento, dano e upgrades do jogador.
- `src/enemy.js`: criacao, movimentacao, desenho, dano e spawn dos inimigos.
- `src/bullet.js`: logica dos tiros do jogador e dos inimigos.
- `src/matrix.js`: efeitos visuais de fundo.
- `src/particles.js`: particulas e efeitos de impacto.
- `src/hud.js`: interface, HUD, loja e tela de questoes.
- `src/music.js`: musica de fundo gerada no navegador.

## Alinhamento com a proposta da atividade

O projeto atende a proposta de serious game por conectar conteudos de Calculo Multivariavel com uma experiencia jogavel. A progressao por waves, os tutoriais e as perguntas criam um ciclo de estudo, aplicacao e feedback.

Pontos ja contemplados:

- Jogo digital funcional.
- Narrativa e contexto definidos.
- Conteudos de funcoes, derivadas parciais, gradiente, pontos criticos e Hessiana.
- Mecanicas de progressao e dificuldade crescente.
- Feedback imediato em questoes.
- Diversidade de inimigos e desafios.
- Tela de game over e tela de vitoria.

Pontos que ainda precisam ser fortalecidos antes da entrega final:

- Incluir mais questoes sobre dominio, imagem e interpretacao grafica de funcoes de varias variaveis.
- Explicar melhor, dentro do jogo ou da documentacao, como cada mecanica representa um conceito matematico.
- Realizar uma rodada de testes externos com professor e colegas.
- Criar formulario de avaliacao com clareza, dificuldade, diversidade de desafios, engajamento e sugestoes.
- Registrar um relatorio de testes com feedback recebido e melhorias implementadas.

## Sugestao de roteiro de testes

Para validar o jogo, recomenda-se aplicar um teste com pelo menos um professor e alguns colegas. O formulario pode conter perguntas como:

- Os conceitos matematicos ficaram claros?
- As questoes estavam adequadas ao nivel da disciplina?
- A dificuldade das waves foi progressiva?
- O feedback de acerto e erro ajudou no aprendizado?
- O tutorial foi suficiente para preparar o jogador?
- O jogo foi engajador?
- Quais melhorias voce sugere?

## Status

Versao em desenvolvimento. O jogo ja possui estrutura funcional, combate, tutorial, perguntas, loja, inimigos variados, sistema de erro, boss final, game over e vitoria. A proxima etapa recomendada e reforcar os conteudos de dominio, imagem e interpretacao grafica, alem de produzir o relatorio de testes externos.

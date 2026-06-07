const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const STATE_FACULDADE = 'faculdade'
const STATE_CAMINHO = 'caminho'
const STATE_CASA = 'casa'
const STATE_COMPUTADOR = 'computador'
const STATE_CUTSCENE = 'cutscene'
const STATE_TUTORIAL = 'tutorial'
const STATE_PLAYING = 'playing'
const STATE_QUESTION = 'question'
const STATE_SHOP = 'shop'
const STATE_GAMEOVER = 'gameover'

const keys = {}
const mouse = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  down: false
}

const LIMITE_BALAS_PLAYER = 120
const LIMITE_BALAS_INIMIGAS = 260
const LIMITE_PARTICULAS = 280
const LIMITE_ONDAS = 24
const WAVE_BOSS_FINAL = 8

const QUESTOES = {
  1: {
    titulo: 'Wave 1 - Funcoes de varias variaveis',
    texto: 'Calcule f(2,3) para f(x,y) = x^2 + y^2',
    dica: 'Substitua x por 2 e y por 3.',
    alternativas: [
      { texto: '9', correta: false },
      { texto: '12', correta: false },
      { texto: '13', correta: true },
      { texto: '25', correta: false }
    ]
  },
  2: {
    titulo: 'Wave 2 - Derivada parcial',
    texto: 'Calcule df/dx de f(x,y) = 3x^2 + 2xy + y^2',
    dica: 'Trate y como constante.',
    alternativas: [
      { texto: '6x + 2y', correta: true },
      { texto: '6x + 2x', correta: false },
      { texto: '3x + 2y', correta: false },
      { texto: '6x + y^2', correta: false }
    ]
  },
  3: {
    titulo: 'Wave 3 - Vetor gradiente',
    texto: 'Qual a direcao do gradiente de f(x,y) = x^2 + y^2 no ponto (1,2)?',
    dica: 'O gradiente e formado por (df/dx, df/dy).',
    alternativas: [
      { texto: '(1, 2)', correta: false },
      { texto: '(2, 4)', correta: true },
      { texto: '(4, 2)', correta: false },
      { texto: '(2, -4)', correta: false }
    ]
  },
  4: {
    titulo: 'Wave 4 - Pontos criticos',
    texto: 'Classifique o ponto critico de f(x,y) = x^2 - y^2 no ponto (0,0)',
    dica: 'A curvatura muda de sinal entre x e y.',
    alternativas: [
      { texto: 'Minimo local', correta: false },
      { texto: 'Maximo local', correta: false },
      { texto: 'Ponto regular', correta: false },
      { texto: 'Ponto de sela', correta: true }
    ]
  },
  5: {
    titulo: 'Wave 5 - Derivada parcial em y',
    texto: 'Calcule df/dy de f(x,y) = x^2y + 3y^2',
    dica: 'Trate x como constante e derive somente em relacao a y.',
    alternativas: [
      { texto: '2xy + 6y', correta: false },
      { texto: 'x^2 + 6y', correta: true },
      { texto: 'x^2 + 3y', correta: false },
      { texto: '2x + 6y', correta: false }
    ]
  },
  6: {
    titulo: 'Wave 6 - Derivada direcional',
    texto: 'Para f(x,y) = x^2 + y^2 no ponto (3,4), calcule a derivada direcional na direcao u = (3/5, 4/5).',
    dica: 'Use grad f(3,4) = (6,8) e faca o produto escalar com u.',
    alternativas: [
      { texto: '5', correta: false },
      { texto: '8', correta: false },
      { texto: '10', correta: true },
      { texto: '14', correta: false }
    ]
  },
  7: {
    titulo: 'Wave 7 - Teste da Hessiana',
    texto: 'Use o teste da Hessiana para classificar o ponto (0,0) de f(x,y) = x^2 + y^2.',
    dica: 'D = fxx*fyy - (fxy)^2. Se D > 0 e fxx > 0, ha minimo local.',
    alternativas: [
      { texto: 'Maximo local', correta: false },
      { texto: 'Ponto de sela', correta: false },
      { texto: 'Minimo local', correta: true },
      { texto: 'Teste inconclusivo', correta: false }
    ]
  },
  8: {
    titulo: 'Wave 8 - Boss: ponto critico final',
    texto: 'Qual e o ponto critico de f(x,y) = x^2 + 4y^2 - 4x - 8y?',
    dica: 'Resolva f_x = 0 e f_y = 0.',
    alternativas: [
      { texto: '(0, 0)', correta: false },
      { texto: '(2, 1)', correta: true },
      { texto: '(1, 2)', correta: false },
      { texto: '(4, 8)', correta: false }
    ]
  }
}

const SHOP_ITENS = [
  { id: 'shield', nome: 'SHIELD+', detalhe: '+2 HP maximo', custo: 50 },
  { id: 'firepower', nome: 'FIREPOWER+', detalhe: '+1 dano', custo: 75 },
  { id: 'speed', nome: 'SPEED+', detalhe: '+ velocidade', custo: 60 },
  { id: 'cooldown', nome: 'COOLDOWN-', detalhe: 'tiros mais rapidos', custo: 80 }
]

const DIALOGOS_FACULDADE = [
  { nome: 'Professor', texto: 'Zion, voce entende o conceito de gradiente?' },
  { nome: 'Zion', texto: '...' },
  { nome: 'Professor', texto: 'Na proxima aula havera prova. Estude bem.' }
]

const DIALOGOS_CASA = [
  { nome: 'Zion', texto: 'Preciso estudar mas nao consigo entender nada...' },
  { nome: 'Zion', texto: 'Deixa eu ver alguma coisa no computador...' }
]

const PENSAMENTOS_CAMINHO = [
  'Derivada parcial... como eu vou aprender isso ate amanha?',
  'Hessiana... pontos criticos... que nada...'
]

const tutorialArquivos = [
  {
    id: 1,
    nome: 'ARQUIVO_01.exe',
    aberto: false,
    concluido: false,
    paginaAtual: 0,
    titulo: 'Funcoes f(x,y)',
    paginas: [
      {
        secao: 'FUNDAMENTO',
        titulo: 'Uma entrada com duas coordenadas',
        resumo: 'Uma funcao f(x,y) recebe um par ordenado (x,y) e devolve um unico valor. O primeiro numero sempre ocupa x; o segundo ocupa y. Trocar essa ordem pode mudar completamente o resultado.',
        formula: 'f(a,b): substitua x por a e y por b',
        passos: [
          'Leia o ponto na ordem (x,y).',
          'Localize cada x e cada y da expressao.',
          'Substitua usando parenteses.',
          'Calcule ate obter um unico numero.'
        ],
        dica: 'Pense em (x,y) como um endereco: x e a coluna e y e a linha.'
      },
      {
        secao: 'REGRA OPERACIONAL',
        titulo: 'Substituicao e ordem das operacoes',
        resumo: 'Depois de substituir as variaveis, respeite a ordem: primeiro potencias, depois multiplicacoes e, por ultimo, somas e subtracoes. Escrever uma linha intermediaria evita erros.',
        formula: 'f(x,y)=x^2+y^2  =>  f(a,b)=a^2+b^2',
        passos: [
          'Substitua: a^2 + b^2.',
          'Calcule cada potencia separadamente.',
          'Some os resultados apenas no final.',
          'Confira se nenhuma coordenada foi trocada.'
        ],
        dica: '2^2 significa 2 vezes 2. Nao confunda potencia com multiplicacao por 2.'
      },
      {
        secao: 'EXEMPLO RESOLVIDO',
        titulo: 'Executando uma funcao',
        resumo: 'Considere g(x,y)=2x+y^2 e o ponto (3,2). Substitua x por 3 e y por 2 antes de calcular.',
        formula: 'g(3,2)=2(3)+2^2=6+4=10',
        passos: [
          'O primeiro valor, 3, entra em x.',
          'O segundo valor, 2, entra em y.',
          'Calcule 2 vezes 3 e depois 2^2.',
          'Some 6 e 4 para obter 10.'
        ],
        dica: 'Os parenteses mostram claramente qual valor entrou em cada lugar.'
      },
      {
        secao: 'PROTOCOLO DA WAVE 1',
        titulo: 'Resolva f(2,3)=x^2+y^2',
        resumo: 'A primeira barreira pede apenas substituicao. Use o mesmo procedimento do exemplo e mantenha cada parcela separada ate a ultima linha.',
        formula: 'f(2,3)=2^2+3^2=4+9=13',
        passos: [
          'x recebe 2; portanto x^2 vale 4.',
          'y recebe 3; portanto y^2 vale 9.',
          'A funcao pede a soma das duas parcelas.',
          'Resultado de verificacao: 13.'
        ],
        dica: 'Na questao da wave, procure a alternativa que corresponde ao resultado final.'
      }
    ]
  },
  {
    id: 2,
    nome: 'ARQUIVO_02.exe',
    aberto: false,
    concluido: false,
    paginaAtual: 0,
    titulo: 'Derivadas parciais',
    paginas: [
      {
        secao: 'FUNDAMENTO',
        titulo: 'Mude uma variavel por vez',
        resumo: 'A derivada parcial mede a variacao em uma direcao. Em df/dx, x varia e y fica congelado como uma constante. Em df/dy, y varia e x fica congelado.',
        formula: 'df/dx: derive em x e trate y como numero fixo',
        passos: [
          'Veja qual variavel aparece no denominador.',
          'Derive somente em relacao a ela.',
          'A outra variavel permanece na expressao.',
          'Termos sem a variavel derivada viram zero.'
        ],
        dica: 'df/dx responde: o que muda se apenas x se mover?'
      },
      {
        secao: 'REGRAS ESSENCIAIS',
        titulo: 'Potencia, produto e constante',
        resumo: 'Para derivar em x, use a regra da potencia nos termos com x. Um fator y pode ser tratado como constante. Um termo formado apenas por y nao muda quando x muda.',
        formula: 'd(x^n)/dx=nx^(n-1) | d(cxy)/dx=cy | d(y^n)/dx=0',
        passos: [
          '3x^2 deriva para 6x.',
          '2xy deriva para 2y.',
          'y^2 deriva para 0 em relacao a x.',
          'Derive termo por termo e depois some.'
        ],
        dica: 'Nao apague y de um termo xy: ele e um fator constante, nao um termo isolado.'
      },
      {
        secao: 'EXEMPLO RESOLVIDO',
        titulo: 'Derivando termo por termo',
        resumo: 'Considere g(x,y)=2x^2+5xy+y^2. Queremos dg/dx, entao y permanece congelado.',
        formula: 'dg/dx=4x+5y+0=4x+5y',
        passos: [
          '2x^2 gera 2 vezes 2x: 4x.',
          '5xy gera 5y.',
          'y^2 nao possui x e gera zero.',
          'Junte os termos restantes: 4x+5y.'
        ],
        dica: 'Uma boa verificacao e perguntar se cada termo original continha x.'
      },
      {
        secao: 'PROTOCOLO DA WAVE 2',
        titulo: 'Derive 3x^2+2xy+y^2 em x',
        resumo: 'A segunda barreira usa exatamente as tres regras anteriores: potencia de x, produto xy e termo somente em y.',
        formula: 'df/dx=6x+2y+0=6x+2y',
        passos: [
          '3x^2 deriva para 6x.',
          '2xy deriva para 2y.',
          'y^2 deriva para zero.',
          'Resposta de verificacao: 6x+2y.'
        ],
        dica: 'A ordem 6x+2y ou 2y+6x representa a mesma soma.'
      }
    ]
  },
  {
    id: 3,
    nome: 'ARQUIVO_03.exe',
    aberto: false,
    concluido: false,
    paginaAtual: 0,
    titulo: 'Vetor gradiente',
    paginas: [
      {
        secao: 'FUNDAMENTO',
        titulo: 'Duas derivadas formam uma direcao',
        resumo: 'O gradiente reune as derivadas parciais em um vetor. A primeira componente mede a mudanca em x; a segunda mede a mudanca em y. A ordem nunca deve ser invertida.',
        formula: 'grad f(x,y)=(df/dx, df/dy)',
        passos: [
          'Calcule primeiro df/dx.',
          'Depois calcule df/dy.',
          'Monte o vetor nessa mesma ordem.',
          'So entao substitua o ponto pedido.'
        ],
        dica: 'Gradiente nao e um unico numero: ele possui uma componente para cada eixo.'
      },
      {
        secao: 'CONSTRUCAO',
        titulo: 'Gradiente de x^2+y^2',
        resumo: 'Ao derivar f(x,y)=x^2+y^2 em x, o termo y^2 vira zero. Ao derivar em y, acontece o contrario.',
        formula: 'df/dx=2x | df/dy=2y | grad f=(2x,2y)',
        passos: [
          'Em x: x^2 gera 2x e y^2 gera 0.',
          'Em y: x^2 gera 0 e y^2 gera 2y.',
          'Primeira componente: 2x.',
          'Segunda componente: 2y.'
        ],
        dica: 'Calcule as duas derivadas antes de inserir as coordenadas do ponto.'
      },
      {
        secao: 'AVALIACAO NO PONTO',
        titulo: 'Transforme a formula em vetor numerico',
        resumo: 'Depois de encontrar grad f=(2x,2y), avaliar no ponto (1,2) significa substituir x por 1 na primeira componente e y por 2 na segunda.',
        formula: 'grad f(1,2)=(2(1),2(2))=(2,4)',
        passos: [
          'A coordenada x vale 1.',
          'A coordenada y vale 2.',
          'Calcule cada componente separadamente.',
          'Mantenha a resposta na ordem (x,y).'
        ],
        dica: 'O ponto (1,2) nao e o gradiente; ele e a entrada usada para calcular o gradiente.'
      },
      {
        secao: 'PROTOCOLO DA WAVE 3',
        titulo: 'Leia a direcao de maior crescimento',
        resumo: 'O vetor gradiente aponta para onde a funcao cresce mais rapidamente. Para f=x^2+y^2 no ponto (1,2), ele aponta duas unidades em x e quatro em y.',
        formula: 'grad f(1,2)=(2,4)',
        passos: [
          'Derive: grad f=(2x,2y).',
          'Substitua o ponto (1,2).',
          'Obtenha o vetor (2,4).',
          'Escolha a alternativa com a mesma ordem.'
        ],
        dica: 'O vetor (4,2) esta invertido e, portanto, aponta para outra direcao.'
      }
    ]
  },
  {
    id: 4,
    nome: 'ARQUIVO_04.exe',
    aberto: false,
    concluido: false,
    paginaAtual: 0,
    titulo: 'Pontos criticos',
    paginas: [
      {
        secao: 'FUNDAMENTO',
        titulo: 'Onde a inclinacao desaparece',
        resumo: 'Um ponto critico ocorre quando as duas componentes do gradiente valem zero. Isso identifica um candidato a minimo, maximo ou ponto de sela, mas ainda nao diz qual deles.',
        formula: 'df/dx=0 e df/dy=0',
        passos: [
          'Calcule as duas derivadas parciais.',
          'Iguale ambas a zero.',
          'Resolva o sistema para encontrar o ponto.',
          'Use a curvatura para classifica-lo.'
        ],
        dica: 'Gradiente zero e apenas o inicio da classificacao.'
      },
      {
        secao: 'HESSIANA',
        titulo: 'A matriz que mede a curvatura',
        resumo: 'A Hessiana organiza as segundas derivadas. Para funcoes de duas variaveis, o determinante D permite verificar se a superficie curva para o mesmo lado ou para lados opostos.',
        formula: 'D=fxx*fyy-(fxy)^2',
        passos: [
          'Calcule fxx: derive duas vezes em x.',
          'Calcule fyy: derive duas vezes em y.',
          'Calcule fxy: derive primeiro em x e depois em y.',
          'Substitua tudo na formula de D.'
        ],
        dica: 'Os indices xx, yy e xy indicam a ordem das derivacoes.'
      },
      {
        secao: 'CLASSIFICACAO',
        titulo: 'Decodifique o sinal de D',
        resumo: 'O sinal do determinante separa os casos. Quando D e positivo, use o sinal de fxx para decidir entre minimo e maximo. Quando D e negativo, a curvatura muda de sentido.',
        formula: 'D>0,fxx>0: minimo | D>0,fxx<0: maximo | D<0: sela',
        passos: [
          'D maior que zero e fxx positivo: minimo.',
          'D maior que zero e fxx negativo: maximo.',
          'D menor que zero: ponto de sela.',
          'D igual a zero: teste inconclusivo.'
        ],
        dica: 'Sinais misturados nas curvaturas sao a assinatura de um ponto de sela.'
      },
      {
        secao: 'PROTOCOLO DA WAVE 4',
        titulo: 'Classifique f=x^2-y^2 em (0,0)',
        resumo: 'O gradiente e (2x,-2y), que zera em (0,0). As segundas derivadas possuem sinais opostos, indicando que a superficie sobe em uma direcao e desce na outra.',
        formula: 'fxx=2 | fyy=-2 | fxy=0 | D=2(-2)-0=-4',
        passos: [
          'O ponto (0,0) e critico.',
          'O determinante da Hessiana vale -4.',
          'Como D e negativo, as curvaturas se opõem.',
          'Classificacao de verificacao: ponto de sela.'
        ],
        dica: 'Imagine uma sela: curva para cima em um eixo e para baixo no outro.'
      }
    ]
  }
]

let estado = STATE_FACULDADE
let estadoIniciadoEm = performance.now()
let player = criarPlayer(canvas)
let balas = []
let balasInimigas = []
let inimigos = []
let particulas = []
let ondasImpacto = []
let score = 0
let pontos = 0
let wave = 1
let questaoAtual = null
let alternativaSelecionada = null
let arquivoTutorialAtivo = tutorialArquivos[0]
let tutorialBotoes = {
  anterior: null,
  proxima: null
}
let shopBotoes = []
let questaoBotoes = []
let ultimoFrame = performance.now()
let aguardandoPunitivo = false
let bossPerguntaResolvida = false
let proximaPerguntaBoss = 0
let gameoverTitulo = 'FIM DA CONEXAO'
let gameoverTexto = 'Zion foi desconectado da Matrix.'
let efeitos = {
  glitchAte: 0,
  shakeAte: 0,
  shakeForca: 0,
  flashAte: 0,
  flashCor: '#ff2020'
}
let desempenho = {
  mediaDelta: 16.7,
  detalhe: 2,
  proximaAvaliacao: 0
}
let cacheVinhetaTela = {
  largura: 0,
  altura: 0,
  gradiente: null
}
let dialogoFaculdadeIndice = 0
let dialogoCasaIndice = 0
let zionCaminho = { x: 90, y: canvas.height / 2, velocidade: 3 }
let caminhoEntrando = false
let caminhoEntrandoEm = 0
let zionCasa = { x: 0, y: 0, etapa: 'dialogo' }
let computadorExecutando = false
let computadorExecutadoEm = 0
let matrixExeRect = null
let transicao = {
  ativa: false,
  inicio: 0,
  duracao: 1200,
  proximoEstado: null,
  texto: '',
  trocou: false
}

function ajustarCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  player.x = Math.min(player.x, canvas.width - player.tamanho)
  player.y = Math.min(player.y, canvas.height - player.tamanho)
}

function centralizarPlayer() {
  player.x = canvas.width / 2
  player.y = canvas.height / 2
}

function iniciarMusicaFundo() {
  if (!window.CriticalPointMusic) {
    return
  }

  window.CriticalPointMusic.start()
  atualizarMusicaEstado()
}

function atualizarMusicaEstado() {
  if (!window.CriticalPointMusic) {
    return
  }

  if (estado === STATE_PLAYING) {
    window.CriticalPointMusic.setMode('battle')
    return
  }

  if (estado === STATE_QUESTION || estado === STATE_SHOP || estado === STATE_TUTORIAL) {
    window.CriticalPointMusic.setMode('focus')
    return
  }

  if (estado === STATE_CUTSCENE || estado === STATE_COMPUTADOR) {
    window.CriticalPointMusic.setMode('danger')
    return
  }

  if (estado === STATE_GAMEOVER) {
    window.CriticalPointMusic.setMode('gameover')
    return
  }

  window.CriticalPointMusic.setMode('intro')
}

function trocarEstado(novoEstado) {
  estado = novoEstado
  estadoIniciadoEm = performance.now()
  atualizarMusicaEstado()

  if (novoEstado === STATE_CAMINHO) {
    prepararCenaCaminho()
  }

  if (novoEstado === STATE_CASA) {
    prepararCenaCasa()
  }

  if (novoEstado === STATE_COMPUTADOR) {
    prepararCenaComputador()
  }
}

function iniciarTransicao(proximoEstado, texto, duracao) {
  if (transicao.ativa) {
    return
  }

  transicao.ativa = true
  transicao.inicio = performance.now()
  transicao.duracao = duracao || 1400
  transicao.proximoEstado = proximoEstado
  transicao.texto = texto || ''
  transicao.trocou = false
}

function atualizarTransicao(agora) {
  if (!transicao.ativa) {
    return
  }

  const metade = transicao.duracao / 2
  const tempo = agora - transicao.inicio

  if (!transicao.trocou && tempo >= metade) {
    transicao.trocou = true
    trocarEstado(transicao.proximoEstado)
  }

  if (tempo >= transicao.duracao) {
    transicao.ativa = false
  }
}

function desenharTransicao(agora) {
  if (!transicao.ativa) {
    return
  }

  const metade = transicao.duracao / 2
  const tempo = agora - transicao.inicio
  const alpha = tempo < metade ? tempo / metade : 1 - (tempo - metade) / metade

  ctx.save()
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (transicao.texto) {
    ctx.fillStyle = '#d8dde6'
    ctx.font = '26px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(transicao.texto, canvas.width / 2, canvas.height / 2)
  }

  ctx.restore()
}

function prepararCenaCaminho() {
  zionCaminho = {
    x: 90,
    y: canvas.height / 2,
    velocidade: 3
  }
  caminhoEntrando = false
  caminhoEntrandoEm = 0
}

function prepararCenaCasa() {
  zionCasa = {
    x: canvas.width * 0.25,
    y: canvas.height * 0.56,
    etapa: 'dialogo'
  }
  dialogoCasaIndice = 0
}

function prepararCenaComputador() {
  computadorExecutando = false
  computadorExecutadoEm = 0
  matrixExeRect = null
}

function resetarJogo() {
  player = criarPlayer(canvas)
  centralizarPlayer()
  balas = []
  balasInimigas = []
  inimigos = []
  particulas = []
  ondasImpacto = []
  score = 0
  pontos = 0
  wave = 1
  questaoAtual = null
  alternativaSelecionada = null
  questaoBotoes = []
  aguardandoPunitivo = false
  bossPerguntaResolvida = false
  proximaPerguntaBoss = 0
  efeitos.glitchAte = 0
  efeitos.shakeAte = 0
  efeitos.shakeForca = 0
  efeitos.flashAte = 0

  for (let i = 0; i < tutorialArquivos.length; i++) {
    tutorialArquivos[i].aberto = false
    tutorialArquivos[i].concluido = false
    tutorialArquivos[i].paginaAtual = 0
  }

  arquivoTutorialAtivo = tutorialArquivos[0]
  tutorialBotoes.anterior = null
  tutorialBotoes.proxima = null
  dialogoFaculdadeIndice = 0
  prepararCenaCaminho()
  prepararCenaCasa()
  prepararCenaComputador()
  trocarEstado(STATE_FACULDADE)
}

function iniciarWave(numeroWave) {
  wave = numeroWave
  centralizarPlayer()
  balas = []
  balasInimigas = []
  particulas = []
  ondasImpacto = []
  inimigos = spawnWave(canvas, wave)
  aguardandoPunitivo = false
  desempenho.mediaDelta = 16.7
  desempenho.detalhe = 2
  desempenho.proximaAvaliacao = 0

  if (wave === WAVE_BOSS_FINAL) {
    bossPerguntaResolvida = false
    abrirQuestao(WAVE_BOSS_FINAL, true)
    return
  }

  trocarEstado(STATE_PLAYING)
}

function avancarFaculdade() {
  if (dialogoFaculdadeIndice < DIALOGOS_FACULDADE.length - 1) {
    dialogoFaculdadeIndice++
    return
  }

  iniciarTransicao(STATE_CAMINHO, 'Depois da aula...', 1800)
}

function avancarCasa() {
  if (zionCasa.etapa === 'dialogo') {
    if (dialogoCasaIndice < DIALOGOS_CASA.length - 1) {
      dialogoCasaIndice++
      return
    }

    zionCasa.etapa = 'andando'
    return
  }

  if (zionCasa.etapa === 'aguardando') {
    zionCasa.etapa = 'sentando'
    iniciarTransicao(STATE_COMPUTADOR, '', 1200)
  }
}

function atualizarComputador(agora) {
  if (computadorExecutando && agora - computadorExecutadoEm > 1900) {
    iniciarTransicao(STATE_CUTSCENE, '', 1100)
  }
}

function abrirQuestao(numeroWave, boss) {
  const dadosQuestao = QUESTOES[numeroWave]

  questaoAtual = {
    wave: numeroWave,
    boss: !!boss,
    titulo: dadosQuestao.titulo,
    texto: dadosQuestao.texto,
    dica: dadosQuestao.dica,
    alternativas: dadosQuestao.alternativas,
    respondida: false,
    acertou: null,
    respostaMarcada: null,
    respostaCorreta: encontrarRespostaCorreta(dadosQuestao.alternativas)
  }
  alternativaSelecionada = null
  questaoBotoes = []
  trocarEstado(STATE_QUESTION)
}

function encontrarRespostaCorreta(alternativas) {
  for (let i = 0; i < alternativas.length; i++) {
    if (alternativas[i].correta) {
      return i
    }
  }

  return -1
}

function avaliarResposta() {
  if (
    !questaoAtual ||
    questaoAtual.respondida ||
    alternativaSelecionada === null ||
    !questaoAtual.alternativas[alternativaSelecionada]
  ) {
    return
  }

  const correta = questaoAtual.alternativas[alternativaSelecionada].correta
  questaoAtual.respondida = true
  questaoAtual.acertou = correta
  questaoAtual.respostaMarcada = alternativaSelecionada

  if (correta) {
    score += 50
    pontos += 50
    agitarTela(4, 220, '#00ff88')
    return
  }

  agitarTela(10, 320, '#ff2020')
}

function finalizarQuestao() {
  if (!questaoAtual || !questaoAtual.respondida) {
    return
  }

  if (questaoAtual.acertou) {
    if (questaoAtual.boss) {
      bossPerguntaResolvida = true
      liberarBoss()
      trocarEstado(STATE_PLAYING)
      return
    }

    trocarEstado(STATE_SHOP)
    return
  }

  if (questaoAtual.boss) {
    curarBossPorErro()
    spawnarPunitivo()
    proximaPerguntaBoss = performance.now() + 6500
    trocarEstado(STATE_PLAYING)
    return
  }

  aguardandoPunitivo = true
  spawnarPunitivo()
  trocarEstado(STATE_PLAYING)
}

function liberarBoss() {
  for (let i = 0; i < inimigos.length; i++) {
    if (inimigos[i].tipo === 'boss') {
      inimigos[i].vulneravel = true
    }
  }
}

function curarBossPorErro() {
  for (let i = 0; i < inimigos.length; i++) {
    const inimigo = inimigos[i]
    if (inimigo.tipo === 'boss') {
      inimigo.hp = Math.min(inimigo.maxHp, inimigo.hp + Math.ceil(inimigo.maxHp * 0.5))
    }
  }
}

function spawnarPunitivo() {
  inimigos.push(criarInimigo(canvas, 'punitivo', wave))
  efeitos.glitchAte = performance.now() + 900
}

function comprarUpgrade(item) {
  if (pontos < item.custo) {
    efeitos.glitchAte = performance.now() + 260
    return
  }

  pontos -= item.custo
  aplicarUpgradePlayer(player, item.id)
}

function atirar(agora) {
  if (estado !== STATE_PLAYING) {
    return
  }

  if (agora - player.ultimoTiro < player.cooldown) {
    return
  }

  if (balas.length >= LIMITE_BALAS_PLAYER) {
    return
  }

  const bala = criarBala(player)
  balas.push(bala)
  const bocaX = player.x + Math.cos(player.angulo) * 42
  const bocaY = player.y + Math.sin(player.angulo) * 42
  emitirParticulas(bocaX, bocaY, '#b7ffd0', desempenho.detalhe === 0 ? 1 : 3)
  adicionarOndaImpacto(bocaX, bocaY, '#00ff41', 24)
  agitarTela(1.4, 70)
  player.ultimoTiro = agora
}

function emitirParticulas(x, y, cor, quantidade) {
  const disponiveis = LIMITE_PARTICULAS - particulas.length
  if (disponiveis <= 0) {
    return
  }

  const fator = desempenho.detalhe === 0 ? 0.35 : (desempenho.detalhe === 1 ? 0.65 : 1)
  const total = Math.min(disponiveis, Math.max(1, Math.ceil(quantidade * fator)))
  const novas = criarParticulas(x, y, cor, total)

  for (let i = 0; i < novas.length; i++) {
    particulas.push(novas[i])
  }
}

function adicionarOndaImpacto(x, y, cor, tamanho) {
  if (ondasImpacto.length >= LIMITE_ONDAS) {
    ondasImpacto.shift()
  }
  ondasImpacto.push(criarOndaImpacto(x, y, cor, tamanho))
}

function atualizarNivelDetalhe(delta, agora) {
  desempenho.mediaDelta = desempenho.mediaDelta * 0.92 + delta * 0.08

  if (agora < desempenho.proximaAvaliacao) {
    return
  }

  const carga =
    balas.length +
    balasInimigas.length +
    particulas.length * 0.35 +
    inimigos.length * 5

  if (desempenho.mediaDelta > 23 || carga > 360) {
    desempenho.detalhe = 0
  } else if (desempenho.mediaDelta > 18.5 || carga > 210) {
    desempenho.detalhe = 1
  } else {
    desempenho.detalhe = 2
  }

  desempenho.proximaAvaliacao = agora + 500
}

function agitarTela(forca, duracao, corFlash) {
  const agora = performance.now()
  efeitos.shakeAte = Math.max(efeitos.shakeAte, agora + duracao)
  efeitos.shakeForca = Math.max(efeitos.shakeForca, forca)

  if (corFlash) {
    efeitos.flashAte = Math.max(efeitos.flashAte, agora + Math.min(180, duracao))
    efeitos.flashCor = corFlash
  }
}

function obterDeslocamentoCamera(agora) {
  if (agora >= efeitos.shakeAte) {
    efeitos.shakeForca = 0
    return { x: 0, y: 0 }
  }

  const restante = Math.max(0, (efeitos.shakeAte - agora) / 220)
  const forca = efeitos.shakeForca * Math.min(1, restante)
  return {
    x: (Math.random() - 0.5) * forca * 2,
    y: (Math.random() - 0.5) * forca * 2
  }
}

function atualizarJogo(agora) {
  moverPlayer(player, keys, canvas)
  rotacionarPlayer(player, mouse.x, mouse.y)

  if (mouse.down) {
    atirar(agora)
  }

  moverBalas(balas)
  moverBalas(balasInimigas)
  removerBalas(balas, canvas)
  removerBalas(balasInimigas, canvas)
  moverInimigos(inimigos, player)

  const vagasBalasInimigas = LIMITE_BALAS_INIMIGAS - balasInimigas.length
  const novasBalas = gerarDisparosInimigos(inimigos, agora, vagasBalasInimigas)
  for (let i = 0; i < novasBalas.length; i++) {
    balasInimigas.push(novasBalas[i])
  }

  const resultadoColisao = verificarColisaoInimigos(inimigos, balas)

  for (let i = 0; i < resultadoColisao.impactos.length; i++) {
    const impacto = resultadoColisao.impactos[i]
    const cor = impacto.bloqueado ? '#ffffff' : impacto.cor
    emitirParticulas(impacto.x, impacto.y, cor, impacto.bloqueado ? 5 : 9)
    adicionarOndaImpacto(impacto.x, impacto.y, cor, impacto.bloqueado ? 34 : 46)
    agitarTela(impacto.bloqueado ? 2 : 3, 95)
  }

  for (let i = 0; i < resultadoColisao.mortos.length; i++) {
    const morto = resultadoColisao.mortos[i]
    score += morto.pontos
    pontos += morto.pontos
    emitirParticulas(morto.x, morto.y, morto.cor, morto.tipo === 'boss' ? 70 : 22)
    adicionarOndaImpacto(morto.x, morto.y, morto.cor, morto.tipo === 'boss' ? 180 : 92)
    agitarTela(morto.tipo === 'boss' ? 18 : 7, morto.tipo === 'boss' ? 650 : 220, morto.cor)

    if (morto.tipo === 'boss') {
      vencerJogo()
      return
    }
  }

  if (verificarColisaoBalasPlayer(balasInimigas, player, agora)) {
    emitirParticulas(player.x, player.y, '#ff2020', 16)
    adicionarOndaImpacto(player.x, player.y, '#ff2020', 86)
    agitarTela(12, 380, '#ff2020')
  }

  if (verificarColisaoPlayerInimigos(inimigos, player, agora)) {
    emitirParticulas(player.x, player.y, '#ff2020', 12)
    adicionarOndaImpacto(player.x, player.y, '#ff6020', 72)
    agitarTela(10, 320, '#ff2020')
  }

  const expirados = removerInimigosExpirados(inimigos, agora)
  for (let i = 0; i < expirados.length; i++) {
    if (expirados[i].tipo === 'punitivo') {
      score += 30
      pontos += 30
      emitirParticulas(expirados[i].x, expirados[i].y, '#8b0000', 36)
    }
  }

  atualizarParticulas(particulas)
  atualizarOndasImpacto(ondasImpacto)

  if (player.vida <= 0) {
    gameoverTitulo = 'FIM DA CONEXAO'
    gameoverTexto = 'Zion foi desconectado da Matrix.'
    trocarEstado(STATE_GAMEOVER)
    return
  }

  if (wave === WAVE_BOSS_FINAL && !bossPerguntaResolvida && agora > proximaPerguntaBoss && !existePunitivo()) {
    abrirQuestao(WAVE_BOSS_FINAL, true)
    return
  }

  if (wave < WAVE_BOSS_FINAL && !aguardandoPunitivo && contarInimigosDeCombate() === 0) {
    abrirQuestao(wave, false)
    return
  }

  if (aguardandoPunitivo && !existePunitivo()) {
    aguardandoPunitivo = false
    trocarEstado(STATE_SHOP)
  }
}

function contarInimigosDeCombate() {
  let total = 0

  for (let i = 0; i < inimigos.length; i++) {
    if (inimigos[i].tipo !== 'punitivo') {
      total++
    }
  }

  return total
}

function existePunitivo() {
  for (let i = 0; i < inimigos.length; i++) {
    if (inimigos[i].tipo === 'punitivo') {
      return true
    }
  }

  return false
}

function vencerJogo() {
  score += 200
  pontos += 200
  gameoverTitulo = 'CRITICAL POINT LIMPO'
  gameoverTexto = 'Zion dominou a Matrix e classificou o ponto critico final.'
  trocarEstado(STATE_GAMEOVER)
}

function desenharJogo(agora) {
  const camera = obterDeslocamentoCamera(agora)
  const detalhe = desempenho.detalhe

  ctx.save()
  ctx.translate(camera.x, camera.y)
  desenharArenaMatrix(ctx, canvas, agora, wave, player, detalhe)
  desenharOndasImpacto(ctx, ondasImpacto, detalhe)
  desenharInimigos(ctx, inimigos, agora, detalhe)
  desenharBalas(ctx, balas, detalhe)
  desenharBalas(ctx, balasInimigas, detalhe)
  desenharPlayer(ctx, player, agora, detalhe)
  desenharParticulas(ctx, particulas, detalhe)
  ctx.restore()
  desenharHUD(ctx, canvas, player, score, wave, pontos)
}

function desenharFaculdade(agora) {
  const tempo = agora - estadoIniciadoEm
  const formulas = 'f(x,y)        ∂f/∂x        ∇f'
  const formulasVisiveis = formulas.slice(0, Math.min(formulas.length, Math.floor(tempo / 80)))
  const lousa = {
    x: canvas.width * 0.18,
    y: canvas.height * 0.13,
    w: canvas.width * 0.62,
    h: canvas.height * 0.25
  }

  ctx.save()
  ctx.fillStyle = '#2f3742'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#46515f'
  ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.6)

  for (let x = 0; x < canvas.width; x += 48) {
    ctx.fillStyle = 'rgba(28, 33, 39, 0.32)'
    ctx.fillRect(x, canvas.height * 0.4, 2, canvas.height * 0.6)
  }

  ctx.fillStyle = '#263f34'
  ctx.fillRect(lousa.x, lousa.y, lousa.w, lousa.h)
  ctx.strokeStyle = '#c4b58a'
  ctx.lineWidth = 6
  ctx.strokeRect(lousa.x, lousa.y, lousa.w, lousa.h)

  ctx.fillStyle = '#d6e8d4'
  ctx.font = '24px Arial'
  ctx.textAlign = 'left'
  ctx.fillText(formulasVisiveis, lousa.x + 34, lousa.y + 74)
  ctx.font = '18px Arial'
  ctx.fillText('calculo multivariavel', lousa.x + 34, lousa.y + 122)

  desenharMesaCadeira(canvas.width * 0.24, canvas.height * 0.63)
  desenharMesaCadeira(canvas.width * 0.44, canvas.height * 0.64)
  desenharMesaCadeira(canvas.width * 0.62, canvas.height * 0.62)
  desenharBonecoPalitoMundo(canvas.width * 0.29, canvas.height * 0.61, '#1d2733', 1, true)
  desenharBonecoPalitoMundo(canvas.width * 0.75, canvas.height * 0.42, '#3b2e2a', 1.12, false)

  desenharCaixaDialogo(DIALOGOS_FACULDADE[dialogoFaculdadeIndice], 'ESPACO ou clique para avancar')
  ctx.restore()
}

function desenharMesaCadeira(x, y) {
  ctx.fillStyle = '#7a5b3f'
  ctx.fillRect(x - 42, y, 84, 24)
  ctx.fillStyle = '#4a3d35'
  ctx.fillRect(x - 34, y + 24, 12, 34)
  ctx.fillRect(x + 22, y + 24, 12, 34)
  ctx.fillStyle = '#314157'
  ctx.fillRect(x - 22, y + 44, 44, 18)
}

function atualizarCaminho(agora) {
  const porta = obterPortaCasa()

  if (caminhoEntrando) {
    zionCaminho.x += (porta.x + porta.w / 2 - zionCaminho.x) * 0.08
    zionCaminho.y += (porta.y + porta.h / 2 - zionCaminho.y) * 0.08

    if (agora - caminhoEntrandoEm > 850) {
      iniciarTransicao(STATE_CASA, '', 1100)
    }
    return
  }

  let dx = 0
  let dy = 0

  if (keys.KeyW || keys.ArrowUp) dy--
  if (keys.KeyS || keys.ArrowDown) dy++
  if (keys.KeyA || keys.ArrowLeft) dx--
  if (keys.KeyD || keys.ArrowRight) dx++

  if (dx !== 0 || dy !== 0) {
    const distancia = Math.hypot(dx, dy)
    zionCaminho.x += (dx / distancia) * zionCaminho.velocidade
    zionCaminho.y += (dy / distancia) * zionCaminho.velocidade
  }

  zionCaminho.x = Math.max(36, Math.min(canvas.width - 36, zionCaminho.x))
  zionCaminho.y = Math.max(canvas.height * 0.32, Math.min(canvas.height * 0.74, zionCaminho.y))

  if (colideRetangulo(zionCaminho.x, zionCaminho.y, 24, 24, porta)) {
    caminhoEntrando = true
    caminhoEntrandoEm = agora
  }
}

function desenharCaminho() {
  const porta = obterPortaCasa()

  ctx.save()
  ctx.fillStyle = '#263145'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#38424d'
  ctx.fillRect(0, canvas.height * 0.3, canvas.width, canvas.height * 0.48)
  ctx.fillStyle = '#77766f'
  ctx.fillRect(0, canvas.height * 0.28, canvas.width, 10)
  ctx.fillRect(0, canvas.height * 0.78, canvas.width, 10)

  for (let x = 40; x < canvas.width; x += 96) {
    ctx.fillStyle = '#c1b27d'
    ctx.fillRect(x, canvas.height * 0.535, 38, 4)
  }

  desenharPredio(50, 58, 160, 120)
  desenharPredio(canvas.width * 0.42, 46, 190, 112)
  desenharPredio(canvas.width - 250, 62, 180, 130)
  desenharArvore(150, canvas.height * 0.85)
  desenharArvore(canvas.width * 0.34, canvas.height * 0.18)
  desenharArvore(canvas.width * 0.66, canvas.height * 0.86)

  ctx.fillStyle = '#4b4240'
  ctx.fillRect(porta.x - 90, porta.y - 70, 180, 170)
  ctx.fillStyle = '#6b5b50'
  ctx.fillRect(porta.x - 105, porta.y - 90, 210, 40)
  ctx.fillStyle = '#2b2021'
  ctx.fillRect(porta.x, porta.y, porta.w, porta.h)
  ctx.strokeStyle = '#c7a36a'
  ctx.lineWidth = 3
  ctx.strokeRect(porta.x, porta.y, porta.w, porta.h)

  desenharZionTopDown(zionCaminho.x, zionCaminho.y)

  if (zionCaminho.x > canvas.width * 0.22 && zionCaminho.x < canvas.width * 0.52) {
    desenharBalaoPensamento(PENSAMENTOS_CAMINHO[0], zionCaminho.x + 34, zionCaminho.y - 82)
  }

  if (zionCaminho.x >= canvas.width * 0.52 && !caminhoEntrando) {
    desenharBalaoPensamento(PENSAMENTOS_CAMINHO[1], zionCaminho.x - 240, zionCaminho.y - 86)
  }

  ctx.fillStyle = '#d8dde6'
  ctx.font = '16px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('Use WASD para chegar ate a porta de casa', canvas.width / 2, canvas.height - 28)
  ctx.restore()
}

function desenharPredio(x, y, w, h) {
  ctx.fillStyle = '#59606a'
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = '#343b45'
  for (let wx = x + 18; wx < x + w - 20; wx += 38) {
    for (let wy = y + 18; wy < y + h - 22; wy += 36) {
      ctx.fillRect(wx, wy, 18, 16)
    }
  }
}

function desenharArvore(x, y) {
  ctx.fillStyle = '#4f3426'
  ctx.fillRect(x - 7, y + 10, 14, 38)
  ctx.fillStyle = '#355f3e'
  ctx.beginPath()
  ctx.arc(x, y, 32, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#426f49'
  ctx.beginPath()
  ctx.arc(x - 17, y + 7, 22, 0, Math.PI * 2)
  ctx.arc(x + 18, y + 6, 22, 0, Math.PI * 2)
  ctx.fill()
}

function obterPortaCasa() {
  return {
    x: canvas.width - 148,
    y: canvas.height * 0.5 - 42,
    w: 58,
    h: 84
  }
}

function atualizarCasa() {
  if (zionCasa.etapa !== 'andando') {
    return
  }

  const alvo = obterCadeiraComputadorCasa()
  const dx = alvo.x - zionCasa.x
  const dy = alvo.y - zionCasa.y
  const distancia = Math.hypot(dx, dy)

  if (distancia < 5) {
    zionCasa.etapa = 'aguardando'
    return
  }

  zionCasa.x += (dx / distancia) * 2.4
  zionCasa.y += (dy / distancia) * 2.4
}

function desenharCasa() {
  const cama = obterCamaCasa()
  const mesa = obterMesaCasa()
  const cadeira = obterCadeiraComputadorCasa()

  ctx.save()
  ctx.fillStyle = '#1f2531'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#2d3442'
  ctx.fillRect(canvas.width * 0.12, canvas.height * 0.12, canvas.width * 0.76, canvas.height * 0.76)

  ctx.fillStyle = '#4f3d35'
  ctx.fillRect(cama.x, cama.y, cama.w, cama.h)
  ctx.fillStyle = '#2b3b66'
  ctx.fillRect(cama.x + 12, cama.y + 12, cama.w - 24, cama.h - 24)
  ctx.fillStyle = '#c9d0dd'
  ctx.fillRect(cama.x + 18, cama.y + 16, 56, 36)

  ctx.fillStyle = '#6b523d'
  ctx.fillRect(mesa.x, mesa.y, mesa.w, mesa.h)
  ctx.fillStyle = '#101820'
  ctx.fillRect(mesa.x + 34, mesa.y - 64, 98, 58)
  ctx.fillStyle = '#233f4a'
  ctx.fillRect(mesa.x + 42, mesa.y - 56, 82, 42)
  ctx.fillStyle = '#00a36c'
  ctx.fillRect(mesa.x + 76, mesa.y - 5, 26, 18)
  ctx.fillStyle = '#3a2f2c'
  ctx.fillRect(cadeira.x - 18, cadeira.y - 12, 36, 42)

  ctx.fillStyle = '#0f1723'
  ctx.fillRect(canvas.width * 0.68, canvas.height * 0.18, 110, 86)
  ctx.strokeStyle = '#637d93'
  ctx.lineWidth = 5
  ctx.strokeRect(canvas.width * 0.68, canvas.height * 0.18, 110, 86)
  ctx.fillStyle = '#1e2a3a'
  ctx.fillRect(canvas.width * 0.12, canvas.height * 0.78, canvas.width * 0.76, 16)

  if (zionCasa.etapa === 'dialogo') {
    desenharZionDeitado(cama.x + cama.w * 0.55, cama.y + cama.h * 0.5)
    desenharCaixaDialogo(DIALOGOS_CASA[dialogoCasaIndice], 'ESPACO ou clique para avancar')
  } else {
    desenharBonecoPalitoMundo(zionCasa.x, zionCasa.y, '#1d2733', 1, zionCasa.etapa === 'aguardando')
  }

  if (zionCasa.etapa === 'aguardando') {
    desenharCaixaDialogo({ nome: 'Zion', texto: 'Pressione ESPACO para sentar no computador.' }, 'ESPACO ou clique')
  }

  ctx.restore()
}

function obterCamaCasa() {
  return {
    x: canvas.width * 0.18,
    y: canvas.height * 0.46,
    w: canvas.width * 0.24,
    h: canvas.height * 0.2
  }
}

function obterMesaCasa() {
  return {
    x: canvas.width * 0.58,
    y: canvas.height * 0.5,
    w: 170,
    h: 42
  }
}

function obterCadeiraComputadorCasa() {
  return {
    x: canvas.width * 0.64,
    y: canvas.height * 0.56
  }
}

function desenharTelaComputador(agora) {
  const tempo = agora - estadoIniciadoEm
  const centroX = canvas.width / 2
  const centroY = canvas.height / 2
  const largura = Math.min(940, canvas.width - 42)
  const altura = Math.min(640, canvas.height - 42)
  const x = centroX - largura / 2
  const y = centroY - altura / 2

  ctx.save()
  ctx.fillStyle = '#111722'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#030805'
  ctx.strokeStyle = '#3c6750'
  ctx.lineWidth = 2
  ctx.fillRect(x, y, largura, altura)
  ctx.strokeRect(x, y, largura, altura)

  ctx.fillStyle = '#0dcf6d'
  ctx.font = '18px Arial'
  ctx.textAlign = 'left'
  ctx.fillText('ZION_PC :: area de trabalho', x + 24, y + 34)

  desenharArquivoComputador('Notas_Calculo.txt', x + 58, y + 90, '#314a5b')
  desenharArquivoComputador('Exercicios_Pendentes.pdf', x + 58, y + 184, '#574d46')

  if (tempo > 1350) {
    matrixExeRect = {
      x: x + largura - 258 + Math.sin(tempo * 0.02) * 2,
      y: y + 140 + Math.cos(tempo * 0.026) * 2,
      w: 202,
      h: 72
    }
    desenharArquivoComputador('matrix.exe', matrixExeRect.x, matrixExeRect.y, '#123d24')
    desenharGlitchArquivo(matrixExeRect, tempo)
  }

  if (tempo > 1650 && !computadorExecutando) {
    desenharCaixaDialogo({ nome: 'Zion', texto: 'Que arquivo e esse? Eu nao baixei isso...' }, 'Clique em matrix.exe')
  }

  if (computadorExecutando) {
    desenharGlitch(agora, 0.38)
    ctx.fillStyle = '#00ff41'
    ctx.font = '28px Courier New'
    ctx.textAlign = 'center'
    ctx.fillText('INICIANDO CONEXAO...', canvas.width / 2, y + altura - 86)
  }

  ctx.restore()
}

function desenharCaixaDialogo(dialogo, ajuda) {
  const largura = Math.min(920, canvas.width - 44)
  const altura = 132
  const x = canvas.width / 2 - largura / 2
  const y = canvas.height - altura - 28

  ctx.save()
  ctx.shadowBlur = 0
  ctx.fillStyle = 'rgba(15, 20, 30, 0.94)'
  ctx.fillRect(x, y, largura, altura)
  ctx.strokeStyle = '#d8dde6'
  ctx.lineWidth = 3
  ctx.strokeRect(x, y, largura, altura)

  ctx.fillStyle = '#d8dde6'
  ctx.font = '18px Arial'
  ctx.textAlign = 'left'
  ctx.fillText(dialogo.nome + ':', x + 22, y + 34)
  quebrarTextoMundo(dialogo.texto, x + 22, y + 66, largura - 44, 24, '20px Arial', '#f0f3f7')

  ctx.fillStyle = '#98a5b8'
  ctx.font = '14px Arial'
  ctx.textAlign = 'right'
  ctx.fillText(ajuda, x + largura - 22, y + altura - 18)
  ctx.restore()
}

function quebrarTextoMundo(texto, x, y, largura, alturaLinha, fonte, cor) {
  const palavras = texto.split(' ')
  let linha = ''
  let linhaY = y

  ctx.save()
  ctx.font = fonte || '18px Arial'
  ctx.fillStyle = cor || '#f0f3f7'

  for (let i = 0; i < palavras.length; i++) {
    const teste = linha + palavras[i] + ' '

    if (ctx.measureText(teste).width > largura && linha !== '') {
      ctx.fillText(linha, x, linhaY)
      linha = palavras[i] + ' '
      linhaY += alturaLinha
    } else {
      linha = teste
    }
  }

  ctx.fillText(linha, x, linhaY)
  ctx.restore()
}

function desenharBonecoPalitoMundo(x, y, cor, escala, sentado) {
  const s = escala || 1

  ctx.save()
  ctx.strokeStyle = cor
  ctx.lineWidth = 3 * s
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(x, y - 36 * s, 10 * s, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x, y - 26 * s)
  ctx.lineTo(x, y - 2 * s)
  ctx.moveTo(x - 17 * s, y - 17 * s)
  ctx.lineTo(x + 17 * s, y - 17 * s)

  if (sentado) {
    ctx.moveTo(x, y - 2 * s)
    ctx.lineTo(x - 18 * s, y + 8 * s)
    ctx.moveTo(x, y - 2 * s)
    ctx.lineTo(x + 18 * s, y + 8 * s)
  } else {
    ctx.moveTo(x, y - 2 * s)
    ctx.lineTo(x - 13 * s, y + 26 * s)
    ctx.moveTo(x, y - 2 * s)
    ctx.lineTo(x + 13 * s, y + 26 * s)
  }

  ctx.stroke()
  ctx.restore()
}

function desenharZionDeitado(x, y) {
  ctx.save()
  ctx.strokeStyle = '#1d2733'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(x - 34, y - 8, 10, 0, Math.PI * 2)
  ctx.moveTo(x - 22, y - 8)
  ctx.lineTo(x + 40, y - 8)
  ctx.moveTo(x - 2, y - 8)
  ctx.lineTo(x + 12, y - 24)
  ctx.moveTo(x + 22, y - 8)
  ctx.lineTo(x + 42, y + 8)
  ctx.stroke()
  ctx.restore()
}

function desenharZionTopDown(x, y) {
  ctx.save()
  ctx.fillStyle = '#1d2733'
  ctx.beginPath()
  ctx.arc(x, y - 8, 11, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#2d405a'
  ctx.fillRect(x - 12, y + 2, 24, 26)
  ctx.fillStyle = '#151b24'
  ctx.fillRect(x - 16, y + 20, 10, 18)
  ctx.fillRect(x + 6, y + 20, 10, 18)
  ctx.restore()
}

function desenharBalaoPensamento(texto, x, y) {
  const largura = Math.min(360, canvas.width - 42)
  const px = Math.max(20, Math.min(canvas.width - largura - 20, x))
  const py = Math.max(24, y)

  ctx.save()
  ctx.fillStyle = 'rgba(232, 238, 244, 0.92)'
  ctx.strokeStyle = '#46515f'
  ctx.lineWidth = 2
  ctx.fillRect(px, py, largura, 72)
  ctx.strokeRect(px, py, largura, 72)
  ctx.fillStyle = '#1f2531'
  ctx.font = '16px Arial'
  ctx.textAlign = 'left'
  quebrarTextoMundo(texto, px + 16, py + 26, largura - 32, 20, '16px Arial', '#1f2531')
  ctx.restore()
}

function desenharArquivoComputador(nome, x, y, cor) {
  ctx.save()
  ctx.fillStyle = cor
  ctx.fillRect(x, y, 202, 72)
  ctx.strokeStyle = '#0dcf6d'
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, 202, 72)
  ctx.fillStyle = '#0dcf6d'
  ctx.font = '16px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(nome, x + 101, y + 43)
  ctx.restore()
}

function desenharGlitchArquivo(rect, tempo) {
  ctx.save()
  ctx.globalAlpha = 0.45
  ctx.fillStyle = tempo % 160 < 80 ? '#ffffff' : '#00ff41'
  ctx.fillRect(rect.x + Math.sin(tempo * 0.05) * 12, rect.y + 10, rect.w * 0.82, 4)
  ctx.fillRect(rect.x - Math.cos(tempo * 0.03) * 10, rect.y + rect.h - 18, rect.w * 0.6, 5)
  ctx.restore()
}

function colideRetangulo(x, y, w, h, rect) {
  return x - w / 2 < rect.x + rect.w &&
    x + w / 2 > rect.x &&
    y - h / 2 < rect.y + rect.h &&
    y + h / 2 > rect.y
}

function desenharWireframeFuncao(x, y, largura, altura, tempo) {
  const centroX = x + largura / 2
  const centroY = y + altura * 0.58
  const escala = Math.min(largura, altura) / 12
  const rotacao = tempo * 0.00035

  ctx.save()
  ctx.strokeStyle = '#00ff41'
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.82

  for (let gx = -4; gx <= 4; gx++) {
    ctx.beginPath()
    for (let gy = -4; gy <= 4; gy++) {
      const ponto = projetarPonto(gx, gy, escala, rotacao)
      if (gy === -4) ctx.moveTo(centroX + ponto.x, centroY + ponto.y)
      else ctx.lineTo(centroX + ponto.x, centroY + ponto.y)
    }
    ctx.stroke()
  }

  for (let gy = -4; gy <= 4; gy++) {
    ctx.beginPath()
    for (let gx = -4; gx <= 4; gx++) {
      const ponto = projetarPonto(gx, gy, escala, rotacao)
      if (gx === -4) ctx.moveTo(centroX + ponto.x, centroY + ponto.y)
      else ctx.lineTo(centroX + ponto.x, centroY + ponto.y)
    }
    ctx.stroke()
  }

  ctx.fillStyle = '#b7ffd0'
  ctx.font = '16px Courier New'
  ctx.fillText('f(x,y)=x^2+y^2', x + 14, y + 24)
  ctx.restore()
}

function projetarPonto(px, py, escala, rotacao) {
  const cos = Math.cos(rotacao)
  const sin = Math.sin(rotacao)
  const rx = px * cos - py * sin
  const ry = px * sin + py * cos
  const z = (px * px + py * py) * 0.14

  return {
    x: (rx - ry) * escala * 0.72,
    y: (rx + ry) * escala * 0.28 - z * escala
  }
}

function desenharTextoDigitado(texto, x, y, largura, tempo, velocidade) {
  const caracteres = Math.min(texto.length, Math.floor(tempo / velocidade))
  const visivel = texto.slice(0, caracteres)
  const palavras = visivel.split(' ')
  let linha = ''
  let linhaY = y

  ctx.save()
  ctx.fillStyle = '#b7ffd0'
  ctx.font = '18px Courier New'

  for (let i = 0; i < palavras.length; i++) {
    const teste = linha + palavras[i] + ' '
    if (ctx.measureText(teste).width > largura && linha !== '') {
      ctx.fillText(linha, x, linhaY)
      linha = palavras[i] + ' '
      linhaY += 28
    } else {
      linha = teste
    }
  }

  ctx.fillText(linha + (caracteres < texto.length ? '_' : ''), x, linhaY)
  ctx.restore()
}

function desenharCutscene(agora) {
  const tempo = agora - estadoIniciadoEm
  const linhas = [
    'Conexao estabelecida...',
    'Usuario identificado: ZION',
    'O conhecimento e sua unica arma.',
    'Boa sorte.'
  ]

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.font = '24px Courier New'
  ctx.shadowBlur = 18
  ctx.shadowColor = '#00ff41'

  for (let i = 0; i < linhas.length; i++) {
    const inicioLinha = 800 + i * 1500
    if (tempo > inicioLinha) {
      const caracteres = Math.min(linhas[i].length, Math.floor((tempo - inicioLinha) / 48))
      ctx.fillStyle = '#00ff41'
      ctx.fillText(linhas[i].slice(0, caracteres), canvas.width / 2, canvas.height / 2 - 72 + i * 42)
    }
  }

  if (tempo > 6900 && tempo < 7500) {
    ctx.globalAlpha = 1 - Math.abs(tempo - 7200) / 300
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  ctx.restore()

  if (tempo > 8200) {
    trocarEstado(STATE_TUTORIAL)
  }
}

function desenharTutorial(agora) {
  const telaBaixa = canvas.height < 650
  const telaEstreita = canvas.width < 760
  const indiceArquivo = tutorialArquivos.indexOf(arquivoTutorialAtivo)
  const pagina = arquivoTutorialAtivo.paginas[arquivoTutorialAtivo.paginaAtual]
  const painelW = Math.min(1040, canvas.width - (telaEstreita ? 20 : 48))
  const painelX = canvas.width / 2 - painelW / 2
  const painelY = telaBaixa ? 76 : 118
  const painelH = Math.max(300, Math.min(570, canvas.height - painelY - (telaBaixa ? 12 : 34)))
  const painelEstreito = painelW < 760
  const compacto = painelH < 430 || painelEstreito

  arquivoTutorialAtivo.aberto = true

  ctx.save()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#00ff41'
  ctx.shadowBlur = 18
  ctx.shadowColor = '#00ff41'
  ctx.font = telaBaixa ? '17px Courier New' : '24px Courier New'
  ctx.fillText(
    arquivoTutorialAtivo.nome + '  //  MODULO ' + (indiceArquivo + 1) + ' DE ' + tutorialArquivos.length,
    canvas.width / 2,
    telaBaixa ? 24 : 38
  )
  desenharProgressoArquivosTutorial(indiceArquivo, telaBaixa ? 48 : 72, telaEstreita)

  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(0, 12, 4, 0.84)'
  ctx.strokeStyle = '#00ff41'
  ctx.lineWidth = 2
  ctx.fillRect(painelX, painelY, painelW, painelH)
  ctx.strokeRect(painelX, painelY, painelW, painelH)

  ctx.fillStyle = '#73ff9b'
  ctx.font = compacto ? '11px Courier New' : '13px Courier New'
  ctx.fillText(pagina.secao, painelX + 26, painelY + (compacto ? 20 : 24))

  ctx.fillStyle = '#d6ffe2'
  ctx.font = painelEstreito ? '14px Courier New' : (compacto ? '17px Courier New' : '21px Courier New')
  ctx.fillText(pagina.titulo, painelX + 26, painelY + (compacto ? 42 : 48))
  ctx.textAlign = 'right'
  ctx.fillStyle = '#00ff41'
  ctx.font = compacto ? '11px Courier New' : '13px Courier New'
  ctx.fillText(
    (painelEstreito ? '' : arquivoTutorialAtivo.titulo + '  |  ') +
      'PAGINA ' + (arquivoTutorialAtivo.paginaAtual + 1) + '/' + arquivoTutorialAtivo.paginas.length,
    painelX + painelW - 26,
    painelY + 24
  )

  ctx.strokeStyle = 'rgba(0, 255, 65, 0.42)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(painelX + 24, painelY + (compacto ? 56 : 66))
  ctx.lineTo(painelX + painelW - 24, painelY + (compacto ? 56 : 66))
  ctx.stroke()

  desenharConteudoPaginaTutorial(pagina, painelX, painelY, painelW, painelH, compacto)
  desenharNavegacaoTutorial(painelX, painelY, painelW, painelH, compacto, indiceArquivo)

  ctx.restore()
  if (Math.random() < 0.04) {
    desenharGlitch(agora, 0.16)
  }
}

function desenharProgressoArquivosTutorial(indiceAtivo, y, telaEstreita) {
  const larguraTotal = Math.min(telaEstreita ? 250 : 420, canvas.width - 48)
  const inicioX = canvas.width / 2 - larguraTotal / 2
  const segmentoW = larguraTotal / tutorialArquivos.length

  ctx.save()
  ctx.shadowBlur = 8
  ctx.shadowColor = '#00ff41'

  for (let i = 0; i < tutorialArquivos.length; i++) {
    const arquivo = tutorialArquivos[i]
    const x = inicioX + i * segmentoW
    const ativo = i === indiceAtivo

    ctx.fillStyle = arquivo.concluido
      ? '#00ff41'
      : (ativo ? '#d6ffe2' : 'rgba(0, 255, 65, 0.12)')
    ctx.fillRect(x + 3, y, segmentoW - 6, ativo ? 5 : 3)

    if (!telaEstreita) {
      ctx.fillStyle = ativo || arquivo.concluido ? '#8affaa' : '#31523a'
      ctx.textAlign = 'center'
      ctx.font = '10px Courier New'
      ctx.fillText('0' + (i + 1), x + segmentoW / 2, y + 12)
    }
  }

  ctx.restore()
}

function desenharConteudoPaginaTutorial(pagina, painelX, painelY, painelW, painelH, compacto) {
  const margem = compacto ? 20 : 28
  const topo = painelY + (compacto ? 70 : 84)
  const limiteInferior = painelY + painelH - (compacto ? 48 : 62)
  const duasColunas = painelW >= 760
  const colunaGap = compacto ? 20 : 34
  const colunaW = duasColunas ? (painelW - margem * 2 - colunaGap) / 2 : painelW - margem * 2
  const esquerdaX = painelX + margem
  const direitaX = esquerdaX + colunaW + colunaGap
  const fonteTexto = compacto ? '11px Courier New' : '14px Courier New'
  const alturaLinha = compacto ? 15 : 20

  ctx.textAlign = 'left'
  ctx.fillStyle = '#00ff41'
  ctx.font = compacto ? '10px Courier New' : '12px Courier New'
  ctx.fillText('RESUMO', esquerdaX, topo)

  let yEsquerda = topo + (compacto ? 16 : 22)
  yEsquerda = desenharParagrafoTutorial(
    pagina.resumo,
    esquerdaX,
    yEsquerda,
    colunaW,
    alturaLinha,
    fonteTexto,
    '#c9ffda',
    duasColunas ? (compacto ? 4 : 6) : 3
  )

  const formulaY = yEsquerda + (compacto ? 8 : 14)
  const formulaH = compacto ? 42 : 58
  ctx.fillStyle = 'rgba(0, 255, 65, 0.1)'
  ctx.strokeStyle = '#00ff41'
  ctx.lineWidth = 1
  ctx.fillRect(esquerdaX, formulaY, colunaW, formulaH)
  ctx.strokeRect(esquerdaX, formulaY, colunaW, formulaH)
  ctx.fillStyle = '#ffffff'
  ctx.font = compacto ? '11px Courier New' : '14px Courier New'
  desenharParagrafoTutorial(
    pagina.formula,
    esquerdaX + 14,
    formulaY + (compacto ? 14 : 18),
    colunaW - 28,
    compacto ? 14 : 18,
    compacto ? '11px Courier New' : '14px Courier New',
    '#ffffff',
    2
  )

  if (duasColunas) {
    desenharPassosTutorial(pagina.passos, direitaX, topo, colunaW, compacto)
  } else {
    const passosY = formulaY + formulaH + (compacto ? 8 : 14)
    desenharPassosTutorialGrade(pagina.passos, esquerdaX, passosY, colunaW, painelH >= 380)
  }

  if (duasColunas || painelH >= 360) {
    const dicaY = limiteInferior - (compacto ? 26 : 34)
    ctx.fillStyle = 'rgba(115, 255, 155, 0.1)'
    ctx.fillRect(esquerdaX, dicaY, painelW - margem * 2, compacto ? 26 : 34)
    ctx.fillStyle = '#73ff9b'
    ctx.font = compacto ? '10px Courier New' : '12px Courier New'
    desenharParagrafoTutorial(
      'DICA: ' + pagina.dica,
      esquerdaX + 12,
      dicaY + (compacto ? 8 : 10),
      painelW - margem * 2 - 24,
      compacto ? 12 : 15,
      compacto ? '10px Courier New' : '12px Courier New',
      '#73ff9b',
      2
    )
  }
}

function desenharPassosTutorial(passos, x, y, largura, compacto) {
  ctx.fillStyle = '#00ff41'
  ctx.font = compacto ? '10px Courier New' : '12px Courier New'
  ctx.fillText('PASSO A PASSO', x, y)

  const inicioY = y + (compacto ? 16 : 24)
  const alturaPasso = compacto ? 24 : 38

  for (let i = 0; i < passos.length; i++) {
    const passoY = inicioY + i * alturaPasso
    ctx.fillStyle = 'rgba(0, 255, 65, 0.12)'
    ctx.fillRect(x, passoY, compacto ? 18 : 24, compacto ? 18 : 24)
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.font = compacto ? '10px Courier New' : '12px Courier New'
    ctx.fillText(String(i + 1), x + (compacto ? 9 : 12), passoY + (compacto ? 4 : 6))
    ctx.textAlign = 'left'
    desenharParagrafoTutorial(
      passos[i],
      x + (compacto ? 26 : 34),
      passoY + (compacto ? 3 : 4),
      largura - (compacto ? 26 : 34),
      compacto ? 13 : 17,
      compacto ? '10px Courier New' : '12px Courier New',
      '#c9ffda',
      compacto ? 2 : 2
    )
  }
}

function desenharPassosTutorialGrade(passos, x, y, largura, expandido) {
  ctx.fillStyle = '#00ff41'
  ctx.font = '10px Courier New'
  ctx.fillText('PASSO A PASSO', x, y)

  const gap = 7
  const itemW = (largura - gap) / 2
  const itemH = expandido ? 44 : 36
  const inicioY = y + 16

  for (let i = 0; i < passos.length; i++) {
    const coluna = i % 2
    const linha = Math.floor(i / 2)
    const itemX = x + coluna * (itemW + gap)
    const itemY = inicioY + linha * (itemH + gap)

    ctx.fillStyle = 'rgba(0, 255, 65, 0.08)'
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.32)'
    ctx.fillRect(itemX, itemY, itemW, itemH)
    ctx.strokeRect(itemX, itemY, itemW, itemH)
    ctx.fillStyle = '#00ff41'
    ctx.textAlign = 'center'
    ctx.font = '10px Courier New'
    ctx.fillText(String(i + 1), itemX + 11, itemY + 9)
    desenharParagrafoTutorial(
      passos[i],
      itemX + 22,
      itemY + 6,
      itemW - 28,
      12,
      '9px Courier New',
      '#c9ffda',
      expandido ? 3 : 2
    )
  }
}

function desenharParagrafoTutorial(texto, x, y, largura, alturaLinha, fonte, cor, maxLinhas) {
  ctx.font = fonte
  ctx.fillStyle = cor
  ctx.textAlign = 'left'

  const palavras = texto.split(' ')
  const linhas = []
  let linha = ''

  for (let i = 0; i < palavras.length; i++) {
    const teste = linha + palavras[i] + ' '

    if (ctx.measureText(teste).width > largura && linha !== '') {
      linhas.push(linha.trim())
      linha = palavras[i] + ' '
    } else {
      linha = teste
    }
  }

  if (linha.trim()) {
    linhas.push(linha.trim())
  }

  const limite = Math.min(linhas.length, maxLinhas || linhas.length)
  for (let i = 0; i < limite; i++) {
    let textoLinha = linhas[i]
    if (i === limite - 1 && linhas.length > limite) {
      textoLinha = textoLinha.replace(/[.,;:]?$/, '...')
    }
    ctx.fillText(textoLinha, x, y + i * alturaLinha)
  }

  return y + limite * alturaLinha
}

function desenharNavegacaoTutorial(painelX, painelY, painelW, painelH, compacto, indiceArquivo) {
  const arquivo = arquivoTutorialAtivo
  const botaoW = compacto ? 126 : 190
  const botaoH = compacto ? 28 : 36
  const botaoY = painelY + painelH - botaoH - (compacto ? 8 : 12)
  const podeVoltar = arquivo.paginaAtual > 0 || indiceArquivo > 0
  const ultimaPagina = arquivo.paginaAtual === arquivo.paginas.length - 1
  const ultimoArquivo = indiceArquivo === tutorialArquivos.length - 1
  let textoProximo = 'PROXIMA PAGINA >'

  if (ultimaPagina && !ultimoArquivo) {
    textoProximo = 'LIBERAR ARQUIVO 0' + (indiceArquivo + 2)
  }

  if (ultimaPagina && ultimoArquivo) {
    textoProximo = 'ENTRAR NA MATRIX'
  }

  tutorialBotoes.anterior = {
    x: painelX + (compacto ? 14 : 24),
    y: botaoY,
    w: botaoW,
    h: botaoH
  }
  tutorialBotoes.proxima = {
    x: painelX + painelW - botaoW - (compacto ? 14 : 24),
    y: botaoY,
    w: botaoW,
    h: botaoH
  }

  desenharBotaoTutorial(
    tutorialBotoes.anterior,
    '< ANTERIOR',
    podeVoltar,
    compacto
  )
  desenharBotaoTutorial(
    tutorialBotoes.proxima,
    textoProximo,
    true,
    compacto
  )

  ctx.textAlign = 'center'
  for (let i = 0; i < arquivo.paginas.length; i++) {
    const x = painelX + painelW / 2 + (i - (arquivo.paginas.length - 1) / 2) * (compacto ? 18 : 24)
    ctx.fillStyle = i === arquivo.paginaAtual ? '#ffffff' : 'rgba(0, 255, 65, 0.28)'
    ctx.beginPath()
    ctx.arc(x, botaoY + botaoH / 2, i === arquivo.paginaAtual ? 5 : 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

function desenharBotaoTutorial(rect, texto, habilitado, compacto) {
  const hover = habilitado && mouseSobre(rect)
  ctx.fillStyle = habilitado
    ? (hover ? 'rgba(0, 255, 65, 0.3)' : 'rgba(0, 255, 65, 0.12)')
    : 'rgba(40, 60, 46, 0.25)'
  ctx.strokeStyle = habilitado ? '#00ff41' : '#36563f'
  ctx.lineWidth = 1
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)
  ctx.fillStyle = habilitado ? '#d6ffe2' : '#52705a'
  ctx.textAlign = 'center'
  ctx.font = compacto ? '10px Courier New' : '12px Courier New'
  ctx.fillText(texto, rect.x + rect.w / 2, rect.y + (compacto ? 8 : 11))
}

function desenharGameover() {
  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.72)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.shadowBlur = 18
  ctx.shadowColor = '#00ff41'
  ctx.fillStyle = '#00ff41'
  ctx.font = '32px Courier New'
  ctx.fillText(gameoverTitulo, canvas.width / 2, canvas.height / 2 - 70)
  ctx.font = '18px Courier New'
  ctx.fillText(gameoverTexto, canvas.width / 2, canvas.height / 2 - 28)
  ctx.fillText('Score final: ' + score, canvas.width / 2, canvas.height / 2 + 8)
  ctx.fillText('Pressione ENTER para reiniciar', canvas.width / 2, canvas.height / 2 + 58)
  ctx.restore()
}

function desenharGlitch(agora, intensidade) {
  const forca = intensidade || 0.8
  ctx.save()
  for (let i = 0; i < 12 * forca; i++) {
    const y = Math.random() * canvas.height
    const h = 4 + Math.random() * 18
    const x = (Math.random() - 0.5) * 90 * forca
    ctx.globalAlpha = 0.12 + Math.random() * 0.22
    ctx.fillStyle = Math.random() > 0.5 ? '#00ff41' : '#ffffff'
    ctx.fillRect(x, y, canvas.width, h)
  }
  ctx.restore()
}

function desenharEfeitosTela(agora) {
  const dentroDaMatrix =
    estado === STATE_CUTSCENE ||
    estado === STATE_TUTORIAL ||
    estado === STATE_PLAYING ||
    estado === STATE_QUESTION ||
    estado === STATE_SHOP ||
    estado === STATE_GAMEOVER

  if (dentroDaMatrix) {
    ctx.save()
    ctx.fillStyle = obterVinhetaTela()
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.restore()
  }

  if (agora < efeitos.flashAte) {
    const alpha = Math.max(0, (efeitos.flashAte - agora) / 180) * 0.22
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = efeitos.flashCor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
  }

  if (agora < efeitos.glitchAte) {
    desenharGlitch(agora, 0.9)
  }
}

function obterVinhetaTela() {
  if (
    cacheVinhetaTela.gradiente &&
    cacheVinhetaTela.largura === canvas.width &&
    cacheVinhetaTela.altura === canvas.height
  ) {
    return cacheVinhetaTela.gradiente
  }

  const gradiente = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    Math.min(canvas.width, canvas.height) * 0.22,
    canvas.width / 2,
    canvas.height / 2,
    Math.max(canvas.width, canvas.height) * 0.72
  )
  gradiente.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradiente.addColorStop(1, 'rgba(0, 0, 0, 0.48)')

  cacheVinhetaTela.largura = canvas.width
  cacheVinhetaTela.altura = canvas.height
  cacheVinhetaTela.gradiente = gradiente
  return gradiente
}

function quebrarTexto(texto, x, y, largura, alturaLinha, fonte) {
  const blocos = texto.split('\n')
  let linhaY = y

  ctx.save()
  ctx.font = fonte || '16px Courier New'
  ctx.fillStyle = '#b7ffd0'

  for (let b = 0; b < blocos.length; b++) {
    const palavras = blocos[b].split(' ')
    let linha = ''

    for (let i = 0; i < palavras.length; i++) {
      const teste = linha + palavras[i] + ' '
      if (ctx.measureText(teste).width > largura && linha !== '') {
        ctx.fillText(linha, x, linhaY)
        linha = palavras[i] + ' '
        linhaY += alturaLinha
      } else {
        linha = teste
      }
    }

    ctx.fillText(linha, x, linhaY)
    linhaY += alturaLinha + 6
  }

  ctx.restore()
}

function mouseSobre(rect) {
  return mouse.x >= rect.x && mouse.x <= rect.x + rect.w && mouse.y >= rect.y && mouse.y <= rect.y + rect.h
}

function voltarPaginaTutorial() {
  if (arquivoTutorialAtivo.paginaAtual > 0) {
    arquivoTutorialAtivo.paginaAtual--
    return
  }

  const indiceAtual = tutorialArquivos.indexOf(arquivoTutorialAtivo)
  if (indiceAtual > 0) {
    arquivoTutorialAtivo = tutorialArquivos[indiceAtual - 1]
    arquivoTutorialAtivo.paginaAtual = arquivoTutorialAtivo.paginas.length - 1
  }
}

function avancarPaginaTutorial() {
  const arquivo = arquivoTutorialAtivo
  const indiceAtual = tutorialArquivos.indexOf(arquivo)
  arquivo.aberto = true

  if (arquivo.paginaAtual < arquivo.paginas.length - 1) {
    arquivo.paginaAtual++
    return
  }

  arquivo.concluido = true

  if (indiceAtual < tutorialArquivos.length - 1) {
    arquivoTutorialAtivo = tutorialArquivos[indiceAtual + 1]
    arquivoTutorialAtivo.aberto = true
    arquivoTutorialAtivo.paginaAtual = 0
    efeitos.glitchAte = performance.now() + 240
    return
  }

  iniciarWave(1)
}

function lidarTeclaTutorial(event) {
  if (event.code === 'ArrowLeft') {
    voltarPaginaTutorial()
    return
  }

  if (event.code === 'ArrowRight' || event.code === 'Space' || event.key === 'Enter') {
    avancarPaginaTutorial()
  }
}

function lidarClique() {
  if (transicao.ativa) {
    return
  }

  if (estado === STATE_FACULDADE) {
    avancarFaculdade()
    return
  }

  if (estado === STATE_CASA) {
    avancarCasa()
    return
  }

  if (estado === STATE_COMPUTADOR) {
    if (matrixExeRect && mouseSobre(matrixExeRect) && !computadorExecutando) {
      computadorExecutando = true
      computadorExecutadoEm = performance.now()
      efeitos.glitchAte = computadorExecutadoEm + 1000
    }
    return
  }

  if (estado === STATE_TUTORIAL) {
    if (
      tutorialBotoes.anterior &&
      mouseSobre(tutorialBotoes.anterior) &&
      (arquivoTutorialAtivo.paginaAtual > 0 || tutorialArquivos.indexOf(arquivoTutorialAtivo) > 0)
    ) {
      voltarPaginaTutorial()
      return
    }

    if (tutorialBotoes.proxima && mouseSobre(tutorialBotoes.proxima)) {
      avancarPaginaTutorial()
      return
    }
    return
  }

  if (estado === STATE_QUESTION) {
    if (questaoAtual && questaoAtual.respondida) {
      finalizarQuestao()
      return
    }

    for (let i = 0; i < questaoBotoes.length; i++) {
      const botao = questaoBotoes[i]
      if (mouseSobre(botao.rect)) {
        alternativaSelecionada = botao.indice
        avaliarResposta()
        return
      }
    }
  }

  if (estado === STATE_SHOP) {
    for (let i = 0; i < shopBotoes.length; i++) {
      const botao = shopBotoes[i]
      if (mouseSobre(botao.rect)) {
        if (botao.tipo === 'proxima') {
          iniciarWave(wave + 1)
          return
        }

        comprarUpgrade(botao.item)
        return
      }
    }
  }
}

function lidarTeclaQuestao(event) {
  if (!questaoAtual) {
    return
  }

  if (questaoAtual.respondida) {
    if (event.key === 'Enter' || event.code === 'Space') {
      finalizarQuestao()
    }

    return
  }

  const numero = Number(event.key)

  if (numero >= 1 && numero <= 4 && questaoAtual.alternativas[numero - 1]) {
    alternativaSelecionada = numero - 1
    avaliarResposta()
    return
  }

  if (event.key === 'Enter') {
    avaliarResposta()
    return
  }
}

function loop(agora) {
  const delta = Math.min(33, agora - ultimoFrame)
  ultimoFrame = agora
  atualizarNivelDetalhe(delta, agora)

  if (estado === STATE_CUTSCENE) {
    const tempoCutscene = agora - estadoIniciadoEm
    const velocidadeMatrix = 1 + Math.min(4.2, tempoCutscene / 1700)
    drawMatrix(ctx, canvas, velocidadeMatrix, delta, desempenho.detalhe)
  } else if (
    estado === STATE_TUTORIAL ||
    estado === STATE_PLAYING ||
    estado === STATE_QUESTION ||
    estado === STATE_SHOP ||
    estado === STATE_GAMEOVER
  ) {
    drawMatrix(ctx, canvas, 1, delta, desempenho.detalhe)
  }

  if (estado === STATE_FACULDADE) {
    desenharFaculdade(agora)
  } else if (estado === STATE_CAMINHO) {
    atualizarCaminho(agora)
    desenharCaminho()
  } else if (estado === STATE_CASA) {
    atualizarCasa()
    desenharCasa()
  } else if (estado === STATE_COMPUTADOR) {
    atualizarComputador(agora)
    desenharTelaComputador(agora)
  } else if (estado === STATE_CUTSCENE) {
    desenharCutscene(agora)
  } else if (estado === STATE_TUTORIAL) {
    desenharTutorial(agora)
  } else if (estado === STATE_PLAYING) {
    atualizarJogo(agora)
    desenharJogo(agora)
  } else if (estado === STATE_QUESTION) {
    desenharJogo(agora)
    questaoBotoes = desenharQuestao(ctx, canvas, questaoAtual, alternativaSelecionada)
  } else if (estado === STATE_SHOP) {
    desenharJogo(agora)
    shopBotoes = desenharShop(ctx, canvas, pontos, SHOP_ITENS)
  } else if (estado === STATE_GAMEOVER) {
    desenharGameover()
  }

  desenharEfeitosTela(agora)
  atualizarTransicao(agora)
  desenharTransicao(agora)
  requestAnimationFrame(loop)
}

window.addEventListener('resize', ajustarCanvas)

window.addEventListener('mousemove', function(event) {
  mouse.x = event.clientX
  mouse.y = event.clientY
})

window.addEventListener('mousedown', function(event) {
  if (event.button !== 0) {
    return
  }

  iniciarMusicaFundo()

  const estadoAntesClique = estado
  mouse.down = estadoAntesClique === STATE_PLAYING
  lidarClique()

  if (estadoAntesClique === STATE_PLAYING) {
    atirar(performance.now())
  }
})

window.addEventListener('mouseup', function(event) {
  if (event.button === 0) {
    mouse.down = false
  }
})

window.addEventListener('keydown', function(event) {
  keys[event.code] = true

  if (event.code === 'KeyM' && window.CriticalPointMusic) {
    event.preventDefault()
    window.CriticalPointMusic.toggleMute()
    iniciarMusicaFundo()
    return
  }

  iniciarMusicaFundo()

  if (transicao.ativa) {
    return
  }

  if (event.code === 'Space' && estado === STATE_FACULDADE) {
    event.preventDefault()
    avancarFaculdade()
    return
  }

  if (event.code === 'Space' && estado === STATE_CASA) {
    event.preventDefault()
    avancarCasa()
    return
  }

  if (estado === STATE_TUTORIAL) {
    event.preventDefault()
    lidarTeclaTutorial(event)
    return
  }

  if (estado === STATE_QUESTION) {
    event.preventDefault()
    lidarTeclaQuestao(event)
    return
  }

  if (event.code === 'Space') {
    event.preventDefault()
    atirar(performance.now())
  }

  if (event.key === 'Enter' && estado === STATE_GAMEOVER) {
    resetarJogo()
  }
})

window.addEventListener('keyup', function(event) {
  keys[event.code] = false
})

ajustarCanvas()
requestAnimationFrame(loop)

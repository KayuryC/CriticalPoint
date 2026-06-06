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
    titulo: 'Wave 4 - Maximos, minimos e Hessiana',
    texto: 'Classifique o ponto critico de f(x,y) = x^2 - y^2 no ponto (0,0)',
    dica: 'A curvatura muda de sinal entre x e y.',
    alternativas: [
      { texto: 'Minimo local', correta: false },
      { texto: 'Maximo local', correta: false },
      { texto: 'Ponto regular', correta: false },
      { texto: 'Ponto de sela', correta: true }
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
    titulo: 'Funcoes f(x,y)',
    texto: 'Uma funcao f(x,y) recebe dois valores de entrada e devolve uma saida.\nDominio e o mapa de pontos permitidos: cada (x,y) e uma coordenada onde Zion pode testar a funcao.\nImagem e o conjunto dos valores que podem sair desse mapa. Em f=x^2+y^2, pontos longe da origem geram alturas maiores.'
  },
  {
    id: 2,
    nome: 'ARQUIVO_02.exe',
    aberto: false,
    titulo: 'Derivadas parciais',
    texto: 'Derivada parcial congela uma variavel e observa a outra.\ndf/dx pergunta: se apenas x mudar, a superficie sobe ou desce? df/dy faz a mesma leitura para y.\nNo combate, pensar uma coordenada por vez ajuda Zion a prever como uma ameaca muda de direcao.'
  },
  {
    id: 3,
    nome: 'ARQUIVO_03.exe',
    aberto: false,
    titulo: 'Vetor gradiente',
    texto: 'O gradiente junta as derivadas parciais em um vetor: grad f = (df/dx, df/dy).\nEle aponta para o crescimento mais rapido da funcao; o sentido contrario aponta para a descida mais rapida.\nQuando um agente segue o gradiente da distancia ate Zion, calculo vira perseguicao.'
  },
  {
    id: 4,
    nome: 'ARQUIVO_04.exe',
    aberto: false,
    titulo: 'Pontos criticos',
    texto: 'Pontos criticos aparecem quando o gradiente zera: ali a funcao para de subir ou descer naquele instante.\nA Hessiana organiza as segundas derivadas e revela a curvatura local.\nCurvatura positiva em todas as direcoes sugere minimo; negativa sugere maximo; sinais misturados indicam ponto de sela.'
  }
]

let estado = STATE_FACULDADE
let estadoIniciadoEm = performance.now()
let player = criarPlayer(canvas)
let balas = []
let balasInimigas = []
let inimigos = []
let particulas = []
let score = 0
let pontos = 0
let wave = 1
let questaoAtual = null
let alternativaSelecionada = null
let arquivoTutorialAtivo = tutorialArquivos[0]
let shopBotoes = []
let questaoBotoes = []
let ultimoFrame = performance.now()
let aguardandoPunitivo = false
let bossPerguntaResolvida = false
let proximaPerguntaBoss = 0
let gameoverTitulo = 'FIM DA CONEXAO'
let gameoverTexto = 'Zion foi desconectado da Matrix.'
let efeitos = {
  glitchAte: 0
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

function trocarEstado(novoEstado) {
  estado = novoEstado
  estadoIniciadoEm = performance.now()

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
  score = 0
  pontos = 0
  wave = 1
  questaoAtual = null
  alternativaSelecionada = null
  questaoBotoes = []
  aguardandoPunitivo = false
  bossPerguntaResolvida = false
  proximaPerguntaBoss = 0

  for (let i = 0; i < tutorialArquivos.length; i++) {
    tutorialArquivos[i].aberto = false
  }

  arquivoTutorialAtivo = tutorialArquivos[0]
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
  inimigos = spawnWave(canvas, wave)
  aguardandoPunitivo = false

  if (wave === 4) {
    bossPerguntaResolvida = false
    abrirQuestao(4, true)
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
  questaoAtual = {
    wave: numeroWave,
    boss: !!boss,
    titulo: QUESTOES[numeroWave].titulo,
    texto: QUESTOES[numeroWave].texto,
    dica: QUESTOES[numeroWave].dica,
    alternativas: QUESTOES[numeroWave].alternativas
  }
  alternativaSelecionada = null
  questaoBotoes = []
  trocarEstado(STATE_QUESTION)
}

function avaliarResposta() {
  if (alternativaSelecionada === null || !questaoAtual.alternativas[alternativaSelecionada]) {
    return
  }

  const correta = questaoAtual.alternativas[alternativaSelecionada].correta

  if (correta) {
    score += 50
    pontos += 50

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

  balas.push(criarBala(player))
  player.ultimoTiro = agora
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

  const novasBalas = gerarDisparosInimigos(inimigos, agora)
  for (let i = 0; i < novasBalas.length; i++) {
    balasInimigas.push(novasBalas[i])
  }

  const resultadoColisao = verificarColisaoInimigos(inimigos, balas)

  for (let i = 0; i < resultadoColisao.mortos.length; i++) {
    const morto = resultadoColisao.mortos[i]
    score += morto.pontos
    pontos += morto.pontos
    particulas = particulas.concat(criarParticulas(morto.x, morto.y, morto.cor, morto.tipo === 'boss' ? 70 : 22))

    if (morto.tipo === 'boss') {
      vencerJogo()
      return
    }
  }

  if (verificarColisaoBalasPlayer(balasInimigas, player, agora)) {
    particulas = particulas.concat(criarParticulas(player.x, player.y, '#ff2020', 16))
  }

  if (verificarColisaoPlayerInimigos(inimigos, player, agora)) {
    particulas = particulas.concat(criarParticulas(player.x, player.y, '#ff2020', 12))
  }

  const expirados = removerInimigosExpirados(inimigos, agora)
  for (let i = 0; i < expirados.length; i++) {
    if (expirados[i].tipo === 'punitivo') {
      score += 30
      pontos += 30
      particulas = particulas.concat(criarParticulas(expirados[i].x, expirados[i].y, '#8b0000', 36))
    }
  }

  atualizarParticulas(particulas)
  removerParticulas(particulas)

  if (player.vida <= 0) {
    gameoverTitulo = 'FIM DA CONEXAO'
    gameoverTexto = 'Zion foi desconectado da Matrix.'
    trocarEstado(STATE_GAMEOVER)
    return
  }

  if (wave === 4 && !bossPerguntaResolvida && agora > proximaPerguntaBoss && !existePunitivo()) {
    abrirQuestao(4, true)
    return
  }

  if (wave < 4 && !aguardandoPunitivo && contarInimigosDeCombate() === 0) {
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

function desenharJogo() {
  desenharInimigos(ctx, inimigos)
  desenharBalas(ctx, balas)
  desenharBalas(ctx, balasInimigas)
  desenharPlayer(ctx, player)
  desenharParticulas(ctx, particulas)
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
  const todosAbertos = tutorialArquivos.every(function(arquivo) {
    return arquivo.aberto
  })
  const gapX = canvas.width < 760 ? 28 : 42
  const gapY = canvas.width < 760 ? 28 : 34
  const margemLateral = canvas.width < 760 ? 32 : 80
  const colunas = canvas.width < 760 ? 2 : 4
  const cardW = Math.min(230, (canvas.width - margemLateral - gapX * (colunas - 1)) / colunas)
  const cardH = canvas.width < 760 ? 78 : 92
  const inicioX = canvas.width / 2 - ((cardW * colunas + gapX * (colunas - 1)) / 2)
  const inicioY = canvas.height < 680 ? 118 : Math.max(140, canvas.height * 0.2)
  const totalLinhasCards = Math.ceil(tutorialArquivos.length / colunas)
  const cardsBottom = inicioY + totalLinhasCards * cardH + (totalLinhasCards - 1) * gapY
  const espacoDepoisCards = canvas.height < 720 ? 54 : 68

  ctx.save()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#00ff41'
  ctx.shadowBlur = 18
  ctx.shadowColor = '#00ff41'
  ctx.font = '28px Courier New'
  ctx.fillText('ARQUIVOS CORROMPIDOS', canvas.width / 2, 70)

  for (let i = 0; i < tutorialArquivos.length; i++) {
    const arquivo = tutorialArquivos[i]
    const coluna = i % colunas
    const linha = Math.floor(i / colunas)
    const x = inicioX + coluna * (cardW + gapX)
    const y = inicioY + linha * (cardH + gapY)

    arquivo.rect = { x: x, y: y, w: cardW, h: cardH }
    ctx.fillStyle = arquivo.aberto ? 'rgba(0, 255, 65, 0.18)' : 'rgba(0, 0, 0, 0.72)'
    ctx.strokeStyle = arquivo === arquivoTutorialAtivo ? '#d6ffe2' : '#00ff41'
    ctx.lineWidth = arquivo === arquivoTutorialAtivo ? 3 : 1
    ctx.fillRect(x, y, cardW, cardH)
    ctx.strokeRect(x, y, cardW, cardH)
    ctx.fillStyle = arquivo.aberto ? '#d6ffe2' : '#00ff41'
    ctx.font = canvas.width < 760 ? '13px Courier New' : '16px Courier New'
    ctx.fillText(arquivo.nome, x + cardW / 2, y + 39)
    ctx.font = canvas.width < 760 ? '11px Courier New' : '13px Courier New'
    ctx.fillText(arquivo.aberto ? 'DECRIPTOGRAFADO' : 'CLIQUE PARA ABRIR', x + cardW / 2, y + (cardH - 28))
  }

  const painelW = Math.min(780, canvas.width - 36)
  const painelX = canvas.width / 2 - painelW / 2
  const alturaPainelDesejada = canvas.height < 720 ? 236 : 278
  const rodapeReservado = todosAbertos ? 122 : 78
  const alturaPainelDisponivel = canvas.height - cardsBottom - espacoDepoisCards - rodapeReservado
  const painelH = Math.max(126, Math.min(alturaPainelDesejada, alturaPainelDisponivel))
  const painelY = cardsBottom + espacoDepoisCards
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(0, 12, 4, 0.84)'
  ctx.strokeStyle = '#00ff41'
  ctx.lineWidth = 2
  ctx.fillRect(painelX, painelY, painelW, painelH)
  ctx.strokeRect(painelX, painelY, painelW, painelH)
  ctx.fillStyle = '#d6ffe2'
  ctx.font = '20px Courier New'
  ctx.fillText(arquivoTutorialAtivo.titulo, painelX + 26, painelY + 38)
  quebrarTexto(arquivoTutorialAtivo.texto, painelX + 26, painelY + 78, painelW - 52, 22, '15px Courier New')

  if (todosAbertos) {
    const botao = obterBotaoEntrarMatrix()
    ctx.textAlign = 'center'
    ctx.fillStyle = mouseSobre(botao) ? 'rgba(0, 255, 65, 0.3)' : 'rgba(0, 255, 65, 0.14)'
    ctx.strokeStyle = '#00ff41'
    ctx.fillRect(botao.x, botao.y, botao.w, botao.h)
    ctx.strokeRect(botao.x, botao.y, botao.w, botao.h)
    ctx.fillStyle = '#ffffff'
    ctx.font = '20px Courier New'
    ctx.fillText('ENTRAR NA MATRIX', botao.x + botao.w / 2, botao.y + 32)
  } else {
    ctx.fillStyle = '#00ff41'
    ctx.textAlign = 'center'
    ctx.font = '16px Courier New'
    ctx.fillText('Abra os 4 arquivos para liberar a entrada.', canvas.width / 2, canvas.height - 42)
  }

  ctx.restore()
  if (Math.random() < 0.04) {
    desenharGlitch(agora, 0.16)
  }
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
  if (agora < efeitos.glitchAte) {
    desenharGlitch(agora, 0.9)
  }
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

function obterBotaoEntrarMatrix() {
  return {
    x: canvas.width / 2 - 140,
    y: canvas.height - 94,
    w: 280,
    h: 52
  }
}

function mouseSobre(rect) {
  return mouse.x >= rect.x && mouse.x <= rect.x + rect.w && mouse.y >= rect.y && mouse.y <= rect.y + rect.h
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
    for (let i = 0; i < tutorialArquivos.length; i++) {
      const arquivo = tutorialArquivos[i]
      if (arquivo.rect && mouseSobre(arquivo.rect)) {
        arquivo.aberto = true
        arquivoTutorialAtivo = arquivo
        return
      }
    }

    const todosAbertos = tutorialArquivos.every(function(arquivo) {
      return arquivo.aberto
    })

    if (todosAbertos && mouseSobre(obterBotaoEntrarMatrix())) {
      iniciarWave(1)
    }
    return
  }

  if (estado === STATE_QUESTION) {
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

  if (estado === STATE_CUTSCENE) {
    const tempoCutscene = agora - estadoIniciadoEm
    const velocidadeMatrix = 1 + Math.min(4.2, tempoCutscene / 1700)
    drawMatrix(ctx, canvas, velocidadeMatrix, delta)
  } else if (
    estado === STATE_TUTORIAL ||
    estado === STATE_PLAYING ||
    estado === STATE_QUESTION ||
    estado === STATE_SHOP ||
    estado === STATE_GAMEOVER
  ) {
    drawMatrix(ctx, canvas, 1, delta)
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
    desenharJogo()
  } else if (estado === STATE_QUESTION) {
    desenharJogo()
    questaoBotoes = desenharQuestao(ctx, canvas, questaoAtual, alternativaSelecionada)
  } else if (estado === STATE_SHOP) {
    desenharJogo()
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

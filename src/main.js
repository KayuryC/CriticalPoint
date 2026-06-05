const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

const STATE_COMPUTER = 'computer'
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
    respostas: ['13'],
    dica: 'Substitua x por 2 e y por 3.'
  },
  2: {
    titulo: 'Wave 2 - Derivada parcial',
    texto: 'Calcule df/dx de f(x,y) = 3x^2 + 2xy + y^2',
    respostas: ['6x+2y', '2y+6x'],
    dica: 'Trate y como constante.'
  },
  3: {
    titulo: 'Wave 3 - Vetor gradiente',
    texto: 'Qual a direcao do gradiente de f(x,y) = x^2 + y^2 no ponto (1,2)?',
    respostas: ['(2,4)', '2,4', '<2,4>'],
    dica: 'O gradiente e formado por (df/dx, df/dy).'
  },
  4: {
    titulo: 'Wave 4 - Maximos, minimos e Hessiana',
    texto: 'Classifique o ponto critico de f(x,y) = x^2 - y^2 no ponto (0,0)',
    respostas: ['pontodesela', 'sela', 'pontosela'],
    dica: 'A curvatura muda de sinal entre x e y.'
  }
}

const SHOP_ITENS = [
  { id: 'shield', nome: 'SHIELD+', detalhe: '+2 HP maximo', custo: 50 },
  { id: 'firepower', nome: 'FIREPOWER+', detalhe: '+1 dano', custo: 75 },
  { id: 'speed', nome: 'SPEED+', detalhe: '+ velocidade', custo: 60 },
  { id: 'cooldown', nome: 'COOLDOWN-', detalhe: 'tiros mais rapidos', custo: 80 }
]

const tutorialArquivos = [
  {
    id: 1,
    nome: 'ARQUIVO_01.exe',
    aberto: false,
    titulo: 'Funcoes f(x,y)',
    texto: 'Uma funcao de varias variaveis recebe pontos do plano e devolve uma altura. Dominio e o conjunto de entradas; imagem e o conjunto de saidas.'
  },
  {
    id: 2,
    nome: 'ARQUIVO_02.exe',
    aberto: false,
    titulo: 'Derivadas parciais',
    texto: 'A derivada parcial mede como a funcao muda quando apenas uma variavel se move e as outras ficam congeladas.'
  },
  {
    id: 3,
    nome: 'ARQUIVO_03.exe',
    aberto: false,
    titulo: 'Vetor gradiente',
    texto: 'O gradiente aponta para a direcao de maior crescimento da funcao. No jogo, alguns agentes seguem essa ideia para perseguir Zion.'
  },
  {
    id: 4,
    nome: 'ARQUIVO_04.exe',
    aberto: false,
    titulo: 'Pontos criticos',
    texto: 'Maximos, minimos e pontos de sela aparecem quando o gradiente zera. A Hessiana ajuda a classificar a curvatura local.'
  }
]

let estado = STATE_COMPUTER
let estadoIniciadoEm = performance.now()
let player = criarPlayer(canvas)
let balas = []
let balasInimigas = []
let inimigos = []
let particulas = []
let score = 0
let pontos = 0
let wave = 1
let respostaDigitada = ''
let questaoAtual = null
let arquivoTutorialAtivo = tutorialArquivos[0]
let shopBotoes = []
let ultimoFrame = performance.now()
let aguardandoPunitivo = false
let bossPerguntaResolvida = false
let proximaPerguntaBoss = 0
let gameoverTitulo = 'FIM DA CONEXAO'
let gameoverTexto = 'Zion foi desconectado da Matrix.'
let efeitos = {
  flashAte: 0,
  danoAte: 0,
  glitchAte: 0
}

function ajustarCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  player.x = Math.min(player.x, canvas.width - player.tamanho)
  player.y = Math.min(player.y, canvas.height - player.tamanho)
}

function trocarEstado(novoEstado) {
  estado = novoEstado
  estadoIniciadoEm = performance.now()
}

function resetarJogo() {
  player = criarPlayer(canvas)
  balas = []
  balasInimigas = []
  inimigos = []
  particulas = []
  score = 0
  pontos = 0
  wave = 1
  respostaDigitada = ''
  questaoAtual = null
  aguardandoPunitivo = false
  bossPerguntaResolvida = false
  proximaPerguntaBoss = 0

  for (let i = 0; i < tutorialArquivos.length; i++) {
    tutorialArquivos[i].aberto = false
  }

  arquivoTutorialAtivo = tutorialArquivos[0]
  trocarEstado(STATE_COMPUTER)
}

function iniciarWave(numeroWave) {
  wave = numeroWave
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

function abrirQuestao(numeroWave, boss) {
  questaoAtual = {
    wave: numeroWave,
    boss: !!boss,
    titulo: QUESTOES[numeroWave].titulo,
    texto: QUESTOES[numeroWave].texto,
    dica: QUESTOES[numeroWave].dica
  }
  respostaDigitada = ''
  trocarEstado(STATE_QUESTION)
}

function normalizarResposta(valor) {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')
}

function avaliarResposta() {
  const respostas = QUESTOES[questaoAtual.wave].respostas
  const resposta = normalizarResposta(respostaDigitada)
  const correta = respostas.indexOf(resposta) !== -1

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
  if (resultadoColisao.acertos > 0) {
    efeitos.flashAte = agora + 80
  }

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
    efeitos.danoAte = agora + 180
    particulas = particulas.concat(criarParticulas(player.x, player.y, '#ff2020', 16))
  }

  if (verificarColisaoPlayerInimigos(inimigos, player, agora)) {
    efeitos.danoAte = agora + 180
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

function desenharTelaComputador(agora) {
  const tempo = agora - estadoIniciadoEm
  const centroX = canvas.width / 2
  const centroY = canvas.height / 2
  const largura = Math.min(920, canvas.width - 40)
  const altura = Math.min(620, canvas.height - 40)
  const x = centroX - largura / 2
  const y = centroY - altura / 2

  ctx.save()
  ctx.fillStyle = 'rgba(0, 18, 8, 0.88)'
  ctx.strokeStyle = '#00ff41'
  ctx.lineWidth = 2
  ctx.shadowBlur = 18
  ctx.shadowColor = '#00ff41'
  ctx.fillRect(x, y, largura, altura)
  ctx.strokeRect(x, y, largura, altura)

  ctx.shadowBlur = 0
  ctx.fillStyle = '#00ff41'
  ctx.font = '18px Courier New'
  ctx.fillText('ZION_OS :: /home/zion/calculo', x + 24, y + 36)
  ctx.fillText('> abrir matrix.exe', x + 24, y + 70)

  desenharWireframeFuncao(x + largura * 0.08, y + 118, largura * 0.42, altura * 0.48, tempo)
  desenharTextoDigitado(
    'f(x,y)=x^2+y^2 mapeia pontos do dominio para alturas na imagem. Cada coordenada escolhida por Zion revela uma parte da superficie.',
    x + largura * 0.53,
    y + 130,
    largura * 0.38,
    tempo,
    26
  )

  const botao = obterBotaoComputador()
  ctx.shadowBlur = 12
  ctx.shadowColor = '#00ff41'
  ctx.fillStyle = mouseSobre(botao) ? 'rgba(0, 255, 65, 0.24)' : 'rgba(0, 255, 65, 0.1)'
  ctx.strokeStyle = '#00ff41'
  ctx.fillRect(botao.x, botao.y, botao.w, botao.h)
  ctx.strokeRect(botao.x, botao.y, botao.w, botao.h)
  ctx.fillStyle = '#d6ffe2'
  ctx.font = '20px Courier New'
  ctx.textAlign = 'center'
  ctx.fillText('EXECUTAR matrix.exe', botao.x + botao.w / 2, botao.y + 32)
  ctx.restore()
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
    'Conexao detectada...',
    'Bem-vindo, Zion...',
    'O conhecimento e sua unica arma...'
  ]

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.font = '24px Courier New'
  ctx.shadowBlur = 18
  ctx.shadowColor = '#00ff41'

  for (let i = 0; i < linhas.length; i++) {
    if (tempo > i * 1600) {
      ctx.fillStyle = '#00ff41'
      ctx.fillText(linhas[i], canvas.width / 2, canvas.height / 2 - 56 + i * 42)
    }
  }

  desenharGlitch(agora, 0.35)
  ctx.restore()

  if (tempo > 6200) {
    trocarEstado(STATE_TUTORIAL)
  }
}

function desenharTutorial(agora) {
  const todosAbertos = tutorialArquivos.every(function(arquivo) {
    return arquivo.aberto
  })
  const cardW = Math.min(230, canvas.width * 0.42)
  const cardH = 92
  const gap = 22
  const colunas = canvas.width < 720 ? 1 : 4
  const inicioX = canvas.width / 2 - ((cardW * colunas + gap * (colunas - 1)) / 2)
  const inicioY = canvas.height * 0.18

  ctx.save()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#00ff41'
  ctx.shadowBlur = 18
  ctx.shadowColor = '#00ff41'
  ctx.font = '28px Courier New'
  ctx.fillText('ARQUIVOS CORROMPIDOS', canvas.width / 2, 70)

  for (let i = 0; i < tutorialArquivos.length; i++) {
    const arquivo = tutorialArquivos[i]
    const coluna = colunas === 1 ? 0 : i
    const linha = colunas === 1 ? i : 0
    const x = inicioX + coluna * (cardW + gap)
    const y = inicioY + linha * (cardH + gap)

    arquivo.rect = { x: x, y: y, w: cardW, h: cardH }
    ctx.fillStyle = arquivo.aberto ? 'rgba(0, 255, 65, 0.18)' : 'rgba(0, 0, 0, 0.72)'
    ctx.strokeStyle = arquivo === arquivoTutorialAtivo ? '#d6ffe2' : '#00ff41'
    ctx.lineWidth = arquivo === arquivoTutorialAtivo ? 3 : 1
    ctx.fillRect(x, y, cardW, cardH)
    ctx.strokeRect(x, y, cardW, cardH)
    ctx.fillStyle = arquivo.aberto ? '#d6ffe2' : '#00ff41'
    ctx.font = '16px Courier New'
    ctx.fillText(arquivo.nome, x + cardW / 2, y + 39)
    ctx.font = '13px Courier New'
    ctx.fillText(arquivo.aberto ? 'DECRIPTOGRAFADO' : 'CLIQUE PARA ABRIR', x + cardW / 2, y + 64)
  }

  const painelW = Math.min(780, canvas.width - 36)
  const painelX = canvas.width / 2 - painelW / 2
  const painelY = canvas.height < 620 ? canvas.height * 0.58 : canvas.height * 0.48
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(0, 12, 4, 0.84)'
  ctx.strokeStyle = '#00ff41'
  ctx.lineWidth = 2
  ctx.fillRect(painelX, painelY, painelW, 138)
  ctx.strokeRect(painelX, painelY, painelW, 138)
  ctx.fillStyle = '#d6ffe2'
  ctx.font = '20px Courier New'
  ctx.fillText(arquivoTutorialAtivo.titulo, painelX + 22, painelY + 34)
  quebrarTexto(arquivoTutorialAtivo.texto, painelX + 22, painelY + 68, painelW - 44, 20)

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

function desenharFlashs(agora) {
  if (agora < efeitos.flashAte) {
    ctx.save()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
  }

  if (agora < efeitos.danoAte) {
    ctx.save()
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
  }

  if (agora < efeitos.glitchAte) {
    desenharGlitch(agora, 0.9)
  }
}

function quebrarTexto(texto, x, y, largura, alturaLinha) {
  const palavras = texto.split(' ')
  let linha = ''
  let linhaY = y

  ctx.save()
  ctx.font = '16px Courier New'
  ctx.fillStyle = '#b7ffd0'

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

function obterBotaoComputador() {
  return {
    x: canvas.width / 2 - 145,
    y: Math.min(canvas.height - 100, canvas.height / 2 + 220),
    w: 290,
    h: 52
  }
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
  if (estado === STATE_COMPUTER && mouseSobre(obterBotaoComputador())) {
    trocarEstado(STATE_CUTSCENE)
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
  if (event.key === 'Enter') {
    avaliarResposta()
    return
  }

  if (event.key === 'Backspace') {
    respostaDigitada = respostaDigitada.slice(0, -1)
    return
  }

  if (event.key.length === 1 && respostaDigitada.length < 34) {
    respostaDigitada += event.key
  }
}

function loop(agora) {
  const delta = Math.min(33, agora - ultimoFrame)
  ultimoFrame = agora
  const velocidadeMatrix = estado === STATE_CUTSCENE ? 2.8 : estado === STATE_COMPUTER ? 0.55 : 1

  drawMatrix(ctx, canvas, velocidadeMatrix, delta)

  if (estado === STATE_COMPUTER) {
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
    desenharQuestao(ctx, canvas, questaoAtual, respostaDigitada)
  } else if (estado === STATE_SHOP) {
    desenharJogo()
    shopBotoes = desenharShop(ctx, canvas, pontos, SHOP_ITENS)
  } else if (estado === STATE_GAMEOVER) {
    desenharGameover()
  }

  desenharFlashs(agora)
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

  mouse.down = true
  lidarClique()
  atirar(performance.now())
})

window.addEventListener('mouseup', function(event) {
  if (event.button === 0) {
    mouse.down = false
  }
})

window.addEventListener('keydown', function(event) {
  keys[event.code] = true

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

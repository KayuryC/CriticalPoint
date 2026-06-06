// Cria Zion com atributos pensados para upgrades do shop.
function criarPlayer(canvas) {
  return {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vida: 6,
    vidaMaxima: 6,
    dano: 1,
    velocidade: 4,
    tamanho: 22,
    angulo: 0,
    cooldown: 260,
    ultimoTiro: 0,
    invulneravelAte: 0,
    movendo: false,
    fasePasso: 0,
    rastro: []
  }
}

// Atualiza a posicao do player com WASD ou setas, normalizando diagonais.
function moverPlayer(player, keys, canvas) {
  let dx = 0
  let dy = 0

  if (keys.KeyW || keys.ArrowUp) dy--
  if (keys.KeyS || keys.ArrowDown) dy++
  if (keys.KeyA || keys.ArrowLeft) dx--
  if (keys.KeyD || keys.ArrowRight) dx++

  player.movendo = dx !== 0 || dy !== 0

  if (player.movendo) {
    const distancia = Math.hypot(dx, dy)
    player.x += (dx / distancia) * player.velocidade
    player.y += (dy / distancia) * player.velocidade
    player.fasePasso += 0.22 + player.velocidade * 0.018

    player.rastro.push({
      x: player.x,
      y: player.y,
      angulo: player.angulo
    })

    if (player.rastro.length > 7) {
      player.rastro.shift()
    }
  } else if (player.rastro.length > 0) {
    player.rastro.shift()
  }

  const margem = player.tamanho + 8
  player.x = Math.max(margem, Math.min(canvas.width - margem, player.x))
  player.y = Math.max(margem, Math.min(canvas.height - margem, player.y))
}

// Mantem Zion mirando para a posicao atual do mouse.
function rotacionarPlayer(player, mouseX, mouseY) {
  player.angulo = Math.atan2(mouseY - player.y, mouseX - player.x)
}

function aplicarUpgradePlayer(player, tipo) {
  if (tipo === 'shield') {
    player.vidaMaxima += 2
    player.vida = player.vidaMaxima
  }

  if (tipo === 'firepower') {
    player.dano += 1
  }

  if (tipo === 'speed') {
    player.velocidade += 0.6
  }

  if (tipo === 'cooldown') {
    player.cooldown = Math.max(100, player.cooldown - 45)
  }
}

function receberDanoPlayer(player, dano, agora) {
  if (agora < player.invulneravelAte) {
    return false
  }

  player.vida -= dano
  player.invulneravelAte = agora + 700
  return true
}

function desenharSilhuetaPlayer(ctx, escala, alpha) {
  ctx.globalAlpha = alpha
  ctx.strokeStyle = '#00ff88'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, 12 * escala, 0, Math.PI * 2)
  ctx.stroke()
}

// Desenha Zion em perspectiva superior, com passada, sobretudo e arma animados.
function desenharPlayer(ctx, player, agora, detalhe) {
  const nivel = detalhe === undefined ? 2 : detalhe
  const tempo = (agora || performance.now()) * 0.001
  const piscandoDano = agora < player.invulneravelAte
  const pulso = 0.5 + Math.sin(tempo * 5) * 0.5
  const passo = player.movendo ? Math.sin(player.fasePasso) : Math.sin(tempo * 2.5) * 0.18

  const inicioRastro = nivel === 0 ? player.rastro.length : 0
  for (let i = inicioRastro; i < player.rastro.length; i++) {
    const ponto = player.rastro[i]
    ctx.save()
    ctx.translate(ponto.x, ponto.y)
    ctx.rotate(ponto.angulo)
    desenharSilhuetaPlayer(ctx, 0.72 + i * 0.025, (i / player.rastro.length) * 0.09)
    ctx.restore()
  }

  ctx.save()
  ctx.translate(player.x, player.y)
  ctx.rotate(player.angulo)

  ctx.strokeStyle = piscandoDano ? '#ffffff' : '#00ff41'
  ctx.fillStyle = piscandoDano ? '#ffffff' : '#071d10'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.shadowBlur = nivel === 0 ? 5 : 12 + pulso * 6
  ctx.shadowColor = '#00ff41'

  ctx.globalAlpha = 0.22 + pulso * 0.08
  ctx.beginPath()
  ctx.arc(0, 0, 27 + pulso * 3, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Sobretudo, pernas e corpo.
  ctx.beginPath()
  ctx.moveTo(-6, 11)
  ctx.lineTo(-14, 34 + passo * 4)
  ctx.lineTo(-3, 28)
  ctx.lineTo(0, 38 - passo * 5)
  ctx.lineTo(4, 28)
  ctx.lineTo(14, 34 - passo * 4)
  ctx.lineTo(7, 11)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = piscandoDano ? '#ffffff' : '#092b17'
  ctx.beginPath()
  ctx.arc(0, 0, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Ombros, bracos e arma.
  ctx.beginPath()
  ctx.moveTo(-11, 12)
  ctx.lineTo(6, 13)
  ctx.lineTo(19, 8)
  ctx.moveTo(3, 16)
  ctx.lineTo(18, 10)
  ctx.stroke()

  ctx.fillStyle = '#b7ffd0'
  ctx.beginPath()
  ctx.moveTo(16, 6)
  ctx.lineTo(34, 6)
  ctx.lineTo(38, 9)
  ctx.lineTo(34, 12)
  ctx.lineTo(16, 12)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = '#b7ffd0'
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.45 + pulso * 0.4
  ctx.beginPath()
  ctx.moveTo(42, 9)
  ctx.lineTo(58 + pulso * 6, 9)
  ctx.stroke()

  ctx.restore()
}

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
    invulneravelAte: 0
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

  if (dx !== 0 || dy !== 0) {
    const distancia = Math.hypot(dx, dy)
    player.x += (dx / distancia) * player.velocidade
    player.y += (dy / distancia) * player.velocidade
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

// Desenha Zion como boneco de palito com brilho Matrix e arma apontada.
function desenharPlayer(ctx, player) {
  const piscandoDano = performance.now() < player.invulneravelAte

  ctx.save()
  ctx.translate(player.x, player.y)
  ctx.rotate(player.angulo)

  ctx.strokeStyle = piscandoDano ? '#ffffff' : '#00ff41'
  ctx.fillStyle = '#00ff41'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.shadowBlur = 16
  ctx.shadowColor = '#00ff41'

  // Cabeca.
  ctx.beginPath()
  ctx.arc(0, 0, 8, 0, Math.PI * 2)
  ctx.stroke()

  // Tronco.
  ctx.beginPath()
  ctx.moveTo(0, 8)
  ctx.lineTo(0, 28)
  ctx.stroke()

  // Bracos e arma.
  ctx.beginPath()
  ctx.moveTo(-12, 13)
  ctx.lineTo(16, 13)
  ctx.lineTo(27, 10)
  ctx.stroke()

  // Pernas.
  ctx.beginPath()
  ctx.moveTo(0, 28)
  ctx.lineTo(-12, 44)
  ctx.moveTo(0, 28)
  ctx.lineTo(12, 44)
  ctx.stroke()

  // Mira curta na frente da arma.
  ctx.strokeStyle = '#b7ffd0'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(34, 10)
  ctx.lineTo(46, 10)
  ctx.stroke()

  ctx.restore()
}

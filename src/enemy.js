function criarInimigo(canvas, tipo, wave) {
  const spawn = escolherSpawnInimigo(canvas, tipo)
  const agora = performance.now()
  const dificuldade = Math.min(wave, 30)
  const dificuldadeVida = Math.min(wave, 80)
  const bonusVida = Math.floor(dificuldadeVida / 5)
  const inimigo = {
    tipo: tipo || 'normal',
    x: spawn.x,
    y: spawn.y,
    wave: wave,
    hp: 1,
    maxHp: 1,
    velocidade: 1.15 + dificuldade * 0.04,
    tamanho: 24,
    cor: '#ff2020',
    pontos: 10,
    modoGradiente: false,
    criadoEm: agora,
    ultimoTiro: agora + Math.random() * 900,
    intervaloTiro: 0,
    duracao: 0,
    vulneravel: true,
    protegidoAte: 0,
    multiplicadorDano: 1,
    ultimoDanoEm: 0,
    angulo: 0,
    fase: Math.random() * Math.PI * 2,
    danoAte: 0
  }

  if (tipo === 'laranja') {
    inimigo.hp = 4 + bonusVida
    inimigo.maxHp = inimigo.hp
    inimigo.velocidade = 1.0
    inimigo.cor = '#ff6020'
    inimigo.pontos = 25
  }

  if (tipo === 'gradiente') {
    inimigo.hp = 3 + Math.floor(dificuldadeVida / 6)
    inimigo.maxHp = inimigo.hp
    inimigo.modoGradiente = true
    inimigo.velocidade = 1.35
    inimigo.cor = '#ff4fff'
  }

  if (tipo === 'atirador') {
    inimigo.hp = 5 + Math.floor(dificuldadeVida / 5)
    inimigo.maxHp = inimigo.hp
    inimigo.velocidade = 1.05
    inimigo.tamanho = 26
    inimigo.cor = '#20bfff'
    inimigo.pontos = 35
    inimigo.intervaloTiro = Math.max(720, 1300 - dificuldade * 35)
  }

  if (tipo === 'rapido') {
    inimigo.hp = 2 + Math.floor(dificuldadeVida / 9)
    inimigo.maxHp = inimigo.hp
    inimigo.velocidade = 2.1 + dificuldade * 0.05
    inimigo.tamanho = 18
    inimigo.cor = '#ffe74a'
    inimigo.pontos = 18
  }

  if (tipo === 'explosivo') {
    inimigo.hp = 5 + Math.floor(dificuldadeVida / 7)
    inimigo.maxHp = inimigo.hp
    inimigo.velocidade = 1.25 + dificuldade * 0.035
    inimigo.tamanho = 28
    inimigo.cor = '#ff2bd6'
    inimigo.pontos = 32
    inimigo.armadoEm = 0
    inimigo.raioExplosao = 126
  }

  if (tipo === 'sniper') {
    inimigo.hp = 7 + Math.floor(dificuldadeVida / 5)
    inimigo.maxHp = inimigo.hp
    inimigo.velocidade = 0.82
    inimigo.tamanho = 24
    inimigo.cor = '#ff3f3f'
    inimigo.pontos = 46
    inimigo.intervaloTiro = Math.max(1600, 2600 - dificuldade * 28)
  }

  if (tipo === 'regenerador') {
    inimigo.hp = 8 + Math.floor(dificuldadeVida / 4)
    inimigo.maxHp = inimigo.hp
    inimigo.velocidade = 0.98
    inimigo.tamanho = 30
    inimigo.cor = '#39ff88'
    inimigo.pontos = 42
    inimigo.regeneracao = 0.018 + Math.min(0.035, wave * 0.00045)
  }

  if (tipo === 'nodoProtecao') {
    inimigo.hp = 10 + Math.floor(dificuldadeVida / 4)
    inimigo.maxHp = inimigo.hp
    inimigo.velocidade = 0.42
    inimigo.tamanho = 34
    inimigo.cor = '#7df9ff'
    inimigo.pontos = 55
    inimigo.raioProtecao = 190
  }

  if (tipo === 'carrier') {
    inimigo.hp = 12 + Math.floor(dificuldadeVida / 3)
    inimigo.maxHp = inimigo.hp
    inimigo.velocidade = 0.72
    inimigo.tamanho = 42
    inimigo.cor = '#ff9f1c'
    inimigo.pontos = 70
    inimigo.filhosAoMorrer = 5 + Math.min(10, Math.floor(wave / 8))
  }

  if (tipo === 'punitivo') {
    inimigo.hp = Infinity
    inimigo.maxHp = Infinity
    inimigo.velocidade = 0.72
    inimigo.tamanho = 72
    inimigo.cor = '#8b0000'
    inimigo.pontos = 0
    inimigo.intervaloTiro = 2000
    inimigo.duracao = 30000
  }

  if (tipo === 'bossErro') {
    inimigo.hp = Math.min(150, 70 + Math.ceil(wave * 0.9))
    inimigo.maxHp = inimigo.hp
    inimigo.velocidade = 0.92 + dificuldade * 0.02
    inimigo.tamanho = 68
    inimigo.cor = '#ff005d'
    inimigo.pontos = 90
    inimigo.intervaloTiro = 1650
    inimigo.duracao = 34000
    inimigo.multiplicadorDano = 0.55
  }

  if (tipo === 'boss') {
    inimigo.hp = 64
    inimigo.maxHp = 64
    inimigo.velocidade = 0.8
    inimigo.tamanho = 96
    inimigo.cor = '#cc00cc'
    inimigo.pontos = 0
    inimigo.intervaloTiro = 1500
    inimigo.vulneravel = false
  }

  return inimigo
}

function escolherSpawnInimigo(canvas, tipo) {
  if (tipo === 'boss') {
    return { x: canvas.width / 2, y: 135 }
  }

  if (tipo === 'bossErro') {
    return { x: canvas.width / 2, y: canvas.height - 135 }
  }

  return escolherSpawnNaBorda(canvas)
}

function aplicarProtecaoInimigo(inimigo, duracao) {
  inimigo.protegidoAte = performance.now() + duracao
  return inimigo
}

function escolherSpawnNaBorda(canvas) {
  const margem = 80
  const lado = Math.floor(Math.random() * 4)

  if (lado === 0) {
    return { x: Math.random() * canvas.width, y: -margem }
  }

  if (lado === 1) {
    return { x: canvas.width + margem, y: Math.random() * canvas.height }
  }

  if (lado === 2) {
    return { x: Math.random() * canvas.width, y: canvas.height + margem }
  }

  return { x: -margem, y: Math.random() * canvas.height }
}

function moverInimigos(inimigos, player) {
  const agora = performance.now()

  for (let i = 0; i < inimigos.length; i++) {
    const inimigo = inimigos[i]

    atualizarRegeneracaoInimigo(inimigo, agora)

    if (inimigo.tipo === 'boss') {
      inimigo.x += Math.sin(agora * 0.0014) * inimigo.velocidade
      inimigo.y += Math.sin(agora * 0.0009) * 0.28
      inimigo.x = Math.max(130, Math.min(window.innerWidth - 130, inimigo.x))
      inimigo.y = Math.max(95, Math.min(210, inimigo.y))
      continue
    }

    if (inimigo.tipo === 'bossErro') {
      moverBossErro(inimigo, player, agora)
      continue
    }

    if (inimigo.tipo === 'atirador') {
      moverAtirador(inimigo, player, agora)
      continue
    }

    if (inimigo.tipo === 'rapido') {
      moverRapido(inimigo, player, agora)
      continue
    }

    if (inimigo.tipo === 'sniper') {
      moverSniper(inimigo, player, agora)
      continue
    }

    if (inimigo.tipo === 'nodoProtecao') {
      moverNodoProtecao(inimigo, player, agora)
      protegerAliadosProximos(inimigos, inimigo, agora)
      continue
    }

    if (inimigo.modoGradiente) {
      moverPorGradiente(inimigo, player)
      continue
    }

    moverEmDirecaoAoPlayer(inimigo, player)
  }
}

function moverEmDirecaoAoPlayer(inimigo, player) {
  const dx = player.x - inimigo.x
  const dy = player.y - inimigo.y
  const distancia = Math.sqrt(dx * dx + dy * dy) || 1

  inimigo.angulo = Math.atan2(dy, dx)
  inimigo.x += (dx / distancia) * inimigo.velocidade
  inimigo.y += (dy / distancia) * inimigo.velocidade
}

function moverPorGradiente(inimigo, player) {
  // Usa o gradiente descendente da distancia ao quadrado para reduzir a distancia ate Zion.
  const gradX = 2 * (inimigo.x - player.x)
  const gradY = 2 * (inimigo.y - player.y)
  const norma = Math.sqrt(gradX * gradX + gradY * gradY) || 1

  inimigo.angulo = Math.atan2(-gradY, -gradX)
  inimigo.x += (-gradX / norma) * inimigo.velocidade
  inimigo.y += (-gradY / norma) * inimigo.velocidade
}

function moverAtirador(inimigo, player, agora) {
  const dx = player.x - inimigo.x
  const dy = player.y - inimigo.y
  const distancia = Math.sqrt(dx * dx + dy * dy) || 1
  const ideal = 285
  const direcao = distancia > ideal ? 1 : (distancia < ideal * 0.72 ? -1 : 0)
  const lateral = Math.sin(agora * 0.002 + inimigo.fase)

  inimigo.angulo = Math.atan2(dy, dx)
  inimigo.x += (dx / distancia) * inimigo.velocidade * direcao
  inimigo.y += (dy / distancia) * inimigo.velocidade * direcao
  inimigo.x += (-dy / distancia) * lateral * inimigo.velocidade * 0.9
  inimigo.y += (dx / distancia) * lateral * inimigo.velocidade * 0.9
}

function moverSniper(inimigo, player, agora) {
  const dx = player.x - inimigo.x
  const dy = player.y - inimigo.y
  const distancia = Math.sqrt(dx * dx + dy * dy) || 1
  const ideal = 460
  const direcao = distancia > ideal ? 0.75 : (distancia < ideal * 0.82 ? -1 : 0)
  const lateral = Math.sin(agora * 0.0013 + inimigo.fase) * 0.5

  inimigo.angulo = Math.atan2(dy, dx)
  inimigo.x += (dx / distancia) * inimigo.velocidade * direcao
  inimigo.y += (dy / distancia) * inimigo.velocidade * direcao
  inimigo.x += (-dy / distancia) * lateral
  inimigo.y += (dx / distancia) * lateral
}

function moverRapido(inimigo, player, agora) {
  const dx = player.x - inimigo.x
  const dy = player.y - inimigo.y
  const distancia = Math.sqrt(dx * dx + dy * dy) || 1
  const desvio = Math.sin(agora * 0.008 + inimigo.fase) * 0.38
  const dirX = dx / distancia
  const dirY = dy / distancia

  inimigo.angulo = Math.atan2(dy, dx)
  inimigo.x += (dirX - dirY * desvio) * inimigo.velocidade
  inimigo.y += (dirY + dirX * desvio) * inimigo.velocidade
}

function moverNodoProtecao(inimigo, player, agora) {
  const dx = player.x - inimigo.x
  const dy = player.y - inimigo.y
  const distancia = Math.sqrt(dx * dx + dy * dy) || 1
  const ideal = 360
  const direcao = distancia > ideal ? 0.55 : (distancia < ideal * 0.65 ? -0.65 : 0)

  inimigo.angulo = Math.atan2(dy, dx) + Math.sin(agora * 0.002 + inimigo.fase) * 0.4
  inimigo.x += (dx / distancia) * inimigo.velocidade * direcao
  inimigo.y += (dy / distancia) * inimigo.velocidade * direcao
}

function protegerAliadosProximos(inimigos, nodo, agora) {
  const raio = nodo.raioProtecao || 180

  for (let i = 0; i < inimigos.length; i++) {
    const aliado = inimigos[i]

    if (aliado === nodo || aliado.tipo === 'normal' || aliado.tipo === 'punitivo' || aliado.tipo === 'boss') {
      continue
    }

    const dx = aliado.x - nodo.x
    const dy = aliado.y - nodo.y

    if (dx * dx + dy * dy <= raio * raio) {
      aliado.protegidoAte = Math.max(aliado.protegidoAte || 0, agora + 180)
    }
  }
}

function atualizarRegeneracaoInimigo(inimigo, agora) {
  if (inimigo.tipo !== 'regenerador' || inimigo.hp >= inimigo.maxHp) {
    return
  }

  if (agora - inimigo.ultimoDanoEm < 1300) {
    return
  }

  inimigo.hp = Math.min(inimigo.maxHp, inimigo.hp + inimigo.regeneracao)
}

function moverBossErro(inimigo, player, agora) {
  const dx = player.x - inimigo.x
  const dy = player.y - inimigo.y
  const distancia = Math.sqrt(dx * dx + dy * dy) || 1
  const lateral = Math.sin(agora * 0.0016 + inimigo.fase) * 0.55

  inimigo.angulo = Math.atan2(dy, dx)
  inimigo.x += (dx / distancia) * inimigo.velocidade
  inimigo.y += (dy / distancia) * inimigo.velocidade
  inimigo.x += (-dy / distancia) * lateral
  inimigo.y += (dx / distancia) * lateral
}

function desenharInimigos(ctx, inimigos, agora, detalhe) {
  const nivel = detalhe === undefined ? 2 : detalhe
  const tempo = (agora || performance.now()) * 0.001

  for (let i = 0; i < inimigos.length; i++) {
    const inimigo = inimigos[i]
    const escala = inimigo.tamanho / 24
    const margem = inimigo.tamanho * 2

    if (
      inimigo.x < -margem ||
      inimigo.x > window.innerWidth + margem ||
      inimigo.y < -margem ||
      inimigo.y > window.innerHeight + margem
    ) {
      continue
    }

    const pulso = 0.5 + Math.sin(tempo * 4 + inimigo.fase) * 0.5
    const flutuacao = Math.sin(tempo * 3 + inimigo.fase) * Math.min(4, escala * 1.2)
    const recebeuDano = agora < inimigo.danoAte

    ctx.save()
    ctx.translate(inimigo.x, inimigo.y + flutuacao)
    ctx.rotate(inimigo.angulo)
    ctx.strokeStyle = recebeuDano ? '#ffffff' : inimigo.cor
    ctx.fillStyle = recebeuDano ? '#ffffff' : inimigo.cor
    ctx.lineWidth = Math.max(2, 2.4 * escala)
    ctx.lineCap = 'round'
    ctx.shadowBlur = nivel === 0
      ? (ehBossVisual(inimigo) ? 8 : 0)
      : (ehBossVisual(inimigo) ? 20 : 8) + pulso * 5
    ctx.shadowColor = inimigo.cor

    if (nivel > 0 || ehBossVisual(inimigo)) {
      desenharAuraInimigo(ctx, escala, inimigo, pulso, agora, nivel)
    }
    desenharBonecoInimigo(ctx, escala, inimigo, pulso)
    ctx.restore()

    if (ehBossVisual(inimigo)) {
      desenharBarraBoss(ctx, inimigo)
    }
  }
}

function desenharAuraInimigo(ctx, escala, inimigo, pulso, agora, detalhe) {
  const raio = (ehBossVisual(inimigo) ? 25 : 19) * escala + pulso * 4
  ctx.save()
  ctx.globalAlpha = inimigo.vulneravel ? 0.22 : 0.36
  ctx.lineWidth = Math.max(1, escala)
  if (detalhe > 0) {
    ctx.setLineDash([5 * escala, 7 * escala])
    ctx.lineDashOffset = agora * 0.015
  }
  ctx.beginPath()
  ctx.arc(0, 0, raio, 0, Math.PI * 2)
  ctx.stroke()

  if (inimigo.tipo === 'nodoProtecao' && detalhe > 0) {
    ctx.globalAlpha = 0.12
    ctx.strokeStyle = '#7df9ff'
    ctx.setLineDash([10, 14])
    ctx.lineDashOffset = agora * 0.01
    ctx.beginPath()
    ctx.arc(0, 0, inimigo.raioProtecao || 180, 0, Math.PI * 2)
    ctx.stroke()
  }

  if (agora < inimigo.protegidoAte) {
    ctx.globalAlpha = 0.72
    ctx.strokeStyle = '#7df9ff'
    ctx.lineWidth = Math.max(2, 2 * escala)
    if (detalhe > 0) {
      ctx.setLineDash([2 * escala, 5 * escala])
      ctx.lineDashOffset = -agora * 0.025
    }
    ctx.beginPath()
    ctx.arc(0, 0, raio + 9 * escala, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.restore()
}

function desenharBonecoInimigo(ctx, escala, inimigo, pulso) {
  const corpo = 14 * escala
  ctx.fillStyle = 'rgba(10, 0, 0, 0.86)'

  // Cabeca angular.
  ctx.beginPath()
  ctx.moveTo(8 * escala, 0)
  ctx.lineTo(3 * escala, -7 * escala)
  ctx.lineTo(-5 * escala, -6 * escala)
  ctx.lineTo(-9 * escala, 0)
  ctx.lineTo(-4 * escala, 7 * escala)
  ctx.lineTo(4 * escala, 7 * escala)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Nucleo e corpo do agente.
  ctx.beginPath()
  ctx.moveTo(-5 * escala, 8 * escala)
  ctx.lineTo(-11 * escala, corpo + 9 * escala)
  ctx.lineTo(0, corpo + 17 * escala)
  ctx.lineTo(11 * escala, corpo + 9 * escala)
  ctx.lineTo(5 * escala, 8 * escala)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = inimigo.cor
  ctx.globalAlpha = 0.62 + pulso * 0.38
  ctx.beginPath()
  ctx.arc(0, corpo + 2 * escala, (2.5 + pulso) * escala, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.beginPath()
  ctx.moveTo(-5 * escala, 11 * escala)
  ctx.lineTo(-17 * escala, 18 * escala)
  ctx.moveTo(5 * escala, 11 * escala)
  ctx.lineTo(17 * escala, 18 * escala)
  ctx.moveTo(-4 * escala, corpo + 15 * escala)
  ctx.lineTo(-11 * escala, corpo + 27 * escala)
  ctx.moveTo(4 * escala, corpo + 15 * escala)
  ctx.lineTo(11 * escala, corpo + 27 * escala)
  ctx.stroke()

  if (ehBossVisual(inimigo)) {
    ctx.globalAlpha = 0.48 + pulso * 0.25
    ctx.lineWidth = 1.2 * escala
    ctx.strokeRect(-17 * escala, -15 * escala, 34 * escala, 54 * escala)
    ctx.beginPath()
    ctx.moveTo(-25 * escala, -7 * escala)
    ctx.lineTo(-17 * escala, 0)
    ctx.moveTo(25 * escala, -7 * escala)
    ctx.lineTo(17 * escala, 0)
    ctx.stroke()
  }

  if (inimigo.tipo === 'atirador') {
    ctx.globalAlpha = 0.9
    ctx.beginPath()
    ctx.moveTo(9 * escala, 11 * escala)
    ctx.lineTo(30 * escala, 8 * escala)
    ctx.lineTo(34 * escala, 12 * escala)
    ctx.moveTo(19 * escala, 9 * escala)
    ctx.lineTo(16 * escala, 17 * escala)
    ctx.stroke()
  }

  if (inimigo.tipo === 'rapido') {
    ctx.globalAlpha = 0.68
    ctx.beginPath()
    ctx.moveTo(-18 * escala, 3 * escala)
    ctx.lineTo(-31 * escala, -4 * escala)
    ctx.moveTo(-18 * escala, 15 * escala)
    ctx.lineTo(-33 * escala, 21 * escala)
    ctx.stroke()
  }

  if (inimigo.tipo === 'explosivo') {
    ctx.globalAlpha = 0.58 + pulso * 0.35
    ctx.beginPath()
    ctx.arc(0, corpo + 2 * escala, (9 + pulso * 5) * escala, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-10 * escala, corpo - 8 * escala)
    ctx.lineTo(10 * escala, corpo + 12 * escala)
    ctx.moveTo(10 * escala, corpo - 8 * escala)
    ctx.lineTo(-10 * escala, corpo + 12 * escala)
    ctx.stroke()
  }

  if (inimigo.tipo === 'sniper') {
    ctx.globalAlpha = 0.92
    ctx.beginPath()
    ctx.moveTo(9 * escala, 7 * escala)
    ctx.lineTo(42 * escala, 3 * escala)
    ctx.moveTo(24 * escala, 5 * escala)
    ctx.lineTo(29 * escala, -6 * escala)
    ctx.moveTo(18 * escala, 5 * escala)
    ctx.lineTo(15 * escala, 15 * escala)
    ctx.stroke()
    ctx.globalAlpha = 0.18 + pulso * 0.18
    ctx.beginPath()
    ctx.moveTo(38 * escala, 3 * escala)
    ctx.lineTo(150 * escala, 3 * escala)
    ctx.stroke()
  }

  if (inimigo.tipo === 'regenerador') {
    ctx.globalAlpha = 0.68 + pulso * 0.25
    ctx.beginPath()
    ctx.arc(0, corpo + 2 * escala, (12 + pulso * 3) * escala, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-8 * escala, corpo + 2 * escala)
    ctx.lineTo(8 * escala, corpo + 2 * escala)
    ctx.moveTo(0, corpo - 6 * escala)
    ctx.lineTo(0, corpo + 10 * escala)
    ctx.stroke()
  }

  if (inimigo.tipo === 'nodoProtecao') {
    ctx.globalAlpha = 0.72 + pulso * 0.2
    ctx.strokeRect(-14 * escala, -10 * escala, 28 * escala, 28 * escala)
    ctx.beginPath()
    ctx.moveTo(-23 * escala, -1 * escala)
    ctx.lineTo(-14 * escala, 4 * escala)
    ctx.moveTo(23 * escala, -1 * escala)
    ctx.lineTo(14 * escala, 4 * escala)
    ctx.moveTo(0, -22 * escala)
    ctx.lineTo(0, -10 * escala)
    ctx.moveTo(0, 30 * escala)
    ctx.lineTo(0, 18 * escala)
    ctx.stroke()
  }

  if (inimigo.tipo === 'carrier') {
    ctx.globalAlpha = 0.74
    ctx.strokeRect(-20 * escala, -11 * escala, 40 * escala, 52 * escala)
    ctx.beginPath()
    ctx.moveTo(-14 * escala, 7 * escala)
    ctx.lineTo(14 * escala, 7 * escala)
    ctx.moveTo(-14 * escala, 21 * escala)
    ctx.lineTo(14 * escala, 21 * escala)
    ctx.moveTo(-6 * escala, -4 * escala)
    ctx.lineTo(-6 * escala, 35 * escala)
    ctx.moveTo(6 * escala, -4 * escala)
    ctx.lineTo(6 * escala, 35 * escala)
    ctx.stroke()
  }

  if (inimigo.tipo === 'punitivo') {
    ctx.globalAlpha = 0.72
    ctx.beginPath()
    ctx.moveTo(-16 * escala, -13 * escala)
    ctx.lineTo(16 * escala, 38 * escala)
    ctx.moveTo(16 * escala, -13 * escala)
    ctx.lineTo(-16 * escala, 38 * escala)
    ctx.stroke()
  }
}

function desenharBarraBoss(ctx, boss) {
  const largura = 240
  const x = boss.x - largura / 2
  const y = boss.y - boss.tamanho * 0.82
  const percentual = Math.max(0, boss.hp / boss.maxHp)
  const bossFinal = boss.tipo === 'boss'
  const nome = bossFinal
    ? (boss.vulneravel ? 'AGENTE ARQUITETO' : 'ARQUITETO BLOQUEADO')
    : 'BOSS DA RESPOSTA ERRADA'

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.strokeStyle = boss.cor
  ctx.lineWidth = 2
  ctx.fillRect(x, y, largura, 14)
  ctx.strokeRect(x, y, largura, 14)
  ctx.fillStyle = bossFinal && !boss.vulneravel ? '#555555' : boss.cor
  ctx.fillRect(x + 2, y + 2, (largura - 4) * percentual, 10)
  ctx.fillStyle = '#f6c3ff'
  ctx.font = '13px Courier New'
  ctx.textAlign = 'center'
  ctx.fillText(nome, boss.x, y - 8)
  ctx.restore()
}

function ehBossVisual(inimigo) {
  return inimigo.tipo === 'boss' || inimigo.tipo === 'bossErro'
}

function calcularDanoRecebido(inimigo, dano) {
  return dano * (inimigo.multiplicadorDano || 1)
}

function verificarColisaoInimigos(inimigos, balas) {
  const resultado = {
    acertos: 0,
    mortos: [],
    impactos: [],
    explosoes: []
  }

  for (let b = balas.length - 1; b >= 0; b--) {
    const bala = balas[b]

    for (let i = inimigos.length - 1; i >= 0; i--) {
      const inimigo = inimigos[i]
      const raio = inimigo.tamanho * 0.75 + bala.raio
      const dx = bala.x - inimigo.x

      if (dx < -raio || dx > raio) {
        continue
      }

      const dy = bala.y - inimigo.y

      if (dy < -raio || dy > raio || dx * dx + dy * dy > raio * raio) {
        continue
      }

      resultado.acertos++
      balas.splice(b, 1)

      if (inimigo.protegidoAte && performance.now() < inimigo.protegidoAte) {
        resultado.impactos.push({
          x: bala.x,
          y: bala.y,
          cor: '#7df9ff',
          bloqueado: true
        })
        break
      }

      if (inimigo.tipo === 'punitivo') {
        resultado.impactos.push({
          x: bala.x,
          y: bala.y,
          cor: inimigo.cor,
          bloqueado: true
        })
        break
      }

      if (inimigo.tipo === 'boss' && !inimigo.vulneravel) {
        resultado.impactos.push({
          x: bala.x,
          y: bala.y,
          cor: inimigo.cor,
          bloqueado: true
        })
        break
      }

      inimigo.hp -= calcularDanoRecebido(inimigo, bala.dano)
      inimigo.ultimoDanoEm = performance.now()
      inimigo.danoAte = inimigo.ultimoDanoEm + 110
      resultado.impactos.push({
        x: bala.x,
        y: bala.y,
        cor: inimigo.cor,
        bloqueado: false
      })

      if (inimigo.hp <= 0) {
        resultado.mortos.push({
          tipo: inimigo.tipo,
          x: inimigo.x,
          y: inimigo.y,
          cor: inimigo.cor,
          pontos: inimigo.pontos,
          raioExplosao: inimigo.raioExplosao || 0,
          filhosAoMorrer: inimigo.filhosAoMorrer || 0,
          wave: inimigo.wave
        })
        inimigos.splice(i, 1)
      }

      if (bala.explosiva) {
        aplicarExplosaoBala(inimigos, bala, inimigo, resultado)
      }

      break
    }
  }

  return resultado
}

function aplicarExplosaoBala(inimigos, bala, alvoPrincipal, resultado) {
  const raioExplosao = bala.raioExplosao || 110
  const danoExplosao = bala.danoExplosao || bala.dano

  resultado.explosoes.push({
    x: bala.x,
    y: bala.y,
    cor: bala.cor,
    tamanho: raioExplosao
  })

  for (let i = inimigos.length - 1; i >= 0; i--) {
    const inimigo = inimigos[i]

    if (
      inimigo === alvoPrincipal ||
      inimigo.tipo === 'punitivo' ||
      (inimigo.tipo === 'boss' && !inimigo.vulneravel) ||
      (inimigo.protegidoAte && performance.now() < inimigo.protegidoAte)
    ) {
      continue
    }

    const dx = inimigo.x - bala.x
    const dy = inimigo.y - bala.y

    if (dx * dx + dy * dy > raioExplosao * raioExplosao) {
      continue
    }

    inimigo.hp -= calcularDanoRecebido(inimigo, danoExplosao)
    inimigo.ultimoDanoEm = performance.now()
    inimigo.danoAte = inimigo.ultimoDanoEm + 130
    resultado.impactos.push({
      x: inimigo.x,
      y: inimigo.y,
      cor: bala.cor,
      bloqueado: false
    })

    if (inimigo.hp <= 0) {
      resultado.mortos.push({
        tipo: inimigo.tipo,
        x: inimigo.x,
        y: inimigo.y,
        cor: inimigo.cor,
        pontos: inimigo.pontos,
        raioExplosao: inimigo.raioExplosao || 0,
        filhosAoMorrer: inimigo.filhosAoMorrer || 0,
        wave: inimigo.wave
      })
      inimigos.splice(i, 1)
    }
  }
}

function verificarColisaoPlayerInimigos(inimigos, player, agora) {
  for (let i = 0; i < inimigos.length; i++) {
    const inimigo = inimigos[i]

    if (inimigo.tipo === 'explosivo') {
      continue
    }

    const dx = player.x - inimigo.x
    const dy = player.y - inimigo.y
    const raio = player.tamanho + inimigo.tamanho * 0.62

    if (dx * dx + dy * dy < raio * raio) {
      const dano = ehBossVisual(inimigo) || inimigo.tipo === 'punitivo'
        ? 24
        : (inimigo.tipo === 'rapido' ? 14 : 12)
      return receberDanoPlayer(player, dano, agora)
    }
  }

  return false
}

function verificarExplosoesInimigos(inimigos, player, agora) {
  const explosoes = []

  for (let i = inimigos.length - 1; i >= 0; i--) {
    const inimigo = inimigos[i]

    if (inimigo.tipo !== 'explosivo') {
      continue
    }

    const dx = player.x - inimigo.x
    const dy = player.y - inimigo.y
    const distanciaQuadrada = dx * dx + dy * dy
    const raioArmar = 112

    if (distanciaQuadrada < raioArmar * raioArmar && !inimigo.armadoEm) {
      inimigo.armadoEm = agora
      inimigo.cor = '#ff8aff'
    }

    if (!inimigo.armadoEm) {
      continue
    }

    const raioDetonar = 58
    const detonouPorContato = distanciaQuadrada < raioDetonar * raioDetonar
    const detonouPorTempo = agora - inimigo.armadoEm > 850

    if (!detonouPorContato && !detonouPorTempo) {
      continue
    }

    const raioExplosao = inimigo.raioExplosao || 126
    const acertouPlayer = distanciaQuadrada < raioExplosao * raioExplosao && receberDanoPlayer(player, 28, agora)

    explosoes.push({
      x: inimigo.x,
      y: inimigo.y,
      cor: inimigo.cor,
      tamanho: raioExplosao,
      acertouPlayer: acertouPlayer
    })
    inimigos.splice(i, 1)
  }

  return explosoes
}

function gerarDisparosInimigos(inimigos, agora, limite, player) {
  const balasCriadas = []
  const maximo = limite === undefined ? Infinity : Math.max(0, limite)

  for (let i = 0; i < inimigos.length; i++) {
    const inimigo = inimigos[i]

    if (!inimigo.intervaloTiro || agora - inimigo.ultimoTiro < inimigo.intervaloTiro) {
      continue
    }

    inimigo.ultimoTiro = agora
    const velocidade = inimigo.tipo === 'boss' ? 5.1 : (inimigo.tipo === 'bossErro' ? 4.8 : 4.3)
    const dano = inimigo.tipo === 'boss'
      ? 22
      : (inimigo.tipo === 'bossErro' ? 18 : 12)

    if (inimigo.tipo === 'atirador') {
      const anguloBase = player
        ? Math.atan2(player.y - inimigo.y, player.x - inimigo.x)
        : inimigo.angulo

      for (let s = -1; s <= 1; s++) {
        if (balasCriadas.length >= maximo) {
          return balasCriadas
        }
        balasCriadas.push(criarBalaInimiga(inimigo.x, inimigo.y, anguloBase + s * 0.16, velocidade, dano, inimigo.cor))
      }
      continue
    }

    if (inimigo.tipo === 'bossErro') {
      const anguloBase = player
        ? Math.atan2(player.y - inimigo.y, player.x - inimigo.x)
        : inimigo.angulo

      for (let s = -2; s <= 2; s++) {
        if (balasCriadas.length >= maximo) {
          return balasCriadas
        }
        balasCriadas.push(criarBalaInimiga(inimigo.x, inimigo.y, anguloBase + s * 0.22, velocidade, dano, inimigo.cor))
      }
      continue
    }

    if (inimigo.tipo === 'sniper') {
      const anguloBase = player
        ? Math.atan2(player.y - inimigo.y, player.x - inimigo.x)
        : inimigo.angulo

      if (balasCriadas.length >= maximo) {
        return balasCriadas
      }

      balasCriadas.push(criarBalaInimiga(inimigo.x, inimigo.y, anguloBase, 7.2, 28, inimigo.cor))
      continue
    }

    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      if (balasCriadas.length >= maximo) {
        return balasCriadas
      }
      balasCriadas.push(criarBalaInimiga(inimigo.x, inimigo.y, a, velocidade, dano, inimigo.cor))
    }
  }

  return balasCriadas
}

function removerInimigosExpirados(inimigos, agora) {
  const removidos = []

  for (let i = inimigos.length - 1; i >= 0; i--) {
    const inimigo = inimigos[i]

    if (inimigo.duracao > 0 && agora - inimigo.criadoEm >= inimigo.duracao) {
      removidos.push(inimigo)
      inimigos.splice(i, 1)
    }
  }

  return removidos
}

function spawnWave(canvas, wave) {
  const inimigos = []

  if (wave === 1) {
    for (let i = 0; i < 6; i++) {
      inimigos.push(criarInimigo(canvas, 'normal', wave))
    }
  }

  if (wave === 2) {
    for (let i = 0; i < 6; i++) {
      inimigos.push(criarInimigo(canvas, 'normal', wave))
    }

    for (let i = 0; i < 2; i++) {
      inimigos.push(criarInimigo(canvas, 'rapido', wave))
    }
  }

  if (wave === 3) {
    for (let i = 0; i < 8; i++) {
      inimigos.push(criarInimigo(canvas, 'gradiente', wave))
    }

    for (let i = 0; i < 2; i++) {
      inimigos.push(criarInimigo(canvas, 'atirador', wave))
    }
  }

  if (wave === 4) {
    for (let i = 0; i < 7; i++) {
      inimigos.push(criarInimigo(canvas, 'normal', wave))
    }

    for (let i = 0; i < 3; i++) {
      inimigos.push(criarInimigo(canvas, 'laranja', wave))
    }

    for (let i = 0; i < 2; i++) {
      inimigos.push(criarInimigo(canvas, 'explosivo', wave))
    }
  }

  if (wave === 5) {
    for (let i = 0; i < 6; i++) {
      inimigos.push(criarInimigo(canvas, 'gradiente', wave))
    }

    for (let i = 0; i < 4; i++) {
      inimigos.push(criarInimigo(canvas, 'laranja', wave))
    }

    for (let i = 0; i < 2; i++) {
      inimigos.push(criarInimigo(canvas, 'rapido', wave))
    }

    for (let i = 0; i < 2; i++) {
      inimigos.push(criarInimigo(canvas, 'atirador', wave))
    }
  }

  if (wave === 6) {
    for (let i = 0; i < 6; i++) {
      inimigos.push(criarInimigo(canvas, 'normal', wave))
    }

    for (let i = 0; i < 8; i++) {
      inimigos.push(criarInimigo(canvas, 'gradiente', wave))
    }

    for (let i = 0; i < 3; i++) {
      inimigos.push(criarInimigo(canvas, 'explosivo', wave))
    }
  }

  if (wave === 7) {
    for (let i = 0; i < 7; i++) {
      inimigos.push(criarInimigo(canvas, 'gradiente', wave))
    }

    for (let i = 0; i < 4; i++) {
      inimigos.push(criarInimigo(canvas, 'laranja', wave))
    }

    for (let i = 0; i < 3; i++) {
      inimigos.push(criarInimigo(canvas, 'rapido', wave))
    }

    for (let i = 0; i < 3; i++) {
      inimigos.push(criarInimigo(canvas, 'atirador', wave))
    }

    for (let i = 0; i < 2; i++) {
      inimigos.push(criarInimigo(canvas, 'explosivo', wave))
    }
  }

  if (wave >= 8 && wave < 100) {
    const plano = criarPlanoWaveDinamica(wave)
    const tipos = Object.keys(plano)

    for (let t = 0; t < tipos.length; t++) {
      adicionarInimigos(inimigos, canvas, tipos[t], wave, plano[tipos[t]])
    }
  }

  if (wave >= 100) {
    inimigos.push(criarInimigo(canvas, 'boss', wave))
  }

  return inimigos
}

function criarPlanoWaveDinamica(wave) {
  const escala = Math.min(10, Math.floor(wave / 10))
  const ciclo = wave % 6
  const hordaVermelha = Math.floor(wave / 5)

  return {
    normal: 5 + escala + hordaVermelha + (ciclo === 0 ? 4 : 0),
    laranja: 2 + Math.floor(escala / 3) + (ciclo === 1 ? 2 : 0),
    gradiente: 3 + Math.floor(escala / 2) + (ciclo === 2 ? 2 : 0),
    rapido: 1 + Math.floor(escala / 4) + (ciclo === 3 ? 2 : 0),
    atirador: 1 + Math.floor(escala / 5) + (ciclo === 4 ? 2 : 0),
    explosivo: (wave < 12 ? 0 : 1) + (ciclo === 5 ? 1 : 0),
    sniper: wave < 15 ? 0 : 1 + (ciclo === 2 ? 1 : 0),
    regenerador: wave < 20 ? 0 : 1 + (ciclo === 3 ? 1 : 0),
    nodoProtecao: wave < 25 ? 0 : (ciclo === 4 || wave % 10 === 0 ? 1 : 0),
    carrier: wave < 30 ? 0 : (ciclo === 5 || wave % 15 === 0 ? 1 : 0)
  }
}

function adicionarInimigos(inimigos, canvas, tipo, wave, quantidade) {
  for (let i = 0; i < quantidade; i++) {
    const inimigo = criarInimigo(canvas, tipo, wave)

    if (deveProtegerInimigo(tipo, wave, i)) {
      aplicarProtecaoInimigo(inimigo, 5000 + ((wave + i) % 6) * 1000)
    }

    inimigos.push(inimigo)
  }
}

function deveProtegerInimigo(tipo, wave, indice) {
  if (tipo === 'normal' || tipo === 'boss' || wave < 10) {
    return false
  }

  return (wave + indice) % 5 === 0
}

function criarFilhosCarrier(x, y, wave, quantidade) {
  const filhos = []
  const total = Math.max(0, quantidade || 0)

  for (let i = 0; i < total; i++) {
    const filho = criarInimigo({ width: window.innerWidth, height: window.innerHeight }, 'normal', wave)
    const angulo = (Math.PI * 2 * i) / Math.max(1, total)
    const distancia = 28 + (i % 3) * 18

    filho.x = x + Math.cos(angulo) * distancia
    filho.y = y + Math.sin(angulo) * distancia
    filho.angulo = angulo
    filhos.push(filho)
  }

  return filhos
}

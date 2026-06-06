function criarInimigo(canvas, tipo, wave) {
  const spawn = tipo === 'boss' ? { x: canvas.width / 2, y: 135 } : escolherSpawnNaBorda(canvas)
  const agora = performance.now()
  const inimigo = {
    tipo: tipo || 'normal',
    x: spawn.x,
    y: spawn.y,
    wave: wave,
    hp: 1,
    maxHp: 1,
    velocidade: 1.2 + wave * 0.1,
    tamanho: 24,
    cor: '#ff2020',
    pontos: 10,
    modoGradiente: false,
    criadoEm: agora,
    ultimoTiro: agora + Math.random() * 900,
    intervaloTiro: 0,
    duracao: 0,
    vulneravel: true
  }

  if (tipo === 'laranja') {
    inimigo.hp = 2
    inimigo.maxHp = 2
    inimigo.velocidade = 1.0
    inimigo.cor = '#ff6020'
    inimigo.pontos = 25
  }

  if (tipo === 'gradiente') {
    inimigo.modoGradiente = true
    inimigo.velocidade = 1.35
    inimigo.cor = '#ff2020'
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

  if (tipo === 'boss') {
    inimigo.hp = 20
    inimigo.maxHp = 20
    inimigo.velocidade = 0.8
    inimigo.tamanho = 96
    inimigo.cor = '#cc00cc'
    inimigo.pontos = 0
    inimigo.intervaloTiro = 1500
    inimigo.vulneravel = false
  }

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

    if (inimigo.tipo === 'boss') {
      inimigo.x += Math.sin(agora * 0.0014) * inimigo.velocidade
      inimigo.y += Math.sin(agora * 0.0009) * 0.28
      inimigo.x = Math.max(130, Math.min(window.innerWidth - 130, inimigo.x))
      inimigo.y = Math.max(95, Math.min(210, inimigo.y))
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
  const distancia = Math.hypot(dx, dy) || 1

  inimigo.x += (dx / distancia) * inimigo.velocidade
  inimigo.y += (dy / distancia) * inimigo.velocidade
}

function moverPorGradiente(inimigo, player) {
  // Usa o gradiente descendente da distancia ao quadrado para reduzir a distancia ate Zion.
  const gradX = 2 * (inimigo.x - player.x)
  const gradY = 2 * (inimigo.y - player.y)
  const norma = Math.hypot(gradX, gradY) || 1

  inimigo.x += (-gradX / norma) * inimigo.velocidade
  inimigo.y += (-gradY / norma) * inimigo.velocidade
}

function desenharInimigos(ctx, inimigos) {
  for (let i = 0; i < inimigos.length; i++) {
    const inimigo = inimigos[i]
    const escala = inimigo.tamanho / 24
    const angulo = Math.atan2(window.innerHeight / 2 - inimigo.y, window.innerWidth / 2 - inimigo.x)

    ctx.save()
    ctx.translate(inimigo.x, inimigo.y)
    ctx.rotate(angulo)
    ctx.strokeStyle = inimigo.cor
    ctx.fillStyle = inimigo.cor
    ctx.lineWidth = Math.max(2, 2.4 * escala)
    ctx.lineCap = 'round'
    ctx.shadowBlur = inimigo.tipo === 'boss' ? 24 : 14
    ctx.shadowColor = inimigo.cor

    desenharBonecoInimigo(ctx, escala, inimigo)
    ctx.restore()

    if (inimigo.tipo === 'boss') {
      desenharBarraBoss(ctx, inimigo)
    }
  }
}

function desenharBonecoInimigo(ctx, escala, inimigo) {
  const cabeca = 7 * escala
  const corpo = 26 * escala

  ctx.beginPath()
  ctx.arc(0, -10 * escala, cabeca, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(0, -3 * escala)
  ctx.lineTo(0, corpo)
  ctx.moveTo(-12 * escala, 8 * escala)
  ctx.lineTo(12 * escala, 8 * escala)
  ctx.moveTo(0, corpo)
  ctx.lineTo(-11 * escala, 43 * escala)
  ctx.moveTo(0, corpo)
  ctx.lineTo(11 * escala, 43 * escala)
  ctx.stroke()

  if (inimigo.tipo === 'boss') {
    ctx.strokeRect(-30 * escala, -32 * escala, 60 * escala, 82 * escala)
  }

  if (inimigo.tipo === 'punitivo') {
    ctx.beginPath()
    ctx.moveTo(-24 * escala, -28 * escala)
    ctx.lineTo(24 * escala, 48 * escala)
    ctx.moveTo(24 * escala, -28 * escala)
    ctx.lineTo(-24 * escala, 48 * escala)
    ctx.stroke()
  }
}

function desenharBarraBoss(ctx, boss) {
  const largura = 240
  const x = boss.x - largura / 2
  const y = boss.y - boss.tamanho * 0.82
  const percentual = Math.max(0, boss.hp / boss.maxHp)

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.strokeStyle = '#cc00cc'
  ctx.lineWidth = 2
  ctx.fillRect(x, y, largura, 14)
  ctx.strokeRect(x, y, largura, 14)
  ctx.fillStyle = boss.vulneravel ? '#cc00cc' : '#555555'
  ctx.fillRect(x + 2, y + 2, (largura - 4) * percentual, 10)
  ctx.fillStyle = '#f6c3ff'
  ctx.font = '13px Courier New'
  ctx.textAlign = 'center'
  ctx.fillText(boss.vulneravel ? 'AGENTE ARQUITETO' : 'ARQUITETO BLOQUEADO', boss.x, y - 8)
  ctx.restore()
}

function verificarColisaoInimigos(inimigos, balas) {
  const resultado = {
    acertos: 0,
    mortos: []
  }

  for (let b = balas.length - 1; b >= 0; b--) {
    const bala = balas[b]

    for (let i = inimigos.length - 1; i >= 0; i--) {
      const inimigo = inimigos[i]
      const distancia = Math.hypot(bala.x - inimigo.x, bala.y - inimigo.y)

      if (distancia > inimigo.tamanho * 0.75 + bala.raio) {
        continue
      }

      resultado.acertos++
      balas.splice(b, 1)

      if (inimigo.tipo === 'punitivo') {
        break
      }

      if (inimigo.tipo === 'boss' && !inimigo.vulneravel) {
        break
      }

      inimigo.hp -= bala.dano

      if (inimigo.hp <= 0) {
        resultado.mortos.push({
          tipo: inimigo.tipo,
          x: inimigo.x,
          y: inimigo.y,
          cor: inimigo.cor,
          pontos: inimigo.pontos
        })
        inimigos.splice(i, 1)
      }

      break
    }
  }

  return resultado
}

function verificarColisaoPlayerInimigos(inimigos, player, agora) {
  for (let i = 0; i < inimigos.length; i++) {
    const inimigo = inimigos[i]
    const distancia = Math.hypot(player.x - inimigo.x, player.y - inimigo.y)

    if (distancia < player.tamanho + inimigo.tamanho * 0.62) {
      const dano = inimigo.tipo === 'boss' || inimigo.tipo === 'punitivo' ? 2 : 1
      return receberDanoPlayer(player, dano, agora)
    }
  }

  return false
}

function gerarDisparosInimigos(inimigos, agora) {
  const balasCriadas = []

  for (let i = 0; i < inimigos.length; i++) {
    const inimigo = inimigos[i]

    if (!inimigo.intervaloTiro || agora - inimigo.ultimoTiro < inimigo.intervaloTiro) {
      continue
    }

    inimigo.ultimoTiro = agora
    const velocidade = inimigo.tipo === 'boss' ? 5.1 : 4.3
    const dano = inimigo.tipo === 'boss' ? 2 : 1

    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
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
      inimigos.push(criarInimigo(canvas, 'laranja', wave))
    }
  }

  if (wave === 3) {
    for (let i = 0; i < 10; i++) {
      inimigos.push(criarInimigo(canvas, 'gradiente', wave))
    }
  }

  if (wave === 4) {
    inimigos.push(criarInimigo(canvas, 'boss', wave))
  }

  return inimigos
}

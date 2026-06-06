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
    vulneravel: true,
    angulo: 0,
    fase: Math.random() * Math.PI * 2,
    danoAte: 0
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
      ? (inimigo.tipo === 'boss' ? 8 : 0)
      : (inimigo.tipo === 'boss' ? 20 : 8) + pulso * 5
    ctx.shadowColor = inimigo.cor

    if (nivel > 0 || inimigo.tipo === 'boss') {
      desenharAuraInimigo(ctx, escala, inimigo, pulso, agora, nivel)
    }
    desenharBonecoInimigo(ctx, escala, inimigo, pulso)
    ctx.restore()

    if (inimigo.tipo === 'boss') {
      desenharBarraBoss(ctx, inimigo)
    }
  }
}

function desenharAuraInimigo(ctx, escala, inimigo, pulso, agora, detalhe) {
  const raio = (inimigo.tipo === 'boss' ? 25 : 19) * escala + pulso * 4
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

  if (inimigo.tipo === 'boss') {
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
    mortos: [],
    impactos: []
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

      inimigo.hp -= bala.dano
      inimigo.danoAte = performance.now() + 110
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
    const dx = player.x - inimigo.x
    const dy = player.y - inimigo.y
    const raio = player.tamanho + inimigo.tamanho * 0.62

    if (dx * dx + dy * dy < raio * raio) {
      const dano = inimigo.tipo === 'boss' || inimigo.tipo === 'punitivo' ? 2 : 1
      return receberDanoPlayer(player, dano, agora)
    }
  }

  return false
}

function gerarDisparosInimigos(inimigos, agora, limite) {
  const balasCriadas = []
  const maximo = limite === undefined ? Infinity : Math.max(0, limite)

  for (let i = 0; i < inimigos.length; i++) {
    const inimigo = inimigos[i]

    if (!inimigo.intervaloTiro || agora - inimigo.ultimoTiro < inimigo.intervaloTiro) {
      continue
    }

    inimigo.ultimoTiro = agora
    const velocidade = inimigo.tipo === 'boss' ? 5.1 : 4.3
    const dano = inimigo.tipo === 'boss' ? 2 : 1

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

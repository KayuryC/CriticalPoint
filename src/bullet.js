function criarBala(player) {
  const distanciaCano = 35
  const vx = Math.cos(player.angulo) * 11
  const vy = Math.sin(player.angulo) * 11
  const x = player.x + Math.cos(player.angulo) * distanciaCano
  const y = player.y + Math.sin(player.angulo) * distanciaCano

  return {
    x: x,
    y: y,
    vx: vx,
    vy: vy,
    velocidade: Math.sqrt(vx * vx + vy * vy),
    dano: player.dano,
    cor: '#00ff41',
    raio: 4,
    distancia: 0,
    origem: 'player',
    criadoEm: performance.now()
  }
}

function criarBalaInimiga(x, y, angulo, velocidade, dano, cor) {
  const vx = Math.cos(angulo) * velocidade
  const vy = Math.sin(angulo) * velocidade

  return {
    x: x,
    y: y,
    vx: vx,
    vy: vy,
    velocidade: velocidade,
    dano: dano,
    cor: cor || '#ff2020',
    raio: 5,
    distancia: 0,
    origem: 'enemy',
    criadoEm: performance.now()
  }
}

function moverBalas(balas) {
  for (let i = 0; i < balas.length; i++) {
    const bala = balas[i]

    bala.x += bala.vx
    bala.y += bala.vy
    bala.distancia += bala.velocidade
  }
}

function desenharBalas(ctx, balas, detalhe) {
  if (balas.length === 0) {
    return
  }

  const nivel = detalhe === undefined ? 2 : detalhe
  const agora = performance.now()
  const grupos = Object.create(null)

  for (let i = 0; i < balas.length; i++) {
    const bala = balas[i]
    const chave = bala.cor + '|' + bala.origem

    if (!grupos[chave]) {
      grupos[chave] = {
        cor: bala.cor,
        origem: bala.origem,
        balas: []
      }
    }

    grupos[chave].balas.push(bala)
  }

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'

  const chaves = Object.keys(grupos)
  for (let g = 0; g < chaves.length; g++) {
    const grupo = grupos[chaves[g]]
    const lista = grupo.balas
    const jogador = grupo.origem === 'player'

    ctx.shadowColor = grupo.cor
    ctx.shadowBlur = nivel === 0 ? 0 : (jogador ? 12 : 8)
    ctx.globalAlpha = nivel === 0 ? 0.42 : 0.62
    ctx.strokeStyle = grupo.cor
    ctx.lineWidth = jogador ? 4 : 3
    ctx.beginPath()
    for (let i = 0; i < lista.length; i++) {
      const bala = lista[i]
      const cauda = nivel === 0 ? 1.7 : 2.5
      ctx.moveTo(bala.x - bala.vx * cauda, bala.y - bala.vy * cauda)
      ctx.lineTo(bala.x, bala.y)
    }
    ctx.stroke()

    ctx.globalAlpha = 1
    ctx.fillStyle = grupo.cor
    ctx.beginPath()
    for (let i = 0; i < lista.length; i++) {
      const bala = lista[i]
      const pulso = nivel === 0 ? 0.9 : 0.82 + Math.sin((agora - bala.criadoEm + i * 23) * 0.025) * 0.18
      ctx.moveTo(bala.x + bala.raio * pulso, bala.y)
      ctx.arc(bala.x, bala.y, bala.raio * pulso, 0, Math.PI * 2)
    }
    ctx.fill()

    if (nivel === 2 && balas.length < 100) {
      ctx.shadowBlur = 0
      ctx.strokeStyle = '#ffffff'
      ctx.globalAlpha = 0.45
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let i = 0; i < lista.length; i++) {
        const bala = lista[i]
        ctx.moveTo(bala.x + bala.raio * 1.65, bala.y)
        ctx.arc(bala.x, bala.y, bala.raio * 1.65, 0, Math.PI * 2)
      }
      ctx.stroke()
    }
  }

  ctx.restore()
}

function removerBalas(balas, canvas) {
  for (let i = balas.length - 1; i >= 0; i--) {
    const bala = balas[i]
    const saiuDaTela = bala.x < -60 || bala.x > canvas.width + 60 || bala.y < -60 || bala.y > canvas.height + 60
    const longeDemais = bala.distancia > 1600

    if (saiuDaTela || longeDemais) {
      balas.splice(i, 1)
    }
  }
}

function verificarColisaoBalasPlayer(balas, player, agora) {
  let acertou = false

  for (let i = balas.length - 1; i >= 0; i--) {
    const bala = balas[i]
    const dx = bala.x - player.x
    const dy = bala.y - player.y
    const raio = player.tamanho + bala.raio

    if (dx * dx + dy * dy < raio * raio) {
      if (receberDanoPlayer(player, bala.dano, agora)) {
        acertou = true
      }
      balas.splice(i, 1)
    }
  }

  return acertou
}

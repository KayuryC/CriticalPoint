function criarBala(player) {
  const distanciaCano = 35

  return {
    x: player.x + Math.cos(player.angulo) * distanciaCano,
    y: player.y + Math.sin(player.angulo) * distanciaCano,
    vx: Math.cos(player.angulo) * 11,
    vy: Math.sin(player.angulo) * 11,
    dano: player.dano,
    cor: '#00ff41',
    raio: 4,
    rastro: [],
    distancia: 0,
    origem: 'player'
  }
}

function criarBalaInimiga(x, y, angulo, velocidade, dano, cor) {
  return {
    x: x,
    y: y,
    vx: Math.cos(angulo) * velocidade,
    vy: Math.sin(angulo) * velocidade,
    dano: dano,
    cor: cor || '#ff2020',
    raio: 5,
    rastro: [],
    distancia: 0,
    origem: 'enemy'
  }
}

function moverBalas(balas) {
  for (let i = 0; i < balas.length; i++) {
    const bala = balas[i]

    bala.rastro.push({ x: bala.x, y: bala.y })
    if (bala.rastro.length > 8) {
      bala.rastro.shift()
    }

    bala.x += bala.vx
    bala.y += bala.vy
    bala.distancia += Math.hypot(bala.vx, bala.vy)
  }
}

function desenharBalas(ctx, balas) {
  for (let i = 0; i < balas.length; i++) {
    const bala = balas[i]

    ctx.save()
    ctx.lineCap = 'round'
    ctx.shadowBlur = bala.origem === 'player' ? 18 : 12
    ctx.shadowColor = bala.cor

    for (let r = 1; r < bala.rastro.length; r++) {
      const anterior = bala.rastro[r - 1]
      const atual = bala.rastro[r]
      const alpha = r / bala.rastro.length

      ctx.globalAlpha = alpha * 0.55
      ctx.strokeStyle = bala.cor
      ctx.lineWidth = bala.origem === 'player' ? 4 : 3
      ctx.beginPath()
      ctx.moveTo(anterior.x, anterior.y)
      ctx.lineTo(atual.x, atual.y)
      ctx.stroke()
    }

    ctx.globalAlpha = 1
    ctx.fillStyle = bala.cor
    ctx.beginPath()
    ctx.arc(bala.x, bala.y, bala.raio, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
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
    const distancia = Math.hypot(bala.x - player.x, bala.y - player.y)

    if (distancia < player.tamanho + bala.raio) {
      if (receberDanoPlayer(player, bala.dano, agora)) {
        acertou = true
      }
      balas.splice(i, 1)
    }
  }

  return acertou
}

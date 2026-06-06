function criarParticulas(x, y, cor, quantidade) {
  const particulas = []

  for (let i = 0; i < quantidade; i++) {
    const angulo = Math.random() * Math.PI * 2
    const velocidade = 1.2 + Math.random() * 4.8
    const vida = 28 + Math.random() * 34

    particulas.push({
      x: x,
      y: y,
      vx: Math.cos(angulo) * velocidade,
      vy: Math.sin(angulo) * velocidade,
      cor: cor || '#00ff41',
      vida: vida,
      vidaMaxima: vida,
      tamanho: 2 + Math.random() * 4,
      forma: Math.random() > 0.72 ? 'linha' : 'fragmento'
    })
  }

  return particulas
}

function atualizarParticulas(particulas) {
  for (let i = particulas.length - 1; i >= 0; i--) {
    const particula = particulas[i]

    particula.x += particula.vx
    particula.y += particula.vy
    particula.vx *= 0.94
    particula.vy *= 0.94
    particula.vy += 0.015
    particula.vida--

    if (particula.vida <= 0) {
      particulas.splice(i, 1)
    }
  }
}

function desenharParticulas(ctx, particulas, detalhe) {
  const nivel = detalhe === undefined ? 2 : detalhe
  const passo = nivel === 0 && particulas.length > 100 ? 2 : 1

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.shadowBlur = 0

  for (let i = 0; i < particulas.length; i += passo) {
    const particula = particulas[i]
    const alpha = Math.max(0, particula.vida / particula.vidaMaxima)

    ctx.globalAlpha = alpha
    ctx.fillStyle = particula.cor
    ctx.strokeStyle = particula.cor

    if (particula.forma === 'fragmento') {
      ctx.fillRect(
        particula.x - particula.tamanho / 2,
        particula.y - particula.tamanho / 2,
        particula.tamanho,
        particula.tamanho
      )
    } else {
      ctx.lineWidth = nivel === 0 ? 1 : 2
      ctx.beginPath()
      ctx.moveTo(particula.x - particula.vx * 1.4, particula.y - particula.vy * 1.4)
      ctx.lineTo(particula.x + particula.vx * 0.5, particula.y + particula.vy * 0.5)
      ctx.stroke()
    }
  }

  ctx.restore()
}

function removerParticulas(particulas) {
  for (let i = particulas.length - 1; i >= 0; i--) {
    if (particulas[i].vida <= 0) {
      particulas.splice(i, 1)
    }
  }
}

function criarOndaImpacto(x, y, cor, tamanho) {
  return {
    x: x,
    y: y,
    cor: cor || '#00ff41',
    raio: 4,
    raioMaximo: tamanho || 58,
    vida: 1
  }
}

function atualizarOndasImpacto(ondas) {
  for (let i = ondas.length - 1; i >= 0; i--) {
    const onda = ondas[i]
    onda.raio += Math.max(2.5, onda.raioMaximo * 0.07)
    onda.vida -= 0.075

    if (onda.vida <= 0 || onda.raio >= onda.raioMaximo) {
      ondas.splice(i, 1)
    }
  }
}

function desenharOndasImpacto(ctx, ondas, detalhe) {
  const nivel = detalhe === undefined ? 2 : detalhe

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  for (let i = 0; i < ondas.length; i++) {
    const onda = ondas[i]
    ctx.globalAlpha = Math.max(0, onda.vida)
    ctx.strokeStyle = onda.cor
    ctx.shadowBlur = nivel === 0 ? 0 : 10
    ctx.shadowColor = onda.cor
    ctx.lineWidth = 1 + onda.vida * 4
    ctx.beginPath()
    ctx.arc(onda.x, onda.y, onda.raio, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.restore()
}

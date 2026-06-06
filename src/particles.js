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
      rotacao: Math.random() * Math.PI,
      brilho: 8 + Math.random() * 18
    })
  }

  return particulas
}

function atualizarParticulas(particulas) {
  for (let i = 0; i < particulas.length; i++) {
    const particula = particulas[i]

    particula.x += particula.vx
    particula.y += particula.vy
    particula.vx *= 0.94
    particula.vy *= 0.94
    particula.vy += 0.015
    particula.rotacao += 0.08
    particula.vida--
  }
}

function desenharParticulas(ctx, particulas) {
  for (let i = 0; i < particulas.length; i++) {
    const particula = particulas[i]
    const alpha = Math.max(0, particula.vida / particula.vidaMaxima)

    ctx.save()
    ctx.translate(particula.x, particula.y)
    ctx.rotate(particula.rotacao)
    ctx.globalAlpha = alpha
    ctx.fillStyle = particula.cor
    ctx.strokeStyle = particula.cor
    ctx.shadowBlur = particula.brilho * alpha
    ctx.shadowColor = particula.cor

    if (Math.random() > 0.45) {
      ctx.fillRect(-particula.tamanho / 2, -particula.tamanho / 2, particula.tamanho, particula.tamanho)
    } else {
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-particula.tamanho, 0)
      ctx.lineTo(particula.tamanho * 1.6, 0)
      ctx.stroke()
    }

    ctx.restore()
  }
}

function removerParticulas(particulas) {
  for (let i = particulas.length - 1; i >= 0; i--) {
    if (particulas[i].vida <= 0) {
      particulas.splice(i, 1)
    }
  }
}

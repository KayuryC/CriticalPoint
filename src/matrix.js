const MATRIX_CHARS = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789ABCDEFZ@#'
const MATRIX_CONFIG = {
  larguraColuna: 20,
  tamanhoFonte: 16,
  colunas: 0,
  drops: [],
  velocidades: [],
  brilhos: []
}

function prepararMatrix(canvas) {
  const colunas = Math.ceil(canvas.width / MATRIX_CONFIG.larguraColuna)

  if (colunas === MATRIX_CONFIG.colunas && MATRIX_CONFIG.drops.length > 0) {
    return
  }

  MATRIX_CONFIG.colunas = colunas
  MATRIX_CONFIG.drops = []
  MATRIX_CONFIG.velocidades = []
  MATRIX_CONFIG.brilhos = []

  for (let i = 0; i < colunas; i++) {
    MATRIX_CONFIG.drops[i] = Math.random() * -canvas.height / MATRIX_CONFIG.tamanhoFonte
    MATRIX_CONFIG.velocidades[i] = 0.55 + Math.random() * 1.15
    MATRIX_CONFIG.brilhos[i] = 0.45 + Math.random() * 0.55
  }
}

// Desenha um frame da chuva Matrix; o loop principal controla o requestAnimationFrame.
function drawMatrix(ctx, canvas, velocidade, delta, detalhe) {
  prepararMatrix(canvas)

  const nivel = detalhe === undefined ? 2 : detalhe
  const fatorVelocidade = velocidade || 1
  const passo = ((delta || 16) / 16) * fatorVelocidade

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.font = MATRIX_CONFIG.tamanhoFonte + 'px Courier New'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.shadowColor = '#00ff41'
  ctx.shadowBlur = nivel === 0 ? 0 : 5

  for (let i = 0; i < MATRIX_CONFIG.drops.length; i++) {
    const x = i * MATRIX_CONFIG.larguraColuna
    const y = MATRIX_CONFIG.drops[i] * MATRIX_CONFIG.tamanhoFonte

    if (y > canvas.height + 40 && Math.random() > 0.965) {
      MATRIX_CONFIG.drops[i] = Math.random() * -24
    } else {
      MATRIX_CONFIG.drops[i] += passo * MATRIX_CONFIG.velocidades[i]
    }

    if (nivel === 0 && i % 2 !== 0) {
      continue
    }

    const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
    const brilho = MATRIX_CONFIG.brilhos[i]
    ctx.fillStyle = nivel === 0
      ? 'rgba(0, 255, 65, 0.16)'
      : 'rgba(0, 255, 65, ' + (0.12 + brilho * 0.2) + ')'
    ctx.fillText(char, x, y)

    if (nivel > 0 && Math.random() > 0.94) {
      ctx.fillStyle = 'rgba(215, 255, 229, 0.62)'
      ctx.fillText(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)], x, y - MATRIX_CONFIG.tamanhoFonte)
    }
  }

  ctx.restore()
}

function desenharArenaMatrix(ctx, canvas, agora, wave, player, detalhe) {
  const nivel = detalhe === undefined ? 2 : detalhe
  const tempo = agora * 0.001
  const centroX = player ? player.x : canvas.width / 2
  const centroY = player ? player.y : canvas.height / 2
  const gridBase = Math.max(46, Math.min(72, canvas.width / 18))
  const grid = nivel === 0 ? gridBase * 1.5 : gridBase
  const deslocamentoX = ((tempo * 11) + centroX * 0.04) % grid
  const deslocamentoY = ((tempo * 7) + centroY * 0.04) % grid
  const pulso = 0.5 + Math.sin(tempo * 2.2) * 0.5

  ctx.save()
  if (nivel === 0) {
    ctx.fillStyle = 'rgba(0, 8, 3, 0.32)'
  } else {
    const vinheta = ctx.createRadialGradient(
      centroX,
      centroY,
      20,
      centroX,
      centroY,
      Math.max(canvas.width, canvas.height) * 0.72
    )
    vinheta.addColorStop(0, 'rgba(0, 38, 15, 0.14)')
    vinheta.addColorStop(0.48, 'rgba(0, 12, 5, 0.2)')
    vinheta.addColorStop(1, 'rgba(0, 0, 0, 0.68)')
    ctx.fillStyle = vinheta
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.globalCompositeOperation = 'lighter'
  ctx.lineWidth = 1

  for (let x = -grid + deslocamentoX; x < canvas.width + grid; x += grid) {
    const distanciaCentro = Math.abs(x - canvas.width / 2) / Math.max(1, canvas.width / 2)
    ctx.strokeStyle = 'rgba(0, 255, 65, ' + (0.055 + (1 - distanciaCentro) * 0.04) + ')'
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }

  for (let y = -grid + deslocamentoY; y < canvas.height + grid; y += grid) {
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.07)'
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }

  const raioBase = Math.min(canvas.width, canvas.height) * 0.18
  const totalAneis = nivel === 0 ? 1 : 3
  for (let i = 0; i < totalAneis; i++) {
    const raio = raioBase + i * 78 + pulso * 12
    ctx.strokeStyle = 'rgba(0, 255, 65, ' + (0.11 - i * 0.022) + ')'
    ctx.lineWidth = i === 0 ? 2 : 1
    ctx.setLineDash([18 + i * 5, 12 + i * 3])
    ctx.lineDashOffset = tempo * (i % 2 === 0 ? 18 : -14)
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, raio, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.setLineDash([])
  const pontos = nivel === 0 ? 0 : Math.max(12, Math.floor(canvas.width / 90))
  for (let i = 0; i < pontos; i++) {
    const px = (i * 137.5 + tempo * (8 + i % 3)) % (canvas.width + 80) - 40
    const py = (i * 83.7 + Math.sin(tempo * 0.7 + i) * 34 + canvas.height) % canvas.height
    const alpha = 0.12 + ((i + wave) % 4) * 0.035
    ctx.fillStyle = 'rgba(83, 255, 139, ' + alpha + ')'
    ctx.fillRect(px, py, 2, 2)
    ctx.strokeStyle = 'rgba(0, 255, 65, ' + (alpha * 0.45) + ')'
    ctx.beginPath()
    ctx.moveTo(px - 10, py)
    ctx.lineTo(px + 10, py)
    ctx.stroke()
  }

  ctx.restore()
}

const MATRIX_CHARS = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789ABCDEFZ@#'
const MATRIX_CONFIG = {
  larguraColuna: 20,
  tamanhoFonte: 16,
  colunas: 0,
  drops: []
}

function prepararMatrix(canvas) {
  const colunas = Math.ceil(canvas.width / MATRIX_CONFIG.larguraColuna)

  if (colunas === MATRIX_CONFIG.colunas && MATRIX_CONFIG.drops.length > 0) {
    return
  }

  MATRIX_CONFIG.colunas = colunas
  MATRIX_CONFIG.drops = []

  for (let i = 0; i < colunas; i++) {
    MATRIX_CONFIG.drops[i] = Math.random() * -canvas.height / MATRIX_CONFIG.tamanhoFonte
  }
}

// Desenha um frame da chuva Matrix; o loop principal controla o requestAnimationFrame.
function drawMatrix(ctx, canvas, velocidade, delta) {
  prepararMatrix(canvas)

  const fatorVelocidade = velocidade || 1
  const passo = ((delta || 16) / 16) * fatorVelocidade

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.11)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.font = MATRIX_CONFIG.tamanhoFonte + 'px Courier New'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  for (let i = 0; i < MATRIX_CONFIG.drops.length; i++) {
    const x = i * MATRIX_CONFIG.larguraColuna
    const y = MATRIX_CONFIG.drops[i] * MATRIX_CONFIG.tamanhoFonte
    const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]

    ctx.shadowBlur = 12
    ctx.shadowColor = '#00ff41'
    ctx.fillStyle = '#00ff41'
    ctx.fillText(char, x, y)

    if (Math.random() > 0.84) {
      ctx.shadowBlur = 4
      ctx.fillStyle = 'rgba(183, 255, 208, 0.8)'
      ctx.fillText(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)], x, y - MATRIX_CONFIG.tamanhoFonte)
    }

    if (y > canvas.height + 40 && Math.random() > 0.965) {
      MATRIX_CONFIG.drops[i] = Math.random() * -24
    } else {
      MATRIX_CONFIG.drops[i] += passo
    }
  }

  ctx.restore()
}

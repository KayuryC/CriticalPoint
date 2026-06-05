//Função para criar o objeto player
function criarPlayer(canvas) {
  return {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vida: 100,
    ataque: 10,
    defesa: 5,
    tamanho: 20,
    angulo: 0
  }
}
//Função para desenhar o player
function desenharPlayer(ctx, player) {
  ctx.save()
  ctx.translate(player.x, player.y)
  ctx.rotate(player.angulo)

  ctx.strokeStyle = '#00ff41'
  ctx.lineWidth = 2

  //cabeça
  ctx.beginPath()
  ctx.arc(0, -20, 8, 0, Math.PI * 2)
  ctx.stroke()

  //corpo
  ctx.beginPath()
  ctx.moveTo(0, -12)
  ctx.lineTo(0, 10)
  ctx.stroke()

  //braços
  ctx.beginPath()
  ctx.moveTo(-10, -2)
  ctx.lineTo(10, -2)
  ctx.stroke()

  //pernas
  ctx.beginPath()
  ctx.moveTo(0, 10)
  ctx.lineTo(-8, 25)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(0, 10)
  ctx.lineTo(8, 25)
  ctx.stroke()

  ctx.restore()
}
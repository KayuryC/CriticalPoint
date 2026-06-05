function desenharHUD(ctx, canvas, player, score, wave, pontos) {
  ctx.save()
  ctx.font = '16px Courier New'
  ctx.textBaseline = 'top'
  ctx.shadowBlur = 10
  ctx.shadowColor = '#00ff41'

  desenharPainelHUD(ctx, 18, 18, 230, 102)
  ctx.fillStyle = '#00ff41'
  ctx.fillText('SCORE: ' + score, 34, 34)
  ctx.fillText('WAVE:  ' + wave, 34, 58)
  ctx.fillText('HP:', 34, 82)
  desenharBarrasHP(ctx, 74, 82, player.vida, player.vidaMaxima)

  const textoPontos = 'SHOP PTS: ' + pontos
  const largura = Math.max(190, ctx.measureText(textoPontos).width + 34)
  desenharPainelHUD(ctx, canvas.width - largura - 18, 18, largura, 48)
  ctx.fillStyle = '#00ff41'
  ctx.textAlign = 'center'
  ctx.fillText(textoPontos, canvas.width - largura / 2 - 18, 34)
  ctx.restore()
}

function desenharPainelHUD(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.66)'
  ctx.strokeStyle = '#00ff41'
  ctx.lineWidth = 1
  ctx.fillRect(x, y, w, h)
  ctx.strokeRect(x, y, w, h)
}

function desenharBarrasHP(ctx, x, y, vida, vidaMaxima) {
  const total = Math.max(1, vidaMaxima)
  const largura = 14
  const altura = 14
  const espacamento = 4

  for (let i = 0; i < total; i++) {
    ctx.fillStyle = i < vida ? '#00ff41' : 'rgba(0, 255, 65, 0.14)'
    ctx.strokeStyle = '#00ff41'
    ctx.fillRect(x + i * (largura + espacamento), y + 1, largura, altura)
    ctx.strokeRect(x + i * (largura + espacamento), y + 1, largura, altura)
  }
}

function desenharShop(ctx, canvas, pontos, itens) {
  const botoes = []
  const listaItens = itens || []
  const painelW = Math.min(860, canvas.width - 34)
  const painelH = Math.min(530, canvas.height - 34)
  const painelX = canvas.width / 2 - painelW / 2
  const painelY = canvas.height / 2 - painelH / 2
  const colunas = canvas.width < 720 ? 1 : 2
  const itemW = colunas === 1 ? painelW - 44 : (painelW - 66) / 2
  const espacoItens = painelH - 220
  const itemH = colunas === 1 ? Math.max(64, Math.min(92, espacoItens / Math.max(1, listaItens.length) - 10)) : 92
  const gapY = colunas === 1 ? 10 : 18
  const inicioY = painelY + 118

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.78)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.shadowBlur = 18
  ctx.shadowColor = '#00ff41'
  ctx.fillStyle = 'rgba(0, 14, 4, 0.94)'
  ctx.strokeStyle = '#00ff41'
  ctx.lineWidth = 2
  ctx.fillRect(painelX, painelY, painelW, painelH)
  ctx.strokeRect(painelX, painelY, painelW, painelH)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#00ff41'
  ctx.font = '30px Courier New'
  ctx.fillText('SHOP DA MATRIX', canvas.width / 2, painelY + 38)
  ctx.font = '18px Courier New'
  ctx.fillText('Pontos disponiveis: ' + pontos, canvas.width / 2, painelY + 76)

  for (let i = 0; i < listaItens.length; i++) {
    const item = listaItens[i]
    const coluna = colunas === 1 ? 0 : i % 2
    const linha = colunas === 1 ? i : Math.floor(i / 2)
    const x = painelX + 22 + coluna * (itemW + 22)
    const y = inicioY + linha * (itemH + gapY)
    const comprado = pontos >= item.custo

    ctx.fillStyle = comprado ? 'rgba(0, 255, 65, 0.13)' : 'rgba(255, 32, 32, 0.12)'
    ctx.strokeStyle = comprado ? '#00ff41' : '#ff6020'
    ctx.lineWidth = 1
    ctx.fillRect(x, y, itemW, itemH)
    ctx.strokeRect(x, y, itemW, itemH)

    ctx.textAlign = 'left'
    ctx.fillStyle = comprado ? '#d6ffe2' : '#ffb29a'
    ctx.font = '20px Courier New'
    ctx.fillText(item.nome, x + 18, y + 18)
    ctx.font = '14px Courier New'
    ctx.fillText(item.detalhe, x + 18, y + 48)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#00ff41'
    ctx.font = '18px Courier New'
    ctx.fillText(item.custo + ' pts', x + itemW - 18, y + 34)

    botoes.push({
      tipo: 'compra',
      item: item,
      rect: { x: x, y: y, w: itemW, h: itemH }
    })
  }

  const botaoProxima = {
    x: canvas.width / 2 - 145,
    y: painelY + painelH - 78,
    w: 290,
    h: 52
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(0, 255, 65, 0.18)'
  ctx.strokeStyle = '#00ff41'
  ctx.lineWidth = 2
  ctx.fillRect(botaoProxima.x, botaoProxima.y, botaoProxima.w, botaoProxima.h)
  ctx.strokeRect(botaoProxima.x, botaoProxima.y, botaoProxima.w, botaoProxima.h)
  ctx.fillStyle = '#ffffff'
  ctx.font = '20px Courier New'
  ctx.fillText('PROXIMA WAVE', botaoProxima.x + botaoProxima.w / 2, botaoProxima.y + 17)

  botoes.push({
    tipo: 'proxima',
    rect: botaoProxima
  })

  ctx.restore()
  return botoes
}

function desenharQuestao(ctx, canvas, questao, resposta) {
  const painelW = Math.min(860, canvas.width - 34)
  const painelH = Math.min(410, canvas.height - 34)
  const painelX = canvas.width / 2 - painelW / 2
  const painelY = canvas.height / 2 - painelH / 2
  const entradaW = Math.min(520, painelW - 58)

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.shadowBlur = 20
  ctx.shadowColor = '#00ff41'
  ctx.fillStyle = 'rgba(0, 14, 4, 0.96)'
  ctx.strokeStyle = '#00ff41'
  ctx.lineWidth = 2
  ctx.fillRect(painelX, painelY, painelW, painelH)
  ctx.strokeRect(painelX, painelY, painelW, painelH)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#00ff41'
  ctx.font = '24px Courier New'
  ctx.fillText(questao.titulo, canvas.width / 2, painelY + 42)

  ctx.textAlign = 'left'
  ctx.font = '18px Courier New'
  ctx.fillStyle = '#d6ffe2'
  quebrarTextoHUD(ctx, questao.texto, painelX + 34, painelY + 92, painelW - 68, 26)

  ctx.fillStyle = '#8affaa'
  ctx.font = '14px Courier New'
  quebrarTextoHUD(ctx, 'Dica: ' + questao.dica, painelX + 34, painelY + 166, painelW - 68, 22)

  const entradaX = canvas.width / 2 - entradaW / 2
  const entradaY = painelY + painelH - 126
  ctx.fillStyle = 'rgba(0, 0, 0, 0.72)'
  ctx.strokeStyle = '#00ff41'
  ctx.fillRect(entradaX, entradaY, entradaW, 50)
  ctx.strokeRect(entradaX, entradaY, entradaW, 50)

  ctx.fillStyle = '#ffffff'
  ctx.font = '22px Courier New'
  ctx.textAlign = 'left'
  ctx.fillText((resposta || '') + '_', entradaX + 18, entradaY + 14)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#00ff41'
  ctx.font = '15px Courier New'
  ctx.fillText('Digite a resposta e pressione ENTER', canvas.width / 2, painelY + painelH - 38)
  ctx.restore()
}

function quebrarTextoHUD(ctx, texto, x, y, largura, alturaLinha) {
  const palavras = texto.split(' ')
  let linha = ''
  let linhaY = y

  for (let i = 0; i < palavras.length; i++) {
    const teste = linha + palavras[i] + ' '

    if (ctx.measureText(teste).width > largura && linha !== '') {
      ctx.fillText(linha, x, linhaY)
      linha = palavras[i] + ' '
      linhaY += alturaLinha
    } else {
      linha = teste
    }
  }

  ctx.fillText(linha, x, linhaY)
}

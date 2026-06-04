const COLS = Math.floor(window.innerWidth / 20);
const drops = [];

for (let i = 0; i < COLS; i++) {
    drops[i] = Math.random() * -100;
}

console.log('Colunas criadas:', COLS)
console.log('Drops:', drops)
const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789ABCDEFZ@#'

//função para desenhar a Matrix
function drawMatrix(ctx, canvas) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#00ff41'
  ctx.font = '16px Courier New'

  for (let i = 0; i < drops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)]
    ctx.fillText(char, i * 20, drops[i] * 20)

    if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
      drops[i] = 0
    }

    drops[i]++
  }

  requestAnimationFrame(() => drawMatrix(ctx, canvas))
}
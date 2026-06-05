const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const player = criarPlayer(canvas)

console.log('Canvas funcionando:', canvas.width, canvas.height)
drawMatrix(ctx, canvas)
desenharPlayer(ctx, player)

(function() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext

  const noopApi = {
    start: function() {},
    setMode: function() {},
    toggleMute: function() {
      return true
    },
    isMuted: function() {
      return true
    }
  }

  if (!AudioContextConstructor) {
    window.CriticalPointMusic = noopApi
    return
  }

  const MODES = {
    intro: {
      bpm: 76,
      volume: 0.3,
      root: 42,
      cutoff: 1500,
      delay: 0.18,
      bass: [0, null, null, null, -2, null, null, null, 3, null, null, null, -5, null, null, null],
      lead: [null, null, null, 7, null, null, 10, null, null, null, 5, null, null, 3, null, null],
      percussion: false
    },
    danger: {
      bpm: 92,
      volume: 0.34,
      root: 39,
      cutoff: 1900,
      delay: 0.2,
      bass: [0, null, 0, null, -1, null, null, null, 0, null, 3, null, -1, null, null, null],
      lead: [null, 12, null, null, null, 10, null, null, null, 7, null, null, null, 5, null, null],
      percussion: false
    },
    focus: {
      bpm: 84,
      volume: 0.26,
      root: 42,
      cutoff: 1300,
      delay: 0.14,
      bass: [0, null, null, null, 3, null, null, null, 5, null, null, null, 3, null, null, null],
      lead: [null, null, 12, null, null, null, 15, null, null, 10, null, null, null, 7, null, null],
      percussion: false
    },
    battle: {
      bpm: 128,
      volume: 0.42,
      root: 42,
      cutoff: 2600,
      delay: 0.16,
      bass: [0, null, 0, null, -2, null, 0, null, 3, null, 3, null, -5, null, -2, null],
      lead: [null, 12, null, 15, null, 10, null, 19, null, 17, null, 15, null, 10, 12, null],
      percussion: true
    },
    gameover: {
      bpm: 58,
      volume: 0.24,
      root: 37,
      cutoff: 900,
      delay: 0.22,
      bass: [0, null, null, null, -2, null, null, null, -5, null, null, null, -7, null, null, null],
      lead: [null, null, 12, null, null, null, 10, null, null, null, 7, null, null, null, 5, null],
      percussion: false
    }
  }

  let audioCtx = null
  let masterGain = null
  let toneFilter = null
  let delay = null
  let delayWet = null
  let noiseBuffer = null
  let timer = null
  let step = 0
  let currentMode = 'intro'
  let started = false
  let muted = false

  function setupAudio() {
    if (audioCtx) {
      return
    }

    audioCtx = new AudioContextConstructor()
    masterGain = audioCtx.createGain()
    toneFilter = audioCtx.createBiquadFilter()
    delay = audioCtx.createDelay(0.7)
    delayWet = audioCtx.createGain()

    const feedback = audioCtx.createGain()
    const compressor = audioCtx.createDynamicsCompressor()

    masterGain.gain.value = 0
    toneFilter.type = 'lowpass'
    toneFilter.frequency.value = MODES[currentMode].cutoff
    toneFilter.Q.value = 0.7
    delay.delayTime.value = 0.28
    delayWet.gain.value = MODES[currentMode].delay
    feedback.gain.value = 0.18

    masterGain.connect(toneFilter)
    toneFilter.connect(compressor)
    compressor.connect(audioCtx.destination)

    masterGain.connect(delay)
    delay.connect(feedback)
    feedback.connect(delay)
    delay.connect(delayWet)
    delayWet.connect(compressor)

    noiseBuffer = criarNoiseBuffer()
  }

  function criarNoiseBuffer() {
    const duracao = 0.18
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duracao, audioCtx.sampleRate)
    const dados = buffer.getChannelData(0)

    for (let i = 0; i < dados.length; i++) {
      dados[i] = Math.random() * 2 - 1
    }

    return buffer
  }

  function midiParaFrequencia(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12)
  }

  function aplicarEnvelope(gainNode, tempo, pico, ataque, queda, sustain, duracao) {
    const ganho = gainNode.gain
    const minimo = 0.0001
    const fimAtaque = tempo + ataque
    const fimQueda = fimAtaque + queda
    const fim = tempo + duracao

    ganho.cancelScheduledValues(tempo)
    ganho.setValueAtTime(minimo, tempo)
    ganho.exponentialRampToValueAtTime(Math.max(pico, minimo), fimAtaque)
    ganho.exponentialRampToValueAtTime(Math.max(pico * sustain, minimo), fimQueda)
    ganho.exponentialRampToValueAtTime(minimo, fim)
  }

  function tocarOscilador(midi, tempo, duracao, volume, tipo, destino) {
    const osc = audioCtx.createOscillator()
    const ganho = audioCtx.createGain()

    osc.type = tipo
    osc.frequency.setValueAtTime(midiParaFrequencia(midi), tempo)
    osc.detune.setValueAtTime((Math.random() - 0.5) * 5, tempo)
    aplicarEnvelope(ganho, tempo, volume, 0.015, 0.08, 0.42, duracao)

    osc.connect(ganho)
    ganho.connect(destino || masterGain)
    osc.start(tempo)
    osc.stop(tempo + duracao + 0.05)
  }

  function tocarPad(modo, tempo) {
    const notas = [modo.root, modo.root + 3, modo.root + 7, modo.root + 10]

    notas.forEach(function(midi, index) {
      tocarOscilador(midi, tempo + index * 0.018, 2.4, 0.024, 'sawtooth')
    })
  }

  function tocarBaixo(modo, tempo, duracao) {
    const intervalo = modo.bass[step]

    if (intervalo === null) {
      return
    }

    tocarOscilador(modo.root + intervalo, tempo, duracao * 0.9, 0.085, 'triangle')
    tocarOscilador(modo.root + intervalo + 12, tempo + 0.006, duracao * 0.45, 0.022, 'square')
  }

  function tocarLead(modo, tempo, duracao) {
    const intervalo = modo.lead[step]

    if (intervalo === null) {
      return
    }

    tocarOscilador(modo.root + intervalo + 12, tempo, duracao * 0.65, 0.04, 'square')
  }

  function tocarKick(tempo) {
    const osc = audioCtx.createOscillator()
    const ganho = audioCtx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(82, tempo)
    osc.frequency.exponentialRampToValueAtTime(34, tempo + 0.16)
    aplicarEnvelope(ganho, tempo, 0.18, 0.004, 0.035, 0.2, 0.2)

    osc.connect(ganho)
    ganho.connect(masterGain)
    osc.start(tempo)
    osc.stop(tempo + 0.22)
  }

  function tocarHat(tempo) {
    const source = audioCtx.createBufferSource()
    const filtro = audioCtx.createBiquadFilter()
    const ganho = audioCtx.createGain()

    source.buffer = noiseBuffer
    filtro.type = 'highpass'
    filtro.frequency.value = 6500
    aplicarEnvelope(ganho, tempo, 0.035, 0.002, 0.025, 0.15, 0.08)

    source.connect(filtro)
    filtro.connect(ganho)
    ganho.connect(masterGain)
    source.start(tempo)
    source.stop(tempo + 0.09)
  }

  function tocarPasso() {
    if (!audioCtx || muted) {
      return
    }

    const modo = MODES[currentMode]
    const duracaoPasso = 60 / modo.bpm / 2
    const tempo = audioCtx.currentTime + 0.02

    if (step % 8 === 0) {
      tocarPad(modo, tempo)
    }

    tocarBaixo(modo, tempo, duracaoPasso)
    tocarLead(modo, tempo + duracaoPasso * 0.08, duracaoPasso)

    if (modo.percussion) {
      if (step % 4 === 0) {
        tocarKick(tempo)
      }

      if (step % 2 === 1) {
        tocarHat(tempo)
      }
    }
  }

  function agendarProximoPasso() {
    if (!started) {
      timer = null
      return
    }

    const modo = MODES[currentMode]
    const duracaoPasso = 60 / modo.bpm / 2

    tocarPasso()
    step = (step + 1) % 16
    timer = window.setTimeout(agendarProximoPasso, duracaoPasso * 1000)
  }

  function atualizarMix() {
    if (!audioCtx || !masterGain) {
      return
    }

    const modo = MODES[currentMode]
    const agora = audioCtx.currentTime
    const volumeAlvo = muted ? 0 : modo.volume

    masterGain.gain.cancelScheduledValues(agora)
    masterGain.gain.setTargetAtTime(volumeAlvo, agora, 0.45)
    toneFilter.frequency.setTargetAtTime(modo.cutoff, agora, 0.6)
    delayWet.gain.setTargetAtTime(modo.delay, agora, 0.5)
  }

  function start() {
    setupAudio()
    started = true

    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }

    atualizarMix()

    if (!timer) {
      agendarProximoPasso()
    }
  }

  function setMode(mode) {
    if (!MODES[mode] || currentMode === mode) {
      return
    }

    currentMode = mode
    atualizarMix()
  }

  function toggleMute() {
    muted = !muted
    atualizarMix()
    return muted
  }

  window.CriticalPointMusic = {
    start: start,
    setMode: setMode,
    toggleMute: toggleMute,
    isMuted: function() {
      return muted
    }
  }
})()

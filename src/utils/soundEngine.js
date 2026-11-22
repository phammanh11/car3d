/**
 * Multi-Profile Supercar Web Audio API Acoustic Engine:
 * - 4 cấu hình âm thanh động cơ hoàn toàn khác biệt theo từng siêu xe:
 *   1. 'v8-flatplane' (Ferrari 458): Tiếng rú F1 tần số cao sắc gọn, 9,000 RPM scream.
 *   2. 'v12-aventador' (Lamborghini Aventador): Tiếng gầm 12 xi-lanh trầm hùng, quãng 5 kim loại + nổ pô liên hoàn.
 *   3. 'v10-gallardo' (Lamborghini Gallardo): Tiếng V10 góc nổ lệch đặc trưng, gầm gừ cơ khí.
 *   4. 'hybrid-hypercar' (Apex Vision GT-X): V8 Twin-Turbo + Tiếng rít mô-tơ điện Turbine + Van xả Turbo BOV.
 * - Tích hợp Backfire Pops & Bangs Synthesizer và Tiếng rít lốp khi phanh/drift.
 */

const ENGINE_PROFILES = {
  'v8-flatplane': {
    idleHz: 66,
    maxHz: 325,
    osc1Type: 'sawtooth',
    osc2Type: 'square',
    osc2Ratio: 2.0,
    osc3Type: 'sawtooth',
    osc3Ratio: 3.01,
    detuneCents: 6,
    filterMinHz: 420,
    filterMaxHz: 2950,
    filterQ: 4.8,
    driveAmount: 24,
    turbineGain: 0,
    bovEnabled: false,
    popGain: 0.35,
  },
  'v12-aventador': {
    idleHz: 44,
    maxHz: 238,
    osc1Type: 'sawtooth',
    osc2Type: 'sawtooth',
    osc2Ratio: 1.5, // Quãng 5 hòa âm đặc trưng V12 Lamborghini
    osc3Type: 'triangle',
    osc3Ratio: 3.0,
    detuneCents: 12,
    filterMinHz: 260,
    filterMaxHz: 2350,
    filterQ: 3.6,
    driveAmount: 42,
    turbineGain: 0,
    bovEnabled: false,
    popGain: 0.55,
  },
  'v10-gallardo': {
    idleHz: 52,
    maxHz: 262,
    osc1Type: 'sawtooth',
    osc2Type: 'sawtooth',
    osc2Ratio: 2.5, // Góc nổ lệch V10 Odd-Fire
    osc3Type: 'sine',
    osc3Ratio: 0.5,
    detuneCents: 22,
    filterMinHz: 310,
    filterMaxHz: 2450,
    filterQ: 4.1,
    driveAmount: 32,
    turbineGain: 0,
    bovEnabled: false,
    popGain: 0.42,
  },
  'hybrid-hypercar': {
    idleHz: 58,
    maxHz: 290,
    osc1Type: 'sawtooth',
    osc2Type: 'triangle',
    osc2Ratio: 2.0,
    osc3Type: 'sine',
    osc3Ratio: 0.5,
    detuneCents: 8,
    filterMinHz: 360,
    filterMaxHz: 2700,
    filterQ: 3.8,
    driveAmount: 28,
    turbineGain: 0.14, // Tiếng rít điện từ mô-tơ Hybrid
    bovEnabled: true, // Van xả Turbo Blow-off Valve khi nhả ga / sang số
    popGain: 0.48,
  },
}

function makeDistortionCurve(amount = 28) {
  const nSamples = 1024
  const curve = new Float32Array(nSamples)
  const deg = Math.PI / 180
  for (let i = 0; i < nSamples; i++) {
    const x = (i * 2) / nSamples - 1
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x))
  }
  return curve
}

class ProceduralCarAudio {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.oscPrimary = null
    this.oscHarmonic = null
    this.oscSub = null
    this.oscTurbine = null
    this.turbineGainNode = null
    this.shaper = null
    this.engineFilter = null
    this.engineGain = null
    this.noiseBuffer = null
    this.screechSource = null
    this.screechFilter = null
    this.screechGain = null
    this.profileId = 'v8-flatplane'
    this.isInitialized = false
    this.isRunning = false
    this.lastBackfireTime = 0
  }

  init() {
    if (this.isInitialized) return
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return

    try {
      this.ctx = new AudioCtx()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 0.0
      this.masterGain.connect(this.ctx.destination)

      this.shaper = this.ctx.createWaveShaper()
      this.shaper.curve = makeDistortionCurve(ENGINE_PROFILES[this.profileId].driveAmount)
      this.shaper.oversample = '2x'

      this.engineFilter = this.ctx.createBiquadFilter()
      this.engineFilter.type = 'lowpass'
      this.engineFilter.frequency.value = 420
      this.engineFilter.Q.value = 4.5

      this.engineGain = this.ctx.createGain()
      this.engineGain.gain.value = 0.25

      this.oscPrimary = this.ctx.createOscillator()
      this.oscHarmonic = this.ctx.createOscillator()
      this.oscSub = this.ctx.createOscillator()

      this.oscPrimary.connect(this.shaper)
      this.oscHarmonic.connect(this.shaper)
      this.oscSub.connect(this.shaper)
      this.shaper.connect(this.engineFilter)
      this.engineFilter.connect(this.engineGain)
      this.engineGain.connect(this.masterGain)

      // Oscillator 4: Tiếng rít điện/Turbo Turbine cho Hypercar Hybrid
      this.oscTurbine = this.ctx.createOscillator()
      this.oscTurbine.type = 'sine'
      this.oscTurbine.frequency.value = 450
      this.turbineGainNode = this.ctx.createGain()
      this.turbineGainNode.gain.value = 0
      this.oscTurbine.connect(this.turbineGainNode)
      this.turbineGainNode.connect(this.masterGain)

      // White Noise Buffer dùng chung cho Tire Screech, Exhaust Backfire & Turbo BOV
      const bufferSize = this.ctx.sampleRate * 2
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = this.noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      this.screechSource = this.ctx.createBufferSource()
      this.screechSource.buffer = this.noiseBuffer
      this.screechSource.loop = true

      this.screechFilter = this.ctx.createBiquadFilter()
      this.screechFilter.type = 'bandpass'
      this.screechFilter.frequency.value = 1850
      this.screechFilter.Q.value = 6.5

      this.screechGain = this.ctx.createGain()
      this.screechGain.gain.value = 0

      this.screechSource.connect(this.screechFilter)
      this.screechFilter.connect(this.screechGain)
      this.screechGain.connect(this.masterGain)

      this.applyProfileToNodes(this.profileId)

      this.oscPrimary.start()
      this.oscHarmonic.start()
      this.oscSub.start()
      this.oscTurbine.start()
      this.screechSource.start()

      this.isInitialized = true
    } catch {
      // Bỏ qua nếu trình duyệt chưa cấp quyền AudioContext
    }
  }

  applyProfileToNodes(profileId) {
    const p = ENGINE_PROFILES[profileId] || ENGINE_PROFILES['v8-flatplane']
    if (!this.ctx || !this.oscPrimary) return
    this.oscPrimary.type = p.osc1Type
    this.oscHarmonic.type = p.osc2Type
    this.oscSub.type = p.osc3Type
    this.oscHarmonic.detune.value = p.detuneCents
    this.oscSub.detune.value = -p.detuneCents * 0.7
    this.engineFilter.Q.value = p.filterQ
    if (this.shaper) {
      this.shaper.curve = makeDistortionCurve(p.driveAmount)
    }
  }

  setProfile(profileId) {
    const resolved = ENGINE_PROFILES[profileId] ? profileId : 'v8-flatplane'
    if (this.profileId === resolved) return
    this.profileId = resolved
    this.applyProfileToNodes(resolved)
  }

  start() {
    if (!this.isInitialized) this.init()
    if (!this.ctx || !this.masterGain) return
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    const now = this.ctx.currentTime
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.setTargetAtTime(0.36, now, 0.06)
    this.isRunning = true
  }

  stop() {
    if (!this.ctx || !this.masterGain) return
    const now = this.ctx.currentTime
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.setTargetAtTime(0.0, now, 0.08)
    this.isRunning = false
  }

  /**
   * Phát xung nổ ống xả (Backfire Pops & Bangs) + Van xả Turbo (BOV) khi sang số hoặc nhả ga
   */
  triggerBackfire(intensity = 0.8) {
    if (!this.ctx || !this.noiseBuffer || !this.isRunning || !this.masterGain) return
    const now = this.ctx.currentTime
    if (now - this.lastBackfireTime < 0.09) return
    this.lastBackfireTime = now

    const p = ENGINE_PROFILES[this.profileId] || ENGINE_PROFILES['v8-flatplane']

    try {
      // 1. Tiếng nổ pô trầm đanh (Crack & Pop)
      const popSrc = this.ctx.createBufferSource()
      popSrc.buffer = this.noiseBuffer

      const popFilter = this.ctx.createBiquadFilter()
      popFilter.type = 'bandpass'
      popFilter.frequency.setValueAtTime(190 + Math.random() * 160, now)
      popFilter.Q.value = 1.6

      const popGain = this.ctx.createGain()
      const vol = Math.min(0.65, p.popGain * intensity)
      popGain.gain.setValueAtTime(0.001, now)
      popGain.gain.exponentialRampToValueAtTime(vol, now + 0.012)
      popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

      popSrc.connect(popFilter)
      popFilter.connect(popGain)
      popGain.connect(this.masterGain)

      popSrc.start(now, Math.random() * 0.5, 0.16)

      // 2. Tiếng xì van xả áp Turbo Blow-off Valve cho Hypercar Hybrid
      if (p.bovEnabled) {
        const bovSrc = this.ctx.createBufferSource()
        bovSrc.buffer = this.noiseBuffer

        const bovFilter = this.ctx.createBiquadFilter()
        bovFilter.type = 'highpass'
        bovFilter.frequency.setValueAtTime(2600, now)
        bovFilter.frequency.exponentialRampToValueAtTime(1100, now + 0.22)

        const bovGain = this.ctx.createGain()
        bovGain.gain.setValueAtTime(0.001, now)
        bovGain.gain.exponentialRampToValueAtTime(0.18 * intensity, now + 0.025)
        bovGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24)

        bovSrc.connect(bovFilter)
        bovFilter.connect(bovGain)
        bovGain.connect(this.masterGain)
        bovSrc.start(now, Math.random() * 0.4, 0.26)
      }
    } catch {
      // Ignore audio schedule edge error
    }
  }

  update({
    rpm = 850,
    speed = 0,
    isDrifting = false,
    isBraking = false,
    enabled = true,
    profileId = null,
  }) {
    if (profileId && profileId !== this.profileId) {
      this.setProfile(profileId)
    }

    if (!enabled) {
      if (this.isRunning) this.stop()
      return
    }
    if (!this.isInitialized) return
    if (!this.isRunning) this.start()
    if (!this.ctx) return

    const p = ENGINE_PROFILES[this.profileId] || ENGINE_PROFILES['v8-flatplane']
    const now = this.ctx.currentTime
    const normalizedRpm = Math.max(0, Math.min(1, (rpm - 850) / 8150))

    const baseFreq = p.idleHz + normalizedRpm * (p.maxHz - p.idleHz)
    this.oscPrimary.frequency.setTargetAtTime(baseFreq, now, 0.035)
    this.oscHarmonic.frequency.setTargetAtTime(baseFreq * p.osc2Ratio, now, 0.035)
    this.oscSub.frequency.setTargetAtTime(baseFreq * p.osc3Ratio, now, 0.035)

    this.engineFilter.frequency.setTargetAtTime(
      p.filterMinHz + normalizedRpm * (p.filterMaxHz - p.filterMinHz),
      now,
      0.045
    )
    this.engineGain.gain.setTargetAtTime(0.18 + normalizedRpm * 0.22, now, 0.045)

    // Tiếng rít mô-tơ điện cho Hybrid Hypercar
    if (this.oscTurbine && this.turbineGainNode) {
      const turbineFreq = 420 + normalizedRpm * 1950 + speed * 3.5
      this.oscTurbine.frequency.setTargetAtTime(turbineFreq, now, 0.05)
      this.turbineGainNode.gain.setTargetAtTime(
        p.turbineGain * (0.15 + normalizedRpm * 0.85),
        now,
        0.05
      )
    }

    // Tiếng rít lốp khi drift hoặc phanh cháy đường
    const shouldScreech = (isDrifting || (isBraking && speed > 16)) && speed > 10
    const targetScreech = shouldScreech ? Math.min(0.25, (speed / 110) * 0.24) : 0
    this.screechGain.gain.setTargetAtTime(targetScreech, now, 0.03)
    this.screechFilter.frequency.setTargetAtTime(1600 + Math.min(950, speed * 5), now, 0.05)
  }

  dispose() {
    if (this.ctx) {
      this.ctx.close().catch(() => {})
      this.ctx = null
      this.isInitialized = false
      this.isRunning = false
    }
  }
}

export const carAudio = new ProceduralCarAudio()

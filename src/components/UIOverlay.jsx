import React, { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Calculator,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  Flame,
  Gauge,
  MapPin,
  Monitor,
  Palette,
  RotateCcw,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import {
  CAMERA_PRESETS,
  CAR_PAINTS,
  OPTION_PACKAGES,
  RIM_FINISHES,
  SUPERCAR_CATALOG,
  useCarStore,
} from '../store/useCarStore'
import { carAudio } from '../utils/soundEngine'

/**
 * Đồng hồ tốc độ Real-time dành riêng cho chế độ Test Drive Proving Ground
 */
function SpeedometerHUD() {
  const telemetry = useCarStore((s) => s.telemetry)
  const { speed, rpm, gear, isBraking, isDrifting, distance, topSpeed } = telemetry

  const rpmPercent = Math.min(1, Math.max(0, rpm / 9000))
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const arcLength = circumference * 0.72
  const strokeDashoffset = arcLength * (1 - rpmPercent)
  const isRedline = rpm > 7600

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="glass-panel rounded-3xl px-5 py-4 flex items-center gap-5 pointer-events-auto"
    >
      <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-[218deg]" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="9"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={isRedline ? '#ef4444' : '#38bdf8'}
            strokeWidth="9"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-75"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          <span className="font-mono text-3xl font-extrabold tracking-tight tabular-nums text-white leading-none">
            {speed}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1">km/h</span>
          <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 font-mono text-[11px] font-bold text-amber-400">
            GEAR {gear}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-2 min-w-[130px]">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Vòng tua máy</div>
          <div className="font-mono text-sm font-semibold tabular-nums text-slate-100">
            {rpm.toLocaleString()} <span className="text-xs text-slate-400">RPM</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/5 rounded-xl px-2.5 py-1.5 border border-white/10">
            <div className="text-[10px] text-slate-400">Max</div>
            <div className="font-mono font-bold tabular-nums text-white">{topSpeed}</div>
          </div>
          <div className="bg-white/5 rounded-xl px-2.5 py-1.5 border border-white/10">
            <div className="text-[10px] text-slate-400">Quãng đường</div>
            <div className="font-mono font-bold tabular-nums text-white">{distance} km</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
              isBraking
                ? 'bg-red-500/25 border-red-400/60 text-red-300'
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}
          >
            BRAKE
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
              isDrifting
                ? 'bg-amber-500/25 border-amber-400/60 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}
          >
            DRIFT
          </span>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Modal Đặt cọc giữ xe (Pre-order) hoặc Đặt lịch xem xe trực tiếp VIP
 */
function DealershipOrderModal() {
  const preorderOpen = useCarStore((s) => s.preorderOpen)
  const preorderIntent = useCarStore((s) => s.preorderIntent)
  const closePreorder = useCarStore((s) => s.closePreorder)
  const selectedCarId = useCarStore((s) => s.selectedCarId)
  const customModelName = useCarStore((s) => s.customModelName)
  const paint = useCarStore((s) => s.paint)
  const rimFinish = useCarStore((s) => s.rimFinish)
  const selectedPackages = useCarStore((s) => s.selectedPackages)
  const submitPreorder = useCarStore((s) => s.submitPreorder)
  const orders = useCarStore((s) => s.orders)

  const activeCar = useMemo(
    () => SUPERCAR_CATALOG.find((c) => c.id === selectedCarId) || SUPERCAR_CATALOG[0],
    [selectedCarId]
  )
  const totalPrice = useMemo(() => {
    const pkgSum = selectedPackages.reduce((sum, pkgId) => {
      const pkg = OPTION_PACKAGES.find((p) => p.id === pkgId)
      return sum + (pkg ? pkg.price : 0)
    }, 0)
    return activeCar.basePrice + paint.priceDelta + rimFinish.priceDelta + pkgSum
  }, [activeCar, paint, rimFinish, selectedPackages])

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [showroomCity, setShowroomCity] = useState('TP. Hồ Chí Minh — Flagship Atelier')
  const [preferredDate, setPreferredDate] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [confirmedOrder, setConfirmedOrder] = useState(null)

  const handleClose = () => {
    setErrorMsg('')
    setConfirmedOrder(null)
    closePreorder()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()

    if (trimmedName.length < 2) {
      setErrorMsg('Vui lòng nhập họ và tên khách hàng (ít nhất 2 ký tự).')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg('Địa chỉ email không đúng định dạng.')
      return
    }
    if (!/^[0-9+\-\s]{8,15}$/.test(trimmedPhone)) {
      setErrorMsg('Số điện thoại phải từ 8–15 chữ số.')
      return
    }

    setErrorMsg('')
    const order = submitPreorder({
      fullName: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      showroomCity,
      preferredDate: preferredDate || 'Liên hệ sắp xếp sớm nhất',
    })
    setConfirmedOrder(order)
    setFullName('')
    setEmail('')
    setPhone('')
    setPreferredDate('')
  }

  return (
    <AnimatePresence>
      {preorderOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dealership-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="glass-panel w-full max-w-xl rounded-3xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto"
          >
            <button
              onClick={handleClose}
              aria-label="Đóng hộp thoại"
              className="absolute top-5 right-5 w-9 h-9 rounded-full glass-pill flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {confirmedOrder ? (
              <div className="py-4 text-center space-y-5">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-400">
                    Xác nhận hồ sơ thành công
                  </div>
                  <h3 id="dealership-modal-title" className="text-2xl font-bold text-white mt-1">
                    Mã giao dịch: {confirmedOrder.id}
                  </h3>
                  <p className="text-sm text-slate-300 mt-2">
                    Giám đốc Kinh doanh tại{' '}
                    <span className="text-white font-semibold">{confirmedOrder.showroomCity}</span> sẽ
                    liên hệ với <span className="text-white font-semibold">{confirmedOrder.fullName}</span>{' '}
                    trong vòng 15 phút.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mẫu xe cấu hình</span>
                    <span className="font-semibold text-white">{confirmedOrder.carName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Sơn ngoại thất</span>
                    <span className="flex items-center gap-2 font-semibold text-white">
                      <span
                        className="w-3 h-3 rounded-full border border-white/30"
                        style={{ backgroundColor: confirmedOrder.paintHex }}
                      />
                      {confirmedOrder.paintName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mâm xe</span>
                    <span className="text-slate-200">{confirmedOrder.rimName}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-slate-400">Tổng giá trị cấu hình</span>
                    <span className="font-mono font-bold text-white">
                      {confirmedOrder.totalPriceFormatted}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-slate-200 transition cursor-pointer"
                >
                  Tiếp tục khám phá Showroom
                </button>
              </div>
            ) : (
              <>
                <div className="pr-10">
                  <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-red-400">
                    {preorderIntent === 'vip-viewing'
                      ? 'Private Atelier Appointment'
                      : 'Official Vehicle Reservation'}
                  </span>
                  <h3 id="dealership-modal-title" className="text-2xl font-bold text-white mt-1">
                    {preorderIntent === 'vip-viewing'
                      ? 'Đặt lịch Xem xe & Lái thử VIP'
                      : 'Đặt cọc giữ suất Siêu xe'}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300 bg-white/5 rounded-xl px-3.5 py-2.5 border border-white/10">
                    <span className="font-semibold text-white">
                      {customModelName ? `Sketchfab: ${customModelName}` : activeCar.name}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span>{paint.name}</span>
                    <span className="text-slate-500">•</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ${totalPrice.toLocaleString('en-US')}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Họ và tên quý khách
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Hoàng Minh"
                      className="w-full rounded-xl bg-white/5 border border-white/15 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-white/45"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Email liên hệ
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="minh.nguyen@domain.com"
                        className="w-full rounded-xl bg-white/5 border border-white/15 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-white/45"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0901 234 567"
                        className="w-full rounded-xl bg-white/5 border border-white/15 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-white/45"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Showroom giao dịch
                      </label>
                      <select
                        value={showroomCity}
                        onChange={(e) => setShowroomCity(e.target.value)}
                        className="w-full rounded-xl bg-[#11141b] border border-white/15 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/45"
                      >
                        <option value="TP. Hồ Chí Minh — Flagship Atelier">
                          TP. Hồ Chí Minh — Flagship Atelier
                        </option>
                        <option value="Hà Nội — Heritage Lounge">Hà Nội — Heritage Lounge</option>
                        <option value="Dubai — Sheikh Zayed Showroom">
                          Dubai — Sheikh Zayed Showroom
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Ngày hẹn dự kiến
                      </label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full rounded-xl bg-[#11141b] border border-white/15 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/45"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="text-xs text-red-300 bg-red-500/15 border border-red-400/30 rounded-xl px-3.5 py-2.5">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition cursor-pointer"
                  >
                    {preorderIntent === 'vip-viewing'
                      ? 'Xác nhận Đặt lịch VIP Private Viewing'
                      : 'Xác nhận Đặt cọc Giữ xe ($25,000 Refundable)'}
                  </button>
                </form>

                {orders.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-white/10">
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">
                      Hồ sơ giao dịch gần đây ({orders.length})
                    </div>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                      {orders.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-1.5 border border-white/10"
                        >
                          <span className="font-mono text-slate-200">{item.id}</span>
                          <span className="text-slate-300 truncate max-w-[160px]">
                            {item.carName}
                          </span>
                          <span className="text-emerald-400 font-mono font-semibold">
                            {item.totalPriceFormatted}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * HUD Overlay riêng khi đang ở chế độ Lái thử 3D (Proving Ground)
 */
export function TestDriveHUD() {
  const soundEnabled = useCarStore((s) => s.soundEnabled)
  const cameraView = useCarStore((s) => s.cameraView)
  const selectedCarId = useCarStore((s) => s.selectedCarId)
  const customModelName = useCarStore((s) => s.customModelName)
  const toggleSound = useCarStore((s) => s.toggleSound)
  const cycleCameraView = useCarStore((s) => s.cycleCameraView)
  const triggerResetCar = useCarStore((s) => s.triggerResetCar)
  const setVirtualKey = useCarStore((s) => s.setVirtualKey)
  const setMode = useCarStore((s) => s.setMode)

  const activeCar = useMemo(
    () => SUPERCAR_CATALOG.find((c) => c.id === selectedCarId) || SUPERCAR_CATALOG[0],
    [selectedCarId]
  )

  const handleBackToDealership = () => {
    carAudio.stop()
    setMode('showroom')
  }

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar Proving Ground */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="glass-panel rounded-2xl px-4 py-2.5 flex items-center gap-3 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
              Proving Ground • Test Drive
            </div>
            <div className="text-sm font-bold text-white">
              {customModelName ? `Sketchfab: ${customModelName}` : activeCar.name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleSound}
            className="glass-pill rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5 text-slate-200 cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <span className="hidden sm:inline">Âm thanh</span>
          </button>

          <button
            onClick={cycleCameraView}
            className="glass-pill rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5 text-slate-200 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline uppercase">{cameraView}</span>
          </button>

          <button
            onClick={triggerResetCar}
            className="glass-pill rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5 text-slate-200 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Reset (R)</span>
          </button>

          <button
            onClick={handleBackToDealership}
            className="rounded-xl px-4 py-2 bg-white text-black hover:bg-slate-200 text-xs font-bold flex items-center gap-2 shadow-lg transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Trang Bán Xe</span>
          </button>
        </div>
      </header>

      {/* Bottom Controls & Speedometer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mt-auto">
        <div className="glass-panel rounded-3xl p-4 pointer-events-auto max-w-sm w-full sm:w-auto">
          <div className="hidden lg:block space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <span className="flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-sky-400" />
                <span>Phím lái thử 3D</span>
              </span>
              <span className="text-[10px] font-mono text-amber-400 normal-case">
                {activeCar.soundLabel}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[11px]">
                  W A S D
                </kbd>
                <span>Tiến / Lùi / Rẽ</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[11px]">
                  SPACE
                </kbd>
                <span>Phanh & Khói Drift</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[11px]">
                  SHIFT / F
                </kbd>
                <span className="text-amber-300">Nẹt pô & Khạc lửa</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono text-[11px]">
                  C / R
                </kbd>
                <span>Camera / Reset</span>
              </div>
            </div>
          </div>

          <div className="lg:hidden flex flex-col items-center gap-2">
            <div className="text-[11px] text-amber-200 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Dùng máy tính để lái xe tốt nhất</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onPointerDown={() => setVirtualKey('left', true)}
                onPointerUp={() => setVirtualKey('left', false)}
                onPointerLeave={() => setVirtualKey('left', false)}
                className="w-12 h-11 rounded-xl glass-pill font-bold text-sm"
              >
                ◀
              </button>
              <div className="flex flex-col gap-1.5">
                <button
                  onPointerDown={() => setVirtualKey('forward', true)}
                  onPointerUp={() => setVirtualKey('forward', false)}
                  onPointerLeave={() => setVirtualKey('forward', false)}
                  className="w-14 h-10 rounded-xl bg-emerald-600/80 border border-emerald-400/50 font-bold text-xs"
                >
                  GA ▲
                </button>
                <button
                  onPointerDown={() => setVirtualKey('backward', true)}
                  onPointerUp={() => setVirtualKey('backward', false)}
                  onPointerLeave={() => setVirtualKey('backward', false)}
                  className="w-14 h-10 rounded-xl glass-pill font-bold text-xs"
                >
                  LÙI ▼
                </button>
              </div>
              <button
                onPointerDown={() => setVirtualKey('right', true)}
                onPointerUp={() => setVirtualKey('right', false)}
                onPointerLeave={() => setVirtualKey('right', false)}
                className="w-12 h-11 rounded-xl glass-pill font-bold text-sm"
              >
                ▶
              </button>
              <button
                onPointerDown={() => setVirtualKey('brake', true)}
                onPointerUp={() => setVirtualKey('brake', false)}
                onPointerLeave={() => setVirtualKey('brake', false)}
                className="w-16 h-11 rounded-xl bg-red-600/80 border border-red-400/50 font-bold text-xs"
              >
                PHANH
              </button>
            </div>
          </div>
        </div>

        <SpeedometerHUD />
      </div>
    </div>
  )
}

/**
 * Bảng điều khiển Cấu hình xe + Toàn bộ Website Bán Siêu Xe 3D (Dealership Website)
 * Kết hợp Hero Showroom 3D tương tác ở trên + Kho Siêu Xe + Gói Trang Bị + Tính Trả Góp + Upload Sketchfab GLB
 */
export function DealershipSections({ children3DCanvas }) {
  const selectedCarId = useCarStore((s) => s.selectedCarId)
  const customModelUrl = useCarStore((s) => s.customModelUrl)
  const customModelName = useCarStore((s) => s.customModelName)
  const paint = useCarStore((s) => s.paint)
  const rimFinish = useCarStore((s) => s.rimFinish)
  const selectedPackages = useCarStore((s) => s.selectedPackages)
  const autoRotate = useCarStore((s) => s.autoRotate)
  const showroomEnv = useCarStore((s) => s.showroomEnv)
  const cameraPreset = useCarStore((s) => s.cameraPreset)
  const showHotspots = useCarStore((s) => s.showHotspots)
  const soundEnabled = useCarStore((s) => s.soundEnabled)

  const selectCar = useCarStore((s) => s.selectCar)
  const setCustomModel = useCarStore((s) => s.setCustomModel)
  const clearCustomModel = useCarStore((s) => s.clearCustomModel)
  const setPaint = useCarStore((s) => s.setPaint)
  const setRimFinish = useCarStore((s) => s.setRimFinish)
  const togglePackage = useCarStore((s) => s.togglePackage)
  const setCameraPreset = useCarStore((s) => s.setCameraPreset)
  const toggleHotspots = useCarStore((s) => s.toggleHotspots)
  const toggleAutoRotate = useCarStore((s) => s.toggleAutoRotate)
  const setShowroomEnv = useCarStore((s) => s.setShowroomEnv)
  const triggerShowroomRev = useCarStore((s) => s.triggerShowroomRev)
  const setMode = useCarStore((s) => s.setMode)
  const openPreorder = useCarStore((s) => s.openPreorder)

  const fileInputRef = useRef(null)
  const [uploadError, setUploadError] = useState('')
  const [dismissMobileWarn, setDismissMobileWarn] = useState(false)

  // State cho bộ tính tài chính / trả góp
  const [downPaymentPct, setDownPaymentPct] = useState(30)
  const [termMonths, setTermMonths] = useState(48)
  const [interestApr, setInterestApr] = useState(6.2)

  const activeCar = useMemo(
    () => SUPERCAR_CATALOG.find((c) => c.id === selectedCarId) || SUPERCAR_CATALOG[0],
    [selectedCarId]
  )

  const totalPrice = useMemo(() => {
    const pkgSum = selectedPackages.reduce((sum, pkgId) => {
      const pkg = OPTION_PACKAGES.find((p) => p.id === pkgId)
      return sum + (pkg ? pkg.price : 0)
    }, 0)
    return activeCar.basePrice + paint.priceDelta + rimFinish.priceDelta + pkgSum
  }, [activeCar, paint, rimFinish, selectedPackages])

  // Công thức tính khoản trả góp hàng tháng chuẩn ngân hàng
  const financeSummary = useMemo(() => {
    const downAmount = (totalPrice * downPaymentPct) / 100
    const loanPrincipal = totalPrice - downAmount
    const monthlyRate = interestApr / 100 / 12
    const monthlyPayment =
      monthlyRate > 0
        ? (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
          (Math.pow(1 + monthlyRate, termMonths) - 1)
        : loanPrincipal / termMonths

    return {
      downAmount: Math.round(downAmount),
      loanPrincipal: Math.round(loanPrincipal),
      monthlyPayment: Math.round(monthlyPayment),
    }
  }, [totalPrice, downPaymentPct, termMonths, interestApr])

  const handleStartTestDrive = () => {
    if (soundEnabled) carAudio.start()
    setMode('testdrive')
  }

  const handleSketchfabUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const lower = file.name.toLowerCase()
    if (!lower.endsWith('.glb')) {
      setUploadError('Vui lòng chọn file định dạng .GLB (tải từ Sketchfab dưới dạng Binary glTF).')
      return
    }
    setUploadError('')
    const url = URL.createObjectURL(file)
    setCustomModel(url, file.name)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      {/* 1. LUXURY DEALERSHIP TOP NAVBAR */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#050608]/85 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center font-mono font-extrabold text-sm shadow-lg shadow-red-600/30">
              A
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400">
                APEX ATELIER
              </div>
              <div className="text-sm font-bold tracking-wide text-white">
                GENEVA • DUBAI • SAIGON
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button
              onClick={() => scrollToSection('showroom-studio')}
              className="hover:text-white transition cursor-pointer"
            >
              Showroom 3D
            </button>
            <button
              onClick={() => scrollToSection('inventory')}
              className="hover:text-white transition cursor-pointer"
            >
              Kho Siêu Xe ({SUPERCAR_CATALOG.length})
            </button>
            <button
              onClick={() => scrollToSection('bespoke-options')}
              className="hover:text-white transition cursor-pointer"
            >
              Gói Trang Bị
            </button>
            <button
              onClick={() => scrollToSection('financing')}
              className="hover:text-white transition cursor-pointer"
            >
              Tài Chính & Trả Góp
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openPreorder('vip-viewing')}
              className="hidden sm:flex glass-pill rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-100 items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-red-400" />
              <span>Đặt lịch xem xe</span>
            </button>
            <button
              onClick={handleStartTestDrive}
              className="rounded-xl px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-600/25 transition cursor-pointer"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>Lái thử 3D</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Cảnh báo Mobile */}
      {!dismissMobileWarn && (
        <div className="lg:hidden px-4 pt-3">
          <div className="glass-panel rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2.5 border-amber-400/35 bg-amber-950/40">
            <div className="flex items-center gap-2 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Vui lòng dùng máy tính để trải nghiệm lái thử 3D tốt nhất (Mobile hỗ trợ vuốt xoay xe).
              </span>
            </div>
            <button
              onClick={() => setDismissMobileWarn(true)}
              aria-label="Ẩn thông báo"
              className="text-amber-300/80 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. HERO SECTION: 3D SHOWROOM + CONFIGURATOR SIDEBAR */}
      <section
        id="showroom-studio"
        className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* CỘT TRÁI (8 cols): Khung 3D Showroom Tương tác Thực Tế (.GLB) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="relative h-[460px] sm:h-[560px] lg:h-[640px] rounded-3xl overflow-hidden border border-white/15 bg-[#06070a] shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
              {/* Canvas 3D R3F được truyền vào đây */}
              {children3DCanvas}

              {/* Badge trạng thái góc trên trái */}
              <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                <div className="glass-panel rounded-2xl px-3.5 py-2 pointer-events-auto flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-red-600/25 border border-red-500/40 text-[10px] font-mono uppercase tracking-wider text-red-300">
                    {customModelName ? 'SKETCHFAB 3D' : activeCar.badge}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {customModelName ? customModelName : `${activeCar.name} — ${activeCar.year}`}
                  </span>
                  {customModelUrl && (
                    <button
                      onClick={clearCustomModel}
                      className="text-[11px] text-amber-300 hover:underline ml-1 cursor-pointer"
                    >
                      (Khôi phục xe gốc)
                    </button>
                  )}
                </div>

                {/* Công cụ Studio: Auto-rotate, Hotspots, HDR Environment */}
                <div className="flex items-center gap-2 pointer-events-auto">
                  <button
                    onClick={() => {
                      carAudio.setProfile(activeCar.soundProfile)
                      carAudio.start()
                      triggerShowroomRev()
                    }}
                    className="glass-pill rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 text-amber-300 border-amber-400/35 hover:bg-amber-500/20 cursor-pointer"
                    title="Nghe tiếng động cơ đặc trưng & xem lửa ống pô của mẫu xe này"
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span className="hidden sm:inline">Nẹt pô</span>
                  </button>

                  <button
                    onClick={toggleHotspots}
                    className={`glass-pill rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                      showHotspots ? 'text-white border-white/35' : 'text-slate-400'
                    }`}
                    title="Hiện/Ẩn các điểm thông số trên xe"
                  >
                    {showHotspots ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Hotspots</span>
                  </button>

                  <button
                    onClick={toggleAutoRotate}
                    className={`glass-pill rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                      autoRotate ? 'text-white border-white/35' : 'text-slate-400'
                    }`}
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Xoay 360°</span>
                  </button>

                  <button
                    onClick={() => setShowroomEnv(showroomEnv === 'studio' ? 'city' : 'studio')}
                    className="glass-pill rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5 text-slate-200 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span className="hidden sm:inline">
                      {showroomEnv === 'studio' ? 'Studio HDR' : 'City HDR'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Thanh chọn Góc Camera Chuẩn Showroom (Góc dưới khung 3D) */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                <div className="glass-panel rounded-2xl p-1.5 flex flex-wrap items-center gap-1 pointer-events-auto">
                  {CAMERA_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setCameraPreset(preset.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                        cameraPreset === preset.id
                          ? 'bg-white text-black font-bold shadow'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="hidden sm:flex items-center gap-1.5 glass-panel rounded-xl px-3 py-1.5 text-[11px] text-slate-300">
                  <Compass className="w-3.5 h-3.5 text-red-400" />
                  <span>Kéo chuột xoay • Cuộn để Zoom chi tiết</span>
                </div>
              </div>
            </div>

            {/* Strip 4 thông số kỹ thuật nổi bật ngay dưới khung 3D */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-card rounded-2xl p-4">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Tăng tốc 0–100</div>
                <div className="font-mono text-2xl font-extrabold text-white mt-1">
                  {activeCar.zeroToHundred}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{activeCar.drivetrain}</div>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Công suất</div>
                <div className="font-mono text-2xl font-extrabold text-white mt-1">
                  {activeCar.power}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{activeCar.engine}</div>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Vận tốc tối đa</div>
                <div className="font-mono text-2xl font-extrabold text-white mt-1">
                  {activeCar.topSpeed}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Mô-men {activeCar.torque}</div>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Tình trạng</div>
                <div className="text-sm font-bold text-emerald-400 mt-1.5">{activeCar.status}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{activeCar.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (4 cols): Bảng Cấu hình Siêu xe & Chốt đơn Bán Hàng */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between h-full space-y-5">
              <div className="space-y-5">
                {/* Tên xe & Mô tả */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-red-400">
                      {activeCar.brand} • {activeCar.year}
                    </span>
                    <span className="text-xs text-slate-400">{activeCar.mileage}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
                    {activeCar.name}
                  </h1>
                  <div className="text-xs font-medium text-slate-300 mt-0.5">{activeCar.trim}</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-400/25 text-[11px] font-mono text-amber-300">
                    <Volume2 className="w-3 h-3" />
                    <span>{activeCar.soundLabel}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                    {activeCar.description}
                  </p>
                </div>

                {/* Chuyển nhanh giữa 4 mẫu xe .GLB */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Chọn mẫu xe trưng bày 3D
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SUPERCAR_CATALOG.map((car) => {
                      const active = car.id === selectedCarId && !customModelUrl
                      return (
                        <button
                          key={car.id}
                          onClick={() => selectCar(car.id)}
                          className={`text-left rounded-xl px-3 py-2 border text-xs transition cursor-pointer ${
                            active
                              ? 'bg-white/15 border-white/50 text-white font-semibold'
                              : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                          }`}
                        >
                          <div className="truncate">{car.name}</div>
                          <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                            {car.priceFormatted}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Bộ chọn 6 màu sơn PBR */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
                      <Palette className="w-3.5 h-3.5 text-slate-400" />
                      Màu sơn ngoại thất
                    </span>
                    <span className="text-xs text-white font-medium">
                      {paint.name}{' '}
                      <span className="text-slate-400">
                        {paint.priceDelta > 0
                          ? `(+$${paint.priceDelta.toLocaleString()})`
                          : '(Tiêu chuẩn)'}
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {CAR_PAINTS.map((p) => {
                      const isSelected = p.id === paint.id
                      return (
                        <button
                          key={p.id}
                          onClick={() => setPaint(p.id)}
                          title={`${p.name} (${p.finish})`}
                          className={`rounded-xl p-1.5 border transition flex flex-col items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-white/15 border-white/60'
                              : 'bg-white/[0.03] border-white/10 hover:border-white/30'
                          }`}
                        >
                          <span
                            className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center"
                            style={{ backgroundColor: p.swatch }}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Bộ chọn màu Mâm xe Forged */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Chất liệu Mâm Forged
                    </span>
                    <span className="text-xs text-slate-300">{rimFinish.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {RIM_FINISHES.map((rim) => {
                      const isSelected = rim.id === rimFinish.id
                      return (
                        <button
                          key={rim.id}
                          onClick={() => setRimFinish(rim.id)}
                          className={`rounded-xl px-2.5 py-2 border text-[11px] flex items-center gap-2 transition cursor-pointer ${
                            isSelected
                              ? 'bg-white/15 border-white/50 text-white font-semibold'
                              : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                            style={{ backgroundColor: rim.hex }}
                          />
                          <span className="truncate">{rim.name.split(' ')[0]}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Báo giá tổng hợp & Các nút CTA Bán hàng */}
              <div className="pt-4 border-t border-white/15 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-slate-400">
                      Giá cấu hình hoàn chỉnh
                    </div>
                    <div className="font-mono text-3xl font-extrabold text-white mt-0.5">
                      ${totalPrice.toLocaleString('en-US')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Trả góp từ</div>
                    <div className="font-mono text-sm font-bold text-emerald-400">
                      ${financeSummary.monthlyPayment.toLocaleString('en-US')}/tháng
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => openPreorder('deposit')}
                    className="py-3 px-4 rounded-xl bg-white text-black hover:bg-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Đặt cọc Pre-order</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openPreorder('vip-viewing')}
                    className="glass-pill py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-red-400" />
                    <span>Hẹn xem xe VIP</span>
                  </button>
                </div>

                <button
                  onClick={handleStartTestDrive}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:brightness-110 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_12px_35px_rgba(220,38,38,0.4)] transition cursor-pointer"
                >
                  <Gauge className="w-4 h-4" />
                  <span>Book a Test Drive — Lái thử 3D chiếc xe này</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KHO SIÊU XE ĐANG BÁN (INVENTORY SHOWROOM CATALOG) */}
      <section id="inventory" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-red-400">
              Curated Inventory
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Bộ Sưu Tập Siêu Xe Sẵn Sàng Bàn Giao
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Mỗi mẫu xe đều được dựng mô hình 3D tỷ lệ thực chuẩn xác. Bấm vào bất kỳ xe nào để nạp
              lên Showroom 3D và tùy biến cấu hình trực tiếp.
            </p>
          </div>

          {/* Tích hợp Import model Sketchfab .GLB */}
          <div className="flex flex-col items-start md:items-end gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb"
              onChange={handleSketchfabUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="glass-pill rounded-xl px-4 py-2.5 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Nạp file .GLB từ Sketchfab của bạn</span>
            </button>
            <a
              href="https://sketchfab.com/search?features=downloadable&q=supercar&type=models"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1"
            >
              <span>Tìm thêm mẫu siêu xe trên Sketchfab</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            {uploadError && <span className="text-xs text-red-400">{uploadError}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {SUPERCAR_CATALOG.map((car) => {
            const isActive = car.id === selectedCarId && !customModelUrl
            return (
              <div
                key={car.id}
                className={`glass-card rounded-3xl p-5 flex flex-col justify-between gap-4 ${
                  isActive ? 'ring-2 ring-red-500/80 bg-white/[0.06]' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-400">
                      {car.brand} • {car.year}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                      {car.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{car.name}</h3>
                    <div className="text-xs text-slate-400">{car.trim}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400">Công suất</div>
                      <div className="font-mono text-xs font-bold text-white mt-0.5">
                        {car.power}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">0–100 km/h</div>
                      <div className="font-mono text-xs font-bold text-white mt-0.5">
                        {car.zeroToHundred}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Max Speed</div>
                      <div className="font-mono text-xs font-bold text-white mt-0.5">
                        {car.topSpeed}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {car.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">{car.mileage}</span>
                    <span className="font-mono text-xl font-extrabold text-white">
                      {car.priceFormatted}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        selectCar(car.id)
                        scrollToSection('showroom-studio')
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-black hover:bg-slate-200'
                      }`}
                    >
                      {isActive ? 'Đang xem 3D' : 'Xem 3D & Cấu hình'}
                    </button>
                    <button
                      onClick={() => {
                        selectCar(car.id)
                        openPreorder('deposit')
                      }}
                      className="glass-pill py-2.5 px-3 rounded-xl text-xs font-semibold text-white cursor-pointer"
                    >
                      Đặt cọc giữ xe
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. GÓI TRANG BỊ BESPOKE & BỘ TÍNH TÀI CHÍNH */}
      <section
        id="bespoke-options"
        className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12 border-t border-white/10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột Trái: Chọn Gói Trang Bị Hiệu Năng */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-red-400">
                Bespoke Equipment
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                Tùy Chọn Gói Nâng Cấp Chính Hãng
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Tích hợp trực tiếp vào báo giá cấu hình xe{' '}
                <span className="text-white font-semibold">{activeCar.name}</span>.
              </p>
            </div>

            <div className="space-y-3">
              {OPTION_PACKAGES.map((pkg) => {
                const checked = selectedPackages.includes(pkg.id)
                return (
                  <button
                    key={pkg.id}
                    onClick={() => togglePackage(pkg.id)}
                    className={`w-full text-left rounded-2xl p-4 border transition flex items-start justify-between gap-4 cursor-pointer ${
                      checked
                        ? 'bg-white/10 border-red-500/70'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            checked
                              ? 'bg-red-600 border-red-500 text-white'
                              : 'border-white/30 bg-transparent'
                          }`}
                        >
                          {checked && <Check className="w-3 h-3" />}
                        </span>
                        <span className="text-sm font-bold text-white">{pkg.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 pl-6 leading-relaxed">{pkg.desc}</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-emerald-400 shrink-0">
                      +${pkg.price.toLocaleString('en-US')}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Cột Phải: Bộ Tính Tài Chính & Trả Góp Siêu Xe */}
          <div id="financing" className="lg:col-span-6">
            <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-[0.22em] text-sky-400 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" />
                    Apex Financial Services
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">
                    Dự Toán Trả Góp & Thuê Mua VIP
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Tổng giá xe</div>
                  <div className="font-mono text-lg font-bold text-white">
                    ${totalPrice.toLocaleString('en-US')}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Trả trước ({downPaymentPct}%)</span>
                    <span className="font-mono font-bold text-white">
                      ${financeSummary.downAmount.toLocaleString('en-US')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="70"
                    step="5"
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Kỳ hạn vay ưu đãi</span>
                    <span className="font-mono font-bold text-white">{termMonths} tháng</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[12, 24, 36, 60].map((m) => (
                      <button
                        key={m}
                        onClick={() => setTermMonths(m)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold border transition cursor-pointer ${
                          termMonths === m
                            ? 'bg-white text-black border-white'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {m}T
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Lãi suất tham chiếu (APR)</span>
                    <span className="font-mono font-bold text-white">{interestApr}% / năm</span>
                  </div>
                  <input
                    type="range"
                    min="3.5"
                    max="10.5"
                    step="0.1"
                    value={interestApr}
                    onChange={(e) => setInterestApr(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/15 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400">Ước tính thanh toán hàng tháng</div>
                  <div className="font-mono text-3xl font-extrabold text-emerald-400 mt-1">
                    ${financeSummary.monthlyPayment.toLocaleString('en-US')}
                    <span className="text-sm font-normal text-slate-400"> / tháng</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Số tiền vay: ${financeSummary.loanPrincipal.toLocaleString('en-US')}
                  </div>
                </div>
                <button
                  onClick={() => openPreorder('deposit')}
                  className="py-3 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition cursor-pointer shrink-0"
                >
                  Đăng ký Hồ sơ Tài chính
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#040507] py-8 mt-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <span className="font-bold text-white">APEX MOTORS ATELIER</span> — Đại lý Siêu xe 3D
            Chính hãng & Trung tâm Lái thử Kỹ thuật số.
          </div>
          <div>Mô hình 3D thực tế chuẩn glTF/GLB PBR • Bảo hành Chính hãng Toàn cầu.</div>
        </div>
      </footer>

      {/* Modal đặt cọc & lịch hẹn VIP */}
      <DealershipOrderModal />
    </div>
  )
}

export default DealershipSections

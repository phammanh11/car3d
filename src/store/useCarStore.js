import { create } from 'zustand'

/**
 * Danh mục 4 mẫu Siêu xe 3D thực tế chuẩn .GLB (tải từ Sketchfab / Three.js Official Models)
 * kèm cấu hình thông số kỹ thuật, giá bán, vật liệu sơn nhận diện và các điểm Hotspot kỹ thuật 3D.
 */
export const SUPERCAR_CATALOG = [
  {
    id: 'ferrari-458',
    brand: 'FERRARI',
    name: 'Ferrari 458 Italia',
    trim: 'Atelier V8 Speciale',
    year: 2025,
    status: 'Sẵn xe giao ngay',
    badge: 'Flagship Showroom',
    mileage: '0 km (Brand New)',
    location: 'Saigon Flagship Atelier',
    modelUrl: '/models/ferrari.glb',
    // Chiều dài chuẩn hóa (~4.52m) và hướng xoay mũi xe về -Z
    targetLength: 4.52,
    rotationY: 0,
    basePrice: 450000,
    priceFormatted: '$450,000',
    engine: '4.5L V8 Tự nhiên',
    power: '670 HP',
    zeroToHundred: '2.9s',
    topSpeed: '335 km/h',
    torque: '540 Nm',
    drivetrain: 'RWD • 7-Speed F1 DCT',
    soundProfile: 'v8-flatplane',
    soundLabel: '4.5L V8 Flat-Plane F1 Scream (9,000 RPM)',
    exhaustPipes: [
      [-0.125, 0.35, 2.26],
      [0.0, 0.35, 2.26],
      [0.125, 0.35, 2.26],
    ],
    paintMaterialHints: ['body_color', 'body'],
    rimMaterialHints: ['metal_gray', 'metal_chrome'],
    description:
      'Tuyệt tác thiết kế Pininfarina với đường nét khí động học liền khối, khối động cơ V8 hút khí tự nhiên đạt vòng tua 9,000 RPM cùng lớp sơn Clearcoat đa tầng thủ công từ Maranello.',
    hotspots: [
      {
        id: 'engine',
        label: 'Động cơ V8 F136',
        position: [0, 0.96, 1.05],
        cameraPreset: 'rear',
        title: 'Động cơ đặt giữa 4.5L V8 F136',
        detail: 'Sản sinh 670 mã lực tại 9,000 RPM, tỷ số nén 12.5:1 và phản hồi chân ga tức thì chuẩn xe đua F1.',
      },
      {
        id: 'aero',
        label: 'Hốc gió Mũi xe',
        position: [0, 0.56, -1.95],
        cameraPreset: 'front',
        title: 'Cánh chia gió chủ động Aero-Elastics',
        detail: 'Tự biến dạng góc nghiêng theo áp suất gió ở tốc độ trên 200 km/h giúp giảm lực cản và tăng lực ép xuống mặt đường.',
      },
      {
        id: 'brakes',
        label: 'Phanh Carbon-Ceramic',
        position: [-0.88, 0.42, -1.25],
        cameraPreset: 'side',
        title: 'Hệ thống phanh Brembo CCM3',
        detail: 'Đĩa phanh gốm sợi carbon đường kính 398mm kết hợp cùm phanh 6 piston siêu nhẹ chống quá nhiệt trên đường đua.',
      },
      {
        id: 'cockpit',
        label: 'Khoang lái F1',
        position: [0.35, 1.08, -0.1],
        cameraPreset: '3/4',
        title: 'Khoang lái Monocoque Hợp kim Nhôm',
        detail: 'Bố trí nút bấm Manettino tích hợp trên vô lăng, ghế thể thao khung sợi carbon bọc da thủ công Ý.',
      },
    ],
  },
  {
    id: 'lambo-aventador',
    brand: 'LAMBORGHINI',
    name: 'Aventador LP700-4',
    trim: 'SV-Line V12',
    year: 2025,
    status: 'Sẵn xe giao ngay',
    badge: 'V12 Limited',
    mileage: '120 km (Exhibition)',
    location: 'Geneva Private Vault',
    modelUrl: '/models/lamborghini-aventador.glb',
    // Chiều dài chuẩn hóa (~4.78m) và xoay Math.PI để mũi xe hướng chuẩn về -Z
    targetLength: 4.78,
    rotationY: Math.PI,
    basePrice: 540000,
    priceFormatted: '$540,000',
    engine: '6.5L V12 L539',
    power: '780 HP',
    zeroToHundred: '2.5s',
    topSpeed: '355 km/h',
    torque: '720 Nm',
    drivetrain: 'AWD Haldex IV • ISR',
    soundProfile: 'v12-aventador',
    soundLabel: '6.5L V12 Metallic Roar & Decel Pops',
    exhaustPipes: [
      [-0.11, 0.37, 2.36],
      [0.11, 0.37, 2.36],
    ],
    paintMaterialHints: ['body'],
    rimMaterialHints: ['rims'],
    description:
      'Biểu tượng siêu xe V12 góc cạnh lấy cảm hứng từ tiêm kích tàng hình F-22. Khung gầm liền khối sợi Carbon Monocoque siêu cứng và hệ dẫn động 4 bánh toàn thời gian.',
    hotspots: [
      {
        id: 'v12',
        label: 'Khoang máy V12',
        position: [0, 0.98, 1.15],
        cameraPreset: 'rear',
        title: 'Khối động cơ 6.5L V12 Tự nhiên',
        detail: 'Cấu trúc 12 xi-lanh góc 60 độ tạo công suất 780 HP cùng âm thanh ống xả Titan đặc trưng.',
      },
      {
        id: 'nose',
        label: 'Đầu xe Y-Shape',
        position: [0, 0.52, -2.05],
        cameraPreset: 'front',
        title: 'Thiết kế mũi nhọn Y-Shape LED',
        detail: 'Hệ số cản gió tối ưu, hướng luồng khí qua nắp capo trực tiếp làm mát phanh và tản nhiệt kép.',
      },
      {
        id: 'monocoque',
        label: 'Khung Carbon',
        position: [0.85, 0.85, 0.15],
        cameraPreset: '3/4',
        title: 'Khung sườn Carbon Monocoque 147 kg',
        detail: 'Công nghệ đúc sợi carbon nguyên khối giúp trọng lượng khô chỉ 1,525 kg với độ cứng xoắn vượt trội.',
      },
    ],
  },
  {
    id: 'lambo-gallardo',
    brand: 'LAMBORGHINI',
    name: 'Gallardo Superleggera',
    trim: 'LP570-4 Corsa',
    year: 2024,
    status: 'Chứng nhận Chính hãng',
    badge: 'Collector Spec',
    mileage: '1,450 km (Certified)',
    location: 'Dubai Luxury Lounge',
    modelUrl: '/models/lamborghini-gallardo.glb',
    // Xoay bù góc nghiêng -33.84° của Sketchfab_model + 90° để mũi xe hướng chuẩn về -Z
    targetLength: 4.35,
    rotationY: 0.9802,
    basePrice: 385000,
    priceFormatted: '$385,000',
    engine: '5.2L V10 DOHC',
    power: '640 HP',
    zeroToHundred: '3.1s',
    topSpeed: '325 km/h',
    torque: '540 Nm',
    drivetrain: 'AWD • 6-Speed E-Gear',
    soundProfile: 'v10-gallardo',
    soundLabel: '5.2L V10 Odd-Fire Mechanical Growl',
    exhaustPipes: [
      [-0.58, 0.36, 2.13],
      [-0.45, 0.36, 2.13],
      [0.45, 0.36, 2.13],
      [0.58, 0.36, 2.13],
    ],
    paintMaterialHints: ['paint1mtl'],
    rimMaterialHints: ['rim1mtl', 'rim2mtl'],
    description:
      'Phiên bản giảm trọng lượng kinh điển với toàn bộ ốp cửa, cánh gió và khuếch tán bằng sợi Carbon thuần khiết. Sự cân bằng hoàn hảo giữa cảm giác lái cơ khí và sự chính xác đường đua.',
    hotspots: [
      {
        id: 'v10',
        label: 'Động cơ V10 5.2L',
        position: [0, 0.94, 1.05],
        cameraPreset: 'rear',
        title: 'Động cơ V10 5.2L Phun nhiên liệu trực tiếp',
        detail: 'Hợp tác phát triển kỹ thuật trọng lượng nhẹ, giúp cắt giảm 70kg so với bản tiêu chuẩn.',
      },
      {
        id: 'wheel',
        label: 'Mâm Rèn Nhôm Forged',
        position: [-0.88, 0.4, -1.2],
        cameraPreset: 'side',
        title: 'Bộ mâm 19-inch Rèn hợp kim siêu nhẹ',
        detail: 'Giảm 13kg khối lượng không treo (unsprung mass), cải thiện độ bám đường khi vào cua gắt.',
      },
    ],
  },
  {
    id: 'apex-concept',
    brand: 'APEX ATELIER',
    name: 'Apex Vision GT-X',
    trim: 'Prototype Hypercar',
    year: 2026,
    status: 'Đặt hàng Bespoke',
    badge: '1 of 12 Worldwide',
    mileage: '0 km (Commission)',
    location: 'Geneva Design Studio',
    modelUrl: '/models/concept-car.glb',
    // Xoay Math.PI để mũi xe hướng chuẩn về -Z
    targetLength: 4.7,
    rotationY: Math.PI,
    basePrice: 1250000,
    priceFormatted: '$1,250,000',
    engine: '4.0L V8 Tri-Hybrid',
    power: '1,200 HP',
    zeroToHundred: '1.9s',
    topSpeed: '402 km/h',
    torque: '1,180 Nm',
    drivetrain: 'Tri-Motor AWD Torque Vectoring',
    soundProfile: 'hybrid-hypercar',
    soundLabel: 'Tri-Hybrid V8 + Electric Turbine Whine + BOV',
    exhaustPipes: [
      [-0.35, 0.42, 2.24],
      [0.35, 0.42, 2.24],
    ],
    paintMaterialHints: ['carpaint'],
    rimMaterialHints: ['chrome', 'metal1'],
    description:
      'Hypercar thế hệ tương lai kết hợp động cơ đốt trong vòng tua cao và 3 mô-tơ điện điều biến mô-men xoắn độc lập từng bánh, thiết kế khí động học mặt đất Venturi.',
    hotspots: [
      {
        id: 'hybrid',
        label: 'Hệ thống Tri-Hybrid',
        position: [0, 0.9, 1.15],
        cameraPreset: 'rear',
        title: 'Truyền động Hybrid 1,200 Mã lực',
        detail: 'Tăng tốc 0–100 km/h chỉ 1.9 giây nhờ bù mô-men xoắn tức thời từ mô-tơ điện trục trước.',
      },
      {
        id: 'canopy',
        label: 'Vòm kính Thủy động học',
        position: [0, 1.05, -0.15],
        cameraPreset: '3/4',
        title: 'Khoang buồng lái Giọt nước (Teardrop Canopy)',
        detail: 'Tối ưu luồng khí đi qua nóc xe hướng thẳng xuống bộ khuếch tán sau cỡ lớn.',
      },
    ],
  },
]

/**
 * 6 Màu sơn cao cấp PBR dùng trong Configurator
 */
export const CAR_PAINTS = [
  {
    id: 'crimson',
    name: 'Rosso Corsa',
    shortName: 'Đỏ Đua',
    finish: 'Gloss Clearcoat',
    hex: '#c8102e',
    swatch: '#dc2626',
    metalness: 0.55,
    roughness: 0.16,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    priceDelta: 0,
  },
  {
    id: 'matte-black',
    name: 'Nero Stealth Matte',
    shortName: 'Đen Nhám',
    finish: 'Satin Carbon Matte',
    hex: '#1c1e24',
    swatch: '#18181b',
    metalness: 0.35,
    roughness: 0.68,
    clearcoat: 0.15,
    clearcoatRoughness: 0.62,
    priceDelta: 8500,
  },
  {
    id: 'silver',
    name: 'Argento Titanium',
    shortName: 'Bạc Titan',
    finish: 'Liquid Metallic',
    hex: '#cbd5e1',
    swatch: '#cbd5e1',
    metalness: 0.9,
    roughness: 0.14,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    priceDelta: 4500,
  },
  {
    id: 'gold',
    name: 'Giallo Modena',
    shortName: 'Vàng Ngọc',
    finish: 'Tri-Coat Pearl',
    hex: '#eab308',
    swatch: '#eab308',
    metalness: 0.6,
    roughness: 0.16,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    priceDelta: 6000,
  },
  {
    id: 'emerald',
    name: 'Verde Mantis',
    shortName: 'Xanh Lá',
    finish: 'Ad Personam Pearl',
    hex: '#22c55e',
    swatch: '#22c55e',
    metalness: 0.52,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    priceDelta: 12000,
  },
  {
    id: 'sapphire',
    name: 'Blu Elettrico',
    shortName: 'Xanh Lam',
    finish: 'Deep Chrome Tint',
    hex: '#1d4ed8',
    swatch: '#2563eb',
    metalness: 0.72,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    priceDelta: 9500,
  },
]

/**
 * Tùy chọn màu mâm xe Forged Alloy
 */
export const RIM_FINISHES = [
  { id: 'silver-forged', name: 'Hợp kim Phay Bóng', hex: '#d4d4d8', metalness: 0.95, roughness: 0.18, priceDelta: 0 },
  { id: 'satin-bronze', name: 'Đồng Satin Forged', hex: '#b48a4e', metalness: 0.9, roughness: 0.28, priceDelta: 4200 },
  { id: 'gloss-black', name: 'Đen Đúc Carbon', hex: '#18181b', metalness: 0.75, roughness: 0.25, priceDelta: 3500 },
]

/**
 * Các gói trang bị thêm chuẩn đại lý siêu xe
 */
export const OPTION_PACKAGES = [
  {
    id: 'carbon-track',
    name: 'Carbon Aero Track Package',
    desc: 'Cánh chia gió, ốp sườn, khuếch tán sau sợi carbon đúc nguyên khối + giảm 18kg.',
    price: 28000,
  },
  {
    id: 'titanium-exhaust',
    name: 'Akrapovič Titanium Exhaust',
    desc: 'Hệ thống ống xả Titan van biến thiên giảm 9kg và tăng +18 HP dải tua cao.',
    price: 12500,
  },
  {
    id: 'bespoke-interior',
    name: 'Alcantara Atelier Stitching',
    desc: 'Nội thất Alcantara khâu tay chỉ tương phản + khắc tên chủ sở hữu trên bệ cửa.',
    price: 9800,
  },
]

/**
 * Các góc Camera chuẩn Showroom bán xe
 */
export const CAMERA_PRESETS = [
  { id: '3/4', label: 'Góc 3/4', position: [4.6, 1.85, 5.1], target: [0, 0.55, 0] },
  { id: 'side', label: 'Hông xe', position: [6.4, 1.25, 0.05], target: [0, 0.55, 0] },
  { id: 'front', label: 'Đầu xe', position: [0.0, 1.3, -5.8], target: [0, 0.55, -0.4] },
  { id: 'rear', label: 'Đuôi & Máy', position: [0.6, 1.45, 5.7], target: [0, 0.6, 0.4] },
  { id: 'top', label: 'Từ trên cao', position: [0.01, 6.2, 2.2], target: [0, 0.35, 0] },
]

const STORAGE_KEY = 'apex_supercar_orders_v2'

function loadSavedOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistOrders(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // Ignore storage block
  }
}

export const useCarStore = create((set, get) => ({
  // Chế độ chính: 'showroom' (Trang bán xe & Configurator 3D) | 'testdrive' (Lái thử 3D)
  mode: 'showroom',

  // Mẫu xe đang chọn
  selectedCarId: SUPERCAR_CATALOG[0].id,

  // URL file GLB/GLTF tùy chỉnh do người dùng tải lên từ Sketchfab (Blob URL)
  customModelUrl: null,
  customModelName: '',

  // Màu sơn & Mâm xe & Gói trang bị
  paint: CAR_PAINTS[0],
  rimFinish: RIM_FINISHES[0],
  selectedPackages: ['carbon-track'],

  // Điều khiển Showroom 3D
  autoRotate: true,
  showroomEnv: 'studio',
  cameraPreset: '3/4',
  cameraPresetTick: 0,
  activeHotspotId: null,
  showHotspots: true,

  // Audio & Camera trong chế độ Lái thử 3D & Nẹt pô thử lửa ống xả
  soundEnabled: true,
  cameraView: 'chase',
  resetTrigger: 0,
  revPulseUntil: 0,

  // Telemetry Lái thử 3D
  telemetry: {
    speed: 0,
    rpm: 850,
    gear: 'N',
    isBraking: false,
    isDrifting: false,
    distance: 0,
    topSpeed: 0,
  },

  virtualInput: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
  },

  // Modal đặt cọc / đăng ký tư vấn / so sánh xe
  preorderOpen: false,
  preorderIntent: 'deposit', // 'deposit' | 'vip-viewing'
  orders: loadSavedOrders(),

  // Helper getter lấy thông tin xe hiện tại
  getActiveCar: () => {
    const id = get().selectedCarId
    return SUPERCAR_CATALOG.find((c) => c.id === id) || SUPERCAR_CATALOG[0]
  },

  // Tính tổng giá xe kèm màu sơn, mâm và gói trang bị
  getTotalPrice: () => {
    const state = get()
    const car = SUPERCAR_CATALOG.find((c) => c.id === state.selectedCarId) || SUPERCAR_CATALOG[0]
    const pkgSum = state.selectedPackages.reduce((sum, pkgId) => {
      const pkg = OPTION_PACKAGES.find((p) => p.id === pkgId)
      return sum + (pkg ? pkg.price : 0)
    }, 0)
    return car.basePrice + (state.paint?.priceDelta || 0) + (state.rimFinish?.priceDelta || 0) + pkgSum
  },

  // Actions
  selectCar: (carId) => {
    const prevCustom = get().customModelUrl
    if (prevCustom && prevCustom.startsWith('blob:')) {
      URL.revokeObjectURL(prevCustom)
    }
    set({
      selectedCarId: carId,
      customModelUrl: null,
      customModelName: '',
      activeHotspotId: null,
      cameraPreset: '3/4',
      cameraPresetTick: get().cameraPresetTick + 1,
    })
  },

  setCustomModel: (blobUrl, fileName) => {
    const prevCustom = get().customModelUrl
    if (prevCustom && prevCustom.startsWith('blob:')) {
      URL.revokeObjectURL(prevCustom)
    }
    set({
      customModelUrl: blobUrl,
      customModelName: fileName,
      activeHotspotId: null,
      cameraPreset: '3/4',
      cameraPresetTick: get().cameraPresetTick + 1,
    })
  },

  clearCustomModel: () => {
    const prevCustom = get().customModelUrl
    if (prevCustom && prevCustom.startsWith('blob:')) {
      URL.revokeObjectURL(prevCustom)
    }
    set({ customModelUrl: null, customModelName: '' })
  },

  setPaint: (paintId) => {
    const found = CAR_PAINTS.find((p) => p.id === paintId)
    if (found) set({ paint: found })
  },

  setRimFinish: (rimId) => {
    const found = RIM_FINISHES.find((r) => r.id === rimId)
    if (found) set({ rimFinish: found })
  },

  togglePackage: (pkgId) =>
    set((s) => {
      const exists = s.selectedPackages.includes(pkgId)
      return {
        selectedPackages: exists
          ? s.selectedPackages.filter((id) => id !== pkgId)
          : [...s.selectedPackages, pkgId],
      }
    }),

  setCameraPreset: (presetId) =>
    set((s) => ({
      cameraPreset: presetId,
      cameraPresetTick: s.cameraPresetTick + 1,
      autoRotate: false,
    })),

  setActiveHotspot: (hotspotId) =>
    set((s) => {
      if (!hotspotId) return { activeHotspotId: null }
      const car = SUPERCAR_CATALOG.find((c) => c.id === s.selectedCarId) || SUPERCAR_CATALOG[0]
      const spot = car.hotspots.find((h) => h.id === hotspotId)
      return {
        activeHotspotId: hotspotId,
        autoRotate: false,
        cameraPreset: spot?.cameraPreset || s.cameraPreset,
        cameraPresetTick: s.cameraPresetTick + 1,
      }
    }),

  toggleHotspots: () => set((s) => ({ showHotspots: !s.showHotspots, activeHotspotId: null })),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  setShowroomEnv: (showroomEnv) => set({ showroomEnv }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  triggerShowroomRev: () => set({ revPulseUntil: performance.now() + 1450 }),

  setMode: (mode) =>
    set({
      mode,
      activeHotspotId: null,
      telemetry: {
        speed: 0,
        rpm: 850,
        gear: 'N',
        isBraking: false,
        isDrifting: false,
        distance: 0,
        topSpeed: 0,
      },
      virtualInput: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        brake: false,
      },
    }),

  cycleCameraView: () =>
    set((s) => {
      const order = ['chase', 'far', 'hood']
      const nextIdx = (order.indexOf(s.cameraView) + 1) % order.length
      return { cameraView: order[nextIdx] }
    }),

  triggerResetCar: () =>
    set((s) => ({
      resetTrigger: s.resetTrigger + 1,
      telemetry: {
        ...s.telemetry,
        speed: 0,
        rpm: 850,
        gear: 'N',
        isBraking: false,
        isDrifting: false,
      },
    })),

  updateTelemetry: (next) =>
    set((s) => ({
      telemetry: {
        ...s.telemetry,
        ...next,
        topSpeed: Math.max(s.telemetry.topSpeed, next.speed ?? 0),
      },
    })),

  setVirtualKey: (key, value) =>
    set((s) => ({
      virtualInput: {
        ...s.virtualInput,
        [key]: value,
      },
    })),

  openPreorder: (intent = 'deposit') => set({ preorderOpen: true, preorderIntent: intent }),
  closePreorder: () => set({ preorderOpen: false }),

  submitPreorder: (payload) => {
    const state = get()
    const car = state.getActiveCar()
    const totalPrice = state.getTotalPrice()
    const newOrder = {
      id: `APX-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      carName: state.customModelName ? `Sketchfab Custom (${state.customModelName})` : `${car.name} (${car.trim})`,
      paintName: state.paint.name,
      paintHex: state.paint.hex,
      rimName: state.rimFinish.name,
      packagesCount: state.selectedPackages.length,
      totalPriceFormatted: `$${totalPrice.toLocaleString('en-US')}`,
      intent: state.preorderIntent,
      ...payload,
    }
    const updated = [newOrder, ...state.orders]
    persistOrders(updated)
    set({ orders: updated })
    return newOrder
  },
}))

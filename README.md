# car3d

Website bán siêu xe 3D cao cấp (**APEX MOTORS ATELIER**) tích hợp phòng trưng bày tương tác, cấu hình màu sơn/mâm xe thời gian thực và chế độ **Lái thử nghiệm 3D (Interactive Test Drive)** trực tiếp trên trình duyệt.

## Công nghệ sử dụng
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Zustand
- **3D WebGL:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Vật lý 4 bánh:** `@react-three/cannon` (`useRaycastVehicle`)
- **Âm thanh động cơ:** Web Audio API (V8 Flat-Plane, V12 Aventador, V10 Gallardo, Tri-Hybrid Hypercar)
- **Hiệu ứng:** Khói lốp & khói xả 3D thể tích (`InstancedMesh`), lửa ống pô Afterburner đa tầng, vết lốp (`Skid Marks`)

## Cài đặt & Chạy cục bộ
```bash
npm install --legacy-peer-deps
npm run dev
```

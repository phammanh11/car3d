import React, { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Html, Loader } from '@react-three/drei'
import Showroom from './components/Showroom'
import DrivableCar from './components/DrivableCar'
import DealershipSections, { TestDriveHUD } from './components/UIOverlay'
import { useCarStore } from './store/useCarStore'

function CameraModeController({ mode }) {
  const { camera } = useThree()

  useEffect(() => {
    if (mode === 'showroom') {
      camera.position.set(4.6, 1.85, 5.1)
      camera.lookAt(0, 0.55, 0)
    } else {
      camera.position.set(0, 3.0, 7.0)
      camera.lookAt(0, 0.8, 0)
    }
  }, [mode, camera])

  return null
}

function ModelLoadingFallback() {
  return (
    <Html center>
      <div className="glass-panel rounded-2xl px-4 py-2.5 text-xs font-mono text-white whitespace-nowrap flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
        <span>Đang nạp mô hình siêu xe 3D (.GLB)...</span>
      </div>
    </Html>
  )
}

export function App() {
  const mode = useCarStore((s) => s.mode)

  if (mode === 'testdrive') {
    return (
      <main className="relative w-screen h-screen overflow-hidden bg-[#0b111e]">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 3.0, 7.0], fov: 44, near: 0.1, far: 450 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <CameraModeController mode="testdrive" />
          <Suspense fallback={<ModelLoadingFallback />}>
            <DrivableCar />
          </Suspense>
        </Canvas>
        <TestDriveHUD />
      </main>
    )
  }

  return (
    <DealershipSections
      children3DCanvas={
        <>
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [4.6, 1.85, 5.1], fov: 38, near: 0.1, far: 200 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
          >
            <CameraModeController mode="showroom" />
            <Suspense fallback={<ModelLoadingFallback />}>
              <Showroom />
            </Suspense>
          </Canvas>
          <Loader
            containerStyles={{
              position: 'absolute',
              backgroundColor: 'rgba(5,6,8,0.85)',
              zIndex: 30,
            }}
            innerStyles={{ width: '220px', backgroundColor: 'rgba(255,255,255,0.12)' }}
            barStyles={{ backgroundColor: '#dc2626', height: '3px' }}
            dataStyles={{
              color: '#e2e8f0',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
            }}
            dataInterpolation={(p) => `APEX 3D STUDIO // ${p.toFixed(0)}%`}
          />
        </>
      }
    />
  )
}

export default App

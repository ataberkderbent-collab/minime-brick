'use client';

import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { type FigurSecimi, figurAdi } from '@/lib/katalog';
import { FigurModel } from './Figur';
import Studyo from './Studyo';

/** Tek bir figürü büyütüp her yönden döndürerek gösteren pencere. */
export default function Inceleme({ figur, onKapat }: { figur: FigurSecimi; onKapat: () => void }) {
  const ad = figur.isim.trim() ? `${figurAdi(figur)} · ${figur.isim}` : figurAdi(figur);
  useEffect(() => {
    const tus = (e: KeyboardEvent) => e.key === 'Escape' && onKapat();
    window.addEventListener('keydown', tus);
    return () => window.removeEventListener('keydown', tus);
  }, [onKapat]);

  return (
    <div className="inceleme-perde" onClick={onKapat} role="dialog" aria-modal="true" aria-label={`${ad} 3B inceleme`}>
      <div className="inceleme" onClick={(e) => e.stopPropagation()}>
        <div className="inceleme-baslik">
          <div>
            <strong>{ad}</strong>
            <span>Sürükleyerek döndürün · tekerlek ya da iki parmakla yakınlaştırın</span>
          </div>
          <button type="button" className="kapat" onClick={onKapat} aria-label="Kapat">
            ×
          </button>
        </div>
        <Canvas shadows dpr={[1.5, 2.5]} camera={{ position: [0, 2.6, 8.4], fov: 32 }} gl={{ preserveDrawingBuffer: true, antialias: true }}>
          <Studyo />
          <ambientLight intensity={0.35} />
          <directionalLight position={[4, 8, 6]} intensity={1.6} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0003} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={6} shadow-camera-bottom={-3} />
          <directionalLight position={[-6, 3, -4]} intensity={0.5} color="#ffd9a8" />
          <group position={[0, -2.1, 0]}>
            <Suspense fallback={null}>
              <FigurModel secim={figur} />
            </Suspense>
            {/* Döner tabla */}
            <mesh position={[0, -0.06, 0]} receiveShadow>
              <cylinderGeometry args={[2.6, 2.8, 0.12, 64]} />
              <meshStandardMaterial color="#231d19" roughness={0.6} metalness={0.1} />
            </mesh>
          </group>
          <ContactShadows position={[0, -2.15, 0]} opacity={0.5} scale={9} blur={2.2} far={4} />
          <OrbitControls autoRotate autoRotateSpeed={1.6} enablePan={false} minDistance={4.5} maxDistance={14} minPolarAngle={0.5} maxPolarAngle={1.75} target={[0, 0.1, 0]} />
        </Canvas>
      </div>
    </div>
  );
}

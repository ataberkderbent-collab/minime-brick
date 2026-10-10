'use client';

import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { type FigurSecimi, figurAdi } from '@/lib/katalog';
import { FigurModel } from './Figur';

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
        <Canvas flat shadows dpr={[1, 2]} camera={{ position: [0, 3.2, 9], fov: 35 }} gl={{ preserveDrawingBuffer: true }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 9, 7]} intensity={2} castShadow shadow-mapSize={[1024, 1024]} />
          <directionalLight position={[-6, 3, -5]} intensity={0.6} />
          <group position={[0, -1.9, 0]} scale={1.0}>
            <Suspense fallback={null}>
              <FigurModel secim={figur} />
            </Suspense>
          </group>
          <ContactShadows position={[0, -1.9, 0]} opacity={0.35} scale={9} blur={2.4} far={4} />
          <OrbitControls autoRotate autoRotateSpeed={2.2} enablePan={false} minDistance={5} maxDistance={16} target={[0, 0.2, 0]} />
        </Canvas>
      </div>
    </div>
  );
}

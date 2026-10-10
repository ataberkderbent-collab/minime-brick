'use client';

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { SABLONLAR, cerceveBul, icOlcu } from '@/lib/katalog';
import { CerceveSahnesi } from './Sahne';

// Giriş bölümündeki vitrin: bitmiş bir çerçeve havada süzülür, kendi kendine döner;
// kullanıcı sürükleyince kontrol onda. Tıklama yok.
export default function HeroSahne({ className }: { className?: string }) {
  const s = SABLONLAR[0];
  const cerceve = cerceveBul(s.cerceve);
  const { en, boy } = icOlcu(cerceve);
  const dis = Math.max(boy + 2 * cerceve.kenar, (en + 2 * cerceve.kenar) / 1.1);
  const uzaklik = (1.12 * dis) / (2 * Math.tan((30 / 2) * (Math.PI / 180)));
  const [dokunuldu, setDokunuldu] = useState(false);

  return (
    <div className={className} onPointerDown={() => setDokunuldu(true)}>
      <Canvas flat shadows dpr={[1, 1.75]} camera={{ position: [uzaklik * 0.35, uzaklik * 0.12, uzaklik], fov: 30, near: 1, far: 600 }} gl={{ antialias: true, alpha: true }}>
        <Float speed={1.4} rotationIntensity={0.18} floatIntensity={0.9} floatingRange={[-0.6, 0.6]}>
          <group rotation={[0, -0.22, 0]}>
            <CerceveSahnesi
              cerceve={cerceve}
              cerceveRengi="siyah"
              kart={{ tur: 'hazir', id: s.kart, baslik: s.baslik, altYazi: s.altYazi }}
              figurler={s.figurler}
              seciliSlot={null}
              cam
              onSlot={() => {}}
              onFigur={() => {}}
            />
          </group>
        </Float>
        <OrbitControls
          makeDefault
          autoRotate={!dokunuldu}
          autoRotateSpeed={0.6}
          enableZoom={false}
          enablePan={false}
          minAzimuthAngle={-0.8}
          maxAzimuthAngle={0.8}
          minPolarAngle={1.1}
          maxPolarAngle={1.9}
        />
      </Canvas>
    </div>
  );
}

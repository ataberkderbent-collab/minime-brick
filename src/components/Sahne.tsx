'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { CERCEVE_RENKLERI, type Cerceve, type CerceveRengiId, type FigurSecimi, type KartId, icOlcu, yerlesim } from '@/lib/katalog';
import { FigurModel } from './Figur';
import { kartTuvali } from './arkaplan';
import Studyo from './Studyo';

export type Kart = { tur: 'hazir'; id: KartId; baslik: string; altYazi: string } | { tur: 'yukle'; url: string; ad: string };

const PASPARTU_RENGI = '#fbfaf5';
const PASPARTU_KALINLIK = 0.25;
const FIGUR_DERINLIK = 0.46;

function imleci(acik: boolean) {
  document.body.style.cursor = acik ? 'pointer' : 'auto';
}

function useKartDokusu(kart: Kart, cerceve: Cerceve, figurler: FigurSecimi[]) {
  const [doku, setDoku] = useState<THREE.Texture | null>(null);
  const yer = useMemo(() => yerlesim(cerceve, figurler.length), [cerceve, figurler.length]);
  // Yazılar değişince tuval yeniden çizilir
  const anahtar =
    kart.tur === 'hazir'
      ? JSON.stringify([kart.id, kart.baslik, kart.altYazi, cerceve.id, figurler.map((f) => f.isim)])
      : `y:${kart.url}:${cerceve.id}`;

  useEffect(() => {
    let iptal = false;
    let yuklenen: THREE.Texture | null = null;
    if (kart.tur === 'hazir') {
      const tuval = kartTuvali(kart.id, {
        baslik: kart.baslik,
        altYazi: kart.altYazi,
        baskiEn: cerceve.baskiEn,
        baskiBoy: cerceve.baskiBoy,
        isimler: figurler.map((f, i) => ({ x: yer.xler[i], y: yer.isimY, metin: f.isim })),
      });
      yuklenen = new THREE.CanvasTexture(tuval);
      yuklenen.colorSpace = THREE.SRGBColorSpace;
      yuklenen.anisotropy = 8;
      setDoku(yuklenen);
    } else {
      new THREE.TextureLoader().load(kart.url, (t) => {
        if (iptal) {
          t.dispose();
          return;
        }
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        // Baskı alanını dolduracak biçimde ortadan kırp (yukleme.ts ile aynı kural)
        const oran = cerceve.baskiEn / cerceve.baskiBoy;
        const img = t.image as { width: number; height: number };
        const fotoOran = img.width / img.height;
        if (fotoOran > oran) {
          t.repeat.set(oran / fotoOran, 1);
          t.offset.set((1 - oran / fotoOran) / 2, 0);
        } else {
          t.repeat.set(1, fotoOran / oran);
          t.offset.set(0, (1 - fotoOran / oran) / 2);
        }
        yuklenen = t;
        setDoku(t);
      });
    }
    return () => {
      iptal = true;
      yuklenen?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anahtar]);

  return doku;
}

function Kutu({ p, s, c, kaba = 0.55 }: { p: [number, number, number]; s: [number, number, number]; c: string; kaba?: number }) {
  return (
    <mesh position={p} receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={kaba} />
    </mesh>
  );
}

export interface SahneIciProps {
  cerceve: Cerceve;
  cerceveRengi: CerceveRengiId;
  kart: Kart;
  figurler: FigurSecimi[];
  seciliSlot: number | null;
  cam: boolean;
  onSlot: (i: number) => void;
  onFigur: (i: number) => void;
}

export function CerceveSahnesi({ cerceve, cerceveRengi, kart, figurler, seciliSlot, cam, onSlot, onFigur }: SahneIciProps) {
  const { en: W, boy: H } = icOlcu(cerceve);
  const D = cerceve.derinlik;
  const k = cerceve.kenar;
  const bw = cerceve.baskiEn;
  const bh = cerceve.baskiBoy;
  const renk = CERCEVE_RENKLERI.find((r) => r.id === cerceveRengi)?.renk ?? '#f3f0e8';
  const doku = useKartDokusu(kart, cerceve, figurler);
  const yer = useMemo(() => yerlesim(cerceve, figurler.length), [cerceve, figurler.length]);

  const kartZ = -D / 2 + 0.3;
  const pasZ = kartZ + PASPARTU_KALINLIK / 2;
  const matYatay = (W - bw) / 2;
  const matDikey = (H - bh) / 2;

  return (
    <>
      <Studyo siddet={0.8} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[-W, H * 0.2, 20]} intensity={0.45} color="#ffd9a8" />
      <directionalLight
        position={[W * 0.4, H * 0.7, 40]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-W}
        shadow-camera-right={W}
        shadow-camera-top={H}
        shadow-camera-bottom={-H}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-bias={-0.0004}
      />

      {/* Çerçeve gövdesi */}
      <Kutu p={[0, H / 2 + k / 2, 0]} s={[W + 2 * k, k, D + 0.4]} c={renk} />
      <Kutu p={[0, -H / 2 - k / 2, 0]} s={[W + 2 * k, k, D + 0.4]} c={renk} />
      <Kutu p={[-W / 2 - k / 2, 0, 0]} s={[k, H, D + 0.4]} c={renk} />
      <Kutu p={[W / 2 + k / 2, 0, 0]} s={[k, H, D + 0.4]} c={renk} />
      {/* İç duvarlar: kartın arkasındaki zemin */}
      <Kutu p={[0, 0, kartZ - 0.1]} s={[W, H, 0.1]} c={PASPARTU_RENGI} kaba={0.9} />

      {/* Baskılı kart */}
      <mesh position={[0, 0, kartZ]} receiveShadow>
        <planeGeometry args={[bw, bh]} />
        <meshStandardMaterial map={doku} emissive="#ffffff" emissiveMap={doku} emissiveIntensity={0.55} color={doku ? '#ffffff' : '#e8e2d6'} roughness={0.9} />
      </mesh>

      {/* Paspartu: kartın etrafını örten karton */}
      {matDikey > 0.01 && (
        <>
          <Kutu p={[0, bh / 2 + matDikey / 2, pasZ]} s={[W, matDikey, PASPARTU_KALINLIK]} c={PASPARTU_RENGI} kaba={0.9} />
          <Kutu p={[0, -bh / 2 - matDikey / 2, pasZ]} s={[W, matDikey, PASPARTU_KALINLIK]} c={PASPARTU_RENGI} kaba={0.9} />
        </>
      )}
      {matYatay > 0.01 && (
        <>
          <Kutu p={[-bw / 2 - matYatay / 2, 0, pasZ]} s={[matYatay, bh, PASPARTU_KALINLIK]} c={PASPARTU_RENGI} kaba={0.9} />
          <Kutu p={[bw / 2 + matYatay / 2, 0, pasZ]} s={[matYatay, bh, PASPARTU_KALINLIK]} c={PASPARTU_RENGI} kaba={0.9} />
        </>
      )}

      {/* Figürler kartın üstüne yapıştırılmış */}
      {figurler.map((f, i) => {
        const secili = seciliSlot === i;
        const x = yer.xler[i];
        const tamam = f.tur === 'hayvan' ? !!f.hayvan : !!(f.yuz && f.ust && f.alt);
        return (
          <group key={i} position={[x, 0, kartZ]}>
            <mesh
              position={[0, yer.ayakY + 2.0, 0.03]}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                onSlot(i);
              }}
              onPointerOver={() => imleci(true)}
              onPointerOut={() => imleci(false)}
            >
              <planeGeometry args={[Math.min(yer.aralik - 0.2, 3.6), 5.4]} />
              <meshBasicMaterial color="#7d756a" transparent opacity={tamam ? 0 : 0.14} />
            </mesh>
            {/* Seçili figür: ayağının altında ince halka */}
            {secili && (
              <mesh position={[0, yer.ayakY + 0.02, 0.05]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
                <ringGeometry args={[1.05, 1.22, 48]} />
                <meshBasicMaterial color="#e2503a" transparent opacity={0.85} side={THREE.DoubleSide} />
              </mesh>
            )}
            {tamam && (
              <group
                position={[0, yer.ayakY, FIGUR_DERINLIK]}
                onClick={(e: ThreeEvent<MouseEvent>) => {
                  e.stopPropagation();
                  onFigur(i);
                }}
                onPointerOver={() => imleci(true)}
                onPointerOut={() => imleci(false)}
              >
                <Suspense fallback={null}>
                  <FigurModel secim={f} />
                </Suspense>
              </group>
            )}
          </group>
        );
      })}

      {/* Çerçevenin arkasına düşen yumuşak gölge (koyu stüdyo zemini) */}
      <ContactShadows position={[0, -H / 2 - k - 0.6, 0]} opacity={0.55} scale={Math.max(W, H) * 2.2} blur={2.6} far={12} color="#000000" />

      {/* Ön cam (tıklamayı engellemez) */}
      {cam && (
        <mesh position={[0, 0, D / 2 - 0.02]} raycast={() => null}>
          <planeGeometry args={[W, H]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.07} roughness={0.05} metalness={0} />
        </mesh>
      )}
    </>
  );
}

export interface SahneProps extends SahneIciProps {
  className?: string;
}

export default function Sahne({ className, ...rest }: SahneProps) {
  const { cerceve } = rest;
  const { en, boy } = icOlcu(cerceve);
  const dis = Math.max(boy + 2 * cerceve.kenar, (en + 2 * cerceve.kenar) / 1.3);
  const uzaklik = (1.22 * dis) / (2 * Math.tan((35 / 2) * (Math.PI / 180)));

  return (
    <div className={className}>
      <Canvas
        key={cerceve.id}
        shadows
        dpr={[1, 2]}
        camera={{ position: [uzaklik * 0.28, uzaklik * 0.12, uzaklik * 0.96], fov: 35, near: 1, far: 600 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        onPointerMissed={() => imleci(false)}
      >
        <CerceveSahnesi {...rest} />
        <OrbitControls
          makeDefault
          enablePan={false}
          minAzimuthAngle={-0.9}
          maxAzimuthAngle={0.9}
          minPolarAngle={0.9}
          maxPolarAngle={2.15}
          minDistance={uzaklik * 0.3}
          maxDistance={uzaklik * 1.4}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}

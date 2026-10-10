'use client';

import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { type ArkaPlanId, type Cerceve, figurBul, icOlcu } from '@/lib/katalog';
import { FigurModel } from './Figur';
import { arkaPlanTuvali } from './arkaplan';

export type ArkaPlan = { tur: 'hazir'; id: ArkaPlanId } | { tur: 'yukle'; url: string; ad: string };

const KENAR_RENGI = '#f4f1ea';
const ZEMIN_KALINLIK = 0.6;
/** Figürler arası en geniş aralık (cm); az figürde yan yana toplanır */
const EN_GENIS_ARALIK = 5.5;

function imleci(acik: boolean) {
  document.body.style.cursor = acik ? 'pointer' : 'auto';
}

function useArkaPlanDokusu(kaynak: ArkaPlan, oran: number) {
  const [doku, setDoku] = useState<THREE.Texture | null>(null);
  const anahtar = kaynak.tur === 'hazir' ? `h:${kaynak.id}:${oran.toFixed(3)}` : `y:${kaynak.url}:${oran.toFixed(3)}`;

  useEffect(() => {
    let iptal = false;
    let yuklenen: THREE.Texture | null = null;
    if (kaynak.tur === 'hazir') {
      yuklenen = new THREE.CanvasTexture(arkaPlanTuvali(kaynak.id, oran));
      yuklenen.colorSpace = THREE.SRGBColorSpace;
      yuklenen.anisotropy = 8;
      setDoku(yuklenen);
    } else {
      new THREE.TextureLoader().load(kaynak.url, (t) => {
        if (iptal) {
          t.dispose();
          return;
        }
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        // Çerçeveyi dolduracak biçimde ortadan kırp (yukleme.ts ile aynı kural)
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

function Kutu({ p, s, c = KENAR_RENGI }: { p: [number, number, number]; s: [number, number, number]; c?: string }) {
  return (
    <mesh position={p} receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={0.55} />
    </mesh>
  );
}

interface CerceveSahnesiProps {
  cerceve: Cerceve;
  arkaPlan: ArkaPlan;
  slotlar: (string | null)[];
  seciliSlot: number | null;
  cam: boolean;
  onSlot: (i: number) => void;
  onFigur: (figurId: string) => void;
}

function CerceveSahnesi({ cerceve, arkaPlan, slotlar, seciliSlot, cam, onSlot, onFigur }: CerceveSahnesiProps) {
  const { en: W, boy: H } = icOlcu(cerceve);
  const D = cerceve.derinlik;
  const k = cerceve.kenar;
  const doku = useArkaPlanDokusu(arkaPlan, W / H);

  const n = slotlar.length;
  const aralik = Math.min(W / n, EN_GENIS_ARALIK);
  const zeminY = -H / 2 + ZEMIN_KALINLIK;
  const figurZ = -D / 2 + 1.7;
  const konumlar = useMemo(() => slotlar.map((_, i) => (i - (n - 1) / 2) * aralik), [slotlar, n, aralik]);

  return (
    <>
      <ambientLight intensity={1.25} />
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
      <Kutu p={[0, H / 2 + k / 2, 0]} s={[W + 2 * k, k, D + 0.4]} />
      <Kutu p={[0, -H / 2 - k / 2, 0]} s={[W + 2 * k, k, D + 0.4]} />
      <Kutu p={[-W / 2 - k / 2, 0, 0]} s={[k, H, D + 0.4]} />
      <Kutu p={[W / 2 + k / 2, 0, 0]} s={[k, H, D + 0.4]} />

      {/* Arka tasarım baskısı */}
      <mesh position={[0, 0, -D / 2]} receiveShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial
          map={doku}
          emissive="#ffffff"
          emissiveMap={doku}
          emissiveIntensity={0.55}
          color={doku ? '#ffffff' : '#d8d2c6'}
          roughness={0.9}
        />
      </mesh>

      {/* Figürlerin durduğu zemin */}
      <Kutu p={[0, -H / 2 + ZEMIN_KALINLIK / 2, 0]} s={[W, ZEMIN_KALINLIK, D - 0.1]} c="#efe9dc" />

      {slotlar.map((figurId, i) => {
        const figur = figurId ? figurBul(figurId) : undefined;
        const x = konumlar[i];
        const secili = seciliSlot === i;
        return (
          <group key={i} position={[x, zeminY, figurZ]}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.02, 0]}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                onSlot(i);
              }}
              onPointerOver={() => imleci(true)}
              onPointerOut={() => imleci(false)}
            >
              <ringGeometry args={[1.25, secili ? 1.75 : 1.55, 40]} />
              <meshBasicMaterial color={secili ? '#d6402b' : '#9b9384'} transparent opacity={figur && !secili ? 0.25 : 0.9} side={THREE.DoubleSide} />
            </mesh>
            {figur && (
              <group
                onClick={(e: ThreeEvent<MouseEvent>) => {
                  e.stopPropagation();
                  onFigur(figur.id);
                }}
                onPointerOver={() => imleci(true)}
                onPointerOut={() => imleci(false)}
              >
                <FigurModel figur={figur} />
              </group>
            )}
          </group>
        );
      })}

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

export interface SahneProps extends CerceveSahnesiProps {
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
        camera={{ position: [0, 0, uzaklik], fov: 35, near: 1, far: 600 }}
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
          minDistance={uzaklik * 0.35}
          maxDistance={uzaklik * 1.4}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}

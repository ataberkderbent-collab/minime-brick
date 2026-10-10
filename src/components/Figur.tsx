'use client';

import { Suspense } from 'react';
import * as THREE from 'three';
import { Billboard, RoundedBox, useTexture } from '@react-three/drei';
import { type FigurSecimi, type Hayvan, type KisiSecimi, hayvanBul, parcaBul, sacStili } from '@/lib/katalog';

// Figürler: gövde kutuları katalogdaki parçanın rengiyle, ÖN YÜZ ise Shopier'daki gerçek parça
// görselleriyle kaplanır (yüz silindire sarılır, üst gövde ve aksesuar düzlem olarak).
// Gerçek 3B modeller (GLB) hazır olunca bu dosyadaki çizimler modelle değiştirilir; çağıran yerler aynı kalır.
// Ayağın bastığı nokta (0,0,0); boy yaklaşık 4 cm.

const TEN = '#ffd34d';
const SIYAH = '#1c1c1c';

function Parca({ p, s, c, r = 0.07, rot }: { p: [number, number, number]; s: [number, number, number]; c: string; r?: number; rot?: [number, number, number] }) {
  return (
    <RoundedBox args={s} radius={r} smoothness={3} position={p} rotation={rot} castShadow receiveShadow>
      <meshStandardMaterial color={c} roughness={0.45} />
    </RoundedBox>
  );
}

function Gozler({ y, z }: { y: number; z: number }) {
  return (
    <>
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} position={[x, y, z]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color={SIYAH} />
        </mesh>
      ))}
    </>
  );
}

/** Yüz görseli: kafa silindirine sarılır */
function YuzKaplama({ gorsel }: { gorsel: string }) {
  const doku = useTexture(gorsel);
  doku.anisotropy = 8;
  const yay = Math.PI * 0.95;
  return (
    <mesh position={[0, 3.03, 0]}>
      <cylinderGeometry args={[0.508, 0.508, 1.0, 48, 1, true, -yay / 2, yay]} />
      <meshStandardMaterial map={doku} transparent alphaTest={0.08} roughness={0.4} />
    </mesh>
  );
}

/** Üst gövde görseli (kollarıyla): gövdenin önüne düzlem olarak */
function UstKaplama({ gorsel }: { gorsel: string }) {
  const doku = useTexture(gorsel);
  doku.anisotropy = 8;
  const img = doku.image as { width: number; height: number };
  const oran = img.width / img.height;
  let w = 2.72;
  let h = w / oran;
  if (h > 1.95) {
    h = 1.95;
    w = h * oran;
  }
  return (
    <mesh position={[0, 2.64 - h / 2, 0.435]}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={doku} transparent alphaTest={0.08} roughness={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Aksesuar görseli: elin yanında, hep kameraya dönük */
function AksesuarKaplama({ gorsel }: { gorsel: string }) {
  const doku = useTexture(gorsel);
  doku.anisotropy = 8;
  const img = doku.image as { width: number; height: number };
  const oran = img.width / img.height;
  const en = oran >= 1 ? 1.8 : 1.8 * oran;
  const boy = oran >= 1 ? 1.8 / oran : 1.8;
  return (
    <Billboard position={[1.85, 1.15 + boy / 2 - 0.4, 0.75]}>
      <mesh>
        <planeGeometry args={[en, boy]} />
        <meshStandardMaterial map={doku} transparent alphaTest={0.08} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </Billboard>
  );
}

function Sac({ kod }: { kod: string }) {
  const parca = parcaBul(kod);
  if (!parca) return null;
  const renk = parca.renk;
  const stil = sacStili(kod);
  return (
    <group>
      <mesh position={[0, 3.26, -0.06]} castShadow>
        <cylinderGeometry args={[0.54, 0.54, 0.42, 28]} />
        <meshStandardMaterial color={renk} roughness={0.6} />
      </mesh>
      {stil === 'uzun' && <Parca p={[0, 2.62, -0.42]} s={[1.12, 1.6, 0.35]} c={renk} r={0.12} />}
      {stil === 'topuz' && (
        <mesh position={[0, 3.78, -0.1]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={renk} roughness={0.6} />
        </mesh>
      )}
      {stil === 'sapka' && <Parca p={[0, 3.12, 0.55]} s={[0.9, 0.08, 0.62]} c={renk} r={0.03} />}
    </group>
  );
}

function Kisi({ f }: { f: KisiSecimi }) {
  const yuz = parcaBul(f.yuz);
  const ust = parcaBul(f.ust);
  const alt = parcaBul(f.alt);
  const aksesuar = parcaBul(f.aksesuar);
  const govde = ust?.renk ?? '#9aa0a6';
  const altRenk = alt?.renk ?? '#6b7280';
  const olcek = f.cinsiyet === 'cocuk' ? 0.8 : 1;
  return (
    <group scale={1.12 * olcek}>
      <Parca p={[-0.4, 0.55, 0]} s={[0.76, 1.1, 0.8]} c={altRenk} />
      <Parca p={[0.4, 0.55, 0]} s={[0.76, 1.1, 0.8]} c={altRenk} />
      <Parca p={[0, 1.8, 0]} s={[1.7, 1.4, 0.85]} c={govde} />
      <Parca p={[-1.12, 1.85, 0]} s={[0.45, 1.25, 0.55]} c={govde} rot={[0, 0, 0.06]} />
      <Parca p={[1.12, 1.85, 0]} s={[0.45, 1.25, 0.55]} c={govde} rot={[0, 0, -0.06]} />
      {[-1.17, 1.17].map((x) => (
        <mesh key={x} position={[x, 1.15, 0]} castShadow>
          <sphereGeometry args={[0.27, 16, 16]} />
          <meshStandardMaterial color={TEN} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 2.95, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.8, 28]} />
        <meshStandardMaterial color={TEN} roughness={0.35} />
      </mesh>
      <mesh position={[0, 3.46, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.2, 18]} />
        <meshStandardMaterial color={TEN} roughness={0.35} />
      </mesh>
      {!yuz && <Gozler y={3.0} z={0.49} />}
      {f.sac && <Sac kod={f.sac} />}
      <Suspense fallback={null}>{yuz && <YuzKaplama gorsel={yuz.gorsel} />}</Suspense>
      <Suspense fallback={null}>{ust && <UstKaplama gorsel={ust.gorsel} />}</Suspense>
      <Suspense fallback={null}>{aksesuar && <AksesuarKaplama gorsel={aksesuar.gorsel} />}</Suspense>
    </group>
  );
}

function Kopek({ renk }: { renk: Hayvan['renk'] }) {
  return (
    <group rotation={[0, 0.25, 0]} scale={1.05}>
      {[
        [-0.7, 0.3],
        [-0.7, -0.3],
        [0.7, 0.3],
        [0.7, -0.3],
      ].map(([x, z], i) => (
        <Parca key={i} p={[x, 0.4, z]} s={[0.36, 0.8, 0.36]} c={renk.alt} />
      ))}
      <Parca p={[0, 1.25, 0]} s={[2.1, 1.0, 1.0]} c={renk.govde} r={0.2} />
      <Parca p={[1.15, 1.95, 0]} s={[0.95, 0.95, 0.95]} c={renk.govde} r={0.2} />
      <Parca p={[1.75, 1.8, 0]} s={[0.5, 0.4, 0.6]} c={renk.alt} r={0.1} />
      <mesh position={[2.03, 1.9, 0]} castShadow>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color={SIYAH} />
      </mesh>
      <Parca p={[1.0, 2.5, 0.42]} s={[0.28, 0.6, 0.3]} c={renk.sac} r={0.08} rot={[0.2, 0, 0]} />
      <Parca p={[1.0, 2.5, -0.42]} s={[0.28, 0.6, 0.3]} c={renk.sac} r={0.08} rot={[-0.2, 0, 0]} />
      <Parca p={[-1.2, 1.75, 0]} s={[0.25, 0.85, 0.25]} c={renk.alt} r={0.1} rot={[0, 0, 0.7]} />
      {[0.3, -0.3].map((z) => (
        <mesh key={z} position={[1.62, 2.05, z]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={SIYAH} />
        </mesh>
      ))}
    </group>
  );
}

function Kedi({ renk }: { renk: Hayvan['renk'] }) {
  return (
    <group rotation={[0, 0.25, 0]}>
      {[
        [-0.55, 0.28],
        [-0.55, -0.28],
        [0.55, 0.28],
        [0.55, -0.28],
      ].map(([x, z], i) => (
        <Parca key={i} p={[x, 0.35, z]} s={[0.3, 0.7, 0.3]} c={renk.alt} />
      ))}
      <Parca p={[0, 1.1, 0]} s={[1.8, 0.9, 0.9]} c={renk.govde} r={0.2} />
      <Parca p={[1.0, 1.75, 0]} s={[0.9, 0.85, 0.9]} c={renk.govde} r={0.22} />
      {[0.3, -0.3].map((z) => (
        <mesh key={z} position={[0.95, 2.32, z]} castShadow>
          <coneGeometry args={[0.2, 0.42, 4]} />
          <meshStandardMaterial color={renk.alt} roughness={0.5} />
        </mesh>
      ))}
      <Parca p={[1.45, 1.65, 0]} s={[0.12, 0.22, 0.3]} c={renk.sac} r={0.04} />
      <Parca p={[-1.05, 1.9, 0]} s={[0.22, 1.3, 0.22]} c={renk.alt} r={0.1} rot={[0, 0, 0.25]} />
      {[0.27, -0.27].map((z) => (
        <mesh key={z} position={[1.42, 1.9, z]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={SIYAH} />
        </mesh>
      ))}
    </group>
  );
}

export function FigurModel({ secim }: { secim: FigurSecimi }) {
  if (secim.tur === 'kisi') return <Kisi f={secim} />;
  const h = hayvanBul(secim.hayvan);
  if (!h) return null;
  return h.tur === 'kopek' ? <Kopek renk={h.renk} /> : <Kedi renk={h.renk} />;
}

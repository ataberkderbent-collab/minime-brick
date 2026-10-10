'use client';

import { Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { type FigurSecimi, type Hayvan, type KisiSecimi, hayvanBul, parcaBul } from '@/lib/katalog';
import { sacSinifi, yuzStili } from '@/lib/parca-stil';
import { yuzTuvali } from './yuz-ciz';

// Gerçek minifigür oranlarında, kodla kurulan 3B figür (yükseklik ≈ 4,3 cm; ayağın bastığı nokta y = 0).
// Yüz: 1024 px'lik kodla çizilmiş doku, kafa silindirinin önüne sarılır. Saç: koda göre geometri sınıfı,
// renk parça görselinden. Üst: parça görseli gövdenin ön yüzüne (baskı); kıyafet rengi görselden.
// Plastik görünümü: MeshPhysicalMaterial + clearcoat; sahnedeki Environment ışığı yansır.

const SARI = '#f5c518';

function plastik(renk: string, ek: Partial<THREE.MeshPhysicalMaterialParameters> = {}) {
  return new THREE.MeshPhysicalMaterial({ color: renk, roughness: 0.38, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.3, ...ek });
}
function usePlastik(renk: string) {
  return useMemo(() => plastik(renk), [renk]);
}

/** Gövde: alta doğru genişleyen yamuk prizma (minifigür torsosu) */
function govdeGeometrisi() {
  const s = new THREE.Shape();
  const ust = 0.62;
  const alt = 0.78;
  const h = 1.3;
  s.moveTo(-alt, 0);
  s.lineTo(alt, 0);
  s.lineTo(ust, h);
  s.lineTo(-ust, h);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.72, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 });
  g.translate(0, 0, -0.36);
  return g;
}

function Kol({ yon, renk, el }: { yon: 1 | -1; renk: THREE.Material; el: THREE.Material }) {
  return (
    <group position={[yon * 0.84, 2.5, 0]} rotation={[0.18, 0, yon * -0.13]}>
      <mesh castShadow material={renk}>
        <sphereGeometry args={[0.21, 18, 18]} />
      </mesh>
      <mesh position={[0, -0.3, 0]} castShadow material={renk}>
        <cylinderGeometry args={[0.2, 0.18, 0.64, 20]} />
      </mesh>
      <mesh position={[0, -0.62, 0]} castShadow material={renk}>
        <sphereGeometry args={[0.18, 16, 16]} />
      </mesh>
      <group position={[0, -0.62, 0]} rotation={[-0.5, 0, 0]}>
        <mesh position={[0, -0.26, 0]} castShadow material={renk}>
          <cylinderGeometry args={[0.165, 0.16, 0.52, 20]} />
        </mesh>
        {/* El: C biçimli kanca */}
        <group position={[0, -0.6, 0]} rotation={[0, yon * 0.3, 0]}>
          <mesh castShadow material={el}>
            <cylinderGeometry args={[0.09, 0.09, 0.14, 12]} />
          </mesh>
          <mesh position={[0, -0.14, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow material={el}>
            <torusGeometry args={[0.15, 0.065, 10, 20, Math.PI * 1.45]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/** Kafa silindirinin önüne sarılan yüz dokusu */
function Yuz({ kod }: { kod: string }) {
  const doku = useMemo(() => {
    const t = new THREE.CanvasTexture(yuzTuvali(kod));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 16;
    return t;
  }, [kod]);
  const mat = useMemo(() => plastik('#ffffff', { map: doku }), [doku]);
  const yay = Math.PI * 1.02;
  return (
    <mesh position={[0, 3.18, 0]} rotation={[0, -yay / 2, 0]} material={mat}>
      <cylinderGeometry args={[0.556, 0.556, 0.72, 48, 1, true, 0, yay]} />
    </mesh>
  );
}

// ── Saç parçaları ──────────────────────────────────────────────────────────
const KAFA_Y = 3.18;
const KAFA_R = 0.55;

function Kubbe({ m, r = 0.64, y = 0.14, derinlik = 0.5, sx = 1, sz = 1 }: { m: THREE.Material; r?: number; y?: number; derinlik?: number; sx?: number; sz?: number }) {
  // Tepe: basık yarım küre; alt kenarı kaşların hemen üstünde (y = KAFA_Y + y)
  return (
    <mesh position={[0, KAFA_Y + y, 0]} scale={[sx, 0.66, sz]} castShadow material={m}>
      <sphereGeometry args={[r, 48, 28, 0, Math.PI * 2, 0, Math.PI * derinlik]} />
    </mesh>
  );
}
function ArkaKapak({ m, r = 0.64, y = 0.14, kadar = 0.78, genislik = 1.0 }: { m: THREE.Material; r?: number; y?: number; kadar?: number; genislik?: number }) {
  // Arka ve yanlar: kubbenin ekvatorundan aşağı, `kadar`×π'ye kadar (0.75 ≈ ense). Yalnız arka `genislik`×π
  const phiLen = Math.PI * genislik;
  return (
    <mesh position={[0, KAFA_Y + y, 0]} scale={[1, 0.85, 1]} castShadow material={m}>
      <sphereGeometry args={[r, 48, 28, Math.PI + (Math.PI - phiLen) / 2, phiLen, Math.PI * 0.5, Math.PI * (kadar - 0.5)]} />
    </mesh>
  );
}
function Dokum({ m, h, r = 0.66, acik = 0.36, y = KAFA_Y + 0.14, alt = r }: { m: THREE.Material; h: number; r?: number; acik?: number; y?: number; alt?: number }) {
  // Omuzlara dökülen saç: önü açık, uçları kapalı (kalınlık görünür) silindir
  return (
    <mesh position={[0, y - h / 2, -0.04]} castShadow material={m}>
      <cylinderGeometry args={[r, alt, h, 48, 1, false, Math.PI * acik, Math.PI * (2 - 2 * acik)]} />
    </mesh>
  );
}
function Kakul({ m }: { m: THREE.Material }) {
  return (
    <mesh position={[0, KAFA_Y + 0.08, 0]} castShadow material={m}>
      <cylinderGeometry args={[0.6, 0.58, 0.3, 32, 1, true, -Math.PI * 0.32, Math.PI * 0.64]} />
    </mesh>
  );
}
function Top({ m, p, r }: { m: THREE.Material; p: [number, number, number]; r: number }) {
  return (
    <mesh position={p} castShadow material={m}>
      <sphereGeometry args={[r, 24, 18]} />
    </mesh>
  );
}

function Sac({ kod }: { kod: string }) {
  const parca = parcaBul(kod);
  const m = useMemo(() => plastik(parca?.renk ?? '#2a1a0e', { roughness: 0.5, clearcoat: 0.35, side: THREE.DoubleSide }), [parca?.renk]);
  if (!parca) return null;
  const sinif = sacSinifi(kod);
  switch (sinif) {
    case 'kisa':
      return (
        <group>
          <Kubbe m={m} />
          <ArkaKapak m={m} kadar={0.66} />
        </group>
      );
    case 'kisa-dalgali':
      return (
        <group>
          <Kubbe m={m} r={0.67} y={0.14} />
          <ArkaKapak m={m} r={0.67} y={0.14} kadar={0.68} />
          {[-0.28, 0.05, 0.36].map((x, i) => (
            <Top key={i} m={m} p={[x, KAFA_Y + 0.5 - Math.abs(x) * 0.25, (i % 2 ? -0.1 : 0.15)]} r={0.16} />
          ))}
        </group>
      );
    case 'dik':
      return (
        <group>
          <Kubbe m={m} r={0.63} />
          <ArkaKapak m={m} kadar={0.64} />
          {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
            <mesh key={i} position={[x, KAFA_Y + 0.6, 0.1 - Math.abs(x) * 0.3]} rotation={[0.15, 0, -x * 1.1]} castShadow material={m}>
              <coneGeometry args={[0.14, 0.42, 10]} />
            </mesh>
          ))}
        </group>
      );
    case 'orta':
      return (
        <group>
          <Kubbe m={m} r={0.66} y={0.14} />
          <ArkaKapak m={m} r={0.66} y={0.14} kadar={0.9} genislik={1.35} />
        </group>
      );
    case 'orta-dalgali':
      return (
        <group>
          <Kubbe m={m} r={0.68} y={0.14} />
          <ArkaKapak m={m} r={0.68} y={0.14} kadar={0.92} genislik={1.35} />
          <Top m={m} p={[-0.6, KAFA_Y - 0.25, 0.05]} r={0.2} />
          <Top m={m} p={[0.6, KAFA_Y - 0.25, 0.05]} r={0.2} />
          <Top m={m} p={[-0.3, KAFA_Y - 0.45, -0.4]} r={0.22} />
          <Top m={m} p={[0.3, KAFA_Y - 0.45, -0.4]} r={0.22} />
        </group>
      );
    case 'bob':
      return (
        <group>
          <Kubbe m={m} r={0.66} y={0.14} />
          <Dokum m={m} h={0.95} r={0.66} acik={0.3} />
        </group>
      );
    case 'bob-kakul':
      return (
        <group>
          <Kubbe m={m} r={0.66} y={0.14} />
          <Dokum m={m} h={0.95} r={0.66} acik={0.3} />
          <Kakul m={m} />
        </group>
      );
    case 'uzun':
      return (
        <group>
          <Kubbe m={m} r={0.65} y={0.14} />
          <Dokum m={m} h={1.65} r={0.65} alt={0.8} acik={0.32} />
        </group>
      );
    case 'uzun-dalgali':
      return (
        <group>
          <Kubbe m={m} r={0.67} y={0.14} />
          <Dokum m={m} h={1.6} r={0.67} alt={0.85} acik={0.3} />
          {[[-0.55, -0.5], [0.55, -0.5], [-0.5, -1.1], [0.5, -1.1], [0, -1.3]].map(([x, dy], i) => (
            <Top key={i} m={m} p={[x, KAFA_Y + dy, -0.4]} r={0.21} />
          ))}
        </group>
      );
    case 'kuyruk':
      return (
        <group>
          <Kubbe m={m} r={0.64} />
          <ArkaKapak m={m} kadar={0.7} />
          <mesh position={[0, KAFA_Y - 0.25, -0.62]} rotation={[0.35, 0, 0]} castShadow material={m}>
            <cylinderGeometry args={[0.13, 0.2, 1.1, 16]} />
          </mesh>
          <Top m={m} p={[0, KAFA_Y + 0.25, -0.58]} r={0.22} />
        </group>
      );
    case 'yan-kuyruk':
      return (
        <group>
          <Kubbe m={m} r={0.64} />
          <ArkaKapak m={m} kadar={0.72} />
          <mesh position={[0.52, KAFA_Y - 0.4, -0.3]} rotation={[0.2, 0, -0.3]} castShadow material={m}>
            <cylinderGeometry args={[0.14, 0.22, 1.2, 16]} />
          </mesh>
        </group>
      );
    case 'topuz':
      return (
        <group>
          <Kubbe m={m} r={0.63} />
          <ArkaKapak m={m} kadar={0.66} />
          <Top m={m} p={[0, KAFA_Y + 0.5, -0.3]} r={0.27} />
        </group>
      );
    case 'ikili-topuz':
      return (
        <group>
          <Kubbe m={m} r={0.63} />
          <ArkaKapak m={m} kadar={0.66} />
          <Top m={m} p={[-0.55, KAFA_Y + 0.4, -0.1]} r={0.26} />
          <Top m={m} p={[0.55, KAFA_Y + 0.4, -0.1]} r={0.26} />
        </group>
      );
    case 'afro':
      return (
        <group>
          <mesh position={[0, KAFA_Y + 0.15, -0.08]} castShadow material={m}>
            <sphereGeometry args={[0.95, 40, 28, Math.PI * 0.62, Math.PI * 1.76, 0, Math.PI * 0.8]} />
          </mesh>
          <Kubbe m={m} r={0.9} y={0.2} derinlik={0.36} />
        </group>
      );
    case 'orgu':
      return (
        <group>
          <Kubbe m={m} r={0.64} />
          <ArkaKapak m={m} kadar={0.72} />
          {[0, 1, 2, 3, 4].map((i) => (
            <Top key={i} m={m} p={[0.45 - i * 0.03, KAFA_Y - 0.1 - i * 0.3, -0.35 + i * 0.06]} r={0.17 - i * 0.012} />
          ))}
        </group>
      );
    case 'sapka':
      return (
        <group>
          <mesh position={[0, KAFA_Y + 0.14, 0]} scale={[1, 0.72, 1]} castShadow material={m}>
            <sphereGeometry args={[0.63, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          </mesh>
          <mesh position={[0, KAFA_Y + 0.14, 0.5]} rotation={[0.1, 0, 0]} castShadow material={m}>
            <boxGeometry args={[0.9, 0.06, 0.55]} />
          </mesh>
        </group>
      );
  }
}

function Kisi({ f }: { f: KisiSecimi }) {
  const ust = parcaBul(f.ust);
  const alt = parcaBul(f.alt);
  const aksesuar = parcaBul(f.aksesuar);
  const ten = usePlastik(yuzStili(f.yuz ?? '').ten ?? SARI);
  const govde = usePlastik(ust?.renk ?? '#9aa0a6');
  const bacak = usePlastik(alt?.renk ?? '#4b5563');
  const govdeGeo = useMemo(() => govdeGeometrisi(), []);
  const olcek = f.cinsiyet === 'cocuk' ? 0.8 : 1;
  return (
    <group scale={olcek}>
      {/* Bacaklar ve kalça */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow material={bacak}>
        <boxGeometry args={[1.56, 0.4, 0.6]} />
      </mesh>
      {[-0.4, 0.4].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.5, 0]} castShadow receiveShadow material={bacak}>
            <boxGeometry args={[0.72, 1.0, 0.62]} />
          </mesh>
          <mesh position={[x, 0.12, 0.12]} castShadow material={bacak}>
            <boxGeometry args={[0.72, 0.24, 0.4]} />
          </mesh>
        </group>
      ))}
      {/* Gövde */}
      <mesh position={[0, 1.42, 0]} geometry={govdeGeo} castShadow receiveShadow material={govde} />
      <Kol yon={-1} renk={govde} el={ten} />
      <Kol yon={1} renk={govde} el={ten} />
      {/* Boyun ve kafa */}
      <mesh position={[0, 2.76, 0]} material={ten}>
        <cylinderGeometry args={[0.2, 0.22, 0.14, 20]} />
      </mesh>
      <mesh position={[0, 3.18, 0]} castShadow material={ten}>
        <cylinderGeometry args={[0.55, 0.55, 0.72, 48]} />
      </mesh>
      <mesh position={[0, 3.62, 0]} castShadow material={ten}>
        <cylinderGeometry args={[0.22, 0.22, 0.17, 24]} />
      </mesh>
      {f.yuz && <Yuz kod={f.yuz} />}
      {f.sac && <Sac kod={f.sac} />}
      {aksesuar && (
        <Suspense fallback={null}>
          <Aksesuar gorsel={aksesuar.gorsel} en={aksesuar.en} boy={aksesuar.boy} />
        </Suspense>
      )}
    </group>
  );
}

/** Aksesuar: eldeki parça görseli (gerçek 3B parça gelene kadar), sağ elin önünde */
function Aksesuar({ gorsel, en, boy }: { gorsel: string; en: number; boy: number }) {
  const doku = useTexture(gorsel);
  doku.anisotropy = 16;
  const oran = en / boy;
  const h = 1.15;
  const w = h * oran;
  return (
    <mesh position={[1.0, 1.55, 0.55]} rotation={[0, -0.3, 0.15]}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={doku} transparent alphaTest={0.3} roughness={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Kutu({ p, s, m, r, rot }: { p: [number, number, number]; s: [number, number, number]; m: THREE.Material; r?: number; rot?: [number, number, number] }) {
  void r;
  return (
    <mesh position={p} rotation={rot} castShadow receiveShadow material={m}>
      <boxGeometry args={s} />
    </mesh>
  );
}

function Kopek({ renk }: { renk: Hayvan['renk'] }) {
  const g = usePlastik(renk.govde);
  const a = usePlastik(renk.alt);
  const s = usePlastik(renk.sac);
  const siyah = usePlastik('#1c1c1c');
  return (
    <group rotation={[0, 0.25, 0]} scale={1.05}>
      {[[-0.7, 0.3], [-0.7, -0.3], [0.7, 0.3], [0.7, -0.3]].map(([x, z], i) => (
        <Kutu key={i} p={[x, 0.4, z]} s={[0.36, 0.8, 0.36]} m={a} />
      ))}
      <Kutu p={[0, 1.25, 0]} s={[2.1, 1.0, 1.0]} m={g} />
      <Kutu p={[1.15, 1.95, 0]} s={[0.95, 0.95, 0.95]} m={g} />
      <Kutu p={[1.75, 1.8, 0]} s={[0.5, 0.4, 0.6]} m={a} />
      <mesh position={[2.03, 1.9, 0]} castShadow material={siyah}>
        <sphereGeometry args={[0.1, 12, 12]} />
      </mesh>
      <Kutu p={[1.0, 2.5, 0.42]} s={[0.28, 0.6, 0.3]} m={s} rot={[0.2, 0, 0]} />
      <Kutu p={[1.0, 2.5, -0.42]} s={[0.28, 0.6, 0.3]} m={s} rot={[-0.2, 0, 0]} />
      <Kutu p={[-1.2, 1.75, 0]} s={[0.25, 0.85, 0.25]} m={a} rot={[0, 0, 0.7]} />
      {[0.3, -0.3].map((z) => (
        <mesh key={z} position={[1.62, 2.05, z]} material={siyah}>
          <sphereGeometry args={[0.07, 12, 12]} />
        </mesh>
      ))}
    </group>
  );
}

function Kedi({ renk }: { renk: Hayvan['renk'] }) {
  const g = usePlastik(renk.govde);
  const a = usePlastik(renk.alt);
  const s = usePlastik(renk.sac);
  const siyah = usePlastik('#1c1c1c');
  return (
    <group rotation={[0, 0.25, 0]}>
      {[[-0.55, 0.28], [-0.55, -0.28], [0.55, 0.28], [0.55, -0.28]].map(([x, z], i) => (
        <Kutu key={i} p={[x, 0.35, z]} s={[0.3, 0.7, 0.3]} m={a} />
      ))}
      <Kutu p={[0, 1.1, 0]} s={[1.8, 0.9, 0.9]} m={g} />
      <Kutu p={[1.0, 1.75, 0]} s={[0.9, 0.85, 0.9]} m={g} />
      {[0.3, -0.3].map((z) => (
        <mesh key={z} position={[0.95, 2.32, z]} castShadow material={a}>
          <coneGeometry args={[0.2, 0.42, 4]} />
        </mesh>
      ))}
      <Kutu p={[1.45, 1.65, 0]} s={[0.12, 0.22, 0.3]} m={s} />
      <Kutu p={[-1.05, 1.9, 0]} s={[0.22, 1.3, 0.22]} m={a} rot={[0, 0, 0.25]} />
      {[0.27, -0.27].map((z) => (
        <mesh key={z} position={[1.42, 1.9, z]} material={siyah}>
          <sphereGeometry args={[0.07, 12, 12]} />
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

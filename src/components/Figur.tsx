'use client';

import { RoundedBox } from '@react-three/drei';
import type { Figur } from '@/lib/katalog';

// Kodla çizilen Lego benzeri yer tutucu figürler. Gerçek parçalar için 3B model (GLB)
// hazır olunca bu dosyadaki çizimler modelle değiştirilir; çağıran yerler aynı kalır.
// Ayağın bastığı nokta (0,0,0); boy yaklaşık 4 cm.

type Renkler = Figur['renk'];

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
      <mesh position={[-0.18, y, z]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color={SIYAH} />
      </mesh>
      <mesh position={[0.18, y, z]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color={SIYAH} />
      </mesh>
    </>
  );
}

function Insan({ renk, kadin, olcek }: { renk: Renkler; kadin: boolean; olcek: number }) {
  return (
    <group scale={1.12 * olcek}>
      <Parca p={[-0.4, 0.55, 0]} s={[0.76, 1.1, 0.8]} c={renk.alt} />
      <Parca p={[0.4, 0.55, 0]} s={[0.76, 1.1, 0.8]} c={renk.alt} />
      {kadin && (
        <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <cylinderGeometry args={[0.75, 1.15, 0.95, 4]} />
          <meshStandardMaterial color={renk.alt} roughness={0.5} />
        </mesh>
      )}
      <Parca p={[0, 1.8, 0]} s={[1.7, 1.4, 0.85]} c={renk.govde} />
      <Parca p={[-1.12, 1.85, 0]} s={[0.45, 1.25, 0.55]} c={renk.govde} rot={[0, 0, 0.06]} />
      <Parca p={[1.12, 1.85, 0]} s={[0.45, 1.25, 0.55]} c={renk.govde} rot={[0, 0, -0.06]} />
      <mesh position={[-1.17, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.27, 16, 16]} />
        <meshStandardMaterial color={TEN} roughness={0.4} />
      </mesh>
      <mesh position={[1.17, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.27, 16, 16]} />
        <meshStandardMaterial color={TEN} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.95, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.8, 28]} />
        <meshStandardMaterial color={TEN} roughness={0.35} />
      </mesh>
      <mesh position={[0, 3.46, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.2, 18]} />
        <meshStandardMaterial color={TEN} roughness={0.35} />
      </mesh>
      <Gozler y={3.0} z={0.49} />
      <mesh position={[0, 2.88, 0.49]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.17, 0.025, 8, 18, Math.PI]} />
        <meshStandardMaterial color={SIYAH} />
      </mesh>
      <mesh position={[0, 3.26, -0.06]} castShadow>
        <cylinderGeometry args={[0.54, 0.54, 0.42, 28]} />
        <meshStandardMaterial color={renk.sac} roughness={0.6} />
      </mesh>
      {kadin && <Parca p={[0, 2.65, -0.42]} s={[1.1, 1.5, 0.35]} c={renk.sac} r={0.12} />}
    </group>
  );
}

function Kopek({ renk }: { renk: Renkler }) {
  return (
    <group rotation={[0, -0.95, 0]} scale={1.05}>
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
      <mesh position={[1.62, 2.05, 0.3]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color={SIYAH} />
      </mesh>
      <mesh position={[1.62, 2.05, -0.3]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color={SIYAH} />
      </mesh>
    </group>
  );
}

function Kedi({ renk }: { renk: Renkler }) {
  return (
    <group rotation={[0, -0.95, 0]} scale={1.0}>
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
      <mesh position={[1.42, 1.9, 0.27]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color={SIYAH} />
      </mesh>
      <mesh position={[1.42, 1.9, -0.27]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color={SIYAH} />
      </mesh>
    </group>
  );
}

export function FigurModel({ figur }: { figur: Figur }) {
  switch (figur.tur) {
    case 'erkek':
      return <Insan renk={figur.renk} kadin={false} olcek={1} />;
    case 'kadin':
      return <Insan renk={figur.renk} kadin olcek={1} />;
    case 'cocuk':
      return <Insan renk={figur.renk} kadin={false} olcek={0.8} />;
    case 'kopek':
      return <Kopek renk={figur.renk} />;
    case 'kedi':
      return <Kedi renk={figur.renk} />;
  }
}

'use client';

import { Environment, Lightformer } from '@react-three/drei';

/** Ağdan dosya çekmeyen stüdyo ortam ışığı: plastik yüzeylerde yumuşak yansımalar */
export default function Studyo({ siddet = 1 }: { siddet?: number }) {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer intensity={2.2 * siddet} rotation-x={Math.PI / 2} position={[0, 6, -2]} scale={[12, 6, 1]} />
      <Lightformer intensity={1.2 * siddet} rotation-y={Math.PI / 2} position={[-8, 2, 0]} scale={[6, 3, 1]} color="#ffe7c4" />
      <Lightformer intensity={0.9 * siddet} rotation-y={-Math.PI / 2} position={[8, 1, 0]} scale={[6, 3, 1]} color="#d8e6ff" />
      <Lightformer intensity={0.6 * siddet} position={[0, 2, 8]} scale={[10, 4, 1]} />
    </Environment>
  );
}

'use client';

import { useState } from 'react';
import { MotionConfig } from 'framer-motion';
import type { Sablon } from '@/lib/katalog';
import { Alt, Bitis, Giris, Nasil, Nav, Ornekler, ParcaVitrini, Sss } from '@/components/bolumler';
import Tasarimci from '@/components/Tasarimci';

export default function Sayfa() {
  // Örnekler bölümünden seçilen şablon tasarım aracına gider (sayaç: aynı şablon yeniden seçilebilsin)
  const [secilen, setSecilen] = useState<{ s: Sablon; n: number } | null>(null);
  return (
    // Sistem "hareketi azalt" derse bütün animasyonlar sadeleşir
    <MotionConfig reducedMotion="user">
      <Nav />
      <main>
        <Giris />
        <Tasarimci disSablon={secilen} />
        <Nasil />
        <ParcaVitrini />
        <Ornekler onSec={(s) => setSecilen((o) => ({ s, n: (o?.n ?? 0) + 1 }))} />
        <Sss />
        <Bitis />
      </main>
      <Alt />
    </MotionConfig>
  );
}

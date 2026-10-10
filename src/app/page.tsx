'use client';

import { MotionConfig } from 'framer-motion';
import { Alt, Bitis, Giris, Nasil, Nav, ParcaVitrini, Sss } from '@/components/bolumler';
import Tasarimci from '@/components/Tasarimci';

export default function Sayfa() {
  return (
    // Sistem "hareketi azalt" derse bütün animasyonlar sadeleşir
    <MotionConfig reducedMotion="user">
      <Nav />
      <main>
        <Giris />
        <Tasarimci />
        <Nasil />
        <ParcaVitrini />
        <Sss />
        <Bitis />
      </main>
      <Alt />
    </MotionConfig>
  );
}

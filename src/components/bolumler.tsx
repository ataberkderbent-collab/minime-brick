'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion';
import { KATEGORI_ADLARI, PARCALAR, SABLONLAR, type ParcaKategori, type Sablon, cerceveBul, parcaBul } from '@/lib/katalog';
import { kompozitCiz } from './kompozit';

// Sayfa bölümleri: koyu stüdyo zemini, serif başlıklar, sahnede yüzen ürün.
// Metinler yalnızca bugün gerçekten çalışan şeyleri anlatır.

const INSTAGRAM = 'https://www.instagram.com/minime.brick/';
const HeroSahne = dynamic(() => import('./HeroSahne'), { ssr: false });

const yukari: Variants = {
  gizli: { opacity: 0, y: 28 },
  gorunur: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] } }),
};

export function Nav() {
  const { scrollY } = useScroll();
  const [dolu, setDolu] = useState(false);
  useEffect(() => scrollY.on('change', (v) => setDolu(v > 40)), [scrollY]);
  return (
    <header className={`nav${dolu ? ' dolu' : ''}`}>
      <div className="kap nav-ic">
        <a className="marka" href="#ust" aria-label="Minime Brick ana sayfa">
          <span className="marka-tugla" aria-hidden />
          <span>Minime Brick</span>
        </a>
        <nav aria-label="Bölümler" className="nav-baglantilar">
          <a href="#nasil">Nasıl çalışır</a>
          <a href="#parcalar">Parçalar</a>
          <a href="#ornekler">Örnekler</a>
          <a href="#sss">SSS</a>
        </nav>
        <a className="dugme birincil" href="#tasarla">
          Tasarla
        </a>
      </div>
    </header>
  );
}

/** Giriş bölümünde süzülen gerçek parçalar: uzaktakiler küçük ve bulanık (derinlik) */
const YUZENLER: { kod: string; x: string; y: string; boy: number; derin: boolean; sure: number }[] = [
  // Yalnız başlık sütununun dışında: metinle çerçeve arasındaki boşluk, çerçevenin üstü / yanları / altı
  { kod: 'K-S55', x: '45%', y: '14%', boy: 86, derin: false, sure: 9 },
  { kod: 'A31', x: '44%', y: '70%', boy: 104, derin: false, sure: 10 },
  { kod: 'E-S46', x: '71%', y: '6%', boy: 60, derin: false, sure: 12 },
  { kod: 'E-Y16', x: '58%', y: '9%', boy: 54, derin: true, sure: 11 },
  { kod: 'T36', x: '89%', y: '18%', boy: 92, derin: false, sure: 12 },
  { kod: 'C-Y6', x: '92%', y: '60%', boy: 56, derin: true, sure: 8 },
  { kod: 'A14', x: '60%', y: '90%', boy: 66, derin: false, sure: 9.5 },
  { kod: 'A1', x: '87%', y: '86%', boy: 54, derin: true, sure: 10.5 },
];

export function Giris() {
  const azHareket = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const kayma = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const solma = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section className="giris" id="ust" ref={ref}>
      <div className="giris-isik" aria-hidden />
      {!azHareket &&
        YUZENLER.map((y, i) => {
          const p = parcaBul(y.kod);
          if (!p) return null;
          return (
            <motion.span
              key={y.kod}
              className={`yuzen${y.derin ? ' derin' : ''}`}
              style={{ left: y.x, top: y.y, width: y.boy }}
              aria-hidden
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: y.derin ? 0.55 : 1, scale: 1, y: [0, -16, 0], rotate: [-8 + i * 2, 6 - i, -8 + i * 2] }}
              transition={{ opacity: { duration: 1, delay: 0.3 + i * 0.07 }, scale: { duration: 1, delay: 0.3 + i * 0.07 }, y: { duration: y.sure, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: y.sure * 1.3, repeat: Infinity, ease: 'easeInOut' } }}
            >
              <Image src={p.gorsel} alt="" width={p.en} height={p.boy} unoptimized priority={!y.derin} />
            </motion.span>
          );
        })}

      <motion.div className="kap giris-ic" style={{ y: kayma, opacity: solma }}>
        <div className="giris-metin">
          <motion.p className="ust-yazi" variants={yukari} initial="gizli" animate="gorunur" custom={0}>
            El yapımı figür çerçeveleri · İstanbul
          </motion.p>
          <h1>
            <motion.span variants={yukari} initial="gizli" animate="gorunur" custom={1}>
              Hikâyeni
            </motion.span>
            <motion.em variants={yukari} initial="gizli" animate="gorunur" custom={2}>
              figürlerle
            </motion.em>
            <motion.span variants={yukari} initial="gizli" animate="gorunur" custom={3}>
              çerçevele.
            </motion.span>
          </h1>
          <motion.p className="alt-yazi" variants={yukari} initial="gizli" animate="gorunur" custom={4}>
            Yüzü, saçı, kıyafeti sen seç. Kartına isimleri yazdır. Çerçeven yola çıkmadan önce onu üç boyutlu, her açıdan gör.
          </motion.p>
          <motion.div className="giris-dugmeler" variants={yukari} initial="gizli" animate="gorunur" custom={5}>
            <a className="dugme birincil buyuk" href="#tasarla">
              Tasarlamaya başla
            </a>
            <a className="dugme sade buyuk" href="#nasil">
              Nasıl çalışır →
            </a>
          </motion.div>
        </div>
        <motion.div className="giris-sahne-sar" initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          <HeroSahne className="giris-sahne" />
          <p className="giris-sahne-not">Sürükle · döndür</p>
        </motion.div>
      </motion.div>
    </section>
  );
}

const ADIMLAR = [
  { no: '01', baslik: 'Çerçeveni seç', metin: 'Üç boyut, üç renk. Her boyutta kaç figür sığacağı baştan belli; paspartu ve kart ölçüleri buna göre.' },
  { no: '02', baslik: 'Figürlerini kur', metin: 'Her figür için yüz, saç, üst, alt ve aksesuar. Köpek ve kedi de ekle. Tükenen parçalar baştan görünür.' },
  { no: '03', baslik: 'Kartını yazdır', metin: 'Hazır kartlardan birini seç; başlığı, alt yazıyı ve isimleri karta bas. İstersen kendi tasarımını yükle.' },
  { no: '04', baslik: 'Üç boyutlu gör', metin: 'Çerçeveyi çevir, figüre dokun, 360° incele. Parça listeni tek dokunuşla al.' },
];

export function Nasil() {
  return (
    <section className="bolum" id="nasil">
      <div className="kap">
        <div className="bolum-bas">
          <p className="goz">Nasıl çalışır</p>
          <h2>
            Dört adım. <em>Senin çerçeven.</em>
          </h2>
        </div>
        <ol className="adimlar">
          {ADIMLAR.map((a, i) => (
            <motion.li key={a.no} variants={yukari} initial="gizli" whileInView="gorunur" viewport={{ once: true, margin: '-80px' }} custom={i}>
              <span className="adim-no">{a.no}</span>
              <h3>{a.baslik}</h3>
              <p>{a.metin}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const SERIT = ['K-S55', 'E-Y6', 'T36', 'A31', 'K-S43', 'L12', 'E-Y20', 'T1', 'A14', 'K-Y5', 'E-S46', 'T69', 'A23', 'K-S61', 'C-Y3', 'L19', 'A3', 'E-Y27', 'T52', 'K-S28', 'A32', 'L3', 'K-Y15', 'T12'];

export function ParcaVitrini() {
  const say = (k: ParcaKategori) => PARCALAR.filter((p) => p.kategori === k).length;
  const serit = SERIT.map((k) => parcaBul(k)).filter(Boolean);
  return (
    <section className="bolum vitrin" id="parcalar">
      <div className="kap">
        <div className="bolum-bas">
          <p className="goz">Parçalar</p>
          <h2>
            {PARCALAR.length} parça. <em>Sonsuz kombinasyon.</em>
          </h2>
          <p className="bolum-alt">Gerçek stok listesinden; hepsi tasarım aracında seçilebilir.</p>
        </div>
      </div>
      <div className="serit-sar" aria-hidden>
        <div className="serit">
          {[...serit, ...serit].map((p, i) => (
            <Image key={i} src={p!.gorsel} alt="" width={p!.en} height={p!.boy} unoptimized loading="lazy" />
          ))}
        </div>
      </div>
      <div className="kap">
        <ul className="sayilar">
          {(['yuz', 'sac', 'ust', 'alt', 'aksesuar'] as ParcaKategori[]).map((k, i) => (
            <motion.li key={k} variants={yukari} initial="gizli" whileInView="gorunur" viewport={{ once: true, margin: '-60px' }} custom={i}>
              <b>{say(k)}</b>
              <span>{KATEGORI_ADLARI[k]}</span>
            </motion.li>
          ))}
        </ul>
        <p className="not-ince">Stok kalmaması hâlinde alternatif seçim için iletişime geçilir; sipariş sırasına göre öncelik verilir.</p>
      </div>
    </section>
  );
}

function SablonKarti({ s, i, onSec }: { s: Sablon; i: number; onSec: (s: Sablon) => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let iptal = false;
    const c = cerceveBul(s.cerceve);
    kompozitCiz({ cerceve: c, kart: s.kart, baslik: s.baslik, altYazi: s.altYazi, figurler: s.figurler })
      .then((t) => !iptal && setUrl(t.toDataURL('image/jpeg', 0.86)))
      .catch(() => {});
    return () => {
      iptal = true;
    };
  }, [s]);
  const c = cerceveBul(s.cerceve);
  return (
    <motion.article className={`ornek ornek-${s.cerceveRengi}`} variants={yukari} initial="gizli" whileInView="gorunur" viewport={{ once: true, margin: '-60px' }} custom={i} whileHover={{ y: -6 }}>
      <div className="ornek-cerceve" style={{ aspectRatio: `${c.baskiEn} / ${c.baskiBoy}` }}>
        {url ? <img src={url} alt={`${s.ad} şablonu: ${s.aciklama}`} /> : <span className="ornek-bos" />}
      </div>
      <div className="ornek-alt">
        <div>
          <h3>{s.ad}</h3>
          <p>
            {s.aciklama} · {c.ad} çerçeve · {s.figurler.length} figür
          </p>
        </div>
        <button type="button" className="dugme sade" onClick={() => onSec(s)}>
          Bununla başla
        </button>
      </div>
    </motion.article>
  );
}

export function Ornekler({ onSec }: { onSec: (s: Sablon) => void }) {
  return (
    <section className="bolum" id="ornekler">
      <div className="kap">
        <div className="bolum-bas">
          <p className="goz">Örnekler</p>
          <h2>
            Önceki siparişlerden. <em>Değiştir, senin olsun.</em>
          </h2>
        </div>
        <div className="ornekler">
          {SABLONLAR.map((s, i) => (
            <SablonKarti key={s.id} s={s} i={i} onSec={onSec} />
          ))}
        </div>
      </div>
    </section>
  );
}

const SORULAR = [
  { s: 'Parçaları 3B görebilir miyim?', c: 'Evet. Çerçeveyi sürükleyerek çevirebilir, bir figüre dokunup onu tek başına her yönden inceleyebilirsin. Figürlerin yüzü ve üstü gerçek parça görselleriyle gösterilir; gövde yaklaşık modeldir, gerçek 3B parça modelleri eklendiğinde birebir görünecek.' },
  { s: 'Kendi tasarımımı yükleyebilir miyim?', c: 'Evet. Seçtiğin çerçevenin baskı alanına uygun oranda ve yeterli çözünürlükte bir JPG, PNG ya da WebP yükleyebilirsin. Çözünürlük düşükse ya da oran uymuyorsa ne gerektiğini söyleriz.' },
  { s: 'Bir parça tükenmişse ne olur?', c: 'Tükenmiş parçalar tasarım aracında seçilemez. Seçtiğin bir parça sipariş sırasında kalmazsa alternatif seçim için seninle iletişime geçilir; sipariş sırasına göre öncelik verilir.' },
  { s: 'Köpek ve kedi ekleyebilir miyim?', c: 'Evet. Figürlerin yanına köpek ya da kedi ekleyebilir, rengini seçebilirsin. Şu an görünen hayvanlar örnektir; gerçek hayvan parçaları eklenecek.' },
  { s: 'Nasıl sipariş veririm?', c: 'Sipariş adımı hazırlanıyor. O zamana kadar tasarımını bitirip “Parça listesini kopyala” ile çerçeve, kart ve parça kodlarını kopyalayıp Instagram’dan @minime.brick hesabına iletebilirsin.' },
];

export function Sss() {
  return (
    <section className="bolum" id="sss">
      <div className="kap dar">
        <div className="bolum-bas">
          <p className="goz">SSS</p>
          <h2>Sık sorulanlar</h2>
        </div>
        <div className="sss">
          {SORULAR.map((q, i) => (
            <motion.details key={q.s} variants={yukari} initial="gizli" whileInView="gorunur" viewport={{ once: true, margin: '-40px' }} custom={i * 0.5}>
              <summary>{q.s}</summary>
              <p>{q.c}</p>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Bitis() {
  return (
    <section className="bitis">
      <div className="kap">
        <motion.div className="bitis-kutu" variants={yukari} initial="gizli" whileInView="gorunur" viewport={{ once: true }}>
          <h2>
            Çerçeveni <em>şimdi</em> kur.
          </h2>
          <p>Birkaç dakikada tasarla, üç boyutlu gör, parça listeni al.</p>
          <a className="dugme birincil buyuk" href="#tasarla">
            Tasarlamaya başla
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export function Alt() {
  return (
    <footer className="alt">
      <div className="kap alt-ic">
        <span className="marka kucuk">
          <span className="marka-tugla" aria-hidden />
          Minime Brick
        </span>
        <a href={INSTAGRAM} target="_blank" rel="noreferrer noopener">
          Instagram · @minime.brick
        </a>
      </div>
    </footer>
  );
}

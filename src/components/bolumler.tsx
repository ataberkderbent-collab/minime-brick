'use client';

import Image from 'next/image';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { KATEGORI_ADLARI, PARCALAR, type ParcaKategori } from '@/lib/katalog';

// Sayfa bölümleri. Metinler yalnızca bugün gerçekten çalışan şeyleri anlatır;
// fiyat, kargo süresi ve yorum gibi bilinmeyen bilgiler bilerek yok.

const INSTAGRAM = 'https://www.instagram.com/minime.brick/';

const giris: Variants = {
  gizli: { opacity: 0, y: 24 },
  gorunur: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

function Ortak({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={className}>
      <div className="kap">{children}</div>
    </section>
  );
}

export function Nav() {
  return (
    <header className="nav">
      <div className="kap nav-ic">
        <a className="marka" href="#ust" aria-label="Minime Brick ana sayfa">
          <span className="marka-tugla" aria-hidden />
          <span>
            Minime<b>Brick</b>
          </span>
        </a>
        <nav aria-label="Bölümler" className="nav-baglantilar">
          <a href="#nasil">Nasıl çalışır</a>
          <a href="#parcalar">Parçalar</a>
          <a href="#sss">SSS</a>
        </nav>
        <a className="dugme birincil" href="#tasarla">
          Tasarlamaya başla
        </a>
      </div>
    </header>
  );
}

const BASLIK_PARCALARI = ['Hikâyeni', 'figürlerle', 'çerçevele.'];

export function Giris() {
  const azHareket = useReducedMotion();
  const sayilar = (k: ParcaKategori) => PARCALAR.filter((p) => p.kategori === k).length;
  return (
    <Ortak className="giris" id="ust">
      <motion.p className="ust-yazi" variants={giris} initial="gizli" animate="gorunur" custom={0}>
        El yapımı Lego figür çerçeveleri
      </motion.p>
      <h1>
        {BASLIK_PARCALARI.map((s, i) => (
          <motion.span key={s} className={i === 1 ? 'vurgu' : undefined} variants={giris} initial="gizli" animate="gorunur" custom={i + 1}>
            {s}{' '}
          </motion.span>
        ))}
      </h1>
      <motion.p className="alt-yazi" variants={giris} initial="gizli" animate="gorunur" custom={4}>
        Yüzünü, saçını, kıyafetini seç; baskılı kartını tasarla. Çerçeven yola çıkmadan önce 3B olarak, her açıdan gör.
      </motion.p>
      <motion.div className="giris-dugmeler" variants={giris} initial="gizli" animate="gorunur" custom={5}>
        <a className="dugme birincil buyuk" href="#tasarla">
          Tasarlamaya başla
        </a>
        <a className="dugme ikincil buyuk" href="#nasil">
          Nasıl çalışır?
        </a>
      </motion.div>
      <motion.ul className="sayilar" variants={giris} initial="gizli" animate="gorunur" custom={6} aria-label="Parça çeşitleri">
        {(['yuz', 'sac', 'ust', 'alt', 'aksesuar'] as ParcaKategori[]).map((k) => (
          <li key={k}>
            <b>{sayilar(k)}</b>
            <span>{KATEGORI_ADLARI[k]}</span>
          </li>
        ))}
      </motion.ul>
      {!azHareket && (
        <>
          <motion.i className="yuzen y1" aria-hidden animate={{ y: [0, -14, 0], rotate: [-6, 4, -6] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.i className="yuzen y2" aria-hidden animate={{ y: [0, 12, 0], rotate: [8, -2, 8] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.i className="yuzen y3" aria-hidden animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        </>
      )}
    </Ortak>
  );
}

const ADIMLAR = [
  { no: '1', baslik: 'Çerçeveni seç', metin: 'Küçük, orta ya da büyük; beyaz, siyah ya da ahşap. Her boyutta kaç figür duracağı belli.' },
  { no: '2', baslik: 'Figürlerini oluştur', metin: 'Her figür için yüz, saç, üst, alt ve aksesuarı sen seç. Köpek ve kedi de ekleyebilirsin.' },
  { no: '3', baslik: 'Kartını tasarla', metin: 'Hazır kartlardan birini seç, başlığı ve isimleri yaz. İstersen kendi tasarımını yükle.' },
  { no: '4', baslik: '3B gör, parça listeni al', metin: 'Çerçeveyi çevir, figüre dokunup 360° incele. Seçtiğin parçaların kodları hazır olsun.' },
];

export function Nasil() {
  return (
    <Ortak className="bolum" id="nasil">
      <h2>Nasıl çalışır?</h2>
      <p className="bolum-alt">Dört adımda, kendi çerçeveni kurarsın.</p>
      <ol className="adimlar">
        {ADIMLAR.map((a, i) => (
          <motion.li key={a.no} variants={giris} initial="gizli" whileInView="gorunur" viewport={{ once: true, margin: '-60px' }} custom={i} whileHover={{ y: -4 }}>
            <span className="adim-no">{a.no}</span>
            <h3>{a.baslik}</h3>
            <p>{a.metin}</p>
          </motion.li>
        ))}
      </ol>
    </Ortak>
  );
}

const VITRIN: { kategori: ParcaKategori; ornekler: string[]; metin: string }[] = [
  { kategori: 'yuz', ornekler: ['K-Y2', 'E-Y16', 'E-Y20', 'C-Y6', 'K-Y15'], metin: 'Kadın, erkek ve çocuk yüzleri; gözlüklü, sakallı, gülen, şaşıran…' },
  { kategori: 'sac', ornekler: ['K-S55', 'E-S46', 'K-S61', 'K-S43', 'E-S33'], metin: 'Kadın ve erkek saçları; her renk, şapkalar ve topuzlar dahil.' },
  { kategori: 'ust', ornekler: ['T1', 'T36', 'T69', 'T70', 'T12'], metin: 'Takım elbiseden tişörte, desenli ve renkli üstler.' },
  { kategori: 'alt', ornekler: ['L1', 'L3', 'L12', 'L17', 'L14'], metin: 'Her renkte alt parçalar.' },
  { kategori: 'aksesuar', ornekler: ['A1', 'A3', 'A31', 'A32', 'A23'], metin: 'Gitar, kupa, mikrofon, peri değneği ve daha fazlası.' },
];

export function ParcaVitrini() {
  return (
    <Ortak className="bolum koyu" id="parcalar">
      <h2>Seçebileceğin parçalar</h2>
      <p className="bolum-alt">Bunlar Minime Brick&apos;in gerçek stok listesinden; hepsini tasarım aracında bulabilirsin.</p>
      <div className="bento">
        {VITRIN.map((v, i) => {
          const adet = PARCALAR.filter((p) => p.kategori === v.kategori).length;
          return (
            <motion.article key={v.kategori} className={`bento-kart b-${v.kategori}`} variants={giris} initial="gizli" whileInView="gorunur" viewport={{ once: true, margin: '-60px' }} custom={i} whileHover={{ y: -4 }}>
              <header>
                <h3>{KATEGORI_ADLARI[v.kategori]}</h3>
                <b>{adet}</b>
              </header>
              <p>{v.metin}</p>
              <div className="ornek-seridi" aria-hidden>
                {v.ornekler.map((kod) => {
                  const p = PARCALAR.find((x) => x.kod === kod);
                  return p ? <Image key={kod} src={p.gorsel} alt="" width={p.en} height={p.boy} unoptimized loading="lazy" /> : null;
                })}
              </div>
            </motion.article>
          );
        })}
      </div>
      <p className="not-koyu">Stok kalmaması halinde alternatif seçim için iletişime geçilir; sipariş sırasına göre öncelik verilir.</p>
    </Ortak>
  );
}

const SORULAR = [
  { s: 'Parçaları 3B görebilir miyim?', c: 'Evet. Çerçeveyi sürükleyerek çevirebilir, bir figüre dokunup onu tek başına her yönden inceleyebilirsin. Şu an figürlerin ön yüzü gerçek parça görselleriyle, gövdesi yaklaşık bir modelle gösteriliyor; gerçek 3B parça modelleri eklendiğinde birebir görünecek.' },
  { s: 'Kendi tasarımımı yükleyebilir miyim?', c: 'Evet. Seçtiğin çerçevenin baskı alanına uygun oranda ve yeterli çözünürlükte bir JPG, PNG ya da WebP yükleyebilirsin. Çözünürlük düşükse ya da oran uymuyorsa ne gerektiğini söyleriz.' },
  { s: 'Bir parça tükenmişse ne olur?', c: 'Tükenmiş parçalar tasarım aracında seçilemez. Seçtiğin bir parça sipariş sırasında kalmazsa alternatif seçim için seninle iletişime geçilir; sipariş sırasına göre öncelik verilir.' },
  { s: 'Köpek ve kedi ekleyebilir miyim?', c: 'Evet. Figürlerin yanına köpek ya da kedi ekleyebilir, renklerini seçebilirsin. Şu an görünen hayvanlar örnektir; gerçek hayvan parçaları eklenecek.' },
  { s: 'Nasıl sipariş veririm?', c: 'Sipariş adımı hazırlanıyor. O zamana kadar tasarımını bitirip “Parça listesini kopyala” düğmesiyle çerçeve, kart ve parça kodlarını kopyalayıp Instagram’dan @minime.brick hesabına iletebilirsin.' },
];

export function Sss() {
  return (
    <Ortak className="bolum" id="sss">
      <h2>Sık sorulanlar</h2>
      <div className="sss">
        {SORULAR.map((q, i) => (
          <motion.details key={q.s} variants={giris} initial="gizli" whileInView="gorunur" viewport={{ once: true, margin: '-40px' }} custom={i * 0.5}>
            <summary>{q.s}</summary>
            <p>{q.c}</p>
          </motion.details>
        ))}
      </div>
    </Ortak>
  );
}

export function Bitis() {
  return (
    <Ortak className="bitis">
      <motion.div className="bitis-kutu" variants={giris} initial="gizli" whileInView="gorunur" viewport={{ once: true }}>
        <h2>Çerçeveni şimdi kur.</h2>
        <p>Birkaç dakikada tasarla, 3B olarak gör, parça listeni al.</p>
        <a className="dugme birincil buyuk" href="#tasarla">
          Tasarlamaya başla
        </a>
      </motion.div>
    </Ortak>
  );
}

export function Alt() {
  return (
    <footer className="alt">
      <div className="kap alt-ic">
        <span>© Minime Brick</span>
        <a href={INSTAGRAM} target="_blank" rel="noreferrer noopener">
          Instagram · @minime.brick
        </a>
      </div>
    </footer>
  );
}

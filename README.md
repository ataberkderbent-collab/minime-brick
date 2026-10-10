# Minime Brick

Müşterinin çerçeve boyutunu, figürlerini ve arka tasarımını seçip **3B olarak** gördüğü sipariş sitesi.

## Çalıştırma

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck
```

Next.js 16 · React 19 · React Three Fiber (Three.js) · TypeScript. Henüz veritabanı ve üyelik yok.

## Şu an var (1. aşama: 3B tasarım aracı + sayfa)

- **Sayfa:** giriş, tasarım aracı, nasıl çalışır, parça vitrini, SSS, bitiş. Framer Motion animasyonları;
  Rubik + Nunito Sans yazı tipleri (yerel dosyadan, `@fontsource`).
- **Çerçeve:** küçük / orta / büyük, beyaz / siyah / ahşap. Figür sayısı baskı alanının genişliğine göre sınırlı.
- **Figürler parça parça:** kadın / erkek / çocuk için yüz, saç, üst, alt, aksesuar; köpek ve kedi. Parçalar
  Shopier ürün sayfasındaki gerçek listeden (301 kod; üstü çizili olanlar "tükendi"). Figüre dokununca 360° inceleme.
- **Baskılı kart:** hazır kartlar + başlık, alt yazı ve figür isimleri karta basılır; ya da kendi tasarımını yükle
  (tür, boyut, oran ve seçili çerçeveye göre çözünürlük denetimi).
- **Parça listesi:** sipariş için çerçeve, kart ve parça kodlarını tek tıkla kopyalar.
- **UI/UX Pro Max** skill'i projede (`.claude/skills/ui-ux-pro-max`): tasarım sistemi önerisi için
  `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<istek>" --design-system`.

## Parça görselleri

`araclar/parca-kes.py` Shopier sayfasının ekran görüntülerinden (`<klasör>/4.png … 8.png`) parça küçük resimlerini
keser → `public/parcalar/<kategori>/<kod>.png` + `parcalar.json`; `araclar/parca-verisi-uret.py` bundan
`src/lib/parca-verisi.ts` üretir. Yüksek çözünürlüklü parça fotoğrafları gelince aynı kod adlarıyla değiştirilir.

## Taslak değerler — gerçek verilerle değiştirilecek

Hepsi **`src/lib/katalog.ts`** içinde, kodun geri kalanına dokunmadan değişir:

| Ne | Şu an | Gerçeği |
|---|---|---|
| Çerçeve ölçüleri, baskı alanı, derinlik | 23×23, 30×40, 50×70 cm (IKEA benzeri tahmin) | gerçek IKEA modelleri |
| En düşük / önerilen dpi | 150 / 300 (büyükte 120 / 200) | baskı kalitesine göre |
| Parça stokları | tükenenler 0, ötekiler 5 | yönetici ekranından gerçek adet |
| Hayvanlar | 6 yer tutucu | Shopier'daki gerçek hayvan parçaları |
| Figür 3B modelleri | kutu gövde + parça görseli kaplaması (`src/components/Figur.tsx`) | gerçek parçalardan GLB modeller |
| Hazır kartlar ve şablonlar | kodla çizilmiş 4 kart, 3 örnek şablon | gerçek tasarımlar, eski siparişler |

Fotoğraf kuralı: tasarım baskı alanını dolduracak biçimde ortadan kırpılır; kırpılan bölge `enDusukDpi` altına
düşerse ya da oran %25'ten fazla saparsa reddedilir (`src/lib/yukleme.ts`).

## Sıradaki aşamalar

1. Üyelik (ilk üyelikte 5, her satın almada 10 yapay zekâ görsel hakkı; hak sunucuda düşülür)
2. Yönetici ekranı: figür/parça stokları (arka tasarım baskısı stoğa girmez)
3. Fotoğrafın sunucuya yüklenmesi (aynı doğrulama sunucuda da)
4. Yapay zekâ ile görsel üretme, sipariş ve ödeme

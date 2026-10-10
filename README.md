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

## Şu an var (1. aşama: 3B tasarım aracı)

- Çerçeve boyutu: küçük / orta / büyük. Figür sayısı çerçevenin iç genişliğine göre sınırlı.
- Figür seçimi (stok sınırına göre), her figürde yerleştirme. **Figüre dokununca tek başına 360° inceleme.**
- Arka tasarım: hazır tasarımlar ya da **kendi fotoğrafını yükleme**.
- Fotoğraf doğrulaması: tür, boyut, en/boy oranı ve seçili çerçeveye göre en düşük çözünürlük. Çerçeve değişince yeniden değerlendirilir.
- Hazır şablonlar (eski siparişlerden derlenecek).

## Taslak değerler — gerçek verilerle değiştirilecek

Hepsi **`src/lib/katalog.ts`** içinde, kodun geri kalanına dokunmadan değişir:

| Ne | Şu an | Gerçeği |
|---|---|---|
| Çerçeve ölçüleri, kenar, derinlik | 23×23, 30×40, 50×70 cm (IKEA benzeri tahmin) | gerçek IKEA modelleri |
| En düşük / önerilen dpi | 150 / 300 (büyükte 120 / 200) | baskı kalitesine göre |
| Figürler ve stoklar | 7 yer tutucu figür, örnek stok | Shopier ürünleri; stok yönetici ekranından |
| Figür 3B modelleri | kodla çizilmiş Lego benzeri (`src/components/Figur.tsx`) | gerçek parçalardan GLB modeller |
| Hazır arka tasarımlar | kodla çizilmiş (`src/components/arkaplan.ts`) | gerçek tasarım görselleri |

Fotoğraf kuralı: fotoğraf çerçeveyi dolduracak biçimde ortadan kırpılır; kırpılan bölge `enDusukDpi` altına
düşerse ya da oran %25'ten fazla saparsa reddedilir (`src/lib/yukleme.ts`).

## Sıradaki aşamalar

1. Üyelik (ilk üyelikte 5, her satın almada 10 yapay zekâ görsel hakkı; hak sunucuda düşülür)
2. Yönetici ekranı: figür/parça stokları (arka tasarım baskısı stoğa girmez)
3. Fotoğrafın sunucuya yüklenmesi (aynı doğrulama sunucuda da)
4. Yapay zekâ ile görsel üretme, sipariş ve ödeme

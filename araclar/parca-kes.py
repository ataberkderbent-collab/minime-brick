"""Shopier ürün sayfası ekran görüntülerinden parça küçük resimlerini keser.

Kırmızı kod yazılarının (K-Y1, T5, A12 ...) konumunu bulur, her yazının üstündeki
resmi keser, kenara bağlı beyaz zemini saydamlaştırır. Kullanım:
  python3 araclar/parca-kes.py <resim klasörü> <çıkış klasörü>
Gerçek (yüksek çözünürlüklü) fotoğraflar gelince aynı kod adlarıyla değiştirilir.
"""
import json, sys, os
from collections import deque
from PIL import Image

girdi, cikis = sys.argv[1], sys.argv[2]

# Hangi resim dosyası hangi kategori; sırayla kodlar (üstten alta, soldan sağa)
# Her görselde etiket satırlarındaki kod sayıları (üstten alta)
SATIR_SAYILARI = {
    '4.png': [9, 9, 9, 9, 9, 8],
    '5.png': [9] * 7,
    '6.png': [8] * 6,
    '7.png': [7] + [9] * 7,
    '8.png': [11, 11, 13, 11, 9, 12],
}
# Bölüm başlıkları (siyah yazı) bazı satırların üstünde: kesim bu yükseklikten önce başlamaz
KESIM_BASLANGIC = {('8.png', 0): 79, ('6.png', 0): 69}

KATEGORILER = [
    ('4.png', 'yuz', [f'K-Y{i}' for i in range(1, 19)] + [f'E-Y{i}' for i in range(1, 28)] + [f'C-Y{i}' for i in range(1, 9)]),
    ('5.png', 'sac', [f'K-S{i}' for i in range(1, 64)]),
    ('6.png', 'sac', [f'E-S{i}' for i in range(1, 49)]),
    ('7.png', 'ust', [f'T{i}' for i in range(1, 71)]),
    ('8.png', 'alt+aksesuar', [f'L{i}' for i in range(1, 23)] + [f'A{i}' for i in range(1, 46)]),
]

def kirmizi(p):
    r, g, b, a = p
    return a > 200 and r > 170 and g < 90 and b < 90

def kume(degerler, bosluk):
    """Sıralı sayıları, aralarında `bosluk`tan büyük boşluk olan gruplara ayırır."""
    gruplar, simdiki = [], [degerler[0]]
    for v in degerler[1:]:
        if v - simdiki[-1] > bosluk:
            gruplar.append(simdiki); simdiki = [v]
        else:
            simdiki.append(v)
    gruplar.append(simdiki)
    return gruplar

def beyaz_yok(im):
    """Kenardan başlayan, beyaza yakın bağlı bölgeyi saydam yapar (beyaz giysi içi korunur)."""
    w, h = im.size
    px = im.load()
    gorulen = [[False] * w for _ in range(h)]
    kuyruk = deque()
    def beyaz(x, y):
        r, g, b, a = px[x, y]
        return r > 228 and g > 228 and b > 228
    for x in range(w):
        for y in (0, h - 1):
            if beyaz(x, y): kuyruk.append((x, y)); gorulen[y][x] = True
    for y in range(h):
        for x in (0, w - 1):
            if beyaz(x, y) and not gorulen[y][x]: kuyruk.append((x, y)); gorulen[y][x] = True
    while kuyruk:
        x, y = kuyruk.popleft()
        px[x, y] = (255, 255, 255, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not gorulen[ny][nx] and beyaz(nx, ny):
                gorulen[ny][nx] = True; kuyruk.append((nx, ny))
    return im

def kenar_temizle(im, tekrar=3):
    """Kesim sınırında kalan açık gri sliver (zemin kalıntısı) satır / sütunlarını saydam yapar."""
    for _ in range(tekrar):
        w, h = im.size
        px = im.load()
        degisti = False
        def acik(p):
            return p[3] > 0 and min(p[0], p[1], p[2]) > 200
        def cizgi(noktalar):
            opak = [p for p in noktalar if p[3] > 0]
            return opak and sum(1 for p in opak if acik(p)) >= 0.6 * len(opak)
        for y in (0, h - 1):
            if cizgi([px[x, y] for x in range(w)]):
                for x in range(w): px[x, y] = (255, 255, 255, 0)
                degisti = True
        for x in (0, w - 1):
            if cizgi([px[x, y] for y in range(h)]):
                for y in range(h): px[x, y] = (255, 255, 255, 0)
                degisti = True
        kutu = im.getbbox()
        if not kutu: return im
        im = im.crop(kutu)
        if not degisti: break
    return im

def ortalama_renk(im):
    px = list(im.get_flattened_data()) if hasattr(im, 'get_flattened_data') else list(im.getdata())
    # Beyaz / açık gri (saç görsellerindeki kafa, zemin kalıntısı) ve Lego sarısı (eller, boyun) sayılmaz
    def dis(r, g, b):
        if min(r, g, b) > 200 and max(r, g, b) - min(r, g, b) < 40: return True
        if r > 200 and g > 160 and b < 90 and r - b > 120: return True
        return False
    secili = [(r, g, b) for r, g, b, a in px if a > 200 and not dis(r, g, b)]
    if not secili: return '#cccccc'
    # medyan: tek tük gölge / parlama piksellerinden etkilenmez
    kanallar = [sorted(c[i] for c in secili)[len(secili) // 2] for i in range(3)]
    return '#%02x%02x%02x' % tuple(kanallar)

sonuc = {}
for dosya, kat, kodlar in KATEGORILER:
    im = Image.open(os.path.join(girdi, dosya)).convert('RGBA')
    w, h = im.size
    px = im.load()
    # Kod yazısı satırları: aynı satırda en az 4 ayrı, dar (≤30 px) kırmızı öbek.
    # (Ürünlerin kendi kırmızıları geniş öbek yaptığı için ayrılır.)
    etiket_satirlari = []
    for y in range(h):
        xs = [x for x in range(w) if kirmizi(px[x, y])]
        obeks = kume(xs, 6) if xs else []
        dar = [o for o in obeks if o[-1] - o[0] <= 40]
        if len(dar) >= 5: etiket_satirlari.append(y)
    satirlar = [b for b in kume(etiket_satirlari, 2) if 7 <= len(b) <= 12]
    hucreler = []
    onceki_alt = 0
    # Satır adımı: bölüm başlıkları (siyah yazı) bazı aralıkları büyütür; ortancası alınır
    farklar_adim = sorted(b[0] - a[0] for a, b in zip(satirlar, satirlar[1:]))
    adim = farklar_adim[len(farklar_adim) // 2]
    for sira, sat in enumerate(satirlar):
        ust, alt = sat[0], sat[-1]
        xs = sorted(set(x for y in sat for x in range(w) if kirmizi(px[x, y])))
        etiketler = [e for e in kume(xs, 8) if e[-1] - e[0] <= 44]
        merkezler = [(g[0] + g[-1]) / 2 for g in etiketler]
        # Beklenen sayıya uydur: fazlaysa en yakın iki öbeği birleştir (kodun iki yarısı ayrı çıkmış),
        # azsa en geniş boşluğa bir merkez ekle (kod yazısı bir şeyin altında kalmış)
        beklenen = SATIR_SAYILARI[dosya][sira] if sira < len(SATIR_SAYILARI[dosya]) else len(merkezler)
        while len(merkezler) > beklenen:
            i = min(range(len(merkezler) - 1), key=lambda k: merkezler[k + 1] - merkezler[k])
            merkezler[i:i + 2] = [(merkezler[i] + merkezler[i + 1]) / 2]
        while len(merkezler) < beklenen and len(merkezler) > 1:
            i = max(range(len(merkezler) - 1), key=lambda k: merkezler[k + 1] - merkezler[k])
            merkezler.insert(i + 1, (merkezler[i] + merkezler[i + 1]) / 2)
        farklar = sorted(b - a for a, b in zip(merkezler, merkezler[1:]))
        hucre_genis = farklar[len(farklar) // 2] if farklar else 50
        for m in merkezler:
            hucreler.append((m, max(onceki_alt, ust - (adim - 11), KESIM_BASLANGIC.get((dosya, sira), 0)), ust - 1, hucre_genis))
        onceki_alt = alt + 2
    if len(hucreler) != len(kodlar):
        print(f'!! {dosya}: {len(hucreler)} hücre bulundu, {len(kodlar)} bekleniyordu', file=sys.stderr)
    for (m, y0, y1, gw), kod in zip(hucreler, kodlar):
        x0, x1 = int(m - gw / 2), int(m + gw / 2)
        if y1 <= y0 or x1 <= x0: continue
        parca = im.crop((max(0, x0), max(0, y0), min(w, x1), y1))
        parca = beyaz_yok(parca)
        kutu = parca.getbbox()
        if kutu: parca = parca.crop(kutu)
        parca = kenar_temizle(parca)
        k = kat
        if kat == 'alt+aksesuar': k = 'alt' if kod.startswith('L') else 'aksesuar'
        klasor = os.path.join(cikis, k)
        os.makedirs(klasor, exist_ok=True)
        parca.save(os.path.join(klasor, kod + '.png'))
        sonuc[kod] = {'kategori': k, 'renk': ortalama_renk(parca), 'en': parca.size[0], 'boy': parca.size[1]}
    print(dosya, len(hucreler), 'hücre')
json.dump(sonuc, open(os.path.join(cikis, 'parcalar.json'), 'w'), ensure_ascii=False, indent=0)
print('toplam', len(sonuc))

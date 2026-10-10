"""parca-kes.py'nin ürettiği parcalar.json'dan src/lib/parca-verisi.ts üretir.
Kullanım: python3 araclar/parca-verisi-uret.py araclar/parcalar.json src/lib/parca-verisi.ts
Stok burada YOK (örnek değerler katalog.ts'te); yalnız görselden çıkan bilgi: kod, kategori, renk, oran.
"""
import json, re, sys
veri = json.load(open(sys.argv[1]))
def anahtar(kod):
    return (kod[0] if '-' in kod else '', int(re.findall(r'\d+', kod)[-1]))
sirali = {}
for kat in ['yuz', 'sac', 'ust', 'alt', 'aksesuar']:
    sirali[kat] = sorted([k for k, v in veri.items() if v['kategori'] == kat], key=anahtar)
satirlar = ['// ÜRETİLDİ: araclar/parca-verisi-uret.py (Shopier ekran görüntülerinden). Elle düzenleme; yeniden üret.',
            '// renk: parçanın ortalama rengi (3B modelde saç, alt ve üst gövde rengi için). en/boy: küçük resmin pikseli.',
            '', "export type ParcaKategori = 'yuz' | 'sac' | 'ust' | 'alt' | 'aksesuar';", '',
            'export interface ParcaGorsel { kod: string; kategori: ParcaKategori; renk: string; en: number; boy: number }', '',
            'export const PARCA_VERISI: ParcaGorsel[] = [']
for kat, kodlar in sirali.items():
    for kod in kodlar:
        v = veri[kod]
        satirlar.append(f"  {{ kod: '{kod}', kategori: '{kat}', renk: '{v['renk']}', en: {v['en']}, boy: {v['boy']} }},")
satirlar.append('];')
open(sys.argv[2], 'w').write('\n'.join(satirlar) + '\n')
print({k: len(v) for k, v in sirali.items()})

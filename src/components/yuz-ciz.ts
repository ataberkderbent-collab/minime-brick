import { type YuzStili, yuzStili } from '@/lib/parca-stil';

// Lego yüzünü yüksek çözünürlükte (1024 px) tuvale çizer; doku kafa silindirinin önüne sarılır.
// Tuvalin yatayı kafanın çevresinin ~%55'i, dikeyi kafa yüksekliği. Yüz merkezi (0.5, 0.5).

const SARI = '#f5c518';
const KOYU = '#1a1a1a';
const onbellek = new Map<string, HTMLCanvasElement>();

function goz(g: CanvasRenderingContext2D, x: number, y: number, r: number, kirpik: boolean) {
  g.fillStyle = KOYU;
  g.beginPath();
  g.ellipse(x, y, r * 0.78, r, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#fff';
  g.beginPath();
  g.arc(x - r * 0.28, y - r * 0.3, r * 0.26, 0, Math.PI * 2);
  g.fill();
  if (kirpik) {
    g.strokeStyle = KOYU;
    g.lineWidth = r * 0.22;
    g.lineCap = 'round';
    const yon = x < 512 ? -1 : 1;
    for (const a of [-0.55, -0.2, 0.15]) {
      g.beginPath();
      g.moveTo(x + yon * r * 0.7 * Math.cos(a), y - r * 0.9 * Math.sin(a + 0.9));
      g.lineTo(x + yon * r * 1.25 * Math.cos(a - 0.2), y - r * 1.45 * Math.sin(a + 0.9));
      g.stroke();
    }
  }
}

function kas(g: CanvasRenderingContext2D, x: number, y: number, kalin: number, egim: number) {
  g.strokeStyle = KOYU;
  g.lineWidth = kalin;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(x - 62, y + egim);
  g.quadraticCurveTo(x, y - 22, x + 62, y - egim);
  g.stroke();
}

export function yuzTuvali(kod: string): HTMLCanvasElement {
  const var_ = onbellek.get(kod);
  if (var_) return var_;
  const s: YuzStili = yuzStili(kod);
  // Yatay 2,5 : 1 (kafa çevresinin önü), yüz ortada
  const w = 2560;
  const h = 1024;
  const t = document.createElement('canvas');
  t.width = w;
  t.height = h;
  const g = t.getContext('2d')!;
  g.fillStyle = s.ten ?? SARI;
  g.fillRect(0, 0, w, h);
  // Yüz özellikleri kafaya göre büyük olsun: merkez etrafında büyüt
  g.translate(w / 2, h / 2);
  g.scale(1.7, 1.7);
  g.translate(-w / 2, -h / 2);

  const cx = w / 2;
  const gozY = 470;
  const gozAra = 118;
  const gozR = 42;
  const kadin = kod.startsWith('K-');
  const kasKalin = { 1: 10, 2: 16, 3: 26 }[s.kas ?? (kadin ? 1 : 2)];
  const kasY = gozY - 95;

  // Yanak / çil
  if (s.yanak) {
    g.fillStyle = 'rgba(231, 76, 60, 0.35)';
    for (const dx of [-170, 170]) {
      g.beginPath();
      g.ellipse(cx + dx, gozY + 95, 46, 30, 0, 0, Math.PI * 2);
      g.fill();
    }
  }
  if (s.cil) {
    g.fillStyle = 'rgba(120, 70, 20, 0.55)';
    for (const [dx, dy] of [[-150, 70], [-120, 95], [-175, 105], [150, 70], [120, 95], [175, 105], [-135, 125], [135, 125]]) {
      g.beginPath();
      g.arc(cx + dx, gozY + dy, 6, 0, Math.PI * 2);
      g.fill();
    }
  }

  // Gözler
  const kirpik = s.goz === 'kirpik';
  if (s.goz === 'kapali') {
    g.strokeStyle = KOYU;
    g.lineWidth = 14;
    g.lineCap = 'round';
    for (const dx of [-gozAra, gozAra]) {
      g.beginPath();
      g.arc(cx + dx, gozY - 20, 40, 0.25 * Math.PI, 0.75 * Math.PI);
      g.stroke();
    }
  } else if (s.goz === 'kirp') {
    goz(g, cx - gozAra, gozY, gozR, false);
    g.strokeStyle = KOYU;
    g.lineWidth = 14;
    g.beginPath();
    g.arc(cx + gozAra, gozY - 20, 40, 0.25 * Math.PI, 0.75 * Math.PI);
    g.stroke();
  } else if (s.goz === 'gunes') {
    g.fillStyle = s.gozlukRenk ?? '#161616';
    for (const dx of [-gozAra, gozAra]) {
      g.beginPath();
      g.roundRect(cx + dx - 92, gozY - 52, 184, 104, 40);
      g.fill();
    }
    g.fillRect(cx - 30, gozY - 14, 60, 18);
    g.fillStyle = 'rgba(255,255,255,0.18)';
    for (const dx of [-gozAra, gozAra]) {
      g.beginPath();
      g.ellipse(cx + dx - 30, gozY - 22, 38, 14, -0.5, 0, Math.PI * 2);
      g.fill();
    }
  } else {
    goz(g, cx - gozAra, gozY, gozR, kirpik);
    goz(g, cx + gozAra, gozY, gozR, kirpik);
  }

  // Kaşlar
  if (s.goz !== 'gunes' || true) {
    const egim = s.goz === 'endise' ? 18 : s.agiz === 'yan' ? -10 : 0;
    kas(g, cx - gozAra, kasY, kasKalin, s.goz === 'endise' ? -egim : egim);
    kas(g, cx + gozAra, kasY, kasKalin, s.goz === 'endise' ? egim : s.agiz === 'yan' ? 10 : 0);
  }

  // Gözlük
  if (s.goz === 'gozluk' || s.goz === 'yuvarlak-gozluk') {
    g.strokeStyle = s.gozlukRenk ?? KOYU;
    g.lineWidth = 16;
    for (const dx of [-gozAra, gozAra]) {
      g.beginPath();
      if (s.goz === 'yuvarlak-gozluk') g.arc(cx + dx, gozY, 84, 0, Math.PI * 2);
      else g.roundRect(cx + dx - 92, gozY - 66, 184, 132, 28);
      g.stroke();
    }
    g.beginPath();
    g.moveTo(cx - gozAra + 88, gozY - 10);
    g.lineTo(cx + gozAra - 88, gozY - 10);
    g.stroke();
  }

  // Ağız
  const agizY = 650;
  g.strokeStyle = KOYU;
  g.lineWidth = 16;
  g.lineCap = 'round';
  g.fillStyle = KOYU;
  const ruj = s.ruj;
  switch (s.agiz) {
    case 'gulumse':
      g.beginPath();
      g.arc(cx, agizY - 70, 150, 0.2 * Math.PI, 0.8 * Math.PI);
      if (ruj) {
        g.strokeStyle = ruj;
        g.lineWidth = 34;
      }
      g.stroke();
      if (!ruj) {
        for (const yon of [-1, 1]) {
          g.beginPath();
          g.arc(cx + yon * 124, agizY + 15, 10, 0, Math.PI * 2);
          g.fill();
        }
      }
      break;
    case 'sirit': {
      g.beginPath();
      g.moveTo(cx - 170, agizY - 30);
      g.quadraticCurveTo(cx, agizY + 150, cx + 170, agizY - 30);
      g.quadraticCurveTo(cx, agizY + 10, cx - 170, agizY - 30);
      g.fillStyle = ruj ?? KOYU;
      g.fill();
      g.fillStyle = '#fff';
      g.beginPath();
      g.moveTo(cx - 140, agizY - 18);
      g.quadraticCurveTo(cx, agizY + 70, cx + 140, agizY - 18);
      g.quadraticCurveTo(cx, agizY + 12, cx - 140, agizY - 18);
      g.fill();
      break;
    }
    case 'acik':
      g.fillStyle = ruj ?? KOYU;
      g.beginPath();
      g.ellipse(cx, agizY + 10, 90, 70, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#4a1216';
      g.beginPath();
      g.ellipse(cx, agizY + 18, 62, 44, 0, 0, Math.PI * 2);
      g.fill();
      break;
    case 'duz':
      g.beginPath();
      g.moveTo(cx - 110, agizY + 10);
      g.lineTo(cx + 110, agizY + 10);
      if (ruj) {
        g.strokeStyle = ruj;
        g.lineWidth = 30;
      }
      g.stroke();
      break;
    case 'yan':
      g.beginPath();
      g.moveTo(cx - 110, agizY + 20);
      g.quadraticCurveTo(cx + 40, agizY + 70, cx + 130, agizY - 20);
      if (ruj) {
        g.strokeStyle = ruj;
        g.lineWidth = 30;
      }
      g.stroke();
      break;
    case 'uzgun':
      g.beginPath();
      g.arc(cx, agizY + 110, 140, 1.22 * Math.PI, 1.78 * Math.PI);
      g.stroke();
      break;
    case 'dalgali':
      g.beginPath();
      g.moveTo(cx - 120, agizY + 10);
      for (let i = 1; i <= 6; i++) g.lineTo(cx - 120 + i * 40, agizY + 10 + (i % 2 ? 18 : -18));
      g.stroke();
      break;
  }

  // Sakal / bıyık
  if (s.sakal && s.sakal !== 'yok') {
    const r = s.sakalRenk ?? '#3d2a16';
    g.fillStyle = r;
    if (s.sakal === 'biyik' || s.sakal === 'tam-biyik') {
      g.beginPath();
      g.moveTo(cx, agizY - 75);
      g.quadraticCurveTo(cx - 110, agizY - 120, cx - 175, agizY - 40);
      g.quadraticCurveTo(cx - 90, agizY - 60, cx, agizY - 45);
      g.quadraticCurveTo(cx + 90, agizY - 60, cx + 175, agizY - 40);
      g.quadraticCurveTo(cx + 110, agizY - 120, cx, agizY - 75);
      g.fill();
    }
    if (s.sakal === 'tam' || s.sakal === 'tam-biyik') {
      g.beginPath();
      g.moveTo(cx - 300, gozY + 40);
      g.quadraticCurveTo(cx - 290, agizY + 170, cx, agizY + 215);
      g.quadraticCurveTo(cx + 290, agizY + 170, cx + 300, gozY + 40);
      g.lineTo(cx + 230, gozY + 40);
      g.quadraticCurveTo(cx + 240, agizY + 40, cx + 150, agizY + 60);
      g.quadraticCurveTo(cx, agizY + 170, cx - 150, agizY + 60);
      g.quadraticCurveTo(cx - 240, agizY + 40, cx - 230, gozY + 40);
      g.closePath();
      g.fill();
    }
    if (s.sakal === 'kecisakal') {
      g.beginPath();
      g.moveTo(cx - 90, agizY + 60);
      g.quadraticCurveTo(cx, agizY + 230, cx + 90, agizY + 60);
      g.quadraticCurveTo(cx, agizY + 110, cx - 90, agizY + 60);
      g.fill();
    }
    if (s.sakal === 'kirli') {
      g.fillStyle = r;
      g.globalAlpha = 0.55;
      for (let i = 0; i < 260; i++) {
        const a = Math.random() * Math.PI;
        const rad = 200 + Math.random() * 110;
        const x = cx + Math.cos(a) * rad * 1.1;
        const y = agizY - 30 + Math.sin(a) * rad * 0.7;
        if (y > agizY - 20 || Math.abs(x - cx) > 190) g.fillRect(x, y, 6, 6);
      }
      g.globalAlpha = 1;
    }
  }
  if (s.kel) {
    g.strokeStyle = '#8a6d1f';
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(cx - 240, 250);
    g.quadraticCurveTo(cx, 200, cx + 240, 250);
    g.stroke();
  }
  onbellek.set(kod, t);
  return t;
}

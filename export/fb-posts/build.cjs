// Assembles the harvested Facebook posts into one self-contained HTML document
// (images inlined as data URIs) ready for Chrome's --print-to-pdf.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const RAW = path.join(__dirname, 'raw');
const IMG = path.join(ROOT, 'assets', 'fb');

// fbid -> { date (ISO), label (human, as Facebook shows it), image, title }
const META = {
  '1584095443513979': { date: '2026-08-31', time: '10:14', img: 'post-vdecnost.jpg',        ai: true },
  '1581624880427702': { date: '2026-08-28', time: '12:28', img: 'post-volna-mista.jpg',     ai: true },
  '1581546483768875': { date: '2026-08-28', time: '10:22', img: 'post-dekuji-17-lekci.jpg', ai: true },
  '1578113887445468': { date: '2026-08-24', time: '11:35', img: 'venku-strom.jpg',          ai: false },
  '1322400133016846': { date: '2025-10-17', time: '',      img: 'vikend-program.jpg',       ai: false },
  '1320742779849248': { date: '2025-10-15', time: '',      img: 'vikend-karta.jpg',         ai: false },
  '1279713413952185': { date: '2025-08-28', time: '',      img: 'hero-sunset-dekuji.jpg',   ai: false },
  '1218224500101077': { date: '2025-06-11', time: '',      img: 'qr-platba.jpg',            ai: false },
};

const MONTHS = ['ledna','února','března','dubna','května','června','července',
                'srpna','září','října','listopadu','prosince'];

const czDate = iso => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}`;
};

const mime = f => (f.endsWith('.png') ? 'image/png' : 'image/jpeg');

const dataUri = file => {
  const p = path.join(IMG, file);
  if (!fs.existsSync(p)) return null;
  return `data:${mime(file)};base64,${fs.readFileSync(p).toString('base64')}`;
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Facebook text -> paragraphs; lone bullet-ish lines become list items.
const body = txt => {
  const blocks = txt.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
  return blocks.map(b => {
    const lines = b.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 1 && lines.every(l => l.length < 90)) {
      return `<ul>${lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>`;
    }
    return `<p>${esc(b).replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
};

const posts = fs.readdirSync(RAW)
  .filter(f => f.startsWith('post-') && f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(RAW, f), 'utf8')))
  .filter(p => META[p.fbid])
  .map(p => ({ ...p, ...META[p.fbid] }))
  .sort((a, b) => b.date.localeCompare(a.date));

const logo = dataUri('logo-original.jpg');

const first = posts[posts.length - 1], last = posts[0];

const cards = posts.map((p, i) => {
  const uri = dataUri(p.img);
  const title = p.text.split('\n')[0].trim();
  const rest = p.text.split('\n').slice(1).join('\n').trim();
  return `
<article class="post">
  <header>
    <div class="meta">
      <span class="n">${String(posts.length - i).padStart(2, '0')}</span>
      <time>${czDate(p.date)}${p.time ? ` · ${p.time}` : ''}</time>
      ${p.ai ? '<span class="tag">AI obsah</span>' : ''}
    </div>
    <h2>${esc(title)}</h2>
  </header>
  ${uri ? `<figure><img src="${uri}" alt=""></figure>` : '<p class="missing">[obrázek nedostupný]</p>'}
  <div class="txt">${body(rest)}</div>
  <footer class="src">facebook.com/PinkPilatesCZ · ID příspěvku ${p.fbid}</footer>
</article>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<title>Pink Pilates — archiv příspěvků na Facebooku</title>
<style>
  @page { size: A4; margin: 18mm 16mm 16mm; }
  * { box-sizing: border-box; }
  body { margin:0; font:11pt/1.62 "Segoe UI","Helvetica Neue",Arial,sans-serif; color:#2B2226; }

  .cover { height: 245mm; display:flex; flex-direction:column; justify-content:center;
           text-align:center; page-break-after:always; }
  .cover img { width:64mm; margin:0 auto 14mm; }
  .cover h1 { font-size:26pt; font-weight:600; letter-spacing:.02em; margin:0 0 5mm; }
  .cover .sub { font-size:13pt; color:#6B5A62; margin:0 0 16mm; }
  .cover dl { display:grid; grid-template-columns:auto auto; gap:2.5mm 7mm;
              justify-content:center; font-size:10.5pt; margin:0; }
  .cover dt { color:#6B5A62; text-align:right; }
  .cover dd { margin:0; text-align:left; font-weight:600; }
  .cover .note { margin:16mm auto 0; max-width:120mm; font-size:9.5pt; line-height:1.6;
                 color:#6B5A62; border-top:.4mm solid #E5327A; padding-top:5mm; text-align:left; }

  .post { page-break-before:always; page-break-inside:avoid; }
  .post header { border-bottom:.35mm solid #E8DACE; padding-bottom:3mm; margin-bottom:5mm; }
  .meta { display:flex; align-items:center; gap:4mm; font-size:8.5pt; letter-spacing:.09em;
          text-transform:uppercase; color:#6B5A62; margin-bottom:2.5mm; }
  .meta .n { font-weight:700; color:#E5327A; }
  .meta .tag { border:.3mm solid #E8DACE; border-radius:2mm; padding:.6mm 2mm;
               letter-spacing:.05em; text-transform:none; }
  .post h2 { font-size:15pt; font-weight:600; line-height:1.25; margin:0; }

  figure { margin:0 0 5mm; text-align:center; }
  figure img { max-width:100%; max-height:118mm; object-fit:contain; }

  .txt p { margin:0 0 3.4mm; }
  .txt ul { margin:0 0 3.4mm; padding-left:5mm; }
  .txt li { margin-bottom:1.2mm; }
  .missing { color:#9A8B92; font-style:italic; }

  .src { margin-top:6mm; padding-top:2.5mm; border-top:.3mm solid #F0E6DC;
         font-size:8pt; color:#9A8B92; }
</style>
</head>
<body>

<section class="cover">
  ${logo ? `<img src="${logo}" alt="Pink Pilates">` : ''}
  <h1>Archiv příspěvků na Facebooku</h1>
  <p class="sub">Pink Pilates · facebook.com/PinkPilatesCZ</p>
  <dl>
    <dt>Období</dt><dd>${czDate(first.date)} – ${czDate(last.date)}</dd>
    <dt>Počet příspěvků</dt><dd>${posts.length}</dd>
    <dt>Export vytvořen</dt><dd>${czDate(new Date().toISOString().slice(0, 10))}</dd>
  </dl>
  <p class="note"><strong>Rozsah exportu.</strong> Tento archiv obsahuje pouze příspěvky,
  které Facebook zpřístupňuje ve veřejném zobrazení stránky. Kompletní historii lze získat
  jedině ze správcovského účtu stránky (Meta Business Suite nebo stažení informací o stránce).
  Příspěvky označené <em>AI obsah</em> nesou toto označení přímo na Facebooku.
  Datum a čas jsou převzaty tak, jak je Facebook zobrazuje.</p>
</section>

${cards}

</body>
</html>`;

const out = path.join(__dirname, 'pink-pilates-fb-archiv.html');
fs.writeFileSync(out, html, 'utf8');
console.log(`${posts.length} posts -> ${out} (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
posts.forEach(p => console.log(`  ${p.date}  ${p.img.padEnd(26)} ${p.text.split('\n')[0].slice(0, 52)}`));

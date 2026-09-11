# Pink Pilates — pinkpilates.cz

Statický web pro Pink Pilates s Péťou (Petra Brenerová), kurzy Pilates ve Střelicích u Brna
a v Nebovidech. Žádný build, žádné závislosti — jen HTML, CSS a obrázky.

## Struktura

```
site/                 ← co se publikuje (kořen webu)
  index.html          jediná stránka
  style.css           veškeré styly, jedna sada barevných tokenů
  og.jpg              náhled pro sdílení (1200×630)
  robots.txt
  sitemap.xml
  CNAME               pinkpilates.cz
  .nojekyll           vypne zpracování Jekyllem na GitHub Pages
  assets/             fotky ve WebP + logo
.github/workflows/    automatický deploy
assets/               zdrojové fotky a materiály z Facebooku (nepublikuje se)
docs/                 podklady a rešerše (nepublikuje se)
export/               archiv facebookových příspěvků (nepublikuje se)
```

Publikuje se **jen obsah složky `site/`**. Zbytek repozitáře jsou pracovní materiály.

## Lokální náhled

```bash
python -m http.server 4321 --directory site
```

Pak otevřít <http://localhost:4321>. (V Claude Code stačí `.claude/launch.json`.)

## Nasazení

Push do větve `main` spustí workflow `.github/workflows/deploy.yml`, který obsah `site/`
publikuje na GitHub Pages.

### Jednorázové nastavení po vytvoření repozitáře

1. **Settings → Pages → Build and deployment → Source:** přepnout na **GitHub Actions**.
2. **Settings → Pages → Custom domain:** vyplnit `pinkpilates.cz` a uložit.
3. Po ověření domény zaškrtnout **Enforce HTTPS**.

### DNS u registrátora domény

Pro apex doménu (`pinkpilates.cz`) čtyři A záznamy:

```
@   A   185.199.108.153
@   A   185.199.109.153
@   A   185.199.110.153
@   A   185.199.111.153
```

A pro `www` variantu jeden CNAME na `<uzivatel>.github.io.`

Vydání certifikátu trvá po změně DNS obvykle desítky minut.

## Údržba

Věci, které se mění mezi sezónami, jsou na jednom místě v `site/index.html`:

| Co | Kde |
|---|---|
| Data zahájení kurzu | `.start-note` v obou kartách + box `.current-status` |
| Číslo sezóny | první `<li>` v `.trust-strip` (schválně bez letopočtu, aby text nestárl) |
| Ceny | `.price` v kartách **a** `offers.price` ve strukturovaných datech v `<head>` |
| Časy lekcí | `.row` v kartách **a** `openingHoursSpecification` v `<head>` |

Po změně cen nebo časů je potřeba upravit **obě místa** — viditelný text i JSON-LD.

## Co zbývá z auditu

Vědomě neuděláno (rozhodnutí zadavatele):

- reference a hodnocení od cvičenců
- sekce častých otázek (parkování, šatny, platba, bolavá záda)
- popis průběhu hodiny a velikost skupiny
- kvalifikace lektorky
- Pink Individual, Pink Office, letní venkovní lekce

Zbývá dodat:

- **IČO do patičky** — u placené služby se očekává identifikace podnikatele
- **vysvětlení rozdílu cen** 1 200 Kč (Střelice) vs. 1 350 Kč (Nebovidy)

# verkkosivu_testaaja

Automaattinen verkkosivun testausagentti. Lataa annetun URL:n headless-selaimella ja tarkistaa:

- HTTP-statuksen ja sivun latausajan
- rikkinäiset linkit (samalta ja muilta domaineilta)
- rikkinäiset kuvat ja puuttuvat alt-tekstit
- lomakkeet (action/method/kenttien määrä)
- JavaScript-konsoli- ja sivuvirheet

## Asennus

```bash
npm install
npx playwright install chromium
```

## Käyttö

```bash
node src/cli.js https://esimerkki.fi
```

Valinnaiset liput:

- `--json` — tulosta raportti JSON-muodossa (sopii CI-putkiin)
- `--headed` — aja selain näkyvässä tilassa (debuggausta varten)
- `--timeout=30000` — sivun latauksen aikakatkaisu millisekunteina

Ohjelma palauttaa exit-koodin `1`, jos sivulta löytyy ongelmia (rikkinäinen linkki/kuva,
huono HTTP-status tai konsolivirheitä), muuten `0`. Tämä mahdollistaa käytön osana
CI/CD-putkea.

## Esimerkki

```bash
node src/cli.js https://esimerkki.fi
```

```
==================================================
Testattu sivu: https://esimerkki.fi
==================================================
Otsikko:          Esimerkki
HTTP-status:      200 (OK)
Latausaika:       120 ms

Linkit (12 kpl, 8 sisäistä)
  Rikkinäisiä linkkejä: 1
    - https://esimerkki.fi/vanha-sivu -> 404

...

TULOS: Löytyi ongelmia.
==================================================
```

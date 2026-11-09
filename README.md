# Cartea mea de retete

Aplicatie personala pentru retete: le gasesti, le adaptezi, le planifici pe saptamana si faci lista de cumparaturi. Fara server si fara build. Publicata pe GitHub Pages. Datele tale raman in browser; nimic nu se trimite nicaieri in afara de cererile catre Anthropic, facute doar cand apesi un buton.

## Ce face (pe sectiuni)
- **Retete**: *Idei* (retete generate de AI din ce ai in casa, cu aparatele tale), *Biblioteca* (cartile tale de retete, cu cautare, filtre, preferinte alimentare si corectarea retetelor) si *Colectia mea* (ce pastrezi, intr-o singura lista cu filtrul Toate / Favorite / Generate de AI / Scrise de mine: retetele salvate din idei, cele scrise de tine si cele din carti marcate favorite).
- **Planific**: *Meniu* saptamanal (inclusiv "Propune-mi un meniu"), *Cumparaturi* (grupate pe categorii, cu bifare) si *Debara* (ce ai in casa).
- **Setari**: Cont (cheia API), Aparate, Alimente (categorii si preferinte), Etichete retete, Mese (la ce masa se potriveste fiecare categorie), Carti (incarcarea si descarcarea cartilor) si Date (copie de siguranta).

AI-ul (Anthropic) se foloseste doar cand apesi: idei, reteta completa, adaptare, calcul de macronutrienti si, optional, un meniu generat. Restul (cautare, meniu propus, lista, debara) merge local si gratuit.

## Fisiere
- `index.html` - structura paginii (taburi, sectiuni, formulare)
- `style.css` - aspect (tema deschisa/inchisa prin variabile CSS)
- `app.js` - toata logica, cu sectiuni marcate `===== NUME =====` si un cuprins in primele linii
- `sw.js`, `manifest.webmanifest`, `icon-*.png` - instalare ca aplicatie si functionare fara net (se urca langa `index.html`)
- `CHANGELOG.md` - istoricul versiunilor
- `tests/` - teste automate cu Playwright (`test_*.py`, un ajutor comun in `_h.py`; le rulezi dupa fiecare modificare)
- Cartile tale (fisiere JSON) NU intra in repo public: le incarci din Setari -> Carti. `retete.json`, daca exista, este doar un exemplu.

## Cand modifici ceva
1. Schimba `APP_V` in `app.js` si numarul `?v=...` din `index.html` (pentru ca GitHub Pages sa nu serveasca fisiere vechi din cache).
2. Ruleaza testele: `python tests/test_etichete_si_vizualizare.py` etc. (fiecare afiseaza rezultatele; `erori: []` inseamna fara erori JS).
3. Adauga o nota in `CHANGELOG.md`.
4. Publica toate fisierele modificate.

## Reguli de cod
- Orice text din model sau din JSON trece prin `esc()` inainte de `innerHTML`.
- Biblioteca (cartile incarcate) sta in IndexedDB (`saveStored` / `getStored` / `STORED`); nu scrie direct `localStorage.rbook`.
- Datele noi in localStorage: adauga cheia in `BK_KEYS` (copia de siguranta) si in comentariul de la inceputul `app.js`.
- Cheia API nu intra niciodata in fisiere din repo; sta doar in localStorage si se trimite doar catre api.anthropic.com.
- Fara informatie afisata de doua ori si fara ceva de corectat in doua locuri: o sectiune pentru fiecare scop.

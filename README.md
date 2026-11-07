# Retete

Aplicatie personala, fara server si fara build. Publicata pe GitHub Pages.

## Fisiere
- `index.html` - structura paginii (taburi, sectiuni, formulare)
- `style.css` - aspect (tema deschisa/inchisa prin variabile CSS)
- `app.js` - toata logica, cu sectiuni marcate `===== NUME =====` si un cuprins in primele linii
- `retete.json` - biblioteca ta din carte. NU o pune in repo public; o incarci din Setari -> Retete din carti
- `tests/` - teste automate cu Playwright (6 fisiere test_*.py; le rulezi dupa fiecare modificare)

## Cand modifici ceva
1. Schimba `APP_V` in `app.js` si numarul `?v=...` din `index.html` (pentru ca GitHub Pages sa nu serveasca fisiere vechi din cache).
2. Ruleaza testele: `python tests/test_etichete_si_vizualizare.py` etc. (fiecare afiseaza rezultatele; `erori: []` inseamna fara erori JS).
3. Publica toate fisierele modificate.

## Reguli de cod
- Orice text din model sau din JSON trece prin `esc()` inainte de `innerHTML`.
- Datele noi in localStorage: adauga cheia in `BK_KEYS` (copia de siguranta) si in comentariul de la inceputul `app.js`.
- Cheia API nu intra niciodata in fisiere din repo.

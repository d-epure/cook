# Cartea mea de retete

Aplicatie personala pentru retete: le gasesti, le adaptezi, le planifici si faci lista de cumparaturi, plus tabele de nutritie si masuri. Fara server si fara build. Publicata pe GitHub Pages. Datele tale raman in browser; nimic nu se trimite nicaieri in afara de cererile catre Anthropic, facute doar cand apesi un buton.

## Ce face (pe sectiuni)
- **Retete**
  - *Idei*: retete generate de AI din ce ai in casa, cu aparatele tale active, sau cautate pe web. Cat timp lipsesc pasi esentiali apare "Primii pasi".
  - *Biblioteca*: cartile tale de retete, cu cautare, filtre (carte, categorie, eticheta, stare, ce ai in debara, jurnal, preferinte), paginare ("Arata mai multe"), corectarea retetelor si jurnal (stele, "Am gatit", notite) pe fiecare reteta. Retetele se afiseaza fara diacritice.
  - *Colectia mea*: ce pastrezi, intr-o lista cu filtrele Toate / Favorite / Generate de AI / Scrise de mine.
- **Planific**
  - *Meniu*: azi si maine sau saptamana, cu macro estimate si "Propune-mi un meniu" (din Biblioteca, Debara, preferinte si Mese). "Am gatit" scrie in jurnalul retetei.
  - *Cumparaturi*: lista pe produse sau pe retete (cu sursa fiecarui produs), grupata pe categorii, cu bifare, "In debara" si ascunderea produselor din debara.
  - *Debara*: ce ai deja, pe categorii, cu marcaje (proaspat, congelat, uscat, conserva); un singur camp pentru cautare si adaugare. "Am terminat" trimite produsul inapoi in Cumparaturi.
- **Info** (date din `nutri.js`, fara legatura cu restul datelor)
  - *Ingrediente*: calorii, proteine, carbohidrati, grasimi, iar la atingere fibre, minerale si vitamine, pentru o cantitate la alegere; filtru pe grupa, sortare si cautare.
  - *Masuri*: cat cantareste o lingura, o lingurita sau o cana din alimentele care se masoara asa.
  - *Gatire*: sfaturi generale pentru cine invata sa gateasca, pe teme pliabile: tehnici de baza, timpi si temperaturi, siguranta alimentara, inlocuiri si cum repari o mancare.
  - Sursa: USDA National Nutrient Database for Standard Reference, versiunea 28 (domeniu public), plus drojdia inactiva dupa eticheta produsului.
- **Setari**: AI si cheie (cheia API, modele), Aparate, Preferinte alimente, Categorii alimente, Etichete retete, Mese (la ce masa se potriveste fiecare categorie), Carti (incarcarea, corectiile si descarcarea cartilor), Backup (in fisier, copii automate in browser, Dropbox) si Despre (versiune si istoric).

AI-ul (Anthropic) se foloseste doar cand apesi: idei, reteta completa, adaptare, estimare de macro si, optional, un meniu generat. Restul (cautare, meniu propus, liste, debara, Info) merge local si gratuit.

Portii: numarul se confirma separat de restul verificarilor (buton "Confirma numarul de portii" in editor); "-" inseamna ca nu se aplica. Corectii in masa (portii, marcaje) se aplica din Setari > Carti, "Aplica un fisier de corectii", fara sa inlocuiasca retetele.

Macro pe reteta: butonul "Calculeaza din Info" (in reteta deschisa) calculeaza local din Info > Ingrediente. Ingredientele fara date le cauti cu AI sau le completezi manual; se salveaza local (cheia `rfd`, inclusa in backup) si apar in Info > Ingrediente, "Adaugate de tine". Greutatile pe bucata si cuvintele fara calorii sunt in `nutri.js` (`NUTRI.P`, `NUTRI.Z`).

## Backup si actualizari

Datele tale stau in browser (localStorage si IndexedDB), nu in fisierele aplicatiei. Incarcarea unei versiuni noi in repo nu le sterge, inclusiv cheia API (`rk`) ramane in browser.

**Backup complet** (Setari > Backup > Backup in fisier, "Descarca backup"): biblioteca intreaga cu toate retetele asa cum sunt (portii, `pna`, marcaje de verificat, etichete, text editat, macro), alimentele adaugate de tine (`rfd`, cu cei 27 de nutrienti si marca AI/manual), retete salvate, favorite, jurnal si notite, meniu, tinte de macro, preferinte de alimente, mese pe categorie, definitiile etichetelor, aparate, debara, lista de cumparaturi, categoriile alimentelor, modelele AI alese. Nu include cheia API si datele de conectare Dropbox (intentionat) si nici datele Info din `nutri.js` (vin cu aplicatia). Se restaureaza din Setari > Backup, nu reincarcand fisierele cartilor.

**Copii automate** (Setari > Backup): in IndexedDB, ultimele 3, cel mult una la 20 de ore, plus una inainte de orice restaurare sau preluare din Dropbox.

**Sincronizare Dropbox** (Setari > Backup > Sincronizare Dropbox, de la 3.0.0): un singur fisier `sync.json` in folderul aplicatiei din Dropbox-ul fiecaruia. Aplicatia Dropbox (App key `7hvolba2cog2zy8`, cheie publica, fara secret, PKCE) e a proprietarului; fiecare utilizator doar apasa "Conecteaza Dropbox" o data pe fiecare dispozitiv si se logheaza cu contul lui. La sincronizare se combina in 3 pasi: starea de la ultima sincronizare (baza, in IndexedDB), starea de aici si cea din Dropbox. Ce s-a schimbat doar pe o parte se preia; modificarile pe elemente diferite se pastreaza amandoua; pe acelasi element castiga varianta de pe dispozitivul care sincronizeaza; modificarea bate stergerea. Se sincronizeaza tot ce intra in backup (inclusiv biblioteca si corectiile), nu cheia AI si nu cheile Dropbox. Frana: o sincronizare care ar sterge peste jumatate din biblioteca sau din retetele salvate se opreste si cere confirmare. La pornire datele noi se preiau singure si aplicatia se reincarca o data; in timpul folosirii apare o bara "Aplica acum". Pentru aplicatie Dropbox proprie: Setari > Backup > Sincronizare Dropbox > Avansat (Create app > Scoped access > App folder, permisiuni `files.metadata.read`, `files.content.read`, `files.content.write`, la "Redirect URIs" adresa afisata). Cheile `rdbk`, `rdbt`, `rdbl`, `rdbr`, `rdba` nu intra in backup. Fisierul `sync.json` are istoric de versiuni in Dropbox.

**Backup per carte** (Setari > Carti, "Descarca JSON" langa carte): doar retetele acelei carti, cu tot ce e scris pe ele (portii, marcaje, macro, text editat). Nu include alimentele tale (`rfd`), favoritele, jurnalul, notitele, meniul sau preferintele. Reincarcarea lui inlocuieste cartea respectiva.

**Fisierul de corectii** (Setari > Carti, "Aplica un fisier de corectii"): aplica portii si marcaje pe retetele deja incarcate, fara sa le inlocuiasca. E un fisier privat, nu se pune in repo.

Avertizare in Meniu: daca macro-ul din carte difera mult de calculul din Info, apare o nota sub reteta; "E in regula" o ascunde (campul `mok` pe reteta).

## Fisiere
- `index.html` - structura paginii (sectiuni, pagini, formulare)
- `style.css` - aspect (tema deschisa/inchisa prin variabile CSS)
- `app.js` - toata logica, cu sectiuni marcate `===== NUME =====`
- `nutri.js` - datele din Info (nutritie, masuri si sfaturile de gatire); se urca in repo la fiecare modificare
- `sw.js`, `manifest.webmanifest`, `icon-*.png` - instalare ca aplicatie si functionare fara net (se urca langa `index.html`)
- `CHANGELOG.md` - istoricul versiunilor (cel mai nou primul)
- `tests/` - teste automate cu Playwright (`test_*.py`, ajutor comun in `_h.py`)
- Cartile tale (fisiere JSON) NU intra in repo public: le incarci din Setari > Carti. `retete.json`, daca exista, este doar un exemplu.

## Cand modifici ceva
1. Schimba `APP_V` in `app.js` si numarul `?v=...` din `index.html` (pentru ca GitHub Pages sa nu serveasca fisiere vechi din cache).
2. Ruleaza testele, de exemplu `python tests/test_info.py` sau toate cu `for f in tests/test_*.py; do python $f; done`. Fiecare test afiseaza `OK`/`FAIL` si `probleme=N`; trebuie `probleme=0`.
3. Adauga o nota in `CHANGELOG.md` (versiunea noua sus).
4. Publica toate fisierele modificate, inclusiv `nutri.js` si `CHANGELOG.md` daca s-au schimbat.

## Reguli de cod
- Orice text din model sau din JSON trece prin `esc()` inainte de `innerHTML`; textul retetelor din carti se afiseaza prin `ed()` (`esc` fara diacritice).
- Biblioteca (cartile incarcate) sta in IndexedDB (`saveStored` / `getStored` / `STORED`); nu scrie direct `localStorage.rbook`.
- Datele noi in localStorage: adauga cheia in `BK_KEYS` (copia de siguranta) si in comentariul de la inceputul `app.js`.
- Cheia API nu intra niciodata in fisiere din repo; sta doar in localStorage (`rk`) si se trimite doar catre api.anthropic.com.
- Text in romana fara diacritice in interfata.
- Fara informatie afisata de doua ori si fara ceva de corectat in doua locuri: o sectiune pentru fiecare scop.

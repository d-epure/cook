# Backlog - Cartea mea de retete

Starea la versiunea 5.2.1 (18 noiembrie 2026). Fisierul vine in fiecare pachet si se actualizeaza la fiecare versiune: ce e facut trece in CHANGELOG.md, aici ramane ce urmeaza. Regulile de lucru: fara diacritice, changelog la fiecare versiune, README aliniat, o singura sectiune per scop, interfata simpla.

## De verificat pe dispozitiv real
Versiunile 3.20.0 - 5.2.1 au fost testate doar in browser simulat (teste in folderul `teste/`). Raman de confirmat pe telefon si laptop (in plus: butoanele A-/A+, randul cartilor din Setari si cosurile de gunoi, la 90% si 150%):
- Dupa actualizare: favoritele, jurnalul, meniul si "Retetele mele" sunt la locul lor; Biblioteca are 952 de retete livrate plus ale tale.
- Consola browserului (F12) fara erori "Content Security Policy" la: Idei cu AI, backup in Dropbox, descarcarea unui backup, butonul WhatsApp.
- Aplicatia porneste in mod avion dupa prima incarcare (service worker cu cache propriu).
- Sincronizare Dropbox intre doua dispozitive, ambele pe aceeasi versiune: loturile de Meal prep adaugate pe amandoua raman toate.
- Asezarea pe telefon: pilulele din Biblioteca, butoanele din Cumparaturi, ziua din meniu cu patru mese.
- Pagina Idei fara cheie API si cu cheie.
- 5.0.0: la prima pornire retetele din fosta Colectia mea apar in Biblioteca > Ale mele, cu favoritele, jurnalul, Meal prep si meniul legate; pasii pe aparat si Mod gatit la retetele AI; jurnalul de mese pe telefon (randul cu portii, campul de grame, dialogul "Am mancat"); sincronizarea Dropbox cu un dispozitiv inca pe 4.30 (acela poate readuce retete in vechea lista; 5.0.0 le muta din nou, fara dubluri).
- 4.30.0: - / + pe randul planificat din Meal prep (incape langa Am gatit si cosul de gunoi la 90% si 150%), lista de cumparaturi dupa schimbarea portiilor, campul Observatii din Editeaza reteta.

## Urmeaza (in ordinea recomandata)
0. Lotul agreat pe 16 noiembrie e facut (4.13.0 - 4.18.0). Raman de testat pe telefon: cardul Meal prep cu zonele Planificat / Gatit; randul de sus din Meniu (iconitele cos / bagheta / cos de gunoi, apasare lunga pentru titlu).
1. Retetele noi (air fryer, asiatic, traditional romanesc, mic dejun cu carne, gustari, peste) sunt gatite pe hartie, nu si in bucatarie: de corectat timpi, cantitati si formulari pe masura ce le gatesti tu sau testerii. Corectiile se fac in fisierele din `carti/`, cu `v` crescut in `carti.json`.
2. Alimentele adaugate de utilizator: dublurile (pastarnac, rosii deshidratate) se sterg singure in 5.0.0. Raman de corectat de mana in Info: "burta de vita prefiarta" (valori de circa 2,5 ori prea mari), "Telemea light" (de luat de pe eticheta), "oase de vita cu maduva".
3. Baza ramane dominata de keto (circa 548 din 952 de retete au eticheta automata keto, din care 497 sunt cele doua carti keto; cartea Retete high-volume din 4.8.0 e fara keto). Daca deranjeaza la testare: mai multe retete non-keto sau mai putine supe keto.
4. Titluri lungi la supele keto (177 de titluri peste 60 de caractere) si perechea aproape identica "Ciorba de perisoare de porc cu dovlecei si rosii" (nr. 214 si 282).

## Nedecise (asteapta un raspuns)
- Revizia retetelor (4.30.1), ce n-am schimbat fara tine: "Crema de lamaie cu smantana" are scortisoara (merge si coaja de lamaie); "Clatite de ovaz cu iaurt si mere" a ramas fara varianta pereche (e dulce si are oua, deci nici cu carne, nici vegana n-are sens). De hotarat: raman, se schimba sau se scot.
- Info nu are "iaurt de soia" si "tofu matase" (tofu matase se potriveste cu tofu ferm, de circa doua ori mai caloric); valorile variantelor vegane sunt calculate de mana (iaurt de soia 50 kcal si 4 g proteine la 100 g, tofu matase 55 kcal si 4,8 g). De adaugat in Info?
- Propunere de meniu: loturile Meal prep se iau in calcul doar daca sunt gatite in ultimele 5 zile sau planificate, cel mult o masa pe zi (4.30.0). De la 5.0.0 portiile mancate ("Am mancat") se scad din lot.
- Retete fara numar de portii (1 in backup): au acum macro la 100 g in reteta; ramane de hotarat cum intra in totalul zilei (cu nota "N retete fara numar de portii nu sunt incluse") si calculatorul de greutate gatita.

- Retetele Sanda Marin fara ingrediente (circa 190) sunt ascunse din 5.0.0, cu exceptia celor folosite. Cele pe care le gatesti se completeaza de mana (Editeaza reteta), la nevoie.
- Precizie macro calculat din Info: pe 484 de retete cu macro din carte si cel putin 80% ingrediente cu date, mediana calcul/carte e 1,02, dar doar 47% sunt in +-25% si 68% in +-40% (BT FIT Cookbook V2: mediana 0,68, valorile din carte sunt mai mari). Valorile calculate sunt orientative; motorul de meniu pe tinta zilei trebuie sa tina cont.

## Amanate (decise pe 15 noiembrie: nu se fac inca)
- Mai multe profiluri de adulti: lista de profiluri in Setari, comutator "Arata pentru" in Meniu, portii pornite de la numarul de persoane.
- Sfaturi structurate: pastrare (zile la frigider, luni la congelator), varianta cu sau fara carne ca link direct, proteina completa ca insigna.
- Stiluri de print sau PDF pentru o reteta.
- Data de expirare optionala in debara, la produsele proaspete.
- Profil si meniu pentru copii: tinte pe grupe de varsta (formula si valorile de referinta din aplicatie sunt pentru adulti), portie ca fractiune din portia retetei, eventual mese diferite fata de adulti.
- Adaugare de reteta prin dictare vocala (idee din 16 noiembrie, nu se face acum): camp "Dicteaza sau lipeste reteta" plus buton "Structureaza" (AI: titlu, portii, ingrediente cu cantitate si unitate, pasi, fara diacritice), apoi verificare obligatorie in formularul existent (`newBook`) si salvare. Dictare recomandata de la tastatura telefonului (merge offline, zero cod pentru voce); butonul de microfon din aplicatie (recunoasterea vocala a browserului) doar optional: trimite sunetul la Google si e nesigur pe iPhone in aplicatia instalata. Fara cheie API, "Structureaza" e gri cu mesaj. De decis cand se reia: tastatura sau buton in aplicatie, buton separat "Adauga prin dictare" sau in formular, comportament fara cheie.
- Grafic de greutate si masuratori: scos din plan (decis pe 18 noiembrie).
- Jurnal de apa (prioritate mica, decis pe 17 noiembrie: nu se face acum; ideea vine din comparatia cu Eat & Track).
- Import de retete din link, lista de cumparaturi partajata intre utilizatori, poze pe retete (decizii mai vechi).

## Rescrieri de structura (o versiune dedicata, dupa testarea cu utilizatori)
- Impartirea `app.js` pe module (cumparaturi, meniu, carti, backup), fara build.
- Un registru de migrari ordonat pe versiuni, in locul migrarilor imprastiate (5.0.0 a adus `v5Run`/`v5Data`; cele vechi, `sidRun`, `mcRun` etc., raman pentru backup-uri vechi).
- Codul vechi pentru retetele din `rs` (`renderRecipe` cu `kind:"saved"`, `aiEditForm`, ramurile `s:"s"`) ramane doar pentru restaurarea backup-urilor vechi si previzualizarea retetelor generate; de curatat dupa ce nu mai exista dispozitive pe 4.x.
- Scrierea partiala a bibliotecii (acum se rescrie intreaga la orice corectie).
- Font gazduit local in loc de Google Fonts.

## Limite cunoscute
- Cumparaturi: acelasi produs in masuri diferite (ex: smantana 0,5 pahar si 200 g) ramane pe doua linii; masurile de bucatarie (pahar, ceasca, lingura) nu se transforma in grame sau ml.
- Cumparaturi (5.1.5): cantitatea ceruta gatit (ex: 250 g piept de pui fiert) se aduna ca atare, fara conversie la crud (carnea pierde cam un sfert din greutate la fiert).
- Jurnalul (5.2.0) se calculeaza din Meniu la fiecare deschidere: daca editezi o reteta sau golesti o saptamana din Meniu, cifrele zilelor trecute se schimba (acceptat).
- Cheia API si tokenul Dropbox stau necriptate in browser (aplicatie fara server). Celelalte aplicatii de pe aceeasi adresa GitHub Pages le pot citi; folosesc insa alte chei, deci nu se suprascriu.
- Timpul si dificultatea retetelor sunt estimari automate ("aprox."); retetele lasate peste noapte apar cu circa 8 ore.
- Eticheta gluten-free se pune dupa lista de ingrediente; nu tine cont de urme sau contaminare.
- Sugestia de ambalaj din Cumparaturi acopera 11 produse cu marime uzuala.
- Debaraua nu tine cantitati; produsele din debara raman in lista de cumparaturi, ascunse. Forma ceruta de reteta se recunoaste dupa cuvinte (uscat, deshidratat, congelat, conserva, in suc propriu, proaspat).
- Sincronizare: o lista golita complet pe un dispozitiv nu sterge datele celuilalt daca acela a adaugat ceva intre timp (protectie).
- Biblioteca schimbata intr-un alt tab nu e semnalata (listele da).
- Restaurarea unui backup nou cere internet o data, pentru cartile livrate.

## Facut (detalii in CHANGELOG.md)
- 5.2.0 Jurnal doar de citit (calculat din Meniu, observatii pe zi, ultimele 7 zile), fara "Am mancat", portii si grame in Meniu, aliment din Info in Meniu, Meal prep consumat din Meniu, istoric de gatit automat. 5.1.x: X in dialoguri, zi stransa, condimente si muraturi in debara, acelasi produs pe o linie, Raioane debara.
- 5.1.1 Jurnalul se completeaza singur din Meniu doar pentru zilele trecute; azi cu "Am mancat". 5.1.0 Jurnalul completat din Meniu, micronutrientii mutati in Jurnal (zi si media pe 7 zile). 5.0.1 X sus in dialoguri, Alta varianta la mesele din Meal prep.
- 5.0.0 un singur model de reteta (retetele AI in Biblioteca, Ale mele, Cos, fara Colectia mea), 12 categorii comune cu capitol, jurnal de mese cu "Am mancat", macro din Info ca sursa principala, Sanda Marin fara ingrediente ascunse, curatenie de date, Setari pe 4 grupuri.
- 3.20.0 cumparaturi si debara fara dubluri, Meal prep fara blocaj. 3.21.0 masa Cina.
- 4.0.0 id stabil pe retetele salvate, tinta de proteine pe kg. 4.1.0 carti livrate cu aplicatia, corectii de continut, backup mic. 4.1.1 corectiile din auditul de calitate.
- 4.2.0 timp si dificultate, pilule in Biblioteca, aplicatia fara cheie API, cumparaturi. 4.3.0 categorii implicite, Leguminoase, ghid pentru alimente uscate, WhatsApp. 4.3.1 butonul "Vezi". 4.3.2 sincronizarea loturilor de Meal prep.
- 4.4.0 etichete automate (keto pe carbohidrati neti, gluten-free), tipul "metoda", linguri adunate cu grame. 4.5.0 36 de retete noi la air fryer. 4.6.0 60 de retete noi (asiatic, traditional romanesc, mic dejun cu carne, gustari, peste); biblioteca livrata are 856 de retete. 4.7.0 marcajele din debara legate de lista de cumparaturi. 4.7.1 fara dubluri la aceeasi masa, lista de cumparaturi fara orfani.

- Decis: fara ghid la prima deschidere (nu se mai propune).

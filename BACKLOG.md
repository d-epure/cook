# Backlog - Cartea mea de retete

Starea la versiunea 4.4.0 (15 noiembrie 2026). Fisierul vine in fiecare pachet si se actualizeaza la fiecare versiune: ce e facut trece in CHANGELOG.md, aici ramane ce urmeaza. Regulile de lucru: fara diacritice, changelog la fiecare versiune, README aliniat, o singura sectiune per scop, interfata simpla.

## De verificat pe dispozitiv real
Versiunile 3.20.0 - 4.4.0 au fost testate doar in browser simulat (teste in folderul `teste/`). Raman de confirmat pe telefon si laptop:
- Dupa actualizare: favoritele, jurnalul, meniul si "Retetele mele" sunt la locul lor; Biblioteca are 760 de retete livrate plus ale tale.
- Consola browserului (F12) fara erori "Content Security Policy" la: Idei cu AI, backup in Dropbox, descarcarea unui backup, butonul WhatsApp.
- Aplicatia porneste in mod avion dupa prima incarcare (service worker cu cache propriu).
- Sincronizare Dropbox intre doua dispozitive, ambele pe aceeasi versiune: loturile de Meal prep adaugate pe amandoua raman toate.
- Asezarea pe telefon: pilulele din Biblioteca, butoanele din Cumparaturi, ziua din meniu cu patru mese.
- Pagina Idei fara cheie API si cu cheie.

## Urmeaza (in ordinea recomandata)
1. Retete noi pentru echilibrarea bazei (acum 500 din 760 sunt keto). Tinta: circa 50 pe eticheta, impartite pe mic dejun, pranz / cina, desert, gustari. Goluri: air fryer (14 retete), asiatic (30), traditional romanesc (42), mic dejun cu carne (6), gustari (21), peste ca fel principal. Reguli: proteina completa sau garnitura recomandata in text; vegan inseamna si vegetarian; "asiatic" acopera si bucataria chinezeasca.
2. Alimentele adaugate de utilizator (date locale, nu se livreaza cu aplicatia): de corectat de mana in Ghid nutritie - "pastarnac" si "pastarnac, radacina" se sterg (exista in Ghid), "rosii deshidratate" se sterge (exista "Rosii uscate"), "burta de vita prefiarta" are valori de circa 2,5 ori prea mari, "Telemea light" de luat de pe eticheta, "oase de vita cu maduva" de verificat.
3. Titluri lungi la supele keto (177 de titluri peste 60 de caractere) si perechea aproape identica "Ciorba de perisoare de porc cu dovlecei si rosii" (nr. 214 si 282).

## Nedecise (asteapta un raspuns)
- Mai multe profiluri de adulti: lista de profiluri in Setari, comutator "Arata pentru" in Meniu, portii pornite de la numarul de persoane. De confirmat daca se face.
- Marcajele din debara (proaspat, congelat, uscat, conserva) legate de lista de cumparaturi: produs pe randuri separate pe forma si verificare pe forma ceruta de reteta. De clarificat ce se doreste exact.
- Sfaturi structurate: pastrare (zile la frigider, luni la congelator), varianta cu sau fara carne ca link direct, proteina completa ca insigna.
- Stiluri de print sau PDF pentru o reteta.
- Data de expirare optionala in debara, la produsele proaspete.
- "Goleste lista" si "Sterge bifate": acum la vedere; de vazut la testare daca sunt prea multe butoane pe telefon.

## Amanate
- Profil si meniu pentru copii: tinte pe grupe de varsta (formula si valorile de referinta din aplicatie sunt pentru adulti), portie ca fractiune din portia retetei, eventual mese diferite fata de adulti.
- Import de retete din link, lista de cumparaturi partajata intre utilizatori, poze pe retete (decizii mai vechi).

## Rescrieri de structura (o versiune dedicata, dupa testarea cu utilizatori)
- Impartirea `app.js` pe module (cumparaturi, meniu, carti, backup), fara build.
- O singura structura pentru ingrediente (`n/c/u` peste tot; retetele salvate folosesc `nume/cantitate/unitate`).
- Un registru de migrari ordonat pe versiuni, in locul migrarilor imprastiate.
- Scrierea partiala a bibliotecii (acum se rescrie intreaga la orice corectie).
- Font gazduit local in loc de Google Fonts.

## Limite cunoscute
- Cheia API si tokenul Dropbox stau necriptate in browser (aplicatie fara server). Celelalte aplicatii de pe aceeasi adresa GitHub Pages le pot citi; folosesc insa alte chei, deci nu se suprascriu.
- Timpul si dificultatea retetelor sunt estimari automate ("aprox."); retetele lasate peste noapte apar cu circa 8 ore.
- Eticheta gluten-free se pune dupa lista de ingrediente; nu tine cont de urme sau contaminare.
- Sugestia de ambalaj din Cumparaturi acopera 11 produse cu marime uzuala.
- Debaraua nu tine cantitati; produsele din debara raman in lista de cumparaturi, ascunse.
- Sincronizare: o lista golita complet pe un dispozitiv nu sterge datele celuilalt daca acela a adaugat ceva intre timp (protectie).
- Biblioteca schimbata intr-un alt tab nu e semnalata (listele da).
- Restaurarea unui backup nou cere internet o data, pentru cartile livrate.

## Facut (detalii in CHANGELOG.md)
- 3.20.0 cumparaturi si debara fara dubluri, Meal prep fara blocaj. 3.21.0 masa Cina.
- 4.0.0 id stabil pe retetele salvate, tinta de proteine pe kg. 4.1.0 carti livrate cu aplicatia, corectii de continut, backup mic. 4.1.1 corectiile din auditul de calitate.
- 4.2.0 timp si dificultate, pilule in Biblioteca, aplicatia fara cheie API, cumparaturi. 4.3.0 categorii implicite, Leguminoase, ghid pentru alimente uscate, WhatsApp. 4.3.1 butonul "Vezi". 4.3.2 sincronizarea loturilor de Meal prep.
- 4.4.0 etichete automate (keto pe carbohidrati neti, gluten-free), tipul "metoda", linguri adunate cu grame.

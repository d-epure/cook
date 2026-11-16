# Backlog - Cartea mea de retete

Starea la versiunea 4.22.0 (16 noiembrie 2026). Fisierul vine in fiecare pachet si se actualizeaza la fiecare versiune: ce e facut trece in CHANGELOG.md, aici ramane ce urmeaza. Regulile de lucru: fara diacritice, changelog la fiecare versiune, README aliniat, o singura sectiune per scop, interfata simpla.

## De verificat pe dispozitiv real
Versiunile 3.20.0 - 4.22.0 au fost testate doar in browser simulat (teste in folderul `teste/`). Raman de confirmat pe telefon si laptop (in plus: butoanele A-/A+, randul cartilor din Setari si cosurile de gunoi, la 90% si 150%):
- Dupa actualizare: favoritele, jurnalul, meniul si "Retetele mele" sunt la locul lor; Biblioteca are 956 de retete livrate plus ale tale.
- Consola browserului (F12) fara erori "Content Security Policy" la: Idei cu AI, backup in Dropbox, descarcarea unui backup, butonul WhatsApp.
- Aplicatia porneste in mod avion dupa prima incarcare (service worker cu cache propriu).
- Sincronizare Dropbox intre doua dispozitive, ambele pe aceeasi versiune: loturile de Meal prep adaugate pe amandoua raman toate.
- Asezarea pe telefon: pilulele din Biblioteca, butoanele din Cumparaturi, ziua din meniu cu patru mese.
- Pagina Idei fara cheie API si cu cheie.

## Urmeaza (in ordinea recomandata)
0. Lotul agreat pe 16 noiembrie e facut (4.13.0 - 4.18.0). Raman de testat pe telefon: cardul Meal prep cu zonele Planificat / Gatit; randul de sus din Meniu (iconitele cos / bagheta / cos de gunoi, apasare lunga pentru titlu).
1. Retetele noi (air fryer, asiatic, traditional romanesc, mic dejun cu carne, gustari, peste) sunt gatite pe hartie, nu si in bucatarie: de corectat timpi, cantitati si formulari pe masura ce le gatesti tu sau testerii. Corectiile se fac in fisierele din `carti/`, cu `v` crescut in `carti.json`.
2. Alimentele adaugate de utilizator (date locale, nu se livreaza cu aplicatia): de corectat de mana in Ghid nutritie - "pastarnac" si "pastarnac, radacina" se sterg (exista in Ghid), "rosii deshidratate" se sterge (exista "Rosii uscate"), "burta de vita prefiarta" are valori de circa 2,5 ori prea mari, "Telemea light" de luat de pe eticheta, "oase de vita cu maduva" de verificat.
3. Baza ramane dominata de keto (551 din 956 de retete au eticheta automata keto, din care 500 sunt cele doua carti keto; cartea Retete high-volume din 4.8.0 e fara keto). Daca deranjeaza la testare: mai multe retete non-keto sau mai putine supe keto.
4. Titluri lungi la supele keto (177 de titluri peste 60 de caractere) si perechea aproape identica "Ciorba de perisoare de porc cu dovlecei si rosii" (nr. 214 si 282).

## Nedecise (asteapta un raspuns)
- Retete fara numar de portii: macro pe 100 g in loc de pe portie, exclus din totalul zilei cu nota "N retete fara numar de portii nu sunt incluse" (plus, mai tarziu, calculator de greutate gatita).

## Urmeaza
- 4.22.1: buton in Meniu "N mese: fa Meal prep" cand aceeasi reteta apare de 2 sau mai multe ori fara lot; lotul planificat preia cumparaturile mesei (se scot partile "(meniu zi)"), fara dubluri in lista.

## Amanate (decise pe 15 noiembrie: nu se fac inca)
- Mai multe profiluri de adulti: lista de profiluri in Setari, comutator "Arata pentru" in Meniu, portii pornite de la numarul de persoane.
- Sfaturi structurate: pastrare (zile la frigider, luni la congelator), varianta cu sau fara carne ca link direct, proteina completa ca insigna.
- Stiluri de print sau PDF pentru o reteta.
- Data de expirare optionala in debara, la produsele proaspete.
- Profil si meniu pentru copii: tinte pe grupe de varsta (formula si valorile de referinta din aplicatie sunt pentru adulti), portie ca fractiune din portia retetei, eventual mese diferite fata de adulti.
- Adaugare de reteta prin dictare vocala (idee din 16 noiembrie, nu se face acum): camp "Dicteaza sau lipeste reteta" plus buton "Structureaza" (AI: titlu, portii, ingrediente cu cantitate si unitate, pasi, fara diacritice), apoi verificare obligatorie in formularul existent (`newBook`) si salvare. Dictare recomandata de la tastatura telefonului (merge offline, zero cod pentru voce); butonul de microfon din aplicatie (recunoasterea vocala a browserului) doar optional: trimite sunetul la Google si e nesigur pe iPhone in aplicatia instalata. Fara cheie API, "Structureaza" e gri cu mesaj. De decis cand se reia: tastatura sau buton in aplicatie, buton separat "Adauga prin dictare" sau in formular, comportament fara cheie.
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
- Debaraua nu tine cantitati; produsele din debara raman in lista de cumparaturi, ascunse. Forma ceruta de reteta se recunoaste dupa cuvinte (uscat, deshidratat, congelat, conserva, in suc propriu, proaspat).
- Sincronizare: o lista golita complet pe un dispozitiv nu sterge datele celuilalt daca acela a adaugat ceva intre timp (protectie).
- Biblioteca schimbata intr-un alt tab nu e semnalata (listele da).
- Restaurarea unui backup nou cere internet o data, pentru cartile livrate.

## Facut (detalii in CHANGELOG.md)
- 3.20.0 cumparaturi si debara fara dubluri, Meal prep fara blocaj. 3.21.0 masa Cina.
- 4.0.0 id stabil pe retetele salvate, tinta de proteine pe kg. 4.1.0 carti livrate cu aplicatia, corectii de continut, backup mic. 4.1.1 corectiile din auditul de calitate.
- 4.2.0 timp si dificultate, pilule in Biblioteca, aplicatia fara cheie API, cumparaturi. 4.3.0 categorii implicite, Leguminoase, ghid pentru alimente uscate, WhatsApp. 4.3.1 butonul "Vezi". 4.3.2 sincronizarea loturilor de Meal prep.
- 4.4.0 etichete automate (keto pe carbohidrati neti, gluten-free), tipul "metoda", linguri adunate cu grame. 4.5.0 36 de retete noi la air fryer. 4.6.0 60 de retete noi (asiatic, traditional romanesc, mic dejun cu carne, gustari, peste); biblioteca livrata are 856 de retete. 4.7.0 marcajele din debara legate de lista de cumparaturi. 4.7.1 fara dubluri la aceeasi masa, lista de cumparaturi fara orfani.

- Decis: fara ghid la prima deschidere (nu se mai propune).

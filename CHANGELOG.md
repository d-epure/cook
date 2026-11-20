# Istoric versiuni

Conventie: MAJOR.MINOR.PATCH. MINOR = functie noua; PATCH = reparatie/ajustare; MAJOR = schimbare de fundatie sau de structura a datelor.

## 5.7.1
- **Setari > Despre:** in locul istoricului modificarilor (util doar pentru dezvoltare) apare, pe scurt, ce face aplicatia: Retete, Meniu, Cumparaturi, Debara, Mai mult si unde stau datele tale. Versiunea ramane afisata.
- CHANGELOG.md si README.md raman doar in repo; aplicatia nu le mai citeste.

## 5.7.0
- **Gatire fara pilule:** cele 7 grupe (Baze, Timpi si temperaturi, Pastrare, Fara reteta, Leguminoase si vegetarian, Romaneasca, Sfaturi) sunt acum sectiuni pliabile, cu numarul de teme alaturi; temele din fiecare grupa sunt si ele pliabile, cu aceeasi sageata. Pilulele raman doar pentru filtre (Biblioteca).
- Pornesc toate stranse; poti deschide mai multe grupe; in aceeasi grupa e deschisa o singura tema odata. O grupa deschisa ramane deschisa si dupa o cautare.
- **Cautarea** arata doar grupele cu teme potrivite, deschise, cu temele potrivite deschise si cuvantul evidentiat.
- Curatenie: scoasa clasa CSS veche `.gg` (titluri de grupa nefolosite).
- Teste actualizate (`teste/test_v5.js`, `teste/test_meniu_cumparaturi.js`).

## 5.6.1
- **Micronutrientii revin in Meniu:** sub Macro, la fiecare zi deschisa, inclusiv la zilele viitoare, ca sa vezi fibrele, fierul, calciul si restul pe masura ce construiesti meniul, nu doar dupa ce ai mancat. Calculul e acelasi ca in Jurnal (dupa portiile din fiecare masa, cu alimentele din Info). Fusesera mutate doar in Jurnal in 5.1.0, cand Jurnalul era separat de Meniu; de la 5.2.0 Jurnalul se calculeaza din Meniu, deci motivul nu mai exista.
- Jurnalul pastreaza micronutrientii zilei alese si media pe 7 zile.
- Test nou in `teste/test_biblioteca.js`.

## 5.6.0
- **Biblioteca la deschidere:** nu mai arata retete; apare numarul total si indemnul "Cauta un ingredient sau un nume, ori alege o pilula". Lista apare dupa o cautare, o pilula sau un filtru si dispare cand le scoti.
- **10 rezultate:** cautarea arata primele 10 retete; "Arata mai multe" aduce inca 10 (inainte 60).
- **Titlul retetei e link:** in rezultate, atingi titlul si se deschide reteta (Deschide ramane).
- **"Mai e si in":** fiecare carte pe randul ei, aliniate sub eticheta, fara spatiu in plus.
- **Gatita 1 data:** "gatita 1 data", apoi "gatita de 3 ori", "gatita de 20 de ori" (in rezultate si in Notite).
- **Inapoi sus:** buton rotund cu sageata in dreapta jos, pe orice pagina, apare dupa ce cobori mai mult de un ecran.
- **Aceeasi sageata peste tot:** toate sectiunile pliate (Filtre, Macro, Micronutrienti, Etichete, Cum functioneaza Debaraua, Setari) si zilele din Meniu au acelasi triunghi, de aceeasi marime si culoare, care se roteste la deschidere. Inainte, Macro folosea sageata browserului si Micronutrienti alt caracter, de alta marime. Meniurile cu "..." raman fara sageata.
- **Debara pe categorii pliabile:** fiecare categorie (Condimente, Cereale...) se strange si se deschide; pornesc stranse. La cautare se deschid cele cu rezultate; cand adaugi un produs, categoria lui se deschide; o categorie deschisa ramane deschisa cat lucrezi in Debara.
- Teste: noi verificari in `teste/test_biblioteca.js`; doua teste vechi cauta acum ceva inainte sa citeasca lista (lista nu mai apare goala de filtre).

## 5.5.0
Ecranul retetei din Biblioteca, dupa testarea pe telefon.
- **Sus, direct Inapoi:** cat e deschisa o reteta, cautarea (campul, pilulele, Lipsesc cel mult, Filtre, Parcurge retetele de verificat) si randul cu Reteta noua / Idei cu AI se ascund; primul buton e Inapoi la rezultate. Revin cand te intorci la rezultate.
- **Cosul de gunoi nu mai e pe randul de sus:** Muta in cos e acum in Mai multe actiuni (aceeasi confirmare). Sus raman Inapoi, Favorita, Copiaza, Trimite.
- **Micronutrienti la 100 g:** sectiune pliata noua, imediat sub Micronutrienti per portie, pe aceeasi baza ca macro-ul la 100 g (ingrediente crude, fara apa; apare cand Info acopera cel putin jumatate din ingrediente). Si la retetele fara numar de portii, unde per portie nu se aplica. Randul de macro la 100 g ramane cum era.
- **Etichete:** sectiunea ramane deschisa dupa ce bifezi, ca sa poti bifa mai multe la rand; se inchide cand o inchizi tu sau deschizi alta reteta.
- **Jurnal devine Notite** pe pagina retetei (stele, de cate ori ai gatit-o, ce ai scris), ca sa nu se confunde cu Meniu > Jurnal. Eticheta dubla "Notite" de deasupra campului a disparut. Textele care vorbeau de "jurnalul" retetei (cos, stergere carte, dubluri) spun acum "notitele".
- Teste noi in `teste/test_biblioteca.js`.

## 5.4.0
- **Registrul migrarilor (din auditul QA, C3):** cele 14 schimbari de date facute o singura data la pornire (Thermomix in aparate, etichete noi, produsele de baza in debara, curatenia 5.0.0, murate pe marcajul "altceva", mutarea jurnalului vechi, curatenia sincronizarii si altele) au acum un nume intr-o singura lista, `MIGS`, iar cele facute stau intr-o singura cheie, `rmig`, in loc de 14 steaguri separate (`rdef1`-`rdef4`, `rtg5`, `rtv3`, `rgrp2`, `rcl3`, `rcl4`, `rv5f`, `rv516`, `rv5c`, `rv52`, `rsyv`). La prima pornire steagurile vechi se muta in `rmig` si se sterg; nimic nu ruleaza din nou si datele tale nu se schimba.
- O migrare noua se scrie cu `mig("nume", ...)`; numele trebuie sa fie in `MIGS`, altfel nu ruleaza.
- Fata de propunere: in loc de un singur numar de versiune a datelor, `rmig` tine numele migrarilor facute. Migrarile ruleaza in momente diferite ale pornirii (unele cer biblioteca incarcata, una ruleaza dupa 3 secunde), deci un numar ar fi presupus o ordine stricta care nu exista.
- Teste: steagurile vechi se muta si dispar, migrarile facute nu ruleaza din nou, la o instalare noua toate ruleaza o data.

## 5.3.1
Reparatii din auditul QA din 19 noiembrie 2026.
- **Cumparaturi, condimente:** sare, piper, boia, oregano si celelalte condimente apar pe o singura linie, fara cantitate (se cumpara la pachet).
- **Cumparaturi, cantitati:** ce e in paranteza e detaliu, nu alt produs ("Galbenusuri (~36 g)" nu mai face linie separata); lingurite se aduna cu linguri (1 lingura = 3 lingurite); galbenusurile si albusurile intra la oua. Afisarea e rotunjita pentru cumparat: linguri in sferturi (1 3/4 linguri), grame si ml in sus (la 5 sub 50 g, apoi la 10), bucati in sus; unitatea se acorda cu numarul (1 lingura, 3 linguri). Cantitatea salvata ramane exacta. Liniile vechi din lista se aduna o data la pornire dupa aceleasi reguli.
- **Jurnal:** media pe zi se calculeaza doar pe zilele incheiate (azi nu mai trage media in jos).
- **AI:** modelul implicit e claude-haiku-5-5 (claude-haiku-4-5 nu mai raspunde). Cine avea vechiul implicit trece o data pe noul model; un model ales de tine ramane. La eroarea "model inexistent" mesajul trimite la Setari.
- **Actualizare:** service worker-ul muta cartile din cache-ul vechi in cel nou, deci cartile nu se mai descarca din nou la fiecare versiune.
- **Cod:** scoase 25 de functii nefolosite ramase de la vechiul jurnal (jrSync, jrOpen, getJr, putJr, micBlock, micWeek si altele) si handlerele lor; jrFoods/jrFDraw se numesc acum infoFoods/infoFoodsDraw (campul "Aliment din Info" din dialogul de meniu).
- **Teste:** verificari noi pentru toate cele de mai sus si pornire cu 14 chei corupte in localStorage. Testele ruleaza automat pe GitHub la fiecare urcare (`.github/workflows/teste.yml`, tabul Actions).

## 5.3.0
- **Gatire, layout nou:** sus cautarea ("orez", "ou", "congelare", "naut"), sub ea 7 grupe cu numarul de teme: Baze, Timpi si temperaturi, Pastrare, Fara reteta, Leguminoase si vegetarian, Romaneasca, Sfaturi. La deschidere nu mai apare lista lunga; o grupa arata doar temele ei, iar deschizi o tema si celelalte se strang. Cautarea arata temele potrivite, deschise, doar cu randurile care contin cuvantul, evidentiat.
- Grupele unite: Tehnici de baza + Metode pas cu pas = Baze; Siguranta alimentara + Congelare = Pastrare; Leguminoase + Gatit vegetarian + De post = Leguminoase si vegetarian; Inlocuiri si greseli + Organizare + Volum mare = Sfaturi; timpii leguminoaselor sunt la Timpi si temperaturi.
- **Neconcordante corectate:**
  - tocatura de pui sau curcan: 74 de grade (scria 71, ca la vita si porc);
  - naut si fasole: un singur timp de fierbere (scria 45-90 de minute intr-un loc si 60-90 / 60-120 in altul);
  - legume la cuptor: aceiasi timpi in ambele locuri (dovlecei, ardei, vinete 20-25 de minute; radacinoase 35-45);
  - orz perlat: 30-40 de minute peste tot; "arpacas" e orzul, nu graul;
  - mancarea gatita: 3-4 zile la frigider peste tot (frittata si tocanita scriau 4 zile, sosul de rosii 5);
  - racirea inainte de congelare: aceeasi regula ca la pastrare (in cel mult 2 ore de la gatit; orezul intr-o ora);
  - dubluri scoase: dezghetarea si reincalzirea la 74 de grade apar o singura data, la Pastrare; "leguminoase + cereale = proteina completa" o singura data;
  - oul posat: pasii in ordinea corecta; trimiterile intre teme folosesc numele noilor grupe.

## 5.2.6
- Gatire > Bucataria romaneasca > Preparate casnice: fara mentiunea despre silitra si sarea de curare; nota despre riscul sararii si afumarii in casa ramane.

## 5.2.5
- **Gatire:** sectiune noua "Bucataria romaneasca", scrisa din cartile din aplicatie (Sanda Marin, BT FIT): ciorbe si borsuri (acrire, verdeata, dresul cu smantana si galbenus), rantas si sosuri legate cu faina, sarmale (varza dulce, murata, foi de vita), aluat dospit (paine si cozonac, cu proportiile din Sanda Marin), de post (ce pui in loc de unt, lapte, oua, branza), preparate casnice (sunca, slanina, carnati).

## 5.2.4
- **Gatire (ghidul):** greseli corectate: "soteata" -> "calita", "ragaie-l" -> "rasfira-l", "Amestec-l" -> "Amesteca-l", "oule" -> "ouale", "Fier din plante" -> "Fierul din plante", "tofu cuburi" -> "tofu taiat cuburi", "antiaderentul" -> "tigaia antiaderenta"; fraze clarificate (aluatul se poate dezumfla, oul posat, conopida calita). Sectiunea "Prajire si sotare" devine "Prajire si calire", cu explicatia: calirea (sotarea) inseamna gatit scurt in putina grasime, pana se inmoaie, fara sa se rumeneasca. "Legume la cuptor sau sotate" devine "Legume la cuptor sau la tigaie".
- Retetele demonstrative: "Calieste" -> "Incalzeste" / "Caleste".

## 5.2.3
- **Cumparaturi, lista goala:** explica de unde ajung produsele in lista (scrise de tine, dintr-o reteta, din Meniu, din Meal prep, din Debara); bifa inseamna cumparat. Fraza gresita "Bifeaza ce ai deja in casa" a disparut.

## 5.2.2
- **Debara:** categoria Condimente vine implicit fara marcaje (proaspat / congelat / uscat / conserva / altceva). Daca ti-ai salvat deja categoriile, ramane cum le-ai setat (Setari > Bucatarie > Raioane debara > Gestioneaza categoriile). La condimentele fara marcaje, forma nu conteaza: "piper macinat", "ghimbir pudra", "vanilie esenta" sunt acelasi produs ca "piper", "ghimbir", "vanilie" (in debara si la cumparaturi).

## 5.2.1
- **Cumparaturi:** masura scrisa in numele ingredientului ("pahar smantana", "pahar de lapte", "linguri zahar") trece la masura: "0.5 pahar Smantana", nu "0.5 Pahar smantana". Se repara si liniile deja in lista.

## 5.2.0
Meniul e singurul loc unde sunt mesele; Jurnalul arata doar cifrele.
- **Fara "Am mancat".** Tot ce e in Meniu la azi sau la o zi trecuta conteaza ca mancat. Ce ai sarit scoti din Meniu; ce ai mancat in plus adaugi in Meniu, si la zilele trecute.
- **Portii pe fiecare reteta din Meniu:** "- 1 portie +", cu pas de jumatate. Schimba macro-ul mesei si al zilei si cantitatile pentru cumparaturi.
- **Aliment din Info pe grame si in Meniu**, langa codul de bare si textul liber; aduce macro si micronutrienti. Gramele produselor (Info sau cod de bare) se pot schimba pe rand.
- **Meal prep se consuma din Meniu:** fiecare masa din Meal prep (cu portiile ei) scade din lotul gatit cel mai vechi. In lista Meal prep vezi "N in meniu, raman M"; in alegerea din Meniu apar doar loturile cu portii ramase. Lotul consumat in intregime de mese din zile trecute dispare singur; "Terminat" ramane pentru cand se termina altfel (a mancat si altcineva).
- **Istoricul de gatit:** o reteta din Meal prep conteaza gatita la "Am gatit" din Meal prep; altfel, o reteta din Meniu conteaza gatita in ziua ei, dupa ce ziua a trecut. Scoasa din Meniu dintr-o zi trecuta, ziua aceea nu mai conteaza.
- **Zilele trecute din Meniu sunt estompate**; mesele nu mai au fundal verde / gri. Partea de cumparaturi a unei mese trecute iese din lista.
- **Jurnalul e doar de citit**, calculat din Meniu: ziua aleasa fata de tinta (macro restrans, micronutrienti), un camp de **Observatii** pe zi (separat, nu se leaga de nimic), apoi "Ultimele 7 zile" (un rand pe zi cu calorii, proteine si un punct verde in tinta / galben in afara; atingerea deschide ziua in Meniu) si media pe zi, cu micronutrientii mediei.
- Migrare: lista de mese din Jurnal dispare (portiile scazute din loturi de "Am mancat" revin, acum le scade Meniul); marcajele "mancat" dispar.

## 5.1.7
- **Setari > Raioane debara:** "Gestioneaza categoriile" e primul, deasupra alimentelor. Lista de alimente e restransa ("Alimente (N)"), intre cautare si primul aliment; se deschide singura cand cauti.

## 5.1.6
- **Muraturi:** "murati", "murate", "in otet", "in saramura" inseamna borcan, adica marcajul "altceva (borcan)" din Debara. "Castraveti murati (in otet)" din reteta e acoperit de castravetii murati din debara, fara "Ai in debara, dar ca: conserva". Muraturile din debara marcate doar "conserva" trec o data pe marcajul borcan; cele noi il primesc singure. Castravetii proaspeti raman produs separat.

## 5.1.5
- **Cumparaturi:** acelasi produs nu mai apare pe doua linii. "Piept de pui fiert (sau pulpa slaba de vita / curcan)" se cumpara ca "Piept de pui" si se aduna cu "Piept de pui" din alta reteta (250 g + 150 g = 400 g). Regula: alternativele "(sau ...)" si starea de gatire de la final (fiert, copt, prajit, gatit, rumenit) dispar din numele de cumparat. Se aplica si liniilor deja in lista.

## 5.1.4
- **"Am mancat":** mesajul de confirmare e acum doar "Adaugat in jurnal." (cu Anuleaza). Mesajele scurte nu se mai rup pe cate un cuvant pe rand.
- **Jurnal:** macro e restrans implicit, cu o linie de sumar ("Macro: 614 / 1990 kcal, 15 / 104 g proteine"); il deschizi pentru bare, ca in Meniu.
- La bare: "Raman 1630 kcal" in loc de "mai ramane 1630 kcal" (si "Peste tinta cu ...").
- **Dialogul "Am mancat":** codul de bare e primul, imediat sub Ziua si Masa.

## 5.1.3
- **Meniu:** ziua stransa arata doar titlul (data, cosul de cumparaturi); mesele si macro se vad doar cand e deschisa. Inainte ziua stransa arata aproape la fel ca cea deschisa.
- **Cumparaturi:** un condiment cerut fara forma (piper, boia, oregano) e acoperit de orice forma din debara; nu mai apare "Ai in debara, dar ca: uscat" pentru piper.

## 5.1.2
- Meniu: fara textul "mancat" pe masa; fundalul verde deschis arata deja ca masa e mancata.

## 5.1.1
- **Mesele de azi nu mai apar mancate dimineata.** Jurnalul se completeaza singur din Meniu doar pentru zilele trecute; pentru azi bifezi tu cu "Am mancat" (in Meniu), iar ce ramane nebifat intra singur a doua zi. Mesele de azi trecute singure in Jurnal de 5.1.0 se intorc in Meniu ca planificate, cu portia inapoi in lotul de Meal prep.

## 5.1.0
Meniul e planul, Jurnalul e ce ai mancat. Nu mai completezi de doua ori.
- **Jurnalul se completeaza singur din Meniu:** mesele planificate pentru azi si pentru zilele trecute apar direct in Jurnal, ca mancate (cu portia scazuta din Meal prep si reteta marcata gatita). Tu doar corectezi ce a fost diferit: stergi ce n-ai mancat, schimbi portiile, adaugi cu "+" ce n-a fost planificat. Se aplica de la instalarea versiunii, fara mesele din trecut.
- **Ce stergi din Jurnal ramane sters:** masa din Meniu devine "nemancata" (are din nou butonul "Am mancat") si portia revine in lotul de Meal prep. O masa scoasa din Meniu iese si din Jurnal.
- La zilele trecute, partea mesei iese si din lista de cumparaturi; la ziua de azi lista ramane neatinsa (poate n-ai cumparat inca).
- **Micronutrientii s-au mutat din Meniu in Jurnal**, unde cifrele sunt reale: pe zi si media pe zi din ultimele 7 zile (fierul, calciul, fibrele si vitaminele se judeca pe mai multe zile). Alimentele adaugate din Info intra si ele in calcul. Meniul pastreaza barele de macro pe zi, pentru plan; "Propune-mi un meniu" tine cont de micronutrienti ca inainte.
- Jurnal: butoanele - / + ale portiilor stau pe acelasi rand cu cosul de gunoi.

## 5.0.1
- **X sus in fiecare dialog** (Propunere de meniu, Adauga la meniu, Am mancat, Meal prep): ramane vizibil si cand derulezi, deci nu mai cobori pana jos ca sa anulezi. Tasta Esc inchide si propunerea.
- In propunerea de meniu, butonul care scoate o masa e acum cosul de gunoi (nu se mai confunda cu X-ul de inchidere).
- **Propunere de meniu, masa din Meal prep:** "Alta varianta" nu mai e gri; schimba portia din Meal prep cu o alta reteta potrivita (si atunci masa nu mai e luata din lot).
- **Bazele nu mai sunt propuse ca masa:** aluaturi, foi, glazuri, creme de baza, siropuri (ex: "Aluat de unt si smantana" aparea la Desert).
- **"Pasta" nu mai e "paste":** "Tartine cu pasta de ton" nu mai apare cu "iti place: paste"; la fel pentru pasta de tomate in debara.

## 5.0.0
Versiune mare: un singur model de reteta, categorii comune si jurnal de mese. Datele tale se muta singure la prima pornire (si dupa o restaurare sau o sincronizare); nu ai nimic de facut.
- **Un singur fel de reteta.** Retetele generate cu AI si salvate intra in Biblioteca, la "Retetele mele" (filtrul **Ale mele**), langa cele scrise de tine. Isi pastreaza pasii pe aparat (temperatura, durata, treapta): in reteta ai Pasi / Pe aparat si Mod gatit, ca inainte. Favoritele, jurnalul, notitele, loturile de Meal prep si mesele din meniu raman legate de ele.
- **Un ecran si un editor.** Toate retetele se deschid in acelasi ecran si se corecteaza din acelasi "Editeaza reteta". Fostele "Observatii" ale retetelor AI sunt acum **Sfaturi** (le vezi in reteta si le corectezi in editor). Pasii pe aparat isi pastreaza setarile cat timp ii editezi pe loc; un pas nou e manual.
- **Fara pagina "Colectia mea".** In Biblioteca, langa Favorite, sunt pilulele **Ale mele** si **Cos (N)** (gri cand cosul e gol); din Cos restaurezi sau stergi definitiv. **Idei cu AI** e un buton in Biblioteca (gri fara cheie API), cu intoarcere in Biblioteca.
- **12 categorii comune** pentru toate cartile: Mic dejun, Supe si ciorbe, Fel principal, Salate si boluri, Paste si orez, Gustari, Deserturi, Sosuri si garnituri, Aluaturi si paine, Conserve, Bauturi, Altele. Categoria originala a cartii ramane ca **capitol**. Cartile livrate au versiunea crescuta, deci se actualizeaza singure. Setarea "Categorii si mese" dispare: masa se deduce din categorie.
- **Etichete noi:** "de post" (separat de vegan; mierea nu e vegana) si ocaziile Craciun si Anul Nou, Paste, eveniment.
- **Jurnal de mese** (Meniu > Jurnal), ca Eat & Track: pe zile, cu Mic dejun, Pranz, Cina si Gustari. Adaugi orice: reteta (din Biblioteca, Ale mele, Favorite sau Meal prep), aliment din Info pe grame, produs dupa cod de bare sau text liber. Retetele au portii cu - / +, alimentele grame. Sus, totalul zilei cu bare fata de tintele din profil; verde cand ziua e in tinta (calorii +-10% si proteine cel putin 90%).
- **"Am mancat"** in loc de "Am gatit": in meniu, un tap scrie masa in jurnal (Desert merge la Gustari), o marcheaza facuta si scoate din cumparaturi partea ei; daca e din Meal prep, scade o portie din lot (lotul gol dispare). In reteta, "Am mancat" deschide jurnalul cu reteta aleasa; "Am gatit azi" si "Anuleaza ultima gatire" dispar (stergerea se face din jurnal).
- **Macro din Info peste tot:** meniul, propunerea si jurnalul folosesc intai calculul din Info (aceeasi baza pentru toate cartile), apoi valorile din carte. Avertizarea "difera mult" apare doar in reteta, nu si in meniu.
- **Sanda Marin:** retetele fara ingrediente (doar text, "se face ca la...") nu mai apar in Biblioteca si in alegerea din meniu, cu exceptia celor folosite (favorite, gatite, cu nota). Setari > Carti le poate arata.
- **Curatenie de date (o data):** in debara, forma scrisa in nume ("fasole rosie, conserva") devine marcaj si liniile dublate se unesc; alimentele tale estimate de AI care exista deja in Info (pastarnac, pastarnac radacina, rosii deshidratate) se sterg; cuptorul clasic e activ.
- **Setari** pe 4 grupuri: Eu, Bucatarie, Date, Aplicatie (cu punct de atentie pe grup).
- **Cumparaturi:** galbenusul si albusul se cumpara ca oua (numar), zeama si coaja de lamaie ca lamai.
- Teste noi: `teste/test_v5.js` (migrare, Ale mele, Cos, Sanda Marin, curatenie, macro din Info, jurnal); testele vechi pentru Colectia mea si editorul AI separat sunt inlocuite.

## 4.30.3
- Scoasa "Terci de ovaz cu albus si fructe" din cartea Retete high-volume (albusul nu-ti place). Biblioteca livrata are acum 952 de retete. "Lava cake keto cu ciocolata" si retetele cu albusuri separate (omleta de albusuri, fursecuri cu cocos, omleta mare cu legume, cheesecake in borcan, clatite de albusuri) raman.

## 4.30.2
- **Fara oua crude si fara combinatii ciudate cu ou:** scoase din cartea keto "Cafea cu unt si ou fiert", "Terci keto de seminte de in si cocos" si "Terci de chia si nuca de cocos" (ouale batute direct in terci). Biblioteca livrata are acum 953 de retete. Galbenusul ramane doar unde reteta il cere (carbonara, ciorbele legate cu galbenus).
- **"Spuma de iaurt cu fructe de padure":** albusurile batute crude sunt inlocuite cu aquafaba (apa de la nautul din conserva), care face aceeasi spuma; macro recalculat.
- **Retetele scoase dintr-o carte ies si din Biblioteca** la actualizare, daca nu le-ai schimbat si nu sunt in favorite, notite, Meal prep sau meniu (inainte ramaneau pentru totdeauna).

## 4.30.1
- **Revizia retetelor livrate (956, toate cartile):** am citit fiecare reteta (cele 300 de supe keto pe sabloane) si am corectat 574 dintre ele in fisierele din `carti/`; versiunea fiecarei carti a crescut, deci retetele se actualizeaza singure la pornire. Retetele pe care le-ai corectat tu raman neatinse.
- **Asezonare:** 249 de retete sarate nu aveau sare, o aveau doar in pasi, sau o aveau prea tarziu (dupa cuptor). Sarea si piperul sunt acum in ingrediente si in pasul potrivit: in umplutura (ardei umpluti, sarmale), in marinada sau pe carne si peste inainte de cuptor, in ouale batute, in apa pastelor si a cartofilor; la tocanite si supe, "Gusta si potriveste de sare si piper" inainte de servire. Retetele dulci si cele cu ingrediente sarate (telemea, bacon, sos de soia etc.) n-au primit sare in plus.
- **Combinatii:** scoase variantele fara sens (sunca in loc de zmeura la bolul cu iaurt, curcan afumat in loc de iaurt la clatitele cu mere); la deserturi, gustari si garnituri sfatul "adauga tofu sau naut" e inlocuit cu unul potrivit (iaurt, lapte, sau "serveste langa o sursa de proteina"); variantele vegane nu mai pastreaza miere, albusuri sau iaurt de vaca (sirop de artar, aquafaba, iaurt de soia); panna cotta are agar-agar (fara el nu se lega; gelatina n-ar fi fost vegetariana).
- **Variante vegane cu valori gresite:** sapte variante cu iaurt de soia aratau caloriile pentru toata reteta (ex: 1015 kcal in loc de 420); recalculate pe portie. Si cele cu tofu matase erau supraevaluate (Info il potriveste cu tofu ferm).
- **Timpi de gatire:** tocana de vita si ciorba de vita keto fierb 90 de minute (nu 60), ca sa se inmoaie carnea; restul timpilor verificati automat pe tipul de carne, leguminoase, orez si cartofi erau in regula.
- **Retete keto reparate:** pasi adaugati la final dar care trebuiau facuti inainte (puiul la tocanita de ciuperci, sunca la conopida gratinata, ricotta in umplutura, ouale la vinete) sunt mutati la locul lor; ingrediente lipsa sau gresite (cafea la tiramisu si cappuccino, vanilie la retetele "cu vanilie", lapte de migdale la shake, lapte de cocos si curry la "curry de cocos", aripioare la "Aripioare de pui", somon afumat unde pasii il cer, rozmarin la pulpele "cu rozmarin"); ingrediente dublate unite; "Ciorba de burta keto" (facuta cu vita) se numeste acum "Ciorba de vita in stil de burta".
- **Supe keto:** ierburile proaspete (busuioc, patrunjel, marar) nu se mai calesc, se pun la mixare; scos pasul de umplutura "Mai fierbe 5 minute, apoi gusta".
- **Formulari:** greseli de scriere (aseaza, ruleaza, soteaza, caleste, inchega, paseaza, raceste-le, mararul etc.), "olive" devenit "masline", singular si plural la cantitati (1 banana, 2 linguri, 1 foaie de dafin), feta in loc de "telemea" acolo unde ingredientul e feta.
- Macro recalculat din Info la 14 retete cu ingrediente schimbate; timp si dificultate recalculate la 51 de retete cu pasi schimbati.
- Teste noi in `teste/test_carti.js`: fara greselile gasite, sarea din pasi e si in ingrediente, variantele au valori pe portie, retetele "cu vanilie" au vanilie, panna cotta se leaga.

## 4.30.0
- **Meal prep planificat, portii editabile pana la gatit:** pe randul din Planificat portiile au - / +. Cumparaturile retetei se potrivesc singure (ce ai bifat deja ca si cumparat ramane neatins). Dupa "Am gatit", portiile raman fixe.
- **Dialogul Meal prep cu - / +** in loc de camp de scris (ca la "Gatesc pentru" din reteta); porneste de la portiile retetei.
- **Butonul Meal prep e mereu in reteta:** se numeste "Adauga la Meal prep" (inainte disparea cand reteta era deja in Meal prep). Daca reteta e planificata, butonul arata "Meal prep: N portii" si deschide lotul existent: "Salveaza portiile" il schimba, "Am gatit deja" il muta in Gatit. Nu se mai face un lot dublu.
- **Observatiile retetelor AI se pot corecta:** in Editeaza reteta e un camp nou "Observatii (una pe linie)". Stergi sau rescrii ce nu e corect (ex: "Merele din placinta..." cand reteta are doar mere). La retetele generate de acum, modelul e rugat sa scrie in observatii doar atentionari reale si sa nu presupuna alte forme ale ingredientelor.
- **Propune-mi un meniu fara aceeasi reteta de doua ori pe zi:** un lot din Meal prep intra cel mult o data pe zi (inainte putea lua si pranzul si cina, ex: Ovaz cu chia de doua ori miercuri). Ziua care are deja reteta in meniu e sarita; portiile ramase merg in zilele urmatoare.

## 4.29.0
- **Micronutrienti pe saptamana in propunerea de meniu:** la fiecare alegere, scorul favorizeaza retetele care acopera ce lipseste din media saptamanii (fibre, fier, calciu, vitamina D, B12, folat) si penalizeaza ce depaseste limitele (sodiu, grasimi saturate, zaharuri). Se tine cont si de ce ai deja in meniu. Jos, in propunere, apare "Micronutrienti, media pe zi" (acelasi panou cu bare ca in Meniu, extins la cerere): verde cand principalele minime sunt acoperite si limitele respectate, portocaliu cu lista a ce e sub 80% din necesar sau peste limita. Se actualizeaza cand schimbi o masa. Necesita profil nutritional completat.
- Retetele fara destule ingrediente recunoscute in Info (sub jumatate) nu intra in calculul micronutrientilor.

## 4.28.0
- **Propune-mi un meniu, pe zi si pe tinta:** (1) portiile ramase din loturile Meal prep recente sau planificate se pun mai intai, la pranz si cina, marcate "din Meal prep" (la "Adauga la meniu" intra cu marcajul Meal prep, deci nu ajung in lista de cumparaturi). (2) Celelalte mese ale zilei se aleg impreuna, ca totalul zilei sa fie aproape de tinta din profil (kcal si proteine); retetele fara macro conteaza neutru. Fara profil completat, propunerea merge ca inainte. (3) Sub fiecare zi apare totalul fata de tinta: verde cand kcal sunt in +-10% si proteinele la cel putin 90%, portocaliu altfel; masa fara macro e numarata separat si nu intra in suma. (4) In aceeasi zi se evita doua retete cu acelasi prim ingredient. Totalul se actualizeaza cand schimbi o masa (Alta varianta, Alege tu, + Inca una, x).
- Scorul unei retete nu mai compara separat kcal cu o felie fixa din tinta (se face acum pe zi).

## 4.27.0
- **Macro la 100 g in reteta:** sub macro pe portie apare "La 100 g de ingrediente (crude, fara apa)", calculat din baza Info (cand cel putin jumatate din ingrediente au date). Si retetele fara numar de portii au acum o valoare utila.
- **Setari > Macro lipsa:** un buton calculeaza dintr-o miscare macro pentru retetele fara macro care au cel putin 80% din ingrediente cu date. Valorile sunt marcate "Calculat din Info", retetele cu macro din carte nu se ating, iar Anuleaza apare dupa calcul. Raportul din Setari spune cate retete nu se pot calcula pentru ca nu au ingrediente scrise.
- **Mai multe ingrediente recunoscute:** greutate medie pentru produse intregi (pui, rata, iepure, varza, conopida, praz, telina, crap, chifle etc.), "paharel de vin" (50 ml), "plic" (10 g), "apa calda", "foaie de dafin", si la "X sau Y" se foloseste prima varianta.

## 4.26.0
- **Propune-mi un meniu, mai mult control:** pe fiecare rand al propunerii ai acum "Alege tu" (cauti in retetele tale si biblioteca si pui ce vrei tu in loc de propunere) si "+ Inca una" (a doua reteta la aceeasi masa, pentru zile mai variate; fiecare se scoate cu x). La "Adauga la meniu" intra toate la aceeasi masa, in ordine.
- Butoanele fara efect nu mai sunt ascunse: "Genereaza" e gri fara cheie API, iar "Alta varianta" e gri cand nu exista alternative, cu mesaj scurt la apasare.
- **Cod de bare:** dupa o eroare de retea cautarea reincearca o data singura, deci prima scanare nu mai da eroare trecatoare.

## 4.25.1
- **Cod de bare, cauza erorii de retea:** mesajul "Nu pot cauta acum" spune acum de ce (serviciul a raspuns cu cod de eroare, timp expirat, cererea a fost blocata). Folosit pentru a afla de ce un produs (ex: 7622300541491) nu se gaseste pe telefon.

## 4.25.0
- **Camera pentru cod de bare, ca la Eat & Track:** cadru de tintire cu patru colturi verzi, zona din afara cadrului intunecata, linie verde de scanare (sta pe loc daca ai animatiile reduse in telefon) si textul "Pune codul de bare in cadru". Detectorul nativ citeste acum doar zona din cadru (mai rapid, mai putine citiri gresite); biblioteca de rezerva citeste tot ecranul.
- **Lanterna la cerere:** buton in coltul camerei. Nu porneste singura, doar cand o apesi; se opreste odata cu camera. Daca telefonul sau browserul nu o permite, butonul e gri si spune de ce.

## 4.24.1
- **Macro din Info, ingrediente fara date:** "praf de sare", "varf de cutit", "strop" si "picatura" se potrivesc acum cu alimentul (sare etc.) in loc sa ceara conversie in grame. Titlul avertismentului listeaza toate ingredientele fara date, pe nume, ca sa nu mai cauti prin card. Sub el apare separat lista ingredientelor fara cantitate (scortisoara, esenta de vanilie etc.), care nu intra in calcul.
- **"Este alt aliment":** langa Cauta cu AI si Completeaza manual, alegi din lista Info alimentul cu care se potriveste ingredientul (ex: praf de sare = Sare). Se salveaza ca aliment al tau si se foloseste si data viitoare, fara sa retastezi valorile.

## 4.24.0
- **"Editeaza reteta" pe toate retetele:** butonul din Mai multe actiuni se numeste acum la fel peste tot (inainte: "Corecteaza reteta", doar pe retetele din carti si scrise de tine) si exista si pe retetele AI, salvate sau abia generate. Formularul are Titlu, Portii, Categorie, Ingrediente si Mod de preparare. Pasii pe aparat isi pastreaza setarile (temperatura, durata) cand ii editezi pe loc; un pas nou e manual.
- Categoria "Desert" e mereu in lista, ca sa poti marca o reteta ca desert (Adauga la meniu si Propune-mi un meniu o pun apoi singure la masa Desert).

## 4.23.3
- **Dialogul "Adauga la meniu" la orice dimensiune de text (90% - 150%):** butoanele de sursa (Meal prep, Colectia mea, Favorite, Biblioteca) trec pe randul urmator cand nu incap, in loc sa iasa din ecran. Randul de cod de bare: campul are loc suficient, Cauta e acum o lupa langa camera, iar cand textul e mare iconitele trec sub camp. Textul din camp e "Cod de bare". Dialogul tine cont de zona sigura de jos a telefonului.
- Reparat: apasarea exact pe lupa nu pornea cautarea.

## 4.23.2
- **Dialogul "Adauga la meniu" pe telefon:** tastatura nu se mai deschide singura la deschidere (acoperea restul dialogului, inclusiv campul de cod de bare). Se deschide doar cand atingi un camp. Cand tastatura e deschisa, dialogul primeste loc sub el, iar campul atins se deruleaza in vedere. Pe desktop, cautarea ramane cu cursorul pe ea. Acelasi lucru la formularul Meal prep (campul de portii).

## 4.23.1
- **Scanare cu camera** pentru produsul din Meniu: langa "Cauta" apare iconita de camera. Citeste codul (EAN-13, EAN-8, UPC), il pune in camp si cauta produsul, ca la codul tastat. Camera se opreste singura dupa citire, la "Opreste camera", la Anuleaza si cand inchizi dialogul.
- Foloseste detectorul nativ al browserului cand il are; altfel biblioteca `zxing.min.js` (Apache 2.0, licenta in `zxing-LICENSE.txt`), pusa in pachet si incarcata abia cand apesi camera (nu din alt domeniu). Verificat cu o camera simulata intr-un browser real: citeste un cod EAN-13 prin biblioteca de rezerva.
- Fara camera sau fara permisiune: butonul e gri cu mesaj scurt, respectiv "Nu ai dat voie la camera. Poti scrie codul de bare."

## 4.23.0
- **Produs dupa cod de bare, in Meniu.** In "Adauga la meniu" apare campul "Produs dupa cod de bare" (8 pana la 14 cifre) cu "Cauta". Valorile vin de la Open Food Facts (serviciu gratuit, fara cheie; trimite doar codul), la 100 g: kcal, proteine, carbohidrati, grasimi. Cardul produsului arata numele, marca si sursa; alegi cantitatea in grame (implicit portia de pe ambalaj, altfel 100 g), macro-ul se recalculeaza pe loc, iar "Adauga la meniu" pune produsul in ziua si masa aleasa.
- Produsul intra ca o masa libera, cu cantitatea (ex. "50 g") si macro, care se aduna in totalul zilei; nota din Macro spune ca produsele se numara dupa cantitatea introdusa. Micronutrientii nu se calculeaza pentru produse.
- Produsele gasite se tin local (ultimele 100), ca sa mearga si fara internet a doua oara. Mesaje clare pentru cod invalid, produs negasit si lipsa internetului (produsul negasit se poate scrie liber).
- Randurile din Meniu fara reteta (text liber, produse) nu mai apar gri ca "planificat".
- Securitate: `index.html` permite conectarea si la `world.openfoodfacts.org`.

## 4.22.3
- **Meniu: "Propune-mi un meniu"** are iconita de bec galben (idee) in loc de bagheta; titlul spune "Idei de meniu: propune-mi un meniu".
- **Macro si Micronutrienti** (pe zi si pe saptamana) sunt acum aceeasi cutie: acelasi fundal, aceeasi latime si margine, cu sageata (▸ inchis, ▾ deschis) care arata ca se deschid.
- **Etichete Meal prep corelate:** "in Meal prep" (lot planificat) si "din Meal prep" (gatit). A disparut cuvantul "lotul" si din mesajul cosului din Meniu.

## 4.22.2
- **Meniu pe telefon:** randul de sus nu se mai suprapune ("Saptamana" acoperea cosul de cumparaturi). Comutatorul "Azi si maine / Saptamana" ocupa latimea, iar cele trei iconite (cumparaturi, propune-mi, goleste saptamana) trec pe randul de dedesubt, aliniate la dreapta, cand nu incap.
- Randurile de masa: butonul "-" e aliniat cu titlul (sus), eticheta "in lista" e mai mica, iar "Am gatit" sta pe aceeasi margine cu textul, nu sub butonul "-".

## 4.22.1
- **Din Meniu spre Meal prep:** cand aceeasi reteta apare de 2 sau mai multe ori in perioada afisata (azi si maine, sau saptamana) si nu are lot, la prima aparitie apare butonul "N mese: fa Meal prep". Deschide formularul existent de Meal prep, cu portiile completate (N). Alegi "Adauga la Meal prep" (planificat) sau "Am gatit deja", ca pana acum.
- **Lotul planificat preia cumparaturile:** produsele aduse in lista pentru mesele din meniu cu aceeasi reteta (sursele "Titlu (meniu zi)", de azi inainte) ies din lista, iar lotul aduce ingredientele pentru toate portiile. Nu mai apar dubluri. Se aplica la orice lot planificat, nu doar celor pornite din buton.
- Mesele a caror reteta are lot arata "in lotul Meal prep", iar cosurile din Meniu nu le mai adauga a doua oara in lista.

## 4.22.0
- **Debara: un singur rand pe produs.** "Rosii", "Rosii deshidratate" si "Rosii, conserva" devin un rand "Rosii" cu marcajele proaspat, uscat si conserva aprinse. La fel "Usturoi" / "Usturoi, catei" / "Usturoi, pudra" si "Vanilie" / "Vanilie, esenta" / "Vanilie, extract". Unirea se face la pornire, cu copie de siguranta si buton Anuleaza (copia ramane si in `rpbak4220`).
- **Condimente au acum marcaje** (proaspat, uscat, altceva), ca Legumele. Cuvintele catei, pastaie = proaspat; pudra, macinat, fulgi, granulat = uscat; esenta, extract, pasta = altceva (borcan, sos). Se aplica doar produselor din categorii cu marcaje: "zahar pudra" ramane separat de "zahar".
- **Potrivirea cu retetele:** o reteta fara forma ("rosii") inseamna proaspat; o reteta cu forma ("rosii conserva") cere acea forma bifata. Un produs fara niciun marcaj bifat acopera orice forma. La Leguminoase, "uscat" e acceptat si cand reteta nu spune forma.
- **Lista de cumparaturi:** daca produsul exista in debara, dar sub alta forma, apare atentionarea "Ai in debara, dar ca: conserva" (portocaliu, nu rosu: nu e eroare).
- **Adauga in debara:** acelasi produs sub alta forma nu mai face rand nou, ci adauga marcajul pe randul existent ("Ghimbir pudra" devine "Ghimbir" cu uscat). Butonul cos ("Am terminat") pune in lista produsul cu forma cand are un singur marcaj ("Rosii conserva").
- **Legenda simbolurilor** e mereu vizibila deasupra listei din Debara (nu mai e pliata).

## 4.21.1
- **Meniu: Planificat vs Facut.** Masa care nu a fost gatita apare cu text gri (planificat); dupa "Am gatit" randul devine verde deschis cu eticheta "gatit".
- **"Am gatit" din Meniu scoate din cumparaturi partea acelei mese** (ca la Meal prep). Daca era in lista, produsele ei dispar (cele comune cu alte retete isi reduc cantitatea), cu Anuleaza.
- **"Adauga la meniu" fara bifa de cumparaturi.** Ingredientele intra in lista doar prin cosurile din Meniu (zi, azi si maine, saptamana): o singura cale, nu doua.
- **Cumparaturi fara "Goleste lista".** Ramane "Sterge bifate" (si cand totul e bifat). In "Pe retete", stergerea unui grup se face cu iconita de cos si confirmare "Confirma".
- **Text aliniat in lista:** bifa la nivelul primei linii, ambele linii pe aceeasi margine, sursa mai mica si gri (subliniata la atingere).
- **Corectie categorie:** "dovlecei" (plural) era la Altele; acum e la Legume. "dovlecel" si "dovleac" raman cuvinte separate (scopuri diferite).

## 4.21.0
- **Cumparaturi: produsele bifate nu mai dispar.** Cand bifai ultimul produs, mesajul "Nu mai ai nimic de cumparat" inlocuia lista si ascundea tot ce bifasei. Acum mesajul apare deasupra, iar produsele bifate (taiate) raman la vedere pana golesti lista sau gatesti reteta (care scoate doar partea ei).
- Randurile aduse din Debara raman si ele in lista, bifate. Produsul intra in Debara la bifare si iese daca debifezi (doar daca bifarea l-a adus, nu daca era deja acolo). Se scot din lista cu "Goleste lista" sau "Sterge bifate".

## 4.20.0
- **Copiaza si trimite o reteta**, indiferent de sursa (carti, Retetele mele, colectia generata): doua iconite langa Favorita, in pagina retetei. Copiaza pune textul in clipboard; Trimite foloseste meniul de partajare al telefonului, iar pe desktop deschide WhatsApp (ca lista de cumparaturi).
- Textul e simplu, fara diacritice si fara marcaje: titlu, portii si timp, ingrediente (pe sectiuni, cu cantitatile pentru portiile alese in pagina), mod de preparare numerotat, macro pe portie daca exista, iar ultima linie e sursa ("Din <carte>, reteta <nr>", "Retetele mele" sau "Generata cu AI"). Sfaturile nu intra, ca textul sa ramana scurt.

## 4.19.0
- **Favorite are un singur loc:** pilula rapida "Favorite" din Biblioteca. Optiunea "★ Favorite" a disparut din lista "Carte" (aceeasi alegere in doua locuri). Favoritele sunt acum un comutator propriu, care se combina cu orice carte, categorie sau eticheta (de exemplu: doar favoritele din "Retete cu carne"). Categoriile si etichetele arata si ele doar ce exista in favorite cand pilula e activa.

## 4.18.1
- Coada "Parcurge retetele de verificat": panoul arata acum pozitia reala ("De verificat: reteta 5 din 57"), nu un total de alta natura ("mai sunt 158": numara si retetele cu portii sau macro de verificat si cele din cos, in timp ce coada avea 57). Motivele de verificare apar citibile ("ingrediente neclare", nu `ingrediente_neclare`) si doar cele care tin de coada (ingrediente si text).

## 4.18.0
- **Meal prep in doua zone**, separate printr-o linie si un subtitlu cu numarul din fiecare: **Planificat** (lista de asteptare: ce vrei sa gatesti; se poate gati sau sterge) si **Gatit** (meal prep efectiv, cu data si portii, pana la "Terminat"). Randurile sunt compacte, cu linie fina intre retete; zona goala nu apare.
- In "Adauga la meniu", chipul "Meal prep" arata **doar loturile gatite**. O reteta aflata la Planificat se pune in meniu din Biblioteca, ca orice alta.
- O masa din meniu devine "din Meal prep" **doar cand lotul e gatit** (la "Am gatit" sau "Am gatit deja"), nu la planificare. Ce alegi din Biblioteca inseamna gatit doar pentru masa respectiva, deci nu mai e marcat automat "din Meal prep" nici cand exista un lot gatit al aceleiasi retete.
- Bifa "Adauga ingredientele la cumparaturi" din "Adauga la meniu" apare acum la orice reteta.

## 4.17.0
- **Meniu, zona de sus intr-un singur rand** (varianta A): segmentul "Azi si maine / Saptamana" la stanga, iar la dreapta trei iconite: cosul de cumparaturi (pentru perioada aleasa), "Propune-mi un meniu" (bagheta) si, doar pe saptamana, cosul de gunoi pentru "Goleste saptamana" (cu "Confirma" si Anuleaza). Meniul "Mai multe" a disparut; fiecare iconita are titlu la apasare lunga.
- Cand produsele sunt deja in lista, al doilea tap pe cos cere "Confirma" (cu un mesaj care spune de ce), in locul textului lung de pe buton.

## 4.16.1
- **In meniu intra o singura portie**, indiferent pentru cate portii e reteta (inainte venea implicit cu portiile retetei si trebuia schimbat de mana). Campul "gatesc ... portii" a disparut din randurile meniului si din dialogul "Adauga la meniu": ocupa loc si nu aducea nimic. Meal prep ramane cu numarul de portii, pentru ca acolo conteaza cat gatesti. Intrarile vechi din meniu isi pastreaza portiile.

## 4.16.0
- Cumparaturi: starea "Ascunde produsele din debara" se pastreaza intre sesiuni, pe fiecare dispozitiv (ca marimea fontului; nu intra in backup). Implicit ramane bifata.

## 4.15.0
- **Pagina de pornire** e Biblioteca (Retete), cu sau fara cheie si indiferent daca ai meniu azi.
- **Biblioteca > Filtre:** "Preferinte" e acum printre filtrele de sus, iar "Stare" a trecut in "Mai multe filtre" (contorul de filtre active tine cont de mutare).
- **Controale gri cu mesaj, nu ascunse:** fara cheie API, butoanele care folosesc AI raman vizibile, gri, iar la apasare spun ca au nevoie de cheie (Setari > AI si cheie). La fel butoanele de adaptare la aparate, cand nu e bifat un robot.
- **Meniu, macro pliabil:** totalul de macro al zilei e un bloc pliabil (titlul arata caloriile si proteinele), ca Micronutrientii.
- **"Adauga la meniu" are bifa "Adauga ingredientele la cumparaturi"** (nebifata implicit). Bifata, produsele intra in lista cu sursa "Titlu (meniu zi)", iar intrarea din meniu apare "in lista". Nu apare pentru retetele aflate deja in Meal prep.
- Nefacut inca: randul de sus din Meniu (asteapta detalii).

## 4.14.0
- Numele retetei e link in Meniu si in Meal prep (deschide reteta, ca mai inainte butonul "Deschide"). Butonul "Deschide" si cuvantul "gatesc" din dreptul portiilor au disparut; campul de portii ramane, cu "portii" langa el.

## 4.13.0
- **Meal prep in doua butoane**, fara intrebari: "Adauga la Meal prep" = planificat (lotul apare "de gatit", ingredientele intra in cumparaturi cu sursa reteta) si "Am gatit deja" = gatit (jurnal scris, lista neatinsa). Bifa "adauga la cumparaturi" din formular a disparut.
- **"Am gatit"** pe un lot planificat: lotul devine gatit (data de azi, jurnal) si din cumparaturi se scoate doar partea acelei retete, indiferent daca ingredientele sunt bifate sau nu. Un ingredient comun cu alte retete ramane cu cantitatea celorlalte; bifele si Debaraua nu se ating. Cosul de gunoi pe un lot planificat il scoate si scoate si partea lui din lista (cu confirmare unitara si Anuleaza).
- **Cumparaturi venite din Debara** ("Terminat" in Debara): au doar bifa. Bifat = cumparat, produsul se intoarce in Debara si randul dispare; nu mai exista "Am in debara" pe aceste randuri (ramane pe cele din retete). Nu mai raman randuri fara reteta.
- Limite cunoscute: randurile vechi fara evidenta pe retete isi pastreaza cantitatea la "Am gatit"; doua loturi planificate ale aceleiasi retete au aceeasi sursa, deci al doilea inlocuieste randurile primului.

## 4.12.0
- Setari > Administrare > **Titluri de sectiune**: lista de cuvinte (foi, umplutura, crema, glazura...) se gestioneaza din aplicatie. Campul de adaugare e sus (mai multe cuvinte odata, separate prin virgula), fiecare cuvant are cos de gunoi, iar "Revino la lista initiala" readuce lista de start. Se aplica imediat si intra in backup si in sincronizare.
- Confirmare la stergere **unitara**: peste tot primul tap schimba butonul in "Confirma" (4 secunde), al doilea sterge. Inainte, etichetele spuneau "Confirma stergerea", iar la categorii si la cartile din Setari butonul ramanea gol dupa expirarea confirmarii (pierdea cosul de gunoi, defect din 4.9.1): reparat.

## 4.11.0
- Titlurile de sectiune care au ajuns ca ingrediente in retete ("Foi", "Umplutura", "Pentru crema", "Glazura", "Blat", "Aluat", "Sirop"...) nu mai sunt tratate ca produse: nu intra in lista de cumparaturi, nu mai "lipsesc" la filtrul Din debara si nu mai apar ca ingrediente. In reteta se afiseaza ca subtitluri. Datele din carti nu se modifica (o carte reincarcata se comporta la fel).
- Regula e stricta: doar linii fara cantitate si fara unitate, cu un nume din lista, si doar cand reteta are mai multe linii. "foi" cu cantitate, "sos de soia" sau un produs adaugat manual raman produse.
- Lista de cumparaturi existenta: o singura curatare scoate titlurile deja aduse din retete (cele adaugate manual raman).

## 4.10.1
- Teste: cele 17 fisiere pe versiuni sunt unite in 5 pe teme (`test_biblioteca`, `test_meniu_cumparaturi`, `test_carti`, `test_interfata_sync`, `test_robustez`), plus `toate.js` care le ruleaza pe toate (`node teste/toate.js`). Aceleasi 155 de verificari, dar folderul nu mai creste cu un fisier la fiecare versiune: verificarile noi se adauga in testul tematic potrivit. Aplicatia nu s-a schimbat.

## 4.10.0
- Biblioteca, **Din debara** unificat: o singura pilula "Din debara" (inlocuieste "Am tot in debara"). Apasata, apare randul "Lipsesc cel mult: 0 1 2 3" (implicit 0 = am tot). Lista "Din debara" din Filtre a disparut: o stare, un singur loc.
- Rezultatele raman sortate dupa cele mai putine lipsuri; numarul din antet spune acum "cele mai potrivite primele".
- Cu debaraua goala, filtrul nu mai pare stricat: apare "Debaraua e goala, asa ca nu filtrez. Adauga produse" (trimite in Debara).
- Contorul "Filtre (n active)" nu mai numara filtrul debara (se vede pe pilula).

## 4.9.2
- Meniu: dupa refresh nu mai apare, pentru o clipa, "Reteta nu mai e in Biblioteca; folosesc ingredientele salvate in meniu". Meniul se desena inainte sa se incarce biblioteca si retetele pareau lipsa. Avertismentul apare acum doar dupa incarcarea bibliotecii si ramane pentru retetele sterse cu adevarat.

## 4.9.1
- "Sterge" de pe randuri (aparate, etichete, categorii, alimente proprii, Biblioteca, cos, carti din Setari) devine **cos de gunoi** (cu titlu si eticheta accesibila "Sterge"). Confirmarea ramane: unde cerea un al doilea tap, butonul arata "Confirma" si revine la cos daca nu apesi.
- Raman cu text butoanele mari, cu efect asupra mai multor lucruri: "Sterge reteta", "Sterge bifate", "Descarca toate", "Goleste biblioteca", "Descarca backup".

## 4.9.0
- Marime text: butoane **A-** / **A+** in antet, vizibile pe toate paginile. Pasi: 90 / 100 / 115 / 130 / 150%; atingerea valorii din mijloc revine la 100%. Se scaleaza textul, butoanele si campurile. Se pastreaza pe dispozitiv (nu intra in backup si nu se sincronizeaza). Verificat in browser simulat la latime de telefon (390 px) la 90% si 150%, fara text taiat sau depasire pe orizontala.
- Idei: sectiunea **Etichete** este pliabila (inchisa implicit), ca Aparatele; titlul arata cate etichete sunt active, de ex. "Etichete (2 active)" sau "(toate)".
- Aparate: culorile fixe (paleta veche) au disparut; etichetele de aparat si marginea pasilor folosesc culorile temei.
- Setari > Tehnic > Carti: randul unei carti are numele pe toata latimea, iar sub el numarul de retete, butonul de descarcare (iconita, cu titlu si eticheta "Descarca JSON") si "Sterge". Rezolva numele afisat cate o litera pe rand pe telefon. "1 reteta" in loc de "1 retete".
- Nu s-a adaugat ghid la prima deschidere (decizie: nu se mai adauga).

## 4.8.1
- Biblioteca, filtrul Carte: dispar "Air fryer (de verificat)" si "Retete noi (de verificat)". Erau copii vechi ale retetelor care sunt acum in cartile aplicatiei (96 de retete, toate cu pereche in Retete vegetariene sau Retete cu carne). Aplicatia le scoate singura dupa ce cartile sunt instalate, cu un mesaj, si doar daca nu au favorite, notite, meal prep sau meniu; ce nu are pereche ramane.

## 4.8.0
- Carte noua, **Retete high-volume**: 100 de retete cu portii mari si calorii putine (supe, salate si boluri, cuptor si air fryer, paste si orez cu legume multe, one pot, mic dejun, deserturi usoare, wrap-uri). Fiecare portie are cel mult 500 kcal si cel mult circa 1,1 kcal pe gram dupa gatire (greutate estimata: cerealele si pastele isi dubleaza-tripleaza greutatea, carnea pierde un sfert); mesele principale au in general 350-500 kcal si cel putin 22 g proteine. Macro e calculat cu baza Info, ca la celelalte carti. Fiecare reteta are varianta pereche (vegetariana, cu carne sau vegana), cu macro recalculat in sfaturi, si o linie despre volumul portiei.
- Eticheta noua **high-volume** (tip dieta), adaugata o singura data si la cei care au deja lista de etichete; se poate ascunde din Setari, ca celelalte.
- Gatire: tema noua **Volum mare, calorii putine** (ce umple farfuria, trucuri de gatit, cum citesti volumul portiei, cand nu e potrivit), cu valori din Info.
- Retetele sunt scrise din cunostinte culinare generale, nu au fost gatite si verificate; timpii si cantitatile se pot corecta din "Corecteaza reteta".

## 4.7.1
- Meniu: aceeasi reteta nu mai poate fi adaugata de doua ori la aceeasi masa (primesti un mesaj); la pranz si la cina poate fi aceeasi reteta. Dublurile vechi se aduna intr-una la pornire, la restaurare si la sincronizare, cu un mesaj.
- Cumparaturi: produsele unei mese scoase din meniu pleaca singure din lista (la pornire si la deschiderea listei). Un mesaj spune cate produse si care au plecat. La scoaterea unei retete pleaca si produsele ei bifate (inainte ramaneau orfane). Cand nu mai ai nimic de cumparat apare mesajul verde "Nu mai ai nimic de cumparat", fara comutatorul de debara, fara contorul "ascunse" si fara butoanele Copiaza, Trimite si Sterge bifate; daca au ramas produse bifate, ramane doar "Goleste lista". Lista goala arata doar campul de adaugare.

## 4.7.0
- Debara si Cumparaturi: marcajele (proaspat, congelat, uscat, conserva) conteaza la potrivire. Produsul ramane pe o singura linie in debara, cu iconitele lui. Cand reteta cere o forma anume ("rosii uscate", "rosii deshidratate", "mazare congelata", "rosii conserva", "rosii in suc propriu"), produsul e "in debara" doar daca ai bifat forma aceea. Exemplu: ai rosii cu proaspat si conserva bifate; pe lista raman doar rosiile uscate.
- Reguli: un ingredient fara forma ("rosii") se potriveste cu orice marcaj; un produs fara niciun marcaj bifat (sau dintr-o categorie fara marcaje) acopera orice forma. "Fiert" nu e o forma de produs si nu conteaza.
- Aceeasi regula se aplica la filtrul "Am tot in debara" din Biblioteca si la "N din M le ai deja in debara" din Meal prep.
- Debara > "Cum functioneaza Debaraua": explicatia noua, cu exemplul de mai sus.
- Teste: `teste/test_meniu_cumparaturi.js` (8 verificari). `BACKLOG.md` adus la zi: profilurile de adulti, sfaturile structurate, printul si data de expirare sunt amanate.
- Cod: `FORMW`, `formSplit`, `panItems`, `formOk`, `inPantry`, `covered`.

## 4.6.0
- 60 de retete noi in cartile livrate, verificate si aprobate inainte: 18 asiatic, 9 traditional romanesc, 13 mic dejun cu carne, 12 gustari, 8 cu peste. 20 au intrat in "Retete vegetariene" (nr. 197-216, din care 8 vegane) si 40 in "Retete cu carne" (nr. 71-110). Biblioteca livrata are 856 de retete.
- Etichetele asiatic, traditional romanesc si air fryer au acum cate 50 de retete; mic dejun cu carne are 20, gustarile 40. La peste s-au adaugat doar 8 feluri cu garnitura (orez, paste, naut, tortilla), pentru ca baza avea deja 46 de retete cu peste, majoritatea keto.
- Fiecare reteta noua are timp, dificultate, macro calculat din Info si, in sfaturi, daca proteina e completa sau cu ce sa o servesti.
- Eticheta automata gluten-free: pasta de miso conteaza acum ca ingredient cu gluten (contine uneori orz).
- Cartile "Retete vegetariene" si "Retete cu carne" sunt la versiunea 4: retetele noi se adauga singure la prima deschidere; ce ai schimbat tu ramane neatins.
- Daca ai incarcat fisierul de verificare, sterge sursa "Retete noi (de verificat)" din Setari > Carti, altfel cele 60 de retete apar de doua ori (grupate pe acelasi card).
- Teste: `teste/test_carti.js` (7 verificari); `BACKLOG.md` adus la zi.

## 4.5.0
- 36 de retete noi la air fryer in cartile livrate, verificate si aprobate inainte: 26 in "Retete vegetariene" (nr. 171-196, din care 10 vegane) si 10 in "Retete cu carne" (nr. 61-70). Pe categorii: 7 mic dejun, 17 feluri principale, 7 gustari, 5 deserturi. Eticheta air fryer are acum 50 de retete (inainte 14). Biblioteca livrata are 796 de retete.
- Fiecare reteta noua are timp, dificultate, macro calculat din Info si, in sfaturi, daca proteina e completa sau cu ce sa o servesti. Temperaturile si timpii sunt cei uzuali pentru air fryer si pot diferi de la un aparat la altul.
- Cartile "Retete vegetariene" si "Retete cu carne" sunt la versiunea 3: retetele noi se adauga singure la prima deschidere; ce ai schimbat tu ramane neatins.
- Daca ai incarcat fisierul de verificare, sterge sursa "Air fryer (de verificat)" din Setari > Carti, altfel cele 36 de retete apar de doua ori (grupate pe acelasi card).
- Teste: `teste/test_carti.js`; `BACKLOG.md` adus la zi.

## 4.4.0
- Etichete: tip nou, "metoda", pentru meal-prep, air fryer si one pot (inainte erau "dieta"). La generarea ideilor se aplica la fel ca dietele, toate odata. Cine are etichetele salvate primeste schimbarea o singura data; un tip schimbat de tine ramane.
- Eticheta gluten-free e automata: apare pe retetele care nu au niciun ingredient cu gluten in lista (633 din cele 760 livrate). E prudenta: ovazul si sosul de soia conteaza ca gluten, daca nu scrie "fara gluten". Nu tine cont de urme sau contaminare; in Setari > Etichete scrie sa verifici eticheta produselor daca ai boala celiaca.
- Eticheta keto se judeca pe carbohidrati neti (carbohidrati minus fibre, fibrele calculate din Info): sub 10 g pe portie. Budincile de chia si alte retete cu multe fibre sunt acum keto; in total 524 de retete livrate.
- Cumparaturi: lingurile, lingurite si canile se aduna cu gramele. Cand produsul exista deja in lista in grame (sau il adaugi in grame peste linguri), cantitatea se transforma dupa tabelul Masuri si ramane un singur rand ("5 g ulei" + "2 linguri ulei" = "32 g ulei"). Daca toate sunt in linguri, raman linguri.
- Pachetul contine de acum si `BACKLOG.md`: ce urmeaza, ce e nedecis, ce e amanat, limitele cunoscute si ce e de verificat pe dispozitiv real.
- Teste: `teste/test_biblioteca.js` (9 verificari).
- Cod: `netCarb`, `hasGluten`, `GLUT`, `autoTags` (cu rezultat tinut minte pe reteta), `lUnify`, `toG`.

## 4.3.2
- Sincronizare, reparat: loturile de Meal prep adaugate pe doua dispozitive se unesc acum (dupa id). Inainte, daca ambele dispozitive schimbau lista de loturi intre doua sincronizari, ramanea lista unuia singur, iar cealalta se pierdea, cu mesajul "rmp: pastrat (diferit), cealalta era (diferit)".
- Mesajul "Modificate pe ambele dispozitive" e citibil: spune "Meal prep" in loc de "rmp" si arata titlurile sau numele din fiecare varianta, nu "(diferit)".
- Teste: `teste/test_interfata_sync.js`.

## 4.3.1
- Reparat: butonul "Vezi" din mesajul "modificari facute pe ambele dispozitive" deschidea Setari > Backup, dar detaliile sunt mai jos, in caseta Sincronizare Dropbox, asa ca parea ca nu face nimic. Acum pagina merge direct la caseta cu ce s-a pastrat si ce s-a inlocuit; mesajul de sus dispare cand apesi acolo "Am inteles".
- Mesajul e corect si la singular: "O modificare facuta pe ambele dispozitive".

## 4.3.0
- Debara, categorii implicite corectate: Carne are marcaje (proaspat, congelat, uscat, conserva, altceva), Cereale nu mai are. Categorie noua, Leguminoase, cu marcaje: fasolea, lintea, nautul, bobul si soia se incadreaza acolo automat (fasolea verde ramane la Legume). Cine si-a salvat deja categoriile primeste doar categoria noua, o singura data; bifele lui raman, iar daca o sterge nu revine.
- Ghid nutritie > Gatire: tema noua "Leguminoase si cereale uscate" (fasole, linte, naut, mazare, grau, orz): inmuiere, timpi de fierbere orientativi, siguranta la fasolea rosie si alba (clocot cel putin 10 minute, nu direct la slow cooker), sare / acid / bicarbonat, cat iese din 100 g uscate si cum transformi o reteta scrisa cu conserve, pastrare si congelare.
- Cumparaturi: pe calculator, unde nu exista meniul de trimitere al telefonului, apare butonul "Trimite pe WhatsApp", care deschide WhatsApp cu lista. Pe telefon ramane "Trimite lista" (WhatsApp e printre aplicatiile din meniul telefonului), iar "Copiaza lista" merge peste tot.
- Teste: `teste/test_meniu_cumparaturi.js` (8 verificari).

## 4.2.0
- Timp total si dificultate pe fiecare reteta. Cele 760 de retete livrate au acum `timp` (minute) si `dif` (usor / mediu); apar pe card si in reteta ("aprox. 35 min", "usor"). Sunt estimari automate, de aceea "aprox.": timpul se aduna din minutele scrise in pasi plus cateva minute de pregatire, dificultatea vine din numarul de pasi, de ingrediente si din tehnici. In "Corecteaza reteta" sunt doua campuri noi, Timp total si Dificultate; ce scrii tu are prioritate si nu mai e marcat "aprox.". Retetele fara aceste campuri (scrise de tine, generate, carti incarcate de mana) sunt estimate la afisare, cu aceeasi regula. Cu regula actuala nicio reteta livrata nu iese "avansat".
- Deserturi rapide: "Timp activ: N minute" nu mai e text in sfaturi, e camp (`activ`) si apare langa timpul total ("aprox. 35 min, 5 min activ").
- Biblioteca: pilule rapide sub cautare - Mic dejun, Pranz / Cina, Desert, Sub 30 min, Am tot in debara, Favorite. Se combina intre ele si cu filtrele. "Am tot in debara" si "Favorite" apasa pe filtrele existente (Din debara, Carte), deci nu exista doua stari pentru acelasi lucru; cu "Am tot in debara" retetele raman sortate dupa cate ingrediente lipsesc.
- Aplicatia fara cheie API: tot ce cheama modelul (butoanele cu AI, legenda, adaptarea la aparate, estimarea de macro) e ascuns pana adaugi o cheie. Pagina Idei arata o singura caseta cu "Deschide Biblioteca" si "Adauga o cheie", iar aplicatia porneste in Biblioteca. "Primii pasi" a devenit "Primul pas": doar debaraua (cheia nu mai e ceruta, cartile vin singure).
- Cumparaturi: "Sterge bifate" si "Goleste lista" sunt la vedere, nu sub "Mai multe". Sugestie de ambalaj langa cantitate ("870 g Faina - cumperi 1 kg") pentru cateva produse vandute la marime fixa: faina, zahar, orez, malai, gris, paste, lapte, unt, smantana, rosii conserva, lapte de cocos. Cantitatea din lista ramane cea exacta.
- Cartile livrate sunt la versiunea 2 (campurile noi); retetele neschimbate de tine se actualizeaza singure la prima deschidere.
- Teste in repo, toate pe date inventate: `teste/test_cumparaturi_meniu_id.js` (31 verificari), `teste/test_carti.js` (11), `teste/test_robustez.js` (17), `teste/test_biblioteca.js` (22); ajutor comun in `teste/_boot.js`.
- Cod: `stepMin`, `recT`, `recD`, `recTEst`, `recDEst`, `tChips`, `bplDraw`, `bplOk`, `keyUpd`, `packTxt`, `PACK`.

## 4.1.1
Corectii dupa auditul de calitate (securitate, cazuri limita, performanta).
- Securitate: `index.html` are Content-Security-Policy (scripturi doar din aplicatie; conexiuni doar catre aplicatie, Anthropic si Dropbox). `esc` escapeaza si apostroful. Service worker-ul are cache propriu ("cook-") si sterge doar cache-urile acestei aplicatii, nu orice cache "retete-" de pe aceeasi adresa. La restaurare, backup-ul e verificat si ca structura (lista unde trebuie lista, obiect unde trebuie obiect).
- Cumparaturi si Colectia mea: butoanele (bifa, x, "Am in debara", Deschide, Sterge) cauta produsul sau reteta dupa cheie, nu dupa pozitia din lista. Daca lista s-a schimbat intre timp, nu mai e atins alt rand; daca randul a disparut, lista se redeseneaza cu un mesaj.
- Doua taburi: cand alt tab al aplicatiei schimba datele, listele se redeseneaza singure (nu in timp ce scrii sau ai un dialog deschis). Pentru setarile tinute in memorie (etichete, aparate, categorii, profil) apare mesajul "Reincarca pagina".
- Anuleaza: daca datele s-au schimbat intre actiune si apasarea pe Anuleaza (alt tab, sincronizare), anularea e refuzata cu mesaj, in loc sa scrie peste ele.
- Retete salvate, limita de 200: se sterg cele mai vechi nefolosite; favoritele si cele din meniu sau din Meal prep raman. Mesajul apare si la "Propune-mi un meniu" (inainte taia fara mesaj).
- Portii: mereu numere intregi intre 1 si 99. Avertismentul "Gatesti de N ori reteta" apare si la "Gatesc pentru", nu doar la Meal prep.
- Cartile aplicatiei: daca nu se pot descarca la prima deschidere apare un mesaj, iar instalarea se reincearca singura cand revine internetul.
- Fara internet bun: daca reteaua nu raspunde in 4 secunde, aplicatia porneste din copia salvata.
- Performanta: cautarea din Biblioteca asteapta 180 ms dupa ultima tasta; la macro-ul zilei, reteta fiecarei mese se cauta o singura data (inainte de pana la cinci ori).
- Cod: o singura lista cu cheile de date (`DKEYS`, din care se deduc `LSK` si `BK_KEYS`); cele 74 de blocuri `catch` goale scriu acum eroarea in consola daca pui in localStorage cheia `rdebug` = "1"; numele fisierului de backup foloseste data locala.
- Teste in repo: `teste/test_robustez.js` (18 verificari cu date inventate; cum se ruleaza scrie in fisier).
- Nefacut, cu motiv: fontul ramane de la Google Fonts; cheile din localStorage nu au prefix (celelalte aplicatii de pe aceeasi adresa folosesc alte chei); impartirea codului pe module, o singura structura pentru ingrediente, un registru de migrari si scrierea partiala a bibliotecii raman pentru o versiune dedicata.

## 4.1.0
- Cartile de baza vin acum cu aplicatia: Retete vegetariene (170), Retete cu carne (60), Deserturi rapide (30), Retete keto (200), Supe si ciorbe keto (300). Fisierele stau in folderul `carti/`, iar `carti.json` spune ce carti exista si ce versiune are fiecare. La prima deschidere se instaleaza singure, fara pasul din Setari > Carti. Cand o carte primeste o versiune noua, retetele neschimbate se actualizeaza, cele noi se adauga, iar ce ai corectat, mutat in cos sau sters tu ramane cum ai lasat.
- Daca aveai deja aceste carti incarcate de mana, retetele neatinse trec pe versiunea livrata (cu corectiile de mai jos); retetele corectate de tine, cele din cos si "Retetele mele" nu se ating. Sursa "Retete keto 2 luni" din fisierul vechi se numeste "Retete keto", ca in aplicatie.
- Backup mai mic: retetele livrate si neschimbate nu mai intra in backup (doar lista lor); intra retetele tale si cele pe care le-ai schimbat. La restaurare, cartile se reinstaleaza din fisierele aplicatiei, deci e nevoie de internet o data. Un backup vechi, cu tot cu carti, se restaureaza in continuare. Un backup facut cu 4.1.0 nu poate fi restaurat intr-o versiune mai veche a aplicatiei.
- Setari > Carti: daca stergi o carte livrata, nu mai revine singura; apare butonul "Readu cartile aplicatiei". "Descarca JSON" da fisierul fara marcajele interne.
- Corectii de continut in cartile livrate (626 de retete atinse):
  - mierea din "Taitei cu legume si sos de arahide" (reteta vegana) e inlocuita cu sirop de artar;
  - eticheta "vegetarian" adaugata la 37 de supe keto fara carne sau peste;
  - categorii unificate: "Fel principal" devine "Feluri principale" (100), "Desert" devine "Deserturi" (6); "Desert rapid" ramane separat;
  - "sare si piper" e acum doua ingrediente, sare si piper (350 de retete), la fel "sare, piper si patrunjel verde" si "sare si zeama de lime";
  - o singura forma: "catei de usturoi" / "catel de usturoi" (154), "patrunjel verde" (36), "linguri" si "lingurite" la cantitati de la 2 in sus (258);
  - pasi aliniati cu ingredientele: "cheddar" in loc de "cascaval" unde lista are cheddar (16); "Caleste" in loc de "Sote", "amesteca ouale" in loc de "framanta ouale" (6);
  - "Mousse de ciocolata cu avocado" din Retete keto se numeste "Mousse keto de ciocolata cu avocado" (titlul era si in Deserturi rapide).
- Macro-ul retetelor livrate e calculat din baza Info a aplicatiei, fara alimentele adaugate de utilizator. Fata de ce era in aplicatie, difera la retetele cu ou (alimentul propriu "Ou fiert" inlocuia oul crud) si, cu cel mult 5 kcal, la cele 37 de retete unde s-a schimbat patrunjelul sau mierea.
- Cod: `shipRun`, `shipDone`, `shHash`, `shUnmod`, `getBv`; chei locale `rbv`, `rbneed` (nu intra in backup); cheie noua in backup `rliv`.

## 4.0.0
Schimbare de structura a datelor. Actualizeaza toate dispozitivele pe care folosesti aplicatia inainte de a sincroniza intre ele.
- Retetele salvate (Colectia mea) au un id stabil. Favoritele, jurnalul, mesele din meniu si loturile de Meal prep tin de id, nu de titlu, deci nu se mai pierd daca titlul se schimba. La prima deschidere aplicatia face o copie automata in browser, da id fiecarei retete salvate si muta legaturile vechi; mesajul verde spune cate retete au fost actualizate. Id-ul retetelor existente e dedus din titlu, deci e acelasi pe toate dispozitivele. Un backup vechi restaurat sau o sincronizare cu un dispozitiv neactualizat sunt aduse la noul format automat. Cod: `sKey`, `sid`, `sidT`, `sidRun`.
- Tintele zilnice vin doar din Profilul nutritional: proteinele se stabilesc in g pe kg, iar totalul se calculeaza din greutate. Cheia veche `rmt` (tinta ca total, ex. 110 g) nu se mai citeste si se sterge.
- Reteta stearsa din Biblioteca: mesele din meniu si loturile de Meal prep raman, cu acelasi mesaj peste tot, "Reteta nu mai e in Biblioteca". In meniu se folosesc in continuare ingredientele si macro-ul salvate in masa.
- Fara schimbare, dupa verificare: ordinea valorilor la alimentele adaugate de tine (kcal, proteine, grasimi, carbohidrati) e ordinea coloanelor din baza Info (`nutri.js`) si ramane asa; backup-ul contine in continuare cartile, pentru ca in 4.0.0 ele nu sunt inca incluse in aplicatie (se incarca din fisiere separate); vezi 4.1.0.

## 3.21.0
- Meniu: masa noua "Cina", intre Pranz si Desert. Apare in fiecare zi, la "Adauga la meniu", in macro-ul zilei, in "Propune-mi un meniu" si in Setari > Categorii si mese. Pranzul si cina se propun din aceleasi retete (fara repetari in aceeasi propunere); o categorie poate fi atribuita explicit cinei. Dupa ora 16, "Adauga la meniu" propune Cina in loc de Pranz. Mesele existente nu se schimba.
- Reparat: "Propune-mi un meniu" propunea supe crema la desert (categoria "Supe crema" continea cuvantul "crema"). Supele si ciorbele nu mai sunt niciodata desert.

## 3.20.0
- Meal prep: a disparut blocajul "Ingredientele retetei sunt deja in cumparaturi". Aparea si cand lista parea goala, pentru ca produsele pe care le ai in debara raman ascunse in lista. Acum produsele ascunse nu mai conteaza, iar formularul spune ce e de fapt: "Ai toate ingredientele in debara, nu e nimic de cumparat", sau bifa de cumparaturi cu "N din M le ai deja in debara". Daca reteta e deja (vizibil) in lista, bifa devine "Actualizeaza in cumparaturi cantitatile pentru N portii" si inlocuieste partea retetei, fara dublare.
- Meal prep: mesajul de dupa salvare numara separat produsele de cumparat si pe cele pe care le ai in debara. Avertisment in formular cand gatesti de peste 4 ori reteta (ex. 40 de portii la o reteta de 2).
- Cumparaturi: acelasi produs nu mai apare de doua ori din cauza felului in care e scris. Nu mai conteaza cum e taiat ("ceapa tocata marunt" = "ceapa", "cartofi, taiati cuburi" = "cartofi"), "de" de la inceput ("de usturoi" = "usturoi"), "dupa gust" / "optional" de la final si locul cuvantului de masura ("3 catei usturoi" = "usturoi, 3 catei"). Carnea tocata ramane carne tocata. Kilogramele se aduna cu gramele si litrii cu mililitrii (1 kg + 500 g = 1500 g). Cod: `lClean`, `lkey`, `lPrep`, `addList`.
- Debara: felul in care e taiat sau masurat un aliment tine de gatire, nu de produs. "Cartofi, taiati cuburi", "piept de pui taiat cubulete" si "3 catei de usturoi" sunt recunoscute ca fiind in debara daca ai cartofi, piept de pui si usturoi. Marcajele proaspat / congelat / uscat / conserva nu se schimba.
- Neschimbat, de stiut: "Goleste lista" si "Sterge bifate" sunt in Cumparaturi, sub "Mai multe"; "Goleste lista" sterge si produsele ascunse.

## 3.19.0
- Baza de retete nu mai e doar vegetariana: sursa veche "Baza de retete" se numeste acum "Retete vegetariene" (170 retete, 98 vegane) si exista o sursa noua, "Retete cu carne" (60 retete, multe perechi cu varianta vegetariana, cu trimitere reciproca). Aplicatia redenumeste automat sursa veche la prima deschidere, fara sa piarda favorite, notite, meal prep sau meniu; importa apoi cele doua fisiere noi din Setari > Tehnic > Carti.
- Gatire: teme noi - Gateste fara reteta (frittata, supa, salata de cereale, sos de rosii, paste, legume, vinegreta, tocanita, fiecare cu varianta vegetariana si cu carne), Metode de baza pas cu pas (oua, cereale, cartofi, sosuri), Congelare, Organizare si economie, Gatit vegetarian (proteine complete, valori din Info, inlocuiri, fier/B12/omega 3). Formulele sunt scrise de la zero, fara text copiat din surse.
- Reparat: regula pentru orezul gatit spunea o zi, iar retetele 4 zile; acum e aliniata (3-4 zile, racit in cel mult o ora, reincalzit o singura data).

## 3.18.3
- Greutati pe bucata in Info pentru pere (170 g), piersici (150 g), kiwi (75 g) si smochine (50 g); macro-ul retetelor care le folosesc se recalculeaza o singura data la prima deschidere.

## 3.18.2
- Greutati pe bucata in Info pentru avocado (170 g), lime (65 g), vinete (250 g) si tortilla (40 g): "2 avocado", "1 lime", "4 vinete" sau "8 tortilla" intrau inainte ca ingredient nepotrivit si lipseau din macro. Retetele cu macro calculat local se recalculeaza o singura data la prima deschidere.

## 3.18.1
- Reparat: macro-ul retetelor calculat din Info ramanea cel vechi dupa ce se schimba baza Info sau potrivirea ingredientelor, deci aratai o valoare sus si alta la "Recalculeaza din Info" (ex. Bol cu quinoa: 642 sus, 515 jos, pentru ca valoarea veche numara nautul fiert ca uscat). Acum, la prima deschidere dupa o schimbare a bazei Info, toate retetele cu macro calculat local (biblioteca si salvate) se recalculeaza o singura data si apare un mesaj cu numarul lor. Valorile scrise de tine sau estimate de AI nu se ating.
- Macro per portie nu mai tine fibre si saturate stocate (se afisau doar la unele retete si puteau fi vechi); ele raman in Micronutrienti, calculate live.

## 3.18.0
- Etichete noi: meal-prep, air fryer, one pot (tip dieta, se aplica toate odata la generarea ideilor). Cine are deja lista de etichete salvata le primeste o singura data la prima deschidere; daca le stergi, nu revin.
- Setari > Etichete: fiecare eticheta are bifa "Afiseaza". Debifata, eticheta nu mai apare in filtre, pe cardurile retetelor, in cautare dupa eticheta si la alegerea etichetelor pentru idei AI. Retetele o pastreaza, iar o bifezi inapoi oricand. Etichetele automate (high-protein, keto) pot fi ascunse la fel.
- Teste: test_etichete_ascunse (etichete noi, migrare o singura data, ascundere si reafisare).

## 3.17.0
- Info (Ingrediente) are acum 1145 de alimente, de la 202: toate grupele esentiale din USDA SR Legacy (domeniu public) cu denumiri in romana: legume (inclusiv verdeturi, ciuperci, conserve, congelate), fructe, leguminoase (inclusiv tofu, tempeh, miso), nuci si seminte (tahini, unt de arahide, seminte), lactate si branzeturi, oua, grasimi, sosuri si condimente (chimen, curry, boia afumata, coriandru, capere, masline), cereale, paste si paine, carne (taieturi de vita, porc, miel, pui, curcan, rata, vanat, organe), mezeluri, peste si fructe de mare, bauturi (grupa noua: cafea, ceai, vin, bere, lapte vegetal). Fiecare aliment are valori la 100 g, 27 de nutrienti, masuri pe lingura/lingurita/ceasca (acum 478 de alimente) si denumirea USDA in engleza (se vede la detaliu si merge la cautare).
- Potrivirea ingredientelor din retete (macro local, fara AI): acoperirea pe ingredientele din cartile tale a crescut de la 66% la 80% dintre denumirile distincte. Fara interogari AI pentru aceste alimente.
- Reparat: starea de gatit conta doar din intamplare. "Naut fiert" nimerea nautul uscat (378 kcal in loc de 164), la fel "fasole fiarta", "linte fiarta", "piept de pui fiert", "orez fiert". Acum fiert/fiarta, copt/prajit/fript/la cuptor/la gratar si gatit sunt cuvinte de potrivire: un aliment gatit se alege doar cand ingredientul spune ca e gatit, iar daca spune "fiert" si nu exista varianta fiarta, se foloseste varianta de baza.
- Denumiri alternative in Info: "(aprox. X)" sau "(sin. X)" din numele unui aliment il fac sa fie gasit si dupa X (telemea, cascaval, zeama de carne, carne macra, cumin, cayenne). Reparat: "telemea" si "cascaval" nu se potriveau cu nimic.
- Cuvintele "intreg/intregi", "crud/cruda/crude" nu mai conteaza la potrivire ("oua intregi", "pui intreg"). Fara aport caloric: bors, verdeata, leustean, arpagic. Indulcitor si eritritol/stevia sunt 0 kcal.
- Teste: adaptate test_info, test_macro_local (Peste, sortare, masuri, un ingredient nepotrivit mai sigur).

## 3.16.0
- Setari > Carti: butonul "Gaseste dubluri". Doua retete sunt dubluri daca au acelasi titlu si ingrediente (aproape) identice, sau aceleasi ingrediente si titluri apropiate (comparatia e pe continut, nu doar pe nume). Lista arata fiecare pereche, motivul si ce copie ramane; poti debifa ce vrei sa pastrezi, iar eliminarea se poate anula.
- Se pastreaza copia folosita (favorite, Meal prep, meniu, jurnal), apoi cea mai completa (pasi, ingrediente, macro, portii). "Retetele mele" nu se ating niciodata. Retetele diferite cu aceleasi ingrediente (de exemplu "Supa cu turnatei" si "Supa cu puf de ou") raman.
- Numaratoarea din Biblioteca e mai clara: "1759 retete (172 exemplare cu acelasi titlu sunt grupate)"; cu cautare sau filtre: "42 retete gasite din 1759".
- Teste: test_dubluri.py; adaptate test_grupare, test_biblioteca_pagini.

## 3.15.0
- Acelasi ecran pentru orice reteta, indiferent de sursa (carte, scrisa de tine, generata cu AI, salvata, Favorite, adaptata): titlu, etichete, "Mod gatit" / "Adauga la meniu" / "Meal prep", "Mai multe actiuni" (cumparaturi), Ingrediente cu "Gatesc pentru - N +", Mod de preparare, Macro per portie si Micronutrienti per portie, Etichete pliate, Jurnal. Retetele generate nu aveau scalare, macro, micronutrienti, sectiunea "Mod de preparare" si jurnal; acum le au.
- Macro si micronutrienti la retetele generate/salvate: calculati din Info, direct, fara AI si fara tokeni (nu se salveaza pe reteta).
- Scalarea portiilor la retetele generate/salvate muta si "Adauga la cumparaturi" si lista din "Mod gatit" la numarul ales de portii.
- "Pasi" si "Pe aparat" sunt acum in sectiunea Mod de preparare. La retetele adaptate dintr-o carte apare sectiunea pliata "Pasii originali din carte" (pasii clasici ai retetei de baza).
- Previzualizarea adaptarii, afisata sub reteta din carte, nu repeta scalarea si macro-ul (sunt deja in reteta de mai sus).
- Teste: test_reteta_unificata.py; adaptate test_cumparaturi, test_marcaj_ai_si_cumparaturi, test_pasi_simpli.

## 3.14.3
- Retete cu pasi pe aparate: "Cronologie" si "Pasi" erau aproape la fel, asa ca au fost unite. Raman doua vederi: "Pasi" (implicita: lista numerotata, aparat ca eticheta mica, treapta/durata sub pas; cand doua aparate lucreaza in paralel apar si "Start / dupa N min" si "in paralel cu alt aparat") si "Pe aparat". Butonul "Cronologie" a disparut.

## 3.14.2
- Retete cu pasi pe aparate (generate cu AI, din Idei, din Colectia mea / Favorite, adaptate din carte): al treilea buton langa Cronologie si Pe aparat, "Pasi" = lista compacta numerotata, fara minute si fara grupare pe aparat; aparatul ramane ca eticheta mica in pas, iar treapta/durata ca text sub pas. Cronologie ramane vederea implicita; alegerea nu se salveaza.
- Idei: doua mesaje distincte. Lista goala: "Nu am gasit retete pentru aceste ingrediente si etichete. Incearca fara o eticheta sau cu alte ingrediente." Raspuns stricat: "Raspuns invalid de la model. Incearca din nou." (inainte ambele spuneau "nu a returnat idei valide").
- Teste: test_pasi_compact.py.

## 3.14.1
- Meal prep: scos butonul "La meniu" de pe lot (redundant: in "Adauga la meniu" filtrul "Meal prep" e deja primul si selectat). Ramane "N mese in meniu" pe lot.
- Adauga la meniu, filtrul Meal prep: randurile nu mai repeta "Din Meal prep" (filtrul spune deja asta); arata data gatirii si portiile lotului.

## 3.14.0
- Meal prep conectat cu retetele: buton "Meal prep" langa "Adauga la meniu" pe orice reteta deschisa (Biblioteca, Colectia mea, retete generate din Idei; cea generata se salveaza automat in Colectia mea). Deschide acelasi formular (data, portii, caseta de cumparaturi). Butonul dispare cand reteta are deja un lot activ.
- Pe fiecare lot din Meal prep: "N mese in meniu" langa data si portii (butonul "La meniu" adaugat aici a fost scos in 3.14.1).
- Documentatie: harta conexiunilor dintre sectiuni (harta-conexiuni.html, nu face parte din aplicatie).
- Teste: test_meal_prep_conexiuni.py.

## 3.13.3
- Meniu zilnic, mai compact: fiecare aliment are in fata un buton "-" (scoate din meniu, cu "Anuleaza" ca inainte), iar langa numele fiecarei mese (Mic dejun, Pranz ...) e un singur "+" pentru adaugat. Dispar butoanele late "Scoate" si "+ Adauga"; ramane loc pentru "gatesc N portii", "Am gatit" si "Deschide".
- Teste: test_meniu_compact.py extins.

## 3.13.2
- Meal prep: caseta "Adauga ingredientele pentru N portii la cumparaturi" e inapoi (bifata implicit; scoasa din greseala in 3.13.1). Daca ingredientele retetei sunt deja in cumparaturi (din reteta sau din meniu), nu apare caseta, ci nota "Ingredientele retetei sunt deja in cumparaturi", ca sa nu se dubleze.
- Adauga la meniu: filtrul "Meal prep" e primul si e selectat de la inceput cand ai loturi active. Orice reteta cu lot activ intra in meniu ca "din Meal prep", indiferent pe ce cale o adaugi (Meal prep, Colectia mea, Biblioteca, din reteta deschisa).
- Teste: test_meal_prep.py extins.

## 3.13.1
- Meniu: numarul de portii din fiecare masa are eticheta "gatesc N portii" si inseamna un singur lucru: cate portii gatesti, deci ce cantitati ajung la cumparaturi (implicit portiile retetei). Macro si micronutrientii raman pentru o portie pe masa.
- Meal prep nu mai trimite ingrediente la cumparaturi (caseta a fost scoasa): ingredientele se cumpara din Meniu, o singura cale. Meal prep inseamna "ce am gatit".
- Cand adaugi un lot in Meal prep, toate mesele din Meniu de azi inainte cu aceeasi reteta devin "din Meal prep" (fara a numara portii: scoti tu mesele care nu mai intra). Ingredientele lor nu se mai cumpara a doua oara; cele din trecut nu se schimba.
- Teste adaptate: test_meal_prep.py (conversia mesei), test_lista_unificare_link.py.

## 3.13.0
- Cumparaturi: singularul si pluralul se unesc ("castravete" + "castraveti" = un singur produs, cantitatile se aduna; la fel rosie/rosii, cartof dulce/cartofi dulci, ardei gras/ardei grasi). Regula (`lkey`): fiecare cuvant pierde terminatia -ie/-ii/-i/-e/-a la comparare; nu se schimba numele afisat. Pe cele 1767 de nume de ingrediente din carti, regula uneste doar 20 de perechi, toate corecte. O lista veche cu dubluri se uneste singura la deschidere.
- Cumparaturi: sursa fiecarui produs (si titlul din "Pe retete") e link: deschide reteta (din Colectia mea sau din Biblioteca), ca sa verifici cantitatea. Daca reteta nu mai exista, apare un mesaj.
- Meal prep: daca adaugi a doua oara aceeasi reteta cu caseta de cumparaturi, cantitatile se inlocuiesc, nu se aduna.
- Test nou: test_lista_unificare_link.py.

## 3.12.1
- Meal prep: randurile sunt mai compacte (pe ecran lat, butoanele Deschide / Terminat stau in dreapta titlului; fara spatiul gol deasupra titlului sectiunii).
- O masa din Meal prep nu mai are campul de portii: nu schimba nimic (macro e pentru o portie, iar ingredientele nu se adauga la cumparaturi), deci doar prea sa insemne cate portii mananci.
- Test extins: test_meal_prep.py.

## 3.12.0
- Meal prep (in Meniu, deasupra lui "Azi si maine / Saptamana", pliat): lista simpla a retetelor gatite in loturi pentru mai multe zile. Fiecare rand: reteta, data gatirii, portii gatite (doar informativ), Deschide, Terminat (cu Anuleaza 8 secunde). "+ Adauga la Meal prep": alegi reteta, data (implicit azi) si portiile (implicit cele din reteta), si optional bifezi "Adauga ingredientele pentru N portii la cumparaturi" (cantitati scalate, ca la scalarea din 3.9.0). Adaugarea scrie si "gatit" in jurnalul retetei, la data aleasa.
- In "+ Adauga" din Meniu: filtru nou "Meal prep". O masa luata de acolo are eticheta "din Meal prep", nu mai are butonul "Am gatit" (gatitul s-a scris la Meal prep) si nu adauga ingredientele la cumparaturile meniului (le-ai cumparat la gatit). Macro se calculeaza ca la orice masa; nu scade nimic automat, "Terminat" il apesi tu.
- Date: cheie noua `rmp` (in backup si sincronizare). Nu exista termene de pastrare, componente (orez fiert, legume taiate) sau numarare de portii: scoase din plan ca sa ramana simplu.
- Test nou: test_meal_prep.py.

## 3.11.1
- Meniu: daca o reteta nu are macro, se calculeaza din baza Info (gratuit, offline) cand Info recunoaste cel putin 80% din ingredientele cu cantitate (acelasi prag ca la avertismentul de diferente). Nu se salveaza nimic pe reteta. Merge si pentru retetele AI salvate si pentru intrarile cu ingrediente trecute direct in meniu. In nota zilei apare "N calculate din Info", separat de "N estimate cu AI".
- Butonul "Estimeaza macro ✦ AI" ramane doar pentru retetele pe care Info nu le acopera, cu numarul lor.
- Teste: nou test_macro_meniu_local.py; adaptate test_meniu_surse_macro.py (ingredient neacoperit de Info) si test_meniu.py.

## 3.11.0
- Butoanele care cheama modelul (costa tokeni) au un chip lila "✦ AI": Genereaza idei, Cauta pe web, Mai multe idei, Alege reteta, Adapteaza la aparatele mele, Calculeaza macro, Estimeaza macro (Meniu), Genereaza / Alta generata (propunere de meniu), Completeaza / Cauta (Info). Chipul e pus din CSS (atributul `data-ai`), deci ramane si cand textul butonului se schimba ("Calculez..."). Textul "cu AI" din etichete a fost scos ca sa nu se repete. Legenda e in Idei. Un test verifica in cod ca fiecare buton care cheama modelul il are.
- Cumparaturi: butonul e comutator. "Adauga la cumparaturi" devine "✓ In cumparaturi" (stil activ); al doilea click scoate reteta din lista (doar cantitatile ei), cu Anuleaza 8 secunde. Starea se vede si cand redeschizi reteta. A disparat "Adaugat (N) - vezi Cumparaturi". La retetele din carte se adauga cantitatile scalate la portiile alese.
- Cronologie: timpul de start nu se mai arata cand pasii sunt pe rand; cand exista pasi in paralel apare mic si estompat, "Start" / "dupa N min". In vederea "Pe aparat" eticheta aparatului nu se mai repeta pe fiecare pas (era deja in titlul grupului).
- Carduri (Colectia mea, Biblioteca, reteta deschisa): categoria sau aparatele pe un rand, etichetele (vegetarian, keto...) pe alt rand.
- Test nou: test_marcaj_ai_si_cumparaturi.py; adaptat test_meniu_surse_macro.py.

## 3.10.0
- Navigare noua: o singura bara cu 5 destinatii (Retete, Meniu, Cumparaturi, Debara, Mai mult), in locul celor 4 grupuri de pilule si a celei de-a doua linii. Pe telefon (sub 700 px) bara e lipita jos; pe ecran lat e sus, lipita de marginea ferestrei. Pilulele Idei / Biblioteca / Colectia mea raman doar la Retete.
- "Mai mult" deschide o pagina cu doua intrari: Ghid nutritie (fostul Info: Ingrediente, Masuri, Gatire) si Setari. "Planific" nu mai exista ca denumire: Meniu, Cumparaturi si Debara sunt pagini separate.
- Contorul de cumparaturi si semnul de backup vechi stau pe bara (Cumparaturi (N), punct pe Mai mult si pe Setari). Mesajele scurte si butonul Anuleaza stau deasupra barii pe telefon. Butonul Inapoi de pe Android ramane pas cu pas, "Mai mult" fiind o pagina normala in istoric.
- Teste adaptate: _h.py (nav), test_navigare.py (bara jos pe telefon / sus pe desktop), test_info.py, test_submeniu.py, test_meniu.py.

## 3.9.0
- Scalarea cantitatilor la gatit: in reteta deschisa (Biblioteca si Colectia mea), sub Ingrediente, "Gatesc pentru [-] N [+] portii". Cantitatile din lista se recalculeaza, iar Mod gatit primeste lista scalata (cu o nota). Nu se salveaza nimic: reteta, macro-ul, portiile si timpii raman cei din carte; la alta reteta sau la inchidere revine la portiile retetei. Cantitatile scrise in textul pasilor nu se scaleaza (nota le spune asta). Fara numar de portii nu exista control, doar explicatia.
- Uniformizare vizuala: o singura scara de fonturi (--fs-xs/s/m/l/xl/t), o singura scara de inaltimi (--h-n 44 px, --h-l 48 px), raze si culori ca tokeni (--r-xs, --r-p, --star, --on), culoarea ambra pentru avertismente blande (.warn2), 180 de stiluri inline mutate in clase (raman 42, specifice unui singur loc sau dinamice), clase utilitare pentru spatieri. Acelasi font in toate meniurile.
- Test nou: test_scalare.py.

## 3.8.3
- Setari > Tehnic > Despre: istoricul modificarilor e pliat sub titlul "Pentru dezvoltare: istoric modificari" si nu mai e primul lucru pe care il vede un utilizator; versiunea ramane afisata. Istoricul complet ramane in CHANGELOG.md.
- Test adaptat: test_submeniu.py.

## 3.8.2
- Culori consecvente la mesajele scurte (toast): chenar verde pentru ce a reusit sau e doar informatie ("Anulat.", "Salvat", "Sters din lista ta"), chenar rosu pentru ce nu a mers sau cere atentie ("Nu am putut...", campuri necompletate, "Exista deja..."). Inainte toate aveau chenar rosu, si "Anulat." parea o eroare.
- Etichetele sunt pliate si in Biblioteca (reteta deschisa), la fel ca in Colectia mea, cu cele alese afisate pe linie.
- Test extins: test_info_sterge_anulare.py (culori, etichete pliate in Biblioteca).

## 3.8.1
- Info: stergerea unui aliment adaugat de tine se poate anula timp de 8 secunde (butonul "Anuleaza", ca la celelalte stergeri); inainte disparea fara cale de intoarcere.
- Colectia mea: blocul "Etichete" e pliat; pe linia lui vezi etichetele alese ("Etichete: vegan, keto"), iar casetele de bifat se deschid la apasare. La o adaptare nesalvata ramane deschis, pentru ca se salveaza odata cu reteta.
- Test nou: test_info_sterge_anulare.py.

## 3.8.0
- Fara diacritice peste tot: ce scrii, ce vine de la AI, ce incarci din carti, ce restaurezi din backup sau primesti prin sincronizare se curata automat la salvare. Regula: a, s, t simple; "i" cu semn la inceput de cuvant sau dupa ne/re/pre/de/dez devine i ("neindulcita", "preincalzeste"), in vechea scriere devine a ("paine", "pana").
- Migrare unica la prima pornire: curata ce ai deja (retete din carti, debara, meniuri, cumparaturi, alimente). Inainte face o copie de siguranta (Setari > Tehnic > Backup > copii automate, "Restaureaza" daca vrei sa revii). Intrarile care devin identice dupa curatare (ex: "mazare" si "mazare" cu diacritice in debara) se unesc, cu formele pastrate. Descarcarea unei carti da acum un JSON curat.
- Retete demo (6, scrise original, fara drepturi de autor) in locul retetei de test din cod: apar cat timp nu ai incarcat nicio carte; dispar cand incarci o carte sau scrii prima ta reteta. Una are numarul de portii de verificat, una ingrediente neclare, ca sa poti testa marcajele.
- Macro: sursa se salveaza acum pe toate caile (Info, AI, scris de mana). O reteta scrisa de tine cu macro fara sursa nu mai spune "Valori din carte", ci "Sursa necunoscuta (apasa Recalculeaza din Info)"; apare si "Estimat de AI" si "Scrise de tine".
- Audit UI/UX (corecturi): butoanele de actiune au minim 40 px (Lista, Colectia mea, Aparate, Debara); textul secundar are contrast de minim 4.5:1 in tema luminoasa, iar avertizarea din Setari are contrast bun si in tema intunecata; o singura forma pentru aceeasi actiune ("Adauga la meniu", "Anuleaza", "Sterge" pentru aparate, "Goleste biblioteca"); Idei, Colectia mea, Meniu si Lista au titlu de pagina pentru cititoare de ecran (invizibil pe ecran); sagetile "▾/▸" din Meniu sunt ascunse de cititoare de ecran.
- Teste noi: test_normalizare.py, test_demo_si_sursa.py; adaptat test_meniu.py (reteta demo).

## 3.7.1
- Info > Ingrediente > Editeaza: poti schimba numele alimentului adaugat de tine (un nume deja folosit de alt aliment e refuzat). Un aliment venit de la AI ramane marcat AI chiar daca ii corectezi valorile manual; "manual" ramane doar pentru alimentele introduse de la inceput de tine.

## 3.7.0
- Alimente adaugate de tine: in Info > Ingrediente > Editeaza ai doua campuri noi, unitatea (ex: cub) si cate grame are (ex: 4). Randul din Info arata atunci valorile pe unitate ("pentru 1 cub (4 g)"), nu la 100 g (daca schimbi campul "Pentru ... g", se foloseste cantitatea ceruta). In retete, un ingredient fara unitate sau cu "bucata" (ex: "1 cub zahar") se calculeaza cu greutatea setata, in loc sa ramana fara date.

## 3.6.1
- Corecteaza reteta: langa "Calculeaza macro (AI)" e din nou "Calculeaza din Info", care completeaza campurile de macro per portie din datele salvate in aplicatie (pe ingredientele din editor, cu numarul de portii din camp). Arata cate ingrediente au date si care lipsesc; se salveaza ca "calculat din Info" cand salvezi reteta.

## 3.6.0
- Marcajele de verificare sunt acum trei, separate: ingrediente si text (ingrediente neclare, ingrediente rupte, text OCR gresit, ingrediente_ou, cantitate_ingredient), portii (numar de portii neconfirmat sau lipsa) si macro (macro nesigur). Biblioteca > Filtre > Stare are cate un filtru cu numaratoare pentru fiecare ("Fara numar de portii" a fost inclus in "Portii de verificat").
- "Parcurge retetele de verificat" trece doar prin retetele cu ingrediente sau text de verificat. In reteta deschisa, portiile si macro-ul au avertisment propriu, in alta culoare.
- Reparatie: "Salveaza ca verificata" nu mai sterge si marcajele de portii si de macro. Marcajul de portii dispare cand schimbi sau confirmi portiile; cel de macro, cand recalculezi macro-ul din Info sau il corectezi si salvezi.

## 3.5.1
- Valorile de referinta pentru adulti au fost verificate pe sursele EFSA (magneziu 350/300 mg, vitamina E 13/11 mg, vitamina D 15 µg, sodiu 2000 mg, vitamina K 70 µg). O singura corectie: tinta pentru vitamina K era calculata din greutate (1 µg/kg); EFSA da 70 µg pe zi pentru adulti, indiferent de greutate.
- Reparatie in calculul de macro: in ingrediente, "fara zahar", "fara sare" etc. nu mai sunt potrivite cu zaharul sau cu sarea (ex: "sos de rosii fara zahar adaugat" aduna 50 g de zahar). Se corecteaza si meniul, si micronutrientii. Macro-ul deja salvat al unei retete se schimba doar daca apesi "Recalculeaza din Info".

## 3.5.0
- Setari are doua taburi: Administrare (Profil nutritional, Aparate, Preferinte alimente, Categorii alimente, Etichete retete, Mese) si Tehnic (Carti, Backup, AI si cheie, Despre). Sectiunea pliabila "Tehnic" a fost inlocuita de tab. Tabul ales se tine minte; un punct pe tabul Tehnic arata ca ceva cere atentie (cheie lipsa, backup vechi), iar detaliul e pe randul respectiv.

## 3.4.2
- Cumparaturi: butonul se numeste "Am in debara"; dupa confirmare produsul dispare din lista de cumparaturi si apare in Debara (se poate anula).
- Setari: "AI si cheie" a revenit sub Tehnic, inainte de Despre (ordine: Carti, Backup, AI si cheie, Despre). "Cheie lipsa" apare iar in rezumatul Tehnic.
- Corectie la 3.4.1: randul "Muta in debara" si "AI si cheie" in lista principala sunt anulate.

## 3.4.1
- Tasta Inapoi (Android / browser) merge pas cu pas: din reteta deschisa te duce la lista, din subpagina Setari la lista Setari, apoi la pagina anterioara. Butoanele "Inapoi" din aplicatie nu mai umplu istoricul.
- Taste mai mari (min. 40 px): butoanele din Debara si link-ul "Schimba aparatele" din Idei. Controalele fara text au aria-label (verificat; semnalarile din testul de utilizare erau in mare parte false).

## 3.4.0
- Cautare in Biblioteca: retetele cu acelasi titlu (si din carti diferite, si din aceeasi carte; fara diacritice, fara diferente de litere) apar intr-un singur card. Exemplarul principal e cel mai complet (fara marcaj "de verificat", cu pasi, cu cele mai multe ingrediente, cu macro si portii); celelalte sunt in linia "Mai e si in: carte, nr." (cu "(de verificat)" cand e cazul), fiecare cu deschidere directa. Gruparea se face dupa filtre (pe o singura carte, grupul are doar exemplarele din ea); retetele din cos nu intra. Numaratoarea spune cate s-au grupat.
- Biblioteca > Filtre > Stare: "Fara numar de portii (N)" (retetele marcate "nu se aplica" nu intra).
- Setari > Backup: daca alegi un fisier de corectii in loc de backup, mesajul spune ca e un fisier de corectii si ca se aplica din Setari > Carti.

## 3.3.1
- Cos: iconul de cos nu mai e pe lista de rezultate, ci pe reteta deschisa, sus, langa Favorita (nu mai e si la Mai multe actiuni, ca sa fie un singur loc). Confirmarea e cu X si bifa: dupa clic pe cos apar "Muta in cos? X ✓", raman pana alegi (fara revenire automata). La fel la "Sterge definitiv" si "Goleste cosul" din Cos. Dupa bifa, revine la lista, cu "Anuleaza" 8 secunde.

## 3.3.0
- Cos: pe fiecare card din Biblioteca apare un icon de cos; apesi (confirmi apasand inca o data) si reteta se muta in cos, cu "Anuleaza" 8 secunde. Si din reteta deschisa, la Mai multe actiuni: "Muta in cos". Reteta din cos ramane in biblioteca, cu jurnal, notite si stea, dar nu mai apare in cautare, in alegerea retetelor pentru meniu, in "De verificat" si in "Propune-mi un meniu"; numaratoarile ignora cosul.
- Cosul se vede in Colectia mea, la filtrul "Cos (N)": "Restaureaza" (cu Anuleaza), "Sterge definitiv" si "Goleste cosul", ambele cu confirmare si Anuleaza. Stergerea definitiva scoate si steaua si jurnalul retetei. In meniu, o reteta aflata in cos are nota "Reteta e in cos".
- Fisierul de corectii (Setari > Carti) accepta acum si `"sterge": true` (stergere definitiva, cu copie automata a bibliotecii inainte si avertizare in cardul de aplicare) si `"titlu_nou"` (schimbare de titlu).

## 3.2.3
- Sursa retetei (cartea, numarul, "adaptata din") apare intr-o singura linie, imediat sub titlu, inainte de etichete: in Biblioteca, in reteta deschisa si in Colectia mea (acelasi format peste tot: "Din BT FIT Cookbook V2, reteta 43"). Linia "Sursa:" de la sfarsitul retetei deschise a fost scoasa, ca sa nu apara de doua ori.

## 3.2.2
- Corecteaza reteta: daca extragerea automata a esuat (ingrediente sau pasi goi) dar textul paginii din carte e pastrat, casetele pornesc de la liniile detectate in text (ingrediente din zona de dinainte de "Instructiuni", pasi uniti pe propozitii, cu "Varianta 1/2" cand pagina are doua variante; fara liniile de macro). Apare o singura nota ca s-a completat automat; nu se salveaza nimic pana nu apesi Salveaza. Retetele cu ingrediente sau pasi deja extrasi nu se schimba.

## 3.2.1
- Toate retetele au acelasi camp "Portii (reteta)", inclusiv cele fara numar de portii ("nu se aplica" sau necunoscut): campul apare gol, cu indicatia potrivita. Scrii un numar, vezi macro la N portii fata de valoarea pentru toata reteta, apesi "Salveaza N portii" (scoate si marcajul "nu se aplica"). Mesajul "Cantitatile sunt cele din carte" a disparut, fiind inlocuit de o singura indicatie sub camp.

## 3.2.0
- Reteta deschisa: campul "Portii" a devenit "Portii (reteta)" si nu mai scaleaza cantitatile (ingredientele raman cele din carte). Daca schimbi numarul, apare imediat macro la N portii, langa valoarea salvata, si un buton "Salveaza N portii" (sau "Confirma N portii" cand numarul e cel salvat dar neconfirmat). Salvarea se face direct, fara "Corecteaza reteta", scoate marcajul "numar de portii" de la verificat si recalculeaza macro-ul daca era calculat local sau lipsea (macro-ul din carte nu se atinge).
- "Mod gatit", "Adauga la cumparaturi", "Adauga la meniu" si "Adapteaza" folosesc numarul de portii salvat.
- Scalarea cantitatilor pentru gatit a ramas in backlog, pentru Info > Gatire.

## 3.1.4
- README aliniat cu aplicatia: profil nutritional, tinte, micronutrienti, bare, chei de backup (`rprof`). Comentariul de la inceputul `app.js` actualizat.
- `release.sh` verifica la fiecare pachet ca versiunea, CHANGELOG-ul, cheile de backup si paginile din Setari sunt in README.

## 3.1.3
- Reteta de test (Ciorba de vacuta): scos macro-ul din carte (270 kcal), care nu se potrivea cu ingredientele (686 kcal); un utilizator nou nu mai vede avertismentul rosu dupa ce o pune in meniu. Macro-ul se calculeaza din ingrediente.
- Balonul de confirmare (ex: "Adaugat in meniu") dispare cand schimbi pagina si la atingere.
- Cumparaturi: mesajul dupa "Cumparaturi azi si maine" spune cate produse sunt ascunse pentru ca sunt in debara, ca numarul sa se potriveasca cu cel din meniu.

## 3.1.2
- Barele de nutrienti si macro: o singura culoare (verdele aplicatiei) in loc de gradient. Bara arata cat din tinta ai atins; linia marcheaza 100%; terracotta apare doar peste tinta la limite (sodiu, saturate, zaharuri) si la calorii, carbohidrati si grasimi. Pentru proteine si micronutrienti de atins, peste 100% ramane verde.
- Macro in Meniu: bloc propriu, cu bare mai groase, valoare, tinta, procent si "mai ramane" (sau "peste tinta cu ..."). Fara tinte ramane linia de total ca inainte.
- "adulti" in loc de "adulti 18+".

## 3.1.1
- **Reparatie in calculul de macro:** un ingredient ca "apa" era potrivit cu "Ton in apa" (potrivire aproximativa) si aduna calorii si proteine de ton. Acum apa si celelalte ingrediente fara aport caloric sunt recunoscute inainte de orice potrivire aproximativa. Se corecteaza si micronutrientii din meniu si din reteta.
- Panoul "Calculat din Info": nu mai repeta valorile din carte ("Acum in reteta" era deja afisat deasupra), iar "Cum am calculat" arata acum aportul fiecarui ingredient per portie (kcal, proteine, carbo, grasimi), de la cel mai mare la cel mai mic, in loc sa repete cantitatea. Potrivirile aproximative sunt marcate "verifica".
- Alimentele tale cu valori extinse (fibre, minerale, vitamine) intra acum si in calculul micronutrientilor.

## 3.1.0
- **Profil nutritional** (Setari > Profil nutritional): sex, varsta, greutate, inaltime, nivel de activitate si etapa (mentinere, crestere masa musculara, definire). Din el se calculeaza tintele zilnice: calorii (formula Mifflin-St Jeor x nivel de activitate, +10% la crestere, -15% la definire), proteine (standard 0,83 / 1,6 / 2,0 g pe kg dupa etapa), grasimi (30% din calorii), carbohidrati (restul), fibre.
- **Tintele de macro au standard recomandat, dar se pot edita:** calorii, proteine pe kg, grasimi in procente din calorii. Daca golesti un camp, revine la standard.
- **Tinta de macro se editeaza acum intr-un singur loc** (Profil nutritional). Campurile de tinta din Meniu au fost scoase; tinta veche din Meniu ramane folosita pana completezi profilul.
- **Micronutrienti** (25 de valori din baza Info): in Meniu, pe fiecare zi (cate 1 portie din fiecare reteta) si ca medie pe saptamana, cu bara si procent din necesarul zilnic; in reteta, per portie. Nutrientii importanti (fibre, sodiu, saturate, zaharuri, fier, calciu, vitamina D, B12, folat) sunt primii, restul sub "Restul nutrientilor". Micronutrientii se compara cu valorile EFSA pentru adulti de 18+ ani (fara editare).
- Acoperirea e afisata mereu: cate ingrediente au valori. Limite: valori de la alimente crude (fara pierderile de la gatit), sarea adaugata nu intra in sodiu, nu acopera sarcina, alaptarea sau boli. Orientare, nu sfat medical.
- Profilul intra in backup si in sincronizarea Dropbox.

## 3.0.3
- Cand scoti o reteta de la favorite (din Biblioteca, Retete salvate sau din reteta deschisa), apare bara "Scos de la favorite" cu "Anuleaza", 8 secunde, ca la celelalte stergeri.

## 3.0.2
- **Reparatie in sincronizare (important):** la prima sincronizare a unui dispozitiv, o valoare goala de aici (de exemplu portii necompletate) suprascria o valoare existenta din Dropbox. Acum o valoare goala nu mai bate niciodata o valoare completata, iar la prima sincronizare, cand exista doua valori diferite, castiga cea din Dropbox si esti anuntat.
- La prima pornire a acestei versiuni, baza de sincronizare se reseteaza o data (pe fiecare dispozitiv) si lista de conflicte se goleste, ca sa se repare automat datele suprascrise gresit in 3.0.0 / 3.0.1.
- Mesajul de conflict nu mai spune "varianta de aici", ci arata ce s-a pastrat si ce era pe celalalt dispozitiv.

## 3.0.1
- Sincronizare: cand aceeasi reteta (sau acelasi camp) e modificata pe ambele dispozitive, se pastreaza varianta de aici si esti anuntat. In Setari > Backup > Sincronizare Dropbox apare lista (reteta, camp, ce s-a pastrat, ce era pe celalalt dispozitiv), iar in aplicatie o bara cu "Vezi". "Am inteles" o sterge. Nu se creeaza versiuni duplicate.
- Setari, randul Backup: cu Dropbox conectat scrie "sincronizat cu Dropbox: data", nu "ultimul backup".

## 3.0.0
- **Sincronizare intre dispozitive prin Dropbox** (Setari > Backup > Sincronizare Dropbox). Un singur fisier `sync.json` in Dropbox-ul tau; se sincronizeaza tot ce intra in backup: biblioteca cu corectiile ei, retete salvate, favorite, etichete, aparate, lista, debara, meniu, notite, preferinte, alimente proprii. Nu se sincronizeaza cheia AI si cheile Dropbox.
- Combinare in 3 pasi (starea de la ultima sincronizare, starea de aici, starea din Dropbox): modificarile facute pe dispozitive diferite se pastreaza amandoua; pe acelasi element castiga varianta de pe dispozitivul care sincronizeaza; o reteta modificata pe un dispozitiv si stearsa pe altul ramane; stergerile se propaga.
- Cheia aplicatiei Dropbox e in aplicatie: ai nevoie doar de "Conecteaza Dropbox" si logare, o data pe dispozitiv (fara sa mai scrii cheia). Cheia proprie ramane la Avansat.
- Sincronizare automata: la deschidere (preia singura si se reincarca o data), la 15 secunde dupa o modificare, cand inchizi sau revii in aplicatie. In timpul folosirii, modificarile noi de pe alt dispozitiv apar intr-o bara cu "Aplica acum". Buton "Sincronizeaza acum" si comutator pentru sincronizarea automata.
- Frana de siguranta: o sincronizare care ar sterge peste jumatate din biblioteca sau din retetele salvate se opreste si cere "Sincronizeaza oricum". Inainte de orice preluare se face o copie locala.
- Inlocuieste backup-urile multiple din Dropbox (cele 10 fisiere `retete-backup-...`); cele vechi raman in Dropbox, nu se mai creeaza altele. Backup-ul in fisier si copiile automate din browser raman.

## 2.34.3
- Indicatia de instalare pe Android spune explicit "Adauga pe ecranul principal" (in engleza "Add to Home screen"), ca in meniul browserului.

## 2.34.2
- Setari > Backup > "Stocare si instalare": indicatia de instalare se potriveste dispozitivului. Pe iPhone/iPad ramane "Partajeaza, apoi Adauga pe ecranul principal"; pe Android si pe laptop apare indicatia lor (inainte aparea doar cea pentru iPhone). Daca aplicatia e deja instalata, scrie asta. Se arata un singur text, nu toate. Butonul "Instaleaza aplicatia" apare doar cand browserul il permite.
- Spatiul disponibil se arata in GB cand e mare (inainte "din ~282718 MB").

## 2.34.1
- Setari > Tehnic: pagina "Carti si date" e impartita in doua. "Carti" pastreaza incarcarea, fisierul de corectii si descarcarea/stergerea (pe carte si toate). "Backup" are trei carduri separate: "Backup in fisier", "Copii automate in acest browser" si "Backup in Dropbox". Randul Backup arata "ultimul backup: data · Dropbox conectat" si poarta avertizarea de backup vechi; randul Carti arata numarul de retete din biblioteca.
- Doar aranjare: nicio functie si nicio data nu s-au schimbat.

## 2.34.0
- Setari > Date: copii automate in acest browser. Aplicatia isi face singura o copie (cel mult una la 20 de ore, la pornire) si le pastreaza pe ultimele 3, cu "Restaureaza" si "Fa o copie acum". Inainte de orice restaurare se face o copie a starii curente. Nu te ajuta daca stergi datele browserului.
- Setari > Date: backup in Dropbox. Lipesti o data "App key" din aplicatia ta Dropbox, conectezi contul (autentificare PKCE, fara secret in cod), apoi "Salveaza acum in Dropbox" sau copie automata o data pe zi la deschidere (poate fi oprita). Se pastreaza ultimele 10 copii in folderul aplicatiei; poti restaura oricare, cu previzualizare si confirmare ca la restaurarea din fisier.
- Semnul de backup vechi tine cont si de backup-ul din Dropbox. Cheia API, app key-ul si tokenul Dropbox nu intra in backup.

## 2.33.0
- Meniu: cand macro-ul din carte al unei retete difera mult de calculul din Info (sub 70% sau peste 140% per portie), sub reteta apare o avertizare cu ambele cifre: "Verifica portiile in reteta". Se calculeaza doar cand cel putin 80% din ingrediente au date, nu pentru retete cu "-" si nu pentru macro calculat deja din Info. Butonul "E in regula" ascunde avertizarea pe acea reteta (se salveaza pe reteta si intra in backup). Nu modifica niciun macro si nu schimba totalul zilei.

## 2.32.0
- Numarul de portii se confirma separat: o reteta marcata "numar de portii" (in coada "De verificat") arata un avertisment propriu, iar in editor apare butonul "Confirma numarul de portii", care scoate doar acest marcaj si salveaza imediat, fara sa atinga restul retetei. "Salveaza ca verificata" nu mai sterge marcajul de portii.
- Campul "Portii" din editor e gol cand reteta nu are numar (inainte aparea 1, ceea ce ascundea problema). Poti scrie "-" daca numarul nu se aplica: reteta ramane fara portii, fara "Macro per portie" calculat si fara scalare.
- Setari > Date > "Aplica un fisier de corectii": aplica portii si marcaje pe retetele deja incarcate, potrivite dupa numar si titlu, fara sa le inlocuiasca. Retetele ale caror portii le-ai schimbat intre timp sunt sarite; se vede o previzualizare inainte de aplicare.
- README: sectiune noua despre ce contine backup-ul complet, backup-ul per carte si fisierul de corectii.
- Retetele marcate doar pentru portii raman in propunerile de meniu.

## 2.31.3
- Biblioteca: pe randul "Cauta in retetele tale" apare "Rezultat: x retete gasite din y retete in baza locala". Linia separata cu totalul si cu "de verificat" a fost scoasa (numarul de verificat ramane pe butonul "Parcurge retetele de verificat (n)"); au ramas doar notele despre filtrul Din debara.

## 2.31.2
- Biblioteca: numarul de retete gasite apare sus, sub filtre ("112 retete" sau "Se arata 60 din 112 retete"); jos ramane doar butonul "Arata mai multe".

## 2.31.1
- Preferintele pe retete: o singura linie "Contine: ..." (pe card si pe reteta deschisa) in loc de "Iti place" si "Contine ce eviti". Fiecare cuvant are culoarea categoriei: verde pentru ce-ti place, maro pentru ce e mai putin potrivit. Fara dezacorduri de singular/plural.

## 2.31.0
- Comutatorul RO/EN din 2.30 a fost scos (prea complicat). In schimb, cand deschizi un aliment din Info > Ingrediente, numele englezesc (USDA) apare imediat sub cel romanesc. Cautarea gaseste alimentul si dupa numele englezesc. Ordinea alimentelor ramane alfabetica dupa numele romanesc.

## 2.30.1
- Ordinea alimentelor in Info (Ingrediente si Masuri) e aceeasi in RO si EN (alfabetic dupa numele romanesc); comutatorul schimba doar numele afisate, ca sa poti urmari usor acelasi aliment in ambele limbi.

## 2.30.0
- Comutator RO | EN in Info > Ingrediente si Masuri: numele alimentelor (si etichetele de nutrienti) in romana sau engleza. Numele englezesti sunt cele din USDA; cautarea gaseste alimentul in ambele limbi, indiferent de selectie. Alegerea se retine. Textele aplicatiei si alimentele adaugate de tine raman asa cum sunt.

## 2.29.0
- Alimentele adaugate de tine (AI sau manual) au acum toate cele 27 de valori ca randurile din baza: fibre, zaharuri, grasimi saturate, colesterol, minerale si vitamine. AI le cere pe toate (null pentru ce nu stie); manual, le completezi optional intr-o sectiune pliata.
- Randul unui aliment adaugat se deschide ca cele din baza. In el: "Completeaza cu AI" (pentru cele salvate doar cu macro), "Editeaza" (orice valoare, manual) si "Sterge".
- "Copiaza lista" include si valorile de micronutrienti. Datele sunt pregatite pentru functii viitoare cu focus pe micronutrienti.

## 2.28.4
- Info > Ingrediente: cand cautarea nu gaseste nimic, apar "Cauta cu AI" si "Completeaza manual" pentru termenul cautat; rezultatul se salveaza local si apare imediat in lista, marcat AI sau manual.

## 2.28.3
- Corectie in Info: randul "Patrunjel (radacina)" avea valorile USDA pentru pastarnac (75 kcal, 1.2 / 18 / 0.3); l-am redenumit "Pastarnac". Radacina de patrunjel nu are rand in Info (nu am valori de incredere pentru ea).
- Un aliment adaugat de tine care exista deja in Info cu acelasi nume nu mai apare de doua ori in lista.
- Butonul "Sterge" de pe alimentele adaugate de tine e mic si sta pe acelasi rand cu numele.

## 2.28.2
- Corectie la 2.28.1: "Patrunjel (radacina)" si pastarnacul sunt alimente diferite; numele randului din Info e cel original, iar pastarnacul ramane aliment separat.
- Alimentele gasite cu AI sau completate manual apar in lista principala din Info > Ingrediente, marcate "AI" sau "manual" (nu mai exista sectiune separata); filtrul de grupa le include (AI alege grupa, manual o alegi tu, optional).
- Butonul "Scoate" se numeste acum "Sterge" (sterge alimentul din lista ta; retetele care il foloseau il vor cere din nou).

## 2.28.1
- Randul "Patrunjel (radacina)" din Info a fost redenumit "Pastarnac (patrunjel radacina)" (valorile erau deja cele pentru pastarnac), ca sa fie gasit de calculul macro si de cautare. Ingredientul "patrunjel" simplu se potriveste acum cu patrunjelul verde, nu cu radacina.
- La "Adaugate de tine" si la ingredientele fara date, numele se afiseaza fara diacritice.

## 2.28.0
- Macro calculat local, din Info > Ingrediente, direct pe reteta deschisa: buton "Calculeaza din Info" in sectiunea "Macro per portie" (fara AI, gratuit). Arata acoperirea ("din X din Y ingrediente") si, in "Cum am calculat", ce aliment si cate grame s-au folosit.
- Ingredientele fara date (sau cu unitate imposibil de convertit, ex. "1 cutie") sunt evidentiate; pentru fiecare alegi "Cauta cu AI" sau "Completeaza manual". Rezultatul se salveaza local (cheia noua rfd, inclusa in backup) si se foloseste la toate retetele viitoare.
- Alimentele adaugate de tine apar in Info > Ingrediente, sectiunea "Adaugate de tine" (cu Scoate si Copiaza lista).
- "Salveaza pe reteta" pune macro-ul pe reteta, vizibil in Meniu, filtre si etichete automate.
- Potrivire mai buna a numelor (plural, sinonime: oua/ou, cepe/ceapa) si greutati medii pe bucata/lingura/ceasca (nutri.js: NUTRI.P, NUTRI.Z). Estimare pe 1238 retete: ~80% din linii potrivite, ~72% calculabile.
- Butonul "Calculeaza macro (AI)" din editor ramane, ca estimare AI pentru toata reteta.

## 2.27.0
- Info > Gatire (pagina noua): sfaturi generale pentru cine invata sa gateasca, in 12 teme pliabile: tehnici de baza (organizare, taiere, fierbere, prajire, coacere), timpi si temperaturi (fierbere, cuptor, temperaturi sigure pentru carne), siguranta alimentara (igiena, pastrare) si inlocuiri / cum repari o mancare. Continutul e in `nutri.js`.

## 2.26.3
- Documentatie: README si comentariul de la inceputul `app.js` actualizate (sectiunea Info, `nutri.js`, lista corecta a paginilor din Setari, cheile din localStorage, pasii de publicare).

## 2.26.2
- Info > Ingrediente: se afiseaza doar denumirea alimentului, fara nicio stare (nici fiert, uscat, conserva); cand starea conteaza, e deja in nume (ex. "Fasole boabe fiarta").

## 2.26.1
- Info > Ingrediente: nu se mai afiseaza "cru/crud/crude" (implicit alimentele sunt crude); raman doar starile care conteaza (fiert, copt, uscat, conserva).

## 2.26.0
Din auditul UI/UX.
- Reteta deschisa: ingredientele si pasii vin primii; etichetele si jurnalul sunt intr-un bloc dedicat sub reteta.
- Biblioteca: carduri mai compacte (fara spatiu gol intre insigne si butoane); titlurile si textul retetelor se afiseaza fara diacritice (datele originale raman neschimbate).
- Info: grupa se alege dintr-un selector (nu 11 butoane); descrierea e mai scurta; Masuri are acelasi selector de grupa.
- Setari: lista de mese si etichetele nu mai taie textul pe telefon; Stocare si instalare e pliata; modelele AI sunt sub "Modele (avansat)"; mesajul "Nu ai descarcat niciun backup inca" apare o singura data.
- Cumparaturi: butonul "Copy to clipboard" e acum "Copiaza lista"; comutatorul Pe produse / Pe retete e discret.
- Debara: legenda simbolurilor e pliata; campul de cautare are un text mai scurt.
- Meniu: butonul "x" e acum "Scoate". Idei: Portii si Timp maxim pe acelasi rand.
- Tinte tactile: bife si butoane de scoatere de minimum 40 px.
- Contorul de produse ramane doar pe Cumparaturi (nu mai apare si pe Planific).
- Colectia mea goala nu mai arata filtrele.

## 2.25.0
- Biblioteca: se arata primele 60 de retete, restul prin "Arata mai multe" (cautarea "a" nu mai deseneaza 1434 retete deodata).
- Lista de cumparaturi: elementele stricate din datele salvate sunt ignorate la citire, nu mai blocheaza pagina Cumparaturi.
- Info, Lista si Debara folosesc culorile temei, deci arata corect si in modul intunecat.
- Contrast: corectat in Meniu (totalul de macro) si in Aparate (eticheta mov).
- Debara: textul de ajutor e pliat sub "Cum functioneaza Debaraua".
- Curatenie: scos cod nefolosit (bTxt, vqLeft, BKDAYS, clase CSS .mr/.mcs).

## 2.24.1
- Setari: sectiunea "Tehnic" nu se mai inchide singura. Cand lista Setari se redesena (de ex. dupa actualizarea semnului de backup), "Tehnic" revenea pliat chiar daca o deschisesei tu. Acum ramane asa cum ai lasat-o.

## 2.24.0
- Debara: campul de sus cauta si adauga in acelasi timp. Pe masura ce scrii, lista se filtreaza, iar numarul de sub titlu arata "N din total". Daca nu exista, apare "Nu e in debara. Apasa Adauga ca sa-l pui." Nu exista un al doilea camp.
- Info > Ingrediente: "Drojdie inactiva (fulgi)", cu valorile de pe eticheta unui produs cunoscut (400 kcal, 50 g proteine, 37 g carbohidrati, 4 g grasimi, 17 g fibre la 100 g), pentru ca sursa USDA nu o are. Vitaminele si mineralele raman goale: depind de marca si de fortifiere. "Drojdie uscata" a fost redenumita "Drojdie de panificatie (uscata)", ca sa nu fie confundata cu cea inactiva.

## 2.23.4
- Info: "Faina de porumb" si "Malai" sunt acum doua alimente separate (inainte erau unul singur, "Faina de porumb (malai)"). Valorile vin din doua intrari diferite din sursa USDA (corn flour si cornmeal); diferenta nutritionala dintre ele e mica, dar masurile (lingura, cana) difera.

## 2.23.3
- Info > Masuri simplificata: raman doar alimentele care se masoara cu lingura, lingurita sau cana (faina, zahar, lapte, ulei, seminte, cereale uscate, condimente etc., 72 de alimente). Coloana "Bucata" si nota explicativa au fost scoase; bucatile atipice se cantaresc.

## 2.23.2
- Info > Masuri, coloana "Bucata" refacuta. Inainte lua primul rand gasit in sursa, deci amesteca o boaba de afina (1 g), o felie, un fruct intreg de 905 g, un inel de ardei etc. Acum "Bucata" inseamna un exemplar intreg de marime medie, fara resturi necomestibile; la paine, branzeturi si mezeluri o felie, la peste un file. Fiecare valoare are eticheta ei (medie, felie, catel, bucata M...) si o nota explica regula. Unde nu exista un exemplar clar (fructe de padure, nuci, verdeturi, varza, broccoli) apare "-". 71 din 200 de alimente au "Bucata".
- Reparat: unele alimente (ardei gras, linte, ulei de masline) afisau "o lingura" ca "bucata".

## 2.23.1
- Info > Masuri: tabel cu o singura linie de antet (Lingura, Lingurita, Cana, Bucata, toate in grame) in loc de masurile repetate la fiecare aliment.

## 2.23.0
- Grup nou in bara de sus: **Info** (Retete / Planific / Info / Setari), cu doua pagini.
- Info > Ingrediente: 200 de alimente comune cu valori nutritionale la 100 g: calorii, proteine, carbohidrati, grasimi; la atingere se deschid fibre, zaharuri, grasimi saturate, colesterol, 8 minerale si 11 vitamine. Cautare, filtre pe grupe (legume, fructe, carne, peste, oua si lactate, cereale si paste, leguminoase, nuci si seminte, grasimi, condimente, dulciuri si altele), sortare (inclusiv proteine la 100 kcal) si un camp "Pentru N g" care rescaleaza toate valorile.
- Info > Masuri: cat cantareste in grame o lingura, o lingurita, o cana sau o bucata din fiecare aliment.
- Sursa datelor: USDA National Nutrient Database for Standard Reference, versiunea 28 (domeniu public), in fisierul nou nutri.js. Alimentele sunt in starea indicata (crud, fiert etc.); unele sunt aproximari (telemea = feta, cascaval = cheddar).

## 2.22.4
- Retete cu pasi fara timp si fara aparat (de ex. o salata): nu mai apar "min 0", eticheta "manual", butoanele Cronologie / Pe aparat si durata totala. Apare doar lista numerotata a pasilor. Retetele cu timpi sau aparate raman neschimbate.

## 2.22.3
- Setari > Categorii alimente: partea folosita des, alegerea categoriei fiecarui aliment, e acum prima si mereu vizibila. Gestionarea categoriilor (adauga, redenumeste, sterge, marcaje) e pliata sub "Gestioneaza categoriile"; butonul "Schimba categoriile" din Debara o deschide direct.

## 2.22.2
- Lista de cumparaturi: produsele adaugate inainte de 2.22.0 care au o singura sursa primesc automat evidenta pe retete, deci "Scoate" le reduce corect si pe ele. Cele cu mai multe surse (amestecate de atunci) raman cum sunt, fiindca nu se pot imparti exact.
- Mesajul "Nu pot contacta Anthropic" explica acum cauzele probabile (previzualizare sau extensie care blocheaza).

## 2.22.1
- Ingredientele se afiseaza unitar cu prima litera mare ("2 l Lapte") in Cumparaturi, Debara, retete si modul de gatit. Doar afisare: datele salvate si cautarea nu se schimba.
- Debara: numarul de produse a trecut sub titlu; explicatiile actiunilor (am terminat, editeaza / scoate) si marcajele sunt pe randuri separate; textul explicativ e impartit pe puncte, mai usor de citit.

## 2.22.0
- Lista de cumparaturi: vedere noua "Pe retete" (comutator langa "Pe produse"). Fiecare reteta apare cu ingredientele ei si butonul "Scoate", care elimina doar partea ei din lista (ceapa 3 -> 2 daca reteta scoasa avea 1). Poti da Anuleaza timp de 8 secunde.
- Meniu: eticheta "in lista" a devenit buton; apasat, scoate intrarea din cumparaturi si o poate adauga din nou.
- Lista retine acum cantitatea per reteta. Produsele adaugate inainte de aceasta versiune nu au evidenta: se sterg doar daca reteta e singura lor sursa, altfel raman neatinse.

## 2.21.0
- Meniu: dupa "Cumparaturi" (azi si maine, saptamana sau o zi) mergi direct in lista de cumparaturi, cu un banner de rezumat si butonul "Inapoi la meniu".
- Idei: textul de la "Aparate pentru adaptare" nu mai pomeneste aparate fixe; spune ca se folosesc aparatele active din Setari, cu link catre Setari > Aparate.

## 2.20.3
- Carti: campul "Numele cartii" nu mai sta deasupra alegerii fisierului (parea o cautare). Apare in previzualizarea de dinainte de import, dupa ce alegi fisierul, precompletat cu numele din fisier ("Numele cartii (poti schimba)"); daca fisierul are mai multe carti, ramane gol si se folosesc numele din fisier.
- "Copia de siguranta" se numeste acum "Backup aplicatie si retete" (butoane "Descarca backup", "Trimite backup", "Restaureaza dintr-un backup"; mesaje, stari si fisierul descarcat "retete-backup-DATA.json" la fel). Restaurarea accepta in continuare si fisierele vechi "retete-copie-...".
- Cand o pagina din Setari are doua carduri (Carti si date), fiecare isi pastreaza titlul.

## 2.20.2
- Setari: lista are acum titlu propriu ("Utilizare" + "Cum gatesti si cum planifici"), in locul golului de sub butoanele de sus; la intoarcere din detaliu pagina nu mai pare incompleta, iar titlul sta in acelasi loc ca titlul detaliului.

## 2.20.1
- Setari: zona de tranzitie la detaliu curatata - nu mai apare "Setari" de doua ori. Sus ramane o singura cale ("‹ Toate setarile") si titlul paginii, iar titlul dublat din card dispare pe telefon.
- Acorduri corecte in stari ("1 categorie", "1 aliment").

## 2.20.0
- Setari: pagina de pornire este o lista cu stare sub fiecare titlu (de ex. "6 active · 3 backup"). Apesi pe un rand si se deschide detaliul, cu "‹ Setari" pentru intoarcere. Pe ecran lat (peste 900px) lista ramane in stanga, iar detaliul apare in dreapta.
- Utilizarea e in fata: Aparate, Preferinte alimente (acum separat), Categorii alimente, Etichete retete, Mese.
- Partea tehnica e pliata intr-un rand discret "Tehnic: cheie AI, carti si date, despre": AI si cheie (fostul "Cont"), Carti si date (importul de carti + copia de siguranta, unite), Despre (versiune si istoric modificari).
- Randul Tehnic arata "in ordine" si se aprinde doar cand e nevoie: "cheie lipsa" sau copie de siguranta veche (peste 14 zile; inainte 30) / inexistenta.
- Cand o actiune AI cere cheia si lipseste, mesajul are butonul "Seteaza cheia" care duce direct la campul cheii.
- Setari se deschide mereu la lista (nu mai memoreaza ultima sectiune).

## 2.19.0
- Meniu > "Adauga in meniu": trei filtre - Colectia mea (salvate + scrise de tine), Favorite (favoritele din carti) si Biblioteca (alegi o carte si vezi retetele ei). Cautarea lucreaza in sursa aleasa; fara filtru cauta peste tot. Lista ramane goala pana scrii sau alegi o sursa.
- Etichetele urmeaza sursa: "Colectia mea (generata)", "Scrisa de tine", "Favorita - <carte>", "Din <carte>".
- Macro in Meniu: mesajul "macro exista doar la retetele din carti" a disparut. Pentru retetele fara macro apare butonul "Estimeaza macro cu AI (N)" pe fiecare zi; valorile estimate se pastreaza in meniu, apar cu "estimat" si sunt numarate separat in total (retetele din carti raman neatinse).

## 2.18.1
- Meniu > "Adauga in meniu": lista nu mai arata retete cat timp campul de cautare e gol; apare doar "Arata Colectia mea" (la cerere), care listeaza retetele salvate, favoritele din carti si cele scrise de tine (inainte erau doar primele 10 salvate).
- Etichete clare in dialog: "Colectia mea (generata)", "Scrisa de tine", "Din <carte>".

## 2.18.0
- Meniu: partea de sus compacta - alegerea Azi si maine / Saptamana, navigarea pe saptamani (titlul intervalului te intoarce la saptamana asta), butonul "Cumparaturi" si un dropdown "Mai multe" (Propune-mi un meniu, Goleste saptamana, tinta zilnica de macro).
- Zilele sunt pliabile: ziua de azi e deschisa, restul pliate; sloturile goale (cu "+ Adauga") apar doar la ziua deschisa, iar retetele adaugate se vad mereu.
- "Cumparaturi pentru ziua asta" este acum o iconita (cos) langa titlul zilei, doar cand ziua are retete.
- Textul explicativ apare doar cand meniul e gol.

## 2.17.4
- Setari > Aparate: randuri compacte (nume + activ/backup/Elimina pe o linie, pe telefon doua linii ordonate); "+ Aparat nou" este pliat si isi deschide campurile doar la apasare; checkbox-ul "doar backup" aliniat cu eticheta.

## 2.17.3
- Debara: editarea nu mai porneste la apasarea numelui. Fiecare rand are acum un buton "..." cu un mic meniu (Editeaza, Scoate din debara), la fel ca "Mai multe" din Cumparaturi. Pe rand raman doar cosul ("am terminat") si "...", deci randul e mai curat. Meniurile se inchid cand apesi in alta parte.

## 2.17.2
- Debara: produsele se pot edita fara stergere si readaugare. Apesi pe nume si poti schimba numele si categoria (Enter salveaza, Esc renunta; se poate anula). Marcajele se pastreaza; daca noul nume exista deja in debara, schimbarea e refuzata cu mesaj. Legenda de sus spune "apasa pe nume: editezi".
- Cumparaturi: butonul "Copiaza lista" se numeste acum "Copy to clipboard"; "Mai multe" e pe acelasi rand cu el si se deschide ca un mic meniu (Sterge bifate, Goleste lista).

## 2.17.1
- Debara: numele se afiseaza si se ordoneaza dupa produsul de baza: "pudra de usturoi" devine "usturoi, pudra" si sta sub "usturoi"; "seminte de susan" devine "susan"; la fel "unt de arahide" -> "arahide, unt", "ulei de masline" -> "masline, ulei" (pudra, ulei, sos, suc, unt, faina, pasta, zeama, lapte, otet, sirop, fulgi, crema, gem, dulceata, ceai, amidon, esenta, bulion, amestec; iar seminte/boabe/frunze/bulbi/fructe/flori se omit). Doar afisarea se schimba: numele salvat ramane, deci potrivirea cu retetele si cu lista nu e afectata. Ordinea alfabetica e acum cu reguli romanesti.
- Cumparaturi, "Copiaza lista": daca browserul nu permite copierea automata, lista apare intr-un camp selectat, gata de copiat, in loc de simplu mesaj de eroare. "Mai multe" se deschide pe rand propriu, cu butoanele aliniate la stanga si pe o singura linie.

## 2.17.0
- Antet: subtitlul de sub titlu a fost scos (se repeta pe fiecare pagina si ocupa 3 randuri pe telefon). Continutul incepe mai sus.
- Cumparaturi, mai compact: campul de produs si "Adauga" sunt pe acelasi rand; raman la vedere "Copiaza lista" (si "Trimite lista", cand telefonul o permite); "Sterge bifate" si "Goleste lista" sunt in "Mai multe" (ambele se pot anula ca inainte). Bifa "Grupeaza pe categorii" a fost scoasa: lista e mereu grupata, ca pana acum la toata lumea cu setarea implicita. Daca o dezactivasesi, lista revine la grupat.
- Biblioteca: filtrele folosite rar (Din debara, Jurnal, Preferinte) sunt intr-un submeniu "Mai multe filtre", care se deschide singur cand unul e activ si apare numarat. Raman la vedere Carte, Categorie, Eticheta, Stare.
- Verificat in audit: "Primii pasi" dispare deja singur cand toti pasii sunt bifati, deci nu a fost nevoie de schimbare.

## 2.16.1
- Biblioteca: filtrul "Carte" are acum si "★ Favorite", deci retetele marcate cu stea se regasesc si din Biblioteca (alaturi de pagina Colectia mea, filtrul Arata -> Favorite). Merge impreuna cu celelalte filtre; lista de categorii si etichete se limiteaza la favorite.

## 2.16.0
- Navigare simplificata: sectiunile "Gatesc" si "Retete" s-au unit intr-o singura sectiune, "Retete", cu trei pagini: Idei (retete generate de AI), Biblioteca (cartile tale) si Colectia mea (ce pastrezi: salvate, favorite, scrise de tine). Sus sunt acum 3 butoane (Retete, Planific, Setari) in loc de 4.
- "Retetele mele" (pagina) s-a redenumit "Colectia mea", ca sa nu se mai confunde cu cartea "Retetele mele" in care se scriu retetele proprii. "Biblioteca mea" a devenit "Biblioteca". Datele nu s-au schimbat.

## 2.15.2
- Debara: butonul text "Am terminat" repetat pe fiecare rand a devenit o icoana de cos de cumparaturi (il pune inapoi in Cumparaturi, cu Anuleaza ca inainte), iar "x" ramane lang a ea, ambele mici si egale. Ce face fiecare e spus o singura data, in legenda de sub numarul de produse, si la hover.

## 2.15.1
- Debara cu icoane: fiecare produs e pe un singur rand (nume, marcaje, "Am terminat", "x"), iar marcajele sunt icoane care se apasa: frunza verde = proaspat, cub de gheata = congelat, frunza galbena = uscat, conserva = conserva, borcan = altceva. Se pot combina; cele nealese sunt estompate. Sub numarul de produse e o legenda cu cele 5 icoane; numele apare si la apasare lunga/hover.
- Marcajele sunt 5, nu 3: "neprocesat" a devenit "proaspat" (se muta automat), iar "uscat" si "altceva" sunt noi. Ce avai marcat ca "neprocesat" apare acum ca "proaspat"; daca era de fapt uscat, il rebifezi.
- Pe ecran lat, categoriile sunt in coloane de cel putin 420 px; pe telefon, numele si butoanele sunt pe un rand, iar icoanele dedesubt.

## 2.15.0
- Setari, taburi separate: Cont si Aparate sunt acum doua taburi; "Categorii si mese" are tabul "Mese"; incarcarea si descarcarea cartilor e in tabul "Carti" (inainte era "Biblioteca", sub Categorii si mese). Ordine: Cont, Aparate, Alimente, Etichete retete, Mese, Carti, Date.
- Mese: fiecare categorie are acum un singur rand (nume cu numarul de retete, iar masa in dreapta), nu doua.
- README actualizat: nu mai descrie aplicatia ca "retete pe doua aparate"; explica sectiunile, unde sta fiecare lucru si regulile de lucru.
- Mesajul de dupa descarcarea unei carti trimite la Setari -> Carti.

## 2.14.4
- Setari mai aerisite: "Alimente si etichete" s-a impartit. Tab nou "Etichete retete" (separat), iar tabul "Alimente" are doar Categorii alimente si Preferinte alimente. Pagina din Alimente a scazut de la ~2770 la ~1590 px.
- Lista lunga cu categoria fiecarui aliment e pliata ("Categoria fiecarui aliment"); se deschide singura cand apesi "Schimba categoriile" din Debara.
- "Etichete alimente" se numeste acum "Categorii alimente" (nu se mai confunda cu etichetele retetelor). Textul "neprocesat / congelat / conserva" nu se mai repeta pe fiecare rand: raman doar bifa "cu marcaje" si o explicatie.

## 2.14.3
- Retetele mele, afisaj mai curat: eticheta si aparatele sunt pe un singur rand de chip-uri (inainte erau doua randuri), iar originea ("Generata de AI", "Scrisa de tine", "Din <carte>") e o linie mica sub titlu. Cardurile si butoanele sunt mai mici, iar cele doua filtre ("Arata" si "Eticheta") stau pe acelasi rand.
- Redundante scoase: etichetele din carti nu se mai afiseaza de doua ori, iar categoria "Retetele mele" nu mai apare ca chip la retetele scrise de tine (originea e deja spusa).

## 2.14.2
- Cumparaturi: selectorul "Muta" de pe fiecare rand a fost eliminat (categoria se alegea in doua locuri). Acum categoria se alege o singura data, in fereastra care apare la "In debara", impreuna cu numele general; alegerea se tine minte si pentru urmatoarele liste. Categoriile se mai pot schimba in Debara si in Setari.

## 2.14.1
- Cumparaturi, afisaj mai compact: un produs ocupa un singur rand (pe ecran lat: nume si reteta in stanga, "Muta", "In debara" si "x" in dreapta). Selectorul de categorie e acum un mic "Muta" care arata doar celelalte categorii (categoria curenta e deja titlul grupului, deci nu se mai repeta). Butoanele sunt mai mici, iar cele doua optiuni de sus (Ascunde din debara, Grupeaza) stau mai aproape de casuta.
- Butonul "Am in debara" se numeste acum "In debara".

## 2.14.0
- Favorite si Salvate sunt acum o singura pagina: "Retetele mele". Un filtru "Arata" are: Toate / Favorite / Generate de AI / Scrise de mine; filtrul pe etichete ramane. Fiecare reteta apare o singura data, cu o linie care spune de unde e (generata de AI, scrisa de tine, din biblioteca).
- In pagina apar: retetele salvate din idei, retetele scrise de tine si retetele din carti marcate favorite. Cele din carti se deschid si se corecteaza pe loc, ca in Biblioteca. Scoasa din favorite, o reteta din carte dispare din lista (ramane in Biblioteca).
- Pagina separata "Favorite" a fost eliminata; datele (stele, salvate) nu s-au schimbat.

## 2.13.0
- Cumparaturi: categoria unui produs se poate schimba direct din lista (lista mica de sub produs, in modul grupat); alegerea se tine minte (aceeasi ca in Debara) si se aplica la urmatoarele liste.
- Incadrari corectate: "unt de arahide", nuci, seminte -> Altele (nu Lactate); oua -> Lactate (nu Altele).
- Casute de bifat mai mari in lista, pentru folosire la magazin.

## 2.12.0
- Setari > Biblioteca: "Categorii si mese". Fiecare categorie din biblioteca ta (cu numarul de retete) are o lista: Automat (cu masa ghicita afisata), Mic dejun, Pranz, Desert sau Nu propune. "Propune-mi un meniu" foloseste alegerile tale, nu doar ghicirea dupa nume. Wrap-urile, sandvisurile si burgerii sunt acum ghicite la Pranz (nu la Mic dejun). Se salveaza si intra in copia de siguranta.

## 2.11.1
- Stergerea unei retete din Salvate si resetarea consumului nu aveau nici confirmare, nici anulare. Acum au "Anuleaza" (8 secunde), ca restul stergerilor usoare.

## 2.11.0
- Setari > Biblioteca: buton "Descarca toate". Un singur fisier JSON cu toate retetele (toate cartile, plus "Retetele mele"), cu corecturile tale. Se reincarca la "Retete din carti" si fiecare carte ramane sub numele ei, inlocuind-o pe cea existenta.

## 2.10.6
- Reparat: contorul "N de verificat" (si butonul "Parcurge retetele de verificat (N)") ramaneau pe valoarea veche cat timp lucrai in editor. Se actualizeaza acum dupa fiecare salvare.
- Coada: banner-ul spune "De verificat: mai sunt N" (numar real), nu "X din N".
- Retetele cu marcaj gol nu mai sunt numarate ca "de verificat" (de aceea numarul de la prima deschidere poate fi mai mic decat inainte).

## 2.10.5
- Editor reteta: optiunile "Salveaza ca verificata" / "Salveaza, raman de verificat" apar doar la retetele cu un motiv real de verificare. Un marcaj gol ("verifica": []) nu mai conteaza ca "de verificat" (si nu mai e numarat in "N de verificat").
- Am scos nota cu "##" de sub campul Ingrediente (ramane exemplul din campul gol).

## 2.10.4
- "Salveaza ca verificata" sterge si textul brut al paginii din carte (nu mai e necesar dupa corectura). Retetele verificate nu mai poarta acest text nici in baza locala, nici in fisierele "Descarca JSON", deci sunt mai mici si fara informatie dublata. Retetele inca nesigure il pastreaza, ca originalul sa nu se piarda.

## 2.10.3
- Corectura retetei: o singura sectiune. Am scos textul paginii din carte din editor si din reteta deschisa (era aceeasi informatie de doua ori). Verifici direct in carte, dupa referinta "Din: <carte>, reteta nr. N" (afisata in editor si in avertismentul retetelor de verificat), si corectezi doar campurile (titlu, portii, ingrediente, pasi, macro). Textul brut ramane in date (se foloseste doar la adaptarea AI a retetelor nesigure).

## 2.10.2
- Editor reteta: eticheta de la Ingrediente e scurta ("Ingrediente (unul pe linie)"); explicatia cu "##" (titlu de grup) a trecut intr-o nota mica sub camp.

## 2.10.1
- Editor reteta: corectura e unitara. Ce corectezi in textul de sus (paginii din carte) se muta singur in campurile de jos (portii, ingrediente, pasi, macro), cu "Revino la ce era". Ce corectezi in campurile de jos se scrie singur in textul de sus. Butonul "Imparte..." a disparut (nu mai e nevoie).
- Textul original din carte se pastreaza si ai "Revino la textul original din carte" dupa salvare.

## 2.10.0
- Reteta deschisa: "Salveaza ca reteta mea" (sub "Mai multe actiuni"). Face o copie in "Retetele mele", cu "(varianta mea)" in titlu si mentiunea "adaptata din <carte>, reteta nr. N", si o deschide in editor. Originalul ramane neatins. Fara AI, deci gratuit. Se poate descarca ca JSON impreuna cu restul retetelor tale.

## 2.9.0
- Setari > Biblioteca: buton "Descarca JSON" la fiecare carte. Primesti un fisier cu retetele cartii, cu corecturile tale (inclusiv cele marcate verificate), in acelasi format in care incarci cartile. Il poti reincarca oricand la "Retete din carti" si inlocuieste cartea cu acelasi nume. Retetele "Retetele mele" se descarca la fel.

## 2.8.3
- Editor reteta: sus apare acum "Din: <carte>, reteta nr. N" (si pagina, daca exista in date), ca sa stii unde sa cauti in carte cand corectezi. Inainte aparea doar in reteta deschisa, jos.

## 2.8.2
- Editor reteta: nu mai corectezi aceleasi randuri de doua ori. "Imparte in portii, ingrediente si pasi" completeaza direct campurile (cu "Revino la ce era"), iar textul paginii din carte se strange singur cand reteta are deja ingrediente.

## 2.8.1
- Editor reteta: la retetele "de verificat", butonul principal e "Salveaza ca verificata"; celalalt e secundar si se numeste "Salveaza, raman de verificat". Butoanele nu se mai rup pe doua randuri.

## 2.8.0
- Pornire inteligenta: daca ai ceva planificat pentru azi, aplicatia se deschide direct pe Meniu (vederea aleasa data trecuta, "Azi si maine" sau "Saptamana"; cu "Am gatit", "Deschide" si cumparaturi), nu pe "Idei". Fara meniu pe azi, se deschide ca pana acum.
- Meniu: textul de ajutor apare doar cand meniul e gol.
- Biblioteca: filtrele sunt pliate sub "Filtre" (cu numarul celor active) pe ecran mic, deci lista de retete apare mult mai sus. Pe ecran larg raman deschise.

## 2.7.0
- Setari simplificat: din 7 sectiuni raman 4. "Cont si aparate", "Alimente si etichete" (etichete alimente, preferinte, etichete retete), "Biblioteca", "Date". Continutul e acelasi, doar grupat.

## 2.6.0
- Biblioteca: buton "Parcurge retetele de verificat (N)". Deschide pe rand fiecare reteta nesigura direct in editor, cu "De verificat: X din N". "Salveaza si marcheaza verificata" trece la urmatoarea; "Sari peste" o lasa pentru mai tarziu; "Opreste" iese din coada.
- Combinat cu textul editabil si "Imparte in portii, ingrediente si pasi" (2.4.0), poti curata retetele nesigure una dupa alta.

## 2.5.0
- Nou: "Propune-mi un meniu" in Meniu. Alegi mesele (mic dejun, pranz, desert) si aplicatia propune retete pentru toate mesele goale din saptamana (de azi inainte), din Biblioteca si din retetele salvate.
- Reguli: retetele cu alimente evitate sunt excluse total; retetele "de verificat", sosurile, muraturile si conservele nu se propun; nu se repeta nimic din meniu sau din propunere. Se prefera retetele cu alimente care iti plac, favoritele, cele bine apreciate, cele cu putine ingrediente lipsa din debara, cele negatite recent, si (daca ai tinta de calorii) cele apropiate de ea.
- Fiecare rand are "Alta varianta" si "x" (scoate). Nimic nu intra in meniu pana nu apesi "Adauga in meniu". Mesele fara nicio reteta potrivita primesc, la cerere, "Genereaza cu AI" (o singura cerere, doar la apasare; reteta respecta preferintele si se salveaza in Salvate). Nu se face niciun apel AI automat.

## 2.4.1
- Cautare in Biblioteca (si la adaugare in meniu): se cauta doar in titlu si in numele ingredientelor, pe inceput de cuvant ("ou" gaseste "oua", nu "sos"). Notele din paranteza si expresii ca "peste noapte" nu mai conteaza, deci "peste" (pestele) nu mai gaseste retete cu "peste noapte".
- Cuvintele uzuale (cu, de, la, sau, fara, in...) sunt ignorate in cautare. Retetele cu cuvantul in titlu apar inaintea celor unde apare doar ca ingredient.

## 2.4.0
- Corecteaza reteta: textul paginii din carte e acum editabil (nu mai e doar de citit). Il corectezi (de ex. randurile rupte) si se salveaza odata cu reteta.
- Buton nou "Imparte in portii, ingrediente si pasi": din text gaseste local (fara AI) portiile, ingredientele (cu titluri de grup "Strat ...:"), pasii si macro-urile, iti arata ce a gasit si completeaza campurile doar dupa ce confirmi. Rezultatul se verifica; formatul cartii cu doua coloane poate amesteca randuri.

## 2.3.1
- Biblioteca: "+ Reteta noua" are acum propriul buton, deasupra cardului de cautare, separat de cautare si filtre.

## 2.3.0
- Editor reteta: buton "Calculeaza macro (AI)". Trimite ingredientele si portiile la model (doar cand apesi, cu cheia ta) si completeaza kcal, proteine, carbohidrati, grasimi per portie. Poti corecta valorile inainte sa salvezi.
- Daca reteta are deja valori, vezi cele de acum si cele calculate si alegi tu. Ingredientele fara cantitate sunt estimate si afisate ca "nesigure".
- Etichete: keto si high-protein se pun automat din valorile calculate; modelul poate sugera si alte etichete (ex. vegan, vegetarian) care se adauga la salvare.

## 2.2.0
- Nou: "+ Reteta noua" in Biblioteca. Scrii singura reteta (titlu, portii, categorie, ingrediente unul pe linie, pasi, macro optional) cu acelasi editor ca "Corecteaza reteta". Se salveaza in cartea "Retetele mele" si functioneaza ca orice reteta din carte: cautare, filtre, debara, meniu, cumparaturi, Mod gatit, jurnal, preferinte. Intra in copia de siguranta.
- Retetele scrise de tine au in editor si butonul "Sterge reteta" (cu confirmare).

## 2.1.1
- Reteta deschisa: zona de butoane era aglomerata. Acum se vad doar "Mod gatit" (buton principal) si "Adauga la meniu"; "Adauga la cumparaturi", "Corecteaza reteta" si "Adapteaza la aparatele mele" sunt sub "Mai multe actiuni".

## 2.1.0
- Nou: Preferinte alimente (Setari > Preferinte). Doua liste: "Imi plac" si "Evit". Scrii un aliment sau mai multe separate cu virgula; potrivirea merge dupa cuvinte ("ciuperci" prinde si "ciuperci champignon").
- Biblioteca: pe retete apare "Contine ce eviti: ..." si "Iti place: ...", iar in reteta deschisa un avertisment. Filtru nou "Preferinte" (fara alimente evitate / cu alimente care imi plac).
- Un aliment nu poate fi in ambele liste. Scoaterea dintr-o lista se poate anula.
- Preferintele intra in copia de siguranta. Ele vor fi baza pentru "Propune-mi un meniu" (2.2.0): alimentele evitate vor fi excluse total.

## 2.0.0
Versiune majora: se schimba locul in care sta biblioteca (structura datelor). Totul se muta singur si verificat; nu trebuie sa faci nimic.
- **Biblioteca in baza de date a browserului (IndexedDB)**, nu in localStorage. Dispare limita de ~5 MB: poti incarca mult mai multe carti (testat cu o biblioteca de ~7 MB). Incarcarea, corectarile, etichetele, stergerea si restaurarea din copie folosesc noul loc.
- **Migrare automata**: la prima deschidere, biblioteca veche din localStorage e copiata in IndexedDB, se verifica ca numarul de retete e identic si abia apoi se scoate din localStorage. Daca ceva nu merge, ramane varianta veche.
- **Rezerva**: daca browserul nu ofera IndexedDB (mod privat, browser foarte vechi), biblioteca ramane in localStorage ca pana acum.
- **Copia de siguranta** include in continuare biblioteca (exportata din IndexedDB), iar restaurarea o scrie mai intai pe ea; daca scrierea esueaza, raman datele de dinainte, neschimbate.
- **Trimite copia**: buton nou in Setari, Date, care deschide partajarea telefonului (Drive, WhatsApp, e-mail) cu fisierul de copie; apare doar cand browserul permite partajarea de fisiere. "Descarca copia" ramane.
- In Setari, Date vezi separat spatiul folosit de setari/liste/meniu (limita ~5 MB) si marimea bibliotecii (fara limita).
- Cand se deschide aplicatia, pentru o fractiune de secunda apare "Se incarca biblioteca..." (citirea din IndexedDB e asincrona).
- Daca datele aplicatiei se sterg (curatarea site-ului), biblioteca ramasa orfana in IndexedDB nu mai apare, ca sa nu existe date vechi "fantoma".
- Teste noi: `tests/test_idb.py`, `tests/test_trimite_copia.py`; testele asteapta acum ca aplicatia sa fie gata dupa fiecare reincarcare.

## 1.21.0
- **Instalare ca aplicatie**: pe telefon (Chrome: "Instaleaza aplicatia" / Safari: Partajeaza, "Adauga pe ecranul principal") apare cu icon propriu, se deschide pe tot ecranul, fara bara browserului. Fisiere noi in repo: `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (le urci langa `index.html`).
- **Merge si fara internet**: aplicatia se salveaza pe dispozitiv (service worker). Cand ai net, primesti mereu ultima versiune; cand nu ai, se deschide din ce a salvat (biblioteca, meniul, lista, mod gatit functioneaza; cererile catre model, evident, nu). Apelurile catre `api.anthropic.com` nu trec prin acest mecanism si nu se salveaza nicaieri. La o versiune noua apare un mesaj sa reincarci pagina.
- **Stocare protejata**: aplicatia cere browserului sa nu-ti stearga datele singur cand ramane fara spatiu. In Setari, Date vezi daca e protejata, cat spatiu folosesc datele si, daca browserul o permite, un buton "Instaleaza aplicatia".
- Nu functioneaza cu `index-un-singur-fisier.html` deschis ca fisier local (service worker-ul cere http/https); merge pe GitHub Pages.
- Test nou: `tests/test_pwa.py` (porneste un server local si verifica cache-ul si deschiderea fara net).

## 1.20.0
- **Primii pasi**: pe pagina Idei apare un card cu 3 pasi (cheia API, cartile de retete, produse in Debara), cu bife pentru ce e facut si buton "Mergi" care te duce unde trebuie. Dispare singur cand toate sunt facute si se poate ascunde cu "Ascunde" (alegerea se tine minte). Util mai ales pe un telefon sau laptop nou.
- Test nou: `tests/test_primii_pasi.py`.

## 1.19.0
- **Jurnal pe reteta**: la orice reteta din biblioteca sau salvata ai un card "Jurnal" cu **stele** (1-5; apesi din nou pe aceeasi stea ca sa o scoti), **"Am gatit azi"** (tine minte datele si numarul de ori; "Anuleaza ultima gatire" daca ai apasat din greseala) si **notite** (ex: "mai putina sare"). Notitele se salveaza singure.
- In liste (Biblioteca, Salvate, Favorite) apare o linie discreta: "★★★★☆ - gatita de 3 ori, ultima data 2 nov 2026".
- **Filtru "Jurnal" in Biblioteca**: Apreciate (4-5 stele), Gatite pana acum, Negatite inca, Negatite sau demult (peste 60 de zile) - ca sa nu gatesti mereu aceleasi retete.
- **In Meniu**: butonul "Am gatit" pe intrarile din ziua de azi sau din zilele trecute; dupa apasare apare "gatit" si se trece in jurnal.
- Retetele generate si nesalvate nu au jurnal; il primesc cand le salvezi. Jurnalul intra in copia de siguranta.
- Reparatie interna: ajutoarele de data si jurnal sunt definite acum la inceputul codului (o ordonare gresita ar fi oprit aplicatia la deschidere; prinsa de testul nou).
- Test nou: `tests/test_jurnal.py`.

## 1.18.0
- **Mod gatit**: buton nou pe orice reteta (din carte, salvata, generata sau adaptata). Se deschide pe tot ecranul: un singur pas, cu font mare, aparatul si parametrii pasului, bara de progres si butoane mari Inapoi / Inainte (merg si sagetile de la tastatura). Ingredientele sunt la un tap distanta. Ultimul pas se incheie cu "Gata, pofta buna!".
- **Cronometre**: pasii cu durata (la retetele generate) au buton "Porneste cronometrul". La retetele din carti durata se citeste din text ("fierbe 20-25 minute" -> 20 min, "o ora" -> 60 min). Poti avea mai multe cronometre deodata; raman active cand treci la alt pas. La final suna, vibreaza (pe telefon) si apare "Gata!". Daca inchizi cu cronometre pornite, aplicatia cere o confirmare.
- **Ecranul ramane aprins** cat timp e deschis modul gatit (acolo unde browserul permite; altfel ecranul se stinge normal).
- Limita: cronometrele merg cat timp aplicatia e deschisa in browser; daca blochezi telefonul, sunetul poate intarzia.
- Test nou: `tests/test_mod_gatit.py`.

## 1.17.0
- **Macro in Meniu**: la retetele din carti (care au kcal si proteine pe portie) apare sub titlu "~500 kcal, 40 g proteine (1 portie)", iar fiecare zi are un total: kcal, proteine, carbohidrati, grasimi. Se aduna cate o portie din fiecare reteta; numarul de portii din meniu ramane pentru cumparaturi, nu pentru macro. Intrarile fara date (retete generate, text liber) sunt semnalate.
- **Tinta zilnica** optionala (calorii, proteine) in sectiunea "Tinta zilnica pentru macro": totalul zilei se arata ca "1850 / 2200 kcal". In vederea pe saptamana apare si media pe zi (doar zilele cu date). Tinta intra in copia de siguranta.
- Daca o reteta dispare din biblioteca, macro-ul ei ramane salvat in meniu.
- Test nou: `tests/test_macro_meniu.py`.

## 1.16.0
- **Ce pot gati din debara**: filtru nou in Biblioteca, "Din debara": *Am tot ce trebuie*, *Lipseste cel mult 1*, *cel mult 2* sau *cel mult 3*. Retetele se ordoneaza dupa cate ingrediente iti lipsesc, iar pe fiecare card apare lista a ce lipseste ("Iti lipsesc (2): ardei, busuioc") sau "Ai tot ce trebuie din debara". Se combina cu celelalte filtre si cu cautarea.
- Potrivirea e putin mai larga decat la Cumparaturi: "cartofi albi" e acoperit de "cartofi", dar "sos de rosii fara zahar" nu e acoperit de "zahar". Sare, piper, ulei, zahar si faina (puse implicit in debara) conteaza ca avute. Retetele fara lista de ingrediente (sau cu doar apa) nu apar in acest filtru. Nu foloseste cheia API.
- Test nou: `tests/test_din_debara.py`. Pe 1434 retete, calculul dureaza ~0,1 s.

## 1.15.0
- **Navigare in doua trepte**: sus, 4 sectiuni - **Gatesc** (Idei, Biblioteca), **Retete** (Favorite, Salvate), **Planific** (Meniu, Cumparaturi, Debara), **Setari**. Sub ele apar doar paginile sectiunii alese, deci pe telefon bara de sus ocupa doua randuri scurte in loc de trei. Sectiunea tine minte ultima pagina deschisa.
- Contorul de cumparaturi apare si pe sectiunea Planific ("Planific (3)"), iar semnul de copie de siguranta veche apare pe Setari.
- Favorite si Salvate raman doua pagini, dar sunt acum in aceeasi sectiune (Favorite = steaua, pe orice reteta din biblioteca sau salvata; Salvate = retetele generate de tine, cu etichete si stergere). Le pot uni intr-o singura lista cu filtru, daca vrei.
- Test nou: `tests/test_navigare.py`; testele existente folosesc un ajutor comun (`tests/_h.py`) pentru navigare.

## 1.14.0
- **Meniu se deschide pe "Azi si maine"**: vezi direct ce ai de gatit, fara sa cauti ziua in saptamana. Doua butoane comuta intre "Azi si maine" si "Saptamana" (alegerea se tine minte). Eticheta "azi" / "maine" pe zile.
- Buton nou: "Cumparaturi pentru azi si maine". Vederea pe saptamana are in continuare navigarea intre saptamani, cumparaturile pe saptamana si golirea saptamanii.
- Daca adaugi ceva intr-o zi din afara intervalului azi/maine, meniul trece singur pe vederea pe saptamana, ca sa vezi ce ai adaugat.
- Test nou: `tests/test_meniu_azi.py`.

## 1.13.0
- **Anuleaza in loc de confirma**: stergerile de zi cu zi se fac imediat, iar jos apare o bara "Anuleaza" timp de 8 secunde. Se aplica la: scoaterea unui produs din lista, "Sterge bifate", "Goleste lista", "Am in debara", scoaterea din Debara, "Am terminat", scoaterea unei intrari din meniu si "Goleste saptamana". Anularea readuce exact starea de dinainte (inclusiv produsul mutat intre lista si debara).
- Raman cu confirmare (sunt actiuni mari sau greu de refacut): stergerea unei carti din biblioteca, a unei etichete si a unui aparat.
- Test nou: `tests/test_anuleaza.py`. Testele de versiune nu mai depind de numarul exact.

## 1.12.0
- **Cumparaturi - adaugare manuala**: camp deasupra listei. Scrii "2 l lapte, paine" (separat cu virgula) si Enter; se aduna cu ce exista deja. Apa nu se adauga nici manual. Sursa apare ca "Adaugat manual".
- **Cumparaturi - grupare pe categorii** (bifa "Grupeaza pe categorii", activa implicit): aceleasi categorii ca in Debara (Legume, Carne, Lactate...), ca sa parcurgi magazinul pe rafturi. Alegerea se pastreaza.
- **Trimite lista**: buton care deschide partajarea telefonului (WhatsApp, mesaje etc.); apare doar daca browserul o ofera. "Copiaza lista" copiaza acum textul grupat pe categorii.
- Test nou: `tests/test_lista_manual.py`.

## 1.11.0
- **Meniu saptamanal** (tab nou "Meniu"): fiecare zi are trei mese - Mic dejun, Pranz, Desert. Navighezi saptamanile cu < si >, "Saptamana asta" te aduce inapoi.
- Adaugi in meniu din trei locuri: butonul "+ Adauga" de la o masa (cauti in retetele salvate/generate si in biblioteca, dupa nume sau ingredient), butonul "Adauga la meniu" din orice reteta din Biblioteca, Favorite, Salvate sau din Idei, si text liber ("resturi", "iesim in oras"). O reteta generata care nu e salvata se salveaza automat cand o pui in meniu. Masa propusa: Desert pentru dulciuri, Mic dejun dimineata, altfel Pranz.
- Fara apeluri AI si fara cost: meniul se face manual, din ce ai deja.
- Cantitatea de portii se poate schimba direct in meniu; cumparaturile se scaleaza la acele portii.
- **Cumparaturi din meniu**: buton pe fiecare zi si buton pentru toata saptamana. Foloseste aceeasi curatare ca lista normala (fara apa, fara titluri, ce ai in Debara se ascunde) si aduna cantitatile cand produsul si unitatea coincid. Intrarile deja adaugate sunt marcate "in lista" si nu se dubleaza; daca apesi din nou cere confirmare. Schimbarea portiilor reactiveaza intrarea.
- Daca o reteta din meniu e stearsa sau cartea e reincarcata, meniul pastreaza titlul si ingredientele, cu un avertisment.
- Meniul intra in copia de siguranta si se restaureaza odata cu restul. Zilele mai vechi de 120 de zile se sterg singure.
- Teste noi: `tests/test_meniu.py`.

## 1.10.2
- Audit: **securitate** - numele categoriilor alimentelor nu mai pot executa cod (XSS) in Debara si Setari; toate valorile afisate trec prin escapare.
- Audit: **performanta** - Debara si lista de cumparaturi folosesc un cache (la 300 produse in lista si 200 in debara: ~480 ms -> ~11 ms).
- Audit: **robustete** - cand memoria browserului e plina, apare un mesaj clar in loc de un esec tacut la salvare.
- Teste noi: `tests/test_audit2.py`.

## 1.10.1
- Apa de la robinet ("apa", "apa rece", "500 ml apa calduta") nu se mai adauga deloc in Cumparaturi; "apa minerala", "apa de cocos" sau "apa de trandafiri" raman. Lista existenta se curata o singura data. "apa" nu mai e in debara implicit.

## 1.10.0
- Setari: doua pagini separate, **Etichete retete** (ca pana acum) si **Etichete alimente** (noua).
- Etichete alimente: categoriile din Debara sunt editabile (adaugi, redenumesti, stergi; "Altele" ramane mereu). Categorie noua implicita: **Lactate** (lapte, iaurt, branza, smantana, unt...). Bifa per categorie pentru marcajele neprocesat/congelat/conserva. Alegerea categoriei fiecarui aliment e pe aceeasi pagina.
- Debara: se afiseaza doar categoriile care au produse.
- Categoriile sunt incluse in copia de siguranta.

## 1.9.1
- Debara: afisaj mai curat (fara selectoare pe fiecare produs); "uscat" a devenit "neprocesat" (datele vechi se convertesc).
- Categoriile alimentelor se gestioneaza in Setari -> Alimente: alegi categoria fiecarui aliment (are prioritate fata de potrivirea automata), poti preincadra alimente noi, cauti si revii la "Automat". Buton "Schimba categoriile" in Debara.
- Categoriile alese raman si in copia de siguranta.

## 1.9.0
- Debara afisata ca grid pe categorii: Condimente, Legume, Carne, Fructe, Cereale, Altele. Categoria se propune automat (dictionar), se poate alege la adaugare si schimba oricand.
- La legume, fructe si cereale: marcaje uscat / congelat / conserva (se pot combina). Nu influenteaza potrivirea cu lista de cumparaturi.
- Editorul "Am in debara" din Cumparaturi propune si categoria.

## 1.8.2
- Cumparaturi: etichetele de tip "Condimente:", "dupa gust:", "Pentru sos:" se taie, iar produsele din ele devin randuri separate (cu cantitate cand exista: "1 ceasca smantana"). "Sare, piper - dupa gust" -> sare, piper. Sub-retetele "Varianta 1/2" se pastreaza.

## 1.8.1
- Produsele de baza (apa, sare, piper, ulei, zahar, faina) intra in Debara; bifa separata "Ascunde produsele de baza" a fost scoasa (o singura bifa: "Ascunde produsele din debara").
- Potrivire stricta: aceleasi cuvinte ca in debara (ulei nu ascunde "ulei de masline").
- Cumparaturi: antetele (VARIANTE DE CARNE, "Pentru sos:") si trimiterile nu mai intra in lista; listele scurte cu virgula ("sare, piper, zeama de lamaie - dupa gust") se despart in produse separate; ingredientele din grupurile de variante nu se cumpara. Lista existenta se curata o singura data.

## 1.8.0
- **Debaraua mea** (tab nou): lista de produse pe care le ai deja sau care se consuma greu, fara cantitati.
- Cumparaturi: a doua bifa "Ascunde produsele din debara" (independenta de "Ascunde produsele de baza"), eticheta "in debara" cand bifa e debifata.
- "Am in debara" pe un produs din lista il muta in debara (cu nume general editabil, ex. galbenusuri fierte -> oua). "Am terminat" in Debara il pune inapoi in Cumparaturi.
- Potrivire locala (fara API): cuvinte + dictionar de legaturi (galbenus/albus/oua -> ou).
- Debaraua e inclusa in copia de siguranta.

## 1.7.x (pana la 1.7.14)
- Adaptarea retetelor din carte la aparate (Thermomix TM6, MC, Ninja), activa doar cu Thermomix sau MC bifat.
- Reguli de scriere mai stricte pentru model, trimise doar pentru aparatele bifate.
- Audit de securitate si robustete (XSS, date corupte, titluri duplicate, rollback la restaurare).
- Corectii de afisaj (minute rotunjite), versiune in footer, sectiune pliata pentru aparate.

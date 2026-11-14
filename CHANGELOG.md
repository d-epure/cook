# Istoric versiuni

Conventie: MAJOR.MINOR.PATCH. MINOR = functie noua; PATCH = reparatie/ajustare; MAJOR = schimbare de fundatie sau de structura a datelor.

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

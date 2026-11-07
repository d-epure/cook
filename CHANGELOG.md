# Istoric versiuni

Conventie: MAJOR.MINOR.PATCH. MINOR = functie noua; PATCH = reparatie/ajustare; MAJOR = schimbare de fundatie sau de structura a datelor.

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

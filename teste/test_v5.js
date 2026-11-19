/* 5.0.0: un singur model de reteta (migrare), Biblioteca cu Ale mele si Cos, Sanda Marin fara ingrediente ascunse, curatenie de date, macro din Info, jurnal de mese. Rulare: node teste/test_v5.js */
const {boot,eq,done,sleep}=require("./_boot.js");
const dk=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
(async()=>{
 console.log("\n## "+'5.0.0: migrare, Biblioteca, curatenie de date');
 await (async()=>{
  const SM=[1,2,3].map(nr=>({sursa:"Sanda Marin - Carte de bucate",nr,titlu:"Reteta veche "+nr,categorie:"Mancaruri",text_brut:"text",ingrediente:[],pasi_carte:["Se fierbe."]}));
  const own={sursa:"Retetele mele",nr:1,titlu:"Gofre (baza)",categorie:"Retetele mele",portii:4,manual:true,ingrediente:[{c:200,u:"g",n:"faina"}],pasi_carte:["Amesteca."]};
  const cos={sursa:"Retetele mele",nr:2,titlu:"In cos",categorie:"Desert",portii:2,manual:true,cos:true,ingrediente:[{c:1,u:"",n:"ou"}],pasi_carte:["a"]};
  const ai={id:"t1oxx2qr",titlu:"Mere caramelizate cu nuca",portii:2,ingrediente:[{nume:"mere",cantitate:400,unitate:"g"},{nume:"nuci",cantitate:40,unitate:"g"}],pasi:[{id:"p1",text:"Taie merele.",aparat:"manual"},{id:"p2",text:"Coace 20 de minute.",aparat:"cuptor",temp:180,durata_min:20}]};
  const ra=JSON.stringify([{id:"cuptor",nume:"Cuptor clasic pe gaz",on:0,backup:1,tmin:120,tmax:250,moduri:"copt"}]);
  const w=await boot({rbook:JSON.stringify([...SM,own,cos]),rs:JSON.stringify([ai]),ra,rfav:JSON.stringify(["salvat|t1oxx2qr"]),rnote:JSON.stringify({"Sanda Marin - Carte de bucate|2":{h:["2026-01-02"]}}),
   rp:JSON.stringify([{n:"fasole rosie, conserva",f:[]},{n:"fasole rosie",f:["uscat"]},{n:"Naut",f:[]}]),
   rfd:JSON.stringify({a:{n:"pastarnac",src:"ai",k:[1,1,1,1]},b:{n:"pastarnac, radacina",src:"ai",k:[1,1,1,1]},c:{n:"rosii deshidratate",src:"ai",k:[1,1,1,1]},d:{n:"Telemea light",src:"ai",k:[1,1,1,1]},e:{n:"cub zahar",src:"manual",k:[1,1,1,1]}})},
   {wait:900,names:["BOOK","getFav","getPan","AP","drawBook","show","smN","bKey","v5Run"],offline:true});
  const T=w.__t,D=w.document,L=w.localStorage;
  const m=T.BOOK.find(r=>r.sid==="t1oxx2qr");
  eq([!!m,m&&m.sursa,m&&m.nr,m&&m.categorie,T.getFav()],[true,"Retetele mele",3,"Deserturi",["Retetele mele|3"]],"reteta AI intra in Biblioteca (nr urmator), categorie comuna, favorita mutata");
  eq([T.BOOK.find(r=>r.titlu==="Gofre (baza)").categorie,T.BOOK.find(r=>r.titlu==="Reteta veche 1").categorie,T.BOOK.find(r=>r.titlu==="Reteta veche 1").capitol],["Deserturi","Fel principal","Mancaruri"],"12 categorii comune; categoria veche ramane capitol");
  const P=T.getPan();eq([P.filter(x=>/fasole/.test(x.n)).length,P.find(x=>x.n==="fasole rosie").f.sort(),!!P.find(x=>x.n==="Naut")],[1,["conserva","uscat"],true],"debara: forma scoasa din nume si unita pe aceeasi linie");
  eq(Object.values(JSON.parse(L.getItem("rfd"))).map(x=>x.n).sort(),["Telemea light","cub zahar"],"alimentele tale care dubleaza Info (estimate de AI) se sterg; restul raman");
  eq(T.AP.find(a=>a.id==="cuptor").on,1,"cuptorul clasic e activ");
  // Sanda Marin fara ingrediente: ascunse, cu exceptia celor folosite
  T.show("carti");T.drawBook();let tx=D.querySelector("#bres").textContent;
  eq([/Reteta veche 1/.test(tx),/Reteta veche 2/.test(tx),T.smN()],[false,true,2],"Sanda Marin fara ingrediente nu apar in lista; cea gatita apare");
  L.setItem("rsmall","1");T.drawBook();eq(/Reteta veche 1/.test(D.querySelector("#bres").textContent),true,"Setari > Carti le poate arata");L.setItem("rsmall","");
  // pilule Ale mele si Cos
  const pill=t=>[...D.querySelectorAll("#bpl .bpill")].find(b=>b.textContent.startsWith(t));
  pill("Ale mele").click();tx=D.querySelector("#bres").textContent;eq([/Gofre/.test(tx),/Mere caramelizate/.test(tx),/Reteta veche/.test(tx)],[true,true,false],"Ale mele: scrise de tine si salvate din AI");
  pill("Ale mele").click();pill("Cos").click();tx=D.querySelector("#bres").textContent;eq([/In cos/.test(tx),!!D.querySelector("#bres [data-crest]"),!!D.querySelector("#bres [data-cdel] svg")],[true,true,true],"Cos: restaureaza sau sterge (cos de gunoi)");
  D.querySelector("#bres [data-crest]").click();await sleep(50);eq([T.BOOK.find(r=>r.titlu==="In cos").cos,pill("Cos").classList.contains("dis")],[undefined,true],"restaurata; Cos (0) e gri");
  eq(await T.v5Run(),0,"a doua rulare nu schimba nimic");
  eq([!!D.querySelector("#v-salvate"),!D.querySelector("#bidei")],[false,false],"fara pagina Colectia mea; Idei cu AI e un buton in Biblioteca");
  w.close()})();

 console.log("\n## "+'5.2.0: meniu cu portii si grame, Meal prep din meniu, jurnal doar de citit');
 await (async()=>{
  const today=dk(new Date()),y=dk(new Date(Date.now()-864e5)),y2=dk(new Date(Date.now()-2*864e5));
  const rec={sursa:"Retetele mele",nr:1,titlu:"Ovaz cu lapte",categorie:"Mic dejun",portii:2,manual:true,ingrediente:[{c:100,u:"g",n:"fulgi de ovaz"},{c:400,u:"ml",n:"lapte"}],pasi_carte:["Fierbe."]};
  const cur={sursa:"Carte",nr:2,titlu:"Curry de naut",categorie:"Fel principal",portii:4,ingrediente:[{c:400,u:"g",n:"naut fiert"},{c:200,u:"g",n:"spanac"}],pasi_carte:["a"]};
  const w=await boot({rbook:JSON.stringify([rec,cur]),rprof:JSON.stringify({s:"f",a:40,h:165,w:60,act:1.6,g:"c",pk:2}),rjs:y2,rcs:y2,
   rmp:JSON.stringify([{id:"l1",s:"b",k:"Carte|2",t:cur.titlu,d:y2,p:2},{id:"l2",s:"b",k:"Carte|2",t:cur.titlu,d:y,p:3}]),
   rjr:JSON.stringify({[y]:{pranz:[{id:"x",t:cur.titlu,s:"b",k:"Carte|2",n:1,g:0,u:[400,20,40,10],lot:"l2"}]}}),
   rmen:JSON.stringify({[y2]:{pranz:[{t:cur.titlu,s:"b",k:"Carte|2",p:1,bp:4,mp:1,e:1}],cina:[{t:cur.titlu,s:"b",k:"Carte|2",p:1,bp:4,mp:1}]},[y]:{pranz:[{t:cur.titlu,s:"b",k:"Carte|2",p:1,bp:4,mp:1}],mic:[{t:rec.titlu,s:"b",k:"Retetele mele|1",p:1,bp:2}]},[today]:{mic:[{t:rec.titlu,s:"b",k:"Retetele mele|1",p:1,bp:2}]}})},
   {wait:900,names:["BOOK","show","drawJr","drawMenu","getMP","getMen","menQ","menIngs","dayMac","getNote","openBook","menOpen","mpAlloc","mpLeft"],offline:true});
  const T=w.__t,D=w.document,L=w.localStorage;
  // migrare
  eq([L.getItem("rjr"),T.getMP().find(x=>x.id==="l2").p,T.getMen()[y2].pranz[0].e],[null,4,undefined],"migrare: lista de mese din jurnal dispare, portia scazuta din lot revine, marcajul 'mancat' dispare");
  // Meal prep din meniu
  T.show("meniu");T.drawMenu();
  eq([!!T.getMP().find(x=>x.id==="l1"),T.mpLeft(T.getMP().find(x=>x.id==="l2"))],[false,3],"lotul consumat de mese din zile trecute dispare singur (terminat); celalalt are 4 - 1 = 3 portii");
  eq((T.getNote("Retetele mele|1").h||[]).includes(y),true,"reteta din meniul de ieri (fara Meal prep) conteaza gatita ieri");
  eq([!!D.querySelector("#mw [data-mgat]"),!!D.querySelector("#mw .mday.today")],[false,true],"fara Am mancat in meniu");
  // portii
  const before=T.menQ(T.getMen()[today].mic[0])[0];D.querySelector("#mw .mday.today [data-mpp='0.5']").click();
  const en=T.getMen()[today].mic[0];eq([en.p,Math.round(T.menQ(en)[0])===Math.round(before*1.5),T.menIngs(en)[0].c],[1.5,true,75],"portiile: 1,5 portii inmultesc macro si cantitatile de cumparat");
  // aliment din Info in meniu
  T.menOpen({day:today,slot:"pranz"});const dl=D.querySelector("#mdlg"),f=dl.querySelector("#jrf");eq(!!f,true,"dialogul meniului are Aliment din Info (pe grame)");
  f.value="banana";f.dispatchEvent(new w.Event("input",{bubbles:true}));dl.querySelector("[data-jrfp]").click();const q=dl.querySelector("#mdbq");q.value="150";dl.querySelector("[data-mdbadd]").click();
  let b=(T.getMen()[today].pranz||[])[0];eq([b&&b.s,b&&b.q,b&&Array.isArray(b.x),b&&b.m[0]>100],["x",150,true,true],"alimentul intra in meniu pe grame, cu macro si micronutrienti");
  T.drawMenu();const gi=D.querySelector("#mw [data-mq]");gi.value="300";gi.dispatchEvent(new w.Event("change",{bubbles:true}));b=T.getMen()[today].pranz[0];eq([b.q,Math.round(b.m[0])],[300,Math.round(gi?b.m[0]:0)],"gramele se schimba din meniu");
  // jurnal
  T.show("jurnal");T.drawJr();const jw=D.querySelector("#jw"),tx=jw.textContent;
  eq([/Macro:/.test(tx),jw.querySelectorAll("[data-jgo]").length,/Media pe zi/.test(tx),!!jw.querySelector("[data-jadd]"),!!jw.querySelector("[data-jdel]")],[true,7,true,false,false],"jurnal: macro de azi, 7 zile, media; fara adaugare sau stergere de mese");
  const ta=jw.querySelector("#jnote");ta.value="antrenament seara";ta.dispatchEvent(new w.Event("change",{bubbles:true}));eq(JSON.parse(L.getItem("rjn"))[today],"antrenament seara","observatiile zilei se salveaza separat");
  jw.querySelector(`[data-jgo="${y}"]`).click();eq(D.querySelector("#v-meniu").classList.contains("hidden"),false,"atingerea unei zile deschide Meniul");
  T.show("carti");T.openBook(0,2,"#bres");eq(!!D.querySelector("#bres [data-jeat]"),false,"reteta nu mai are Am mancat");
  w.close()})();
 console.log("\n## "+'5.0.1: propunerea de meniu');
 await (async()=>{
  const today=dk(new Date()),mk=(nr,t,c)=>({sursa:"Carte",nr,titlu:t,categorie:c,portii:2,ingrediente:[{c:200,u:"g",n:"orez"},{c:100,u:"g",n:"piept de pui"}],pasi_carte:["a"]});
  const B=[mk(1,"Curry de naut",'Fel principal'),mk(2,"Pui cu orez","Fel principal"),mk(3,"Tocana de pui","Fel principal"),mk(4,"Aluat de unt si smantana","Deserturi"),mk(5,"Prajitura cu mere","Deserturi")];
  const w=await boot({rbook:JSON.stringify(B),rmp:JSON.stringify([{id:"l1",s:"b",k:"Carte|1",t:"Curry de naut",d:today,p:4}]),rpf:JSON.stringify({l:["paste"],e:[]})},{wait:900,names:["pxBuild","pxSlot","recPref","BOOK"],offline:true});const T=w.__t;
  const res=T.pxBuild(["pranz","cina"]),mp=res.rows.filter(r=>r&&r.mp);
  eq([mp.length>0,mp.every(r=>r.cand.length>1)],[true,true],"masa din Meal prep are si alte variante (Alta varianta nu mai e gri)");
  eq([T.pxSlot(T.BOOK[3]),T.pxSlot(T.BOOK[4])],[null,"desert"],"aluatul (o baza) nu intra in propunere; prajitura da");
  eq([T.recPref({titlu:"Tartine cu pasta de ton",ingrediente:[{n:"ton"}]}).lk,T.recPref({titlu:"Paste cu sos",ingrediente:[{n:"paste"}]}).lk],[[],["paste"]],"'pasta de ton' nu inseamna paste");
  w.close()})();
 console.log("\n## "+'5.1.3: zi stransa, condimente');
 await (async()=>{
  const today=dk(new Date()),rec={sursa:"Carte",nr:1,titlu:"Supa",categorie:"Supe si ciorbe",portii:2,ingrediente:[{c:1,u:"",n:"piper"}],pasi_carte:["a"]};
  const w=await boot({rbook:JSON.stringify([rec]),rp:JSON.stringify([{n:"Piper",f:["uscat"]},{n:"Pastarnac",f:["congelat"]}]),rmen:JSON.stringify({[today]:{pranz:[{t:"Supa",s:"b",k:"Carte|1",p:1,bp:2}]}})},
   {wait:900,names:["show","drawMenu","inPantry"],offline:true});const T=w.__t,D=w.document;
  T.show("meniu");T.drawMenu();const c=D.querySelector("#mw .mday.today");
  eq(!!c.querySelector(".me"),true,"ziua deschisa arata mesele");c.querySelector("[data-mtog]").click();
  const c2=D.querySelector("#mw .mday.today");eq([!!c2.querySelector(".me"),!!c2.querySelector(".ms"),!!c2.querySelector(".mmac")],[false,false,false],"ziua stransa arata doar titlul");
  eq([T.inPantry("piper"),T.inPantry("piper macinat"),T.inPantry("pastarnac")],[true,true,false],"piperul uscat din debara acopera 'piper'; pastarnacul congelat nu acopera pastarnac proaspat");
  w.close()})();
 console.log("\n## "+'5.1.5: acelasi produs la cumparaturi');
 await (async()=>{
  const w=await boot({rp:"[]",rl:JSON.stringify([{n:"Piept de pui fiert (sau pulpa slaba de vita / curcan)",c:250,u:"g",src:["Salata de boeuf light"],done:false}])},{wait:600,names:["addList","getList","drawList"],offline:true});const T=w.__t;
  T.addList([{n:"Piept de pui",c:150,u:"g"},{n:"cartofi fierti",c:300,u:"g"},{n:"Castraveti murati (in otet)",c:150,u:"g"}],"Pui cu ciuperci");T.drawList();
  const L=T.getList().map(x=>[x.n,x.c]);
  eq([L.filter(x=>/piept/i.test(x[0])),L.some(x=>x[0]==="cartofi"),L.some(x=>/murati/.test(x[0]))],[[["Piept de pui",400]],true,true],"'Piept de pui fiert (sau ...)' si 'Piept de pui' sunt o singura linie; starea de gatire si alternativele dispar din nume");
  w.close()})();
 console.log("\n## "+'5.1.6: muraturi la borcan');
 await (async()=>{
  const w=await boot({rp:JSON.stringify([{n:"Castraveti murati",f:["conserva"]},{n:"Castraveti",f:["proaspat"]}])},{wait:700,names:["inPantry","pOther","getPan","formSplit"],offline:true});const T=w.__t;
  eq([T.getPan().find(x=>x.n==="Castraveti murati").f,T.inPantry("Castraveti murati (in otet)"),T.pOther("Castraveti murati (in otet)"),T.inPantry("castraveti")],[["altceva"],true,[],true],"muraturile din debara au marcajul borcan; 'Castraveti murati (in otet)' e in debara, fara avertizare; castravetii proaspeti raman separati");
  eq([...T.formSplit("ardei murati").f],["altceva"],"o muratura noua primeste marcajul borcan");
  w.close()})();
 console.log("\n## "+'5.2.1: masura scrisa in nume');
 await (async()=>{
  const w=await boot({rp:"[]",rl:JSON.stringify([{k:"pahar smantan|",n:"pahar smantana",u:"",c:0.5,src:["Placinta cu gris"],done:0}])},{wait:600,names:["addList","getList","drawList","show"],offline:true});const T=w.__t;
  T.show("lista");T.drawList();T.addList([{c:1,u:"",n:"pahar de lapte"},{c:2,u:"",n:"linguri zahar"}],"X");T.drawList();
  eq(T.getList().map(x=>[x.n,x.c,x.u]),[["smantana",0.5,"pahar"],["lapte",1,"pahar"],["zahar",2,"linguri"]],"'pahar', 'linguri' din nume trec la masura, si pe liniile deja in lista");
  w.close()})();
 console.log("\n## "+'5.3.0: Gatire cu cautare si 7 grupe');
 await (async()=>{
  const w=await boot({},{wait:500,names:["show"],offline:true});const T=w.__t,D=w.document,G=w.NUTRI.G;
  T.show("gatire");const ch=[...D.querySelectorAll("#gch [data-gg]")];
  eq([G.length,ch.length,D.querySelectorAll("#gres details").length],[7,7,0],"la deschidere: cautarea si 7 grupe, fara lista lunga");
  ch[1].click();eq(D.querySelectorAll("#gres details").length,G[1][1].length,"o grupa arata doar temele ei");
  const q=D.querySelector("#gq");q.value="congelator";q.dispatchEvent(new w.Event("input",{bubbles:true}));
  eq([D.querySelectorAll("#gres details[open]").length>0,!!D.querySelector("#gres mark")],[true,true],"cautarea arata temele potrivite, deschise, cu cuvantul evidentiat");
  const all=G.flatMap(g=>g[1].flatMap(t=>t[1])).join("\n");
  eq([/Carne tocata \(vita, porc, pui\): 71/.test(all),/45-90 de minute/.test(all),(all.match(/Dezgheata in frigider/g)||[]).length,/Se tine 5 zile la frigider sau 3 luni/.test(all)],[false,false,1,false],"fara neconcordante: tocatura de pasare 74, un singur timp pentru naut, o singura regula de dezghetare, 3-4 zile la frigider");
  w.close()})();
 done()})();

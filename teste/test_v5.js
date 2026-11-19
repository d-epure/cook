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

 console.log("\n## "+'5.0.0: jurnal de mese');
 await (async()=>{
  const today=dk(new Date());
  const rec={sursa:"Retetele mele",nr:1,titlu:"Ovaz cu lapte",categorie:"Mic dejun",portii:2,manual:true,ingrediente:[{c:100,u:"g",n:"fulgi de ovaz"},{c:400,u:"ml",n:"lapte"}],pasi_carte:["Fierbe."],macro:{kcal:999,proteine:1,carbo:1,grasimi:1}};
  const w=await boot({rbook:JSON.stringify([rec]),rprof:JSON.stringify({s:"f",a:40,h:165,w:60,act:1.6,g:"c",pk:2}),
   rmp:JSON.stringify([{id:"l1",s:"b",k:"Retetele mele|1",t:rec.titlu,d:today,p:2}]),
   rmen:JSON.stringify({[today]:{mic:[{t:rec.titlu,s:"b",k:"Retetele mele|1",p:1,bp:2,mp:1}]}})},
   {wait:900,names:["BOOK","show","drawJr","getJr","getMP","jrOpen","menMac","mkEntry","drawMenu","getNote","openBook"],offline:true});
  const T=w.__t,D=w.document;
  const mm=T.menMac(T.mkEntry("b",T.BOOK[0],1));eq([mm[0]<999,mm[0]>200],[true,true],"macro: calculul din Info are prioritate fata de valoarea din carte");
  T.show("meniu");T.drawMenu();eq(/difera mult/.test(D.querySelector("#mw").textContent),false,"meniul nu mai arata avertizarea 'difera mult'");
  let j=T.getJr()[today]||{};eq([(j.mic||[]).length,j.mic&&j.mic[0].lot,T.getMP()[0].p,!!D.querySelector("#mw [data-mgat]")],[1,"l1",1,false],"5.1.0: masa de azi din meniu intra singura in jurnal; o portie scade din lotul de Meal prep");
  eq([!!D.querySelector("#mw .me.mdn"),/Micronutrienti/.test(D.querySelector("#mw").textContent)],[true,false],"masa apare Facut; Meniul nu mai are micronutrienti");
  // sters din jurnal: in meniu devine nemancat, portia revine in lot; Am mancat o pune la loc
  T.show("jurnal");{const b=D.querySelector("#jw [data-jdel][data-js=mic]");b.click();b.click()}
  eq([((T.getJr()[today]||{}).mic||[]).length,T.getMP()[0].p],[0,2],"sters din jurnal: portia revine in lot");
  T.show("meniu");eq(!!D.querySelector("#mw [data-mgat]"),true,"in meniu masa e nemancata, cu Am mancat; nu revine singura in jurnal");
  D.querySelector("#mw [data-mgat]").click();eq([((T.getJr()[today]||{}).mic||[]).length,T.getMP()[0].p],[1,1],"Am mancat o pune la loc");
  // scoasa din meniu: iese si din jurnal
  {const b=D.querySelector("#mw [data-mdel]");b.click();eq([((T.getJr()[today]||{}).mic||[]).length,T.getMP()[0].p],[0,2],"scoasa din meniu: iese si din jurnal, portia revine")}
  T.jrOpen({r:T.BOOK[0],s:"b",slot:"mic"});D.querySelector("#mdlg [data-jrok]").click();
  T.show("jurnal");T.drawJr();
  T.show("jurnal");let jw=D.querySelector("#jw");eq([/Ovaz cu lapte/.test(jw.textContent),/kcal/.test(jw.textContent),jw.querySelectorAll(".mbar").length>=4],[true,true,true],"jurnal: intrarea, kcal si barele fata de tinte");
  jw.querySelector("[data-jp='0.5']").click();eq(T.getJr()[today].mic[0].n,1.5,"portiile se schimba cu + / -");
  // aliment din Info pe grame
  jw.querySelector("[data-jadd=gustari]").click();const dl=D.querySelector("#mdlg");eq([/Am mancat/.test(dl.textContent),!!dl.querySelector("#jrf"),dl.querySelector("#mdslot").value],[true,true,"gustari"],"dialogul jurnalului: reteta, aliment din Info, cod de bare, text");
  const f=dl.querySelector("#jrf");f.value="banana";f.dispatchEvent(new w.Event("input",{bubbles:true}));const pick=dl.querySelector("[data-jrfp]");eq(!!pick,true,"cautarea in Info gaseste banana");
  pick.click();const q=dl.querySelector("#mdbq");q.value="150";dl.querySelector("[data-mdbadd]").click();
  j=T.getJr()[today];const g=j.gustari&&j.gustari[0];eq([!!g,g&&g.g,g&&g.n,g&&g.u&&g.u[0]>50&&g.u[0]<150],[true,1,150,true],"aliment pe grame, cu valorile la 100 g");
  {const tx=D.querySelector("#jw").textContent;eq([/Micronutrienti/.test(tx),!!g.x&&g.x.length===27],[true,true],"jurnal: micronutrientii zilei, si pentru alimentele din Info")}
  jw=D.querySelector("#jw");const qi=jw.querySelector("[data-jq]");qi.value="200";qi.dispatchEvent(new w.Event("change",{bubbles:true}));eq(T.getJr()[today].gustari[0].n,200,"gramele se pot schimba");
  // stergere cu confirmare
  const del=D.querySelector("#jw [data-js=gustari] ~ [data-jdel], #jw [data-jdel][data-js=gustari]");del.click();eq(T.getJr()[today].gustari.length,1,"primul tap pe cosul de gunoi cere Confirma");del.click();eq(!!(T.getJr()[today]||{}).gustari,false,"al doilea sterge");
  // din reteta: Am mancat
  T.show("carti");T.openBook(0,2,"#bres");eq([!!D.querySelector("#bres [data-jeat]"),/Am gatit azi/.test(D.querySelector("#bres").textContent)],[true,false],"reteta are Am mancat in loc de Am gatit azi");
  D.querySelector("#bres [data-jeat]").click();D.querySelector("#mdlg [data-mdslot], #mdslot").value="cina";D.querySelector("#mdslot").dispatchEvent(new w.Event("change",{bubbles:true}));D.querySelector("#mdlg [data-jrok]").click();
  eq(((T.getJr()[today]||{}).cina||[]).length,1,"Am mancat din reteta scrie in jurnal la masa aleasa");
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
 done()})();

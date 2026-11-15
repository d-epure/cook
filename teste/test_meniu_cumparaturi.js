/* Meniu, cumparaturi, debara si categorii. Rulare: node teste/test_meniu_cumparaturi.js (sau node teste/toate.js pentru toate) */
const {boot,eq,done,sleep,item,supa,pan,dir,fs}=require("./_boot.js");
(async()=>{
 console.log("\n## "+'Cumparaturi si debara (3.20.0), masa Cina (3.21.0), id stabil pe retetele salvate (4.0.0).');
await (async()=>{
 const names=["lkey","lClean","inPantry","addList","getList","putList","inCartAny","mpOpen","mpForm","mpSave","getSaved","drawList","sidRun","sidNeed","menRec","mpRec","getMen","getMP","isFav","sKey","getNote","getMT","drawMenu","show","SLOTS","pxAuto"];
 const day=new Date();const dk=day.getFullYear()+"-"+String(day.getMonth()+1).padStart(2,"0")+"-"+String(day.getDate()).padStart(2,"0");
 let w=await boot({rp:pan,rl:"[]",rs:JSON.stringify([supa,{titlu:"Mere coapte",portii:2,ingrediente:[],pasi:[]}]),rfav:JSON.stringify(["salvat|Supa crema de rosii","Retetele mele|1"]),
  rnote:JSON.stringify({"salvat|Mere coapte":{h:["2026-01-05"]}}),rmp:JSON.stringify([{id:"m1",s:"s",k:"salvat|Mere coapte",t:"Mere coapte",d:"2026-01-05",p:2}]),
  rmen:JSON.stringify({[dk]:{cina:[{t:"Supa crema de rosii",s:"s",k:"salvat|Supa crema de rosii",p:1,bp:2}],pranz:[{t:"Stearsa",s:"b",k:"Carte veche|9",p:1,bp:1,i:[{c:1,u:"",n:"ou"}]}]}}),
  rprof:JSON.stringify({s:"f",a:40,h:165,w:60,act:1.6,g:"c",pk:2}),rmt:JSON.stringify({k:0,p:999})},{names,offline:true});
 let T=w.__t,L=w.localStorage,D=w.document;
 // --- produse scrise diferit = acelasi produs
 eq(T.lkey("de usturoi","catei"),T.lkey("usturoi","catei"),"de usturoi = usturoi");
 eq(T.lkey("catei usturoi",""),T.lkey("usturoi","catei"),"catei usturoi = usturoi, catei");
 eq(T.lkey("ceapa tocata marunt","g"),T.lkey("ceapa","g"),"ceapa tocata marunt = ceapa");
 eq(T.lkey("cartofi, taiati cuburi","g"),T.lkey("cartofi","g"),"cartofi, taiati cuburi = cartofi");
 eq(T.lkey("carne tocata","g")!==T.lkey("carne","g"),true,"carnea tocata ramane carne tocata");
 eq(T.lkey("ulei","g")!==T.lkey("ulei de masline","g"),true,"ulei nu e ulei de masline");
 eq(T.lClean("Sare si piper, dupa gust","").n,"Sare si piper","dupa gust dispare din nume");
 for(const x of ["cartofi, taiati cuburi","piept de pui taiat cubulete","3 catei de usturoi","ceapa tocata marunt"])eq(T.inPantry(x),true,"in debara: "+x);
 for(const x of ["somon","cartofi dulci","ulei de cocos"])eq(T.inPantry(x),false,"nu e in debara: "+x);
 T.addList([{c:1,u:"kg",n:"carne de vaca"},{c:2,u:"l",n:"lapte de migdale"},{c:3,u:"",n:"catei usturoi"}],"A");T.addList([{c:500,u:"g",n:"carne de vaca"},{c:4,u:"catei",n:"de usturoi"}],"B");
 let l=T.getList();eq([l.find(x=>/vaca/.test(x.n)).c,l.find(x=>/usturoi/.test(x.n)).c,l.find(x=>/lapte/.test(x.n)).u],[1500,7,"ml"],"kg + g, usturoi 3 + 4, l in ml");
 // --- id stabil (migrarea ruleaza singura la pornire)
 eq([T.sidNeed(),T.getSaved().every(r=>!!r.id)],[false,true],"la pornire, retetele salvate primesc id");
 const sv=T.getSaved(),s1=sv.find(r=>r.titlu==="Supa crema de rosii"),s2=sv.find(r=>r.titlu==="Mere coapte");
 eq([T.isFav(T.sKey(s1)),JSON.parse(L.getItem("rfav")).includes("Retetele mele|1"),JSON.parse(L.getItem("rfav")).includes("salvat|Supa crema de rosii")],[true,true,false],"favorite mutate pe id; cele din carti neatinse");
 eq((T.getNote(T.sKey(s2)).h||[]).length,1,"jurnal mutat pe id");eq(!!T.mpRec(T.getMP()[0]),true,"lotul de Meal prep gaseste reteta");eq(!!T.menRec(T.getMen()[dk].cina[0]),true,"masa din meniu gaseste reteta");
 {const a=T.getSaved();a.find(r=>r.id===s1.id).titlu="Supa mea de rosii";L.setItem("rs",JSON.stringify(a))}
 eq([!!T.menRec(T.getMen()[dk].cina[0]),T.isFav(T.sKey(T.getSaved().find(r=>r.id===s1.id)))],[true,true],"dupa redenumire, meniul si favorita raman legate");
 eq(T.sidRun(),0,"a doua rulare nu schimba nimic");
 eq(T.getMT().p,120,"tinta de proteine = g pe kg x greutate (rmt ignorat)");
 // --- Meal prep: produsele ascunse (din debara) nu blocheaza
 const r=T.getSaved().find(x=>x.id===s1.id);T.putList([item("rosii","g",500,r.titlu)]);
 eq(T.inCartAny(r.titlu),false,"produs ascuns nu inseamna 'deja in cumparaturi'");
 T.mpOpen();T.mpForm("s",r);const dl=D.querySelector("#mdlg");eq(!!dl.querySelector("#mpc"),true,"bifa de cumparaturi apare");eq(/le ai deja in debara/.test(dl.textContent),true,"spune cate sunt in debara");
 const inp=dl.querySelector("#mpp");inp.value="40";inp.dispatchEvent(new w.Event("input",{bubbles:true}));eq(dl.querySelector("#mpw").hidden,false,"avertisment la 40 de portii");
 inp.value="4";inp.dispatchEvent(new w.Event("input",{bubbles:true}));T.mpSave();eq(T.getList().find(x=>x.n==="rosii").c,1000,"cantitati pentru 4 portii, fara dublare");
 // --- Cina si reteta stearsa
 eq(T.SLOTS.map(x=>x[0]),["mic","pranz","cina","desert"],"patru mese pe zi");
 T.show("meniu");T.drawMenu();const tx=D.querySelector("#mw").textContent;eq([/Cina/.test(tx),/Reteta nu mai e in Biblioteca/.test(tx)],[true,true],"Cina apare; reteta stearsa e marcata");
 eq(T.pxAuto({categorie:"Supe crema",titlu:"Crema de varza cu somon"}),"pranz","supa crema nu e desert");
 })();
 console.log("\n## "+'4.3.0: categorii implicite, Leguminoase, tema noua in Gatire, WhatsApp.');
await (async()=>{
 const names=["CATS","FCAT","guessCat","catOf","show","drawGat","drawList","putList","getPan","addPan"];
 let w=await boot({},{names,offline:true}),T=w.__t,D=w.document;
 eq([T.CATS.map(c=>c[0]),T.FCAT],[["condimente","legume","carne","fructe","cereale","leguminoase","lactate","altele"],["legume","carne","fructe","leguminoase"]],"implicit: Carne si Leguminoase cu marcaje, Cereale fara");
 eq(["fasole alba","linte rosie","Naut","fasole verde","orez","arpacas","piept de pui","mazare"].map(T.guessCat),["leguminoase","leguminoase","leguminoase","legume","cereale","cereale","carne","legume"],"incadrare automata: leguminoasele au categoria lor, fasolea verde ramane leguma");
 T.addPan("piept de pui");T.addPan("naut");T.addPan("orez");const P=T.getPan();eq([P.find(x=>x.n==="piept de pui").cat,P.find(x=>x.n==="naut").cat,P.find(x=>x.n==="orez").cat],["carne","leguminoase","cereale"],"produsele din debara ajung in categoria potrivita");
 T.show("gatire");const g=D.querySelector("#gl").textContent;eq([/Leguminoase si cereale uscate/.test(g),/cel putin 10 minute/.test(g),/Inmuiere/.test(g)],[true,true,true],"tema noua din Gatire, cu regula de siguranta pentru fasole");
 T.putList([item("hrisca","g",100)]);T.show("lista");T.drawList();let url="";w.open=u=>{url=u};
 eq([!!D.querySelector("#lWa"),!!D.querySelector("#lSh")],[true,false],"fara meniul de trimitere al telefonului apare butonul WhatsApp");
 D.querySelector("#lWa").click();eq([url.startsWith("https://wa.me/?text="),/Hrisca/.test(decodeURIComponent(url))],[true,true],"butonul deschide WhatsApp cu lista");
 // utilizator cu categorii salvate: primeste doar categoria noua, bifele raman
 const old=[{id:"condimente",n:"Condimente",f:0},{id:"legume",n:"Legume",f:1},{id:"carne",n:"Carne",f:0},{id:"cereale",n:"Cereale",f:1},{id:"altele",n:"Altele",f:0}];
 w=await boot({rcg:JSON.stringify(old)},{names,offline:true});T=w.__t;
 eq([T.CATS.map(c=>c[0]),T.FCAT],[["condimente","legume","carne","cereale","leguminoase","altele"],["legume","cereale","leguminoase"]],"categorii salvate: apare Leguminoase inaintea lui Altele, restul neschimbat");
 w=await boot({rcg:JSON.stringify(old),rcgv:"1"},{names,offline:true});eq(w.__t.CATS.some(c=>c[0]==="leguminoase"),false,"daca o stergi, categoria nu revine");
 })();
 console.log("\n## "+'4.7.0: marcajele din debara (proaspat, congelat, uscat, conserva) legate de lista de cumparaturi.');
await (async()=>{
 const pan=JSON.stringify([{n:"rosii",f:["proaspat","conserva"]},{n:"mazare",f:["congelat"]},{n:"ceapa",f:[]},{n:"Rosii deshidratate bio",f:[]},{n:"naut",f:["uscat"]},{n:"orez",f:[]},{n:"piept de pui",f:["congelat"]}]);
 const w=await boot({rp:pan,rcg:JSON.stringify([{id:"legume",n:"Legume",f:1},{id:"carne",n:"Carne",f:1},{id:"leguminoase",n:"Leguminoase",f:1},{id:"cereale",n:"Cereale",f:0},{id:"altele",n:"Altele",f:0}]),rcgv:"1"},{names:["inPantry","covered","putList","drawList","show","getPan","formSplit"],offline:true}),T=w.__t,D=w.document;
 const P=n=>T.inPantry(n);
 eq([P("rosii"),P("rosii conserva"),P("rosii in suc propriu"),P("rosii proaspete"),P("rosii uscate"),P("rosii deshidratate")],[true,true,true,true,false,false],"rosii cu proaspat si conserva bifate: doar cele uscate raman de cumparat (exemplul din cerinta)");
 eq([P("mazare"),P("mazare congelata"),P("mazare conserva"),P("mazare uscata")],[true,true,false,false],"mazare congelata: forma ceruta trebuie sa fie bifata");
 eq([P("ceapa"),P("ceapa uscata"),P("ceapa congelata")],[true,true,true],"produs fara niciun marcaj bifat: acopera orice forma");
 eq([P("orez"),P("naut uscat"),P("naut conserva"),P("naut")],[true,true,false,true],"categorie fara marcaje si leguminoase cu marcaj");
 eq([P("piept de pui congelat"),P("piept de pui"),P("piept de pui proaspat")],[true,true,false],"carne: congelat bifat, proaspat nu");
 eq([T.getPan().filter(x=>x.n==="rosii").length,T.getPan().find(x=>x.n==="rosii").f],[1,["proaspat","conserva"]],"produsul ramane pe o singura linie in debara");
 eq([T.covered("rosii uscate"),T.covered("rosii cherry"),T.covered("mazare conserva")],[false,true,false],"si filtrul 'Am tot in debara' din Biblioteca tine cont de forma");
 T.putList([item("rosii","g",300),item("rosii uscate","g",40),item("mazare congelata","g",200),item("mazare conserva","g",200)]);T.show("lista");T.drawList();const tx=D.querySelector("#ll").textContent;
 eq([/Rosii uscate/.test(tx),/Mazare conserva/.test(tx),/300 g Rosii/.test(tx),/Mazare congelata/.test(tx),/2 ascunse/.test(tx)],[true,true,false,false,true],"in Cumparaturi raman vizibile doar formele pe care nu le ai");
 })();
 console.log("\n## "+'4.7.1: fara dubluri in meniu la aceeasi masa; lista de cumparaturi curata (orfani, mesaj cand nu mai e nimic de cumparat).');
await (async()=>{
 const day=new Date(),dk=day.getFullYear()+"-"+String(day.getMonth()+1).padStart(2,"0")+"-"+String(day.getDate()).padStart(2,"0");
 const ZI=["duminica","luni","marti","miercuri","joi","vineri","sambata"][day.getDay()];
 const en=(t,k,L)=>({t,s:"b",k,p:1,bp:4,mp:1,L:L?1:0,i:[{c:100,u:"g",n:"orez"}]});
 const t1="Creveti cu orez si legume",t2="Miso soup";
 const menSeed={[dk]:{pranz:[en(t1,"Retete cu carne|50",true),en(t1,"Retete cu carne|50"),en(t2,"Retetele mele|4")],cina:[en(t1,"Retete cu carne|50")]}};
 const lst=[item("creveti","g",500,t1+" (meniu "+ZI+")"),item("orez","g",250,t1+" (meniu "+ZI+")"),
  {k:"",n:"cartofi",u:"g",c:300,src:["Salata veche (meniu luni)"],parts:[{s:"Salata veche (meniu luni)",c:300}],done:0},
  {k:"",n:"ardei",u:"g",c:100,src:["Salata veche (meniu luni)","Chili vechi (meniu marti)"],parts:[{s:"Salata veche (meniu luni)",c:50},{s:"Chili vechi (meniu marti)",c:50}],done:1},
  item("lapte","l",1,"Adaugat manual")];
 lst.forEach(x=>{x.k=x.k||""});
 const w=await boot({rmen:JSON.stringify(menSeed),rl:JSON.stringify(lst),rp:"[]"},{names:["getMen","getList","putList","putMen","menAdd","show","drawList","removeSrc","lOrphan","MD=undefined"].filter(x=>!/=/.test(x)),offline:true}),T=w.__t,D=w.document;
 // 1 dublurile vechi se aduna la pornire, pranz si cina raman separate
 const m=T.getMen()[dk];
 eq([m.pranz.filter(e=>e.k==="Retete cu carne|50").length,m.pranz.length,m.cina.length],[1,2,1],"aceeasi reteta la aceeasi masa apare o singura data; la cina ramane");
 // 2 lista: produsele mesei scoase din meniu pleaca (si cele bifate), restul ramane
 const l=T.getList(),nm=l.map(x=>x.n).sort();
 eq(nm,["creveti","lapte","orez"].sort(),"orfanii (cartofi, ardei bifat) au plecat; produsele mesei din meniu si cele manuale raman");
 T.putList([{...item("orez","g",50,"X (meniu luni)")}]);const o=T.lOrphan();eq([o,T.getList().length],[["Orez"],0],"lOrphan intoarce numele produselor scoase");
 // 3 scoaterea unei retete scoate si produsele bifate
 T.putList([{...item("ou","g",100,"R1"),done:1},{...item("unt","g",50,"R1"),done:0},item("sare","g",5,"R2")]);
 T.removeSrc("R1");eq(T.getList().map(x=>x.n),["sare"],"removeSrc scoate si produsele bifate ale retetei");
 // 4 nimic de cumparat: mesaj verde, fara comutator si fara butoane
 T.putList([{...item("sare","g",5,"R2"),done:1}]);T.show("lista");let tx=D.querySelector("#ll").textContent;
 eq([/Nu mai ai nimic de cumparat/.test(tx),!!D.querySelector("#lHp"),!!D.querySelector("#lCp"),!!D.querySelector("#lAll")],[true,false,false,true],"tot bifat: mesaj, fara comutator, doar Goleste lista");
 T.putList([]);T.drawList();eq([!!D.querySelector("#lHp"),!!D.querySelector("#lAll"),!!D.querySelector("#lAddI")],[false,false,true],"lista goala: doar campul de adaugare");
 T.putList([item("sare","g",5,"R2"),item("somon","g",300,"R2")]);T.drawList();
 eq([!!D.querySelector("#lHp"),!!D.querySelector("#lCp"),/Nu mai ai nimic/.test(D.querySelector("#ll").textContent)],[true,true,false],"cu ceva de cumparat: comutatorul si butoanele apar");
 })();
 console.log("\n## "+"4.9.2: dupa refresh, Meniul nu mai arata 'Reteta nu mai e in Biblioteca' cat timp biblioteca se incarca.");
await (async()=>{
 const t=new Date(),z=t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0");
 const men={[z]:{pranz:[{t:"Reteta care nu exista nicaieri",s:"b",k:"Alta carte|99",p:1,i:{l:[{n:"ou",c:1,u:""}],p:1}}]}};
 const w=await boot({rmen:JSON.stringify(men)},{wait:800,names:["set LR(v){LIBREADY=v}","drawMenu"]}),d=w.document,T=w.__t;
 T.LR=false;T.drawMenu();
 eq(/nu mai e in Biblioteca/.test(d.querySelector("#v-meniu").innerHTML),false,"cat timp biblioteca se incarca: fara avertisment");
 T.LR=true;T.drawMenu();
 eq(/nu mai e in Biblioteca/.test(d.querySelector("#v-meniu").innerHTML),true,"dupa incarcare, avertismentul real ramane");
 })();
 done()})();

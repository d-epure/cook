/* Meniu, cumparaturi, debara si categorii. Rulare: node teste/test_meniu_cumparaturi.js (sau node teste/toate.js pentru toate) */
const {boot,eq,done,sleep,item,supa,pan,dir,fs}=require("./_boot.js");
(async()=>{
 console.log("\n## "+'Cumparaturi si debara (3.20.0), masa Cina (3.21.0), id stabil pe retetele salvate (4.0.0).');
await (async()=>{
 const names=["lkey","lClean","inPantry","addList","getList","putList","inCartAny","mpOpen","mpForm","mpSave","getSaved","drawList","sidRun","sidNeed","menRec","menOpen","mpRec","getMen","getMP","isFav","sKey","getNote","getMT","drawMenu","show","SLOTS","pxAuto","putMP","getPan"];
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
 T.mpOpen();T.mpForm("s",r);const dl=D.querySelector("#mdlg");eq([!!dl.querySelector("[data-mpok=p]"),!!dl.querySelector("[data-mpok=g]"),!!dl.querySelector("#mpc")],[true,true,false],"doua butoane distincte, fara bifa/intrebare");eq(/le ai deja in debara/.test(dl.textContent),true,"spune cate sunt in debara");
 const inp=dl.querySelector("#mpp");inp.value="40";inp.dispatchEvent(new w.Event("input",{bubbles:true}));eq(dl.querySelector("#mpw").hidden,false,"avertisment la 40 de portii");
 inp.value="4";inp.dispatchEvent(new w.Event("input",{bubbles:true}));T.mpSave("p");eq(T.getList().find(x=>x.n==="rosii").c,1000,"cantitati pentru 4 portii, fara dublare");
 // --- 4.13.0: Meal prep planificat -> Am gatit
 {const lot=T.getMP().find(x=>x.t===r.titlu&&x.st==="p");eq([!!lot,lot&&lot.d],[true,""],"adaugat la Meal prep = planificat, fara data de gatire");
 const jb=(T.getNote(T.sKey(r)).h||[]).length;
 // un ingredient comun cu alta sursa (bifat) trebuie sa ramana
 const l0=T.getList();const ro=l0.find(x=>x.n==="rosii");ro.src.push("Alta reteta");ro.parts.push({s:"Alta reteta",c:300});ro.c+=300;ro.done=1;T.putList(l0);
 T.show("meniu");T.drawMenu();const bt=D.querySelector("[data-mpcook=\""+lot.id+"\"]");eq([!!bt,!!D.querySelector("[data-mpdel=\""+lot.id+"\"] svg"),!!D.querySelector("[data-mpdone=\""+lot.id+"\"]")],[true,true,false],"lot planificat: Am gatit + cos de gunoi, fara Terminat");
 {const mw=D.querySelector("#mw");eq([!!mw.querySelector("button.lnk[data-mpopen]"),/Deschide|gatesc/.test(mw.textContent)],[true,false],"4.14.0: numele retetei e link; fara Deschide si gatesc");}
 bt.click();
 const l1=T.getList(),rr=l1.find(x=>x.n==="rosii");eq([rr&&rr.c,rr&&rr.src,rr&&rr.done],[300,["Alta reteta"],1],"Am gatit scoate doar partea retetei; ingredientul comun ramane (bifa neatinsa)");
 const lg=T.getMP().find(x=>x.id===lot.id);eq([lg.st,lg.d!==""],[undefined,true],"lotul devine gatit, cu data");
 eq((T.getNote(T.sKey(r)).h||[]).length,jb+1,"Am gatit scrie in jurnal o data");
 D.querySelector("[data-mpdone=\""+lot.id+"\"]").click();}
 // Am gatit deja: lista neatinsa, jurnal scris
 {const nb=T.getList().length,r2=r;T.mpOpen();T.mpForm("s",r2);D.querySelector("#mpp").value="2";const jb=(T.getNote(T.sKey(r2)).h||[]).length;T.mpSave("g");
 const lt=T.getMP().find(x=>x.t===r2.titlu);eq([T.getList().length,lt&&lt.st,lt&&lt.d!==""],[nb,undefined,true],"Am gatit deja: gatit direct, lista neatinsa");eq((T.getNote(T.sKey(r2)).h||[]).length,jb+1,"Am gatit deja: jurnal scris");T.putMP([]);}
 // randuri din Debara: doar bifa, bifat = inapoi in debara
 {T.putList([item("lapte","ml",null,"Debara")]);T.show("lista");T.drawList();eq([!!D.querySelector("[data-lp]"),!!D.querySelector("[data-ld]")],[false,true],"rand din Debara: doar bifa, fara Am in debara");
 D.querySelector("[data-ld]").click();eq([T.getList().length,T.getList()[0].done,T.getPan().some(x=>/lapte/i.test(x.n))],[1,1,true],"bifat = cumparat: intra in debara, dar randul ramane (bifat) pana golesti lista");
 eq(/Nu mai ai nimic de cumparat/.test(D.querySelector("#ll").textContent)&&/lapte/i.test(D.querySelector("#ll").textContent),true,"mesajul 'nimic de cumparat' nu ascunde produsele bifate");
 D.querySelector("[data-ld]").click();eq([T.getList()[0].done,T.getPan().some(x=>/lapte/i.test(x.n))],[0,false],"debifat: iese din debara (doar daca bifarea l-a adus)");
 D.querySelector("[data-ld]").click();D.querySelector("#lDn").click();eq(T.getList().length,0,"Sterge bifate scoate randurile bifate");}
 {const x=item("zzzpulpe","g",400,"Reteta A");x.done=1;const y=item("zzzdovlecei","g",250,"Reteta A");y.done=1;T.putList([x,y]);T.show("lista");T.drawList();const tx=D.querySelector("#ll").textContent;eq([/Nu mai ai nimic de cumparat/.test(tx),/Zzzpulpe/i.test(tx),/Zzzdovlecei/i.test(tx)],[true,true,true],"toate bifate: produsele raman la vedere, nu dispar");T.putList([]);}
 // 4.15.0: Adauga la meniu cu bifa de cumparaturi; butoane AI gri fara cheie
 {T.putMP([]);T.putList([]);T.menOpen({s:"s",r,p:2,day:"2099-01-02"});const dl=D.querySelector("#mdlg");eq([!!dl.querySelector("#mdl"),/cumparaturi/i.test(dl.textContent)],[false,false],"Adauga la meniu: fara bifa de cumparaturi (4.21.1)");
 dl.querySelector("[data-mdok]").click();eq([T.getList().length,Object.values(T.getMen()).flatMap(d=>Object.values(d).flat()).filter(e=>e.k===T.sKey(r)).some(e=>e.L)],[0,false],"Adauga la meniu nu atinge lista");
 D.body.classList.add("nokey");let tt="";const bi=D.createElement("button");bi.dataset.ai="1";let hit=0;bi.addEventListener("click",()=>hit++);D.body.appendChild(bi);bi.click();eq(hit,0,"fara cheie: butonul AI gri nu porneste nimic");D.body.classList.remove("nokey");bi.remove();}
 // 4.16.0: "Ascunde produsele din debara" se pastreaza
 {T.putList([item("zzzprodus","g",500,"Test")]);T.show("lista");T.drawList();const cb=D.querySelector("#lHp");cb.checked=false;cb.dispatchEvent(new w.Event("change",{bubbles:true}));eq(w.localStorage.getItem("rhp"),"0","starea Ascunde e salvata");const c2=D.querySelector("#lHp");c2.checked=true;c2.dispatchEvent(new w.Event("change",{bubbles:true}));eq(w.localStorage.getItem("rhp"),"1","si cand e bifata la loc");}
 // 4.16.1: in meniu intra o singura portie, fara camp de portii
 {const es=Object.values(T.getMen()).flatMap(d=>Object.values(d).flat()).filter(e=>e.k===T.sKey(r));eq([es.length>0,es.every(e=>e.p===1)],[true,true],"in meniu intra 1 portie, indiferent de portiile retetei");T.show("meniu");T.drawMenu();eq(!!D.querySelector("#mw input[type=number]"),false,"meniul nu arata numarul de portii");}
 // 4.17.0: zona de sus din Meniu = un singur rand cu iconite
 {T.show("meniu");T.drawMenu();const mw=D.querySelector("#mw"),top=mw.querySelector(".mtop");eq([!!top,!!top&&top.querySelectorAll("button.ico").length>=2,!!mw.querySelector("details.lmore"),/Mai multe/.test(mw.textContent.split("Micronutrienti")[0])],[true,true,false,false],"un rand: segment + cos + Propune; fara Mai multe");
 eq(!!top.querySelector("[data-mshop]")&&!!top.querySelector("[data-mprop]"),true,"cos si Propune-mi un meniu sunt in randul de sus");}
 // 4.18.0: Meal prep in doua zone; din Meal prep se alege doar ce e gatit; marcarea meselor abia la gatit
 {T.putMP([]);T.putList([]);const ents=()=>Object.entries(T.getMen()).filter(([d])=>d.startsWith("2099")).flatMap(([d,v])=>Object.values(v).flat()).filter(e=>e.k===T.sKey(r));
 T.show("lista");T.menOpen({s:"s",r,day:"2099-01-03"});D.querySelector("[data-mdok]").click();
 T.mpOpen();T.mpForm("s",r);T.mpSave("p");
 eq(ents().some(e=>e.mp),false,"planificat: mesele din meniu nu devin 'din Meal prep'");
 T.show("meniu");T.drawMenu();let mw=D.querySelector("#mw").textContent;eq([/Planificat \(1\)/.test(mw),/Gatit \(/.test(mw)],[true,false],"doar zona Planificat cand nu e nimic gatit");
 T.menOpen({day:"2099-01-04"});{const c=D.querySelector("#mdlg [data-mdf=m]");if(!c.classList.contains("on"))c.click()}eq(D.querySelector("#mdres").textContent.includes(r.titlu),false,"in alegerea din Meal prep nu apare ce e doar planificat");T.menClose&&0;D.querySelector("[data-mdx]").click();
 const lot=T.getMP()[0];D.querySelector("[data-mpcook=\""+lot.id+"\"]").click();
 eq(ents().some(e=>e.mp),true,"dupa Am gatit, mesa din meniu devine 'din Meal prep'");
 T.show("meniu");T.drawMenu();mw=D.querySelector("#mw").textContent;eq([/Gatit \(1\)/.test(mw),/Planificat \(/.test(mw)],[true,false],"dupa gatit: doar zona Gatit");
 T.menOpen({day:"2099-01-04"});{const c=D.querySelector("#mdlg [data-mdf=m]");if(!c.classList.contains("on"))c.click()}eq(D.querySelector("#mdres").textContent.includes(r.titlu),true,"lotul gatit se poate alege in meniu");D.querySelector("[data-mdx]").click();
 T.show("lista");T.menOpen({s:"s",r,day:"2099-01-05"});D.querySelector("[data-mdok]").click();const nw=Object.entries(T.getMen()).filter(([d])=>d==="2099-01-05").flatMap(([d,v])=>Object.values(v).flat());eq([nw.length>0,nw.some(e=>e.mp)],[true,false],"din Biblioteca = gatit doar pentru acea masa, nu din Meal prep");T.putMP([]);}
 // --- Cina si reteta stearsa
 eq(T.SLOTS.map(x=>x[0]),["mic","pranz","cina","desert"],"patru mese pe zi");
 T.show("meniu");T.drawMenu();const tx=D.querySelector("#mw").textContent;eq([/Cina/.test(tx),/Reteta nu mai e in Biblioteca/.test(tx)],[true,true],"Cina apare; reteta stearsa e marcata");
 eq(T.pxAuto({categorie:"Supe crema",titlu:"Crema de varza cu somon"}),"pranz","supa crema nu e desert");
 })();
 console.log("\n## "+'4.3.0: categorii implicite, Leguminoase, tema noua in Gatire, WhatsApp.');
await (async()=>{
 const names=["CATS","FCAT","guessCat","catOf","show","drawGat","drawList","putList","getPan","addPan"];
 let w=await boot({},{names,offline:true}),T=w.__t,D=w.document;
 eq([T.CATS.map(c=>c[0]),T.FCAT],[["condimente","legume","carne","fructe","cereale","leguminoase","lactate","altele"],["condimente","legume","carne","fructe","leguminoase"]],"implicit: Condimente (de la 4.22.0), Carne si Leguminoase cu marcaje, Cereale fara");
 eq(["fasole alba","linte rosie","Naut","fasole verde","orez","arpacas","piept de pui","mazare"].map(T.guessCat),["leguminoase","leguminoase","leguminoase","legume","cereale","cereale","carne","legume"],"incadrare automata: leguminoasele au categoria lor, fasolea verde ramane leguma");
 T.addPan("piept de pui");T.addPan("naut");T.addPan("orez");const P=T.getPan();eq([P.find(x=>x.n==="piept de pui").cat,P.find(x=>x.n==="naut").cat,P.find(x=>x.n==="orez").cat],["carne","leguminoase","cereale"],"produsele din debara ajung in categoria potrivita");
 T.show("gatire");const g=D.querySelector("#gl").textContent;eq([/Leguminoase si cereale uscate/.test(g),/cel putin 10 minute/.test(g),/Inmuiere/.test(g)],[true,true,true],"tema noua din Gatire, cu regula de siguranta pentru fasole");
 T.putList([item("hrisca","g",100)]);T.show("lista");T.drawList();let url="";w.open=u=>{url=u};
 eq([!!D.querySelector("#lWa"),!!D.querySelector("#lSh")],[true,false],"fara meniul de trimitere al telefonului apare butonul WhatsApp");
 D.querySelector("#lWa").click();eq([url.startsWith("https://wa.me/?text="),/Hrisca/.test(decodeURIComponent(url))],[true,true],"butonul deschide WhatsApp cu lista");
 // utilizator cu categorii salvate: primeste doar categoria noua, bifele raman
 const old=[{id:"condimente",n:"Condimente",f:0},{id:"legume",n:"Legume",f:1},{id:"carne",n:"Carne",f:0},{id:"cereale",n:"Cereale",f:1},{id:"altele",n:"Altele",f:0}];
 w=await boot({rcg:JSON.stringify(old)},{names,offline:true});T=w.__t;
 eq([T.CATS.map(c=>c[0]),T.FCAT],[["condimente","legume","carne","cereale","leguminoase","altele"],["condimente","legume","cereale","leguminoase"]],"categorii salvate: apare Leguminoase inaintea lui Altele; Condimente primeste marcaje o singura data (4.22.0)");
 w=await boot({rcg:JSON.stringify(old),rcgv:"1"},{names,offline:true});eq(w.__t.CATS.some(c=>c[0]==="leguminoase"),false,"daca o stergi, categoria nu revine");
 })();
 console.log("\n## "+'4.7.0: marcajele din debara (proaspat, congelat, uscat, conserva) legate de lista de cumparaturi.');
await (async()=>{
 const pan=JSON.stringify([{n:"rosii",f:["proaspat","conserva"]},{n:"mazare",f:["congelat"]},{n:"ceapa",f:[]},{n:"Rosii deshidratate bio",f:[]},{n:"naut",f:["uscat"]},{n:"orez",f:[]},{n:"piept de pui",f:["congelat"]}]);
 const w=await boot({rp:pan,rcg:JSON.stringify([{id:"legume",n:"Legume",f:1},{id:"carne",n:"Carne",f:1},{id:"leguminoase",n:"Leguminoase",f:1},{id:"cereale",n:"Cereale",f:0},{id:"altele",n:"Altele",f:0}]),rcgv:"1"},{names:["inPantry","covered","putList","drawList","show","getPan","formSplit"],offline:true}),T=w.__t,D=w.document;
 const P=n=>T.inPantry(n);
 eq([P("rosii"),P("rosii conserva"),P("rosii in suc propriu"),P("rosii proaspete"),P("rosii uscate"),P("rosii deshidratate")],[true,true,true,true,false,false],"rosii cu proaspat si conserva bifate: doar cele uscate raman de cumparat (exemplul din cerinta)");
 eq([P("mazare"),P("mazare congelata"),P("mazare conserva"),P("mazare uscata")],[false,true,false,false],"mazare congelata: forma ceruta trebuie sa fie bifata; fara forma inseamna proaspat (4.22.0)");
 eq([P("ceapa"),P("ceapa uscata"),P("ceapa congelata")],[true,true,true],"produs fara niciun marcaj bifat: acopera orice forma");
 eq([P("orez"),P("naut uscat"),P("naut conserva"),P("naut")],[true,true,false,true],"categorie fara marcaje si leguminoase cu marcaj");
 eq([P("piept de pui congelat"),P("piept de pui"),P("piept de pui proaspat")],[true,false,false],"carne: doar congelat bifat; reteta fara forma cere proaspat, deci nu e acoperita (4.22.0)");
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
 eq([/Nu mai ai nimic de cumparat/.test(tx),!!D.querySelector("#lHp"),!!D.querySelector("#lCp"),!!D.querySelector("#lAll"),!!D.querySelector("#lDn")],[true,false,false,false,true],"tot bifat: mesaj, fara comutator, doar Sterge bifate (nu exista Goleste lista)");
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
 console.log("\n## 4.11.0: titluri de sectiune scrise ca ingrediente (Foi, Umplutura) nu sunt produse");
 await (async()=>{
  const w=await boot({},{wait:800,names:["prepIngs","ingHtml","isSec"]}),T=w.__t;
  const r={ingrediente:[{c:null,u:"",n:"Foi"},{c:300,u:"g",n:"faina"},{c:null,u:"",n:"Umplutura"},{c:200,u:"g",n:"nuci"},{c:null,u:"",n:"Pentru crema"},{c:1,u:"",n:"ou"}]};
  eq(T.prepIngs(r.ingrediente).map(x=>x.n),["faina","nuci","ou"],"titlurile de sectiune nu intra in cumparaturi / Din debara");
  const h=T.ingHtml(r,1);eq([(h.match(/class="gh"/g)||[]).length,/<li>Foi<\/li>/.test(h)],[3,false],"in reteta apar ca subtitluri, nu ca ingrediente");
  eq(T.prepIngs([{c:null,u:"",n:"Foi"}]).map(x=>x.n),["Foi"],"o singura linie (adaugata manual) ramane produs");
  eq(T.prepIngs([{c:1,u:"pachet",n:"foi"},{c:2,u:"",n:"oua"}]).map(x=>x.n),["foi","oua"],"'foi' cu cantitate ramane ingredient");
  eq(T.prepIngs([{c:null,u:"",n:"sos de soia"},{c:2,u:"",n:"oua"}]).map(x=>x.n),["sos de soia","oua"],"'sos de soia' nu e confundat cu un titlu");
 })();
 await (async()=>{
  const l=[{k:"foi|",n:"Foi",u:"",c:null,src:["Prajitura casnica - cu bulion"],parts:[{s:"Prajitura casnica - cu bulion",c:null}],done:0},{k:"umplutura|",n:"Umplutura",u:"",c:null,src:["Adaugat manual"],parts:[],done:0},{k:"faina|g",n:"faina",u:"g",c:300,src:["Prajitura casnica - cu bulion"],parts:[],done:0}];
  const w=await boot({rl:JSON.stringify(l)},{wait:800});
  eq(JSON.parse(w.localStorage.getItem("rl")).map(x=>x.n),["Umplutura","faina"],"curatare unica: titlurile aduse din retete dispar din lista veche; ce ai adaugat manual ramane");
 })();
 console.log("\n## 4.12.0: titluri de sectiune gestionate din Setari");
 await (async()=>{
  const w=await boot({},{wait:800,names:["prepIngs","getSec"]}),T=w.__t,D=w.document,$=q=>D.querySelector(q);
  const r=[{c:null,u:"",n:"Ornat"},{c:2,u:"",n:"oua"}];
  eq(T.prepIngs(r).map(x=>x.n),["oua"],"'Ornat' e in lista initiala");
  $("#snn").value="Cuvant nou, Alt Cuvant";$("#sAdd").click();
  eq([T.getSec().includes("cuvant nou"),T.getSec().includes("alt cuvant"),JSON.parse(w.localStorage.getItem("rsec")).length],[true,true,16+2],"adaugare mai multe cuvinte odata, fara diacritice/majuscule, salvata");
  eq(T.prepIngs([{c:null,u:"",n:"Cuvant nou"},{c:1,u:"",n:"ou"}]).map(x=>x.n),["ou"],"cuvantul nou se aplica imediat");
  eq(T.prepIngs([{c:null,u:"",n:"Pentru cuvant nou"},{c:1,u:"",n:"ou"}]).map(x=>x.n),["ou"],"'Pentru' + cuvant din lista merge singur");
  $("#snn").value="ou, cuvant nou";$("#sAdd").click();eq(/Adaugat: ou/.test($("#smsg").textContent),true,"doar ce lipsea se adauga");
  const b=D.querySelector('#scl [data-sx="0"]'),n0=T.getSec().length;
  b.click();eq([b.textContent,T.getSec().length],["Confirma",n0],"stergere: primul tap cere confirmare");
  D.querySelector('#scl [data-sx="0"]').click();eq(T.getSec().length,n0-1,"al doilea tap sterge");
  $("#sReset").click();eq($("#sReset").textContent,"Confirma","revenirea la lista initiala cere aceeasi confirmare");$("#sReset").click();
  eq([T.getSec().length,w.localStorage.getItem("rsec")],[16,null],"lista initiala restabilita");
  const dk=require("fs").readFileSync(require("path").join(__dirname,"..","app.js"),"utf8").match(/const DKEYS=\[[^\]]*\]/)[0];eq(/"rsec"/.test(dk),true,"lista intra in backup si sincronizare");
 })();
 await (async()=>{
  const w=await boot({},{wait:800,names:["renderTagCfg","renderCfg"]}),D=w.document;w.__t.renderTagCfg();w.__t.renderCfg();const b=D.querySelector("#tgl [data-tx]");
  b.click();eq(b.textContent,"Confirma","etichete: aceeasi confirmare 'Confirma'");
  const a=D.querySelector("#apcfg [data-x]");a.click();eq(a.textContent,"Confirma","aparate: aceeasi confirmare 'Confirma'");
  await sleep(4300);eq([/<svg/.test(a.innerHTML),a.dataset.arm],[true,""],"nedecisa, confirmarea expira si butonul isi recapata cosul de gunoi");
 })();
 // --- 4.21.1: meniu planificat/facut, Am gatit scoate partea din lista, lista fara Goleste, categorie dovlecei
 await (async()=>{
  const day=new Date(),dk=day.getFullYear()+"-"+String(day.getMonth()+1).padStart(2,"0")+"-"+String(day.getDate()).padStart(2,"0"),zi=["duminica","luni","marti","miercuri","joi","vineri","sambata"][day.getDay()];
  const w=await boot({rp:"[]",rs:JSON.stringify([supa]),rl:JSON.stringify([item("rosii","g",300,supa.titlu+" (meniu "+zi+")"),item("zzzfaina","g",5,"Alta reteta")]),
   rmen:JSON.stringify({[dk]:{cina:[{t:supa.titlu,s:"s",k:"salvat|"+supa.titlu,p:1,bp:2,L:1}]}})},{wait:800,names:["catOf","getList","getMen","drawMenu","show","drawList","getNote","getSaved","sKey"],offline:true}),T=w.__t,D=w.document;
  T.show("meniu");T.drawMenu();
  eq([!!D.querySelector(".me.mpl"),!!D.querySelector(".me.mdn"),!!D.querySelector("[data-mgat]")],[true,false,true],"meniu: masa neprasita e Planificat (gri), cu butonul Am gatit");
  D.querySelector("[data-mgat]").click();
  eq([!!D.querySelector(".me.mdn"),!!D.querySelector(".me.mpl"),(T.getNote(T.sKey(T.getSaved()[0])).h||[]).includes(dk)],[true,false,true],"dupa Am gatit masa e Facut (verde deschis), in jurnal");
  const L=T.getList(),en=Object.values(T.getMen()).flatMap(d=>Object.values(d).flat())[0];
  eq([L.map(x=>x.n),en.L],[["zzzfaina"],0],"Am gatit scoate din lista doar partea mesei si reseteaza 'in lista'");
  eq([T.catOf("dovlecei"),T.catOf("dovlecel"),T.catOf("dovleac")],["legume","legume","legume"],"dovlecei/dovlecel/dovleac sunt in Legume (cuvinte distincte)");
  T.show("lista");T.drawList();D.querySelector("[data-lv=r]").click();
  const t=D.querySelector("[data-lsr]");t.click();eq([t.textContent,T.getList().length],["Confirma",1],"Pe retete: stergerea grupului cere Confirma, nu sterge la prima atingere");
  t.click();eq(T.getList().length,0,"a doua atingere scoate grupul");
 })();
 // --- 4.22.0: debara unificata (forme pe acelasi rand), condimente cu forme, legenda, atentionare in lista
 await (async()=>{
  const rp=JSON.stringify([{n:"Rosii",f:["proaspat"]},{n:"Rosii deshidratate",f:["uscat"]},{n:"Rosii, conserva",f:["conserva"]},{n:"Usturoi",f:[]},{n:"Usturoi, catei",f:[]},{n:"Usturoi, pudra",f:[]},{n:"Vanilie",f:[]},{n:"Vanilie, esenta",f:[]},{n:"Vanilie, extract",f:[]},{n:"Zahar",f:[]},{n:"Zahar pudra",f:[]},{n:"Naut",f:["uscat"]}]);
  const w=await boot({rp},{wait:900,names:["getPan","inPantry","pOther","addPan","putList","getList","drawList","show","drawPantry","formSplit"],offline:true}),T=w.__t,D=w.document;
  const pn=T.getPan(),F=n=>(pn.find(x=>x.n===n)||{}).f;
  eq(pn.map(x=>x.n).filter(n=>!["faina","piper","sare","ulei"].includes(n)).sort(),["Naut","Rosii","Usturoi","Vanilie","Zahar","Zahar pudra"],"linii unite: Rosii, Usturoi, Vanilie; zahar pudra ramane separat (categorie fara marcaje)");
  eq([F("Rosii").slice().sort(),F("Usturoi").slice().sort(),F("Vanilie").slice().sort()],[["conserva","proaspat","uscat"],["proaspat","uscat"],["altceva","proaspat"]],"marcajele se aduna pe aceeasi linie (catei = proaspat, pudra = uscat, esenta/extract = altceva)");
  eq(/6 randuri unite/.test(D.querySelector("#undot").textContent)&&!D.querySelector("#undo").classList.contains("hidden"),true,"la pornire apare mesajul cu Anuleaza");
  eq([!!w.localStorage.getItem("rpbak4220"),JSON.parse(w.localStorage.getItem("rpbak4220")).length],[true,12],"copie de siguranta a debaralei de dinainte");
  D.querySelector("#undob").click();eq(JSON.parse(w.localStorage.getItem("rp")).length,12,"Anuleaza readuce randurile vechi");
  w.close();
  const w2=await boot({rp},{wait:900,names:["getPan","inPantry","pOther","addPan","putList","getList","drawList","show","drawPantry","formSplit"],offline:true}),T2=w2.__t,D2=w2.document;
  const P=n=>T2.inPantry(n);
  eq([P("rosii"),P("rosii conserva"),P("rosii uscate"),P("rosii congelate")],[true,true,true,false],"rosii: acoperite formele bifate, congelate nu");
  eq([P("usturoi"),P("pudra de usturoi"),P("usturoi catei"),P("vanilie extract"),P("vanilie esenta")],[true,true,true,true,true],"condimente cu forme: catei, pudra, extract, esenta se potrivesc");
  eq(T2.pOther("rosii congelate").slice().sort(),["conserva","proaspat","uscat"],"produsul exista sub alta forma: formele pe care le ai");
  eq([T2.addPan("Rosii congelate"),T2.getPan().filter(x=>/^rosii/i.test(x.n)).length,T2.getPan().find(x=>x.n==="Rosii").f.includes("congelat")],["f",1,true],"adaugare sub alta forma: aceeasi linie, marcaj in plus");
  eq([T2.addPan("Rosii"),T2.addPan("Zahar pudra")],[false,false],"nimic nou: nu dubleaza");
  eq([T2.addPan("Ghimbir pudra"),!!T2.getPan().find(x=>x.n==="Ghimbir")],[true,true],"produs nou cu forma: linie cu numele de baza (Ghimbir, uscat)");
  eq(T2.getPan().find(x=>x.n==="Ghimbir").f,["uscat"],"Ghimbir pudra = uscat");
  T2.show("debara");T2.drawPantry();const pl=D2.querySelector("#pl");
  eq([!!pl.querySelector(".plg .fleg"),!!pl.querySelector("details.pdet"),/altceva \(borcan, esenta\)/.test(pl.textContent)],[true,false,true],"legenda simbolurilor e vizibila, nu pliata");
  w2.close();
  const w3=await boot({rp:JSON.stringify([{n:"Rosii",f:["conserva"]},{n:"Naut",f:["uscat"]}])},{wait:900,names:["inPantry","putList","getList","drawList","show","drawPantry","getPan"],offline:true}),T3=w3.__t,D3=w3.document;
  eq([T3.inPantry("rosii"),T3.inPantry("rosii conserva"),T3.inPantry("naut")],[false,true,true],"reteta fara forma cere proaspat (nu e acoperita de conserva); la leguminoase uscatul e normal");
  T3.putList([item("rosii","g",300,"R")]);T3.show("lista");T3.drawList();
  eq(/Ai in debara, dar ca: conserva/.test(D3.querySelector("#ll").textContent),true,"lista: atentionare 'Ai in debara, dar ca: conserva'");
  T3.show("debara");T3.drawPantry();D3.querySelector('[data-pdone="Rosii"]').click();
  eq(T3.getList().map(x=>x.n).sort(),["Rosii conserva","rosii"],"Am terminat cu o singura forma: in lista apare cu forma (Rosii conserva)");
  w3.close();
 })();
 // --- 4.22.1: din Meniu spre Meal prep; lotul planificat preia cumparaturile mesei
 await (async()=>{
  const key=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"),ZI=["duminica","luni","marti","miercuri","joi","vineri","sambata"];
  const d0=new Date(),d1=new Date(Date.now()+864e5),k0=key(d0),k1=key(d1),t0=supa.titlu+" (meniu "+ZI[d0.getDay()]+")",t1=supa.titlu+" (meniu "+ZI[d1.getDay()]+")";
  const en=()=>({t:supa.titlu,s:"s",k:"salvat|"+supa.titlu,p:1,bp:2,L:1});
  const w=await boot({rp:"[]",rs:JSON.stringify([supa]),rl:JSON.stringify([item("zzzrosii","g",300,t0),item("zzzrosii","g",300,t1),item("zzzaltceva","g",50,"Alta reteta")]),rmen:JSON.stringify({[k0]:{cina:[en()]},[k1]:{cina:[en()]}})},{wait:800,names:["getMP","getList","getMen","drawMenu","show","drawList"],offline:true}),T=w.__t,D=w.document;
  T.show("meniu");T.drawMenu();
  const bt=D.querySelectorAll("[data-mbr]");eq([bt.length,bt[0]&&bt[0].textContent],[1,"2 mese: fa Meal prep"],"meniu: reteta de 2 ori, fara lot: un singur buton '2 mese: fa Meal prep'");
  bt[0].click();const dl=D.querySelector("#mdlg");eq([D.querySelector("#mpp").value,D.querySelector("#mpn").textContent],["2","2"],"formularul Meal prep porneste cu 2 portii");
  dl.querySelector("[data-mpok=p]").click();
  const lot=T.getMP()[0],L=T.getList(),men=Object.values(T.getMen()).flatMap(d=>Object.values(d).flat());
  eq([T.getMP().length,lot.st,lot.p],[1,"p",2],"lot planificat cu 2 portii");
  eq([L.some(x=>x.n==="zzzrosii"),L.some(x=>x.n==="zzzaltceva"),L.every(x=>!x.src.some(y=>/\(meniu /.test(y)))],[false,true,true],"lotul preia cumparaturile: partile (meniu zi) au iesit din lista, restul ramane, nimic cu sursa meniu");
  eq(men.every(e=>!e.L),true,"mesele din meniu nu mai sunt 'in lista'");
  eq([D.querySelectorAll("[data-mbr]").length,D.querySelectorAll("#mw .lb").length>0&&/in Meal prep/.test(D.querySelector("#mw").textContent)],[0,true],"butonul dispare; mesele arata 'in Meal prep'");
  eq([/Idei de meniu/.test(D.querySelector("[data-mprop]").getAttribute("aria-label")),!!D.querySelector("[data-mprop] svg path[fill=\"#f5c542\"]"),/lotul/.test(D.querySelector("#mw").textContent)],[true,true,false],"iconita Idei de meniu e un bec galben; etichetele nu mai spun 'lotul'");
  const nL=T.getList().length;D.querySelector("[data-mshop=z]").click();eq(T.getList().length,nL,"cosul din meniu nu mai adauga ingredientele retetei care are lot (fara dubluri)");
  w.close();
 })();
 // --- 4.23.0: produs dupa cod de bare (Open Food Facts), cantitate in g, macro in meniu
 await (async()=>{
  const day=new Date(),dk=day.getFullYear()+"-"+String(day.getMonth()+1).padStart(2,"0")+"-"+String(day.getDate()).padStart(2,"0");
  const w=await boot({rp:"[]"},{wait:700,names:["menOpen","getMen","drawMenu","show","dayMac","bcParse","bcLookup"],offline:true}),T=w.__t,D=w.document;
  let calls=[],mode="ok";
  w.fetch=async u=>{calls.push(String(u));if(mode==="net")throw new Error("net");if(mode==="nf")return{ok:true,status:200,json:async()=>({status:0})};
   return{ok:true,status:200,json:async()=>({status:1,product:{code:"5941234567890",product_name:"Iaurt grecesc",brands:"Marca, Alta",serving_quantity:"30",nutriments:{"energy-kcal_100g":400,proteins_100g:"10,5",carbohydrates_100g:20,fat_100g:30}}})}};
  eq([T.bcParse("1",{status:1,product:{product_name:"X",nutriments:{"energy_100g":418.4}}}).k[0],T.bcParse("1",{status:0})],[100,null],"kJ fara kcal se converteste; produs inexistent = null");
  T.show("meniu");T.menOpen({day:dk});
  eq(!!D.querySelector("#mdbc")&&!!D.querySelector("[data-mdbs]"),true,"dialogul Adauga la meniu are campul de cod de bare");
  D.querySelector("#mdbc").value="12";D.querySelector("[data-mdbs]").click();await sleep(30);
  eq([/8 pana la 14/.test(D.querySelector("#mdbr").textContent),calls.length],[true,0],"cod prea scurt: mesaj, fara cerere");
  D.querySelector("#mdbc").value="5941234567890";D.querySelector("[data-mdbs]").click();await sleep(50);
  eq([calls.length,/world\.openfoodfacts\.org\/api\/v2\/product\/5941234567890/.test(calls[0]),!!D.querySelector("#bcc"),D.querySelector("#mdbq").value],[1,true,true,"30"],"cautare: cerere catre Open Food Facts, card de produs, cantitate implicita = portia de pe ambalaj");
  eq([/Iaurt grecesc/.test(D.querySelector("#bcc").textContent),/Marca/.test(D.querySelector("#bcc").textContent),/Open Food Facts/.test(D.querySelector("#bcc").textContent),/120 kcal/.test(D.querySelector("#mdbv").textContent)],[true,true,true,true],"cardul arata numele, marca, sursa si macro pentru 30 g");
  const q=D.querySelector("#mdbq");q.value="50";q.dispatchEvent(new w.Event("input",{bubbles:true}));eq(/200 kcal/.test(D.querySelector("#mdbv").textContent)&&/5.3 g proteine|5,3 g proteine/.test(D.querySelector("#mdbv").textContent),true,"macro se recalculeaza live la 50 g (200 kcal, 5.3 g proteine)");
  D.querySelector("[data-mdbadd]").click();
  const es=Object.values(T.getMen()).flatMap(d=>Object.values(d).flat()).filter(e=>e.ean==="5941234567890");
  eq([es.length,es[0]&&es[0].q,es[0]&&es[0].s,es[0]&&es[0].m&&es[0].m[0],T.dayMac(T.getMen()[dk]).s[0]],[1,50,"x",200,200],"produsul intra in meniu cu cantitate si macro, si se aduna in totalul zilei");
  T.drawMenu();eq([/50 g/.test(D.querySelector("#mw").textContent),/dupa cantitatea introdusa/.test(D.querySelector("#mw").textContent),!!D.querySelector("#mw .me.mpl")],[true,true,false],"randul arata cantitatea, nota din macro explica; randul fara reteta nu e gri 'planificat'");
  mode="net";calls=[];T.menOpen({day:dk});D.querySelector("#mdbc").value="5941234567890";D.querySelector("[data-mdbs]").click();await sleep(50);
  eq([calls.length,!!D.querySelector("#bcc")],[0,true],"produs gasit o data: se tine local, merge si fara internet");
  D.querySelector("#mdbc").value="4001234567890";D.querySelector("[data-mdbs]").click();await sleep(50);
  eq([calls.length,/fara internet/.test(D.querySelector("#mdbr").textContent),!!D.querySelector("#bcc")],[1,true,false],"produs nou fara internet: mesaj clar");
  mode="nf";D.querySelector("[data-mdbs]").click();await sleep(50);
  eq(/nu e in Open Food Facts/.test(D.querySelector("#mdbr").textContent),true,"produs negasit: mesaj");
  w.close();
 })();
 // --- 4.23.1: scanare cu camera (detector nativ si biblioteca de rezerva), camera se opreste
 await (async()=>{
  const day=new Date(),dk=day.getFullYear()+"-"+String(day.getMonth()+1).padStart(2,"0")+"-"+String(day.getDate()).padStart(2,"0");
  const prod={status:1,product:{code:"5941234567890",product_name:"Iaurt grecesc",nutriments:{"energy-kcal_100g":100,proteins_100g:5,carbohydrates_100g:5,fat_100g:5}}};
  const mk=async(extra)=>{const w=await boot({rp:"[]"},{wait:700,names:["menOpen","show","menClose"],offline:true});w.fetch=async()=>({ok:true,status:200,json:async()=>prod});w.HTMLMediaElement.prototype.play=async()=>{};if(extra)extra(w);return w};
  // fara camera: gri + mesaj
  {const w=await mk(),T=w.__t,D=w.document;T.show("meniu");T.menOpen({day:dk});const b=D.querySelector("[data-mdbcam]");eq([!!b,b.classList.contains("gri")],[true,true],"fara camera: butonul e gri");b.click();eq(/Camera nu e disponibila/.test(D.querySelector("#toast").textContent)&&!D.querySelector("#toast").classList.contains("bad"),true,"fara camera: mesaj scurt, nu rosu");w.close()}
  // detector nativ
  {let stopped=0,asked=0;const w=await mk(w=>{w.navigator.mediaDevices={getUserMedia:async c=>{asked++;return{getTracks:()=>[{stop(){stopped++}}]}}};w.BarcodeDetector=class{static async getSupportedFormats(){return["ean_13","ean_8"]}async detect(){return[{rawValue:"5941234567890"}]}}}),T=w.__t,D=w.document;
   T.show("meniu");T.menOpen({day:dk});const b=D.querySelector("[data-mdbcam]");eq(b.classList.contains("gri"),false,"cu camera: butonul nu e gri");b.click();await sleep(30);eq([!!D.querySelector("#bcv"),asked],[true,1],"camera porneste, cu previzualizare");
   await sleep(700);eq([!!D.querySelector("#bcc"),D.querySelector("#mdbc").value,stopped>=1],[true,"5941234567890",true],"cod detectat: cauta produsul si opreste camera");w.close()}
  // biblioteca de rezerva
  {let stopped=0,reset=0,fmts=null;const w=await mk(w=>{w.navigator.mediaDevices={getUserMedia:async()=>({getTracks:()=>[{stop(){stopped++}}]})};
    w.ZXing={DecodeHintType:{POSSIBLE_FORMATS:"pf"},BarcodeFormat:{EAN_13:"e13",EAN_8:"e8",UPC_A:"ua",UPC_E:"ue"},BrowserMultiFormatReader:class{constructor(h){fmts=h.get("pf")}decodeFromConstraints(c,v,cb){setTimeout(()=>cb({getText:()=>"5941234567890"}),20)}reset(){reset++}}}}),T=w.__t,D=w.document;
   T.show("meniu");T.menOpen({day:dk});D.querySelector("[data-mdbcam]").click();await sleep(150);
   eq([!!D.querySelector("#bcc"),fmts&&fmts.length,reset>=1],[true,4,true],"fara detector nativ: biblioteca de rezerva citeste codul, apoi se opreste");w.close()}
  // inchiderea dialogului opreste camera
  {let stopped=0;const w=await mk(w=>{w.navigator.mediaDevices={getUserMedia:async()=>({getTracks:()=>[{stop(){stopped++}}]})};w.BarcodeDetector=class{static async getSupportedFormats(){return["ean_13"]}async detect(){return[]}}}),T=w.__t,D=w.document;
   T.show("meniu");T.menOpen({day:dk});D.querySelector("[data-mdbcam]").click();await sleep(40);T.menClose();eq(stopped>=1,true,"inchiderea dialogului opreste camera");w.close()}
  // permisiune refuzata
  {const w=await mk(w=>{w.navigator.mediaDevices={getUserMedia:async()=>{const e=new Error("x");e.name="NotAllowedError";throw e}};w.BarcodeDetector=class{static async getSupportedFormats(){return["ean_13"]}}}),T=w.__t,D=w.document;
   T.show("meniu");T.menOpen({day:dk});D.querySelector("[data-mdbcam]").click();await sleep(40);eq(/Nu ai dat voie la camera/.test(D.querySelector("#mdbr").textContent),true,"permisiune refuzata: mesaj clar");w.close()}
 })();
 // --- 4.23.2: pe telefon tastatura nu se mai deschide singura in dialog
 await (async()=>{
  for(const [coarse,want] of [[true,false],[false,true]]){
   const w=await boot({rp:"[]"},{wait:600,names:["menOpen","show"],offline:true});w.matchMedia=()=>({matches:coarse});const T=w.__t,D=w.document;T.show("meniu");T.menOpen({});await sleep(30);
   eq(D.activeElement&&D.activeElement.id==="mdq",want,coarse?"ecran tactil: cautarea nu primeste focus (tastatura nu acopera dialogul)":"desktop: cautarea primeste focus");w.close()}
 })();
 done()})();

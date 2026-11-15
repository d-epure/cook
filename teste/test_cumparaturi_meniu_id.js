/* Cumparaturi si debara (3.20.0), masa Cina (3.21.0), id stabil pe retetele salvate (4.0.0). Rulare: node teste/test_cumparaturi_meniu_id.js */
const {boot,eq,done,item,supa,pan}=require("./_boot.js");
(async()=>{
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
 done()})();

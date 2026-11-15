/* 4.3.0: categorii implicite, Leguminoase, tema noua in Gatire, WhatsApp. Rulare: node teste/test_4_3_0.js */
const {boot,eq,done,item}=require("./_boot.js");
(async()=>{
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
 done()})();

/* 4.7.0: marcajele din debara (proaspat, congelat, uscat, conserva) legate de lista de cumparaturi. Rulare: node teste/test_4_7_0.js */
const {boot,eq,done,item}=require("./_boot.js");
(async()=>{
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
 done()})();

/* Interfata (marime text, cos de gunoi, etichete pliabile) si sincronizare. Rulare: node teste/test_interfata_sync.js (sau node teste/toate.js pentru toate) */
const {boot,eq,done,sleep,item,supa,pan,dir,fs}=require("./_boot.js");
(async()=>{
 console.log("\n## "+"4.3.1: butonul 'Vezi' de la modificarile facute pe ambele dispozitive.");
await (async()=>{
 const conf=[{t:1,nm:"lista de cumparaturi",f:"",l:"2 kg faina",r:"1 kg faina"}];
 const w=await boot({rsyc:JSON.stringify(conf)},{names:["syBar","dbDraw"],offline:true}),D=w.document;let scrolled=null;
 w.Element.prototype.scrollIntoView=function(){scrolled=this};
 w.__t.syBar("O modificare facuta pe ambele dispozitive. Am pastrat o singura varianta.","Vezi");
 D.querySelector("#syGo").click();await sleep(150);
 eq([D.querySelector("#v-setari").classList.contains("hidden"),/Modificate pe ambele dispozitive/.test(D.querySelector("#dbcard").textContent),/pastrat "2 kg faina", cealalta era "1 kg faina"/.test(D.querySelector("#dbcard").textContent)],[false,true,true],"Vezi deschide Setari si caseta arata ce s-a pastrat");
 eq(!!scrolled&&!!scrolled.closest("#dbcard"),true,"pagina merge la caseta cu detaliile");
 D.querySelector("#dbcard [data-syc]").click();await sleep(50);
 eq([D.querySelector("#sybar").hidden,w.localStorage.getItem("rsyc")],[true,null],"Am inteles ascunde mesajul de sus");
 })();
 console.log("\n## "+'4.3.2: sincronizare - loturile de Meal prep se unesc; mesajul de conflict e citibil.');
await (async()=>{
 const w=await boot({},{names:["syMerge","syVal","SY_LAB","syId"],offline:true}),T=w.__t;
 const lot=(id,t)=>({id,s:"b",k:"Carte|"+id,t,d:"2026-11-15",p:4});
 const base={rmp:[lot("a","Supa")]},loc={rmp:[lot("a","Supa"),lot("b","Chili")]},rem={rmp:[lot("a","Supa"),lot("c","Curry")]};
 eq(T.syMerge(base,loc,rem,false).rmp.map(x=>x.id).sort(),["a","b","c"],"loturi adaugate pe ambele dispozitive: raman toate");
 eq(T.syMerge(base,{rmp:[lot("a","Supa"),lot("b","Chili")]},{rmp:[]},false).rmp.map(x=>x.id),["a","b"],"limita cunoscuta: o lista golita complet pe un dispozitiv nu sterge loturile daca celalalt a adaugat intre timp");
 eq(T.syMerge({rmp:[lot("a","Supa")]},{rmp:[lot("a","Supa")]},{rmp:[]},false).rmp,[],"lot terminat pe celalalt dispozitiv dispare si aici");
 eq([T.SY_LAB.rmp,T.syVal([lot("a","Supa"),lot("b","Chili")]),T.syVal([1,2,3,4,5].map(i=>lot("x"+i,"R"+i))),T.syVal({titlu:"Gofre"}),T.syVal(null),T.syVal(4)],["Meal prep","Supa, Chili","R1, R2, R3 si inca 2","Gofre","(gol)","4"],"mesajul arata nume citibile");
 })();
 console.log("\n## "+'4.9.0: etichete pliabile, aparate neutre, marime text A-/A+, rand sursa cu iconita.');
await (async()=>{
 const w=await boot({},{wait:800}),d=w.document,$=s=>d.querySelector(s);
 eq([!!$("#lbdet"),$("#lbdet").open],[true,false],"Etichete: pliabil, inchis implicit");
 eq(/toate/.test($("#lbsum").textContent),true,"fara bife: (toate)");
 const c=d.querySelector("#lbbox input");c.checked=true;c.dispatchEvent(new w.Event("change",{bubbles:true}));
 eq(/1 activa/.test($("#lbsum").textContent),true,"titlul arata numarul de etichete active");
 eq(/style="--c/.test(d.body.innerHTML),false,"fara culori fixe pe aparate");
 eq(/COL=\[|const col=/.test(fs.readFileSync(dir+"/app.js","utf8")),false,"paleta veche eliminata");
 eq($("#zv").textContent,"100%","marime implicita 100%");
 $("#zu").click();eq([$("#zv").textContent,w.localStorage.getItem("rzm"),d.documentElement.style.getPropertyValue("--z")],["115%","1.15","1.15"],"A+ creste si se salveaza");
 $("#zu").click();$("#zu").click();$("#zu").click();eq([$("#zv").textContent,$("#zu").disabled],["150%",true],"maxim 150%");
 $("#zv").click();eq([$("#zv").textContent,w.localStorage.getItem("rzm")],["100%","1"],"atingerea valorii reseteaza");
 for(let i=0;i<4;i++)$("#zd").click();eq([$("#zv").textContent,$("#zd").disabled],["90%",true],"minim 90%");
 const w2=await boot({rzm:"1.3"},{wait:300});eq(w2.document.querySelector("#zv").textContent,"130%","se pastreaza la redeschidere");
 const DK=fs.readFileSync(dir+"/app.js","utf8").match(/DKEYS\s*=\s*\[[^\]]*\]/);eq(DK?/rzm/.test(DK[0]):false,false,"setarea nu intra in backup");
 const b=await boot({rbook:JSON.stringify([{sursa:"Carte cu un nume foarte foarte lung de test",nr:1,titlu:"a",categorie:"x",portii:2,ingrediente:[{c:1,u:"",n:"ou"}],pasi_carte:["a"],sfaturi:[],macro:{kcal:1,proteine:1,carbo:1,grasimi:1}}])},{wait:800});
 const r=b.document.querySelector(".bsr");eq([!!r,!!r&&!!r.querySelector("[data-dl][aria-label='Descarca JSON'] svg"),!!r&&!/Descarca JSON</.test(r.innerHTML)],[true,true,true],"rand sursa: nume pe linia lui, iconita in loc de text");
 })();
 console.log("\n## "+"4.9.1: 'Sterge' de pe randuri devine cos de gunoi, cu confirmare pastrata.");
await (async()=>{
 const w=await boot({},{wait:800}),d=w.document;
 const src=fs.readFileSync(dir+"/app.js","utf8");
 eq(/>Sterge<\/button>/.test(src.replace(/<button[^>]*data-edel[^>]*>Sterge reteta<\/button>/,"")),false,"niciun buton de rand cu textul Sterge");
 w.eval('renderCfg&&renderCfg()');
 const b=d.querySelector("#apcfg [data-x]");
 eq([!!b,!!b&&!!b.querySelector("svg"),b&&b.getAttribute("aria-label")],[true,true,"Sterge"],"aparat: cos de gunoi cu eticheta accesibila");
 const n=d.querySelectorAll("#apcfg [data-x]").length;
 b.click();eq([b.textContent,d.querySelectorAll("#apcfg [data-x]").length],["Confirma",n],"primul tap cere confirmare, nu sterge");
 b.click();eq(d.querySelectorAll("#apcfg [data-x]").length,n-1,"al doilea tap sterge");
 })();
 done()})();

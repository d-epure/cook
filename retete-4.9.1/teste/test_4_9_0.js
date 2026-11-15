/* 4.9.0: etichete pliabile, aparate neutre, marime text A-/A+, rand sursa cu iconita. Rulare: node teste/test_4_9_0.js */
const {boot,eq,done,fs,dir}=require("./_boot.js");
(async()=>{
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
 done()})();

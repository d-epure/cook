/* 4.8.0: cartea Retete high-volume (100 de retete, cel mult 500 kcal), eticheta high-volume, tema Volum mare in Gatire. Rulare: node teste/test_4_8_0.js */
const {boot,eq,done,fs,dir}=require("./_boot.js");
(async()=>{
 const J=JSON.parse(fs.readFileSync(dir+"/carti/retete_high_volume.json","utf8")),man=JSON.parse(fs.readFileSync(dir+"/carti.json","utf8")).carti.find(c=>c.sursa==="Retete high-volume");
 eq([J.length,man.n,man.f],[100,100,"carti/retete_high_volume.json"],"100 de retete si intrare in carti.json");
 eq([new Set(J.map(r=>r.titlu)).size,J.every((r,i)=>r.sursa==="Retete high-volume"&&r.nr===i+1)],[100,true],"titluri unice, nr de la 1 la 100");
 eq(J.every(r=>r.macro&&r.macro.kcal>0&&r.macro.kcal<=500&&r.macro.sursa==="local"&&r.macro.acoperire.split(" din ")[0]===r.macro.acoperire.split(" din ")[1]),true,"toate au macro complet si cel mult 500 kcal pe portie");
 eq(J.every(r=>r.etichete.includes("high-volume")&&+r.timp>0&&["usor","mediu","avansat"].includes(r.dif)&&r.pasi_carte.length>=2&&r.sfaturi.length>=2),true,"eticheta, timp, dificultate, pasi si sfaturi");
 const mese=J.filter(r=>!["Mic dejun","Deserturi usoare"].includes(r.categorie));
 eq([mese.every(r=>r.macro.kcal>=300),mese.filter(r=>r.categorie!=="Supe si ciorbe").every(r=>r.macro.proteine>=22)],[true,true],"mesele principale au cel putin 300 kcal si 22 g proteine (supele au minim 300 kcal)");
 eq(J.filter(r=>r.etichete.includes("vegetarian")).every(r=>!/\b(pui|curcan|vita|porc|peste|ton|somon|cod|creveti|carnat|sunca|pastrav)\b/.test(r.ingrediente.map(i=>i.n).join(" "))),true,"cele vegetariene nu au carne");
 eq(J.filter(r=>r.etichete.includes("vegan")).every(r=>!/\b(ou|oua|albusuri|lapte|iaurt|branza|ricotta|parmezan|miere|feta)\b/.test(r.ingrediente.map(i=>i.n.replace(/iaurt de soia|lapte de (cocos|migdale)/g,"")).join(" "))),true,"cele vegane nu au produse animale");
 eq(/[ăâîșşțţĂÂÎȘȚ]/.test(JSON.stringify(J)),false,"fara diacritice");
 eq(J.filter(r=>r.sfaturi.some(s=>/^Varianta (vegetariana|cu carne|vegana):/.test(s))).length,100,"fiecare reteta are varianta pereche cu macro recalculat");
 // aplicatia: eticheta noua exista si pentru cine are deja lista de etichete
 const w=await boot({rtags:JSON.stringify([{n:"vegan",t:"dieta"},{n:"keto",t:"dieta",auto:"keto"}])},{names:["BOOK","TAGS","canon"]}),T=w.__t;
 eq([T.TAGS.some(t=>t.n==="high-volume"),T.canon("High-Volume"),w.localStorage.getItem("rtv3")],[true,"high-volume","1"],"high-volume se adauga o singura data in lista de etichete existenta");
 const hv=T.BOOK.filter(r=>r.sursa==="Retete high-volume");
 eq([hv.length,T.BOOK.length,new Set(T.BOOK.map(r=>r.titlu)).size],[100,956,956],"biblioteca are 956 de retete livrate, fara titluri dublate");
 const G=w.eval("NUTRI.G"),g=G.find(x=>x[0]==="Volum mare, calorii putine");
 eq([!!g,g&&g[1].length],[true,4],"tema Volum mare, calorii putine in Gatire (4 teme)");
 done()})();

/* Cartile livrate: instalare, backup, versiuni, continut si praguri. Rulare: node teste/test_carti.js (sau node teste/toate.js pentru toate) */
const {boot,eq,done,sleep,item,supa,pan,dir,fs}=require("./_boot.js");
(async()=>{
 console.log("\n## "+'Carti livrate cu aplicatia (4.1.0): instalare, backup, stergere, restaurare, versiune noua.');
await (async()=>{
 const names=["getStored","shipRun","shUnmod","bkBuild","getBv","putBv","saveStored","bKey","isFav","BOOK","cosSet"];
 const man0=JSON.parse(fs.readFileSync(dir+"/carti.json","utf8")),tot=man0.carti.reduce((a,b)=>a+b.n,0);
 let w=await boot({},{names}),T=w.__t,st=T.getStored();
 eq([st.length,st.every(r=>T.shUnmod(r)),T.BOOK.length],[tot,true,tot],"utilizator nou: toate retetele livrate, neschimbate, afisate");
 let b=JSON.parse(T.bkBuild().json);eq(b.date.rbook===undefined,true,"backup fara cartile livrate");
 const r0=T.BOOK.find(r=>r.sursa==="Retete cu carne"&&r.nr===1);T.cosSet(r0,true);await sleep(50);
 b=JSON.parse(T.bkBuild().json);eq([JSON.parse(b.date.rbook).length,JSON.parse(b.date.rliv)["Retete cu carne"].length],[1,man0.carti.find(c=>c.sursa==="Retete cu carne").n-1],"reteta schimbata intra in backup, restul doar ca lista");
 const bv=T.getBv();bv["Deserturi rapide"]={del:1};T.putBv(bv);await T.saveStored(T.getStored().filter(r=>r.sursa!=="Deserturi rapide"));
 await T.shipRun();eq(T.getStored().filter(x=>x.sursa==="Deserturi rapide").length,0,"cartea stearsa nu revine singura");
 await T.shipRun(true);eq(T.getStored().filter(x=>x.sursa==="Deserturi rapide").length,30,"'Readu cartile aplicatiei' o aduce inapoi");
 const bk2=JSON.parse(T.bkBuild().json).date,seed={};Object.keys(bk2).forEach(k=>{if(k==="rliv")seed.rbneed=bk2[k];else seed[k]=bk2[k]});
 w=await boot(seed,{names});T=w.__t;st=T.getStored();
 eq([st.length,!!st.find(x=>x.sursa==="Retete cu carne"&&x.nr===1&&x.cos),w.localStorage.getItem("rbneed")],[tot,true,null],"restaurare pe dispozitiv gol: toate retetele, starea pastrata");
 // utilizator cu carti incarcate de mana inainte de 4.1.0 (fara marcaje de livrare, fara timp) si retete proprii
 const veg=JSON.parse(fs.readFileSync(dir+"/carti/retete_vegetariene.json","utf8")).map(r=>{const c=Object.assign({},r);delete c.timp;delete c.dif;return c});
 veg[1].corectata=true;veg[1].titlu="Chili corectat de mine";
 const own=[1,2].map(nr=>({sursa:"Retetele mele",nr,titlu:"A mea "+nr,categorie:"Retetele mele",portii:2,ingrediente:[{c:1,u:"",n:"ou"}],pasi_carte:["Fierbe."],macro:{kcal:null,proteine:null,carbo:null,grasimi:null},etichete:[],manual:true}));
 w=await boot({rbook:JSON.stringify(veg.concat(own)),rfav:JSON.stringify(["Retetele mele|1","Retete vegetariene|3"])},{names});T=w.__t;st=T.getStored();
 const V=nr=>st.find(x=>x.sursa==="Retete vegetariene"&&x.nr===nr);
 eq([st.length,st.filter(x=>x.sursa==="Retetele mele").length,st.filter(x=>x.sursa==="Retetele mele").some(x=>x.liv)],[tot+2,2,false],"utilizator existent: cartile se completeaza, retetele proprii neatinse");
 eq([+V(3).timp>0,V(2).titlu,T.isFav("Retetele mele|1"),T.isFav("Retete vegetariene|3")],[true,"Chili corectat de mine",true,true],"reteta neatinsa trece pe versiunea livrata; cea corectata si favoritele raman");
 eq(JSON.parse(JSON.parse(T.bkBuild().json).date.rbook).length,3,"backup: doar retetele proprii si cea corectata");
 // versiune noua a unei carti
 w=await boot({},{names});T=w.__t;
 const des=JSON.parse(fs.readFileSync(dir+"/carti/deserturi_rapide.json","utf8"));des[0].titlu="Mousse nou";des[1].titlu="Inghetata noua";des.push(Object.assign({},des[2],{nr:31,titlu:"Desert 31"}));
 const man=JSON.parse(JSON.stringify(man0));man.carti.find(x=>x.sursa==="Deserturi rapide").v+=1;
 const r2=T.BOOK.find(x=>x.sursa==="Deserturi rapide"&&x.nr===2),t2=r2.titlu;T.cosSet(r2,true);await sleep(50);
 await T.saveStored(T.getStored().filter(x=>!(x.sursa==="Deserturi rapide"&&x.nr===5)));
 w.fetch=async u=>{u=String(u);if(u==="carti.json")return{ok:true,json:async()=>man};if(u==="carti/deserturi_rapide.json")return{ok:true,json:async()=>des};return{ok:false}};
 let r=await T.shipRun();st=T.getStored();const Dz=n=>st.find(x=>x.sursa==="Deserturi rapide"&&x.nr===n);
 eq([Dz(1).titlu,Dz(2).titlu===t2,!!Dz(31),!!Dz(5),r],["Mousse nou",true,true,false,{add:1,upd:28}],"versiune noua: neschimbatele se actualizeaza, cele schimbate sau sterse de utilizator nu");
 eq(await T.shipRun(),{add:0,upd:0},"a doua rulare nu face nimic");
 // 4.30.2: retete scoase din carte
 {w.localStorage.setItem("rfav",JSON.stringify(["Deserturi rapide|4"]));const des2=des.filter(x=>![3,4].includes(x.nr));man.carti.find(x=>x.sursa==="Deserturi rapide").v+=1;
  w.fetch=async u=>{u=String(u);if(u==="carti.json")return{ok:true,json:async()=>man};if(u==="carti/deserturi_rapide.json")return{ok:true,json:async()=>des2};return{ok:false}};
  await T.shipRun();st=T.getStored();eq([!!Dz(3),!!Dz(4),!!Dz(6)],[false,true,true],"reteta scoasa din carte iese din Biblioteca, mai putin daca e folosita (favorita)");}
 })();
 console.log("\n## "+'4.5.0: 36 de retete noi la air fryer in cartile livrate.');
await (async()=>{
 const names=["getStored","BOOK","shipRun","shUnmod","bKey"];
 let w=await boot({},{names}),T=w.__t,B=T.BOOK;
 const af=B.filter(r=>r.sursa!=="Retete high-volume"&&(r.etichete||[]).includes("air fryer"));
 const tot=JSON.parse(fs.readFileSync(dir+"/carti.json","utf8")).carti.reduce((a,b)=>a+b.n,0);
 eq([B.length,af.length,new Set(B.map(T.bKey)).size===B.length,new Set(B.map(r=>r.titlu)).size===B.length],[tot,50,true,true],"toate retetele livrate, 50 la air fryer (fara cartea high-volume), fara chei sau titluri dublate");
 const nou=B.filter(r=>r.capitol==="Air fryer");
 eq([nou.length,nou.every(r=>+r.timp>0&&r.dif&&r.macro&&r.macro.kcal>0&&/ din /.test(r.macro.acoperire)&&r.macro.acoperire.split(" din ")[0]===r.macro.acoperire.split(" din ")[1]),nou.every(r=>(r.sfaturi||[]).length>=2&&(r.pasi_carte||[]).length>=3)],[36,true,true],"retetele noi au timp, dificultate, macro complet, pasi si sfaturi");
 eq(nou.filter(r=>r.etichete.includes("vegan")).every(r=>r.etichete.includes("vegetarian")&&!/\b(miere|ou|oua|iaurt|branza|parmezan|feta|mozzarella)\b/.test(r.ingrediente.map(i=>i.n).join(" "))),true,"cele vegane sunt si vegetariene si nu au produse animale");
 eq(nou.filter(r=>r.sursa==="Retete cu carne").every(r=>!r.etichete.includes("vegetarian")),true,"retetele cu carne sunt in cartea cu carne");
 // utilizator ramas la versiunea 2 a cartilor: primeste doar retetele noi
 const man=JSON.parse(fs.readFileSync(dir+"/carti.json","utf8")),NEW=["Air fryer","Asiatic","Traditional romanesc","Mic dejun cu carne","Gustari","Peste"],old=T.getStored().filter(r=>!NEW.includes(r.capitol)).map(r=>Object.assign({},r,{liv:2})),bv={};
 man.carti.forEach(b=>{bv[b.sursa]={v:2,max:Math.max(...old.filter(r=>r.sursa===b.sursa).map(r=>r.nr))}});
 w=await boot({rbook:JSON.stringify(old),rbv:JSON.stringify(bv),rfav:JSON.stringify(["Retete cu carne|13"])},{names});T=w.__t;
 eq([T.getStored().length,T.getStored().filter(r=>r.capitol==="Air fryer").length],[tot,36],"actualizare de la versiunea veche a cartilor: cele 36 de retete se adauga");
 })();
 console.log("\n## "+'4.6.0: 60 de retete noi (asiatic, traditional romanesc, mic dejun cu carne, gustari, peste) in cartile livrate.');
await (async()=>{
 const w=await boot({},{names:["BOOK","bKey","autoTags","hasGluten"]}),T=w.__t,B=T.BOOK;
 const cap=c=>B.filter(r=>r.capitol===c),tag=t=>B.filter(r=>r.sursa!=="Retete high-volume"&&(r.etichete||[]).includes(t)).length;
 eq([B.length,new Set(B.map(T.bKey)).size,new Set(B.map(r=>r.titlu)).size],[952,952,952],"952 de retete livrate, fara chei sau titluri dublate");
 eq(["Asiatic","Traditional romanesc","Mic dejun cu carne","Gustari","Peste"].map(c=>cap(c).length),[18,9,13,12,8],"cele cinci loturi noi");
 eq([tag("asiatic"),tag("traditional romanesc"),tag("air fryer")],[50,50,50],"asiatic, traditional romanesc si air fryer au cate 50 de retete (fara cartea high-volume)");
 const nou=B.filter(r=>["Asiatic","Traditional romanesc","Mic dejun cu carne","Gustari","Peste"].includes(r.capitol));
 eq([nou.every(r=>+r.timp>0&&r.dif&&r.macro&&r.macro.kcal>0&&r.macro.acoperire.split(" din ")[0]===r.macro.acoperire.split(" din ")[1]),nou.every(r=>(r.sfaturi||[]).length>=2&&(r.pasi_carte||[]).length>=2)],[true,true],"retetele noi au timp, dificultate, macro complet, pasi si sfaturi");
 eq(nou.filter(r=>r.etichete.includes("vegan")).every(r=>r.etichete.includes("vegetarian")&&!/\b(miere|ou|oua|iaurt|branza|parmezan|feta|mozzarella|cascaval|smantana|telemea)\b/.test(r.ingrediente.map(i=>i.n).join(" "))),true,"cele vegane sunt si vegetariene si nu au produse animale");
 eq(nou.every(r=>(r.sursa==="Retete vegetariene")===r.etichete.includes("vegetarian")),true,"vegetarienele sunt in cartea vegetariana, restul in cea cu carne");
 const miso=B.find(r=>/Somon glazurat cu miso/.test(r.titlu));eq([T.hasGluten(miso),T.autoTags(miso).includes("gluten-free")],[true,false],"miso conteaza ca ingredient cu gluten");
 })();
 console.log("\n## "+'4.8.0: cartea Retete high-volume (100 de retete, cel mult 500 kcal), eticheta high-volume, tema Volum mare in Gatire.');
await (async()=>{
 const J=JSON.parse(fs.readFileSync(dir+"/carti/retete_high_volume.json","utf8")),man=JSON.parse(fs.readFileSync(dir+"/carti.json","utf8")).carti.find(c=>c.sursa==="Retete high-volume");
 eq([J.length,man.n,man.f],[99,99,"carti/retete_high_volume.json"],"99 de retete (Terci cu albus scos in 4.30.3) si intrare in carti.json");
 eq([new Set(J.map(r=>r.titlu)).size,J.every(r=>r.sursa==="Retete high-volume")&&new Set(J.map(r=>r.nr)).size===J.length],[99,true],"titluri si numere unice");
 eq(J.every(r=>r.macro&&r.macro.kcal>0&&r.macro.kcal<=500&&r.macro.sursa==="local"&&r.macro.acoperire.split(" din ")[0]===r.macro.acoperire.split(" din ")[1]),true,"toate au macro complet si cel mult 500 kcal pe portie");
 eq(J.every(r=>r.etichete.includes("high-volume")&&+r.timp>0&&["usor","mediu","avansat"].includes(r.dif)&&r.pasi_carte.length>=2&&r.sfaturi.length>=2),true,"eticheta, timp, dificultate, pasi si sfaturi");
 const mese=J.filter(r=>!["Mic dejun","Deserturi","Gustari","Bauturi"].includes(r.categorie));
 eq([mese.every(r=>r.macro.kcal>=300),mese.filter(r=>r.categorie!=="Supe si ciorbe").every(r=>r.macro.proteine>=22)],[true,true],"mesele principale au cel putin 300 kcal si 22 g proteine (supele au minim 300 kcal)");
 eq(J.filter(r=>r.etichete.includes("vegetarian")).every(r=>!/\b(pui|curcan|vita|porc|peste|ton|somon|cod|creveti|carnat|sunca|pastrav)\b/.test(r.ingrediente.map(i=>i.n).join(" "))),true,"cele vegetariene nu au carne");
 eq(J.filter(r=>r.etichete.includes("vegan")).every(r=>!/\b(ou|oua|albusuri|lapte|iaurt|branza|ricotta|parmezan|miere|feta)\b/.test(r.ingrediente.map(i=>i.n.replace(/iaurt de soia|lapte de (cocos|migdale)/g,"")).join(" "))),true,"cele vegane nu au produse animale");
 eq(/[ăâîșşțţĂÂÎȘȚ]/.test(JSON.stringify(J)),false,"fara diacritice");
 eq(J.filter(r=>r.sfaturi.some(s=>/^Varianta (vegetariana|cu carne|vegana):/.test(s))).length,98,"fiecare reteta are varianta pereche cu macro recalculat (fara Clatite de ovaz cu iaurt si mere: dulce, cu oua, nu are varianta cu sens)");
 // aplicatia: eticheta noua exista si pentru cine are deja lista de etichete
 const w=await boot({rtags:JSON.stringify([{n:"vegan",t:"dieta"},{n:"keto",t:"dieta",auto:"keto"}])},{names:["BOOK","TAGS","canon"]}),T=w.__t;
 eq([T.TAGS.some(t=>t.n==="high-volume"),T.canon("High-Volume"),w.localStorage.getItem("rtv3")],[true,"high-volume","1"],"high-volume se adauga o singura data in lista de etichete existenta");
 const hv=T.BOOK.filter(r=>r.sursa==="Retete high-volume");
 eq([hv.length,T.BOOK.length,new Set(T.BOOK.map(r=>r.titlu)).size],[99,952,952],"biblioteca are 952 de retete livrate, fara titluri dublate");
 const G=w.eval("NUTRI.G"),g=G.find(x=>x[0]==="Sfaturi"),vt=g?g[1].filter(t=>["Ce umple farfuria fara multe calorii","Trucuri de gatit","Cum citesti volumul unei portii","Cand nu e potrivit"].includes(t[0])).length:0;
 eq([!!g,vt],[true,4],"temele Volum mare, calorii putine in Gatire > Sfaturi (4 teme)");
 })();
 // 4.30.1: revizia continutului din carti (asezonare, formulari, variante)
 {const man=JSON.parse(fs.readFileSync(dir+"/carti.json","utf8")),all=[];man.carti.forEach(c=>JSON.parse(fs.readFileSync(dir+"/"+c.f,"utf8")).forEach(r=>all.push(r)));
  const txt=r=>(r.pasi_carte||[]).concat(r.sfaturi||[],[r.titlu]).join(" ");
  eq(all.filter(r=>/\b(Asaza|rulaza|Rulaza|Sotaza|Calveste|ragaie|invelesti|olive|racestele|maraul|cate o polonic)\b/.test(txt(r))).map(r=>r.titlu),[],"fara greselile de scriere gasite la revizie");
  const usesSalt=r=>/\bsare\b|sareaza|sare-(i|le)\b/.test((r.pasi_carte||[]).join(" "));
  eq(all.filter(r=>usesSalt(r)&&!(r.ingrediente||[]).some(x=>/^sare\b/.test(x.n))).map(r=>r.titlu),[],"daca pasii folosesc sare, sarea e si in ingrediente");
  eq(all.filter(r=>(r.sfaturi||[]).some(s=>/Varianta[^:]*:.*\(~(\d+) kcal/.test(s)&&+s.match(/\(~(\d+) kcal/)[1]>1.6*r.macro.kcal)).map(r=>r.titlu),[],"variantele nu au kcal pe toata reteta in loc de pe portie");
  eq(all.filter(r=>/vanilie/i.test(r.titlu)&&!(r.ingrediente||[]).some(x=>/vanilie/.test(x.n))).map(r=>r.titlu),[],"retetele cu vanilie in titlu au vanilie in ingrediente");
  eq(all.filter(r=>/Panna cotta/i.test(r.titlu)&&!(r.ingrediente||[]).some(x=>/gelatina|agar/.test(x.n))).length,0,"panna cotta are gelatina");
  eq(all.filter(r=>(r.sfaturi||[]).some(s=>/^Varianta cu carne/.test(s))&&/iaurt|zmeura|ovaz/i.test(r.titlu)&&/Bol de iaurt|Clatite de ovaz/.test(r.titlu)).length,0,"fara varianta cu carne la mic dejun dulce");}
 done()})();

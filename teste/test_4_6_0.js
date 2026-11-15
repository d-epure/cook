/* 4.6.0: 60 de retete noi (asiatic, traditional romanesc, mic dejun cu carne, gustari, peste) in cartile livrate. Rulare: node teste/test_4_6_0.js */
const {boot,eq,done}=require("./_boot.js");
(async()=>{
 const w=await boot({},{names:["BOOK","bKey","autoTags","hasGluten"]}),T=w.__t,B=T.BOOK;
 const cap=c=>B.filter(r=>r.capitol===c),tag=t=>B.filter(r=>(r.etichete||[]).includes(t)).length;
 eq([B.length,new Set(B.map(T.bKey)).size,new Set(B.map(r=>r.titlu)).size],[856,856,856],"856 de retete livrate, fara chei sau titluri dublate");
 eq(["Asiatic","Traditional romanesc","Mic dejun cu carne","Gustari","Peste"].map(c=>cap(c).length),[18,9,13,12,8],"cele cinci loturi noi");
 eq([tag("asiatic"),tag("traditional romanesc"),tag("air fryer")],[50,50,50],"asiatic, traditional romanesc si air fryer au cate 50 de retete");
 const nou=B.filter(r=>["Asiatic","Traditional romanesc","Mic dejun cu carne","Gustari","Peste"].includes(r.capitol));
 eq([nou.every(r=>+r.timp>0&&r.dif&&r.macro&&r.macro.kcal>0&&r.macro.acoperire.split(" din ")[0]===r.macro.acoperire.split(" din ")[1]),nou.every(r=>(r.sfaturi||[]).length>=2&&(r.pasi_carte||[]).length>=2)],[true,true],"retetele noi au timp, dificultate, macro complet, pasi si sfaturi");
 eq(nou.filter(r=>r.etichete.includes("vegan")).every(r=>r.etichete.includes("vegetarian")&&!/\b(miere|ou|oua|iaurt|branza|parmezan|feta|mozzarella|cascaval|smantana|telemea)\b/.test(r.ingrediente.map(i=>i.n).join(" "))),true,"cele vegane sunt si vegetariene si nu au produse animale");
 eq(nou.every(r=>(r.sursa==="Retete vegetariene")===r.etichete.includes("vegetarian")),true,"vegetarienele sunt in cartea vegetariana, restul in cea cu carne");
 const miso=B.find(r=>/Somon glazurat cu miso/.test(r.titlu));eq([T.hasGluten(miso),T.autoTags(miso).includes("gluten-free")],[true,false],"miso conteaza ca ingredient cu gluten");
 done()})();

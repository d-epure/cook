/* 4.5.0: 36 de retete noi la air fryer in cartile livrate. Rulare: node teste/test_4_5_0.js */
const {boot,eq,done,dir,fs}=require("./_boot.js");
(async()=>{
 const names=["getStored","BOOK","shipRun","shUnmod","bKey"];
 let w=await boot({},{names}),T=w.__t,B=T.BOOK;
 const af=B.filter(r=>(r.etichete||[]).includes("air fryer"));
 const tot=JSON.parse(fs.readFileSync(dir+"/carti.json","utf8")).carti.reduce((a,b)=>a+b.n,0);
 eq([B.length,af.length,new Set(B.map(T.bKey)).size===B.length,new Set(B.map(r=>r.titlu)).size===B.length],[tot,50,true,true],"toate retetele livrate, 50 la air fryer, fara chei sau titluri dublate");
 const nou=B.filter(r=>r.capitol==="Air fryer");
 eq([nou.length,nou.every(r=>+r.timp>0&&r.dif&&r.macro&&r.macro.kcal>0&&/ din /.test(r.macro.acoperire)&&r.macro.acoperire.split(" din ")[0]===r.macro.acoperire.split(" din ")[1]),nou.every(r=>(r.sfaturi||[]).length>=2&&(r.pasi_carte||[]).length>=3)],[36,true,true],"retetele noi au timp, dificultate, macro complet, pasi si sfaturi");
 eq(nou.filter(r=>r.etichete.includes("vegan")).every(r=>r.etichete.includes("vegetarian")&&!/\b(miere|ou|oua|iaurt|branza|parmezan|feta|mozzarella)\b/.test(r.ingrediente.map(i=>i.n).join(" "))),true,"cele vegane sunt si vegetariene si nu au produse animale");
 eq(nou.filter(r=>r.sursa==="Retete cu carne").every(r=>!r.etichete.includes("vegetarian")),true,"retetele cu carne sunt in cartea cu carne");
 // utilizator ramas la versiunea 2 a cartilor: primeste doar retetele noi
 const man=JSON.parse(fs.readFileSync(dir+"/carti.json","utf8")),NEW=["Air fryer","Asiatic","Traditional romanesc","Mic dejun cu carne","Gustari","Peste"],old=T.getStored().filter(r=>!NEW.includes(r.capitol)).map(r=>Object.assign({},r,{liv:2})),bv={};
 man.carti.forEach(b=>{bv[b.sursa]={v:2,max:Math.max(...old.filter(r=>r.sursa===b.sursa).map(r=>r.nr))}});
 w=await boot({rbook:JSON.stringify(old),rbv:JSON.stringify(bv),rfav:JSON.stringify(["Retete cu carne|13"])},{names});T=w.__t;
 eq([T.getStored().length,T.getStored().filter(r=>r.capitol==="Air fryer").length],[tot,36],"actualizare de la versiunea veche a cartilor: cele 36 de retete se adauga");
 done()})();

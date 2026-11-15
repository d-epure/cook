/* 4.4.0: etichete automate (keto pe carbohidrati neti, gluten-free), tipul "metoda", linguri adunate cu grame. Rulare: node teste/test_4_4_0.js */
const {boot,eq,done,item}=require("./_boot.js");
(async()=>{
 const names=["BOOK","autoTags","netCarb","hasGluten","TAGS","addList","getList","putList","toG"];
 let w=await boot({},{names}),T=w.__t,B=T.BOOK;
 eq(T.TAGS.filter(t=>t.t==="metoda").map(t=>t.n),["meal-prep","air fryer","one pot"],"utilizator nou: meal-prep, air fryer si one pot au tipul metoda");
 eq(T.TAGS.find(t=>t.n==="gluten-free").auto,"gluten","gluten-free e eticheta automata");
 const ch=B.find(r=>/Budinca de chia cu lapte de migdale/.test(r.titlu));
 eq([ch.macro.carbo>=10,T.netCarb(ch)<10,T.autoTags(ch).includes("keto")],[true,true,true],"keto pe carbohidrati neti: budinca de chia (multe fibre) e keto");
 const g=t=>T.hasGluten({ingrediente:t.map(n=>({c:100,u:"g",n}))});
 eq([g(["orez","linte","foi de dafin"]),g(["faina"]),g(["faina de migdale","oua"]),g(["taitei de orez"]),g(["taitei"]),g(["sos de soia"]),g(["fulgi de ovaz"]),g(["fulgi de ovaz fara gluten"]),g(["pasta de rosii","orez"]),g(["paste integrale"]),g(["orz perlat"]),g([])],[false,true,false,false,true,true,true,false,false,true,true,null],"gluten: dupa ingrediente, prudent (ovazul si sosul de soia conteaza ca gluten)");
 const lin=B.find(r=>/Linte cu orez si legume/.test(r.titlu)),pst=B.find(r=>/Paste integrale la cuptor/.test(r.titlu));
 eq([T.autoTags(lin).includes("gluten-free"),T.autoTags(pst).includes("gluten-free")],[true,false],"eticheta apare pe retetele fara ingrediente cu gluten");
 // linguri + grame
 T.putList([]);T.addList([{c:5,u:"g",n:"ulei de masline"}],"A");T.addList([{c:2,u:"lingura",n:"ulei de masline"}],"B");
 let l=T.getList();const sp=T.toG("ulei de masline","lingura",2);eq([l.length,l[0].u,l[0].c,sp>20&&sp<35],[1,"g",5+sp,true],"linguri adaugate peste grame: un singur rand, in grame");
 T.putList([]);T.addList([{c:1,u:"lingura",n:"miere"}],"A");T.addList([{c:40,u:"g",n:"miere"}],"B");l=T.getList();
 eq([l.length,l[0].u,l[0].c,l[0].parts.map(p=>p.c).reduce((a,b)=>a+b,0)],[1,"g",40+T.toG("miere","lingura",1),40+T.toG("miere","lingura",1)],"grame adaugate peste linguri: randul trece in grame, pe retete ramane corect");
 T.putList([]);T.addList([{c:1,u:"lingura",n:"sos de soia"}],"A");T.addList([{c:2,u:"lingura",n:"sos de soia"}],"B");l=T.getList();eq([l.length,l[0].u,l[0].c],[1,"lingura",3],"doar linguri: raman linguri");
 // utilizator existent: tipul schimbat o singura data, eticheta lui gluten-free devine automata
 const old=[{n:"vegan",t:"dieta"},{n:"keto",t:"dieta",auto:"keto"},{n:"gluten-free",t:"dieta"},{n:"meal-prep",t:"dieta"},{n:"one pot",t:"bucatarie"}];
 w=await boot({rtags:JSON.stringify(old),rtv:"1"},{names,offline:true});T=w.__t;
 eq([T.TAGS.find(t=>t.n==="meal-prep").t,T.TAGS.find(t=>t.n==="one pot").t,T.TAGS.find(t=>t.n==="gluten-free").auto,T.TAGS.filter(t=>t.n==="gluten-free").length],["metoda","bucatarie","gluten","".length+1],"etichete salvate: meal-prep devine metoda, tipul schimbat de tine ramane, gluten-free devine automata fara dublura");
 done()})();

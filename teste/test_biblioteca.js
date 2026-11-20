/* Biblioteca: filtre si pilule, timp si dificultate, etichete automate, surse vechi, "Din debara". Rulare: node teste/test_biblioteca.js (sau node teste/toate.js pentru toate) */
const {boot,eq,done,sleep,item,supa,pan,dir,fs}=require("./_boot.js");
(async()=>{
 console.log("\n## "+'4.2.0: timp si dificultate, pilule in Biblioteca, aplicatia fara cheie API, cumparaturi.');
await (async()=>{
 console.log("\n## "+'4.20.0: copierea si trimiterea unei retete (text simplu).');
 const names=["BOOK","recTxt","show","openBook","drawBook"];
 const w=await boot({},{names}),T=w.__t,D=w.document;
 const r={sursa:"Retete keto",nr:214,titlu:"Supa crema de rosii keto",categorie:"Supe",portii:4,timp:35,ingrediente:[{c:800,u:"g",n:"rosii"},{c:1,u:"",n:"ceapa"},{g:"Crema",c:2,u:"linguri",n:"ulei de masline"}],pasi_carte:["Caleste ceapa 5 minute.","Fierbe 20 de minute."],macro:{kcal:289,proteine:5,carbo:20,grasimi:23}};
 const t=T.recTxt("b",r),L=t.split("\n");
 eq([L[0],L[1],t.includes("\nIngrediente\n- 800 g Rosii\n- 1 Ceapa\nCrema:\n- 2 linguri Ulei de masline"),t.includes("Mod de preparare\n1. Caleste ceapa 5 minute.\n2. Fierbe 20 de minute."),t.includes("Macro pe portie: 289 kcal, 5 g proteine"),t.endsWith("Din Retete keto, reteta 214")],["Supa crema de rosii keto","4 portii - 35 min",true,true,true,true],"textul retetei: titlu, portii si timp, ingrediente pe sectiuni, pasi, macro, sursa la final");
 eq(T.recTxt("b",Object.assign({},r,{sursa:"Retetele mele",nr:3})).endsWith("Retetele mele"),true,"reteta ta se semneaza 'Retetele mele'");
 eq(T.recTxt("s",{titlu:"Idee AI",portii:2,ingrediente:[{cantitate:2,unitate:"",nume:"oua"}],pasi:[{text:"Fierbe."}]}).endsWith("Generata cu AI"),true,"reteta generata se semneaza 'Generata cu AI'");
 T.BOOK.unshift(r);T.show("carti");T.openBook(0,4,"#bres");
 eq([!!D.querySelector("#bres [data-rcp]"),!!D.querySelector("#bres [data-rsh]")],[true,true],"pagina retetei are iconitele Copiaza si Trimite");
 let cp="";Object.defineProperty(w.navigator,"clipboard",{value:{writeText:x=>{cp=x;return Promise.resolve()}},configurable:true});
 D.querySelector("#bres [data-rcp]").click();await sleep(30);eq(cp.startsWith("Supa crema de rosii keto"),true,"Copiaza pune textul retetei in clipboard");
})();
await (async()=>{
 console.log("\n## "+'4.18.1: coada de verificare arata pozitia (reteta N din M) si etichete citibile.');
 const names=["BOOK","vqStart","show","drawBook","vx","VQ"];
 const w=await boot({},{names}),T=w.__t,D=w.document;
  w.Element.prototype.scrollIntoView=()=>{};
 T.BOOK[0].verifica=["ingrediente_neclare","ingrediente_rupte"];T.BOOK[0].cos=0;
 T.show("carti");T.drawBook();T.vqStart();
 const tx=(D.querySelector("#bres").textContent||"");
 eq([/reteta 1 din \d+/.test(tx),/ingrediente_/.test(tx),/ingrediente neclare, ingrediente rupte/.test(tx),/mai sunt/.test(tx)],[true,false,true,false],"coada de verificare: 'reteta 1 din M', fara coduri cu underscore");
})();
await (async()=>{
 const names=["stepMin","recT","recD","recTEst","tTxt","tChips","BOOK","drawBook","show","packTxt","drawList","putList","getList","keyUpd","drawOnb","editForm","editSave","getStored","bplOk","LS","bKey","toggleFav","isFav"];
 let w=await boot({rp:pan},{names}),T=w.__t,D=w.document,L=w.localStorage;
 // --- timp
 eq([T.stepMin("Fierbe 20 de minute."),T.stepMin("Coace 30-35 de minute."),T.stepMin("Rumeneste 2 minute pe fiecare parte."),T.stepMin("Lasa o ora la rece."),T.stepMin("Tine la frigider cel putin 6 ore, de preferat peste noapte."),T.stepMin("Mixeaza 30 sec."),T.stepMin("Coace la 190 de grade.")],[20,35,4,60,480,0.5,0],"minutele se citesc din pasi (interval, pe fiecare parte, ore, peste noapte; gradele nu sunt minute)");
 eq([T.tTxt(35),T.tTxt(60),T.tTxt(490)],["35 min","1 h","8 h 10 min"],"afisarea timpului");
 const all=T.BOOK;eq([all.length>700,all.every(r=>+r.timp>0),all.every(r=>["usor","mediu","avansat"].includes(r.dif))],[true,true,true],"toate retetele livrate au timp si dificultate");
 eq(all.filter(r=>!(r.sfaturi||[]).some(s=>/^Timpul de mai sus e doar cel de lucru/.test(s))).every(r=>T.recTEst(Object.assign({},r,{timp:undefined}))===r.timp),true,"timpul din fisiere e cel dat de regula din aplicatie (cu exceptia retetelor cu timp la rece, scris de mana)");
 const des=all.filter(r=>r.sursa==="Deserturi rapide");eq([des.every(r=>+r.activ>0),des.some(r=>(r.sfaturi||[]).some(x=>/Timp activ/.test(x))),des.every(r=>r.timp>=r.activ)],[true,false,true],"deserturi: timpul activ e camp, nu mai e text in sfaturi");
 const own={sursa:"Retetele mele",nr:9,titlu:"Proba",portii:2,ingrediente:[{c:200,u:"g",n:"orez"},{c:1,u:"lingurita",n:"sare"}],pasi_carte:["Fierbe orezul 15 minute.","Lasa-l acoperit 5 minute."],manual:true};
 eq([T.recT(own),T.recD(own),/aprox\. 25 min/.test(T.tChips(own))],[25,"usor",true],"reteta fara timp scris: estimat la afisare, marcat aprox.");
 own.timp=40;own.dif="mediu";eq([T.recT(own),T.recD(own),/aprox/.test(T.tChips(own)),/40 min/.test(T.tChips(own))],[40,"mediu",false,true],"timpul scris de tine are prioritate si nu mai e 'aprox.'");
 // --- pilule
 T.show("carti");T.drawBook();const pill=t=>[...D.querySelectorAll("#bpl .bpill")].find(b=>b.textContent===t),cnt=()=>+(D.querySelector("#bcnt").textContent.match(/(\d+) rete/)||[0,0])[1];
 eq([...D.querySelectorAll("#bpl .bpill")].map(b=>b.textContent),["Mic dejun","Pranz / Cina","Desert","Sub 30 min","Din debara","Favorite","Ale mele","Cos (0)"],"pilulele (5.0.0: si Ale mele, Cos)");
 const n0=cnt();pill("Sub 30 min").click();const n30=cnt();eq([n30>0&&n30<n0,n30===all.filter(r=>r.timp<=30).length,pill("Sub 30 min").classList.contains("on")],[true,true,true],"Sub 30 min filtreaza dupa timp");
 pill("Desert").click();const nd=cnt();eq(nd>0&&nd<n30,true,"pilulele se combina (Desert + Sub 30 min)");pill("Desert").click();pill("Sub 30 min").click();eq(cnt(),n0,"debifate, revin toate retetele");
 pill("Din debara").click();eq([D.querySelector("#bd").value,pill("Din debara").classList.contains("on")],["0",true],"'Din debara' apasa pe filtrul existent Din debara");pill("Din debara").click();eq(D.querySelector("#bd").value,"","si il scoate la a doua apasare");
 {const b0=cnt();pill("Favorite").click();const nf=cnt();eq([pill("Favorite").classList.contains("on"),nf<=b0,[...D.querySelectorAll("#bs option")].some(o=>/Favorite/.test(o.textContent))],[true,true,false],"4.19.0: Favorite e doar pilula; lista Carte nu mai are optiunea");pill("Favorite").click();eq([cnt(),pill("Favorite").classList.contains("on")],[b0,false],"a doua apasare il scoate");}
 {const r0=T.BOOK.find(r=>!r.cos&&!r.nou);if(!T.isFav(T.bKey(r0)))T.toggleFav(T.bKey(r0));pill("Favorite").click();const sb=D.querySelector("#bs");const only=cnt();sb.value=r0.sursa||"necunoscuta";sb.dispatchEvent(new w.Event("change",{bubbles:true}));const same=cnt();const other=[...sb.options].map(o=>o.value).find(v=>v&&v!==sb.value);sb.value=other;sb.dispatchEvent(new w.Event("change",{bubbles:true}));const none=cnt();eq([only>=1,same===only,none===0],[true,true,true],"Favorite se combina cu filtrul Carte (favorite dintr-o singura carte)");sb.value="";sb.dispatchEvent(new w.Event("change",{bubbles:true}));pill("Favorite").click();T.toggleFav(T.bKey(r0));}
 pill("Sub 30 min").click();eq(/aprox\. \d+ min/.test(D.querySelector("#bres").textContent),true,"timpul apare pe carduri");pill("Sub 30 min").click();
 // --- fara cheie API
 eq([D.body.classList.contains("nokey"),D.querySelector("#v-carti").classList.contains("hidden"),D.querySelector("#v-idei").classList.contains("hidden")],[true,false,false].map((x,i)=>i===2?true:x),"fara cheie: marcaj pe pagina, porneste in Biblioteca");
 L.setItem("rk","sk-ant-test");T.keyUpd();eq(D.body.classList.contains("nokey"),false,"cu cheie, marcajul dispare");L.removeItem("rk");T.keyUpd();
 const css=fs.readFileSync(dir+"/style.css","utf8");eq([/body\.nokey \[data-ai\]\{opacity:\.45\}/.test(css),/body:not\(\.nokey\) #nokey\{display:none\}/.test(css)],[true,true],"4.15.0: fara cheie, butoanele AI raman vizibile, gri");
 T.drawOnb();eq([/cheia API/i.test(D.querySelector("#onb").textContent),/Incarca-ti cartile/.test(D.querySelector("#onb").textContent)],[false,false],"Primul pas nu mai cere cheia si nici incarcarea cartilor");
 // --- cumparaturi
 eq([T.packTxt(item("faina","g",870)),T.packTxt(item("faina","g",1000)),T.packTxt(item("faina","g",1200)),T.packTxt(item("smantana 20%","ml",250)),T.packTxt(item("rosii conserva","g",400)),T.packTxt(item("faina de migdale","g",120)),T.packTxt(item("lapte","ml",300)),T.packTxt(item("somon","g",300)),T.packTxt(item("unt","lingura",2))],["1 kg","","2 kg","2 x 200 ml","","","1 l","",""],"sugestie de ambalaj doar unde are sens");
 T.putList([item("hrisca","g",100),item("malai","g",300)]);T.show("lista");T.drawList();const ll=D.querySelector("#ll");
 eq([!!ll.querySelector("#lDn"),!!ll.querySelector("#lAll"),!!ll.querySelector("details.lmore"),/cumperi 1 kg/.test(ll.textContent)],[true,false,false,true],"Sterge bifate e la vedere, Goleste lista nu mai exista; sugestia apare in lista");
 ll.querySelector("[data-ld]").click();D.querySelector("#lDn").click();eq(T.getList().map(x=>x.n),["malai"],"Sterge bifate scoate doar ce e bifat; restul ramane");
 })();
 console.log("\n## "+"4.4.0: etichete automate (keto pe carbohidrati neti, gluten-free), tipul 'metoda', linguri adunate cu grame.");
await (async()=>{
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
 })();
 console.log("\n## "+"4.8.1: sursele vechi '(de verificat)' se scot cand retetele exista deja in cartile livrate.");
await (async()=>{
 const ship=JSON.parse(fs.readFileSync(dir+"/carti/retete_cu_carne.json","utf8")).slice(0,3);
 const old=(r,s,n)=>Object.assign({},JSON.parse(JSON.stringify(r)),{sursa:s,nr:n});
 const rb=[old(ship[0],"Air fryer (de verificat)",1),old(ship[1],"Retete noi (de verificat)",2),old(ship[2],"Retete noi (de verificat)",3),{sursa:"Retete noi (de verificat)",nr:4,titlu:"Doar la mine, nu e in carti",categorie:"x",portii:2,ingrediente:[{c:1,u:"",n:"ou"}],pasi_carte:["a","b"],sfaturi:[],macro:{kcal:100,proteine:5,carbo:5,grasimi:5}}];
 const w=await boot({rbook:JSON.stringify(rb),rfav:JSON.stringify(["Retete noi (de verificat)|3"]),rbv:JSON.stringify({})},{names:["BOOK","getStored"],wait:1500}),T=w.__t;
 const S=T.getStored().filter(r=>/de verificat/.test(r.sursa)).map(r=>r.nr).sort();
 eq(S,[3,4],"copiile vechi care au deja pereche in carti se scot; cea cu favorita si cea fara pereche raman");
 const src=[...new Set(T.BOOK.map(r=>r.sursa))];
 eq([src.includes("Retete cu carne"),src.includes("Air fryer (de verificat)")],[true,false],"filtrul Carte nu mai are Air fryer (de verificat)");
 })();
 console.log("\n## "+"4.10.0: 'Din debara' = o singura pilula + rand 'Lipsesc cel mult'; lista din Filtre a disparut.");
await (async()=>{
 const pan=JSON.stringify(["ou","orez","ceapa","usturoi","rosii"].map(x=>({n:x,f:[]})));
 const w=await boot({rp:pan},{wait:1500,names:["show","drawBook"]}),D=w.document,T=w.__t,$=s=>D.querySelector(s);
 T.show("carti");T.drawBook();
 const pill=t=>[...D.querySelectorAll("#bpl .bpill")].find(b=>b.textContent===t),sub=()=>[...D.querySelectorAll("#bpl .bsub .bpill")].map(b=>b.textContent+(b.classList.contains("on")?"*":""));
 eq([$("#bd").tagName,$("#bd").type,!!D.querySelector("label[for=bd]")],["INPUT","hidden",false],"lista Din debara a disparut din Filtre");
 eq(sub(),[],"oprit: fara rand suplimentar");
 pill("Din debara").click();
 eq([pill("Din debara").classList.contains("on"),$("#bd").value,sub()],[true,"0",["0*","1","2","3"]],"pornit: implicit 'lipsesc 0', cu cele 4 alegeri");
 const n0=+($("#bcnt").textContent.match(/(\d+) rete/)||[0,0])[1];
 [...D.querySelectorAll("#bpl .bsub .bpill")].find(b=>b.textContent==="2").click();
 const n2=+($("#bcnt").textContent.match(/(\d+) rete/)||[0,0])[1];
 eq([$("#bd").value,n2>=n0,/cele mai potrivite primele/.test($("#bcnt").textContent)],["2",true,true],"alegerea 2 largeste rezultatele; ordinea dupa potrivire e anuntata");
 const miss=[...D.querySelectorAll("#bres .miss")].map(e=>+((e.textContent.match(/\((\d+)\)/)||[0,0])[1]));
 eq(miss.every((x,i)=>i===0||miss[i-1]<=x),true,"cele mai putine lipsuri primele");
 pill("Din debara").click();
 eq([$("#bd").value,sub()],["",[]],"oprit din nou: filtru scos si randul dispare");
 const w2=await boot({rp:"[]"},{wait:1500,names:["show","drawBook"]});w2.__t.show("carti");w2.localStorage.setItem("rp","[]");w2.__t.drawBook();
 [...w2.document.querySelectorAll("#bpl .bpill")].find(b=>b.textContent==="Din debara").click();
 eq(/Debaraua e goala/.test(w2.document.querySelector("#bpl").textContent),true,"debara goala: mesaj in loc de rezultate fara explicatie");
 })();
await (async()=>{
 console.log("\n## "+'5.5.0: ecranul retetei - Inapoi sus, cosul in Mai multe actiuni, micro la 100 g, etichete deschise, Notite.');
 const w=await boot({},{names:["BOOK","show","drawBook","openBook"]}),T=w.__t,D=w.document,$=q=>D.querySelector(q);
 w.Element.prototype.scrollIntoView=()=>{};
 const r={sursa:"Test 550",nr:1,titlu:"Supa test 550",categorie:"Supe",portii:4,ingrediente:[{c:800,u:"g",n:"rosii"},{c:1,u:"",n:"ceapa"},{c:2,u:"linguri",n:"ulei de masline"}],pasi_carte:["Fierbe."]};
 T.BOOK.unshift(r);T.show("carti");T.drawBook();
 eq([$("#bsearch").hidden,$("#bnewrow").hidden],[false,false],"lista de rezultate: cautarea se vede");
 T.openBook(0,4,"#bres");
 const bar=$("#bres .bv > .mb12");
 eq([$("#bsearch").hidden,$("#bnewrow").hidden,bar.querySelector("button").hasAttribute("data-bback")],[true,true,true],"reteta deschisa: cautarea ascunsa, primul buton e Inapoi");
 eq([!!bar.querySelector("[data-cosb]"),!!$("#bres details.mre [data-cosb]")],[false,true],"cosul de gunoi e in Mai multe actiuni, nu pe randul de sus");
 const sm=[...D.querySelectorAll("#bres details.mmic>summary")].map(x=>x.textContent);
 eq(sm,["Micronutrienti per portie","Micronutrienti la 100 g"],"micro la 100 g imediat sub cel per portie");
 const tg=()=>$("#bres details[data-tgd]");
 eq(tg().open,false,"etichetele pornesc inchise");
 tg().open=true;let cb=[...tg().querySelectorAll("input[data-tgb]")].find(x=>!x.checked&&!x.disabled);cb.checked=true;cb.dispatchEvent(new w.Event("change",{bubbles:true}));
 eq(tg().open,true,"dupa o bifa sectiunea Etichete ramane deschisa");
 cb=[...tg().querySelectorAll("input[data-tgb]")].find(x=>!x.checked&&!x.disabled);cb.checked=true;cb.dispatchEvent(new w.Event("change",{bubbles:true}));
 eq([tg().open,normT(r.etichete).length],[true,2],"a doua bifa: tot deschisa, doua etichete salvate");
 const jr=$("#bres .jr .jrh b").textContent;
 eq([jr,/Jurnal/.test($("#bres .jr").textContent)],["Notite",false],"caseta de jos se numeste Notite, fara Jurnal");
 $("#bres [data-bback]").click();
 eq([$("#bsearch").hidden,$("#bnewrow").hidden],[false,false],"inapoi la rezultate: cautarea revine");
 const r2=Object.assign({},r,{titlu:"Fara portii 550",nr:2,portii:null,pna:1});T.BOOK.unshift(r2);T.openBook(0,null,"#bres");
 eq([...D.querySelectorAll("#bres details.mmic>summary")].map(x=>x.textContent),["Micronutrienti la 100 g"],"fara portii: doar micro la 100 g");
 eq(tg().open,false,"alta reteta: etichetele pornesc din nou inchise");
 function normT(a){return(a||[]).filter(Boolean)}
})();
await (async()=>{
 console.log("\n## "+'5.6.0: Biblioteca goala la deschidere, 10 rezultate, titlul deschide reteta, "gatita 1 data", Debara pliabila, Inapoi sus.');
 const w=await boot({},{names:["BOOK","show","drawBook","ckTxt","drawPantry","addPan"]}),T=w.__t,D=w.document,$=q=>D.querySelector(q);
 w.Element.prototype.scrollIntoView=()=>{};
 T.show("carti");T.drawBook();
 eq([$("#bres .card"),/Cauta un ingredient/.test($("#bres").textContent),/^\d+ retete/.test($("#bcnt").textContent)],[null,true,true],"la deschidere: nicio reteta, doar indemnul si numarul total");
 const pill=t=>[...D.querySelectorAll("#bpl .bpill")].find(b=>b.textContent===t);
 pill("Pranz / Cina").click();
 eq(D.querySelectorAll("#bres .card button.tlk").length,10,"o pilula aleasa: primele 10 retete");
 $("#bres [data-bmore]").click();eq(D.querySelectorAll("#bres .card button.tlk").length,20,"Arata mai multe: inca 10");
 $("#bres .card button.tlk").click();eq([!!$("#bres [data-bback]"),$("#bsearch").hidden],[true,true],"titlul retetei o deschide");
 $("#bres [data-bback]").click();pill("Pranz / Cina").click();eq($("#bres .card"),null,"pilula scoasa: lista dispare din nou");
 eq([T.ckTxt(1),T.ckTxt(3),T.ckTxt(19),T.ckTxt(20),T.ckTxt(101)],["1 data","de 3 ori","de 19 ori","de 20 de ori","de 101 ori"],"gatita 1 data / de 3 ori / de 20 de ori");
 T.show("debara");T.drawPantry();const cats=[...D.querySelectorAll("#pl details.pcat")];
 eq([cats.length>0,cats.every(c=>!c.open)],[true,true],"Debara: categoriile sunt pliabile si pornesc stranse");
 $("#pin").value="sare";$("#pin").dispatchEvent(new w.Event("input"));
 eq([...D.querySelectorAll("#pl details.pcat")].every(c=>c.open),true,"la cautare, categoriile gasite sunt deschise");
 $("#pin").value="";$("#pin").dispatchEvent(new w.Event("input"));
 const c0=$("#pl details.pcat");c0.open=true;c0.dispatchEvent(new w.Event("toggle"));T.drawPantry();
 eq($("#pl details.pcat").open,true,"o categorie deschisa ramane deschisa dupa redesenare");
 eq(!!$("#totop"),true,"butonul Inapoi sus exista");
})();
await (async()=>{
 console.log("\n## "+'5.6.1: micronutrientii zilei si in Meniu, inclusiv la zilele viitoare.');
 const w=await boot({},{names:["BOOK","show","drawMenu","getMen","putMen","bKey","dKey","dAdd"]}),T=w.__t,D=w.document;
 const r=T.BOOK.find(x=>(x.ingrediente||[]).length>=4&&x.portii>0),d=T.dAdd(T.dKey(new Date()),1),m=T.getMen();
 m[d]={pranz:[{s:"b",k:T.bKey(r),t:r.titlu}]};T.putMen(m);T.show("meniu");T.drawMenu();
 const b=[...D.querySelectorAll("#mw [data-mtog]")].find(x=>x.dataset.day===d);if(b&&b.getAttribute("aria-expanded")!=="true")b.click();
 const mic=D.querySelector('#mw details.mmic[data-mico="n'+d+'"]');
 eq([!!mic,mic&&mic.querySelector("summary").textContent],[true,"Micronutrienti"],"zi viitoare din Meniu: Micronutrienti sub Macro");
})();
 done()})();

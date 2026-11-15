/* 4.2.0: timp si dificultate, pilule in Biblioteca, aplicatia fara cheie API, cumparaturi. Rulare: node teste/test_4_2_0.js */
const {boot,eq,done,item,pan,dir,fs}=require("./_boot.js");
(async()=>{
 const names=["stepMin","recT","recD","recTEst","tTxt","tChips","BOOK","drawBook","show","packTxt","drawList","putList","getList","keyUpd","drawOnb","editForm","editSave","getStored","bplOk","LS"];
 let w=await boot({rp:pan},{names}),T=w.__t,D=w.document,L=w.localStorage;
 // --- timp
 eq([T.stepMin("Fierbe 20 de minute."),T.stepMin("Coace 30-35 de minute."),T.stepMin("Rumeneste 2 minute pe fiecare parte."),T.stepMin("Lasa o ora la rece."),T.stepMin("Tine la frigider cel putin 6 ore, de preferat peste noapte."),T.stepMin("Mixeaza 30 sec."),T.stepMin("Coace la 190 de grade.")],[20,35,4,60,480,0.5,0],"minutele se citesc din pasi (interval, pe fiecare parte, ore, peste noapte; gradele nu sunt minute)");
 eq([T.tTxt(35),T.tTxt(60),T.tTxt(490)],["35 min","1 h","8 h 10 min"],"afisarea timpului");
 const all=T.BOOK;eq([all.length>700,all.every(r=>+r.timp>0),all.every(r=>["usor","mediu","avansat"].includes(r.dif))],[true,true,true],"toate retetele livrate au timp si dificultate");
 eq(all.every(r=>T.recTEst(Object.assign({},r,{timp:undefined}))===r.timp),true,"timpul din fisiere e cel dat de regula din aplicatie");
 const des=all.filter(r=>r.sursa==="Deserturi rapide");eq([des.every(r=>+r.activ>0),des.some(r=>(r.sfaturi||[]).some(x=>/Timp activ/.test(x))),des.every(r=>r.timp>=r.activ)],[true,false,true],"deserturi: timpul activ e camp, nu mai e text in sfaturi");
 const own={sursa:"Retetele mele",nr:9,titlu:"Proba",portii:2,ingrediente:[{c:200,u:"g",n:"orez"},{c:1,u:"lingurita",n:"sare"}],pasi_carte:["Fierbe orezul 15 minute.","Lasa-l acoperit 5 minute."],manual:true};
 eq([T.recT(own),T.recD(own),/aprox\. 25 min/.test(T.tChips(own))],[25,"usor",true],"reteta fara timp scris: estimat la afisare, marcat aprox.");
 own.timp=40;own.dif="mediu";eq([T.recT(own),T.recD(own),/aprox/.test(T.tChips(own)),/40 min/.test(T.tChips(own))],[40,"mediu",false,true],"timpul scris de tine are prioritate si nu mai e 'aprox.'");
 // --- pilule
 T.show("carti");T.drawBook();const pill=t=>[...D.querySelectorAll("#bpl .bpill")].find(b=>b.textContent===t),cnt=()=>+(D.querySelector("#bcnt").textContent.match(/(\d+) rete/)||[0,0])[1];
 eq([...D.querySelectorAll("#bpl .bpill")].map(b=>b.textContent),["Mic dejun","Pranz / Cina","Desert","Sub 30 min","Am tot in debara","Favorite"],"cele sase pilule");
 const n0=cnt();pill("Sub 30 min").click();const n30=cnt();eq([n30>0&&n30<n0,n30===all.filter(r=>r.timp<=30).length,pill("Sub 30 min").classList.contains("on")],[true,true,true],"Sub 30 min filtreaza dupa timp");
 pill("Desert").click();const nd=cnt();eq(nd>0&&nd<n30,true,"pilulele se combina (Desert + Sub 30 min)");pill("Desert").click();pill("Sub 30 min").click();eq(cnt(),n0,"debifate, revin toate retetele");
 pill("Am tot in debara").click();eq([D.querySelector("#bd").value,pill("Am tot in debara").classList.contains("on")],["0",true],"'Am tot in debara' apasa pe filtrul existent Din debara");pill("Am tot in debara").click();eq(D.querySelector("#bd").value,"","si il scoate la a doua apasare");
 pill("Favorite").click();eq(D.querySelector("#bs").value!=="",true,"'Favorite' apasa pe filtrul Carte");pill("Favorite").click();
 eq(/aprox\. \d+ min/.test(D.querySelector("#bres").textContent),true,"timpul apare pe carduri");
 // --- fara cheie API
 eq([D.body.classList.contains("nokey"),D.querySelector("#v-carti").classList.contains("hidden"),D.querySelector("#v-idei").classList.contains("hidden")],[true,false,false].map((x,i)=>i===2?true:x),"fara cheie: marcaj pe pagina, porneste in Biblioteca");
 L.setItem("rk","sk-ant-test");T.keyUpd();eq(D.body.classList.contains("nokey"),false,"cu cheie, marcajul dispare");L.removeItem("rk");T.keyUpd();
 const css=fs.readFileSync(dir+"/style.css","utf8");eq([/body\.nokey \[data-ai\][^{]*\{display:none!important\}/.test(css),/body:not\(\.nokey\) #nokey\{display:none\}/.test(css)],[true,true],"regulile care ascund butoanele AI exista in style.css");
 T.drawOnb();eq([/cheia API/i.test(D.querySelector("#onb").textContent),/Incarca-ti cartile/.test(D.querySelector("#onb").textContent)],[false,false],"Primul pas nu mai cere cheia si nici incarcarea cartilor");
 // --- cumparaturi
 eq([T.packTxt(item("faina","g",870)),T.packTxt(item("faina","g",1000)),T.packTxt(item("faina","g",1200)),T.packTxt(item("smantana 20%","ml",250)),T.packTxt(item("rosii conserva","g",400)),T.packTxt(item("faina de migdale","g",120)),T.packTxt(item("lapte","ml",300)),T.packTxt(item("somon","g",300)),T.packTxt(item("unt","lingura",2))],["1 kg","","2 kg","2 x 200 ml","","","1 l","",""],"sugestie de ambalaj doar unde are sens");
 T.putList([item("hrisca","g",100),item("malai","g",300)]);T.show("lista");T.drawList();const ll=D.querySelector("#ll");
 eq([!!ll.querySelector("#lDn"),!!ll.querySelector("#lAll"),!!ll.querySelector("details.lmore"),/cumperi 1 kg/.test(ll.textContent)],[true,true,false,true],"Sterge bifate si Goleste lista sunt la vedere; sugestia apare in lista");
 ll.querySelector("#lAll").click();eq(T.getList().length,0,"Goleste lista");
 done()})();

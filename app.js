/* Retete pe doua aparate - logica aplicatiei (vanilla JS, fara build).
   Datele stau in localStorage: rk cheie API, rm1/rm2b modele, ra aparate, rtags etichete,
   rs retete salvate, rfav favorite, rbook biblioteca incarcata (de la 2.0: in IndexedDB; rlib = marcaj in localStorage), rl cumparaturi, rmen meniu saptamanal, ru consum, rbk data ultimei copii.
   Cuprins (cauta "=====" sau comentariile de sectiune): etichete, favorite, aparate, setari, API,
   idei, reteta, validare/cronologie, randare reteta, biblioteca, favorite (ecran), consum, lista de cumparaturi,
   versiune, copie de siguranta.
   Regula de baza: orice text venit de la model sau din JSON trece prin esc() inainte de innerHTML. */
const $=s=>document.querySelector(s);
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){if(v!==undefined){try{toast("Nu am putut salva: memoria browserului e plina sau blocata. Descarca o copie de siguranta si sterge ce nu mai folosesti.")}catch(x){}}return null}};
const COL=["#1f9aa8","#a35bc4","#d2703d","#4f9a49","#4f7be8","#c75a7c","#a8975f"];
const DEF=[
{id:"MC",nume:"Monsieur Cuisine Smart",on:1,backup:0,strict:1,tmin:37,tmax:130,maxMin:99,maxMl:3000,moduri:"gatit, sotat, abur, framantat, mixat, tocat, sous vide, slow cook, cantarire",note:"taie, toaca, mixeaza, framanta, sosuri, supe-crema; treapta 1-10 sau turbo; sens normal/invers; max 3 l continut"},
{id:"Ninja",nume:"Ninja Foodi MAX 14-in-1",on:1,backup:0,strict:1,tmin:80,tmax:200,moduri:"Pressure Cook, Air Fry, Grill, Bake, Dehydrate, Prove, Sear/Saute, Steam, Slow Cook, Yoghurt, Steam Meals, Steam Air Fry, Steam Bake, Steam Bread",note:"crocant, air fry, gratar, copt, presiune, slow cook, abur; sonda digitala (sonda_c); la Pressure Cook scrie 'verifica presiunea in manual'"},
{id:"Thermomix",nume:"Thermomix TM6",on:1,backup:0,strict:1,tmin:37,tmax:120,maxMl:2200,moduri:"gatit, sotat, abur (Varoma), framantat, mixat, tocat, emulsionat, amestecat, slow cook, sous vide, fermentare, fierbator (kettle), cantarire",note:"taie, toaca, mixeaza, framanta, sosuri, supe-crema; treapta 0.5-10 sau turbo; sens normal/invers; Varoma pentru abur (vas separat, 3,3 l); slow cook pana la 8 h; fermentare 38-70 C pana la 12 h; temperaturi peste 120 C (rumenire, caramel) doar in retete ghidate Cookidoo, deci foloseste cel mult 120 C; max 2,2 l continut"},
{id:"aragaz",nume:"Aragaz pe gaz",on:1,backup:1,moduri:"foc mic, foc mediu, foc mare",note:"tigaie sau oala, fara temperatura exacta"},
{id:"fierbator",nume:"Fierbator de apa",on:1,backup:1,moduri:"fierbere apa",note:"apa fierbinte rapid"},
{id:"cuptor",nume:"Cuptor clasic pe gaz",on:1,backup:1,tmin:120,tmax:250,moduri:"copt",note:"temperatura aproximativa, fara ventilator"}];
let AP;try{AP=JSON.parse(LS("ra"))}catch(e){}if(!Array.isArray(AP)||!AP.length)AP=JSON.parse(JSON.stringify(DEF));
/* migrare: Thermomix adaugat in lista implicita (o singura data, daca lipseste) */
if(!LS("rdef2")){const k=AP.findIndex(a=>a&&a.id==="Thermomix");if(k>=0){const t=JSON.parse(JSON.stringify(DEF.find(a=>a.id==="Thermomix")));t.on=AP[k].on;AP[k]=t;LS("ra",JSON.stringify(AP))}LS("rdef2","1")}
if(!LS("rdef1")){if(!AP.some(a=>a&&a.id==="Thermomix")){const t=DEF.find(a=>a.id==="Thermomix"),i=AP.findIndex(a=>a&&a.id==="aragaz");AP.splice(i<0?AP.length:i,0,JSON.parse(JSON.stringify(t)));LS("ra",JSON.stringify(AP))}LS("rdef1","1")}
const saveAP=()=>LS("ra",JSON.stringify(AP));
const col=id=>{const i=AP.findIndex(a=>a.id===id);return i<0?"#a8975f":COL[i%COL.length]};
const tag=id=>`<span class="tag" style="--c:${col(id)}">${esc(id)}</span>`;
const esc=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let cur=null,mode="cron",SV=null,FV=null;const RC={};

/* ===== ETICHETE (lista centrala, normalizare, cautare) ===== */
const norm=s=>String(s||"").toLowerCase().replace(/(\w)\u00ee(?=\w)/g,"$1a").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const TDEF=[{n:"traditional romanesc",t:"bucatarie"},{n:"asiatic",t:"bucatarie"},{n:"vegan",t:"dieta"},{n:"vegetarian",t:"dieta"},{n:"high-protein",t:"dieta",auto:"protein"},{n:"keto",t:"dieta",auto:"keto"}];
let TAGS;try{TAGS=JSON.parse(LS("rtags"))}catch(e){}if(!Array.isArray(TAGS)||!TAGS.length)TAGS=JSON.parse(JSON.stringify(TDEF));
const saveTags=()=>LS("rtags",JSON.stringify(TAGS));
const tagNames=()=>TAGS.map(t=>t.n);
const canon=n=>{const k=norm(n),t=TAGS.find(x=>norm(x.n)===k||(x.al||[]).some(a=>norm(a)===k));return t?t.n:null};
const normTags=a=>[...new Set((a||[]).map(canon).filter(Boolean))];
function autoTags(r){const m=r.macro||{},s=[];TAGS.forEach(t=>{if(t.auto==="protein"&&m.proteine!=null&&m.proteine>=25)s.push(t.n);if(t.auto==="keto"&&m.carbo!=null&&m.carbo<10)s.push(t.n)});return s}
const tagPicker=(r,attr,note)=>{const au=new Set(autoTags(r)),on=new Set(normTags(r.etichete));
 return `<div class="muted" style="margin:10px 0 2px">${note||"Etichete"}</div><div class="chk">`+TAGS.map(t=>`<label><input type="checkbox" ${attr}="${esc(t.n)}"${on.has(t.n)||au.has(t.n)?" checked":""}${au.has(t.n)?" disabled":""}>${esc(t.n)}${au.has(t.n)?" (automat)":""}</label>`).join("")+`</div>`};

/* ===== FAVORITE SI CHEI DE IDENTIFICARE A RETETELOR ===== */
const getSaved=()=>{try{const j=JSON.parse(LS("rs")||"[]");return Array.isArray(j)?j:[]}catch(e){return[]}};
const getFav=()=>{try{const j=JSON.parse(LS("rfav"));return Array.isArray(j)?j:[]}catch(e){return[]}};
const isFav=k=>getFav().includes(k);
function toggleFav(k){const f=getFav(),i=f.indexOf(k);if(i<0)f.push(k);else f.splice(i,1);LS("rfav",JSON.stringify(f))}
const bKey=r=>(r.sursa||"necunoscuta")+"|"+(r.nr!=null?r.nr:r.titlu);
const sKey=r=>"salvat|"+r.titlu;
/* ajutoare de data (folosite de meniu, jurnal, filtre); definite devreme, ca sa existe la prima randare */
const ZILE=["Duminica","Luni","Marti","Miercuri","Joi","Vineri","Sambata"],LUNI=["ian","feb","mar","apr","mai","iun","iul","aug","sep","oct","nov","dec"];
const dKey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const dFrom=k=>{const[a,b,c]=k.split("-").map(Number);return new Date(a,b-1,c)};
const dAdd=(k,n)=>{const d=dFrom(k);d.setDate(d.getDate()+n);return dKey(d)};
const monOf=k=>{const d=dFrom(k);d.setDate(d.getDate()-(d.getDay()+6)%7);return dKey(d)};
const dLab=k=>{const d=dFrom(k);return ZILE[d.getDay()]+" "+d.getDate()+" "+LUNI[d.getMonth()]};
const clampP=v=>{v=+v;return isFinite(v)&&v>0?Math.min(99,v):1};
/* ===== Jurnal pe reteta: stele, notite, cand ai gatit-o ===== */
const getNotes=()=>{try{const j=JSON.parse(LS("rnote")||"{}");return j&&typeof j==="object"&&!Array.isArray(j)?j:{}}catch(e){return{}}};
const getNote=k=>{const n=getNotes()[k];return n&&typeof n==="object"?n:{}};
function setNote(k,patch){const a=getNotes(),n=Object.assign({},a[k],patch);n.h=(Array.isArray(n.h)?n.h:[]).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)).sort().slice(-100);
 if(!(n.st>0))delete n.st;if(!n.nt)delete n.nt;if(!n.h.length)delete n.h;
 if(Object.keys(n).length)a[k]=n;else delete a[k];LS("rnote",JSON.stringify(a))}
const fmtDay=k=>{const d=dFrom(k);return d.getDate()+" "+LUNI[d.getMonth()]+" "+d.getFullYear()};
const lastCooked=n=>(n.h&&n.h.length)?n.h[n.h.length-1]:null;
function jrLine(k){const n=getNote(k),st=+n.st||0,l=lastCooked(n);if(!st&&!l)return"";
 return`<div class="muted">${st?"\u2605".repeat(st)+"\u2606".repeat(5-st)+(l?" - ":""):""}${l?"gatita de "+n.h.length+(n.h.length===1?" data":" ori")+", ultima data "+esc(fmtDay(l)):""}</div>`}
function jrHtml(k){const n=getNote(k),st=+n.st||0,l=lastCooked(n);
 return`<div class="jr"><div class="jrh"><b>Jurnal</b><span class="stars" role="group" aria-label="Nota ta">${[1,2,3,4,5].map(i=>`<button type="button" class="star${i<=st?" on":""}" data-jst="${i}" aria-label="${i} din 5 stele" aria-pressed="${i<=st}">${i<=st?"\u2605":"\u2606"}</button>`).join("")}</span></div>
 <div class="muted">${l?"Gatita de "+n.h.length+(n.h.length===1?" data":" ori")+", ultima data "+esc(fmtDay(l))+".":"Nu ai marcat-o inca drept gatita."}</div>
 <div class="row" style="gap:8px;margin:6px 0"><button class="alt" data-jgat="1">Am gatit azi</button>${l?`<button class="alt" data-jundo="1">Anuleaza ultima gatire</button>`:""}</div>
 <div class="muted" style="margin-top:6px">Notite</div><textarea aria-label="Notite" data-jnt="1" maxlength="600" rows="2" placeholder="ex: mai putina sare, 5 minute in plus...">${esc(n.nt||"")}</textarea></div>`}
function jrAct(d,k){
 if(d.jst!==undefined){const n=getNote(k);setNote(k,{st:+n.st===+d.jst?0:+d.jst});return true}
 if(d.jgat!==undefined){setNote(k,{h:(getNote(k).h||[]).concat([dKey(new Date())])});return true}
 if(d.jundo!==undefined){setNote(k,{h:(getNote(k).h||[]).slice(0,-1)});return true}
 return false}
const favBtn=(k,txt,st)=>`<button class="alt${isFav(k)?" on":""}" data-fav="${esc(k)}" aria-pressed="${isFav(k)}"${st||""}>${isFav(k)?"★":"☆"} ${txt||"Favorita"}</button>`;
function showRecipe(){RC["#reteta"]={r:cur,kind:"gen"};show("idei");renderRecipe("#reteta");const el=$("#reteta");if(el.firstChild)el.scrollIntoView({behavior:"smooth",block:"start"})}

function show(v){document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"));$("#v-"+v).classList.remove("hidden");
 document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));syncNav(v);if(v==="salvate")renderSaved();if(v==="carti"&&($("#bd").value||pfOn()||_pfv!==(LS("rpf")||"")))drawBook();if(v==="fav")renderFav();if(v==="lista")drawList();if(v==="meniu")drawMenu();if(v==="debara")drawPantry();if(v==="setari"){drawPf();updPst();useDraw();renderCfg();renderTagCfg();updBS();setSub(LS("rk")?SUB:"cont")}bkBadge();if(v==="idei"){renderBox();drawOnb()}}
/* navigare in doua trepte: sectiuni (Gatesc / Retete / Planific / Setari) si pagini in sectiune */
const GROUPS={gat:["idei","carti"],ret:["fav","salvate"],plan:["meniu","lista","debara"],set:["setari"]},LASTV={};
const groupOf=v=>Object.keys(GROUPS).find(g=>GROUPS[g].includes(v))||"gat";
function syncNav(v){const g=groupOf(v);LASTV[g]=v;
 document.querySelectorAll("#gnav button").forEach(b=>{const on=b.dataset.g===g;b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on))});
 document.querySelectorAll("#nav button").forEach(b=>{b.hidden=!GROUPS[g].includes(b.dataset.v)});$("#nav").hidden=GROUPS[g].length<2}
$("#gnav").onclick=e=>{const g=e.target.dataset.g;if(!g)return;show(LASTV[g]||GROUPS[g][0])};
$("#nav").onclick=e=>{const v=e.target.dataset.v;if(!v)return;
 if(!$("#v-"+v).classList.contains("hidden")){if(v==="salvate")SV=null;if(v==="fav")FV=null;if(v==="carti")drawBook()}
 show(v)};


/* ===== APARATE (profile, setari, alegere) ===== */
/* aparate */
function renderBox(){const sel=new Set([...document.querySelectorAll("#apbox input:checked")].map(i=>i.value));
 $("#apbox").innerHTML=AP.filter(a=>a.on).map(a=>`<label><input type="checkbox" value="${esc(a.id)}" ${sel.has(a.id)?"checked":""}>${tag(a.id)}${esc(a.nume)}</label>`).join("");apSum()}
function apSum(){const c=[...document.querySelectorAll("#apbox input:checked")].map(i=>i.value),L=c.length?AP.filter(a=>c.includes(a.id)):AP.filter(a=>a.on);$("#apsum").innerHTML="<b>Aparate pentru adaptare:</b> "+(L.map(a=>esc(a.id)).join(", ")||"niciunul")+(c.length?"":" <span class=\"muted\">(implicit)</span>");syncAdp()}
/* adaptarea la aparate e activa doar daca e selectat un robot cu moduri de gatire (MC sau Thermomix) */
function hasRobot(){const c=[...document.querySelectorAll("#apbox input:checked")].map(i=>i.value),L=c.length?AP.filter(a=>c.includes(a.id)):AP.filter(a=>a.on);return L.some(a=>a.id==="MC"||a.id==="Thermomix")}
function syncAdp(){const ok=hasRobot();document.querySelectorAll("[data-adp]").forEach(b=>{if(!b.dataset.busy)b.disabled=!ok});document.querySelectorAll(".adphint").forEach(h=>h.hidden=ok)}
$("#apbox").addEventListener("change",apSum);
function renderCfg(){
 $("#apcfg").innerHTML=AP.map((a,i)=>`<div class="apr">${tag(a.id)}<b>${esc(a.nume)}</b><label><input type="checkbox" data-t="on" data-i="${i}" ${a.on?"checked":""}> activ</label><label><input type="checkbox" data-t="backup" data-i="${i}" ${a.backup?"checked":""}> backup</label><button class="alt" data-x="${i}">Elimina</button></div>`).join("")+
 `<h2 style="margin-top:16px">Aparat nou</h2><label for="nn">Nume</label><input id="nn" placeholder="ex: Cuptor electric">
 <div class="row"><div><label for="nt1">Temp min (C)</label><input id="nt1" type="number"></div><div><label for="nt2">Temp max (C)</label><input id="nt2" type="number"></div></div>
 <label for="nm">Moduri (separate prin virgula)</label><input id="nm" placeholder="ex: copt, grill">
 <label for="no">Ce face / limite</label><input id="no" placeholder="ex: capacitate 30 l, fara abur">
 <label style="font-weight:400"><input id="nb" type="checkbox" style="width:auto"> doar backup</label><button class="go" id="bAdd">Adauga aparat</button>`}
$("#apcfg").onclick=e=>{const d=e.target.dataset;
 if(d.x!==undefined){const b=e.target;if(b.dataset.arm!=="1"){b.dataset.arm="1";b.textContent="Confirma";setTimeout(()=>{if(b.isConnected){b.dataset.arm="";b.textContent="Elimina"}},4000);return}AP.splice(d.x,1);saveAP();renderCfg()}
 if(e.target.id==="bAdd"){const n=$("#nn").value.trim();if(!n)return;let id=n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"ap"+AP.length;while(AP.some(a=>a.id===id))id+="2";
  AP.push({id,nume:n,on:1,backup:$("#nb").checked?1:0,tmin:+$("#nt1").value||0,tmax:+$("#nt2").value||0,moduri:$("#nm").value.trim(),note:$("#no").value.trim()});saveAP();renderCfg()}};
$("#apcfg").onchange=e=>{const d=e.target.dataset;if(d.t){AP[d.i][d.t]=e.target.checked?1:0;saveAP()}};
const apText=l=>l.map(a=>`- ${a.id} (${a.nume}, ${a.backup?"DOAR BACKUP":"preferat"}): ${a.note||""}. Moduri: ${a.moduri||"orice"}.${a.tmax?" Temp "+a.tmin+"-"+a.tmax+" C.":""}`).join("\n");
const pick=()=>{const s=[...document.querySelectorAll("#apbox input:checked")].map(i=>i.value);return s.length?AP.filter(a=>s.includes(a.id)):AP.filter(a=>a.on)};
const RULE="Foloseste aparatele preferate oricand pot face pasul. Aparatele backup doar daca un aparat preferat nu poate face pasul (ex. apa fiarta, tigaie) sau daca nu exista altul.";

/* setari */
$("#key").value=LS("rk")||"";$("#m1").value=LS("rm1")||"claude-haiku-4-5";$("#m2").value=LS("rm2b")||"claude-haiku-4-5";
$("#bSet").onclick=()=>{LS("rk",$("#key").value.trim());LS("rm1",$("#m1").value.trim());LS("rm2b",$("#m2").value.trim());$("#bSet").textContent="Salvat";setTimeout(()=>$("#bSet").textContent="Salveaza setarile",1200)};

/* API */
let ABORT=null;
function apiErr(status,j,model){const m=(j&&j.error&&j.error.message)||"",t=(j&&j.error&&j.error.type)||"";
 if(/web.?search/i.test(m))return"Cautarea web nu este disponibila pentru contul sau modelul tau. Verifica in consola Anthropic ca este activata, sau foloseste Genereaza idei.";
 if(status===401)return"Cheia API nu e valida sau a fost revocata. Verific-o in Setari.";
 if(status===403)return"Cheia nu are voie sa foloseasca acest model sau serviciu.";
 if(status===404)return`Modelul "${model}" nu exista sau nu e disponibil pentru cheia ta. Corecteaza numele in Setari.`;
 if(status===429)return"Prea multe cereri sau ai atins limita de cheltuieli. Asteapta putin sau verifica limitele in consola Anthropic.";
 if(status===400&&/credit/i.test(m))return"Credit insuficient in contul Anthropic. Adauga credit in consola.";
 if(status===413)return"Cererea e prea mare. Scurteaza lista de ingrediente.";
 if(status===529||status>=500)return"Serviciul Anthropic e suprasolicitat sau are probleme. Incearca din nou peste cateva secunde.";
 return"Eroare "+status+(t?" ("+t+")":"")+(m?": "+m:"")}
async function ask(model,system,user,max,temp,tools,_retry){
 const key=LS("rk");if(!key)throw new Error("Adauga cheia API in Setari.");
 ABORT=new AbortController();let r,j;
 try{r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",signal:ABORT.signal,headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify(Object.assign({model,max_tokens:max,temperature:temp,system,messages:[{role:"user",content:user}]},tools?{tools}:{}))});
  j=await r.json().catch(()=>({}))}
 catch(e){if(e.name==="AbortError")throw new Error("Anulat.");throw new Error("Nu pot contacta Anthropic. Verifica conexiunea la internet.")}
 finally{ABORT=null}
 if(j.usage)useAdd(j.usage);if(!r.ok)throw new Error(apiErr(r.status,j,model));
 if(j.stop_reason==="pause_turn")throw new Error("Cautarea web a durat prea mult. Incearca din nou.");
 const t=(j.content||[]).filter(c=>c.type==="text").map(c=>c.text||"").join("");const a=t.indexOf("{"),b=t.lastIndexOf("}");
 if(a<0)throw new Error("Raspuns fara continut util. Incearca din nou.");
 try{return JSON.parse(t.slice(a,b+1))}catch(x){if(j.stop_reason==="max_tokens"&&!_retry&&max<8000)return ask(model,system,user,Math.min(max*2,8000),temp,tools,true);throw new Error(j.stop_reason==="max_tokens"?"Raspunsul a fost taiat (reteta prea lunga). Incearca din nou sau alege alta idee.":"Raspunsul modelului nu a fost valid. Incearca din nou.")}
}
/* reguli pentru model: doar cele relevante pentru aparatele bifate (mai putini tokeni) */
function rulesFor(L,n){
 const rb=L.filter(a=>a.id==="MC"||a.id==="Thermomix"),nj=L.some(a=>a.id==="Ninja"),th=rb.some(a=>a.id==="Thermomix");
 let t="Reguli de scriere: romana corecta, FARA diacritice si fara cuvinte inventate sau gresite (verifica fiecare cuvant; foloseste verbe uzuale: toaca, taie, amesteca, framanta, mixeaza, caleste, fierbe, coace, scurge). Fiecare pas incepe cu un verb la imperativ si contine o singura actiune. Un pas repetat (ex. a doua tura de tocat) este un pas separat cu propriile valori. Foloseste exact ingredientele si cantitatile din reteta, fara a inventa altele. Nu lasa texte care nu sunt propozitii complete.";
 if(rb.length){const ml=Math.min(...rb.map(a=>a.maxMl||3000)),mm=rb.map(a=>a.maxMin).filter(Boolean);
  t+=` Pasii pe ${rb.map(a=>a.id).join(" sau ")} au obligatoriu mod, durata_min, treapta (${th?"0.5":"1"}-10 sau \"turbo\") si sens \"normal\"/\"invers\"; la taiat, tocat sau mixat precizeaza treapta si durata (ex. 'Toaca ardeii 5 sec, treapta 5'), nu scrie doar 'fin' fara valori. Volum_ml continut maxim ${ml}${mm.length?", maxim "+Math.min(...mm)+" min pe pas":""}.`}
 if(nj)t+=` Pasii pe Ninja au mod, temp si durata_min. Nu inventa valori de presiune; la presiune scrie in avertismente sa verifice manualul.`;
 t+=` Pasi fara aparat = aparat "manual". Pune pasi in paralel unde se poate, cu depinde_de pentru ordine. Maxim ${n} pasi, fiecare text sub 25 de cuvinte.`;
 return t}
const SYS="Esti un bucatar practic care adapteaza retete la aparate. Scrii in romana, FARA diacritice. Raspunzi DOAR cu JSON valid, fara text in plus.";
function timer(b,txt){const t0=Date.now(),bar=$("#busy");const up=()=>{const sec=Math.round((Date.now()-t0)/1000);b.textContent=txt+" "+sec+"s";$("#busyt").textContent=txt+" "+sec+"s"};
 bar.classList.remove("hidden");up();const i=setInterval(up,500);return()=>{clearInterval(i);bar.classList.add("hidden")}}
let TT=0;function toast(m){const el=$("#toast");el.textContent=m;el.classList.remove("hidden");clearTimeout(TT);TT=setTimeout(()=>el.classList.add("hidden"),8000)}
function fail(e){$("#eIdei").textContent=e.message;if(e.message!=="Anulat.")toast(e.message)}

/* consum (estimare locala, doar in acest browser) */
const useGet=()=>{try{return Object.assign({n:0,i:0,o:0},JSON.parse(LS("ru")))}catch(e){return{n:0,i:0,o:0}}};
function useAdd(u){const x=useGet();x.n++;x.i+=u.input_tokens||0;x.o+=u.output_tokens||0;LS("ru",JSON.stringify(x))}
function useDraw(){const x=useGet();$("#usg").innerHTML=x.n?`Consum inregistrat de aplicatie: ${x.n} apeluri, ${x.i.toLocaleString("ro-RO")} tokeni trimisi, ${x.o.toLocaleString("ro-RO")} tokeni primiti. <button class="alt" id="bUr" style="padding:2px 8px">Reseteaza</button><br>Valoare orientativa; suma reala o vezi in consola Anthropic.`:"Consum inregistrat de aplicatie: inca niciun apel."}
$("#usg").onclick=e=>{if(e.target.id==="bUr"){LS("ru","");useDraw()}};
/* idei */
let WEBM=false;
const safeUrl=u=>/^https?:\/\/[^\s"<>]+$/i.test(u||"")?u:"";
async function getIdeas(add,b,web){
 if(web===undefined)web=add?WEBM:false;WEBM=web;
 const ing=$("#ing").value.trim();$("#eIdei").textContent="";if(!ing){$("#eIdei").textContent="Scrie cel putin un ingredient.";return}
 const l=pick();if(!l.length){$("#eIdei").textContent="Bifeaza cel putin un aparat.";return}
 const old=add?(window._idei||[]):[];const lbl=b.textContent;const bbs=[$("#bIdei"),$("#bWeb")];bbs.forEach(x=>x.disabled=true);b.disabled=true;const stop=timer(b,web?(add?"Mai caut pe web...":"Caut pe web..."):(add?"Mai caut...":"Caut idei..."));
 try{
  const u=`Ingrediente date: ${ing}. Presupune ca exista mereu: sare, piper, ulei, apa, faina, zahar, condimente uzuale.
Propune 6 retete CUNOSCUTE, simple, de casa (bucatarie romaneasca sau europeana clasica), cu nume uzual. FIECARE reteta trebuie sa aiba ingredientele date ca ingredient principal (daca e un singur ingredient, toate retetele sunt cu el). Maxim 2 ingrediente lipsa pe reteta, ieftine si obisnuite. Fara fuziune sau combinatii exotice. Portii: ${$("#por").value}. Timp total maxim: ${$("#tmax").value} min.${old.length?"\nNu repeta si nu varia usor aceste retete: "+old.map(x=>x.titlu).join("; ")+".":""}
${lblRule()}
Aparate:\n${apText(l)}\n${RULE}
Format: {"idei":[{"titlu":"","timp_total_min":0,"ai":[""],"lipsesc":[""],"aparate":["id"],"etichete":[""]}]}`;
  let r;
  if(web){const uw=`Cauta pe web retete reale care folosesc ingredientele: ${ing}. Presupune ca exista mereu: sare, piper, ulei, apa, faina, zahar, condimente uzuale.
Alege 6 retete simple, de casa, din surse DIFERITE (site-uri de retete cunoscute), fiecare cu ingredientele date ca ingredient principal. Maxim 2 ingrediente lipsa pe reteta. Portii: ${$("#por").value}. Timp total maxim: ${$("#tmax").value} min.${old.length?"\nNu repeta: "+old.map(x=>x.titlu).join("; ")+".":""}
${lblRule()}
Aparate:\n${apText(l)}\n${RULE}
Titlul retetei in romana, fara diacritice. "rezumat": 3-4 propozitii in cuvintele tale (NU copia textul sursei) cu ingredientele cheie si pasii principali. "url" trebuie sa fie adresa reala a paginii gasite, nu inventa adrese.
Raspunde DOAR cu JSON: {"idei":[{"titlu":"","timp_total_min":0,"ai":[""],"lipsesc":[""],"aparate":["id"],"etichete":[""],"url":"","sursa_nume":"","rezumat":""}]}`;
   r=await ask($("#m1").value||"claude-haiku-4-5",SYS,uw,5000,0.3,[{type:"web_search_20250305",name:"web_search",max_uses:3}]);
   r.idei=(r.idei||[]).map(x=>Object.assign(x,{url:safeUrl(x.url)}));}
  else r=await ask($("#m1").value||"claude-haiku-4-5",SYS,u,2500,0.4);
  const nou=Array.isArray(r.idei)?r.idei.filter(x=>x&&typeof x==="object"&&x.titlu):[];if(!nou.length)throw new Error("Modelul nu a returnat idei valide. Incearca din nou.");
  window._idei=old.concat(nou).slice(0,30);drawIdei();
 }catch(e){fail(e)}
 stop();bbs.forEach(x=>x.disabled=false);b.disabled=false;b.textContent=lbl;
}
function drawIdei(){
 const L=window._idei||[];
 $("#idei").innerHTML=`<div class="grid">`+L.map((x,i)=>`<div class="card"><h2>${esc(x.titlu)}</h2><div>${(x.aparate||[]).map(tag).join("")}<span class="muted">${esc(x.timp_total_min)} min</span></div><div>${lbH(x.etichete)}</div>${x.url?`<p class="muted" style="margin:4px 0">Sursa: <a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.sursa_nume||x.url)}</a></p>`:""}<p class="muted">Ai: ${esc((x.ai||[]).join(", "))||"-"}<br>Iti lipsesc: ${esc((x.lipsesc||[]).join(", "))||"nimic"}</p><button class="go" data-i="${i}">Alege reteta</button></div>`).join("")+`</div>`+(L.length<30?`<button class="alt" id="bMore">Mai multe idei (${L.length}/30)</button>`:`<p class="muted">Ai ajuns la 30 de idei. Schimba ingredientele pentru altele.</p>`);
}
$("#bIdei").onclick=()=>getIdeas(false,$("#bIdei"),false);
$("#bWeb").onclick=()=>getIdeas(false,$("#bWeb"),true);
$("#idei").onclick=e=>{if(e.target.id==="bMore")return getIdeas(true,e.target);const i=e.target.dataset.i;if(i!==undefined)makeRecipe(window._idei[i],e.target)};

/* reteta */
async function makeRecipe(idea,btn){
 btn.disabled=true;const stop=timer(btn,"Scriu reteta...");
 const u=`Reteta: "${idea.titlu}" pentru ${$("#por").value} portii.${idea.rezumat?` Se bazeaza pe o reteta de pe web (${idea.sursa_nume||"sursa"}). Rezumat: ${idea.rezumat} Reformuleaza in cuvintele tale si adapteaza la aparate; nu copia textul sursei.`:""} Ingrediente ale utilizatorului: ${$("#ing").value}.
${lblRule()}
Aparate:\n${apText(pick())}\n${RULE}
${rulesFor(pick(),9)}
Format: {"titlu":"","portii":0,"ingrediente":[{"nume":"","cantitate":0,"unitate":""}],"pasi":[{"id":"p1","text":"","aparat":"id|manual","mod":"","temp":0,"treapta":"","sens":"","sonda_c":0,"volum_ml":0,"durata_min":0,"depinde_de":["id"]}],"avertismente":[""],"etichete":[""]}`;
 try{cur=await ask($("#m2").value||"claude-haiku-4-5",SYS,u,3500,0.3);cur.etichete=normTags(cur.etichete&&cur.etichete.length?cur.etichete:idea.etichete);if(idea.url)cur.sursa_web={url:idea.url,nume:idea.sursa_nume||""};showRecipe()}
 catch(e){fail(e)}
 stop();btn.disabled=false;btn.textContent="Alege reteta";
}

/* validare */
function check(s){
 const w=[],a=AP.find(x=>x.id===s.aparat);if(!a)return w;
 const t=+s.temp;if(t&&a.tmax&&(t<a.tmin||t>a.tmax))w.push(`Temperatura ${t} C e in afara intervalului ${a.tmin}-${a.tmax} C.`);
 if(a.strict&&s.mod&&!a.moduri.split(",").some(m=>m.trim().toLowerCase()===String(s.mod).toLowerCase()))w.push(`Modul "${s.mod}" nu exista pe acest aparat.`);
 if(a.maxMin&&+s.durata_min>a.maxMin)w.push(`Peste ${a.maxMin} min pe pas.`);
 if(a.maxMl&&+s.volum_ml>a.maxMl)w.push(`Peste ${a.maxMl/1000} l in vas.`);
 if(a.id==="MC"||a.id==="Thermomix"){const tr=String(s.treapta||"").toLowerCase(),lo=a.id==="Thermomix"?0.5:1;if(tr&&tr!=="turbo"&&!(+tr>=lo&&+tr<=10))w.push("Treapta trebuie sa fie "+lo+"-10 sau turbo.")}
 if((a.id==="MC"||a.id==="Thermomix")&&/toc|mix|framant|taie|emuls|tritur/i.test((s.text||"")+" "+(s.mod||""))&&(!s.treapta||!+s.durata_min))w.push("Pasul nu are treapta sau durata: verifica reteta din carte.");
 if(a.id==="Ninja"&&!+s.durata_min&&s.mod)w.push("Pasul nu are durata: verifica reteta din carte.");
 if(/pressure/i.test(s.mod||""))w.push("Verifica presiunea si timpul in manual.");
 if(a.backup)w.push("Aparat backup: rezultatul poate diferi.");
 return w;
}
function timeline(steps){
 const end={},free={};
 steps.forEach(s=>{let st=0;(s.depinde_de||[]).forEach(d=>{if(end[d]!=null)st=Math.max(st,end[d])});
  if(s.aparat!=="manual"&&AP.some(a=>a.id===s.aparat)){st=Math.max(st,free[s.aparat]||0)}
  s._s=Math.round(st*10)/10;s._e=Math.round((s._s+(+s.durata_min||0))*10)/10;end[s.id]=s._e;if(s.aparat!=="manual")free[s.aparat]=s._e});
 return [...steps].sort((a,b)=>a._s-b._s);
}
function params(s){
 const a=[];if(s.mod)a.push(s.mod);if(+s.durata_min)a.push(+(+s.durata_min).toFixed(1)+" min");if(+s.temp)a.push(s.temp+" C");
 if(s.aparat==="MC"||s.aparat==="Thermomix"){if(s.treapta)a.push("treapta "+s.treapta);if(s.sens&&s.sens!=="normal")a.push("sens "+s.sens)}
 if(+s.sonda_c)a.push("sonda "+s.sonda_c+" C");return a.join(" - ");
}
function stepHtml(s,showMin,par){
 return `<div class="step" style="--c:${col(s.aparat)}"><div><div class="min">${showMin?"min "+Math.round(s._s):""}</div>${tag(s.aparat)}</div><div>${esc(s.text)}<div class="par">${par?"in paralel cu alt aparat - ":""}${esc(params(s))}</div>${check(s).map(x=>`<div class="warn">${esc(x)}</div>`).join("")}</div></div>`;
}
function renderRecipe(sel){
 const c=RC[sel];if(!c||!$(sel))return;const r=c.r,tl=timeline(r.pasi||[]),tot=Math.max(0,...tl.map(s=>s._e)),ids=[...new Set(tl.map(s=>s.aparat))];let body;
 if(mode==="cron")body=tl.map(s=>stepHtml(s,true,tl.some(o=>o!==s&&o.aparat!==s.aparat&&o.aparat!=="manual"&&s.aparat!=="manual"&&o._s<s._e&&o._e>s._s))).join("");
 else body=ids.map(a=>`<h2>${tag(a)}</h2>`+tl.filter(s=>s.aparat===a).map(s=>stepHtml(s,false)).join("")).join("");
 const top=c.kind==="saved"?`<div style="margin-bottom:10px"><button class="alt" data-rback="1">Inapoi la lista</button> ${favBtn(sKey(r))}</div>`:"";
 const save=c.kind==="gen"?`<button class="go" id="bSave" style="margin:0">Salveaza</button>`:"";
 $(sel).innerHTML=top+`<div class="card"><h2>${esc(r.titlu)}</h2><div class="muted">${esc(r.portii)} portii - aprox. ${Math.round(tot)} min</div>${r.din_carte?`<div class="muted">Adaptata din: ${esc(r.din_carte)} (reteta din carte ramane neschimbata)</div>`:""}<div style="margin-top:6px">${lbH(r.etichete)}</div>${r.sursa_web&&safeUrl(r.sursa_web.url)?`<div class="muted">Inspirata de: <a href="${esc(r.sursa_web.url)}" target="_blank" rel="noopener noreferrer">${esc(r.sursa_web.nume||r.sursa_web.url)}</a> (adaptata, nu copiata)</div>`:""}
 <ul class="ing">${(r.ingrediente||[]).map(i=>`<li>${esc(i.cantitate)} ${esc(i.unitate)} ${esc(i.nume)}</li>`).join("")}</ul>
 ${(r.avertismente||[]).map(x=>`<div class="warn">${esc(x)}</div>`).join("")}
 ${tagPicker(r,"data-tgr",c.kind==="gen"?"Etichete (se salveaza odata cu reteta)":"Etichete")}${c.kind!=="gen"?jrHtml(sKey(r)):""}
 <div class="row" style="margin-top:12px"><button class="alt${mode==='cron'?' on':''}" aria-pressed="${mode==='cron'}" data-m="cron">Cronologie</button><button class="alt${mode==='ap'?' on':''}" aria-pressed="${mode==='ap'}" data-m="ap">Pe aparat</button>${save}<button class="alt" data-cum="1">Adauga la cumparaturi</button><button class="alt" data-mn="1">Adauga la meniu</button><button class="alt" data-cook="1">Mod gatit</button></div></div><div class="card">${body}</div>`;
}
function saveGen(btn){const r=JSON.parse(JSON.stringify(cur));r.etichete=normTags(r.etichete);
 let l=getSaved();const ex=l.find(x=>sKey(x)===sKey(r));
 if(ex&&JSON.stringify(ex.pasi)!==JSON.stringify(r.pasi)){let n=2,t=r.titlu;while(l.some(x=>x.titlu===t+" ("+n+")"))n++;r.titlu=t+" ("+n+")"}
 l=l.filter(x=>sKey(x)!==sKey(r));l.unshift(r);
 if(l.length>200){toast("Ai peste 200 de retete salvate: cea mai veche a fost stearsa.");l=l.slice(0,200)}
 LS("rs",JSON.stringify(l));btn.textContent="Salvat"}
function rcClick(e,sel){const c=RC[sel];if(!c)return false;const d=e.target.dataset;
 if(c.kind!=="gen"&&jrAct(d,sKey(c.r))){renderRecipe(sel);return true}
 if(d.m){mode=d.m;renderRecipe(sel);return true}
 if(d.rback!==undefined){if(c.back)c.back();return true}
 if(d.fav!==undefined){toggleFav(d.fav);renderRecipe(sel);return true}
 if(e.target.id==="bSave"){saveGen(e.target);return true}
 if(d.cook!==undefined){cookOpen(c.r.titlu,cookSteps(c.r,"g"),ingGen(c.r));return true}
 if(d.mn!==undefined){let r=c.r;if(c.kind==="gen"){cur=r;saveGen({});r=getSaved()[0]||r}menOpen({s:"s",r});return true}
 if(d.cum!==undefined){const n=addList((c.r.ingrediente||[]).map(x=>({c:x.cantitate,u:x.unitate,n:x.nume})),c.r.titlu);e.target.textContent="Adaugat ("+n+") - vezi Cumparaturi";return true}
 return false}
function rcChange(e,sel){const c=RC[sel],n=e.target.dataset.tgr;if(c&&c.kind!=="gen"&&e.target.dataset.jnt!==undefined){setNote(sKey(c.r),{nt:e.target.value.slice(0,600)});return true}
 if(!c||n===undefined)return false;
 const a=new Set(normTags(c.r.etichete));e.target.checked?a.add(n):a.delete(n);c.r.etichete=[...a];
 if(c.kind==="saved"){const l=getSaved(),i=l.findIndex(x=>sKey(x)===sKey(c.r));if(i>=0){l[i].etichete=c.r.etichete;LS("rs",JSON.stringify(l))}}
 renderRecipe(sel);return true}
$("#reteta").onclick=e=>{rcClick(e,"#reteta")};
$("#reteta").onchange=e=>{rcChange(e,"#reteta")};
function renderSaved(){
 if(SV){const r=getSaved().find(x=>sKey(x)===SV);
  if(r){RC["#salvate"]={r,kind:"saved",back:()=>{SV=null;renderSaved()}};$("#sfilt").style.display="none";renderRecipe("#salvate");return}SV=null}
 RC["#salvate"]=null;$("#sfilt").style.display="";
 const all=getSaved(),f=$("#fs").value;const l=all.map((r,i)=>[r,i]).filter(([r])=>!f||normTags(r.etichete).includes(f));
 $("#salvate").innerHTML=l.length?l.map(([r,i])=>`<div class="card"><h2>${esc(r.titlu)}</h2><div>${[...new Set((r.pasi||[]).map(s=>s.aparat))].map(tag).join("")}</div><div>${lbH(r.etichete)}</div>${jrLine(sKey(r))}<button class="alt" data-o="${i}">Deschide</button> ${favBtn(sKey(r))} <button class="alt" data-d="${i}">Sterge</button></div>`).join(""):'<p class="muted">Nu ai retete de afisat. Alege o idee si apasa Salveaza.</p>';
}
$("#fs").onchange=renderSaved;
$("#salvate").onclick=e=>{if(rcClick(e,"#salvate"))return;const l=getSaved(),d=e.target.dataset;
 if(d.fav!==undefined){toggleFav(d.fav);renderSaved();return}
 if(d.o!==undefined){const r=l[d.o];if(r){SV=sKey(r);renderSaved();window.scrollTo(0,0)}}
 if(d.d!==undefined){l.splice(d.d,1);LS("rs",JSON.stringify(l));renderSaved()}};
$("#salvate").onchange=e=>{rcChange(e,"#salvate")};
const lbH=a=>normTags(a).map(x=>`<span class="lb">${esc(x)}</span>`).join("");
function lblRule(){const s=[...document.querySelectorAll("#lbbox input:checked")].map(i=>i.value),isC=n=>{const t=TAGS.find(x=>x.n===n);return t&&t.t==="bucatarie"},c=s.filter(isC),d=s.filter(x=>!isC(x));
 return (c.length?`Bucatarie: ${c.join(" sau ")}. `:"")+(d.length?`Fiecare reteta trebuie sa respecte TOATE: ${d.join(", ")}. `:"")+`Campul etichete: doar valori din [${tagNames().join(", ")}], doar cele care se potrivesc cu adevarat.`}
function renderTagUI(){
 const sel=new Set([...document.querySelectorAll("#lbbox input:checked")].map(i=>i.value));
 $("#lbbox").innerHTML=TAGS.map(t=>`<label><input type="checkbox" value="${esc(t.n)}" ${sel.has(t.n)?"checked":""}>${esc(t.n)}</label>`).join("");
 ["#fs"].forEach(s=>{const el=$(s),v=el.value;el.innerHTML='<option value="">Toate</option>'+TAGS.map(t=>`<option>${esc(t.n)}</option>`).join("");el.value=tagNames().includes(v)?v:""});try{drawBook()}catch(e){}}
function renderTagCfg(){
 $("#tgl").innerHTML=TAGS.map((t,i)=>`<div class="apr"><input data-tn="${i}" value="${esc(t.n)}" aria-label="Nume eticheta" style="flex:1;min-width:0"><select data-tt="${i}" aria-label="Tip" style="width:auto"><option value="bucatarie"${t.t==="bucatarie"?" selected":""}>bucatarie</option><option value="dieta"${t.t!=="bucatarie"?" selected":""}>dieta</option></select><button class="alt" data-tx="${i}">Sterge</button></div>`).join("")+
 `<p class="muted">Bucatarie: alternative la generarea ideilor (romanesc sau asiatic). Dieta: se aplica toate odata (vegan si keto). Redenumirea sau stergerea se aplica in toate retetele: idei, salvate si biblioteca.</p>
 <h2 style="margin-top:12px">Eticheta noua</h2><div class="apr"><input id="tnn" aria-label="Numele etichetei noi" placeholder="ex: fara gluten" style="flex:1;min-width:0"><select id="tnt" aria-label="Tipul etichetei noi" style="width:auto"><option value="dieta">dieta</option><option value="bucatarie">bucatarie</option></select><button class="alt" id="tAdd">Adauga</button></div><div id="tmsg" class="muted"></div>`}
const tmsg=t=>{const el=$("#tmsg");if(el)el.textContent=t};
function retag(old,nw){
 const f=a=>{const x=(a||[]).filter(n=>n!==old);return nw?[...new Set([...x,nw])]:x},has=r=>(r.etichete||[]).includes(old);
 const rs=getSaved();rs.forEach(r=>{if(has(r))r.etichete=f(r.etichete)});LS("rs",JSON.stringify(rs));
 const st=getStored();st.forEach(r=>{if(has(r))r.etichete=f(r.etichete)});if(st.length)saveStored(st);
 BOOK.forEach(r=>{if(has(r))r.etichete=f(r.etichete)});
 if(cur&&has(cur))cur.etichete=f(cur.etichete);
 (window._idei||[]).forEach(r=>{if(has(r))r.etichete=f(r.etichete)});
 Object.values(RC).forEach(c=>{if(c&&has(c.r))c.r.etichete=f(c.r.etichete)})}
function afterTags(){renderTagUI();renderTagCfg();drawBook();if(window._idei)drawIdei();renderSaved();renderFav();Object.keys(RC).forEach(s=>{if(RC[s])renderRecipe(s)})}
$("#tgl").onchange=e=>{const d=e.target.dataset;
 if(d.tn!==undefined){const i=+d.tn,old=TAGS[i].n,nw=e.target.value.trim().slice(0,40);
  if(!nw){e.target.value=old;return}
  if(TAGS.some((t,j)=>j!==i&&norm(t.n)===norm(nw))){e.target.value=old;tmsg("Exista deja o eticheta cu acest nume.");return}
  if(nw!==old){TAGS[i].n=nw;TAGS[i].al=[...new Set([...(TAGS[i].al||[]),old])];saveTags();retag(old,nw);afterTags();tmsg("Redenumita: "+old+" -> "+nw+".")}}
 if(d.tt!==undefined){TAGS[+d.tt].t=e.target.value;saveTags();afterTags()}};
$("#tgl").onclick=e=>{const b=e.target,d=b.dataset;
 if(d.tx!==undefined){if(b.dataset.arm!=="1"){b.dataset.arm="1";b.textContent="Confirma stergerea";setTimeout(()=>{if(b.isConnected){b.dataset.arm="";b.textContent="Sterge"}},4000);return}
  const old=TAGS[+d.tx].n;TAGS.splice(+d.tx,1);saveTags();retag(old,null);afterTags();tmsg("Stearsa: "+old+". A fost scoasa din toate retetele.")}
 if(b.id==="tAdd"){const n=$("#tnn").value.trim().slice(0,40);if(!n)return;
  if(TAGS.some(t=>norm(t.n)===norm(n))){tmsg("Exista deja o eticheta cu acest nume.");return}
  TAGS.push({n,t:$("#tnt").value});saveTags();afterTags();tmsg("Adaugata: "+n+". Apare acum in toate filtrele si pe retete.")}};

/* ===== BIBLIOTECA MEA (retete din carti, filtre, incarcare) ===== */
let BOOK=[{"sursa":"Reteta de test","nr":13,"titlu":"Ciorba de vacuta","categorie":"Ciorbe","portii":1,"etichete":["traditional romanesc"],
"ingrediente":[{"c":175,"u":"g","n":"pulpa de vita cruda"},{"c":130,"u":"g","n":"cartofi albi"},{"c":60,"u":"g","n":"morcovi"},{"c":50,"u":"g","n":"telina"},{"c":30,"u":"g","n":"ceapa"},{"c":50,"u":"g","n":"sos de rosii fara zahar adaugat"},{"c":5,"u":"ml","n":"ulei de masline"},{"c":500,"u":"ml","n":"apa"},{"n":"dupa gust: sare, piper, patrunjel proaspat"}],
"pasi_carte":["Pune carnea de vita la fiert in 500 ml apa rece si spumeaza pana supa devine limpede.","Adauga legumele taiate cubulete si fierbe ~30 min, pana carnea se fragezeste.","Pune sosul de rosii, uleiul, sare si piper.","La final presara patrunjel verde si serveste fierbinte."],
"macro":{"kcal":270,"proteine":27,"carbo":20,"fibre":4,"grasimi":9,"saturate":3},
"sfaturi":["Poti adauga si bors acru sau zeama de lamaie pentru o varianta mai acrisoara.","Pentru extra aroma, pune si foi de dafin sau piper boabe.","Se serveste excelent cu ardei iute murat."],
"alergeni":["telina"],"variante":["Inlocuieste cartofii cu dovlecel sau conopida pentru mai putini carbohidrati."]}];
let bi=0;
const bTxt=r=>norm(r.titlu+" "+(r.ingrediente||[]).map(i=>i.n).join(" "));
/* cautare: doar in titlu si in numele ingredientelor; potrivire pe inceput de cuvant ("ou" prinde "oua", nu "sos");
   notele din paranteza si expresiile "peste noapte" / "peste tot" nu conteaza ("peste" = pestele, nu prepozitia);
   cuvintele uzuale (cu, de, la, sau...) sunt ignorate in interogare */
const QSTOP=new Set(["cu","de","la","si","sau","in","pe","din","fara","un","o","al","ai","ale","ce","pentru","cat","mai"]);
const qWords=s=>norm(s).split(/[^a-z0-9]+/).filter(x=>x.length>1&&!QSTOP.has(x));
const bClean=s=>norm(String(s||"").replace(/\([^)]*\)/g," ")).replace(/\bpeste (noapte|tot|toata|tota|zi|un|doua|trei|cateva|\d+)\b/g," ");
const _bsm=new WeakMap();
function bSearchTxt(r){let o=_bsm.get(r);if(o&&o.k===r.titlu+"|"+(r.ingrediente||[]).length)return o;
 o={k:r.titlu+"|"+(r.ingrediente||[]).length,t:bClean(r.titlu),i:bClean((r.ingrediente||[]).map(i=>i.n).join(" , "))};_bsm.set(r,o);return o}
const hasW=(txt,w)=>(" "+txt.replace(/[^a-z0-9]+/g," ")).includes(" "+w);
/* scor: titlu 2, ingredient 1, per cuvant cautat; hits = cate cuvinte s-au gasit */
function bScore(r,q){const o=bSearchTxt(r);let s=0,h=0;q.forEach(w=>{if(hasW(o.t,w)){s+=2;h++}else if(hasW(o.i,w)){s+=1;h++}});return{s,h}}
function bLab(r){return[...new Set([...normTags(r.etichete),...autoTags(r)])]}
const bChips=r=>(r.categorie?`<span class="lb" style="font-weight:700;color:var(--ink)">${esc(r.categorie)}</span>`:"")+bLab(r).map(t=>`<span class="lb">${esc(t)}</span>`).join("");
function drawBook(){
 if(!LIBREADY){$("#bres").innerHTML='<p class="muted">Se incarca biblioteca...</p>';return}
 const srcs=[...new Set(BOOK.map(r=>r.sursa||"necunoscuta"))],sel=$("#bs"),prev=sel.value;
 if(sel.dataset.k!==srcs.join("|")){sel.dataset.k=srcs.join("|");sel.innerHTML='<option value="">Toate cartile</option>'+srcs.map(x=>`<option>${esc(x)}</option>`).join("");sel.value=srcs.includes(prev)?prev:""}
 const cats=[...new Set(BOOK.filter(r=>!sel.value||(r.sursa||"necunoscuta")===sel.value).map(r=>r.categorie).filter(Boolean))].sort(),cs=$("#bc"),cp=cs.value; /* categoriile arata doar ce exista in cartea aleasa */
 if(cs.dataset.k!==cats.join("|")){cs.dataset.k=cats.join("|");cs.innerHTML='<option value="">Toate categoriile</option>'+cats.map(x=>`<option>${esc(x)}</option>`).join("");cs.value=cats.includes(cp)?cp:""}
 const sc0=sel.value,cat0=cs.value,bfs=$("#bf"),bfp=bfs.value; /* etichetele arata doar ce exista in cartea/categoria aleasa */
 const tg=[...new Set(BOOK.filter(r=>(!sc0||(r.sursa||"necunoscuta")===sc0)&&(!cat0||r.categorie===cat0)).flatMap(bLab))].sort((a,b)=>a.localeCompare(b,"ro"));
 if(bfs.dataset.k!==tg.join("|")){bfs.dataset.k=tg.join("|");bfs.innerHTML='<option value="">Toate</option>'+tg.map(x=>`<option>${esc(x)}</option>`).join("");bfs.value=tg.includes(bfp)?bfp:""}
 const q=qWords($("#bq").value),f=bfs.value;
 const bp=$("#bp").value;
 {const n=["#bs","#bc","#bf","#bv","#bd","#bj","#bp"].filter(s=>$(s).value).length;$("#bfsum").textContent=n?"Filtre ("+n+(n===1?" activ)":" active)"):"Filtre"}
 const bd=$("#bd").value,usePan=bd!==""&&getPan().length>0,bj=$("#bj").value,NT=bj?getNotes():null,lim60=dAdd(dKey(new Date()),-60);
 const jOk=r=>{if(!bj)return true;const n=NT[bKey(r)]||{},l=lastCooked(n);return bj==="4"?+n.st>=4:bj==="ok"?!!l:bj==="g0"?!l:!l||l<lim60};
 const l=BOOK.map((r,i)=>{const z=q.length?bScore(r,q):{s:0,h:0};return{r,i,sc:z.h,w:z.s,ms:usePan?missing(r):null}}).filter(x=>!x.r.nou&&(!usePan||(x.ms.tot>0&&x.ms.miss.length<=+bd))&&jOk(x.r)&&(!bp||(bp==="ok"?!recPref(x.r).av.length:recPref(x.r).lk.length>0))&&(!q.length||x.sc>0)&&(!f||bLab(x.r).includes(f))&&(!sc0||(x.r.sursa||"necunoscuta")===sc0)&&(!cat0||x.r.categorie===cat0)&&(!$("#bv").value||($("#bv").value==="v")===!!x.r.verifica)).sort((a,b)=>usePan?(a.ms.miss.length-b.ms.miss.length)||(b.w-a.w)||(b.sc-a.sc):(b.w-a.w)||(b.sc-a.sc));
 {const nv=BOOK.filter(r=>r.verifica).length;{const bq=$("#bvq");bq.hidden=!nv;bq.textContent="Parcurge retetele de verificat ("+nv+")"}$("#bn").textContent=BOOK.length+" retete in baza locala"+(nv?", "+nv+" de verificat":"")+(bd!==""&&!usePan?". Filtrul \"Din debara\" nu face nimic cat timp Debaraua e goala.":usePan?". Ce lipseste se calculeaza aproximativ (\"cartofi albi\" e acoperit de \"cartofi\"); verifica lista inainte sa cumperi.":"")}
 $("#bres").innerHTML=l.length?l.map(x=>`<div class="card"><h2>${esc(x.r.titlu)}</h2><div>${bChips(x.r)}</div>${jrLine(bKey(x.r))}${pfLine(x.r)}${x.ms?`<div class="miss${x.ms.miss.length?"":" ok"}">${x.ms.miss.length?"Iti lipsesc ("+x.ms.miss.length+"): "+esc(x.ms.miss.join(", ")):"Ai tot ce trebuie din debara"}</div>`:""}<p class="muted">${q.length?"Potriviri: "+x.sc+"/"+q.length+" - ":""}${x.r.macro&&x.r.macro.kcal!=null?`~${esc(x.r.macro.kcal)} kcal, ${esc(x.r.macro.proteine??"?")} g proteine, ${esc(x.r.macro.carbo??"?")} g carbohidrati`:""}${x.r.verifica?" - verifica fisa":""}</p><button class="go" data-b="${x.i}">Deschide</button> ${favBtn(bKey(x.r),"Favorita",' style="margin-top:12px"')}</div>`).join(""):'<p class="muted">Nicio reteta gasita. Incearca alt ingredient sau scoate filtrul.</p>';
}
function openBook(i,p,sel){sel=sel||"#bres";bi=i;if(sel==="#favl")FV={t:"b",i,p};
 const r=BOOK[i];if(EDIT&&EDIT.i===i&&EDIT.sel===sel){editForm(r,i,sel);return}
 const f=p/(r.portii||1),m=r.macro,L=a=>(a&&a.length)?a:null,pid="bp"+sel.slice(1);
 const ul=a=>L(a)?"<ul>"+a.map(x=>`<li>${esc(x)}</li>`).join("")+"</ul>":"";
 $(sel).innerHTML=`<div class="bv" data-bi="${i}"><div style="margin-bottom:10px"><button class="alt" data-bback="1">${sel==="#bres"?"Inapoi la rezultate":"Inapoi la favorite"}</button> ${favBtn(bKey(r))}</div><div class="card"><h2>${esc(r.titlu)}</h2><div>${bChips(r)}</div>
 ${tagPicker(r,"data-tgb")}${(()=>{const p=recPref(r);return p.av.length?`<div class="warn">Contine ce eviti: ${esc(p.av.join(", "))}.</div>`:""})()}${jrHtml(bKey(r))}
 ${r.verifica?`<div class="warn">Extragerea automata a acestei retete e nesigura (${esc(r.verifica.join(", "))}). Mai jos e textul paginii din carte, ca atare.</div><pre style="white-space:pre-wrap;font:inherit">${esc(r.text_brut||"")}</pre>`:""}
 <div class="acts">${(r.pasi_carte||[]).length?`<button class="go" data-cookb="1">Mod gatit</button>`:""}<button class="alt" data-mnb="1">Adauga la meniu</button></div><details class="mre"><summary>Mai multe actiuni</summary><div class="acts"><button class="alt" data-cumb="1">Adauga la cumparaturi</button><button class="alt" data-edit="1">Corecteaza reteta</button>${((r.pasi_carte||[]).length||(r.verifica&&r.text_brut))?`<button class="alt" data-adp="1" ${hasRobot()?"":"disabled"}>Adapteaza la aparatele mele</button>`:""}</div></details>${((r.pasi_carte||[]).length||(r.verifica&&r.text_brut))?`<p class="muted adphint" ${hasRobot()?"hidden":""} style="margin:6px 0 0">Adaptarea e activa doar daca bifezi Thermomix sau Monsieur Cuisine in Idei, la Aparate pentru adaptare.</p>`:""}${r.portii==null?`<p class="muted" style="margin:10px 0 0">Cantitatile sunt cele din carte.</p>`:`<label for="${pid}">Portii</label><input id="${pid}" data-bp="1" type="number" min="1" value="${p}" style="max-width:100px">`}
 <h2 style="margin-top:14px">Ingrediente</h2>${(r.ingrediente||[]).length?`<ul class="ing">${ingHtml(r,f)}</ul>`:`<p class="muted">Reteta nu are o lista proprie de ingrediente. Cantitatile sunt in modul de preparare sau in reteta la care trimite.</p>`}
 <h2>Mod de preparare</h2><ol>${(r.pasi_carte||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
 ${m&&m.kcal!=null?`<h2>Macro per portie</h2><p class="muted">Valori din carte, aproximative: ${esc(m.kcal)} kcal, proteine ${esc(m.proteine??"?")} g, carbohidrati ${esc(m.carbo??"?")} g${m.fibre!=null?" (fibre "+esc(m.fibre)+" g)":""}, grasimi ${esc(m.grasimi??"?")} g${m.saturate!=null?" (saturate "+esc(m.saturate)+" g)":""}</p>`:""}
 ${L(r.sfaturi)?"<h2>Sfaturi practice</h2>"+ul(r.sfaturi):""}${L(r.alergeni)?"<p><b>Alergeni:</b> "+esc(r.alergeni.join(", "))+"</p>":""}${L(r.variante)?"<p><b>Variante:</b></p>"+ul(r.variante):""}
 <p class="muted">Sursa: ${esc(r.sursa||"-")}${r.nr?", reteta "+esc(r.nr):""}</p></div><div id="adp${sel.slice(1)}"></div></div>`;
 const key="#adp"+sel.slice(1),en=RC[key],ad=$(key);
 if(en&&(en.bi!==i||en.p!==p))RC[key]=null;
 if(ad){ad.onclick=e=>{e.stopPropagation();const c=RC[key];if(c)cur=c.r;rcClick(e,key)};ad.onchange=e=>{e.stopPropagation();rcChange(e,key)};if(RC[key])renderRecipe(key)}
}
/* adaptare reteta din carte la aparatele bifate (un apel Haiku; reteta cartii ramane neatinsa) */
async function adaptBook(i,p,sel,btn){
 const r=BOOK[i],f=p/(r.portii||1),key="#adp"+sel.slice(1),box=$(key),L=pick();
 if(!hasRobot()){toast("Adaptarea cere Thermomix sau Monsieur Cuisine bifat in Idei, la Aparate pentru adaptare.");return}
 const ing=(r.ingrediente||[]).map(x=>(x.g?"["+x.g+"] ":"")+(x.c!=null?fmtQ(x.c*f)+" ":"")+(x.u?x.u+" ":"")+x.n).join("\n"),
  pasi=(r.pasi_carte||[]).map((x,k)=>(k+1)+". "+x).join("\n"),bbs=[$("#bIdei"),$("#bWeb")];
 btn.disabled=true;btn.dataset.busy="1";bbs.forEach(b=>b.disabled=true);const stop=timer(btn,"Adaptez...");box.innerHTML="";
 const u=`Adapteaza reteta din carte "${r.titlu}" pentru ${p} portii la aparatele de mai jos. Pastreaza ingredientele si cantitatile date (nu adauga si nu scoate ingrediente) si urmeaza pasii cartii in aceeasi ordine, dar muta fiecare pas pe cel mai potrivit aparat.
Ingrediente:\n${ing}
Pasii din carte:\n${pasi||"(nu sunt pasi extrasi)"}${r.verifica?`\nATENTIE: extragerea automata a acestei retete e nesigura (${r.verifica.join(", ")}). Textul paginii din carte, ca atare, ca sa clarifici ingredientele si pasii (daca ceva ramane neclar, scrie in avertismente):\n${String(r.text_brut||"").slice(0,3500)}`:""}
Aparate:\n${apText(L)}\n${RULE}
${rulesFor(L,12)}
Format: {"titlu":"","portii":0,"ingrediente":[{"nume":"","cantitate":0,"unitate":""}],"pasi":[{"id":"p1","text":"","aparat":"id|manual","mod":"","temp":0,"treapta":"","sens":"","sonda_c":0,"volum_ml":0,"durata_min":0,"depinde_de":["id"]}],"avertismente":[""]}`;
 try{
  const a=await ask($("#m2").value||"claude-haiku-4-5",SYS,u,4000,0.2);
  if(!a||!Array.isArray(a.pasi))throw new Error("Modelul nu a returnat pasi valizi. Incearca din nou.");
  a.pasi=a.pasi.filter(x=>x&&typeof x==="object"&&x.text).map((x,k)=>Object.assign(x,{id:String(x.id||"p"+(k+1)),aparat:x.aparat||"manual"}));
  if(!a.pasi.length)throw new Error("Modelul nu a returnat pasi valizi. Incearca din nou.");
  a.ingrediente=Array.isArray(a.ingrediente)?a.ingrediente.filter(x=>x&&typeof x==="object"):[];a.avertismente=Array.isArray(a.avertismente)?a.avertismente:[];
  if(r.verifica)a.avertismente.unshift("Extragerea din carte e nesigura: compara cu reteta originala de mai sus.");a.titlu=r.titlu+" (adaptat)";a.portii=p;a.etichete=normTags(r.etichete);a.din_carte=(r.sursa||"")+(r.nr?", reteta "+r.nr:"");
  cur=a;RC[key]={r:a,kind:"gen",bi:i,p};renderRecipe(key);box.scrollIntoView({behavior:"smooth",block:"start"})}
 catch(e){if(e.message!=="Anulat."){box.innerHTML='<div class="warn"></div>';box.firstChild.textContent=e.message;toast(e.message)}}
 stop();delete btn.dataset.busy;bbs.forEach(b=>b.disabled=false);btn.textContent="Adapteaza la aparatele mele";syncAdp();
}
/* curata o reteta importata: tipuri sigure, ca un JSON gresit sa nu strice aplicatia */
const arr=v=>Array.isArray(v)?v:(v==null||v===""?[]:[v]),nz=v=>v==null||v===""||!isFinite(+v)?null:+v;
function fixRec(r){if(!r||typeof r!=="object")return r;
 r.etichete=arr(r.etichete).filter(x=>typeof x==="string");r.pasi_carte=arr(r.pasi_carte).map(String);r.sfaturi=arr(r.sfaturi).map(String);
 r.ingrediente=arr(r.ingrediente).map(x=>typeof x==="object"&&x?Object.assign({},x,{c:nz(x.c),u:x.u==null?"":String(x.u),n:String(x.n==null?"":x.n)}):{c:null,u:"",n:String(x)}).filter(x=>x.n||x.g);
 r.portii=nz(r.portii);if(r.nr!=null)r.nr=nz(r.nr)??String(r.nr).slice(0,20);
 if(r.macro&&typeof r.macro==="object")["kcal","proteine","carbo","grasimi","fibre","saturate"].forEach(k=>{if(k in r.macro)r.macro[k]=nz(r.macro[k])});else delete r.macro;
 if(r.verifica!=null)r.verifica=arr(r.verifica).map(String);if(r.text_brut!=null)r.text_brut=String(r.text_brut);r.titlu=String(r.titlu);return r}
/* editor retete din biblioteca */
let EDIT=null;
const UN=["g","kg","ml","l","cl","lingura","linguri","lingurita","lingurite","catel","catei","cana","cani","buc","bucata","bucati","felie","felii","praf","varf","pachet","pachete","conserva","conserve"];
function toNum(s){s=String(s).trim().replace(",",".");let t=0;const fr={"\u00bd":.5,"\u00bc":.25,"\u00be":.75};
 s=s.replace(/[\u00bd\u00bc\u00be]/g,c=>{t+=fr[c];return""});const f=s.match(/(\d+)\s*\/\s*(\d+)/);if(f){t+=f[1]/f[2];s=s.replace(f[0],"")}
 const n=parseFloat(s);if(!isNaN(n))t+=n;return +t.toFixed(3)}
function ingHtml(r,f){let g=null,o="";(r.ingrediente||[]).forEach(x=>{const gg=x.g||null;if(gg!==g){g=gg;if(g)o+=`<li class="gh"><b>${esc(g)}</b></li>`}
  o+=`<li>${x.c!=null?fmtQ(x.c*f)+" "+(x.u?esc(x.u)+" ":""):""}${esc(x.n)}</li>`});return o}
function ingText(list){let g=null;return (list||[]).map(x=>{const gg=x.g||null;let h="";if(gg!==g){g=gg;if(g)h="## "+g+"\n"}return h+ingLine(x)}).join("\n")}
function parseIngText(t){let g=null;const out=[];t.split("\n").forEach(l=>{const s=l.trim();if(s.startsWith("##")){g=s.replace(/^#+\s*/,"")||null;return}const p=parseIng(l);if(p){if(g)p.g=g;out.push(p)}});return out}
function parseIng(line){const t=line.trim().replace(/^[\u2022\-*]\s*/,"");if(!t)return null;
 const m=t.match(/^(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?\s*[\u00bd\u00bc\u00be]?|[\u00bd\u00bc\u00be])\s*(.*)$/);if(!m)return{c:null,u:"",n:t};
 const rest=m[2].trim(),w=rest.split(/\s+/)[0]||"";
 const vf=norm(rest).match(/^(varf de (lingurita|cutit))\b/);if(vf)return{c:toNum(m[1]),u:rest.slice(0,vf[1].length),n:rest.slice(vf[1].length).trim()};
 if(UN.includes(norm(w))&&rest.length>w.length)return{c:toNum(m[1]),u:w,n:rest.slice(w.length).trim()};
 return{c:toNum(m[1]),u:"",n:rest}}
const ingLine=x=>[x.c!=null?x.c:"",x.u||"",x.n||""].join(" ").replace(/\s+/g," ").trim();
function persistBook(r){let st=getStored();const k=bKey(r),j=st.findIndex(x=>bKey(x)===k);
 if(!st.length)st=BOOK.slice();else if(j>=0)st[j]=r;else st.push(r);
 saveStored(st);return true}
function editForm(r,i,sel){const m=r.macro||{},cats=[...new Set([...BOOK.map(x=>x.categorie),r.categorie,"Retetele mele"].filter(Boolean))].sort(),mv=k=>m[k]!=null?m[k]:"";
 $(sel).innerHTML=`<div class="bv" data-bi="${i}"><div style="margin-bottom:10px"><button class="alt" data-ecancel="1">Renunta</button></div>${VQ&&r.verifica?`<div class="card" style="margin-bottom:10px;background:var(--soft)"><b>De verificat: ${VQ.pos+1} din ${VQ.keys.length}</b> (${esc(r.verifica.join(", "))})<div class="row" style="gap:8px;margin-top:8px"><button class="alt" type="button" data-vqskip="1" style="margin:0">Sari peste</button><button class="alt" type="button" data-vqstop="1" style="margin:0">Opreste</button></div></div>`:""}<div class="card"><h2>${r.nou?"Reteta noua":"Corecteaza: "+esc(r.titlu)}</h2>
 ${r.text_brut?`<details open><summary><b>Textul paginii din carte</b> (il poti corecta aici)</summary><textarea data-ef="brut" rows="10" style="margin-top:8px">${esc(r.text_brut)}</textarea><div class="row" style="margin-top:8px;align-items:center;gap:8px"><button class="alt" type="button" data-eparse="1" style="margin:0">Imparte in portii, ingrediente si pasi</button><span class="muted">Local, fara AI. Tu verifici rezultatul.</span></div><div data-pres aria-live="polite"></div></details>`:""}
 <label for="ef-t${i}">Titlu</label><input id="ef-t${i}" data-ef="titlu" value="${esc(r.titlu)}" maxlength="120"${r.nou?' placeholder="ex: Papanasi cu smantana"':""}>
 <div class="row"><div><label for="ef-p${i}">Portii</label><input id="ef-p${i}" data-ef="portii" type="number" min="1" value="${esc(r.portii||1)}"></div><div><label for="ef-c${i}">Categorie</label><select id="ef-c${i}" data-ef="categorie">${cats.map(c=>`<option${c===r.categorie?" selected":""}>${esc(c)}</option>`).join("")}</select></div></div>
 <label for="ef-i${i}">Ingrediente (unul pe linie, ex: 160 g morcovi; o linie care incepe cu ## este titlu de grup, ex: ## Crema)</label><textarea id="ef-i${i}" data-ef="ing" rows="8" placeholder="200 g faina&#10;2 oua&#10;## Sos&#10;1 lingura smantana">${esc(ingText(r.ingrediente))}</textarea>
 <label for="ef-s${i}">Mod de preparare (un pas pe linie)</label><textarea id="ef-s${i}" data-ef="pasi" rows="8" placeholder="Amesteca faina cu ouale.&#10;Coace 30 de minute.">${esc((r.pasi_carte||[]).join("\n"))}</textarea>
 <div class="row" style="margin-top:12px;align-items:center;gap:8px"><button class="alt" type="button" data-emac="1" style="margin:0">Calculeaza macro (AI)</button><span class="muted">Estimare per portie, din ingredientele de mai sus.</span></div><div data-mres aria-live="polite"></div>
 <div class="row"><div><label>kcal</label><input data-ef="kcal" type="number" step="any" value="${esc(mv("kcal"))}"></div><div><label>Proteine g</label><input data-ef="proteine" type="number" step="any" value="${esc(mv("proteine"))}"></div><div><label>Carbo g</label><input data-ef="carbo" type="number" step="any" value="${esc(mv("carbo"))}"></div><div><label>Grasimi g</label><input data-ef="grasimi" type="number" step="any" value="${esc(mv("grasimi"))}"></div></div>
 <div class="row" style="gap:8px;margin-top:12px"><button class="go" data-esave="1" style="margin:0">Salveaza</button>${r.manual&&!r.nou?'<button class="alt" data-edel="1" style="margin:0">Sterge reteta</button>':""}${r.verifica?'<button class="go" data-esave="v" style="margin:0">Salveaza si marcheaza verificata</button>':""}<button class="alt" data-ecancel="1">Renunta</button></div></div></div>`}
/* ===== Calcul macronutrienti cu AI (doar la apasare), in editorul retetei ===== */
const MACK=["kcal","proteine","carbo","grasimi"],MACL={kcal:"kcal",proteine:"proteine",carbo:"carbohidrati",grasimi:"grasimi"};
const macTxt=o=>MACK.map(k=>o[k]!=null&&o[k]!==""?`${MACL[k]} ${o[k]}${k==="kcal"?"":" g"}`:null).filter(Boolean).join(", ")||"(nimic)";
function macApply(bv,o,tags){MACK.forEach(k=>{const el=bv.querySelector(`[data-ef=${k}]`);if(el)el.value=o[k]!=null?o[k]:""});bv.dataset.stags=JSON.stringify(tags||[]);
 const au=autoTags({macro:o}),t=[...new Set([...(tags||[]),...au])];
 const box=bv.querySelector("[data-mres]");box.innerHTML=`<p class="muted" style="margin:8px 0">Completat: ${esc(macTxt(o))} (per portie).${t.length?" Etichete dupa salvare: "+esc(t.join(", "))+".":""} Verifica valorile si apasa Salveaza.</p>`}
async function macCalc(bv,btn){const g=k=>bv.querySelector(`[data-ef=${k}]`).value,box=bv.querySelector("[data-mres]");
 if(!LS("rk")){box.innerHTML='<div class="warn">Adauga cheia API in Setari ca sa folosesti calculul.</div>';return}
 const ings=parseIngText(g("ing")).filter(x=>x.n);if(!ings.length){box.innerHTML='<div class="warn">Scrie mai intai ingredientele.</div>';return}
 const por=Math.max(1,+g("portii")||1),old={};MACK.forEach(k=>{const v=g(k);old[k]=v===""?null:+v});
 const names=TAGS.filter(t=>!t.auto).map(t=>t.n);
 const sys='Esti nutritionist. Estimezi valorile nutritionale pentru o reteta. Raspunzi DOAR cu JSON valid, fara text in plus, fara diacritice.';
 const u=`Reteta: ${g("titlu")||"fara titlu"}\nPortii: ${por}\nIngrediente (cantitatile sunt pentru toata reteta):\n${ings.map(ingLine).join("\n")}\n\nCalculeaza valorile PER PORTIE (total / ${por}), tinand cont de starea alimentului asa cum e scris (crud, gatit). Daca un ingredient nu are cantitate, estimeaza una uzuala si adauga-l in "nesigur". Ignora apa, sarea si condimentele fara aport. Rotunjeste: kcal la intreg, restul la o zecimala.\nTrimite JSON: {"kcal":numar,"proteine":numar,"carbo":numar,"grasimi":numar,"nesigur":["ingredient neclar",...],"etichete":[...]}\nIn "etichete" pune doar etichete care se potrivesc cu siguranta din aceasta lista: ${JSON.stringify(names)} (gol daca nu esti sigur).`;
 btn.disabled=true;btn.textContent="Calculez...";box.innerHTML="";
 try{const j=await ask($("#m2").value||"claude-haiku-4-5",sys,u,600,0);
  const n=k=>{const v=+j[k];return Number.isFinite(v)&&v>=0&&v<20000?Math.round(v*10)/10:null};
  const o={kcal:n("kcal"),proteine:n("proteine"),carbo:n("carbo"),grasimi:n("grasimi")};
  if(MACK.every(k=>o[k]==null)){box.innerHTML='<div class="warn">Nu am primit valori utilizabile. Incearca din nou.</div>';return}
  const tags=(Array.isArray(j.etichete)?j.etichete:[]).filter(x=>names.includes(x)).slice(0,5);
  const uns=(Array.isArray(j.nesigur)?j.nesigur:[]).slice(0,8).map(x=>String(x).slice(0,60));
  bv._mac={o,tags};const had=MACK.some(k=>old[k]!=null);
  const un=uns.length?`<p class="warn" style="margin:6px 0">Estimat pentru: ${esc(uns.join(", "))}.</p>`:"";
  if(!had)macApply(bv,o,tags);
  if(!had&&uns.length)box.innerHTML+=un;
  if(had)box.innerHTML=`<div class="card" style="margin:8px 0;background:var(--soft)"><b>Exista deja valori.</b><p style="margin:6px 0">Acum: ${esc(macTxt(old))}<br>Calculat: ${esc(macTxt(o))}</p>${un}<div class="row" style="gap:8px"><button class="go" type="button" data-emacok="1" style="margin:0">Foloseste valorile calculate</button><button class="alt" type="button" data-emacno="1" style="margin:0">Pastreaza ce am</button></div></div>`}
 catch(e){box.innerHTML=`<div class="warn">${esc(e.message||"Eroare")}</div>`}
 finally{btn.disabled=false;btn.textContent="Calculeaza macro (AI)"}}
/* ===== Impartirea textului paginii din carte in portii, ingrediente, pasi si macro (local, euristic) ===== */
function parseRaw(t){const L=String(t||"").split(/\r?\n/).map(x=>x.replace(/\s+/g," ").trim()).filter(Boolean),out={portii:null,ing:[],pasi:[],macro:{}};
 const nl=norm(t||"");const pm=nl.match(/(\d+)\s*portii/)||nl.match(/portii\s*[:\-]?\s*(\d+)/);if(pm&&+pm[1]>0&&+pm[1]<200)out.portii=+pm[1];
 const ni=L.findIndex(l=>/^ingrediente/.test(norm(l)));let i0=ni>=0?ni+1:0;
 if(ni>=0&&/^~?\s*\d+\s*portii/.test(norm(L[i0]||"")))i0++;
 const isQ=l=>/^(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?|[\u00bd\u00bc\u00be])\s*[a-zA-Z\u00c0-\u024f]/.test(l)&&!/^\d+(?:[.,]\d+)?\s*(min|minute|ore|ora|secunde|sec|zile|grade|portii|kcal|%)/.test(norm(l));
 let kind=null,inSteps=false;const add=(k,s)=>{if(k==="i")out.ing.push(s);else out.pasi.push(s);kind=k};
 for(let i=i0;i<L.length;i++){const l=L[i],n=norm(l);
  if(/^(macro|tips|sfat|nota)\b/.test(n))break;
  if(/^(instructiuni|mod de preparare|preparare|mod de lucru)\b/.test(n)){inSteps=true;kind=null;continue}
  if(isQ(l)){add("i",l);continue}
  if(/:$/.test(l)&&l.length<60&&!/^\d/.test(l)){const nx=L[i+1]||"";if(isQ(nx)){out.ing.push("## "+l.replace(/:$/,"").trim());kind="i";continue}}
  const cont=/^[a-z\u0103\u00e2\u00ee\u0219\u021b\u015f\u0163(]/.test(l)||/^\d+\s*(min|ore|ora)/.test(n);
  if(cont&&kind){const a=kind==="i"?out.ing:out.pasi;if(a.length&&!/^##/.test(a[a.length-1])){a[a.length-1]+=" "+l;continue}}
  if(inSteps)add("p",l);else if(kind==="i"||!out.ing.length&&false)add("i",l)}
 const mm=(re)=>{const m=nl.match(re);return m?+m[1].replace(",","."):null};
 out.macro={kcal:mm(/calorii\s*:?\s*(\d+(?:[.,]\d+)?)/),proteine:mm(/proteine\s*:?\s*(\d+(?:[.,]\d+)?)/),carbo:mm(/carbohidrati\s*:?\s*(\d+(?:[.,]\d+)?)/),grasimi:mm(/grasimi\s*:?\s*(\d+(?:[.,]\d+)?)/)};
 return out}
function parseShow(bv){const box=bv.querySelector("[data-pres]"),o=parseRaw(bv.querySelector("[data-ef=brut]").value);
 const mc=Object.values(o.macro).filter(v=>v!=null).length,ni=o.ing.filter(x=>!x.startsWith("##")).length;
 if(!ni&&!o.pasi.length&&o.portii==null&&!mc){box.innerHTML='<div class="warn">Nu am gasit nimic de impartit. Corecteaza textul (un ingredient pe linie, cu cantitatea la inceput) si incearca din nou.</div>';return}
 bv._pr=o;box.innerHTML=`<div class="card" style="margin:8px 0;background:var(--soft)"><b>Am gasit:</b><p style="margin:6px 0">${o.portii!=null?o.portii+" portii, ":""}${ni} ingrediente, ${o.pasi.length} pasi${mc?", macro ("+esc(macTxt(o.macro))+")":""}.<br>Completarea inlocuieste ingredientele si pasii din campurile de mai jos. Verifica apoi rezultatul.</p><div class="row" style="gap:8px"><button class="go" type="button" data-eparseok="1" style="margin:0">Completeaza campurile</button><button class="alt" type="button" data-eparseno="1" style="margin:0">Renunta</button></div></div>`}
function parseApply(bv){const o=bv._pr;if(!o)return;const set=(k,v)=>{const el=bv.querySelector(`[data-ef=${k}]`);if(el&&v!=null&&v!=="")el.value=v};
 set("portii",o.portii);if(o.ing.length)set("ing",o.ing.join("\n"));if(o.pasi.length)set("pasi",o.pasi.join("\n"));MACK.forEach(k=>set(k,o.macro[k]));
 bv.querySelector("[data-pres]").innerHTML='<p class="muted" style="margin:8px 0">Campurile sunt completate. Verifica-le (mai ales ingredientele si pasii), apoi apasa Salveaza.</p>'}
function editSave(bv,i,sel,verif){const r=BOOK[i],g=k=>bv.querySelector(`[data-ef=${k}]`).value;
 const t=g("titlu").trim();if(!t){toast("Titlul nu poate fi gol.");return}
 {const bf=bv.querySelector("[data-ef=brut]");if(bf)r.text_brut=bf.value}
 r.titlu=t;r.portii=Math.max(1,+g("portii")||1);if(g("categorie"))r.categorie=g("categorie");
 r.ingrediente=parseIngText(g("ing"));r.pasi_carte=g("pasi").split("\n").map(x=>x.trim()).filter(Boolean);
 r.macro=Object.assign({},r.macro);["kcal","proteine","carbo","grasimi"].forEach(k=>{const v=g(k);r.macro[k]=v===""?null:+v});
 {let st=[];try{st=JSON.parse(bv.dataset.stags||"[]")}catch(e){}if(st.length)r.etichete=[...new Set([...normTags(r.etichete),...normTags(st)])]}
 if(!r.manual)r.corectata=true;if(verif)delete r.verifica;
 if(r.nou){delete r.nou;const st=getStored();if(!st.length)BOOK=[r];st.push(r);saveStored(st);EDIT=null;updBS();openBook(BOOK.indexOf(r),r.portii,sel);return}
 if(persistBook(r)){EDIT=null;if(VQ&&verif){VQ.done++;vqNext(VQ.pos+1);return}openBook(i,r.portii,sel)}}
function setBookTag(i,n,on){const r=BOOK[i],a=new Set(normTags(r.etichete));on?a.add(n):a.delete(n);r.etichete=[...a];
 const st=getStored(),k=bKey(r),j=st.findIndex(x=>bKey(x)===k);if(j>=0){st[j].etichete=r.etichete;saveStored(st)}}
function bvClick(e,sel){const bv=e.target.closest(".bv");if(!bv)return false;const d=e.target.dataset,i=+bv.dataset.bi,pi=bv.querySelector("[data-bp]"),p=Math.max(1,+(pi&&pi.value)||1);
 if(jrAct(d,bKey(BOOK[i]))){openBook(i,p,sel);return true}
 if(d.edit!==undefined){EDIT={sel,i};openBook(i,p,sel);return true}
 if(d.vqskip!==undefined){EDIT=null;vqNext(VQ.pos+1);return true}
 if(d.vqstop!==undefined){VQ=null;EDIT=null;drawBook();return true}
 if(d.ecancel!==undefined){VQ=null;EDIT=null;if(BOOK[i].nou){BOOK=BOOK.filter(x=>!x.nou);drawBook();return true}openBook(i,BOOK[i].portii||1,sel);return true}
 if(d.eparse!==undefined){parseShow(bv);return true}
 if(d.eparseok!==undefined){parseApply(bv);return true}
 if(d.eparseno!==undefined){bv.querySelector("[data-pres]").innerHTML="";return true}
 if(d.emac!==undefined){macCalc(bv,e.target);return true}
 if(d.emacok!==undefined){macApply(bv,bv._mac.o,bv._mac.tags);return true}
 if(d.emacno!==undefined){bv.querySelector("[data-mres]").innerHTML="";return true}
 if(d.edel!==undefined){const b=e.target;if(!b.dataset.arm){b.dataset.arm="1";b.textContent="Sigur? Apasa din nou pentru stergere definitiva";setTimeout(()=>{if(b.isConnected){delete b.dataset.arm;b.textContent="Sterge reteta"}},5000);return true}
  const k=bKey(BOOK[i]);EDIT=null;putStored(getStored().filter(x=>bKey(x)!==k));toast("Reteta a fost stearsa.");return true}
 if(d.esave!==undefined){editSave(bv,i,sel,d.esave==="v");return true}
 if(d.bback!==undefined){VQ=null;EDIT=null;BOOK=BOOK.filter(x=>!x.nou);if(sel==="#bres")drawBook();else{FV=null;renderFav()}return true}
 if(d.fav!==undefined){toggleFav(d.fav);openBook(i,p,sel);return true}
 if(d.adp!==undefined){adaptBook(i,p,sel,e.target);return true}
 if(d.cookb!==undefined){const r=BOOK[i];cookOpen(r.titlu,cookSteps(r,"b"),ingBook(r,p/(r.portii||1)));return true}
 if(d.mnb!==undefined){menOpen({s:"b",r:BOOK[i],p});return true}
 if(d.cumb!==undefined){const r=BOOK[i],f=p/(r.portii||1),n=addList((r.ingrediente||[]).map(x=>({c:x.c!=null?+(x.c*f).toFixed(2):null,u:x.u,n:x.n,g:x.g})),r.titlu);e.target.textContent="Adaugat ("+n+") - vezi Cumparaturi";return true}
 return false}
function bvChange(e,sel){const bv=e.target.closest(".bv");if(!bv)return false;const d=e.target.dataset,i=+bv.dataset.bi,pi=bv.querySelector("[data-bp]"),p=Math.max(1,+(pi&&pi.value)||1);
 if(d.jnt!==undefined){setNote(bKey(BOOK[i]),{nt:e.target.value.slice(0,600)});return true}
 if(d.bp!==undefined){const v=Math.max(1,+e.target.value||1);setTimeout(()=>openBook(i,v,sel),0);return true}
 if(d.tgb!==undefined){setBookTag(i,d.tgb,e.target.checked);openBook(i,p,sel);return true}
 return false}
/* ===== Coada "De verificat": parcurgi pe rand retetele cu extragere nesigura, direct in editor ===== */
let VQ=null;
const vqLeft=()=>VQ?VQ.keys.length:0;
function vqOpen(j){const k=VQ.keys[j];const i=BOOK.findIndex(r=>bKey(r)===k&&r.verifica);if(i<0)return false;VQ.pos=j;EDIT={sel:"#bres",i};openBook(i,BOOK[i].portii||1,"#bres");$("#bres").scrollIntoView({block:"start"});return true}
function vqNext(from){if(!VQ)return;for(let j=from;j<VQ.keys.length;j++)if(vqOpen(j))return;
 const done=VQ.done;VQ=null;EDIT=null;drawBook();toast(done?"Ai verificat "+done+(done===1?" reteta.":" retete.")+" Nu mai sunt retete de verificat in coada.":"Nu mai sunt retete de verificat in coada.")}
function vqStart(){const keys=BOOK.filter(r=>r.verifica).map(bKey);if(!keys.length){toast("Nu ai retete de verificat.");return}VQ={keys,pos:0,done:0};vqNext(0)}
$("#bvq").onclick=vqStart;
function newBook(){BOOK=BOOK.filter(x=>!x.nou);const S="Retetele mele",nr=Math.max(0,...BOOK.filter(x=>x.sursa===S).map(x=>+x.nr||0))+1;
 const r={sursa:S,nr,titlu:"",categorie:S,portii:2,ingrediente:[],pasi_carte:[],macro:{},etichete:[],manual:true,nou:true};
 BOOK=BOOK.concat([r]);const i=BOOK.length-1;EDIT={sel:"#bres",i};openBook(i,2,"#bres");$("#bres").scrollIntoView({block:"start"})}
$("#bnew").onclick=newBook;
$("#bq").oninput=drawBook;$("#bf").onchange=drawBook;$("#bs").onchange=drawBook;$("#bc").onchange=drawBook;$("#bv").onchange=drawBook;$("#bd").onchange=drawBook;$("#bj").onchange=drawBook;$("#bp").onchange=drawBook;
$("#bres").onclick=e=>{if(bvClick(e,"#bres"))return;const d=e.target.dataset;
 if(d.fav!==undefined){toggleFav(d.fav);drawBook();return}
 if(d.b!==undefined){openBook(+d.b,BOOK[d.b].portii||1,"#bres");$("#bres").scrollIntoView({block:"start"})}};
$("#bres").onchange=e=>{bvChange(e,"#bres")};
const BOOK0=BOOK;function setBook(j){BOOK=j;FV=null;drawBook()}
/* ===== Biblioteca: stocata in IndexedDB (fara limita de ~5 MB din localStorage) =====
   localStorage ramane pentru restul datelor si pentru marcajul "rlib" (biblioteca e in IndexedDB).
   Daca IndexedDB nu merge (mod privat, browser vechi), biblioteca se pastreaza in localStorage ca pana acum.
   O biblioteca gasita in localStorage (versiuni vechi sau restaurare din copie) e mutata in IndexedDB si verificata inainte sa fie scoasa de acolo. */
let STORED=[],DB=null,IDBOK=false,LIBREADY=false,LIBW=Promise.resolve(true);
const cl=x=>typeof structuredClone==="function"?structuredClone(x):JSON.parse(JSON.stringify(x));
const idbOpen=()=>new Promise((res,rej)=>{try{setTimeout(()=>rej(new Error("timeout")),4000);const q=indexedDB.open("retete-db",1);q.onupgradeneeded=()=>q.result.createObjectStore("kv");q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);q.onblocked=()=>rej(new Error("blocked"))}catch(e){rej(e)}});
const idbGet=k=>new Promise((res,rej)=>{const r=DB.transaction("kv").objectStore("kv").get(k);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const idbPut=(k,v)=>new Promise((res,rej)=>{const t=DB.transaction("kv","readwrite");t.objectStore("kv").put(v,k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)});
const getStored=()=>cl(STORED);
/* salveaza biblioteca; intoarce o promisiune (true/false); scrierile se executa pe rand */
function saveStored(a){STORED=a;
 if(IDBOK&&DB){LIBW=LIBW.then(()=>idbPut("book",a)).then(()=>{LS("rlib","1");return true}).catch(()=>{toast("Nu am putut salva biblioteca in baza de date a browserului.");return false});return LIBW}
 try{if(a.length)localStorage.setItem("rbook",JSON.stringify(a));else localStorage.removeItem("rbook")}catch(e){toast("Nu am putut salva biblioteca: memoria browserului e plina.");return Promise.resolve(false)}
 return Promise.resolve(true)}
async function libInit(){
 let legacy=null;try{const s=localStorage.getItem("rbook");if(s){const j=JSON.parse(s);if(Array.isArray(j)&&j.length)legacy=j}}catch(e){}
 try{DB=await idbOpen();IDBOK=true;
  if(legacy){await idbPut("book",legacy);const back=await idbGet("book");
   if(Array.isArray(back)&&back.length===legacy.length){STORED=back;LS("rlib","1");try{localStorage.removeItem("rbook")}catch(e){}}else{IDBOK=false;STORED=legacy}}
  else if(LS("rlib")==="1"){const v=await idbGet("book");STORED=Array.isArray(v)?v:[]}
  else STORED=[] /* fara marcaj: ce ramane in IndexedDB e orfan (datele aplicatiei au fost sterse) */
 }catch(e){IDBOK=false;STORED=legacy||[]}
 if(STORED.length){try{BOOK=cl(STORED).map(fixRec)}catch(e){}}
 LIBREADY=true;try{drawBook();updBS();drawOnb();if(!$("#v-meniu").classList.contains("hidden"))drawMenu()}catch(e){}
 window.__ready=true}
function putStored(a){saveStored(a);BOOK=a.length?a:BOOK0;FV=null;drawBook();updBS()}
function updBS(){const s=STORED,c={};s.forEach(r=>{const k=r.sursa||"necunoscuta";c[k]=(c[k]||0)+1});const k=Object.keys(c);
 $("#bsn").innerHTML=k.length?k.map(x=>`<div class="apr"><b>${esc(x)}</b><span class="muted">${c[x]} retete</span><button class="alt" data-src="${esc(x)}">Sterge</button></div>`).join("")+`<div style="margin-top:10px"><button class="alt" data-all="1">Sterge tot (${s.length} retete)</button></div>`:'<p class="muted">Nu ai nicio baza incarcata (apare doar reteta de test).</p>'}
$("#bscard").onclick=e=>{const b=e.target,d=b.dataset;if(d.src===undefined&&!d.all)return;
 if(b.dataset.arm!=="1"){const t=b.textContent;b.dataset.arm="1";b.textContent="Confirma stergerea";setTimeout(()=>{if(b.isConnected){b.dataset.arm="";b.textContent=t}},4000);return}
 putStored(d.all?[]:getStored().filter(r=>(r.sursa||"necunoscuta")!==d.src))};
libInit();
let PEND=null;
const srcOf=(r,f)=>$("#bnm").value.trim()||r.sursa||f.name.replace(/\.json$/i,"");
function pvDraw(){const el=$("#bpv");if(!PEND){el.innerHTML="";return}
 const {j,f}=PEND,names=[...new Set(j.map(r=>srcOf(r,f)))],repl=getStored().filter(r=>names.includes(r.sursa)).length,vf=j.filter(r=>r.verifica).length;
 el.innerHTML=`<div class="card" style="margin:8px 0 12px"><b>${esc(f.name)}</b><div class="muted" style="margin:6px 0 10px">${j.length} retete. Apar ca: ${esc(names.join(", "))}. ${repl?"Inlocuiesc "+repl+" retete existente cu acelasi nume.":"Carte noua in baza."}${vf?" "+vf+" retete sunt marcate verifica si se afiseaza ca text brut.":""}</div><button class="go" data-pv="ok" style="margin:0">Incarca</button> <button class="alt" data-pv="no">Anuleaza</button></div>`}
$("#bnm").oninput=pvDraw;
$("#bfile").onchange=async e=>{const f=e.target.files[0];PEND=null;$("#bm").textContent="";if(!f){pvDraw();return}
 try{const j=JSON.parse(await f.text());if(!Array.isArray(j)||!j.length||!j.every(r=>r&&typeof r==="object"&&r.titlu))throw 0;PEND={j,f};pvDraw()}
 catch(x){pvDraw();$("#bm").textContent="Fisierul nu e un retete.json valid (trebuie sa fie o lista de retete cu titlu)."}};
$("#bpv").onclick=async e=>{const d=e.target.dataset.pv;if(!d)return;
 if(d==="no"){PEND=null;$("#bfile").value="";pvDraw();$("#bm").textContent="Incarcare anulata.";return}
 const {j,f}=PEND;j.forEach(r=>{fixRec(r);r.sursa=srcOf(r,f)});const ns=new Set(j.map(r=>r.sursa)),m=getStored().filter(r=>!ns.has(r.sursa)).concat(j);
 PEND=null;$("#bfile").value="";$("#bnm").value="";pvDraw();setBook(m);
 const ok=await saveStored(m);updBS();
 $("#bm").textContent=ok?"Incarcat: "+j.length+" retete ("+[...ns].join(", ")+"). Total in baza: "+m.length+".":j.length+" retete incarcate, dar nu au putut fi salvate in browser. Le incarci din nou data viitoare."};
fetch("retete.json").then(r=>r.ok?r.json():null).then(j=>{if(Array.isArray(j)&&j.length&&!getStored().length){BOOK=j;drawBook()}}).catch(()=>{});
drawBook();
function renderFav(){
 const saved=getSaved();
 if(FV){if(FV.t==="s"){const r=saved.find(x=>sKey(x)===FV.key);if(r){RC["#favl"]={r,kind:"saved",back:()=>{FV=null;renderFav()}};renderRecipe("#favl");return}FV=null}
  else if(BOOK[FV.i]){RC["#favl"]=null;openBook(FV.i,FV.p,"#favl");return}else FV=null}
 RC["#favl"]=null;const out=[];
 getFav().forEach(k=>{if(k.startsWith("salvat|")){const r=saved.find(x=>sKey(x)===k);if(r)out.push({k,r,t:"s"})}else{const i=BOOK.findIndex(x=>bKey(x)===k);if(i>=0)out.push({k,r:BOOK[i],t:"b"})}});
 $("#favl").innerHTML=out.length?out.map(x=>`<div class="card"><h2>${esc(x.r.titlu)}</h2><div>${x.t==="b"?bChips(x.r):lbH(x.r.etichete)}</div>${jrLine(x.k)}<p class="muted">${x.t==="b"?"Biblioteca mea - "+esc(x.r.sursa||""):"Reteta salvata din idei"}</p><button class="go" data-fo="${esc(x.k)}">Deschide</button> ${favBtn(x.k,"Scoate din favorite",' style="margin-top:12px"')}</div>`).join(""):'<p class="muted">Nu ai favorite inca. Apasa Favorita pe o reteta din Biblioteca mea sau din Salvate.</p>';
}
$("#favl").onclick=e=>{if(rcClick(e,"#favl")||bvClick(e,"#favl"))return;const d=e.target.dataset;
 if(d.fav!==undefined){toggleFav(d.fav);renderFav();return}
 if(d.fo===undefined)return;
 if(d.fo.startsWith("salvat|")){FV={t:"s",key:d.fo};renderFav();window.scrollTo(0,0);return}
 const i=BOOK.findIndex(x=>bKey(x)===d.fo);if(i<0)return;FV={t:"b",i,p:BOOK[i].portii||1};renderFav();window.scrollTo(0,0)};
$("#favl").onchange=e=>{rcChange(e,"#favl")||bvChange(e,"#favl")};

/* "Ce pot gati din debara": ingredientele unei retete care nu sunt acoperite de debara (potrivire putin mai larga decat la cumparaturi) */
let _mv=null,_mm=new WeakMap();
const covered=name=>{if(inPantry(name))return true;const t=[...new Set(toks(name))];if(!t.length)return true;return panTok().some(pt=>pt.length&&t.length<=pt.length+1&&pt.every(w=>t.some(x=>tokEq(w,x))))};
function missing(r){const v=(LS("rp")||"")+"|"+(LS("rcat")||"")+"|"+(LS("rcg")||"");if(v!==_mv){_mv=v;_mm=new WeakMap()}
 let o=_mm.get(r);if(o)return o;
 const names=[...new Set(prepIngs((r.ingrediente||[]).map(x=>({c:x.c,u:x.u,n:x.n,g:x.g}))).map(x=>cleanName(x.n)).filter(Boolean))];
 o={tot:names.length,miss:names.filter(n=>!covered(n))};_mm.set(r,o);return o}
/* lista de cumparaturi */
const BASE=["sare","piper","ulei","zahar","faina"]; /* puse implicit in debara (apa nu se mai cumpara deloc) */
const getList=()=>{try{const j=JSON.parse(LS("rl"));return Array.isArray(j)?j:[]}catch(e){return[]}};
const putList=l=>LS("rl",JSON.stringify(l));
/* ===== DEBARA (produse pe care le ai deja / se consuma greu; fara cantitati) ===== */
let HP=true,PE=null;
/* categorii debara; forme (uscat/congelat/conserva) doar unde au sens */
/* categorii alimente: editabile in Setari -> Etichete alimente (rcg); "altele" ramane mereu ultima */
const DEFCATS=[{id:"condimente",n:"Condimente",f:0},{id:"legume",n:"Legume",f:1},{id:"carne",n:"Carne",f:0},{id:"fructe",n:"Fructe",f:1},{id:"cereale",n:"Cereale",f:1},{id:"lactate",n:"Lactate",f:0},{id:"altele",n:"Altele",f:0}];
const FORMS=["neprocesat","congelat","conserva"];let CATS=[],FCAT=[];
function loadCats(){let l=null;try{l=JSON.parse(LS("rcg"))}catch(e){}if(!Array.isArray(l)||!l.length)l=DEFCATS;
 const seen=new Set();l=l.filter(x=>x&&typeof x.id==="string"&&x.id&&typeof x.n==="string"&&x.n.trim()&&!seen.has(x.id)&&seen.add(x.id)).map(x=>({id:x.id,n:x.n.trim().slice(0,30),f:x.f?1:0}));
 if(!l.some(x=>x.id==="altele"))l.push({id:"altele",n:"Altele",f:0});l.sort((a,b)=>(a.id==="altele")-(b.id==="altele"));
 CATS=l.map(x=>[x.id,x.n]);FCAT=l.filter(x=>x.f).map(x=>x.id);return l}
loadCats();
const CATKW={
 condimente:"sare piper boia cimbru cimbrisor oregano busuioc tarhon dafin nucsoara scortisoara vanilie rozmarin chimen ghimbir turmeric curcuma paprika ienibahar mustar patrunjel marar leustean menta salvie cuisoare coriandru fenicul",
 lactate:"lapte iaurt branza smantana unt telemea cascaval mozzarella parmezan kefir urda mascarpone ricotta cheddar brie gorgonzola lapte frisca",
 carne:"pui piept pulpa pulpe curcan vita porc miel carne carnat carnati sunca bacon cabanos salam crenvurst crenvursti peste somon ton cod macrou pastrav crap creveti calamar fileu ficat inima slanina costita costite mici muschi ciolan aripioare",
 fructe:"mar mere para pere banana banane portocal portocale lamaie lamai lime grapefruit mandarin mandarine clementin capsun capsuni zmeura afin afine visin visine cires cirese piersic piersici caisa caise prun prune struguri strugure pepene kiwi ananas mango avocado rodie smochin smochine curmal curmale stafid stafide fruct fructe",
 cereale:"orez paste spaghete penne fusilli gris malai mamaliga ovaz fulgi quinoa bulgur cuscus grau secara orz mei hrisca faina pesmet paine fasole linte naut cereale musli granola amidon",
 legume:"morcov morcovi cartof cartofi ceapa usturoi rosie rosii tomate castravete castraveti ardei varza vinete vanata dovlecel dovleci dovleac broccoli conopida spanac salata mazare sfecla telina pastarnac ridiche ridichi praz ciuperci ciuperca porumb kale andive rucola sparanghel masline legume ghiveci"};
function guessCat(name){const t=norm(String(name||"").replace(/\([^)]*\)/g," ")).split(/[^a-z0-9]+/).filter(Boolean);
 const has=c=>CATS.some(x=>x[0]===c);if(t.some(w=>["ulei","otet"].includes(w)))return"altele";
 if(t.some(w=>w==="paste"||w==="pasta")&&t.some(w=>/^(rosi|tomat)/.test(w)))return has("legume")?"legume":"altele";
 for(const c of ["condimente","lactate","carne","fructe","cereale","legume"]){if(!has(c))continue;const kw=CATKW[c].split(" ");if(t.some(w=>kw.some(k=>w===k||(k.length>=5&&w.startsWith(k)))))return c}return"altele"}
/* categoria unui aliment: alegerea ta din Setari -> Alimente (rcat) sau potrivirea automata */
const cn=n=>norm(String(n||"").replace(/\([^)]*\)/g," ").replace(/\s+/g," ").trim());
const getCats=()=>{try{const j=JSON.parse(LS("rcat")||"[]");return Array.isArray(j)?j.filter(x=>x&&typeof x.n==="string"&&CATS.some(c=>c[0]===x.c)):[]}catch(e){return[]}};
const putCats=l=>LS("rcat",JSON.stringify(l));
const catOf=n=>{const k=cn(n),o=getCats().find(x=>cn(x.n)===k);return o?o.c:guessCat(n)};
function setCat(n,c){n=String(n||"").replace(/\s+/g," ").trim().slice(0,60);if(!n)return;const l=getCats().filter(x=>cn(x.n)!==cn(n));if(c&&c!==guessCat(n))l.push({n,c});putCats(l)}
const mkPan=(n,f)=>{const c=catOf(n),fs=(Array.isArray(f)?f:[]).map(x=>x==="uscat"?"neprocesat":x).filter((x,i,a)=>FORMS.includes(x)&&a.indexOf(x)===i);return{n,cat:c,f:FCAT.includes(c)?fs:[]}};
/* getPan e apelat pentru fiecare produs din lista: parsarea se face o singura data pe valoare stocata (cache pe cheile rp, rcat, rcg) */
let _pk=null,_pv=[],_pt=null;
const parsePan=()=>{try{const raw=LS("rp");if(raw===null)return BASE.map(n=>mkPan(n));const j=JSON.parse(raw||"[]");return Array.isArray(j)?j.filter(x=>x&&typeof x.n==="string"&&x.n.trim()).map(x=>mkPan(x.n.trim(),x.f)):[]}catch(e){return[]}};
function panCache(){const k=LS("rp")+"\u0001"+LS("rcat")+"\u0001"+LS("rcg");if(k!==_pk){_pv=parsePan();_pk=k;_pt=null}return _pv}
const getPan=()=>panCache().map(p=>({n:p.n,cat:p.cat,f:[...p.f]}));
const panTok=()=>{panCache();return _pt||(_pt=_pv.map(p=>[...new Set(toks(p.n))]))};
const putPan=l=>LS("rp",JSON.stringify(l.map(p=>({n:p.n,f:p.f}))));
/* legaturi: forme care apartin aceluiasi produs (extinde dupa nevoie) */
const ALIAS={ou:"ou",oua:"ou",ouale:"ou",galbenus:"ou",galbenusuri:"ou",galbenusul:"ou",albus:"ou",albusuri:"ou",albusul:"ou"};
const ALIAS_NUME={ou:"oua"};
const STOPW=new Set(["de","din","cu","la","si","sau","in","pe","un","o","fiert","fierte","fiarta","fiarte","proaspat","proaspata","proaspete","tocat","tocata","tocati","tocate","ras","rasa","rase","gatit","gatita","mare","mici","mic","mica","bucati","felii","optional","dupa","gust"]);
function stem(w){if(ALIAS[w])return ALIAS[w];if(w.length>5&&w.endsWith("uri"))w=w.slice(0,-3);else if(w.length>4&&w.endsWith("ii"))w=w.slice(0,-2);else if(w.length>4&&/[ie]$/.test(w))w=w.slice(0,-1);return ALIAS[w]||w}
const toks=n=>norm(String(n||"").replace(/\([^)]*\)/g," ")).split(/[^a-z0-9]+/).filter(w=>w&&!STOPW.has(w)&&!/^\d+$/.test(w)).map(stem);
const tokEq=(a,b)=>a===b||(Math.min(a.length,b.length)>=3&&(a.startsWith(b)||b.startsWith(a)));
/* un produs e "in debara" daca are aceleasi cuvinte ca o intrare din debara (ulei != ulei de masline) */
function inPantry(name){const t=[...new Set(toks(name))];if(!t.length)return false;return panTok().some(pt=>pt.length&&pt.every(w=>t.some(x=>tokEq(w,x)))&&t.every(x=>pt.some(w=>tokEq(w,x))))}
if(!LS("rdef4")){try{(JSON.parse(LS("rp")||"[]")||[]).forEach(x=>{if(x&&typeof x.n==="string"&&CATS.some(c=>c[0]===x.cat)&&x.cat!==guessCat(x.n))setCat(x.n,x.cat)})}catch(e){}LS("rdef4","1")}
if(!LS("rdef3")){BASE.forEach(addPan);LS("rdef3","1")} /* 1.8.1: produsele de baza intra in debara, o singura data */
const hid=x=>!x.done&&HP&&inPantry(x.n);
const cleanName=n=>String(n||"").replace(/\([^)]*\)/g," ").replace(/\s+/g," ").trim();
const sugName=n=>{const t=toks(n).find(w=>ALIAS_NUME[w]);return t?ALIAS_NUME[t]:cleanName(n)};
function addPan(name){name=String(name||"").trim().slice(0,60);if(!name)return false;const l=getPan(),k=norm(name).trim();if(l.some(x=>norm(x.n).trim()===k))return false;
 if(l.length>=500){toast("Debaraua are deja 500 de produse.");return false}l.push(mkPan(name));putPan(l);return true}
function drawPantry(){const l=getPan();
 $("#pl").innerHTML=l.length?`<p class="muted" style="margin:10px 0 12px">${l.length} produse</p><div class="pgrid">`+CATS.map(([id,lab])=>{const it=l.filter(p=>p.cat===id).sort((a,b)=>norm(a.n).localeCompare(norm(b.n)));
  if(!it.length)return"";return `<section class="pcat" aria-label="${esc(lab)}"><h3>${esc(lab)} <span class="muted">${it.length||""}</span></h3>`+(it.length?it.map(p=>`<div class="pit"><div class="pn">${esc(p.n)}</div>${FCAT.includes(id)?`<div class="pf">${FORMS.map(f=>`<button type="button" class="fchip${p.f.includes(f)?" on":""}" data-pf="${f}" data-pn="${esc(p.n)}" aria-pressed="${p.f.includes(f)}">${f}</button>`).join("")}</div>`:""}<div class="pa"><button class="alt" data-pdone="${esc(p.n)}" title="Il pune inapoi in Cumparaturi">Am terminat</button><button class="alt" data-pdel="${esc(p.n)}" aria-label="Scoate ${esc(p.n)} din debara">x</button></div></div>`).join(""):`<p class="muted" style="margin:4px 0 0">-</p>`)+`</section>`}).join("")+`</div>`:'<p class="muted">Debaraua e goala. Adauga produse sau muta-le din Cumparaturi cu "Am in debara".</p>'}
$("#pAdd").onclick=()=>{const v=$("#pin").value;if(addPan(v)){$("#pin").value="";drawPantry();navCount()}else if(v.trim())toast("Produsul e deja in debara.")};
$("#pin").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();$("#pAdd").click()}};
$("#pl").onclick=e=>{const b=e.target.closest("[data-pf]")||e.target,d=b.dataset;
 if(d.pf!==undefined){const l=getPan(),p=l.find(x=>x.n===d.pn);if(p){p.f=p.f.includes(d.pf)?p.f.filter(x=>x!==d.pf):[...p.f,d.pf];putPan(l);drawPantry()}return}
 if(d.pdel!==undefined){const u=undoMark(["rp","rcat"]);putPan(getPan().filter(x=>x.n!==d.pdel));drawPantry();navCount();undoShow("Scos din debara: "+d.pdel+".",u,redrawAll)}
 if(d.pdone!==undefined){const u=undoMark(["rp","rcat","rl"]);putPan(getPan().filter(x=>x.n!==d.pdone));addList([{n:d.pdone,u:"",c:null}],"Debara");drawPantry();undoShow("\""+d.pdone+"\" a fost pus inapoi in Cumparaturi.",u,redrawAll)}};
function navCount(){const n=getList().filter(x=>!x.done&&!hid(x)).length;document.querySelector('#nav [data-v=lista]').textContent="Cumparaturi"+(n?" ("+n+")":"");document.querySelector('#gnav [data-g=plan]').textContent="Planific"+(n?" ("+n+")":"")}
/* scoate din ingrediente ce nu se cumpara: antete (VARIANTE DE CARNE, "Pentru sos:"), trimiteri, texte de pas; desparte liste scurte cu virgula ("sare, piper") */
const PUN=["g","kg","ml","l","cl","lingura","linguri","lingurita","lingurite","catel","catei","cana","cani","ceasca","cesti","buc","bucata","bucati","felie","felii","praf","varf","pachet","pachete","conserva","conserve","legatura","legaturi","fir","fire","cub","cuburi"];
/* "1 lingurita sare" -> {c:1,u:"lingurita",n:"sare"}; fara cantitate -> doar nume (fara "dupa gust") */
function bit(p){p=p.replace(/(\d+)\s*([\u00bd\u00bc\u00be])/,(_,a,f)=>String(+a+({"\u00bd":.5,"\u00bc":.25,"\u00be":.75})[f])).replace(/\s*[\u2013\u2014-]\s*(dup[a\u0103\u00e2]\s+gust|op[t\u021b\u0163]ional).*$/i,"").replace(/\s+(dup[a\u0103\u00e2]\s+gust|op[t\u021b\u0163]ional)$/i,"").replace(/\s+/g," ").trim();
 const m=p.match(/^(\d+(?:[.,]\d+)?|[\u00bd\u00bc\u00be])\s*([^\s\d]+)?\s*(.*)$/);
 if(m){let u=m[2]||"",n=m[3]||"";const c=/^[\u00bd\u00bc\u00be]$/.test(m[1])?({"\u00bd":.5,"\u00bc":.25,"\u00be":.75})[m[1]]:+m[1].replace(",",".");
  if(u&&!PUN.includes(norm(u))){n=(u+" "+n).trim();u=""}
  return n&&n.split(" ").length<=6?{c,u,n}:null}
 return p&&p.split(" ").length<=5?{c:null,u:"",n:p}:null}
/* scoate din ingrediente ce nu se cumpara: antete (VARIANTE DE CARNE, "Pentru sos:"), trimiteri, texte de pas; desparte "Condimente: sare, piper" si listele scurte cu virgula */
/* apa de la robinet nu intra in cumparaturi: "apa", "apa rece", "500 ml apa calduta"; "apa minerala" sau "apa de trandafiri" raman */
const WATERX=new Set(["rece","calda","calduta","caldut","fierbinte","fiarta","clocotita","filtrata","la","temperatura","camerei","de","robinet","ml","l","cl","dl","litru","litri","pahar","pahare","cana","cani","ceasca","cesti","lingura","linguri","putina","putin","cat","se","cere","dupa","nevoie","gust"]);
const isWater=n=>{const w=norm(String(n||"").replace(/\([^)]*\)/g," ")).split(/[^a-z0-9]+/).filter(t=>t&&!/^\d+$/.test(t)&&!WATERX.has(t));return w.length===1&&w[0]==="apa"};
function prepIngs(ings){const out=[];let skip=false;
 (ings||[]).forEach(x=>{if(!x||isWater(x.n))return;const nm=String(x.n||"").trim(),noQ=(x.c===""||x.c==null||isNaN(+x.c))&&!String(x.u||"").trim();
  if(noQ&&nm&&((nm===nm.toUpperCase()&&/[A-Z\u0102\u00c2\u00ce\u0218\u021a]{2}/.test(nm))||/:$/.test(nm))){skip=/\bvariante\b/i.test(nm);return}
  if(skip&&!x.g)return;if(x.g&&/\bvariante\b/i.test(x.g))return;
  if(noQ&&(/^(se|pentru [^:]*,|v\.|aceleasi)\s/i.test(norm(nm))||nm.length>90))return;
  if(noQ){const body=nm.replace(/\([^)]*\)/g," "),lab=body.match(/^([^:\d]{2,40}):\s*(.*)$/),txt=lab?lab[2]:body;
   const SP=/^(sare|piper|boia|cimbru|oregano|busuioc|tarhon|dafin|foi|nucsoara|scortisoara|vanilie|zahar|stevia|rozmarin|cimbrisor|patrunjel|marar|leustean|usturoi|lamaie|zeama|suc|ulei|otet|mustar|chimen|ghimbir|turmeric|curcuma|paprika|ienibahar)\b/;
   if(lab||(/[,;]|\s(si|\u0219i)\s/.test(body)&&txt.split(/[,;]|\s+(?:si|\u0219i)\s+/).some(t=>SP.test(norm(t.trim()))))){const bits=txt.split(/[,;]|\s+(?:si|\u0219i)\s+/).map(bit);if(bits.length&&bits.every(Boolean)){bits.forEach(b=>out.push(b));return}
    const ok=bits.filter(Boolean);if(lab){ok.forEach(b=>out.push(b));return}}}
  out.push(x)});
 return out}
function addList(ings,title){const l=getList();let n=0;ings=prepIngs(ings);
 ings.forEach(x=>{const nm=String(x.n||"").trim();if(!nm)return;const u=String(x.u||"").trim(),c=(x.c===""||x.c==null||isNaN(+x.c))?null:+x.c,k=norm(nm)+"|"+norm(u);
  let it=l.find(y=>y.k===k&&!y.done);
  if(it){if(it.c!=null&&c!=null)it.c=+(it.c+c).toFixed(2);else if(it.c==null)it.c=c;if(!it.src.includes(title))it.src.push(title)}
  else l.push({k,n:nm,u,c,src:[title],done:0});n++});
 putList(l);navCount();return n}
/* Anuleaza: instantaneu la stergere, cu 8 secunde pentru a reveni (in loc de "Confirma") */
let UDO=null,UDT=0;
const undoMark=keys=>{const s={};keys.forEach(k=>{try{s[k]=localStorage.getItem(k)}catch(e){s[k]=null}});return s};
function undoHide(){UDO=null;clearTimeout(UDT);$("#undo").classList.add("hidden")}
function undoShow(msg,snap,redraw){UDO={snap,redraw};$("#undot").textContent=msg;$("#undo").classList.remove("hidden");clearTimeout(UDT);UDT=setTimeout(undoHide,8000)}
const redrawAll=()=>{navCount();drawList();drawPantry();drawMenu()};
$("#undob").onclick=()=>{if(!UDO)return;const u=UDO;undoHide();
 try{Object.keys(u.snap).forEach(k=>{if(u.snap[k]==null)localStorage.removeItem(k);else localStorage.setItem(k,u.snap[k])})}catch(e){toast("Nu am putut anula: memoria browserului nu mai raspunde.");return}
 u.redraw();toast("Anulat.")};
const fmtQ=c=>c>=10?String(Math.round(c)):c>=1?String(+c.toFixed(1)):String(+c.toFixed(2));
const itTxt=x=>(x.c!=null?fmtQ(x.c)+" ":"")+(x.u?x.u+" ":"")+x.n;
let GRP=LS("rgrp")!=="0";
const canShare=()=>typeof navigator!=="undefined"&&typeof navigator.share==="function";
/* text pentru copiere / trimitere: grupat pe categorii daca bifa e activa */
function listTxt(){const it=getList().filter(x=>!x.done&&!hid(x));
 if(!GRP)return it.map(x=>"- "+itTxt(x)).join("\n");
 return CATS.map(([id,lab])=>{const g=it.filter(x=>catOf(x.n)===id);return g.length?lab+":\n"+g.map(x=>"- "+itTxt(x)).join("\n"):""}).filter(Boolean).join("\n\n")}
function lAdd(){const el=$("#lAddI"),t=(el&&el.value||"").trim();if(!t)return;
 const items=t.split(/[,;]+/).map(s=>s.trim()).filter(Boolean).map(s=>bit(s)||{c:null,u:"",n:s});
 const n=addList(items,"Adaugat manual");drawList();const e2=$("#lAddI");if(e2){e2.focus()}
 if(!n)toast("Nu am adaugat nimic: apa de la robinet nu intra in lista.");else if(n<items.length)toast("Am adaugat "+n+" din "+items.length+" (cele ramase erau deja in lista sau nu se cumpara).")}
function drawList(){const l=getList(),pan=getPan().length,vis=l.map((x,i)=>[x,i]).filter(([x])=>!hid(x)),np=l.filter(x=>!x.done&&HP&&inPantry(x.n)).length;
 vis.sort((a,b)=>a[0].done-b[0].done);
 const rowH=([x,i])=>PE===i?`<div class="it"><div style="flex-basis:100%"><div class="muted" style="margin-bottom:4px">Adauga in debara ca (nume general):</div><input id="lpn" maxlength="60" value="${esc(sugName(x.n))}" aria-label="Nume in debara"></div><button class="go" data-lpok="${i}" style="margin:0">Muta</button><button class="alt" data-lpno="1">Anuleaza</button></div>`:`<div class="it${x.done?" done":""}"><input type="checkbox" data-ld="${i}" ${x.done?"checked":""} aria-label="Cumparat"><div><div class="tx">${esc(itTxt(x))}${!HP&&!x.done&&inPantry(x.n)?` <span class="lb">in debara</span>`:""}</div><div class="src">${esc(x.src.join(", "))}</div></div>${x.done?"":`<button class="alt" data-lp="${i}" title="Il muta in Debaraua mea">Am in debara</button>`}<button class="alt" data-lx="${i}" aria-label="Scoate">x</button></div>`;
 let body;
 if(!vis.length)body=`<p class="muted">${l.length?"Totul e ascuns sau bifat.":"Lista e goala. Scrie mai sus un produs sau deschide o reteta si apasa Adauga la cumparaturi. Bifeaza ce ai deja in casa direct aici."}</p>`;
 else if(GRP)body=CATS.map(([id,lab])=>{const g=vis.filter(([x])=>catOf(x.n)===id);return g.length?`<h3 class="lgh">${esc(lab)}</h3>`+g.map(rowH).join(""):""}).join("");
 else body=vis.map(rowH).join("");
 $("#ll").innerHTML=`<div class="row" style="gap:8px;margin-bottom:8px"><input id="lAddI" maxlength="120" placeholder="Adauga produs, ex: 2 l lapte, paine" aria-label="Produs nou in lista" style="flex:1;min-width:160px" autocomplete="off"><button class="go" id="lAddB" style="margin:0">Adauga</button></div>`+(l.length?`<div class="row" style="gap:8px;margin-bottom:8px"><button class="go" id="lCp" style="margin:0">Copiaza lista</button><button class="alt" id="lDn">Sterge bifate</button><button class="alt" id="lAll">Goleste lista</button>${canShare()?`<button class="alt" id="lSh">Trimite lista</button>`:""}</div>
 <label style="font-weight:400;margin:6px 0"><input type="checkbox" id="lHp" style="width:auto" ${HP?"checked":""}> Ascunde produsele din debara${pan?"":" (debaraua e goala)"}${np?" - "+np+" ascunse":""}</label><div id="lmsg" class="muted"></div><label style="font-weight:400;margin:6px 0"><input type="checkbox" id="lGr" style="width:auto" ${GRP?"checked":""}> Grupeaza pe categorii</label>`:"")+body}
$("#ll").onchange=e=>{const d=e.target.dataset;if(e.target.id==="lGr"){GRP=e.target.checked;LS("rgrp",GRP?"1":"0");drawList();return}
 if(e.target.id==="lHp"){HP=e.target.checked;PE=null;drawList();navCount();return}
 if(d.ld!==undefined){const l=getList();l[d.ld].done=e.target.checked?1:0;putList(l);navCount();drawList()}};
$("#ll").onkeydown=e=>{if(e.key==="Enter"&&e.target.id==="lAddI"){e.preventDefault();lAdd();return}if(e.key==="Enter"&&e.target.id==="lpn"){e.preventDefault();const b=document.querySelector("[data-lpok]");if(b)b.click()}if(e.key==="Escape"&&PE!==null){PE=null;drawList()}};
$("#ll").onclick=e=>{const b=e.target,d=b.dataset,id=b.id;
 if(d.lp!==undefined){PE=+d.lp;drawList();const el=$("#lpn");if(el){el.focus();el.select()}return}
 if(d.lpno!==undefined){PE=null;drawList();return}
 if(d.lpok!==undefined){const nm=($("#lpn")||{}).value||"",l=getList(),it=l[+d.lpok];if(!nm.trim()||!it)return;const u=undoMark(["rl","rp","rcat"]);addPan(nm);l.splice(+d.lpok,1);putList(l);PE=null;navCount();drawList();$("#lmsg").textContent="\""+nm.trim()+"\" e acum in Debaraua mea.";undoShow("Mutat in debara: "+nm.trim()+".",u,redrawAll);return}
 if(PE!==null)PE=null;
 if(d.lx!==undefined){const u=undoMark(["rl"]),l=getList(),nm=(l[d.lx]||{}).n;l.splice(d.lx,1);putList(l);navCount();drawList();undoShow("Scos din lista: "+nm+".",u,redrawAll);return}
 if(id==="lAddB"){lAdd();return}
 if(id==="lSh"){const t=listTxt();if(!t){$("#lmsg").textContent="Nu ai nimic de trimis.";return}navigator.share({title:"Lista de cumparaturi",text:t}).catch(()=>{});return}
 if(id==="lCp"){const t=listTxt();
  const ok=()=>{$("#lmsg").textContent="Copiat. Poti lipi lista oriunde."};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,()=>{$("#lmsg").textContent="Nu am putut copia automat. Selecteaza textul manual."});
  else{const ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");ok()}catch(x){}ta.remove()}return}
 if(id==="lDn"||id==="lAll"){const u=undoMark(["rl"]),n0=getList().length;putList(id==="lAll"?[]:getList().filter(x=>!x.done));navCount();drawList();const n1=getList().length;if(n0!==n1)undoShow((id==="lAll"?"Lista a fost golita":"Produsele bifate au fost sterse")+" ("+(n0-n1)+").",u,redrawAll)}};
if(!LS("rcl3")){const l0=getList(),l1=[];l0.forEach(x=>{const p=prepIngs([{c:x.c,u:x.u,n:x.n}]);p.forEach(q=>l1.push(Object.assign({},x,{n:q.n,k:norm(q.n)+"|"+norm(x.u||"")})))});if(l1.length!==l0.length||l1.some((q,i)=>q.n!==(l0[i]||{}).n))putList(l1);LS("rcl3","1")}
navCount();
/* versiune */
/* ===== Mod gatit: un pas pe ecran, font mare, ecran aprins, cronometre ===== */
let CK=null,CT=[],CTI=0,WL=null,CTX=null,CTN=1;
/* durata dintr-un text de pas ("fierbe 20-25 min" -> 20; "2 ore" -> 120); null daca nu gaseste */
function minFrom(t){const m=norm(String(t||"")).match(/(\d+(?:[.,]\d+)?)\s*(?:-|pana la|[\u2013\u2014])?\s*(?:\d+(?:[.,]\d+)?)?(?:\s+de)?\s*(minute|minut|min|ore|ora|secunde|sec)\b/);
 if(!m)return null;let n=+m[1].replace(",",".");if(/^or/.test(m[2]))n*=60;else if(/^sec/.test(m[2]))n/=60;return n>0&&n<=600?n:null}
function cookSteps(r,kind){
 if(kind==="b")return(r.pasi_carte||[]).map(t=>({text:String(t),ap:"",par:"",min:minFrom(t),warn:[]}));
 return timeline(r.pasi||[]).map(s=>({text:s.text,ap:s.aparat,par:params(s),min:+s.durata_min>0?+s.durata_min:minFrom(s.text),warn:check(s)}))}
const ingGen=r=>(r.ingrediente||[]).map(i=>[i.cantitate,i.unitate,i.nume].filter(x=>x!==""&&x!=null).join(" "));
const ingBook=(r,f)=>(r.ingrediente||[]).map(x=>(x.c!=null?fmtQ(x.c*f)+" ":"")+(x.u?x.u+" ":"")+x.n);
const fmtT=s=>{s=Math.max(0,Math.ceil(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return(h?h+":"+String(m).padStart(2,"0"):m)+":"+String(s%60).padStart(2,"0")};
async function wlOn(){try{if(navigator.wakeLock&&!WL){WL=await navigator.wakeLock.request("screen");WL.addEventListener&&WL.addEventListener("release",()=>{WL=null})}}catch(e){WL=null}}
function wlOff(){try{WL&&WL.release()}catch(e){}WL=null}
document.addEventListener("visibilitychange",()=>{if(CK&&document.visibilityState==="visible")wlOn()});
function beep(n){try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;CTX=CTX||new A();if(CTX.state==="suspended")CTX.resume();
 for(let k=0;k<(n||3);k++)setTimeout(()=>{const o=CTX.createOscillator(),g=CTX.createGain();o.connect(g);g.connect(CTX.destination);o.frequency.value=880;g.gain.value=.25;o.start();o.stop(CTX.currentTime+.35)},k*550)}catch(e){}}
function cookOpen(title,steps,ing){if(!steps.length){toast("Reteta asta nu are pasi de afisat in modul gatit.");return}
 CK={title,steps,ing,i:0,arm:0};$("#cook").classList.remove("hidden");document.body.style.overflow="hidden";wlOn();drawCook();ckTimers();setTimeout(()=>{const b=document.querySelector("[data-ckn]");if(b)b.focus()},0)}
function cookClose(force){if(!CK)return;if(!force&&CT.some(t=>!t.done)&&!CK.arm){CK.arm=1;drawCook();return}
 CT=[];clearInterval(CTI);CTI=0;CK=null;wlOff();$("#cook").classList.add("hidden");$("#cook").innerHTML="";document.body.style.overflow=""}
function drawCook(){if(!CK)return;const s=CK.steps[CK.i],n=CK.steps.length,last=CK.i===n-1;
 $("#cook").innerHTML=`<div class="cookin" role="dialog" aria-modal="true" aria-label="Mod gatit"><div class="ckh"><div style="min-width:0"><b>${esc(CK.title)}</b><div class="muted">Pasul ${CK.i+1} din ${n}</div></div><button class="alt" data-ckx="1">${CK.arm?"Opreste cronometrele si inchide":"Inchide"}</button></div>
 <div class="ckbar" aria-hidden="true"><i style="width:${Math.round((CK.i+1)/n*100)}%"></i></div><div id="cktm"></div>
 <div class="ckstep">${s.ap?`<div>${tag(s.ap)}</div>`:""}<p>${esc(s.text)}</p>${s.par?`<div class="par" style="font-size:1rem">${esc(s.par)}</div>`:""}${(s.warn||[]).map(x=>`<div class="warn">${esc(x)}</div>`).join("")}
 ${s.min?`<button class="go" data-cktm="${s.min}" data-cklab="Pasul ${CK.i+1}" style="margin-top:12px">Porneste cronometrul (${s.min<1?Math.round(s.min*60)+" sec":+s.min.toFixed(1)+" min"})</button>`:""}</div>
 <div class="ckn"><button class="alt" data-ckp="1" ${CK.i?"":"disabled"}>Inapoi</button><button class="go" data-ckn="1" style="margin:0">${last?"Gata, pofta buna!":"Inainte"}</button></div>
 <details class="cking"><summary>Ingrediente (${CK.ing.length})</summary><ul>${CK.ing.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></details></div>`;ckTimers()}
function ckTimers(){const el=$("#cktm");if(!el)return;
 el.innerHTML=CT.map(t=>`<div class="cktm${t.done?" fin":""}"><div style="flex:1"><div class="muted">${esc(t.lab)}</div><b data-tmv="${t.id}">${t.done?"Gata!":fmtT((t.end-Date.now())/1000)}</b></div><button class="alt" data-cktx="${t.id}">${t.done?"OK":"Opreste"}</button></div>`).join("")}
function ckTick(){if(!CK){clearInterval(CTI);CTI=0;return}let ch=false;
 CT.forEach(t=>{if(t.done)return;const left=(t.end-Date.now())/1000;if(left<=0){t.done=true;ch=true;beep(4);try{navigator.vibrate&&navigator.vibrate([400,200,400,200,400])}catch(e){}}
  else{const e=document.querySelector('[data-tmv="'+t.id+'"]');if(e)e.textContent=fmtT(left)}});if(ch)ckTimers()}
$("#cook").onclick=e=>{const d=e.target.dataset;if(!CK)return;
 if(d.ckx!==undefined){cookClose(false);return}
 if(d.ckp!==undefined){if(CK.i>0){CK.i--;CK.arm=0;drawCook()}return}
 if(d.ckn!==undefined){if(CK.i<CK.steps.length-1){CK.i++;CK.arm=0;drawCook();window.scrollTo(0,0);$("#cook").scrollTop=0}else cookClose(false);return}
 if(d.cktm!==undefined){const min=+d.cktm;beep(0);CT.push({id:CTN++,lab:d.cklab||"Cronometru",end:Date.now()+min*60000,done:false});if(!CTI)CTI=setInterval(ckTick,500);ckTimers();return}
 if(d.cktx!==undefined){CT=CT.filter(t=>String(t.id)!==d.cktx);ckTimers();return}};
document.addEventListener("keydown",e=>{if(!CK)return;if(e.key==="Escape"){cookClose(false)}else if(e.key==="ArrowRight"&&!/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||"")){const b=document.querySelector("[data-ckn]");if(b)b.click()}else if(e.key==="ArrowLeft"){const b=document.querySelector("[data-ckp]");if(b&&!b.disabled)b.click()}});
/* ===== Primii pasi (apare doar cat mai lipsesc lucruri esentiale; se poate ascunde) ===== */
function drawOnb(){const el=$("#onb");if(!el)return;
 const st=[["key","Adauga cheia API","Pentru idei si adaptari cu model (restul aplicatiei merge si fara).",!!LS("rk")],
  ["lib","Incarca-ti cartile de retete","Fisierele JSON cu retetele tale; raman doar in browserul tau.",getStored().length>0],
  ["pan","Spune ce ai in Debara","Ca sa vezi ce poti gati fara sa cumperi nimic.",getPan().some(p=>!BASE.includes(p.n))]],n=st.filter(x=>x[3]).length;
 if(LS("ronb")==="1"||n===st.length){el.innerHTML="";return}
 el.innerHTML=`<div class="card onb"><div class="mh"><h2>Primii pasi <span class="muted">(${n} din ${st.length})</span></h2><button class="alt" data-onbx="1">Ascunde</button></div>`+st.map(([id,t,d,ok])=>`<div class="me"><span class="onbc${ok?" ok":""}" aria-hidden="true">${ok?"\u2713":""}</span><div class="mn"><div class="tx">${esc(t)}</div><div class="muted">${esc(d)}</div></div>${ok?"":`<button class="alt" data-onb="${id}">Mergi</button>`}</div>`).join("")+`</div>`}
$("#onb").onclick=e=>{const d=e.target.dataset;
 if(d.onbx!==undefined){LS("ronb","1");drawOnb();return}
 if(d.onb==="key"){show("setari");setSub("cont");return}
 if(d.onb==="lib"){show("setari");setSub("biblioteca");return}
 if(d.onb==="pan"){show("debara")}};
/* ===== Preferinte alimente: "Imi plac" si "Evit" (folosite la propunerea de meniu si ca avertisment in Biblioteca) ===== */
function getPf(){let j;try{j=JSON.parse(LS("rpf")||"{}")}catch(e){j={}}if(!j||typeof j!=="object")j={};
 const c=a=>[...new Set((Array.isArray(a)?a:[]).map(x=>String(x==null?"":x).replace(/\s+/g," ").trim().slice(0,40)).filter(Boolean))].slice(0,200);return{l:c(j.l),e:c(j.e)}}
const putPf=p=>LS("rpf",JSON.stringify(p));
const pfOn=()=>{const p=getPf();return p.l.length+p.e.length>0};
let _pfv=null,_pfm=new WeakMap(),_pft=null;
/* un aliment din lista se potriveste cu un ingredient daca toate cuvintele lui apar in ingredient ("ciuperci" in "ciuperci champignon") */
function pfCheck(){const v=LS("rpf")||"";if(v!==_pfv){_pfv=v;_pfm=new WeakMap();const p=getPf();_pft={l:p.l.map(n=>[n,[...new Set(toks(n))]]).filter(x=>x[1].length),e:p.e.map(n=>[n,[...new Set(toks(n))]]).filter(x=>x[1].length)}}return _pft}
const pfHit=(pt,t)=>pt.every(w=>t.some(x=>tokEq(w,x)));
function recPref(r){const P=pfCheck();if(!P.l.length&&!P.e.length)return{av:[],lk:[]};
 let o=_pfm.get(r);if(o)return o;
 const names=[r.titlu,...prepIngs((r.ingrediente||[]).map(x=>({c:x.c!=null?x.c:x.cantitate,u:x.u!=null?x.u:x.unitate,n:x.n!=null?x.n:x.nume,g:x.g}))).map(x=>x.n)].filter(Boolean).map(n=>[...new Set(toks(n))]);
 const m=L=>L.filter(([n,pt])=>names.some(t=>pfHit(pt,t))).map(x=>x[0]);
 o={av:m(P.e),lk:m(P.l)};_pfm.set(r,o);return o}
const pfLine=r=>{const p=recPref(r);return(p.av.length?`<div class="miss">Contine ce eviti: ${esc(p.av.join(", "))}</div>`:"")+(p.lk.length?`<div class="miss ok">Iti place: ${esc(p.lk.join(", "))}</div>`:"")};
function drawPf(){const p=getPf(),ch=(a,k)=>a.length?a.map(n=>`<span class="pfc">${esc(n)}<button type="button" data-pfx="${k}" data-pfn="${esc(n)}" aria-label="Scoate ${esc(n)}">x</button></span>`).join(""):`<span class="muted">Nimic inca.</span>`;
 $("#pfLl").innerHTML=ch(p.l,"l");$("#pfEl").innerHTML=ch(p.e,"e")}
function pfAdd(k){const el=$(k==="l"?"#pfl":"#pfe"),t=(el.value||"").split(/[,;]+/).map(s=>s.trim().slice(0,40)).filter(Boolean);if(!t.length)return;
 const p=getPf(),o=k==="l"?"e":"l";let dup=[];
 t.forEach(n=>{const nn=norm(n);if(p[o].some(x=>norm(x)===nn)){dup.push(n);return}if(!p[k].some(x=>norm(x)===nn))p[k].push(n)});
 putPf(p);el.value="";drawPf();el.focus();
 if(dup.length)toast(dup.join(", ")+(dup.length>1?" sunt":" e")+" deja in cealalta lista, nu l-am adaugat si in aceasta.")}
$("#pfcard").onclick=e=>{const d=e.target.dataset,id=e.target.id;
 if(id==="pfAddL"){pfAdd("l");return}if(id==="pfAddE"){pfAdd("e");return}
 if(d.pfx){const u=undoMark(["rpf"]),p=getPf();p[d.pfx]=p[d.pfx].filter(n=>n!==d.pfn);putPf(p);drawPf();undoShow("Scos din lista: "+d.pfn+".",u,()=>drawPf())}};
$("#pfcard").onkeydown=e=>{if(e.key==="Enter"&&(e.target.id==="pfl"||e.target.id==="pfe")){e.preventDefault();pfAdd(e.target.id==="pfl"?"l":"e")}};
/* ===== Meniu saptamanal (mic dejun / pranz / desert) ===== */
const SLOTS=[["mic","Mic dejun"],["pranz","Pranz"],["desert","Desert"]];
/* citire curatata: ce nu arata ca o intrare valida (copie veche, date stricate) se ignora */
function getMen(){let j;try{j=JSON.parse(LS("rmen")||"{}")}catch(e){j={}}
 const o={};if(!j||typeof j!=="object"||Array.isArray(j))return o;
 Object.keys(j).forEach(d=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!j[d]||typeof j[d]!=="object")return;const x={};
  SLOTS.forEach(([s])=>{const a=Array.isArray(j[d][s])?j[d][s].filter(en=>en&&typeof en==="object"&&["b","s","x"].includes(en.s)&&typeof en.t==="string"&&en.t):[];if(a.length)x[s]=a});
  if(Object.keys(x).length)o[d]=x});return o}
function putMen(m){const lim=dAdd(dKey(new Date()),-120);Object.keys(m).forEach(d=>{if(d<lim||!SLOTS.some(([s])=>(m[d][s]||[]).length))delete m[d]});LS("rmen",JSON.stringify(m))}
/* reteta de acum din biblioteca / salvate (poate lipsi daca a fost stearsa) */
function menRec(en){
 if(en.s==="b"){const i=BOOK.findIndex(r=>bKey(r)===en.k);return i<0?null:{i,r:BOOK[i]}}
 if(en.s==="s"){const r=getSaved().find(x=>sKey(x)===en.k);return r?{r}:null}
 return null}
const rawIngs=(s,r)=>(r.ingrediente||[]).map(x=>s==="b"?{c:x.c!=null&&x.c!==""&&!isNaN(+x.c)?+x.c:null,u:x.u||"",n:x.n,g:x.g}:{c:x.cantitate===""||x.cantitate==null||isNaN(+x.cantitate)?null:+x.cantitate,u:x.unitate||"",n:x.nume}).filter(x=>x.n);
function mkEntry(s,r,p){const base=r.portii||1,mc=s==="b"&&r.macro&&r.macro.kcal!=null?[r.macro.kcal,r.macro.proteine,r.macro.carbo,r.macro.grasimi].map(x=>x==null||isNaN(+x)?null:+x):null;
 return{t:r.titlu,s,k:s==="b"?bKey(r):sKey(r),p:clampP(p||base),bp:base,i:rawIngs(s,r).slice(0,40),m:mc,L:0}}
/* macro din meniu: valorile "per portie" ale cartilor (kcal, proteine, carbo, grasimi); se aduna cate 1 portie din fiecare intrare */
function menMac(en){let a=null;const rec=en.s==="b"?menRec(en):null;
 if(rec&&rec.r.macro&&rec.r.macro.kcal!=null){const m=rec.r.macro;a=[m.kcal,m.proteine,m.carbo,m.grasimi]}else if(Array.isArray(en.m))a=en.m;
 if(!a)return null;a=a.slice(0,4).map(x=>x==null||isNaN(+x)?null:+x);return a[0]==null?null:a}
function getMT(){try{const j=JSON.parse(LS("rmt")||"{}");return{k:+j.k>0?Math.min(9999,+j.k):0,p:+j.p>0?Math.min(999,+j.p):0}}catch(e){return{k:0,p:0}}}
function dayMac(dm){const s=[0,0,0,0];let n=0,nd=0;SLOTS.forEach(([id])=>(dm[id]||[]).forEach(en=>{n++;const a=menMac(en);if(a){nd++;a.forEach((v,i)=>{if(v!=null)s[i]+=v})}}));return{n,nd,s:s.map(Math.round)}}
let MTO=false;
/* ingredientele unei intrari, scalate la portiile din meniu; daca reteta nu mai exista se folosesc cele salvate in meniu */
function menIngs(en){
 if(en.s==="x")return[];
 const m=menRec(en);let raw,base;
 if(m){raw=rawIngs(en.s,m.r);base=m.r.portii||1}else{raw=Array.isArray(en.i)?en.i:[];base=+en.bp||1}
 const f=clampP(en.p||base)/base;
 return raw.map(x=>({c:x.c!=null?+(x.c*f).toFixed(2):null,u:x.u,n:x.n,g:x.g}))}
/* masa propusa dupa ora / felul retetei */
const DESERT=/\b(desert|prajitur|tort|cozonac|inghetata|budinca|placinta|checs|clatite|papanasi|fursec|biscui|ecler|mousse|cheesecake|brownie)/;
const guessSlot=r=>{const t=norm((r.categorie||"")+" "+(r.titlu||""));return DESERT.test(t)?"desert":new Date().getHours()<10?"mic":"pranz"};

let MD=null;
function menOpen(o){const r=o.r||null;MD={day:o.day||dKey(new Date()),slot:o.slot||(r?guessSlot(r):"pranz"),s:o.s||null,r,p:o.p||null,q:""};
 const today=dKey(new Date()),mt=monOf(today);let st=MD.day<mt?monOf(MD.day):mt;if(MD.day>dAdd(st,34))st=monOf(MD.day);
 const dopt=[...Array(35)].map((_,i)=>{const k=dAdd(st,i);return`<option value="${k}"${k===MD.day?" selected":""}>${esc(dLab(k))}${k===today?" (azi)":""}</option>`}).join("");
 const sopt=SLOTS.map(([id,l])=>`<option value="${id}"${id===MD.slot?" selected":""}>${l}</option>`).join("");
 const body=r?`<p style="margin:12px 0 0"><b>${esc(r.titlu)}</b></p>${o.s==="b"&&r.portii==null?`<p class="muted">Cantitatile sunt cele din carte.</p>`:`<label for="mdp">Portii</label><input id="mdp" type="number" min="1" max="99" value="${esc(MD.p||r.portii||1)}" style="max-width:110px">`}<div class="row" style="margin-top:14px"><button class="go" data-mdok="1" style="margin:0">Adauga in meniu</button><button class="alt" data-mdx="1">Anuleaza</button></div>`
  :`<label for="mdq" style="margin-top:12px">Cauta o reteta (nume sau ingrediente)</label><input id="mdq" placeholder="ex: ciorba, piept de pui" autocomplete="off"><div id="mdres"></div>
   <label for="mdt">Sau scrie liber (ex: resturi, iesim in oras)</label><div class="row" style="gap:8px"><input id="mdt" maxlength="80" style="flex:1"><button class="alt" data-mdtxt="1">Adauga text</button></div><div class="row" style="margin-top:14px"><button class="alt" data-mdx="1">Inchide</button></div>`;
 $("#mdlg").innerHTML=`<div class="card mdbox" role="dialog" aria-modal="true" aria-label="Adauga in meniu"><h2 style="margin:0">Adauga in meniu</h2><div class="fgrid" style="margin-top:8px"><div><label for="mdday">Ziua</label><select id="mdday">${dopt}</select></div><div><label for="mdslot">Masa</label><select id="mdslot">${sopt}</select></div></div>${body}</div>`;
 $("#mdlg").classList.remove("hidden");if(!r)mdSearch();
 setTimeout(()=>{const e=$("#mdq")||$("#mdp")||$("[data-mdok]");if(e)e.focus()},0)}
function menClose(){MD=null;$("#mdlg").classList.add("hidden");$("#mdlg").innerHTML=""}
function mdSearch(){if(!MD||!$("#mdres"))return;
 const q=qWords(MD.q),sv=getSaved(),out=[];
 sv.forEach((r,i)=>{if(out.length>=40)return;if(!q.length?i<10:q.every(w=>norm(r.titlu+" "+(r.ingrediente||[]).map(x=>x.nume).join(" ")).includes(w)))out.push({s:"s",i,r})});
 if(q.length)BOOK.forEach((r,i)=>{if(out.length>=40)return;if(bScore(r,q).h===q.length)out.push({s:"b",i,r})});
 $("#mdres").innerHTML=out.length?out.map(x=>`<div class="me"><div class="mn"><div class="tx">${esc(x.r.titlu)}</div><div class="src">${x.s==="s"?"Salvata (generata)":"Biblioteca - "+esc(x.r.sursa||"")}</div></div><button class="go" data-mdpick="${x.s}:${x.i}" style="margin:0">Alege</button></div>`).join(""):`<p class="muted">${q.length?"Nu am gasit nimic. Incearca alt cuvant.":"Nu ai retete salvate inca. Cauta in biblioteca dupa nume sau ingredient."}</p>`}
function menAdd(en){const m=getMen();(m[MD.day]=m[MD.day]||{})[MD.slot]=(m[MD.day][MD.slot]||[]).concat([en]);putMen(m);
 toast("Adaugat in meniu: "+dLab(MD.day)+", "+SLOTS.find(x=>x[0]===MD.slot)[1]+".");const d=MD.day;menClose();if(!$("#v-meniu").classList.contains("hidden")){MW=monOf(d);const t0=dKey(new Date());if(MV==="z"&&d!==t0&&d!==dAdd(t0,1))MV="s";drawMenu()}}
$("#mdlg").onclick=e=>{if(PRP){pxClick(e);return}const b=e.target,d=b.dataset;
 if(b===$("#mdlg")||d.mdx!==undefined){menClose();return}
 if(!MD)return;
 if(d.mdok!==undefined){const p=$("#mdp")?clampP($("#mdp").value):(MD.r.portii||1);menAdd(mkEntry(MD.s,MD.r,p));return}
 if(d.mdpick!==undefined){const[s,i]=d.mdpick.split(":"),r=s==="s"?getSaved()[+i]:BOOK[+i];if(r)menAdd(mkEntry(s,r));return}
 if(d.mdtxt!==undefined){const t=($("#mdt").value||"").trim().slice(0,80);if(!t){$("#mdt").focus();return}menAdd({t,s:"x",k:"",p:0,L:0})}};
$("#mdlg").onchange=e=>{if(PRP){if(e.target.dataset.pxs!==undefined)PRP.slots[e.target.dataset.pxs]=e.target.checked;return}if(!MD)return;if(e.target.id==="mdday")MD.day=e.target.value;if(e.target.id==="mdslot")MD.slot=e.target.value};
$("#mdlg").oninput=e=>{if(e.target.id==="mdq"){MD.q=e.target.value;mdSearch()}};
$("#mdlg").onkeydown=e=>{if(e.key==="Escape"){menClose();return}
 if(e.key==="Enter"&&MD){if(e.target.id==="mdt"){e.preventDefault();const b=document.querySelector("[data-mdtxt]");if(b)b.click()}if(e.target.id==="mdp"){e.preventDefault();const b=document.querySelector("[data-mdok]");if(b)b.click()}}};

let MW=monOf(dKey(new Date()));
let MV=LS("rmv")==="s"?"s":"z"; /* z = azi si maine (implicit), s = saptamana */
/* ===== Propune-mi un meniu: motor local peste biblioteca; nimic nu intra in meniu fara confirmare ===== */
const PX_EXC=/\b(sos|sosuri|muraturi|conserv|marmelad|dulceat|retete casnice|glazur|sirop|bauturi|condiment|aluat|baza|gem|compot|lichior|cocktail|detox)/;
const PX_MIC=/\b(mic dejun|brunch|omleta|oua|smoothie|tartinabil|wrap|sandvis|burger|granola|terci|clatite|toast|paine)/;
function pxSlot(r){const t=norm((r.categorie||"")+" "+(r.titlu||""));if(PX_EXC.test(norm(r.categorie||"")))return null;
 if(DESERT.test(t)||/\b(desert|dulciur|crema|jeleu|fructe coapte)/.test(norm(r.categorie||"")))return"desert";
 if(PX_MIC.test(norm(r.categorie||""))||/\b(omleta|smoothie|granola|terci)/.test(norm(r.titlu||"")))return"mic";
 return"pranz"}
const pxIngs=(s,r)=>(s==="b"?(r.ingrediente||[]):(r.ingrediente||[])).filter(x=>(x.n||x.nume)).length;
function pxPool(){const out=[];
 BOOK.forEach((r,i)=>{if(r.nou||r.verifica||!pxIngs("b",r))return;const sl=pxSlot(r);if(sl)out.push({s:"b",r,sl,key:bKey(r)})});
 getSaved().forEach(r=>{if(!pxIngs("s",r))return;const sl=pxSlot(r);if(sl)out.push({s:"s",r,sl,key:sKey(r)})});return out}
function pxScore(c,slot,ctx){const r=c.r,why=[];let s=0;const pf=recPref(r);
 if(pf.av.length)return null;
 if(pf.lk.length){s+=Math.min(3,pf.lk.length)*3;why.push("iti place: "+pf.lk.slice(0,2).join(", "))}
 if(ctx.fav.has(c.key)){s+=2;why.push("favorita")}
 const n=ctx.notes[c.key]||{};if(+n.st){s+=(+n.st-3)*1.5;if(+n.st>=4)why.push(n.st+" stele")}
 const lc=lastCooked(n);if(lc){const dd=Math.round((dFrom(ctx.today)-dFrom(lc))/864e5);if(dd<14){s-=4;why.push("gatita acum "+dd+" zile")}else if(dd>60){s+=1;why.push("nu ai mai gatit-o demult")}}else s+=0.5;
 if(ctx.pan){const ms=missing(r);if(ms&&ms.tot>0){s+=3*(1-ms.miss.length/ms.tot);if(!ms.miss.length)why.push("ai tot din debara");else if(ms.miss.length<=2)why.push("iti lipsesc "+ms.miss.length)}}
 if(ctx.mt.k&&c.s==="b"&&r.macro&&r.macro.kcal!=null){const ideal=ctx.mt.k*({mic:.25,pranz:.4,desert:.1}[slot]||.3);s-=Math.min(2,Math.abs(r.macro.kcal-ideal)/ideal*2)}
 s+=Math.random();return{s,why}}
let PRP=null;
function pxBuild(slots){const m=getMen(),today=dKey(new Date()),ctx={fav:new Set(getFav()),notes:getNotes(),today,pan:getPan().length>0,mt:getMT()},pool=pxPool();
 const inMenu=new Set();Object.values(m).forEach(dm=>SLOTS.forEach(([s])=>(dm[s]||[]).forEach(en=>{if(en.k)inMenu.add(en.k)})));
 const days=[...Array(7)].map((_,i)=>dAdd(MW,i)).filter(d=>d>=today),cells=[];
 days.forEach(d=>slots.forEach(sl=>{if(!((m[d]||{})[sl]||[]).length)cells.push({d,sl})}));
 const rank={};slots.forEach(sl=>{rank[sl]=pool.filter(c=>c.sl===sl&&!inMenu.has(c.key)).map(c=>{const z=pxScore(c,sl,ctx);return z?{c,s:z.s,why:z.why}:null}).filter(Boolean).sort((a,b)=>b.s-a.s)});
 const used=new Set(),rows=cells.map(x=>{const cand=rank[x.sl].filter(y=>!used.has(y.c.key)).slice(0,8),ix=cand.length?0:-1;if(cand.length)used.add(cand[0].c.key);return{d:x.d,sl:x.sl,cand,ix,off:false,gen:null}});
 return{rows,avoided:pool.filter(c=>recPref(c.r).av.length).length,pool:pool.length}}
function pxOpen(){MD=null;const today=dKey(new Date()),mon=MW,cnt=[...Array(7)].map((_,i)=>dAdd(mon,i)).filter(d=>d>=today).length;
 PRP={step:0,slots:{mic:true,pranz:true,desert:true},res:null};pxDraw()}
function pxDraw(){const P=PRP,box=`<div class="card mdbox" role="dialog" aria-modal="true" aria-label="Propune-mi un meniu">`;
 if(P.step===0){const a=dFrom(MW),z=dFrom(dAdd(MW,6));
  $("#mdlg").innerHTML=`${box}<h2 style="margin:0">Propune-mi un meniu</h2><p class="muted">Completez mesele goale din saptamana ${a.getDate()} ${LUNI[a.getMonth()]} - ${z.getDate()} ${LUNI[z.getMonth()]} (de azi inainte). Aleg din biblioteca si din retetele salvate, cu respect pentru ce eviti, cu preferinta pentru ce iti place, ce ai in debara si ce nu ai gatit recent. Tu confirmi tot inainte sa intre in meniu.</p>
  <div class="chk" style="margin:8px 0">${SLOTS.map(([id,l])=>`<label><input type="checkbox" data-pxs="${id}"${P.slots[id]?" checked":""}> ${l}</label>`).join("")}</div>
  <div class="row" style="margin-top:12px;gap:8px"><button class="go" data-pxgo="1" style="margin:0">Propune</button><button class="alt" data-pxx="1">Anuleaza</button></div></div>`}
 else{const R=P.res,rows=R.rows,ok=rows.filter(r=>!r.off&&r.ix>=0&&r.cand[r.ix]||!r.off&&r.gen).length;
  const hasKey=!!LS("rk");
  $("#mdlg").innerHTML=`${box}<h2 style="margin:0">Propunere de meniu</h2>${rows.length?"":'<p class="muted">Nu ai mese goale in perioada si la mesele alese.</p>'}
  ${R.avoided?`<p class="muted" style="margin:6px 0">${R.avoided} retete excluse pentru ca au alimente evitate.</p>`:""}
  ${rows.map((r,i)=>{const c=r.ix>=0?r.cand[r.ix]:null,t=r.gen?r.gen.titlu:c?c.c.r.titlu:null;
   return`<div class="me" style="flex-wrap:wrap;gap:6px;opacity:${r.off?.45:1}"><div class="mn"><div class="muted">${esc(dLab(r.d))} - ${esc(SLOTS.find(x=>x[0]===r.sl)[1])}</div>${r.off?`<span class="tx muted">Scoasa</span>`:t?`<span class="tx">${esc(t)}</span>${r.gen?` <span class="lb">generata</span>`:""}${c&&!r.gen&&c.why.length?`<div class="muted">${esc(c.why.join(" - "))}</div>`:""}`:`<span class="tx muted">Nu am gasit o reteta potrivita.</span>`}</div>
   ${r.off?`<button class="alt" data-pxu="${i}">Pune la loc</button>`:`${c&&!r.gen&&r.cand.length>1?`<button class="alt" data-pxn="${i}">Alta varianta</button>`:""}${!t&&hasKey?`<button class="alt" data-pxai="${i}">Genereaza cu AI</button>`:""}${r.gen&&hasKey?`<button class="alt" data-pxai="${i}">Alta generata</button>`:""}<button class="alt" data-pxr="${i}" aria-label="Scoate">x</button>`}</div>`}).join("")}
  <div class="row" style="margin-top:14px;gap:8px"><button class="go" data-pxok="1" style="margin:0"${ok?"":" disabled"}>Adauga in meniu (${ok})</button><button class="alt" data-pxre="1">Propune din nou</button><button class="alt" data-pxx="1">Anuleaza</button></div></div>`}}
async function pxGen(i,btn){const R=PRP.res,r=R.rows[i],pf=getPf(),slot=SLOTS.find(x=>x[0]===r.sl)[1];
 btn.disabled=true;btn.textContent="Generez...";
 const have=R.rows.map(x=>x.gen?x.gen.titlu:x.ix>=0&&x.cand[x.ix]?x.cand[x.ix].c.r.titlu:null).filter(Boolean).slice(0,30);
 const u=`Propune o reteta simpla de ${slot.toLowerCase()} pentru 2 portii. Evita ABSOLUT: ${pf.e.join(", ")||"(nimic)"}. Prefera: ${pf.l.join(", ")||"(fara preferinte)"}. Nu repeta: ${have.join("; ")||"(nimic)"}. Foloseste ingrediente obisnuite si ${$("#ing")&&$("#ing").value?"daca se poate din: "+$("#ing").value:"din bucataria romaneasca"}.\nFormat: {"titlu":"","portii":0,"ingrediente":[{"nume":"","cantitate":0,"unitate":""}],"pasi":[{"id":"p1","text":"","aparat":"manual","durata_min":0}],"avertismente":[""],"etichete":[""]}`;
 try{const g=await ask($("#m2").value||"claude-haiku-4-5",SYS+" Pasii incep cu un verb la imperativ, o actiune per pas.",u,2500,0.5);
  if(!g||!g.titlu||!Array.isArray(g.ingrediente)||!g.ingrediente.length)throw new Error("Reteta generata nu e completa. Incearca din nou.");
  g.etichete=normTags(g.etichete);const blob=norm(g.titlu+" "+g.ingrediente.map(x=>x.nume).join(" ")),P=pfCheck();
  if(P.e.some(([n,pt])=>pt.every(w=>blob.includes(w))))throw new Error("Reteta generata continea un aliment evitat; am renuntat la ea. Incearca din nou.");
  r.gen=g;r.off=false;pxDraw()}
 catch(e){toast(e.message||"Eroare");pxDraw()}}
function pxApply(){const R=PRP.res,m=getMen();let n=0,sv=getSaved(),savedNew=false;
 R.rows.forEach(r=>{if(r.off)return;let en=null;
  if(r.gen){const g=JSON.parse(JSON.stringify(r.gen));let t=g.titlu,k=2;while(sv.some(x=>x.titlu===t))t=g.titlu+" ("+k++ +")";g.titlu=t;sv.unshift(g);savedNew=true;en=mkEntry("s",g)}
  else if(r.ix>=0&&r.cand[r.ix]){const c=r.cand[r.ix].c;en=mkEntry(c.s,c.r)}
  if(en){const dm=(m[r.d]=m[r.d]||{});if((dm[r.sl]||[]).length)return;dm[r.sl]=[en];n++}});
 if(savedNew){if(sv.length>200)sv=sv.slice(0,200);LS("rs",JSON.stringify(sv))}
 putMen(m);PRP=null;menClose();toast("Am adaugat "+n+(n===1?" masa":" mese")+" in meniu.");drawMenu()}
function pxClick(e){const b=e.target,d=b.dataset,P=PRP;
 if(b===$("#mdlg")||d.pxx!==undefined){PRP=null;menClose();return true}
 if(d.pxs!==undefined){P.slots[d.pxs]=b.checked;return true}
 if(d.pxgo!==undefined){const sl=SLOTS.map(x=>x[0]).filter(s=>P.slots[s]);if(!sl.length){toast("Alege cel putin o masa.");return true}P.sel=sl;P.res=pxBuild(sl);P.step=1;pxDraw();return true}
 if(d.pxre!==undefined){P.res=pxBuild(P.sel);pxDraw();return true}
 if(d.pxn!==undefined){const r=P.res.rows[+d.pxn];const used=new Set(P.res.rows.filter(x=>x!==r&&!x.off&&x.ix>=0&&x.cand[x.ix]).map(x=>x.cand[x.ix].c.key));
  for(let k=1;k<=r.cand.length;k++){const j=(r.ix+k)%r.cand.length;if(!used.has(r.cand[j].c.key)){r.ix=j;break}}pxDraw();return true}
 if(d.pxr!==undefined){P.res.rows[+d.pxr].off=true;pxDraw();return true}
 if(d.pxu!==undefined){P.res.rows[+d.pxu].off=false;pxDraw();return true}
 if(d.pxai!==undefined){pxGen(+d.pxai,b);return true}
 if(d.pxok!==undefined){pxApply();return true}
 return true}
function drawMenu(){
 const m=getMen(),today=dKey(new Date()),tom=dAdd(today,1),zi=MV==="z",days=zi?[today,tom]:[...Array(7)].map((_,i)=>dAdd(MW,i)),a=dFrom(MW),z=dFrom(dAdd(MW,6));
 const cnt=days.reduce((n,d)=>n+SLOTS.reduce((k,[s])=>k+((m[d]||{})[s]||[]).length,0),0);
 const mt=getMT(),dd=days.map(d=>dayMac(m[d]||{})).filter(x=>x.nd),av=dd.length?[0,1,2,3].map(i=>Math.round(dd.reduce((s,x)=>s+x.s[i],0)/dd.length)):null;
 const tgt=`<details class="mtg"${MTO?" open":""}><summary>Tinta zilnica pentru macro (optional)</summary><div class="fgrid" style="margin-top:8px"><div><label for="mtk">Calorii (kcal)</label><input id="mtk" type="number" min="0" max="9999" value="${mt.k||""}"></div><div><label for="mtp">Proteine (g)</label><input id="mtp" type="number" min="0" max="999" value="${mt.p||""}"></div></div></details>`;
 const avg=av&&!zi?`<p class="muted" style="margin:10px 0 0">Media pe zi (${dd.length} ${dd.length===1?"zi":"zile"} cu date): ${av[0]} kcal, ${av[1]} g proteine, ${av[2]} g carbo, ${av[3]} g grasimi.</p>`:"";
 const seg=`<div class="row" style="gap:8px;margin-bottom:10px"><button class="alt${zi?" on":""}" data-mv="z" aria-pressed="${zi}">Azi si maine</button><button class="alt${zi?"":" on"}" data-mv="s" aria-pressed="${!zi}">Saptamana</button></div>`;
 const hint=cnt?"":`<p class="muted" style="margin:10px 0 0">Meniul e gol. Adaugi retete cu "+ Adauga" aici sau cu "Adauga la meniu" din orice reteta (biblioteca, salvate, generate). Cumparaturile se pot genera pe zi sau pe mai multe zile; ce ai in Debara se ascunde ca in lista normala.</p>`;
 const head=zi?`<div class="card">${seg}<div class="row" style="gap:8px"><button class="go" data-mshop="z" style="margin:0">Cumparaturi pentru azi si maine</button><button class="alt" data-mprop="1">Propune-mi un meniu</button></div>${tgt}${hint}</div>`
 :`<div class="card">${seg}<div class="mh"><button class="alt" data-mw="-1" aria-label="Saptamana trecuta">&lt;</button><h2 style="flex:1;text-align:center;min-width:140px">${a.getDate()} ${LUNI[a.getMonth()]} - ${z.getDate()} ${LUNI[z.getMonth()]} ${z.getFullYear()}</h2><button class="alt" data-mw="1" aria-label="Saptamana urmatoare">&gt;</button></div>
 <div class="row" style="gap:8px;margin-top:10px"><button class="alt" data-mw="0">Saptamana asta</button><button class="go" data-mshop="w" style="margin:0">Cumparaturi pentru toata saptamana</button><button class="alt" data-mclr="1">Goleste saptamana</button></div><div class="row" style="margin-top:10px"><button class="go" data-mprop="1" style="margin:0">Propune-mi un meniu</button></div>${avg}${tgt}${hint}</div>`;
 function macBlock(dm){const t=dayMac(dm);if(!t.nd)return t.n?`<div class="mmac muted">Fara date de macro pentru ${t.n} intrari (macro exista doar la retetele din carti).</div>`:"";
  const tg=(v,x)=>x?` / ${x}`:"";
  return`<div class="mmac"><b>Total aprox.:</b> ${t.s[0]}${tg(0,mt.k)} kcal - ${t.s[1]}${tg(0,mt.p)} g proteine - ${t.s[2]} g carbo - ${t.s[3]} g grasimi<div class="muted">cate 1 portie din fiecare reteta din carti${t.n>t.nd?"; "+(t.n-t.nd)+" intrari fara date":""}</div></div>`}
 const rows=days.map(d=>{const dm=m[d]||{};
  return`<div class="card mday${d===today?" today":""}"><div class="mh"><h2>${esc(dLab(d))}${d===today?` <span class="lb">azi</span>`:d===tom?` <span class="lb">maine</span>`:""}</h2><button class="alt" data-mshop="d" data-day="${d}">Cumparaturi pentru ziua asta</button></div>`+
  SLOTS.map(([id,lab])=>`<div class="ms"><div class="mt">${lab}</div>${(dm[id]||[]).map((en,ix)=>{const rec=menRec(en),ref=`data-day="${d}" data-slot="${id}" data-ix="${ix}"`;
   return`<div class="me"><div class="mn"><span class="tx">${esc(en.t)}</span>${en.L?` <span class="lb">in lista</span>`:""}${en.s!=="x"&&!rec?`<div class="warn">Reteta nu mai e in aplicatie; folosesc ingredientele salvate in meniu.</div>`:""}${(()=>{const a=menMac(en);return a?`<div class="muted">~${Math.round(a[0])} kcal${a[1]!=null?", "+Math.round(a[1])+" g proteine":""} (1 portie)</div>`:""})()}</div>${en.s!=="x"&&!(rec&&en.s==="b"&&rec.r.portii==null)?`<input class="mpi" type="number" min="1" max="99" value="${esc(clampP(en.p||en.bp))}" ${ref} data-mp="1" aria-label="Portii pentru ${esc(en.t)}" title="Portii">`:""}${en.s!=="x"&&d<=today?((getNote(en.k).h||[]).includes(d)?` <span class="lb">gatit</span>`:`<button class="alt" data-mgat="1" ${ref}>Am gatit</button>`):""}${rec?`<button class="alt" data-mopen="1" ${ref}>Deschide</button>`:""}<button class="alt" data-mdel="1" ${ref} aria-label="Scoate ${esc(en.t)} din meniu">x</button></div>`}).join("")}<button class="alt" data-madd="${id}" data-day="${d}">+ Adauga</button></div>`).join("")+macBlock(dm)+`</div>`}).join("");
 $("#mw").innerHTML=head+rows}
/* cumparaturi din meniu: intrarile deja adaugate nu se repeta decat daca confirmi */
function menShop(btn,ds,label){
 const m=getMen(),ents=[];ds.forEach(d=>SLOTS.forEach(([s])=>((m[d]||{})[s]||[]).forEach(en=>{if(en.s!=="x")ents.push({d,en})})));
 if(!ents.length){toast("Nu ai retete in meniu pentru "+label+".");return}
 let use=ents.filter(x=>!x.en.L);
 if(!use.length){if(btn.dataset.arm!=="1"){const t=btn.textContent;btn.dataset.arm="1";btn.textContent="Sunt deja in lista. Adaug din nou?";setTimeout(()=>{if(btn.isConnected){btn.dataset.arm="";btn.textContent=t}},4000);return}use=ents}
 let n=0,sk=0;use.forEach(({d,en})=>{const ing=menIngs(en);if(!ing.length){sk++;return}n+=addList(ing,en.t+" (meniu "+ZILE[dFrom(d).getDay()].toLowerCase()+")");en.L=1});
 putMen(m);drawMenu();
 toast("Cumparaturi pentru "+label+": "+n+" produse noi din "+(use.length-sk)+" retete"+(sk?" ("+sk+" fara ingrediente)":"")+(ents.length>use.length?"; "+(ents.length-use.length)+" erau deja adaugate":"")+". Vezi Cumparaturi.")}
$("#v-meniu").onclick=e=>{const b=e.target,d=b.dataset;
 if(d.mv!==undefined){MV=d.mv==="s"?"s":"z";LS("rmv",MV);drawMenu();return}
 if(d.mshop==="z"){menShop(b,[dKey(new Date()),dAdd(dKey(new Date()),1)],"azi si maine");return}
 if(d.mw!==undefined){MW=d.mw==="0"?monOf(dKey(new Date())):dAdd(MW,7*+d.mw);drawMenu();return}
 if(d.madd!==undefined){menOpen({day:d.day,slot:d.madd});return}
 if(d.mshop==="w"){menShop(b,[...Array(7)].map((_,i)=>dAdd(MW,i)),"saptamana asta");return}
 if(d.mshop==="d"){menShop(b,[d.day],dLab(d.day));return}
 if(d.mprop!==undefined){if(MV==="z"){MW=monOf(dKey(new Date()))}pxOpen();$("#mdlg").classList.remove("hidden");setTimeout(()=>{const e=$("[data-pxgo]");if(e)e.focus()},0);return}
 if(d.mclr!==undefined){const u=undoMark(["rmen"]),m=getMen();[...Array(7)].forEach((_,i)=>delete m[dAdd(MW,i)]);putMen(m);drawMenu();undoShow("Saptamana a fost golita.",u,redrawAll);return}
 if(d.mdel!==undefined){const u=undoMark(["rmen"]),m=getMen(),a=(m[d.day]||{})[d.slot];if(a){const t=(a[+d.ix]||{}).t;a.splice(+d.ix,1);putMen(m);drawMenu();undoShow("Scos din meniu: "+t+".",u,redrawAll)}return}
 if(d.mgat!==undefined){const a=(getMen()[d.day]||{})[d.slot],en=a&&a[+d.ix];if(en&&en.k){setNote(en.k,{h:(getNote(en.k).h||[]).concat([d.day])});drawMenu();toast("Marcat ca gatit: "+en.t+" ("+fmtDay(d.day)+").")}return}
 if(d.mopen!==undefined){const a=(getMen()[d.day]||{})[d.slot],en=a&&a[+d.ix],rec=en&&menRec(en);if(!rec)return;
  if(en.s==="b"){show("carti");drawBook();openBook(rec.i,clampP(en.p||rec.r.portii||1),"#bres")}else{SV=en.k;show("salvate")}
  window.scrollTo(0,0)}};
$("#v-meniu").addEventListener("toggle",e=>{if(e.target.classList&&e.target.classList.contains("mtg"))MTO=e.target.open},true);
$("#v-meniu").onchange=e=>{const d=e.target.dataset;if(e.target.id==="mtk"||e.target.id==="mtp"){const t=getMT();if(e.target.id==="mtk")t.k=+e.target.value||0;else t.p=+e.target.value||0;LS("rmt",JSON.stringify(t));MTO=true;drawMenu();return}
 
 if(d.mp!==undefined){const m=getMen(),a=(m[d.day]||{})[d.slot],en=a&&a[+d.ix];if(!en)return;en.p=clampP(e.target.value);en.L=0;putMen(m);drawMenu()}};
const APP_V="2.8.0";
/* ===== Instalare ca aplicatie, functionare fara net, stocare protejata ===== */
let INST=null;
if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol)){
 const had=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener("controllerchange",()=>{if(had)toast("S-a instalat o versiune noua a aplicatiei. Reincarca pagina ca s-o folosesti.")});
 window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js?v="+APP_V).catch(()=>{})})}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();INST=e;updPst()});
window.addEventListener("appinstalled",()=>{INST=null;updPst()});
async function persistStore(){try{if(navigator.storage&&navigator.storage.persist&&!(await navigator.storage.persisted()))await navigator.storage.persist()}catch(e){}}
async function updPst(){const el=$("#pst");if(!el)return;let per=null,txt="";
 try{if(navigator.storage&&navigator.storage.persisted)per=await navigator.storage.persisted()}catch(e){}
 try{if(navigator.storage&&navigator.storage.estimate){const s=await navigator.storage.estimate();if(s&&s.usage!=null)txt=" Folosit: "+(s.usage/1048576).toFixed(1)+" MB"+(s.quota?" din ~"+Math.round(s.quota/1048576)+" MB":"")+"."}}catch(e){}
 const lsk=(()=>{let n=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);n+=k.length+(localStorage.getItem(k)||"").length}}catch(e){}return n})();
 const bk=STORED.length?JSON.stringify(STORED).length*1:0;
 el.innerHTML="<b>Stocare:</b> "+(per===true?"protejata (browserul nu o sterge singur)":per===false?"nu e protejata (browserul o poate sterge cand ramane fara spatiu; descarca copii des)":"necunoscuta pe acest browser")+"."+txt+" Setari, liste, meniu: "+(lsk*2/1048576).toFixed(1)+" MB din ~5 MB disponibili (localStorage)."+(IDBOK?" Biblioteca ("+STORED.length+" retete, ~"+(bk/1048576).toFixed(1)+" MB) e in baza de date a browserului, fara limita de 5 MB.":"")
  +(INST?` <button class="alt" id="pwaI" type="button">Instaleaza aplicatia</button>`:"")+` <span class="muted">Pe iPhone: Partajeaza, apoi "Adauga pe ecranul principal".</span>`}
$("#pst").onclick=e=>{if(e.target.id==="pwaI"&&INST){INST.prompt();INST.userChoice.finally(()=>{INST=null;updPst()})}};
persistStore();

$("#appv").textContent="Cartea mea de retete - versiunea "+APP_V;
$("#bkcard h2").insertAdjacentHTML("afterend",'<div id="bkwarn" class="warn" style="margin:0 0 8px"></div>');
/* Setari -> Alimente: in ce categorie intra fiecare aliment (folosita in Debara) */
function drawCatCfg(){const l=loadCats();
 $("#cgl").innerHTML=l.map(c=>`<div class="fd"><input data-cgn="${esc(c.id)}" value="${esc(c.n)}" maxlength="30" aria-label="Nume categorie" style="flex:1 1 140px;min-height:40px"${c.id==="altele"?" readonly":""}>${c.id==="altele"?`<span class="muted fa" style="flex:1 1 170px;text-align:left">categoria generala, ramane mereu</span>`:`<label class="cgf" style="margin:0;font-weight:400"><input type="checkbox" data-cgf="${esc(c.id)}" ${c.f?"checked":""} style="width:auto;min-height:0"> neprocesat / congelat / conserva</label><button class="alt" data-cgd="${esc(c.id)}">Sterge</button>`}</div>`).join("");
 $("#fdc").innerHTML=CATS.map(([id,lab])=>`<option value="${esc(id)}">${esc(lab)}</option>`).join("")}
const saveCats=l=>{LS("rcg",JSON.stringify(l));loadCats()};
$("#cgAdd").onclick=()=>{const n=$("#cgn").value.trim().slice(0,30);if(!n)return;const l=loadCats();if(l.some(c=>norm(c.n).trim()===norm(n).trim())){toast("Exista deja o categorie cu acest nume.");return}
 let id=norm(n).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"cat",k=id,i=2;while(l.some(c=>c.id===k))k=id+"-"+i++;
 l.splice(l.length-1,0,{id:k,n,f:0});saveCats(l);$("#cgn").value="";drawFoods()};
$("#cgn").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();$("#cgAdd").click()}};
$("#cgl").onchange=e=>{const d=e.target.dataset,l=loadCats();
 if(d.cgn!==undefined){const c=l.find(x=>x.id===d.cgn),v=e.target.value.trim().slice(0,30);if(c&&v&&!l.some(x=>x.id!==c.id&&norm(x.n).trim()===norm(v).trim())){c.n=v;saveCats(l)}drawFoods();return}
 if(d.cgf!==undefined){const c=l.find(x=>x.id===d.cgf);if(c){c.f=e.target.checked?1:0;saveCats(l)}drawFoods()}};
$("#cgl").onclick=e=>{const b=e.target,id=b.dataset.cgd;if(id===undefined)return;
 if(b.dataset.arm!=="1"){const t=b.textContent;b.dataset.arm="1";b.textContent="Confirma";setTimeout(()=>{if(b.isConnected){b.dataset.arm="";b.textContent=t}},4000);return}
 saveCats(loadCats().filter(c=>c.id!==id));putCats(getCats().filter(x=>x.c!==id));drawFoods()};
function foodNames(){const m=new Map();getPan().forEach(p=>m.set(cn(p.n),p.n));getCats().forEach(o=>{if(!m.has(cn(o.n)))m.set(cn(o.n),o.n)});return[...m.values()].sort((a,b)=>norm(a).localeCompare(norm(b)))}
function drawFoods(){drawCatCfg();const q=norm($("#fdq").value||"").trim(),ov=new Set(getCats().map(x=>cn(x.n)));
 const L=foodNames().filter(n=>!q||norm(n).includes(q));
 $("#fdl").innerHTML=L.length?L.map(n=>`<div class="fd"><div class="pn">${esc(n)}</div><select data-fc="${esc(n)}" aria-label="Categorie pentru ${esc(n)}">${CATS.map(([id,lab])=>`<option value="${esc(id)}"${id===catOf(n)?" selected":""}>${esc(lab)}</option>`).join("")}</select>${ov.has(cn(n))?`<button class="alt" data-fr="${esc(n)}" title="Revine la incadrarea automata">Automat</button>`:`<span class="muted fa">automat</span>`}</div>`).join(""):'<p class="muted">Niciun aliment. Adauga unul mai sus sau pune produse in Debara.</p>'}
$("#fdAdd").onclick=()=>{const n=$("#fdn").value.trim();if(!n)return;setCat(n,$("#fdc").value);$("#fdn").value="";drawFoods();if(!$("#v-debara").classList.contains("hidden"))drawPantry()};
$("#fdn").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();$("#fdAdd").click()}};
$("#fdq").oninput=drawFoods;
$("#fdl").onchange=e=>{const n=e.target.dataset.fc;if(n===undefined)return;setCat(n,e.target.value);drawFoods()};
$("#fdl").onclick=e=>{const n=e.target.dataset.fr;if(n===undefined)return;putCats(getCats().filter(x=>cn(x.n)!==cn(n)));drawFoods()};
$("#pCats").onclick=()=>{show("setari");setSub("alimente");window.scrollTo(0,0)};
/* submeniu Setari (Cont, Aparate, Etichete alimente, Etichete retete, Biblioteca, Date) */
const SUBS=["cont","alimente","biblioteca","date"],SUBOF={aparate:"cont",pref:"alimente",etichete:"alimente"},TABOF=e=>SUBOF[e]||e;
let SUB=LS("rsub");
function setSub(s){s=TABOF(s);if(!SUBS.includes(s))s="cont";SUB=s;LS("rsub",s);
 document.querySelectorAll("#snav button").forEach(b=>b.classList.toggle("on",b.dataset.s===s));
 document.querySelectorAll("#v-setari [data-sg]").forEach(e=>e.classList.toggle("hidden",TABOF(e.dataset.sg)!==s));if(s==="alimente")drawFoods()}
$("#snav").onclick=e=>{if(e.target.dataset.s)setSub(e.target.dataset.s)};
$("#v-setari").addEventListener("click",e=>{const g=e.target.closest("[data-gosub]");if(g)setSub(g.dataset.gosub)});
/* semn pentru copia de siguranta veche (peste 30 de zile) */
const DOT='<span class="dot" title="Copia de siguranta e veche"></span>';
function bkAge(){const t=+LS("rbk");return t?Math.floor((Date.now()-t)/864e5):null}
function bkDue(){let has=false;try{has=getSaved().length>0||getStored().length>0}catch(e){}if(!has)return false;const g=bkAge();return g===null||g>30}
function bkBadge(){const d=bkDue(),g=bkAge();
 document.querySelector("#nav [data-v=setari]").innerHTML="Setari"+(d?DOT:"");document.querySelector("#gnav [data-g=set]").innerHTML="Setari"+(d?DOT:"");
 document.querySelector("#snav [data-s=date]").innerHTML="Date"+(d?DOT:"");
 $("#bkwarn").textContent=d?(g===null?"Nu ai descarcat nicio copie de siguranta inca.":"Ultima copie are "+g+" de zile. Descarc-o din nou."):""}
bkBadge();
$("#bCancel").onclick=()=>{if(ABORT)ABORT.abort()};
/* copie de siguranta */
const BK_KEYS=["rs","rfav","rtags","ra","rbook","rm1","rm2b","rl","rp","rcat","rcg","rmen","rmt","rnote","rpf"];
let IMP=null;
function bkLast(){const t=LS("rbk");return t?"Ultima copie descarcata: "+new Date(+t).toLocaleString("ro-RO")+".":"Nu ai descarcat nicio copie inca."}
function bkInfo(d){const n=k=>{try{const j=JSON.parse(d[k]);return Array.isArray(j)?j.length:(j&&typeof j==="object"?Object.keys(j).length:0)}catch(e){return 0}};return{meniu:n("rmen"),salvate:n("rs"),favorite:n("rfav"),etichete:n("rtags"),aparate:n("ra"),biblioteca:n("rbook"),lista:n("rl"),debara:n("rp")}}
$("#bkm").textContent=bkLast();
function bkBuild(){const d={};BK_KEYS.forEach(k=>{const v=k==="rbook"?(STORED.length?JSON.stringify(STORED):null):LS(k);if(v!=null)d[k]=v});d.rtags=JSON.stringify(TAGS);d.ra=JSON.stringify(AP);
 const o={app:"retete-dana",format:1,data_export:new Date().toISOString(),date:d};
 return{json:JSON.stringify(o),name:"retete-copie-"+new Date().toISOString().slice(0,10)+".json",info:bkInfo(d)}}
const bkMsg=(i,pre)=>pre+i.salvate+" retete salvate, "+i.favorite+" favorite, "+i.biblioteca+" retete in biblioteca, "+i.debara+" produse in debara, "+i.meniu+" zile in meniu. ";
$("#bExp").onclick=()=>{const f=bkBuild();
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([f.json],{type:"application/json"}));
 a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
 LS("rbk",String(Date.now()));bkBadge();$("#bkm").textContent=bkMsg(f.info,"Descarcat: ")+bkLast()};
/* trimite copia prin partajarea telefonului (Drive, WhatsApp, e-mail...), unde browserul permite fisiere */
$("#bShare").onclick=async()=>{const f=bkBuild(),file=new File([f.json],f.name,{type:"application/json"});
 try{await navigator.share({files:[file],title:"Copie Cartea mea de retete"});LS("rbk",String(Date.now()));bkBadge();$("#bkm").textContent=bkMsg(f.info,"Trimis: ")+bkLast()}
 catch(e){if(e&&e.name==="AbortError")return;$("#bkm").textContent="Nu am putut deschide partajarea. Foloseste \"Descarca copia\"."}};
(()=>{try{const t=new File(["{}"],"a.json",{type:"application/json"});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[t]}))$("#bShare").hidden=false}catch(e){}})();
function impDraw(){const el=$("#bipv");if(!IMP){el.innerHTML="";return}const i=bkInfo(IMP.date);
 el.innerHTML=`<div class="card" style="margin:8px 0 0"><b>${esc(IMP.f.name)}</b><div class="muted" style="margin:6px 0 10px">Copie din ${esc((IMP.data_export||"").slice(0,10))}: ${i.salvate} retete salvate, ${i.favorite} favorite, ${i.etichete} etichete, ${i.aparate} aparate, ${i.biblioteca} retete in biblioteca, ${i.debara} produse in debara, ${i.meniu} zile in meniu.<br><b>Inlocuieste</b> tot ce ai acum in aplicatie pentru aceste date (cheia API ramane).</div><button class="go" data-ip="ok" style="margin:0">Restaureaza</button> <button class="alt" data-ip="no">Anuleaza</button></div>`}
$("#bimp").onchange=async e=>{const f=e.target.files[0];IMP=null;$("#bkm").textContent=bkLast();if(!f){impDraw();return}
 try{const j=JSON.parse(await f.text());if(j.app!=="retete-dana"||!j.date||typeof j.date!=="object")throw 0;
  for(const k of Object.keys(j.date)){if(!BK_KEYS.includes(k)||typeof j.date[k]!=="string")throw 0;if(!["rm1","rm2b"].includes(k))JSON.parse(j.date[k])}
  IMP={date:j.date,data_export:j.data_export,f};impDraw()}
 catch(x){impDraw();$("#bkm").textContent="Fisierul nu e o copie valida a acestei aplicatii."}};
$("#bipv").onclick=async e=>{const d=e.target.dataset.ip;if(!d)return;
 if(d==="no"){IMP=null;$("#bimp").value="";impDraw();$("#bkm").textContent="Restaurare anulata.";return}
 const KL=BK_KEYS.filter(k=>k!=="rbook"),bak={},prev=STORED,date=IMP.date;KL.forEach(k=>{bak[k]=localStorage.getItem(k)});
 const back=()=>{try{KL.forEach(k=>{if(bak[k]!=null)localStorage.setItem(k,bak[k]);else localStorage.removeItem(k)})}catch(y){}};
 let lib=[];try{const j=date.rbook!=null?JSON.parse(date.rbook):[];lib=Array.isArray(j)?j:[]}catch(x){lib=[]}
 $("#bkm").textContent="Restaurez...";
 /* biblioteca intai (cea mai mare); daca ceva esueaza, ramane tot ce era inainte */
 if(!(await saveStored(lib))){await saveStored(prev);$("#bkm").textContent="Nu am putut salva biblioteca din copie. Am pastrat datele de dinainte, neschimbate.";return}
 try{KL.forEach(k=>{if(date[k]!=null)localStorage.setItem(k,date[k]);else localStorage.removeItem(k)})}
 catch(x){back();await saveStored(prev);
  $("#bkm").textContent="Nu am putut scrie in browser (spatiu insuficient). Am pastrat datele de dinainte, neschimbate.";return}
 $("#bkm").textContent="Restaurat. Reincarc aplicatia...";setTimeout(()=>location.reload(),600)};
$("#bflt").open=innerWidth>700;
renderTagUI();
renderBox();
drawOnb();
/* daca ai ceva planificat azi, aplicatia se deschide direct pe Meniu > Azi */
{const m=getMen(),t=dKey(new Date());if(SLOTS.some(([s])=>((m[t]||{})[s]||[]).length)){show("meniu")}else syncNav("idei")}

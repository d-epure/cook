/* Cartea mea de retete - logica aplicatiei (vanilla JS, fara build).
   Datele stau in localStorage: rk cheie API, rm1/rm2b modele, ra aparate, rtags etichete,
   rs retete salvate, rfav favorite, rnote jurnal si notite pe retete, rbook biblioteca incarcata (in IndexedDB; rlib = marcaj in localStorage),
   rmen meniu, rmv vedere meniu (azi/saptamana), rmt tinte de macro (vechi), rprof profil nutritional si tinte, rl cumparaturi, rlv vedere lista (produse/retete),
   pna = nr. de portii "nu se aplica" (pe reteta), rfd alimente adaugate de tine (macro la 100 g), rp debara, rcg categorii alimente, rcat categoria fiecarui aliment, rpf preferinte alimente, rpxc mese pe categorie,
   ru consum, ronb "Primii pasi" ascuns, rbk data ultimei copii. Datele Info (Ingrediente, Masuri, Gatire) sunt in nutri.js, nu in localStorage.
   Cuprins (cauta "=====" sau comentariile de sectiune): etichete, favorite si chei, jurnal pe reteta, aparate,
   biblioteca (filtre, incarcare, stocare in IndexedDB, coada "De verificat", macro cu AI), debara, mod gatit,
   primii pasi, preferinte alimente, meniu si "Propune-mi un meniu", instalare/fara net. Idei, Colectia mea, lista de
   cumparaturi, Setari si Info (Ingrediente, Masuri, Gatire) nu au titlu "=====": cauta functiile drawList, renderSaved, renderSnav, drawIngr, drawMas, drawGat.
   Regula de baza: orice text venit de la model sau din JSON trece prin esc() (sau ed(), fara diacritice) inainte de innerHTML. */
const $=s=>document.querySelector(s);
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);if(/^(rs|rfav|rtags|ra|rm1|rm2b|rl|rp|rcat|rcg|rmen|rmt|rnote|rpf|rpxc|rfd|rprof)$/.test(k))syMark(k)}catch(e){if(v!==undefined){try{toast("Nu am putut salva: memoria browserului e plina sau blocata. Descarca o copie de siguranta si sterge ce nu mai folosesti.")}catch(x){}}return null}};
const COL=["#1f9aa8","#b06ccf","#d2703d","#4f9a49","#4f7be8","#c75a7c","#a8975f"];
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
let cur=null,mode="cron",SV=null,SVP=0;const RC={};

/* ===== ETICHETE (lista centrala, normalizare, cautare) ===== */
const dn=s=>String(s==null?"":s).normalize("NFD").replace(/[\u0300-\u036f]/g,"");const ed=x=>esc(dn(x));
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
function favT(k,redraw){const u=undoMark(["rfav"]),had=getFav().includes(k);toggleFav(k);redraw();if(had)undoShow("Scos de la favorite.",u,redraw)}
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

var LBN=null;
function show(v){if(v!=="lista")LBN=null;toastHide();document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"));$("#v-"+v).classList.remove("hidden");
 document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));syncNav(v);if(v==="salvate")renderSaved();if(v==="carti"&&($("#bd").value||pfOn()||_pfv!==(LS("rpf")||"")))drawBook();if(v==="lista")drawList();if(v==="meniu")drawMenu();if(v==="ingr")drawIngr();if(v==="masuri")drawMas();if(v==="gatire")drawGat();if(v==="debara")drawPantry();if(v==="setari"){drawPf();drawPxc();updPst();useDraw();renderCfg();renderTagCfg();updBS();setSub(LS("rk")?SUB:"cont")}bkBadge();if(v==="idei"){renderBox();drawOnb()}}
/* navigare in doua trepte: sectiuni (Retete / Planific / Setari) si pagini in sectiune */
const GROUPS={ret:["idei","carti","salvate"],plan:["meniu","lista","debara"],info:["ingr","masuri","gatire"],set:["setari"]},LASTV={};
const groupOf=v=>Object.keys(GROUPS).find(g=>GROUPS[g].includes(v))||"ret";
function syncNav(v){const g=groupOf(v);LASTV[g]=v;
 document.querySelectorAll("#gnav button").forEach(b=>{const on=b.dataset.g===g;b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on))});
 document.querySelectorAll("#nav button").forEach(b=>{b.hidden=!GROUPS[g].includes(b.dataset.v)});$("#nav").hidden=GROUPS[g].length<2}
$("#gnav").onclick=e=>{const g=e.target.dataset.g;if(!g)return;const v=LASTV[g]||GROUPS[g][0];if(g==="ret"&&!$("#v-"+v).classList.contains("hidden"))SV=null;show(v);if(g==="set"){setHome();window.scrollTo(0,0)}};
$("#nav").onclick=e=>{const v=e.target.dataset.v;if(!v)return;
 if(!$("#v-"+v).classList.contains("hidden")){if(v==="salvate")SV=null;if(v==="carti")drawBook()}
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
 $("#apcfg").innerHTML=AP.map((a,i)=>`<div class="apr apd"><div class="apn">${tag(a.id)}<b>${esc(a.nume)}</b></div><div class="apc"><label class="ck"><input type="checkbox" data-t="on" data-i="${i}" ${a.on?"checked":""}> activ</label><label class="ck"><input type="checkbox" data-t="backup" data-i="${i}" ${a.backup?"checked":""}> backup</label><button class="alt" data-x="${i}">Elimina</button></div></div>`).join("")+
 `<details class="mre" id="apnew" style="margin-top:12px"><summary>+ Aparat nou</summary><label for="nn">Nume</label><input id="nn" placeholder="ex: Cuptor electric">
 <div class="row"><div><label for="nt1">Temp min (C)</label><input id="nt1" type="number"></div><div><label for="nt2">Temp max (C)</label><input id="nt2" type="number"></div></div>
 <label for="nm">Moduri (separate prin virgula)</label><input id="nm" placeholder="ex: copt, grill">
 <label for="no">Ce face / limite</label><input id="no" placeholder="ex: capacitate 30 l, fara abur">
 <label class="ck" style="margin:10px 0"><input id="nb" type="checkbox"> doar backup (folosit numai cand cel preferat nu poate)</label><button class="go" id="bAdd">Adauga aparat</button></details>`}
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
 catch(e){if(e.name==="AbortError")throw new Error("Anulat.");throw new Error("Nu pot contacta Anthropic. Verifica internetul; daca ai deschis fisierul din previzualizare sau cu o extensie de blocare reclame, deschide aplicatia pe adresa ei publicata, intr-un browser obisnuit.")}
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
let TT=0;function toastHide(){clearTimeout(TT);const el=$("#toast");if(el)el.classList.add("hidden")}
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#toast")&&!e.target.closest("#toast button"))toastHide()});
function toast(m){const el=$("#toast");el.textContent=m;el.classList.remove("hidden");clearTimeout(TT);TT=setTimeout(()=>el.classList.add("hidden"),8000)}
function fail(e){$("#eIdei").textContent=e.message;if(e.message!=="Anulat.")toast(e.message)}

/* consum (estimare locala, doar in acest browser) */
const useGet=()=>{try{return Object.assign({n:0,i:0,o:0},JSON.parse(LS("ru")))}catch(e){return{n:0,i:0,o:0}}};
function useAdd(u){const x=useGet();x.n++;x.i+=u.input_tokens||0;x.o+=u.output_tokens||0;LS("ru",JSON.stringify(x))}
function useDraw(){const x=useGet();$("#usg").innerHTML=x.n?`Consum inregistrat de aplicatie: ${x.n} apeluri, ${x.i.toLocaleString("ro-RO")} tokeni trimisi, ${x.o.toLocaleString("ro-RO")} tokeni primiti. <button class="alt" id="bUr" style="padding:2px 8px">Reseteaza</button><br>Valoare orientativa; suma reala o vezi in consola Anthropic.`:"Consum inregistrat de aplicatie: inca niciun apel."}
$("#usg").onclick=e=>{if(e.target.id==="bUr"){const u=undoMark(["ru"]);LS("ru","");useDraw();undoShow("Consumul a fost resetat.",u,useDraw)}};
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
 const c=RC[sel];if(!c||!$(sel))return;const r=c.r,tl=timeline(r.pasi||[]),tot=Math.max(0,...tl.map(s=>s._e)),ids=[...new Set(tl.map(s=>s.aparat))],plain=tl.length>0&&tl.every(s=>s.aparat==="manual"&&!(+s.durata_min));let body;
 if(plain)body=`<ol class="plst">`+tl.map(s=>`<li>${esc(s.text)}${params(s)?`<div class="par">${esc(params(s))}</div>`:""}${check(s).map(x=>`<div class="warn">${esc(x)}</div>`).join("")}</li>`).join("")+`</ol>`;
 else if(mode==="cron")body=tl.map(s=>stepHtml(s,true,tl.some(o=>o!==s&&o.aparat!==s.aparat&&o.aparat!=="manual"&&s.aparat!=="manual"&&o._s<s._e&&o._e>s._s))).join("");
 else body=ids.map(a=>`<h2>${tag(a)}</h2>`+tl.filter(s=>s.aparat===a).map(s=>stepHtml(s,false)).join("")).join("");
 const top=c.kind==="saved"?`<div style="margin-bottom:10px"><button class="alt" data-rback="1">Inapoi la lista</button> ${favBtn(sKey(r))}</div>`:"";
 const save=c.kind==="gen"?`<button class="go" id="bSave" style="margin:0">Salveaza</button>`:"";
 $(sel).innerHTML=top+`<div class="card"><h2>${esc(r.titlu)}</h2><div class="muted">${esc(r.portii)} portii${plain?"":" - aprox. "+Math.round(tot)+" min"}</div>${r.din_carte?`<div class="muted">Adaptata din: ${esc(r.din_carte)} (reteta din carte ramane neschimbata)</div>`:""}<div style="margin-top:6px">${lbH(r.etichete)}</div>${r.sursa_web&&safeUrl(r.sursa_web.url)?`<div class="muted">Inspirata de: <a href="${esc(r.sursa_web.url)}" target="_blank" rel="noopener noreferrer">${esc(r.sursa_web.nume||r.sursa_web.url)}</a> (adaptata, nu copiata)</div>`:""}
 <ul class="ing">${(r.ingrediente||[]).map(i=>`<li>${esc(i.cantitate)} ${esc(i.unitate)} ${esc(cap(i.nume))}</li>`).join("")}</ul>
 ${(r.avertismente||[]).map(x=>`<div class="warn">${esc(x)}</div>`).join("")}
 ${tagPicker(r,"data-tgr",c.kind==="gen"?"Etichete (se salveaza odata cu reteta)":"Etichete")}${c.kind!=="gen"?jrHtml(sKey(r)):""}
 <div class="row" style="margin-top:12px">${plain?"":`<button class="alt${mode==='cron'?' on':''}" aria-pressed="${mode==='cron'}" data-m="cron">Cronologie</button><button class="alt${mode==='ap'?' on':''}" aria-pressed="${mode==='ap'}" data-m="ap">Pe aparat</button>`}${save}<button class="alt" data-cum="1">Adauga la cumparaturi</button><button class="alt" data-mn="1">Adauga la meniu</button><button class="alt" data-cook="1">Mod gatit</button></div></div><div class="card">${body}</div>`;
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
 if(d.fav!==undefined){favT(d.fav,()=>renderRecipe(sel));return true}
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
  if(r){RC["#salvate"]={r,kind:"saved",back:()=>{SV=null;renderSaved()}};$("#sfilt").style.display="none";renderRecipe("#salvate");return}
  const i=BOOK.findIndex(x=>bKey(x)===SV);
  if(i>=0){RC["#salvate"]=null;$("#sfilt").style.display="none";openBook(i,BOOK[i].portii,"#salvate");return}SV=null}
 RC["#salvate"]=null;$("#sfilt").style.display=(getSaved().length||BOOK.some(r=>isFav(bKey(r))))?"":"none";
 const f=$("#fs").value,k=$("#fk").value,out=[];
 getSaved().forEach((r,i)=>out.push({r,i,t:"s",k:sKey(r)}));
 BOOK.forEach(r=>{if(r.nou)return;const kk=bKey(r);if(isFav(kk)||r.sursa==="Retetele mele")out.push({r,t:"b",k:kk})});
 const l=out.filter(x=>(!f||normTags(x.r.etichete).includes(f))&&(k==="fav"?isFav(x.k):k==="ai"?x.t==="s":k==="mine"?(x.t==="b"&&x.r.sursa==="Retetele mele"):true));
 $("#salvate").innerHTML=l.length?l.map(x=>{const r=x.r,s=x.t==="s";return `<div class="card sc"><h2>${ed(r.titlu)}</h2>${s?`<div class="muted org">Generata de AI</div>`:srcLine(r)}<div class="chips">${s?[...new Set((r.pasi||[]).map(p=>p.aparat))].map(tag).join("")+lbH(r.etichete):(r.categorie&&r.categorie!=="Retetele mele"?`<span class="lb" style="font-weight:700;color:var(--ink)">${esc(r.categorie)}</span>`:"")+bLab(r).map(t=>`<span class="lb">${esc(t)}</span>`).join("")}</div>${jrLine(x.k)}${s?`<button class="alt" data-o="${x.i}">Deschide</button>`:`<button class="alt" data-bo="${esc(x.k)}">Deschide</button>`} ${favBtn(x.k)}${s?` <button class="alt" data-d="${x.i}">Sterge</button>`:""}</div>`}).join(""):'<p class="muted">Nu ai retete de afisat. Salveaza o idee, pune o stea unei retete din biblioteca sau scrie una a ta.</p>';
}
$("#fs").onchange=renderSaved;$("#fk").onchange=renderSaved;
$("#salvate").onclick=e=>{if(rcClick(e,"#salvate")||bvClick(e,"#salvate"))return;const l=getSaved(),d=e.target.dataset;
 if(d.fav!==undefined){favT(d.fav,renderSaved);return}
 if(d.bo!==undefined){const i=BOOK.findIndex(x=>bKey(x)===d.bo);if(i>=0){SV=d.bo;SVP=BOOK[i].portii;renderSaved();window.scrollTo(0,0)}return}
 if(d.o!==undefined){const r=l[d.o];if(r){SV=sKey(r);renderSaved();window.scrollTo(0,0)}}
 if(d.d!==undefined){const u=undoMark(["rs"]),t=(l[d.d]||{}).titlu||"reteta";l.splice(d.d,1);LS("rs",JSON.stringify(l));renderSaved();undoShow("Reteta stearsa: "+t+".",u,()=>{SV=null;renderSaved()})}};
$("#salvate").onchange=e=>{rcChange(e,"#salvate")||bvChange(e,"#salvate")};
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
function afterTags(){renderTagUI();renderTagCfg();drawBook();if(window._idei)drawIdei();renderSaved();Object.keys(RC).forEach(s=>{if(RC[s])renderRecipe(s)})}
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
"sfaturi":["Poti adauga si bors acru sau zeama de lamaie pentru o varianta mai acrisoara.","Pentru extra aroma, pune si foi de dafin sau piper boabe.","Se serveste excelent cu ardei iute murat."],
"alergeni":["telina"],"variante":["Inlocuieste cartofii cu dovlecel sau conopida pentru mai putini carbohidrati."]}];
let bi=0;
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
/* 3.2.3: sursa retetei (carte, numar, adaptata din) intr-o singura linie, sub titlu, inainte de etichete: in Biblioteca, Colectia mea si reteta deschisa */
const srcTxt=r=>(r.sursa==="Retetele mele"?"Scrisa de tine":"Din "+esc(r.sursa||"biblioteca")+(r.nr!=null&&r.nr!==""?", reteta "+esc(r.nr):""))+(r.din?" (adaptata din "+esc(r.din.sursa||"-")+(r.din.nr!==""&&r.din.nr!=null?", reteta "+esc(r.din.nr):"")+")":"");
const srcLine=r=>`<div class="muted org">${srcTxt(r)}</div>`;
const bChips=r=>(r.categorie?`<span class="lb" style="font-weight:700;color:var(--ink)">${esc(r.categorie)}</span>`:"")+bLab(r).map(t=>`<span class="lb">${esc(t)}</span>`).join("");
/* contorul "N de verificat" se actualizeaza si fara sa redesenez lista (editorul sta in aceeasi zona) */
let _bnA=["",false];
function bnDraw(bd,usePan){const nv=BOOK.filter(r=>r.verifica).length;{const bq=$("#bvq");bq.hidden=!nv;bq.textContent="Parcurge retetele de verificat ("+nv+")"}{const bn=$("#bn"),t=(bd!==""&&!usePan?"Filtrul \"Din debara\" nu face nimic cat timp Debaraua e goala.":usePan?"Ce lipseste se calculeaza aproximativ (\"cartofi albi\" e acoperit de \"cartofi\"); verifica lista inainte sa cumperi.":"");bn.textContent=t;bn.hidden=!t}}
const updVC=()=>bnDraw(..._bnA);
const FAVV="*fav",inSrc=(r,v)=>v===FAVV?isFav(bKey(r)):(r.sursa||"necunoscuta")===v;
function drawBook(){
 if(!LIBREADY){$("#bres").innerHTML='<p class="muted">Se incarca biblioteca...</p>';return}
 const srcs=[...new Set(BOOK.map(r=>r.sursa||"necunoscuta"))],sel=$("#bs"),prev=sel.value;
 if(sel.dataset.k!==srcs.join("|")){sel.dataset.k=srcs.join("|");sel.innerHTML='<option value="">Toate cartile</option><option value="'+FAVV+'">\u2605 Favorite</option>'+srcs.map(x=>`<option>${esc(x)}</option>`).join("");sel.value=srcs.includes(prev)||prev===FAVV?prev:""}
 const cats=[...new Set(BOOK.filter(r=>!sel.value||inSrc(r,sel.value)).map(r=>r.categorie).filter(Boolean))].sort(),cs=$("#bc"),cp=cs.value; /* categoriile arata doar ce exista in cartea aleasa */
 if(cs.dataset.k!==cats.join("|")){cs.dataset.k=cats.join("|");cs.innerHTML='<option value="">Toate categoriile</option>'+cats.map(x=>`<option>${esc(x)}</option>`).join("");cs.value=cats.includes(cp)?cp:""}
 const sc0=sel.value,cat0=cs.value,bfs=$("#bf"),bfp=bfs.value; /* etichetele arata doar ce exista in cartea/categoria aleasa */
 const tg=[...new Set(BOOK.filter(r=>(!sc0||inSrc(r,sc0))&&(!cat0||r.categorie===cat0)).flatMap(bLab))].sort((a,b)=>a.localeCompare(b,"ro"));
 if(bfs.dataset.k!==tg.join("|")){bfs.dataset.k=tg.join("|");bfs.innerHTML='<option value="">Toate</option>'+tg.map(x=>`<option>${esc(x)}</option>`).join("");bfs.value=tg.includes(bfp)?bfp:""}
 const q=qWords($("#bq").value),f=bfs.value;
 const bp=$("#bp").value;
 {const n=["#bs","#bc","#bf","#bv","#bd","#bj","#bp"].filter(s=>$(s).value).length,n2=["#bd","#bj","#bp"].filter(s=>$(s).value).length;$("#bfsum2").textContent=n2?"Mai multe filtre ("+n2+")":"Mai multe filtre";if(n2)$("#bflt2").open=true;$("#bfsum").textContent=n?"Filtre ("+n+(n===1?" activ)":" active)"):"Filtre"}
 const bd=$("#bd").value,usePan=bd!==""&&getPan().length>0,bj=$("#bj").value,NT=bj?getNotes():null,lim60=dAdd(dKey(new Date()),-60);
 const jOk=r=>{if(!bj)return true;const n=NT[bKey(r)]||{},l=lastCooked(n);return bj==="4"?+n.st>=4:bj==="ok"?!!l:bj==="g0"?!l:!l||l<lim60};
 const l=BOOK.map((r,i)=>{const z=q.length?bScore(r,q):{s:0,h:0};return{r,i,sc:z.h,w:z.s,ms:usePan?missing(r):null}}).filter(x=>!x.r.nou&&(!usePan||(x.ms.tot>0&&x.ms.miss.length<=+bd))&&jOk(x.r)&&(!bp||(bp==="ok"?!recPref(x.r).av.length:recPref(x.r).lk.length>0))&&(!q.length||x.sc>0)&&(!f||bLab(x.r).includes(f))&&(!sc0||inSrc(x.r,sc0))&&(!cat0||x.r.categorie===cat0)&&(!$("#bv").value||($("#bv").value==="v")===!!x.r.verifica)).sort((a,b)=>usePan?(a.ms.miss.length-b.ms.miss.length)||(b.w-a.w)||(b.sc-a.sc):(b.w-a.w)||(b.sc-a.sc));
 _bnA=[bd,usePan];bnDraw(bd,usePan);
 $("#bcnt").textContent="Rezultat: "+l.length+(l.length===1?" reteta gasita":" retete gasite")+" din "+BOOK.length+" retete in baza locala";
 $("#bres").innerHTML=l.length?l.slice(0,BLIM).map(x=>`<div class="card"><h2>${ed(x.r.titlu)}</h2>${srcLine(x.r)}<div>${bChips(x.r)}</div>${jrLine(bKey(x.r))}${pfLine(x.r)}${x.ms?`<div class="miss${x.ms.miss.length?"":" ok"}">${x.ms.miss.length?"Iti lipsesc ("+x.ms.miss.length+"): "+esc(x.ms.miss.join(", ")):"Ai tot ce trebuie din debara"}</div>`:""}${(()=>{const t=`${q.length?"Potriviri: "+x.sc+"/"+q.length+" - ":""}${x.r.macro&&x.r.macro.kcal!=null?`~${esc(x.r.macro.kcal)} kcal, ${esc(x.r.macro.proteine??"?")} g proteine, ${esc(x.r.macro.carbo??"?")} g carbohidrati`:""}${x.r.verifica?" - verifica fisa":""}`;return t?`<p class="muted">${t}</p>`:""})()}<button class="go" data-b="${x.i}">Deschide</button> ${favBtn(bKey(x.r),"Favorita")}</div>`).join("")+(l.length>BLIM?`<div class="card"><button class="alt" data-bmore="1">Arata mai multe</button></div>`:""):'<p class="muted">Nicio reteta gasita. Incearca alt ingredient sau scoate filtrul.</p>';
}
function openBook(i,p,sel){sel=sel||"#bres";bi=i;if(p===undefined)p=BOOK[i].portii;if(sel==="#salvate"){SV=bKey(BOOK[i]);SVP=p}
 const r=BOOK[i];if(EDIT&&EDIT.i===i&&EDIT.sel===sel){editForm(r,i,sel);return}
 const f=1,m=r.macro,L=a=>(a&&a.length)?a:null,pid="bp"+sel.slice(1);
 const ul=a=>L(a)?"<ul>"+a.map(x=>`<li>${ed(x)}</li>`).join("")+"</ul>":"";
 $(sel).innerHTML=`<div class="bv" data-bi="${i}"><div style="margin-bottom:10px"><button class="alt" data-bback="1">${sel==="#bres"?"Inapoi la rezultate":"Inapoi la favorite"}</button> ${favBtn(bKey(r))}</div><div class="card"><h2>${ed(r.titlu)}</h2>${srcLine(r)}<div>${bChips(r)}</div>
 ${pfHtml(r)}
 ${(()=>{const v=vx(r),src=`${esc(r.sursa||"carte necunoscuta")}${r.nr!=null&&r.nr!==""?", reteta nr. "+esc(r.nr):""}`;return(v.length?`<div class="warn">Extragerea automata a acestei retete e nesigura (${esc(v.join(", "))}). Verifica in carte: ${src}. Daca difera, corecteaz-o din Mai multe actiuni > Corecteaza reteta.</div>`:"")+((r.verifica||[]).includes(PVR)?`<div class="warn">Numarul de portii (${r.pna?"-":r.portii==null?"necunoscut":esc(r.portii)}) nu e confirmat. Verifica in carte: ${src}. Il confirmi scriind numarul in campul Portii, mai jos, si apasand butonul de salvare.</div>`:"")})()}
 <div class="acts">${(r.pasi_carte||[]).length?`<button class="go" data-cookb="1">Mod gatit</button>`:""}<button class="alt" data-mnb="1">Adauga la meniu</button></div><details class="mre"><summary>Mai multe actiuni</summary><div class="acts"><button class="alt" data-cumb="1">Adauga la cumparaturi</button><button class="alt" data-edit="1">Corecteaza reteta</button>${r.manual?"":`<button class="alt" data-copyme="1">Salveaza ca reteta mea</button>`}${((r.pasi_carte||[]).length||(r.verifica&&r.text_brut))?`<button class="alt" data-adp="1" ${hasRobot()?"":"disabled"}>Adapteaza la aparatele mele</button>`:""}</div></details>${((r.pasi_carte||[]).length||(r.verifica&&r.text_brut))?`<p class="muted adphint" ${hasRobot()?"hidden":""} style="margin:6px 0 0">Adaptarea e activa doar daca bifezi Thermomix sau Monsieur Cuisine in Idei, la Aparate pentru adaptare.</p>`:""}<label for="${pid}">Portii (reteta)</label><input id="${pid}" data-bp="1" type="number" min="1" max="200" value="${p==null?"":esc(p)}" placeholder="${r.pna?"nu se aplica":"necunoscut"}" style="max-width:140px">${r.portii==null?`<p class="muted" style="margin:6px 0 0">Fara numar de portii, valorile de macro sunt pentru toata reteta. Scrie numarul ca sa vezi macro pe portie.</p>`:""}
 <h2 style="margin-top:14px">Ingrediente</h2>${(r.ingrediente||[]).length?`<ul class="ing">${ingHtml(r,f)}</ul>`:`<p class="muted">Reteta nu are o lista proprie de ingrediente. Cantitatile sunt in modul de preparare sau in reteta la care trimite.</p>`}
 <h2>Mod de preparare</h2><ol>${(r.pasi_carte||[]).map(x=>`<li>${ed(x)}</li>`).join("")}</ol>
 ${(m&&m.kcal!=null)||(r.ingrediente||[]).length?`<h2>Macro per portie</h2><div data-mac>${macHead(r,p)}</div><div data-macp aria-live="polite"></div>${micHead(r)}`:""}
 ${L(r.sfaturi)?"<h2>Sfaturi practice</h2>"+ul(r.sfaturi):""}${L(r.alergeni)?"<p><b>Alergeni:</b> "+esc(r.alergeni.join(", "))+"</p>":""}${L(r.variante)?"<p><b>Variante:</b></p>"+ul(r.variante):""}
 <div class="bsec">${tagPicker(r,"data-tgb")}${jrHtml(bKey(r))}</div>
</div><div id="adp${sel.slice(1)}"></div></div>`;
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
Pasii din carte:\n${pasi||"(nu sunt pasi extrasi)"}${vx(r).length?`\nATENTIE: extragerea automata a acestei retete e nesigura (${vx(r).join(", ")}). Textul paginii din carte, ca atare, ca sa clarifici ingredientele si pasii (daca ceva ramane neclar, scrie in avertismente):\n${String(r.text_brut||"").slice(0,3500)}`:""}
Aparate:\n${apText(L)}\n${RULE}
${rulesFor(L,12)}
Format: {"titlu":"","portii":0,"ingrediente":[{"nume":"","cantitate":0,"unitate":""}],"pasi":[{"id":"p1","text":"","aparat":"id|manual","mod":"","temp":0,"treapta":"","sens":"","sonda_c":0,"volum_ml":0,"durata_min":0,"depinde_de":["id"]}],"avertismente":[""]}`;
 try{
  const a=await ask($("#m2").value||"claude-haiku-4-5",SYS,u,4000,0.2);
  if(!a||!Array.isArray(a.pasi))throw new Error("Modelul nu a returnat pasi valizi. Incearca din nou.");
  a.pasi=a.pasi.filter(x=>x&&typeof x==="object"&&x.text).map((x,k)=>Object.assign(x,{id:String(x.id||"p"+(k+1)),aparat:x.aparat||"manual"}));
  if(!a.pasi.length)throw new Error("Modelul nu a returnat pasi valizi. Incearca din nou.");
  a.ingrediente=Array.isArray(a.ingrediente)?a.ingrediente.filter(x=>x&&typeof x==="object"):[];a.avertismente=Array.isArray(a.avertismente)?a.avertismente:[];
  if(vx(r).length)a.avertismente.unshift("Extragerea din carte e nesigura: compara cu reteta originala de mai sus.");a.titlu=r.titlu+" (adaptat)";a.portii=p;a.etichete=normTags(r.etichete);a.din_carte=(r.sursa||"")+(r.nr?", reteta "+r.nr:"");
  cur=a;RC[key]={r:a,kind:"gen",bi:i,p};renderRecipe(key);box.scrollIntoView({behavior:"smooth",block:"start"})}
 catch(e){if(e.message!=="Anulat."){box.innerHTML='<div class="warn"></div>';box.firstChild.textContent=e.message;if(/cheia API/.test(e.message)){const kb=document.createElement("button");kb.className="alt";kb.dataset.gosub="cont";kb.textContent="Seteaza cheia";box.firstChild.appendChild(document.createTextNode(" "));box.firstChild.appendChild(kb)}toast(e.message)}}
 stop();delete btn.dataset.busy;bbs.forEach(b=>b.disabled=false);btn.textContent="Adapteaza la aparatele mele";syncAdp();
}
/* curata o reteta importata: tipuri sigure, ca un JSON gresit sa nu strice aplicatia */
const arr=v=>Array.isArray(v)?v:(v==null||v===""?[]:[v]),nz=v=>v==null||v===""||!isFinite(+v)?null:+v;
function fixRec(r){if(!r||typeof r!=="object")return r;
 r.etichete=arr(r.etichete).filter(x=>typeof x==="string");r.pasi_carte=arr(r.pasi_carte).map(String);r.sfaturi=arr(r.sfaturi).map(String);
 r.ingrediente=arr(r.ingrediente).map(x=>typeof x==="object"&&x?Object.assign({},x,{c:nz(x.c),u:x.u==null?"":String(x.u),n:String(x.n==null?"":x.n)}):{c:null,u:"",n:String(x)}).filter(x=>x.n||x.g);
 r.portii=nz(r.portii);if(r.nr!=null)r.nr=nz(r.nr)??String(r.nr).slice(0,20);
 if(r.macro&&typeof r.macro==="object")["kcal","proteine","carbo","grasimi","fibre","saturate"].forEach(k=>{if(k in r.macro)r.macro[k]=nz(r.macro[k])});else delete r.macro;
 if(r.verifica!=null){r.verifica=arr(r.verifica).map(String).filter(Boolean);if(!r.verifica.length)delete r.verifica}if(r.text_brut!=null)r.text_brut=String(r.text_brut);r.titlu=String(r.titlu);return r}
/* editor retete din biblioteca */
let EDIT=null;
const UN=["g","kg","ml","l","cl","lingura","linguri","lingurita","lingurite","catel","catei","cana","cani","buc","bucata","bucati","felie","felii","praf","varf","pachet","pachete","conserva","conserve"];
function toNum(s){s=String(s).trim().replace(",",".");let t=0;const fr={"\u00bd":.5,"\u00bc":.25,"\u00be":.75};
 s=s.replace(/[\u00bd\u00bc\u00be]/g,c=>{t+=fr[c];return""});const f=s.match(/(\d+)\s*\/\s*(\d+)/);if(f){t+=f[1]/f[2];s=s.replace(f[0],"")}
 const n=parseFloat(s);if(!isNaN(n))t+=n;return +t.toFixed(3)}
function ingHtml(r,f){let g=null,o="";(r.ingrediente||[]).forEach(x=>{const gg=x.g||null;if(gg!==g){g=gg;if(g)o+=`<li class="gh"><b>${ed(g)}</b></li>`}
  o+=`<li>${x.c!=null?fmtQ(x.c*f)+" "+(x.u?ed(x.u)+" ":""):""}${ed(cap(x.n))}</li>`});return o}
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
/* 3.2.2: cand extragerea automata a esuat (ingrediente sau pasi goi) dar textul paginii e pastrat, editorul porneste de la liniile detectate ca sa le corectezi, nu sa scrii de la zero */
function guessFromText(t){t=String(t||"");const L=t.split(/\r?\n/).map(x=>x.replace(/^[\s\u2022\u25CF\-]+/,"").trim()).filter(Boolean);
 const noise=x=>/^(MACRO PER PORTIE|V\d+\s*\(|TIPS?\b|RE[TȚŢ]ETA\s*\d+)/i.test(x)||/^(Calorii|Proteine|Carbohidra[tțţ]i|Gr[ăa]simi|Fibre)\s*:?\s*[\d.,]+/i.test(x);
 const isIns=x=>/^INSTRUC[TȚŢ]IUNI/i.test(x),q=x=>/^\(?\d/.test(x);
 const a=L.findIndex(q),b=L.findIndex(isIns);const ing=[];
 if(a>=0)for(let k=a;k<(b>=0?b:L.length);k++){if(!noise(L[k])&&!isIns(L[k]))ing.push(L[k])}
 const steps=[];let buf="",pre="";const flush=()=>{if(buf){steps.push(pre+buf);pre=""}buf=""};
 if(b>=0)for(let k=b;k<L.length;k++){const x=L[k];if(isIns(x)){flush();const v=x.match(/VARIANTA\s*(\d+)/i);pre=v?"Varianta "+v[1]+": ":"";continue}
  if(noise(x)||/^TIPS?:?$/i.test(x))continue;buf+=(buf?" ":"")+x;if(/[.!?:]$/.test(x))flush()}
 flush();return{ing,steps}}
function editForm(r,i,sel){const m=r.macro||{},cats=[...new Set([...BOOK.map(x=>x.categorie),r.categorie,"Retetele mele"].filter(Boolean))].sort(),mv=k=>m[k]!=null?m[k]:"",gz=r.text_brut&&(!(r.ingrediente||[]).length||!(r.pasi_carte||[]).length)?guessFromText(r.text_brut):null,gI=gz&&!(r.ingrediente||[]).length?gz.ing:null,gS=gz&&!(r.pasi_carte||[]).length?gz.steps:null;
 $(sel).innerHTML=`<div class="bv" data-bi="${i}"><div style="margin-bottom:10px"><button class="alt" data-ecancel="1">Renunta</button></div>${VQ&&r.verifica?`<div class="card" style="margin-bottom:10px;background:var(--soft)"><b>De verificat: mai sunt ${BOOK.filter(x=>x.verifica).length}</b> (${esc(r.verifica.join(", "))})<div class="row" style="gap:8px;margin-top:8px"><button class="alt" type="button" data-vqskip="1" style="margin:0">Sari peste</button><button class="alt" type="button" data-vqstop="1" style="margin:0">Opreste</button></div></div>`:""}<div class="card"><h2>${r.nou?"Reteta noua":"Corecteaza: "+esc(r.titlu)}</h2>${r.nou?"":`<p class="muted" style="margin:0 0 8px"><b>${r.din?"Adaptata din:":"Din:"}</b> ${r.din?esc(r.din.sursa||"carte necunoscuta")+(r.din.nr!==""&&r.din.nr!=null?", reteta nr. "+esc(r.din.nr):""):esc(r.sursa||"carte necunoscuta")+(r.nr!=null&&r.nr!==""?", reteta nr. "+esc(r.nr):"")}${(r.pagina||r.pag||r.page)?", pagina "+esc(r.pagina||r.pag||r.page):""}. Cauta in carte dupa acest numar si compara.</p>`}

 <label for="ef-t${i}">Titlu</label><input id="ef-t${i}" data-ef="titlu" value="${esc(r.titlu)}" maxlength="120"${r.nou?' placeholder="ex: Papanasi cu smantana"':""}>
 <div class="row"><div><label for="ef-p${i}">Portii (- = nu se aplica)</label><input id="ef-p${i}" data-ef="portii" type="text" inputmode="numeric" maxlength="3" placeholder="ex: 4 sau -" value="${r.pna?"-":esc(r.portii==null?"":r.portii)}"><div data-pcbox>${(r.verifica||[]).includes(PVR)?`<div class="warn" style="margin-top:6px">Numarul de portii nu e confirmat. <button class="alt" type="button" data-pconf="1" style="margin:4px 0 0">Confirma numarul de portii</button></div>`:""}</div></div><div><label for="ef-c${i}">Categorie</label><select id="ef-c${i}" data-ef="categorie">${cats.map(c=>`<option${c===r.categorie?" selected":""}>${esc(c)}</option>`).join("")}</select></div></div>
 ${(gI&&gI.length)||(gS&&gS.length)?`<div class="warn" style="margin:10px 0 0">Extragerea automata a esuat. Am completat de mai jos ce am detectat in textul paginii (${[gI&&gI.length?"ingrediente":"",gS&&gS.length?"pasi":""].filter(Boolean).join(" si ")}). Compara cu cartea si corecteaza; nu se salveaza pana nu apesi Salveaza.</div>`:""}<label for="ef-i${i}">Ingrediente (unul pe linie)</label><textarea id="ef-i${i}" data-ef="ing" rows="8" placeholder="200 g faina&#10;2 oua&#10;## Sos&#10;1 lingura smantana">${esc(gI&&gI.length?gI.join("\n"):ingText(r.ingrediente))}</textarea>
 <label for="ef-s${i}">Mod de preparare (un pas pe linie)</label><textarea id="ef-s${i}" data-ef="pasi" rows="8" placeholder="Amesteca faina cu ouale.&#10;Coace 30 de minute.">${esc(gS&&gS.length?gS.join("\n"):(r.pasi_carte||[]).join("\n"))}</textarea>
 <div class="row" style="margin-top:12px;align-items:center;gap:8px"><button class="alt" type="button" data-emac="1" style="margin:0">Calculeaza macro (AI)</button><span class="muted">Estimare per portie, din ingredientele de mai sus.</span></div><div data-mres aria-live="polite"></div>
 <div class="row"><div><label>kcal</label><input data-ef="kcal" type="number" step="any" value="${esc(mv("kcal"))}"></div><div><label>Proteine g</label><input data-ef="proteine" type="number" step="any" value="${esc(mv("proteine"))}"></div><div><label>Carbo g</label><input data-ef="carbo" type="number" step="any" value="${esc(mv("carbo"))}"></div><div><label>Grasimi g</label><input data-ef="grasimi" type="number" step="any" value="${esc(mv("grasimi"))}"></div></div>
 <div class="acts">${vx(r).length?'<button class="go" data-esave="v">Salveaza ca verificata</button><button class="alt" data-esave="1">Salveaza, raman de verificat</button>':'<button class="go" data-esave="1">Salveaza</button>'}<button class="alt" data-ecancel="1">Renunta</button>${r.manual&&!r.nou?'<button class="alt" data-edel="1">Sterge reteta</button>':""}</div></div></div>`}
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
function editSave(bv,i,sel,verif){const r=BOOK[i],g=k=>bv.querySelector(`[data-ef=${k}]`).value;
 const t=g("titlu").trim();if(!t){toast("Titlul nu poate fi gol.");return}
 {const pp=pParse(g("portii"));if(pp.bad){toast("Portii: scrie un numar (1-200) sau - daca nu se aplica.");return}r.portii=pp.na?null:pp.n;if(pp.na)r.pna=true;else delete r.pna}r.titlu=t;if(g("categorie"))r.categorie=g("categorie");
 r.ingrediente=parseIngText(g("ing"));r.pasi_carte=g("pasi").split("\n").map(x=>x.trim()).filter(Boolean);
 r.macro=Object.assign({},r.macro);["kcal","proteine","carbo","grasimi"].forEach(k=>{const v=g(k);r.macro[k]=v===""?null:+v});
 {let st=[];try{st=JSON.parse(bv.dataset.stags||"[]")}catch(e){}if(st.length)r.etichete=[...new Set([...normTags(r.etichete),...normTags(st)])]}
 if(!r.manual)r.corectata=true;if(verif){r.verifica=(r.verifica||[]).filter(x=>x===PVR);if(!r.verifica.length)delete r.verifica;delete r.text_brut;delete r.text_orig}
 if(r.nou){delete r.nou;const st=getStored();if(!st.length)BOOK=[r];st.push(r);saveStored(st);EDIT=null;updBS();openBook(BOOK.indexOf(r),r.portii,sel);return}
 if(persistBook(r)){EDIT=null;updVC();if(VQ&&verif){VQ.done++;vqNext(VQ.pos+1);return}openBook(i,r.portii,sel)}}
function setBookTag(i,n,on){const r=BOOK[i],a=new Set(normTags(r.etichete));on?a.add(n):a.delete(n);r.etichete=[...a];
 const st=getStored(),k=bKey(r),j=st.findIndex(x=>bKey(x)===k);if(j>=0){st[j].etichete=r.etichete;saveStored(st)}}
/* "Salveaza ca reteta mea": copie in "Retetele mele" (originalul ramane neatins), pe care o editezi cum vrei; fara AI, deci gratuita */
function copyMine(i,sel){const r=BOOK[i],S="Retetele mele";BOOK=BOOK.filter(x=>!x.nou);
 const c=JSON.parse(JSON.stringify(r));["verifica","text_brut","corectata","nou","din"].forEach(k=>delete c[k]);
 c.sursa=S;c.nr=Math.max(0,...BOOK.filter(x=>x.sursa===S).map(x=>+x.nr||0))+1;c.manual=true;c.din={sursa:r.sursa||"",nr:r.nr!=null?r.nr:"",titlu:r.titlu};c.titlu=String(r.titlu).slice(0,100)+" (varianta mea)";
 const st=getStored(),keep=JSON.parse(JSON.stringify(c));if(!st.length)BOOK=[c];else BOOK=BOOK.concat([c]);st.push(keep);saveStored(st);updBS();
 const j=BOOK.indexOf(c);EDIT={sel,i:j};openBook(j,c.portii,sel);toast("Copie salvata in Colectia mea. O editezi acum; originalul ramane neatins.")}
function bvClick(e,sel){const bv=e.target.closest(".bv");if(!bv)return false;const d=e.target.dataset,i=+bv.dataset.bi,pi=bv.querySelector("[data-bp]"),p=pi&&pi.value!==""?Math.min(200,Math.max(1,Math.round(+pi.value)||1)):null;
 if(jrAct(d,bKey(BOOK[i]))){openBook(i,p,sel);return true}
 if(d.edit!==undefined){EDIT={sel,i};openBook(i,p,sel);return true}
 if(d.copyme!==undefined){copyMine(i,sel);return true}
 if(d.vqskip!==undefined){EDIT=null;vqNext(VQ.pos+1);return true}
 if(d.vqstop!==undefined){VQ=null;EDIT=null;drawBook();return true}
 if(d.ecancel!==undefined){VQ=null;EDIT=null;if(BOOK[i].nou){BOOK=BOOK.filter(x=>!x.nou);drawBook();return true}openBook(i,BOOK[i].portii,sel);return true}
 if(d.emac!==undefined){macCalc(bv,e.target);return true}
 if(d.pconf!==undefined){pConfirm(bv,i);return true}
 if(d.mcl!==undefined){macPanel(bv,i);return true}
 if(d.mai!==undefined){fdAI(bv,i,+d.mai,e.target);return true}
 if(d.mman!==undefined){fdFormShow(bv,+d.mman);return true}
 if(d.mms!==undefined){fdManSave(bv,i,+d.mms,e.target);return true}
 if(d.msv!==undefined){macSaveRec(bv,i,sel,p);return true}
 if(d.emacok!==undefined){macApply(bv,bv._mac.o,bv._mac.tags);return true}
 if(d.emacno!==undefined){bv.querySelector("[data-mres]").innerHTML="";return true}
 if(d.edel!==undefined){const b=e.target;if(!b.dataset.arm){b.dataset.arm="1";b.textContent="Sigur? Apasa din nou pentru stergere definitiva";setTimeout(()=>{if(b.isConnected){delete b.dataset.arm;b.textContent="Sterge reteta"}},5000);return true}
  const k=bKey(BOOK[i]);EDIT=null;putStored(getStored().filter(x=>bKey(x)!==k));toast("Reteta a fost stearsa.");return true}
 if(d.esave!==undefined){editSave(bv,i,sel,d.esave==="v");return true}
 if(d.bback!==undefined){VQ=null;EDIT=null;BOOK=BOOK.filter(x=>!x.nou);if(sel==="#bres")drawBook();else{SV=null;renderSaved()}return true}
 if(d.fav!==undefined){favT(d.fav,()=>openBook(i,p,sel));return true}
 if(d.psv!==undefined){const r=BOOK[i];if(p==null)return true;r.portii=p;delete r.pna;r.verifica=(r.verifica||[]).filter(x=>x!==PVR);if(!r.verifica.length)delete r.verifica;
  let t="Portii salvate: "+p+".";if(!r.macro||r.macro.kcal==null||r.macro.sursa==="local"){const L=macLocal(r);if(L.ok){r.macro={kcal:L.o.kcal,proteine:L.o.proteine,carbo:L.o.carbo,grasimi:L.o.grasimi,sursa:"local",acoperire:L.ok+" din "+L.n};t+=" Macro recalculat: "+L.o.kcal+" kcal per portie."}}
  if(persistBook(r)){updVC();openBook(i,p,sel);toast(t)}return true}
 if(d.adp!==undefined){adaptBook(i,BOOK[i].portii||p||1,sel,e.target);return true}
 if(d.cookb!==undefined){const r=BOOK[i];cookOpen(r.titlu,cookSteps(r,"b"),ingBook(r,1));return true}
 if(d.mnb!==undefined){menOpen({s:"b",r:BOOK[i],p:BOOK[i].portii||p||1});return true}
 if(d.cumb!==undefined){const r=BOOK[i],f=1,n=addList((r.ingrediente||[]).map(x=>({c:x.c!=null?+(x.c*f).toFixed(2):null,u:x.u,n:x.n,g:x.g})),r.titlu);e.target.textContent="Adaugat ("+n+") - vezi Cumparaturi";return true}
 return false}
function bvChange(e,sel){const bv=e.target.closest(".bv");if(!bv)return false;const d=e.target.dataset,i=+bv.dataset.bi,pi=bv.querySelector("[data-bp]"),p=pi&&pi.value!==""?Math.min(200,Math.max(1,Math.round(+pi.value)||1)):null;
 if(d.jnt!==undefined){setNote(bKey(BOOK[i]),{nt:e.target.value.slice(0,600)});return true}
 if(d.bp!==undefined){const v=e.target.value===""?null:Math.min(200,Math.max(1,Math.round(+e.target.value)||1));setTimeout(()=>openBook(i,v,sel),0);return true}
 if(d.tgb!==undefined){setBookTag(i,d.tgb,e.target.checked);openBook(i,p,sel);return true}
 return false}
/* ===== Coada "De verificat": parcurgi pe rand retetele cu extragere nesigura, direct in editor ===== */
let VQ=null;
function vqOpen(j){const k=VQ.keys[j];const i=BOOK.findIndex(r=>bKey(r)===k&&r.verifica);if(i<0)return false;VQ.pos=j;EDIT={sel:"#bres",i};openBook(i,BOOK[i].portii||1,"#bres");$("#bres").scrollIntoView({block:"start"});return true}
function vqNext(from){if(!VQ)return;for(let j=from;j<VQ.keys.length;j++)if(vqOpen(j))return;
 const done=VQ.done;VQ=null;EDIT=null;drawBook();toast(done?"Ai verificat "+done+(done===1?" reteta.":" retete.")+" Nu mai sunt retete de verificat in coada.":"Nu mai sunt retete de verificat in coada.")}
function vqStart(){const keys=BOOK.filter(r=>r.verifica).map(bKey);if(!keys.length){toast("Nu ai retete de verificat.");return}VQ={keys,pos:0,done:0};vqNext(0)}
$("#bvq").onclick=vqStart;
function newBook(){BOOK=BOOK.filter(x=>!x.nou);const S="Retetele mele",nr=Math.max(0,...BOOK.filter(x=>x.sursa===S).map(x=>+x.nr||0))+1;
 const r={sursa:S,nr,titlu:"",categorie:S,portii:2,ingrediente:[],pasi_carte:[],macro:{},etichete:[],manual:true,nou:true};
 BOOK=BOOK.concat([r]);const i=BOOK.length-1;EDIT={sel:"#bres",i};openBook(i,2,"#bres");$("#bres").scrollIntoView({block:"start"})}
$("#bnew").onclick=newBook;
var BLIM=60;const bReset=()=>{BLIM=60;drawBook()};
$("#bq").oninput=bReset;$("#bf").onchange=bReset;$("#bs").onchange=bReset;$("#bc").onchange=bReset;$("#bv").onchange=bReset;$("#bd").onchange=bReset;$("#bj").onchange=bReset;$("#bp").onchange=bReset;
$("#bres").onclick=e=>{if(bvClick(e,"#bres"))return;const d=e.target.dataset;
 if(d.bmore!==undefined){BLIM+=60;drawBook();return}
 if(d.fav!==undefined){favT(d.fav,drawBook);return}
 if(d.b!==undefined){openBook(+d.b,BOOK[d.b].portii,"#bres");$("#bres").scrollIntoView({block:"start"})}};
$("#bres").onchange=e=>{bvChange(e,"#bres")};
const BOOK0=BOOK;function setBook(j){BOOK=j;SV=null;drawBook()}
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
function saveStored(a){STORED=a;syMark("rbook");
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
function putStored(a){saveStored(a);BOOK=a.length?a:BOOK0;SV=null;drawBook();updBS()}
function updBS(){const s=STORED,c={};s.forEach(r=>{const k=r.sursa||"necunoscuta";c[k]=(c[k]||0)+1});const k=Object.keys(c);
 $("#bsn").innerHTML=k.length?k.map(x=>`<div class="apr"><b>${esc(x)}</b><span class="muted">${c[x]} retete</span><button class="alt" data-dl="${esc(x)}">Descarca JSON</button><button class="alt" data-src="${esc(x)}">Sterge</button></div>`).join("")+`<div class="row" style="margin-top:10px;gap:8px"><button class="go" data-dlall="1" style="margin:0">Descarca toate (${s.length} retete)</button><button class="alt" data-all="1">Sterge tot</button></div>`:'<p class="muted">Nu ai nicio baza incarcata (apare doar reteta de test).</p>'}
/* descarca o carte (cu corecturile tale) in acelasi format in care o incarci: o lista de retete, reincarcabila ca atare */
function dlBook(src){const all=src===null,l=getStored().filter(r=>all||(r.sursa||"necunoscuta")===src).map(r=>{const o=JSON.parse(JSON.stringify(r));delete o.nou;return o});
 if(!l.length){toast("Nu am gasit retete in aceasta carte.");return}
 const name=(all?"toate-retetele":String(src).replace(/[^\w\-]+/g,"_").replace(/^_+|_+$/g,"")||"carte")+"-corectat-"+dKey(new Date())+".json",a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([JSON.stringify(l,null,1)],{type:"application/json"}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
 toast("Descarcat: "+name+" ("+l.length+" retete). Il poti reincarca din Setari -> Carti.")}
$("#bscard").onclick=e=>{const b=e.target,d=b.dataset;if(d.dl!==undefined){dlBook(d.dl);return}if(d.dlall!==undefined){dlBook(null);return}if(d.src===undefined&&!d.all)return;
 if(b.dataset.arm!=="1"){const t=b.textContent;b.dataset.arm="1";b.textContent="Confirma stergerea";setTimeout(()=>{if(b.isConnected){b.dataset.arm="";b.textContent=t}},4000);return}
 putStored(d.all?[]:getStored().filter(r=>(r.sursa||"necunoscuta")!==d.src))};
libInit();
let PEND=null;
const srcOf=(r,f)=>((PEND&&PEND.nm)||"").trim()||r.sursa||f.name.replace(/\.json$/i,"");
function pvInfo(){const {j,f}=PEND,names=[...new Set(j.map(r=>srcOf(r,f)))],repl=getStored().filter(r=>names.includes(r.sursa)).length,vf=j.filter(r=>r.verifica).length;
 return `${j.length} retete. Apar ca: ${esc(names.join(", "))}. ${repl?"Inlocuiesc "+repl+" retete existente cu acelasi nume.":"Carte noua in baza."}${vf?" "+vf+" retete sunt marcate verifica si se afiseaza ca text brut.":""}`}
function pvDraw(){const el=$("#bpv");if(!PEND){el.innerHTML="";return}
 const {f}=PEND;
 el.innerHTML=`<div class="card" style="margin:8px 0 12px"><b>${esc(f.name)}</b><label for="bnm" style="margin-top:10px">Numele cartii (poti schimba)</label><input id="bnm" value="${esc(PEND.nm||"")}" placeholder="Numele din fisier" autocomplete="off"><div class="muted" id="bpa" style="margin:6px 0 10px">${pvInfo()}</div><button class="go" data-pv="ok" style="margin:0">Incarca</button> <button class="alt" data-pv="no">Anuleaza</button></div>`}
$("#bpv").oninput=e=>{if(e.target.id==="bnm"&&PEND){PEND.nm=e.target.value;$("#bpa").innerHTML=pvInfo()}};
$("#bfile").onchange=async e=>{const f=e.target.files[0];PEND=null;$("#bm").textContent="";if(!f){pvDraw();return}
 try{const j=JSON.parse(await f.text());if(!Array.isArray(j)||!j.length||!j.every(r=>r&&typeof r==="object"&&r.titlu))throw 0;const n0=[...new Set(j.map(r=>r.sursa||""))];PEND={j,f,nm:n0.length===1&&n0[0]?n0[0]:""};pvDraw()}
 catch(x){pvDraw();$("#bm").textContent="Fisierul nu e un retete.json valid (trebuie sa fie o lista de retete cu titlu)."}};
$("#bpv").onclick=async e=>{const d=e.target.dataset.pv;if(!d)return;
 if(d==="no"){PEND=null;$("#bfile").value="";pvDraw();$("#bm").textContent="Incarcare anulata.";return}
 const {j,f}=PEND;j.forEach(r=>{fixRec(r);r.sursa=srcOf(r,f)});const ns=new Set(j.map(r=>r.sursa)),m=getStored().filter(r=>!ns.has(r.sursa)).concat(j);
 PEND=null;$("#bfile").value="";pvDraw();setBook(m);
 const ok=await saveStored(m);updBS();
 $("#bm").textContent=ok?"Incarcat: "+j.length+" retete ("+[...ns].join(", ")+"). Total in baza: "+m.length+".":j.length+" retete incarcate, dar nu au putut fi salvate in browser. Le incarci din nou data viitoare."};
fetch("retete.json").then(r=>r.ok?r.json():null).then(j=>{if(Array.isArray(j)&&j.length&&!getStored().length){BOOK=j;drawBook()}}).catch(()=>{});
drawBook();


/* "Ce pot gati din debara": ingredientele unei retete care nu sunt acoperite de debara (potrivire putin mai larga decat la cumparaturi) */
let _mv=null,_mm=new WeakMap();
const covered=name=>{if(inPantry(name))return true;const t=[...new Set(toks(name))];if(!t.length)return true;return panTok().some(pt=>pt.length&&t.length<=pt.length+1&&pt.every(w=>t.some(x=>tokEq(w,x))))};
function missing(r){const v=(LS("rp")||"")+"|"+(LS("rcat")||"")+"|"+(LS("rcg")||"");if(v!==_mv){_mv=v;_mm=new WeakMap()}
 let o=_mm.get(r);if(o)return o;
 const names=[...new Set(prepIngs((r.ingrediente||[]).map(x=>({c:x.c,u:x.u,n:x.n,g:x.g}))).map(x=>cleanName(x.n)).filter(Boolean))];
 o={tot:names.length,miss:names.filter(n=>!covered(n))};_mm.set(r,o);return o}
/* lista de cumparaturi */
const BASE=["sare","piper","ulei","zahar","faina"]; /* puse implicit in debara (apa nu se mai cumpara deloc) */
const getList=()=>{try{const j=JSON.parse(LS("rl"));return Array.isArray(j)?j.filter(x=>x&&typeof x==="object"&&typeof x.n==="string"):[]}catch(e){return[]}};
const putList=l=>LS("rl",JSON.stringify(l));
/* ===== DEBARA (produse pe care le ai deja / se consuma greu; fara cantitati) ===== */
let HP=true,PE=null,PED=null;
/* categorii debara; marcaje (proaspat/congelat/uscat/conserva/altceva) doar unde au sens */
/* categorii alimente: editabile in Setari -> Alimente > Categorii alimente (rcg); "altele" ramane mereu ultima */
const DEFCATS=[{id:"condimente",n:"Condimente",f:0},{id:"legume",n:"Legume",f:1},{id:"carne",n:"Carne",f:0},{id:"fructe",n:"Fructe",f:1},{id:"cereale",n:"Cereale",f:1},{id:"lactate",n:"Lactate",f:0},{id:"altele",n:"Altele",f:0}];
const FI={proaspat:["Proaspat",'<path d="M5 19C5 10 10 5 20 4c0 10-4 15-13 15z" fill="#3f9d4e"/><path d="M5 19L14 10" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/>'],
 congelat:["Congelat",'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" fill="#bfe6f7" stroke="#4aa3cc" stroke-width="1.5" stroke-linejoin="round"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9" fill="none" stroke="#4aa3cc" stroke-width="1.2"/>'],
 uscat:["Uscat",'<path d="M5 19C5 10 10 5 20 4c0 10-4 15-13 15z" fill="#e0a82e"/><path d="M5 19L14 10" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/>'],
 conserva:["Conserva",'<rect x="5" y="5" width="14" height="15" rx="2.5" fill="#d96b5a"/><rect x="5" y="5" width="14" height="3" rx="1.5" fill="#b4b4b4"/><rect x="5" y="17" width="14" height="3" rx="1.5" fill="#b4b4b4"/><rect x="8" y="10" width="8" height="5" rx="1" fill="#fff" opacity=".85"/>'],
 altceva:["Altceva (borcan, gem, sos...)",'<rect x="8" y="3" width="8" height="3.5" rx="1" fill="#9a7b4f"/><path d="M7 7h10c1 1 1.5 2 1.5 3.5v7.5a2.5 2.5 0 0 1-2.5 2.5H8A2.5 2.5 0 0 1 5.5 18v-7.5C5.5 9 6 8 7 7z" fill="#e7d9b8" stroke="#9a7b4f" stroke-width="1.3"/><rect x="8" y="11" width="8" height="5" rx="1" fill="#fff" opacity=".7"/>']};
const CART='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.5l2 10.5h10L19.5 8H6.5"/><circle cx="9" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/></svg>',FORMS=Object.keys(FI),fIco=f=>`<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">${FI[f][1]}</svg>`;let CATS=[],FCAT=[];
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
 if(t.some(w=>["arahide","alune","migdale","nuca","nuci","fistic","tahini","seminte","susan","chia","caju"].includes(w)))return"altele";
 if(t.some(w=>["ou","oua","ouale","galbenus","galbenusuri","albus","albusuri"].includes(w)))return has("lactate")?"lactate":"altele";
 if(t.some(w=>w==="paste"||w==="pasta")&&t.some(w=>/^(rosi|tomat)/.test(w)))return has("legume")?"legume":"altele";
 for(const c of ["condimente","lactate","carne","fructe","cereale","legume"]){if(!has(c))continue;const kw=CATKW[c].split(" ");if(t.some(w=>kw.some(k=>w===k||(k.length>=5&&w.startsWith(k)))))return c}return"altele"}
/* categoria unui aliment: alegerea ta din Setari -> Alimente (rcat) sau potrivirea automata */
const cn=n=>norm(String(n||"").replace(/\([^)]*\)/g," ").replace(/\s+/g," ").trim());
const getCats=()=>{try{const j=JSON.parse(LS("rcat")||"[]");return Array.isArray(j)?j.filter(x=>x&&typeof x.n==="string"&&CATS.some(c=>c[0]===x.c)):[]}catch(e){return[]}};
const putCats=l=>LS("rcat",JSON.stringify(l));
const catOf=n=>{const k=cn(n),o=getCats().find(x=>cn(x.n)===k);return o?o.c:guessCat(n)};
function setCat(n,c){n=String(n||"").replace(/\s+/g," ").trim().slice(0,60);if(!n)return;const l=getCats().filter(x=>cn(x.n)!==cn(n));if(c&&c!==guessCat(n))l.push({n,c});putCats(l)}
const mkPan=(n,f)=>{const c=catOf(n),fs=(Array.isArray(f)?f:[]).map(x=>x==="neprocesat"?"proaspat":x).filter((x,i,a)=>FORMS.includes(x)&&a.indexOf(x)===i);return{n,cat:c,f:FCAT.includes(c)?fs:[]}};
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
const P_TIP=/^(pudra|ulei|sos|suc|unt|faina|pasta|zeama|lapte|otet|extract|concentrat|piure|sirop|fulgi|crema|gem|dulceata|ceai|amidon|esenta|bulion|amestec|mix|condiment)\s+de\s+(.+)$/,P_DROP=/^(seminte|boabe|frunze|bulbi|fructe|flori)\s+de\s+(.+)$/;
/* nume afisat in Debara: "pudra de usturoi" -> "usturoi, pudra" (se sorteaza langa usturoi); "seminte de susan" -> "susan". Numele salvat nu se schimba. */
const pDisp=n=>{const t=String(n).trim(),z=norm(t);if(z.length!==t.length)return t;let m=P_DROP.exec(z);if(m)return t.slice(t.length-m[2].length);m=P_TIP.exec(z);return m?t.slice(t.length-m[2].length)+", "+t.slice(0,m[1].length).toLowerCase():t};
function drawPantry(){const l=getPan(),PQ=norm($("#pin").value||"").trim().split(/\s+/).filter(Boolean),lv=PQ.length?l.filter(p=>PQ.every(w=>norm(p.n+" "+pDisp(p.n)).includes(w))):l;
 $("#pcn").textContent=l.length?(PQ.length?lv.length+" din "+l.length:l.length)+" produse":"";
 $("#pl").innerHTML=l.length?`<details class="pdet"><summary>Legenda simboluri</summary><div class="plg"><div class="fleg"><span>${CART.replace('width="20" height="20"','width="16" height="16"')} am terminat (revine in Cumparaturi)</span><span><b>&#8943;</b> editeaza / scoate</span></div>${FCAT.length?`<div class="fleg">Marcaje: ${FORMS.map(f=>`<span>${fIco(f)} ${esc(FI[f][0].split(" (")[0].toLowerCase())}</span>`).join("")}</div>`:""}</div></details><div class="pgrid">`+CATS.map(([id,lab])=>{const it=lv.filter(p=>p.cat===id).sort((a,b)=>norm(pDisp(a.n)).localeCompare(norm(pDisp(b.n)),"ro")||norm(a.n).localeCompare(norm(b.n)));
  if(!it.length)return"";return `<section class="pcat" aria-label="${esc(lab)}"><h3>${esc(lab)} <span class="muted">${it.length||""}</span></h3>`+(it.length?it.map(p=>PED===p.n?`<div class="pit pedit"><input id="pen" maxlength="60" value="${esc(p.n)}" aria-label="Nume produs"><select id="pec" class="lcs" aria-label="Categorie">${CATS.map(([cid,cl])=>`<option value="${esc(cid)}"${cid===p.cat?" selected":""}>${esc(cl)}</option>`).join("")}</select><div class="pa"><button class="go" data-pesave="1">Salveaza</button><button class="alt" data-pecancel="1">Anuleaza</button></div></div>`:`<div class="pit"><div class="pn">${esc(cap(pDisp(p.n)))}</div>${FCAT.includes(id)?`<div class="pf">${FORMS.map(f=>`<button type="button" class="fchip${p.f.includes(f)?" on":""}" data-pf="${f}" data-pn="${esc(p.n)}" aria-pressed="${p.f.includes(f)}" aria-label="${esc(FI[f][0])}" title="${esc(FI[f][0])}">${fIco(f)}</button>`).join("")}</div>`:""}<div class="pa"><button class="alt ib" data-pdone="${esc(p.n)}" title="Am terminat: il pune inapoi in Cumparaturi" aria-label="Am terminat ${esc(p.n)}: il pune inapoi in Cumparaturi">${CART}</button><details class="mre pmenu"><summary class="ib" aria-label="Mai multe pentru ${esc(p.n)}" title="Editeaza sau scoate">&#8943;</summary><div class="pmen"><button class="alt" data-pedit="${esc(p.n)}">Editeaza</button><button class="alt" data-pdel="${esc(p.n)}">Scoate din debara</button></div></details></div></div>`).join(""):`<p class="muted" style="margin:4px 0 0">-</p>`)+`</section>`}).join("")+(PQ.length&&!lv.length?`<p class="muted">Nu e in debara: "${esc($("#pin").value.trim())}". Apasa Adauga ca sa-l pui.</p>`:"")+`</div>`:'<p class="muted">Debaraua e goala. Adauga produse sau muta-le din Cumparaturi cu "Am in debara".</p>'}
$("#pAdd").onclick=()=>{const v=$("#pin").value;if(addPan(v)){$("#pin").value="";drawPantry();navCount()}else if(v.trim())toast("Produsul e deja in debara.")};
$("#pin").oninput=drawPantry;
$("#pin").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();$("#pAdd").click()}};
function pEditSave(){const old=PED,nv=($("#pen").value||"").replace(/\s+/g," ").trim().slice(0,60),cat=$("#pec").value;if(!nv){toast("Scrie un nume.");return}
 const l=getPan();if(norm(nv)!==norm(old)&&l.some(x=>norm(x.n).trim()===norm(nv).trim())){toast("Exista deja in debara: "+nv+".");return}
 const u=undoMark(["rp","rcat"]),p=l.find(x=>x.n===old);if(!p){PED=null;drawPantry();return}
 if(nv!==old)setCat(old,guessCat(old));setCat(nv,cat);p.n=nv;putPan(l);PED=null;drawPantry();navCount();undoShow("Modificat: "+nv+".",u,redrawAll)}
$("#pl").onkeydown=e=>{if(!PED||!e.target.closest(".pedit"))return;if(e.key==="Enter"){e.preventDefault();pEditSave()}else if(e.key==="Escape"){PED=null;drawPantry()}};
document.addEventListener("click",e=>{document.querySelectorAll("details.pmenu[open],details.lmore[open]").forEach(d=>{if(!d.contains(e.target))d.open=false})});
$("#pl").onclick=e=>{const b=e.target.closest("[data-pf],[data-pdone],[data-pdel],[data-pedit],[data-pesave],[data-pecancel]")||e.target,d=b.dataset;
 if(d.pedit!==undefined){PED=d.pedit;drawPantry();const i=$("#pen");if(i){i.focus();i.select()}return}
 if(d.pesave!==undefined){pEditSave();return}
 if(d.pecancel!==undefined){PED=null;drawPantry();return}
 if(d.pf!==undefined){const l=getPan(),p=l.find(x=>x.n===d.pn);if(p){p.f=p.f.includes(d.pf)?p.f.filter(x=>x!==d.pf):[...p.f,d.pf];putPan(l);drawPantry()}return}
 if(d.pdel!==undefined){const u=undoMark(["rp","rcat"]);putPan(getPan().filter(x=>x.n!==d.pdel));drawPantry();navCount();undoShow("Scos din debara: "+d.pdel+".",u,redrawAll)}
 if(d.pdone!==undefined){const u=undoMark(["rp","rcat","rl"]);putPan(getPan().filter(x=>x.n!==d.pdone));addList([{n:d.pdone,u:"",c:null}],"Debara");drawPantry();undoShow("\""+d.pdone+"\" a fost pus inapoi in Cumparaturi.",u,redrawAll)}};
function navCount(){const n=getList().filter(x=>!x.done&&!hid(x)).length;document.querySelector('#nav [data-v=lista]').textContent="Cumparaturi"+(n?" ("+n+")":"")}
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
  if(it&&!it.parts&&it.src.length===1)it.parts=[{s:it.src[0],c:it.c}];
  if(it){if(it.c!=null&&c!=null)it.c=+(it.c+c).toFixed(2);else if(it.c==null)it.c=c;if(!it.src.includes(title))it.src.push(title);
   if(it.parts){const pt=it.parts.find(p=>p.s===title);if(pt)pt.c=pt.c!=null&&c!=null?+(pt.c+c).toFixed(2):(pt.c==null?c:pt.c);else it.parts.push({s:title,c})}}
  else l.push({k,n:nm,u,c,src:[title],parts:[{s:title,c}],done:0});n++});
 putList(l);navCount();return n}
/* 2.24.1: scoate dintr-o sursa (reteta / intrare din meniu) doar partea ei din lista */
function removeSrc(title){const l=getList(),out=[];let rem=0,red=0,kept=0;
 l.forEach(x=>{if(x.done||!x.src.includes(title)){out.push(x);return}
  if(x.parts){x.parts=x.parts.filter(p=>p.s!==title);if(!x.parts.length){rem++;return}
   const cs=x.parts.map(p=>p.c).filter(c=>c!=null);x.c=cs.length?+cs.reduce((s,c)=>s+c,0).toFixed(2):null;x.src=x.parts.map(p=>p.s);red++;out.push(x)}
  else if(x.src.length===1){rem++}
  else{x.src=x.src.filter(s=>s!==title);kept++;out.push(x)}});
 putList(out);
 const m=getMen();let ch=false;Object.keys(m).forEach(d=>SLOTS.forEach(([s])=>(m[d][s]||[]).forEach(en=>{if(en.L&&en.t+" (meniu "+ZILE[dFrom(d).getDay()].toLowerCase()+")"===title){en.L=0;ch=true}})));
 if(ch)putMen(m);
 navCount();return{rem,red,kept}}
const srcMsg=(t,r)=>"Scos: "+t+" ("+r.rem+" produse scoase"+(r.red?", "+r.red+" cu cantitate redusa":"")+(r.kept?"; "+r.kept+" comune cu alte retete, cantitatea ramane (lista veche)":"")+").";
/* 2.24.1: produsele vechi cu o singura sursa primesc evidenta pe retete (cantitatea e exacta); cele cu mai multe surse nu pot fi impartite */
(function(){try{const l=getList();let ch=0;l.forEach(x=>{if(!x.parts&&x.src&&x.src.length===1){x.parts=[{s:x.src[0],c:x.c}];ch++}});if(ch)LS("rl",JSON.stringify(l))}catch(e){}})();
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
const cap=s=>{s=String(s==null?"":s);return s.charAt(0).toUpperCase()+s.slice(1)}; /* 2.24.1: doar afisare, datele raman cum sunt */
const itTxt=x=>(x.c!=null?fmtQ(x.c)+" ":"")+(x.u?x.u+" ":"")+cap(x.n);
if(LS("rgrp2")!=="1"){LS("rgrp","1");LS("rgrp2","1")} /* 2.24.1: bifa "Grupeaza" a fost scoasa; lista e mereu grupata */
const GRP=LS("rgrp")!=="0";
let LSRC=[];let LV=LS("rlv")==="r"?"r":"p";
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
 const rowH=([x,i])=>PE===i?`<div class="it"><div style="flex-basis:100%"><div class="muted" style="margin-bottom:4px">Adauga in debara ca (nume general) si categorie:</div><input id="lpn" maxlength="60" value="${esc(sugName(x.n))}" aria-label="Nume in debara"></div><select id="lpc" class="lcs" aria-label="Categorie in debara">${CATS.map(([id,lab])=>`<option value="${esc(id)}"${catOf(sugName(x.n))===id?" selected":""}>${esc(lab)}</option>`).join("")}</select><button class="go" data-lpok="${i}" style="margin:0">Muta</button><button class="alt" data-lpno="1">Anuleaza</button></div>`:`<div class="it${x.done?" done":""}"><input type="checkbox" data-ld="${i}" ${x.done?"checked":""} aria-label="Cumparat"><div><div class="tx">${esc(itTxt(x))}${!HP&&!x.done&&inPantry(x.n)?` <span class="lb">in debara</span>`:""}</div><div class="src">${esc(x.src.join(", "))}</div></div>${x.done?"":`<button class="alt" data-lp="${i}" title="Am deja produsul: il muta in Debaraua mea">In debara</button>`}<button class="alt" data-lx="${i}" aria-label="Scoate">x</button></div>`;
 let body;
 if(!vis.length)body=`<p class="muted">${l.length?"Totul e ascuns sau bifat.":"Lista e goala. Scrie mai sus un produs sau deschide o reteta si apasa Adauga la cumparaturi. Bifeaza ce ai deja in casa direct aici."}</p>`;
 else if(LV==="r"){const srcs=[];l.forEach(x=>{if(!x.done)x.src.forEach(s=>{if(!srcs.includes(s))srcs.push(s)})});
  body=srcs.map((s,j)=>{const its=l.filter(x=>!x.done&&x.src.includes(s)&&!hid(x));if(!its.length)return"";
   return`<div class="lrg"><div class="lrh"><h3 class="lgh">${esc(s)}</h3><button class="alt" data-lsr="${j}" aria-label="Scoate ${esc(s)} din lista">Scoate</button></div>`+its.map(x=>{const pt=x.parts&&x.parts.find(p=>p.s===s);const t=pt?itTxt({c:pt.c,u:x.u,n:x.n}):itTxt(x);return`<div class="lri"><span>${esc(t)}</span>${!pt&&x.src.length>1?` <span class="muted">(total, impreuna cu alte retete)</span>`:""}</div>`}).join("")+`</div>`}).join("")||`<p class="muted">Totul e bifat.</p>`;LSRC=srcs}
 else if(GRP)body=CATS.map(([id,lab])=>{const g=vis.filter(([x])=>catOf(x.n)===id);return g.length?`<h3 class="lgh">${esc(lab)}</h3>`+g.map(rowH).join(""):""}).join("");
 else body=vis.map(rowH).join("");
 const bn=LBN?`<div class="lbn"><span>Adaugat din meniu (${esc(LBN.label)}): <b>${LBN.n}</b> produse noi din ${LBN.r} retete${np?` (${np} ascunse, le ai in debara)`:""}${LBN.sk?` (${LBN.sk} fara ingrediente)`:""}${LBN.old?`; ${LBN.old} erau deja adaugate`:""}.</span><button class="alt" data-lbk="1">Inapoi la meniu</button><button class="alt" data-lbx="1" aria-label="Inchide">&times;</button></div>`:"";
 $("#ll").innerHTML=bn+`<div class="row ladd"><input id="lAddI" maxlength="120" placeholder="Adauga produs, ex: 2 l lapte, paine" aria-label="Produs nou in lista" autocomplete="off"><button class="go" id="lAddB">Adauga</button></div>`+(l.length?`<div class="row mseg lseg"><button class="alt${LV==="p"?" on":""}" data-lv="p">Pe produse</button><button class="alt${LV==="r"?" on":""}" data-lv="r">Pe retete</button></div><div class="row lact"><button class="alt" id="lCp">Copiaza lista</button>${canShare()?`<button class="alt" id="lSh">Trimite lista</button>`:""}<details class="mre lmore"><summary>Mai multe</summary><div class="row lact2"><button class="alt" id="lDn">Sterge bifate</button><button class="alt" id="lAll">Goleste lista</button></div></details></div>
 <label style="font-weight:400;margin:2px 0;display:flex;align-items:center;gap:8px"><input type="checkbox" id="lHp" style="width:auto" ${HP?"checked":""}> Ascunde produsele din debara${pan?"":" (debaraua e goala)"}${np?" - "+np+" ascunse":""}</label><div id="lmsg" class="muted"></div>`:"")+body}
$("#ll").onchange=e=>{const d=e.target.dataset; if(e.target.id==="lHp"){HP=e.target.checked;PE=null;drawList();navCount();return}
 
 if(d.ld!==undefined){const l=getList();l[d.ld].done=e.target.checked?1:0;putList(l);navCount();drawList()}};
$("#ll").onkeydown=e=>{if(e.key==="Enter"&&e.target.id==="lAddI"){e.preventDefault();lAdd();return}if(e.key==="Enter"&&e.target.id==="lpn"){e.preventDefault();const b=document.querySelector("[data-lpok]");if(b)b.click()}if(e.key==="Escape"&&PE!==null){PE=null;drawList()}};
$("#ll").onclick=e=>{const b=e.target,d=b.dataset,id=b.id;
 if(d.lv){LV=d.lv;LS("rlv",LV);drawList();return}
 if(d.lsr!==undefined){const s=LSRC[+d.lsr];if(s){const u=undoMark(["rl","rmen"]),r=removeSrc(s);drawList();drawMenu();undoShow(srcMsg(s,r),u,redrawAll)}return}
 if(d.lbk){LBN=null;show("meniu");return}
 if(d.lbx){LBN=null;drawList();return}
 if(d.lp!==undefined){PE=+d.lp;drawList();const el=$("#lpn");if(el){el.focus();el.select()}return}
 if(d.lpno!==undefined){PE=null;drawList();return}
 if(d.lpok!==undefined){const nm=($("#lpn")||{}).value||"",l=getList(),it=l[+d.lpok];if(!nm.trim()||!it)return;const u=undoMark(["rl","rp","rcat"]),cv=($("#lpc")||{}).value;if(cv&&cv!==catOf(nm.trim()))setCat(nm.trim(),cv);addPan(nm);l.splice(+d.lpok,1);putList(l);PE=null;navCount();drawList();$("#lmsg").textContent="\""+nm.trim()+"\" e acum in Debaraua mea.";undoShow("Mutat in debara: "+nm.trim()+".",u,redrawAll);return}
 if(PE!==null)PE=null;
 if(d.lx!==undefined){const u=undoMark(["rl"]),l=getList(),nm=(l[d.lx]||{}).n;l.splice(d.lx,1);putList(l);navCount();drawList();undoShow("Scos din lista: "+nm+".",u,redrawAll);return}
 if(id==="lAddB"){lAdd();return}
 if(id==="lSh"){const t=listTxt();if(!t){$("#lmsg").textContent="Nu ai nimic de trimis.";return}navigator.share({title:"Lista de cumparaturi",text:t}).catch(()=>{});return}
 if(id==="lCp"){const t=listTxt(),m=$("#lmsg");
  const ok=()=>{m.textContent="Copiat. Poti lipi lista oriunde."};
  const manual=()=>{m.innerHTML='Nu pot copia automat in acest browser. Textul e selectat mai jos: apasa Ctrl+C (sau tine apasat si alege Copiaza).<textarea id="lTa" readonly rows="'+Math.min(12,t.split("\n").length+1)+'" style="width:100%;margin-top:6px"></textarea>';const ta=$("#lTa");ta.value=t;ta.focus();ta.select()};
  const old=()=>{const ta=document.createElement("textarea");ta.value=t;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();let r=false;try{r=document.execCommand("copy")}catch(x){}ta.remove();r?ok():manual()};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,old);else old();return}
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
const ingGen=r=>(r.ingrediente||[]).map(i=>[i.cantitate,i.unitate,cap(i.nume)].filter(x=>x!==""&&x!=null).join(" "));
const ingBook=(r,f)=>(r.ingrediente||[]).map(x=>(x.c!=null?fmtQ(x.c*f)+" ":"")+(x.u?x.u+" ":"")+cap(x.n));
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
const pfHtml=r=>{const p=recPref(r),w=[...p.lk.map(x=>`<span class="pk">${esc(x)}</span>`),...p.av.map(x=>`<span class="pa">${esc(x)}</span>`)];return w.length?`<div class="pf">Contine: ${w.join(", ")}</div>`:""};
const pfLine=pfHtml;
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
/* ===== 3.1.0: profil nutritional, tinte si micronutrienti (valori de referinta EFSA pentru adulti) ===== */
const PR_ACT=[[1.4,"Usor activ (birou, putina miscare)"],[1.6,"Moderat activ (antrenament de 3-4 ori pe saptamana)"],[1.8,"Activ (antrenament zilnic sau munca fizica)"],[2.0,"Foarte activ (efort intens zilnic)"]];
const PR_GOAL=[["m","Mentinere",0,.83],["c","Crestere masa musculara",.10,1.6],["d","Definire (scadere in greutate)",-.15,2.0]];
function getPr(){try{const j=JSON.parse(LS("rprof")||"{}");return j&&typeof j==="object"&&!Array.isArray(j)?j:{}}catch(e){return{}}}
const putPr=o=>LS("rprof",JSON.stringify(o));
const prNum=(v,a,b)=>{if(v===""||v==null)return null;v=+v;return Number.isFinite(v)&&v>=a&&v<=b?v:null};
const prOK=p=>(p.s==="m"||p.s==="f")&&prNum(p.a,18,99)!=null&&prNum(p.w,35,250)!=null&&prNum(p.h,130,220)!=null&&PR_ACT.some(a=>a[0]===+p.act);
/* tinte: standard din profil (energie: Mifflin-St Jeor x nivel de activitate +/- etapa), suprascrise de valorile tale */
function profT(p){p=p||getPr();const o={ok:prOK(p)};if(!o.ok)return o;
 const g=PR_GOAL.find(x=>x[0]===p.g)||PR_GOAL[0],w=+p.w;
 o.kstd=Math.round((10*w+6.25*p.h-5*p.a+(p.s==="m"?5:-161))*p.act*(1+g[2])/10)*10;
 o.k=prNum(p.kc,800,9000)||o.kstd;o.pkstd=g[3];o.pk=prNum(p.pk,.3,4)||g[3];o.p=Math.round(o.pk*w);
 o.gpstd=30;o.gp=prNum(p.gp,10,60)||30;o.f=Math.round(o.k*o.gp/100/9);o.c=Math.max(0,Math.round((o.k-4*o.p-9*o.f)/4));o.w=w;return o}
function getMT(){const t=profT();if(t.ok)return{k:t.k,p:t.p};
 try{const j=JSON.parse(LS("rmt")||"{}");return{k:+j.k>0?Math.min(9999,+j.k):0,p:+j.p>0?Math.min(999,+j.p):0}}catch(e){return{k:0,p:0}}}
/* [index in NUTRI.C, eticheta, unitate, tip: "m" minim recomandat, "x" limita maxima, null fara tinta, grup: 1 = important] */
const MIC=[[4,"Fibre","g","m",1],[8,"Sodiu","mg","x",1],[6,"Grasimi saturate","g","x",1],[5,"Zaharuri totale","g","x",1],[10,"Fier","mg","m",1],[9,"Calciu","mg","m",1],[18,"Vitamina D","µg","m",1],[25,"Vitamina B12","µg","m",1],[24,"Folat (B9)","µg","m",1],
 [13,"Potasiu","mg","m",0],[11,"Magneziu","mg","m",0],[12,"Fosfor","mg","m",0],[14,"Zinc","mg","m",0],[15,"Seleniu","µg","m",0],[16,"Vitamina A","µg","m",0],[17,"Vitamina E","mg","m",0],[19,"Vitamina C","mg","m",0],[26,"Vitamina K","µg","m",0],
 [20,"Vitamina B1","mg","m",0],[21,"Vitamina B2","mg","m",0],[22,"Vitamina B3","mg","m",0],[23,"Vitamina B6","mg","m",0],[7,"Colesterol","mg",null,0]];
/* valori EFSA (PRI sau AI) pentru adulti de 18+ ani; tinta pentru "x" e o limita, nu un minim */
function micT(p,t){if(!t||!t.ok)return null;const m=p.s==="m",a=+p.a,MJ=t.k*4.184/1000;
 return{4:25,8:2000,6:t.k*.10/9,5:t.k*.10/4,10:m?11:(a<=50?16:11),9:a<25?1000:950,18:15,25:4,24:330,13:3500,11:m?350:300,12:550,14:m?11.7:9.3,15:70,16:m?750:650,17:m?13:11,19:m?110:95,26:t.w,20:.1*MJ,21:1.6,22:1.6*MJ,23:m?1.7:1.6}}
function micOf(ings,por){const S=new Array(27).fill(0);let n=0,ok=0,nov=0;
 (ings||[]).forEach(x=>{if(!x||x.c==null)return;n++;const f=fdMatch(x.n);if(!f)return;const q=fdGrams(x,f);if(!q)return;ok++;if(f.zero)return;if(!f.v){nov++;return}for(let j=0;j<27;j++)S[j]+=q.g*f.v[j]/100});
 const d=por>0?por:1;return{s:S.map(v=>v/d),n,ok,nov}}
function micEnt(en){if(en.s==="x")return null;const rec=menRec(en);let ings,por;
 if(rec){ings=rawIngs(en.s,rec.r);por=rec.r.pna?1:(rec.r.portii||1)}else{ings=Array.isArray(en.i)?en.i:[];por=+en.bp||1}
 return ings&&ings.length?micOf(ings,por):null}
function dayMic(dm){const s=new Array(27).fill(0);let ents=0,used=0,n=0,ok=0;
 SLOTS.forEach(([id])=>(dm[id]||[]).forEach(en=>{if(en.s==="x")return;ents++;const r=micEnt(en);if(!r)return;used++;n+=r.n;ok+=r.ok;r.s.forEach((v,i)=>{s[i]+=v})}));return{s,ents,used,n,ok}}
const fmtN=v=>{const a=Math.abs(v);return String(a>=100?Math.round(v):a>=10?+v.toFixed(1):+v.toFixed(2)).replace(".",",")};
/* randuri cu bara: valoare / tinta, procent, culoare dupa stare */
/* bara: 0..120% din tinta; linia = 100%; verde = cat ai atins; terracotta doar peste 100% la limite (over=true) */
function barRow(n,v,t,u,over,big,mx,extra){const pc=t?v/t*100:null;if(pc==null)return`<div class="mic"><span class="mn2">${n}</span><span class="mbar"></span><span class="mv">${fmtN(v)} ${u}</span></div>`;
 const g=Math.min(pc,over?100:120)/1.2,o=over&&pc>100?(Math.min(pc,120)-100)/1.2:0,r=Math.round(pc);
 const rest=big?(t-v>=.5?`<span class="rest">mai ramane ${fmtN(t-v)} ${u}</span>`:over&&v-t>=.5?`<span class="rest">peste tinta cu ${fmtN(v-t)} ${u}</span>`:""):"";
 return`<div class="mic${big?" big":""}"><span class="mn2">${n}</span><span class="mbar" role="img" aria-label="${n}: ${r}% din ${mx?"limita":"necesar"}"><i class="f" style="width:${g.toFixed(1)}%"></i>${o?`<i class="ov" style="left:${(100/1.2).toFixed(1)}%;width:${o.toFixed(1)}%"></i>`:""}<span class="tk"></span></span><span class="mv"><b>${fmtN(v)}</b> / ${mx?"max ":""}${fmtN(t)} ${u} &middot; ${r}%${rest}</span></div>`}
function micRows(s,tg,grp){return MIC.filter(m=>m[4]===grp).map(m=>barRow(m[1],s[m[0]],tg?tg[m[0]]:null,m[2],m[3]==="x",false,m[3]==="x")).join("")}
function micPanel(s,cov,pr,note){const t=profT(pr),tg=micT(pr,t);
 return(tg?"":`<p class="muted" style="margin:6px 0">Fara profil nutritional completat se vad doar valorile. Completeaza Setari > Profil nutritional ca sa apara procentele din necesarul zilnic.</p>`)+
  micRows(s,tg,1)+`<details class="mmore"><summary class="muted">Restul nutrientilor</summary>${micRows(s,tg,0)}</details>`+
  `<p class="muted" style="margin:6px 0 0;font-size:.85rem">${note?note+" ":""}${cov}Valori din baza Info (USDA, alimente crude), fara pierderile de la gatit; sodiul nu include sarea adaugata. Referinta: EFSA, adulti. Orientare, nu sfat medical.</p>`}
const micCov=d=>d.ents?(d.used<d.ents?(d.ents-d.used)+" din "+d.ents+" retete fara ingrediente, neincluse. ":"")+(d.n?"Calculat din "+d.ok+" din "+d.n+" ingrediente. ":""):"";
function micBlock(dm,d){const t=dayMic(dm);if(!t.used)return"";const pr=getPr();
 return`<details class="mmic" data-mico="${d}"${MICO[d]?" open":""}><summary>Micronutrienti</summary>${micPanel(t.s,micCov(t),pr,"Cate 1 portie din fiecare reteta.")}</details>`}
let MICO={};
function micWeek(days,m){const pr=getPr(),acc=new Array(27).fill(0);let nd=0,n=0,ok=0,ents=0,used=0;
 days.forEach(d=>{const t=dayMic(m[d]||{});ents+=t.ents;used+=t.used;if(t.used){nd++;n+=t.n;ok+=t.ok;t.s.forEach((v,i)=>{acc[i]+=v})}});
 if(!nd)return"";return`<details class="mmic" data-mico="week"${MICO.week?" open":""}><summary>Micronutrienti, media pe zi (${nd} ${nd===1?"zi":"zile"} cu date)</summary>${micPanel(acc.map(v=>v/nd),micCov({ents,used,n,ok}),pr,"")}</details>`}
function micHead(r){const ings=rawIngs("b",r);if(!ings||!ings.length||r.pna)return"";const o=micOf(ings,r.portii||1);if(!o.ok)return"";
 const pr=getPr();return`<details class="mmic"><summary>Micronutrienti per portie</summary>${micPanel(o.s,"Calculat din "+o.ok+" din "+o.n+" ingrediente"+(r.portii==null?"; reteta fara numar de portii, valorile sunt pentru toata reteta":"")+". ",pr,"")}</details>`}
/* Setari > Profil nutritional */
function profDraw(){const el=$("#profbox");if(!el)return;const p=getPr(),t=profT(p),o=(a,v)=>a.map(x=>`<option value="${x[0]}"${String(x[0])===String(v)?" selected":""}>${esc(x[1])}</option>`).join("");
 const inp=(k,l,min,max,ph,u)=>`<div><label for="pr-${k}">${l}</label><input id="pr-${k}" data-pr="${k}" type="number" inputmode="decimal" min="${min}" max="${max}" step="any" value="${esc(p[k]==null?"":p[k])}"${ph?` placeholder="${esc(ph)}"`:""}${u?` aria-label="${esc(l)}"`:""}></div>`;
 let h=`<div class="fgrid"><div><label for="pr-s">Sex</label><select id="pr-s" data-pr="s"><option value="">Alege</option><option value="f"${p.s==="f"?" selected":""}>Femeie</option><option value="m"${p.s==="m"?" selected":""}>Barbat</option></select></div>${inp("a","Varsta (ani)",18,99)}${inp("w","Greutate (kg)",35,250)}${inp("h","Inaltime (cm)",130,220)}</div>
 <label for="pr-act">Nivel de activitate</label><select id="pr-act" data-pr="act"><option value="">Alege</option>${o(PR_ACT,p.act)}</select>
 <label for="pr-g">Etapa</label><select id="pr-g" data-pr="g">${o(PR_GOAL,p.g||"m")}</select>`;
 if(t.ok){h+=`<h3 style="margin:14px 0 4px">Tinte zilnice</h3><p class="muted" style="margin:0 0 8px">Standardul se calculeaza din profil. Poti scrie propriile valori; daca golesti un camp, revine la standard.</p>
  <div class="fgrid"><div><label for="pr-kc">Calorii (kcal)</label><input id="pr-kc" data-pr="kc" type="number" min="800" max="9000" step="10" value="${esc(p.kc==null?"":p.kc)}" placeholder="standard: ${t.kstd}"></div>
  <div><label for="pr-pk">Proteine (g pe kg)</label><input id="pr-pk" data-pr="pk" type="number" min="0.3" max="4" step="0.05" value="${esc(p.pk==null?"":p.pk)}" placeholder="standard: ${String(t.pkstd).replace(".",",")}"></div>
  <div><label for="pr-gp">Grasimi (% din calorii)</label><input id="pr-gp" data-pr="gp" type="number" min="10" max="60" step="1" value="${esc(p.gp==null?"":p.gp)}" placeholder="standard: 30"></div></div>
  <p style="margin:10px 0 0"><b>Tinta pe zi:</b> ${t.k} kcal, proteine ${t.p} g (${String(+t.pk.toFixed(2)).replace(".",",")} g/kg), grasimi ${t.f} g, carbohidrati ${t.c} g (restul), fibre 25 g.</p>`}
 else h+=`<p class="muted" style="margin:10px 0 0">Completeaza toate campurile ca sa apara tintele si procentele din necesar.</p>`;
 h+=`<p class="muted" style="margin:10px 0 0;font-size:.85rem">Valori de referinta EFSA pentru adulti sanatosi. Nu acopera sarcina, alaptarea sau boli care schimba necesarul. Energia se estimeaza cu formula Mifflin-St Jeor si nivelul de activitate; etapa o ajusteaza (crestere +10%, definire -15%). Proteinele standard: 0,83 g/kg (mentinere, minimul EFSA), 1,6 (crestere musculara), 2,0 (definire). Orientare, nu sfat medical.</p>`;
 el.innerHTML=h}
function dayMac(dm){const s=[0,0,0,0];let n=0,nd=0,nm=0,ne=0;SLOTS.forEach(([id])=>(dm[id]||[]).forEach(en=>{n++;const a=menMac(en);if(a){nd++;if(en.me&&!(en.s==="b"&&menRec(en)&&menRec(en).r.macro&&menRec(en).r.macro.kcal!=null))ne++;a.forEach((v,i)=>{if(v!=null)s[i]+=v})}else if(en.s!=="x")nm++}));return{n,nd,nm,ne,s:s.map(Math.round)}}
/* estimare macro cu AI pentru intrarile fara macro dintr-o zi; valorile se pastreaza in intrarea din meniu, marcate "estimat" */
async function menEst(day,btn){const m=getMen(),dm=m[day]||{},L=[];SLOTS.forEach(([id])=>(dm[id]||[]).forEach(en=>{if(en.s!=="x"&&!menMac(en)){const rec=menRec(en),ing=(en.i&&en.i.length?en.i:rec?rawIngs(en.s,rec.r):[]);if(ing.length)L.push({en,ing})}}));
 if(!L.length){toast("Nu am ingrediente pentru a estima macro.");return}
 const t=btn.textContent;btn.disabled=true;let ok=0,err="";
 for(let i=0;i<L.length&&i<12;i++){const{en,ing}=L[i],por=Math.max(1,en.bp||1);btn.textContent="Estimez "+(i+1)+"/"+Math.min(L.length,12)+"...";
  const sys='Esti nutritionist. Estimezi valorile nutritionale pentru o reteta. Raspunzi DOAR cu JSON valid, fara text in plus, fara diacritice.';
  const u=`Reteta: ${en.t}\nPortii: ${por}\nIngrediente (cantitatile sunt pentru toata reteta):\n${ing.map(ingLine).join("\n")}\n\nCalculeaza valorile PER PORTIE (total / ${por}), tinand cont de starea alimentului asa cum e scris. Daca un ingredient nu are cantitate, estimeaza una uzuala. Ignora apa, sarea si condimentele fara aport. Rotunjeste: kcal la intreg, restul la o zecimala.\nTrimite JSON: {"kcal":numar,"proteine":numar,"carbo":numar,"grasimi":numar}`;
  try{const j=await ask(($("#m2")&&$("#m2").value)||"claude-haiku-4-5",sys,u,300,0),n=k=>{const v=+j[k];return Number.isFinite(v)&&v>=0&&v<20000?Math.round(v*10)/10:null},a=[n("kcal"),n("proteine"),n("carbo"),n("grasimi")];
   if(a[0]==null)continue;en.m=a;en.me=1;ok++;putMen(m)}catch(e){err=e.message||"Eroare";break}}
 btn.disabled=false;btn.textContent=t;drawMenu();
 toast(err?(ok?"Estimate "+ok+"; apoi: ":"")+err:ok?"Macro estimat pentru "+ok+(ok===1?" reteta":" retete")+" (marcat \"estimat\").":"Nu am primit valori utilizabile.")}
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
 const q=qWords(MD.q),sv=getSaved(),f=MD.f||null,out=[];
 const wr=r=>r.sursa==="Retetele mele",fv=r=>isFav(bKey(r));
 const hit=x=>!q.length||(x.s==="s"?q.every(w=>norm(x.r.titlu+" "+(x.r.ingrediente||[]).map(y=>y.nume).join(" ")).includes(w)):bScore(x.r,q).h===q.length);
 const add=x=>{if(out.length<60&&hit(x))out.push(x)};
 if(!f){if(q.length){sv.forEach((r,i)=>add({s:"s",i,r}));BOOK.forEach((r,i)=>add({s:"b",i,r}))}}
 else if(f==="c"){sv.forEach((r,i)=>add({s:"s",i,r}));BOOK.forEach((r,i)=>{if(wr(r))add({s:"b",i,r})})}
 else if(f==="f"){BOOK.forEach((r,i)=>{if(fv(r))add({s:"b",i,r})})}
 else if(f==="b"&&MD.bk){BOOK.forEach((r,i)=>{if((r.sursa||"necunoscuta")===MD.bk)add({s:"b",i,r})})}
 const lab=x=>x.s==="s"?"Colectia mea (generata)":wr(x.r)?"Scrisa de tine":(fv(x.r)?"&#9733; Favorita - ":"Din ")+esc(x.r.sursa||"biblioteca");
 const chip=(k,t)=>`<button type="button" class="fchip${f===k?" on":""}" data-mdf="${k}" aria-pressed="${f===k}">${t}</button>`;
 const srcs=[...new Set(BOOK.map(r=>r.sursa||"necunoscuta"))].sort((x,y)=>x.localeCompare(y,"ro"));
 const bsel=f==="b"?`<select id="mdbk" aria-label="Alege cartea" style="margin:8px 0"><option value="">Alege cartea</option>${srcs.map(x=>`<option value="${esc(x)}"${x===MD.bk?" selected":""}>${esc(x)}</option>`).join("")}</select>`:"";
 const empty=f==="b"&&!MD.bk?"Alege o carte ca sa vezi retetele ei.":!f&&!q.length?"Scrie numele sau un ingredient, sau alege o sursa: Colectia mea, Favorite sau Biblioteca.":q.length?"Nu am gasit nimic. Incearca alt cuvant.":f==="f"?"Nu ai inca favorite din carti.":"Nu ai retete aici inca.";
 $("#mdres").innerHTML=`<div class="chips" style="margin:8px 0">${chip("c","Colectia mea")}${chip("f","&#9733; Favorite")}${chip("b","Biblioteca")}</div>${bsel}`+(out.length?out.map(x=>`<div class="me"><div class="mn"><div class="tx">${esc(x.r.titlu)}</div><div class="src">${lab(x)}</div></div><button class="go" data-mdpick="${x.s}:${x.i}" style="margin:0">Alege</button></div>`).join(""):`<p class="muted">${empty}</p>`)}
function menAdd(en){const m=getMen();(m[MD.day]=m[MD.day]||{})[MD.slot]=(m[MD.day][MD.slot]||[]).concat([en]);putMen(m);
 toast("Adaugat in meniu: "+dLab(MD.day)+", "+SLOTS.find(x=>x[0]===MD.slot)[1]+".");const d=MD.day;menClose();if(!$("#v-meniu").classList.contains("hidden")){MW=monOf(d);const t0=dKey(new Date());if(MV==="z"&&d!==t0&&d!==dAdd(t0,1))MV="s";drawMenu()}}
$("#mdlg").onclick=e=>{if(PRP){pxClick(e);return}const b=e.target,d=b.dataset;
 if(b===$("#mdlg")||d.mdx!==undefined){menClose();return}
 if(!MD)return;
 if(d.mdok!==undefined){const p=$("#mdp")?clampP($("#mdp").value):(MD.r.portii||1);menAdd(mkEntry(MD.s,MD.r,p));return}
 if(d.mdf!==undefined){MD.f=MD.f===d.mdf?null:d.mdf;mdSearch();return}
 if(d.mdpick!==undefined){const[s,i]=d.mdpick.split(":"),r=s==="s"?getSaved()[+i]:BOOK[+i];if(r)menAdd(mkEntry(s,r));return}
 if(d.mdtxt!==undefined){const t=($("#mdt").value||"").trim().slice(0,80);if(!t){$("#mdt").focus();return}menAdd({t,s:"x",k:"",p:0,L:0})}};
$("#mdlg").onchange=e=>{if(e.target.id==="mdbk"&&MD){MD.bk=e.target.value;mdSearch();return}if(PRP){if(e.target.dataset.pxs!==undefined)PRP.slots[e.target.dataset.pxs]=e.target.checked;return}if(!MD)return;if(e.target.id==="mdday")MD.day=e.target.value;if(e.target.id==="mdslot")MD.slot=e.target.value};
$("#mdlg").oninput=e=>{if(e.target.id==="mdq"){MD.q=e.target.value;mdSearch()}};
$("#mdlg").onkeydown=e=>{if(e.key==="Escape"){menClose();return}
 if(e.key==="Enter"&&MD){if(e.target.id==="mdt"){e.preventDefault();const b=document.querySelector("[data-mdtxt]");if(b)b.click()}if(e.target.id==="mdp"){e.preventDefault();const b=document.querySelector("[data-mdok]");if(b)b.click()}}};

let MW=monOf(dKey(new Date()));
let MDO={};let MV=LS("rmv")==="s"?"s":"z"; /* z = azi si maine (implicit), s = saptamana */
/* Setari > Biblioteca: masa atribuita fiecarei categorii (folosita de "Propune-mi un meniu") */
const PXL={mic:"Mic dejun",pranz:"Pranz",desert:"Desert","-":"Nu propune"};
function drawPxc(){const el=$("#pxl");if(!el)return;const c={};BOOK.forEach(r=>{if(r.nou||!r.categorie)return;c[r.categorie]=(c[r.categorie]||0)+1});const k=Object.keys(c).sort((a,b)=>a.localeCompare(b,"ro")),ov=getPxc();
 el.innerHTML=k.length?k.map(n=>{const a=pxAuto({categorie:n,titlu:""}),v=ov[n]||"";return`<div class="pxr"><b>${esc(n)} <span class="muted">${c[n]}</span></b><select data-pxc="${esc(n)}" aria-label="Masa pentru ${esc(n)}"><option value=""${v?"":" selected"}>Automat (${a?PXL[a]:PXL["-"]})</option>${Object.keys(PXL).map(s=>`<option value="${s}"${v===s?" selected":""}>${PXL[s]}</option>`).join("")}</select></div>`}).join(""):'<p class="muted">Nu ai categorii in biblioteca.</p>'}
$("#pxcard").onchange=e=>{const n=e.target.dataset.pxc;if(n===undefined)return;const o=Object.assign({},getPxc());if(e.target.value)o[n]=e.target.value;else delete o[n];LS("rpxc",JSON.stringify(o));drawPxc()};
/* ===== Propune-mi un meniu: motor local peste biblioteca; nimic nu intra in meniu fara confirmare ===== */
const PX_EXC=/\b(sos|sosuri|muraturi|conserv|marmelad|dulceat|retete casnice|glazur|sirop|bauturi|condiment|aluat|baza|gem|compot|lichior|cocktail|detox)/;
const PX_MIC=/\b(mic dejun|brunch|omleta|oua|smoothie|tartinabil|granola|terci|clatite|toast)/;
let _pxcv=null,_pxcm={};
function getPxc(){const v=LS("rpxc")||"";if(v!==_pxcv){_pxcv=v;let j={};try{j=JSON.parse(v||"{}")}catch(e){}_pxcm={};if(j&&typeof j==="object")Object.keys(j).forEach(k=>{if(["mic","pranz","desert","-"].includes(j[k]))_pxcm[k]=j[k]})}return _pxcm}
function pxSlot(r){const ov=r.categorie?getPxc()[r.categorie]:undefined;if(ov)return ov==="-"?null:ov;return pxAuto(r)}
function pxAuto(r){const t=norm((r.categorie||"")+" "+(r.titlu||""));if(PX_EXC.test(norm(r.categorie||"")))return null;
 if(DESERT.test(t)||/\b(desert|dulciur|crema|jeleu|fructe coapte)/.test(norm(r.categorie||"")))return"desert";
 if(PX_MIC.test(norm(r.categorie||""))||/\b(omleta|smoothie|granola|terci)/.test(norm(r.titlu||"")))return"mic";
 return"pranz"}
const pxIngs=(s,r)=>(s==="b"?(r.ingrediente||[]):(r.ingrediente||[])).filter(x=>(x.n||x.nume)).length;
function pxPool(){const out=[];
 BOOK.forEach((r,i)=>{if(r.nou||vx(r).length||!pxIngs("b",r))return;const sl=pxSlot(r);if(sl)out.push({s:"b",r,sl,key:bKey(r)})});
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
 const avg=av&&!zi?`<p class="muted" style="margin:10px 0 0">Media pe zi (${dd.length} ${dd.length===1?"zi":"zile"} cu date): ${av[0]} kcal, ${av[1]} g proteine, ${av[2]} g carbo, ${av[3]} g grasimi.</p>`+micWeek(days,m):"";
 const seg=`<div class="row mseg" style="gap:8px;margin-bottom:10px"><button class="alt${zi?" on":""}" data-mv="z" aria-pressed="${zi}">Azi si maine</button><button class="alt${zi?"":" on"}" data-mv="s" aria-pressed="${!zi}">Saptamana</button></div>`;
 const hint=cnt?(profT().ok?"":`<p class="muted" style="margin:10px 0 0">Pentru tinte si procente din necesar, completeaza Setari > Profil nutritional.</p>`):`<p class="muted" style="margin:10px 0 0">Meniul e gol. Adaugi retete cu "+ Adauga" sau cu "Adauga la meniu" din orice reteta (biblioteca, salvate, generate).</p>`;
 const act=`<div class="row mact" style="gap:8px;margin-top:10px"><button class="go" data-mshop="${zi?"z":"w"}" style="margin:0">${zi?"Cumparaturi azi si maine":"Cumparaturi saptamana"}</button><details class="mre lmore mtg"${MTO?" open":""}><summary>Mai multe</summary><div class="lact2"><button class="alt" data-mprop="1">Propune-mi un meniu</button>${zi?"":`<button class="alt" data-mclr="1">Goleste saptamana</button>`}</div></details></div>`;
 const head=zi?`<div class="card">${seg}${act}${hint}</div>`
 :`<div class="card">${seg}<div class="mh"><button class="alt" data-mw="-1" aria-label="Saptamana trecuta">&lt;</button><button class="alt" data-mw="0" style="flex:1;min-width:140px" title="Mergi la saptamana asta">${a.getDate()} ${LUNI[a.getMonth()]} - ${z.getDate()} ${LUNI[z.getMonth()]} ${z.getFullYear()}</button><button class="alt" data-mw="1" aria-label="Saptamana urmatoare">&gt;</button></div>${act}${avg}${hint}</div>`;
 function macBlock(dm,d){const t=dayMac(dm);if(!t.nd&&!t.nm)return"";
  const eb=t.nm?`<button class="alt" data-mest="d" data-day="${d}" style="margin:8px 0 0">Estimeaza macro cu AI (${t.nm})</button>`:"";
  if(!t.nd)return`<div class="mmac muted">Fara macro pentru ${t.nm} ${t.nm===1?"reteta":"retete"}.${eb?"<br>":""}${eb}</div>`;
  const pt=profT(),T=[mt.k||0,mt.p||0,pt.ok?pt.c:0,pt.ok?pt.f:0],U=["kcal","g","g","g"],N=["Calorii","Proteine","Carbohidrati","Grasimi"],OV=[1,0,1,1];
  const note=`<div class="muted">cate 1 portie din fiecare reteta${t.ne?"; "+t.ne+" estimat"+(t.ne===1?"a":"e")+" cu AI":""}${t.nm?"; "+t.nm+" fara macro":""}</div>`;
  if(!T.some(x=>x))return`<div class="mmac"><b>Total aprox.:</b> ${t.s[0]} kcal - ${t.s[1]} g proteine - ${t.s[2]} g carbo - ${t.s[3]} g grasimi${note}${eb}</div>`;
  return`<div class="mmac"><b>Macro, total aprox.</b>${[0,1,2,3].map(i=>T[i]?barRow(N[i],t.s[i],T[i],U[i],!!OV[i],true,false):`<div class="mic big"><span class="mn2">${N[i]}</span><span class="mbar"></span><span class="mv"><b>${t.s[i]}</b> ${U[i]}</span></div>`).join("")}${note}${eb}</div>`}
 const isOpen=d=>MDO[d]!==undefined?MDO[d]:(d===today||(!days.includes(today)&&d===days[0]));
 const rows=days.map(d=>{const dm=m[d]||{},op=isOpen(d),has=SLOTS.some(([s])=>(dm[s]||[]).length);
  return`<div class="card mday${d===today?" today":""}"><div class="mh"><h2 class="mhh"><button class="mtog" data-mtog="1" data-day="${d}" aria-expanded="${op}"><span class="chev">${op?"&#9662;":"&#9656;"}</span> ${esc(dLab(d))}${d===today?` <span class="lb">azi</span>`:d===tom?` <span class="lb">maine</span>`:""}</button></h2>${has?`<button class="alt ib" data-mshop="d" data-day="${d}" aria-label="Cumparaturi pentru ziua asta" title="Cumparaturi pentru ziua asta">${CART}</button>`:""}</div>`+
  SLOTS.filter(([id])=>op||(dm[id]||[]).length).map(([id,lab])=>`<div class="ms"><div class="mt">${lab}</div>${(dm[id]||[]).map((en,ix)=>{const rec=menRec(en),ref=`data-day="${d}" data-slot="${id}" data-ix="${ix}"`;
   return`<div class="me"><div class="mn"><span class="tx">${esc(en.t)}</span>${en.L?` <button class="lb lbb" data-mlx="1" ${ref} title="Scoate din cumparaturi" aria-label="In lista; apasa ca sa scoti din cumparaturi">in lista &times;</button>`:""}${en.s!=="x"&&!rec?`<div class="warn">Reteta nu mai e in aplicatie; folosesc ingredientele salvate in meniu.</div>`:""}${(()=>{const a=menMac(en);return a?`<div class="muted">~${Math.round(a[0])} kcal${a[1]!=null?", "+Math.round(a[1])+" g proteine":""} (1 portie${en.me?", estimat":""})</div>`:""})()}${(()=>{const dd=rec&&en.s==="b"?macDiff(rec.r):null;return dd?`<div class="warn" style="margin:4px 0">Macro din carte (${dd.carte} kcal) difera mult de calculul din Info (${dd.calc} kcal per portie). Verifica portiile in reteta. <button class="alt" data-mok="1" ${ref} style="margin:4px 0 0">E in regula</button></div>`:""})()}</div>${en.s!=="x"&&!(rec&&en.s==="b"&&rec.r.portii==null)?`<input class="mpi" type="number" min="1" max="99" value="${esc(clampP(en.p||en.bp))}" ${ref} data-mp="1" aria-label="Portii pentru ${esc(en.t)}" title="Portii">`:""}${en.s!=="x"&&d<=today?((getNote(en.k).h||[]).includes(d)?` <span class="lb">gatit</span>`:`<button class="alt" data-mgat="1" ${ref}>Am gatit</button>`):""}${rec?`<button class="alt" data-mopen="1" ${ref}>Deschide</button>`:""}<button class="alt" data-mdel="1" ${ref} aria-label="Scoate ${esc(en.t)} din meniu">Scoate</button></div>`}).join("")}${op?`<button class="alt" data-madd="${id}" data-day="${d}">+ Adauga</button>`:""}</div>`).join("")+macBlock(dm,d)+micBlock(dm,d)+`</div>`}).join("");
 $("#mw").innerHTML=head+rows}
$("#mw").addEventListener("toggle",e=>{const k=e.target.dataset&&e.target.dataset.mico;if(k)MICO[k]=e.target.open},true);
/* cumparaturi din meniu: intrarile deja adaugate nu se repeta decat daca confirmi */
function menShop(btn,ds,label){
 const m=getMen(),ents=[];ds.forEach(d=>SLOTS.forEach(([s])=>((m[d]||{})[s]||[]).forEach(en=>{if(en.s!=="x")ents.push({d,en})})));
 if(!ents.length){toast("Nu ai retete in meniu pentru "+label+".");return}
 let use=ents.filter(x=>!x.en.L);
 if(!use.length){if(btn.dataset.arm!=="1"){const t=btn.textContent;btn.dataset.arm="1";btn.textContent="Sunt deja in lista. Adaug din nou?";setTimeout(()=>{if(btn.isConnected){btn.dataset.arm="";btn.textContent=t}},4000);return}use=ents}
 let n=0,sk=0;use.forEach(({d,en})=>{const ing=menIngs(en);if(!ing.length){sk++;return}n+=addList(ing,en.t+" (meniu "+ZILE[dFrom(d).getDay()].toLowerCase()+")");en.L=1});
 putMen(m);drawMenu();
 LBN={label,n,r:use.length-sk,sk,old:ents.length-use.length};show("lista");window.scrollTo(0,0)}
$("#v-meniu").onclick=e=>{const b=e.target.closest("button")||e.target,d=b.dataset;
 if(d.mest!==undefined){menEst(d.day,b);return}
 if(d.mtog!==undefined){const m=getMen(),dm=m[d.day]||{},cur=MDO[d.day]!==undefined?MDO[d.day]:b.getAttribute("aria-expanded")==="true";MDO[d.day]=!cur;drawMenu();return}
 if(d.mv!==undefined){MV=d.mv==="s"?"s":"z";LS("rmv",MV);drawMenu();return}
 if(d.mshop==="z"){menShop(b,[dKey(new Date()),dAdd(dKey(new Date()),1)],"azi si maine");return}
 if(d.mw!==undefined){MW=d.mw==="0"?monOf(dKey(new Date())):dAdd(MW,7*+d.mw);drawMenu();return}
 if(d.madd!==undefined){menOpen({day:d.day,slot:d.madd});return}
 if(d.mshop==="w"){menShop(b,[...Array(7)].map((_,i)=>dAdd(MW,i)),"saptamana asta");return}
 if(d.mshop==="d"){menShop(b,[d.day],dLab(d.day));return}
 if(d.mprop!==undefined){MTO=false;if(MV==="z"){MW=monOf(dKey(new Date()))}pxOpen();$("#mdlg").classList.remove("hidden");setTimeout(()=>{const e=$("[data-pxgo]");if(e)e.focus()},0);return}
 if(d.mclr!==undefined){MTO=false;const u=undoMark(["rmen"]),m=getMen();[...Array(7)].forEach((_,i)=>delete m[dAdd(MW,i)]);putMen(m);drawMenu();undoShow("Saptamana a fost golita.",u,redrawAll);return}
 if(d.mlx!==undefined){const en=((getMen()[d.day]||{})[d.slot]||[])[+d.ix];if(en){const t=en.t+" (meniu "+ZILE[dFrom(d.day).getDay()].toLowerCase()+")",u=undoMark(["rl","rmen"]),r=removeSrc(t);drawMenu();undoShow(srcMsg(t,r),u,redrawAll)}return}
 if(d.mdel!==undefined){const u=undoMark(["rmen"]),m=getMen(),a=(m[d.day]||{})[d.slot];if(a){const t=(a[+d.ix]||{}).t;a.splice(+d.ix,1);putMen(m);drawMenu();undoShow("Scos din meniu: "+t+".",u,redrawAll)}return}
 if(d.mgat!==undefined){const a=(getMen()[d.day]||{})[d.slot],en=a&&a[+d.ix];if(en&&en.k){setNote(en.k,{h:(getNote(en.k).h||[]).concat([d.day])});drawMenu();toast("Marcat ca gatit: "+en.t+" ("+fmtDay(d.day)+").")}return}
 if(d.mok!==undefined){const a=(getMen()[d.day]||{})[d.slot],en=a&&a[+d.ix],rec=en&&menRec(en);if(rec&&en.s==="b"){rec.r.mok=true;if(persistBook(rec.r)){drawMenu();toast("Avertizare ascunsa pentru aceasta reteta.")}}return}
 if(d.mopen!==undefined){const a=(getMen()[d.day]||{})[d.slot],en=a&&a[+d.ix],rec=en&&menRec(en);if(!rec)return;
  if(en.s==="b"){show("carti");drawBook();openBook(rec.i,rec.r.portii,"#bres")}else{SV=en.k;show("salvate")}
  window.scrollTo(0,0)}};
$("#v-meniu").addEventListener("toggle",e=>{if(e.target.classList&&e.target.classList.contains("mtg"))MTO=e.target.open},true);
$("#v-meniu").onchange=e=>{const d=e.target.dataset;
 
 if(d.mp!==undefined){const m=getMen(),a=(m[d.day]||{})[d.slot],en=a&&a[+d.ix];if(!en)return;en.p=clampP(e.target.value);en.L=0;putMen(m);drawMenu()}};
const APP_V="3.2.3";
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
 try{if(navigator.storage&&navigator.storage.estimate){const s=await navigator.storage.estimate();const mb=v=>v>=1048576*1024?Math.round(v/1073741824)+" GB":(v/1048576).toFixed(1)+" MB";if(s&&s.usage!=null)txt=" Folosit: "+mb(s.usage)+(s.quota?" din ~"+mb(s.quota)+" disponibili pe dispozitiv":"")+"."}}catch(e){}
 const lsk=(()=>{let n=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);n+=k.length+(localStorage.getItem(k)||"").length}}catch(e){}return n})();
 const bk=STORED.length?JSON.stringify(STORED).length*1:0;
 el.innerHTML="<details><summary><b>Stocare si instalare</b></summary>"+(per===true?"protejata (browserul nu o sterge singur)":per===false?"nu e protejata (browserul o poate sterge cand ramane fara spatiu; descarca backup des)":"necunoscuta pe acest browser")+"."+txt+" Setari, liste, meniu: "+(lsk*2/1048576).toFixed(1)+" MB din ~5 MB disponibili (localStorage)."+(IDBOK?" Biblioteca ("+STORED.length+" retete, ~"+(bk/1048576).toFixed(1)+" MB) e in baza de date a browserului, fara limita de 5 MB.":"")
  +(INST?` <button class="alt" id="pwaI" type="button">Instaleaza aplicatia</button>`:` <span class="muted">${instHint()}</span>`)+`</details>`}
/* indicatie de instalare potrivita dispozitivului (un singur text, nu toate) */
function instHint(){const ua=navigator.userAgent||"",ios=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1),
 sa=(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true;
 if(sa)return"Aplicatia e instalata.";
 if(ios)return'Pe iPhone sau iPad: Partajeaza, apoi "Adauga pe ecranul principal".';
 if(/Android/.test(ua))return'Pe Android: deschide meniul browserului (trei puncte), apoi "Adauga pe ecranul principal" (in engleza "Add to Home screen") sau "Instaleaza aplicatia".';
 return"Pe laptop: in Chrome sau Edge, apasa pictograma de instalare din bara de adrese, daca apare."}
$("#pst").onclick=e=>{if(e.target.id==="pwaI"&&INST){INST.prompt();INST.userChoice.finally(()=>{INST=null;updPst()})}};
persistStore();

$("#appv").textContent="Cartea mea de retete - versiunea "+APP_V;
$("#bkcard h2").insertAdjacentHTML("afterend",'<div id="bkwarn" class="warn" style="margin:0 0 8px"></div>');
/* Setari -> Alimente: in ce categorie intra fiecare aliment (folosita in Debara) */
function drawCatCfg(){const l=loadCats();
 $("#cgl").innerHTML=l.map(c=>`<div class="fd"><input data-cgn="${esc(c.id)}" value="${esc(c.n)}" maxlength="30" aria-label="Nume categorie" style="flex:1 1 140px;min-height:40px"${c.id==="altele"?" readonly":""}>${c.id==="altele"?`<span class="muted fa" style="flex:1 1 170px;text-align:left">categoria generala, ramane mereu</span>`:`<label class="cgf" style="margin:0;font-weight:400"><input type="checkbox" data-cgf="${esc(c.id)}" ${c.f?"checked":""} style="width:auto;min-height:0"> cu marcaje</label><button class="alt" data-cgd="${esc(c.id)}">Sterge</button>`}</div>`).join("");
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
$("#pCats").onclick=()=>{show("setari");setSub("alimente");$("#cdet").open=true;window.scrollTo(0,0)};
/* Setari: pagina de pornire cu lista si stari; Utilizare in fata, Tehnic pliat (2.24.1) */
const SUBS=["profil","aparate","pref","alimente","etichete","mese","cont","carti","backup","despre"];
const SGMAP={profil:["profil"],aparate:["aparate"],pref:["pref"],alimente:["alimente"],etichete:["etichete"],mese:["mese"],cont:["cont"],carti:["biblioteca"],backup:["bkfile","bksnap","bkdb"],despre:["despre"]};
const STITLE={profil:"Profil nutritional",aparate:"Aparate",pref:"Preferinte alimente",alimente:"Categorii alimente",etichete:"Etichete retete",mese:"Mese",cont:"AI si cheie",carti:"Carti",backup:"Backup",despre:"Despre"};
const SUBOF={biblioteca:"carti",date:"carti",tehnic:"cont"},TABOF=e=>SUBOF[e]||e,WIDE=window.matchMedia("(min-width:900px)");
let SUB=null;
const sEff=()=>SUB||(WIDE.matches?"aparate":null);
function setSub(s){s=TABOF(s);SUB=SUBS.includes(s)?s:null;sRender()}
function setHome(){SUB=null;sRender()}
function sAttn(){const a=[];if(!LS("rk"))a.push("cheie lipsa");if(bkDue())a.push(bkAge()===null?"niciun backup":"backup vechi");return a}
function sStat(id){try{
 if(id==="profil"){const t=profT();return t.ok?t.k+" kcal \u00b7 proteine "+t.p+" g":"necompletat"}
 if(id==="aparate"){const on=AP.filter(a=>a.on).length,bk=AP.filter(a=>a.backup).length;return on+" active"+(bk?" \u00b7 "+bk+" backup":"")}
 if(id==="pref"){const p=getPf();return p.l.length+" imi plac \u00b7 "+p.e.length+" evit"}
 if(id==="alimente"){const n=getCats().length;return n?n+(n===1?" aliment cu categorie aleasa":" alimente cu categorie aleasa"):"categorii automate"}
 if(id==="etichete")return TAGS.length+" etichete";
 if(id==="mese"){const n=Object.keys(getPxc()).length;return n?n+(n===1?" categorie cu masa aleasa":" categorii cu masa aleasa"):"mese automate"}
 if(id==="cont")return (LS("rk")?"Cheie setata":"Cheie lipsa")+" \u00b7 "+((LS("rm1")||"claude-haiku-4-5").replace("claude-",""));
 if(id==="carti"){const n=(()=>{try{return STORED.length}catch(e){return 0}})();return n?n+" retete in biblioteca":"nicio carte incarcata"}
 if(id==="backup"){const f=t=>new Date(t).toLocaleDateString("ro-RO",{day:"numeric",month:"short"});if(dbOn())return +LS("rdbl")?"sincronizat cu Dropbox: "+f(+LS("rdbl")):"Dropbox conectat";const t=+LS("rbk")||0;return t?"ultimul backup: "+f(t):"niciun backup"}
 if(id==="despre")return "Versiunea "+APP_V}catch(e){}return""}
function sRow(id,e){const w=id==="cont"&&!LS("rk")||id==="backup"&&bkDue();return`<button type="button" class="srow${e===id?" on":""}" data-s="${id}"><span class="srt"><b>${STITLE[id]}</b><span class="srs${w?" warn2":""}">${esc(sStat(id))}</span></span><span class="chev" aria-hidden="true">&rsaquo;</span></button>`}
let TOPEN=false; /* 2.24.1: Tehnic ramane deschis daca l-ai deschis tu, chiar daca lista se redeseneaza */
function renderSnav(e){const at=sAttn(),tech=["cont","carti","backup","despre"],inT=tech.includes(e);
 $("#snav").innerHTML=`<div class="shd"><h2 class="stt">Utilizare</h2><p class="muted" style="margin:2px 0 0">Cum gatesti si cum planifici</p></div><div class="sgrp">${["profil","aparate","pref","alimente","etichete","mese"].map(i=>sRow(i,e)).join("")}</div>
 <details class="adv"${inT||TOPEN?" open":""}><summary><span class="chev" aria-hidden="true">&rsaquo;</span><span style="flex:1">Tehnic: cheie AI, carti, backup, despre</span><span class="${at.length?"warn2":"okk"}">${at.length?"&bull; "+esc(at.join(", ")):"in ordine"}</span></summary><div class="sgrp">${tech.map(i=>sRow(i,e)).join("")}</div></details>`}
function sRender(){const e=sEff();$("#v-setari").classList.toggle("sm-det",!!SUB);renderSnav(e);
 document.querySelectorAll("#v-setari [data-sg]").forEach(c=>c.classList.toggle("hidden",!(e&&SGMAP[e].includes(c.dataset.sg))));
 $("#sbt").textContent=e?STITLE[e]:"";document.querySelectorAll("#sdet .card h2").forEach(x=>x.classList.remove("dup"));if(SUB){const cs=document.querySelectorAll("#sdet .card[data-sg]:not(.hidden)"),x=cs.length===1&&cs[0].querySelector(":scope>h2");if(x)x.classList.add("dup")}
 if(e==="alimente")drawFoods();if(e==="despre")loadChg()}
let CHG=null;
function loadChg(){$("#abv").textContent="Cartea mea de retete, versiunea "+APP_V+".";const el=$("#chg");if(CHG!==null){el.textContent=CHG;return}el.textContent="Se incarca...";
 fetch("CHANGELOG.md").then(r=>r.ok?r.text():Promise.reject()).then(t=>{CHG=t.slice(0,60000);el.textContent=CHG}).catch(()=>{CHG=null;el.textContent="Istoricul complet e in fisierul CHANGELOG.md din pachet (aici nu se poate citi cand deschizi aplicatia ca fisier unic)."})}
$("#snav").addEventListener("toggle",e=>{if(e.target.matches&&e.target.matches("details.adv"))TOPEN=e.target.open},true);
$("#snav").onclick=e=>{const b=e.target.closest("[data-s]");if(b){SUB=TABOF(b.dataset.s);sRender();window.scrollTo(0,0)}};
$("#sdet").addEventListener("change",()=>renderSnav(sEff()));$("#sdet").addEventListener("click",()=>setTimeout(()=>renderSnav(sEff()),80));
$("#sbk").onclick=()=>{setHome();window.scrollTo(0,0)};
WIDE.addEventListener&&WIDE.addEventListener("change",sRender);
document.addEventListener("click",e=>{const g=e.target.closest("[data-gosub]");if(g){show("setari");setSub(g.dataset.gosub);setTimeout(()=>{if(g.dataset.gosub==="cont"&&$("#key"))$("#key").focus()},0)}});
/* semn pentru copia de siguranta veche (peste 14 zile) */
const DOT='<span class="dot" title="Backup-ul e vechi"></span>';
function bkAge(){const t=Math.max(+LS("rbk")||0,+LS("rdbl")||0);return t?Math.floor((Date.now()-t)/864e5):null}
function bkDue(){let has=false;try{has=getSaved().length>0||getStored().length>0}catch(e){}if(!has)return false;const g=bkAge();return g===null||g>14}
function bkBadge(){const d=bkDue(),g=bkAge();
 document.querySelector("#nav [data-v=setari]").innerHTML="Setari"+(d?DOT:"");document.querySelector("#gnav [data-g=set]").innerHTML="Setari"+(d?DOT:"");
 if(typeof sRender==="function")sRender();
 $("#bkwarn").textContent=d?(g===null?"":"Ultimul backup are "+g+" de zile. Descarca unul nou."):""}
bkBadge();
$("#bCancel").onclick=()=>{if(ABORT)ABORT.abort()};
/* copie de siguranta */
const BK_KEYS=["rs","rfav","rtags","ra","rbook","rm1","rm2b","rl","rp","rcat","rcg","rmen","rmt","rnote","rpf","rpxc","rfd","rprof"];
let IMP=null;
function bkLast(){const t=LS("rbk");return t?"Ultimul backup descarcat: "+new Date(+t).toLocaleString("ro-RO")+".":"Nu ai descarcat niciun backup inca."}
function bkInfo(d){const n=k=>{try{const j=JSON.parse(d[k]);return Array.isArray(j)?j.length:(j&&typeof j==="object"?Object.keys(j).length:0)}catch(e){return 0}};return{meniu:n("rmen"),salvate:n("rs"),favorite:n("rfav"),etichete:n("rtags"),aparate:n("ra"),biblioteca:n("rbook"),lista:n("rl"),debara:n("rp")}}
$("#bkm").textContent=bkLast();
function bkBuild(){const d={};BK_KEYS.forEach(k=>{const v=k==="rbook"?(STORED.length?JSON.stringify(STORED):null):LS(k);if(v!=null)d[k]=v});d.rtags=JSON.stringify(TAGS);d.ra=JSON.stringify(AP);
 const o={app:"retete-dana",format:1,data_export:new Date().toISOString(),date:d};
 return{json:JSON.stringify(o),name:"retete-backup-"+new Date().toISOString().slice(0,10)+".json",info:bkInfo(d)}}
const bkMsg=(i,pre)=>pre+i.salvate+" retete salvate, "+i.favorite+" favorite, "+i.biblioteca+" retete in biblioteca, "+i.debara+" produse in debara, "+i.meniu+" zile in meniu. ";
$("#bExp").onclick=()=>{const f=bkBuild();
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([f.json],{type:"application/json"}));
 a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
 LS("rbk",String(Date.now()));bkBadge();$("#bkm").textContent=bkMsg(f.info,"Descarcat: ")+bkLast()};
/* trimite copia prin partajarea telefonului (Drive, WhatsApp, e-mail...), unde browserul permite fisiere */
$("#bShare").onclick=async()=>{const f=bkBuild(),file=new File([f.json],f.name,{type:"application/json"});
 try{await navigator.share({files:[file],title:"Backup Cartea mea de retete"});LS("rbk",String(Date.now()));bkBadge();$("#bkm").textContent=bkMsg(f.info,"Trimis: ")+bkLast()}
 catch(e){if(e&&e.name==="AbortError")return;$("#bkm").textContent="Nu am putut deschide partajarea. Foloseste \"Descarca backup\"."}};
(()=>{try{const t=new File(["{}"],"a.json",{type:"application/json"});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[t]}))$("#bShare").hidden=false}catch(e){}})();
function impDraw(){const el=$("#bipv");if(!IMP){el.innerHTML="";return}const i=bkInfo(IMP.date);
 el.innerHTML=`<div class="card" style="margin:8px 0 0"><b>${esc(IMP.f.name)}</b><div class="muted" style="margin:6px 0 10px">Backup din ${esc((IMP.data_export||"").slice(0,10))}: ${i.salvate} retete salvate, ${i.favorite} favorite, ${i.etichete} etichete, ${i.aparate} aparate, ${i.biblioteca} retete in biblioteca, ${i.debara} produse in debara, ${i.meniu} zile in meniu.<br><b>Inlocuieste</b> tot ce ai acum in aplicatie pentru aceste date (cheia API ramane).</div><button class="go" data-ip="ok" style="margin:0">Restaureaza</button> <button class="alt" data-ip="no">Anuleaza</button></div>`}
function bkParse(txt,name){const j=JSON.parse(txt);if(j.app!=="retete-dana"||!j.date||typeof j.date!=="object")throw 0;
 for(const k of Object.keys(j.date)){if(!BK_KEYS.includes(k)||typeof j.date[k]!=="string")throw 0;if(!["rm1","rm2b"].includes(k))JSON.parse(j.date[k])}
 return{date:j.date,data_export:j.data_export,f:{name}}}
$("#bimp").onchange=async e=>{const f=e.target.files[0];IMP=null;$("#bkm").textContent=bkLast();if(!f){impDraw();return}
 try{IMP=bkParse(await f.text(),f.name);impDraw()}
 catch(x){impDraw();$("#bkm").textContent="Fisierul nu e un backup valid al acestei aplicatii."}};
$("#bipv").onclick=async e=>{const d=e.target.dataset.ip;if(!d)return;
 if(d==="no"){IMP=null;$("#bimp").value="";impDraw();$("#bkm").textContent="Restaurare anulata.";return}
 const KL=BK_KEYS.filter(k=>k!=="rbook"),bak={},prev=STORED,date=IMP.date;KL.forEach(k=>{bak[k]=localStorage.getItem(k)});
 const back=()=>{try{KL.forEach(k=>{if(bak[k]!=null)localStorage.setItem(k,bak[k]);else localStorage.removeItem(k)})}catch(y){}};
 let lib=[];try{const j=date.rbook!=null?JSON.parse(date.rbook):[];lib=Array.isArray(j)?j:[]}catch(x){lib=[]}
 $("#bkm").textContent="Restaurez...";await snapMake(true);
 /* biblioteca intai (cea mai mare); daca ceva esueaza, ramane tot ce era inainte */
 if(!(await saveStored(lib))){await saveStored(prev);$("#bkm").textContent="Nu am putut salva biblioteca din backup. Am pastrat datele de dinainte, neschimbate.";return}
 try{KL.forEach(k=>{if(date[k]!=null)localStorage.setItem(k,date[k]);else localStorage.removeItem(k)})}
 catch(x){back();await saveStored(prev);
  $("#bkm").textContent="Nu am putut scrie in browser (spatiu insuficient). Am pastrat datele de dinainte, neschimbate.";return}
 $("#bkm").textContent="Restaurat. Reincarc aplicatia...";setTimeout(()=>location.reload(),600)};

/* ===== 2.34.0: copii automate in browser + backup in Dropbox ===== */
/* Copii in browser: ultimele SNAPN, cel mult una la 20 de ore, in IndexedDB (cheile snap:...). Dropbox: folderul aplicatiei, autentificare PKCE (fara secret in cod);
   rdbk = app key (o scrii tu in Setari), rdbt = refresh token, rdbl = ultimul backup, rdba = "0" daca ai oprit copia zilnica. Niciuna nu intra in backup. */
const SNAPN=3,DBN=10,AUTOH=20*36e5;
const idbKeys=()=>new Promise((res,rej)=>{const r=DB.transaction("kv").objectStore("kv").getAllKeys();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const idbDel=k=>new Promise((res,rej)=>{const t=DB.transaction("kv","readwrite");t.objectStore("kv").delete(k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)});
const hasData=()=>{try{return getSaved().length>0||getStored().length>0}catch(e){return false}};
async function snapList(){if(!(IDBOK&&DB))return[];try{return(await idbKeys()).filter(k=>String(k).startsWith("snap:")).sort().reverse()}catch(e){return[]}}
async function snapMake(force){if(!(IDBOK&&DB)||!hasData())return false;
 try{const L=await snapList();if(!force&&L.length&&Date.now()-Date.parse(L[0].slice(5))<AUTOH)return false;
  await idbPut("snap:"+new Date().toISOString(),bkBuild().json);for(const k of(await snapList()).slice(SNAPN))await idbDel(k);return true}catch(e){return false}}
const fmtDT=t=>{const d=new Date(t);return isNaN(d)?String(t):d.toLocaleString("ro-RO",{dateStyle:"short",timeStyle:"short"})};
const b64u=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const DBK=()=>(LS("rdbk")||"").trim()||DEFK,dbRedirect=()=>location.origin+location.pathname,dbOn=()=>!!LS("rdbt");
async function dbConnect(){const v=b64u(crypto.getRandomValues(new Uint8Array(32))),ch=b64u(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v)));
 sessionStorage.setItem("rdbv",v);
 location.href="https://www.dropbox.com/oauth2/authorize?"+new URLSearchParams({client_id:DBK(),response_type:"code",code_challenge:ch,code_challenge_method:"S256",token_access_type:"offline",redirect_uri:dbRedirect()})}
async function dbToken(body){const r=await fetch("https://api.dropboxapi.com/oauth2/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(body)});
 const j=await r.json().catch(()=>({}));if(!r.ok){if(j.error==="invalid_grant"&&body.grant_type==="refresh_token")try{localStorage.removeItem("rdbt")}catch(e){}
  throw new Error(j.error==="invalid_grant"?"Conectarea Dropbox a expirat. Conecteaza din nou.":(j.error_description||j.error||"Eroare Dropbox"))}return j}
let DBAT=null,DBAX=0;
async function dbAccess(){if(DBAT&&Date.now()<DBAX-60000)return DBAT;const rt=LS("rdbt");if(!rt)throw new Error("Dropbox nu e conectat.");
 const j=await dbToken({grant_type:"refresh_token",refresh_token:rt,client_id:DBK()});DBAT=j.access_token;DBAX=Date.now()+(j.expires_in||14400)*1000;return DBAT}
async function dbApi(url,arg,body,content){const t=await dbAccess(),h={Authorization:"Bearer "+t};
 if(content){h["Dropbox-API-Arg"]=JSON.stringify(arg);if(body!=null)h["Content-Type"]="application/octet-stream"}else h["Content-Type"]="application/json";
 const r=await fetch(url,{method:"POST",headers:h,body:content?body:JSON.stringify(arg)});
 if(!r.ok){let m="Eroare Dropbox ("+r.status+")";try{const j=await r.json();if(j.error_summary)m+=": "+j.error_summary}catch(e){}throw new Error(m)}return r}
async function snDraw(){const el=$("#snbox");if(!el)return;const L=await snapList();
 el.innerHTML=`<p class="muted" style="margin:0 0 8px">Aplicatia isi face singura o copie (cel mult una la 20 de ore) si le pastreaza pe ultimele ${SNAPN}. Te ajuta daca stergi sau strici ceva; nu te ajuta daca stergi datele browserului.</p>`+
  (IDBOK&&DB?(L.length?L.map(k=>`<div class="apr"><span>${esc(fmtDT(k.slice(5)))}</span><button class="alt" type="button" data-snr="${esc(k)}">Restaureaza</button></div>`).join(""):'<p class="muted">Inca nu exista nicio copie.</p>')+`<button class="alt" type="button" data-snmk="1" style="margin-top:8px">Fa o copie acum</button>`:'<p class="muted">Browserul nu permite baza de date locala, deci copiile automate nu sunt disponibile.</p>')}
/* ===== 3.0.0: sincronizare prin Dropbox =====
   Un singur fisier /sync.json in folderul aplicatiei. La fiecare sincronizare se combina in 3 pasi: ce era la ultima sincronizare (baza, in IndexedDB),
   ce ai acum aici, ce e acum in Dropbox. Ce s-a schimbat doar pe o parte se preia; ce s-a schimbat pe ambele parti, pe elemente diferite, se pastreaza amandoua;
   pe acelasi element castiga varianta de aici. Modificarea bate stergerea. Cheia AI si cheile Dropbox nu se sincronizeaza. */
const SY_RAW=["rm1","rm2b"],SY_MIN=60000;
const SY_LAB={rbook:"biblioteca",rs:"retete salvate",rfav:"favorite",rtags:"etichete",ra:"aparate",rm1:"setari AI",rm2b:"setari AI",rl:"lista de cumparaturi",rp:"debara",rcat:"debara",rcg:"debara",rmen:"meniu",rmt:"meniu",rnote:"notite",rpf:"preferinte alimente",rpxc:"meniu",rfd:"alimente proprii",rprof:"profil nutritional"};
function syLocal(){const o={};BK_KEYS.forEach(k=>{if(k==="rbook"){o.rbook=cl(STORED);return}
 const v=LS(k);if(v==null)return;if(SY_RAW.includes(k)){o[k]=v;return}try{o[k]=JSON.parse(v)}catch(e){}});return o}
function syEq(a,b){if(a===b)return true;if(typeof a!=="object"||typeof b!=="object"||!a||!b)return false;
 if(Array.isArray(a)!==Array.isArray(b))return false;
 if(Array.isArray(a)){if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(!syEq(a[i],b[i]))return false;return true}
 const ka=Object.keys(a),kb=Object.keys(b);if(ka.length!==kb.length)return false;for(const k of ka)if(!(k in b)||!syEq(a[k],b[k]))return false;return true}
function syId(key,path){const p=path.length;
 if(key==="rbook"&&p===0)return bKey;if(key==="rs"&&p===0)return sKey;if(key==="rfav"&&p===0)return"set";
 if((key==="rtags"||key==="rl"||key==="rp"||key==="rcat")&&p===0)return x=>x&&x.n;
 if((key==="ra"||key==="rcg")&&p===0)return x=>x&&x.id;
 if(key==="rmen"&&p===2)return x=>x&&x.s+"|"+x.t;
 if(key==="rpf"&&p===1)return"set";
 if(key==="rnote"&&p===2&&path[1]==="h")return"set";return null}
function sySet(b,l,r){const J=JSON.stringify,mk=a=>new Map((Array.isArray(a)?a:[]).map(x=>[J(x),x])),mb=mk(b),ml=mk(l),mr=mk(r),out=[];
 ml.forEach((x,k)=>{if(!(mb.has(k)&&!mr.has(k)))out.push(x)});mr.forEach((x,k)=>{if(!ml.has(k)&&!mb.has(k))out.push(x)});return out}
function syIdArr(b,l,r,f,key,path){const idf=x=>{const v=f(x);return v==null?JSON.stringify(x):String(v)},mk=a=>new Map((Array.isArray(a)?a:[]).map(x=>[idf(x),x])),
 mb=mk(b),ml=mk(l),mr=mk(r),out=[],seen=new Set();
 const h=id=>{if(seen.has(id))return;seen.add(id);const e=ml.get(id)||mr.get(id)||{},pc=SYCTX;SYCTX=e.titlu||e.n||String(id);const m=syM(mb.get(id),ml.get(id),mr.get(id),key,path.concat("#"));SYCTX=pc;if(m!==undefined)out.push(m)};
 ml.forEach((_,id)=>h(id));mr.forEach((_,id)=>h(id));return out}
var SYC=[],SYCTX="",SYFIRST=false;
const syEmp=v=>v==null||v===""||(Array.isArray(v)&&!v.length)||(typeof v==="object"&&!Array.isArray(v)&&!Object.keys(v).length);
function syM(b,l,r,key,path){
 if(syEq(l,r))return l;if(syEq(l,b))return r;if(syEq(r,b))return l;
 if(l===undefined)return r;if(r===undefined)return l;
 if(syEmp(l)&&!syEmp(r))return r;if(syEmp(r)&&!syEmp(l))return l;
 const al=Array.isArray(l),ar=Array.isArray(r);
 if(al&&ar){const f=syId(key,path);if(f==="set")return sySet(b,l,r);if(f)return syIdArr(b,l,r,f,key,path);return syAt(key,path,l,r)}
 if(!al&&!ar&&l&&r&&typeof l==="object"&&typeof r==="object"){const o={},bb=b&&typeof b==="object"&&!Array.isArray(b)?b:{};
  new Set([...Object.keys(l),...Object.keys(r)]).forEach(k=>{const v=syM(bb[k],l[k],r[k],key,path.concat(k));if(v!==undefined)o[k]=v});return o}
 return syAt(key,path,l,r)}
function syAt(key,path,l,r){const c=SYFIRST?r:l;SYC.push({k:key,nm:SYCTX,f:path[path.length-1],l:c,r:SYFIRST?l:r});return c}
function syMerge(base,loc,rem,first){SYC=[];SYCTX="";SYFIRST=!!first;const o={};new Set([...Object.keys(base||{}),...Object.keys(loc||{}),...Object.keys(rem||{})]).forEach(k=>{const v=syM((base||{})[k],(loc||{})[k],(rem||{})[k],k,[]);if(v!==undefined)o[k]=v});return o}
const syEqO=(a,b)=>{const ks=new Set([...Object.keys(a||{}),...Object.keys(b||{})]);for(const k of ks)if(!syEq((a||{})[k],(b||{})[k]))return false;return true};
const syDiff=(a,b)=>[...new Set(BK_KEYS.filter(k=>!syEq((a||{})[k],(b||{})[k])).map(k=>SY_LAB[k]))];
/* frana: refuza o sincronizare care ar sterge mai mult de jumatate din biblioteca sau din retetele salvate */
function syBrake(loc,rem,mer){for(const k of["rbook","rs"]){const n=x=>Array.isArray(x)?x.length:0;
 if((n(rem[k])>=10&&n(mer[k])<n(rem[k])*.5)||(n(loc[k])>=10&&n(mer[k])<n(loc[k])*.5))return SY_LAB[k]}return null}
async function syFetch(){try{const r=await dbApi("https://content.dropboxapi.com/2/files/download",{path:"/sync.json"},null,true);
  let rev=null;try{rev=(JSON.parse(r.headers.get("dropbox-api-result")||"{}")).rev||null}catch(e){}
  const j=JSON.parse(await r.text());if(j.app!=="retete-dana"||!j.data||typeof j.data!=="object")throw new Error("Fisierul sync.json din Dropbox nu apartine acestei aplicatii.");
  if(!rev)rev=await syRev();return{rev,data:j.data}}
 catch(e){if(/not_found/.test(e.message||""))return null;throw e}}
async function syRev(){try{return(await(await dbApi("https://api.dropboxapi.com/2/files/get_metadata",{path:"/sync.json"})).json()).rev||null}catch(e){if(/not_found/.test(e.message||""))return null;throw e}}
const syDev=()=>{const u=navigator.userAgent||"";return/iPhone|iPad/.test(u)?"iPhone":/Android/.test(u)?"Android":"laptop"};
async function syPut(data,rev){const r=await dbApi("https://content.dropboxapi.com/2/files/upload",{path:"/sync.json",mode:rev?{".tag":"update",update:rev}:"add",autorename:false,mute:true},
  JSON.stringify({app:"retete-dana",sync:1,saved:new Date().toISOString(),dev:syDev(),data}),true);return(await r.json().catch(()=>({}))).rev||null}
async function syApplyLocal(mer,loc){await snapMake(true);SYAPPLY=true;
 try{for(const k of BK_KEYS){if(syEq(mer[k],loc[k]))continue;
   if(k==="rbook"){if(!(await saveStored(Array.isArray(mer.rbook)?mer.rbook:[])))throw new Error("Nu am putut salva biblioteca.");continue}
   const v=mer[k];try{if(v===undefined)localStorage.removeItem(k);else localStorage.setItem(k,SY_RAW.includes(k)?v:JSON.stringify(v))}catch(e){throw new Error("Nu am putut scrie in browser (spatiu insuficient).")}}}
 finally{SYAPPLY=false}}
var SYAPPLY=false,SYBUSY=false,SYT=0,SYREADY=false,SYLAST=0;
/* rezultat: {ok, applied?, pending?, blocked?, diff?, err?} */
async function syncRun(o){o=o||{};if(SYBUSY)return{busy:true};SYBUSY=true;SYLAST=Date.now();
 try{if(!(IDBOK&&DB))return{err:"Sincronizarea cere baza de date locala a browserului."};if(!dbOn())return{err:"Dropbox nu e conectat."};
  for(let t=0;t<3;t++){const loc=syLocal(),base=(await idbGet("syncbase"))||null;
   if(base&&syEqO(base,loc)&&!o.force){const rv=await syRev();if(rv&&rv===LS("rdbr")){LS("rdbl",String(Date.now()));return{ok:true,same:true}}}
   const rem=await syFetch(),remD=rem?rem.data:{},mer=syMerge(base||{},loc,remD,!base);
   if(!o.force){const bl=syBrake(loc,remD,mer);if(bl)return{blocked:bl}}
   let rev=rem?rem.rev:null;
   if(!syEqO(mer,remD)){try{rev=await syPut(mer,rem?rem.rev:null)}catch(e){if(/conflict/.test(e.message||"")&&t<2)continue;throw e}}
   const conf=SYC.slice();if(conf.length)syConfSave(conf);
   const chg=!syEqO(mer,loc);
   if(chg&&!o.apply){LS("rdbl",String(Date.now()));return{ok:true,pending:true,diff:syDiff(loc,mer),conf:conf.length}}
   if(chg)await syApplyLocal(mer,loc);
   await idbPut("syncbase",mer);if(rev)LS("rdbr",rev);LS("rdbl",String(Date.now()));try{localStorage.removeItem("rdbe")}catch(e){}bkBadge();
   return{ok:true,applied:chg,diff:chg?syDiff(loc,mer):[],conf:conf.length}}
  return{err:"Dropbox s-a schimbat in timpul sincronizarii. Incearca din nou."}}
 catch(e){return{err:e.message||"Eroare la sincronizare."}}
 finally{SYBUSY=false}}
const SY_FL={portii:"portii",etichete:"etichete",ingrediente:"ingrediente",pasi_carte:"mod de preparare",macro:"macro",titlu:"titlu",categorie:"categorie",capitol:"capitol",sfaturi:"sfaturi",verifica:"marcaje de verificat",pna:"portii (nu se aplica)",mok:"avertizare macro"};
const syVal=v=>v==null?"(gol)":typeof v==="object"?"(diferit)":String(v).slice(0,40);
function syConfSave(c){let o=[];try{o=JSON.parse(LS("rsyc")||"[]")}catch(e){}if(!Array.isArray(o))o=[];
 c.forEach(x=>o.push({t:Date.now(),nm:x.nm||SY_LAB[x.k]||x.k,f:SY_FL[x.f]||x.f||"",l:syVal(x.l),r:syVal(x.r)}));LS("rsyc",JSON.stringify(o.slice(-30)))}
const syConfGet=()=>{try{const o=JSON.parse(LS("rsyc")||"[]");return Array.isArray(o)?o:[]}catch(e){return[]}};
function syBar(txt,btn){const b=$("#sybar");if(!b)return;if(!txt){b.hidden=true;return}$("#sytxt").textContent=txt;$("#syGo").hidden=!btn;$("#syGo").textContent=btn||"";b.hidden=false}
const syMsg=r=>r.err?r.err:r.blocked?"Sincronizare oprita: ar sterge peste jumatate din "+r.blocked+". Verifica datele inainte sa continui.":r.pending?"Sunt modificari noi de pe alt dispozitiv ("+r.diff.join(", ")+").":r.applied?"Preluat de pe alt dispozitiv: "+r.diff.join(", ")+".":"Sincronizat.";
async function syAuto(apply){if(!dbOn()||LS("rdba")==="0"||!hasData()&&!apply)return null;
 const r=await syncRun({apply});
 if(r.busy)return r;
 if(r.err){LS("rdbe",r.err.slice(0,120))}
 if(r.applied){try{sessionStorage.setItem("rsyt","Preluat de pe alt dispozitiv: "+r.diff.join(", ")+".")}catch(e){}location.reload();return r}
 if(r.pending)syBar("Sunt modificari noi de pe alt dispozitiv ("+r.diff.join(", ")+").","Aplica acum");
 else if(r.blocked)syBar(syMsg(r),"");
 else syBar("");
 if(syConfGet().length&&!r.pending&&!r.blocked)syBar(syConfGet().length+" modificari facute pe ambele dispozitive. Am pastrat o singura varianta.","Vezi");
 dbDraw();return r}
/* marcheaza ca s-a schimbat ceva aici; trimite dupa 15 secunde de liniste */
function syMark(k){if(!SYREADY||SYAPPLY||!dbOn())return;clearTimeout(SYT);SYT=setTimeout(()=>{if(Date.now()-SYLAST>5000)syAuto(false)},15000)}
document.addEventListener("visibilitychange",()=>{if(!SYREADY||!dbOn())return;
 if(document.visibilityState==="hidden"){if(SYT){clearTimeout(SYT);SYT=0;syAuto(false)}}
 else if(Date.now()-SYLAST>SY_MIN)syAuto(false)});
$("#syGo").onclick=async()=>{if($("#syGo").textContent==="Vezi"){show("setari");setSub("backup");return}
 $("#syGo").disabled=true;const r=await syncRun({apply:true});$("#syGo").disabled=false;
 if(r.applied){try{sessionStorage.setItem("rsyt","Preluat de pe alt dispozitiv: "+r.diff.join(", ")+".")}catch(e){}location.reload();return}
 syBar(r.err||"");if(!r.err)toast(syMsg(r));dbDraw()};
const DEFK="7hvolba2cog2zy8";
async function dbDraw(msg){const el=$("#dbbox");if(!el)return;let h="";
 if(!dbOn()){h+=`<p class="muted" style="margin:0 0 8px">Sincronizeaza retetele, meniul, lista si celelalte date intre telefon si laptop, prin Dropbox-ul tau. Datele ajung doar in folderul aplicatiei din contul tau. Te conectezi o data pe fiecare dispozitiv.</p><button class="go" type="button" data-dbc="1" style="margin:0">Conecteaza Dropbox</button>`}
 else{h+=`<p class="muted" style="margin:0 0 8px">Conectat. ${LS("rdbl")?"Ultima sincronizare: "+esc(fmtDT(+LS("rdbl")))+".":"Inca nu s-a sincronizat."}${LS("rdbe")?" Ultima incercare a esuat: "+esc(LS("rdbe"))+".":""}</p><button class="go" type="button" data-dbs="1" style="margin:0">Sincronizeaza acum</button> <button class="alt" type="button" data-dbx="1">Deconecteaza</button>
  <label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="dba"${LS("rdba")==="0"?"":" checked"} style="width:auto"> Sincronizare automata (la deschidere, dupa modificari si cand revii in aplicatie)</label>`}
 const cf=syConfGet();if(cf.length)h+=`<div class="warn" style="margin-top:10px"><b>Modificate pe ambele dispozitive (${cf.length}).</b> Am pastrat o singura varianta (cealalta e aratata mai jos).${cf.slice(-8).map(x=>`<div>${esc(x.nm)}${x.f?" - "+esc(x.f):""}: pastrat "${esc(x.l)}", cealalta era "${esc(x.r)}"</div>`).join("")}<button class="alt" type="button" data-syc="1" style="margin-top:8px">Am inteles</button></div>`;
 h+=`<details style="margin-top:10px"><summary class="muted">Avansat: aplicatie Dropbox proprie</summary><p class="muted" style="margin:8px 0">Implicit se foloseste aplicatia Dropbox a acestei aplicatii. Daca ai creat una proprie, scrie aici App key. Adresa de redirectionare: <b>${esc(dbRedirect())}</b></p><input id="dbk" autocomplete="off" placeholder="App key" value="${esc(LS("rdbk")||"")}" aria-label="App key Dropbox"><button class="alt" type="button" data-dbks="1" style="margin-top:8px">${LS("rdbk")?"Salveaza cheia":"Foloseste cheia"}</button>${LS("rdbk")?' <button class="alt" type="button" data-dbkx="1" style="margin-top:8px">Revino la cea implicita</button>':""}</details>`;
 el.innerHTML=h+(msg?`<div class="muted" style="margin-top:8px" role="status">${esc(msg)}</div>`:"")}
function bkPreview(txt,name){try{IMP=bkParse(txt,name);impDraw();$("#bkm").textContent="Verifica previzualizarea de mai jos si confirma restaurarea.";const p=$("#bipv");if(p&&p.scrollIntoView)p.scrollIntoView({block:"center"})}
 catch(x){IMP=null;impDraw();$("#bkm").textContent="Copia nu e un backup valid al acestei aplicatii."}}
$("#snbox").onclick=async e=>{const d=e.target.dataset;
 if(d.snmk!==undefined){await snapMake(true);snDraw();toast("Copie facuta.");return}
 if(d.snr){try{bkPreview(await idbGet(d.snr),"copie "+fmtDT(d.snr.slice(5)))}catch(x){toast("Nu am putut citi copia.")}}};
$("#dbbox").onclick=async e=>{const b=e.target,d=b.dataset;
 if(d.dbks!==undefined){const v=($("#dbk").value||"").trim();if(!/^[a-z0-9]{8,40}$/i.test(v)){toast("App key nu pare valid (litere si cifre).");return}
  if(v!==DBK()||LS("rdbt")){["rdbt","rdbl","rdbe","rdbr"].forEach(k=>{try{localStorage.removeItem(k)}catch(x){}});DBAT=null;try{await idbDel("syncbase")}catch(x){}}
  LS("rdbk",v);dbDraw("Cheia a fost schimbata. Conecteaza din nou.");return}
 if(d.dbkx!==undefined){try{localStorage.removeItem("rdbk")}catch(x){}["rdbt","rdbl","rdbe","rdbr"].forEach(k=>{try{localStorage.removeItem(k)}catch(x){}});DBAT=null;try{await idbDel("syncbase")}catch(x){}dbDraw("Se foloseste din nou aplicatia implicita. Conecteaza din nou.");return}
 if(d.syc!==undefined){try{localStorage.removeItem("rsyc")}catch(x){}syBar("");dbDraw();return}
 if(d.dbc!==undefined){try{await dbConnect()}catch(x){dbDraw("Nu am putut porni conectarea: "+(x.message||x))}return}
 if(d.dbx!==undefined){["rdbt","rdbl","rdbe","rdbr"].forEach(k=>{try{localStorage.removeItem(k)}catch(x){}});DBAT=null;try{await idbDel("syncbase")}catch(x){}syBar("");bkBadge();dbDraw("Deconectat. Fisierul sync.json a ramas in Dropbox; datele de aici nu s-au schimbat.");return}
 if(d.dbs!==undefined){b.disabled=true;dbDraw("Se sincronizeaza...");const r=await syncRun({apply:true});
  if(r.applied){try{sessionStorage.setItem("rsyt",syMsg(r))}catch(x){}location.reload();return}
  if(r.blocked){dbDraw(syMsg(r));$("#dbbox").insertAdjacentHTML("beforeend",'<button class="alt" type="button" data-syf="1" style="margin-top:8px">Sincronizeaza oricum</button>');return}
  if(r.err)LS("rdbe",r.err.slice(0,120));syBar("");dbDraw(syMsg(r));return}
 if(d.syf!==undefined){b.disabled=true;const r=await syncRun({apply:true,force:true});if(r.applied){try{sessionStorage.setItem("rsyt",syMsg(r))}catch(x){}location.reload();return}dbDraw(syMsg(r))}};
$("#dbbox").onchange=e=>{if(e.target.id==="dba")LS("rdba",e.target.checked?"1":"0")};
/* intoarcere din Dropbox dupa autorizare: ?code=... */
(async()=>{const q=new URLSearchParams(location.search),c=q.get("code"),v=sessionStorage.getItem("rdbv");if(!(c&&v)&&!q.get("error"))return;
 try{history.replaceState(null,"",location.pathname)}catch(e){}try{sessionStorage.removeItem("rdbv")}catch(e){}if(!c||!v){show("setari");setSub("backup");toast("Conectarea Dropbox a fost anulata.");return}
 try{const j=await dbToken({grant_type:"authorization_code",code:c,code_verifier:v,client_id:DBK(),redirect_uri:dbRedirect()});LS("rdbt",j.refresh_token);DBAT=j.access_token;DBAX=Date.now()+(j.expires_in||14400)*1000;show("setari");setSub("backup");toast("Dropbox conectat. Sincronizez...");dbDraw();const r=await syncRun({apply:true});if(r.applied){try{sessionStorage.setItem("rsyt",syMsg(r))}catch(x){}location.reload();return}if(r.blocked)dbDraw(syMsg(r));else if(r.err)dbDraw(r.err);else{toast(syMsg(r));dbDraw()}}
 catch(x){show("setari");setSub("backup");dbDraw("Nu am putut conecta Dropbox: "+(x.message||x))}})();
snDraw();dbDraw();
/* copii automate la pornire (dupa ce biblioteca e incarcata) */
setTimeout(async()=>{await snapMake(false);snDraw();if(LS("rsyv")!=="2"){try{if(IDBOK&&DB)await idbDel("syncbase")}catch(e){}["rdbr","rsyc"].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});LS("rsyv","2")}
 SYREADY=true;await syAuto(true)},3000);
try{const t=sessionStorage.getItem("rsyt");if(t){sessionStorage.removeItem("rsyt");setTimeout(()=>toast(t),600)}}catch(e){}
$("#profbox").onchange=e=>{const k=e.target.dataset.pr;if(!k)return;const p=getPr(),v=e.target.value.trim();
 if(v==="")delete p[k];else if(k==="s"||k==="g")p[k]=v;else{const n=+v.replace(",",".");if(Number.isFinite(n))p[k]=n}
 putPr(p);profDraw();if(typeof drawMenu==="function"&&LIBREADY)try{drawMenu()}catch(x){}};
profDraw();
$("#bflt").open=innerWidth>700;
renderTagUI();
renderBox();
drawOnb();

/* 2.24.1: Info > Ingrediente si Masuri (datele sunt in nutri.js) */
const IGR=["Legume","Fructe","Carne","Peste","Oua si lactate","Cereale si paste","Leguminoase","Nuci si seminte","Grasimi","Condimente","Dulciuri si altele"];
const ICOL=NUTRI.C,iv=(r,k)=>r[3+ICOL.indexOf(k)];
const IMIC=[["Alte valori",[["fib","Fibre","g"],["zah","Zaharuri","g"],["sat","Grasimi saturate","g"],["col","Colesterol","mg"]]],["Minerale",[["na","Sodiu","mg"],["ca","Calciu","mg"],["fe","Fier","mg"],["mg","Magneziu","mg"],["fo","Fosfor","mg"],["k","Potasiu","mg"],["zn","Zinc","mg"],["se","Seleniu","mcg"]]],["Vitamine",[["va","Vitamina A","mcg"],["vc","Vitamina C","mg"],["vd","Vitamina D","mcg"],["ve","Vitamina E","mg"],["vk","Vitamina K","mcg"],["b1","B1 (tiamina)","mg"],["b2","B2 (riboflavina)","mg"],["b3","B3 (niacina)","mg"],["b6","B6","mg"],["b9","B9 (folat)","mcg"],["b12","B12","mcg"]]]];
let IGS="",IGP="",ISORT="nume",IAMT=100,IOPEN=new Set();
const iN=(x,f)=>x==null?"-":(x=x*f,x>=100?String(Math.round(x)):x>=10?String(+x.toFixed(1)):String(+x.toFixed(2)));
function drawIngr(){
 const f=(+IAMT>0?+IAMT:100)/100,q=norm(IGS).trim().split(/\s+/).filter(Boolean);
 if($("#ngc").dataset.k!=="1"){$("#ngc").dataset.k="1";$("#ngc").innerHTML=["",...IGR].map(g=>`<option value="${esc(g)}">${esc(g||"Toate grupele")}</option>`).join("");$("#mgc").innerHTML=$("#ngc").innerHTML}$("#ngc").value=IGP;
 let L=NUTRI.R.map((r,i)=>[r,i]).concat(Object.entries(FD).filter(([k])=>!fdBase().R.some(b=>b.t.join(" ")===k)).map(([k,x])=>[[cap(dn(x.n)),x.gr||"","",...x.k,...(x.x||Array(23).fill(null))],"u"+k])).filter(([r,i])=>(!IGP||r[1]===IGP)&&q.every(w=>norm(r[0]).includes(w)||(typeof i==="number"&&norm(NUTRI.E[i]||"").includes(w))));
 const key={kcal:r=>iv(r,"kcal"),p:r=>iv(r,"p"),c:r=>iv(r,"c"),g:r=>iv(r,"g"),fib:r=>iv(r,"fib"),pk:r=>iv(r,"kcal")>=20?iv(r,"p")/iv(r,"kcal"):-1}[ISORT];
 if(key)L.sort((a,b)=>(key(b[0])||0)-(key(a[0])||0)||a[0][0].localeCompare(b[0][0],"ro"));else L.sort((a,b)=>a[0][0].localeCompare(b[0][0],"ro"));
 const nd=r=>IMIC.map(([t,a])=>`<div class="ng"><h4>${t}</h4>${a.map(([k,n,u])=>`<div class="nv"><span>${n}</span><b>${iN(iv(r,k),f)}${iv(r,k)==null?"":" "+u}</b></div>`).join("")}</div>`).join("");
 const row=([r,i])=>{if(typeof i==="string"){const key=i.slice(1),uf=FD[key]||{},op=IOPEN.has(i),hk=!!LS("rk");return`<div class="nr"><button type="button" class="nrb" data-ni="${esc(i)}" aria-expanded="${op}"><span class="nn"><b>${esc(r[0])}</b> <span class="muted">${uf.src==="ai"?"AI":"manual"}</span></span><span class="nk">${iN(iv(r,"kcal"),f)}</span><span>${iN(iv(r,"p"),f)}</span><span>${iN(iv(r,"c"),f)}</span><span>${iN(iv(r,"g"),f)}</span></button>`+(op?`<div class="nd">${nd(r)}</div><div style="padding:0 8px 10px"><p class="muted" style="margin:0 0 6px">${uf.src==="ai"?"Valori estimate de AI; verifica-le la nevoie.":"Valori introduse de tine."}${uf.x?"":" Fara fibre, minerale si vitamine inca."}</p><div class="row" style="gap:6px"><button class="fdx alt" type="button" data-fdai="${esc(key)}"${hk?"":" disabled"}>Completeaza cu AI</button><button class="fdx alt" type="button" data-fded="${esc(key)}">Editeaza</button><button class="fdx alt" type="button" data-fdd="${esc(key)}" aria-label="Sterge ${esc(r[0])}">Sterge</button></div><div data-fdbox></div></div>`:"")+`</div>`}const op=IOPEN.has(i);
  return`<div class="nr"><button type="button" class="nrb" data-ni="${i}" aria-expanded="${op}"><span class="nn"><b>${esc(r[0])}</b></span><span class="nk">${iN(iv(r,"kcal"),f)}</span><span>${iN(iv(r,"p"),f)}</span><span>${iN(iv(r,"c"),f)}</span><span>${iN(iv(r,"g"),f)}</span></button>`+
  (op?`<p class="muted" style="margin:0 0 8px">${esc(NUTRI.E[i]||"")}</p><div class="nd">${nd(r)}</div>`:"")+`</div>`};
 drawNu();
 $("#nl").innerHTML=L.length?`<div class="nh"><span>Aliment</span><span>kcal</span><span>Prot.</span><span>Carb.</span><span>Gras.</span></div>`+L.map(row).join(""):`<p class="muted">Nu am gasit niciun aliment${IGS?" pentru \""+esc(IGS)+"\"":""}.</p>`+(IGS.trim()&&!IGP?`<div data-irow><p class="muted" style="margin:0 0 6px">Il poti cauta cu AI sau completa tu; ramane salvat in lista ta, marcat AI sau manual.</p><div class="row" style="gap:8px"><button class="alt" type="button" data-iai="1" style="margin:0"${LS("rk")?"":" disabled"}>Cauta cu AI</button><button class="alt" type="button" data-iman="1" style="margin:0">Completeaza manual</button></div>${LS("rk")?"":'<p class="muted" style="margin:6px 0 0">Pentru AI adauga cheia API in Setari.</p>'}<div data-mform></div></div>`:"")}
$("#nq").oninput=e=>{IGS=e.target.value;drawIngr()};
$("#nam").oninput=e=>{IAMT=e.target.value;drawIngr()};
$("#ns").onchange=e=>{ISORT=e.target.value;drawIngr()};
$("#ngc").onchange=e=>{IGP=e.target.value;drawIngr()};$("#mgc").onchange=drawMas;
$("#nl").onclick=e=>{const b=e.target.closest("button");if(b&&b.dataset.fdd!==undefined){const n=(FD[b.dataset.fdd]||{}).n;delete FD[b.dataset.fdd];fdSave();drawIngr();toast("Sters din lista ta: "+dn(n||"")+".");return}const INZ=()=>({x:{n:IGS.trim(),c:100,u:"g",nr:1}});if(b&&b.dataset.iai!==undefined){fdAIZ(INZ(),b,$("#nl [data-mform]"),drawIngr);return}if(b&&b.dataset.iman!==undefined){$("#nl [data-mform]").innerHTML=fdFormHtml(INZ(),"i");return}if(b&&b.dataset.mms==="i"){fdManZ(INZ(),$("#nl [data-irow]"),drawIngr);return}const FZ=k=>({x:{n:FD[k].n,c:100,u:"g",nr:1},f:{k:FD[k].k},fd:FD[k]});if(b&&b.dataset.fdai!==undefined){fdAIZ(FZ(b.dataset.fdai),b,b.closest(".nr").querySelector("[data-fdbox]"),drawIngr);return}if(b&&b.dataset.fded!==undefined){b.closest(".nr").querySelector("[data-fdbox]").innerHTML=fdFormHtml(FZ(b.dataset.fded),"e:"+b.dataset.fded);return}if(b&&String(b.dataset.mms).startsWith("e:")){fdManZ(FZ(b.dataset.mms.slice(2)),b.closest("[data-fdbox]"),drawIngr);return}if(!b||b.dataset.ni===undefined)return;const i=isNaN(+b.dataset.ni)?b.dataset.ni:+b.dataset.ni;IOPEN.has(i)?IOPEN.delete(i):IOPEN.add(i);drawIngr()};
function drawMas(){const q=norm($("#mq").value||"").trim().split(/\s+/).filter(Boolean);
 const mg=$("#mgc").value,L=NUTRI.M.filter(m=>m[2].some(x=>x!=null)&&(!mg||m[1]===mg)&&q.every(w=>norm(m[0]).includes(w))).sort((a,b)=>a[0].localeCompare(b[0],"ro"));
 const v=x=>x==null?"-":x;
 $("#ml").innerHTML=L.length?`<div class="mh2"><span>Aliment</span><span>Lingura</span><span>Lingurita</span><span>Cana</span></div>`+L.map(m=>`<div class="mt2"><span><b>${esc(m[0])}</b></span><span>${v(m[2][0])}</span><span>${v(m[2][1])}</span><span>${v(m[2][2])}</span></div>`).join(""):`<p class="muted">Nu am gasit niciun aliment.</p>`}
$("#mq").oninput=drawMas;
function drawGat(){const el=$("#gl");if(el.dataset.k==="1")return;el.dataset.k="1";
 el.innerHTML=NUTRI.G.map(([g,t])=>`<h3 class="gg">${esc(g)}</h3>`+t.map(([n,r])=>`<details class="gd"><summary>${esc(n)}</summary><ul>${r.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></details>`).join("")).join("")}

/* ===== 2.32.0: numar de portii confirmat separat, "-" = nu se aplica, fisier de corectii ===== */
const PVR="numar de portii";
const vx=r=>(r.verifica||[]).filter(x=>x!==PVR);
function pParse(v){v=String(v==null?"":v).trim();if(v==="-"||v==="\u2013")return{na:true};if(v==="")return{n:null};if(!/^\d{1,3}$/.test(v)||+v<1||+v>200)return{bad:true};return{n:+v}}
function pConfirm(bv,i){const r=BOOK[i],pp=pParse(bv.querySelector("[data-ef=portii]").value);
 if(pp.bad||(!pp.na&&pp.n==null)){toast("Scrie numarul de portii (1-200) sau - daca nu se aplica.");return}
 r.portii=pp.na?null:pp.n;if(pp.na)r.pna=true;else delete r.pna;
 r.verifica=(r.verifica||[]).filter(x=>x!==PVR);if(!r.verifica.length)delete r.verifica;
 if(persistBook(r)){updVC();bv.querySelector("[data-pcbox]").innerHTML='<span class="muted">Portii confirmate'+(pp.na?" (nu se aplica).":": "+pp.n+".")+"</span>";toast("Portii confirmate.")}}
let PATCH=null;
const pcMatch=(c,st)=>st.findIndex(r=>String(r.nr)===String(c.n)&&dn(r.titlu).toLowerCase()===dn(c.t||"").toLowerCase());
function pcPlan(P,st){let skip=0,miss=0;const todo=[];P.forEach(c=>{const j=pcMatch(c,st);if(j<0){miss++;return}const r=st[j];
  if("era" in c){const cur=r.pna?"-":r.portii==null?null:r.portii;if(cur!==c.era){skip++;return}}todo.push([j,c])});return{ok:todo.length,skip,miss,todo}}
function pcDraw(){const el=$("#bpp");if(!PATCH){el.innerHTML="";return}const st=getStored(),p=pcPlan(PATCH.c,st);
 el.innerHTML=`<div class="card" style="margin:8px 0 12px"><b>${esc(PATCH.f)}</b><p class="muted" style="margin:6px 0 10px">${PATCH.c.length} corectii: ${p.ok} se aplica, ${p.skip} sarite (le-ai modificat tu intre timp), ${p.miss} retete negasite in biblioteca. Se schimba doar portiile si marcajele; restul retetei ramane neatins.</p>${p.ok?'<button class="go" data-pcx="ok" style="margin:0">Aplica</button> ':""}<button class="alt" data-pcx="no">Anuleaza</button></div>`}
$("#bpatch").onchange=async e=>{const f=e.target.files[0];PATCH=null;$("#bpm").textContent="";if(!f){pcDraw();return}
 try{const j=JSON.parse(await f.text()),c=j&&j.corectii;if(!Array.isArray(c)||!c.length||!c.every(x=>x&&typeof x==="object"&&x.n!=null&&x.t))throw 0;PATCH={c,f:f.name};pcDraw()}
 catch(x){pcDraw();$("#bpm").textContent="Fisierul nu e un fisier de corectii valid."}};
$("#bpp").onclick=e=>{const d=e.target.dataset.pcx;if(!d)return;
 if(d==="no"){PATCH=null;$("#bpatch").value="";pcDraw();return}
 const st=getStored(),p=pcPlan(PATCH.c,st);
 p.todo.forEach(([j,c])=>{const r=st[j];if(c.portii!==undefined){if(c.portii==="-"){r.portii=null;r.pna=true}else{r.portii=+c.portii;delete r.pna}}
  if(Array.isArray(c.marcheaza))r.verifica=[...new Set([...(r.verifica||[]),...c.marcheaza.map(String)])]});
 putStored(st);PATCH=null;$("#bpatch").value="";pcDraw();updVC();toast("Corectii aplicate la "+p.ok+" retete.")};
/* ===== 2.28.0: macro local-first (din Info) + alimente adaugate de tine (rfd) ===== */
const FDK="rfd";
let FD={};try{const j=JSON.parse(LS(FDK)||"{}");if(j&&typeof j==="object"&&!Array.isArray(j))FD=j}catch(e){}
const fdSave=()=>LS(FDK,JSON.stringify(FD));
const MSYN={oua:"ou",cepe:"ceapa",catei:"catel",cateii:"catel",mere:"mar",rosii:"rosie",lamai:"lamaie",dovlecei:"dovlecel",felii:"felie"};
const MSTOP=new Set("de cu si din la pe fara sau un o mare mici mic mica mijlocii mijlocie proaspat proaspata proaspete fiert fiarta fierte tocat tocata tocate ras rasa rase rece calduta caldute fierbinte taiat taiata taiate foi boabe".split(" "));
const mSt=w=>{w=MSYN[w]||w;const a=w.replace(/(ilor|elor|urile|uri|ele|ului|ul)$/,"");if(a!==w&&a.length>=3)return a;const b=w.replace(/[aeiu]+$/,"");return b.length>=3?b:w};
const mTok=s=>dn(String(s||"")).toLowerCase().replace(/\([^)]*\)/g," ").split(/[^a-z]+/).filter(w=>w.length>1&&!MSTOP.has(w)).map(mSt);
const r1=v=>Math.round(v*10)/10;
let FB=null;
const fdBase=()=>FB||(FB=(()=>{const MM={};NUTRI.M.forEach(m=>{MM[dn(m[0]).toLowerCase()]=m[2]});
 return{R:NUTRI.R.map(r=>{const nm=dn(r[0]).toLowerCase();return{n:r[0],nm,t:mTok(r[0]),k:[r[3],r[4],r[5],r[6]].map(v=>v==null?0:+v),v:r.slice(3).map(v=>v==null?0:+v),mm:MM[nm]}}),
  PM:Object.fromEntries(Object.entries(NUTRI.P).map(([k,v])=>[mSt(k),v])),Z:new Set(NUTRI.Z.map(mSt))}})());
const FPREF=["ulei de floarea-soarelui","faina alba","orez alb","lapte 3,5%","smantana 20%","zahar","oua de gaina","unt","branza de vaci"],FST=/fiert|copt|prajit|gatit|fript/;
function fdMatch(name){const it=mTok(name);if(!it.length)return null;const S=new Set(it),B=fdBase(),raw=dn(name).toLowerCase();
 const ok=f=>!FST.test(f.nm)||FST.test(raw),pr=f=>{const j=FPREF.indexOf(f.nm);return j<0?99:j};
 const sub=L=>{const c=L.filter(f=>f.t.length&&f.t.every(w=>S.has(w))&&ok(f));if(!c.length)return null;const m=Math.max(...c.map(f=>f.t.length));return c.filter(f=>f.t.length===m).sort((a,b)=>pr(a)-pr(b))[0]};
 const U=Object.values(FD).map(f=>({n:f.n,nm:dn(f.n).toLowerCase(),t:f.t||mTok(f.n),k:f.k,cv:f.cv,user:1,v:(f.x&&f.x.length===23&&f.k&&f.k.length===4)?f.k.map(v=>+v||0).concat(f.x.map(v=>v==null||v===""?0:+v)):null}));
 let f=sub(U)||sub(B.R);if(f)return f;
 if(it.every(w=>B.Z.has(w)))return{zero:1,n:"fara aport caloric"};
 if(it.length===1){const c=B.R.filter(f=>f.t.includes(it[0])&&ok(f));if(c.length){c.sort((a,b)=>(b.t[0]===it[0])-(a.t[0]===it[0])||pr(a)-pr(b)||a.t.length-b.t.length);return Object.assign({loose:1},c[0])}}
 if(it.every(w=>B.Z.has(w)))return{zero:1,n:"fara aport caloric"};
 return null}
const FDW={g:1,gr:1,gram:1,grame:1,kg:1000,ml:1,l:1000,dl:100,cl:10};
function fdGrams(x,f){const B=fdBase();if(f.zero)return{g:0};const u=dn(x.u||"").toLowerCase().trim();
 if(FDW[u]!=null)return{g:x.c*FDW[u]};
 if(f.cv&&f.cv[u]!=null)return{g:x.c*f.cv[u]};
 const m=f.mm;
 if(/^lingurit/.test(u))return m&&m[1]!=null?{g:x.c*m[1]}:{g:x.c*5,ap:1};
 if(/^lingur/.test(u))return m&&m[0]!=null?{g:x.c*m[0]}:{g:x.c*15,ap:1};
 if(/^(ceas|cest|pahar)/.test(u))return m&&m[2]!=null?{g:x.c*m[2]}:{g:x.c*240,ap:1};
 if(/^(varf|strop|praf)/.test(u))return{g:x.c,ap:1};
 let k=null;
 if(u===""||/^bucat/.test(u))k=mTok(x.n).find(w=>B.PM[w])||null;else if(B.PM[mSt(u)])k=mSt(u);
 return k?{g:x.c*B.PM[k],ap:1}:null}
function macLocal(r,por0){const por=por0||r.portii||1,S=[0,0,0,0],det=[],miss=[];let n=0,ap=0;
 rawIngs("b",r).forEach(x=>{if(x.c==null)return;n++;const f=fdMatch(x.n);
  if(!f){miss.push({x,why:"date"});return}
  const q=fdGrams(x,f);if(!q){miss.push({x,why:"masura",f});return}
  if(q.ap)ap++;if(!f.zero)for(let j=0;j<4;j++)S[j]+=q.g*f.k[j]/100;
  det.push({x,f,g:q.g,ap:q.ap})});
 return{o:{kcal:Math.round(S[0]/por),proteine:r1(S[1]/por),grasimi:r1(S[2]/por),carbo:r1(S[3]/por)},n,ok:det.length,miss,det,ap}}
/* 3.2.0: numarul de portii se poate schimba direct in reteta deschisa: arata macro la N portii (fara sa scaleze cantitatile) si se salveaza dintr-un buton */
function pWhat(r,p){if(!(r.ingrediente||[]).length||p==null)return"";const sv0=r.pna||r.portii==null,same=!sv0&&p===r.portii,unc=(r.verifica||[]).includes(PVR);if(same&&!unc)return"";
 const L=same?null:macLocal(r,p),sv=r.macro&&r.macro.kcal!=null?r.macro.kcal:macLocal(r).o.kcal,was=sv0?"acum, fara numar de portii, pentru toata reteta":"salvat, la "+esc(r.portii)+" portii";
 const line=same?`<p class="muted">Numarul de portii (${esc(p)}) nu e confirmat.</p>`:L.ok?`<p><b>La ${esc(p)} portii:</b> ${esc(L.o.kcal)} kcal, proteine ${esc(L.o.proteine)} g, carbohidrati ${esc(L.o.carbo)} g, grasimi ${esc(L.o.grasimi)} g per portie <span class="muted">(${was}: ${esc(sv)} kcal)</span></p>`:`<p class="muted">La ${esc(p)} portii: nu pot calcula (ingredientele nu au date in Info).</p>`;
 return line+`<button class="go" type="button" data-psv="1">${same?"Confirma":"Salveaza"} ${esc(p)} portii</button>`}
function macHead(r,p){const m=r.macro,had=m&&m.kcal!=null,has=(r.ingrediente||[]).length&&!r.pna;
 const t=had?`<p class="muted">${m.sursa==="local"?"Calculat din baza Info"+(m.acoperire?" ("+esc(m.acoperire)+" ingrediente)":"")+", aproximativ":"Valori din carte, aproximative"}: ${esc(m.kcal)} kcal, proteine ${esc(m.proteine??"?")} g, carbohidrati ${esc(m.carbo??"?")} g${m.fibre!=null?" (fibre "+esc(m.fibre)+" g)":""}, grasimi ${esc(m.grasimi??"?")} g${m.saturate!=null?" (saturate "+esc(m.saturate)+" g)":""}</p>`:'<p class="muted">Reteta nu are valori de macro.</p>';
 return pWhat(r,p)+t+(has?`<button class="alt" type="button" data-mcl="1">${had?"Recalculeaza din Info":"Calculeaza din Info"}</button>`:"")}
/* avertizare in meniu: macro din carte foarte diferit de calculul din Info (portii sau cifre nesigure); "E in regula" o ascunde pe reteta */
function macDiff(r){if(!r||r.mok||r.pna||!r.macro||r.macro.kcal==null||r.macro.sursa==="local"||!(+r.macro.kcal>0))return null;
 const L=macLocal(r);if(!L.n||L.ok/L.n<.8||!L.o.kcal)return null;const q=L.o.kcal/+r.macro.kcal;return q<.7||q>1.4?{carte:Math.round(+r.macro.kcal),calc:L.o.kcal}:null}
const fdNeedCv=x=>fdGrams(x,{k:[0,0,0,0]})==null;
function macPanel(bv,i){const r=BOOK[i],L=macLocal(r),box=bv.querySelector("[data-macp]"),m=r.macro,had=m&&m.kcal!=null,o=L.o;bv._ml=L;
 if(!L.n){box.innerHTML='<p class="muted">Nu sunt ingrediente cu cantitate de calculat.</p>';return}
 const hk=!!LS("rk");
 let h=`<div class="card" style="margin:8px 0;background:var(--soft)"><b>${L.ok?"Calculat din Info: "+esc(macTxt(o))+" per portie":"Nu am putut calcula nimic inca"}</b><p class="muted" style="margin:4px 0">Din ${L.ok} din ${L.n} ingrediente${L.ap?"; la "+L.ap+" greutatea e estimata (bucati, linguri, cesti)":""}.${r.portii==null?" Reteta nu are numar de portii: valorile sunt pentru toata reteta.":""}</p>`;
 if(L.miss.length){h+=`<div class="warn" style="margin:8px 0"><b>Fara date pentru ${L.miss.length} ingrediente.</b> Pentru fiecare alegi: cauti cu AI sau completezi tu; ramane salvat in aplicatie si le folosesc data viitoare.${hk?"":" Pentru AI adauga cheia API in Setari."}</div>`+
  L.miss.map((z,j)=>`<div class="card" data-mrow="${j}" style="margin:6px 0"><b>${esc(dn(z.x.n))}</b> <span class="muted">(${esc(dn(ingLine(z.x)))}) ${z.why==="date"?"nu e in Info":"nu pot converti \""+esc(z.x.u||"bucata")+"\" in grame"}</span><div class="row" style="gap:8px;margin-top:6px"><button class="alt" type="button" data-mai="${j}" style="margin:0"${hk?"":" disabled"}>Cauta cu AI</button><button class="alt" type="button" data-mman="${j}" style="margin:0">Completeaza manual</button></div><div data-mform></div></div>`).join("")}
 if(L.det.length){const por=r.portii||1,cn=d=>d.f.zero?{kcal:0,proteine:0,grasimi:0,carbo:0}:{kcal:Math.round(d.g*d.f.k[0]/100/por),proteine:r1(d.g*d.f.k[1]/100/por),grasimi:r1(d.g*d.f.k[2]/100/por),carbo:r1(d.g*d.f.k[3]/100/por)},
  W=d=>["g","gr","gram","grame"].includes(dn(d.x.u||"").toLowerCase().trim());
  h+=`<details><summary>Cum am calculat (aportul fiecarui ingredient, per portie)</summary><ul>${L.det.map(d=>({d,c:cn(d)})).sort((a,b)=>b.c.kcal-a.c.kcal).map(({d,c})=>`<li>${esc(ingLine(d.x))} &rarr; ${d.f.zero?"fara aport caloric":esc(d.f.n)+(d.f.loose?" (potrivire aproximativa, verifica)":"")+(d.f.user?" (adaugat de tine)":"")+(W(d)&&!d.ap?"":", "+Math.round(d.g)+" g"+(d.ap?" estimat":""))+": "+esc(macTxt(c))}</li>`).join("")}</ul></details>`}
 if(L.ok)h+=`<div class="acts"><button class="go" type="button" data-msv="1">${had?"Foloseste valorile calculate":"Salveaza pe reteta"}</button></div>${L.miss.length?`<p class="muted" style="margin:4px 0">Calculul e partial; poti salva acum si recalcula dupa ce completezi restul.</p>`:""}`;
 box.innerHTML=h+"</div>"}
const XK=ICOL.slice(4),XI={};IMIC.forEach(([,g])=>g.forEach(([k,n,u])=>{XI[k]=[n,u]}));
const XCAP={g:100,mg:20000,mcg:200000};
function fdFormShow(bv,j){const z=bv._ml.miss[j];bv.querySelector(`[data-mrow="${j}"] [data-mform]`).innerHTML=fdFormHtml(z,j)}
function fdFormHtml(z,j){const f=z.f?z.f.k:["","","",""],cv=fdNeedCv(z.x),xv=(z.fd&&z.fd.x)||[],gr=(z.fd&&z.fd.gr)||"";
 const inp=(k,l,v,at)=>`<div><label>${l}</label><input data-${at||"mf"}="${k}" type="number" min="0" step="any" value="${v==null?"":esc(v)}"></div>`;
 return`<p class="muted" style="margin:8px 0 4px">Valori la 100 g de ${esc(dn(z.x.n))}:</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${inp("kcal","kcal",f[0])}${inp("p","Proteine g",f[1])}${inp("c","Carbo g",f[3])}${inp("g","Grasimi g",f[2])}</div>${cv?`<div style="margin-top:8px">${inp("cv","Grame intr-o "+(z.x.u||"bucata"),"")}</div>`:""}<details style="margin-top:8px"><summary>Alte valori: fibre, minerale, vitamine (optional)</summary><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${XK.map((k,n)=>inp(k,XI[k][0]+" ("+XI[k][1]+")",xv[n],"mx")).join("")}</div></details><div style="margin-top:8px"><label>Grupa (optional)</label><select data-mf="gr"><option value="">-</option>${IGR.map(g=>`<option${g===gr?" selected":""}>${esc(g)}</option>`).join("")}</select></div><div data-merr class="warn" hidden></div><button class="go" type="button" data-mms="${j}" style="margin-top:8px">Salveaza local</button>`}
function fdPut(z,k,cv,src,gr,x,keep){const key=mTok(z.x.n).join(" ")||dn(z.x.n).toLowerCase(),old=FD[key]||{},u=dn(z.x.u||"").toLowerCase().trim(),c=Object.assign({},old.cv);if(cv)c[u]=cv;
 FD[key]={n:old.n||z.x.n,t:key.split(" "),k,src:keep?(old.src||src):src||old.src||"manual",cv:c,gr:gr||old.gr||"",x:x||old.x||null};fdSave()}
function fdManSave(bv,i,j,btn){fdManZ(bv._ml.miss[j],btn.closest("[data-mrow]"),()=>macPanel(bv,i))}
function fdManZ(z,row,after){const g=k=>{const e=row.querySelector(`[data-mf=${k}]`);return e&&e.value!==""?+e.value:NaN},er=row.querySelector("[data-merr]");
 const k=[g("kcal"),g("p"),g("g"),g("c")],cv=g("cv"),need=fdNeedCv(z.x);
 const x=XK.map(q=>{const e=row.querySelector(`[data-mx=${q}]`),v=e&&e.value!==""?+e.value:NaN;return Number.isFinite(v)&&v>=0&&v<=XCAP[XI[q][1]]?Math.round(v*100)/100:null});
 const bad=k.some(v=>!Number.isFinite(v)||v<0)||k[0]>950||k[1]+k[2]+k[3]>105?"Completeaza cele patru valori (la 100 g); proteine+grasimi+carbo nu pot depasi 100 g.":need&&!(cv>0)?"Spune cate grame are o unitate.":"";
 if(bad){er.textContent=bad;er.hidden=false;return}
 fdPut(z,k.map(r1),need?cv:null,"manual",(row.querySelector("[data-mf=gr]")||{}).value,x.some(v=>v!=null)?x:null);toast("Salvat local: "+dn(z.x.n)+".");after()}
function fdOk(j,need){const n=k=>{const v=+j[k];return Number.isFinite(v)&&v>=0?r1(v):null},k=[n("kcal"),n("proteine"),n("grasimi"),n("carbo")];
 if(k.some(v=>v==null)||k[0]>950||k[1]+k[2]+k[3]>105)return null;const cv=+j.grame_unitate;if(need&&!(cv>0&&cv<5000))return null;
 const x=XK.map(q=>{const v=j[q]==null||j[q]===""?NaN:+j[q];return Number.isFinite(v)&&v>=0&&v<=XCAP[XI[q][1]]?Math.round(v*100)/100:null});
 return{k,cv:need?r1(cv):null,gr:IGR.includes(j.grupa)?j.grupa:"",x:x.some(v=>v!=null)?x:null}}
function fdAI(bv,i,j,btn){return fdAIZ(bv._ml.miss[j],btn,btn.closest("[data-mrow]").querySelector("[data-mform]"),()=>macPanel(bv,i))}
async function fdAIZ(z,btn,box,after){const need=fdNeedCv(z.x);
 if(!LS("rk")){toast("Adauga cheia API in Setari.");return}
 const sys='Esti nutritionist. Raspunzi DOAR cu JSON valid, fara text in plus, fara diacritice.';
 const u=`Aliment: "${z.x.n}"${z.x.u&&!z.x.nr?" (in reteta: "+z.x.c+" "+z.x.u+")":""}.\nDa valorile nutritionale medii la 100 g, pentru alimentul asa cum e scris (crud daca nu spune altfel), ca in baza USDA.${need?" Spune si cate grame are in medie o singura "+(z.x.u||"bucata")+" (grame_unitate).":" Pune grame_unitate null."}\nAlege si grupa din: ${IGR.join(", ")} (grupa).\nPe langa kcal, proteine, grasimi, carbo (g), da: ${XK.map(k=>k+"="+XI[k][0]+" ("+XI[k][1]+")").join(", ")}. Pune null pentru ce nu stii sigur; nu inventa.\nJSON cu cheile: kcal, proteine, grasimi, carbo, grame_unitate, grupa, ${XK.join(", ")}.`;
 btn.disabled=true;btn.textContent="Caut...";box.innerHTML="";
 try{const a=await ask($("#m2").value||"claude-haiku-4-5",sys,u,800,0),v=fdOk(a,need);
  if(!v){box.innerHTML='<div class="warn" style="margin-top:6px">Raspuns neutilizabil. Incearca din nou sau completeaza manual.</div>';return}
  fdPut(z,z.f&&!z.f.zero?z.f.k:v.k,v.cv,"ai",v.gr,v.x,!!z.fd);toast("Salvat local (AI): "+dn(z.x.n)+". Valorile sunt estimate, verifica-le.");after()}
 catch(e){box.innerHTML=`<div class="warn" style="margin-top:6px">${esc(e.message||"Eroare")}</div>`}
 finally{if(btn.isConnected){btn.disabled=false;btn.textContent=z.fd?"Completeaza cu AI":"Cauta cu AI"}}}
function macSaveRec(bv,i,sel,p){const r=BOOK[i],L=bv._ml;if(!L||!L.ok)return;
 r.macro={kcal:L.o.kcal,proteine:L.o.proteine,carbo:L.o.carbo,grasimi:L.o.grasimi,sursa:"local",acoperire:L.ok+" din "+L.n};
 if(persistBook(r)){openBook(i,p,sel);toast("Macro salvat pe reteta.")}}
function drawNu(){const n=Object.keys(FD).length;$("#nu").innerHTML=n?`<p class="muted" style="margin:6px 0">${n===1?"1 aliment adaugat de tine apare":n+" alimente adaugate de tine apar"} in lista, marcate AI sau manual (la 100 g; sunt in backup). <button class="alt" type="button" data-fdcp="1" style="margin:0 0 0 6px">Copiaza lista</button></p>`:""}
$("#nu").onclick=e=>{const b=e.target.closest("button");if(!b)return;

 if(b.dataset.fdcp!==undefined){const t=Object.values(FD).map(f=>`${f.n}: ${f.k[0]} kcal, proteine ${f.k[1]} g, grasimi ${f.k[2]} g, carbo ${f.k[3]} g la 100 g${f.x?"; "+XK.map((q,n)=>f.x[n]==null?"":q+" "+f.x[n]).filter(Boolean).join(", "):""}${f.cv&&Object.keys(f.cv).length?"; "+Object.entries(f.cv).map(([u,g])=>"1 "+(u||"bucata")+" = "+g+" g").join(", "):""}`).join("\n");
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>toast("Lista copiata."),()=>toast("Nu am putut copia."));else toast("Nu pot copia in acest browser.")}};
/* daca ai ceva planificat azi, aplicatia se deschide direct pe Meniu > Azi */
{const m=getMen(),t=dKey(new Date());if(SLOTS.some(([s])=>((m[t]||{})[s]||[]).length)){show("meniu")}else syncNav("idei")}

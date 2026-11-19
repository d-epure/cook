/* 4.1.1: erorile inghitite pana acum in tacere se vad in consola daca pui in localStorage cheia rdebug = "1" */
const dbg=e=>{try{if(localStorage.getItem("rdebug")==="1")console.warn(e)}catch(x){/* fara localStorage nu avem unde scrie */}};
/* Cartea mea de retete - logica aplicatiei (vanilla JS, fara build).
   Datele stau in localStorage: rk cheie API, rm1/rm2b modele, ra aparate, rtags etichete,
   rs retete salvate (vechi: din 5.0.0 se muta in biblioteca, la "Retetele mele"), rjr jurnal de mese, rsmall arata retetele Sanda Marin fara ingrediente, rv5f/rv5c curatenie 5.0.0 facuta, rjs data de la care jurnalul se completeaza din meniu, rfav favorite, rnote jurnal si notite pe retete, rbook biblioteca incarcata (in IndexedDB; rlib = marcaj in localStorage),
   rmen meniu, rmp Meal prep (retete gatite in loturi), rmv vedere meniu (azi/saptamana), rmt tinte de macro (vechi), rprof profil nutritional si tinte, rl cumparaturi, rlv vedere lista (produse/retete),
   pna = nr. de portii "nu se aplica" (pe reteta), rfd alimente adaugate de tine (macro la 100 g), rp debara, rnd marcaj local: migrarea fara diacritice s-a facut (nu intra in backup), rcg categorii alimente, rcat categoria fiecarui aliment, rpf preferinte alimente, rpxc mese pe categorie,
   ru consum, ronb "Primii pasi" ascuns, rbk data ultimei copii. Datele Info (Ingrediente, Masuri, Gatire) sunt in nutri.js, nu in localStorage.
   Cuprins (cauta "=====" sau comentariile de sectiune): etichete, favorite si chei, jurnal pe reteta, aparate,
   biblioteca (filtre, incarcare, stocare in IndexedDB, coada "De verificat", macro cu AI), debara, mod gatit,
   primii pasi, preferinte alimente, meniu si "Propune-mi un meniu", instalare/fara net, jurnal de mese (drawJr). Idei, lista de
   cumparaturi, Setari si Info (Ingrediente, Masuri, Gatire) nu au titlu "=====": cauta functiile drawList, renderSnav, drawIngr, drawMas, drawGat.
   Regula de baza: orice text venit de la model sau din JSON trece prin esc() (sau ed(), fara diacritice) inainte de innerHTML. */
const $=s=>document.querySelector(s);
/* 3.8.0: fara diacritice peste tot. nd() curata un text, ndo() un obiect/lista (pe loc). NDC numara cuvintele schimbate.
   Regula: a cu semn->a; i cu circumflex la inceput de cuvant sau dupa ne/re/pre/de/dez->i, altfel (vechea scriere pine, pina)->a; s si t cu virgula->s, t. */
let NDC=0;const ND_RE=/[\u0102\u0103\u00c2\u00e2\u00ce\u00ee\u0218\u0219\u015e\u015f\u021a\u021b\u0162\u0163]/,ND_M={"\u0103":"a","\u00e2":"a","\u00ee":"a","\u0219":"s","\u015f":"s","\u021b":"t","\u0163":"t","\u0102":"A","\u00c2":"A","\u00ce":"A","\u0218":"S","\u015e":"S","\u021a":"T","\u0162":"T"};
const ndw=w=>{NDC++;w=w.replace(/^(ne|re|pre|de|dez)\u00ee/i,(m,p)=>p+"i").replace(/^\u00ee/,"i").replace(/^\u00ce/,"I");return w.replace(/[\u0102\u0103\u00c2\u00e2\u00ce\u00ee\u0218\u0219\u015e\u015f\u021a\u021b\u0162\u0163]/g,c=>ND_M[c])};
const nd=s=>{if(typeof s!=="string")return s;if(/[̧̦̆̂]/.test(s))s=s.normalize("NFC");return ND_RE.test(s)?s.replace(/\p{L}+/gu,w=>ND_RE.test(w)?ndw(w):w):s};
const ndo=o=>{if(typeof o==="string")return nd(o);if(Array.isArray(o)){for(let i=0;i<o.length;i++){const v=o[i];if(typeof v==="string"){const n=nd(v);if(n!==v)o[i]=n}else if(v&&typeof v==="object")ndo(v)}}
 else if(o&&typeof o==="object"){for(const k of Object.keys(o)){const v=o[k];if(typeof v==="string"){const n=nd(v);if(n!==v)o[k]=n}else if(v&&typeof v==="object")ndo(v)}}return o};
/* 4.1.1: o singura lista cu cheile de date; din ea se deduc LSK (chei normalizate si sincronizate) si BK_KEYS (backup) */
const DKEYS=["rjr","rs","rfav","rtags","rsec","ra","rbook","rm1","rm2b","rl","rp","rcat","rcg","rmen","rmp","rmt","rnote","rpf","rpxc","rfd","rprof"];
const LSK=new RegExp("^("+DKEYS.filter(k=>k!=="rbook").join("|")+")$");
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);if(LSK.test(k))v=nd(v);localStorage.setItem(k,v);if(LSK.test(k))syMark(k)}catch(e){if(v!==undefined){try{toast("Nu am putut salva: memoria browserului e plina sau blocata. Descarca o copie de siguranta si sterge ce nu mai folosesti.")}catch(x){dbg(x)}}return null}};
const DEF=[
{id:"MC",nume:"Monsieur Cuisine Smart",on:1,backup:0,strict:1,tmin:37,tmax:130,maxMin:99,maxMl:3000,moduri:"gatit, sotat, abur, framantat, mixat, tocat, sous vide, slow cook, cantarire",note:"taie, toaca, mixeaza, framanta, sosuri, supe-crema; treapta 1-10 sau turbo; sens normal/invers; max 3 l continut"},
{id:"Ninja",nume:"Ninja Foodi MAX 14-in-1",on:1,backup:0,strict:1,tmin:80,tmax:200,moduri:"Pressure Cook, Air Fry, Grill, Bake, Dehydrate, Prove, Sear/Saute, Steam, Slow Cook, Yoghurt, Steam Meals, Steam Air Fry, Steam Bake, Steam Bread",note:"crocant, air fry, gratar, copt, presiune, slow cook, abur; sonda digitala (sonda_c); la Pressure Cook scrie 'verifica presiunea in manual'"},
{id:"Thermomix",nume:"Thermomix TM6",on:1,backup:0,strict:1,tmin:37,tmax:120,maxMl:2200,moduri:"gatit, sotat, abur (Varoma), framantat, mixat, tocat, emulsionat, amestecat, slow cook, sous vide, fermentare, fierbator (kettle), cantarire",note:"taie, toaca, mixeaza, framanta, sosuri, supe-crema; treapta 0.5-10 sau turbo; sens normal/invers; Varoma pentru abur (vas separat, 3,3 l); slow cook pana la 8 h; fermentare 38-70 C pana la 12 h; temperaturi peste 120 C (rumenire, caramel) doar in retete ghidate Cookidoo, deci foloseste cel mult 120 C; max 2,2 l continut"},
{id:"aragaz",nume:"Aragaz pe gaz",on:1,backup:1,moduri:"foc mic, foc mediu, foc mare",note:"tigaie sau oala, fara temperatura exacta"},
{id:"fierbator",nume:"Fierbator de apa",on:1,backup:1,moduri:"fierbere apa",note:"apa fierbinte rapid"},
{id:"cuptor",nume:"Cuptor clasic pe gaz",on:1,backup:1,tmin:120,tmax:250,moduri:"copt",note:"temperatura aproximativa, fara ventilator"}];
let AP;try{AP=JSON.parse(LS("ra"))}catch(e){dbg(e)}if(!Array.isArray(AP)||!AP.length)AP=JSON.parse(JSON.stringify(DEF));
/* migrare: Thermomix adaugat in lista implicita (o singura data, daca lipseste) */
if(!LS("rdef2")){const k=AP.findIndex(a=>a&&a.id==="Thermomix");if(k>=0){const t=JSON.parse(JSON.stringify(DEF.find(a=>a.id==="Thermomix")));t.on=AP[k].on;AP[k]=t;LS("ra",JSON.stringify(AP))}LS("rdef2","1")}
if(!LS("rdef1")){if(!AP.some(a=>a&&a.id==="Thermomix")){const t=DEF.find(a=>a.id==="Thermomix"),i=AP.findIndex(a=>a&&a.id==="aragaz");AP.splice(i<0?AP.length:i,0,JSON.parse(JSON.stringify(t)));LS("ra",JSON.stringify(AP))}LS("rdef1","1")}
const saveAP=()=>LS("ra",JSON.stringify(AP));
const tag=id=>`<span class="tag">${esc(id)}</span>`;
const esc=t=>String(t==null?"":t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let cur=null,mode="pasi",SV=null,SVP=0;const RC={};

/* ===== ETICHETE (lista centrala, normalizare, cautare) ===== */
const dn=s=>String(s==null?"":s).normalize("NFD").replace(/[\u0300-\u036f]/g,"");const ed=x=>esc(dn(x));
const norm=s=>String(s||"").toLowerCase().replace(/(\w)\u00ee(?=\w)/g,"$1a").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
/* 5.0.0: 12 categorii comune; categoria originala a cartii ramane in "capitol" */
const CAT12=["Mic dejun","Supe si ciorbe","Fel principal","Salate si boluri","Paste si orez","Gustari","Deserturi","Sosuri si garnituri","Aluaturi si paine","Conserve","Bauturi","Altele"];
const CATMAP={"mic dejun":"Mic dejun","mic dejun si brunch":"Mic dejun","mic dejun si gustari":"Mic dejun",
 "supe":"Supe si ciorbe","ciorbe":"Supe si ciorbe","supe crema":"Supe si ciorbe","supe si ciorbe":"Supe si ciorbe",
 "fel principal":"Fel principal","feluri principale":"Fel principal","legume":"Fel principal","pasare":"Fel principal","peste":"Fel principal","tocaturi":"Fel principal","vanat":"Fel principal","carne de vaca":"Fel principal","carne de vitel":"Fel principal","carne de porc":"Fel principal","carne de miel si berbec":"Fel principal","creier, limba, ficat, rinichi":"Fel principal","raci, melci, midii":"Fel principal","mancaruri de oua":"Fel principal","fainoase si branza":"Fel principal","chiftele si burgeri":"Fel principal","cuptor":"Fel principal","cuptor si air fryer":"Fel principal","one pot":"Fel principal","burger si wrap-uri":"Fel principal","sandvisuri":"Fel principal","wrap-uri si sandvisuri":"Fel principal","sarbatori":"Fel principal",
 "salate":"Salate si boluri","salate si boluri":"Salate si boluri","bol":"Salate si boluri","boluri":"Salate si boluri",
 "paste":"Paste si orez","paste si orez":"Paste si orez",
 "gustari":"Gustari","aperitive":"Gustari","aperitive si gustari":"Gustari","tartinabile si pateuri":"Gustari",
 "deserturi":"Deserturi","desert":"Deserturi","desert rapid":"Deserturi","deserturi usoare":"Deserturi","torturi si prajituri":"Deserturi","aluaturi si dulciuri de casa":"Deserturi","creme si glazuri":"Deserturi","creme si jeleuri":"Deserturi","inghetate":"Deserturi","serbeturi":"Deserturi","sosuri pentru dulciuri":"Deserturi",
 "sosuri":"Sosuri si garnituri","garnituri":"Sosuri si garnituri",
 "paine si aluaturi":"Aluaturi si paine","paine si patiserie":"Aluaturi si paine",
 "muraturi si conserve":"Conserve","dulceturi":"Conserve","marmelade":"Conserve","peltele":"Conserve",
 "bauturi":"Bauturi","bauturi si smoothie-uri":"Bauturi","siropuri":"Bauturi","retete casnice":"Altele"};
function catNew(r){const c=String(r.categorie||"").trim();if(CAT12.includes(c))return c;const m=CATMAP[norm(c)];if(m)return m;
 const t=norm(r.titlu||"");
 if(/^(aluat|foi\b|foaie|glazur|crema de baza)/.test(t))return"Aluaturi si paine";
 if(/\b(sup[ae]|soup|ciorb|bors|potaj)/.test(t))return"Supe si ciorbe";if(/\b(cafea|ceai|smoothie|limonada|sirop|socata)/.test(t))return"Bauturi";
 if(DESERT.test(t)||/\b(gofre|orez cu lapte|dulce|caramel|mere coapte|compot|budinca|tort|prajitur)/.test(t))return"Deserturi";if(/\b(saratele|biscuiti sarati|pateu|hummus|zacusca)/.test(t))return"Gustari";
 if(/\b(salata|bol)\b/.test(t))return"Salate si boluri";if(/\b(paste|spaghete|orez|risotto|pilaf|taitei)/.test(t))return"Paste si orez";if(/\b(omleta|terci|granola)/.test(t))return"Mic dejun";
 if(/\b(paine|lipii|aluat)/.test(t))return"Aluaturi si paine";return c&&c!=="Retetele mele"?"Fel principal":"Altele"}
/* muta o reteta pe categoriile noi; intoarce true daca a schimbat ceva */
function catFix(r){if(!r||CAT12.includes(r.categorie))return false;const o=String(r.categorie||"").trim(),n=catNew(r);if(o&&o!=="Retetele mele"&&!r.capitol)r.capitol=o;r.categorie=n;return true}
const TDEF=[{n:"traditional romanesc",t:"bucatarie"},{n:"asiatic",t:"bucatarie"},{n:"vegan",t:"dieta"},{n:"vegetarian",t:"dieta"},{n:"high-protein",t:"dieta",auto:"protein"},{n:"keto",t:"dieta",auto:"keto"},{n:"gluten-free",t:"dieta",auto:"gluten"},{n:"meal-prep",t:"metoda"},{n:"air fryer",t:"metoda"},{n:"one pot",t:"metoda"},{n:"high-volume",t:"dieta"},{n:"de post",t:"dieta"},{n:"Craciun si Anul Nou",t:"ocazie"},{n:"Paste",t:"ocazie"},{n:"eveniment",t:"ocazie"}];
let TAGS;try{TAGS=JSON.parse(LS("rtags"))}catch(e){dbg(e)}if(!Array.isArray(TAGS)||!TAGS.length)TAGS=JSON.parse(JSON.stringify(TDEF));
/* 5.0.0: eticheta "de post" si etichetele de ocazie (Craciun si Anul Nou, Paste, eveniment) erau pe retete, dar nu in lista din Setari */
if(LS("rtg5")!=="1"){["de post","Craciun si Anul Nou","Paste","eveniment"].forEach(n=>{if(!TAGS.some(t=>t.n===n)){const d=TDEF.find(t=>t.n===n);TAGS.push(JSON.parse(JSON.stringify(d)))}});LS("rtags",JSON.stringify(TAGS));LS("rtg5","1")}
const saveTags=()=>LS("rtags",JSON.stringify(TAGS));
/* 3.18.0: etichete noi (meal-prep, air fryer, one pot) adaugate o singura data la cei care au deja lista salvata; h=1 inseamna ascunsa (nu apare in filtre, carduri, alegere la generare; retetele o pastreaza) */
try{if(!localStorage.getItem("rtv")){["meal-prep","air fryer","one pot"].forEach(n=>{if(!TAGS.some(t=>norm(t.n)===norm(n)))TAGS.push({n,t:"dieta"})});localStorage.setItem("rtags",JSON.stringify(TAGS));localStorage.setItem("rtv","1")}}catch(e){dbg(e)}
/* 4.4.0, o singura data: meal-prep / air fryer / one pot trec la tipul nou "metoda" (daca nu le-ai schimbat tu tipul); eticheta gluten-free (sau "fara gluten") devine automata, iar cine nu o are o primeste */
try{if(!localStorage.getItem("rtv2")){TAGS.forEach(t=>{if(["meal-prep","air fryer","one pot"].includes(norm(t.n))&&t.t==="dieta")t.t="metoda"});
 const g=TAGS.find(t=>/^(gluten-free|fara gluten)$/.test(norm(t.n)));if(g)g.auto="gluten";else TAGS.push({n:"gluten-free",t:"dieta",auto:"gluten"});
 localStorage.setItem("rtags",JSON.stringify(TAGS));localStorage.setItem("rtv2","1")}}catch(e){dbg(e)}
/* 4.8.0, o singura data: eticheta high-volume (portii mari, calorii putine) adaugata la cine are deja lista de etichete */
try{if(!localStorage.getItem("rtv3")){if(!TAGS.some(t=>norm(t.n)==="high-volume"))TAGS.push({n:"high-volume",t:"dieta"});localStorage.setItem("rtags",JSON.stringify(TAGS));localStorage.setItem("rtv3","1")}}catch(e){dbg(e)}
const hidT=()=>new Set(TAGS.filter(t=>t.h).map(t=>t.n));
const tagShown=a=>{const h=hidT();return a.filter(n=>!h.has(n))};
const tagNames=()=>TAGS.map(t=>t.n);
const canon=n=>{const k=norm(n),t=TAGS.find(x=>norm(x.n)===k||(x.al||[]).some(a=>norm(a)===k));return t?t.n:null};
const normTags=a=>[...new Set((a||[]).map(canon).filter(Boolean))];
/* 4.4.0: keto se judeca pe carbohidrati neti (carbohidrati minus fibre, fibrele calculate din Info); gluten-free = niciun ingredient cu gluten in lista. Rezultatul se tine minte pe reteta. */
const GLUT=/\b(faina(?! de (migdale|cocos|naut|orez|porumb|hrisca|in|susan|tapioca))|grau|gris|paste|spaghete|penne|fusilli|lasagna|taitei(?! de orez)|paine|pesmet|cuscus|bulgur|orz|arpacas|secara|tortilla|lipie|pita|naan|biscuit|blat|foi de (plac|lasagn|napolitan|tort|aluat)|covrig|chifl|bagheta|crutoane|sos de soia|miso|bere|seitan|musli|granola|cereale|ovaz|malt)/;
const aIngs=r=>(r.ingrediente||[]).map(x=>({c:x.c!=null?x.c:x.cantitate,u:x.u||x.unitate||"",n:String(x.n||x.nume||"")})).filter(x=>x.n);
function netCarb(r){const m=r.macro||{};if(m.carbo==null)return null;let fib=0;try{const q=micOf(aIngs(r),r.pna?1:(r.portii||1));if(q&&q.ok)fib=q.s[4]||0}catch(e){dbg(e)}return Math.max(0,m.carbo-fib)}
const hasGluten=r=>{const a=aIngs(r);return!a.length?null:a.some(x=>{const n=norm(x.n);return!/fara gluten/.test(n)&&GLUT.test(n)})};
const _atc=new WeakMap();
function autoTags(r){const m=r.macro||{},k=m.proteine+"|"+m.carbo+"|"+(r.ingrediente||[]).length+"|"+r.portii+"|"+TAGS.map(t=>t.auto?t.n+":"+t.auto:"").join(",");let o=_atc.get(r);if(o&&o.k===k)return o.v;
 const s=[];TAGS.forEach(t=>{if(t.auto==="protein"&&m.proteine!=null&&m.proteine>=25)s.push(t.n);if(t.auto==="keto"){const nc=netCarb(r);if(nc!=null&&nc<10)s.push(t.n)}if(t.auto==="gluten"&&hasGluten(r)===false)s.push(t.n)});
 _atc.set(r,{k,v:s});return s}
const tagPicker=(r,attr,note,fold)=>{const au=new Set(autoTags(r)),on=new Set(normTags(r.etichete));
 const bx=`<div class="chk">`+TAGS.filter(t=>!t.h||on.has(t.n)||au.has(t.n)).map(t=>`<label><input type="checkbox" ${attr}="${esc(t.n)}"${on.has(t.n)||au.has(t.n)?" checked":""}${au.has(t.n)?" disabled":""}>${esc(t.n)}${au.has(t.n)?" (automat)":""}</label>`).join("")+`</div>`;
 if(fold){const ch=TAGS.map(t=>t.n).filter(n=>on.has(n)||au.has(n));return `<details class="mre" data-tgd="1"><summary>${note||"Etichete"}: ${ch.length?esc(ch.join(", ")):"nicio eticheta"}</summary>${bx}</details>`}
 return `<div class="muted mt12 mb4" >${note||"Etichete"}</div>`+bx};

/* ===== FAVORITE SI CHEI DE IDENTIFICARE A RETETELOR ===== */
const getSaved=()=>{try{const j=JSON.parse(LS("rs")||"[]");return Array.isArray(j)?j:[]}catch(e){return[]}};
const getFav=()=>{try{const j=JSON.parse(LS("rfav"));return Array.isArray(j)?j:[]}catch(e){return[]}};
const isFav=k=>getFav().includes(k);
function favT(k,redraw){const u=undoMark(["rfav"]),had=getFav().includes(k);toggleFav(k);redraw();if(had)undoShow("Scos de la favorite.",u,redraw)}
function toggleFav(k){const f=getFav(),i=f.indexOf(k);if(i<0)f.push(k);else f.splice(i,1);LS("rfav",JSON.stringify(f))}
const bKey=r=>(r.sursa||"necunoscuta")+"|"+(r.nr!=null?r.nr:r.titlu);
/* 4.0.0: retetele salvate au un id stabil; cheia lor (favorite, jurnal, meniu, meal prep) e "salvat|<id>", nu titlul. O reteta inca nesalvata (fara id) foloseste titlul. */
const sKey=r=>"salvat|"+(r&&r.id?r.id:r.titlu);
const sid=()=>"r"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
/* 5.0.0: un singur model de reteta. O reteta AI (generata, adaptata sau salvata) devine reteta din Biblioteca, sursa "Retetele mele", cu:
   ingrediente n/c/u, pasi_carte = textul pasilor, ap = pasii pe aparat (temperatura, durata, treapta), sfaturi = fostele avertismente, ai:1, sid = id-ul vechi */
function aiToBook(r,nr){const ings=rawIngs("s",r).map(x=>Object.assign({n:String(x.n||""),c:x.c==null||x.c===""||isNaN(+x.c)?null:+x.c,u:String(x.u||"")},x.g?{g:x.g}:{})).filter(x=>x.n);
 const ap=(r.pasi||[]).filter(x=>x&&x.text),hasAp=ap.some(x=>x.aparat&&x.aparat!=="manual"||+x.durata_min>0);
 const o={sursa:"Retetele mele",nr,titlu:String(r.titlu||"Reteta AI"),categorie:"",portii:+r.portii>0?+r.portii:null,etichete:normTags(r.etichete),ingrediente:ings,pasi_carte:ap.map(x=>String(x.text)),sfaturi:(r.avertismente||[]).filter(x=>typeof x==="string"&&x.trim()),manual:true,ai:1};
 if(hasAp)o.ap=JSON.parse(JSON.stringify(ap));if(r.id)o.sid=r.id;if(r.din_carte)o.din_carte=r.din_carte;if(r.sursa_web)o.sursa_web=r.sursa_web;o.categorie=catNew(Object.assign({},o,{categorie:r.categorie||""}));return o}
const mineNr=st=>Math.max(0,...st.filter(x=>x&&x.sursa==="Retetele mele").map(x=>+x.nr||0))+1;
/* salveaza o reteta AI in Biblioteca si intoarce reteta salvata (aceeasi reteta salvata din nou nu se dubleaza) */
function aiSave(r){const st=getStored();const t=String(r.titlu||"");let ex=st.find(x=>x&&x.ai&&x.titlu===t&&JSON.stringify(x.pasi_carte)===JSON.stringify((r.pasi||[]).map(p=>String(p.text||""))));if(ex)return BOOK.find(x=>bKey(x)===bKey(ex))||ex;
 let tt=t,k=2;while(st.some(x=>x&&x.sursa==="Retetele mele"&&x.titlu===tt))tt=t+" ("+k++ +")";const o=aiToBook(Object.assign({},r,{titlu:tt}),mineNr(st));st.push(o);saveStored(st);BOOK=cl(st).map(fixRec);try{drawBook();updBS()}catch(e){dbg(e)}return BOOK.find(x=>bKey(x)===bKey(o))||o}
/* 5.0.0: migrare unica (si dupa restaurare sau sincronizare): retetele din "rs" intra in Biblioteca; cheile "salvat|id" devin "Retetele mele|nr" in favorite, notite, Meal prep si meniu */
async function v5Run(){let ch=0;try{const sv=getSaved(),st=getStored();
 if(sv.length){const map={};sv.forEach(r=>{if(!r||typeof r!=="object")return;const old=sKey(r);let ex=r.id?st.find(x=>x&&x.sid===r.id):null;
   if(!ex){ex=aiToBook(r,mineNr(st));st.push(ex);ch++}map[old]=bKey(ex)});
  const mv=k=>typeof k==="string"&&Object.prototype.hasOwnProperty.call(map,k)?map[k]:k;
  try{const f=JSON.parse(LS("rfav")||"[]");if(Array.isArray(f))LS("rfav",JSON.stringify([...new Set(f.map(mv))]))}catch(e){dbg(e)}
  try{const j=JSON.parse(LS("rnote")||"{}");if(j&&typeof j==="object"&&!Array.isArray(j)){const o={};Object.keys(j).forEach(k=>{o[mv(k)]=j[k]});LS("rnote",JSON.stringify(o))}}catch(e){dbg(e)}
  try{const l=JSON.parse(LS("rmp")||"[]");if(Array.isArray(l)){l.forEach(x=>{if(x&&x.s==="s"){x.k=mv(x.k);x.s="b"}});LS("rmp",JSON.stringify(l))}}catch(e){dbg(e)}
  try{const m=JSON.parse(LS("rmen")||"{}");if(m&&typeof m==="object"&&!Array.isArray(m)){Object.keys(m).forEach(d=>{const dm=m[d];if(dm&&typeof dm==="object")Object.keys(dm).forEach(sl=>{if(Array.isArray(dm[sl]))dm[sl].forEach(en=>{if(en&&en.s==="s"){en.k=mv(en.k);en.s="b"}})})});LS("rmen",JSON.stringify(m))}}catch(e){dbg(e)}
  LS("rs","[]");ch++}
 /* categoriile noi pe retetele tale si pe cele livrate pe care le-ai schimbat (cele neschimbate vin corectate cu actualizarea cartilor) */
 st.forEach(r=>{if(r&&(!r.liv||!shUnmod(r))&&catFix(r))ch++});
 if(ch){await saveStored(st);BOOK=st.length?cl(st).map(fixRec):BOOK}}catch(e){dbg(e)}
 v5Data();return ch}
/* 5.0.0: curatenie de date, o data: debara (litere mici, forma scoasa din nume), alimentele tale dublate in Info, cuptorul activ */
function v5Data(){try{
 const p=JSON.parse(LS("rp")||"[]");if(Array.isArray(p)){let ch=false;const FORMS=["conserva","congelat","uscat","proaspat"];
  p.forEach(x=>{if(!x||typeof x.n!=="string")return;let n=x.n.trim();const m=/^(.*?),\s*(conserva|congelat|uscat|proaspat)$/i.exec(n);if(m){n=m[1].trim();const f=m[2].toLowerCase();x.f=[...new Set([...(x.f||[]).filter(y=>y!=="altceva"),f])];ch=true}
   if(n!==x.n){x.n=n;ch=true}});
  if(ch){const mm=new Map();p.forEach(x=>{const k=norm(x.n);if(mm.has(k)){const o=mm.get(k);o.f=[...new Set([...(o.f||[]),...(x.f||[])])]}else mm.set(k,x)});LS("rp",JSON.stringify([...mm.values()]))}}
 }catch(e){dbg(e)}
 try{if(LS("rv5f")!=="1"){const fd=JSON.parse(LS("rfd")||"{}");if(fd&&typeof fd==="object"){let ch=false;const names=new Set(NUTRI.R.map(x=>norm(x[0])));
   Object.keys(fd).forEach(k=>{const v=fd[k],n=norm(v&&v.n||"").replace(/,\s*radacina$/,"").replace(/^rosii deshidratate$/,"rosii uscate");if(v&&v.src==="ai"&&names.has(n)){delete fd[k];ch=true}});if(ch){LS("rfd",JSON.stringify(fd));try{FD=fd}catch(e){dbg(e)}}}LS("rv5f","1")}}catch(e){dbg(e)}
 try{if(LS("rv516")!=="1"){const p=JSON.parse(LS("rp")||"[]");let ch=false;if(Array.isArray(p))p.forEach(x=>{if(x&&typeof x.n==="string"&&/\b(murat[aei]?|murate|muraturi)\b/.test(norm(x.n))&&Array.isArray(x.f)&&x.f.length===1&&x.f[0]==="conserva"){x.f=["altceva"];ch=true}});if(ch)LS("rp",JSON.stringify(p));LS("rv516","1")}}catch(e){dbg(e)}
 try{if(LS("rv5c")!=="1"){const c=AP.find(a=>a.id==="cuptor");if(c&&!c.on){c.on=1;saveAP()}LS("rv5c","1")}}catch(e){dbg(e)}}
/* id dedus din titlu la migrare: acelasi pe toate dispozitivele, ca sincronizarea sa nu dubleze retetele */
const sidT=t=>{let h=5381;const z=String(t==null?"":t);for(let i=0;i<z.length;i++)h=((h*33)^z.charCodeAt(i))>>>0;return"t"+h.toString(36)};
const sidNeed=()=>{try{const j=JSON.parse(localStorage.getItem("rs")||"[]");return Array.isArray(j)&&j.some(r=>r&&typeof r==="object"&&!r.id)}catch(e){return false}};
/* da id retetelor care nu au si muta cheile vechi "salvat|<titlu>" pe "salvat|<id>"; se poate rula oricand (pornire, dupa restaurare, dupa sincronizare) */
function sidRun(){try{let sv=JSON.parse(localStorage.getItem("rs")||"[]");if(!Array.isArray(sv))return 0;let n=0,chs=false;
 const ids=new Set(sv.filter(r=>r&&r.id).map(r=>r.id));
 /* o copie fara id a unei retete care are deja id-ul dedus din acelasi titlu (venita de pe un dispozitiv neactualizat) e aceeasi reteta */
 const before=sv.length;sv=sv.filter(r=>!(r&&typeof r==="object"&&!r.id&&ids.has(sidT(r.titlu))));if(sv.length!==before)chs=true;
 sv.forEach(r=>{if(!r||typeof r!=="object"||r.id)return;let id=sidT(r.titlu),k=2;while(ids.has(id))id=sidT(r.titlu)+"-"+k++;ids.add(id);r.id=id;n++;chs=true});
 if(chs)LS("rs",JSON.stringify(sv));
 const map={};sv.forEach(r=>{if(!r||!r.id)return;const o="salvat|"+r.titlu;if(!Object.prototype.hasOwnProperty.call(map,o))map[o]="salvat|"+r.id});
 const mv=k=>typeof k==="string"&&Object.prototype.hasOwnProperty.call(map,k)?map[k]:k,wr=(key,o,was)=>{const v=JSON.stringify(o);if(v!==was)LS(key,v)};
 try{const was=localStorage.getItem("rfav"),f=JSON.parse(was||"[]");if(Array.isArray(f))wr("rfav",[...new Set(f.map(mv))],was)}catch(e){dbg(e)}
 try{const was=localStorage.getItem("rnote"),j=JSON.parse(was||"{}");if(j&&typeof j==="object"&&!Array.isArray(j)){const o={};Object.keys(j).forEach(k=>{const nk=mv(k);if(!(nk in o)||nk===k)o[nk]=j[k]});wr("rnote",o,was)}}catch(e){dbg(e)}
 try{const was=localStorage.getItem("rmp"),l=JSON.parse(was||"[]");if(Array.isArray(l)){l.forEach(x=>{if(x&&x.s==="s")x.k=mv(x.k)});wr("rmp",l,was)}}catch(e){dbg(e)}
 try{const was=localStorage.getItem("rmen"),m=JSON.parse(was||"{}");if(m&&typeof m==="object"&&!Array.isArray(m)){Object.keys(m).forEach(d=>{const dm=m[d];if(dm&&typeof dm==="object")Object.keys(dm).forEach(sl=>{if(Array.isArray(dm[sl]))dm[sl].forEach(en=>{if(en&&en.s==="s")en.k=mv(en.k)})})});wr("rmen",m,was)}}catch(e){dbg(e)}
 return n}catch(e){return 0}}
/* ajutoare de data (folosite de meniu, jurnal, filtre); definite devreme, ca sa existe la prima randare */
const ZILE=["Duminica","Luni","Marti","Miercuri","Joi","Vineri","Sambata"],LUNI=["ian","feb","mar","apr","mai","iun","iul","aug","sep","oct","nov","dec"];
const dKey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const dFrom=k=>{const[a,b,c]=k.split("-").map(Number);return new Date(a,b-1,c)};
const dAdd=(k,n)=>{const d=dFrom(k);d.setDate(d.getDate()+n);return dKey(d)};
const monOf=k=>{const d=dFrom(k);d.setDate(d.getDate()-(d.getDay()+6)%7);return dKey(d)};
const dLab=k=>{const d=dFrom(k);return ZILE[d.getDay()]+" "+d.getDate()+" "+LUNI[d.getMonth()]};
const clampP=v=>{v=Math.round(+v);return isFinite(v)&&v>0?Math.min(99,v):1}; /* 4.1.1: portii intregi, 1-99 */
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
 <div class="row g8 mt8 mb8" ><button class="alt" data-jeat="1">Am mancat</button></div>
 <div class="muted mt8" >Notite</div><textarea aria-label="Notite" data-jnt="1" maxlength="600" rows="2" placeholder="ex: mai putina sare, 5 minute in plus...">${esc(n.nt||"")}</textarea></div>`}
function jrAct(d,k){
 if(d.jst!==undefined){const n=getNote(k);setNote(k,{st:+n.st===+d.jst?0:+d.jst});return true}
 if(d.jeat!==undefined){const r=BOOK.find(x=>bKey(x)===k);if(r)jrOpen({r,s:"b",day:dKey(new Date())});return false}
 return false}
const favBtn=(k,txt,st)=>`<button class="alt${isFav(k)?" on":""}" data-fav="${esc(k)}" aria-pressed="${isFav(k)}"${st||""}>${isFav(k)?"★":"☆"} ${txt||"Favorita"}</button>`;
function showRecipe(){RC["#reteta"]={r:cur,kind:"gen"};show("idei");renderRecipe("#reteta");const el=$("#reteta");if(el.firstChild)el.scrollIntoView({behavior:"smooth",block:"start"})}

var LBN=null;
function show(v){if(v!=="lista")LBN=null;toastHide();document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"));$("#v-"+v).classList.remove("hidden");
 document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));syncNav(v);if(v==="carti"&&($("#bd").value||pfOn()||_pfv!==(LS("rpf")||"")))drawBook();if(v==="lista"){const o=lOrphan();drawList();if(o.length)toast(orfTxt(o))}if(v==="meniu")drawMenu();if(v==="jurnal")drawJr();if(v==="ingr")drawIngr();if(v==="masuri")drawMas();if(v==="gatire")drawGat();if(v==="debara")drawPantry();if(v==="setari"){drawPf();drawPxc();drawMx();updPst();useDraw();renderCfg();renderTagCfg();updBS();setSub(LS("rk")?SUB:"cont")}bkBadge();if(v==="idei"){renderBox();drawOnb()}}
/* 3.10.0: bara cu 5 destinatii (Retete, Meniu, Cumparaturi, Debara, Mai mult); pilule doar la Retete si la Ghid nutritie */
const GROUPS={ret:["carti","idei"],men:["meniu","jurnal"],lis:["lista"],deb:["debara"],mai:["mai","ingr","masuri","gatire","setari"]},LASTV={},INFO=["ingr","masuri","gatire"];
const groupOf=v=>Object.keys(GROUPS).find(g=>GROUPS[g].includes(v))||"ret";
function syncNav(v){const g=groupOf(v);LASTV[g]=v;
 document.querySelectorAll("#gnav button").forEach(b=>{const on=b.dataset.g===g;b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on))});
 const pv=g==="men"?["meniu","jurnal"]:INFO.includes(v)?INFO:[];document.querySelectorAll("#nav button").forEach(b=>{b.hidden=!pv.includes(b.dataset.v)});$("#nav").hidden=!pv.length}
$("#gnav").onclick=e=>{const b=e.target.closest("button[data-g]");if(!b)return;const g=b.dataset.g,v=g==="mai"?"mai":(LASTV[g]||GROUPS[g][0]);show(v);window.scrollTo(0,0)};
$("#nokey").onclick=e=>{const b=e.target.closest("[data-go]");if(b){show(b.dataset.go);window.scrollTo(0,0)}};
$("#v-mai").onclick=e=>{const b=e.target.closest("[data-go]");if(!b)return;show(b.dataset.go);if(b.dataset.go==="setari")setHome();window.scrollTo(0,0)};
$("#nav").onclick=e=>{const v=e.target.dataset.v;if(!v)return;
 if(!$("#v-"+v).classList.contains("hidden")){if(v==="carti")drawBook()}
 show(v)};


/* ===== APARATE (profile, setari, alegere) ===== */
/* aparate */
function renderBox(){const sel=new Set([...document.querySelectorAll("#apbox input:checked")].map(i=>i.value));
 $("#apbox").innerHTML=AP.filter(a=>a.on).map(a=>`<label><input type="checkbox" value="${esc(a.id)}" ${sel.has(a.id)?"checked":""}>${tag(a.id)}${esc(a.nume)}</label>`).join("");apSum()}
function apSum(){const c=[...document.querySelectorAll("#apbox input:checked")].map(i=>i.value),L=c.length?AP.filter(a=>c.includes(a.id)):AP.filter(a=>a.on);$("#apsum").innerHTML="<b>Aparate pentru adaptare:</b> "+(L.map(a=>esc(a.id)).join(", ")||"niciunul")+(c.length?"":" <span class=\"muted\">(implicit)</span>");syncAdp()}
/* adaptarea la aparate e activa doar daca e selectat un robot cu moduri de gatire (MC sau Thermomix) */
function hasRobot(){const c=[...document.querySelectorAll("#apbox input:checked")].map(i=>i.value),L=c.length?AP.filter(a=>c.includes(a.id)):AP.filter(a=>a.on);return L.some(a=>a.id==="MC"||a.id==="Thermomix")}
function syncAdp(){const ok=hasRobot();document.querySelectorAll("[data-adp]").forEach(b=>{b.classList.toggle("gri",!ok)});document.querySelectorAll(".adphint").forEach(h=>h.hidden=ok)}
$("#apbox").addEventListener("change",apSum);$("#lbbox").addEventListener("change",lbSum);
function renderCfg(){
 $("#apcfg").innerHTML=AP.map((a,i)=>`<div class="apr apd"><div class="apn">${tag(a.id)}<b>${esc(a.nume)}</b></div><div class="apc"><label class="ck"><input type="checkbox" data-t="on" data-i="${i}" ${a.on?"checked":""}> activ</label><label class="ck"><input type="checkbox" data-t="backup" data-i="${i}" ${a.backup?"checked":""}> backup</label><button class="alt ico" data-x="${i}" aria-label="Sterge" title="Sterge">${IC_DEL}</button></div></div>`).join("")+
 `<details class="mre mt12" id="apnew" ><summary>+ Aparat nou</summary><label for="nn">Nume</label><input id="nn" placeholder="ex: Cuptor electric">
 <div class="row"><div><label for="nt1">Temp min (C)</label><input id="nt1" type="number"></div><div><label for="nt2">Temp max (C)</label><input id="nt2" type="number"></div></div>
 <label for="nm">Moduri (separate prin virgula)</label><input id="nm" placeholder="ex: copt, grill">
 <label for="no">Ce face / limite</label><input id="no" placeholder="ex: capacitate 30 l, fara abur">
 <label class="ck mt12 mb12" ><input id="nb" type="checkbox"> doar backup (folosit numai cand cel preferat nu poate)</label><button class="go" id="bAdd">Adauga aparat</button></details>`}
$("#apcfg").onclick=e=>{const d=e.target.dataset;
 if(d.x!==undefined){const b=e.target;if(armDel(b))return;AP.splice(d.x,1);saveAP();renderCfg()}
 if(e.target.id==="bAdd"){const n=$("#nn").value.trim();if(!n)return;let id=n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"ap"+AP.length;while(AP.some(a=>a.id===id))id+="2";
  AP.push({id,nume:n,on:1,backup:$("#nb").checked?1:0,tmin:+$("#nt1").value||0,tmax:+$("#nt2").value||0,moduri:$("#nm").value.trim(),note:$("#no").value.trim()});saveAP();renderCfg()}};
$("#apcfg").onchange=e=>{const d=e.target.dataset;if(d.t){AP[d.i][d.t]=e.target.checked?1:0;saveAP()}};
const apText=l=>l.map(a=>`- ${a.id} (${a.nume}, ${a.backup?"DOAR BACKUP":"preferat"}): ${a.note||""}. Moduri: ${a.moduri||"orice"}.${a.tmax?" Temp "+a.tmin+"-"+a.tmax+" C.":""}`).join("\n");
const pick=()=>{const s=[...document.querySelectorAll("#apbox input:checked")].map(i=>i.value);return s.length?AP.filter(a=>s.includes(a.id)):AP.filter(a=>a.on)};
const AV_RULE="avertismente: doar atentionari reale despre ingredientele si pasii din aceasta reteta, scurte; nu repeta ce spun etichetele si nu presupune alte forme ale ingredientelor decat cele scrise (mere inseamna mere).";
const RULE="Foloseste aparatele preferate oricand pot face pasul. Aparatele backup doar daca un aparat preferat nu poate face pasul (ex. apa fiarta, tigaie) sau daca nu exista altul.";

/* setari */
$("#key").value=LS("rk")||"";$("#m1").value=LS("rm1")||"claude-haiku-4-5";$("#m2").value=LS("rm2b")||"claude-haiku-4-5";
$("#bSet").onclick=()=>{LS("rk",$("#key").value.trim());keyUpd();LS("rm1",$("#m1").value.trim());LS("rm2b",$("#m2").value.trim());$("#bSet").textContent="Salvat";setTimeout(()=>$("#bSet").textContent="Salveaza setarile",1200)};

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
/* culori: verde = reusit/informatie, rosu = nu a mers sau ceva cere atentie (regula pentru toate mesajele scurte) */
const TBAD=/^(Nu |Eroare|Scrie |Alege |Titlul nu|Portii: scrie|Exista deja|Produsul e deja|Debaraua are deja|App key nu|Reteta asta nu|Adauga cheia|Conectarea Dropbox a fost anulata|Adaptarea cere|Ai peste|Sincroniz\w+ (a esuat|nu))/i;
function toast(m,bad){const el=$("#toast");m=String(m==null?"":m);el.textContent=m;el.classList.toggle("bad",bad===undefined?TBAD.test(m):!!bad);el.classList.remove("hidden");clearTimeout(TT);TT=setTimeout(()=>el.classList.add("hidden"),8000)}
function fail(e){$("#eIdei").textContent=e.message;if(e.message!=="Anulat.")toast(e.message,true)}

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
  const nou=Array.isArray(r.idei)?r.idei.filter(x=>x&&typeof x==="object"&&x.titlu):[];if(!nou.length)throw new Error(Array.isArray(r.idei)&&!r.idei.length?"Nu am gasit retete pentru aceste ingrediente si etichete. Incearca fara o eticheta sau cu alte ingrediente.":"Raspuns invalid de la model. Incearca din nou.");
  window._idei=old.concat(nou).slice(0,30);drawIdei();
 }catch(e){fail(e)}
 stop();bbs.forEach(x=>x.disabled=false);b.disabled=false;b.textContent=lbl;
}
function drawIdei(){
 const L=window._idei||[];
 $("#idei").innerHTML=`<div class="grid">`+L.map((x,i)=>`<div class="card"><h2>${esc(x.titlu)}</h2><div>${(x.aparate||[]).map(tag).join("")}<span class="muted">${esc(x.timp_total_min)} min</span></div><div>${lbH(x.etichete)}</div>${x.url?`<p class="muted mt4 mb4" >Sursa: <a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.sursa_nume||x.url)}</a></p>`:""}<p class="muted">Ai: ${esc((x.ai||[]).join(", "))||"-"}<br>Iti lipsesc: ${esc((x.lipsesc||[]).join(", "))||"nimic"}</p><button class="go" data-i="${i}" data-ai="1">Alege reteta</button></div>`).join("")+`</div>`+(L.length<30?`<button class="alt" id="bMore" data-ai="1">Mai multe idei (${L.length}/30)</button>`:`<p class="muted">Ai ajuns la 30 de idei. Schimba ingredientele pentru altele.</p>`);
}
$("#bIdei").onclick=()=>getIdeas(false,$("#bIdei"),false);
$("#bWeb").onclick=()=>getIdeas(false,$("#bWeb"),true);
$("#idei").onclick=e=>{if(e.target.id==="bMore")return getIdeas(true,e.target);const i=e.target.dataset.i;if(i!==undefined)makeRecipe(window._idei[i],e.target)};

/* reteta */
async function makeRecipe(idea,btn){
 btn.disabled=true;const stop=timer(btn,"Scriu reteta...");
 const u=`Reteta: "${idea.titlu}" pentru ${$("#por").value} portii.${idea.rezumat?` Se bazeaza pe o reteta de pe web (${idea.sursa_nume||"sursa"}). Rezumat: ${idea.rezumat} Reformuleaza in cuvintele tale si adapteaza la aparate; nu copia textul sursei.`:""} Ingrediente ale utilizatorului: ${$("#ing").value}.
${lblRule()}
${AV_RULE}
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
function stepHtml(s,showMin,par,noTag){
 return `<div class="step${noTag?" nt":""}">${noTag?"":`<div><div class="min">${showMin?(s._s<=0?"Start":"dupa "+Math.round(s._s)+" min"):""}</div>${tag(s.aparat)}</div>`}<div>${esc(s.text)}<div class="par">${par?"in paralel cu alt aparat - ":""}${esc(params(s))}</div>${check(s).map(x=>`<div class="warn">${esc(x)}</div>`).join("")}</div></div>`;
}
/* 3.15.0: acelasi ecran pentru orice reteta (carte, scrisa, generata, salvata): portii, ingrediente, mod de preparare, macro/micro din Info, etichete, jurnal */
function rcNut(ings,por){
 const L=macLocal({portii:por},por,ings);
 const mac=L.ok?`<p class="muted">Calculat din baza Info, aproximativ: ${esc(macTxt(L.o))} per portie (din ${L.ok} din ${L.n} ingrediente).</p>`:`<p class="muted">Nu pot calcula: ingredientele nu au date in Info.</p>`;
 return`<h2>Macro per portie</h2>${mac}${micHead({ingrediente:ings,portii:por})}`}
function renderRecipe(sel){
 const c=RC[sel];if(!c||!$(sel))return;if(c.edit){aiEditForm(sel);return}const r=c.r,tl=timeline(r.pasi||[]),tot=Math.max(0,...tl.map(s=>s._e)),ids=[...new Set(tl.map(s=>s.aparat))],plain=tl.length>0&&tl.every(s=>s.aparat==="manual"&&!(+s.durata_min));let body;
 const prev=c.bi!==undefined,ings=rawIngs("s",r),base=+r.portii>0?+r.portii:null,k=sKey(r),sn=base?(!prev&&BSC&&BSC.k===k?BSC.n:base):null,f=base?sn/base:1;
 if(plain)body=`<ol class="plst">`+tl.map(s=>`<li>${esc(s.text)}${params(s)?`<div class="par">${esc(params(s))}</div>`:""}${check(s).map(x=>`<div class="warn">${esc(x)}</div>`).join("")}</li>`).join("")+`</ol>`;
 else if(mode!=="ap"){const pr=s=>tl.some(o=>o!==s&&o.aparat!==s.aparat&&o.aparat!=="manual"&&s.aparat!=="manual"&&o._s<s._e&&o._e>s._s),anyp=tl.some(pr);body=`<ol class="plst">`+tl.map(s=>{const pa=[anyp?(s._s<=0?"Start":"dupa "+Math.round(s._s)+" min"):"",pr(s)?"in paralel cu alt aparat":"",params(s)].filter(Boolean).join(" - ");return`<li>${s.aparat!=="manual"?tag(s.aparat)+" ":""}${esc(s.text)}${pa?`<div class="par">${esc(pa)}</div>`:""}${check(s).map(x=>`<div class="warn">${esc(x)}</div>`).join("")}</li>`}).join("")+`</ol>`}
 else body=ids.map(a=>`<h2>${tag(a)}</h2>`+tl.filter(s=>s.aparat===a).map(s=>stepHtml(s,false,false,true)).join("")).join("");
 const top=c.kind==="saved"?`<div class="mb12"><button class="alt" data-rback="1">Inapoi la lista</button> ${favBtn(k)} ${recBtns()}</div>`:`<div class="mb12">${recBtns()}</div>`;
 const save=c.kind==="gen"?`<button class="go m0" id="bSave" >Salveaza</button>`:"";
 const tg=plain?"":`<div class="acts mb8"><button class="alt${mode!=='ap'?' on':''}" aria-pressed="${mode!=='ap'}" data-m="pasi">Pasi</button><button class="alt${mode==='ap'?' on':''}" aria-pressed="${mode==='ap'}" data-m="ap">Pe aparat</button></div>`;
 const orig=r.din_carte?(()=>{const o=BOOK.find(x=>x.titlu===r.din_carte&&(x.pasi_carte||[]).length);return o?`<details class="mre"><summary>Pasii originali din carte</summary><ol>${o.pasi_carte.map(x=>`<li>${esc(x)}</li>`).join("")}</ol></details>`:""})():"";
 $(sel).innerHTML=top+`<div class="card"><h2>${esc(r.titlu)}</h2><div class="muted">${esc(r.portii)} portii${plain?"":" - aprox. "+Math.round(tot)+" min"}</div>${r.din_carte?`<div class="muted">Adaptata din: ${esc(r.din_carte)} (reteta din carte ramane neschimbata)</div>`:""}<div class="mt8">${lbH(r.etichete)}</div>${r.sursa_web&&safeUrl(r.sursa_web.url)?`<div class="muted">Inspirata de: <a href="${esc(r.sursa_web.url)}" target="_blank" rel="noopener noreferrer">${esc(r.sursa_web.nume||r.sursa_web.url)}</a> (adaptata, nu copiata)</div>`:""}
 ${(r.avertismente||[]).length?`<ul class="muted">${r.avertismente.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}
 <div class="acts">${save}<button class="${save?"alt":"go"}" data-cook="1">Mod gatit</button><button class="alt" data-mn="1">Adauga la meniu</button>${mpBtn("s",r)}</div><details class="mre"><summary>Mai multe actiuni</summary><div class="acts">${cumBtn(r.titlu,"cum")}</div></details>
 <h2 class="mt16">Ingrediente</h2>${base&&!prev?sclHtml(base,sn,"reteta"):""}<ul class="ing">${ingHtml({ingrediente:ings},f)}</ul>
 <h2>Mod de preparare</h2>${tg}${body}${orig}
 ${prev||!ings.length?"":rcNut(ings,base||1)}
 <div class="bsec">${tagPicker(r,"data-tgr",c.kind==="gen"?"Etichete (se salveaza odata cu reteta)":"Etichete",true)}${c.kind!=="gen"?jrHtml(k):""}</div></div>`;
}
/* 4.1.1: peste 200 de retete salvate se sterg cele mai vechi nefolosite; favoritele si cele din meniu sau Meal prep raman */
function svTrim(l){if(l.length<=200)return l;const keep=new Set(getFav());getMP().forEach(x=>keep.add(x.k));const m=getMen();Object.keys(m).forEach(d=>SLOTS.forEach(([s])=>(m[d][s]||[]).forEach(en=>{if(en.k)keep.add(en.k)})));
 let n=0;for(let i=l.length-1;i>0&&l.length>200;i--){if(!keep.has(sKey(l[i]))){l.splice(i,1);n++}}
 if(n)toast("Ai peste 200 de retete salvate: "+(n===1?"cea mai veche nefolosita a fost stearsa":"cele mai vechi "+n+" nefolosite au fost sterse")+". Favoritele si cele din meniu raman.");return l}
/* 5.0.0: reteta generata se salveaza in Biblioteca, la "Retetele mele" (filtrul "Ale mele") */
function saveGen(btn){const r=JSON.parse(JSON.stringify(cur));r.etichete=normTags(r.etichete);const o=aiSave(r);if(btn)btn.textContent="Salvat";toast("Salvata in Biblioteca, la Ale mele: "+o.titlu+".");return o}
/* 4.29.0: "Editeaza reteta" si pe retetele AI (generate sau salvate): acelasi formular ca la celelalte retete (titlu, portii, categorie, ingrediente, pasi) */
function aiEditForm(sel){const c=RC[sel],r=c.r,cats=[...new Set([...BOOK.map(x=>x.categorie),r.categorie,"Retetele mele","Desert"].filter(Boolean))].sort();
 const ing=ingText((r.ingrediente||[]).map(x=>({c:x.cantitate===""||x.cantitate==null||isNaN(+x.cantitate)?null:+x.cantitate,u:x.unitate||"",n:x.nume,g:x.g})));
 $(sel).innerHTML=`<div class="bv" data-aed="1"><div class="mb12"><button class="alt" data-eaicx="1">Anuleaza</button></div><div class="card"><h2>Editeaza: ${esc(r.titlu)}</h2>
 <label for="ea-t">Titlu</label><input id="ea-t" data-ea="titlu" value="${esc(r.titlu)}" maxlength="120">
 <div class="row"><div><label for="ea-p">Portii</label><input id="ea-p" data-ea="portii" type="text" inputmode="numeric" maxlength="3" value="${esc(r.portii==null?"":r.portii)}"></div><div><label for="ea-c">Categorie</label><select id="ea-c" data-ea="categorie"><option value="">Nespecificata</option>${cats.map(x=>`<option${x===r.categorie?" selected":""}>${esc(x)}</option>`).join("")}</select></div></div>
 <label for="ea-i">Ingrediente (unul pe linie)</label><textarea id="ea-i" data-ea="ing" rows="8">${esc(ing)}</textarea>
 <label for="ea-s">Mod de preparare (un pas pe linie)</label><textarea id="ea-s" data-ea="pasi" rows="8">${esc((r.pasi||[]).map(x=>x.text).join("\n"))}</textarea>
 <p class="muted mt8 mb0">Pasii pe aparat isi pastreaza setarile (temperatura, durata) cat timp ii editezi pe loc; un pas nou e manual.</p>
 <label for="ea-o">Observatii (una pe linie; sterge ce nu e corect)</label><textarea id="ea-o" data-ea="obs" rows="3">${esc((r.avertismente||[]).filter(x=>typeof x==="string").join("\n"))}</textarea>
 <div class="acts"><button class="go" data-eaiok="1">Salveaza</button><button class="alt" data-eaicx="1">Anuleaza</button></div></div></div>`}
function aiEditSave(sel){const c=RC[sel],r=c.r,g=k=>$(sel).querySelector(`[data-ea=${k}]`).value;
 const t=g("titlu").trim();if(!t){toast("Titlul nu poate fi gol.");return}
 const pp=g("portii").trim(),pn=Math.round(+pp);if(pp===""||!(pn>=1&&pn<=200)){toast("Portii: scrie un numar intre 1 si 200.");return}
 const lines=g("pasi").split("\n").map(x=>x.trim()).filter(Boolean);if(!lines.length){toast("Scrie cel putin un pas.");return}
 const ings=parseIngText(g("ing"));if(!ings.length){toast("Scrie cel putin un ingredient.");return}
 const old=r.pasi||[],used=new Set(),out=new Array(lines.length);
 lines.forEach((x,j)=>{const m=old.findIndex((o,q)=>!used.has(q)&&o.text===x);if(m>=0){used.add(m);out[j]=old[m]}});
 lines.forEach((x,j)=>{if(out[j])return;if(old[j]&&!used.has(j)){used.add(j);out[j]=Object.assign({},old[j],{text:x})}});
 const ids=new Set();lines.forEach((x,j)=>{if(!out[j])out[j]={text:x,aparat:"manual"};let id=out[j].id;if(!id||ids.has(id)){id="p"+(j+1);while(ids.has(id))id+="x"}ids.add(id);out[j]=Object.assign({},out[j],{id})});
 out.forEach(s=>{if(Array.isArray(s.depinde_de))s.depinde_de=s.depinde_de.filter(x=>ids.has(x)&&x!==s.id)});
 const k0=sKey(r);r.titlu=t;r.portii=pn;if(g("categorie"))r.categorie=g("categorie");else delete r.categorie;
 r.ingrediente=ings.map(x=>({nume:x.n,cantitate:x.c==null?"":x.c,unitate:x.u||"",...(x.g?{g:x.g}:{})}));r.pasi=out;
 {const ob=nd(g("obs")).split("\n").map(x=>x.trim()).filter(Boolean);if(ob.length)r.avertismente=ob;else delete r.avertismente}
 if(c.kind!=="gen"){const l=getSaved(),i=l.findIndex(x=>sKey(x)===k0);if(i>=0){l[i]=r;LS("rs",JSON.stringify(l))}}
 c.edit=false;renderRecipe(sel);toast("Reteta a fost salvata.")}
function rcClick(e,sel){const c=RC[sel];if(!c)return false;if(c.edit){const d0=e.target.dataset;if(d0.eaicx!==undefined){c.edit=false;renderRecipe(sel);return true}if(d0.eaiok!==undefined){aiEditSave(sel);return true}return true}if(e.target.dataset.edai!==undefined){c.edit=true;renderRecipe(sel);const el0=$(sel);if(el0.scrollIntoView)el0.scrollIntoView({block:"start"});return true}{const bt=e.target.closest&&e.target.closest("[data-rcp],[data-rsh]");if(bt){recAct("s",c.r,bt.dataset.rsh!==undefined?"s":"c");return true}}const d=e.target.dataset;
 if(c.kind!=="gen"&&jrAct(d,sKey(c.r))){renderRecipe(sel);return true}
 if(d.m){mode=d.m;renderRecipe(sel);return true}
 if(d.bsc!==undefined){const r=c.r,bs=+r.portii>0?+r.portii:null;if(bs){const k=sKey(r),cu=BSC&&BSC.k===k?BSC.n:bs,nn=d.bsc==="0"?bs:Math.min(200,Math.max(1,cu+(+d.bsc)));BSC=nn===bs?null:{k,n:nn}}renderRecipe(sel);return true}
 if(d.rback!==undefined){if(c.back)c.back();return true}
 if(d.fav!==undefined){favT(d.fav,()=>renderRecipe(sel));return true}
 if(e.target.id==="bSave"){cur=c.r;saveGen(e.target);return true}
 if(d.cook!==undefined){const r=c.r,bs=+r.portii>0?+r.portii:null,sc=bs&&c.bi===undefined&&BSC&&BSC.k===sKey(r)?BSC.n:bs,ff=bs?sc/bs:1;cookOpen(r.titlu,cookSteps(r,"g"),ff!==1?ingBook({ingrediente:rawIngs("s",r)},ff):ingGen(r),ff!==1?`Lista de ingrediente e scalata la ${sc} portii (reteta: ${bs}). Cantitatile din textul pasilor sunt cele din reteta.`:"");return true}
 if(d.mpr!==undefined){cur=c.r;const r=saveGen(null);MD={mp:1,f:null,q:"",r:null,after:()=>renderRecipe(sel)};$("#mdlg").classList.remove("hidden");mpForm("b",r);return true}
 if(d.mn!==undefined){cur=c.r;const r=saveGen(null);menOpen({s:"b",r});return true}
 if(d.cum!==undefined){const r=c.r,bs=+r.portii>0?+r.portii:null,ff=bs&&c.bi===undefined&&BSC&&BSC.k===sKey(r)?BSC.n/bs:1;cartToggle(r.titlu,rawIngs("s",r).map(x=>({c:x.c!=null?+(x.c*ff).toFixed(2):null,u:x.u,n:x.n,g:x.g})),()=>renderRecipe(sel));return true}
 return false}
function rcChange(e,sel){const c=RC[sel],n=e.target.dataset.tgr;if(c&&c.kind!=="gen"&&e.target.dataset.jnt!==undefined){setNote(sKey(c.r),{nt:e.target.value.slice(0,600)});return true}
 if(!c||n===undefined)return false;
 const a=new Set(normTags(c.r.etichete));e.target.checked?a.add(n):a.delete(n);c.r.etichete=[...a];
 if(c.kind==="saved"){const l=getSaved(),i=l.findIndex(x=>sKey(x)===sKey(c.r));if(i>=0){l[i].etichete=c.r.etichete;LS("rs",JSON.stringify(l))}}
 renderRecipe(sel);return true}
$("#reteta").onclick=e=>{rcClick(e,"#reteta")};
$("#reteta").onchange=e=>{rcChange(e,"#reteta")};
/* 5.0.0: pagina "Colectia mea" nu mai exista: retetele tale sunt in Biblioteca (filtrele Ale mele, Favorite si Cos) */
function renderSaved(){show("carti")}
const lbH=a=>tagShown(normTags(a)).map(x=>`<span class="lb">${esc(x)}</span>`).join("");
function lblRule(){const s=[...document.querySelectorAll("#lbbox input:checked")].map(i=>i.value),isC=n=>{const t=TAGS.find(x=>x.n===n);return t&&t.t==="bucatarie"},c=s.filter(isC),d=s.filter(x=>!isC(x));
 return (c.length?`Bucatarie: ${c.join(" sau ")}. `:"")+(d.length?`Fiecare reteta trebuie sa respecte TOATE: ${d.join(", ")}. `:"")+`Campul etichete: doar valori din [${TAGS.filter(t=>!t.h).map(t=>t.n).join(", ")}], doar cele care se potrivesc cu adevarat.`}
function lbSum(){const n=document.querySelectorAll("#lbbox input:checked").length;$("#lbsum").innerHTML="<b>Etichete</b> "+(n?`<span class="muted">(${n} ${n===1?"activa":"active"})</span>`:`<span class="muted">(toate)</span>`)}
function renderTagUI(){
 const sel=new Set([...document.querySelectorAll("#lbbox input:checked")].map(i=>i.value));
 $("#lbbox").innerHTML=TAGS.filter(t=>!t.h).map(t=>`<label><input type="checkbox" value="${esc(t.n)}" ${sel.has(t.n)?"checked":""}>${esc(t.n)}</label>`).join("");lbSum();
 try{drawBook()}catch(e){dbg(e)}}
function renderTagCfg(){
 $("#tgl").innerHTML=TAGS.map((t,i)=>`<div class="apr"><input data-tn="${i}" value="${esc(t.n)}" aria-label="Nume eticheta" style="flex:1;min-width:0"><select data-tt="${i}" aria-label="Tip" class="wauto"><option value="bucatarie"${t.t==="bucatarie"?" selected":""}>bucatarie</option><option value="dieta"${t.t!=="bucatarie"&&t.t!=="metoda"&&t.t!=="ocazie"?" selected":""}>dieta</option><option value="metoda"${t.t==="metoda"?" selected":""}>metoda</option><option value="ocazie"${t.t==="ocazie"?" selected":""}>ocazie</option></select><label class="muted"><input type="checkbox" data-th="${i}"${t.h?"":" checked"}> Afiseaza</label><button class="alt ico" data-tx="${i}" aria-label="Sterge eticheta" title="Sterge">${IC_DEL}</button></div>`).join("")+
 `<p class="muted">Bucatarie: alternative la generarea ideilor (romanesc sau asiatic). Dieta si metoda: se aplica toate odata (vegan si keto; meal-prep, air fryer, one pot). Ocazie: Craciun si Anul Nou, Paste, eveniment. Etichetele automate se pun singure: high-protein (cel putin 25 g proteine pe portie), keto (sub 10 g carbohidrati neti pe portie, adica fara fibre) si gluten-free (niciun ingredient cu gluten in lista; nu tine cont de urme sau de contaminare, deci verifica eticheta produselor daca ai boala celiaca). Afiseaza: debifeaza o eticheta ca sa nu mai apara in filtre, pe carduri si la alegerea ideilor (retetele o pastreaza). Redenumirea sau stergerea se aplica in toate retetele: idei, salvate si biblioteca.</p>
 <h2 class="mt12">Eticheta noua</h2><div class="apr"><input id="tnn" aria-label="Numele etichetei noi" placeholder="ex: fara gluten" style="flex:1;min-width:0"><select id="tnt" aria-label="Tipul etichetei noi" class="wauto"><option value="dieta">dieta</option><option value="bucatarie">bucatarie</option><option value="metoda">metoda</option></select><button class="alt" id="tAdd">Adauga</button></div><div id="tmsg" class="muted"></div>`}
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
 if(d.tt!==undefined){TAGS[+d.tt].t=e.target.value;saveTags();afterTags()}
 if(d.th!==undefined){const t=TAGS[+d.th];if(e.target.checked)delete t.h;else t.h=1;saveTags();afterTags()}};
$("#tgl").onclick=e=>{const b=e.target,d=b.dataset;
 if(d.tx!==undefined){if(armDel(b))return;
  const old=TAGS[+d.tx].n;TAGS.splice(+d.tx,1);saveTags();retag(old,null);afterTags();tmsg("Stearsa: "+old+". A fost scoasa din toate retetele.")}
 if(b.id==="tAdd"){const n=$("#tnn").value.trim().slice(0,40);if(!n)return;
  if(TAGS.some(t=>norm(t.n)===norm(n))){tmsg("Exista deja o eticheta cu acest nume.");return}
  TAGS.push({n,t:$("#tnt").value});saveTags();afterTags();tmsg("Adaugata: "+n+". Apare acum in toate filtrele si pe retete.")}};

/* ===== BIBLIOTECA MEA (retete din carti, filtre, incarcare) ===== */
let BOOK=[{"sursa":"Retete demo","nr":1,"titlu":"Omleta cu spanac si branza","categorie":"Mic dejun","portii":1,"etichete":["vegetarian"],"ingrediente":[{"c":3,"u":"","n":"oua"},{"c":60,"u":"g","n":"spanac proaspat"},{"c":30,"u":"g","n":"branza telemea"},{"c":5,"u":"ml","n":"ulei de masline"},{"n":"sare si piper dupa gust"}],"pasi_carte":["Bate ouale cu un praf de sare si piper.","Calieste uleiul intr-o tigaie antiaderenta si sote spanacul 1 minut, pana scade.","Toarna ouale peste spanac, presara branza maruntita si gateste la foc mic 3-4 minute.","Pliaza omleta in doua si serveste imediat."],"sfaturi":["Poti inlocui telemeaua cu mozzarella."]},{"sursa":"Retete demo","nr":2,"titlu":"Ciorba de legume","categorie":"Ciorbe","portii":4,"etichete":["vegan","traditional romanesc"],"ingrediente":[{"c":100,"u":"g","n":"morcovi"},{"c":200,"u":"g","n":"cartofi"},{"c":80,"u":"g","n":"telina"},{"c":80,"u":"g","n":"ceapa"},{"c":100,"u":"g","n":"ardei gras"},{"c":15,"u":"ml","n":"ulei de masline"},{"c":1500,"u":"ml","n":"apa"},{"n":"patrunjel verde, sare, piper"},{"c":100,"u":"ml","n":"bors"}],"pasi_carte":["Taie toate legumele cubulete.","Calieste uleiul, adauga ceapa si morcovul si lasa-le 3 minute.","Adauga restul legumelor si apa, fierbe 25 de minute.","Pune borsul, sare si piper, mai da un clocot si presara patrunjel."],"sfaturi":["Se poate pastra 3 zile la frigider."]},{"sursa":"Retete demo","nr":3,"titlu":"Salata de naut cu rosii","categorie":"Salate","portii":2,"etichete":["vegan"],"ingrediente":[{"c":240,"u":"g","n":"naut fiert"},{"c":200,"u":"g","n":"rosii"},{"c":150,"u":"g","n":"castravete"},{"c":40,"u":"g","n":"ceapa rosie"},{"c":10,"u":"ml","n":"ulei de masline"},{"c":15,"u":"ml","n":"zeama de lamaie"},{"n":"patrunjel, sare si piper dupa gust"}],"pasi_carte":["Scurge nautul si clateste-l.","Taie rosiile, castravetele si ceapa cubulete.","Amesteca totul cu uleiul, lamaia si condimentele.","Lasa 10 minute la rece inainte de servire."],"sfaturi":["Merge bine langa o felie de paine integrala."]},{"sursa":"Retete demo","nr":4,"titlu":"Piept de pui la cuptor cu cartofi","categorie":"Fel principal","portii":2,"etichete":[],"ingrediente":[{"c":300,"u":"g","n":"piept de pui"},{"c":400,"u":"g","n":"cartofi"},{"c":10,"u":"ml","n":"ulei de masline"},{"c":2,"u":"","n":"catei de usturoi"},{"c":2,"u":"g","n":"boia dulce"},{"n":"sare, piper si cimbru dupa gust"}],"pasi_carte":["Preincalzeste cuptorul la 200 de grade.","Taie cartofii felii groase si pieptul de pui in doua, apoi condimenteaza-le cu uleiul, usturoiul si ierburile.","Pune totul intr-o tava si coace 35-40 de minute, intorcand o data.","Lasa 5 minute inainte sa feliezi carnea."],"sfaturi":["Foloseste termometru: carnea e gata la 74 de grade in centru."]},{"sursa":"Retete demo","nr":5,"titlu":"Paste cu sos de rosii","categorie":"Fel principal","portii":null,"etichete":["vegetarian"],"ingrediente":[{"c":200,"u":"g","n":"paste"},{"c":400,"u":"g","n":"rosii in suc propriu"},{"c":2,"u":"","n":"catei de usturoi"},{"c":10,"u":"ml","n":"ulei de masline"},{"n":"busuioc, sare si piper dupa gust"}],"pasi_carte":["Fierbe pastele in apa cu sare dupa instructiunile de pe ambalaj.","Calieste usturoiul in ulei, adauga rosiile si lasa sa scada 12 minute.","Amesteca pastele cu sosul si serveste cu busuioc."],"sfaturi":[],"verifica":["numar de portii"]},{"sursa":"Retete demo","nr":6,"titlu":"Clatite cu iaurt","categorie":"Desert","portii":3,"etichete":["vegetarian"],"ingrediente":[{"c":120,"u":"g","n":"faina"},{"c":250,"u":"ml","n":"lapte"},{"c":1,"u":"","n":"ou"},{"c":5,"u":"ml","n":"ulei"},{"c":150,"u":"g","n":"iaurt grecesc"},{"n":"zahar vanilat dupa"},{"n":"gust"}],"pasi_carte":["Amesteca faina, laptele, oul si uleiul pana nu raman cocoloase.","Gateste cate o lingura de aluat intr-o tigaie incinsa, 1 minut pe fiecare parte.","Serveste cu iaurt."],"sfaturi":[],"verifica":["ingrediente_neclare"]}];
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
function bLab(r){return tagShown([...new Set([...normTags(r.etichete),...autoTags(r)])])}
/* 3.2.3: sursa retetei (carte, numar, adaptata din) intr-o singura linie, sub titlu, inainte de etichete: in Biblioteca, Colectia mea si reteta deschisa */
/* 3.3.0: Cos. Reteta mutata in cos primeste r.cos=true: ramane in biblioteca (cu jurnal, notite, favorite), dar nu mai apare in cautare, meniu, "De verificat" si "Propune-mi un meniu". Din cos: Restaureaza sau Sterge definitiv. */
const TRASH='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5"/></svg>';
const cosN=()=>BOOK.filter(r=>r.cos).length;
function cosSet(r,on){if(on)r.cos=true;else delete r.cos;return persistBook(r)}
function cosMove(r,redraw){if(!cosSet(r,true))return;redraw();undoShow("Mutata in cos: "+(r.titlu||"reteta")+".",{},()=>{cosSet(r,false);redraw()})}
/* confirmare in loc: butonul se inlocuieste cu X (renunta) si bifa (confirma); ramane pana alegi */
function cosAsk(btn,go,lab){const w=document.createElement("span");w.className="cosask";w.innerHTML=(lab?`<span class="muted">${lab}</span> `:"")+'<button type="button" class="alt cx" aria-label="Anuleaza" title="Anuleaza">&#10005;</button> <button type="button" class="go cv" aria-label="Confirma" title="Confirma">&#10003;</button>';btn.hidden=true;btn.after(w);
 w.querySelector(".cx").onclick=ev=>{ev.stopPropagation();w.remove();btn.hidden=false};w.querySelector(".cv").onclick=ev=>{ev.stopPropagation();w.remove();btn.hidden=false;go()}}
function cosDelete(rs,redraw){const keys=rs.map(bKey),u=undoMark(["rfav","rnote"]),old=getStored().slice();
 const st=getStored().filter(x=>!keys.includes(bKey(x)));saveStored(st);BOOK=st.length?st:BOOK0;
 try{const f=getFav().filter(k=>!keys.includes(k));LS("rfav",JSON.stringify(f));const n=getNotes();keys.forEach(k=>delete n[k]);LS("rnote",JSON.stringify(n))}catch(e){dbg(e)}
 redraw();undoShow(rs.length===1?"Stearsa definitiv: "+(rs[0].titlu||"reteta")+".":"Cos golit: "+rs.length+" retete sterse definitiv.",u,()=>{saveStored(old);BOOK=old.length?old:BOOK0;redraw()})}
const srcTxt=r=>(r.sursa==="Retetele mele"?(r.ai?"Generata cu AI, salvata la Ale mele":"Scrisa de tine"):"Din "+esc(r.sursa||"biblioteca")+(r.nr!=null&&r.nr!==""?", reteta "+esc(r.nr):""))+(r.din?" (adaptata din "+esc(r.din.sursa||"-")+(r.din.nr!==""&&r.din.nr!=null?", reteta "+esc(r.din.nr):"")+")":"");
/* ===== 4.2.0: timp total si dificultate =====
   r.timp (minute) si r.dif (usor / mediu / avansat) sunt scrise in cartile livrate si se pot corecta din "Editeaza reteta".
   Cand lipsesc (retete scrise de tine, generate, carti incarcate de mana), se estimeaza la afisare din pasi, cu aceeasi regula. r.activ = timp activ, unde e cunoscut. */
const T_WAIT=/frigider|congelator|la rece|peste noapte|sa se (aseze|ingroase|hidrateze|raceasca|intareasca)|odihn|dospi|marin/;
function stepMin(t){t=norm(t).replace(/(\d+)\s*-\s*(\d+)(?=\s*(?:de\s+)?(?:minute|minut|min|ore|ora|secunde|sec)\b)/g,"$2");let m=0;
 t.replace(/(\d+(?:[.,]\d+)?)\s*(?:de\s+)?(minute|minut|min|ore|ora|secunde|sec)\b/g,(_,n,u)=>{n=+n.replace(",",".");m+=/^or/.test(u)?n*60:/^sec/.test(u)?n/60:n;return""});
 if(/\bo ora\b/.test(t))m+=60;if(/jumatate de ora/.test(t))m+=30;if(/\bun minut\b/.test(t))m+=1;if(/peste noapte/.test(t))m=Math.max(m,480);
 if(/pe fiecare parte/.test(t))m*=2;return m}
const recSteps=r=>(r.pasi_carte&&r.pasi_carte.length)?r.pasi_carte.map(String):(Array.isArray(r.pasi)?r.pasi.map(x=>x&&typeof x==="object"?String(x.text||""):String(x||"")):[]);
function recTEst(r){const st=recSteps(r);if(!st.length)return null;
 if(+r.activ>0){const wt=st.filter(x=>T_WAIT.test(norm(x))).reduce((a,x)=>a+stepMin(x),0);return wt?Math.max(+r.activ,Math.round((+r.activ+wt)/5)*5):+r.activ}
 let m=Array.isArray(r.pasi)&&!(r.pasi_carte&&r.pasi_carte.length)&&r.pasi.some(x=>x&&+x.durata_min>0)?r.pasi.reduce((a,x)=>a+(+(x&&x.durata_min)||0),0):st.reduce((a,x)=>a+stepMin(x),0);
 const ni=(r.ingrediente||[]).filter(x=>{const n=norm(x.n||x.nume||""),u=norm(x.u||x.unitate||"");return n&&!/^(sare|piper|apa|ulei)\b/.test(n)&&!/^lingur/.test(u)}).length;
 return Math.max(5,Math.round((m+Math.min(20,3+1.5*ni))/5)*5)}
const _tc=new WeakMap();
function recT(r){if(+r.timp>0)return +r.timp;let o=_tc.get(r);const k=recSteps(r).length+"|"+(r.ingrediente||[]).length;if(!o||o.k!==k){o={k,v:recTEst(r)};_tc.set(r,o)}return o.v}
function recDEst(r,t){const st=recSteps(r);if(!st.length)return null;const x=norm(st.join(" ")+" "+(r.titlu||""));let s=st.length+(r.ingrediente||[]).length/3;
 if(/cuptor|air fryer/.test(x))s+=1;if(/perisoare|chiftel|aluat|framanta|rulada|ruleaza|bain-marie|tempereaza|blat|caramel|umple|impatureste|clatit/.test(x))s+=2;if((t||0)>90)s+=1;
 return s<=8?"usor":s<=12?"mediu":"avansat"}
const DIFS=["usor","mediu","avansat"];
const recD=r=>DIFS.includes(r.dif)?r.dif:recDEst(r,recT(r));
const tTxt=m=>m<60?m+" min":Math.floor(m/60)+" h"+(m%60?" "+(m%60)+" min":"");
/* "aprox." apare cat timp valoarea e estimata; dispare cand ai scris-o tu */
function tChips(r){const t=recT(r),d=recD(r);if(!t&&!d)return"";const own=(r.manual||r.corectata)&&+r.timp>0;
 return(t?`<span class="lb">${own?"":"aprox. "}${tTxt(t)}${+r.activ>0&&+r.activ<t?", "+esc(r.activ)+" min activ":""}</span>`:"")+(d?`<span class="lb">${esc(d)}</span>`:"")}
const srcLine=r=>`<div class="muted org">${srcTxt(r)}</div>`;
const bChips=r=>(r.categorie||tChips(r)?`<div class="mb4">${r.categorie?`<span class="lb catb">${esc(r.categorie)}</span>`:""}${tChips(r)}</div>`:"")+(bLab(r).length?`<div>${bLab(r).map(t=>`<span class="lb">${esc(t)}</span>`).join("")}</div>`:"");
/* contorul "N de verificat" se actualizeaza si fara sa redesenez lista (editorul sta in aceeasi zona) */
let _bnA=["",false];
/* 3.6.0: trei marcaje separate in r.verifica: ingrediente/text (vx), portii (vp), macro (vm) */
const PVR="numar de portii",PRT=new Set([PVR,"portii","portii_estimate"]),MCT=new Set(["macro","macro_neclar"]);
const vx=r=>(r.verifica||[]).filter(x=>!PRT.has(x)&&!MCT.has(x)),vpf=r=>(r.verifica||[]).some(x=>PRT.has(x)),vp=r=>vpf(r)||(r.portii==null&&!r.pna),vm=r=>(r.verifica||[]).some(x=>MCT.has(x));
const clrV=(r,S)=>{r.verifica=(r.verifica||[]).filter(x=>!S.has(x));if(!r.verifica.length)delete r.verifica};
function bnDraw(bd,usePan){const L=BOOK.filter(r=>!r.cos&&!r.nou),nv=L.filter(r=>vx(r).length).length;{const q=$("#bv");[["v","De verificat (ingrediente si text)",nv],["p","Portii de verificat",L.filter(vp).length],["m","Macro de verificat",L.filter(vm).length]].forEach(([k,t,n])=>{const o=q.querySelector(`[value=${k}]`);if(o)o.textContent=t+" ("+n+")"})}{const bq=$("#bvq");bq.hidden=!nv;bq.textContent="Parcurge retetele de verificat ("+nv+")"}{const bn=$("#bn"),t=(bd!==""&&!usePan?"Filtrul \"Din debara\" nu face nimic cat timp Debaraua e goala.":usePan?"Ce lipseste se calculeaza aproximativ (\"cartofi albi\" e acoperit de \"cartofi\"); verifica lista inainte sa cumperi.":"");bn.textContent=t;bn.hidden=!t}}
const updVC=()=>bnDraw(..._bnA);
const inSrc=(r,v)=>(r.sursa||"necunoscuta")===v,favOk=r=>(!BPL.f||isFav(bKey(r)))&&(!BPL.a||r.sursa==="Retetele mele"); /* 4.19.0: Favorite e doar pilula (BPL.f), nu si optiune in lista Carte */
const stOk=r=>{const v=$("#bv").value;return v===""||(v==="v"?vx(r).length>0:v==="p"?vp(r):v==="m"?vm(r):!r.verifica&&!vp(r))};
/* 4.2.0: pilule rapide deasupra Bibliotecii. Masa si "Sub 30 min" sunt filtre noi; "Am tot in debara" si "Favorite" apasa pe filtrele existente (Din debara, Carte), ca sa nu existe doua stari pentru acelasi lucru. */
let BPL={m:"",t:false,f:false,a:false,c:false};
/* 5.0.0: retetele Sanda Marin fara ingrediente (doar text) nu apar in liste, cu exceptia celor folosite (favorite, gatite, cu nota); Setari > Carti le poate arata */
const smAll=()=>LS("rsmall")==="1";
function smHid(r,nt){if(smAll()||!/sanda marin/i.test(r.sursa||"")||(r.ingrediente||[]).length)return false;const k=bKey(r);if(isFav(k))return false;const n=(nt||getNotes())[k];return!(n&&((n.h||[]).length||+n.st||n.nt))}
const smN=()=>{const nt=getNotes();return BOOK.filter(r=>!r.cos&&/sanda marin/i.test(r.sursa||"")&&!(r.ingrediente||[]).length&&(smAll()||smHid(r,nt))).length};
const bplSlot=r=>{const s=pxSlot(r)||pxAuto(r);return s==="cina"?"pranz":s};
const bplOk=r=>(!BPL.m||bplSlot(r)===BPL.m)&&(!BPL.t||(recT(r)||9999)<=30);
function bdSub(){const v=$("#bd").value;if(v==="")return"";
 if(!getPan().length)return`<div class="bsub"><span class="lab">Debaraua e goala, asa ca nu filtrez. <button type="button" class="lnk" data-bpl="deb">Adauga produse</button></span></div>`;
 return`<div class="bsub"><span class="lab">Lipsesc cel mult:</span>${[0,1,2,3].map(n=>`<button type="button" class="bpill${v===String(n)?" on":""}" data-bpl="d" data-v="${n}" aria-pressed="${v===String(n)}">${n}</button>`).join("")}</div>`}
function bplDraw(){const el=$("#bpl");if(!el)return;const b=(k,v,t,on)=>`<button type="button" class="bpill${on?" on":""}" data-bpl="${k}" data-v="${v}" aria-pressed="${on}">${t}</button>`;
 el.innerHTML=b("m","mic","Mic dejun",BPL.m==="mic")+b("m","pranz","Pranz / Cina",BPL.m==="pranz")+b("m","desert","Desert",BPL.m==="desert")+b("t","1","Sub 30 min",BPL.t)+b("p","1","Din debara",$("#bd").value!=="")+b("f","1","Favorite",BPL.f)+b("a","1","Ale mele",BPL.a)+(n=>`<button type="button" class="bpill${BPL.c?" on":""}${n?"":" dis"}" data-bpl="c" aria-pressed="${BPL.c}"${n?"":' aria-disabled="true"'}>Cos (${n})</button>`)(cosN())+bdSub()}
$("#bpl").onclick=e=>{const d=(e.target.closest("button")||{}).dataset;if(!d||!d.bpl)return;
 if(d.bpl!=="c"&&BPL.c)BPL.c=false;if(d.bpl==="m")BPL.m=BPL.m===d.v?"":d.v;else if(d.bpl==="t")BPL.t=!BPL.t;else if(d.bpl==="p")$("#bd").value=$("#bd").value===""?"0":"";else if(d.bpl==="d")$("#bd").value=d.v;else if(d.bpl==="deb"){document.querySelector("#gnav [data-g=deb]").click();return}else if(d.bpl==="f")BPL.f=!BPL.f;else if(d.bpl==="a")BPL.a=!BPL.a;else if(d.bpl==="c"){if(!cosN()&&!BPL.c){toast("Cosul e gol. Retetele mutate in cos apar aici, de unde le restaurezi sau le stergi definitiv.");return}BPL.c=!BPL.c}
 bReset()};
function drawBook(){
 if(!LIBREADY){$("#bres").innerHTML='<p class="muted">Se incarca biblioteca...</p>';return}
 const srcs=[...new Set(BOOK.filter(r=>!r.cos).map(r=>r.sursa||"necunoscuta"))],sel=$("#bs"),prev=sel.value;
 if(sel.dataset.k!==srcs.join("|")){sel.dataset.k=srcs.join("|");sel.innerHTML='<option value="">Toate cartile</option>'+srcs.map(x=>`<option>${esc(x)}</option>`).join("");sel.value=srcs.includes(prev)?prev:""}
 const cats=[...new Set(BOOK.filter(r=>!r.cos&&(!sel.value||inSrc(r,sel.value))&&favOk(r)).map(r=>r.categorie).filter(Boolean))].sort(),cs=$("#bc"),cp=cs.value; /* categoriile arata doar ce exista in cartea aleasa */
 if(cs.dataset.k!==cats.join("|")){cs.dataset.k=cats.join("|");cs.innerHTML='<option value="">Toate categoriile</option>'+cats.map(x=>`<option>${esc(x)}</option>`).join("");cs.value=cats.includes(cp)?cp:""}
 const sc0=sel.value,cat0=cs.value,bfs=$("#bf"),bfp=bfs.value; /* etichetele arata doar ce exista in cartea/categoria aleasa */
 const tg=[...new Set(BOOK.filter(r=>!r.cos&&(!sc0||inSrc(r,sc0))&&favOk(r)&&(!cat0||r.categorie===cat0)).flatMap(bLab))].sort((a,b)=>a.localeCompare(b,"ro"));
 if(bfs.dataset.k!==tg.join("|")){bfs.dataset.k=tg.join("|");bfs.innerHTML='<option value="">Toate</option>'+tg.map(x=>`<option>${esc(x)}</option>`).join("");bfs.value=tg.includes(bfp)?bfp:""}
 const q=qWords($("#bq").value),f=bfs.value;bplDraw();
 const bp=$("#bp").value;
 {const n=["#bs","#bc","#bf","#bv","#bj","#bp"].filter(s=>$(s).value).length,n2=["#bj","#bv"].filter(s=>$(s).value).length;$("#bfsum2").textContent=n2?"Mai multe filtre ("+n2+")":"Mai multe filtre";if(n2)$("#bflt2").open=true;$("#bfsum").textContent=n?"Filtre ("+n+(n===1?" activ)":" active)"):"Filtre"}
 if(BPL.c){const cs=BOOK.map((r,i)=>({r,i})).filter(x=>x.r.cos);if(!cs.length){BPL.c=false;bplDraw()}else{$("#bcnt").textContent="In cos: "+cs.length+(cs.length===1?" reteta":" retete");$("#bn").innerHTML="";
  $("#bres").innerHTML=`<div class="card"><p class="muted mt0 mb8">Retetele din cos nu apar in cautare, meniu si propuneri. Le restaurezi sau le stergi definitiv (se pierd si jurnalul, notitele si steaua).</p><button class="alt" data-cclr="1">Goleste cosul</button></div>`+cs.map(x=>`<div class="card"><h2>${ed(x.r.titlu)}</h2>${srcLine(x.r)}<div class="row g8 mt8"><button class="go m0" data-crest="${esc(bKey(x.r))}">Restaureaza</button><button class="alt ico m0" data-cdel="${esc(bKey(x.r))}" aria-label="Sterge definitiv ${esc(x.r.titlu)}" title="Sterge definitiv">${IC_DEL}</button></div></div>`).join("");return}}
 const bd=$("#bd").value,usePan=bd!==""&&getPan().length>0,bj=$("#bj").value,NT=getNotes(),lim60=dAdd(dKey(new Date()),-60);
 const jOk=r=>{if(!bj)return true;const n=NT[bKey(r)]||{},l=lastCooked(n);return bj==="4"?+n.st>=4:bj==="ok"?!!l:bj==="g0"?!l:!l||l<lim60};
 const l=BOOK.map((r,i)=>{const z=q.length?bScore(r,q):{s:0,h:0};return{r,i,sc:z.h,w:z.s,ms:usePan?missing(r):null}}).filter(x=>!x.r.nou&&!x.r.cos&&!smHid(x.r,NT)&&(!usePan||(x.ms.tot>0&&x.ms.miss.length<=+bd))&&jOk(x.r)&&(!bp||(bp==="ok"?!recPref(x.r).av.length:recPref(x.r).lk.length>0))&&(!q.length||x.sc>0)&&(!f||bLab(x.r).includes(f))&&(!sc0||inSrc(x.r,sc0))&&favOk(x.r)&&(!cat0||x.r.categorie===cat0)&&stOk(x.r)&&bplOk(x.r)).sort((a,b)=>usePan?(a.ms.miss.length-b.ms.miss.length)||(b.w-a.w)||(b.sc-a.sc):(b.w-a.w)||(b.sc-a.sc));
/* 3.4.0: retetele cu acelasi titlu (din orice carte, si din aceeasi) se grupeaza intr-un card; exemplarul principal e cel mai complet */
 const gk=r=>norm(r.titlu).replace(/[^a-z0-9]+/g," ").trim(),cmp=r=>(r.verifica?0:100)+((r.pasi_carte||[]).length?50:0)+Math.min((r.ingrediente||[]).length,20)+(r.macro&&r.macro.kcal!=null?5:0)+(r.portii!=null?3:0),gm=new Map();
 l.forEach((x,n)=>{const k=gk(x.r)||"#"+n;if(!gm.has(k))gm.set(k,[]);gm.get(k).push(x)});
 const ls=[...gm.values()].map(g=>{if(g.length===1)return g[0];const best=g.reduce((a,b)=>cmp(b.r)>cmp(a.r)?b:a);return Object.assign({},best,{others:g.filter(y=>y!==best)})});
 _bnA=[bd,usePan];bnDraw(bd,usePan);
 {const tot=new Set(BOOK.filter(r=>!r.cos&&!r.nou).map((r,n)=>gk(r)||"#"+n)).size,all=BOOK.filter(r=>!r.cos&&!r.nou).length;
 $("#bcnt").textContent="Rezultat: "+(ls.length===tot?ls.length+(ls.length===1?" reteta":" retete")+(all>tot?(all-tot===1?" (1 exemplar cu acelasi titlu este grupat)":" ("+(all-tot)+" exemplare cu acelasi titlu sunt grupate)"):""):ls.length+(ls.length===1?" reteta gasita":" retete gasite")+" din "+tot)+(usePan&&ls.length>1?", cele mai potrivite primele":"")+(BOOK===BOOK0?". Sunt retete demo: dispar cand incarci o carte sau scrii prima ta reteta.":"")}
 $("#bres").innerHTML=ls.length?ls.slice(0,BLIM).map(x=>`<div class="card"><h2>${ed(x.r.titlu)}</h2>${srcLine(x.r)}<div>${bChips(x.r)}</div>${jrLine(bKey(x.r))}${pfLine(x.r)}${x.ms?`<div class="miss${x.ms.miss.length?"":" ok"}">${x.ms.miss.length?"Iti lipsesc ("+x.ms.miss.length+"): "+esc(x.ms.miss.join(", ")):"Ai tot ce trebuie din debara"}</div>`:""}${(()=>{const t=`${q.length?"Potriviri: "+x.sc+"/"+q.length+" - ":""}${x.r.macro&&x.r.macro.kcal!=null?`~${esc(x.r.macro.kcal)} kcal, ${esc(x.r.macro.proteine??"?")} g proteine, ${esc(x.r.macro.carbo??"?")} g carbohidrati`:""}${x.r.verifica?" - verifica fisa":""}`;return t?`<p class="muted">${t}</p>`:""})()}${x.others?`<div class="muted mt8 mb12" >Mai e si in: ${x.others.map(o=>`<button type="button" class="lk" data-b="${o.i}">${esc(o.r.sursa||"necunoscuta")}${o.r.nr!=null&&o.r.nr!==""?", nr. "+esc(o.r.nr):""}${o.r.verifica?" (de verificat)":""}</button>`).join(" ")}</div>`:""}<button class="go" data-b="${x.i}">Deschide</button> ${favBtn(bKey(x.r),"Favorita")}</div>`).join("")+(ls.length>BLIM?`<div class="card"><button class="alt" data-bmore="1">Arata mai multe</button></div>`:""):'<p class="muted">Nicio reteta gasita. Incearca alt ingredient sau scoate filtrul.</p>';
}
function openBook(i,p,sel){sel=sel||"#bres";bi=i;if(p===undefined)p=BOOK[i].portii;
 const r=BOOK[i];if(EDIT&&EDIT.i===i&&EDIT.sel===sel){editForm(r,i,sel);return}
 const bk=bKey(r),base=+r.portii>0?+r.portii:null,sn=base?(BSC&&BSC.k===bk?BSC.n:base):null,f=base?sn/base:1,m=r.macro,L=a=>(a&&a.length)?a:null,pid="bp"+sel.slice(1);
 const ul=a=>L(a)?"<ul>"+a.map(x=>`<li>${ed(x)}</li>`).join("")+"</ul>":"";
 $(sel).innerHTML=`<div class="bv" data-bi="${i}"><div class="mb12"><button class="alt" data-bback="1">Inapoi la rezultate</button> ${favBtn(bKey(r))} ${recBtns()} <button class="alt cosb" data-cosb="1" aria-label="Muta in cos" title="Muta in cos">${TRASH}</button></div><div class="card"><h2>${ed(r.titlu)}</h2>${srcLine(r)}<div>${bChips(r)}</div>
 ${pfHtml(r)}
 ${(()=>{const v=vx(r),src=`${esc(r.sursa||"carte necunoscuta")}${r.nr!=null&&r.nr!==""?", reteta nr. "+esc(r.nr):""}`;return(v.length?`<div class="warn">Extragerea automata a acestei retete e nesigura (${esc(v.join(", "))}). Verifica in carte: ${src}. Daca difera, corecteaz-o din Mai multe actiuni > Editeaza reteta.</div>`:"")+(vpf(r)?`<div class="warn wp">Numarul de portii (${r.pna?"-":r.portii==null?"necunoscut":esc(r.portii)}) nu e confirmat. Verifica in carte: ${src}. Il confirmi scriind numarul in campul Portii, mai jos, si apasand butonul de salvare.</div>`:"")+(vm(r)?`<div class="warn wm">Macro-ul din carte e nesigur. Verifica in carte: ${src}. Marcajul dispare cand recalculezi macro-ul din Info sau il corectezi si salvezi.</div>`:"")})()}
 <div class="acts">${(r.pasi_carte||[]).length||(r.ap||[]).length?`<button class="go" data-cookb="1">Mod gatit</button>`:""}<button class="alt" data-mnb="1">Adauga la meniu</button>${mpBtn("b",r)}</div><details class="mre"><summary>Mai multe actiuni</summary><div class="acts">${cumBtn(r.titlu,"cumb")}<button class="alt" data-edit="1">Editeaza reteta</button>${r.manual?"":`<button class="alt" data-copyme="1">Salveaza ca reteta mea</button>`}${((r.pasi_carte||[]).length||(r.verifica&&r.text_brut))?`<button class="alt" data-adp="1" data-ai="1" ${hasRobot()?"":"disabled"}>Adapteaza la aparatele mele</button>`:""}</div></details>${((r.pasi_carte||[]).length||(r.verifica&&r.text_brut))?`<p class="muted adphint mt8 mb0" ${hasRobot()?"hidden":""} >Adaptarea e activa doar daca bifezi Thermomix sau Monsieur Cuisine in Idei, la Aparate pentru adaptare.</p>`:""}<label for="${pid}">Portii (reteta)</label><input id="${pid}" data-bp="1" type="number" min="1" max="200" value="${p==null?"":esc(p)}" placeholder="${r.pna?"nu se aplica":"necunoscut"}" style="max-width:140px">${r.portii==null?`<p class="muted mt8 mb0" >Fara numar de portii, valorile de macro sunt pentru toata reteta. Scrie numarul ca sa vezi macro pe portie.</p>`:""}
 <h2 class="mt16">Ingrediente</h2>${(r.ingrediente||[]).length?sclHtml(base,sn)+'':""}${(r.ingrediente||[]).length?`<ul class="ing">${ingHtml(r,f)}</ul>`:`<p class="muted">Reteta nu are o lista proprie de ingrediente. Cantitatile sunt in modul de preparare sau in reteta la care trimite.</p>`}
 <h2>Mod de preparare</h2>${r.ap&&r.ap.length?apHtml(r):`<ol>${(r.pasi_carte||[]).map(x=>`<li>${ed(x)}</li>`).join("")}</ol>`}${r.din_carte?`<p class="muted">Adaptata din: ${esc(r.din_carte)}</p>`:""}${r.sursa_web&&safeUrl(r.sursa_web.url)?`<p class="muted">Inspirata de: <a href="${esc(r.sursa_web.url)}" target="_blank" rel="noopener noreferrer">${esc(r.sursa_web.nume||r.sursa_web.url)}</a> (adaptata, nu copiata)</p>`:""}
 ${(m&&m.kcal!=null)||(r.ingrediente||[]).length?`<h2>Macro per portie</h2><div data-mac>${macHead(r,p)}</div><div data-macp aria-live="polite"></div>${micHead(r)}`:""}
 ${L(r.sfaturi)?"<h2>Sfaturi practice</h2>"+ul(r.sfaturi):""}${L(r.alergeni)?"<p><b>Alergeni:</b> "+esc(r.alergeni.join(", "))+"</p>":""}${L(r.variante)?"<p><b>Variante:</b></p>"+ul(r.variante):""}
 <div class="bsec">${tagPicker(r,"data-tgb","Etichete",true)}${jrHtml(bKey(r))}</div>
</div><div id="adp${sel.slice(1)}"></div></div>`;
 const key="#adp"+sel.slice(1),en=RC[key],ad=$(key);
 if(en&&(en.bi!==i||en.p!==p))RC[key]=null;
 if(ad){ad.onclick=e=>{e.stopPropagation();const c=RC[key];if(c)cur=c.r;rcClick(e,key)};ad.onchange=e=>{e.stopPropagation();rcChange(e,key)};if(RC[key])renderRecipe(key)}
}
/* 5.0.0: pasii pe aparat (ap) ai retetelor AI salvate, in ecranul unic al Bibliotecii: Pasi (cu aparatul si timpul) sau Pe aparat (grupati pe aparat) */
function apHtml(r){const tl=timeline(r.ap||[]),ids=[...new Set(tl.map(s=>s.aparat))];if(!tl.length)return"";
 const tg=`<div class="acts mb8"><button class="alt${mode!=='ap'?' on':''}" aria-pressed="${mode!=='ap'}" data-bm="pasi">Pasi</button><button class="alt${mode==='ap'?' on':''}" aria-pressed="${mode==='ap'}" data-bm="ap">Pe aparat</button></div>`;
 if(mode==="ap")return tg+ids.map(a=>`<h2>${tag(a)}</h2>`+tl.filter(s=>s.aparat===a).map(s=>stepHtml(s,false,false,true)).join("")).join("");
 const pr=s=>tl.some(o=>o!==s&&o.aparat!==s.aparat&&o.aparat!=="manual"&&s.aparat!=="manual"&&o._s<s._e&&o._e>s._s),anyp=tl.some(pr);
 return tg+`<ol class="plst">`+tl.map(s=>{const pa=[anyp?(s._s<=0?"Start":"dupa "+Math.round(s._s)+" min"):"",pr(s)?"in paralel cu alt aparat":"",params(s)].filter(Boolean).join(" - ");return`<li>${s.aparat!=="manual"?tag(s.aparat)+" ":""}${esc(s.text)}${pa?`<div class="par">${esc(pa)}</div>`:""}</li>`}).join("")+`</ol>`}
/* la editare, pasii pe aparat isi pastreaza setarile cat timp textul lor e acelasi (sau doar reformulat pe loc); un pas nou e manual */
function apSync(old,lines){old=old||[];const used=new Set(),out=new Array(lines.length);
 lines.forEach((x,j)=>{const m=old.findIndex((o,q)=>!used.has(q)&&o.text===x);if(m>=0){used.add(m);out[j]=old[m]}});
 lines.forEach((x,j)=>{if(out[j])return;if(old[j]&&!used.has(j)){used.add(j);out[j]=Object.assign({},old[j],{text:x})}});
 const ids=new Set();lines.forEach((x,j)=>{if(!out[j])out[j]={text:x,aparat:"manual"};let id=out[j].id;if(!id||ids.has(id)){id="p"+(j+1);while(ids.has(id))id+="x"}ids.add(id);out[j]=Object.assign({},out[j],{id})});
 out.forEach(z=>{if(Array.isArray(z.depinde_de))z.depinde_de=z.depinde_de.filter(x=>ids.has(x)&&x!==z.id)});return out}
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
${AV_RULE}
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
 catch(e){if(e.message!=="Anulat."){box.innerHTML='<div class="warn"></div>';box.firstChild.textContent=e.message;if(/cheia API/.test(e.message)){const kb=document.createElement("button");kb.className="alt";kb.dataset.gosub="cont";kb.textContent="Seteaza cheia";box.firstChild.appendChild(document.createTextNode(" "));box.firstChild.appendChild(kb)}toast(e.message,true)}}
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
let BSC=null;
function sclHtml(base,n,src){src=src||"carte";if(!base)return`<p class="muted">Ca sa scalezi cantitatile, scrie numarul de portii al retetei (campul Portii, mai sus).</p>`;
 return`<div class="scl"><span>Gatesc pentru</span><button class="alt" data-bsc="-1" aria-label="Mai putine portii" ${n<=1?"disabled":""}>-</button><b aria-live="polite">${n}</b><button class="alt" data-bsc="1" aria-label="Mai multe portii" ${n>=200?"disabled":""}>+</button><span>portii</span>${n!==base?`<button class="alt" data-bsc="0">Inapoi la ${base}</button>`:""}</div>${n!==base?`<p class="muted">Cantitatile din lista sunt scalate de la ${base} la ${n} portii. Cantitatile scrise in pasii de preparare si timpii raman cele din ${src==="carte"?"carte":"reteta"}.</p>`:""}${n/base>4?`<p class="mt4 mb0" style="color:var(--amb)">Gatesti de ${+(n/base).toFixed(1)} ori reteta. Verifica numarul de portii.</p>`:""}`}
function ingHtml(r,f){let g=null,o="";(r.ingrediente||[]).forEach(x=>{const gg=x.g||null;if(gg!==g){g=gg;if(g)o+=`<li class="gh"><b>${ed(g)}</b></li>`}
  if((r.ingrediente||[]).length>1&&isSec(x)){o+=`<li class="gh"><b>${ed(cap(String(x.n).replace(/[:.\s]+$/,"")))}</b></li>`;return}
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
 const noise=x=>/^(MACRO PER PORTIE|V\d+\s*\(|TIPS?\b|RE[T\u021a\u0162]ETA\s*\d+)/i.test(x)||/^(Calorii|Proteine|Carbohidra[t\u021b\u0163]i|Gr[\u0103a]simi|Fibre)\s*:?\s*[\d.,]+/i.test(x);
 const isIns=x=>/^INSTRUC[T\u021a\u0162]IUNI/i.test(x),q=x=>/^\(?\d/.test(x);
 const a=L.findIndex(q),b=L.findIndex(isIns);const ing=[];
 if(a>=0)for(let k=a;k<(b>=0?b:L.length);k++){if(!noise(L[k])&&!isIns(L[k]))ing.push(L[k])}
 const steps=[];let buf="",pre="";const flush=()=>{if(buf){steps.push(pre+buf);pre=""}buf=""};
 if(b>=0)for(let k=b;k<L.length;k++){const x=L[k];if(isIns(x)){flush();const v=x.match(/VARIANTA\s*(\d+)/i);pre=v?"Varianta "+v[1]+": ":"";continue}
  if(noise(x)||/^TIPS?:?$/i.test(x))continue;buf+=(buf?" ":"")+x;if(/[.!?:]$/.test(x))flush()}
 flush();return{ing,steps}}
function editForm(r,i,sel){const m=r.macro||{},cats=CAT12.includes(r.categorie)||!r.categorie?CAT12:CAT12.concat([r.categorie]),mv=k=>m[k]!=null?m[k]:"",gz=r.text_brut&&(!(r.ingrediente||[]).length||!(r.pasi_carte||[]).length)?guessFromText(r.text_brut):null,gI=gz&&!(r.ingrediente||[]).length?gz.ing:null,gS=gz&&!(r.pasi_carte||[]).length?gz.steps:null;
 $(sel).innerHTML=`<div class="bv" data-bi="${i}"><div class="mb12"><button class="alt" data-ecancel="1">Anuleaza</button></div>${VQ&&r.verifica?`<div class="card" style="margin-bottom:10px;background:var(--soft)"><b>De verificat: reteta ${VQ.pos+1} din ${VQ.keys.length}</b> (${esc(vx(r).map(x=>x.replace(/_/g," ")).join(", "))})<div class="row g8 mt8" ><button class="alt m0" type="button" data-vqskip="1" >Sari peste</button><button class="alt m0" type="button" data-vqstop="1" >Opreste</button></div></div>`:""}<div class="card"><h2>${r.nou?"Reteta noua":"Editeaza: "+esc(r.titlu)}</h2>${r.nou?"":`<p class="muted mt0 mb8" ><b>${r.din?"Adaptata din:":"Din:"}</b> ${r.din?esc(r.din.sursa||"carte necunoscuta")+(r.din.nr!==""&&r.din.nr!=null?", reteta nr. "+esc(r.din.nr):""):esc(r.sursa||"carte necunoscuta")+(r.nr!=null&&r.nr!==""?", reteta nr. "+esc(r.nr):"")}${(r.pagina||r.pag||r.page)?", pagina "+esc(r.pagina||r.pag||r.page):""}. Cauta in carte dupa acest numar si compara.</p>`}

 <label for="ef-t${i}">Titlu</label><input id="ef-t${i}" data-ef="titlu" value="${esc(r.titlu)}" maxlength="120"${r.nou?' placeholder="ex: Papanasi cu smantana"':""}>
 <div class="row"><div><label for="ef-p${i}">Portii (- = nu se aplica)</label><input id="ef-p${i}" data-ef="portii" type="text" inputmode="numeric" maxlength="3" placeholder="ex: 4 sau -" value="${r.pna?"-":esc(r.portii==null?"":r.portii)}"><div data-pcbox>${(r.verifica||[]).includes(PVR)?`<div class="warn mt8" >Numarul de portii nu e confirmat. <button class="alt mt4 mb0" type="button" data-pconf="1" >Confirma numarul de portii</button></div>`:""}</div></div><div><label for="ef-c${i}">Categorie</label><select id="ef-c${i}" data-ef="categorie">${cats.map(c=>`<option${c===r.categorie?" selected":""}>${esc(c)}</option>`).join("")}</select></div></div>
 <div class="row"><div><label for="ef-tm${i}">Timp total (minute)</label><input id="ef-tm${i}" data-ef="timp" type="number" min="1" max="2880" step="1" value="${esc(+r.timp>0?r.timp:"")}" placeholder="${recTEst(r)?"estimat: "+recTEst(r):"ex: 30"}"></div><div><label for="ef-df${i}">Dificultate</label><select id="ef-df${i}" data-ef="dif"><option value="">Estimata automat</option>${DIFS.map(d=>`<option${d===r.dif?" selected":""}>${d}</option>`).join("")}</select></div></div>
 ${(gI&&gI.length)||(gS&&gS.length)?`<div class="warn mt12 mb0" >Extragerea automata a esuat. Am completat de mai jos ce am detectat in textul paginii (${[gI&&gI.length?"ingrediente":"",gS&&gS.length?"pasi":""].filter(Boolean).join(" si ")}). Compara cu cartea si corecteaza; nu se salveaza pana nu apesi Salveaza.</div>`:""}<label for="ef-i${i}">Ingrediente (unul pe linie)</label><textarea id="ef-i${i}" data-ef="ing" rows="8" placeholder="200 g faina&#10;2 oua&#10;## Sos&#10;1 lingura smantana">${esc(gI&&gI.length?gI.join("\n"):ingText(r.ingrediente))}</textarea>
 <label for="ef-s${i}">Mod de preparare (un pas pe linie)</label><textarea id="ef-s${i}" data-ef="pasi" rows="8" placeholder="Amesteca faina cu ouale.&#10;Coace 30 de minute.">${esc(gS&&gS.length?gS.join("\n"):(r.pasi_carte||[]).join("\n"))}</textarea>${(r.ap||[]).length?`<p class="muted mt8 mb0">Pasii pe aparat isi pastreaza setarile (temperatura, durata) cat timp ii editezi pe loc; un pas nou e manual.</p>`:""}
 <label for="ef-sf${i}">Sfaturi (unul pe linie; sterge ce nu e corect)</label><textarea id="ef-sf${i}" data-ef="sfaturi" rows="3">${esc((r.sfaturi||[]).join("\n"))}</textarea>
 <div class="row" style="margin-top:12px;align-items:center;gap:8px"><button class="alt m0" type="button" data-emacl="1" >Calculeaza din Info</button><button class="alt m0" type="button" data-emac="1" data-ai="1" >Calculeaza macro</button><span class="muted">Per portie, din ingredientele de mai sus. "Din Info" foloseste datele salvate in aplicatie; AI estimeaza.</span></div><div data-mres aria-live="polite"></div>
 <div class="row"><div><label>kcal</label><input data-ef="kcal" type="number" step="any" value="${esc(mv("kcal"))}"></div><div><label>Proteine g</label><input data-ef="proteine" type="number" step="any" value="${esc(mv("proteine"))}"></div><div><label>Carbo g</label><input data-ef="carbo" type="number" step="any" value="${esc(mv("carbo"))}"></div><div><label>Grasimi g</label><input data-ef="grasimi" type="number" step="any" value="${esc(mv("grasimi"))}"></div></div>
 <div class="acts">${vx(r).length?'<button class="go" data-esave="v">Salveaza ca verificata</button><button class="alt" data-esave="1">Salveaza, raman de verificat</button>':'<button class="go" data-esave="1">Salveaza</button>'}<button class="alt" data-ecancel="1">Anuleaza</button>${r.manual&&!r.nou?'<button class="alt" data-edel="1">Sterge reteta</button>':""}</div></div></div>`}
/* ===== Calcul macronutrienti cu AI (doar la apasare), in editorul retetei ===== */
const MACK=["kcal","proteine","carbo","grasimi"],MACL={kcal:"kcal",proteine:"proteine",carbo:"carbohidrati",grasimi:"grasimi"};
const macTxt=o=>MACK.map(k=>o[k]!=null&&o[k]!==""?`${MACL[k]} ${o[k]}${k==="kcal"?"":" g"}`:null).filter(Boolean).join(", ")||"(nimic)";
function macLoc(bv){const g=k=>bv.querySelector(`[data-ef=${k}]`).value,box=bv.querySelector("[data-mres]"),pp=pParse(g("portii"));
 if(pp.bad||pp.na||pp.n==null){box.innerHTML='<div class="warn">Scrie mai intai numarul de portii (campul Portii de mai sus), ca sa calculez per portie.</div>';return}
 const ings=parseIngText(g("ing"));if(!ings.length){box.innerHTML='<div class="warn">Nu sunt ingrediente de calculat.</div>';return}
 const L=macLocal({ingrediente:ings,portii:pp.n},pp.n);if(!L.ok){box.innerHTML='<div class="warn">Nu am gasit date in Info pentru niciun ingredient. Foloseste AI sau completeaza manual.</div>';return}
 macApply(bv,L.o,[],"local");bv.dataset.msrc=L.ok+" din "+L.n;
 box.innerHTML=`<p class="muted mt8 mb8" >Calculat din Info: ${esc(macTxt(L.o))} per portie (${L.ok} din ${L.n} ingrediente).${L.miss.length?" Fara date: "+esc(L.miss.slice(0,6).map(m=>dn(m.x.n)).join(", "))+(L.miss.length>6?"...":"")+".":""} Valorile sunt in campurile de mai jos; se salveaza cand salvezi reteta.</p>`}
function macApply(bv,o,tags,src){delete bv.dataset.msrc;if(src==="local")delete bv.dataset.masrc;else bv.dataset.masrc="ai";MACK.forEach(k=>{const el=bv.querySelector(`[data-ef=${k}]`);if(el)el.value=o[k]!=null?o[k]:""});bv.dataset.stags=JSON.stringify(tags||[]);
 const au=autoTags({macro:o}),t=[...new Set([...(tags||[]),...au])];
 const box=bv.querySelector("[data-mres]");box.innerHTML=`<p class="muted mt8 mb8" >Completat: ${esc(macTxt(o))} (per portie).${t.length?" Etichete dupa salvare: "+esc(t.join(", "))+".":""} Verifica valorile si apasa Salveaza.</p>`}
async function macCalc(bv,btn){const g=k=>bv.querySelector(`[data-ef=${k}]`).value,box=bv.querySelector("[data-mres]");
 if(!LS("rk")){box.innerHTML='<div class="warn">Adauga cheia API in Setari ca sa folosesti calculul.</div>';return}
 const ings=parseIngText(g("ing")).filter(x=>x.n);if(!ings.length){box.innerHTML='<div class="warn">Scrie mai intai ingredientele.</div>';return}
 const por=Math.max(1,+g("portii")||1),old={};MACK.forEach(k=>{const v=g(k);old[k]=v===""?null:+v});
 const names=TAGS.filter(t=>!t.auto&&!t.h).map(t=>t.n);
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
  const un=uns.length?`<p class="warn mt8 mb8" >Estimat pentru: ${esc(uns.join(", "))}.</p>`:"";
  if(!had)macApply(bv,o,tags);
  if(!had&&uns.length)box.innerHTML+=un;
  if(had)box.innerHTML=`<div class="card" style="margin:8px 0;background:var(--soft)"><b>Exista deja valori.</b><p class="mt8 mb8">Acum: ${esc(macTxt(old))}<br>Calculat: ${esc(macTxt(o))}</p>${un}<div class="row g8" ><button class="go m0" type="button" data-emacok="1" >Foloseste valorile calculate</button><button class="alt m0" type="button" data-emacno="1" >Pastreaza ce am</button></div></div>`}
 catch(e){box.innerHTML=`<div class="warn">${esc(e.message||"Eroare")}</div>`}
 finally{btn.disabled=false;btn.textContent="Calculeaza macro"}}
function editSave(bv,i,sel,verif){const r=BOOK[i],g=k=>bv.querySelector(`[data-ef=${k}]`).value;
 const t=g("titlu").trim();if(!t){toast("Titlul nu poate fi gol.");return}
 {const pp=pParse(g("portii"));if(pp.bad){toast("Portii: scrie un numar (1-200) sau - daca nu se aplica.");return}const op=r.portii,opn=r.pna;r.portii=pp.na?null:pp.n;if(pp.na)r.pna=true;else delete r.pna;if(op!==r.portii||!!opn!==!!r.pna)clrV(r,PRT)}r.titlu=t;if(g("categorie"))r.categorie=g("categorie");
 {const tv=String(g("timp")).trim(),n=Math.round(+tv);if(tv==="")delete r.timp;else if(n>0&&n<=2880)r.timp=n;const dv=g("dif");if(DIFS.includes(dv))r.dif=dv;else delete r.dif}
 r.ingrediente=parseIngText(g("ing"));r.pasi_carte=g("pasi").split("\n").map(x=>x.trim()).filter(Boolean);if((r.ap||[]).length)r.ap=apSync(r.ap,r.pasi_carte);
 {const sf=nd(g("sfaturi")).split("\n").map(x=>x.trim()).filter(Boolean);r.sfaturi=sf}
 const om=JSON.stringify(r.macro||{});r.macro=Object.assign({},r.macro);["kcal","proteine","carbo","grasimi"].forEach(k=>{const v=g(k);r.macro[k]=v===""?null:+v});if(JSON.stringify(r.macro)!==om)clrV(r,MCT);if(bv.dataset.msrc){r.macro.sursa="local";r.macro.acoperire=bv.dataset.msrc}else if(JSON.stringify(r.macro)!==om){if(bv.dataset.masrc==="ai")r.macro.sursa="ai";else r.macro.sursa="manual";delete r.macro.acoperire}
 {let st=[];try{st=JSON.parse(bv.dataset.stags||"[]")}catch(e){dbg(e)}if(st.length)r.etichete=[...new Set([...normTags(r.etichete),...normTags(st)])]}
 if(!r.manual)r.corectata=true;if(verif){r.verifica=(r.verifica||[]).filter(x=>PRT.has(x)||MCT.has(x));if(!r.verifica.length)delete r.verifica;delete r.text_brut;delete r.text_orig}
 if(r.nou){delete r.nou;const st=getStored();if(!st.length)BOOK=[r];st.push(r);saveStored(st);EDIT=null;updBS();openBook(BOOK.indexOf(r),r.portii,sel);return}
 if(persistBook(r)){EDIT=null;updVC();if(VQ&&verif){VQ.done++;vqNext(VQ.pos+1);return}openBook(i,r.portii,sel)}}
function setBookTag(i,n,on){const r=BOOK[i],a=new Set(normTags(r.etichete));on?a.add(n):a.delete(n);r.etichete=[...a];
 const st=getStored(),k=bKey(r),j=st.findIndex(x=>bKey(x)===k);if(j>=0){st[j].etichete=r.etichete;saveStored(st)}}
/* "Salveaza ca reteta mea": copie in "Retetele mele" (originalul ramane neatins), pe care o editezi cum vrei; fara AI, deci gratuita */
function copyMine(i,sel){const r=BOOK[i],S="Retetele mele";BOOK=BOOK.filter(x=>!x.nou);
 const c=JSON.parse(JSON.stringify(r));["verifica","text_brut","corectata","nou","din"].forEach(k=>delete c[k]);
 c.sursa=S;c.nr=Math.max(0,...BOOK.filter(x=>x.sursa===S).map(x=>+x.nr||0))+1;c.manual=true;c.din={sursa:r.sursa||"",nr:r.nr!=null?r.nr:"",titlu:r.titlu};c.titlu=String(r.titlu).slice(0,100)+" (varianta mea)";
 const st=getStored(),keep=JSON.parse(JSON.stringify(c));if(!st.length)BOOK=[c];else BOOK=BOOK.concat([c]);st.push(keep);saveStored(st);updBS();
 const j=BOOK.indexOf(c);EDIT={sel,i:j};openBook(j,c.portii,sel);toast("Copie salvata in Biblioteca, la Ale mele. O editezi acum; originalul ramane neatins.")}
function bvClick(e,sel){const bv=e.target.closest(".bv");if(!bv)return false;const d=e.target.dataset,i=+bv.dataset.bi,pi=bv.querySelector("[data-bp]"),p=pi&&pi.value!==""?Math.min(200,Math.max(1,Math.round(+pi.value)||1)):null;{const bt=e.target.closest("[data-rcp],[data-rsh]");if(bt){recAct("b",BOOK[i],bt.dataset.rsh!==undefined?"s":"c");return true}}
 if(jrAct(d,bKey(BOOK[i]))){openBook(i,p,sel);return true}
 if(d.edit!==undefined){EDIT={sel,i};openBook(i,p,sel);return true}
 if(d.copyme!==undefined){copyMine(i,sel);return true}
 if(d.vqskip!==undefined){EDIT=null;vqNext(VQ.pos+1);return true}
 if(d.vqstop!==undefined){VQ=null;EDIT=null;drawBook();return true}
 if(d.ecancel!==undefined){VQ=null;EDIT=null;if(BOOK[i].nou){BOOK=BOOK.filter(x=>!x.nou);drawBook();return true}openBook(i,BOOK[i].portii,sel);return true}
 if(d.emac!==undefined){macCalc(bv,e.target);return true}
 if(d.emacl!==undefined){macLoc(bv);return true}
 if(d.pconf!==undefined){pConfirm(bv,i);return true}
 if(d.mcl!==undefined){macPanel(bv,i);return true}
 if(d.mai!==undefined){fdAI(bv,i,+d.mai,e.target);return true}
 if(d.mman!==undefined){fdFormShow(bv,+d.mman);return true}
 if(d.mal!==undefined){fdAliasShow(bv,+d.mal);return true}
 if(d.malok!==undefined){fdAliasSave(bv,i,+d.malok);return true}
 if(d.mms!==undefined){fdManSave(bv,i,+d.mms,e.target);return true}
 if(d.msv!==undefined){macSaveRec(bv,i,sel,p);return true}
 if(d.emacok!==undefined){macApply(bv,bv._mac.o,bv._mac.tags);return true}
 if(d.emacno!==undefined){bv.querySelector("[data-mres]").innerHTML="";return true}
 if(d.edel!==undefined){const b=e.target;if(!b.dataset.arm){b.dataset.arm="1";b.textContent="Sigur? Apasa din nou pentru stergere definitiva";setTimeout(()=>{if(b.isConnected){delete b.dataset.arm;b.textContent="Sterge reteta"}},5000);return true}
  const k=bKey(BOOK[i]);EDIT=null;putStored(getStored().filter(x=>bKey(x)!==k));toast("Reteta a fost stearsa.");return true}
 if(d.esave!==undefined){editSave(bv,i,sel,d.esave==="v");return true}
 if(d.bback!==undefined){VQ=null;EDIT=null;BOOK=BOOK.filter(x=>!x.nou);if(sel==="#bres")drawBook();else{SV=null;renderSaved()}return true}
 if(d.fav!==undefined){favT(d.fav,()=>openBook(i,p,sel));return true}
 {const cb=e.target.closest("[data-cosb]");if(cb){const r=BOOK[i];cosAsk(cb,()=>cosMove(r,()=>{VQ=null;EDIT=null;if(sel==="#bres")drawBook();else{SV=null;renderSaved()}}),"Muta in cos?");return true}}
 if(d.psv!==undefined){const r=BOOK[i];if(p==null)return true;r.portii=p;delete r.pna;clrV(r,PRT);
  let t="Portii salvate: "+p+".";if(!r.macro||r.macro.kcal==null||r.macro.sursa==="local"){const L=macLocal(r);if(L.ok){r.macro={kcal:L.o.kcal,proteine:L.o.proteine,carbo:L.o.carbo,grasimi:L.o.grasimi,sursa:"local",acoperire:L.ok+" din "+L.n};clrV(r,MCT);t+=" Macro recalculat: "+L.o.kcal+" kcal per portie."}}
  if(persistBook(r)){updVC();openBook(i,p,sel);toast(t)}return true}
 if(d.adp!==undefined){adaptBook(i,BOOK[i].portii||p||1,sel,e.target);return true}
 if(d.bsc!==undefined){const r=BOOK[i],bs=+r.portii>0?+r.portii:null;if(bs){const k=bKey(r),cur=BSC&&BSC.k===k?BSC.n:bs,nn=d.bsc==="0"?bs:Math.min(200,Math.max(1,cur+(+d.bsc)));BSC=nn===bs?null:{k,n:nn}}openBook(i,p,sel);return true}
 if(d.bm!==undefined){mode=d.bm;openBook(i,p,sel);return true}
 if(d.cookb!==undefined){const r=BOOK[i],k=bKey(r),bs=+r.portii>0?+r.portii:null,sc=bs&&BSC&&BSC.k===k?BSC.n:bs,ff=bs?sc/bs:1;cookOpen(r.titlu,(r.ap||[]).length?cookSteps({pasi:r.ap},"g"):cookSteps(r,"b"),ingBook(r,ff),ff!==1?`Lista de ingrediente e scalata la ${sc} portii (reteta: ${bs}). Cantitatile din textul pasilor sunt cele din carte.`:"");return true}
 if(d.mpr!==undefined){MD={mp:1,f:null,q:"",r:null,after:()=>openBook(i,p,sel)};$("#mdlg").classList.remove("hidden");mpForm("b",BOOK[i]);return true}
 if(d.mnb!==undefined){menOpen({s:"b",r:BOOK[i]});return true}
 if(d.cumb!==undefined){const r=BOOK[i],bs=+r.portii>0?+r.portii:null,ff=bs&&BSC&&BSC.k===bKey(r)?BSC.n/bs:1;cartToggle(r.titlu,(r.ingrediente||[]).map(x=>({c:x.c!=null?+(x.c*ff).toFixed(2):null,u:x.u,n:x.n,g:x.g})),()=>openBook(i,p,sel));return true}
 return false}
function bvChange(e,sel){const bv=e.target.closest(".bv");if(!bv)return false;const d=e.target.dataset,i=+bv.dataset.bi,pi=bv.querySelector("[data-bp]"),p=pi&&pi.value!==""?Math.min(200,Math.max(1,Math.round(+pi.value)||1)):null;
 if(d.jnt!==undefined){setNote(bKey(BOOK[i]),{nt:e.target.value.slice(0,600)});return true}
 if(d.bp!==undefined){const v=e.target.value===""?null:Math.min(200,Math.max(1,Math.round(+e.target.value)||1));setTimeout(()=>openBook(i,v,sel),0);return true}
 if(d.tgb!==undefined){setBookTag(i,d.tgb,e.target.checked);openBook(i,p,sel);return true}
 return false}
/* ===== Coada "De verificat": parcurgi pe rand retetele cu extragere nesigura, direct in editor ===== */
let VQ=null;
function vqOpen(j){const k=VQ.keys[j];const i=BOOK.findIndex(r=>bKey(r)===k&&vx(r).length);if(i<0)return false;VQ.pos=j;EDIT={sel:"#bres",i};openBook(i,BOOK[i].portii||1,"#bres");$("#bres").scrollIntoView({block:"start"});return true}
function vqNext(from){if(!VQ)return;for(let j=from;j<VQ.keys.length;j++)if(vqOpen(j))return;
 const done=VQ.done;VQ=null;EDIT=null;drawBook();toast(done?"Ai verificat "+done+(done===1?" reteta.":" retete.")+" Nu mai sunt retete de verificat in coada.":"Nu mai sunt retete de verificat in coada.")}
function vqStart(){const keys=BOOK.filter(r=>vx(r).length&&!r.cos).map(bKey);if(!keys.length){toast("Nu ai retete de verificat.");return}VQ={keys,pos:0,done:0};vqNext(0)}
$("#bvq").onclick=vqStart;
function newBook(){BOOK=BOOK.filter(x=>!x.nou);const S="Retetele mele",nr=Math.max(0,...BOOK.filter(x=>x.sursa===S).map(x=>+x.nr||0))+1;
 const r={sursa:S,nr,titlu:"",categorie:"Fel principal",portii:2,ingrediente:[],pasi_carte:[],macro:{},etichete:[],manual:true,nou:true};
 BOOK=BOOK.concat([r]);const i=BOOK.length-1;EDIT={sel:"#bres",i};openBook(i,2,"#bres");$("#bres").scrollIntoView({block:"start"})}
$("#bnew").onclick=newBook;
$("#bidei").onclick=()=>{show("idei");window.scrollTo(0,0)};$("#ideiBack").onclick=()=>{show("carti");window.scrollTo(0,0)};
var BLIM=60;const bReset=()=>{BLIM=60;drawBook()};
let BQT=0;$("#bq").oninput=()=>{clearTimeout(BQT);BQT=setTimeout(bReset,180)}; /* 4.1.1: nu redesenez la fiecare tasta */$("#bf").onchange=bReset;$("#bs").onchange=bReset;$("#bc").onchange=bReset;$("#bv").onchange=bReset;$("#bd").onchange=bReset;$("#bj").onchange=bReset;$("#bp").onchange=bReset;
$("#bres").onclick=e=>{if(bvClick(e,"#bres"))return;const d=e.target.closest("button")?e.target.closest("button").dataset:e.target.dataset;
 if(d.crest!==undefined){const r=BOOK.find(x=>bKey(x)===d.crest);if(r){cosSet(r,false);drawBook();bplDraw();undoShow("Restaurata: "+r.titlu+".",{},()=>{cosSet(r,true);drawBook();bplDraw()})}return}
 if(d.cdel!==undefined){const r=BOOK.find(x=>bKey(x)===d.cdel);if(r)cosAsk(e.target.closest("button"),()=>cosDelete([r],()=>{drawBook();bplDraw()}),"Sterge definitiv?");return}
 if(d.cclr!==undefined){const rs=BOOK.filter(x=>x.cos);if(rs.length)cosAsk(e.target,()=>cosDelete(rs,()=>{drawBook();bplDraw()}),"Sterg "+rs.length+" definitiv?");return}
 if(d.bmore!==undefined){BLIM+=60;drawBook();return}
 if(d.fav!==undefined){favT(d.fav,drawBook);return}
 if(d.b!==undefined){openBook(+d.b,BOOK[d.b].portii,"#bres");$("#bres").scrollIntoView({block:"start"})}};
$("#bres").onchange=e=>{bvChange(e,"#bres")};
const BOOK0=BOOK;function setBook(j){ndo(j);BOOK=j;SV=null;drawBook()}
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
function saveStored(a){ndo(a);STORED=a;syMark("rbook");
 if(IDBOK&&DB){LIBW=LIBW.then(()=>idbPut("book",a)).then(()=>{LS("rlib","1");return true}).catch(()=>{toast("Nu am putut salva biblioteca in baza de date a browserului.");return false});return LIBW}
 try{if(a.length)localStorage.setItem("rbook",JSON.stringify(a));else localStorage.removeItem("rbook")}catch(e){toast("Nu am putut salva biblioteca: memoria browserului e plina.");return Promise.resolve(false)}
 return Promise.resolve(true)}

/* 3.8.0: migrare unica: scoate diacriticele din ce exista deja (retete, carti, debara, meniuri). Inainte face o copie de siguranta (Setari > Backup). */
async function ndRun(){
 try{if(LS("rnd")==="1")return;
  const keys=BK_KEYS.filter(k=>k!=="rbook");let need=false;
  keys.forEach(k=>{const v=localStorage.getItem(k);if(v&&ND_RE.test(v))need=true});
  if(!need&&STORED.length){try{need=ND_RE.test(JSON.stringify(STORED))}catch(e){dbg(e)}}
  const dedupe=()=>{let un=0;
  try{const p=JSON.parse(localStorage.getItem("rp")||"[]");if(Array.isArray(p)){const m=new Map();p.forEach(x=>{const k=norm(x.n);if(m.has(k)){un++;const o=m.get(k);o.f=[...new Set([...(o.f||[]),...(x.f||[])])]}else m.set(k,x)});if(un)LS("rp",JSON.stringify([...m.values()]))}}catch(e){dbg(e)}
  try{const p=JSON.parse(localStorage.getItem("rcat")||"[]");if(Array.isArray(p)){const m=new Map();p.forEach(x=>{const k=norm(x.n);if(m.has(k))un++;else m.set(k,x)});if(m.size!==p.length)LS("rcat",JSON.stringify([...m.values()]))}}catch(e){dbg(e)}
   return un};
  if(!need){const u=dedupe();if(u)ND_MSG="Am unit "+u+" intrari identice din debara si categorii.";LS("rnd","1");return}
  if(IDBOK&&DB&&hasData()&&!(await snapMake(true)))return; /* fara copie de siguranta nu schimb nimic; incerc la urmatoarea pornire */
  NDC=0;
  keys.forEach(k=>{const v=localStorage.getItem(k);if(v&&ND_RE.test(v))LS(k,v)});
  /* dupa curatare, intrari care au devenit identice se unesc (debara, categorii) */
  const un=dedupe();
  if(STORED.length&&ND_RE.test(JSON.stringify(STORED)))await saveStored(STORED);
  LS("rnd","1");ND_MSG="Am scos diacriticele din "+NDC+" cuvinte"+(un?" si am unit "+un+" intrari identice":"")+". Am facut inainte o copie de siguranta: Setari > Tehnic > Backup, daca vrei sa revii."
 }catch(e){dbg(e)}}
let ND_MSG="";
/* 3.19.0: sursa "Baza de retete" se numeste acum "Retete vegetariene"; se muta si cheile sursa|nr din favorite, notite, meal prep si meniu (text brut: cheile apar intre ghilimele) */
const SRC_REN=[["Baza de retete","Retete vegetariene"]];
async function srcRun(){try{let ch=0;
 SRC_REN.forEach(([o,n])=>{const have=new Set(STORED.filter(r=>r&&r.sursa===n).map(r=>String(r.nr)));
  const keep=STORED.filter(r=>!(r&&r.sursa===o&&have.has(String(r.nr))));
  if(keep.length!==STORED.length){STORED.length=0;keep.forEach(r=>STORED.push(r));ch++}
  STORED.forEach(r=>{if(r&&r.sursa===o){r.sursa=n;ch++}});
  ["rfav","rnote","rmp","rmen"].forEach(k=>{const v=LS(k);if(v&&v.indexOf('"'+o+'|')>=0){LS(k,v.split('"'+o+'|').join('"'+n+'|'));ch++}})});
 if(ch){if(STORED.length)await saveStored(STORED);setTimeout(()=>toast("Sursa Baza de retete se numeste acum Retete vegetariene."),1200)}}catch(e){dbg(e)}}
/* 3.18.1: macro calculat din Info ("local") se reface o singura data cand se schimba baza Info sau potrivirea (altfel ramane cel vechi dupa o actualizare); fibre/saturate se scot de aici, ele se calculeaza live la Micronutrienti */
async function mcRun(){try{const v=NUTRI.R.length+":"+NUTRI.M.length+":4";if(LS("rnv")===v)return;
 const fx=(a,s)=>{let n=0;(a||[]).forEach(r=>{const m=r&&r.macro;if(!m||m.sursa!=="local"||!(r.ingrediente||[]).length)return;const L=macLocal(r,null,rawIngs(s,r));if(!L.ok)return;
  const o=L.o,ac=L.ok+" din "+L.n;if(m.kcal!==o.kcal||m.proteine!==o.proteine||m.carbo!==o.carbo||m.grasimi!==o.grasimi||m.acoperire!==ac||"fibre" in m||"saturate" in m){m.kcal=o.kcal;m.proteine=o.proteine;m.carbo=o.carbo;m.grasimi=o.grasimi;m.acoperire=ac;delete m.fibre;delete m.saturate;n++}});return n};
 const nb=fx(STORED,"b");if(nb)await saveStored(STORED);const sv=getSaved(),ns=fx(sv,"s");if(ns)LS("rs",JSON.stringify(sv));
 LS("rnv",v);if(nb+ns)setTimeout(()=>toast("Am actualizat macro la "+(nb+ns)+" retete, dupa noua baza Info."),900)}catch(e){dbg(e)}}
async function libInit(){
 let legacy=null;try{const s=localStorage.getItem("rbook");if(s){const j=JSON.parse(s);if(Array.isArray(j)&&j.length)legacy=j}}catch(e){dbg(e)}
 try{DB=await idbOpen();IDBOK=true;
  if(legacy){await idbPut("book",legacy);const back=await idbGet("book");
   if(Array.isArray(back)&&back.length===legacy.length){STORED=back;LS("rlib","1");try{localStorage.removeItem("rbook")}catch(e){dbg(e)}}else{IDBOK=false;STORED=legacy}}
  else if(LS("rlib")==="1"){const v=await idbGet("book");STORED=Array.isArray(v)?v:[]}
  else STORED=[] /* fara marcaj: ce ramane in IndexedDB e orfan (datele aplicatiei au fost sterse) */
 }catch(e){IDBOK=false;STORED=legacy||[]}
 await ndRun();
 /* 4.0.0: copie automata inainte de trecerea pe id-uri stabile */
 try{if(sidNeed()){await snapMake(true);const n=sidRun();if(n)setTimeout(()=>toast("Am actualizat "+n+(n===1?" reteta salvata":" retete salvate")+" la noul format (id stabil). O copie automata a fost facuta inainte."),1500)}else sidRun()}catch(e){dbg(e)}
 try{localStorage.removeItem("rmt")}catch(e){dbg(e)}
 await srcRun();
 await mcRun();
 await v5Run();
 if(STORED.length){try{BOOK=cl(STORED).map(fixRec)}catch(e){dbg(e)}}
 LIBREADY=true;try{jrSync()}catch(e){dbg(e)}try{drawBook();updBS();drawOnb();if(!$("#v-meniu").classList.contains("hidden"))drawMenu()}catch(e){dbg(e)}
 {const dd=menDedupe(),orf=lOrphan();if(orf.length)setTimeout(()=>toast(orfTxt(orf)),1500);if(dd)setTimeout(()=>toast("Am adunat "+dd+(dd===1?" reteta aparuta de doua ori":" retete aparute de doua ori")+" la aceeasi masa, in meniu."),900)}
 if(ND_MSG)setTimeout(()=>toast(ND_MSG),600);window.__ready=true;
 shipRun().then(r=>shipDone(r,true)).catch(()=>{})}
function putStored(a){saveStored(a);BOOK=a.length?a:BOOK0;SV=null;drawBook();updBS()}
/* ===== 4.1.0: carti livrate cu aplicatia =====
   carti.json = {carti:[{sursa,f,v}]}; fisierele stau in folderul carti/. La pornire se instaleaza cartile care lipsesc si se actualizeaza cele cu versiune noua.
   Fiecare reteta livrata are liv (versiunea cartii) si lh (amprenta continutului la instalare); daca amprenta nu mai corespunde, reteta a fost schimbata de tine:
   nu se mai suprascrie la actualizari si intra in backup. rbv = {sursa:{v,max}} sau {del:1} daca ai sters cartea; rbneed = ce trebuie reinstalat dupa o restaurare. Niciuna nu intra in backup. */
const shHash=r=>{const c=JSON.parse(JSON.stringify(r));delete c.liv;delete c.lh;if(c.macro&&c.macro.sursa==="local")delete c.macro;fixRec(c);let h=5381;const z=JSON.stringify(c);for(let i=0;i<z.length;i++)h=((h*33)^z.charCodeAt(i))>>>0;return h.toString(36)};
const shUnmod=r=>!!(r&&r.liv&&r.lh&&r.lh===shHash(r));
const getBv=()=>{try{const j=JSON.parse(localStorage.getItem("rbv")||"{}");return j&&typeof j==="object"&&!Array.isArray(j)?j:{}}catch(e){return{}}};
const putBv=o=>{try{localStorage.setItem("rbv",JSON.stringify(o))}catch(e){dbg(e)}};
let SHIPPING=false;
async function shipRun(force){if(SHIPPING)return null;SHIPPING=true;let add=0,upd=0;
 try{const res=await fetch("carti.json",{cache:"no-cache"});if(!res.ok)return null;const man=await res.json();if(!man||!Array.isArray(man.carti))return null;
  const bv=getBv();let need=null;try{need=JSON.parse(localStorage.getItem("rbneed")||"null")}catch(e){dbg(e)}if(!need||typeof need!=="object"||Array.isArray(need))need=null;
  const st=getStored();let ch=false,fail=false;
  for(const b of man.carti){if(!b||typeof b.sursa!=="string"||typeof b.f!=="string"||!(+b.v>0))continue;
   let s=bv[b.sursa];if(s&&s.del){if(!force)continue;s=null}
   const nd=need&&Array.isArray(need[b.sursa])?need[b.sursa]:null;
   if(need&&!s&&!nd&&!force&&!st.some(r=>r&&r.sursa===b.sursa)){bv[b.sursa]={del:1};continue} /* backup-ul nu avea cartea: fusese stearsa */
   if(s&&s.v===b.v&&!nd)continue;
   let recs=null;try{const rr=await fetch(b.f,{cache:"no-cache"});if(rr.ok)recs=await rr.json()}catch(e){dbg(e)}
   if(!Array.isArray(recs)){fail=true;continue}
   const have=new Map();st.forEach((r,i)=>{if(r&&r.sursa===b.sursa)have.set(bKey(r),i)});
   const ndSet=nd?new Set(nd.map(String)):null,first=!s,mx=s&&+s.max||0;
   const mk=rec=>{const c=fixRec(JSON.parse(JSON.stringify(rec)));c.liv=+b.v;c.lh=shHash(c);return c};
   recs.forEach(rec=>{if(!rec||rec.sursa!==b.sursa||!rec.titlu)return;const i=have.get(bKey(rec));
    if(i===undefined){if(ndSet?ndSet.has(String(rec.nr)):(first||+rec.nr>mx)){st.push(mk(rec));add++;ch=true}return}
    const ex=st[i];
    if(ex.liv){if(ex.liv<+b.v&&shUnmod(ex)){st[i]=mk(rec);upd++;ch=true}return}
    /* carte incarcata de mana inainte de 4.1.0: retetele neatinse trec pe versiunea livrata; cele corectate, din cos sau cu marcaje raman ale tale */
    if(first&&!ex.corectata&&!ex.manual&&!ex.cos&&!ex.mok&&!ex.pna&&!(ex.verifica||[]).length){st[i]=mk(rec);upd++;ch=true}});
   /* 4.30.2: o reteta scoasa din carte (nu mai e in fisier) se scoate si din Biblioteca, daca n-ai schimbat-o si nu e in favorite, notite, Meal prep sau meniu */
   {const live=new Set(recs.map(x=>String(x&&x.nr))),used=["rfav","rnote","rmp","rmen"].map(k=>LS(k)||"").join("");
    for(let j=st.length-1;j>=0;j--){const ex=st[j];if(ex&&ex.sursa===b.sursa&&ex.liv&&ex.liv<+b.v&&!live.has(String(ex.nr))&&shUnmod(ex)&&used.indexOf('"'+b.sursa+"|"+ex.nr+'"')<0){st.splice(j,1);ch=true}}}
   bv[b.sursa]={v:+b.v,max:Math.max(0,...recs.map(r=>+r.nr||0))}}
  putBv(bv);if(need&&!fail)localStorage.removeItem("rbneed");
  if(ch){if(!(await saveStored(st)))return null;BOOK=cl(STORED).map(fixRec)}
  return{add,upd}}
 catch(e){return null}finally{SHIPPING=false}}
/* 4.8.1: sursele vechi "Air fryer (de verificat)" si "Retete noi (de verificat)" erau retetele de azi din cartile livrate; dupa ce cartile sunt instalate, copiile vechi se scot (doar daca nu au favorite, notite, meal prep sau meniu) */
const DV_SRC=["Air fryer (de verificat)","Retete noi (de verificat)"];
async function dvRun(){try{const st=getStored();if(!st.some(r=>r&&DV_SRC.includes(r.sursa)))return 0;const T=s=>norm(s||""),have=new Set(st.filter(r=>r&&!DV_SRC.includes(r.sursa)&&r.titlu).map(r=>T(r.titlu)));
 const used=["rfav","rnote","rmp","rmen"].map(k=>LS(k)||"").join("");let n=0;
 const keep=st.filter(r=>{if(!(r&&DV_SRC.includes(r.sursa)))return true;if(!have.has(T(r.titlu))||used.indexOf('"'+r.sursa+"|"+r.nr+'"')>=0)return true;n++;return false});
 if(n){await saveStored(keep);BOOK=keep.length?keep:BOOK0}return n}catch(e){dbg(e);return 0}}
function shipDone(r,quiet){dvRun().then(n=>{if(n){try{drawBook();updBS()}catch(e){dbg(e)}toast("Am scos "+n+" retete vechi (de verificat), care exista deja in cartile aplicatiei.")}}).catch(dbg);if(!r){const first=!Object.keys(getBv()).length;if(first||!quiet)toast(first?"Nu am putut descarca retetele aplicatiei. Verifica internetul; reincerc singur cand revine conexiunea.":"Nu am putut verifica acum cartile aplicatiei. Incearca mai tarziu.",true);return}
 if(!(r.add+r.upd)){if(!quiet)toast("Cartile aplicatiei sunt deja la zi.");return}
 try{drawBook();updBS();drawOnb();if(!$("#v-meniu").classList.contains("hidden"))drawMenu()}catch(e){dbg(e)}
 toast("Cartile aplicatiei: "+(r.add?r.add+(r.add===1?" reteta noua":" retete noi"):"")+(r.add&&r.upd?", ":"")+(r.upd?r.upd+(r.upd===1?" reteta actualizata":" retete actualizate"):"")+".")}
window.addEventListener("online",()=>{if(window.__ready)shipRun().then(r=>{if(r)shipDone(r,true)}).catch(dbg)}); /* 4.1.1 */
function updBS(){const s=STORED,c={};s.forEach(r=>{const k=r.sursa||"necunoscuta";c[k]=(c[k]||0)+1});const k=Object.keys(c);
 const shDel=Object.values(getBv()).some(x=>x&&x.del)?`<div class="mt12"><button class="alt" data-ship="1">Readu cartile aplicatiei</button><p class="muted mt4 mb0">Ai sters carti care vin cu aplicatia. Butonul le aduce inapoi; retetele tale raman neatinse.</p></div>`:"";
 const smn=smN(),smB=smn?`<div class="mt12"><p class="muted mt0 mb4">${smn} retete Sanda Marin au doar text, fara ingrediente; ${smAll()?"apar":"nu apar"} in Biblioteca (cele folosite de tine apar oricum).</p><button class="alt m0" data-small="1">${smAll()?"Ascunde-le":"Arata-le"}</button></div>`:"";
 $("#bsn").innerHTML=shDel+smB+(k.length?k.map(x=>`<div class="bsr"><b>${esc(x)}</b><div class="bsm"><span class="muted">${c[x]} ${c[x]===1?"reteta":"retete"}</span><button class="alt ico" data-dl="${esc(x)}" aria-label="Descarca JSON" title="Descarca JSON"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 20h14"/></svg></button><button class="alt ico" data-src="${esc(x)}" aria-label="Sterge" title="Sterge">${IC_DEL}</button></div></div>`).join("")+`<div class="row mt12 g8" ><button class="go m0" data-dlall="1" >Descarca toate (${s.length} retete)</button><button class="alt" data-all="1">Goleste biblioteca</button></div>`:'<p class="muted">Nu ai nicio baza incarcata (apare doar reteta de test).</p>');dupDraw()}
/* descarca o carte (cu corecturile tale) in acelasi format in care o incarci: o lista de retete, reincarcabila ca atare */
function dlBook(src){const all=src===null,l=getStored().filter(r=>all||(r.sursa||"necunoscuta")===src).map(r=>{const o=JSON.parse(JSON.stringify(r));delete o.nou;delete o.liv;delete o.lh;return o});
 if(!l.length){toast("Nu am gasit retete in aceasta carte.");return}
 const name=(all?"toate-retetele":String(src).replace(/[^\w\-]+/g,"_").replace(/^_+|_+$/g,"")||"carte")+"-corectat-"+dKey(new Date())+".json",a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([JSON.stringify(l,null,1)],{type:"application/json"}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
 toast("Descarcat: "+name+" ("+l.length+" retete). Il poti reincarca din Setari -> Carti.")}
$("#bscard").onclick=e=>{const b=e.target,d=b.dataset;if(d.small!==undefined){LS("rsmall",smAll()?"":"1");updBS();drawBook();return}if(d.ship!==undefined){b.disabled=true;shipRun(true).then(r=>{shipDone(r);updBS()}).catch(()=>{b.disabled=false});return}if(d.dl!==undefined){dlBook(d.dl);return}if(d.dlall!==undefined){dlBook(null);return}if(d.src===undefined&&!d.all)return;
 if(armDel(b))return;
 {const bv=getBv();if(d.all)Object.keys(bv).forEach(k=>{bv[k]={del:1}});else if(bv[d.src])bv[d.src]={del:1};putBv(bv)}
 putStored(d.all?[]:getStored().filter(r=>(r.sursa||"necunoscuta")!==d.src))};

/* 3.16.0: dubluri intre carti. Doua retete sunt dubluri daca au acelasi titlu si ingrediente (aproape) identice, sau aceleasi ingrediente si titluri apropiate. Se pastreaza copia folosita (favorite, Meal prep, meniu, jurnal), apoi cea mai completa. "Retetele mele" nu se ating niciodata. */
const dupNm=s=>norm(s).replace(/[^a-z0-9]+/g," ").trim(),dupIng=r=>new Set((r.ingrediente||[]).map(x=>dupNm(x&&x.n)).filter(Boolean)),
 dupJac=(a,b)=>{let i=0;a.forEach(x=>{if(b.has(x))i++});const u=a.size+b.size-i;return u?i/u:0},
 dupCmp=r=>((r.verifica&&r.verifica.length)?0:100)+((r.pasi_carte||[]).length?50:0)+Math.min((r.ingrediente||[]).length,20)+(r.macro&&r.macro.kcal!=null?5:0)+(r.portii!=null?3:0);
let DUP=null,DUPU=null;
function dupUsed(){const s=new Set(getFav());getMP().forEach(x=>{if(x.s==="b")s.add(x.k)});Object.keys(getNotes()).forEach(k=>s.add(k));
 try{const m=getMen();Object.values(m).forEach(d=>Object.values(d).forEach(a=>{if(Array.isArray(a))a.forEach(e=>{if(e&&e.s==="b"&&e.k)s.add(e.k)})}))}catch(e){dbg(e)}return s}
function dupFind(){const L=getStored(),used=dupUsed(),S=L.map(dupIng),T=L.map(r=>dupNm(r.titlu)),P=L.map((_,i)=>i),f=x=>{while(P[x]!==x){P[x]=P[P[x]];x=P[x]}return x},why={};
 const tj=(a,b)=>{const x=new Set(a.split(" ")),y=new Set(b.split(" "));return dupJac(x,y)},same=(a,b)=>S[a].size===S[b].size&&dupJac(S[a],S[b])===1;
 for(let a=0;a<L.length;a++){if(S[a].size<3)continue;for(let b=a+1;b<L.length;b++){if(S[b].size<3)continue;
  const j=dupJac(S[a],S[b]);if(j<.7)continue;
  if(T[a]===T[b]||(same(a,b)&&tj(T[a],T[b])>=.5)){const ra=f(a),rb=f(b);if(ra!==rb){P[rb]=ra}why[b]=T[a]===T[b]?"acelasi titlu":"aceleasi ingrediente, titlu apropiat"}}}
 const G={};L.forEach((_,i)=>{const r=f(i);(G[r]=G[r]||[]).push(i)});
 return Object.values(G).filter(g=>g.length>1).map(g=>{const keep=g.slice().sort((a,b)=>(used.has(bKey(L[b]))-used.has(bKey(L[a])))||(L[b].sursa==="Retetele mele")-(L[a].sursa==="Retetele mele")||(dupCmp(L[b])-dupCmp(L[a]))||(a-b))[0];
  const rm=g.filter(i=>i!==keep&&!used.has(bKey(L[i]))&&L[i].sursa!=="Retetele mele");return rm.length?{keep,rm,why:why[rm[0]]||why[g[1]]||"",L}:null}).filter(Boolean)}
const dupLbl=r=>esc(r.titlu)+' <span class="muted">('+esc(r.sursa||"necunoscuta")+(r.nr!=null&&r.nr!==""?", nr. "+esc(r.nr):"")+')</span>';
function dupDraw(){const el=$("#bdup");if(!el)return;
 if(!STORED.length){el.innerHTML="";return}
 if(!DUP){el.innerHTML='<div class="row mt12 g8"><button class="alt" data-dup="find">Gaseste dubluri</button></div>'+(DUPU&&DUPU.old?'<p class="ok mt8">Am eliminat '+(DUPU.old.length-STORED.length)+' dubluri. Au ramas '+STORED.length+' retete. <button class="alt" data-dup="undo">Anuleaza eliminarea</button></p>':typeof DUPU==="string"&&DUPU?'<p class="ok mt8">'+DUPU+'</p>':"");return}
 if(!DUP.length){el.innerHTML='<p class="ok mt12">Nu am gasit dubluri.</p><button class="alt" data-dup="no">Inchide</button>';return}
 const n=DUP.filter(g=>g.on).reduce((s,g)=>s+g.rm.length,0);
 el.innerHTML='<div class="card mt12"><b>'+DUP.reduce((s,g)=>s+g.rm.length,0)+' dubluri gasite</b><p class="muted">Pastrez copia folosita (favorite, Meal prep, meniu, jurnal), apoi cea mai completa. Debifeaza ce vrei sa ramana.</p>'
 +DUP.map((g,k)=>'<label class="dupr"><input type="checkbox" data-dupk="'+k+'"'+(g.on?" checked":"")+'><span>'+g.rm.map(i=>dupLbl(g.L[i])).join("<br>")+'<br><span class="ok">se pastreaza: </span>'+dupLbl(g.L[g.keep])+' <span class="muted">- '+esc(g.why)+'</span></span></label>').join("")
 +'<div class="row mt12 g8"><button class="go m0" data-dup="del"'+(n?"":" disabled")+'>Elimina '+n+' dubluri</button><button class="alt" data-dup="no">Anuleaza</button></div></div>'}
$("#bdup").onclick=e=>{const d=e.target.dataset;
 if(d.dup==="find"){DUP=dupFind().map(g=>Object.assign(g,{on:true}));DUPU="";dupDraw();return}
 if(d.dup==="no"){DUP=null;dupDraw();return}
 if(d.dupk!==undefined){DUP[+d.dupk].on=e.target.checked;dupDraw();return}
 if(d.dup==="undo"){if(DUPU&&DUPU.old){const o=DUPU.old;DUPU="Eliminarea a fost anulata: "+o.length+" retete la loc.";putStored(o)}return}
 if(d.dup==="del"){const L=getStored(),rm=new Set();DUP.filter(g=>g.on).forEach(g=>g.rm.forEach(i=>rm.add(i)));if(!rm.size)return;
  const old=L.slice(),st=L.filter((_,i)=>!rm.has(i));DUP=null;DUPU={old};putStored(st);return}};
libInit();
let PEND=null;
const srcOf=(r,f)=>((PEND&&PEND.nm)||"").trim()||r.sursa||f.name.replace(/\.json$/i,"");
function pvInfo(){const {j,f}=PEND,names=[...new Set(j.map(r=>srcOf(r,f)))],repl=getStored().filter(r=>names.includes(r.sursa)).length,vf=j.filter(r=>r.verifica).length;
 return `${j.length} retete. Apar ca: ${esc(names.join(", "))}. ${repl?"Inlocuiesc "+repl+" retete existente cu acelasi nume.":"Carte noua in baza."}${vf?" "+vf+" retete sunt marcate verifica si se afiseaza ca text brut.":""}`}
function pvDraw(){const el=$("#bpv");if(!PEND){el.innerHTML="";return}
 const {f}=PEND;
 el.innerHTML=`<div class="card mt8 mb12" ><b>${esc(f.name)}</b><label for="bnm" class="mt12">Numele cartii (poti schimba)</label><input id="bnm" value="${esc(PEND.nm||"")}" placeholder="Numele din fisier" autocomplete="off"><div class="muted mt8 mb12" id="bpa" >${pvInfo()}</div><button class="go m0" data-pv="ok" >Incarca</button> <button class="alt" data-pv="no">Anuleaza</button></div>`}
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
fetch("retete.json").then(r=>r.ok?r.json():null).then(j=>{if(Array.isArray(j)&&j.length&&!getStored().length){BOOK=ndo(j);drawBook()}}).catch(()=>{});
drawBook();


/* "Ce pot gati din debara": ingredientele unei retete care nu sunt acoperite de debara (potrivire putin mai larga decat la cumparaturi) */
let _mv=null,_mm=new WeakMap();
const covered=name=>{if(inPantry(name))return true;const q=formSplit(name),t=q.t;if(!t.length)return true;return panItems().some(p=>p.t.length&&t.length<=p.t.length+1&&p.t.every(w=>t.some(x=>tokEq(w,x)))&&formOk(q,p))};
function missing(r){const v=(LS("rp")||"")+"|"+(LS("rcat")||"")+"|"+(LS("rcg")||"")+"|"+(LS("rsec")||"");if(v!==_mv){_mv=v;_mm=new WeakMap()}
 let o=_mm.get(r);if(o)return o;
 const names=[...new Set(prepIngs((r.ingrediente||[]).map(x=>({c:x.c,u:x.u,n:x.n,g:x.g}))).map(x=>cleanName(x.n)).filter(Boolean))];
 o={tot:names.length,miss:names.filter(n=>!covered(n))};_mm.set(r,o);return o}
/* lista de cumparaturi */
const BASE=["sare","piper","ulei","zahar","faina"]; /* puse implicit in debara (apa nu se mai cumpara deloc) */
const getList=()=>{try{const j=JSON.parse(LS("rl"));return Array.isArray(j)?j.filter(x=>x&&typeof x==="object"&&typeof x.n==="string"):[]}catch(e){return[]}};
const putList=l=>LS("rl",JSON.stringify(l));
/* ===== DEBARA (produse pe care le ai deja / se consuma greu; fara cantitati) ===== */
let HP=(()=>{try{return localStorage.getItem("rhp")!=="0"}catch(e){return true}})(),PE=null,PED=null; /* 4.16.0: starea "Ascunde produsele din debara" se pastreaza pe acest dispozitiv (nu intra in backup) */
/* categorii debara; marcaje (proaspat/congelat/uscat/conserva/altceva) doar unde au sens */
/* categorii alimente: editabile in Setari -> Alimente > Categorii alimente (rcg); "altele" ramane mereu ultima */
const DEFCATS=[{id:"condimente",n:"Condimente",f:1},{id:"legume",n:"Legume",f:1},{id:"carne",n:"Carne",f:1},{id:"fructe",n:"Fructe",f:1},{id:"cereale",n:"Cereale",f:0},{id:"leguminoase",n:"Leguminoase",f:1},{id:"lactate",n:"Lactate",f:0},{id:"altele",n:"Altele",f:0}];
const FI={proaspat:["Proaspat",'<path d="M5 19C5 10 10 5 20 4c0 10-4 15-13 15z" fill="#3f9d4e"/><path d="M5 19L14 10" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/>'],
 congelat:["Congelat",'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" fill="#bfe6f7" stroke="#4aa3cc" stroke-width="1.5" stroke-linejoin="round"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9" fill="none" stroke="#4aa3cc" stroke-width="1.2"/>'],
 uscat:["Uscat",'<path d="M5 19C5 10 10 5 20 4c0 10-4 15-13 15z" fill="#e0a82e"/><path d="M5 19L14 10" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/>'],
 conserva:["Conserva",'<rect x="5" y="5" width="14" height="15" rx="2.5" fill="#d96b5a"/><rect x="5" y="5" width="14" height="3" rx="1.5" fill="#b4b4b4"/><rect x="5" y="17" width="14" height="3" rx="1.5" fill="#b4b4b4"/><rect x="8" y="10" width="8" height="5" rx="1" fill="#fff" opacity=".85"/>'],
 altceva:["Altceva (borcan, gem, sos...)",'<rect x="8" y="3" width="8" height="3.5" rx="1" fill="#9a7b4f"/><path d="M7 7h10c1 1 1.5 2 1.5 3.5v7.5a2.5 2.5 0 0 1-2.5 2.5H8A2.5 2.5 0 0 1 5.5 18v-7.5C5.5 9 6 8 7 7z" fill="#e7d9b8" stroke="#9a7b4f" stroke-width="1.3"/><rect x="8" y="11" width="8" height="5" rx="1" fill="#fff" opacity=".7"/>']};
const CART='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.5l2 10.5h10L19.5 8H6.5"/><circle cx="9" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/></svg>',FORMS=Object.keys(FI),fIco=f=>`<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">${FI[f][1]}</svg>`;let CATS=[],FCAT=[];
function loadCats(){let l=null;try{l=JSON.parse(LS("rcg"))}catch(e){dbg(e)}if(!Array.isArray(l)||!l.length)l=DEFCATS;
 const seen=new Set();l=l.filter(x=>x&&typeof x.id==="string"&&x.id&&typeof x.n==="string"&&x.n.trim()&&!seen.has(x.id)&&seen.add(x.id)).map(x=>({id:x.id,n:x.n.trim().slice(0,30),f:x.f?1:0}));
 if(!l.some(x=>x.id==="altele"))l.push({id:"altele",n:"Altele",f:0});l.sort((a,b)=>(a.id==="altele")-(b.id==="altele"));
 CATS=l.map(x=>[x.id,x.n]);FCAT=l.filter(x=>x.f).map(x=>x.id);return l}
/* 4.3.0: valorile implicite corectate (Carne cu marcaje, Cereale fara) si categoria noua Leguminoase, cu marcaje. Cine si-a salvat deja categoriile primeste doar categoria noua, o singura data; bifele lui raman. */
try{if(!localStorage.getItem("rcgv")){const raw=localStorage.getItem("rcg");if(raw){const l=JSON.parse(raw);if(Array.isArray(l)&&!l.some(x=>x&&x.id==="leguminoase")){const i=l.findIndex(x=>x&&x.id==="altele");l.splice(i<0?l.length:i,0,{id:"leguminoase",n:"Leguminoase",f:1});LS("rcg",JSON.stringify(l))}}localStorage.setItem("rcgv","1")}}catch(e){dbg(e)}
/* 4.22.0: Condimente primeste marcaje (proaspat / uscat / altceva), o singura data, si la cine si-a salvat deja categoriile */
try{if(!localStorage.getItem("rcgv2")){const raw=localStorage.getItem("rcg");if(raw){const l=JSON.parse(raw);if(Array.isArray(l)){l.forEach(x=>{if(x&&x.id==="condimente")x.f=1});LS("rcg",JSON.stringify(l))}}localStorage.setItem("rcgv2","1")}}catch(e){dbg(e)}
loadCats();
const CATKW={
 leguminoase:"fasole linte naut bob soia edamame lupin",
 condimente:"sare piper boia cimbru cimbrisor oregano busuioc tarhon dafin nucsoara scortisoara vanilie rozmarin chimen ghimbir turmeric curcuma paprika ienibahar mustar patrunjel marar leustean menta salvie cuisoare coriandru fenicul",
 lactate:"lapte iaurt branza smantana unt telemea cascaval mozzarella parmezan kefir urda mascarpone ricotta cheddar brie gorgonzola lapte frisca",
 carne:"pui piept pulpa pulpe curcan vita porc miel carne carnat carnati sunca bacon cabanos salam crenvurst crenvursti peste somon ton cod macrou pastrav crap creveti calamar fileu ficat inima slanina costita costite mici muschi ciolan aripioare",
 fructe:"mar mere para pere banana banane portocal portocale lamaie lamai lime grapefruit mandarin mandarine clementin capsun capsuni zmeura afin afine visin visine cires cirese piersic piersici caisa caise prun prune struguri strugure pepene kiwi ananas mango avocado rodie smochin smochine curmal curmale stafid stafide fruct fructe",
 cereale:"orez paste spaghete penne fusilli gris malai mamaliga ovaz fulgi quinoa bulgur cuscus grau secara orz mei hrisca faina pesmet paine cereale musli granola amidon arpacas",
 legume:"morcov morcovi cartof cartofi ceapa usturoi rosie rosii tomate castravete castraveti ardei varza vinete vanata dovlecel dovlecei dovleci dovleac broccoli conopida spanac salata mazare sfecla telina pastarnac ridiche ridichi praz ciuperci ciuperca porumb kale andive rucola sparanghel masline legume ghiveci"};
function guessCat(name){const t=norm(String(name||"").replace(/\([^)]*\)/g," ")).split(/[^a-z0-9]+/).filter(Boolean);
 const has=c=>CATS.some(x=>x[0]===c);if(t.some(w=>["ulei","otet"].includes(w)))return"altele";
 if(t.some(w=>["arahide","alune","migdale","nuca","nuci","fistic","tahini","seminte","susan","chia","caju"].includes(w)))return"altele";
 if(t.some(w=>["ou","oua","ouale","galbenus","galbenusuri","albus","albusuri"].includes(w)))return has("lactate")?"lactate":"altele";
 if(t.some(w=>w==="paste"||w==="pasta")&&t.some(w=>/^(rosi|tomat)/.test(w)))return has("legume")?"legume":"altele";
 if(t.includes("fasole")&&t.includes("verde"))return has("legume")?"legume":"altele"; /* fasolea verde e leguma, nu leguminoasa uscata */
 for(const c of ["condimente","lactate","carne","fructe","leguminoase","cereale","legume"]){if(!has(c))continue;const kw=CATKW[c].split(" ");if(t.some(w=>kw.some(k=>w===k||(k.length>=5&&w.startsWith(k)))))return c}return"altele"}
/* categoria unui aliment: alegerea ta din Setari -> Alimente (rcat) sau potrivirea automata */
const cn=n=>norm(String(n||"").replace(/\([^)]*\)/g," ").replace(/\s+/g," ").trim());
const getCats=()=>{try{const j=JSON.parse(LS("rcat")||"[]");return Array.isArray(j)?j.filter(x=>x&&typeof x.n==="string"&&CATS.some(c=>c[0]===x.c)):[]}catch(e){return[]}};
const putCats=l=>LS("rcat",JSON.stringify(l));
const catOf=n=>{const k=cn(n),o=getCats().find(x=>cn(x.n)===k);return o?o.c:guessCat(n)};
function setCat(n,c){n=String(n||"").replace(/\s+/g," ").trim().slice(0,60);if(!n)return;const l=getCats().filter(x=>cn(x.n)!==cn(n));if(c&&c!==guessCat(n))l.push({n,c});putCats(l)}
const mkPan=(n,f)=>{const c=catOf(n),fs=(Array.isArray(f)?f:[]).map(x=>x==="neprocesat"?"proaspat":x).filter((x,i,a)=>FORMS.includes(x)&&a.indexOf(x)===i);return{n,cat:c,f:FCAT.includes(c)?fs:[]}};
/* getPan e apelat pentru fiecare produs din lista: parsarea se face o singura data pe valoare stocata (cache pe cheile rp, rcat, rcg) */
let _pk=null,_pv=[],_pt=null,_pi=null;_pi=null;
const parsePan=()=>{try{const raw=LS("rp");if(raw===null)return BASE.map(n=>mkPan(n));const j=JSON.parse(raw||"[]");return Array.isArray(j)?j.filter(x=>x&&typeof x.n==="string"&&x.n.trim()).map(x=>mkPan(x.n.trim(),x.f)):[]}catch(e){return[]}};
function panCache(){const k=LS("rp")+"\u0001"+LS("rcat")+"\u0001"+LS("rcg");if(k!==_pk){_pv=parsePan();_pk=k;_pt=null;_pi=null}return _pv}
const getPan=()=>panCache().map(p=>({n:p.n,cat:p.cat,f:[...p.f]}));
const panTok=()=>{panCache();return _pt||(_pt=_pv.map(p=>[...new Set(toks(p.n))]))};
const putPan=l=>LS("rp",JSON.stringify(l.map(p=>({n:p.n,f:p.f}))));
/* legaturi: forme care apartin aceluiasi produs (extinde dupa nevoie) */
const ALIAS={ou:"ou",oua:"ou",ouale:"ou",galbenus:"ou",galbenusuri:"ou",galbenusul:"ou",albus:"ou",albusuri:"ou",albusul:"ou"};
const ALIAS_NUME={ou:"oua"};
const STOPW=new Set(["de","din","cu","la","si","sau","in","pe","un","o","fiert","fierte","fiarta","fiarte","proaspat","proaspata","proaspete","tocat","tocata","tocati","tocate","ras","rasa","rase","gatit","gatita","mare","mici","mic","mica","bucati","felii","optional","dupa","gust",
 /* 3.20.0: felul in care e taiat sau masurat un aliment tine de gatire, nu de produs */
 "taiat","taiata","taiati","taiate","marunt","maruntit","maruntita","maruntiti","maruntite","cuburi","cubulete","cubulet","feliat","feliata","feliati","feliate","rondele","fasii","pisat","pisata","pisati","pisate","zdrobit","zdrobita","zdrobiti","zdrobite","curatat","curatata","curatati","curatate","catei","catel"]);
function stem(w){if(ALIAS[w])return ALIAS[w];if(w.length>5&&w.endsWith("uri"))w=w.slice(0,-3);else if(w.length>4&&w.endsWith("ii"))w=w.slice(0,-2);else if(w.length>4&&/[ie]$/.test(w))w=w.slice(0,-1);return ALIAS[w]||w}
/* 5.0.1: "pasta" (de ton, de tomate) nu e "paste" (spaghete etc.): cuvant separat */
const toks=n=>norm(String(n||"").replace(/\([^)]*\)/g," ")).split(/[^a-z0-9]+/).filter(w=>w&&!STOPW.has(w)&&!/^\d+$/.test(w)).map(w=>w==="pasta"?"zpasta":stem(w));
const tokEq=(a,b)=>a===b||(Math.min(a.length,b.length)>=3&&(a.startsWith(b)||b.startsWith(a)));
/* un produs e "in debara" daca are aceleasi cuvinte ca o intrare din debara (ulei != ulei de masline) */
/* 4.7.0: marcajele din debara conteaza la potrivire. Un ingredient care isi spune forma ("rosii uscate", "mazare congelata", "rosii conserva", "rosii in suc propriu") e "in debara" doar daca produsul are bifat marcajul acela (sau nu are niciun marcaj bifat). Un ingredient fara forma ("rosii") se potriveste cu orice marcaj. Produsul ramane pe o singura linie in debara. */
const FORMW={congelat:"congelat",congelata:"congelat",congelate:"congelat",congelati:"congelat",uscat:"uscat",uscata:"uscat",uscate:"uscat",uscati:"uscat",deshidratat:"uscat",deshidratata:"uscat",deshidratate:"uscat",deshidratati:"uscat",conserva:"conserva",conserve:"conserva",proaspat:"proaspat",proaspata:"proaspat",proaspete:"proaspat",proaspeti:"proaspat"};
/* 4.22.0: cuvinte de forma pentru produse cu marcaje (usturoi catei/pudra, vanilie esenta/extract): devin marcaj doar daca produsul are categorie cu marcaje (zahar pudra ramane zahar pudra) */
const FORMX={catei:"proaspat",catel:"proaspat",pastaie:"proaspat",pastai:"proaspat",pudra:"uscat",macinat:"uscat",macinata:"uscat",macinati:"uscat",macinate:"uscat",fulgi:"uscat",granulat:"uscat",granulata:"uscat",granule:"uscat",esenta:"altceva",extract:"altceva",pasta:"altceva"};
function formSplit(name){const z=norm(String(name||"")),f=new Set(),ws=z.split(/[^a-z0-9]+/);ws.forEach(w=>{if(FORMW[w])f.add(FORMW[w])});if(/in suc propriu/.test(z))f.add("conserva");
 /* 5.1.6: muraturile (murati, murate, in otet, in saramura) sunt la borcan: marcajul "altceva" */
 const mur=/\b(murat[aei]?|murate|muraturi)\b|in otet|in saramura/.test(z);if(mur&&!f.size)f.add("altceva");
 let fx=false;if(ws.some(w=>FORMX[w])){const b=ws.filter(w=>w&&!FORMW[w]&&!FORMX[w]).join(" ");if(b&&FCAT.includes(catOf(b))){fx=true;ws.forEach(w=>{if(FORMX[w])f.add(FORMX[w])})}}
 const base=norm(String(name||"").replace(/\([^)]*\)/g," ")).replace(/in suc propriu/g," ").split(/[^a-z0-9]+/).filter(w=>w&&!FORMW[w]&&!(fx&&FORMX[w])).join(" ");return{t:[...new Set(toks(base))],f,mur}}
const fKey=n=>formSplit(n).t.slice().sort().join(" ");
/* numele fara cuvintele de forma: "Rosii, conserva" -> "Rosii"; "pudra de usturoi" -> "usturoi" */
function baseName(n){const o=String(n||"").trim();const w=o.replace(/in\s+suc\s+propriu/ig," ").split(/[\s,]+/).filter(x=>x&&!FORMW[norm(x)]&&!FORMX[norm(x)]);while(w.length&&/^(de|din|cu|la|in|si)$/.test(norm(w[0])))w.shift();while(w.length&&/^(de|din|cu|la|in|si)$/.test(norm(w[w.length-1])))w.pop();return w.length?w.join(" "):o}
function splitNm(name){const q=formSplit(name);if(!q.f.size)return{n:name,f:[]};const bn=baseName(name);return FCAT.includes(catOf(bn))?{n:bn,f:[...q.f]}:{n:name,f:[]}}
const panItems=()=>{panCache();return _pi||(_pi=_pv.map(p=>{const q=formSplit(p.n);(p.f||[]).forEach(x=>q.f.add(x));q.dc=catOf(p.n)==="leguminoase";q.cd=catOf(p.n)==="condimente";return q}))};
/* 4.22.0: ingredientul fara forma inseamna proaspat; produsul fara niciun marcaj bifat acopera orice forma */
const PRO=new Set(["proaspat"]),PRL=new Set(["proaspat","uscat"]);
/* 5.1.3: condimentul cerut fara forma (piper, boia) e acoperit de orice forma din debara */
const formOk=(q,p)=>!p.f.size||!q.f.size&&p.cd||q.mur&&(p.f.has("altceva")||p.f.has("conserva"))||[...(q.f.size?q.f:p.dc?PRL:PRO)].some(x=>p.f.has(x));
const fLab=f=>FI[f][0].split(" (")[0].toLowerCase();
/* produsul e in debara, dar sub alta forma decat cea ceruta: formele pe care le ai */
function pOther(name){const q=formSplit(name),t=q.t;if(!t.length)return[];const p=panItems().find(p=>p.t.length&&p.t.every(w=>t.some(x=>tokEq(w,x)))&&t.every(x=>p.t.some(w=>tokEq(w,x)))&&!formOk(q,p));return p?[...p.f]:[]}
function inPantry(name){const q=formSplit(name),t=q.t;if(!t.length)return false;return panItems().some(p=>p.t.length&&p.t.every(w=>t.some(x=>tokEq(w,x)))&&t.every(x=>p.t.some(w=>tokEq(w,x)))&&formOk(q,p))}
if(!LS("rdef4")){try{(JSON.parse(LS("rp")||"[]")||[]).forEach(x=>{if(x&&typeof x.n==="string"&&CATS.some(c=>c[0]===x.cat)&&x.cat!==guessCat(x.n))setCat(x.n,x.cat)})}catch(e){dbg(e)}LS("rdef4","1")}
/* 4.22.0: liniile care difera doar prin forma (Rosii / Rosii deshidratate / Rosii, conserva; Usturoi / Usturoi, catei / Usturoi, pudra) se aduna intr-una, cu marcajele reunite; se repeta la pornire (idempotent), ca sa prinda si date aduse de pe alt dispozitiv */
let PMIG=null;
function panUnify(){const raw=LS("rp");if(raw===null)return null;let j;try{j=JSON.parse(raw)}catch(e){return null}if(!Array.isArray(j))return null;
 const rows=j.filter(x=>x&&typeof x.n==="string"&&x.n.trim()).map(x=>({n:x.n.trim(),f:Array.isArray(x.f)?x.f:[]})),gs=[],ord=[];
 rows.forEach(r=>{const key=fKey(r.n),g=key?gs.find(g=>g.k===key):null;if(g)g.m.push(r);else{const g2={k:key,m:[r]};gs.push(g2);ord.push(g2)}});
 if(!ord.some(g=>g.m.length>1))return null;
 const cats=getCats(),out=[];let n=0;const drop=[];
 ord.forEach(g=>{if(g.m.length===1){out.push(g.m[0]);return}
  const plain=g.m.filter(r=>!formSplit(r.n).f.size&&!r.f.length),base=(g.m.find(r=>!formSplit(r.n).f.size)||g.m[0]),nm=formSplit(base.n).f.size?baseName(base.n):base.n;
  const f=new Set();g.m.forEach(r=>{r.f.forEach(x=>f.add(x==="neprocesat"?"proaspat":x));formSplit(r.n).f.forEach(x=>f.add(x))});if(plain.length&&f.size)f.add("proaspat");
  const own=cats.find(c=>cn(c.n)===cn(nm)),oth=g.m.map(r=>cats.find(c=>cn(c.n)===cn(r.n))).find(Boolean);if(!own&&oth)drop.push({n:nm,c:oth.c});
  out.push({n:nm,f:[...f]});n+=g.m.length-1});
 const keep=new Set(out.map(r=>cn(r.n))),nc=cats.filter(c=>keep.has(cn(c.n)));drop.forEach(d=>{if(!nc.some(c=>cn(c.n)===cn(d.n)))nc.push({n:d.n,c:d.c})});
 LS("rpbak4220",raw);LS("rcatbak4220",LS("rcat")||"");const before={rp:raw,rcat:LS("rcat")};LS("rp",JSON.stringify(out.map(r=>({n:r.n,f:r.f}))));putCats(nc);return{n,before}}
PMIG=panUnify();
if(!LS("rdef3")){BASE.forEach(addPan);LS("rdef3","1")} /* 1.8.1: produsele de baza intra in debara, o singura data */
const hid=x=>!x.done&&HP&&inPantry(x.n);
const cleanName=n=>String(n||"").replace(/\([^)]*\)/g," ").replace(/\s+/g," ").trim();
const sugName=n=>{const t=toks(n).find(w=>ALIAS_NUME[w]);return t?ALIAS_NUME[t]:cleanName(n)};
function addPan(name){name=String(name||"").trim().slice(0,60);if(!name)return false;const l=getPan(),k=norm(name).trim();if(l.some(x=>norm(x.n).trim()===k))return false;
 const q=formSplit(name),key=fKey(name),ex=key?l.find(x=>fKey(x.n)===key):null;
 /* 4.22.0: acelasi produs sub alta forma = aceeasi linie, cu marcajul in plus (returneaza true doar pentru linie noua) */
 if(ex){if(!FCAT.includes(ex.cat)||!ex.f.length)return false;const add=[...(q.f.size?q.f:PRO)].filter(x=>!ex.f.includes(x));if(!add.length)return false;ex.f=[...ex.f,...add];putPan(l);return "f"}
 if(l.length>=500){toast("Debaraua are deja 500 de produse.");return false}const sp=splitNm(name);l.push(mkPan(sp.n,sp.f));putPan(l);return true}
const P_TIP=/^(pudra|ulei|sos|suc|unt|faina|pasta|zeama|lapte|otet|extract|concentrat|piure|sirop|fulgi|crema|gem|dulceata|ceai|amidon|esenta|bulion|amestec|mix|condiment)\s+de\s+(.+)$/,P_DROP=/^(seminte|boabe|frunze|bulbi|fructe|flori)\s+de\s+(.+)$/;
/* nume afisat in Debara: "pudra de usturoi" -> "usturoi, pudra" (se sorteaza langa usturoi); "seminte de susan" -> "susan". Numele salvat nu se schimba. */
const pDisp=n=>{const t=String(n).trim(),z=norm(t);if(z.length!==t.length)return t;let m=P_DROP.exec(z);if(m)return t.slice(t.length-m[2].length);m=P_TIP.exec(z);return m?t.slice(t.length-m[2].length)+", "+t.slice(0,m[1].length).toLowerCase():t};
const FLEG={proaspat:"proaspat (si catei)",uscat:"uscat (si pudra)",altceva:"altceva (borcan, esenta)"};
function drawPantry(){const l=getPan(),PQ=norm($("#pin").value||"").trim().split(/\s+/).filter(Boolean),lv=PQ.length?l.filter(p=>PQ.every(w=>norm(p.n+" "+pDisp(p.n)).includes(w))):l;
 $("#pcn").textContent=l.length?(PQ.length?lv.length+" din "+l.length:l.length)+" produse":"";
 $("#pl").innerHTML=l.length?`<div class="plg"><div class="fleg"><span>${CART.replace('width="20" height="20"','width="16" height="16"')} am terminat (revine in Cumparaturi)</span><span><b>&#8943;</b> editeaza / scoate</span></div>${FCAT.length?`<div class="fleg">${FORMS.map(f=>`<span>${fIco(f)} ${esc(FLEG[f]||fLab(f))}</span>`).join("")}</div>`:""}</div><div class="pgrid">`+CATS.map(([id,lab])=>{const it=lv.filter(p=>p.cat===id).sort((a,b)=>norm(pDisp(a.n)).localeCompare(norm(pDisp(b.n)),"ro")||norm(a.n).localeCompare(norm(b.n)));
  if(!it.length)return"";return `<section class="pcat" aria-label="${esc(lab)}"><h3>${esc(lab)} <span class="muted">${it.length||""}</span></h3>`+(it.length?it.map(p=>PED===p.n?`<div class="pit pedit"><input id="pen" maxlength="60" value="${esc(p.n)}" aria-label="Nume produs"><select id="pec" class="lcs" aria-label="Categorie">${CATS.map(([cid,cl])=>`<option value="${esc(cid)}"${cid===p.cat?" selected":""}>${esc(cl)}</option>`).join("")}</select><div class="pa"><button class="go" data-pesave="1">Salveaza</button><button class="alt" data-pecancel="1">Anuleaza</button></div></div>`:`<div class="pit"><div class="pn">${esc(cap(pDisp(p.n)))}</div>${FCAT.includes(id)?`<div class="pf">${FORMS.map(f=>`<button type="button" class="fchip${p.f.includes(f)?" on":""}" data-pf="${f}" data-pn="${esc(p.n)}" aria-pressed="${p.f.includes(f)}" aria-label="${esc(FI[f][0])}" title="${esc(FI[f][0])}">${fIco(f)}</button>`).join("")}</div>`:""}<div class="pa"><button class="alt ib" data-pdone="${esc(p.n)}" title="Am terminat: il pune inapoi in Cumparaturi" aria-label="Am terminat ${esc(p.n)}: il pune inapoi in Cumparaturi">${CART}</button><details class="mre pmenu"><summary class="ib" aria-label="Mai multe pentru ${esc(p.n)}" title="Editeaza sau scoate">&#8943;</summary><div class="pmen"><button class="alt" data-pedit="${esc(p.n)}">Editeaza</button><button class="alt" data-pdel="${esc(p.n)}">Scoate din debara</button></div></details></div></div>`).join(""):`<p class="muted mt4 mb0" >-</p>`)+`</section>`}).join("")+(PQ.length&&!lv.length?`<p class="muted">Nu e in debara: "${esc($("#pin").value.trim())}". Apasa Adauga ca sa-l pui.</p>`:"")+`</div>`:'<p class="muted">Debaraua e goala. Adauga produse sau muta-le din Cumparaturi cu "Am in debara".</p>'}
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
 if(d.pdone!==undefined){const u=undoMark(["rp","rcat","rl"]),row=getPan().find(x=>x.n===d.pdone),f1=row&&row.f.length===1&&!/^(proaspat|altceva)$/.test(row.f[0])?" "+row.f[0]:"",ln=d.pdone+f1;putPan(getPan().filter(x=>x.n!==d.pdone));addList([{n:ln,u:"",c:null}],"Debara");drawPantry();undoShow("\""+ln+"\" a fost pus inapoi in Cumparaturi.",u,redrawAll)}};
function navCount(){const n=getList().filter(x=>!x.done&&!hid(x)).length;document.querySelector('#gnav [data-g=lis] .nlb').textContent="Cumparaturi"+(n?" ("+n+")":"")}
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
/* 4.11.0: titluri de sectiune scrise ca ingrediente ("Foi", "Umplutura", "Pentru crema"): fara cantitate si unitate, sunt titluri, nu produse. Doar in liste cu mai multe linii (o singura linie adaugata manual ramane produs). Datele nu se schimba. */
const SEC_DEF=["foi","umplutura","crema","glazura","blat","blaturi","aluat","aluatul","sirop","imbibatie","decor","decorare","topping","garnitura","ornat","sos"];
let _sk=null,_ss=null;const getSec=()=>{const raw=LS("rsec");if(raw!==_sk||!_ss){_sk=raw;let l=null;try{l=JSON.parse(raw)}catch(e){dbg(e)}_ss=Array.isArray(l)?l.filter(x=>typeof x==="string"):SEC_DEF.slice()}return _ss};
const putSec=l=>LS("rsec",JSON.stringify(l));
const isSec=x=>{if(!x)return false;const nm=norm(String(x.n||x.nume||"")).replace(/[:.\s]+$/,"").trim(),q=x.c!=null?x.c:x.cantitate;if(!nm||(q!==""&&q!=null&&!isNaN(+q))||String(x.u||x.unitate||"").trim())return false;const S=getSec();if(S.includes(nm))return true;const m=nm.match(/^pentru (.+)$/);return !!(m&&S.includes(m[1]))};
function prepIngs(ings){const out=[];let skip=false;const multi=(ings||[]).length>1;
 (ings||[]).forEach(x=>{if(!x||isWater(x.n))return;const nm=String(x.n||"").trim(),noQ=(x.c===""||x.c==null||isNaN(+x.c))&&!String(x.u||"").trim();
  if(multi&&isSec(x))return;
  if(noQ&&nm&&((nm===nm.toUpperCase()&&/[A-Z\u0102\u00c2\u00ce\u0218\u021a]{2}/.test(nm))||/:$/.test(nm))){skip=/\bvariante\b/i.test(nm);return}
  if(skip&&!x.g)return;if(x.g&&/\bvariante\b/i.test(x.g))return;
  if(noQ&&(/^(se|pentru [^:]*,|v\.|aceleasi)\s/i.test(norm(nm))||nm.length>90))return;
  if(noQ){const body=nm.replace(/\([^)]*\)/g," "),lab=body.match(/^([^:\d]{2,40}):\s*(.*)$/),txt=lab?lab[2]:body;
   const SP=/^(sare|piper|boia|cimbru|oregano|busuioc|tarhon|dafin|foi|nucsoara|scortisoara|vanilie|zahar|stevia|rozmarin|cimbrisor|patrunjel|marar|leustean|usturoi|lamaie|zeama|suc|ulei|otet|mustar|chimen|ghimbir|turmeric|curcuma|paprika|ienibahar)\b/;
   if(lab||(/[,;]|\s(si|\u0219i)\s/.test(body)&&txt.split(/[,;]|\s+(?:si|\u0219i)\s+/).some(t=>SP.test(norm(t.trim()))))){const bits=txt.split(/[,;]|\s+(?:si|\u0219i)\s+/).map(bit);if(bits.length&&bits.every(Boolean)){bits.forEach(b=>out.push(b));return}
    const ok=bits.filter(Boolean);if(lab){ok.forEach(b=>out.push(b));return}}}
  out.push(x)});
 return out}
/* 3.13.0: cheie de produs care ignora singular/plural (castravete = castraveti, rosie = rosii): fiecare cuvant pierde terminatia -ie/-ii/-i/-e/-a */
const stemW=w=>w.length>4?w.replace(/(ie|ii|i|e|a)$/,""):w;
/* 3.20.0: produsul din lista nu tine cont de cum e taiat ("ceapa tocata marunt" = "ceapa", "cartofi, taiati cuburi" = "cartofi"), de "de" de la inceput ("de usturoi" = "usturoi") si de unde sta cuvantul de masura ("3 catei usturoi" = "usturoi, 3 catei"). Carnea tocata ramane carne tocata. */
const PREPW=new Set(["taiat","taiata","taiati","taiate","tocat","tocata","tocati","tocate","marunt","maruntit","maruntita","maruntiti","maruntite","fin","cuburi","cubulete","cubulet","feliat","feliata","feliati","feliate","felii","rondele","fasii","pisat","pisata","pisati","pisate","zdrobit","zdrobita","zdrobiti","zdrobite","curatat","curatata","curatati","curatate","ras","rasa","rase","dupa","gust","optional"]);
function lClean(n,u){let t=String(n||"").replace(/\s+/g," ").trim();u=String(u||"").trim();
 t=t.replace(/^de\s+/i,"");
 const m=/^(catei|catel)\s+(?:de\s+)?(\S.*)$/i.exec(t);if(m&&(!u||/^cate[il]$/i.test(u))){t=m[2];u="catei"}
 if(/^catel$/i.test(u))u="catei";
 const meat=/\b(carne|vita|porc|pui|curcan|miel|peste)\b/.test(norm(t));
 const isP=w=>{w=norm(w).replace(/[^a-z]/g,"");return w==="in"||w==="si"||w==="foarte"||(PREPW.has(w)&&!(meat&&/^tocat/.test(w)))};
 const segs=t.split(",").map(x=>x.trim()).filter(Boolean);if(!segs.length)return{n:t,u};
 const keep=segs.filter((x,i)=>i===0||!x.split(/\s+/).every(isP));
 const w=keep[0].split(/\s+/);while(w.length>1&&isP(w[w.length-1]))w.pop();keep[0]=w.join(" ");
 return{n:keep.join(", "),u}}
const lkey=(n,u)=>{const c=lClean(n,u);return norm(c.n).split(/\s+/).filter(Boolean).map(stemW).join(" ")+"|"+norm(c.u).split(/\s+/).filter(Boolean).map(stemW).join(" ")};
function listDedupe(){const l=getList(),out=[];let ch=false;
 /* 5.1.5: liniile vechi ("Piept de pui fiert (sau ...)") primesc numele de cumparat, ca sa se uneasca cu "Piept de pui" */
 l.forEach(x=>{if(!x||x.done||typeof x.n!=="string")return;const nn=x.n.replace(/\s*\(\s*sau\b[^)]*\)/ig,"").trim().replace(BUYST,"").trim();if(nn&&nn!==x.n){x.n=nn;ch=true}});
 const mp=new Map();l.forEach(x=>{const kk=x.done?null:lkey(x.n,x.u),t=kk?mp.get(kk):null;if(!t){out.push(x);if(kk)mp.set(kk,x);return}ch=true;
  const tp=Array.isArray(t.parts)?t.parts:t.src.length===1?[{s:t.src[0],c:t.c}]:null,xp=Array.isArray(x.parts)?x.parts:x.src.length===1?[{s:x.src[0],c:x.c}]:null;
  if(t.c!=null&&x.c!=null)t.c=+(t.c+x.c).toFixed(2);else if(t.c==null)t.c=x.c;
  x.src.forEach(s=>{if(!t.src.includes(s))t.src.push(s)});
  if(tp&&xp){xp.forEach(p=>{const q=tp.find(z=>z.s===p.s);if(q)q.c=q.c!=null&&p.c!=null?+(q.c+p.c).toFixed(2):(q.c==null?p.c:q.c);else tp.push(p)});t.parts=tp}else delete t.parts});
 if(ch)putList(out);return ch}
const inCartAny=t=>getList().some(x=>!hid(x)&&(x.src||[]).some(s=>s===t||s.startsWith(t+" (meniu "))); /* 3.20.0: produsele ascunse (le ai in debara) nu mai inseamna "deja in cumparaturi" */
const inCart=t=>getList().some(x=>(x.src||[]).includes(t));
const cumBtn=(t,at)=>inCart(t)?`<button class="alt on" data-${at}="1" aria-pressed="true">&#10003; In cumparaturi</button>`:`<button class="alt" data-${at}="1" aria-pressed="false">Adauga la cumparaturi</button>`;
function cartRemove(t){const l=getList();l.forEach(x=>{if(!(x.src||[]).includes(t))return;const pt=(x.parts||[]).find(p=>p.s===t);if(pt&&x.c!=null&&pt.c!=null)x.c=+(x.c-pt.c).toFixed(2);x.parts=(x.parts||[]).filter(p=>p.s!==t);x.src=x.src.filter(s=>s!==t)});putList(l.filter(x=>x.src.length));navCount()}
function cartToggle(t,ings,redraw){if(inCart(t)){const u=undoMark(["rl"]);cartRemove(t);redraw();undoShow("Scoasa din cumparaturi: "+t+".",u,()=>{navCount();redraw()})}else{const n=addList(ings,t);redraw();toast("Adaugat la cumparaturi ("+n+" produse).")}}
/* 5.0.0: ingredientul din reteta devine produsul pe care il cumperi: galbenusurile si albusurile sunt oua, zeama si coaja de lamaie sunt lamai */
/* 5.1.5: "Piept de pui fiert (sau pulpa de curcan)" se cumpara ca "Piept de pui": fara alternativele "(sau ...)" si fara starea de gatire de la final */
const BUYST=/\s+(fiert|fiarta|fierti|fierte|copt|coapta|copti|coapte|prajit|prajita|prajiti|prajite|gatit|gatita|gatiti|gatite|rumenit|rumenita|rumeniti|rumenite)\s*$/i;
function buyMap(x){if(!x||typeof x.n!=="string")return x;{const nn=x.n.replace(/\s*\(\s*sau\b[^)]*\)/ig,"").trim().replace(BUYST,"").trim();if(nn&&nn!==x.n)x=Object.assign({},x,{n:nn})}const n=norm(x.n).trim(),u=norm(x.u||""),c=x.c==null||isNaN(+x.c)?null:+x.c;
 const ml=c==null?null:/^(ml)$/.test(u)?c:/^lingur(a|i)$/.test(u)?c*15:/^lingurit(a|e)$/.test(u)?c*5:/^g$/.test(u)?c:null;
 const cnt=(per)=>c==null?null:u===""?c:ml!=null?Math.max(1,Math.ceil(ml/per)):null;
 let m=/^(galbenus|galbenusuri)( de oua?)?$/.exec(n);if(m)return Object.assign({},x,{n:"oua",u:"",c:cnt(18)});
 m=/^(albus|albusuri)( de oua?)?$/.exec(n);if(m)return Object.assign({},x,{n:"oua",u:"",c:cnt(33)});
 if(/^oua? fiert[ei]?$/.test(n))return Object.assign({},x,{n:"oua",u:""});
 m=/^(zeama|suc|coaja|coaja rasa)( proaspat[a]?)? (de|din|de la)( o| 1)? (lamaie|lime)$/.exec(n);if(m){const lm=m[5]==="lime"?"lime":"lamaie";return Object.assign({},x,{n:lm,u:"",c:/^coaja/.test(m[1])?1:cnt(35)})}
 return x}
const lPrep=ings=>prepIngs((ings||[]).map(x=>x&&typeof x.n==="string"?buyMap(Object.assign({},x,{n:x.n.replace(/[,\s]+(dupa gust|optional)\s*$/i,"")})):x));
/* 4.4.0: "1 lingura ulei" si "5 g ulei" sunt acelasi produs. Cand in lista exista deja produsul in grame (sau il adaugi in grame peste linguri), lingurile, lingurite si canile se transforma in grame dupa tabelul Masuri si se aduna. */
const SPOON=/^(lingur|cana|cani|ceasc|cest)/;
function toG(n,u,c){if(c==null)return null;try{const f=fdMatch(n);if(!f)return null;const q=fdGrams({c,u,n},f);return q&&q.g>0?Math.round(q.g):null}catch(e){dbg(e);return null}}
const nKey=n=>lkey(n,"").split("|")[0];
function lUnify(l,nm,u,c){if(c==null)return null;const sp=SPOON.test(norm(u)),isG=/^g$/i.test(u);if(!sp&&!isG)return null;const k=nKey(nm);
 const y=l.find(z=>!z.done&&z.c!=null&&nKey(z.n)===k&&(sp?/^g$/i.test(z.u||""):SPOON.test(norm(z.u||""))));if(!y)return null;
 if(sp){const g=toG(nm,u,c);return g?{c:g,u:"g"}:null}
 const g=toG(y.n,y.u,y.c);if(!g)return null;const f=g/y.c;(y.parts||[]).forEach(p=>{if(p.c!=null)p.c=Math.round(p.c*f)});y.c=g;y.u="g";y.k=lkey(y.n,"g");return{c,u:"g"}}
function addList(ings,title){const l=getList();let n=0;ings=lPrep(ings);
 ings.forEach(x=>{const cl=lClean(x.n,x.u),nm=cl.n;if(!nm)return;let u=cl.u,c=(x.c===""||x.c==null||isNaN(+x.c))?null:+x.c;
  if(c!=null&&/^kg$/i.test(u)){c=+(c*1000).toFixed(2);u="g"}else if(c!=null&&/^l$/i.test(u)){c=+(c*1000).toFixed(2);u="ml"}
  {const un=lUnify(l,nm,u,c);if(un){c=un.c;u=un.u}}
  const k=lkey(nm,u);
  let it=l.find(y=>lkey(y.n,y.u)===k&&!y.done);
  if(it&&!it.parts&&it.src.length===1)it.parts=[{s:it.src[0],c:it.c}];
  if(it){if(it.c!=null&&c!=null)it.c=+(it.c+c).toFixed(2);else if(it.c==null)it.c=c;if(!it.src.includes(title))it.src.push(title);
   if(it.parts){const pt=it.parts.find(p=>p.s===title);if(pt)pt.c=pt.c!=null&&c!=null?+(pt.c+c).toFixed(2):(pt.c==null?c:pt.c);else it.parts.push({s:title,c})}}
  else l.push({k,n:nm,u,c,src:[title],parts:[{s:title,c}],done:0});n++});
 putList(l);navCount();return n}
/* 4.7.1: o reteta apare o singura data la aceeasi masa; dublurile vechi se aduna intr-una la pornire, restaurare si sincronizare */
function menDedupe(){try{const m=getMen();let n=0,lst=new Set();
 Object.keys(m).forEach(d=>SLOTS.forEach(([s])=>{const a=m[d][s];if(!a)return;const seen=new Set(),out=[];
  a.forEach(en=>{if(en.s!=="x"&&en.k){if(seen.has(en.k)){n++;if(en.L)lst.add(en.t+" (meniu "+ZILE[dFrom(d).getDay()].toLowerCase()+")");return}seen.add(en.k)}out.push(en)});m[d][s]=out}));
 if(!n)return 0;putMen(m);lst.forEach(t=>removeSrc(t));return n}catch(e){dbg(e);return 0}}
/* 4.7.1: produsele care vin dintr-o masa scoasa din meniu nu mai au rost in lista; se scot la pornire si la deschiderea listei */
function lOrphan(){try{const l=getList();if(!l.length)return 0;const live=new Set(),m=getMen();
 Object.keys(m).forEach(d=>SLOTS.forEach(([s])=>(m[d][s]||[]).forEach(en=>{if(en.L)live.add(en.t+" (meniu "+ZILE[dFrom(d).getDay()].toLowerCase()+")")})));
 const dead=t=>/ \(meniu [^)]*\)$/.test(t)&&!live.has(t);let n=0,ch=false;const out=[],nm=[];
 l.forEach(x=>{if(!(x.src||[]).some(dead)){out.push(x);return}ch=true;
  if(Array.isArray(x.parts)){x.parts=x.parts.filter(p=>!dead(p.s));if(!x.parts.length){n++;nm.push(cap(x.n));return}
   const cs=x.parts.map(p=>p.c).filter(c=>c!=null);x.c=cs.length?+cs.reduce((a,c)=>a+c,0).toFixed(2):null;x.src=x.parts.map(p=>p.s);out.push(x)}
  else{x.src=x.src.filter(t=>!dead(t));if(!x.src.length){n++;nm.push(cap(x.n));return}out.push(x)}});
 if(ch){putList(out);navCount()}return nm}catch(e){dbg(e);return[]}}
const orfTxt=a=>a.length?"Am scos din lista "+a.length+(a.length===1?" produs":" produse")+" ale unor mese care nu mai sunt in meniu: "+a.slice(0,8).join(", ")+(a.length>8?" si "+(a.length-8)+" altele":"")+".":"";
/* 2.24.1: scoate dintr-o sursa (reteta / intrare din meniu) doar partea ei din lista */
function removeSrc(title){const l=getList(),out=[];let rem=0,red=0,kept=0;
 l.forEach(x=>{if(!x.src.includes(title)){out.push(x);return}
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
(function(){try{const l=getList();let ch=0;l.forEach(x=>{if(!x.parts&&x.src&&x.src.length===1){x.parts=[{s:x.src[0],c:x.c}];ch++}});if(ch)LS("rl",JSON.stringify(l))}catch(e){dbg(e)}})();
/* Anuleaza: instantaneu la stergere, cu 8 secunde pentru a reveni (in loc de "Confirma") */
let UDO=null,UDT=0;
const undoMark=keys=>{const s={};keys.forEach(k=>{try{s[k]=localStorage.getItem(k)}catch(e){s[k]=null}});return s};
function undoHide(){UDO=null;clearTimeout(UDT);$("#undo").classList.add("hidden")}
function undoShow(msg,snap,redraw){UDO={snap,redraw,after:undoMark(Object.keys(snap||{}))}; /* 4.1.1: tin minte si starea de dupa actiune */$("#undot").textContent=msg;$("#undo").classList.remove("hidden");clearTimeout(UDT);UDT=setTimeout(undoHide,8000)}
const redrawAll=()=>{navCount();drawList();drawPantry();drawMenu()};
/* 4.1.1: alt tab al aplicatiei a schimbat datele. Listele se redeseneaza (nu in timp ce scrii sau ai un dialog deschis); setarile tinute in memorie cer reincarcarea paginii. */
let STT=0,STN=0;const ST_CFG=/^(rtags|ra|rcg|rprof|rfd|rpf|rpxc)$/;
function stApply(){clearTimeout(STT);const a=document.activeElement,busy=(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))||!$("#mdlg").classList.contains("hidden")||!$("#cook").classList.contains("hidden");
 if(busy&&STN++<60){STT=setTimeout(stApply,1000);return}STN=0;
 try{redrawAll();if(!$("#v-salvate").classList.contains("hidden")&&!SV)renderSaved()}catch(e){dbg(e)}}
window.addEventListener("storage",e=>{if(!e.key||e.storageArea!==localStorage||!LSK.test(e.key)||typeof SYAPPLY!=="undefined"&&SYAPPLY)return;
 if(ST_CFG.test(e.key)){toast("Setarile s-au schimbat in alt tab. Reincarca pagina ca sa le vezi aici.");return}
 clearTimeout(STT);STN=0;STT=setTimeout(stApply,200)});
$("#undob").onclick=()=>{if(!UDO)return;const u=UDO;undoHide();
 {let same=true;try{Object.keys(u.after||{}).forEach(k=>{if(localStorage.getItem(k)!==u.after[k])same=false})}catch(e){dbg(e)}if(!same){toast("Nu mai pot anula: datele s-au schimbat intre timp (alt tab sau sincronizare).",true);return}}
 try{Object.keys(u.snap).forEach(k=>{if(u.snap[k]==null)localStorage.removeItem(k);else localStorage.setItem(k,u.snap[k])})}catch(e){toast("Nu am putut anula: memoria browserului nu mai raspunde.");return}
 u.redraw();toast("Anulat.")};
const fmtQ=c=>c>=10?String(Math.round(c)):c>=1?String(+c.toFixed(1)):String(+c.toFixed(2));
const cap=s=>{s=String(s==null?"":s);return s.charAt(0).toUpperCase()+s.slice(1)}; /* 2.24.1: doar afisare, datele raman cum sunt */
/* 4.20.0: textul unei retete (copiere / trimitere). Text simplu, fara diacritice; cantitatile sunt cele pentru portiile alese; la final sursa. */
const IC_COPY='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',IC_SEND='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
const recBtns=()=>`<button class="alt ico" data-rcp="1" aria-label="Copiaza reteta" title="Copiaza reteta">${IC_COPY}</button><button class="alt ico" data-rsh="1" aria-label="Trimite reteta" title="${canShare()?"Trimite reteta":"Trimite pe WhatsApp"}">${IC_SEND}</button>`;
function recTxt(kind,r){const b=kind==="b",ings=b?(r.ingrediente||[]).map(x=>({c:x.c!=null&&x.c!==""&&!isNaN(+x.c)?+x.c:null,u:x.u||"",n:x.n,g:x.g})).filter(x=>x.n):rawIngs("s",r),
  base=+r.portii>0?+r.portii:null,k=b?bKey(r):sKey(r),sn=base?(BSC&&BSC.k===k?BSC.n:base):null,f=base?sn/base:1,t=recT(r),st=recSteps(r),m=r.macro;
 let o=String(r.titlu||"Reteta")+"\n"+[sn?sn+(sn===1?" portie":" portii"):"",t?tTxt(t):""].filter(Boolean).join(" - ")+"\n";
 if(ings.length){o+="\nIngrediente\n";let g=null;ings.forEach(x=>{if(x.g&&x.g!==g){g=x.g;o+=cap(String(g))+":\n"}if(ings.length>1&&isSec(x)){o+=cap(String(x.n).replace(/[:.\s]+$/,""))+":\n";return}o+="- "+(x.c!=null?fmtQ(x.c*f)+" ":"")+(x.u?x.u+" ":"")+cap(x.n)+"\n"})}
 if(st.length)o+="\nMod de preparare\n"+st.map((x,i)=>(i+1)+". "+x).join("\n")+"\n";
 if(m&&m.kcal!=null)o+="\nMacro pe portie: "+Math.round(m.kcal)+" kcal"+(m.proteine!=null?", "+Math.round(m.proteine)+" g proteine":"")+"\n";
 o+="\n"+(b?(r.sursa==="Retetele mele"?"Retetele mele":(r.din?"Adaptata din ":"Din ")+((r.din?r.din.sursa:r.sursa)||"carte necunoscuta")+((r.din?r.din.nr:r.nr)!=null&&(r.din?r.din.nr:r.nr)!==""?", reteta "+(r.din?r.din.nr:r.nr):"")):"Generata cu AI");return o}
function recAct(kind,r,how){const t=recTxt(kind,r);
 if(how==="s"){if(canShare()){navigator.share({title:r.titlu,text:t}).catch(()=>{});return}window.open("https://wa.me/?text="+encodeURIComponent(t),"_blank","noopener");return}
 const ok=()=>toast("Reteta copiata."),old=()=>{try{const a=document.createElement("textarea");a.value=t;a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();const y=document.execCommand("copy");a.remove();y?ok():toast("Nu am putut copia.")}catch(e){dbg(e);toast("Nu am putut copia.")}};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,old);else old()}
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
/* 4.1.1: butoanele din lista tin si cheia produsului; daca lista s-a schimbat intre timp (alt tab), produsul e cautat dupa cheie, nu dupa pozitie */
const lIx=(l,d,i)=>{const k=d.lk,m=x=>!!x&&lkey(x.n,x.u)===k;if(k===undefined)return l[i]?i:-1;return m(l[i])?i:l.findIndex(m)};
/* 4.2.0: sugestie de ambalaj pentru cateva produse vandute la marime fixa (cantitatea din lista ramane cea exacta) */
const PACK=[["faina",1000],["faina alba",1000],["zahar",1000],["orez",500],["malai",1000],["gris",500],["paste",500],["paste uscate",500],["paste integrale",500],["lapte",1000],["unt",200],["smantana",200],["smantana dulce",200],["rosii conserva",400],["lapte de cocos",400]].map(([n,g])=>[[...new Set(toks(n))].sort().join(" "),g]);
function packTxt(x){if(x.done||x.c==null||!/^(g|ml)$/i.test(x.u||""))return"";const k=[...new Set(toks(lClean(x.n,x.u).n))].sort().join(" "),p=PACK.find(y=>y[0]===k);if(!p)return"";
 const n=Math.ceil(x.c/p[1]-1e-9),u=x.u.toLowerCase();if(n<1||n*p[1]===x.c)return"";return p[1]>=1000?fmtQ(n*p[1]/1000)+(u==="g"?" kg":" l"):(n>1?n+" x ":"")+p[1]+" "+u}
function lStale(){drawList();navCount();toast("Lista s-a schimbat intre timp; am actualizat-o. Incearca din nou.")}
function drawList(){listDedupe();const l=getList(),pan=getPan().length,vis=l.map((x,i)=>[x,i]).filter(([x])=>!hid(x)),np=l.filter(x=>!x.done&&HP&&inPantry(x.n)).length,need=l.some(x=>!x.done&&!inPantry(x.n)),dn=l.some(x=>x.done);
 vis.sort((a,b)=>a[0].done-b[0].done);
 const rowH=([x,i])=>PE===i?`<div class="it"><div style="flex-basis:100%"><div class="muted mb4" >Adauga in debara ca (nume general) si categorie:</div><input id="lpn" maxlength="60" value="${esc(sugName(x.n))}" aria-label="Nume in debara"></div><select id="lpc" class="lcs" aria-label="Categorie in debara">${CATS.map(([id,lab])=>`<option value="${esc(id)}"${catOf(sugName(x.n))===id?" selected":""}>${esc(lab)}</option>`).join("")}</select><button class="go m0" data-lpok="${i}" data-lk="${esc(lkey(x.n,x.u))}" >Muta</button><button class="alt" data-lpno="1">Anuleaza</button></div>`:`<div class="it${x.done?" done":""}"><input type="checkbox" data-ld="${i}" data-lk="${esc(lkey(x.n,x.u))}" ${x.done?"checked":""} aria-label="Cumparat"><div><div class="tx">${esc(itTxt(x))}${(t=>t?` <span class="muted">- cumperi ${esc(t)}</span>`:"")(packTxt(x))}${!HP&&!x.done&&inPantry(x.n)?` <span class="lb">in debara</span>`:""}${!x.done&&!inPantry(x.n)?(fo=>fo.length?` <span class="lb lbw">Ai in debara, dar ca: ${esc(fo.map(fLab).join(", "))}</span>`:"")(pOther(x.n)):""}</div><div class="src">${x.src.map(s=>`<button class="srcl" data-lsrc="${esc(s)}">${esc(s)}</button>`).join(", ")}</div></div>${x.done||(x.src.length===1&&x.src[0]==="Debara")?"":`<button class="alt" data-lp="${i}" data-lk="${esc(lkey(x.n,x.u))}" title="Am deja produsul: il muta in Debaraua mea">Am in debara</button>`}<button class="alt" data-lx="${i}" data-lk="${esc(lkey(x.n,x.u))}" aria-label="Scoate">x</button></div>`;
 let body;
 if(l.length&&!need)body=`<p class="okk">Nu mai ai nimic de cumparat.</p>${dn?'<div class="row lact"><button class="alt" id="lDn">Sterge bifate</button></div>':""}`+(GRP?CATS.map(([id,lab])=>{const g=vis.filter(([x])=>catOf(x.n)===id);return g.length?`<h3 class="lgh">${esc(lab)}</h3>`+g.map(rowH).join(""):""}).join(""):vis.map(rowH).join("")); /* 4.21.0: produsele bifate raman la vedere pana golesti lista */
 else if(!vis.length)body=`<p class="muted">${l.length?"Totul e ascuns sau bifat.":"Lista e goala. Scrie mai sus un produs sau deschide o reteta si apasa Adauga la cumparaturi. Bifeaza ce ai deja in casa direct aici."}</p>`;
 else if(LV==="r"){const srcs=[];l.forEach(x=>{if(!x.done)x.src.forEach(s=>{if(!srcs.includes(s))srcs.push(s)})});
  body=srcs.map((s,j)=>{const its=l.filter(x=>!x.done&&x.src.includes(s)&&!hid(x));if(!its.length)return"";
   return`<div class="lrg"><div class="lrh"><h3 class="lgh"><button class="srcl" data-lsrc="${esc(s)}">${esc(s)}</button></h3><button class="alt" data-lsr="${j}" aria-label="Scoate ${esc(s)} din lista" title="Scoate din lista">${IC_DEL}</button></div>`+its.map(x=>{const pt=x.parts&&x.parts.find(p=>p.s===s);const t=pt?itTxt({c:pt.c,u:x.u,n:x.n}):itTxt(x);return`<div class="lri"><span>${esc(t)}</span>${!pt&&x.src.length>1?` <span class="muted">(total, impreuna cu alte retete)</span>`:""}</div>`}).join("")+`</div>`}).join("")||`<p class="muted">Totul e bifat.</p>`;LSRC=srcs}
 else if(GRP)body=CATS.map(([id,lab])=>{const g=vis.filter(([x])=>catOf(x.n)===id);return g.length?`<h3 class="lgh">${esc(lab)}</h3>`+g.map(rowH).join(""):""}).join("");
 else body=vis.map(rowH).join("");
 const bn=LBN?`<div class="lbn"><span>Adaugat din meniu (${esc(LBN.label)}): <b>${LBN.n}</b> produse noi din ${LBN.r} retete${np?` (${np} ascunse, le ai in debara)`:""}${LBN.sk?` (${LBN.sk} fara ingrediente)`:""}${LBN.old?`; ${LBN.old} erau deja adaugate`:""}.</span><button class="alt" data-lbk="1">Inapoi la meniu</button><button class="alt" data-lbx="1" aria-label="Inchide">&times;</button></div>`:"";
 $("#ll").innerHTML=bn+`<div class="row ladd"><input id="lAddI" maxlength="120" placeholder="Adauga produs, ex: 2 l lapte, paine" aria-label="Produs nou in lista" autocomplete="off"><button class="go" id="lAddB">Adauga</button></div>`+(l.length&&need?`<div class="row mseg lseg"><button class="alt${LV==="p"?" on":""}" data-lv="p">Pe produse</button><button class="alt${LV==="r"?" on":""}" data-lv="r">Pe retete</button></div><div class="row lact"><button class="alt" id="lCp">Copiaza lista</button>${canShare()?`<button class="alt" id="lSh">Trimite lista</button>`:`<button class="alt" id="lWa">Trimite pe WhatsApp</button>`}<button class="alt" id="lDn">Sterge bifate</button></div>
 <label style="font-weight:400;margin:2px 0;display:flex;align-items:center;gap:8px"><input type="checkbox" id="lHp" class="wauto" ${HP?"checked":""}> Ascunde produsele din debara${pan?"":" (debaraua e goala)"}${np?" - "+np+" ascunse":""}</label><div id="lmsg" class="muted"></div>`:"")+body}
$("#ll").onchange=e=>{const d=e.target.dataset; if(e.target.id==="lHp"){HP=e.target.checked;try{localStorage.setItem("rhp",HP?"1":"0")}catch(x){dbg(x)}PE=null;drawList();navCount();return}
 
 if(d.ld!==undefined){const l=getList(),ix=lIx(l,d,+d.ld);if(ix<0){lStale();return}
  const it=l[ix];
  /* 4.21.0: randul din Debara ramane in lista, bifat, pana golesti lista; produsul intra in Debara la bifare si iese daca debifezi (doar daca bifarea l-a adus) */
  if(it.src.length===1&&it.src[0]==="Debara"){const u=undoMark(["rl","rp","rcat"]);
   if(e.target.checked){it.done=1;it.pan=addPan(it.n)===true?1:0}
   else{it.done=0;if(it.pan){const k=norm(it.n).trim();putPan(getPan().filter(x=>norm(x.n).trim()!==k))}it.pan=0}
   putList(l);navCount();drawList();drawPantry();undoShow(it.done?"Cumparat, inapoi in debara: "+cap(it.n)+".":"Debifat: "+cap(it.n)+" iese din debara.",u,redrawAll);return}
  it.done=e.target.checked?1:0;putList(l);navCount();drawList()}};
$("#ll").onkeydown=e=>{if(e.key==="Enter"&&e.target.id==="lAddI"){e.preventDefault();lAdd();return}if(e.key==="Enter"&&e.target.id==="lpn"){e.preventDefault();const b=document.querySelector("[data-lpok]");if(b)b.click()}if(e.key==="Escape"&&PE!==null){PE=null;drawList()}};
$("#ll").onclick=e=>{const b=e.target,d=b.dataset,id=b.id;
 if(d.lv){LV=d.lv;LS("rlv",LV);drawList();return}
 if(d.lsrc!==undefined){const t=d.lsrc.replace(/\s*\(meniu [^)]*\)$/,""),bi=BOOK.findIndex(r=>r.titlu===t&&!r.cos);if(bi>=0){show("carti");drawBook();openBook(bi,BOOK[bi].portii,"#bres")}else{toast("Reteta nu mai e in Biblioteca.",true);return}window.scrollTo(0,0);return}
 if(d.lsr!==undefined){const s=LSRC[+d.lsr];if(s){if(armDel(b))return;const u=undoMark(["rl","rmen"]),r=removeSrc(s);drawList();drawMenu();undoShow(srcMsg(s,r),u,redrawAll)}return}
 if(d.lbk){LBN=null;show("meniu");return}
 if(d.lbx){LBN=null;drawList();return}
 if(d.lp!==undefined){const ix=lIx(getList(),d,+d.lp);if(ix<0){lStale();return}PE=ix;drawList();const el=$("#lpn");if(el){el.focus();el.select()}return}
 if(d.lpno!==undefined){PE=null;drawList();return}
 if(d.lpok!==undefined){const nm=($("#lpn")||{}).value||"",l=getList(),ix=lIx(l,d,+d.lpok),it=l[ix];if(ix<0){PE=null;lStale();return}if(!nm.trim()||!it)return;const u=undoMark(["rl","rp","rcat"]),cv=($("#lpc")||{}).value;if(cv&&cv!==catOf(nm.trim()))setCat(nm.trim(),cv);addPan(nm);l.splice(ix,1);putList(l);PE=null;navCount();drawList();$("#lmsg").textContent="\""+nm.trim()+"\" e acum in Debaraua mea.";undoShow("Mutat in debara: "+nm.trim()+".",u,redrawAll);return}
 if(PE!==null)PE=null;
 if(d.lx!==undefined){const l=getList(),ix=lIx(l,d,+d.lx);if(ix<0){lStale();return}const u=undoMark(["rl"]),nm=(l[ix]||{}).n;l.splice(ix,1);putList(l);navCount();drawList();undoShow("Scos din lista: "+nm+".",u,redrawAll);return}
 if(id==="lAddB"){lAdd();return}
 if(id==="lSh"){const t=listTxt();if(!t){$("#lmsg").textContent="Nu ai nimic de trimis.";return}navigator.share({title:"Lista de cumparaturi",text:t}).catch(()=>{});return}
 /* 4.3.0: pe calculator (fara meniul de trimitere al telefonului) lista se deschide direct in WhatsApp */
 if(id==="lWa"){const t=listTxt();if(!t){$("#lmsg").textContent="Nu ai nimic de trimis.";return}window.open("https://wa.me/?text="+encodeURIComponent("Lista de cumparaturi\n"+t),"_blank","noopener");return}
 if(id==="lCp"){const t=listTxt(),m=$("#lmsg");
  const ok=()=>{m.textContent="Copiat. Poti lipi lista oriunde."};
  const manual=()=>{m.innerHTML='Nu pot copia automat in acest browser. Textul e selectat mai jos: apasa Ctrl+C (sau tine apasat si alege Copiaza).<textarea id="lTa" readonly rows="'+Math.min(12,t.split("\n").length+1)+'" style="width:100%;margin-top:6px"></textarea>';const ta=$("#lTa");ta.value=t;ta.focus();ta.select()};
  const old=()=>{const ta=document.createElement("textarea");ta.value=t;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();let r=false;try{r=document.execCommand("copy")}catch(x){dbg(x)}ta.remove();r?ok():manual()};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,old);else old();return}
 if(id==="lDn"){const u=undoMark(["rl"]),n0=getList().length;putList(getList().filter(x=>!x.done));navCount();drawList();const n1=getList().length;if(n0!==n1)undoShow("Produsele bifate au fost sterse ("+(n0-n1)+").",u,redrawAll)}};
if(!LS("rcl3")){const l0=getList(),l1=[];l0.forEach(x=>{const p=prepIngs([{c:x.c,u:x.u,n:x.n}]);p.forEach(q=>l1.push(Object.assign({},x,{n:q.n,k:norm(q.n)+"|"+norm(x.u||"")})))});if(l1.length!==l0.length||l1.some((q,i)=>q.n!==(l0[i]||{}).n))putList(l1);LS("rcl3","1")}
if(!LS("rcl4")){const l0=getList(),l1=l0.filter(x=>!(isSec({c:x.c,u:x.u,n:x.n})&&(x.src||[]).length&&!(x.src||[]).includes("Adaugat manual")&&!(x.src||[]).includes("Debara")));if(l1.length!==l0.length)putList(l1);LS("rcl4","1")} /* 4.11.0: scoate din lista titlurile de sectiune (Foi, Umplutura) aduse din retete inainte de aceasta versiune */
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
function wlOff(){try{WL&&WL.release()}catch(e){dbg(e)}WL=null}
document.addEventListener("visibilitychange",()=>{if(CK&&document.visibilityState==="visible")wlOn()});
function beep(n){try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;CTX=CTX||new A();if(CTX.state==="suspended")CTX.resume();
 for(let k=0;k<(n||3);k++)setTimeout(()=>{const o=CTX.createOscillator(),g=CTX.createGain();o.connect(g);g.connect(CTX.destination);o.frequency.value=880;g.gain.value=.25;o.start();o.stop(CTX.currentTime+.35)},k*550)}catch(e){dbg(e)}}
function cookOpen(title,steps,ing,note){if(!steps.length){toast("Reteta asta nu are pasi de afisat in modul gatit.");return}
 CK={title,steps,ing,note:note||"",i:0,arm:0};$("#cook").classList.remove("hidden");document.body.style.overflow="hidden";wlOn();drawCook();ckTimers();setTimeout(()=>{const b=document.querySelector("[data-ckn]");if(b)b.focus()},0)}
function cookClose(force){if(!CK)return;if(!force&&CT.some(t=>!t.done)&&!CK.arm){CK.arm=1;drawCook();return}
 CT=[];clearInterval(CTI);CTI=0;CK=null;wlOff();$("#cook").classList.add("hidden");$("#cook").innerHTML="";document.body.style.overflow=""}
function drawCook(){if(!CK)return;const s=CK.steps[CK.i],n=CK.steps.length,last=CK.i===n-1;
 $("#cook").innerHTML=`<div class="cookin" role="dialog" aria-modal="true" aria-label="Mod gatit"><div class="ckh"><div style="min-width:0"><b>${esc(CK.title)}</b><div class="muted">Pasul ${CK.i+1} din ${n}</div></div><button class="alt" data-ckx="1">${CK.arm?"Opreste cronometrele si inchide":"Inchide"}</button></div>
 <div class="ckbar" aria-hidden="true"><i style="width:${Math.round((CK.i+1)/n*100)}%"></i></div><div id="cktm"></div>
 <div class="ckstep">${s.ap?`<div>${tag(s.ap)}</div>`:""}<p>${esc(s.text)}</p>${s.par?`<div class="par fsm" >${esc(s.par)}</div>`:""}${(s.warn||[]).map(x=>`<div class="warn">${esc(x)}</div>`).join("")}
 ${s.min?`<button class="go mt12" data-cktm="${s.min}" data-cklab="Pasul ${CK.i+1}" >Porneste cronometrul (${s.min<1?Math.round(s.min*60)+" sec":+s.min.toFixed(1)+" min"})</button>`:""}</div>
 <div class="ckn"><button class="alt" data-ckp="1" ${CK.i?"":"disabled"}>Inapoi</button><button class="go m0" data-ckn="1" >${last?"Gata, pofta buna!":"Inainte"}</button></div>
 <details class="cking"><summary>Ingrediente (${CK.ing.length})</summary>${CK.note?`<p class="muted">${esc(CK.note)}</p>`:""}<ul>${CK.ing.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></details></div>`;ckTimers()}
function ckTimers(){const el=$("#cktm");if(!el)return;
 el.innerHTML=CT.map(t=>`<div class="cktm${t.done?" fin":""}"><div class="fx1"><div class="muted">${esc(t.lab)}</div><b data-tmv="${t.id}">${t.done?"Gata!":fmtT((t.end-Date.now())/1000)}</b></div><button class="alt" data-cktx="${t.id}">${t.done?"OK":"Opreste"}</button></div>`).join("")}
function ckTick(){if(!CK){clearInterval(CTI);CTI=0;return}let ch=false;
 CT.forEach(t=>{if(t.done)return;const left=(t.end-Date.now())/1000;if(left<=0){t.done=true;ch=true;beep(4);try{navigator.vibrate&&navigator.vibrate([400,200,400,200,400])}catch(e){dbg(e)}}
  else{const e=document.querySelector('[data-tmv="'+t.id+'"]');if(e)e.textContent=fmtT(left)}});if(ch)ckTimers()}
$("#cook").onclick=e=>{const d=e.target.dataset;if(!CK)return;
 if(d.ckx!==undefined){cookClose(false);return}
 if(d.ckp!==undefined){if(CK.i>0){CK.i--;CK.arm=0;drawCook()}return}
 if(d.ckn!==undefined){if(CK.i<CK.steps.length-1){CK.i++;CK.arm=0;drawCook();window.scrollTo(0,0);$("#cook").scrollTop=0}else cookClose(false);return}
 if(d.cktm!==undefined){const min=+d.cktm;beep(0);CT.push({id:CTN++,lab:d.cklab||"Cronometru",end:Date.now()+min*60000,done:false});if(!CTI)CTI=setInterval(ckTick,500);ckTimers();return}
 if(d.cktx!==undefined){CT=CT.filter(t=>String(t.id)!==d.cktx);ckTimers();return}};
document.addEventListener("keydown",e=>{if(!CK)return;if(e.key==="Escape"){cookClose(false)}else if(e.key==="ArrowRight"&&!/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||"")){const b=document.querySelector("[data-ckn]");if(b)b.click()}else if(e.key==="ArrowLeft"){const b=document.querySelector("[data-ckp]");if(b&&!b.disabled)b.click()}});
/* ===== Primii pasi (apare doar cat mai lipsesc lucruri esentiale; se poate ascunde) ===== */
/* 4.2.0: fara cheie API, tot ce cheama modelul e ascuns (body.nokey, vezi style.css); aplicatia e completa si asa */
/* 4.15.0: fara cheie, butoanele AI raman vizibile, gri; la apasare spun de ce */
document.addEventListener("click",e=>{if(!document.body.classList.contains("nokey"))return;const b=e.target.closest&&e.target.closest("[data-ai]");if(!b)return;e.preventDefault();e.stopImmediatePropagation();toast("Functia asta foloseste AI si cere o cheie API: o adaugi in Setari > AI si cheie.")},true);
function keyUpd(){try{document.body.classList.toggle("nokey",!LS("rk"))}catch(e){dbg(e)}}
function drawOnb(){const el=$("#onb");if(!el)return;
 const st=[["pan","Spune ce ai in Debara","Ca sa vezi ce poti gati fara sa cumperi nimic.",getPan().some(p=>!BASE.includes(p.n))]],n=st.filter(x=>x[3]).length;
 if(LS("ronb")==="1"||n===st.length){el.innerHTML="";return}
 el.innerHTML=`<div class="card onb"><div class="mh"><h2>Primul pas</h2><button class="alt" data-onbx="1">Ascunde</button></div>`+st.map(([id,t,d,ok])=>`<div class="me"><span class="onbc${ok?" ok":""}" aria-hidden="true">${ok?"\u2713":""}</span><div class="mn"><div class="tx">${esc(t)}</div><div class="muted">${esc(d)}</div></div>${ok?"":`<button class="alt" data-onb="${id}">Mergi</button>`}</div>`).join("")+`</div>`}
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
/* ===== Meniu saptamanal (mic dejun / pranz / cina / desert; cina adaugata in 3.21.0) ===== */
const SLOTS=[["mic","Mic dejun"],["pranz","Pranz"],["cina","Cina"],["desert","Desert"]];
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
 return{t:r.titlu,s,k:s==="b"?bKey(r):sKey(r),p:clampP(p||1),bp:base,i:rawIngs(s,r).slice(0,40),m:mc,L:0}}
/* macro din meniu: valorile "per portie" ale cartilor (kcal, proteine, carbo, grasimi); se aduna cate 1 portie din fiecare intrare */
/* 3.11.1: daca reteta nu are macro, se calculeaza din Info (gratuit, offline) cand Info recunoaste cel putin 80% din ingredientele cu cantitate; nu se salveaza nimic */
const MLC=new Map();
function menLocal(en){if(en.s==="x")return null;const rec=menRec(en),ing=rec?rawIngs(en.s,rec.r):en.i&&en.i.length?en.i:[];if(!ing.length)return null;
 const bp=Math.max(1,(rec&&+rec.r.portii)||en.bp||1),ck=bp+"|"+JSON.stringify(ing);if(MLC.has(ck))return MLC.get(ck);
 const L=macLocal({},bp,ing),v=!L.n||L.ok/L.n<.8||!(L.o.kcal>0)?null:[L.o.kcal,L.o.proteine,L.o.carbo,L.o.grasimi];if(MLC.size>800)MLC.clear();MLC.set(ck,v);return v}
/* 5.0.0: macro pentru meniu, propunere si jurnal: intai calculul din Info (aceeasi baza pentru toate retetele), apoi valorile din carte sau estimate */
function menMac(en){let a=null;const rec=en.s==="b"?menRec(en):null;
 a=menLocal(en);if(!a){if(rec&&rec.r.macro&&rec.r.macro.kcal!=null){const m=rec.r.macro;a=[m.kcal,m.proteine,m.carbo,m.grasimi]}else if(Array.isArray(en.m))a=en.m}
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
/* 4.0.0: tintele vin doar din profil (proteine = g pe kg x greutate); cheia veche rmt nu se mai citeste */
function getMT(){const t=profT();return t.ok?{k:t.k,p:t.p}:{k:0,p:0}}
/* [index in NUTRI.C, eticheta, unitate, tip: "m" minim recomandat, "x" limita maxima, null fara tinta, grup: 1 = important] */
const MIC=[[4,"Fibre","g","m",1],[8,"Sodiu","mg","x",1],[6,"Grasimi saturate","g","x",1],[5,"Zaharuri totale","g","x",1],[10,"Fier","mg","m",1],[9,"Calciu","mg","m",1],[18,"Vitamina D","µg","m",1],[25,"Vitamina B12","µg","m",1],[24,"Folat (B9)","µg","m",1],
 [13,"Potasiu","mg","m",0],[11,"Magneziu","mg","m",0],[12,"Fosfor","mg","m",0],[14,"Zinc","mg","m",0],[15,"Seleniu","µg","m",0],[16,"Vitamina A","µg","m",0],[17,"Vitamina E","mg","m",0],[19,"Vitamina C","mg","m",0],[26,"Vitamina K","µg","m",0],
 [20,"Vitamina B1","mg","m",0],[21,"Vitamina B2","mg","m",0],[22,"Vitamina B3","mg","m",0],[23,"Vitamina B6","mg","m",0],[7,"Colesterol","mg",null,0]];
/* valori EFSA (PRI sau AI) pentru adulti de 18+ ani; tinta pentru "x" e o limita, nu un minim */
function micT(p,t){if(!t||!t.ok)return null;const m=p.s==="m",a=+p.a,MJ=t.k*4.184/1000;
 return{4:25,8:2000,6:t.k*.10/9,5:t.k*.10/4,10:m?11:(a<=50?16:11),9:a<25?1000:950,18:15,25:4,24:330,13:3500,11:m?350:300,12:550,14:m?11.7:9.3,15:70,16:m?750:650,17:m?13:11,19:m?110:95,26:70,20:.1*MJ,21:1.6,22:1.6*MJ,23:m?1.7:1.6}}
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
 const rest=big?(t-v>=.5?`<span class="rest">Raman ${fmtN(t-v)} ${u}</span>`:over&&v-t>=.5?`<span class="rest">Peste tinta cu ${fmtN(v-t)} ${u}</span>`:""):"";
 return`<div class="mic${big?" big":""}"><span class="mn2">${n}</span><span class="mbar" role="img" aria-label="${n}: ${r}% din ${mx?"limita":"necesar"}"><i class="f" style="width:${g.toFixed(1)}%"></i>${o?`<i class="ov" style="left:${(100/1.2).toFixed(1)}%;width:${o.toFixed(1)}%"></i>`:""}<span class="tk"></span></span><span class="mv"><b>${fmtN(v)}</b> / ${mx?"max ":""}${fmtN(t)} ${u} &middot; ${r}%${rest}</span></div>`}
function micRows(s,tg,grp){return MIC.filter(m=>m[4]===grp).map(m=>barRow(m[1],s[m[0]],tg?tg[m[0]]:null,m[2],m[3]==="x",false,m[3]==="x")).join("")}
function micPanel(s,cov,pr,note){const t=profT(pr),tg=micT(pr,t);
 return(tg?"":`<p class="muted mt8 mb8" >Fara profil nutritional completat se vad doar valorile. Completeaza Setari > Profil nutritional ca sa apara procentele din necesarul zilnic.</p>`)+
  micRows(s,tg,1)+`<details class="mmore"><summary class="muted">Restul nutrientilor</summary>${micRows(s,tg,0)}</details>`+
  `<p class="muted mt8 mb0 fss" >${note?note+" ":""}${cov}Valori din baza Info (USDA, alimente crude), fara pierderile de la gatit; sodiul nu include sarea adaugata. Referinta: EFSA, adulti. Orientare, nu sfat medical.</p>`}
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
 if(t.ok){h+=`<h3 class="mt16 mb4">Tinte zilnice</h3><p class="muted mt0 mb8" >Standardul se calculeaza din profil. Poti scrie propriile valori; daca golesti un camp, revine la standard.</p>
  <div class="fgrid"><div><label for="pr-kc">Calorii (kcal)</label><input id="pr-kc" data-pr="kc" type="number" min="800" max="9000" step="10" value="${esc(p.kc==null?"":p.kc)}" placeholder="standard: ${t.kstd}"></div>
  <div><label for="pr-pk">Proteine (g pe kg)</label><input id="pr-pk" data-pr="pk" type="number" min="0.3" max="4" step="0.05" value="${esc(p.pk==null?"":p.pk)}" placeholder="standard: ${String(t.pkstd).replace(".",",")}"></div>
  <div><label for="pr-gp">Grasimi (% din calorii)</label><input id="pr-gp" data-pr="gp" type="number" min="10" max="60" step="1" value="${esc(p.gp==null?"":p.gp)}" placeholder="standard: 30"></div></div>
  <p class="mt12 mb0"><b>Tinta pe zi:</b> ${t.k} kcal, proteine ${t.p} g (${String(+t.pk.toFixed(2)).replace(".",",")} g/kg), grasimi ${t.f} g, carbohidrati ${t.c} g (restul), fibre 25 g.</p>`}
 else h+=`<p class="muted mt12 mb0" >Completeaza toate campurile ca sa apara tintele si procentele din necesar.</p>`;
 h+=`<p class="muted mt12 mb0 fss" >Valori de referinta EFSA pentru adulti sanatosi. Nu acopera sarcina, alaptarea sau boli care schimba necesarul. Energia se estimeaza cu formula Mifflin-St Jeor si nivelul de activitate; etapa o ajusteaza (crestere +10%, definire -15%). Proteinele standard: 0,83 g/kg (mentinere, minimul EFSA), 1,6 (crestere musculara), 2,0 (definire). Orientare, nu sfat medical.</p>`;
 el.innerHTML=h}
function dayMac(dm){const s=[0,0,0,0];let n=0,nd=0,nm=0,ne=0,nl=0;SLOTS.forEach(([id])=>(dm[id]||[]).forEach(en=>{n++;const a=menMac(en);if(a){nd++;const mr=en.s==="b"?menRec(en):null,rc=!!(mr&&mr.r.macro&&mr.r.macro.kcal!=null);if(!rc&&!Array.isArray(en.m))nl++;if(en.me&&!rc)ne++;a.forEach((v,i)=>{if(v!=null)s[i]+=v})}else if(en.s!=="x")nm++}));return{n,nd,nm,ne,nl,s:s.map(Math.round)}}
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

/* ingredientele unei intrari, scalate la portiile din meniu; daca reteta nu mai exista se folosesc cele salvate in meniu */
function menIngs(en){
 if(en.s==="x"||en.mp)return[];
 const m=menRec(en);let raw,base;
 if(m){raw=rawIngs(en.s,m.r);base=m.r.portii||1}else{raw=Array.isArray(en.i)?en.i:[];base=+en.bp||1}
 const f=clampP(en.p||base)/base;
 return raw.map(x=>({c:x.c!=null?+(x.c*f).toFixed(2):null,u:x.u,n:x.n,g:x.g}))}
/* masa propusa dupa ora / felul retetei */
const DESERT=/\b(desert|prajitur|tort|cozonac|inghetata|budinca|placinta|checs|clatite|papanasi|fursec|biscui|ecler|mousse|cheesecake|brownie)/;
const guessSlot=r=>{if(r.categorie==="Mic dejun")return"mic";if(r.categorie==="Deserturi")return"desert";const t=norm((r.categorie||"")+" "+(r.titlu||""));const h=new Date().getHours();return DESERT.test(t)?"desert":h<10?"mic":h<16?"pranz":"cina"};

/* ===== 3.12.0: Meal prep: retete gatite in loturi pentru mai multe zile; lista simpla (reteta, data gatirii, portii gatite), fara scadere automata ===== */
const getMP=()=>{try{const j=JSON.parse(LS("rmp")||"[]");return Array.isArray(j)?j.filter(x=>x&&x.id&&typeof x.t==="string"):[]}catch(e){return[]}};
const putMP=l=>LS("rmp",JSON.stringify(l));
let MPO=false;
const mpRec=e=>{if(e.s==="b"){const i=BOOK.findIndex(x=>bKey(x)===e.k);return i>=0?{s:"b",i,r:BOOK[i]}:null}const sv=getSaved(),i=sv.findIndex(x=>sKey(x)===e.k);return i>=0?{s:"s",i,r:sv[i]}:null};
/* 4.30.0: butonul e mereu vizibil; cand reteta e planificata, deschide lotul planificat (portiile se schimba pana e gatit) */
const mpPlan=k=>getMP().find(x=>x.k===k&&x.st==="p");
const mpBtn=(st,r)=>{const pl=mpPlan(st==="b"?bKey(r):sKey(r));return`<button class="alt" data-mpr="1">${pl?"Meal prep: "+esc(pl.p)+(+pl.p===1?" portie":" portii"):"Adauga la Meal prep"}</button>`};
const mpInMen=k=>{const m=getMen(),t=dKey(new Date());let n=0;Object.keys(m).forEach(dk=>{if(dk<t)return;SLOTS.forEach(([sl])=>(m[dk][sl]||[]).forEach(en=>{if(en.k===k&&en.mp&&en.s!=="x")n++}))});return n};
/* 4.18.0: doua zone: Planificat (lista de asteptare: se gateste sau se sterge) si Gatit (meal prep efectiv, de unde se alege in meniu) */
const mpStep=(n,attr)=>`<div class="scl mps"><button class="alt" ${attr} data-mps="-1" aria-label="Mai putine portii" ${n<=1?"disabled":""}>-</button><b aria-live="polite">${n}</b><button class="alt" ${attr} data-mps="1" aria-label="Mai multe portii" ${n>=99?"disabled":""}>+</button><span>${n===1?"portie":"portii"}</span></div>`;
function mpRow(x){const p=x.st==="p",rc=mpRec(x),n=p?0:mpInMen(x.k),meta=p?"":"gatit "+esc(dLab(x.d).toLowerCase())+(x.p?" - "+esc(x.p)+(+x.p===1?" portie":" portii"):"")+(n?" - "+n+(n===1?" masa in meniu":" mese in meniu"):"");
 return`<div class="mrw"><div class="mn">${rc?`<button class="lnk tx" data-mpopen="${esc(x.id)}" title="Deschide reteta">${esc(x.t)}</button>`:`<div class="tx">${esc(x.t)}</div>`}${p?mpStep(clampP(x.p),`data-mpq="${esc(x.id)}"`):`<div class="src">${meta}</div>`}${rc?"":`<div class="warn">Reteta nu mai e in Biblioteca.</div>`}</div><div class="mpb">${p?`<button class="go" data-mpcook="${esc(x.id)}">Am gatit</button><button class="alt ico" data-mpdel="${esc(x.id)}" aria-label="Scoate din Meal prep" title="Scoate din Meal prep">${IC_DEL}</button>`:`<button class="alt" data-mpdone="${esc(x.id)}">Terminat</button>`}</div></div>`}
function mpHtml(){const l=getMP(),pl=l.filter(x=>x.st==="p"),dn=l.filter(x=>x.st!=="p"),zone=(t,a)=>a.length?`<div class="mpz"><div class="mzh">${t} (${a.length})</div>${a.map(mpRow).join("")}</div>`:"";
 return`<div class="card"><details class="mre mpd" id="mpd"${MPO?" open":""}><summary>Meal prep (${l.length})</summary>`+(l.length?zone("Planificat",pl)+zone("Gatit",dn):`<p class="muted">Nu ai nimic pregatit. Adaugi aici ce gatesti pentru mai multe zile.</p>`)+`<button class="alt mt8 mb0" data-mpadd="1">+ Adauga la Meal prep</button></details></div>`}
function mpOpen(){MD={mp:1,f:null,q:"",r:null};
 $("#mdlg").innerHTML=`<div class="card mdbox" role="dialog" aria-modal="true" aria-label="Adauga la Meal prep"><h2 class="m0">Adauga la Meal prep</h2><label for="mdq" class="mt12">Cauta o reteta (nume sau ingrediente)</label><input id="mdq" placeholder="ex: ciorba, piept de pui" autocomplete="off"><div id="mdres"></div><div class="row mt16"><button class="alt" data-mdx="1">Inchide</button></div></div>`;
 $("#mdlg").classList.remove("hidden");mdSearch();setTimeout(()=>{const e=$("#mdq");if(e)e.focus()},0)}
function mpForm(s,r){MD.s=s;MD.r=r;const today=dKey(new Date()),base=+r.portii>0?+r.portii:null,ri=lPrep(rawIngs(s,r)),has=ri.length>0,np=ri.filter(x=>inPantry(lClean(x.n,x.u).n)).length,pl=mpPlan(s==="b"?bKey(r):sKey(r));MD.pl=pl?pl.id:null;const p0=pl?clampP(pl.p):clampP(MD.dp||base||1);
 const info=pl?`<p class="muted mt12 mb0">E deja planificata in Meal prep. Schimbi portiile pana o gatesti; cumparaturile se potrivesc singure.</p>`:has?(np===ri.length?`<p class="muted mt12 mb0">Ai toate ingredientele in debara, nu e nimic de cumparat.</p>`:`<p class="muted mt12 mb0">Adauga la Meal prep pune ingredientele pentru <span id="mpn">${p0}</span> portii in cumparaturi${np?` (${np} din ${ri.length} le ai deja in debara)`:""}.</p>`):"";
 $("#mdlg").innerHTML=`<div class="card mdbox" role="dialog" aria-modal="true" aria-label="Meal prep"><h2 class="m0">Meal prep</h2><p class="mt12 mb0"><b>${esc(r.titlu)}</b></p><label class="mt8">Portii</label><input id="mpp" type="hidden" value="${p0}">${mpStep(p0,'data-mpf="1"')}<label for="mpd1">Data gatirii (la Am gatit deja)</label><input id="mpd1" type="date" value="${today}" max="${today}">${info}<p id="mpw" class="mt8 mb0" style="color:var(--amb)" data-base="${base||0}" hidden></p><div class="row mt16"><button class="go m0" data-mpok="${pl?"u":"p"}">${pl?"Salveaza portiile":"Adauga la Meal prep"}</button><button class="go m0" data-mpok="g">Am gatit deja</button><button class="alt" data-mdx="1">Anuleaza</button></div></div>`;
 mpPUpd(p0)}
/* 4.30.0: portiile din dialog se aleg cu - / + (ca la "Gatesc pentru") */
function mpPUpd(p){p=clampP(p);const i=$("#mpp");if(!i)return;i.value=p;const st=$("#mdlg .mps");if(st){st.querySelector("b").textContent=p;st.querySelector('[data-mps="-1"]').disabled=p<=1;st.querySelector('[data-mps="1"]').disabled=p>=99;st.querySelector("span").textContent=p===1?"portie":"portii"}
 const w=$("#mpw"),b=w?+w.dataset.base:0;if($("#mpn"))$("#mpn").textContent=p;if(w){const big=b>0&&p/b>4;w.hidden=!big;w.textContent=big?"Gatesti de "+(+(p/b).toFixed(1))+" ori reteta ("+p+" portii, reteta e pentru "+b+"). Verifica numarul de portii.":""}}
/* 4.30.0: lot planificat: portiile se schimba pana e gatit; partea lui din cumparaturi (ce nu e bifat) se scaleaza la fel. Fara numar de portii in reteta, cantitatile au fost adaugate nescalate, deci raman asa. */
function mpResize(id,np){const l=getMP(),x=l.find(y=>y.id===id);if(!x||x.st!=="p")return false;np=clampP(np);const op=clampP(x.p);if(np===op)return false;x.p=np;putMP(l);
 const rc=mpRec(x),base=rc&&+rc.r.portii>0?+rc.r.portii:null;if(base){const f=np/op,li=getList();let ch=0;
  li.forEach(it=>{if(it.done||!(it.src||[]).includes(x.t))return;if(it.parts){const pt=it.parts.find(q=>q.s===x.t);if(pt&&pt.c!=null){pt.c=+(pt.c*f).toFixed(2);const cs=it.parts.map(q=>q.c).filter(c=>c!=null);it.c=cs.length?+cs.reduce((a,c)=>a+c,0).toFixed(2):null;ch++}}else if(it.src.length===1&&it.c!=null){it.c=+(it.c*f).toFixed(2);ch++}});
  if(ch){putList(li);navCount()}}
 return true}
/* 4.13.0: mode "p" = planificat (ingredientele intra in cumparaturi, fara jurnal); mode "g" = gatit deja (jurnal, lista neatinsa) */
/* mesele din meniu (de azi inainte) cu aceeasi reteta devin "din Meal prep" cand lotul e gatit: ingredientele nu se mai cumpara a doua oara */
function mpMark(k){const today=dKey(new Date()),m=getMen();let nm=0;Object.keys(m).forEach(dk=>{if(dk<today)return;SLOTS.forEach(([sl])=>(m[dk][sl]||[]).forEach(en=>{if(en.k===k&&!en.mp&&en.s!=="x"){en.mp=1;nm++}}))});if(nm)putMen(m);return nm}
function mpSave(mode){const r=MD.r,s=MD.s,k=s==="b"?bKey(r):sKey(r),p=clampP($("#mpp").value),today=dKey(new Date()),plan=mode==="p";let d=$("#mpd1").value;if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||d>today)d=today;
 /* 4.30.0: reteta deja planificata: "Salveaza portiile" schimba lotul; "Am gatit deja" il muta in Gatit (ca butonul Am gatit din Meniu), fara lot nou */
 if(MD.pl&&getMP().some(y=>y.id===MD.pl)){const id=MD.pl,af=MD.after;mpResize(id,p);if(mode==="g"){const x=getMP().find(y=>y.id===id);putMP(getMP().map(y=>{if(y.id!==id)return y;const z=Object.assign({},y,{d});delete z.st;return z}));setNote(k,{h:(getNote(k).h||[]).concat([d])});const rr=removeSrc(x.t),nm=mpMark(k);MPO=true;menClose();if(af)af();toast("Gatit: "+x.t+" ("+p+(p===1?" portie":" portii")+")"+(nm?". "+nm+(nm===1?" masa din meniu e acum":" mese din meniu sunt acum")+" \"din Meal prep\"":"")+(rr.rem||rr.red?". Din cumparaturi: "+rr.rem+" produse scoase":"")+".")}
  else{MPO=true;menClose();if(af)af();toast("Meal prep: "+p+(p===1?" portie":" portii")+"; cumparaturile s-au potrivit.")}
  drawMenu();drawList();return}
 const l=getMP();l.push(Object.assign({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),s,k,t:r.titlu,d:plan?"":d,p},plan?{st:"p"}:{}));putMP(l);
 if(!plan)setNote(k,{h:(getNote(k).h||[]).concat([d])});
 let n=0,nh=0;let tr=0;if(plan){const base=+r.portii>0?+r.portii:null,f=base?p/base:1;if(inCart(r.titlu))removeSrc(r.titlu);
  /* 4.22.1: lotul planificat preia cumparaturile mesei din meniu cu aceeasi reteta (azi inainte): partile "(meniu zi)" ies din lista, ca ingredientele sa nu apara de doua ori */
  {const mm=getMen();Object.keys(mm).forEach(dk=>{if(dk<today)return;SLOTS.forEach(([sl])=>(mm[dk][sl]||[]).forEach(en=>{if(en.k===k&&en.L&&en.s!=="x"){removeSrc(en.t+" (meniu "+ZILE[dFrom(dk).getDay()].toLowerCase()+")");tr++}}))})}n=addList(rawIngs(s,r).map(x=>({c:x.c!=null?+(x.c*f).toFixed(2):null,u:x.u,n:x.n,g:x.g})),r.titlu);nh=getList().filter(x=>hid(x)&&(x.src||[]).includes(r.titlu)).length}
 const nm=plan?0:mpMark(k);
 MPO=true;const af=MD&&MD.after;menClose();if(af)af();toast((plan?"Adaugat la Meal prep (de gatit)":"Adaugat la Meal prep (gatit)")+(n?"; "+(n-nh)+" produse la cumparaturi"+(nh?" (alte "+nh+" le ai in debara)":""):"")+(tr?"; "+tr+(tr===1?" masa din meniu nu mai cumpara separat":" mese din meniu nu mai cumpara separat"):"")+(nm?". "+nm+(nm===1?" masa din meniu e acum":" mese din meniu sunt acum")+" \"din Meal prep\"":"")+".");drawMenu();drawList()}
/* ===== 4.23.0: produs dupa cod de bare (Open Food Facts); valorile sunt la 100 g, cantitatea o alegi tu; produsele gasite se tin local (ultimele 100), ca sa mearga si fara net ===== */
const SRC_IC='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>';
const BC_IC='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 5v14M7 5v14M10.5 5v14M13 5v14M16.5 5v14M20 5v14"/></svg>';
const bcGet=()=>{try{const j=JSON.parse(LS("rbc")||"{}");return j&&typeof j==="object"&&!Array.isArray(j)?j:{}}catch(e){return{}}};
function bcPut(code,p){const o=bcGet();o[code]=Object.assign({},p,{ts:Date.now()});const ks=Object.keys(o);if(ks.length>100)ks.sort((a,b)=>(o[a].ts||0)-(o[b].ts||0)).slice(0,ks.length-100).forEach(k=>delete o[k]);LS("rbc",JSON.stringify(o))}
const bcNum=v=>{v=typeof v==="string"?parseFloat(v.replace(",",".")):v;return Number.isFinite(v)&&v>=0&&v<=10000?v:null};
function bcParse(code,j){const p=j&&j.product;if(!j||j.status!==1||!p)return null;const n=p.nutriments||{};
 let kc=bcNum(n["energy-kcal_100g"]);if(kc==null){const kj=bcNum(n["energy_100g"]);if(kj!=null)kc=Math.round(kj/4.184)}
 const sq=bcNum(p.serving_quantity);
 return{code,n:String(p.product_name_ro||p.product_name||"").trim().slice(0,80)||"Produs "+code,b:String(p.brands||"").split(",")[0].trim().slice(0,40),k:[kc,bcNum(n.proteins_100g),bcNum(n.carbohydrates_100g),bcNum(n.fat_100g)],sq:sq&&sq>0&&sq<=2000?Math.round(sq):null}}
/* raspuns: {p} produs, sau {err:"fmt"|"nf"|"net"} */
async function bcLookup(raw){const r1=await bcLookup1(raw);if(r1.err==="net"){await new Promise(z=>setTimeout(z,900));const r2=await bcLookup1(raw);if(!r2.err||r2.err!=="net")return r2;return r2}return r1}
async function bcLookup1(raw){const code=String(raw||"").replace(/\D/g,"");if(code.length<8||code.length>14)return{err:"fmt"};
 const c=bcGet()[code];if(c)return{p:c};
 try{const ac=new AbortController(),t=setTimeout(()=>ac.abort(),8000);
  const r=await fetch("https://world.openfoodfacts.org/api/v2/product/"+code+".json?fields=code,product_name,product_name_ro,brands,serving_quantity,nutriments",{signal:ac.signal});clearTimeout(t);
  if(!r.ok&&r.status!==404)return{err:"net",why:"serviciul a raspuns "+r.status};const p=bcParse(code,await r.json());if(!p)return{err:"nf"};bcPut(code,p);return{p}}catch(e){return{err:"net",why:e&&e.name==="AbortError"?"timp expirat (8 secunde)":e&&e.name==="SyntaxError"?"raspuns neasteptat":"cererea a fost blocata sau nu a ajuns la serviciu"}}}
const bcF=v=>v==null?"-":String(+(+v).toFixed(1));
const bcVal=(k,q)=>k[0]==null?"Baza nu are valori nutritionale pentru acest produs; il adaug fara macro.":"= <b>"+Math.round(k[0]*q/100)+" kcal</b>, "+bcF(k[1]==null?null:k[1]*q/100)+" g proteine, "+bcF(k[2]==null?null:k[2]*q/100)+" g carbo, "+bcF(k[3]==null?null:k[3]*q/100)+" g grasimi";
const bcCard=p=>`<div class="mmac mt8" id="bcc"><b>${esc(p.n)}</b>${p.b?` <span class="muted">${esc(p.b)}</span>`:""}<div class="muted">La 100 g: ${p.k[0]==null?"fara valori":Math.round(p.k[0])+" kcal, "+bcF(p.k[1])+" g proteine, "+bcF(p.k[2])+" g carbo, "+bcF(p.k[3])+" g grasimi"}</div><div class="fgrid mt8"><div><label for="mdbq">Cantitate (g)</label><input id="mdbq" type="number" min="1" max="5000" value="${p.sq||100}"></div></div><div id="mdbv" class="mt8">${bcVal(p.k,p.sq||100)}</div><div class="row mt8"><button class="go m0" data-mdbadd="1">${MD&&MD.jr?"Adauga in jurnal":"Adauga la meniu"}</button><button class="alt" data-mdbx="1">Anuleaza</button></div><div class="muted mt8">Date: ${p.code?"Open Food Facts":esc(p.b||"Info")}</div></div>`;
async function bcRun(raw){if(!MD||!$("#mdbr"))return;$("#mdbr").innerHTML=`<p class="muted">Caut...</p>`;const r=await bcLookup(raw);if(!MD||!$("#mdbr"))return;
 if(r.p){MD.bc=r.p;$("#mdbr").innerHTML=bcCard(r.p);return}MD.bc=null;
 $("#mdbr").innerHTML=`<p class="muted">${{fmt:"Codul de bare are 8 pana la 14 cifre.",nf:"Produsul nu e in Open Food Facts. Il poti scrie liber mai jos.",net:"Nu pot cauta acum: fara internet sau serviciul nu raspunde."}[r.err]}${r.why?` <span class="muted">(${esc(r.why)})</span>`:""}</p>`}
function bcAdd(){const p=MD&&MD.bc;if(!p)return;const q=Math.round(Math.min(5000,Math.max(0,+($("#mdbq").value)||0)));if(!q){$("#mdbq").focus();return}
 const f=q/100,m=p.k[0]!=null?p.k.map(v=>v==null?null:+(v*f).toFixed(1)):null;
 menAdd(Object.assign({t:(p.n+(p.b&&p.code?" ("+p.b+")":"")).slice(0,80),s:"x",k:"",p:0,L:0,q},p.code?{ean:p.code}:{},m?{m}:{},MD&&MD.jr&&p.x?{x:p.x}:{}))}
/* ===== 4.23.1: scanare cu camera. Foloseste detectorul nativ al browserului (BarcodeDetector) cand are formatele EAN/UPC; altfel biblioteca zxing.min.js (Apache 2.0), din acelasi domeniu, incarcata abia cand apesi camera ===== */
const FLASH_IC='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L5 13.5h6L10 22l8-11.5h-6z"/></svg>';
const CAM_IC='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
let BC={st:null,t:0,rd:null,done:false,zx:null};
const camOk=()=>!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);
function bcStop(){clearInterval(BC.t);BC.t=0;try{if(BC.rd&&BC.rd.reset)BC.rd.reset()}catch(e){dbg(e)}BC.rd=null;try{if(BC.st)BC.st.getTracks().forEach(x=>x.stop())}catch(e){dbg(e)}BC.st=null}
function bcLoadZx(){if(window.ZXing)return Promise.resolve();return BC.zx||(BC.zx=new Promise((ok,no)=>{const sc=document.createElement("script");sc.src="zxing.min.js?v="+APP_V;sc.onload=()=>window.ZXing?ok():no(new Error("zxing"));sc.onerror=()=>{BC.zx=null;no(new Error("zxing"))};document.head.appendChild(sc)}))}
function bcFound(code){if(BC.done||!MD)return;BC.done=true;bcStop();try{if(navigator.vibrate)navigator.vibrate(60)}catch(e){dbg(e)}const i=$("#mdbc");if(i)i.value=code;bcRun(code)}
/* 4.29.0: ecranul camerei: cadru de tintire (colturi verzi, restul intunecat), linie de scanare, lanterna la cerere; citirea nativa se face doar in cadru */
const bcTrack=()=>{const v=$("#bcv"),st=BC.st||(v&&v.srcObject);try{return st&&st.getVideoTracks&&st.getVideoTracks()[0]||null}catch(e){return null}};
function bcFlashInit(){const b=$("[data-mdbfl]"),t=bcTrack();if(!b)return;let ok=false;try{ok=!!(t&&t.getCapabilities&&t.getCapabilities().torch)}catch(e){dbg(e)}b.classList.toggle("gri",!ok)}
async function bcFlash(){const b=$("[data-mdbfl]"),t=bcTrack();if(!b)return;
 if(b.classList.contains("gri")){toast("Lanterna nu e disponibila pe acest telefon sau browser.",false);return}
 const on=!b.classList.contains("on");try{await t.applyConstraints({advanced:[{torch:on}]});b.classList.toggle("on",on);b.setAttribute("aria-pressed",on?"true":"false")}catch(e){dbg(e);toast("Nu pot porni lanterna.",false)}}
/* decupeaza din imagine zona din cadru (10%-90% pe latime, 18%-82% pe inaltime din ce se vede); daca nu merge, citeste tot */
function bcCrop(v){try{const vw=v.videoWidth,vh=v.videoHeight,bw=v.clientWidth,bh=v.clientHeight;if(!(vw&&vh&&bw&&bh))return v;
 const sc=Math.max(bw/vw,bh/vh),sw=bw/sc,sh=bh/sc,sx=(vw-sw)/2,sy=(vh-sh)/2,x=sx+sw*.1,y=sy+sh*.18,w=sw*.8,h=sh*.64;
 const c=BC.cv||(BC.cv=document.createElement("canvas"));c.width=Math.round(w);c.height=Math.round(h);const g=c.getContext("2d");if(!g)return v;g.drawImage(v,x,y,w,h,0,0,c.width,c.height);return c}catch(e){return v}}
async function bcScan(){if(!MD||!$("#mdbr"))return;bcStop();BC.done=false;
 $("#mdbr").innerHTML=`<div class="bcv mt8"><div class="bcw"><video id="bcv" playsinline muted></video><div class="bcm"><div class="bcf"><i></i><i></i><i></i><i></i><b></b></div></div><button class="alt ico bcfl gri" data-mdbfl="1" aria-label="Lanterna" title="Lanterna">${FLASH_IC}</button></div><div class="muted">Pune codul de bare in cadru.</div><button class="alt" data-mdbcx="1">Opreste camera</button></div>`;
 const v=$("#bcv"),cons={video:{facingMode:{ideal:"environment"}},audio:false};
 try{
  let nat=false;if(window.BarcodeDetector){try{const fm=await window.BarcodeDetector.getSupportedFormats();nat=fm.includes("ean_13")}catch(e){nat=false}}
  if(nat){const det=new window.BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e"]});
   BC.st=await navigator.mediaDevices.getUserMedia(cons);if(!MD||!$("#bcv")){bcStop();return}v.srcObject=BC.st;await v.play();bcFlashInit();
   BC.t=setInterval(async()=>{try{const r=await det.detect(bcCrop(v));if(r&&r[0]&&r[0].rawValue)bcFound(r[0].rawValue)}catch(e){dbg(e)}},300);return}
  await bcLoadZx();if(!MD||!$("#bcv"))return;
  const Z=window.ZXing,h=new Map();h.set(Z.DecodeHintType.POSSIBLE_FORMATS,[Z.BarcodeFormat.EAN_13,Z.BarcodeFormat.EAN_8,Z.BarcodeFormat.UPC_A,Z.BarcodeFormat.UPC_E]);
  BC.rd=new Z.BrowserMultiFormatReader(h,300);BC.rd.decodeFromConstraints(cons,v,(r)=>{if(r)bcFound(r.getText())});setTimeout(bcFlashInit,700);setTimeout(bcFlashInit,2000);
 }catch(e){dbg(e);bcStop();if(!MD||!$("#mdbr"))return;
  $("#mdbr").innerHTML=`<p class="muted">${e&&e.name==="NotAllowedError"?"Nu ai dat voie la camera. Poti scrie codul de bare.":"Nu pot porni camera. Poti scrie codul de bare."}</p>`}}
/* 4.29.0: pe telefon nu se mai deschide tastatura singura la deschiderea dialogului (acoperea restul, inclusiv campul de cod de bare); cand tastatura e deschisa, dialogul primeste loc sub el si campul atins se deruleaza in vedere */
const TOUCH=()=>!!(window.matchMedia&&window.matchMedia("(pointer:coarse)").matches);
if(window.visualViewport){const kb=()=>{const m=$("#mdlg"),v=window.visualViewport;if(m)m.style.paddingBottom=(16+Math.max(0,window.innerHeight-v.height-v.offsetTop))+"px"};window.visualViewport.addEventListener("resize",kb);window.visualViewport.addEventListener("scroll",kb)}
$("#mdlg").addEventListener("focusin",e=>{const t=e.target;if(t&&/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName))setTimeout(()=>{try{t.scrollIntoView({block:"center",behavior:"smooth"})}catch(x){dbg(x)}},350)});
let MD=null;
function menOpen(o){const r=o.r||null;MD={day:o.day||dKey(new Date()),slot:o.slot||(r?guessSlot(r):"pranz"),s:o.s||null,r,p:o.p||null,q:"",f:!r&&getMP().some(x=>x.st!=="p")?"m":null};
 const today=dKey(new Date()),mt=monOf(today);let st=MD.day<mt?monOf(MD.day):mt;if(MD.day>dAdd(st,34))st=monOf(MD.day);
 const dopt=[...Array(35)].map((_,i)=>{const k=dAdd(st,i);return`<option value="${k}"${k===MD.day?" selected":""}>${esc(dLab(k))}${k===today?" (azi)":""}</option>`}).join("");
 const sopt=SLOTS.map(([id,l])=>`<option value="${id}"${id===MD.slot?" selected":""}>${l}</option>`).join("");
 const body=r?`<p class="mt12 mb0"><b>${esc(r.titlu)}</b></p>${o.s==="b"&&r.portii==null?`<p class="muted">Cantitatile sunt cele din carte.</p>`:""}<div class="row mt16" ><button class="go m0" data-mdok="1" >Adauga la meniu</button><button class="alt" data-mdx="1">Anuleaza</button></div>`
  :`<label for="mdq" class="mt12">Cauta o reteta (nume sau ingrediente)</label><input id="mdq" placeholder="ex: ciorba, piept de pui" autocomplete="off"><div id="mdres"></div>
   <label for="mdbc" class="mt12">Produs dupa cod de bare</label><div class="bcrow"><input id="mdbc" inputmode="numeric" maxlength="14" class="fx1" placeholder="Cod de bare" autocomplete="off"><div class="bcb"><button class="alt ico" data-mdbs="1" aria-label="Cauta produsul" title="Cauta produsul">${SRC_IC}</button><button class="alt ico${camOk()?"":" gri"}" data-mdbcam="1" aria-label="Scaneaza cu camera" title="Scaneaza cu camera">${CAM_IC}</button></div></div><div id="mdbr"></div>
   <label for="mdt">Sau scrie liber (ex: resturi, iesim in oras)</label><div class="row g8" ><input id="mdt" maxlength="80" class="fx1"><button class="alt" data-mdtxt="1">Adauga text</button></div><div class="row mt16" ><button class="alt" data-mdx="1">Inchide</button></div>`;
 $("#mdlg").innerHTML=`<div class="card mdbox" role="dialog" aria-modal="true" aria-label="Adauga la meniu"><h2 class="m0">Adauga la meniu</h2><div class="fgrid mt8" ><div><label for="mdday">Ziua</label><select id="mdday">${dopt}</select></div><div><label for="mdslot">Masa</label><select id="mdslot">${sopt}</select></div></div>${body}</div>`;
 $("#mdlg").classList.remove("hidden");if(!r)mdSearch();
 setTimeout(()=>{const e=(TOUCH()?null:$("#mdq"))||$("#mdp")||$("[data-mdok]");if(e)e.focus()},0)}
function menClose(){bcStop();MD=null;$("#mdlg").classList.add("hidden");$("#mdlg").innerHTML=""}
function mdSearch(){if(!MD||!$("#mdres"))return;
 const q=qWords(MD.q),sv=[],f=MD.f||null,out=[],NTm=getNotes();
 const wr=r=>r.sursa==="Retetele mele",fv=r=>isFav(bKey(r));
 const hit=x=>!q.length||(x.s==="s"?q.every(w=>norm(x.r.titlu+" "+(x.r.ingrediente||[]).map(y=>y.nume).join(" ")).includes(w)):bScore(x.r,q).h===q.length);
 const add=x=>{if(out.length<60&&hit(x))out.push(x)};
 if(!f){if(q.length){BOOK.forEach((r,i)=>{if(!r.cos&&!smHid(r,NTm))add({s:"b",i,r})})}}
 else if(f==="c"){BOOK.forEach((r,i)=>{if(wr(r)&&!r.cos)add({s:"b",i,r})})}
 else if(f==="f"){BOOK.forEach((r,i)=>{if(fv(r)&&!r.cos)add({s:"b",i,r})})}
 else if(f==="m"){const sn=new Set();getMP().filter(x=>x.st!=="p").forEach(x=>{const rc=mpRec(x);if(rc&&!sn.has(x.k)){sn.add(x.k);add({s:rc.s,i:rc.i,r:rc.r,mp:1})}})}
 else if(f==="b"&&MD.bk){BOOK.forEach((r,i)=>{if((r.sursa||"necunoscuta")===MD.bk&&!r.cos)add({s:"b",i,r})})}
 const lab=x=>x.mp?(l=>l?"gatit "+esc(dLab(l.d).toLowerCase())+(l.p?", "+esc(l.p)+(+l.p===1?" portie":" portii"):""):"")(getMP().find(l=>l.st!=="p"&&l.k===(x.s==="b"?bKey(x.r):sKey(x.r)))):wr(x.r)?(x.r.ai?"Ale mele (AI)":"Scrisa de tine"):(fv(x.r)?"&#9733; Favorita - ":"Din ")+esc(x.r.sursa||"biblioteca");
 const chip=(k,t)=>`<button type="button" class="fchip${f===k?" on":""}" data-mdf="${k}" aria-pressed="${f===k}">${t}</button>`;
 const srcs=[...new Set(BOOK.filter(r=>!r.cos).map(r=>r.sursa||"necunoscuta"))].sort((x,y)=>x.localeCompare(y,"ro"));
 const bsel=f==="b"?`<select id="mdbk" aria-label="Alege cartea" class="mt8 mb8"><option value="">Alege cartea</option>${srcs.map(x=>`<option value="${esc(x)}"${x===MD.bk?" selected":""}>${esc(x)}</option>`).join("")}</select>`:"";
 const empty=f==="b"&&!MD.bk?"Alege o carte ca sa vezi retetele ei.":!f&&!q.length?"Scrie numele sau un ingredient, sau alege o sursa: Ale mele, Favorite sau Biblioteca.":q.length?"Nu am gasit nimic. Incearca alt cuvant.":f==="m"?"Nu ai nimic gatit in Meal prep inca.":f==="f"?"Nu ai inca favorite din carti.":"Nu ai retete aici inca.";
 $("#mdres").innerHTML=`<div class="chips mt8 mb8" >${MD.mp?"":chip("m","Meal prep")}${chip("c","Ale mele")}${chip("f","&#9733; Favorite")}${chip("b","Biblioteca")}</div>${bsel}`+(out.length?out.map(x=>`<div class="me"><div class="mn"><div class="tx">${esc(x.r.titlu)}</div><div class="src">${lab(x)}</div></div><button class="go m0" data-mdpick="${x.s}:${x.i}"${x.mp?' data-mpk="1"':""} >Alege</button></div>`).join(""):`<p class="muted">${empty}</p>`)}
function menAdd(en){if(MD&&MD.jr){jrAddEn(en);return}const m=getMen();
 if(en.s!=="x"&&en.k&&((m[MD.day]||{})[MD.slot]||[]).some(x=>x.s!=="x"&&x.k===en.k)){toast("Reteta e deja la aceasta masa: "+dLab(MD.day)+", "+SLOTS.find(x=>x[0]===MD.slot)[1]+".");menClose();return}(m[MD.day]=m[MD.day]||{})[MD.slot]=(m[MD.day][MD.slot]||[]).concat([en]);putMen(m);
 toast("Adaugat in meniu: "+dLab(MD.day)+", "+SLOTS.find(x=>x[0]===MD.slot)[1]+".");const d=MD.day;menClose();if(!$("#v-meniu").classList.contains("hidden")){MW=monOf(d);const t0=dKey(new Date());if(MV==="z"&&d!==t0&&d!==dAdd(t0,1))MV="s";drawMenu()}}
/* 5.0.1: fiecare dialog are X sus, care ramane vizibil si cand derulezi */
new MutationObserver(()=>{const b=document.querySelector("#mdlg .mdbox");if(b&&!b.querySelector(":scope > .dlgx"))b.insertAdjacentHTML("afterbegin",'<button type="button" class="alt ico dlgx" data-dlgx="1" aria-label="Inchide" title="Inchide">&#10005;</button>')}).observe($("#mdlg"),{childList:true});
$("#mdlg").onclick=e=>{if(e.target.closest("[data-dlgx]")){PRP=null;menClose();return}if(PRP){pxClick(e);return}const b=e.target,d=b.dataset;
 if(b===$("#mdlg")||d.mdx!==undefined){menClose();return}
 if(!MD)return;
 if(d.mdok!==undefined){menAdd(mkEntry(MD.s,MD.r,1));return}
 if(d.jrok!==undefined){jrAddEn(mkEntry(MD.s,MD.r,1));return}
 if(d.jrfp!==undefined){const f=(MD.fl||[])[+d.jrfp];if(f){MD.bc=f;$("#mdbr").innerHTML=bcCard(f);const q=$("#mdbq");if(q){if(q.scrollIntoView)q.scrollIntoView({block:"nearest"});q.focus()}}return}
 if(d.mdf!==undefined){MD.f=MD.f===d.mdf?null:d.mdf;mdSearch();return}
 if(d.mdpick!==undefined){const[s,i]=d.mdpick.split(":"),r=s==="s"?getSaved()[+i]:BOOK[+i];if(r){if(MD.mp){mpForm(s,r);return}const en=mkEntry(s,r);if(d.mpk)en.mp=1;menAdd(en)}return}
 if(d.mpok!==undefined){mpSave(d.mpok);return}
 if(d.mpf!==undefined&&d.mps!==undefined){const i=$("#mpp");if(i)mpPUpd(+i.value+(+d.mps));return}
 if(e.target.closest("[data-mdbcam]")){if(!camOk()){toast("Camera nu e disponibila in acest browser. Scrie codul de bare.",false);return}bcScan();return}
 if(e.target.closest("[data-mdbfl]")){bcFlash();return}
 if(d.mdbcx!==undefined){bcStop();$("#mdbr").innerHTML="";return}
 if(e.target.closest("[data-mdbs]")){bcRun($("#mdbc").value);return}
 if(d.mdbx!==undefined){bcStop();MD.bc=null;$("#mdbr").innerHTML="";$("#mdbc").value="";return}
 if(d.mdbadd!==undefined){bcAdd();return}
 if(d.mdtxt!==undefined){const t=($("#mdt").value||"").trim().slice(0,80);if(!t){$("#mdt").focus();return}menAdd({t,s:"x",k:"",p:0,L:0})}};
$("#mdlg").onchange=e=>{if(e.target.id==="mdbk"&&MD){MD.bk=e.target.value;mdSearch();return}if(PRP){if(e.target.dataset.pxs!==undefined)PRP.slots[e.target.dataset.pxs]=e.target.checked;return}if(!MD)return;if(e.target.id==="mdday")MD.day=e.target.value;if(e.target.id==="mdslot")MD.slot=e.target.value};
$("#mdlg").oninput=e=>{if(PRP){if(e.target.dataset.pxq!==undefined&&PRP.sr){PRP.sr.q=e.target.value;pxRes()}return}if(e.target.id==="mdbq"&&MD&&MD.bc){$("#mdbv").innerHTML=bcVal(MD.bc.k,+e.target.value||0);return}if(e.target.id==="mdq"){MD.q=e.target.value;mdSearch()}if(e.target.id==="jrf"&&MD){MD.fq=e.target.value;jrFDraw()}if(e.target.id==="mpp"){const p=clampP(e.target.value),w=$("#mpw"),b=w?+w.dataset.base:0;if($("#mpn"))$("#mpn").textContent=p;if(w){const big=b>0&&p/b>4;w.hidden=!big;w.textContent=big?"Gatesti de "+(+(p/b).toFixed(1))+" ori reteta ("+p+" portii, reteta e pentru "+b+"). Verifica numarul de portii.":""}}};
$("#mdlg").onkeydown=e=>{if(e.key==="Escape"){PRP=null;menClose();return}
 if(e.key==="Enter"&&MD){if(e.target.id==="mdbc"){e.preventDefault();bcRun(e.target.value)}if(e.target.id==="mdbq"){e.preventDefault();bcAdd()}if(e.target.id==="mdt"){e.preventDefault();const b=document.querySelector("[data-mdtxt]");if(b)b.click()}if(e.target.id==="mdp"){e.preventDefault();const b=document.querySelector("[data-mdok]");if(b)b.click()}}};

/* ===== 5.0.0: Jurnal de mese (ca Eat & Track): ce ai mancat azi, pe mese, cu totalul zilei fata de tintele din profil =====
   rjr = {zi:{mic:[],pranz:[],cina:[],gustari:[]}}; o intrare: {id,t,s:"b"|"x",k,n,g,u,lot}
   n = portii (g=0) sau grame (g=1); u = [kcal,proteine,carbo,grasimi] pe portie sau la 100 g (null = fara macro) */
const JSL=[["mic","Mic dejun"],["pranz","Pranz"],["cina","Cina"],["gustari","Gustari"]];
const getJr=()=>{try{const j=JSON.parse(LS("rjr")||"{}");return j&&typeof j==="object"&&!Array.isArray(j)?j:{}}catch(e){return{}}};
const putJr=o=>{Object.keys(o).forEach(d=>{const z=o[d];if(!z||typeof z!=="object"){delete o[d];return}Object.keys(z).forEach(s=>{if(!Array.isArray(z[s])||!z[s].length)delete z[s]});if(!Object.keys(z).length)delete o[d]});LS("rjr",JSON.stringify(o))};
let JD=dKey(new Date());
const jrSlotOf=sl=>sl==="desert"?"gustari":JSL.some(x=>x[0]===sl)?sl:"gustari";
const jrGuess=()=>{const hh=new Date().getHours();return hh<11?"mic":hh<16?"pranz":hh<21?"cina":"gustari"};
/* micronutrientii unei intrari: reteta (din ingrediente, pe portie x portii) sau aliment din Info (vector la 100 g, x grame) */
function jrMicE(e){if(e.s==="b"){const r=micEnt({s:"b",k:e.k});return r?{s:r.s.map(v=>v*(+e.n||1)),n:r.n,ok:r.ok}:null}
 if(Array.isArray(e.x)&&e.g){const f=(+e.n||0)/100;return{s:e.x.map(v=>(+v||0)*f),n:1,ok:1}}return null}
function jrDayMic(dz){const s=new Array(27).fill(0);let ents=0,used=0,n=0,ok=0;JSL.forEach(([sl])=>((dz||{})[sl]||[]).forEach(e=>{ents++;const r=jrMicE(e);if(!r)return;used++;n+=r.n;ok+=r.ok;r.s.forEach((v,i)=>{s[i]+=v})}));return{s,ents,used,n,ok}}
const jrCov=d=>(d.used<d.ents?(d.ents-d.used)+" din "+d.ents+" intrari fara date (produse cu cod de bare, text). ":"")+(d.n?"Calculat din "+d.ok+" din "+d.n+" ingrediente. ":"");
function jrMicHtml(j){const pr=getPr(),t=jrDayMic(j[JD]||{});let h="";
 if(t.used)h+=`<details class="mmic" data-mico="j${JD}"${MICO["j"+JD]?" open":""}><summary>Micronutrienti</summary>${micPanel(t.s,jrCov(t),pr,"")}</details>`;
 const acc=new Array(27).fill(0);let nd=0,c={ents:0,used:0,n:0,ok:0};for(let i=0;i<7;i++){const x=jrDayMic(j[dAdd(JD,-i)]||{});c.ents+=x.ents;c.used+=x.used;c.n+=x.n;c.ok+=x.ok;if(x.used){nd++;x.s.forEach((v,k)=>{acc[k]+=v})}}
 if(nd>1)h+=`<details class="mmic" data-mico="jw"${MICO.jw?" open":""}><summary>Micronutrienti, media pe zi (ultimele 7 zile: ${nd} zile cu date)</summary>${micPanel(acc.map(v=>v/nd),jrCov(c),pr,"Fierul, calciul, fibrele si vitaminele se judeca pe mai multe zile; o zi sub tinta nu e o problema daca media e buna.")}</details>`;
 return h}
const jrMac=e=>{if(!Array.isArray(e.u))return null;const f=e.g?(+e.n||0)/100:(+e.n||0);return e.u.map(v=>v==null?null:+(v*f).toFixed(1))};
function jrTot(dz){const s=[0,0,0,0];let n=0,nm=0;JSL.forEach(([sl])=>((dz||{})[sl]||[]).forEach(e=>{const m=jrMac(e);if(m){n++;m.forEach((v,i)=>{s[i]+=+v||0})}else nm++}));return{s:s.map((v,i)=>i?Math.round(v):Math.round(v)),n,nm}}
/* o intrare de meniu (reteta, produs cu cod de bare, text) devine intrare in jurnal */
function jrFromEn(en,n){const e={id:sid(),t:String(en.t||"").slice(0,80),s:en.s==="b"?"b":"x",k:en.s==="b"?en.k:"",n:1,g:0,u:null};
 if(en.s==="b"){e.n=n||en.p||1;const m=menMac(Object.assign({},en,{p:1}));e.u=m?m.map(v=>v==null?null:+v):null}
 else if(en.q){e.g=1;e.n=+en.q;e.u=Array.isArray(en.m)?en.m.map(v=>v==null?null:+(v*100/en.q).toFixed(2)):null;if(Array.isArray(en.x))e.x=en.x}
 else if(Array.isArray(en.m))e.u=en.m.slice(0,4);return e}
/* Meal prep: o portie mancata scade din lotul gatit (cel mai vechi); lotul gol dispare */
function jrLot(k,n){const l=getMP(),lot=l.filter(x=>x.k===k&&x.st!=="p"&&+x.p>0).sort((a,b)=>String(a.d).localeCompare(String(b.d)))[0];if(!lot)return null;
 lot.p=Math.max(0,+((+lot.p)-(n||1)).toFixed(2));const left=lot.p;putMP(left>0?l:l.filter(x=>x!==lot));return{id:lot.id,left}}
function jrPut(day,sl,e){const j=getJr();((j[day]=j[day]||{})[sl]=(j[day][sl]||[])).push(e);putJr(j)}
/* 5.1.1: mesele din meniu din zilele trecute intra singure in jurnal, ca mancate (de la prima pornire a 5.1.0, fara istoric); azi bifezi tu cu "Am mancat".
   Ce a fost diferit stergi sau corectezi in jurnal; stergerea pune masa din meniu pe "nemancat" (en.e=2) si nu mai revine. */
const jrMid=(d,sl,en)=>"m|"+d+"|"+sl+"|"+(en.k||en.t);
function jrSync(){if(!LIBREADY)return 0;const today=dKey(new Date());let st=LS("rjs");if(!st){st=today;LS("rjs",st)}
 /* 5.1.1, o data: mesele de azi puse singure in jurnal de 5.1.0 se intorc in meniu ca planificate (portia revine in lot) */
 if(LS("rv511")!=="1"){try{const j=getJr(),m=getMen(),dm=m[today]||{};let ch=false;
  SLOTS.forEach(([sl])=>(dm[sl]||[]).forEach(en=>{if(!en||en.e!==1)return;const js=jrSlotOf(sl),a=((j[today]||{})[js]||[]),id=jrMid(today,sl,en),ix=a.findIndex(x=>x.id===id);
   if(ix>=0){jrLotBack(a[ix]);a.splice(ix,1)}if(en.k&&!en.mp){const h=getNote(en.k).h||[],k=h.lastIndexOf(today);if(k>=0)setNote(en.k,{h:h.slice(0,k).concat(h.slice(k+1))})}delete en.e;ch=true}));
  if(ch){putJr(j);putMen(m)}}catch(e){dbg(e)}LS("rv511","1")}
 const m=getMen();let j=null,n=0,mc=false;
 Object.keys(m).forEach(d=>{if(d<st||d>=today||!m[d]||typeof m[d]!=="object")return;SLOTS.forEach(([sl])=>((m[d]||{})[sl]||[]).forEach(en=>{if(!en||en.e)return;
  j=j||getJr();const id=jrMid(d,sl,en),js=jrSlotOf(sl),dz=(j[d]=j[d]||{}),arr=(dz[js]=dz[js]||[]);
  if(!arr.some(x=>x.id===id)){const je=jrFromEn(en,1);je.id=id;je.men=1;
   if(en.k&&en.s==="b"){if(en.mp){const l=jrLot(en.k,1);if(l)je.lot=l.id}else if(!(getNote(en.k).h||[]).includes(d))setNote(en.k,{h:(getNote(en.k).h||[]).concat([d])})}
   if(en.L&&d<today){try{removeSrc(en.t+" (meniu "+ZILE[dFrom(d).getDay()].toLowerCase()+")");en.L=0}catch(e){dbg(e)}}
   arr.push(je);n++}
  en.e=1;mc=true}))});
 if(j)putJr(j);if(mc)putMen(m);return n}
/* portia luata dintr-un lot se pune la loc (cand scoti intrarea din jurnal) */
function jrLotBack(je){if(!je||!je.lot)return;const l=getMP(),x=l.find(y=>y.id===je.lot);if(x){x.p=+((+x.p||0)+(+je.n||1)).toFixed(2);putMP(l)}}
/* masa scoasa din meniu: daca intrase singura in jurnal, iese si de acolo */
function jrUnlink(d,sl,en){if(!en||en.e!==1)return;const j=getJr(),js=jrSlotOf(sl),a=((j[d]||{})[js]||[]),id=jrMid(d,sl,en),ix=a.findIndex(x=>x.id===id);if(ix<0)return;jrLotBack(a[ix]);a.splice(ix,1);putJr(j)}
/* adaugat din dialog (MD.jr): retetele intra cu 1 portie (o schimbi din jurnal), produsele cu gramele alese */
function jrAddEn(en){const day=MD.day,sl=MD.slot,u=undoMark(["rjr","rmp","rnote"]),e=jrFromEn(en,1);let msg="";
 if(en.mp&&en.k){const r=jrLot(en.k,e.n);if(r){e.lot=r.id;msg=r.left>0?" Din Meal prep: mai ai "+fmtN(r.left)+(r.left===1?" portie":" portii")+".":" Meal prep: ai terminat lotul."}}
 else if(e.s==="b"&&e.k&&!(getNote(e.k).h||[]).includes(day))setNote(e.k,{h:(getNote(e.k).h||[]).concat([day])});
 jrPut(day,sl,e);menClose();JD=day;if(!$("#v-jurnal").classList.contains("hidden"))drawJr();else if(!$("#v-meniu").classList.contains("hidden"))drawMenu();
 undoShow("Adaugat in jurnal.",u,redrawAll)}
function jrOpen(o){o=o||{};const r=o.r||null;MD={jr:1,day:o.day||JD||dKey(new Date()),slot:o.slot||jrGuess(),s:o.s||null,r,q:"",f:!r&&getMP().some(x=>x.st!=="p"&&+x.p>0)?"m":null};
 const today=dKey(new Date()),dopt=[...Array(8)].map((_,i)=>{const k=dAdd(today,-i);return`<option value="${k}"${k===MD.day?" selected":""}>${esc(dLab(k))}${k===today?" (azi)":""}</option>`}).join("");
 const sopt=JSL.map(([id,l])=>`<option value="${id}"${id===MD.slot?" selected":""}>${l}</option>`).join("");
 const body=r?`<p class="mt12 mb0"><b>${esc(r.titlu)}</b></p><div class="row mt16"><button class="go m0" data-jrok="1">Adauga in jurnal</button><button class="alt" data-mdx="1">Anuleaza</button></div>`
  :`<label for="mdbc" class="mt12">Produs dupa cod de bare</label><div class="bcrow"><input id="mdbc" inputmode="numeric" maxlength="14" class="fx1" placeholder="Cod de bare" autocomplete="off"><div class="bcb"><button class="alt ico" data-mdbs="1" aria-label="Cauta produsul" title="Cauta produsul">${SRC_IC}</button><button class="alt ico${camOk()?"":" gri"}" data-mdbcam="1" aria-label="Scaneaza cu camera" title="Scaneaza cu camera">${CAM_IC}</button></div></div><div id="mdbr"></div>
   <label for="mdq" class="mt12">Reteta (nume sau ingrediente)</label><input id="mdq" placeholder="ex: ciorba, piept de pui" autocomplete="off"><div id="mdres"></div>
   <label for="jrf" class="mt12">Aliment din Info (pe grame)</label><input id="jrf" placeholder="ex: banana, iaurt grecesc, migdale" autocomplete="off"><div id="jrfr"></div>
   
   <label for="mdt">Sau scrie liber (fara macro)</label><div class="row g8"><input id="mdt" maxlength="80" class="fx1"><button class="alt" data-mdtxt="1">Adauga text</button></div><div class="row mt16"><button class="alt" data-mdx="1">Inchide</button></div>`;
 $("#mdlg").innerHTML=`<div class="card mdbox" role="dialog" aria-modal="true" aria-label="Adauga in jurnal"><h2 class="m0">Am mancat</h2><div class="fgrid mt8"><div><label for="mdday">Ziua</label><select id="mdday">${dopt}</select></div><div><label for="mdslot">Masa</label><select id="mdslot">${sopt}</select></div></div>${body}</div>`;
 $("#mdlg").classList.remove("hidden");if(!r)mdSearch();setTimeout(()=>{const e=(TOUCH()?null:$("#mdq"))||$("[data-jrok]");if(e)e.focus()},0)}
/* cautare in Info: alimentele din baza si cele adaugate de tine */
function jrFoods(q){const w=mTok(q);if(!w.length)return[];const out=[];
 const sc=nm=>{const t=mTok(nm);if(!w.every(x=>t.some(y=>y.startsWith(x)||x.startsWith(y)&&y.length>=4)))return-1;return(t[0]&&(t[0].startsWith(w[0])||w[0].startsWith(t[0]))?0:10)+nm.length/100};
 Object.values(FD).forEach(f=>{if(!f||!f.k)return;const v=sc(f.n);if(v>=0)out.push({v:v-1,n:f.n,k:[f.k[0],f.k[1],f.k[3],f.k[2]],x:f.x&&f.x.length===23?f.k.map(z=>+z||0).concat(f.x.map(z=>z==null||z===""?0:+z)):null,b:"aliment adaugat de tine",sq:f.ug||100})});
 NUTRI.R.forEach(r=>{const nm=r[0]+(r[2]&&!norm(r[0]).includes(norm(r[2]))?", "+r[2]:""),v=sc(nm);if(v>=0)out.push({v,n:nm,k:[r[3],r[4],r[6],r[5]],x:r.slice(3).map(z=>z==null?0:+z),b:"Info",sq:100})});
 return out.sort((a,b)=>a.v-b.v).slice(0,8)}
function jrFDraw(){const el=$("#jrfr");if(!el||!MD)return;const l=jrFoods(MD.fq||"");MD.fl=l;
 el.innerHTML=!(MD.fq||"").trim()?"":l.length?l.map((f,i)=>`<div class="me"><div class="mn"><div class="tx">${esc(f.n)}</div><div class="src">${f.k[0]==null?"fara valori":Math.round(f.k[0])+" kcal / 100 g"}</div></div><button class="go m0" data-jrfp="${i}">Alege</button></div>`).join(""):`<p class="muted">Nu e in Info. Il poti adauga din Mai mult > Info, sau scrie-l liber mai jos.</p>`}
function drawJr(){const el=$("#jw");if(!el)return;jrSync();const j=getJr(),dz=j[JD]||{},today=dKey(new Date()),t=jrTot(dz),pt=profT();
 const T=pt.ok?[pt.k,pt.p,pt.c,pt.f]:[0,0,0,0],N=["Calorii","Proteine","Carbohidrati","Grasimi"],U=["kcal","g","g","g"];
 const ok=pt.ok&&t.n?Math.abs(t.s[0]/T[0]-1)<=.1&&t.s[1]>=.9*T[1]:null;
 const nav=`<div style="display:flex;gap:8px;align-items:center"><button class="alt ib m0" data-jday="-1" aria-label="Ziua dinainte" title="Ziua dinainte">&lsaquo;</button><b class="fx1" style="text-align:center">${esc(dLab(JD))}${JD===today?' <span class="lb">azi</span>':""}</b><button class="alt ib m0" data-jday="1" aria-label="Ziua urmatoare" title="Ziua urmatoare"${JD>=today?' disabled':""}>&rsaquo;</button></div>${JD!==today?`<div class="mt8"><button class="alt m0" data-jtoday="1">Inapoi la azi</button></div>`:""}`;
 const sum=t.n||t.nm?`<details class="mmac mt12" data-mico="jm"${MICO.jm?" open":""}><summary>Macro: ${t.s[0]}${pt.ok?" / "+T[0]:""} kcal, ${t.s[1]}${pt.ok?" / "+T[1]:""} g proteine</summary>${t.n?(pt.ok?[0,1,2,3].map(i=>barRow(N[i],t.s[i],T[i],U[i],i!==1,true,false)).join(""):`<b>Total:</b> ${t.s[0]} kcal - ${t.s[1]} g proteine - ${t.s[2]} g carbo - ${t.s[3]} g grasimi`):""}${ok?`<div class="okm mt8 mb0">Ziua e in tinta (calorii si proteine).</div>`:ok===false&&t.s[0]>T[0]*1.1?`<div class="warn wp mt8 mb0">Peste tinta cu ${Math.round(t.s[0]-T[0])} kcal.</div>`:""}${t.nm?`<div class="muted mt8">${t.nm} ${t.nm===1?"intrare":"intrari"} fara macro.</div>`:""}${pt.ok?"":`<p class="muted mt8 mb0">Pentru tinte, completeaza Setari > Profil nutritional.</p>`}</details>`:`<p class="muted mt12 mb0">Nimic notat pentru ziua asta. Adaugi cu "+" la fiecare masa, sau cu "Am mancat" din meniu si din orice reteta.</p>`;
 const meals=JSL.map(([sl,lab])=>{const a=dz[sl]||[],kc=a.reduce((n,e)=>{const m=jrMac(e);return n+(m&&m[0]?+m[0]:0)},0);
  return`<div class="ms"><div class="mt"><span>${lab}${a.length&&kc?` <span class="muted">${Math.round(kc)} kcal</span>`:""}</span><button class="alt ib mpl" data-jadd="${sl}" aria-label="Adauga la ${lab}" title="Adauga la ${lab}">+</button></div>${a.map((e,ix)=>{const m=jrMac(e),ref=`data-js="${sl}" data-ji="${ix}"`,rec=e.s==="b"?BOOK.findIndex(r=>bKey(r)===e.k):-1;
   return`<div class="me" style="align-items:center">${""}<div class="mn">${rec>=0?`<button class="lnk tx" data-jopen="1" ${ref}>${esc(e.t)}</button>`:`<div class="tx">${esc(e.t)}</div>`}<div class="src">${m&&m[0]!=null?Math.round(m[0])+" kcal"+(m[1]!=null?", "+Math.round(m[1])+" g proteine":""):"fara macro"}${e.lot?" - din Meal prep":""}</div></div>${e.g?`<input class="jq" type="number" min="1" max="5000" step="1" value="${esc(e.n)}" data-jq="1" ${ref} aria-label="Grame ${esc(e.t)}" style="width:5.5em"> g`:e.s==="b"?`<div style="display:flex;gap:4px;align-items:center"><button class="alt ib m0" data-jp="-0.5" ${ref} aria-label="Mai putin">&minus;</button><span style="min-width:3.2em;text-align:center">${fmtN(e.n)} ${+e.n===1?"portie":"portii"}</span><button class="alt ib m0" data-jp="0.5" ${ref} aria-label="Mai mult">+</button></div>`:""}<button class="alt ico m0" data-jdel="1" ${ref} aria-label="Sterge ${esc(e.t)} din jurnal" title="Sterge">${IC_DEL}</button></div>`}).join("")}</div>`}).join("");
 el.innerHTML=`<div class="card">${nav}${sum}${jrMicHtml(j)}</div><div class="card">${meals}</div>`}
$("#jw").onclick=e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset;
 if(d.jday!==undefined){const n=dAdd(JD,+d.jday),t=dKey(new Date());JD=n>t?t:n;drawJr();return}
 if(d.jtoday!==undefined){JD=dKey(new Date());drawJr();return}
 if(d.jadd!==undefined){jrOpen({day:JD,slot:d.jadd});return}
 const j=getJr(),a=((j[JD]||{})[d.js]||[]),en=a[+d.ji];if(!en)return;
 if(d.jopen!==undefined){const i=BOOK.findIndex(r=>bKey(r)===en.k);if(i>=0){show("carti");drawBook();openBook(i,BOOK[i].portii,"#bres");window.scrollTo(0,0)}return}
 if(d.jp!==undefined){en.n=Math.min(20,Math.max(.5,+((+en.n||1)+(+d.jp)).toFixed(1)));putJr(j);drawJr();return}
 if(d.jdel!==undefined){if(armDel(b))return;const u=undoMark(["rjr","rmen","rmp"]);a.splice(+d.ji,1);putJr(j);jrLotBack(en);
  if(en.men){const m=getMen(),dm=m[JD]||{};let hit=false;SLOTS.forEach(([sl])=>(dm[sl]||[]).forEach(x=>{if(!hit&&jrMid(JD,sl,x)===en.id){x.e=2;hit=true}}));if(hit)putMen(m)}
  drawJr();undoShow("Scos din jurnal: "+en.t+"."+(en.men?" In meniu ramane ca nemancat.":""),u,drawJr)}};
$("#jw").addEventListener("toggle",e=>{const k=e.target.dataset&&e.target.dataset.mico;if(k)MICO[k]=e.target.open},true);
$("#jw").onchange=e=>{const x=e.target;if(x.dataset.jq===undefined)return;const j=getJr(),en=((j[JD]||{})[x.dataset.js]||[])[+x.dataset.ji];if(!en)return;const v=Math.round(+x.value);if(!(v>=1&&v<=5000)){x.value=en.n;toast("Cantitate intre 1 si 5000 g.");return}en.n=v;putJr(j);drawJr()};
let MW=monOf(dKey(new Date()));
let MDO={};let MV=LS("rmv")==="s"?"s":"z"; /* z = azi si maine (implicit), s = saptamana */
/* Setari > Biblioteca: masa atribuita fiecarei categorii (folosita de "Propune-mi un meniu") */
const PXL={mic:"Mic dejun",pranz:"Pranz",cina:"Cina",desert:"Desert","-":"Nu propune"};
/* 4.29.0: Setari: macro lipsa calculat din Info pentru retetele care il au pe cel putin 80% din ingrediente cu date */
function mxList(){const out=[];BOOK.forEach(r=>{if(r.nou||r.cos||r.pna||r.portii==null||!(r.ingrediente||[]).length||(r.macro&&r.macro.kcal!=null))return;const L=macLocal(r);if(L.n&&L.ok&&L.ok/L.n>=.8)out.push({r,L})});return out}
function drawMx(){const el=$("#mxl");if(!el)return;const no=BOOK.filter(r=>!r.nou&&!r.cos&&(r.ingrediente||[]).length&&!(r.macro&&r.macro.kcal!=null)).length,L=mxList(),st=BOOK.filter(r=>!r.nou&&!r.cos&&!(r.ingrediente||[]).length).length;
 el.innerHTML=`<p class="muted mt0 mb8" >${no} retete cu ingrediente nu au macro. Pot calcula ${L.length} dintre ele din baza Info (cel putin 80% din ingrediente cu date); valorile sunt marcate "Calculat din Info" si le poti recalcula sau corecta oricand.${st?" "+st+" retete nu au ingrediente scrise (trimit la alte retete), deci nu se pot calcula.":""}</p><button class="${L.length?"go":"alt gri"}" type="button" data-mxgo="1" >${L.length?"Calculeaza macro pentru "+L.length+" retete":"Nimic de calculat"}</button>`}
$("#mxcard").onclick=e=>{if(e.target.dataset.mxgo===undefined)return;const L=mxList();if(!L.length){toast("Nu am ce calcula: toate retetele care se pot calcula au deja macro.",false);return}
 const u=undoMark(["rbook"]);let st=getStored();if(!st.length)st=BOOK.map(x=>JSON.parse(JSON.stringify(x)));const idx=new Map(st.map((x,i)=>[bKey(x),i]));
 L.forEach(({r,L:q})=>{const j=idx.get(bKey(r));if(j==null)return;const r2=st[j];r2.macro={kcal:q.o.kcal,proteine:q.o.proteine,carbo:q.o.carbo,grasimi:q.o.grasimi,sursa:"local",acoperire:q.ok+" din "+q.n};clrV(r2,MCT)});
 putStored(st);drawMx();undoShow("Macro calculat pentru "+L.length+" retete.",u,()=>{BOOK=getStored().length?getStored():BOOK0;SV=null;drawMx();drawBook()})}
function drawPxc(){const el=$("#pxl");if(!el)return;/* 5.0.0: fara card (pastrat pentru date vechi) */const c={};BOOK.forEach(r=>{if(r.nou||r.cos||!r.categorie)return;c[r.categorie]=(c[r.categorie]||0)+1});const k=Object.keys(c).sort((a,b)=>a.localeCompare(b,"ro")),ov=getPxc();
 el.innerHTML=k.length?k.map(n=>{const a=pxAuto({categorie:n,titlu:""}),v=ov[n]||"";return`<div class="pxr"><b>${esc(n)} <span class="muted">${c[n]}</span></b><select data-pxc="${esc(n)}" aria-label="Masa pentru ${esc(n)}"><option value=""${v?"":" selected"}>Automat (${a?PXL[a]:PXL["-"]})</option>${Object.keys(PXL).map(s=>`<option value="${s}"${v===s?" selected":""}>${PXL[s]}</option>`).join("")}</select></div>`}).join(""):'<p class="muted">Nu ai categorii in biblioteca.</p>'}
/* 5.0.0: "Categorii si mese" scos */
/* ===== Propune-mi un meniu: motor local peste biblioteca; nimic nu intra in meniu fara confirmare ===== */
const PX_EXC=/\b(sos|sosuri|muraturi|conserv|marmelad|dulceat|retete casnice|glazur|sirop|bauturi|condiment|aluat|baza|gem|compot|lichior|cocktail|detox)/;
const PX_MIC=/\b(mic dejun|brunch|omleta|oua|smoothie|tartinabil|granola|terci|clatite|toast)/;
let _pxcv=null,_pxcm={};
function getPxc(){const v=LS("rpxc")||"";if(v!==_pxcv){_pxcv=v;let j={};try{j=JSON.parse(v||"{}")}catch(e){dbg(e)}_pxcm={};if(j&&typeof j==="object")Object.keys(j).forEach(k=>{if(["mic","pranz","cina","desert","-"].includes(j[k]))_pxcm[k]=j[k]})}return _pxcm}
/* 5.0.0: masa vine din categoria comuna; setarea "Categorii si mese" a disparut odata cu cele 64 de categorii */
const CATSLOT={"Mic dejun":"mic","Supe si ciorbe":"pranz","Fel principal":"pranz","Salate si boluri":"pranz","Paste si orez":"pranz","Deserturi":"desert"};
/* 5.0.1: bazele (aluat, foi, glazura, crema de baza, sirop) nu sunt mese de sine statatoare: nu intra in propunere */
const PX_BASE=/^(aluat|foi\b|foaie|glazur|crema de baza|sirop|bezea|umplutur)/;
function pxSlot(r){if(PX_BASE.test(norm(r.titlu||"").trim()))return null;if(CAT12.includes(r.categorie))return CATSLOT[r.categorie]||null;return pxAuto(r)}
function pxAuto(r){const t=norm((r.categorie||"")+" "+(r.titlu||""));if(PX_EXC.test(norm(r.categorie||"")))return null;
 /* 3.21.0: supele si ciorbele nu sunt desert ("Supe crema" continea "crema") */
 if(!/\b(sup[ae]|ciorb)/.test(t)&&(DESERT.test(t)||/\b(desert|dulciur|crema|jeleu|fructe coapte)/.test(norm(r.categorie||""))))return"desert";
 if(PX_MIC.test(norm(r.categorie||""))||/\b(omleta|smoothie|granola|terci)/.test(norm(r.titlu||"")))return"mic";
 return"pranz"}
const pxIngs=(s,r)=>(s==="b"?(r.ingrediente||[]):(r.ingrediente||[])).filter(x=>(x.n||x.nume)).length;
function pxPool(){const out=[];
 BOOK.forEach((r,i)=>{if(r.nou||r.cos||(r.verifica||[]).some(x=>x!==PVR)||!pxIngs("b",r))return;const sl=pxSlot(r);if(sl)out.push({s:"b",r,sl,key:bKey(r)})});
 getSaved().forEach(r=>{if(!pxIngs("s",r))return;const sl=pxSlot(r);if(sl)out.push({s:"s",r,sl,key:sKey(r)})});return out}
function pxScore(c,slot,ctx){const r=c.r,why=[];let s=0;const pf=recPref(r);
 if(pf.av.length)return null;
 if(pf.lk.length){s+=Math.min(3,pf.lk.length)*3;why.push("iti place: "+pf.lk.slice(0,2).join(", "))}
 if(ctx.fav.has(c.key)){s+=2;why.push("favorita")}
 const n=ctx.notes[c.key]||{};if(+n.st){s+=(+n.st-3)*1.5;if(+n.st>=4)why.push(n.st+" stele")}
 const lc=lastCooked(n);if(lc){const dd=Math.round((dFrom(ctx.today)-dFrom(lc))/864e5);if(dd<14){s-=4;why.push("gatita acum "+dd+" zile")}else if(dd>60){s+=1;why.push("nu ai mai gatit-o demult")}}else s+=0.5;
 if(ctx.pan){const ms=missing(r);if(ms&&ms.tot>0){s+=3*(1-ms.miss.length/ms.tot);if(!ms.miss.length)why.push("ai tot din debara");else if(ms.miss.length<=2)why.push("iti lipsesc "+ms.miss.length)}}
 s+=Math.random();return{s,why}}
let PRP=null;
/* 4.29.0: propunerea se construieste pe zi: mai intai portiile ramase din Meal prep (la pranz si cina), apoi mesele libere se aleg impreuna ca totalul zilei sa fie aproape de tinta din profil (kcal si proteine); fara profil, ca inainte */
const PX_SH={mic:.25,pranz:.35,cina:.3,desert:.1};
/* 4.29.0: micronutrienti: scorul favorizeaza retete care acopera ce lipseste din media saptamanii (fibre, fier, calciu, vitamina D, B12, folat) si penalizeaza ce depaseste limitele (sodiu, grasimi saturate, zaharuri) */
const PX_MINS=()=>MIC.filter(m=>m[3]==="m"&&m[4]===1).map(m=>m[0]),PX_LIMS=()=>MIC.filter(m=>m[3]==="x"&&m[4]===1).map(m=>m[0]);
function pxMicOf(s,r){try{const o=micEnt(mkEntry(s,r));return o&&o.n&&o.ok/o.n>=.5?o:null}catch(e){return null}}
function pxMicBonus(v,avg,tg){if(!v||!tg)return 0;let b=0;PX_MINS().forEach(i=>{const def=Math.max(0,1-avg[i]/tg[i]);b+=def*Math.min(1,v[i]/(tg[i]/3))});PX_LIMS().forEach(i=>{const over=Math.min(1,avg[i]/tg[i]);b-=.5*over*Math.min(1,v[i]/(tg[i]/3))});return b/PX_MINS().length*3}
const pxMainIng=r=>{const x=(r.ingrediente||[])[0];return x?mTok(x.n||x.nume||"")[0]||"":""};
function pxMacOf(s,r){try{return menMac(mkEntry(s,r))}catch(e){return null}}
function pxBuild(slots){const m=getMen(),today=dKey(new Date()),ctx={fav:new Set(getFav()),notes:getNotes(),today,pan:getPan().length>0,mt:getMT()},pool=pxPool();
 const inMenu=new Set();Object.values(m).forEach(dm=>SLOTS.forEach(([s])=>(dm[s]||[]).forEach(en=>{if(en.k)inMenu.add(en.k)})));
 const days=[...Array(7)].map((_,i)=>dAdd(MW,i)).filter(d=>d>=today),cells=[];
 days.forEach(d=>slots.forEach(sl=>{if(!((m[d]||{})[sl]||[]).length)cells.push({d,sl,row:null})}));
 const rank={};slots.forEach(sl=>{rank[sl]=pool.filter(c=>(c.sl===sl||(sl==="cina"&&c.sl==="pranz")||(sl==="pranz"&&c.sl==="cina"))&&!inMenu.has(c.key)).map(c=>{const z=pxScore(c,sl,ctx);return z?{c,s:z.s,why:z.why}:null}).filter(Boolean).sort((a,b)=>b.s-a.s)});
 const used=new Set(),mk=(x,over)=>Object.assign({d:x.d,sl:x.sl,cand:[],ix:-1,off:false,gen:null},over||{});
 /* 1. Meal prep: portiile ramase ale loturilor recente sau planificate, la pranz si cina */
 const lim=dAdd(today,-5);
 getMP().filter(l=>l.d>=lim).sort((a,b)=>(a.d>b.d)-(a.d<b.d)).forEach(l=>{const rc=mpRec(l);if(!rc)return;let left=Math.max(0,(+l.p||0)-mpInMen(l.k));if(!left)return;const key=l.k,item={c:{s:rc.s,r:rc.r,sl:"pranz",key},s:99,why:["din Meal prep"]};
  /* 4.30.0: un lot intra cel mult o data pe zi (nu pranz si cina din aceeasi reteta); zilele care au deja reteta in meniu sunt sarite */
  const dz=new Set(Object.keys(m).filter(dk=>SLOTS.some(([sl])=>((m[dk]||{})[sl]||[]).some(en=>en.k===key))));
  cells.filter(x=>!x.row&&(x.sl==="pranz"||x.sl==="cina")&&x.d>=(l.d>today?l.d:today)).forEach(x=>{if(left<=0||dz.has(x.d)||cells.some(y=>y.d===x.d&&y.row&&y.row.mp&&y.row.cand[0].c.key===key))return;x.row=mk(x,{cand:[item,...rank[x.sl].filter(y=>y.c.key!==key&&!used.has(y.c.key)).slice(0,6)],ix:0,mp:true});left--;dz.add(x.d);used.add(key)})});
 /* 2. restul meselor, zi cu zi */
 const T=ctx.mt.k,P=ctx.mt.p,rows=[],byDay={};cells.forEach(x=>{(byDay[x.d]=byDay[x.d]||[]).push(x)});
 const tg=micT(getPr(),profT()),acc=new Array(27).fill(0);let nAcc=0;const hadMic=new Set(),accAdd=v=>{if(v)for(let j=0;j<27;j++)acc[j]+=v[j]};
 days.forEach(d=>{const t=dayMic(m[d]||{});if(t.used){accAdd(t.s);nAcc++;hadMic.add(d)}});
 days.forEach(d=>{const cs=byDay[d];if(!cs)return;const have=dayMac(m[d]||{}).s;let fx=[have[0],have[1]];
  cs.filter(x=>x.row).forEach(x=>{const a=pxMacOf(x.row.cand[0].c.s,x.row.cand[0].c.r);if(a){fx[0]+=a[0];fx[1]+=a[1]||0}});
  const avg=acc.map(v=>v/Math.max(1,nAcc)),free=cs.filter(x=>!x.row),opts=free.map(x=>rank[x.sl].filter(y=>!used.has(y.c.key)).slice(0,6).map(y=>{const mo=tg?pxMicOf(y.c.s,y.c.r):null;return{y,a:pxMacOf(y.c.s,y.c.r),mi:pxMainIng(y.c.r),mv:mo&&mo.s,mb:mo?pxMicBonus(mo.s,avg,tg):0}}));
  let best=null;
  if(free.length&&T>0&&opts.every(o=>o.length)){const cur=[];const rec=(k,sc,kc,pr)=>{if(k===free.length){const dup=cur.length-new Set(cur.map(o=>o.mi||o.y.c.key)).size,dev=Math.abs(kc-T)/T,pd=P>0?Math.max(0,P-pr)/P:0,tot=sc-10*dev-6*pd-1.5*dup;if(!best||tot>best.t)best={t:tot,p:cur.slice()};return}
    opts[k].forEach(o=>{if(cur.some(z=>z.y.c.key===o.y.c.key))return;cur.push(o);const sh=PX_SH[free[k].sl]||.3;rec(k+1,sc+o.y.s+o.mb,kc+(o.a?o.a[0]:T*sh),pr+(o.a?(o.a[1]||0):P*sh));cur.pop()})};rec(0,0,fx[0],fx[1])}
  free.forEach((x,k)=>{const o=opts[k];let first=best?best.p[k].y:o[0]?o[0].y:null;{const ch=best?best.p[k]:o[0];if(ch&&ch.mv){accAdd(ch.mv);}}const cand=first?[first,...rank[x.sl].filter(y=>!used.has(y.c.key)&&y!==first).slice(0,7)]:[];if(first)used.add(first.c.key);x.row=mk(x,{cand,ix:cand.length?0:-1})});cs.filter(x=>x.row&&x.row.mp).forEach(x=>{const mo=tg?pxMicOf(x.row.cand[0].c.s,x.row.cand[0].c.r):null;if(mo)accAdd(mo.s)});if(tg&&!hadMic.has(d))nAcc++});
 cells.forEach(x=>rows.push(x.row));
 return{rows,avoided:pool.filter(c=>recPref(c.r).av.length).length,pool:pool.length,T,P}}
function pxOpen(){MD=null;const today=dKey(new Date()),mon=MW,cnt=[...Array(7)].map((_,i)=>dAdd(mon,i)).filter(d=>d>=today).length;
 PRP={step:0,slots:{mic:true,pranz:true,cina:true,desert:true},res:null};pxDraw()}
function pxDaySum(d){const P=PRP,R=P.res,T=R.T,PP=R.P;if(!(T>0))return"";const h=dayMac(getMen()[d]||{});let k=h.s[0],p=h.s[1],unk=0;
 R.rows.forEach(r=>{if(r.d!==d||r.off)return;const sel=r.pk?{s:r.pk.s,r:r.pk.r}:r.gen?{s:"s",r:r.gen}:r.ix>=0&&r.cand[r.ix]?{s:r.cand[r.ix].c.s,r:r.cand[r.ix].c.r}:null;
  [sel,...(r.xs||[]).map(x=>({s:x.s,r:x.r}))].filter(Boolean).forEach(z=>{const a=pxMacOf(z.s,z.r);if(a){k+=a[0];p+=a[1]||0}else unk++})});
 k=Math.round(k);p=Math.round(p);const ok=Math.abs(k-T)/T<=.1&&(PP<=0||p>=.9*PP);
 return`<div class="fss" style="margin:2px 0 12px;color:${ok?"var(--pri)":"var(--amb)"}">${esc(dLab(d))}: ${k} din ${T} kcal, proteine ${p} din ${PP} g${unk?" ("+unk+" fara macro, nu intra in suma)":""}</div>`}
function pxMicSum(){const P=PRP,R=P.res,pr=getPr(),t=profT(pr),tg=micT(pr,t);if(!tg)return"";const m=getMen(),acc=new Array(27).fill(0),days=[...new Set(R.rows.map(r=>r.d))];let nd=0,n=0,ok=0,ents=0,used=0,nomac=0;
 days.forEach(d=>{let got=false;const h=dayMic(m[d]||{});if(h.used){for(let j=0;j<27;j++)acc[j]+=h.s[j];got=true;ents+=h.ents;used+=h.used;n+=h.n;ok+=h.ok}
  R.rows.forEach(r=>{if(r.d!==d||r.off)return;const sel=r.pk?{s:r.pk.s,r:r.pk.r}:r.gen?{s:"s",r:r.gen}:r.ix>=0&&r.cand[r.ix]?{s:r.cand[r.ix].c.s,r:r.cand[r.ix].c.r}:null;
   [sel,...(r.xs||[]).map(x=>({s:x.s,r:x.r}))].filter(Boolean).forEach(z=>{ents++;const o=pxMicOf(z.s,z.r);if(o){for(let j=0;j<27;j++)acc[j]+=o.s[j];got=true;used++;n+=o.n;ok+=o.ok}else nomac++})});
  if(got)nd++});
 if(!nd)return"";const avg=acc.map(v=>v/nd),low=MIC.filter(x=>x[3]==="m"&&x[4]===1&&avg[x[0]]<.8*tg[x[0]]).map(x=>x[1]+" "+Math.round(avg[x[0]]/tg[x[0]]*100)+"%"),hi=MIC.filter(x=>x[3]==="x"&&x[4]===1&&avg[x[0]]>tg[x[0]]).map(x=>x[1]+" "+Math.round(avg[x[0]]/tg[x[0]]*100)+"%");
 const good=!low.length&&!hi.length;
 return`<details class="mmic mt12" data-pxmic="1"${P.mo?" open":""}><summary>Micronutrienti, media pe zi (${nd} ${nd===1?"zi":"zile"} cu date)</summary><p class="mt8 mb8" style="color:${good?"var(--pri)":"var(--amb)"}">${good?"Principalele minime sunt acoperite si limitele respectate.":(low.length?"Sub 80% din necesar: "+esc(low.join(", "))+". ":"")+(hi.length?"Peste limita: "+esc(hi.join(", "))+".":"")}</p>${micPanel(avg,micCov({ents,used,n,ok}),pr,"Cate 1 portie din fiecare reteta, cu ce ai deja in meniu.")}</details>`}
function pxDraw(){const P=PRP,box=`<div class="card mdbox" role="dialog" aria-modal="true" aria-label="Propune-mi un meniu">`;
 if(P.step===0){const a=dFrom(MW),z=dFrom(dAdd(MW,6));
  $("#mdlg").innerHTML=`${box}<h2 class="m0">Propune-mi un meniu</h2><p class="muted">Completez mesele goale din saptamana ${a.getDate()} ${LUNI[a.getMonth()]} - ${z.getDate()} ${LUNI[z.getMonth()]} (de azi inainte). Aleg din biblioteca si din retetele salvate, cu respect pentru ce eviti, cu preferinta pentru ce iti place, ce ai in debara si ce nu ai gatit recent. Tu confirmi tot inainte sa intre in meniu.</p>
  <div class="chk mt8 mb8" >${SLOTS.map(([id,l])=>`<label><input type="checkbox" data-pxs="${id}"${P.slots[id]?" checked":""}> ${l}</label>`).join("")}</div>
  <div class="row mt12 g8" ><button class="go m0" data-pxgo="1" >Propune</button><button class="alt" data-pxx="1">Anuleaza</button></div></div>`}
 else{const R=P.res,rows=R.rows,ok=rows.filter(r=>!r.off&&(r.ix>=0&&r.cand[r.ix]||r.gen||r.pk||(r.xs||[]).length)).length;
  const hasKey=!!LS("rk");
  $("#mdlg").innerHTML=`${box}<h2 class="m0">Propunere de meniu</h2>${rows.length?"":'<p class="muted">Nu ai mese goale in perioada si la mesele alese.</p>'}
  ${R.avoided?`<p class="muted mt8 mb8" >${R.avoided} retete excluse pentru ca au alimente evitate.</p>`:""}
  ${rows.map((r,i)=>{const c=r.ix>=0?r.cand[r.ix]:null,t=r.gen?r.gen.titlu:c?c.c.r.titlu:null;
   const pk=r.pk,tt=pk?pk.r.titlu:t,xs=r.xs||[],srch=P.sr&&P.sr.i===i;
   return`<div class="me" style="flex-wrap:wrap;gap:6px;opacity:${r.off?.45:1}"><div class="mn"><div class="muted">${esc(dLab(r.d))} - ${esc(SLOTS.find(x=>x[0]===r.sl)[1])}</div>${r.off?`<span class="tx muted">Scoasa</span>`:tt?`<span class="tx">${esc(tt)}</span>${pk?` <span class="lb">alesa de tine</span>`:r.gen?` <span class="lb">generata</span>`:""}${!pk&&c&&!r.gen&&c.why.length?`<div class="muted">${esc(c.why.join(" - "))}</div>`:""}`:`<span class="tx muted">Nu am gasit o reteta potrivita.</span>`}${r.off?"":xs.map((x,j)=>`<div class="tx">+ ${esc(x.r.titlu)} <button class="alt ib" data-pxxr="${i}:${j}" aria-label="Scoate ${esc(x.r.titlu)}" title="Scoate">&times;</button></div>`).join("")}</div>
   ${r.off?`<button class="alt" data-pxu="${i}">Pune la loc</button>`:`${tt&&!r.gen&&!pk&&r.cand.length>1?`<button class="alt" data-pxn="${i}">Alta varianta</button>`:tt&&!r.gen&&!pk?`<button class="alt gri" data-pxgri="Nu am alte variante pentru aceasta masa.">Alta varianta</button>`:""}${(!tt||r.gen)?hasKey?`<button class="alt" data-pxai="${i}" data-ai="1">${r.gen?"Alta generata":"Genereaza"}</button>`:`<button class="alt gri" data-pxgri="Genereaza are nevoie de cheia API (Setari).">${r.gen?"Alta generata":"Genereaza"}</button>`:""}<button class="alt" data-pxpk="${i}">Alege tu</button><button class="alt" data-pxad="${i}">+ Inca una</button><button class="alt ico" data-pxr="${i}" aria-label="Scoate masa din propunere" title="Scoate masa din propunere">${IC_DEL}</button>`}${srch&&!r.off?`<div style="flex-basis:100%"><label for="pxq">${P.sr.m==="ad"?"Adauga inca o reteta":"Alege o reteta"}</label><input id="pxq" data-pxq="1" maxlength="60" placeholder="Nume sau ingredient" autocomplete="off" value="${esc(P.sr.q||"")}"><div id="pxres"></div></div>`:""}</div>${rows[i+1]&&rows[i+1].d===r.d?"":pxDaySum(r.d)}`}).join("")}
  ${pxMicSum()}
  <div class="row mt16 g8" ><button class="go m0" data-pxok="1" ${ok?"":" disabled"}>Adauga la meniu (${ok})</button><button class="alt" data-pxre="1">Propune din nou</button><button class="alt" data-pxx="1">Anuleaza</button></div></div>`}}
async function pxGen(i,btn){const R=PRP.res,r=R.rows[i],pf=getPf(),slot=SLOTS.find(x=>x[0]===r.sl)[1];
 btn.disabled=true;btn.textContent="Generez...";
 const have=R.rows.map(x=>x.gen?x.gen.titlu:x.ix>=0&&x.cand[x.ix]?x.cand[x.ix].c.r.titlu:null).filter(Boolean).slice(0,30);
 const u=`Propune o reteta simpla de ${slot.toLowerCase()} pentru 2 portii. Evita ABSOLUT: ${pf.e.join(", ")||"(nimic)"}. Prefera: ${pf.l.join(", ")||"(fara preferinte)"}. Nu repeta: ${have.join("; ")||"(nimic)"}. Foloseste ingrediente obisnuite si ${$("#ing")&&$("#ing").value?"daca se poate din: "+$("#ing").value:"din bucataria romaneasca"}.\nFormat: {"titlu":"","portii":0,"ingrediente":[{"nume":"","cantitate":0,"unitate":""}],"pasi":[{"id":"p1","text":"","aparat":"manual","durata_min":0}],"avertismente":[""],"etichete":[""]}`;
 try{const g=await ask($("#m2").value||"claude-haiku-4-5",SYS+" Pasii incep cu un verb la imperativ, o actiune per pas.",u,2500,0.5);
  if(!g||!g.titlu||!Array.isArray(g.ingrediente)||!g.ingrediente.length)throw new Error("Reteta generata nu e completa. Incearca din nou.");
  g.etichete=normTags(g.etichete);const blob=norm(g.titlu+" "+g.ingrediente.map(x=>x.nume).join(" ")),P=pfCheck();
  if(P.e.some(([n,pt])=>pt.every(w=>blob.includes(w))))throw new Error("Reteta generata continea un aliment evitat; am renuntat la ea. Incearca din nou.");
  r.gen=g;r.pk=null;r.off=false;pxDraw()}
 catch(e){toast(e.message||"Eroare",true);pxDraw()}}
function pxApply(){const R=PRP.res,m=getMen();let n=0,sv=getSaved(),savedNew=false;
 R.rows.forEach(r=>{if(r.off)return;let en=null;
  if(r.gen){const g=aiSave(JSON.parse(JSON.stringify(r.gen)));en=mkEntry("b",g)}
  if(r.pk)en=mkEntry(r.pk.s,r.pk.r);else if(r.gen){}else if(r.ix>=0&&r.cand[r.ix]){const c=r.cand[r.ix].c;en=mkEntry(c.s,c.r)}
  if(en&&r.mp&&!r.pk&&r.ix===0)en.mp=1;
  const ls=[en,...(r.xs||[]).map(x=>mkEntry(x.s,x.r))].filter(Boolean);
  if(ls.length){const dm=(m[r.d]=m[r.d]||{});if((dm[r.sl]||[]).length)return;dm[r.sl]=ls;n++}});
 
 putMen(m);PRP=null;menClose();toast("Am adaugat "+n+(n===1?" masa":" mese")+" in meniu.");drawMenu()}
/* 4.29.0: in propunerea de meniu: "Alege tu" (rezultat la alegerea ta) si "+ Inca una" (mai multe retete la aceeasi masa) */
function pxRes(){const P=PRP,box=$("#pxres");if(!P||!P.sr||!box)return;const q=qWords(P.sr.q||""),out=[];
 const hit=x=>!q.length||(x.s==="s"?q.every(w=>norm(x.r.titlu+" "+(x.r.ingrediente||[]).map(y=>y.nume).join(" ")).includes(w)):bScore(x.r,q).h===q.length);
 const fav=new Set(getFav());
 if(q.length){getSaved().forEach(r=>{const x={s:"s",r};if(out.length<8&&hit(x))out.push(x)});BOOK.forEach(r=>{const x={s:"b",r};if(out.length<8&&!r.cos&&!r.nou&&hit(x))out.push(x)})}
 else{BOOK.forEach(r=>{if(out.length<8&&!r.cos&&!r.nou&&fav.has(bKey(r)))out.push({s:"b",r})})}
 P.sr.list=out;
 box.innerHTML=out.length?out.map((x,k)=>`<div class="me"><div class="mn"><span class="tx">${esc(x.r.titlu)}</span><div class="muted">${x.r.sursa==="Retetele mele"?"Ale mele":"Din "+esc(x.r.sursa||"biblioteca")}</div></div><button class="alt" data-pxsel="${P.sr.i}:${k}">Alege</button></div>`).join(""):`<p class="muted">${q.length?"Nu gasesc nicio reteta.":"Scrie numele sau un ingredient (sau vezi favoritele de mai sus)."}</p>`}
function pxClick(e){const b=e.target.closest("button")||e.target,d=b.dataset,P=PRP;
 if(b===$("#mdlg")||d.pxx!==undefined){PRP=null;menClose();return true}
 if(d.pxs!==undefined){P.slots[d.pxs]=b.checked;return true}
 if(d.pxgo!==undefined){const sl=SLOTS.map(x=>x[0]).filter(s=>P.slots[s]);if(!sl.length){toast("Alege cel putin o masa.");return true}P.sel=sl;P.res=pxBuild(sl);P.step=1;pxDraw();return true}
 if(d.pxre!==undefined){P.res=pxBuild(P.sel);pxDraw();return true}
 if(d.pxn!==undefined){const r=P.res.rows[+d.pxn];const used=new Set(P.res.rows.filter(x=>x!==r&&!x.off&&x.ix>=0&&x.cand[x.ix]).map(x=>x.cand[x.ix].c.key));
  for(let k=1;k<=r.cand.length;k++){const j=(r.ix+k)%r.cand.length;if(!used.has(r.cand[j].c.key)){r.ix=j;break}}r.pk=null;pxDraw();return true}
 if(d.pxgri!==undefined){toast(d.pxgri,false);return true}
 if(b.closest&&b.closest("[data-pxmic] > summary")){const dt=b.closest("details");setTimeout(()=>{P.mo=dt.open},0);return true}
 if(d.pxpk!==undefined||d.pxad!==undefined){const i=+(d.pxpk!==undefined?d.pxpk:d.pxad),m=d.pxpk!==undefined?"pk":"ad";P.sr=P.sr&&P.sr.i===i&&P.sr.m===m?null:{i,m,q:""};pxDraw();pxRes();if(P.sr){const q=$("#pxq");if(q&&!TOUCH())q.focus()}return true}
 if(d.pxsel!==undefined){const [i,k]=d.pxsel.split(":"),x=P.sr&&P.sr.list&&P.sr.list[+k],r=P.res.rows[+i];if(!x||!r)return true;if(P.sr.m==="pk"){r.pk=x;r.gen=null;r.mp=false}else(r.xs=r.xs||[]).push(x);P.sr=null;pxDraw();return true}
 if(d.pxxr!==undefined){const [i,j]=d.pxxr.split(":");P.res.rows[+i].xs.splice(+j,1);pxDraw();return true}
 if(d.pxr!==undefined){P.res.rows[+d.pxr].off=true;pxDraw();return true}
 if(d.pxu!==undefined){P.res.rows[+d.pxu].off=false;pxDraw();return true}
 if(d.pxai!==undefined){pxGen(+d.pxai,b);return true}
 if(d.pxok!==undefined){pxApply();return true}
 return true}
function drawMenu(){jrSync();
 const m=getMen(),today=dKey(new Date()),tom=dAdd(today,1),zi=MV==="z",days=zi?[today,tom]:[...Array(7)].map((_,i)=>dAdd(MW,i)),a=dFrom(MW),z=dFrom(dAdd(MW,6));
 const cnt=days.reduce((n,d)=>n+SLOTS.reduce((k,[s])=>k+((m[d]||{})[s]||[]).length,0),0);
 const mt=getMT(),dd=days.map(d=>dayMac(m[d]||{})).filter(x=>x.nd),av=dd.length?[0,1,2,3].map(i=>Math.round(dd.reduce((s,x)=>s+x.s[i],0)/dd.length)):null;
 const avg=av&&!zi?`<p class="muted mt12 mb0" >Media pe zi (${dd.length} ${dd.length===1?"zi":"zile"} cu date): ${av[0]} kcal, ${av[1]} g proteine, ${av[2]} g carbo, ${av[3]} g grasimi.</p>`:"";
/* 4.22.1: reteta de 2+ ori in perioada afisata, fara lot de Meal prep: la prima aparitie apare butonul "N mese: fa Meal prep" */
 const BR={},BRK={},PLN=new Set(getMP().filter(x=>x.st==="p").map(x=>x.k)),HAS=new Set(getMP().map(x=>x.k));
 days.forEach(d=>{if(d<today)return;SLOTS.forEach(([sl])=>((m[d]||{})[sl]||[]).forEach((en,ix)=>{if(en.s==="x"||!en.k||en.mp||HAS.has(en.k))return;const o=BR[en.k]||(BR[en.k]={n:0,at:d+"|"+sl+"|"+ix});o.n++}))});
 Object.keys(BR).forEach(k=>{if(BR[k].n>=2)BRK[BR[k].at]=BR[k].n});
 const WAND='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z" fill="#f5c542" stroke="#b7860b" stroke-width="1.5"/><path d="M9.5 18.5h5M10.5 21h3" stroke="#b7860b" stroke-width="1.7"/></svg>';
 const seg=`<div class="mtop"><div class="row mseg g8" ><button class="alt${zi?" on":""}" data-mv="z" aria-pressed="${zi}">Azi si maine</button><button class="alt${zi?"":" on"}" data-mv="s" aria-pressed="${!zi}">Saptamana</button></div><div class="mti"><button class="alt ico" data-mshop="${zi?"z":"w"}" aria-label="${zi?"Cumparaturi azi si maine":"Cumparaturi saptamana"}" title="${zi?"Cumparaturi azi si maine":"Cumparaturi saptamana"}">${CART}</button><button class="alt ico" data-mprop="1" aria-label="Idei de meniu: propune-mi un meniu" title="Idei de meniu: propune-mi un meniu">${WAND}</button>${zi?"":`<button class="alt ico" data-mclr="1" aria-label="Goleste saptamana" title="Goleste saptamana">${IC_DEL}</button>`}</div></div>`;
 const hint=cnt?(profT().ok?"":`<p class="muted mt12 mb0" >Pentru tinte si procente din necesar, completeaza Setari > Profil nutritional.</p>`):`<p class="muted mt12 mb0" >Meniul e gol. Adaugi retete cu "+" din fiecare masa sau cu "Adauga la meniu" din orice reteta (biblioteca, salvate, generate).</p>`;
 const head=zi?`<div class="card">${seg}${hint}</div>`
 :`<div class="card">${seg}<div class="mh"><button class="alt" data-mw="-1" aria-label="Saptamana trecuta">&lt;</button><button class="alt" data-mw="0" style="flex:1;min-width:140px" title="Mergi la saptamana asta">${a.getDate()} ${LUNI[a.getMonth()]} - ${z.getDate()} ${LUNI[z.getMonth()]} ${z.getFullYear()}</button><button class="alt" data-mw="1" aria-label="Saptamana urmatoare">&gt;</button></div>${avg}${hint}</div>`;
 function macBlock(dm,d){const t=dayMac(dm);if(!t.nd&&!t.nm)return"";
  const eb=t.nm?`<button class="alt mt8 mb0" data-mest="d" data-ai="1" data-day="${d}" >Estimeaza macro (${t.nm})</button>`:"";
  if(!t.nd)return`<div class="mmac muted">Fara macro pentru ${t.nm} ${t.nm===1?"reteta":"retete"}.${eb?"<br>":""}${eb}</div>`;
  const pt=profT(),T=[mt.k||0,mt.p||0,pt.ok?pt.c:0,pt.ok?pt.f:0],U=["kcal","g","g","g"],N=["Calorii","Proteine","Carbohidrati","Grasimi"],OV=[1,0,1,1];
  const hq=SLOTS.some(([id])=>(dm[id]||[]).some(en=>en.q)),note=`<div class="muted">cate 1 portie din fiecare reteta${hq?"; produsele cu cantitate, dupa cantitatea introdusa":""}${t.nl?"; "+t.nl+" calculat"+(t.nl===1?"a":"e")+" din Info":""}${t.ne?"; "+t.ne+" estimat"+(t.ne===1?"a":"e")+" cu AI":""}${t.nm?"; "+t.nm+" fara macro":""}</div>`;
  if(!T.some(x=>x))return`<div class="mmac"><b>Total aprox.:</b> ${t.s[0]} kcal - ${t.s[1]} g proteine - ${t.s[2]} g carbo - ${t.s[3]} g grasimi${note}${eb}</div>`;
  return`<details class="mmic mmac" data-mico="m${d}"${MICO["m"+d]?" open":""}><summary>Macro: ${t.s[0]} kcal, ${t.s[1]} g proteine</summary>${[0,1,2,3].map(i=>T[i]?barRow(N[i],t.s[i],T[i],U[i],!!OV[i],true,false):`<div class="mic big"><span class="mn2">${N[i]}</span><span class="mbar"></span><span class="mv"><b>${t.s[i]}</b> ${U[i]}</span></div>`).join("")}${note}${eb}</details>`}
 const isOpen=d=>MDO[d]!==undefined?MDO[d]:(d===today||(!days.includes(today)&&d===days[0]));
 const rows=days.map(d=>{const dm=m[d]||{},op=isOpen(d),has=SLOTS.some(([s])=>(dm[s]||[]).length);
  return`<div class="card mday${d===today?" today":""}"><div class="mh"><h2 class="mhh"><button class="mtog" data-mtog="1" data-day="${d}" aria-expanded="${op}"><span class="chev" aria-hidden="true">${op?"&#9662;":"&#9656;"}</span> ${esc(dLab(d))}${d===today?` <span class="lb">azi</span>`:d===tom?` <span class="lb">maine</span>`:""}</button></h2>${has?`<button class="alt ib" data-mshop="d" data-day="${d}" aria-label="Cumparaturi pentru ziua asta" title="Cumparaturi pentru ziua asta">${CART}</button>`:""}</div>`+
  /* 5.1.3: ziua stransa arata doar titlul */
  SLOTS.filter(()=>op).map(([id,lab])=>`<div class="ms"><div class="mt"><span>${lab}</span>${op?`<button class="alt ib mpl" data-madd="${id}" data-day="${d}" aria-label="Adauga in ${lab}" title="Adauga in ${lab}">+</button>`:""}</div>${(dm[id]||[]).map((en,ix)=>{const rec=menRec(en),ref=`data-day="${d}" data-slot="${id}" data-ix="${ix}"`;
   return`<div class="me${en.e===1?" mdn":en.k?" mpl":""}"><button class="alt ib mrm" data-mdel="1" ${ref} aria-label="Scoate ${esc(en.t)} din meniu" title="Scoate din meniu">&minus;</button><div class="mn">${rec?`<button class="lnk tx" data-mopen="1" ${ref} title="Deschide reteta">${esc(en.t)}</button>`:`<span class="tx">${esc(en.t)}</span>`}${en.mp?` <span class="lb">din Meal prep</span>`:""}${en.L?` <button class="lb lbb" data-mlx="1" ${ref} title="Scoate din cumparaturi" aria-label="In lista; apasa ca sa scoti din cumparaturi">in lista &times;</button>`:""}${!en.mp&&en.k&&PLN.has(en.k)?` <span class="lb">in Meal prep</span>`:""}${BRK[d+"|"+id+"|"+ix]?`<div><button class="alt mt4 mb0" data-mbr="1" data-mn="${BRK[d+"|"+id+"|"+ix]}" ${ref}>${BRK[d+"|"+id+"|"+ix]} mese: fa Meal prep</button></div>`:""}${en.s!=="x"&&!rec&&LIBREADY?`<div class="warn">Reteta nu mai e in Biblioteca; folosesc ingredientele salvate in meniu.</div>`:""}${rec&&rec.r.cos?`<div class="muted">Reteta e in cos.</div>`:""}${(()=>{const a=menMac(en);return a?`<div class="muted">~${Math.round(a[0])} kcal${a[1]!=null?", "+Math.round(a[1])+" g proteine":""} (${en.q?en.q+" g":"1 portie"}${en.me?", estimat":""})</div>`:""})()}</div>${d<=today&&en.e!==1?`<button class="alt" data-mgat="1" ${ref}>Am mancat</button>`:""}</div>`}).join("")}</div>`).join("")+(op?macBlock(dm,d):"")+`</div>`}).join("");
 $("#mw").innerHTML=mpHtml()+head+rows}
$("#mw").addEventListener("toggle",e=>{const k=e.target.dataset&&e.target.dataset.mico;if(k)MICO[k]=e.target.open},true);
/* cumparaturi din meniu: intrarile deja adaugate nu se repeta decat daca confirmi */
function menShop(btn,ds,label){
 let hasMp=false;const m=getMen(),ents=[],pl=new Set(getMP().map(x=>x.k));ds.forEach(d=>SLOTS.forEach(([s])=>((m[d]||{})[s]||[]).forEach(en=>{if(en.mp||(en.k&&pl.has(en.k)))hasMp=true;else if(en.s!=="x")ents.push({d,en})})));
 if(!ents.length){toast(hasMp?"Mesele din Meal prep nu adauga ingrediente: se cumpara prin Meal prep.":"Nu ai retete in meniu pentru "+label+".");return}
 let use=ents.filter(x=>!x.en.L);
 if(!use.length){if(armDel(btn)){toast("Produsele sunt deja in lista. Apasa Confirma ca sa le adaugi din nou.");return}use=ents}
 let n=0,sk=0;use.forEach(({d,en})=>{const ing=menIngs(en);if(!ing.length){sk++;return}n+=addList(ing,en.t+" (meniu "+ZILE[dFrom(d).getDay()].toLowerCase()+")");en.L=1});
 putMen(m);drawMenu();
 LBN={label,n,r:use.length-sk,sk,old:ents.length-use.length};show("lista");window.scrollTo(0,0)}
$("#v-meniu").onclick=e=>{const b=e.target.closest("button")||e.target,d=b.dataset;
 if(d.mpadd!==undefined){mpOpen();return}
 if(d.mbr!==undefined){const a=(getMen()[d.day]||{})[d.slot],en=a&&a[+d.ix],rec=en&&menRec(en);if(!rec)return;const n=+d.mn||1;MD={mp:1,f:null,q:"",r:null,dp:Math.min(99,Math.max(1,n)),after:()=>{drawMenu()}};$("#mdlg").classList.remove("hidden");mpForm(en.s,rec.r);return}
 if(d.mpdone!==undefined){const u=undoMark(["rmp"]),x=getMP().find(y=>y.id===d.mpdone);putMP(getMP().filter(y=>y.id!==d.mpdone));drawMenu();undoShow("Terminat: "+(x?x.t:"lot")+".",u,drawMenu);return}
 if(d.mpq!==undefined&&d.mps!==undefined){const x=getMP().find(y=>y.id===d.mpq);if(x&&mpResize(x.id,clampP(x.p)+(+d.mps))){MPO=true;drawMenu();drawList();const nb=document.querySelector(`[data-mpq="${CSS.escape(x.id)}"][data-mps="${d.mps}"]`);if(nb&&!nb.disabled)nb.focus()}return}
 if(d.mpcook!==undefined){const x=getMP().find(y=>y.id===d.mpcook);if(!x)return;const u=undoMark(["rmp","rl","rnote","rmen"]),today=dKey(new Date());putMP(getMP().map(y=>{if(y.id!==x.id)return y;const z=Object.assign({},y,{d:today});delete z.st;return z}));setNote(x.k,{h:(getNote(x.k).h||[]).concat([today])});const r=removeSrc(x.t),nm=mpMark(x.k);drawMenu();drawList();undoShow("Gatit: "+x.t+(nm?". "+nm+(nm===1?" masa din meniu e acum":" mese din meniu sunt acum")+" \"din Meal prep\"":"")+(r.rem||r.red?". Din cumparaturi: "+r.rem+" produse scoase"+(r.red?", "+r.red+" cu cantitate redusa (comune cu alte retete)":""):"")+".",u,redrawAll);return}
 if(d.mpdel!==undefined){if(armDel(b))return;const x=getMP().find(y=>y.id===d.mpdel);if(!x)return;const u=undoMark(["rmp","rl"]);putMP(getMP().filter(y=>y.id!==x.id));const r=removeSrc(x.t);drawMenu();drawList();undoShow("Scos din Meal prep: "+x.t+(r.rem||r.red?" ("+r.rem+" produse scoase din cumparaturi)":"")+".",u,redrawAll);return}
 if(d.mpopen!==undefined){const x=getMP().find(y=>y.id===d.mpopen),rc=x&&mpRec(x);if(!rc)return;if(rc.s==="b"){show("carti");drawBook();openBook(rc.i,rc.r.portii,"#bres")}window.scrollTo(0,0);return}
 if(d.mest!==undefined){menEst(d.day,b);return}
 if(d.mtog!==undefined){const m=getMen(),dm=m[d.day]||{},cur=MDO[d.day]!==undefined?MDO[d.day]:b.getAttribute("aria-expanded")==="true";MDO[d.day]=!cur;drawMenu();return}
 if(d.mv!==undefined){MV=d.mv==="s"?"s":"z";LS("rmv",MV);drawMenu();return}
 if(d.mshop==="z"){menShop(b,[dKey(new Date()),dAdd(dKey(new Date()),1)],"azi si maine");return}
 if(d.mw!==undefined){MW=d.mw==="0"?monOf(dKey(new Date())):dAdd(MW,7*+d.mw);drawMenu();return}
 if(d.madd!==undefined){menOpen({day:d.day,slot:d.madd});return}
 if(d.mshop==="w"){menShop(b,[...Array(7)].map((_,i)=>dAdd(MW,i)),"saptamana asta");return}
 if(d.mshop==="d"){menShop(b,[d.day],dLab(d.day));return}
 if(d.mprop!==undefined){if(MV==="z"){MW=monOf(dKey(new Date()))}pxOpen();$("#mdlg").classList.remove("hidden");setTimeout(()=>{const e=$("[data-pxgo]");if(e)e.focus()},0);return}
 if(d.mclr!==undefined){if(armDel(b))return;const u=undoMark(["rmen"]),m=getMen();[...Array(7)].forEach((_,i)=>delete m[dAdd(MW,i)]);putMen(m);drawMenu();undoShow("Saptamana a fost golita.",u,redrawAll);return}
 if(d.mlx!==undefined){const en=((getMen()[d.day]||{})[d.slot]||[])[+d.ix];if(en){const t=en.t+" (meniu "+ZILE[dFrom(d.day).getDay()].toLowerCase()+")",u=undoMark(["rl","rmen"]),r=removeSrc(t);drawMenu();undoShow(srcMsg(t,r),u,redrawAll)}return}
 if(d.mdel!==undefined){const u=undoMark(["rmen","rjr","rmp"]),m=getMen(),a=(m[d.day]||{})[d.slot];if(a){const t=(a[+d.ix]||{}).t;jrUnlink(d.day,d.slot,a[+d.ix]);a.splice(+d.ix,1);putMen(m);drawMenu();undoShow("Scos din meniu: "+t+".",u,redrawAll)}return}
 if(d.mgat!==undefined){const m=getMen(),a=(m[d.day]||{})[d.slot],en=a&&a[+d.ix];if(en&&en.e!==1){const u=undoMark(["rnote","rl","rmen","rjr","rmp"]),t=en.t+" (meniu "+ZILE[dFrom(d.day).getDay()].toLowerCase()+")",hadL=!!en.L,je=jrFromEn(en,1);je.id=jrMid(d.day,d.slot,en);je.men=1;let msg="",r=null;
  if(en.k&&en.s==="b"){if(en.mp){const l=jrLot(en.k,1);if(l){je.lot=l.id;msg=l.left>0?" Din Meal prep: mai ai "+fmtN(l.left)+(l.left===1?" portie":" portii")+".":" Meal prep: ai terminat lotul."}}
   else{if(!(getNote(en.k).h||[]).includes(d.day))setNote(en.k,{h:(getNote(en.k).h||[]).concat([d.day])});r=hadL?removeSrc(t):null}}
  jrPut(d.day,jrSlotOf(d.slot),je);{const m2=getMen(),e2=((m2[d.day]||{})[d.slot]||[])[+d.ix];if(e2){e2.e=1;if(hadL)e2.L=0;putMen(m2)}}drawMenu();drawList();undoShow("Adaugat in jurnal.",u,redrawAll)}return}
 if(d.mok!==undefined){const a=(getMen()[d.day]||{})[d.slot],en=a&&a[+d.ix],rec=en&&menRec(en);if(rec&&en.s==="b"){rec.r.mok=true;if(persistBook(rec.r)){drawMenu();toast("Avertizare ascunsa pentru aceasta reteta.")}}return}
 if(d.mopen!==undefined){const a=(getMen()[d.day]||{})[d.slot],en=a&&a[+d.ix],rec=en&&menRec(en);if(!rec)return;
  if(en.s==="b"){show("carti");drawBook();openBook(rec.i,rec.r.portii,"#bres")}
  window.scrollTo(0,0)}};
$("#v-meniu").addEventListener("toggle",e=>{if(e.target.id==="mpd")MPO=e.target.open},true);
/* 4.12.0: confirmare unitara la stergere: primul tap schimba butonul in "Confirma" (4 secunde), al doilea sterge; butonul isi recapata continutul (cos de gunoi) singur */
function armDel(b){if(b.dataset.arm==="1")return false;const h=b.innerHTML;b.dataset.arm="1";b.textContent="Confirma";setTimeout(()=>{if(b.isConnected){b.dataset.arm="";b.innerHTML=h}},4000);return true}
const IC_DEL='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';
const ZS=[.9,1,1.15,1.3,1.5];
function zmSet(i,sv){i=Math.max(0,Math.min(ZS.length-1,i));document.documentElement.style.setProperty("--z",ZS[i]);$("#zv").textContent=Math.round(ZS[i]*100)+"%";$("#zd").disabled=i===0;$("#zu").disabled=i===ZS.length-1;ZI=i;if(sv)try{localStorage.setItem("rzm",String(ZS[i]))}catch(e){}}
let ZI=1;
(function(){let v=1;try{v=parseFloat(localStorage.getItem("rzm"))||1}catch(e){}let i=ZS.indexOf(v);zmSet(i<0?1:i,false);$("#zd").onclick=()=>zmSet(ZI-1,true);$("#zu").onclick=()=>zmSet(ZI+1,true);$("#zv").onclick=()=>zmSet(1,true)})();
const APP_V="5.1.7";
if(PMIG)setTimeout(()=>{drawPantry();navCount();undoShow("Debara: "+PMIG.n+(PMIG.n===1?" rand unit":" randuri unite")+" (aceeasi forma, alt marcaj).",PMIG.before,redrawAll)},400);
/* ===== Instalare ca aplicatie, functionare fara net, stocare protejata ===== */
let INST=null;
if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol)){
 const had=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener("controllerchange",()=>{if(had)toast("S-a instalat o versiune noua a aplicatiei. Reincarca pagina ca s-o folosesti.")});
 window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js?v="+APP_V).catch(()=>{})})}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();INST=e;updPst()});
window.addEventListener("appinstalled",()=>{INST=null;updPst()});
async function persistStore(){try{if(navigator.storage&&navigator.storage.persist&&!(await navigator.storage.persisted()))await navigator.storage.persist()}catch(e){dbg(e)}}
async function updPst(){const el=$("#pst");if(!el)return;let per=null,txt="";
 try{if(navigator.storage&&navigator.storage.persisted)per=await navigator.storage.persisted()}catch(e){dbg(e)}
 try{if(navigator.storage&&navigator.storage.estimate){const s=await navigator.storage.estimate();const mb=v=>v>=1048576*1024?Math.round(v/1073741824)+" GB":(v/1048576).toFixed(1)+" MB";if(s&&s.usage!=null)txt=" Folosit: "+mb(s.usage)+(s.quota?" din ~"+mb(s.quota)+" disponibili pe dispozitiv":"")+"."}}catch(e){dbg(e)}
 const lsk=(()=>{let n=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);n+=k.length+(localStorage.getItem(k)||"").length}}catch(e){dbg(e)}return n})();
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
$("#bkcard h2").insertAdjacentHTML("afterend",'<div id="bkwarn" class="warn mt0 mb8" ></div>');
/* Setari -> Alimente: in ce categorie intra fiecare aliment (folosita in Debara) */
function drawCatCfg(){const l=loadCats();
 $("#cgl").innerHTML=l.map(c=>`<div class="fd"><input data-cgn="${esc(c.id)}" value="${esc(c.n)}" maxlength="30" aria-label="Nume categorie" style="flex:1 1 140px;min-height:40px"${c.id==="altele"?" readonly":""}>${c.id==="altele"?`<span class="muted fa" style="flex:1 1 170px;text-align:left">categoria generala, ramane mereu</span>`:`<label class="cgf" style="margin:0;font-weight:400"><input type="checkbox" data-cgf="${esc(c.id)}" ${c.f?"checked":""} style="width:auto;min-height:0"> cu marcaje</label><button class="alt ico" data-cgd="${esc(c.id)}" aria-label="Sterge categoria" title="Sterge">${IC_DEL}</button>`}</div>`).join("");
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
 if(armDel(b))return;
 saveCats(loadCats().filter(c=>c.id!==id));putCats(getCats().filter(x=>x.c!==id));drawFoods()};
function foodNames(){const m=new Map();getPan().forEach(p=>m.set(cn(p.n),p.n));getCats().forEach(o=>{if(!m.has(cn(o.n)))m.set(cn(o.n),o.n)});return[...m.values()].sort((a,b)=>norm(a).localeCompare(norm(b)))}
function drawFoods(){drawCatCfg();const q=norm($("#fdq").value||"").trim(),ov=new Set(getCats().map(x=>cn(x.n)));
 const L=foodNames().filter(n=>!q||norm(n).includes(q));
 {const q=($("#fdq").value||"").trim(),sm=$("#fdls");if(sm)sm.textContent="Alimente ("+L.length+")";if(q&&$("#fdld"))$("#fdld").open=true}
 $("#fdl").innerHTML=L.length?L.map(n=>`<div class="fd"><div class="pn">${esc(n)}</div><select data-fc="${esc(n)}" aria-label="Categorie pentru ${esc(n)}">${CATS.map(([id,lab])=>`<option value="${esc(id)}"${id===catOf(n)?" selected":""}>${esc(lab)}</option>`).join("")}</select>${ov.has(cn(n))?`<button class="alt" data-fr="${esc(n)}" title="Revine la incadrarea automata">Automat</button>`:`<span class="muted fa">automat</span>`}</div>`).join(""):'<p class="muted">Niciun aliment. Adauga unul mai sus sau pune produse in Debara.</p>'}
$("#fdAdd").onclick=()=>{const n=$("#fdn").value.trim();if(!n)return;setCat(n,$("#fdc").value);$("#fdn").value="";drawFoods();if(!$("#v-debara").classList.contains("hidden"))drawPantry()};
$("#fdn").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();$("#fdAdd").click()}};
$("#fdq").oninput=drawFoods;
$("#fdl").onchange=e=>{const n=e.target.dataset.fc;if(n===undefined)return;setCat(n,e.target.value);drawFoods()};
$("#fdl").onclick=e=>{const n=e.target.dataset.fr;if(n===undefined)return;putCats(getCats().filter(x=>cn(x.n)!==cn(n)));drawFoods()};
$("#pCats").onclick=()=>{show("setari");setSub("alimente");$("#cdet").open=true;window.scrollTo(0,0)};
/* Setari: pagina de pornire cu lista si stari; Utilizare in fata, Tehnic pliat (2.24.1) */
const SUBS=["profil","aparate","pref","alimente","etichete","cont","carti","backup","despre"];
const SGMAP={profil:["profil"],aparate:["aparate"],pref:["pref"],alimente:["alimente"],etichete:["etichete"],sectiuni:["sectiuni"],cont:["cont"],carti:["biblioteca"],backup:["bkfile","bksnap","bkdb"],despre:["despre"]};
const STITLE={profil:"Profil nutritional",aparate:"Aparate",pref:"Preferinte alimente",alimente:"Raioane debara",etichete:"Etichete retete",sectiuni:"Titluri de sectiune",mese:"Mese",cont:"AI si cheie",carti:"Carti",backup:"Backup",despre:"Despre"};
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
 if(id==="sectiuni"){const n=getSec().length;return n+(n===1?" cuvant":" cuvinte")}
 if(id==="cont")return (LS("rk")?"Cheie setata":"Cheie lipsa")+" \u00b7 "+((LS("rm1")||"claude-haiku-4-5").replace("claude-",""));
 if(id==="carti"){const n=(()=>{try{return STORED.length}catch(e){return 0}})();return n?n+" retete in biblioteca":"nicio carte incarcata"}
 if(id==="backup"){const f=t=>new Date(t).toLocaleDateString("ro-RO",{day:"numeric",month:"short"});if(dbOn())return +LS("rdbl")?"sincronizat cu Dropbox: "+f(+LS("rdbl")):"Dropbox conectat";const t=+LS("rbk")||0;return t?"ultimul backup: "+f(t):"niciun backup"}
 if(id==="despre")return "Versiunea "+APP_V}catch(e){dbg(e)}return""}
function sRow(id,e){const w=id==="cont"&&!LS("rk")||id==="backup"&&bkDue();return`<button type="button" class="srow${e===id?" on":""}" data-s="${id}"><span class="srt"><b>${STITLE[id]}</b><span class="srs${w?" warn2":""}">${esc(sStat(id))}</span></span><span class="chev" aria-hidden="true">&rsaquo;</span></button>`}
/* 5.0.0: setarile in 4 grupuri: Eu, Bucatarie, Date, Aplicatie */
const SGRP={eu:["profil","pref"],buc:["aparate","etichete","alimente","sectiuni"],date:["backup","carti"],app:["cont","despre"]},SGL={eu:"Eu",buc:"Bucatarie",date:"Date",app:"Aplicatie"},tabOf=i=>Object.keys(SGRP).find(g=>SGRP[g].includes(i))||"eu";
let STAB=(()=>{try{const v=localStorage.getItem("rst");return SGRP[v]?v:"eu"}catch(x){return"eu"}})();
function setTab(t){STAB=SGRP[t]?t:"eu";try{localStorage.setItem("rst",STAB)}catch(x){dbg(x)}}
function renderSnav(e){const at=sAttn();
 const tb=(t,l,dot)=>`<button type="button" role="tab" class="stab${STAB===t?" on":""}" data-tab="${t}" aria-selected="${STAB===t}">${l}${dot?'<span class="sdot" role="img" aria-label="necesita atentie"></span>':""}</button>`;
 const dt=g=>at.length&&SGRP[g].some(i=>i==="cont"&&!LS("rk")||i==="backup"&&bkDue());
 $("#snav").innerHTML=`<div class="stabs" role="tablist">${Object.keys(SGRP).map(g=>tb(g,SGL[g],dt(g))).join("")}</div><div class="sgrp">${SGRP[STAB].map(i=>sRow(i,e)).join("")}</div>`}
let _ls=null;
function sRender(){const e=sEff();if(SUB&&SUB!==_ls)STAB=tabOf(SUB);_ls=SUB;$("#v-setari").classList.toggle("sm-det",!!SUB);renderSnav(e);
 document.querySelectorAll("#v-setari [data-sg]").forEach(c=>c.classList.toggle("hidden",!(e&&SGMAP[e].includes(c.dataset.sg))));
 $("#sbt").textContent=e?STITLE[e]:"";document.querySelectorAll("#sdet .card h2").forEach(x=>x.classList.remove("dup"));if(SUB){const cs=document.querySelectorAll("#sdet .card[data-sg]:not(.hidden)"),x=cs.length===1&&cs[0].querySelector(":scope>h2");if(x)x.classList.add("dup")}
 if(e==="alimente")drawFoods();if(e==="despre")loadChg()}
let CHG=null;
function loadChg(){$("#abv").textContent="Cartea mea de retete, versiunea "+APP_V+".";const el=$("#chg");if(CHG!==null){el.textContent=CHG;return}el.textContent="Se incarca...";
 fetch("CHANGELOG.md").then(r=>r.ok?r.text():Promise.reject()).then(t=>{CHG=t.slice(0,60000);el.textContent=CHG}).catch(()=>{CHG=null;el.textContent="Istoricul complet e in fisierul CHANGELOG.md din pachet (aici nu se poate citi cand deschizi aplicatia ca fisier unic)."})}
$("#snav").onclick=e=>{const tt=e.target.closest("[data-tab]");if(tt){setTab(tt.dataset.tab);renderSnav(sEff());return}const b=e.target.closest("[data-s]");if(b){SUB=TABOF(b.dataset.s);sRender();window.scrollTo(0,0)}};
$("#sdet").addEventListener("change",()=>renderSnav(sEff()));$("#sdet").addEventListener("click",()=>setTimeout(()=>renderSnav(sEff()),80));
$("#sbk").onclick=()=>{setHome();window.scrollTo(0,0)};
WIDE.addEventListener&&WIDE.addEventListener("change",sRender);
document.addEventListener("click",e=>{const g=e.target.closest("[data-gosub]");if(g){show("setari");setSub(g.dataset.gosub);setTimeout(()=>{if(g.dataset.gosub==="cont"&&$("#key"))$("#key").focus()},0)}});
/* semn pentru copia de siguranta veche (peste 14 zile) */
const DOT='<span class="dot" title="Backup-ul e vechi"></span>';
function bkAge(){const t=Math.max(+LS("rbk")||0,+LS("rdbl")||0);return t?Math.floor((Date.now()-t)/864e5):null}
function bkDue(){let has=false;try{has=getSaved().length>0||getStored().length>0}catch(e){dbg(e)}if(!has)return false;const g=bkAge();return g===null||g>14}
function bkBadge(){const d=bkDue(),g=bkAge();
 [["#gnav [data-g=mai] .nlb","Mai mult"],["#v-mai .stl","Setari"]].forEach(([s,t])=>{const el=document.querySelector(s);if(el)el.innerHTML=t+(d?DOT:"")});
 if(typeof sRender==="function")sRender();
 $("#bkwarn").textContent=d?(g===null?"":"Ultimul backup are "+g+" de zile. Descarca unul nou."):""}
bkBadge();
$("#bCancel").onclick=()=>{if(ABORT)ABORT.abort()};
/* copie de siguranta */
const BK_KEYS=DKEYS;
let IMP=null;
function bkLast(){const t=LS("rbk");return t?"Ultimul backup descarcat: "+new Date(+t).toLocaleString("ro-RO")+".":"Nu ai descarcat niciun backup inca."}
function bkInfo(d){const n=k=>{try{const j=JSON.parse(d[k]);return Array.isArray(j)?j.length:(j&&typeof j==="object"?Object.keys(j).length:0)}catch(e){return 0}};return{meniu:n("rmen"),salvate:n("rs"),favorite:n("rfav"),etichete:n("rtags"),aparate:n("ra"),biblioteca:n("rbook"),lista:n("rl"),debara:n("rp")}}
$("#bkm").textContent=bkLast();
function bkBuild(){const d={},mine=STORED.filter(r=>!shUnmod(r)),liv={};STORED.forEach(r=>{if(shUnmod(r))(liv[r.sursa]=liv[r.sursa]||[]).push(r.nr)});
 BK_KEYS.forEach(k=>{const v=k==="rbook"?(mine.length?JSON.stringify(mine):null):LS(k);if(v!=null)d[k]=v});if(Object.keys(liv).length)d.rliv=JSON.stringify(liv); /* 4.1.0: retetele livrate neschimbate nu intra in backup, doar lista lor (rliv) */d.rtags=JSON.stringify(TAGS);d.ra=JSON.stringify(AP);
 const o={app:"retete-dana",format:1,data_export:new Date().toISOString(),date:d};
 const info=bkInfo(d);info.biblioteca=STORED.length;
 return{json:JSON.stringify(o),name:"retete-backup-"+dKey(new Date())+".json",info}}
const bkMsg=(i,pre)=>pre+i.salvate+" retete salvate, "+i.favorite+" favorite, "+i.biblioteca+" retete in biblioteca, "+i.debara+" produse in debara, "+i.meniu+" zile in meniu. ";
$("#bExp").onclick=()=>{const f=bkBuild();
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([f.json],{type:"application/json"}));
 a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
 LS("rbk",String(Date.now()));bkBadge();$("#bkm").textContent=bkMsg(f.info,"Descarcat: ")+bkLast()};
/* trimite copia prin partajarea telefonului (Drive, WhatsApp, e-mail...), unde browserul permite fisiere */
$("#bShare").onclick=async()=>{const f=bkBuild(),file=new File([f.json],f.name,{type:"application/json"});
 try{await navigator.share({files:[file],title:"Backup Cartea mea de retete"});LS("rbk",String(Date.now()));bkBadge();$("#bkm").textContent=bkMsg(f.info,"Trimis: ")+bkLast()}
 catch(e){if(e&&e.name==="AbortError")return;$("#bkm").textContent="Nu am putut deschide partajarea. Foloseste \"Descarca backup\"."}};
(()=>{try{const t=new File(["{}"],"a.json",{type:"application/json"});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[t]}))$("#bShare").hidden=false}catch(e){dbg(e)}})();
function impDraw(){const el=$("#bipv");if(!IMP){el.innerHTML="";return}const i=bkInfo(IMP.date);
 el.innerHTML=`<div class="card mt8 mb0" ><b>${esc(IMP.f.name)}</b><div class="muted mt8 mb12" >Backup din ${esc((IMP.data_export||"").slice(0,10))}: ${i.salvate} retete salvate, ${i.favorite} favorite, ${i.etichete} etichete, ${i.aparate} aparate, ${i.biblioteca} retete in biblioteca, ${i.debara} produse in debara, ${i.meniu} zile in meniu.<br><b>Inlocuieste</b> tot ce ai acum in aplicatie pentru aceste date (cheia API ramane).</div><button class="go m0" data-ip="ok" >Restaureaza</button> <button class="alt" data-ip="no">Anuleaza</button></div>`}
const BK_ARR=["rs","rfav","rtags","ra","rbook","rl","rp","rcat","rcg","rmp"];
function bkParse(txt,name){const j=JSON.parse(txt);if(j.app!=="retete-dana"||!j.date||typeof j.date!=="object")throw 0;
 for(const k of Object.keys(j.date)){if((!BK_KEYS.includes(k)&&k!=="rliv")||typeof j.date[k]!=="string")throw 0;if(!["rm1","rm2b"].includes(k)){const v=JSON.parse(j.date[k]),arr=Array.isArray(v);if(BK_ARR.includes(k)?!arr:(!v||typeof v!=="object"||arr))throw 0}} /* 4.1.1: lista unde trebuie lista, obiect unde trebuie obiect */
 return{date:j.date,data_export:j.data_export,f:{name}}}
$("#bimp").onchange=async e=>{const f=e.target.files[0];IMP=null;$("#bkm").textContent=bkLast();if(!f){impDraw();return}
 try{const tx=await f.text();try{const j0=JSON.parse(tx);if(j0&&Array.isArray(j0.corectii)){impDraw();$("#bkm").textContent="Acesta e un fisier de corectii, nu un backup. Il aplici din Setari > Carti, la \"Aplica un fisier de corectii\".";return}}catch(_){dbg(_)}IMP=bkParse(tx,f.name);impDraw()}
 catch(x){impDraw();$("#bkm").textContent="Fisierul nu e un backup valid al acestei aplicatii."}};
$("#bipv").onclick=async e=>{const d=e.target.dataset.ip;if(!d)return;
 if(d==="no"){IMP=null;$("#bimp").value="";impDraw();$("#bkm").textContent="Restaurare anulata.";return}
 const KL=BK_KEYS.filter(k=>k!=="rbook"),bak={},prev=STORED,date=IMP.date;KL.forEach(k=>{bak[k]=localStorage.getItem(k)});
 const back=()=>{try{KL.forEach(k=>{if(bak[k]!=null)localStorage.setItem(k,bak[k]);else localStorage.removeItem(k)})}catch(y){dbg(y)}};
 let lib=[];try{const j=date.rbook!=null?JSON.parse(date.rbook):[];lib=Array.isArray(j)?j:[]}catch(x){lib=[]}
 $("#bkm").textContent="Restaurez...";await snapMake(true);
 /* biblioteca intai (cea mai mare); daca ceva esueaza, ramane tot ce era inainte */
 if(!(await saveStored(lib))){await saveStored(prev);$("#bkm").textContent="Nu am putut salva biblioteca din backup. Am pastrat datele de dinainte, neschimbate.";return}
 try{KL.forEach(k=>{if(date[k]!=null)localStorage.setItem(k,nd(date[k]));else localStorage.removeItem(k)});
  /* 4.1.0: dupa restaurare, cartile livrate se reinstaleaza din fisierele aplicatiei (lista din rliv) */
  localStorage.removeItem("rbv");if(date.rliv!=null)localStorage.setItem("rbneed",date.rliv);else localStorage.removeItem("rbneed")}
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
 const j=await r.json().catch(()=>({}));if(!r.ok){if(j.error==="invalid_grant"&&body.grant_type==="refresh_token")try{localStorage.removeItem("rdbt")}catch(e){dbg(e)}
  throw new Error(j.error==="invalid_grant"?"Conectarea Dropbox a expirat. Conecteaza din nou.":(j.error_description||j.error||"Eroare Dropbox"))}return j}
let DBAT=null,DBAX=0;
async function dbAccess(){if(DBAT&&Date.now()<DBAX-60000)return DBAT;const rt=LS("rdbt");if(!rt)throw new Error("Dropbox nu e conectat.");
 const j=await dbToken({grant_type:"refresh_token",refresh_token:rt,client_id:DBK()});DBAT=j.access_token;DBAX=Date.now()+(j.expires_in||14400)*1000;return DBAT}
async function dbApi(url,arg,body,content){const t=await dbAccess(),h={Authorization:"Bearer "+t};
 if(content){h["Dropbox-API-Arg"]=JSON.stringify(arg);if(body!=null)h["Content-Type"]="application/octet-stream"}else h["Content-Type"]="application/json";
 const r=await fetch(url,{method:"POST",headers:h,body:content?body:JSON.stringify(arg)});
 if(!r.ok){let m="Eroare Dropbox ("+r.status+")";try{const j=await r.json();if(j.error_summary)m+=": "+j.error_summary}catch(e){dbg(e)}throw new Error(m)}return r}
async function snDraw(){const el=$("#snbox");if(!el)return;const L=await snapList();
 el.innerHTML=`<p class="muted mt0 mb8" >Aplicatia isi face singura o copie (cel mult una la 20 de ore) si le pastreaza pe ultimele ${SNAPN}. Te ajuta daca stergi sau strici ceva; nu te ajuta daca stergi datele browserului.</p>`+
  (IDBOK&&DB?(L.length?L.map(k=>`<div class="apr"><span>${esc(fmtDT(k.slice(5)))}</span><button class="alt" type="button" data-snr="${esc(k)}">Restaureaza</button></div>`).join(""):'<p class="muted">Inca nu exista nicio copie.</p>')+`<button class="alt mt8" type="button" data-snmk="1" >Fa o copie acum</button>`:'<p class="muted">Browserul nu permite baza de date locala, deci copiile automate nu sunt disponibile.</p>')}
/* ===== 3.0.0: sincronizare prin Dropbox =====
   Un singur fisier /sync.json in folderul aplicatiei. La fiecare sincronizare se combina in 3 pasi: ce era la ultima sincronizare (baza, in IndexedDB),
   ce ai acum aici, ce e acum in Dropbox. Ce s-a schimbat doar pe o parte se preia; ce s-a schimbat pe ambele parti, pe elemente diferite, se pastreaza amandoua;
   pe acelasi element castiga varianta de aici. Modificarea bate stergerea. Cheia AI si cheile Dropbox nu se sincronizeaza. */
const SY_RAW=["rm1","rm2b"],SY_MIN=60000;
const SY_LAB={rbook:"biblioteca",rs:"retete salvate",rfav:"favorite",rtags:"etichete",rsec:"titluri de sectiune",ra:"aparate",rm1:"setari AI",rm2b:"setari AI",rl:"lista de cumparaturi",rp:"debara",rcat:"debara",rcg:"debara",rmen:"meniu",rmp:"Meal prep",rmt:"meniu",rnote:"notite",rpf:"preferinte alimente",rpxc:"meniu",rfd:"alimente proprii",rprof:"profil nutritional",rjr:"jurnal de mese"};
function syLocal(){const o={};BK_KEYS.forEach(k=>{if(k==="rbook"){o.rbook=cl(STORED);return}
 const v=LS(k);if(v==null)return;if(SY_RAW.includes(k)){o[k]=v;return}try{o[k]=JSON.parse(v)}catch(e){dbg(e)}});return o}
function syEq(a,b){if(a===b)return true;if(typeof a!=="object"||typeof b!=="object"||!a||!b)return false;
 if(Array.isArray(a)!==Array.isArray(b))return false;
 if(Array.isArray(a)){if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(!syEq(a[i],b[i]))return false;return true}
 const ka=Object.keys(a),kb=Object.keys(b);if(ka.length!==kb.length)return false;for(const k of ka)if(!(k in b)||!syEq(a[k],b[k]))return false;return true}
function syId(key,path){const p=path.length;
 if(key==="rbook"&&p===0)return bKey;if(key==="rs"&&p===0)return sKey;if(key==="rfav"&&p===0)return"set";
 if((key==="rtags"||key==="rl"||key==="rp"||key==="rcat")&&p===0)return x=>x&&x.n;
 if((key==="ra"||key==="rcg"||key==="rmp")&&p===0)return x=>x&&x.id; /* 4.3.2: loturile de Meal prep se unesc dupa id; inainte, daca ambele dispozitive adaugau loturi, ramanea lista unuia singur */
 if(key==="rmen"&&p===2)return x=>x&&x.s+"|"+x.t;
 if(key==="rjr"&&p===2)return x=>x&&x.id;
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
  let rev=null;try{rev=(JSON.parse(r.headers.get("dropbox-api-result")||"{}")).rev||null}catch(e){dbg(e)}
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
   const v=mer[k];try{if(v===undefined)localStorage.removeItem(k);else localStorage.setItem(k,nd(SY_RAW.includes(k)?v:JSON.stringify(v)))}catch(e){throw new Error("Nu am putut scrie in browser (spatiu insuficient).")}}}
 finally{try{sidRun();v5Run();menDedupe();const o=lOrphan();if(o.length)setTimeout(()=>toast(orfTxt(o)),600)}catch(e){dbg(e)}SYAPPLY=false}}
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
   await idbPut("syncbase",mer);if(rev)LS("rdbr",rev);LS("rdbl",String(Date.now()));try{localStorage.removeItem("rdbe")}catch(e){dbg(e)}bkBadge();
   return{ok:true,applied:chg,diff:chg?syDiff(loc,mer):[],conf:conf.length}}
  return{err:"Dropbox s-a schimbat in timpul sincronizarii. Incearca din nou."}}
 catch(e){return{err:e.message||"Eroare la sincronizare."}}
 finally{SYBUSY=false}}
const SY_FL={portii:"portii",etichete:"etichete",ingrediente:"ingrediente",pasi_carte:"mod de preparare",macro:"macro",titlu:"titlu",categorie:"categorie",capitol:"capitol",sfaturi:"sfaturi",verifica:"marcaje de verificat",pna:"portii (nu se aplica)",mok:"avertizare macro"};
/* 4.3.2: valoarea aratata la o modificare facuta pe ambele dispozitive e citibila si pentru liste (titluri sau nume), nu doar "(diferit)" */
const syNm=x=>x&&typeof x==="object"?String(x.t||x.titlu||x.n||x.nume||"(diferit)"):String(x);
const syVal=v=>v==null?"(gol)":Array.isArray(v)?(v.length?(v.slice(0,3).map(syNm).join(", ")+(v.length>3?" si inca "+(v.length-3):"")).slice(0,90):"(gol)"):typeof v==="object"?syNm(v).slice(0,60):String(v).slice(0,40);
function syConfSave(c){let o=[];try{o=JSON.parse(LS("rsyc")||"[]")}catch(e){dbg(e)}if(!Array.isArray(o))o=[];
 c.forEach(x=>o.push({t:Date.now(),nm:x.nm||SY_LAB[x.k]||x.k,f:SY_FL[x.f]||x.f||"",l:syVal(x.l),r:syVal(x.r)}));LS("rsyc",JSON.stringify(o.slice(-30)))}
const syConfGet=()=>{try{const o=JSON.parse(LS("rsyc")||"[]");return Array.isArray(o)?o:[]}catch(e){return[]}};
function syBar(txt,btn){const b=$("#sybar");if(!b)return;if(!txt){b.hidden=true;return}$("#sytxt").textContent=txt;$("#syGo").hidden=!btn;$("#syGo").textContent=btn||"";b.hidden=false}
const syMsg=r=>r.err?r.err:r.blocked?"Sincronizare oprita: ar sterge peste jumatate din "+r.blocked+". Verifica datele inainte sa continui.":r.pending?"Sunt modificari noi de pe alt dispozitiv ("+r.diff.join(", ")+").":r.applied?"Preluat de pe alt dispozitiv: "+r.diff.join(", ")+".":"Sincronizat.";
async function syAuto(apply){if(!dbOn()||LS("rdba")==="0"||!hasData()&&!apply)return null;
 const r=await syncRun({apply});
 if(r.busy)return r;
 if(r.err){LS("rdbe",r.err.slice(0,120))}
 if(r.applied){try{sessionStorage.setItem("rsyt","Preluat de pe alt dispozitiv: "+r.diff.join(", ")+".")}catch(e){dbg(e)}location.reload();return r}
 if(r.pending)syBar("Sunt modificari noi de pe alt dispozitiv ("+r.diff.join(", ")+").","Aplica acum");
 else if(r.blocked)syBar(syMsg(r),"");
 else syBar("");
 if(syConfGet().length&&!r.pending&&!r.blocked)syBar((n=>n===1?"O modificare facuta pe ambele dispozitive. Am pastrat o singura varianta.":n+" modificari facute pe ambele dispozitive. Am pastrat cate o singura varianta.")(syConfGet().length),"Vezi");
 dbDraw();return r}
/* marcheaza ca s-a schimbat ceva aici; trimite dupa 15 secunde de liniste */
function syMark(k){if(!SYREADY||SYAPPLY||!dbOn())return;clearTimeout(SYT);SYT=setTimeout(()=>{if(Date.now()-SYLAST>5000)syAuto(false)},15000)}
document.addEventListener("visibilitychange",()=>{if(!SYREADY||!dbOn())return;
 if(document.visibilityState==="hidden"){if(SYT){clearTimeout(SYT);SYT=0;syAuto(false)}}
 else if(Date.now()-SYLAST>SY_MIN)syAuto(false)});
$("#syGo").onclick=async()=>{if($("#syGo").textContent==="Vezi"){show("setari");setSub("backup");dbDraw();
  /* 4.3.1: detaliile sunt in caseta Sincronizare Dropbox, mai jos pe pagina; inainte butonul deschidea pagina si parea ca nu face nimic */
  setTimeout(()=>{const el=document.querySelector("#dbcard .warn")||$("#dbcard");if(el&&el.scrollIntoView)el.scrollIntoView({behavior:"smooth",block:"center"})},60);return}
 $("#syGo").disabled=true;const r=await syncRun({apply:true});$("#syGo").disabled=false;
 if(r.applied){try{sessionStorage.setItem("rsyt","Preluat de pe alt dispozitiv: "+r.diff.join(", ")+".")}catch(e){dbg(e)}location.reload();return}
 syBar(r.err||"");if(!r.err)toast(syMsg(r),!!(r.err||r.blocked));dbDraw()};
const DEFK="7hvolba2cog2zy8";
async function dbDraw(msg){const el=$("#dbbox");if(!el)return;let h="";
 if(!dbOn()){h+=`<p class="muted mt0 mb8" >Sincronizeaza retetele, meniul, lista si celelalte date intre telefon si laptop, prin Dropbox-ul tau. Datele ajung doar in folderul aplicatiei din contul tau. Te conectezi o data pe fiecare dispozitiv.</p><button class="go m0" type="button" data-dbc="1" >Conecteaza Dropbox</button>`}
 else{h+=`<p class="muted mt0 mb8" >Conectat. ${LS("rdbl")?"Ultima sincronizare: "+esc(fmtDT(+LS("rdbl")))+".":"Inca nu s-a sincronizat."}${LS("rdbe")?" Ultima incercare a esuat: "+esc(LS("rdbe"))+".":""}</p><button class="go m0" type="button" data-dbs="1" >Sincronizeaza acum</button> <button class="alt" type="button" data-dbx="1">Deconecteaza</button>
  <label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="dba"${LS("rdba")==="0"?"":" checked"} class="wauto"> Sincronizare automata (la deschidere, dupa modificari si cand revii in aplicatie)</label>`}
 const cf=syConfGet();if(cf.length)h+=`<div class="warn mt12" ><b>Modificate pe ambele dispozitive (${cf.length}).</b> Am pastrat o singura varianta (cealalta e aratata mai jos).${cf.slice(-8).map(x=>`<div>${esc(SY_LAB[x.nm]||x.nm)}${x.f?" - "+esc(x.f):""}: pastrat "${esc(x.l)}", cealalta era "${esc(x.r)}"</div>`).join("")}<button class="alt mt8" type="button" data-syc="1" >Am inteles</button></div>`;
 h+=`<details class="mt12"><summary class="muted">Avansat: aplicatie Dropbox proprie</summary><p class="muted mt8 mb8" >Implicit se foloseste aplicatia Dropbox a acestei aplicatii. Daca ai creat una proprie, scrie aici App key. Adresa de redirectionare: <b>${esc(dbRedirect())}</b></p><input id="dbk" autocomplete="off" placeholder="App key" value="${esc(LS("rdbk")||"")}" aria-label="App key Dropbox"><button class="alt mt8" type="button" data-dbks="1" >${LS("rdbk")?"Salveaza cheia":"Foloseste cheia"}</button>${LS("rdbk")?' <button class="alt mt8" type="button" data-dbkx="1" >Revino la cea implicita</button>':""}</details>`;
 el.innerHTML=h+(msg?`<div class="muted mt8"  role="status">${esc(msg)}</div>`:"")}
function bkPreview(txt,name){try{IMP=bkParse(txt,name);impDraw();$("#bkm").textContent="Verifica previzualizarea de mai jos si confirma restaurarea.";const p=$("#bipv");if(p&&p.scrollIntoView)p.scrollIntoView({block:"center"})}
 catch(x){IMP=null;impDraw();$("#bkm").textContent="Copia nu e un backup valid al acestei aplicatii."}}
$("#snbox").onclick=async e=>{const d=e.target.dataset;
 if(d.snmk!==undefined){await snapMake(true);snDraw();toast("Copie facuta.");return}
 if(d.snr){try{bkPreview(await idbGet(d.snr),"copie "+fmtDT(d.snr.slice(5)))}catch(x){toast("Nu am putut citi copia.")}}};
$("#dbbox").onclick=async e=>{const b=e.target,d=b.dataset;
 if(d.dbks!==undefined){const v=($("#dbk").value||"").trim();if(!/^[a-z0-9]{8,40}$/i.test(v)){toast("App key nu pare valid (litere si cifre).");return}
  if(v!==DBK()||LS("rdbt")){["rdbt","rdbl","rdbe","rdbr"].forEach(k=>{try{localStorage.removeItem(k)}catch(x){dbg(x)}});DBAT=null;try{await idbDel("syncbase")}catch(x){dbg(x)}}
  LS("rdbk",v);dbDraw("Cheia a fost schimbata. Conecteaza din nou.");return}
 if(d.dbkx!==undefined){try{localStorage.removeItem("rdbk")}catch(x){dbg(x)}["rdbt","rdbl","rdbe","rdbr"].forEach(k=>{try{localStorage.removeItem(k)}catch(x){dbg(x)}});DBAT=null;try{await idbDel("syncbase")}catch(x){dbg(x)}dbDraw("Se foloseste din nou aplicatia implicita. Conecteaza din nou.");return}
 if(d.syc!==undefined){try{localStorage.removeItem("rsyc")}catch(x){dbg(x)}syBar("");dbDraw();return}
 if(d.dbc!==undefined){try{await dbConnect()}catch(x){dbDraw("Nu am putut porni conectarea: "+(x.message||x))}return}
 if(d.dbx!==undefined){["rdbt","rdbl","rdbe","rdbr"].forEach(k=>{try{localStorage.removeItem(k)}catch(x){dbg(x)}});DBAT=null;try{await idbDel("syncbase")}catch(x){dbg(x)}syBar("");bkBadge();dbDraw("Deconectat. Fisierul sync.json a ramas in Dropbox; datele de aici nu s-au schimbat.");return}
 if(d.dbs!==undefined){b.disabled=true;dbDraw("Se sincronizeaza...");const r=await syncRun({apply:true});
  if(r.applied){try{sessionStorage.setItem("rsyt",syMsg(r))}catch(x){dbg(x)}location.reload();return}
  if(r.blocked){dbDraw(syMsg(r));$("#dbbox").insertAdjacentHTML("beforeend",'<button class="alt mt8" type="button" data-syf="1" >Sincronizeaza oricum</button>');return}
  if(r.err)LS("rdbe",r.err.slice(0,120));syBar("");dbDraw(syMsg(r));return}
 if(d.syf!==undefined){b.disabled=true;const r=await syncRun({apply:true,force:true});if(r.applied){try{sessionStorage.setItem("rsyt",syMsg(r))}catch(x){dbg(x)}location.reload();return}dbDraw(syMsg(r))}};
$("#dbbox").onchange=e=>{if(e.target.id==="dba")LS("rdba",e.target.checked?"1":"0")};
/* intoarcere din Dropbox dupa autorizare: ?code=... */
(async()=>{const q=new URLSearchParams(location.search),c=q.get("code"),v=sessionStorage.getItem("rdbv");if(!(c&&v)&&!q.get("error"))return;
 try{history.replaceState(null,"",location.pathname)}catch(e){dbg(e)}try{sessionStorage.removeItem("rdbv")}catch(e){dbg(e)}if(!c||!v){show("setari");setSub("backup");toast("Conectarea Dropbox a fost anulata.");return}
 try{const j=await dbToken({grant_type:"authorization_code",code:c,code_verifier:v,client_id:DBK(),redirect_uri:dbRedirect()});LS("rdbt",j.refresh_token);DBAT=j.access_token;DBAX=Date.now()+(j.expires_in||14400)*1000;show("setari");setSub("backup");toast("Dropbox conectat. Sincronizez...");dbDraw();const r=await syncRun({apply:true});if(r.applied){try{sessionStorage.setItem("rsyt",syMsg(r))}catch(x){dbg(x)}location.reload();return}if(r.blocked)dbDraw(syMsg(r));else if(r.err)dbDraw(r.err);else{toast(syMsg(r),!!(r.err||r.blocked));dbDraw()}}
 catch(x){show("setari");setSub("backup");dbDraw("Nu am putut conecta Dropbox: "+(x.message||x))}})();
snDraw();dbDraw();
/* copii automate la pornire (dupa ce biblioteca e incarcata) */
setTimeout(async()=>{await snapMake(false);snDraw();if(LS("rsyv")!=="2"){try{if(IDBOK&&DB)await idbDel("syncbase")}catch(e){dbg(e)}["rdbr","rsyc"].forEach(k=>{try{localStorage.removeItem(k)}catch(e){dbg(e)}});LS("rsyv","2")}
 SYREADY=true;await syAuto(true)},3000);
try{const t=sessionStorage.getItem("rsyt");if(t){sessionStorage.removeItem("rsyt");setTimeout(()=>toast(t),600)}}catch(e){dbg(e)}
$("#profbox").onchange=e=>{const k=e.target.dataset.pr;if(!k)return;const p=getPr(),v=e.target.value.trim();
 if(v==="")delete p[k];else if(k==="s"||k==="g")p[k]=v;else{const n=+v.replace(",",".");if(Number.isFinite(n))p[k]=n}
 putPr(p);profDraw();if(typeof drawMenu==="function"&&LIBREADY)try{drawMenu()}catch(x){dbg(x)}};
profDraw();
$("#bflt").open=innerWidth>700;
/* ===== 4.12.0: titluri de sectiune, gestionate din Setari ===== */
function renderSec(){const l=getSec();$("#scl").innerHTML=(l.length?l.map((w,i)=>`<div class="apr"><b>${esc(w)}</b><button class="alt ico" data-sx="${i}" aria-label="Sterge ${esc(w)}" title="Sterge">${IC_DEL}</button></div>`).join(""):'<p class="muted">Lista e goala: nicio linie nu e tratata ca titlu.</p>')}
const smsg=t=>{const el=$("#smsg");if(el)el.textContent=t};
function secAdd(){const el=$("#snn"),w=[...new Set(el.value.split(/[,;\n]/).map(x=>norm(x).replace(/[:.\s]+$/,"").trim().slice(0,40)).filter(Boolean))],l=getSec(),nou=w.filter(x=>!l.includes(x));
 if(!w.length)return;if(!nou.length){smsg("Exista deja in lista.");el.value="";return}
 putSec([...l,...nou]);el.value="";renderSec();smsg("Adaugat: "+nou.join(", ")+".");secRedraw()}
function secRedraw(){try{redrawAll();renderSnav(sEff())}catch(e){dbg(e)}}
$("#sAdd").onclick=secAdd;$("#snn").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();secAdd()}};
$("#scl").onclick=e=>{const b=e.target.closest("button[data-sx]");if(!b)return;if(armDel(b))return;const l=getSec(),w=l[+b.dataset.sx];putSec(l.filter((x,i)=>i!==+b.dataset.sx));renderSec();smsg("Scos: "+w+".");secRedraw()};
$("#sReset").onclick=e=>{const b=e.currentTarget;if(armDel(b))return;try{localStorage.removeItem("rsec")}catch(x){dbg(x)}renderSec();smsg("Lista initiala restabilita.");secRedraw()};
renderSec();
renderTagUI();
renderBox();
drawOnb();

/* 2.24.1: Info > Ingrediente si Masuri (datele sunt in nutri.js) */
const IGR=["Legume","Fructe","Carne","Peste","Oua si lactate","Cereale si paste","Leguminoase","Nuci si seminte","Grasimi","Condimente","Bauturi","Dulciuri si altele"];
const ICOL=NUTRI.C,iv=(r,k)=>r[3+ICOL.indexOf(k)];
const IMIC=[["Alte valori",[["fib","Fibre","g"],["zah","Zaharuri","g"],["sat","Grasimi saturate","g"],["col","Colesterol","mg"]]],["Minerale",[["na","Sodiu","mg"],["ca","Calciu","mg"],["fe","Fier","mg"],["mg","Magneziu","mg"],["fo","Fosfor","mg"],["k","Potasiu","mg"],["zn","Zinc","mg"],["se","Seleniu","mcg"]]],["Vitamine",[["va","Vitamina A","mcg"],["vc","Vitamina C","mg"],["vd","Vitamina D","mcg"],["ve","Vitamina E","mg"],["vk","Vitamina K","mcg"],["b1","B1 (tiamina)","mg"],["b2","B2 (riboflavina)","mg"],["b3","B3 (niacina)","mg"],["b6","B6","mg"],["b9","B9 (folat)","mcg"],["b12","B12","mcg"]]]];
let IGS="",IGP="",ISORT="nume",IAMT=100,IOPEN=new Set();
const iN=(x,f)=>x==null?"-":(x=x*f,x>=100?String(Math.round(x)):x>=10?String(+x.toFixed(1)):String(+x.toFixed(2)));
function drawIngr(){
 const fa=(+IAMT>0?+IAMT:100)/100,q=norm(IGS).trim().split(/\s+/).filter(Boolean);
 if($("#ngc").dataset.k!=="1"){$("#ngc").dataset.k="1";$("#ngc").innerHTML=["",...IGR].map(g=>`<option value="${esc(g)}">${esc(g||"Toate grupele")}</option>`).join("");$("#mgc").innerHTML=$("#ngc").innerHTML}$("#ngc").value=IGP;
 let L=NUTRI.R.map((r,i)=>[r,i]).concat(Object.entries(FD).filter(([k])=>!fdBase().R.some(b=>b.t.join(" ")===k)).map(([k,x])=>[[cap(dn(x.n)),x.gr||"","",...x.k,...(x.x||Array(23).fill(null))],"u"+k])).filter(([r,i])=>(!IGP||r[1]===IGP)&&q.every(w=>norm(r[0]).includes(w)||(typeof i==="number"&&norm(NUTRI.E[i]||"").includes(w))));
 const key={kcal:r=>iv(r,"kcal"),p:r=>iv(r,"p"),c:r=>iv(r,"c"),g:r=>iv(r,"g"),fib:r=>iv(r,"fib"),pk:r=>iv(r,"kcal")>=20?iv(r,"p")/iv(r,"kcal"):-1}[ISORT];
 if(key)L.sort((a,b)=>(key(b[0])||0)-(key(a[0])||0)||a[0][0].localeCompare(b[0][0],"ro"));else L.sort((a,b)=>a[0][0].localeCompare(b[0][0],"ro"));
 const nd=(r,f)=>IMIC.map(([t,a])=>`<div class="ng"><h4>${t}</h4>${a.map(([k,n,u])=>`<div class="nv"><span>${n}</span><b>${iN(iv(r,k),f)}${iv(r,k)==null?"":" "+u}</b></div>`).join("")}</div>`).join("");
 const row=([r,i])=>{if(typeof i==="string"){const key=i.slice(1),uf=FD[key]||{},op=IOPEN.has(i),hk=!!LS("rk"),pu=uf.ug&&+IAMT===100,f=pu?uf.ug/100:fa;return`<div class="nr"><button type="button" class="nrb" data-ni="${esc(i)}" aria-expanded="${op}"><span class="nn"><b>${esc(r[0])}</b> <span class="muted">${uf.src==="ai"?"AI":"manual"}</span>${pu?`<br><span class="muted">pentru 1 ${esc(uf.up||"bucata")} (${uf.ug} g)</span>`:""}</span><span class="nk">${iN(iv(r,"kcal"),f)}</span><span>${iN(iv(r,"p"),f)}</span><span>${iN(iv(r,"c"),f)}</span><span>${iN(iv(r,"g"),f)}</span></button>`+(op?`<div class="nd">${nd(r,f)}</div><div style="padding:0 8px 10px"><p class="muted mt0 mb8" >${uf.src==="ai"?"Valori estimate de AI; verifica-le la nevoie.":"Valori introduse de tine."}${uf.x?"":" Fara fibre, minerale si vitamine inca."}</p><div class="row" style="gap:6px"><button class="fdx alt" type="button" data-fdai="${esc(key)}" data-ai="1"${hk?"":" disabled"}>Completeaza</button><button class="fdx alt" type="button" data-fded="${esc(key)}">Editeaza</button><button class="fdx alt ico" type="button" data-fdd="${esc(key)}" aria-label="Sterge ${esc(r[0])}" title="Sterge">${IC_DEL}</button></div><div data-fdbox></div></div>`:"")+`</div>`}const op=IOPEN.has(i);
  return`<div class="nr"><button type="button" class="nrb" data-ni="${i}" aria-expanded="${op}"><span class="nn"><b>${esc(r[0])}</b></span><span class="nk">${iN(iv(r,"kcal"),fa)}</span><span>${iN(iv(r,"p"),fa)}</span><span>${iN(iv(r,"c"),fa)}</span><span>${iN(iv(r,"g"),fa)}</span></button>`+
  (op?`<p class="muted mt0 mb8" >${esc(NUTRI.E[i]||"")}</p><div class="nd">${nd(r,fa)}</div>`:"")+`</div>`};
 drawNu();
 $("#nl").innerHTML=L.length?`<div class="nh"><span>Aliment</span><span>kcal</span><span>Prot.</span><span>Carb.</span><span>Gras.</span></div>`+L.map(row).join(""):`<p class="muted">Nu am gasit niciun aliment${IGS?" pentru \""+esc(IGS)+"\"":""}.</p>`+(IGS.trim()&&!IGP?`<div data-irow><p class="muted mt0 mb8" >Il poti cauta cu AI sau completa tu; ramane salvat in lista ta, marcat AI sau manual.</p><div class="row g8" ><button class="alt m0" type="button" data-iai="1" ${LS("rk")?"":" disabled"}>Cauta</button><button class="alt m0" type="button" data-iman="1" >Completeaza manual</button></div>${LS("rk")?"":'<p class="muted mt8 mb0" >Pentru AI adauga cheia API in Setari.</p>'}<div data-mform></div></div>`:"")}
$("#nq").oninput=e=>{IGS=e.target.value;drawIngr()};
$("#nam").oninput=e=>{IAMT=e.target.value;drawIngr()};
$("#ns").onchange=e=>{ISORT=e.target.value;drawIngr()};
$("#ngc").onchange=e=>{IGP=e.target.value;drawIngr()};$("#mgc").onchange=drawMas;
$("#nl").onclick=e=>{const b=e.target.closest("button");if(b&&b.dataset.fdd!==undefined){const n=(FD[b.dataset.fdd]||{}).n,sn=undoMark([FDK]);delete FD[b.dataset.fdd];fdSave();drawIngr();undoShow("Sters din lista ta: "+dn(n||"")+".",sn,()=>{try{const j=JSON.parse(LS(FDK)||"{}");FD=j&&typeof j==="object"&&!Array.isArray(j)?j:{}}catch(x){FD={}}drawIngr()});return}const INZ=()=>({x:{n:IGS.trim(),c:100,u:"g",nr:1}});if(b&&b.dataset.iai!==undefined){fdAIZ(INZ(),b,$("#nl [data-mform]"),drawIngr);return}if(b&&b.dataset.iman!==undefined){$("#nl [data-mform]").innerHTML=fdFormHtml(INZ(),"i");return}if(b&&b.dataset.mms==="i"){fdManZ(INZ(),$("#nl [data-irow]"),drawIngr);return}const FZ=k=>({x:{n:FD[k].n,c:100,u:"g",nr:1},f:{k:FD[k].k},fd:FD[k]});if(b&&b.dataset.fdai!==undefined){fdAIZ(FZ(b.dataset.fdai),b,b.closest(".nr").querySelector("[data-fdbox]"),drawIngr);return}if(b&&b.dataset.fded!==undefined){b.closest(".nr").querySelector("[data-fdbox]").innerHTML=fdFormHtml(FZ(b.dataset.fded),"e:"+b.dataset.fded);return}if(b&&String(b.dataset.mms).startsWith("e:")){fdManZ(FZ(b.dataset.mms.slice(2)),b.closest("[data-fdbox]"),drawIngr);return}if(!b||b.dataset.ni===undefined)return;const i=isNaN(+b.dataset.ni)?b.dataset.ni:+b.dataset.ni;IOPEN.has(i)?IOPEN.delete(i):IOPEN.add(i);drawIngr()};
function drawMas(){const q=norm($("#mq").value||"").trim().split(/\s+/).filter(Boolean);
 const mg=$("#mgc").value,L=NUTRI.M.filter(m=>m[2].some(x=>x!=null)&&(!mg||m[1]===mg)&&q.every(w=>norm(m[0]).includes(w))).sort((a,b)=>a[0].localeCompare(b[0],"ro"));
 const v=x=>x==null?"-":x;
 $("#ml").innerHTML=L.length?`<div class="mh2"><span>Aliment</span><span>Lingura</span><span>Lingurita</span><span>Cana</span></div>`+L.map(m=>`<div class="mt2"><span><b>${esc(m[0])}</b></span><span>${v(m[2][0])}</span><span>${v(m[2][1])}</span><span>${v(m[2][2])}</span></div>`).join(""):`<p class="muted">Nu am gasit niciun aliment.</p>`}
$("#mq").oninput=drawMas;
function drawGat(){const el=$("#gl");if(el.dataset.k==="1")return;el.dataset.k="1";
 el.innerHTML=NUTRI.G.map(([g,t])=>`<h3 class="gg">${esc(g)}</h3>`+t.map(([n,r])=>`<details class="gd"><summary>${esc(n)}</summary><ul>${r.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></details>`).join("")).join("")}

/* ===== 2.32.0: numar de portii confirmat separat, "-" = nu se aplica, fisier de corectii ===== */
function pParse(v){v=String(v==null?"":v).trim();if(v==="-"||v==="\u2013")return{na:true};if(v==="")return{n:null};if(!/^\d{1,3}$/.test(v)||+v<1||+v>200)return{bad:true};return{n:+v}}
function pConfirm(bv,i){const r=BOOK[i],pp=pParse(bv.querySelector("[data-ef=portii]").value);
 if(pp.bad||(!pp.na&&pp.n==null)){toast("Scrie numarul de portii (1-200) sau - daca nu se aplica.");return}
 r.portii=pp.na?null:pp.n;if(pp.na)r.pna=true;else delete r.pna;
 clrV(r,PRT);
 if(persistBook(r)){updVC();bv.querySelector("[data-pcbox]").innerHTML='<span class="muted">Portii confirmate'+(pp.na?" (nu se aplica).":": "+pp.n+".")+"</span>";toast("Portii confirmate.")}}
let PATCH=null;
const pcMatch=(c,st)=>st.findIndex(r=>String(r.nr)===String(c.n)&&dn(r.titlu).toLowerCase()===dn(c.t||"").toLowerCase());
function pcPlan(P,st){let skip=0,miss=0;const todo=[];P.forEach(c=>{const j=pcMatch(c,st);if(j<0){miss++;return}const r=st[j];
  if("era" in c){const cur=r.pna?"-":r.portii==null?null:r.portii;if(cur!==c.era){skip++;return}}todo.push([j,c])});return{ok:todo.length,skip,miss,todo,del:todo.filter(([j,c])=>c.sterge).length,ren:todo.filter(([j,c])=>c.titlu_nou&&!c.sterge).length}}
function pcDraw(){const el=$("#bpp");if(!PATCH){el.innerHTML="";return}const st=getStored(),p=pcPlan(PATCH.c,st);
 el.innerHTML=`<div class="card mt8 mb12" ><b>${esc(PATCH.f)}</b><p class="muted mt8 mb12" >${PATCH.c.length} corectii: ${p.ok} se aplica, ${p.skip} sarite (le-ai modificat tu intre timp), ${p.miss} retete negasite in biblioteca. ${p.del||p.ren?"":"Se schimba doar portiile si marcajele; restul retetei ramane neatins."}</p>${p.del?`<div class="warn mt0 mb12" ><b>${p.del} ${p.del===1?"reteta se sterge":"retete se sterg"} definitiv</b> (cu jurnalul, notitele si steaua lor). Inainte de aplicare se face o copie automata a bibliotecii, din care poti restaura din Setari > Backup.</div>`:""}${p.ren?`<p class="muted mt0 mb12" >${p.ren} ${p.ren===1?"reteta isi schimba":"retete isi schimba"} titlul.</p>`:""}${p.ok?'<button class="go m0" data-pcx="ok" >Aplica</button> ':""}<button class="alt" data-pcx="no">Anuleaza</button></div>`}
$("#bpatch").onchange=async e=>{const f=e.target.files[0];PATCH=null;$("#bpm").textContent="";if(!f){pcDraw();return}
 try{const j=JSON.parse(await f.text()),c=j&&j.corectii;if(!Array.isArray(c)||!c.length||!c.every(x=>x&&typeof x==="object"&&x.n!=null&&x.t))throw 0;PATCH={c,f:f.name};pcDraw()}
 catch(x){pcDraw();$("#bpm").textContent="Fisierul nu e un fisier de corectii valid."}};
$("#bpp").onclick=async e=>{const d=e.target.dataset.pcx;if(!d)return;
 if(d==="no"){PATCH=null;$("#bpatch").value="";pcDraw();return}
 let st=getStored();const p=pcPlan(PATCH.c,st);
 if(p.del)await snapMake(true);
 const dk=[];
 p.todo.forEach(([j,c])=>{const r=st[j];if(c.sterge){dk.push(bKey(r));return}if(c.titlu_nou)r.titlu=String(c.titlu_nou);if(c.portii!==undefined){if(c.portii==="-"){r.portii=null;r.pna=true}else{r.portii=+c.portii;delete r.pna}}
  if(Array.isArray(c.marcheaza))r.verifica=[...new Set([...(r.verifica||[]),...c.marcheaza.map(String)])]});
 if(dk.length){st=st.filter(x=>!dk.includes(bKey(x)));try{LS("rfav",JSON.stringify(getFav().filter(k=>!dk.includes(k))));const n=getNotes();dk.forEach(k=>delete n[k]);LS("rnote",JSON.stringify(n))}catch(e){dbg(e)}}
 putStored(st);PATCH=null;$("#bpatch").value="";pcDraw();updVC();toast("Corectii aplicate la "+p.ok+" retete"+(p.del?" ("+p.del+" sterse definitiv)":"")+".")};
/* ===== 2.28.0: macro local-first (din Info) + alimente adaugate de tine (rfd) ===== */
const FDK="rfd";
let FD={};try{const j=JSON.parse(LS(FDK)||"{}");if(j&&typeof j==="object"&&!Array.isArray(j))FD=j}catch(e){dbg(e)}
const fdSave=()=>LS(FDK,JSON.stringify(FD));
const MSYN={oua:"ou",cepe:"ceapa",catei:"catel",cateii:"catel",mere:"mar",rosii:"rosie",lamai:"lamaie",dovlecei:"dovlecel",felii:"felie",fiarta:"fiert",fierte:"fiert",fierti:"fiert",coapta:"copt",coapte:"copt",copta:"copt",copte:"copt",copti:"copt",rascopt:"fiert",rascoapte:"fiert",rascoapta:"fiert",fripta:"copt",fripte:"copt",fripti:"copt",fript:"copt",cuptor:"copt",gratar:"copt",prajita:"prajit",prajite:"prajit",prajiti:"prajit",gatita:"gatit",gatite:"gatit",gatiti:"gatit"};
/* 3.17.0: starea de gatit (fiert/copt/prajit/gatit) ramane in cuvinte: "naut fiert" nu mai nimereste naut uscat; alias "(aprox. X)" / "(sin. X)" din numele alimentului */
const COOKW=new Set(["fiert","copt","prajit","gatit"]);
const MSTOP=new Set("calda foaie de cu si din la pe fara sau un o mare mici mic mica mijlocii mijlocie proaspat proaspata proaspete intreg intregi intreaga crud cruda crude tocat tocata tocate ras rasa rase rece calduta caldute fierbinte taiat taiata taiate foi boabe".split(" "));
const mSt=w=>{w=MSYN[w]||w;const a=w.replace(/(ilor|elor|urile|uri|ele|ului|ul)$/,"");if(a!==w&&a.length>=3)return a;const b=w.replace(/[aeiu]+$/,"");return b.length>=3?b:w};
const mTok=s=>dn(String(s||"")).toLowerCase().replace(/\([^)]*\)/g," ").split(/[^a-z]+/).filter(w=>w.length>1&&!MSTOP.has(w)).map(mSt);
const mAl=n=>(String(n).match(/\((?:aprox|sin)\.?[^)]*\)/gi)||[]).map(x=>mTok(x.replace(/^\((?:aprox|sin)\.?\s*/i,"").replace(/\)$/,""))).filter(a=>a.length);
const r1=v=>Math.round(v*10)/10;
let FB=null;
/* 4.29.0: greutate medie pe bucata pentru produse intregi din retetele vechi (g, estimat) */
const PMX={pui:1200,rata:2000,iepure:1500,porumbei:300,varza:1500,conopida:800,praz:120,telina:300,gulii:250,gogosari:130,cotlete:150,rinichi:200,crap:1000,scrumbii:150,creier:250,hrean:100,chifle:60,vinete:250,dovlecei:250,dovlecel:250,vanata:250,gasca:3500};
const fdBase=()=>FB||(FB=(()=>{const MM={};NUTRI.M.forEach(m=>{MM[dn(m[0]).toLowerCase()]=m[2]});
 return{R:NUTRI.R.map(r=>{const nm=dn(r[0]).toLowerCase();return{n:r[0],nm,t:mTok(r[0]),al:mAl(r[0]),k:[r[3],r[4],r[5],r[6]].map(v=>v==null?0:+v),v:r.slice(3).map(v=>v==null?0:+v),mm:MM[nm]}}),
  PM:Object.fromEntries(Object.entries(Object.assign({},PMX,NUTRI.P)).map(([k,v])=>[mSt(k),v])),Z:new Set(NUTRI.Z.map(mSt))}})());
const FPREF=["ulei de floarea-soarelui","faina alba","orez alb","lapte 3,5%","smantana 20%","zahar","oua de gaina","unt","branza de vaci","pui intreg","porc carne tocata","vita carne tocata 90/10","miel","vitel","curcan piept","somon","ton in apa","ardei gras","ciuperci champignon","vin alb"];
function fdMatch(name){name=dn(name).split(/\s+sau\s+/)[0].replace(/\b(fara|f\u0103r\u0103)\s+\S+(\s+adaug\S*)?/gi," ");const it=mTok(name);if(!it.length)return null;const S=new Set(it),B=fdBase();
 const it0=it.filter(w=>!COOKW.has(w));if(!it0.length)return null;const ick=it0.length<it.length;
 const ck=f=>f.ck||(f.ck=(f.t||[]).filter(w=>COOKW.has(w))),tb=f=>f.tb||(f.tb=(f.t||[]).filter(w=>!COOKW.has(w)));
 const ok=f=>!ck(f).length||ck(f).some(w=>S.has(w)||S.has("gatit")),pr=f=>{const j=FPREF.indexOf(f.nm);return j<0?99:j},sc=f=>ick&&ck(f).length?0:1;
 const ml=f=>{let m=0;const t=tb(f);if(t.length&&t.every(w=>S.has(w)))m=t.length;(f.al||[]).forEach(a=>{const b=a.filter(w=>!COOKW.has(w));if(b.length>m&&b.every(w=>S.has(w)))m=b.length});return m};
 const sub=L=>{const c=L.map(f=>[f,ml(f)]).filter(([f,m])=>m&&ok(f));if(!c.length)return null;const m=Math.max(...c.map(x=>x[1]));return c.filter(x=>x[1]===m).map(x=>x[0]).sort((a,b)=>sc(a)-sc(b)||pr(a)-pr(b))[0]};
 const U=Object.values(FD).map(f=>({n:f.n,nm:dn(f.n).toLowerCase(),t:f.t||mTok(f.n),k:f.k,cv:f.cv,ug:f.ug,user:1,v:(f.x&&f.x.length===23&&f.k&&f.k.length===4)?f.k.map(v=>+v||0).concat(f.x.map(v=>v==null||v===""?0:+v)):null}));
 let f=sub(U)||sub(B.R);if(f)return f;
 if(it0.every(w=>B.Z.has(w)))return{zero:1,n:"fara aport caloric"};
 if(it0.length===1){const c=B.R.filter(f=>tb(f).includes(it0[0])&&ok(f));if(c.length){c.sort((a,b)=>sc(a)-sc(b)||(b.t[0]===it0[0])-(a.t[0]===it0[0])||pr(a)-pr(b)||a.t.length-b.t.length);return Object.assign({loose:1},c[0])}}
 return null}
const FDW={g:1,gr:1,gram:1,grame:1,kg:1000,ml:1,l:1000,dl:100,cl:10};
function fdGrams(x,f){const B=fdBase();if(f.zero)return{g:0};const u=dn(x.u||"").toLowerCase().trim();
 if(FDW[u]!=null)return{g:x.c*FDW[u]};
 if(f.cv&&f.cv[u]!=null)return{g:x.c*f.cv[u]};
 if(f.ug&&(u===""||/^bucat/.test(u)))return{g:x.c*f.ug};
 const m=f.mm;
 if(/^lingurit/.test(u))return m&&m[1]!=null?{g:x.c*m[1]}:{g:x.c*5,ap:1};
 if(/^lingur/.test(u))return m&&m[0]!=null?{g:x.c*m[0]}:{g:x.c*15,ap:1};
 if(/^(ceas|cest|pahar)/.test(u))return m&&m[2]!=null?{g:x.c*m[2]}:{g:x.c*240,ap:1};
 if(/^(varf|strop|praf)/.test(u))return{g:x.c,ap:1};
 if(/^paharel/.test(u))return{g:x.c*50,ap:1};
 if(/^plic/.test(u))return{g:x.c*10,ap:1};
 if((u===""||/^bucat/.test(u))&&/\b(praf|varf|strop|picatura)\b/.test(dn(x.n).toLowerCase()))return{g:x.c,ap:1};
 let k=null;
 if(u===""||/^bucat/.test(u))k=mTok(x.n).find(w=>B.PM[w])||null;else if(B.PM[mSt(u)])k=mSt(u);
 return k?{g:x.c*B.PM[k],ap:1}:null}
/* 4.29.0: "paharel de vin", "plic de praf de copt": cuvantul de masura din nume devine unitate */
function ingU(x){if(x.c==null||dn(x.u||"").trim()&&!/^bucat/.test(dn(x.u||"").trim()))return x;const m=dn(x.n||"").toLowerCase().match(/^(paharel|pahar|lingurita|lingura|plic|cana|ceasca)\s+(?:de\s+)?(.+)$/);return m?Object.assign({},x,{u:m[1],n:m[2]}):x}
function macLocal(r,por0,ings){const por=por0||r.portii||1,S=[0,0,0,0],det=[],miss=[],nq=[];let n=0,ap=0,tg=0;
 (ings||rawIngs("b",r)).forEach(x=>{x=ingU(x);if(x.c==null){nq.push(x);return}n++;const f=fdMatch(x.n);
  if(!f){miss.push({x,why:"date"});return}
  const q=fdGrams(x,f);if(!q){miss.push({x,why:"masura",f});return}
  if(q.ap)ap++;if(!f.zero){tg+=q.g;for(let j=0;j<4;j++)S[j]+=q.g*f.k[j]/100}
  det.push({x,f,g:q.g,ap:q.ap})});
 return{o:{kcal:Math.round(S[0]/por),proteine:r1(S[1]/por),grasimi:r1(S[2]/por),carbo:r1(S[3]/por)},n,ok:det.length,miss,det,ap,nq,tg,p100:tg>0?{kcal:Math.round(S[0]/tg*100),proteine:r1(S[1]/tg*100),grasimi:r1(S[2]/tg*100),carbo:r1(S[3]/tg*100)}:null}}
/* 3.2.0: numarul de portii se poate schimba direct in reteta deschisa: arata macro la N portii (fara sa scaleze cantitatile) si se salveaza dintr-un buton */
function pWhat(r,p){if(!(r.ingrediente||[]).length||p==null)return"";const sv0=r.pna||r.portii==null,same=!sv0&&p===r.portii,unc=vpf(r);if(same&&!unc)return"";
 const L=same?null:macLocal(r,p),sv=r.macro&&r.macro.kcal!=null?r.macro.kcal:macLocal(r).o.kcal,was=sv0?"acum, fara numar de portii, pentru toata reteta":"salvat, la "+esc(r.portii)+" portii";
 const line=same?`<p class="muted">Numarul de portii (${esc(p)}) nu e confirmat.</p>`:L.ok?`<p><b>La ${esc(p)} portii:</b> ${esc(L.o.kcal)} kcal, proteine ${esc(L.o.proteine)} g, carbohidrati ${esc(L.o.carbo)} g, grasimi ${esc(L.o.grasimi)} g per portie <span class="muted">(${was}: ${esc(sv)} kcal)</span></p>`:`<p class="muted">La ${esc(p)} portii: nu pot calcula (ingredientele nu au date in Info).</p>`;
 return line+`<button class="go" type="button" data-psv="1">${same?"Confirma":"Salveaza"} ${esc(p)} portii</button>`}
function macHead(r,p){const m=r.macro,had=m&&m.kcal!=null,has=(r.ingrediente||[]).length&&!r.pna;
 const t=had?`<p class="muted">${m.sursa==="local"?"Calculat din baza Info"+(m.acoperire?" ("+esc(m.acoperire)+" ingrediente)":"")+", aproximativ":m.sursa==="ai"?"Estimat de AI, aproximativ":m.sursa==="manual"?"Scrise de tine":r.manual?"Sursa necunoscuta (apasa Recalculeaza din Info)":"Valori din carte, aproximative"}: ${esc(m.kcal)} kcal, proteine ${esc(m.proteine??"?")} g, carbohidrati ${esc(m.carbo??"?")} g${m.fibre!=null?" (fibre "+esc(m.fibre)+" g)":""}, grasimi ${esc(m.grasimi??"?")} g${m.saturate!=null?" (saturate "+esc(m.saturate)+" g)":""}</p>`:'<p class="muted">Reteta nu are valori de macro.</p>';
 let h100="";if((r.ingrediente||[]).length){const L=macLocal(r);if(L.p100&&L.ok&&L.ok/L.n>=.5)h100=`<p class="muted" >La 100 g de ingrediente (crude, fara apa): ${esc(L.p100.kcal)} kcal, proteine ${esc(L.p100.proteine)} g, carbohidrati ${esc(L.p100.carbo)} g, grasimi ${esc(L.p100.grasimi)} g${r.pna||r.portii==null?"; reteta nu are numar de portii":""}.</p>`}
 const dd=macDiff(r),dw=dd?`<div class="warn">Valorile din carte (${dd.carte} kcal) difera mult de calculul din Info (${dd.calc} kcal per portie). Meniul si jurnalul folosesc calculul din Info. Verifica numarul de portii.</div>`:"";
 return pWhat(r,p)+t+dw+h100+(has?`<button class="alt" type="button" data-mcl="1">${had?"Recalculeaza din Info":"Calculeaza din Info"}</button>`:"")}
/* avertizare in meniu: macro din carte foarte diferit de calculul din Info (portii sau cifre nesigure); "E in regula" o ascunde pe reteta */
function macDiff(r){if(!r||r.mok||r.pna||!r.macro||r.macro.kcal==null||r.macro.sursa==="local"||!(+r.macro.kcal>0))return null;
 const L=macLocal(r);if(!L.n||L.ok/L.n<.8||!L.o.kcal)return null;const q=L.o.kcal/+r.macro.kcal;return q<.7||q>1.4?{carte:Math.round(+r.macro.kcal),calc:L.o.kcal}:null}
const fdNeedCv=x=>fdGrams(x,{k:[0,0,0,0]})==null;
function macPanel(bv,i){const r=BOOK[i],L=macLocal(r),box=bv.querySelector("[data-macp]"),m=r.macro,had=m&&m.kcal!=null,o=L.o;bv._ml=L;
 if(!L.n){box.innerHTML='<p class="muted">Nu sunt ingrediente cu cantitate de calculat.</p>';return}
 const hk=!!LS("rk");
 let h=`<div class="card" style="margin:8px 0;background:var(--soft)"><b>${L.ok?"Calculat din Info: "+esc(macTxt(o))+" per portie":"Nu am putut calcula nimic inca"}</b><p class="muted mt4 mb4" >Din ${L.ok} din ${L.n} ingrediente${L.ap?"; la "+L.ap+" greutatea e estimata (bucati, linguri, cesti)":""}.${r.portii==null?" Reteta nu are numar de portii: valorile sunt pentru toata reteta.":""}</p>`;
 if(L.miss.length){h+=`<div class="warn mt8 mb8" ><b>Fara date pentru ${L.miss.length} ${L.miss.length===1?"ingredient":"ingrediente"}: ${esc(L.miss.map(z=>dn(z.x.n)).join(", "))}.</b> Pentru fiecare alegi: cauti cu AI sau completezi tu; ramane salvat in aplicatie si le folosesc data viitoare.${hk?"":" Pentru AI adauga cheia API in Setari."}</div>`+
  L.miss.map((z,j)=>`<div class="card mt8 mb8" data-mrow="${j}" ><b>${esc(dn(z.x.n))}</b> <span class="muted">(${esc(dn(ingLine(z.x)))}) ${z.why==="date"?"nu e in Info":"nu pot converti \""+esc(z.x.u||"bucata")+"\" in grame"}</span><div class="row g8 mt8" ><button class="alt m0" type="button" data-mai="${j}" data-ai="1" ${hk?"":" disabled"}>Cauta</button><button class="alt m0" type="button" data-mman="${j}" >Completeaza manual</button><button class="alt m0" type="button" data-mal="${j}" >Este alt aliment</button></div><div data-mform></div></div>`).join("")}
 if(L.nq.length)h+=`<p class="muted mt8 mb4" >Fara cantitate, nu intra in calcul: ${esc(L.nq.map(x=>dn(x.n)).join(", "))}.</p>`;
 if(L.det.length){const por=r.portii||1,cn=d=>d.f.zero?{kcal:0,proteine:0,grasimi:0,carbo:0}:{kcal:Math.round(d.g*d.f.k[0]/100/por),proteine:r1(d.g*d.f.k[1]/100/por),grasimi:r1(d.g*d.f.k[2]/100/por),carbo:r1(d.g*d.f.k[3]/100/por)},
  W=d=>["g","gr","gram","grame"].includes(dn(d.x.u||"").toLowerCase().trim());
  h+=`<details><summary>Cum am calculat (aportul fiecarui ingredient, per portie)</summary><ul>${L.det.map(d=>({d,c:cn(d)})).sort((a,b)=>b.c.kcal-a.c.kcal).map(({d,c})=>`<li>${esc(ingLine(d.x))} &rarr; ${d.f.zero?"fara aport caloric":esc(d.f.n)+(d.f.loose?" (potrivire aproximativa, verifica)":"")+(d.f.user?" (adaugat de tine)":"")+(W(d)&&!d.ap?"":", "+Math.round(d.g)+" g"+(d.ap?" estimat":""))+": "+esc(macTxt(c))}</li>`).join("")}</ul></details>`}
 if(L.ok)h+=`<div class="acts"><button class="go" type="button" data-msv="1">${had?"Foloseste valorile calculate":"Salveaza pe reteta"}</button></div>${L.miss.length?`<p class="muted mt4 mb4" >Calculul e partial; poti salva acum si recalcula dupa ce completezi restul.</p>`:""}`;
 box.innerHTML=h+"</div>"}
const XK=ICOL.slice(4),XI={};IMIC.forEach(([,g])=>g.forEach(([k,n,u])=>{XI[k]=[n,u]}));
const XCAP={g:100,mg:20000,mcg:200000};
function fdFormShow(bv,j){const z=bv._ml.miss[j];bv.querySelector(`[data-mrow="${j}"] [data-mform]`).innerHTML=fdFormHtml(z,j)}
function fdFormHtml(z,j){const f=z.f?z.f.k:["","","",""],cv=fdNeedCv(z.x),xv=(z.fd&&z.fd.x)||[],gr=(z.fd&&z.fd.gr)||"";
 const inp=(k,l,v,at)=>`<div><label>${l}</label><input data-${at||"mf"}="${k}" type="number" min="0" step="any" value="${v==null?"":esc(v)}"></div>`;
 return`${String(j).startsWith("e:")?`<div class="mt8 mb8">${inp("nm","Nume",(z.fd&&z.fd.n)||z.x.n).replace('type="number" min="0" step="any"','type="text" maxlength="60"')}</div>`:""}<p class="muted mt8 mb4" >Valori la 100 g de ${esc(dn(z.x.n))}:</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${inp("kcal","kcal",f[0])}${inp("p","Proteine g",f[1])}${inp("c","Carbo g",f[3])}${inp("g","Grasimi g",f[2])}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">${inp("up","Unitate (ex: cub, felie)",(z.fd&&z.fd.up)||"","mf").replace('type="number" min="0" step="any"','type="text" maxlength="20"')}${inp("ug","Grame pe unitate (ex: 4)",(z.fd&&z.fd.ug)||"")}</div>${cv?`<div class="mt8">${inp("cv","Grame intr-o "+(z.x.u||"bucata"),"")}</div>`:""}<details class="mt8"><summary>Alte valori: fibre, minerale, vitamine (optional)</summary><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${XK.map((k,n)=>inp(k,XI[k][0]+" ("+XI[k][1]+")",xv[n],"mx")).join("")}</div></details><div class="mt8"><label>Grupa (optional)</label><select data-mf="gr"><option value="">-</option>${IGR.map(g=>`<option${g===gr?" selected":""}>${esc(g)}</option>`).join("")}</select></div><div data-merr class="warn" hidden></div><button class="go mt8" type="button" data-mms="${j}" >Salveaza local</button>`}
function fdPut(z,k,cv,src,gr,x,keep){const key=mTok(z.x.n).join(" ")||dn(z.x.n).toLowerCase(),old=FD[key]||{},u=dn(z.x.u||"").toLowerCase().trim(),c=Object.assign({},old.cv);if(cv)c[u]=cv;
 FD[key]={n:old.n||z.x.n,t:key.split(" "),k,src:keep?(old.src||src):src||old.src||"manual",cv:c,gr:gr||old.gr||"",x:x||old.x||null};fdSave()}
/* 4.29.0: "Este alt aliment": asociezi ingredientul fara date (ex: praf de sare) cu un aliment din Info (ex: Sare); se salveaza ca aliment al tau si se foloseste si data viitoare */
function fdAliasShow(bv,j){const z=bv._ml.miss[j],B=fdBase();
 bv.querySelector(`[data-mrow="${j}"] [data-mform]`).innerHTML=`<label>Alege alimentul din Info</label><input data-mal-in="1" list="mal-l${j}" maxlength="80" placeholder="ex: sare" autocomplete="off"><datalist id="mal-l${j}">${B.R.map(r=>`<option value="${esc(r.n)}">`).join("")}</datalist><div class="warn mt8" data-merr hidden></div><div class="row g8 mt8"><button class="go m0" type="button" data-malok="${j}">Asociaza</button></div>`}
function fdAliasSave(bv,i,j){const z=bv._ml.miss[j],row=bv.querySelector(`[data-mrow="${j}"]`),v=dn(row.querySelector("[data-mal-in]").value).toLowerCase().trim(),er=row.querySelector("[data-merr]"),B=fdBase();
 const f=B.R.find(r=>r.nm===v)||(v?B.R.find(r=>r.nm.startsWith(v)):null);
 if(!f){er.textContent="Nu gasesc alimentul in Info. Alege unul din lista.";er.hidden=false;return}
 fdPut(z,f.k,null,"alias",null,f.v&&f.v.length===27?f.v.slice(4):null);macPanel(bv,i)}
function fdManSave(bv,i,j,btn){fdManZ(bv._ml.miss[j],btn.closest("[data-mrow]"),()=>macPanel(bv,i))}
function fdManZ(z,row,after){const g=k=>{const e=row.querySelector(`[data-mf=${k}]`);return e&&e.value!==""?+e.value:NaN},er=row.querySelector("[data-merr]");
 const k=[g("kcal"),g("p"),g("g"),g("c")],cv=g("cv"),need=fdNeedCv(z.x);
 const x=XK.map(q=>{const e=row.querySelector(`[data-mx=${q}]`),v=e&&e.value!==""?+e.value:NaN;return Number.isFinite(v)&&v>=0&&v<=XCAP[XI[q][1]]?Math.round(v*100)/100:null});
 const bad=k.some(v=>!Number.isFinite(v)||v<0)||k[0]>950||k[1]+k[2]+k[3]>105?"Completeaza cele patru valori (la 100 g); proteine+grasimi+carbo nu pot depasi 100 g.":need&&!(cv>0)?"Spune cate grame are o unitate.":"";
 if(bad){er.textContent=bad;er.hidden=false;return}
 const ugv=g("ug"),upe=row.querySelector("[data-mf=up]"),upv=upe?dn(upe.value).toLowerCase().trim().slice(0,20):"";
 if(Number.isFinite(ugv)&&!(ugv>0&&ugv<5000)){er.textContent="Grame pe unitate: un numar intre 0 si 5000.";er.hidden=false;return}
 const nme=row.querySelector("[data-mf=nm]"),ok0=mTok(z.x.n).join(" ")||dn(z.x.n).toLowerCase();let nn="",nk=ok0;
 if(nme){nn=nme.value.trim().slice(0,60);if(!nn){er.textContent="Numele nu poate fi gol.";er.hidden=false;return}nk=mTok(nn).join(" ")||dn(nn).toLowerCase();if(nk!==ok0&&FD[nk]){er.textContent="Exista deja un aliment cu acest nume.";er.hidden=false;return}}
 fdPut(z,k.map(r1),need?cv:null,"manual",(row.querySelector("[data-mf=gr]")||{}).value,x.some(v=>v!=null)?x:null,!!(z.fd&&z.fd.src==="ai"));
 if(nme&&FD[ok0]&&nn&&(nn!==FD[ok0].n||nk!==ok0)){const e=FD[ok0];e.n=nn;e.t=nk.split(" ");if(nk!==ok0){FD[nk]=e;delete FD[ok0];IOPEN.delete("u"+ok0);IOPEN.add("u"+nk)}fdSave()}
 {const key=nk,f=FD[key];if(f){if(Number.isFinite(ugv)){f.ug=r1(ugv);f.up=upv||"bucata";f.cv=Object.assign({},f.cv);f.cv[f.up]=f.ug}else if(upe&&upe.value===""&&row.querySelector("[data-mf=ug]")){delete f.ug;delete f.up}fdSave()}}
 toast("Salvat local: "+dn(z.x.n)+".");after()}
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
  if(!v){box.innerHTML='<div class="warn mt8" >Raspuns neutilizabil. Incearca din nou sau completeaza manual.</div>';return}
  fdPut(z,z.f&&!z.f.zero?z.f.k:v.k,v.cv,"ai",v.gr,v.x,!!z.fd);toast("Salvat local (AI): "+dn(z.x.n)+". Valorile sunt estimate, verifica-le.");after()}
 catch(e){box.innerHTML=`<div class="warn mt8" >${esc(e.message||"Eroare")}</div>`}
 finally{if(btn.isConnected){btn.disabled=false;btn.textContent=z.fd?"Completeaza":"Cauta"}}}
function macSaveRec(bv,i,sel,p){const r=BOOK[i],L=bv._ml;if(!L||!L.ok)return;
 r.macro={kcal:L.o.kcal,proteine:L.o.proteine,carbo:L.o.carbo,grasimi:L.o.grasimi,sursa:"local",acoperire:L.ok+" din "+L.n};clrV(r,MCT);
 if(persistBook(r)){openBook(i,p,sel);toast("Macro salvat pe reteta.")}}
function drawNu(){const n=Object.keys(FD).length;$("#nu").innerHTML=n?`<p class="muted mt8 mb8" >${n===1?"1 aliment adaugat de tine apare":n+" alimente adaugate de tine apar"} in lista, marcate AI sau manual (la 100 g; sunt in backup). <button class="alt mt0 mb8" type="button" data-fdcp="1" >Copiaza lista</button></p>`:""}
$("#nu").onclick=e=>{const b=e.target.closest("button");if(!b)return;

 if(b.dataset.fdcp!==undefined){const t=Object.values(FD).map(f=>`${f.n}: ${f.k[0]} kcal, proteine ${f.k[1]} g, grasimi ${f.k[2]} g, carbo ${f.k[3]} g la 100 g${f.x?"; "+XK.map((q,n)=>f.x[n]==null?"":q+" "+f.x[n]).filter(Boolean).join(", "):""}${f.cv&&Object.keys(f.cv).length?"; "+Object.entries(f.cv).map(([u,g])=>"1 "+(u||"bucata")+" = "+g+" g").join(", "):""}`).join("\n");
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>toast("Lista copiata."),()=>toast("Nu am putut copia."));else toast("Nu pot copia in acest browser.")}};
/* daca ai ceva planificat azi, aplicatia se deschide direct pe Meniu > Azi */
try{show("carti")}catch(e){dbg(e)}

/* 3.4.1: butonul Inapoi (Android / browser) merge pas cu pas: reteta deschisa -> lista, subpagina Setari -> Setari, pagina -> pagina anterioara */
(function(){let HS=[],SKIP=0;
 const vis=()=>{const x=[...document.querySelectorAll("main section, section")].find(e=>!e.classList.contains("hidden"));return x?x.id.replace("v-",""):""};
 const key=()=>{const v=vis();return v+"|"+(v==="setari"&&SUB?SUB:"")+"|"+(document.querySelector("section:not(.hidden) [data-bback],section:not(.hidden) [data-rback]")?"o":"")};
 const st=()=>{const k=key().split("|");return{v:k[0],s:k[1],o:!!k[2]}};
 let ON=false;window.hsync=function(){if(!ON||SKIP)return;const k=key();if(k===HS[HS.length-1])return;
  if(HS.length>1&&HS[HS.length-2]===k){HS.pop();SKIP++;history.back();return}
  HS.push(k);history.pushState(st(),"")};
 window.addEventListener("popstate",e=>{if(!ON)return;if(SKIP){SKIP--;setTimeout(window.hsync,0);return}HS.pop();const t=e.state||{v:window.hv0,s:null,o:false};
  if(t.v!==vis())show(t.v);
  if(t.v==="setari"){const n=t.s||null;if(n!==SUB){SUB=n;sRender()}}
  else if(!t.o){const b=document.querySelector("section:not(.hidden) [data-bback],section:not(.hidden) [data-rback]");if(b)b.click()}
  HS.push(key());if(HS.length>1&&HS[HS.length-2]===HS[HS.length-1])HS.pop()});
 const _s=show;show=function(v){_s(v);setTimeout(window.hsync,0)};
 document.addEventListener("click",()=>setTimeout(window.hsync,0));
 const V0=vis();setTimeout(()=>{HS=[key()];ON=true},700);window.hv0=V0})();
/* 4.2.0: fara cheie API, aplicatia porneste in Biblioteca, nu in Idei */
keyUpd();if(!LS("rk")){try{show("carti")}catch(e){dbg(e)}}

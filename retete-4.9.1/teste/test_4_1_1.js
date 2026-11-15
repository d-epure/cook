/* Teste pentru 4.1.1, cu date inventate (nu au nevoie de un backup real).
   Rulare, din folderul aplicatiei:  npm install jsdom  apoi  node teste/test_4_1_1.js
   Aplicatia e incarcata intr-un browser simulat (jsdom): fara IndexedDB, fara service worker, fara retea. */
const {JSDOM}=require("jsdom");const fs=require("fs"),path=require("path");const dir=path.join(__dirname,"..");
const html=fs.readFileSync(dir+"/index.html","utf8").replace(/<link rel="stylesheet" href="https[^>]*>/,"").replace(/<script src="[^"]*"><\/script>/g,"");
let fail=0;const eq=(a,b,m)=>{const ok=JSON.stringify(a)===JSON.stringify(b);if(!ok)fail++;console.log(ok?"ok  ":"FAIL",m,ok?"":JSON.stringify(a)+" != "+JSON.stringify(b))};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function boot(seed){const w=new JSDOM(html,{runScripts:"outside-only",url:"https://x.test/",pretendToBeVisual:true}).window;w.scrollTo=()=>{};
 w.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});w.fetch=()=>Promise.reject(new Error("fara retea"));
 for(const k of Object.keys(seed||{}))w.localStorage.setItem(k,seed[k]);
 w.eval(fs.readFileSync(dir+"/nutri.js","utf8"));
 w.eval(fs.readFileSync(dir+"/app.js","utf8")+`;window.__t={esc,clampP,getList,putList,drawList,lkey,getSaved,svTrim,sKey,bkParse,undoMark,undoShow,show,DKEYS,BK_KEYS,LSK,sclHtml,dayMac,renderSaved,APP_V};`);return w}
const item=(n,u,c)=>({k:"",n,u,c,src:["Test"],parts:[{s:"Test",c}],done:0});
(async()=>{
 const pan=JSON.stringify([{n:"sare",f:[]}]);
 let w=boot({rp:pan,rl:JSON.stringify([item("morcovi","g",200),item("lapte","ml",500),item("hrisca","g",300)])}),T=w.__t,L=w.localStorage,D=w.document;

 eq(T.esc(`<b a="1" b='2'>&`),"&lt;b a=&quot;1&quot; b=&#39;2&#39;&gt;&amp;","esc escapeaza si apostroful");
 eq([T.clampP("0"),T.clampP("-3"),T.clampP("0.5"),T.clampP("2.4"),T.clampP("100"),T.clampP("abc")],[1,1,1,2,99,1],"clampP: portii intregi intre 1 si 99");
 eq(T.BK_KEYS===T.DKEYS&&T.LSK.test("rl")&&!T.LSK.test("rbook")&&!T.LSK.test("rk"),true,"o singura lista de chei");
 // cumparaturi: lista se schimba in spate, click pe un buton desenat inainte
 T.show("lista");T.drawList();
 const xLapte=[...D.querySelectorAll("#ll [data-lx]")].find(b=>b.dataset.lk===T.lkey("lapte","ml"));
 L.setItem("rl",JSON.stringify([item("oua","",6),item("morcovi","g",200),item("lapte","ml",500),item("hrisca","g",300)])); // alt tab a adaugat un produs in fata
 xLapte.click();
 eq(T.getList().map(x=>x.n),["oua","morcovi","hrisca"],"stergere: dispare laptele, nu produsul de pe pozitia veche");
 T.drawList();const cbHrisca=[...D.querySelectorAll("#ll [data-ld]")].find(b=>b.dataset.lk===T.lkey("hrisca","g"));
 L.setItem("rl",JSON.stringify([item("hrisca","g",300),item("oua","",6)]));
 cbHrisca.checked=true;cbHrisca.dispatchEvent(new w.Event("change",{bubbles:true}));
 eq(T.getList().map(x=>x.n+":"+x.done),["hrisca:1","oua:0"],"bifare: se bifeaza hrisca, desi s-a mutat");
 T.drawList();const xOua=[...D.querySelectorAll("#ll [data-lx]")].find(b=>b.dataset.lk===T.lkey("oua",""));
 L.setItem("rl",JSON.stringify([item("hrisca","g",300)]));xOua.click();
 eq(T.getList().map(x=>x.n),["hrisca"],"produs disparut intre timp: nu se sterge altceva");
 eq(/Lista s-a schimbat/.test(D.querySelector("#toast").textContent),true,"mesaj cand produsul nu mai exista");
 // Anuleaza nu scrie peste date schimbate intre timp
 L.setItem("rl",JSON.stringify([item("a","",1),item("b","",1)]));T.drawList();
 D.querySelector("#ll [data-lx]").click();eq(T.getList().length,1,"stergere cu Anuleaza disponibil");
 D.querySelector("#undob").click();eq(T.getList().length,2,"Anuleaza readuce produsul");
 T.drawList();D.querySelector("#ll [data-lx]").click();L.setItem("rl",JSON.stringify([item("c","",1)]));
 D.querySelector("#undob").click();eq(T.getList().map(x=>x.n),["c"],"Anuleaza refuza cand datele s-au schimbat intre timp");
 // alt tab: evenimentul storage redeseneaza lista
 L.setItem("rl",JSON.stringify([item("din alt tab","",1)]));
 const ev=new w.StorageEvent("storage",{key:"rl",newValue:L.getItem("rl"),storageArea:L});w.dispatchEvent(ev);await sleep(400);
 eq(/Din alt tab/i.test(D.querySelector("#ll").textContent),true,"schimbarea din alt tab apare in lista");
 // limita de 200 de retete salvate
 const many=[...Array(203)].map((_,i)=>({id:"x"+i,titlu:"Reteta "+i,portii:2,ingrediente:[],pasi:[]}));
 L.setItem("rfav",JSON.stringify(["salvat|x202"]));
 const tr=T.svTrim(many);eq([tr.length,tr.some(r=>r.id==="x202"),tr.some(r=>r.id==="x201"),tr[0].id],[200,true,false,"x0"],"peste 200: favorita cea mai veche ramane, se sterg cele nefolosite");
 // colectia mea: stergere dupa cheie
 L.setItem("rs",JSON.stringify([{id:"a1",titlu:"Prima",portii:1,ingrediente:[],pasi:[]},{id:"b2",titlu:"A doua",portii:1,ingrediente:[],pasi:[]}]));
 T.show("salvate");T.renderSaved();const del=[...D.querySelectorAll("#salvate [data-d]")].find(b=>b.dataset.sk==="salvat|b2");
 L.setItem("rs",JSON.stringify([{id:"c3",titlu:"Noua",portii:1,ingrediente:[],pasi:[]},{id:"a1",titlu:"Prima",portii:1,ingrediente:[],pasi:[]},{id:"b2",titlu:"A doua",portii:1,ingrediente:[],pasi:[]}]));
 del.click();eq(T.getSaved().map(r=>r.id),["c3","a1"],"Colectia mea: se sterge reteta aleasa, nu cea de pe pozitia veche");
 // restaurare: structura verificata
 const bk=d=>JSON.stringify({app:"retete-dana",format:1,date:d});const bad=d=>{try{T.bkParse(bk(d),"x.json");return false}catch(e){return true}};
 eq([bad({rs:"{}"}),bad({rmen:"[]"}),bad({rl:"null"}),bad({altceva:"[]"}),bad({rs:"[]",rmen:"{}",rm1:"claude-haiku-4-5",rliv:"{}"})],[true,true,true,true,false],"backup cu structura gresita e respins, unul corect e acceptat");
 // avertisment la scalare mare in reteta
 eq([/Gatesti de 5 ori/.test(T.sclHtml(2,10)),/Gatesti de/.test(T.sclHtml(2,8))],[true,false],"avertisment peste 4 ori reteta");
 // fisiere
 const idx=fs.readFileSync(dir+"/index.html","utf8"),sw=fs.readFileSync(dir+"/sw.js","utf8");
 eq([/Content-Security-Policy/.test(idx),/script-src 'self'/.test(idx),/<script>/.test(idx),/ on(click|change|input)=/.test(idx)],[true,true,false,false],"CSP prezent, fara scripturi sau handler-e inline");
 eq([/const CACHE="cook-"\+V/.test(sw),/ks\.filter\(k=>k\.startsWith\("retete-"\)/.test(sw)],[true,false],"service worker cu cache propriu");
 console.log(fail?fail+" teste picate":"toate testele au trecut");process.exit(fail?1:0);
})();

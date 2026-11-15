/* Ajutor comun pentru teste: incarca aplicatia intr-un browser simulat (jsdom), cu date inventate.
   Fara IndexedDB si fara service worker; "reteaua" serveste doar fisierele din folderul aplicatiei (carti.json, carti/...). */
const {JSDOM}=require("jsdom");const fs=require("fs"),path=require("path");const dir=path.join(__dirname,"..");
const html=fs.readFileSync(dir+"/index.html","utf8").replace(/<link rel="stylesheet" href="https[^>]*>/,"").replace(/<script src="[^"]*"><\/script>/g,"");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let fail=0,n=0;
const eq=(a,b,m)=>{const ok=JSON.stringify(a)===JSON.stringify(b);n++;if(!ok)fail++;console.log(ok?"ok  ":"FAIL",m,ok?"":JSON.stringify(a)+" != "+JSON.stringify(b))};
async function boot(seed,opt){opt=opt||{};const w=new JSDOM(html,{runScripts:"outside-only",url:"https://x.test/",pretendToBeVisual:true}).window;w.scrollTo=()=>{};
 w.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});
 w.fetch=async u=>{u=String(u);if(opt.offline)throw new Error("fara retea");const p=path.join(dir,u);if(/^carti/.test(u)&&fs.existsSync(p))return{ok:true,json:async()=>JSON.parse(fs.readFileSync(p,"utf8"))};return{ok:false,json:async()=>null,text:async()=>""}};
 for(const k of Object.keys(seed||{}))w.localStorage.setItem(k,seed[k]);
 w.eval(fs.readFileSync(dir+"/nutri.js","utf8"));
 w.eval(fs.readFileSync(dir+"/app.js","utf8")+";window.__t={"+(opt.names||[]).map(x=>x==="BOOK"?"get BOOK(){return BOOK}":x).join(",")+"};");
 for(let i=0;i<100&&!w.__ready;i++)await sleep(50);await sleep(opt.wait||300);return w}
const done=()=>{console.log(fail?fail+" din "+n+" verificari picate":"toate cele "+n+" verificari au trecut");process.exit(fail?1:0)};
const item=(nm,u,c,src)=>({k:"",n:nm,u,c,src:[src||"Test"],parts:[{s:src||"Test",c}],done:0});
const supa={titlu:"Supa crema de rosii",portii:2,ingrediente:[{nume:"rosii",cantitate:500,unitate:"g"},{nume:"ceapa",cantitate:80,unitate:"g"},{nume:"usturoi",cantitate:3,unitate:"catei"},{nume:"unt",cantitate:30,unitate:"g"},{nume:"smantana grasa (32%)",cantitate:100,unitate:"ml"},{nume:"sare",cantitate:5,unitate:"g"}],pasi:[{id:"p1",text:"Caleste ceapa si usturoiul in unt.",aparat:"aragaz",durata_min:5,depinde_de:[]},{id:"p2",text:"Adauga rosiile si fierbe.",aparat:"aragaz",durata_min:15,depinde_de:["p1"]},{id:"p3",text:"Mixeaza si adauga smantana.",aparat:"manual",durata_min:2,depinde_de:["p2"]}],avertismente:[],etichete:["vegetarian"]};
const pan=JSON.stringify(["sare","piper","ulei","zahar","faina","cartofi","piept de pui","usturoi","ceapa","rosii"].map(x=>({n:x,f:[]})));
module.exports={boot,eq,done,sleep,item,supa,pan,dir,fs};

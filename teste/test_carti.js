/* Carti livrate cu aplicatia (4.1.0): instalare, backup, stergere, restaurare, versiune noua. Rulare: node teste/test_carti.js */
const {boot,eq,done,sleep,dir,fs}=require("./_boot.js");
(async()=>{
 const names=["getStored","shipRun","shUnmod","bkBuild","getBv","putBv","saveStored","bKey","isFav","BOOK","cosSet"];
 const man0=JSON.parse(fs.readFileSync(dir+"/carti.json","utf8")),tot=man0.carti.reduce((a,b)=>a+b.n,0);
 let w=await boot({},{names}),T=w.__t,st=T.getStored();
 eq([st.length,st.every(r=>T.shUnmod(r)),T.BOOK.length],[tot,true,tot],"utilizator nou: toate retetele livrate, neschimbate, afisate");
 let b=JSON.parse(T.bkBuild().json);eq(b.date.rbook===undefined,true,"backup fara cartile livrate");
 const r0=T.BOOK.find(r=>r.sursa==="Retete cu carne"&&r.nr===1);T.cosSet(r0,true);await sleep(50);
 b=JSON.parse(T.bkBuild().json);eq([JSON.parse(b.date.rbook).length,JSON.parse(b.date.rliv)["Retete cu carne"].length],[1,59],"reteta schimbata intra in backup, restul doar ca lista");
 const bv=T.getBv();bv["Deserturi rapide"]={del:1};T.putBv(bv);await T.saveStored(T.getStored().filter(r=>r.sursa!=="Deserturi rapide"));
 await T.shipRun();eq(T.getStored().filter(x=>x.sursa==="Deserturi rapide").length,0,"cartea stearsa nu revine singura");
 await T.shipRun(true);eq(T.getStored().filter(x=>x.sursa==="Deserturi rapide").length,30,"'Readu cartile aplicatiei' o aduce inapoi");
 const bk2=JSON.parse(T.bkBuild().json).date,seed={};Object.keys(bk2).forEach(k=>{if(k==="rliv")seed.rbneed=bk2[k];else seed[k]=bk2[k]});
 w=await boot(seed,{names});T=w.__t;st=T.getStored();
 eq([st.length,!!st.find(x=>x.sursa==="Retete cu carne"&&x.nr===1&&x.cos),w.localStorage.getItem("rbneed")],[tot,true,null],"restaurare pe dispozitiv gol: toate retetele, starea pastrata");
 // utilizator cu carti incarcate de mana inainte de 4.1.0 (fara marcaje de livrare, fara timp) si retete proprii
 const veg=JSON.parse(fs.readFileSync(dir+"/carti/retete_vegetariene.json","utf8")).map(r=>{const c=Object.assign({},r);delete c.timp;delete c.dif;return c});
 veg[1].corectata=true;veg[1].titlu="Chili corectat de mine";
 const own=[1,2].map(nr=>({sursa:"Retetele mele",nr,titlu:"A mea "+nr,categorie:"Retetele mele",portii:2,ingrediente:[{c:1,u:"",n:"ou"}],pasi_carte:["Fierbe."],macro:{kcal:null,proteine:null,carbo:null,grasimi:null},etichete:[],manual:true}));
 w=await boot({rbook:JSON.stringify(veg.concat(own)),rfav:JSON.stringify(["Retetele mele|1","Retete vegetariene|3"])},{names});T=w.__t;st=T.getStored();
 const V=nr=>st.find(x=>x.sursa==="Retete vegetariene"&&x.nr===nr);
 eq([st.length,st.filter(x=>x.sursa==="Retetele mele").length,st.filter(x=>x.sursa==="Retetele mele").some(x=>x.liv)],[tot+2,2,false],"utilizator existent: cartile se completeaza, retetele proprii neatinse");
 eq([+V(3).timp>0,V(2).titlu,T.isFav("Retetele mele|1"),T.isFav("Retete vegetariene|3")],[true,"Chili corectat de mine",true,true],"reteta neatinsa trece pe versiunea livrata; cea corectata si favoritele raman");
 eq(JSON.parse(JSON.parse(T.bkBuild().json).date.rbook).length,3,"backup: doar retetele proprii si cea corectata");
 // versiune noua a unei carti
 w=await boot({},{names});T=w.__t;
 const des=JSON.parse(fs.readFileSync(dir+"/carti/deserturi_rapide.json","utf8"));des[0].titlu="Mousse nou";des[1].titlu="Inghetata noua";des.push(Object.assign({},des[2],{nr:31,titlu:"Desert 31"}));
 const man=JSON.parse(JSON.stringify(man0));man.carti.find(x=>x.sursa==="Deserturi rapide").v+=1;
 const r2=T.BOOK.find(x=>x.sursa==="Deserturi rapide"&&x.nr===2),t2=r2.titlu;T.cosSet(r2,true);await sleep(50);
 await T.saveStored(T.getStored().filter(x=>!(x.sursa==="Deserturi rapide"&&x.nr===5)));
 w.fetch=async u=>{u=String(u);if(u==="carti.json")return{ok:true,json:async()=>man};if(u==="carti/deserturi_rapide.json")return{ok:true,json:async()=>des};return{ok:false}};
 let r=await T.shipRun();st=T.getStored();const Dz=n=>st.find(x=>x.sursa==="Deserturi rapide"&&x.nr===n);
 eq([Dz(1).titlu,Dz(2).titlu===t2,!!Dz(31),!!Dz(5),r],["Mousse nou",true,true,false,{add:1,upd:28}],"versiune noua: neschimbatele se actualizeaza, cele schimbate sau sterse de utilizator nu");
 eq(await T.shipRun(),{add:0,upd:0},"a doua rulare nu face nimic");
 done()})();

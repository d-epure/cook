/* 4.9.2: dupa refresh, Meniul nu mai arata "Reteta nu mai e in Biblioteca" cat timp biblioteca se incarca. Rulare: node teste/test_4_9_2.js */
const {boot,eq,done}=require("./_boot.js");
(async()=>{
 const t=new Date(),z=t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0");
 const men={[z]:{pranz:[{t:"Reteta care nu exista nicaieri",s:"b",k:"Alta carte|99",p:1,i:{l:[{n:"ou",c:1,u:""}],p:1}}]}};
 const w=await boot({rmen:JSON.stringify(men)},{wait:800,names:["set LR(v){LIBREADY=v}","drawMenu"]}),d=w.document,T=w.__t;
 T.LR=false;T.drawMenu();
 eq(/nu mai e in Biblioteca/.test(d.querySelector("#v-meniu").innerHTML),false,"cat timp biblioteca se incarca: fara avertisment");
 T.LR=true;T.drawMenu();
 eq(/nu mai e in Biblioteca/.test(d.querySelector("#v-meniu").innerHTML),true,"dupa incarcare, avertismentul real ramane");
 done()})();

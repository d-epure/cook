/* 4.3.2: sincronizare - loturile de Meal prep se unesc; mesajul de conflict e citibil. Rulare: node teste/test_4_3_2.js */
const {boot,eq,done}=require("./_boot.js");
(async()=>{
 const w=await boot({},{names:["syMerge","syVal","SY_LAB","syId"],offline:true}),T=w.__t;
 const lot=(id,t)=>({id,s:"b",k:"Carte|"+id,t,d:"2026-11-15",p:4});
 const base={rmp:[lot("a","Supa")]},loc={rmp:[lot("a","Supa"),lot("b","Chili")]},rem={rmp:[lot("a","Supa"),lot("c","Curry")]};
 eq(T.syMerge(base,loc,rem,false).rmp.map(x=>x.id).sort(),["a","b","c"],"loturi adaugate pe ambele dispozitive: raman toate");
 eq(T.syMerge(base,{rmp:[lot("a","Supa"),lot("b","Chili")]},{rmp:[]},false).rmp.map(x=>x.id),["a","b"],"limita cunoscuta: o lista golita complet pe un dispozitiv nu sterge loturile daca celalalt a adaugat intre timp");
 eq(T.syMerge({rmp:[lot("a","Supa")]},{rmp:[lot("a","Supa")]},{rmp:[]},false).rmp,[],"lot terminat pe celalalt dispozitiv dispare si aici");
 eq([T.SY_LAB.rmp,T.syVal([lot("a","Supa"),lot("b","Chili")]),T.syVal([1,2,3,4,5].map(i=>lot("x"+i,"R"+i))),T.syVal({titlu:"Gofre"}),T.syVal(null),T.syVal(4)],["Meal prep","Supa, Chili","R1, R2, R3 si inca 2","Gofre","(gol)","4"],"mesajul arata nume citibile");
 done()})();

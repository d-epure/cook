/* 4.7.1: fara dubluri in meniu la aceeasi masa; lista de cumparaturi curata (orfani, mesaj cand nu mai e nimic de cumparat). Rulare: node teste/test_4_7_1.js */
const {boot,eq,done,item}=require("./_boot.js");
(async()=>{
 const day=new Date(),dk=day.getFullYear()+"-"+String(day.getMonth()+1).padStart(2,"0")+"-"+String(day.getDate()).padStart(2,"0");
 const ZI=["duminica","luni","marti","miercuri","joi","vineri","sambata"][day.getDay()];
 const en=(t,k,L)=>({t,s:"b",k,p:1,bp:4,mp:1,L:L?1:0,i:[{c:100,u:"g",n:"orez"}]});
 const t1="Creveti cu orez si legume",t2="Miso soup";
 const menSeed={[dk]:{pranz:[en(t1,"Retete cu carne|50",true),en(t1,"Retete cu carne|50"),en(t2,"Retetele mele|4")],cina:[en(t1,"Retete cu carne|50")]}};
 const lst=[item("creveti","g",500,t1+" (meniu "+ZI+")"),item("orez","g",250,t1+" (meniu "+ZI+")"),
  {k:"",n:"cartofi",u:"g",c:300,src:["Salata veche (meniu luni)"],parts:[{s:"Salata veche (meniu luni)",c:300}],done:0},
  {k:"",n:"ardei",u:"g",c:100,src:["Salata veche (meniu luni)","Chili vechi (meniu marti)"],parts:[{s:"Salata veche (meniu luni)",c:50},{s:"Chili vechi (meniu marti)",c:50}],done:1},
  item("lapte","l",1,"Adaugat manual")];
 lst.forEach(x=>{x.k=x.k||""});
 const w=await boot({rmen:JSON.stringify(menSeed),rl:JSON.stringify(lst),rp:"[]"},{names:["getMen","getList","putList","putMen","menAdd","show","drawList","removeSrc","lOrphan","MD=undefined"].filter(x=>!/=/.test(x)),offline:true}),T=w.__t,D=w.document;
 // 1 dublurile vechi se aduna la pornire, pranz si cina raman separate
 const m=T.getMen()[dk];
 eq([m.pranz.filter(e=>e.k==="Retete cu carne|50").length,m.pranz.length,m.cina.length],[1,2,1],"aceeasi reteta la aceeasi masa apare o singura data; la cina ramane");
 // 2 lista: produsele mesei scoase din meniu pleaca (si cele bifate), restul ramane
 const l=T.getList(),nm=l.map(x=>x.n).sort();
 eq(nm,["creveti","lapte","orez"].sort(),"orfanii (cartofi, ardei bifat) au plecat; produsele mesei din meniu si cele manuale raman");
 T.putList([{...item("orez","g",50,"X (meniu luni)")}]);const o=T.lOrphan();eq([o,T.getList().length],[["Orez"],0],"lOrphan intoarce numele produselor scoase");
 // 3 scoaterea unei retete scoate si produsele bifate
 T.putList([{...item("ou","g",100,"R1"),done:1},{...item("unt","g",50,"R1"),done:0},item("sare","g",5,"R2")]);
 T.removeSrc("R1");eq(T.getList().map(x=>x.n),["sare"],"removeSrc scoate si produsele bifate ale retetei");
 // 4 nimic de cumparat: mesaj verde, fara comutator si fara butoane
 T.putList([{...item("sare","g",5,"R2"),done:1}]);T.show("lista");let tx=D.querySelector("#ll").textContent;
 eq([/Nu mai ai nimic de cumparat/.test(tx),!!D.querySelector("#lHp"),!!D.querySelector("#lCp"),!!D.querySelector("#lAll")],[true,false,false,true],"tot bifat: mesaj, fara comutator, doar Goleste lista");
 T.putList([]);T.drawList();eq([!!D.querySelector("#lHp"),!!D.querySelector("#lAll"),!!D.querySelector("#lAddI")],[false,false,true],"lista goala: doar campul de adaugare");
 T.putList([item("sare","g",5,"R2"),item("somon","g",300,"R2")]);T.drawList();
 eq([!!D.querySelector("#lHp"),!!D.querySelector("#lCp"),/Nu mai ai nimic/.test(D.querySelector("#ll").textContent)],[true,true,false],"cu ceva de cumparat: comutatorul si butoanele apar");
 done()})();

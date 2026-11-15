/* 4.10.0: "Din debara" = o singura pilula + rand "Lipsesc cel mult"; lista din Filtre a disparut. Rulare: node teste/test_4_10_0.js */
const {boot,eq,done,fs,dir}=require("./_boot.js");
(async()=>{
 const pan=JSON.stringify(["ou","orez","ceapa","usturoi","rosii"].map(x=>({n:x,f:[]})));
 const w=await boot({rp:pan},{wait:1500,names:["show","drawBook"]}),D=w.document,T=w.__t,$=s=>D.querySelector(s);
 T.show("carti");T.drawBook();
 const pill=t=>[...D.querySelectorAll("#bpl .bpill")].find(b=>b.textContent===t),sub=()=>[...D.querySelectorAll("#bpl .bsub .bpill")].map(b=>b.textContent+(b.classList.contains("on")?"*":""));
 eq([$("#bd").tagName,$("#bd").type,!!D.querySelector("label[for=bd]")],["INPUT","hidden",false],"lista Din debara a disparut din Filtre");
 eq(sub(),[],"oprit: fara rand suplimentar");
 pill("Din debara").click();
 eq([pill("Din debara").classList.contains("on"),$("#bd").value,sub()],[true,"0",["0*","1","2","3"]],"pornit: implicit 'lipsesc 0', cu cele 4 alegeri");
 const n0=+($("#bcnt").textContent.match(/(\d+) rete/)||[0,0])[1];
 [...D.querySelectorAll("#bpl .bsub .bpill")].find(b=>b.textContent==="2").click();
 const n2=+($("#bcnt").textContent.match(/(\d+) rete/)||[0,0])[1];
 eq([$("#bd").value,n2>=n0,/cele mai potrivite primele/.test($("#bcnt").textContent)],["2",true,true],"alegerea 2 largeste rezultatele; ordinea dupa potrivire e anuntata");
 const miss=[...D.querySelectorAll("#bres .miss")].map(e=>+((e.textContent.match(/\((\d+)\)/)||[0,0])[1]));
 eq(miss.every((x,i)=>i===0||miss[i-1]<=x),true,"cele mai putine lipsuri primele");
 pill("Din debara").click();
 eq([$("#bd").value,sub()],["",[]],"oprit din nou: filtru scos si randul dispare");
 const w2=await boot({rp:"[]"},{wait:1500,names:["show","drawBook"]});w2.__t.show("carti");w2.localStorage.setItem("rp","[]");w2.__t.drawBook();
 [...w2.document.querySelectorAll("#bpl .bpill")].find(b=>b.textContent==="Din debara").click();
 eq(/Debaraua e goala/.test(w2.document.querySelector("#bpl").textContent),true,"debara goala: mesaj in loc de rezultate fara explicatie");
 done()})();

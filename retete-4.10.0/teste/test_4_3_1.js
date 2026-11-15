/* 4.3.1: butonul "Vezi" de la modificarile facute pe ambele dispozitive. Rulare: node teste/test_4_3_1.js */
const {boot,eq,done,sleep}=require("./_boot.js");
(async()=>{
 const conf=[{t:1,nm:"lista de cumparaturi",f:"",l:"2 kg faina",r:"1 kg faina"}];
 const w=await boot({rsyc:JSON.stringify(conf)},{names:["syBar","dbDraw"],offline:true}),D=w.document;let scrolled=null;
 w.Element.prototype.scrollIntoView=function(){scrolled=this};
 w.__t.syBar("O modificare facuta pe ambele dispozitive. Am pastrat o singura varianta.","Vezi");
 D.querySelector("#syGo").click();await sleep(150);
 eq([D.querySelector("#v-setari").classList.contains("hidden"),/Modificate pe ambele dispozitive/.test(D.querySelector("#dbcard").textContent),/pastrat "2 kg faina", cealalta era "1 kg faina"/.test(D.querySelector("#dbcard").textContent)],[false,true,true],"Vezi deschide Setari si caseta arata ce s-a pastrat");
 eq(!!scrolled&&!!scrolled.closest("#dbcard"),true,"pagina merge la caseta cu detaliile");
 D.querySelector("#dbcard [data-syc]").click();await sleep(50);
 eq([D.querySelector("#sybar").hidden,w.localStorage.getItem("rsyc")],[true,null],"Am inteles ascunde mesajul de sus");
 done()})();

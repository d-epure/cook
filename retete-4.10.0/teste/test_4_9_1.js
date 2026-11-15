/* 4.9.1: "Sterge" de pe randuri devine cos de gunoi, cu confirmare pastrata. Rulare: node teste/test_4_9_1.js */
const {boot,eq,done,fs,dir}=require("./_boot.js");
(async()=>{
 const w=await boot({},{wait:800}),d=w.document;
 const src=fs.readFileSync(dir+"/app.js","utf8");
 eq(/>Sterge<\/button>/.test(src.replace(/<button[^>]*data-edel[^>]*>Sterge reteta<\/button>/,"")),false,"niciun buton de rand cu textul Sterge");
 w.eval('renderCfg&&renderCfg()');
 const b=d.querySelector("#apcfg [data-x]");
 eq([!!b,!!b&&!!b.querySelector("svg"),b&&b.getAttribute("aria-label")],[true,true,"Sterge"],"aparat: cos de gunoi cu eticheta accesibila");
 const n=d.querySelectorAll("#apcfg [data-x]").length;
 b.click();eq([b.textContent,d.querySelectorAll("#apcfg [data-x]").length],["Confirma",n],"primul tap cere confirmare, nu sterge");
 b.click();eq(d.querySelectorAll("#apcfg [data-x]").length,n-1,"al doilea tap sterge");
 done()})();

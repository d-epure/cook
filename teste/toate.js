/* Ruleaza toate testele, pe rand. Rulare: node teste/toate.js (dupa "npm i jsdom") */
const {spawnSync}=require("child_process"),fs=require("fs"),path=require("path");let bad=0;
for(const f of fs.readdirSync(__dirname).filter(x=>/^test_.*\.js$/.test(x)).sort()){const r=spawnSync(process.execPath,[path.join(__dirname,f)],{encoding:"utf8"});const l=(r.stdout||"").trim().split("\n").pop();console.log((r.status?"PICAT ":"ok    ")+f+" - "+l);if(r.status){bad++;console.log(r.stdout.split("\n").filter(x=>/^FAIL/.test(x)).join("\n")+(r.stderr||""))}}
process.exit(bad?1:0)

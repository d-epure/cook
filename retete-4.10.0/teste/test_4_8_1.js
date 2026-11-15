/* 4.8.1: sursele vechi "(de verificat)" se scot cand retetele exista deja in cartile livrate. Rulare: node teste/test_4_8_1.js */
const {boot,eq,done,fs,dir}=require("./_boot.js");
(async()=>{
 const ship=JSON.parse(fs.readFileSync(dir+"/carti/retete_cu_carne.json","utf8")).slice(0,3);
 const old=(r,s,n)=>Object.assign({},JSON.parse(JSON.stringify(r)),{sursa:s,nr:n});
 const rb=[old(ship[0],"Air fryer (de verificat)",1),old(ship[1],"Retete noi (de verificat)",2),old(ship[2],"Retete noi (de verificat)",3),{sursa:"Retete noi (de verificat)",nr:4,titlu:"Doar la mine, nu e in carti",categorie:"x",portii:2,ingrediente:[{c:1,u:"",n:"ou"}],pasi_carte:["a","b"],sfaturi:[],macro:{kcal:100,proteine:5,carbo:5,grasimi:5}}];
 const w=await boot({rbook:JSON.stringify(rb),rfav:JSON.stringify(["Retete noi (de verificat)|3"]),rbv:JSON.stringify({})},{names:["BOOK","getStored"],wait:1500}),T=w.__t;
 const S=T.getStored().filter(r=>/de verificat/.test(r.sursa)).map(r=>r.nr).sort();
 eq(S,[3,4],"copiile vechi care au deja pereche in carti se scot; cea cu favorita si cea fara pereche raman");
 const src=[...new Set(T.BOOK.map(r=>r.sursa))];
 eq([src.includes("Retete cu carne"),src.includes("Air fryer (de verificat)")],[true,false],"filtrul Carte nu mai are Air fryer (de verificat)");
 done()})();

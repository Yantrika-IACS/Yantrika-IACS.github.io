/* Yantrika game: Outreach Planner
   Open source (MIT). Edit freely and send a pull request: see CONTRIBUTING.md
   and games/README.md for the game API. */
(function(){
'use strict';

// GAME: Outreach Planner (4 scenarios with surprises, budget, mentor cap)
function plan(el){
 const SC=[[70,12000,20,'A normal workshop day.'],[90,15000,20,'🌧️ Word spread! 20 extra students turned up.'],[70,11000,20,'💸 A sponsor pulled out, so the budget is tight.'],[40,9000,6,'🤒 Only 6 mentors can make it today.']],KC=600,MC=250;let r=0,pts=0,ran=false;
 el.innerHTML=`<h2 class="m">Outreach Planner</h2><p>Plan each Schools Outreach workshop. Every kit costs ₹${KC} and every mentor ₹${MC} (food and travel). Meet all four checks, then press <b>Run workshop</b>. Surprises will change the plan!</p><div class="info" id="ph"></div>
 <label for="kv"><b>Kits: <span id="kvv"></span></b></label><input id="kv" type="range" min="4" max="30" value="10" style="width:100%;max-width:460px;display:block;margin:6px 0 14px">
 <label for="vl"><b>Volunteer mentors: <span id="vlv"></span></b></label><input id="vl" type="range" min="2" max="20" value="6" style="width:100%;max-width:460px;display:block;margin:6px 0 14px">
 <div class="info" id="po"></div><div class="tbs"><button class="tb" id="rn" type="button">Run workshop</button></div>`;
 const q=x=>el.querySelector(x),k=q('#kv'),v=q('#vl');
 const calc=()=>{const [S,B,M]=SC[r],K=+k.value,V=Math.min(+v.value,M),pk=Math.ceil(S/K),pm=Math.ceil(S/V),km=Math.ceil(K/V),cost=K*KC+V*MC;
  return{c:[[pk<=5,'Students per kit: '+pk+' (aim for 5 or fewer)'],[pm<=8,'Students per mentor: '+pm+' (aim for 8 or fewer)'],[km<=2,'Kits per mentor: '+km+' (aim for 2 or fewer)'],[cost<=B,'Cost: ₹'+cost+' of ₹'+B+' budget']],K,V};};
 const u=()=>{const x=calc(),M=SC[r][2];q('#kvv').textContent=x.K;q('#vlv').textContent=x.V+(M<20&&+v.value>M?' (capped at '+M+')':'');
  q('#ph').innerHTML='<b>Scenario '+(r+1)+' of 4:</b> '+SC[r][3]+'<br><b>'+SC[r][0]+'</b> students | Score: <b>'+pts+'</b>';
  if(!ran)q('#po').innerHTML=x.c.map(y=>(y[0]?'✅ ':'⚠️ ')+y[1]).join('<br>');};
 k.oninput=v.oninput=()=>{if(!ran)u();};
 q('#rn').onclick=()=>{
  if(ran){ran=false;if(r>=3){r=0;pts=0;}else r++;q('#rn').textContent='Run workshop';u();return;}
  const x=calc(),ok=x.c.every(y=>y[0]);ran=true;if(ok)pts++;SFX.play(ok?'win':'buzz');
  q('#po').innerHTML=x.c.map(y=>(y[0]?'✅ ':'❌ ')+y[1]).join('<br>')+'<br><br><b>'+(ok?'🎉 A brilliant workshop!':'😕 Some students were left watching.')+'</b>'+(r>=3?'<br><b>Final: '+pts+' / 4 workshops</b>':'');
  q('#rn').textContent=r>=3?'New game':'Next scenario';q('#ph').innerHTML=q('#ph').innerHTML.replace(/Score: <b>\d+/,'Score: <b>'+pts);};
 u();
}

YK.register({
  id:"plan",
  pillar:'share',
  icon:'🏫',
  title:'Outreach Planner',
  description:'Balance kits and mentors for 70 students.',
  events:['schools-outreach','summer-camp','semester-outreach'],
  thumb:'games/plan/thumb.jpg',
  theory:`<p>This is a <b>resource allocation</b> problem: your output is limited by the scarcest resource, the <b>bottleneck</b>. Ratios (students per kit, students per mentor) matter more than totals. Engineers and project managers use the same reasoning for budgets and schedules.</p>`,
  demo:b=>TIN(b,'Try it: find the bottleneck',SL('k','Kits',4,20,10)+SL('m','Mentors',2,20,6),v=>{const kc=v('k')*5,mc=v('m')*8,cap=Math.min(kc,mc);return `Kits support <b>${kc}</b> students, mentors support <b>${mc}</b>.<br>Real capacity: <b>${Math.min(cap,70)} of 70</b>. Bottleneck: <b>${kc<mc?'kits':mc<kc?'mentors':'balanced 👌'}</b>.`}),
  run:plan
 });
})();

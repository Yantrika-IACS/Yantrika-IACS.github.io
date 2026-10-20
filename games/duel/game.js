/* Yantrika game: Reaction Duel
   Open source (MIT). Edit freely and send a pull request: see CONTRIBUTING.md
   and games/README.md for the game API. */
(function(){
'use strict';

let best=Infinity;

const panel=()=>`<h2 class="m">Compete: reaction duel</h2><p>Duel Quick Quinn in a best-of-5. Tap only when the button turns green: a red FAKE is a trap, and Quinn gets faster each time you win a round.</p>
<button class="btn" id="rx" type="button">Start the duel</button>
<p id="rs" aria-live="polite" style="margin:6px 0 16px"><b>Your time shows up here.</b></p>
<h3 class="m">Where to use it</h3>
${['robotics-hackathon','game-theory-hackathon','technical-hackathon','team-challenge'].map(id=>{const e=EV.find(x=>x.id===id);return `<a class="btn" href="#/${id}">${esc(e.t)} (${e.d})</a>`}).join('')}`;

const wire=root=>{
 const rx=root.querySelector('#rx'),out=root.querySelector('#rs');let st=0,t0=0,to=0,rd=0,yw=0,bw=0,bt=0,dc=0;
 const col=(t,c)=>{rx.textContent=t;rx.style.background=c;};
 const fin=(m,win)=>{clearTimeout(to);SFX.play(win?'win':'lose');rd++;win?yw++:bw++;const e=rd>=5;out.innerHTML='<b>'+m+'</b><br>Round '+rd+'/5 | You '+yw+' – '+bw+' Quinn'+(e?'<br><b>'+(yw>bw?'🏆 You win the duel!':'🤖 Quick Quinn wins. Rematch?')+'</b>':'');if(e)rd=yw=bw=0;col(e?'Rematch':'Next round','var(--yel)');st=0;};
 const go=()=>{st=2;SFX.play('go');bt=175+Math.random()*125-yw*15;t0=performance.now();col('GO! Tap now','var(--cy)');to=setTimeout(()=>{if(st===2)fin('🤖 Quinn tapped first ('+Math.round(bt)+' ms). Too slow!',false);},bt);};
 rx.onclick=()=>{
  if(st===0){st=1;dc=Math.random()<.3;col('Wait for green...','var(--or)');out.innerHTML='<b>Get ready...</b> Beware of fakes!';const w=1200+Math.random()*2200;to=setTimeout(()=>{if(dc){st=3;SFX.play('buzz');col('⚠️ FAKE! Hold...','var(--pk)');to=setTimeout(go,700+Math.random()*900);}else go();},dc?w*.5:w);}
  else if(st===1||st===3)fin('😬 False start! Quinn takes the round.',false);
  else{const ms=Math.round(performance.now()-t0);best=Math.min(best,ms);ms<bt?fin('⚡ '+ms+' ms beats Quinn ('+Math.round(bt)+' ms). Best: '+best+' ms.',true):fin('🤖 Quinn was faster ('+Math.round(bt)+' ms vs your '+ms+' ms).',false);}
 };
};

YK.register({
  id:"duel",
  pillar:'compete',
  icon:'⚡',
  title:'Reaction Duel',
  description:'Tap the moment the button turns green.',
  events:['robotics-hackathon','team-challenge'],
  thumb:'games/duel/thumb.jpg',
  theory:`<p><b>Reaction time</b> is the delay between a stimulus and a response. Humans average about 250 ms because the signal must travel through eyes, brain and muscles. Microcontrollers respond in microseconds using <b>interrupts</b>. Hackathons reward both speed and accuracy, the <b>speed-accuracy trade-off</b>: tapping early costs you.</p>`,
  demo:b=>TIN(b,'Try it: reaction time on the road',SL('ms','Reaction time (ms)',150,600,250,10),v=>{const m=v('ms');return `At 60 km/h a car travels <b>${(16.67*m/1000).toFixed(1)} m</b> before you even start braking. At 100 km/h: <b>${(27.78*m/1000).toFixed(1)} m</b>.`}),
  run:el=>{el.innerHTML=panel();wire(el);}
 });
})();

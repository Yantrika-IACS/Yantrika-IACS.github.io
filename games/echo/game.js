/* Yantrika game: Echo Distance Lab
   Open source (MIT). Edit freely and send a pull request: see CONTRIBUTING.md
   and games/README.md for the game API. */
(function(){
'use strict';

// GAME: Echo Distance Lab -> "Park the bot": hit a target distance, temperature changes the speed of sound
function echo(el){
 let rd=0,sc=0,pg=3,tg=0,T=20,v=343,lk=false;
 const D=t=>t*v/20,nr=()=>{T=Math.round(Math.random()*40);v=331.3+.606*T;tg=15+Math.floor(Math.random()*70);pg=3;lk=false;};nr();
 el.innerHTML=`<h2 class="m">Echo Distance Lab: park the bot</h2><p>Distance = speed of sound × echo time ÷ 2. You are told where to stop, but not shown the distance. Set the echo time with the slider, fire up to 3 test pings, then lock in. The air temperature changes the speed of sound, so check it each round.</p>
 <div class="info" id="eh"></div><label for="et"><b>Echo time: <span id="etv"></span> ms</b></label><input id="et" type="range" min="0.5" max="12" step="0.05" value="4" style="width:100%;max-width:460px;display:block;margin:6px 0 14px">
 <div class="echo" aria-hidden="true"><span style="position:absolute;left:6px;top:8px;font-size:1.6rem">🤖</span><span id="wl" style="position:absolute;top:8px;font-size:1.6rem">🧱</span></div>
 <div class="info" id="eo">Fire a ping to measure, or trust your maths.</div><div class="tbs"><button class="tb" id="pgb" type="button">📡 Ping</button><button class="tb" id="lkb" type="button">Lock in</button></div>`;
 const q=x=>el.querySelector(x),sl=q('#et'),wl=q('#wl'),eo=q('#eo');
 const u=()=>{const t=+sl.value;q('#etv').textContent=t.toFixed(2);wl.style.left=(10+D(t)/210*82)+'%';q('#eh').innerHTML='<b>Round '+Math.min(rd+1,5)+' of 5</b> | Score: <b>'+sc+'</b> | Pings left: <b>'+pg+'</b><br>Stop the bot at <b>'+tg+' cm</b>. Air is <b>'+T+' °C</b>, so sound travels <b>'+v.toFixed(0)+' m/s</b>.';};
 sl.oninput=u;u();
 q('#pgb').onclick=()=>{if(lk||pg<=0){if(!lk)eo.innerHTML='🔇 No pings left!';return;}pg--;SFX.play('ping');eo.innerHTML='📡 Ping says the wall is <b>'+D(+sl.value).toFixed(0)+' cm</b> away at this echo time.';u();};
 q('#lkb').onclick=()=>{
  if(lk){if(rd>=5){rd=0;sc=0;}nr();q('#lkb').textContent='Lock in';eo.innerHTML='New round. Do the maths!';u();return;}
  lk=true;rd++;const d=D(+sl.value),e=Math.abs(d-tg),pt=e<=1?3:e<=3?2:e<=8?1:0;sc+=pt;SFX.play(pt===3?'win':pt?'coin':'lose');
  eo.innerHTML='Wall at <b>'+d.toFixed(1)+' cm</b>, target <b>'+tg+' cm</b>: off by <b>'+e.toFixed(1)+' cm</b> → <b>+'+pt+'</b> '+(pt===3?'🎯 Perfect park!':pt?'👍':'💥 Crash!')+'<br>Right answer: t = 2 × '+tg+' ÷ '+(v*100/1000).toFixed(1)+' ≈ '+(tg*20/v).toFixed(2)+' ms'+(rd>=5?'<br><b>Final score: '+sc+' / 15</b>':'');
  q('#lkb').textContent=rd>=5?'New game':'Next round';u();};
}

YK.register({
  id:"echo",
  pillar:'learn',
  icon:'📡',
  title:'Echo Distance Lab',
  description:'Turn echo time into distance and decide when to turn.',
  events:['expert-talks','workshop-2'],
  thumb:'games/echo/thumb.jpg',
  theory:`<p>Ultrasonic sensors use <b>time of flight</b>. Sound travels about 343 m/s in air at 20 °C, so <b>distance = speed × time ÷ 2</b>, halved because the pulse goes out and comes back. Temperature changes the speed of sound, which is why real sensors drift outdoors.</p>`,
  demo:b=>TIN(b,'Try it: why temperature matters',SL('t','Air temperature (°C)',-10,50,20),v=>{const t=v('t'),s=331.3+0.606*t,rd=100*343/s;return `Speed of sound: <b>${s.toFixed(0)} m/s</b><br>A wall really 100 cm away looks like <b>${rd.toFixed(1)} cm</b> if the code assumes 343 m/s.`}),
  run:echo
 });
})();

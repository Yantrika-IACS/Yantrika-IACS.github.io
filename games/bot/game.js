/* Yantrika game: Bot Builder
   Open source (MIT). Edit freely and send a pull request: see CONTRIBUTING.md
   and games/README.md for the game API. */
(function(){
'use strict';

const BP=[['Arduino Nano','The brain. It reads sensors and decides what the motors do.','🧠'],['Ultrasonic sensor','Sends out a sound pulse and times the echo to measure distance.','📡'],['Motor driver','Lets the small Arduino pins control power-hungry motors.','⚙️'],['DC motors','Turn the wheels. Speed is set with PWM signals.','🛞'],['LiPo battery','Powers everything. Read the safety sheet before charging.','🔋']];

const panel=()=>`<h2 class="m">Build: assemble an obstacle-avoiding bot</h2><p>Tap each part to add it to your robot. Tap again to take it off.</p>
<div>${BP.map((b,i)=>`<button class="chip" type="button" aria-pressed="false" data-i="${i}">${b[0]}</button>`).join('')}</div>
<div class="slots" aria-hidden="true">${BP.map(b=>`<div class="slot">${b[2]}</div>`).join('')}</div>
<div class="bar"><i></i></div><p style="margin:6px 0 0"><b id="bc">0 of 5 parts</b></p>
<div class="info" id="bi">Start with the brain: tap Arduino Nano.</div>`;

const wire=root=>{
 const on=new Set(),sl=root.querySelectorAll('.slot'),bar=root.querySelector('.bar i'),ct=root.querySelector('#bc'),inf=root.querySelector('#bi');
 root.querySelectorAll(':scope > div > [data-i]').forEach(c=>c.onclick=()=>{
  const i=+c.dataset.i,was=on.has(i);was?on.delete(i):on.add(i);SFX.play(was?'off':'on');
  c.setAttribute('aria-pressed',!was);sl[i].classList.toggle('on',!was);
  bar.style.width=on.size*20+'%';if(on.size===5)SFX.play('win');ct.textContent=on.size+' of 5 parts';
  inf.innerHTML=on.size===5?'<b>Your obstacle-avoiding bot is assembled!</b><br>The wiring guide and battery safety sheet are in Materials.<br><a class="btn cy" href="#/materials">Open Materials</a>':(was?'Removed '+BP[i][0]+'.':'<b>'+BP[i][0]+'</b><br>'+BP[i][1]);
 });
};

YK.register({
  id:"bot",
  pillar:'build',
  icon:'🤖',
  title:'Bot Builder',
  description:'Assemble an obstacle-avoiding bot part by part.',
  events:['workshop-2','prototyping-session','summer-camp'],
  thumb:'games/bot/thumb.jpg',
  theory:`<p>Every simple robot runs a <b>sense, think, act</b> loop: the sensor measures, the Arduino decides, the motors move. Obstacle avoidance is the rule "if distance &lt; threshold, turn" repeated many times a second, a basic <b>feedback control system</b>.</p>`,
  demo:b=>TIN(b,'Try it: sense, think, act',SL('d','Sensor reading (cm)',2,100,40)+SL('th','Turn threshold (cm)',5,60,20),v=>`Sense: ${v('d')} cm → Think: is ${v('d')} &lt; ${v('th')}? → Act: <b>${v('d')<v('th')?'↪️ Turn away':'⬆️ Drive forward'}</b>`),
  run:el=>{el.innerHTML=panel();wire(el);}
 });
})();

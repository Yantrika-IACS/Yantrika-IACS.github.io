/* Yantrika game: Circuit Switch
   Open source (MIT). Edit freely and send a pull request: see CONTRIBUTING.md
   and games/README.md for the game API. */
(function(){
'use strict';

// ---- Small text used inside the pillar panels / game intros ----
// LT = topics under "Learn", BP = bot parts, SH = ways to "Share"
/* ---------- Pillar panel content (used by the Games page) ---------- */
const LT={Arduino:'The tiny brain of most of our bots. Start with the UNO and Nano pinouts.',Sensors:'How a robot sees: distance, light and line sensors, starting with the ultrasonic one.',Motors:'Drivers, power and speed control, plus the LiPo battery safety rules.',Code:'Your first sketches: blink an LED, read a sensor, make a decision. Examples from Workshop I.'};

const panel=()=>`<h2 class="m">Learn: flip the switch</h2><p>Every robot starts with a circuit. Close the switch and watch the current light the LED.</p>
<svg viewBox="0 0 320 120" style="width:100%;max-width:460px;display:block;color:var(--ink)" role="img" aria-label="Circuit with a battery, a switch, a resistor and an LED">
<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 30H70M120 30H150l8-14 12 28 12-28 12 28 8-14H236M264 30H300V90H20V30"/><circle cx="70" cy="30" r="4"/><circle cx="120" cy="30" r="4"/><line id="bl" x1="70" y1="30" x2="112" y2="8"/><rect x="145" y="72" width="30" height="36" style="fill:var(--card);stroke:none"/><path d="M152 74V106M168 82V98" stroke-width="6"/><circle id="led" cx="250" cy="30" r="14" style="fill:var(--soft)"/></g></svg>
<button class="btn cy" id="sw" type="button" aria-pressed="false">Close the switch</button>
<h3 class="m" style="margin-top:20px">What you will pick up</h3>
<div>${Object.keys(LT).map(k=>`<button class="chip" type="button" aria-pressed="false" data-t="${k}">${k}</button>`).join('')}</div>
<div class="info" id="li">Tap a topic to see what we cover.</div>
<a class="btn" href="#/materials" style="margin-top:12px">Open Materials</a>`;

const wire=root=>{
 const sw=root.querySelector('#sw'),bl=root.querySelector('#bl'),led=root.querySelector('#led'),li=root.querySelector('#li');
 sw.onclick=()=>{const on=sw.getAttribute('aria-pressed')!=='true';SFX.play(on?'on':'off');sw.setAttribute('aria-pressed',on);sw.textContent=on?'Open the switch':'Close the switch';bl.setAttribute('x2',on?120:112);bl.setAttribute('y2',on?30:8);led.style.fill=on?'#f1c40f':'var(--soft)';led.style.filter=on?'drop-shadow(0 0 8px #f1c40f)':'none';};
 root.querySelectorAll('[data-t]').forEach(c=>c.onclick=()=>{root.querySelectorAll('[data-t]').forEach(x=>x.setAttribute('aria-pressed',x===c));li.innerHTML='<b>'+c.dataset.t+'</b><br>'+LT[c.dataset.t];});
};

YK.register({
  id:"circuit",
  pillar:'learn',
  icon:'💡',
  title:'Circuit Switch',
  description:'Close the switch and light the LED.',
  events:['induction','workshop-1','workshop-2'],
  thumb:'games/circuit/thumb.png',
  theory:`<p><b>Ohm's law: V = I × R.</b> Current flows only in a closed loop. An LED needs a resistor to limit current, otherwise it burns out. A switch is just a gap you can open or close in that loop.</p>`,
  demo:b=>TIN(b,'Try it: pick a resistor',SL('r','Resistor (Ω)',50,1000,220,10)+'<small>5 V supply, red LED drops about 2 V.</small>',v=>{const R=v('r'),I=3/R*1000;return `Current = (5 − 2) ÷ ${R} = <b>${I.toFixed(1)} mA</b><br>${I>20?'🔥 Too much current: the LED may burn out.':I<3?'🌑 Very dim.':'✅ Bright and safe (about 10–20 mA is ideal).'}`}),
  run:el=>{el.innerHTML=panel();wire(el);}
 });
})();

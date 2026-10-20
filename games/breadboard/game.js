/* Yantrika game: Breadboard Lab
   Open source (MIT). Edit freely and send a pull request: see CONTRIBUTING.md
   and games/README.md for the game API. */
(function(){
'use strict';

// GAME: Breadboard Lab (drag a sensor, wire it to the Arduino)
function breadboard(el){
 const NC=20,cx=c=>64+26*c,RY=[144,162,180,198,216,250,268,286,304,322],HX=80,HY=394;
 const AP=['5V','GND','D2','D3','D4','A0'],AC={'5V':'#ec3750',GND:'#222','D2':'#338eda',D3:'#ff8c37',D4:'#8e44ad',A0:'#2bb673'};
 const MS=[
  {n:'IR',t:'IR Obstacle Sensor',c:'#338eda',p:['OUT','GND','VCC'],q:[['OUT','D2'],['GND','GND'],['VCC','5V']],s:()=>Math.random()<.5?'🚧 Obstacle detected (OUT goes LOW)':'✅ Path clear (OUT stays HIGH)'},
  {n:'HC-SR04',t:'Ultrasonic Sensor',c:'#1f7a9c',p:['VCC','TRIG','ECHO','GND'],q:[['VCC','5V'],['TRIG','D2'],['ECHO','D3'],['GND','GND']],s:()=>'📡 Distance: '+Math.round(5+Math.random()*195)+' cm'},
  {n:'LM35',t:'Temperature Sensor',c:'#3b3b46',p:['+VS','VOUT','GND'],q:[['+VS','5V'],['VOUT','A0'],['GND','GND']],s:()=>'🌡️ Temperature: '+(24+Math.random()*10).toFixed(1)+' °C'}
 ];
 const PT=[],PM={},add=p=>{PT.push(p);PM[p.id]=p;};
 AP.forEach((a,i)=>add({id:'P:'+a,key:'P:'+a,x:110+80*i,y:62,k:'ard'}));
 for(let c=0;c<NC;c++){add({id:'R+'+c,key:'R+',x:cx(c),y:100,k:'rail'});add({id:'R-'+c,key:'R-',x:cx(c),y:114,k:'rail'});}
 for(let r=0;r<10;r++)for(let c=0;c<NC;c++)add({id:'H'+r+'_'+c,key:(r<5?'T':'B')+c,x:cx(c),y:RY[r],k:'hole'});
 let mi=0,wires=[],pl=null,drag=null,wiring=null,msg='',ok=false;const done=new Set();
 const M=()=>MS[mi],K=()=>M().p.length;
 el.innerHTML=`<h2 class="m">Breadboard Lab</h2><p>Real circuits start on a breadboard. <b>1.</b> Drag the sensor from the parts tray and press its pins into the board. <b>2.</b> Drag from an Arduino pin to a hole in the same column as the sensor pin it must reach (or via the + and − rails). <b>3.</b> Press Check wiring. Tap the dot at the end of a wire to remove it.</p>
 <div id="bbc"></div><div class="info" id="bbg"></div>
 <svg id="bbs" viewBox="0 0 620 424" style="width:100%;max-width:760px;display:block;margin:12px 0;touch-action:none;user-select:none;-webkit-user-select:none;border:3px solid var(--dk);border-radius:10px;background:var(--card)" role="img" aria-label="Breadboard with an Arduino pin header and a parts tray"></svg>
 <div class="info" id="bbi" aria-live="polite"></div>
 <button class="btn cy" type="button" id="bbk">Check wiring</button><button class="btn" type="button" id="bbw">Clear wires</button><button class="btn" type="button" id="bbr">Reset sensor</button><button class="btn cy" type="button" id="bbn" hidden>Next sensor &rarr;</button>
 <p style="margin:8px 0 0"><small>Hint: on a breadboard, the 5 holes of one column (a–e, or f–j) are joined. The + and − rails run along the whole board.</small></p>`;
 const svg=el.querySelector('#bbs'),info=el.querySelector('#bbi');
 const chips=()=>{el.querySelector('#bbc').innerHTML=MS.map((s,i)=>`<button class="chip" type="button" data-m="${i}" aria-pressed="${i===mi}">${done.has(i)?'✅ ':''}${s.t}</button>`).join('')+`<small style="margin-left:6px"><b>${done.size} of ${MS.length} wired</b></small>`;
  el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{mi=+b.dataset.m;reset();});
  el.querySelector('#bbg').innerHTML='<b>Goal for the '+M().n+':</b> '+M().q.map(q=>`<span class="badge" style="background:var(--yel)">${q[0]} &rarr; ${q[1]}</span>`).join(' ');};
 const hid=(r,c)=>'H'+r+'_'+c;
 const occ=()=>{const o=new Set();wires.forEach(w=>{o.add(w.a);o.add(w.b);});if(pl)for(let i=0;i<K();i++)o.add(hid(pl.r,pl.c+i));return o;};
 const spos=()=>{const k=K();return Array.from({length:k},(_,i)=>drag?[drag.ox+26*i,drag.oy]:pl?[cx(pl.c+i),RY[pl.r]]:[HX+26*i,HY]);};
 const snap=(ox,oy)=>{let b=null,bd=30;const o=new Set();wires.forEach(w=>{o.add(w.a);o.add(w.b);});
  for(let r=0;r<10;r++)for(let c=0;c<=NC-K();c++){const d=Math.hypot(cx(c)-ox,RY[r]-oy);if(d<bd){let f=true;for(let i=0;i<K();i++)if(o.has(hid(r,c+i)))f=false;if(f){bd=d;b={r,c};}}}return b;};
 const wcol=w=>{const A=PM[w.a],B=PM[w.b],a=A.k==='ard'?A:B.k==='ard'?B:null;if(a)return AC[a.id.slice(2)];return A.key==='R+'||B.key==='R+'?'#ec3750':A.key==='R-'||B.key==='R-'?'#222':'#f1c40f';};
 const wpath=w=>{let A=PM[w.a],B=PM[w.b];if(B.k==='ard')[A,B]=[B,A];
  if(A.k==='ard'){const m=(A.y+B.y)/2;return `M${A.x} ${A.y}C${A.x} ${m},${B.x} ${m},${B.x} ${B.y}`;}
  const t=Math.min(A.y,B.y)-34;return `M${A.x} ${A.y}C${A.x} ${t},${B.x} ${t},${B.x} ${B.y}`;};
 const render=()=>{
  const sp=spos(),k=K(),m=M(),placed=!!pl&&!drag;let h='';
  h+=`<rect x="60" y="8" width="500" height="44" rx="6" fill="#0b6e8a"/><text x="70" y="24" fill="#fff" font-size="11" font-weight="700">Arduino Nano</text>`;
  AP.forEach((a,i)=>{const p=PM['P:'+a];h+=`<text x="${p.x}" y="44" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">${a}</text><circle cx="${p.x}" cy="${p.y}" r="6" fill="#f1c40f" stroke="#17171d" stroke-width="2"/>`;});
  h+=`<rect x="36" y="88" width="550" height="250" rx="10" fill="#f5f1e6" stroke="#17171d" stroke-width="3"/><rect x="44" y="226" width="534" height="14" fill="#d9d3c0"/>`;
  h+=`<line x1="52" x2="578" y1="92" y2="92" stroke="#ec3750" stroke-width="2"/><line x1="52" x2="578" y1="122" y2="122" stroke="#338eda" stroke-width="2"/><text x="46" y="104" font-size="11" font-weight="700" fill="#ec3750" text-anchor="middle">+</text><text x="46" y="118" font-size="11" font-weight="700" fill="#338eda" text-anchor="middle">−</text>`;
  for(let c=0;c<NC;c++)h+=`<text x="${cx(c)}" y="134" font-size="8" fill="#777" text-anchor="middle">${c+1}</text>`;
  for(let r=0;r<10;r++)h+=`<text x="46" y="${RY[r]+3}" font-size="9" fill="#777" text-anchor="middle">${'abcdefghij'[r]}</text>`;
  PT.forEach(p=>{if(p.k!=='ard')h+=`<circle cx="${p.x}" cy="${p.y}" r="4.2" fill="#2b2b33"/>`;});
  h+=`<rect x="36" y="346" width="550" height="70" rx="8" fill="#e4e9ec" stroke="#17171d" stroke-width="2" stroke-dasharray="6 4"/><text x="570" y="408" font-size="10" fill="#556" text-anchor="end">PARTS TRAY</text>`;
  wires.forEach((w,i)=>{const c=wcol(w),A=PM[w.a],B=PM[w.b];h+=`<path d="${wpath(w)}" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".6"/><path d="${wpath(w)}" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`+[A,B].map(p=>`<circle data-w="${i}" cx="${p.x}" cy="${p.y}" r="7" fill="${c}" stroke="#fff" stroke-width="2" style="cursor:pointer"/>`).join('');});
  if(placed){
   h+=`<rect x="${sp[0][0]-13}" y="${sp[0][1]-9}" width="${26*k}" height="18" rx="4" fill="${m.c}" stroke="${ok?'#33d6a6':'#17171d'}" stroke-width="${ok?4:2}" style="cursor:grab"/>`+sp.map((p,i)=>`<text x="${p[0]}" y="${p[1]+3}" font-size="8" font-weight="700" fill="#fff" text-anchor="middle" style="pointer-events:none">${m.p[i]}</text>`).join('');
  }else{
   h+=`<g opacity="${drag?.85:1}" style="cursor:grab"><rect x="${sp[0][0]-13}" y="${sp[0][1]-38}" width="${26*k}" height="30" rx="5" fill="${m.c}" stroke="#17171d" stroke-width="2"/><text x="${sp[0][0]-13+13*k}" y="${sp[0][1]-19}" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">${m.n}</text>`+sp.map((p,i)=>`<rect x="${p[0]-3}" y="${p[1]-8}" width="6" height="16" fill="#c9a227" stroke="#17171d" stroke-width="1"/><text x="${p[0]}" y="${p[1]+20}" font-size="8" font-weight="700" fill="#17171d" text-anchor="middle">${m.p[i]}</text>`).join('')+`</g>`;
  }
  if(drag){const s=snap(drag.ox,drag.oy);if(s)for(let i=0;i<k;i++)h+=`<circle cx="${cx(s.c+i)}" cy="${RY[s.r]}" r="8" fill="none" stroke="#33d6a6" stroke-width="3"/>`;}
  if(wiring){const f=wiring.from,o=occ(),t=near(wiring.x,wiring.y,12,p=>p.id!==f.id&&(p.k==='ard'||!o.has(p.id)));
   h+=`<line x1="${f.x}" y1="${f.y}" x2="${wiring.x}" y2="${wiring.y}" stroke="${f.k==='ard'?AC[f.id.slice(2)]:'#f1c40f'}" stroke-width="4" stroke-dasharray="6 5" stroke-linecap="round"/><circle cx="${f.x}" cy="${f.y}" r="8" fill="none" stroke="#33d6a6" stroke-width="3"/>`+(t?`<circle cx="${t.x}" cy="${t.y}" r="8" fill="none" stroke="#33d6a6" stroke-width="3"/>`:'');}
  svg.innerHTML=h;
  info.innerHTML=msg||'Drag the <b>'+m.t+'</b> onto the breadboard.';
  el.querySelector('#bbn').hidden=!ok;
 };
 function near(x,y,rad,f){let b=null,bd=rad;PT.forEach(p=>{if(!f(p))return;const d=Math.hypot(p.x-x,p.y-y);if(d<=bd){bd=d;b=p;}});return b;}
 const pt=e=>{const s=svg.createSVGPoint();s.x=e.clientX;s.y=e.clientY;const q=s.matrixTransform(svg.getScreenCTM().inverse());return [q.x,q.y];};
 function reset(){wires=[];pl=null;drag=null;wiring=null;msg='';ok=false;chips();render();}
 svg.onpointerdown=e=>{
  const [x,y]=pt(e),w=e.target.closest&&e.target.closest('[data-w]');
  if(w){wires.splice(+w.dataset.w,1);msg='';ok=false;render();return;}
  const sp=spos(),k=K(),top=pl?sp[0][1]-12:sp[0][1]-40;
  if(x>=sp[0][0]-14&&x<=sp[k-1][0]+14&&y>=top&&y<=sp[0][1]+(pl?12:24)){
   drag={dx:x-sp[0][0],dy:y-sp[0][1],ox:sp[0][0],oy:sp[0][1]};pl=null;ok=false;msg='';svg.setPointerCapture(e.pointerId);e.preventDefault();render();return;}
  const o=occ(),p=near(x,y,11,q=>q.k==='ard'||!o.has(q.id));
  if(p){wiring={from:p,x,y};ok=false;svg.setPointerCapture(e.pointerId);e.preventDefault();render();}
 };
 svg.onpointermove=e=>{
  if(!drag&&!wiring)return;const [x,y]=pt(e);
  if(drag){drag.ox=x-drag.dx;drag.oy=y-drag.dy;}else{wiring.x=x;wiring.y=y;}render();
 };
 const up=(e,cancel)=>{
  if(drag){const s=cancel?null:snap(drag.ox,drag.oy);drag=null;pl=s;msg=s?'Sensor placed. Now add the wires.':'Sensor returned to the tray. Drop it closer to the holes.';render();}
  else if(wiring){const [x,y]=pt(e),f=wiring.from,o=occ(),t=cancel?null:near(x,y,12,p=>p.id!==f.id&&(p.k==='ard'||!o.has(p.id)));
   wiring=null;
   if(t&&!(t.k==='ard'&&f.k==='ard')){wires.push({a:f.id,b:t.id});msg='';}else if(t)msg='Connect an Arduino pin to the breadboard, not to another Arduino pin.';
   render();}
 };
 svg.onpointerup=e=>up(e,false);svg.onpointercancel=e=>up(e,true);
 el.querySelector('#bbw').onclick=()=>{wires=[];ok=false;msg='All wires removed.';render();};
 el.querySelector('#bbr').onclick=()=>{pl=null;ok=false;msg='Sensor back in the tray.';render();};
 el.querySelector('#bbn').onclick=()=>{mi=(mi+1)%MS.length;reset();};
 el.querySelector('#bbk').onclick=()=>{setTimeout(()=>{if(!ok)SFX.play('buzz');},0);
  ok=false;
  if(!pl){msg='⚠️ Place the sensor on the breadboard first.';render();return;}
  const uf={},f=a=>{if(!(a in uf))uf[a]=a;return uf[a]===a?a:(uf[a]=f(uf[a]));},un=(a,b)=>{uf[f(a)]=f(b);};
  wires.forEach(w=>un(PM[w.a].key,PM[w.b].key));
  M().p.forEach((p,i)=>un('S:'+p,PM[hid(pl.r,pl.c+i)].key));
  const nodes=[...M().p.map(p=>'S:'+p),...AP.map(a=>'P:'+a)],g={},bad=[];
  nodes.forEach(n=>{(g[f(n)]=g[f(n)]||[]).push(n);});
  const isReq=(a,b)=>M().q.some(q=>('S:'+q[0]===a&&'P:'+q[1]===b)||('S:'+q[0]===b&&'P:'+q[1]===a));
  Object.values(g).forEach(L=>{if(L.length<2)return;
   if(L.includes('P:5V')&&L.includes('P:GND'))bad.push('⚡ Short circuit! 5V and GND are connected. Unplug a wire right away.');
   else if(!(L.length===2&&isReq(L[0],L[1])))bad.push('❌ '+L.map(n=>n.slice(2)).join(' and ')+' are connected together, which is not what we want.');});
  M().q.forEach(q=>{if(f('S:'+q[0])!==f('P:'+q[1]))bad.push('🔌 '+q[0]+' is not connected to '+q[1]+' yet.');});
  const uniq=[...new Set(bad)];
  if(uniq.length){msg=uniq.join('<br>');}
  else{ok=true;done.add(mi);chips();SFX.play('win');msg='<b>✅ Wired correctly!</b> The '+M().t+' is powered.<br>'+M().s()+'<br><small>Wires used: '+wires.length+'</small>';}
  render();
 };
 chips();render();
}

YK.register({
  id:"breadboard",
  pillar:'build',
  icon:'🔌',
  title:'Breadboard Lab',
  description:'Place a sensor on the breadboard with your hand, then wire it to the Arduino.',
  events:['workshop-1','workshop-2','prototyping-session'],
  thumb:'games/breadboard/thumb.jpg',
  theory:`<p>A breadboard is a set of <b>electrical nets</b>: holes in the same strip are connected, and a circuit works only if the right pins share a net. Joining 5V directly to GND is a <b>short circuit</b>: almost no resistance means a huge current, so we always check wiring before powering on.</p>`,
  demo:b=>{const o=(n,f)=>Array.from({length:n},(_,i)=>`<option value="${i}">${f(i)}</option>`).join('');TIN(b,'Try it: are two holes connected?',`<p style="margin:0 0 6px">Hole A: column <select id="ti_c1">${o(6,i=>i+1)}</select> row <select id="ti_r1">${o(10,i=>'abcdefghij'[i])}</select> &nbsp; Hole B: column <select id="ti_c2">${o(6,i=>i+1)}</select> row <select id="ti_r2">${o(10,i=>'abcdefghij'[i])}</select></p>`,v=>{const same=v('c1')===v('c2')&&(v('r1')<5)===(v('r2')<5);return same?'✅ <b>Connected</b>: same column, same half of the board.':'❌ <b>Not connected</b>: columns are joined only within rows a–e or f–j.'});},
  run:breadboard
 });
})();

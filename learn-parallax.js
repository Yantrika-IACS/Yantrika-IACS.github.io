/* ==========================================================
   YANTRIKA: "Learn through making" scroll scene (home page)

   One pinned, box-free, EDGE-TO-EDGE scene that plays as you scroll:
     1. the hero sinks DOWN and fades while the first word is arriving
     2. "Learn  through  making" is slammed in word by word, huge,
        each word dropping from above with a little overshoot
     3. the club message lights up word by word, like being read aloud
     4. 40+ / 14 / 2+ drop in one after another and count up
     5. behind everything, big gears turn with your scroll at different
        speeds (that is the parallax) and a hollow "MAKE" floats through;
        on wide screens extra gears fill the left and right sides
     6. the whole scene sinks downward while "Where we are now"
        slides up over it like a curtain

   The scene breaks out of the page column and spans the full browser
   width. All type scales up with the screen, so a 1920px laptop gets
   much bigger words and numbers than a phone.

   TO USE (two small edits in index.html):
   A) add this line next to your other <script src=...> lines, BEFORE the
      big inline <script>:
          <script src="learn-parallax.js"></script>
   B) in the home: template, replace the "Learning through making" card line
      AND the stats <div class="grid" ...> line (the two lines right after the
      hero) with:
          ${learnSec()}

   Nothing else changes. The event count (14) is read from EV, so it stays
   correct when you add events.
   ========================================================== */
(function(){
 /* ---------- tuning (change these numbers to taste) ---------- */
 const RUNWAY=360;       /* scroll length of the scene in screen heights x100 (bigger = slower) */
 const OVERLAP=55;       /* vh: how far "Where we are now" slides up over the scene */
 const HERO_SPEED=1.2;   /* above 1 = the hero visibly sinks down; below 1 = it just scrolls slower */
 const BG_SPEED=1.1;     /* same idea for the faded photo grid behind the hero */
 const TEXT='Yantrika is a student-led club that believes students learn best when they move beyond theory: work with real hardware, experiment, and solve problems together.';

 /* ---------- easings: back = overshoots then settles (the "slam") ---------- */
 const EZ={
  lin:t=>t,
  out:t=>1-Math.pow(1-t,3),
  back:t=>{const c1=1.9,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);}
 };

 /* ---------- gear shape (drawn once, reused) ---------- */
 function gearPath(ro,ri,n,hole){
  const step=2*Math.PI/n,P=(r,a)=>[(r*Math.cos(a)).toFixed(1),(r*Math.sin(a)).toFixed(1)];
  let d='';
  for(let i=0;i<n;i++){
   const a=i*step;
   d+=(i?'L':'M')+P(ri,a-.30*step)+'L'+P(ro,a-.17*step)+'L'+P(ro,a+.17*step)+'L'+P(ri,a+.30*step)
     +'A'+ri+' '+ri+' 0 0 1 '+P(ri,a+.70*step);
  }
  return d+'Z M'+hole+',0A'+hole+' '+hole+' 0 1 0 -'+hole+',0A'+hole+' '+hole+' 0 1 0 '+hole+',0Z';
 }
 const GEAR=gearPath(100,84,14,30);
 /* [css position + size + colour, spin over the whole scroll, drift, how far it sinks at the end] */
 const GEARS=[
  'left:-9vw;bottom:-14%;--w:clamp(200px,28vw,560px);--c:var(--red);--rot:520deg;--py:-9vh;--sink:70vh',
  'right:-5vw;top:2%;--w:clamp(170px,27vw,520px);--c:var(--bl);--rot:-560deg;--py:-5vh;--sink:48vh',
  'right:2vw;bottom:-12%;--w:clamp(90px,12vw,260px);--c:var(--cy);--rot:820deg;--py:-14vh;--sink:90vh'
 ];
 /* extra gears that only appear on wide screens, to fill the left and right sides */
 const WIDE_GEARS=[
  'left:3vw;top:-14%;--w:clamp(130px,15vw,340px);--c:var(--or);--rot:-700deg;--py:-12vh;--sink:60vh',
  'right:19vw;top:-12%;--w:clamp(100px,10vw,240px);--c:var(--yel);--rot:640deg;--py:-8vh;--sink:80vh'
 ];

 /* ---------- style ---------- */
 const css=`
 /* the scene is as wide as the browser window, not the 980px page column */
 .lm{--p:0;--e:0;--navh:64px;position:relative;z-index:2;width:100vw;height:${RUNWAY}vh;margin:0 0 -${OVERLAP}vh calc(50% - 50vw)}
 .lm-st{position:sticky;top:var(--navh);height:calc(100vh - var(--navh));height:calc(100svh - var(--navh));display:flex;align-items:center;justify-content:center;text-align:center;clip-path:inset(0 -100vw)}

 /* back layer */
 .lm-fx{position:absolute;inset:0;pointer-events:none;z-index:0;opacity:calc(var(--o,1) * (1 - var(--e) * .65))}
 .lm-bg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Permanent Marker',cursive;font-size:clamp(8rem,min(34vw,70vh),60rem);line-height:.8;color:transparent;-webkit-text-stroke:3px var(--ink);opacity:.09;user-select:none;transform:translateY(calc(var(--p) * 30vh - 15vh + var(--e) * 60vh))}
 .lm-g{position:absolute;width:var(--w);aspect-ratio:1;transform:translateY(calc(var(--e) * var(--sink) + var(--p) * var(--py))) rotate(calc(var(--p) * var(--rot)))}
 .lm-gw{display:none}
 .lm-g svg{display:block;width:100%;height:100%;overflow:visible}
 .lm-g path{fill:var(--c);fill-opacity:.16;stroke:var(--c);stroke-width:5;stroke-linejoin:round}
 .lm-g circle{fill:none;stroke:var(--c);stroke-width:3;stroke-dasharray:6 9;opacity:.7}

 /* front layer */
 .lm-in{position:relative;z-index:1;width:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:clamp(12px,3.2vh,40px);padding:0 clamp(14px,3vw,64px)}

 /* big words: grow with the screen, capped by height so they never overflow */
 .lm-h{margin:0;font-family:'Permanent Marker',cursive;font-weight:400;font-size:clamp(2.4rem,min(8.2vw,13.5vh),11rem);line-height:1.04;opacity:calc(1 - var(--e) * .6);transform:translateY(calc(var(--e) * 24vh))}
 .lm-h .w{display:inline-block;margin:0 .1em;opacity:var(--o,1);text-shadow:.04em .04em 0 var(--dk);transform:translateY(calc((1 - var(--k,1)) * -1.5em)) rotate(calc(var(--r,0deg) + (1 - var(--k,1)) * -12deg)) scale(calc(1 + (1 - var(--k,1)) * .3))}
 .lm-h .w1{--r:-3deg;color:var(--red)}
 .lm-h .w2{--r:1.5deg;color:var(--ink)}
 .lm-h .w3{--r:-2deg;color:var(--bl);font-size:1.28em}

 /* message: every word lights up as you scroll */
 .lm-p{max-width:min(100%,70rem);margin:0;font-size:clamp(1.02rem,min(2.3vw,2.9vh),2.2rem);font-weight:700;line-height:1.45;opacity:calc(var(--o,1) * (1 - var(--e) * .85));transform:translateY(calc(var(--e) * 38vh))}
 .lm-p .t{display:inline-block;opacity:calc(.13 + .87 * var(--a,1));transform:translateY(calc((1 - var(--a,1)) * .5em))}

 /* numbers: spread across the width */
 .lm-n{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(10px,4vw,120px);width:100%;max-width:1500px;opacity:calc(1 - var(--e) * .85);transform:translateY(calc(var(--e) * 54vh))}
 .lm-i{opacity:var(--o,1);transform:translateY(calc((1 - var(--k,1)) * -18vh)) scale(calc(1 + (1 - var(--k,1)) * .35))}
 .lm-i b{display:block;font-family:'Permanent Marker',cursive;font-weight:400;font-size:clamp(2.6rem,min(11vw,17vh),11rem);line-height:1;color:var(--c);text-shadow:.04em .04em 0 var(--dk)}
 .lm-i i{display:block;width:min(60%,220px);height:clamp(8px,.9vw,16px);margin:8px auto 4px;border:3px solid var(--dk);border-radius:8px;background:var(--c);transform:scaleX(var(--a,1))}
 .lm-i span{display:block;font-weight:700;font-size:clamp(.8rem,min(1.8vw,2.6vh),1.7rem)}

 /* the next block slides up over the scene like a curtain */
 .lm + .card{position:relative;z-index:3}
 /* keep animations.css from fading these (it would hide the tall scene) */
 .lm,.lm + .card{animation:none !important}
 .hero2,.bgal{will-change:translate,opacity}

 /* wide screens: extra gears fill the sides */
 @media(min-width:1100px){.lm-gw{display:block}}
 /* phones: one word per line so the text stays as big as possible */
 @media(max-width:600px){
  .lm-h{font-size:clamp(3rem,min(19vw,10.5vh),5rem)}
  .lm-h .w{display:block;margin:0}
  .lm-h .w3{font-size:1.15em}
  .lm-h br{display:none}
  .lm-g{width:calc(var(--w) * .7)}
 }
 /* reduced motion: show the finished scene, no pinning */
 .lm.lm-static{height:auto;margin-bottom:36px}
 .lm.lm-static .lm-st{position:static;height:auto;padding:48px 0}
 @media(prefers-reduced-motion:reduce){.lm{height:auto;margin-bottom:36px}.lm-st{position:static;height:auto;padding:48px 0}}`;
 if(!document.getElementById('lm-style')){
  const st=document.createElement('style');st.id='lm-style';st.textContent=css;document.head.appendChild(st);
 }

 /* ---------- the section's HTML (used by the home template) ---------- */
 /* data-s = scroll point where the item starts (0 to 1), data-d = how long it takes, data-e = easing */
 const it=(s,d,e)=>`data-s="${s}" data-d="${d}" data-e="${e}"`;
 window.learnSec=()=>{
  const ev=(typeof EV!=='undefined')?EV.length:14;
  const words=TEXT.split(' ');
  const msg=words.map((w,i)=>`<span class="t" ${it((.34+.16*i/(words.length-1)).toFixed(3),.07,'lin')}>${w}</span>`).join(' ');
  const gear=(g,c)=>`<div class="lm-g ${c}" style="${g}"><svg viewBox="-110 -110 220 220" aria-hidden="true"><path fill-rule="evenodd" d="${GEAR}"/><circle r="56"/></svg></div>`;
  const gears=GEARS.map(g=>gear(g,'')).join('')+WIDE_GEARS.map(g=>gear(g,'lm-gw')).join('');
  const num=(s,to,sfx,c,label,aria)=>`<div class="lm-i" role="group" aria-label="${aria}" style="--c:${c}" ${it(s,.09,'back')}><b data-to="${to}" data-sfx="${sfx}">${to}${sfx}</b><i></i><span>${label}</span></div>`;
  return `<section class="lm" id="lm" aria-label="Learn through making"><div class="lm-st">
   <div class="lm-fx" aria-hidden="true" ${it(0,.1,'lin')}><div class="lm-bg">MAKE</div>${gears}</div>
   <div class="lm-in">
    <h2 class="lm-h"><span class="w w1" ${it(.03,.10,'back')}>Learn</span> <span class="w w2" ${it(.09,.10,'back')}>through</span><br><span class="w w3" ${it(.15,.12,'back')}>making</span></h2>
    <p class="lm-p" ${it(.28,.06,'out')}>${msg}</p>
    <div class="lm-n">
     ${num(.54,40,'+','var(--red)','students per workshop','40 plus students per workshop')}
     ${num(.62,ev,'','var(--bl)','events, done and planned',ev+' events, done and planned')}
     ${num(.70,2,'+','var(--or)','community outreaches planned','2 plus community outreaches planned')}
    </div>
   </div></div></section>`;
 };

 /* ---------- scroll behaviour ---------- */
 function init(lm){
  const nav=document.getElementById('nav'),bg=document.getElementById('bgal');
  const hero=document.querySelector('.hero2');
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  /* every animated piece: its window in the scroll, its easing, and (for numbers) its counter */
  const items=[...lm.querySelectorAll('[data-s]')].map(el=>({
   el,s:+el.dataset.s,d:+el.dataset.d,f:EZ[el.dataset.e]||EZ.out,
   b:el.querySelector('[data-to]'),t:-1
  }));
  let tick=false;

  /* p = how far through the scene (0 to 1). Writes --a (linear), --k (eased, may overshoot), --o (quick fade-in) */
  const paint=p=>{
   for(const o of items){
    const t=Math.min(1,Math.max(0,(p-o.s)/o.d));
    if(t===o.t)continue;
    o.t=t;
    const st=o.el.style;
    st.setProperty('--a',t.toFixed(3));
    st.setProperty('--k',o.f(t).toFixed(3));
    st.setProperty('--o',Math.min(1,t*4).toFixed(3));
    if(o.b)o.b.textContent=Math.round(+o.b.dataset.to*EZ.out(t))+(o.b.dataset.sfx||'');
   }
  };

  if(reduce){
   lm.classList.add('lm-static');
   paint(.8);
   lm.style.setProperty('--p','.8');
   return;
  }

  const update=()=>{
   tick=false;
   if(!lm.isConnected){
    removeEventListener('scroll',req);removeEventListener('resize',req);
    if(bg&&!document.getElementById('lm')){bg.style.translate='';bg.style.opacity='';}
    return;
   }
   const y=scrollY,V=innerHeight,navH=nav?nav.offsetHeight:64;
   lm.style.setProperty('--navh',navH+'px');
   const stageH=V-navH,lead=V*.5,r=lm.getBoundingClientRect();
   const range=r.height-stageH+lead;
   const p=Math.min(1,Math.max(0,(navH+lead-r.top)/range));
   /* the exit starts exactly when "Where we are now" begins to appear, on any screen size */
   const x0=Math.max(.7,1-(OVERLAP*V/100)/range-.01);
   const e=p<=x0?0:(p-x0)/(1-x0);
   lm.style.setProperty('--p',p.toFixed(4));
   lm.style.setProperty('--e',e.toFixed(4));
   paint(p);
   /* parallax: hero and photo grid sink while fading, so the big words arrive onto a clean stage.
      They stop moving once fully faded (ys): a transform that kept growing with the scroll would
      keep stretching the page, and the footer would never be the end of the scroll. */
   const hh=hero?(hero.offsetHeight||520):520,k=Math.min(1,y/(hh*.9)),ys=Math.min(y,hh*.9);
   if(hero){
    hero.style.translate='0 '+(ys*HERO_SPEED).toFixed(1)+'px';
    hero.style.opacity=(1-k).toFixed(3);
    hero.style.pointerEvents=k>=1?'none':'';
   }
   if(bg){
    bg.style.translate='0 '+(ys*BG_SPEED).toFixed(1)+'px';
    bg.style.opacity=(1-k).toFixed(3);
   }
  };
  const req=()=>{if(!tick){tick=true;requestAnimationFrame(update);}};
  addEventListener('scroll',req,{passive:true});
  addEventListener('resize',req);
  update();
 }

 /* the page is re-drawn on every navigation, so look for the section each time */
 const app=document.getElementById('app');
 const check=()=>{const lm=document.getElementById('lm');if(lm&&!lm.__lm){lm.__lm=1;init(lm);}};
 if(app){new MutationObserver(check).observe(app,{childList:true});check();}
})();

/* ==========================================================
   YANTRIKA: "Learn through making" parallax section (home page)
   Replaces the small card + the three stat boxes with one big,
   box-free scroll scene:
     1. the hero slides down slowly (parallax) and fades as you scroll
     2. "Learn / through / making" drops in word by word, huge
     3. the message arrives under it
     4. 40+ / 14 / 2+ drop in one after another and count up
     5. the whole scene sinks downward while "Where we are now"
        slides up over it like a curtain

   TO USE (two small edits in index.html):
   A) add this line next to your other <script src=...> lines, BEFORE the
      big inline <script>:
          <script src="learn-parallax.js"></script>
   B) in the home: template, replace the "Learning through making" card line
      AND the stats <div class="grid" ...> line (the two lines right after the
      hero) with:
          ${learnSec()}
   ========================================================== */
(function(){
 /* ---------- tuning (change these numbers to taste) ---------- */
 const RUNWAY='300vh';      /* total scroll length of the scene (bigger = slower) */
 const OVERLAP='55vh';      /* how far "Where we are now" slides up over the scene */
 const HERO_SPEED=1.2;      /* hero sinks at this fraction of the scroll speed */
 const BG_SPEED=1.1;         /* photo background sinks at this fraction */

 /* ---------- style ---------- */
 const css=`
 .lm{--p:0;--navh:64px;--e:clamp(0,calc((var(--p) - .82)/.18),1);position:relative;z-index:2;height:${RUNWAY};margin:0 0 -${OVERLAP}}
 .lm-st{position:sticky;top:var(--navh);height:calc(100vh - var(--navh));height:calc(100svh - var(--navh));display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden}
 .lm-bg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;font-family:'Permanent Marker',cursive;font-size:clamp(8rem,34vw,26rem);line-height:.8;color:var(--ink);opacity:.05;pointer-events:none;user-select:none;transform:translateY(calc(var(--p) * 28vh - 14vh))}
 .lm-in{position:relative;width:100%;display:flex;flex-direction:column;align-items:center;gap:clamp(14px,3vh,34px);padding:0 4px}
 .lm-h{margin:0;font-family:'Permanent Marker',cursive;font-weight:400;font-size:clamp(2.6rem,8.6vw,6.6rem);line-height:1.02}
 .lm-h .w{display:inline-block;margin:0 .12em;opacity:var(--a);transform:translateY(calc((1 - var(--a)) * -1.2em + var(--e) * 26vh));text-shadow:4px 4px 0 var(--dk)}
 .lm-h .w1{--a:clamp(0,calc((var(--p) - .02)/.10),1);color:var(--red)}
 .lm-h .w2{--a:clamp(0,calc((var(--p) - .08)/.10),1);color:var(--ink)}
 .lm-h .w3{--a:clamp(0,calc((var(--p) - .14)/.10),1);color:var(--bl)}
 .lm-p{--a:clamp(0,calc((var(--p) - .26)/.12),1);max-width:660px;margin:0;font-size:clamp(1.05rem,2.4vw,1.5rem);font-weight:700;opacity:calc(var(--a) * (1 - var(--e) * .85));transform:translateY(calc((1 - var(--a)) * -40px + var(--e) * 36vh))}
 .lm-n{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(10px,3vw,48px);width:100%;max-width:920px}
 .lm-i{opacity:calc(var(--a) * (1 - var(--e) * .85));transform:translateY(calc((1 - var(--a)) * -60px + var(--e) * 48vh))}
 .lm-i:nth-child(1){--a:clamp(0,calc((var(--p) - .40)/.12),1)}
 .lm-i:nth-child(2){--a:clamp(0,calc((var(--p) - .52)/.12),1)}
 .lm-i:nth-child(3){--a:clamp(0,calc((var(--p) - .64)/.12),1)}
 .lm-i b{display:block;font-family:'Permanent Marker',cursive;font-weight:400;font-size:clamp(2.6rem,11vw,7.5rem);line-height:1;color:var(--c);text-shadow:4px 4px 0 var(--dk)}
 .lm-i span{display:block;margin-top:4px;font-weight:700;font-size:clamp(.8rem,1.8vw,1.15rem)}
 /* the next block slides up over the scene like a curtain */
 .lm + .card{position:relative;z-index:3}
 /* keep animations.css from fading these (it would hide the tall scene) */
 .lm,.lm + .card{animation:none !important}
 .hero2,.bgal{will-change:transform}
 /* reduced motion: show the finished scene, no pinning */
 .lm.lm-static{height:auto;margin-bottom:36px}
 .lm.lm-static .lm-st{position:static;height:auto;padding:48px 0}
 @media(prefers-reduced-motion:reduce){.lm{height:auto;margin-bottom:36px}.lm-st{position:static;height:auto;padding:48px 0}}`;
 if(!document.getElementById('lm-style')){
  const st=document.createElement('style');st.id='lm-style';st.textContent=css;document.head.appendChild(st);
 }

 /* ---------- the section's HTML (used by the home template) ---------- */
 window.learnSec=()=>{
  const ev=(typeof EV!=='undefined')?EV.length:14;
  return `<section class="lm" id="lm" aria-label="Learn through making"><div class="lm-st">
   <div class="lm-bg" aria-hidden="true">MAKE</div>
   <div class="lm-in">
    <h2 class="lm-h"><span class="w w1">Learn</span> <span class="w w2">through</span> <span class="w w3">making</span></h2>
    <p class="lm-p">Yantrika is a student-led club that believes students learn best when they move beyond theory: work with real hardware, experiment, and solve problems together.</p>
    <div class="lm-n">
     <div class="lm-i" style="--c:var(--red)"><b data-to="40" data-sfx="+">40+</b><span>students per workshop</span></div>
     <div class="lm-i" style="--c:var(--bl)"><b data-to="${ev}" data-sfx="">${ev}</b><span>events, done and planned</span></div>
     <div class="lm-i" style="--c:var(--or)"><b data-to="2" data-sfx="+">2+</b><span>community outreaches planned</span></div>
    </div>
   </div></div></section>`;
 };

 /* ---------- scroll behaviour ---------- */
 function init(lm){
  const nav=document.getElementById('nav'),bg=document.getElementById('bgal');
  const hero=document.querySelector('.hero2');
  const ns=[...lm.querySelectorAll('[data-to]')],START=[.40,.52,.64];
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let tick=false;

  const paint=p=>{
   lm.style.setProperty('--p',p.toFixed(4));
   ns.forEach((n,i)=>{
    const t=Math.min(1,Math.max(0,(p-START[i])/.2)),e=1-Math.pow(1-t,3);
    n.textContent=Math.round(+n.dataset.to*e)+(n.dataset.sfx||'');
   });
  };

  if(reduce){lm.classList.add('lm-static');paint(.82);return;}

  const update=()=>{const hh=hero?(hero.offsetHeight||520):520,k=Math.min(1,y/(hh*.9));
if(hero){
 hero.style.transform='translate3d(0,'+(y*HERO_SPEED).toFixed(1)+'px,0)';
 hero.style.opacity=(1-k).toFixed(3);
}
if(bg){
 bg.style.transform='translate3d(0,'+(y*BG_SPEED).toFixed(1)+'px,0)';
 bg.style.opacity=(1-k).toFixed(3);
}
   }
   const y=scrollY,V=innerHeight,navH=nav?nav.offsetHeight:64;
   lm.style.setProperty('--navh',navH+'px');
   const stageH=V-navH,lead=V*.5,r=lm.getBoundingClientRect();
   const p=Math.min(1,Math.max(0,(navH+lead-r.top)/(r.height-stageH+lead)));
   paint(p);
   /* parallax: the hero and the photo background sink more slowly than the page */
   if(hero){
    const hh=hero.offsetHeight||520,k=Math.min(1,y/(hh*.9));
    hero.style.transform='translate3d(0,'+(y*HERO_SPEED).toFixed(1)+'px,0)';
    hero.style.opacity=(1-k).toFixed(3);
   }
   if(bg)bg.style.transform='translate3d(0,'+(y*BG_SPEED).toFixed(1)+'px,0)';
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

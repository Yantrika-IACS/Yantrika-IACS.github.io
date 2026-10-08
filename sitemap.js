<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Crect%20x%3D%223%22%20y%3D%223%22%20width%3D%2258%22%20height%3D%2258%22%20rx%3D%2214%22%20fill%3D%22%23f1c40f%22%20stroke%3D%22%2317171d%22%20stroke-width%3D%225%22/%3E%3Cpath%20d%3D%22M18%2017L32%2035L46%2017M32%2035V50%22%20fill%3D%22none%22%20stroke%3D%22%23ec3750%22%20stroke-width%3D%229%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E">
<title>YANTRIKA | Robotics & Coding Club, IACS Kolkata</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Permanent+Marker&display=swap" rel="stylesheet">
<style>
:root{--red:#ec3750;--yel:#f1c40f;--cy:#33d6a6;--bl:#338eda;--or:#ff8c37;--pk:#ff5a5f;--dk:#17171d;--bg:#f9f9f9;--card:#fff;--ink:#17171d;--soft:#f1f1f1;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#101015;--card:#1e1e26;--ink:#f4f4f4;--soft:#2a2a34;--dk:#000}}
:root[data-theme="dark"]{--bg:#101015;--card:#1e1e26;--ink:#f4f4f4;--soft:#2a2a34;--dk:#000}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
body{background:var(--bg);background-image:radial-gradient(rgba(128,128,128,.45) 1px,transparent 1px);background-size:24px 24px;font-family:'Space Grotesk',system-ui,sans-serif;color:var(--ink);margin:0;line-height:1.6;position:relative;overflow-x:hidden}
.c{max-width:980px;margin:0 auto;padding:0 20px 40px;position:relative;z-index:1}
.m{font-family:'Permanent Marker',cursive,sans-serif}
h1,h2,h3{margin-top:0}a{color:inherit}
/* background photo gallery (home only) */
.bgal{position:absolute;top:0;left:0;right:0;height:720px;z-index:0;pointer-events:none;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);gap:8px;padding:8px;box-sizing:border-box;-webkit-mask-image:linear-gradient(to bottom,#000 0%,#000 40%,transparent 95%);mask-image:linear-gradient(to bottom,#000 0%,#000 40%,transparent 95%)}
.bgal .gt{border:3px solid var(--dk);border-radius:10px;overflow:hidden;opacity:.8;min-height:0}
.bgal img{width:100%;height:100%;object-fit:cover;display:block}
.hero2{min-height:520px;display:flex;align-items:center;justify-content:center;text-align:center;margin-bottom:50px}
.hero2 .txt{background:radial-gradient(ellipse at center,color-mix(in srgb,var(--bg) 92%,transparent) 35%,transparent 72%);padding:40px 50px}
.ytitle{font-size:clamp(3.5rem,13vw,8.5rem);line-height:1;color:var(--red);text-shadow:5px 5px 0 var(--dk);margin:0 0 14px}
.ytitle img{display:block;margin:0 auto;width:min(100%,640px);height:auto}
.hero2 h2{font-size:clamp(1.5rem,4vw,2.4rem);margin-bottom:6px}
nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:9;background:var(--yel);border-bottom:4px solid var(--dk);margin:0 -20px 36px;padding:10px 20px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
nav .logo{font-size:1.5rem;color:#17171d;text-decoration:none;margin-right:auto}
nav a.l{color:#17171d;font-weight:700;text-decoration:none;padding:4px 12px;border:3px solid transparent;border-radius:8px}
nav a.l:hover,nav a.l.on{border-color:var(--dk);background:#fff}
.card{border:4px solid var(--dk);border-radius:12px;box-shadow:8px 8px 0 var(--dk);padding:28px;margin-bottom:36px;background:var(--card)}
.tag{display:inline-block;background:var(--yel);color:#17171d;padding:5px 15px;border:2px solid var(--dk);border-radius:20px;font-weight:700;margin:5px}
.btn{display:inline-block;background:var(--yel);color:#17171d;border:3px solid var(--dk);border-radius:8px;padding:6px 14px;font:inherit;font-weight:700;text-decoration:none;box-shadow:4px 4px 0 var(--dk);cursor:pointer;margin:4px 6px 4px 0}
.btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--dk)}
.btn.cy{background:var(--cy)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px}
.box{border:3px solid var(--dk);border-radius:10px;box-shadow:5px 5px 0 var(--dk);padding:18px;background:var(--card);transition:transform .15s ease}
.box:hover{transform:translate(-3px,-3px)}
.badge{display:inline-block;border:2px solid var(--dk);border-radius:20px;padding:1px 12px;font-weight:700;font-size:.82rem;color:#17171d}
.done{background:var(--cy)}.plan{background:var(--yel)}.prop{background:var(--or)}
.tl{border-left:6px solid var(--dk);padding-left:20px;margin-left:20px}
.ti{position:relative;padding:10px;margin-bottom:8px;border-radius:8px}
.ti:hover{background:var(--yel);color:#17171d}
.ti::before{content:'';position:absolute;left:-36px;top:16px;width:20px;height:20px;background:var(--or);border:3px solid var(--dk);border-radius:50%}
.stat{text-align:center}.stat b{display:block;font-size:2.4rem;font-family:'Permanent Marker',cursive}
.band{background:var(--cy);color:#17171d;text-align:center}
.foot{background:var(--yel);color:#17171d;text-align:center;font-weight:700}
.pill{display:inline-flex;margin:4px;padding:8px 16px;border:3px solid var(--dk);border-radius:20px;background:var(--yel);color:#17171d;font-weight:700}
#q{width:100%;max-width:420px;border:3px solid var(--dk);border-radius:8px;padding:9px 14px;font:inherit;font-weight:700;background:var(--card);color:var(--ink);box-shadow:4px 4px 0 var(--dk);margin-bottom:16px}
input,textarea{font:inherit}
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin-top:16px}
.gal img,.ph{width:100%;aspect-ratio:4/3;object-fit:cover;border:3px solid var(--dk);border-radius:8px;box-sizing:border-box}
.ph{display:flex;align-items:center;justify-content:center;text-align:center;padding:10px;background:var(--soft);border-style:dashed;font-size:.85rem}
.poster{aspect-ratio:3/4;border:4px solid var(--dk);border-radius:8px;box-shadow:6px 6px 0 var(--dk);color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:22px;box-sizing:border-box;max-width:420px}
.poster img{width:100%;height:100%;object-fit:cover}
.poster.has{padding:0;overflow:hidden}
.poster h2{font-size:2rem;text-shadow:3px 3px 0 var(--dk);margin:0}
a.ev{text-decoration:underline wavy var(--red)}
.tbwrap{border:3px solid var(--dk);border-radius:10px;overflow:hidden;margin-top:16px}
typebot-standard{display:block;width:100%;height:600px}
.upi{font-size:1.3rem;word-break:break-all;background:var(--soft);border:3px dashed var(--dk);border-radius:8px;padding:10px 14px;margin:10px 0;font-weight:700}
@media(max-width:600px){.c{padding-left:14px;padding-right:14px}nav{margin-left:-14px;margin-right:-14px}.card{padding:20px}nav .logo{width:100%;margin-right:0}.bgal{height:560px}.hero2{min-height:420px}.hero2 .txt{padding:30px 10px}}

/*CSS part*/
.slider{overflow:hidden;margin:20px -28px;padding:6px 0;-webkit-mask-image:linear-gradient(to right,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(to right,transparent,#000 8%,#000 92%,transparent)}
.track{display:flex;width:max-content;animation:slide 45s linear infinite}
.slider:hover .track{animation-play-state:paused}
.sl{flex:0 0 auto;width:240px;aspect-ratio:4/3;margin-right:14px;border:3px solid var(--dk);border-radius:10px;overflow:hidden;box-shadow:4px 4px 0 var(--dk)}
.sl img{width:100%;height:100%;object-fit:cover;display:block}
@keyframes slide{to{transform:translateX(-50%)}}
@media(max-width:600px){.slider{margin-left:-20px;margin-right:-20px}.sl{width:180px}}
@media(prefers-reduced-motion:reduce){.track{animation:none}.slider{overflow-x:auto}}
.vid{position:relative;border:4px solid var(--dk);border-radius:20px;box-shadow:8px 8px 0 var(--dk);overflow:hidden;background:#000;margin:0 0 40px;line-height:0}
.vid video{width:100%;display:block;max-height:80vh;background:#000}
.vid .btn{position:absolute;right:14px;bottom:14px;margin:0;line-height:1.4}
.cta{position:relative;margin:0 0 36px;min-height:320px;display:flex;align-items:center}
.cta .slider{margin:0 -20px;width:calc(100% + 40px)}
.cta .sl{width:300px}
.cta .ov{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:10px;pointer-events:none;background:radial-gradient(ellipse at center,color-mix(in srgb,var(--bg) 88%,transparent) 30%,transparent 70%)}
.cta .ov h2{font-size:clamp(2rem,7vw,4.5rem);color:var(--red);text-shadow:4px 4px 0 var(--dk);margin:0 0 6px}
.cta .ov p{font-weight:700;margin:0 0 10px}
.cta .ov .btn{pointer-events:auto}
@media(max-width:600px){.cta .slider{margin:0 -14px;width:calc(100% + 28px)}.cta .sl{width:200px}.cta{min-height:260px}}
/*CSS part end*/

/* About page: interactive pillars */
.pil{display:block;width:100%;text-align:left;font:inherit;cursor:pointer;border:3px solid var(--dk);border-radius:10px;box-shadow:5px 5px 0 var(--dk);padding:18px;transition:transform .15s ease,box-shadow .15s ease}
.pil:hover{transform:translate(-3px,-3px);box-shadow:8px 8px 0 var(--dk)}
.pil[aria-pressed="true"]{transform:translate(4px,4px);box-shadow:1px 1px 0 var(--dk)}
.pil small{display:block;margin-top:8px;font-weight:700}
.pil:focus-visible,.chip:focus-visible,.btn:focus-visible{outline:3px solid var(--bl);outline-offset:3px}
.pp.open{animation:pop .25s ease}
@keyframes pop{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.chip{border:3px solid var(--dk);border-radius:20px;background:var(--card);color:var(--ink);font:inherit;font-weight:700;padding:6px 14px;cursor:pointer;margin:4px 6px 4px 0;box-shadow:3px 3px 0 var(--dk)}
.chip[aria-pressed="true"]{background:var(--yel);color:#17171d}
.info{background:var(--soft);border:3px dashed var(--dk);border-radius:10px;padding:14px;margin-top:12px}
.slots{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0}
.slot{width:64px;height:64px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;border:3px dashed var(--dk);border-radius:10px;opacity:.35;transition:opacity .2s,background .2s}
.slot.on{opacity:1;border-style:solid;background:var(--yel);box-shadow:3px 3px 0 var(--dk)}
.bar{height:16px;border:3px solid var(--dk);border-radius:10px;overflow:hidden;background:var(--soft);max-width:420px}
.bar i{display:block;height:100%;width:0;background:var(--cy);transition:width .3s}
#rx{width:100%;padding:28px 14px;font-size:1.3rem;margin:12px 0 6px}
.dbwrap{display:flex;justify-content:center;margin:12px 0;padding:0;height:auto;overflow:visible}
dbox-widget{display:block;width:100%;max-width:560px;margin:0 auto}
dbox-widget iframe{max-width:100%!important;border:0}
button.tag{font:inherit;font-weight:700;cursor:pointer;box-shadow:3px 3px 0 var(--dk);transition:transform .15s ease}
button.tag:hover{transform:translate(-2px,-2px)}
button.tag[aria-pressed="true"]{background:var(--pc);color:var(--pf);transform:translate(2px,2px);box-shadow:1px 1px 0 var(--dk)}
button.tag:focus-visible{outline:3px solid var(--bl);outline-offset:3px}
.pp{scroll-margin-top:90px}
@media(prefers-reduced-motion:reduce){button.tag{transition:none}}
@media(prefers-reduced-motion:reduce){.pp.open{animation:none}.pil,.slot,.bar i{transition:none}}

/* Prisoner's Dilemma */
.pdm{border-collapse:collapse;margin:12px 0;text-align:center;max-width:100%}
.pdm th,.pdm td{border:3px solid var(--dk);padding:8px 12px}
.pdm td{transition:background .2s}
.pdm td.hl{background:var(--yel);color:#17171d;font-weight:700;animation:pop .3s ease}
.pdo{display:block;width:100%;text-align:left;font:inherit;cursor:pointer;background:var(--card);color:var(--ink);border:3px solid var(--dk);border-radius:10px;box-shadow:4px 4px 0 var(--dk);padding:12px;transition:transform .15s ease}
.pdo:hover{transform:translate(-3px,-3px)}
.pdo b{font-size:1.1rem}.pdo span{font-size:1.8rem;float:right}
.pdgo{font-size:1.15rem;padding:14px 20px;flex:1 1 200px;margin:6px 0}
.pdgo.d{background:var(--red);color:#fff}
.pdgo:disabled{opacity:.45;cursor:wait;transform:none}
.pdsc{display:flex;gap:14px;flex-wrap:wrap;margin:10px 0}
.pdsc>div{flex:1 1 200px}
.pdsc .bar{max-width:none;margin-top:4px}
.pdsc .bar i.o{background:var(--or)}
.hist{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.hr{border:2px solid var(--dk);border-radius:8px;padding:0 8px;background:var(--card);font-size:1.1rem}
.pdbig{font-size:1.15rem;min-height:3.2em}
.shake{animation:shk .35s}
@keyframes shk{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@media(prefers-reduced-motion:reduce){.pdm td.hl,.shake{animation:none}.pdo{transition:none}}
.sg{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:360px;margin:12px 0}
.sg button{height:90px;border:3px solid var(--dk);border-radius:12px;box-shadow:4px 4px 0 var(--dk);cursor:pointer;transition:filter .1s,transform .1s}
.echo{position:relative;height:60px;border:3px solid var(--dk);border-radius:10px;background:var(--soft);overflow:hidden}
.echo #wl{transition:left .1s}
.pdo[aria-pressed="true"]{transform:translate(3px,3px);box-shadow:1px 1px 0 var(--dk)}
</style>
<link rel="stylesheet" href="animations.css">
</head>
<body>
<div class="bgal" id="bgal"></div>
<div class="c"><nav id="nav"></nav><main id="app"></main></div>
<script>
const EV=[
{id:'induction',d:'20 Aug 2026',t:'Induction Session',s:'done',n:6,x:"Introduced students to Yantrika's vision and basic technical concepts. Around 40+ students attended."},
{id:'workshop-1',d:'28 Sep 2026',t:'Hands-on Robotics Workshop I',s:'done',n:8,x:'Interactive session introducing practical robotics and electronics.'},
{id:'expert-talks',d:'29 Oct 2026',t:'Expert Talks',s:'plan',x:'Planned interactions with IIEST professors offering technical insights.'},
{id:'workshop-2',d:'31 Oct 2026',t:'Hands-on Robotics Workshop II',s:'plan',x:'Follow-up practical workshop building on the initial exposure.'},
{id:'schools-outreach',d:'Dec 2026',t:'Schools Outreach',s:'prop',x:'A free hands-on workshop for approx. 70 underprivileged students.'},
{id:'robotics-hackathon',d:'Jan 2027',t:'Robotics Hackathon',s:'prop',x:'A hardware and software challenge for 100+ participants.'},
{id:'game-theory-hackathon',d:'Feb 2027',t:'Game Theory Hackathon',s:'prop',x:'Strategy, logic, and problem-solving challenges.'},
{id:'ai-robotics-workshop',d:'Mar 2027',t:'AI & Robotics Workshop',s:'prop',x:'An applied, hands-on technical learning session.'},
{id:'technical-hackathon',d:'Apr 2027',t:'Technical Hackathon',s:'prop',x:'Designing and building intelligent systems.'},
{id:'prototyping-session',d:'May 2027',t:'Prototyping Session',s:'prop',x:'Supporting student-led technical projects.'},
{id:'talks-mentorship',d:'Jun 2027',t:'Talks & Mentorship',s:'prop',x:'Connecting students with engineers and researchers.'},
{id:'summer-camp',d:'Jul 2027',t:'Summer Robotics Camp',s:'prop',x:'An immersive robotics learning programme.'},
{id:'team-challenge',d:'Aug 2027',t:'Team Challenge',s:'prop',x:'A collaborative and competitive robotics event.'},
{id:'semester-outreach',d:'Sep 2027',t:'Semester Outreach',s:'prop',x:'A community technology workshop for local youth.'}
];
const ST={done:['Completed','done'],plan:['Upcoming','plan'],prop:['Coming 2026-27','prop']};
const MAT=[
{t:'Induction Session Deck',k:'Slides',d:'Vision and basics of robotics and electronics.',u:'materials/induction-session.pdf'},
{t:'Workshop I Slides',k:'Slides',d:'First practical robotics and electronics workshop.',u:'materials/workshop-1-slides.pdf'},
{t:'Workshop I Code Examples',k:'Code',d:'Starter sketches from the workshop.',u:'materials/workshop-1-code.pdf'},
{t:'Arduino UNO Datasheet',k:'Docs',d:'Quick pin reference for our kits.',u:'materials/arduino-uno-datasheet.pdf'},
{t:'Arduino Nano Pinout',k:'Circuits',d:'Quick pin reference for our kits.',u:'materials/arduino-nano-pinout.pdf'},
{t:'Ultrasonic Sensor Wiring',k:'Circuits',d:'Wiring and example code for obstacle detection.',u:'materials/ultrasonic-sensor-wiring.pdf'},
{t:'Arduino Circuit Simulation',k:'Docs',d:'A Beginner’s Guide to SimulIDE',u:'materials/ROBO_101.pdf'},
{t:'Component Datasheets',k:'Docs',d:'Datasheets for sensors, drivers and modules.',u:'materials/component-datasheets.pdf'},
{t:'LiPo Battery Safety Sheet',k:'Docs',d:'Charging, storage and handling rules.',u:'materials/lipo-safety.pdf'},
{t:'Event Posters',k:'Posters',d:'Posters for all Yantrika events.',u:'materials/event-posters.pdf'}
];
const TEAM={
adv:[['Prof. Rajarshi Ray','Faculty Advisor','','https://scholar.google.com/citations?user=IfVWgecAAAAJ&hl=en']],
core:[['Pritam Dutta','President','pritamdutta.pixel@gmail.com','https://dutta-pritam.github.io/'],['Arnab Roy','Secretary','ug24ar3219@iacs.res.in','https://github.com/arOy1011'],['Sudeep Das','Treasurer','ug24sd3240@iacs.res.in',''],['Aniket Dinda','PR and Outreach Head','ug25ad3412@iacs.res.in','https://github.com/001-Long-Fingers']],
lead:[['Akshat Chakerverty','Chief Editor','','http://github.com/Akshat-Chakarverty'],['Rwitinkar Sinha','Media and Technical Lead'],['Sampreet Das','Content Lead']],
back:['Dipchandan Bera','Aryan Lohar','Debarpan','Arjun M','Aditya Menon','Bhaskar Das']
};
const LINKS={web:'https://yantrika-iacs.github.io/',mail:'iacsroboticsclub@gmail.com',ig:'https://www.instagram.com/yantrika_official/',li:'https://www.linkedin.com/company/yantrika-iacs/'};
/* DONATE: put your real UPI ID here (and optionally a QR image at images/donate-qr.png) */
const DON={upi:'yantrika5100@pnb',qr:'images/donate-qr.png'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PAGES=[['home','Home'],['about','About'],['games','Games'],['events','Events'],['materials','Materials'],['team','Team'],['join','Join'],['donate','Donate']];
const PC=['#ec3750','#338eda','#ff8c37','#33d6a6','#ff5a5f','#8e44ad'];

/* HERO GALLERY: replace these 16 image URLs (relative paths or full https links) */
const G=[
 'images/intro-1.png','images/workshop-1-1.jpg','images/Intro-4.png','images/induction-1.jpg',
 'images/workshop-1-2.jpg','images/intro-2.png','images/workshop-1-5.jpg','images/Intro-5.png',
 'images/induction-2.jpg','images/workshop-1-3.jpg','images/intro-3.png','images/workshop-1-6.jpg',
 'images/Intro-6.png','images/workshop-1-4.jpg','images/induction-3.jpg','images/workshop-1-7.jpg'
];
const gal=()=>G.map((u,i)=>`<div class="gt" style="background:${PC[i%6]}">${u?`<img src="${u}" alt="Yantrika gallery photo ${i+1}" loading="lazy" onerror="this.remove()">`:''}</div>`).join('');

const slides=()=>G.filter(Boolean).map((u,i)=>`<div class="sl" style="background:${PC[i%6]}"><img src="${u}" alt="Yantrika photo ${i+1}" loading="lazy" onerror="this.remove()"></div>`).join('');

const evCard=e=>`<a class="box" href="#/${e.id}" style="display:block;text-decoration:none;color:inherit"><span class="badge ${ST[e.s][1]}">${ST[e.s][0]}</span><h3 class="m" style="margin:8px 0 2px">${esc(e.t)}</h3><b>${e.d}</b><p style="margin:6px 0 0">${esc(e.x)}</p><small><b>${e.s==='done'?'See photos':'See poster'} &rarr;</b></small></a>`;
const person=p=>`<div class="box"><b style="font-size:1.1rem">${esc(p[0])}</b><br>${esc(p[1])}<div style="margin-top:8px;font-size:1.2rem">${p[2]?`<a href="mailto:${p[2]}" title="Email" style="text-decoration:none;margin-right:8px">✉️</a>`:''}${p[3]?`<a href="${p[3]}" target="_blank" rel="noopener" title="Website" style="text-decoration:none">🌐</a>`:''}</div></div>`;

/* About page pillars: the four buttons */
const PIL=[
 {k:'learn',t:'Learn',c:'var(--red)',f:'#fff',d:'Workshops and talks that turn theory into practice.'},
 {k:'build',t:'Build',c:'var(--bl)',f:'#fff',d:'Real hardware, real projects, student-led.'},
 {k:'compete',t:'Compete',c:'var(--or)',f:'#17171d',d:'Hackathons and team challenges.'},
 {k:'share',t:'Share',c:'var(--cy)',f:'#17171d',d:'Outreach to schools and local youth.'}
];

const V={
home:()=>`<div class="hero2"><div class="txt"><h1 class="m ytitle"><img src="images/text.png" alt="YANTRIKA" onerror="this.replaceWith(document.createTextNode('YANTRIKA'))"></h1><h2>Robotics &amp; Coding Club</h2><p><b>RSA, Indian Association for the Cultivation of Science (IACS), Kolkata</b></p>${PIL.map(p=>`<button class="tag" type="button" aria-pressed="false" data-k="${p.k}" style="--pc:${p.c};--pf:${p.f}">${p.t.toUpperCase()}.</button>`).join('')}<small style="display:block"><b>Tap a word to see its games</b></small><p style="margin-top:18px"><a class="btn" href="#/join">Join the club</a><a class="btn cy" href="#/events">See events</a></p></div></div>
<div class="card"><h2 class="m">Learning through making</h2><p>Yantrika is a student-led club that believes students learn best when they move beyond theory: work with real hardware, experiment, and solve problems together.</p></div>
<div class="grid" style="margin-bottom:36px"><div class="box stat"><b style="color:var(--red)">40+</b>students per workshop</div><div class="box stat"><b style="color:var(--bl)">14</b>events, done and planned</div><div class="box stat"><b style="color:var(--or)">2+</b>community outreaches planned</div></div>
<div class="card"><h2 class="m">Where we are now</h2><div class="tl">${EV.filter(e=>e.s!=='prop').map(e=>`<div class="ti"><b>${e.d} | <a class="ev" href="#/${e.id}">${esc(e.t)}</a></b> <span class="badge ${ST[e.s][1]}">${ST[e.s][0]}</span><br>${esc(e.x)}</div>`).join('')}</div><a class="btn" href="#/events">All events &rarr;</a></div>
<h2 class="m">Promo Video</h2><div class="vid"><video id="pv" src="images/intro_vid.mp4" autoplay muted loop playsinline preload="metadata">Your browser does not support video.</video><button class="btn" id="pm" type="button" aria-label="Mute or unmute video">&#128263; Unmute</button></div>
<div class="cta"><div class="slider"><div class="track">${slides()}${slides()}</div></div><div class="ov"><h2 class="m">COME BUILD WITH US....</h2><p>No experience needed. Curiosity is enough.</p><a class="btn" href="#/join">Join Yantrika &rarr;</a></div></div>`,
about:()=>`<div class="card"><h1 class="m">About Yantrika</h1><p>Yantrika is the Robotics &amp; Coding Club of the Research Scholars' Association at IACS, Kolkata. We run workshops, hackathons, talks and outreach so that more students can get hands-on with robotics, electronics and code.</p></div>
<h2 class="m">Our four pillars</h2>
<div class="grid" style="margin-bottom:24px">${PIL.map(p=>`<button class="pil" type="button" aria-pressed="false" data-k="${p.k}" style="background:${p.c};color:${p.f}"><h3 class="m" style="margin:0 0 6px">${p.t}</h3>${p.d}<small>See games &rarr;</small></button>`).join('')}</div>
<p><a class="btn cy" href="#/games">Open the full Games Arcade &rarr;</a></p>
<div class="card"><h2 class="m">What we aim for</h2><ul><li>500-800+ student participations across events.</li><li>100+ active hackers in competitive problem-solving.</li><li>2+ outreaches for underprivileged and local youth.</li><li>Reusable equipment that stays with the club for future batches.</li></ul></div>`,
games:()=>`<div class="card"><h1 class="m">Games Arcade</h1><p>Every game here connects to a Yantrika event. Pick a pillar, play, then jump to the event it prepares you for.</p><div id="gf"></div></div><div class="grid" id="gg" style="margin-bottom:36px"></div><div class="card pp" id="gp" hidden aria-live="polite"></div>`,
events:()=>`<div class="card"><h1 class="m">Events</h1><p>From induction to hackathons. Dates for 2027 are planned and may shift.</p></div>${['done','plan','prop'].map(s=>`<h2 class="m">${ST[s][0]}</h2><div class="grid" style="margin-bottom:36px">${EV.filter(e=>e.s===s).map(evCard).join('')}</div>`).join('')}`,
materials:()=>`<div class="card"><h1 class="m">Club Materials</h1><p>Slides, code, circuit diagrams, datasheets and posters.</p><input id="q" type="search" placeholder="Search materials..." aria-label="Search materials"><div class="grid" id="mg"></div></div>`,
team:()=>`<div class="card"><h1 class="m">Meet the Team</h1><p>The students and faculty driving Yantrika.</p>
<h3 class="m" style="color:var(--bl);margin-top:24px">Faculty Advisor</h3><div class="grid">${TEAM.adv.map(person).join('')}</div>
<h3 class="m" style="color:var(--pk);margin-top:24px">Core Committee</h3><div class="grid">${TEAM.core.map(person).join('')}</div>
<h3 class="m" style="color:var(--cy);margin-top:24px">Leads &amp; Editors</h3><div class="grid">${TEAM.lead.map(person).join('')}</div>
<h3 class="m" style="color:var(--or);margin-top:24px">Backend Core Members</h3>${TEAM.back.map(n=>`<span class="pill">${esc(n)}</span>`).join('')}</div>`,
join:()=>`<div class="card"><h1 class="m">Join &amp; Contact</h1><p>Want to join, sponsor, or collaborate? Chat with us below and we will get back to you.</p><div class="tbwrap"><typebot-standard></typebot-standard></div></div>
<div class="card foot"><h2 class="m">Find us</h2><p><a class="btn" href="mailto:${LINKS.mail}">✉️ Email</a><a class="btn" href="${LINKS.web}" target="_blank" rel="noopener">🌐 Website</a><a class="btn" href="${LINKS.ig}" target="_blank" rel="noopener">📸 Instagram</a><a class="btn" href="${LINKS.li}" target="_blank" rel="noopener">💼 LinkedIn</a></p></div>`,
donate:()=>`<div class="card"><h1 class="m">Donate to Yantrika</h1><p>Yantrika is a student-led club. Every contribution helps us buy kits and components, run free workshops and hackathons, and take robotics to school students who would otherwise never get to touch real hardware.</p>
<div class="grid" style="margin:20px 0"><div class="box" style="background:var(--red);color:#fff"><h3 class="m">Kits &amp; hardware</h3>Reusable equipment that stays with the club for future batches.</div><div class="box" style="background:var(--bl);color:#fff"><h3 class="m">Workshops</h3>Hands-on sessions and expert talks open to all students.</div><div class="box" style="background:var(--cy);color:#17171d"><h3 class="m">Outreach</h3>Free workshops for underprivileged and local youth.</div></div>
<h2 class="m">Donate online</h2>
<h2 class="m" style="margin-top:28px">Pay via UPI</h2><p>Scan or use the UPI ID:</p><div class="upi">${esc(DON.upi)}</div>
<img src="${DON.qr}" alt="UPI QR code" style="max-width:240px;width:100%;border:3px solid var(--dk);border-radius:10px;display:block;margin:10px 0" onerror="this.remove()">
<p>Companies, institutions or individuals who would like to sponsor an event, or need a receipt, can write to us directly.</p>
<a class="btn cy" href="mailto:${LINKS.mail}?subject=${encodeURIComponent('Donation / Sponsorship for Yantrika')}">✉️ Email us about donating</a><a class="btn" href="#/join">Chat with us &rarr;</a></div>`
};

const ix=e=>EV.indexOf(e);
const poster=e=>`<div class="poster has" style="background:${PC[ix(e)%6]}"><img src="posters/${e.id}.png" alt="${esc(e.t)} poster" onerror="this.parentNode.classList.remove('has');this.parentNode.innerHTML='<div class=m>YANTRIKA</div><h2 class=m>${esc(e.t)}</h2><div><b>${e.d}</b><br>RSA, IACS Kolkata</div>'"></div>`;

function evPage(e){
 let b='';
 if(e.s==='done')b=`<h3 class="m">Photos</h3><div class="gal">${Array.from({length:e.n},(_,i)=>`<img src="images/${e.id}-${i+1}.jpg" alt="${esc(e.t)} photo${i+1}" onerror="this.outerHTML='<div class=ph>Image ${i+1} missing</div>'">`).join('')}</div>`;
 else b=`<h3 class="m">Event Poster</h3>${poster(e)}`;
 const n=EV[ix(e)+1],p=EV[ix(e)-1];
 return `<p><a class="btn" href="#/events">&larr; All events</a></p><div class="card"><span class="badge ${ST[e.s][1]}">${ST[e.s][0]}</span><h1 class="m">${esc(e.t)}</h1><p><b>${e.d}</b> | Yantrika, RSA, IACS Kolkata</p><p>${esc(e.x)}</p>${b}${GM.filter(g=>g.ev.includes(e.id)).length?`<h3 class="m" style="margin-top:28px">Games that prepare you for this</h3>${GM.filter(g=>g.ev.includes(e.id)).map(g=>`<button class="btn cy" type="button" data-g="${g.id}">${g.i} ${esc(g.t)}</button>`).join('')}`:''}</div><p>${p?`<a class="btn" href="#/${p.id}">&larr; ${esc(p.t)}</a>`:''}${n?`<a class="btn" href="#/${n.id}">${esc(n.t)} &rarr;</a>`:''}</p>`;
}

function mats(){
 const g=document.getElementById('mg'),q=document.getElementById('q');
 const d=()=>{const s=q.value.toLowerCase();g.innerHTML=MAT.filter(m=>(m.t+m.d+m.k).toLowerCase().includes(s)).map(m=>`<a class="box" href="${m.u}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><span class="badge" style="background:var(--yel)">${m.k}</span><h3 class="m" style="margin:8px 0 2px">${esc(m.t)}</h3>${esc(m.d)}</a>`).join('')||'<b>Nothing matches that.</b>';};
 q.oninput=d;d();
}

/* ---------- Pillar panel content (used by the Games page) ---------- */
const LT={Arduino:'The tiny brain of most of our bots. Start with the UNO and Nano pinouts.',Sensors:'How a robot sees: distance, light and line sensors, starting with the ultrasonic one.',Motors:'Drivers, power and speed control, plus the LiPo battery safety rules.',Code:'Your first sketches: blink an LED, read a sensor, make a decision. Examples from Workshop I.'};
const BP=[['Arduino Nano','The brain. It reads sensors and decides what the motors do.','🧠'],['Ultrasonic sensor','Sends out a sound pulse and times the echo to measure distance.','📡'],['Motor driver','Lets the small Arduino pins control power-hungry motors.','⚙️'],['DC motors','Turn the wheels. Speed is set with PWM signals.','🛞'],['LiPo battery','Powers everything. Read the safety sheet before charging.','🔋']];
const SH=[['Mentor a newcomer','Walk a first-timer through their first circuit. Everyone you help becomes a builder too.','Join as a mentor','#/join'],['Teach at a school','Help run the free hands-on workshop for school students planned for Dec 2026.','Volunteer with us','#/join'],['Sponsor an event','Companies and individuals can back a workshop or a hackathon.','Support the club','#/donate'],['Spread the word','Follow us and show a friend what you built.','Follow on Instagram',LINKS.ig]];
let best=Infinity;

/* ---------- Prisoner's Dilemma data ---------- */
/* Payoffs (you, them): both cooperate 3/3, you defect on a cooperator 5/0, both defect 1/1. T(5)>R(3)>P(1)>S(0) and 2R>T+S, so this is a valid dilemma. */
const PAY={CC:[3,3],CD:[0,5],DC:[5,0],DD:[1,1]};
const OPP=[
 {k:'tft',n:'Mirror Mike',e:'🪞',h:'Plays nice, then copies you.',r:'Tit for Tat: cooperates first, then repeats your last move. Nice, retaliating and forgiving.',f:(h)=>h.length?h[h.length-1]:'C'},
 {k:'allc',n:'Kind Kim',e:'😇',h:'Always hopeful.',r:'Always Cooperate: never defects, which makes her easy to exploit.',f:()=>'C'},
 {k:'alld',n:'Sly Sam',e:'😈',h:'Out for himself.',r:'Always Defect: betrays every round, no matter what you do.',f:()=>'D'},
 {k:'grudge',n:'Grudge Gary',e:'😠',h:'Never forgets.',r:'Grudger: cooperates until you defect once, then defects forever.',f:(h)=>h.includes('D')?'D':'C'},
 {k:'pav',n:'Pavlov Pat',e:'🔁',h:'Repeats what works.',r:'Win-Stay, Lose-Shift: keeps his move after a good outcome and switches after a bad one.',f:(h,o)=>{if(!h.length)return 'C';return h[h.length-1]===o[o.length-1]?'C':'D';}},
 {k:'rand',n:'Chaos Chip',e:'🎲',h:'Flips a coin.',r:'Random: cooperates or defects 50/50, ignoring you completely.',f:()=>Math.random()<.5?'C':'D'}
];
const pdBest={};
const pdMx=l=>`<div style="overflow-x:auto"><table class="pdm" aria-label="Payoff matrix: your points, then their points"><tr><th></th><th>They cooperate 🤝</th><th>They defect 🗡️</th></tr><tr><th>You cooperate 🤝</th><td class="${l==='CC'?'hl':''}">${PAY.CC.join(' , ')}</td><td class="${l==='CD'?'hl':''}">${PAY.CD.join(' , ')}</td></tr><tr><th>You defect 🗡️</th><td class="${l==='DC'?'hl':''}">${PAY.DC.join(' , ')}</td><td class="${l==='DD'?'hl':''}">${PAY.DD.join(' , ')}</td></tr></table></div>`;

const PN={
learn:()=>`<h2 class="m">Learn: flip the switch</h2><p>Every robot starts with a circuit. Close the switch and watch the current light the LED.</p>
<svg viewBox="0 0 320 120" style="width:100%;max-width:460px;display:block;color:var(--ink)" role="img" aria-label="Circuit with a battery, a switch, a resistor and an LED">
<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 30H70M120 30H150l8-14 12 28 12-28 12 28 8-14H236M264 30H300V90H20V30"/><circle cx="70" cy="30" r="4"/><circle cx="120" cy="30" r="4"/><line id="bl" x1="70" y1="30" x2="112" y2="8"/><rect x="145" y="72" width="30" height="36" style="fill:var(--card);stroke:none"/><path d="M152 74V106M168 82V98" stroke-width="6"/><circle id="led" cx="250" cy="30" r="14" style="fill:var(--soft)"/></g></svg>
<button class="btn cy" id="sw" type="button" aria-pressed="false">Close the switch</button>
<h3 class="m" style="margin-top:20px">What you will pick up</h3>
<div>${Object.keys(LT).map(k=>`<button class="chip" type="button" aria-pressed="false" data-t="${k}">${k}</button>`).join('')}</div>
<div class="info" id="li">Tap a topic to see what we cover.</div>
<a class="btn" href="#/materials" style="margin-top:12px">Open Materials</a>`,
build:()=>`<h2 class="m">Build: assemble an obstacle-avoiding bot</h2><p>Tap each part to add it to your robot. Tap again to take it off.</p>
<div>${BP.map((b,i)=>`<button class="chip" type="button" aria-pressed="false" data-i="${i}">${b[0]}</button>`).join('')}</div>
<div class="slots" aria-hidden="true">${BP.map(b=>`<div class="slot">${b[2]}</div>`).join('')}</div>
<div class="bar"><i></i></div><p style="margin:6px 0 0"><b id="bc">0 of 5 parts</b></p>
<div class="info" id="bi">Start with the brain: tap Arduino Nano.</div>
<hr style="border:0;border-top:4px dashed var(--dk);margin:32px 0 24px">
<div id="pd"></div>`,
compete:()=>`<h2 class="m">Compete: reaction duel</h2><p>Hackathons reward quick thinking. Warm up: tap the big button, wait for GO, then tap as fast as you can.</p>
<button class="btn" id="rx" type="button">Start the duel</button>
<p id="rs" aria-live="polite" style="margin:6px 0 16px"><b>Your time shows up here.</b></p>
<h3 class="m">Where to use it</h3>
${['robotics-hackathon','game-theory-hackathon','technical-hackathon','team-challenge'].map(id=>{const e=EV.find(x=>x.id===id);return `<a class="btn" href="#/${id}">${esc(e.t)} (${e.d})</a>`}).join('')}`,
share:()=>`<h2 class="m">Share: how will you pass it on?</h2><p>What we learn is worth more when it travels. Pick a way to share.</p>
<div>${SH.map((s,i)=>`<button class="chip" type="button" aria-pressed="false" data-i="${i}">${s[0]}</button>`).join('')}</div>
<div class="info" id="si">Choose one above and we will point you to the next step.</div>`
};

/* ---------- Prisoner's Dilemma game ---------- */
function pdInit(el){
 let N=10,S=null,lock=false;
 const menu=()=>{
  el.innerHTML=`<h2 class="m">Build trust: the Prisoner's Dilemma</h2>
  <p>Good robots (and good teams) must decide whether to trust each other. Two suspects are questioned separately. Each can <b>cooperate</b> (stay silent) or <b>defect</b> (betray the other). Defecting always pays more in a single round, yet two defectors do worse than two cooperators. Can you build trust and still win?</p>
  ${pdMx('')}
  <p style="margin:0"><small>Each cell shows <b>your points , their points</b>.</small></p>
  <h3 class="m" style="margin-top:18px">1. Pick the number of rounds</h3>
  <div>${[5,10,15,20].map(n=>`<button class="chip" type="button" data-n="${n}" aria-pressed="${n===N}">${n} rounds</button>`).join('')}</div>
  <h3 class="m" style="margin-top:18px">2. Choose your opponent</h3>
  <div class="grid" style="gap:14px">${OPP.map((o,i)=>`<button class="pdo" type="button" data-o="${i}"><span>${o.e}</span><b>${o.n}</b><br>${o.h}${pdBest[o.k]!=null?`<br><small>Your best: <b>${pdBest[o.k]}</b> pts</small>`:''}</button>`).join('')}<button class="pdo" type="button" data-o="-1"><span>❓</span><b>Mystery Opponent</b><br>A hidden strategy. Work it out!</button></div>`;
  el.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{N=+b.dataset.n;el.querySelectorAll('[data-n]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
  el.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const i=+b.dataset.o;start(i<0?Math.floor(Math.random()*OPP.length):i,i<0);});
 };
 const start=(i,mys)=>{S={o:OPP[i],i,mys,h:[],p:[],ys:0,os:0,last:'',msg:'Make your move. Will you trust them?'};lock=false;play();};
 const play=()=>{
  const r=S.h.length,mx=5*N;
  el.innerHTML=`<h2 class="m">${S.mys?'❓ Mystery Opponent':S.o.e+' '+S.o.n}</h2>
  <p style="margin:0"><b>Round ${Math.min(r+1,N)} of ${N}</b></p>
  <div class="pdsc"><div><b>You: <span id="ys">${S.ys}</span></b><div class="bar"><i id="yb" style="width:${S.ys/mx*100}%"></i></div></div><div><b>${S.mys?'Them':S.o.n}: <span id="os">${S.os}</span></b><div class="bar"><i class="o" id="ob" style="width:${S.os/mx*100}%"></i></div></div></div>
  ${pdMx(S.last)}
  <p class="pdbig" id="pm2" aria-live="polite">${S.msg}</p>
  <div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn cy pdgo" type="button" data-m="C">🤝 Cooperate</button><button class="btn pdgo d" type="button" data-m="D">🗡️ Defect</button></div>
  <div class="hist" id="hs" aria-label="Round history">${S.h.map((m,k)=>`<span class="hr" title="Round ${k+1}">${m==='C'?'🤝':'🗡️'}${S.p[k]==='C'?'🤝':'🗡️'}</span>`).join('')}</div>
  <p style="margin:6px 0 0"><small>History shows you, then them. </small><button class="chip" type="button" id="qt">Quit game</button></p>`;
  el.querySelector('#qt').onclick=menu;
  el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>move(b.dataset.m));
 };
 const move=m=>{
  if(lock)return;lock=true;
  const bs=el.querySelectorAll('[data-m]');bs.forEach(b=>b.disabled=true);
  const msg=el.querySelector('#pm2');msg.textContent='🤔 '+(S.mys?'They are':S.o.n+' is')+' deciding...';
  setTimeout(()=>{
   const t=S.o.f(S.h,S.p),k=m+t,[a,b]=PAY[k];
   S.h.push(m);S.p.push(t);S.ys+=a;S.os+=b;S.last=k;
   const who=S.mys?'They':S.o.n;
   S.msg={CC:`🤝 Both cooperated. +${a} each. Trust pays!`,CD:`😬 You cooperated but ${who} defected. You get ${a}, they get ${b}.`,DC:`😏 You defected on a cooperator. You get ${a}, they get ${b}. They will remember...`,DD:`💥 Both defected. Only +${a} each. Nobody wins.`}[k];
   if(S.h.length>=N){end();return;}
   lock=false;play();
   if(k==='CD'||k==='DD')el.querySelector('#pm2').classList.add('shake');
  },550);
 };
 const end=()=>{
  const mx=5*N,coop=Math.round(S.h.filter(x=>x==='C').length/N*100),tc=Math.round(S.p.filter(x=>x==='C').length/N*100);
  const prev=pdBest[S.o.k];if(prev==null||S.ys>prev)pdBest[S.o.k]=S.ys;
  const win=S.ys>S.os?'🏆 You outscored them!':S.ys<S.os?'They outscored you this time.':'🤝 It is a tie.';
  const cc=S.h.filter((x,i)=>x==='C'&&S.p[i]==='C').length;
  const tip=cc===N?'Perfect trust: you both cooperated every round and earned the maximum shared score together.':S.o.k==='alld'?'Against a pure defector, defecting back is the only way to avoid being exploited.':S.o.k==='allc'?'Kind Kim can be exploited, but notice how much you could have earned by simply cooperating with a friendly partner.':S.ys>=3*N?'Excellent! You averaged at least the cooperative score.':'Tip: repeated games reward being nice, retaliating when needed, and forgiving. Try building trust early.';
  el.innerHTML=`<h2 class="m">Game over!</h2>
  <div class="info pdbig"><b>${win}</b><br>You: <b>${S.ys}</b> pts &nbsp;|&nbsp; ${S.mys?'Them':S.o.n}: <b>${S.os}</b> pts<br><small>Max possible: ${mx}. Perfect mutual cooperation: ${3*N} each. Your best vs ${S.o.n}: ${pdBest[S.o.k]}.</small></div>
  <p>You cooperated <b>${coop}%</b> of the time; they cooperated <b>${tc}%</b>.</p>
  <div class="hist">${S.h.map((m,k)=>`<span class="hr">${m==='C'?'🤝':'🗡️'}${S.p[k]==='C'?'🤝':'🗡️'}</span>`).join('')}</div>
  <div class="info"><b>${S.o.e} ${S.o.n} revealed:</b> ${S.o.r}<br><br>💡 ${tip}</div>
  <p style="margin-top:14px"><button class="btn cy" type="button" id="ag">Play again</button><button class="btn" type="button" id="ch">Choose another opponent</button><a class="btn" href="#/game-theory-hackathon">Game Theory Hackathon</a></p>`;
  el.querySelector('#ag').onclick=()=>start(S.i,S.mys);
  el.querySelector('#ch').onclick=menu;
 };
 menu();
}

const PI={
learn:root=>{
 const sw=root.querySelector('#sw'),bl=root.querySelector('#bl'),led=root.querySelector('#led'),li=root.querySelector('#li');
 sw.onclick=()=>{const on=sw.getAttribute('aria-pressed')!=='true';sw.setAttribute('aria-pressed',on);sw.textContent=on?'Open the switch':'Close the switch';bl.setAttribute('x2',on?120:112);bl.setAttribute('y2',on?30:8);led.style.fill=on?'#f1c40f':'var(--soft)';led.style.filter=on?'drop-shadow(0 0 8px #f1c40f)':'none';};
 root.querySelectorAll('[data-t]').forEach(c=>c.onclick=()=>{root.querySelectorAll('[data-t]').forEach(x=>x.setAttribute('aria-pressed',x===c));li.innerHTML='<b>'+c.dataset.t+'</b><br>'+LT[c.dataset.t];});
},
build:root=>{
 const on=new Set(),sl=root.querySelectorAll('.slot'),bar=root.querySelector('.bar i'),ct=root.querySelector('#bc'),inf=root.querySelector('#bi');
 root.querySelectorAll(':scope > div > [data-i]').forEach(c=>c.onclick=()=>{
  const i=+c.dataset.i,was=on.has(i);was?on.delete(i):on.add(i);
  c.setAttribute('aria-pressed',!was);sl[i].classList.toggle('on',!was);
  bar.style.width=on.size*20+'%';ct.textContent=on.size+' of 5 parts';
  inf.innerHTML=on.size===5?'<b>Your obstacle-avoiding bot is assembled!</b><br>The wiring guide and battery safety sheet are in Materials.<br><a class="btn cy" href="#/materials">Open Materials</a>':(was?'Removed '+BP[i][0]+'.':'<b>'+BP[i][0]+'</b><br>'+BP[i][1]);
 });
 const pd=root.querySelector('#pd');if(pd)pdInit(pd);
},
compete:root=>{
 const rx=root.querySelector('#rx'),out=root.querySelector('#rs');let st=0,t0=0,to=0;
 rx.onclick=()=>{
  if(st===0){st=1;rx.textContent='Wait for green...';rx.style.background='var(--or)';out.innerHTML='<b>Get ready...</b>';to=setTimeout(()=>{st=2;t0=performance.now();rx.textContent='GO! Tap now';rx.style.background='var(--cy)';},1200+Math.random()*2000);}
  else if(st===1){clearTimeout(to);st=0;rx.textContent='Too early! Try again';rx.style.background='var(--pk)';out.innerHTML='<b>Wait for the green GO.</b>';}
  else{const ms=Math.round(performance.now()-t0);st=0;best=Math.min(best,ms);rx.textContent='Go again';rx.style.background='var(--yel)';out.innerHTML='<b>'+ms+' ms.</b> Best this visit: '+best+' ms. '+(ms<250?'Hackathon ready!':ms<400?'Solid reflexes.':'Warm up and go again.');}
 };
},
share:root=>{
 const inf=root.querySelector('#si');
 root.querySelectorAll('[data-i]').forEach(c=>c.onclick=()=>{
  root.querySelectorAll('[data-i]').forEach(x=>x.setAttribute('aria-pressed',x===c));
  const s=SH[+c.dataset.i],ext=s[3].startsWith('http');
  inf.innerHTML='<b>'+s[0]+'</b><br>'+s[1]+'<br><a class="btn cy" href="'+s[3]+'"'+(ext?' target="_blank" rel="noopener"':'')+'>'+s[2]+'</a>';
 });
}
};

/* ---------- Games Arcade: registry (2-3 games per pillar, each tied to events) ---------- */
const PCOL={learn:'var(--red)',build:'var(--bl)',compete:'var(--or)',share:'var(--cy)'};
const evL=ids=>ids.map(id=>{const e=EV.find(x=>x.id===id);return `<a class="btn" href="#/${id}">${esc(e.t)} (${e.d})</a>`}).join('');
let pendG=null;

function bin(el){
 let b=[0,0,0,0],t=0,sc=0,done=false;
 const nt=()=>{t=1+Math.floor(Math.random()*15);done=false};nt();
 const val=()=>b[0]*8+b[1]*4+b[2]*2+b[3];
 const draw=()=>{const v=val(),ok=v===t;
  el.innerHTML=`<h2 class="m">Binary LEDs</h2><p>Microcontrollers count in binary. Each LED is a bit worth 8, 4, 2 or 1. Light them to make <b style="font-size:1.6rem">${t}</b>.</p>
  <div class="slots">${b.map((x,i)=>`<div style="text-align:center"><button class="slot ${x?'on':''}" type="button" data-b="${i}" aria-pressed="${!!x}" aria-label="Bit worth ${8>>i}" style="opacity:1;cursor:pointer;font:inherit;color:inherit;background-color:${x?'var(--yel)':'transparent'}">${x?'💡':'⚫'}</button><br><b>${8>>i}</b></div>`).join('')}</div>
  <div class="info"><b>Current value: ${v}</b> ${ok?'✅ Match!':''}<br>Solved: <b>${sc}</b></div>${ok?'<button class="btn cy" type="button" id="nx">Next number</button>':''}`;
  el.querySelectorAll('[data-b]').forEach(c=>c.onclick=()=>{b[+c.dataset.b]^=1;if(val()===t&&!done){done=true;sc++;}draw();});
  const n=el.querySelector('#nx');if(n)n.onclick=()=>{b=[0,0,0,0];nt();draw();};
 };
 draw();
}

function echo(el){
 el.innerHTML=`<h2 class="m">Echo Distance Lab</h2><p>An ultrasonic sensor sends a ping and times the echo. Distance = speed of sound × time ÷ 2. Drag the echo time and watch the wall move. Challenge: make the bot stop at about 20 cm.</p>
 <label for="et"><b>Echo time: <span id="etv"></span> ms</b></label><input id="et" type="range" min="0.5" max="20" step="0.1" value="8" style="width:100%;max-width:460px;display:block;margin:6px 0 14px">
 <div class="echo" aria-hidden="true"><span style="position:absolute;left:6px;top:8px;font-size:1.6rem">🤖</span><span id="wl" style="position:absolute;top:8px;font-size:1.6rem">🧱</span></div>
 <div class="info" id="eo"></div>`;
 const s=el.querySelector('#et'),wl=el.querySelector('#wl'),eo=el.querySelector('#eo'),tv=el.querySelector('#etv');
 const u=()=>{const t=+s.value,d=t*17.15;tv.textContent=t.toFixed(1);wl.style.left=(10+d/343*82)+'%';
  eo.innerHTML='<b>Distance: '+d.toFixed(0)+' cm</b><br>'+(d<20?'🛑 Obstacle too close! Turn the motors.':d<=30?'🎯 Nice, just about at the stopping distance.':'✅ Path clear. Keep driving.');};
 s.oninput=u;u();
}

function simon(el){
 const C=['#ec3750','#338eda','#33d6a6','#f1c40f'],N=['Red','Blue','Green','Yellow'];let seq=[],pos=0,lock=true,bl=0,g=0;
 el.innerHTML=`<h2 class="m">Pattern Memory</h2><p>Watch the sequence, then repeat it. Every level adds one more step, like debugging a longer program.</p><div class="sg">${C.map((c,i)=>`<button type="button" data-s="${i}" aria-label="${N[i]}" style="background:${c}"></button>`).join('')}</div><p class="pdbig" id="ss" aria-live="polite">Press start.</p><button class="btn cy" id="go" type="button">Start</button>`;
 const bs=el.querySelectorAll('[data-s]'),ss=el.querySelector('#ss');
 const fl=i=>{bs[i].style.filter='brightness(1.7) saturate(1.4)';bs[i].style.transform='scale(.94)';setTimeout(()=>{bs[i].style.filter='';bs[i].style.transform='';},300);};
 const show=()=>{const my=++g;lock=true;pos=0;ss.textContent='Watch... level '+seq.length;seq.forEach((s,k)=>setTimeout(()=>{if(my===g)fl(s)},700*k+500));setTimeout(()=>{if(my===g){lock=false;ss.textContent='Your turn!';}},700*seq.length+500);};
 const nxt=()=>{seq.push(Math.floor(Math.random()*4));show();};
 el.querySelector('#go').onclick=()=>{seq=[];el.querySelector('#go').textContent='Restart';nxt();};
 bs.forEach(b=>b.onclick=()=>{if(lock)return;const i=+b.dataset.s;fl(i);
  if(i!==seq[pos]){lock=true;const l=seq.length-1;bl=Math.max(bl,l);ss.textContent='❌ Wrong! You cleared '+l+' level'+(l===1?'':'s')+'. Best: '+bl+'.';seq=[];return;}
  pos++;if(pos===seq.length){lock=true;const my=g;ss.textContent='✅ Level '+seq.length+' cleared!';setTimeout(()=>{if(my===g)nxt()},900);}});
}

function rps(el){
 const M=['🪨','📄','✂️'],NM=['Rock','Paper','Scissors'];let cnt=[0,0,0],w=0,l=0,d=0,n=0;
 el.innerHTML=`<h2 class="m">Rock Paper Scissors vs a learning bot</h2><p>This bot watches your habits and tries to counter your favourite move. Game theory says the unbeatable strategy is to be random. Can you stay unpredictable?</p>
 <div style="display:flex;gap:12px;flex-wrap:wrap">${M.map((m,i)=>`<button class="btn pdgo" type="button" data-r="${i}" aria-label="${NM[i]}">${m} ${NM[i]}</button>`).join('')}</div>
 <p class="pdbig" id="rr" aria-live="polite">Pick your move.</p><div class="info" id="rt"></div><button class="chip" type="button" id="rz">Reset</button>`;
 const rr=el.querySelector('#rr'),rt=el.querySelector('#rt'),sc=()=>{rt.innerHTML='Wins: <b>'+w+'</b> | Losses: <b>'+l+'</b> | Ties: <b>'+d+'</b>'+(n>=8?'<br><small>🧠 The bot has learned your favourite move. Try mixing it up randomly!</small>':'');};sc();
 el.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{
  const me=+b.dataset.r;let bot=Math.floor(Math.random()*3);
  if(n>=3&&Math.random()<.7)bot=(cnt.indexOf(Math.max(...cnt))+1)%3;
  cnt[me]++;n++;const r=(me-bot+3)%3;
  r===0?d++:r===1?w++:l++;
  rr.textContent=M[me]+' vs '+M[bot]+' → '+(r===0?'Tie.':r===1?'You win! 🎉':'Bot wins. 🤖');sc();
 });
 el.querySelector('#rz').onclick=()=>{cnt=[0,0,0];w=l=d=n=0;rr.textContent='Fresh start. Pick your move.';sc();};
}

function plan(el){
 el.innerHTML=`<h2 class="m">Outreach Planner</h2><p>The Schools Outreach workshop hosts about 70 students. Can you plan the kits and mentors so nobody is left watching?</p>
 <label for="kv"><b>Kits: <span id="kvv"></span></b></label><input id="kv" type="range" min="4" max="20" value="10" style="width:100%;max-width:460px;display:block;margin:6px 0 14px">
 <label for="vl"><b>Volunteer mentors: <span id="vlv"></span></b></label><input id="vl" type="range" min="2" max="20" value="6" style="width:100%;max-width:460px;display:block;margin:6px 0 14px">
 <div class="info" id="po"></div>`;
 const k=el.querySelector('#kv'),v=el.querySelector('#vl'),o=el.querySelector('#po');
 const u=()=>{const K=+k.value,V=+v.value,pk=Math.ceil(70/K),pm=Math.ceil(70/V),km=Math.ceil(K/V);
  el.querySelector('#kvv').textContent=K;el.querySelector('#vlv').textContent=V;
  const c=[[pk<=5,'Students per kit: '+pk+' (aim for 5 or fewer)'],[pm<=8,'Students per mentor: '+pm+' (aim for 8 or fewer)'],[km<=2,'Kits per mentor: '+km+' (aim for 2 or fewer)']];
  o.innerHTML=c.map(x=>(x[0]?'✅ ':'⚠️ ')+x[1]).join('<br>')+'<br><br><b>'+(c.every(x=>x[0])?'🎉 Ready to run a great workshop!':'Keep adjusting the sliders.')+'</b>';};
 k.oninput=v.oninput=u;u();
}

function maze(el){
 const LV=[['Easy',7],['Medium',10],['Hard',14]],DX=[0,1,0,-1],DY=[-1,0,1,0],AR=[['▲',0],['◀',3],['▼',2],['▶',1]];
 let lv=1,n=10,walls=[],p=0,goal=0,hint=null,moves=0,t0=0,won=false;const best={};
 el.innerHTML=`<h2 class="m">Maze Finder</h2><p>Robots need to find their way out. Guide the bot 🤖 to the flag 🏁 using arrow keys, WASD or the buttons. Fewer moves is better. Stuck? Ask for the shortest path.</p>
 <div id="mlv">${LV.map((l,i)=>`<button class="chip" type="button" data-l="${i}" aria-pressed="${i===lv}">${l[0]}</button>`).join('')}</div>
 <div style="display:flex;flex-wrap:wrap;gap:20px;align-items:center;margin:12px 0"><canvas id="mz" width="480" height="480" style="flex:1 1 300px;min-width:0;max-width:480px;aspect-ratio:1;border:3px solid var(--dk);border-radius:10px;background:var(--card);display:block;margin:0" role="img" aria-label="Maze board"></canvas><div style="display:grid;grid-template-columns:repeat(3,68px);grid-template-areas:'. u .' 'l d r';gap:8px;margin:0;flex:0 0 auto">${AR.map((a,i)=>`<button class="btn" type="button" data-d="${a[1]}" aria-label="Move ${['up','left','down','right'][i]}" style="margin:0;grid-area:${['u','l','d','r'][i]};padding:16px 0;font-size:1.4rem">${a[0]}</button>`).join('')}</div></div>
 <div class="info" id="mi" aria-live="polite"></div>
  <button class="btn cy" type="button" id="mn">New maze</button><button class="btn" type="button" id="ms">Show shortest path</button>`;
 const cv=el.querySelector('#mz'),cx=cv.getContext('2d'),mi=el.querySelector('#mi');
 const gen=()=>{
  n=LV[lv][1];walls=Array.from({length:n*n},()=>[1,1,1,1]);
  const seen=new Set([0]),st=[0];
  while(st.length){
   const c=st[st.length-1],x=c%n,y=(c/n)|0,o=[0,1,2,3].filter(d=>{const nx=x+DX[d],ny=y+DY[d];return nx>=0&&ny>=0&&nx<n&&ny<n&&!seen.has(ny*n+nx);});
   if(!o.length){st.pop();continue;}
   const d=o[Math.floor(Math.random()*o.length)],nc=(y+DY[d])*n+x+DX[d];
   walls[c][d]=0;walls[nc][(d+2)%4]=0;seen.add(nc);st.push(nc);
  }
  p=0;goal=n*n-1;hint=null;moves=0;t0=0;won=false;info('Reach the flag!');draw();
 };
 const info=m=>{mi.innerHTML='<b>'+m+'</b><br>Moves: <b>'+moves+'</b> | Best on '+LV[lv][0]+': <b>'+(best[lv]!=null?best[lv]+' moves':'none yet')+'</b>';};
 const solve=()=>{
  const prev=new Array(n*n).fill(-1),q=[p];prev[p]=p;
  while(q.length){const c=q.shift();if(c===goal)break;for(let d=0;d<4;d++){if(walls[c][d])continue;const nc=((c/n|0)+DY[d])*n+c%n+DX[d];if(prev[nc]<0){prev[nc]=c;q.push(nc);}}}
  const path=[];let c=goal;while(c!==p){path.push(c);c=prev[c];}path.push(p);return path.reverse();
 };
 const draw=()=>{
  const s=480/n,cs=getComputedStyle(cv),ink=cs.getPropertyValue('--ink').trim()||'#17171d';
  cx.clearRect(0,0,480,480);
  if(hint){cx.strokeStyle='#33d6a6';cx.lineWidth=s*.25;cx.lineCap='round';cx.lineJoin='round';cx.beginPath();hint.forEach((c,i)=>{const X=(c%n+.5)*s,Y=((c/n|0)+.5)*s;i?cx.lineTo(X,Y):cx.moveTo(X,Y);});cx.stroke();}
  cx.strokeStyle=ink;cx.lineWidth=4;cx.lineCap='round';cx.beginPath();
  walls.forEach((w,c)=>{const x=(c%n)*s,y=((c/n)|0)*s;
   if(w[0]){cx.moveTo(x,y);cx.lineTo(x+s,y);}if(w[1]){cx.moveTo(x+s,y);cx.lineTo(x+s,y+s);}
   if(w[2]){cx.moveTo(x,y+s);cx.lineTo(x+s,y+s);}if(w[3]){cx.moveTo(x,y);cx.lineTo(x,y+s);}});
  cx.stroke();
  cx.font=(s*.6)+'px sans-serif';cx.textAlign='center';cx.textBaseline='middle';
  cx.fillText('🏁',(goal%n+.5)*s,((goal/n|0)+.55)*s);cx.fillText('🤖',(p%n+.5)*s,((p/n|0)+.55)*s);
 };
 const go=d=>{
  if(won||walls[p][d])return;
  if(!t0)t0=performance.now();
  p=((p/n|0)+DY[d])*n+p%n+DX[d];moves++;hint=null;
  if(p===goal){won=true;const sec=Math.round((performance.now()-t0)/1000);if(best[lv]==null||moves<best[lv])best[lv]=moves;info('🎉 Escaped in '+moves+' moves and '+sec+' s!');}
  else info('Keep going!');
  draw();
 };
 const key=e=>{
  if(!el.isConnected){removeEventListener('keydown',key);return;}
  const d={ArrowUp:0,w:0,W:0,ArrowRight:1,d:1,D:1,ArrowDown:2,s:2,S:2,ArrowLeft:3,a:3,A:3}[e.key];
  if(d===undefined)return;e.preventDefault();go(d);
 };
 addEventListener('keydown',key);
 el.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>go(+b.dataset.d));
 el.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{lv=+b.dataset.l;el.querySelectorAll('[data-l]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));gen();});
 el.querySelector('#mn').onclick=gen;
 el.querySelector('#ms').onclick=()=>{if(won)return;hint=solve();info('Shortest path from here: '+(hint.length-1)+' moves');draw();};
 gen();
}

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
 el.querySelector('#bbk').onclick=()=>{
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
  else{ok=true;done.add(mi);chips();msg='<b>✅ Wired correctly!</b> The '+M().t+' is powered.<br>'+M().s()+'<br><small>Wires used: '+wires.length+'</small>';}
  render();
 };
 chips();render();
}

const GM=[
{id:'circuit',p:'learn',i:'💡',t:'Circuit Switch',d:'Close the switch and light the LED.',ev:['induction','workshop-1','workshop-2'],run:el=>{el.innerHTML=PN.learn();PI.learn(el);}},
{id:'binary',p:'learn',i:'🔢',t:'Binary LEDs',d:'Light the bits to match the target number.',ev:['workshop-1','ai-robotics-workshop'],run:bin},
{id:'echo',p:'learn',i:'📡',t:'Echo Distance Lab',d:'Turn echo time into distance and decide when to turn.',ev:['expert-talks','workshop-2'],run:echo},
{id:'bot',p:'build',i:'🤖',t:'Bot Builder',d:'Assemble an obstacle-avoiding bot part by part.',ev:['workshop-2','prototyping-session','summer-camp'],run:el=>{el.innerHTML=PN.build();el.querySelector('hr').remove();el.querySelector('#pd').remove();PI.build(el);}},
{id:'breadboard',p:'build',i:'🔌',t:'Breadboard Lab',d:'Place a sensor on the breadboard with your hand, then wire it to the Arduino.',ev:['workshop-1','workshop-2','prototyping-session'],run:breadboard},
{id:'pd',p:'build',i:'🤝',t:"Prisoner's Dilemma",d:'Build trust against six strategies.',ev:['game-theory-hackathon','technical-hackathon','team-challenge'],run:el=>{el.innerHTML='<div id="pd"></div>';pdInit(el.firstChild);}},
{id:'duel',p:'compete',i:'⚡',t:'Reaction Duel',d:'Tap the moment the button turns green.',ev:['robotics-hackathon','team-challenge'],run:el=>{el.innerHTML=PN.compete();PI.compete(el);}},
{id:'simon',p:'compete',i:'🧠',t:'Pattern Memory',d:'Repeat a growing colour sequence.',ev:['robotics-hackathon','technical-hackathon'],run:simon},
{id:'maze',p:'compete',i:'🧭',t:'Maze Finder',d:'Guide the bot through a random maze to the flag.',ev:['robotics-hackathon','technical-hackathon','team-challenge'],run:maze},
{id:'rps',p:'compete',i:'✂️',t:'Rock Paper Scissors vs Bot',d:'Outsmart a bot that learns your habits.',ev:['game-theory-hackathon','team-challenge'],run:rps},
{id:'pick',p:'share',i:'📣',t:'Pass It On',d:'Choose how you will share what you learn.',ev:['schools-outreach','semester-outreach','talks-mentorship'],run:el=>{el.innerHTML=PN.share();PI.share(el);}},
{id:'plan',p:'share',i:'🏫',t:'Outreach Planner',d:'Balance kits and mentors for 70 students.',ev:['schools-outreach','summer-camp','semester-outreach'],run:plan}
];

/* Pillar buttons (home + about) open the Games page, pre-filtered to that pillar */
let pendF=null;
function pillars(){
 document.querySelectorAll('[data-k]').forEach(b=>{
  b.onclick=()=>{pendF=b.dataset.k;location.hash='#/games';};
 });
}

function gamesPage(){
 const gf=document.getElementById('gf'),gg=document.getElementById('gg'),gp=document.getElementById('gp');
 let f=pendF||'all',cur=null;pendF=null;
 const cards=()=>{
  gf.innerHTML=[['all','All ('+GM.length+')'],...PIL.map(p=>[p.k,p.t+' ('+GM.filter(g=>g.p===p.k).length+')'])].map(x=>`<button class="chip" type="button" data-f="${x[0]}" aria-pressed="${x[0]===f}">${x[1]}</button>`).join('');
  gg.innerHTML=GM.filter(g=>f==='all'||g.p===f).map(g=>`<button class="pdo" type="button" data-play="${g.id}" aria-pressed="${g.id===cur}" style="border-top:12px solid ${PCOL[g.p]}"><span>${g.i}</span><span class="badge" style="background:${PCOL[g.p]};color:#fff;float:none;font-size:.8rem;margin-bottom:6px">${g.p.toUpperCase()}</span><br><b>${esc(g.t)}</b><br>${esc(g.d)}<br><small>🔗 ${g.ev.map(id=>esc(EV.find(e=>e.id===id).t)).join(' · ')}</small></button>`).join('');
  gf.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{f=b.dataset.f;cards();});
  gg.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>open(b.dataset.play));
 };
 const open=id=>{
  const g=GM.find(x=>x.id===id);if(!g)return;cur=id;
  if(f!=='all'&&g.p!==f)f='all';
  cards();
  gp.hidden=false;
  gp.innerHTML=`<span class="badge" style="background:${PCOL[g.p]};color:#fff">${g.p.toUpperCase()}</span><div id="gb" style="margin-top:8px"></div><hr style="border:0;border-top:4px dashed var(--dk);margin:24px 0 16px"><h3 class="m">Events this game prepares you for</h3><p>${evL(g.ev)}</p>`;
  g.run(gp.querySelector('#gb'));
  gp.classList.remove('open');void gp.offsetWidth;gp.classList.add('open');
  gp.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
 };
 cards();
 if(pendG){const id=pendG;pendG=null;setTimeout(()=>open(id),60);}
}

/* Donorbox widget: load the script once; the dbox-widget element upgrades when it appears */
function donorbox(){
 if(document.getElementById('dbx-js'))return;
 const s=document.createElement('script');
 s.id='dbx-js';s.type='module';s.async=true;s.src='https://donorbox.org/widgets.js';
 document.head.append(s);
}

function promo(){
 const v=document.getElementById('pv'),b=document.getElementById('pm');
 if(!v)return;
 b.onclick=()=>{v.muted=!v.muted;b.innerHTML=v.muted?'&#128263; Unmute':'&#128266; Mute';if(v.paused)v.play().catch(()=>{});};
 new IntersectionObserver(en=>en.forEach(x=>{if(x.isIntersecting){v.play().catch(()=>{})}else{v.pause()}}),{threshold:.25}).observe(v);
}

/* Typebot standard embed for the Join page */
function joinBot(){
 const typebotInitScript = document.createElement("script");
 typebotInitScript.type = "module";
 typebotInitScript.innerHTML = `import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js'

Typebot.initStandard({ typebot: "yantrika" });
`;
 document.body.append(typebotInitScript);
}

function r(){
 const id=location.hash.replace('#/','')||'home';
 const e=EV.find(x=>x.id===id);
 const p=V[id]?id:(e?'events':'home');
 document.getElementById('nav').innerHTML=`<a class="logo m" href="#/">YANTRIKA</a>${PAGES.map(x=>`<a class="l ${x[0]===p?'on':''}" href="#/${x[0]==='home'?'':x[0]}">${x[1]}</a>`).join('')}<button class="btn" id="th" type="button" style="margin:0" aria-label="Toggle theme">◐</button>`;
 document.getElementById('app').innerHTML=(e&&!V[id])?evPage(e):V[p]();
 document.getElementById('bgal').innerHTML=(p==='home'&&!e)?gal():'';
 document.getElementById('th').onclick=()=>{const R=document.documentElement;const isDark=getComputedStyle(R).getPropertyValue('--bg').trim()==='#101015';R.setAttribute('data-theme',isDark?'light':'dark');};
 document.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{pendG=b.dataset.g;location.hash='#/games';});
 if(p==='games')gamesPage();
 if(p==='home'&&!e){promo();}
 if(p==='about'||(p==='home'&&!e))pillars();
 if(p==='donate')donorbox();
 if(p==='materials')mats();
 if(p==='join')joinBot();
 scrollTo(0,0);
 document.title=(e&&!V[id]?e.t+' | ':p==='home'?'':PAGES.find(x=>x[0]===p)[1]+' | ')+'YANTRIKA';
}
onhashchange=r;r();
</script>
<script type="module">
import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js';
Typebot.initBubble({typebot:"yantrika-workshop",theme:{button:{backgroundColor:"#FFEF02",color:"#17171d"},chatWindow:{backgroundColor:"#010000"}},customButton:{text:"Join Us"}});
</script>
<script src="sitemap.js"></script>
</body>
</html>

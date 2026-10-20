#!/usr/bin/env node
/* Opens the real site in a fake browser (jsdom), opens every game on the
   Games page and fails if any game throws an error.
   Run:  npm install   (once)   then   npm run smoke                       */
const path=require('path');
let JSDOM,VirtualConsole;
try{({JSDOM,VirtualConsole}=require('jsdom'));}catch(e){console.error('jsdom is missing. Run "npm install" first.');process.exit(2);}
const root=path.join(__dirname,'..'),page=path.join(root,'index.html');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const errors=[],vc=new VirtualConsole();
 const ignore=m=>/fonts\.googleapis|fonts\.gstatic|cdn\.jsdelivr|donorbox|typebot|Could not load (link|script)|not implemented/i.test(m);
 vc.on('jsdomError',e=>{const m=(e.detail&&e.detail.message)||e.message;if(!ignore(String(m)+String(e.message)))errors.push(m);});
 vc.on('error',m=>{if(!ignore(String(m)))errors.push(String(m));});
 const dom=await JSDOM.fromFile(page,{runScripts:'dangerously',resources:'usable',pretendToBeVisual:true,virtualConsole:vc,
  beforeParse(win){ // things a real browser has and jsdom lacks
   win.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
   win.HTMLMediaElement.prototype.play=()=>Promise.resolve();win.HTMLMediaElement.prototype.pause=()=>{};
   const noop=new Proxy(function(){},{get:(t,k)=>k==='canvas'?{}:k==='measureText'?()=>({width:0}):noop,set:()=>true,apply:()=>noop});
   win.HTMLCanvasElement.prototype.getContext=()=>noop;win.scrollTo=()=>{};
  }});
 const w=dom.window,d=w.document;
 await wait(1500);
 const YK=w.eval('YK');
 YK.problems.forEach(p=>errors.push('registry: '+p));
 w.location.hash='#/games';await wait(600);
 console.log(`${YK.games.length} games registered, ${d.querySelectorAll('[data-play]').length} cards on the Games page`);
 for(const g of YK.games){
  const card=d.querySelector(`[data-play="${g.id}"]`);
  if(!card){errors.push(`${g.id}: no card on the Games page`);continue;}
  card.click();await wait(150);
  const gp=d.getElementById('gp'),body=gp.querySelector('#gb');
  const ok=!gp.hidden&&body&&body.innerHTML.trim().length>50&&!/hit an error/.test(body.innerHTML);
  console.log(`${ok?'ok  ':'FAIL'} ${g.id}`);
  if(!ok)errors.push(`${g.id}: game did not open correctly`);
  gp.querySelector('#gx').click();
 }
 if(errors.length){console.log('\nProblems:\n - '+errors.join('\n - '));process.exit(1);}
 console.log('\nAll games open without errors.');process.exit(0);
})();

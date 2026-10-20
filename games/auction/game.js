/* Yantrika game: Auction Arena
   Open source (MIT). Edit freely and send a pull request: see CONTRIBUTING.md
   and games/README.md for the game API. */
(function(){
'use strict';

// ---- Auction Arena: data ----
// Three formats. fp/sp = "private value" (each bidder knows what the item is worth TO THEM, 0-100).
// cv = "common value" (one hidden true worth; everyone only gets a noisy estimate, +/-15).
const AUF={
 fp:{n:'First-price',d:'Highest bid wins and pays <b>their own bid</b>. Bid below your value to keep a profit.'},
 sp:{n:'Second-price',d:'Highest bid wins but pays the <b>second-highest bid</b> (a Vickrey auction). What is the best bid now?'},
 cv:{n:"Winner's curse",d:'One hidden true worth, and everyone only sees a noisy estimate. Highest bid wins and pays their bid. Beware of winning!'}
};

// The three bots. f(x,m) = their bid given their value/estimate x in format m. Strategies stay hidden until the end.
const AUB=[
 {n:'Truthful Tom',e:'😇',r:"Always bids exactly his value (or raw estimate). That is perfect in a second-price auction, but in a first-price auction he earns nothing when he wins, and in the winner's curse game he overpays.",f:x=>x},
 {n:'Rational Rita',e:'🧠',r:"Plays the equilibrium for each format: 75% of her value in a first-price auction with four bidders, her full value in a second-price auction, and her estimate minus 16 in the winner's curse game.",f:(x,m)=>m==='fp'?x*.75:m==='sp'?x:x-16},
 {n:'Bluffer Bruno',e:'🎭',r:'Bids a random amount, sometimes far below and sometimes above his value, hoping to bluff or get lucky. Randomness rarely beats a plan.',f:(x,m)=>m==='cv'?x-Math.random()*25:x*(.5+Math.random()*.6)}
];

// Auction scene: you + three bots (fez hats, paddles) around the item on a podium
const auHat=['var(--red)','#338eda','#2fbf71','#ff8c37'],auX=[50,150,490,590],auNm=['you','Tom','Rita','Bruno'];

const auScene=(bids,w,price,cur)=>`<svg class="tsc" viewBox="0 0 640 250" role="img" aria-label="Four bidders hold up paddles around an item on a podium"><line x1="10" y1="214" x2="630" y2="214" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/>
 <rect x="250" y="150" width="140" height="64" fill="#5a5a62" stroke="var(--ink)" stroke-width="4"/><path d="M270 150V176H370V150" fill="none" stroke="var(--ink)" stroke-width="3" opacity=".7"/><text x="320" y="140" text-anchor="middle" font-size="54">📦</text>
 <text x="320" y="48" text-anchor="middle" font-size="${w!=null?24:30}" fill="var(--ink)">${w!=null?'SOLD for '+price+'!':'🔨'}</text>
 ${[0,1,2,3].map(i=>{const X=auX[i],win=w===i,v=bids?bids[i]:(i===0&&cur!=null?cur:'?');return YK.figure(X,auHat[i],bids?(win?'devil':'sad'):'normal')+`<line x1="${X}" y1="84" x2="${X}" y2="106" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/><rect x="${X-26}" y="38" width="52" height="46" rx="9" fill="${win?'var(--yel)':'var(--card)'}" stroke="var(--ink)" stroke-width="3.5"/><text x="${X}" y="70" text-anchor="middle" font-size="23" fill="${win?'#17171d':'var(--ink)'}">${v}</text><text x="${X}" y="238" text-anchor="middle" font-size="14" fill="var(--ink)">${auNm[i]}</text>${win?`<text x="${X}" y="30" text-anchor="middle" font-size="20">🏆</text>`:''}`;}).join('')}</svg>`;

// ---- Auction Arena: game logic ----
function auctionInit(el){
 let M='fp',N=10,S=null;
 const priv=()=>S?S.m!=='cv':M!=='cv';
 const nm=['You',...AUB.map(o=>o.n)],em=['🙋',...AUB.map(o=>o.e)];
 const menu=()=>{
  el.innerHTML=`<h2 class="m">Auction Arena: bid to win (and to profit)</h2>
  <p>Three bots and you compete for an item each round. Winning is easy: just bid a lot. Winning <b>with a profit</b> is the real game. You only know your own value, you cannot see rival bids, and the auction rules change what the smartest bid is.</p>
  ${auScene(null,null,0,null)}
  <h3 class="m" style="margin-top:18px">1. Pick an auction format</h3>
  <div class="grid" style="gap:14px">${Object.keys(AUF).map(k=>`<button class="pdo" type="button" data-f="${k}" aria-pressed="${k===M}"><b>${AUF[k].n}</b><br>${AUF[k].d}</button>`).join('')}</div>
  <h3 class="m" style="margin-top:18px">2. Pick the number of rounds</h3>
  <div>${[5,10,15].map(n=>`<button class="chip" type="button" data-n="${n}" aria-pressed="${n===N}">${n} rounds</button>`).join('')}</div>
  <div class="tbs"><button class="tb" type="button" id="go">Start bidding</button></div>`;
  el.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{M=b.dataset.f;el.querySelectorAll('[data-f]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
  el.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{N=+b.dataset.n;el.querySelectorAll('[data-n]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
  el.querySelector('#go').onclick=start;
 };
 const start=()=>{S={m:M,rounds:[],tot:[0,0,0,0],rev:0,r:0};next();};
 // draw a fresh round: private values 0-100, or a hidden worth V with noisy estimates
 const next=()=>{
  const c={};
  if(priv()){c.x=[0,1,2,3].map(()=>Math.round(Math.random()*100));}
  else{c.V=Math.round(50+Math.random()*100);c.x=[0,1,2,3].map(()=>Math.round(c.V+(Math.random()*30-15)));}
  S.cur=c;bidScreen();
 };
 const bidScreen=()=>{
  const c=S.cur,x=c.x[0],p=priv();
  el.innerHTML=`<h2 class="m">${AUF[S.m].n} auction</h2>
  <p style="margin:0"><b>Round ${S.r+1} of ${N}</b> | Your total profit: <b>${S.tot[0]}</b></p>
  <div class="info pdbig">${p?`This item is worth <b>${x}</b> to you.`:`Your inspectors estimate the item is worth about <b>${x}</b>. The true worth is hidden, and each rival got their own estimate that is off by up to 15 either way.`}<br><small>${AUF[S.m].d}</small></div>
  <div id="asc">${auScene(null,null,0,x)}</div>
  <p class="pdbig m" style="text-align:center;margin:2px 0">What's your bid?</p>
  <div style="display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap"><button class="chip" type="button" data-st="-5">−5</button><input id="ab" type="range" min="0" max="${p?100:170}" value="${x}" aria-label="Your bid" style="flex:1 1 220px;max-width:380px"><button class="chip" type="button" data-st="5">+5</button></div>
  <p class="pdbig" id="abh" aria-live="polite" style="margin:4px 0;text-align:center"></p>
  <div class="tbs"><button class="tb" type="button" id="bid">🔨 Place bid</button></div><p style="text-align:center;margin:0"><button class="chip" type="button" id="qt">Quit game</button></p>
  <div class="hist" aria-label="Past rounds">${S.rounds.map((r,k)=>`<span class="hr" title="Round ${k+1}">${r.w===0?(r.profit>=0?'🏆':'😬'):'·'}${r.w===0?(r.profit>=0?'+':'')+r.profit:''}</span>`).join('')}</div>`;
  const sl=el.querySelector('#ab'),sc=el.querySelector('#asc'),bh=el.querySelector('#abh');
  const u=()=>{const b=+sl.value;sc.innerHTML=auScene(null,null,0,b);
   bh.textContent=p?(x===0?'Your value is 0, so any win loses money.':Math.round(b/x*100)+'% of your value.'+(b>x?' Careful: above your value you lose money if you win.':'')):(b===x?'Same as your estimate.':b>x?(b-x)+' above your estimate.':(x-b)+' below your estimate.');};
  sl.oninput=u;u();
  el.querySelector('#qt').onclick=menu;el.querySelectorAll('[data-st]').forEach(c=>c.onclick=()=>{sl.value=Math.max(0,Math.min(+sl.max,+sl.value+ +c.dataset.st));u();});
  el.querySelector('#bid').onclick=()=>resolve(+sl.value);
 };
 // all bids in, find the winner and the price
 const resolve=b0=>{
  const c=S.cur,p=priv();
  const bids=[b0,...AUB.map((o,i)=>Math.max(0,Math.round(o.f(c.x[i+1],S.m))))];
  const mx=Math.max(...bids),tops=bids.map((b,i)=>b===mx?i:-1).filter(i=>i>=0),w=tops[Math.floor(Math.random()*tops.length)];
  const sorted=[...bids].sort((a,b)=>b-a);
  const price=S.m==='sp'?sorted[1]:mx;
  const worth=p?c.x[w]:c.V,profit=worth-price;
  S.tot[w]+=profit;S.rev+=price;SFX.play('gavel');setTimeout(()=>SFX.play(w===0?(profit>=0?'coin':'buzz'):'click'),260);
  S.rounds.push({x:c.x[0],b:b0,w,price,profit,V:c.V,ws:c.x[w]});
  S.r++;
  const eq=S.m==='fp'?Math.round(c.x[0]*.75):S.m==='sp'?c.x[0]:c.x[0]-16;
  let msg;
  if(w===0)msg=profit>=0?`🏆 <b>You won!</b> The item was worth ${worth} and you paid ${price}: profit <b>+${profit}</b>.`:`😬 <b>You won, but lost money.</b> It was worth ${worth} and you paid ${price}: <b>${profit}</b>.${p?' Never bid above your value.':" That is the winner's curse in action."}`;
  else msg=`You lost to <b>${nm[w]}</b>, who bid ${mx}${S.m==='sp'?' and paid '+price:''}.${profit<0?` Their win cost them ${-profit}.`:''}`;
  const last=S.r>=N;
  el.innerHTML=`<h2 class="m">Round ${S.r} result</h2>
  ${auScene(bids,w,price)}
  <div style="overflow-x:auto"><table class="pdm" aria-label="Bids this round"><tr><th>Bidder</th><th>Bid</th><th>Outcome</th></tr>${bids.map((b,i)=>`<tr><td>${em[i]} <b>${nm[i]}</b></td><td class="${i===w?'hl':''}">${b}</td><td>${i===w?'🏆 pays '+price:'–'}</td></tr>`).join('')}</table></div>
  <p class="pdbig">${msg}</p>
  ${p?'':`<div class="info">The true worth was <b>${c.V}</b>. The winning bidder's estimate was ${c.x[w]} (${c.x[w]>=c.V?'+':''}${c.x[w]-c.V} from the truth).</div>`}
  <div class="info"><small>A rational bid for your ${p?'value':'estimate'} of ${c.x[0]} would have been about <b>${Math.max(0,eq)}</b>${S.m==='sp'?' (your true value, in a second-price auction)':''}. You bid ${b0}.</small></div>
  <p>Your total profit: <b>${S.tot[0]}</b></p>
  <div class="tbs"><button class="tb" type="button" id="nx">${last?'See final results':'Next round'}</button></div><p style="text-align:center"><button class="chip" type="button" id="qt">Quit game</button></p>`;
  el.querySelector('#nx').onclick=last?end:next;
  el.querySelector('#qt').onclick=menu;
 };
 const end=()=>{
  const rs=S.rounds,p=priv(),wins=rs.filter(r=>r.w===0);
  const order=[0,1,2,3].sort((a,b)=>S.tot[b]-S.tot[a]),mxa=Math.max(1,...S.tot.map(Math.abs));
  const rat=rs.filter(r=>r.x>0).reduce((a,r)=>a+r.b/r.x,0)/Math.max(1,rs.filter(r=>r.x>0).length);
  const truthful=rs.filter(r=>Math.abs(r.b-r.x)<=3).length/rs.length;
  const wsErr=rs.reduce((a,r)=>a+(r.ws-r.V),0)/rs.length;
  const myErr=wins.length?wins.reduce((a,r)=>a+(r.x-r.V),0)/wins.length:null;
  let tip;
  if(S.m==='fp')tip=rat>=.93?"You bid almost your full value. In a first-price auction that leaves no profit even when you win. Shading to about 75% (Rational Rita's rule with four bidders) balances winning often against keeping a margin.":rat<=.55?'You bid very low, so you won rarely. Shading is good, but too much means rivals take every item. The equilibrium is about 75% of your value with four bidders.':'Nice shading! The equilibrium with four bidders is about 75% of your value: low enough to profit, high enough to win often.';
  else if(S.m==='sp')tip=truthful>=.7?'You bid close to your true value, which is the <b>dominant strategy</b> in a second-price auction: the price depends on rivals, not on you, so you only decide whether winning is worth it.':'In a second-price auction bidding your true value is optimal. Bidding lower risks losing items you would have profited from, and bidding higher risks paying more than the item is worth.';
  else tip=S.tot[0]<0?"The winner's curse hit you. The bidder with the highest estimate usually has the biggest error in their favour, so winning is bad news about the item. Rational Rita shaves 16 off her estimate to compensate.":'You shaded your estimate and avoided the curse. Winning means your estimate was probably too high, so smart bidders bid below their estimate.';
  el.innerHTML=`<h2 class="m">Auction over!</h2>
  <div class="info pdbig"><b>${order[0]===0?'🏆 You finished first!':'You finished #'+(order.indexOf(0)+1)+'.'}</b><br>${order.map(i=>`${em[i]} ${nm[i]}: <b>${S.tot[i]}</b>`).join(' &nbsp;|&nbsp; ')}</div>
  ${order.map(i=>`<p style="margin:6px 0"><small>${em[i]} ${nm[i]}</small><span class="bar" style="display:block;max-width:none"><i style="width:${Math.max(2,Math.abs(S.tot[i])/mxa*100)}%;${S.tot[i]<0?'background:var(--red)':''}"></i></span></p>`).join('')}
  <p>You won <b>${wins.length}</b> of ${rs.length} rounds.${p?` On average you bid <b>${Math.round(rat*100)}%</b> of your value.`:''}</p>
  ${p?`<div class="info"><b>Auctioneer's revenue:</b> ${S.rev} (${(S.rev/rs.length).toFixed(1)} per round). With four rational bidders and values spread evenly, theory says about 60 per round in <i>both</i> formats: this is the <b>revenue equivalence theorem</b>.</div>`:`<div class="info"><b>The curse in numbers:</b> the winning estimate was on average <b>${wsErr>=0?'+':''}${wsErr.toFixed(1)}</b> away from the true worth.${myErr!==null?` In rounds you won, your own estimate was ${myErr>=0?'+':''}${myErr.toFixed(1)} off.`:''} Winning selects for optimistic errors.</div>`}
  <div class="info">💡 ${tip}</div>
  <h3 class="m" style="margin-top:18px">The bots revealed</h3>
  ${AUB.map(o=>`<div class="info"><b>${o.e} ${o.n}:</b> ${o.r}</div>`).join('')}
  <p style="margin-top:14px"><button class="btn cy" type="button" id="ag">Play again</button><button class="btn" type="button" id="ch">Try another format</button><a class="btn" href="#/game-theory-hackathon">Game Theory Hackathon</a></p>`;
  el.querySelector('#ag').onclick=start;
  el.querySelector('#ch').onclick=menu;
 };
 menu();
}

YK.register({
  id:"auction",
  pillar:'compete',
  icon:'🔨',
  title:'Auction Arena',
  description:"Bid against 3 bots in real auction formats and beat the winner's curse.",
  events:['game-theory-hackathon','robotics-hackathon','technical-hackathon','team-challenge'],
  thumb:'games/auction/thumb.jpg',
  theory:`<p>Auctions are <b>games of hidden information</b>: you know your own value but not what rivals will bid. They decide who gets mobile spectrum and oil leases, and every Google search runs an ad auction in milliseconds. Multi-robot teams even use them to share tasks, with each robot bidding its own cost (distance, battery) and the cheapest bid taking the job.</p><ul><li><b>First-price:</b> bidding your value earns nothing, so you <b>shade</b>. With n bidders and values spread evenly, the equilibrium bid is <b>value x (n-1)/n</b>: 75% with four bidders, 90% with ten. More rivals means less shading.</li><li><b>Second-price (Vickrey):</b> bidding your true value is a <b>dominant strategy</b>. The price depends on the runner-up, not on you, so honesty is optimal. William Vickrey won a Nobel Prize for this.</li><li><b>Revenue equivalence:</b> if everyone plays the equilibrium, the seller earns the same on average in both formats.</li><li><b>Winner's curse:</b> when the item has one true worth and you only get a noisy estimate, the winner is usually the one who overestimated the most. Winning is bad news, so smart bidders bid <b>below</b> their estimate.</li></ul>`,
  demo:b=>TIN(b,'Try it: how much should you shade?',SL('v','Your value',10,100,70)+SL('n','Number of bidders',2,12,4),v=>{const x=v('v'),n=v('n'),bid=x*(n-1)/n,pw=Math.pow(x/100,n-1),ep=x/n*pw;return `First-price: bid <b>${bid.toFixed(0)}</b> (shade by ${(100/n).toFixed(0)}%).<br>Second-price: bid your true value, <b>${x}</b>.<br>Chance of winning with the first-price bid: <b>${(pw*100).toFixed(1)}%</b>, expected profit <b>${ep.toFixed(1)}</b>.<br><small>More bidders: less shading, but a much lower chance of winning.</small>`}),
  run:el=>{el.innerHTML='<div id="au"></div>';auctionInit(el.firstChild);}
 });
})();

/* Yantrika game: Maze Finder
   Open source (MIT). Edit freely and send a pull request: see CONTRIBUTING.md
   and games/README.md for the game API. */
(function(){
'use strict';

// GAME: Maze Finder
// Levels: [name, size, fog radius (0 = none), battery multiplier (0 = unlimited), hints allowed]
function maze(el){
 const LV=[['Easy',10,0,0,1],['Medium',16,0,3,1],['Hard',22,6,3,1],['Nightmare',30,5,2.5,0]],HC=8,SZ=600,DX=[0,1,0,-1],DY=[-1,0,1,0],AR=[['▲',0],['◀',3],['▼',2],['▶',1]];
 let lv=1,n=16,walls=[],p=0,goal=0,hint=null,moves=0,cap=0,seen=new Set(),t0=0,won=false,lost=false;const best={};
 el.innerHTML=`<h2 class="m">Maze Finder</h2><p>Robots need to find their way out. Guide the bot 🤖 to the flag 🏁 using arrow keys, WASD or the buttons. Harder levels add a <b>limited battery 🔋</b> (every move costs charge) and <b>fog of war 🌫️</b>: you only see what is close to you, so remember the dead ends. The flag is always placed as far from the start as possible.</p>
 <div id="mlv">${LV.map((l,i)=>`<button class="chip" type="button" data-l="${i}" aria-pressed="${i===lv}">${l[0]}</button>`).join('')}</div>
 <div style="display:flex;flex-wrap:wrap;gap:20px;align-items:center;margin:12px 0"><canvas id="mz" width="${SZ}" height="${SZ}" style="flex:1 1 300px;min-width:0;max-width:600px;aspect-ratio:1;border:3px solid var(--dk);border-radius:10px;background:var(--card);display:block;margin:0" role="img" aria-label="Maze board"></canvas><div style="display:grid;grid-template-columns:repeat(3,68px);grid-template-areas:'. u .' 'l d r';gap:8px;margin:0;flex:0 0 auto">${AR.map((a,i)=>`<button class="btn" type="button" data-d="${a[1]}" aria-label="Move ${['up','left','down','right'][i]}" style="margin:0;grid-area:${['u','l','d','r'][i]};padding:16px 0;font-size:1.4rem">${a[0]}</button>`).join('')}</div></div>
 <div class="info" id="mi" aria-live="polite"></div>
 <button class="btn cy" type="button" id="mn">New maze</button><button class="btn" type="button" id="mr">Retry this maze</button><button class="btn" type="button" id="ms">Show shortest path</button>`;
 const cv=el.querySelector('#mz'),cx=cv.getContext('2d'),mi=el.querySelector('#mi');
 const bfs=s0=>{const pr=new Array(n*n).fill(-1),ds=new Array(n*n).fill(0),q=[s0];pr[s0]=s0;for(let i=0;i<q.length;i++){const c=q[i];for(let d=0;d<4;d++){if(walls[c][d])continue;const nc=((c/n|0)+DY[d])*n+c%n+DX[d];if(pr[nc]<0){pr[nc]=c;ds[nc]=ds[c]+1;q.push(nc);}}}return[pr,ds];};
 const info=m=>{const left=cap-moves;if(LV[lv][2]&&!won&&!lost){const gx=(goal%n)-(p%n),gy=(goal/n|0)-(p/n|0);m+=' 🧭 Flag is '+(Math.abs(gy)>2?(gy<0?'north':'south'):'')+(Math.abs(gx)>2?(gx<0?'-west':'-east'):'')+' of you.';m=m.replace('is -','is ');}mi.innerHTML='<b>'+m+'</b><br>Moves: <b>'+moves+'</b>'+(cap?' of <b>'+cap+'</b> 🔋':'')+' | Best on '+LV[lv][0]+': <b>'+(best[lv]!=null?best[lv]+' moves':'none yet')+'</b>'+(cap?'<div class="bar" style="margin-top:6px"><i style="width:'+Math.max(0,left/cap*100)+'%;background:'+(left<cap*.25?'var(--red)':'var(--cy)')+'"></i></div>':'');};
 const reveal=()=>{const r=LV[lv][2];if(!r)return;const px=p%n,py=p/n|0;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const X=px+x,Y=py+y;if(X>=0&&Y>=0&&X<n&&Y<n&&x*x+y*y<=r*r)seen.add(Y*n+X);}};
 const reset=()=>{p=0;hint=null;moves=0;t0=0;won=lost=false;seen=new Set();reveal();info(LV[lv][2]?'🌫️ Fog of war! Only the lit area around your bot is visible, explored cells stay on the map.':'Reach the flag!');draw();};
 const gen=()=>{
  n=LV[lv][1];walls=Array.from({length:n*n},()=>[1,1,1,1]);
  const sn=new Set([0]),st=[0];
  while(st.length){
   const c=st[st.length-1],x=c%n,y=(c/n)|0,o=[0,1,2,3].filter(d=>{const nx=x+DX[d],ny=y+DY[d];return nx>=0&&ny>=0&&nx<n&&ny<n&&!sn.has(ny*n+nx);});
   if(!o.length){st.pop();continue;}
   const d=o[Math.floor(Math.random()*o.length)],nc=(y+DY[d])*n+x+DX[d];
   walls[c][d]=0;walls[nc][(d+2)%4]=0;sn.add(nc);st.push(nc);
  }
  const ds=bfs(0)[1];goal=ds.indexOf(Math.max(...ds));cap=LV[lv][3]?Math.ceil(ds[goal]*LV[lv][3]):0;
  reset();
 };
 const draw=()=>{
  const s=SZ/n,r=LV[lv][2],px=p%n,py=p/n|0,ink=getComputedStyle(cv).getPropertyValue('--ink').trim()||'#17171d';
  cx.clearRect(0,0,SZ,SZ);cx.font=(s*.6)+'px sans-serif';cx.textAlign='center';cx.textBaseline='middle';
  cx.strokeStyle=ink;cx.lineWidth=n>18?2.5:4;cx.lineCap='round';cx.beginPath();
  walls.forEach((w,c)=>{const x=(c%n)*s,y=((c/n)|0)*s;
   if(w[0]){cx.moveTo(x,y);cx.lineTo(x+s,y);}if(w[1]){cx.moveTo(x+s,y);cx.lineTo(x+s,y+s);}
   if(w[2]){cx.moveTo(x,y+s);cx.lineTo(x+s,y+s);}if(w[3]){cx.moveTo(x,y);cx.lineTo(x,y+s);}});
  cx.stroke();
  if(r)for(let c=0;c<n*n;c++){const x=c%n,y=c/n|0;if(!seen.has(c)){cx.fillStyle='#2b2e3d';cx.fillRect(x*s-.5,y*s-.5,s+1,s+1);cx.fillStyle='#454a60';cx.fillRect(x*s+s/2-1.5,y*s+s/2-1.5,3,3);}else if((x-px)**2+(y-py)**2>r*r){cx.fillStyle='rgba(43,46,61,.45)';cx.fillRect(x*s,y*s,s,s);}}
  if(r){cx.strokeStyle='#f1c40f';cx.lineWidth=2.5;cx.setLineDash([6,5]);cx.beginPath();cx.arc((px+.5)*s,(py+.5)*s,r*s,0,7);cx.stroke();cx.setLineDash([]);}
  if(hint){cx.strokeStyle='#33d6a6';cx.lineWidth=s*.25;cx.lineJoin='round';cx.beginPath();hint.forEach((c,i)=>{const X=(c%n+.5)*s,Y=((c/n|0)+.5)*s;i?cx.lineTo(X,Y):cx.moveTo(X,Y);});cx.stroke();}
  if(!r||seen.has(goal)||hint)cx.fillText('🏁',(goal%n+.5)*s,((goal/n|0)+.55)*s);
  cx.fillText('🤖',(px+.5)*s,(py+.55)*s);
 };
 const go=d=>{
  if(won||lost)return;if(walls[p][d]){SFX.play('bump');return;}SFX.play('step');
  if(!t0)t0=performance.now();
  p=((p/n|0)+DY[d])*n+p%n+DX[d];moves++;hint=null;reveal();
  if(p===goal){won=true;SFX.play('win');const sec=Math.round((performance.now()-t0)/1000);if(best[lv]==null||moves<best[lv])best[lv]=moves;info('🎉 Escaped in '+moves+' moves and '+sec+' s!');}
  else if(cap&&moves>=cap){lost=true;SFX.play('lose');info('🪫 Battery dead! Press Retry this maze, or make a new one.');}
  else info(cap&&cap-moves<=10?'⚠️ Battery low!':'Keep going!');
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
 el.querySelector('#mr').onclick=reset;
 el.querySelector('#ms').onclick=()=>{
  if(won||lost)return;
  if(!LV[lv][4]){info('🚫 No shortest-path help on '+LV[lv][0]+'.');return;}
  const pr=bfs(p)[0],path=[];let c=goal;while(c!==p){path.push(c);c=pr[c];}path.push(p);hint=path.reverse();SFX.play('hint');
  if(cap){moves+=HC;if(moves>=cap){lost=true;SFX.play('lose');hint=null;info('🪫 The hint drained the last of your battery!');draw();return;}}
  info('Shortest path from here: '+(hint.length-1)+' moves'+(cap?' (hint cost '+HC+' charge)':''));draw();
 };
 gen();
}

YK.register({
  id:"maze",
  pillar:'compete',
  icon:'🧭',
  title:'Maze Finder',
  description:'Guide the bot through a random maze to the flag.',
  events:['robotics-hackathon','technical-hackathon','team-challenge'],
  thumb:'games/maze/thumb.png',
  theory:`<p>The maze is generated with <b>depth-first search</b> (a random walk that backtracks), giving a <b>perfect maze</b> with exactly one path between any two cells. The shortest-path button uses <b>breadth-first search</b>, which explores outward level by level. Robot navigation and GPS routing use the same graph ideas (A*, Dijkstra).</p>`,
  demo:b=>{const RW=['S.........','..#####.#.','..#...#.#.','..#.#.#...','....#...#.','.####.###.','.#..#...#.','.#.##.#.#.','.#....#...','.####.##.E'],C=10,st=RW.join('').indexOf('S'),gl=RW.join('').indexOf('E'),W=RW.join('');const NM={bfs:['BFS','Explores level by level. Always finds the shortest path, but visits many cells.'],dfs:['DFS','Dives deep, backtracks at dead ends. Low memory, but the path found may be long.'],gr:['Greedy','Always heads toward the goal. Fast when the way is open, but walls can fool it into a longer path.'],as:['A*','Mixes steps taken with distance left. Shortest path, usually fewer cells explored.']};
const run=a=>{const hh=n=>Math.abs((n/C|0)-(gl/C|0))+Math.abs(n%C-gl%C),prev={[st]:-1},dist={[st]:0},seen=new Set([st]),op=[st],ord=[];while(op.length){let i=a==='dfs'?op.length-1:0;if(a==='gr'||a==='as'){let bs=1e9;op.forEach((n,k)=>{const f=a==='gr'?hh(n):dist[n]+hh(n);if(f<bs){bs=f;i=k}})}const n=op.splice(i,1)[0];ord.push(n);if(n===gl)break;[[0,1],[1,0],[0,-1],[-1,0]].forEach(([dy,dx])=>{const y=(n/C|0)+dy,x=n%C+dx,m=y*C+x;if(y<0||x<0||y>=C||x>=C||W[m]==='#'||seen.has(m))return;seen.add(m);prev[m]=n;dist[m]=dist[n]+1;op.push(m)})}const path=new Set();for(let n=gl;n!==-1&&n!==undefined;n=prev[n])path.add(n);return{ord,path}};
b.innerHTML=`<div class="tiny"><h4 class="m">🧪 Try it: same maze, different algorithms</h4><div>${Object.keys(NM).map(k=>`<button class="chip" type="button" data-a="${k}" aria-pressed="false">${NM[k][0]}</button>`).join('')}</div><div id="tg" style="display:grid;grid-template-columns:repeat(${C},22px);gap:2px;margin:10px 0"></div><div id="ti_o">Pick an algorithm to watch it search.</div></div>`;
const g=b.querySelector('#tg'),draw=(vis,path)=>{g.innerHTML=[...W].map((c,n)=>`<div style="width:22px;height:22px;font-size:.8rem;line-height:22px;text-align:center;border-radius:3px;background:${c==='#'?'var(--dk)':path&&path.has(n)?'var(--cy)':vis&&vis.has(n)?'var(--yel)':'var(--soft)'}">${n===st?'🤖':n===gl?'🏁':''}</div>`).join('')};draw();
b.querySelectorAll('[data-a]').forEach(c=>c.onclick=()=>{b.querySelectorAll('[data-a]').forEach(x=>x.setAttribute('aria-pressed',x===c));const a=c.dataset.a,r=run(a);draw(new Set(r.ord),r.path);b.querySelector('#ti_o').innerHTML=`<b>${NM[a][0]}</b>: explored <b>${r.ord.length}</b> cells (yellow), path of <b>${r.path.size-1}</b> steps (green).<br>${NM[a][1]}`})},
  run:maze
 });
})();

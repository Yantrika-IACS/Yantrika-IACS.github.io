/* Yantrika game: Pass It On
   Open source (MIT). Edit freely and send a pull request: see CONTRIBUTING.md
   and games/README.md for the game API. */
(function(){
'use strict';

const SH=()=>[['Mentor a newcomer','Walk a first-timer through their first circuit. Everyone you help becomes a builder too.','Join as a mentor','#/join'],['Teach at a school','Help run the free hands-on workshop for school students planned for Dec 2026.','Volunteer with us','#/join'],['Sponsor an event','Companies and individuals can back a workshop or a hackathon.','Support the club','#/donate'],['Spread the word','Follow us and show a friend what you built.','Follow on Instagram',LINKS.ig]];

const panel=()=>`<h2 class="m">Share: how will you pass it on?</h2><p>What we learn is worth more when it travels. Pick a way to share.</p>
<div>${SH().map((s,i)=>`<button class="chip" type="button" aria-pressed="false" data-i="${i}">${s[0]}</button>`).join('')}</div>
<div class="info" id="si">Choose one above and we will point you to the next step.</div>`;

const wire=root=>{
 const inf=root.querySelector('#si');
 root.querySelectorAll('[data-i]').forEach(c=>c.onclick=()=>{
  root.querySelectorAll('[data-i]').forEach(x=>x.setAttribute('aria-pressed',x===c));
  const s=SH()[+c.dataset.i],ext=s[3].startsWith('http');
  inf.innerHTML='<b>'+s[0]+'</b><br>'+s[1]+'<br><a class="btn cy" href="'+s[3]+'"'+(ext?' target="_blank" rel="noopener"':'')+'>'+s[2]+'</a>';
 });
};

YK.register({
  id:"pick",
  pillar:'share',
  icon:'📣',
  title:'Pass It On',
  description:'Choose how you will share what you learn.',
  events:['schools-outreach','semester-outreach','talks-mentorship'],
  thumb:'games/pick/thumb.png',
  theory:`<p>Teaching is one of the best ways to learn, known as the <b>protégé effect</b>. Knowledge also has a <b>network effect</b>: each person who learns can teach several more, so impact grows far faster than one club could manage alone.</p>`,
  demo:b=>TIN(b,'Try it: the network effect',SL('k','New people each learner teaches per round',1,5,2),v=>{const k=v('k');return `After 5 rounds, starting from 1 person: <b>${(k+1)**5}</b> people know it.`}),
  run:el=>{el.innerHTML=panel();wire(el);}
 });
})();

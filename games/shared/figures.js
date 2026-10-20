/* Shared artwork: the cartoon "fez" characters used by Prisoner's Dilemma and Auction Arena.
   Use it in your own game with:  YK.figure(x, hatColour, mood)
   mood: 'normal' | 'happy' | 'sad' | 'angry' | 'devil'   (returns an SVG <g> string) */
(function(){
'use strict';
// Game of Trust scene: you (red fez) | coin machine | other player (blue fez)
const face=m=>({happy:'<path d="M-8 160Q0 169 8 160" fill="none"/>',sad:'<path d="M-7 165Q0 157 7 165" fill="none"/><circle cx="11" cy="158" r="2.6" fill="#338eda" stroke="none"/>',angry:'<path d="M-13 144L-3 149M13 144L3 149M-7 163H7" fill="none"/>',devil:'<path d="M-14 143L-3 150M14 143L3 150" fill="none"/><path d="M-11 158Q0 176 11 158Z" fill="#17171d"/><path d="M-6 160V164M0 161V166M6 160V164" stroke="#fff" stroke-width="2.2" fill="none"/>'})[m]||'';

const figure=(x,hat,m)=>`<g transform="translate(${x} 0)" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="var(--card)"><circle cx="0" cy="150" r="22"/><circle cx="-7" cy="152" r="2.8" fill="var(--ink)" stroke="none"/><circle cx="7" cy="152" r="2.8" fill="var(--ink)" stroke="none"/>${face(m)}${m==='devil'?'<path d="M-14 132L-25 106L-6 124ZM14 132L25 106L6 124Z" fill="var(--red)"/>':''}<path d="M-24 214V192Q-24 176-12 174H12Q24 176 24 192V214"/><path d="M-14 132L-10 106H10L14 132Z" fill="${hat}"/><path d="M8 110Q28 98 24 120" fill="none"/></g>`;
YK.figure=figure;
})();

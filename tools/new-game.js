#!/usr/bin/env node
/* Scaffold a new game:   node tools/new-game.js <id> "<Title>" <pillar>
   Example:               node tools/new-game.js sort-race "Sorting Race" compete
   Copies games/_template to games/<id>/ and adds <id> to games/manifest.js. */
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const [id,title,pillar]=process.argv.slice(2);
const PILLARS=['learn','build','compete','share'];
if(!id||!title||!PILLARS.includes(pillar)){
 console.error('Usage: node tools/new-game.js <id> "<Title>" <learn|build|compete|share>');process.exit(1);
}
if(!/^[a-z0-9-]+$/.test(id)||id.startsWith('_')||id==='shared'||id==='template'){console.error('id must be lowercase letters, numbers and dashes (not "template" or "shared")');process.exit(1);}
const dest=path.join(root,'games',id);
if(fs.existsSync(dest)){console.error('games/'+id+' already exists');process.exit(1);}
fs.mkdirSync(dest);
let js=fs.readFileSync(path.join(root,'games/_template/game.js'),'utf8');
js=js.replace("id:'template',","id:'"+id+"',")
     .replace("pillar:'learn',","pillar:'"+pillar+"',")
     .replace('title:"Ohm\'s Law Sprint",','title:'+JSON.stringify(title)+',')
     .replace("games/template/thumb.svg","games/"+id+"/thumb.svg")
     .replace(/tpl-/g,id.replace(/[^a-z0-9]/g,'')+'-');
fs.writeFileSync(path.join(dest,'game.js'),js);
fs.copyFileSync(path.join(root,'games/_template/thumb.svg'),path.join(dest,'thumb.svg'));
const mp=path.join(root,'games/manifest.js');
let m=fs.readFileSync(mp,'utf8');
const re=/(games:\[[\s\S]*?)(\n\s*\]\s*\n\};)/;
if(!re.test(m)){console.error('Could not edit games/manifest.js. Add \''+id+'\' to the games list by hand.');process.exit(1);}
m=m.replace(re,(_,a,b)=>a.replace(/\s*$/,'')+",\n  '"+id+"'"+b);
fs.writeFileSync(mp,m);
console.log('Created games/'+id+'/ and added it to games/manifest.js\nNext: open index.html in a browser, play your game, then edit games/'+id+'/game.js\nBefore a pull request: node tools/check-games.js');

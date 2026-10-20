#!/usr/bin/env node
/* Checks every game in games/ so mistakes are caught before a pull request.
   Run:  node tools/check-games.js        (no installs needed, just Node 18+)
   Exit code 1 = at least one problem. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..'),gdir=path.join(root,'games');
const PILLARS=['learn','build','compete','share'];
const IMG=['.png','.jpg','.jpeg','.webp','.svg','.avif'];
const MAX_THUMB=500*1024, MAX_JS=150*1024;
const errors=[],warnings=[];
const err=(g,m)=>errors.push(`[${g}] ${m}`),warn=(g,m)=>warnings.push(`[${g}] ${m}`);

// ---- event ids that exist on the site (from the EV list in index.html)
const idx=fs.readFileSync(path.join(root,'index.html'),'utf8');
const evBlock=(idx.match(/const EV=\[([\s\S]*?)\n\];/)||[])[1]||'';
const eventIds=new Set([...evBlock.matchAll(/\{id:'([^']+)'/g)].map(m=>m[1]));
if(!eventIds.size)warnings.push('[site] could not read event ids from index.html, event checks skipped');

// ---- read manifest
let manifest;
try{
 const sb={YK:{}};vm.createContext(sb);
 vm.runInContext(fs.readFileSync(path.join(gdir,'manifest.js'),'utf8'),sb,{filename:'manifest.js'});
 manifest=sb.YK.manifest;
 if(!manifest||!Array.isArray(manifest.games))throw new Error('YK.manifest.games must be a list');
}catch(e){console.error('games/manifest.js is broken: '+e.message);process.exit(1);}

// ---- every folder with a game.js must be listed (and the reverse)
const folders=fs.readdirSync(gdir,{withFileTypes:true}).filter(d=>d.isDirectory()&&d.name!=='shared'&&!d.name.startsWith('_')).map(d=>d.name);
folders.filter(f=>!manifest.games.includes(f)).forEach(f=>err(f,'folder is not listed in games/manifest.js'));
const dup=manifest.games.filter((g,i)=>manifest.games.indexOf(g)!==i);dup.forEach(g=>err(g,'listed twice in games/manifest.js'));
for(const s of manifest.shared||[])if(!fs.existsSync(path.join(gdir,s)))err('shared',`games/${s} listed but missing`);

// ---- patterns games must not use (offline, private, safe)
const BANNED=[
 [/\bfetch\s*\(/,'network request (fetch). Games must work offline'],
 [/XMLHttpRequest|WebSocket|EventSource|sendBeacon/,'network request. Games must work offline'],
 [/\beval\s*\(|new\s+Function\s*\(/,'eval / new Function'],
 [/document\.write|importScripts|\bimport\s*\(/,'dynamic code loading'],
 [/document\.cookie/,'cookies. Games must not track people'],
 [/(src|href)\s*=\s*["']https?:\/\/[^"']*\.(js|css|woff2?|png|jpe?g|gif|svg|webp|mp3|mp4)\b/i,'external file. Put assets inside your game folder'],
 [/<script/i,'<script> tag inside a game'],
 [/localStorage|sessionStorage|indexedDB/,null] // warn only
];

// ---- load one game file in an empty sandbox and capture YK.register()
function load(file,id){
 let reg=null;
 const noop=()=>{};
 const sb={YK:{register:d=>{reg=d;},figure:()=>''},esc:s=>String(s),SFX:{play:noop,toggle:noop,on:true},SL:()=>'',TIN:noop,EV:[],LINKS:{ig:'#',web:'#',mail:'',li:''},PIL:[],console};
 vm.createContext(sb);
 try{vm.runInContext(fs.readFileSync(file,'utf8'),sb,{filename:file,timeout:2000});}
 catch(e){err(id,'game.js throws when loaded: '+e.message);return null;}
 if(!reg)err(id,'game.js never calls YK.register(...)');
 return reg;
}

const toCheck=[...manifest.games,'_template'];
const seen=new Set();
for(const id of toCheck){
 const dir=path.join(gdir,id),file=path.join(dir,'game.js');
 if(!fs.existsSync(file)){err(id,`games/${id}/game.js not found`);continue;}
 const src=fs.readFileSync(file,'utf8');
 if(src.length>MAX_JS)err(id,`game.js is ${(src.length/1024)|0} KB (limit ${MAX_JS/1024} KB). Split assets out or simplify`);
 for(const [re,msg] of BANNED){const m=re.test(src);if(m&&msg)err(id,'not allowed: '+msg);else if(m)warn(id,'uses browser storage: keep it to small local settings, never personal data');}
 const d=load(file,id);if(!d)continue;
 const want=id==='_template'?'template':id;
 if(d.id!==want)err(id,`id in game.js is "${d.id}" but the folder is "${id}". They must match`);
 if(seen.has(d.id))err(id,'duplicate id '+d.id);seen.add(d.id);
 if(!/^[a-z0-9-]+$/.test(d.id||''))err(id,'id must be lowercase letters, numbers and dashes');
 if(!PILLARS.includes(d.pillar))err(id,`pillar must be one of ${PILLARS.join(', ')}`);
 for(const f of ['title','description'])if(typeof d[f]!=='string'||!d[f].trim())err(id,f+' is required');
 if(typeof d.title==='string'&&d.title.length>40)warn(id,'title is long (over 40 characters)');
 if(typeof d.description==='string'&&d.description.length>110)warn(id,'description is long. One short line works best');
 if(typeof d.run!=='function')err(id,'run must be a function');
 if(d.events!==undefined){
  if(!Array.isArray(d.events))err(id,'events must be a list');
  else if(eventIds.size)d.events.filter(e=>!eventIds.has(e)).forEach(e=>err(id,`event "${e}" does not exist in index.html (EV)`));
 }
 if(d.theory!==undefined&&typeof d.theory!=='string')err(id,'theory must be a string of HTML');
 if(d.demo!==undefined&&typeof d.demo!=='function')err(id,'demo must be a function');
 if(d.authors!==undefined&&!Array.isArray(d.authors))err(id,'authors must be a list');
 // thumbnail
 const thumb=d.thumb||`games/${id}/thumb.png`;
 const tp=path.join(root,thumb);
 if(!thumb.startsWith(`games/${want==='template'?'template':id}/`)&&id!=='_template')err(id,`thumb must live in games/${id}/ (got ${thumb})`);
 if(!fs.existsSync(tp)&&id!=='_template')err(id,`thumbnail file missing: ${thumb}`);
 else if(fs.existsSync(tp)){
  if(!IMG.includes(path.extname(tp).toLowerCase()))err(id,'thumbnail must be '+IMG.join(' '));
  const sz=fs.statSync(tp).size;if(sz>MAX_THUMB)err(id,`thumbnail is ${(sz/1024)|0} KB (limit ${MAX_THUMB/1024} KB). Compress or resize to about 800x800`);
 }
 // stray big files
 for(const f of fs.readdirSync(dir)){const sz=fs.statSync(path.join(dir,f)).size;if(sz>2*1024*1024)err(id,`${f} is over 2 MB`);}
}

warnings.forEach(w=>console.log('warning '+w));
errors.forEach(e=>console.log('ERROR   '+e));
console.log(`\nChecked ${manifest.games.length} games + template: ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length?1:0);

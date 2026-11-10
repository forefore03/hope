// Controller integration with a minimal DOM and controlled GPS, not a field GPS test.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {distance,interpolate,greenFor} from '../dist/golf-core.mjs';
class Node {
 constructor(){this.hidden=true;this.disabled=false;this.value='';this.textContent='';this.dataset={};this.style={};this.children=[];this.parentElement={hidden:true};}
 replaceChildren(){this.children=[];} append(n){this.children.push(n);} showModal(){this.open=true;} close(){this.open=false;}
}
const nodes=new Map(),get=s=>{if(!nodes.has(s))nodes.set(s,new Node());return nodes.get(s);};
const photos=[new Node(),new Node(),new Node()],finishes=[get('#finish-now'),get('#tee-finish')],greens=[new Node(),new Node()];
const events=new EventTarget();
globalThis.document={querySelector:get,querySelectorAll:s=>s==='[data-photo-open]'?photos:s==='[data-finish]'?finishes:s==='.green-choice'?greens:s==='.club'?[new Node()]:[],createElement:()=>new Node(),fonts:{load:()=>Promise.resolve([])},addEventListener:events.addEventListener.bind(events),dispatchEvent:events.dispatchEvent.bind(events)};
const saved=new Map();globalThis.localStorage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)};
globalThis.indexedDB={open(){throw Error('media unavailable in this controller test');}};
const pack=JSON.parse(fs.readFileSync(new URL('../dist/data/flamingo.json',import.meta.url)));
const jack=JSON.parse(fs.readFileSync(new URL('../dist/data/jack-nicklaus-korea.json',import.meta.url)));
let clubResults=[{name:'플라밍고 CC',...pack.location},{name:'다른 CC',lat:38,lon:127}];
globalThis.fetch=async url=>({ok:true,json:async()=>String(url).includes('golf-courses')?clubResults:String(url).includes('jack-nicklaus')?jack:pack});
let gpsCalls=0,position=pack.courses[0].holes[0].tees[0];
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{geolocation:{getCurrentPosition(resolve){gpsCalls++;resolve({coords:{latitude:position.lat,longitude:position.lon,accuracy:5}});}}}});
test('parking skip, GPS refresh, 12th-hole nudge and 18-hole finish without score entry',async()=>{
 await import('../dist/app.mjs');for(let i=0;i<10&&!saved.has('hope-outing-v1');i++)await new Promise(setImmediate);
 assert.equal(get('#parking-screen').hidden,false);assert.equal(gpsCalls,0);await get('#parking-save').onclick();assert.ok(JSON.parse(saved.get('hope-outing-v1')).parking);
 get('#parking-skip').onclick();assert.equal(get('#welcome').hidden,false);assert.equal(get('#welcome h1').textContent,'—');assert.equal(get('.choices').hidden,true);await get('#begin').onclick();assert.equal(get('#nearby').open,true);get('#nearby-list').children[0].onclick();assert.equal(get('#welcome h1').textContent,'플라밍고 CC');assert.equal(get('.choices').hidden,false);
 get('#start-course').value='links';get('#start-hole').value='0';await get('#begin').onclick();assert.equal(get('#photo-dialog').open,true);get('#photo-done').onclick();assert.equal(get('#photo-dialog').open,false);await get('#tee-fire').onclick();
 assert.equal(get('#remain').textContent,249);assert.equal(gpsCalls,3);
 position=interpolate(position,pack.courses[0].holes[0].greens[0],.5);await get('#refresh-button').onclick();assert.equal(get('#remain').textContent,125);assert.equal(get('.from').hidden,false);
 await get('#refresh-button').onclick();assert.equal(get('.from').hidden,true);
 for(let played=1;played<18;played++){
  get('#next-button').onclick();assert.equal(get('#next-dialog').open,true);get('#next-confirm').onclick();
  if(played===10)assert.equal(get('#photo-reminder').hidden,true);
  if(played===11){assert.equal(get('#photo-reminder').hidden,false);get('#reminder-dismiss').onclick();}
  const c=played<9?'links':'park',h=played%9+1,g=greenFor(pack,c,h);position={lat:g.lat+.002,lon:g.lon};await get('#tee-fire').onclick();assert.equal(get('#remain').textContent,Math.round(distance(position,g)));
 }
 assert.equal(JSON.parse(saved.get('hope-outing-v1')).completed,17);
 get('#next-button').onclick();assert.equal(get('#next-confirm').textContent,'마치기');get('#next-confirm').onclick();
 assert.equal(get('#finish-screen').hidden,false);assert.equal(get('main').hidden,true);assert.equal(saved.has('hope-live-round'),false);assert.equal(JSON.parse(saved.get('hope-outing-v1')).phase,'finished');assert.equal(get('#finish-card').hidden,true);assert.equal(gpsCalls,22);assert.ok(JSON.parse(saved.get('hope-outing-v1')).parking);await get('#parking-clear').onclick();assert.equal(JSON.parse(saved.get('hope-outing-v1')).parking,null);await get('#new-outing').onclick();get('#parking-skip').onclick();assert.equal(get('#welcome h1').textContent,'—');await get('#locate').onclick();get('#nearby-list').children[1].onclick();assert.equal(get('#welcome h1').textContent,'다른 CC');assert.equal(get('.choices').hidden,true);assert.equal(get('#begin').disabled,false);await import('../dist/app.mjs?restore-unsupported');for(let i=0;i<5;i++)await new Promise(setImmediate);assert.equal(get('#welcome h1').textContent,'다른 CC');assert.equal(get('#begin').disabled,false);assert.equal(get('#begin span').textContent,'다른 골프장 고르자');await get('#begin').onclick();assert.equal(get('#nearby').open,true);get('#nearby-close').onclick();get('#club-clear').onclick();assert.equal(get('#welcome h1').textContent,'—');assert.equal(JSON.parse(saved.get('hope-outing-v1')).club,undefined);assert.equal(get('#club-clear').hidden,true);await get('#begin').onclick();get('#nearby-list').children[0].onclick();assert.equal(get('#welcome h1').textContent,'플라밍고 CC');assert.equal(get('#begin').disabled,false);
});


test('Dunes course, left/right switches and nine-hole course transition',async()=>{
 assert.ok(get('#start-course').children.some(o=>o.value==='dunes'));
 get('#start-course').value='dunes';get('#start-hole').value='2';await get('#begin').onclick();if(get('#photo-dialog').open)get('#photo-done').onclick();
 assert.ok(get('#tee-course').textContent.includes('듄스 3번'));assert.equal(greens[0].value,'L');assert.deepEqual(greens[0].children.map(o=>o.textContent),['좌그린','우그린']);
 let g=greenFor(pack,'dunes',3,'L');position={lat:g.lat+.002,lon:g.lon};await get('#tee-fire').onclick();assert.equal(get('#remain').textContent,Math.round(distance(position,g)));
 greens[1].onchange({target:{value:'R'}});assert.equal(get('#remain').textContent,Math.round(distance(position,greenFor(pack,'dunes',3,'R'))));
 for(let h=4;h<=9;h++){
  get('#next-button').onclick();get('#next-confirm').onclick();g=greenFor(pack,'dunes',h,h===8?'L':'A');position={lat:g.lat+.002,lon:g.lon};await get('#tee-fire').onclick();assert.equal(get('#remain').textContent,Math.round(distance(position,g)));
  if(h===8){assert.equal(greens[0].value,'L');greens[1].onchange({target:{value:'R'}});assert.equal(get('#remain').textContent,Math.round(distance(position,greenFor(pack,'dunes',8,'R'))));}
 }
 get('#next-button').onclick();assert.equal(get('#next-course-label').hidden,false);get('#next-course').value='park';get('#next-confirm').onclick();assert.ok(get('#tee-course').textContent.includes('파크 1번'));
});

test('explicit departure clears personal state and allows a fresh outing',async()=>{await get('#finish-leave').onclick();assert.equal(saved.has('hope-outing-v1'),false);assert.equal(saved.has('hope-live-round'),false);assert.equal(saved.has('hope-course'),false);assert.equal(get('#finish-parking').hidden,true);await get('#new-outing').onclick();assert.equal(get('#parking-screen').hidden,false);assert.equal(get('#finish-leave').hidden,false);assert.equal(JSON.parse(saved.get('hope-outing-v1')).parking,null);});

test('welcome can return to parking without deleting the current outing',()=>{get('#parking-skip').onclick();const before=JSON.parse(saved.get('hope-outing-v1'));get('#parking-back').onclick();assert.equal(get('#parking-screen').hidden,false);assert.equal(get('#welcome').hidden,true);const after=JSON.parse(saved.get('hope-outing-v1'));assert.equal(after.id,before.id);assert.equal(after.phase,'parking');get('#parking-skip').onclick();assert.equal(get('#welcome').hidden,false);});

test('Jack Urban/Links selection, GPS refresh, course change and restoring shared Links ID stay in correct club',async()=>{
 clubResults=[{name:'잭 니클라우스 골프클럽 코리아',...jack.location},{name:'플라밍고C.C',...pack.location}];
 position={...jack.location};await get('#locate').onclick();get('#nearby-list').children[0].onclick();assert.deepEqual(get('#start-course').children.map(x=>x.value),['urban','links']);assert.equal(get('#start-course').value,'urban');
 get('#start-course').value='urban';get('#start-hole').value='0';await get('#begin').onclick();if(get('#photo-dialog').open)get('#photo-done').onclick();
 let g=greenFor(jack,'urban',1);position={lat:g.lat+.002,lon:g.lon};await get('#tee-fire').onclick();assert.equal(get('#remain').textContent,Math.round(distance(position,g)));assert.ok(get('#tee-course').textContent.includes('어반 1번'));assert.ok(get('#hole').textContent.includes('PAR 4'));
 position=interpolate(position,g,.5);await get('#refresh-button').onclick();assert.equal(get('#remain').textContent,111);
 get('#course').onchange({target:{value:'links'}});g=greenFor(jack,'links',1);position={lat:g.lat+.003,lon:g.lon};await get('#tee-fire').onclick();assert.equal(get('#remain').textContent,Math.round(distance(position,g)));assert.ok(get('#tee-course').textContent.includes('링크스 1번'));
 await import('../dist/app.mjs?restore-jack');for(let i=0;i<10;i++)await new Promise(setImmediate);assert.ok(get('#tee-course').textContent.includes('잭 니클라우스'));await get('#refresh-button').onclick();assert.equal(get('#remain').textContent,Math.round(distance(position,g)));
 get('#return-setup').onclick();await get('#locate').onclick();get('#nearby-list').children[1].onclick();assert.deepEqual(get('#start-course').children.map(x=>x.value),['links','park','dunes']);
});

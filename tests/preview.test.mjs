import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {coursePacks} from '../dist/course-catalog.mjs';
import {previewValues} from '../dist/preview-core.mjs';
const nodes=new Map();
class Node{
 constructor(){this.hidden=false;this.children=[];this.parentElement={hidden:false};this.style={};this.value='';this.textContent='';this.disabled=false;this.open=false;}
 set id(v){this._id=v;nodes.set('#'+v,this);}get id(){return this._id;}
 setAttribute(k,v){this[k]=v;}replaceChildren(...ns){this.children=ns;}append(...ns){this.children.push(...ns);}before(){}showModal(){this.open=true;}close(){this.open=false;}
}
const get=s=>{if(!nodes.has(s))nodes.set(s,new Node());return nodes.get(s);};const greens=[new Node(),new Node()];
let gps=0,storage=0,media=0;
globalThis.document={querySelector:get,querySelectorAll:s=>s==='.green-choice'?greens:s==='.club'?[get('.club')]:[],createElement:()=>new Node(),fonts:{load:()=>Promise.resolve([])}};
globalThis.localStorage={getItem(){storage++;throw Error('preview read live storage');},setItem(){storage++;throw Error('preview wrote live storage');},removeItem(){storage++;throw Error('preview deleted live storage');}};
globalThis.indexedDB={open(){media++;throw Error('preview opened personal photos');}};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{geolocation:{getCurrentPosition(){gps++;throw Error('preview requested GPS');}}}});
globalThis.fetch=async path=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL('../dist/'+path,import.meta.url)))});
test('preview explores registered clubs and holes without GPS or personal state',async()=>{
 const {ready}=await import('../dist/preview.mjs');await ready;
 assert.equal(get('#welcome').hidden,false);assert.equal(get('#preview-club').children.length,coursePacks.length);assert.equal(get('#welcome h1').textContent,'베르힐CC 영종');assert.equal(get('#locate').hidden,true);
 assert.deepEqual(get('#start-course').children.map(o=>o.value),['verthill','sky','ocean','lake']);get('#start-hole').value='3';get('#begin').onclick();assert.equal(get('#tee-ready').hidden,false);assert.deepEqual(greens[0].children.map(o=>o.textContent),['좌그린','우그린']);
 await get('#tee-fire').onclick();assert.equal(get('#remain').textContent,348);assert.equal(get('#mode-badge').textContent,'미리보기 · 예시 거리');get('#refresh-button').onclick();assert.equal(get('#remain').textContent,139);assert.equal(get('.from').hidden,false);greens[1].onchange({target:{value:'R'}});assert.equal(get('#total b').textContent,340);assert.equal(get('#remain').textContent,136);get('#refresh-button').onclick();assert.equal(get('.from').hidden,true);get('#refresh-button').onclick();assert.equal(get('#remain').textContent,0);get('#refresh-button').onclick();assert.equal(get('#remain').textContent,340);
 get('#return-setup').onclick();get('#start-course').value='sky';get('#start-hole').value='5';get('#begin').onclick();assert.equal(greens[0].parentElement.hidden,true);await get('#tee-fire').onclick();assert.equal(get('#remain').textContent,198);
 get('#return-setup').onclick();get('#start-course').value='sky';get('#start-hole').value='8';get('#begin').onclick();await get('#tee-fire').onclick();get('#next-button').onclick();assert.equal(get('#next-course').value,'ocean');assert.equal(get('#next-course').children.length,4);get('#next-confirm').onclick();assert.ok(get('#tee-course').textContent.includes('오션 1번'));get('#course').onchange({target:{value:'lake'}});assert.ok(get('#tee-course').textContent.includes('레이크 1번'));
 get('#return-setup').onclick();get('#preview-club').onchange({target:{value:'flamingo'}});assert.deepEqual(get('#start-course').children.map(o=>o.value),['links','park','dunes']);get('#begin').onclick();await get('#tee-fire').onclick();assert.ok(get('#round-note').textContent.includes('GPS 측정값이 아닙니다'));
 get('#return-setup').onclick();get('#preview-club').onchange({target:{value:'golfzoncounty-songdo'}});assert.deepEqual(get('#start-course').children.map(o=>o.value),['east','west']);get('#start-hole').value='0';get('#begin').onclick();await get('#tee-fire').onclick();assert.equal(get('#remain').textContent,383);get('#return-setup').onclick();get('#start-course').value='west';get('#start-hole').value='8';get('#begin').onclick();await get('#tee-fire').onclick();assert.equal(get('#remain').textContent,414);
 assert.deepEqual({gps,storage,media},{gps:0,storage:0,media:0});
});
test('preview examples respect meters and never pretend to be GPS measurements',()=>{
 assert.equal(previewValues({par:4},{whiteTee:{meters:328.2696}},0).total,328.2696);assert.equal(previewValues({par:4},null,0).official,false);assert.equal(previewValues({par:4},null,2).progress,.8);assert.equal(previewValues({par:3},null,99).remaining,0);
});

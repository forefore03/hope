import test from 'node:test';
import assert from 'node:assert/strict';
import {captions,pickCaption,nextVisit,validOuting} from '../dist/outing-core.mjs';
test('12th played hole reminder and 18th completion, including Links/Park crossover',()=>{let complete=0;const reminders=[];for(let hole=1;hole<=18;hole++){const n=nextVisit(complete);if(n.remind)reminders.push(hole+1);assert.equal(n.finish,hole===18);complete=n.completed;}assert.deepEqual(reminders,[12]);});
test('caption set has at least 30 distinct choices and reroll excludes current phrase',()=>{assert.ok(captions.length>=30);assert.equal(new Set(captions).size,captions.length);for(const phrase of captions){assert.notEqual(pickCaption(phrase,()=>0),phrase);assert.notEqual(pickCaption(phrase,()=>.9999),phrase);}});
test('today-only outing expires at 24h; corrupt or future state cannot resume',()=>{const now=Date.now();assert.ok(validOuting({id:'today',createdAt:now},now));assert.ok(!validOuting({id:'yesterday',createdAt:now-24*3600000},now));assert.ok(!validOuting({id:'future',createdAt:now+100},now));assert.ok(!validOuting(null,now));assert.ok(!validOuting({id:1,createdAt:now},now));});

test('active outing survives midnight and old creation date, but expires after 24h inactivity',()=>{
 const now=Date.now(),s={id:'active',createdAt:now-25*3600000,updatedAt:now-5*60000};
 assert.ok(validOuting(s,now));assert.ok(!validOuting({...s,updatedAt:now-24*3600000},now));assert.ok(!validOuting({...s,updatedAt:now+1},now));
});

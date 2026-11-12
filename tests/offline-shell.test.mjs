import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
test('offline shell restores navigation, does not cache coordinates or private media, and never reloads clients',async()=>{
 const handlers={},added=[],deleted=[];let claimed=0;const response={body:'cached shell'};
 const cache={addAll:async xs=>added.push(...xs),match:async()=>response};
 const ctx={URL,self:{location:{href:'https://example.test/hope/sw.js'},addEventListener:(n,f)=>handlers[n]=f,skipWaiting:async()=>{},clients:{claim:async()=>claimed++}},caches:{open:async()=>cache,keys:async()=>['hope-shell-old','another-app'],delete:async k=>deleted.push(k)},fetch:async()=>{throw Error('offline');}};
 vm.runInNewContext(fs.readFileSync(new URL('../dist/sw.js',import.meta.url),'utf8'),ctx);
 let wait;handlers.install({waitUntil:p=>wait=p});await wait;assert.ok(added.includes('./index.html'));assert.ok(!added.some(x=>/data\/|golf-courses|photo|parking/.test(x)));
 handlers.activate({waitUntil:p=>wait=p});await wait;assert.deepEqual(deleted,['hope-shell-old']);assert.equal(claimed,1);
 let returned;handlers.fetch({request:{method:'GET',url:'https://example.test/hope/',mode:'navigate'},respondWith:p=>returned=p});assert.equal(await returned,response);
 for(const path of ['data/golfzoncounty-songdo.json','private-photo.png']){let handled=false;handlers.fetch({request:{method:'GET',url:'https://example.test/hope/'+path,mode:'cors'},respondWith:()=>handled=true});assert.equal(handled,false);}
});

import {coursePacks} from './course-catalog.mjs?v=songdo-20261112';
import {validatePack} from './golf-core.mjs';
import {previewValues} from './preview-core.mjs';
const $=s=>document.querySelector(s);
const fontReady=document.fonts.load('italic 800 100px MontserratFinal').catch(()=>[]);
let packs=[],pack=null,course='',hole=1,greenId='A',step=0,tap=null;
const currentCourse=()=>pack?.courses.find(c=>c.id===course);
const currentHole=()=>currentCourse()?.holes.find(h=>h.number===hole);
const currentGreen=()=>currentHole()?.greens.find(g=>g.id===greenId);
function stopTap(){if(tap){clearTimeout(tap);tap=null;}}
function show(id){stopTap();for(const s of ['#parking-screen','#welcome','#tee-ready','main','#finish-screen'])$(s).hidden=s!==id;$('#mode-badge').hidden=id!=='main';}
function options(select,items,value){select.replaceChildren();for(const [id,label]of items){const o=document.createElement('option');o.value=id;o.textContent=label;select.append(o);}select.value=value;}
function title(){
 const h=currentHole();if(!h)return;if(!h.greens.some(g=>g.id===greenId))greenId=h.greens[0].id;
 $('#hole').textContent=` ${hole}번 홀 · PAR ${h.par}`;$('#tee-course').textContent=`${pack.name} · ${currentCourse().name} ${hole}번 홀`;
 for(const e of document.querySelectorAll('.club'))e.textContent=pack.name;
 options($('#course'),pack.courses.map(c=>[c.id,c.name]),course);
 for(const select of document.querySelectorAll('.green-choice')){options(select,h.greens.map(g=>[g.id,g.label||'Green '+g.id]),greenId);select.parentElement.hidden=h.greens.length<2;const small=select.parentElement.querySelector?.('small');if(small)small.textContent=h.greens.some(g=>g.side)?'사용 그린을 선택하세요.':'A/B · 좌우 미확정';}
}
function paint(){
 title();const v=previewValues(currentHole(),currentGreen(),step);
 $('#remain').textContent=Math.round(v.remaining);$('#from').textContent=Math.round(v.fromTee);$('#total b').textContent=Math.round(v.total);$('.from').hidden=step!==1;$('.fill').style.height=(v.progress*100)+'%';$('.fill').style.width='100%';
 $('#mode-badge').textContent='미리보기 · 예시 거리';$('#round-note').textContent=v.official?'전체: 화이트티 표시 거리 · 남은 거리와 진행은 예시입니다.':'예시 거리입니다. GPS 측정값이 아닙니다.';
}
function setup(){
 options($('#preview-club'),packs.map(p=>[p.id,p.name]),pack.id);options($('#start-course'),pack.courses.map(c=>[c.id,c.name]),course);$('#start-hole').value=String(hole-1);
 $('#welcome h1').textContent=pack.name;$('#location-note').textContent='오늘의 무대. 미리 골라보세요.';$('.choices').hidden=false;$('.preview-note').hidden=false;$('.preview-note').textContent='미리보기 · GPS를 사용하거나 라운드를 저장하지 않습니다.';$('#begin span').textContent='가보자고';$('#begin').disabled=false;show('#welcome');
}
function tee(){step=0;title();$('#tee-error').textContent='';$('.tee-demo').textContent='미리보기 · 실제 GPS 측정 없이 예시 거리를 보여줍니다.';$('#tee-fire span').textContent='한 방 갑니다.';show('#tee-ready');}
function refresh(){if($('main').hidden||$('#next-dialog').open)return;step=step===3?0:step+1;paint();}
function next(){
 if(!pack||$('#next-dialog').open)return;stopTap();const id=hole===9?(currentCourse().nextCourse||pack.courses.find(c=>c.id!==course)?.id||course):course;
 options($('#next-course'),pack.courses.map(c=>[c.id,c.name]),id);$('#next-course-label').hidden=hole!==9;$('#next-dialog h3').textContent='다음 홀 미리보기';$('#next-question').textContent=`${pack.courses.find(c=>c.id===id).name} ${hole===9?1:hole+1}번 홀로 이동할까요?`;$('#next-confirm').textContent='이동';$('#next-dialog').showModal();
}
function exitLink(label='실제 앱으로 돌아가기 ↗'){const a=document.createElement('a');a.href='./';a.className='preview-exit';a.textContent=label;return a;}
// Hide photo, parking and finish actions; their live controller is never loaded.
$('.photo-invite').hidden=true;$('.round-extras').replaceChildren(exitLink('미리보기 종료 ↗'));$('.tools').replaceChildren(exitLink());$('.tee-photo').hidden=true;$('.tee-finish').hidden=true;$('#locate').hidden=true;
const label=document.createElement('label');label.className='preview-club-label';label.textContent='미리 볼 골프장';const select=document.createElement('select');select.id='preview-club';select.setAttribute('aria-label','미리 볼 골프장');label.append(select);$('.choices').before(label);
$('#preview-club').onchange=e=>{pack=packs.find(p=>p.id===e.target.value)||packs[0];course=pack.courses[0].id;hole=1;greenId='A';step=0;setup();};
$('#begin').onclick=()=>{course=$('#start-course').value;hole=Number($('#start-hole').value)+1;greenId='A';tee();};
$('#tee-fire').onclick=async()=>{await fontReady;step=0;paint();show('main');};$('#tee-back').onclick=setup;$('#return-setup').onclick=setup;
for(const id of ['#tee-back','#return-setup'])$(id).onkeydown=e=>{if(e.key==='Enter')setup();};
$('#refresh-button').onclick=refresh;$('#next-button').onclick=next;$('#next-cancel').onclick=()=>$('#next-dialog').close();
$('#next-confirm').onclick=()=>{if(hole===9){course=$('#next-course').value;hole=1;}else hole++;greenId='A';$('#next-dialog').close();tee();};
$('#next-course').onchange=e=>{$('#next-question').textContent=`${pack.courses.find(c=>c.id===e.target.value).name} 1번 홀로 이동할까요?`;};
$('#course').onchange=e=>{course=e.target.value;hole=1;greenId='A';tee();};
for(const s of document.querySelectorAll('.green-choice'))s.onchange=e=>{greenId=e.target.value;title();if(!$('main').hidden)paint();};
$('.scene').onclick=()=>{if(tap){stopTap();next();}else tap=setTimeout(()=>{tap=null;refresh();},300);};$('.scene').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();refresh();}};
$('#begin').disabled=true;$('.preview-note').hidden=false;$('.preview-note').textContent='미리보기 코스를 불러오고 있습니다…';show('#welcome');
export const ready=Promise.allSettled(coursePacks.map(async spec=>{const r=await fetch(spec.file);if(!r.ok)throw Error('코스 자료를 불러오지 못했습니다.');const p=await r.json();validatePack(p);if(p.id!==spec.id)throw Error('코스 자료가 일치하지 않습니다.');return p;})).then(results=>{packs=results.filter(r=>r.status==='fulfilled').map(r=>r.value);if(!packs.length)throw Error('코스 자료를 불러오지 못했습니다. 다시 열어주세요.');pack=packs.find(p=>p.id==='verthill-yeongjong')||packs[0];course=pack.courses[0].id;setup();}).catch(e=>{$('.preview-note').textContent=e.message;$('#begin').disabled=true;});

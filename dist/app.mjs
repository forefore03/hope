import {coursePacks,packForClub,specForClub} from './course-catalog.mjs?v=lazy-20261112';
import {outing} from './outing.mjs?v=parking-return-1';
import {distance,measure,validatePack,greenFor} from './golf-core.mjs';
const $=s=>document.querySelector(s);
const storage={get(k){try{return JSON.parse(localStorage.getItem(k));}catch{return null;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}};
const fontReady=document.fonts.load('italic 800 100px MontserratFinal').catch(()=>[]);
let packs=[],pack=null;
const supportedClub=name=>!!specForClub(name);
const pendingPacks=new Map();
async function loadClub(name){
 const spec=specForClub(name);if(!spec)return null;
 const cached=packs.find(p=>p.id===spec.id);if(cached)return cached;
 if(!pendingPacks.has(spec.id))pendingPacks.set(spec.id,(async()=>{
  try{const r=await fetch(spec.file);if(!r.ok)throw Error('코스 자료를 불러오지 못했습니다. 다시 눌러주세요.');const p=await r.json();validatePack(p);if(p.id!==spec.id)throw Error('골프장 코스 자료가 일치하지 않습니다.');packs.push(p);return p;}
  finally{pendingPacks.delete(spec.id);}
 })());
 return pendingPacks.get(spec.id);
}
function selectClubPack(resetCourse=false){pack=packForClub(packs,club);if(pack&&(resetCourse||!pack.courses.some(c=>c.id===course)))course=pack.courses[0].id;}
let club='',course='links',hole=1,greenId='A',mode='live',busy=false,tee=null,total=null,refreshCount=0,lastPoint=null,lastMeasured=null;
const courseName=id=>pack?.courses.find(c=>c.id===id)?.name||'—';
const nextCourseDefault=()=>pack?.courses.find(c=>c.id===course)?.nextCourse||pack?.courses.find(c=>c.id!==course)?.id||course;
const pointGreen=()=>pack&&supportedClub(club)?greenFor(pack,course,hole,greenId):null;
const pointHole=()=>supportedClub(club)?pack?.courses.find(c=>c.id===course)?.holes.find(h=>h.number===hole):null;
const savedCourse=storage.get('hope-course');if(typeof savedCourse==='string')course=savedCourse;
function showScreen(id){for(const s of ['#parking-screen','#welcome','#tee-ready','main','#finish-screen'])$(s).hidden=s!==id;$('#mode-badge').hidden=id!=='main';$('#course').disabled=false;}
function updateWelcome(){const supported=supportedClub(club);$('.preview-note').hidden=!club||supported;$('.preview-note').textContent=club&&!supported?'이 골프장은 아직 거리 측정을 지원하지 않습니다.':'';$('.choices').hidden=!supported;$('#welcome h1').textContent=club||'—';$('#location-note').textContent=club?'오늘의 무대.':'내가 여기 다신 오나 봐라…';$('#begin span').textContent=!club?'골프장 고르자':supported?'가보자고':'다른 골프장 고르자';$('#begin').disabled=false;$('#club-clear').hidden=!club;document.querySelectorAll('.club').forEach(e=>e.textContent=club||'—');outing.setContext({club:club||'—',course,hole});}

function fillOptions(){for(const id of ['#course','#start-course']){$(id).replaceChildren();for(const c of pack?.courses||[]){const o=document.createElement('option');o.value=c.id;o.textContent=c.name;$(id).append(o);}$(id).value=course;}$('#start-hole').value=hole-1;}
function clearRound(){tee=null;total=null;lastPoint=null;lastMeasured=null;refreshCount=0;greenId='A';}
function title(){const greens=pointHole()?.greens||[];if(!greens.some(g=>g.id===greenId))greenId=greens[0]?.id||'A';outing.setContext({club,course,hole,isBusy:()=>busy});const par=pointHole()?.par??'—';$('#hole').textContent=` ${hole}번 홀 · PAR ${par}`;$('#course').value=course;$('#tee-course').textContent=`${club} · ${courseName(course)} ${hole}번 홀`;for(const select of document.querySelectorAll('.green-choice')){select.replaceChildren();for(const g of pointHole()?.greens||[]){const o=document.createElement('option');o.value=g.id;o.textContent=g.label||'Green '+g.id;select.append(o);}select.value=greenId;select.parentElement.hidden=greens.length<2;const detail=select.parentElement.querySelector?.('small');if(detail)detail.textContent=greens.some(g=>g.side)?'사용 그린을 선택하세요.':'A/B · 좌우 미확정';}}
function note(text){$('#round-note').textContent=text;}
function paint(values,showTeeDistance=false){lastMeasured=values;$('#remain').textContent=Number.isFinite(values?.remaining)?Math.round(values.remaining):'—';$('#from').textContent=Number.isFinite(values?.fromTee)?Math.round(values.fromTee):'—';$('#total b').textContent=Number.isFinite(values?.total)?Math.round(values.total):'—';$('.from').hidden=!showTeeDistance;$('.fill').style.height=((values?.progress||0)*100)+'%';$('.fill').style.width='100%';}
function saveRound(){if(mode!=='live'||!tee||!lastMeasured)return;storage.set('hope-live-round',{club,course,hole,greenId,tee,total,refreshCount,lastPoint,lastMeasured,updatedAt:Date.now()});}
function showTee(){title();paint(null);mode=supportedClub(club)?'live':'demo';$('#tee-fire').disabled=false;$('#tee-fire span').textContent='한 방 갑니다.';$('.tee-demo').textContent=mode==='live'?'등록한 그린 중앙까지 측정합니다. 현장 검증 전 잠정 좌표입니다.':'체험 모드 · 실제 위치·거리를 저장하지 않습니다.';$('#tee-error').textContent='';showScreen('#tee-ready');}
function showSetup(){if(busy)return;mode='live';busy=false;fillOptions();updateWelcome();showScreen('#welcome');}
async function getPosition(){if(!navigator.geolocation)throw Error('이 브라우저는 위치를 지원하지 않습니다.');const pos=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,maximumAge:0,timeout:20000}));const p={lat:pos.coords.latitude,lon:pos.coords.longitude,accuracy:pos.coords.accuracy};if(!Number.isFinite(p.accuracy)||p.accuracy>100)throw Error('GPS 오차가 큽니다. 야외에서 다시 확인해주세요.');return p;}
function positionError(e){return e.code===1?'위치 권한을 허용한 뒤 다시 눌러주세요.':e.code===3?'위치 확인 시간이 초과됐습니다. 다시 눌러주세요.':e.message||'현재 위치를 확인하지 못했습니다.';}
async function startHole(){if(busy)return;busy=true;$('#tee-fire').disabled=true;$('#tee-fire span').textContent='자리 잡는 중…';try{await fontReady;await loadClub(club);selectClubPack();if(mode==='demo'){paint({total:400,remaining:400,fromTee:0,progress:0});refreshCount=0;showScreen('main');outing.start();$('#mode-badge').textContent='체험 모드';note('예시 거리 · 실제 GPS 측정값 아님');return;}const g=pointGreen();if(!g)throw Error('이 홀의 그린 좌표가 없습니다.');if(g.verification.conversion!=='checked')throw Error('이 홀은 원본 좌표 확인이 필요합니다. 코스 자료를 확인해주세요.');const p=await getPosition();if(distance(p,g)>5000)throw Error('선택한 홀에서 5km 이상 떨어져 있습니다. 현장에서 다시 확인해주세요.');const m=measure(p,p,g);if(m.total<1)throw Error('현재 위치가 그린과 너무 가깝습니다. 티 위치를 확인해주세요.');tee=p;lastPoint=p;total=m.total;refreshCount=0;paint(m,false);showScreen('main');outing.start();$('#mode-badge').textContent='GPS · 잠정 그린 좌표';note(`GPS 오차 약 ${Math.round(p.accuracy)}m · 방금 측정`);saveRound();}catch(e){$('#tee-error').textContent=positionError(e);}finally{busy=false;$('#tee-fire').disabled=false;$('#tee-fire span').textContent='한 방 갑니다.';}}
async function refresh(){if(busy||$('main').hidden||$('#next-dialog').open)return;if(mode==='demo'){refreshCount++;paint({total:400,remaining:refreshCount===1?160:Math.max(0,(lastMeasured?.remaining||160)-60),fromTee:245,progress:refreshCount===1?.6:Math.min(1,(lastMeasured?.progress||.6)+.15)},refreshCount===1);note('체험 모드 · 실제 GPS 측정값 아님');return;}if(!tee){showTee();return;}busy=true;$('#refresh-button').disabled=true;note('현재 위치 확인 중… 이전 측정값입니다.');try{const g=pointGreen(),p=await getPosition();const m=measure(tee,p,g);if(distance(p,g)>5000)throw Error('현재 위치가 선택한 홀에서 너무 멉니다. 코스를 확인해주세요.');refreshCount++;lastPoint=p;paint(m,refreshCount===1);note(`GPS 오차 약 ${Math.round(p.accuracy)}m · ${new Date().toLocaleTimeString('ko-KR')} 측정`);saveRound();}catch(e){note(positionError(e)+' · 이전 측정값');}finally{busy=false;$('#refresh-button').disabled=false;}}
function nextHole(){if(busy)return;$('#next-dialog h3').textContent=outing.next().finish?'오늘은 여기까지':'다음 홀';if(outing.next().finish){$('#next-course-label').hidden=true;$('#next-question').textContent='오늘 라운드를 마칠까요?';$('#next-confirm').textContent='마치기';$('#next-dialog').dataset.finish='1';$('#next-dialog').showModal();return;}$('#next-dialog').dataset.finish='';$('#next-confirm').textContent='이동';const nextCourse=hole===9?nextCourseDefault():course,n=hole===9?1:hole+1;const choice=$('#next-course');choice.replaceChildren();for(const c of pack?.courses||[]){const o=document.createElement('option');o.value=c.id;o.textContent=c.name;choice.append(o);}choice.value=nextCourse;$('#next-course-label').hidden=hole!==9;$('#next-question').textContent=`${courseName(nextCourse)} ${n}번 홀로 이동할까요?`;$('#next-dialog').showModal();}
$('#next-confirm').onclick=()=>{if(busy)return;if($('#next-dialog').dataset.finish==='1'){$('#next-dialog').close();outing.finish();return;}outing.advance();if(hole===9){const selected=$('#next-course').value;course=pack.courses.some(c=>c.id===selected)?selected:nextCourseDefault();hole=1;}else hole++;clearRound();storage.set('hope-live-round',null);$('#next-dialog').close();showTee();};$('#next-cancel').onclick=()=>$('#next-dialog').close();
let tapTimer=null;$('.scene').onclick=()=>{if(tapTimer){clearTimeout(tapTimer);tapTimer=null;nextHole();}else tapTimer=setTimeout(()=>{tapTimer=null;refresh();},300);};$('.scene').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();refresh();}};
$('#begin').onclick=async()=>{if(busy)return;if(!club||!supportedClub(club))return $('#locate').onclick();busy=true;$('#begin').disabled=true;try{await Promise.all([fontReady,loadClub(club)]);course=$('#start-course').value;hole=Number($('#start-hole').value)+1;clearRound();storage.set('hope-course',course);showTee();outing.offerPhoto();}catch(e){$('#location-note').textContent=e.message;}finally{busy=false;$('#begin').disabled=false;}};
$('#tee-back').onclick=showSetup;$('#tee-back').onkeydown=e=>{if(e.key==='Enter')showSetup();};$('#tee-fire').onclick=startHole;$('#refresh-button').onclick=refresh;$('#next-button').onclick=nextHole;$('#return-setup').onclick=showSetup;$('#return-setup').onkeydown=e=>{if(e.key==='Enter')showSetup();};
$('#course').onchange=e=>{if(busy){e.target.value=course;return;}course=e.target.value;hole=1;clearRound();storage.set('hope-live-round',null);showTee();};
for(const select of document.querySelectorAll('.green-choice'))select.onchange=e=>{greenId=e.target.value;title();if(tee&&lastPoint&&mode==='live'){paint(measure(tee,lastPoint,pointGreen()),refreshCount===1);total=lastMeasured.total;saveRound();note(pointGreen()?.side?'선택 그린 변경 · '+pointGreen().label:'선택 그린 변경 · 좌·우 명칭 미확정 / 잠정 좌표');}};
$('#club-clear').onclick=()=>{if(busy)return;club='';course='links';selectClubPack();hole=1;clearRound();storage.set('hope-live-round',null);outing.clearClub();fillOptions();updateWelcome();};
$('#nearby-close').onclick=()=>$('#nearby').close();
let nearbyRequest=0;
$('#locate').onclick=async()=>{
 if(busy)return;const request=++nearbyRequest;$('#nearby').showModal();$('#nearby-list').replaceChildren();$('#nearby-status').textContent='현재 위치와 가까운 골프장을 확인하고 있습니다…';$('#locate').disabled=true;
 try{
  const [p,data]=await Promise.all([getPosition(),fetch('./golf-courses.json?v=verthill-20261111').then(async r=>{if(!r.ok)throw Error('골프장 목록을 불러오지 못했습니다.');return r.json();})]);
  if(request!==nearbyRequest||!$('#nearby').open)return;
  const list=data.map(g=>({...g,meters:distance(p,g)})).sort((a,b)=>a.meters-b.meters).slice(0,3);$('#nearby-status').textContent='가까운 3곳 · 직선거리';
  for(const g of list){
   const btn=document.createElement('button');btn.className='course-result';const name=document.createElement('strong'),info=document.createElement('span');name.textContent=g.name;const spec=specForClub(g.name);
   info.textContent=(g.meters/1000).toFixed(1)+'km · '+(spec?`${spec.holes}홀 · 거리 측정 가능`:'그린 거리 측정 미지원');btn.append(name,info);
   btn.onclick=async()=>{
    if(busy)return;busy=true;btn.disabled=true;$('#nearby-status').textContent=spec?'선택한 골프장 준비 중…':'그린 거리 측정 미지원';
    try{await loadClub(g.name);if(!$('#nearby').open)return;club=g.name;selectClubPack(true);hole=1;clearRound();storage.set('hope-live-round',null);outing.selectClub(club);fillOptions();updateWelcome();$('#nearby').close();}
    catch(e){$('#nearby-status').textContent=e.message;}
    finally{busy=false;btn.disabled=false;}
   };$('#nearby-list').append(btn);
  }
 }catch(e){$('#nearby-status').textContent=positionError(e);}finally{$('#locate').disabled=false;}
};
fillOptions();updateWelcome();paint(null);showScreen('#parking-screen');
// Only real GPS rounds are restored; simulation never writes this record.
(async()=>{const saved=storage.get('hope-live-round');if(saved&&saved.tee&&Date.now()-saved.updatedAt<12*3600000&&supportedClub(saved.club)){await loadClub(saved.club);club=saved.club;selectClubPack();course=saved.course;hole=saved.hole;greenId=saved.greenId||'A';if(!pointGreen()){await outing.init(false);return;}mode='live';tee=saved.tee;total=saved.total;refreshCount=saved.refreshCount;lastPoint=saved.lastPoint;title();paint(saved.lastMeasured,refreshCount===1);await outing.init(true);showScreen('main');$('#mode-badge').textContent='GPS · 마지막 측정값';note('이전 측정값입니다. 여기서 확인을 눌러 갱신해주세요.');}else{await outing.init(false);club=outing.selectedClub();if(supportedClub(club)){await loadClub(club);}selectClubPack();fillOptions();updateWelcome();}})().catch(e=>{$('#location-note').textContent=e.message;$('#begin').disabled=false;});


document.addEventListener('hope:finished',()=>{if(tapTimer){clearTimeout(tapTimer);tapTimer=null;}clearRound();note('');});
document.addEventListener('hope:new-outing',()=>{club='';course='links';selectClubPack();clearRound();storage.set('hope-live-round',null);hole=1;fillOptions();updateWelcome();});

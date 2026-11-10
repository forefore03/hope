export const captions = [
 '오늘은 됐다. 친목이.', '공은 잃었지만 사진은 남았다.', '다음엔 된다.',
 '스코어는 각자의 마음속에.', '오늘의 베스트 샷은 이 사진.', '공보다 웃음이 더 멀리 갔다.',
 '잘 친 사람처럼 나왔다.', '사진에는 OB가 없다.', '오늘도 잔디는 무사합니다.',
 '일단 자세는 프로.', '스코어 빼고 완벽한 하루.', '우리는 오늘도 가능성을 봤다.',
 '그린은 멀고 우정은 가깝다.', '내 공은 몰라도 우리 사이는 좋다.', '오늘의 핑계는 날씨.',
 '다음 샷 말고 다음 만남을 기대.', '공은 제각각, 웃음은 한 방향.', '버디보다 보기 좋은 우리.',
 '희망은 아직 18홀째.', '돌아오는 길엔 다 잘 친 얘기.', '캐디님, 오늘도 고생하셨습니다.',
 '오늘도 골프가 이겼다.', '좋은 사람들과 나쁜 스코어.', '공 찾다가 친해진 사이.',
 '이 사진만 보면 싱글.', '아직 전성기 전입니다.', '샷은 흔들려도 우정은 굳건.',
 '골프는 어려워도 오늘은 좋았다.', '다음엔 연습하고 온다. 진짜.', '우리의 베스트는 식당에서.'
];
export function pickCaption(previous='', random=Math.random){const pool=captions.filter(x=>x!==previous);return pool[Math.min(pool.length-1,Math.max(0,Math.floor(random()*pool.length)))];}
export function nextVisit(completed){const n=Math.max(0,Math.min(18,Number(completed)||0))+1;return {completed:n,finish:n>=18,remind:n===11};}
export function validOuting(value,now=Date.now()){return !!value&&typeof value.id==='string'&&Number.isFinite(value.createdAt)&&now>=value.createdAt&&now-value.createdAt<24*3600000;}

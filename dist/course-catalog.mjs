// Keep course IDs and aliases scoped to their club; never match Hampyeong to Yeongjong.
export const coursePacks=[
 {id:'flamingo',file:'./data/flamingo.json',aliases:['플라밍고 CC','플라밍고C.C','플라밍고 컨트리클럽']},
 {id:'jack-nicklaus-korea',file:'./data/jack-nicklaus-korea.json',aliases:['잭 니클라우스 골프클럽 코리아','잭니클라우스GC코리아','잭니클라우스 GC','잭니']},
 {id:'verthill-yeongjong',file:'./data/verthill-yeongjong.json',aliases:["베르힐CC 영종","베르힐 CC 영종","영종 베르힐CC","영종베르힐CC","베르힐컨트리클럽 영종","베르힐컨트리클럽영종","베르힐CC영종","베르힐 영종"]}
];
const normalized=name=>String(name||'').normalize('NFC').toLowerCase().replace(/[\s.·_-]/g,'');
export function packForClub(packs,name){const key=normalized(name);const spec=coursePacks.find(p=>p.aliases.some(a=>normalized(a)===key));return spec?packs.find(p=>p.id===spec.id)||null:null;}

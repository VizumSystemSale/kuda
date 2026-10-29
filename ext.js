/* KUDA ext v3.1 — AI-провайдеры + STELLAR (быстрые кнопки, AI-скан фото, неделя/месяц) + фикс меню + автообновление + кнопка установки */
(function(){
'use strict';
const $=s=>document.querySelector(s);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>'$'+Math.round(n).toLocaleString('en-US');
const dkey=ts=>{const d=new Date(ts);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const dshort=ts=>{const d=new Date(ts);return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')};
const note=m=>{try{if(typeof toast==='function'){toast(m);return}}catch(e){}console.log(m)};
const MON=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

/* автообновление при новой версии SW */
if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(sessionStorage.getItem('kuda_sw_reloaded'))return;
    sessionStorage.setItem('kuda_sw_reloaded','1');
    location.reload();
  });
}

/* кнопка установки PWA — всегда видна, пока приложение не установлено */
let bipEvt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();bipEvt=e;showInstall()});
function showInstall(){
  try{
    if(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone)return;
    const hdr=$('#hdr');if(!hdr||$('#extInstall'))return;
    const b=document.createElement('button');b.className='chip';b.id='extInstall';b.textContent='⬇ Установить';
    b.onclick=async()=>{
      if(bipEvt){bipEvt.prompt();const r=await bipEvt.userChoice;bipEvt=null;if(r&&r.outcome==='accepted')b.remove()}
      else note('Меню ⋮ браузера → «Установить приложение» / «На экран «Домой»»');
    };
    hdr.appendChild(b);
  }catch(e){}
}

/* ================= AI PROVIDERS ================= */
const EK='kuda_ext';
let E={provider:'moonshot',keys:{},models:{}};
try{const s=JSON.parse(localStorage.getItem(EK)||'{}');E=Object.assign(E,s);E.keys=E.keys||{};E.models=E.models||{}}catch(e){}
const saveE=()=>localStorage.setItem(EK,JSON.stringify(E));
const DEFM={openai:'gpt-4o-mini',anthropic:'claude-haiku-4-5-20251001',gemini:'gemini-2.0-flash'};
const ofetch=window.fetch.bind(window);
window.fetch=async function(url,opts){
  const u=typeof url==='string'?url:url.url;
  if(!u.startsWith('https://api.moonshot.ai')||E.provider==='moonshot')return ofetch(url,opts);
  const p=E.provider,key=E.keys[p]||'';
  try{
    if(u.indexOf('/v1/models')>=0){
      if(p==='openai')return ofetch('https://api.openai.com/v1/models',{headers:{Authorization:'Bearer '+key}});
      if(p==='anthropic')return ofetch('https://api.anthropic.com/v1/models',{headers:{'x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'}});
      if(p==='gemini')return ofetch('https://generativelanguage.googleapis.com/v1beta/models?key='+encodeURIComponent(key));
    }
    if(u.indexOf('/chat/completions')>=0){
      const body=JSON.parse(opts.body);
      const msgs=body.messages||[];
      if(p==='openai'){
        body.model=E.models.openai||DEFM.openai;
        return ofetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify(body)});
      }
      let text='',imgs=[];
      for(const m of msgs){
        const parts=Array.isArray(m.content)?m.content:[{type:'text',text:String(m.content)}];
        for(const c of parts){
          if(c.type==='text')text+=c.text+'\n';
          if(c.type==='image_url'&&c.image_url){const mm=/^data:(.*?);base64,(.*)$/.exec(c.image_url.url||'');if(mm)imgs.push({mt:mm[1],data:mm[2]})}
        }
      }
      if(p==='anthropic'){
        const parts=imgs.map(i=>({type:'image',source:{type:'base64',media_type:i.mt,data:i.data}}));
        parts.push({type:'text',text:text.trim()});
        const r=await ofetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:E.models.anthropic||DEFM.anthropic,max_tokens:2048,messages:[{role:'user',content:parts}]})});
        const j=await r.json();
        if(!r.ok)return new Response(JSON.stringify(j),{status:r.status,headers:{'Content-Type':'application/json'}});
        const txt=(j.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('');
        return new Response(JSON.stringify({choices:[{message:{content:txt}}]}),{status:200,headers:{'Content-Type':'application/json'}});
      }
      if(p==='gemini'){
        const parts=[{text:text.trim()}].concat(imgs.map(i=>({inline_data:{mime_type:i.mt,data:i.data}})));
        const mdl=E.models.gemini||DEFM.gemini;
        const r=await ofetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(mdl)+':generateContent?key='+encodeURIComponent(key),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:parts}]})});
        const j=await r.json();
        if(!r.ok)return new Response(JSON.stringify(j),{status:r.status,headers:{'Content-Type':'application/json'}});
        const c0=(j.candidates||[])[0];
        const txt=((c0&&c0.content&&c0.content.parts)||[]).map(x=>x.text||'').join('');
        return new Response(JSON.stringify({choices:[{message:{content:txt}}]}),{status:200,headers:{'Content-Type':'application/json'}});
      }
    }
  }catch(e){return new Response(JSON.stringify({error:{message:String(e)}}),{status:500,headers:{'Content-Type':'application/json'}})}
  return ofetch(url,opts);
};
function syncAppKey(){
  try{
    if(typeof S==='undefined'||!S)return;
    if(E.provider!=='moonshot'&&E.keys[E.provider]){if(!S.kimiKey||S.kimiKey==='ext-managed'){S.kimiKey='ext-managed';if(typeof save==='function')save()}}
    else if(S.kimiKey==='ext-managed'){S.kimiKey='';if(typeof save==='function')save()}
  }catch(e){}
}
function hasAiKey(){
  if(E.provider!=='moonshot')return !!E.keys[E.provider];
  try{return typeof S!=='undefined'&&S&&!!S.kimiKey}catch(e){return false}
}
function moonKey(){try{return(typeof S!=='undefined'&&S&&S.kimiKey)||''}catch(e){return''}}
function moonModel(){try{return(typeof S!=='undefined'&&S&&S.kimiModel)||'moonshot-v1-32k-vision-preview'}catch(e){return'moonshot-v1-32k-vision-preview'}}
function injectProviderUI(){
  if($('#extProvBox'))return;
  const tab=$('#tab-set');if(!tab)return;
  const aiH4=[...tab.querySelectorAll('h4')].find(h=>/AI/.test(h.textContent));
  if(!aiH4)return;
  const box=document.createElement('div');box.className='set-group';box.id='extProvBox';
  box.innerHTML='<h4>🧠 AI-провайдер</h4>'+
    '<label>Нейросеть для чеков<select id="extProv">'+
    '<option value="moonshot">Kimi (Moonshot)</option>'+
    '<option value="openai">ChatGPT (OpenAI)</option>'+
    '<option value="anthropic">Claude (Anthropic)</option>'+
    '<option value="gemini">Gemini (Google)</option></select></label>'+
    '<div id="extKeyRow"><label>API-ключ провайдера<input id="extKey" type="password" placeholder="sk-..." autocomplete="off"></label>'+
    '<label>Модель<input id="extModel" autocomplete="off"></label></div>'+
    '<p class="tiny muted">Kimi настраивается блоком ниже. Для остальных — вставь ключ здесь: чеки и сканы в STELLAR пойдут через выбранную нейросеть. «Проверить ключ» ниже проверяет выбранного провайдера.</p>';
  aiH4.parentElement.parentElement.insertBefore(box,aiH4.parentElement);
  const sel=$('#extProv'),keyI=$('#extKey'),mdl=$('#extModel');
  sel.value=E.provider;
  const refresh=()=>{const p=sel.value;$('#extKeyRow').style.display=p==='moonshot'?'none':'';keyI.value=E.keys[p]||'';mdl.value=E.models[p]||DEFM[p]||''};
  refresh();
  sel.onchange=()=>{E.provider=sel.value;saveE();refresh();syncAppKey();note('Провайдер: '+sel.options[sel.selectedIndex].text)};
  keyI.onchange=()=>{E.keys[sel.value]=keyI.value.trim();saveE();syncAppKey();note('Ключ сохранён')};
  mdl.onchange=()=>{E.models[sel.value]=mdl.value.trim();saveE();note('Модель сохранена')};
}

/* ================= STELLAR ================= */
const SK2='stellar_v1';
let ST={loads:[],odo:[],mi:[],fuel:[],debts:[],exp:[],maint:{lastOil:0,int:15000},weekOff:0,period:'week'};
try{const s=JSON.parse(localStorage.getItem(SK2)||'{}');ST=Object.assign(ST,s);ST.maint=Object.assign({lastOil:0,int:15000},s.maint||{});ST.mi=ST.mi||[];ST.period=ST.period||'week'}catch(e){}
const saveST=()=>localStorage.setItem(SK2,JSON.stringify(ST));
const ECATS={tolls:'🛣 Толлы',scales:'⚖️ Весы',repair:'🔧 Ремонт',ins:'🛡 Страховка',payment:'🚛 Платёж трака',park:'🅿 Парковка',wash:'🚿 Мойка',eld:'📟 ELD',permit:'📄 Пермиты',other:'📦 Прочее'};
const LST={new:'В работе',done:'Доставлен',paid:'Оплачен'};
function periodRange(){
  const off=ST.weekOff||0;const n=new Date();
  if(ST.period==='month'){
    const a=new Date(n.getFullYear(),n.getMonth()+off,1);
    const b=new Date(n.getFullYear(),n.getMonth()+off+1,1);
    return{a:a.getTime(),b:b.getTime()};
  }
  const d=new Date(n.getFullYear(),n.getMonth(),n.getDate());
  const dow=(d.getDay()+6)%7;d.setDate(d.getDate()-dow+off*7);
  return{a:d.getTime(),b:d.getTime()+7*864e5};
}
function periodLabel(p){
  const wa=new Date(p.a);
  if(ST.period==='month')return MON[wa.getMonth()]+' '+wa.getFullYear()+((ST.weekOff||0)===0?' · этот месяц':'');
  const wb=new Date(p.b-864e5);
  return dshort(wa)+' – '+dshort(wb)+((ST.weekOff||0)===0?' · эта неделя':'');
}
const inW=(ts,w)=>ts>=w.a&&ts<w.b;
const curOdo=()=>ST.odo.reduce((m,o)=>Math.max(m,o.odo||0),0);
function weekStats(w){
  const loads=ST.loads.filter(l=>inW(l.ts,w));
  const gross=loads.reduce((s,l)=>s+(+l.pay||0),0);
  const lm=loads.reduce((s,l)=>s+(+l.miles||0),0);
  const dead=loads.reduce((s,l)=>s+(+l.dead||0),0);
  const o=[...ST.odo].sort((a,b)=>a.ts-b.ts);let om=0;
  for(let i=1;i<o.length;i++){const d=o[i].odo-o[i-1].odo;if(d>0&&d<3000&&inW(o[i].ts,w))om+=d}
  const dm=ST.mi.filter(m=>inW(m.ts,w)).reduce((s,m)=>s+(+m.miles||0),0);
  const miles=Math.max(om+dm,lm+dead);
  const fuel=ST.fuel.filter(f=>inW(f.ts,w));
  const fcost=fuel.reduce((s,f)=>s+(+f.cost||0),0);
  const fgal=fuel.reduce((s,f)=>s+(+f.gal||0),0);
  const exp=ST.exp.filter(e=>inW(e.ts,w));
  const ecost=exp.reduce((s,e)=>s+(+e.amount||0),0);
  const net=gross-fcost-ecost;
  return{loads,gross,lm,dead,miles,fuel,fcost,fgal,exp,ecost,net,
    rpm:lm?gross/lm:0,cpm:miles?(fcost+ecost)/miles:0,mpg:fgal&&miles?miles/fgal:0};
}
function stParse(line){
  const t=line.toLowerCase().trim();
  const nums=(t.match(/\d+(?:[.,]\d+)?/g)||[]).map(s=>parseFloat(s.replace(',','.')));
  const txt=line.replace(/\d+(?:[.,]\d+)?/g,'').replace(/[+$]/g,' ').replace(/\s+/g,' ').trim();
  const now=Date.now();ST.mi=ST.mi||[];
  if(/^(рейс|груз|load)/.test(t)&&nums.length>=2){
    ST.loads.unshift({id:uid(),ts:now,pay:nums[0],miles:nums[1],dead:nums[2]||0,name:txt.replace(/^(рейс|груз|load)\s*/,'')||'Рейс',st:'new'});
  }else if(/^(топл|заправка|fuel)/.test(t)&&nums.length>=2){
    ST.fuel.unshift({id:uid(),ts:now,gal:nums[0],cost:nums[1],note:txt.replace(/^(топливо|топл|заправка|fuel)\s*/,'')});
  }else if(/^одо/.test(t)&&nums.length>=1){
    ST.odo.unshift({id:uid(),ts:now,odo:Math.round(nums[0])});
  }else if(/^(мили|миль|miles)/.test(t)&&nums.length>=1){
    ST.mi.unshift({id:uid(),ts:now,miles:nums[0]});
  }else if(/^(долг|мне должны|должна|должен)/.test(t)&&nums.length>=1){
    ST.debts.unshift({id:uid(),ts:now,amount:nums[0],title:txt.replace(/^(долг(и)?|мне должны|должна|должен)\s*/,'')||'Долг компании',settled:false,settledTs:null});
  }else if(nums.length>=1){
    const cat=/весы|scale/.test(t)?'scales':/толл|toll/.test(t)?'tolls':/ремонт|шин|масл|сервис/.test(t)?'repair':/страх/.test(t)?'ins':/плат[её]ж|лизинг|кредит/.test(t)?'payment':/парков/.test(t)?'park':/мойк|омывайк|стекл/.test(t)?'wash':/eld/i.test(t)?'eld':/пермит|permit|штраф/.test(t)?'permit':'other';
    ST.exp.unshift({id:uid(),ts:now,cat:cat,amount:nums[0],title:txt||ECATS[cat].replace(/^\S+\s/,'')});
  }else return null;
  saveST();return true;
}
function card(label,val,cls){return '<div class="st-c"><div class="st-l">'+label+'</div><div class="st-v '+(cls||'')+'">'+val+'</div></div>'}
let formMode=null;
function renderStellar(){
  const el=$('#tab-stellar');if(!el)return;
  const w=periodRange();const s=weekStats(w);
  const M=ST.maint;
  const isM=ST.period==='month';
  const per=isM?'месяца':'недели';
  const debtSum=ST.debts.filter(d=>!d.settled).reduce((x,d)=>x+(+d.amount||0),0);
  let h='<div class="st-head"><h2>🚚 STELLAR</h2><div class="st-per"><button class="chip'+(!isM?' on':'')+'" data-act="pweek">Неделя</button><button class="chip'+(isM?' on':'')+'" data-act="pmonth">Месяц</button></div></div>';
  h+='<div class="st-week"><button class="chip" data-act="wprev">‹</button><span>'+periodLabel(w)+'</span><button class="chip" data-act="wnext">›</button></div>';
  h+='<div class="st-grid2">'+card('💰 Мне должны',fmt(debtSum),debtSum>0?'gold':'')+card('📈 Нетто '+per,(s.net<0?'−':'')+fmt(Math.abs(s.net)),s.net<0?'red':'acc')+'</div>';
  h+='<div class="st-grid3">'+
    card('Гросс '+per,fmt(s.gross),'acc')+
    card('Мили',Math.round(s.miles).toLocaleString('en-US'))+
    card('Топливо',Math.round(s.fgal)+' gal · '+fmt(s.fcost))+
    card('Расходы трака',fmt(s.ecost))+
    card('$/милю (RPM)','$'+s.rpm.toFixed(2),'acc')+
    card('Себест. мили','$'+s.cpm.toFixed(2),s.cpm>2?'red':'')+
    card('MPG трака',s.mpg?s.mpg.toFixed(1):'—')+
    card('Гружёные/порожние',Math.round(s.lm)+' / '+Math.round(s.dead))+
    card('Рейсов',s.loads.length)+'</div>';
  /* быстрые действия */
  h+='<div class="st-qa">'+
    '<button class="st-qa-b acc" data-act="cam">📷<span>Скан</span></button>'+
    '<button class="st-qa-b" data-act="f-fuel">⛽<span>Топливо</span></button>'+
    '<button class="st-qa-b" data-act="f-load">📦<span>Рейс</span></button>'+
    '<button class="st-qa-b" data-act="f-miles">🛣<span>Мили</span></button>'+
    '<button class="st-qa-b" data-act="f-debt">💰<span>Долг</span></button>'+
    '<button class="st-qa-b" data-act="f-exp">🧾<span>Расход</span></button></div>';
  h+='<input type="file" id="stCam" accept="image/*" capture="environment" class="hidden">';
  h+='<div id="stForm"></div>';
  h+='<details class="st-textin"><summary class="tiny muted">⌨️ Ввод текстом одной строкой (как раньше)</summary><div class="st-quick"><input id="stIn" placeholder="рейс 2400 1100 · топливо 180 620 · одо 452300"><button class="icon-btn go" data-act="add">➤</button></div></details>';
  /* Мне должны */
  h+='<h3 class="st-h">💰 Мне должны'+(debtSum?' — '+fmt(debtSum):'')+'</h3>';
  const dAct=ST.debts.filter(d=>!d.settled),dDone=ST.debts.filter(d=>d.settled);
  h+=dAct.length?dAct.map(d=>'<div class="st-row"><div><b>'+esc(d.title)+'</b><div class="tiny muted">'+dshort(d.ts)+'</div></div><div class="st-r"><b>'+fmt(d.amount)+'</b><button class="chip" data-act="settle" data-id="'+d.id+'">✓ Оплатили</button><button class="st-x" data-act="del" data-coll="debts" data-id="'+d.id+'">✕</button></div></div>').join(''):'<p class="tiny muted">Нет долгов</p>';
  if(dDone.length)h+='<div class="st-settled">'+dDone.map(d=>'<div class="st-row off"><div><s>'+esc(d.title)+'</s><div class="tiny muted">оплачено '+dshort(d.settledTs||d.ts)+'</div></div><div class="st-r"><s class="muted">'+fmt(d.amount)+'</s><button class="chip" data-act="unsettle" data-id="'+d.id+'">↩</button></div></div>').join('')+'</div>';
  /* Рейсы */
  h+='<h3 class="st-h">📦 Рейсы за '+per+' ('+s.loads.length+')</h3>';
  h+=s.loads.length?s.loads.map(l=>'<div class="st-row"><div><b>'+esc(l.name)+'</b><div class="tiny muted">'+dshort(l.ts)+' · '+Math.round(l.miles)+' mi'+(l.dead?' +'+Math.round(l.dead)+' порожних':'')+' · $'+(l.miles?(l.pay/l.miles).toFixed(2):'—')+'/mi</div></div><div class="st-r"><b>'+fmt(l.pay)+'</b><span class="st-badge st-'+l.st+'">'+LST[l.st]+'</span>'+(l.st==='new'?'<button class="chip" data-act="ldone" data-id="'+l.id+'">Доставлен</button>':'')+(l.st==='done'?'<button class="chip" data-act="lpaid" data-id="'+l.id+'">Оплачен</button>':'')+'<button class="st-x" data-act="del" data-coll="loads" data-id="'+l.id+'">✕</button></div></div>').join(''):'<p class="tiny muted">Нет рейсов за этот период</p>';
  /* Мили */
  const odoLog=[...ST.odo].sort((a,b)=>b.ts-a.ts).slice(0,7);
  const miLog=[...ST.mi].sort((a,b)=>b.ts-a.ts).slice(0,7);
  h+='<h3 class="st-h">🛣 Мили</h3>';
  h+=(odoLog.length||miLog.length)?odoLog.map(o=>'<div class="st-row"><div>Одометр: <b>'+(+o.odo).toLocaleString('en-US')+'</b></div><div class="tiny muted">'+dshort(o.ts)+'</div></div>').join('')+miLog.map(m=>'<div class="st-row"><div>За день: <b>'+m.miles+' mi</b></div><div class="tiny muted">'+dshort(m.ts)+'</div></div>').join(''):'<p class="tiny muted">Кнопка 🛣 Мили → введи одометр каждый день</p>';
  /* Топливо */
  h+='<h3 class="st-h">⛽ Топливо за '+per+'</h3>';
  h+=s.fuel.length?s.fuel.map(f=>'<div class="st-row"><div><b>'+f.gal+' gal</b> · $'+(f.gal?(f.cost/f.gal).toFixed(2):'—')+'/gal'+(f.note?' · '+esc(f.note):'')+'</div><div class="st-r"><b>'+fmt(f.cost)+'</b><button class="st-x" data-act="del" data-coll="fuel" data-id="'+f.id+'">✕</button></div></div>').join(''):'<p class="tiny muted">Нет заправок за этот период</p>';
  /* Расходы */
  h+='<h3 class="st-h">🧾 Затраты на трак за '+per+'</h3>';
  h+=s.exp.length?s.exp.map(e=>'<div class="st-row"><div>'+(ECATS[e.cat]||ECATS.other)+' · '+esc(e.title)+'</div><div class="st-r"><b>'+fmt(e.amount)+'</b><button class="st-x" data-act="del" data-coll="exp" data-id="'+e.id+'">✕</button></div></div>').join(''):'<p class="tiny muted">Нет затрат за этот период</p>';
  /* ТО */
  const co=curOdo();
  const since=M.lastOil&&co?co-M.lastOil:null;
  const left=since!=null?M.int-since:null;
  h+='<h3 class="st-h">🔧 ТО трака</h3><div class="st-c st-to"><div class="tiny muted">Масло: каждые <input id="stOilInt" type="number" value="'+M.int+'" class="st-mini"> миль'+(M.lastOil?' · последняя замена на '+M.lastOil.toLocaleString('en-US'):'')+'</div>'+(since!=null?'<div class="st-v '+(left<1000?'red':'acc')+'">'+(left>0?'Осталось '+left.toLocaleString('en-US')+' mi':'⚠️ Пора менять масло!')+'</div>':'<div class="tiny muted">Введи одометр после замены масла и записывай «одо» ежедневно</div>')+'<div class="st-r"><button class="chip" data-act="oilset">Задать одометр замены</button>'+(co?'<button class="chip" data-act="oildone">✓ Масло заменено ('+co.toLocaleString('en-US')+')</button>':'')+'</div></div>';
  h+='<button class="chip st-csv" data-act="csv">⬇ Отчёт за '+per+' (CSV)</button>';
  el.innerHTML=h;
  if(formMode)renderForm(formMode);
  const inp=$('#stIn');
  if(inp)inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();stAdd()}};
  const cam=$('#stCam');
  if(cam)cam.onchange=e=>{if(e.target.files[0])handleStPhoto(e.target.files[0]);e.target.value=''};
}
function renderForm(mode){
  const box=$('#stForm');if(!box)return;
  const inp=(id,ph,txt)=>'<input id="'+id+'" type="number" inputmode="decimal" placeholder="'+ph+'">'+(txt?'<span class="st-fl">'+txt+'</span>':'');
  const tin=(id,ph)=>'<input id="'+id+'" type="text" placeholder="'+ph+'" autocomplete="off">';
  let h='';
  if(mode==='fuel')h='<div class="st-form"><div class="st-ft">⛽ Заправка</div><div class="st-fr">'+inp('stF_gal','Галлоны')+inp('stF_cost','Сумма $')+'</div><div class="st-fr">'+tin('stF_city','Город / заправка (необяз.)')+'</div><button class="btn" data-act="saveFuel">+ Добавить заправку</button></div>';
  else if(mode==='load')h='<div class="st-form"><div class="st-ft">📦 Рейс</div><div class="st-fr">'+inp('stL_pay','Оплата $')+inp('stL_mi','Мили гружёные')+'</div><div class="st-fr">'+inp('stL_dead','Порожние мили (необяз.)')+'</div><div class="st-fr">'+tin('stL_from','Откуда (город)')+tin('stL_to','Куда (город)')+'</div><button class="btn" data-act="saveLoad">+ Добавить рейс</button></div>';
  else if(mode==='miles')h='<div class="st-form"><div class="st-ft">🛣 Мили</div><div class="st-fr">'+inp('stM_odo','Одометр сейчас')+'</div><div class="tiny muted" style="margin:2px 0 6px">или</div><div class="st-fr">'+inp('stM_mi','Миль за сегодня')+'</div><button class="btn" data-act="saveMiles">+ Записать</button></div>';
  else if(mode==='debt')h='<div class="st-form"><div class="st-ft">💰 Компания должна</div><div class="st-fr">'+inp('stD_amt','Сумма $')+'</div><div class="st-fr">'+tin('stD_title','За что (толлы, рейс, возврат…)')+'</div><button class="btn" data-act="saveDebt">+ Добавить долг</button></div>';
  else if(mode==='exp'){
    let opts='';for(const k in ECATS)opts+='<option value="'+k+'">'+ECATS[k]+'</option>';
    h='<div class="st-form"><div class="st-ft">🧾 Затрата на трак</div><div class="st-fr">'+inp('stE_amt','Сумма $')+'</div><div class="st-fr"><select id="stE_cat">'+opts+'</select></div><div class="st-fr">'+tin('stE_title','Что купил (масло, шины, весы…)')+'</div><button class="btn" data-act="saveExp">+ Добавить затрату</button></div>';
  }
  box.innerHTML=h;
  const f=box.querySelector('input');if(f)f.focus();
}
function gv(id){const e=$(id);return e?e.value.trim():''}
function gn(id){const v=parseFloat(gv(id).replace(',','.'));return isNaN(v)?0:v}
function stAdd(){
  const inp=$('#stIn');if(!inp||!inp.value.trim())return;
  const ok=stParse(inp.value);
  inp.value='';
  if(ok){renderStellar();note('Записано в STELLAR')}else note('Не понял. Пример: рейс 2400 1100');
}
/* --- AI-скан фото: памп/чек/скрин rate con/весы --- */
function resizeSt(file){return new Promise(res=>{const rd=new FileReader();rd.onload=e=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');const k=Math.min(1,1400/Math.max(img.width,img.height));c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',0.8))};img.src=e.target.result};rd.readAsDataURL(file)})}
async function handleStPhoto(file){
  if(!hasAiKey()){note('Сначала добавь AI-ключ: ⚙️ Ещё → AI');return}
  const ld=$('#loader');if(ld){ld.textContent='AI читает фото…';ld.classList.remove('hidden')}
  try{
    const dataUrl=await resizeSt(file);
    const prompt='Это фото из приложения тракера-дальнобойщика (США): памп/чек заправки, скрин rate confirmation или навигатора, чек весов (CAT Scale), чек на запчасти/масло/шины/омывайку. Верни строго JSON без пояснений: {"type":"fuel|load|expense","gallons":число|null,"cost":число|null,"city":строка|null,"pay":число|null,"miles":число|null,"deadhead":число|null,"from":строка|null,"to":строка|null,"amount":число|null,"category":"tolls|scales|repair|ins|payment|park|wash|eld|permit|other"|null,"title":строка|null}. Правила: заправка или памп → fuel (gallons, cost=полная сумма, city). Rate confirmation или скрин рейса → load (pay=сколько платят, miles=гружёные мили, from=город загрузки, to=город разгрузки). Весы → expense, category=scales, amount=цена. Чек на товары/ремонт для трака → expense с подходящей category и title=что куплено. Все суммы — числа без символов валют.';
    const r=await window.fetch('https://api.moonshot.ai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+(E.provider==='moonshot'?moonKey():'ext')},body:JSON.stringify({model:moonModel(),temperature:0.1,messages:[{role:'user',content:[{type:'text',text:prompt},{type:'image_url',image_url:{url:dataUrl}}]}]})});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const j=await r.json();const txt=j.choices[0].message.content;
    const o=JSON.parse(txt.slice(txt.indexOf('{'),txt.lastIndexOf('}')+1));
    const now=Date.now();let msg='';
    if(o.type==='fuel'&&+o.gallons&&+o.cost){
      ST.fuel.unshift({id:uid(),ts:now,gal:+o.gallons,cost:+o.cost,note:o.city||''});
      msg='⛽ '+o.gallons+' gal · $'+o.cost+(o.city?' · '+o.city:'');
    }else if(o.type==='load'&&+o.pay){
      const name=((o.from||'')+'→'+(o.to||'')).replace(/^→|→$/g,'')||'Рейс';
      ST.loads.unshift({id:uid(),ts:now,pay:+o.pay,miles:+o.miles||0,dead:+o.deadhead||0,name:name,st:'new'});
      msg='📦 $'+o.pay+' · '+(+o.miles||0)+' mi · '+name;
    }else if(o.type==='expense'&&+o.amount){
      const cat=ECATS[o.category]?o.category:'other';
      ST.exp.unshift({id:uid(),ts:now,cat:cat,amount:+o.amount,title:o.title||ECATS[cat].replace(/^\S+\s/,'')});
      msg='🧾 '+ECATS[cat]+' · $'+o.amount+(o.title?' · '+o.title:'');
    }else throw new Error('no data');
    saveST();formMode=null;renderStellar();note('Добавлено: '+msg);
  }catch(e){
    console.error(e);note('AI не разобрал фото — введи кнопками ниже');
  }
  if(ld){ld.classList.add('hidden');ld.textContent='Kimi читает чек…'}
}
/* --- CSV --- */
function stCSV(){
  const w=periodRange();const s=weekStats(w);const isM=ST.period==='month';
  let c='STELLAR;'+(isM?'month':'week')+';'+dkey(w.a)+';'+dkey(w.b-864e5)+'\n';
  c+='Gross;'+s.gross+'\nMiles;'+Math.round(s.miles)+'\nLoaded;'+Math.round(s.lm)+'\nDeadhead;'+Math.round(s.dead)+'\nFuel gal;'+s.fgal+'\nFuel $;'+s.fcost+'\nExpenses $;'+s.ecost+'\nNet $;'+s.net+'\nRPM;'+s.rpm.toFixed(2)+'\nCPM;'+s.cpm.toFixed(2)+'\nMPG;'+s.mpg.toFixed(1)+'\n';
  c+='\nLOADS\nDate;Name;Pay;Miles;Deadhead;$/mile;Status\n';
  for(const l of s.loads)c+=dkey(l.ts)+';'+String(l.name||'').replace(/;/g,',')+';'+l.pay+';'+l.miles+';'+(l.dead||0)+';'+(l.miles?(l.pay/l.miles).toFixed(2):'')+';'+LST[l.st]+'\n';
  c+='\nFUEL\nDate;Gallons;Cost;$/gal;City\n';
  for(const f of s.fuel)c+=dkey(f.ts)+';'+f.gal+';'+f.cost+';'+(f.gal?(f.cost/f.gal).toFixed(2):'')+';'+String(f.note||'').replace(/;/g,',')+'\n';
  c+='\nEXPENSES\nDate;Category;Title;Amount\n';
  for(const e of s.exp)c+=dkey(e.ts)+';'+(ECATS[e.cat]||e.cat)+';'+String(e.title||'').replace(/;/g,',')+';'+e.amount+'\n';
  c+='\nDEBTS\nDate;Title;Amount;Settled\n';
  for(const d of ST.debts)c+=dkey(d.ts)+';'+String(d.title||'').replace(/;/g,',')+';'+d.amount+';'+(d.settled?'yes':'no')+'\n';
  const blob=new Blob(['﻿'+c],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='stellar_'+dkey(w.a)+'.csv';a.click();
  note('CSV сохранён');
}
/* --- обработчики --- */
function stClick(e){
  const b=e.target.closest('[data-act]');if(!b)return;
  const act=b.dataset.act,id=b.dataset.id,coll=b.dataset.coll;
  if(act==='wprev'){ST.weekOff=(ST.weekOff||0)-1;saveST();renderStellar()}
  else if(act==='wnext'){ST.weekOff=(ST.weekOff||0)+1;saveST();renderStellar()}
  else if(act==='pweek'){ST.period='week';ST.weekOff=0;saveST();renderStellar()}
  else if(act==='pmonth'){ST.period='month';ST.weekOff=0;saveST();renderStellar()}
  else if(act==='add')stAdd();
  else if(act==='cam'){const c=$('#stCam');if(c)c.click()}
  else if(act==='f-fuel'||act==='f-load'||act==='f-miles'||act==='f-debt'||act==='f-exp'){const m=act.slice(2);formMode=(formMode===m?null:m);renderStellar()}
  else if(act==='saveFuel'){
    if(!gn('#stF_gal')||!gn('#stF_cost'))return note('Введи галлоны и сумму');
    ST.fuel.unshift({id:uid(),ts:Date.now(),gal:gn('#stF_gal'),cost:gn('#stF_cost'),note:gv('#stF_city')});
    saveST();formMode=null;renderStellar();note('⛽ Заправка записана');
  }
  else if(act==='saveLoad'){
    if(!gn('#stL_pay')||!gn('#stL_mi'))return note('Введи оплату и мили');
    const nm=((gv('#stL_from')||'')+'→'+(gv('#stL_to')||'')).replace(/^→|→$/g,'')||'Рейс';
    ST.loads.unshift({id:uid(),ts:Date.now(),pay:gn('#stL_pay'),miles:gn('#stL_mi'),dead:gn('#stL_dead'),name:nm,st:'new'});
    saveST();formMode=null;renderStellar();note('📦 Рейс добавлен');
  }
  else if(act==='saveMiles'){
    if(gn('#stM_odo')){ST.odo.unshift({id:uid(),ts:Date.now(),odo:Math.round(gn('#stM_odo'))});note('🛣 Одометр записан')}
    else if(gn('#stM_mi')){ST.mi=ST.mi||[];ST.mi.unshift({id:uid(),ts:Date.now(),miles:gn('#stM_mi')});note('🛣 Мили записаны')}
    else return note('Введи одометр или мили');
    saveST();formMode=null;renderStellar();
  }
  else if(act==='saveDebt'){
    if(!gn('#stD_amt'))return note('Введи сумму');
    ST.debts.unshift({id:uid(),ts:Date.now(),amount:gn('#stD_amt'),title:gv('#stD_title')||'Долг компании',settled:false,settledTs:null});
    saveST();formMode=null;renderStellar();note('💰 Долг записан');
  }
  else if(act==='saveExp'){
    if(!gn('#stE_amt'))return note('Введи сумму');
    const cat=$('#stE_cat')?$('#stE_cat').value:'other';
    ST.exp.unshift({id:uid(),ts:Date.now(),cat:cat,amount:gn('#stE_amt'),title:gv('#stE_title')||ECATS[cat].replace(/^\S+\s/,'')});
    saveST();formMode=null;renderStellar();note('🧾 Затрата записана');
  }
  else if(act==='settle'){const d=ST.debts.find(x=>x.id===id);if(d){d.settled=true;d.settledTs=Date.now();saveST();renderStellar();note('Отмечено как оплаченное')}}
  else if(act==='unsettle'){const d=ST.debts.find(x=>x.id===id);if(d){d.settled=false;d.settledTs=null;saveST();renderStellar()}}
  else if(act==='ldone'){const l=ST.loads.find(x=>x.id===id);if(l){l.st='done';saveST();renderStellar()}}
  else if(act==='lpaid'){const l=ST.loads.find(x=>x.id===id);if(l){l.st='paid';saveST();renderStellar();note('Рейс оплачен')}}
  else if(act==='del'&&coll&&ST[coll]){ST[coll]=ST[coll].filter(x=>x.id!==id);saveST();renderStellar()}
  else if(act==='oildone'){ST.maint.lastOil=curOdo();saveST();renderStellar();note('Замена масла записана')}
  else if(act==='oilset'){const v=prompt('Одометр на момент замены масла:',curOdo()||'');if(v&&+v>0){ST.maint.lastOil=Math.round(+v);saveST();renderStellar()}}
  else if(act==='csv')stCSV();
}
function stChange(e){
  if(e.target.id==='stOilInt'){ST.maint.int=Math.max(1000,+e.target.value||15000);saveST();renderStellar()}
}
const css=document.createElement('style');
css.textContent='#nav{left:50%!important;right:auto!important;width:100%!important;max-width:520px!important;transform:translateX(-50%)!important}'+
'#tab-stellar{padding-bottom:90px}'+
'.st-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin:6px 0 10px}'+
'.st-head h2{margin:0;font-size:22px}'+
'.st-per{display:flex;gap:6px}'+
'.st-per .chip.on{background:var(--acc);color:#06281C;border-color:var(--acc);font-weight:700}'+
'.st-week{display:flex;align-items:center;justify-content:center;gap:10px;font-size:14px;color:var(--mut);margin-bottom:12px}'+
'.st-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}'+
'.st-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px}'+
'.st-c{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px;min-width:0}'+
'.st-l{font-size:11px;color:var(--mut);margin-bottom:4px}'+
'.st-v{font-size:18px;font-weight:700;word-break:break-word}'+
'.st-v.acc{color:var(--acc)}.st-v.red{color:var(--red)}.st-v.gold{color:var(--gold)}'+
'.st-qa{display:grid;grid-template-columns:repeat(6,1fr);gap:7px;margin-bottom:10px}'+
'.st-qa-b{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 2px;font-size:22px;display:flex;flex-direction:column;align-items:center;gap:3px;color:var(--txt)}'+
'.st-qa-b span{font-size:10px;color:var(--mut)}'+
'.st-qa-b.acc{border-color:rgba(46,230,168,.5)}'+
'.st-form{background:var(--card);border:1px solid var(--acc);border-radius:18px;padding:14px;margin-bottom:12px;display:flex;flex-direction:column;gap:8px}'+
'.st-ft{font-weight:700;font-size:15px}'+
'.st-fr{display:flex;gap:8px}'+
'.st-fr input,.st-fr select{flex:1;min-width:0}'+
'.st-textin{margin-bottom:8px}'+
'.st-textin summary{cursor:pointer;margin-bottom:6px}'+
'.st-quick{display:flex;gap:8px;margin-bottom:6px}'+
'.st-quick input{flex:1;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;color:var(--txt);font-size:15px;outline:none}'+
'.st-h{font-size:15px;margin:18px 0 8px;color:var(--txt)}'+
'.st-row{display:flex;justify-content:space-between;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin-bottom:6px;font-size:14px}'+
'.st-row.off{opacity:.55}'+
'.st-r{display:flex;align-items:center;gap:6px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end}'+
'.st-x{background:none;border:none;color:var(--mut);font-size:14px;cursor:pointer;padding:4px}'+
'.st-badge{font-size:11px;padding:3px 8px;border-radius:99px;border:1px solid var(--line)}'+
'.st-badge.st-new{color:var(--gold)}.st-badge.st-done{color:var(--acc)}.st-badge.st-paid{color:var(--mut)}'+
'.st-settled{margin-top:4px}'+
'.st-to{margin-bottom:14px}'+
'.st-to .st-r{margin-top:8px;flex-wrap:wrap;justify-content:flex-start}'+
'.st-mini{width:80px;background:var(--bg);border:1px solid var(--line);border-radius:8px;color:var(--txt);padding:3px 6px;font-size:13px}'+
'.st-csv{width:100%;margin-top:8px}';
document.head.appendChild(css);

function init(){
  try{
    const navBtn=document.querySelector('[data-tab="stellar"]');
    if(navBtn)navBtn.addEventListener('click',()=>setTimeout(renderStellar,30));
    const setBtn=document.querySelector('[data-tab="set"]');
    if(setBtn)setBtn.addEventListener('click',()=>setTimeout(()=>{injectProviderUI();syncAppKey()},50));
    const st=$('#tab-stellar');
    if(st){st.addEventListener('click',stClick);st.addEventListener('change',stChange)}
    renderStellar();
  }catch(e){console.error('STELLAR init:',e)}
  try{injectProviderUI();syncAppKey()}catch(e){console.error('EXT init:',e)}
  setTimeout(showInstall,1500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,300));
else setTimeout(init,300);
})();

'use strict';
const $=id=>document.getElementById(id);
const SK='kuda_v1';
const I18N={
ru:{slogan:'Куда уходят твои деньги — теперь видно',yourName:'Твоё имя (необязательно)',startBal:'Стартовый баланс',mainCur:'Основная валюта',start:'Начать',local:'Данные хранятся только на твоём устройстве',install:'Установить',balance:'Остаток',incM:'Доходы месяца',expM:'Траты месяца',net:'Итог',canSpend:'Сегодня можно потратить',feed:'Лента',calendar:'Календарь трат',goals:'Цели накоплений',recurring:'Повторяющиеся платежи',debts:'Мне должны',warranties:'Гарантии и возвраты',rcArchive:'Архив чеков',setBalCur:'Баланс и валюта',rate:'Курс: 1 USD = EUR',rateAuto:'🔄 Обновить курс автоматически',hourly:'Твой час работы (для «цены в часах»)',hourlyPh:'Сколько стоит 1 час твоей работы',limits:'Лимиты по категориям (в месяц, 0 = без лимита)',model:'Модель',keyTest:'Проверить ключ',noKey:'Без ключа чеки сохраняются в архив, сумму вводишь вручную',defTag:'Тег по умолчанию',personal:'Личное',business:'Бизнес',lang:'Язык / Language',legal:'Юридическая информация',legalTxt:'KUDA — инструмент учёта, а не финансовый советник. AI может ошибаться при распознавании чеков — проверяй суммы. Все данные хранятся локально на твоём устройстве.',wipe:'🗑 Стереть все данные',nHome:'Главная',nRep:'Отчёт',nGoals:'Цели',nRc:'Чеки',nMore:'Ещё',csvBiz:'⬇ Бизнес',goalPh:'Например: Машина',goalSum:'Сумма',recPh:'Аренда, связь…',sum:'Сумма',day:'День',addPh:'кофе 5 · «ужин 120 на троих» · спроси «сколько на еду?»'},
en:{slogan:'Where your money goes — now you see it',yourName:'Your name (optional)',startBal:'Starting balance',mainCur:'Main currency',start:'Start',local:'Data is stored only on your device',install:'Install',balance:'Balance',incM:'Month income',expM:'Month expenses',net:'Net',canSpend:'You can spend today',feed:'Feed',calendar:'Spending calendar',goals:'Savings goals',recurring:'Recurring payments',debts:'Owed to me',warranties:'Warranties & returns',rcArchive:'Receipt archive',setBalCur:'Balance & currency',rate:'Rate: 1 USD = EUR',rateAuto:'🔄 Update rate automatically',hourly:'Your work hour (price-in-hours)',hourlyPh:'Value of 1 hour of your work',limits:'Category limits (per month, 0 = none)',model:'Model',keyTest:'Test key',noKey:'Without a key receipts go to archive, enter amounts manually',defTag:'Default tag',personal:'Personal',business:'Business',lang:'Language / Язык',legal:'Legal',legalTxt:'KUDA is a tracking tool, not a financial advisor. AI may misread receipts — check amounts. All data is stored locally on your device.',wipe:'🗑 Erase all data',nHome:'Home',nRep:'Report',nGoals:'Goals',nRc:'Receipts',nMore:'More',csvBiz:'⬇ Business',goalPh:'E.g.: Car',goalSum:'Amount',recPh:'Rent, internet…',sum:'Amount',day:'Day',addPh:'coffee 5 · "dinner 120 for three" · ask "how much on food?"'}
};
const T=k=>(I18N[S.lang]||I18N.ru)[k]||I18N.ru[k]||k;
const CATS=[
{id:'food',name:'Продукты',en:'Groceries',icon:'🛒',kw:['продукт','молоко','хлеб','магазин','market','grocery','food','еда','супермаркет','овощ','фрукт','мясо']},
{id:'cafe',name:'Кафе и рестораны',en:'Cafe & dining',icon:'☕',kw:['кофе','кафе','обед','ужин','завтрак','ресторан','пицц','coffee','lunch','dinner','sushi','суши','бургер','шаурм']},
{id:'transport',name:'Транспорт',en:'Transport',icon:'⛽',kw:['бензин','такси','топливо','проезд','парковк','uber','bolt','fuel','taxi','метро','автобус','заправк']},
{id:'home',name:'Дом и быт',en:'Home',icon:'🏠',kw:['дом','порошок','бытов','коммунал','аренда','rent','home','мебель','хозтовар','ремонт']},
{id:'health',name:'Здоровье',en:'Health',icon:'💊',kw:['аптек','лекарств','врач','doctor','pharm','стоматолог','анализ','медицин']},
{id:'fun',name:'Развлечения',en:'Fun',icon:'🎬',kw:['кино','игр','развлеч','movie','game','боулинг','концерт','театр']},
{id:'clothes',name:'Одежда',en:'Clothes',icon:'👕',kw:['одежд','обувь','кроссовк','clothes','shoes','куртка','джинсы','футболк']},
{id:'connect',name:'Связь и интернет',en:'Phone & internet',icon:'📱',kw:['связь','интернет','телефон','мобил','internet','phone','sim','оператор']},
{id:'subs',name:'Подписки',en:'Subscriptions',icon:'🔁',kw:['подписк','subscription','netflix','spotify','youtube','icloud','premium']},
{id:'business',name:'Бизнес',en:'Business',icon:'💼',kw:['бизнес','реклам','хостинг','домен','ads','hosting','business','офис','сервис']},
{id:'income',name:'Доход',en:'Income',icon:'💰',kw:[]},
{id:'other',name:'Прочее',en:'Other',icon:'📦',kw:[]}];
const TECH=['телефон','iphone','ноутбук','laptop','наушник','планшет','телевизор','tv','console','приставк','часы','watch','монитор','пылесос','стиральн','холодильник','camera','фотоаппарат','airpods','macbook','samsung','xiaomi','playstation'];
const cat=id=>CATS.find(c=>c.id===id)||CATS[CATS.length-1];
const catName=c=>S.lang==='en'?c.en:c.name;
const MN=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const MNE=['January','February','March','April','May','June','July','August','September','October','November','December'];
const MNP=['январ','феврал','март','апрел','ма','июн','июл','август','сентябр','октябр','ноябр','декабр'];
let S=null;
let repDate=new Date();
function load(){try{return JSON.parse(localStorage.getItem(SK))}catch(e){return null}}
function save(){localStorage.setItem(SK,JSON.stringify(S))}
function toast(m,long){const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),long?6000:2600)}
function sym(c){return(c||(S&&S.main)||'USD')==='EUR'?'€':'$'}
function toMain(a,cur){if(!cur||cur===S.main)return a;if(cur==='USD'&&S.main==='EUR')return a*S.eurRate;if(cur==='EUR'&&S.main==='USD')return a/S.eurRate;return a}
function fmt(n,cur){const v=Math.round(n*100)/100;return sym(cur)+(Math.abs(v)%1?(v).toFixed(2):Math.abs(v).toLocaleString('ru-RU'))}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function dkey(ts){const d=new Date(ts);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function guessCat(t){t=t.toLowerCase();for(const c of CATS)for(const k of c.kw)if(t.includes(k))return c.id;return'other'}
function parseInput(text){
const parts=text.split(/[,;\n]|\s+и\s+/i).map(s=>s.trim()).filter(Boolean);
const out=[];
for(const p of parts){
const m=p.match(/(\d+(?:[.,]\d+)?)/);if(!m)continue;
let amount=parseFloat(m[1].replace(',','.'));if(!(amount>0))continue;
let title=p.replace(m[0],'').replace(/[+€$]/g,' ').replace(/\s+/g,' ').trim();
const inc=/^\s*\+/.test(p)||/(зарплат|доход|получил|пришл|аванс|salary|income)/i.test(p);
const sm=p.match(/на\s+(двоих|троих|четверых|пятерых|\d+)/i);
let split=0;
if(sm){split={двоих:2,троих:3,четверых:4,пятерых:5}[sm[1]]||parseInt(sm[1])||0;title=title.replace(/на\s+(двоих|троих|четверых|пятерых|\d+)/i,'').trim()}
if(!title)title=inc?'Доход':'Трата';
title=title[0].toUpperCase()+title.slice(1);
out.push({amount,title,cat:inc?'income':guessCat(title),type:inc?'inc':'exp',split});
}
return out;
}
function isQuestion(t){return /\?/.test(t)||/^\s*(сколько|покажи|how much|how many|what)/i.test(t)}
function answerQuestion(text){
const t=text.toLowerCase();
const now=new Date();let y=now.getFullYear(),m=now.getMonth();
for(let i=0;i<12;i++){if(t.includes(MNP[i])){m=i;if(m>now.getMonth())y--;break}}
let catId=null;for(const c of CATS){if(c.kw.some(k=>t.includes(k))){catId=c.id;break}}
if(!catId){if(/един|food|еде/.test(t))catId='food';else if(/транспорт|бензин|transport/.test(t))catId='transport'}
const list=S.txs.filter(x=>{const d=new Date(x.ts);return d.getFullYear()===y&&d.getMonth()===m&&x.type==='exp'&&(!catId||x.cat===catId)});
const sum=list.reduce((a,x)=>a+toMain(x.amount,x.cur),0);
const cname=catId?catName(cat(catId)):(S.lang==='en'?'everything':'всё');
const mname=(S.lang==='en'?MNE:MN)[m];
toast(S.lang==='en'?`Spent on ${cname} in ${mname}: ${fmt(sum)} (${list.length} ops)`:`На «${cname}» в ${mname} потрачено: ${fmt(sum)} (${list.length} оп.)`,true);
}
function priceAlert(item){
const prev=S.txs.find(x=>x.type==='exp'&&x.title.toLowerCase()===item.title.toLowerCase());
if(prev&&item.amount>prev.amount)toast('⚠️ «'+item.title+'» подорожал: '+fmt(prev.amount,prev.cur)+' → '+fmt(item.amount)+(S.lang==='en'?'':''),true);
}
function addTxs(items,cur,receiptId){
for(const it of items){
priceAlert(it);
if(it.split&&it.split>1){
const myShare=Math.round(it.amount/it.split*100)/100;
S.txs.unshift({id:uid(),ts:Date.now(),type:'exp',amount:myShare,cur:cur||S.main,title:it.title+' (моя доля 1/'+it.split+')',cat:it.cat,tag:S.defTag||'personal',receiptId:receiptId||null});
S.debts.unshift({id:uid(),ts:Date.now(),title:it.title,amount:Math.round((it.amount-myShare)*100)/100,cur:cur||S.main});
toast('💸 '+it.title+': твоя доля '+fmt(myShare)+', тебе должны '+fmt(Math.round((it.amount-myShare)*100)/100),true);
}else{
S.txs.unshift({id:uid(),ts:Date.now(),type:it.type,amount:it.amount,cur:cur||S.main,title:it.title,cat:it.cat,tag:S.defTag||'personal',receiptId:receiptId||null});
}
}
save();renderAll();
}
function monthTxs(y,m){return S.txs.filter(t=>{const d=new Date(t.ts);return d.getFullYear()===y&&d.getMonth()===m})}
function totals(y,m){let inc=0,exp=0;for(const t of monthTxs(y,m)){const v=toMain(t.amount,t.cur);if(t.type==='inc')inc+=v;else exp+=v}return{inc,exp}}
function balance(){let b=+S.startBalance||0;for(const t of S.txs){const v=toMain(t.amount,t.cur);b+=t.type==='inc'?v:-v}return b}
function hoursTxt(amount,cur){if(!S.hourlyRate)return'';const h=toMain(amount,cur)/S.hourlyRate;return h>=0.1?'<div class="tx-h">≈ '+(Math.round(h*10)/10)+' ч работы</div>':''}
function renderHome(){
const now=new Date(),y=now.getFullYear(),m=now.getMonth();
const bal=balance(),t=totals(y,m);
$('heroCur').textContent=S.main==='EUR'?'€ EUR':'$ USD';
$('heroBal').textContent=fmt(bal);
$('heroInc').textContent='+'+fmt(t.inc);$('heroExp').textContent='−'+fmt(t.exp);
const net=t.inc-t.exp;$('heroNet').textContent=(net>=0?'+':'−')+fmt(Math.abs(net));$('heroNet').className=net>=0?'inc':'exp';
const dim=new Date(y,m+1,0).getDate(),left=dim-now.getDate()+1,passed=now.getDate();
const allow=bal>0?bal/left:0;
$('todayNum').textContent=fmt(allow);
$('todaySub').textContent=(S.lang==='en'?'balance ÷ ':'остаток ÷ ')+left+(S.lang==='en'?' days left':' дн. до конца месяца');
const avg=t.exp/passed,proj=bal-avg*left;
$('forecast').innerHTML=S.lang==='en'
?`🔮 Forecast: at this pace ≈ <b>${fmt(Math.max(proj,0))}</b> left on ${dim}.${m+1} (spending ≈ ${fmt(avg*dim)}/mo)`
:`🔮 Прогноз: при таком темпе к ${dim} числу останется ≈ <b>${fmt(Math.max(proj,0))}</b> (траты ≈ ${fmt(avg*dim)}/мес)`;
const warn=[];
for(const c of CATS){const lim=+((S.limits||{})[c.id])||0;if(!lim)continue;
let spent=0;for(const x of monthTxs(y,m))if(x.type==='exp'&&x.cat===c.id)spent+=toMain(x.amount,x.cur);
if(spent>=lim)warn.push('<div class="warn">⛔ '+c.icon+' '+catName(c)+': '+(S.lang==='en'?'limit exceeded':'лимит превышен')+' ('+fmt(spent)+' / '+fmt(lim)+')</div>');
else if(spent>=lim*0.8)warn.push('<div class="warn">⚠️ '+c.icon+' '+catName(c)+': 80% '+(S.lang==='en'?'of limit':'лимита')+' ('+fmt(spent)+' / '+fmt(lim)+')</div>');}
const today=now.getDate();
for(const r of S.recurring){if(r.day-today>=1&&r.day-today<=3)warn.push('<div class="warn gold">🔁 '+esc(r.title)+': '+fmt(r.amount)+' '+(S.lang==='en'?'charges in':'спишется через')+' '+(r.day-today)+' '+(S.lang==='en'?'d.':'дн.')+'</div>')}
$('limitWarn').innerHTML=warn.join('');
const groups={};for(const t of S.txs){const k=dkey(t.ts);(groups[k]=groups[k]||[]).push(t)}
const keys=Object.keys(groups).sort().reverse().slice(0,31);
if(!keys.length){$('feed').innerHTML='<div class="empty">'+(S.lang==='en'?'Empty. Type «coffee 5» below or snap a receipt 📷':'Пусто. Напиши внизу «кофе 5» или сфотай чек 📷')+'</div>';return}
$('feed').innerHTML=keys.map(k=>{
const d=new Date(k),lbl=d.toLocaleDateString(S.lang==='en'?'en-US':'ru-RU',{weekday:'short',day:'numeric',month:'long'});
return '<div class="day-h">'+lbl+'</div>'+groups[k].map(t=>{
const c=cat(t.cat),a=t.type==='inc'?'+'+fmt(t.amount,t.cur):'−'+fmt(t.amount,t.cur);
return '<div class="tx"><div class="tx-ic">'+c.icon+'</div><div class="tx-mid"><div class="tx-t">'+esc(t.title)+'</div><div class="tx-s">'+catName(c)+' · <span class="tag">'+(t.tag==='business'?T('business'):T('personal'))+'</span></div></div><div class="tx-a '+(t.type==='inc'?'inc':'exp')+'">'+a+hoursTxt(t.amount,t.cur)+'</div><button class="tx-x" data-del="'+t.id+'">×</button></div>'}).join('')
}).join('');
}
function renderReport(){
const y=repDate.getFullYear(),m=repDate.getMonth();
$('repTitle').textContent=(S.lang==='en'?MNE:MN)[m]+' '+y;
const t=totals(y,m),list=monthTxs(y,m);
const py=m===0?y-1:y,pm=m===0?11:m-1,pt=totals(py,pm);
const dExp=pt.exp?Math.round((t.exp-pt.exp)/pt.exp*100):0;
const byCat={};for(const x of list)if(x.type==='exp')byCat[x.cat]=(byCat[x.cat]||0)+toMain(x.amount,x.cur);
const top=Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,5);
const max=top.length?top[0][1]:1;
const net=t.inc-t.exp;
const cmp=pt.exp?(dExp>0?'📈 +'+(dExp)+'% '+(S.lang==='en'?'vs last month':'к прошлому месяцу'):'📉 '+dExp+'% '+(S.lang==='en'?'vs last month':'к прошлому месяцу')):'';
$('repBody').innerHTML='<div class="rep-cards"><div class="rep-card"><span class="tiny muted">'+(S.lang==='en'?'Income':'Доходы')+'</span><b class="inc">+'+fmt(t.inc)+'</b></div><div class="rep-card"><span class="tiny muted">'+(S.lang==='en'?'Expenses':'Траты')+'</span><b class="exp">−'+fmt(t.exp)+'</b></div><div class="rep-card"><span class="tiny muted">'+(S.lang==='en'?'Net':'Итог')+'</span><b class="'+(net>=0?'inc':'exp')+'">'+(net>=0?'+':'−')+fmt(Math.abs(net))+'</b></div></div>'
+(cmp?'<p class="tiny muted" style="margin-bottom:10px">'+cmp+' ('+(S.lang==='en'?MNE:MN)[pm]+': '+fmt(pt.exp)+')</p>':'')
+(top.length?'<h3 class="sec">'+(S.lang==='en'?'Top categories':'Топ категорий')+'</h3>'+top.map(function(tp){const id=tp[0],v=tp[1];const c=cat(id);return '<div class="bar-row"><div class="b-ic">'+c.icon+'</div><div class="b-n">'+catName(c)+'</div><div class="bar-wrap"><div class="bar" style="width:'+Math.round(v/max*100)+'%"></div></div><div class="b-v">'+fmt(v)+'</div></div>'}).join(''):'<div class="empty">'+(S.lang==='en'?'No expenses this month yet':'В этом месяце пока нет трат')+'</div>')
+(list.length?'<p class="tiny muted" style="margin-top:12px">'+(S.lang==='en'?'Total operations: ':'Всего операций: ')+list.length+'</p>':'');
const dim=new Date(y,m+1,0).getDate();
const byDay={};let dmax=0;
for(const x of list)if(x.type==='exp'){const dd=new Date(x.ts).getDate();byDay[dd]=(byDay[dd]||0)+toMain(x.amount,x.cur);if(byDay[dd]>dmax)dmax=byDay[dd]}
const first=new Date(y,m,1).getDay(),off=(first+6)%7;
let cal='';for(let i=0;i<off;i++)cal+='<div class="cal-d"></div>';
for(let d2=1;d2<=dim;d2++){const v=byDay[d2]||0;const r=dmax?v/dmax:0;const cls=v===0?'':r<0.34?'l1':r<0.67?'l2':r<1?'l3':'l4';cal+='<div class="cal-d '+cls+'" title="'+fmt(v)+'">'+d2+'</div>'}
$('calHeat').innerHTML=cal;
const topC=top[0];
$('advisor').innerHTML=topC?'<div class="advice">💡 <b>'+catName(cat(topC[0]))+'</b>: '+fmt(topC[1])+(S.lang==='en'?'/mo = ':'/мес = ')+fmt(topC[1]*12)+(S.lang==='en'?'/yr. Cut by 20% → save ':'/год. Сократи на 20% → сохранишь ')+'<b>'+fmt(topC[1]*12*0.2)+'</b></div>':'';
}
function renderGoals(){
$('goalList').innerHTML=S.goals.length?S.goals.map(g=>{const p=Math.min(100,Math.round(g.saved/g.target*100));return '<div class="goal"><div class="goal-top"><span>🎯 '+esc(g.name)+'</span><span>'+p+'%</span></div><div class="goal-bar"><div class="goal-fill" style="width:'+p+'%"></div></div><div class="goal-sub"><span>'+fmt(g.saved)+' / '+fmt(g.target)+'</span><span><button class="mini-btn" data-gadd="'+g.id+'">+ '+(S.lang==='en'?'add':'внести')+'</button> <button class="mini-btn" data-gdel="'+g.id+'" style="border-color:var(--line);color:var(--mut)">×</button></span></div></div>'}).join(''):'<div class="empty">'+(S.lang==='en'?'No goals yet. Add one above.':'Целей нет. Добавь выше.')+'</div>';
const now=new Date();
$('recList').innerHTML=S.recurring.length?S.recurring.map(r=>{const left=r.day-now.getDate();return '<div class="rec-row"><div class="grow">🔁 <b>'+esc(r.title)+'</b> · '+fmt(r.amount)+' · '+(S.lang==='en'?'day':'число')+' '+r.day+'</div>'+(left>=0&&left<=3?'<span class="pill red">'+(S.lang==='en'?'in ':'через ')+left+' '+(S.lang==='en'?'d':'дн')+'</span>':'<span class="pill">'+(S.lang==='en'?'monthly':'ежемес.')+'</span>')+'<button class="tx-x" data-rdel="'+r.id+'">×</button></div>'}).join(''):'<div class="empty">'+(S.lang==='en'?'No recurring payments':'Нет повторяющихся платежей')+'</div>';
$('debtList').innerHTML=S.debts.length?S.debts.map(d2=>'<div class="debt-row"><div class="grow">💸 '+esc(d2.title)+' · <b>'+fmt(d2.amount,d2.cur)+'</b></div><button class="mini-btn" data-dpay="'+d2.id+'">'+(S.lang==='en'?'returned':'вернули')+'</button></div>').join(''):'<div class="empty">'+(S.lang==='en'?'Nobody owes you':'Никто не должен')+'</div>';
}
function renderReceipts(){
const now=Date.now();
$('warrList').innerHTML=S.warranties.length?S.warranties.map(w=>{const left=Math.ceil((w.until-now)/86400000);const exp=left<0;return '<div class="warr" style="'+(exp?'border-color:rgba(255,107,107,.4)':'')+'">🛡 '+esc(w.title)+' — '+(S.lang==='en'?'return until':'возврат до')+' '+new Date(w.until).toLocaleDateString(S.lang==='en'?'en-US':'ru-RU')+(exp?(S.lang==='en'?' (expired)':' (истекло)'):' ('+(S.lang==='en'?'left':'осталось')+' '+left+' '+(S.lang==='en'?'d.':'дн.')+')')+'</div>'}).join(''):'<div class="empty">'+(S.lang==='en'?'No warranties tracked. AI adds them from receipts (electronics etc.)':'Пока пусто. AI добавит из чеков с техникой')+'</div>';
if(!S.receipts.length){$('rcGrid').innerHTML='<div class="empty" style="grid-column:1/-1">'+(S.lang==='en'?'No receipts yet. Tap 📷 below':'Пока нет чеков. Нажми 📷 внизу')+'</div>';return}
$('rcGrid').innerHTML=S.receipts.map(r=>'<div class="rc"><img src="'+r.img+'" loading="lazy"><div>'+new Date(r.ts).toLocaleDateString('ru-RU')+(r.total?' · '+fmt(r.total,r.cur):'')+'</div></div>').join('');
}
function renderSettings(){
$('setBal').value=S.startBalance;$('setCur').value=S.main;$('setRate').value=S.eurRate;
$('setHourly').value=S.hourlyRate||'';$('setKey').value=S.kimiKey||'';$('setModel').value=S.kimiModel||'';$('setTag').value=S.defTag||'personal';$('setLang').value=S.lang||'ru';
$('limList').innerHTML=CATS.filter(c=>c.id!=='income').map(c=>'<div class="lim-row"><span>'+c.icon+' '+catName(c)+'</span><input type="number" inputmode="decimal" data-lim="'+c.id+'" value="'+((S.limits||{})[c.id]||'')+'" placeholder="0"></div>').join('');
}
function renderAll(){renderHome();renderReport();renderGoals();renderReceipts();renderSettings()}
function applyLang(){document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=T(el.dataset.i18n)});document.querySelectorAll('[data-i18n-ph]').forEach(el=>{el.placeholder=T(el.dataset.i18nPh)})}
function switchTab(name){
document.querySelectorAll('.tab').forEach(t=>t.classList.add('hidden'));
$('tab-'+name).classList.remove('hidden');
document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
$('addbar').classList.toggle('hidden',name!=='home');
window.scrollTo(0,0);
}
function monthCSV(bizOnly){
const y=repDate.getFullYear(),m=repDate.getMonth();
let list=monthTxs(y,m).slice().sort((a,b)=>a.ts-b.ts);
if(bizOnly)list=list.filter(t=>t.tag==='business');
let csv='Дата;Тип;Название;Категория;Тег;Сумма;Валюта\n';
for(const t of list)csv+=dkey(t.ts)+';'+(t.type==='inc'?'Доход':'Расход')+';'+t.title.replace(/;/g,',')+';'+cat(t.cat).name+';'+(t.tag==='business'?'Бизнес':'Личное')+';'+t.amount+';'+t.cur+'\n';
const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='kuda-'+(bizOnly?'biz-':'')+y+'-'+String(m+1).padStart(2,'0')+'.csv';a.click();URL.revokeObjectURL(a.href);
if(!list.length)toast(S.lang==='en'?'No data for this month':'Нет данных за месяц');
}
function printPDF(){
const y=repDate.getFullYear(),m=repDate.getMonth(),list=monthTxs(y,m).slice().sort((a,b)=>a.ts-b.ts),t=totals(y,m);
$('printArea').innerHTML='<h1>KUDA — '+(S.lang==='en'?'report':'отчёт')+': '+(S.lang==='en'?MNE:MN)[m]+' '+y+'</h1><p>+'+fmt(t.inc)+' / −'+fmt(t.exp)+'</p><table><tr><th>'+(S.lang==='en'?'Date':'Дата')+'</th><th>'+(S.lang==='en'?'Title':'Название')+'</th><th>'+(S.lang==='en'?'Category':'Категория')+'</th><th>'+(S.lang==='en'?'Tag':'Тег')+'</th><th>'+(S.lang==='en'?'Amount':'Сумма')+'</th></tr>'+list.map(x=>'<tr><td>'+dkey(x.ts)+'</td><td>'+esc(x.title)+'</td><td>'+catName(cat(x.cat))+'</td><td>'+(x.tag==='business'?T('business'):T('personal'))+'</td><td>'+(x.type==='inc'?'+':'−')+fmt(x.amount,x.cur)+'</td></tr>').join('')+'</table>';
window.print();
}
async function fetchRate(){
try{const r=await fetch('https://open.er-api.com/v6/latest/USD');const j=await r.json();
if(j&&j.rates&&j.rates.EUR){S.eurRate=j.rates.EUR;save();renderSettings();renderHome();toast(S.lang==='en'?'Rate updated: 1 USD = '+S.eurRate+' EUR':'Курс обновлён: 1 USD = '+S.eurRate+' EUR')}
}catch(e){toast(S.lang==='en'?'Offline — rate not updated':'Нет сети — курс не обновлён')}
}
function resizeImg(file){return new Promise(res=>{const img=new Image();img.onload=()=>{const mx=1024,sc=Math.min(1,mx/Math.max(img.width,img.height));const cv=document.createElement('canvas');cv.width=img.width*sc;cv.height=img.height*sc;cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);res(cv.toDataURL('image/jpeg',0.75))};img.src=URL.createObjectURL(file)})}
async function kimiReceipt(dataUrl){
const prompt='Прочитай этот чек или банковскую выписку и верни строго JSON без пояснений: {"total": число, "currency": "код валюты", "date": "YYYY-MM-DD или null", "items": [{"title": "название позиции", "amount": число, "category": "одна из: food,cafe,transport,home,health,fun,clothes,connect,subs,business,other"}]}. Если это выписка — верни каждую операцию в items.';
const r=await fetch('https://api.moonshot.ai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+S.kimiKey},body:JSON.stringify({model:S.kimiModel||'moonshot-v1-32k-vision-preview',temperature:0.1,messages:[{role:'user',content:[{type:'text',text:prompt},{type:'image_url',image_url:{url:dataUrl}}]}]})});
if(!r.ok)throw new Error('Kimi API: HTTP '+r.status);
const j=await r.json();const txt=j.choices[0].message.content;
return JSON.parse(txt.slice(txt.indexOf('{'),txt.lastIndexOf('}')+1));
}
async function onPhoto(file){
const dataUrl=await resizeImg(file);
const rec={id:uid(),ts:Date.now(),img:dataUrl,total:null,cur:S.main};
S.receipts.unshift(rec);save();
if(!S.kimiKey){renderReceipts();switchTab('receipts');toast(S.lang==='en'?'Receipt saved to archive. Add Kimi key in Settings for auto-parsing':'Чек сохранён в архив. Добавь Kimi-ключ в настройках для авто-разбора');return}
$('loader').classList.remove('hidden');
try{
const j=await kimiReceipt(dataUrl);
rec.total=j.total||null;if(j.currency)rec.cur=j.currency;save();
const dup=S.receipts.filter(r=>r.id!==rec.id&&r.total&&r.total===rec.total&&dkey(r.ts)===dkey(rec.ts));
if(j.items&&j.items.length){
const items=j.items.map(it=>({amount:+it.amount||0,title:it.title||'Чек',cat:CATS.some(c=>c.id===it.category)?it.category:'other',type:'exp'}));
addTxs(items,['USD','EUR'].includes(j.currency)?j.currency:S.main,rec.id);
for(const it of items){const tl=it.title.toLowerCase();if(TECH.some(k=>tl.includes(k)))S.warranties.unshift({id:uid(),title:it.title,ts:Date.now(),until:Date.now()+14*86400000})}
save();renderReceipts();
toast((S.lang==='en'?'Receipt parsed: ':'Чек разобран: ')+j.items.length+(S.lang==='en'?' items, ':' поз. на ')+fmt(j.total||0,rec.cur)+(dup.length?(S.lang==='en'?' · possible duplicate!':' · похож на дубль!'):''),true);
}else toast(S.lang==='en'?'Receipt read: '+fmt(j.total||0,rec.cur):'Чек прочитан: '+fmt(j.total||0,rec.cur));
}catch(e){console.error(e);toast(S.lang==='en'?'AI could not read it. Saved to archive — enter manually':'AI не смог прочитать чек. Он в архиве — добавь сумму вручную')}
$('loader').classList.add('hidden');
}
function processRecurring(){
const now=new Date(),y=now.getFullYear(),m=now.getMonth(),day=now.getDate();
for(const r of S.recurring){
if(day>=r.day&&!S.txs.some(t=>t.recId===r.id&&new Date(t.ts).getFullYear()===y&&new Date(t.ts).getMonth()===m)){
S.txs.unshift({id:uid(),ts:now.getTime(),type:'exp',amount:r.amount,cur:S.main,title:r.title,cat:r.cat||'other',tag:'personal',recId:r.id});
toast('🔁 Авто-платёж: '+r.title+' '+fmt(r.amount));
}
}
save();
}
function monthlyReportHint(){
const now=new Date();if(now.getDate()>3)return;
const pm=now.getMonth()===0?11:now.getMonth()-1,key=now.getFullYear()+'-'+pm;
if(S.lastReportSeen!==key){S.lastReportSeen=key;save();toast('📊 '+(S.lang==='en'?'Your '+MNE[pm]+' report is ready → Report tab':'Готов отчёт за '+MN[pm]+' — вкладка «Отчёт»'),true)}
}
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').classList.remove('hidden')});
function bind(){
$('onbGo').onclick=()=>{S.startBalance=parseFloat($('onbBal').value)||0;S.main=$('onbCur').value;S.name=$('onbName').value.trim();S.setup=true;save();boot()};
$('addGo').onclick=()=>{const v=$('addText').value.trim();if(!v)return;
if(isQuestion(v)&&!/\d/.test(v)){answerQuestion(v);return}
if(/^\s*(сколько|how much)/i.test(v)){answerQuestion(v);return}
const items=parseInput(v);
if(!items.length){answerQuestion(v);return}
addTxs(items);$('addText').value='';toast((S.lang==='en'?'Added: ':'Добавлено: ')+items.map(i=>i.title+' '+i.amount).join(' · '))};
$('addText').addEventListener('keydown',e=>{if(e.key==='Enter')$('addGo').click()});
$('camBtn').onclick=()=>$('camInput').click();
$('camInput').addEventListener('change',e=>{if(e.target.files[0])onPhoto(e.target.files[0]);e.target.value=''});
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
$('feed').addEventListener('click',e=>{const id=e.target.dataset&&e.target.dataset.del;if(id){S.txs=S.txs.filter(t=>t.id!==id);save();renderAll();toast(S.lang==='en'?'Deleted':'Удалено')}});
$('repPrev').onclick=()=>{repDate=new Date(repDate.getFullYear(),repDate.getMonth()-1,1);renderReport()};
$('repNext').onclick=()=>{repDate=new Date(repDate.getFullYear(),repDate.getMonth()+1,1);renderReport()};
$('csvBtn').onclick=()=>monthCSV(false);$('csvBiz').onclick=()=>monthCSV(true);$('pdfBtn').onclick=printPDF;
$('goalAdd').onclick=()=>{const n=$('goalName').value.trim(),t=parseFloat($('goalTarget').value);if(!n||!(t>0)){toast(S.lang==='en'?'Enter name and amount':'Введи название и сумму');return}S.goals.push({id:uid(),name:n,target:t,saved:0});$('goalName').value='';$('goalTarget').value='';save();renderGoals()};
$('recAdd').onclick=()=>{const t=$('recTitle').value.trim(),a=parseFloat($('recAmount').value),d=parseInt($('recDay').value);if(!t||!(a>0)||!(d>=1&&d<=31)){toast(S.lang==='en'?'Fill title, amount, day':'Заполни название, сумму и день');return}S.recurring.push({id:uid(),title:t,amount:a,day:d,cat:guessCat(t)});$('recTitle').value='';$('recAmount').value='';$('recDay').value='';save();renderGoals();processRecurring();renderHome()};
document.addEventListener('click',e=>{
const g=e.target.dataset||{};
if(g.gadd){const gl=S.goals.find(x=>x.id===g.gadd);const v=parseFloat(prompt((S.lang==='en'?'Add to goal «':'Внести в цель «')+gl.name+'»:',''));if(v>0){gl.saved+=v;save();renderGoals()}}
if(g.gdel){S.goals=S.goals.filter(x=>x.id!==g.gdel);save();renderGoals()}
if(g.rdel){S.recurring=S.recurring.filter(x=>x.id!==g.rdel);save();renderGoals()}
if(g.dpay){const d2=S.debts.find(x=>x.id===g.dpay);S.debts=S.debts.filter(x=>x.id!==g.dpay);S.txs.unshift({id:uid(),ts:Date.now(),type:'inc',amount:d2.amount,cur:d2.cur,title:d2.title+' (вернули)',cat:'income',tag:'personal'});save();renderAll();toast('💰 '+fmt(d2.amount,d2.cur))}
});
$('setBal').onchange=e=>{S.startBalance=parseFloat(e.target.value)||0;save();renderAll()};
$('setCur').onchange=e=>{S.main=e.target.value;save();renderAll()};
$('setRate').onchange=e=>{S.eurRate=parseFloat(e.target.value)||S.eurRate;save();renderAll();toast(S.lang==='en'?'Rate saved':'Курс сохранён')};
$('setHourly').onchange=e=>{S.hourlyRate=parseFloat(e.target.value)||0;save();renderHome();toast(S.lang==='en'?'Saved':'Сохранено')};
$('rateAuto').onclick=fetchRate;
$('setKey').onchange=e=>{S.kimiKey=e.target.value.trim();save();toast(S.kimiKey?(S.lang==='en'?'Key saved':'Ключ сохранён'):(S.lang==='en'?'Key removed':'Ключ удалён'))};
$('setModel').onchange=e=>{S.kimiModel=e.target.value.trim();save()};
$('setTag').onchange=e=>{S.defTag=e.target.value;save()};
$('setLang').onchange=e=>{S.lang=e.target.value;save();applyLang();renderAll()};
$('keyTest').onclick=async()=>{if(!S.kimiKey){toast(S.lang==='en'?'Paste the key first':'Сначала вставь ключ');return}$('loader').classList.remove('hidden');$('loader').textContent='…';
try{const r=await fetch('https://api.moonshot.ai/v1/models',{headers:{Authorization:'Bearer '+S.kimiKey}});toast(r.ok?(S.lang==='en'?'✅ Key works':'✅ Ключ работает'):(S.lang==='en'?'❌ Rejected: HTTP '+r.status:'❌ Ключ отклонён: HTTP '+r.status))}catch(e){toast(S.lang==='en'?'❌ No connection':'❌ Нет связи с API')}
$('loader').classList.add('hidden');$('loader').textContent='Kimi читает чек…'};
$('limList').addEventListener('change',e=>{const id=e.target.dataset&&e.target.dataset.lim;if(id){S.limits=S.limits||{};S.limits[id]=parseFloat(e.target.value)||0;save();renderHome();toast(S.lang==='en'?'Limit saved':'Лимит сохранён')}});
$('wipe').onclick=()=>{if(confirm(S.lang==='en'?'Erase ALL KUDA data? Irreversible.':'Стереть ВСЕ данные KUDA? Это необратимо.')){localStorage.removeItem(SK);location.reload()}};
$('installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('installBtn').classList.add('hidden')}};
}
function boot(){
applyLang();
if(!S.setup){$('onb').classList.remove('hidden');return}
$('hdr').classList.remove('hidden');$('main').classList.remove('hidden');$('nav').classList.remove('hidden');$('addbar').classList.remove('hidden');
processRecurring();
renderAll();
monthlyReportHint();
if(!S.rateFetched){fetchRate();S.rateFetched=true;save()}
}
S=load()||{setup:false,name:'',main:'USD',eurRate:0.92,startBalance:0,txs:[],receipts:[],limits:{},kimiKey:'',kimiModel:'moonshot-v1-32k-vision-preview',defTag:'personal',rateFetched:false,hourlyRate:0,lang:'ru',goals:[],recurring:[],debts:[],warranties:[],lastReportSeen:''};
S.goals=S.goals||[];S.recurring=S.recurring||[];S.debts=S.debts||[];S.warranties=S.warranties||[];S.lang=S.lang||'ru';
bind();boot();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});

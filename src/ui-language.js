/* DK Live Block Build 259: local interface language controls.
   Russian is the first translated UI. English remains the safe fallback.
   This never changes network filters, user locale, websites or cookie data. */
(function(root){"use strict";
const KEY="dkUiLanguage";
const SUPPORTED=Object.freeze(["en","ru"]);
const PLANNED=Object.freeze(["ar","tr","ur","fa"]);
const RU=Object.freeze({
"Development build":"Тестовая версия",
"blocked on this tab":"заблокировано в этой вкладке",
"blocked on selected website tab":"заблокировано на выбранном сайте",
"View blocked":"Заблокированные",
"View blocked requests for this tab":"Просмотреть заблокированные запросы этой вкладки",
"permitted requests":"разрешённых запросов",
"View allowed":"Разрешённые",
"Protection everywhere":"Защита на всех сайтах",
"Allowed website":"Разрешённый сайт",
"Current site":"Текущий сайт",
"Allowlist website":"Добавить сайт в исключения",
"Remove from allowlist":"Убрать сайт из исключений",
"Allowlisting disables automatic filters here; any selective blocks you choose remain active. Other websites stay protected.":"Разрешение сайта отключает здесь автоматические фильтры. Выбранные блокировки остаются активными. Другие сайты защищены.",
"Only this tab":"Только эта вкладка",
"Pause this tab":"Приостановить в этой вкладке",
"Resume this tab":"Возобновить в этой вкладке",
"Popup cleanups:":"Очистка всплывающих окон:",
"Disable popup cleanup here":"Отключить очистку здесь",
"Enable popup cleanup here":"Включить очистку здесь",
"Fine-tune this website":"Настроить защиту этого сайта",
"Cookie rejection":"Отклонение файлов cookie",
"Newsletter and distraction cleanup":"Удаление рассылок и отвлекающих элементов",
"Disable here":"Отключить здесь",
"Enable here":"Включить здесь",
"These exceptions leave ad and tracker blocking active. No website is allowlisted.":"Эти исключения не отключают блокировку рекламы и трекеров. Сайт не добавляется в список разрешённых.",
"Strict scam-tab protection":"Строгая защита от мошеннических вкладок",
"Unwanted new tabs stopped:":"Остановлено нежелательных вкладок:",
"Allow next new tab (15 seconds)":"Разрешить следующую вкладку (15 секунд)",
"Unrequested new tabs from this site are blocked.":"Незапрошенные вкладки с этого сайта блокируются.",
"Playback Rescue":"Восстановление видео",
"Enable media rescue":"Включить восстановление видео",
"Disable media rescue":"Отключить восстановление видео",
"Allows media requests on this site. Some video ads may play.":"Разрешает медиазапросы на этом сайте. Некоторые видеообъявления могут воспроизводиться.",
"Blocked streaming requests:":"Заблокировано потоковых запросов:",
"Inspect":"Проверить",
"Temporary playback repair active for this tab. Expires within 10 minutes.":"Временное исправление воспроизведения активно для этой вкладки. Истекает в течение 10 минут.",
"Failed resources:":"Ошибки загрузки:",
"Network recovery":"Восстановление сети",
"Hide an element":"Скрыть элемент",
"Undo hide":"Отменить скрытие",
"Update lists":"Обновить списки",
"Investigate missed ad · Local AI assist":"Изучить пропущенную рекламу · локальный помощник",
"Site dashboard · Protection and exceptions":"Панель сайта · защита и исключения",
"Inspect element-hiding filters":"Проверить фильтры скрытия элементов",
"Network Monitor · View requests and blocked traffic":"Монитор сети · запросы и блокировки",
"▶ Current YouTube video":"▶ Текущее видео YouTube",
"Save for Later":"Сохранить на потом",
"Download quality":"Качество загрузки",
"Compatible MP4 (no FFmpeg needed)":"Совместимый MP4 (FFmpeg не требуется)",
"Best video + audio (requires FFmpeg)":"Лучшее видео + аудио (нужен FFmpeg)",
"Audio only (original format)":"Только аудио (исходный формат)",
"Download This Video":"Скачать это видео",
"Cancel Download":"Отменить загрузку",
"Retry Download":"Повторить загрузку",
"Downloads require the optional Linux companion and verified yt-dlp.":"Для загрузки требуется дополнительный компонент Linux и проверенный yt-dlp.",
"Loading…":"Загрузка…",
"My Saved Videos":"Сохранённые видео",
"My Downloads":"Мои загрузки",
"Dependencies":"Зависимости",
"Report a problem":"Сообщить о проблеме",
"Settings, privacy and logs":"Настройки, конфиденциальность и журналы",
"No account · No telemetry · No paywall":"Без учётной записи · Без телеметрии · Без платных ограничений",
"GitHub Repository":"Репозиторий GitHub",
"Patreon":"Patreon",
"Interface language":"Язык интерфейса",
"English":"Английский",
"Russian":"Русский",
"Privacy first. Everything free.":"Конфиденциальность прежде всего. Всё бесплатно.",
"Protection settings":"Настройки защиты",
"Threat database & protection":"База угроз и защита",
"Threat protection overrides":"Исключения для защиты от угроз",
"Strict popunder and scam-tab protection":"Строгая защита от нежелательных вкладок и мошенничества",
"Dependencies & Applications":"Зависимости и приложения",
"Optional integration tools":"Дополнительные инструменты",
"Recommended applications":"Рекомендуемые приложения",
"Advanced browser tools":"Дополнительные инструменты браузера",
"Protection-first defaults":"Настройки защиты по умолчанию",
"Website cleanup exceptions":"Исключения очистки сайтов",
"Website notification requests":"Запросы уведомлений",
"Filter subscriptions":"Подписки на фильтры",
"YouTube player advertising metadata":"Рекламные данные проигрывателя YouTube",
"YouTube compatibility updates":"Обновления совместимости YouTube",
"Language-specific filter lists":"Языковые списки фильтров",
"Enable lists matching my Firefox languages":"Включить списки для языков Firefox",
"Additional filter lists":"Дополнительные списки фильтров",
"Video and cookies":"Видео и файлы cookie",
"Streaming playback diagnostics":"Диагностика потокового видео",
"Streaming player health (local)":"Состояние видеопроигрывателя (локально)",
"Temporary streaming playback repair":"Временное исправление воспроизведения",
"DK Network Recovery / Proxy Settings":"Сетевые настройки DK / Прокси",
"DNS diagnostics":"Диагностика DNS",
"Failed images and sites":"Ошибки изображений и сайтов",
"Custom filters":"Пользовательские фильтры",
"Allowed Websites":"Разрешённые сайты",
"Advanced: edit allowed hostnames manually":"Дополнительно: изменить разрешённые домены вручную",
"Website repair and exceptions":"Исправление сайтов и исключения",
"Network Monitor":"Монитор сети",
"Private request log":"Локальный журнал запросов",
"Statistics":"Статистика",
"Settings backup":"Резервная копия настроек",
"Export JSON":"Экспорт JSON",
"Save settings":"Сохранить настройки",
"Help and bug reports":"Помощь и сообщения об ошибках",
"Open Network Monitor":"Открыть монитор сети",
"Blocked-request counters are stored locally. Reset removes counts and temporary logs.":"Счётчики блокировок хранятся локально. Сброс удаляет счётчики и временные журналы.",
"Reset statistics":"Сбросить статистику",
"Prepare a bug report":"Подготовить сообщение об ошибке",
"Language":"Язык",
"Allowlist this website":"Разрешить этот сайт",
"Browser page":"Страница браузера",
"Enable cookie rejection here":"Включить отклонение cookie здесь",
"Disable cookie rejection here":"Отключить отклонение cookie здесь",
"Enable distraction cleanup here":"Включить очистку отвлекающих элементов",
"Disable distraction cleanup here":"Отключить очистку отвлекающих элементов",
"Resume popup cleanup":"Возобновить очистку всплывающих окон",
"One new tab is temporarily allowed. This permission expires within 15 seconds.":"Одна новая вкладка временно разрешена. Разрешение истекает через 15 секунд.",
"Allowlisting disables automatic filters here; manually selected blocks stay active. Other sites remain protected.":"Здесь отключаются автоматические фильтры; выбранные вручную блокировки остаются. Остальные сайты защищены.",
"This site's optional cleanup was changed. Network ad and tracker blocking remains on.":"Дополнительная очистка сайта изменена. Блокировка сетевой рекламы и трекеров остаётся активной.",
"Reload the tab and try again.":"Перезагрузите вкладку и повторите попытку.",
"Open a normal website tab to inspect an ad.":"Чтобы проверить рекламу, откройте обычный сайт.",
"Investigation unavailable here. Reload the tab and retry.":"Проверка здесь недоступна. Перезагрузите вкладку и повторите.",
"Reload this website tab and retry the investigation.":"Перезагрузите сайт и повторите проверку.",
"Last page-only hidden element restored.":"Последний скрытый элемент страницы восстановлен.",
"Last investigated item restored.":"Последний проверенный элемент восстановлен.",
"Nothing to undo. Refresh the webpage to restore manually hidden elements.":"Нечего отменять. Обновите страницу, чтобы вернуть вручную скрытые элементы.",
"Download complete. Saved to ~/.local/share/dk-live-block/downloads/":"Загрузка завершена. Сохранено в ~/.local/share/dk-live-block/downloads/",
"Cancelling download…":"Отмена загрузки…",
"Download requested. Open this menu again to check progress.":"Загрузка запрошена. Откройте меню снова, чтобы проверить состояние.",
"Saved to My Saved Videos":"Сохранено в «Мои видео»",
"Use English":"Использовать английский"
});
function supported(code){return SUPPORTED.includes(code)?code:"en";}
function translate(text,language){
 if(language!=="ru"||typeof text!=="string")return text;
 return Object.prototype.hasOwnProperty.call(RU,text)?RU[text]:text;
}
const nodeOriginals=new WeakMap(),attributeOriginals=new WeakMap();
const EXCLUDED=new Set(["SCRIPT","STYLE","TEXTAREA","PRE","CODE","OPTION","INPUT"]);
function eligible(node){
 let p=node?.parentElement||null;
 while(p){if(EXCLUDED.has(p.tagName)||p.isContentEditable)return false;p=p.parentElement;}
 return true;
}
function rewrite(node,language){
 if(node?.nodeType!==3||!eligible(node))return;
 const actual=String(node.nodeValue||"");
 const m=actual.match(/^(\s*)([\s\S]*?)(\s*)$/);
 if(!m)return;
 let original=nodeOriginals.get(node);
 if(original&&actual.trim()!==original&&actual.trim()!==translate(original,"ru"))
  original=null; // Host UI re-rendered a different message.
 if(!original){
  if(!Object.prototype.hasOwnProperty.call(RU,m[2]))return;
  original=m[2];nodeOriginals.set(node,original);
 }
 const desired=m[1]+translate(original,language)+m[3];
 if(actual!==desired)node.nodeValue=desired;
}
function attributes(el,language){
 if(!el?.getAttribute||!eligible({parentElement:el}))return;
 for(const attr of ["aria-label","title","placeholder"]){
  const current=el.getAttribute(attr);if(!current)continue;
  let entries=attributeOriginals.get(el);
  if(!entries){entries=new Map();attributeOriginals.set(el,entries);}
  let original=entries.get(attr);
  if(original&&current!==original&&current!==translate(original,"ru"))original=null;
  if(!original){
   if(!Object.prototype.hasOwnProperty.call(RU,current))continue;
   original=current;entries.set(attr,original);
  }
  const desired=translate(original,language);
  if(current!==desired)el.setAttribute(attr,desired);
 }
}
function apply(rootNode,language){
 const lang=supported(language);
 const container=rootNode?.nodeType===9?rootNode.documentElement:rootNode;
 if(!container)return;
 if(container.nodeType===3){rewrite(container,lang);return;}
 if(container.nodeType===1)attributes(container,lang);
 const doc=container.ownerDocument||rootNode;
 if(!doc?.createTreeWalker)return;
 const texts=doc.createTreeWalker(container,4),elements=doc.createTreeWalker(container,1);
 let cursor;while((cursor=texts.nextNode()))rewrite(cursor,lang);
 while((cursor=elements.nextNode()))attributes(cursor,lang);
 if(doc.documentElement)doc.documentElement.lang=lang;
}
function init(){
 if(typeof document==="undefined"||typeof browser==="undefined")return;
 const select=document.getElementById("dkUiLanguage");
 if(!select)return;
 let current="en",observer=null;
 const redraw=()=>apply(document,current);
 function activate(value){current=supported(value);select.value=current;redraw();}
 select.addEventListener("change",()=>{
  const value=supported(select.value);
  activate(value);
  browser.storage.local.set({[KEY]:value}).catch(error=>console.warn("Unable to save interface language preference:",error));
 });
 browser.storage.local.get(KEY).then(data=>activate(data?.[KEY])).catch(()=>activate("en"));
 browser.storage.onChanged?.addListener((changes,area)=>{
  if(area==="local"&&changes[KEY])activate(changes[KEY].newValue);
 });
 if(typeof MutationObserver==="function"){
  observer=new MutationObserver(records=>{
   let scanned=0;
   for(const r of records){
    if(scanned++>150)break;
    if(r.type==="characterData")rewrite(r.target,current);
    else if(r.type==="childList"){
     for(const n of Array.from(r.addedNodes||[]).slice(0,40))apply(n,current);
    }
   }
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
 }
}
const API=Object.freeze({KEY,SUPPORTED,PLANNED,supported,translate,apply,init});
root.DKUILanguage=API;
if(typeof module!=="undefined")module.exports=API;
if(typeof document!=="undefined"&&typeof browser!=="undefined")init();
})(typeof globalThis!=="undefined"?globalThis:this);

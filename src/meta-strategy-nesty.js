/* Nesty Meta strategy supervisor: bounded activation of dormant legacy
   Facebook scanner only when the full engine has measurable misses.
   Never reads post text, URLs, user IDs or network contents. */
(function(root){"use strict";
const EVIDENCE_WAIT_MS=1500,MIN_HINT_GAP_MS=600,ACTIVE_MS=30000,COOLDOWN_MS=5000;
const MAX_HITS=8;
function count(v){return Number.isSafeInteger(v)&&v>=0?Math.min(v,1000000):0;}
function healthy(d){return !!d&&d.coreFull===1&&d.coreEnabled===1&&
 d.settingsReady===1&&d.observerActive===1;}
function snapshot(state){
 return Object.freeze({active:state.active,wakeups:state.wakeups,
  lastReason:state.reason,expires:state.until,waiting:state.since!==null,
  evidence:state.hits});
}
function create(){
 const state={active:false,until:0,cooldown:0,since:null,hits:0,
  previousMisses:0,previousHidden:0,lastHint:-Infinity,wakeups:0,reason:"standby"};
 function reset(){
  state.active=false;state.until=0;state.cooldown=0;state.since=null;
  state.hits=0;state.previousMisses=0;state.previousHidden=0;
  state.lastHint=-Infinity;state.reason="standby";
 }
 function update(d,explicitLabel=false,now=Date.now()){
  if(!Number.isFinite(now)||now<0)return {active:state.active,changed:false};
  if(!healthy(d)){
   const changed=state.active;
   reset();
   state.reason="full-engine-inactive";
   return {active:false,changed,reason:state.reason};
  }
  const misses=count(d.labelsUnanchored)+count(d.tooWideRefused);
  const hidden=count(d.hidden);
  if(state.active){
   if(now<state.until){
    state.previousMisses=misses;state.previousHidden=hidden;
    return {active:true,changed:false,reason:state.reason};
   }
   state.active=false;state.cooldown=now+COOLDOWN_MS;state.since=null;
   state.hits=0;state.reason="expired";
   state.previousMisses=misses;state.previousHidden=hidden;
   return {active:false,changed:true,reason:state.reason};
  }
  // Cooldown and a new proven full-engine success revoke stale evidence.
  if(hidden>state.previousHidden){state.since=null;state.hits=0;}
  const diff=Math.max(0,misses-state.previousMisses);
  state.previousMisses=misses;state.previousHidden=hidden;
  if(now<state.cooldown)return {active:false,changed:false,reason:"cooldown"};
  let added=Math.min(4,diff);
  if(explicitLabel===true&&now-state.lastHint>=MIN_HINT_GAP_MS){
   added++;state.lastHint=now;
  }
  if(added){
   if(state.since===null)state.since=now;
   state.hits=Math.min(MAX_HITS,state.hits+added);
  }
  if(state.hits<2||state.since===null||now-state.since<EVIDENCE_WAIT_MS)
   return {active:false,changed:false,reason:state.hits?"collecting-evidence":"standby"};
  state.active=true;state.until=now+ACTIVE_MS;
  state.wakeups=Math.min(1000000,state.wakeups+1);
  state.reason=diff||misses>0?"full-engine-missed-labels":"exact-ad-label-evidence";
  state.since=null;state.hits=0;
  return {active:true,changed:true,reason:state.reason};
 }
 return Object.freeze({update,reset,snapshot:()=>snapshot(state)});
}
function explicitLabelMutation(r){
 if(!r||!["attributes","characterData"].includes(r.type))return false;
 if(r.type==="attributes"&&!["aria-label","aria-labelledby"].includes(r.attributeName))return false;
 const node=r.target?.nodeType===3?r.target.parentElement:r.target;
 if(node?.nodeType!==1||node.isConnected===false||
    node.closest?.('p,blockquote,[role="paragraph"],[role="dialog"],form,nav'))return false;
 const text=String(r.type==="attributes"?node.getAttribute?.("aria-label")||node.textContent||"":node.textContent||"").trim().toLowerCase();
 if(!["ad","sponsored","реклама","спонсировано"].includes(text)||text.length>24)return false;
 return !!node.closest?.('main,[role="main"],[role="feed"]');
}
const API=Object.freeze({create,explicitLabelMutation,EVIDENCE_WAIT_MS,
 MIN_HINT_GAP_MS,ACTIVE_MS,COOLDOWN_MS});
root.DKMetaStrategyNesty=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);

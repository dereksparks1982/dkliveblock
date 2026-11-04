"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"../src",p),"utf8");

function scenario(){
 let now=100000,seq=0,hidden=0;
 const scheduled=new Map(),events={create:0,scan:0,park:0,restore:0,audit:0};
 class Clock extends Date {static now(){return now;}}
 const later=(fn,ms)=>{const id=++seq;scheduled.set(id,{due:now+ms,fn});return id;};
 const cancel=id=>scheduled.delete(id);
 const full={setEnabled:()=>{},scan:()=>0,scanInserted:()=>0,scanVisible:()=>0,
  restore:()=>{},setExceptions:()=>{},observeMutation:()=>false,
  canFallbackHide:()=>true,diagnostics:()=>({...status}),get hiddenCount(){return 0;}};
 const status={coreFull:1,coreEnabled:1,settingsReady:1,observerActive:1,
  labelsUnanchored:0,hidden:0,tooWideRefused:0};
 const root={
  DKCompanyModules:{profileFor:()=>({company:"meta",platform:"facebook"})},
  DKFacebookFullCore:{create:()=>full},
  DKFacebookAds:{create:()=>{events.create++;return {
   scan:()=>{events.scan++;hidden=1;return 1;},
   scanInserted:()=>0,scanVisible:()=>0,setExceptions:()=>{},
   park:()=>{events.park++;},
   auditHidden:()=>{events.audit++;return 0;},
   restore:()=>{events.restore++;hidden=0;},
   get hiddenCount(){return hidden;}}}}
 };
 new Function("globalThis","Date",read("meta-strategy-nesty.js"))(root,Clock);
 new Function("globalThis","Date","setTimeout","clearTimeout",read("meta-module.js"))(root,Clock,later,cancel);
 const win={location:{hostname:"www.facebook.com"},setTimeout:later,clearTimeout:cancel};
 win.top=win;
 const adapter=root.DKMetaModule.create({},win);
 function advance(ms){now+=ms;}
 function trigger(){
  for(const [id,timer] of [...scheduled]){
   if(timer.due<=now&&scheduled.has(id)){
    scheduled.delete(id);timer.fn();
   }
  }
 }
 return {adapter,status,events,advance,trigger,scheduled,hidden:()=>hidden};
}

test("Build 386: expiry parks legacy strategy without revealing a vetted hidden post",()=>{
 const s=scenario();s.adapter.setEnabled(true);s.adapter.scan();
 s.status.labelsUnanchored=3;
 s.advance(200);s.adapter.scan();
 s.advance(1600);s.adapter.scan();
 assert.equal(s.events.create,1);assert.equal(s.hidden(),1);
 assert.equal(s.adapter.diagnostics().legacyActive,1);
 s.advance(30200);s.trigger();
 assert.equal(s.adapter.diagnostics().legacyActive,0);
 assert.equal(s.events.park,1);
 assert.equal(s.events.restore,0,"expiry must not undo a verified hide");
 assert.equal(s.hidden(),1);
 s.advance(5000);s.trigger();
 assert.ok(s.events.audit>=1,"parked cards receive bounded stale-card audit");
 assert.equal(s.events.scan,1,"no new ad searches when dormant");
});

test("Build 386: disabling site protection immediately restores parked hides and cancels audit",()=>{
 const s=scenario();s.adapter.setEnabled(true);s.adapter.scan();
 s.status.labelsUnanchored=3;s.advance(200);s.adapter.scan();
 s.advance(1600);s.adapter.scan();s.advance(30200);s.trigger();
 s.adapter.setEnabled(false);
 assert.equal(s.events.restore,1);
 assert.equal(s.hidden(),0);
 assert.equal(s.scheduled.size,0);
});

test("Build 386: active fallback does not accidentally clear its own hides",()=>{
 const s=scenario();s.adapter.setEnabled(true);s.adapter.scan();
 s.status.labelsUnanchored=3;s.advance(200);s.adapter.scan();
 s.advance(1600);s.adapter.scan();s.advance(500);s.adapter.scan();
 assert.equal(s.events.restore,0);
 assert.equal(s.events.park,0);
 assert.equal(s.adapter.diagnostics().legacyActive,1);
});

test("Build 386: offline suite loads dormant audit regression",()=>{
 const sh=fs.readFileSync(path.join(__dirname,"../scripts/test-local.sh"),"utf8");
 assert.match(sh,/meta-dormant-lifecycle-build386\.test\.js/);
 const source=read("facebook-ads.js");
 assert.match(source,/function park\(\)/);
 assert.match(source,/function auditHidden\(max=30\)/);
 assert.match(read("meta-module.js"),/stopFallback\(next.reason!=="expired"\)/);
});

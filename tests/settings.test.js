"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
require("../src/subscriptions.js");
require("../src/network-recovery.js");
require("../src/manual-rules.js");
require("../src/list-io.js");
require("../src/subscription-cache.js");
require("../src/video-assist.js");
const Settings=require("../src/settings.js");
const defaults={enabled:true,autoUpdate:true,requestLog:true,blockedTotal:0,lastUpdate:0,
 listEnabled:{easylist:true,easyprivacy:true},paused:[],customSubscriptions:[],network:{enabled:false,type:"socks",host:"127.0.0.1",port:9050,proxyDNS:true,mode:"domains",domains:[]},customRules:""};
test("bad stored preferences cannot enable unintended proxies or corrupt the filter engine",()=>{
 const v=Settings.restoreSettings({enabled:"false",listEnabled:{easylist:"false"},paused:[null,{},123,"bad..host","good.example"],customRules:{},customSubscriptions:"bad",network:{enabled:true,domains:["127.0.0.1"]},blockedTotal:"999"},defaults,["easylist","easyprivacy"]);
 assert.equal(v.enabled,true);
 assert.equal(v.listEnabled.easylist,true);
 assert.deepEqual(v.paused,["good.example"]);
 assert.equal(v.customRules,"");
 assert.deepEqual(v.customSubscriptions,[]);
 assert.equal(v.network.enabled,false);
 assert.equal(v.blockedTotal,0);
});
test("valid settings, explicit proxies and counters are preserved",()=>{
 const value=Settings.restoreSettings({enabled:false,autoUpdate:false,paused:["good.example","good.example"],blockedTotal:44,network:{enabled:true,type:"socks",host:"127.0.0.1",port:9050,proxyDNS:true,mode:"domains",domains:["allowed.example"]}},defaults,["easylist"]);
 assert.equal(value.enabled,false);
 assert.equal(value.network.enabled,true);
 assert.equal(value.blockedTotal,44);
 assert.deepEqual(value.paused,["good.example"]);
});
test("invalid filter-list caches are quarantined, valid lists survive",()=>{
 const txt="[Adblock Plus 2.0]\n! Title: local fixture\n"+"||advertiser.example^\n".repeat(25);
 const x=Settings.restoreLists({good:{text:txt,etag:'"v1"',updated:9},bad:{text:"not a list"}},["good","bad"]);
 assert.equal(x.lists.good.text,txt);
 assert.equal(x.lists.good.etag,'"v1"');
 assert.equal(x.errors.bad,"Ignored invalid cached filter-list data.");
 assert.equal(x.lists.bad,undefined);
});
test("total cache budget prevents resource exhaustion on startup",()=>{
 const text="[Adblock Plus 2.0]\n! Title: fixture\n"+"||tracker.example^\n".repeat(30);
 const result=Settings.restoreLists({a:{text},b:{text}},["a","b"],text.length+5);
 assert.equal(result.lists.a.text,text);
 assert.equal(result.lists.b,undefined);
 assert.match(result.errors.b,/budget/);
});
test("stored error messages cannot inject arbitrary fields or huge strings",()=>{
 const value=Settings.restoreErrors({easylist:"x".repeat(200),evil:"secret"},["easylist"]);
 assert.equal(value.easylist.length,150);
 assert.equal(value.evil,undefined);
});

test("saved Playback Rescue restores only authorized streaming hostnames",()=>{
 const value=Settings.restoreSettings({
  mediaRecovery:["www.youtube.com","www.youtube.com","www.disneyplus.com","news.example","router.local",123,{}]
 },defaults,["easylist"]);
 assert.deepEqual(value.mediaRecovery,["www.youtube.com","www.disneyplus.com"]);
 const bad=Settings.restoreSettings({mediaRecovery:"yes"},defaults,["easylist"]);
 assert.deepEqual(bad.mediaRecovery,[]);
});

test("site popup cleanup exceptions restore only validated hostnames",()=>{
 const v=Settings.restoreSettings({
  popupProtectionPaused:["www.youtube.com","www.youtube.com","news.example","router.local","bad..host",{},123]
 },defaults,["easylist"]);
 assert.deepEqual(v.popupProtectionPaused,["www.youtube.com","news.example","router.local"]);
 assert.deepEqual(Settings.restoreSettings({popupProtectionPaused:"yes"},defaults,["easylist"]).popupProtectionPaused,[]);
});

test("Build 36 strict popup protection is default enabled and can be disabled",()=>{
 const yes=Settings.restoreSettings({strictPopupSites:true},
  {...defaults,strictPopupSites:true},["easylist"]);
 const no=Settings.restoreSettings({strictPopupSites:false},
  {...defaults,strictPopupSites:true},["easylist"]);
 const invalid=Settings.restoreSettings({strictPopupSites:"false"},
  {...defaults,strictPopupSites:true},["easylist"]);
 assert.equal(yes.strictPopupSites,true);
 assert.equal(no.strictPopupSites,false);
 assert.equal(invalid.strictPopupSites,true);
});

test("Build 44 default protection flags are on unless users explicitly disable them",()=>{
 const protect={...defaults,listEnabled:{easylist:true,easyprivacy:true,
  cookies:true,annoyances:true,social:true},cookieReject:true,distractionControl:true};
 const fresh=Settings.restoreSettings(null,protect,Object.keys(protect.listEnabled));
 for(const key of ["easylist","easyprivacy","cookies","annoyances","social"])
  assert.equal(fresh.listEnabled[key],true,key);
 assert.equal(fresh.cookieReject,true);
 assert.equal(fresh.distractionControl,true);
 const saved=Settings.restoreSettings({cookieReject:false,distractionControl:false,
  listEnabled:{cookies:false,annoyances:false,social:false}},protect,Object.keys(protect.listEnabled));
 assert.equal(saved.cookieReject,false);
 assert.equal(saved.distractionControl,false);
 for(const key of ["cookies","annoyances","social"])
  assert.equal(saved.listEnabled[key],false,key);
 const malformed=Settings.restoreSettings({cookieReject:"false",distractionControl:null,
  listEnabled:{cookies:"false"}},protect,Object.keys(protect.listEnabled));
 assert.equal(malformed.cookieReject,true);
 assert.equal(malformed.distractionControl,true);
 assert.equal(malformed.listEnabled.cookies,true);
});

test("notification protection defaults on and stored off state is respected",()=>{
 const protection={...defaults,blockNotificationPrompts:true};
 assert.equal(Settings.restoreSettings({},protection,["easylist"]).blockNotificationPrompts,true);
 assert.equal(Settings.restoreSettings({blockNotificationPrompts:false},protection,["easylist"]).blockNotificationPrompts,false);
 assert.equal(Settings.restoreSettings({blockNotificationPrompts:"false"},protection,["easylist"]).blockNotificationPrompts,true);
});

test("Build 51 restores only valid independent site cleanup exceptions",()=>{
 const input={cookieRejectPaused:["news.example","news.example","bad..example",123,"shop.example"],
  distractionPaused:["video.example","video.example","BAD.EXAMPLE",null,{}]};
 const value=Settings.restoreSettings(input,defaults,["easylist"]);
 assert.deepEqual(value.cookieRejectPaused,["news.example","shop.example"]);
 assert.deepEqual(value.distractionPaused,["video.example"]);
 const empty=Settings.restoreSettings({cookieRejectPaused:"off",distractionPaused:{}},defaults,["easylist"]);
 assert.deepEqual(empty.cookieRejectPaused,[]);
 assert.deepEqual(empty.distractionPaused,[]);
});
